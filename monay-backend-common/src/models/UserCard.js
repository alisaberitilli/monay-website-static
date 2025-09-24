import config from '../config/index.js';
import utility from '../services/utility.js';

export default (sequelize, DataTypes) => {
    const UserCard = sequelize.define(
        'UserCard',
        {
            userId: {
                type: DataTypes.STRING
            },
            cardType: {
                type: DataTypes.STRING(255)
            },
            cardIcon: {
                type: DataTypes.STRING(255),
            },
            cardName: {
                type: DataTypes.STRING(255)
            },
            cnpToken: {
                type: DataTypes.STRING(255)
            },
            last4Digit: {
                type: DataTypes.STRING(10)
            },
            nameOnCard: {
                type: DataTypes.STRING(255)
            },
            transactionId: {
                type: DataTypes.STRING(255)
            },
            month: {
                type: DataTypes.STRING(255)
            },
            year: {
                type: DataTypes.INTEGER
            },
            apiResponse: {
                type: DataTypes.TEXT
            },
            isDefault: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            status: {
                type: DataTypes.ENUM('active', 'inactive', 'invalid', 'deleted'),
                defaultValue: 'active'
            },
            cardIconUrl: {
                type: DataTypes.VIRTUAL,
                get() {
                    let str = this.get('cardIcon');
                    if (str) {
                        return `${config.app.baseUrl}${str}`;
                    } else if (!utility.isFileExist(str)) {
                        return null;
                    }
                    return (str && `${config.app.baseUrl}${str}`) || null;
                },
            },
        },
        {
            underscored: false,
      tableName: 'user_cards'
        },
    );
    UserCard.associate = function (models) {
        UserCard.belongsTo(models.User, {
            foreignKey: 'userId', onDelete: 'cascade'
        });
    };
    return UserCard;
};
