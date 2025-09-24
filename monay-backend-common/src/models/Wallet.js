export default (sequelize, DataTypes) => {
  const Wallet = sequelize.define(
    'Wallet',
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      walletAddress: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      walletType: {
        type: DataTypes.ENUM('solana', 'evm', 'bitcoin', 'virtual'),
        allowNull: false,
        defaultValue: 'solana',
      },
      balance: {
        type: DataTypes.DECIMAL(20, 8),
        allowNull: false,
        defaultValue: 0.0,
      },
      currency: {
        type: DataTypes.STRING(10),
        allowNull: false,
        defaultValue: 'USD',
      },
      isDefault: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      stripeCustomerId: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      stripePaymentMethodId: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      metadata: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: {},
      },
      status: {
        type: DataTypes.ENUM('active', 'inactive', 'suspended', 'frozen'),
        allowNull: false,
        defaultValue: 'active',
      },
      lastTransactionAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: 'wallets',
      timestamps: true,
      underscored: false,
    }
  );

  // Associations
  Wallet.associate = (models) => {
    Wallet.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
    });

    Wallet.hasMany(models.Transaction, {
      foreignKey: 'walletId',
      as: 'transactions',
    });
  };

  return Wallet;
};