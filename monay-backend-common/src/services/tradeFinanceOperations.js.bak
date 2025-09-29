const EventEmitter = require('events');
const { Pool } = require('pg');
const crypto = require('crypto');

class TradeFinanceOperationsService extends EventEmitter {
  constructor() {
    super();
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL
    });

    // SWIFT message types for trade finance
    this.swiftMessages = {
      MT700: 'Issue Letter of Credit',
      MT701: 'Issue Amendment',
      MT707: 'Amendment to LC',
      MT710: 'Advice of Third Bank\'s LC',
      MT720: 'Transfer of LC',
      MT730: 'Acknowledgment',
      MT740: 'Authorization to Reimburse',
      MT742: 'Reimbursement Claim',
      MT750: 'Discrepancy Advice',
      MT752: 'Authorization to Pay',
      MT754: 'Advice of Payment',
      MT756: 'Advice of Reimbursement',
      MT799: 'Free Format Message'
    };

    // Incoterms 2020
    this.incoterms = {
      EXW: 'Ex Works',
      FCA: 'Free Carrier',
      FAS: 'Free Alongside Ship',
      FOB: 'Free on Board',
      CFR: 'Cost and Freight',
      CIF: 'Cost Insurance and Freight',
      CPT: 'Carriage Paid To',
      CIP: 'Carriage and Insurance Paid To',
      DAP: 'Delivered at Place',
      DPU: 'Delivered at Place Unloaded',
      DDP: 'Delivered Duty Paid'
    };
  }

  /**
   * Issue Letter of Credit
   */
  async issueLetterOfCredit(accountId, lcData) {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      // Verify account and credit limit
      const accountQuery = `
        SELECT * FROM invoice_financing_accounts
        WHERE id = $1 AND status = 'active'
      `;
      const accountResult = await client.query(accountQuery, [accountId]);

      if (accountResult.rows.length === 0) {
        throw new Error('Account not found or inactive');
      }

      const account = accountResult.rows[0];

      // Check credit availability
      const availableCredit = parseFloat(account.available_credit);
      const lcAmount = parseFloat(lcData.amount);

      if (lcAmount > availableCredit) {
        throw new Error(`Insufficient credit limit. Available: ${availableCredit}`);
      }

      // Generate LC number
      const lcNumber = this.generateLCNumber();

      // Calculate fees
      const fees = this.calculateLCFees(lcData);

      // Create LC transaction
      const lcQuery = `
        INSERT INTO trade_finance_transactions (
          account_id, transaction_type, transaction_number,
          applicant_id, beneficiary_id,
          advising_bank, confirming_bank,
          amount, currency, exchange_rate,
          lc_type, lc_terms, usance_days,
          partial_shipment_allowed, transshipment_allowed,
          commodity_description, hs_code,
          country_of_origin, destination_country,
          port_of_loading, port_of_discharge, incoterms,
          issue_date, expiry_date, shipment_date, presentation_deadline,
          required_documents, status,
          swift_message_type, swift_reference,
          issuance_fee, confirmation_fee
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32)
        RETURNING *
      `;

      const values = [
        accountId,
        'letter_of_credit',
        lcNumber,
        lcData.applicant_id,
        lcData.beneficiary_id,
        lcData.advising_bank,
        lcData.confirming_bank || null,
        lcAmount,
        lcData.currency || 'USD',
        lcData.exchange_rate || 1,
        lcData.lc_type || 'irrevocable',
        lcData.lc_terms || 'sight',
        lcData.usance_days || null,
        lcData.partial_shipment_allowed || false,
        lcData.transshipment_allowed || false,
        lcData.commodity_description,
        lcData.hs_code,
        lcData.country_of_origin,
        lcData.destination_country,
        lcData.port_of_loading,
        lcData.port_of_discharge,
        lcData.incoterms,
        lcData.issue_date || new Date(),
        lcData.expiry_date,
        lcData.shipment_date,
        lcData.presentation_deadline,
        JSON.stringify(lcData.required_documents || this.getStandardDocuments()),
        'draft',
        'MT700',
        this.generateSWIFTReference(),
        fees.issuance_fee,
        fees.confirmation_fee
      ];

      const lcResult = await client.query(lcQuery, values);
      const letterOfCredit = lcResult.rows[0];

      // Update account exposure
      const newExposure = parseFloat(account.current_exposure) + lcAmount;
      const newAvailable = parseFloat(account.credit_limit) - newExposure;

      await client.query(
        `UPDATE invoice_financing_accounts
         SET current_exposure = $1, available_credit = $2
         WHERE id = $3`,
        [newExposure, newAvailable, accountId]
      );

      // Generate SWIFT MT700 message
      const swiftMessage = await this.generateMT700(letterOfCredit);

      // Update LC status to issued
      await client.query(
        `UPDATE trade_finance_transactions
         SET status = 'issued',
             metadata = jsonb_set(metadata, '{swift_message}', $1::jsonb)
         WHERE id = $2`,
        [JSON.stringify(swiftMessage), letterOfCredit.id]
      );

      await client.query('COMMIT');

      this.emit('lcIssued', {
        lcId: letterOfCredit.id,
        lcNumber,
        amount: lcAmount,
        beneficiary: lcData.beneficiary_id
      });

      return {
        success: true,
        lcId: letterOfCredit.id,
        lcNumber,
        swiftMessage,
        fees
      };

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error issuing LC:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Process LC amendment
   */
  async amendLetterOfCredit(lcId, amendmentData) {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      // Get existing LC
      const lcQuery = `
        SELECT * FROM trade_finance_transactions
        WHERE id = $1 AND transaction_type = 'letter_of_credit'
      `;
      const lcResult = await client.query(lcQuery, [lcId]);

      if (lcResult.rows.length === 0) {
        throw new Error('Letter of Credit not found');
      }

      const originalLC = lcResult.rows[0];

      // Calculate amendment fee
      const amendmentFee = parseFloat(originalLC.amount) * 0.001; // 0.1% fee

      // Apply amendments
      const updateFields = [];
      const updateValues = [];
      let paramCount = 1;

      if (amendmentData.amount !== undefined) {
        updateFields.push(`amount = $${paramCount++}`);
        updateValues.push(amendmentData.amount);
      }

      if (amendmentData.expiry_date !== undefined) {
        updateFields.push(`expiry_date = $${paramCount++}`);
        updateValues.push(amendmentData.expiry_date);
      }

      if (amendmentData.shipment_date !== undefined) {
        updateFields.push(`shipment_date = $${paramCount++}`);
        updateValues.push(amendmentData.shipment_date);
      }

      if (amendmentData.partial_shipment_allowed !== undefined) {
        updateFields.push(`partial_shipment_allowed = $${paramCount++}`);
        updateValues.push(amendmentData.partial_shipment_allowed);
      }

      // Add amendment fee
      updateFields.push(`amendment_fee = COALESCE(amendment_fee, 0) + $${paramCount++}`);
      updateValues.push(amendmentFee);

      // Update metadata with amendment history
      updateFields.push(`metadata = jsonb_set(metadata, '{amendments}', COALESCE(metadata->'amendments', '[]'::jsonb) || $${paramCount++}::jsonb)`);
      updateValues.push(JSON.stringify([{
        date: new Date(),
        changes: amendmentData,
        fee: amendmentFee
      }]));

      updateValues.push(lcId);

      const updateQuery = `
        UPDATE trade_finance_transactions
        SET ${updateFields.join(', ')},
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $${paramCount}
        RETURNING *
      `;

      const updateResult = await client.query(updateQuery, updateValues);

      // Generate SWIFT MT707 amendment message
      const swiftMessage = await this.generateMT707(updateResult.rows[0], amendmentData);

      await client.query('COMMIT');

      this.emit('lcAmended', {
        lcId,
        amendments: amendmentData,
        fee: amendmentFee
      });

      return {
        success: true,
        lcId,
        swiftMessage,
        amendmentFee
      };

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error amending LC:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Present documents under LC
   */
  async presentDocuments(lcId, documents) {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      // Get LC details
      const lcResult = await client.query(
        'SELECT * FROM trade_finance_transactions WHERE id = $1',
        [lcId]
      );

      if (lcResult.rows.length === 0) {
        throw new Error('Letter of Credit not found');
      }

      const lc = lcResult.rows[0];

      // Check presentation deadline
      if (new Date() > new Date(lc.presentation_deadline)) {
        throw new Error('Presentation deadline has passed');
      }

      // Validate documents against requirements
      const requiredDocs = JSON.parse(lc.required_documents);
      const discrepancies = await this.checkDocumentDiscrepancies(documents, requiredDocs);

      // Update LC with submitted documents
      await client.query(
        `UPDATE trade_finance_transactions
         SET submitted_documents = $1,
             document_discrepancies = $2,
             status = $3
         WHERE id = $4`,
        [
          JSON.stringify(documents),
          JSON.stringify(discrepancies),
          discrepancies.length > 0 ? 'documents_presented_with_discrepancies' : 'documents_presented',
          lcId
        ]
      );

      // Create document verification records
      for (const doc of documents) {
        await client.query(
          `INSERT INTO invoice_document_verification (
            invoice_id, document_type, document_url,
            verification_method, verification_status,
            extracted_data, metadata
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            lcId,
            doc.type,
            doc.url,
            'manual',
            'pending',
            JSON.stringify(doc.data || {}),
            JSON.stringify({ lc_number: lc.transaction_number })
          ]
        );
      }

      // Generate SWIFT message based on discrepancies
      const swiftMessage = discrepancies.length > 0 ?
        await this.generateMT750(lc, discrepancies) : // Discrepancy advice
        await this.generateMT752(lc); // Authorization to pay

      await client.query('COMMIT');

      this.emit('documentsPresented', {
        lcId,
        documentCount: documents.length,
        discrepancyCount: discrepancies.length
      });

      return {
        success: true,
        lcId,
        discrepancies,
        swiftMessage,
        status: discrepancies.length > 0 ? 'discrepancies_found' : 'compliant'
      };

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error presenting documents:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Process payment under LC
   */
  async processLCPayment(lcId, paymentData) {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      // Get LC details
      const lcResult = await client.query(
        'SELECT * FROM trade_finance_transactions WHERE id = $1',
        [lcId]
      );

      if (lcResult.rows.length === 0) {
        throw new Error('Letter of Credit not found');
      }

      const lc = lcResult.rows[0];

      // Verify documents are compliant
      const discrepancies = JSON.parse(lc.document_discrepancies || '[]');
      if (discrepancies.length > 0 && !paymentData.waive_discrepancies) {
        throw new Error('Cannot process payment - document discrepancies exist');
      }

      // Calculate payment amount based on LC terms
      let paymentAmount = parseFloat(lc.amount);
      let paymentTerms = lc.lc_terms;

      if (paymentTerms === 'usance' && lc.usance_days) {
        // Deferred payment - calculate discounted amount
        const discountRate = 0.05; // 5% annual rate
        const discountDays = lc.usance_days;
        const discountAmount = paymentAmount * (discountRate / 365) * discountDays;
        paymentAmount = paymentAmount - discountAmount;
      }

      // Process payment
      await client.query(
        `UPDATE trade_finance_transactions
         SET status = 'payment_processed',
             metadata = jsonb_set(metadata, '{payment}', $1::jsonb)
         WHERE id = $2`,
        [
          JSON.stringify({
            amount: paymentAmount,
            date: new Date(),
            method: paymentData.payment_method || 'wire',
            reference: paymentData.reference
          }),
          lcId
        ]
      );

      // Update account exposure
      const accountResult = await client.query(
        'SELECT * FROM invoice_financing_accounts WHERE id = $1',
        [lc.account_id]
      );

      const account = accountResult.rows[0];
      const newExposure = Math.max(0, parseFloat(account.current_exposure) - parseFloat(lc.amount));
      const newAvailable = parseFloat(account.credit_limit) - newExposure;

      await client.query(
        `UPDATE invoice_financing_accounts
         SET current_exposure = $1, available_credit = $2
         WHERE id = $3`,
        [newExposure, newAvailable, lc.account_id]
      );

      // Generate SWIFT MT754 - Advice of Payment
      const swiftMessage = await this.generateMT754(lc, paymentAmount);

      await client.query('COMMIT');

      this.emit('lcPaymentProcessed', {
        lcId,
        amount: paymentAmount,
        status: 'completed'
      });

      return {
        success: true,
        lcId,
        paymentAmount,
        swiftMessage
      };

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error processing LC payment:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Issue Bank Guarantee
   */
  async issueBankGuarantee(accountId, guaranteeData) {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      // Generate guarantee number
      const guaranteeNumber = this.generateGuaranteeNumber();

      // Calculate fees
      const issuanceFee = parseFloat(guaranteeData.amount) * 0.02; // 2% fee

      // Create bank guarantee transaction
      const guaranteeQuery = `
        INSERT INTO trade_finance_transactions (
          account_id, transaction_type, transaction_number,
          applicant_id, beneficiary_id,
          amount, currency,
          commodity_description,
          issue_date, expiry_date,
          status, issuance_fee,
          metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING *
      `;

      const values = [
        accountId,
        'bank_guarantee',
        guaranteeNumber,
        guaranteeData.applicant_id,
        guaranteeData.beneficiary_id,
        guaranteeData.amount,
        guaranteeData.currency || 'USD',
        guaranteeData.purpose || 'Performance Guarantee',
        new Date(),
        guaranteeData.expiry_date,
        'issued',
        issuanceFee,
        JSON.stringify({
          guarantee_type: guaranteeData.type || 'performance',
          claim_conditions: guaranteeData.claim_conditions,
          governing_law: guaranteeData.governing_law || 'New York'
        })
      ];

      const result = await client.query(guaranteeQuery, values);

      await client.query('COMMIT');

      this.emit('bankGuaranteeIssued', {
        guaranteeId: result.rows[0].id,
        guaranteeNumber,
        amount: guaranteeData.amount
      });

      return {
        success: true,
        guaranteeId: result.rows[0].id,
        guaranteeNumber,
        issuanceFee
      };

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error issuing bank guarantee:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Process export financing
   */
  async processExportFinancing(accountId, exportData) {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      // Calculate financing amount (typically 80-90% of export value)
      const financingPercentage = 0.85;
      const financingAmount = parseFloat(exportData.contract_value) * financingPercentage;

      // Create export finance transaction
      const exportQuery = `
        INSERT INTO trade_finance_transactions (
          account_id, transaction_type, transaction_number,
          applicant_id, beneficiary_id,
          amount, currency,
          commodity_description, hs_code,
          country_of_origin, destination_country,
          port_of_loading, port_of_discharge,
          issue_date, expiry_date,
          status, metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        RETURNING *
      `;

      const values = [
        accountId,
        'export_finance',
        this.generateExportFinanceNumber(),
        exportData.exporter_id,
        exportData.importer_id,
        financingAmount,
        exportData.currency || 'USD',
        exportData.goods_description,
        exportData.hs_code,
        exportData.country_of_origin,
        exportData.destination_country,
        exportData.port_of_loading,
        exportData.port_of_discharge,
        new Date(),
        exportData.shipment_date,
        'approved',
        JSON.stringify({
          contract_value: exportData.contract_value,
          financing_percentage: financingPercentage * 100,
          export_credit_insurance: exportData.insurance_details || null
        })
      ];

      const result = await client.query(exportQuery, values);

      await client.query('COMMIT');

      this.emit('exportFinanceApproved', {
        financeId: result.rows[0].id,
        amount: financingAmount,
        contractValue: exportData.contract_value
      });

      return {
        success: true,
        financeId: result.rows[0].id,
        financingAmount,
        contractValue: exportData.contract_value
      };

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error processing export finance:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Generate LC number
   */
  generateLCNumber() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    return `LC${year}${month}${random}`;
  }

  /**
   * Generate bank guarantee number
   */
  generateGuaranteeNumber() {
    const date = new Date();
    const year = date.getFullYear();
    const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    return `BG${year}${random}`;
  }

  /**
   * Generate export finance number
   */
  generateExportFinanceNumber() {
    const date = new Date();
    const year = date.getFullYear();
    const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    return `EXP${year}${random}`;
  }

  /**
   * Generate SWIFT reference
   */
  generateSWIFTReference() {
    return crypto.randomBytes(8).toString('hex').toUpperCase();
  }

  /**
   * Calculate LC fees
   */
  calculateLCFees(lcData) {
    const amount = parseFloat(lcData.amount);
    const issuanceFee = amount * 0.0015; // 0.15% issuance fee
    const confirmationFee = lcData.confirming_bank ? amount * 0.001 : 0; // 0.1% if confirmed

    return {
      issuance_fee: issuanceFee.toFixed(2),
      confirmation_fee: confirmationFee.toFixed(2),
      total_fees: (issuanceFee + confirmationFee).toFixed(2)
    };
  }

  /**
   * Get standard required documents for LC
   */
  getStandardDocuments() {
    return [
      'Commercial Invoice',
      'Bill of Lading',
      'Packing List',
      'Certificate of Origin',
      'Insurance Certificate',
      'Inspection Certificate'
    ];
  }

  /**
   * Check document discrepancies
   */
  async checkDocumentDiscrepancies(submitted, required) {
    const discrepancies = [];

    // Check for missing documents
    for (const reqDoc of required) {
      const found = submitted.find(doc =>
        doc.type.toLowerCase().includes(reqDoc.toLowerCase())
      );
      if (!found) {
        discrepancies.push({
          type: 'missing_document',
          document: reqDoc,
          severity: 'high'
        });
      }
    }

    // Check for date discrepancies
    for (const doc of submitted) {
      if (doc.date && new Date(doc.date) > new Date()) {
        discrepancies.push({
          type: 'future_dated',
          document: doc.type,
          date: doc.date,
          severity: 'medium'
        });
      }
    }

    return discrepancies;
  }

  /**
   * Generate SWIFT MT700 message (Issue LC)
   */
  async generateMT700(lc) {
    return {
      message_type: 'MT700',
      sender: 'MONAYBANKXXX',
      receiver: lc.advising_bank,
      reference: lc.swift_reference,
      lc_number: lc.transaction_number,
      issue_date: lc.issue_date,
      applicant: lc.applicant_id,
      beneficiary: lc.beneficiary_id,
      amount: `${lc.currency} ${lc.amount}`,
      expiry: lc.expiry_date,
      terms: lc.lc_terms
    };
  }

  /**
   * Generate SWIFT MT707 message (Amendment)
   */
  async generateMT707(lc, amendments) {
    return {
      message_type: 'MT707',
      sender: 'MONAYBANKXXX',
      reference: this.generateSWIFTReference(),
      lc_number: lc.transaction_number,
      amendment_date: new Date(),
      amendments: amendments
    };
  }

  /**
   * Generate SWIFT MT750 message (Discrepancy Advice)
   */
  async generateMT750(lc, discrepancies) {
    return {
      message_type: 'MT750',
      sender: 'MONAYBANKXXX',
      reference: this.generateSWIFTReference(),
      lc_number: lc.transaction_number,
      discrepancies: discrepancies,
      action_required: 'Please advise acceptance or refusal of discrepancies'
    };
  }

  /**
   * Generate SWIFT MT752 message (Authorization to Pay)
   */
  async generateMT752(lc) {
    return {
      message_type: 'MT752',
      sender: 'MONAYBANKXXX',
      reference: this.generateSWIFTReference(),
      lc_number: lc.transaction_number,
      authorization: 'Documents found compliant. Authorized to pay.'
    };
  }

  /**
   * Generate SWIFT MT754 message (Advice of Payment)
   */
  async generateMT754(lc, amount) {
    return {
      message_type: 'MT754',
      sender: 'MONAYBANKXXX',
      reference: this.generateSWIFTReference(),
      lc_number: lc.transaction_number,
      payment_amount: `${lc.currency} ${amount}`,
      payment_date: new Date(),
      value_date: new Date()
    };
  }

  /**
   * Get trade finance portfolio summary
   */
  async getTradeFinancePortfolio(accountId) {
    const client = await this.pool.connect();

    try {
      const summaryQuery = `
        SELECT
          COUNT(*) as total_transactions,
          SUM(CASE WHEN transaction_type = 'letter_of_credit' THEN 1 ELSE 0 END) as lc_count,
          SUM(CASE WHEN transaction_type = 'bank_guarantee' THEN 1 ELSE 0 END) as guarantee_count,
          SUM(CASE WHEN transaction_type = 'export_finance' THEN 1 ELSE 0 END) as export_finance_count,
          SUM(amount) as total_exposure,
          SUM(issuance_fee + COALESCE(amendment_fee, 0) + COALESCE(negotiation_fee, 0)) as total_fees
        FROM trade_finance_transactions
        WHERE account_id = $1
      `;

      const result = await client.query(summaryQuery, [accountId]);

      return result.rows[0];

    } catch (error) {
      console.error('Error getting portfolio:', error);
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

export default TradeFinanceOperationsService;