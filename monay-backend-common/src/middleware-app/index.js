import validateMiddleware from './validate-middleware.js';
import authMiddleware from './auth-middleware.js';
import resourceAccessMiddleware from './resource-access-middleware.js';
import userMiddleware from './user-middleware.js';
import cmsMiddleware from './cms-middleware.js';
import accountMiddleware from './account-middleware.js';
import mediaMiddleware from './media-middleware.js';
import appVersionMiddleware from './app-version-middleware.js';
import paymentRequestMiddleware from './payment-request-middleware.js';
import withdrawalMiddleware from './withdrawal-middleware.js';
import cardMiddleware from './card-middleware.js';
import bankMiddleware from './bank-middleware.js';
import blockUserMiddleware from './block-user-middleware.js';
import roleMiddleware from './role-middleware.js';


export default {
  validateMiddleware,
  authMiddleware,
  resourceAccessMiddleware,
  appVersionMiddleware,
  accountMiddleware,
  userMiddleware,
  cmsMiddleware,
  mediaMiddleware,
  paymentRequestMiddleware,
  cardMiddleware,
  bankMiddleware,
  withdrawalMiddleware,
  blockUserMiddleware,
  roleMiddleware
};
