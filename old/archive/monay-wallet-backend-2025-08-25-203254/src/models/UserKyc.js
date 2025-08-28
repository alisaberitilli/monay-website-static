import config from '../config';
import utility from '../services/utility';

module.exports = (sequelize, DataTypes) => {
    const UserKyc = sequelize.define(
        'UserKyc',
        {
            userId: {
                type: DataTypes.STRING
            },
            idProofName: {
                type: DataTypes.STRING(255)
            },
            idProofImage: {
                type: DataTypes.STRING(255),
                set(val) {
                    let tmpStr = val;
                    tmpStr = tmpStr.replace(/\\/g, '/');
                    this.setDataValue('idProofImage', tmpStr);
                },
            },
            idProofBackImage: {
                type: DataTypes.STRING(255),
                set(val) {
                    let tmpStr = val;
                    tmpStr = tmpStr.replace(/\\/g, '/');
                    this.setDataValue('idProofBackImage', tmpStr);
                },
            },
            addressProofBackImage: {
                type: DataTypes.STRING(255),
                set(val) {
                    let tmpStr = val;
                    tmpStr = tmpStr.replace(/\\/g, '/');
                    this.setDataValue('addressProofBackImage', tmpStr);
                },
            },
            addressProofName: {
                type: DataTypes.STRING(255),

            },
            addressProofImage: {
                type: DataTypes.STRING(255),
                set(val) {
                    let tmpStr = val;
                    tmpStr = tmpStr.replace(/\\/g, '/');
                    this.setDataValue('addressProofImage', tmpStr);
                },
            },
            reason: {
                type: DataTypes.TEXT
            },
            status: {
                type: DataTypes.ENUM('pending', 'uploaded', 'approved', 'rejected', 'deleted'),
                defaultValue: 'pending'
            },
            // idProofImageUrl: {
            //     type: DataTypes.VIRTUAL,
            //     get() {
            //         let str = this.get('idProofImage');
            //         if (str && config.app.mediaStorage == 's3') {
            //             return `${config.media.staticMediaUrl}${str}`;
            //         } else if (!str || !utility.isFileExist(str)) {
            //             return null;
            //         }
            //         return (str && `${config.app.baseUrl}${str}`) || null;
            //     },
            // },
            // addressProofImageUrl: {
            //     type: DataTypes.VIRTUAL,
            //     get() {
            //         let str = this.get('addressProofImage');
            //         if (str && config.app.mediaStorage == 's3') {
            //             return `${config.media.staticMediaUrl}${str}`;
            //         } else if (!str || !utility.isFileExist(str)) {
            //             return null;
            //         }
            //         return (str && `${config.app.baseUrl}${str}`) || null;
            //     },
            // },
        },
        {
            underscored: false,
      tableName: 'user_kyc'
        },
    );
    UserKyc.associate = function (models) {
        UserKyc.belongsTo(models.User, {
            foreignKey: 'userId', onDelete: 'cascade'
        });
    };
    return UserKyc;
};
