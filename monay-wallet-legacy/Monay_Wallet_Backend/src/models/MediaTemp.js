module.exports = (sequelize, DataTypes) => {
  const MediaTemp = sequelize.define(
    'MediaTemp',
    {
      name: {
        type: DataTypes.STRING(255)
      },
      basePath: {
        type: DataTypes.TEXT
      },
      baseUrl: {
        type: DataTypes.TEXT
      },
      mediaType: {
        type: DataTypes.ENUM('image', 'file', 'audio', 'video')
      },
      mediaFor: {
        type: DataTypes.ENUM('user')
      },
      status: {
        type: DataTypes.ENUM('pending', 'used', 'deleted'),
        defaultValue: 'pending'
      },
    },
    {
      underscored: true,
    },
  );
  MediaTemp.associate = function (models) {
    // associations can be defined here
  };
  return MediaTemp;
};
