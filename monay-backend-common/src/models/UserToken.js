export default (sequelize, DataTypes) => {
  const UserTokens = sequelize.define(
    'UserToken',
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
      },
      userId: {
        type: DataTypes.STRING
      },
      token: {
        type: DataTypes.TEXT
      },
      refreshToken: {
        type: DataTypes.TEXT
      },
      type: {
        type: DataTypes.STRING
      },
      expiresAt: {
        type: DataTypes.DATE
      },
      // Virtual field for backward compatibility
      accessToken: {
        type: DataTypes.VIRTUAL,
        get() {
          return this.get('token');
        },
        set(val) {
          this.setDataValue('token', val);
        }
      },
      firebaseToken: {
        type: DataTypes.VIRTUAL,
        get() {
          return this.get('refreshToken');
        },
        set(val) {
          this.setDataValue('refreshToken', val);
        }
      },
      deviceType: {
        type: DataTypes.VIRTUAL,
        get() {
          return this.get('type');
        },
        set(val) {
          this.setDataValue('type', val);
        }
      }
    },
    {
      underscored: false,
      tableName: 'user_tokens',
      timestamps: false
    }
  );
  UserTokens.associate = function (models) {
    UserTokens.belongsTo(models.User, {
      foreignKey: 'userId', onDelete: 'cascade'
    });
  };
  return UserTokens;
};
