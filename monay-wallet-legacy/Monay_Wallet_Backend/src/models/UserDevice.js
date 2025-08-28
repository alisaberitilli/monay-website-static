module.exports = (sequelize, DataTypes) => {
  const UserDevice = sequelize.define(
    'UserDevice',
    {
      userId: {
        type: DataTypes.INTEGER
      },
      ip: {
        type: DataTypes.STRING(255)
      },
      appVersion: {
        type: DataTypes.STRING(255)
      },
      timezone: {
        type: DataTypes.STRING(255)
      },
      deviceModel: {
        type: DataTypes.STRING(255)
      },
      osVersion: {
        type: DataTypes.STRING(255)
      },
      deviceId: {
        type: DataTypes.STRING(255)
      },
      deviceType: {
        type: DataTypes.ENUM('web', 'ios', 'android')
      }
    },
    {
      underscored: true
    },
  );
  UserDevice.associate = function (models) {
    UserDevice.belongsTo(models.User, {
      foreignKey: 'userId', onDelete: 'cascade'
    });
  };
  return UserDevice;
};
