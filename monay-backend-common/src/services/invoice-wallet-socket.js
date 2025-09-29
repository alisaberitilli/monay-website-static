import { Server } from 'socket.io';
import loggers from './logger.js';

class InvoiceWalletSocket {
    constructor() {
        this.io = null;
        this.walletTimers = new Map();
        this.activeConnections = new Map();
    }

    /**
     * Initialize Socket.IO with the HTTP server
     * @param {Object} server - HTTP server instance
     */
    initialize(server) {
        this.io = new Server(server, {
            cors: {
                origin: [
                    'http://localhost:3007',
                    'http://localhost:3000',
                    'http://localhost:3002',
                    'http://localhost:3003',
                    'http://localhost:3001'
                ],
                methods: ['GET', 'POST'],
                credentials: true,
                allowedHeaders: ['Content-Type', 'Authorization']
            },
            transports: ['websocket', 'polling']
        });

        this.setupEventHandlers();
        loggers.infoLogger.info('Invoice Wallet Socket.IO initialized');
    }

    /**
     * Setup Socket.IO event handlers
     */
    setupEventHandlers() {
        this.io.on('connection', (socket) => {
            loggers.infoLogger.info(`New WebSocket connection: ${socket.id}`);
            this.activeConnections.set(socket.id, {
                connectedAt: new Date(),
                userId: null
            });

            // Join wallet room for updates
            socket.on('join-wallet-room', (walletId) => {
                socket.join(`wallet:${walletId}`);
                loggers.infoLogger.info(`Socket ${socket.id} joined wallet room: ${walletId}`);
            });

            // Leave wallet room
            socket.on('leave-wallet-room', (walletId) => {
                socket.leave(`wallet:${walletId}`);
                loggers.infoLogger.info(`Socket ${socket.id} left wallet room: ${walletId}`);
            });

            // Handle ephemeral wallet countdown
            socket.on('start-countdown', (data) => {
                const { walletId, expiresAt } = data;
                this.startWalletCountdown(walletId, expiresAt);
            });

            // Handle wallet status updates
            socket.on('wallet-status-update', (data) => {
                const { walletId, status } = data;
                this.broadcastWalletStatus(walletId, status);
            });

            // Handle wallet destruction
            socket.on('destroy-wallet', (walletId) => {
                this.handleWalletDestruction(walletId);
            });

            // Get active wallets count
            socket.on('get-active-wallets', () => {
                const activeCount = this.walletTimers.size;
                socket.emit('active-wallets-count', { count: activeCount });
            });

            // Handle disconnection
            socket.on('disconnect', () => {
                loggers.infoLogger.info(`Socket disconnected: ${socket.id}`);
                this.activeConnections.delete(socket.id);
            });
        });
    }

    /**
     * Start countdown timer for ephemeral wallet
     * @param {String} walletId - Wallet identifier
     * @param {String} expiresAt - Expiration timestamp
     */
    startWalletCountdown(walletId, expiresAt) {
        // Clear existing timer if any
        if (this.walletTimers.has(walletId)) {
            clearInterval(this.walletTimers.get(walletId));
        }

        const expirationTime = new Date(expiresAt).getTime();

        // Set up countdown interval
        const timer = setInterval(() => {
            const now = Date.now();
            const remaining = expirationTime - now;

            if (remaining <= 0) {
                // Wallet expired
                this.handleWalletDestruction(walletId);
                clearInterval(timer);
                this.walletTimers.delete(walletId);
            } else {
                // Broadcast remaining time
                this.io.to(`wallet:${walletId}`).emit('countdown-update', {
                    walletId,
                    remaining: Math.floor(remaining / 1000), // seconds
                    expiresAt
                });
            }
        }, 1000); // Update every second

        this.walletTimers.set(walletId, timer);
        loggers.infoLogger.info(`Started countdown for wallet ${walletId}`);
    }

    /**
     * Handle wallet destruction
     * @param {String} walletId - Wallet identifier
     */
    handleWalletDestruction(walletId) {
        // Clear timer if exists
        if (this.walletTimers.has(walletId)) {
            clearInterval(this.walletTimers.get(walletId));
            this.walletTimers.delete(walletId);
        }

        // Notify all clients in the wallet room
        this.io.to(`wallet:${walletId}`).emit('wallet-destroyed', {
            walletId,
            destroyedAt: new Date().toISOString(),
            message: 'Wallet has been securely destroyed'
        });

        // Broadcast to all clients for metrics update
        this.io.emit('wallet-metrics-update', {
            type: 'destruction',
            walletId,
            timestamp: new Date().toISOString()
        });

        loggers.infoLogger.info(`Wallet ${walletId} destroyed and notifications sent`);
    }

    /**
     * Broadcast wallet status update
     * @param {String} walletId - Wallet identifier
     * @param {String} status - New status
     */
    broadcastWalletStatus(walletId, status) {
        this.io.to(`wallet:${walletId}`).emit('status-changed', {
            walletId,
            status,
            timestamp: new Date().toISOString()
        });

        // Broadcast to all for metrics
        this.io.emit('wallet-metrics-update', {
            type: 'status_change',
            walletId,
            status,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Broadcast new wallet creation
     * @param {Object} wallet - Wallet data
     */
    broadcastWalletCreation(wallet) {
        this.io.emit('wallet-created', {
            wallet,
            timestamp: new Date().toISOString()
        });

        // If ephemeral, start countdown
        if (wallet.mode === 'ephemeral' && wallet.expiresAt) {
            this.startWalletCountdown(wallet.id, wallet.expiresAt);
        }

        loggers.infoLogger.info(`Broadcasted creation of wallet ${wallet.id}`);
    }

    /**
     * Get connection statistics
     */
    getConnectionStats() {
        return {
            activeConnections: this.activeConnections.size,
            activeWalletTimers: this.walletTimers.size,
            connections: Array.from(this.activeConnections.entries()).map(([id, data]) => ({
                id,
                ...data
            }))
        };
    }

    /**
     * Cleanup all timers (for graceful shutdown)
     */
    cleanup() {
        // Clear all timers
        for (const [walletId, timer] of this.walletTimers.entries()) {
            clearInterval(timer);
            loggers.infoLogger.info(`Cleared timer for wallet ${walletId}`);
        }
        this.walletTimers.clear();

        // Disconnect all sockets
        if (this.io) {
            this.io.close();
            loggers.infoLogger.info('Socket.IO server closed');
        }
    }
}

// Create singleton instance
const invoiceWalletSocket = new InvoiceWalletSocket();

export default invoiceWalletSocket;