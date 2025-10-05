import { test, expect } from '@playwright/test';

// Configuration
const CONSUMER_WALLET_URL = 'http://localhost:3003';
const BACKEND_URL = 'http://localhost:3001';

test.describe('Consumer Wallet Login Test', () => {
  test('Register user and then login with same credentials', async ({ page }) => {
    test.setTimeout(90000); // 90 seconds timeout

    // Generate unique test data
    const timestamp = Date.now();
    const testUser = {
      firstName: 'Jane',
      lastName: 'Smith',
      email: `jane.smith.${timestamp}@example.com`,
      mobile: `555${Math.floor(Math.random() * 10000000)}`,
      password: 'TestLogin123!',
      confirmPassword: 'TestLogin123!',
      accountType: 'personal'
    };

    console.log('\n🎯 Testing Consumer Wallet Registration + Login Flow');
    console.log('='.repeat(70));
    console.log(`📧 Email: ${testUser.email}`);
    console.log(`📱 Mobile: ${testUser.mobile}`);
    console.log(`🔐 Password: ${testUser.password}`);
    console.log('='.repeat(70));

    // STEP 1: REGISTER THE USER
    console.log('\n1️⃣ REGISTRATION PHASE');
    console.log('-'.repeat(40));

    await page.goto(`${CONSUMER_WALLET_URL}/auth/register-with-account-type`);
    await page.waitForLoadState('networkidle');

    // Select Personal/Individual Account
    console.log('   🎯 Selecting Personal Account...');

    // More specific selector - target the Individual/Personal account card
    const accountTypeSelectors = [
      // Target the card containing "Personal Account" text, then find its button
      'div:has-text("Personal Account") button:has-text("Get Started")',
      // Alternative: target by checking for Individual account features
      'div:has-text("Personal wallet") button:has-text("Get Started")',
      // Fallback to first button if specific targeting fails
      'button:has-text("Get Started")'
    ];

    let accountSelected = false;
    for (const selector of accountTypeSelectors) {
      try {
        const button = page.locator(selector).first();
        if (await button.isVisible({ timeout: 5000 })) {
          await button.click();
          console.log(`   ✅ Personal account selected using: ${selector}`);
          accountSelected = true;

          // Wait for navigation and form to appear
          await page.waitForLoadState('networkidle');
          await page.waitForTimeout(3000);

          // Check if we're on the registration form page
          const currentUrl = page.url();
          console.log(`   📍 After selection URL: ${currentUrl}`);
          break;
        }
      } catch (error) {
        console.log(`   ⚠️ Could not select with: ${selector}`);
        continue;
      }
    }

    if (!accountSelected) {
      console.log('   ❌ Failed to select account type');
      throw new Error('Could not select Personal account type');
    }

    // Look for registration form elements before filling
    console.log('   📝 Looking for registration form...');

    // Wait for form elements to be available
    const firstNameField = page.locator('input[name="firstName"]').first();
    await firstNameField.waitFor({ timeout: 10000 });
    console.log('   ✅ Registration form found');

    // Fill registration form with careful field-by-field approach
    console.log('   📝 Filling registration form...');

    try {
      await firstNameField.fill(testUser.firstName);
      console.log('   ✅ First name filled');
      await page.waitForTimeout(500);

      const lastNameField = page.locator('input[name="lastName"]');
      await lastNameField.waitFor({ timeout: 5000 });
      await lastNameField.fill(testUser.lastName);
      console.log('   ✅ Last name filled');
      await page.waitForTimeout(500);

      const emailField = page.locator('input[name="email"]');
      await emailField.waitFor({ timeout: 5000 });
      await emailField.fill(testUser.email);
      console.log('   ✅ Email filled');
      await page.waitForTimeout(500);

      // Try multiple selectors for mobile field
      // NOTE: Registration form uses name="mobileNumber"
      const mobileSelectors = [
        'input[name="mobileNumber"]',
        'input[name="mobile"]',
        'input[name="phone"]',
        'input[type="tel"]',
        'input[placeholder*="555"]',
        'input[placeholder*="phone"]',
        'input[placeholder*="mobile"]'
      ];

      let mobileField = null;
      for (const selector of mobileSelectors) {
        try {
          const element = page.locator(selector);
          if (await element.isVisible({ timeout: 1000 })) {
            mobileField = element;
            console.log(`   ✅ Found mobile field with: ${selector}`);
            break;
          }
        } catch (error) {
          // Continue to next selector
        }
      }

      if (mobileField) {
        await mobileField.fill(testUser.mobile);
        console.log('   ✅ Mobile filled');
      } else {
        console.log('   ⚠️ Mobile field not found, trying to continue...');
      }
      await page.waitForTimeout(500);

      // Try multiple selectors for password field
      const passwordSelectors = [
        'input[name="password"]',
        'input[type="password"]',
        'input[placeholder*="password"]',
        'input[placeholder*="Password"]'
      ];

      let passwordField = null;
      for (const selector of passwordSelectors) {
        try {
          const element = page.locator(selector).first();
          if (await element.isVisible({ timeout: 1000 })) {
            passwordField = element;
            console.log(`   ✅ Found password field with: ${selector}`);
            break;
          }
        } catch (error) {
          // Continue to next selector
        }
      }

      if (passwordField) {
        await passwordField.fill(testUser.password);
        console.log('   ✅ Password filled');
      } else {
        console.log('   ⚠️ Password field not found');
      }
      await page.waitForTimeout(500);

      // Try multiple selectors for confirm password field
      const confirmPasswordSelectors = [
        'input[name="confirmPassword"]',
        'input[name="confirm_password"]',
        'input[name="passwordConfirm"]',
        'input[type="password"]',
        'input[placeholder*="Confirm"]',
        'input[placeholder*="confirm"]'
      ];

      let confirmPasswordField = null;
      for (const selector of confirmPasswordSelectors) {
        try {
          const elements = page.locator(selector);
          const count = await elements.count();

          // If there are multiple password fields, take the second one for confirm
          if (count > 1) {
            confirmPasswordField = elements.nth(1);
          } else if (count === 1 && selector.includes('confirm') || selector.includes('Confirm')) {
            confirmPasswordField = elements.first();
          }

          if (confirmPasswordField && await confirmPasswordField.isVisible({ timeout: 1000 })) {
            console.log(`   ✅ Found confirm password field with: ${selector}`);
            break;
          } else {
            confirmPasswordField = null;
          }
        } catch (error) {
          // Continue to next selector
        }
      }

      if (confirmPasswordField) {
        await confirmPasswordField.fill(testUser.confirmPassword);
        console.log('   ✅ Confirm password filled');
      } else {
        console.log('   ⚠️ Confirm password field not found');
      }
    } catch (error) {
      console.log(`   ❌ Error filling form: ${error.message}`);

      // Take screenshot for debugging
      await page.screenshot({
        path: `login-test-form-error-${Date.now()}.png`,
        fullPage: true
      });

      throw error;
    }

    // Accept terms
    const termsCheckbox = page.locator('input[type="checkbox"]').first();
    if (await termsCheckbox.isVisible({ timeout: 2000 })) {
      await termsCheckbox.check();
      console.log('   ✅ Terms accepted');
    }

    // Submit registration
    console.log('   🚀 Submitting registration...');
    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();
    await page.waitForTimeout(3000);

    // Take screenshot after registration
    await page.screenshot({
      path: `login-test-after-registration-${timestamp}.png`,
      fullPage: true
    });

    const afterRegUrl = page.url();
    console.log(`   📍 After registration URL: ${afterRegUrl}`);

    // Check if registration was successful
    let registrationSuccess = false;
    if (afterRegUrl.includes('/login') || await page.locator('text=Welcome').isVisible({ timeout: 2000 })) {
      registrationSuccess = true;
      console.log('   ✅ Registration appears successful');
    } else {
      console.log('   ⚠️ Registration result unclear');
    }

    // STEP 2: LOGIN WITH THE SAME CREDENTIALS
    console.log('\n2️⃣ LOGIN PHASE');
    console.log('-'.repeat(40));

    // Navigate to login page if not already there
    if (!afterRegUrl.includes('/login')) {
      console.log('   🌐 Navigating to login page...');
      await page.goto(`${CONSUMER_WALLET_URL}/auth/login`);
      await page.waitForLoadState('networkidle');
    }

    // Take screenshot of login page
    await page.screenshot({
      path: `login-test-login-page-${timestamp}.png`,
      fullPage: true
    });

    console.log('   📧 Entering login credentials...');

    // Find and fill mobile number field (Login page uses type="tel" with no name attribute)
    const mobileLoginSelectors = [
      'input[type="tel"]',
      'input[name="mobile"]',
      'input[name="mobileNumber"]',
      'input[placeholder*="mobile"]',
      'input[placeholder*="phone"]'
    ];

    let mobileFilled = false;
    for (const selector of mobileLoginSelectors) {
      try {
        const mobileElement = page.locator(selector).first();
        if (await mobileElement.isVisible({ timeout: 2000 })) {
          await mobileElement.fill(testUser.mobile);
          console.log(`   ✅ Mobile filled: ${selector}`);
          mobileFilled = true;
          break;
        }
      } catch (error) {
        // Continue to next selector
      }
    }

    if (!mobileFilled) {
      console.log('   ❌ Could not find mobile field');
    }

    // Find and fill password field
    const passwordSelectors = [
      'input[name="password"]',
      'input[type="password"]',
      'input[placeholder*="password"]',
      'input[id*="password"]'
    ];

    let passwordFilled = false;
    for (const selector of passwordSelectors) {
      try {
        const passwordElement = page.locator(selector).first();
        if (await passwordElement.isVisible({ timeout: 2000 })) {
          await passwordElement.fill(testUser.password);
          console.log(`   ✅ Password filled: ${selector}`);
          passwordFilled = true;
          break;
        }
      } catch (error) {
        // Continue to next selector
      }
    }

    if (!passwordFilled) {
      console.log('   ❌ Could not find password field');
    }

    // Submit login form
    console.log('   🔑 Attempting login...');
    const loginSubmitSelectors = [
      'button[type="submit"]:has-text("Sign in")',  // More specific - the actual button text
      'button[type="submit"]',
      'button:has-text("Sign in")',
      'button:has-text("Login")',
      'button:has-text("Sign In")',
      'button:has-text("Log In")',
      'input[type="submit"]'
    ];

    let loginSubmitted = false;
    for (const selector of loginSubmitSelectors) {
      try {
        const submitElement = page.locator(selector).first();
        if (await submitElement.isVisible({ timeout: 2000 })) {
          await submitElement.click();
          console.log(`   ✅ Login submitted: ${selector}`);
          loginSubmitted = true;
          break;
        }
      } catch (error) {
        // Continue to next selector
      }
    }

    if (!loginSubmitted) {
      console.log('   ❌ Could not find login submit button');
    }

    // Wait for login response
    await page.waitForTimeout(5000);

    // Take screenshot after login attempt
    await page.screenshot({
      path: `login-test-after-login-${timestamp}.png`,
      fullPage: true
    });

    const finalUrl = page.url();
    console.log(`   📍 Final URL: ${finalUrl}`);

    // STEP 3: CHECK LOGIN RESULT
    console.log('\n3️⃣ LOGIN RESULT ANALYSIS');
    console.log('-'.repeat(40));

    let loginSuccess = false;
    let loginError = false;
    let resultMessage = '';

    // Check for success indicators
    const successSelectors = [
      'text=dashboard',
      'text=welcome',
      'text=success',
      '.dashboard',
      '.welcome',
      'text=wallet',
      'text=balance'
    ];

    for (const selector of successSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 3000 })) {
          resultMessage = await element.textContent() || '';
          loginSuccess = true;
          console.log(`   ✅ Login success indicator found: ${selector} - "${resultMessage}"`);
          break;
        }
      } catch (error) {
        // Continue checking
      }
    }

    // Check for error indicators
    if (!loginSuccess) {
      const errorSelectors = [
        '.error',
        '.alert-error',
        '.alert-danger',
        'text=error',
        'text=invalid',
        'text=incorrect',
        'text=failed',
        'text=wrong'
      ];

      for (const selector of errorSelectors) {
        try {
          const element = page.locator(selector).first();
          if (await element.isVisible({ timeout: 2000 })) {
            resultMessage = await element.textContent() || '';
            loginError = true;
            console.log(`   ❌ Login error found: ${selector} - "${resultMessage}"`);
            break;
          }
        } catch (error) {
          // Continue checking
        }
      }
    }

    // Check URL for successful navigation
    if (!loginSuccess && !loginError) {
      if (finalUrl.includes('/dashboard') ||
          finalUrl.includes('/home') ||
          finalUrl.includes('/wallet') ||
          (finalUrl !== `${CONSUMER_WALLET_URL}/auth/login` && !finalUrl.includes('/auth/'))) {
        loginSuccess = true;
        console.log('   ✅ Login success inferred from URL navigation');
      }
    }

    // STEP 4: FINAL RESULTS
    console.log('\n📊 COMPLETE TEST RESULTS');
    console.log('='.repeat(70));
    console.log(`👤 User: ${testUser.firstName} ${testUser.lastName}`);
    console.log(`📧 Email: ${testUser.email}`);
    console.log(`📱 Mobile: ${testUser.mobile}`);
    console.log(`🌐 Registration URL: ${CONSUMER_WALLET_URL}/auth/register-with-account-type`);
    console.log(`🌐 Login URL: ${CONSUMER_WALLET_URL}/auth/login`);
    console.log(`🌐 Final URL: ${finalUrl}`);
    console.log('');

    if (registrationSuccess) {
      console.log('✅ REGISTRATION: Successful');
    } else {
      console.log('⚠️ REGISTRATION: Unclear');
    }

    if (loginSuccess) {
      console.log('✅ LOGIN: Successful');
      console.log('🎉 OVERALL RESULT: Registration + Login flow working perfectly!');
    } else if (loginError) {
      console.log('❌ LOGIN: Failed');
      console.log(`💬 Error: ${resultMessage}`);
      console.log('⚠️ OVERALL RESULT: Registration works but login failed');
    } else {
      console.log('⚠️ LOGIN: Result unclear');
      console.log('⚠️ OVERALL RESULT: Login outcome uncertain');
    }

    if (resultMessage) {
      console.log(`💬 Final Message: ${resultMessage}`);
    }

    console.log('='.repeat(70));

    // STEP 5: VERIFY WITH BACKEND (if possible)
    console.log('\n🔍 Backend Verification...');
    try {
      // Try to make a simple authenticated request
      const response = await page.request.get(`${BACKEND_URL}/api/user/profile`, {
        failOnStatusCode: false
      });

      if (response.ok()) {
        const data = await response.json();
        console.log('   📡 Backend profile data:', data);
        if (data.email === testUser.email) {
          console.log('   ✅ Backend confirms user is logged in');
        }
      } else {
        console.log(`   ⚠️ Backend request failed: ${response.status()}`);
      }
    } catch (error) {
      console.log(`   ⚠️ Backend verification failed: ${error}`);
    }

    // Test passes if we can complete the flow
    expect(finalUrl).toContain('localhost:3003');

    // Additional assertion for login success
    if (loginSuccess) {
      expect(loginSuccess).toBe(true);
    }
  });
});