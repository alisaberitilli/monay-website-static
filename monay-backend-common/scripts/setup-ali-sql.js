import bcryptjs from 'bcryptjs';
import pkg from 'pg';
const { Client } = pkg;

async function setupAliUser() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'monay',
    user: 'alisaberi',
    password: ''
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL database');
    
    // Hash the password
    const hashedPassword = await bcryptjs.hash('Demo@123', 10);
    const userId = 'ali-' + Date.now();
    
    // First, clear the phone number from any other user
    await client.query(
      `UPDATE users SET mobile = NULL WHERE mobile = $1 AND email != $2`,
      ['+13016821633', 'ali@monay.com']
    );
    
    // Check if user exists
    const checkUser = await client.query(
      'SELECT id FROM users WHERE email = $1',
      ['ali@monay.com']
    );
    
    if (checkUser.rows.length > 0) {
      // Update existing user with verified_consumer role
      await client.query(
        `UPDATE users 
         SET mobile = $1, password = $2, "firstName" = $3, "lastName" = $4, 
             "walletBalance" = $5, "isEmailVerified" = true, "isMobileVerified" = true,
             "isKycVerified" = true, "isActive" = true, "isBlocked" = false, "isDeleted" = false,
             role = 'verified_consumer'
         WHERE email = $6`,
        ['+13016821633', hashedPassword, 'Ali', 'Saberi', 7860, 'ali@monay.com']
      );
      console.log('Updated existing user: ali@monay.com with verified_consumer role');
    } else {
      // Create new user with verified_consumer role
      await client.query(
        `INSERT INTO users (
          id, email, mobile, password, "firstName", "lastName", 
          "walletBalance", "isEmailVerified", "isMobileVerified", "isKycVerified",
          "isActive", "isBlocked", "isDeleted", "accountType", role, "createdAt", "updatedAt"
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`,
        [
          userId, 'ali@monay.com', '+13016821633', hashedPassword, 'Ali', 'Saberi',
          7860, true, true, true, true, false, false, 'personal', 'verified_consumer', new Date(), new Date()
        ]
      );
      console.log('Created new user: ali@monay.com with verified_consumer role');
    }
    
    // Get the user ID for creating related data
    const userResult = await client.query(
      'SELECT id FROM users WHERE email = $1',
      ['ali@monay.com']
    );
    const finalUserId = userResult.rows[0].id;
    
    // Create sample transactions
    console.log('\nCreating sample transactions...');
    const transactions = [
      { amount: 125.50, description: 'Whole Foods Market', type: 'payment', days: 1 },
      { amount: 45.00, description: 'Shell Gas Station', type: 'payment', days: 2 },
      { amount: 89.99, description: 'Amazon Purchase', type: 'payment', days: 3 },
      { amount: 2500.00, description: 'Salary Deposit', type: 'deposit', days: 4 },
      { amount: 15.99, description: 'Netflix Subscription', type: 'payment', days: 5 },
      { amount: 250.00, description: 'Electric Bill Payment', type: 'payment', days: 6 },
      { amount: 65.50, description: 'Target Store', type: 'payment', days: 7 },
      { amount: 35.00, description: 'Chipotle Mexican Grill', type: 'payment', days: 8 },
      { amount: 120.00, description: 'Verizon Wireless', type: 'payment', days: 9 },
      { amount: 75.00, description: 'CVS Pharmacy', type: 'payment', days: 10 },
    ];
    
    for (const tx of transactions) {
      const txId = 'tx-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
      const transactionId = 'TXN-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();
      const txDate = new Date();
      txDate.setDate(txDate.getDate() - tx.days);
      
      if (tx.type === 'payment') {
        // For payments, user is the sender
        await client.query(
          `INSERT INTO transactions (
            id, "transactionId", "senderId", type, amount, currency,
            status, description, "createdAt", "updatedAt"
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [
            txId, transactionId, finalUserId, tx.type, tx.amount, 'USD',
            'completed', tx.description, txDate, txDate
          ]
        );
      } else {
        // For deposits, user is the receiver
        await client.query(
          `INSERT INTO transactions (
            id, "transactionId", "receiverId", type, amount, currency,
            status, description, "createdAt", "updatedAt"
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [
            txId, transactionId, finalUserId, tx.type, tx.amount, 'USD',
            'completed', tx.description, txDate, txDate
          ]
        );
      }
    }
    console.log(`Created ${transactions.length} sample transactions`);
    
    console.log('\n================================');
    console.log('Setup Complete!');
    console.log('================================');
    console.log('User can now login with:');
    console.log('Email: ali@monay.com');
    console.log('Phone: +1 (301) 682-1633');
    console.log('Password: Demo@123');
    console.log('Wallet Balance: $7,860');
    console.log('================================');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

setupAliUser();