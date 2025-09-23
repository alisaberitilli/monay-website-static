export const organizationTypes = [
  'Government & Public Sector',
  'Banking & Financial Services',
  'Insurance',
  'Healthcare',
  'Retail & E-commerce',
  'Gig Economy & Marketplaces',
  'Transportation & Logistics',
  'Telecommunications',
  'Utilities & Energy',
  'Real Estate & Property',
  'Education',
  'Manufacturing & Supply Chain',
  'Entertainment & Media',
  'Travel & Hospitality',
  'Non-Profit & NGO'
] as const

export type OrganizationType = typeof organizationTypes[number]

export const industryByType: Record<OrganizationType, string[]> = {
  'Government & Public Sector': [
    'Federal benefit programs (SNAP, TANF, WIC, Medicaid)',
    'State unemployment insurance',
    'Veterans benefits',
    'Emergency disaster relief',
    'School lunch programs',
    'Housing assistance (Section 8)',
    'Energy assistance (LIHEAP)',
    'Social Security disbursements',
    'Tax refunds/credits',
    'Municipal services payments'
  ],
  'Banking & Financial Services': [
    'Digital banking',
    'Neo-banks',
    'Credit unions',
    'Community banks',
    'Investment firms',
    'Wealth management',
    'Private banking',
    'Mortgage services',
    'Consumer lending',
    'Commercial banking'
  ],
  'Insurance': [
    'Health insurance',
    'Life insurance',
    'Property & casualty',
    'Auto insurance',
    'Workers compensation',
    'Reinsurance',
    'Travel insurance',
    'Pet insurance',
    'Disability insurance',
    'Title insurance'
  ],
  'Healthcare': [
    'Hospitals & health systems',
    'Medical practices',
    'Telehealth platforms',
    'Pharmacies',
    'Medical device companies',
    'Health savings accounts',
    'Dental/vision providers',
    'Mental health services',
    'Rehabilitation centers',
    'Home health agencies'
  ],
  'Retail & E-commerce': [
    'Online marketplaces',
    'Physical retail stores',
    'Grocery stores',
    'Fashion & apparel',
    'Electronics',
    'Home improvement',
    'Automotive retail',
    'Luxury goods',
    'Subscription services',
    'Direct-to-consumer brands'
  ],
  'Gig Economy & Marketplaces': [
    'Ride-sharing (Uber, Lyft)',
    'Food delivery (DoorDash, UberEats)',
    'Grocery delivery (Instacart)',
    'Task services (TaskRabbit)',
    'Freelance platforms (Upwork, Fiverr)',
    'Home services (Handy, Thumbtack)',
    'Pet services (Rover, Wag)',
    'Content creators',
    'Tutoring platforms',
    'Equipment rental'
  ],
  'Transportation & Logistics': [
    'Airlines',
    'Railways',
    'Shipping companies',
    'Trucking/freight',
    'Last-mile delivery',
    'Public transit',
    'Toll systems',
    'Parking services',
    'Fleet management',
    'Cargo handling'
  ],
  'Telecommunications': [
    'Mobile carriers',
    'Internet service providers',
    'Cable companies',
    'Satellite services',
    'VoIP providers',
    'Data centers',
    'Tower companies',
    'MVNO operators',
    'Fiber networks',
    '5G infrastructure'
  ],
  'Utilities & Energy': [
    'Electric utilities',
    'Gas utilities',
    'Water & sewer',
    'Waste management',
    'Solar energy',
    'Wind energy',
    'Oil & gas',
    'Energy trading',
    'Smart grid services',
    'EV charging networks'
  ],
  'Real Estate & Property': [
    'Property management',
    'Real estate brokers',
    'Title companies',
    'Escrow services',
    'REITs',
    'Commercial leasing',
    'Vacation rentals',
    'Co-working spaces',
    'Self-storage',
    'HOA management'
  ],
  'Education': [
    'K-12 schools',
    'Universities/colleges',
    'Online learning platforms',
    'Vocational schools',
    'Corporate training',
    'Test prep services',
    'Student loan servicers',
    'Scholarship programs',
    'School nutrition programs',
    'Educational technology'
  ],
  'Manufacturing & Supply Chain': [
    'Automotive manufacturing',
    'Consumer goods',
    'Industrial equipment',
    'Food & beverage',
    'Pharmaceuticals',
    'Textiles',
    'Electronics manufacturing',
    'Chemical production',
    'Aerospace & defense',
    'Construction materials'
  ],
  'Entertainment & Media': [
    'Streaming services',
    'Gaming platforms',
    'Music services',
    'Publishing',
    'Event ticketing',
    'Sports leagues',
    'Theme parks',
    'Movie theaters',
    'Live entertainment',
    'Content production'
  ],
  'Travel & Hospitality': [
    'Hotels & resorts',
    'Airlines',
    'Cruise lines',
    'Travel agencies',
    'Car rentals',
    'Tourism boards',
    'Restaurants',
    'Casinos',
    'Vacation packages',
    'Travel insurance'
  ],
  'Non-Profit & NGO': [
    'Charitable organizations',
    'Religious institutions',
    'Foundations',
    'International aid',
    'Environmental groups',
    'Educational nonprofits',
    'Healthcare charities',
    'Arts organizations',
    'Community services',
    'Disaster relief'
  ]
}

export interface Organization {
  id: string
  name: string
  type: OrganizationType
  industry: string
  status: 'active' | 'inactive' | 'suspended'
  kycStatus: 'not_started' | 'pending' | 'approved' | 'rejected'
  complianceScore: number
  wallets: number
  transactions: number
  volume: number
  createdAt: string
  lastActivity: string
  primaryContact: string
  email: string
  phone?: string
  address?: string
  website?: string
  taxId?: string
  description?: string
  limits: {
    dailyTransaction: number
    monthlyTransaction: number
    perTransactionMax: number
  }
}