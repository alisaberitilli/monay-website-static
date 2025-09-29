import express from 'express';
import pool from '../config/database.js';
import authenticate from '../middlewares/auth-middleware.js';
import BusinessRuleEngine from '../services/businessRuleEngine.js';

const router = express.Router();
import MonayFiatRailsClient from '../services/monayFiatRailsClient.js';
import { validateRequest } from '../middlewares/validation.js';
import { body, param, query } from 'express-validator';

// Benefit enrollment endpoint
router.post('/enroll',
  verifyToken,
  [
    body('program_type').isIn(['SNAP', 'TANF', 'MEDICAID', 'WIC', 'VETERANS', 'SECTION_8',
      'LIHEAP', 'UI', 'SCHOOL_CHOICE_ESA', 'CHILD_CARE', 'TRANSPORTATION',
      'EMERGENCY_RENTAL', 'FREE_REDUCED_MEALS', 'EITC']).withMessage('Invalid program type'),
    body('enrollment_data').isObject().withMessage('Enrollment data must be an object'),
    body('verification_documents').optional().isArray()
  ],
  validateRequest,
  async (req, res) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const { program_type, enrollment_data, verification_documents } = req.body;

      // Check if user already enrolled
      const existingEnrollment = await client.query(
        `SELECT * FROM government_benefits
         WHERE user_id = $1 AND program_type = $2 AND status = 'ACTIVE'`,
        [req.user.id, program_type]
      );

      if (existingEnrollment.rows.length > 0) {
        return res.status(400).json({ error: 'Already enrolled in this program' });
      }

      // Verify eligibility
      const eligibilityResult = await verifyEligibility(req.user.id, program_type, enrollment_data, client);

      if (!eligibilityResult.eligible) {
        return res.status(400).json({
          error: 'Not eligible for program',
          reasons: eligibilityResult.reasons
        });
      }

      // Create benefit enrollment
      const enrollmentResult = await client.query(
        `INSERT INTO government_benefits
         (user_id, program_type, enrollment_data, verification_status, balance_amount, status, created_at)
         VALUES ($1, $2, $3, $4, $5, 'PENDING', NOW())
         RETURNING *`,
        [req.user.id, program_type, enrollment_data, 'PENDING', 0]
      );

      // Store verification documents if provided
      if (verification_documents && verification_documents.length > 0) {
        for (const doc of verification_documents) {
          await client.query(
            `INSERT INTO benefit_verification_documents
             (benefit_id, document_type, document_url, upload_date)
             VALUES ($1, $2, $3, NOW())`,
            [enrollmentResult.rows[0].id, doc.type, doc.url]
          );
        }
      }

      // Create audit log
      await client.query(
        `INSERT INTO benefit_audit_logs
         (benefit_id, user_id, action, details, timestamp)
         VALUES ($1, $2, 'ENROLLMENT_INITIATED', $3, NOW())`,
        [enrollmentResult.rows[0].id, req.user.id, { program_type, enrollment_data }]
      );

      await client.query('COMMIT');

      res.json({
        success: true,
        enrollment: enrollmentResult.rows[0],
        next_steps: getNextStepsForProgram(program_type)
      });

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Enrollment error:', error);
      res.status(500).json({ error: 'Failed to process enrollment' });
    } finally {
      client.release();
    }
  }
);

// Get benefit balance
router.get('/balance/:program_type',
  verifyToken,
  [
    param('program_type').isIn(['SNAP', 'TANF', 'MEDICAID', 'WIC', 'VETERANS', 'SECTION_8',
      'LIHEAP', 'UI', 'SCHOOL_CHOICE_ESA', 'CHILD_CARE', 'TRANSPORTATION',
      'EMERGENCY_RENTAL', 'FREE_REDUCED_MEALS', 'EITC'])
  ],
  validateRequest,
  async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT gb.*,
                COALESCE(SUM(bt.amount) FILTER (WHERE bt.transaction_type = 'CREDIT'), 0) as total_credits,
                COALESCE(SUM(bt.amount) FILTER (WHERE bt.transaction_type = 'DEBIT'), 0) as total_debits,
                COUNT(bt.id) FILTER (WHERE bt.transaction_date >= DATE_TRUNC('month', CURRENT_DATE)) as monthly_transactions
         FROM government_benefits gb
         LEFT JOIN benefit_transactions bt ON gb.id = bt.benefit_id
         WHERE gb.user_id = $1 AND gb.program_type = $2 AND gb.status = 'ACTIVE'
         GROUP BY gb.id`,
        [req.user.id, req.params.program_type]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'No active enrollment found' });
      }

      const benefit = result.rows[0];
      const currentBalance = benefit.balance_amount;
      const availableBalance = await calculateAvailableBalance(benefit, pool);

      res.json({
        program_type: benefit.program_type,
        current_balance: currentBalance,
        available_balance: availableBalance,
        total_credits: benefit.total_credits,
        total_debits: benefit.total_debits,
        monthly_transactions: benefit.monthly_transactions,
        next_disbursement: benefit.next_disbursement_date,
        restrictions: BusinessRuleEngine.FEDERAL_PROGRAM_RULES[benefit.program_type]
      });

    } catch (error) {
      console.error('Balance check error:', error);
      res.status(500).json({ error: 'Failed to retrieve balance' });
    }
  }
);

// Process benefit transaction
router.post('/transaction',
  verifyToken,
  [
    body('program_type').isIn(['SNAP', 'TANF', 'MEDICAID', 'WIC', 'VETERANS', 'SECTION_8',
      'LIHEAP', 'UI', 'SCHOOL_CHOICE_ESA', 'CHILD_CARE', 'TRANSPORTATION',
      'EMERGENCY_RENTAL', 'FREE_REDUCED_MEALS', 'EITC']),
    body('amount').isFloat({ min: 0.01 }).withMessage('Invalid amount'),
    body('merchant_info').isObject(),
    body('transaction_type').isIn(['PURCHASE', 'WITHDRAWAL', 'TRANSFER'])
  ],
  validateRequest,
  async (req, res) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const { program_type, amount, merchant_info, transaction_type } = req.body;

      // Get active benefit
      const benefitResult = await client.query(
        `SELECT * FROM government_benefits
         WHERE user_id = $1 AND program_type = $2 AND status = 'ACTIVE'
         FOR UPDATE`,
        [req.user.id, program_type]
      );

      if (benefitResult.rows.length === 0) {
        return res.status(404).json({ error: 'No active benefit found' });
      }

      const benefit = benefitResult.rows[0];

      // Check balance
      if (benefit.balance_amount < amount) {
        return res.status(400).json({ error: 'Insufficient balance' });
      }

      // Validate transaction with Business Rule Engine
      const validationResult = await BusinessRuleEngine.validateBenefitTransaction(
        benefit,
        {
          amount,
          merchant_info,
          transaction_type,
          user_id: req.user.id
        },
        client
      );

      if (!validationResult.approved) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          error: 'Transaction not allowed',
          reasons: validationResult.reasons,
          code: validationResult.code
        });
      }

      // Process transaction through Monay-Fiat Rails if needed
      let railsTransactionId = null;
      if (transaction_type === 'WITHDRAWAL' || transaction_type === 'TRANSFER') {
        const railsClient = new MonayFiatRailsClient();
        const railsResult = await railsClient.processDisbursement({
          amount,
          beneficiary_id: req.user.id,
          program_type,
          transaction_type,
          destination: merchant_info.account_info
        });
        railsTransactionId = railsResult.transaction_id;
      }

      // Update balance
      await client.query(
        `UPDATE government_benefits
         SET balance_amount = balance_amount - $1,
             last_transaction_date = NOW(),
             updated_at = NOW()
         WHERE id = $2`,
        [amount, benefit.id]
      );

      // Record transaction
      const transactionResult = await client.query(
        `INSERT INTO benefit_transactions
         (benefit_id, transaction_type, amount, merchant_info,
          authorization_code, rails_transaction_id, status, transaction_date)
         VALUES ($1, 'DEBIT', $2, $3, $4, $5, 'COMPLETED', NOW())
         RETURNING *`,
        [benefit.id, amount, merchant_info, validationResult.authorization_code, railsTransactionId]
      );

      // Create audit log
      await client.query(
        `INSERT INTO benefit_audit_logs
         (benefit_id, user_id, action, details, timestamp)
         VALUES ($1, $2, 'TRANSACTION_PROCESSED', $3, NOW())`,
        [benefit.id, req.user.id, {
          transaction_id: transactionResult.rows[0].id,
          amount,
          merchant_info,
          transaction_type
        }]
      );

      await client.query('COMMIT');

      res.json({
        success: true,
        transaction: transactionResult.rows[0],
        remaining_balance: benefit.balance_amount - amount,
        authorization_code: validationResult.authorization_code
      });

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Transaction error:', error);
      res.status(500).json({ error: 'Failed to process transaction' });
    } finally {
      client.release();
    }
  }
);

// Get transaction history
router.get('/transactions/:program_type',
  verifyToken,
  [
    param('program_type').isIn(['SNAP', 'TANF', 'MEDICAID', 'WIC', 'VETERANS', 'SECTION_8',
      'LIHEAP', 'UI', 'SCHOOL_CHOICE_ESA', 'CHILD_CARE', 'TRANSPORTATION',
      'EMERGENCY_RENTAL', 'FREE_REDUCED_MEALS', 'EITC']),
    query('start_date').optional().isISO8601(),
    query('end_date').optional().isISO8601(),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('offset').optional().isInt({ min: 0 })
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { program_type } = req.params;
      const { start_date, end_date, limit = 50, offset = 0 } = req.query;

      let query = `
        SELECT bt.*, gb.program_type
        FROM benefit_transactions bt
        JOIN government_benefits gb ON bt.benefit_id = gb.id
        WHERE gb.user_id = $1 AND gb.program_type = $2
      `;

      const params = [req.user.id, program_type];
      let paramIndex = 3;

      if (start_date) {
        query += ` AND bt.transaction_date >= $${paramIndex}`;
        params.push(start_date);
        paramIndex++;
      }

      if (end_date) {
        query += ` AND bt.transaction_date <= $${paramIndex}`;
        params.push(end_date);
        paramIndex++;
      }

      query += ` ORDER BY bt.transaction_date DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(limit, offset);

      const result = await pool.query(query, params);

      res.json({
        transactions: result.rows,
        count: result.rows.length,
        limit,
        offset
      });

    } catch (error) {
      console.error('Transaction history error:', error);
      res.status(500).json({ error: 'Failed to retrieve transaction history' });
    }
  }
);

// Issue benefit disbursement (admin only)
router.post('/disburse',
  verifyToken,
  requireRole(['ADMIN', 'GOVERNMENT_ADMIN']),
  [
    body('user_id').isUUID(),
    body('program_type').isIn(['SNAP', 'TANF', 'MEDICAID', 'WIC', 'VETERANS', 'SECTION_8',
      'LIHEAP', 'UI', 'SCHOOL_CHOICE_ESA', 'CHILD_CARE', 'TRANSPORTATION',
      'EMERGENCY_RENTAL', 'FREE_REDUCED_MEALS', 'EITC']),
    body('amount').isFloat({ min: 0.01 }),
    body('disbursement_type').isIn(['REGULAR', 'EMERGENCY', 'SUPPLEMENTAL']),
    body('reference_number').optional().isString()
  ],
  validateRequest,
  async (req, res) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const { user_id, program_type, amount, disbursement_type, reference_number } = req.body;

      // Get or create benefit enrollment
      let benefitResult = await client.query(
        `SELECT * FROM government_benefits
         WHERE user_id = $1 AND program_type = $2 AND status = 'ACTIVE'
         FOR UPDATE`,
        [user_id, program_type]
      );

      if (benefitResult.rows.length === 0) {
        // Create new enrollment if doesn't exist
        benefitResult = await client.query(
          `INSERT INTO government_benefits
           (user_id, program_type, enrollment_data, verification_status, balance_amount, status, created_at)
           VALUES ($1, $2, $3, 'VERIFIED', 0, 'ACTIVE', NOW())
           RETURNING *`,
          [user_id, program_type, { auto_enrolled: true, disbursement_type }]
        );
      }

      const benefit = benefitResult.rows[0];

      // Update balance
      await client.query(
        `UPDATE government_benefits
         SET balance_amount = balance_amount + $1,
             last_disbursement_date = NOW(),
             next_disbursement_date = CASE
               WHEN $2 = 'REGULAR' THEN DATE_TRUNC('month', NOW() + INTERVAL '1 month')
               ELSE next_disbursement_date
             END,
             updated_at = NOW()
         WHERE id = $3`,
        [amount, disbursement_type, benefit.id]
      );

      // Record disbursement transaction
      const transactionResult = await client.query(
        `INSERT INTO benefit_transactions
         (benefit_id, transaction_type, amount, merchant_info,
          authorization_code, status, transaction_date)
         VALUES ($1, 'CREDIT', $2, $3, $4, 'COMPLETED', NOW())
         RETURNING *`,
        [benefit.id, amount, {
          disbursement_type,
          reference_number,
          issued_by: req.user.id
        }, reference_number || generateAuthCode()]
      );

      // Create disbursement record
      await client.query(
        `INSERT INTO benefit_disbursements
         (benefit_id, amount, disbursement_type, reference_number,
          status, issued_by, issued_at)
         VALUES ($1, $2, $3, $4, 'COMPLETED', $5, NOW())`,
        [benefit.id, amount, disbursement_type, reference_number, req.user.id]
      );

      // Audit log
      await client.query(
        `INSERT INTO benefit_audit_logs
         (benefit_id, user_id, action, details, timestamp)
         VALUES ($1, $2, 'DISBURSEMENT_ISSUED', $3, NOW())`,
        [benefit.id, req.user.id, {
          recipient_id: user_id,
          amount,
          disbursement_type,
          reference_number
        }]
      );

      await client.query('COMMIT');

      res.json({
        success: true,
        disbursement: transactionResult.rows[0],
        new_balance: benefit.balance_amount + amount
      });

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Disbursement error:', error);
      res.status(500).json({ error: 'Failed to process disbursement' });
    } finally {
      client.release();
    }
  }
);

// Verify benefit eligibility
router.post('/verify-eligibility',
  verifyToken,
  [
    body('program_type').isIn(['SNAP', 'TANF', 'MEDICAID', 'WIC', 'VETERANS', 'SECTION_8',
      'LIHEAP', 'UI', 'SCHOOL_CHOICE_ESA', 'CHILD_CARE', 'TRANSPORTATION',
      'EMERGENCY_RENTAL', 'FREE_REDUCED_MEALS', 'EITC']),
    body('verification_data').isObject()
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { program_type, verification_data } = req.body;

      const eligibilityResult = await verifyEligibility(
        req.user.id,
        program_type,
        verification_data,
        pool
      );

      res.json(eligibilityResult);

    } catch (error) {
      console.error('Eligibility verification error:', error);
      res.status(500).json({ error: 'Failed to verify eligibility' });
    }
  }
);

// Helper function to verify eligibility
async function verifyEligibility(userId, programType, data, client) {
  const rules = BusinessRuleEngine.FEDERAL_PROGRAM_RULES[programType];
  const reasons = [];
  let eligible = true;

  // Check income requirements
  if (rules.max_income) {
    if (data.household_income > rules.max_income[data.household_size || 1]) {
      eligible = false;
      reasons.push('Household income exceeds program limits');
    }
  }

  // Check age requirements
  if (rules.min_age && data.age < rules.min_age) {
    eligible = false;
    reasons.push(`Must be at least ${rules.min_age} years old`);
  }

  // Check residency requirements
  if (rules.residency_required && !data.state_resident) {
    eligible = false;
    reasons.push('State residency required');
  }

  // Check veteran status for veterans programs
  if (programType === 'VETERANS' && !data.veteran_status) {
    eligible = false;
    reasons.push('Veteran status required');
  }

  // Check disability status for certain programs
  if (rules.disability_eligible && data.has_disability) {
    eligible = true;
    reasons.push('Qualified based on disability status');
  }

  // Store eligibility check result
  if (client) {
    await client.query(
      `INSERT INTO benefit_eligibility_checks
       (user_id, program_type, check_data, result, reasons, check_date)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [userId, programType, data, eligible, reasons]
    );
  }

  return { eligible, reasons };
}

// Helper function to calculate available balance
async function calculateAvailableBalance(benefit, pool) {
  // Get pending transactions
  const pendingResult = await pool.query(
    `SELECT COALESCE(SUM(amount), 0) as pending_amount
     FROM benefit_transactions
     WHERE benefit_id = $1 AND status = 'PENDING'`,
    [benefit.id]
  );

  const pendingAmount = pendingResult.rows[0].pending_amount;
  return Math.max(0, benefit.balance_amount - pendingAmount);
}

// Helper function to get next steps for program
function getNextStepsForProgram(programType) {
  const steps = {
    SNAP: [
      'Upload proof of income',
      'Complete interview if required',
      'Wait for verification (typically 30 days)',
      'Receive EBT card upon approval'
    ],
    TANF: [
      'Submit employment verification',
      'Complete work requirements assessment',
      'Attend orientation session',
      'Set up direct deposit or card'
    ],
    WIC: [
      'Schedule nutrition assessment appointment',
      'Bring proof of pregnancy or children\'s birth certificates',
      'Complete nutrition education',
      'Receive benefit card'
    ],
    VETERANS: [
      'Submit DD-214 or discharge papers',
      'Complete VA enrollment form',
      'Schedule C&P exam if required',
      'Wait for rating decision'
    ],
    UI: [
      'File weekly claim certifications',
      'Report any work or earnings',
      'Complete work search requirements',
      'Attend required appointments'
    ],
    SCHOOL_CHOICE_ESA: [
      'Submit student enrollment verification',
      'Choose participating school or education provider',
      'Submit expense documentation',
      'Track remaining balance'
    ]
  };

  return steps[programType] || ['Contact program administrator for next steps'];
}

// Helper function to generate authorization code
function generateAuthCode() {
  return 'AUTH' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 8).toUpperCase();
}

export default router;