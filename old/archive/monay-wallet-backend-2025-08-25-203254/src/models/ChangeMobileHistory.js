module.exports = (sequelize, DataTypes) => {
  const ChangeMobileHistory = sequelize.define(
    'ChangeMobileHistory',
    {
      userId: {
        type: DataTypes.STRING
      },
      // phoneNumberCountryCode removed - using mobile field instead
      mobile: {
        type: DataTypes.STRING(20) // Full phone number with country code
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
      underscored: false,
      tableName: 'change_mobile_history'
    }
  );

  ChangeMobileHistory.associate = function (models) {
    ChangeMobileHistory.belongsTo(models.User, { foreignKey: 'userId', onDelete: 'cascade' });
  };
  return ChangeMobileHistory;
};
