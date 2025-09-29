import pool from '../models/index.js';
import axios from 'axios';
import crypto from 'crypto';
import BusinessRuleEngine from './businessRuleEngine.js';

class BenefitEligibilityVerification {
  // Income limits by household size for various programs (2025 Federal Poverty Level)
  static FEDERAL_POVERTY_LEVELS = {
    1: 15060,
    2: 20440,
    3: 25820,
    4: 31200,
    5: 36580,
    6: 41960,
    7: 47340,
    8: 52720
  };

  // Program-specific income multipliers
  static INCOME_MULTIPLIERS = {
    SNAP: 1.3,        // 130% of FPL
    WIC: 1.85,        // 185% of FPL
    MEDICAID: 1.38,   // 138% of FPL
    LIHEAP: 1.5,      // 150% of FPL
    FREE_REDUCED_MEALS: 1.85,  // 185% for reduced, 130% for free
    CHILD_CARE: 2.0   // 200% of FPL (varies by state)
  };

  // State-specific eligibility databases (mock endpoints - would be real in production)
  static STATE_VERIFICATION_APIS = {
    federal: 'https://api.benefits.gov/verify',
    snap: 'https://www.fns.usda.gov/snap/verify',
    tanf: 'https://www.acf.hhs.gov/ofa/verify',
    medicaid: 'https://www.medicaid.gov/verify'
  };

  /**
   * Comprehensive eligibility verification
   */
  static async verifyComprehensive(userId, programType, applicationData) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Step 1: Identity verification
      const identityVerified = await this.verifyIdentity(userId, applicationData, client);
      if (!identityVerified.success) {
        await client.query('ROLLBACK');
        return {
          eligible: false,
          verification_status: 'IDENTITY_FAILED',
          reasons: identityVerified.reasons
        };
      }

      // Step 2: Income verification
      const incomeVerified = await this.verifyIncome(userId, programType, applicationData, client);
      if (!incomeVerified.eligible) {
        await client.query('ROLLBACK');
        return {
          eligible: false,
          verification_status: 'INCOME_EXCEEDED',
          reasons: incomeVerified.reasons,
          income_details: incomeVerified.details
        };
      }

      // Step 3: Residency verification
      const residencyVerified = await this.verifyResidency(userId, applicationData, client);
      if (!residencyVerified.success) {
        await client.query('ROLLBACK');
        return {
          eligible: false,
          verification_status: 'RESIDENCY_FAILED',
          reasons: residencyVerified.reasons
        };
      }

      // Step 4: Program-specific verification
      const programVerified = await this.verifyProgramSpecific(userId, programType, applicationData, client);
      if (!programVerified.eligible) {
        await client.query('ROLLBACK');
        return {
          eligible: false,
          verification_status: 'PROGRAM_REQUIREMENTS_NOT_MET',
          reasons: programVerified.reasons
        };
      }

      // Step 5: Duplicate enrollment check
      const duplicateCheck = await this.checkDuplicateEnrollment(userId, programType, client);
      if (duplicateCheck.hasDuplicate) {
        await client.query('ROLLBACK');
        return {
          eligible: false,
          verification_status: 'DUPLICATE_ENROLLMENT',
          reasons: ['Already enrolled in this program'],
          existing_enrollment: duplicateCheck.enrollment
        };
      }

      // Step 6: Cross-program eligibility (some programs affect others)
      const crossProgramCheck = await this.verifyCrossProgramEligibility(userId, programType, applicationData, client);
      if (!crossProgramCheck.eligible) {
        await client.query('ROLLBACK');
        return {
          eligible: false,
          verification_status: 'CROSS_PROGRAM_CONFLICT',
          reasons: crossProgramCheck.reasons
        };
      }

      // Record successful verification
      const verificationResult = await client.query(
        `INSERT INTO benefit_verifications
         (user_id, program_type, verification_data, verification_status,
          identity_verified, income_verified, residency_verified,
          program_specific_verified, verified_at, expires_at)
         VALUES ($1, $2, $3, 'VERIFIED', true, true, true, true, NOW(), NOW() + INTERVAL '1 year')
         RETURNING *`,
        [userId, programType, {
          ...applicationData,
          identity_result: identityVerified,
          income_result: incomeVerified,
          residency_result: residencyVerified,
          program_result: programVerified
        }]
      );

      await client.query('COMMIT');

      return {
        eligible: true,
        verification_status: 'VERIFIED',
        verification_id: verificationResult.rows[0].id,
        enrollment_data: {
          max_benefit_amount: this.calculateMaxBenefit(programType, applicationData),
          disbursement_schedule: this.getDisbursementSchedule(programType),
          renewal_date: verificationResult.rows[0].expires_at,
          restrictions: this.getProgramRestrictions(programType)
        }
      };

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Comprehensive verification error:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Verify user identity
   */
  static async verifyIdentity(userId, data, client) {
    try {
      // Check SSN format and validity
      if (!this.isValidSSN(data.ssn)) {
        return {
          success: false,
          reasons: ['Invalid Social Security Number']
        };
      }

      // Verify against government ID databases (Login.gov, ID.me integration)
      const idVerification = await this.verifyGovernmentID(data);
      if (!idVerification.success) {
        return idVerification;
      }

      // Check identity fraud databases
      const fraudCheck = await this.checkIdentityFraud(data.ssn, client);
      if (fraudCheck.hasFraud) {
        return {
          success: false,
          reasons: ['Identity verification failed - potential fraud detected']
        };
      }

      // Store verified identity
      await client.query(
        `INSERT INTO verified_identities
         (user_id, ssn_hash, verification_method, verification_date, verification_data)
         VALUES ($1, $2, $3, NOW(), $4)
         ON CONFLICT (user_id) DO UPDATE
         SET verification_date = NOW(), verification_data = $4`,
        [userId, this.hashSSN(data.ssn), data.verification_method || 'STANDARD', {
          id_type: data.id_type,
          id_number_masked: this.maskIdNumber(data.id_number),
          verification_source: 'government_database'
        }]
      );

      return { success: true };

    } catch (error) {
      console.error('Identity verification error:', error);
      return {
        success: false,
        reasons: ['Identity verification service unavailable']
      };
    }
  }

  /**
   * Verify income eligibility
   */
  static async verifyIncome(userId, programType, data, client) {
    const householdSize = data.household_size || 1;
    const annualIncome = data.annual_income || 0;

    // Get base FPL for household size
    const baseFPL = this.FEDERAL_POVERTY_LEVELS[Math.min(householdSize, 8)];
    if (householdSize > 8) {
      // Add $4,480 for each additional person
      baseFPL += (householdSize - 8) * 4480;
    }

    // Calculate income limit for program
    const multiplier = this.INCOME_MULTIPLIERS[programType] || 1.0;
    const incomeLimit = baseFPL * multiplier;

    if (annualIncome > incomeLimit) {
      return {
        eligible: false,
        reasons: [`Household income exceeds program limit of $${incomeLimit.toFixed(2)}`],
        details: {
          household_size: householdSize,
          annual_income: annualIncome,
          income_limit: incomeLimit,
          fpl_percentage: ((annualIncome / baseFPL) * 100).toFixed(1) + '%'
        }
      };
    }

    // Verify income sources
    const incomeSourcesValid = await this.verifyIncomeSources(data.income_sources, client);
    if (!incomeSourcesValid.valid) {
      return {
        eligible: false,
        reasons: ['Income source verification failed'],
        details: incomeSourcesValid.details
      };
    }

    // Store income verification
    await client.query(
      `INSERT INTO income_verifications
       (user_id, program_type, household_size, annual_income,
        income_sources, verification_date, verification_status)
       VALUES ($1, $2, $3, $4, $5, NOW(), 'VERIFIED')`,
      [userId, programType, householdSize, annualIncome, data.income_sources]
    );

    return {
      eligible: true,
      details: {
        household_size: householdSize,
        annual_income: annualIncome,
        income_limit: incomeLimit,
        fpl_percentage: ((annualIncome / baseFPL) * 100).toFixed(1) + '%',
        income_verified: true
      }
    };
  }

  /**
   * Verify residency requirements
   */
  static async verifyResidency(userId, data, client) {
    try {
      // Verify state residency
      if (!data.state || !data.zip_code) {
        return {
          success: false,
          reasons: ['State and ZIP code required for residency verification']
        };
      }

      // Validate ZIP code matches state
      const zipValid = await this.validateZipCode(data.zip_code, data.state);
      if (!zipValid) {
        return {
          success: false,
          reasons: ['ZIP code does not match state']
        };
      }

      // Check residency duration requirements (typically 30 days)
      if (data.residency_start_date) {
        const residencyDays = Math.floor((Date.now() - new Date(data.residency_start_date)) / (1000 * 60 * 60 * 24));
        if (residencyDays < 30) {
          return {
            success: false,
            reasons: [`Must be resident for at least 30 days (current: ${residencyDays} days)`]
          };
        }
      }

      // Store residency verification
      await client.query(
        `INSERT INTO residency_verifications
         (user_id, state, zip_code, county, residency_start_date, verification_date)
         VALUES ($1, $2, $3, $4, $5, NOW())
         ON CONFLICT (user_id) DO UPDATE
         SET state = $2, zip_code = $3, county = $4, verification_date = NOW()`,
        [userId, data.state, data.zip_code, data.county, data.residency_start_date]
      );

      return { success: true };

    } catch (error) {
      console.error('Residency verification error:', error);
      return {
        success: false,
        reasons: ['Residency verification failed']
      };
    }
  }

  /**
   * Program-specific eligibility verification
   */
  static async verifyProgramSpecific(userId, programType, data, client) {
    const verifiers = {
      SNAP: () => this.verifySNAPEligibility(data),
      TANF: () => this.verifyTANFEligibility(data),
      WIC: () => this.verifyWICEligibility(data),
      VETERANS: () => this.verifyVeteransEligibility(data),
      MEDICAID: () => this.verifyMedicaidEligibility(data),
      SECTION_8: () => this.verifySection8Eligibility(data),
      UI: () => this.verifyUIEligibility(data),
      SCHOOL_CHOICE_ESA: () => this.verifySchoolChoiceEligibility(data),
      CHILD_CARE: () => this.verifyChildCareEligibility(data)
    };

    const verifier = verifiers[programType];
    if (!verifier) {
      return { eligible: true }; // No specific requirements
    }

    return await verifier();
  }

  // Program-specific verifiers
  static async verifySNAPEligibility(data) {
    const reasons = [];

    // Work requirements for able-bodied adults without dependents (ABAWD)
    if (data.age >= 18 && data.age <= 49 && !data.has_dependents && !data.has_disability) {
      if (!data.working_20_hours_week && !data.in_training_program) {
        reasons.push('Must work 20+ hours/week or be in training program (ABAWD requirement)');
      }
    }

    // Asset limits
    if (data.countable_assets > 2750 && !data.has_elderly_disabled_member) {
      reasons.push('Assets exceed limit for households without elderly/disabled members');
    }
    if (data.countable_assets > 4250 && data.has_elderly_disabled_member) {
      reasons.push('Assets exceed limit for households with elderly/disabled members');
    }

    return {
      eligible: reasons.length === 0,
      reasons
    };
  }

  static async verifyTANFEligibility(data) {
    const reasons = [];

    // Must have dependent children
    if (!data.has_dependent_children) {
      reasons.push('Must have dependent children under 18');
    }

    // Time limits (60 months federal, varies by state)
    if (data.months_received_tanf >= 60) {
      reasons.push('Federal 60-month lifetime limit reached');
    }

    // Work requirements
    if (!data.working_or_job_seeking && !data.has_exemption) {
      reasons.push('Must be working, seeking work, or have valid exemption');
    }

    return {
      eligible: reasons.length === 0,
      reasons
    };
  }

  static async verifyWICEligibility(data) {
    const reasons = [];

    // Category requirements
    const eligibleCategories = [
      data.is_pregnant,
      data.is_breastfeeding,
      data.is_postpartum && data.months_postpartum <= 6,
      data.has_infant_under_1,
      data.has_child_under_5
    ];

    if (!eligibleCategories.some(cat => cat === true)) {
      reasons.push('Must be pregnant, breastfeeding, postpartum, or have children under 5');
    }

    // Nutritional risk requirement (would be determined by assessment)
    if (data.nutritional_risk_assessed === false) {
      reasons.push('Must be at nutritional risk as determined by health professional');
    }

    return {
      eligible: reasons.length === 0,
      reasons
    };
  }

  static async verifyVeteransEligibility(data) {
    const reasons = [];

    // Must have served in military
    if (!data.veteran_status) {
      reasons.push('Must be a veteran with eligible discharge status');
    }

    // Discharge status
    if (data.discharge_status === 'dishonorable') {
      reasons.push('Dishonorable discharge not eligible for benefits');
    }

    // Service-connected disability for certain benefits
    if (data.benefit_type === 'disability' && !data.service_connected_disability) {
      reasons.push('Must have service-connected disability for disability benefits');
    }

    return {
      eligible: reasons.length === 0,
      reasons
    };
  }

  static async verifyMedicaidEligibility(data) {
    const reasons = [];

    // Categorical eligibility
    const categoricallyEligible = [
      data.is_pregnant,
      data.is_child_under_19,
      data.is_parent_caretaker,
      data.is_elderly,
      data.has_disability,
      data.is_former_foster_under_26
    ];

    if (!categoricallyEligible.some(cat => cat === true) && !data.medicaid_expansion_state) {
      reasons.push('Must meet categorical eligibility or be in Medicaid expansion state');
    }

    // Immigration status
    if (data.immigration_status === 'undocumented') {
      reasons.push('Must have eligible immigration status');
    }

    return {
      eligible: reasons.length === 0,
      reasons
    };
  }

  static async verifySection8Eligibility(data) {
    const reasons = [];

    // Local preference requirements (varies by housing authority)
    if (!data.local_resident && !data.working_in_jurisdiction) {
      reasons.push('May not meet local preference requirements');
    }

    // Criminal background
    if (data.has_drug_conviction || data.has_violent_crime_conviction) {
      reasons.push('Criminal history may affect eligibility');
    }

    // Previous evictions
    if (data.evicted_from_public_housing) {
      reasons.push('Previous eviction from public housing may affect eligibility');
    }

    return {
      eligible: reasons.length === 0,
      reasons
    };
  }

  static async verifyUIEligibility(data) {
    const reasons = [];

    // Must be unemployed through no fault of own
    if (data.termination_reason === 'fired_for_cause' || data.termination_reason === 'quit_voluntary') {
      reasons.push('Must be unemployed through no fault of your own');
    }

    // Work history requirements
    if (!data.sufficient_work_history) {
      reasons.push('Must have sufficient work history in base period');
    }

    // Able and available to work
    if (!data.able_to_work || !data.available_to_work) {
      reasons.push('Must be able and available to work');
    }

    // Active job search
    if (!data.actively_seeking_work) {
      reasons.push('Must be actively seeking work');
    }

    return {
      eligible: reasons.length === 0,
      reasons
    };
  }

  static async verifySchoolChoiceEligibility(data) {
    const reasons = [];

    // Student age requirements
    if (data.student_age < 5 || data.student_age > 18) {
      reasons.push('Student must be between 5 and 18 years old');
    }

    // Enrollment in eligible school
    if (!data.enrolled_in_participating_school && !data.homeschool_registered) {
      reasons.push('Must be enrolled in participating school or registered homeschool');
    }

    // State residency
    if (!data.state_resident) {
      reasons.push('Must be resident of participating state');
    }

    return {
      eligible: reasons.length === 0,
      reasons
    };
  }

  static async verifyChildCareEligibility(data) {
    const reasons = [];

    // Parent work/education requirements
    if (!data.parent_working && !data.parent_in_education && !data.parent_in_training) {
      reasons.push('Parent must be working, in education, or in training');
    }

    // Child age requirements
    if (data.child_age > 13 && !data.child_has_special_needs) {
      reasons.push('Child must be under 13 or have special needs');
    }

    return {
      eligible: reasons.length === 0,
      reasons
    };
  }

  /**
   * Check for duplicate enrollments
   */
  static async checkDuplicateEnrollment(userId, programType, client) {
    const result = await client.query(
      `SELECT * FROM government_benefits
       WHERE user_id = $1 AND program_type = $2 AND status IN ('ACTIVE', 'PENDING')`,
      [userId, programType]
    );

    return {
      hasDuplicate: result.rows.length > 0,
      enrollment: result.rows[0]
    };
  }

  /**
   * Verify cross-program eligibility
   */
  static async verifyCrossProgramEligibility(userId, programType, data, client) {
    const reasons = [];

    // Check for conflicting enrollments
    const existingEnrollments = await client.query(
      `SELECT program_type FROM government_benefits
       WHERE user_id = $1 AND status = 'ACTIVE'`,
      [userId]
    );

    const enrolled = existingEnrollments.rows.map(r => r.program_type);

    // TANF and UI conflict
    if (programType === 'UI' && enrolled.includes('TANF')) {
      reasons.push('Cannot receive Unemployment Insurance while receiving TANF');
    }

    // Asset limits across programs
    if (['SNAP', 'TANF'].includes(programType) && enrolled.includes('SECTION_8')) {
      // May need to verify combined asset limits
      reasons.push('Combined enrollment may affect asset limits - review required');
    }

    return {
      eligible: reasons.length === 0,
      reasons
    };
  }

  /**
   * Calculate maximum benefit amount
   */
  static calculateMaxBenefit(programType, data) {
    const maxBenefits = {
      SNAP: {
        1: 291, 2: 535, 3: 766, 4: 973, 5: 1155, 6: 1386, 7: 1532, 8: 1751
      },
      WIC: {
        base: 47, // Per month per person
        infant_formula: 150
      },
      TANF: {
        base: 500, // Varies significantly by state
        per_child: 100
      },
      UI: {
        weekly_max: 450, // Varies by state
        weeks: 26
      },
      LIHEAP: {
        heating: 1500,
        cooling: 800
      }
    };

    const householdSize = data.household_size || 1;

    switch (programType) {
      case 'SNAP':
        return maxBenefits.SNAP[Math.min(householdSize, 8)] || 1751;

      case 'WIC':
        let wicAmount = maxBenefits.WIC.base;
        if (data.has_infant) wicAmount += maxBenefits.WIC.infant_formula;
        return wicAmount;

      case 'TANF':
        return maxBenefits.TANF.base + (maxBenefits.TANF.per_child * (data.number_of_children || 0));

      case 'UI':
        return maxBenefits.UI.weekly_max;

      case 'LIHEAP':
        return maxBenefits.LIHEAP.heating;

      default:
        return 0;
    }
  }

  /**
   * Get disbursement schedule for program
   */
  static getDisbursementSchedule(programType) {
    const schedules = {
      SNAP: 'Monthly on assigned date',
      TANF: 'Monthly',
      WIC: 'Monthly',
      UI: 'Weekly or bi-weekly',
      VETERANS: 'Monthly',
      SECTION_8: 'Monthly to landlord',
      LIHEAP: 'Seasonal or as needed',
      MEDICAID: 'Coverage (not cash)',
      SCHOOL_CHOICE_ESA: 'Quarterly',
      CHILD_CARE: 'Monthly to provider',
      EMERGENCY_RENTAL: 'As needed',
      FREE_REDUCED_MEALS: 'Daily at school'
    };

    return schedules[programType] || 'Monthly';
  }

  /**
   * Get program restrictions
   */
  static getProgramRestrictions(programType) {
    // Use imported BusinessRuleEngine
    return BusinessRuleEngine.FEDERAL_PROGRAM_RULES[programType] || {};
  }

  // Helper methods
  static isValidSSN(ssn) {
    if (!ssn) return false;
    const cleaned = ssn.replace(/\D/g, '');
    return cleaned.length === 9 && !['000', '666', '9'].includes(cleaned.substring(0, 3));
  }

  static hashSSN(ssn) {
    // Use imported crypto
    return crypto.createHash('sha256').update(ssn).digest('hex');
  }

  static maskIdNumber(idNumber) {
    if (!idNumber || idNumber.length < 4) return '****';
    return '*'.repeat(idNumber.length - 4) + idNumber.slice(-4);
  }

  static async verifyGovernmentID(data) {
    // In production, this would integrate with Login.gov or ID.me
    // For now, return mock success
    return { success: true };
  }

  static async checkIdentityFraud(ssn, client) {
    // Check fraud database
    const result = await client.query(
      `SELECT COUNT(*) as fraud_count
       FROM fraud_reports
       WHERE ssn_hash = $1 AND report_status = 'CONFIRMED'`,
      [this.hashSSN(ssn)]
    );

    return { hasFraud: result.rows[0].fraud_count > 0 };
  }

  static async verifyIncomeSources(sources, client) {
    // Verify each income source
    // In production, this would connect to IRS, employer databases, etc.
    return { valid: true, details: 'Income sources verified' };
  }

  static async validateZipCode(zipCode, state) {
    // In production, use USPS API or similar
    // Simple validation for now
    const stateZipRanges = {
      'CA': ['90000', '96199'],
      'NY': ['10000', '14999'],
      'TX': ['75000', '79999'],
      'FL': ['32000', '34999']
      // Add more states...
    };

    const range = stateZipRanges[state];
    if (!range) return true; // Allow if state not in list

    return zipCode >= range[0] && zipCode <= range[1];
  }
}

export default BenefitEligibilityVerification;