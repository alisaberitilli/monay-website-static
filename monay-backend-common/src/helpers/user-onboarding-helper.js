import models from '../models/index.js';

/**
 * User Onboarding Helper
 * Ensures consistent contact preferences and profile setup across all user creation paths
 */

export default {
  /**
   * Set user contact preferences based on application context
   * @param {Object} userData - User data object
   * @param {Object} req - Request object for context
   * @returns {Object} - Updated user data with contact preferences
   */
  setContactPreferences(userData, req) {
    // Determine application context from origin or headers
    const origin = req.headers.origin || req.headers.referer || '';
    const appContext = this.getAppContext(origin);

    // Initialize contact metadata if not present
    if (!userData.contactMetadata) {
      userData.contactMetadata = {
        preferredChannel: null,
        alternativeChannels: [],
        verificationRequired: [],
        lastUpdated: new Date()
      };
    }

    // Set primary contact based on application type
    if (!userData.primaryContact) {
      switch (appContext) {
        case 'consumer':
          userData.primaryContact = 'mobile';
          userData.contactMetadata.preferredChannel = 'sms';
          userData.contactMetadata.verificationRequired = ['mobile'];
          break;
        case 'enterprise':
        case 'admin':
          userData.primaryContact = 'email';
          userData.contactMetadata.preferredChannel = 'email';
          userData.contactMetadata.verificationRequired = ['email'];
          break;
        default:
          // Default to mobile for consumer-focused platform
          userData.primaryContact = userData.mobile ? 'mobile' : 'email';
          userData.contactMetadata.preferredChannel = userData.mobile ? 'sms' : 'email';
          userData.contactMetadata.verificationRequired = [userData.primaryContact];
      }
    }

    // Initialize WhatsApp if mobile is provided
    if (userData.mobile && !userData.whatsappNumber) {
      userData.whatsappEnabled = true;
      userData.whatsappNumber = userData.mobile;
      userData.contactMetadata.alternativeChannels.push('whatsapp');
    }

    // Set notification preferences based on primary contact
    if (!userData.notificationPreferences) {
      userData.notificationPreferences = this.getDefaultNotificationPreferences(userData.primaryContact);
    }

    // Ensure verification flags are initialized
    userData.emailVerified = userData.emailVerified || false;
    userData.mobileVerified = userData.mobileVerified || false;
    userData.phoneVerified = userData.phoneVerified || false;

    return userData;
  },

  /**
   * Get application context from origin
   * @param {String} origin - Request origin
   * @returns {String} - Application context
   */
  getAppContext(origin) {
    if (origin.includes(':3003')) return 'consumer';
    if (origin.includes(':3007')) return 'enterprise';
    if (origin.includes(':3002')) return 'admin';
    // Check for mobile apps
    if (origin.includes('monay-consumer')) return 'consumer';
    if (origin.includes('monay-enterprise')) return 'enterprise';
    return 'consumer'; // Default to consumer
  },

  /**
   * Get default notification preferences based on primary contact
   * @param {String} primaryContact - Primary contact method
   * @returns {Object} - Notification preferences
   */
  getDefaultNotificationPreferences(primaryContact) {
    const basePreferences = {
      urgent: [],
      transactions: [],
      marketing: [],
      auth: [],
      updates: []
    };

    if (primaryContact === 'mobile') {
      return {
        ...basePreferences,
        urgent: ['mobile', 'whatsapp'],
        transactions: ['mobile', 'email', 'whatsapp'],
        marketing: ['email', 'whatsapp'],
        auth: ['mobile'],
        updates: ['email', 'whatsapp']
      };
    } else {
      return {
        ...basePreferences,
        urgent: ['email', 'mobile'],
        transactions: ['email'],
        marketing: ['email'],
        auth: ['email', 'mobile'],
        updates: ['email']
      };
    }
  },

  /**
   * Apply onboarding rules for secondary users
   * @param {Object} secondaryUserData - Secondary user data
   * @param {Object} primaryUser - Primary user object
   * @returns {Object} - Updated secondary user data
   */
  applySecondaryUserRules(secondaryUserData, primaryUser) {
    // Secondary users inherit some preferences from primary
    secondaryUserData.primaryContact = primaryUser.primaryContact;

    // But maintain their own contact details
    if (secondaryUserData.mobile && !secondaryUserData.whatsappNumber) {
      secondaryUserData.whatsappEnabled = true;
      secondaryUserData.whatsappNumber = secondaryUserData.mobile;
    }

    // Secondary users have limited notification preferences
    secondaryUserData.notificationPreferences = {
      urgent: [secondaryUserData.primaryContact],
      transactions: [secondaryUserData.primaryContact],
      marketing: [], // No marketing for secondary users
      auth: [secondaryUserData.primaryContact],
      updates: [] // Updates go to primary user
    };

    // Set user type
    secondaryUserData.userType = 'secondary_user';
    secondaryUserData.accountType = 'secondary';

    return secondaryUserData;
  },

  /**
   * Apply onboarding rules for organization members
   * @param {Object} userData - User data
   * @param {Object} organization - Organization object
   * @param {String} role - User role in organization
   * @returns {Object} - Updated user data
   */
  applyOrganizationMemberRules(userData, organization, role) {
    // Organization members use email as primary
    userData.primaryContact = 'email';
    userData.contactMetadata = {
      preferredChannel: 'email',
      alternativeChannels: ['mobile'],
      verificationRequired: ['email'],
      organization: organization.name,
      organizationRole: role,
      lastUpdated: new Date()
    };

    // Set notification preferences for organization members
    userData.notificationPreferences = {
      urgent: ['email', 'mobile'],
      transactions: ['email'],
      marketing: role === 'admin' ? ['email'] : [],
      auth: ['email', 'mobile'],
      updates: ['email'],
      organizationAlerts: ['email'] // Special category for org members
    };

    // Set user type based on role
    if (role === 'owner' || role === 'admin') {
      userData.userType = 'enterprise_admin';
    } else {
      userData.userType = 'enterprise_user';
    }

    return userData;
  },

  /**
   * Validate required fields for user creation
   * @param {Object} userData - User data to validate
   * @param {String} context - Creation context (signup, secondary, organization)
   * @returns {Object} - Validation result
   */
  validateUserData(userData, context) {
    const errors = [];

    // Common required fields
    if (!userData.firstName) errors.push('First name is required');
    if (!userData.lastName) errors.push('Last name is required');

    // Context-specific validation
    switch (context) {
      case 'signup':
        if (!userData.email && !userData.mobile) {
          errors.push('Either email or mobile number is required');
        }
        if (!userData.password) errors.push('Password is required');
        break;

      case 'secondary':
        if (!userData.mobile) errors.push('Mobile number is required for secondary users');
        break;

      case 'organization':
        if (!userData.email) errors.push('Email is required for organization members');
        break;
    }

    return {
      valid: errors.length === 0,
      errors
    };
  },

  /**
   * Create user with consistent onboarding
   * @param {Object} userData - User data
   * @param {Object} options - Creation options
   * @returns {Object} - Created user
   */
  async createUser(userData, options = {}) {
    const { context = 'signup', req, primaryUser, organization, role } = options;

    // Validate user data
    const validation = this.validateUserData(userData, context);
    if (!validation.valid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    // Apply context-specific rules
    if (context === 'secondary' && primaryUser) {
      userData = this.applySecondaryUserRules(userData, primaryUser);
    } else if (context === 'organization' && organization) {
      userData = this.applyOrganizationMemberRules(userData, organization, role);
    } else if (req) {
      userData = this.setContactPreferences(userData, req);
    }

    // Create the user
    const user = await models.User.create(userData);

    // Handle post-creation setup
    if (context === 'secondary' && primaryUser) {
      // Create child-parent relationship
      await models.ChildParent.create({
        parentId: primaryUser.id,
        userId: user.id,
        limit: options.limit || 500,
        remainAmount: options.limit || 500,
        status: 'inactive',
        relationship: options.relationship || 'child',
        isParentVerified: false
      });
    } else if (context === 'organization' && organization) {
      // Add user to organization
      await models.OrganizationUser.create({
        organizationId: organization.id,
        userId: user.id,
        role: role || 'member',
        permissions: options.permissions || {},
        isPrimary: false,
        invitedBy: options.invitedBy,
        invitationStatus: 'pending'
      });
    }

    return user;
  },

  /**
   * Update user contact preferences
   * @param {String} userId - User ID
   * @param {Object} preferences - New preferences
   * @returns {Object} - Updated user
   */
  async updateContactPreferences(userId, preferences) {
    const user = await models.User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Update primary contact if changed
    if (preferences.primaryContact) {
      user.primaryContact = preferences.primaryContact;
    }

    // Update notification preferences
    if (preferences.notificationPreferences) {
      user.notificationPreferences = {
        ...user.notificationPreferences,
        ...preferences.notificationPreferences
      };
    }

    // Update contact metadata
    if (preferences.contactMetadata) {
      user.contactMetadata = {
        ...user.contactMetadata,
        ...preferences.contactMetadata,
        lastUpdated: new Date()
      };
    }

    await user.save();
    return user;
  }
};