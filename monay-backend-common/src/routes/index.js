import { Router } from 'express';
import HttpStatus from 'http-status';
import account from './account.js';
import accounts from './accounts.js';  // Consumer wallet Primary/Secondary accounts
import media from './media.js';
import cms from './cms.js';
import admin from './admin.js';
import notification from './notification.js';
import setting from './setting.js';
import user from './user.js';
import paymentRequest from './payment-request.js';
import card from './card.js';
import bank from './bank.js';
import transaction from './transaction.js';
import payMoney from './pay-money.js';
import addMoney from './add-money.js';
import withdrawal from './withdrawal.js';
import contact from './contact.js';
import wallet from './wallet.js';
import userBlock from './user-block.js';
import path from 'path';
import loggers from '../services/logger.js';
import activityLog from './activity-log.js';
import subadmin from './subadmin.js';
import role from './role.js';
import businessRules from './business-rules.js';
import auth from './auth.js';
import verification from './verification.js';
import apiInfo from './api-info.js';
import solana from './solana.js';
import status from './status.js';
import monayFiat from './monay-fiat.js';
import stripe from './stripe.js';
import blockchain from './blockchain.js';
import treasury from './treasury.js';
import oneqa from './oneqa-manual.js';
import evm from './evm.js';
import bridge from './bridge.js';
import apiHealth, { trackEndpointHealth } from './api-health.js';
import contracts from './contracts.js';
import invoiceWallets from './invoiceWallets.js';
import capitalMarkets from './capital-markets.js';
import circle from './circle.js';
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
import organizations from './organizations.js';
import walletBalance from './wallet-balance.js';
import webhooks from './webhooks.js';
import dataExports from './data-exports.js';
import enterpriseRbac from './enterprise-rbac.js';

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
    walletBalance,  // Wallet balance and limits management
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
  app.use('/api/circle', circle); // Circle USDC integration for mint/burn operations
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
  app.use('/api/organizations', organizations); // Organization management system
  app.use('/api/webhooks', webhooks); // Webhook management system for integrations
  app.use('/api/exports', dataExports); // Advanced data export functionality
  app.use('/api/enterprise-rbac', enterpriseRbac); // Enterprise Role-Based Access Control with industry-specific roles


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