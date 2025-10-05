/**
 * Onboarding Routes
 * Handles enterprise user onboarding flow including KYC verification
 */

import { Router } from 'express';
import HttpStatus from 'http-status';
import middlewares from '../middleware-app/index.js';
import models from '../models/index.js';

const router = Router();
const { authMiddleware } = middlewares;

/**
 * GET /api/onboarding/status
 * Check user's onboarding status
 */
router.get('/onboarding/status', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id || req.user.userId;

        if (!userId) {
            return res.status(HttpStatus.UNAUTHORIZED).json({
                success: false,
                error: 'User not authenticated'
            });
        }

        // Fetch user details
        const user = await models.User.findOne({
            where: { id: userId, isDeleted: false }
        });

        if (!user) {
            return res.status(HttpStatus.NOT_FOUND).json({
                success: false,
                error: 'User not found'
            });
        }

        // Determine onboarding status based on verification flags
        const hasCompletedKYC = user.isKycVerified || false;
        const hasVerifiedEmail = user.isEmailVerified || false;
        const hasVerifiedMobile = user.isMobileVerified || false;
        const onboardingCompleted = user.onboardingCompleted || false;
        const onboardingStep = user.onboardingStep || null;

        // If user has manually marked onboarding as complete, respect that
        if (onboardingCompleted) {
            return res.status(HttpStatus.OK).json({
                isFirstLogin: false,
                hasCompletedOnboarding: true,
                currentStep: 'complete',
                userId: user.id,
                organizationId: user.organizationId || null
            });
        }

        // If user has skipped onboarding, don't force them back
        if (onboardingStep === 'skipped') {
            return res.status(HttpStatus.OK).json({
                isFirstLogin: false,
                hasCompletedOnboarding: false,
                currentStep: 'skipped',
                userId: user.id,
                organizationId: user.organizationId || null,
                verificationStatus: {
                    email: hasVerifiedEmail,
                    mobile: hasVerifiedMobile,
                    kyc: hasCompletedKYC
                }
            });
        }

        // Determine current onboarding step
        let currentStep = null;
        let isFirstLogin = false;

        if (!hasVerifiedEmail) {
            currentStep = 'email';
            isFirstLogin = true;
        } else if (!hasVerifiedMobile) {
            currentStep = 'mobile';
            isFirstLogin = true;
        } else if (!hasCompletedKYC) {
            currentStep = 'kyc';
            isFirstLogin = true;
        }

        // If all verifications are complete but onboarding not marked complete
        const hasCompletedOnboarding = hasCompletedKYC && hasVerifiedEmail && hasVerifiedMobile;

        return res.status(HttpStatus.OK).json({
            isFirstLogin,
            hasCompletedOnboarding,
            currentStep: currentStep || (hasCompletedOnboarding ? 'complete' : 'kyc'),
            userId: user.id,
            organizationId: user.organizationId || null,
            verificationStatus: {
                email: hasVerifiedEmail,
                mobile: hasVerifiedMobile,
                kyc: hasCompletedKYC
            }
        });
    } catch (error) {
        console.error('Error fetching onboarding status:', error);
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            error: 'Failed to fetch onboarding status'
        });
    }
});

/**
 * POST /api/onboarding/complete
 * Mark onboarding as completed
 */
router.post('/onboarding/complete', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id || req.user.userId;

        if (!userId) {
            return res.status(HttpStatus.UNAUTHORIZED).json({
                success: false,
                error: 'User not authenticated'
            });
        }

        // Update user's onboarding status
        await models.User.update(
            {
                onboardingCompleted: true,
                onboardingStep: 'complete',
                updatedAt: new Date()
            },
            { where: { id: userId } }
        );

        return res.status(HttpStatus.OK).json({
            success: true,
            message: 'Onboarding marked as complete'
        });
    } catch (error) {
        console.error('Error completing onboarding:', error);
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            error: 'Failed to complete onboarding'
        });
    }
});

/**
 * POST /api/onboarding/skip
 * Skip onboarding for now (can be completed later)
 */
router.post('/onboarding/skip', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id || req.user.userId;

        if (!userId) {
            return res.status(HttpStatus.UNAUTHORIZED).json({
                success: false,
                error: 'User not authenticated'
            });
        }

        // Mark as skipped but not completed (user can resume later)
        await models.User.update(
            {
                onboardingStep: 'skipped',
                updatedAt: new Date()
            },
            { where: { id: userId } }
        );

        return res.status(HttpStatus.OK).json({
            success: true,
            message: 'Onboarding skipped - you can complete it later from your profile'
        });
    } catch (error) {
        console.error('Error skipping onboarding:', error);
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            error: 'Failed to skip onboarding'
        });
    }
});

/**
 * POST /api/onboarding/update-step
 * Update current onboarding step
 */
router.post('/onboarding/update-step', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id || req.user.userId;
        const { step } = req.body;

        if (!userId) {
            return res.status(HttpStatus.UNAUTHORIZED).json({
                success: false,
                error: 'User not authenticated'
            });
        }

        if (!step) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                success: false,
                error: 'Step is required'
            });
        }

        await models.User.update(
            {
                onboardingStep: step,
                updatedAt: new Date()
            },
            { where: { id: userId } }
        );

        return res.status(HttpStatus.OK).json({
            success: true,
            message: `Onboarding step updated to: ${step}`
        });
    } catch (error) {
        console.error('Error updating onboarding step:', error);
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            error: 'Failed to update onboarding step'
        });
    }
});

export default router;
