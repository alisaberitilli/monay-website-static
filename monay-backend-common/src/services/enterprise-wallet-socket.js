import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import loggers from './logger.js';

/**
 * Enterprise Wallet WebSocket Service
 * Provides real-time updates for enterprise wallet operations
 */
class EnterpriseWalletSocket {
    constructor() {
        this.io = null;
        this.tenantRooms = new Map();
        this.userConnections = new Map();
        this.transactionQueue = new Map();
    }

    /**
     * Initialize Socket.IO with the HTTP server
     * @param {Object} server - HTTP server instance
     */
    initialize(server) {
        // Check if already initialized
        if (this.io) {
            loggers.infoLogger.info('Enterprise Wallet Socket already initialized');
            return;
        }

        this.io = new Server(server, {
            path: '/enterprise-ws',
            cors: {
                origin: [
                    'http://localhost:3007',
                    'http://localhost:3000',
                    'http://localhost:3001',
                    'http://localhost:3002',
                    'http://localhost:3003',
                    'https://enterprise-wallet.monay.com'
                ],
                methods: ['GET', 'POST'],
                credentials: true,
                allowedHeaders: ['Content-Type', 'Authorization']
            },
            transports: ['websocket', 'polling'],
            pingTimeout: 60000,
            pingInterval: 25000
        });

        // Middleware for authentication
        this.io.use(async (socket, next) => {
            try {
                const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
                
                if (!token) {
                    return next(new Error('Authentication error'));
                }

                const decoded = jwt.verify(token, config.app.jwtAccessSecret);
                socket.userId = decoded.userId;
                socket.tenantId = decoded.tenantId;
                socket.role = decoded.role;
                
                next();
            } catch (err) {
                next(new Error('Authentication error'));
            }
        });

        this.setupEventHandlers();
        loggers.infoLogger.info('Enterprise Wallet Socket.IO initialized');
    }

    /**
     * Setup Socket.IO event handlers
     */
    setupEventHandlers() {
        this.io.on('connection', (socket) => {
            loggers.infoLogger.info(`Enterprise WebSocket connection: ${socket.id} (User: ${socket.userId}, Tenant: ${socket.tenantId})`);
            
            // Track user connection
            this.trackUserConnection(socket);

            // Auto-join tenant room
            if (socket.tenantId) {
                this.joinTenantRoom(socket, socket.tenantId);
            }

            // Subscribe to specific channels
            socket.on('subscribe', (channels) => {
                this.handleSubscription(socket, channels);
            });

            // Unsubscribe from channels
            socket.on('unsubscribe', (channels) => {
                this.handleUnsubscription(socket, channels);
            });

            // Join tenant room
            socket.on('join-tenant', (tenantId) => {
                this.joinTenantRoom(socket, tenantId);
            });

            // Leave tenant room
            socket.on('leave-tenant', (tenantId) => {
                this.leaveTenantRoom(socket, tenantId);
            });

            // Request real-time metrics
            socket.on('request-metrics', () => {
                this.sendMetrics(socket);
            });

            // Handle transaction updates
            socket.on('transaction-update', (data) => {
                this.broadcastTransactionUpdate(socket, data);
            });

            // Handle wallet updates
            socket.on('wallet-update', (data) => {
                this.broadcastWalletUpdate(socket, data);
            });

            // Handle compliance alerts
            socket.on('compliance-alert', (data) => {
                this.broadcastComplianceAlert(socket, data);
            });

            // Ping-pong for connection health
            socket.on('ping', () => {
                socket.emit('pong', { timestamp: Date.now() });
            });

            // Handle disconnection
            socket.on('disconnect', (reason) => {
                loggers.infoLogger.info(`Enterprise Socket disconnected: ${socket.id} (${reason})`);
                this.handleDisconnection(socket);
            });
        });
    }

    /**
     * Track user connection
     */
    trackUserConnection(socket) {
        const connectionData = {
            socketId: socket.id,
            userId: socket.userId,
            tenantId: socket.tenantId,
            connectedAt: new Date(),
            channels: new Set()
        };

        // Track by user ID
        if (!this.userConnections.has(socket.userId)) {
            this.userConnections.set(socket.userId, new Set());
        }
        this.userConnections.get(socket.userId).add(socket.id);

        // Store connection data
        socket.connectionData = connectionData;
    }

    /**
     * Handle subscription to channels
     */
    handleSubscription(socket, channels) {
        if (!Array.isArray(channels)) {
            channels = [channels];
        }

        channels.forEach(channel => {
            socket.join(channel);
            socket.connectionData?.channels.add(channel);
            loggers.infoLogger.info(`Socket ${socket.id} subscribed to ${channel}`);
        });

        socket.emit('subscription-confirmed', { channels });
    }

    /**
     * Handle unsubscription from channels
     */
    handleUnsubscription(socket, channels) {
        if (!Array.isArray(channels)) {
            channels = [channels];
        }

        channels.forEach(channel => {
            socket.leave(channel);
            socket.connectionData?.channels.delete(channel);
            loggers.infoLogger.info(`Socket ${socket.id} unsubscribed from ${channel}`);
        });

        socket.emit('unsubscription-confirmed', { channels });
    }

    /**
     * Join tenant room
     */
    joinTenantRoom(socket, tenantId) {
        const room = `tenant:${tenantId}`;
        socket.join(room);
        
        // Track tenant room membership
        if (!this.tenantRooms.has(tenantId)) {
            this.tenantRooms.set(tenantId, new Set());
        }
        this.tenantRooms.get(tenantId).add(socket.id);
        
        socket.emit('joined-tenant', { tenantId });
        loggers.infoLogger.info(`Socket ${socket.id} joined tenant room: ${tenantId}`);
        
        // Send current tenant status
        this.sendTenantStatus(socket, tenantId);
    }

    /**
     * Leave tenant room
     */
    leaveTenantRoom(socket, tenantId) {
        const room = `tenant:${tenantId}`;
        socket.leave(room);
        
        // Remove from tracking
        if (this.tenantRooms.has(tenantId)) {
            this.tenantRooms.get(tenantId).delete(socket.id);
            if (this.tenantRooms.get(tenantId).size === 0) {
                this.tenantRooms.delete(tenantId);
            }
        }
        
        socket.emit('left-tenant', { tenantId });
        loggers.infoLogger.info(`Socket ${socket.id} left tenant room: ${tenantId}`);
    }

    /**
     * Send real-time metrics
     */
    sendMetrics(socket) {
        const metrics = {
            activeConnections: this.userConnections.size,
            activeTenants: this.tenantRooms.size,
            queuedTransactions: this.transactionQueue.size,
            timestamp: new Date().toISOString()
        };
        
        socket.emit('metrics-update', metrics);
    }

    /**
     * Send tenant status
     */
    sendTenantStatus(socket, tenantId) {
        const status = {
            tenantId,
            activeUsers: this.tenantRooms.get(tenantId)?.size || 0,
            lastActivity: new Date().toISOString()
        };
        
        socket.emit('tenant-status', status);
    }

    /**
     * Broadcast transaction update
     */
    broadcastTransactionUpdate(socket, data) {
        const event = {
            type: 'transaction',
            ...data,
            timestamp: new Date().toISOString(),
            broadcastBy: socket.userId
        };
        
        // Broadcast to tenant room
        if (socket.tenantId) {
            this.io.to(`tenant:${socket.tenantId}`).emit('transaction-updated', event);
        }
        
        // Also broadcast to specific transaction channel
        if (data.transactionId) {
            this.io.to(`transaction:${data.transactionId}`).emit('transaction-updated', event);
        }
        
        loggers.infoLogger.info(`Transaction update broadcasted: ${data.transactionId}`);
    }

    /**
     * Broadcast wallet update
     */
    broadcastWalletUpdate(socket, data) {
        const event = {
            type: 'wallet',
            ...data,
            timestamp: new Date().toISOString(),
            broadcastBy: socket.userId
        };
        
        // Broadcast to tenant room
        if (socket.tenantId) {
            this.io.to(`tenant:${socket.tenantId}`).emit('wallet-updated', event);
        }
        
        // Also broadcast to specific wallet channel
        if (data.walletId) {
            this.io.to(`wallet:${data.walletId}`).emit('wallet-updated', event);
        }
        
        loggers.infoLogger.info(`Wallet update broadcasted: ${data.walletId}`);
    }

    /**
     * Broadcast compliance alert
     */
    broadcastComplianceAlert(socket, data) {
        const alert = {
            type: 'compliance',
            severity: data.severity || 'info',
            ...data,
            timestamp: new Date().toISOString(),
            broadcastBy: socket.userId
        };
        
        // Broadcast to tenant room
        if (socket.tenantId) {
            this.io.to(`tenant:${socket.tenantId}`).emit('compliance-alert', alert);
        }
        
        // Also broadcast to compliance channel
        this.io.to('compliance:alerts').emit('compliance-alert', alert);
        
        loggers.infoLogger.info(`Compliance alert broadcasted: ${data.message}`);
    }

    /**
     * Handle disconnection
     */
    handleDisconnection(socket) {
        // Remove from user connections
        if (socket.userId && this.userConnections.has(socket.userId)) {
            this.userConnections.get(socket.userId).delete(socket.id);
            if (this.userConnections.get(socket.userId).size === 0) {
                this.userConnections.delete(socket.userId);
            }
        }
        
        // Remove from tenant rooms
        if (socket.tenantId && this.tenantRooms.has(socket.tenantId)) {
            this.tenantRooms.get(socket.tenantId).delete(socket.id);
            if (this.tenantRooms.get(socket.tenantId).size === 0) {
                this.tenantRooms.delete(socket.tenantId);
            }
        }
    }

    // Public API Methods

    /**
     * Emit event to specific tenant
     */
    emitToTenant(tenantId, event, data) {
        this.io.to(`tenant:${tenantId}`).emit(event, {
            ...data,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Emit event to specific user
     */
    emitToUser(userId, event, data) {
        if (this.userConnections.has(userId)) {
            this.userConnections.get(userId).forEach(socketId => {
                this.io.to(socketId).emit(event, {
                    ...data,
                    timestamp: new Date().toISOString()
                });
            });
        }
    }

    /**
     * Emit event to specific channel
     */
    emitToChannel(channel, event, data) {
        this.io.to(channel).emit(event, {
            ...data,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Queue transaction for processing
     */
    queueTransaction(transactionId, data) {
        this.transactionQueue.set(transactionId, {
            ...data,
            queuedAt: new Date().toISOString()
        });
        
        // Emit queued event
        this.io.emit('transaction-queued', {
            transactionId,
            queueSize: this.transactionQueue.size,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Process queued transaction
     */
    processTransaction(transactionId) {
        const transaction = this.transactionQueue.get(transactionId);
        if (transaction) {
            this.transactionQueue.delete(transactionId);
            
            // Emit processing event
            this.io.emit('transaction-processing', {
                transactionId,
                transaction,
                queueSize: this.transactionQueue.size,
                timestamp: new Date().toISOString()
            });
            
            return transaction;
        }
        return null;
    }

    /**
     * Get connection statistics
     */
    getConnectionStats() {
        return {
            totalConnections: this.io?.engine?.clientsCount || 0,
            uniqueUsers: this.userConnections.size,
            activeTenants: this.tenantRooms.size,
            queuedTransactions: this.transactionQueue.size,
            tenantDetails: Array.from(this.tenantRooms.entries()).map(([tenantId, sockets]) => ({
                tenantId,
                activeConnections: sockets.size
            }))
        };
    }

    /**
     * Cleanup (for graceful shutdown)
     */
    cleanup() {
        // Clear transaction queue
        this.transactionQueue.clear();
        
        // Disconnect all sockets
        if (this.io) {
            this.io.disconnectSockets();
            this.io.close();
            loggers.infoLogger.info('Enterprise Wallet Socket.IO server closed');
        }
        
        // Clear tracking maps
        this.tenantRooms.clear();
        this.userConnections.clear();
    }
}

// Create singleton instance
const enterpriseWalletSocket = new EnterpriseWalletSocket();

export default enterpriseWalletSocket;