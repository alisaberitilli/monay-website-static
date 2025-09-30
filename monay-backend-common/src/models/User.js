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
        type: DataTypes.STRING,
        field: 'first_name'  // Map to database column
      },
      lastName: {
        type: DataTypes.STRING,
        field: 'last_name'  // Map to database column
      },
      email: {
        type: DataTypes.STRING,
        unique: true
      },
      mobile: {
        type: DataTypes.STRING
        // Now directly maps to 'mobile' column after migration
      },
      phone: {
        type: DataTypes.STRING
        // Landline/office phone number
      },
      primaryContact: {
        type: DataTypes.STRING,
        field: 'primary_contact',
        defaultValue: 'mobile',
        validate: {
          isIn: [['mobile', 'phone', 'email', 'whatsapp']]
        }
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
        type: DataTypes.STRING,
        field: 'password_hash'  // Database uses password_hash
      },
      mpin: {
        type: DataTypes.STRING
      },
      walletBalance: {
        type: DataTypes.DOUBLE,
        defaultValue: 0,
        field: 'wallet_balance'  // Map to database column if exists
      },
      profileImage: {
        type: DataTypes.STRING,
        field: 'profile_image'  // Map to database column
      },
      dateOfBirth: {
        type: DataTypes.DATE,
        field: 'date_of_birth'  // Map to database column
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
        defaultValue: false,
        field: 'email_verified'  // Separate field for email
      },
      whatsappEnabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'whatsapp_enabled'
      },
      whatsappNumber: {
        type: DataTypes.STRING,
        field: 'whatsapp_number'
      },
      notificationPreferences: {
        type: DataTypes.JSONB,
        field: 'notification_preferences',
        defaultValue: {
          urgent: ['mobile', 'whatsapp'],
          transactions: ['email', 'whatsapp'],
          marketing: ['email'],
          auth: ['mobile'],
          voice_auth: ['phone'],
          updates: ['email', 'whatsapp']
        }
      },
      contactMetadata: {
        type: DataTypes.JSONB,
        field: 'contact_metadata',
        defaultValue: {}
      },
      isMobileVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'mobile_verified'  // Now has its own column
      },
      isPhoneVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'phone_verified'  // For landline verification
      },
      isKycVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'kyc_verified'  // Different column name
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        field: 'is_active'  // Map to database column
      },
      isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'is_deleted'  // Map to database column
      },
      isBlocked: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'is_blocked'  // Map to database column
      },
      blockedReason: {
        type: DataTypes.STRING,
        field: 'blocked_reason'  // Map to database column
      },
      accountType: {
        type: DataTypes.STRING,
        defaultValue: 'personal',
        field: 'user_type'  // Maps to user_type
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
        defaultValue: false,
        field: 'require_mfa'  // Maps to require_mfa
      },
      lastLoginAt: {
        type: DataTypes.DATE,
        field: 'last_login'  // Maps to last_login
      },
      role: {
        type: DataTypes.STRING,
        defaultValue: 'basic_consumer'
        // Maps to 'role' column in database (default field name)
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
      },
      // Virtual field for verification requirements based on app type
      requiredVerifications: {
        type: DataTypes.VIRTUAL,
        get() {
          const primaryContact = this.get('primaryContact');
          const appType = this.get('appType') || 'consumer'; // Default to consumer

          const requirements = [];

          // Email-default apps (Enterprise & Admin) require email verification
          if (appType === 'enterprise' || appType === 'admin') {
            requirements.push('email');
          }

          // Mobile-default app (Consumer) requires mobile verification
          if (appType === 'consumer') {
            requirements.push('mobile');
          }

          // If primary contact is phone (landline), require phone verification
          if (primaryContact === 'phone') {
            requirements.push('phone');
          }

          // If primary contact is email, require email verification
          if (primaryContact === 'email' && !requirements.includes('email')) {
            requirements.push('email');
          }

          // If primary contact is whatsapp, require mobile verification (WhatsApp uses mobile)
          if (primaryContact === 'whatsapp' && !requirements.includes('mobile')) {
            requirements.push('mobile');
          }

          return requirements;
        }
      },
      // Helper to check if user meets verification requirements
      isFullyVerified: {
        type: DataTypes.VIRTUAL,
        get() {
          const requirements = this.get('requiredVerifications') || [];

          for (const req of requirements) {
            if (req === 'email' && !this.get('isEmailVerified')) return false;
            if (req === 'mobile' && !this.get('isMobileVerified')) return false;
            if (req === 'phone' && !this.get('isPhoneVerified')) return false;
          }

          return true;
        }
      }
    },
    {
      tableName: 'users',
      timestamps: true
      // underscored is inherited from global config (true)
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