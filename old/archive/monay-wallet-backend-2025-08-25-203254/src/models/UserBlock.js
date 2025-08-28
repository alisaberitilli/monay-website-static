module.exports = (sequelize, DataTypes) => {
  const UserBlock = sequelize.define(
    'UserBlock',
    {
      userId: {
        type: DataTypes.STRING
      },
      blockedUserId: {
        type: DataTypes.STRING
      },
    },
    {
      underscored: false,
      tableName: 'user_blocks'
    }
  );

  UserBlock.associate = function (models) {
    UserBlock.belongsTo(models.User, { foreignKey: 'userId', onDelete: 'cascade' });
    UserBlock.belongsTo(models.User, { as: 'blockUser', foreignKey: 'blockedUserId', onDelete: 'cascade' });
  };
  return UserBlock;
};
