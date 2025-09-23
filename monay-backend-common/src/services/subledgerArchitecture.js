/**
 * Subledger Architecture Service
 * Implements double-entry bookkeeping and journal entry generation for ERP integration
 * Created: 2025-01-21
 */

const { EventEmitter } = require('events');
const { v4: uuidv4 } = require('uuid');

class SubledgerArchitecture extends EventEmitter {
  constructor() {
    super();

    this.accountTypes = {
      ASSET: 'ASSET',
      LIABILITY: 'LIABILITY',
      EQUITY: 'EQUITY',
      REVENUE: 'REVENUE',
      EXPENSE: 'EXPENSE',
      CONTRA_ASSET: 'CONTRA_ASSET',
      CONTRA_LIABILITY: 'CONTRA_LIABILITY'
    };

    this.journalTypes = {
      STANDARD: 'STANDARD',
      ADJUSTING: 'ADJUSTING',
      CLOSING: 'CLOSING',
      REVERSING: 'REVERSING',
      RECURRING: 'RECURRING',
      ALLOCATION: 'ALLOCATION',
      REVALUATION: 'REVALUATION'
    };

    this.postingStatus = {
      DRAFT: 'DRAFT',
      PENDING_APPROVAL: 'PENDING_APPROVAL',
      APPROVED: 'APPROVED',
      POSTED: 'POSTED',
      REVERSED: 'REVERSED',
      ERROR: 'ERROR'
    };

    // Chart of Accounts structure
    this.chartOfAccounts = {
      // Assets (1000-1999)
      '1000': { name: 'Cash', type: 'ASSET', normalBalance: 'DEBIT' },
      '1100': { name: 'Accounts Receivable', type: 'ASSET', normalBalance: 'DEBIT' },
      '1200': { name: 'Inventory', type: 'ASSET', normalBalance: 'DEBIT' },
      '1300': { name: 'Prepaid Expenses', type: 'ASSET', normalBalance: 'DEBIT' },
      '1400': { name: 'Fixed Assets', type: 'ASSET', normalBalance: 'DEBIT' },
      '1500': { name: 'Accumulated Depreciation', type: 'CONTRA_ASSET', normalBalance: 'CREDIT' },

      // Liabilities (2000-2999)
      '2000': { name: 'Accounts Payable', type: 'LIABILITY', normalBalance: 'CREDIT' },
      '2100': { name: 'Accrued Expenses', type: 'LIABILITY', normalBalance: 'CREDIT' },
      '2200': { name: 'Notes Payable', type: 'LIABILITY', normalBalance: 'CREDIT' },
      '2300': { name: 'Customer Deposits', type: 'LIABILITY', normalBalance: 'CREDIT' },
      '2400': { name: 'Government Benefits Payable', type: 'LIABILITY', normalBalance: 'CREDIT' },

      // Equity (3000-3999)
      '3000': { name: 'Common Stock', type: 'EQUITY', normalBalance: 'CREDIT' },
      '3100': { name: 'Retained Earnings', type: 'EQUITY', normalBalance: 'CREDIT' },
      '3200': { name: 'Additional Paid-in Capital', type: 'EQUITY', normalBalance: 'CREDIT' },

      // Revenue (4000-4999)
      '4000': { name: 'Sales Revenue', type: 'REVENUE', normalBalance: 'CREDIT' },
      '4100': { name: 'Service Revenue', type: 'REVENUE', normalBalance: 'CREDIT' },
      '4200': { name: 'Transaction Fee Revenue', type: 'REVENUE', normalBalance: 'CREDIT' },
      '4300': { name: 'Interest Income', type: 'REVENUE', normalBalance: 'CREDIT' },
      '4400': { name: 'Government Subsidy Revenue', type: 'REVENUE', normalBalance: 'CREDIT' },

      // Expenses (5000-5999)
      '5000': { name: 'Cost of Goods Sold', type: 'EXPENSE', normalBalance: 'DEBIT' },
      '5100': { name: 'Salary Expense', type: 'EXPENSE', normalBalance: 'DEBIT' },
      '5200': { name: 'Rent Expense', type: 'EXPENSE', normalBalance: 'DEBIT' },
      '5300': { name: 'Depreciation Expense', type: 'EXPENSE', normalBalance: 'DEBIT' },
      '5400': { name: 'Transaction Processing Fees', type: 'EXPENSE', normalBalance: 'DEBIT' },
      '5500': { name: 'Compliance Costs', type: 'EXPENSE', normalBalance: 'DEBIT' }
    };

    // Government benefit specific accounts
    this.benefitAccounts = {
      'SNAP': '2401',
      'TANF': '2402',
      'MEDICAID': '2403',
      'WIC': '2404',
      'SECTION_8': '2405',
      'LIHEAP': '2406',
      'UNEMPLOYMENT': '2407',
      'SCHOOL_CHOICE': '2408',
      'CHILD_CARE': '2409',
      'VETERANS': '2410',
      'TRANSPORTATION': '2411',
      'EMERGENCY_RENTAL': '2412',
      'FREE_MEALS': '2413',
      'EITC': '2414'
    };
  }

  /**
   * Create journal entry with double-entry bookkeeping
   */
  async createJournalEntry(entryData) {
    try {
      const entry = {
        id: uuidv4(),
        entryNumber: await this.generateEntryNumber(),
        date: entryData.date || new Date(),
        type: entryData.type || this.journalTypes.STANDARD,
        description: entryData.description,
        reference: entryData.reference,
        organizationId: entryData.organizationId,
        createdBy: entryData.userId,
        status: this.postingStatus.DRAFT,
        lines: [],
        metadata: entryData.metadata || {},
        createdAt: new Date()
      };

      let totalDebits = 0;
      let totalCredits = 0;

      // Process journal lines
      for (const line of entryData.lines) {
        const account = this.chartOfAccounts[line.accountCode];
        if (!account) {
          throw new Error(`Invalid account code: ${line.accountCode}`);
        }

        const journalLine = {
          id: uuidv4(),
          accountCode: line.accountCode,
          accountName: account.name,
          accountType: account.type,
          description: line.description || entry.description,
          debitAmount: line.debitAmount || 0,
          creditAmount: line.creditAmount || 0,
          costCenter: line.costCenter,
          profitCenter: line.profitCenter,
          project: line.project,
          reference: line.reference,
          currency: line.currency || 'USD'
        };

        totalDebits += journalLine.debitAmount;
        totalCredits += journalLine.creditAmount;

        entry.lines.push(journalLine);
      }

      // Validate double-entry balance
      if (Math.abs(totalDebits - totalCredits) > 0.01) {
        throw new Error(`Journal entry is not balanced. Debits: ${totalDebits}, Credits: ${totalCredits}`);
      }

      entry.totalDebits = totalDebits;
      entry.totalCredits = totalCredits;

      // Save to database
      await this.saveJournalEntry(entry);

      this.emit('journal_created', entry);
      return entry;

    } catch (error) {
      console.error('Journal entry creation error:', error);
      throw error;
    }
  }

  /**
   * Process transaction and generate journal entries
   */
  async processTransaction(transaction) {
    const entries = [];

    switch (transaction.type) {
      case 'BENEFIT_DISBURSEMENT':
        entries.push(await this.createBenefitDisbursementEntry(transaction));
        break;

      case 'PAYMENT_RECEIVED':
        entries.push(await this.createPaymentReceivedEntry(transaction));
        break;

      case 'FEE_CHARGED':
        entries.push(await this.createFeeChargedEntry(transaction));
        break;

      case 'CARD_TRANSACTION':
        entries.push(await this.createCardTransactionEntry(transaction));
        break;

      case 'TRANSFER':
        entries.push(await this.createTransferEntry(transaction));
        break;

      case 'REFUND':
        entries.push(await this.createRefundEntry(transaction));
        break;

      case 'CHARGEBACK':
        entries.push(await this.createChargebackEntry(transaction));
        break;
    }

    return entries;
  }

  /**
   * Create benefit disbursement journal entry
   */
  async createBenefitDisbursementEntry(transaction) {
    const benefitAccount = this.benefitAccounts[transaction.programType] || '2400';

    return await this.createJournalEntry({
      type: this.journalTypes.STANDARD,
      description: `${transaction.programType} benefit disbursement to ${transaction.beneficiaryId}`,
      reference: transaction.id,
      organizationId: transaction.organizationId,
      userId: transaction.processedBy,
      lines: [
        {
          accountCode: benefitAccount,
          description: 'Benefit disbursement',
          debitAmount: transaction.amount,
          creditAmount: 0,
          costCenter: transaction.costCenter
        },
        {
          accountCode: '1000', // Cash
          description: 'Cash disbursement',
          debitAmount: 0,
          creditAmount: transaction.amount,
          costCenter: transaction.costCenter
        }
      ]
    });
  }

  /**
   * Create payment received journal entry
   */
  async createPaymentReceivedEntry(transaction) {
    return await this.createJournalEntry({
      type: this.journalTypes.STANDARD,
      description: `Payment received from ${transaction.payerId}`,
      reference: transaction.id,
      organizationId: transaction.organizationId,
      userId: transaction.processedBy,
      lines: [
        {
          accountCode: '1000', // Cash
          description: 'Cash received',
          debitAmount: transaction.amount,
          creditAmount: 0
        },
        {
          accountCode: '1100', // Accounts Receivable
          description: 'AR reduction',
          debitAmount: 0,
          creditAmount: transaction.amount
        }
      ]
    });
  }

  /**
   * Create fee charged journal entry
   */
  async createFeeChargedEntry(transaction) {
    return await this.createJournalEntry({
      type: this.journalTypes.STANDARD,
      description: `Transaction fee for ${transaction.reference}`,
      reference: transaction.id,
      organizationId: transaction.organizationId,
      userId: transaction.processedBy,
      lines: [
        {
          accountCode: '5400', // Transaction Processing Fees
          description: 'Processing fee expense',
          debitAmount: transaction.feeAmount,
          creditAmount: 0
        },
        {
          accountCode: '1000', // Cash
          description: 'Fee payment',
          debitAmount: 0,
          creditAmount: transaction.feeAmount
        }
      ]
    });
  }

  /**
   * Post journal entries to general ledger
   */
  async postToGeneralLedger(entryId) {
    try {
      const entry = await this.getJournalEntry(entryId);

      if (entry.status !== this.postingStatus.APPROVED) {
        throw new Error('Journal entry must be approved before posting');
      }

      // Begin transaction
      await global.db.query('BEGIN');

      try {
        // Update account balances
        for (const line of entry.lines) {
          await this.updateAccountBalance(
            line.accountCode,
            line.debitAmount,
            line.creditAmount,
            entry.date
          );
        }

        // Create GL records
        for (const line of entry.lines) {
          await global.db.query(
            `INSERT INTO general_ledger
             (id, journal_entry_id, account_code, account_name,
              debit_amount, credit_amount, posting_date,
              cost_center, profit_center, reference, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
            [
              uuidv4(),
              entry.id,
              line.accountCode,
              line.accountName,
              line.debitAmount,
              line.creditAmount,
              entry.date,
              line.costCenter,
              line.profitCenter,
              entry.reference,
              'POSTED'
            ]
          );
        }

        // Update journal entry status
        await global.db.query(
          `UPDATE journal_entries SET status = $1, posted_at = $2 WHERE id = $3`,
          [this.postingStatus.POSTED, new Date(), entry.id]
        );

        await global.db.query('COMMIT');

        this.emit('journal_posted', entry);
        return { success: true, entryId: entry.id };

      } catch (error) {
        await global.db.query('ROLLBACK');
        throw error;
      }

    } catch (error) {
      console.error('GL posting error:', error);
      throw error;
    }
  }

  /**
   * Update account balance
   */
  async updateAccountBalance(accountCode, debitAmount, creditAmount, date) {
    const account = this.chartOfAccounts[accountCode];

    const balanceChange = account.normalBalance === 'DEBIT'
      ? debitAmount - creditAmount
      : creditAmount - debitAmount;

    await global.db.query(
      `INSERT INTO account_balances
       (account_code, balance_date, balance_amount, last_updated)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (account_code, balance_date)
       DO UPDATE SET
         balance_amount = account_balances.balance_amount + $3,
         last_updated = $4`,
      [accountCode, date, balanceChange, new Date()]
    );
  }

  /**
   * Generate trial balance
   */
  async generateTrialBalance(date, organizationId) {
    const balances = await global.db.query(
      `SELECT
        ab.account_code,
        coa.account_name,
        coa.account_type,
        coa.normal_balance,
        SUM(CASE
          WHEN coa.normal_balance = 'DEBIT'
          THEN ab.balance_amount
          ELSE 0
        END) as debit_balance,
        SUM(CASE
          WHEN coa.normal_balance = 'CREDIT'
          THEN ab.balance_amount
          ELSE 0
        END) as credit_balance
       FROM account_balances ab
       JOIN chart_of_accounts coa ON ab.account_code = coa.account_code
       WHERE ab.balance_date <= $1
         AND coa.organization_id = $2
       GROUP BY ab.account_code, coa.account_name, coa.account_type, coa.normal_balance
       ORDER BY ab.account_code`,
      [date, organizationId]
    );

    const trialBalance = {
      date: date,
      organizationId: organizationId,
      accounts: balances.rows,
      totalDebits: 0,
      totalCredits: 0,
      isBalanced: false
    };

    // Calculate totals
    balances.rows.forEach(account => {
      trialBalance.totalDebits += parseFloat(account.debit_balance || 0);
      trialBalance.totalCredits += parseFloat(account.credit_balance || 0);
    });

    trialBalance.isBalanced = Math.abs(
      trialBalance.totalDebits - trialBalance.totalCredits
    ) < 0.01;

    return trialBalance;
  }

  /**
   * Create closing entries for period end
   */
  async createClosingEntries(periodEnd, organizationId) {
    const closingEntries = [];

    // Get revenue accounts
    const revenueAccounts = await global.db.query(
      `SELECT account_code, account_name, balance_amount
       FROM account_balances ab
       JOIN chart_of_accounts coa ON ab.account_code = coa.account_code
       WHERE coa.account_type = 'REVENUE'
         AND ab.balance_date = $1
         AND coa.organization_id = $2`,
      [periodEnd, organizationId]
    );

    // Get expense accounts
    const expenseAccounts = await global.db.query(
      `SELECT account_code, account_name, balance_amount
       FROM account_balances ab
       JOIN chart_of_accounts coa ON ab.account_code = coa.account_code
       WHERE coa.account_type = 'EXPENSE'
         AND ab.balance_date = $1
         AND coa.organization_id = $2`,
      [periodEnd, organizationId]
    );

    // Close revenue accounts
    if (revenueAccounts.rows.length > 0) {
      const revenueLines = [];
      let totalRevenue = 0;

      for (const account of revenueAccounts.rows) {
        revenueLines.push({
          accountCode: account.account_code,
          description: `Close ${account.account_name}`,
          debitAmount: Math.abs(account.balance_amount),
          creditAmount: 0
        });
        totalRevenue += Math.abs(account.balance_amount);
      }

      // Credit to income summary
      revenueLines.push({
        accountCode: '3900', // Income Summary
        description: 'Revenue to income summary',
        debitAmount: 0,
        creditAmount: totalRevenue
      });

      closingEntries.push(await this.createJournalEntry({
        type: this.journalTypes.CLOSING,
        description: 'Close revenue accounts',
        date: periodEnd,
        organizationId: organizationId,
        lines: revenueLines
      }));
    }

    // Close expense accounts
    if (expenseAccounts.rows.length > 0) {
      const expenseLines = [];
      let totalExpenses = 0;

      for (const account of expenseAccounts.rows) {
        expenseLines.push({
          accountCode: account.account_code,
          description: `Close ${account.account_name}`,
          debitAmount: 0,
          creditAmount: Math.abs(account.balance_amount)
        });
        totalExpenses += Math.abs(account.balance_amount);
      }

      // Debit to income summary
      expenseLines.push({
        accountCode: '3900', // Income Summary
        description: 'Expenses to income summary',
        debitAmount: totalExpenses,
        creditAmount: 0
      });

      closingEntries.push(await this.createJournalEntry({
        type: this.journalTypes.CLOSING,
        description: 'Close expense accounts',
        date: periodEnd,
        organizationId: organizationId,
        lines: expenseLines
      }));
    }

    return closingEntries;
  }

  /**
   * Create reversing entry
   */
  async createReversingEntry(originalEntryId) {
    const originalEntry = await this.getJournalEntry(originalEntryId);

    const reversingLines = originalEntry.lines.map(line => ({
      accountCode: line.accountCode,
      description: `Reversal: ${line.description}`,
      debitAmount: line.creditAmount,
      creditAmount: line.debitAmount,
      costCenter: line.costCenter,
      profitCenter: line.profitCenter
    }));

    return await this.createJournalEntry({
      type: this.journalTypes.REVERSING,
      description: `Reversal of entry ${originalEntry.entryNumber}`,
      reference: originalEntryId,
      organizationId: originalEntry.organizationId,
      lines: reversingLines
    });
  }

  /**
   * Create audit trail for GL entries
   */
  async createAuditTrail(entry, action, userId) {
    const audit = {
      id: uuidv4(),
      entryId: entry.id,
      action: action,
      userId: userId,
      timestamp: new Date(),
      changes: JSON.stringify(entry),
      ipAddress: entry.metadata?.ipAddress,
      userAgent: entry.metadata?.userAgent
    };

    await global.db.query(
      `INSERT INTO gl_audit_trail
       (id, entry_id, action, user_id, timestamp, changes, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [audit.id, audit.entryId, audit.action, audit.userId,
       audit.timestamp, audit.changes, audit.ipAddress, audit.userAgent]
    );

    return audit;
  }

  /**
   * Reconcile subledger with general ledger
   */
  async reconcileWithGL(accountCode, date) {
    // Get subledger balance
    const subledgerBalance = await global.db.query(
      `SELECT SUM(amount) as balance
       FROM subledger_transactions
       WHERE account_code = $1
         AND transaction_date <= $2
         AND status = 'POSTED'`,
      [accountCode, date]
    );

    // Get GL balance
    const glBalance = await global.db.query(
      `SELECT balance_amount
       FROM account_balances
       WHERE account_code = $1
         AND balance_date = $2`,
      [accountCode, date]
    );

    const reconciliation = {
      accountCode: accountCode,
      date: date,
      subledgerBalance: subledgerBalance.rows[0]?.balance || 0,
      glBalance: glBalance.rows[0]?.balance_amount || 0,
      difference: 0,
      status: 'RECONCILED'
    };

    reconciliation.difference = Math.abs(
      reconciliation.subledgerBalance - reconciliation.glBalance
    );

    if (reconciliation.difference > 0.01) {
      reconciliation.status = 'DISCREPANCY';

      // Create adjustment entry if needed
      await this.createAdjustmentEntry(
        accountCode,
        reconciliation.difference,
        'Subledger to GL reconciliation adjustment'
      );
    }

    // Store reconciliation record
    await global.db.query(
      `INSERT INTO gl_reconciliations
       (id, account_code, reconciliation_date, subledger_balance,
        gl_balance, difference, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [uuidv4(), accountCode, date, reconciliation.subledgerBalance,
       reconciliation.glBalance, reconciliation.difference,
       reconciliation.status, new Date()]
    );

    return reconciliation;
  }

  /**
   * Map external ERP accounts to internal COA
   */
  async mapERPAccount(erpSystem, erpAccountCode, internalAccountCode) {
    const mapping = {
      id: uuidv4(),
      erpSystem: erpSystem,
      erpAccountCode: erpAccountCode,
      internalAccountCode: internalAccountCode,
      mappedAt: new Date()
    };

    await global.db.query(
      `INSERT INTO erp_account_mappings
       (id, erp_system, erp_account_code, internal_account_code, mapped_at)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (erp_system, erp_account_code)
       DO UPDATE SET internal_account_code = $4, mapped_at = $5`,
      [mapping.id, mapping.erpSystem, mapping.erpAccountCode,
       mapping.internalAccountCode, mapping.mappedAt]
    );

    return mapping;
  }

  /**
   * Helper functions
   */
  async generateEntryNumber() {
    const result = await global.db.query(
      `SELECT COUNT(*) as count FROM journal_entries
       WHERE DATE(created_at) = DATE(NOW())`
    );
    const count = parseInt(result.rows[0].count) + 1;
    const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
    return `JE${date}${count.toString().padStart(5, '0')}`;
  }

  async saveJournalEntry(entry) {
    await global.db.query(
      `INSERT INTO journal_entries
       (id, entry_number, date, type, description, reference,
        organization_id, created_by, status, total_debits, total_credits, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [entry.id, entry.entryNumber, entry.date, entry.type, entry.description,
       entry.reference, entry.organizationId, entry.createdBy, entry.status,
       entry.totalDebits, entry.totalCredits, entry.createdAt]
    );

    for (const line of entry.lines) {
      await global.db.query(
        `INSERT INTO journal_entry_lines
         (id, entry_id, account_code, account_name, description,
          debit_amount, credit_amount, cost_center, profit_center, currency)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [line.id, entry.id, line.accountCode, line.accountName, line.description,
         line.debitAmount, line.creditAmount, line.costCenter, line.profitCenter, line.currency]
      );
    }
  }

  async getJournalEntry(entryId) {
    const result = await global.db.query(
      `SELECT je.*,
        json_agg(jel.*) as lines
       FROM journal_entries je
       LEFT JOIN journal_entry_lines jel ON je.id = jel.entry_id
       WHERE je.id = $1
       GROUP BY je.id`,
      [entryId]
    );
    return result.rows[0];
  }
}

module.exports = SubledgerArchitecture;