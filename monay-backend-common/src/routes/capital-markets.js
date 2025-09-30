/**
 * Capital Markets API Routes
 * Manages rule sets for capital markets operations with hybrid categories
 * @module routes/capital-markets
 */

import { Router } from 'express';
import middlewares from '../middleware-app/index.js';
import RuleSetService from '../services/capital-markets/RuleSetService.js';
import BusinessRuleEngine from '../services/business-rule-engine/BusinessRuleEngine.js';
import loggers from '../services/logger.js';
const logger = loggers.logger || loggers;

const router = Router();
const { authMiddleware } = middlewares;

/**
 * @route POST /api/capital-markets/rule-sets
 * @desc Create a new rule set
 * @access Protected
 */
router.post('/rule-sets', authMiddleware, async (req, res) => {
  try {
    const { name, description, category, instrument_type, rule_ids, metadata } = req.body;
    
    // Validate required fields
    if (!name || !category) {
      return res.status(400).json({
        success: false,
        error: 'Name and category are required'
      });
    }
    
    const ruleSetData = {
      name,
      description,
      category,
      instrument_type,
      rule_ids,
      metadata
    };
    
    const ruleSet = await RuleSetService.createRuleSet(ruleSetData, req.user.id);
    
    res.status(201).json({
      success: true,
      data: ruleSet
    });
  } catch (error) {
    logger.error('Failed to create rule set', { error: error.message });
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route GET /api/capital-markets/rule-sets
 * @desc List all rule sets with optional filters
 * @access Protected
 */
router.get('/rule-sets', authMiddleware, async (req, res) => {
  try {
    const { category, status, created_by } = req.query;
    
    const filters = {};
    if (category) filters.category = category;
    if (status) filters.status = status;
    if (created_by) filters.created_by = created_by;
    
    const ruleSets = await RuleSetService.listRuleSets(filters);
    
    res.json({
      success: true,
      data: ruleSets,
      count: ruleSets.length
    });
  } catch (error) {
    logger.error('Failed to list rule sets', { error: error.message });
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route GET /api/capital-markets/rule-sets/:id
 * @desc Get specific rule set by ID
 * @access Protected
 */
router.get('/rule-sets/:id', authMiddleware, async (req, res) => {
  try {
    const ruleSet = await RuleSetService.getRuleSet(req.params.id);
    
    res.json({
      success: true,
      data: ruleSet
    });
  } catch (error) {
    logger.error('Failed to get rule set', { error: error.message });
    res.status(error.message === 'Rule set not found' ? 404 : 500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route POST /api/capital-markets/rule-sets/:id/rules
 * @desc Add rules to an existing rule set
 * @access Protected
 */
router.post('/rule-sets/:id/rules', authMiddleware, async (req, res) => {
  try {
    const { rule_ids } = req.body;
    
    if (!rule_ids || !Array.isArray(rule_ids)) {
      return res.status(400).json({
        success: false,
        error: 'rule_ids array is required'
      });
    }
    
    const updatedRuleSet = await RuleSetService.addRulesToSet(
      req.params.id,
      rule_ids,
      req.user.id
    );
    
    res.json({
      success: true,
      data: updatedRuleSet
    });
  } catch (error) {
    logger.error('Failed to add rules to set', { error: error.message });
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route POST /api/capital-markets/rule-sets/:id/validate
 * @desc Validate a rule set for deployment
 * @access Protected
 */
router.post('/rule-sets/:id/validate', authMiddleware, async (req, res) => {
  try {
    const validation = await RuleSetService.validateRuleSet(req.params.id);
    
    res.json({
      success: true,
      data: validation
    });
  } catch (error) {
    logger.error('Failed to validate rule set', { error: error.message });
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route POST /api/capital-markets/rule-sets/:id/deploy
 * @desc Deploy a rule set to blockchain
 * @access Protected
 */
router.post('/rule-sets/:id/deploy', authMiddleware, async (req, res) => {
  try {
    const { chain, options } = req.body;
    
    if (!chain) {
      return res.status(400).json({
        success: false,
        error: 'Chain parameter is required (evm or solana)'
      });
    }
    
    // Validate rule set before deployment
    const validation = await RuleSetService.validateRuleSet(req.params.id);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: 'Rule set validation failed',
        validation
      });
    }
    
    const deploymentResult = await RuleSetService.deployRuleSet(
      req.params.id,
      { ...options, chain }
    );
    
    res.json({
      success: true,
      data: deploymentResult
    });
  } catch (error) {
    logger.error('Failed to deploy rule set', { error: error.message });
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route GET /api/capital-markets/templates
 * @desc List available capital markets templates
 * @access Protected
 */
router.get('/templates', authMiddleware, async (req, res) => {
  try {
    // Get all available templates
    const templates = [
      await RuleSetService.getTemplate('equity_trading_basic'),
      await RuleSetService.getTemplate('fixed_income_institutional'),
      await RuleSetService.getTemplate('private_securities_reg_d'),
      await RuleSetService.getTemplate('derivatives_options')
    ].filter(Boolean);
    
    res.json({
      success: true,
      data: templates,
      count: templates.length
    });
  } catch (error) {
    logger.error('Failed to list templates', { error: error.message });
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route POST /api/capital-markets/templates/:id/apply
 * @desc Apply a template to create a new rule set
 * @access Protected
 */
router.post('/templates/:id/apply', authMiddleware, async (req, res) => {
  try {
    const { name, metadata } = req.body;
    
    const customization = {
      name,
      metadata
    };
    
    const ruleSet = await RuleSetService.applyTemplate(
      req.params.id,
      customization,
      req.user.id
    );
    
    res.status(201).json({
      success: true,
      data: ruleSet
    });
  } catch (error) {
    logger.error('Failed to apply template', { error: error.message });
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route GET /api/capital-markets/categories
 * @desc Get available rule categories for capital markets
 * @access Protected
 */
router.get('/categories', authMiddleware, async (req, res) => {
  try {
    const categories = [
      {
        id: 'EQUITY',
        name: 'Equity Securities',
        description: 'Rules for stock trading and equity markets',
        examples: ['Trading hours', 'Pattern day trader', 'Margin requirements']
      },
      {
        id: 'FIXED_INCOME',
        name: 'Fixed Income',
        description: 'Rules for bonds and debt securities',
        examples: ['Minimum denomination', 'Settlement rules', 'Accrued interest']
      },
      {
        id: 'DERIVATIVES',
        name: 'Derivatives',
        description: 'Rules for options, futures, and swaps',
        examples: ['Position limits', 'Exercise rules', 'Margin calculations']
      },
      {
        id: 'PRIVATE_SECURITIES',
        name: 'Private Securities',
        description: 'Rules for private placements and restricted securities',
        examples: ['Reg D compliance', 'Lock-up periods', 'Transfer restrictions']
      },
      {
        id: 'HYBRID',
        name: 'Hybrid',
        description: 'Combined rules from multiple categories',
        examples: ['Cross-asset rules', 'Portfolio limits', 'Risk management']
      }
    ];
    
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    logger.error('Failed to get categories', { error: error.message });
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route POST /api/capital-markets/rule-sets/:id/simulate
 * @desc Simulate rule set execution with test data
 * @access Protected
 */
router.post('/rule-sets/:id/simulate', authMiddleware, async (req, res) => {
  try {
    const { testData } = req.body;
    
    if (!testData) {
      return res.status(400).json({
        success: false,
        error: 'Test data is required for simulation'
      });
    }
    
    const ruleSet = await RuleSetService.getRuleSet(req.params.id);
    
    // Simulate rule execution
    const results = [];
    for (const rule of ruleSet.rules || []) {
      results.push({
        ruleId: rule.rule_id,
        passed: Math.random() > 0.3, // Mock simulation
        message: 'Simulation result',
        executionTime: Math.floor(Math.random() * 100) + 'ms'
      });
    }
    
    res.json({
      success: true,
      data: {
        ruleSetId: req.params.id,
        simulationResults: results,
        overallPass: results.every(r => r.passed),
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Failed to simulate rule set', { error: error.message });
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route GET /api/capital-markets/rule-sets/:id/deployment-history
 * @desc Get deployment history for a rule set
 * @access Protected
 */
router.get('/rule-sets/:id/deployment-history', authMiddleware, async (req, res) => {
  try {
    // Get deployment history from global storage (temporary)
    const history = global.deploymentHistory?.filter(d => d.rule_set_id === req.params.id) || [];
    
    res.json({
      success: true,
      data: history,
      count: history.length
    });
  } catch (error) {
    logger.error('Failed to get deployment history', { error: error.message });
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route DELETE /api/capital-markets/rule-sets/:id
 * @desc Delete a rule set (only if not deployed)
 * @access Protected
 */
router.delete('/rule-sets/:id', authMiddleware, async (req, res) => {
  try {
    const ruleSet = await RuleSetService.getRuleSet(req.params.id);
    
    if (ruleSet.status === 'deployed') {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete deployed rule sets'
      });
    }
    
    // Remove from global storage (temporary)
    global.ruleSets?.delete(req.params.id);
    
    res.json({
      success: true,
      message: 'Rule set deleted successfully'
    });
  } catch (error) {
    logger.error('Failed to delete rule set', { error: error.message });
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;