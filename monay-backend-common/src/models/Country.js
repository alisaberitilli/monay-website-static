export default (sequelize, DataTypes) => {
  const Country = sequelize.define(
    'Country',
    {
      code: {
        type: DataTypes.STRING(100)
      },
      name: {
        type: DataTypes.STRING(100)
      },
      countryCallingCode: {
        type: DataTypes.STRING(11)
      },
      currencyCode: {
        type: DataTypes.STRING(100)
      },
      status: {
        type: DataTypes.ENUM( 'active', 'inactive', 'deleted'),
        defaultValue: 'inactive'
      },
    },
    {
      underscored: false,
      tableName: 'countries'
    }
  );
  Country.associate = function (models) { };
  return Country;
};
