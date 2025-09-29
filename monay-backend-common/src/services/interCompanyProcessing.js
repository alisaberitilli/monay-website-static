/**
 * Inter-Company Processing Service
 * Handles multi-entity transactions, consolidations, and eliminations
 * Created: 2025-01-21
 */

import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';

class InterCompanyProcessing extends EventEmitter {
  constructor() {
    super();

    this.entityTypes = {
      HOLDING: 'HOLDING',
      SUBSIDIARY: 'SUBSIDIARY',
      DIVISION: 'DIVISION',
      BRANCH: 'BRANCH',
      JOINT_VENTURE: 'JOINT_VENTURE'
    };

    this.transactionTypes = {
      INTER_COMPANY_SALE: 'INTER_COMPANY_SALE',
      INTER_COMPANY_LOAN: 'INTER_COMPANY_LOAN',
      DIVIDEND_PAYMENT: 'DIVIDEND_PAYMENT',
      CAPITAL_CONTRIBUTION: 'CAPITAL_CONTRIBUTION',
      COST_ALLOCATION: 'COST_ALLOCATION',
      MANAGEMENT_FEE: 'MANAGEMENT_FEE',
      TRANSFER_PRICING: 'TRANSFER_PRICING',
      SHARED_SERVICE: 'SHARED_SERVICE'
    };

    this.consolidationMethods = {
      FULL: 'FULL_CONSOLIDATION',
      PROPORTIONAL: 'PROPORTIONAL_CONSOLIDATION',
      EQUITY: 'EQUITY_METHOD',
      COST: 'COST_METHOD'
    };

    this.eliminationTypes = {
      INVESTMENT: 'INVESTMENT_IN_SUBSIDIARY',
      REVENUE: 'INTERCOMPANY_REVENUE',
      EXPENSE: 'INTERCOMPANY_EXPENSE',
      PAYABLE: 'INTERCOMPANY_PAYABLE',
      RECEIVABLE: 'INTERCOMPANY_RECEIVABLE',
      DIVIDEND: 'INTERCOMPANY_DIVIDEND',
      PROFIT: 'UNREALIZED_PROFIT'
    };

    // Inter-company account mapping
    this.icAccountMapping = {
      'IC_RECEIVABLE': '1300',
      'IC_PAYABLE': '2300',
      'IC_REVENUE': '4500',
      'IC_EXPENSE': '5500',
      'IC_INVESTMENT': '1500',
      'IC_DIVIDEND': '3500'
    };

    this.entityHierarchy = new Map();
    this.consolidationRules = new Map();
  }

  /**
   * Setup entity hierarchy
   */
  async setupEntityHierarchy(hierarchy) {
    try {
      const rootEntity = {
        id: hierarchy.id,
        name: hierarchy.name,
        type: this.entityTypes.HOLDING,
        taxId: hierarchy.taxId,
        currency: hierarchy.currency || 'USD',
        fiscalYearEnd: hierarchy.fiscalYearEnd,
        consolidationMethod: this.consolidationMethods.FULL,
        children: [],
        metadata: hierarchy.metadata || {}
      };

      // Process subsidiaries
      if (hierarchy.subsidiaries) {
        for (const subsidiary of hierarchy.subsidiaries) {
          const childEntity = await this.createEntity(subsidiary, rootEntity.id);
          rootEntity.children.push(childEntity);
        }
      }

      this.entityHierarchy.set(rootEntity.id, rootEntity);

      // Store in database
      await this.storeEntityHierarchy(rootEntity);

      this.emit('hierarchy_created', {
        rootEntityId: rootEntity.id,
        totalEntities: this.countEntities(rootEntity)
      });

      return {
        success: true,
        hierarchyId: rootEntity.id,
        structure: this.getHierarchyStructure(rootEntity)
      };

    } catch (error) {
      console.error('Entity hierarchy setup error:', error);
      throw error;
    }
  }

  /**
   * Create entity
   */
  async createEntity(entityData, parentId = null) {
    const entity = {
      id: entityData.id || uuidv4(),
      parentId: parentId,
      name: entityData.name,
      type: entityData.type || this.entityTypes.SUBSIDIARY,
      taxId: entityData.taxId,
      currency: entityData.currency,
      ownershipPercentage: entityData.ownershipPercentage || 100,
      consolidationMethod: this.getConsolidationMethod(entityData.ownershipPercentage),
      accountingStandard: entityData.accountingStandard || 'GAAP',
      fiscalYearEnd: entityData.fiscalYearEnd,
      active: true,
      children: [],
      createdAt: new Date()
    };

    // Process child entities recursively
    if (entityData.children) {
      for (const child of entityData.children) {
        const childEntity = await this.createEntity(child, entity.id);
        entity.children.push(childEntity);
      }
    }

    return entity;
  }

  /**
   * Process inter-company invoice
   */
  async createInterCompanyInvoice(invoiceData) {
    try {
      const invoice = {
        id: uuidv4(),
        invoiceNumber: this.generateICInvoiceNumber(),
        type: this.transactionTypes.INTER_COMPANY_SALE,
        sellingEntityId: invoiceData.sellingEntityId,
        buyingEntityId: invoiceData.buyingEntityId,
        invoiceDate: invoiceData.date || new Date(),
        dueDate: invoiceData.dueDate,
        currency: invoiceData.currency || 'USD',
        items: [],
        totalAmount: 0,
        status: 'PENDING',
        eliminationRequired: true,
        createdAt: new Date()
      };

      // Validate entities are related
      const relationship = await this.validateEntityRelationship(
        invoice.sellingEntityId,
        invoice.buyingEntityId
      );

      if (!relationship.valid) {
        throw new Error('Entities are not in the same corporate structure');
      }

      // Process invoice items
      for (const item of invoiceData.items) {
        const processedItem = {
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          amount: item.quantity * item.unitPrice,
          taxRate: item.taxRate || 0,
          taxAmount: 0,
          glAccount: item.glAccount
        };

        // Apply transfer pricing rules
        if (invoiceData.applyTransferPricing) {
          processedItem.unitPrice = await this.calculateTransferPrice(
            item,
            invoice.sellingEntityId,
            invoice.buyingEntityId
          );
          processedItem.amount = processedItem.quantity * processedItem.unitPrice;
        }

        processedItem.taxAmount = processedItem.amount * (processedItem.taxRate / 100);
        invoice.items.push(processedItem);
        invoice.totalAmount += processedItem.amount + processedItem.taxAmount;
      }

      // Create journal entries for both entities
      await this.createICJournalEntries(invoice);

      // Store invoice
      await this.storeInterCompanyInvoice(invoice);

      // Mark for elimination in consolidation
      await this.markForElimination(invoice);

      this.emit('ic_invoice_created', {
        invoiceId: invoice.id,
        amount: invoice.totalAmount,
        entities: [invoice.sellingEntityId, invoice.buyingEntityId]
      });

      return {
        success: true,
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        totalAmount: invoice.totalAmount,
        eliminationId: invoice.eliminationId
      };

    } catch (error) {
      console.error('Inter-company invoice error:', error);
      throw error;
    }
  }

  /**
   * Create IC journal entries
   */
  async createICJournalEntries(invoice) {
    // Selling entity entries
    const sellingEntries = {
      entityId: invoice.sellingEntityId,
      date: invoice.invoiceDate,
      lines: [
        {
          accountCode: this.icAccountMapping.IC_RECEIVABLE,
          debitAmount: invoice.totalAmount,
          creditAmount: 0,
          description: `IC AR from ${invoice.buyingEntityId}`
        },
        {
          accountCode: this.icAccountMapping.IC_REVENUE,
          debitAmount: 0,
          creditAmount: invoice.totalAmount,
          description: `IC Revenue to ${invoice.buyingEntityId}`
        }
      ]
    };

    // Buying entity entries
    const buyingEntries = {
      entityId: invoice.buyingEntityId,
      date: invoice.invoiceDate,
      lines: [
        {
          accountCode: this.icAccountMapping.IC_EXPENSE,
          debitAmount: invoice.totalAmount,
          creditAmount: 0,
          description: `IC Expense from ${invoice.sellingEntityId}`
        },
        {
          accountCode: this.icAccountMapping.IC_PAYABLE,
          debitAmount: 0,
          creditAmount: invoice.totalAmount,
          description: `IC AP to ${invoice.sellingEntityId}`
        }
      ]
    };

    // Post journal entries
    await this.postJournalEntry(sellingEntries);
    await this.postJournalEntry(buyingEntries);
  }

  /**
   * Process inter-company loan
   */
  async createInterCompanyLoan(loanData) {
    try {
      const loan = {
        id: uuidv4(),
        loanNumber: this.generateICLoanNumber(),
        type: this.transactionTypes.INTER_COMPANY_LOAN,
        lenderId: loanData.lenderId,
        borrowerId: loanData.borrowerId,
        principal: loanData.principal,
        interestRate: loanData.interestRate,
        term: loanData.term, // in months
        startDate: loanData.startDate || new Date(),
        maturityDate: this.calculateMaturityDate(loanData.startDate, loanData.term),
        paymentSchedule: loanData.paymentSchedule || 'MONTHLY',
        currency: loanData.currency || 'USD',
        status: 'ACTIVE',
        outstandingBalance: loanData.principal,
        eliminationRequired: true
      };

      // Validate arm's length interest rate
      if (loanData.requireArmLength) {
        loan.armLengthRate = await this.getArmLengthRate(loan);
        if (Math.abs(loan.interestRate - loan.armLengthRate) > 0.5) {
          console.warn('Interest rate differs significantly from arm\'s length rate');
        }
      }

      // Generate amortization schedule
      loan.amortizationSchedule = this.generateAmortizationSchedule(loan);

      // Create initial disbursement entries
      await this.recordLoanDisbursement(loan);

      // Store loan
      await this.storeInterCompanyLoan(loan);

      this.emit('ic_loan_created', {
        loanId: loan.id,
        principal: loan.principal,
        interestRate: loan.interestRate
      });

      return {
        success: true,
        loanId: loan.id,
        loanNumber: loan.loanNumber,
        amortizationSchedule: loan.amortizationSchedule
      };

    } catch (error) {
      console.error('Inter-company loan error:', error);
      throw error;
    }
  }

  /**
   * Shared customer database management
   */
  async createSharedCustomer(customerData) {
    try {
      const sharedCustomer = {
        id: uuidv4(),
        masterCustomerId: customerData.masterCustomerId || uuidv4(),
        name: customerData.name,
        taxId: customerData.taxId,
        type: customerData.type,
        creditLimit: customerData.creditLimit,
        paymentTerms: customerData.paymentTerms,
        entities: [], // Entities that can transact with this customer
        addresses: customerData.addresses || [],
        contacts: customerData.contacts || [],
        createdAt: new Date()
      };

      // Assign customer to entities
      if (customerData.entityIds) {
        for (const entityId of customerData.entityIds) {
          sharedCustomer.entities.push({
            entityId: entityId,
            localCustomerId: `${entityId}_${sharedCustomer.masterCustomerId}`,
            creditLimit: customerData.entityCreditLimits?.[entityId],
            status: 'ACTIVE'
          });
        }
      }

      // Store shared customer
      await this.storeSharedCustomer(sharedCustomer);

      // Sync with each entity's local system
      await this.syncCustomerAcrossEntities(sharedCustomer);

      this.emit('shared_customer_created', {
        customerId: sharedCustomer.masterCustomerId,
        entities: sharedCustomer.entities.length
      });

      return {
        success: true,
        masterCustomerId: sharedCustomer.masterCustomerId,
        entityAssignments: sharedCustomer.entities
      };

    } catch (error) {
      console.error('Shared customer creation error:', error);
      throw error;
    }
  }

  /**
   * Consolidated reporting
   */
  async generateConsolidatedReport(reportParams) {
    try {
      const report = {
        id: uuidv4(),
        type: reportParams.type, // 'BALANCE_SHEET', 'INCOME_STATEMENT', 'CASH_FLOW'
        periodEnd: reportParams.periodEnd,
        consolidationLevel: reportParams.level || 'FULL',
        currency: reportParams.currency || 'USD',
        entities: [],
        eliminations: [],
        adjustments: [],
        consolidated: {},
        createdAt: new Date()
      };

      // Get all entities in hierarchy
      const rootEntity = this.entityHierarchy.get(reportParams.rootEntityId);
      const allEntities = this.getAllEntities(rootEntity);

      // Collect financial data from each entity
      for (const entity of allEntities) {
        const entityData = await this.getEntityFinancials(entity.id, reportParams.periodEnd);

        // Convert to reporting currency if needed
        if (entityData.currency !== report.currency) {
          await this.convertToReportingCurrency(entityData, report.currency, reportParams.periodEnd);
        }

        report.entities.push(entityData);
      }

      // Identify and calculate eliminations
      report.eliminations = await this.calculateEliminations(
        report.entities,
        reportParams.periodEnd
      );

      // Apply consolidation adjustments
      report.adjustments = await this.getConsolidationAdjustments(
        reportParams.rootEntityId,
        reportParams.periodEnd
      );

      // Generate consolidated financials
      report.consolidated = this.consolidateFinancials(
        report.entities,
        report.eliminations,
        report.adjustments
      );

      // Store report
      await this.storeConsolidatedReport(report);

      this.emit('consolidated_report_generated', {
        reportId: report.id,
        type: report.type,
        entityCount: report.entities.length
      });

      return {
        success: true,
        reportId: report.id,
        consolidated: report.consolidated,
        eliminations: report.eliminations.length,
        downloadUrl: await this.generateReportDownloadUrl(report.id)
      };

    } catch (error) {
      console.error('Consolidated reporting error:', error);
      throw error;
    }
  }

  /**
   * Multi-entity reconciliation
   */
  async performMultiEntityReconciliation(reconciliationParams) {
    try {
      const reconciliation = {
        id: uuidv4(),
        periodEnd: reconciliationParams.periodEnd,
        entities: reconciliationParams.entityIds,
        accounts: [],
        discrepancies: [],
        status: 'IN_PROGRESS',
        startedAt: new Date()
      };

      // Get inter-company accounts for reconciliation
      const icAccounts = await this.getInterCompanyAccounts(reconciliationParams.entityIds);

      for (const account of icAccounts) {
        const reconResult = {
          accountType: account.type,
          fromEntity: account.fromEntity,
          toEntity: account.toEntity,
          fromBalance: 0,
          toBalance: 0,
          difference: 0,
          status: 'PENDING'
        };

        // Get balances from both entities
        reconResult.fromBalance = await this.getAccountBalance(
          account.fromEntity,
          account.fromAccount,
          reconciliationParams.periodEnd
        );

        reconResult.toBalance = await this.getAccountBalance(
          account.toEntity,
          account.toAccount,
          reconciliationParams.periodEnd
        );

        // Calculate difference
        reconResult.difference = Math.abs(reconResult.fromBalance + reconResult.toBalance);

        // Check if reconciled (should net to zero)
        if (reconResult.difference < 0.01) {
          reconResult.status = 'RECONCILED';
        } else {
          reconResult.status = 'DISCREPANCY';
          reconciliation.discrepancies.push({
            ...reconResult,
            suggestedAdjustment: this.suggestAdjustment(reconResult)
          });
        }

        reconciliation.accounts.push(reconResult);
      }

      reconciliation.status = reconciliation.discrepancies.length > 0 ? 'DISCREPANCIES_FOUND' : 'RECONCILED';
      reconciliation.completedAt = new Date();

      // Store reconciliation results
      await this.storeReconciliation(reconciliation);

      // Auto-create adjustment entries if configured
      if (reconciliationParams.autoAdjust && reconciliation.discrepancies.length > 0) {
        await this.createAdjustmentEntries(reconciliation.discrepancies);
      }

      this.emit('multi_entity_reconciliation_completed', {
        reconciliationId: reconciliation.id,
        entitiesReconciled: reconciliation.entities.length,
        discrepancies: reconciliation.discrepancies.length
      });

      return {
        success: true,
        reconciliationId: reconciliation.id,
        status: reconciliation.status,
        accountsReconciled: reconciliation.accounts.length,
        discrepancies: reconciliation.discrepancies
      };

    } catch (error) {
      console.error('Multi-entity reconciliation error:', error);
      throw error;
    }
  }

  /**
   * Cost allocation between entities
   */
  async allocateCosts(allocationData) {
    try {
      const allocation = {
        id: uuidv4(),
        type: this.transactionTypes.COST_ALLOCATION,
        sourceEntity: allocationData.sourceEntity,
        allocationPeriod: allocationData.period,
        totalAmount: allocationData.amount,
        allocationMethod: allocationData.method, // 'HEADCOUNT', 'REVENUE', 'CUSTOM'
        allocations: [],
        status: 'PENDING'
      };

      // Get allocation basis
      const allocationBasis = await this.getAllocationBasis(
        allocation.allocationMethod,
        allocationData.targetEntities,
        allocation.allocationPeriod
      );

      // Calculate allocations
      const totalBasis = allocationBasis.reduce((sum, b) => sum + b.value, 0);

      for (const basis of allocationBasis) {
        const allocationAmount = (basis.value / totalBasis) * allocation.totalAmount;

        allocation.allocations.push({
          targetEntity: basis.entityId,
          amount: allocationAmount,
          percentage: (basis.value / totalBasis) * 100,
          basis: basis.value,
          description: `${allocation.allocationMethod} allocation from ${allocation.sourceEntity}`
        });
      }

      // Create journal entries for cost allocation
      await this.createCostAllocationEntries(allocation);

      // Store allocation
      await this.storeCostAllocation(allocation);

      allocation.status = 'COMPLETED';

      this.emit('cost_allocation_completed', {
        allocationId: allocation.id,
        totalAmount: allocation.totalAmount,
        entitiesAllocated: allocation.allocations.length
      });

      return {
        success: true,
        allocationId: allocation.id,
        allocations: allocation.allocations
      };

    } catch (error) {
      console.error('Cost allocation error:', error);
      throw error;
    }
  }

  /**
   * Transfer pricing calculation
   */
  async calculateTransferPrice(item, sellingEntityId, buyingEntityId) {
    // Implement transfer pricing methods
    const methods = {
      COMPARABLE_UNCONTROLLED: async () => {
        // Get market price for similar transactions
        return await this.getMarketPrice(item);
      },
      COST_PLUS: async () => {
        // Cost + markup method
        const cost = await this.getItemCost(item, sellingEntityId);
        const markup = 0.20; // 20% markup
        return cost * (1 + markup);
      },
      RESALE_PRICE: async () => {
        // Resale price minus margin
        const resalePrice = await this.getResalePrice(item, buyingEntityId);
        const margin = 0.25; // 25% margin
        return resalePrice * (1 - margin);
      },
      PROFIT_SPLIT: async () => {
        // Split combined profit
        return await this.calculateProfitSplit(item, sellingEntityId, buyingEntityId);
      }
    };

    const method = item.transferPricingMethod || 'COST_PLUS';
    return await methods[method]();
  }

  /**
   * Calculate eliminations for consolidation
   */
  async calculateEliminations(entities, periodEnd) {
    const eliminations = [];

    // Inter-company receivables and payables
    for (const entity of entities) {
      const icTransactions = await this.getInterCompanyTransactions(entity.id, periodEnd);

      for (const transaction of icTransactions) {
        // Check if counterparty is in consolidation scope
        const counterparty = entities.find(e => e.id === transaction.counterpartyId);

        if (counterparty) {
          eliminations.push({
            type: this.eliminationTypes.RECEIVABLE,
            fromEntity: entity.id,
            toEntity: counterparty.id,
            account: transaction.accountCode,
            amount: transaction.amount,
            description: `Eliminate IC transaction ${transaction.id}`
          });
        }
      }
    }

    // Inter-company profits in inventory
    const unrealizedProfits = await this.calculateUnrealizedProfits(entities, periodEnd);
    eliminations.push(...unrealizedProfits);

    // Inter-company dividends
    const icDividends = await this.getInterCompanyDividends(entities, periodEnd);
    eliminations.push(...icDividends);

    return eliminations;
  }

  /**
   * Consolidate financial statements
   */
  consolidateFinancials(entities, eliminations, adjustments) {
    const consolidated = {
      assets: 0,
      liabilities: 0,
      equity: 0,
      revenue: 0,
      expenses: 0,
      netIncome: 0
    };

    // Sum all entities
    for (const entity of entities) {
      consolidated.assets += entity.assets || 0;
      consolidated.liabilities += entity.liabilities || 0;
      consolidated.equity += entity.equity || 0;
      consolidated.revenue += entity.revenue || 0;
      consolidated.expenses += entity.expenses || 0;
    }

    // Apply eliminations
    for (const elimination of eliminations) {
      switch (elimination.type) {
        case this.eliminationTypes.RECEIVABLE:
        case this.eliminationTypes.PAYABLE:
          consolidated.assets -= elimination.amount;
          consolidated.liabilities -= elimination.amount;
          break;
        case this.eliminationTypes.REVENUE:
        case this.eliminationTypes.EXPENSE:
          consolidated.revenue -= elimination.type === this.eliminationTypes.REVENUE ? elimination.amount : 0;
          consolidated.expenses -= elimination.type === this.eliminationTypes.EXPENSE ? elimination.amount : 0;
          break;
      }
    }

    // Apply adjustments
    for (const adjustment of adjustments) {
      if (adjustment.account.startsWith('1')) consolidated.assets += adjustment.amount;
      if (adjustment.account.startsWith('2')) consolidated.liabilities += adjustment.amount;
      if (adjustment.account.startsWith('3')) consolidated.equity += adjustment.amount;
      if (adjustment.account.startsWith('4')) consolidated.revenue += adjustment.amount;
      if (adjustment.account.startsWith('5')) consolidated.expenses += adjustment.amount;
    }

    consolidated.netIncome = consolidated.revenue - consolidated.expenses;

    return consolidated;
  }

  /**
   * Helper functions
   */

  getConsolidationMethod(ownershipPercentage) {
    if (ownershipPercentage > 50) return this.consolidationMethods.FULL;
    if (ownershipPercentage >= 20 && ownershipPercentage <= 50) return this.consolidationMethods.EQUITY;
    return this.consolidationMethods.COST;
  }

  generateICInvoiceNumber() {
    return `IC-INV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  generateICLoanNumber() {
    return `IC-LOAN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  calculateMaturityDate(startDate, termMonths) {
    const date = new Date(startDate);
    date.setMonth(date.getMonth() + termMonths);
    return date;
  }

  generateAmortizationSchedule(loan) {
    const schedule = [];
    const monthlyRate = loan.interestRate / 100 / 12;
    const numPayments = loan.term;
    const payment = loan.principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
                    (Math.pow(1 + monthlyRate, numPayments) - 1);

    let balance = loan.principal;

    for (let i = 1; i <= numPayments; i++) {
      const interestPayment = balance * monthlyRate;
      const principalPayment = payment - interestPayment;
      balance -= principalPayment;

      schedule.push({
        paymentNumber: i,
        paymentDate: this.calculatePaymentDate(loan.startDate, i),
        payment: payment,
        principal: principalPayment,
        interest: interestPayment,
        balance: Math.max(0, balance)
      });
    }

    return schedule;
  }

  calculatePaymentDate(startDate, paymentNumber) {
    const date = new Date(startDate);
    date.setMonth(date.getMonth() + paymentNumber);
    return date;
  }

  countEntities(entity) {
    let count = 1;
    for (const child of entity.children || []) {
      count += this.countEntities(child);
    }
    return count;
  }

  getHierarchyStructure(entity, level = 0) {
    const structure = {
      id: entity.id,
      name: entity.name,
      type: entity.type,
      level: level,
      children: []
    };

    for (const child of entity.children || []) {
      structure.children.push(this.getHierarchyStructure(child, level + 1));
    }

    return structure;
  }

  getAllEntities(entity) {
    const entities = [entity];
    for (const child of entity.children || []) {
      entities.push(...this.getAllEntities(child));
    }
    return entities;
  }

  async validateEntityRelationship(entity1Id, entity2Id) {
    // Check if entities are in same hierarchy
    for (const [rootId, rootEntity] of this.entityHierarchy) {
      const allEntities = this.getAllEntities(rootEntity);
      const hasEntity1 = allEntities.some(e => e.id === entity1Id);
      const hasEntity2 = allEntities.some(e => e.id === entity2Id);

      if (hasEntity1 && hasEntity2) {
        return { valid: true, rootEntityId: rootId };
      }
    }

    return { valid: false };
  }

  suggestAdjustment(reconResult) {
    return {
      type: 'RECONCILIATION_ADJUSTMENT',
      amount: reconResult.difference / 2,
      debitEntity: reconResult.fromEntity,
      creditEntity: reconResult.toEntity,
      description: `Reconciliation adjustment for ${reconResult.accountType}`
    };
  }

  // Database operations
  async storeEntityHierarchy(entity) {
    await global.db.query(
      `INSERT INTO entity_hierarchy
       (id, name, type, parent_id, tax_id, currency, ownership_percentage,
        consolidation_method, fiscal_year_end, metadata, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [entity.id, entity.name, entity.type, entity.parentId, entity.taxId,
       entity.currency, entity.ownershipPercentage, entity.consolidationMethod,
       entity.fiscalYearEnd, JSON.stringify(entity.metadata), new Date()]
    );

    // Recursively store children
    for (const child of entity.children || []) {
      await this.storeEntityHierarchy(child);
    }
  }

  async storeInterCompanyInvoice(invoice) {
    await global.db.query(
      `INSERT INTO inter_company_invoices
       (id, invoice_number, type, selling_entity_id, buying_entity_id,
        invoice_date, due_date, currency, total_amount, status,
        elimination_required, items, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
      [invoice.id, invoice.invoiceNumber, invoice.type, invoice.sellingEntityId,
       invoice.buyingEntityId, invoice.invoiceDate, invoice.dueDate,
       invoice.currency, invoice.totalAmount, invoice.status,
       invoice.eliminationRequired, JSON.stringify(invoice.items), invoice.createdAt]
    );
  }

  async postJournalEntry(entry) {
    // Post to general ledger
    console.log('Posting journal entry:', entry);
  }

  async markForElimination(invoice) {
    invoice.eliminationId = `ELIM-${invoice.id}`;
  }

  async getEntityFinancials(entityId, periodEnd) {
    // Get financial data for entity
    return {
      entityId: entityId,
      periodEnd: periodEnd,
      currency: 'USD',
      assets: Math.random() * 1000000,
      liabilities: Math.random() * 500000,
      equity: Math.random() * 500000,
      revenue: Math.random() * 200000,
      expenses: Math.random() * 150000
    };
  }
}

export default InterCompanyProcessing;