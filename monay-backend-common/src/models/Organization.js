import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Organization = sequelize.define(
    'Organization',
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4
      },
      tenant_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'tenants',
          key: 'id'
        }
      },
      name: {
        type: DataTypes.STRING(200),
        allowNull: false
      },
      organization_type: {
        type: DataTypes.STRING(50),
        defaultValue: 'enterprise'
      },
      wallet_type: {
        type: DataTypes.STRING(50),
        defaultValue: 'enterprise'
      },
      feature_tier: {
        type: DataTypes.STRING(50),
        defaultValue: 'enterprise'
      },
      status: {
        type: DataTypes.ENUM('active', 'suspended', 'inactive'),
        allowNull: false,
        defaultValue: 'active'
      },
      metadata: {
        type: DataTypes.JSONB,
        defaultValue: {}
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    },
    {
      tableName: 'organizations',
      timestamps: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  );

  Organization.associate = (models) => {
    // Organization belongs to a tenant
    Organization.belongsTo(models.Tenant, {
      foreignKey: 'tenant_id',
      as: 'tenant'
    });

    // Organization has many users through organization_users
    Organization.belongsToMany(models.User, {
      through: 'organization_users',
      foreignKey: 'organization_id',
      otherKey: 'user_id',
      as: 'users'
    });

    // Organization has many wallets
    Organization.hasMany(models.Wallet, {
      foreignKey: 'organization_id',
      as: 'wallets'
    });
  };

  return Organization;
};
