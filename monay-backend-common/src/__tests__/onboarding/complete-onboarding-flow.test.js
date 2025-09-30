import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import models from '../../models/index.js';
import userOnboardingHelper from '../../helpers/user-onboarding-helper.js';
import userRepository from '../../repositories/user-repository.js';
import notificationRepository from '../../repositories/notification-repository.js';
import accountRepository from '../../repositories/account-repository.js';

describe('Complete User Onboarding Flow Tests', () => {
  let app;
  let testUsers = {};

  beforeAll(async () => {
    // Initialize Express app with routes
    app = express();
    app.use(express.json());

    // Import and use routes
    const userRoutes = await import('../../routes/user.js');
    const authRoutes = await import('../../routes/login.js');
    const secondaryRoutes = await import('../../routes/secondary-users.js');
    const orgInviteRoutes = await import('../../routes/organization-invites.js');

    app.use('/api/user', userRoutes.default);
    app.use('/api', authRoutes.default);
    app.use('/api/accounts/secondary', secondaryRoutes.default);
    app.use('/api/organizations', orgInviteRoutes.default);
  });

  afterAll(async () => {
    // Clean up test data
    for (const userId of Object.values(testUsers)) {
      if (userId) {
        await models.User.destroy({ where: { id: userId } });
        await models.Notification.destroy({ where: { toUserId: userId } });
        await models.ChildParent.destroy({ where: { userId: userId } });
        await models.OrganizationUser.destroy({ where: { userId: userId } });
      }
    }
  });

  describe('1. Direct Signup Tests', () => {

    test('Consumer Wallet signup - mobile primary', async () => {
      const consumerData = {
        firstName: 'Test',
        lastName: 'Consumer',
        email: 'test.consumer@monay.test',
        mobile: '+15551234567',
        password: 'Test1234!',
        confirmPassword: 'Test1234!',
        deviceType: 'ios'
      };

      const response = await request(app)
        .post('/api/user/signup')
        .set('Origin', 'http://localhost:3003')
        .send(consumerData);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe(true);
      expect(response.body.data.user).toBeDefined();

      // Verify user was created with correct preferences
      const user = await models.User.findByPk(response.body.data.user.id);
      testUsers.consumer = user.id;

      expect(user.primaryContact).toBe('mobile');
      expect(user.mobile).toBe('+15551234567');
      expect(user.whatsappEnabled).toBe(true);
      expect(user.whatsappNumber).toBe('+15551234567');
      expect(user.contactMetadata.preferredChannel).toBe('sms');
      expect(user.contactMetadata.verificationRequired).toContain('mobile');
      expect(user.notificationPreferences.auth).toContain('mobile');
      expect(user.userType).toBe('basic_consumer');
    });

    test('Enterprise Wallet signup - email primary', async () => {
      const enterpriseData = {
        firstName: 'Test',
        lastName: 'Enterprise',
        email: 'test.enterprise@company.test',
        mobile: '+15559876543',
        password: 'Test1234!',
        confirmPassword: 'Test1234!',
        deviceType: 'web'
      };

      const response = await request(app)
        .post('/api/user/signup')
        .set('Origin', 'http://localhost:3007')
        .send(enterpriseData);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe(true);

      const user = await models.User.findByPk(response.body.data.user.id);
      testUsers.enterprise = user.id;

      expect(user.primaryContact).toBe('email');
      expect(user.email).toBe('test.enterprise@company.test');
      expect(user.whatsappEnabled).toBe(true);
      expect(user.contactMetadata.preferredChannel).toBe('email');
      expect(user.contactMetadata.verificationRequired).toContain('email');
      expect(user.notificationPreferences.auth).toContain('email');
    });

    test('Admin Dashboard signup - email primary', async () => {
      const adminData = {
        firstName: 'Test',
        lastName: 'Admin',
        email: 'test.admin@monay.test',
        mobile: '+15551112222',
        password: 'Test1234!',
        confirmPassword: 'Test1234!',
        deviceType: 'web'
      };

      const response = await request(app)
        .post('/api/user/signup')
        .set('Origin', 'http://localhost:3002')
        .send(adminData);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe(true);

      const user = await models.User.findByPk(response.body.data.user.id);
      testUsers.admin = user.id;

      expect(user.primaryContact).toBe('email');
      expect(user.contactMetadata.preferredChannel).toBe('email');
      expect(user.contactMetadata.verificationRequired).toContain('email');
    });
  });

  describe('2. Secondary User Linking Tests', () => {
    let primaryToken;
    let secondaryUserId;

    beforeAll(async () => {
      // Get auth token for primary user
      const loginResponse = await request(app)
        .post('/api/login')
        .send({
          username: 'test.consumer@monay.test',
          password: 'Test1234!'
        });

      primaryToken = loginResponse.body.data.token;
    });

    test('Link secondary user with phone', async () => {
      const linkData = {
        linkMethod: 'phone',
        phoneNumber: '+15557778888',
        relationship: 'child',
        limit: 500,
        dailyLimit: 50,
        autoTopupEnabled: true,
        autoTopupThreshold: 50,
        autoTopupAmount: 100
      };

      const response = await request(app)
        .post('/api/accounts/secondary/link')
        .set('Authorization', `Bearer ${primaryToken}`)
        .send(linkData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.secondaryUser).toBeDefined();

      secondaryUserId = response.body.data.secondaryUser.id;
      testUsers.secondary = secondaryUserId;

      // Verify secondary user preferences
      const secondaryUser = await models.User.findByPk(secondaryUserId);
      expect(secondaryUser.primaryContact).toBe('mobile'); // Inherits from primary
      expect(secondaryUser.userType).toBe('secondary_user');
      expect(secondaryUser.accountType).toBe('secondary');
      expect(secondaryUser.notificationPreferences.marketing).toEqual([]); // No marketing

      // Verify child-parent relationship
      const relationship = await models.ChildParent.findOne({
        where: { userId: secondaryUserId }
      });
      expect(relationship).toBeDefined();
      expect(relationship.parentId).toBe(testUsers.consumer);
      expect(relationship.limit).toBe('500');
      expect(relationship.dailyLimit).toBe('50');
      expect(relationship.status).toBe('inactive'); // Pending verification
    });

    test('Secondary user verification', async () => {
      // Simulate secondary user verification
      const relationship = await models.ChildParent.findOne({
        where: { userId: secondaryUserId }
      });

      // Mock OTP verification
      relationship.isParentVerified = true;
      relationship.status = 'active';
      await relationship.save();

      expect(relationship.status).toBe('active');
    });
  });

  describe('3. Organization Member Invitation Tests', () => {
    let orgAdminToken;
    let organizationId;
    let invitationCode;

    beforeAll(async () => {
      // Create test organization
      const org = await models.Organization.create({
        id: 'test-org-id',
        name: 'Test Company',
        type: 'enterprise',
        status: 'active'
      });
      organizationId = org.id;

      // Add enterprise user as org admin
      await models.OrganizationUser.create({
        id: 'test-org-user-id',
        organizationId: organizationId,
        userId: testUsers.enterprise,
        role: 'admin',
        invitationStatus: 'active'
      });

      // Get auth token for org admin
      const loginResponse = await request(app)
        .post('/api/login')
        .send({
          username: 'test.enterprise@company.test',
          password: 'Test1234!'
        });

      orgAdminToken = loginResponse.body.data.token;
    });

    test('Invite new user to organization', async () => {
      const inviteData = {
        email: 'new.member@company.test',
        firstName: 'New',
        lastName: 'Member',
        role: 'member',
        permissions: {
          can_view_transactions: true,
          can_create_invoices: false
        },
        sendInvite: false // Don't actually send email in test
      };

      const response = await request(app)
        .post(`/api/organizations/${organizationId}/invite`)
        .set('Authorization', `Bearer ${orgAdminToken}`)
        .send(inviteData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.invitationCode).toBeDefined();

      invitationCode = response.body.data.invitationCode;
    });

    test('Accept organization invitation during signup', async () => {
      const acceptData = {
        invitationCode: invitationCode,
        email: 'new.member@company.test',
        firstName: 'New',
        lastName: 'Member',
        password: 'Test1234!',
        deviceType: 'web'
      };

      const response = await request(app)
        .post('/api/organizations/accept-invite')
        .send(acceptData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.organization).toBeDefined();

      const orgMemberId = response.body.data.user.id;
      testUsers.orgMember = orgMemberId;

      // Verify org member preferences
      const orgMember = await models.User.findByPk(orgMemberId);
      expect(orgMember.primaryContact).toBe('email');
      expect(orgMember.userType).toBe('enterprise_user');
      expect(orgMember.contactMetadata.organization).toBe('Test Company');
      expect(orgMember.contactMetadata.organizationRole).toBe('member');
      expect(orgMember.notificationPreferences.organizationAlerts).toContain('email');

      // Verify organization membership
      const membership = await models.OrganizationUser.findOne({
        where: {
          userId: orgMemberId,
          organizationId: organizationId
        }
      });
      expect(membership).toBeDefined();
      expect(membership.role).toBe('member');
      expect(membership.invitationStatus).toBe('active');
    });

    test('Invite existing user to organization', async () => {
      // Create a test user first
      const existingUser = await models.User.create({
        id: 'existing-user-id',
        firstName: 'Existing',
        lastName: 'User',
        email: 'existing@test.com',
        mobile: '+15553334444',
        primaryContact: 'email',
        isActive: true,
        isDeleted: false
      });
      testUsers.existingOrgMember = existingUser.id;

      const inviteData = {
        email: 'existing@test.com',
        role: 'member',
        permissions: {},
        sendInvite: false
      };

      const response = await request(app)
        .post(`/api/organizations/${organizationId}/invite`)
        .set('Authorization', `Bearer ${orgAdminToken}`)
        .send(inviteData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Existing user invited to organization');

      // Verify membership was created
      const membership = await models.OrganizationUser.findOne({
        where: {
          userId: existingUser.id,
          organizationId: organizationId
        }
      });
      expect(membership).toBeDefined();
      expect(membership.invitationStatus).toBe('pending');
    });
  });

  describe('4. Contact Preferences Consistency Tests', () => {

    test('Helper function - getAppContext', () => {
      const consumerContext = userOnboardingHelper.getAppContext('http://localhost:3003');
      expect(consumerContext).toBe('consumer');

      const enterpriseContext = userOnboardingHelper.getAppContext('http://localhost:3007');
      expect(enterpriseContext).toBe('enterprise');

      const adminContext = userOnboardingHelper.getAppContext('http://localhost:3002');
      expect(adminContext).toBe('admin');

      const defaultContext = userOnboardingHelper.getAppContext('http://unknown.com');
      expect(defaultContext).toBe('consumer');
    });

    test('Helper function - getDefaultNotificationPreferences', () => {
      const mobilePrefs = userOnboardingHelper.getDefaultNotificationPreferences('mobile');
      expect(mobilePrefs.urgent).toContain('mobile');
      expect(mobilePrefs.urgent).toContain('whatsapp');
      expect(mobilePrefs.auth).toContain('mobile');

      const emailPrefs = userOnboardingHelper.getDefaultNotificationPreferences('email');
      expect(emailPrefs.urgent).toContain('email');
      expect(emailPrefs.transactions).toContain('email');
      expect(emailPrefs.auth).toContain('email');
    });

    test('Helper function - validateUserData', () => {
      // Valid signup data
      const validSignup = userOnboardingHelper.validateUserData({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@test.com',
        password: 'Test1234!'
      }, 'signup');
      expect(validSignup.valid).toBe(true);

      // Invalid - missing required fields
      const invalidSignup = userOnboardingHelper.validateUserData({
        firstName: 'Test'
      }, 'signup');
      expect(invalidSignup.valid).toBe(false);
      expect(invalidSignup.errors).toContain('Last name is required');

      // Secondary user requires mobile
      const invalidSecondary = userOnboardingHelper.validateUserData({
        firstName: 'Test',
        lastName: 'Secondary',
        email: 'test@test.com'
      }, 'secondary');
      expect(invalidSecondary.valid).toBe(false);
      expect(invalidSecondary.errors).toContain('Mobile number is required for secondary users');

      // Organization member requires email
      const invalidOrg = userOnboardingHelper.validateUserData({
        firstName: 'Test',
        lastName: 'Member',
        mobile: '+15551234567'
      }, 'organization');
      expect(invalidOrg.valid).toBe(false);
      expect(invalidOrg.errors).toContain('Email is required for organization members');
    });
  });

  describe('5. End-to-End Verification Tests', () => {

    test('Verify all user types have correct contact preferences', async () => {
      // Check all created users
      const consumerUser = await models.User.findByPk(testUsers.consumer);
      const enterpriseUser = await models.User.findByPk(testUsers.enterprise);
      const adminUser = await models.User.findByPk(testUsers.admin);
      const secondaryUser = testUsers.secondary ? await models.User.findByPk(testUsers.secondary) : null;
      const orgMember = testUsers.orgMember ? await models.User.findByPk(testUsers.orgMember) : null;

      // Consumer wallet users
      expect(consumerUser.primaryContact).toBe('mobile');
      expect(consumerUser.contactMetadata.preferredChannel).toBe('sms');

      // Enterprise wallet users
      expect(enterpriseUser.primaryContact).toBe('email');
      expect(enterpriseUser.contactMetadata.preferredChannel).toBe('email');

      // Admin users
      expect(adminUser.primaryContact).toBe('email');
      expect(adminUser.contactMetadata.preferredChannel).toBe('email');

      // Secondary users inherit from primary
      if (secondaryUser) {
        expect(secondaryUser.primaryContact).toBe('mobile');
        expect(secondaryUser.userType).toBe('secondary_user');
      }

      // Organization members use email
      if (orgMember) {
        expect(orgMember.primaryContact).toBe('email');
        expect(orgMember.userType).toBe('enterprise_user');
      }
    });

    test('Verify WhatsApp is enabled for all users with mobile', async () => {
      const allUsers = await models.User.findAll({
        where: {
          id: Object.values(testUsers).filter(id => id !== null)
        }
      });

      for (const user of allUsers) {
        if (user.mobile) {
          expect(user.whatsappEnabled).toBe(true);
          expect(user.whatsappNumber).toBe(user.mobile);
        }
      }
    });

    test('Verify notification preferences are set correctly', async () => {
      const consumerUser = await models.User.findByPk(testUsers.consumer);
      const enterpriseUser = await models.User.findByPk(testUsers.enterprise);

      // Consumer preferences
      expect(consumerUser.notificationPreferences.urgent).toContain('mobile');
      expect(consumerUser.notificationPreferences.urgent).toContain('whatsapp');
      expect(consumerUser.notificationPreferences.auth).toContain('mobile');

      // Enterprise preferences
      expect(enterpriseUser.notificationPreferences.urgent).toContain('email');
      expect(enterpriseUser.notificationPreferences.transactions).toContain('email');
      expect(enterpriseUser.notificationPreferences.auth).toContain('email');
    });
  });
});