import bcryptjs from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function setupAliUserWithData() {
  try {
    // Hash the password
    const hashedPassword = await bcryptjs.hash('Demo@123', 10);
    
    // Create or update Ali's user account
    const user = await prisma.users.upsert({
      where: { email: 'ali@monay.com' },
      update: {
        mobile: '+13016821633',
        password: hashedPassword,
        firstName: 'Ali',
        lastName: 'Saberi',
        isEmailVerified: true,
        isMobileVerified: true,
        isKycVerified: true,
        isActive: true,
        isBlocked: false,
        isDeleted: false,
        walletBalance: 7860,
      },
      create: {
        id: 'ali-' + Date.now(),
        email: 'ali@monay.com',
        mobile: '+13016821633',
        password: hashedPassword,
        firstName: 'Ali',
        lastName: 'Saberi',
        walletBalance: 7860,
        isEmailVerified: true,
        isMobileVerified: true,
        isKycVerified: true,
        isActive: true,
        isBlocked: false,
        isDeleted: false,
        accountType: 'personal',
        role: 'user',
      },
    });
    
    console.log('User created/updated successfully:');
    console.log('================================');
    console.log('Email: ali@monay.com');
    console.log('Phone: +1 (301) 682-1633');
    console.log('Password: Demo@123');
    console.log('User ID:', user.id);
    console.log('Wallet Balance: $7,860');
    console.log('================================\n');

    // Create virtual cards for Ali
    const cards = await Promise.all([
      prisma.virtualCards.upsert({
        where: { id: user.id + '-card-1' },
        update: {},
        create: {
          id: user.id + '-card-1',
          userId: user.id,
          cardNumber: '4532************7891',
          cardHolderName: 'ALI SABERI',
          expiryDate: '12/26',
          cvv: '***',
          cardType: 'visa',
          cardStatus: 'active',
          spendingLimit: 5000,
          currentBalance: 3250,
          isActive: true,
          cardName: 'Primary Card',
          cardColor: '#8B5CF6',
        },
      }),
      prisma.virtualCards.upsert({
        where: { id: user.id + '-card-2' },
        update: {},
        create: {
          id: user.id + '-card-2',
          userId: user.id,
          cardNumber: '5412************3456',
          cardHolderName: 'ALI SABERI',
          expiryDate: '08/25',
          cvv: '***',
          cardType: 'mastercard',
          cardStatus: 'active',
          spendingLimit: 3000,
          currentBalance: 1750,
          isActive: true,
          cardName: 'Shopping Card',
          cardColor: '#EC4899',
        },
      }),
      prisma.virtualCards.upsert({
        where: { id: user.id + '-card-3' },
        update: {},
        create: {
          id: user.id + '-card-3',
          userId: user.id,
          cardNumber: '3782************0005',
          cardHolderName: 'ALI SABERI',
          expiryDate: '03/27',
          cvv: '****',
          cardType: 'amex',
          cardStatus: 'inactive',
          spendingLimit: 10000,
          currentBalance: 0,
          isActive: false,
          cardName: 'Travel Card',
          cardColor: '#3B82F6',
        },
      }),
    ]);
    
    console.log(`Created ${cards.length} virtual cards\n`);

    // Create transactions for Ali
    const now = new Date();
    const transactions = [];
    
    // Generate transactions for the past 30 days
    const transactionData = [
      { amount: -125.50, description: 'Whole Foods Market', category: 'Groceries', merchantName: 'Whole Foods', date: -1 },
      { amount: -45.00, description: 'Shell Gas Station', category: 'Transport', merchantName: 'Shell', date: -2 },
      { amount: -89.99, description: 'Amazon Purchase', category: 'Shopping', merchantName: 'Amazon', date: -3 },
      { amount: 2500.00, description: 'Salary Deposit', category: 'Income', merchantName: 'Employer Inc', date: -4 },
      { amount: -15.99, description: 'Netflix Subscription', category: 'Entertainment', merchantName: 'Netflix', date: -5 },
      { amount: -250.00, description: 'Electric Bill', category: 'Bills & Utilities', merchantName: 'BGE', date: -6 },
      { amount: -65.50, description: 'Target Store', category: 'Shopping', merchantName: 'Target', date: -7 },
      { amount: -35.00, description: 'Chipotle Mexican Grill', category: 'Food & Dining', merchantName: 'Chipotle', date: -8 },
      { amount: -120.00, description: 'Verizon Wireless', category: 'Bills & Utilities', merchantName: 'Verizon', date: -9 },
      { amount: -75.00, description: 'CVS Pharmacy', category: 'Health & Fitness', merchantName: 'CVS', date: -10 },
      { amount: -42.50, description: 'Starbucks', category: 'Food & Dining', merchantName: 'Starbucks', date: -11 },
      { amount: -180.00, description: 'Best Buy', category: 'Electronics', merchantName: 'Best Buy', date: -12 },
      { amount: 500.00, description: 'Transfer from Savings', category: 'Income', merchantName: 'Self Transfer', date: -13 },
      { amount: -95.00, description: 'Safeway', category: 'Groceries', merchantName: 'Safeway', date: -14 },
      { amount: -55.00, description: 'Uber Rides', category: 'Transport', merchantName: 'Uber', date: -15 },
      { amount: -450.00, description: 'Flight to NYC', category: 'Travel', merchantName: 'United Airlines', date: -16 },
      { amount: -28.99, description: 'Spotify Premium', category: 'Entertainment', merchantName: 'Spotify', date: -17 },
      { amount: -110.00, description: 'Restaurant Week', category: 'Food & Dining', merchantName: 'The Capital Grille', date: -18 },
      { amount: -200.00, description: 'Hotel Booking', category: 'Travel', merchantName: 'Marriott', date: -19 },
      { amount: -80.00, description: 'Gym Membership', category: 'Health & Fitness', merchantName: 'LA Fitness', date: -20 },
      { amount: -156.75, description: 'Costco Wholesale', category: 'Groceries', merchantName: 'Costco', date: -21 },
      { amount: -38.50, description: 'Gas Station', category: 'Transport', merchantName: 'Exxon', date: -22 },
      { amount: 1500.00, description: 'Freelance Payment', category: 'Income', merchantName: 'Client ABC', date: -23 },
      { amount: -67.00, description: 'Apple Store', category: 'Electronics', merchantName: 'Apple', date: -24 },
      { amount: -92.00, description: 'Water Bill', category: 'Bills & Utilities', merchantName: 'Water Dept', date: -25 },
      { amount: -125.00, description: 'Car Insurance', category: 'Bills & Utilities', merchantName: 'GEICO', date: -26 },
      { amount: -45.99, description: 'DoorDash', category: 'Food & Dining', merchantName: 'DoorDash', date: -27 },
      { amount: -310.00, description: 'Nike Store', category: 'Shopping', merchantName: 'Nike', date: -28 },
      { amount: -85.00, description: 'Trader Joe\'s', category: 'Groceries', merchantName: 'Trader Joe\'s', date: -29 },
      { amount: -22.00, description: 'Movie Theater', category: 'Entertainment', merchantName: 'AMC Theaters', date: -30 },
    ];

    for (const txData of transactionData) {
      const txDate = new Date(now);
      txDate.setDate(txDate.getDate() + txData.date);
      
      const transaction = await prisma.transactions.create({
        data: {
          id: `tx-${user.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          userId: user.id,
          amount: txData.amount,
          transactionType: txData.amount > 0 ? 'credit' : 'debit',
          description: txData.description,
          category: txData.category,
          status: 'completed',
          merchantName: txData.merchantName,
          referenceNumber: `REF${Date.now()}${Math.floor(Math.random() * 1000)}`,
          balanceAfter: 7860 + txData.amount,
          createdAt: txDate,
          updatedAt: txDate,
        },
      });
      transactions.push(transaction);
    }
    
    console.log(`Created ${transactions.length} transactions\n`);

    // Create some contacts/beneficiaries for Ali
    const contacts = await Promise.all([
      prisma.userContacts.upsert({
        where: { id: user.id + '-contact-1' },
        update: {},
        create: {
          id: user.id + '-contact-1',
          userId: user.id,
          contactName: 'John Doe',
          contactEmail: 'john.doe@example.com',
          contactPhone: '+14155551234',
          contactType: 'friend',
          isFavorite: true,
        },
      }),
      prisma.userContacts.upsert({
        where: { id: user.id + '-contact-2' },
        update: {},
        create: {
          id: user.id + '-contact-2',
          userId: user.id,
          contactName: 'Sarah Smith',
          contactEmail: 'sarah.smith@example.com',
          contactPhone: '+13105559876',
          contactType: 'family',
          isFavorite: true,
        },
      }),
      prisma.userContacts.upsert({
        where: { id: user.id + '-contact-3' },
        update: {},
        create: {
          id: user.id + '-contact-3',
          userId: user.id,
          contactName: 'Mike Johnson',
          contactEmail: 'mike.j@example.com',
          contactPhone: '+12025554321',
          contactType: 'business',
          isFavorite: false,
        },
      }),
    ]);
    
    console.log(`Created ${contacts.length} contacts\n`);

    // Create notifications for Ali
    const notifications = await Promise.all([
      prisma.notifications.create({
        data: {
          id: `notif-${user.id}-1`,
          userId: user.id,
          title: 'Payment Received',
          message: 'You received $2,500 from Employer Inc',
          type: 'transaction',
          isRead: false,
          createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        },
      }),
      prisma.notifications.create({
        data: {
          id: `notif-${user.id}-2`,
          userId: user.id,
          title: 'Card Transaction',
          message: 'Your Primary Card was used at Amazon for $89.99',
          type: 'card_activity',
          isRead: true,
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        },
      }),
      prisma.notifications.create({
        data: {
          id: `notif-${user.id}-3`,
          userId: user.id,
          title: 'Security Alert',
          message: 'New device login detected from iPhone 15 Pro',
          type: 'security',
          isRead: false,
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        },
      }),
    ]);
    
    console.log(`Created ${notifications.length} notifications\n`);

    console.log('================================');
    console.log('Setup Complete!');
    console.log('================================');
    console.log('User can now login with:');
    console.log('Email: ali@monay.com');
    console.log('Phone: +1 (301) 682-1633');
    console.log('Password: Demo@123');
    console.log('================================');
    
  } catch (error) {
    console.error('Error setting up user with data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupAliUserWithData();