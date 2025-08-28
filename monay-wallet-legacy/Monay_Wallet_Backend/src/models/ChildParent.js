module.exports = (sequelize, DataTypes) => {
  const ChildParent = sequelize.define(
    'ChildParent',
    {
      userId: {
        type: DataTypes.INTEGER
      },
      parentId: {
        type: DataTypes.INTEGER
      },
      verificationOtp: {
        type: DataTypes.STRING(191)
      },
      isParentVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      limit: {
        type: DataTypes.FLOAT,
        defaultValue: 0
      },
      remainAmount: {
        type: DataTypes.FLOAT,
        defaultValue: 0
      },
      status: {
        type: DataTypes.ENUM('active', 'inactive', 'deleted'),
        defaultValue: 'inactive'
      },
    },
    {
      underscored: true
    }
  );

  ChildParent.associate = function (models) {
    ChildParent.belongsTo(models.User, {
      foreignKey: 'userId', onDelete: 'cascade'
    });
    ChildParent.belongsTo(models.User, {
      foreignKey: 'parentId', onDelete: 'cascade',
      as: 'parent'
    });
  };
  return ChildParent;
};
