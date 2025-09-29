/**
 * CapitalMarketsTemplates - Predefined rule templates for capital markets operations
 * @module services/capital-markets/CapitalMarketsTemplates
 */

import { v4 as uuidv4 } from 'uuid';

/**
 * Capital Markets Templates Service
 * Provides predefined rule configurations for common trading scenarios
 */
class CapitalMarketsTemplates {
  constructor() {
    this.templates = this.initializeTemplates();
  }

  /**
   * Initialize all available capital markets templates
   * @returns {Map} Template configurations
   */
  initializeTemplates() {
    const templates = new Map();

    // Equity Trading Template
    templates.set('equity_trading_basic', {
      id: 'equity_trading_basic',
      name: 'Basic Equity Trading',
      description: 'Standard rules for equity trading compliance',
      category: 'EQUITY',
      version: '1.0.0',
      rules: [
        {
          id: 'accredited_investor_check',
          name: 'Accredited Investor Verification',
          category: 'COMPLIANCE',
          condition: {
            type: 'INVESTOR_STATUS',
            operator: 'IN',
            value: ['ACCREDITED', 'QUALIFIED_INSTITUTIONAL']
          },
          action: {
            type: 'ALLOW',
            message: 'Investor verification passed'
          },
          priority: 100
        },
        {
          id: 'trading_hours_enforcement',
          name: 'Trading Hours Enforcement',
          category: 'TRANSACTION',
          condition: {
            type: 'TIME_RANGE',
            operator: 'BETWEEN',
            value: {
              start: '09:30',
              end: '16:00',
              timezone: 'America/New_York',
              days: [1, 2, 3, 4, 5] // Monday to Friday
            }
          },
          action: {
            type: 'ALLOW',
            message: 'Trade executed within market hours'
          },
          priority: 90
        },
        {
          id: 'pattern_day_trader',
          name: 'Pattern Day Trader Rule',
          category: 'COMPLIANCE',
          condition: {
            type: 'ACCOUNT_BALANCE',
            operator: 'GTE',
            value: 25000
          },
          action: {
            type: 'ALLOW',
            message: 'PDT requirements met'
          },
          priority: 85
        },
        {
          id: 'reg_t_margin',
          name: 'Regulation T Margin Requirements',
          category: 'TRANSACTION',
          condition: {
            type: 'MARGIN_RATIO',
            operator: 'GTE',
            value: 0.5 // 50% margin requirement
          },
          action: {
            type: 'ALLOW',
            message: 'Margin requirements satisfied'
          },
          priority: 80
        },
        {
          id: 'short_sale_restriction',
          name: 'Short Sale Restriction (SSR)',
          category: 'TRANSACTION',
          condition: {
            type: 'PRICE_MOVEMENT',
            operator: 'LT',
            value: -0.10 // 10% decline triggers SSR
          },
          action: {
            type: 'RESTRICT',
            message: 'Short sale restrictions apply',
            restrictions: ['NO_SHORT_BELOW_BID']
          },
          priority: 75
        }
      ],
      configuration: {
        min_account_balance: 25000,
        margin_requirement: 0.5,
        trading_hours: {
          start: '09:30',
          end: '16:00',
          timezone: 'America/New_York'
        },
        max_daily_trades: 4,
        settlement: 'T+2'
      },
      compliance_standards: ['SEC Rule 15c3-1', 'FINRA Rule 4210', 'Reg T']
    });

    // Fixed Income Institutional Template
    templates.set('fixed_income_institutional', {
      id: 'fixed_income_institutional',
      name: 'Fixed Income Institutional',
      description: 'Rules for institutional bond trading',
      category: 'FIXED_INCOME',
      version: '1.0.0',
      rules: [
        {
          id: 'qib_verification',
          name: 'Qualified Institutional Buyer Verification',
          category: 'COMPLIANCE',
          condition: {
            type: 'INVESTOR_STATUS',
            operator: 'EQUALS',
            value: 'QUALIFIED_INSTITUTIONAL_BUYER'
          },
          action: {
            type: 'ALLOW',
            message: 'QIB status verified'
          },
          priority: 100
        },
        {
          id: 'minimum_denomination',
          name: 'Minimum Denomination Check',
          category: 'TRANSACTION',
          condition: {
            type: 'TRADE_SIZE',
            operator: 'GTE',
            value: 100000 // $100,000 minimum
          },
          action: {
            type: 'ALLOW',
            message: 'Minimum denomination met'
          },
          priority: 95
        },
        {
          id: 'settlement_t_plus_one',
          name: 'T+1 Settlement Rule',
          category: 'TRANSACTION',
          condition: {
            type: 'SETTLEMENT_DATE',
            operator: 'EQUALS',
            value: 'T+1'
          },
          action: {
            type: 'PROCESS',
            message: 'Settlement scheduled for T+1'
          },
          priority: 90
        },
        {
          id: 'accrued_interest',
          name: 'Accrued Interest Calculation',
          category: 'TRANSACTION',
          condition: {
            type: 'BOND_TYPE',
            operator: 'IN',
            value: ['CORPORATE', 'MUNICIPAL', 'TREASURY']
          },
          action: {
            type: 'CALCULATE',
            message: 'Calculate accrued interest',
            formula: 'FACE_VALUE * COUPON_RATE * DAYS_SINCE_LAST_PAYMENT / 360'
          },
          priority: 85
        },
        {
          id: 'trace_reporting',
          name: 'TRACE Reporting Requirement',
          category: 'COMPLIANCE',
          condition: {
            type: 'BOND_TYPE',
            operator: 'IN',
            value: ['CORPORATE', 'AGENCY']
          },
          action: {
            type: 'REPORT',
            message: 'Report to TRACE within 15 minutes',
            system: 'TRACE',
            timeframe: 900 // 15 minutes in seconds
          },
          priority: 80
        }
      ],
      configuration: {
        min_denomination: 100000,
        settlement_days: 1,
        accrual_basis: '30/360',
        price_precision: 3,
        yield_precision: 3
      },
      compliance_standards: ['Rule 144A', 'MSRB Rule G-14', 'FINRA TRACE']
    });

    // Private Securities Reg D Template
    templates.set('private_securities_reg_d', {
      id: 'private_securities_reg_d',
      name: 'Private Securities Reg D',
      description: 'Reg D compliance for private placements',
      category: 'PRIVATE_SECURITIES',
      version: '1.0.0',
      rules: [
        {
          id: 'reg_d_compliance',
          name: 'Regulation D Compliance',
          category: 'COMPLIANCE',
          condition: {
            type: 'OFFERING_TYPE',
            operator: 'IN',
            value: ['506b', '506c']
          },
          action: {
            type: 'VERIFY',
            message: 'Verify Reg D compliance',
            requirements: ['ACCREDITATION', 'SUITABILITY']
          },
          priority: 100
        },
        {
          id: 'lockup_period',
          name: 'Lock-up Period Enforcement',
          category: 'WALLET',
          condition: {
            type: 'HOLDING_PERIOD',
            operator: 'LT',
            value: 180 // 180 days
          },
          action: {
            type: 'RESTRICT',
            message: 'Securities in lock-up period',
            restrictions: ['NO_TRANSFER', 'NO_SALE']
          },
          priority: 95
        },
        {
          id: 'transfer_restrictions',
          name: 'Transfer Restrictions',
          category: 'SECURITY',
          condition: {
            type: 'RECIPIENT_STATUS',
            operator: 'NOT_IN',
            value: ['ACCREDITED', 'QUALIFIED_PURCHASER']
          },
          action: {
            type: 'DENY',
            message: 'Transfer restricted to qualified investors only'
          },
          priority: 90
        },
        {
          id: 'qualified_purchaser',
          name: 'Qualified Purchaser Verification',
          category: 'COMPLIANCE',
          condition: {
            type: 'NET_WORTH',
            operator: 'GTE',
            value: 5000000 // $5 million for qualified purchaser
          },
          action: {
            type: 'ALLOW',
            message: 'Qualified purchaser status verified'
          },
          priority: 85
        },
        {
          id: 'max_non_accredited',
          name: 'Maximum Non-Accredited Investors',
          category: 'COMPLIANCE',
          condition: {
            type: 'NON_ACCREDITED_COUNT',
            operator: 'LTE',
            value: 35
          },
          action: {
            type: 'ALLOW',
            message: 'Non-accredited investor limit not exceeded'
          },
          priority: 80
        }
      ],
      configuration: {
        lockup_days: 180,
        max_non_accredited: 35,
        min_investment: 25000,
        transfer_restrictions: true,
        offering_types: ['506b', '506c']
      },
      compliance_standards: ['SEC Regulation D', 'Rule 144', 'Rule 501-508']
    });

    // Derivatives Options Template
    templates.set('derivatives_options', {
      id: 'derivatives_options',
      name: 'Options Trading',
      description: 'Rules for options trading',
      category: 'DERIVATIVES',
      version: '1.0.0',
      rules: [
        {
          id: 'options_level_check',
          name: 'Options Trading Level Verification',
          category: 'COMPLIANCE',
          condition: {
            type: 'OPTIONS_LEVEL',
            operator: 'GTE',
            value: 2 // Level 2 or higher
          },
          action: {
            type: 'ALLOW',
            message: 'Options trading level approved'
          },
          priority: 100
        },
        {
          id: 'margin_requirements',
          name: 'Options Margin Requirements',
          category: 'TRANSACTION',
          condition: {
            type: 'MARGIN_COVERAGE',
            operator: 'GTE',
            value: 0.20 // 20% margin requirement
          },
          action: {
            type: 'ALLOW',
            message: 'Margin requirements met'
          },
          priority: 95
        },
        {
          id: 'position_limits',
          name: 'Position Limits',
          category: 'TRANSACTION',
          condition: {
            type: 'POSITION_SIZE',
            operator: 'LTE',
            value: 1000 // Max 1000 contracts
          },
          action: {
            type: 'ALLOW',
            message: 'Within position limits'
          },
          priority: 90
        },
        {
          id: 'exercise_rules',
          name: 'Options Exercise Rules',
          category: 'TRANSACTION',
          condition: {
            type: 'OPTION_TYPE',
            operator: 'IN',
            value: ['AMERICAN', 'EUROPEAN']
          },
          action: {
            type: 'PROCESS',
            message: 'Exercise rules applied',
            rules: {
              AMERICAN: 'Can exercise any time before expiry',
              EUROPEAN: 'Can exercise only at expiry'
            }
          },
          priority: 85
        },
        {
          id: 'automatic_exercise',
          name: 'Automatic Exercise',
          category: 'TRANSACTION',
          condition: {
            type: 'IN_THE_MONEY',
            operator: 'GTE',
            value: 0.01 // $0.01 or more ITM
          },
          action: {
            type: 'AUTO_EXERCISE',
            message: 'Option will be automatically exercised at expiry'
          },
          priority: 80
        }
      ],
      configuration: {
        max_position_size: 1000,
        margin_requirement: 0.20,
        auto_exercise_threshold: 0.01,
        options_levels: {
          1: 'Covered calls and protective puts',
          2: 'Long calls and puts',
          3: 'Spreads',
          4: 'Naked options'
        }
      },
      compliance_standards: ['CBOE Rules', 'OCC Rules', 'FINRA Rule 2360']
    });

    // Hybrid Multi-Asset Template
    templates.set('hybrid_multi_asset', {
      id: 'hybrid_multi_asset',
      name: 'Hybrid Multi-Asset',
      description: 'Combined rules for multiple asset classes',
      category: 'HYBRID',
      version: '1.0.0',
      rules: [
        {
          id: 'portfolio_diversification',
          name: 'Portfolio Diversification',
          category: 'WALLET',
          condition: {
            type: 'CONCENTRATION',
            operator: 'LTE',
            value: 0.20 // No single position > 20%
          },
          action: {
            type: 'ALLOW',
            message: 'Portfolio diversification maintained'
          },
          priority: 100
        },
        {
          id: 'risk_management',
          name: 'Risk Management',
          category: 'SECURITY',
          condition: {
            type: 'VAR_LIMIT', // Value at Risk
            operator: 'LTE',
            value: 0.05 // 5% VaR limit
          },
          action: {
            type: 'ALLOW',
            message: 'Within risk limits'
          },
          priority: 95
        },
        {
          id: 'cross_asset_netting',
          name: 'Cross-Asset Netting',
          category: 'TRANSACTION',
          condition: {
            type: 'NETTING_ELIGIBLE',
            operator: 'EQUALS',
            value: true
          },
          action: {
            type: 'NET_POSITIONS',
            message: 'Cross-asset netting applied'
          },
          priority: 90
        },
        {
          id: 'regulatory_capital',
          name: 'Regulatory Capital Requirements',
          category: 'COMPLIANCE',
          condition: {
            type: 'CAPITAL_RATIO',
            operator: 'GTE',
            value: 0.08 // 8% capital ratio
          },
          action: {
            type: 'ALLOW',
            message: 'Capital requirements satisfied'
          },
          priority: 85
        },
        {
          id: 'liquidity_coverage',
          name: 'Liquidity Coverage Ratio',
          category: 'TOKEN',
          condition: {
            type: 'LCR',
            operator: 'GTE',
            value: 1.0 // 100% LCR
          },
          action: {
            type: 'ALLOW',
            message: 'Liquidity requirements met'
          },
          priority: 80
        }
      ],
      configuration: {
        max_concentration: 0.20,
        var_limit: 0.05,
        capital_ratio: 0.08,
        lcr_requirement: 1.0,
        asset_classes: ['EQUITY', 'FIXED_INCOME', 'DERIVATIVES', 'COMMODITIES']
      },
      compliance_standards: ['Basel III', 'Dodd-Frank', 'MiFID II']
    });

    // Commodities Trading Template
    templates.set('commodities_trading', {
      id: 'commodities_trading',
      name: 'Commodities Trading',
      description: 'Rules for commodity futures and spot trading',
      category: 'HYBRID',
      version: '1.0.0',
      rules: [
        {
          id: 'position_limits_commodities',
          name: 'Commodity Position Limits',
          category: 'TRANSACTION',
          condition: {
            type: 'POSITION_SIZE',
            operator: 'LTE',
            value: 5000 // Contract limit
          },
          action: {
            type: 'ALLOW',
            message: 'Within CFTC position limits'
          },
          priority: 100
        },
        {
          id: 'daily_price_limits',
          name: 'Daily Price Limits',
          category: 'SECURITY',
          condition: {
            type: 'PRICE_MOVEMENT',
            operator: 'BETWEEN',
            value: [-0.07, 0.07] // ±7% daily limit
          },
          action: {
            type: 'ALLOW',
            message: 'Within daily price limits'
          },
          priority: 95
        },
        {
          id: 'delivery_requirements',
          name: 'Physical Delivery Requirements',
          category: 'WALLET',
          condition: {
            type: 'DELIVERY_INTENT',
            operator: 'EQUALS',
            value: true
          },
          action: {
            type: 'VERIFY_STORAGE',
            message: 'Verify storage and delivery capability'
          },
          priority: 90
        }
      ],
      configuration: {
        position_limits: 5000,
        daily_price_limit: 0.07,
        initial_margin: 0.10,
        maintenance_margin: 0.075,
        delivery_months: ['F', 'G', 'H', 'J', 'K', 'M', 'N', 'Q', 'U', 'V', 'X', 'Z']
      },
      compliance_standards: ['CFTC Rules', 'ICE Rules', 'CME Rules']
    });

    return templates;
  }

  /**
   * Get a specific template by ID
   * @param {string} templateId - Template identifier
   * @returns {Object|null} Template configuration
   */
  getTemplate(templateId) {
    return this.templates.get(templateId) || null;
  }

  /**
   * List all available templates
   * @param {Object} filters - Optional filters
   * @returns {Array} List of templates
   */
  listTemplates(filters = {}) {
    let templates = Array.from(this.templates.values());

    if (filters.category) {
      templates = templates.filter(t => t.category === filters.category);
    }

    if (filters.version) {
      templates = templates.filter(t => t.version === filters.version);
    }

    return templates;
  }

  /**
   * Apply a template to create rules
   * @param {string} templateId - Template to apply
   * @param {Object} customization - Custom parameters
   * @returns {Object} Generated rules and configuration
   */
  applyTemplate(templateId, customization = {}) {
    const template = this.getTemplate(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    // Deep clone template
    const applied = JSON.parse(JSON.stringify(template));

    // Apply customizations
    if (customization.configuration) {
      applied.configuration = {
        ...applied.configuration,
        ...customization.configuration
      };
    }

    // Update rule parameters if provided
    if (customization.ruleOverrides) {
      applied.rules = applied.rules.map(rule => {
        const override = customization.ruleOverrides[rule.id];
        if (override) {
          return {
            ...rule,
            ...override
          };
        }
        return rule;
      });
    }

    // Generate unique IDs for actual deployment
    applied.rules = applied.rules.map(rule => ({
      ...rule,
      deploymentId: uuidv4()
    }));

    return applied;
  }

  /**
   * Validate template compatibility with chain
   * @param {string} templateId - Template to validate
   * @param {string} chain - Target blockchain (evm/solana)
   * @returns {Object} Validation result
   */
  validateChainCompatibility(templateId, chain) {
    const template = this.getTemplate(templateId);
    if (!template) {
      return { valid: false, error: 'Template not found' };
    }

    const compatibility = {
      evm: ['EQUITY', 'FIXED_INCOME', 'PRIVATE_SECURITIES', 'HYBRID'],
      solana: ['EQUITY', 'DERIVATIVES', 'HYBRID']
    };

    const isCompatible = compatibility[chain]?.includes(template.category);

    return {
      valid: isCompatible,
      message: isCompatible 
        ? `Template ${templateId} is compatible with ${chain}`
        : `Template category ${template.category} is not optimized for ${chain}`,
      recommendations: isCompatible ? [] : compatibility[chain]
    };
  }

  /**
   * Get template recommendations based on requirements
   * @param {Object} requirements - User requirements
   * @returns {Array} Recommended templates
   */
  getRecommendations(requirements) {
    const recommendations = [];

    for (const [id, template] of this.templates) {
      let score = 0;

      // Check category match
      if (requirements.assetClass === template.category) {
        score += 50;
      }

      // Check compliance standards
      if (requirements.complianceStandards) {
        const matches = template.compliance_standards.filter(std =>
          requirements.complianceStandards.includes(std)
        ).length;
        score += matches * 10;
      }

      // Check configuration alignment
      if (requirements.minInvestment && template.configuration.min_investment) {
        if (requirements.minInvestment >= template.configuration.min_investment) {
          score += 20;
        }
      }

      if (score > 0) {
        recommendations.push({
          template,
          score,
          reasoning: this.generateRecommendationReason(template, requirements)
        });
      }
    }

    // Sort by score descending
    return recommendations.sort((a, b) => b.score - a.score);
  }

  /**
   * Generate recommendation reasoning
   * @param {Object} template - Template configuration
   * @param {Object} requirements - User requirements
   * @returns {string} Recommendation reason
   */
  generateRecommendationReason(template, requirements) {
    const reasons = [];

    if (requirements.assetClass === template.category) {
      reasons.push(`Matches ${requirements.assetClass} asset class`);
    }

    if (requirements.complianceStandards) {
      const matches = template.compliance_standards.filter(std =>
        requirements.complianceStandards.includes(std)
      );
      if (matches.length > 0) {
        reasons.push(`Supports ${matches.join(', ')}`);
      }
    }

    if (requirements.tradingVolume && template.configuration.max_position_size) {
      reasons.push(`Handles trading volume requirements`);
    }

    return reasons.join('. ') || 'General compatibility';
  }
}

export default new CapitalMarketsTemplates();