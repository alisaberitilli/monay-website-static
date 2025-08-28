import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import uniqid from 'uniqid';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');
  
  // Clear existing data (optional - comment out if you want to keep existing data)
  console.log('Clearing existing data...');
  await prisma.transaction.deleteMany();
  await prisma.userBankAccount.deleteMany();
  await prisma.userCard.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.userRole.deleteMany();
  await prisma.user.deleteMany();
  await prisma.role.deleteMany();
  await prisma.faq.deleteMany();
  await prisma.cms.deleteMany();
  await prisma.setting.deleteMany();
  await prisma.kycDocument.deleteMany();
  await prisma.country.deleteMany();

  // Create roles
  const adminRole = await prisma.role.create({
    data: {
      name: 'admin',
      displayName: 'Administrator',
      description: 'Full system access',
      permissions: {
        users: ['create', 'read', 'update', 'delete'],
        transactions: ['create', 'read', 'update', 'delete'],
        settings: ['create', 'read', 'update', 'delete'],
      },
    },
  });

  const vipRole = await prisma.role.create({
    data: {
      name: 'vip',
      displayName: 'VIP User',
      description: 'VIP user with enhanced limits',
      permissions: {
        profile: ['read', 'update'],
        transactions: ['create', 'read'],
        wallet: ['read', 'update'],
        premium: ['access'],
      },
    },
  });

  const premiumRole = await prisma.role.create({
    data: {
      name: 'premium',
      displayName: 'Premium User',
      description: 'Premium user with additional features',
      permissions: {
        profile: ['read', 'update'],
        transactions: ['create', 'read'],
        wallet: ['read', 'update'],
      },
    },
  });
  
  const userRole = await prisma.role.create({
    data: {
      name: 'user',
      displayName: 'Standard User',
      description: 'Standard user access',
      permissions: {
        profile: ['read', 'update'],
        transactions: ['create', 'read'],
        wallet: ['read'],
      },
    },
  });
  
  // Create countries
  const countries = [
    { name: 'United States', code: 'US', dialCode: '+1', currency: 'USD', currencySymbol: '$' },
    { name: 'United Kingdom', code: 'GB', dialCode: '+44', currency: 'GBP', currencySymbol: '£' },
    { name: 'Canada', code: 'CA', dialCode: '+1', currency: 'CAD', currencySymbol: '$' },
    { name: 'Australia', code: 'AU', dialCode: '+61', currency: 'AUD', currencySymbol: '$' },
    { name: 'India', code: 'IN', dialCode: '+91', currency: 'INR', currencySymbol: '₹' },
  ];
  
  for (const country of countries) {
    await prisma.country.create({
      data: country,
    });
  }
  
  // Create KYC document types
  const kycDocuments = [
    {
      documentType: 'passport',
      displayName: 'Passport',
      description: 'International passport',
      requiredFields: ['number', 'expiry_date', 'country'],
    },
    {
      documentType: 'drivers_license',
      displayName: "Driver's License",
      description: 'Government issued driving license',
      requiredFields: ['number', 'expiry_date', 'state'],
    },
    {
      documentType: 'national_id',
      displayName: 'National ID',
      description: 'Government issued national identification',
      requiredFields: ['number', 'expiry_date'],
    },
  ];
  
  for (const doc of kycDocuments) {
    await prisma.kycDocument.create({
      data: doc,
    });
  }
  
  // Create settings
  const settings = [
    { key: 'app_name', value: 'Monay Wallet', type: 'string', category: 'general' },
    { key: 'support_email', value: 'support@monay.com', type: 'string', category: 'contact' },
    { key: 'min_transaction_amount', value: '1', type: 'number', category: 'transaction' },
    { key: 'max_transaction_amount', value: '10000', type: 'number', category: 'transaction' },
    { key: 'transaction_fee_percentage', value: '0.5', type: 'number', category: 'transaction' },
    { key: 'maintenance_mode', value: 'false', type: 'boolean', category: 'system' },
    { key: 'kyc_required', value: 'true', type: 'boolean', category: 'security' },
    { key: 'two_factor_enabled', value: 'true', type: 'boolean', category: 'security' },
  ];
  
  for (const setting of settings) {
    await prisma.setting.create({
      data: setting,
    });
  }
  
  // Create CMS pages
  const cmsPages = [
    {
      slug: 'terms',
      title: 'Terms of Service',
      content: '<h1>Terms of Service</h1><p>Welcome to Monay Wallet...</p>',
      metaTitle: 'Terms of Service - Monay Wallet',
      metaDescription: 'Read our terms of service',
    },
    {
      slug: 'privacy',
      title: 'Privacy Policy',
      content: '<h1>Privacy Policy</h1><p>Your privacy is important to us...</p>',
      metaTitle: 'Privacy Policy - Monay Wallet',
      metaDescription: 'Learn about our privacy policy',
    },
    {
      slug: 'about',
      title: 'About Us',
      content: '<h1>About Monay Wallet</h1><p>We are a digital wallet platform...</p>',
      metaTitle: 'About Us - Monay Wallet',
      metaDescription: 'Learn more about Monay Wallet',
    },
  ];
  
  for (const page of cmsPages) {
    await prisma.cms.create({
      data: page,
    });
  }
  
  // Create FAQs
  const faqs = [
    {
      question: 'How do I create an account?',
      answer: 'You can create an account by downloading our app and following the signup process.',
      category: 'account',
      order: 1,
    },
    {
      question: 'Is my money safe?',
      answer: 'Yes, we use bank-level encryption and security measures to protect your funds.',
      category: 'security',
      order: 2,
    },
    {
      question: 'What are the transaction fees?',
      answer: 'We charge a small fee of 0.5% per transaction with a minimum of $0.10.',
      category: 'fees',
      order: 3,
    },
    {
      question: 'How do I verify my account?',
      answer: 'Account verification requires uploading a government-issued ID and proof of address.',
      category: 'verification',
      order: 4,
    },
  ];
  
  for (const faq of faqs) {
    await prisma.faq.create({
      data: faq,
    });
  }
  
  // Create users with mock data from frontend
  const hashedPassword = await bcrypt.hash('Password123!', 12);
  
  // Admin user
  const adminUser = await prisma.user.create({
    data: {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@monay.com',
      mobile: '+1234567800',
      password: hashedPassword,
      isEmailVerified: true,
      isMobileVerified: true,
      isKycVerified: true,
      accountType: 'personal',
      referralCode: 'ADMIN001',
      walletBalance: 100000,
      lastLoginAt: new Date(),
      address: '123 Admin Street',
      city: 'New York',
      state: 'NY',
      country: 'United States',
      zipCode: '10001',
      userRoles: {
        create: {
          roleId: adminRole.id,
        },
      },
    },
  });

  // John Doe - Premium User
  const johnDoe = await prisma.user.create({
    data: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      mobile: '+1234567890',
      password: hashedPassword,
      walletBalance: 12450.75,
      isEmailVerified: true,
      isMobileVerified: true,
      isKycVerified: true,
      accountType: 'personal',
      referralCode: 'JOHN001',
      lastLoginAt: new Date('2024-08-23'),
      address: '456 Oak Street',
      city: 'Los Angeles',
      state: 'CA',
      country: 'United States',
      zipCode: '90001',
      userRoles: {
        create: {
          roleId: premiumRole.id,
        },
      },
    },
  });

  // Jane Smith - Regular User
  const janeSmith = await prisma.user.create({
    data: {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      mobile: '+1234567891',
      password: hashedPassword,
      walletBalance: 8920.30,
      isEmailVerified: true,
      isMobileVerified: true,
      isKycVerified: false,
      accountType: 'personal',
      referralCode: 'JANE001',
      lastLoginAt: new Date('2024-08-22'),
      address: '789 Pine Avenue',
      city: 'Chicago',
      state: 'IL',
      country: 'United States',
      zipCode: '60601',
      userRoles: {
        create: {
          roleId: userRole.id,
        },
      },
    },
  });

  // Mike Johnson - Inactive User
  const mikeJohnson = await prisma.user.create({
    data: {
      firstName: 'Mike',
      lastName: 'Johnson',
      email: 'mike.johnson@example.com',
      mobile: '+1234567892',
      password: hashedPassword,
      walletBalance: 3250.00,
      isEmailVerified: true,
      isMobileVerified: false,
      isKycVerified: false,
      isActive: false,
      accountType: 'personal',
      referralCode: 'MIKE001',
      lastLoginAt: new Date('2024-08-15'),
      address: '321 Elm Street',
      city: 'Houston',
      state: 'TX',
      country: 'United States',
      zipCode: '77001',
      userRoles: {
        create: {
          roleId: userRole.id,
        },
      },
    },
  });

  // Sarah Wilson - VIP User
  const sarahWilson = await prisma.user.create({
    data: {
      firstName: 'Sarah',
      lastName: 'Wilson',
      email: 'sarah.wilson@example.com',
      mobile: '+1234567893',
      password: hashedPassword,
      walletBalance: 45890.25,
      isEmailVerified: true,
      isMobileVerified: true,
      isKycVerified: true,
      accountType: 'business',
      referralCode: 'SARAH001',
      lastLoginAt: new Date('2024-08-23'),
      address: '567 Business Park',
      city: 'San Francisco',
      state: 'CA',
      country: 'United States',
      zipCode: '94101',
      userRoles: {
        create: {
          roleId: vipRole.id,
        },
      },
    },
  });

  // Create bank accounts for users
  await prisma.userBankAccount.create({
    data: {
      userId: johnDoe.id,
      accountName: 'John Doe',
      accountNumber: '****1234',
      bankName: 'Chase Bank',
      bankCode: 'CHASE',
      routingNumber: '021000021',
      isDefault: true,
      isVerified: true,
    },
  });

  await prisma.userBankAccount.create({
    data: {
      userId: sarahWilson.id,
      accountName: 'Sarah Wilson Business',
      accountNumber: '****5678',
      bankName: 'Bank of America',
      bankCode: 'BOA',
      routingNumber: '026009593',
      isDefault: true,
      isVerified: true,
    },
  });

  // Create cards for users
  await prisma.userCard.create({
    data: {
      userId: johnDoe.id,
      cardType: 'visa',
      cardNumber: '****1234',
      cardholderName: 'John Doe',
      expiryMonth: 12,
      expiryYear: 2026,
      isDefault: true,
    },
  });

  await prisma.userCard.create({
    data: {
      userId: sarahWilson.id,
      cardType: 'mastercard',
      cardNumber: '****5678',
      cardholderName: 'Sarah Wilson',
      expiryMonth: 6,
      expiryYear: 2025,
      isDefault: true,
    },
  });

  // Create transactions from frontend mock data
  const transactions = [
    {
      transactionId: `TXN-${uniqid.time().toUpperCase()}`,
      senderId: null,
      receiverId: sarahWilson.id,
      type: 'add_money',
      amount: 5000.00,
      currency: 'USD',
      status: 'completed',
      paymentMethod: 'bank',
      description: 'Salary payment - August 2024',
      processedAt: new Date('2024-08-23T14:30:00'),
    },
    {
      transactionId: `TXN-${uniqid.time().toUpperCase()}`,
      senderId: johnDoe.id,
      receiverId: null,
      type: 'withdrawal',
      amount: 1200.00,
      currency: 'USD',
      status: 'completed',
      paymentMethod: 'bank',
      description: 'Rent payment',
      processedAt: new Date('2024-08-23T10:15:00'),
    },
    {
      transactionId: `TXN-${uniqid.time().toUpperCase()}`,
      senderId: johnDoe.id,
      receiverId: janeSmith.id,
      type: 'send',
      amount: 500.00,
      currency: 'USD',
      status: 'pending',
      paymentMethod: 'wallet',
      description: 'Transfer to savings',
      processedAt: null,
    },
    {
      transactionId: `TXN-${uniqid.time().toUpperCase()}`,
      senderId: janeSmith.id,
      receiverId: null,
      type: 'payment_request',
      amount: 89.99,
      currency: 'USD',
      status: 'completed',
      paymentMethod: 'card',
      description: 'Netflix subscription',
      processedAt: new Date('2024-08-22T18:20:00'),
    },
    {
      transactionId: `TXN-${uniqid.time().toUpperCase()}`,
      senderId: null,
      receiverId: sarahWilson.id,
      type: 'add_money',
      amount: 2500.00,
      currency: 'USD',
      status: 'completed',
      paymentMethod: 'card',
      description: 'Freelance project payment',
      processedAt: new Date('2024-08-22T15:00:00'),
    },
    {
      transactionId: `TXN-${uniqid.time().toUpperCase()}`,
      senderId: mikeJohnson.id,
      receiverId: johnDoe.id,
      type: 'send',
      amount: 750.00,
      currency: 'USD',
      status: 'pending',
      paymentMethod: 'wallet',
      description: 'Utility bill payment',
      processedAt: null,
    },
    {
      transactionId: `TXN-${uniqid.time().toUpperCase()}`,
      senderId: sarahWilson.id,
      receiverId: janeSmith.id,
      type: 'send',
      amount: 350.00,
      currency: 'USD',
      status: 'failed',
      paymentMethod: 'wallet',
      description: 'Insurance payment',
      failureReason: 'Insufficient balance',
      processedAt: null,
    },
    {
      transactionId: `TXN-${uniqid.time().toUpperCase()}`,
      senderId: adminUser.id,
      receiverId: johnDoe.id,
      type: 'send',
      amount: 1000.00,
      currency: 'USD',
      status: 'completed',
      paymentMethod: 'wallet',
      description: 'Bonus payment',
      processedAt: new Date('2024-08-20T12:00:00'),
    },
  ];

  for (const transaction of transactions) {
    await prisma.transaction.create({
      data: transaction,
    });
  }

  // Create notifications
  const notifications = [
    {
      userId: johnDoe.id,
      title: 'Payment Received',
      message: 'You have received $1000.00 from Admin User',
      type: 'transaction',
      data: { transactionId: transactions[7].transactionId, amount: 1000.00 },
      isRead: false,
    },
    {
      userId: janeSmith.id,
      title: 'Payment Request',
      message: 'You have a pending payment request from Sarah Wilson',
      type: 'payment_request',
      data: { amount: 350.00, requesterId: sarahWilson.id },
      isRead: false,
    },
    {
      userId: sarahWilson.id,
      title: 'KYC Verified',
      message: 'Your KYC verification has been approved',
      type: 'kyc',
      data: { status: 'approved' },
      isRead: true,
      readAt: new Date('2024-08-20'),
    },
    {
      userId: mikeJohnson.id,
      title: 'Account Inactive',
      message: 'Your account has been marked as inactive due to inactivity',
      type: 'general',
      data: { reason: 'inactivity' },
      isRead: false,
    },
  ];

  for (const notification of notifications) {
    await prisma.notification.create({
      data: notification,
    });
  }

  // Create activity logs
  const activityLogs = [
    {
      userId: johnDoe.id,
      action: 'login',
      description: 'User logged in successfully',
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0',
      metadata: { location: 'Los Angeles, CA' },
    },
    {
      userId: sarahWilson.id,
      action: 'transaction_sent',
      description: 'Sent $350.00 to Jane Smith',
      ipAddress: '192.168.1.2',
      userAgent: 'Mozilla/5.0',
      metadata: { transactionId: transactions[6].transactionId },
    },
    {
      userId: janeSmith.id,
      action: 'profile_updated',
      description: 'Updated profile information',
      ipAddress: '192.168.1.3',
      userAgent: 'Mozilla/5.0',
      metadata: { fields: ['address', 'phone'] },
    },
  ];

  for (const log of activityLogs) {
    await prisma.activityLog.create({
      data: log,
    });
  }

  console.log('Database seed completed successfully!');
  console.log(`
    Created:
    - ${await prisma.user.count()} users
    - ${await prisma.transaction.count()} transactions
    - ${await prisma.userBankAccount.count()} bank accounts
    - ${await prisma.userCard.count()} cards
    - ${await prisma.notification.count()} notifications
    - ${await prisma.activityLog.count()} activity logs
    
    Test Accounts:
    - Admin: admin@monay.com / Password123!
    - Premium User: john.doe@example.com / Password123!
    - Regular User: jane.smith@example.com / Password123!
    - VIP User: sarah.wilson@example.com / Password123!
  `);
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });