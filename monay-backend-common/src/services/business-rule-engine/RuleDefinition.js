/**
 * Business Rule Definition Service
 * Universal rule schema for multi-chain smart contract configuration
 * Part of Monay's patented Business Rule Engine (BRE)
 *
 * @module RuleDefinition
 */

const loggers = require('../logger');
const logger = {
  info: (msg, data) => loggers.logger ? loggers.logger.info(msg, data) : console.log(msg, data),
  error: (msg, data) => loggers.errorLogger ? loggers.errorLogger.error(msg, data) : console.error(msg, data),
  warn: (msg, data) => loggers.logger ? loggers.logger.warn(msg, data) : console.warn(msg, data),
  debug: (msg, data) => loggers.logger ? loggers.logger.debug(msg, data) : console.debug(msg, data)
};

/**
 * Universal Business Rule Schema
 * Chain-agnostic rule definition that can be compiled to any blockchain
 */
class RuleDefinition {
  constructor() {
    this.ruleCategories = {
      TRANSACTION: 'transaction',
      COMPLIANCE: 'compliance',
      SECURITY: 'security',
      WALLET: 'wallet',
      TOKEN: 'token'
    };

    this.operators = {
      EQUALS: 'equals',
      GREATER: 'greater',
      LESS: 'less',
      CONTAINS: 'contains',
      IN: 'in',
      BETWEEN: 'between',
      REGEX: 'regex'
    };

    this.actions = {
      ALLOW: 'allow',
      DENY: 'deny',
      HOLD: 'hold',
      REQUIRE_ATTESTATION: 'require_attestation',
      NOTIFY: 'notify',
      LOG: 'log'
    };
  }

  /**
   * Create a new business rule with chain-agnostic definition
   * @param {Object} ruleConfig - Rule configuration
   * @returns {Object} Formatted business rule
   */
  createRule(ruleConfig) {
    const rule = {
      id: this.generateRuleId(),
      name: ruleConfig.name,
      description: ruleConfig.description,
      category: ruleConfig.category || this.ruleCategories.TRANSACTION,
      priority: ruleConfig.priority || 50, // 0-100 scale
      enabled: ruleConfig.enabled !== false,
      conditions: this.formatConditions(ruleConfig.conditions),
      actions: this.formatActions(ruleConfig.actions),
      chains: ruleConfig.chains || ['all'],
      metadata: {
        version: '1.0.0',
        author: ruleConfig.author || 'system',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        jurisdiction: ruleConfig.jurisdiction || [],
        tags: ruleConfig.tags || []
      },
      chainSpecific: ruleConfig.chainSpecific || {}
    };

    logger.info('Business rule created', { ruleId: rule.id, name: rule.name });
    return rule;
  }

  /**
   * Format conditions for universal compatibility
   * @param {Array} conditions - Raw conditions
   * @returns {Array} Formatted conditions
   */
  formatConditions(conditions = []) {
    return conditions.map(condition => ({
      field: condition.field,
      operator: condition.operator || this.operators.EQUALS,
      value: condition.value,
      dataType: condition.dataType || 'string',
      chainSpecific: condition.chainSpecific || {},
      logic: condition.logic || 'AND' // AND/OR for multiple conditions
    }));
  }

  /**
   * Format actions for universal execution
   * @param {Array} actions - Raw actions
   * @returns {Array} Formatted actions
   */
  formatActions(actions = []) {
    return actions.map(action => ({
      type: action.type || this.actions.ALLOW,
      parameters: action.parameters || {},
      message: action.message,
      severity: action.severity || 'info', // info, warning, error, critical
      chainSpecific: action.chainSpecific || {}
    }));
  }

  /**
   * Invoice-specific business rules
   * Pre-defined rules for invoice-first wallet generation
   */
  getInvoiceRules() {
    return {
      compliance: {
        kycRequired: this.createRule({
          name: 'KYC Required for High-Value Invoices',
          description: 'Require KYC verification for invoices over $10,000',
          category: this.ruleCategories.COMPLIANCE,
          priority: 90,
          conditions: [
            {
              field: 'invoice.amount',
              operator: this.operators.GREATER,
              value: 10000,
              dataType: 'number'
            }
          ],
          actions: [
            {
              type: this.actions.REQUIRE_ATTESTATION,
              parameters: { attestationType: 'kyc' },
              message: 'KYC verification required for this transaction amount'
            }
          ]
        }),

        amlScreening: this.createRule({
          name: 'AML Screening for High-Risk',
          description: 'Perform AML screening for high-risk transactions',
          category: this.ruleCategories.COMPLIANCE,
          priority: 85,
          conditions: [
            {
              field: 'customer.riskScore',
              operator: this.operators.GREATER,
              value: 70,
              dataType: 'number'
            }
          ],
          actions: [
            {
              type: this.actions.HOLD,
              parameters: { screeningType: 'aml' },
              message: 'Transaction held for AML screening'
            }
          ]
        }),

        taxReporting: this.createRule({
          name: 'Tax Reporting Threshold',
          description: 'Flag transactions for tax reporting',
          category: this.ruleCategories.COMPLIANCE,
          priority: 60,
          conditions: [
            {
              field: 'invoice.amount',
              operator: this.operators.GREATER,
              value: 600,
              dataType: 'number'
            },
            {
              field: 'invoice.type',
              operator: this.operators.EQUALS,
              value: 'service',
              logic: 'AND'
            }
          ],
          actions: [
            {
              type: this.actions.LOG,
              parameters: { reportType: '1099' },
              message: 'Transaction flagged for tax reporting'
            }
          ]
        })
      },

      walletMode: {
        ephemeralHighRisk: this.createRule({
          name: 'Ephemeral Wallet for High Risk',
          description: 'Use ephemeral wallets for high-risk or one-time customers',
          category: this.ruleCategories.WALLET,
          priority: 80,
          conditions: [
            {
              field: 'customer.riskScore',
              operator: this.operators.GREATER,
              value: 80,
              dataType: 'number'
            }
          ],
          actions: [
            {
              type: 'set_wallet_mode',
              parameters: { mode: 'ephemeral', ttl: 86400 },
              message: 'Ephemeral wallet recommended for high-risk transaction'
            }
          ]
        }),

        persistentLowRisk: this.createRule({
          name: 'Persistent Wallet for Trusted Customers',
          description: 'Use persistent wallets for recurring, low-risk customers',
          category: this.ruleCategories.WALLET,
          priority: 75,
          conditions: [
            {
              field: 'customer.isRecurring',
              operator: this.operators.EQUALS,
              value: true,
              dataType: 'boolean'
            },
            {
              field: 'customer.riskScore',
              operator: this.operators.LESS,
              value: 30,
              dataType: 'number',
              logic: 'AND'
            }
          ],
          actions: [
            {
              type: 'set_wallet_mode',
              parameters: { mode: 'persistent' },
              message: 'Persistent wallet recommended for trusted customer'
            }
          ]
        }),

        adaptiveDefault: this.createRule({
          name: 'Adaptive Wallet Default',
          description: 'Use adaptive wallet for medium-risk transactions',
          category: this.ruleCategories.WALLET,
          priority: 50,
          conditions: [
            {
              field: 'customer.riskScore',
              operator: this.operators.BETWEEN,
              value: [30, 80],
              dataType: 'number'
            }
          ],
          actions: [
            {
              type: 'set_wallet_mode',
              parameters: { mode: 'adaptive' },
              message: 'Adaptive wallet selected for flexible management'
            }
          ]
        })
      },

      smartContract: {
        spendLimit: this.createRule({
          name: 'Daily Spend Limit',
          description: 'Enforce daily spending limits on wallets',
          category: this.ruleCategories.SECURITY,
          priority: 70,
          conditions: [
            {
              field: 'wallet.dailySpend',
              operator: this.operators.GREATER,
              value: 'wallet.dailyLimit',
              dataType: 'reference'
            }
          ],
          actions: [
            {
              type: this.actions.DENY,
              parameters: { resetTime: '00:00 UTC' },
              message: 'Daily spending limit exceeded'
            }
          ],
          chainSpecific: {
            evm: {
              contractMethod: 'enforceSpendLimit',
              gasLimit: 100000
            },
            solana: {
              programInstruction: 'spend_limit_check',
              computeUnits: 50000
            }
          }
        }),

        velocityCheck: this.createRule({
          name: 'Transaction Velocity Check',
          description: 'Limit transaction frequency',
          category: this.ruleCategories.SECURITY,
          priority: 65,
          conditions: [
            {
              field: 'wallet.transactionsPerHour',
              operator: this.operators.GREATER,
              value: 10,
              dataType: 'number'
            }
          ],
          actions: [
            {
              type: this.actions.HOLD,
              parameters: { cooldownPeriod: 3600 },
              message: 'Transaction rate limit exceeded'
            }
          ]
        }),

        geoRestriction: this.createRule({
          name: 'Geographic Restriction',
          description: 'Restrict transactions from certain countries',
          category: this.ruleCategories.COMPLIANCE,
          priority: 95,
          conditions: [
            {
              field: 'transaction.originCountry',
              operator: this.operators.IN,
              value: ['sanctioned_countries'],
              dataType: 'array'
            }
          ],
          actions: [
            {
              type: this.actions.DENY,
              parameters: { reportToCompliance: true },
              message: 'Transaction blocked due to geographic restrictions'
            }
          ]
        })
      }
    };
  }

  /**
   * Generate unique rule ID
   * @returns {string} UUID for rule
   */
  generateRuleId() {
    return `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Validate rule structure
   * @param {Object} rule - Rule to validate
   * @returns {Object} Validation result
   */
  validateRule(rule) {
    const errors = [];

    if (!rule.name) errors.push('Rule name is required');
    if (!rule.category) errors.push('Rule category is required');
    if (!rule.conditions || rule.conditions.length === 0) {
      errors.push('At least one condition is required');
    }
    if (!rule.actions || rule.actions.length === 0) {
      errors.push('At least one action is required');
    }
    if (rule.priority && (rule.priority < 0 || rule.priority > 100)) {
      errors.push('Priority must be between 0 and 100');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Merge rules with conflict resolution
   * @param {Array} rules - Array of rules
   * @returns {Array} Merged rules with conflicts resolved
   */
  mergeRules(rules) {
    // Sort by priority (higher priority first)
    const sortedRules = rules.sort((a, b) => b.priority - a.priority);

    // Group by category for efficient evaluation
    const groupedRules = {};
    sortedRules.forEach(rule => {
      if (!groupedRules[rule.category]) {
        groupedRules[rule.category] = [];
      }
      groupedRules[rule.category].push(rule);
    });

    return groupedRules;
  }
}

export default new RuleDefinition();