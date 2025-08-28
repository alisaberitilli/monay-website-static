const bcrypt = require('bcryptjs');
const { Sequelize } = require('sequelize');

async function resetAdminPassword() {
  // Database connection using Sequelize
  const sequelize = new Sequelize('monay_wallet', 'alisaberi', '', {
    host: 'localhost',
    dialect: 'postgres',
    logging: false
  });

  try {
    await sequelize.authenticate();
    console.log('Connected to database');

    // Generate password hash for "Admin@123"
    const password = 'Admin@123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Update admin password
    const [results] = await sequelize.query(`
      UPDATE users 
      SET password = :password, "updatedAt" = NOW()
      WHERE email = 'admin@monay.com'
      RETURNING id, email, "firstName", "lastName"
    `, {
      replacements: { password: hashedPassword },
      type: sequelize.QueryTypes.UPDATE
    });
    
    if (results.length > 0) {
      console.log('Password updated successfully for:', results[0]);
      console.log('New password: Admin@123');
    } else {
      console.log('Admin user not found');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
    console.log('Database connection closed');
  }
}

resetAdminPassword();