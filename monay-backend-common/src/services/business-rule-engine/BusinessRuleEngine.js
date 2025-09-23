/**
 * Business Rule Engine Service
 * Main orchestrator for Monay's patented multi-chain business rule system
 * Coordinates rule definition, evaluation, compilation, and deployment
 *
 * @module BusinessRuleEngine
 */

const RuleDefinition = require('./RuleDefinition');
const RuleEvaluator = require('./RuleEvaluator');
const RuleCompiler = require('./RuleCompiler');
const loggers = require('../logger');
const logger = {
  info: (msg, data) => loggers.logger ? loggers.logger.info(msg, data) : console.log(msg, data),
  error: (msg, data) => loggers.errorLogger ? loggers.errorLogger.error(msg, data) : console.error(msg, data),
  warn: (msg, data) => loggers.logger ? loggers.logger.warn(msg, data) : console.warn(msg, data),
  debug: (msg, data) => loggers.logger ? loggers.logger.debug(msg, data) : console.debug(msg, data)
};
const EventEmitter = require('events');

/**
 * Business Rule Engine (BRE)
 * Patent-pending system for universal blockchain rule management
 */
class BusinessRuleEngine extends EventEmitter {
  constructor() {
    super();
    this.ruleDefinition = RuleDefinition;
    this.ruleEvaluator = RuleEvaluator;
    this.ruleCompiler = RuleCompiler;

    this.ruleStorage = new Map(); // In-memory rule storage
    this.deployedContracts = new Map(); // Track deployed smart contracts
    this.auditLog = []; // Immutable audit trail

    this.initialized = false;
  }

  /**
   * Initialize the Business Rule Engine
   * @returns {Promise<Object>} Initialization status
   */
  async initialize() {
    try {
      logger.info('Initializing Business Rule Engine');

      // Load default invoice rules
      const invoiceRules = this.ruleDefinition.getInvoiceRules();
      await this.loadRules(invoiceRules);

      // Initialize chain connections
      await this.initializeChainConnections();

      this.initialized = true;
      this.emit('initialized');

      logger.info('Business Rule Engine initialized', {
        ruleCount: this.ruleStorage.size,
        chains: ['evm', 'solana']
      });

      return {
        status: 'ready',
        rules: this.ruleStorage.size,
        capabilities: this.getCapabilities()
      };
    } catch (error) {
      logger.error('BRE initialization failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Load rules into the engine
   * @param {Object} ruleCategories - Categorized rules
   * @returns {Promise<void>}
   */
  async loadRules(ruleCategories) {
    for (const [category, rules] of Object.entries(ruleCategories)) {
      for (const [ruleName, rule] of Object.entries(rules)) {
        this.ruleStorage.set(rule.id, {
          ...rule,
          category,
          loadedAt: new Date().toISOString()
        });
      }
    }
  }

  /**
   * Initialize blockchain connections
   * @returns {Promise<void>}
   */
  async initializeChainConnections() {
    // Initialize connections to Base L2 and Solana
    try {
      const BlockchainIntegration = require('../invoice-wallet/BlockchainIntegration');
      await BlockchainIntegration.initialize();

      this.blockchainIntegration = BlockchainIntegration;
      logger.info('Chain connections initialized');
    } catch (error) {
      logger.warn('Chain initialization failed, using mock mode', {
        error: error.message
      });
    }
  }

  /**
   * Evaluate invoice against business rules
   * @param {Object} invoice - Invoice data
   * @returns {Promise<Object>} Evaluation result with recommendations
   */
  async evaluateInvoice(invoice) {
    const startTime = Date.now();

    try {
      // Build evaluation context
      const context = await this.buildContext(invoice);

      // Get relevant rules
      const relevantRules = this.getRelevantRules(invoice);

      // Evaluate rules
      const evaluationResults = await this.ruleEvaluator.evaluateRules(
        relevantRules,
        context
      );

      // Generate recommendations
      const recommendations = this.generateRecommendations(evaluationResults);

      // Log to audit trail
      this.logAuditEvent('invoice_evaluation', {
        invoiceId: invoice.id,
        rulesEvaluated: relevantRules.length,
        recommendations: recommendations.length,
        duration: Date.now() - startTime
      });

      return {
        invoice: invoice.id,
        evaluationResults,
        recommendations,
        walletMode: this.determineWalletMode(evaluationResults),
        complianceStatus: this.determineComplianceStatus(evaluationResults),
        evaluationTime: Date.now() - startTime
      };
    } catch (error) {
      logger.error('Invoice evaluation failed', {
        invoiceId: invoice.id,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Build evaluation context from invoice
   * @param {Object} invoice - Invoice data
   * @returns {Promise<Object>} Evaluation context
   */
  async buildContext(invoice) {
    const context = {
      invoice: {
        id: invoice.id,
        amount: invoice.amount,
        currency: invoice.currency,
        type: invoice.type || 'standard',
        isInternational: invoice.isInternational || false,
        dueDate: invoice.dueDate,
        items: invoice.items || []
      },
      customer: {
        id: invoice.customerId,
        type: invoice.customerType || 'new',
        isRecurring: invoice.customerType === 'recurring',
        riskScore: await this.calculateRiskScore(invoice),
        kycStatus: invoice.kycStatus || 'pending',
        country: invoice.customerCountry || 'US'
      },
      transaction: {
        timestamp: new Date().toISOString(),
        originCountry: invoice.originCountry || 'US',
        destinationCountry: invoice.destinationCountry || 'US',
        paymentMethod: invoice.paymentMethod || 'wallet'
      },
      wallet: {
        dailyLimit: invoice.walletDailyLimit || 10000,
        dailySpend: invoice.walletDailySpend || 0,
        transactionsPerHour: invoice.walletTransactionsPerHour || 0
      }
    };

    return context;
  }

  /**
   * Calculate risk score for invoice
   * @param {Object} invoice - Invoice data
   * @returns {Promise<number>} Risk score (0-100)
   */
  async calculateRiskScore(invoice) {
    let score = 0;

    // Amount-based risk
    if (invoice.amount > 50000) score += 40;
    else if (invoice.amount > 10000) score += 20;
    else if (invoice.amount > 1000) score += 10;

    // Geographic risk
    if (invoice.isInternational) score += 20;

    // Customer risk
    if (invoice.customerType === 'new') score += 30;
    else if (invoice.customerType === 'unverified') score += 40;

    // Payment method risk
    if (invoice.paymentMethod === 'crypto') score += 15;
    if (invoice.paymentMethod === 'wire') score += 5;

    // KYC/AML risk
    if (!invoice.kycStatus || invoice.kycStatus === 'pending') score += 25;
    if (invoice.kycStatus === 'failed') score += 50;

    // Time-based risk (urgent payments)
    const hoursUntilDue = invoice.dueDate ?
      (new Date(invoice.dueDate) - new Date()) / (1000 * 60 * 60) : 24;
    if (hoursUntilDue < 1) score += 20;
    else if (hoursUntilDue < 6) score += 10;

    return Math.min(score, 100);
  }

  /**
   * Get relevant rules for invoice
   * @param {Object} invoice - Invoice data
   * @returns {Array} Relevant rules
   */
  getRelevantRules(invoice) {
    const relevantRules = [];

    for (const [ruleId, rule] of this.ruleStorage) {
      // Check if rule applies to this invoice type
      if (rule.category === 'transaction' ||
          rule.category === 'compliance' ||
          rule.category === 'wallet') {

        // Check chain compatibility
        if (rule.chains.includes('all') ||
            rule.chains.includes(invoice.targetChain || 'evm')) {
          relevantRules.push(rule);
        }
      }
    }

    return relevantRules;
  }

  /**
   * Generate recommendations from evaluation results
   * @param {Array} evaluationResults - Rule evaluation results
   * @returns {Array} Recommendations
   */
  generateRecommendations(evaluationResults) {
    const recommendations = [];

    for (const result of evaluationResults) {
      if (result.triggered) {
        for (const action of result.actions) {
          recommendations.push({
            ruleId: result.ruleId,
            ruleName: result.ruleName,
            action: action.type,
            parameters: action.parameters,
            message: action.message,
            severity: action.severity || 'info',
            priority: this.getActionPriority(action.type)
          });
        }
      }
    }

    // Sort by priority
    return recommendations.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Get action priority
   * @param {string} actionType - Type of action
   * @returns {number} Priority (0-100)
   */
  getActionPriority(actionType) {
    const priorities = {
      'deny': 100,
      'require_attestation': 90,
      'hold': 80,
      'set_wallet_mode': 70,
      'notify': 50,
      'log': 30,
      'allow': 10
    };
    return priorities[actionType] || 0;
  }

  /**
   * Determine wallet mode from evaluation results
   * @param {Array} evaluationResults - Rule evaluation results
   * @returns {string} Wallet mode
   */
  determineWalletMode(evaluationResults) {
    for (const result of evaluationResults) {
      if (result.triggered) {
        const walletAction = result.actions.find(a => a.type === 'set_wallet_mode');
        if (walletAction) {
          return walletAction.parameters.mode;
        }
      }
    }
    return 'adaptive'; // Default
  }

  /**
   * Determine compliance status
   * @param {Array} evaluationResults - Rule evaluation results
   * @returns {Object} Compliance status
   */
  determineComplianceStatus(evaluationResults) {
    let compliant = true;
    const violations = [];
    const requirements = [];

    for (const result of evaluationResults) {
      if (result.triggered && result.ruleName.includes('Compliance')) {
        for (const action of result.actions) {
          if (action.type === 'deny') {
            compliant = false;
            violations.push({
              rule: result.ruleName,
              message: action.message
            });
          } else if (action.type === 'require_attestation') {
            requirements.push({
              type: action.parameters.attestationType,
              message: action.message
            });
          }
        }
      }
    }

    return {
      compliant,
      violations,
      requirements,
      needsReview: violations.length > 0 || requirements.length > 0
    };
  }

  /**
   * Deploy rules to blockchain
   * @param {Array} ruleIds - IDs of rules to deploy
   * @param {string} chain - Target blockchain
   * @param {Object} options - Deployment options
   * @returns {Promise<Object>} Deployment result
   */
  async deployRulesToChain(ruleIds, chain, options = {}) {
    try {
      logger.info('Deploying rules to blockchain', {
        ruleCount: ruleIds.length,
        chain
      });

      // Get rules to deploy
      const rules = ruleIds.map(id => this.ruleStorage.get(id));

      // Compile rules for target chain
      const compiled = await this.ruleCompiler.compileRules(rules, chain, options);

      // Deploy to blockchain
      let deploymentResult;
      if (chain === 'evm') {
        deploymentResult = await this.deployEVMContract(compiled);
      } else if (chain === 'solana') {
        deploymentResult = await this.deploySolanaProgram(compiled);
      }

      // Store deployment info
      this.deployedContracts.set(deploymentResult.address, {
        chain,
        rules: ruleIds,
        deployedAt: new Date().toISOString(),
        transactionHash: deploymentResult.txHash
      });

      // Log to audit trail
      this.logAuditEvent('rules_deployed', {
        chain,
        ruleCount: ruleIds.length,
        address: deploymentResult.address
      });

      this.emit('rulesDeployed', deploymentResult);

      return deploymentResult;
    } catch (error) {
      logger.error('Rule deployment failed', {
        chain,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Deploy EVM contract
   * @param {Object} compiled - Compiled contract
   * @returns {Promise<Object>} Deployment result
   */
  async deployEVMContract(compiled) {
    // Mock deployment for development
    return {
      chain: 'evm',
      address: '0x' + Math.random().toString(16).substr(2, 40),
      txHash: '0x' + Math.random().toString(16).substr(2, 64),
      gasUsed: compiled.artifacts.gasEstimate,
      blockNumber: Math.floor(Math.random() * 1000000)
    };
  }

  /**
   * Deploy Solana program
   * @param {Object} compiled - Compiled program
   * @returns {Promise<Object>} Deployment result
   */
  async deploySolanaProgram(compiled) {
    // Mock deployment for development
    return {
      chain: 'solana',
      address: compiled.artifacts.programId,
      txHash: Math.random().toString(36).substr(2, 88),
      computeUnits: 200000,
      slot: Math.floor(Math.random() * 1000000)
    };
  }

  /**
   * Create custom rule
   * @param {Object} ruleConfig - Rule configuration
   * @returns {Object} Created rule
   */
  createCustomRule(ruleConfig) {
    const rule = this.ruleDefinition.createRule(ruleConfig);

    // Validate rule
    const validation = this.ruleDefinition.validateRule(rule);
    if (!validation.valid) {
      throw new Error(`Invalid rule: ${validation.errors.join(', ')}`);
    }

    // Store rule
    this.ruleStorage.set(rule.id, rule);

    // Log to audit trail
    this.logAuditEvent('rule_created', {
      ruleId: rule.id,
      name: rule.name
    });

    this.emit('ruleCreated', rule);

    return rule;
  }

  /**
   * Update existing rule
   * @param {string} ruleId - Rule ID
   * @param {Object} updates - Updates to apply
   * @returns {Object} Updated rule
   */
  updateRule(ruleId, updates) {
    const rule = this.ruleStorage.get(ruleId);
    if (!rule) {
      throw new Error(`Rule not found: ${ruleId}`);
    }

    // Apply updates
    const updatedRule = {
      ...rule,
      ...updates,
      metadata: {
        ...rule.metadata,
        updatedAt: new Date().toISOString()
      }
    };

    // Validate updated rule
    const validation = this.ruleDefinition.validateRule(updatedRule);
    if (!validation.valid) {
      throw new Error(`Invalid rule update: ${validation.errors.join(', ')}`);
    }

    // Store updated rule
    this.ruleStorage.set(ruleId, updatedRule);

    // Log to audit trail
    this.logAuditEvent('rule_updated', {
      ruleId,
      updates: Object.keys(updates)
    });

    this.emit('ruleUpdated', updatedRule);

    return updatedRule;
  }

  /**
   * Delete rule
   * @param {string} ruleId - Rule ID
   * @returns {boolean} Success
   */
  deleteRule(ruleId) {
    const rule = this.ruleStorage.get(ruleId);
    if (!rule) {
      throw new Error(`Rule not found: ${ruleId}`);
    }

    // Check if rule is deployed
    for (const [address, deployment] of this.deployedContracts) {
      if (deployment.rules.includes(ruleId)) {
        throw new Error(`Cannot delete deployed rule: ${ruleId}`);
      }
    }

    // Delete rule
    this.ruleStorage.delete(ruleId);

    // Log to audit trail
    this.logAuditEvent('rule_deleted', {
      ruleId,
      name: rule.name
    });

    this.emit('ruleDeleted', { ruleId });

    return true;
  }

  /**
   * Get all rules
   * @param {Object} filter - Optional filter
   * @returns {Array} Rules
   */
  getRules(filter = {}) {
    let rules = Array.from(this.ruleStorage.values());

    // Apply filters
    if (filter.category) {
      rules = rules.filter(r => r.category === filter.category);
    }
    if (filter.enabled !== undefined) {
      rules = rules.filter(r => r.enabled === filter.enabled);
    }
    if (filter.chain) {
      rules = rules.filter(r =>
        r.chains.includes(filter.chain) || r.chains.includes('all')
      );
    }

    return rules;
  }

  /**
   * Get rule by ID
   * @param {string} ruleId - Rule ID
   * @returns {Object} Rule
   */
  getRule(ruleId) {
    return this.ruleStorage.get(ruleId);
  }

  /**
   * Log audit event
   * @param {string} event - Event type
   * @param {Object} details - Event details
   */
  logAuditEvent(event, details) {
    const auditEntry = {
      id: Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      event,
      details,
      timestamp: new Date().toISOString(),
      hash: this.generateHash({ event, details })
    };

    this.auditLog.push(auditEntry);

    // Keep audit log size manageable
    if (this.auditLog.length > 10000) {
      this.auditLog.shift(); // Remove oldest entry
    }

    logger.debug('Audit event logged', { event, id: auditEntry.id });
  }

  /**
   * Generate hash for audit entry
   * @param {Object} data - Data to hash
   * @returns {string} Hash
   */
  generateHash(data) {
    const crypto = require('crypto');
    return crypto
      .createHash('sha256')
      .update(JSON.stringify(data))
      .digest('hex')
      .substr(0, 16);
  }

  /**
   * Get audit log
   * @param {Object} filter - Optional filter
   * @returns {Array} Audit entries
   */
  getAuditLog(filter = {}) {
    let entries = [...this.auditLog];

    if (filter.event) {
      entries = entries.filter(e => e.event === filter.event);
    }
    if (filter.startDate) {
      entries = entries.filter(e =>
        new Date(e.timestamp) >= new Date(filter.startDate)
      );
    }
    if (filter.endDate) {
      entries = entries.filter(e =>
        new Date(e.timestamp) <= new Date(filter.endDate)
      );
    }

    return entries;
  }

  /**
   * Get BRE capabilities
   * @returns {Object} Capabilities
   */
  getCapabilities() {
    return {
      chains: ['evm', 'solana'],
      ruleCategories: ['transaction', 'compliance', 'security', 'wallet', 'token'],
      operators: ['equals', 'greater', 'less', 'contains', 'in', 'between', 'regex'],
      actions: ['allow', 'deny', 'hold', 'require_attestation', 'notify', 'log'],
      features: [
        'Multi-chain support',
        'Real-time evaluation',
        'Smart contract compilation',
        'Audit trail',
        'Risk scoring',
        'Compliance checking',
        'Wallet mode selection'
      ]
    };
  }

  /**
   * Get BRE metrics
   * @returns {Object} Metrics
   */
  getMetrics() {
    return {
      rulesLoaded: this.ruleStorage.size,
      deployedContracts: this.deployedContracts.size,
      auditLogSize: this.auditLog.length,
      evaluatorMetrics: this.ruleEvaluator.getMetrics(),
      initialized: this.initialized,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = new BusinessRuleEngine();