import config from '../config/index.js';
import fs from 'fs';
import path from 'path';

const defaultUsermage = `${config.app.baseUrl}public/default-images/user.png`;

export default (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true
      },
      firstName: {
        type: DataTypes.STRING
      },
      lastName: {
        type: DataTypes.STRING
      },
      email: {
        type: DataTypes.STRING,
        unique: true
      },
      mobile: {
        type: DataTypes.STRING
      },
      phoneNumber: {
        type: DataTypes.VIRTUAL,
        get() {
          const mobile = this.get('mobile');
          if (!mobile) return null;
          // Remove country code if present (assuming it starts with +)
          if (mobile.startsWith('+')) {
            // Remove country code (e.g., +1 for US, +44 for UK, etc.)
            return mobile.replace(/^\+\d{1,4}/, '');
          }
          return mobile;
        },
        set(val) {
          // If val already includes country code, use it directly
          // Otherwise default to US country code
          if (val) {
            this.setDataValue('mobile', val.startsWith('+') ? val : '+1' + val);
          }
        }
      },
      status: {
        type: DataTypes.VIRTUAL,
        get() {
          const isActive = this.get('isActive');
          const isDeleted = this.get('isDeleted');
          const isBlocked = this.get('isBlocked');
          
          if (isDeleted) return 'deleted';
          if (isBlocked) return 'blocked';
          if (isActive) return 'active';
          return 'inactive';
        }
      },
      userType: {
        type: DataTypes.VIRTUAL,
        get() {
          const role = this.get('role');
          // Map roles to userType for backward compatibility
          if (role === 'platform_admin') return 'admin';
          if (role === 'compliance_officer' || role === 'treasury_manager' || role === 'support_agent') return 'subadmin';
          if (role === 'merchant') return 'merchant';
          if (role === 'secondary_user') return 'secondary_user';
          // All consumer types (basic_consumer, verified_consumer, premium_consumer) map to 'user'
          return 'user';
        }
      },
      password: {
        type: DataTypes.STRING
      },
      mpin: {
        type: DataTypes.STRING
      },
      walletBalance: {
        type: DataTypes.DOUBLE,
        defaultValue: 0
      },
      profileImage: {
        type: DataTypes.STRING
      },
      dateOfBirth: {
        type: DataTypes.DATE
      },
      gender: {
        type: DataTypes.STRING
      },
      address: {
        type: DataTypes.STRING
      },
      city: {
        type: DataTypes.STRING
      },
      state: {
        type: DataTypes.STRING
      },
      country: {
        type: DataTypes.STRING
      },
      zipCode: {
        type: DataTypes.STRING
      },
      isEmailVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      isMobileVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      isKycVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      isBlocked: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      blockedReason: {
        type: DataTypes.STRING
      },
      accountType: {
        type: DataTypes.STRING,
        defaultValue: 'personal'
      },
      referralCode: {
        type: DataTypes.STRING
      },
      referredBy: {
        type: DataTypes.STRING
      },
      qrCode: {
        type: DataTypes.STRING
      },
      uniqueCode: {
        type: DataTypes.VIRTUAL,
        get() {
          return this.get('id'); // Use ID as unique code
        },
        set(val) {
          // Ignore sets to uniqueCode
        }
      },
      twoFactorEnabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      lastLoginAt: {
        type: DataTypes.DATE
      },
      role: {
        type: DataTypes.STRING,
        defaultValue: 'basic_consumer'
      },
      userType: {
        type: DataTypes.VIRTUAL,
        get() {
          const role = this.get('role');
          // Map roles to legacy userType values
          if (role === 'platform_admin') return 'admin';
          if (role === 'compliance_officer' || role === 'treasury_manager') return 'subadmin';
          if (role === 'merchant') return 'merchant';
          if (role === 'secondary_user') return 'secondary_user';
          return 'user'; // All consumer types map to 'user'
        },
        set(val) {
          // Map legacy userType to new role
          if (val === 'admin') this.setDataValue('role', 'platform_admin');
          else if (val === 'subadmin') this.setDataValue('role', 'compliance_officer');
          else if (val === 'merchant') this.setDataValue('role', 'merchant');
          else if (val === 'secondary_user') this.setDataValue('role', 'secondary_user');
          else if (val === 'user') this.setDataValue('role', 'basic_consumer');
        }
      },
      // Virtual fields for compatibility
      profilePictureUrl: {
        type: DataTypes.VIRTUAL,
        get() {
          const str = this.get('profileImage');
          if (str) {
            const imagePathArray = str.split('/');
            const imageName = imagePathArray.pop();
            imagePathArray.push('thumb');
            imagePathArray.push(imageName);
            if (str && config.app.mediaStorage == 's3') {
              return `${config.media.staticMediaUrl}${imagePathArray.join('/')}`;
            } else if (str && fs.existsSync(path.resolve(str))) {
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
          } else if (!str || !fs.existsSync(path.resolve(str))) {
            return null;
          }
          return (str && `${config.app.baseUrl}${str}`) || null;
        },
      },
      // Aliases for backward compatibility
      profilePicture: {
        type: DataTypes.VIRTUAL,
        get() {
          return this.get('profileImage');
        },
        set(val) {
          this.setDataValue('profileImage', val);
        }
      },
      status: {
        type: DataTypes.VIRTUAL,
        get() {
          if (this.get('isDeleted')) return 'deleted';
          if (this.get('isBlocked')) return 'blocked';
          if (!this.get('isActive')) return 'inactive';
          return 'active';
        },
        set(val) {
          if (val === 'deleted') {
            this.setDataValue('isDeleted', true);
            this.setDataValue('isActive', false);
          } else if (val === 'blocked') {
            this.setDataValue('isBlocked', true);
            this.setDataValue('isActive', false);
          } else if (val === 'inactive') {
            this.setDataValue('isActive', false);
            this.setDataValue('isBlocked', false);
          } else if (val === 'active') {
            this.setDataValue('isActive', true);
            this.setDataValue('isBlocked', false);
            this.setDataValue('isDeleted', false);
          }
        }
      }
    },
    {
      underscored: false,
      tableName: 'users',
      timestamps: true
    }
  );

  User.associate = function (models) {
    // Keep only associations that exist in the database
    if (models.UserKyc) {
      User.hasMany(models.UserKyc, {
        foreignKey: 'userId', onDelete: 'cascade'
      });
    }
    if (models.UserCard) {
      User.hasMany(models.UserCard, { foreignKey: 'userId' });
    }
    if (models.ChildParent) {
      User.hasMany(models.ChildParent, {
        foreignKey: 'parentId', onDelete: 'cascade'
      });
      User.hasMany(models.ChildParent, {
        foreignKey: 'childId', onDelete: 'cascade',
        as: 'parent',
      });
    }
  };

  return User;
};