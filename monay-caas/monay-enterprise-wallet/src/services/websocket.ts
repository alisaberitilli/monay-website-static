import { EventEmitter } from 'events';

interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: number;
}

interface WebSocketConfig {
  url?: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
}

class WebSocketService extends EventEmitter {
  private ws: WebSocket | null = null;
  private config: Required<WebSocketConfig>;
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private isIntentionallyClosed = false;
  private messageQueue: WebSocketMessage[] = [];

  constructor(config: WebSocketConfig = {}) {
    super();

    this.config = {
      url: config.url || process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001',
      reconnectInterval: config.reconnectInterval || 5000,
      maxReconnectAttempts: config.maxReconnectAttempts || 10,
      heartbeatInterval: config.heartbeatInterval || 30000
    };
  }

  /**
   * Connect to WebSocket server
   */
  connect(userId?: string): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return;
    }

    try {
      const url = userId
        ? `${this.config.url}/ws?userId=${userId}`
        : `${this.config.url}/ws`;

      this.ws = new WebSocket(url);
      this.setupEventHandlers();
      this.isIntentionallyClosed = false;
    } catch (error) {
      console.error('WebSocket connection error:', error);
      this.scheduleReconnect();
    }
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    this.isIntentionallyClosed = true;
    this.cleanup();

    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
  }

  /**
   * Send message through WebSocket
   */
  send(type: string, data: any): void {
    const message: WebSocketMessage = {
      type,
      data,
      timestamp: Date.now()
    };

    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      // Queue message for sending when connection is established
      this.messageQueue.push(message);
      console.log('WebSocket not connected, message queued');
    }
  }

  /**
   * Subscribe to specific event types
   */
  subscribe(eventType: string, callback: (data: any) => void): void {
    this.on(eventType, callback);

    // Send subscription message to server
    this.send('subscribe', { eventType });
  }

  /**
   * Unsubscribe from specific event types
   */
  unsubscribe(eventType: string, callback?: (data: any) => void): void {
    if (callback) {
      this.off(eventType, callback);
    } else {
      this.removeAllListeners(eventType);
    }

    // Send unsubscribe message to server
    this.send('unsubscribe', { eventType });
  }

  /**
   * Setup WebSocket event handlers
   */
  private setupEventHandlers(): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      this.emit('connected');

      // Send queued messages
      this.flushMessageQueue();

      // Start heartbeat
      this.startHeartbeat();
    };

    this.ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);

        // Handle different message types
        switch (message.type) {
          case 'pong':
            // Heartbeat response
            break;

          case 'error':
            console.error('WebSocket server error:', message.data);
            this.emit('error', message.data);
            break;

          default:
            // Emit specific event type
            this.emit(message.type, message.data);
            // Also emit generic message event
            this.emit('message', message);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.emit('error', error);
    };

    this.ws.onclose = (event) => {
      console.log('WebSocket closed:', event.code, event.reason);
      this.emit('disconnected', { code: event.code, reason: event.reason });

      this.cleanup();

      if (!this.isIntentionallyClosed) {
        this.scheduleReconnect();
      }
    };
  }

  /**
   * Start heartbeat to keep connection alive
   */
  private startHeartbeat(): void {
    this.stopHeartbeat();

    this.heartbeatTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.send('ping', { timestamp: Date.now() });
      }
    }, this.config.heartbeatInterval);
  }

  /**
   * Stop heartbeat
   */
  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  /**
   * Schedule reconnection attempt
   */
  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      this.emit('max_reconnect_failed');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(
      this.config.reconnectInterval * Math.pow(1.5, this.reconnectAttempts - 1),
      30000
    );

    console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
    this.emit('reconnecting', { attempt: this.reconnectAttempts, delay });

    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }

  /**
   * Flush queued messages
   */
  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0 && this.ws?.readyState === WebSocket.OPEN) {
      const message = this.messageQueue.shift();
      if (message) {
        this.ws.send(JSON.stringify(message));
      }
    }
  }

  /**
   * Cleanup timers
   */
  private cleanup(): void {
    this.stopHeartbeat();

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  /**
   * Get connection state
   */
  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * Get connection readyState
   */
  get readyState(): number {
    return this.ws?.readyState || WebSocket.CLOSED;
  }
}

// Create singleton instance
const wsService = new WebSocketService();

// Specific event subscriptions for different data types
export const subscribeToTransactions = (callback: (data: any) => void) => {
  wsService.subscribe('transaction', callback);
};

export const subscribeToWalletUpdates = (callback: (data: any) => void) => {
  wsService.subscribe('wallet_update', callback);
};

export const subscribeToCompliance = (callback: (data: any) => void) => {
  wsService.subscribe('compliance_alert', callback);
};

export const subscribeToMarketData = (callback: (data: any) => void) => {
  wsService.subscribe('market_data', callback);
};

export const subscribeToEmergency = (callback: (data: any) => void) => {
  wsService.subscribe('emergency_disbursement', callback);
};

export const subscribeToNotifications = (callback: (data: any) => void) => {
  wsService.subscribe('notification', callback);
};

export default wsService;