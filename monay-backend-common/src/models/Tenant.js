import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Tenant = sequelize.define(
    'Tenant',
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4
      },
      tenant_code: {
        type: DataTypes.STRING(50),
        unique: true,
        allowNull: false
      },
      name: {
        type: DataTypes.STRING(200),
        allowNull: false
      },
      type: {
        type: DataTypes.ENUM('enterprise', 'small_business', 'individual'),
        allowNull: false,
        defaultValue: 'individual'
      },
      isolation_level: {
        type: DataTypes.ENUM('database', 'schema', 'row'),
        allowNull: false,
        defaultValue: 'row'
      },
      billing_tier: {
        type: DataTypes.STRING(50),
        defaultValue: 'free'
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
      tableName: 'tenants',
      timestamps: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  );

  Tenant.associate = (models) => {
    // A tenant has many organizations
    Tenant.hasMany(models.Organization, {
      foreignKey: 'tenant_id',
      as: 'organizations'
    });

    // A tenant has many users
    Tenant.hasMany(models.User, {
      foreignKey: 'current_tenant_id',
      as: 'users'
    });
  };

  return Tenant;
};
