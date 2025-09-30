import { Router } from 'express';
import HttpStatus from 'http-status';
import authenticate from '../middleware-app/auth-middleware.js';
import rateLimiter from '../middleware-app/rate-limiter-middleware.js';

// Import ERP Connector services
import QuickBooksConnector from '../services/quickBooksConnector.js';
import FreshBooksConnector from '../services/freshBooksConnector.js';
import WaveAccountingConnector from '../services/waveAccountingConnector.js';
import ZohoEnhancedConnector from '../services/zohoEnhancedConnector.js';
import SageBusinessConnector from '../services/sageBusinessConnector.js';
import SAPConnector from '../services/sapConnector.js';
import OracleIntegration from '../services/oracleNetSuiteIntegration.js';

const router = Router();

// Initialize connectors
const quickBooks = new QuickBooksConnector();
const freshBooks = new FreshBooksConnector();
const waveAccounting = new WaveAccountingConnector();
const zohoBooks = new ZohoEnhancedConnector();
const sageBusiness = new SageBusinessConnector();
const sapConnector = new SAPConnector();
const oracleIntegration = new OracleIntegration();

// Generic connector endpoints (works for all ERP systems)
router.post('/:system/connect', authenticate, async (req, res, next) => {
  try {
    let connector;
    switch (req.params.system) {
      case 'quickbooks':
        connector = quickBooks;
        break;
      case 'freshbooks':
        connector = freshBooks;
        break;
      case 'wave':
        connector = waveAccounting;
        break;
      case 'zoho':
        connector = zohoBooks;
        break;
      case 'sage':
        connector = sageBusiness;
        break;
      case 'sap':
        connector = sapConnector;
        break;
      case 'oracle':
        connector = oracleIntegration;
        break;
      default:
        throw new Error('Invalid ERP system');
    }

    const authUrl = await connector.authorize(req.body.accountId);
    res.status(HttpStatus.OK).json({
      success: true,
      data: { authUrl },
      message: `${req.params.system} authorization URL generated`
    });
  } catch (error) {
    next(error);
  }
});

router.post('/:system/callback', authenticate, async (req, res, next) => {
  try {
    let connector;
    switch (req.params.system) {
      case 'quickbooks':
        connector = quickBooks;
        break;
      case 'freshbooks':
        connector = freshBooks;
        break;
      case 'wave':
        connector = waveAccounting;
        break;
      case 'zoho':
        connector = zohoBooks;
        break;
      case 'sage':
        connector = sageBusiness;
        break;
      default:
        throw new Error('Invalid ERP system');
    }

    const result = await connector.handleCallback(
      req.body.code,
      req.body.accountId || req.body.state
    );
    res.status(HttpStatus.OK).json({
      success: true,
      data: result,
      message: `${req.params.system} connected successfully`
    });
  } catch (error) {
    next(error);
  }
});

// QuickBooks specific endpoints
router.post('/quickbooks/sync/customers', authenticate, async (req, res, next) => {
  try {
    const result = await quickBooks.syncCustomers(req.body.accountId, req.body.fromDate);
    res.status(HttpStatus.OK).json({
      success: true,
      data: result,
      message: 'QuickBooks customers synced'
    });
  } catch (error) {
    next(error);
  }
});

router.post('/quickbooks/sync/invoices', authenticate, async (req, res, next) => {
  try {
    const result = await quickBooks.syncInvoices(req.body.accountId, req.body.fromDate);
    res.status(HttpStatus.OK).json({
      success: true,
      data: result,
      message: 'QuickBooks invoices synced'
    });
  } catch (error) {
    next(error);
  }
});

router.post('/quickbooks/create/invoice', authenticate, async (req, res, next) => {
  try {
    const result = await quickBooks.createInvoice(req.body.accountId, req.body.invoiceData);
    res.status(HttpStatus.CREATED).json({
      success: true,
      data: result,
      message: 'QuickBooks invoice created'
    });
  } catch (error) {
    next(error);
  }
});

// FreshBooks specific endpoints
router.post('/freshbooks/sync/clients', authenticate, async (req, res, next) => {
  try {
    const result = await freshBooks.syncClients(req.body.accountId);
    res.status(HttpStatus.OK).json({
      success: true,
      data: result,
      message: 'FreshBooks clients synced'
    });
  } catch (error) {
    next(error);
  }
});

router.post('/freshbooks/sync/expenses', authenticate, async (req, res, next) => {
  try {
    const result = await freshBooks.syncExpenses(req.body.accountId, req.body.fromDate);
    res.status(HttpStatus.OK).json({
      success: true,
      data: result,
      message: 'FreshBooks expenses synced'
    });
  } catch (error) {
    next(error);
  }
});

router.post('/freshbooks/time-tracking', authenticate, async (req, res, next) => {
  try {
    const result = await freshBooks.syncTimeEntries(req.body.accountId, req.body.projectId);
    res.status(HttpStatus.OK).json({
      success: true,
      data: result,
      message: 'FreshBooks time entries synced'
    });
  } catch (error) {
    next(error);
  }
});

// Wave Accounting specific endpoints
router.post('/wave/graphql/query', authenticate, async (req, res, next) => {
  try {
    const result = await waveAccounting.executeGraphQLQuery(
      req.body.accountId,
      req.body.query,
      req.body.variables
    );
    res.status(HttpStatus.OK).json({
      success: true,
      data: result,
      message: 'Wave GraphQL query executed'
    });
  } catch (error) {
    next(error);
  }
});

router.post('/wave/sync/customers', authenticate, async (req, res, next) => {
  try {
    const result = await waveAccounting.syncCustomers(req.body.accountId);
    res.status(HttpStatus.OK).json({
      success: true,
      data: result,
      message: 'Wave customers synced'
    });
  } catch (error) {
    next(error);
  }
});

router.post('/wave/financial/report', authenticate, async (req, res, next) => {
  try {
    const result = await waveAccounting.generateFinancialReports(
      req.body.accountId,
      req.body.reportType,
      req.body.parameters
    );
    res.status(HttpStatus.OK).json({
      success: true,
      data: result,
      message: 'Wave financial report generated'
    });
  } catch (error) {
    next(error);
  }
});

// Zoho Books enhanced endpoints
router.post('/zoho/sync/all', authenticate, async (req, res, next) => {
  try {
    const result = await zohoBooks.syncAllEntities(req.body.accountId);
    res.status(HttpStatus.OK).json({
      success: true,
      data: result,
      message: 'Zoho Books full sync completed'
    });
  } catch (error) {
    next(error);
  }
});

router.post('/zoho/invoice/smart', authenticate, async (req, res, next) => {
  try {
    const result = await zohoBooks.createSmartInvoice(
      req.body.accountId,
      req.body.invoiceData
    );
    res.status(HttpStatus.CREATED).json({
      success: true,
      data: result,
      message: 'Zoho smart invoice created'
    });
  } catch (error) {
    next(error);
  }
});

router.post('/zoho/recurring/profile', authenticate, async (req, res, next) => {
  try {
    const result = await zohoBooks.createRecurringProfile(
      req.body.accountId,
      req.body.profileData
    );
    res.status(HttpStatus.CREATED).json({
      success: true,
      data: result,
      message: 'Zoho recurring profile created'
    });
  } catch (error) {
    next(error);
  }
});

router.post('/zoho/tax/configure', authenticate, async (req, res, next) => {
  try {
    const result = await zohoBooks.configureTaxEngine(
      req.body.accountId,
      req.body.taxConfig
    );
    res.status(HttpStatus.OK).json({
      success: true,
      data: result,
      message: 'Zoho tax engine configured'
    });
  } catch (error) {
    next(error);
  }
});

router.post('/zoho/automation/rule', authenticate, async (req, res, next) => {
  try {
    const result = await zohoBooks.createAutomationRule(
      req.body.accountId,
      req.body.rule
    );
    res.status(HttpStatus.CREATED).json({
      success: true,
      data: result,
      message: 'Zoho automation rule created'
    });
  } catch (error) {
    next(error);
  }
});

// Sage Business Cloud endpoints
router.post('/sage/chart-of-accounts', authenticate, async (req, res, next) => {
  try {
    const result = await sageBusiness.syncChartOfAccounts(req.body.accountId);
    res.status(HttpStatus.OK).json({
      success: true,
      data: result,
      message: 'Sage chart of accounts synced'
    });
  } catch (error) {
    next(error);
  }
});

router.post('/sage/journal/create', authenticate, async (req, res, next) => {
  try {
    const result = await sageBusiness.createJournalEntry(
      req.body.accountId,
      req.body.entryData
    );
    res.status(HttpStatus.CREATED).json({
      success: true,
      data: result,
      message: 'Sage journal entry created'
    });
  } catch (error) {
    next(error);
  }
});

router.post('/sage/bank/reconcile', authenticate, async (req, res, next) => {
  try {
    const result = await sageBusiness.performBankReconciliation(
      req.body.accountId,
      req.body.reconciliationData
    );
    res.status(HttpStatus.OK).json({
      success: true,
      data: result,
      message: 'Sage bank reconciliation completed'
    });
  } catch (error) {
    next(error);
  }
});

router.post('/sage/payroll/sync', authenticate, async (req, res, next) => {
  try {
    const result = await sageBusiness.syncPayrollJournal(
      req.body.accountId,
      req.body.payrollData
    );
    res.status(HttpStatus.OK).json({
      success: true,
      data: result,
      message: 'Sage payroll synced'
    });
  } catch (error) {
    next(error);
  }
});

router.post('/sage/tax/prepare', authenticate, async (req, res, next) => {
  try {
    const result = await sageBusiness.prepareTaxReturn(
      req.body.accountId,
      req.body.taxPeriod
    );
    res.status(HttpStatus.OK).json({
      success: true,
      data: result,
      message: 'Sage tax return prepared'
    });
  } catch (error) {
    next(error);
  }
});

// SAP endpoints
router.post('/sap/finance/sync', authenticate, async (req, res, next) => {
  try {
    const result = await sapConnector.syncFinancialData(
      req.body.accountId,
      req.body.modules
    );
    res.status(HttpStatus.OK).json({
      success: true,
      data: result,
      message: 'SAP financial data synced'
    });
  } catch (error) {
    next(error);
  }
});

router.post('/sap/material/master', authenticate, async (req, res, next) => {
  try {
    const result = await sapConnector.syncMaterialMaster(req.body.accountId);
    res.status(HttpStatus.OK).json({
      success: true,
      data: result,
      message: 'SAP material master synced'
    });
  } catch (error) {
    next(error);
  }
});

// Oracle endpoints
router.post('/oracle/financials/sync', authenticate, async (req, res, next) => {
  try {
    const result = await oracleIntegration.syncOracleFinancials(
      req.body.accountId,
      req.body.options
    );
    res.status(HttpStatus.OK).json({
      success: true,
      data: result,
      message: 'Oracle financials synced'
    });
  } catch (error) {
    next(error);
  }
});

// Generic reporting endpoints
router.post('/:system/report/generate', authenticate, async (req, res, next) => {
  try {
    let connector;
    switch (req.params.system) {
      case 'quickbooks':
        connector = quickBooks;
        break;
      case 'freshbooks':
        connector = freshBooks;
        break;
      case 'wave':
        connector = waveAccounting;
        break;
      case 'zoho':
        connector = zohoBooks;
        break;
      case 'sage':
        connector = sageBusiness;
        break;
      default:
        throw new Error('Invalid ERP system');
    }

    const result = await connector.generateFinancialReports(
      req.body.accountId,
      req.body.reportType,
      req.body.parameters
    );

    res.status(HttpStatus.OK).json({
      success: true,
      data: result,
      message: `${req.params.system} report generated`
    });
  } catch (error) {
    next(error);
  }
});

// Batch sync endpoint
router.post('/batch/sync', authenticate, async (req, res, next) => {
  try {
    const results = [];

    for (const sync of req.body.syncRequests) {
      let connector;
      switch (sync.system) {
        case 'quickbooks':
          connector = quickBooks;
          break;
        case 'freshbooks':
          connector = freshBooks;
          break;
        case 'wave':
          connector = waveAccounting;
          break;
        case 'zoho':
          connector = zohoBooks;
          break;
        case 'sage':
          connector = sageBusiness;
          break;
        default:
          continue;
      }

      try {
        const result = await connector.syncAllData(sync.accountId);
        results.push({ system: sync.system, success: true, data: result });
      } catch (error) {
        results.push({ system: sync.system, success: false, error: error.message });
      }
    }

    res.status(HttpStatus.OK).json({
      success: true,
      data: results,
      message: 'Batch sync completed'
    });
  } catch (error) {
    next(error);
  }
});

// Connection status endpoint
router.get('/status/:accountId', authenticate, async (req, res, next) => {
  try {
    const status = {
      quickbooks: quickBooks.getConnectionStatus(req.params.accountId),
      freshbooks: freshBooks.connections.has(req.params.accountId),
      wave: waveAccounting.connections.has(req.params.accountId),
      zoho: zohoBooks.connectedAccounts.has(req.params.accountId),
      sage: sageBusiness.connections.has(req.params.accountId),
      sap: sapConnector.getConnectionStatus(req.params.accountId),
      oracle: oracleIntegration.getConnectionStatus(req.params.accountId)
    };

    res.status(HttpStatus.OK).json({
      success: true,
      data: status,
      message: 'ERP connection status retrieved'
    });
  } catch (error) {
    next(error);
  }
});

// Health Check
router.get('/health', (req, res) => {
  res.status(HttpStatus.OK).json({
    success: true,
    service: 'ERP Connectors',
    status: 'operational',
    connectors: {
      quickbooks: 'active',
      freshbooks: 'active',
      wave: 'active',
      zoho: 'active',
      sage: 'active',
      sap: 'active',
      oracle: 'active'
    },
    timestamp: new Date()
  });
});

export default router;