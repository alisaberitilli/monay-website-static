import { Router } from 'express';
import controllers from '../controllers/index.js';
import middlewares from '../middleware-app/index.js';
import validations from '../validations/index.js';
const router = Router();

const { settingValidator } = validations;
const { settingController } = controllers;
const { authMiddleware, resourceAccessMiddleware, validateMiddleware } = middlewares;

router.get('/setting',
  settingController.getPublicSettings
);

router.get(
  '/admin/setting',
  authMiddleware,
  resourceAccessMiddleware(['admin', 'subadmin']),
  settingController.getPrivateSettings
);

router.put(
  '/admin/setting',
  authMiddleware,
  resourceAccessMiddleware(['admin', 'subadmin']),
  validateMiddleware({
    schema: settingValidator.updateSettingSchema,
  }),
  settingController.updateSettings
);
router.get(
  '/admin/country',
  // authMiddleware,
  // resourceAccessMiddleware(['admin', 'subadmin']),
  settingController.getCountryList
);

router.get(
  '/user/country',
  settingController.getActiveCountryList
);

router.put(
  '/admin/country/setting',
  authMiddleware,
  resourceAccessMiddleware(['admin', 'subadmin']),
  validateMiddleware({
    schema: settingValidator.updateCountrySettingSchema,
  }),
  settingController.updateCountrySettings
);

router.get(
  '/user/kyc-document',
  authMiddleware,
  // resourceAccessMiddleware(['admin', 'subadmin']),
  settingController.getKycDocument
);
export default router;
