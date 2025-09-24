/**
 * RuleValidator - Validates capital markets rule sets
 * Ensures rules are compatible, dependencies are met, and no conflicts exist
 * @module services/capital-markets/RuleValidator
 */

const loggers = require('../logger');
const logger = loggers.logger || loggers;

/**
 * Rule Validator Service
 * Validates rule sets for capital markets compliance
 */
class RuleValidator {
  constructor() {
    this.validationRules = this.initializeValidationRules();
  }

  /**
   * Initialize validation rules
   * @returns {Object} Validation rule definitions
   */
  initializeValidationRules() {
    return {
      // Category-specific validations
      EQUITY: {
        requiredRules: ['trading_hours_enforcement'],
        requiredFields: ['min_account_balance'],
        maxRules: 100,
        minRules: 3,
      },
      FIXED_INCOME: {
        requiredRules: ['settlement_rules'],
        requiredFields: ['min_denomination'],
        maxRules: 75,
        minRules: 2,
      },
      DERIVATIVES: {
        requiredRules: ['margin_requirements'],
        requiredFields: ['max_position_size'],
        maxRules: 150,
        minRules: 5,
      },
      PRIVATE_SECURITIES: {
        requiredRules: ['accreditation_check'],
        requiredFields: ['lockup_days'],
        maxRules: 50,
        minRules: 4,
      },
      HYBRID: {
        requiredRules: [],
        requiredFields: [],
        maxRules: 200,
        minRules: 5,
      },
    };
  }

  /**
   * Validate a complete rule set
   * @param {Object} ruleSet - Rule set to validate
   * @returns {Object} Validation result
   */
  async validateRuleSet(ruleSet) {
    const result = {
      valid: true,
      errors: [],
      warnings: [],
      suggestions: [],
      score: 100,
    };

    try {
      // Basic validation
      this.validateBasicRequirements(ruleSet, result);
      
      // Category-specific validation
      this.validateCategoryRequirements(ruleSet, result);
      
      // Rule compatibility
      await this.validateRuleCompatibility(ruleSet, result);
      
      // Dependencies validation
      this.validateDependencies(ruleSet, result);
      
      // Regulatory compliance
      this.validateRegulatoryCompliance(ruleSet, result);
      
      // Performance impact
      this.assessPerformanceImpact(ruleSet, result);
      
      // Calculate overall score
      result.score = this.calculateValidationScore(result);
      
      // Set valid flag based on errors
      result.valid = result.errors.length === 0;
      
      logger.info('Rule set validation completed', {
        ruleSetName: ruleSet.name,
        valid: result.valid,
        score: result.score,
        errors: result.errors.length,
        warnings: result.warnings.length,
      });
    } catch (error) {
      logger.error('Rule set validation failed', { error: error.message });
      result.valid = false;
      result.errors.push(`Validation error: ${error.message}`);
    }

    return result;
  }

  /**
   * Validate basic requirements
   * @param {Object} ruleSet - Rule set to validate
   * @param {Object} result - Validation result object
   */
  validateBasicRequirements(ruleSet, result) {
    // Check required fields
    if (!ruleSet.name || ruleSet.name.length < 3) {
      result.errors.push('Rule set name must be at least 3 characters long');
    }
    
    if (!ruleSet.description || ruleSet.description.length < 10) {
      result.errors.push('Rule set description must be at least 10 characters long');
    }
    
    if (!ruleSet.category) {
      result.errors.push('Rule set category is required');
    }
    
    if (!ruleSet.rules || !Array.isArray(ruleSet.rules)) {
      result.errors.push('Rule set must contain an array of rules');
    } else if (ruleSet.rules.length === 0) {
      result.errors.push('Rule set must contain at least one rule');
    }
    
    // Check for duplicate rules
    const ruleIds = ruleSet.rules?.map(r => r.id || r.rule_id) || [];
    const duplicates = ruleIds.filter((id, index) => ruleIds.indexOf(id) !== index);
    if (duplicates.length > 0) {
      result.errors.push(`Duplicate rules found: ${duplicates.join(', ')}`);
    }
  }

  /**
   * Validate category-specific requirements
   * @param {Object} ruleSet - Rule set to validate
   * @param {Object} result - Validation result object
   */
  validateCategoryRequirements(ruleSet, result) {
    const categoryRules = this.validationRules[ruleSet.category];
    if (!categoryRules) {
      result.warnings.push(`Unknown category: ${ruleSet.category}`);
      return;
    }
    
    // Check rule count limits
    const ruleCount = ruleSet.rules?.length || 0;
    if (ruleCount < categoryRules.minRules) {
      result.warnings.push(
        `${ruleSet.category} rule sets typically have at least ${categoryRules.minRules} rules (current: ${ruleCount})`
      );
    }
    if (ruleCount > categoryRules.maxRules) {
      result.errors.push(
        `${ruleSet.category} rule sets cannot exceed ${categoryRules.maxRules} rules (current: ${ruleCount})`
      );
    }
    
    // Check required rules
    const ruleIds = ruleSet.rules?.map(r => r.id || r.rule_id) || [];
    for (const requiredRule of categoryRules.requiredRules) {
      if (!ruleIds.includes(requiredRule)) {
        result.warnings.push(
          `${ruleSet.category} rule sets should include: ${requiredRule}`
        );
      }
    }
    
    // Check required metadata fields
    for (const requiredField of categoryRules.requiredFields) {
      if (!ruleSet.metadata || !ruleSet.metadata[requiredField]) {
        result.warnings.push(
          `${ruleSet.category} rule sets should define: ${requiredField}`
        );
      }
    }
    
    // Category-specific checks
    this.performCategorySpecificChecks(ruleSet, result);
  }

  /**
   * Perform category-specific validation checks
   * @param {Object} ruleSet - Rule set to validate
   * @param {Object} result - Validation result object
   */
  performCategorySpecificChecks(ruleSet, result) {
    switch (ruleSet.category) {
      case 'EQUITY':
        // Check PDT rule consistency
        if (ruleSet.metadata?.min_account_balance && 
            ruleSet.metadata.min_account_balance < 25000) {
          result.warnings.push(
            'Pattern Day Trader rules require minimum $25,000 account balance'
          );
        }
        break;
        
      case 'FIXED_INCOME':
        // Check settlement consistency
        if (ruleSet.metadata?.settlement_days && 
            ruleSet.metadata.settlement_days > 3) {
          result.warnings.push(
            'Settlement days should not exceed T+3 for most fixed income securities'
          );
        }
        break;
        
      case 'PRIVATE_SECURITIES':
        // Check Reg D compliance
        if (ruleSet.metadata?.max_non_accredited && 
            ruleSet.metadata.max_non_accredited > 35) {
          result.errors.push(
            'Reg D 506(b) limits non-accredited investors to 35'
          );
        }
        if (ruleSet.metadata?.lockup_days && 
            ruleSet.metadata.lockup_days < 180) {
          result.warnings.push(
            'Consider minimum 180-day lockup for private securities'
          );
        }
        break;
        
      case 'DERIVATIVES':
        // Check margin requirements
        if (ruleSet.metadata?.margin_requirement && 
            ruleSet.metadata.margin_requirement < 0.15) {
          result.warnings.push(
            'Margin requirement below 15% may increase risk'
          );
        }
        break;
    }
  }

  /**
   * Validate rule compatibility
   * @param {Object} ruleSet - Rule set to validate
   * @param {Object} result - Validation result object
   */
  async validateRuleCompatibility(ruleSet, result) {
    const rules = ruleSet.rules || [];
    
    // Check for conflicting rule categories
    const categoryCount = {};
    for (const rule of rules) {
      const category = rule.category || 'UNKNOWN';
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    }
    
    // Warn if too many categories mixed
    const categories = Object.keys(categoryCount);
    if (categories.length > 3) {
      result.warnings.push(
        `Rule set contains ${categories.length} different rule categories. Consider splitting into separate sets.`
      );
    }
    
    // Check for known incompatible combinations
    this.checkIncompatibleRules(rules, result);
    
    // Check for redundant rules
    this.checkRedundantRules(rules, result);
  }

  /**
   * Check for incompatible rule combinations
   * @param {Array} rules - Rules to check
   * @param {Object} result - Validation result object
   */
  checkIncompatibleRules(rules, result) {
    const incompatibilities = [
      {
        rule1: 'unlimited_trading',
        rule2: 'trading_hours_enforcement',
        message: 'Cannot have both unlimited and restricted trading hours',
      },
      {
        rule1: 'instant_settlement',
        rule2: 'settlement_t_plus_one',
        message: 'Settlement rules conflict',
      },
      {
        rule1: 'no_margin_requirements',
        rule2: 'margin_requirements',
        message: 'Conflicting margin requirements',
      },
    ];
    
    const ruleIds = rules.map(r => r.id || r.rule_id);
    
    for (const incompatibility of incompatibilities) {
      if (ruleIds.includes(incompatibility.rule1) && 
          ruleIds.includes(incompatibility.rule2)) {
        result.errors.push(incompatibility.message);
      }
    }
  }

  /**
   * Check for redundant rules
   * @param {Array} rules - Rules to check
   * @param {Object} result - Validation result object
   */
  checkRedundantRules(rules, result) {
    const redundancies = [
      {
        rules: ['basic_kyc', 'enhanced_kyc'],
        message: 'Enhanced KYC includes basic KYC requirements',
      },
      {
        rules: ['accredited_investor', 'qualified_purchaser'],
        message: 'Qualified purchaser status implies accredited investor',
      },
    ];
    
    const ruleIds = rules.map(r => r.id || r.rule_id);
    
    for (const redundancy of redundancies) {
      const hasAll = redundancy.rules.every(r => ruleIds.includes(r));
      if (hasAll) {
        result.warnings.push(redundancy.message);
      }
    }
  }

  /**
   * Validate rule dependencies
   * @param {Object} ruleSet - Rule set to validate
   * @param {Object} result - Validation result object
   */
  validateDependencies(ruleSet, result) {
    const rules = ruleSet.rules || [];
    const ruleIds = rules.map(r => r.id || r.rule_id);
    
    for (const rule of rules) {
      if (rule.dependencies && Array.isArray(rule.dependencies)) {
        for (const dep of rule.dependencies) {
          if (!ruleIds.includes(dep)) {
            result.errors.push(
              `Rule '${rule.id || rule.name}' depends on '${dep}' which is not in the set`
            );
          }
        }
      }
    }
    
    // Check for circular dependencies
    const circular = this.detectCircularDependencies(rules);
    if (circular.length > 0) {
      result.errors.push(
        `Circular dependencies detected: ${circular.map(c => c.join(' -> ')).join(', ')}`
      );
    }
  }

  /**
   * Detect circular dependencies
   * @param {Array} rules - Rules to check
   * @returns {Array} Circular dependency chains
   */
  detectCircularDependencies(rules) {
    const circular = [];
    const visited = new Set();
    const recursionStack = new Set();
    
    const dfs = (ruleId, path = []) => {
      if (recursionStack.has(ruleId)) {
        const cycleStart = path.indexOf(ruleId);
        circular.push(path.slice(cycleStart));
        return;
      }
      
      if (visited.has(ruleId)) return;
      
      visited.add(ruleId);
      recursionStack.add(ruleId);
      path.push(ruleId);
      
      const rule = rules.find(r => (r.id || r.rule_id) === ruleId);
      if (rule?.dependencies) {
        for (const dep of rule.dependencies) {
          dfs(dep, [...path]);
        }
      }
      
      recursionStack.delete(ruleId);
    };
    
    for (const rule of rules) {
      const ruleId = rule.id || rule.rule_id;
      if (!visited.has(ruleId)) {
        dfs(ruleId);
      }
    }
    
    return circular;
  }

  /**
   * Validate regulatory compliance
   * @param {Object} ruleSet - Rule set to validate
   * @param {Object} result - Validation result object
   */
  validateRegulatoryCompliance(ruleSet, result) {
    const complianceRequirements = {
      EQUITY: ['SEC Rule 15c3-1', 'FINRA Rule 4210'],
      FIXED_INCOME: ['MSRB Rule G-14', 'TRACE Reporting'],
      PRIVATE_SECURITIES: ['SEC Regulation D', 'Rule 144'],
      DERIVATIVES: ['CFTC Rules', 'Dodd-Frank'],
    };
    
    const required = complianceRequirements[ruleSet.category] || [];
    const standards = ruleSet.compliance_standards || [];
    
    for (const req of required) {
      const hasCompliance = standards.some(s => 
        s.toLowerCase().includes(req.toLowerCase())
      );
      if (!hasCompliance) {
        result.suggestions.push(
          `Consider adding compliance for: ${req}`
        );
      }
    }
    
    // Check for international compliance if needed
    if (ruleSet.metadata?.international) {
      if (!standards.some(s => s.includes('MiFID'))) {
        result.suggestions.push(
          'International operations may require MiFID II compliance'
        );
      }
    }
  }

  /**
   * Assess performance impact of rules
   * @param {Object} ruleSet - Rule set to validate
   * @param {Object} result - Validation result object
   */
  assessPerformanceImpact(ruleSet, result) {
    const rules = ruleSet.rules || [];
    let totalComplexity = 0;
    
    // Estimate complexity based on rule count and types
    for (const rule of rules) {
      // Base complexity
      let complexity = 1;
      
      // Increase for complex conditions
      if (rule.condition?.type === 'COMPLEX_CALCULATION') {
        complexity += 3;
      }
      if (rule.condition?.type === 'EXTERNAL_API_CALL') {
        complexity += 5;
      }
      
      // Increase for multiple actions
      if (rule.action && Array.isArray(rule.action)) {
        complexity += rule.action.length;
      }
      
      totalComplexity += complexity;
    }
    
    // Performance recommendations
    if (totalComplexity > 100) {
      result.warnings.push(
        'High rule complexity may impact performance. Consider optimization.'
      );
    }
    
    if (rules.length > 50) {
      result.suggestions.push(
        'Large rule sets may benefit from indexing or caching strategies'
      );
    }
    
    // Gas estimation for blockchain deployment
    const estimatedGas = 1000000 + (rules.length * 50000);
    if (estimatedGas > 5000000) {
      result.warnings.push(
        `Estimated gas usage (${estimatedGas}) is high. Consider splitting the rule set.`
      );
    }
  }

  /**
   * Calculate overall validation score
   * @param {Object} result - Validation result object
   * @returns {number} Score from 0-100
   */
  calculateValidationScore(result) {
    let score = 100;
    
    // Deduct for errors (heavy penalty)
    score -= result.errors.length * 15;
    
    // Deduct for warnings (moderate penalty)
    score -= result.warnings.length * 5;
    
    // Bonus for following suggestions
    score += Math.min(result.suggestions.length * 2, 10);
    
    // Ensure score is within bounds
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Validate a single rule
   * @param {Object} rule - Rule to validate
   * @returns {Object} Validation result
   */
  validateSingleRule(rule) {
    const result = {
      valid: true,
      errors: [],
      warnings: [],
    };
    
    // Check required fields
    if (!rule.id && !rule.rule_id) {
      result.errors.push('Rule must have an ID');
    }
    
    if (!rule.name) {
      result.errors.push('Rule must have a name');
    }
    
    if (!rule.condition) {
      result.errors.push('Rule must have a condition');
    }
    
    if (!rule.action) {
      result.errors.push('Rule must have an action');
    }
    
    // Check condition validity
    if (rule.condition) {
      if (!rule.condition.type) {
        result.errors.push('Rule condition must have a type');
      }
      if (!rule.condition.operator) {
        result.errors.push('Rule condition must have an operator');
      }
    }
    
    // Check action validity
    if (rule.action) {
      if (!rule.action.type) {
        result.errors.push('Rule action must have a type');
      }
    }
    
    result.valid = result.errors.length === 0;
    return result;
  }
}

export default new RuleValidator();