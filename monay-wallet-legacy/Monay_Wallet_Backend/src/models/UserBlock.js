module.exports = (sequelize, DataTypes) => {
  const UserBlock = sequelize.define(
    'UserBlock',
    {
      userId: {
        type: DataTypes.INTEGER
      },
      blockUserId: {
        type: DataTypes.INTEGER
      },
    },
    {
      underscored: true
    }
  );

  UserBlock.associate = function (models) {
    UserBlock.belongsTo(models.User, { foreignKey: 'userId', onDelete: 'cascade' });
    UserBlock.belongsTo(models.User, { as: 'blockUser', foreignKey: 'blockUserId', onDelete: 'cascade' });
  };
  return UserBlock;
};
