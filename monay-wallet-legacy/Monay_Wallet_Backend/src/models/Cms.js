module.exports = (sequelize, DataTypes) => {
  const Cms = sequelize.define(
    'Cms',
    {
      pageKey: {
        type: DataTypes.STRING(100)
      },
      pageName: {
        type: DataTypes.STRING(100)
      },
      pageContent: {
        type: DataTypes.TEXT
      },
      userType: {
        type: DataTypes.ENUM('user', 'merchant')
      }
    },
    {
      underscored: true
    }
  );
  Cms.associate = function (models) { };
  return Cms;
};
