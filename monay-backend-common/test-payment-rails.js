#!/usr/bin/env node

/**
 * Test script for Dwolla Payment Rails (FedNow/RTP)
 * Tests the integration with Dwolla sandbox
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api/payment-rails';

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Test results tracker
let testResults = {
  passed: 0,
  failed: 0,
  total: 0
};

// Utility function to log test results
function logTest(name, success, details = '') {
  testResults.total++;
  if (success) {
    testResults.passed++;
    console.log(`${colors.green}✓${colors.reset} ${name}`);
  } else {
    testResults.failed++;
    console.log(`${colors.red}✗${colors.reset} ${name}`);
  }
  if (details) {
    console.log(`  ${colors.cyan}→${colors.reset} ${details}`);
  }
}

// Utility function to make API calls
async function apiCall(method, endpoint, data = null) {
  try {
    const response = await axios({
      method,
      url: `${API_BASE_URL}${endpoint}`,
      data,
      headers: {
        'Content-Type': 'application/json',
        // Add authentication header if needed
        'Authorization': 'Bearer test-token'
      }
    });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message
    };
  }
}

// Test storage for created resources
let testData = {
  customer1: null,
  customer2: null,
  bank1: null,
  bank2: null
};

async function runTests() {
  console.log(`\n${colors.blue}========================================`);
  console.log(`   Dwolla Payment Rails Test Suite`);
  console.log(`   Testing FedNow & RTP Integration`);
  console.log(`========================================${colors.reset}\n`);

  // Test 1: Initialize Dwolla Service
  console.log(`${colors.yellow}1. Testing Dwolla Initialization${colors.reset}`);
  const initResult = await apiCall('GET', '/initialize');
  logTest('Initialize Dwolla service', initResult.success,
    initResult.success ? `Environment: ${initResult.data?.data?.environment}` : initResult.error);

  // Test 2: Health Check
  console.log(`\n${colors.yellow}2. Testing Health Check${colors.reset}`);
  const healthResult = await apiCall('GET', '/health');
  logTest('Health check endpoint', healthResult.success,
    healthResult.success ? 'All systems operational' : healthResult.error);

  // Test 3: Create Test Sandbox Data
  console.log(`\n${colors.yellow}3. Creating Sandbox Test Data${colors.reset}`);
  const setupResult = await apiCall('POST', '/test/setup');
  if (setupResult.success) {
    testData = setupResult.data.data;
    logTest('Create test customers', true, `Customer 1: ${testData.customer1}`);
    logTest('Create test bank accounts', true, `Bank 1: ${testData.bank1}`);
    logTest('Instant payment support', true,
      `Bank 1: ${testData.supportsInstant?.bank1 ? 'Yes' : 'No'}, Bank 2: ${testData.supportsInstant?.bank2 ? 'Yes' : 'No'}`);
  } else {
    logTest('Create test sandbox data', false, setupResult.error);
  }

  // Test 4: Check Instant Payment Eligibility
  console.log(`\n${colors.yellow}4. Testing Instant Payment Eligibility${colors.reset}`);
  if (testData.bank1) {
    const eligibilityResult = await apiCall('GET', `/funding-sources/${testData.bank1}/eligibility`);
    logTest('Check instant payment eligibility', eligibilityResult.success,
      eligibilityResult.success
        ? `Eligible: ${eligibilityResult.data?.data?.eligible ? 'Yes' : 'No'}`
        : eligibilityResult.error);
  }

  // Test 5: Get Available Payment Rails
  console.log(`\n${colors.yellow}5. Testing Available Payment Rails${colors.reset}`);
  const railsResult = await apiCall('POST', '/payments/available-rails', {
    amount: 10000, // $100 in cents
    priority: 'emergency'
  });
  logTest('Get available payment rails', railsResult.success,
    railsResult.success
      ? `${railsResult.data?.data?.length} rails available`
      : railsResult.error);

  // Test 6: Process Instant Payment (FedNow/RTP)
  console.log(`\n${colors.yellow}6. Testing Instant Payment (FedNow/RTP)${colors.reset}`);
  if (testData.bank1 && testData.bank2) {
    const instantPaymentResult = await apiCall('POST', '/payments/instant', {
      sourceFundingSourceId: testData.bank1,
      destinationFundingSourceId: testData.bank2,
      amount: 5000, // $50 in cents
      metadata: {
        description: 'Test instant payment via FedNow/RTP'
      },
      correlationId: `test_${Date.now()}`
    });
    logTest('Process instant payment', instantPaymentResult.success,
      instantPaymentResult.success
        ? `Network: ${instantPaymentResult.data?.data?.network}, Transfer ID: ${instantPaymentResult.data?.data?.transferId}`
        : instantPaymentResult.error?.message || JSON.stringify(instantPaymentResult.error));
  }

  // Test 7: Process Same-Day ACH Payment
  console.log(`\n${colors.yellow}7. Testing Same-Day ACH Payment${colors.reset}`);
  if (testData.bank1 && testData.bank2) {
    const achPaymentResult = await apiCall('POST', '/payments/ach', {
      sourceFundingSourceId: testData.bank1,
      destinationFundingSourceId: testData.bank2,
      amount: 2500, // $25 in cents
      clearing: 'same-day',
      metadata: {
        description: 'Test same-day ACH payment'
      },
      correlationId: `test_ach_${Date.now()}`
    });
    logTest('Process same-day ACH', achPaymentResult.success,
      achPaymentResult.success
        ? `Clearing: ${achPaymentResult.data?.data?.clearing}, ETA: ${achPaymentResult.data?.data?.estimatedCompletion}`
        : achPaymentResult.error?.message || JSON.stringify(achPaymentResult.error));
  }

  // Test 8: Route Payment Through Optimal Rail
  console.log(`\n${colors.yellow}8. Testing Payment Rail Orchestration${colors.reset}`);
  if (testData.bank1 && testData.bank2) {
    const routePaymentResult = await apiCall('POST', '/payments/route', {
      amount: 7500, // $75 in cents
      priority: 'urgent',
      sourceFundingSourceId: testData.bank1,
      destinationFundingSourceId: testData.bank2,
      paymentType: 'disbursement',
      metadata: {
        description: 'Test payment rail orchestration'
      }
    });
    logTest('Route payment through optimal rail', routePaymentResult.success,
      routePaymentResult.success
        ? `Selected rail: ${routePaymentResult.data?.data?.rail}`
        : routePaymentResult.error?.message || JSON.stringify(routePaymentResult.error));
  }

  // Test 9: Emergency Disbursement (GENIUS Act 4-hour SLA)
  console.log(`\n${colors.yellow}9. Testing Emergency Disbursement (GENIUS Act)${colors.reset}`);
  if (testData.bank1 && testData.bank2) {
    const emergencyResult = await apiCall('POST', '/payments/emergency', {
      amount: 15000, // $150 in cents
      sourceFundingSourceId: testData.bank1,
      destinationFundingSourceId: testData.bank2,
      programType: 'SNAP',
      beneficiaryId: 'test_beneficiary_001',
      metadata: {
        description: 'Emergency SNAP benefit disbursement'
      }
    });
    logTest('Emergency disbursement (4-hour SLA)', emergencyResult.success,
      emergencyResult.success
        ? `Rail: ${emergencyResult.data?.data?.rail}, SLA Target: ${emergencyResult.data?.sla?.target}`
        : emergencyResult.error?.message || JSON.stringify(emergencyResult.error));
  }

  // Print Test Summary
  console.log(`\n${colors.blue}========================================`);
  console.log(`   Test Results Summary`);
  console.log(`========================================${colors.reset}`);
  console.log(`${colors.green}Passed: ${testResults.passed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${testResults.failed}${colors.reset}`);
  console.log(`Total:  ${testResults.total}`);
  console.log(`\n${testResults.failed === 0 ? colors.green + '✓ All tests passed!' : colors.red + '✗ Some tests failed'}${colors.reset}\n`);

  // Important notes about sandbox limitations
  if (testResults.failed > 0) {
    console.log(`${colors.yellow}Note: Some failures may be expected in sandbox environment.${colors.reset}`);
    console.log(`${colors.cyan}Common sandbox limitations:${colors.reset}`);
    console.log(`  • Instant payments may not be fully supported in sandbox`);
    console.log(`  • FedNow/RTP network selection is simulated`);
    console.log(`  • Actual settlement times don't apply in sandbox`);
    console.log(`  • Use sandbox routing number 222222226 for test accounts\n`);
  }

  process.exit(testResults.failed > 0 ? 1 : 0);
}

// Check if server is running
async function checkServerRunning() {
  try {
    await axios.get(`${API_BASE_URL}/health`);
    return true;
  } catch (error) {
    console.error(`${colors.red}Error: Backend server is not running on port 3001${colors.reset}`);
    console.log(`Please start the backend server first:`);
    console.log(`  cd /Users/alisaberi/Data/0ProductBuild/monay/monay-backend-common`);
    console.log(`  npm run dev`);
    return false;
  }
}

// Main execution
async function main() {
  const serverRunning = await checkServerRunning();
  if (!serverRunning) {
    process.exit(1);
  }

  try {
    await runTests();
  } catch (error) {
    console.error(`${colors.red}Unexpected error:${colors.reset}`, error);
    process.exit(1);
  }
}

// Run the tests
main();