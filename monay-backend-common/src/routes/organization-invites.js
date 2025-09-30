import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import authenticateToken from '../middleware-app/auth-middleware.js';
import models from '../models/index.js';
import userOnboardingHelper from '../helpers/user-onboarding-helper.js';
import Email from '../services/email.js';
import sms from '../services/sms.js';
import utility from '../services/utility.js';

const router = Router();

/**
 * @route POST /api/organizations/:id/invite
 * @desc Invite a new user to join organization
 * @access Private - Organization Admin/Owner only
 */
router.post('/:id/invite', authenticateToken, async (req, res) => {
  try {
    const organizationId = req.params.id;
    const inviterId = req.user.id;
    const {
      email,
      mobile,
      firstName,
      lastName,
      role = 'member',
      permissions = {},
      sendInvite = true
    } = req.body;

    // Verify inviter has permission to invite
    const inviterRole = await models.OrganizationUser.findOne({
      where: {
        organizationId,
        userId: inviterId,
        invitationStatus: 'active'
      }
    });

    if (!inviterRole || !['owner', 'admin'].includes(inviterRole.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to invite users to this organization'
      });
    }

    // Get organization details
    const organization = await models.Organization.findByPk(organizationId);
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    // Check if user already exists
    let existingUser = null;
    if (email) {
      existingUser = await models.User.findOne({
        where: { email: email.toLowerCase(), isDeleted: false }
      });
    } else if (mobile) {
      existingUser = await models.User.findOne({
        where: { mobile, isDeleted: false }
      });
    }

    if (existingUser) {
      // Check if already in organization
      const existingMember = await models.OrganizationUser.findOne({
        where: {
          organizationId,
          userId: existingUser.id
        }
      });

      if (existingMember) {
        return res.status(400).json({
          success: false,
          message: 'User is already a member of this organization'
        });
      }

      // Add existing user to organization
      await models.OrganizationUser.create({
        id: uuidv4(),
        organizationId,
        userId: existingUser.id,
        role,
        permissions: JSON.stringify(permissions),
        isPrimary: false,
        invitedBy: inviterId,
        invitationStatus: 'pending',
        joinedAt: new Date()
      });

      // Send invitation notification
      if (sendInvite) {
        if (existingUser.primaryContact === 'email' && existingUser.email) {
          await Email.sendOrganizationInvite({
            to: existingUser.email,
            name: `${existingUser.firstName} ${existingUser.lastName}`,
            organizationName: organization.name,
            inviterName: `${req.user.firstName} ${req.user.lastName}`,
            role
          });
        } else if (existingUser.primaryContact === 'mobile' && existingUser.mobile) {
          await sms.sendSMS(existingUser.mobile,
            `You've been invited to join ${organization.name} as ${role}. Login to Monay to accept.`
          );
        }
      }

      return res.json({
        success: true,
        message: 'Existing user invited to organization',
        data: {
          userId: existingUser.id,
          organizationId,
          role,
          invitationStatus: 'pending'
        }
      });
    }

    // Create invitation for new user
    const invitationCode = utility.generateRandomString(8);
    const invitationExpiry = new Date();
    invitationExpiry.setDate(invitationExpiry.getDate() + 7); // 7 days expiry

    // Store invitation (you might want to create an invitations table)
    const invitation = {
      id: uuidv4(),
      organizationId,
      email: email?.toLowerCase(),
      mobile,
      firstName,
      lastName,
      role,
      permissions: JSON.stringify(permissions),
      invitedBy: inviterId,
      invitationCode,
      expiresAt: invitationExpiry,
      status: 'pending'
    };

    // For now, we'll store in organization_users with pending status
    await models.OrganizationUser.create({
      id: invitation.id,
      organizationId,
      userId: invitationCode, // Temporary - will be replaced when user signs up
      role,
      permissions: JSON.stringify(permissions),
      isPrimary: false,
      invitedBy: inviterId,
      invitationStatus: 'invited'
    });

    // Send invitation
    if (sendInvite) {
      const inviteLink = `${process.env.FRONTEND_URL}/signup?invite=${invitationCode}&org=${organizationId}`;

      if (email) {
        await Email.sendOrganizationInvite({
          to: email,
          name: `${firstName} ${lastName}`,
          organizationName: organization.name,
          inviterName: `${req.user.firstName} ${req.user.lastName}`,
          role,
          inviteLink
        });
      } else if (mobile) {
        await sms.sendSMS(mobile,
          `${req.user.firstName} invited you to join ${organization.name}. Sign up at: ${inviteLink}`
        );
      }
    }

    res.json({
      success: true,
      message: 'Invitation sent successfully',
      data: {
        invitationId: invitation.id,
        invitationCode,
        expiresAt: invitationExpiry,
        organizationName: organization.name
      }
    });
  } catch (error) {
    console.error('Error inviting user to organization:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send invitation',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route POST /api/organizations/accept-invite
 * @desc Accept organization invitation during signup
 * @access Public (with valid invitation code)
 */
router.post('/accept-invite', async (req, res) => {
  try {
    const {
      invitationCode,
      email,
      mobile,
      firstName,
      lastName,
      password,
      deviceType
    } = req.body;

    if (!invitationCode) {
      return res.status(400).json({
        success: false,
        message: 'Invitation code is required'
      });
    }

    // Find the invitation
    const invitation = await models.OrganizationUser.findOne({
      where: {
        userId: invitationCode, // We stored the code temporarily in userId
        invitationStatus: 'invited'
      },
      include: [{
        model: models.Organization,
        as: 'organization'
      }]
    });

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: 'Invalid or expired invitation code'
      });
    }

    // Check if user already exists
    let user = null;
    if (email) {
      user = await models.User.findOne({
        where: { email: email.toLowerCase(), isDeleted: false }
      });
    } else if (mobile) {
      user = await models.User.findOne({
        where: { mobile, isDeleted: false }
      });
    }

    if (user) {
      // Update the invitation with actual user ID
      await invitation.update({
        userId: user.id,
        invitationStatus: 'active'
      });
    } else {
      // Create new user with organization context
      const userData = {
        id: uuidv4(),
        firstName,
        lastName,
        email: email?.toLowerCase(),
        mobile,
        password, // Will be hashed in the repository
        deviceType,
        isActive: true,
        isDeleted: false
      };

      // Apply organization member rules using the helper
      const processedUserData = userOnboardingHelper.applyOrganizationMemberRules(
        userData,
        invitation.organization,
        invitation.role
      );

      // Create the user
      user = await models.User.create(processedUserData);

      // Update the invitation with actual user ID
      await invitation.update({
        userId: user.id,
        invitationStatus: 'active'
      });

      // Generate QR code and account number
      await accountRepository.generateQrCode(user.id);
      await accountRepository.generateAccounNumber(user.id);

      // Create notification
      await notificationRepository.newUser(req, { userId: user.id });
    }

    res.json({
      success: true,
      message: 'Successfully joined organization',
      data: {
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          mobile: user.mobile,
          userType: user.userType
        },
        organization: {
          id: invitation.organization.id,
          name: invitation.organization.name,
          role: invitation.role
        }
      }
    });
  } catch (error) {
    console.error('Error accepting organization invitation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to accept invitation',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route GET /api/organizations/:id/invitations
 * @desc Get pending invitations for an organization
 * @access Private - Organization Admin/Owner only
 */
router.get('/:id/invitations', authenticateToken, async (req, res) => {
  try {
    const organizationId = req.params.id;
    const userId = req.user.id;

    // Verify user has permission
    const userRole = await models.OrganizationUser.findOne({
      where: {
        organizationId,
        userId,
        invitationStatus: 'active'
      }
    });

    if (!userRole || !['owner', 'admin'].includes(userRole.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view invitations'
      });
    }

    // Get pending invitations
    const invitations = await models.OrganizationUser.findAll({
      where: {
        organizationId,
        invitationStatus: ['invited', 'pending']
      },
      include: [{
        model: models.User,
        as: 'inviter',
        attributes: ['id', 'firstName', 'lastName', 'email']
      }],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: invitations
    });
  } catch (error) {
    console.error('Error fetching invitations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch invitations',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;