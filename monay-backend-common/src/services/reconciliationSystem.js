import { Pool } from 'pg';
import crypto from 'crypto';
import Redis from 'redis';
import moment from 'moment';
import EventEmitter from 'events';

/**
 * Reconciliation System
 * Real-time and batch reconciliation for all payment transactions
 * Dispute management and chargeback handling
 */
class ReconciliationSystem extends EventEmitter {
  constructor() {
    super();
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgresql://localhost/monay'
    });

    this.redis = Redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });

    this.reconciliationStatus = {
      PENDING: 'pending',
      IN_PROGRESS: 'in_progress',
      MATCHED: 'matched',
      UNMATCHED: 'unmatched',
      DISPUTED: 'disputed',
      RESOLVED: 'resolved',
      FAILED: 'failed'
    };

    this.disputeStatus = {
      OPEN: 'open',
      INVESTIGATING: 'investigating',
      PENDING_EVIDENCE: 'pending_evidence',
      RESOLVED_MERCHANT_FAVOR: 'resolved_merchant_favor',
      RESOLVED_CUSTOMER_FAVOR: 'resolved_customer_favor',
      CLOSED: 'closed'
    };

    this.reconciliationQueue = [];
  }

  /**
   * Real-time transaction reconciliation
   */
  async reconcileTransaction(transaction) {
    const reconciliation = {
      reconciliation_id: crypto.randomUUID(),
      transaction_id: transaction.transaction_id,
      transaction_type: transaction.type,
      amount: transaction.amount,
      currency: transaction.currency || 'USD',
      payment_method: transaction.payment_method,
      status: this.reconciliationStatus.IN_PROGRESS,
      started_at: new Date()
    };

    try {
      // Match with external records
      const externalMatch = await this.matchWithExternalRecords(transaction);

      if (externalMatch.matched) {
        reconciliation.status = this.reconciliationStatus.MATCHED;
        reconciliation.external_reference = externalMatch.reference;
        reconciliation.matched_at = new Date();

        // Check for discrepancies
        const discrepancies = await this.checkDiscrepancies(transaction, externalMatch);

        if (discrepancies.found) {
          reconciliation.status = this.reconciliationStatus.DISPUTED;
          reconciliation.discrepancies = discrepancies.details;
          await this.createAutomaticDispute(transaction, discrepancies);
        }
      } else {
        reconciliation.status = this.reconciliationStatus.UNMATCHED;
        reconciliation.unmatched_reason = externalMatch.reason;

        // Queue for batch reconciliation
        this.reconciliationQueue.push(transaction);
      }

      // Store reconciliation record
      await this.storeReconciliationRecord(reconciliation);

      // Update transaction status
      await this.updateTransactionStatus(transaction.transaction_id, reconciliation.status);

      // Emit reconciliation event
      this.emit('reconciliationComplete', reconciliation);

      return reconciliation;
    } catch (error) {
      console.error('Reconciliation failed:', error);
      reconciliation.status = this.reconciliationStatus.FAILED;
      reconciliation.error = error.message;
      await this.storeReconciliationRecord(reconciliation);
      throw error;
    }
  }

  /**
   * Batch reconciliation process
   */
  async runBatchReconciliation(options = {}) {
    const batchJob = {
      batch_id: crypto.randomUUID(),
      start_date: options.start_date || moment().subtract(1, 'day').startOf('day').toDate(),
      end_date: options.end_date || moment().subtract(1, 'day').endOf('day').toDate(),
      status: 'running',
      started_at: new Date(),
      statistics: {
        total_transactions: 0,
        matched: 0,
        unmatched: 0,
        disputed: 0,
        errors: 0
      }
    };

    try {
      // Get all unreconciled transactions
      const transactions = await this.getUnreconciledTransactions(
        batchJob.start_date,
        batchJob.end_date
      );

      batchJob.statistics.total_transactions = transactions.length;

      // Process transactions in batches
      const batchSize = 100;
      for (let i = 0; i < transactions.length; i += batchSize) {
        const batch = transactions.slice(i, i + batchSize);

        const results = await Promise.allSettled(
          batch.map(tx => this.reconcileTransaction(tx))
        );

        // Update statistics
        results.forEach(result => {
          if (result.status === 'fulfilled') {
            const recon = result.value;
            if (recon.status === this.reconciliationStatus.MATCHED) {
              batchJob.statistics.matched++;
            } else if (recon.status === this.reconciliationStatus.UNMATCHED) {
              batchJob.statistics.unmatched++;
            } else if (recon.status === this.reconciliationStatus.DISPUTED) {
              batchJob.statistics.disputed++;
            }
          } else {
            batchJob.statistics.errors++;
          }
        });
      }

      // Generate reconciliation report
      const report = await this.generateReconciliationReport(batchJob);

      batchJob.status = 'completed';
      batchJob.completed_at = new Date();
      batchJob.report_id = report.report_id;

      // Store batch job results
      await this.storeBatchJobResults(batchJob);

      return batchJob;
    } catch (error) {
      console.error('Batch reconciliation failed:', error);
      batchJob.status = 'failed';
      batchJob.error = error.message;
      await this.storeBatchJobResults(batchJob);
      throw error;
    }
  }

  /**
   * Handle dispute creation
   */
  async createDispute(disputeData) {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      const dispute = {
        dispute_id: crypto.randomUUID(),
        transaction_id: disputeData.transaction_id,
        customer_id: disputeData.customer_id,
        merchant_id: disputeData.merchant_id,
        amount: disputeData.amount,
        reason: disputeData.reason,
        category: this.categorizeDispute(disputeData.reason),
        status: this.disputeStatus.OPEN,
        evidence: disputeData.evidence || [],
        created_at: new Date(),
        deadline: moment().add(10, 'days').toDate() // Standard 10-day response window
      };

      // Store dispute
      const disputeQuery = `
        INSERT INTO disputes (
          dispute_id, transaction_id, customer_id, merchant_id,
          amount, reason, category, status, evidence,
          created_at, deadline
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), $10)
        RETURNING *
      `;

      const disputeResult = await client.query(disputeQuery, [
        dispute.dispute_id,
        dispute.transaction_id,
        dispute.customer_id,
        dispute.merchant_id,
        dispute.amount,
        dispute.reason,
        dispute.category,
        dispute.status,
        JSON.stringify(dispute.evidence),
        dispute.deadline
      ]);

      // Create provisional credit if applicable
      if (this.shouldIssueProvisionalCredit(dispute)) {
        await this.issueProvisionalCredit(dispute, client);
      }

      // Notify relevant parties
      await this.notifyDisputeParties(dispute);

      // Start investigation workflow
      await this.startDisputeInvestigation(dispute, client);

      await client.query('COMMIT');

      return disputeResult.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Failed to create dispute:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Handle chargeback
   */
  async processChargeback(chargebackData) {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      const chargeback = {
        chargeback_id: crypto.randomUUID(),
        transaction_id: chargebackData.transaction_id,
        dispute_id: chargebackData.dispute_id,
        amount: chargebackData.amount,
        reason_code: chargebackData.reason_code,
        network: chargebackData.network, // Visa, Mastercard, etc.
        status: 'received',
        received_date: new Date(),
        response_deadline: moment().add(7, 'days').toDate()
      };

      // Store chargeback
      const chargebackQuery = `
        INSERT INTO chargebacks (
          chargeback_id, transaction_id, dispute_id, amount,
          reason_code, network, status, received_date,
          response_deadline
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), $8)
        RETURNING *
      `;

      const chargebackResult = await client.query(chargebackQuery, [
        chargeback.chargeback_id,
        chargeback.transaction_id,
        chargeback.dispute_id,
        chargeback.amount,
        chargeback.reason_code,
        chargeback.network,
        chargeback.status,
        chargeback.response_deadline
      ]);

      // Debit merchant account
      await this.debitMerchantAccount(chargebackData.merchant_id, chargeback.amount, client);

      // Update dispute status
      await client.query(
        `UPDATE disputes SET status = $1, chargeback_id = $2 WHERE dispute_id = $3`,
        ['chargeback_received', chargeback.chargeback_id, chargebackData.dispute_id]
      );

      // Check for representment opportunity
      const representmentDecision = await this.evaluateRepresentment(chargeback);

      if (representmentDecision.should_represent) {
        await this.initiateRepresentment(chargeback, representmentDecision.evidence, client);
      }

      await client.query('COMMIT');

      return chargebackResult.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Failed to process chargeback:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Generate daily settlement report
   */
  async generateSettlementReport(date = null) {
    const settlementDate = date || moment().subtract(1, 'day').format('YYYY-MM-DD');

    const report = {
      report_id: crypto.randomUUID(),
      settlement_date: settlementDate,
      generated_at: new Date(),
      summary: {},
      details: [],
      reconciliation_status: {}
    };

    try {
      // Get all transactions for the settlement date
      const transactionsQuery = `
        SELECT
          t.*,
          r.status as reconciliation_status,
          r.external_reference
        FROM transactions t
        LEFT JOIN reconciliations r ON t.transaction_id = r.transaction_id
        WHERE DATE(t.created_at) = $1
        ORDER BY t.created_at
      `;

      const transactions = await this.pool.query(transactionsQuery, [settlementDate]);

      // Calculate summary
      report.summary = {
        total_transactions: transactions.rows.length,
        total_amount: transactions.rows.reduce((sum, tx) => sum + parseFloat(tx.amount), 0),
        by_payment_method: this.groupByPaymentMethod(transactions.rows),
        by_status: this.groupByStatus(transactions.rows),
        by_currency: this.groupByCurrency(transactions.rows)
      };

      // Group by payment rail
      const paymentRails = ['ACH', 'Wire', 'FedNow', 'RTP', 'Card'];

      for (const rail of paymentRails) {
        const railTransactions = transactions.rows.filter(tx => tx.payment_method === rail);

        report.details.push({
          payment_rail: rail,
          transaction_count: railTransactions.length,
          total_amount: railTransactions.reduce((sum, tx) => sum + parseFloat(tx.amount), 0),
          reconciled: railTransactions.filter(tx => tx.reconciliation_status === 'matched').length,
          unreconciled: railTransactions.filter(tx => !tx.reconciliation_status || tx.reconciliation_status === 'unmatched').length,
          disputed: railTransactions.filter(tx => tx.reconciliation_status === 'disputed').length
        });
      }

      // Check reconciliation completeness
      report.reconciliation_status = {
        fully_reconciled: transactions.rows.every(tx => tx.reconciliation_status === 'matched'),
        reconciliation_rate: (transactions.rows.filter(tx => tx.reconciliation_status === 'matched').length / transactions.rows.length) * 100,
        unmatched_transactions: transactions.rows.filter(tx => !tx.reconciliation_status || tx.reconciliation_status === 'unmatched').length,
        disputed_amount: transactions.rows
          .filter(tx => tx.reconciliation_status === 'disputed')
          .reduce((sum, tx) => sum + parseFloat(tx.amount), 0)
      };

      // Store report
      await this.storeSettlementReport(report);

      return report;
    } catch (error) {
      console.error('Failed to generate settlement report:', error);
      throw error;
    }
  }

  /**
   * Generate financial statements
   */
  async generateFinancialStatements(period) {
    const statements = {
      statement_id: crypto.randomUUID(),
      period: period,
      generated_at: new Date(),
      income_statement: {},
      cash_flow: {},
      balance_sheet_impact: {}
    };

    try {
      // Income Statement components
      const revenueQuery = `
        SELECT
          SUM(CASE WHEN type = 'fee' THEN amount ELSE 0 END) as fee_revenue,
          SUM(CASE WHEN type = 'interchange' THEN amount ELSE 0 END) as interchange_revenue,
          SUM(CASE WHEN type = 'subscription' THEN amount ELSE 0 END) as subscription_revenue
        FROM revenue_transactions
        WHERE created_at >= $1 AND created_at < $2
      `;

      const revenue = await this.pool.query(revenueQuery, [period.start, period.end]);

      statements.income_statement = {
        revenue: {
          transaction_fees: revenue.rows[0].fee_revenue || 0,
          interchange: revenue.rows[0].interchange_revenue || 0,
          subscriptions: revenue.rows[0].subscription_revenue || 0,
          total: Object.values(revenue.rows[0]).reduce((sum, val) => sum + (val || 0), 0)
        },
        expenses: await this.calculateExpenses(period),
        net_income: 0 // Will calculate after expenses
      };

      statements.income_statement.net_income =
        statements.income_statement.revenue.total -
        statements.income_statement.expenses.total;

      // Cash Flow components
      const cashFlowQuery = `
        SELECT
          SUM(CASE WHEN direction = 'inflow' THEN amount ELSE 0 END) as inflows,
          SUM(CASE WHEN direction = 'outflow' THEN amount ELSE 0 END) as outflows
        FROM cash_movements
        WHERE created_at >= $1 AND created_at < $2
      `;

      const cashFlow = await this.pool.query(cashFlowQuery, [period.start, period.end]);

      statements.cash_flow = {
        operating_activities: {
          cash_from_customers: cashFlow.rows[0].inflows || 0,
          cash_to_vendors: cashFlow.rows[0].outflows || 0,
          net_cash_from_operations: (cashFlow.rows[0].inflows || 0) - (cashFlow.rows[0].outflows || 0)
        },
        financing_activities: await this.getFinancingActivities(period),
        investing_activities: await this.getInvestingActivities(period)
      };

      // Balance Sheet Impact
      statements.balance_sheet_impact = {
        assets: {
          cash_increase: statements.cash_flow.operating_activities.net_cash_from_operations,
          accounts_receivable: await this.getAccountsReceivable(period.end),
          prepaid_cards_liability: await this.getPrepaidLiability(period.end)
        },
        liabilities: {
          accounts_payable: await this.getAccountsPayable(period.end),
          unearned_revenue: await this.getUnearnedRevenue(period.end)
        }
      };

      // Store statements
      await this.storeFinancialStatements(statements);

      return statements;
    } catch (error) {
      console.error('Failed to generate financial statements:', error);
      throw error;
    }
  }

  /**
   * Dispute evidence management
   */
  async submitDisputeEvidence(disputeId, evidence) {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      // Get dispute
      const disputeResult = await client.query(
        'SELECT * FROM disputes WHERE dispute_id = $1',
        [disputeId]
      );

      if (disputeResult.rows.length === 0) {
        throw new Error('Dispute not found');
      }

      const dispute = disputeResult.rows[0];

      // Store evidence
      const evidenceQuery = `
        INSERT INTO dispute_evidence (
          evidence_id, dispute_id, type, description,
          file_url, submitted_by, submitted_at
        ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
        RETURNING *
      `;

      const evidenceRecords = [];

      for (const item of evidence) {
        const result = await client.query(evidenceQuery, [
          crypto.randomUUID(),
          disputeId,
          item.type,
          item.description,
          item.file_url,
          item.submitted_by
        ]);
        evidenceRecords.push(result.rows[0]);
      }

      // Update dispute status
      await client.query(
        `UPDATE disputes
         SET status = $1, evidence = evidence || $2, updated_at = NOW()
         WHERE dispute_id = $3`,
        [
          this.disputeStatus.INVESTIGATING,
          JSON.stringify(evidenceRecords),
          disputeId
        ]
      );

      // Evaluate evidence strength
      const evaluation = await this.evaluateEvidence(dispute, evidenceRecords);

      await client.query('COMMIT');

      return {
        dispute_id: disputeId,
        evidence_submitted: evidenceRecords.length,
        evaluation: evaluation
      };
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Failed to submit dispute evidence:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Helper: Match with external records
   */
  async matchWithExternalRecords(transaction) {
    // Simulate matching with bank/processor records
    // In production, would call external APIs

    // Check payment processor records
    const processorMatch = await this.checkProcessorRecords(transaction);
    if (processorMatch) {
      return {
        matched: true,
        reference: processorMatch.reference,
        source: 'processor'
      };
    }

    // Check bank statements
    const bankMatch = await this.checkBankRecords(transaction);
    if (bankMatch) {
      return {
        matched: true,
        reference: bankMatch.reference,
        source: 'bank'
      };
    }

    return {
      matched: false,
      reason: 'No matching external record found'
    };
  }

  /**
   * Helper: Check for discrepancies
   */
  async checkDiscrepancies(transaction, externalMatch) {
    const discrepancies = {
      found: false,
      details: []
    };

    // Check amount
    if (Math.abs(transaction.amount - externalMatch.amount) > 0.01) {
      discrepancies.found = true;
      discrepancies.details.push({
        field: 'amount',
        internal: transaction.amount,
        external: externalMatch.amount,
        difference: transaction.amount - externalMatch.amount
      });
    }

    // Check date
    const dateDiff = Math.abs(
      moment(transaction.created_at).diff(moment(externalMatch.date), 'days')
    );
    if (dateDiff > 1) {
      discrepancies.found = true;
      discrepancies.details.push({
        field: 'date',
        internal: transaction.created_at,
        external: externalMatch.date,
        difference: `${dateDiff} days`
      });
    }

    return discrepancies;
  }

  /**
   * Helper: Create automatic dispute for discrepancies
   */
  async createAutomaticDispute(transaction, discrepancies) {
    const disputeData = {
      transaction_id: transaction.transaction_id,
      customer_id: transaction.customer_id,
      merchant_id: transaction.merchant_id,
      amount: Math.abs(discrepancies.details.find(d => d.field === 'amount')?.difference || 0),
      reason: `Automatic dispute: ${discrepancies.details.map(d => d.field).join(', ')} mismatch`,
      evidence: discrepancies.details
    };

    return this.createDispute(disputeData);
  }

  /**
   * Helper: Store reconciliation record
   */
  async storeReconciliationRecord(reconciliation) {
    const query = `
      INSERT INTO reconciliations (
        reconciliation_id, transaction_id, transaction_type,
        amount, currency, payment_method, status,
        external_reference, discrepancies, started_at,
        matched_at, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
      ON CONFLICT (transaction_id) DO UPDATE
      SET status = $7, external_reference = $8, discrepancies = $9,
          matched_at = $11, updated_at = NOW()
    `;

    await this.pool.query(query, [
      reconciliation.reconciliation_id,
      reconciliation.transaction_id,
      reconciliation.transaction_type,
      reconciliation.amount,
      reconciliation.currency,
      reconciliation.payment_method,
      reconciliation.status,
      reconciliation.external_reference,
      JSON.stringify(reconciliation.discrepancies),
      reconciliation.started_at,
      reconciliation.matched_at
    ]);
  }

  /**
   * Helper: Update transaction status
   */
  async updateTransactionStatus(transactionId, reconciliationStatus) {
    await this.pool.query(
      `UPDATE transactions
       SET reconciliation_status = $1, updated_at = NOW()
       WHERE transaction_id = $2`,
      [reconciliationStatus, transactionId]
    );
  }

  /**
   * Helper: Get unreconciled transactions
   */
  async getUnreconciledTransactions(startDate, endDate) {
    const query = `
      SELECT t.*
      FROM transactions t
      LEFT JOIN reconciliations r ON t.transaction_id = r.transaction_id
      WHERE t.created_at >= $1 AND t.created_at <= $2
      AND (r.status IS NULL OR r.status IN ('unmatched', 'failed'))
      ORDER BY t.created_at
    `;

    const result = await this.pool.query(query, [startDate, endDate]);
    return result.rows;
  }

  /**
   * Helper: Categorize dispute
   */
  categorizeDispute(reason) {
    const categories = {
      'fraud': ['unauthorized', 'stolen card', 'identity theft'],
      'quality': ['defective', 'not as described', 'damaged'],
      'non_receipt': ['not received', 'not delivered', 'missing'],
      'duplicate': ['charged twice', 'duplicate charge'],
      'other': []
    };

    const lowerReason = reason.toLowerCase();

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => lowerReason.includes(keyword))) {
        return category;
      }
    }

    return 'other';
  }

  /**
   * Helper: Should issue provisional credit
   */
  shouldIssueProvisionalCredit(dispute) {
    // Regulation E requires provisional credit for certain disputes
    return dispute.category === 'fraud' ||
           dispute.amount < 500 ||
           dispute.category === 'unauthorized';
  }

  /**
   * Helper: Issue provisional credit
   */
  async issueProvisionalCredit(dispute, client) {
    const creditQuery = `
      INSERT INTO provisional_credits (
        credit_id, dispute_id, customer_id, amount,
        status, issued_at
      ) VALUES ($1, $2, $3, $4, 'issued', NOW())
    `;

    await client.query(creditQuery, [
      crypto.randomUUID(),
      dispute.dispute_id,
      dispute.customer_id,
      dispute.amount
    ]);

    // Credit customer account
    await client.query(
      `UPDATE wallets
       SET balance = balance + $1
       WHERE customer_id = $2`,
      [dispute.amount, dispute.customer_id]
    );
  }

  /**
   * Helper: Store batch job results
   */
  async storeBatchJobResults(batchJob) {
    const query = `
      INSERT INTO reconciliation_batch_jobs (
        batch_id, start_date, end_date, status,
        statistics, started_at, completed_at,
        report_id, error
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `;

    await this.pool.query(query, [
      batchJob.batch_id,
      batchJob.start_date,
      batchJob.end_date,
      batchJob.status,
      JSON.stringify(batchJob.statistics),
      batchJob.started_at,
      batchJob.completed_at,
      batchJob.report_id,
      batchJob.error
    ]);
  }

  // Stub methods for external integrations
  async checkProcessorRecords(transaction) {
    // Simulate processor check
    if (Math.random() > 0.1) {
      return {
        reference: `PROC${transaction.transaction_id.substring(0, 8)}`,
        amount: transaction.amount,
        date: transaction.created_at
      };
    }
    return null;
  }

  async checkBankRecords(transaction) {
    // Simulate bank check
    if (Math.random() > 0.2) {
      return {
        reference: `BANK${transaction.transaction_id.substring(0, 8)}`,
        amount: transaction.amount,
        date: transaction.created_at
      };
    }
    return null;
  }

  async notifyDisputeParties(dispute) {
    console.log(`Notifying parties about dispute ${dispute.dispute_id}`);
  }

  async startDisputeInvestigation(dispute, client) {
    console.log(`Starting investigation for dispute ${dispute.dispute_id}`);
  }

  async debitMerchantAccount(merchantId, amount, client) {
    console.log(`Debiting merchant ${merchantId} for ${amount}`);
  }

  async evaluateRepresentment(chargeback) {
    // Simple evaluation logic
    return {
      should_represent: Math.random() > 0.5,
      evidence: []
    };
  }

  async initiateRepresentment(chargeback, evidence, client) {
    console.log(`Initiating representment for chargeback ${chargeback.chargeback_id}`);
  }

  async evaluateEvidence(dispute, evidence) {
    return {
      strength: 'strong',
      recommendation: 'fight_dispute'
    };
  }

  async generateReconciliationReport(batchJob) {
    return { report_id: crypto.randomUUID() };
  }

  async storeSettlementReport(report) {
    console.log(`Storing settlement report ${report.report_id}`);
  }

  async storeFinancialStatements(statements) {
    console.log(`Storing financial statements ${statements.statement_id}`);
  }

  async calculateExpenses(period) {
    return { total: 10000 }; // Placeholder
  }

  async getFinancingActivities(period) {
    return { total: 0 };
  }

  async getInvestingActivities(period) {
    return { total: 0 };
  }

  async getAccountsReceivable(date) {
    return 50000; // Placeholder
  }

  async getPrepaidLiability(date) {
    return 100000; // Placeholder
  }

  async getAccountsPayable(date) {
    return 25000; // Placeholder
  }

  async getUnearnedRevenue(date) {
    return 15000; // Placeholder
  }

  groupByPaymentMethod(transactions) {
    const groups = {};
    transactions.forEach(tx => {
      groups[tx.payment_method] = (groups[tx.payment_method] || 0) + 1;
    });
    return groups;
  }

  groupByStatus(transactions) {
    const groups = {};
    transactions.forEach(tx => {
      groups[tx.status] = (groups[tx.status] || 0) + 1;
    });
    return groups;
  }

  groupByCurrency(transactions) {
    const groups = {};
    transactions.forEach(tx => {
      const currency = tx.currency || 'USD';
      groups[currency] = (groups[currency] || 0) + parseFloat(tx.amount);
    });
    return groups;
  }
}

export default ReconciliationSystem;