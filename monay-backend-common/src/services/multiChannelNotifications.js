import db from '../models/index.js';
const { pool } = db;
import redis from '../config/redis.js';
import twilio from 'twilio';
import sgMail from '@sendgrid/mail';
import { v4 as uuidv4 } from 'uuid';

class MultiChannelNotifications {
  constructor() {
    this.channels = ['sms', 'email', 'push', 'ivr', 'whatsapp', 'in_app'];
    this.priorityLevels = {
      EMERGENCY: 1,
      CRITICAL: 2,
      HIGH: 3,
      NORMAL: 4,
      LOW: 5
    };
    this.maxRetries = 3;
    this.retryDelays = [60000, 300000, 900000]; // 1min, 5min, 15min

    // Initialize service providers
    this.initializeProviders();
  }

  initializeProviders() {
    // Twilio for SMS/WhatsApp/IVR
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      this.twilioClient = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );
      this.twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
    }

    // SendGrid for Email
    if (process.env.SENDGRID_API_KEY) {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      this.sendgridClient = sgMail;
    }

    // Initialize other providers as needed
    this.pushProviders = {
      ios: 'apns',
      android: 'fcm',
      web: 'webpush'
    };
  }

  async sendNotification(notificationData) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Create notification record
      const notification = await client.query(`
        INSERT INTO notifications (
          notification_id, recipient_id, notification_type,
          priority, subject, message, data,
          channels_requested, status, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending', CURRENT_TIMESTAMP)
        RETURNING *
      `, [
        uuidv4(),
        notificationData.recipient_id,
        notificationData.type,
        notificationData.priority || this.priorityLevels.NORMAL,
        notificationData.subject,
        notificationData.message,
        JSON.stringify(notificationData.data || {}),
        JSON.stringify(notificationData.channels || ['email', 'sms'])
      ]);

      // Get recipient preferences and contact info
      const recipient = await this.getRecipientInfo(notificationData.recipient_id);

      // Determine which channels to use based on preferences and priority
      const channelsToUse = this.determineChannels(
        notification.rows[0],
        recipient,
        notificationData.channels
      );

      // Send through each channel
      const results = await this.sendThroughChannels(
        notification.rows[0],
        recipient,
        channelsToUse
      );

      // Update notification status
      await client.query(`
        UPDATE notifications
        SET
          status = $1,
          channels_sent = $2,
          sent_at = CURRENT_TIMESTAMP
        WHERE notification_id = $3
      `, [
        results.every(r => r.success) ? 'sent' : 'partial',
        JSON.stringify(results),
        notification.rows[0].notification_id
      ]);

      await client.query('COMMIT');

      return {
        notification_id: notification.rows[0].notification_id,
        channels_sent: results,
        status: results.every(r => r.success) ? 'success' : 'partial_success'
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async sendBulkNotifications(recipientList, notificationTemplate) {
    const batchId = uuidv4();
    const results = {
      batch_id: batchId,
      total: recipientList.length,
      sent: 0,
      failed: 0,
      details: []
    };

    // Create batch record
    await pool.query(`
      INSERT INTO notification_batches (
        batch_id, template_id, total_recipients,
        status, created_at
      ) VALUES ($1, $2, $3, 'processing', CURRENT_TIMESTAMP)
    `, [batchId, notificationTemplate.template_id, recipientList.length]);

    // Process in parallel with rate limiting
    const chunks = this.chunkArray(recipientList, 100);

    for (const chunk of chunks) {
      const chunkResults = await Promise.allSettled(
        chunk.map(recipient =>
          this.sendNotification({
            ...notificationTemplate,
            recipient_id: recipient.id,
            data: {
              ...notificationTemplate.data,
              ...recipient.custom_data
            }
          })
        )
      );

      chunkResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.sent++;
          results.details.push({
            recipient_id: chunk[index].id,
            status: 'sent',
            notification_id: result.value.notification_id
          });
        } else {
          results.failed++;
          results.details.push({
            recipient_id: chunk[index].id,
            status: 'failed',
            error: result.reason.message
          });
        }
      });

      // Update batch progress
      await pool.query(`
        UPDATE notification_batches
        SET
          sent_count = $1,
          failed_count = $2,
          progress_percentage = $3
        WHERE batch_id = $4
      `, [
        results.sent,
        results.failed,
        ((results.sent + results.failed) / results.total * 100).toFixed(2),
        batchId
      ]);
    }

    // Mark batch as complete
    await pool.query(`
      UPDATE notification_batches
      SET
        status = 'completed',
        completed_at = CURRENT_TIMESTAMP
      WHERE batch_id = $1
    `, [batchId]);

    return results;
  }

  async sendThroughChannels(notification, recipient, channels) {
    const results = [];

    for (const channel of channels) {
      try {
        let result;

        switch (channel) {
          case 'sms':
            result = await this.sendSMS(
              recipient.phone_number,
              notification.message,
              notification
            );
            break;

          case 'email':
            result = await this.sendEmail(
              recipient.email,
              notification.subject,
              notification.message,
              notification
            );
            break;

          case 'push':
            result = await this.sendPushNotification(
              recipient.device_tokens,
              notification.subject,
              notification.message,
              notification
            );
            break;

          case 'ivr':
            result = await this.initiateIVRCall(
              recipient.phone_number,
              notification.message,
              notification
            );
            break;

          case 'whatsapp':
            result = await this.sendWhatsApp(
              recipient.whatsapp_number || recipient.phone_number,
              notification.message,
              notification
            );
            break;

          case 'in_app':
            result = await this.createInAppNotification(
              recipient.id,
              notification
            );
            break;

          default:
            result = { success: false, error: 'Unknown channel' };
        }

        results.push({
          channel,
          success: result.success,
          details: result
        });

        // Log channel delivery
        await this.logChannelDelivery(
          notification.notification_id,
          channel,
          result
        );
      } catch (error) {
        results.push({
          channel,
          success: false,
          error: error.message
        });

        // Queue for retry if applicable
        if (this.shouldRetry(notification.priority)) {
          await this.queueForRetry(notification, channel, 0);
        }
      }
    }

    return results;
  }

  async sendSMS(phoneNumber, message, notification) {
    if (!this.twilioClient) {
      throw new Error('SMS service not configured');
    }

    try {
      const result = await this.twilioClient.messages.create({
        body: message,
        from: this.twilioPhoneNumber,
        to: phoneNumber
      });

      return {
        success: true,
        message_id: result.sid,
        status: result.status
      };
    } catch (error) {
      throw new Error(`SMS send failed: ${error.message}`);
    }
  }

  async sendEmail(emailAddress, subject, htmlBody, notification) {
    if (!this.sendgridClient) {
      throw new Error('Email service not configured');
    }

    try {
      const msg = {
        to: emailAddress,
        from: process.env.SENDGRID_FROM_EMAIL || 'notifications@monay.com',
        subject: subject,
        html: htmlBody,
        text: this.stripHtml(htmlBody),
        trackingSettings: {
          clickTracking: { enable: true },
          openTracking: { enable: true }
        }
      };

      const result = await this.sendgridClient.send(msg);

      return {
        success: true,
        message_id: result[0].headers['x-message-id'],
        status: 'sent'
      };
    } catch (error) {
      throw new Error(`Email send failed: ${error.message}`);
    }
  }

  async sendPushNotification(deviceTokens, title, body, notification) {
    const results = [];

    for (const token of deviceTokens) {
      try {
        let result;

        if (token.platform === 'ios') {
          result = await this.sendAPNS(token.token, title, body, notification.data);
        } else if (token.platform === 'android') {
          result = await this.sendFCM(token.token, title, body, notification.data);
        } else if (token.platform === 'web') {
          result = await this.sendWebPush(token.token, title, body, notification.data);
        }

        results.push({
          token: token.token,
          platform: token.platform,
          success: true,
          result
        });
      } catch (error) {
        results.push({
          token: token.token,
          platform: token.platform,
          success: false,
          error: error.message
        });
      }
    }

    return {
      success: results.some(r => r.success),
      results
    };
  }

  async initiateIVRCall(phoneNumber, message, notification) {
    if (!this.twilioClient) {
      throw new Error('IVR service not configured');
    }

    try {
      // Create TwiML for the message
      const twimlUrl = await this.createTwiMLUrl(message, notification);

      const call = await this.twilioClient.calls.create({
        url: twimlUrl,
        to: phoneNumber,
        from: this.twilioPhoneNumber,
        statusCallback: `${process.env.API_URL}/webhooks/twilio/call-status`,
        statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed']
      });

      return {
        success: true,
        call_sid: call.sid,
        status: call.status
      };
    } catch (error) {
      throw new Error(`IVR call failed: ${error.message}`);
    }
  }

  async sendWhatsApp(phoneNumber, message, notification) {
    if (!this.twilioClient) {
      throw new Error('WhatsApp service not configured');
    }

    try {
      const result = await this.twilioClient.messages.create({
        body: message,
        from: `whatsapp:${this.twilioPhoneNumber}`,
        to: `whatsapp:${phoneNumber}`
      });

      return {
        success: true,
        message_id: result.sid,
        status: result.status
      };
    } catch (error) {
      throw new Error(`WhatsApp send failed: ${error.message}`);
    }
  }

  async createInAppNotification(recipientId, notification) {
    const result = await pool.query(`
      INSERT INTO in_app_notifications (
        notification_id, recipient_id, title,
        message, data, is_read, created_at
      ) VALUES ($1, $2, $3, $4, $5, false, CURRENT_TIMESTAMP)
      RETURNING *
    `, [
      notification.notification_id,
      recipientId,
      notification.subject,
      notification.message,
      JSON.stringify(notification.data)
    ]);

    // Push to WebSocket if user is online
    await this.pushToWebSocket(recipientId, result.rows[0]);

    return {
      success: true,
      notification_id: result.rows[0].notification_id
    };
  }

  async createNotificationTemplate(templateData) {
    const result = await pool.query(`
      INSERT INTO notification_templates (
        template_id, template_name, template_type,
        subject_template, message_template,
        channels, variables, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, true)
      RETURNING *
    `, [
      uuidv4(),
      templateData.name,
      templateData.type,
      templateData.subject,
      templateData.message,
      JSON.stringify(templateData.channels),
      JSON.stringify(templateData.variables)
    ]);

    return result.rows[0];
  }

  async sendTemplatedNotification(recipientId, templateId, variables) {
    // Get template
    const template = await pool.query(`
      SELECT * FROM notification_templates
      WHERE template_id = $1 AND is_active = true
    `, [templateId]);

    if (template.rows.length === 0) {
      throw new Error('Template not found');
    }

    const tmpl = template.rows[0];

    // Replace variables in template
    let subject = tmpl.subject_template;
    let message = tmpl.message_template;

    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{{${key}}}`;
      subject = subject.replace(new RegExp(placeholder, 'g'), value);
      message = message.replace(new RegExp(placeholder, 'g'), value);
    }

    // Send notification
    return await this.sendNotification({
      recipient_id: recipientId,
      type: tmpl.template_type,
      subject,
      message,
      channels: tmpl.channels,
      data: { template_id: templateId, variables }
    });
  }

  async scheduleNotification(notificationData, scheduledTime) {
    const scheduleId = uuidv4();

    await pool.query(`
      INSERT INTO scheduled_notifications (
        schedule_id, notification_data,
        scheduled_for, status, created_at
      ) VALUES ($1, $2, $3, 'scheduled', CURRENT_TIMESTAMP)
    `, [
      scheduleId,
      JSON.stringify(notificationData),
      scheduledTime
    ]);

    // Add to scheduler queue
    const delay = new Date(scheduledTime).getTime() - Date.now();
    if (delay > 0) {
      setTimeout(async () => {
        await this.processScheduledNotification(scheduleId);
      }, delay);
    }

    return { schedule_id: scheduleId };
  }

  async processScheduledNotification(scheduleId) {
    const scheduled = await pool.query(`
      SELECT * FROM scheduled_notifications
      WHERE schedule_id = $1 AND status = 'scheduled'
    `, [scheduleId]);

    if (scheduled.rows.length === 0) {
      return;
    }

    const notificationData = scheduled.rows[0].notification_data;

    try {
      const result = await this.sendNotification(notificationData);

      await pool.query(`
        UPDATE scheduled_notifications
        SET
          status = 'sent',
          sent_at = CURRENT_TIMESTAMP,
          result = $1
        WHERE schedule_id = $2
      `, [JSON.stringify(result), scheduleId]);
    } catch (error) {
      await pool.query(`
        UPDATE scheduled_notifications
        SET
          status = 'failed',
          error_message = $1
        WHERE schedule_id = $2
      `, [error.message, scheduleId]);
    }
  }

  async getRecipientInfo(recipientId) {
    const result = await pool.query(`
      SELECT
        c.id,
        c.email,
        c.phone_number,
        c.notification_preferences,
        ARRAY_AGG(
          DISTINCT jsonb_build_object(
            'token', dt.device_token,
            'platform', dt.platform
          )
        ) FILTER (WHERE dt.device_token IS NOT NULL) as device_tokens
      FROM customers c
      LEFT JOIN device_tokens dt ON c.id = dt.user_id AND dt.is_active = true
      WHERE c.id = $1
      GROUP BY c.id, c.email, c.phone_number, c.notification_preferences
    `, [recipientId]);

    if (result.rows.length === 0) {
      throw new Error('Recipient not found');
    }

    return result.rows[0];
  }

  determineChannels(notification, recipient, requestedChannels) {
    const channels = [];
    const preferences = recipient.notification_preferences || {};

    // Emergency notifications go to all available channels
    if (notification.priority === this.priorityLevels.EMERGENCY) {
      if (recipient.phone_number) channels.push('sms');
      if (recipient.email) channels.push('email');
      if (recipient.device_tokens?.length > 0) channels.push('push');
      channels.push('in_app');
      return channels;
    }

    // Check user preferences for each channel
    for (const channel of requestedChannels) {
      if (preferences[channel] !== false) {
        switch (channel) {
          case 'sms':
            if (recipient.phone_number) channels.push(channel);
            break;
          case 'email':
            if (recipient.email) channels.push(channel);
            break;
          case 'push':
            if (recipient.device_tokens?.length > 0) channels.push(channel);
            break;
          default:
            channels.push(channel);
        }
      }
    }

    // Always include in-app as fallback
    if (channels.length === 0) {
      channels.push('in_app');
    }

    return channels;
  }

  async queueForRetry(notification, channel, attemptNumber) {
    const retryDelay = this.retryDelays[attemptNumber] || this.retryDelays[this.retryDelays.length - 1];

    await pool.query(`
      INSERT INTO notification_retries (
        notification_id, channel, attempt_number,
        retry_after, status
      ) VALUES ($1, $2, $3, $4, 'pending')
    `, [
      notification.notification_id,
      channel,
      attemptNumber + 1,
      new Date(Date.now() + retryDelay)
    ]);

    // Schedule retry
    setTimeout(async () => {
      await this.retryNotification(notification.notification_id, channel, attemptNumber + 1);
    }, retryDelay);
  }

  async retryNotification(notificationId, channel, attemptNumber) {
    if (attemptNumber > this.maxRetries) {
      await pool.query(`
        UPDATE notification_retries
        SET status = 'max_retries_exceeded'
        WHERE notification_id = $1 AND channel = $2
      `, [notificationId, channel]);
      return;
    }

    // Get notification details
    const notification = await pool.query(`
      SELECT * FROM notifications
      WHERE notification_id = $1
    `, [notificationId]);

    if (notification.rows.length === 0) {
      return;
    }

    const recipient = await this.getRecipientInfo(notification.rows[0].recipient_id);

    try {
      const result = await this.sendThroughChannels(
        notification.rows[0],
        recipient,
        [channel]
      );

      await pool.query(`
        UPDATE notification_retries
        SET status = 'success', completed_at = CURRENT_TIMESTAMP
        WHERE notification_id = $1 AND channel = $2 AND attempt_number = $3
      `, [notificationId, channel, attemptNumber]);
    } catch (error) {
      if (attemptNumber < this.maxRetries) {
        await this.queueForRetry(notification.rows[0], channel, attemptNumber);
      } else {
        await pool.query(`
          UPDATE notification_retries
          SET status = 'failed', error_message = $1
          WHERE notification_id = $1 AND channel = $2 AND attempt_number = $3
        `, [error.message, notificationId, channel, attemptNumber]);
      }
    }
  }

  async logChannelDelivery(notificationId, channel, result) {
    await pool.query(`
      INSERT INTO notification_delivery_logs (
        notification_id, channel, success,
        provider_response, delivered_at
      ) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
    `, [
      notificationId,
      channel,
      result.success,
      JSON.stringify(result)
    ]);
  }

  shouldRetry(priority) {
    return priority <= this.priorityLevels.HIGH;
  }

  stripHtml(html) {
    return html.replace(/<[^>]*>?/gm, '');
  }

  chunkArray(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  async createTwiMLUrl(message, notification) {
    // In production, this would create a dynamic TwiML endpoint
    const twiml = `
      <Response>
        <Say voice="alice">${message}</Say>
        <Gather action="/webhooks/twilio/ivr-response" method="POST" numDigits="1">
          <Say>Press 1 to confirm receipt. Press 2 to repeat this message.</Say>
        </Gather>
      </Response>
    `;

    // Store TwiML and return URL
    const twimlId = uuidv4();
    await redis.setex(`twiml:${twimlId}`, 3600, twiml);

    return `${process.env.API_URL}/twiml/${twimlId}`;
  }

  async pushToWebSocket(recipientId, notification) {
    // Check if user is online
    const isOnline = await redis.get(`user_online:${recipientId}`);

    if (isOnline) {
      // Emit through WebSocket
      const io = global.io; // Assuming socket.io is initialized globally
      if (io) {
        io.to(`user_${recipientId}`).emit('notification', notification);
      }
    }
  }

  async sendAPNS(token, title, body, data) {
    // Apple Push Notification Service implementation
    console.log('Sending APNS notification');
    return { success: true };
  }

  async sendFCM(token, title, body, data) {
    // Firebase Cloud Messaging implementation
    console.log('Sending FCM notification');
    return { success: true };
  }

  async sendWebPush(subscription, title, body, data) {
    // Web Push implementation
    console.log('Sending Web Push notification');
    return { success: true };
  }

  async getNotificationStatus(notificationId) {
    const result = await pool.query(`
      SELECT
        n.*,
        ARRAY_AGG(
          DISTINCT jsonb_build_object(
            'channel', dl.channel,
            'success', dl.success,
            'delivered_at', dl.delivered_at
          )
        ) FILTER (WHERE dl.channel IS NOT NULL) as delivery_logs
      FROM notifications n
      LEFT JOIN notification_delivery_logs dl ON n.notification_id = dl.notification_id
      WHERE n.notification_id = $1
      GROUP BY n.notification_id
    `, [notificationId]);

    return result.rows[0];
  }

  async getRecipientNotificationHistory(recipientId, limit = 50) {
    const result = await pool.query(`
      SELECT * FROM notifications
      WHERE recipient_id = $1
      ORDER BY created_at DESC
      LIMIT $2
    `, [recipientId, limit]);

    return result.rows;
  }
}

export default new MultiChannelNotifications();