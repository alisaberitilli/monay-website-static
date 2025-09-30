import express from 'express';
import { authenticateToken } from '../middleware-app/auth-exports.js';
import enterpriseTreasuryService from '../services/enterprise-treasury.js';

const router = express.Router();

/**
 * @route   POST /api/enterprise-treasury/initialize
 * @desc    Initialize treasury for an enterprise (one-time setup)
 * @access  Private (Enterprise Admin)
 */
router.post('/initialize', authenticateToken, async (req, res) => {
  try {
    const { enterpriseId, walletAddress } = req.body;

    // Validate enterprise admin permission
    if (req.user.role !== 'ENTERPRISE_ADMIN' && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Only enterprise admins can initialize treasury'
      });
    }

    const result = await enterpriseTreasuryService.initializeEnterpriseTreasury(
      enterpriseId || req.user.enterprise_id,
      walletAddress
    );

    res.json(result);
  } catch (error) {
    console.error('Treasury initialization error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to initialize treasury'
    });
  }
});

/**
 * @route   POST /api/enterprise-treasury/invoice/create
 * @desc    Create a tokenized invoice on Solana
 * @access  Private (Enterprise)
 */
router.post('/invoice/create', authenticateToken, async (req, res) => {
  try {
    const {
      recipient_id,
      amount,
      due_date,
      description,
      line_items,
      type,
      terms
    } = req.body;

    // Validate required fields
    if (!recipient_id || !amount || !due_date) {
      return res.status(400).json({
        success: false,
        message: 'Recipient, amount, and due date are required'
      });
    }

    const invoiceData = {
      recipient_id,
      amount,
      due_date,
      description,
      line_items: line_items || [],
      type: type || 'ENTERPRISE',
      terms: terms || 'Net 30'
    };

    const result = await enterpriseTreasuryService.createTokenizedInvoice(
      req.user.enterprise_id,
      invoiceData
    );

    res.json(result);
  } catch (error) {
    console.error('Invoice creation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create invoice'
    });
  }
});

/**
 * @route   POST /api/enterprise-treasury/invoice/pay
 * @desc    Process payment for an invoice
 * @access  Private (Consumer/Enterprise)
 */
router.post('/invoice/pay', authenticateToken, async (req, res) => {
  try {
    const {
      invoice_id,
      amount,
      provider = 'tempo'
    } = req.body;

    if (!invoice_id || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Invoice ID and amount are required'
      });
    }

    const result = await enterpriseTreasuryService.processInvoicePayment(
      invoice_id,
      req.user.id,
      amount,
      provider
    );

    res.json(result);
  } catch (error) {
    console.error('Invoice payment error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to process payment'
    });
  }
});

/**
 * @route   POST /api/enterprise-treasury/swap
 * @desc    Swap treasury balance between Tempo and Circle
 * @access  Private (Treasury Manager)
 */
router.post('/swap', authenticateToken, async (req, res) => {
  try {
    const {
      amount,
      from_provider,
      to_provider
    } = req.body;

    // Validate treasury manager permission
    if (req.user.role !== 'TREASURY_MANAGER' && req.user.role !== 'ENTERPRISE_ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Only treasury managers can perform swaps'
      });
    }

    if (!amount || !from_provider || !to_provider) {
      return res.status(400).json({
        success: false,
        message: 'Amount, from_provider, and to_provider are required'
      });
    }

    const result = await enterpriseTreasuryService.swapTreasuryProvider(
      req.user.enterprise_id,
      amount,
      from_provider,
      to_provider
    );

    res.json(result);
  } catch (error) {
    console.error('Treasury swap error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to swap providers'
    });
  }
});

/**
 * @route   POST /api/enterprise-treasury/onramp
 * @desc    Deposit fiat and mint tokens for enterprise
 * @access  Private (Enterprise Admin)
 */
router.post('/onramp', authenticateToken, async (req, res) => {
  try {
    const {
      amount,
      deposit_method
    } = req.body;

    if (req.user.role !== 'ENTERPRISE_ADMIN' && req.user.role !== 'TREASURY_MANAGER') {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions for on-ramp'
      });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid amount is required'
      });
    }

    const result = await enterpriseTreasuryService.enterpriseOnRamp(
      req.user.enterprise_id,
      amount,
      deposit_method || 'WIRE'
    );

    res.json(result);
  } catch (error) {
    console.error('Enterprise on-ramp error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to process deposit'
    });
  }
});

/**
 * @route   POST /api/enterprise-treasury/offramp
 * @desc    Burn tokens and withdraw fiat for enterprise
 * @access  Private (Enterprise Admin)
 */
router.post('/offramp', authenticateToken, async (req, res) => {
  try {
    const {
      amount,
      withdrawal_method,
      provider = 'tempo'
    } = req.body;

    if (req.user.role !== 'ENTERPRISE_ADMIN' && req.user.role !== 'TREASURY_MANAGER') {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions for off-ramp'
      });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid amount is required'
      });
    }

    const result = await enterpriseTreasuryService.enterpriseOffRamp(
      req.user.enterprise_id,
      amount,
      withdrawal_method || 'WIRE',
      provider
    );

    res.json(result);
  } catch (error) {
    console.error('Enterprise off-ramp error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to process withdrawal'
    });
  }
});

/**
 * @route   GET /api/enterprise-treasury/dashboard
 * @desc    Get treasury dashboard data
 * @access  Private (Enterprise)
 */
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const result = await enterpriseTreasuryService.getTreasuryDashboard(
      req.user.enterprise_id
    );

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch dashboard data'
    });
  }
});

/**
 * @route   GET /api/enterprise-treasury/invoices
 * @desc    Get all invoices for an enterprise
 * @access  Private (Enterprise)
 */
router.get('/invoices', authenticateToken, async (req, res) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;

    const invoices = await db.Invoice.findAll({
      where: {
        enterprise_id: req.user.enterprise_id,
        ...(status && { status })
      },
      include: [
        {
          model: db.InvoiceLineItem,
          as: 'line_items'
        },
        {
          model: db.User,
          as: 'recipient',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: invoices,
      count: invoices.length,
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Fetch invoices error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch invoices'
    });
  }
});

/**
 * @route   GET /api/enterprise-treasury/invoice/:id
 * @desc    Get specific invoice details
 * @access  Private (Enterprise or Invoice Recipient)
 */
router.get('/invoice/:id', authenticateToken, async (req, res) => {
  try {
    const invoice = await db.Invoice.findByPk(req.params.id, {
      include: [
        {
          model: db.InvoiceLineItem,
          as: 'line_items'
        },
        {
          model: db.InvoicePayment,
          as: 'payments'
        },
        {
          model: db.User,
          as: 'recipient',
          attributes: ['id', 'name', 'email']
        },
        {
          model: db.Enterprise,
          as: 'issuer',
          attributes: ['id', 'name']
        }
      ]
    });

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    // Check access permission
    const hasAccess =
      invoice.enterprise_id === req.user.enterprise_id ||
      invoice.recipient_id === req.user.id ||
      req.user.role === 'ADMIN';

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this invoice'
      });
    }

    res.json({
      success: true,
      data: invoice
    });
  } catch (error) {
    console.error('Fetch invoice error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch invoice'
    });
  }
});

/**
 * @route   GET /api/enterprise-treasury/payments
 * @desc    Get payment history for enterprise
 * @access  Private (Enterprise)
 */
router.get('/payments', authenticateToken, async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    const payments = await db.InvoicePayment.findAll({
      include: [{
        model: db.Invoice,
        where: { enterprise_id: req.user.enterprise_id },
        include: [{
          model: db.User,
          as: 'recipient',
          attributes: ['id', 'name', 'email']
        }]
      }],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: payments,
      count: payments.length,
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Fetch payments error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch payments'
    });
  }
});

/**
 * @route   GET /api/enterprise-treasury/credits/:customerId
 * @desc    Get customer credits for a specific customer
 * @access  Private (Enterprise)
 */
router.get('/credits/:customerId', authenticateToken, async (req, res) => {
  try {
    const credits = await db.CustomerCredit.findAll({
      where: {
        customer_id: req.params.customerId,
        enterprise_id: req.user.enterprise_id,
        status: 'AVAILABLE'
      }
    });

    const totalCredit = credits.reduce((sum, credit) => sum + credit.amount, 0);

    res.json({
      success: true,
      data: {
        credits,
        total_available: totalCredit
      }
    });
  } catch (error) {
    console.error('Fetch credits error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch credits'
    });
  }
});

/**
 * @route   POST /api/enterprise-treasury/credits/apply
 * @desc    Apply customer credit to an invoice
 * @access  Private (Enterprise)
 */
router.post('/credits/apply', authenticateToken, async (req, res) => {
  try {
    const { credit_id, invoice_id } = req.body;

    if (!credit_id || !invoice_id) {
      return res.status(400).json({
        success: false,
        message: 'Credit ID and invoice ID are required'
      });
    }

    // Fetch credit and validate
    const credit = await db.CustomerCredit.findByPk(credit_id);
    if (!credit || credit.status !== 'AVAILABLE') {
      return res.status(400).json({
        success: false,
        message: 'Invalid or unavailable credit'
      });
    }

    // Apply credit as payment
    const result = await enterpriseTreasuryService.processInvoicePayment(
      invoice_id,
      credit.customer_id,
      credit.amount,
      'credit'
    );

    // Mark credit as used
    await credit.update({
      status: 'APPLIED',
      applied_to_invoice_id: invoice_id,
      applied_at: new Date()
    });

    res.json({
      success: true,
      message: 'Credit applied successfully',
      data: result
    });
  } catch (error) {
    console.error('Apply credit error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to apply credit'
    });
  }
});

export default router;