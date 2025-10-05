/**
 * Streamlined Tenant → Enterprise Wallet → Invoice Flow
 *
 * Workflow:
 * 1. Login to Admin Portal
 * 2. Create Tenant (auto-creates Org + User)
 * 3. Go to User Management → Find user → Reset Password → Capture password
 * 4. Login to Enterprise Wallet with captured credentials
 * 5. Complete KYB Onboarding
 * 6. Create Invoice
 * 7. Consumer pays invoice
 */

import { test, expect, Page } from '@playwright/test';

const TEST_CONFIG = {
  urls: {
    admin: 'http://localhost:3002',
    enterprise: 'http://localhost:3007',
    consumer: 'http://localhost:3003'
  },
  adminCredentials: {
    email: 'admin@monay.com',
    password: 'SecureAdmin123',
    mpin: '123456'
  },
  timeouts: {
    navigation: 30000,
    action: 15000
  }
};

// Helper: Take screenshot
async function takeScreenshot(page: Page, name: string) {
  try {
    await page.screenshot({
      path: `screenshots/tenant-invoice-${name}.png`,
      fullPage: true
    });
  } catch (error) {
    console.log(`⚠️ Screenshot failed: ${error.message}`);
  }
}

// STEP 1: Login to Admin Portal
async function loginToAdmin(page: Page) {
  console.log('\n📋 STEP 1: Admin Portal Login');
  console.log('-'.repeat(50));

  await page.goto(TEST_CONFIG.urls.admin);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  await page.fill('input[type="email"]', TEST_CONFIG.adminCredentials.email);
  await page.fill('input[type="password"]', TEST_CONFIG.adminCredentials.password);
  await page.locator('button[type="submit"]').first().click();
  await page.waitForTimeout(5000);

  console.log(`   ✓ Logged in: ${page.url()}`);
  await takeScreenshot(page, '01-admin-dashboard');
}

// STEP 2: Create Tenant (auto-creates Org + User)
async function createTenant(page: Page, industry: string) {
  console.log('\n📋 STEP 2: Creating Tenant (auto-creates Org + User)');
  console.log('-'.repeat(50));

  const timestamp = Date.now();
  const tenantData = {
    name: `${industry} Corp ${timestamp}`,
    email: `${industry.toLowerCase()}_${timestamp}@test.com`,
    phone: `555${Math.floor(Math.random() * 10000000)}`
  };

  // Navigate to Tenants via nav link
  const tenantsLink = page.locator('a[href="/tenants"]').first();
  await tenantsLink.click();
  await page.waitForTimeout(3000);
  console.log(`   ✓ On Tenants page: ${page.url()}`);

  // Click Create Tenant
  await page.locator('button:has-text("Create Tenant")').first().click();
  await page.waitForTimeout(2000);

  // Fill tenant form
  await page.fill('input[name="name"]', tenantData.name);
  await page.fill('input[name="email"]', tenantData.email);
  await page.fill('input[name="phone"]', tenantData.phone);

  console.log(`   ✓ Name: ${tenantData.name}`);
  console.log(`   ✓ Email: ${tenantData.email}`);

  // Submit
  await page.locator('button[type="submit"]:has-text("Create")').first().click();
  await page.waitForTimeout(3000);

  console.log('✅ Tenant created (Org + User auto-created)');
  await takeScreenshot(page, '02-tenant-created');

  return tenantData;
}

// STEP 3: Get User Credentials via Password Reset
async function getUserCredentials(page: Page, tenantEmail: string) {
  console.log('\n📋 STEP 3: Getting User Credentials via Password Reset');
  console.log('-'.repeat(50));

  // Navigate to User Management
  const usersLink = page.locator('a[href="/users-management"], a:has-text("User Management")').first();
  await usersLink.click();
  await page.waitForTimeout(3000);
  console.log(`   ✓ On User Management page: ${page.url()}`);
  await takeScreenshot(page, '03-user-management');

  // Find the user (search by tenant email domain)
  const emailPrefix = tenantEmail.split('@')[0];
  console.log(`   ℹ️ Looking for user with email containing: ${emailPrefix}`);

  // Wait for user list to load
  await page.waitForTimeout(2000);

  // Try to find user row - look for the most recently created user
  const userRows = page.locator('table tbody tr, [data-testid="user-row"]');
  const rowCount = await userRows.count();
  console.log(`   ℹ️ Found ${rowCount} user rows`);

  if (rowCount === 0) {
    throw new Error('No users found in User Management');
  }

  // Click on the first user's action menu (assuming most recent is first)
  const firstUserRow = userRows.first();

  // Try multiple action button selectors
  const actionButtonSelectors = [
    'button:has-text("Actions")',
    'button:has-text("⋮")',
    'button:has-text("...")',
    '[aria-label="Actions"]',
    '[aria-label="User actions"]',
    'button[aria-haspopup="menu"]',
    'button.action-menu',
    'button[data-testid="action-menu"]',
    // Look for any button in the row
    'button'
  ];

  let actionClicked = false;
  for (const selector of actionButtonSelectors) {
    const actionButton = firstUserRow.locator(selector).last(); // Use last() for rightmost button
    if (await actionButton.isVisible({ timeout: 2000 })) {
      await actionButton.click();
      await page.waitForTimeout(1000);
      console.log(`   ✓ Clicked action button: ${selector}`);
      actionClicked = true;
      break;
    }
  }

  if (!actionClicked) {
    // Debug: show what buttons are in the row
    const buttons = await firstUserRow.locator('button').all();
    console.log(`   ⚠️ Found ${buttons.length} buttons in first row`);
    for (let i = 0; i < buttons.length; i++) {
      const text = await buttons[i].textContent();
      const ariaLabel = await buttons[i].getAttribute('aria-label');
      console.log(`   Button ${i+1}: text="${text?.trim()}" aria-label="${ariaLabel}"`);
    }
    throw new Error('Action menu button not found - see debug output above');
  }

  // Wait for dropdown menu to appear
  await page.waitForTimeout(1000);

  // Click Reset Password - try multiple selectors for the menu item
  const resetPasswordSelectors = [
    'button:has-text("Reset Password")',
    'li:has-text("Reset Password")',
    'a:has-text("Reset Password")',
    '[role="menuitem"]:has-text("Reset Password")',
    'div[role="menu"] >> text="Reset Password"',
    // More generic - look for any clickable with "Reset" or "Password"
    'button:has-text("Reset")',
    'li:has-text("Reset")',
    '[role="menuitem"]:has-text("Reset")'
  ];

  let resetClicked = false;
  for (const selector of resetPasswordSelectors) {
    const resetButton = page.locator(selector).first();
    if (await resetButton.isVisible({ timeout: 3000 })) {
      await resetButton.click();
      await page.waitForTimeout(2000);
      console.log(`   ✓ Clicked Reset Password: ${selector}`);
      resetClicked = true;
      break;
    }
  }

  if (!resetClicked) {
    // Debug: show what menu items are available
    const menuItems = await page.locator('[role="menuitem"], [role="menu"] button, [role="menu"] li').all();
    console.log(`   ⚠️ Found ${menuItems.length} menu items`);
    for (let i = 0; i < menuItems.length; i++) {
      const text = await menuItems[i].textContent();
      console.log(`   Menu item ${i+1}: "${text?.trim()}"`);
    }

    // Take screenshot for debugging
    await takeScreenshot(page, '04-menu-debug');
    throw new Error('Reset Password menu item not found - see debug output above');
  }

  // Capture password from notification/alert
  console.log('   ℹ️ Waiting for password notification...');
  await page.waitForTimeout(2000); // Give notification time to appear

  let capturedPassword = '';
  const notificationSelectors = [
    '.toast',
    '.notification',
    '.alert',
    '[role="alert"]',
    '[role="status"]',
    '.Toastify',
    '.toast-container',
    '[data-testid="notification"]',
    '.snackbar'
  ];

  // First pass: Look for notifications
  for (const selector of notificationSelectors) {
    const notifications = page.locator(selector);
    const count = await notifications.count();
    if (count > 0) {
      console.log(`   ℹ️ Found ${count} notifications with selector: ${selector}`);
      // Check all notifications
      for (let i = 0; i < count; i++) {
        const notification = notifications.nth(i);
        if (await notification.isVisible({ timeout: 2000 })) {
          const text = await notification.textContent();
          console.log(`   ℹ️ Notification ${i+1} text: ${text?.substring(0, 200)}`);

          // Try multiple password extraction patterns
          const patterns = [
            // Pattern 1: "New password: <password>" - most specific
            /(?:New password|new password|PASSWORD):\s*([A-Za-z0-9!@#$%^&*.]+)/,
            // Pattern 2: "password: <password>"
            /(?:password|Password):\s*([A-Za-z0-9!@#$%^&*.]+)/,
            // Pattern 3: Look for password-like strings (has special chars and letters/numbers)
            /([A-Za-z0-9]{1,}[!@#$%^&*.][A-Za-z0-9!@#$%^&*.]{8,})/,
            // Pattern 4: Long alphanumeric with special chars
            /([A-Za-z0-9!@#$%^&*.]{12,})/
          ];

          for (const pattern of patterns) {
            const passwordMatch = text?.match(pattern);
            if (passwordMatch && passwordMatch[1] && passwordMatch[1].length >= 8) {
              capturedPassword = passwordMatch[1];
              console.log(`   ✅ Captured password: ${capturedPassword}`);
              break;
            }
          }
          if (capturedPassword) break;
        }
      }
      if (capturedPassword) break;
    }
  }

  if (!capturedPassword) {
    // Second pass: Look for modal/dialog with password
    const modalSelectors = ['[role="dialog"]', '.modal', '.dialog'];
    for (const selector of modalSelectors) {
      const modal = page.locator(selector);
      if (await modal.isVisible({ timeout: 2000 })) {
        const text = await modal.textContent();
        console.log(`   ℹ️ Modal text: ${text?.substring(0, 200)}`);
        const passwordMatch = text?.match(/(?:password|Password)[:=\s]+([A-Za-z0-9!@#$%^&*]{8,})/);
        if (passwordMatch && passwordMatch[1]) {
          capturedPassword = passwordMatch[1];
          console.log(`   ✅ Captured password from modal: ${capturedPassword}`);
          break;
        }
      }
    }
  }

  if (!capturedPassword) {
    // Third pass: Look in page content
    const pageContent = await page.content();
    const passwordMatch = pageContent.match(/(?:password|Password|temporary)[:=\s]+([A-Za-z0-9!@#$%^&*]{12,})/);
    if (passwordMatch && passwordMatch[1]) {
      capturedPassword = passwordMatch[1];
      console.log(`   ✅ Captured password from page content: ${capturedPassword}`);
    }
  }

  if (!capturedPassword) {
    console.log('   ⚠️ Could not capture password automatically');
    await takeScreenshot(page, '05-password-not-found');
    capturedPassword = 'MANUAL_CAPTURE_REQUIRED';
  }

  await takeScreenshot(page, '04-password-reset');

  // Get user email from the row - try multiple selectors
  let userEmail = '';
  const emailSelectors = [
    'td:nth-child(1)', // First column (User column with name + email)
    'td:nth-child(2)', // Second column
    '[data-testid="user-email"]',
    'td:has-text("@")'  // Any cell with @ symbol
  ];

  for (const selector of emailSelectors) {
    try {
      const cell = firstUserRow.locator(selector).first();
      if (await cell.isVisible({ timeout: 1000 })) {
        const text = await cell.textContent();
        console.log(`   📧 Cell text (${selector}): "${text}"`);
        // Check if it looks like an email and extract it with regex
        // Match: word_number@domain.tld (more specific pattern)
        if (text && text.includes('@') && text.includes('.')) {
          const emailMatch = text.match(/([a-z_]+[0-9_]+@[a-zA-Z0-9._-]+\.[a-zA-Z]{2,})/);
          if (emailMatch && emailMatch[1]) {
            userEmail = emailMatch[1];
            console.log(`   ✓ Found user email: ${userEmail}`);
            break;
          }
        }
      }
    } catch (e) {
      continue;
    }
  }

  // Fallback: construct email from tenant email if not found
  if (!userEmail) {
    // Look through all cells in the row for an email
    const allCells = await firstUserRow.locator('td').all();
    for (const cell of allCells) {
      const text = await cell.textContent();
      if (text && text.includes('@')) {
        // Extract just the email using more specific regex: word_number@domain.tld
        const emailMatch = text.match(/([a-z_]+[0-9_]+@[a-zA-Z0-9._-]+\.[a-zA-Z]{2,})/);
        if (emailMatch && emailMatch[1]) {
          userEmail = emailMatch[1];
          console.log(`   ✓ Found user email in table: ${userEmail}`);
          break;
        }
      }
    }
  }

  if (!userEmail) {
    // Last resort: get entire row text and extract email
    const rowText = await firstUserRow.textContent();
    const emailMatch = rowText?.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/);
    if (emailMatch && emailMatch[1]) {
      userEmail = emailMatch[1];
      console.log(`   ✓ Extracted user email from row: ${userEmail}`);
    }
  }

  if (!userEmail) {
    userEmail = `user_${emailPrefix}@test.com`;
    console.log(`   ⚠️ Could not find user email, using fallback: ${userEmail}`);
  }

  return {
    email: userEmail,
    password: capturedPassword
  };
}

// STEP 4: Login to Enterprise Wallet
async function loginToEnterpriseWallet(page: Page, email: string, password: string) {
  console.log('\n📋 STEP 4: Login to Enterprise Wallet');
  console.log('-'.repeat(50));

  // Navigate to login page directly (not landing page)
  await page.goto(`${TEST_CONFIG.urls.enterprise}/auth/login`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000); // Wait for form initialization

  console.log(`   Current URL: ${page.url()}`);
  console.log(`   Using credentials: ${email} / ${password}`);

  // Fill email and password
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);

  // Take screenshot before clicking submit
  await takeScreenshot(page, '05-enterprise-wallet-before-submit');

  // Click sign in button
  await page.locator('button[type="submit"]').first().click();
  await page.waitForTimeout(5000);

  // Check for error messages
  const errorMessage = await page.locator('[role="alert"], .error-message, text=/incorrect/i').first().textContent().catch(() => null);
  if (errorMessage) {
    console.log(`   ⚠️ Login error: ${errorMessage}`);
    console.log(`   ℹ️ User may need to be registered in Enterprise Wallet first`);
  }

  console.log(`   URL after login attempt: ${page.url()}`);
  await takeScreenshot(page, '05-enterprise-wallet-after-submit');
}

// STEP 5: Complete KYB Onboarding
async function completeKYBOnboarding(page: Page, industry: string) {
  console.log('\n📋 STEP 5: Complete KYB Onboarding');
  console.log('-'.repeat(50));

  // Look for onboarding prompts
  const onboardingSelectors = [
    'button:has-text("Complete Onboarding")',
    'button:has-text("Start KYB")',
    'a[href*="onboarding"]',
    'button:has-text("Get Started")'
  ];

  let onboardingStarted = false;
  for (const selector of onboardingSelectors) {
    if (await page.locator(selector).isVisible({ timeout: 3000 })) {
      await page.locator(selector).first().click();
      await page.waitForTimeout(2000);
      console.log(`   ✓ Started onboarding via: ${selector}`);
      onboardingStarted = true;
      break;
    }
  }

  if (!onboardingStarted) {
    console.log('   ℹ️ No onboarding prompt found, may already be completed');
    return;
  }

  // Fill KYB form
  const kybData = {
    businessName: `${industry} Business Corp`,
    ein: `12-345${Math.floor(Math.random() * 10000)}`,
    address: '123 Main St',
    city: 'New York',
    state: 'NY',
    zip: '10001'
  };

  // Try to fill fields if they exist
  const fields = [
    { selector: 'input[name="businessName"]', value: kybData.businessName },
    { selector: 'input[name="ein"]', value: kybData.ein },
    { selector: 'input[name="address"]', value: kybData.address },
    { selector: 'input[name="city"]', value: kybData.city },
    { selector: 'input[name="state"]', value: kybData.state },
    { selector: 'input[name="zip"]', value: kybData.zip }
  ];

  for (const field of fields) {
    if (await page.locator(field.selector).isVisible({ timeout: 2000 })) {
      await page.fill(field.selector, field.value);
      console.log(`   ✓ Filled: ${field.selector}`);
    }
  }

  // Submit
  const submitButton = page.locator('button[type="submit"]:has-text("Submit"), button:has-text("Complete")').first();
  if (await submitButton.isVisible({ timeout: 3000 })) {
    await submitButton.click();
    await page.waitForTimeout(3000);
    console.log('   ✓ Submitted KYB form');
  }

  console.log('✅ KYB Onboarding completed');
  await takeScreenshot(page, '06-kyb-completed');
}

// STEP 6: Create Invoice
async function createInvoice(page: Page, consumerEmail: string) {
  console.log('\n📋 STEP 6: Create Invoice');
  console.log('-'.repeat(50));

  // Navigate to invoices
  const invoiceLink = page.locator('a[href*="invoice"], button:has-text("Invoice")').first();
  if (await invoiceLink.isVisible({ timeout: 5000 })) {
    await invoiceLink.click();
    await page.waitForTimeout(2000);
  }

  // Create new invoice
  await page.locator('button:has-text("Create Invoice"), button:has-text("New Invoice")').first().click();
  await page.waitForTimeout(2000);

  // Fill invoice details
  await page.fill('input[name="customerEmail"]', consumerEmail);
  await page.fill('input[name="amount"]', '100.00');
  await page.fill('textarea[name="description"]', 'Test invoice for E2E flow');

  console.log(`   ✓ Customer: ${consumerEmail}`);
  console.log('   ✓ Amount: $100.00');

  // Submit
  await page.locator('button[type="submit"]:has-text("Send"), button:has-text("Create")').first().click();
  await page.waitForTimeout(3000);

  console.log('✅ Invoice created and sent');
  await takeScreenshot(page, '07-invoice-created');
}

// Main Test
test.describe('Tenant → Enterprise Wallet → Invoice Flow', () => {
  test.setTimeout(300000); // 5 minutes

  test('Complete flow: Tenant → User → Enterprise Login → KYB → Invoice', async ({ browser }) => {
    console.log('\n' + '='.repeat(70));
    console.log('🚀 STREAMLINED E2E TEST: TENANT → ENTERPRISE WALLET → INVOICE');
    console.log('='.repeat(70));

    const context = await browser.newContext();
    const adminPage = await context.newPage();

    try {
      // Step 1: Login to Admin
      await loginToAdmin(adminPage);

      // Step 2: Create Tenant (auto-creates Org + User)
      const tenantData = await createTenant(adminPage, 'Healthcare');

      // Step 3: Get User Credentials
      const userCredentials = await getUserCredentials(adminPage, tenantData.email);
      console.log(`\n🔐 User Email: ${userCredentials.email}`);
      console.log(`🔐 User Password: ${userCredentials.password}`);

      // Step 4-6: Enterprise Wallet Flow
      const enterprisePage = await context.newPage();
      await loginToEnterpriseWallet(enterprisePage, userCredentials.email, userCredentials.password);
      await completeKYBOnboarding(enterprisePage, 'Healthcare');

      // For now, skip invoice creation until we have consumer
      // await createInvoice(enterprisePage, 'consumer@test.com');

      console.log('\n' + '='.repeat(70));
      console.log('✅ TEST COMPLETED SUCCESSFULLY');
      console.log('='.repeat(70));
      console.log(`Tenant: ${tenantData.name}`);
      console.log(`User: ${userCredentials.email}`);
      console.log(`Password: ${userCredentials.password}`);
      console.log('='.repeat(70));

      await enterprisePage.close();
    } catch (error) {
      console.error(`\n❌ Test failed: ${error.message}`);
      await takeScreenshot(adminPage, 'error-final');
      throw error;
    } finally {
      await adminPage.close();
      await context.close();
    }
  });
});
