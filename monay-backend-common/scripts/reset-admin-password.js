import bcrypt from 'bcryptjs';
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function resetAdminPassword() {
  // Database connection using environment variables
  const sequelize = new Sequelize(
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

  try {
    await sequelize.authenticate();
    console.log('Connected to database');

    // Use environment variable for password
    const password = process.env.ADMIN_PASSWORD || 'SecureAdmin123!@#';
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@monay.com';
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;

    console.log(`Resetting password for: ${adminEmail}`);
    console.log(`Using password from environment: ${password}`);

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Update admin password
    const [results] = await sequelize.query(`
      UPDATE users
      SET password_hash = :password, updated_at = NOW()
      WHERE email = :email
      RETURNING id, email, first_name, last_name, role
    `, {
      replacements: { password: hashedPassword, email: adminEmail },
      type: sequelize.QueryTypes.UPDATE
    });

    if (results.length > 0) {
      console.log('✅ Password updated successfully for:', results[0]);
      console.log(`📝 New password: ${password}`);
    } else {
      console.log('❌ Admin user not found');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
    console.log('Database connection closed');
  }
}

resetAdminPassword();