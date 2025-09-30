#!/usr/bin/env node

import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import pg from 'pg';

const { Client } = pg;

// Load environment variables
dotenv.config();

async function setupAdminUser() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USERNAME || 'alisaberi',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'monay'
  });

  try {
    console.log('🔄 Connecting to database...');
    await client.connect();
    console.log('✅ Database connected successfully');

    const adminEmail = 'admin@monay.com';

    // Check if admin user already exists
    console.log(`🔍 Checking if ${adminEmail} already exists...`);
    const checkResult = await client.query(
      'SELECT id FROM users WHERE email = $1',
      [adminEmail]
    );

    // Generate secure values
    const plainPassword = 'Admin@Monay2025!'; // Strong password
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    const mpin = '123456'; // 6-digit MPIN
    const hashedMpin = await bcrypt.hash(mpin, 10);
    const userId = checkResult.rows.length > 0 ? checkResult.rows[0].id : uuidv4();

    if (checkResult.rows.length > 0) {
      console.log(`📝 Updating existing admin user: ${adminEmail}`);

      await client.query(`
        UPDATE users
        SET
          first_name = $1,
          last_name = $2,
          phone = $3,
          password_hash = $4,
          mpin = $5,
          profile_image = $6,
          date_of_birth = $7,
          is_verified = $8,
          is_active = $9,
          kyc_verified = $10,
          user_type = $11,
          consumer_kyc_level = $12,
          consumer_daily_limit = $13,
          consumer_monthly_limit = $14,
          require_mfa = $15,
          last_login = $16,
          updated_at = $17,
          preferred_provider = $18
        WHERE email = $19
      `, [
        'Admin', // first_name
        'Monay', // last_name
        '+12025551234', // phone
        hashedPassword, // password_hash
        hashedMpin, // mpin
        'https://ui-avatars.com/api/?name=Admin+Monay&background=0D8ABC&color=fff', // profile_image
        '1990-01-01', // date_of_birth
        true, // is_verified
        true, // is_active
        true, // kyc_verified
        'superadmin', // user_type
        3, // consumer_kyc_level (highest)
        1000000.00, // consumer_daily_limit
        10000000.00, // consumer_monthly_limit
        false, // require_mfa
        new Date(), // last_login
        new Date(), // updated_at
        'tempo', // preferred_provider
        adminEmail // email (WHERE clause)
      ]);

    } else {
      console.log(`✨ Creating new admin user: ${adminEmail}`);

      await client.query(`
        INSERT INTO users (
          id,
          email,
          first_name,
          last_name,
          phone,
          password_hash,
          mpin,
          profile_image,
          date_of_birth,
          is_verified,
          is_active,
          kyc_verified,
          user_type,
          consumer_kyc_level,
          consumer_daily_limit,
          consumer_monthly_limit,
          require_mfa,
          last_login,
          created_at,
          updated_at,
          preferred_provider
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
      `, [
        userId, // id
        adminEmail, // email
        'Admin', // first_name
        'Monay', // last_name
        '+12025551234', // phone
        hashedPassword, // password_hash
        hashedMpin, // mpin
        'https://ui-avatars.com/api/?name=Admin+Monay&background=0D8ABC&color=fff', // profile_image
        '1990-01-01', // date_of_birth
        true, // is_verified
        true, // is_active
        true, // kyc_verified
        'superadmin', // user_type
        3, // consumer_kyc_level (highest)
        1000000.00, // consumer_daily_limit
        10000000.00, // consumer_monthly_limit
        false, // require_mfa
        new Date(), // last_login
        new Date(), // created_at
        new Date(), // updated_at
        'tempo' // preferred_provider
      ]);
    }

    // Fetch the updated user to display details
    const userResult = await client.query(
      'SELECT * FROM users WHERE email = $1',
      [adminEmail]
    );

    const user = userResult.rows[0];

    console.log('\n' + '='.repeat(80));
    console.log('✅ ADMIN USER SETUP COMPLETE');
    console.log('='.repeat(80));
    console.log('\n📋 Admin User Details:');
    console.log('------------------------');
    console.log(`🆔 User ID: ${user.id}`);
    console.log(`📧 Email: ${adminEmail}`);
    console.log(`🔑 Password: ${plainPassword}`);
    console.log(`📱 MPIN: ${mpin}`);
    console.log(`👤 Name: ${user.first_name} ${user.last_name}`);
    console.log(`📞 Phone: ${user.phone}`);
    console.log(`🎂 Date of Birth: ${user.date_of_birth ? new Date(user.date_of_birth).toLocaleDateString() : 'N/A'}`);
    console.log(`✅ KYC Verified: ${user.kyc_verified ? 'Yes' : 'No'}`);
    console.log(`💳 User Type: ${user.user_type}`);
    console.log(`💰 Wallet Balance: $${parseFloat(user.walletbalance || 0).toLocaleString()}`);
    console.log(`📊 KYC Level: ${user.consumer_kyc_level}`);
    console.log(`📈 Daily Limit: $${parseFloat(user.consumer_daily_limit || 0).toLocaleString()}`);
    console.log(`📉 Monthly Limit: $${parseFloat(user.consumer_monthly_limit || 0).toLocaleString()}`);
    console.log(`🔒 Account Status: ${user.is_active ? 'Active' : 'Inactive'}`);
    console.log(`✉️ Email Verified: ${user.is_verified ? 'Yes' : 'No'}`);
    console.log(`🔐 2FA Enabled: ${user.require_mfa ? 'Yes' : 'No'}`);
    console.log(`🏪 Preferred Provider: ${user.preferred_provider}`);

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

    await client.end();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error setting up admin user:', error.message);
    console.error('Full error:', error);
    await client.end();
    process.exit(1);
  }
}

// Run the setup
setupAdminUser();