'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('AuditLogs', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: true,
        index: true
      },
      tenantId: {
        type: Sequelize.UUID,
        allowNull: true,
        index: true
      },
      action: {
        type: Sequelize.STRING,
        allowNull: false,
        index: true
      },
      resource: {
        type: Sequelize.STRING,
        allowNull: false,
        index: true
      },
      resourceId: {
        type: Sequelize.STRING,
        allowNull: true,
        index: true
      },
      details: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      metadata: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      ipAddress: {
        type: Sequelize.STRING,
        allowNull: true,
        index: true
      },
      userAgent: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      sessionId: {
        type: Sequelize.STRING,
        allowNull: true,
        index: true
      },
      severity: {
        type: Sequelize.ENUM('DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL', 'SECURITY'),
        defaultValue: 'INFO',
        allowNull: false,
        index: true
      },
      category: {
        type: Sequelize.ENUM(
          'AUTHENTICATION',
          'AUTHORIZATION',
          'FINANCIAL',
          'COMPLIANCE',
          'SECURITY',
          'SYSTEM',
          'USER_MANAGEMENT',
          'GENERAL'
        ),
        defaultValue: 'GENERAL',
        allowNull: false,
        index: true
      },
      hash: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'SHA256 hash for integrity verification'
      },
      timestamp: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
        index: true
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

    // Create composite indexes for common queries
    await queryInterface.addIndex('AuditLogs', {
      fields: ['tenantId', 'timestamp'],
      name: 'audit_logs_tenant_timestamp_idx'
    });

    await queryInterface.addIndex('AuditLogs', {
      fields: ['userId', 'timestamp'],
      name: 'audit_logs_user_timestamp_idx'
    });

    await queryInterface.addIndex('AuditLogs', {
      fields: ['severity', 'timestamp'],
      name: 'audit_logs_severity_timestamp_idx'
    });

    await queryInterface.addIndex('AuditLogs', {
      fields: ['category', 'timestamp'],
      name: 'audit_logs_category_timestamp_idx'
    });

    await queryInterface.addIndex('AuditLogs', {
      fields: ['action', 'resource', 'timestamp'],
      name: 'audit_logs_action_resource_timestamp_idx'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('AuditLogs');
  }
};