import validateMiddleware from './validate-middleware';
import authMiddleware from './auth-middleware';
import resourceAccessMiddleware from './resource-access-middleware';
import userMiddleware from './user-middleware';
import cmsMiddleware from './cms-middleware';
import accountMiddleware from './account-middleware';
import mediaMiddleware from './media-middleware';
import appVersionMiddleware from './app-version-middleware';
import paymentRequestMiddleware from './payment-request-middleware';
import withdrawalMiddleware from './withdrawal-middleware';
import cardMiddleware from './card-middleware';
import bankMiddleware from './bank-middleware';
import blockUserMiddleware from './block-user-middleware';
import roleMiddleware from './role-middleware';


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
