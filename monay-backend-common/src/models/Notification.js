module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define(
    'Notification',
    {
      type: {
        type: DataTypes.STRING(255)
      },
      title: {
        type: DataTypes.STRING(500)
      },
      message: {
        type: DataTypes.TEXT
      },
      receiverRead: {
        type: DataTypes.ENUM('read', 'unread'),
        defaultValue: 'unread'
      },
      notificationData: {
        type: DataTypes.TEXT
      }
    },
    {
      underscored: false,
      tableName: 'notifications'
    }
  );

  Notification.associate = function (models) {
    Notification.belongsTo(models.User, { foreignKey: 'fromUserId', onDelete: 'cascade' });

    Notification.belongsTo(models.User, { foreignKey: 'toUserId', onDelete: 'cascade' });
  };
  return Notification;
};
