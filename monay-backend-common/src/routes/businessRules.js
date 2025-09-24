/**
 * Business Rule Engine API Routes
 * Endpoints for evaluating and managing business rules
 */

const express = require('express');
const router = express.Router();
const BusinessRuleEngine = require('../services/business-rule-engine/BusinessRuleEngine');
const logger = require('../services/logger');

/**
 * Initialize Business Rule Engine on startup
 */
(async () => {
  try {
    await BusinessRuleEngine.initialize();
    logger.info('Business Rule Engine initialized via API route');
  } catch (error) {
    logger.error('Failed to initialize Business Rule Engine', { error: error.message });
  }
})();

/**
 * @route POST /api/business-rules/evaluate
 * @description Evaluate invoice against business rules
 * @access Public
 */
router.post('/evaluate', async (req, res) => {
  try {
    const { invoice } = req.body;

    if (!invoice) {
      return res.status(400).json({
        success: false,
        error: 'Invoice data is required'
      });
    }

    logger.info('Evaluating invoice with BRE', { invoiceId: invoice.id });

    // Evaluate invoice using Business Rule Engine
    const evaluation = await BusinessRuleEngine.evaluateInvoice(invoice);

    // Return evaluation results
    res.json({
      success: true,
      ...evaluation
    });
  } catch (error) {
    logger.error('BRE evaluation failed', {
      error: error.message,
      invoice: req.body.invoice?.id
    });

    res.status(500).json({
      success: false,
      error: 'Failed to evaluate invoice',
      message: error.message
    });
  }
});

/**
 * @route GET /api/business-rules
 * @description Get all business rules
 * @access Private
 */
router.get('/', async (req, res) => {
  try {
    const { category, enabled, chain } = req.query;

    const filter = {};
    if (category) filter.category = category;
    if (enabled !== undefined) filter.enabled = enabled === 'true';
    if (chain) filter.chain = chain;

    const rules = BusinessRuleEngine.getRules(filter);

    res.json({
      success: true,
      count: rules.length,
      rules
    });
  } catch (error) {
    logger.error('Failed to fetch rules', { error: error.message });

    res.status(500).json({
      success: false,
      error: 'Failed to fetch rules',
      message: error.message
    });
  }
});

/**
 * @route GET /api/business-rules/:id
 * @description Get specific business rule
 * @access Private
 */
router.get('/:id', async (req, res) => {
  try {
    const rule = BusinessRuleEngine.getRule(req.params.id);

    if (!rule) {
      return res.status(404).json({
        success: false,
        error: 'Rule not found'
      });
    }

    res.json({
      success: true,
      rule
    });
  } catch (error) {
    logger.error('Failed to fetch rule', {
      ruleId: req.params.id,
      error: error.message
    });

    res.status(500).json({
      success: false,
      error: 'Failed to fetch rule',
      message: error.message
    });
  }
});

/**
 * @route POST /api/business-rules
 * @description Create new business rule
 * @access Private
 */
router.post('/', async (req, res) => {
  try {
    const ruleConfig = req.body;

    if (!ruleConfig.name || !ruleConfig.conditions || !ruleConfig.actions) {
      return res.status(400).json({
        success: false,
        error: 'Rule name, conditions, and actions are required'
      });
    }

    const rule = BusinessRuleEngine.createCustomRule(ruleConfig);

    res.status(201).json({
      success: true,
      rule
    });
  } catch (error) {
    logger.error('Failed to create rule', {
      error: error.message,
      config: req.body
    });

    res.status(500).json({
      success: false,
      error: 'Failed to create rule',
      message: error.message
    });
  }
});

/**
 * @route PUT /api/business-rules/:id
 * @description Update business rule
 * @access Private
 */
router.put('/:id', async (req, res) => {
  try {
    const updates = req.body;
    const rule = BusinessRuleEngine.updateRule(req.params.id, updates);

    res.json({
      success: true,
      rule
    });
  } catch (error) {
    logger.error('Failed to update rule', {
      ruleId: req.params.id,
      error: error.message
    });

    res.status(500).json({
      success: false,
      error: 'Failed to update rule',
      message: error.message
    });
  }
});

/**
 * @route DELETE /api/business-rules/:id
 * @description Delete business rule
 * @access Private
 */
router.delete('/:id', async (req, res) => {
  try {
    BusinessRuleEngine.deleteRule(req.params.id);

    res.json({
      success: true,
      message: 'Rule deleted successfully'
    });
  } catch (error) {
    logger.error('Failed to delete rule', {
      ruleId: req.params.id,
      error: error.message
    });

    res.status(500).json({
      success: false,
      error: 'Failed to delete rule',
      message: error.message
    });
  }
});

/**
 * @route POST /api/business-rules/deploy
 * @description Deploy rules to blockchain
 * @access Private
 */
router.post('/deploy', async (req, res) => {
  try {
    const { ruleIds, chain, options } = req.body;

    if (!ruleIds || !chain) {
      return res.status(400).json({
        success: false,
        error: 'Rule IDs and target chain are required'
      });
    }

    const deployment = await BusinessRuleEngine.deployRulesToChain(
      ruleIds,
      chain,
      options || {}
    );

    res.json({
      success: true,
      deployment
    });
  } catch (error) {
    logger.error('Failed to deploy rules', {
      chain: req.body.chain,
      error: error.message
    });

    res.status(500).json({
      success: false,
      error: 'Failed to deploy rules',
      message: error.message
    });
  }
});

/**
 * @route GET /api/business-rules/audit
 * @description Get audit log
 * @access Private
 */
router.get('/audit/log', async (req, res) => {
  try {
    const { event, startDate, endDate } = req.query;

    const filter = {};
    if (event) filter.event = event;
    if (startDate) filter.startDate = startDate;
    if (endDate) filter.endDate = endDate;

    const auditLog = BusinessRuleEngine.getAuditLog(filter);

    res.json({
      success: true,
      count: auditLog.length,
      entries: auditLog
    });
  } catch (error) {
    logger.error('Failed to fetch audit log', { error: error.message });

    res.status(500).json({
      success: false,
      error: 'Failed to fetch audit log',
      message: error.message
    });
  }
});

/**
 * @route GET /api/business-rules/metrics
 * @description Get BRE metrics
 * @access Private
 */
router.get('/metrics', async (req, res) => {
  try {
    const metrics = BusinessRuleEngine.getMetrics();

    res.json({
      success: true,
      metrics
    });
  } catch (error) {
    logger.error('Failed to fetch metrics', { error: error.message });

    res.status(500).json({
      success: false,
      error: 'Failed to fetch metrics',
      message: error.message
    });
  }
});

/**
 * @route GET /api/business-rules/capabilities
 * @description Get BRE capabilities
 * @access Public
 */
router.get('/capabilities', async (req, res) => {
  try {
    const capabilities = BusinessRuleEngine.getCapabilities();

    res.json({
      success: true,
      capabilities
    });
  } catch (error) {
    logger.error('Failed to fetch capabilities', { error: error.message });

    res.status(500).json({
      success: false,
      error: 'Failed to fetch capabilities',
      message: error.message
    });
  }
});

export default router;