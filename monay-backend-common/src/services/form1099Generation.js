import { Pool } from 'pg';
import PDFDocument from 'pdfkit';
import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';
import EventEmitter from 'events';

class Form1099GenerationSystem extends EventEmitter {
  constructor(dbConfig) {
    super();
    this.pool = new Pool(dbConfig);

    // 1099 form types
    this.formTypes = {
      NEC: '1099-NEC', // Nonemployee Compensation
      MISC: '1099-MISC', // Miscellaneous Income
      K: '1099-K', // Payment Card and Third Party Network Transactions
      INT: '1099-INT', // Interest Income
      DIV: '1099-DIV', // Dividends and Distributions
      B: '1099-B', // Proceeds from Broker Transactions
      S: '1099-S', // Proceeds from Real Estate Transactions
      R: '1099-R', // Distributions from Pensions
      G: '1099-G', // Government Payments
      C: '1099-C' // Cancellation of Debt
    };

    // Reporting thresholds for 2025
    this.reportingThresholds = {
      '1099-NEC': 600, // $600 or more
      '1099-MISC': {
        rents: 600,
        prizes: 600,
        medicalPayments: 600,
        attorneyPayments: 600,
        fishingBoatProceeds: 600,
        cropInsurance: 600,
        grossProceeds: 600,
        section409A: 0, // Any amount
        goldenParachute: 0, // Any amount
        nonqualifiedDeferred: 0 // Any amount
      },
      '1099-K': {
        aggregatePayments: 600, // Changed from $20,000
        numberOfTransactions: 0 // No minimum transaction count
      },
      '1099-INT': 10,
      '1099-DIV': 10,
      '1099-G': {
        unemployment: 10,
        stateRefund: 10,
        agriculture: 600
      }
    };

    // IRS filing statuses
    this.filingStatus = {
      PENDING: 'pending',
      GENERATED: 'generated',
      DELIVERED: 'delivered',
      FILED: 'filed',
      CORRECTED: 'corrected',
      VOID: 'void'
    };

    // Delivery methods
    this.deliveryMethods = {
      ELECTRONIC: 'electronic',
      MAIL: 'mail',
      BOTH: 'both'
    };
  }

  /**
   * Generate 1099 forms for tax year
   */
  async generateForms1099(taxYear, options = {}) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // Get all contractors who meet reporting thresholds
      const contractors = await this.getEligibleContractors(client, taxYear);

      const generatedForms = [];

      for (const contractor of contractors) {
        // Generate appropriate 1099 forms
        if (contractor.total_nec >= this.reportingThresholds['1099-NEC']) {
          const form = await this.generateForm1099NEC(client, contractor, taxYear);
          generatedForms.push(form);
        }

        if (contractor.total_misc_rents >= this.reportingThresholds['1099-MISC'].rents) {
          const form = await this.generateForm1099MISC(client, contractor, taxYear);
          generatedForms.push(form);
        }

        if (this.meetsForm1099KThreshold(contractor)) {
          const form = await this.generateForm1099K(client, contractor, taxYear);
          generatedForms.push(form);
        }
      }

      // Create batch record
      const batchId = await this.createFormBatch(client, taxYear, generatedForms.length);

      // Generate IRS submission files
      await this.generateIRSSubmissionFiles(client, batchId, taxYear);

      await client.query('COMMIT');

      this.emit('forms:generated', {
        taxYear,
        formCount: generatedForms.length,
        batchId
      });

      return {
        success: true,
        batchId,
        formsGenerated: generatedForms.length,
        forms: generatedForms
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get eligible contractors for 1099 reporting
   */
  async getEligibleContractors(client, taxYear) {
    const query = `
      SELECT
        c.id as contractor_id,
        c.first_name,
        c.last_name,
        c.legal_name,
        c.business_name,
        c.ssn_encrypted,
        c.ein_encrypted,
        c.address_line1,
        c.address_line2,
        c.city,
        c.state,
        c.postal_code,
        c.country,
        c.email,
        c.phone,
        ti.form_type as tax_form_type,
        ti.tin_encrypted,
        ti.tax_classification,
        ti.exemption_codes,
        ti.fatca_status,
        -- Aggregate payment data
        COALESCE(SUM(p.amount) FILTER (WHERE p.payment_type = 'nonemployee_compensation'), 0) as total_nec,
        COALESCE(SUM(p.amount) FILTER (WHERE p.payment_type = 'rent'), 0) as total_misc_rents,
        COALESCE(SUM(p.amount) FILTER (WHERE p.payment_type = 'prizes'), 0) as total_misc_prizes,
        COALESCE(SUM(p.amount) FILTER (WHERE p.payment_type = 'medical'), 0) as total_misc_medical,
        COALESCE(SUM(p.amount) FILTER (WHERE p.payment_type = 'attorney'), 0) as total_misc_attorney,
        COALESCE(SUM(p.amount) FILTER (WHERE p.payment_type = 'card_payment'), 0) as total_card_payments,
        COUNT(p.id) FILTER (WHERE p.payment_type = 'card_payment') as card_payment_count,
        COALESCE(SUM(p.amount), 0) as total_payments,
        COUNT(p.id) as payment_count
      FROM contractors c
      LEFT JOIN contractor_tax_information ti ON c.id = ti.contractor_id
      LEFT JOIN contractor_payments p ON c.id = p.contractor_id
        AND EXTRACT(YEAR FROM p.payment_date) = $1
        AND p.status = 'completed'
      WHERE c.status = 'active'
      GROUP BY
        c.id, c.first_name, c.last_name, c.legal_name, c.business_name,
        c.ssn_encrypted, c.ein_encrypted, c.address_line1, c.address_line2,
        c.city, c.state, c.postal_code, c.country, c.email, c.phone,
        ti.form_type, ti.tin_encrypted, ti.tax_classification,
        ti.exemption_codes, ti.fatca_status
      HAVING
        COALESCE(SUM(p.amount), 0) > 0`;

    const result = await client.query(query, [taxYear]);
    return result.rows;
  }

  /**
   * Generate Form 1099-NEC
   */
  async generateForm1099NEC(client, contractor, taxYear) {
    const formData = {
      formType: this.formTypes.NEC,
      taxYear,
      payerInfo: await this.getPayerInfo(),
      recipientInfo: this.formatRecipientInfo(contractor),
      box1_nonemployeeCompensation: contractor.total_nec,
      box2_payerMadeDirectSales: false,
      box4_federalIncomeTaxWithheld: 0,
      box5_stateIncomeTaxWithheld: 0,
      box6_stateNumber: contractor.state,
      box7_stateIncome: contractor.total_nec
    };

    // Store form in database
    const query = `
      INSERT INTO form_1099_records (
        contractor_id, tax_year, form_type, form_data,
        total_amount, status, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      RETURNING id`;

    const result = await client.query(query, [
      contractor.contractor_id,
      taxYear,
      this.formTypes.NEC,
      JSON.stringify(formData),
      contractor.total_nec,
      this.filingStatus.GENERATED
    ]);

    // Generate PDF
    const pdfPath = await this.generateFormPDF(formData, result.rows[0].id);

    // Update record with PDF path
    await client.query(
      'UPDATE form_1099_records SET pdf_path = $1 WHERE id = $2',
      [pdfPath, result.rows[0].id]
    );

    return {
      formId: result.rows[0].id,
      formType: this.formTypes.NEC,
      contractorId: contractor.contractor_id,
      amount: contractor.total_nec,
      pdfPath
    };
  }

  /**
   * Generate Form 1099-MISC
   */
  async generateForm1099MISC(client, contractor, taxYear) {
    const formData = {
      formType: this.formTypes.MISC,
      taxYear,
      payerInfo: await this.getPayerInfo(),
      recipientInfo: this.formatRecipientInfo(contractor),
      box1_rents: contractor.total_misc_rents,
      box2_royalties: 0,
      box3_otherIncome: contractor.total_misc_prizes,
      box4_federalIncomeTaxWithheld: 0,
      box5_fishingBoatProceeds: 0,
      box6_medicalPayments: contractor.total_misc_medical,
      box7_payerMadeDirectSales: false,
      box8_substitutePayments: 0,
      box9_cropInsuranceProceeds: 0,
      box10_grossProceedsPaidToAttorney: contractor.total_misc_attorney,
      box11_fishPurchasedForResale: 0,
      box12_section409ADeferrals: 0,
      box13_excessGoldenParachute: 0,
      box14_nonqualifiedDeferredCompensation: 0,
      box15_stateTaxWithheld: 0,
      box16_stateNumber: contractor.state,
      box17_stateIncome: contractor.total_misc_rents + contractor.total_misc_prizes
    };

    // Store form in database
    const query = `
      INSERT INTO form_1099_records (
        contractor_id, tax_year, form_type, form_data,
        total_amount, status, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      RETURNING id`;

    const totalAmount = contractor.total_misc_rents + contractor.total_misc_prizes +
                       contractor.total_misc_medical + contractor.total_misc_attorney;

    const result = await client.query(query, [
      contractor.contractor_id,
      taxYear,
      this.formTypes.MISC,
      JSON.stringify(formData),
      totalAmount,
      this.filingStatus.GENERATED
    ]);

    // Generate PDF
    const pdfPath = await this.generateFormPDF(formData, result.rows[0].id);

    // Update record with PDF path
    await client.query(
      'UPDATE form_1099_records SET pdf_path = $1 WHERE id = $2',
      [pdfPath, result.rows[0].id]
    );

    return {
      formId: result.rows[0].id,
      formType: this.formTypes.MISC,
      contractorId: contractor.contractor_id,
      amount: totalAmount,
      pdfPath
    };
  }

  /**
   * Generate Form 1099-K
   */
  async generateForm1099K(client, contractor, taxYear) {
    const formData = {
      formType: this.formTypes.K,
      taxYear,
      payerInfo: await this.getPayerInfo(),
      recipientInfo: this.formatRecipientInfo(contractor),
      box1a_grossAmount: contractor.total_card_payments,
      box1b_cardNotPresent: 0, // Track separately if needed
      box2_merchantCategoryCode: '0000', // Default MCC
      box3_numberOfTransactions: contractor.card_payment_count,
      box4_federalIncomeTaxWithheld: 0,
      box5_stateTaxWithheld: 0,
      box6_stateNumber: contractor.state,
      box7_stateIncome: contractor.total_card_payments,
      pseName: 'Monay Platform',
      psePhone: '1-800-MONAY-00'
    };

    // Store form in database
    const query = `
      INSERT INTO form_1099_records (
        contractor_id, tax_year, form_type, form_data,
        total_amount, transaction_count, status,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      RETURNING id`;

    const result = await client.query(query, [
      contractor.contractor_id,
      taxYear,
      this.formTypes.K,
      JSON.stringify(formData),
      contractor.total_card_payments,
      contractor.card_payment_count,
      this.filingStatus.GENERATED
    ]);

    // Generate PDF
    const pdfPath = await this.generateFormPDF(formData, result.rows[0].id);

    // Update record with PDF path
    await client.query(
      'UPDATE form_1099_records SET pdf_path = $1 WHERE id = $2',
      [pdfPath, result.rows[0].id]
    );

    return {
      formId: result.rows[0].id,
      formType: this.formTypes.K,
      contractorId: contractor.contractor_id,
      amount: contractor.total_card_payments,
      transactions: contractor.card_payment_count,
      pdfPath
    };
  }

  /**
   * Generate PDF for 1099 form
   */
  async generateFormPDF(formData, formId) {
    const doc = new PDFDocument({
      size: 'LETTER',
      margins: { top: 50, bottom: 50, left: 50, right: 50 }
    });

    const fileName = `${formData.formType}_${formData.taxYear}_${formId}.pdf`;
    const filePath = path.join(process.env.FORMS_STORAGE_PATH || './forms', fileName);

    // Create write stream
    const stream = doc.pipe(fs.createWriteStream(filePath));

    // Add IRS copy indicator
    doc.fontSize(10).text('Copy B - For Recipient', 50, 30);

    // Add form header
    doc.fontSize(16).text(formData.formType, 50, 50);
    doc.fontSize(12).text(`Tax Year ${formData.taxYear}`, 50, 70);

    // Add payer information
    doc.fontSize(10);
    doc.text('PAYER\'S Information:', 50, 100);
    doc.text(formData.payerInfo.name, 50, 115);
    doc.text(formData.payerInfo.address, 50, 130);
    doc.text(`${formData.payerInfo.city}, ${formData.payerInfo.state} ${formData.payerInfo.zip}`, 50, 145);
    doc.text(`TIN: ${formData.payerInfo.ein}`, 50, 160);

    // Add recipient information
    doc.text('RECIPIENT\'S Information:', 300, 100);
    doc.text(formData.recipientInfo.name, 300, 115);
    doc.text(formData.recipientInfo.address, 300, 130);
    doc.text(`${formData.recipientInfo.city}, ${formData.recipientInfo.state} ${formData.recipientInfo.zip}`, 300, 145);
    doc.text(`TIN: ***-**-${formData.recipientInfo.tinLast4}`, 300, 160);

    // Add form-specific boxes
    let yPosition = 200;

    if (formData.formType === this.formTypes.NEC) {
      doc.text(`Box 1 - Nonemployee Compensation: $${formData.box1_nonemployeeCompensation.toFixed(2)}`, 50, yPosition);
      yPosition += 20;
      if (formData.box4_federalIncomeTaxWithheld > 0) {
        doc.text(`Box 4 - Federal Income Tax Withheld: $${formData.box4_federalIncomeTaxWithheld.toFixed(2)}`, 50, yPosition);
        yPosition += 20;
      }
      if (formData.box5_stateIncomeTaxWithheld > 0) {
        doc.text(`Box 5 - State Tax Withheld: $${formData.box5_stateIncomeTaxWithheld.toFixed(2)}`, 50, yPosition);
        yPosition += 20;
      }
      doc.text(`Box 6 - State: ${formData.box6_stateNumber}`, 50, yPosition);
      yPosition += 20;
      doc.text(`Box 7 - State Income: $${formData.box7_stateIncome.toFixed(2)}`, 50, yPosition);
    } else if (formData.formType === this.formTypes.MISC) {
      if (formData.box1_rents > 0) {
        doc.text(`Box 1 - Rents: $${formData.box1_rents.toFixed(2)}`, 50, yPosition);
        yPosition += 20;
      }
      if (formData.box3_otherIncome > 0) {
        doc.text(`Box 3 - Other Income: $${formData.box3_otherIncome.toFixed(2)}`, 50, yPosition);
        yPosition += 20;
      }
      if (formData.box6_medicalPayments > 0) {
        doc.text(`Box 6 - Medical and Health Care Payments: $${formData.box6_medicalPayments.toFixed(2)}`, 50, yPosition);
        yPosition += 20;
      }
      if (formData.box10_grossProceedsPaidToAttorney > 0) {
        doc.text(`Box 10 - Gross Proceeds Paid to an Attorney: $${formData.box10_grossProceedsPaidToAttorney.toFixed(2)}`, 50, yPosition);
        yPosition += 20;
      }
    } else if (formData.formType === this.formTypes.K) {
      doc.text(`Box 1a - Gross Amount of Payment Card/Third Party Network Transactions: $${formData.box1a_grossAmount.toFixed(2)}`, 50, yPosition);
      yPosition += 20;
      doc.text(`Box 3 - Number of Payment Transactions: ${formData.box3_numberOfTransactions}`, 50, yPosition);
      yPosition += 20;
      doc.text(`PSE Name: ${formData.pseName}`, 50, yPosition);
      yPosition += 20;
      doc.text(`PSE Phone: ${formData.psePhone}`, 50, yPosition);
    }

    // Add footer
    doc.fontSize(8);
    doc.text('This is important tax information and is being furnished to the Internal Revenue Service.', 50, 650);
    doc.text('If you are required to file a return, a negligence penalty or other sanction may be imposed', 50, 665);
    doc.text('on you if this income is taxable and the IRS determines that it has not been reported.', 50, 680);

    // Add form instructions reference
    doc.text('For more information, see IRS instructions for recipient.', 50, 710);

    // Finalize PDF
    doc.end();

    // Wait for stream to finish
    await new Promise((resolve) => stream.on('finish', resolve));

    return filePath;
  }

  /**
   * Create corrected 1099 form
   */
  async createCorrected1099(originalFormId, corrections) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // Get original form
      const originalQuery = `
        SELECT * FROM form_1099_records WHERE id = $1`;
      const originalResult = await client.query(originalQuery, [originalFormId]);

      if (originalResult.rows.length === 0) {
        throw new Error('Original form not found');
      }

      const originalForm = originalResult.rows[0];

      // Create corrected form data
      const correctedFormData = {
        ...JSON.parse(originalForm.form_data),
        ...corrections,
        corrected: true,
        originalFormId
      };

      // Insert corrected form
      const insertQuery = `
        INSERT INTO form_1099_records (
          contractor_id, tax_year, form_type, form_data,
          total_amount, status, original_form_id,
          created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
        RETURNING id`;

      const result = await client.query(insertQuery, [
        originalForm.contractor_id,
        originalForm.tax_year,
        originalForm.form_type,
        JSON.stringify(correctedFormData),
        corrections.totalAmount || originalForm.total_amount,
        this.filingStatus.CORRECTED,
        originalFormId
      ]);

      // Mark original as corrected
      await client.query(
        'UPDATE form_1099_records SET status = $1, corrected_by_id = $2 WHERE id = $3',
        [this.filingStatus.CORRECTED, result.rows[0].id, originalFormId]
      );

      // Generate corrected PDF
      const pdfPath = await this.generateFormPDF(correctedFormData, result.rows[0].id);

      // Update with PDF path
      await client.query(
        'UPDATE form_1099_records SET pdf_path = $1 WHERE id = $2',
        [pdfPath, result.rows[0].id]
      );

      await client.query('COMMIT');

      this.emit('form:corrected', {
        originalFormId,
        correctedFormId: result.rows[0].id
      });

      return {
        success: true,
        correctedFormId: result.rows[0].id,
        pdfPath
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Void 1099 form
   */
  async void1099Form(formId, reason) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      const query = `
        UPDATE form_1099_records
        SET status = $1, void_reason = $2, voided_at = NOW()
        WHERE id = $3
        RETURNING *`;

      const result = await client.query(query, [
        this.filingStatus.VOID,
        reason,
        formId
      ]);

      if (result.rows.length === 0) {
        throw new Error('Form not found');
      }

      // Log void action
      await client.query(
        `INSERT INTO form_1099_audit_log (
          form_id, action, reason, performed_by, performed_at
        ) VALUES ($1, $2, $3, $4, NOW())`,
        [formId, 'VOID', reason, 'system']
      );

      await client.query('COMMIT');

      this.emit('form:voided', { formId, reason });

      return { success: true, form: result.rows[0] };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Deliver 1099 forms to contractors
   */
  async deliver1099Forms(batchId, deliveryMethod = this.deliveryMethods.ELECTRONIC) {
    const client = await this.pool.connect();
    try {
      const formsQuery = `
        SELECT f.*, c.email, c.phone, c.preferred_delivery_method
        FROM form_1099_records f
        JOIN contractors c ON f.contractor_id = c.id
        WHERE f.batch_id = $1 AND f.status = $2`;

      const forms = await client.query(formsQuery, [batchId, this.filingStatus.GENERATED]);

      const deliveryResults = [];

      for (const form of forms.rows) {
        const method = form.preferred_delivery_method || deliveryMethod;

        let delivered = false;
        if (method === this.deliveryMethods.ELECTRONIC || method === this.deliveryMethods.BOTH) {
          delivered = await this.deliverElectronically(form);
        }

        if (method === this.deliveryMethods.MAIL || method === this.deliveryMethods.BOTH) {
          await this.queueForMailing(form);
        }

        if (delivered) {
          await client.query(
            'UPDATE form_1099_records SET status = $1, delivered_at = NOW() WHERE id = $2',
            [this.filingStatus.DELIVERED, form.id]
          );
        }

        deliveryResults.push({
          formId: form.id,
          contractorId: form.contractor_id,
          delivered,
          method
        });
      }

      return {
        success: true,
        delivered: deliveryResults.filter(r => r.delivered).length,
        total: deliveryResults.length,
        results: deliveryResults
      };
    } finally {
      client.release();
    }
  }

  /**
   * Generate IRS submission files (FIRE format)
   */
  async generateIRSSubmissionFiles(client, batchId, taxYear) {
    // Generate T Record (Transmitter)
    const tRecord = this.generateTRecord(taxYear);

    // Generate A Records (Payer)
    const aRecords = await this.generateARecords(client, batchId);

    // Generate B Records (Payee/Recipient)
    const bRecords = await this.generateBRecords(client, batchId);

    // Generate C Record (End of Payer)
    const cRecords = this.generateCRecords(aRecords.length, bRecords.length);

    // Generate F Record (End of File)
    const fRecord = this.generateFRecord(aRecords.length, bRecords.length);

    // Combine all records
    const fireFile = [tRecord, ...aRecords, ...bRecords, ...cRecords, fRecord].join('\n');

    // Save FIRE file
    const fileName = `FIRE_${taxYear}_${batchId}.txt`;
    const filePath = path.join(process.env.IRS_FILES_PATH || './irs', fileName);
    await fs.writeFile(filePath, fireFile);

    // Update batch with file path
    await client.query(
      'UPDATE form_1099_batches SET irs_file_path = $1 WHERE id = $2',
      [filePath, batchId]
    );

    return filePath;
  }

  /**
   * Helper methods
   */
  meetsForm1099KThreshold(contractor) {
    return contractor.total_card_payments >= this.reportingThresholds['1099-K'].aggregatePayments;
  }

  formatRecipientInfo(contractor) {
    const tin = contractor.tin_encrypted ? this.decryptTIN(contractor.tin_encrypted) :
               contractor.ssn_encrypted ? this.decryptSSN(contractor.ssn_encrypted) : '';

    return {
      name: contractor.business_name || `${contractor.first_name} ${contractor.last_name}`,
      address: contractor.address_line1,
      city: contractor.city,
      state: contractor.state,
      zip: contractor.postal_code,
      country: contractor.country,
      tin: tin,
      tinLast4: tin.slice(-4),
      taxClassification: contractor.tax_classification
    };
  }

  async getPayerInfo() {
    // Get company information from settings
    return {
      name: 'Monay Inc.',
      ein: process.env.COMPANY_EIN || '00-0000000',
      address: '123 Financial Street',
      city: 'San Francisco',
      state: 'CA',
      zip: '94105',
      phone: '1-800-MONAY-00'
    };
  }

  decryptSSN(encrypted) {
    const decipher = crypto.createDecipher('aes-256-cbc', process.env.ENCRYPTION_KEY);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  decryptTIN(encrypted) {
    return this.decryptSSN(encrypted); // Same decryption method
  }

  async createFormBatch(client, taxYear, formCount) {
    const query = `
      INSERT INTO form_1099_batches (
        tax_year, form_count, status, created_at
      ) VALUES ($1, $2, $3, NOW())
      RETURNING id`;

    const result = await client.query(query, [
      taxYear,
      formCount,
      'generated'
    ]);

    return result.rows[0].id;
  }

  async deliverElectronically(form) {
    // Send email with secure link to download form
    this.emit('email:send', {
      to: form.email,
      subject: `Your ${form.form_type} for Tax Year ${form.tax_year} is Available`,
      template: '1099_available',
      data: {
        formType: form.form_type,
        taxYear: form.tax_year,
        downloadLink: this.generateSecureDownloadLink(form.id)
      }
    });

    return true;
  }

  async queueForMailing(form) {
    // Add to physical mailing queue
    this.emit('mail:queue', {
      formId: form.id,
      address: {
        line1: form.address_line1,
        line2: form.address_line2,
        city: form.city,
        state: form.state,
        zip: form.postal_code
      }
    });
  }

  generateSecureDownloadLink(formId) {
    const token = crypto.randomBytes(32).toString('hex');
    // Store token with expiration
    return `https://platform.monay.com/tax-forms/download/${formId}/${token}`;
  }

  generateTRecord(taxYear) {
    // IRS T Record format (750 positions)
    return 'T' + // Record Type
           taxYear.toString() + // Tax Year
           // ... additional required fields padded to 750 characters
           ''.padEnd(745, ' ');
  }

  async generateARecords(client, batchId) {
    // IRS A Record format for each payer
    return ['A' + ''.padEnd(749, ' ')]; // Simplified
  }

  async generateBRecords(client, batchId) {
    // IRS B Record format for each payee
    const query = `SELECT * FROM form_1099_records WHERE batch_id = $1`;
    const result = await client.query(query, [batchId]);

    return result.rows.map(form => 'B' + ''.padEnd(749, ' ')); // Simplified
  }

  generateCRecords(payerCount, payeeCount) {
    // IRS C Record format
    return ['C' + ''.padEnd(749, ' ')];
  }

  generateFRecord(totalPayers, totalPayees) {
    // IRS F Record format
    return 'F' + ''.padEnd(749, ' ');
  }

  /**
   * Get contractor 1099 history
   */
  async getContractor1099History(contractorId) {
    const query = `
      SELECT
        id, tax_year, form_type, total_amount,
        status, created_at, delivered_at, pdf_path
      FROM form_1099_records
      WHERE contractor_id = $1
      ORDER BY tax_year DESC, created_at DESC`;

    const result = await this.pool.query(query, [contractorId]);
    return result.rows;
  }

  /**
   * Get tax year summary
   */
  async getTaxYearSummary(taxYear) {
    const query = `
      SELECT
        form_type,
        COUNT(*) as form_count,
        SUM(total_amount) as total_reported,
        COUNT(*) FILTER (WHERE status = 'delivered') as delivered_count,
        COUNT(*) FILTER (WHERE status = 'filed') as filed_count
      FROM form_1099_records
      WHERE tax_year = $1
      GROUP BY form_type`;

    const result = await this.pool.query(query, [taxYear]);
    return result.rows;
  }
}

export default Form1099GenerationSystem;