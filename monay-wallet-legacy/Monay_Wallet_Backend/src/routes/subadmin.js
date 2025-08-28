import { Router } from 'express';
import controllers from '../controllers';
import validations from '../validations';
import middlewares from '../middlewares';

const router = Router();
const { userValidator, } = validations;
const { subadminController } = controllers;
const {
    authMiddleware,
    validateMiddleware,
    resourceAccessMiddleware,
    accountMiddleware
} = middlewares;


router.post(
    '/admin/subadmin',
    authMiddleware,
    resourceAccessMiddleware(['admin', 'subadmin']),
    validateMiddleware({
        schema: userValidator.subadminSignupSchema,
    }),
    accountMiddleware.checkUniquePhoneNumber,
    subadminController.subadminSignup
);

router.put(
    '/admin/subadmin',
    authMiddleware,
    resourceAccessMiddleware(['admin', 'subadmin']),
    validateMiddleware({
        schema: userValidator.updateSubadminSchema,
    }),
    accountMiddleware.checkUniquePhoneNumberSubadmin,
    accountMiddleware.checkUniqueEmailSubadmin,
    subadminController.updateSubadminSignup
);

router.get('/admin/subadmin',
    authMiddleware,
    resourceAccessMiddleware(['admin', 'subadmin']),
    subadminController.getSubadminList);

export default router;
