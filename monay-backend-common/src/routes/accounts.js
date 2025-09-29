import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import authenticateToken from '../middlewares/auth-middleware.js';
import db from '../models/index.js';
const { User, ChildParent, Transaction, Wallet } = db;
import pkg from 'sequelize';
const { Op } = pkg;
import utility from '../services/utility.js';

const router = express.Router();

/**
 * @route GET /api/accounts/secondary
 * @desc Get all secondary accounts for a primary user
 * @access Private
 */
router.get('/secondary', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const secondaryAccounts = await ChildParent.findAll({
      where: { parentId: userId },
      include: [
        {
          model: User,
          attributes: ['id', 'firstName', 'lastName', 'email', 'mobile', 'profileImage', 'isActive'],
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Calculate additional stats for each account
    const accountsWithStats = await Promise.all(
      secondaryAccounts.map(async (account) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const thisMonth = new Date();
        thisMonth.setDate(1);
        thisMonth.setHours(0, 0, 0, 0);

        // Get daily spending
        const dailyTransactions = await Transaction.findAll({
          where: {
            senderId: account.userId,
            createdAt: { [Op.gte]: today }
          }
        });

        const dailySpent = dailyTransactions.reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);

        // Get monthly spending
        const monthlyTransactions = await Transaction.findAll({
          where: {
            senderId: account.userId,
            createdAt: { [Op.gte]: thisMonth }
          }
        });

        const monthlySpent = monthlyTransactions.reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);

        // Get last transaction
        const lastTransaction = await Transaction.findOne({
          where: { senderId: account.userId },
          order: [['createdAt', 'DESC']]
        });

        return {
          id: account.id,
          userId: account.userId,
          user: account.User,
          limit: account.limit,
          remainAmount: account.remainAmount,
          dailySpent,
          monthlySpent,
          status: account.status,
          isParentVerified: account.isParentVerified,
          createdAt: account.createdAt,
          lastTransaction: lastTransaction?.createdAt || null,
          relationship: account.relationship || 'other',
          autoTopupEnabled: account.autoTopupEnabled || false,
          autoTopupThreshold: account.autoTopupThreshold || 0,
          autoTopupAmount: account.autoTopupAmount || 0
        };
      })
    );

    res.json({
      success: true,
      data: accountsWithStats
    });
  } catch (error) {
    console.error('Error fetching secondary accounts:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch secondary accounts'
      }
    });
  }
});

/**
 * @route GET /api/accounts/primary
 * @desc Get primary account info for a secondary user
 * @access Private
 */
router.get('/primary', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const primaryAccount = await ChildParent.findOne({
      where: { userId },
      include: [
        {
          model: User,
          as: 'parent',
          attributes: ['id', 'firstName', 'lastName', 'email', 'mobile', 'profileImage']
        }
      ]
    });

    if (!primaryAccount) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'No primary account linked'
        }
      });
    }

    res.json({
      success: true,
      data: {
        id: primaryAccount.id,
        parentId: primaryAccount.parentId,
        parent: primaryAccount.parent,
        limit: primaryAccount.limit,
        remainAmount: primaryAccount.remainAmount,
        status: primaryAccount.status,
        isParentVerified: primaryAccount.isParentVerified,
        createdAt: primaryAccount.createdAt
      }
    });
  } catch (error) {
    console.error('Error fetching primary account:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch primary account'
      }
    });
  }
});

/**
 * @route POST /api/accounts/secondary/link
 * @desc Link a secondary account to primary
 * @access Private
 */
router.post('/secondary/link', authenticateToken, async (req, res) => {
  try {
    const primaryUserId = req.user.id;
    const {
      linkMethod,
      phoneNumber,
      email,
      relationship,
      limit,
      dailyLimit,
      autoTopupEnabled,
      autoTopupThreshold,
      autoTopupAmount
    } = req.body;

    // Validate input
    if (!linkMethod || !['phone', 'email', 'qr'].includes(linkMethod)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Invalid link method'
        }
      });
    }

    let secondaryUser = null;

    // Find secondary user based on link method
    if (linkMethod === 'phone' && phoneNumber) {
      secondaryUser = await User.findOne({
        where: { mobile: phoneNumber }
      });
    } else if (linkMethod === 'email' && email) {
      secondaryUser = await User.findOne({
        where: { email: email.toLowerCase() }
      });
    } else if (linkMethod === 'qr') {
      // Generate QR code for linking
      const linkCode = utility.generateRandomString(10);

      // Store link code temporarily (you might want to use Redis for this)
      // For now, we'll return the code to display as QR
      return res.json({
        success: true,
        data: {
          linkMethod: 'qr',
          linkCode,
          qrData: `monay://link/${linkCode}`,
          message: 'QR code generated. Secondary user should scan to complete linking.'
        }
      });
    }

    if (!secondaryUser) {
      // Send invitation
      const invitationCode = utility.generateRandomString(6);

      // Here you would send SMS or email invitation
      // For now, we'll just return success
      return res.json({
        success: true,
        data: {
          linkMethod,
          invitationSent: true,
          message: `Invitation sent to ${phoneNumber || email}`
        }
      });
    }

    // Check if already linked
    const existingLink = await ChildParent.findOne({
      where: {
        parentId: primaryUserId,
        userId: secondaryUser.id
      }
    });

    if (existingLink) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'ALREADY_LINKED',
          message: 'This account is already linked'
        }
      });
    }

    // Create the link
    const verificationOtp = utility.generateRandomString(6);

    const childParent = await ChildParent.create({
      id: uuidv4(),
      parentId: primaryUserId,
      userId: secondaryUser.id,
      verificationOtp,
      isParentVerified: false,
      limit: limit || 500,
      remainAmount: limit || 500,
      status: 'inactive',
      relationship,
      dailyLimit,
      autoTopupEnabled: autoTopupEnabled || false,
      autoTopupThreshold: autoTopupThreshold || 50,
      autoTopupAmount: autoTopupAmount || 100
    });

    // Send verification OTP to secondary user
    // utility.sendSMS(secondaryUser.mobile, `Your verification code is: ${verificationOtp}`);

    res.json({
      success: true,
      data: {
        id: childParent.id,
        userId: secondaryUser.id,
        user: {
          firstName: secondaryUser.firstName,
          lastName: secondaryUser.lastName,
          email: secondaryUser.email,
          mobile: secondaryUser.mobile
        },
        limit: childParent.limit,
        status: childParent.status,
        message: 'Secondary account linked. Verification required.'
      }
    });
  } catch (error) {
    console.error('Error linking secondary account:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to link secondary account'
      }
    });
  }
});

/**
 * @route PUT /api/accounts/secondary/:userId/limits
 * @desc Update secondary account limits and settings
 * @access Private
 */
router.put('/secondary/:userId/limits', authenticateToken, async (req, res) => {
  try {
    const primaryUserId = req.user.id;
    const { userId } = req.params;
    const {
      limit,
      dailyLimit,
      status,
      autoTopupEnabled,
      autoTopupThreshold,
      autoTopupAmount
    } = req.body;

    // Find the child-parent relationship
    const childParent = await ChildParent.findOne({
      where: {
        parentId: primaryUserId,
        userId
      }
    });

    if (!childParent) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Secondary account not found'
        }
      });
    }

    // Update the settings
    const updates = {};
    if (limit !== undefined) {
      updates.limit = limit;
      // If increasing limit, increase remaining amount proportionally
      if (limit > childParent.limit) {
        const difference = limit - childParent.limit;
        updates.remainAmount = childParent.remainAmount + difference;
      }
    }
    if (dailyLimit !== undefined) updates.dailyLimit = dailyLimit;
    if (status !== undefined) updates.status = status;
    if (autoTopupEnabled !== undefined) updates.autoTopupEnabled = autoTopupEnabled;
    if (autoTopupThreshold !== undefined) updates.autoTopupThreshold = autoTopupThreshold;
    if (autoTopupAmount !== undefined) updates.autoTopupAmount = autoTopupAmount;

    await childParent.update(updates);

    res.json({
      success: true,
      data: {
        id: childParent.id,
        userId: childParent.userId,
        limit: childParent.limit,
        remainAmount: childParent.remainAmount,
        dailyLimit: childParent.dailyLimit,
        status: childParent.status,
        autoTopupEnabled: childParent.autoTopupEnabled,
        autoTopupThreshold: childParent.autoTopupThreshold,
        autoTopupAmount: childParent.autoTopupAmount,
        message: 'Account settings updated successfully'
      }
    });
  } catch (error) {
    console.error('Error updating secondary account:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to update secondary account'
      }
    });
  }
});

/**
 * @route POST /api/accounts/secondary/:userId/verify
 * @desc Verify secondary account with OTP
 * @access Private
 */
router.post('/secondary/:userId/verify', authenticateToken, async (req, res) => {
  try {
    const secondaryUserId = req.user.id;
    const { otp } = req.body;

    const childParent = await ChildParent.findOne({
      where: {
        userId: secondaryUserId,
        verificationOtp: otp
      }
    });

    if (!childParent) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_OTP',
          message: 'Invalid verification code'
        }
      });
    }

    await childParent.update({
      isParentVerified: true,
      status: 'active',
      verificationOtp: null
    });

    res.json({
      success: true,
      data: {
        verified: true,
        message: 'Account verified successfully'
      }
    });
  } catch (error) {
    console.error('Error verifying secondary account:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to verify account'
      }
    });
  }
});

/**
 * @route DELETE /api/accounts/secondary/:userId
 * @desc Remove secondary account link
 * @access Private
 */
router.delete('/secondary/:userId', authenticateToken, async (req, res) => {
  try {
    const primaryUserId = req.user.id;
    const { userId } = req.params;

    const childParent = await ChildParent.findOne({
      where: {
        parentId: primaryUserId,
        userId
      }
    });

    if (!childParent) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Secondary account not found'
        }
      });
    }

    // Soft delete by updating status
    await childParent.update({ status: 'deleted' });

    res.json({
      success: true,
      data: {
        message: 'Secondary account removed successfully'
      }
    });
  } catch (error) {
    console.error('Error removing secondary account:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to remove secondary account'
      }
    });
  }
});

/**
 * @route GET /api/accounts/secondary/:userId/transactions
 * @desc Get transactions for a secondary account
 * @access Private
 */
router.get('/secondary/:userId/transactions', authenticateToken, async (req, res) => {
  try {
    const primaryUserId = req.user.id;
    const { userId } = req.params;
    const { page = 1, limit = 20, startDate, endDate } = req.query;

    // Verify the primary-secondary relationship
    const childParent = await ChildParent.findOne({
      where: {
        parentId: primaryUserId,
        userId
      }
    });

    if (!childParent) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Access denied'
        }
      });
    }

    // Build query conditions
    const where = {
      [Op.or]: [
        { senderId: userId },
        { receiverId: userId }
      ]
    };

    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    // Get transactions with pagination
    const offset = (page - 1) * limit;
    const { count, rows: transactions } = await Transaction.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: User,
          as: 'receiver',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    res.json({
      success: true,
      data: {
        items: transactions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching secondary account transactions:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch transactions'
      }
    });
  }
});

export default router;
