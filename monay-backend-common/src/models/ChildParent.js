export default (sequelize, DataTypes) => {
  const ChildParent = sequelize.define(
    'ChildParent',
    {
      childId: {
        type: DataTypes.STRING,
        field: 'child_id'
      },
      parentId: {
        type: DataTypes.STRING,
        field: 'parent_id'
      },
      // These fields don't exist in the actual table, making them virtual or removing
      verificationOtp: {
        type: DataTypes.VIRTUAL,
        get() { return null; }
      },
      isParentVerified: {
        type: DataTypes.VIRTUAL,
        get() { return true; }
      },
      limit: {
        type: DataTypes.VIRTUAL,
        get() { return this.get('dailyLimit') || 0; }
      },
      remainAmount: {
        type: DataTypes.VIRTUAL,
        get() { return 0; }
      },
      status: {
        type: DataTypes.VIRTUAL,
        get() {
          // For now, return 'active' for all records since table doesn't have status column
          return 'active';
        }
      },
      // Additional fields for Consumer Wallet - map to actual database columns
      relationship: {
        type: DataTypes.STRING,
        field: 'relationship'
      },
      dailyLimit: {
        type: DataTypes.FLOAT,
        field: 'daily_limit'
      },
      monthlyLimit: {
        type: DataTypes.FLOAT,
        field: 'monthly_limit'
      },
      autoTopupEnabled: {
        type: DataTypes.BOOLEAN,
        field: 'auto_topup_enabled'
      },
      autoTopupThreshold: {
        type: DataTypes.FLOAT,
        field: 'auto_topup_threshold'
      },
      autoTopupAmount: {
        type: DataTypes.FLOAT,
        field: 'auto_topup_amount'
      },
      permissions: {
        type: DataTypes.JSON,
        field: 'permissions'
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        field: 'is_active'
      },
      metadata: {
        type: DataTypes.JSON,
        field: 'metadata'
      }
    },
    {
      underscored: false,
      tableName: 'child_parents'
    }
  );

  ChildParent.associate = function (models) {
    ChildParent.belongsTo(models.User, {
      foreignKey: 'childId', onDelete: 'cascade'
    });
    ChildParent.belongsTo(models.User, {
      foreignKey: 'parentId', onDelete: 'cascade',
      as: 'parent'
    });
  };
  return ChildParent;
};
