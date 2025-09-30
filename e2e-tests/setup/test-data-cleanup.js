import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../../monay-backend-common/.env') });

const { Client } = pg;

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'monay',
  user: process.env.DB_USER || 'alisaberi',
  password: process.env.DB_PASS || process.env.DB_PASSWORD || ''
};

async function cleanupTestData() {
  const client = new Client(dbConfig);

  try {
    await client.connect();
    console.log('Connected to database for cleanup');

    // Clean up test transactions (keep recent for audit)
    await client.query(`
      DELETE FROM transactions
      WHERE created_at < NOW() - INTERVAL '7 days'
      AND (
        description LIKE '%E2E Test%'
        OR description LIKE '%Test Invoice%'
      )
    `);
    console.log('✓ Old test transactions cleaned');

    // Clean up test invoices
    await client.query(`
      DELETE FROM invoices
      WHERE created_at < NOW() - INTERVAL '7 days'
      AND description LIKE '%Test Invoice%'
    `);
    console.log('✓ Old test invoices cleaned');

    // Clean up test organizations (except template)
    await client.query(`
      DELETE FROM organizations
      WHERE created_at < NOW() - INTERVAL '7 days'
      AND name LIKE 'TestOrg_%'
    `);
    console.log('✓ Old test organizations cleaned');

    // Clean up test users (except super admin)
    await client.query(`
      DELETE FROM users
      WHERE created_at < NOW() - INTERVAL '7 days'
      AND email LIKE '%_test_%@example.com'
      AND user_type != 'super_admin'
    `);
    console.log('✓ Old test users cleaned');

    // Optimize database
    await client.query('VACUUM ANALYZE');
    console.log('✓ Database optimized');

    console.log('\n✅ Test data cleanup completed successfully!');

  } catch (error) {
    console.error('Error cleaning up test data:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Run cleanup
cleanupTestData();