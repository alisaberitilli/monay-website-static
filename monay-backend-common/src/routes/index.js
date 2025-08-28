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
import apiInfo from './api-info';
import solana from './solana';
import status from './status';
import tillipay from './tillipay';
import blockchain from './blockchain';
import treasury from './treasury';
import oneqa from './oneqa-manual';
import evm from './evm.js';
import bridge from './bridge.js';
import apiHealth, { trackEndpointHealth } from './api-health.js';
import contracts from './contracts.js';

const router = Router();
const register = (app) => {
  // Add endpoint health tracking middleware
  app.use(trackEndpointHealth);
  
  app.use(router);

  // API information endpoints at root level
  app.use('/', apiInfo);
  app.use('/', status);  // Add status route
  app.use('/', apiHealth); // Add API health monitoring

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
    solana,
    tillipay,
    oneqa,
    evm,
    bridge
  ]);
  
  // Mount blockchain and treasury routes with their prefixes
  app.use('/api/blockchain', blockchain);
  app.use('/api/treasury', treasury);
  app.use('/api/evm', evm);
  app.use('/api/bridge', bridge);
  app.use('/api', contracts); // Contracts routes already have /contracts prefix


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