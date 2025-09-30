import pg from 'pg';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from backend
dotenv.config({ path: join(__dirname, '../../monay-backend-common/.env') });

const { Client } = pg;

// Database connection
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'monay',
  user: process.env.DB_USER || 'alisaberi',
  password: process.env.DB_PASS || process.env.DB_PASSWORD || ''
};

async function setupTestData() {
  const client = new Client(dbConfig);

  try {
    await client.connect();
    console.log('Connected to database');

    // Create admin user if not exists (using the correct credentials)
    const hashedPassword = await bcrypt.hash('Admin@Monay2025!', 10);
    const hashedMpin = await bcrypt.hash('123456', 10);

    await client.query(`
      INSERT INTO users (
        email,
        username,
        password,
        first_name,
        last_name,
        mobile,
        mpin,
        user_type,
        is_email_verified,
        is_mobile_verified,
        is_kyc_verified,
        created_at,
        updated_at
      )
      VALUES (
        'admin@monay.com',
        'admin',
        $1,
        'Admin',
        'User',
        '+13016821633',
        $2,
        'admin',
        true,
        true,
        true,
        NOW(),
        NOW()
      )
      ON CONFLICT (email) DO UPDATE SET
        password = $1,
        mpin = $2,
        updated_at = NOW()
      RETURNING id, email
    `, [hashedPassword, hashedMpin]);

    console.log('✓ Admin user created/updated (admin@monay.com)');

    // Create test organization template
    await client.query(`
      INSERT INTO organizations (
        name,
        email,
        phone,
        address,
        city,
        state,
        zip,
        type,
        status,
        created_at,
        updated_at
      )
      VALUES (
        'E2E Test Template Org',
        'e2e-template@monay.com',
        '+15550000000',
        '123 Template Street',
        'Test City',
        'CA',
        '90001',
        'enterprise',
        'active',
        NOW(),
        NOW()
      )
      ON CONFLICT (email) DO NOTHING
    `);

    console.log('✓ Test organization template created');

    // Create test wallets for quick testing
    await client.query(`
      INSERT INTO wallets (
        user_id,
        wallet_type,
        balance,
        currency,
        status,
        created_at,
        updated_at
      )
      SELECT
        u.id,
        'consumer',
        0,
        'USD',
        'active',
        NOW(),
        NOW()
      FROM users u
      WHERE u.email = 'admin@monay.com'
      AND NOT EXISTS (
        SELECT 1 FROM wallets w
        WHERE w.user_id = u.id AND w.wallet_type = 'consumer'
      )
    `);

    console.log('✓ Test wallets created');

    // Create payment methods for testing
    await client.query(`
      INSERT INTO payment_methods (
        user_id,
        type,
        provider,
        last_four,
        is_default,
        status,
        created_at,
        updated_at
      )
      SELECT
        u.id,
        'card',
        'stripe',
        '4242',
        true,
        'active',
        NOW(),
        NOW()
      FROM users u
      WHERE u.email = 'admin@monay.com'
      AND NOT EXISTS (
        SELECT 1 FROM payment_methods pm
        WHERE pm.user_id = u.id AND pm.type = 'card'
      )
    `);

    console.log('✓ Test payment methods created');

    // Setup Tempo configuration
    await client.query(`
      INSERT INTO payment_providers (
        name,
        type,
        api_url,
        is_active,
        supports_instant,
        fee_percentage,
        fixed_fee,
        created_at,
        updated_at
      )
      VALUES (
        'Tempo',
        'instant_payment',
        'https://api.tempo.com/v1',
        true,
        true,
        0.5,
        0.25,
        NOW(),
        NOW()
      )
      ON CONFLICT (name) DO UPDATE SET
        is_active = true,
        updated_at = NOW()
    `);

    console.log('✓ Tempo payment provider configured');

    console.log('\n✅ Test data setup completed successfully!');
    console.log('\nAdmin credentials for Monay-Admin:');
    console.log('  Email: admin@monay.com');
    console.log('  Password: Admin@Monay2025!');
    console.log('  MPIN: 123456');
    console.log('\nYou can now run the E2E tests with:');
    console.log('  npm run test:invoice-flow');

  } catch (error) {
    console.error('Error setting up test data:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Run setup
setupTestData();