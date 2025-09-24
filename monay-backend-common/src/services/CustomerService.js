import { v4 as uuidv4 } from 'uuid';

class CustomerService {
  constructor() {
    // In production, this would connect to PostgreSQL
    this.customers = new Map();
    this.accounts = new Map();
    this.verifications = new Map();
    this.documents = new Map();
    
    // Initialize with mock data
    this.initializeMockData();
  }

  initializeMockData() {
    const mockCustomers = [
      {
        id: 'CUS001',
        name: 'John Smith',
        email: 'john.smith@example.com',
        phone: '+1 555-0123',
        type: 'individual',
        kycStatus: 'verified',
        riskLevel: 'low',
        createdAt: new Date('2024-01-15'),
        lastActivity: new Date('2024-03-20'),
        accountBalance: 45000,
        transactionCount: 124,
        complianceScore: 98,
        organizationId: 'ORG001',
        address: {
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zip: '10001',
          country: 'USA'
        },
        documents: [
          { id: 'DOC001', type: 'ID', status: 'approved' },
          { id: 'DOC002', type: 'Proof of Address', status: 'approved' }
        ]
      },
      {
        id: 'CUS002',
        name: 'Acme Corporation',
        email: 'finance@acmecorp.com',
        phone: '+1 555-0456',
        type: 'business',
        kycStatus: 'pending',
        riskLevel: 'medium',
        createdAt: new Date('2024-02-10'),
        lastActivity: new Date('2024-03-19'),
        accountBalance: 250000,
        transactionCount: 456,
        complianceScore: 85,
        organizationId: 'ORG001',
        address: {
          street: '456 Business Ave',
          city: 'San Francisco',
          state: 'CA',
          zip: '94105',
          country: 'USA'
        },
        documents: [
          { id: 'DOC003', type: 'Business License', status: 'approved' },
          { id: 'DOC004', type: 'Tax ID', status: 'pending' }
        ]
      },
      {
        id: 'CUS003',
        name: 'Sarah Johnson',
        email: 'sarah.j@example.com',
        phone: '+1 555-0789',
        type: 'individual',
        kycStatus: 'rejected',
        riskLevel: 'high',
        createdAt: new Date('2024-03-01'),
        lastActivity: new Date('2024-03-18'),
        accountBalance: 0,
        transactionCount: 0,
        complianceScore: 45,
        organizationId: 'ORG002',
        address: {
          street: '789 Oak Rd',
          city: 'Los Angeles',
          state: 'CA',
          zip: '90001',
          country: 'USA'
        },
        documents: [
          { id: 'DOC005', type: 'ID', status: 'rejected' },
          { id: 'DOC006', type: 'Proof of Address', status: 'pending' }
        ]
      }
    ];

    mockCustomers.forEach(customer => {
      this.customers.set(customer.id, customer);
    });

    // Initialize mock accounts
    this.accounts.set('CUS001', [
      { id: 'ACC001', type: 'checking', balance: 25000, status: 'active' },
      { id: 'ACC002', type: 'savings', balance: 20000, status: 'active' }
    ]);
    
    this.accounts.set('CUS002', [
      { id: 'ACC003', type: 'business', balance: 250000, status: 'active' }
    ]);
  }

  async listCustomers(params) {
    const { page, limit, search, kycStatus, riskLevel, organizationId } = params;
    
    let filteredCustomers = Array.from(this.customers.values());

    // Apply filters
    if (search) {
      filteredCustomers = filteredCustomers.filter(c => 
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (kycStatus) {
      filteredCustomers = filteredCustomers.filter(c => c.kycStatus === kycStatus);
    }

    if (riskLevel) {
      filteredCustomers = filteredCustomers.filter(c => c.riskLevel === riskLevel);
    }

    if (organizationId) {
      filteredCustomers = filteredCustomers.filter(c => c.organizationId === organizationId);
    }

    // Apply pagination
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedCustomers = filteredCustomers.slice(start, end);

    return {
      customers: paginatedCustomers,
      total: filteredCustomers.length,
      page,
      limit,
      totalPages: Math.ceil(filteredCustomers.length / limit)
    };
  }

  async getCustomerById(id) {
    return this.customers.get(id) || null;
  }

  async createCustomer(data) {
    const customerId = `CUS${Date.now().toString().slice(-6)}`;
    
    const newCustomer = {
      id: customerId,
      ...data,
      kycStatus: 'pending',
      riskLevel: 'medium',
      accountBalance: 0,
      transactionCount: 0,
      complianceScore: 0,
      createdAt: new Date(),
      lastActivity: new Date(),
      documents: []
    };

    this.customers.set(customerId, newCustomer);
    return newCustomer;
  }

  async updateCustomer(id, data) {
    const customer = this.customers.get(id);
    
    if (!customer) {
      throw new Error('Customer not found');
    }

    const updatedCustomer = {
      ...customer,
      ...data,
      lastActivity: new Date()
    };

    this.customers.set(id, updatedCustomer);
    return updatedCustomer;
  }

  async deleteCustomer(id) {
    const customer = this.customers.get(id);
    
    if (!customer) {
      throw new Error('Customer not found');
    }

    this.customers.delete(id);
    this.accounts.delete(id);
    this.verifications.delete(id);
    this.documents.delete(id);
    
    return true;
  }

  async getCustomerAccounts(customerId) {
    return this.accounts.get(customerId) || [];
  }

  async createAccount(customerId, data) {
    const customer = this.customers.get(customerId);
    
    if (!customer) {
      throw new Error('Customer not found');
    }

    const accountId = `ACC${Date.now().toString().slice(-6)}`;
    const newAccount = {
      id: accountId,
      customerId,
      ...data,
      balance: 0,
      status: 'pending',
      createdAt: new Date()
    };

    const customerAccounts = this.accounts.get(customerId) || [];
    customerAccounts.push(newAccount);
    this.accounts.set(customerId, customerAccounts);

    return newAccount;
  }

  async initiateKYCVerification(customerId, data) {
    const customer = this.customers.get(customerId);
    
    if (!customer) {
      throw new Error('Customer not found');
    }

    const verificationId = `VER${Date.now().toString().slice(-6)}`;
    const verification = {
      id: verificationId,
      customerId,
      type: data.type || 'standard',
      status: 'in_progress',
      steps: [
        { name: 'Document Upload', status: 'pending' },
        { name: 'Identity Verification', status: 'pending' },
        { name: 'Address Verification', status: 'pending' },
        { name: 'AML Screening', status: 'pending' },
        { name: 'Risk Assessment', status: 'pending' }
      ],
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    };

    this.verifications.set(customerId, verification);
    
    // Update customer KYC status
    customer.kycStatus = 'in_progress';
    this.customers.set(customerId, customer);

    return verification;
  }

  async getVerificationStatus(customerId) {
    return this.verifications.get(customerId) || {
      status: 'not_started',
      message: 'Verification has not been initiated'
    };
  }

  async uploadDocument(customerId, data) {
    const customer = this.customers.get(customerId);
    
    if (!customer) {
      throw new Error('Customer not found');
    }

    const documentId = `DOC${Date.now().toString().slice(-6)}`;
    const document = {
      id: documentId,
      customerId,
      type: data.type,
      fileName: data.fileName,
      fileSize: data.fileSize,
      mimeType: data.mimeType,
      status: 'pending_review',
      uploadedAt: new Date()
    };

    const customerDocuments = this.documents.get(customerId) || [];
    customerDocuments.push(document);
    this.documents.set(customerId, customerDocuments);

    // Update customer documents
    if (!customer.documents) {
      customer.documents = [];
    }
    customer.documents.push({ id: documentId, type: data.type, status: 'pending' });
    this.customers.set(customerId, customer);

    return document;
  }

  async calculateRiskScore(customerId) {
    const customer = this.customers.get(customerId);
    
    if (!customer) {
      throw new Error('Customer not found');
    }

    // Simulate risk calculation
    const factors = {
      kycStatus: customer.kycStatus === 'verified' ? 20 : 0,
      documentCount: (customer.documents?.length || 0) * 10,
      transactionHistory: Math.min(customer.transactionCount / 10, 30),
      accountBalance: Math.min(customer.accountBalance / 10000, 30)
    };

    const totalScore = Object.values(factors).reduce((a, b) => a + b, 0);
    
    const riskLevel = 
      totalScore >= 80 ? 'low' :
      totalScore >= 50 ? 'medium' : 'high';

    // Update customer risk level
    customer.riskLevel = riskLevel;
    customer.complianceScore = totalScore;
    this.customers.set(customerId, customer);

    return {
      score: totalScore,
      level: riskLevel,
      factors,
      lastCalculated: new Date()
    };
  }

  async importCustomers({ data, mappings, organizationId }) {
    const results = {
      success: [],
      failed: [],
      total: data.length
    };

    for (const row of data) {
      try {
        const customerData = {};
        
        // Map fields according to mappings
        for (const [systemField, fileField] of Object.entries(mappings)) {
          if (row[fileField] !== undefined) {
            customerData[systemField] = row[fileField];
          }
        }

        customerData.organizationId = organizationId;
        const customer = await this.createCustomer(customerData);
        results.success.push(customer.id);
      } catch (error) {
        results.failed.push({ row, error: error.message });
      }
    }

    return results;
  }

  async exportCustomers({ format, filters }) {
    const { customers } = await this.listCustomers({ ...filters, page: 1, limit: 10000 });

    if (format === 'csv') {
      // Generate CSV
      const headers = ['ID', 'Name', 'Email', 'Phone', 'Type', 'KYC Status', 'Risk Level', 'Balance'];
      const rows = customers.map(c => [
        c.id,
        c.name,
        c.email,
        c.phone,
        c.type,
        c.kycStatus,
        c.riskLevel,
        c.accountBalance
      ]);

      const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
      return csv;
    }

    return customers;
  }

  async performKYC(customerId, data) {
    const customer = this.customers.get(customerId);
    
    if (!customer) {
      throw new Error('Customer not found');
    }

    // Simulate KYC check
    const result = {
      customerId,
      status: 'completed',
      checks: {
        identity: { status: 'passed', confidence: 95 },
        address: { status: 'passed', confidence: 90 },
        documents: { status: 'passed', confidence: 98 },
        sanctions: { status: 'clear', matches: 0 },
        pep: { status: 'clear', matches: 0 }
      },
      performedAt: new Date()
    };

    // Update customer KYC status
    customer.kycStatus = 'verified';
    this.customers.set(customerId, customer);

    return result;
  }

  async performAMLScreening(customerId) {
    const customer = this.customers.get(customerId);
    
    if (!customer) {
      throw new Error('Customer not found');
    }

    // Simulate AML screening
    return {
      customerId,
      status: 'clear',
      screenings: {
        ofac: { status: 'clear', matches: 0 },
        pep: { status: 'clear', matches: 0 },
        sanctions: { status: 'clear', matches: 0 },
        adverseMedia: { status: 'clear', matches: 0 }
      },
      screenedAt: new Date()
    };
  }

  async getComplianceStatus(customerId) {
    const customer = this.customers.get(customerId);
    
    if (!customer) {
      throw new Error('Customer not found');
    }

    return {
      customerId,
      kycStatus: customer.kycStatus,
      amlStatus: 'clear',
      riskLevel: customer.riskLevel,
      complianceScore: customer.complianceScore,
      lastReview: customer.lastActivity,
      nextReview: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
      requirements: {
        documentsRequired: customer.documents?.filter(d => d.status === 'pending').length || 0,
        actionsRequired: customer.kycStatus === 'pending' ? ['Complete KYC', 'Upload Documents'] : []
      }
    };
  }
}

export default CustomerService;