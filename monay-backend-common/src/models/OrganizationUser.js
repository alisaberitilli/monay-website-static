import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const OrganizationUser = sequelize.define(
    'OrganizationUser',
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4
      },
      organization_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'organizations',
          key: 'id'
        }
      },
      user_id: {
        type: DataTypes.STRING(255),
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      role: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'member'
      },
      permissions: {
        type: DataTypes.JSONB,
        defaultValue: {}
      },
      invitation_status: {
        type: DataTypes.ENUM('pending', 'accepted', 'rejected', 'active'),
        defaultValue: 'active'
      },
      invited_by: {
        type: DataTypes.STRING(255),
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      invited_at: {
        type: DataTypes.DATE,
        allowNull: true
      },
      joined_at: {
        type: DataTypes.DATE,
        allowNull: true
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
      tableName: 'organization_users',
      timestamps: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  );

  OrganizationUser.associate = (models) => {
    // OrganizationUser belongs to Organization
    OrganizationUser.belongsTo(models.Organization, {
      foreignKey: 'organization_id',
      as: 'organization'
    });

    // OrganizationUser belongs to User
    OrganizationUser.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });

    // Invited by user
    OrganizationUser.belongsTo(models.User, {
      foreignKey: 'invited_by',
      as: 'inviter'
    });
  };

  return OrganizationUser;
};
