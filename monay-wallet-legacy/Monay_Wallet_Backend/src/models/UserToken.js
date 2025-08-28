module.exports = (sequelize, DataTypes) => {
  const UserTokens = sequelize.define(
    'UserToken',
    {
      userId: {
        type: DataTypes.INTEGER
      },
      accessToken: {
        type: DataTypes.TEXT
      },
      firebaseToken: {
        type: DataTypes.STRING
      },
      deviceType: {
        type: DataTypes.ENUM('web', 'ios', 'android')
      }
    },
    {
      underscored: true
    }
  );
  UserTokens.associate = function (models) {
    UserTokens.belongsTo(models.User, {
      foreignKey: 'userId', onDelete: 'cascade'
    });
  };
  return UserTokens;
};
