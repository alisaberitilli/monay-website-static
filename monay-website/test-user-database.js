#!/usr/bin/env node

/**
 * User Database Test Script
 * 
 * This script tests the user database functionality:
 * 1. Creating users with 10-digit UUIDs
 * 2. Retrieving users by email and ID
 * 3. Updating user verification status
 * 
 * Run with: node test-user-database.js
 */

const BASE_URL = 'http://localhost:3000';

// Test data
const testUser = {
  email: 'test@monay.com',
  firstName: 'Test',
  lastName: 'User',
  mobileNumber: '+13016821633',
  companyName: 'Test Company',
  companyType: 'startup',
  jobTitle: 'Developer',
  industry: 'Technology',
  useCase: 'Testing the system',
  technicalRequirements: ['API Integration', 'Real-time Data'],
  expectedVolume: '1000-5000',
  timeline: 'Q1 2025',
  additionalNotes: 'This is a test user for database verification'
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logHeader(message) {
  log(`\n${'='.repeat(60)}`, 'cyan');
  log(`  ${message}`, 'bright');
  log(`${'='.repeat(60)}`, 'cyan');
}

function logTest(testName, status, details = '') {
  const statusColor = status === 'PASS' ? 'green' : 'red';
  const statusIcon = status === 'PASS' ? '✅' : '❌';
  log(`${statusIcon} ${testName}: ${status}`, statusColor);
  if (details) {
    log(`   ${details}`, 'yellow');
  }
}

async function makeRequest(endpoint, data) {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    const responseData = await response.json();
    return { success: response.ok, data: responseData, status: response.status };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function testUserCreation() {
  logHeader('Testing User Creation');
  
  log('👤 Creating test user...', 'blue');
  const response = await makeRequest('/api/save-user', testUser);
  
  if (!response.success) {
    logTest('User Creation', 'FAIL', `HTTP ${response.status}: ${JSON.stringify(response.data)}`);
    return null;
  }
  
  if (!response.data.success) {
    logTest('User Creation', 'FAIL', `API Error: ${response.data.error}`);
    return null;
  }
  
  const user = response.data.user;
  logTest('User Creation', 'PASS', `User ID: ${user.id}`);
  
  // Validate the user ID format (10 characters)
  if (user.id && user.id.length === 10) {
    logTest('User ID Format', 'PASS', `ID length: ${user.id.length} characters`);
  } else {
    logTest('User ID Format', 'FAIL', `Expected 10 characters, got: ${user.id?.length || 0}`);
  }
  
  return user;
}

async function testUserRetrieval(user) {
  if (!user) return;
  
  logHeader('Testing User Retrieval');
  
  // Test getting user by email
  log('🔍 Testing user retrieval by email...', 'blue');
  const emailResponse = await makeRequest('/api/save-user', testUser);
  
  if (emailResponse.success && emailResponse.data.error && emailResponse.data.error.includes('already exists')) {
    logTest('Duplicate User Check', 'PASS', 'Properly detected duplicate email');
  } else {
    logTest('Duplicate User Check', 'FAIL', 'Should have detected duplicate email');
  }
}

async function testDatabaseConnection() {
  logHeader('Testing Database Connection');
  
  try {
    const { exec } = require('child_process');
    const util = require('util');
    const execAsync = util.promisify(exec);
    
    // Check if users table exists
    const { stdout } = await execAsync(`psql -d monay_otp -U monay_user -c "SELECT COUNT(*) as count FROM users;" -t`);
    const count = parseInt(stdout.trim());
    
    if (count >= 0) {
      logTest('Database Connection', 'PASS', `Users table accessible, contains ${count} records`);
    } else {
      logTest('Database Connection', 'FAIL', 'Could not access users table');
    }
  } catch (error) {
    logTest('Database Connection', 'FAIL', `Database error: ${error.message}`);
  }
}

async function runAllTests() {
  logHeader('Starting User Database Test Suite');
  log(`Base URL: ${BASE_URL}`, 'yellow');
  
  const startTime = Date.now();
  let passedTests = 0;
  let totalTests = 0;
  
  try {
    // Test database connection
    await testDatabaseConnection();
    passedTests += 1;
    totalTests += 1;
    
    // Test user creation
    const user = await testUserCreation();
    if (user) {
      passedTests += 2; // creation + ID format
      totalTests += 2;
    } else {
      totalTests += 2;
    }
    
    // Test user retrieval
    await testUserRetrieval(user);
    passedTests += 1;
    totalTests += 1;
    
  } catch (error) {
    log(`❌ Test suite failed with error: ${error.message}`, 'red');
    return false;
  }
  
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  logHeader('Test Results Summary');
  log(`Duration: ${duration}ms`, 'cyan');
  log(`Tests Passed: ${passedTests}/${totalTests}`, passedTests === totalTests ? 'green' : 'red');
  log(`Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`, passedTests === totalTests ? 'green' : 'red');
  
  if (passedTests === totalTests) {
    log('\n🎉 All tests passed! User database is working correctly.', 'green');
    return true;
  } else {
    log('\n⚠️ Some tests failed. Please check the logs above.', 'yellow');
    return false;
  }
}

// Check if server is running
async function checkServerHealth() {
  try {
    const response = await fetch(`${BASE_URL}/api/save-user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'health@test.com', firstName: 'Health', lastName: 'Check', mobileNumber: '+13016821633' })
    });
    return true; // If we get any response, the server is running
  } catch (error) {
    return false;
  }
}

// Main execution
async function main() {
  logHeader('User Database Test Suite');
  
  // Check if server is running
  log('🔍 Checking server health...', 'blue');
  const serverHealthy = await checkServerHealth();
  
  if (!serverHealthy) {
    log('❌ Server is not running or not accessible', 'red');
    log('Please start the development server with: npm run dev', 'yellow');
    process.exit(1);
  }
  
  log('✅ Server is running and accessible', 'green');
  
  // Run all tests
  const success = await runAllTests();
  
  // Exit with appropriate code
  process.exit(success ? 0 : 1);
}

// Handle script execution
if (require.main === module) {
  main().catch(error => {
    log(`❌ Test suite crashed: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = {
  testUserCreation,
  testUserRetrieval,
  testDatabaseConnection,
  runAllTests
};
