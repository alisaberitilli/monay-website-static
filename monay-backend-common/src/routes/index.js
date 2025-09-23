import { Router } from 'express';
import HttpStatus from 'http-status';
import account from './account';
import accounts from './accounts';  // Consumer wallet Primary/Secondary accounts
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
import monayFiat from './monay-fiat';
import stripe from './stripe';
import blockchain from './blockchain';
import treasury from './treasury';
import oneqa from './oneqa-manual';
import evm from './evm.js';
import bridge from './bridge.js';
import apiHealth, { trackEndpointHealth } from './api-health.js';
import contracts from './contracts.js';
import invoiceWallets from './invoiceWallets.js';
import capitalMarkets from './capital-markets.js';
// import governmentServices from './government-services.js';  // Temporarily disabled - fixing imports
import aiMlServices from './ai-ml-services.js';
import erpConnectors from './erp-connectors.js';
import authFederal from './auth-federal.js';
import customerVerification from './customer-verification.js';
import paymentRails from './payment-rails.js';
import emergencyDisbursement from './emergency-disbursement.js';
import snapTanfBenefits from './snap-tanf-benefits.js';
import industryVerticals from './industry-verticals.js';
import authPlaceholder from './auth-placeholder.js';
import customers from './customers.js';
import p2pTransfer from './p2p-transfer.js';

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
    authPlaceholder,  // Placeholder auth with simulation (development mode)
    auth,  // Add auth routes first for priority
    verification, // Add verification routes
    account,
    accounts,  // Consumer wallet Primary/Secondary account management
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
    monayFiat,
    stripe,
    oneqa,
    evm,
    bridge,
    p2pTransfer  // P2P transfer endpoints for Consumer Wallet
  ]);
  
  // Mount blockchain and treasury routes with their prefixes
  app.use('/api/blockchain', blockchain);
  app.use('/api/treasury', treasury);
  app.use('/api/evm', evm);
  app.use('/api/bridge', bridge);
  app.use('/api', contracts); // Contracts routes already have /contracts prefix
  app.use('/api/invoice-wallets', invoiceWallets); // Invoice-First wallet routes
  app.use('/api/capital-markets', capitalMarkets); // Capital Markets rule sets
  // app.use('/api/government', governmentServices); // Government services endpoints - temporarily disabled
  app.use('/api/ai-ml', aiMlServices); // AI/ML services endpoints
  app.use('/api/erp', erpConnectors); // ERP connector endpoints
  app.use('/api/auth', authFederal); // Federal authentication proxy to Monay-ID
  app.use('/api/customer-verification', customerVerification); // Customer KYC/KYB verification
  app.use('/api/payment-rails', paymentRails); // FedNow/RTP payment rails through Dwolla
  app.use('/api/emergency-disbursement', emergencyDisbursement); // Emergency disbursement system (4-hour SLA)
  app.use('/api/benefits', snapTanfBenefits); // SNAP/TANF benefit management system
  app.use('/api/verticals', industryVerticals); // Industry-specific payment solutions for 15 business sectors
  app.use('/api/customers', customers); // Customer management system with KYC/AML


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