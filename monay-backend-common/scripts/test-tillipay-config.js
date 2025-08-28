#!/usr/bin/env node

/**
 * TilliPay Configuration Test Script
 * Run this to verify your TilliPay API credentials are properly configured
 */

require('dotenv').config();
const axios = require('axios');
const crypto = require('crypto');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  header: (msg) => console.log(`\n${colors.cyan}═══ ${msg} ═══${colors.reset}\n`)
};

const merchants = {
  main: {
    merchantId: process.env.TILLIPAY_MAIN_MERCHANT_ID || 'S2H0u5BJ5TUU',
    apiKey: process.env.TILLIPAY_MAIN_API_KEY,
    secretKey: process.env.TILLIPAY_MAIN_SECRET_KEY,
    description: 'Main/Primary Account'
  },
  card: {
    merchantId: process.env.TILLIPAY_CARD_MERCHANT_ID || 'eJ8Vj27cK6HW',
    apiKey: process.env.TILLIPAY_CARD_API_KEY,
    secretKey: process.env.TILLIPAY_CARD_SECRET_KEY,
    description: 'Card Payment Processing'
  },
  ach: {
    merchantId: process.env.TILLIPAY_ICA_MERCHANT_ID || 'idBABc0kwl2H',
    apiKey: process.env.TILLIPAY_ICA_API_KEY,
    secretKey: process.env.TILLIPAY_ICA_SECRET_KEY,
    description: 'ACH/Bank Transfer Processing'
  },
  cbp: {
    merchantId: process.env.TILLIPAY_CBP_MERCHANT_ID || '0weAXAvECTps',
    apiKey: process.env.TILLIPAY_CBP_API_KEY,
    secretKey: process.env.TILLIPAY_CBP_SECRET_KEY,
    description: 'Cross-Border Payments'
  }
};

const baseURL = process.env.TILLIPAY_API_URL || 'https://stagingapi.tillipay.com';
const environment = process.env.TILLIPAY_ENV || 'staging';

async function testMerchantAuth(type, config) {
  log.header(`Testing ${type.toUpperCase()} - ${config.description}`);
  
  // Check if credentials are set
  if (!config.apiKey) {
    log.error(`API Key not configured for ${type}`);
    log.warn(`Set TILLIPAY_${type.toUpperCase()}_API_KEY in your .env file`);
    return false;
  }
  
  if (!config.secretKey) {
    log.error(`Secret Key not configured for ${type}`);
    log.warn(`Set TILLIPAY_${type.toUpperCase()}_SECRET_KEY in your .env file`);
    return false;
  }
  
  log.info(`Merchant ID: ${config.merchantId}`);
  log.info(`API Key: ${config.apiKey.substring(0, 8)}...${config.apiKey.substring(config.apiKey.length - 4)}`);
  log.info(`Secret Key: ***${config.secretKey.substring(config.secretKey.length - 4)}`);
  
  try {
    log.info(`Attempting authentication with ${environment} environment...`);
    
    const response = await axios.get(`${baseURL}/api/login/${config.merchantId}`, {
      headers: {
        'API-Key': config.apiKey,
        'Merchant-Id': config.merchantId,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    if (response.data && (response.data.token || response.data.success)) {
      log.success(`Authentication successful for ${type}!`);
      if (response.data.token) {
        log.info(`Token received: ${response.data.token.substring(0, 20)}...`);
      }
      return true;
    } else {
      log.warn(`Unexpected response for ${type}: ${JSON.stringify(response.data)}`);
      return false;
    }
  } catch (error) {
    log.error(`Authentication failed for ${type}`);
    if (error.response) {
      log.error(`Status: ${error.response.status}`);
      log.error(`Message: ${error.response.data?.message || error.response.statusText}`);
      if (error.response.status === 401) {
        log.warn('Check your API credentials are correct');
      }
    } else if (error.code === 'ECONNREFUSED') {
      log.error('Could not connect to TilliPay API');
      log.warn(`Check if ${baseURL} is accessible`);
    } else {
      log.error(`Error: ${error.message}`);
    }
    return false;
  }
}

async function testWebhookSecret() {
  log.header('Testing Webhook Configuration');
  
  const webhookSecret = process.env.TILLIPAY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    log.warn('Webhook secret not configured');
    log.info('Set TILLIPAY_WEBHOOK_SECRET in your .env file when you receive it from TilliPay');
    return false;
  }
  
  log.success('Webhook secret configured');
  
  // Test signature generation
  const testPayload = {
    eventType: 'test',
    transactionId: 'test_123',
    amount: 100
  };
  
  const signature = crypto
    .createHmac('sha256', webhookSecret)
    .update(JSON.stringify(testPayload))
    .digest('hex');
    
  log.info(`Sample signature generated: ${signature.substring(0, 16)}...`);
  return true;
}

async function main() {
  console.log('\n' + colors.cyan + '════════════════════════════════════════════════');
  console.log('     TilliPay Integration Configuration Test     ');
  console.log('════════════════════════════════════════════════' + colors.reset);
  
  log.info(`Environment: ${environment}`);
  log.info(`API URL: ${baseURL}`);
  
  const results = {
    main: false,
    card: false,
    ach: false,
    cbp: false,
    webhook: false
  };
  
  // Test each merchant account
  for (const [type, config] of Object.entries(merchants)) {
    results[type] = await testMerchantAuth(type, config);
  }
  
  // Test webhook configuration
  results.webhook = await testWebhookSecret();
  
  // Summary
  log.header('Test Summary');
  
  const successCount = Object.values(results).filter(r => r).length;
  const totalCount = Object.keys(results).length;
  
  for (const [key, success] of Object.entries(results)) {
    const label = key === 'webhook' ? 'Webhook Config' : `${key.toUpperCase()} Account`;
    if (success) {
      log.success(`${label}: Configured and working`);
    } else {
      log.error(`${label}: Not configured or failed`);
    }
  }
  
  console.log('\n' + colors.cyan + '════════════════════════════════════════════════' + colors.reset);
  
  if (successCount === totalCount) {
    log.success(`All configurations tested successfully! (${successCount}/${totalCount})`);
    console.log('\n✨ Your TilliPay integration is ready to use!');
  } else if (successCount > 0) {
    log.warn(`Partial configuration: ${successCount}/${totalCount} tests passed`);
    console.log('\n⚠️  Some configurations need attention. Check the errors above.');
  } else {
    log.error('No configurations are working');
    console.log('\n❌ Please check your .env file and ensure all credentials are correct.');
  }
  
  console.log(colors.cyan + '════════════════════════════════════════════════\n' + colors.reset);
  
  process.exit(successCount === totalCount ? 0 : 1);
}

// Run the test
main().catch(error => {
  log.error('Unexpected error during testing:');
  console.error(error);
  process.exit(1);
});