import { Router } from 'express';
import controllers from '../controllers/index.js';
import middlewares from '../middleware-app/index.js';

const router = Router();
const { walletController } = controllers;
const { authMiddleware } = middlewares;

router.get(
    '/user/wallet',
    authMiddleware,
    walletController.getMyWallet
);

// Simple balance endpoint for demo
router.get(
    '/balance',
    authMiddleware,
    async (req, res) => {
        try {
            const userId = req.user?.id || req.user?.userId;

            if (!userId) {
                return res.status(400).json({
                    success: false,
                    message: 'User ID not found'
                });
            }

            // Use direct database query since models might not be loaded
            const db = req.app.get('db');
            const sequelize = db.sequelize;

            const [results] = await sequelize.query(
                'SELECT id, balance FROM wallets WHERE user_id = :userId LIMIT 1',
                {
                    replacements: { userId },
                    type: sequelize.QueryTypes.SELECT
                }
            );

            if (!results) {
                return res.status(404).json({
                    success: false,
                    message: 'Wallet not found'
                });
            }

            const balance = parseFloat(results.balance || 0);

            res.json({
                success: true,
                data: {
                    balance: balance,
                    available: balance,
                    walletId: results.id
                }
            });
        } catch (error) {
            console.error('Balance error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch balance'
            });
        }
    }
);

export default router;
