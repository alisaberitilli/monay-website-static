module.exports = (sequelize, DataTypes) => {
  const UserRole = sequelize.define(
    'UserRole',
    {
      role: {
        type: DataTypes.STRING(255)
      },

    },
    {
      underscored: true
    }
  );

  UserRole.associate = function (models) {
    UserRole.hasMany(models.RolePermission, { foreignKey: 'roleId' });
  };
  return UserRole;
};
