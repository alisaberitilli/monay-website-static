import express from 'express';
import CustomerService from '../services/CustomerService.js';

const router = express.Router();

// Initialize service
const customerService = new CustomerService();

// List all customers with filtering and pagination
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      kycStatus,
      riskLevel,
      organizationId
    } = req.query;

    const result = await customerService.listCustomers({
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      kycStatus,
      riskLevel,
      organizationId
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get customer by ID
router.get('/:id', async (req, res) => {
  try {
    const customer = await customerService.getCustomerById(req.params.id);
    
    if (!customer) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found'
      });
    }

    res.json({
      success: true,
      data: customer
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Create new customer
router.post('/', async (req, res) => {
  try {
    const customer = await customerService.createCustomer(req.body);
    
    res.status(201).json({
      success: true,
      data: customer
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Update customer
router.put('/:id', async (req, res) => {
  try {
    const customer = await customerService.updateCustomer(req.params.id, req.body);
    
    res.json({
      success: true,
      data: customer
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Delete customer
router.delete('/:id', async (req, res) => {
  try {
    await customerService.deleteCustomer(req.params.id);
    
    res.json({
      success: true,
      message: 'Customer deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get customer accounts
router.get('/:id/accounts', async (req, res) => {
  try {
    const accounts = await customerService.getCustomerAccounts(req.params.id);
    
    res.json({
      success: true,
      data: accounts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Create customer account
router.post('/:id/accounts', async (req, res) => {
  try {
    const account = await customerService.createAccount(req.params.id, req.body);
    
    res.status(201).json({
      success: true,
      data: account
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Initiate KYC verification
router.post('/:id/verify', async (req, res) => {
  try {
    const verification = await customerService.initiateKYCVerification(req.params.id, req.body);
    
    res.json({
      success: true,
      data: verification
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Get verification status
router.get('/:id/verify/status', async (req, res) => {
  try {
    const status = await customerService.getVerificationStatus(req.params.id);
    
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Upload documents
router.post('/:id/documents', async (req, res) => {
  try {
    const document = await customerService.uploadDocument(req.params.id, req.body);
    
    res.json({
      success: true,
      data: document
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Get risk score
router.get('/:id/risk-score', async (req, res) => {
  try {
    const riskScore = await customerService.calculateRiskScore(req.params.id);
    
    res.json({
      success: true,
      data: riskScore
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Mass import customers
router.post('/import', async (req, res) => {
  try {
    const { data, mappings, organizationId } = req.body;
    
    const result = await customerService.importCustomers({
      data,
      mappings,
      organizationId
    });
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Export customers
router.get('/export', async (req, res) => {
  try {
    const { format = 'csv', filters } = req.query;
    
    const exportData = await customerService.exportCustomers({
      format,
      filters: filters ? JSON.parse(filters) : {}
    });
    
    res.setHeader('Content-Type', format === 'csv' ? 'text/csv' : 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="customers.${format}"`);
    res.send(exportData);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// KYC verification
router.post('/:id/kyc', async (req, res) => {
  try {
    const result = await customerService.performKYC(req.params.id, req.body);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// AML screening
router.post('/:id/aml', async (req, res) => {
  try {
    const result = await customerService.performAMLScreening(req.params.id);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Compliance status
router.get('/:id/compliance', async (req, res) => {
  try {
    const compliance = await customerService.getComplianceStatus(req.params.id);
    
    res.json({
      success: true,
      data: compliance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;