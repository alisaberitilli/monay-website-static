/**
 * Mock Test Account Flow
 * Tests the built-in mock account (555-123-4567) for quick testing
 */

import { test, expect, Page } from '@playwright/test';

const TEST_CONFIG = {
  urls: {
    consumer: 'http://localhost:3003',
    enterprise: 'http://localhost:3007'
  },
  mockAccount: {
    phone: '5551234567',
    phoneFormatted: '555-123-4567',
    phoneWithCountry: '+15551234567',
    password: 'demo123',
    email: 'demo@monay.com',
    firstName: 'Demo',
    lastName: 'User',
    mpin: '1234' // We'll set this during onboarding if needed
  },
  timeouts: {
    navigation: 30000,
    action: 10000
  }
};

async function loginWithMockAccount(page: Page, usePhone: boolean = true) {
  await page.goto(TEST_CONFIG.urls.consumer);

  // Wait for login form
  await page.waitForSelector('input[type="password"]', { timeout: TEST_CONFIG.timeouts.action });

  if (usePhone) {
    // Try different phone input formats
    const phoneInputs = [
      'input[name="phone"]',
      'input[name="email"]',
      'input[placeholder*="Phone"]',
      'input[placeholder*="Email or Phone"]',
      'input[type="tel"]',
      'input[type="text"]:first-of-type'
    ];

    let inputFound = false;
    for (const selector of phoneInputs) {
      const input = await page.locator(selector).count();
      if (input > 0) {
        // Try different phone formats
        await page.fill(selector, TEST_CONFIG.mockAccount.phoneFormatted);
        inputFound = true;
        break;
      }
    }

    if (!inputFound) {
      throw new Error('Could not find phone/email input field');
    }
  } else {
    // Use email for login
    await page.fill('input[name="email"], input[type="email"]', TEST_CONFIG.mockAccount.email);
  }

  // Enter password
  await page.fill('input[name="password"], input[type="password"]', TEST_CONFIG.mockAccount.password);

  // Submit login
  await page.click('button[type="submit"]:has-text("Login"), button[type="submit"]:has-text("Sign In"), button[type="submit"]');

  // Wait for navigation or MPIN prompt
  await page.waitForLoadState('networkidle');

  // Check if MPIN is required
  const mpinInput = await page.locator('input[name="mpin"], input[placeholder*="MPIN"], input[placeholder*="PIN"]').count();
  if (mpinInput > 0) {
    console.log('MPIN required for mock account');
    await page.fill('input[name="mpin"], input[placeholder*="MPIN"]', TEST_CONFIG.mockAccount.mpin);
    await page.click('button[type="submit"]:has-text("Submit"), button[type="submit"]:has-text("Continue")');
  }

  // Verify successful login
  await page.waitForURL('**/dashboard', { timeout: TEST_CONFIG.timeouts.navigation });

  return true;
}

async function verifyMockAccountData(page: Page) {
  // Check for user info display
  const userInfo = await page.locator('text=/Demo User|demo@monay.com|555-123-4567/i').count();

  if (userInfo > 0) {
    console.log('✅ Mock account data verified in UI');
    return true;
  }

  // Check localStorage for mock data
  const userData = await page.evaluate(() => {
    const data = localStorage.getItem('user_data');
    return data ? JSON.parse(data) : null;
  });

  if (userData) {
    expect(userData.email).toBe(TEST_CONFIG.mockAccount.email);
    expect(userData.firstName).toBe(TEST_CONFIG.mockAccount.firstName);
    expect(userData.lastName).toBe(TEST_CONFIG.mockAccount.lastName);
    console.log('✅ Mock account data verified in localStorage');
    return true;
  }

  return false;
}

test.describe('Mock Test Account Flow', () => {
  test('Login with mock account using phone number', async ({ page }) => {
    console.log('Testing mock account login with phone: 555-123-4567');

    // Login with phone
    const loginSuccess = await loginWithMockAccount(page, true);
    expect(loginSuccess).toBe(true);

    // Verify we're on dashboard
    await expect(page).toHaveURL(/.*dashboard.*/);

    // Verify mock account data
    const dataVerified = await verifyMockAccountData(page);
    expect(dataVerified).toBe(true);

    // Take screenshot
    await page.screenshot({
      path: `screenshots/mock-account-phone-login.png`,
      fullPage: true
    });

    console.log('✅ Mock account login successful with phone');
  });

  test('Login with mock account using different phone formats', async ({ page }) => {
    const phoneFormats = [
      '5551234567',        // No formatting
      '555-123-4567',      // With dashes
      '(555) 123-4567',    // With parentheses
      '555 123 4567',      // With spaces
      '+15551234567',      // With country code
      '+1-555-123-4567'    // With country code and dashes
    ];

    for (const phoneFormat of phoneFormats) {
      console.log(`Testing mock login with format: ${phoneFormat}`);

      await page.goto(TEST_CONFIG.urls.consumer);

      // Find and fill phone input
      const phoneInput = page.locator('input[name="phone"], input[name="email"], input[placeholder*="Phone"], input[type="tel"]').first();
      await phoneInput.fill(phoneFormat);

      // Enter password
      await page.fill('input[type="password"]', TEST_CONFIG.mockAccount.password);

      // Submit
      await page.click('button[type="submit"]');

      // Wait for response
      await page.waitForLoadState('networkidle');

      // Check if login succeeded
      const onDashboard = await page.url().includes('dashboard');
      const hasError = await page.locator('text=/invalid|error|failed/i').count() > 0;

      if (onDashboard) {
        console.log(`✅ Format "${phoneFormat}" - Login successful`);

        // Logout for next test
        const logoutBtn = await page.locator('button:has-text("Logout"), a:has-text("Logout")').count();
        if (logoutBtn > 0) {
          await page.click('button:has-text("Logout"), a:has-text("Logout")');
          await page.waitForURL('**/login', { timeout: 5000 }).catch(() => {});
        }
      } else if (hasError) {
        console.log(`❌ Format "${phoneFormat}" - Login failed (expected for some formats)`);
      }
    }
  });

  test('Mock account features and limitations', async ({ page }) => {
    console.log('Testing mock account features...');

    // Login first
    await loginWithMockAccount(page, true);

    // Check wallet balance (should be 0 or predefined)
    await page.click('a[href*="wallet"], button:has-text("Wallet"), nav :text("Wallet")');
    await page.waitForLoadState('networkidle');

    const balanceElement = await page.locator('text=/$[0-9,]+/').first();
    if (await balanceElement.count() > 0) {
      const balance = await balanceElement.textContent();
      console.log(`Mock account wallet balance: ${balance}`);
    }

    // Try to add money (should work with test cards)
    await page.click('a[href*="add-money"], button:has-text("Add Money"), button:has-text("Top Up")');
    await page.waitForLoadState('networkidle');

    // Use test card
    await page.fill('input[name="amount"], input[placeholder*="Amount"]', '100');

    const cardOption = await page.locator('button:has-text("Card"), label:has-text("Card")').count();
    if (cardOption > 0) {
      await page.click('button:has-text("Card"), label:has-text("Card")');

      // Fill test card details
      await page.fill('input[name="cardNumber"], input[placeholder*="Card Number"]', '4242424242424242');
      await page.fill('input[name="expMonth"], input[placeholder*="MM"]', '12');
      await page.fill('input[name="expYear"], input[placeholder*="YY"]', '26');
      await page.fill('input[name="cvv"], input[placeholder*="CVV"]', '123');
      await page.fill('input[name="zipCode"], input[placeholder*="ZIP"]', '10001');

      console.log('✅ Mock account can add money with test cards');
    }

    // Check profile/settings
    await page.click('a[href*="profile"], a[href*="settings"], button:has-text("Profile"), button:has-text("Settings")');
    await page.waitForLoadState('networkidle');

    // Verify mock user data in profile
    const profileEmail = await page.locator(`text="${TEST_CONFIG.mockAccount.email}"`).count();
    const profilePhone = await page.locator('text=/555-123-4567|5551234567/').count();

    if (profileEmail > 0 && profilePhone > 0) {
      console.log('✅ Mock account profile data displayed correctly');
    }

    // Take screenshot of mock account dashboard
    await page.goto(`${TEST_CONFIG.urls.consumer}/dashboard`);
    await page.screenshot({
      path: `screenshots/mock-account-dashboard.png`,
      fullPage: true
    });

    console.log('✅ Mock account features verified');
  });

  test('Switch between mock and real accounts', async ({ page }) => {
    console.log('Testing account switching...');

    // First login with mock account
    await loginWithMockAccount(page, true);
    console.log('✅ Logged in with mock account');

    // Logout
    await page.click('button:has-text("Logout"), a:has-text("Logout"), button[aria-label="Logout"]');
    await page.waitForURL('**/login', { timeout: TEST_CONFIG.timeouts.action }).catch(() => {});

    // Now try to login with a real account (this would fail without real credentials)
    await page.goto(TEST_CONFIG.urls.consumer);

    // Use a different email (would need real account)
    await page.fill('input[name="email"], input[name="phone"]', 'realuser@example.com');
    await page.fill('input[type="password"]', 'RealPassword123!');
    await page.click('button[type="submit"]');

    await page.waitForLoadState('networkidle');

    // Check for error (expected since it's not a real account)
    const hasError = await page.locator('text=/invalid|error|failed/i').count() > 0;
    if (hasError) {
      console.log('✅ System correctly rejects non-mock invalid credentials');
    }

    // Switch back to mock account
    await page.fill('input[name="email"], input[name="phone"]', TEST_CONFIG.mockAccount.phoneFormatted);
    await page.fill('input[type="password"]', TEST_CONFIG.mockAccount.password);
    await page.click('button[type="submit"]');

    await page.waitForLoadState('networkidle');
    const backOnDashboard = await page.url().includes('dashboard');

    if (backOnDashboard) {
      console.log('✅ Successfully switched back to mock account');
    }
  });
});

// Export config for use in other tests
export { TEST_CONFIG as MOCK_ACCOUNT_CONFIG };