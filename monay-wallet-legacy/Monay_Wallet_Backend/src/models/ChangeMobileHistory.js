module.exports = (sequelize, DataTypes) => {
  const ChangeMobileHistory = sequelize.define(
    'ChangeMobileHistory',
    {
      userId: {
        type: DataTypes.INTEGER
      },
      phoneNumberCountryCode: {
        type: DataTypes.STRING(5)
      },
      phoneNumber: {
        type: DataTypes.STRING(15)
      },
      email: {
        type: DataTypes.STRING(100)
      },
      status: {
        type: DataTypes.ENUM('active', 'pending', 'old'),
        defaultValue: 'pending'
      },
      type: {
        type: DataTypes.ENUM('mobile', 'email'),
        defaultValue: 'mobile'
      },
      otp: {
        type: DataTypes.STRING(191)
      },
    },
    {
      underscored: true
    }
  );

  ChangeMobileHistory.associate = function (models) {
    ChangeMobileHistory.belongsTo(models.User, { foreignKey: 'userId', onDelete: 'cascade' });
  };
  return ChangeMobileHistory;
};
