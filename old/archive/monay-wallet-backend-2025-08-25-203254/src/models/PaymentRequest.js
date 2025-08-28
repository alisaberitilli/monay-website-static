module.exports = (sequelize, DataTypes) => {
    const PaymentRequest = sequelize.define(
        'PaymentRequest',
        {
            requesterId: {
                type: DataTypes.STRING
            },
            payerId: {
                type: DataTypes.STRING
            },
            amount: {
                type: DataTypes.FLOAT
            },
            message: {
                type: DataTypes.TEXT
            },
            declineReason: {
                type: DataTypes.TEXT
            },
            status: {
                type: DataTypes.ENUM('pending', 'paid', 'declined')
            }
        },
        {
            underscored: false,
      tableName: 'payment_requests'
        },
    );
    PaymentRequest.associate = function (models) {
        PaymentRequest.belongsTo(models.User, {
            foreignKey: 'requesterId', onDelete: 'cascade', as: 'requester'
        });
        PaymentRequest.belongsTo(models.User, {
            foreignKey: 'payerId', onDelete: 'cascade', as: 'payer'
        });
        PaymentRequest.hasOne(models.Transaction, {
            foreignKey: 'paymentRequestId', onDelete: 'set null', onUpdate: 'set null'
        });
    };
    return PaymentRequest;
};
