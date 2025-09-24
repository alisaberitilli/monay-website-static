export default (sequelize, DataTypes) => {
  const RolePermission = sequelize.define(
    'RolePermission',
    {
      roleId: {
        type: DataTypes.INTEGER
      },
      moduleKey: {
        type: DataTypes.STRING(255)
      },
      permission: {
        type: DataTypes.ENUM('view', 'edit'),
        defaultValue: 'view'
      },
    },
    {
      underscored: false,
      tableName: 'role_permissions'
    }
  );

  RolePermission.associate = function (models) {
    RolePermission.belongsTo(models.UserRole, {
      foreignKey: 'roleId', onDelete: 'cascade'
    });
  };
  return RolePermission;
};
