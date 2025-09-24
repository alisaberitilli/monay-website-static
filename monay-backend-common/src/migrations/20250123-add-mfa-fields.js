'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add MFA fields to Users table
    await queryInterface.addColumn('Users', 'mfaEnabled', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false
    });

    await queryInterface.addColumn('Users', 'mfaSecret', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Encrypted TOTP secret'
    });

    await queryInterface.addColumn('Users', 'mfaBackupCodes', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Hashed backup codes in JSON array'
    });

    await queryInterface.addColumn('Users', 'mfaEnabledAt', {
      type: Sequelize.DATE,
      allowNull: true
    });

    await queryInterface.addColumn('Users', 'mfaFailedAttempts', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      allowNull: false
    });

    await queryInterface.addColumn('Users', 'mfaLockoutUntil', {
      type: Sequelize.DATE,
      allowNull: true
    });

    await queryInterface.addColumn('Users', 'mfaMethod', {
      type: Sequelize.ENUM('totp', 'sms', 'email'),
      defaultValue: 'totp',
      allowNull: true
    });

    await queryInterface.addColumn('Users', 'mfaPhoneNumber', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Phone number for SMS MFA'
    });

    await queryInterface.addColumn('Users', 'mfaEmailVerified', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
      comment: 'Whether email has been verified for MFA'
    });

    await queryInterface.addColumn('Users', 'mfaEnforcedAt', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Date when MFA will be enforced for this user'
    });

    // Add indexes for MFA fields
    await queryInterface.addIndex('Users', {
      fields: ['mfaEnabled'],
      name: 'users_mfa_enabled_idx'
    });

    await queryInterface.addIndex('Users', {
      fields: ['mfaLockoutUntil'],
      name: 'users_mfa_lockout_idx'
    });

    // Create MFA Sessions table for tracking MFA verification sessions
    await queryInterface.createTable('MFASessions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      sessionToken: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      method: {
        type: Sequelize.ENUM('totp', 'sms', 'email', 'backup'),
        allowNull: false
      },
      verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      verifiedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      expiresAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      ipAddress: {
        type: Sequelize.STRING,
        allowNull: true
      },
      userAgent: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Add indexes for MFA Sessions
    await queryInterface.addIndex('MFASessions', {
      fields: ['userId'],
      name: 'mfa_sessions_user_idx'
    });

    await queryInterface.addIndex('MFASessions', {
      fields: ['sessionToken'],
      name: 'mfa_sessions_token_idx'
    });

    await queryInterface.addIndex('MFASessions', {
      fields: ['expiresAt'],
      name: 'mfa_sessions_expires_idx'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove MFA Sessions table
    await queryInterface.dropTable('MFASessions');

    // Remove MFA columns from Users table
    await queryInterface.removeColumn('Users', 'mfaEnabled');
    await queryInterface.removeColumn('Users', 'mfaSecret');
    await queryInterface.removeColumn('Users', 'mfaBackupCodes');
    await queryInterface.removeColumn('Users', 'mfaEnabledAt');
    await queryInterface.removeColumn('Users', 'mfaFailedAttempts');
    await queryInterface.removeColumn('Users', 'mfaLockoutUntil');
    await queryInterface.removeColumn('Users', 'mfaMethod');
    await queryInterface.removeColumn('Users', 'mfaPhoneNumber');
    await queryInterface.removeColumn('Users', 'mfaEmailVerified');
    await queryInterface.removeColumn('Users', 'mfaEnforcedAt');
  }
};