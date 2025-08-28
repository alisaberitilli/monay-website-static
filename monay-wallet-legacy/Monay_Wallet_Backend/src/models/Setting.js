module.exports = (sequelize, DataTypes) => {
  const Setting = sequelize.define(
    'Setting',
    {
      name: {
        type: DataTypes.STRING(255)
      },
      key: {
        type: DataTypes.STRING(255)
      },
      value: {
        type: DataTypes.STRING(255)
      },
      settingType: {
        type: DataTypes.ENUM('public', 'private'),
        defaultValue: 'public'
      },
      status: {
        type: DataTypes.ENUM('active', 'inactive'),
        defaultValue: 'active'
      },
    },
    {
      underscored: true
    }
  );

  Setting.associate = function (models) { };
  return Setting;
};
