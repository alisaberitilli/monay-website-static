import express from 'express';
import webhookService, { WebhookEvents } from '../services/webhook.js';
import authenticate from '../middleware-app/auth-middleware.js';
// import { auditAction } from '../middleware-app/audit.js';  // TODO: Create audit middleware if needed

const router = express.Router();

/**
 * @route POST /api/webhooks
 * @desc Register a new webhook
 * @access Private (Admin)
 */
router.post('/',
  authenticate,
  // authorize(['admin', 'developer']),  // TODO: Add role-based authorization
  // auditAction('WEBHOOK_CREATED'),  // TODO: Add audit logging
  async (req, res) => {
    try {
      const {
        url,
        events,
        description,
        headers,
        secret
      } = req.body;

      // Validate URL
      try {
        new URL(url);
      } catch (error) {
        return res.status(400).json({
          success: false,
          error: 'Invalid webhook URL'
        });
      }

      // Validate events
      if (!events || !Array.isArray(events) || events.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'At least one event type is required'
        });
      }

      // Register webhook
      const webhook = await webhookService.registerWebhook({
        url,
        events,
        secret,
        description,
        headers,
        tenantId: req.tenant?.id
      });

      res.status(201).json({
        success: true,
        data: {
          id: webhook.id,
          url: webhook.url,
          events: webhook.events,
          secret: webhook.secret,
          description: webhook.description,
          active: webhook.active,
          createdAt: webhook.createdAt
        }
      });
    } catch (error) {
      console.error('Webhook registration error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to register webhook'
      });
    }
  }
);

/**
 * @route GET /api/webhooks
 * @desc List all webhooks
 * @access Private (Admin)
 */
router.get('/',
  authenticate,
  // authorize(['admin', 'developer']),  // TODO: Add role-based authorization
  async (req, res) => {
    try {
      const webhooks = await webhookService.listWebhooks(req.tenant?.id);

      res.json({
        success: true,
        data: webhooks.map(webhook => ({
          id: webhook.id,
          url: webhook.url,
          events: webhook.events,
          description: webhook.description,
          active: webhook.active,
          failureCount: webhook.failureCount,
          lastTriggered: webhook.lastTriggered,
          lastStatus: webhook.lastStatus,
          createdAt: webhook.createdAt
        }))
      });
    } catch (error) {
      console.error('List webhooks error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to list webhooks'
      });
    }
  }
);

/**
 * @route GET /api/webhooks/:id
 * @desc Get webhook details
 * @access Private (Admin)
 */
router.get('/:id',
  authenticate,
  // authorize(['admin', 'developer']),  // TODO: Add role-based authorization
  async (req, res) => {
    try {
      const { id } = req.params;
      const webhooks = await webhookService.listWebhooks(req.tenant?.id);
      const webhook = webhooks.find(w => w.id === id);

      if (!webhook) {
        return res.status(404).json({
          success: false,
          error: 'Webhook not found'
        });
      }

      res.json({
        success: true,
        data: {
          id: webhook.id,
          url: webhook.url,
          events: webhook.events,
          description: webhook.description,
          headers: webhook.headers,
          active: webhook.active,
          failureCount: webhook.failureCount,
          lastTriggered: webhook.lastTriggered,
          lastStatus: webhook.lastStatus,
          createdAt: webhook.createdAt,
          updatedAt: webhook.updatedAt
        }
      });
    } catch (error) {
      console.error('Get webhook error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get webhook'
      });
    }
  }
);

/**
 * @route PUT /api/webhooks/:id
 * @desc Update webhook
 * @access Private (Admin)
 */
router.put('/:id',
  authenticate,
  // authorize(['admin', 'developer']),  // TODO: Add role-based authorization
  // auditAction('WEBHOOK_UPDATED'),  // TODO: Add audit logging
  async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      // Validate URL if provided
      if (updates.url) {
        try {
          new URL(updates.url);
        } catch (error) {
          return res.status(400).json({
            success: false,
            error: 'Invalid webhook URL'
          });
        }
      }

      const webhook = await webhookService.updateWebhook(id, updates);

      res.json({
        success: true,
        data: {
          id: webhook.id,
          url: webhook.url,
          events: webhook.events,
          description: webhook.description,
          active: webhook.active,
          updatedAt: webhook.updatedAt
        }
      });
    } catch (error) {
      console.error('Update webhook error:', error);
      res.status(error.message === 'Webhook not found' ? 404 : 500).json({
        success: false,
        error: error.message || 'Failed to update webhook'
      });
    }
  }
);

/**
 * @route DELETE /api/webhooks/:id
 * @desc Delete webhook
 * @access Private (Admin)
 */
router.delete('/:id',
  authenticate,
  // authorize(['admin']),  // TODO: Add role-based authorization
  // auditAction('WEBHOOK_DELETED'),  // TODO: Add audit logging
  async (req, res) => {
    try {
      const { id } = req.params;
      await webhookService.deleteWebhook(id);

      res.json({
        success: true,
        message: 'Webhook deleted successfully'
      });
    } catch (error) {
      console.error('Delete webhook error:', error);
      res.status(error.message === 'Webhook not found' ? 404 : 500).json({
        success: false,
        error: error.message || 'Failed to delete webhook'
      });
    }
  }
);

/**
 * @route POST /api/webhooks/:id/test
 * @desc Test webhook
 * @access Private (Admin)
 */
router.post('/:id/test',
  authenticate,
  // authorize(['admin', 'developer']),  // TODO: Add role-based authorization
  async (req, res) => {
    try {
      const { id } = req.params;
      const result = await webhookService.testWebhook(id);

      res.json({
        success: true,
        message: 'Test webhook sent',
        data: result
      });
    } catch (error) {
      console.error('Test webhook error:', error);
      res.status(error.message === 'Webhook not found' ? 404 : 500).json({
        success: false,
        error: error.message || 'Failed to test webhook'
      });
    }
  }
);

/**
 * @route GET /api/webhooks/:id/stats
 * @desc Get webhook statistics
 * @access Private (Admin)
 */
router.get('/:id/stats',
  authenticate,
  // authorize(['admin', 'developer']),  // TODO: Add role-based authorization
  async (req, res) => {
    try {
      const { id } = req.params;
      const stats = await webhookService.getWebhookStats(id);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Get webhook stats error:', error);
      res.status(error.message === 'Webhook not found' ? 404 : 500).json({
        success: false,
        error: error.message || 'Failed to get webhook statistics'
      });
    }
  }
);

/**
 * @route GET /api/webhooks/:id/deliveries
 * @desc Get webhook delivery logs
 * @access Private (Admin)
 */
router.get('/:id/deliveries',
  authenticate,
  // authorize(['admin', 'developer']),  // TODO: Add role-based authorization
  async (req, res) => {
    try {
      const { id } = req.params;
      const { limit = 100 } = req.query;
      
      const logs = await webhookService.getDeliveryLogs(id, parseInt(limit));

      res.json({
        success: true,
        data: logs
      });
    } catch (error) {
      console.error('Get delivery logs error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get delivery logs'
      });
    }
  }
);

/**
 * @route POST /api/webhooks/:id/toggle
 * @desc Enable/disable webhook
 * @access Private (Admin)
 */
router.post('/:id/toggle',
  authenticate,
  // authorize(['admin', 'developer']),  // TODO: Add role-based authorization
  // auditAction('WEBHOOK_TOGGLED'),  // TODO: Add audit logging
  async (req, res) => {
    try {
      const { id } = req.params;
      const { active } = req.body;

      const webhook = await webhookService.updateWebhook(id, { active });

      res.json({
        success: true,
        message: `Webhook ${active ? 'enabled' : 'disabled'}`,
        data: {
          id: webhook.id,
          active: webhook.active
        }
      });
    } catch (error) {
      console.error('Toggle webhook error:', error);
      res.status(error.message === 'Webhook not found' ? 404 : 500).json({
        success: false,
        error: error.message || 'Failed to toggle webhook'
      });
    }
  }
);

/**
 * @route GET /api/webhooks/events/list
 * @desc List available webhook events
 * @access Private
 */
router.get('/events/list',
  authenticate,
  async (req, res) => {
    try {
      const events = Object.entries(WebhookEvents).map(([key, value]) => ({
        key,
        event: value,
        description: getEventDescription(value)
      }));

      res.json({
        success: true,
        data: events
      });
    } catch (error) {
      console.error('List events error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to list webhook events'
      });
    }
  }
);

/**
 * @route POST /api/webhooks/verify
 * @desc Verify webhook signature
 * @access Public (for webhook receivers)
 */
router.post('/verify',
  async (req, res) => {
    try {
      const signature = req.headers['x-webhook-signature'];
      const { payload, secret } = req.body;

      if (!signature || !payload || !secret) {
        return res.status(400).json({
          success: false,
          error: 'Missing required parameters'
        });
      }

      const isValid = webhookService.verifySignature(payload, signature, secret);

      res.json({
        success: true,
        valid: isValid
      });
    } catch (error) {
      console.error('Verify signature error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to verify signature'
      });
    }
  }
);

/**
 * Helper function to get event description
 */
function getEventDescription(event) {
  const descriptions = {
    'wallet.created': 'Triggered when a new wallet is created',
    'wallet.updated': 'Triggered when a wallet is updated',
    'wallet.deleted': 'Triggered when a wallet is deleted',
    'transaction.created': 'Triggered when a new transaction is initiated',
    'transaction.pending': 'Triggered when a transaction is pending',
    'transaction.completed': 'Triggered when a transaction is completed',
    'transaction.failed': 'Triggered when a transaction fails',
    'user.created': 'Triggered when a new user is created',
    'user.updated': 'Triggered when a user is updated',
    'user.deleted': 'Triggered when a user is deleted',
    'user.verified': 'Triggered when a user is verified',
    'kyc.completed': 'Triggered when KYC is completed',
    'kyc.failed': 'Triggered when KYC fails',
    'aml.alert': 'Triggered when an AML alert is raised',
    'security.alert': 'Triggered for security alerts',
    'auth.login.success': 'Triggered on successful login',
    'auth.login.failed': 'Triggered on failed login',
    'mfa.enabled': 'Triggered when MFA is enabled',
    'webhook.test': 'Test webhook event',
    'system.alert': 'Triggered for system alerts'
  };

  return descriptions[event] || 'No description available';
}

export default router;