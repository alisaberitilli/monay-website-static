import config from '../config';
import utility from '../services/utility';

const defaultUsermage = `${config.app.baseUrl}public/default-images/user.png`;

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      firstName: {
        type: DataTypes.STRING(50)
      },
      lastName: {
        type: DataTypes.STRING(50)
      },
      email: {
        type: DataTypes.STRING(100)
      },
      phoneNumberCountryCode: {
        type: DataTypes.STRING(5)
      },
      phoneNumber: {
        type: DataTypes.STRING(13)
      },
      password: {
        type: DataTypes.STRING(255)
      },
      companyName: {
        type: DataTypes.STRING(150)
      },
      taxId: {
        type: DataTypes.STRING(50)
      },
      chamberOfCommerce: {
        type: DataTypes.STRING(50)
      },
      verificationOtp: {
        type: DataTypes.STRING(191)
      },
      verificationCode: {
        type: DataTypes.STRING(191)
      },
      referralCode: {
        type: DataTypes.STRING(20)
      },
      isKycVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      kycStatus: {
        type: DataTypes.ENUM('pending', 'uploaded', 'approved', 'rejected', 'deleted'),
        defaultValue: 'pending'
      },
      isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      isMobileVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      isEmailVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      passwordResetToken: {
        type: DataTypes.STRING(191)
      },
      mPin: {
        type: DataTypes.STRING(191)
      },
      uniqueCode: {
        type: DataTypes.STRING(191)
      },
      qrCode: {
        type: DataTypes.STRING(191)
      },
      accountNumber: {
        type: DataTypes.STRING(100)
      },
      otpSpentTime: {
        type: DataTypes.DATE,
        allowNull: true
      },
      codeSpentTime: {
        type: DataTypes.DATE,
        allowNull: true
      },
      profilePicture: {
        type: DataTypes.STRING(255),
        set(val) {
          let tmpStr = val;
          tmpStr = tmpStr.replace(/\\/g, '/');
          this.setDataValue('profilePicture', tmpStr);
        },
      },
      userType: {
        type: DataTypes.ENUM('admin', 'user', 'merchant', 'subadmin', 'secondaryUser')
      },
      status: {
        type: DataTypes.ENUM('pending', 'active', 'inactive', 'deleted'),
        defaultValue: 'pending'
      },
      roleId: {
        type: DataTypes.INTEGER
      },
      refillWalletAmount: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      autoToupStatus: {
        type: DataTypes.BOOLEAN,
        defaultValue: 0
      },
      minimumWalletAmount: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      profilePictureUrl: {
        type: DataTypes.VIRTUAL,
        get() {
          const str = this.get('profilePicture');
          if (str) {
            const imagePathArray = str.split('/');
            const imageName = imagePathArray.pop();
            imagePathArray.push('thumb');
            imagePathArray.push(imageName);
            if (str && config.app.mediaStorage == 's3') {
              return `${config.media.staticMediaUrl}${imagePathArray.join('/')}`;
            } else if (str && utility.isFileExist(str)) {
              return `${config.app.baseUrl}${imagePathArray.join('/')}`;
            } else {
              return defaultUsermage;
            }
          } else {
            return defaultUsermage;
          }
        }
      },
      qrCodeUrl: {
        type: DataTypes.VIRTUAL,
        get() {
          let str = this.get('qrCode');
          if (str && config.app.mediaStorage == 's3') {
            return `${config.media.staticMediaUrl}${str}`;
          } else if (!str || !utility.isFileExist(str)) {
            return null;
          }
          return (str && `${config.app.baseUrl}${str}`) || null;
        },
      }
    },
    {
      underscored: true
    }
  );

  User.associate = function (models) {
    User.hasMany(models.UserKyc, {
      foreignKey: 'userId', onDelete: 'cascade'
    });
    User.hasMany(models.ChildParent, {
      foreignKey: 'parentId', onDelete: 'cascade'
    });
    User.hasMany(models.ChildParent, {
      foreignKey: 'userId', onDelete: 'cascade',
      as: 'parent',
    });
    User.belongsTo(models.UserRole, { foreignKey: 'roleId' });
    User.hasMany(models.UserCard, { foreignKey: 'userId' });
    User.belongsTo(models.Country, { foreignKey: 'phoneNumberCountryCode' });
  };

  return User;
};
