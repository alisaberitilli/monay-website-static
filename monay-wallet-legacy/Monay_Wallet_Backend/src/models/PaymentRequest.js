module.exports = (sequelize, DataTypes) => {
    const PaymentRequest = sequelize.define(
        'PaymentRequest',
        {
            fromUserId: {
                type: DataTypes.INTEGER
            },
            toUserId: {
                type: DataTypes.INTEGER
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
            underscored: true
        },
    );
    PaymentRequest.associate = function (models) {
        PaymentRequest.belongsTo(models.User, {
            foreignKey: 'fromUserId', onDelete: 'cascade', as: 'fromUser'
        });
        PaymentRequest.belongsTo(models.User, {
            foreignKey: 'toUserId', onDelete: 'cascade', as: 'toUser'
        });
        PaymentRequest.hasOne(models.Transaction, {
            foreignKey: 'paymentRequestId', onDelete: 'set null', onUpdate: 'set null'
        });
    };
    return PaymentRequest;
};
