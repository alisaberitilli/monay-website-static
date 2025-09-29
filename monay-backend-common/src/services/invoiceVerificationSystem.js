import EventEmitter from 'events';
import { Pool } from 'pg';
import crypto from 'crypto';

class InvoiceVerificationSystem extends EventEmitter {
  constructor() {
    super();
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL
    });

    // Verification methods
    this.verificationMethods = {
      OCR: 'ocr',
      MANUAL: 'manual',
      API: 'api',
      BLOCKCHAIN: 'blockchain',
      AI: 'ai',
      EMAIL: 'email'
    };

    // Document types
    this.documentTypes = {
      INVOICE: 'invoice',
      PURCHASE_ORDER: 'purchase_order',
      DELIVERY_NOTE: 'delivery_note',
      BILL_OF_LADING: 'bill_of_lading',
      PACKING_LIST: 'packing_list',
      CERTIFICATE_OF_ORIGIN: 'certificate_of_origin',
      INSURANCE_CERTIFICATE: 'insurance_certificate',
      INSPECTION_CERTIFICATE: 'inspection_certificate'
    };

    // Validation rules
    this.validationRules = {
      invoice: [
        'validate_invoice_number',
        'validate_dates',
        'validate_amounts',
        'validate_tax_calculation',
        'validate_parties',
        'check_duplicate'
      ],
      purchase_order: [
        'validate_po_number',
        'validate_line_items',
        'validate_pricing',
        'validate_delivery_terms'
      ],
      delivery: [
        'validate_delivery_address',
        'validate_quantities',
        'validate_signatures',
        'validate_timestamps'
      ]
    };

    // Fraud patterns
    this.fraudPatterns = {
      DUPLICATE_INVOICE: /duplicate/i,
      ROUND_NUMBER: /\d+000\.00$/,
      SUSPICIOUS_TIMING: /late_night|weekend/,
      HIGH_RISK_JURISDICTION: /high_risk/i,
      UNUSUAL_AMOUNT: /unusual/i
    };
  }

  /**
   * Verify invoice with multiple methods
   */
  async verifyInvoice(invoiceId, documents, options = {}) {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      // Get invoice details
      const invoiceQuery = `
        SELECT * FROM financing_invoices WHERE id = $1
      `;
      const invoiceResult = await client.query(invoiceQuery, [invoiceId]);

      if (invoiceResult.rows.length === 0) {
        throw new Error('Invoice not found');
      }

      const invoice = invoiceResult.rows[0];
      const verificationResults = [];

      // Process each document
      for (const document of documents) {
        const verificationResult = await this.processDocument(
          invoiceId,
          document,
          invoice,
          options,
          client
        );
        verificationResults.push(verificationResult);
      }

      // Calculate overall verification score
      const overallScore = this.calculateOverallScore(verificationResults);

      // Perform fraud checks
      const fraudCheckResult = await this.performFraudChecks(invoice, documents, client);

      // Perform duplicate checks
      const duplicateCheckResult = await this.checkForDuplicates(invoice, client);

      // Update invoice verification status
      const verificationStatus = this.determineVerificationStatus(
        overallScore,
        fraudCheckResult,
        duplicateCheckResult
      );

      await client.query(
        `UPDATE financing_invoices
         SET verification_status = $1,
             verification_date = CURRENT_TIMESTAMP,
             verification_score = $2,
             fraud_check_status = $3,
             duplicate_check_status = $4
         WHERE id = $5`,
        [
          verificationStatus,
          overallScore,
          fraudCheckResult.status,
          duplicateCheckResult.status,
          invoiceId
        ]
      );

      // Create verification audit trail
      await this.createAuditTrail(
        invoiceId,
        {
          verification_results: verificationResults,
          fraud_check: fraudCheckResult,
          duplicate_check: duplicateCheckResult,
          overall_score: overallScore,
          status: verificationStatus
        },
        client
      );

      await client.query('COMMIT');

      this.emit('verificationComplete', {
        invoiceId,
        status: verificationStatus,
        score: overallScore
      });

      return {
        success: true,
        invoiceId,
        verificationStatus,
        overallScore,
        details: {
          documents: verificationResults,
          fraudCheck: fraudCheckResult,
          duplicateCheck: duplicateCheckResult
        }
      };

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error verifying invoice:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Process individual document
   */
  async processDocument(invoiceId, document, invoice, options, client) {
    // Create verification record
    const verificationQuery = `
      INSERT INTO invoice_document_verification (
        invoice_id, document_type, document_url,
        verification_method, verification_status
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `;

    const verificationResult = await client.query(verificationQuery, [
      invoiceId,
      document.type,
      document.url || null,
      options.method || this.verificationMethods.AI,
      'processing'
    ]);

    const verificationId = verificationResult.rows[0].id;

    // Perform OCR extraction if document URL provided
    let extractedData = {};
    if (document.url) {
      extractedData = await this.performOCR(document.url);
    } else if (document.data) {
      extractedData = document.data;
    }

    // Validate extracted data
    const validationResults = await this.validateDocumentData(
      document.type,
      extractedData,
      invoice
    );

    // Check for discrepancies
    const discrepancies = await this.findDiscrepancies(
      document.type,
      extractedData,
      invoice
    );

    // Calculate confidence score
    const confidenceScore = this.calculateConfidenceScore(
      validationResults,
      discrepancies
    );

    // Update verification record
    await client.query(
      `UPDATE invoice_document_verification
       SET verification_status = $1,
           verification_date = CURRENT_TIMESTAMP,
           verified_by = $2,
           extracted_data = $3,
           confidence_score = $4,
           checks_performed = $5,
           discrepancies_found = $6
       WHERE id = $7`,
      [
        confidenceScore > 0.8 ? 'verified' : 'requires_review',
        options.verifiedBy || 'system',
        JSON.stringify(extractedData),
        confidenceScore,
        JSON.stringify(validationResults),
        JSON.stringify(discrepancies),
        verificationId
      ]
    );

    return {
      documentType: document.type,
      verificationId,
      confidenceScore,
      status: confidenceScore > 0.8 ? 'verified' : 'requires_review',
      validationResults,
      discrepancies
    };
  }

  /**
   * Perform OCR on document
   */
  async performOCR(documentUrl) {
    // Simulate OCR processing
    // In production, integrate with actual OCR service (AWS Textract, Google Vision, etc.)

    const simulatedData = {
      invoice_number: `INV-${Math.floor(Math.random() * 100000)}`,
      invoice_date: new Date().toISOString().split('T')[0],
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      vendor_name: 'Sample Vendor Inc.',
      vendor_address: '123 Business St, City, State 12345',
      customer_name: 'Sample Customer Corp.',
      customer_address: '456 Client Ave, Town, State 67890',
      line_items: [
        {
          description: 'Product/Service',
          quantity: 10,
          unit_price: 100,
          total: 1000
        }
      ],
      subtotal: 1000,
      tax_rate: 0.08,
      tax_amount: 80,
      total_amount: 1080,
      payment_terms: 'Net 30',
      bank_details: {
        account_number: '****1234',
        routing_number: '****5678'
      }
    };

    // Add random confidence scores for simulation
    const confidence = {
      overall: Math.random() * 0.3 + 0.7, // 0.7 to 1.0
      fields: {}
    };

    for (const key in simulatedData) {
      if (typeof simulatedData[key] !== 'object') {
        confidence.fields[key] = Math.random() * 0.3 + 0.7;
      }
    }

    return {
      extracted_data: simulatedData,
      confidence_scores: confidence,
      ocr_engine: 'simulated',
      processing_time: Math.random() * 2000 + 1000 // 1-3 seconds
    };
  }

  /**
   * Validate document data
   */
  async validateDocumentData(documentType, extractedData, invoice) {
    const results = [];
    const rules = this.validationRules[documentType] || this.validationRules.invoice;

    for (const rule of rules) {
      const result = await this.executeValidationRule(rule, extractedData, invoice);
      results.push(result);
    }

    return results;
  }

  /**
   * Execute validation rule
   */
  async executeValidationRule(rule, data, invoice) {
    const validationResult = {
      rule,
      passed: true,
      message: '',
      severity: 'info'
    };

    switch (rule) {
      case 'validate_invoice_number':
        if (!data.extracted_data?.invoice_number) {
          validationResult.passed = false;
          validationResult.message = 'Invoice number missing';
          validationResult.severity = 'high';
        }
        break;

      case 'validate_dates':
        const invoiceDate = new Date(data.extracted_data?.invoice_date);
        const dueDate = new Date(data.extracted_data?.due_date);

        if (invoiceDate > new Date()) {
          validationResult.passed = false;
          validationResult.message = 'Future-dated invoice';
          validationResult.severity = 'high';
        }

        if (dueDate < invoiceDate) {
          validationResult.passed = false;
          validationResult.message = 'Due date before invoice date';
          validationResult.severity = 'high';
        }
        break;

      case 'validate_amounts':
        const subtotal = parseFloat(data.extracted_data?.subtotal || 0);
        const tax = parseFloat(data.extracted_data?.tax_amount || 0);
        const total = parseFloat(data.extracted_data?.total_amount || 0);

        if (Math.abs((subtotal + tax) - total) > 0.01) {
          validationResult.passed = false;
          validationResult.message = 'Amount calculation mismatch';
          validationResult.severity = 'medium';
        }
        break;

      case 'validate_tax_calculation':
        const taxRate = parseFloat(data.extracted_data?.tax_rate || 0);
        const calculatedTax = parseFloat(data.extracted_data?.subtotal || 0) * taxRate;
        const declaredTax = parseFloat(data.extracted_data?.tax_amount || 0);

        if (Math.abs(calculatedTax - declaredTax) > 0.01) {
          validationResult.passed = false;
          validationResult.message = 'Tax calculation error';
          validationResult.severity = 'medium';
        }
        break;

      case 'check_duplicate':
        // Duplicate check handled separately
        break;

      default:
        validationResult.message = `Rule ${rule} executed`;
    }

    return validationResult;
  }

  /**
   * Find discrepancies between documents and invoice
   */
  async findDiscrepancies(documentType, extractedData, invoice) {
    const discrepancies = [];

    // Compare amounts
    if (extractedData.extracted_data?.total_amount) {
      const documentAmount = parseFloat(extractedData.extracted_data.total_amount);
      const invoiceAmount = parseFloat(invoice.invoice_amount);

      if (Math.abs(documentAmount - invoiceAmount) > 0.01) {
        discrepancies.push({
          field: 'amount',
          documentValue: documentAmount,
          invoiceValue: invoiceAmount,
          difference: Math.abs(documentAmount - invoiceAmount),
          severity: 'high'
        });
      }
    }

    // Compare dates
    if (extractedData.extracted_data?.due_date) {
      const documentDueDate = new Date(extractedData.extracted_data.due_date);
      const invoiceDueDate = new Date(invoice.due_date);

      if (documentDueDate.getTime() !== invoiceDueDate.getTime()) {
        discrepancies.push({
          field: 'due_date',
          documentValue: documentDueDate.toISOString().split('T')[0],
          invoiceValue: invoiceDueDate.toISOString().split('T')[0],
          severity: 'medium'
        });
      }
    }

    // Compare invoice numbers
    if (extractedData.extracted_data?.invoice_number) {
      if (extractedData.extracted_data.invoice_number !== invoice.invoice_number) {
        discrepancies.push({
          field: 'invoice_number',
          documentValue: extractedData.extracted_data.invoice_number,
          invoiceValue: invoice.invoice_number,
          severity: 'high'
        });
      }
    }

    return discrepancies;
  }

  /**
   * Perform fraud checks
   */
  async performFraudChecks(invoice, documents, client) {
    const fraudIndicators = [];
    let fraudScore = 0;

    // Check for round numbers
    const amount = parseFloat(invoice.invoice_amount);
    if (amount % 1000 === 0 && amount > 10000) {
      fraudIndicators.push({
        type: 'round_number',
        severity: 'low',
        description: 'Invoice amount is a round number'
      });
      fraudScore += 10;
    }

    // Check submission timing
    const submissionHour = new Date(invoice.created_at).getHours();
    const submissionDay = new Date(invoice.created_at).getDay();

    if (submissionHour < 6 || submissionHour > 22) {
      fraudIndicators.push({
        type: 'unusual_timing',
        severity: 'low',
        description: 'Submitted outside business hours'
      });
      fraudScore += 5;
    }

    if (submissionDay === 0 || submissionDay === 6) {
      fraudIndicators.push({
        type: 'weekend_submission',
        severity: 'low',
        description: 'Submitted on weekend'
      });
      fraudScore += 5;
    }

    // Check velocity
    const velocityCheck = await this.checkVelocity(invoice, client);
    if (velocityCheck.suspicious) {
      fraudIndicators.push({
        type: 'high_velocity',
        severity: 'high',
        description: velocityCheck.description
      });
      fraudScore += 30;
    }

    // Check for known patterns
    for (const [pattern, regex] of Object.entries(this.fraudPatterns)) {
      if (regex.test(JSON.stringify(invoice))) {
        fraudIndicators.push({
          type: pattern.toLowerCase(),
          severity: 'medium',
          description: `Pattern ${pattern} detected`
        });
        fraudScore += 15;
      }
    }

    return {
      status: fraudScore < 20 ? 'passed' : fraudScore < 50 ? 'review' : 'failed',
      score: fraudScore,
      indicators: fraudIndicators
    };
  }

  /**
   * Check submission velocity
   */
  async checkVelocity(invoice, client) {
    const velocityQuery = `
      SELECT COUNT(*) as count
      FROM financing_invoices
      WHERE seller_business_id = $1
      AND created_at > NOW() - INTERVAL '1 hour'
    `;

    const result = await client.query(velocityQuery, [invoice.seller_business_id]);
    const hourlyCount = parseInt(result.rows[0].count);

    if (hourlyCount > 5) {
      return {
        suspicious: true,
        description: `${hourlyCount} invoices submitted in last hour`
      };
    }

    // Check daily velocity
    const dailyQuery = `
      SELECT COUNT(*) as count
      FROM financing_invoices
      WHERE seller_business_id = $1
      AND created_at > NOW() - INTERVAL '24 hours'
    `;

    const dailyResult = await client.query(dailyQuery, [invoice.seller_business_id]);
    const dailyCount = parseInt(dailyResult.rows[0].count);

    if (dailyCount > 20) {
      return {
        suspicious: true,
        description: `${dailyCount} invoices submitted in last 24 hours`
      };
    }

    return { suspicious: false };
  }

  /**
   * Check for duplicate invoices
   */
  async checkForDuplicates(invoice, client) {
    // Check exact duplicates
    const exactDuplicateQuery = `
      SELECT id, invoice_number, created_at
      FROM financing_invoices
      WHERE seller_business_id = $1
      AND invoice_number = $2
      AND id != $3
    `;

    const exactResult = await client.query(exactDuplicateQuery, [
      invoice.seller_business_id,
      invoice.invoice_number,
      invoice.id
    ]);

    if (exactResult.rows.length > 0) {
      return {
        status: 'duplicate_found',
        type: 'exact',
        duplicates: exactResult.rows
      };
    }

    // Check fuzzy duplicates (similar amount and date)
    const fuzzyQuery = `
      SELECT id, invoice_number, invoice_amount, invoice_date
      FROM financing_invoices
      WHERE seller_business_id = $1
      AND buyer_business_id = $2
      AND ABS(invoice_amount - $3) < 1
      AND ABS(EXTRACT(EPOCH FROM (invoice_date - $4::date))) < 86400
      AND id != $5
    `;

    const fuzzyResult = await client.query(fuzzyQuery, [
      invoice.seller_business_id,
      invoice.buyer_business_id,
      invoice.invoice_amount,
      invoice.invoice_date,
      invoice.id
    ]);

    if (fuzzyResult.rows.length > 0) {
      return {
        status: 'potential_duplicate',
        type: 'fuzzy',
        duplicates: fuzzyResult.rows
      };
    }

    return {
      status: 'no_duplicates',
      type: 'none',
      duplicates: []
    };
  }

  /**
   * Calculate overall verification score
   */
  calculateOverallScore(verificationResults) {
    if (verificationResults.length === 0) return 0;

    let totalScore = 0;
    let totalWeight = 0;

    for (const result of verificationResults) {
      const weight = this.getDocumentWeight(result.documentType);
      totalScore += result.confidenceScore * weight;
      totalWeight += weight;
    }

    return totalWeight > 0 ? totalScore / totalWeight : 0;
  }

  /**
   * Get document weight for scoring
   */
  getDocumentWeight(documentType) {
    const weights = {
      [this.documentTypes.INVOICE]: 1.0,
      [this.documentTypes.PURCHASE_ORDER]: 0.8,
      [this.documentTypes.DELIVERY_NOTE]: 0.6,
      [this.documentTypes.BILL_OF_LADING]: 0.7,
      [this.documentTypes.PACKING_LIST]: 0.5,
      [this.documentTypes.CERTIFICATE_OF_ORIGIN]: 0.6,
      [this.documentTypes.INSURANCE_CERTIFICATE]: 0.5,
      [this.documentTypes.INSPECTION_CERTIFICATE]: 0.5
    };

    return weights[documentType] || 0.5;
  }

  /**
   * Calculate confidence score
   */
  calculateConfidenceScore(validationResults, discrepancies) {
    let score = 1.0;

    // Deduct for validation failures
    for (const result of validationResults) {
      if (!result.passed) {
        if (result.severity === 'high') score -= 0.3;
        else if (result.severity === 'medium') score -= 0.15;
        else score -= 0.05;
      }
    }

    // Deduct for discrepancies
    for (const discrepancy of discrepancies) {
      if (discrepancy.severity === 'high') score -= 0.25;
      else if (discrepancy.severity === 'medium') score -= 0.1;
      else score -= 0.05;
    }

    return Math.max(0, Math.min(1, score));
  }

  /**
   * Determine verification status
   */
  determineVerificationStatus(score, fraudCheck, duplicateCheck) {
    if (fraudCheck.status === 'failed' || duplicateCheck.status === 'duplicate_found') {
      return 'rejected';
    }

    if (score < 0.5) {
      return 'rejected';
    }

    if (score < 0.8 ||
        fraudCheck.status === 'review' ||
        duplicateCheck.status === 'potential_duplicate') {
      return 'manual_review';
    }

    return 'verified';
  }

  /**
   * Create audit trail
   */
  async createAuditTrail(invoiceId, verificationData, client) {
    const auditQuery = `
      INSERT INTO invoice_risk_assessments (
        invoice_id, assessment_date,
        overall_risk_score,
        duplicate_invoice_check,
        unusual_pattern_detected,
        velocity_check_passed,
        recommendation,
        metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `;

    const riskScore = (1 - verificationData.overall_score) * 100;
    const recommendation = verificationData.status === 'verified' ? 'approve' :
                          verificationData.status === 'manual_review' ? 'manual_review' :
                          'decline';

    await client.query(auditQuery, [
      invoiceId,
      new Date(),
      riskScore,
      verificationData.duplicate_check.status === 'no_duplicates',
      verificationData.fraud_check.indicators.length > 0,
      verificationData.fraud_check.score < 50,
      recommendation,
      JSON.stringify(verificationData)
    ]);
  }

  /**
   * Manual verification override
   */
  async manualVerificationOverride(invoiceId, overrideData) {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      // Update invoice status
      await client.query(
        `UPDATE financing_invoices
         SET verification_status = $1,
             verification_date = CURRENT_TIMESTAMP,
             metadata = jsonb_set(metadata, '{manual_override}', $2::jsonb)
         WHERE id = $3`,
        [
          overrideData.status,
          JSON.stringify({
            overridden_by: overrideData.userId,
            reason: overrideData.reason,
            timestamp: new Date()
          }),
          invoiceId
        ]
      );

      // Create audit record
      await this.createAuditTrail(
        invoiceId,
        {
          type: 'manual_override',
          ...overrideData
        },
        client
      );

      await client.query('COMMIT');

      this.emit('manualOverride', {
        invoiceId,
        status: overrideData.status,
        userId: overrideData.userId
      });

      return {
        success: true,
        invoiceId,
        newStatus: overrideData.status
      };

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error in manual override:', error);
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

export default InvoiceVerificationSystem;