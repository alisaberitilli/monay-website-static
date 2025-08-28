import * as admin from 'firebase-admin';
import prisma from '@/lib/prisma';

interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
}

class NotificationService {
  private app: admin.app.App | null = null;
  
  constructor() {
    this.initializeFirebase();
  }
  
  private initializeFirebase() {
    try {
      if (!admin.apps.length) {
        const serviceAccount = {
          projectId: process.env.FIREBASE_PROJECT_ID,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        };
        
        this.app = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
        });
      } else {
        this.app = admin.apps[0];
      }
    } catch (error) {
      console.error('Failed to initialize Firebase:', error);
    }
  }
  
  async sendPushNotification(
    userId: string,
    payload: NotificationPayload
  ): Promise<void> {
    try {
      if (!this.app) {
        console.error('Firebase not initialized');
        return;
      }
      
      const devices = await prisma.userDevice.findMany({
        where: {
          userId,
          deviceToken: {
            not: null,
          },
        },
        select: {
          deviceToken: true,
          deviceType: true,
        },
      });
      
      if (devices.length === 0) {
        console.log('No device tokens found for user:', userId);
        return;
      }
      
      const tokens = devices
        .map(d => d.deviceToken)
        .filter((token): token is string => token !== null);
      
      if (tokens.length === 0) return;
      
      const message: admin.messaging.MulticastMessage = {
        tokens,
        notification: {
          title: payload.title,
          body: payload.body,
        },
        data: payload.data,
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            clickAction: 'FLUTTER_NOTIFICATION_CLICK',
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
            },
          },
        },
      };
      
      const response = await admin.messaging().sendEachForMulticast(message);
      
      console.log(`Successfully sent ${response.successCount} messages`);
      if (response.failureCount > 0) {
        console.log(`Failed to send ${response.failureCount} messages`);
        
        const failedTokens: string[] = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success && tokens[idx]) {
            failedTokens.push(tokens[idx]);
          }
        });
        
        if (failedTokens.length > 0) {
          await prisma.userDevice.updateMany({
            where: {
              deviceToken: {
                in: failedTokens,
              },
            },
            data: {
              deviceToken: null,
            },
          });
        }
      }
    } catch (error) {
      console.error('Error sending push notification:', error);
    }
  }
  
  async saveNotification(
    userId: string,
    title: string,
    message: string,
    type: string,
    data?: any
  ): Promise<void> {
    try {
      await prisma.notification.create({
        data: {
          userId,
          title,
          message,
          type,
          data,
        },
      });
      
      await this.sendPushNotification(userId, {
        title,
        body: message,
        data: data ? { ...data, type } : { type },
      });
    } catch (error) {
      console.error('Error saving notification:', error);
    }
  }
  
  async sendTransactionNotification(
    userId: string,
    type: 'sent' | 'received',
    amount: number,
    currency: string,
    otherPartyName: string,
    transactionId: string
  ): Promise<void> {
    const title = type === 'sent' ? 'Payment Sent' : 'Payment Received';
    const message = type === 'sent'
      ? `You sent ${currency}${amount} to ${otherPartyName}`
      : `You received ${currency}${amount} from ${otherPartyName}`;
    
    await this.saveNotification(userId, title, message, 'transaction', {
      transactionId,
      amount,
      currency,
      type,
    });
  }
  
  async sendKYCNotification(
    userId: string,
    status: 'approved' | 'rejected',
    reason?: string
  ): Promise<void> {
    const title = status === 'approved' 
      ? 'KYC Approved' 
      : 'KYC Verification Required';
    const message = status === 'approved'
      ? 'Your KYC verification has been approved. You can now access all features.'
      : `Your KYC verification needs attention. ${reason || 'Please resubmit your documents.'}`;
    
    await this.saveNotification(userId, title, message, 'kyc', {
      status,
      reason,
    });
  }
  
  async sendPaymentRequestNotification(
    userId: string,
    requesterName: string,
    amount: number,
    currency: string,
    requestId: string
  ): Promise<void> {
    const title = 'Payment Request';
    const message = `${requesterName} requested ${currency}${amount} from you`;
    
    await this.saveNotification(userId, title, message, 'payment_request', {
      requestId,
      amount,
      currency,
    });
  }
}

export const notificationService = new NotificationService();
export default notificationService;