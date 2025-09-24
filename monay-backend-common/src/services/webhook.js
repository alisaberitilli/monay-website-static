import crypto from 'crypto';
import axios from 'axios';
import { EventEmitter } from 'events';

class WebhookService extends EventEmitter {
  constructor() {
    super();
    this.queue = [];
    this.retryQueue = [];
    this.processing = false;
    this.maxRetries = 3;
    this.retryDelay = 5000; // 5 seconds
    this.batchSize = 10;
    this.timeout = 10000; // 10 seconds
    this.initializeService();
  }

  initializeService() {
    // Start processing queue
    setInterval(() => this.processQueue(), 1000);
    setInterval(() => this.processRetryQueue(), this.retryDelay);
  }

  /**
   * Register a webhook endpoint
   */
  async registerWebhook({
    url,
    events,
    secret,
    description,
    headers = {},
    active = true,
    tenantId
  }) {
    try {
      const webhookId = crypto.randomUUID();
      const signingSecret = secret || crypto.randomBytes(32).toString('hex');
      
      const webhook = {
        id: webhookId,
        url,
        events: Array.isArray(events) ? events : [events],
        secret: signingSecret,
        description,
        headers,
        active,
        tenantId,
        createdAt: new Date(),
        failureCount: 0,
        lastTriggered: null,
        lastStatus: null
      };

      // Store webhook (in production, use database)
      // For now, store in memory
      this.webhooks = this.webhooks || new Map();
      this.webhooks.set(webhookId, webhook);

      return webhook;
    } catch (error) {
      console.error('Webhook registration error:', error);
      throw error;
    }
  }

  /**
   * Trigger webhook for an event
   */
  async trigger(event, data, tenantId = null) {
    try {
      const webhooks = this.getWebhooksForEvent(event, tenantId);
      
      for (const webhook of webhooks) {
        const payload = {
          id: crypto.randomUUID(),
          event,
          data,
          timestamp: new Date().toISOString(),
          webhookId: webhook.id
        };

        // Add to queue for processing
        this.queue.push({
          webhook,
          payload,
          attempt: 0
        });
      }

      // Emit event
      this.emit('webhook:queued', { event, count: webhooks.length });
    } catch (error) {
      console.error('Webhook trigger error:', error);
    }
  }

  /**
   * Process webhook queue
   */
  async processQueue() {
    if (this.processing || this.queue.length === 0) return;
    
    this.processing = true;
    const batch = this.queue.splice(0, this.batchSize);

    await Promise.all(
      batch.map(item => this.sendWebhook(item))
    );

    this.processing = false;
  }

  /**
   * Send webhook request
   */
  async sendWebhook({ webhook, payload, attempt }) {
    try {
      // Generate signature
      const signature = this.generateSignature(payload, webhook.secret);
      
      // Prepare headers
      const headers = {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': signature,
        'X-Webhook-Event': payload.event,
        'X-Webhook-ID': payload.id,
        'X-Webhook-Timestamp': payload.timestamp,
        ...webhook.headers
      };

      // Send request
      const response = await axios.post(webhook.url, payload, {
        headers,
        timeout: this.timeout,
        validateStatus: () => true // Accept any status
      });

      // Update webhook status
      webhook.lastTriggered = new Date();
      webhook.lastStatus = response.status;

      if (response.status >= 200 && response.status < 300) {
        // Success
        webhook.failureCount = 0;
        this.emit('webhook:success', { webhookId: webhook.id, event: payload.event });
        
        // Log delivery
        await this.logDelivery({
          webhookId: webhook.id,
          payloadId: payload.id,
          status: 'success',
          statusCode: response.status,
          attempt: attempt + 1
        });
      } else {
        // Failed
        webhook.failureCount++;
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Webhook delivery error:', error);
      
      // Log failure
      await this.logDelivery({
        webhookId: webhook.id,
        payloadId: payload.id,
        status: 'failed',
        error: error.message,
        attempt: attempt + 1
      });

      // Add to retry queue if not exceeded max retries
      if (attempt < this.maxRetries) {
        this.retryQueue.push({
          webhook,
          payload,
          attempt: attempt + 1
        });
        this.emit('webhook:retry', { webhookId: webhook.id, attempt: attempt + 1 });
      } else {
        // Max retries exceeded
        this.emit('webhook:failed', { webhookId: webhook.id, event: payload.event });
        
        // Disable webhook after too many failures
        if (webhook.failureCount > 10) {
          webhook.active = false;
          this.emit('webhook:disabled', { webhookId: webhook.id });
        }
      }
    }
  }

  /**
   * Process retry queue
   */
  async processRetryQueue() {
    if (this.retryQueue.length === 0) return;
    
    const batch = this.retryQueue.splice(0, this.batchSize);
    await Promise.all(
      batch.map(item => this.sendWebhook(item))
    );
  }

  /**
   * Generate webhook signature
   */
  generateSignature(payload, secret) {
    const timestamp = Date.now();
    const message = `${timestamp}.${JSON.stringify(payload)}`;
    const signature = crypto
      .createHmac('sha256', secret)
      .update(message)
      .digest('hex');
    
    return `t=${timestamp},v1=${signature}`;
  }

  /**
   * Verify webhook signature
   */
  verifySignature(payload, signature, secret) {
    try {
      const parts = signature.split(',');
      const timestamp = parts[0].split('=')[1];
      const receivedSignature = parts[1].split('=')[1];
      
      // Check timestamp (prevent replay attacks)
      const currentTime = Date.now();
      const signatureTime = parseInt(timestamp);
      if (currentTime - signatureTime > 300000) { // 5 minutes
        return false;
      }
      
      // Verify signature
      const message = `${timestamp}.${JSON.stringify(payload)}`;
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(message)
        .digest('hex');
      
      return crypto.timingSafeEqual(
        Buffer.from(receivedSignature),
        Buffer.from(expectedSignature)
      );
    } catch (error) {
      console.error('Signature verification error:', error);
      return false;
    }
  }

  /**
   * Get webhooks for event
   */
  getWebhooksForEvent(event, tenantId = null) {
    const webhooks = [];
    
    if (!this.webhooks) return webhooks;
    
    for (const webhook of this.webhooks.values()) {
      if (!webhook.active) continue;
      if (tenantId && webhook.tenantId !== tenantId) continue;
      if (webhook.events.includes(event) || webhook.events.includes('*')) {
        webhooks.push(webhook);
      }
    }
    
    return webhooks;
  }

  /**
   * Update webhook
   */
  async updateWebhook(webhookId, updates) {
    if (!this.webhooks || !this.webhooks.has(webhookId)) {
      throw new Error('Webhook not found');
    }
    
    const webhook = this.webhooks.get(webhookId);
    Object.assign(webhook, updates, { updatedAt: new Date() });
    
    return webhook;
  }

  /**
   * Delete webhook
   */
  async deleteWebhook(webhookId) {
    if (!this.webhooks || !this.webhooks.has(webhookId)) {
      throw new Error('Webhook not found');
    }
    
    this.webhooks.delete(webhookId);
    return { success: true };
  }

  /**
   * List webhooks
   */
  async listWebhooks(tenantId = null) {
    const webhooks = [];
    
    if (!this.webhooks) return webhooks;
    
    for (const webhook of this.webhooks.values()) {
      if (!tenantId || webhook.tenantId === tenantId) {
        webhooks.push(webhook);
      }
    }
    
    return webhooks;
  }

  /**
   * Test webhook
   */
  async testWebhook(webhookId) {
    const webhook = this.webhooks?.get(webhookId);
    if (!webhook) {
      throw new Error('Webhook not found');
    }
    
    const testPayload = {
      id: crypto.randomUUID(),
      event: 'webhook.test',
      data: {
        message: 'This is a test webhook',
        timestamp: new Date().toISOString()
      },
      timestamp: new Date().toISOString(),
      webhookId
    };
    
    await this.sendWebhook({
      webhook,
      payload: testPayload,
      attempt: 0
    });
    
    return { success: true, payloadId: testPayload.id };
  }

  /**
   * Get webhook statistics
   */
  async getWebhookStats(webhookId) {
    const webhook = this.webhooks?.get(webhookId);
    if (!webhook) {
      throw new Error('Webhook not found');
    }
    
    // In production, fetch from database
    return {
      webhookId,
      totalDeliveries: 0,
      successfulDeliveries: 0,
      failedDeliveries: 0,
      avgResponseTime: 0,
      lastDelivery: webhook.lastTriggered,
      nextRetry: null
    };
  }

  /**
   * Log webhook delivery
   */
  async logDelivery(delivery) {
    // In production, store in database
    this.emit('webhook:delivery:logged', delivery);
  }

  /**
   * Get delivery logs
   */
  async getDeliveryLogs(webhookId, limit = 100) {
    // In production, fetch from database
    return [];
  }
}

// Webhook event types
export const WebhookEvents = {
  // Wallet events
  WALLET_CREATED: 'wallet.created',
  WALLET_UPDATED: 'wallet.updated',
  WALLET_DELETED: 'wallet.deleted',
  
  // Transaction events
  TRANSACTION_CREATED: 'transaction.created',
  TRANSACTION_PENDING: 'transaction.pending',
  TRANSACTION_COMPLETED: 'transaction.completed',
  TRANSACTION_FAILED: 'transaction.failed',
  
  // User events
  USER_CREATED: 'user.created',
  USER_UPDATED: 'user.updated',
  USER_DELETED: 'user.deleted',
  USER_VERIFIED: 'user.verified',
  
  // Compliance events
  KYC_COMPLETED: 'kyc.completed',
  KYC_FAILED: 'kyc.failed',
  AML_ALERT: 'aml.alert',
  
  // Security events
  SECURITY_ALERT: 'security.alert',
  LOGIN_SUCCESS: 'auth.login.success',
  LOGIN_FAILED: 'auth.login.failed',
  MFA_ENABLED: 'mfa.enabled',
  
  // System events
  WEBHOOK_TEST: 'webhook.test',
  SYSTEM_ALERT: 'system.alert'
};

// Singleton instance
const webhookService = new WebhookService();

export default webhookService;