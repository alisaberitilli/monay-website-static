/**
 * Xero Integration Service
 * Provides accounting integration with Xero for SMB clients
 * Created: 2025-01-21
 */

const { EventEmitter } = require('events');
const axios = require('axios');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

class XeroIntegration extends EventEmitter {
  constructor() {
    super();

    this.config = {
      clientId: process.env.XERO_CLIENT_ID,
      clientSecret: process.env.XERO_CLIENT_SECRET,
      redirectUri: process.env.XERO_REDIRECT_URI || 'https://api.monay.com/xero/callback',
      scopes: [
        'accounting.transactions',
        'accounting.contacts',
        'accounting.journals',
        'accounting.reports.read',
        'accounting.settings',
        'payroll.employees',
        'payroll.payruns',
        'bankfeeds'
      ].join(' ')
    };

    this.baseUrl = 'https://api.xero.com';
    this.tokenStore = new Map();
    this.tenantConnections = new Map();

    // Xero account mapping for government benefits
    this.benefitAccountMapping = {
      'SNAP': { code: '240-001', name: 'SNAP Benefits Payable', type: 'LIABILITY' },
      'TANF': { code: '240-002', name: 'TANF Benefits Payable', type: 'LIABILITY' },
      'MEDICAID': { code: '240-003', name: 'Medicaid Benefits Payable', type: 'LIABILITY' },
      'WIC': { code: '240-004', name: 'WIC Benefits Payable', type: 'LIABILITY' },
      'SECTION_8': { code: '240-005', name: 'Section 8 Benefits Payable', type: 'LIABILITY' },
      'LIHEAP': { code: '240-006', name: 'LIHEAP Benefits Payable', type: 'LIABILITY' },
      'UNEMPLOYMENT': { code: '240-007', name: 'Unemployment Benefits Payable', type: 'LIABILITY' },
      'SCHOOL_CHOICE': { code: '240-008', name: 'School Choice Benefits Payable', type: 'LIABILITY' },
      'CHILD_CARE': { code: '240-009', name: 'Child Care Benefits Payable', type: 'LIABILITY' },
      'VETERANS': { code: '240-010', name: 'Veterans Benefits Payable', type: 'LIABILITY' },
      'TRANSPORTATION': { code: '240-011', name: 'Transportation Benefits Payable', type: 'LIABILITY' },
      'EMERGENCY_RENTAL': { code: '240-012', name: 'Emergency Rental Benefits Payable', type: 'LIABILITY' },
      'FREE_MEALS': { code: '240-013', name: 'Free Meals Benefits Payable', type: 'LIABILITY' },
      'EITC': { code: '240-014', name: 'EITC Benefits Payable', type: 'LIABILITY' }
    };

    this.accountTypes = {
      BANK: 'BANK',
      CURRENT: 'CURRENT',
      CURRLIAB: 'CURRLIAB',
      DEPRECIATN: 'DEPRECIATN',
      DIRECTCOSTS: 'DIRECTCOSTS',
      EQUITY: 'EQUITY',
      EXPENSE: 'EXPENSE',
      FIXED: 'FIXED',
      LIABILITY: 'LIABILITY',
      OTHERINCOME: 'OTHERINCOME',
      OVERHEADS: 'OVERHEADS',
      PREPAYMENT: 'PREPAYMENT',
      REVENUE: 'REVENUE',
      SALES: 'SALES',
      TERMLIAB: 'TERMLIAB',
      PAYGLIABILITY: 'PAYGLIABILITY'
    };
  }

  /**
   * OAuth 2.0 Authentication
   */
  async getAuthorizationUrl(state) {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: this.config.scopes,
      state: state
    });

    return `https://login.xero.com/identity/connect/authorize?${params.toString()}`;
  }

  async exchangeCodeForTokens(code) {
    try {
      const response = await axios.post(
        'https://identity.xero.com/connect/token',
        new URLSearchParams({
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: this.config.redirectUri
        }),
        {
          headers: {
            'Authorization': `Basic ${Buffer.from(
              `${this.config.clientId}:${this.config.clientSecret}`
            ).toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      const tokens = {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
        expiresIn: response.data.expires_in,
        idToken: response.data.id_token,
        createdAt: Date.now()
      };

      // Get tenant connections
      await this.getTenantConnections(tokens.accessToken);

      this.emit('authenticated', { success: true });
      return tokens;

    } catch (error) {
      console.error('Xero token exchange error:', error);
      throw error;
    }
  }

  async refreshAccessToken(refreshToken) {
    try {
      const response = await axios.post(
        'https://identity.xero.com/connect/token',
        new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken
        }),
        {
          headers: {
            'Authorization': `Basic ${Buffer.from(
              `${this.config.clientId}:${this.config.clientSecret}`
            ).toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      return {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
        expiresIn: response.data.expires_in,
        createdAt: Date.now()
      };

    } catch (error) {
      console.error('Xero token refresh error:', error);
      throw error;
    }
  }

  async getTenantConnections(accessToken) {
    try {
      const response = await axios.get(
        'https://api.xero.com/connections',
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json'
          }
        }
      );

      response.data.forEach(connection => {
        this.tenantConnections.set(connection.tenantId, {
          tenantId: connection.tenantId,
          tenantType: connection.tenantType,
          tenantName: connection.tenantName,
          createdDate: connection.createdDateUtc
        });
      });

      return response.data;

    } catch (error) {
      console.error('Xero tenant connections error:', error);
      throw error;
    }
  }

  /**
   * Contact Management
   */
  async createOrUpdateContact(tenantId, contactData) {
    try {
      const xeroContact = {
        Name: contactData.name || `${contactData.firstName} ${contactData.lastName}`,
        FirstName: contactData.firstName,
        LastName: contactData.lastName,
        EmailAddress: contactData.email,
        ContactStatus: 'ACTIVE',
        IsSupplier: contactData.isSupplier || false,
        IsCustomer: contactData.isCustomer || true,
        DefaultCurrency: contactData.currency || 'USD',
        Addresses: []
      };

      // Add addresses
      if (contactData.address) {
        xeroContact.Addresses.push({
          AddressType: 'STREET',
          AddressLine1: contactData.address.street,
          City: contactData.address.city,
          Region: contactData.address.state,
          PostalCode: contactData.address.zipCode,
          Country: contactData.address.country || 'USA'
        });
      }

      // Add phone numbers
      if (contactData.phone) {
        xeroContact.Phones = [{
          PhoneType: 'DEFAULT',
          PhoneNumber: contactData.phone
        }];
      }

      // Add tax number if available
      if (contactData.taxNumber) {
        xeroContact.TaxNumber = contactData.taxNumber;
      }

      // Check if contact exists
      const existingContact = await this.findContactByEmail(tenantId, contactData.email);

      if (existingContact) {
        xeroContact.ContactID = existingContact.ContactID;
        const response = await this.makeXeroRequest(
          tenantId,
          'POST',
          `/api.xro/2.0/Contacts/${xeroContact.ContactID}`,
          { Contacts: [xeroContact] }
        );
        return response.Contacts[0];
      } else {
        const response = await this.makeXeroRequest(
          tenantId,
          'PUT',
          '/api.xro/2.0/Contacts',
          { Contacts: [xeroContact] }
        );
        return response.Contacts[0];
      }

    } catch (error) {
      console.error('Xero contact error:', error);
      throw error;
    }
  }

  async findContactByEmail(tenantId, email) {
    try {
      const response = await this.makeXeroRequest(
        tenantId,
        'GET',
        '/api.xro/2.0/Contacts',
        null,
        { where: `EmailAddress="${email}"` }
      );

      if (response.Contacts && response.Contacts.length > 0) {
        return response.Contacts[0];
      }

      return null;

    } catch (error) {
      console.error('Xero contact search error:', error);
      return null;
    }
  }

  /**
   * Invoice Management
   */
  async createInvoice(tenantId, invoiceData) {
    try {
      const xeroInvoice = {
        Type: invoiceData.type || 'ACCREC', // ACCREC for receivable, ACCPAY for payable
        Contact: {
          ContactID: invoiceData.contactId
        },
        Date: this.formatXeroDate(invoiceData.date),
        DueDate: this.formatXeroDate(invoiceData.dueDate),
        LineAmountTypes: 'Exclusive', // Tax exclusive
        InvoiceNumber: invoiceData.invoiceNumber,
        Reference: invoiceData.reference,
        Status: 'DRAFT',
        LineItems: []
      };

      // Add line items
      for (const item of invoiceData.items) {
        xeroInvoice.LineItems.push({
          Description: item.description,
          Quantity: item.quantity || 1,
          UnitAmount: item.unitPrice,
          AccountCode: item.accountCode,
          TaxType: item.taxType || 'NONE',
          LineAmount: item.quantity * item.unitPrice
        });
      }

      const response = await this.makeXeroRequest(
        tenantId,
        'PUT',
        '/api.xro/2.0/Invoices',
        { Invoices: [xeroInvoice] }
      );

      // Approve invoice if requested
      if (invoiceData.autoApprove) {
        await this.approveInvoice(tenantId, response.Invoices[0].InvoiceID);
      }

      return response.Invoices[0];

    } catch (error) {
      console.error('Xero invoice creation error:', error);
      throw error;
    }
  }

  async approveInvoice(tenantId, invoiceId) {
    try {
      const response = await this.makeXeroRequest(
        tenantId,
        'POST',
        `/api.xro/2.0/Invoices/${invoiceId}`,
        {
          Invoices: [{
            InvoiceID: invoiceId,
            Status: 'AUTHORISED'
          }]
        }
      );

      return response.Invoices[0];

    } catch (error) {
      console.error('Xero invoice approval error:', error);
      throw error;
    }
  }

  /**
   * Payment Processing
   */
  async createPayment(tenantId, paymentData) {
    try {
      const xeroPayment = {
        Invoice: {
          InvoiceID: paymentData.invoiceId
        },
        Account: {
          AccountID: paymentData.accountId || await this.getBankAccountId(tenantId)
        },
        Date: this.formatXeroDate(paymentData.date),
        Amount: paymentData.amount,
        Reference: paymentData.reference || `Payment ${paymentData.id}`,
        IsReconciled: paymentData.reconciled || false
      };

      const response = await this.makeXeroRequest(
        tenantId,
        'PUT',
        '/api.xro/2.0/Payments',
        { Payments: [xeroPayment] }
      );

      return response.Payments[0];

    } catch (error) {
      console.error('Xero payment error:', error);
      throw error;
    }
  }

  async createBillPayment(tenantId, billPaymentData) {
    try {
      // Create bill (accounts payable invoice)
      const bill = await this.createInvoice(tenantId, {
        type: 'ACCPAY',
        contactId: billPaymentData.vendorId,
        date: billPaymentData.date,
        dueDate: billPaymentData.dueDate,
        invoiceNumber: billPaymentData.billNumber,
        items: billPaymentData.items,
        autoApprove: true
      });

      // Create payment for the bill
      const payment = await this.createPayment(tenantId, {
        invoiceId: bill.InvoiceID,
        amount: bill.Total,
        date: billPaymentData.paymentDate || new Date(),
        reference: `Bill payment ${billPaymentData.billNumber}`
      });

      return {
        bill: bill,
        payment: payment
      };

    } catch (error) {
      console.error('Xero bill payment error:', error);
      throw error;
    }
  }

  /**
   * Bank Feed Integration
   */
  async setupBankFeed(tenantId, bankAccountData) {
    try {
      // Create bank feed connection
      const feedConnection = {
        AccountName: bankAccountData.accountName,
        AccountNumber: bankAccountData.accountNumber,
        AccountType: bankAccountData.accountType || 'BANK',
        Currency: bankAccountData.currency || 'USD',
        AccountToken: uuidv4() // Unique token for this feed
      };

      const response = await this.makeXeroRequest(
        tenantId,
        'POST',
        '/bankfeeds.xro/1.0/FeedConnections',
        feedConnection
      );

      // Store feed connection details
      await this.storeFeedConnection(tenantId, response);

      return {
        success: true,
        feedConnectionId: response.Id,
        accountToken: feedConnection.AccountToken
      };

    } catch (error) {
      console.error('Xero bank feed setup error:', error);
      throw error;
    }
  }

  async createBankStatement(tenantId, feedConnectionId, transactions) {
    try {
      const statement = {
        FeedConnectionId: feedConnectionId,
        StartDate: this.formatXeroDate(transactions[0].date),
        EndDate: this.formatXeroDate(transactions[transactions.length - 1].date),
        StartBalance: transactions[0].balance - transactions[0].amount,
        EndBalance: transactions[transactions.length - 1].balance,
        StatementLines: []
      };

      // Add transaction lines
      for (const txn of transactions) {
        statement.StatementLines.push({
          PostedDate: this.formatXeroDate(txn.date),
          Description: txn.description,
          Amount: txn.amount,
          ChequeNumber: txn.checkNumber,
          Reference: txn.reference,
          TransactionId: txn.id
        });
      }

      const response = await this.makeXeroRequest(
        tenantId,
        'POST',
        '/bankfeeds.xro/1.0/Statements',
        statement
      );

      return {
        success: true,
        statementId: response.Id,
        linesCreated: statement.StatementLines.length
      };

    } catch (error) {
      console.error('Xero bank statement error:', error);
      throw error;
    }
  }

  /**
   * Journal Entries
   */
  async createManualJournal(tenantId, journalData) {
    try {
      const xeroJournal = {
        Narration: journalData.description,
        Date: this.formatXeroDate(journalData.date),
        Status: 'DRAFT',
        JournalLines: []
      };

      // Build journal lines
      for (const line of journalData.lines) {
        if (line.debitAmount > 0) {
          xeroJournal.JournalLines.push({
            LineAmount: line.debitAmount,
            AccountCode: await this.getAccountCode(tenantId, line.accountCode),
            Description: line.description,
            TaxType: 'NONE'
          });
        }

        if (line.creditAmount > 0) {
          xeroJournal.JournalLines.push({
            LineAmount: -line.creditAmount,
            AccountCode: await this.getAccountCode(tenantId, line.accountCode),
            Description: line.description,
            TaxType: 'NONE'
          });
        }
      }

      const response = await this.makeXeroRequest(
        tenantId,
        'PUT',
        '/api.xro/2.0/ManualJournals',
        { ManualJournals: [xeroJournal] }
      );

      // Post journal if requested
      if (journalData.autoPost) {
        await this.postManualJournal(tenantId, response.ManualJournals[0].ManualJournalID);
      }

      return response.ManualJournals[0];

    } catch (error) {
      console.error('Xero manual journal error:', error);
      throw error;
    }
  }

  async postManualJournal(tenantId, journalId) {
    try {
      const response = await this.makeXeroRequest(
        tenantId,
        'POST',
        `/api.xro/2.0/ManualJournals/${journalId}`,
        {
          ManualJournals: [{
            ManualJournalID: journalId,
            Status: 'POSTED'
          }]
        }
      );

      return response.ManualJournals[0];

    } catch (error) {
      console.error('Xero journal posting error:', error);
      throw error;
    }
  }

  /**
   * Chart of Accounts
   */
  async createAccount(tenantId, accountData) {
    try {
      const xeroAccount = {
        Code: accountData.code,
        Name: accountData.name,
        Type: this.mapAccountType(accountData.type),
        Description: accountData.description,
        TaxType: accountData.taxType || 'NONE',
        EnablePaymentsToAccount: accountData.enablePayments || false,
        ShowInExpenseClaims: accountData.showInExpenses || false
      };

      const response = await this.makeXeroRequest(
        tenantId,
        'PUT',
        '/api.xro/2.0/Accounts',
        { Accounts: [xeroAccount] }
      );

      return response.Accounts[0];

    } catch (error) {
      console.error('Xero account creation error:', error);
      throw error;
    }
  }

  async setupBenefitAccounts(tenantId) {
    const accounts = [];

    for (const [program, config] of Object.entries(this.benefitAccountMapping)) {
      try {
        const account = await this.createAccount(tenantId, {
          code: config.code,
          name: config.name,
          type: config.type,
          description: `Government benefit liability account for ${program} program`
        });
        accounts.push(account);
      } catch (error) {
        console.error(`Failed to create account for ${program}:`, error);
      }
    }

    return accounts;
  }

  /**
   * Reports
   */
  async getBalanceSheet(tenantId, date) {
    try {
      const response = await this.makeXeroRequest(
        tenantId,
        'GET',
        '/api.xro/2.0/Reports/BalanceSheet',
        null,
        { date: this.formatXeroDate(date) }
      );

      return this.parseXeroReport(response.Reports[0]);

    } catch (error) {
      console.error('Xero balance sheet error:', error);
      throw error;
    }
  }

  async getProfitAndLoss(tenantId, fromDate, toDate) {
    try {
      const response = await this.makeXeroRequest(
        tenantId,
        'GET',
        '/api.xro/2.0/Reports/ProfitAndLoss',
        null,
        {
          fromDate: this.formatXeroDate(fromDate),
          toDate: this.formatXeroDate(toDate)
        }
      );

      return this.parseXeroReport(response.Reports[0]);

    } catch (error) {
      console.error('Xero P&L error:', error);
      throw error;
    }
  }

  async getTrialBalance(tenantId, date) {
    try {
      const response = await this.makeXeroRequest(
        tenantId,
        'GET',
        '/api.xro/2.0/Reports/TrialBalance',
        null,
        { date: this.formatXeroDate(date) }
      );

      return this.parseXeroReport(response.Reports[0]);

    } catch (error) {
      console.error('Xero trial balance error:', error);
      throw error;
    }
  }

  /**
   * Benefit Transaction Sync
   */
  async syncBenefitDisbursement(tenantId, transaction) {
    try {
      // Create journal entry for benefit disbursement
      const journal = await this.createManualJournal(tenantId, {
        description: `${transaction.programType} benefit disbursement - ${transaction.beneficiaryId}`,
        date: transaction.date,
        lines: [
          {
            accountCode: this.benefitAccountMapping[transaction.programType]?.code || '240-000',
            debitAmount: transaction.amount,
            creditAmount: 0,
            description: 'Benefit liability reduction'
          },
          {
            accountCode: '100', // Bank account
            debitAmount: 0,
            creditAmount: transaction.amount,
            description: 'Cash disbursement'
          }
        ],
        autoPost: true
      });

      // Store reference
      await this.storeXeroReference(transaction.id, journal.ManualJournalID);

      return {
        success: true,
        journalId: journal.ManualJournalID
      };

    } catch (error) {
      console.error('Xero benefit sync error:', error);
      throw error;
    }
  }

  /**
   * Helper Functions
   */
  async makeXeroRequest(tenantId, method, endpoint, data = null, params = null) {
    try {
      const tokens = await this.getValidTokens(tenantId);

      const config = {
        method: method,
        url: `${this.baseUrl}${endpoint}`,
        headers: {
          'Authorization': `Bearer ${tokens.accessToken}`,
          'xero-tenant-id': tenantId,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      };

      if (params) {
        config.params = params;
      }

      if (data) {
        config.data = data;
      }

      const response = await axios(config);
      return response.data;

    } catch (error) {
      if (error.response?.status === 401) {
        // Token expired, refresh and retry
        await this.refreshAndStoreToken(tenantId);
        return this.makeXeroRequest(tenantId, method, endpoint, data, params);
      }
      throw error;
    }
  }

  async getValidTokens(tenantId) {
    let tokens = this.tokenStore.get(tenantId);

    if (!tokens) {
      tokens = await this.loadTokens(tenantId);
      if (!tokens) {
        throw new Error('No tokens available for tenant');
      }
      this.tokenStore.set(tenantId, tokens);
    }

    // Check if token is expired
    const expiresAt = tokens.createdAt + (tokens.expiresIn * 1000);
    if (Date.now() >= expiresAt - 60000) {
      tokens = await this.refreshAccessToken(tokens.refreshToken);
      this.tokenStore.set(tenantId, tokens);
      await this.persistTokens(tenantId, tokens);
    }

    return tokens;
  }

  formatXeroDate(date) {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }

  mapAccountType(type) {
    const mapping = {
      'ASSET': 'BANK',
      'LIABILITY': 'CURRLIAB',
      'EQUITY': 'EQUITY',
      'REVENUE': 'REVENUE',
      'EXPENSE': 'EXPENSE'
    };
    return mapping[type] || 'CURRENT';
  }

  parseXeroReport(reportData) {
    return {
      reportName: reportData.ReportName,
      reportDate: reportData.ReportDate,
      rows: reportData.Rows,
      updatedDate: reportData.UpdatedDateUTC
    };
  }

  async getAccountCode(tenantId, internalCode) {
    // Map internal account code to Xero account code
    // Implement lookup logic based on your mapping
    return internalCode;
  }

  async getBankAccountId(tenantId) {
    // Get default bank account
    const response = await this.makeXeroRequest(
      tenantId,
      'GET',
      '/api.xro/2.0/Accounts',
      null,
      { where: 'Type=="BANK"' }
    );

    if (response.Accounts && response.Accounts.length > 0) {
      return response.Accounts[0].AccountID;
    }

    throw new Error('No bank account found');
  }

  async persistTokens(tenantId, tokens) {
    await global.db.query(
      `INSERT INTO xero_tokens
       (tenant_id, access_token, refresh_token, expires_in, created_at)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (tenant_id)
       DO UPDATE SET
         access_token = $2,
         refresh_token = $3,
         expires_in = $4,
         updated_at = $5`,
      [tenantId, tokens.accessToken, tokens.refreshToken,
       tokens.expiresIn, new Date()]
    );
  }

  async loadTokens(tenantId) {
    const result = await global.db.query(
      `SELECT * FROM xero_tokens WHERE tenant_id = $1`,
      [tenantId]
    );

    if (result.rows.length > 0) {
      const row = result.rows[0];
      return {
        accessToken: row.access_token,
        refreshToken: row.refresh_token,
        expiresIn: row.expires_in,
        createdAt: row.created_at.getTime()
      };
    }

    return null;
  }

  async storeXeroReference(internalId, xeroId) {
    await global.db.query(
      `INSERT INTO xero_references
       (internal_id, xero_id, created_at)
       VALUES ($1, $2, $3)`,
      [internalId, xeroId, new Date()]
    );
  }

  async storeFeedConnection(tenantId, feedConnection) {
    await global.db.query(
      `INSERT INTO xero_bank_feeds
       (tenant_id, feed_id, account_token, created_at)
       VALUES ($1, $2, $3, $4)`,
      [tenantId, feedConnection.Id, feedConnection.AccountToken, new Date()]
    );
  }
}

export default XeroIntegration;