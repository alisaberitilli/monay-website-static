#!/usr/bin/env node

import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import db from '../src/models/index.js';

// Load environment variables
dotenv.config();

async function setupAdminUser() {
  try {
    console.log('🔄 Initializing database connection...');

    // Initialize models
    await db.initializeModels();
    const { sequelize, User } = db;

    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');

    const adminEmail = 'admin@monay.com';

    // Check if admin user already exists
    console.log(`🔍 Checking if ${adminEmail} already exists...`);
    let adminUser = await User.findOne({ where: { email: adminEmail } });

    if (adminUser) {
      console.log(`📝 Updating existing admin user: ${adminEmail}`);
    } else {
      console.log(`✨ Creating new admin user: ${adminEmail}`);
      adminUser = User.build({ email: adminEmail });
    }

    // Generate secure values
    const plainPassword = 'Admin@Monay2025!'; // Strong password
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    const mpin = '123456'; // 6-digit MPIN
    const hashedMpin = await bcrypt.hash(mpin, 10);

    // Set all required and useful fields
    const adminData = {
      email: adminEmail,
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'Monay',
      phone: '+12025551234',
      avatar: 'https://ui-avatars.com/api/?name=Admin+Monay&background=0D8ABC&color=fff',
      kycStatus: 'approved',
      userType: 'superadmin',
      isActive: true,
      isEmailVerified: true,
      isPhoneVerified: true,
      isMpinSet: true,
      mpin: hashedMpin,
      mpinAttempts: 0,

      // Wallet addresses (will be generated if needed)
      walletAddress: adminUser.walletAddress || `0x${uuidv4().replace(/-/g, '').slice(0, 40)}`,
      solanaAddress: adminUser.solanaAddress || uuidv4().replace(/-/g, '').slice(0, 44),
      publicKey: adminUser.publicKey || uuidv4(),

      // Financial fields
      balance: '1000000.00', // $1M for testing
      dailyLimit: '1000000.00',
      monthlyLimit: '10000000.00',

      // Compliance fields
      kycLevel: 3, // Highest KYC level
      kycVerifiedAt: new Date(),

      // Security fields
      twoFactorEnabled: false, // Can be enabled later
      lastLoginAt: new Date(),

      // Additional fields
      country: 'US',
      state: 'NY',
      city: 'New York',
      zipCode: '10001',
      dateOfBirth: new Date('1990-01-01'),
      ssn: null, // Not storing for security
    };

    // Update or save the admin user
    Object.assign(adminUser, adminData);

    // Save without running hooks (to avoid password re-hashing)
    if (adminUser.id) {
      await User.update(adminData, {
        where: { id: adminUser.id },
        individualHooks: false
      });
    } else {
      await adminUser.save({ hooks: false });
    }

    console.log('\n' + '='.repeat(80));
    console.log('✅ ADMIN USER SETUP COMPLETE');
    console.log('='.repeat(80));
    console.log('\n📋 Admin User Details:');
    console.log('------------------------');
    console.log(`📧 Email: ${adminEmail}`);
    console.log(`🔑 Password: ${plainPassword}`);
    console.log(`📱 MPIN: ${mpin}`);
    console.log(`👤 Name: ${adminData.firstName} ${adminData.lastName}`);
    console.log(`📞 Phone: ${adminData.phone}`);
    console.log(`🌍 Location: ${adminData.city}, ${adminData.state} ${adminData.zipCode}`);
    console.log(`✅ KYC Status: ${adminData.kycStatus}`);
    console.log(`💳 User Type: ${adminData.userType}`);
    console.log(`💰 Balance: $${parseFloat(adminData.balance).toLocaleString()}`);
    console.log(`📊 Daily Limit: $${parseFloat(adminData.dailyLimit).toLocaleString()}`);
    console.log(`📈 Monthly Limit: $${parseFloat(adminData.monthlyLimit).toLocaleString()}`);
    console.log(`🔒 Account Status: Active`);
    console.log(`✉️ Email Verified: Yes`);
    console.log(`📱 Phone Verified: Yes`);
    console.log(`🔐 MPIN Set: Yes`);
    console.log('\n🔐 Blockchain Addresses:');
    console.log('------------------------');
    console.log(`⟠ EVM Wallet: ${adminData.walletAddress}`);
    console.log(`◎ Solana Wallet: ${adminData.solanaAddress}`);
    console.log(`🔑 Public Key: ${adminData.publicKey}`);

    console.log('\n⚠️  SECURITY NOTES:');
    console.log('------------------------');
    console.log('• This is a test/development admin account');
    console.log('• Change the password immediately in production');
    console.log('• Enable 2FA for additional security');
    console.log('• The password and MPIN are hashed in the database');
    console.log('• Never share these credentials');

    console.log('\n🚀 You can now login with:');
    console.log('------------------------');
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${plainPassword}`);
    console.log(`MPIN (for transactions): ${mpin}`);
    console.log('='.repeat(80));

    // Close database connection
    await sequelize.close();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error setting up admin user:', error);
    process.exit(1);
  }
}

// Run the setup
setupAdminUser();