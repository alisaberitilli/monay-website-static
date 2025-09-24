export default (sequelize, DataTypes) => {
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
      underscored: false,
      tableName: 'settings'
    }
  );

  Setting.associate = function (models) { };
  return Setting;
};
