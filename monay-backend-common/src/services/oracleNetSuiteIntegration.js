/**
 * Oracle/NetSuite ERP Integration Service
 * Provides integration with Oracle Cloud ERP and NetSuite via REST APIs
 * Created: 2025-01-21
 */

const { EventEmitter } = require('events');
const axios = require('axios');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

class OracleNetSuiteIntegration extends EventEmitter {
  constructor() {
    super();

    // Oracle Cloud configuration
    this.oracleConfig = {
      baseUrl: process.env.ORACLE_ERP_URL || 'https://oracle.monay.com',
      username: process.env.ORACLE_USERNAME,
      password: process.env.ORACLE_PASSWORD,
      businessUnit: process.env.ORACLE_BU || 'BU_001',
      ledgerId: process.env.ORACLE_LEDGER || 'LED_001'
    };

    // NetSuite configuration
    this.netSuiteConfig = {
      accountId: process.env.NETSUITE_ACCOUNT,
      consumerKey: process.env.NETSUITE_CONSUMER_KEY,
      consumerSecret: process.env.NETSUITE_CONSUMER_SECRET,
      tokenId: process.env.NETSUITE_TOKEN_ID,
      tokenSecret: process.env.NETSUITE_TOKEN_SECRET,
      baseUrl: process.env.NETSUITE_URL || 'https://netsuite.monay.com'
    };

    // Integration modes
    this.integrationModes = {
      REAL_TIME: 'REAL_TIME',
      BATCH: 'BATCH',
      SCHEDULED: 'SCHEDULED'
    };

    // Journal sources
    this.journalSources = {
      PAYMENTS: 'MONAY_PAYMENTS',
      BENEFITS: 'GOV_BENEFITS',
      FEES: 'TRANSACTION_FEES',
      RECONCILIATION: 'BANK_RECON',
      ADJUSTMENTS: 'MANUAL_ADJ'
    };

    // Government benefit GL accounts for Oracle/NetSuite
    this.benefitGLMapping = {
      'SNAP': { oracle: '60110', netSuite: '211-01' },
      'TANF': { oracle: '60120', netSuite: '211-02' },
      'MEDICAID': { oracle: '60130', netSuite: '211-03' },
      'WIC': { oracle: '60140', netSuite: '211-04' },
      'SECTION_8': { oracle: '60150', netSuite: '211-05' },
      'LIHEAP': { oracle: '60160', netSuite: '211-06' },
      'UNEMPLOYMENT': { oracle: '60170', netSuite: '211-07' },
      'SCHOOL_CHOICE': { oracle: '60180', netSuite: '211-08' },
      'CHILD_CARE': { oracle: '60190', netSuite: '211-09' },
      'VETERANS': { oracle: '60200', netSuite: '211-10' },
      'TRANSPORTATION': { oracle: '60210', netSuite: '211-11' },
      'EMERGENCY_RENTAL': { oracle: '60220', netSuite: '211-12' },
      'FREE_MEALS': { oracle: '60230', netSuite: '211-13' },
      'EITC': { oracle: '60240', netSuite: '211-14' }
    };

    this.batchQueue = [];
    this.batchSize = 100;
    this.batchInterval = null;
  }

  /**
   * Oracle ERP Cloud Integration
   */

  /**
   * Post journal entry to Oracle Cloud ERP
   */
  async postToOracle(journalEntry) {
    try {
      const oracleJournal = {
        journalBatchName: `MONAY_${new Date().toISOString().split('T')[0]}`,
        journalEntries: [{
          journalName: journalEntry.description || `JE_${journalEntry.id}`,
          ledgerId: this.oracleConfig.ledgerId,
          accountingDate: journalEntry.date,
          currencyCode: journalEntry.currency || 'USD',
          journalCategory: this.mapJournalCategory(journalEntry.type),
          journalSource: this.journalSources[journalEntry.source] || 'MANUAL',
          description: journalEntry.description,
          reference: journalEntry.reference || journalEntry.id,
          journalLines: []
        }]
      };

      // Build journal lines
      journalEntry.lines.forEach((line, index) => {
        oracleJournal.journalEntries[0].journalLines.push({
          lineNumber: index + 1,
          accountCombination: this.buildOracleAccountString(line),
          debitAmount: line.debitAmount || null,
          creditAmount: line.creditAmount || null,
          description: line.description,
          reference1: line.reference,
          attribute1: line.costCenter,
          attribute2: line.profitCenter,
          attribute3: line.project
        });
      });

      // Call Oracle REST API
      const response = await this.callOracleAPI('/fscmRestApi/resources/11.13.18.05/journalBatches',
        'POST',
        oracleJournal
      );

      if (response.success) {
        // Store Oracle journal reference
        await this.storeERPReference('ORACLE', journalEntry.id, response.journalBatchId);

        this.emit('oracle_posted', {
          journalEntryId: journalEntry.id,
          oracleBatchId: response.journalBatchId
        });

        return {
          success: true,
          batchId: response.journalBatchId,
          status: response.status
        };
      } else {
        throw new Error(response.error || 'Oracle posting failed');
      }

    } catch (error) {
      console.error('Oracle posting error:', error);
      throw error;
    }
  }

  /**
   * Create subledger accounting event in Oracle
   */
  async createOracleSubledgerEvent(transaction) {
    try {
      const event = {
        eventClassCode: this.getOracleEventClass(transaction.type),
        eventTypeCode: transaction.type,
        eventDate: transaction.date,
        transactionNumber: transaction.id,
        ledgerId: this.oracleConfig.ledgerId,
        legalEntityId: transaction.legalEntityId || this.oracleConfig.businessUnit,
        eventAmount: transaction.amount,
        currencyCode: transaction.currency || 'USD',
        accountingLines: []
      };

      // Generate accounting lines based on transaction type
      const accountingLines = await this.generateOracleAccountingLines(transaction);
      event.accountingLines = accountingLines;

      // Submit to Oracle Subledger Accounting
      const response = await this.callOracleAPI(
        '/fscmRestApi/resources/11.13.18.05/subledgerAccountingEvents',
        'POST',
        event
      );

      return {
        success: response.success,
        eventId: response.eventId
      };

    } catch (error) {
      console.error('Oracle subledger event error:', error);
      throw error;
    }
  }

  /**
   * Import journal batch to Oracle GL
   */
  async importOracleJournalBatch(batchData) {
    try {
      // Prepare import interface
      const importRequest = {
        importSource: this.journalSources.PAYMENTS,
        groupId: uuidv4(),
        journals: batchData.journals.map(journal => ({
          status: 'NEW',
          ledgerId: this.oracleConfig.ledgerId,
          accountingDate: journal.date,
          currencyCode: journal.currency,
          actualFlag: 'A',
          userJournalCategory: journal.category,
          userJournalSource: journal.source,
          journalReference: journal.reference,
          journalDescription: journal.description,
          lines: journal.lines
        }))
      };

      // Load to GL interface table
      const loadResponse = await this.callOracleAPI(
        '/fscmRestApi/resources/11.13.18.05/journalImportRequests',
        'POST',
        importRequest
      );

      if (loadResponse.success) {
        // Trigger import process
        const importResponse = await this.callOracleAPI(
          `/fscmRestApi/resources/11.13.18.05/journalImportRequests/${loadResponse.requestId}/action/import`,
          'POST'
        );

        return {
          success: true,
          requestId: loadResponse.requestId,
          status: importResponse.status
        };
      }

      throw new Error('Oracle batch import failed');

    } catch (error) {
      console.error('Oracle batch import error:', error);
      throw error;
    }
  }

  /**
   * NetSuite Integration
   */

  /**
   * Post journal entry to NetSuite
   */
  async postToNetSuite(journalEntry) {
    try {
      const netSuiteJournal = {
        recordType: 'journalEntry',
        subsidiary: journalEntry.subsidiaryId || '1',
        currency: { id: this.getNetSuiteCurrencyId(journalEntry.currency || 'USD') },
        exchangeRate: journalEntry.exchangeRate || 1,
        tranDate: this.formatNetSuiteDate(journalEntry.date),
        memo: journalEntry.description,
        externalId: journalEntry.id,
        approved: false,
        lines: []
      };

      // Build journal lines
      journalEntry.lines.forEach(line => {
        netSuiteJournal.lines.push({
          account: { id: this.mapToNetSuiteAccount(line.accountCode) },
          debit: line.debitAmount || 0,
          credit: line.creditAmount || 0,
          memo: line.description,
          department: line.costCenter ? { id: line.costCenter } : null,
          class: line.profitCenter ? { id: line.profitCenter } : null,
          location: line.location ? { id: line.location } : null,
          customFields: this.buildNetSuiteCustomFields(line)
        });
      });

      // Call NetSuite SuiteTalk API
      const response = await this.callNetSuiteAPI('POST', '/record/v1/journalEntry', netSuiteJournal);

      if (response.success) {
        // Store NetSuite reference
        await this.storeERPReference('NETSUITE', journalEntry.id, response.id);

        this.emit('netsuite_posted', {
          journalEntryId: journalEntry.id,
          netSuiteId: response.id
        });

        return {
          success: true,
          netSuiteId: response.id,
          documentNumber: response.tranId
        };
      } else {
        throw new Error(response.error || 'NetSuite posting failed');
      }

    } catch (error) {
      console.error('NetSuite posting error:', error);
      throw error;
    }
  }

  /**
   * Create custom GL impact tracking in NetSuite
   */
  async trackNetSuiteGLImpact(transaction) {
    try {
      const glImpact = {
        recordType: 'customrecord_gl_impact',
        name: `GL_IMPACT_${transaction.id}`,
        custrecord_transaction_id: transaction.id,
        custrecord_transaction_type: transaction.type,
        custrecord_amount: transaction.amount,
        custrecord_gl_date: this.formatNetSuiteDate(transaction.date),
        custrecord_status: 'PENDING',
        custrecord_impact_lines: []
      };

      // Calculate GL impact
      const impactLines = await this.calculateNetSuiteGLImpact(transaction);

      impactLines.forEach(line => {
        glImpact.custrecord_impact_lines.push({
          account: line.account,
          debit: line.debit,
          credit: line.credit,
          memo: line.memo
        });
      });

      // Create custom record
      const response = await this.callNetSuiteAPI(
        'POST',
        '/record/v1/customrecord_gl_impact',
        glImpact
      );

      return {
        success: response.success,
        impactId: response.id
      };

    } catch (error) {
      console.error('NetSuite GL impact tracking error:', error);
      throw error;
    }
  }

  /**
   * Consolidate NetSuite subsidiaries
   */
  async consolidateNetSuiteSubsidiaries(periodEnd) {
    try {
      const consolidation = {
        recordType: 'consolidatedExchangeRate',
        fromSubsidiary: { id: '1' },
        toSubsidiary: { id: '2' },
        period: { id: this.getNetSuitePeriodId(periodEnd) },
        currentRate: 1,
        averageRate: 1,
        historicalRate: 1
      };

      // Run consolidation
      const response = await this.callNetSuiteAPI(
        'POST',
        '/record/v1/consolidatedExchangeRate',
        consolidation
      );

      // Trigger elimination entries
      await this.createEliminationEntries(periodEnd);

      return {
        success: true,
        consolidationId: response.id
      };

    } catch (error) {
      console.error('NetSuite consolidation error:', error);
      throw error;
    }
  }

  /**
   * Shared Integration Functions
   */

  /**
   * Process real-time journal entry
   */
  async processRealTimeJournal(journalEntry, targetSystem) {
    try {
      let result;

      switch (targetSystem) {
        case 'ORACLE':
          result = await this.postToOracle(journalEntry);
          break;
        case 'NETSUITE':
          result = await this.postToNetSuite(journalEntry);
          break;
        default:
          throw new Error(`Unsupported ERP system: ${targetSystem}`);
      }

      // Update status
      await this.updateJournalStatus(journalEntry.id, 'POSTED', targetSystem);

      return result;

    } catch (error) {
      await this.updateJournalStatus(journalEntry.id, 'ERROR', targetSystem);
      throw error;
    }
  }

  /**
   * Process batch GL posting
   */
  async processBatchPosting(targetSystem) {
    try {
      // Get pending journals
      const pendingJournals = await this.getPendingJournals(targetSystem);

      if (pendingJournals.length === 0) {
        return { success: true, message: 'No pending journals' };
      }

      // Group by posting date
      const groupedJournals = this.groupJournalsByDate(pendingJournals);

      const results = {
        successful: 0,
        failed: 0,
        errors: []
      };

      for (const [date, journals] of Object.entries(groupedJournals)) {
        try {
          if (targetSystem === 'ORACLE') {
            await this.importOracleJournalBatch({
              date: date,
              journals: journals
            });
          } else if (targetSystem === 'NETSUITE') {
            // NetSuite batch processing
            for (const journal of journals) {
              await this.postToNetSuite(journal);
            }
          }

          results.successful += journals.length;
        } catch (error) {
          results.failed += journals.length;
          results.errors.push({
            date: date,
            error: error.message
          });
        }
      }

      return results;

    } catch (error) {
      console.error('Batch posting error:', error);
      throw error;
    }
  }

  /**
   * Handle multi-currency conversion
   */
  async convertCurrency(amount, fromCurrency, toCurrency, date) {
    try {
      if (fromCurrency === toCurrency) {
        return amount;
      }

      // Get exchange rate
      const rate = await this.getExchangeRate(fromCurrency, toCurrency, date);

      return amount * rate;

    } catch (error) {
      console.error('Currency conversion error:', error);
      throw error;
    }
  }

  /**
   * Create intercompany elimination entries
   */
  async createEliminationEntries(periodEnd) {
    try {
      // Get intercompany transactions
      const intercompanyTxns = await this.getIntercompanyTransactions(periodEnd);

      const eliminationEntries = [];

      for (const txn of intercompanyTxns) {
        const elimination = {
          type: 'ELIMINATION',
          date: periodEnd,
          description: `Intercompany elimination: ${txn.description}`,
          lines: [
            {
              accountCode: txn.fromAccount,
              debitAmount: 0,
              creditAmount: txn.amount
            },
            {
              accountCode: txn.toAccount,
              debitAmount: txn.amount,
              creditAmount: 0
            }
          ]
        };

        eliminationEntries.push(elimination);
      }

      // Post elimination entries
      for (const entry of eliminationEntries) {
        await this.processRealTimeJournal(entry, 'ORACLE');
        await this.processRealTimeJournal(entry, 'NETSUITE');
      }

      return {
        success: true,
        entriesCreated: eliminationEntries.length
      };

    } catch (error) {
      console.error('Elimination entries error:', error);
      throw error;
    }
  }

  /**
   * Create period-end closing entries
   */
  async createClosingEntries(periodEnd, targetSystem) {
    try {
      const closingEntries = [];

      // Close revenue accounts
      const revenueAccounts = await this.getRevenueAccounts(periodEnd);
      if (revenueAccounts.length > 0) {
        closingEntries.push({
          type: 'CLOSING',
          date: periodEnd,
          description: 'Close revenue accounts',
          lines: this.buildClosingLines(revenueAccounts, 'REVENUE')
        });
      }

      // Close expense accounts
      const expenseAccounts = await this.getExpenseAccounts(periodEnd);
      if (expenseAccounts.length > 0) {
        closingEntries.push({
          type: 'CLOSING',
          date: periodEnd,
          description: 'Close expense accounts',
          lines: this.buildClosingLines(expenseAccounts, 'EXPENSE')
        });
      }

      // Post closing entries
      for (const entry of closingEntries) {
        await this.processRealTimeJournal(entry, targetSystem);
      }

      return {
        success: true,
        entriesCreated: closingEntries.length
      };

    } catch (error) {
      console.error('Closing entries error:', error);
      throw error;
    }
  }

  /**
   * Handle deferred revenue recognition
   */
  async recognizeDeferredRevenue(periodEnd) {
    try {
      // Get deferred revenue schedules
      const deferredSchedules = await this.getDeferredRevenueSchedules(periodEnd);

      const recognitionEntries = [];

      for (const schedule of deferredSchedules) {
        const recognitionAmount = this.calculateRecognitionAmount(schedule, periodEnd);

        if (recognitionAmount > 0) {
          recognitionEntries.push({
            type: 'REVENUE_RECOGNITION',
            date: periodEnd,
            description: `Revenue recognition: ${schedule.description}`,
            lines: [
              {
                accountCode: '2400', // Deferred Revenue
                debitAmount: recognitionAmount,
                creditAmount: 0
              },
              {
                accountCode: '4000', // Revenue
                debitAmount: 0,
                creditAmount: recognitionAmount
              }
            ]
          });
        }
      }

      // Post recognition entries
      for (const entry of recognitionEntries) {
        await this.processRealTimeJournal(entry, 'ORACLE');
        await this.processRealTimeJournal(entry, 'NETSUITE');
      }

      return {
        success: true,
        amountRecognized: recognitionEntries.reduce((sum, e) =>
          sum + e.lines[0].debitAmount, 0
        )
      };

    } catch (error) {
      console.error('Deferred revenue recognition error:', error);
      throw error;
    }
  }

  /**
   * API Call Functions
   */

  /**
   * Call Oracle REST API
   */
  async callOracleAPI(endpoint, method = 'GET', data = null) {
    try {
      const auth = Buffer.from(
        `${this.oracleConfig.username}:${this.oracleConfig.password}`
      ).toString('base64');

      const config = {
        method: method,
        url: `${this.oracleConfig.baseUrl}${endpoint}`,
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json'
        }
      };

      if (data) {
        config.data = data;
      }

      const response = await axios(config);

      return {
        success: true,
        ...response.data
      };

    } catch (error) {
      console.error('Oracle API error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Call NetSuite SuiteTalk API
   */
  async callNetSuiteAPI(method, endpoint, data = null) {
    try {
      const timestamp = Math.floor(Date.now() / 1000);
      const nonce = uuidv4();

      // Build OAuth signature
      const signature = this.buildNetSuiteOAuthSignature(
        method,
        `${this.netSuiteConfig.baseUrl}${endpoint}`,
        timestamp,
        nonce
      );

      const headers = {
        'Authorization': this.buildOAuthHeader(signature, timestamp, nonce),
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };

      const config = {
        method: method,
        url: `${this.netSuiteConfig.baseUrl}${endpoint}`,
        headers: headers
      };

      if (data) {
        config.data = data;
      }

      const response = await axios(config);

      return {
        success: true,
        ...response.data
      };

    } catch (error) {
      console.error('NetSuite API error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Build NetSuite OAuth signature
   */
  buildNetSuiteOAuthSignature(method, url, timestamp, nonce) {
    const params = {
      oauth_consumer_key: this.netSuiteConfig.consumerKey,
      oauth_nonce: nonce,
      oauth_signature_method: 'HMAC-SHA256',
      oauth_timestamp: timestamp,
      oauth_token: this.netSuiteConfig.tokenId,
      oauth_version: '1.0'
    };

    const paramString = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');

    const baseString = `${method}&${encodeURIComponent(url)}&${encodeURIComponent(paramString)}`;
    const signingKey = `${this.netSuiteConfig.consumerSecret}&${this.netSuiteConfig.tokenSecret}`;

    return crypto
      .createHmac('sha256', signingKey)
      .update(baseString)
      .digest('base64');
  }

  /**
   * Helper Functions
   */

  buildOracleAccountString(line) {
    // Build Oracle account combination string
    return `${line.company || '01'}.${line.accountCode}.${line.costCenter || '000'}.${line.project || '000'}`;
  }

  mapToNetSuiteAccount(accountCode) {
    // Map internal account code to NetSuite internal ID
    const mapping = {
      '1000': '123', // Cash
      '1100': '124', // AR
      '2000': '201', // AP
      '4000': '400'  // Revenue
    };
    return mapping[accountCode] || accountCode;
  }

  formatNetSuiteDate(date) {
    const d = new Date(date);
    return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
  }

  getNetSuiteCurrencyId(currency) {
    const currencies = {
      'USD': '1',
      'EUR': '2',
      'GBP': '3'
    };
    return currencies[currency] || '1';
  }

  async storeERPReference(system, internalId, erpId) {
    await global.db.query(
      `INSERT INTO erp_references
       (system, internal_id, erp_id, created_at)
       VALUES ($1, $2, $3, $4)`,
      [system, internalId, erpId, new Date()]
    );
  }

  async updateJournalStatus(journalId, status, system) {
    await global.db.query(
      `UPDATE journal_entries
       SET erp_status = $1, erp_system = $2, updated_at = $3
       WHERE id = $4`,
      [status, system, new Date(), journalId]
    );
  }
}

module.exports = OracleNetSuiteIntegration;