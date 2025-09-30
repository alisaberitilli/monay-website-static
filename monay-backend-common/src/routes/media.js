import { Router } from 'express';
import controllers from '../controllers/index.js';
import validations from '../validations/index.js';
import middlewares from '../middleware-app/index.js';

const router = Router();
const { mediaValidator } = validations;
const { mediaController } = controllers;
const { authMiddleware, validateMiddleware, mediaMiddleware } = middlewares;

router.post(
  '/media/upload/:mediaFor/:mediaType',
  authMiddleware,
  (req, res, next) => {
    Object.assign(req.params, {
      apiName: 'media'
    });
    next();
  },
  // authMiddleware,
  (req, res, next) => {
    const { params } = req;
    Object.assign(req.body, params);
    next();
  },
  validateMiddleware({
    schema: mediaValidator.uploadSchema,
  }),
  mediaController.uploadMedia,
  mediaController.saveMedia,
);

router.get(
  '/media/signed-url',
  authMiddleware,
  mediaMiddleware.checkMediaExistsS3,
  mediaMiddleware.checkMediaOwner,
  mediaController.getSignedUrl
);

export default router;
