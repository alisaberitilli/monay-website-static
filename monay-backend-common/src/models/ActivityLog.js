export default (sequelize, DataTypes) => {
  const ActivityLog = sequelize.define(
    'ActivityLog',
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
      },
      userId: {
        type: DataTypes.STRING
      },
      action: {
        type: DataTypes.STRING
      },
      description: {
        type: DataTypes.TEXT
      },
      ipAddress: {
        type: DataTypes.STRING
      },
      userAgent: {
        type: DataTypes.STRING
      },
      metadata: {
        type: DataTypes.JSONB
      },
      // Virtual fields for backward compatibility
      ip: {
        type: DataTypes.VIRTUAL,
        get() {
          return this.get('ipAddress');
        },
        set(val) {
          this.setDataValue('ipAddress', val);
        }
      },
      activityType: {
        type: DataTypes.VIRTUAL,
        get() {
          return this.get('action');
        },
        set(val) {
          this.setDataValue('action', val);
        }
      },
      message: {
        type: DataTypes.VIRTUAL,
        get() {
          return this.get('description');
        },
        set(val) {
          this.setDataValue('description', val);
        }
      },
    },
    {
      underscored: false,
      tableName: 'activity_logs',
      timestamps: false
    },
  );
  ActivityLog.associate = function (models) {
    ActivityLog.belongsTo(models.User, {
      foreignKey: 'userId', onDelete: 'cascade'
    });
  };
  return ActivityLog;
};
