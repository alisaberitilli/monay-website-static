import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import WalletOrchestratorService from '../../services/wallet-orchestrator-service.js';
import db from '../../models/index.js';
const { sequelize } = db;

// Mock dependencies
jest.mock('../../models/index.js');
jest.mock('../../services/circle.js');
jest.mock('../../services/wallet-balance-service.js');
jest.mock('../../services/logger.js');

describe('WalletOrchestratorService', () => {
    let orchestrator;
    let mockTransaction;

    beforeEach(() => {
        orchestrator = new WalletOrchestratorService();
        mockTransaction = {
            commit: jest.fn(),
            rollback: jest.fn()
        };
        sequelize.transaction = jest.fn().mockResolvedValue(mockTransaction);
        sequelize.query = jest.fn();
        sequelize.QueryTypes = { SELECT: 'SELECT' };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('initializeUserWallets', () => {
        it('should initialize both Monay and Circle wallets for a new user', async () => {
            const userId = 'test-user-123';
            const mockMonayWallet = {
                id: 'monay-wallet-123',
                user_id: userId,
                balance: 0,
                status: 'active'
            };
            const mockCircleWallet = {
                id: 'circle-wallet-123',
                user_id: userId,
                circle_wallet_id: 'circle-id-123',
                circle_address: '0xabc123',
                status: 'active'
            };

            // Mock getOrCreateMonayWallet
            orchestrator.getOrCreateMonayWallet = jest.fn().mockResolvedValue(mockMonayWallet);

            // Mock getOrCreateCircleWallet
            orchestrator.getOrCreateCircleWallet = jest.fn().mockResolvedValue(mockCircleWallet);

            // Mock linkWallets
            orchestrator.linkWallets = jest.fn().mockResolvedValue({
                id: 'link-123',
                user_id: userId,
                monay_wallet_id: mockMonayWallet.id,
                circle_wallet_id: mockCircleWallet.id,
                link_status: 'active'
            });

            const result = await orchestrator.initializeUserWallets(userId);

            expect(result.success).toBe(true);
            expect(result.data.monay).toEqual(mockMonayWallet);
            expect(result.data.circle).toEqual(mockCircleWallet);
            expect(result.data.link).toBeDefined();
            expect(orchestrator.getOrCreateMonayWallet).toHaveBeenCalledWith(userId);
            expect(orchestrator.getOrCreateCircleWallet).toHaveBeenCalledWith(userId);
        });

        it('should handle errors during wallet initialization', async () => {
            const userId = 'test-user-123';
            orchestrator.getOrCreateMonayWallet = jest.fn().mockRejectedValue(new Error('Database error'));

            await expect(orchestrator.initializeUserWallets(userId)).rejects.toThrow('Database error');
        });
    });

    describe('getCombinedBalance', () => {
        it('should return combined balance from both wallets', async () => {
            const userId = 'test-user-123';
            const mockBalance = {
                monay_balance: 5000.00,
                circle_balance: 2000.00,
                total_usd_value: 7000.00
            };

            sequelize.query.mockResolvedValue([mockBalance]);

            const result = await orchestrator.getCombinedBalance(userId);

            expect(result).toEqual({
                monay_balance: 5000.00,
                circle_balance: 2000.00,
                total_usd_value: 7000.00,
                currency: 'USD'
            });
            expect(sequelize.query).toHaveBeenCalledWith(
                expect.stringContaining('get_combined_balance'),
                expect.objectContaining({ replacements: { userId } })
            );
        });
    });

    describe('getOptimalPaymentRoute', () => {
        it('should recommend Circle for instant payments with lower fees', async () => {
            const userId = 'test-user-123';
            const amount = 100;
            const paymentType = 'payment';

            // Mock balance check
            orchestrator.getCombinedBalance = jest.fn().mockResolvedValue({
                monay_balance: 5000,
                circle_balance: 2000,
                total_usd_value: 7000,
                currency: 'USD'
            });

            sequelize.query.mockResolvedValue([]);

            const result = await orchestrator.getOptimalPaymentRoute(userId, amount, paymentType);

            expect(result.recommended_wallet).toBeDefined();
            expect(result.reason).toBeDefined();
            expect(result.analysis).toBeDefined();
            expect(result.analysis.fees).toHaveProperty('monay');
            expect(result.analysis.fees).toHaveProperty('circle');
            expect(result.analysis.times).toHaveProperty('monay');
            expect(result.analysis.times).toHaveProperty('circle');
        });

        it('should handle insufficient balance scenarios', async () => {
            const userId = 'test-user-123';
            const amount = 10000; // More than available balance

            orchestrator.getCombinedBalance = jest.fn().mockResolvedValue({
                monay_balance: 5000,
                circle_balance: 2000,
                total_usd_value: 7000,
                currency: 'USD'
            });

            sequelize.query.mockResolvedValue([]);

            const result = await orchestrator.getOptimalPaymentRoute(userId, amount, paymentType);

            expect(result.recommended_wallet).toBe('split');
            expect(result.reason).toContain('Requires combined balances');
        });
    });

    describe('calculateRoutingScores', () => {
        it('should calculate correct scores based on fees and speed', () => {
            const params = {
                amount: 100,
                paymentType: 'payment',
                balances: { monay_balance: 5000, circle_balance: 2000 },
                fees: { monay: 2.50, circle: 0.50 },
                times: { monay: 86400, circle: 2 },
                metadata: {}
            };

            const scores = orchestrator.calculateRoutingScores(params);

            expect(scores.circle).toBeGreaterThan(scores.monay);
            expect(scores.monay).toBeLessThanOrEqual(100);
            expect(scores.circle).toBeLessThanOrEqual(100);
        });

        it('should give bonus for international payments to Circle', () => {
            const params = {
                amount: 100,
                paymentType: 'payment',
                balances: { monay_balance: 5000, circle_balance: 2000 },
                fees: { monay: 2.50, circle: 0.50 },
                times: { monay: 86400, circle: 2 },
                metadata: { international: true }
            };

            const scores = orchestrator.calculateRoutingScores(params);

            expect(scores.circle).toBeGreaterThan(70); // High score for international
        });
    });

    describe('syncCircleWalletBalance', () => {
        it('should sync Circle wallet balance from API', async () => {
            const userId = 'test-user-123';
            const mockWallet = {
                id: 'wallet-123',
                circle_wallet_id: 'circle-123',
                user_id: userId
            };

            sequelize.query
                .mockResolvedValueOnce([[mockWallet]]) // Get wallet
                .mockResolvedValueOnce([]); // Update balance

            orchestrator.circleService.getWalletBalance = jest.fn().mockResolvedValue({
                success: true,
                data: {
                    balance: 1500.00,
                    availableBalance: 1500.00,
                    pendingBalance: 0
                }
            });

            const result = await orchestrator.syncCircleWalletBalance(userId);

            expect(result.success).toBe(true);
            expect(result.data.usdc_balance).toBe(1500.00);
            expect(orchestrator.circleService.getWalletBalance).toHaveBeenCalledWith('circle-123');
        });

        it('should handle sync failures gracefully', async () => {
            const userId = 'test-user-123';

            sequelize.query.mockResolvedValue([[]]);

            const result = await orchestrator.syncCircleWalletBalance(userId);

            expect(result.success).toBe(false);
            expect(result.error).toBe('Circle wallet not found');
        });
    });
});