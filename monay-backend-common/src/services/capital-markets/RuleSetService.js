/**
 * RuleSetService - Manages capital markets rule sets
 * Works alongside existing BusinessRuleEngine without modifying it
 * @module services/capital-markets/RuleSetService
 */

const { v4: uuidv4 } = require('uuid');
const models = require('../../models');
const BusinessRuleEngine = require('../business-rule-engine/BusinessRuleEngine');
const RuleCompiler = require('../business-rule-engine/RuleCompiler');
const CapitalMarketsTemplates = require('./CapitalMarketsTemplates');
const loggers = require('../logger');
const logger = loggers.logger || loggers;

class RuleSetService {
  constructor() {
    this.businessRuleEngine = BusinessRuleEngine;
    this.ruleCompiler = RuleCompiler; // RuleCompiler is already an instance
  }

  /**
   * Create a new rule set
   * @param {Object} ruleSetData - Rule set configuration
   * @param {string} userId - Creator's user ID
   * @returns {Promise<Object>} Created rule set
   */
  async createRuleSet(ruleSetData, userId) {
    try {
      const ruleSet = {
        id: uuidv4(),
        name: ruleSetData.name,
        description: ruleSetData.description,
        category: ruleSetData.category || 'HYBRID',
        instrument_type: ruleSetData.instrument_type,
        template_id: ruleSetData.template_id,
        created_by: userId,
        status: 'draft',
        metadata: ruleSetData.metadata || {},
        chain: ruleSetData.chain || 'evm'
      };

      // Store in database (when tables are created)
      // For now, store in memory or localStorage
      if (!global.ruleSets) {
        global.ruleSets = new Map();
      }
      global.ruleSets.set(ruleSet.id, ruleSet);

      // If rule IDs provided, add them to the set
      if (ruleSetData.rule_ids && Array.isArray(ruleSetData.rule_ids)) {
        await this.addRulesToSet(ruleSet.id, ruleSetData.rule_ids, userId);
      }

      logger.info('Rule set created', { ruleSetId: ruleSet.id, name: ruleSet.name });
      return ruleSet;
    } catch (error) {
      logger.error('Failed to create rule set', { error: error.message });
      throw error;
    }
  }

  /**
   * Add rules to a rule set
   * @param {string} ruleSetId - Rule set ID
   * @param {Array<string>} ruleIds - Array of rule IDs to add
   * @param {string} userId - User adding the rules
   * @returns {Promise<Object>} Updated rule set
   */
  async addRulesToSet(ruleSetId, ruleIds, userId) {
    try {
      const ruleSet = global.ruleSets?.get(ruleSetId);
      if (!ruleSet) {
        throw new Error('Rule set not found');
      }

      if (!ruleSet.rules) {
        ruleSet.rules = [];
      }

      // Add rules with order index
      for (let i = 0; i < ruleIds.length; i++) {
        const ruleItem = {
          id: uuidv4(),
          rule_set_id: ruleSetId,
          rule_id: ruleIds[i],
          order_index: ruleSet.rules.length + i,
          is_required: false,
          is_enabled: true,
          added_by: userId,
          added_at: new Date().toISOString()
        };
        ruleSet.rules.push(ruleItem);
      }

      // Validate dependencies
      await this.validateRuleDependencies(ruleSet.rules.map(r => r.rule_id));

      logger.info('Rules added to set', {
        ruleSetId,
        rulesAdded: ruleIds.length,
        totalRules: ruleSet.rules.length
      });

      return ruleSet;
    } catch (error) {
      logger.error('Failed to add rules to set', { error: error.message });
      throw error;
    }
  }

  /**
   * Validate rule dependencies and check for conflicts
   * @param {Array<string>} ruleIds - Rule IDs to validate
   * @returns {Promise<Object>} Validation result
   */
  async validateRuleDependencies(ruleIds) {
    const result = {
      valid: true,
      conflicts: [],
      missingDependencies: [],
      warnings: []
    };

    try {
      // Check each rule's dependencies
      for (const ruleId of ruleIds) {
        const dependencies = await this.getRuleDependencies(ruleId);

        // Check if all required dependencies are in the set
        for (const dep of dependencies.requires || []) {
          if (!ruleIds.includes(dep)) {
            result.missingDependencies.push({
              rule: ruleId,
              missing: dep
            });
            result.valid = false;
          }
        }

        // Check for conflicts
        for (const conflict of dependencies.conflicts || []) {
          if (ruleIds.includes(conflict)) {
            result.conflicts.push({
              rule1: ruleId,
              rule2: conflict
            });
            result.valid = false;
          }
        }
      }

      // Check for circular dependencies
      const circular = this.detectCircularDependencies(ruleIds);
      if (circular.length > 0) {
        result.warnings.push({
          type: 'circular_dependency',
          rules: circular
        });
      }

      return result;
    } catch (error) {
      logger.error('Dependency validation failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Get rule dependencies (mock implementation - replace with DB query)
   * @param {string} ruleId - Rule ID
   * @returns {Promise<Object>} Dependencies
   */
  async getRuleDependencies(ruleId) {
    // Mock dependencies - replace with actual DB query when tables exist
    const mockDependencies = {
      'accredited_investor_check': {
        requires: [],
        conflicts: [],
        enhances: ['kyc_verification']
      },
      'trading_hours_enforcement': {
        requires: [],
        conflicts: ['24_hour_trading'],
        enhances: []
      },
      'pattern_day_trader': {
        requires: ['account_balance_check'],
        conflicts: [],
        enhances: ['risk_management']
      }
    };

    return mockDependencies[ruleId] || { requires: [], conflicts: [], enhances: [] };
  }

  /**
   * Detect circular dependencies using DFS
   * @param {Array<string>} ruleIds - Rule IDs to check
   * @returns {Array} Circular dependency chains
   */
  detectCircularDependencies(ruleIds) {
    const visited = new Set();
    const recursionStack = new Set();
    const circular = [];

    const dfs = async (ruleId, path = []) => {
      visited.add(ruleId);
      recursionStack.add(ruleId);
      path.push(ruleId);

      const deps = await this.getRuleDependencies(ruleId);
      for (const depId of deps.requires || []) {
        if (!visited.has(depId)) {
          await dfs(depId, [...path]);
        } else if (recursionStack.has(depId)) {
          // Found circular dependency
          const cycleStart = path.indexOf(depId);
          circular.push(path.slice(cycleStart));
        }
      }

      recursionStack.delete(ruleId);
    };

    // Check each rule
    for (const ruleId of ruleIds) {
      if (!visited.has(ruleId)) {
        dfs(ruleId);
      }
    }

    return circular;
  }

  /**
   * Deploy a rule set to blockchain
   * @param {string} ruleSetId - Rule set ID
   * @param {Object} options - Deployment options
   * @returns {Promise<Object>} Deployment result
   */
  async deployRuleSet(ruleSetId, options = {}) {
    try {
      const ruleSet = global.ruleSets?.get(ruleSetId);
      if (!ruleSet) {
        throw new Error('Rule set not found');
      }

      // Validate before deployment
      const validation = await this.validateRuleSet(ruleSetId);
      if (!validation.valid) {
        throw new Error(`Rule set validation failed: ${JSON.stringify(validation.errors)}`);
      }

      // Update status
      ruleSet.status = 'deploying';

      // Get all rules for compilation
      const ruleIds = ruleSet.rules.map(r => r.rule_id);

      // Use existing BusinessRuleEngine deployment
      const deploymentResult = await this.businessRuleEngine.deployRulesToChain(
        ruleIds,
        ruleSet.chain,
        {
          ...options,
          contractName: `CapitalMarkets_${ruleSet.name.replace(/\s+/g, '_')}`,
          metadata: {
            ruleSetId,
            category: ruleSet.category,
            instrumentType: ruleSet.instrument_type
          }
        }
      );

      // Update rule set with deployment info
      ruleSet.status = 'deployed';
      ruleSet.deployed_at = new Date().toISOString();
      ruleSet.contract_address = deploymentResult.contractAddress;
      ruleSet.deployment_tx_hash = deploymentResult.transactionHash;

      // Store deployment history
      await this.storeDeploymentHistory(ruleSetId, deploymentResult);

      logger.info('Rule set deployed successfully', {
        ruleSetId,
        contractAddress: deploymentResult.contractAddress,
        chain: ruleSet.chain
      });

      return deploymentResult;
    } catch (error) {
      logger.error('Rule set deployment failed', {
        ruleSetId,
        error: error.message
      });

      // Update status
      const ruleSet = global.ruleSets?.get(ruleSetId);
      if (ruleSet) {
        ruleSet.status = 'failed';
      }

      throw error;
    }
  }

  /**
   * Validate a complete rule set
   * @param {string} ruleSetId - Rule set ID
   * @returns {Promise<Object>} Validation result
   */
  async validateRuleSet(ruleSetId) {
    try {
      const ruleSet = global.ruleSets?.get(ruleSetId);
      if (!ruleSet) {
        return { valid: false, errors: ['Rule set not found'] };
      }

      const errors = [];
      const warnings = [];

      // Check minimum rules
      if (!ruleSet.rules || ruleSet.rules.length === 0) {
        errors.push('Rule set must contain at least one rule');
      }

      // Validate capital markets specific requirements
      if (ruleSet.category === 'EQUITY' || ruleSet.category === 'PRIVATE_SECURITIES') {
        const hasAccreditationCheck = ruleSet.rules.some(r =>
          r.rule_id.includes('accredited') || r.rule_id.includes('qualified')
        );
        if (!hasAccreditationCheck) {
          warnings.push('Equity/Private securities should include investor verification rules');
        }
      }

      // Validate dependencies
      const depValidation = await this.validateRuleDependencies(
        ruleSet.rules.map(r => r.rule_id)
      );
      if (!depValidation.valid) {
        errors.push(...depValidation.conflicts.map(c =>
          `Conflict between ${c.rule1} and ${c.rule2}`
        ));
        errors.push(...depValidation.missingDependencies.map(m =>
          `Rule ${m.rule} requires ${m.missing}`
        ));
      }
      warnings.push(...depValidation.warnings.map(w => w.type));

      // Check for duplicate rules
      const ruleIds = ruleSet.rules.map(r => r.rule_id);
      const duplicates = ruleIds.filter((id, index) => ruleIds.indexOf(id) !== index);
      if (duplicates.length > 0) {
        errors.push(`Duplicate rules found: ${duplicates.join(', ')}`);
      }

      return {
        valid: errors.length === 0,
        errors,
        warnings
      };
    } catch (error) {
      logger.error('Rule set validation failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Store deployment history (mock - replace with DB insert)
   * @param {string} ruleSetId - Rule set ID
   * @param {Object} deploymentResult - Deployment result
   */
  async storeDeploymentHistory(ruleSetId, deploymentResult) {
    if (!global.deploymentHistory) {
      global.deploymentHistory = [];
    }

    global.deploymentHistory.push({
      id: uuidv4(),
      rule_set_id: ruleSetId,
      ...deploymentResult,
      deployed_at: new Date().toISOString()
    });
  }

  /**
   * Get rule set by ID
   * @param {string} ruleSetId - Rule set ID
   * @returns {Promise<Object>} Rule set
   */
  async getRuleSet(ruleSetId) {
    const ruleSet = global.ruleSets?.get(ruleSetId);
    if (!ruleSet) {
      throw new Error('Rule set not found');
    }
    return ruleSet;
  }

  /**
   * List all rule sets with filters
   * @param {Object} filters - Filter criteria
   * @returns {Promise<Array>} Rule sets
   */
  async listRuleSets(filters = {}) {
    const allRuleSets = Array.from(global.ruleSets?.values() || []);

    // Apply filters
    let filtered = allRuleSets;

    if (filters.category) {
      filtered = filtered.filter(rs => rs.category === filters.category);
    }

    if (filters.status) {
      filtered = filtered.filter(rs => rs.status === filters.status);
    }

    if (filters.created_by) {
      filtered = filtered.filter(rs => rs.created_by === filters.created_by);
    }

    return filtered;
  }

  /**
   * Apply a template to create a new rule set
   * @param {string} templateId - Template ID
   * @param {Object} customization - Template customization
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Created rule set
   */
  async applyTemplate(templateId, customization, userId) {
    const template = await this.getTemplate(templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    const ruleSetData = {
      name: customization.name || `${template.name} - ${new Date().toISOString()}`,
      description: template.description,
      category: template.category,
      template_id: templateId,
      rule_ids: template.rule_ids,
      metadata: {
        ...template.configuration,
        ...customization.metadata
      }
    };

    return this.createRuleSet(ruleSetData, userId);
  }

  /**
   * Get template by ID from CapitalMarketsTemplates service
   * @param {string} templateId - Template ID
   * @returns {Promise<Object>} Template
   */
  async getTemplate(templateId) {
    const template = CapitalMarketsTemplates.getTemplate(templateId);
    if (!template) {
      return null;
    }

    // Extract rule IDs from template rules for backward compatibility
    return {
      name: template.name,
      description: template.description,
      category: template.category,
      rule_ids: template.rules.map(r => r.id),
      configuration: template.configuration,
      compliance_standards: template.compliance_standards,
      version: template.version
    };
  }
}

export default new RuleSetService();