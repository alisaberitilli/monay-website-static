/**
 * Business Rule Evaluator Service
 * Runtime evaluation of business rules for invoice-first wallet decisions
 * Part of Monay's patented Business Rule Engine (BRE)
 *
 * @module RuleEvaluator
 */

const loggers = require('../logger');
const logger = {
  info: (msg, data) => loggers.logger ? loggers.logger.info(msg, data) : console.log(msg, data),
  error: (msg, data) => loggers.errorLogger ? loggers.errorLogger.error(msg, data) : console.error(msg, data),
  warn: (msg, data) => loggers.logger ? loggers.logger.warn(msg, data) : console.warn(msg, data),
  debug: (msg, data) => loggers.logger ? loggers.logger.debug(msg, data) : console.debug(msg, data)
};

/**
 * Rule Evaluator for runtime decision making
 * Evaluates chain-agnostic rules against transaction context
 */
class RuleEvaluator {
  constructor() {
    this.operatorFunctions = {
      equals: (a, b) => a === b,
      greater: (a, b) => a > b,
      less: (a, b) => a < b,
      contains: (a, b) => Array.isArray(a) ? a.includes(b) : String(a).includes(b),
      in: (a, b) => Array.isArray(b) ? b.includes(a) : false,
      between: (a, b) => Array.isArray(b) && b.length === 2 ? a >= b[0] && a <= b[1] : false,
      regex: (a, b) => new RegExp(b).test(String(a))
    };

    this.cache = new Map(); // Cache evaluation results
    this.cacheExpiry = 300000; // 5 minutes
  }

  /**
   * Evaluate multiple rules against context
   * @param {Array} rules - Rules to evaluate
   * @param {Object} context - Transaction/invoice context
   * @returns {Promise<Array>} Evaluation results
   */
  async evaluateRules(rules, context) {
    const results = [];

    // Sort rules by priority (higher first)
    const sortedRules = rules.sort((a, b) => (b.priority || 0) - (a.priority || 0));

    for (const rule of sortedRules) {
      if (!rule.enabled) continue;

      const result = await this.evaluateRule(rule, context);
      results.push(result);

      // Stop on first match for exclusive rules
      if (result.triggered && rule.exclusive) {
        break;
      }
    }

    return results;
  }

  /**
   * Evaluate single rule against context
   * @param {Object} rule - Rule to evaluate
   * @param {Object} context - Evaluation context
   * @returns {Promise<Object>} Evaluation result
   */
  async evaluateRule(rule, context) {
    const startTime = Date.now();

    try {
      // Check cache
      const cacheKey = this.getCacheKey(rule, context);
      const cached = this.getCachedResult(cacheKey);
      if (cached) {
        logger.debug('Rule evaluation cache hit', { ruleId: rule.id });
        return cached;
      }

      // Evaluate all conditions
      const conditionResults = await this.evaluateConditions(rule.conditions, context);

      // Determine if rule triggers
      const triggered = this.determineRuleTrigger(conditionResults, rule.conditions);

      const result = {
        ruleId: rule.id,
        ruleName: rule.name,
        triggered,
        conditions: conditionResults,
        actions: triggered ? rule.actions : [],
        evaluationTime: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };

      // Cache result
      this.cacheResult(cacheKey, result);

      logger.info('Rule evaluated', {
        ruleId: rule.id,
        triggered,
        time: result.evaluationTime
      });

      return result;
    } catch (error) {
      logger.error('Rule evaluation failed', {
        ruleId: rule.id,
        error: error.message
      });

      return {
        ruleId: rule.id,
        ruleName: rule.name,
        triggered: false,
        error: error.message,
        evaluationTime: Date.now() - startTime
      };
    }
  }

  /**
   * Evaluate rule conditions
   * @param {Array} conditions - Conditions to evaluate
   * @param {Object} context - Evaluation context
   * @returns {Promise<Array>} Condition results
   */
  async evaluateConditions(conditions = [], context) {
    const results = [];

    for (const condition of conditions) {
      const fieldValue = this.getFieldValue(condition.field, context);
      const compareValue = this.resolveValue(condition.value, context, condition.dataType);

      const operatorFunc = this.operatorFunctions[condition.operator];
      if (!operatorFunc) {
        logger.warn('Unknown operator', { operator: condition.operator });
        results.push({ ...condition, result: false });
        continue;
      }

      const result = operatorFunc(fieldValue, compareValue);
      results.push({
        ...condition,
        fieldValue,
        compareValue,
        result
      });
    }

    return results;
  }

  /**
   * Get field value from nested context object
   * @param {string} field - Field path (e.g., 'invoice.amount')
   * @param {Object} context - Context object
   * @returns {*} Field value
   */
  getFieldValue(field, context) {
    const parts = field.split('.');
    let value = context;

    for (const part of parts) {
      if (value === null || value === undefined) {
        return undefined;
      }
      value = value[part];
    }

    return value;
  }

  /**
   * Resolve value (handle references and type conversion)
   * @param {*} value - Value to resolve
   * @param {Object} context - Context for reference resolution
   * @param {string} dataType - Expected data type
   * @returns {*} Resolved value
   */
  resolveValue(value, context, dataType) {
    // Handle reference values (e.g., 'wallet.dailyLimit')
    if (dataType === 'reference' && typeof value === 'string') {
      return this.getFieldValue(value, context);
    }

    // Handle array lookups (e.g., sanctioned_countries list)
    if (Array.isArray(value) && value.length === 1 && typeof value[0] === 'string') {
      const listName = value[0];
      if (listName === 'sanctioned_countries') {
        return this.getSanctionedCountries();
      }
    }

    // Type conversion
    switch (dataType) {
      case 'number':
        return Number(value);
      case 'boolean':
        return Boolean(value);
      case 'date':
        return new Date(value);
      default:
        return value;
    }
  }

  /**
   * Determine if rule triggers based on condition results
   * @param {Array} results - Condition evaluation results
   * @param {Array} conditions - Original conditions with logic operators
   * @returns {boolean} Whether rule triggers
   */
  determineRuleTrigger(results, conditions) {
    if (results.length === 0) return false;

    let triggered = results[0].result;

    for (let i = 1; i < results.length; i++) {
      const logic = conditions[i].logic || 'AND';

      if (logic === 'AND') {
        triggered = triggered && results[i].result;
      } else if (logic === 'OR') {
        triggered = triggered || results[i].result;
      }
    }

    return triggered;
  }

  /**
   * Get cache key for rule evaluation
   * @param {Object} rule - Rule being evaluated
   * @param {Object} context - Evaluation context
   * @returns {string} Cache key
   */
  getCacheKey(rule, context) {
    const contextHash = this.hashObject({
      invoice: context.invoice,
      customer: context.customer
    });
    return `${rule.id}_${contextHash}`;
  }

  /**
   * Simple object hash for caching
   * @param {Object} obj - Object to hash
   * @returns {string} Hash string
   */
  hashObject(obj) {
    return JSON.stringify(obj)
      .split('')
      .reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
      }, 0)
      .toString(36);
  }

  /**
   * Get cached result if valid
   * @param {string} key - Cache key
   * @returns {Object|null} Cached result or null
   */
  getCachedResult(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > this.cacheExpiry) {
      this.cache.delete(key);
      return null;
    }

    return cached.result;
  }

  /**
   * Cache evaluation result
   * @param {string} key - Cache key
   * @param {Object} result - Result to cache
   */
  cacheResult(key, result) {
    this.cache.set(key, {
      result,
      timestamp: Date.now()
    });
  }

  /**
   * Get list of sanctioned countries
   * @returns {Array} Sanctioned countries list
   */
  getSanctionedCountries() {
    // OFAC sanctioned countries (simplified list)
    return [
      'IR', // Iran
      'KP', // North Korea
      'SY', // Syria
      'CU', // Cuba
      'VE', // Venezuela
      'RU', // Russia (partial sanctions)
      'BY', // Belarus
      'MM'  // Myanmar
    ];
  }

  /**
   * Evaluate compliance rules for a transaction
   * @param {Object} transaction - Transaction details
   * @returns {Promise<Object>} Compliance evaluation result
   */
  async evaluateCompliance(transaction) {
    const RuleDefinition = require('./RuleDefinition');
    const rules = RuleDefinition.getInvoiceRules().compliance;

    const context = {
      invoice: transaction.invoice,
      customer: transaction.customer,
      transaction: transaction
    };

    const results = await this.evaluateRules(Object.values(rules), context);

    const violations = results.filter(r => r.triggered);
    const requiresReview = violations.some(v =>
      v.actions.some(a => a.type === 'hold' || a.type === 'require_attestation')
    );

    return {
      compliant: violations.length === 0,
      violations,
      requiresReview,
      recommendations: this.generateComplianceRecommendations(violations)
    };
  }

  /**
   * Generate compliance recommendations based on violations
   * @param {Array} violations - Rule violations
   * @returns {Array} Recommendations
   */
  generateComplianceRecommendations(violations) {
    const recommendations = [];

    for (const violation of violations) {
      for (const action of violation.actions) {
        if (action.type === 'require_attestation') {
          recommendations.push({
            type: 'attestation',
            requirement: action.parameters.attestationType,
            message: action.message,
            priority: 'high'
          });
        } else if (action.type === 'hold') {
          recommendations.push({
            type: 'review',
            requirement: action.parameters.screeningType,
            message: action.message,
            priority: 'critical'
          });
        } else if (action.type === 'log') {
          recommendations.push({
            type: 'reporting',
            requirement: action.parameters.reportType,
            message: action.message,
            priority: 'medium'
          });
        }
      }
    }

    return recommendations;
  }

  /**
   * Clear evaluation cache
   */
  clearCache() {
    this.cache.clear();
    logger.info('Rule evaluation cache cleared');
  }

  /**
   * Get evaluation metrics
   * @returns {Object} Metrics
   */
  getMetrics() {
    return {
      cacheSize: this.cache.size,
      cacheExpiry: this.cacheExpiry,
      supportedOperators: Object.keys(this.operatorFunctions),
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = new RuleEvaluator();