import { Router } from 'express';
import express from 'express';
import HttpStatus from 'http-status';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
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
// import loggers from '../services/logger.js';  // Removed - using console now
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
import circleWallets from './circle-wallets.js';  // Circle wallet integration for consumer dual-wallet
import enterpriseTreasury from './enterprise-treasury.js';  // Enterprise treasury and invoice management
// import governmentServices from './government-services.js';  // Temporarily disabled - fixing imports
import aiMlServices from './ai-ml-services.js';
// import superAppServices from './super-app-services.js'; // TEMPORARILY DISABLED due to auth import issue
import apiTest from './api-test.js';
import erpConnectors from './erp-connectors.js';
import authFederal from './auth-federal.js';
import customerVerification from './customer-verification.js';
import paymentRails from './payment-rails.js';
import superAdmin from './super-admin.js';  // Super Admin routes for platform management
import superAdminUsers from './super-admin-users.js';  // Super Admin user management routes
import emergencyDisbursement from './emergency-disbursement.js';
import snapTanfBenefits from './snap-tanf-benefits.js';
import industryVerticals from './industry-verticals.js';
import authPlaceholder from './auth-placeholder.js';
import adminLogin from './admin-login.js';  // Dedicated admin login endpoint
import onboarding from './onboarding.js';  // Onboarding flow with KYC verification
import customers from './customers.js';
import p2pTransfer from './p2p-transfer.js';
import organizations from './organizations.js';
import walletBalance from './wallet-balance.js';
import webhooks from './webhooks.js';
import dataExports from './data-exports.js';
import enterpriseRbac from './enterprise-rbac.js';
import consumer from './consumer.js';  // Consumer wallet with Tempo priority
import tenants from './tenants.js';  // Tenant management routes
import groups from './groups-simple.js';  // Group management routes (simplified)
import billing from './billing-analytics-minimal.js';  // Billing analytics (minimal version) - no validation issues
import contacts from './contacts.js';  // Unified contacts endpoint for organizations and individuals

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = Router();
const register = (app) => {
  // Serve static files including favicon
  app.use(express.static(path.join(__dirname, '../../public')));

  // Add favicon routes
  app.get('/favicon.png', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/favicon.png'));
  });

  app.get('/favicon.ico', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/favicon.png'));
  });

  // Add endpoint health tracking middleware
  app.use(trackEndpointHealth);

  app.use(router);

  // Root route with favicon
  app.get('/', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Monay API Server</title>
        <link rel="icon" type="image/png" href="/favicon.png">
        <link rel="alternate icon" href="/favicon.ico">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background: linear-gradient(135deg, #0066FF 0%, #004499 100%);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
          }
          .container {
            text-align: center;
            padding: 2rem;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            backdrop-filter: blur(10px);
          }
          h1 {
            font-size: 3rem;
            margin-bottom: 1rem;
          }
          .logo {
            font-size: 5rem;
            margin-bottom: 2rem;
          }
          .status {
            background: rgba(0, 255, 0, 0.2);
            padding: 0.5rem 1rem;
            border-radius: 20px;
            display: inline-block;
            margin-top: 1rem;
          }
          .links {
            margin-top: 2rem;
          }
          .links a {
            color: #FFD700;
            margin: 0 1rem;
            text-decoration: none;
            font-weight: 600;
          }
          .links a:hover {
            text-decoration: underline;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">
            <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 32 32">
              <path d="M 4 24 L 8 8 L 12 18 L 16 8 L 20 24 L 17 24 L 15 12 L 12 22 L 9 12 L 7 24 Z" fill="white"/>
              <circle cx="24" cy="22" r="3" fill="#FFD700"/>
            </svg>
          </div>
          <h1>Monay Backend API</h1>
          <p>Unified backend for CaaS & WaaS platforms</p>
          <div class="status">✓ Server Running on Port ${process.env.PORT || 3001}</div>
          <div class="links">
            <a href="/status">Platform Status</a>
            <a href="/api/status">API Status</a>
            <a href="/api/health">Health Check</a>
            <a href="/api-viewer">API Viewer</a>
            ${process.env.NODE_ENV === 'development' ? '<a href="/api-docs">API Documentation</a>' : ''}
          </div>
        </div>
      </body>
      </html>
    `);
  });

  // API information endpoints at root level
  app.use('/', apiInfo);
  app.use('/', status);  // Add status route
  app.use('/', apiHealth); // Add API health monitoring

  router.use('/api', [
    adminLogin,  // Dedicated admin login endpoint (must be before authPlaceholder)
    authPlaceholder,  // Placeholder auth with simulation (development mode)
    auth,  // Add auth routes first for priority
    onboarding,  // Onboarding flow with KYC verification
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
    consumer,  // Consumer wallet with Tempo-first multi-provider support
    billing  // Billing analytics and payment processing routes
    // Removed tenants - it's mounted separately as /api/tenants
  ]);
  
  // Mount blockchain and treasury routes with their prefixes
  app.use('/api/blockchain', blockchain);
  app.use('/api/treasury', treasury);
  app.use('/api/evm', evm);
  app.use('/api/bridge', bridge);
  app.use('/api/tenants', tenants); // Tenant management routes
  app.use('/api/groups', groups); // Group management routes
  app.use('/api', contracts); // Contracts routes already have /contracts prefix
  app.use('/api/invoice-wallets', invoiceWallets); // Invoice-First wallet routes
  app.use('/api/capital-markets', capitalMarkets); // Capital Markets rule sets
  app.use('/api/circle', circle); // Circle USDC integration for mint/burn operations
  app.use('/api/circle-wallets', circleWallets); // Circle wallet integration for consumer dual-wallet
  app.use('/api/enterprise-treasury', enterpriseTreasury); // Enterprise treasury and invoice tokenization on Solana
  // app.use('/api/government', governmentServices); // Government services endpoints - temporarily disabled
  app.use('/api/ai-ml', aiMlServices); // AI/ML services endpoints
  app.use('/api/erp', erpConnectors); // ERP connector endpoints
  // app.use('/api', auth); // Removed duplicate - auth routes already mounted in router above
  app.use('/api/auth-federal', authFederal); // Federal authentication proxy to Monay-ID
  app.use('/api/customer-verification', customerVerification); // Customer KYC/KYB verification
  app.use('/api/payment-rails', paymentRails); // FedNow/RTP payment rails through Dwolla
  app.use('/api/emergency-disbursement', emergencyDisbursement); // Emergency disbursement system (4-hour SLA)
  app.use('/api/benefits', snapTanfBenefits); // SNAP/TANF benefit management system
  app.use('/api/verticals', industryVerticals); // Industry-specific payment solutions for 15 business sectors
  app.use('/api/customers', customers); // Customer management system with KYC/AML
  app.use('/api/organizations', organizations); // Organization management system
  app.use('/api/contacts', contacts); // Unified contacts endpoint (organizations + individuals)
  app.use('/api/webhooks', webhooks); // Webhook management system for integrations
  app.use('/api/exports', dataExports); // Advanced data export functionality
  app.use('/api/enterprise-rbac', enterpriseRbac); // Enterprise Role-Based Access Control with industry-specific roles
  app.use('/api/super-admin', superAdmin); // Super Admin routes for comprehensive platform management
  app.use('/api/super-admin/users', superAdminUsers); // Super Admin user management routes
  app.use('/api/p2p-transfer', p2pTransfer); // P2P transfer endpoints for Consumer Wallet
  app.use('/api/user', user); // User management routes for admin portal
  // app.use(superAppServices); // Super App services for Consumer Wallet (travel, transport, shopping, etc.) - TEMPORARILY DISABLED due to auth import issue
  app.use(apiTest); // API testing endpoints for verification


  app.use((error, req, res, next) => {
    if (!error.status || error.status == HttpStatus.INTERNAL_SERVER_ERROR) {
      // loggers.errorLogger.error(`internal error ${new Date()} ${error}`);
      console.error(`internal error ${new Date()} ${error}`);
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