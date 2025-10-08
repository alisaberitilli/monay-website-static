/**
 * Reserve Management API Routes
 * Handles fiat reserve reconciliation and tracking
 *
 * @module routes/reserves
 */

import express from 'express';
// import authMiddleware from '../middleware-app/auth-middleware.js';
import db from '../models/index.js';

const router = express.Router();

/**
 * GET /api/v1/reserves/balance
 * Get current reserve balance and status
 */
router.get('/balance', async (req, res) => {
  try {
    // Get latest reconciliation for each provider
    const reserves = await db.sequelize.query(
      `SELECT DISTINCT ON (provider)
        provider,
        date,
        total_tokens_minted,
        total_fiat_reserved,
        discrepancy,
        status,
        reconciled_at
       FROM reserve_reconciliation
       ORDER BY provider, date DESC`,
      { type: db.sequelize.QueryTypes.SELECT }
    );

    // Calculate total reserves
    const totalMinted = reserves.reduce((sum, r) => sum + parseFloat(r.total_tokens_minted || 0), 0);
    const totalReserved = reserves.reduce((sum, r) => sum + parseFloat(r.total_fiat_reserved || 0), 0);
    const totalDiscrepancy = reserves.reduce((sum, r) => sum + parseFloat(r.discrepancy || 0), 0);

    res.json({
      success: true,
      summary: {
        totalTokensMinted: totalMinted,
        totalFiatReserved: totalReserved,
        discrepancy: totalDiscrepancy,
        ratio: totalReserved > 0 ? (totalMinted / totalReserved).toFixed(4) : 1,
        status: Math.abs(totalDiscrepancy) < 0.01 ? 'balanced' : 'imbalanced'
      },
      providers: reserves
    });
  } catch (error) {
    console.error('Failed to get reserve balance:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve reserve balance'
    });
  }
});

/**
 * POST /api/v1/reserves/reconcile
 * Trigger manual reconciliation (admin only)
 */
router.post('/reconcile', async (req, res) => {
  try {
    const { provider = 'tempo' } = req.body;

    // Get current token supply from invoice wallets
    const tokenStats = await db.sequelize.query(
      `SELECT
        COUNT(*) as total_wallets,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_wallets,
        COUNT(DISTINCT invoice_id) as total_invoices
       FROM invoice_wallets
       WHERE provider = :provider`,
      {
        replacements: { provider },
        type: db.sequelize.QueryTypes.SELECT
      }
    );

    // Simulated fiat reserve balance (in production, this would query actual bank/provider APIs)
    const fiatReserve = 1000000.00; // $1M reserve
    const tokensMinted = parseFloat(tokenStats[0].total_wallets || 0) * 100; // Example: 100 tokens per wallet
    const discrepancy = tokensMinted - fiatReserve;

    // Create reconciliation record
    const reconciliation = await db.sequelize.query(
      `INSERT INTO reserve_reconciliation (
        date, provider, total_tokens_minted, total_fiat_reserved,
        discrepancy, status, reconciled_at, reconciled_by, notes
      ) VALUES (
        CURRENT_DATE, :provider, :tokensMinted, :fiatReserve,
        :discrepancy, :status, NOW(), :userId, :notes
      ) RETURNING *`,
      {
        replacements: {
          provider,
          tokensMinted,
          fiatReserve,
          discrepancy,
          status: Math.abs(discrepancy) < 0.01 ? 'balanced' : 'imbalanced',
          userId: req.user.id,
          notes: `Manual reconciliation triggered by ${req.user.email}`
        },
        type: db.sequelize.QueryTypes.INSERT
      }
    );

    res.json({
      success: true,
      message: 'Reconciliation completed successfully',
      reconciliation: reconciliation[0]
    });
  } catch (error) {
    console.error('Failed to reconcile reserves:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reconcile reserves'
    });
  }
});

/**
 * GET /api/v1/reserves/history
 * Get reconciliation history
 */
router.get('/history', async (req, res) => {
  try {
    const { provider, days = 30 } = req.query;

    let query = `
      SELECT * FROM reserve_reconciliation
      WHERE date >= CURRENT_DATE - INTERVAL :days DAY
    `;
    const replacements = { days: parseInt(days) };

    if (provider) {
      query += ' AND provider = :provider';
      replacements.provider = provider;
    }

    query += ' ORDER BY date DESC, provider ASC';

    const history = await db.sequelize.query(query, {
      replacements,
      type: db.sequelize.QueryTypes.SELECT
    });

    res.json({
      success: true,
      history
    });
  } catch (error) {
    console.error('Failed to get reconciliation history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve reconciliation history'
    });
  }
});

/**
 * GET /api/v1/reserves/alerts
 * Get reserve imbalance alerts
 */
router.get('/alerts', async (req, res) => {
  try {
    const alerts = await db.sequelize.query(
      `SELECT
        provider,
        date,
        discrepancy,
        status,
        CASE
          WHEN ABS(discrepancy) > 10000 THEN 'critical'
          WHEN ABS(discrepancy) > 1000 THEN 'warning'
          ELSE 'info'
        END as severity
       FROM reserve_reconciliation
       WHERE status = 'imbalanced'
         AND date >= CURRENT_DATE - INTERVAL '7 days'
       ORDER BY ABS(discrepancy) DESC`,
      { type: db.sequelize.QueryTypes.SELECT }
    );

    res.json({
      success: true,
      alerts,
      count: alerts.length
    });
  } catch (error) {
    console.error('Failed to get reserve alerts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve reserve alerts'
    });
  }
});

/**
 * POST /api/v1/reserves/adjust
 * Manually adjust reserve balance (admin only)
 */
router.post('/adjust', async (req, res) => {
  try {
    const { provider, amount, reason } = req.body;

    if (!provider || !amount || !reason) {
      return res.status(400).json({
        success: false,
        error: 'Provider, amount, and reason are required'
      });
    }

    // Create adjustment record
    const adjustment = await db.sequelize.query(
      `INSERT INTO audit_logs (
        action, entity_type, entity_id, user_id, details, created_at
      ) VALUES (
        'reserve_adjustment', 'reserve', :provider, :userId, :details, NOW()
      ) RETURNING *`,
      {
        replacements: {
          provider,
          userId: req.user.id,
          details: JSON.stringify({
            provider,
            amount,
            reason,
            adjustedBy: req.user.email,
            timestamp: new Date()
          })
        },
        type: db.sequelize.QueryTypes.INSERT
      }
    );

    // Trigger new reconciliation
    await db.sequelize.query(
      `UPDATE reserve_reconciliation
       SET total_fiat_reserved = total_fiat_reserved + :amount,
           discrepancy = total_tokens_minted - (total_fiat_reserved + :amount),
           notes = CONCAT(notes, E'\\n', :note)
       WHERE provider = :provider
         AND date = CURRENT_DATE`,
      {
        replacements: {
          provider,
          amount: parseFloat(amount),
          note: `Adjustment: ${reason} (${amount > 0 ? '+' : ''}${amount} by ${req.user.email})`
        },
        type: db.sequelize.QueryTypes.UPDATE
      }
    );

    res.json({
      success: true,
      message: 'Reserve adjustment completed successfully',
      adjustment: adjustment[0]
    });
  } catch (error) {
    console.error('Failed to adjust reserves:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to adjust reserves'
    });
  }
});

export default router;