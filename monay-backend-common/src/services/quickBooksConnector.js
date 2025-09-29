/**
 * QuickBooks Connector Service
 * Integrates with QuickBooks Online for SMB accounting
 * Created: 2025-01-21
 */

import { EventEmitter } from 'events';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

class QuickBooksConnector extends EventEmitter {
  constructor() {
    super();

    this.config = {
      clientId: process.env.QB_CLIENT_ID,
      clientSecret: process.env.QB_CLIENT_SECRET,
      redirectUri: process.env.QB_REDIRECT_URI || 'https://api.monay.com/quickbooks/callback',
      environment: process.env.QB_ENVIRONMENT || 'sandbox',
      minorVersion: '65'
    };

    this.baseUrl = this.config.environment === 'production'
      ? 'https://quickbooks.api.intuit.com'
      : 'https://sandbox-quickbooks.api.intuit.com';

    this.tokenStore = new Map();

    // QB account mapping for government benefits
    this.benefitAccountMapping = {
      'SNAP': { qbAccount: 'Government Benefits - SNAP', accountNumber: '2401' },
      'TANF': { qbAccount: 'Government Benefits - TANF', accountNumber: '2402' },
      'MEDICAID': { qbAccount: 'Government Benefits - Medicaid', accountNumber: '2403' },
      'WIC': { qbAccount: 'Government Benefits - WIC', accountNumber: '2404' },
      'SECTION_8': { qbAccount: 'Government Benefits - Section 8', accountNumber: '2405' },
      'LIHEAP': { qbAccount: 'Government Benefits - LIHEAP', accountNumber: '2406' },
      'UNEMPLOYMENT': { qbAccount: 'Government Benefits - Unemployment', accountNumber: '2407' },
      'SCHOOL_CHOICE': { qbAccount: 'Government Benefits - School Choice', accountNumber: '2408' },
      'CHILD_CARE': { qbAccount: 'Government Benefits - Child Care', accountNumber: '2409' },
      'VETERANS': { qbAccount: 'Government Benefits - Veterans', accountNumber: '2410' },
      'TRANSPORTATION': { qbAccount: 'Government Benefits - Transportation', accountNumber: '2411' },
      'EMERGENCY_RENTAL': { qbAccount: 'Government Benefits - Emergency Rental', accountNumber: '2412' },
      'FREE_MEALS': { qbAccount: 'Government Benefits - Free Meals', accountNumber: '2413' },
      'EITC': { qbAccount: 'Government Benefits - EITC', accountNumber: '2414' }
    };

    this.entityTypes = {
      CUSTOMER: 'Customer',
      VENDOR: 'Vendor',
      EMPLOYEE: 'Employee'
    };
  }

  /**
   * OAuth 2.0 Authentication
   */
  async getAuthorizationUrl(state) {
    const scope = 'com.intuit.quickbooks.accounting';
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      scope: scope,
      redirect_uri: this.config.redirectUri,
      response_type: 'code',
      state: state
    });

    return `https://appcenter.intuit.com/connect/oauth2?${params.toString()}`;
  }

  async exchangeCodeForTokens(code, realmId) {
    try {
      const response = await axios.post(
        'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer',
        new URLSearchParams({
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: this.config.redirectUri
        }),
        {
          headers: {
            'Accept': 'application/json',
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
        realmId: realmId,
        createdAt: Date.now()
      };

      // Store tokens
      this.tokenStore.set(realmId, tokens);
      await this.persistTokens(realmId, tokens);

      this.emit('authenticated', { realmId });

      return tokens;
    } catch (error) {
      console.error('Token exchange error:', error);
      throw error;
    }
  }

  async refreshAccessToken(realmId) {
    try {
      const tokens = this.tokenStore.get(realmId);

      if (!tokens || !tokens.refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await axios.post(
        'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer',
        new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: tokens.refreshToken
        }),
        {
          headers: {
            'Accept': 'application/json',
            'Authorization': `Basic ${Buffer.from(
              `${this.config.clientId}:${this.config.clientSecret}`
            ).toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      const newTokens = {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
        expiresIn: response.data.expires_in,
        realmId: realmId,
        createdAt: Date.now()
      };

      this.tokenStore.set(realmId, newTokens);
      await this.persistTokens(realmId, newTokens);

      return newTokens;
    } catch (error) {
      console.error('Token refresh error:', error);
      throw error;
    }
  }

  /**
   * Journal Entry Operations
   */
  async createJournalEntry(realmId, journalEntry) {
    try {
      const qbJournal = {
        DocNumber: journalEntry.reference || uuidv4().substr(0, 8),
        TxnDate: journalEntry.date,
        PrivateNote: journalEntry.description,
        Line: []
      };

      // Build journal lines
      for (const line of journalEntry.lines) {
        // Debit line
        if (line.debitAmount > 0) {
          qbJournal.Line.push({
            DetailType: 'JournalEntryLineDetail',
            Amount: line.debitAmount,
            JournalEntryLineDetail: {
              PostingType: 'Debit',
              AccountRef: {
                value: await this.getAccountId(realmId, line.accountCode)
              }
            },
            Description: line.description
          });
        }

        // Credit line
        if (line.creditAmount > 0) {
          qbJournal.Line.push({
            DetailType: 'JournalEntryLineDetail',
            Amount: line.creditAmount,
            JournalEntryLineDetail: {
              PostingType: 'Credit',
              AccountRef: {
                value: await this.getAccountId(realmId, line.accountCode)
              }
            },
            Description: line.description
          });
        }
      }

      const response = await this.makeQBRequest(
        realmId,
        'POST',
        '/v3/company/{realmId}/journalentry',
        qbJournal
      );

      if (response.JournalEntry) {
        await this.storeQBReference(journalEntry.id, response.JournalEntry.Id);

        this.emit('journal_posted', {
          internalId: journalEntry.id,
          qbId: response.JournalEntry.Id
        });

        return {
          success: true,
          qbId: response.JournalEntry.Id,
          syncToken: response.JournalEntry.SyncToken
        };
      }

      throw new Error('Journal entry creation failed');

    } catch (error) {
      console.error('QB journal entry error:', error);
      throw error;
    }
  }

  /**
   * Customer Operations
   */
  async createOrUpdateCustomer(realmId, customer) {
    try {
      // Check if customer exists
      const existingCustomer = await this.findCustomerByEmail(realmId, customer.email);

      const qbCustomer = {
        DisplayName: `${customer.firstName} ${customer.lastName}`,
        GivenName: customer.firstName,
        FamilyName: customer.lastName,
        PrimaryEmailAddr: {
          Address: customer.email
        },
        PrimaryPhone: {
          FreeFormNumber: customer.phone
        },
        BillAddr: {
          Line1: customer.address?.street,
          City: customer.address?.city,
          CountrySubDivisionCode: customer.address?.state,
          PostalCode: customer.address?.zipCode,
          Country: customer.address?.country || 'USA'
        },
        Notes: `Benefit Program: ${customer.benefitProgram || 'N/A'}`
      };

      let response;
      if (existingCustomer) {
        qbCustomer.Id = existingCustomer.Id;
        qbCustomer.SyncToken = existingCustomer.SyncToken;
        response = await this.makeQBRequest(
          realmId,
          'POST',
          '/v3/company/{realmId}/customer',
          qbCustomer
        );
      } else {
        response = await this.makeQBRequest(
          realmId,
          'POST',
          '/v3/company/{realmId}/customer',
          qbCustomer
        );
      }

      return {
        success: true,
        qbId: response.Customer.Id,
        displayName: response.Customer.DisplayName
      };

    } catch (error) {
      console.error('QB customer error:', error);
      throw error;
    }
  }

  /**
   * Invoice Operations
   */
  async createInvoice(realmId, invoice) {
    try {
      const qbInvoice = {
        DocNumber: invoice.invoiceNumber,
        TxnDate: invoice.date,
        DueDate: invoice.dueDate,
        CustomerRef: {
          value: await this.getCustomerId(realmId, invoice.customerId)
        },
        Line: [],
        CustomerMemo: {
          value: invoice.memo
        }
      };

      // Add line items
      for (const item of invoice.items) {
        qbInvoice.Line.push({
          DetailType: 'SalesItemLineDetail',
          Amount: item.amount,
          SalesItemLineDetail: {
            ItemRef: {
              value: await this.getItemId(realmId, item.productId)
            },
            Qty: item.quantity || 1,
            UnitPrice: item.unitPrice || item.amount
          },
          Description: item.description
        });
      }

      const response = await this.makeQBRequest(
        realmId,
        'POST',
        '/v3/company/{realmId}/invoice',
        qbInvoice
      );

      return {
        success: true,
        qbId: response.Invoice.Id,
        invoiceNumber: response.Invoice.DocNumber
      };

    } catch (error) {
      console.error('QB invoice error:', error);
      throw error;
    }
  }

  /**
   * Payment Operations
   */
  async recordPayment(realmId, payment) {
    try {
      const qbPayment = {
        TotalAmt: payment.amount,
        CustomerRef: {
          value: await this.getCustomerId(realmId, payment.customerId)
        },
        DepositToAccountRef: {
          value: await this.getAccountId(realmId, '1000') // Cash account
        },
        PaymentMethodRef: {
          value: await this.getPaymentMethodId(realmId, payment.method)
        },
        TxnDate: payment.date,
        PrivateNote: payment.description
      };

      // Link to invoice if specified
      if (payment.invoiceId) {
        qbPayment.Line = [{
          Amount: payment.amount,
          LinkedTxn: [{
            TxnId: payment.invoiceId,
            TxnType: 'Invoice'
          }]
        }];
      }

      const response = await this.makeQBRequest(
        realmId,
        'POST',
        '/v3/company/{realmId}/payment',
        qbPayment
      );

      return {
        success: true,
        qbId: response.Payment.Id,
        paymentNumber: response.Payment.PaymentRefNum
      };

    } catch (error) {
      console.error('QB payment error:', error);
      throw error;
    }
  }

  /**
   * Expense Operations
   */
  async createExpense(realmId, expense) {
    try {
      const qbExpense = {
        PaymentType: expense.paymentType || 'Cash',
        TotalAmt: expense.amount,
        TxnDate: expense.date,
        PrivateNote: expense.description,
        Line: []
      };

      // Add expense lines
      for (const line of expense.lines) {
        qbExpense.Line.push({
          DetailType: 'AccountBasedExpenseLineDetail',
          Amount: line.amount,
          AccountBasedExpenseLineDetail: {
            AccountRef: {
              value: await this.getAccountId(realmId, line.accountCode)
            },
            ClassRef: line.classId ? { value: line.classId } : undefined
          },
          Description: line.description
        });
      }

      // Set entity (vendor or customer)
      if (expense.vendorId) {
        qbExpense.EntityRef = {
          value: expense.vendorId,
          type: 'Vendor'
        };
      }

      const response = await this.makeQBRequest(
        realmId,
        'POST',
        '/v3/company/{realmId}/purchase',
        qbExpense
      );

      return {
        success: true,
        qbId: response.Purchase.Id
      };

    } catch (error) {
      console.error('QB expense error:', error);
      throw error;
    }
  }

  /**
   * Report Operations
   */
  async getBalanceSheet(realmId, date) {
    try {
      const params = {
        date: date || new Date().toISOString().split('T')[0]
      };

      const response = await this.makeQBRequest(
        realmId,
        'GET',
        '/v3/company/{realmId}/reports/BalanceSheet',
        null,
        params
      );

      return this.parseQBReport(response);

    } catch (error) {
      console.error('QB balance sheet error:', error);
      throw error;
    }
  }

  async getProfitAndLoss(realmId, startDate, endDate) {
    try {
      const params = {
        start_date: startDate,
        end_date: endDate || new Date().toISOString().split('T')[0]
      };

      const response = await this.makeQBRequest(
        realmId,
        'GET',
        '/v3/company/{realmId}/reports/ProfitAndLoss',
        null,
        params
      );

      return this.parseQBReport(response);

    } catch (error) {
      console.error('QB P&L error:', error);
      throw error;
    }
  }

  /**
   * Sync Operations
   */
  async syncBenefitTransactions(realmId, transactions) {
    const results = {
      successful: 0,
      failed: 0,
      errors: []
    };

    for (const txn of transactions) {
      try {
        // Create journal entry for benefit disbursement
        const journalEntry = {
          date: txn.date,
          reference: txn.id,
          description: `${txn.programType} benefit disbursement`,
          lines: [
            {
              accountCode: this.benefitAccountMapping[txn.programType]?.accountNumber || '2400',
              debitAmount: txn.amount,
              creditAmount: 0,
              description: 'Benefit disbursement'
            },
            {
              accountCode: '1000', // Cash
              debitAmount: 0,
              creditAmount: txn.amount,
              description: 'Cash payment'
            }
          ]
        };

        await this.createJournalEntry(realmId, journalEntry);
        results.successful++;

      } catch (error) {
        results.failed++;
        results.errors.push({
          transactionId: txn.id,
          error: error.message
        });
      }
    }

    return results;
  }

  /**
   * Chart of Accounts Management
   */
  async createAccount(realmId, account) {
    try {
      const qbAccount = {
        Name: account.name,
        AccountType: this.mapAccountType(account.type),
        AccountSubType: this.mapAccountSubType(account.type, account.subType),
        AcctNum: account.number,
        Description: account.description,
        Active: true
      };

      const response = await this.makeQBRequest(
        realmId,
        'POST',
        '/v3/company/{realmId}/account',
        qbAccount
      );

      return {
        success: true,
        qbId: response.Account.Id,
        name: response.Account.Name
      };

    } catch (error) {
      console.error('QB account creation error:', error);
      throw error;
    }
  }

  async setupBenefitAccounts(realmId) {
    const accounts = [];

    for (const [program, mapping] of Object.entries(this.benefitAccountMapping)) {
      try {
        const account = await this.createAccount(realmId, {
          name: mapping.qbAccount,
          number: mapping.accountNumber,
          type: 'LIABILITY',
          subType: 'OtherCurrentLiability',
          description: `Government benefit account for ${program}`
        });
        accounts.push(account);
      } catch (error) {
        console.error(`Failed to create account for ${program}:`, error);
      }
    }

    return accounts;
  }

  /**
   * Helper Functions
   */
  async makeQBRequest(realmId, method, endpoint, data = null, params = null) {
    try {
      const tokens = await this.getValidTokens(realmId);

      const url = `${this.baseUrl}${endpoint.replace('{realmId}', realmId)}`;
      const config = {
        method: method,
        url: url,
        headers: {
          'Authorization': `Bearer ${tokens.accessToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        params: {
          ...params,
          minorversion: this.config.minorVersion
        }
      };

      if (data) {
        config.data = data;
      }

      const response = await axios(config);
      return response.data;

    } catch (error) {
      if (error.response?.status === 401) {
        // Token expired, refresh and retry
        await this.refreshAccessToken(realmId);
        return this.makeQBRequest(realmId, method, endpoint, data, params);
      }
      throw error;
    }
  }

  async getValidTokens(realmId) {
    let tokens = this.tokenStore.get(realmId);

    if (!tokens) {
      tokens = await this.loadTokens(realmId);
      if (tokens) {
        this.tokenStore.set(realmId, tokens);
      } else {
        throw new Error('No tokens available for realm');
      }
    }

    // Check if token is expired
    const expiresAt = tokens.createdAt + (tokens.expiresIn * 1000);
    if (Date.now() >= expiresAt - 60000) { // Refresh 1 minute before expiry
      tokens = await this.refreshAccessToken(realmId);
    }

    return tokens;
  }

  async getAccountId(realmId, accountCode) {
    // Query QB for account by code
    const query = `SELECT * FROM Account WHERE AcctNum = '${accountCode}'`;
    const response = await this.makeQBRequest(
      realmId,
      'GET',
      `/v3/company/${realmId}/query`,
      null,
      { query }
    );

    if (response.QueryResponse?.Account?.length > 0) {
      return response.QueryResponse.Account[0].Id;
    }

    // Create account if not found
    const newAccount = await this.createAccount(realmId, {
      name: `Account ${accountCode}`,
      number: accountCode,
      type: 'ASSET',
      subType: 'OtherCurrentAsset'
    });

    return newAccount.qbId;
  }

  async getCustomerId(realmId, customerId) {
    // Implementation to get or create customer
    return customerId; // Simplified for now
  }

  async findCustomerByEmail(realmId, email) {
    const query = `SELECT * FROM Customer WHERE PrimaryEmailAddr = '${email}'`;
    const response = await this.makeQBRequest(
      realmId,
      'GET',
      `/v3/company/${realmId}/query`,
      null,
      { query }
    );

    if (response.QueryResponse?.Customer?.length > 0) {
      return response.QueryResponse.Customer[0];
    }

    return null;
  }

  mapAccountType(type) {
    const mapping = {
      'ASSET': 'Other Current Asset',
      'LIABILITY': 'Other Current Liability',
      'EQUITY': 'Equity',
      'REVENUE': 'Income',
      'EXPENSE': 'Expense'
    };
    return mapping[type] || 'Other Current Asset';
  }

  mapAccountSubType(type, subType) {
    // Map to QB account subtypes
    if (subType) return subType;

    const defaults = {
      'ASSET': 'OtherCurrentAsset',
      'LIABILITY': 'OtherCurrentLiability',
      'EQUITY': 'RetainedEarnings',
      'REVENUE': 'ServiceFeeIncome',
      'EXPENSE': 'OtherMiscellaneousExpense'
    };
    return defaults[type] || 'OtherCurrentAsset';
  }

  parseQBReport(reportData) {
    // Parse QB report format to standard format
    return {
      header: reportData.Header,
      columns: reportData.Columns,
      rows: reportData.Rows,
      summary: reportData.Summary
    };
  }

  async persistTokens(realmId, tokens) {
    // Store tokens in database
    await global.db.query(
      `INSERT INTO quickbooks_tokens
       (realm_id, access_token, refresh_token, expires_in, created_at)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (realm_id)
       DO UPDATE SET
         access_token = $2,
         refresh_token = $3,
         expires_in = $4,
         updated_at = $5`,
      [realmId, tokens.accessToken, tokens.refreshToken,
       tokens.expiresIn, new Date()]
    );
  }

  async loadTokens(realmId) {
    const result = await global.db.query(
      `SELECT * FROM quickbooks_tokens WHERE realm_id = $1`,
      [realmId]
    );

    if (result.rows.length > 0) {
      const row = result.rows[0];
      return {
        accessToken: row.access_token,
        refreshToken: row.refresh_token,
        expiresIn: row.expires_in,
        realmId: realmId,
        createdAt: row.created_at.getTime()
      };
    }

    return null;
  }

  async storeQBReference(internalId, qbId) {
    await global.db.query(
      `INSERT INTO quickbooks_references
       (internal_id, qb_id, created_at)
       VALUES ($1, $2, $3)`,
      [internalId, qbId, new Date()]
    );
  }
}

export default QuickBooksConnector;