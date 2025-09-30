/**
 * Industry-specific seed data for comprehensive E2E testing
 * Each industry has unique configurations and test scenarios
 */

export interface IndustrySeedData {
  industry: string;
  organization: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    type: string;
    ein: string;
    website: string;
    industry: string;
    description: string;
  };
  orgAdmin: {
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    phone: string;
    password: string;
    mpin: string;
    role: string;
    department: string;
  };
  invoiceTemplates: Array<{
    type: string;
    amount: number;
    description: string;
    paymentTerms: string;
    items: Array<{
      description: string;
      quantity: number;
      unitPrice: number;
    }>;
  }>;
  preferredPaymentMethods: string[];
  complianceLevel: 'basic' | 'standard' | 'enhanced';
  transactionLimits: {
    daily: number;
    monthly: number;
    perTransaction: number;
  };
}

/**
 * Generate industry-specific seed data
 */
export function generateIndustrySeeds(timestamp: number = Date.now()): IndustrySeedData[] {
  return [
    // Healthcare Industry
    {
      industry: 'Healthcare',
      organization: {
        name: `MedTech Solutions ${timestamp}`,
        email: `billing_${timestamp}@medtechsolutions.com`,
        phone: `+1415${String(timestamp).slice(-7)}`,
        address: '500 Medical Plaza',
        city: 'San Francisco',
        state: 'CA',
        zip: '94102',
        type: 'enterprise',
        ein: `95-${String(timestamp).slice(-7)}`,
        website: `https://medtech-${timestamp}.test.com`,
        industry: 'Healthcare',
        description: 'Medical equipment and healthcare solutions provider'
      },
      orgAdmin: {
        firstName: 'Dr. Sarah',
        lastName: `Health${timestamp}`,
        email: `sarah.health_${timestamp}@medtechsolutions.com`,
        username: `drsarah${timestamp}`,
        phone: `+1650${String(timestamp).slice(-7)}`,
        password: 'MedTech2025!@#',
        mpin: '7890',
        role: 'org_admin',
        department: 'Finance'
      },
      invoiceTemplates: [
        {
          type: 'medical_equipment',
          amount: 15000.00,
          description: 'Medical Equipment Purchase',
          paymentTerms: 'Net 30',
          items: [
            { description: 'MRI Scanner Maintenance', quantity: 1, unitPrice: 10000 },
            { description: 'X-Ray Equipment Service', quantity: 2, unitPrice: 2500 }
          ]
        },
        {
          type: 'consultation',
          amount: 500.00,
          description: 'Healthcare Consultation Services',
          paymentTerms: 'Due on receipt',
          items: [
            { description: 'Telemedicine Consultation', quantity: 1, unitPrice: 500 }
          ]
        }
      ],
      preferredPaymentMethods: ['ach', 'swift'],
      complianceLevel: 'enhanced',
      transactionLimits: {
        daily: 500000,
        monthly: 10000000,
        perTransaction: 100000
      }
    },

    // Technology Industry
    {
      industry: 'Technology',
      organization: {
        name: `CloudTech Innovations ${timestamp}`,
        email: `finance_${timestamp}@cloudtech.io`,
        phone: `+1408${String(timestamp).slice(-7)}`,
        address: '1000 Tech Park Drive',
        city: 'San Jose',
        state: 'CA',
        zip: '95110',
        type: 'enterprise',
        ein: `94-${String(timestamp).slice(-7)}`,
        website: `https://cloudtech-${timestamp}.test.io`,
        industry: 'Technology',
        description: 'Cloud infrastructure and SaaS solutions'
      },
      orgAdmin: {
        firstName: 'Alex',
        lastName: `Cloud${timestamp}`,
        email: `alex.cloud_${timestamp}@cloudtech.io`,
        username: `alexcloud${timestamp}`,
        phone: `+1669${String(timestamp).slice(-7)}`,
        password: 'CloudTech2025!@#',
        mpin: '2468',
        role: 'org_admin',
        department: 'Operations'
      },
      invoiceTemplates: [
        {
          type: 'saas_subscription',
          amount: 5000.00,
          description: 'Enterprise SaaS Subscription',
          paymentTerms: 'Net 15',
          items: [
            { description: 'Cloud Infrastructure - Pro Plan', quantity: 100, unitPrice: 40 },
            { description: 'API Gateway Access', quantity: 1, unitPrice: 1000 }
          ]
        },
        {
          type: 'consulting',
          amount: 25000.00,
          description: 'Technical Consulting Services',
          paymentTerms: 'Net 45',
          items: [
            { description: 'Architecture Design', quantity: 40, unitPrice: 500 },
            { description: 'Implementation Support', quantity: 10, unitPrice: 500 }
          ]
        }
      ],
      preferredPaymentMethods: ['card', 'ach', 'crypto'],
      complianceLevel: 'standard',
      transactionLimits: {
        daily: 1000000,
        monthly: 20000000,
        perTransaction: 250000
      }
    },

    // Retail Industry
    {
      industry: 'Retail',
      organization: {
        name: `GlobalMart Stores ${timestamp}`,
        email: `accounts_${timestamp}@globalmart.com`,
        phone: `+1212${String(timestamp).slice(-7)}`,
        address: '250 Fifth Avenue',
        city: 'New York',
        state: 'NY',
        zip: '10001',
        type: 'enterprise',
        ein: `13-${String(timestamp).slice(-7)}`,
        website: `https://globalmart-${timestamp}.test.com`,
        industry: 'Retail',
        description: 'Multi-channel retail and e-commerce'
      },
      orgAdmin: {
        firstName: 'Maria',
        lastName: `Retail${timestamp}`,
        email: `maria.retail_${timestamp}@globalmart.com`,
        username: `mariaretail${timestamp}`,
        phone: `+1646${String(timestamp).slice(-7)}`,
        password: 'GlobalMart2025!@#',
        mpin: '1357',
        role: 'org_admin',
        department: 'Accounting'
      },
      invoiceTemplates: [
        {
          type: 'bulk_purchase',
          amount: 50000.00,
          description: 'Wholesale Inventory Purchase',
          paymentTerms: 'Net 60',
          items: [
            { description: 'Electronics Inventory', quantity: 100, unitPrice: 300 },
            { description: 'Apparel Collection', quantity: 200, unitPrice: 100 }
          ]
        },
        {
          type: 'supplier_payment',
          amount: 10000.00,
          description: 'Supplier Payment',
          paymentTerms: '2/10 Net 30',
          items: [
            { description: 'Seasonal Products', quantity: 50, unitPrice: 200 }
          ]
        }
      ],
      preferredPaymentMethods: ['ach', 'card'],
      complianceLevel: 'standard',
      transactionLimits: {
        daily: 2000000,
        monthly: 50000000,
        perTransaction: 500000
      }
    },

    // Manufacturing Industry
    {
      industry: 'Manufacturing',
      organization: {
        name: `Industrial Systems ${timestamp}`,
        email: `procurement_${timestamp}@industrialsys.com`,
        phone: `+1313${String(timestamp).slice(-7)}`,
        address: '5000 Factory Boulevard',
        city: 'Detroit',
        state: 'MI',
        zip: '48201',
        type: 'enterprise',
        ein: `38-${String(timestamp).slice(-7)}`,
        website: `https://industrial-${timestamp}.test.com`,
        industry: 'Manufacturing',
        description: 'Industrial equipment and manufacturing solutions'
      },
      orgAdmin: {
        firstName: 'Robert',
        lastName: `Industrial${timestamp}`,
        email: `robert.industrial_${timestamp}@industrialsys.com`,
        username: `robertind${timestamp}`,
        phone: `+1248${String(timestamp).slice(-7)}`,
        password: 'Industrial2025!@#',
        mpin: '9753',
        role: 'org_admin',
        department: 'Procurement'
      },
      invoiceTemplates: [
        {
          type: 'raw_materials',
          amount: 100000.00,
          description: 'Raw Materials Purchase Order',
          paymentTerms: 'Net 45',
          items: [
            { description: 'Steel Components', quantity: 1000, unitPrice: 50 },
            { description: 'Aluminum Sheets', quantity: 500, unitPrice: 100 }
          ]
        },
        {
          type: 'equipment',
          amount: 250000.00,
          description: 'Manufacturing Equipment',
          paymentTerms: 'Net 90',
          items: [
            { description: 'CNC Machine', quantity: 1, unitPrice: 200000 },
            { description: 'Assembly Line Components', quantity: 10, unitPrice: 5000 }
          ]
        }
      ],
      preferredPaymentMethods: ['swift', 'ach'],
      complianceLevel: 'enhanced',
      transactionLimits: {
        daily: 5000000,
        monthly: 100000000,
        perTransaction: 1000000
      }
    },

    // Real Estate Industry
    {
      industry: 'RealEstate',
      organization: {
        name: `Premier Properties ${timestamp}`,
        email: `escrow_${timestamp}@premierproperties.com`,
        phone: `+1305${String(timestamp).slice(-7)}`,
        address: '1 Biscayne Tower',
        city: 'Miami',
        state: 'FL',
        zip: '33131',
        type: 'enterprise',
        ein: `59-${String(timestamp).slice(-7)}`,
        website: `https://premier-${timestamp}.test.com`,
        industry: 'Real Estate',
        description: 'Commercial and residential real estate services'
      },
      orgAdmin: {
        firstName: 'Jennifer',
        lastName: `Property${timestamp}`,
        email: `jennifer.property_${timestamp}@premierproperties.com`,
        username: `jenniferprop${timestamp}`,
        phone: `+1786${String(timestamp).slice(-7)}`,
        password: 'Premier2025!@#',
        mpin: '8642',
        role: 'org_admin',
        department: 'Escrow'
      },
      invoiceTemplates: [
        {
          type: 'commission',
          amount: 30000.00,
          description: 'Real Estate Commission',
          paymentTerms: 'Due at closing',
          items: [
            { description: 'Property Sale Commission (3%)', quantity: 1, unitPrice: 30000 }
          ]
        },
        {
          type: 'property_management',
          amount: 2500.00,
          description: 'Monthly Property Management',
          paymentTerms: 'Net 5',
          items: [
            { description: 'Property Management Services', quantity: 10, unitPrice: 250 }
          ]
        }
      ],
      preferredPaymentMethods: ['swift', 'ach', 'card'],
      complianceLevel: 'enhanced',
      transactionLimits: {
        daily: 10000000,
        monthly: 200000000,
        perTransaction: 5000000
      }
    },

    // Government Industry
    {
      industry: 'Government',
      paymentProviders: ['tempo', 'circle'],
      organization: {
        name: `Federal Agency ${timestamp}`,
        email: `treasury_${timestamp}@fedagency.gov`,
        phone: `+1202${String(timestamp).slice(-7)}`,
        address: '1500 Pennsylvania Avenue',
        city: 'Washington',
        state: 'DC',
        zip: '20220',
        type: 'government',
        ein: `52-${String(timestamp).slice(-7)}`,
        website: `https://fedagency-${timestamp}.gov`,
        industry: 'Government',
        description: 'Federal government agency operations'
      },
      orgAdmin: {
        firstName: 'Director',
        lastName: `Smith${timestamp}`,
        email: `director.smith_${timestamp}@fedagency.gov`,
        username: `dirsmith${timestamp}`,
        phone: `+1703${String(timestamp).slice(-7)}`,
        password: 'FedGov2025!@#',
        mpin: '9999',
        role: 'org_admin',
        department: 'Treasury Operations'
      },
      invoiceTemplates: [
        {
          type: 'contractor_payment',
          amount: 250000.00,
          description: 'Defense Contractor Payment',
          paymentTerms: 'Net 30',
          items: [
            { description: 'Security Services', quantity: 1, unitPrice: 150000 },
            { description: 'Equipment Procurement', quantity: 1, unitPrice: 100000 }
          ]
        },
        {
          type: 'grant_disbursement',
          amount: 500000.00,
          description: 'Research Grant Disbursement',
          paymentTerms: 'Immediate',
          items: [
            { description: 'Research Grant - Phase 1', quantity: 1, unitPrice: 500000 }
          ]
        }
      ],
      preferredPaymentMethods: ['ach', 'swift'],
      complianceLevel: 'maximum',
      transactionLimits: {
        daily: 50000000,
        monthly: 1000000000,
        perTransaction: 10000000
      }
    },

    // Capital Markets Industry
    {
      industry: 'Capital Markets',
      paymentProviders: ['circle', 'tempo'],
      organization: {
        name: `Global Investment Bank ${timestamp}`,
        email: `operations_${timestamp}@gibcapital.com`,
        phone: `+1212${String(timestamp).slice(-7)}`,
        address: '200 Wall Street',
        city: 'New York',
        state: 'NY',
        zip: '10005',
        type: 'financial_institution',
        ein: `87-${String(timestamp).slice(-7)}`,
        website: `https://gibcapital-${timestamp}.com`,
        industry: 'Capital Markets',
        description: 'Investment banking and capital markets'
      },
      orgAdmin: {
        firstName: 'Managing',
        lastName: `Director${timestamp}`,
        email: `md_${timestamp}@gibcapital.com`,
        username: `mdirector${timestamp}`,
        phone: `+1917${String(timestamp).slice(-7)}`,
        password: 'CapMarkets2025!@#',
        mpin: '7777',
        role: 'org_admin',
        department: 'Trading Operations'
      },
      invoiceTemplates: [
        {
          type: 'settlement',
          amount: 10000000.00,
          description: 'Securities Settlement',
          paymentTerms: 'T+2',
          items: [
            { description: 'Equity Securities Settlement', quantity: 1, unitPrice: 10000000 }
          ]
        },
        {
          type: 'margin_call',
          amount: 5000000.00,
          description: 'Margin Call Payment',
          paymentTerms: 'Immediate',
          items: [
            { description: 'Margin Requirement', quantity: 1, unitPrice: 5000000 }
          ]
        }
      ],
      preferredPaymentMethods: ['swift', 'ach'],
      complianceLevel: 'maximum',
      transactionLimits: {
        daily: 100000000,
        monthly: 2000000000,
        perTransaction: 50000000
      }
    }
  ];
}

/**
 * Generate test consumers for each industry
 */
export function generateConsumerSeeds(industryName: string, timestamp: number): any {
  const consumerMap: Record<string, any> = {
    Healthcare: {
      firstName: 'Patient',
      lastName: `John${timestamp}`,
      email: `patient.john_${timestamp}@healthcare.test`,
      username: `patientjohn${timestamp}`,
      phone: `+1415${String(timestamp).slice(-7, -4)}${String(timestamp).slice(-3)}`,
      password: 'Patient2025!@#',
      mpin: '1111',
      role: 'consumer',
      walletTopUp: 20000
    },
    Technology: {
      firstName: 'Developer',
      lastName: `Jane${timestamp}`,
      email: `developer.jane_${timestamp}@tech.test`,
      username: `devjane${timestamp}`,
      phone: `+1408${String(timestamp).slice(-7, -4)}${String(timestamp).slice(-3)}`,
      password: 'Developer2025!@#',
      mpin: '2222',
      role: 'consumer',
      walletTopUp: 10000
    },
    Retail: {
      firstName: 'Shopper',
      lastName: `Mike${timestamp}`,
      email: `shopper.mike_${timestamp}@retail.test`,
      username: `shoppermike${timestamp}`,
      phone: `+1212${String(timestamp).slice(-7, -4)}${String(timestamp).slice(-3)}`,
      password: 'Shopper2025!@#',
      mpin: '3333',
      role: 'consumer',
      walletTopUp: 75000
    },
    Manufacturing: {
      firstName: 'Supplier',
      lastName: `Tom${timestamp}`,
      email: `supplier.tom_${timestamp}@manufacturing.test`,
      username: `suppliertom${timestamp}`,
      phone: `+1313${String(timestamp).slice(-7, -4)}${String(timestamp).slice(-3)}`,
      password: 'Supplier2025!@#',
      mpin: '4444',
      role: 'consumer',
      walletTopUp: 150000
    },
    RealEstate: {
      firstName: 'Buyer',
      lastName: `Lisa${timestamp}`,
      email: `buyer.lisa_${timestamp}@realestate.test`,
      username: `buyerlisa${timestamp}`,
      phone: `+1305${String(timestamp).slice(-7, -4)}${String(timestamp).slice(-3)}`,
      password: 'Buyer2025!@#',
      mpin: '5555',
      role: 'consumer',
      walletTopUp: 50000
    },
    Government: {
      firstName: 'Contractor',
      lastName: `Wilson${timestamp}`,
      email: `contractor.wilson_${timestamp}@govcontractor.test`,
      username: `cwilson${timestamp}`,
      phone: `+1571${String(timestamp).slice(-7, -4)}${String(timestamp).slice(-3)}`,
      password: 'GovCont2025!@#',
      mpin: '6666',
      role: 'consumer',
      walletTopUp: 300000
    },
    'Capital Markets': {
      firstName: 'Trader',
      lastName: `Morgan${timestamp}`,
      email: `trader.morgan_${timestamp}@trading.test`,
      username: `tmorgan${timestamp}`,
      phone: `+1646${String(timestamp).slice(-7, -4)}${String(timestamp).slice(-3)}`,
      password: 'Trading2025!@#',
      mpin: '8888',
      role: 'consumer',
      walletTopUp: 1000000
    }
  };

  return consumerMap[industryName] || consumerMap['Technology'];
}

/**
 * Get payment method configurations
 */
export function getPaymentMethodConfigs() {
  return {
    card: {
      visa: {
        number: '4242424242424242',
        expMonth: '12',
        expYear: '2026',
        cvv: '123',
        zipCode: '94105',
        nameOnCard: 'Test Card Holder'
      },
      mastercard: {
        number: '5555555555554444',
        expMonth: '12',
        expYear: '2026',
        cvv: '456',
        zipCode: '94105',
        nameOnCard: 'Test MC Holder'
      },
      amex: {
        number: '378282246310005',
        expMonth: '12',
        expYear: '2026',
        cvv: '1234',
        zipCode: '10001',
        nameOnCard: 'Test Amex Holder'
      }
    },
    ach: {
      checking: {
        accountNumber: '000123456789',
        routingNumber: '110000000',
        accountType: 'checking',
        bankName: 'Test Bank USA',
        accountHolder: 'Test Account Holder'
      },
      savings: {
        accountNumber: '000987654321',
        routingNumber: '110000000',
        accountType: 'savings',
        bankName: 'Test Savings Bank',
        accountHolder: 'Test Savings Holder'
      }
    },
    swift: {
      international: {
        swiftCode: 'TESTUS33XXX',
        iban: 'US00TEST1234567890',
        bankName: 'International Test Bank',
        bankAddress: '123 Wall Street, New York, NY 10005',
        beneficiaryName: 'Test Beneficiary',
        beneficiaryAddress: '456 Main St, New York, NY 10001'
      },
      europe: {
        swiftCode: 'TESTGB2LXXX',
        iban: 'GB00TEST9876543210',
        bankName: 'European Test Bank',
        bankAddress: '10 Downing Street, London, UK',
        beneficiaryName: 'EU Test Beneficiary',
        beneficiaryAddress: '20 Oxford Street, London, UK'
      }
    }
  };
}

/**
 * Get payment provider configurations
 */
export function getPaymentProviderConfigs() {
  return {
    tempo: {
      name: 'Tempo (Instant)',
      priority: 1,
      supportedMethods: ['card', 'ach'],
      processingTime: 'instant',
      fees: {
        card: 0.029, // 2.9%
        ach: 0.008   // 0.8%
      }
    },
    circle: {
      name: 'Circle USDC',
      priority: 2,
      supportedMethods: ['card', 'ach', 'swift', 'crypto'],
      processingTime: '1-3 minutes',
      fees: {
        card: 0.035,  // 3.5%
        ach: 0.010,   // 1.0%
        swift: 0.015, // 1.5%
        crypto: 0.005 // 0.5%
      }
    }
  };
}