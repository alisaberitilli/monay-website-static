import { Pool } from 'pg';
import crypto from 'crypto';
import EventEmitter from 'events';

class ContractorOnboardingSystem extends EventEmitter {
  constructor(dbConfig) {
    super();
    this.pool = new Pool(dbConfig);

    // Onboarding statuses
    this.onboardingStatus = {
      INITIATED: 'initiated',
      IDENTITY_VERIFICATION: 'identity_verification',
      TAX_INFO_COLLECTION: 'tax_info_collection',
      BANK_ACCOUNT_SETUP: 'bank_account_setup',
      AGREEMENT_SIGNING: 'agreement_signing',
      SKILLS_ASSESSMENT: 'skills_assessment',
      BACKGROUND_CHECK: 'background_check',
      PLATFORM_TRAINING: 'platform_training',
      ACTIVATED: 'activated',
      SUSPENDED: 'suspended',
      DEACTIVATED: 'deactivated'
    };

    // Contractor types
    this.contractorTypes = {
      FREELANCER: 'freelancer',
      DRIVER: 'driver',
      DELIVERY: 'delivery',
      TUTOR: 'tutor',
      CONSULTANT: 'consultant',
      HEALTHCARE: 'healthcare',
      TECHNICIAN: 'technician',
      CREATIVE: 'creative',
      SALES: 'sales',
      OTHER: 'other'
    };

    // Verification levels
    this.verificationLevels = {
      BASIC: 'basic',
      STANDARD: 'standard',
      ENHANCED: 'enhanced',
      PREMIUM: 'premium'
    };

    // Tax forms
    this.taxForms = {
      W9: 'w9',
      W8_BEN: 'w8_ben',
      W8_BEN_E: 'w8_ben_e',
      W8_ECI: 'w8_eci',
      W8_EXP: 'w8_exp',
      W8_IMY: 'w8_imy'
    };
  }

  /**
   * Initialize contractor onboarding
   */
  async initiateOnboarding(contractorData) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // Create contractor profile
      const contractorId = await this.createContractorProfile(client, contractorData);

      // Initialize onboarding checklist
      await this.createOnboardingChecklist(client, contractorId, contractorData.type);

      // Start identity verification
      await this.startIdentityVerification(client, contractorId);

      // Create notification preferences
      await this.setupNotificationPreferences(client, contractorId);

      await client.query('COMMIT');

      this.emit('onboarding:initiated', { contractorId, type: contractorData.type });

      return {
        success: true,
        contractorId,
        nextSteps: await this.getNextOnboardingSteps(contractorId)
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Create contractor profile
   */
  async createContractorProfile(client, data) {
    const query = `
      INSERT INTO contractors (
        email, phone, first_name, last_name, middle_name,
        date_of_birth, ssn_encrypted, type, verification_level,
        preferred_language, time_zone, country, state, city,
        address_line1, address_line2, postal_code,
        emergency_contact_name, emergency_contact_phone,
        profile_photo_url, bio, skills, certifications,
        years_experience, hourly_rate_min, hourly_rate_max,
        availability_hours_per_week, available_start_date,
        linkedin_url, portfolio_url, github_url,
        referral_source, referral_code,
        created_at, updated_at, status
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15, $16, $17, $18, $19,
        $20, $21, $22, $23, $24, $25, $26, $27, $28,
        $29, $30, $31, $32, $33, NOW(), NOW(), $34
      ) RETURNING id`;

    const ssnEncrypted = data.ssn ? this.encryptSSN(data.ssn) : null;

    const result = await client.query(query, [
      data.email, data.phone, data.firstName, data.lastName, data.middleName,
      data.dateOfBirth, ssnEncrypted, data.type || this.contractorTypes.OTHER,
      this.verificationLevels.BASIC, data.preferredLanguage || 'en',
      data.timeZone || 'UTC', data.country, data.state, data.city,
      data.addressLine1, data.addressLine2, data.postalCode,
      data.emergencyContactName, data.emergencyContactPhone,
      data.profilePhotoUrl, data.bio, JSON.stringify(data.skills || []),
      JSON.stringify(data.certifications || []), data.yearsExperience,
      data.hourlyRateMin, data.hourlyRateMax, data.availabilityHoursPerWeek,
      data.availableStartDate, data.linkedinUrl, data.portfolioUrl,
      data.githubUrl, data.referralSource, data.referralCode,
      this.onboardingStatus.INITIATED
    ]);

    return result.rows[0].id;
  }

  /**
   * Create onboarding checklist
   */
  async createOnboardingChecklist(client, contractorId, contractorType) {
    const checklist = this.getChecklistByType(contractorType);

    const query = `
      INSERT INTO contractor_onboarding_checklist (
        contractor_id, step_name, step_order, required,
        status, created_at
      ) VALUES ($1, $2, $3, $4, $5, NOW())`;

    for (const [index, step] of checklist.entries()) {
      await client.query(query, [
        contractorId,
        step.name,
        index + 1,
        step.required,
        'pending'
      ]);
    }
  }

  /**
   * Get checklist by contractor type
   */
  getChecklistByType(type) {
    const baseChecklist = [
      { name: 'identity_verification', required: true },
      { name: 'tax_information', required: true },
      { name: 'bank_account', required: true },
      { name: 'service_agreement', required: true },
      { name: 'profile_completion', required: true }
    ];

    const typeSpecific = {
      [this.contractorTypes.DRIVER]: [
        { name: 'drivers_license', required: true },
        { name: 'vehicle_registration', required: true },
        { name: 'insurance_verification', required: true },
        { name: 'vehicle_inspection', required: true }
      ],
      [this.contractorTypes.DELIVERY]: [
        { name: 'background_check', required: true },
        { name: 'delivery_training', required: true }
      ],
      [this.contractorTypes.HEALTHCARE]: [
        { name: 'license_verification', required: true },
        { name: 'certification_verification', required: true },
        { name: 'malpractice_insurance', required: true },
        { name: 'hipaa_training', required: true }
      ],
      [this.contractorTypes.TUTOR]: [
        { name: 'education_verification', required: true },
        { name: 'background_check', required: true },
        { name: 'teaching_certification', required: false }
      ]
    };

    return [...baseChecklist, ...(typeSpecific[type] || [])];
  }

  /**
   * Start identity verification
   */
  async startIdentityVerification(client, contractorId) {
    const verificationId = crypto.randomBytes(16).toString('hex');

    const query = `
      INSERT INTO contractor_verifications (
        contractor_id, verification_id, type, status,
        provider, initiated_at
      ) VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING id`;

    await client.query(query, [
      contractorId,
      verificationId,
      'identity',
      'pending',
      'persona' // Or other KYC provider
    ]);

    // Trigger external KYC verification
    this.emit('kyc:initiate', { contractorId, verificationId });

    return verificationId;
  }

  /**
   * Submit tax information
   */
  async submitTaxInformation(contractorId, taxData) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // Store tax form data
      const query = `
        INSERT INTO contractor_tax_information (
          contractor_id, form_type, tin_encrypted, legal_name,
          business_name, business_type, address, city, state,
          postal_code, country, tax_classification,
          exemption_codes, fatca_status, treaty_country,
          treaty_article, withholding_rate,
          signature_name, signature_date, signature_ip,
          form_data, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
          $11, $12, $13, $14, $15, $16, $17, $18, $19,
          $20, $21, NOW(), NOW()
        ) RETURNING id`;

      const tinEncrypted = taxData.tin ? this.encryptTIN(taxData.tin) : null;

      await client.query(query, [
        contractorId,
        taxData.formType || this.taxForms.W9,
        tinEncrypted,
        taxData.legalName,
        taxData.businessName,
        taxData.businessType,
        taxData.address,
        taxData.city,
        taxData.state,
        taxData.postalCode,
        taxData.country,
        taxData.taxClassification,
        JSON.stringify(taxData.exemptionCodes || []),
        taxData.fatcaStatus,
        taxData.treatyCountry,
        taxData.treatyArticle,
        taxData.withholdingRate,
        taxData.signatureName,
        new Date(),
        taxData.ipAddress,
        JSON.stringify(taxData)
      ]);

      // Update onboarding checklist
      await this.updateChecklistStep(client, contractorId, 'tax_information', 'completed');

      // Update contractor status if all required steps complete
      await this.checkAndUpdateOnboardingStatus(client, contractorId);

      await client.query('COMMIT');

      this.emit('tax:submitted', { contractorId, formType: taxData.formType });

      return { success: true, message: 'Tax information submitted successfully' };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Setup bank account
   */
  async setupBankAccount(contractorId, bankData) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // Encrypt sensitive bank data
      const encryptedData = this.encryptBankData(bankData);

      const query = `
        INSERT INTO contractor_bank_accounts (
          contractor_id, account_type, bank_name,
          routing_number_encrypted, account_number_encrypted,
          account_holder_name, swift_code, iban,
          currency, country, is_primary, is_verified,
          verification_method, verification_date,
          created_at, updated_at, status
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
          $11, $12, $13, $14, NOW(), NOW(), $15
        ) RETURNING id`;

      await client.query(query, [
        contractorId,
        bankData.accountType || 'checking',
        bankData.bankName,
        encryptedData.routingNumber,
        encryptedData.accountNumber,
        bankData.accountHolderName,
        bankData.swiftCode,
        bankData.iban,
        bankData.currency || 'USD',
        bankData.country || 'US',
        true, // is_primary
        false, // is_verified (pending verification)
        'micro_deposits', // verification_method
        null, // verification_date
        'pending_verification'
      ]);

      // Initiate bank account verification
      await this.initiateBankVerification(client, contractorId, bankData);

      // Update checklist
      await this.updateChecklistStep(client, contractorId, 'bank_account', 'pending');

      await client.query('COMMIT');

      return { success: true, message: 'Bank account added, verification initiated' };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Sign service agreement
   */
  async signServiceAgreement(contractorId, agreementData) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // Store agreement signature
      const query = `
        INSERT INTO contractor_agreements (
          contractor_id, agreement_type, agreement_version,
          agreement_text, signature_data, signature_timestamp,
          ip_address, user_agent, accepted_terms,
          created_at, status
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), $10
        ) RETURNING id`;

      await client.query(query, [
        contractorId,
        agreementData.type || 'service_agreement',
        agreementData.version || '1.0',
        agreementData.agreementText,
        agreementData.signatureData,
        new Date(),
        agreementData.ipAddress,
        agreementData.userAgent,
        JSON.stringify(agreementData.acceptedTerms || {}),
        'active'
      ]);

      // Update checklist
      await this.updateChecklistStep(client, contractorId, 'service_agreement', 'completed');

      // Check if onboarding complete
      await this.checkAndUpdateOnboardingStatus(client, contractorId);

      await client.query('COMMIT');

      this.emit('agreement:signed', { contractorId, type: agreementData.type });

      return { success: true, message: 'Service agreement signed successfully' };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Submit skills assessment
   */
  async submitSkillsAssessment(contractorId, assessmentData) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // Store assessment results
      const query = `
        INSERT INTO contractor_assessments (
          contractor_id, assessment_type, skill_category,
          assessment_score, passing_score, passed,
          time_taken_minutes, questions_answered,
          correct_answers, assessment_data,
          certification_earned, certificate_url,
          expires_at, created_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
          $11, $12, $13, NOW()
        ) RETURNING id`;

      const passed = assessmentData.score >= assessmentData.passingScore;

      await client.query(query, [
        contractorId,
        assessmentData.type,
        assessmentData.skillCategory,
        assessmentData.score,
        assessmentData.passingScore,
        passed,
        assessmentData.timeTakenMinutes,
        assessmentData.questionsAnswered,
        assessmentData.correctAnswers,
        JSON.stringify(assessmentData.details || {}),
        passed ? assessmentData.certificationName : null,
        passed ? assessmentData.certificateUrl : null,
        assessmentData.expiresAt
      ]);

      // Update contractor skills if passed
      if (passed) {
        await this.updateContractorSkills(client, contractorId, assessmentData.skillCategory);
      }

      // Update checklist if applicable
      await this.updateChecklistStep(client, contractorId, 'skills_assessment', passed ? 'completed' : 'failed');

      await client.query('COMMIT');

      return {
        success: true,
        passed,
        message: passed ? 'Assessment passed successfully' : 'Assessment failed, please retry'
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Process background check
   */
  async processBackgroundCheck(contractorId, checkData) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      const query = `
        INSERT INTO contractor_background_checks (
          contractor_id, check_type, provider, report_id,
          status, criminal_record_clear, employment_verified,
          education_verified, reference_checks_passed,
          motor_vehicle_clear, credit_check_score,
          drug_test_result, report_url, report_data,
          checked_at, expires_at, created_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
          $11, $12, $13, $14, $15, $16, NOW()
        ) RETURNING id`;

      await client.query(query, [
        contractorId,
        checkData.type,
        checkData.provider,
        checkData.reportId,
        checkData.status,
        checkData.criminalRecordClear,
        checkData.employmentVerified,
        checkData.educationVerified,
        checkData.referenceChecksPassed,
        checkData.motorVehicleClear,
        checkData.creditCheckScore,
        checkData.drugTestResult,
        checkData.reportUrl,
        JSON.stringify(checkData.details || {}),
        new Date(),
        checkData.expiresAt
      ]);

      // Update verification level based on background check
      if (checkData.status === 'passed') {
        await this.updateVerificationLevel(client, contractorId);
      }

      // Update checklist
      await this.updateChecklistStep(
        client,
        contractorId,
        'background_check',
        checkData.status === 'passed' ? 'completed' : 'failed'
      );

      await client.query('COMMIT');

      return { success: true, status: checkData.status };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Complete platform training
   */
  async completePlatformTraining(contractorId, trainingData) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      const query = `
        INSERT INTO contractor_training (
          contractor_id, training_module, completion_date,
          score, passing_score, passed, time_spent_minutes,
          attempts, certificate_issued, certificate_url,
          feedback, created_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW()
        ) RETURNING id`;

      const passed = trainingData.score >= trainingData.passingScore;

      await client.query(query, [
        contractorId,
        trainingData.module,
        new Date(),
        trainingData.score,
        trainingData.passingScore,
        passed,
        trainingData.timeSpentMinutes,
        trainingData.attempts,
        passed,
        passed ? trainingData.certificateUrl : null,
        trainingData.feedback
      ]);

      // Update checklist
      await this.updateChecklistStep(
        client,
        contractorId,
        'platform_training',
        passed ? 'completed' : 'in_progress'
      );

      // Check if all onboarding complete
      await this.checkAndUpdateOnboardingStatus(client, contractorId);

      await client.query('COMMIT');

      return { success: true, passed, message: passed ? 'Training completed' : 'Please retry training' };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Activate contractor account
   */
  async activateContractor(contractorId) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // Check all required steps are complete
      const checklistQuery = `
        SELECT COUNT(*) as incomplete
        FROM contractor_onboarding_checklist
        WHERE contractor_id = $1
        AND required = true
        AND status != 'completed'`;

      const checkResult = await client.query(checklistQuery, [contractorId]);

      if (checkResult.rows[0].incomplete > 0) {
        throw new Error('Cannot activate: Required onboarding steps incomplete');
      }

      // Activate contractor
      const updateQuery = `
        UPDATE contractors
        SET status = $1, activated_at = NOW(), updated_at = NOW()
        WHERE id = $2
        RETURNING *`;

      const result = await client.query(updateQuery, [
        this.onboardingStatus.ACTIVATED,
        contractorId
      ]);

      // Create initial wallet/payment account
      await this.createPaymentAccount(client, contractorId);

      // Send activation notification
      await this.sendActivationNotification(client, contractorId);

      await client.query('COMMIT');

      this.emit('contractor:activated', { contractorId });

      return {
        success: true,
        contractor: result.rows[0],
        message: 'Contractor account activated successfully'
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Helper methods
   */
  encryptSSN(ssn) {
    const cipher = crypto.createCipher('aes-256-cbc', process.env.ENCRYPTION_KEY);
    let encrypted = cipher.update(ssn, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  encryptTIN(tin) {
    return this.encryptSSN(tin); // Same encryption method
  }

  encryptBankData(bankData) {
    return {
      routingNumber: this.encryptSSN(bankData.routingNumber),
      accountNumber: this.encryptSSN(bankData.accountNumber)
    };
  }

  async updateChecklistStep(client, contractorId, stepName, status) {
    const query = `
      UPDATE contractor_onboarding_checklist
      SET status = $1, completed_at = CASE WHEN $1 = 'completed' THEN NOW() ELSE NULL END
      WHERE contractor_id = $2 AND step_name = $3`;

    await client.query(query, [status, contractorId, stepName]);
  }

  async checkAndUpdateOnboardingStatus(client, contractorId) {
    const checkQuery = `
      SELECT COUNT(*) as incomplete
      FROM contractor_onboarding_checklist
      WHERE contractor_id = $1
      AND required = true
      AND status != 'completed'`;

    const result = await client.query(checkQuery, [contractorId]);

    if (result.rows[0].incomplete === 0) {
      await this.activateContractor(contractorId);
    }
  }

  async updateVerificationLevel(client, contractorId) {
    const query = `
      UPDATE contractors
      SET verification_level = $1, updated_at = NOW()
      WHERE id = $2`;

    await client.query(query, [this.verificationLevels.STANDARD, contractorId]);
  }

  async updateContractorSkills(client, contractorId, skillCategory) {
    const query = `
      UPDATE contractors
      SET skills = skills || $1::jsonb,
          updated_at = NOW()
      WHERE id = $2`;

    await client.query(query, [JSON.stringify([skillCategory]), contractorId]);
  }

  async initiateBankVerification(client, contractorId, bankData) {
    // Initiate micro-deposits or instant verification
    this.emit('bank:verify', { contractorId, bankData });
  }

  async createPaymentAccount(client, contractorId) {
    const query = `
      INSERT INTO contractor_payment_accounts (
        contractor_id, account_number, balance,
        currency, status, created_at
      ) VALUES ($1, $2, $3, $4, $5, NOW())`;

    const accountNumber = 'GIG-' + crypto.randomBytes(8).toString('hex').toUpperCase();

    await client.query(query, [
      contractorId,
      accountNumber,
      0,
      'USD',
      'active'
    ]);
  }

  async sendActivationNotification(client, contractorId) {
    // Send welcome email/SMS
    this.emit('notification:send', {
      contractorId,
      type: 'activation',
      channels: ['email', 'sms']
    });
  }

  async setupNotificationPreferences(client, contractorId) {
    const query = `
      INSERT INTO contractor_notification_preferences (
        contractor_id, email_enabled, sms_enabled,
        push_enabled, payment_alerts, job_alerts,
        platform_updates, marketing, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`;

    await client.query(query, [
      contractorId,
      true, // email_enabled
      true, // sms_enabled
      true, // push_enabled
      true, // payment_alerts
      true, // job_alerts
      true, // platform_updates
      false, // marketing
    ]);
  }

  async getNextOnboardingSteps(contractorId) {
    const query = `
      SELECT step_name, step_order, required
      FROM contractor_onboarding_checklist
      WHERE contractor_id = $1
      AND status != 'completed'
      ORDER BY step_order
      LIMIT 3`;

    const result = await this.pool.query(query, [contractorId]);
    return result.rows;
  }

  /**
   * Get contractor dashboard data
   */
  async getContractorDashboard(contractorId) {
    const queries = {
      profile: `SELECT * FROM contractors WHERE id = $1`,
      checklist: `SELECT * FROM contractor_onboarding_checklist WHERE contractor_id = $1 ORDER BY step_order`,
      earnings: `SELECT SUM(amount) as total FROM contractor_earnings WHERE contractor_id = $1`,
      ratings: `SELECT AVG(rating) as average FROM contractor_ratings WHERE contractor_id = $1`,
      activeJobs: `SELECT COUNT(*) as count FROM contractor_jobs WHERE contractor_id = $1 AND status = 'active'`
    };

    const results = {};
    for (const [key, query] of Object.entries(queries)) {
      const result = await this.pool.query(query, [contractorId]);
      results[key] = result.rows[0] || result.rows;
    }

    return results;
  }
}

export default ContractorOnboardingSystem;