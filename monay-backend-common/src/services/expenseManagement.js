import { Pool } from 'pg';
import crypto from 'crypto';
import EventEmitter from 'events';

class ExpenseManagementSystem extends EventEmitter {
  constructor(dbConfig) {
    super();
    this.pool = new Pool(dbConfig);

    // Expense categories
    this.expenseCategories = {
      TRAVEL: 'travel',
      MEALS: 'meals',
      SUPPLIES: 'supplies',
      EQUIPMENT: 'equipment',
      SOFTWARE: 'software',
      MARKETING: 'marketing',
      UTILITIES: 'utilities',
      INSURANCE: 'insurance',
      VEHICLE: 'vehicle',
      HOME_OFFICE: 'home_office',
      PROFESSIONAL_SERVICES: 'professional_services',
      EDUCATION: 'education',
      HEALTHCARE: 'healthcare',
      COMMUNICATION: 'communication',
      OTHER: 'other'
    };

    // Expense statuses
    this.expenseStatus = {
      DRAFT: 'draft',
      SUBMITTED: 'submitted',
      PENDING_APPROVAL: 'pending_approval',
      APPROVED: 'approved',
      REJECTED: 'rejected',
      REIMBURSED: 'reimbursed',
      ARCHIVED: 'archived'
    };

    // Receipt types
    this.receiptTypes = {
      IMAGE: 'image',
      PDF: 'pdf',
      EMAIL: 'email',
      DIGITAL: 'digital',
      MANUAL: 'manual'
    };

    // IRS mileage rates for 2025
    this.mileageRates = {
      business: 0.67, // 67 cents per mile
      medical: 0.21, // 21 cents per mile
      charity: 0.14, // 14 cents per mile
      moving: 0.21 // 21 cents per mile
    };

    // Deduction types
    this.deductionTypes = {
      STANDARD: 'standard',
      ITEMIZED: 'itemized',
      BUSINESS: 'business',
      PARTIAL: 'partial'
    };

    // Tax categories
    this.taxCategories = {
      DEDUCTIBLE_100: 'deductible_100',
      DEDUCTIBLE_50: 'deductible_50',
      DEDUCTIBLE_0: 'non_deductible',
      CAPITAL: 'capital',
      DEPRECIABLE: 'depreciable'
    };
  }

  /**
   * Create expense entry
   */
  async createExpense(contractorId, expenseData) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // Validate expense data
      await this.validateExpenseData(expenseData);

      // Calculate tax deductions
      const taxInfo = this.calculateTaxDeduction(expenseData);

      // Create expense record
      const query = `
        INSERT INTO contractor_expenses (
          contractor_id, category, subcategory, amount,
          merchant_name, description, expense_date,
          payment_method, receipt_type, receipt_url,
          location, tags, project_id, client_id,
          is_billable, is_reimbursable, tax_category,
          deduction_percentage, deductible_amount,
          currency, exchange_rate, original_amount,
          status, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
          $11, $12, $13, $14, $15, $16, $17, $18, $19,
          $20, $21, $22, $23, NOW(), NOW()
        ) RETURNING id`;

      const result = await client.query(query, [
        contractorId,
        expenseData.category,
        expenseData.subcategory,
        expenseData.amount,
        expenseData.merchantName,
        expenseData.description,
        expenseData.expenseDate,
        expenseData.paymentMethod,
        expenseData.receiptType || this.receiptTypes.MANUAL,
        expenseData.receiptUrl,
        expenseData.location,
        JSON.stringify(expenseData.tags || []),
        expenseData.projectId,
        expenseData.clientId,
        expenseData.isBillable || false,
        expenseData.isReimbursable || false,
        taxInfo.category,
        taxInfo.deductionPercentage,
        taxInfo.deductibleAmount,
        expenseData.currency || 'USD',
        expenseData.exchangeRate || 1,
        expenseData.originalAmount || expenseData.amount,
        this.expenseStatus.DRAFT
      ]);

      const expenseId = result.rows[0].id;

      // Process receipt if provided
      if (expenseData.receipt) {
        await this.processReceipt(client, expenseId, expenseData.receipt);
      }

      // Link to project if applicable
      if (expenseData.projectId) {
        await this.linkToProject(client, expenseId, expenseData.projectId);
      }

      await client.query('COMMIT');

      this.emit('expense:created', { expenseId, contractorId, amount: expenseData.amount });

      return {
        success: true,
        expenseId,
        taxInfo,
        message: 'Expense created successfully'
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Submit expense for approval
   */
  async submitExpense(expenseId, submissionData = {}) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // Get expense details
      const expenseQuery = `
        SELECT * FROM contractor_expenses WHERE id = $1`;
      const expenseResult = await client.query(expenseQuery, [expenseId]);

      if (expenseResult.rows.length === 0) {
        throw new Error('Expense not found');
      }

      const expense = expenseResult.rows[0];

      if (expense.status !== this.expenseStatus.DRAFT) {
        throw new Error(`Cannot submit expense with status: ${expense.status}`);
      }

      // Validate receipt is attached
      if (!expense.receipt_url && !submissionData.skipReceiptValidation) {
        throw new Error('Receipt required for submission');
      }

      // Update status
      await client.query(
        `UPDATE contractor_expenses
         SET status = $1, submitted_at = NOW(), updated_at = NOW()
         WHERE id = $2`,
        [this.expenseStatus.SUBMITTED, expenseId]
      );

      // Create approval request if needed
      if (expense.is_reimbursable || expense.amount > 500) {
        await this.createApprovalRequest(client, expenseId);
      } else {
        // Auto-approve small, non-reimbursable expenses
        await this.approveExpense(client, expenseId, 'auto');
      }

      await client.query('COMMIT');

      this.emit('expense:submitted', { expenseId, amount: expense.amount });

      return { success: true, message: 'Expense submitted successfully' };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Create mileage expense
   */
  async createMileageExpense(contractorId, mileageData) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // Calculate mileage amount
      const rate = this.mileageRates[mileageData.purpose] || this.mileageRates.business;
      const amount = mileageData.miles * rate;

      // Create mileage record
      const mileageQuery = `
        INSERT INTO contractor_mileage (
          contractor_id, trip_date, start_location, end_location,
          start_odometer, end_odometer, miles, purpose,
          rate_per_mile, total_amount, vehicle_id,
          notes, project_id, client_id,
          created_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
          $11, $12, $13, $14, NOW()
        ) RETURNING id`;

      const mileageResult = await client.query(mileageQuery, [
        contractorId,
        mileageData.tripDate,
        mileageData.startLocation,
        mileageData.endLocation,
        mileageData.startOdometer,
        mileageData.endOdometer,
        mileageData.miles,
        mileageData.purpose || 'business',
        rate,
        amount,
        mileageData.vehicleId,
        mileageData.notes,
        mileageData.projectId,
        mileageData.clientId
      ]);

      // Create corresponding expense entry
      const expenseData = {
        category: this.expenseCategories.VEHICLE,
        subcategory: 'mileage',
        amount,
        description: `Mileage: ${mileageData.startLocation} to ${mileageData.endLocation}`,
        expenseDate: mileageData.tripDate,
        paymentMethod: 'mileage',
        projectId: mileageData.projectId,
        clientId: mileageData.clientId,
        isBillable: mileageData.isBillable,
        isReimbursable: mileageData.isReimbursable
      };

      const expense = await this.createExpense(contractorId, expenseData);

      // Link mileage to expense
      await client.query(
        'UPDATE contractor_mileage SET expense_id = $1 WHERE id = $2',
        [expense.expenseId, mileageResult.rows[0].id]
      );

      await client.query('COMMIT');

      return {
        success: true,
        mileageId: mileageResult.rows[0].id,
        expenseId: expense.expenseId,
        amount,
        message: `Mileage expense created: ${mileageData.miles} miles @ $${rate}/mile = $${amount.toFixed(2)}`
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Process receipt
   */
  async processReceipt(client, expenseId, receiptData) {
    // OCR processing for receipt data extraction
    const ocrData = await this.performOCR(receiptData);

    const query = `
      INSERT INTO expense_receipts (
        expense_id, receipt_type, receipt_url, receipt_data,
        merchant_name, amount, date, items,
        ocr_confidence, processed_at, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())`;

    await client.query(query, [
      expenseId,
      receiptData.type,
      receiptData.url,
      JSON.stringify(receiptData),
      ocrData.merchantName,
      ocrData.amount,
      ocrData.date,
      JSON.stringify(ocrData.items || []),
      ocrData.confidence
    ]);

    // Update expense with OCR data if confidence is high
    if (ocrData.confidence > 0.8) {
      await client.query(
        `UPDATE contractor_expenses
         SET merchant_name = COALESCE(merchant_name, $1),
             amount = COALESCE($2, amount),
             expense_date = COALESCE($3, expense_date)
         WHERE id = $4`,
        [ocrData.merchantName, ocrData.amount, ocrData.date, expenseId]
      );
    }
  }

  /**
   * Perform OCR on receipt
   */
  async performOCR(receiptData) {
    // Simulate OCR processing
    // In production, integrate with OCR service like Google Vision, AWS Textract
    return {
      merchantName: receiptData.merchantName || 'Unknown Merchant',
      amount: receiptData.amount || 0,
      date: receiptData.date || new Date(),
      items: [],
      confidence: 0.85
    };
  }

  /**
   * Calculate tax deduction
   */
  calculateTaxDeduction(expenseData) {
    let category = this.taxCategories.DEDUCTIBLE_100;
    let deductionPercentage = 100;

    // Apply IRS rules for different expense types
    switch (expenseData.category) {
      case this.expenseCategories.MEALS:
        // Meals are typically 50% deductible
        if (!expenseData.isEntertainment) {
          category = this.taxCategories.DEDUCTIBLE_50;
          deductionPercentage = 50;
        }
        break;

      case this.expenseCategories.HOME_OFFICE:
        // Home office requires specific calculation
        if (expenseData.businessUsePercentage) {
          deductionPercentage = expenseData.businessUsePercentage;
          category = this.taxCategories.PARTIAL;
        }
        break;

      case this.expenseCategories.VEHICLE:
        // Vehicle expenses depend on business use
        if (expenseData.businessUsePercentage) {
          deductionPercentage = expenseData.businessUsePercentage;
        }
        break;

      case this.expenseCategories.EQUIPMENT:
        // Equipment may be capital or depreciable
        if (expenseData.amount > 2500) {
          category = this.taxCategories.DEPRECIABLE;
        }
        break;

      case this.expenseCategories.PROFESSIONAL_SERVICES:
      case this.expenseCategories.SOFTWARE:
      case this.expenseCategories.UTILITIES:
      case this.expenseCategories.INSURANCE:
      case this.expenseCategories.MARKETING:
      case this.expenseCategories.EDUCATION:
      case this.expenseCategories.SUPPLIES:
        // Generally 100% deductible
        category = this.taxCategories.DEDUCTIBLE_100;
        deductionPercentage = 100;
        break;

      default:
        // Default to 100% deductible
        break;
    }

    const deductibleAmount = (expenseData.amount * deductionPercentage) / 100;

    return {
      category,
      deductionPercentage,
      deductibleAmount
    };
  }

  /**
   * Create expense report
   */
  async createExpenseReport(contractorId, reportData) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // Create report
      const reportQuery = `
        INSERT INTO expense_reports (
          contractor_id, report_name, report_period_start,
          report_period_end, total_amount, total_expenses,
          status, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
        RETURNING id`;

      // Get expenses for period
      const expensesQuery = `
        SELECT * FROM contractor_expenses
        WHERE contractor_id = $1
        AND expense_date >= $2
        AND expense_date <= $3
        AND status IN ('approved', 'reimbursed')`;

      const expenses = await client.query(expensesQuery, [
        contractorId,
        reportData.periodStart,
        reportData.periodEnd
      ]);

      const totalAmount = expenses.rows.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);

      const reportResult = await client.query(reportQuery, [
        contractorId,
        reportData.name || `Expense Report ${new Date().toISOString().split('T')[0]}`,
        reportData.periodStart,
        reportData.periodEnd,
        totalAmount,
        expenses.rows.length,
        'draft'
      ]);

      const reportId = reportResult.rows[0].id;

      // Link expenses to report
      if (expenses.rows.length > 0) {
        const linkQuery = `
          UPDATE contractor_expenses
          SET report_id = $1
          WHERE id = ANY($2::int[])`;

        await client.query(linkQuery, [
          reportId,
          expenses.rows.map(e => e.id)
        ]);
      }

      // Generate report summary
      const summary = await this.generateReportSummary(client, reportId);

      await client.query('COMMIT');

      return {
        success: true,
        reportId,
        totalAmount,
        expenseCount: expenses.rows.length,
        summary
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Generate report summary
   */
  async generateReportSummary(client, reportId) {
    const summaryQuery = `
      SELECT
        category,
        COUNT(*) as count,
        SUM(amount) as total,
        SUM(deductible_amount) as deductible,
        AVG(amount) as average
      FROM contractor_expenses
      WHERE report_id = $1
      GROUP BY category
      ORDER BY total DESC`;

    const result = await client.query(summaryQuery, [reportId]);

    return {
      byCategory: result.rows,
      totalDeductible: result.rows.reduce((sum, cat) => sum + parseFloat(cat.deductible), 0)
    };
  }

  /**
   * Generate tax summary
   */
  async generateTaxSummary(contractorId, taxYear) {
    const query = `
      SELECT
        e.category,
        e.tax_category,
        COUNT(*) as expense_count,
        SUM(e.amount) as total_amount,
        SUM(e.deductible_amount) as deductible_amount,
        SUM(CASE WHEN e.tax_category = 'deductible_100' THEN e.amount ELSE 0 END) as fully_deductible,
        SUM(CASE WHEN e.tax_category = 'deductible_50' THEN e.amount ELSE 0 END) as partially_deductible,
        SUM(CASE WHEN e.tax_category = 'non_deductible' THEN e.amount ELSE 0 END) as non_deductible,
        SUM(CASE WHEN e.tax_category = 'capital' THEN e.amount ELSE 0 END) as capital,
        SUM(CASE WHEN e.tax_category = 'depreciable' THEN e.amount ELSE 0 END) as depreciable
      FROM contractor_expenses e
      WHERE e.contractor_id = $1
      AND EXTRACT(YEAR FROM e.expense_date) = $2
      AND e.status IN ('approved', 'reimbursed')
      GROUP BY e.category, e.tax_category`;

    const result = await this.pool.query(query, [contractorId, taxYear]);

    // Calculate quarterly estimates
    const quarterlyQuery = `
      SELECT
        EXTRACT(QUARTER FROM expense_date) as quarter,
        SUM(amount) as total,
        SUM(deductible_amount) as deductible
      FROM contractor_expenses
      WHERE contractor_id = $1
      AND EXTRACT(YEAR FROM expense_date) = $2
      AND status IN ('approved', 'reimbursed')
      GROUP BY EXTRACT(QUARTER FROM expense_date)
      ORDER BY quarter`;

    const quarterlyResult = await this.pool.query(quarterlyQuery, [contractorId, taxYear]);

    // Get mileage deduction
    const mileageQuery = `
      SELECT
        SUM(miles) as total_miles,
        SUM(total_amount) as mileage_deduction
      FROM contractor_mileage
      WHERE contractor_id = $1
      AND EXTRACT(YEAR FROM trip_date) = $2`;

    const mileageResult = await this.pool.query(mileageQuery, [contractorId, taxYear]);

    return {
      taxYear,
      categories: result.rows,
      quarterly: quarterlyResult.rows,
      mileage: mileageResult.rows[0],
      totalDeductible: result.rows.reduce((sum, cat) => sum + parseFloat(cat.deductible_amount), 0),
      schedule_c_categories: this.mapToScheduleC(result.rows)
    };
  }

  /**
   * Map expenses to Schedule C categories
   */
  mapToScheduleC(expenses) {
    const scheduleC = {
      line8_advertising: 0,
      line9_car_truck: 0,
      line10_commissions_fees: 0,
      line11_contract_labor: 0,
      line12_depletion: 0,
      line13_depreciation: 0,
      line14_employee_benefit: 0,
      line15_insurance: 0,
      line16_interest: 0,
      line17_legal_professional: 0,
      line18_office: 0,
      line19_pension_profit_sharing: 0,
      line20_rent_lease: 0,
      line21_repairs_maintenance: 0,
      line22_supplies: 0,
      line23_taxes_licenses: 0,
      line24_travel_meals: 0,
      line25_utilities: 0,
      line26_wages: 0,
      line27_other: 0
    };

    // Map categories to Schedule C lines
    expenses.forEach(exp => {
      switch (exp.category) {
        case this.expenseCategories.MARKETING:
          scheduleC.line8_advertising += parseFloat(exp.deductible_amount);
          break;
        case this.expenseCategories.VEHICLE:
          scheduleC.line9_car_truck += parseFloat(exp.deductible_amount);
          break;
        case this.expenseCategories.PROFESSIONAL_SERVICES:
          scheduleC.line17_legal_professional += parseFloat(exp.deductible_amount);
          break;
        case this.expenseCategories.INSURANCE:
          scheduleC.line15_insurance += parseFloat(exp.deductible_amount);
          break;
        case this.expenseCategories.SUPPLIES:
          scheduleC.line22_supplies += parseFloat(exp.deductible_amount);
          break;
        case this.expenseCategories.TRAVEL:
        case this.expenseCategories.MEALS:
          scheduleC.line24_travel_meals += parseFloat(exp.deductible_amount);
          break;
        case this.expenseCategories.UTILITIES:
          scheduleC.line25_utilities += parseFloat(exp.deductible_amount);
          break;
        case this.expenseCategories.HOME_OFFICE:
          scheduleC.line18_office += parseFloat(exp.deductible_amount);
          break;
        default:
          scheduleC.line27_other += parseFloat(exp.deductible_amount);
          break;
      }
    });

    return scheduleC;
  }

  /**
   * Process reimbursement
   */
  async processReimbursement(expenseIds, reimbursementData) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // Create reimbursement record
      const reimbursementQuery = `
        INSERT INTO expense_reimbursements (
          expense_ids, total_amount, payment_method,
          payment_reference, processed_by, notes,
          status, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
        RETURNING id`;

      // Calculate total amount
      const amountQuery = `
        SELECT SUM(amount) as total
        FROM contractor_expenses
        WHERE id = ANY($1::int[])
        AND status = 'approved'
        AND is_reimbursable = true`;

      const amountResult = await client.query(amountQuery, [expenseIds]);
      const totalAmount = amountResult.rows[0].total;

      if (!totalAmount || totalAmount <= 0) {
        throw new Error('No reimbursable expenses found');
      }

      const reimbursementResult = await client.query(reimbursementQuery, [
        expenseIds,
        totalAmount,
        reimbursementData.paymentMethod,
        reimbursementData.paymentReference,
        reimbursementData.processedBy,
        reimbursementData.notes,
        'processing'
      ]);

      const reimbursementId = reimbursementResult.rows[0].id;

      // Update expense statuses
      await client.query(
        `UPDATE contractor_expenses
         SET status = $1, reimbursement_id = $2, reimbursed_at = NOW()
         WHERE id = ANY($3::int[])`,
        [this.expenseStatus.REIMBURSED, reimbursementId, expenseIds]
      );

      // Process payment
      await this.processReimbursementPayment(client, reimbursementId, totalAmount);

      await client.query('COMMIT');

      this.emit('reimbursement:processed', {
        reimbursementId,
        amount: totalAmount,
        expenseCount: expenseIds.length
      });

      return {
        success: true,
        reimbursementId,
        amount: totalAmount,
        message: `Reimbursement of $${totalAmount.toFixed(2)} processed successfully`
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Process reimbursement payment
   */
  async processReimbursementPayment(client, reimbursementId, amount) {
    // Integration with payment processor
    // This would connect to actual payment API
    const paymentReference = 'REIMB-' + crypto.randomBytes(8).toString('hex').toUpperCase();

    await client.query(
      `UPDATE expense_reimbursements
       SET status = 'completed', payment_reference = $1, completed_at = NOW()
       WHERE id = $2`,
      [paymentReference, reimbursementId]
    );

    return paymentReference;
  }

  /**
   * Helper methods
   */
  async validateExpenseData(expenseData) {
    if (!expenseData.amount || expenseData.amount <= 0) {
      throw new Error('Invalid expense amount');
    }

    if (!expenseData.category) {
      throw new Error('Expense category required');
    }

    if (!expenseData.expenseDate) {
      throw new Error('Expense date required');
    }

    // Don't allow future expenses beyond 30 days
    const futureLimit = new Date();
    futureLimit.setDate(futureLimit.getDate() + 30);
    if (new Date(expenseData.expenseDate) > futureLimit) {
      throw new Error('Expense date cannot be more than 30 days in the future');
    }
  }

  async linkToProject(client, expenseId, projectId) {
    await client.query(
      'UPDATE contractor_expenses SET project_id = $1 WHERE id = $2',
      [projectId, expenseId]
    );
  }

  async createApprovalRequest(client, expenseId) {
    const query = `
      INSERT INTO expense_approvals (
        expense_id, requested_at, status
      ) VALUES ($1, NOW(), 'pending')`;

    await client.query(query, [expenseId]);

    this.emit('approval:requested', { expenseId });
  }

  async approveExpense(client, expenseId, approvedBy) {
    await client.query(
      `UPDATE contractor_expenses
       SET status = $1, approved_at = NOW(), approved_by = $2
       WHERE id = $3`,
      [this.expenseStatus.APPROVED, approvedBy, expenseId]
    );
  }

  /**
   * Get expense analytics
   */
  async getExpenseAnalytics(contractorId, period = 'month') {
    const intervals = {
      day: '1 day',
      week: '7 days',
      month: '30 days',
      quarter: '90 days',
      year: '365 days'
    };

    const interval = intervals[period] || intervals.month;

    const query = `
      SELECT
        category,
        COUNT(*) as count,
        SUM(amount) as total,
        AVG(amount) as average,
        MAX(amount) as maximum,
        MIN(amount) as minimum
      FROM contractor_expenses
      WHERE contractor_id = $1
      AND expense_date >= NOW() - INTERVAL '${interval}'
      AND status IN ('approved', 'reimbursed')
      GROUP BY category
      ORDER BY total DESC`;

    const result = await this.pool.query(query, [contractorId]);
    return result.rows;
  }

  /**
   * Export expenses
   */
  async exportExpenses(contractorId, format = 'csv', filters = {}) {
    let query = `
      SELECT
        e.*,
        r.report_name,
        m.miles,
        m.rate_per_mile
      FROM contractor_expenses e
      LEFT JOIN expense_reports r ON e.report_id = r.id
      LEFT JOIN contractor_mileage m ON m.expense_id = e.id
      WHERE e.contractor_id = $1`;

    const params = [contractorId];
    let paramIndex = 2;

    if (filters.startDate) {
      query += ` AND e.expense_date >= $${paramIndex}`;
      params.push(filters.startDate);
      paramIndex++;
    }

    if (filters.endDate) {
      query += ` AND e.expense_date <= $${paramIndex}`;
      params.push(filters.endDate);
      paramIndex++;
    }

    if (filters.category) {
      query += ` AND e.category = $${paramIndex}`;
      params.push(filters.category);
      paramIndex++;
    }

    query += ` ORDER BY e.expense_date DESC`;

    const result = await this.pool.query(query, params);

    // Format based on export type
    if (format === 'csv') {
      return this.formatAsCSV(result.rows);
    } else if (format === 'pdf') {
      return this.formatAsPDF(result.rows);
    } else {
      return result.rows;
    }
  }

  formatAsCSV(expenses) {
    // CSV formatting logic
    const headers = ['Date', 'Category', 'Amount', 'Merchant', 'Description', 'Tax Category', 'Deductible'];
    const rows = expenses.map(e => [
      e.expense_date,
      e.category,
      e.amount,
      e.merchant_name,
      e.description,
      e.tax_category,
      e.deductible_amount
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  formatAsPDF(expenses) {
    // PDF generation would be implemented here
    return { format: 'pdf', data: expenses };
  }
}

export default ExpenseManagementSystem;