module.exports = (sequelize, DataTypes) => {
    const UserBankAccount = sequelize.define(
        'UserBankAccount',
        {
            userId: {
                type: DataTypes.INTEGER
            },
            accountHolderName: {
                type: DataTypes.STRING(255)
            },
            cnpToken: {
                type: DataTypes.STRING(255)
            },
            bankName: {
                type: DataTypes.STRING(255)
            },
            routingNumber: {
                type: DataTypes.STRING(255)
            },
            last4Digit: {
                type: DataTypes.STRING(20)
            },
            swiftCode: {
                type: DataTypes.STRING(255)
            },
            transactionId: {
                type: DataTypes.STRING(255)
            },
            status: {
                type: DataTypes.ENUM('active', 'inactive', 'invalid', 'deleted'),
                defaultValue: 'active'
            },
            apiResponse: {
                type: DataTypes.TEXT
            }
        },
        {
            underscored: true
        },
    );
    UserBankAccount.associate = function (models) {
        UserBankAccount.belongsTo(models.User, {
            foreignKey: 'userId', onDelete: 'cascade'
        });
    };
    return UserBankAccount;
};
