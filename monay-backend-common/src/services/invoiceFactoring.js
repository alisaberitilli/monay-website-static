const EventEmitter = require('events');
const { Pool } = require('pg');
const crypto = require('crypto');

class InvoiceFactoringService extends EventEmitter {
  constructor() {
    super();
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL
    });
  }

  /**
   * Submit invoice for factoring
   */
  async submitInvoiceForFactoring(accountId, invoiceData) {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      // Verify account status and credit limit
      const accountQuery = `
        SELECT *
        FROM invoice_financing_accounts
        WHERE id = $1 AND status = 'active'
      `;
      const accountResult = await client.query(accountQuery, [accountId]);

      if (accountResult.rows.length === 0) {
        throw new Error('Account not found or inactive');
      }

      const account = accountResult.rows[0];

      // Check credit availability
      const availableCredit = parseFloat(account.available_credit);
      const requestedAmount = parseFloat(invoiceData.invoice_amount);
      const advanceRate = parseFloat(account.advance_rate) / 100;
      const advanceAmount = requestedAmount * advanceRate;

      if (advanceAmount > availableCredit) {
        throw new Error(`Insufficient credit. Available: ${availableCredit}, Requested: ${advanceAmount}`);
      }

      // Perform duplicate invoice check
      const duplicateCheck = await this.checkDuplicateInvoice(
        invoiceData.seller_business_id,
        invoiceData.invoice_number,
        client
      );

      if (duplicateCheck) {
        throw new Error('Duplicate invoice detected');
      }

      // Calculate financing terms
      const reserveAmount = requestedAmount * (parseFloat(account.reserve_percentage) / 100);
      const discountRate = parseFloat(account.discount_rate) / 100;
      const daysToPayment = Math.ceil((new Date(invoiceData.due_date) - new Date()) / (1000 * 60 * 60 * 24));
      const discountFee = advanceAmount * (discountRate / 365) * daysToPayment;

      // Create invoice record
      const invoiceQuery = `
        INSERT INTO financing_invoices (
          account_id, invoice_number, invoice_date, due_date,
          seller_business_id, buyer_business_id,
          seller_name, buyer_name,
          invoice_amount, tax_amount, discount_amount, net_amount,
          advance_amount, reserve_amount, discount_fee,
          financing_status, verification_status,
          invoice_document_url, purchase_order_url,
          supporting_documents
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
        RETURNING *
      `;

      const invoiceValues = [
        accountId,
        invoiceData.invoice_number,
        invoiceData.invoice_date,
        invoiceData.due_date,
        invoiceData.seller_business_id,
        invoiceData.buyer_business_id,
        invoiceData.seller_name,
        invoiceData.buyer_name,
        invoiceData.invoice_amount,
        invoiceData.tax_amount || 0,
        invoiceData.discount_amount || 0,
        invoiceData.net_amount || invoiceData.invoice_amount,
        advanceAmount.toFixed(2),
        reserveAmount.toFixed(2),
        discountFee.toFixed(2),
        'pending',
        'pending',
        invoiceData.invoice_document_url,
        invoiceData.purchase_order_url,
        JSON.stringify(invoiceData.supporting_documents || [])
      ];

      const invoiceResult = await client.query(invoiceQuery, invoiceValues);
      const invoice = invoiceResult.rows[0];

      // Start verification process
      await this.initiateVerification(invoice.id, client);

      // Perform risk assessment
      const riskScore = await this.assessInvoiceRisk(invoice.id, client);

      // Update invoice with risk score
      await client.query(
        'UPDATE financing_invoices SET risk_score = $1 WHERE id = $2',
        [riskScore, invoice.id]
      );

      await client.query('COMMIT');

      this.emit('invoiceSubmitted', {
        invoiceId: invoice.id,
        accountId,
        amount: requestedAmount,
        advanceAmount,
        status: 'pending'
      });

      return {
        success: true,
        invoiceId: invoice.id,
        financing: {
          invoiceAmount: requestedAmount,
          advanceAmount: advanceAmount.toFixed(2),
          reserveAmount: reserveAmount.toFixed(2),
          discountFee: discountFee.toFixed(2),
          netProceeds: (advanceAmount - discountFee).toFixed(2),
          daysToPayment,
          riskScore
        }
      };

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error submitting invoice for factoring:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Approve and fund invoice
   */
  async approveAndFundInvoice(invoiceId, approvalData) {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      // Get invoice details
      const invoiceQuery = `
        SELECT i.*, a.*
        FROM financing_invoices i
        JOIN invoice_financing_accounts a ON i.account_id = a.id
        WHERE i.id = $1 AND i.financing_status = 'pending'
      `;

      const invoiceResult = await client.query(invoiceQuery, [invoiceId]);

      if (invoiceResult.rows.length === 0) {
        throw new Error('Invoice not found or already processed');
      }

      const invoice = invoiceResult.rows[0];

      // Update invoice status
      await client.query(
        `UPDATE financing_invoices
         SET financing_status = 'approved',
             verification_status = 'verified',
             verification_date = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [invoiceId]
      );

      // Create advance transaction
      const advanceTransaction = {
        invoice_id: invoiceId,
        transaction_type: 'advance',
        amount: invoice.advance_amount,
        fee_amount: invoice.discount_fee,
        payment_method: 'ach',
        status: 'pending'
      };

      const transactionQuery = `
        INSERT INTO invoice_financing_transactions (
          invoice_id, transaction_type, amount, fee_amount,
          payment_method, status
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;

      const transactionValues = [
        advanceTransaction.invoice_id,
        advanceTransaction.transaction_type,
        advanceTransaction.amount,
        advanceTransaction.fee_amount,
        advanceTransaction.payment_method,
        advanceTransaction.status
      ];

      const transactionResult = await client.query(transactionQuery, transactionValues);

      // Update account credit utilization
      const newUtilization = parseFloat(invoice.current_exposure) + parseFloat(invoice.advance_amount);
      const newAvailable = parseFloat(invoice.credit_limit) - newUtilization;

      await client.query(
        `UPDATE invoice_financing_accounts
         SET current_exposure = $1, available_credit = $2
         WHERE id = $3`,
        [newUtilization, newAvailable, invoice.account_id]
      );

      // Process funding
      const fundingResult = await this.processFunding(
        transactionResult.rows[0].id,
        invoice.advance_amount,
        client
      );

      await client.query('COMMIT');

      this.emit('invoiceFunded', {
        invoiceId,
        amount: invoice.advance_amount,
        transactionId: transactionResult.rows[0].id
      });

      return {
        success: true,
        invoiceId,
        transactionId: transactionResult.rows[0].id,
        fundingDetails: fundingResult
      };

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error approving invoice:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Process invoice payment from buyer
   */
  async processInvoicePayment(invoiceId, paymentData) {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      // Get invoice details
      const invoice = await client.query(
        'SELECT * FROM financing_invoices WHERE id = $1',
        [invoiceId]
      );

      if (invoice.rows.length === 0) {
        throw new Error('Invoice not found');
      }

      const invoiceDetails = invoice.rows[0];
      const paymentAmount = parseFloat(paymentData.amount);

      // Record payment
      await client.query(
        `UPDATE financing_invoices
         SET payment_status = $1,
             payment_received_date = $2,
             payment_amount = $3
         WHERE id = $4`,
        ['paid', new Date(), paymentAmount, invoiceId]
      );

      // Create repayment transaction
      const repaymentQuery = `
        INSERT INTO invoice_financing_transactions (
          invoice_id, transaction_type, amount,
          payment_method, payment_reference, status
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;

      await client.query(repaymentQuery, [
        invoiceId,
        'repayment',
        paymentAmount,
        paymentData.payment_method || 'ach',
        paymentData.payment_reference,
        'completed'
      ]);

      // Release reserve if payment is complete
      if (paymentAmount >= parseFloat(invoiceDetails.invoice_amount)) {
        const reserveRelease = parseFloat(invoiceDetails.reserve_amount);

        await client.query(repaymentQuery, [
          invoiceId,
          'reserve_release',
          reserveRelease,
          'internal',
          `Reserve release for invoice ${invoiceDetails.invoice_number}`,
          'completed'
        ]);

        // Update account exposure
        const account = await client.query(
          'SELECT * FROM invoice_financing_accounts WHERE id = $1',
          [invoiceDetails.account_id]
        );

        const currentExposure = parseFloat(account.rows[0].current_exposure);
        const newExposure = Math.max(0, currentExposure - parseFloat(invoiceDetails.advance_amount));
        const newAvailable = parseFloat(account.rows[0].credit_limit) - newExposure;

        await client.query(
          `UPDATE invoice_financing_accounts
           SET current_exposure = $1, available_credit = $2
           WHERE id = $3`,
          [newExposure, newAvailable, invoiceDetails.account_id]
        );
      }

      // Update collection status
      await client.query(
        `UPDATE invoice_collections
         SET collection_status = 'paid',
             days_past_due = 0
         WHERE invoice_id = $1`,
        [invoiceId]
      );

      await client.query('COMMIT');

      this.emit('paymentReceived', {
        invoiceId,
        amount: paymentAmount,
        status: 'completed'
      });

      return {
        success: true,
        invoiceId,
        paymentAmount,
        reserveReleased: paymentAmount >= parseFloat(invoiceDetails.invoice_amount)
      };

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error processing payment:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Check for duplicate invoices
   */
  async checkDuplicateInvoice(sellerBusinessId, invoiceNumber, client) {
    const query = `
      SELECT id FROM financing_invoices
      WHERE seller_business_id = $1
      AND invoice_number = $2
      AND financing_status NOT IN ('declined', 'cancelled')
    `;

    const result = await client.query(query, [sellerBusinessId, invoiceNumber]);
    return result.rows.length > 0;
  }

  /**
   * Initiate invoice verification
   */
  async initiateVerification(invoiceId, client) {
    // Create verification record
    const verificationQuery = `
      INSERT INTO invoice_document_verification (
        invoice_id, document_type, verification_method,
        verification_status
      ) VALUES ($1, $2, $3, $4)
    `;

    // Verify invoice document
    await client.query(verificationQuery, [
      invoiceId,
      'invoice',
      'automated',
      'pending'
    ]);

    // Verify purchase order if exists
    await client.query(verificationQuery, [
      invoiceId,
      'purchase_order',
      'automated',
      'pending'
    ]);

    // Start async verification process
    this.performAutomatedVerification(invoiceId);
  }

  /**
   * Perform automated verification (async)
   */
  async performAutomatedVerification(invoiceId) {
    try {
      // Simulate OCR and validation
      await new Promise(resolve => setTimeout(resolve, 2000));

      const client = await this.pool.connect();

      try {
        // Update verification status
        await client.query(
          `UPDATE invoice_document_verification
           SET verification_status = 'verified',
               verification_date = CURRENT_TIMESTAMP,
               confidence_score = $1
           WHERE invoice_id = $2`,
          [0.95, invoiceId]
        );

        // Update invoice verification status
        await client.query(
          `UPDATE financing_invoices
           SET verification_status = 'verified',
               verification_date = CURRENT_TIMESTAMP,
               verification_score = $1
           WHERE id = $2`,
          [0.95, invoiceId]
        );

        this.emit('verificationComplete', {
          invoiceId,
          status: 'verified',
          confidence: 0.95
        });

      } finally {
        client.release();
      }

    } catch (error) {
      console.error('Verification error:', error);
      this.emit('verificationFailed', {
        invoiceId,
        error: error.message
      });
    }
  }

  /**
   * Assess invoice risk
   */
  async assessInvoiceRisk(invoiceId, client) {
    const invoice = await client.query(
      'SELECT * FROM financing_invoices WHERE id = $1',
      [invoiceId]
    );

    if (invoice.rows.length === 0) {
      throw new Error('Invoice not found');
    }

    const invoiceData = invoice.rows[0];

    // Calculate risk factors
    let riskScore = 50; // Base score

    // Days to payment risk
    const daysToPayment = Math.ceil(
      (new Date(invoiceData.due_date) - new Date()) / (1000 * 60 * 60 * 24)
    );

    if (daysToPayment > 90) riskScore += 15;
    else if (daysToPayment > 60) riskScore += 10;
    else if (daysToPayment > 30) riskScore += 5;

    // Amount risk
    const amount = parseFloat(invoiceData.invoice_amount);
    if (amount > 100000) riskScore += 10;
    else if (amount > 50000) riskScore += 5;

    // Buyer credit score risk (simulated)
    const buyerCreditScore = invoiceData.buyer_credit_score || 700;
    if (buyerCreditScore < 600) riskScore += 20;
    else if (buyerCreditScore < 650) riskScore += 10;
    else if (buyerCreditScore < 700) riskScore += 5;

    // Concentration risk
    const concentrationRisk = await this.calculateConcentrationRisk(
      invoiceData.account_id,
      invoiceData.buyer_business_id,
      client
    );
    riskScore += concentrationRisk;

    // Create risk assessment record
    const assessmentQuery = `
      INSERT INTO invoice_risk_assessments (
        invoice_id, assessment_date,
        overall_risk_score, buyer_risk_score,
        transaction_risk_score, days_beyond_terms,
        concentration_risk, recommendation
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `;

    const recommendation = riskScore < 60 ? 'approve' :
                          riskScore < 80 ? 'manual_review' : 'decline';

    await client.query(assessmentQuery, [
      invoiceId,
      new Date(),
      riskScore,
      buyerCreditScore < 650 ? 30 : 10,
      daysToPayment > 60 ? 20 : 5,
      0,
      concentrationRisk,
      recommendation
    ]);

    return riskScore;
  }

  /**
   * Calculate concentration risk
   */
  async calculateConcentrationRisk(accountId, buyerBusinessId, client) {
    const query = `
      SELECT COUNT(*) as invoice_count,
             SUM(invoice_amount) as total_amount
      FROM financing_invoices
      WHERE account_id = $1
      AND buyer_business_id = $2
      AND financing_status IN ('approved', 'funded')
    `;

    const result = await client.query(query, [accountId, buyerBusinessId]);

    const invoiceCount = parseInt(result.rows[0].invoice_count);
    const totalAmount = parseFloat(result.rows[0].total_amount || 0);

    // Calculate concentration score
    if (invoiceCount > 10 || totalAmount > 500000) return 15;
    if (invoiceCount > 5 || totalAmount > 250000) return 10;
    if (invoiceCount > 3 || totalAmount > 100000) return 5;

    return 0;
  }

  /**
   * Process funding disbursement
   */
  async processFunding(transactionId, amount, client) {
    // Update transaction status
    await client.query(
      `UPDATE invoice_financing_transactions
       SET status = 'processing',
           settlement_date = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [transactionId]
    );

    // Simulate ACH processing
    setTimeout(async () => {
      const updateClient = await this.pool.connect();
      try {
        await updateClient.query(
          `UPDATE invoice_financing_transactions
           SET status = 'completed'
           WHERE id = $1`,
          [transactionId]
        );

        this.emit('fundingComplete', {
          transactionId,
          amount
        });
      } finally {
        updateClient.release();
      }
    }, 5000);

    return {
      transactionId,
      amount,
      status: 'processing',
      estimatedSettlement: new Date(Date.now() + 5000)
    };
  }

  /**
   * Manage collections for overdue invoices
   */
  async manageCollections() {
    const client = await this.pool.connect();

    try {
      // Find overdue invoices
      const overdueQuery = `
        SELECT i.*, c.*
        FROM financing_invoices i
        LEFT JOIN invoice_collections c ON i.id = c.invoice_id
        WHERE i.payment_status != 'paid'
        AND i.due_date < CURRENT_DATE
        AND i.financing_status = 'funded'
      `;

      const overdueResult = await client.query(overdueQuery);

      for (const invoice of overdueResult.rows) {
        const daysPastDue = Math.ceil(
          (new Date() - new Date(invoice.due_date)) / (1000 * 60 * 60 * 24)
        );

        // Update or create collection record
        if (!invoice.collection_status) {
          // Create new collection record
          await client.query(
            `INSERT INTO invoice_collections (
              invoice_id, collection_status, days_past_due
            ) VALUES ($1, $2, $3)`,
            [invoice.id, 'overdue', daysPastDue]
          );
        } else {
          // Update existing record
          let newStatus = 'overdue';
          if (daysPastDue > 60) newStatus = 'in_collection';
          if (daysPastDue > 90) newStatus = 'legal_action';

          await client.query(
            `UPDATE invoice_collections
             SET collection_status = $1,
                 days_past_due = $2
             WHERE invoice_id = $3`,
            [newStatus, daysPastDue, invoice.id]
          );
        }

        // Send reminders based on days past due
        if (daysPastDue === 1 || daysPastDue === 7 || daysPastDue === 14 || daysPastDue === 30) {
          await this.sendCollectionReminder(invoice.id, daysPastDue);
        }
      }

      return {
        success: true,
        overdueCount: overdueResult.rows.length
      };

    } catch (error) {
      console.error('Collection management error:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Send collection reminder
   */
  async sendCollectionReminder(invoiceId, daysPastDue) {
    this.emit('collectionReminder', {
      invoiceId,
      daysPastDue,
      reminderType: daysPastDue === 1 ? 'friendly' :
                   daysPastDue <= 14 ? 'standard' :
                   'urgent'
    });
  }

  /**
   * Get account portfolio summary
   */
  async getPortfolioSummary(accountId) {
    const client = await this.pool.connect();

    try {
      const summaryQuery = `
        SELECT
          COUNT(*) as total_invoices,
          SUM(CASE WHEN financing_status = 'funded' THEN 1 ELSE 0 END) as funded_invoices,
          SUM(CASE WHEN payment_status = 'paid' THEN 1 ELSE 0 END) as paid_invoices,
          SUM(invoice_amount) as total_invoice_value,
          SUM(advance_amount) as total_advanced,
          SUM(discount_fee) as total_fees,
          AVG(risk_score) as average_risk_score,
          SUM(CASE WHEN payment_status = 'paid' THEN payment_amount ELSE 0 END) as total_collected
        FROM financing_invoices
        WHERE account_id = $1
      `;

      const result = await client.query(summaryQuery, [accountId]);

      // Get aging analysis
      const agingQuery = `
        SELECT
          SUM(CASE WHEN days_past_due = 0 THEN invoice_amount ELSE 0 END) as current,
          SUM(CASE WHEN days_past_due BETWEEN 1 AND 30 THEN invoice_amount ELSE 0 END) as past_due_30,
          SUM(CASE WHEN days_past_due BETWEEN 31 AND 60 THEN invoice_amount ELSE 0 END) as past_due_60,
          SUM(CASE WHEN days_past_due BETWEEN 61 AND 90 THEN invoice_amount ELSE 0 END) as past_due_90,
          SUM(CASE WHEN days_past_due > 90 THEN invoice_amount ELSE 0 END) as past_due_over_90
        FROM financing_invoices i
        LEFT JOIN invoice_collections c ON i.id = c.invoice_id
        WHERE i.account_id = $1
        AND i.payment_status != 'paid'
      `;

      const agingResult = await client.query(agingQuery, [accountId]);

      return {
        portfolio: result.rows[0],
        aging: agingResult.rows[0]
      };

    } catch (error) {
      console.error('Error getting portfolio summary:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Close database connection
   */
  async close() {
    await this.pool.end();
  }
}

module.exports = InvoiceFactoringService;