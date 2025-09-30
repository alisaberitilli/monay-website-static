/**
 * Seed Data Configuration for E2E Tests
 * This file contains all test data seeds for reproducible testing
 */

export interface TestSeedData {
  timestamp: number;
  organization: OrganizationSeed;
  orgAdmin: UserSeed;
  consumer: UserSeed;
  invoices: InvoiceSeed[];
  paymentMethods: PaymentMethodSeed[];
  providers: ProviderSeed[];
}

export interface OrganizationSeed {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  type: string;
  ein?: string;
  website?: string;
  industry?: string;
}

export interface UserSeed {
  firstName: string;
  lastName: string;
  email: string;
  username?: string;
  phone: string;
  password: string;
  mpin: string;
  role?: string;
  kycLevel?: string;
}

export interface InvoiceSeed {
  amount: number;
  description: string;
  dueDate: string;
  items: InvoiceItem[];
  paymentTerms: string;
  taxRate?: number;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface PaymentMethodSeed {
  type: 'card' | 'ach' | 'swift';
  details: CardDetails | ACHDetails | SwiftDetails;
  testAmount: number;
}

export interface CardDetails {
  number: string;
  expMonth: string;
  expYear: string;
  cvv: string;
  zipCode: string;
  nameOnCard?: string;
}

export interface ACHDetails {
  accountNumber: string;
  routingNumber: string;
  accountType: 'checking' | 'savings';
  bankName: string;
}

export interface SwiftDetails {
  swiftCode: string;
  iban: string;
  bankName: string;
  bankAddress: string;
  beneficiaryName: string;
}

export interface ProviderSeed {
  id: 'tempo' | 'circle';
  name: string;
  priority: number;
}

/**
 * Generate deterministic seed data based on timestamp
 */
export function generateSeedData(baseTimestamp?: number): TestSeedData {
  const timestamp = baseTimestamp || Date.now();

  return {
    timestamp,

    organization: {
      name: `Acme Corp ${timestamp}`,
      email: `acme_${timestamp}@testcorp.com`,
      phone: `+1415${String(timestamp).slice(-7)}`, // San Francisco area code
      address: '100 Market Street',
      city: 'San Francisco',
      state: 'CA',
      zip: '94105',
      type: 'enterprise',
      ein: `95-${String(timestamp).slice(-7)}`,
      website: `https://acme-${timestamp}.test.com`,
      industry: 'Technology'
    },

    orgAdmin: {
      firstName: 'John',
      lastName: `Admin${timestamp}`,
      email: `admin_${timestamp}@acmecorp.com`,
      username: `johnadmin${timestamp}`,
      phone: `+1650${String(timestamp).slice(-7)}`, // Bay Area
      password: 'SecureAdmin123!@#',
      mpin: '9876',
      role: 'org_admin',
      kycLevel: 'verified'
    },

    consumer: {
      firstName: 'Jane',
      lastName: `User${timestamp}`,
      email: `jane_${timestamp}@consumer.com`,
      username: `janeuser${timestamp}`,
      phone: `+1510${String(timestamp).slice(-7)}`, // Oakland area
      password: 'UserPass456!@#',
      mpin: '4321',
      role: 'consumer',
      kycLevel: 'basic'
    },

    invoices: [
      {
        amount: 2500.00,
        description: `Professional Services Invoice ${timestamp}`,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days
        paymentTerms: 'Net 30',
        taxRate: 0.0875, // 8.75% CA tax
        items: [
          {
            description: 'Consulting Services',
            quantity: 10,
            unitPrice: 200,
            amount: 2000
          },
          {
            description: 'Implementation Support',
            quantity: 5,
            unitPrice: 100,
            amount: 500
          }
        ]
      },
      {
        amount: 750.00,
        description: `Monthly Subscription ${timestamp}`,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days
        paymentTerms: 'Due on receipt',
        items: [
          {
            description: 'Premium Plan Subscription',
            quantity: 1,
            unitPrice: 750,
            amount: 750
          }
        ]
      }
    ],

    paymentMethods: [
      {
        type: 'card',
        testAmount: 3000.00, // Enough to cover invoices
        details: {
          number: '4242424242424242', // Visa test card
          expMonth: '12',
          expYear: '2026',
          cvv: '123',
          zipCode: '94105',
          nameOnCard: 'Test Card Holder'
        }
      },
      {
        type: 'card',
        testAmount: 1000.00,
        details: {
          number: '5555555555554444', // Mastercard test card
          expMonth: '12',
          expYear: '2026',
          cvv: '456',
          zipCode: '94105',
          nameOnCard: 'Test MC Holder'
        }
      },
      {
        type: 'ach',
        testAmount: 5000.00,
        details: {
          accountNumber: '000123456789',
          routingNumber: '110000000', // Test routing number
          accountType: 'checking',
          bankName: 'Test Bank USA'
        }
      },
      {
        type: 'swift',
        testAmount: 10000.00,
        details: {
          swiftCode: 'TESTUS33XXX',
          iban: 'US00TEST1234567890',
          bankName: 'International Test Bank',
          bankAddress: '123 Wall Street, New York, NY 10005',
          beneficiaryName: 'Test Beneficiary'
        }
      }
    ],

    providers: [
      {
        id: 'tempo',
        name: 'Tempo (Instant)',
        priority: 1 // Primary provider
      },
      {
        id: 'circle',
        name: 'Circle USDC',
        priority: 2 // Secondary provider
      }
    ]
  };
}

/**
 * Get specific test card by type
 */
export function getTestCard(type: 'visa' | 'mastercard' | 'amex' | 'invalid'): CardDetails {
  const cards = {
    visa: {
      number: '4242424242424242',
      expMonth: '12',
      expYear: '2026',
      cvv: '123',
      zipCode: '94105'
    },
    mastercard: {
      number: '5555555555554444',
      expMonth: '12',
      expYear: '2026',
      cvv: '456',
      zipCode: '94105'
    },
    amex: {
      number: '378282246310005',
      expMonth: '12',
      expYear: '2026',
      cvv: '1234',
      zipCode: '10001'
    },
    invalid: {
      number: '4000000000000002', // Card that will be declined
      expMonth: '12',
      expYear: '2026',
      cvv: '999',
      zipCode: '00000'
    }
  };

  return cards[type];
}

/**
 * Get test ACH account by type
 */
export function getTestACH(type: 'valid' | 'nsf' | 'invalid'): ACHDetails {
  const accounts = {
    valid: {
      accountNumber: '000123456789',
      routingNumber: '110000000',
      accountType: 'checking' as const,
      bankName: 'Test Bank USA'
    },
    nsf: {
      accountNumber: '000999999999', // Will return NSF
      routingNumber: '110000000',
      accountType: 'checking' as const,
      bankName: 'NSF Test Bank'
    },
    invalid: {
      accountNumber: '000000000000',
      routingNumber: '999999999', // Invalid routing
      accountType: 'checking' as const,
      bankName: 'Invalid Bank'
    }
  };

  return accounts[type];
}

/**
 * Generate multiple test scenarios
 */
export function generateTestScenarios(): TestSeedData[] {
  const baseTime = Date.now();

  return [
    // Scenario 1: Standard flow with card payment via Tempo
    generateSeedData(baseTime + 1),

    // Scenario 2: ACH payment via Circle
    {
      ...generateSeedData(baseTime + 2),
      paymentMethods: [getTestACH('valid')] as any,
      providers: [
        { id: 'circle', name: 'Circle USDC', priority: 1 },
        { id: 'tempo', name: 'Tempo', priority: 2 }
      ]
    },

    // Scenario 3: SWIFT international payment
    {
      ...generateSeedData(baseTime + 3),
      organization: {
        ...generateSeedData(baseTime + 3).organization,
        name: 'Global Corp Ltd',
        city: 'London',
        state: 'UK',
        zip: 'SW1A 1AA'
      }
    }
  ];
}

/**
 * Validation helper to ensure seed data is valid
 */
export function validateSeedData(seed: TestSeedData): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate organization
  if (!seed.organization.email.includes('@')) {
    errors.push('Invalid organization email');
  }

  // Validate phone numbers
  const phoneRegex = /^\+\d{10,15}$/;
  if (!phoneRegex.test(seed.organization.phone)) {
    errors.push('Invalid organization phone');
  }
  if (!phoneRegex.test(seed.orgAdmin.phone)) {
    errors.push('Invalid admin phone');
  }
  if (!phoneRegex.test(seed.consumer.phone)) {
    errors.push('Invalid consumer phone');
  }

  // Validate passwords
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
  if (!passwordRegex.test(seed.orgAdmin.password)) {
    errors.push('Admin password does not meet complexity requirements');
  }
  if (!passwordRegex.test(seed.consumer.password)) {
    errors.push('Consumer password does not meet complexity requirements');
  }

  // Validate MPIN
  const mpinRegex = /^\d{4,6}$/;
  if (!mpinRegex.test(seed.orgAdmin.mpin)) {
    errors.push('Invalid admin MPIN');
  }
  if (!mpinRegex.test(seed.consumer.mpin)) {
    errors.push('Invalid consumer MPIN');
  }

  // Validate payment methods
  seed.paymentMethods.forEach((method, index) => {
    if (method.type === 'card') {
      const card = method.details as CardDetails;
      if (card.number.length < 13 || card.number.length > 19) {
        errors.push(`Invalid card number for payment method ${index}`);
      }
      if (!card.cvv.match(/^\d{3,4}$/)) {
        errors.push(`Invalid CVV for payment method ${index}`);
      }
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
}

// Export default seed for quick testing
export const defaultSeed = generateSeedData();