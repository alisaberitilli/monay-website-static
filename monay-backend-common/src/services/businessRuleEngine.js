/**
 * Business Rule Engine (BRE) Core Framework
 * Implements real-time authorization and compliance for government benefit programs
 * GENIUS Act Compliant - July 18, 2025 Deadline
 */

import { Pool } from 'pg';
import logger from '../services/logger.js';

class BusinessRuleEngine {
  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL
    });

    // Cache for frequently accessed rules
    this.ruleCache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes

    // Initialize rule categories
    this.ruleCategories = {
      FEDERAL: 'federal_benefits',
      STATE: 'state_benefits',
      LOCAL: 'local_benefits',
      COMPLIANCE: 'compliance',
      VELOCITY: 'velocity_limits',
      FRAUD: 'fraud_detection'
    };
  }

  /**
   * Federal Program MCC Restrictions and Rules
   */
  static FEDERAL_PROGRAM_RULES = {
    SNAP: {
      program_name: 'Supplemental Nutrition Assistance Program',
      allowed_mcc_codes: ['5411', '5422', '5441', '5451', '5499'], // Grocery stores
      prohibited_items: [
        'alcohol',
        'tobacco',
        'hot_prepared_foods',
        'non_food_items',
        'vitamins',
        'medicines',
        'pet_food'
      ],
      max_transaction_amount: null, // No limit
      requires_ebt_eligible_flag: true,
      balance_type: 'monthly_renewable',
      carryover_allowed: true,
      carryover_limit_months: 1,
      time_restrictions: null,
      geographic_restrictions: 'state_only',
      verification_required: 'annual',
      work_requirements: {
        age_range: [18, 49],
        hours_per_week: 20,
        exemptions: ['disabled', 'pregnant', 'caretaker', 'student']
      }
    },

    TANF: {
      program_name: 'Temporary Assistance for Needy Families',
      allowed_mcc_codes: 'all_except_prohibited',
      prohibited_mcc_codes: [
        '5813', // Bars/cocktail lounges
        '5921', // Package stores (liquor)
        '7273', // Dating services
        '7297', // Massage parlors
        '7299', // Miscellaneous personal services
        '7800', // Government-owned lotteries
        '7801', // Government-licensed casinos
        '7802', // Government-licensed horse/dog racing
        '7995', // Gambling
        '5912', // Drug stores (for alcohol)
        '5122', // Drugs/proprietaries (tobacco)
      ],
      prohibited_venues: [
        'liquor_stores',
        'casinos',
        'gaming_establishments',
        'adult_entertainment',
        'marijuana_dispensaries',
        'tattoo_parlors',
        'cruise_ships'
      ],
      cash_withdrawal_allowed: true,
      max_cash_per_day: 500.00,
      max_cash_per_month: 2000.00,
      lifetime_limit_months: 60,
      requires_work_participation: true,
      child_only_cases_exempt: true,
      time_clock_start: 'first_payment',
      extensions_allowed: 'hardship_only',
      max_extension_months: 12
    },

    MEDICAID: {
      program_name: 'Medicaid',
      allowed_mcc_codes: [
        '5912', // Drug stores
        '5976', // Orthopedic goods
        '8011', // Doctors
        '8021', // Dentists
        '8031', // Osteopaths
        '8041', // Chiropractors
        '8042', // Optometrists
        '8043', // Opticians
        '8049', // Podiatrists
        '8050', // Nursing/personal care
        '8062', // Hospitals
        '8071', // Medical laboratories
        '8099', // Medical services
      ],
      copayment_required: true,
      copayment_amounts: {
        emergency_room: 3.00,
        prescription_generic: 1.00,
        prescription_brand: 3.00,
        doctor_visit: 2.00
      },
      excluded_services: [
        'cosmetic_surgery',
        'experimental_treatments',
        'non_emergency_medical_transport'
      ],
      prior_authorization_required: [
        'durable_medical_equipment',
        'specialized_therapy',
        'brand_drugs_with_generic'
      ],
      retroactive_coverage_months: 3
    },

    WIC: {
      program_name: 'Women, Infants, and Children',
      allowed_mcc_codes: ['5411', '5422', '5912'], // Grocery and pharmacy
      wic_approved_items_only: true,
      item_categories: [
        'infant_formula',
        'baby_food',
        'milk',
        'cheese',
        'eggs',
        'whole_grains',
        'fruits',
        'vegetables',
        'peanut_butter',
        'beans'
      ],
      quantity_limits: {
        milk_gallons_per_month: 4,
        eggs_dozens_per_month: 2,
        formula_cans_per_month: 9
      },
      vendor_must_be_authorized: true,
      cash_value_benefit: {
        fruits_vegetables: 11.00,
        per_child: 9.00
      },
      package_tailoring: 'by_participant_category',
      participant_categories: [
        'pregnant',
        'postpartum',
        'breastfeeding',
        'infant',
        'child'
      ]
    },

    VETERANS_BENEFITS: {
      program_name: 'Veterans Benefits',
      allowed_mcc_codes: 'unrestricted',
      types: {
        disability_compensation: {
          restrictions: 'none',
          tax_exempt: true
        },
        education_benefits: {
          allowed_mcc_codes: ['8220', '8241', '8244', '8249'], // Schools
          housing_allowance_separate: true
        },
        healthcare: {
          allowed_mcc_codes: ['8011', '8021', '8062', '5912'], // Medical
          copayment_tiers: ['priority_1_free', 'priority_2_8']
        }
      },
      concurrent_receipt_allowed: ['social_security', 'retirement'],
      means_testing_required: false
    },

    SECTION_8: {
      program_name: 'Housing Choice Voucher Program',
      allowed_payees: 'landlords_only',
      payment_type: 'direct_to_landlord',
      tenant_portion_calculation: '30_percent_income',
      utility_allowance_included: true,
      prohibited_payments: [
        'security_deposits',
        'pet_deposits',
        'application_fees',
        'late_fees'
      ],
      portability_allowed: true,
      inspection_required: 'annual',
      fair_market_rent_limits: true
    },

    LIHEAP: {
      program_name: 'Low Income Home Energy Assistance',
      allowed_payees: 'utility_companies_only',
      allowed_mcc_codes: ['4900'], // Utilities
      payment_types: [
        'heating_assistance',
        'cooling_assistance',
        'crisis_assistance',
        'weatherization'
      ],
      seasonal_availability: {
        heating: 'october_march',
        cooling: 'june_september',
        crisis: 'year_round'
      },
      max_benefit_per_year: 'varies_by_state',
      vendor_agreement_required: true
    }
  };

  /**
   * State and Local Program Rules
   */
  static STATE_LOCAL_PROGRAM_RULES = {
    UNEMPLOYMENT_INSURANCE: {
      program_name: 'Unemployment Insurance',
      allowed_mcc_codes: 'unrestricted',
      weekly_certification_required: true,
      work_search_requirements: {
        contacts_per_week: 3,
        documentation_required: true
      },
      max_weeks_regular: 26,
      max_weeks_extended: 13,
      waiting_week: true,
      earning_disregard: '25_percent',
      disqualifications: [
        'voluntary_quit',
        'misconduct',
        'refusing_suitable_work'
      ]
    },

    SCHOOL_CHOICE_ESA: {
      program_name: 'Education Savings Account',
      allowed_mcc_codes: [
        '5942', // Book stores
        '5943', // Stationery stores
        '8211', // Elementary/secondary schools
        '8220', // Colleges/universities
        '8241', // Correspondence schools
        '8244', // Business schools
        '8249', // Trade schools
        '8299', // Educational services
      ],
      approved_expenses: [
        'tuition',
        'textbooks',
        'educational_software',
        'tutoring',
        'therapy',
        'uniforms',
        'transportation',
        'computer_hardware'
      ],
      receipt_required: true,
      quarterly_reporting: true,
      rollover_allowed: true,
      max_rollover_amount: 5000.00
    },

    CHILDCARE_ASSISTANCE: {
      program_name: 'Child Care Assistance',
      allowed_payees: 'licensed_providers_only',
      provider_types: [
        'licensed_center',
        'licensed_family_home',
        'registered_family_home',
        'legally_exempt'
      ],
      copayment_sliding_scale: true,
      parent_choice: true,
      quality_rating_bonus: true,
      attendance_tracking_required: true,
      absent_days_limit: 10
    },

    TRANSPORTATION_ASSISTANCE: {
      program_name: 'Transportation Benefits',
      allowed_mcc_codes: [
        '4111', // Local transport
        '4112', // Passenger railways
        '4121', // Taxicabs
        '4131', // Bus lines
        '4784', // Tolls
        '5541', // Service stations
        '5542', // Automated fuel dispensers
        '7523', // Parking lots
      ],
      types: {
        transit_pass: {
          max_monthly: 280.00,
          employer_provided_limit: true
        },
        gas_cards: {
          max_monthly: 200.00,
          work_related_only: true
        },
        vehicle_repair: {
          max_annual: 1000.00,
          emergency_only: true
        }
      }
    },

    EMERGENCY_RENTAL_ASSISTANCE: {
      program_name: 'Emergency Rental Assistance',
      allowed_payees: ['landlord', 'utility_company'],
      covered_expenses: [
        'rent_arrears',
        'current_rent',
        'utility_arrears',
        'current_utilities',
        'internet_service'
      ],
      max_months_assistance: 18,
      lookback_period: 'march_2020',
      income_limit: '80_percent_ami',
      recertification_required: 'every_3_months'
    },

    FREE_REDUCED_MEALS: {
      program_name: 'School Meal Programs',
      payment_type: 'reimbursement_to_school',
      eligibility_categories: {
        free: '130_percent_poverty',
        reduced: '185_percent_poverty',
        direct_certification: ['snap', 'tanf', 'homeless', 'migrant']
      },
      summer_program_available: true,
      snack_program: true,
      breakfast_program: true,
      fresh_fruit_vegetable_program: 'low_income_schools'
    },

    EITC_ADVANCE: {
      program_name: 'Earned Income Tax Credit Advance',
      allowed_mcc_codes: 'unrestricted',
      payment_frequency: 'monthly',
      max_advance_percentage: 50,
      reconciliation_required: 'tax_filing',
      eligibility: {
        earned_income_required: true,
        investment_income_limit: 10000,
        qualifying_children: [0, 1, 2, 3]
      }
    }
  };

  /**
   * Core rule evaluation function
   */
  async evaluateTransaction(transaction) {
    const startTime = Date.now();

    try {
      // Get applicable rules for the transaction
      const rules = await this.getApplicableRules(transaction);

      // Initialize evaluation result
      const result = {
        approved: true,
        reasons: [],
        appliedRules: [],
        riskScore: 0,
        requiredActions: []
      };

      // Evaluate each rule
      for (const rule of rules) {
        const ruleResult = await this.evaluateRule(rule, transaction);

        result.appliedRules.push({
          ruleId: rule.id,
          ruleName: rule.rule_name,
          result: ruleResult.passed ? 'PASSED' : 'FAILED',
          message: ruleResult.message
        });

        if (!ruleResult.passed) {
          result.approved = false;
          result.reasons.push(ruleResult.message);

          if (rule.response_action === 'BLOCK') {
            break; // Stop evaluation on blocking rule
          }
        }

        result.riskScore = Math.max(result.riskScore, ruleResult.riskScore || 0);
      }

      // Log evaluation
      await this.logEvaluation(transaction, result);

      logger.info('Rule evaluation completed', {
        transactionId: transaction.id,
        approved: result.approved,
        duration: Date.now() - startTime
      });

      return result;

    } catch (error) {
      logger.error('Rule evaluation failed', { error, transaction });
      throw error;
    }
  }

  /**
   * Get applicable rules for a transaction
   */
  async getApplicableRules(transaction) {
    const cacheKey = `rules_${transaction.program}_${transaction.merchantCategoryCode}`;

    // Check cache
    if (this.ruleCache.has(cacheKey)) {
      const cached = this.ruleCache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.rules;
      }
    }

    // Query database for rules
    const query = `
      SELECT * FROM business_rules
      WHERE is_active = true
        AND (benefit_program = $1 OR benefit_program IS NULL)
        AND (
          mcc_restrictions IS NULL OR
          $2 = ANY(mcc_restrictions) OR
          NOT ($2 = ANY(mcc_restrictions))
        )
      ORDER BY priority ASC, created_at ASC
    `;

    const result = await this.pool.query(query, [
      transaction.program,
      transaction.merchantCategoryCode
    ]);

    const rules = result.rows;

    // Cache rules
    this.ruleCache.set(cacheKey, {
      rules,
      timestamp: Date.now()
    });

    return rules;
  }

  /**
   * Evaluate a single rule
   */
  async evaluateRule(rule, transaction) {
    const result = {
      passed: true,
      message: '',
      riskScore: 0
    };

    try {
      // Parse rule conditions
      const conditions = rule.conditions;

      // Check MCC restrictions
      if (rule.mcc_restrictions && rule.mcc_restrictions.length > 0) {
        const mccAllowed = this.checkMccRestrictions(
          transaction.merchantCategoryCode,
          rule.mcc_restrictions,
          rule.rule_type
        );

        if (!mccAllowed) {
          result.passed = false;
          result.message = `MCC ${transaction.merchantCategoryCode} not allowed for ${rule.benefit_program}`;
          result.riskScore = 80;
        }
      }

      // Check amount limits
      if (conditions.amount_limit && transaction.amount > conditions.amount_limit) {
        result.passed = false;
        result.message = `Amount exceeds limit: ${transaction.amount} > ${conditions.amount_limit}`;
        result.riskScore = 60;
      }

      // Check velocity limits
      if (conditions.velocity_check) {
        const velocityPassed = await this.checkVelocityLimits(
          transaction,
          conditions.velocity_check
        );

        if (!velocityPassed) {
          result.passed = false;
          result.message = 'Velocity limit exceeded';
          result.riskScore = 70;
        }
      }

      // Check time restrictions
      if (conditions.time_restrictions) {
        const timeAllowed = this.checkTimeRestrictions(
          transaction.timestamp,
          conditions.time_restrictions
        );

        if (!timeAllowed) {
          result.passed = false;
          result.message = 'Transaction outside allowed time window';
          result.riskScore = 40;
        }
      }

      // Check geographic restrictions
      if (conditions.geographic_restrictions) {
        const geoAllowed = await this.checkGeographicRestrictions(
          transaction,
          conditions.geographic_restrictions
        );

        if (!geoAllowed) {
          result.passed = false;
          result.message = 'Transaction outside allowed geographic area';
          result.riskScore = 50;
        }
      }

      // Program-specific checks
      if (rule.benefit_program) {
        const programResult = await this.evaluateProgramSpecificRules(
          rule.benefit_program,
          transaction
        );

        if (!programResult.passed) {
          result.passed = false;
          result.message = programResult.message;
          result.riskScore = programResult.riskScore;
        }
      }

    } catch (error) {
      logger.error('Error evaluating rule', { rule, transaction, error });
      result.passed = false;
      result.message = 'Rule evaluation error';
      result.riskScore = 100;
    }

    return result;
  }

  /**
   * Check MCC restrictions
   */
  checkMccRestrictions(mcc, restrictions, ruleType) {
    if (ruleType === 'WHITELIST') {
      return restrictions.includes(mcc);
    } else if (ruleType === 'BLACKLIST') {
      return !restrictions.includes(mcc);
    }
    return true;
  }

  /**
   * Check velocity limits
   */
  async checkVelocityLimits(transaction, velocityConfig) {
    const query = `
      SELECT COUNT(*) as count, SUM(amount) as total
      FROM transactions
      WHERE wallet_id = $1
        AND created_at > NOW() - INTERVAL '${velocityConfig.window}'
        AND status = 'completed'
    `;

    const result = await this.pool.query(query, [transaction.wallet_id]);
    const { count, total } = result.rows[0];

    if (velocityConfig.max_count && count >= velocityConfig.max_count) {
      return false;
    }

    if (velocityConfig.max_amount && total + transaction.amount > velocityConfig.max_amount) {
      return false;
    }

    return true;
  }

  /**
   * Check time restrictions
   */
  checkTimeRestrictions(timestamp, restrictions) {
    const date = new Date(timestamp);
    const hour = date.getHours();
    const dayOfWeek = date.getDay();

    if (restrictions.allowed_hours) {
      const [startHour, endHour] = restrictions.allowed_hours;
      if (hour < startHour || hour > endHour) {
        return false;
      }
    }

    if (restrictions.allowed_days) {
      if (!restrictions.allowed_days.includes(dayOfWeek)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Check geographic restrictions
   */
  async checkGeographicRestrictions(transaction, restrictions) {
    if (restrictions.allowed_states) {
      if (!restrictions.allowed_states.includes(transaction.merchantState)) {
        return false;
      }
    }

    if (restrictions.blocked_countries) {
      if (restrictions.blocked_countries.includes(transaction.merchantCountry)) {
        return false;
      }
    }

    if (restrictions.max_distance_miles) {
      // Calculate distance from home address
      const distance = await this.calculateDistance(
        transaction.latitude,
        transaction.longitude,
        transaction.homeLatitude,
        transaction.homeLongitude
      );

      if (distance > restrictions.max_distance_miles) {
        return false;
      }
    }

    return true;
  }

  /**
   * Evaluate program-specific rules
   */
  async evaluateProgramSpecificRules(program, transaction) {
    const result = {
      passed: true,
      message: '',
      riskScore: 0
    };

    const programRules = BusinessRuleEngine.FEDERAL_PROGRAM_RULES[program] ||
                        BusinessRuleEngine.STATE_LOCAL_PROGRAM_RULES[program];

    if (!programRules) {
      return result;
    }

    // Check prohibited items for SNAP
    if (program === 'SNAP' && transaction.items) {
      for (const item of transaction.items) {
        if (programRules.prohibited_items.some(prohibited =>
          item.description.toLowerCase().includes(prohibited)
        )) {
          result.passed = false;
          result.message = `Prohibited item: ${item.description}`;
          result.riskScore = 90;
          break;
        }
      }
    }

    // Check TANF cash limits
    if (program === 'TANF' && transaction.type === 'ATM_WITHDRAWAL') {
      if (transaction.amount > programRules.max_cash_per_day) {
        result.passed = false;
        result.message = `Exceeds daily cash limit: $${programRules.max_cash_per_day}`;
        result.riskScore = 70;
      }
    }

    // Check WIC approved items
    if (program === 'WIC' && programRules.wic_approved_items_only) {
      const approvedItems = await this.checkWicApprovedItems(transaction);
      if (!approvedItems) {
        result.passed = false;
        result.message = 'Contains non-WIC approved items';
        result.riskScore = 85;
      }
    }

    // Check Section 8 landlord-only payments
    if (program === 'SECTION_8') {
      const isLandlord = await this.verifyLandlord(transaction.payeeId);
      if (!isLandlord) {
        result.passed = false;
        result.message = 'Payment must be to approved landlord';
        result.riskScore = 95;
      }
    }

    return result;
  }

  /**
   * Check WIC approved items
   */
  async checkWicApprovedItems(transaction) {
    if (!transaction.items) return false;

    const query = `
      SELECT COUNT(*) as approved_count
      FROM wic_approved_items
      WHERE upc_code = ANY($1)
        AND state = $2
        AND is_active = true
    `;

    const upcCodes = transaction.items.map(item => item.upcCode);
    const result = await this.pool.query(query, [upcCodes, transaction.state]);

    return result.rows[0].approved_count === transaction.items.length;
  }

  /**
   * Verify landlord status
   */
  async verifyLandlord(payeeId) {
    const query = `
      SELECT is_approved
      FROM approved_landlords
      WHERE payee_id = $1
        AND status = 'active'
    `;

    const result = await this.pool.query(query, [payeeId]);
    return result.rows.length > 0 && result.rows[0].is_approved;
  }

  /**
   * Calculate distance between two points
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 3959; // Earth's radius in miles
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);

    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLon/2) * Math.sin(dLon/2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;

    return distance;
  }

  toRadians(degrees) {
    return degrees * (Math.PI/180);
  }

  /**
   * Log evaluation results
   */
  async logEvaluation(transaction, result) {
    const query = `
      INSERT INTO rule_evaluation_logs (
        transaction_id, program, merchant_category_code,
        amount, approved, reasons, risk_score,
        applied_rules, evaluated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
    `;

    await this.pool.query(query, [
      transaction.id,
      transaction.program,
      transaction.merchantCategoryCode,
      transaction.amount,
      result.approved,
      result.reasons,
      result.riskScore,
      JSON.stringify(result.appliedRules)
    ]);
  }

  /**
   * Populate initial rules for all programs
   */
  async populateInitialRules() {
    const rules = [];

    // Federal program rules
    for (const [program, config] of Object.entries(BusinessRuleEngine.FEDERAL_PROGRAM_RULES)) {
      if (config.allowed_mcc_codes && Array.isArray(config.allowed_mcc_codes)) {
        rules.push({
          rule_code: `${program}_MCC_WHITELIST`,
          rule_name: `${program} MCC Whitelist`,
          rule_category: 'BENEFIT',
          rule_type: 'RESTRICTION',
          benefit_program: program,
          conditions: {
            type: 'mcc_whitelist',
            allowed_mcc: config.allowed_mcc_codes
          },
          actions: {
            type: 'check_mcc',
            parameters: {
              allowed_mcc: config.allowed_mcc_codes
            }
          },
          mcc_restrictions: config.allowed_mcc_codes,
          priority: 10
        });
      }

      if (config.prohibited_mcc_codes) {
        rules.push({
          rule_code: `${program}_MCC_BLACKLIST`,
          rule_name: `${program} MCC Blacklist`,
          rule_category: 'BENEFIT',
          rule_type: 'RESTRICTION',
          benefit_program: program,
          conditions: {
            type: 'mcc_blacklist',
            prohibited_mcc: config.prohibited_mcc_codes
          },
          actions: {
            type: 'block_mcc',
            parameters: {
              prohibited_mcc: config.prohibited_mcc_codes
            }
          },
          mcc_restrictions: config.prohibited_mcc_codes,
          priority: 5
        });
      }
    }

    // State/local program rules
    for (const [program, config] of Object.entries(BusinessRuleEngine.STATE_LOCAL_PROGRAM_RULES)) {
      if (config.allowed_mcc_codes && config.allowed_mcc_codes !== 'unrestricted') {
        rules.push({
          rule_code: `${program}_MCC_WHITELIST`,
          rule_name: `${program} MCC Whitelist`,
          rule_category: 'BENEFIT',
          rule_type: 'RESTRICTION',
          benefit_program: program,
          conditions: {
            type: 'mcc_whitelist',
            allowed_mcc: config.allowed_mcc_codes
          },
          actions: {
            type: 'check_mcc',
            parameters: {
              allowed_mcc: config.allowed_mcc_codes
            }
          },
          mcc_restrictions: config.allowed_mcc_codes,
          priority: 10
        });
      }
    }

    // Insert rules into database
    for (const rule of rules) {
      await this.insertRule(rule);
    }

    logger.info('Initial rules populated', { count: rules.length });
  }

  /**
   * Insert rule into database
   */
  async insertRule(rule) {
    const query = `
      INSERT INTO business_rules (
        rule_code, rule_name, rule_category, rule_type,
        benefit_program, conditions, actions, mcc_restrictions,
        priority, is_active, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true, NOW())
      ON CONFLICT (organization_id, rule_code) DO UPDATE
      SET
        conditions = EXCLUDED.conditions,
        actions = EXCLUDED.actions,
        mcc_restrictions = EXCLUDED.mcc_restrictions,
        updated_at = NOW()
    `;

    await this.pool.query(query, [
      rule.rule_code,
      rule.rule_name,
      rule.rule_category,
      rule.rule_type,
      rule.benefit_program,
      rule.conditions,
      rule.actions,
      rule.mcc_restrictions,
      rule.priority
    ]);
  }
}

export default BusinessRuleEngine;