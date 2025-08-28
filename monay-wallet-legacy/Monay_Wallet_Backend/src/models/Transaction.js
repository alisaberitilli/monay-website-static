module.exports = (sequelize, DataTypes) => {
    const Transaction = sequelize.define(
        'Transaction',
        {
            fromUserId: {
                type: DataTypes.INTEGER
            },
            toUserId: {
                type: DataTypes.INTEGER
            },
            transactionUserId: {
                type: DataTypes.INTEGER
            },
            transactionId: {
                type: DataTypes.STRING(255)
            },
            amount: {
                type: DataTypes.FLOAT
            },
            message: {
                type: DataTypes.TEXT
            },
            transactionType: {
                type: DataTypes.ENUM('credit', 'debit')
            },
            paymentMethod: {
                type: DataTypes.ENUM('card', 'wallet', 'account')
            },
            actionType: {
                type: DataTypes.ENUM('deposit', 'withdrawal', 'transfer')
            },
            paymentStatus: {
                type: DataTypes.ENUM('pending', 'completed', 'cancelled', 'failed'),
                defaultValue: 'completed'
            },
            status: {
                type: DataTypes.ENUM('failed', 'success')
            },
            cardType: {
                type: DataTypes.STRING(255)
            },
            cardName: {
                type: DataTypes.STRING(255)
            },
            bankName: {
                type: DataTypes.STRING(255)
            },
            last4Digit: {
                type: DataTypes.STRING(10)
            },
            apiReponse: {
                type: DataTypes.TEXT
            },
            cnpToken: {
                type: DataTypes.STRING(255)
            },
            paymentRequestId: {
                type: DataTypes.INTEGER
            },
            parentId: {
                type: DataTypes.INTEGER
            }
        },
        {
            underscored: true
        },
    );
    Transaction.associate = function (models) {
        Transaction.belongsTo(models.User, {
            foreignKey: 'fromUserId', onDelete: 'cascade', as: 'fromUser'
        });
        Transaction.belongsTo(models.User, {
            foreignKey: 'toUserId', onDelete: 'cascade', as: 'toUser'
        });
        Transaction.belongsTo(models.User, {
            foreignKey: 'transactionUserId', onDelete: 'cascade', as: 'transactionUser'
        });
        Transaction.belongsTo(models.PaymentRequest, {
            foreignKey: 'paymentRequestId', onDelete: 'set null', onUpdate: 'set null'
        });
    };
    return Transaction;
};
