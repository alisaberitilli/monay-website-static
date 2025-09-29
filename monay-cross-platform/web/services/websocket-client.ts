/**
 * WebSocket Client Service
 * Handles real-time communication with backend WebSocket server
 * Consumer Wallet Phase 1 Day 4 Implementation
 */

import { io, Socket } from 'socket.io-client';

export interface BalanceUpdate {
  walletId: string;
  available_balance: number;
  pending_balance?: number;
  total_balance?: number;
  currency: string;
  timestamp: string;
}

export interface TransactionNotification {
  id: string;
  type: string;
  amount: number;
  status: string;
  direction?: 'incoming' | 'outgoing';
  message?: string;
  timestamp: string;
}

export interface PresenceUpdate {
  userId: string;
  status: 'online' | 'offline' | 'away';
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  roomId?: string;
  senderId: string;
  message: string;
  timestamp: string;
}

export interface TransferStatusUpdate {
  transferId: string;
  status: string;
  amount?: number;
  timestamp: string;
}

class WebSocketClient {
  private socket: Socket | null = null;
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private listeners: Map<string, Set<Function>> = new Map();

  /**
   * Initialize WebSocket connection
   */
  connect(token: string): void {
    if (this.socket?.connected) {
      console.log('WebSocket already connected');
      return;
    }

    const serverUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001';

    this.socket = io(serverUrl, {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.maxReconnectAttempts,
      transports: ['websocket', 'polling']
    });

    this.setupEventHandlers();
    this.setupConnectionHandlers();
  }

  /**
   * Setup connection event handlers
   */
  private setupConnectionHandlers(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.emit('connected', { timestamp: new Date().toISOString() });

      // Subscribe to default channels
      this.subscribeToBalanceUpdates();
      this.subscribeToTransactions();
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      this.isConnected = false;
      this.emit('disconnected', { reason, timestamp: new Date().toISOString() });
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error.message);
      this.reconnectAttempts++;

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        this.emit('connection_failed', {
          error: error.message,
          attempts: this.reconnectAttempts
        });
      }
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('WebSocket reconnected after', attemptNumber, 'attempts');
      this.emit('reconnected', { attempts: attemptNumber });
    });
  }

  /**
   * Setup event handlers for incoming messages
   */
  private setupEventHandlers(): void {
    if (!this.socket) return;

    // Balance updates
    this.socket.on('balance:update', (data: BalanceUpdate) => {
      console.log('Balance update received:', data);
      this.emit('balanceUpdate', data);
    });

    // Transaction notifications
    this.socket.on('transaction:notification', (data: TransactionNotification) => {
      console.log('Transaction notification received:', data);
      this.emit('transactionNotification', data);
    });

    // Transfer status updates
    this.socket.on('transfer:statusUpdate', (data: TransferStatusUpdate) => {
      console.log('Transfer status update:', data);
      this.emit('transferStatusUpdate', data);
    });

    this.socket.on('transfer:update', (data: TransferStatusUpdate) => {
      console.log('Transfer update:', data);
      this.emit('transferUpdate', data);
    });

    // Presence updates
    this.socket.on('presence:update', (data: PresenceUpdate) => {
      console.log('Presence update:', data);
      this.emit('presenceUpdate', data);
    });

    this.socket.on('presence:friends', (data: PresenceUpdate[]) => {
      console.log('Online friends:', data);
      this.emit('onlineFriends', data);
    });

    // Chat messages
    this.socket.on('chat:message', (data: ChatMessage) => {
      console.log('Chat message received:', data);
      this.emit('chatMessage', data);
    });

    // Typing indicators
    this.socket.on('typing:start', (data: { userId: string; timestamp: string }) => {
      this.emit('typingStart', data);
    });

    this.socket.on('typing:stop', (data: { userId: string; timestamp: string }) => {
      this.emit('typingStop', data);
    });

    // Notifications
    this.socket.on('notifications:count', (data: { count: number }) => {
      console.log('Notification count updated:', data.count);
      this.emit('notificationCount', data);
    });

    // Payment notifications
    this.socket.on('payment:notification', (data: any) => {
      console.log('Payment notification:', data);
      this.emit('paymentNotification', data);
    });

    // Deposit notifications
    this.socket.on('deposit:notification', (data: any) => {
      console.log('Deposit notification:', data);
      this.emit('depositNotification', data);
    });

    // Withdrawal notifications
    this.socket.on('withdrawal:notification', (data: any) => {
      console.log('Withdrawal notification:', data);
      this.emit('withdrawalNotification', data);
    });

    // Security alerts
    this.socket.on('security:alert', (data: any) => {
      console.log('Security alert:', data);
      this.emit('securityAlert', data);
    });

    // Limit exceeded
    this.socket.on('limit:exceeded', (data: any) => {
      console.log('Limit exceeded:', data);
      this.emit('limitExceeded', data);
    });

    // KYC updates
    this.socket.on('kyc:update', (data: any) => {
      console.log('KYC update:', data);
      this.emit('kycUpdate', data);
    });

    // Card activity
    this.socket.on('card:activity', (data: any) => {
      console.log('Card activity:', data);
      this.emit('cardActivity', data);
    });

    // System announcements
    this.socket.on('system:announcement', (data: any) => {
      console.log('System announcement:', data);
      this.emit('systemAnnouncement', data);
    });

    // Room events
    this.socket.on('room:userJoined', (data: any) => {
      this.emit('roomUserJoined', data);
    });

    this.socket.on('room:userLeft', (data: any) => {
      this.emit('roomUserLeft', data);
    });
  }

  /**
   * Subscribe to balance updates
   */
  subscribeToBalanceUpdates(): void {
    if (!this.socket) return;
    this.socket.emit('balance:subscribe');
  }

  /**
   * Subscribe to transaction notifications
   */
  subscribeToTransactions(): void {
    if (!this.socket) return;
    this.socket.emit('transactions:subscribe');
  }

  /**
   * Request balance refresh
   */
  requestBalanceRefresh(): void {
    if (!this.socket) return;
    this.socket.emit('balance:refresh');
  }

  /**
   * Track a specific transfer
   */
  trackTransfer(transferId: string): void {
    if (!this.socket) return;
    this.socket.emit('transfer:track', transferId);
  }

  /**
   * Update presence status
   */
  updatePresence(status: 'online' | 'away' | 'offline'): void {
    if (!this.socket) return;
    this.socket.emit('presence:update', status);
  }

  /**
   * Send chat message
   */
  sendChatMessage(message: string, recipientId?: string, roomId?: string): void {
    if (!this.socket) return;

    const data = {
      message,
      recipientId,
      roomId,
      timestamp: new Date().toISOString()
    };

    this.socket.emit('chat:message', data);
  }

  /**
   * Join chat room
   */
  joinChatRoom(roomId: string): void {
    if (!this.socket) return;
    this.socket.emit('chat:join', roomId);
  }

  /**
   * Leave chat room
   */
  leaveChatRoom(roomId: string): void {
    if (!this.socket) return;
    this.socket.emit('chat:leave', roomId);
  }

  /**
   * Start typing indicator
   */
  startTyping(recipientId?: string, roomId?: string): void {
    if (!this.socket) return;
    this.socket.emit('typing:start', { recipientId, roomId });
  }

  /**
   * Stop typing indicator
   */
  stopTyping(recipientId?: string, roomId?: string): void {
    if (!this.socket) return;
    this.socket.emit('typing:stop', { recipientId, roomId });
  }

  /**
   * Mark notifications as read
   */
  markNotificationsAsRead(notificationIds: string[]): void {
    if (!this.socket) return;
    this.socket.emit('notifications:markRead', notificationIds);
  }

  /**
   * Add event listener
   */
  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(callback);
  }

  /**
   * Remove event listener
   */
  off(event: string, callback: Function): void {
    this.listeners.get(event)?.delete(callback);
  }

  /**
   * Emit event to listeners
   */
  private emit(event: string, data: any): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${event} listener:`, error);
        }
      });
    }
  }

  /**
   * Disconnect WebSocket
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.listeners.clear();
    }
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  /**
   * Get socket instance
   */
  getSocket(): Socket | null {
    return this.socket;
  }
}

// Create singleton instance
const websocketClient = new WebSocketClient();

// Export hooks for React components
export const useWebSocket = () => {
  return websocketClient;
};

export const useBalanceUpdates = (callback: (data: BalanceUpdate) => void) => {
  websocketClient.on('balanceUpdate', callback);
  return () => websocketClient.off('balanceUpdate', callback);
};

export const useTransactionNotifications = (callback: (data: TransactionNotification) => void) => {
  websocketClient.on('transactionNotification', callback);
  return () => websocketClient.off('transactionNotification', callback);
};

export const usePresenceUpdates = (callback: (data: PresenceUpdate) => void) => {
  websocketClient.on('presenceUpdate', callback);
  return () => websocketClient.off('presenceUpdate', callback);
};

export const useChatMessages = (callback: (data: ChatMessage) => void) => {
  websocketClient.on('chatMessage', callback);
  return () => websocketClient.off('chatMessage', callback);
};

export const useTransferUpdates = (callback: (data: TransferStatusUpdate) => void) => {
  websocketClient.on('transferUpdate', callback);
  return () => websocketClient.off('transferUpdate', callback);
};

export default websocketClient;