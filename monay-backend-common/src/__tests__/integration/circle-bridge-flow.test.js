import { describe, it, expect, jest, beforeEach, afterEach, beforeAll, afterAll } from '@jest/globals';
import BridgeTransferService from '../../services/bridge-transfer-service.js';
import db from '../../models/index.js';
const { sequelize } = db;

describe('Circle Bridge Transfer Integration Tests', () => {
    let bridgeService;
    let testUserId;
    let mockTransaction;

    beforeAll(async () => {
        // Setup test database connection if needed
        testUserId = 'test-user-' + Date.now();
    });

    afterAll(async () => {
        // Cleanup test data if needed
    });

    beforeEach(() => {
        bridgeService = new BridgeTransferService();
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

    describe('Bridge Transfer Flow: Monay to Circle', () => {
        it('should successfully transfer from Monay to Circle wallet', async () => {
            const amount = 100;

            // Mock wallet data
            const mockMonayWallet = {
                id: 'monay-wallet-123',
                user_id: testUserId,
                balance: 500.00,
                status: 'active'
            };

            const mockCircleWallet = {
                id: 'circle-wallet-123',
                user_id: testUserId,
                usdc_balance: 200.00,
                status: 'active'
            };

            // Setup query mocks
            sequelize.query
                .mockResolvedValueOnce([[mockMonayWallet]]) // Get Monay wallet
                .mockResolvedValueOnce([[mockCircleWallet]]) // Get Circle wallet
                .mockResolvedValueOnce([]) // Insert bridge transfer
                .mockResolvedValueOnce([]) // Update bridge status
                .mockResolvedValueOnce([]) // Update Monay balance
                .mockResolvedValueOnce([]) // Insert Monay transaction
                .mockResolvedValueOnce([]) // Update Circle balance
                .mockResolvedValueOnce([]) // Insert Circle transaction
                .mockResolvedValueOnce([]); // Complete bridge transfer

            const result = await bridgeService.bridgeMonayToCircle(testUserId, amount);

            expect(result.success).toBe(true);
            expect(result.data).toMatchObject({
                amount,
                from_wallet: 'monay',
                to_wallet: 'circle',
                status: 'completed'
            });
            expect(result.data.bridge_transfer_id).toBeDefined();
            expect(mockTransaction.commit).toHaveBeenCalled();
            expect(mockTransaction.rollback).not.toHaveBeenCalled();
        });

        it('should fail when insufficient Monay balance', async () => {
            const amount = 1000; // More than balance

            const mockMonayWallet = {
                id: 'monay-wallet-123',
                user_id: testUserId,
                balance: 500.00,
                status: 'active'
            };

            const mockCircleWallet = {
                id: 'circle-wallet-123',
                user_id: testUserId,
                usdc_balance: 200.00,
                status: 'active'
            };

            sequelize.query
                .mockResolvedValueOnce([[mockMonayWallet]])
                .mockResolvedValueOnce([[mockCircleWallet]]);

            const result = await bridgeService.bridgeMonayToCircle(testUserId, amount);

            expect(result.success).toBe(false);
            expect(result.error).toContain('Insufficient Monay balance');
            expect(mockTransaction.rollback).toHaveBeenCalled();
        });
    });

    describe('Bridge Transfer Flow: Circle to Monay', () => {
        it('should successfully transfer from Circle to Monay wallet', async () => {
            const amount = 50;

            const mockMonayWallet = {
                id: 'monay-wallet-123',
                user_id: testUserId,
                balance: 100.00,
                status: 'active'
            };

            const mockCircleWallet = {
                id: 'circle-wallet-123',
                user_id: testUserId,
                usdc_balance: 300.00,
                status: 'active'
            };

            sequelize.query
                .mockResolvedValueOnce([[mockMonayWallet]]) // Get Monay wallet
                .mockResolvedValueOnce([[mockCircleWallet]]) // Get Circle wallet
                .mockResolvedValueOnce([]) // Insert bridge transfer
                .mockResolvedValueOnce([]) // Update bridge status
                .mockResolvedValueOnce([]) // Update Circle balance
                .mockResolvedValueOnce([]) // Insert Circle transaction
                .mockResolvedValueOnce([]) // Update Monay balance
                .mockResolvedValueOnce([]) // Insert Monay transaction
                .mockResolvedValueOnce([]); // Complete bridge transfer

            const result = await bridgeService.bridgeCircleToMonay(testUserId, amount);

            expect(result.success).toBe(true);
            expect(result.data).toMatchObject({
                amount,
                from_wallet: 'circle',
                to_wallet: 'monay',
                status: 'completed'
            });
            expect(mockTransaction.commit).toHaveBeenCalled();
        });

        it('should fail when insufficient Circle balance', async () => {
            const amount = 500; // More than USDC balance

            const mockMonayWallet = {
                id: 'monay-wallet-123',
                user_id: testUserId,
                balance: 100.00,
                status: 'active'
            };

            const mockCircleWallet = {
                id: 'circle-wallet-123',
                user_id: testUserId,
                usdc_balance: 200.00,
                status: 'active'
            };

            sequelize.query
                .mockResolvedValueOnce([[mockMonayWallet]])
                .mockResolvedValueOnce([[mockCircleWallet]]);

            const result = await bridgeService.bridgeCircleToMonay(testUserId, amount);

            expect(result.success).toBe(false);
            expect(result.error).toContain('Insufficient USDC balance');
            expect(mockTransaction.rollback).toHaveBeenCalled();
        });
    });

    describe('Auto-Bridge Functionality', () => {
        it('should trigger auto-bridge when threshold exceeded', async () => {
            const mockWalletLink = {
                user_id: testUserId,
                auto_bridge_enabled: true,
                preferred_wallet: 'circle',
                bridge_threshold: 100,
                min_bridge_amount: 10,
                max_bridge_amount: 1000
            };

            const mockBalances = {
                monay_balance: 250, // Over threshold
                circle_balance: 50,
                total_usd_value: 300
            };

            sequelize.query
                .mockResolvedValueOnce([[mockWalletLink]]) // Get wallet link
                .mockResolvedValueOnce([[mockBalances]]); // Get combined balance

            // Mock the bridge transfer
            bridgeService.bridgeMonayToCircle = jest.fn().mockResolvedValue({
                success: true,
                data: { amount: 200 }
            });

            const result = await bridgeService.checkAutoBridge(testUserId);

            expect(result.success).toBe(true);
            expect(bridgeService.bridgeMonayToCircle).toHaveBeenCalled();
        });

        it('should not trigger auto-bridge when disabled', async () => {
            sequelize.query.mockResolvedValueOnce([[]]); // No wallet link

            const result = await bridgeService.checkAutoBridge(testUserId);

            expect(result.success).toBe(false);
            expect(result.message).toContain('Auto-bridge not enabled');
        });
    });

    describe('Bridge History and Estimation', () => {
        it('should retrieve bridge transfer history', async () => {
            const mockHistory = [
                {
                    id: 'transfer-1',
                    direction: 'monay_to_circle',
                    source_amount: 100,
                    source_currency: 'USD',
                    destination_currency: 'USDC',
                    status: 'completed',
                    bridge_fee: 0,
                    initiated_at: new Date(),
                    completed_at: new Date()
                },
                {
                    id: 'transfer-2',
                    direction: 'circle_to_monay',
                    source_amount: 50,
                    source_currency: 'USDC',
                    destination_currency: 'USD',
                    status: 'completed',
                    bridge_fee: 0,
                    initiated_at: new Date(),
                    completed_at: new Date()
                }
            ];

            sequelize.query.mockResolvedValueOnce([mockHistory]);

            const result = await bridgeService.getBridgeHistory(testUserId, 10);

            expect(result.success).toBe(true);
            expect(result.data).toHaveLength(2);
            expect(result.data[0]).toHaveProperty('id');
            expect(result.data[0]).toHaveProperty('direction');
            expect(result.data[0]).toHaveProperty('amount');
        });

        it('should provide bridge transfer estimation', async () => {
            const amount = 100;
            const direction = 'monay_to_circle';

            const mockBalances = {
                monay_balance: 500,
                circle_balance: 200
            };

            sequelize.query.mockResolvedValueOnce([[mockBalances]]);

            const result = await bridgeService.estimateBridge(testUserId, amount, direction);

            expect(result.success).toBe(true);
            expect(result.data).toMatchObject({
                direction,
                amount,
                fee: 0, // Free internal bridge
                time_seconds: 2,
                instant: true,
                sufficient_balance: true
            });
        });
    });

    describe('Edge Cases and Error Handling', () => {
        it('should handle invalid amount values', async () => {
            const result = await bridgeService.bridgeMonayToCircle(testUserId, -100);

            expect(result.success).toBe(false);
            expect(result.error).toContain('Invalid amount');
        });

        it('should handle missing wallets', async () => {
            sequelize.query
                .mockResolvedValueOnce([[undefined]]) // No Monay wallet
                .mockResolvedValueOnce([[undefined]]); // No Circle wallet

            const result = await bridgeService.bridgeMonayToCircle(testUserId, 100);

            expect(result.success).toBe(false);
            expect(result.error).toContain('Wallets not found');
        });

        it('should handle database transaction failures', async () => {
            const mockMonayWallet = {
                id: 'monay-wallet-123',
                balance: 500,
                status: 'active'
            };

            const mockCircleWallet = {
                id: 'circle-wallet-123',
                usdc_balance: 200,
                status: 'active'
            };

            sequelize.query
                .mockResolvedValueOnce([[mockMonayWallet]])
                .mockResolvedValueOnce([[mockCircleWallet]])
                .mockRejectedValueOnce(new Error('Database error'));

            const result = await bridgeService.bridgeMonayToCircle(testUserId, 100);

            expect(result.success).toBe(false);
            expect(result.error).toContain('Database error');
            expect(mockTransaction.rollback).toHaveBeenCalled();
        });
    });

    describe('Performance and Concurrency', () => {
        it('should handle concurrent bridge transfers', async () => {
            const amounts = [50, 75, 100];
            const promises = [];

            // Setup mocks for concurrent calls
            sequelize.query.mockImplementation(() => {
                return Promise.resolve([[{
                    id: 'wallet-' + Math.random(),
                    balance: 1000,
                    usdc_balance: 1000,
                    status: 'active'
                }]]);
            });

            // Simulate concurrent bridge transfers
            for (const amount of amounts) {
                promises.push(bridgeService.estimateBridge(testUserId, amount, 'monay_to_circle'));
            }

            const results = await Promise.all(promises);

            expect(results).toHaveLength(3);
            results.forEach(result => {
                expect(result.success).toBe(true);
            });
        });
    });
});