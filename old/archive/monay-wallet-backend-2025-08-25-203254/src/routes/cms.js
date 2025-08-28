import { Router } from 'express';
import controllers from '../controllers';
import validations from '../validations';
import middlewares from '../middlewares';

const router = Router();
const { cmsValidator, faqValidator } = validations;
const { cmsController } = controllers;
const { authMiddleware, validateMiddleware, resourceAccessMiddleware, cmsMiddleware } = middlewares;

router.get('/cms', 
cmsMiddleware.checkUserType,
cmsController.getCmsPages);

router.get('/admin/cms',
  authMiddleware,
  resourceAccessMiddleware(['admin', 'subadmin']),
  cmsController.getCmsPages
);

router.put(
  '/admin/cms/:cmsPageId',
  authMiddleware,
  resourceAccessMiddleware(['admin', 'subadmin']),
  validateMiddleware({
    schema: cmsValidator.createCmsSchema,
  }),
  cmsMiddleware.checkCmsPageExists,
  cmsController.updateCmsPage
);

router.get('/admin/cms/:cmsPageId',
  authMiddleware,
  resourceAccessMiddleware(['admin', 'subadmin']),
  cmsController.getCmsPage
);

router.post(
  '/admin/faq',
  authMiddleware,
  resourceAccessMiddleware(['admin', 'subadmin']),
  validateMiddleware({
    schema: faqValidator.createFaqSchema,
  }),
  cmsController.saveFaq,
);

router.get('/admin/faq',
  authMiddleware,
  resourceAccessMiddleware(['admin', 'subadmin']),
  cmsController.getFaqList
);

router.get('/faq',
  authMiddleware,
  cmsController.getFaqList
);

router.delete(
  '/admin/faq/:faqId',
  authMiddleware,
  resourceAccessMiddleware(['admin', 'subadmin']),
  cmsMiddleware.checkFaqExists,
  cmsController.deleteFaq,
);

router.get(
  '/admin/faq/:faqId',
  authMiddleware,
  resourceAccessMiddleware(['admin', 'subadmin']),
  cmsMiddleware.checkFaqExists,
  cmsController.getFaqDetail,
);

router.put(
  '/admin/faq/:faqId',
  authMiddleware,
  resourceAccessMiddleware(['admin', 'subadmin']),
  cmsMiddleware.checkFaqExists,
  cmsController.updateFaq,
);
export default router;
