import { Router } from 'express';
import HttpStatus from 'http-status';
import account from './account';
import media from './media';
import cms from './cms';
import admin from './admin';
import notification from './notification';
import setting from './setting';
import user from './user';
import paymentRequest from './payment-request';
import card from './card';
import bank from './bank';
import transaction from './transaction';
import payMoney from './pay-money';
import addMoney from './add-money';
import withdrawal from './withdrawal';
import contact from './contact';
import wallet from './wallet';
import userBlock from './user-block';
import path from 'path';
import loggers from '../services/logger';
import activityLog from './activity-log';
import subadmin from './subadmin';
import role from './role';
import businessRules from './business-rules';
import auth from './auth';
import verification from './verification';
import solana from './solana';

const router = Router();
const register = (app) => {
  app.use(router);

  app.get('/*', (req, res) => {
    if (!req.path.includes('/api')) {
      res.sendFile(path.join(`${__dirname}/../../build/index.html`));
    }
  });

  router.use('/api', [
    auth,  // Add auth routes first for priority
    verification, // Add verification routes
    account,
    media,
    cms,
    admin,
    notification,
    setting,
    user,
    card,
    paymentRequest,
    transaction,
    bank,
    payMoney,
    addMoney,
    wallet,
    withdrawal,
    contact,
    userBlock,
    activityLog,
    subadmin,
    role,
    businessRules,
    solana
  ]);


  app.use((error, req, res, next) => {
    if (!error.status || error.status == HttpStatus.INTERNAL_SERVER_ERROR) {
      loggers.errorLogger.error(`internal error ${new Date()} ${error}`);
      console.log('internal error', `${new Date()}`, error.status, error);
    }
    res.status(error.status || HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      data: null,
      error: error.message || 'An error occurred',
      message: (error.status == HttpStatus.INTERNAL_SERVER_ERROR) ? 'Internal Server Error' : error.message
    });
  });


  app.use((req, res, next) => {
    const error = new Error('Not Found');
    error.status = HttpStatus.NOT_FOUND;
    res.status(error.status).json({
      success: false,
      data: null,
      error: error.message,
      message: error.message,
    });
  });
};
export default register;