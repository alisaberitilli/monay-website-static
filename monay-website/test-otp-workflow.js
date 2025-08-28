#!/usr/bin/env node

// Comprehensive OTP workflow test for both Email and SMS
// Tests: Generate -> Verify -> Cleanup for each type

const fetch = require('node-fetch');
const readline = require('readline');

const API_BASE = 'http://localhost:3000/api';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function separator() {
  log('=' .repeat(60), colors.cyan);
}

async function askQuestion(question) {
  return new Promise(resolve => {
    rl.question(`${colors.yellow}${question}${colors.reset}`, answer => {
      resolve(answer);
    });
  });
}

async function sendOTP(type, identifier, firstName = 'Test', lastName = 'User') {
  const payload = {
    firstName,
    lastName
  };

  if (type === 'email') {
    payload.email = identifier;
  } else {
    payload.mobileNumber = identifier;
  }

  try {
    const response = await fetch(`${API_BASE}/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    return data;
  } catch (error) {
    return { error: error.message };
  }
}

async function verifyOTP(type, identifier, otpCode) {
  const payload = {
    otp: otpCode
  };

  if (type === 'email') {
    payload.email = identifier;
  } else {
    payload.mobileNumber = identifier;
  }

  try {
    const response = await fetch(`${API_BASE}/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    return data;
  } catch (error) {
    return { error: error.message };
  }
}

async function testEmailOTP() {
  separator();
  log('EMAIL OTP WORKFLOW TEST', colors.bright + colors.blue);
  separator();

  const email = await askQuestion('Enter email address (or press Enter for test@example.com): ');
  const testEmail = email || 'test@example.com';

  // Step 1: Generate OTP
  log('\n📧 Step 1: Generating Email OTP...', colors.cyan);
  const sendResult = await sendOTP('email', testEmail, 'John', 'Doe');
  
  if (sendResult.success) {
    log('✅ Email OTP sent successfully!', colors.green);
    log(`Email: ${sendResult.email}`, colors.bright);
    log(`Name: ${sendResult.firstName}`, colors.bright);
    if (sendResult.devOtp) {
      log(`OTP Code (demo mode): ${colors.bright}${colors.yellow}${sendResult.devOtp}${colors.reset}`, colors.green);
    }
    log(`Message: ${sendResult.message}`, colors.cyan);
  } else {
    log(`❌ Failed to send Email OTP: ${sendResult.error}`, colors.red);
    return false;
  }

  // Step 2: Wait for user to enter OTP
  let otpCode = sendResult.devOtp;
  if (!otpCode) {
    otpCode = await askQuestion('\n📝 Enter the OTP code you received: ');
  } else {
    const customOtp = await askQuestion(`\n📝 Enter OTP code (or press Enter to use ${otpCode}): `);
    if (customOtp) otpCode = customOtp;
  }

  // Step 3: Verify OTP
  log('\n🔐 Step 2: Verifying Email OTP...', colors.cyan);
  const verifyResult = await verifyOTP('email', testEmail, otpCode);
  
  if (verifyResult.success) {
    log('✅ Email OTP verified successfully!', colors.green);
    log(`Verified email: ${verifyResult.email}`, colors.bright);
    log(`Name: ${verifyResult.firstName}`, colors.bright);
    log(`Type: ${verifyResult.type}`, colors.bright);
  } else {
    log(`❌ Failed to verify Email OTP: ${verifyResult.error}`, colors.red);
    return false;
  }

  // Step 4: Try to verify again (should fail - OTP already used)
  log('\n🔄 Step 3: Testing cleanup - Verifying same OTP again (should fail)...', colors.cyan);
  const secondVerify = await verifyOTP('email', testEmail, otpCode);
  
  if (secondVerify.error) {
    log('✅ Cleanup successful - OTP was properly removed after use', colors.green);
    log(`Error message: ${secondVerify.error}`, colors.yellow);
  } else {
    log('⚠️  Warning: OTP was not cleaned up properly!', colors.red);
    return false;
  }

  return true;
}

async function testSMSOTP() {
  separator();
  log('SMS OTP WORKFLOW TEST', colors.bright + colors.blue);
  separator();

  const mobile = await askQuestion('Enter mobile number (or press Enter for 3016821633): ');
  const testMobile = mobile || '3016821633';

  // Step 1: Generate OTP
  log('\n📱 Step 1: Generating SMS OTP...', colors.cyan);
  const sendResult = await sendOTP('mobile', testMobile, 'Jane', 'Smith');
  
  if (sendResult.success) {
    log('✅ SMS OTP sent successfully!', colors.green);
    log(`Mobile: ${sendResult.mobileNumber}`, colors.bright);
    log(`Name: ${sendResult.firstName}`, colors.bright);
    if (sendResult.devOtp) {
      log(`OTP Code (demo mode): ${colors.bright}${colors.yellow}${sendResult.devOtp}${colors.reset}`, colors.green);
    }
    log(`Message: ${sendResult.message}`, colors.cyan);
  } else {
    log(`❌ Failed to send SMS OTP: ${sendResult.error}`, colors.red);
    return false;
  }

  // Step 2: Wait for user to enter OTP
  let otpCode = sendResult.devOtp;
  if (!otpCode) {
    otpCode = await askQuestion('\n📝 Enter the OTP code you received: ');
  } else {
    const customOtp = await askQuestion(`\n📝 Enter OTP code (or press Enter to use ${otpCode}): `);
    if (customOtp) otpCode = customOtp;
  }

  // Step 3: Verify OTP
  log('\n🔐 Step 2: Verifying SMS OTP...', colors.cyan);
  const verifyResult = await verifyOTP('mobile', testMobile, otpCode);
  
  if (verifyResult.success) {
    log('✅ SMS OTP verified successfully!', colors.green);
    log(`Verified mobile: ${verifyResult.mobileNumber}`, colors.bright);
    log(`Name: ${verifyResult.firstName}`, colors.bright);
    log(`Type: ${verifyResult.type}`, colors.bright);
  } else {
    log(`❌ Failed to verify SMS OTP: ${verifyResult.error}`, colors.red);
    return false;
  }

  // Step 4: Try to verify again (should fail - OTP already used)
  log('\n🔄 Step 3: Testing cleanup - Verifying same OTP again (should fail)...', colors.cyan);
  const secondVerify = await verifyOTP('mobile', testMobile, otpCode);
  
  if (secondVerify.error) {
    log('✅ Cleanup successful - OTP was properly removed after use', colors.green);
    log(`Error message: ${secondVerify.error}`, colors.yellow);
  } else {
    log('⚠️  Warning: OTP was not cleaned up properly!', colors.red);
    return false;
  }

  return true;
}

async function testSequentialFlow() {
  separator();
  log('SEQUENTIAL FLOW TEST - Email then SMS', colors.bright + colors.blue);
  separator();

  // Test email OTP first
  log('\n📧 Testing Email OTP independently...', colors.cyan);
  const emailResult = await testEmailOTP();
  
  if (emailResult) {
    log('\n✅ Email OTP workflow completed successfully!', colors.green);
  } else {
    log('\n❌ Email OTP workflow failed!', colors.red);
  }

  // Wait a moment before testing SMS
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Test SMS OTP independently
  log('\n📱 Testing SMS OTP independently...', colors.cyan);
  const smsResult = await testSMSOTP();
  
  if (smsResult) {
    log('\n✅ SMS OTP workflow completed successfully!', colors.green);
  } else {
    log('\n❌ SMS OTP workflow failed!', colors.red);
  }

  return emailResult && smsResult;
}

async function runTests() {
  separator();
  log('🚀 MONAY OTP WORKFLOW TEST SUITE', colors.bright + colors.cyan);
  separator();
  
  log('\nThis test will verify:', colors.yellow);
  log('1. Email OTP generation, verification, and cleanup', colors.cyan);
  log('2. SMS OTP generation, verification, and cleanup', colors.cyan);
  log('3. Sequential flow with proper isolation', colors.cyan);
  log('4. OTP cleanup after successful verification', colors.cyan);

  const choice = await askQuestion('\nSelect test mode:\n1. Email OTP only\n2. SMS OTP only\n3. Both (Sequential)\n4. Exit\n\nChoice (1-4): ');

  switch(choice) {
    case '1':
      await testEmailOTP();
      break;
    case '2':
      await testSMSOTP();
      break;
    case '3':
      await testSequentialFlow();
      break;
    case '4':
      log('\nGoodbye!', colors.cyan);
      break;
    default:
      log('\nInvalid choice. Running full sequential test...', colors.yellow);
      await testSequentialFlow();
  }

  separator();
  log('🏁 TEST SUITE COMPLETED', colors.bright + colors.cyan);
  separator();

  rl.close();
}

// Run the tests
runTests().catch(error => {
  log(`\n❌ Test suite error: ${error.message}`, colors.red);
  rl.close();
  process.exit(1);
});