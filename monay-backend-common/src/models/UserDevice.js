export default (sequelize, DataTypes) => {
  const UserDevice = sequelize.define(
    'UserDevice',
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
      },
      userId: {
        type: DataTypes.STRING
      },
      // ip: {
      //   type: DataTypes.STRING(255)
      // },
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
      underscored: false,
      tableName: 'user_devices'
    },
  );
  UserDevice.associate = function (models) {
    UserDevice.belongsTo(models.User, {
      foreignKey: 'userId', onDelete: 'cascade'
    });
  };
  return UserDevice;
};
