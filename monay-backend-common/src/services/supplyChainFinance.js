import EventEmitter from 'events';
import { Pool } from 'pg';
import crypto from 'crypto';

class SupplyChainFinanceService extends EventEmitter {
  constructor() {
    super();
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL
    });

    // Program types
    this.programTypes = {
      DYNAMIC_DISCOUNTING: 'dynamic_discounting',
      REVERSE_FACTORING: 'reverse_factoring',
      PAYABLES_FINANCE: 'payables_finance',
      RECEIVABLES_PURCHASE: 'receivables_purchase',
      INVENTORY_FINANCE: 'inventory_finance'
    };

    // Supplier risk categories
    this.riskCategories = {
      LOW: { min_score: 80, advance_rate: 95, discount_rate: 3 },
      MEDIUM: { min_score: 60, advance_rate: 85, discount_rate: 5 },
      HIGH: { min_score: 40, advance_rate: 75, discount_rate: 8 },
      VERY_HIGH: { min_score: 0, advance_rate: 60, discount_rate: 12 }
    };
  }

  /**
   * Create supply chain finance program
   */
  async createProgram(anchorBuyerId, programData) {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      // Verify anchor buyer
      const buyerQuery = `
        SELECT * FROM businesses
        WHERE id = $1 AND status = 'active'
      `;
      const buyerResult = await client.query(buyerQuery, [anchorBuyerId]);

      if (buyerResult.rows.length === 0) {
        throw new Error('Anchor buyer not found or inactive');
      }

      // Calculate program parameters based on buyer credit
      const programParams = this.calculateProgramParameters(
        buyerResult.rows[0],
        programData
      );

      // Create program
      const programQuery = `
        INSERT INTO supply_chain_programs (
          program_name, anchor_buyer_id, program_type,
          credit_limit, available_amount,
          base_rate, margin, early_payment_discount,
          standard_payment_terms, extended_payment_terms,
          supplier_onboarding_required, auto_approval_threshold,
          status, start_date, end_date,
          metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        RETURNING *
      `;

      const values = [
        programData.program_name,
        anchorBuyerId,
        programData.program_type || this.programTypes.REVERSE_FACTORING,
        programData.credit_limit,
        programData.credit_limit, // Initially all available
        programParams.base_rate,
        programParams.margin,
        programParams.early_payment_discount,
        programData.standard_payment_terms || 30,
        programData.extended_payment_terms || 90,
        programData.supplier_onboarding_required !== false,
        programData.auto_approval_threshold || 10000,
        'active',
        programData.start_date || new Date(),
        programData.end_date,
        JSON.stringify({
          buyer_details: buyerResult.rows[0],
          program_rules: programData.rules || {},
          approved_currencies: programData.currencies || ['USD'],
          notification_settings: programData.notifications || {}
        })
      ];

      const programResult = await client.query(programQuery, values);
      const program = programResult.rows[0];

      // Pre-approve suppliers if provided
      if (programData.approved_suppliers && programData.approved_suppliers.length > 0) {
        for (const supplierId of programData.approved_suppliers) {
          await this.enrollSupplier(program.id, supplierId, client);
        }
      }

      await client.query('COMMIT');

      this.emit('programCreated', {
        programId: program.id,
        anchorBuyer: anchorBuyerId,
        creditLimit: program.credit_limit
      });

      return {
        success: true,
        programId: program.id,
        program
      };

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error creating program:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Enroll supplier in program
   */
  async enrollSupplier(programId, supplierBusinessId, client = null) {
    const shouldRelease = !client;
    if (!client) {
      client = await this.pool.connect();
    }

    try {
      if (shouldRelease) await client.query('BEGIN');

      // Get program details
      const programQuery = `
        SELECT * FROM supply_chain_programs
        WHERE id = $1 AND status = 'active'
      `;
      const programResult = await client.query(programQuery, [programId]);

      if (programResult.rows.length === 0) {
        throw new Error('Program not found or inactive');
      }

      const program = programResult.rows[0];

      // Verify supplier
      const supplierQuery = `
        SELECT * FROM businesses
        WHERE id = $1
      `;
      const supplierResult = await client.query(supplierQuery, [supplierBusinessId]);

      if (supplierResult.rows.length === 0) {
        throw new Error('Supplier not found');
      }

      const supplier = supplierResult.rows[0];

      // Calculate supplier-specific terms
      const supplierTerms = await this.calculateSupplierTerms(
        supplier,
        program
      );

      // Create enrollment record
      const enrollmentQuery = `
        INSERT INTO supply_chain_suppliers (
          program_id, supplier_business_id,
          enrollment_status, enrollment_date,
          credit_limit, available_credit,
          credit_rating, advance_rate, discount_rate,
          payment_terms, kyc_status, aml_status,
          metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        ON CONFLICT (program_id, supplier_business_id)
        DO UPDATE SET
          enrollment_status = $3,
          enrollment_date = $4,
          updated_at = CURRENT_TIMESTAMP
        RETURNING *
      `;

      const enrollmentValues = [
        programId,
        supplierBusinessId,
        'active',
        new Date(),
        supplierTerms.credit_limit,
        supplierTerms.credit_limit,
        supplierTerms.credit_rating,
        supplierTerms.advance_rate,
        supplierTerms.discount_rate,
        supplierTerms.payment_terms,
        'pending',
        'pending',
        JSON.stringify({
          supplier_details: supplier,
          risk_assessment: supplierTerms.risk_assessment
        })
      ];

      const enrollmentResult = await client.query(enrollmentQuery, enrollmentValues);

      // Update program with supplier
      const currentSuppliers = JSON.parse(program.approved_suppliers || '[]');
      if (!currentSuppliers.includes(supplierBusinessId)) {
        currentSuppliers.push(supplierBusinessId);
        await client.query(
          `UPDATE supply_chain_programs
           SET approved_suppliers = $1
           WHERE id = $2`,
          [JSON.stringify(currentSuppliers), programId]
        );
      }

      if (shouldRelease) await client.query('COMMIT');

      this.emit('supplierEnrolled', {
        programId,
        supplierId: supplierBusinessId,
        terms: supplierTerms
      });

      return {
        success: true,
        enrollment: enrollmentResult.rows[0]
      };

    } catch (error) {
      if (shouldRelease) await client.query('ROLLBACK');
      console.error('Error enrolling supplier:', error);
      throw error;
    } finally {
      if (shouldRelease) client.release();
    }
  }

  /**
   * Submit invoice for supply chain financing
   */
  async submitInvoiceForFinancing(programId, invoiceData) {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      // Get program and supplier details
      const enrollmentQuery = `
        SELECT s.*, p.*
        FROM supply_chain_suppliers s
        JOIN supply_chain_programs p ON s.program_id = p.id
        WHERE s.program_id = $1
        AND s.supplier_business_id = $2
        AND s.enrollment_status = 'active'
      `;

      const enrollmentResult = await client.query(enrollmentQuery, [
        programId,
        invoiceData.supplier_id
      ]);

      if (enrollmentResult.rows.length === 0) {
        throw new Error('Supplier not enrolled in program');
      }

      const enrollment = enrollmentResult.rows[0];

      // Check credit availability
      const invoiceAmount = parseFloat(invoiceData.amount);
      const advanceRate = parseFloat(enrollment.advance_rate) / 100;
      const advanceAmount = invoiceAmount * advanceRate;

      if (advanceAmount > parseFloat(enrollment.available_credit)) {
        throw new Error('Insufficient supplier credit limit');
      }

      if (advanceAmount > parseFloat(enrollment.available_amount)) {
        throw new Error('Program credit limit exceeded');
      }

      // Calculate financing terms
      const financingTerms = this.calculateFinancingTerms(
        enrollment,
        invoiceData
      );

      // Create invoice financing record
      const invoiceQuery = `
        INSERT INTO financing_invoices (
          account_id, invoice_number, invoice_date, due_date,
          seller_business_id, buyer_business_id,
          seller_name, buyer_name,
          invoice_amount, net_amount,
          advance_amount, discount_fee,
          financing_status, verification_status,
          metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        RETURNING *
      `;

      const invoiceValues = [
        enrollment.program_id, // Using program_id as account_id
        invoiceData.invoice_number,
        invoiceData.invoice_date,
        invoiceData.due_date,
        invoiceData.supplier_id,
        enrollment.anchor_buyer_id,
        invoiceData.supplier_name,
        invoiceData.buyer_name,
        invoiceAmount,
        invoiceAmount,
        financingTerms.advance_amount,
        financingTerms.discount_fee,
        'pending',
        'pending',
        JSON.stringify({
          program_id: programId,
          program_type: enrollment.program_type,
          financing_terms: financingTerms,
          auto_approved: invoiceAmount <= parseFloat(enrollment.auto_approval_threshold)
        })
      ];

      const invoiceResult = await client.query(invoiceQuery, invoiceValues);
      const invoice = invoiceResult.rows[0];

      // Auto-approve if below threshold
      if (invoiceAmount <= parseFloat(enrollment.auto_approval_threshold)) {
        await this.autoApproveInvoice(invoice.id, client);
      }

      // Update credit utilization
      await this.updateCreditUtilization(
        programId,
        invoiceData.supplier_id,
        advanceAmount,
        client
      );

      await client.query('COMMIT');

      this.emit('invoiceSubmitted', {
        invoiceId: invoice.id,
        programId,
        amount: invoiceAmount,
        autoApproved: invoiceAmount <= parseFloat(enrollment.auto_approval_threshold)
      });

      return {
        success: true,
        invoiceId: invoice.id,
        financingTerms,
        status: invoiceAmount <= parseFloat(enrollment.auto_approval_threshold) ?
                'auto_approved' : 'pending_approval'
      };

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error submitting invoice:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Process dynamic discounting
   */
  async processDynamicDiscounting(programId, invoiceId, earlyPaymentDays) {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      // Get invoice and program details
      const query = `
        SELECT i.*, p.*
        FROM financing_invoices i
        JOIN supply_chain_programs p ON i.account_id = p.id
        WHERE i.id = $1 AND p.id = $2
      `;

      const result = await client.query(query, [invoiceId, programId]);

      if (result.rows.length === 0) {
        throw new Error('Invoice not found in program');
      }

      const data = result.rows[0];

      // Calculate dynamic discount
      const standardTerms = parseInt(data.standard_payment_terms);
      const daysEarly = standardTerms - earlyPaymentDays;
      const discountRate = parseFloat(data.early_payment_discount) / 100;

      // Sliding scale discount based on days early
      const discount = (daysEarly / standardTerms) * discountRate;
      const invoiceAmount = parseFloat(data.invoice_amount);
      const discountAmount = invoiceAmount * discount;
      const paymentAmount = invoiceAmount - discountAmount;

      // Create payment transaction
      const transactionQuery = `
        INSERT INTO invoice_financing_transactions (
          invoice_id, transaction_type, transaction_date,
          amount, fee_amount, status,
          metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;

      const transactionValues = [
        invoiceId,
        'early_payment',
        new Date(),
        paymentAmount,
        discountAmount,
        'completed',
        JSON.stringify({
          days_early: daysEarly,
          discount_rate: discount * 100,
          original_amount: invoiceAmount
        })
      ];

      const transaction = await client.query(transactionQuery, transactionValues);

      // Update invoice status
      await client.query(
        `UPDATE financing_invoices
         SET payment_status = 'paid',
             payment_received_date = $1,
             payment_amount = $2,
             discount_amount = $3
         WHERE id = $4`,
        [new Date(), paymentAmount, discountAmount, invoiceId]
      );

      await client.query('COMMIT');

      this.emit('dynamicDiscountingProcessed', {
        invoiceId,
        originalAmount: invoiceAmount,
        discountAmount,
        paymentAmount,
        daysEarly
      });

      return {
        success: true,
        transaction: transaction.rows[0],
        savings: discountAmount,
        paymentAmount
      };

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error processing dynamic discounting:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Process reverse factoring
   */
  async processReverseFactoring(programId, invoiceIds) {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      const results = [];

      for (const invoiceId of invoiceIds) {
        // Get invoice details
        const invoiceQuery = `
          SELECT i.*, s.*, p.*
          FROM financing_invoices i
          JOIN supply_chain_suppliers s ON i.seller_business_id = s.supplier_business_id
          JOIN supply_chain_programs p ON s.program_id = p.id
          WHERE i.id = $1 AND p.id = $2
        `;

        const invoiceResult = await client.query(invoiceQuery, [invoiceId, programId]);

        if (invoiceResult.rows.length === 0) {
          continue;
        }

        const invoice = invoiceResult.rows[0];

        // Calculate factoring terms
        const invoiceAmount = parseFloat(invoice.invoice_amount);
        const advanceRate = parseFloat(invoice.advance_rate) / 100;
        const advanceAmount = invoiceAmount * advanceRate;
        const reserveAmount = invoiceAmount - advanceAmount;

        // Calculate fees
        const daysToMaturity = Math.ceil(
          (new Date(invoice.due_date) - new Date()) / (1000 * 60 * 60 * 24)
        );
        const discountRate = parseFloat(invoice.discount_rate) / 100;
        const factoringFee = advanceAmount * (discountRate / 365) * daysToMaturity;

        // Create factoring transaction
        const transactionQuery = `
          INSERT INTO invoice_financing_transactions (
            invoice_id, transaction_type,
            amount, fee_amount,
            payment_method, status,
            metadata
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)
          RETURNING *
        `;

        const transactionValues = [
          invoiceId,
          'reverse_factoring',
          advanceAmount,
          factoringFee,
          'ach',
          'completed',
          JSON.stringify({
            invoice_amount: invoiceAmount,
            advance_rate: invoice.advance_rate,
            reserve_amount: reserveAmount,
            days_to_maturity: daysToMaturity
          })
        ];

        const transaction = await client.query(transactionQuery, transactionValues);

        // Update invoice status
        await client.query(
          `UPDATE financing_invoices
           SET financing_status = 'funded',
               advance_amount = $1,
               reserve_amount = $2,
               discount_fee = $3
           WHERE id = $4`,
          [advanceAmount, reserveAmount, factoringFee, invoiceId]
        );

        results.push({
          invoiceId,
          advanceAmount,
          reserveAmount,
          factoringFee,
          transaction: transaction.rows[0]
        });
      }

      await client.query('COMMIT');

      this.emit('reverseFactoringProcessed', {
        programId,
        invoiceCount: results.length,
        totalAdvanced: results.reduce((sum, r) => sum + r.advanceAmount, 0)
      });

      return {
        success: true,
        results
      };

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error processing reverse factoring:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Calculate program parameters
   */
  calculateProgramParameters(buyer, programData) {
    // Base rates based on buyer creditworthiness
    let baseRate = 3.5; // Prime rate approximation
    let margin = 2.0;
    let earlyPaymentDiscount = 2.0;

    // Adjust based on buyer credit (simulated)
    const buyerScore = buyer.credit_score || 700;
    if (buyerScore >= 750) {
      margin = 1.5;
      earlyPaymentDiscount = 2.5;
    } else if (buyerScore >= 650) {
      margin = 2.0;
      earlyPaymentDiscount = 2.0;
    } else {
      margin = 3.0;
      earlyPaymentDiscount = 1.5;
    }

    // Adjust based on program type
    if (programData.program_type === this.programTypes.DYNAMIC_DISCOUNTING) {
      earlyPaymentDiscount = Math.max(earlyPaymentDiscount, 3.0);
    }

    return {
      base_rate: baseRate,
      margin,
      early_payment_discount: earlyPaymentDiscount
    };
  }

  /**
   * Calculate supplier-specific terms
   */
  async calculateSupplierTerms(supplier, program) {
    // Risk assessment based on supplier profile
    const riskScore = this.assessSupplierRisk(supplier);

    // Determine risk category
    let riskCategory = this.riskCategories.VERY_HIGH;
    for (const [category, params] of Object.entries(this.riskCategories)) {
      if (riskScore >= params.min_score) {
        riskCategory = params;
        break;
      }
    }

    // Calculate credit limit (percentage of program limit)
    const programLimit = parseFloat(program.credit_limit);
    let supplierCreditLimit = programLimit * 0.1; // 10% default

    if (riskScore >= 80) {
      supplierCreditLimit = programLimit * 0.2; // 20% for low risk
    } else if (riskScore >= 60) {
      supplierCreditLimit = programLimit * 0.15; // 15% for medium risk
    }

    return {
      credit_limit: supplierCreditLimit,
      credit_rating: riskScore >= 80 ? 'A' : riskScore >= 60 ? 'B' : 'C',
      advance_rate: riskCategory.advance_rate,
      discount_rate: riskCategory.discount_rate,
      payment_terms: program.standard_payment_terms,
      risk_assessment: {
        score: riskScore,
        category: riskScore >= 80 ? 'LOW' : riskScore >= 60 ? 'MEDIUM' : 'HIGH'
      }
    };
  }

  /**
   * Assess supplier risk
   */
  assessSupplierRisk(supplier) {
    let riskScore = 50; // Base score

    // Business age factor
    const businessAge = supplier.years_in_business || 0;
    if (businessAge >= 10) riskScore += 20;
    else if (businessAge >= 5) riskScore += 10;
    else if (businessAge >= 2) riskScore += 5;

    // Revenue factor (simulated)
    const annualRevenue = supplier.annual_revenue || 0;
    if (annualRevenue >= 10000000) riskScore += 15;
    else if (annualRevenue >= 1000000) riskScore += 10;
    else if (annualRevenue >= 100000) riskScore += 5;

    // Compliance status
    if (supplier.kyc_status === 'verified') riskScore += 10;
    if (supplier.aml_status === 'cleared') riskScore += 5;

    // Previous relationship (simulated)
    if (supplier.existing_relationship) riskScore += 10;

    return Math.min(100, riskScore);
  }

  /**
   * Calculate financing terms
   */
  calculateFinancingTerms(enrollment, invoiceData) {
    const invoiceAmount = parseFloat(invoiceData.amount);
    const advanceRate = parseFloat(enrollment.advance_rate) / 100;
    const discountRate = parseFloat(enrollment.discount_rate) / 100;

    const advanceAmount = invoiceAmount * advanceRate;
    const reserveAmount = invoiceAmount - advanceAmount;

    // Calculate days to payment
    const dueDate = new Date(invoiceData.due_date);
    const today = new Date();
    const daysToPayment = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));

    // Calculate discount fee
    const discountFee = advanceAmount * (discountRate / 365) * daysToPayment;

    // Net proceeds
    const netProceeds = advanceAmount - discountFee;

    return {
      advance_amount: advanceAmount.toFixed(2),
      reserve_amount: reserveAmount.toFixed(2),
      discount_fee: discountFee.toFixed(2),
      net_proceeds: netProceeds.toFixed(2),
      effective_rate: ((discountFee / advanceAmount) * (365 / daysToPayment) * 100).toFixed(2),
      days_to_payment: daysToPayment
    };
  }

  /**
   * Auto-approve invoice
   */
  async autoApproveInvoice(invoiceId, client) {
    await client.query(
      `UPDATE financing_invoices
       SET financing_status = 'approved',
           verification_status = 'auto_verified',
           verification_date = CURRENT_TIMESTAMP,
           verification_score = 1.0
       WHERE id = $1`,
      [invoiceId]
    );

    this.emit('invoiceAutoApproved', { invoiceId });
  }

  /**
   * Update credit utilization
   */
  async updateCreditUtilization(programId, supplierId, amount, client) {
    // Update supplier credit
    await client.query(
      `UPDATE supply_chain_suppliers
       SET utilized_amount = utilized_amount + $1,
           available_credit = credit_limit - (utilized_amount + $1)
       WHERE program_id = $2 AND supplier_business_id = $3`,
      [amount, programId, supplierId]
    );

    // Update program credit
    await client.query(
      `UPDATE supply_chain_programs
       SET utilized_amount = utilized_amount + $1,
           available_amount = credit_limit - (utilized_amount + $1),
           active_invoices = active_invoices + 1
       WHERE id = $2`,
      [amount, programId]
    );
  }

  /**
   * Get program analytics
   */
  async getProgramAnalytics(programId) {
    const client = await this.pool.connect();

    try {
      const analyticsQuery = `
        SELECT
          p.*,
          COUNT(DISTINCT s.supplier_business_id) as active_suppliers,
          COUNT(i.id) as total_invoices,
          SUM(i.invoice_amount) as total_invoice_value,
          SUM(i.advance_amount) as total_advanced,
          SUM(i.discount_fee) as total_fees_earned,
          AVG(i.risk_score) as average_risk_score,
          AVG(
            CASE
              WHEN i.payment_status = 'paid' THEN
                EXTRACT(DAY FROM i.payment_received_date - i.invoice_date)
              ELSE NULL
            END
          ) as average_days_to_payment
        FROM supply_chain_programs p
        LEFT JOIN supply_chain_suppliers s ON p.id = s.program_id
        LEFT JOIN financing_invoices i ON p.id = i.account_id
        WHERE p.id = $1
        GROUP BY p.id
      `;

      const result = await client.query(analyticsQuery, [programId]);

      // Get supplier breakdown
      const supplierQuery = `
        SELECT
          s.*,
          COUNT(i.id) as invoice_count,
          SUM(i.invoice_amount) as total_financed,
          MAX(i.created_at) as last_invoice_date
        FROM supply_chain_suppliers s
        LEFT JOIN financing_invoices i ON s.supplier_business_id = i.seller_business_id
        WHERE s.program_id = $1
        GROUP BY s.id
      `;

      const suppliers = await client.query(supplierQuery, [programId]);

      return {
        program: result.rows[0],
        suppliers: suppliers.rows
      };

    } catch (error) {
      console.error('Error getting analytics:', error);
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

export default SupplyChainFinanceService;