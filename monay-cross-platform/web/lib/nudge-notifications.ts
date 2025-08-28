import { NUDGE_CONFIG, NotificationTemplate, NotificationChannel } from './nudge-config';

export interface NudgeNotificationPayload {
  nudgeId: number;
  recipientId?: string;
  toEmailAddress?: string;
  toPhoneNumber?: string;
  toName?: string;
  channel: number;
  mergeTags?: Array<{
    tagName: string;
    tagValue: string;
  }>;
}

export interface NotificationData {
  recipientEmail?: string;
  recipientPhone?: string;
  recipientName: string;
  recipientId?: string;
  template: NotificationTemplate;
  channel: NotificationChannel;
  data: Record<string, any>;
}

export class NudgeNotificationError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: unknown
  ) {
    super(message);
    this.name = 'NudgeNotificationError';
  }
}

// Server-side function to send notifications via Nudge
export async function sendNotification(notification: NotificationData): Promise<{ success: boolean; message: string }> {
  try {
    const apiKey = process.env.NUDGE_API_KEY;
    if (!apiKey) {
      throw new NudgeNotificationError('NUDGE_API_KEY is not configured', 500);
    }

    const templateId = NUDGE_CONFIG.NOTIFICATION_TEMPLATES[notification.template];
    const channelId = NUDGE_CONFIG.CHANNELS[notification.channel];

    const payload: NudgeNotificationPayload = {
      nudgeId: templateId,
      recipientId: notification.recipientId || notification.recipientName,
      toName: notification.recipientName,
      channel: channelId,
      mergeTags: Object.entries(notification.data).map(([key, value]) => ({
        tagName: key,
        tagValue: String(value)
      }))
    };

    // Add contact info based on channel
    if (notification.channel === 'EMAIL' && notification.recipientEmail) {
      payload.toEmailAddress = notification.recipientEmail;
    } else if (notification.channel === 'SMS' && notification.recipientPhone) {
      payload.toPhoneNumber = notification.recipientPhone;
    }

    console.log('Sending notification via Nudge:', {
      template: notification.template,
      channel: notification.channel,
      recipient: notification.recipientName
    });

    const response = await fetch(NUDGE_CONFIG.ENDPOINTS.SEND, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': apiKey,
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Nudge API error:', errorText);
      throw new NudgeNotificationError(
        `Nudge API error: ${response.status} ${response.statusText}`,
        response.status,
        errorText
      );
    }

    console.log('Notification sent successfully');
    return { success: true, message: 'Notification sent successfully' };

  } catch (error) {
    console.error('Failed to send notification:', error);
    
    if (error instanceof NudgeNotificationError) {
      throw error;
    }
    
    throw new NudgeNotificationError(
      'Failed to send notification',
      500,
      error
    );
  }
}

// Specific notification functions for different events

export async function notifyPaymentSent(
  senderEmail: string,
  senderName: string,
  recipientName: string,
  amount: number,
  currency: string = 'USD'
) {
  return sendNotification({
    recipientEmail: senderEmail,
    recipientName: senderName,
    template: 'PAYMENT_SENT',
    channel: 'EMAIL',
    data: {
      sender_name: senderName,
      recipient_name: recipientName,
      amount: amount.toFixed(2),
      currency,
      transaction_date: new Date().toLocaleDateString(),
      transaction_time: new Date().toLocaleTimeString()
    }
  });
}

export async function notifyPaymentReceived(
  recipientEmail: string,
  recipientName: string,
  senderName: string,
  amount: number,
  currency: string = 'USD'
) {
  return sendNotification({
    recipientEmail,
    recipientName,
    template: 'PAYMENT_RECEIVED',
    channel: 'EMAIL',
    data: {
      recipient_name: recipientName,
      sender_name: senderName,
      amount: amount.toFixed(2),
      currency,
      transaction_date: new Date().toLocaleDateString(),
      transaction_time: new Date().toLocaleTimeString()
    }
  });
}

export async function notifyPaymentRequest(
  payerEmail: string,
  payerName: string,
  requesterName: string,
  amount: number,
  description: string,
  dueDate?: Date
) {
  return sendNotification({
    recipientEmail: payerEmail,
    recipientName: payerName,
    template: 'PAYMENT_REQUEST',
    channel: 'EMAIL',
    data: {
      payer_name: payerName,
      requester_name: requesterName,
      amount: amount.toFixed(2),
      description,
      due_date: dueDate ? dueDate.toLocaleDateString() : 'No due date',
      request_link: `${process.env.NEXT_PUBLIC_APP_URL}/payment-requests`
    }
  });
}

export async function notify2FAEnabled(
  userEmail: string,
  userName: string
) {
  return sendNotification({
    recipientEmail: userEmail,
    recipientName: userName,
    template: 'TWO_FA_ENABLED',
    channel: 'EMAIL',
    data: {
      user_name: userName,
      enabled_date: new Date().toLocaleDateString(),
      enabled_time: new Date().toLocaleTimeString()
    }
  });
}

export async function sendLoginAlert(
  userEmail: string,
  userName: string,
  deviceInfo: string,
  ipAddress: string,
  location?: string
) {
  return sendNotification({
    recipientEmail: userEmail,
    recipientName: userName,
    template: 'LOGIN_ALERT',
    channel: 'EMAIL',
    data: {
      user_name: userName,
      device_info: deviceInfo,
      ip_address: ipAddress,
      location: location || 'Unknown location',
      login_time: new Date().toLocaleTimeString(),
      login_date: new Date().toLocaleDateString()
    }
  });
}

export async function sendSMSPaymentAlert(
  phoneNumber: string,
  userName: string,
  amount: number,
  transactionType: 'sent' | 'received'
) {
  return sendNotification({
    recipientPhone: phoneNumber,
    recipientName: userName,
    template: 'SMS_PAYMENT_ALERT',
    channel: 'SMS',
    data: {
      user_name: userName,
      amount: amount.toFixed(2),
      type: transactionType,
      balance: '****' // Security: Don't send full balance via SMS
    }
  });
}

// Batch notification for multiple recipients
export async function sendBatchNotifications(
  notifications: NotificationData[]
): Promise<{ successful: number; failed: number; errors: any[] }> {
  const results = {
    successful: 0,
    failed: 0,
    errors: [] as any[]
  };

  for (const notification of notifications) {
    try {
      await sendNotification(notification);
      results.successful++;
    } catch (error) {
      results.failed++;
      results.errors.push({
        recipient: notification.recipientName,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  return results;
}

// Store notification in database for in-app notifications
export async function storeInAppNotification(
  userId: string,
  title: string,
  message: string,
  type: string,
  metadata?: Record<string, any>
) {
  // This would store the notification in your database
  // For now, we'll just log it
  console.log('Storing in-app notification:', {
    userId,
    title,
    message,
    type,
    metadata,
    createdAt: new Date().toISOString()
  });
  
  // In production, you would:
  // 1. Store in notifications table
  // 2. Update user's unread count
  // 3. Potentially trigger real-time update via WebSocket
  
  return {
    id: `notif_${Date.now()}`,
    userId,
    title,
    message,
    type,
    metadata,
    read: false,
    createdAt: new Date().toISOString()
  };
}