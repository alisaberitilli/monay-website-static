'use strict';

export default (sequelize, DataTypes) => {
  const AuditLog = sequelize.define('AuditLog', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    tenantId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Tenants',
        key: 'id'
      }
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    resource: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    resourceId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    details: {
      type: DataTypes.TEXT,
      allowNull: true,
      get() {
        const value = this.getDataValue('details');
        return value ? JSON.parse(value) : null;
      },
      set(value) {
        this.setDataValue('details', value ? JSON.stringify(value) : null);
      }
    },
    metadata: {
      type: DataTypes.TEXT,
      allowNull: true,
      get() {
        const value = this.getDataValue('metadata');
        return value ? JSON.parse(value) : null;
      },
      set(value) {
        this.setDataValue('metadata', value ? JSON.stringify(value) : null);
      }
    },
    ipAddress: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isIPv4OrIPv6(value) {
          if (value && !/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$|^(?:[A-F0-9]{1,4}:){7}[A-F0-9]{1,4}$/i.test(value)) {
            throw new Error('Invalid IP address');
          }
        }
      }
    },
    userAgent: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    sessionId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    severity: {
      type: DataTypes.ENUM('DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL', 'SECURITY'),
      defaultValue: 'INFO',
      allowNull: false
    },
    category: {
      type: DataTypes.ENUM(
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
      allowNull: false
    },
    hash: {
      type: DataTypes.STRING,
      allowNull: false
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'AuditLogs',
    timestamps: true,
    indexes: [
      { fields: ['userId'] },
      { fields: ['tenantId'] },
      { fields: ['action'] },
      { fields: ['resource'] },
      { fields: ['resourceId'] },
      { fields: ['severity'] },
      { fields: ['category'] },
      { fields: ['timestamp'] },
      { fields: ['ipAddress'] },
      { fields: ['sessionId'] },
      { fields: ['tenantId', 'timestamp'] },
      { fields: ['userId', 'timestamp'] },
      { fields: ['severity', 'timestamp'] },
      { fields: ['category', 'timestamp'] },
      { fields: ['action', 'resource', 'timestamp'] }
    ],
    hooks: {
      beforeCreate: (auditLog, options) => {
        // Ensure timestamp is set
        if (!auditLog.timestamp) {
          auditLog.timestamp = new Date();
        }
      }
    }
  });

  AuditLog.associate = function(models) {
    // Associations
    AuditLog.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
  };

  // Class methods
  AuditLog.getRecentByUser = async function(userId, limit = 50) {
    return this.findAll({
      where: { userId },
      order: [['timestamp', 'DESC']],
      limit
    });
  };

  AuditLog.getRecentByTenant = async function(tenantId, limit = 100) {
    return this.findAll({
      where: { tenantId },
      order: [['timestamp', 'DESC']],
      limit
    });
  };

  AuditLog.getSecurityEvents = async function(hours = 24) {
    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() - hours);

    return this.findAll({
      where: {
        timestamp: { [sequelize.Op.gte]: cutoffTime },
        [sequelize.Op.or]: [
          { severity: 'CRITICAL' },
          { severity: 'SECURITY' },
          { category: 'SECURITY' }
        ]
      },
      order: [['timestamp', 'DESC']]
    });
  };

  return AuditLog;
};