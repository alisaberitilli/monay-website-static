import express from 'express';
import pool from '../config/database';
import authenticate from '../middlewares/auth-middleware';
import { validateRequest } from '../middlewares/validation';

const router = express.Router();
import { body, param, query } from 'express-validator';
const BenefitEligibilityVerification = require('../services/benefitEligibilityVerification');
const BenefitBalanceTracker = require('../services/benefitBalanceTracker');

/**
 * Self-Service Benefit Portal API
 * Provides user-facing endpoints for benefit management
 */

// Get user dashboard data
router.get('/dashboard',
  verifyToken,
  async (req, res) => {
    const client = await pool.connect();
    try {
      const userId = req.user.id;

      // Get all active benefits
      const benefitsResult = await client.query(
        `SELECT
          gb.*,
          COUNT(bt.id) as transaction_count,
          MAX(bt.transaction_date) as last_transaction,
          COALESCE(SUM(bt.amount) FILTER (WHERE bt.transaction_date >= DATE_TRUNC('month', CURRENT_DATE)), 0) as monthly_spent
         FROM government_benefits gb
         LEFT JOIN benefit_transactions bt ON gb.id = bt.benefit_id
         WHERE gb.user_id = $1 AND gb.status IN ('ACTIVE', 'PENDING')
         GROUP BY gb.id
         ORDER BY gb.created_at DESC`,
        [userId]
      );

      // Get recent transactions across all benefits
      const recentTransactions = await client.query(
        `SELECT
          bt.*,
          gb.program_type
         FROM benefit_transactions bt
         JOIN government_benefits gb ON bt.benefit_id = gb.id
         WHERE gb.user_id = $1
         ORDER BY bt.transaction_date DESC
         LIMIT 10`,
        [userId]
      );

      // Get upcoming disbursements
      const upcomingDisbursements = await client.query(
        `SELECT
          program_type,
          next_disbursement_date,
          last_disbursement_amount as expected_amount
         FROM government_benefits
         WHERE user_id = $1
           AND status = 'ACTIVE'
           AND next_disbursement_date IS NOT NULL
           AND next_disbursement_date > CURRENT_DATE
         ORDER BY next_disbursement_date`,
        [userId]
      );

      // Get notifications/alerts
      const notifications = await client.query(
        `SELECT * FROM user_notifications
         WHERE user_id = $1 AND read = false
         ORDER BY created_at DESC
         LIMIT 5`,
        [userId]
      );

      // Calculate total available balance
      let totalBalance = 0;
      let totalAvailable = 0;
      for (const benefit of benefitsResult.rows) {
        totalBalance += parseFloat(benefit.balance_amount || 0);
        // Get real-time available balance
        const balance = await BenefitBalanceTracker.getBalance(benefit.id, userId);
        totalAvailable += balance.available_balance;
      }

      res.json({
        summary: {
          total_balance: totalBalance,
          total_available: totalAvailable,
          active_benefits: benefitsResult.rows.filter(b => b.status === 'ACTIVE').length,
          pending_benefits: benefitsResult.rows.filter(b => b.status === 'PENDING').length
        },
        benefits: benefitsResult.rows,
        recent_transactions: recentTransactions.rows,
        upcoming_disbursements: upcomingDisbursements.rows,
        notifications: notifications.rows
      });

    } catch (error) {
      console.error('Dashboard error:', error);
      res.status(500).json({ error: 'Failed to load dashboard' });
    } finally {
      client.release();
    }
  }
);

// Get available programs for enrollment
router.get('/available-programs',
  verifyToken,
  async (req, res) => {
    const client = await pool.connect();
    try {
      const userId = req.user.id;

      // Get all programs
      const programs = [
        'SNAP', 'TANF', 'MEDICAID', 'WIC', 'VETERANS', 'SECTION_8',
        'LIHEAP', 'UI', 'SCHOOL_CHOICE_ESA', 'CHILD_CARE',
        'TRANSPORTATION', 'EMERGENCY_RENTAL', 'FREE_REDUCED_MEALS', 'EITC'
      ];

      // Get user's enrolled programs
      const enrolledResult = await client.query(
        `SELECT program_type FROM government_benefits
         WHERE user_id = $1 AND status IN ('ACTIVE', 'PENDING')`,
        [userId]
      );

      const enrolled = enrolledResult.rows.map(r => r.program_type);

      // Get user profile for pre-screening
      const profileResult = await client.query(
        `SELECT * FROM customer_profiles WHERE user_id = $1`,
        [userId]
      );

      const profile = profileResult.rows[0] || {};

      // Build available programs with pre-screening
      const availablePrograms = [];

      for (const program of programs) {
        if (enrolled.includes(program)) {
          continue; // Skip already enrolled
        }

        // Pre-screen eligibility
        const preScreening = await this.preScreenProgram(program, profile);

        availablePrograms.push({
          program_type: program,
          name: this.getProgramName(program),
          description: this.getProgramDescription(program),
          likely_eligible: preScreening.likely_eligible,
          eligibility_hints: preScreening.hints,
          max_benefit: this.getMaxBenefit(program, profile),
          application_time: this.getApplicationTime(program),
          required_documents: this.getRequiredDocuments(program)
        });
      }

      res.json({
        enrolled_programs: enrolled,
        available_programs: availablePrograms.sort((a, b) =>
          b.likely_eligible - a.likely_eligible // Sort by likelihood
        )
      });

    } catch (error) {
      console.error('Available programs error:', error);
      res.status(500).json({ error: 'Failed to load available programs' });
    } finally {
      client.release();
    }
  }
);

// Start benefit application
router.post('/apply',
  verifyToken,
  [
    body('program_type').isIn(['SNAP', 'TANF', 'MEDICAID', 'WIC', 'VETERANS', 'SECTION_8',
      'LIHEAP', 'UI', 'SCHOOL_CHOICE_ESA', 'CHILD_CARE', 'TRANSPORTATION',
      'EMERGENCY_RENTAL', 'FREE_REDUCED_MEALS', 'EITC']),
    body('application_data').isObject()
  ],
  validateRequest,
  async (req, res) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const { program_type, application_data } = req.body;
      const userId = req.user.id;

      // Create application
      const applicationResult = await client.query(
        `INSERT INTO benefit_applications
         (user_id, program_type, application_data, status, created_at)
         VALUES ($1, $2, $3, 'IN_PROGRESS', NOW())
         RETURNING *`,
        [userId, program_type, application_data]
      );

      const application = applicationResult.rows[0];

      // Start eligibility verification
      const eligibilityResult = await BenefitEligibilityVerification.verifyComprehensive(
        userId,
        program_type,
        application_data
      );

      // Update application with verification result
      await client.query(
        `UPDATE benefit_applications
         SET eligibility_result = $1,
             status = $2,
             updated_at = NOW()
         WHERE id = $3`,
        [eligibilityResult,
         eligibilityResult.eligible ? 'PENDING_DOCUMENTS' : 'INELIGIBLE',
         application.id]
      );

      await client.query('COMMIT');

      res.json({
        application_id: application.id,
        status: application.status,
        eligibility: eligibilityResult,
        next_steps: this.getApplicationNextSteps(program_type, eligibilityResult.eligible)
      });

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Application error:', error);
      res.status(500).json({ error: 'Failed to submit application' });
    } finally {
      client.release();
    }
  }
);

// Upload documents for application
router.post('/upload-documents/:applicationId',
  verifyToken,
  [
    param('applicationId').isUUID(),
    body('documents').isArray(),
    body('documents.*.type').isString(),
    body('documents.*.url').isURL()
  ],
  validateRequest,
  async (req, res) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const { applicationId } = req.params;
      const { documents } = req.body;

      // Verify application ownership
      const appResult = await client.query(
        `SELECT * FROM benefit_applications
         WHERE id = $1 AND user_id = $2`,
        [applicationId, req.user.id]
      );

      if (appResult.rows.length === 0) {
        return res.status(404).json({ error: 'Application not found' });
      }

      // Store documents
      for (const doc of documents) {
        await client.query(
          `INSERT INTO application_documents
           (application_id, document_type, document_url, uploaded_at, verified)
           VALUES ($1, $2, $3, NOW(), false)`,
          [applicationId, doc.type, doc.url]
        );
      }

      // Update application status
      await client.query(
        `UPDATE benefit_applications
         SET status = 'PENDING_REVIEW',
             documents_submitted = true,
             updated_at = NOW()
         WHERE id = $1`,
        [applicationId]
      );

      await client.query('COMMIT');

      res.json({
        success: true,
        documents_uploaded: documents.length,
        application_status: 'PENDING_REVIEW'
      });

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Document upload error:', error);
      res.status(500).json({ error: 'Failed to upload documents' });
    } finally {
      client.release();
    }
  }
);

// Get application status
router.get('/application/:applicationId',
  verifyToken,
  [param('applicationId').isUUID()],
  validateRequest,
  async (req, res) => {
    const client = await pool.connect();
    try {
      const { applicationId } = req.params;

      const result = await client.query(
        `SELECT
          ba.*,
          COUNT(ad.id) as document_count,
          ARRAY_AGG(ad.document_type) as documents_submitted
         FROM benefit_applications ba
         LEFT JOIN application_documents ad ON ba.id = ad.application_id
         WHERE ba.id = $1 AND ba.user_id = $2
         GROUP BY ba.id`,
        [applicationId, req.user.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Application not found' });
      }

      const application = result.rows[0];

      // Get timeline
      const timeline = await client.query(
        `SELECT * FROM application_timeline
         WHERE application_id = $1
         ORDER BY occurred_at DESC`,
        [applicationId]
      );

      res.json({
        application,
        timeline: timeline.rows,
        estimated_completion: this.getEstimatedCompletion(application.program_type, application.status)
      });

    } catch (error) {
      console.error('Application status error:', error);
      res.status(500).json({ error: 'Failed to get application status' });
    } finally {
      client.release();
    }
  }
);

// Get benefit details
router.get('/benefit/:benefitId',
  verifyToken,
  [param('benefitId').isUUID()],
  validateRequest,
  async (req, res) => {
    const client = await pool.connect();
    try {
      const { benefitId } = req.params;

      // Get benefit with details
      const result = await client.query(
        `SELECT gb.*,
                COUNT(bt.id) as total_transactions,
                SUM(bt.amount) FILTER (WHERE bt.transaction_type = 'CREDIT') as total_received,
                SUM(bt.amount) FILTER (WHERE bt.transaction_type = 'DEBIT') as total_spent
         FROM government_benefits gb
         LEFT JOIN benefit_transactions bt ON gb.id = bt.benefit_id
         WHERE gb.id = $1 AND gb.user_id = $2
         GROUP BY gb.id`,
        [benefitId, req.user.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Benefit not found' });
      }

      const benefit = result.rows[0];

      // Get real-time balance
      const balance = await BenefitBalanceTracker.getBalance(benefitId, req.user.id);

      // Get spending breakdown
      const spending = await client.query(
        `SELECT
          merchant_info->>'category' as category,
          COUNT(*) as transaction_count,
          SUM(amount) as total_amount
         FROM benefit_transactions
         WHERE benefit_id = $1 AND transaction_type = 'DEBIT'
         GROUP BY merchant_info->>'category'
         ORDER BY total_amount DESC`,
        [benefitId]
      );

      res.json({
        benefit,
        balance,
        spending_breakdown: spending.rows,
        restrictions: this.getProgramRestrictions(benefit.program_type)
      });

    } catch (error) {
      console.error('Benefit details error:', error);
      res.status(500).json({ error: 'Failed to get benefit details' });
    } finally {
      client.release();
    }
  }
);

// Request emergency assistance
router.post('/emergency-assistance',
  verifyToken,
  [
    body('program_type').isIn(['SNAP', 'TANF', 'LIHEAP', 'EMERGENCY_RENTAL']),
    body('emergency_type').isIn(['NATURAL_DISASTER', 'MEDICAL_EMERGENCY',
      'HOMELESSNESS_PREVENTION', 'UTILITY_SHUTOFF', 'FOOD_INSECURITY']),
    body('amount_requested').isFloat({ min: 1, max: 5000 }),
    body('reason').isString().isLength({ min: 10, max: 500 })
  ],
  validateRequest,
  async (req, res) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const { program_type, emergency_type, amount_requested, reason } = req.body;
      const userId = req.user.id;

      // Check if user has active benefit
      const benefitResult = await client.query(
        `SELECT * FROM government_benefits
         WHERE user_id = $1 AND program_type = $2 AND status = 'ACTIVE'`,
        [userId, program_type]
      );

      if (benefitResult.rows.length === 0) {
        return res.status(400).json({
          error: 'No active benefit found for requested program'
        });
      }

      const benefit = benefitResult.rows[0];

      // Create emergency request
      const requestResult = await client.query(
        `INSERT INTO emergency_requests
         (benefit_id, user_id, emergency_type, requested_amount, reason,
          status, priority, created_at)
         VALUES ($1, $2, $3, $4, $5, 'PENDING', 'HIGH', NOW())
         RETURNING *`,
        [benefit.id, userId, emergency_type, amount_requested, reason]
      );

      const request = requestResult.rows[0];

      // Auto-approve small amounts for verified emergencies
      if (amount_requested <= 500 && this.isVerifiableEmergency(emergency_type)) {
        await client.query(
          `UPDATE emergency_requests
           SET status = 'APPROVED',
               approved_at = NOW(),
               approved_by = 'AUTO_APPROVAL'
           WHERE id = $1`,
          [request.id]
        );

        // Queue for immediate disbursement
        await client.query(
          `INSERT INTO disbursement_queue
           (request_id, benefit_id, amount, priority, queued_at)
           VALUES ($1, $2, $3, 'URGENT', NOW())`,
          [request.id, benefit.id, amount_requested]
        );
      }

      await client.query('COMMIT');

      res.json({
        request_id: request.id,
        status: request.status,
        estimated_processing: request.status === 'APPROVED' ?
          '1-2 hours' : '24-48 hours',
        tracking_number: `EMG-${request.id.substring(0, 8).toUpperCase()}`
      });

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Emergency assistance error:', error);
      res.status(500).json({ error: 'Failed to submit emergency request' });
    } finally {
      client.release();
    }
  }
);

// Get spending insights
router.get('/insights/:programType',
  verifyToken,
  [
    param('programType').isIn(['SNAP', 'TANF', 'WIC', 'ALL']),
    query('period').optional().isIn(['week', 'month', 'quarter', 'year'])
  ],
  validateRequest,
  async (req, res) => {
    const client = await pool.connect();
    try {
      const { programType } = req.params;
      const { period = 'month' } = req.query;
      const userId = req.user.id;

      // Determine date range
      const dateRange = this.getDateRange(period);

      // Build query
      let query = `
        SELECT
          DATE_TRUNC('day', bt.transaction_date) as date,
          gb.program_type,
          COUNT(*) as transaction_count,
          SUM(bt.amount) as total_spent,
          AVG(bt.amount) as avg_transaction,
          ARRAY_AGG(DISTINCT bt.merchant_info->>'category') as categories
        FROM benefit_transactions bt
        JOIN government_benefits gb ON bt.benefit_id = gb.id
        WHERE gb.user_id = $1
          AND bt.transaction_date >= $2
          AND bt.transaction_type = 'DEBIT'
      `;

      const params = [userId, dateRange.start];

      if (programType !== 'ALL') {
        query += ` AND gb.program_type = $3`;
        params.push(programType);
      }

      query += ` GROUP BY DATE_TRUNC('day', bt.transaction_date), gb.program_type
                 ORDER BY date DESC`;

      const spendingData = await client.query(query, params);

      // Get comparisons
      const comparison = await this.getSpendingComparison(userId, programType, period, client);

      // Get recommendations
      const recommendations = await this.getSpendingRecommendations(
        userId,
        programType,
        spendingData.rows,
        client
      );

      res.json({
        period: { start: dateRange.start, end: dateRange.end },
        spending_data: spendingData.rows,
        comparison,
        recommendations,
        savings_opportunities: this.identifySavings(spendingData.rows)
      });

    } catch (error) {
      console.error('Insights error:', error);
      res.status(500).json({ error: 'Failed to get insights' });
    } finally {
      client.release();
    }
  }
);

// Helper functions
router.preScreenProgram = async function(program, profile) {
  const hints = [];
  let likely_eligible = false;

  switch (program) {
    case 'SNAP':
      if (profile.household_income < 30000) {
        likely_eligible = true;
        hints.push('Income appears to qualify');
      }
      break;

    case 'WIC':
      if (profile.has_children && profile.children_under_5) {
        likely_eligible = true;
        hints.push('Has young children');
      }
      if (profile.is_pregnant) {
        likely_eligible = true;
        hints.push('Pregnant women qualify');
      }
      break;

    case 'VETERANS':
      if (profile.veteran_status) {
        likely_eligible = true;
        hints.push('Veteran status confirmed');
      }
      break;

    case 'UI':
      if (profile.employment_status === 'UNEMPLOYED') {
        likely_eligible = true;
        hints.push('Currently unemployed');
      }
      break;

    case 'SCHOOL_CHOICE_ESA':
      if (profile.school_age_children) {
        likely_eligible = true;
        hints.push('Has school-age children');
      }
      break;
  }

  return { likely_eligible, hints };
};

router.getProgramName = function(program) {
  const names = {
    SNAP: 'Food Assistance (SNAP)',
    TANF: 'Temporary Assistance (TANF)',
    MEDICAID: 'Medicaid Health Coverage',
    WIC: 'Women, Infants & Children (WIC)',
    VETERANS: 'Veterans Benefits',
    SECTION_8: 'Housing Assistance',
    LIHEAP: 'Energy Assistance',
    UI: 'Unemployment Insurance',
    SCHOOL_CHOICE_ESA: 'School Choice/ESA',
    CHILD_CARE: 'Child Care Assistance',
    TRANSPORTATION: 'Transportation Benefits',
    EMERGENCY_RENTAL: 'Emergency Rental Assistance',
    FREE_REDUCED_MEALS: 'Free/Reduced School Meals',
    EITC: 'Earned Income Tax Credit'
  };
  return names[program] || program;
};

router.getProgramDescription = function(program) {
  const descriptions = {
    SNAP: 'Monthly benefits for food and groceries',
    TANF: 'Temporary cash assistance for families',
    WIC: 'Nutrition assistance for women and young children',
    VETERANS: 'Benefits for military veterans and families',
    UI: 'Temporary income for unemployed workers',
    SCHOOL_CHOICE_ESA: 'Education savings accounts for school choice'
  };
  return descriptions[program] || 'Government assistance program';
};

router.getMaxBenefit = function(program, profile) {
  // Simplified calculation
  const household_size = profile.household_size || 1;
  const benefits = {
    SNAP: [291, 535, 766, 973, 1155, 1386, 1532, 1751],
    TANF: 500 + (household_size * 100),
    WIC: 47 * household_size,
    UI: 450 // Weekly
  };

  if (program === 'SNAP') {
    return benefits.SNAP[Math.min(household_size - 1, 7)];
  }

  return benefits[program] || 0;
};

router.getApplicationTime = function(program) {
  const times = {
    SNAP: '7-30 days',
    TANF: '30-45 days',
    WIC: '1-2 weeks',
    UI: '2-3 weeks',
    MEDICAID: '45-90 days',
    SECTION_8: '2-10 years (waitlist)'
  };
  return times[program] || '30-60 days';
};

router.getRequiredDocuments = function(program) {
  const base = ['Photo ID', 'Social Security Card', 'Proof of Income'];

  const specific = {
    SNAP: [...base, 'Utility Bills', 'Rent/Mortgage Statement'],
    WIC: [...base, 'Proof of Pregnancy/Birth Certificates'],
    VETERANS: ['DD-214', 'VA Enrollment', ...base],
    UI: [...base, 'Termination Letter', 'Work History'],
    SECTION_8: [...base, 'Rental History', 'Criminal Background Check']
  };

  return specific[program] || base;
};

router.getApplicationNextSteps = function(program, eligible) {
  if (!eligible) {
    return [
      'Review eligibility requirements',
      'Update household information if changed',
      'Consider other available programs',
      'Contact local assistance office for help'
    ];
  }

  return [
    'Upload required documents',
    'Complete identity verification',
    'Wait for application review',
    'Respond to any additional requests',
    'Receive decision notification'
  ];
};

router.getEstimatedCompletion = function(program, status) {
  const statusTimes = {
    'IN_PROGRESS': 'Incomplete',
    'PENDING_DOCUMENTS': '2-3 days after documents',
    'PENDING_REVIEW': '5-7 business days',
    'APPROVED': 'Complete',
    'DENIED': 'Complete',
    'INELIGIBLE': 'Complete'
  };

  return statusTimes[status] || 'Unknown';
};

router.getProgramRestrictions = function(program) {
  const BusinessRuleEngine = require('../services/businessRuleEngine');
  return BusinessRuleEngine.FEDERAL_PROGRAM_RULES[program] || {};
};

router.isVerifiableEmergency = function(type) {
  return ['NATURAL_DISASTER', 'UTILITY_SHUTOFF'].includes(type);
};

router.getDateRange = function(period) {
  const end = new Date();
  const start = new Date();

  switch (period) {
    case 'week':
      start.setDate(start.getDate() - 7);
      break;
    case 'month':
      start.setMonth(start.getMonth() - 1);
      break;
    case 'quarter':
      start.setMonth(start.getMonth() - 3);
      break;
    case 'year':
      start.setFullYear(start.getFullYear() - 1);
      break;
  }

  return { start, end };
};

router.getSpendingComparison = async function(userId, programType, period, client) {
  // Compare to previous period and peer average
  return {
    vs_previous_period: '+5%',
    vs_peer_average: '-10%',
    ranking: 'Below Average Spending'
  };
};

router.getSpendingRecommendations = async function(userId, programType, data, client) {
  const recommendations = [];

  // Analyze spending patterns
  const categories = data.flatMap(d => d.categories || []);
  const uniqueCategories = [...new Set(categories)];

  if (uniqueCategories.length < 3) {
    recommendations.push({
      type: 'DIVERSIFY',
      message: 'Consider shopping at different types of stores for better variety'
    });
  }

  // Check for optimal shopping times
  const morningTransactions = data.filter(d => {
    const hour = new Date(d.date).getHours();
    return hour >= 6 && hour <= 10;
  });

  if (morningTransactions.length < data.length * 0.2) {
    recommendations.push({
      type: 'TIMING',
      message: 'Shop in the morning for fresher produce and better selection'
    });
  }

  return recommendations;
};

router.identifySavings = function(data) {
  const opportunities = [];

  // Calculate average transaction size
  const avgSize = data.reduce((sum, d) => sum + d.avg_transaction, 0) / data.length;

  if (avgSize < 20) {
    opportunities.push({
      type: 'BULK_BUYING',
      potential_savings: '10-15%',
      message: 'Buying in bulk could reduce trips and save money'
    });
  }

  return opportunities;
};

module.exports = router;