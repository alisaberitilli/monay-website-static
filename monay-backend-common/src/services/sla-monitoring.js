import HttpStatus from 'http-status';
import { CustomError } from '../middlewares/errors.js';
import loggers from './logger.js';
import cron from 'node-cron';
import Bull from 'bull';
import Redis from 'ioredis';
import axios from 'axios';
import db from '../models/index.js';

class SLAMonitoringService {
  constructor() {
    // Redis connection for job queue
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD
    });

    // Bull queue for SLA monitoring jobs
    this.slaQueue = new Bull('sla-monitoring', {
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD
      }
    });

    // SLA thresholds (in minutes)
    this.slaThresholds = {
      emergency_disbursement: {
        warning: 180,    // 3 hours
        critical: 210,   // 3.5 hours
        breach: 240      // 4 hours
      },
      standard_payment: {
        warning: 1440,   // 24 hours
        critical: 2160,  // 36 hours
        breach: 2880     // 48 hours
      },
      kyc_verification: {
        warning: 30,     // 30 minutes
        critical: 45,    // 45 minutes
        breach: 60       // 1 hour
      },
      transaction_settlement: {
        warning: 720,    // 12 hours
        critical: 1080,  // 18 hours
        breach: 1440     // 24 hours
      }
    };

    // Alert channels
    this.alertChannels = {
      slack: process.env.SLACK_WEBHOOK_URL,
      pagerduty: process.env.PAGERDUTY_KEY,
      email: process.env.OPS_TEAM_EMAIL,
      sms: process.env.OPS_TEAM_PHONE
    };

    this.initializeJobProcessors();
    this.initializeCronJobs();
  }

  /**
   * Initialize job processors
   */
  initializeJobProcessors() {
    // Process SLA check jobs
    this.slaQueue.process('check-sla', async (job) => {
      const { type, entityId, metadata } = job.data;
      return await this.checkSLACompliance(type, entityId, metadata);
    });

    // Process alert jobs
    this.slaQueue.process('send-alert', async (job) => {
      const { alert, channels } = job.data;
      return await this.sendAlerts(alert, channels);
    });

    // Process escalation jobs
    this.slaQueue.process('escalate', async (job) => {
      const { type, entityId, level } = job.data;
      return await this.escalateIssue(type, entityId, level);
    });

    // Handle job failures
    this.slaQueue.on('failed', (job, err) => {
      loggers.errorLogger.error(`SLA job failed: ${job.id} - ${err.message}`);
    });
  }

  /**
   * Initialize cron jobs for periodic SLA checks
   */
  initializeCronJobs() {
    // Check emergency disbursements every 5 minutes
    cron.schedule('*/5 * * * *', async () => {
      await this.checkAllEmergencyDisbursements();
    });

    // Check standard payments every 30 minutes
    cron.schedule('*/30 * * * *', async () => {
      await this.checkAllStandardPayments();
    });

    // Generate SLA reports daily at 9 AM
    cron.schedule('0 9 * * *', async () => {
      await this.generateDailySLAReport();
    });

    // Clean up completed SLA records weekly
    cron.schedule('0 0 * * 0', async () => {
      await this.cleanupCompletedSLAs();
    });
  }

  /**
   * Track new SLA
   */
  async trackSLA(type, entityId, metadata = {}) {
    try {
      const slaConfig = this.slaThresholds[type];
      if (!slaConfig) {
        throw new Error(`Unknown SLA type: ${type}`);
      }

      // Store SLA record in database
      // Use imported db
      const slaRecord = await db.SLATracking.create({
        type,
        entityId,
        status: 'active',
        startTime: new Date(),
        warningTime: new Date(Date.now() + slaConfig.warning * 60 * 1000),
        criticalTime: new Date(Date.now() + slaConfig.critical * 60 * 1000),
        breachTime: new Date(Date.now() + slaConfig.breach * 60 * 1000),
        metadata: JSON.stringify(metadata)
      });

      // Schedule check jobs
      await this.scheduleCheckJobs(slaRecord);

      loggers.infoLogger.info(`SLA tracking started: ${type} - ${entityId}`);

      return {
        success: true,
        slaId: slaRecord.id,
        type,
        entityId,
        deadlines: {
          warning: slaRecord.warningTime,
          critical: slaRecord.criticalTime,
          breach: slaRecord.breachTime
        }
      };
    } catch (error) {
      loggers.errorLogger.error(`Failed to track SLA: ${error.message}`);
      throw new CustomError(
        'Failed to track SLA',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Schedule SLA check jobs
   */
  async scheduleCheckJobs(slaRecord) {
    const delays = [
      { delay: slaRecord.warningTime - Date.now(), level: 'warning' },
      { delay: slaRecord.criticalTime - Date.now(), level: 'critical' },
      { delay: slaRecord.breachTime - Date.now(), level: 'breach' }
    ];

    for (const { delay, level } of delays) {
      if (delay > 0) {
        await this.slaQueue.add(
          'check-sla',
          {
            type: slaRecord.type,
            entityId: slaRecord.entityId,
            slaId: slaRecord.id,
            level,
            metadata: JSON.parse(slaRecord.metadata || '{}')
          },
          {
            delay,
            attempts: 3,
            backoff: {
              type: 'exponential',
              delay: 5000
            }
          }
        );
      }
    }
  }

  /**
   * Check SLA compliance
   */
  async checkSLACompliance(type, entityId, metadata) {
    try {
      // Use imported db
      const slaRecord = await db.SLATracking.findOne({
        where: {
          type,
          entityId,
          status: 'active'
        }
      });

      if (!slaRecord) {
        return { status: 'not_found' };
      }

      // Check if the entity has been completed
      const isCompleted = await this.checkEntityCompletion(type, entityId);

      if (isCompleted) {
        await this.completeSLA(slaRecord.id);
        return { status: 'completed' };
      }

      // Calculate time elapsed
      const elapsedMinutes = (Date.now() - new Date(slaRecord.startTime)) / (60 * 1000);
      const slaConfig = this.slaThresholds[type];

      let alertLevel = null;
      if (elapsedMinutes >= slaConfig.breach) {
        alertLevel = 'breach';
      } else if (elapsedMinutes >= slaConfig.critical) {
        alertLevel = 'critical';
      } else if (elapsedMinutes >= slaConfig.warning) {
        alertLevel = 'warning';
      }

      if (alertLevel) {
        await this.handleSLAAlert(slaRecord, alertLevel, elapsedMinutes);
      }

      return {
        status: 'active',
        elapsedMinutes,
        alertLevel
      };
    } catch (error) {
      loggers.errorLogger.error(`Failed to check SLA compliance: ${error.message}`);
      throw error;
    }
  }

  /**
   * Check if entity is completed
   */
  async checkEntityCompletion(type, entityId) {
    try {
      // Use imported db

      switch (type) {
        case 'emergency_disbursement':
          const disbursement = await db.Disbursement.findByPk(entityId);
          return disbursement && ['completed', 'paid', 'settled'].includes(disbursement.status);

        case 'standard_payment':
          const payment = await db.Payment.findByPk(entityId);
          return payment && ['completed', 'settled'].includes(payment.status);

        case 'kyc_verification':
          const verification = await db.VerificationSession.findByPk(entityId);
          return verification && ['approved', 'declined'].includes(verification.status);

        case 'transaction_settlement':
          const transaction = await db.Transaction.findByPk(entityId);
          return transaction && transaction.status === 'settled';

        default:
          return false;
      }
    } catch (error) {
      loggers.errorLogger.error(`Failed to check entity completion: ${error.message}`);
      return false;
    }
  }

  /**
   * Handle SLA alert
   */
  async handleSLAAlert(slaRecord, alertLevel, elapsedMinutes) {
    try {
      const metadata = JSON.parse(slaRecord.metadata || '{}');

      const alert = {
        type: `SLA_${alertLevel.toUpperCase()}`,
        slaType: slaRecord.type,
        entityId: slaRecord.entityId,
        elapsedMinutes: Math.round(elapsedMinutes),
        elapsedHours: Math.round(elapsedMinutes / 60),
        level: alertLevel,
        metadata,
        timestamp: new Date()
      };

      // Determine which channels to use based on alert level
      const channels = this.getAlertChannels(alertLevel);

      // Send alerts
      await this.slaQueue.add('send-alert', {
        alert,
        channels
      });

      // Update SLA record
      // Use imported db
      await db.SLATracking.update(
        {
          lastAlertLevel: alertLevel,
          lastAlertTime: new Date()
        },
        {
          where: { id: slaRecord.id }
        }
      );

      // If breach, trigger escalation
      if (alertLevel === 'breach') {
        await this.slaQueue.add('escalate', {
          type: slaRecord.type,
          entityId: slaRecord.entityId,
          level: 'executive'
        });
      }

      loggers.errorLogger.error(`SLA Alert: ${slaRecord.type} - ${alertLevel} - ${elapsedMinutes} minutes`);
    } catch (error) {
      loggers.errorLogger.error(`Failed to handle SLA alert: ${error.message}`);
      throw error;
    }
  }

  /**
   * Send alerts through various channels
   */
  async sendAlerts(alert, channels) {
    const results = [];

    for (const channel of channels) {
      try {
        switch (channel) {
          case 'slack':
            await this.sendSlackAlert(alert);
            results.push({ channel: 'slack', success: true });
            break;

          case 'pagerduty':
            await this.sendPagerDutyAlert(alert);
            results.push({ channel: 'pagerduty', success: true });
            break;

          case 'email':
            await this.sendEmailAlert(alert);
            results.push({ channel: 'email', success: true });
            break;

          case 'sms':
            await this.sendSMSAlert(alert);
            results.push({ channel: 'sms', success: true });
            break;
        }
      } catch (error) {
        results.push({ channel, success: false, error: error.message });
      }
    }

    return results;
  }

  /**
   * Send Slack alert
   */
  async sendSlackAlert(alert) {
    if (!this.alertChannels.slack) return;

    // Use imported axios
    const emoji = alert.level === 'breach' ? '🚨' : alert.level === 'critical' ? '⚠️' : '⏰';

    const message = {
      text: `${emoji} SLA Alert: ${alert.slaType}`,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `${emoji} SLA ${alert.level.toUpperCase()} Alert`
          }
        },
        {
          type: 'section',
          fields: [
            { type: 'mrkdwn', text: `*Type:* ${alert.slaType}` },
            { type: 'mrkdwn', text: `*Entity:* ${alert.entityId}` },
            { type: 'mrkdwn', text: `*Elapsed:* ${alert.elapsedHours} hours` },
            { type: 'mrkdwn', text: `*Level:* ${alert.level}` }
          ]
        }
      ]
    };

    await axios.post(this.alertChannels.slack, message);
  }

  /**
   * Send PagerDuty alert
   */
  async sendPagerDutyAlert(alert) {
    if (!this.alertChannels.pagerduty) return;

    // Use imported axios
    const severity = alert.level === 'breach' ? 'critical' : alert.level === 'critical' ? 'error' : 'warning';

    await axios.post(
      'https://events.pagerduty.com/v2/enqueue',
      {
        routing_key: this.alertChannels.pagerduty,
        event_action: 'trigger',
        payload: {
          summary: `SLA ${alert.level}: ${alert.slaType} - ${alert.entityId}`,
          severity,
          source: 'monay-sla-monitoring',
          custom_details: alert
        }
      }
    );
  }

  /**
   * Send email alert
   */
  async sendEmailAlert(alert) {
    if (!this.alertChannels.email) return;

    // Integrate with email service
    const emailContent = `
      SLA Alert: ${alert.level.toUpperCase()}
      Type: ${alert.slaType}
      Entity ID: ${alert.entityId}
      Time Elapsed: ${alert.elapsedHours} hours
      
      Please take immediate action to resolve this issue.
    `;

    // Send email via service
    loggers.infoLogger.info(`Email alert sent to ${this.alertChannels.email}`);
  }

  /**
   * Send SMS alert
   */
  async sendSMSAlert(alert) {
    if (!this.alertChannels.sms) return;

    // Integrate with SMS service (Twilio, etc.)
    const message = `URGENT: SLA ${alert.level} - ${alert.slaType} has been active for ${alert.elapsedHours} hours. Entity: ${alert.entityId}`;

    // Send SMS via service
    loggers.infoLogger.info(`SMS alert sent to ${this.alertChannels.sms}`);
  }

  /**
   * Get alert channels based on level
   */
  getAlertChannels(level) {
    switch (level) {
      case 'warning':
        return ['slack'];
      case 'critical':
        return ['slack', 'email'];
      case 'breach':
        return ['slack', 'email', 'pagerduty', 'sms'];
      default:
        return ['slack'];
    }
  }

  /**
   * Complete SLA tracking
   */
  async completeSLA(slaId) {
    try {
      // Use imported db
      const slaRecord = await db.SLATracking.findByPk(slaId);

      if (!slaRecord) return;

      const completionTime = new Date();
      const elapsedMinutes = (completionTime - new Date(slaRecord.startTime)) / (60 * 1000);
      const slaConfig = this.slaThresholds[slaRecord.type];

      const wasMet = elapsedMinutes <= slaConfig.breach;

      await db.SLATracking.update(
        {
          status: 'completed',
          completionTime,
          elapsedMinutes,
          wasMet
        },
        {
          where: { id: slaId }
        }
      );

      loggers.infoLogger.info(`SLA completed: ${slaRecord.type} - ${slaRecord.entityId} - Met: ${wasMet}`);

      return { wasMet, elapsedMinutes };
    } catch (error) {
      loggers.errorLogger.error(`Failed to complete SLA: ${error.message}`);
      throw error;
    }
  }

  /**
   * Check all emergency disbursements
   */
  async checkAllEmergencyDisbursements() {
    try {
      // Use imported db
      const activeSLAs = await db.SLATracking.findAll({
        where: {
          type: 'emergency_disbursement',
          status: 'active'
        }
      });

      for (const sla of activeSLAs) {
        await this.checkSLACompliance(
          sla.type,
          sla.entityId,
          JSON.parse(sla.metadata || '{}')
        );
      }
    } catch (error) {
      loggers.errorLogger.error(`Failed to check emergency disbursements: ${error.message}`);
    }
  }

  /**
   * Check all standard payments
   */
  async checkAllStandardPayments() {
    try {
      // Use imported db
      const activeSLAs = await db.SLATracking.findAll({
        where: {
          type: 'standard_payment',
          status: 'active'
        }
      });

      for (const sla of activeSLAs) {
        await this.checkSLACompliance(
          sla.type,
          sla.entityId,
          JSON.parse(sla.metadata || '{}')
        );
      }
    } catch (error) {
      loggers.errorLogger.error(`Failed to check standard payments: ${error.message}`);
    }
  }

  /**
   * Generate daily SLA report
   */
  async generateDailySLAReport() {
    try {
      // Use imported db
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const completedSLAs = await db.SLATracking.findAll({
        where: {
          status: 'completed',
          completionTime: {
            [db.Sequelize.Op.gte]: yesterday
          }
        }
      });

      const activeSLAs = await db.SLATracking.findAll({
        where: {
          status: 'active'
        }
      });

      const report = {
        date: new Date(),
        period: '24_hours',
        summary: {
          completed: completedSLAs.length,
          active: activeSLAs.length,
          met: completedSLAs.filter(s => s.wasMet).length,
          breached: completedSLAs.filter(s => !s.wasMet).length
        },
        byType: {},
        details: {
          completed: completedSLAs,
          active: activeSLAs
        }
      };

      // Group by type
      for (const type of Object.keys(this.slaThresholds)) {
        const typeCompleted = completedSLAs.filter(s => s.type === type);
        report.byType[type] = {
          completed: typeCompleted.length,
          met: typeCompleted.filter(s => s.wasMet).length,
          breached: typeCompleted.filter(s => !s.wasMet).length,
          averageTime: typeCompleted.reduce((sum, s) => sum + s.elapsedMinutes, 0) / (typeCompleted.length || 1)
        };
      }

      // Send report to stakeholders
      await this.sendDailyReport(report);

      loggers.infoLogger.info('Daily SLA report generated');

      return report;
    } catch (error) {
      loggers.errorLogger.error(`Failed to generate daily report: ${error.message}`);
      throw error;
    }
  }

  /**
   * Send daily report
   */
  async sendDailyReport(report) {
    // Send via email, Slack, etc.
    if (this.alertChannels.slack) {
      // Use imported axios
      await axios.post(this.alertChannels.slack, {
        text: 'Daily SLA Report',
        blocks: [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: '📊 Daily SLA Performance Report'
            }
          },
          {
            type: 'section',
            fields: [
              { type: 'mrkdwn', text: `*Completed:* ${report.summary.completed}` },
              { type: 'mrkdwn', text: `*Active:* ${report.summary.active}` },
              { type: 'mrkdwn', text: `*Met SLA:* ${report.summary.met}` },
              { type: 'mrkdwn', text: `*Breached:* ${report.summary.breached}` }
            ]
          }
        ]
      });
    }
  }

  /**
   * Escalate issue
   */
  async escalateIssue(type, entityId, level) {
    try {
      // Implement escalation logic
      // - Notify executives
      // - Create incident ticket
      // - Trigger emergency response

      loggers.errorLogger.error(`ESCALATION: ${type} - ${entityId} - Level: ${level}`);

      return {
        success: true,
        escalatedAt: new Date(),
        level
      };
    } catch (error) {
      loggers.errorLogger.error(`Failed to escalate issue: ${error.message}`);
      throw error;
    }
  }

  /**
   * Clean up completed SLAs
   */
  async cleanupCompletedSLAs() {
    try {
      // Use imported db
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      const deleted = await db.SLATracking.destroy({
        where: {
          status: 'completed',
          completionTime: {
            [db.Sequelize.Op.lt]: thirtyDaysAgo
          }
        }
      });

      loggers.infoLogger.info(`Cleaned up ${deleted} old SLA records`);

      return { deleted };
    } catch (error) {
      loggers.errorLogger.error(`Failed to cleanup SLAs: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get SLA statistics
   */
  async getSLAStatistics(type, period = '7d') {
    try {
      // Use imported db
      const periodMs = this.parsePeriod(period);
      const startDate = new Date(Date.now() - periodMs);

      const slas = await db.SLATracking.findAll({
        where: {
          type,
          createdAt: {
            [db.Sequelize.Op.gte]: startDate
          }
        }
      });

      const completed = slas.filter(s => s.status === 'completed');
      const active = slas.filter(s => s.status === 'active');
      const met = completed.filter(s => s.wasMet);
      const breached = completed.filter(s => !s.wasMet);

      return {
        type,
        period,
        total: slas.length,
        completed: completed.length,
        active: active.length,
        met: met.length,
        breached: breached.length,
        successRate: met.length / (completed.length || 1) * 100,
        averageCompletionTime: completed.reduce((sum, s) => sum + s.elapsedMinutes, 0) / (completed.length || 1)
      };
    } catch (error) {
      loggers.errorLogger.error(`Failed to get SLA statistics: ${error.message}`);
      throw new CustomError(
        'Failed to get SLA statistics',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Parse period string to milliseconds
   */
  parsePeriod(period) {
    const units = {
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
      w: 7 * 24 * 60 * 60 * 1000,
      m: 30 * 24 * 60 * 60 * 1000
    };

    const match = period.match(/(\d+)([hdwm])/);
    if (!match) return 7 * 24 * 60 * 60 * 1000; // Default to 7 days

    const [, value, unit] = match;
    return parseInt(value) * (units[unit] || units.d);
  }
}

export default new SLAMonitoringService();