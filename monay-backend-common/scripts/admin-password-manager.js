import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

class AdminPasswordManager {
  constructor() {
    this.sequelize = new Sequelize(
      process.env.DB_NAME || 'monay',
      process.env.DB_USERNAME || 'alisaberi',
      process.env.DB_PASSWORD || '',
      {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        dialect: 'postgres',
        logging: false
      }
    );
  }

  async connect() {
    try {
      await this.sequelize.authenticate();
      console.log('✅ Connected to database');
      return true;
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      return false;
    }
  }

  async disconnect() {
    await this.sequelize.close();
    console.log('🔌 Database connection closed');
  }

  async generateSecurePassword(length = 16) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';

    // Ensure at least one of each required character type
    password += chars.substring(0, 26).charAt(Math.floor(Math.random() * 26)); // Uppercase
    password += chars.substring(26, 52).charAt(Math.floor(Math.random() * 26)); // Lowercase
    password += chars.substring(52, 62).charAt(Math.floor(Math.random() * 10)); // Number
    password += chars.substring(62).charAt(Math.floor(Math.random() * 8)); // Special

    // Fill remaining length
    for (let i = 4; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }

  async hashPassword(password) {
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    return await bcrypt.hash(password, saltRounds);
  }

  async updateAdminPassword(email, newPassword, isHashed = false) {
    try {
      const passwordHash = isHashed ? newPassword : await this.hashPassword(newPassword);

      const [results] = await this.sequelize.query(`
        UPDATE users
        SET password = :password, updated_at = NOW()
        WHERE email = :email AND role IN ('platform_admin', 'compliance_officer', 'treasury_manager', 'support_agent')
        RETURNING id, email, first_name, last_name, role
      `, {
        replacements: { password: passwordHash, email },
        type: this.sequelize.QueryTypes.UPDATE
      });

      if (results.length > 0) {
        console.log('✅ Password updated successfully for:', results[0]);
        return { success: true, user: results[0] };
      } else {
        console.log('❌ Admin user not found or not authorized');
        return { success: false, error: 'User not found or not authorized' };
      }
    } catch (error) {
      console.error('❌ Error updating password:', error.message);
      return { success: false, error: error.message };
    }
  }

  async resetAdminToEnvironmentPassword() {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@monay.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'SecureAdmin123!@#';

    console.log(`🔄 Resetting admin password for: ${adminEmail}`);
    console.log(`🔑 Using environment password: ${adminPassword}`);

    return await this.updateAdminPassword(adminEmail, adminPassword);
  }

  async createSecureAdminPassword(email) {
    const securePassword = await this.generateSecurePassword(16);
    console.log(`🔐 Generated secure password: ${securePassword}`);
    console.log('⚠️  IMPORTANT: Save this password securely - it will not be shown again!');

    return await this.updateAdminPassword(email, securePassword);
  }

  async validatePasswordStrength(password) {
    const requirements = {
      minLength: parseInt(process.env.MIN_PASSWORD_LENGTH) || 12,
      requireUppercase: process.env.REQUIRE_UPPERCASE === 'true',
      requireLowercase: process.env.REQUIRE_LOWERCASE === 'true',
      requireNumbers: process.env.REQUIRE_NUMBERS === 'true',
      requireSpecialChars: process.env.REQUIRE_SPECIAL_CHARS === 'true'
    };

    const issues = [];

    if (password.length < requirements.minLength) {
      issues.push(`Minimum ${requirements.minLength} characters required`);
    }

    if (requirements.requireUppercase && !/[A-Z]/.test(password)) {
      issues.push('At least one uppercase letter required');
    }

    if (requirements.requireLowercase && !/[a-z]/.test(password)) {
      issues.push('At least one lowercase letter required');
    }

    if (requirements.requireNumbers && !/\d/.test(password)) {
      issues.push('At least one number required');
    }

    if (requirements.requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      issues.push('At least one special character required');
    }

    return {
      isValid: issues.length === 0,
      issues: issues
    };
  }

  async listAdminUsers() {
    try {
      const results = await this.sequelize.query(`
        SELECT id, email, first_name, last_name, role, is_active, created_at, updated_at
        FROM users
        WHERE role IN ('platform_admin', 'compliance_officer', 'treasury_manager', 'support_agent')
        ORDER BY role, email
      `, {
        type: this.sequelize.QueryTypes.SELECT
      });

      console.log('👥 Admin users:');
      results.forEach(user => {
        console.log(`  • ${user.email} (${user.role}) - ${user.is_active ? 'Active' : 'Inactive'}`);
      });

      return results;
    } catch (error) {
      console.error('❌ Error listing admin users:', error.message);
      return [];
    }
  }

  async showHelp() {
    console.log(`
🔧 Admin Password Manager
Usage: node admin-password-manager.js [command] [options]

Commands:
  reset-env           Reset admin password to environment variable value
  generate [email]    Generate and set a secure random password
  custom [email] [password]  Set a custom password (must meet security requirements)
  list               List all admin users
  validate [password] Validate password strength
  help               Show this help message

Examples:
  node admin-password-manager.js reset-env
  node admin-password-manager.js generate admin@monay.com
  node admin-password-manager.js custom admin@monay.com "NewSecurePassword123!"
  node admin-password-manager.js list
  node admin-password-manager.js validate "TestPassword123!"

Environment Variables:
  ADMIN_EMAIL        Admin email (default: admin@monay.com)
  ADMIN_PASSWORD     Admin password for development
  BCRYPT_ROUNDS      Password hashing rounds (default: 12)
  MIN_PASSWORD_LENGTH Minimum password length (default: 12)
  REQUIRE_UPPERCASE  Require uppercase letters (default: true)
  REQUIRE_LOWERCASE  Require lowercase letters (default: true)
  REQUIRE_NUMBERS    Require numbers (default: true)
  REQUIRE_SPECIAL_CHARS Require special characters (default: true)
    `);
  }
}

async function main() {
  const manager = new AdminPasswordManager();
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === 'help') {
    await manager.showHelp();
    return;
  }

  const connected = await manager.connect();
  if (!connected) {
    process.exit(1);
  }

  try {
    switch (command) {
      case 'reset-env':
        await manager.resetAdminToEnvironmentPassword();
        break;

      case 'generate':
        const generateEmail = args[1] || process.env.ADMIN_EMAIL || 'admin@monay.com';
        await manager.createSecureAdminPassword(generateEmail);
        break;

      case 'custom':
        const customEmail = args[1];
        const customPassword = args[2];

        if (!customEmail || !customPassword) {
          console.log('❌ Usage: node admin-password-manager.js custom [email] [password]');
          break;
        }

        const validation = await manager.validatePasswordStrength(customPassword);
        if (!validation.isValid) {
          console.log('❌ Password does not meet requirements:');
          validation.issues.forEach(issue => console.log(`  • ${issue}`));
          break;
        }

        await manager.updateAdminPassword(customEmail, customPassword);
        break;

      case 'list':
        await manager.listAdminUsers();
        break;

      case 'validate':
        const testPassword = args[1];
        if (!testPassword) {
          console.log('❌ Usage: node admin-password-manager.js validate [password]');
          break;
        }

        const result = await manager.validatePasswordStrength(testPassword);
        if (result.isValid) {
          console.log('✅ Password meets all requirements');
        } else {
          console.log('❌ Password validation failed:');
          result.issues.forEach(issue => console.log(`  • ${issue}`));
        }
        break;

      default:
        console.log(`❌ Unknown command: ${command}`);
        await manager.showHelp();
        break;
    }
  } catch (error) {
    console.error('❌ Command failed:', error.message);
  } finally {
    await manager.disconnect();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default AdminPasswordManager;