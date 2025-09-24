/**
 * WebSocket Service with Socket.io
 * Real-time communication for balance updates and notifications
 * Consumer Wallet Phase 1 Day 4 Implementation
 */

import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import redis from './redis.js';
import logger from './enhanced-logger.js';
import { AuthenticationError } from '../middlewares/error-handler.js';

class WebSocketService {
  constructor() {
    this.io = null;
    this.userSockets = new Map(); // userId -> Set of socket IDs
    this.socketUsers = new Map(); // socketId -> userId
    this.presenceTimers = new Map(); // userId -> timeout timer
    this.rooms = new Map(); // roomId -> Set of userIds
  }

  /**
   * Initialize Socket.io server
   */
  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URLS?.split(',') || [
          'http://localhost:3000',
          'http://localhost:3002',
          'http://localhost:3003',
          'http://localhost:3007'
        ],
        credentials: true
      },
      pingInterval: 10000,
      pingTimeout: 5000,
      transports: ['websocket', 'polling']
    });

    // Authentication middleware
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth?.token ||
                     socket.handshake.headers?.authorization?.split(' ')[1];

        if (!token) {
          throw new AuthenticationError('No token provided');
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        socket.userId = decoded.id || decoded.userId;
        socket.user = decoded;

        logger.info('WebSocket authentication successful', {
          userId: socket.userId,
          socketId: socket.id
        });

        next();
      } catch (error) {
        logger.error('WebSocket authentication failed', {
          error: error.message,
          socketId: socket.id
        });
        next(new Error('Authentication failed'));
      }
    });

    // Connection handler
    this.io.on('connection', (socket) => {
      this.handleConnection(socket);
    });

    logger.info('WebSocket server initialized');
  }

  /**
   * Handle new socket connection
   */
  handleConnection(socket) {
    const userId = socket.userId;

    // Track user socket
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId).add(socket.id);
    this.socketUsers.set(socket.id, userId);

    // Join user's personal room
    socket.join(`user:${userId}`);

    // Update presence
    this.updateUserPresence(userId, 'online');

    logger.info('User connected via WebSocket', {
      userId,
      socketId: socket.id,
      totalConnections: this.userSockets.get(userId).size
    });

    // Send initial data
    this.sendInitialData(socket);

    // Register event handlers
    this.registerEventHandlers(socket);

    // Handle disconnect
    socket.on('disconnect', () => {
      this.handleDisconnect(socket);
    });
  }

  /**
   * Send initial data on connection
   */
  async sendInitialData(socket) {
    const userId = socket.userId;

    try {
      // Send current balance
      const balanceKey = `balance:${userId}`;
      const cachedBalance = await redis.get(balanceKey);

      if (cachedBalance) {
        socket.emit('balance:update', JSON.parse(cachedBalance));
      }

      // Send unread notifications count
      const notificationCount = await this.getUnreadNotificationCount(userId);
      socket.emit('notifications:count', { count: notificationCount });

      // Send online friends
      const onlineFriends = await this.getOnlineFriends(userId);
      socket.emit('presence:friends', onlineFriends);

    } catch (error) {
      logger.error('Error sending initial data', {
        userId,
        error: error.message
      });
    }
  }

  /**
   * Register socket event handlers
   */
  registerEventHandlers(socket) {
    const userId = socket.userId;

    // Balance subscription
    socket.on('balance:subscribe', async () => {
      socket.join(`balance:${userId}`);
      logger.debug('User subscribed to balance updates', { userId });
    });

    // Transaction notifications subscription
    socket.on('transactions:subscribe', async () => {
      socket.join(`transactions:${userId}`);
      logger.debug('User subscribed to transaction notifications', { userId });
    });

    // Presence updates
    socket.on('presence:update', async (status) => {
      this.updateUserPresence(userId, status);
    });

    // Typing indicators
    socket.on('typing:start', async (data) => {
      this.handleTypingStart(userId, data);
    });

    socket.on('typing:stop', async (data) => {
      this.handleTypingStop(userId, data);
    });

    // Chat messages
    socket.on('chat:message', async (data) => {
      this.handleChatMessage(userId, data);
    });

    // Join chat room
    socket.on('chat:join', async (roomId) => {
      this.joinChatRoom(socket, roomId);
    });

    // Leave chat room
    socket.on('chat:leave', async (roomId) => {
      this.leaveChatRoom(socket, roomId);
    });

    // Request balance refresh
    socket.on('balance:refresh', async () => {
      this.emitBalanceUpdate(userId);
    });

    // Mark notifications as read
    socket.on('notifications:markRead', async (notificationIds) => {
      this.markNotificationsAsRead(userId, notificationIds);
    });

    // P2P transfer tracking
    socket.on('transfer:track', async (transferId) => {
      socket.join(`transfer:${transferId}`);
      logger.debug('User tracking transfer', { userId, transferId });
    });
  }

  /**
   * Handle socket disconnect
   */
  handleDisconnect(socket) {
    const userId = this.socketUsers.get(socket.id);

    if (!userId) return;

    // Remove socket tracking
    const userSocketSet = this.userSockets.get(userId);
    if (userSocketSet) {
      userSocketSet.delete(socket.id);

      // If no more connections, update presence after delay
      if (userSocketSet.size === 0) {
        this.userSockets.delete(userId);

        // Set offline after 30 seconds (in case of reconnection)
        const timer = setTimeout(() => {
          if (!this.userSockets.has(userId)) {
            this.updateUserPresence(userId, 'offline');
          }
        }, 30000);

        this.presenceTimers.set(userId, timer);
      }
    }

    this.socketUsers.delete(socket.id);

    logger.info('User disconnected from WebSocket', {
      userId,
      socketId: socket.id,
      remainingConnections: userSocketSet?.size || 0
    });
  }

  /**
   * Update user presence status
   */
  async updateUserPresence(userId, status) {
    try {
      // Clear any pending offline timer
      const timer = this.presenceTimers.get(userId);
      if (timer) {
        clearTimeout(timer);
        this.presenceTimers.delete(userId);
      }

      // Update Redis
      const presenceKey = `presence:${userId}`;
      await redis.setex(presenceKey, 300, JSON.stringify({
        status,
        lastSeen: new Date().toISOString()
      }));

      // Notify friends
      const friends = await this.getUserFriends(userId);
      for (const friendId of friends) {
        this.io.to(`user:${friendId}`).emit('presence:update', {
          userId,
          status,
          timestamp: new Date().toISOString()
        });
      }

      logger.debug('User presence updated', { userId, status });
    } catch (error) {
      logger.error('Error updating presence', {
        userId,
        status,
        error: error.message
      });
    }
  }

  /**
   * Emit balance update to user
   */
  async emitBalanceUpdate(userId, balanceData = null) {
    try {
      if (!balanceData) {
        // Fetch from cache or database
        const balanceKey = `balance:${userId}`;
        const cached = await redis.get(balanceKey);
        balanceData = cached ? JSON.parse(cached) : null;
      }

      if (balanceData) {
        this.io.to(`balance:${userId}`).emit('balance:update', {
          ...balanceData,
          timestamp: new Date().toISOString()
        });

        logger.debug('Balance update emitted', {
          userId,
          balance: balanceData.available_balance
        });
      }
    } catch (error) {
      logger.error('Error emitting balance update', {
        userId,
        error: error.message
      });
    }
  }

  /**
   * Emit transaction notification
   */
  emitTransactionNotification(userId, transaction) {
    const notification = {
      id: transaction.id,
      type: transaction.type,
      amount: transaction.amount,
      status: transaction.status,
      message: this.formatTransactionMessage(transaction),
      timestamp: new Date().toISOString()
    };

    this.io.to(`transactions:${userId}`).emit('transaction:notification', notification);

    logger.info('Transaction notification sent', {
      userId,
      transactionId: transaction.id,
      type: transaction.type
    });
  }

  /**
   * Emit transfer status update
   */
  emitTransferStatusUpdate(transferId, status, details = {}) {
    this.io.to(`transfer:${transferId}`).emit('transfer:statusUpdate', {
      transferId,
      status,
      ...details,
      timestamp: new Date().toISOString()
    });

    logger.debug('Transfer status update emitted', {
      transferId,
      status
    });
  }

  /**
   * Handle chat message
   */
  async handleChatMessage(userId, data) {
    try {
      const { roomId, message, recipientId } = data;

      // Store message in database/cache
      const messageData = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        roomId: roomId || `dm_${[userId, recipientId].sort().join('_')}`,
        senderId: userId,
        message,
        timestamp: new Date().toISOString()
      };

      // Save to Redis (temporary storage)
      const chatKey = `chat:${messageData.roomId}`;
      await redis.lpush(chatKey, JSON.stringify(messageData));
      await redis.ltrim(chatKey, 0, 99); // Keep last 100 messages
      await redis.expire(chatKey, 86400); // Expire after 24 hours

      // Emit to room or recipient
      if (roomId) {
        this.io.to(`room:${roomId}`).emit('chat:message', messageData);
      } else if (recipientId) {
        this.io.to(`user:${recipientId}`).emit('chat:message', messageData);
        this.io.to(`user:${userId}`).emit('chat:message', messageData);
      }

      logger.debug('Chat message handled', {
        userId,
        roomId: messageData.roomId
      });
    } catch (error) {
      logger.error('Error handling chat message', {
        userId,
        error: error.message
      });
    }
  }

  /**
   * Handle typing start
   */
  handleTypingStart(userId, data) {
    const { roomId, recipientId } = data;

    const typingData = {
      userId,
      timestamp: new Date().toISOString()
    };

    if (roomId) {
      socket.to(`room:${roomId}`).emit('typing:start', typingData);
    } else if (recipientId) {
      this.io.to(`user:${recipientId}`).emit('typing:start', typingData);
    }
  }

  /**
   * Handle typing stop
   */
  handleTypingStop(userId, data) {
    const { roomId, recipientId } = data;

    const typingData = {
      userId,
      timestamp: new Date().toISOString()
    };

    if (roomId) {
      socket.to(`room:${roomId}`).emit('typing:stop', typingData);
    } else if (recipientId) {
      this.io.to(`user:${recipientId}`).emit('typing:stop', typingData);
    }
  }

  /**
   * Join chat room
   */
  joinChatRoom(socket, roomId) {
    socket.join(`room:${roomId}`);

    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Set());
    }
    this.rooms.get(roomId).add(socket.userId);

    // Notify room members
    socket.to(`room:${roomId}`).emit('room:userJoined', {
      userId: socket.userId,
      roomId,
      timestamp: new Date().toISOString()
    });

    logger.debug('User joined chat room', {
      userId: socket.userId,
      roomId
    });
  }

  /**
   * Leave chat room
   */
  leaveChatRoom(socket, roomId) {
    socket.leave(`room:${roomId}`);

    const room = this.rooms.get(roomId);
    if (room) {
      room.delete(socket.userId);
      if (room.size === 0) {
        this.rooms.delete(roomId);
      }
    }

    // Notify room members
    socket.to(`room:${roomId}`).emit('room:userLeft', {
      userId: socket.userId,
      roomId,
      timestamp: new Date().toISOString()
    });

    logger.debug('User left chat room', {
      userId: socket.userId,
      roomId
    });
  }

  /**
   * Get user friends (contacts)
   */
  async getUserFriends(userId) {
    try {
      const friendsKey = `friends:${userId}`;
      const cached = await redis.get(friendsKey);
      return cached ? JSON.parse(cached) : [];
    } catch (error) {
      logger.error('Error getting user friends', {
        userId,
        error: error.message
      });
      return [];
    }
  }

  /**
   * Get online friends
   */
  async getOnlineFriends(userId) {
    try {
      const friends = await this.getUserFriends(userId);
      const onlineFriends = [];

      for (const friendId of friends) {
        const presenceKey = `presence:${friendId}`;
        const presence = await redis.get(presenceKey);

        if (presence) {
          const data = JSON.parse(presence);
          if (data.status === 'online') {
            onlineFriends.push({
              userId: friendId,
              ...data
            });
          }
        }
      }

      return onlineFriends;
    } catch (error) {
      logger.error('Error getting online friends', {
        userId,
        error: error.message
      });
      return [];
    }
  }

  /**
   * Get unread notification count
   */
  async getUnreadNotificationCount(userId) {
    try {
      const countKey = `notifications:unread:${userId}`;
      const count = await redis.get(countKey);
      return parseInt(count || '0');
    } catch (error) {
      logger.error('Error getting notification count', {
        userId,
        error: error.message
      });
      return 0;
    }
  }

  /**
   * Mark notifications as read
   */
  async markNotificationsAsRead(userId, notificationIds) {
    try {
      // Update in database (implement based on your notification model)

      // Update count in Redis
      const countKey = `notifications:unread:${userId}`;
      const currentCount = await redis.get(countKey);
      const newCount = Math.max(0, (parseInt(currentCount || '0') - notificationIds.length));
      await redis.set(countKey, newCount.toString());

      // Emit updated count
      this.io.to(`user:${userId}`).emit('notifications:count', { count: newCount });

      logger.debug('Notifications marked as read', {
        userId,
        count: notificationIds.length
      });
    } catch (error) {
      logger.error('Error marking notifications as read', {
        userId,
        error: error.message
      });
    }
  }

  /**
   * Format transaction message
   */
  formatTransactionMessage(transaction) {
    const { type, amount, status } = transaction;

    switch (type) {
      case 'p2p_send':
        return `You sent $${amount}`;
      case 'p2p_receive':
        return `You received $${amount}`;
      case 'deposit':
        return `Deposit of $${amount} ${status}`;
      case 'withdrawal':
        return `Withdrawal of $${amount} ${status}`;
      default:
        return `Transaction of $${amount} ${status}`;
    }
  }

  /**
   * Broadcast to all users
   */
  broadcast(event, data) {
    this.io.emit(event, {
      ...data,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Send to specific user
   */
  sendToUser(userId, event, data) {
    this.io.to(`user:${userId}`).emit(event, {
      ...data,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Get connection stats
   */
  getConnectionStats() {
    return {
      totalConnections: this.socketUsers.size,
      uniqueUsers: this.userSockets.size,
      activeRooms: this.rooms.size,
      users: Array.from(this.userSockets.keys())
    };
  }
}

// Create singleton instance
const websocketService = new WebSocketService();

export default websocketService;