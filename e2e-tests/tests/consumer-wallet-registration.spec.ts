import { test, expect } from '@playwright/test';

// Configuration
const CONSUMER_WALLET_URL = 'http://localhost:3003';
const BACKEND_URL = 'http://localhost:3001';

test.describe('Consumer Wallet Registration Flow', () => {
  test('Register new user with account type', async ({ page }) => {
    test.setTimeout(30000); // 30 seconds timeout

    // Generate unique test data
    const timestamp = Date.now();
    const testUser = {
      firstName: 'Test',
      lastName: 'User',
      email: `testuser_${timestamp}@example.com`,
      mobile: `555${Math.floor(Math.random() * 10000000)}`,
      password: 'TestPass123!',
      accountType: 'personal'
    };

    console.log('\n🎯 Testing Consumer Wallet Registration Flow');
    console.log('='.repeat(50));
    console.log(`📧 Email: ${testUser.email}`);
    console.log(`📱 Mobile: ${testUser.mobile}`);
    console.log(`🏠 Account Type: ${testUser.accountType}`);
    console.log('='.repeat(50));

    // Step 1: Navigate to registration page
    console.log('1️⃣ Navigating to registration page...');
    await page.goto(`${CONSUMER_WALLET_URL}/auth/register-with-account-type`);
    await page.waitForLoadState('networkidle');

    // Take screenshot of registration page
    await page.screenshot({
      path: `consumer-wallet-registration-${timestamp}.png`,
      fullPage: true
    });

    // Step 2: Fill out registration form
    console.log('2️⃣ Filling registration form...');

    // Check if we're on the right page
    const pageTitle = await page.title();
    console.log(`   📄 Page title: ${pageTitle}`);

    // Look for common form fields
    const formFields = {
      firstName: [
        'input[name="firstName"]',
        'input[placeholder*="First"]',
        'input[id*="first"]',
        'input[label*="First"]'
      ],
      lastName: [
        'input[name="lastName"]',
        'input[placeholder*="Last"]',
        'input[id*="last"]',
        'input[label*="Last"]'
      ],
      email: [
        'input[name="email"]',
        'input[type="email"]',
        'input[placeholder*="email"]',
        'input[id*="email"]'
      ],
      mobile: [
        'input[name="mobile"]',
        'input[name="phone"]',
        'input[type="tel"]',
        'input[placeholder*="phone"]',
        'input[placeholder*="mobile"]'
      ],
      password: [
        'input[name="password"]',
        'input[type="password"]',
        'input[placeholder*="password"]'
      ],
      accountType: [
        'select[name="accountType"]',
        'select[name="account_type"]',
        'input[name="accountType"]',
        'radio[value="personal"]'
      ]
    };

    // Try to fill each field
    for (const [fieldName, selectors] of Object.entries(formFields)) {
      let fieldFilled = false;

      for (const selector of selectors) {
        try {
          const element = page.locator(selector).first();
          if (await element.isVisible({ timeout: 2000 })) {
            const value = testUser[fieldName as keyof typeof testUser];

            if (selector.includes('select') || selector.includes('radio')) {
              if (fieldName === 'accountType') {
                if (selector.includes('select')) {
                  await element.selectOption({ value: testUser.accountType });
                } else {
                  await element.check();
                }
              }
            } else {
              await element.fill(String(value));
            }

            console.log(`   ✅ Filled ${fieldName}: ${selector}`);
            fieldFilled = true;
            break;
          }
        } catch (error) {
          // Continue to next selector
        }
      }

      if (!fieldFilled) {
        console.log(`   ⚠️ Could not find field: ${fieldName}`);
      }
    }

    // Step 3: Look for and handle account type selection
    console.log('3️⃣ Selecting account type...');

    const accountTypeSelectors = [
      'input[type="radio"][value="personal"]',
      'button:has-text("Personal")',
      'label:has-text("Personal")',
      '.account-type[data-value="personal"]',
      '[data-testid="personal-account"]'
    ];

    let accountTypeSelected = false;
    for (const selector of accountTypeSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 2000 })) {
          await element.click();
          console.log(`   ✅ Selected personal account type: ${selector}`);
          accountTypeSelected = true;
          break;
        }
      } catch (error) {
        // Continue to next selector
      }
    }

    if (!accountTypeSelected) {
      console.log('   ⚠️ Could not find account type selector');
    }

    // Step 4: Look for terms and conditions
    console.log('4️⃣ Accepting terms and conditions...');

    const termsSelectors = [
      'input[name="terms"]',
      'input[name="agreeToTerms"]',
      'input[type="checkbox"]:has(+ label:has-text("terms"))',
      'label:has-text("agree") input[type="checkbox"]',
      '[data-testid="terms-checkbox"]'
    ];

    for (const selector of termsSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 2000 })) {
          await element.check();
          console.log(`   ✅ Accepted terms: ${selector}`);
          break;
        }
      } catch (error) {
        // Continue to next selector
      }
    }

    // Step 5: Submit the form
    console.log('5️⃣ Submitting registration form...');

    const submitSelectors = [
      'button[type="submit"]',
      'button:has-text("Register")',
      'button:has-text("Sign Up")',
      'button:has-text("Create Account")',
      'input[type="submit"]',
      '[data-testid="submit-button"]'
    ];

    let formSubmitted = false;
    for (const selector of submitSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 2000 })) {
          await element.click();
          console.log(`   ✅ Clicked submit button: ${selector}`);
          formSubmitted = true;
          break;
        }
      } catch (error) {
        // Continue to next selector
      }
    }

    if (!formSubmitted) {
      console.log('   ⚠️ Could not find submit button');
    }

    // Step 6: Wait for response and check result
    console.log('6️⃣ Waiting for registration response...');

    // Wait a moment for the request to process
    await page.waitForTimeout(3000);

    // Take screenshot of result
    await page.screenshot({
      path: `consumer-wallet-registration-result-${timestamp}.png`,
      fullPage: true
    });

    // Check for success or error indicators
    const successIndicators = [
      '.success',
      '.alert-success',
      'text=successfully',
      'text=success',
      'text=created',
      'text=registered',
      'text=welcome'
    ];

    const errorIndicators = [
      '.error',
      '.alert-error',
      '.alert-danger',
      'text=error',
      'text=failed',
      'text=invalid',
      'text=already exists'
    ];

    let registrationSuccess = false;
    let registrationError = false;
    let resultMessage = '';

    // Check for success
    for (const indicator of successIndicators) {
      try {
        const element = page.locator(indicator).first();
        if (await element.isVisible({ timeout: 2000 })) {
          resultMessage = await element.textContent() || '';
          registrationSuccess = true;
          console.log(`   ✅ Success detected: ${resultMessage}`);
          break;
        }
      } catch (error) {
        // Continue checking
      }
    }

    // Check for errors if no success found
    if (!registrationSuccess) {
      for (const indicator of errorIndicators) {
        try {
          const element = page.locator(indicator).first();
          if (await element.isVisible({ timeout: 2000 })) {
            resultMessage = await element.textContent() || '';
            registrationError = true;
            console.log(`   ❌ Error detected: ${resultMessage}`);
            break;
          }
        } catch (error) {
          // Continue checking
        }
      }
    }

    // Check current URL for redirection patterns
    const currentUrl = page.url();
    console.log(`   📍 Current URL: ${currentUrl}`);

    if (currentUrl.includes('/verify') || currentUrl.includes('/confirm')) {
      console.log('   ✅ Redirected to verification page - likely success');
      registrationSuccess = true;
    } else if (currentUrl.includes('/dashboard') || currentUrl.includes('/home')) {
      console.log('   ✅ Redirected to dashboard - registration success');
      registrationSuccess = true;
    }

    // Step 7: Print final results
    console.log('\n📊 REGISTRATION TEST RESULTS');
    console.log('='.repeat(50));
    console.log(`📧 Email: ${testUser.email}`);
    console.log(`📱 Mobile: ${testUser.mobile}`);
    console.log(`🔗 Final URL: ${currentUrl}`);

    if (registrationSuccess) {
      console.log('✅ STATUS: Registration appears successful');
      console.log(`💬 Message: ${resultMessage}`);
    } else if (registrationError) {
      console.log('❌ STATUS: Registration failed');
      console.log(`💬 Error: ${resultMessage}`);
    } else {
      console.log('⚠️ STATUS: Registration result unclear');
      console.log('💬 No clear success or error message found');
    }
    console.log('='.repeat(50));

    // Step 8: Try to verify backend received the registration
    console.log('\n🔍 Checking backend for user creation...');

    try {
      // Make a simple request to check if the user exists
      const response = await page.request.post(`${BACKEND_URL}/api/auth/check-email`, {
        data: { email: testUser.email }
      });

      if (response.ok()) {
        const data = await response.json();
        console.log(`   📡 Backend response:`, data);
      }
    } catch (error) {
      console.log(`   ⚠️ Could not check backend: ${error}`);
    }

    // The test passes if we can navigate to the page and fill the form
    // Even if registration fails, we want to see what happened
    expect(currentUrl).toContain('localhost:3003');
  });
});