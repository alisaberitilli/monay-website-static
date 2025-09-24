const EventEmitter = require('events');
const axios = require('axios');
const crypto = require('crypto');
const { Pool } = require('pg');

class SageBusinessConnector extends EventEmitter {
  constructor(config = {}) {
    super();
    this.config = {
      clientId: process.env.SAGE_CLIENT_ID || config.clientId,
      clientSecret: process.env.SAGE_CLIENT_SECRET || config.clientSecret,
      redirectUri: process.env.SAGE_REDIRECT_URI || config.redirectUri,
      environment: process.env.SAGE_ENVIRONMENT || config.environment || 'production',
      apiVersion: 'v3.1',
      region: config.region || 'US', // US, CA, UK, FR, ES, DE
      syncInterval: config.syncInterval || 3600000, // 1 hour
      batchSize: config.batchSize || 200,
      encryptionKey: process.env.SAGE_ENCRYPTION_KEY || config.encryptionKey,
      ...config
    };

    // Region-specific endpoints
    this.endpoints = {
      US: 'https://api.accounting.sage.com',
      CA: 'https://api.accounting.sage.com',
      UK: 'https://api.accounting.sage.com',
      FR: 'https://api.comptabilite.sage.com',
      ES: 'https://api.contabilidad.sage.com',
      DE: 'https://api.buchhaltung.sage.com'
    };

    this.baseUrl = this.endpoints[this.config.region];
    this.authUrl = 'https://www.sageone.com/oauth2/auth';
    this.tokenUrl = 'https://oauth.accounting.sage.com/token';

    this.db = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgresql://localhost/monay'
    });

    this.connections = new Map();
    this.syncQueues = new Map();
    this.integrationModules = new Map();
    this.complianceRules = new Map();

    this.initialize();
  }

  async initialize() {
    try {
      await this.createDatabaseSchema();
      await this.loadConnections();
      await this.initializeModules();
      await this.startScheduler();

      this.emit('initialized', {
        timestamp: new Date(),
        connections: this.connections.size,
        modules: this.integrationModules.size
      });
    } catch (error) {
      this.emit('error', { error, context: 'initialization' });
    }
  }

  async createDatabaseSchema() {
    const queries = [
      `CREATE TABLE IF NOT EXISTS sage_connections (
        id SERIAL PRIMARY KEY,
        account_id VARCHAR(255) UNIQUE NOT NULL,
        company_id VARCHAR(255),
        company_name VARCHAR(255),
        access_token TEXT,
        refresh_token TEXT,
        token_expiry TIMESTAMP,
        subscription_type VARCHAR(50),
        region VARCHAR(10),
        features JSONB DEFAULT '{}',
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      `CREATE TABLE IF NOT EXISTS sage_entities (
        id SERIAL PRIMARY KEY,
        account_id VARCHAR(255) NOT NULL,
        entity_type VARCHAR(50) NOT NULL,
        sage_id VARCHAR(255) NOT NULL,
        data JSONB NOT NULL,
        attachments JSONB DEFAULT '[]',
        audit_trail JSONB DEFAULT '[]',
        synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        version INTEGER DEFAULT 1,
        UNIQUE(account_id, entity_type, sage_id),
        FOREIGN KEY (account_id) REFERENCES sage_connections(account_id)
      )`,

      `CREATE TABLE IF NOT EXISTS sage_sync_queue (
        id SERIAL PRIMARY KEY,
        account_id VARCHAR(255) NOT NULL,
        entity_type VARCHAR(50) NOT NULL,
        operation VARCHAR(20) NOT NULL,
        data JSONB NOT NULL,
        priority INTEGER DEFAULT 5,
        status VARCHAR(20) DEFAULT 'pending',
        attempts INTEGER DEFAULT 0,
        max_attempts INTEGER DEFAULT 3,
        error_message TEXT,
        scheduled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        processed_at TIMESTAMP,
        FOREIGN KEY (account_id) REFERENCES sage_connections(account_id)
      )`,

      `CREATE TABLE IF NOT EXISTS sage_ledger_accounts (
        id SERIAL PRIMARY KEY,
        account_id VARCHAR(255) NOT NULL,
        ledger_account_id VARCHAR(255) NOT NULL,
        display_id VARCHAR(50),
        nominal_code INTEGER,
        name VARCHAR(255),
        account_type VARCHAR(50),
        category VARCHAR(100),
        tax_rate_id VARCHAR(255),
        is_control BOOLEAN DEFAULT false,
        is_active BOOLEAN DEFAULT true,
        balance DECIMAL(15,2),
        currency_code VARCHAR(3),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (account_id) REFERENCES sage_connections(account_id)
      )`,

      `CREATE TABLE IF NOT EXISTS sage_journal_entries (
        id SERIAL PRIMARY KEY,
        account_id VARCHAR(255) NOT NULL,
        journal_id VARCHAR(255) NOT NULL,
        reference VARCHAR(100),
        date DATE NOT NULL,
        description TEXT,
        total_amount DECIMAL(15,2),
        currency_code VARCHAR(3),
        journal_lines JSONB NOT NULL,
        attachments JSONB DEFAULT '[]',
        posted BOOLEAN DEFAULT false,
        created_by VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (account_id) REFERENCES sage_connections(account_id)
      )`,

      `CREATE TABLE IF NOT EXISTS sage_bank_reconciliations (
        id SERIAL PRIMARY KEY,
        account_id VARCHAR(255) NOT NULL,
        bank_account_id VARCHAR(255) NOT NULL,
        statement_date DATE NOT NULL,
        statement_balance DECIMAL(15,2),
        reconciled_balance DECIMAL(15,2),
        difference DECIMAL(15,2),
        status VARCHAR(20),
        reconciled_items JSONB DEFAULT '[]',
        outstanding_items JSONB DEFAULT '[]',
        reconciled_by VARCHAR(255),
        reconciled_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (account_id) REFERENCES sage_connections(account_id)
      )`,

      `CREATE TABLE IF NOT EXISTS sage_tax_returns (
        id SERIAL PRIMARY KEY,
        account_id VARCHAR(255) NOT NULL,
        return_id VARCHAR(255) NOT NULL,
        tax_type VARCHAR(50),
        period_start DATE,
        period_end DATE,
        status VARCHAR(20),
        total_sales DECIMAL(15,2),
        total_purchases DECIMAL(15,2),
        tax_due DECIMAL(15,2),
        submission_date DATE,
        reference_number VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (account_id) REFERENCES sage_connections(account_id)
      )`
    ];

    for (const query of queries) {
      await this.db.query(query);
    }

    // Create indexes
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_sage_entities_lookup
      ON sage_entities(account_id, entity_type, sage_id)
    `);

    await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_sage_sync_queue_pending
      ON sage_sync_queue(account_id, status, priority DESC)
    `);

    await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_sage_ledger_nominal
      ON sage_ledger_accounts(account_id, nominal_code)
    `);
  }

  // OAuth 2.0 Authentication
  async authorize(accountId) {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: 'full_access',
      state: accountId
    });

    return `${this.authUrl}?${params}`;
  }

  async handleOAuthCallback(code, state) {
    try {
      const response = await axios.post(this.tokenUrl, {
        grant_type: 'authorization_code',
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        code: code,
        redirect_uri: this.config.redirectUri
      });

      const { access_token, refresh_token, expires_in } = response.data;

      const connection = {
        accountId: state,
        accessToken: this.encrypt(access_token),
        refreshToken: this.encrypt(refresh_token),
        tokenExpiry: new Date(Date.now() + expires_in * 1000)
      };

      await this.saveConnection(connection);

      // Get company info
      await this.fetchCompanyInfo(state);

      return { success: true, accountId: state };

    } catch (error) {
      this.emit('error', { error, context: 'oauth_callback' });
      throw error;
    }
  }

  // Core Accounting Features
  async syncChartOfAccounts(accountId) {
    try {
      const response = await this.makeRequest(accountId, 'GET', '/accounts');
      const accounts = response.data.$items || [];

      for (const account of accounts) {
        await this.db.query(`
          INSERT INTO sage_ledger_accounts
          (account_id, ledger_account_id, display_id, nominal_code, name,
           account_type, category, is_control, is_active, balance, currency_code)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          ON CONFLICT (account_id, ledger_account_id)
          DO UPDATE SET
            name = $5, balance = $10, is_active = $9,
            updated_at = CURRENT_TIMESTAMP
        `, [
          accountId, account.id, account.displayed_as, account.nominal_code,
          account.name, account.account_type?.id, account.category?.id,
          account.is_control || false, account.is_active !== false,
          account.current_balance || 0, account.currency?.id || 'USD'
        ]);
      }

      return { success: true, accountsSynced: accounts.length };

    } catch (error) {
      this.emit('error', { error, context: 'sync_chart_of_accounts' });
      throw error;
    }
  }

  async createJournalEntry(accountId, entryData) {
    try {
      // Validate journal lines balance
      const totalDebits = entryData.journal_lines.reduce((sum, line) =>
        sum + (line.debit || 0), 0
      );
      const totalCredits = entryData.journal_lines.reduce((sum, line) =>
        sum + (line.credit || 0), 0
      );

      if (Math.abs(totalDebits - totalCredits) > 0.01) {
        throw new Error('Journal entry must balance');
      }

      // Prepare journal entry
      const journal = {
        date: entryData.date,
        reference: entryData.reference,
        description: entryData.description,
        journal_lines: entryData.journal_lines.map(line => ({
          ledger_account: { id: line.account_id },
          details: line.description,
          debit: line.debit || 0,
          credit: line.credit || 0,
          tax_rate: line.tax_rate_id ? { id: line.tax_rate_id } : null,
          tracking_categories: line.tracking || []
        }))
      };

      const response = await this.makeRequest(accountId, 'POST', '/journals', journal);

      // Store locally
      await this.db.query(`
        INSERT INTO sage_journal_entries
        (account_id, journal_id, reference, date, description,
         total_amount, currency_code, journal_lines, posted)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [
        accountId, response.data.id, journal.reference, journal.date,
        journal.description, totalDebits, entryData.currency || 'USD',
        JSON.stringify(journal.journal_lines), false
      ]);

      return response.data;

    } catch (error) {
      this.emit('error', { error, context: 'create_journal_entry' });
      throw error;
    }
  }

  // Sales & Purchase Management
  async createSalesInvoice(accountId, invoiceData) {
    try {
      const invoice = {
        contact: { id: invoiceData.customer_id },
        date: invoiceData.date || new Date().toISOString().split('T')[0],
        due_date: invoiceData.due_date,
        reference: invoiceData.reference,
        invoice_lines: await this.prepareInvoiceLines(invoiceData.line_items),
        tax_analysis: await this.calculateTaxAnalysis(invoiceData.line_items),
        payment_terms: invoiceData.payment_terms || { days: 30 }
      };

      const response = await this.makeRequest(accountId, 'POST', '/sales_invoices', invoice);

      // Store in local database
      await this.storeEntity(accountId, 'sales_invoice', response.data.id, response.data);

      // Add to sync queue for follow-up
      await this.addToSyncQueue(accountId, 'sales_invoice', 'monitor', {
        invoice_id: response.data.id,
        due_date: invoice.due_date
      });

      return response.data;

    } catch (error) {
      this.emit('error', { error, context: 'create_sales_invoice' });
      throw error;
    }
  }

  async createPurchaseInvoice(accountId, billData) {
    try {
      const bill = {
        contact: { id: billData.vendor_id },
        date: billData.date,
        due_date: billData.due_date,
        reference: billData.reference,
        invoice_lines: await this.prepareInvoiceLines(billData.line_items),
        tax_analysis: await this.calculateTaxAnalysis(billData.line_items)
      };

      const response = await this.makeRequest(accountId, 'POST', '/purchase_invoices', bill);

      await this.storeEntity(accountId, 'purchase_invoice', response.data.id, response.data);

      return response.data;

    } catch (error) {
      this.emit('error', { error, context: 'create_purchase_invoice' });
      throw error;
    }
  }

  // Banking & Reconciliation
  async syncBankTransactions(accountId, bankAccountId, fromDate = null) {
    try {
      const params = {
        bank_account: bankAccountId,
        items_per_page: this.config.batchSize
      };

      if (fromDate) {
        params.from_date = fromDate;
      }

      const response = await this.makeRequest(accountId, 'GET', '/bank_transactions', params);
      const transactions = response.data.$items || [];

      for (const transaction of transactions) {
        await this.storeEntity(accountId, 'bank_transaction', transaction.id, transaction);

        // Auto-match with invoices/bills
        await this.autoMatchTransaction(accountId, transaction);
      }

      return { success: true, transactionsSynced: transactions.length };

    } catch (error) {
      this.emit('error', { error, context: 'sync_bank_transactions' });
      throw error;
    }
  }

  async performBankReconciliation(accountId, reconciliationData) {
    try {
      const { bank_account_id, statement_date, statement_balance, transactions } = reconciliationData;

      // Get current bank balance
      const currentBalance = await this.getBankBalance(accountId, bank_account_id);

      // Match transactions
      const matchedItems = [];
      const outstandingItems = [];

      for (const trans of transactions) {
        const match = await this.findMatchingTransaction(accountId, trans);
        if (match) {
          matchedItems.push({
            transaction_id: trans.id,
            matched_with: match.id,
            amount: trans.amount
          });
        } else {
          outstandingItems.push(trans);
        }
      }

      // Calculate reconciled balance
      const reconciledBalance = matchedItems.reduce((sum, item) =>
        sum + item.amount, currentBalance
      );

      const difference = Math.abs(statement_balance - reconciledBalance);

      // Store reconciliation
      await this.db.query(`
        INSERT INTO sage_bank_reconciliations
        (account_id, bank_account_id, statement_date, statement_balance,
         reconciled_balance, difference, status, reconciled_items, outstanding_items)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [
        accountId, bank_account_id, statement_date, statement_balance,
        reconciledBalance, difference, difference < 0.01 ? 'balanced' : 'unbalanced',
        JSON.stringify(matchedItems), JSON.stringify(outstandingItems)
      ]);

      return {
        success: true,
        balanced: difference < 0.01,
        difference,
        matchedCount: matchedItems.length,
        outstandingCount: outstandingItems.length
      };

    } catch (error) {
      this.emit('error', { error, context: 'bank_reconciliation' });
      throw error;
    }
  }

  // Payroll Integration
  async syncPayrollJournal(accountId, payrollData) {
    try {
      const journalLines = [];

      // Salary expense
      journalLines.push({
        account_id: await this.getAccountByCode(accountId, 7000), // Salary expense
        debit: payrollData.gross_salary,
        credit: 0,
        description: `Payroll - ${payrollData.period}`
      });

      // Tax withholdings
      for (const tax of payrollData.taxes) {
        journalLines.push({
          account_id: await this.getAccountByCode(accountId, tax.liability_account),
          debit: 0,
          credit: tax.amount,
          description: tax.description
        });
      }

      // Benefits
      if (payrollData.benefits) {
        journalLines.push({
          account_id: await this.getAccountByCode(accountId, 7100), // Benefits expense
          debit: payrollData.benefits.employer_contribution,
          credit: 0,
          description: 'Employee benefits'
        });
      }

      // Net pay liability
      journalLines.push({
        account_id: await this.getAccountByCode(accountId, 2100), // Payroll payable
        debit: 0,
        credit: payrollData.net_pay,
        description: 'Net pay payable'
      });

      // Create journal entry
      return await this.createJournalEntry(accountId, {
        date: payrollData.pay_date,
        reference: `PAYROLL-${payrollData.period}`,
        description: `Payroll journal for ${payrollData.period}`,
        journal_lines: journalLines
      });

    } catch (error) {
      this.emit('error', { error, context: 'sync_payroll' });
      throw error;
    }
  }

  // Inventory Management
  async syncInventory(accountId) {
    try {
      const response = await this.makeRequest(accountId, 'GET', '/products');
      const products = response.data.$items || [];

      for (const product of products) {
        await this.storeEntity(accountId, 'product', product.id, product);

        // Sync stock levels
        if (product.item_code) {
          await this.syncStockLevels(accountId, product.id);
        }
      }

      return { success: true, productsSynced: products.length };

    } catch (error) {
      this.emit('error', { error, context: 'sync_inventory' });
      throw error;
    }
  }

  async adjustInventory(accountId, adjustmentData) {
    try {
      const adjustment = {
        date: adjustmentData.date || new Date().toISOString().split('T')[0],
        reference: adjustmentData.reference,
        stock_adjustments: adjustmentData.items.map(item => ({
          product: { id: item.product_id },
          quantity_change: item.quantity_change,
          unit_cost: item.unit_cost,
          reason: item.reason || 'Manual adjustment'
        }))
      };

      const response = await this.makeRequest(accountId, 'POST', '/stock_adjustments', adjustment);

      // Create journal entry for inventory adjustment
      await this.createInventoryJournal(accountId, adjustment);

      return response.data;

    } catch (error) {
      this.emit('error', { error, context: 'adjust_inventory' });
      throw error;
    }
  }

  // Tax & Compliance
  async prepareTaxReturn(accountId, taxPeriod) {
    try {
      const { start_date, end_date, tax_type } = taxPeriod;

      // Get all transactions for the period
      const salesInvoices = await this.getTransactionsForPeriod(
        accountId, 'sales_invoices', start_date, end_date
      );
      const purchaseInvoices = await this.getTransactionsForPeriod(
        accountId, 'purchase_invoices', start_date, end_date
      );

      // Calculate tax amounts
      const salesTax = this.calculateTaxFromTransactions(salesInvoices, 'output');
      const purchaseTax = this.calculateTaxFromTransactions(purchaseInvoices, 'input');

      const taxReturn = {
        period_start: start_date,
        period_end: end_date,
        tax_type,
        total_sales: salesTax.total,
        total_purchases: purchaseTax.total,
        output_tax: salesTax.tax,
        input_tax: purchaseTax.tax,
        net_tax: salesTax.tax - purchaseTax.tax,
        adjustments: [],
        status: 'draft'
      };

      // Apply any adjustments
      const adjustments = await this.getTaxAdjustments(accountId, start_date, end_date);
      taxReturn.adjustments = adjustments;
      taxReturn.net_tax += adjustments.reduce((sum, adj) => sum + adj.amount, 0);

      // Store tax return
      const result = await this.db.query(`
        INSERT INTO sage_tax_returns
        (account_id, return_id, tax_type, period_start, period_end,
         status, total_sales, total_purchases, tax_due)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id
      `, [
        accountId, crypto.randomBytes(16).toString('hex'), tax_type,
        start_date, end_date, 'draft', salesTax.total,
        purchaseTax.total, taxReturn.net_tax
      ]);

      taxReturn.id = result.rows[0].id;
      return taxReturn;

    } catch (error) {
      this.emit('error', { error, context: 'prepare_tax_return' });
      throw error;
    }
  }

  async submitTaxReturn(accountId, returnId) {
    try {
      // Get return details
      const taxReturn = await this.db.query(
        'SELECT * FROM sage_tax_returns WHERE id = $1 AND account_id = $2',
        [returnId, accountId]
      );

      if (!taxReturn.rows.length) {
        throw new Error('Tax return not found');
      }

      // Submit to Sage API
      const response = await this.makeRequest(accountId, 'POST', '/tax_returns/submit', {
        return_id: taxReturn.rows[0].return_id,
        period_start: taxReturn.rows[0].period_start,
        period_end: taxReturn.rows[0].period_end,
        tax_due: taxReturn.rows[0].tax_due
      });

      // Update status
      await this.db.query(`
        UPDATE sage_tax_returns
        SET status = 'submitted',
            submission_date = CURRENT_TIMESTAMP,
            reference_number = $1
        WHERE id = $2
      `, [response.data.reference_number, returnId]);

      return response.data;

    } catch (error) {
      this.emit('error', { error, context: 'submit_tax_return' });
      throw error;
    }
  }

  // Reporting & Analytics
  async generateFinancialReports(accountId, reportType, parameters = {}) {
    try {
      switch (reportType) {
        case 'profit_loss':
          return await this.generateProfitLossReport(accountId, parameters);
        case 'balance_sheet':
          return await this.generateBalanceSheet(accountId, parameters);
        case 'cash_flow':
          return await this.generateCashFlowStatement(accountId, parameters);
        case 'trial_balance':
          return await this.generateTrialBalance(accountId, parameters);
        case 'aged_receivables':
          return await this.generateAgedReceivables(accountId, parameters);
        case 'aged_payables':
          return await this.generateAgedPayables(accountId, parameters);
        case 'budget_variance':
          return await this.generateBudgetVarianceReport(accountId, parameters);
        default:
          throw new Error(`Unknown report type: ${reportType}`);
      }
    } catch (error) {
      this.emit('error', { error, context: 'generate_report' });
      throw error;
    }
  }

  async generateProfitLossReport(accountId, { start_date, end_date, comparison = false }) {
    const report = {
      period: { start: start_date, end: end_date },
      revenue: {},
      expenses: {},
      other_income: {},
      other_expenses: {},
      summary: {}
    };

    // Get revenue accounts
    const revenueAccounts = await this.getAccountsByType(accountId, 'income');
    for (const account of revenueAccounts) {
      const balance = await this.getAccountBalance(accountId, account.id, start_date, end_date);
      report.revenue[account.name] = balance;
    }

    // Get expense accounts
    const expenseAccounts = await this.getAccountsByType(accountId, 'expense');
    for (const account of expenseAccounts) {
      const balance = await this.getAccountBalance(accountId, account.id, start_date, end_date);
      report.expenses[account.name] = balance;
    }

    // Calculate totals
    report.summary.total_revenue = Object.values(report.revenue).reduce((sum, val) => sum + val, 0);
    report.summary.total_expenses = Object.values(report.expenses).reduce((sum, val) => sum + val, 0);
    report.summary.gross_profit = report.summary.total_revenue - report.summary.total_expenses;

    // Add other income/expenses
    const otherIncome = await this.getAccountBalance(accountId, 'other_income', start_date, end_date);
    const otherExpenses = await this.getAccountBalance(accountId, 'other_expenses', start_date, end_date);

    report.summary.net_profit = report.summary.gross_profit + otherIncome - otherExpenses;

    // Add comparison period if requested
    if (comparison) {
      const prevStart = new Date(start_date);
      prevStart.setFullYear(prevStart.getFullYear() - 1);
      const prevEnd = new Date(end_date);
      prevEnd.setFullYear(prevEnd.getFullYear() - 1);

      report.comparison = await this.generateProfitLossReport(accountId, {
        start_date: prevStart.toISOString().split('T')[0],
        end_date: prevEnd.toISOString().split('T')[0],
        comparison: false
      });

      report.variance = {
        revenue: ((report.summary.total_revenue - report.comparison.summary.total_revenue) /
                  report.comparison.summary.total_revenue * 100).toFixed(2) + '%',
        expenses: ((report.summary.total_expenses - report.comparison.summary.total_expenses) /
                   report.comparison.summary.total_expenses * 100).toFixed(2) + '%',
        net_profit: ((report.summary.net_profit - report.comparison.summary.net_profit) /
                     report.comparison.summary.net_profit * 100).toFixed(2) + '%'
      };
    }

    return report;
  }

  // Multi-Company Support
  async syncMultipleCompanies(accountIds) {
    const results = [];

    for (const accountId of accountIds) {
      try {
        const result = await this.syncAllData(accountId);
        results.push({ accountId, success: true, ...result });
      } catch (error) {
        results.push({ accountId, success: false, error: error.message });
      }
    }

    // Generate consolidated report
    const consolidated = await this.generateConsolidatedReport(results);

    return { results, consolidated };
  }

  async generateConsolidatedReport(companyResults) {
    const report = {
      total_companies: companyResults.length,
      successful_syncs: companyResults.filter(r => r.success).length,
      total_transactions: 0,
      total_revenue: 0,
      total_expenses: 0,
      companies: []
    };

    for (const company of companyResults) {
      if (company.success) {
        report.total_transactions += company.transactions_synced || 0;
        report.total_revenue += company.revenue || 0;
        report.total_expenses += company.expenses || 0;

        report.companies.push({
          account_id: company.accountId,
          metrics: {
            revenue: company.revenue,
            expenses: company.expenses,
            profit: company.revenue - company.expenses
          }
        });
      }
    }

    return report;
  }

  // Helper Methods
  async makeRequest(accountId, method, endpoint, data = null) {
    const connection = this.connections.get(accountId);
    if (!connection) {
      throw new Error(`No connection found for account ${accountId}`);
    }

    // Check token expiry
    if (new Date() >= connection.tokenExpiry) {
      await this.refreshToken(accountId);
    }

    const config = {
      method,
      url: `${this.baseUrl}${endpoint}`,
      headers: {
        'Authorization': `Bearer ${this.decrypt(connection.accessToken)}`,
        'Content-Type': 'application/json'
      }
    };

    if (method === 'GET' && data) {
      config.params = data;
    } else if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return response;
  }

  async refreshToken(accountId) {
    const connection = this.connections.get(accountId);

    const response = await axios.post(this.tokenUrl, {
      grant_type: 'refresh_token',
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      refresh_token: this.decrypt(connection.refreshToken)
    });

    connection.accessToken = this.encrypt(response.data.access_token);
    connection.tokenExpiry = new Date(Date.now() + response.data.expires_in * 1000);

    await this.updateConnection(connection);
  }

  async storeEntity(accountId, entityType, sageId, data) {
    await this.db.query(`
      INSERT INTO sage_entities (account_id, entity_type, sage_id, data)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (account_id, entity_type, sage_id)
      DO UPDATE SET data = $4, updated_at = CURRENT_TIMESTAMP, version = version + 1
    `, [accountId, entityType, sageId, JSON.stringify(data)]);
  }

  async addToSyncQueue(accountId, entityType, operation, data) {
    await this.db.query(`
      INSERT INTO sage_sync_queue
      (account_id, entity_type, operation, data, priority)
      VALUES ($1, $2, $3, $4, $5)
    `, [accountId, entityType, operation, JSON.stringify(data), 5]);
  }

  async prepareInvoiceLines(lineItems) {
    return lineItems.map(item => ({
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      ledger_account: { id: item.account_id },
      tax_rate: item.tax_rate_id ? { id: item.tax_rate_id } : null,
      discount: item.discount || 0
    }));
  }

  async calculateTaxAnalysis(lineItems) {
    const taxAnalysis = [];
    const taxRates = new Map();

    for (const item of lineItems) {
      if (item.tax_rate_id) {
        const amount = item.quantity * item.unit_price;
        const taxAmount = amount * (item.tax_percentage / 100);

        if (taxRates.has(item.tax_rate_id)) {
          const existing = taxRates.get(item.tax_rate_id);
          existing.net += amount;
          existing.tax += taxAmount;
        } else {
          taxRates.set(item.tax_rate_id, {
            tax_rate: { id: item.tax_rate_id },
            net: amount,
            tax: taxAmount
          });
        }
      }
    }

    return Array.from(taxRates.values());
  }

  encrypt(text) {
    if (!this.config.encryptionKey) return text;
    const cipher = crypto.createCipher('aes-256-cbc', this.config.encryptionKey);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  decrypt(text) {
    if (!this.config.encryptionKey) return text;
    const decipher = crypto.createDecipher('aes-256-cbc', this.config.encryptionKey);
    let decrypted = decipher.update(text, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  async loadConnections() {
    const result = await this.db.query('SELECT * FROM sage_connections');
    for (const row of result.rows) {
      this.connections.set(row.account_id, row);
    }
  }

  async initializeModules() {
    // Initialize integration modules for different Sage products
    this.integrationModules.set('sage50', {
      name: 'Sage 50',
      features: ['general_ledger', 'accounts_payable', 'accounts_receivable', 'inventory']
    });

    this.integrationModules.set('sage100', {
      name: 'Sage 100',
      features: ['general_ledger', 'accounts_payable', 'accounts_receivable', 'inventory',
                 'purchase_orders', 'sales_orders', 'payroll']
    });

    this.integrationModules.set('sage300', {
      name: 'Sage 300',
      features: ['general_ledger', 'accounts_payable', 'accounts_receivable', 'inventory',
                 'purchase_orders', 'sales_orders', 'payroll', 'project_costing',
                 'multi_currency', 'intercompany']
    });

    this.integrationModules.set('sage_intacct', {
      name: 'Sage Intacct',
      features: ['general_ledger', 'accounts_payable', 'accounts_receivable', 'inventory',
                 'purchase_orders', 'sales_orders', 'project_accounting', 'multi_entity',
                 'dimensions', 'allocations', 'consolidations']
    });
  }

  async startScheduler() {
    // Process sync queue
    setInterval(async () => {
      await this.processSyncQueue();
    }, 60000); // Every minute

    // Auto-sync connections
    setInterval(async () => {
      for (const [accountId, connection] of this.connections) {
        if (connection.features?.autoSync) {
          await this.syncAllData(accountId);
        }
      }
    }, this.config.syncInterval);
  }

  async processSyncQueue() {
    const pending = await this.db.query(`
      SELECT * FROM sage_sync_queue
      WHERE status = 'pending' AND attempts < max_attempts
      ORDER BY priority DESC, scheduled_at ASC
      LIMIT 10
    `);

    for (const item of pending.rows) {
      try {
        await this.processQueueItem(item);

        await this.db.query(`
          UPDATE sage_sync_queue
          SET status = 'completed', processed_at = CURRENT_TIMESTAMP
          WHERE id = $1
        `, [item.id]);

      } catch (error) {
        await this.db.query(`
          UPDATE sage_sync_queue
          SET attempts = attempts + 1, error_message = $1
          WHERE id = $2
        `, [error.message, item.id]);
      }
    }
  }

  async processQueueItem(item) {
    const data = JSON.parse(item.data);

    switch (item.operation) {
      case 'sync':
        await this.syncEntity(item.account_id, item.entity_type, data);
        break;
      case 'create':
        await this.createEntity(item.account_id, item.entity_type, data);
        break;
      case 'update':
        await this.updateEntity(item.account_id, item.entity_type, data);
        break;
      case 'delete':
        await this.deleteEntity(item.account_id, item.entity_type, data);
        break;
      case 'monitor':
        await this.monitorEntity(item.account_id, item.entity_type, data);
        break;
    }
  }

  async syncAllData(accountId) {
    const syncTasks = [
      this.syncChartOfAccounts(accountId),
      this.syncContacts(accountId),
      this.syncProducts(accountId),
      this.syncInvoices(accountId),
      this.syncBills(accountId),
      this.syncBankAccounts(accountId)
    ];

    const results = await Promise.allSettled(syncTasks);

    return {
      success: results.every(r => r.status === 'fulfilled'),
      details: results.map((r, i) => ({
        task: ['accounts', 'contacts', 'products', 'invoices', 'bills', 'banks'][i],
        status: r.status,
        result: r.status === 'fulfilled' ? r.value : r.reason
      }))
    };
  }
}

export default SageBusinessConnector;