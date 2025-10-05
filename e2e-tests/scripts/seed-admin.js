#!/usr/bin/env node

/**
 * Seed Script for Admin User
 * Uses environment variables for secure credential management
 */

import bcrypt from 'bcrypt';
import pg from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const { Client } = pg;

// Database configuration
const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'monay',
  user: process.env.DB_USER || 'alisaberi',
  password: process.env.DB_PASSWORD || '',
};

// Admin user configuration from environment variables
const ADMIN_USER = {
  email: process.env.ADMIN_EMAIL || 'admin@monay.com',
  password: process.env.ADMIN_PASSWORD || 'SecureAdmin123!@#',
  firstName: 'Admin',
  lastName: 'Monay',
  role: 'platform_admin',
};

async function seedAdmin() {
  const client = new Client(DB_CONFIG);

  try {
    console.log('🔗 Connecting to database...');
    await client.connect();
    console.log('✅ Connected to database');

    // Check if admin user exists
    console.log('\n🔍 Checking for existing admin user...');
    const checkQuery = `
      SELECT id, email, first_name, last_name, role
      FROM users
      WHERE email = $1
    `;
    const checkResult = await client.query(checkQuery, [ADMIN_USER.email]);

    if (checkResult.rows.length > 0) {
      console.log('ℹ️ Admin user already exists:');
      console.log(`   Email: ${checkResult.rows[0].email}`);
      console.log(`   Name: ${checkResult.rows[0].first_name} ${checkResult.rows[0].last_name}`);
      console.log(`   Role: ${checkResult.rows[0].role}`);

      // Update password to ensure it matches
      console.log('\n🔐 Updating admin password...');
      const hashedPassword = await bcrypt.hash(ADMIN_USER.password, 10);

      const updateQuery = `
        UPDATE users
        SET password_hash = $1,
            is_active = true,
            is_deleted = false,
            is_blocked = false,
            mobile_verified = true,
            kyc_verified = true,
            updated_at = NOW()
        WHERE email = $2
        RETURNING id
      `;

      await client.query(updateQuery, [hashedPassword, ADMIN_USER.email]);
      console.log('✅ Admin password updated successfully');
    } else {
      console.log('📝 Creating new admin user...');

      // Generate admin ID
      const adminId = `admin-${generateUUID()}`;
      const hashedPassword = await bcrypt.hash(ADMIN_USER.password, 10);

      const insertQuery = `
        INSERT INTO users (
          id,
          email,
          username,
          password_hash,
          first_name,
          last_name,
          mobile,
          user_type,
          is_active,
          is_deleted,
          is_blocked,
          mobile_verified,
          kyc_verified,
          wallet_balance,
          created_at,
          updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW()
        ) RETURNING id, email
      `;

      const insertValues = [
        adminId,
        ADMIN_USER.email,
        ADMIN_USER.email.split('@')[0],
        hashedPassword,
        ADMIN_USER.firstName,
        ADMIN_USER.lastName,
        '+12025551234',
        ADMIN_USER.role,
        true,  // is_active
        false, // is_deleted
        false, // is_blocked
        true,  // mobile_verified
        true,  // kyc_verified
        0      // wallet_balance
      ];

      const result = await client.query(insertQuery, insertValues);
      console.log('✅ Admin user created successfully');
      console.log(`   ID: ${result.rows[0].id}`);
      console.log(`   Email: ${result.rows[0].email}`);
    }

    // Verify login works
    console.log('\n🧪 Verifying admin credentials...');
    const verifyQuery = `
      SELECT id, email, password_hash
      FROM users
      WHERE email = $1
        AND is_active = true
        AND is_deleted = false
    `;
    const verifyResult = await client.query(verifyQuery, [ADMIN_USER.email]);

    if (verifyResult.rows.length > 0) {
      const isValid = await bcrypt.compare(ADMIN_USER.password, verifyResult.rows[0].password_hash);
      if (isValid) {
        console.log('✅ Password verification successful!');
      } else {
        console.error('❌ Password verification failed!');
        process.exit(1);
      }
    }

    // Display summary
    console.log('\n' + '='.repeat(50));
    console.log('🎉 ADMIN SEED COMPLETE');
    console.log('='.repeat(50));
    console.log(`Email: ${ADMIN_USER.email}`);
    console.log(`Password: ${ADMIN_USER.password}`);
    console.log(`Role: ${ADMIN_USER.role}`);
    console.log('='.repeat(50));

  } catch (error) {
    console.error('❌ Error seeding admin:', error);
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n👋 Database connection closed');
  }
}

// Helper function to generate UUID
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Run the seed script
seedAdmin().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});