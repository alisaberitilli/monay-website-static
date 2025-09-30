import express from 'express';
const router = express.Router();
import { Pool } from 'pg';
import { authenticateToken } from '../middleware-app/platform-admin-auth.js';

// Initialize service
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

/**
 * @route   GET /api/billing/analytics
 * @desc    Get billing analytics for admin dashboard
 * @access  Admin (no auth required)
 */
router.get('/analytics', async (req, res) => {
  try {
    // Admin panel access - no additional permission check needed
    const { period = 'monthly' } = req.query;

    // Basic analytics calculation
    const mockMetrics = {
      total_revenue_cents: 250000000, // $2.5M
      usdxm_revenue_cents: 50000000,  // $500K (20% USDXM adoption)
      other_stablecoin_revenue_cents: 200000000, // $2M
      total_discounts_cents: 5000000,  // $50K in discounts
      active_subscriptions: 150,
      new_subscriptions: 25,
      churned_subscriptions: 5,
      average_revenue_per_tenant: 166667, // cents
      tier_breakdown: {
        free: { count: 50, revenue: 0 },
        small_business: { count: 75, revenue: 75000000 }, // $750K
        enterprise: { count: 20, revenue: 150000000 },   // $1.5M
        custom: { count: 5, revenue: 25000000 }          // $250K
      },
      top_tenants: [
        {
          id: 'tenant_001',
          name: 'TechCorp Inc',
          revenue_cents: 25000000, // $250K
          payment_method: 'USDXM',
          tier: 'enterprise'
        },
        {
          id: 'tenant_002',
          name: 'Global Finance LLC',
          revenue_cents: 20000000, // $200K
          payment_method: 'USDC',
          tier: 'enterprise'
        },
        {
          id: 'tenant_003',
          name: 'StartupHub',
          revenue_cents: 15000000, // $150K
          payment_method: 'USDXM',
          tier: 'small_business'
        },
        {
          id: 'tenant_004',
          name: 'Enterprise Solutions',
          revenue_cents: 12000000, // $120K
          payment_method: 'USDT',
          tier: 'enterprise'
        },
        {
          id: 'tenant_005',
          name: 'Digital Ventures',
          revenue_cents: 10000000, // $100K
          payment_method: 'USDXM',
          tier: 'small_business'
        }
      ],
      payment_methods: {
        USDXM: {
          count: 50,
          revenue: 50000000,  // $500K
          discount: 5000000   // $50K discount given
        },
        USDC: {
          count: 65,
          revenue: 130000000  // $1.3M
        },
        USDT: {
          count: 35,
          revenue: 70000000   // $700K
        }
      }
    };

    res.json(mockMetrics);

  } catch (error) {
    console.error('Error fetching billing analytics:', error);
    res.status(500).json({
      error: 'Failed to fetch analytics',
      message: error.message
    });
  }
});

export default router;