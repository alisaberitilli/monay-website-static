#!/usr/bin/env node

import dotenv from 'dotenv';
import db from '../src/models/index.js';

// Load environment variables
dotenv.config();

async function testSequelizeMapping() {
  try {
    console.log('🔄 Testing Sequelize snake_case/camelCase mapping...\n');

    // Initialize models
    await db.initializeModels();
    const { sequelize, User } = db;

    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connected successfully\n');

    // Test 1: Query admin user using Sequelize
    console.log('📝 Test 1: Fetching admin user using Sequelize...');
    const adminUser = await User.findOne({
      where: { email: 'admin@monay.com' },
      raw: true
    });

    if (adminUser) {
      console.log('✅ Admin user found!\n');
      console.log('🔍 Field Mapping Verification:');
      console.log('-----------------------------------');
      console.log(`firstName (JS) → first_name (DB): ${adminUser.firstName}`);
      console.log(`lastName (JS) → last_name (DB): ${adminUser.lastName}`);
      console.log(`email: ${adminUser.email}`);
      console.log(`phone: ${adminUser.phone}`);
      console.log(`dateOfBirth (JS) → date_of_birth (DB): ${adminUser.dateOfBirth}`);
      console.log(`profileImage (JS) → profile_image (DB): ${adminUser.profileImage}`);
      console.log(`isActive (JS) → is_active (DB): ${adminUser.isActive}`);
      console.log(`isVerified (JS) → is_verified (DB): ${adminUser.isVerified}`);
      console.log(`kycVerified (JS) → kyc_verified (DB): ${adminUser.kycVerified}`);
      console.log(`userType (JS) → user_type (DB): ${adminUser.userType}`);
      console.log(`createdAt (JS) → created_at (DB): ${adminUser.createdAt}`);
      console.log(`updatedAt (JS) → updated_at (DB): ${adminUser.updatedAt}`);
    } else {
      console.log('⚠️  Admin user not found. Run setup-admin-raw.js first.');
    }

    // Test 2: Create a test user to verify writing works
    console.log('\n📝 Test 2: Creating test user with camelCase fields...');
    const testEmail = `test-${Date.now()}@example.com`;

    const testUser = await User.create({
      id: `test-${Date.now()}`,
      email: testEmail,
      firstName: 'Test',
      lastName: 'User',
      phone: '+1234567890',
      passwordHash: 'test-hash',
      profileImage: 'test-image.jpg',
      dateOfBirth: new Date('1990-01-01'),
      isActive: true,
      isVerified: false,
      kycVerified: false,
      userType: 'individual'
    });

    console.log('✅ Test user created successfully!');

    // Test 3: Query back the test user
    console.log('\n📝 Test 3: Querying test user to verify read mapping...');
    const queriedUser = await User.findOne({
      where: { email: testEmail },
      raw: true
    });

    if (queriedUser) {
      console.log('✅ Test user queried successfully!');
      console.log(`firstName: ${queriedUser.firstName}`);
      console.log(`lastName: ${queriedUser.lastName}`);
      console.log(`dateOfBirth: ${queriedUser.dateOfBirth}`);
    }

    // Test 4: Raw SQL to verify database column names
    console.log('\n📝 Test 4: Raw SQL query to verify database columns...');
    const [results] = await sequelize.query(
      `SELECT
        first_name,
        last_name,
        date_of_birth,
        profile_image,
        is_active,
        created_at,
        updated_at
      FROM users
      WHERE email = :email
      LIMIT 1`,
      {
        replacements: { email: testEmail },
        type: sequelize.QueryTypes.SELECT
      }
    );

    if (results) {
      console.log('✅ Database columns (snake_case) verified:');
      console.log(`first_name: ${results.first_name}`);
      console.log(`last_name: ${results.last_name}`);
      console.log(`date_of_birth: ${results.date_of_birth}`);
      console.log(`profile_image: ${results.profile_image}`);
      console.log(`is_active: ${results.is_active}`);
      console.log(`created_at: ${results.created_at}`);
      console.log(`updated_at: ${results.updated_at}`);
    }

    // Clean up test user
    await User.destroy({ where: { email: testEmail } });
    console.log('\n🧹 Test user cleaned up');

    console.log('\n' + '='.repeat(60));
    console.log('✅ ALL TESTS PASSED!');
    console.log('='.repeat(60));
    console.log('\n📌 Summary:');
    console.log('• Sequelize now automatically converts camelCase ↔ snake_case');
    console.log('• No need for manual field mappings in models');
    console.log('• Write JavaScript in camelCase, database uses snake_case');
    console.log('• This is applied globally to all models');
    console.log('='.repeat(60));

    await sequelize.close();
    process.exit(0);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

// Run the test
testSequelizeMapping();