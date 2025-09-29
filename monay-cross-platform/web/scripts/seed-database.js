#!/usr/bin/env node

/**
 * Database Seeding Script for Monay
 * 
 * This script populates the PostgreSQL database with mock data
 * that's consistent across all Monay applications.
 * 
 * Usage:
 *   npm run seed:db
 *   or
 *   node scripts/seed-database.js
 */

import pg from 'pg';
const { Pool } = pg;
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Database configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function seedDatabase() {
  console.log('🌱 Starting database seeding...\n');
  
  try {
    // Check database connection
    await pool.query('SELECT NOW()');
    console.log('✅ Database connected successfully\n');
    
    // Read the SQL seed file
    const seedSQL = fs.readFileSync(
      path.join(__dirname, '../database/seed-data.sql'),
      'utf8'
    );
    
    console.log('📝 Executing seed data...\n');
    
    // Execute the seed SQL
    await pool.query(seedSQL);
    
    // Get summary statistics
    const stats = await getStats();
    
    console.log('📊 Database Statistics:');
    console.log('------------------------');
    console.log(`Users:           ${stats.users}`);
    console.log(`Wallets:         ${stats.wallets}`);
    console.log(`Transactions:    ${stats.transactions}`);
    console.log(`Cards:           ${stats.cards}`);
    console.log(`Payment Methods: ${stats.paymentMethods}`);
    console.log('------------------------\n');
    
    // Show sample users and balances
    const users = await pool.query(`
      SELECT u.name, u.email, w.balance, w.currency, u.kyc_status
      FROM users u
      JOIN wallets w ON u.id = w.user_id
      ORDER BY u.created_at
      LIMIT 5
    `);
    
    console.log('👥 Sample Users:');
    console.log('------------------------');
    users.rows.forEach(user => {
      console.log(`${user.name} (${user.email})`);
      console.log(`  Balance: $${user.balance} ${user.currency}`);
      console.log(`  KYC Status: ${user.kyc_status}`);
      console.log('');
    });
    
    console.log('✅ Database seeded successfully!');
    console.log('\n🔑 Login Credentials:');
    console.log('------------------------');
    console.log('Email: john.doe@example.com');
    console.log('Password: (any password works in development)');
    console.log('\n💡 Tip: The app is now using PostgreSQL.');
    console.log('All data will persist between sessions.');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    
    if (error.message.includes('does not exist')) {
      console.log('\n📌 Database might not exist. Create it first:');
      console.log('   createdb monay');
      console.log('   psql -d monay < database/schema.sql');
    } else if (error.message.includes('password authentication failed')) {
      console.log('\n📌 Check your database credentials in .env.local');
      console.log('   DATABASE_URL="postgresql://username:password@localhost:5432/monay"');
    }
    
    process.exit(1);
  } finally {
    await pool.end();
  }
}

async function getStats() {
  const queries = {
    users: 'SELECT COUNT(*) FROM users',
    wallets: 'SELECT COUNT(*) FROM wallets',
    transactions: 'SELECT COUNT(*) FROM transactions',
    cards: 'SELECT COUNT(*) FROM cards',
    paymentMethods: 'SELECT COUNT(*) FROM payment_methods'
  };
  
  const stats = {};
  
  for (const [key, query] of Object.entries(queries)) {
    try {
      const result = await pool.query(query);
      stats[key] = result.rows[0].count;
    } catch (error) {
      stats[key] = 0;
    }
  }
  
  return stats;
}

// Run the seeding
seedDatabase().catch(console.error);