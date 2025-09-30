/**
 * Database Safety Module
 * CRITICAL: This module prevents accidental database drops and dangerous operations
 * Created: 2025-01-23
 * Purpose: Prevent database loss incidents like the one that occurred previously
 */

import readline from 'readline';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const AUDIT_LOG_PATH = path.join(__dirname, '../../logs/database-operations.log');

/**
 * List of dangerous operations that require confirmation
 */
const DANGEROUS_OPERATIONS = [
  'DROP DATABASE',
  'DROP TABLE',
  'DROP SCHEMA',
  'TRUNCATE',
  'DELETE FROM',
  'ALTER TABLE.*DROP',
  'sequelize.sync.*force.*true',
  'sync\\({.*force:\\s*true',
];

/**
 * Audit log for database operations
 */
class DatabaseAuditLogger {
  constructor() {
    this.ensureLogDirectory();
  }

  ensureLogDirectory() {
    const logDir = path.dirname(AUDIT_LOG_PATH);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  log(operation, user, confirmed, timestamp = new Date()) {
    const logEntry = {
      timestamp: timestamp.toISOString(),
      user: user || process.env.USER || 'unknown',
      operation,
      confirmed,
      environment: process.env.NODE_ENV,
      database: process.env.DB_NAME || 'monay',
      host: process.env.DB_HOST || 'localhost',
    };

    const logLine = JSON.stringify(logEntry) + '\n';

    try {
      fs.appendFileSync(AUDIT_LOG_PATH, logLine);
    } catch (error) {
      console.error('Failed to write to audit log:', error);
    }
  }
}

const auditLogger = new DatabaseAuditLogger();

/**
 * Check if an SQL query contains dangerous operations
 */
export function isDangerousQuery(query) {
  // Handle non-string queries (Sequelize sometimes passes objects)
  if (typeof query !== 'string') {
    return false;
  }

  const normalizedQuery = query.toUpperCase().replace(/\s+/g, ' ');

  for (const pattern of DANGEROUS_OPERATIONS) {
    const regex = new RegExp(pattern.toUpperCase(), 'i');
    if (regex.test(normalizedQuery)) {
      return true;
    }
  }

  return false;
}

/**
 * Prompt user for confirmation before executing dangerous operations
 */
export async function confirmDangerousOperation(operation, details = '') {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    console.log('\n' + chalk.red.bold('⚠️  DANGEROUS DATABASE OPERATION DETECTED ⚠️'));
    console.log(chalk.yellow('═'.repeat(60)));
    console.log(chalk.white('Operation: ') + chalk.red.bold(operation));
    if (details) {
      console.log(chalk.white('Details: ') + chalk.yellow(details));
    }
    console.log(chalk.white('Database: ') + chalk.cyan(process.env.DB_NAME || 'monay'));
    console.log(chalk.white('Environment: ') + chalk.cyan(process.env.NODE_ENV || 'development'));
    console.log(chalk.yellow('═'.repeat(60)));
    console.log(chalk.red.bold('THIS OPERATION MAY RESULT IN DATA LOSS!'));
    console.log();

    rl.question(chalk.yellow.bold('Type "YES I UNDERSTAND THE RISKS" to confirm, or anything else to cancel: '), (answer) => {
      const confirmed = answer === 'YES I UNDERSTAND THE RISKS';

      auditLogger.log(operation, process.env.USER, confirmed);

      if (confirmed) {
        console.log(chalk.yellow('⚠️  Operation confirmed. Proceeding with caution...'));
      } else {
        console.log(chalk.green('✓ Operation cancelled. Database is safe.'));
      }

      rl.close();
      resolve(confirmed);
    });
  });
}

/**
 * Safe database sync wrapper for Sequelize
 */
export async function safeDatabaseSync(sequelize, options = {}) {
  // Never allow force sync in production
  if (process.env.NODE_ENV === 'production' && options.force) {
    throw new Error('Force sync is not allowed in production environment!');
  }

  // Check if database has existing data
  try {
    const [results] = await sequelize.query(
      "SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = 'public'"
    );

    const tableCount = results[0]?.count || 0;

    if (tableCount > 0) {
      console.log(chalk.yellow(`Database has ${tableCount} existing tables.`));

      if (options.force) {
        const confirmed = await confirmDangerousOperation(
          'FORCE SYNC',
          `This will drop all ${tableCount} tables and recreate them. ALL DATA WILL BE LOST!`
        );

        if (!confirmed) {
          console.log(chalk.green('Sync cancelled. Using existing database schema.'));
          return false;
        }
      } else {
        console.log(chalk.green('Using alter mode to preserve existing data.'));
        options.alter = true;
        delete options.force;
      }
    }
  } catch (error) {
    console.error('Error checking existing tables:', error);
  }

  // Perform the sync
  console.log(chalk.blue('Starting database sync...'));
  await sequelize.sync(options);
  console.log(chalk.green('Database sync completed successfully.'));

  return true;
}

/**
 * Middleware to intercept dangerous Sequelize queries
 */
export function createSafetyMiddleware(sequelize) {
  const originalQuery = sequelize.query.bind(sequelize);

  sequelize.query = async function(sql, options) {
    // Check if query is dangerous
    if (isDangerousQuery(sql)) {
      const confirmed = await confirmDangerousOperation('RAW SQL QUERY', sql.substring(0, 200));

      if (!confirmed) {
        throw new Error('Dangerous query execution cancelled by user');
      }
    }

    // Execute original query
    return originalQuery(sql, options);
  };

  return sequelize;
}

/**
 * Check database health and integrity
 */
export async function checkDatabaseHealth(sequelize) {
  const health = {
    connected: false,
    tableCount: 0,
    criticalTables: [],
    missingTables: [],
    warnings: [],
  };

  const CRITICAL_TABLES = [
    'Users',
    'Transactions',
    'Wallets',
    'Cards',
    'UserTokens',
    'UserRoles',
    'Banks',
    'Accounts',
  ];

  try {
    // Test connection
    await sequelize.authenticate();
    health.connected = true;

    // Count tables
    const [tables] = await sequelize.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
    );

    health.tableCount = tables.length;

    // Check critical tables
    const existingTables = tables.map(t => t.table_name);

    for (const table of CRITICAL_TABLES) {
      if (existingTables.includes(table)) {
        health.criticalTables.push(table);
      } else {
        health.missingTables.push(table);
        health.warnings.push(`Critical table '${table}' is missing`);
      }
    }

    // Check if database might be empty or corrupted
    if (health.tableCount === 0) {
      health.warnings.push('DATABASE IS EMPTY - Immediate recovery required!');
    } else if (health.tableCount < 50) {
      health.warnings.push(`Only ${health.tableCount} tables found - expected 70+`);
    }

    if (health.missingTables.length > 0) {
      health.warnings.push('Some critical tables are missing');
    }

  } catch (error) {
    health.connected = false;
    health.warnings.push(`Database connection failed: ${error.message}`);
  }

  return health;
}

/**
 * Create backup before dangerous operations
 */
export async function createSafetyBackup(databaseName = 'monay') {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = path.join(__dirname, `../../backups/safety_backup_${databaseName}_${timestamp}.sql`);

  console.log(chalk.blue('Creating safety backup...'));

  try {
    // Ensure backup directory exists
    const backupDir = path.dirname(backupFile);
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // Create backup using pg_dump
    const { exec } = await import('child_process');
    const util = await import('util');
    const execPromise = util.promisify(exec);

    const command = `pg_dump -U ${process.env.DB_USER || 'alisaberi'} ${databaseName} > ${backupFile}`;
    await execPromise(command);

    console.log(chalk.green(`Safety backup created: ${backupFile}`));
    return backupFile;
  } catch (error) {
    console.error(chalk.red('Failed to create safety backup:'), error);
    throw error;
  }
}

export default {
  isDangerousQuery,
  confirmDangerousOperation,
  safeDatabaseSync,
  createSafetyMiddleware,
  checkDatabaseHealth,
  createSafetyBackup,
  auditLogger,
};