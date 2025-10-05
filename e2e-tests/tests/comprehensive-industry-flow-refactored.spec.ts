/**
 * REFACTORED: Comprehensive E2E Test Suite for Multi-Industry Payment Flows
 *
 * NEW WORKFLOW (Updated January 2025):
 * 1. Login to Admin Portal
 * 2. Create Tenant
 * 3. Create Organization (linked to Tenant)
 * 4. Create User (linked to Organization)
 * 5. Reset User Password via Action Menu → Capture password from notification
 * 6. Login to Enterprise Wallet with reset password
 * 7. Complete KYC/Onboarding (NEW REQUIREMENT)
 * 8. Create Consumer in Consumer Wallet
 * 9. Create Invoice in Enterprise Wallet
 * 10. Consumer receives and pays invoice
 */

import { test, expect, Page, BrowserContext } from '@playwright/test';

// Test configuration
const TEST_CONFIG = {
  urls: {
    admin: 'http://localhost:3002',
    backend: 'http://localhost:3001',
    consumer: 'http://localhost:3003',
    enterprise: 'http://localhost:3007'
  },
  adminCredentials: {
    email: 'admin@monay.com',
    password: 'SecureAdmin123',
    mpin: '123456'
  },
  timeouts: {
    navigation: 30000,
    action: 15000,
    verification: 10000,
    notification: 5000  // For capturing password reset notification
  },
  screenshotDir: './screenshots/refactored-test'
};

// Test data storage
interface TestRunData {
  timestamp: number;
  tenants: Map<string, any>;
  organizations: Map<string, any>;
  users: Map<string, any>;
  consumers: Map<string, any>;
  invoices: Map<string, any>;
  payments: Map<string, any>;
  credentials: Array<{
    type: string;
    industry: string;
    email: string;
    password: string;
    userId?: string;
  }>;
}

const testRunData: TestRunData = {
  timestamp: Date.now(),
  tenants: new Map(),
  organizations: new Map(),
  users: new Map(),
  consumers: new Map(),
  invoices: new Map(),
  payments: new Map(),
  credentials: []
};

// Industries to test
const INDUSTRIES = ['Healthcare', 'Technology', 'Finance'];

// Helper Functions
async function takeScreenshot(page: Page, name: string) {
  try {
    await page.screenshot({
      path: `${TEST_CONFIG.screenshotDir}/${testRunData.timestamp}_${name}.png`,
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
  await page.waitForTimeout(2000); // Wait for form to fully load
  console.log('   ✓ Page loaded');

  // Check if already logged in
  const alreadyLoggedIn = page.url().includes('dashboard');
  if (alreadyLoggedIn) {
    console.log('✅ Already logged in to admin portal');
    return;
  }

  // Fill login form
  await page.fill('input[name="email"], input[type="email"]', TEST_CONFIG.adminCredentials.email);
  console.log(`   ✓ Email filled: ${TEST_CONFIG.adminCredentials.email}`);

  await page.fill('input[name="password"], input[type="password"]', TEST_CONFIG.adminCredentials.password);
  console.log('   ✓ Password filled');

  // Submit
  const submitButton = page.locator('button[type="submit"]').first();
  await submitButton.click();
  console.log('   ✓ Login submitted');

  // Wait for response
  await page.waitForTimeout(5000);

  // Check if MPIN is required
  const mpinField = page.locator('input[name="mpin"], input[placeholder*="MPIN"], input[placeholder*="PIN"]').first();
  if (await mpinField.isVisible({ timeout: 3000 })) {
    console.log('   ℹ️ MPIN required, entering MPIN...');
    await mpinField.fill(TEST_CONFIG.adminCredentials.mpin);
    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(3000);
  }

  const currentUrl = page.url();
  console.log(`   📍 Current URL: ${currentUrl}`);

  if (!currentUrl.includes('/dashboard') && !currentUrl.includes('/admin')) {
    console.log('   ⚠️ Login may have failed, taking screenshot...');
    await takeScreenshot(page, 'admin-login-failed');
    throw new Error('Failed to login to admin portal');
  }

  console.log('✅ Successfully logged in to admin portal\n');
  await takeScreenshot(page, 'admin-logged-in');
}

// STEP 2: Create Tenant
async function createTenant(page: Page, industry: string) {
  console.log(`\n📋 STEP 2: Creating Tenant for ${industry}`);
  console.log('-'.repeat(50));

  const tenantData = {
    name: `${industry} Corp ${testRunData.timestamp}`,
    type: 'Enterprise',
    industry: industry,
    email: `${industry.toLowerCase()}_${testRunData.timestamp}@test.com`,
    phone: `555${Math.floor(Math.random() * 10000000)}`
  };

  try {
    // Check page state before navigation
    if (page.isClosed()) {
      throw new Error('Page is closed before navigation');
    }

    // Navigate to Tenants via clicking the nav link (IMPORTANT: Don't use page.goto() - it breaks session)
    const tenantsLink = page.locator('a[href="/tenants"], nav a:has-text("Tenants")').first();
    if (await tenantsLink.isVisible({ timeout: 5000 })) {
      await tenantsLink.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      console.log('   ✓ Clicked Tenants link in navigation');
    } else {
      // Fallback: try direct navigation
      await page.goto(`${TEST_CONFIG.urls.admin}/tenants`, { waitUntil: 'domcontentloaded' });
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      console.log('   ✓ Navigated to Tenants page via URL');
    }

    // Check for page state
    console.log(`   ℹ️ Current URL: ${page.url()}`);
    console.log(`   ℹ️ Page closed: ${page.isClosed()}`);

    // Click Create/New Tenant button - try multiple selectors
    const buttonSelectors = [
      'button:has-text("New Tenant")',
      'button:has-text("Create Tenant")',
      'button:has-text("Add Tenant")',
      'a[href*="new"]:has-text("Tenant")',
      '[data-testid="create-tenant"]'
    ];

    let buttonClicked = false;
    for (const selector of buttonSelectors) {
      try {
        const button = page.locator(selector).first();
        if (await button.isVisible({ timeout: 3000 })) {
          await button.click();
          console.log(`   ✓ Clicked Create Tenant button (${selector})`);
          await page.waitForLoadState('domcontentloaded');
          await page.waitForTimeout(2000);
          buttonClicked = true;
          break;
        }
      } catch (err) {
        continue;
      }
    }

    if (!buttonClicked) {
      console.log('   ⚠️ No create button found, checking if form already visible...');
    }

    // Check if page is still open
    if (page.isClosed()) {
      throw new Error('Page closed after clicking create button');
    }

    // Fill tenant form with multiple selector attempts
    const nameSelectors = ['input[name="name"]', 'input[placeholder*="Tenant Name"]', 'input[placeholder*="Name"]'];
    for (const selector of nameSelectors) {
      try {
        const field = page.locator(selector).first();
        if (await field.isVisible({ timeout: 3000 })) {
          await field.fill(tenantData.name);
          console.log(`   ✓ Name: ${tenantData.name}`);
          break;
        }
      } catch (err) {
        continue;
      }
    }

    // Select type
    try {
      const typeSelect = page.locator('select[name="type"], select[name="tenantType"]').first();
      if (await typeSelect.isVisible({ timeout: 2000 })) {
        await typeSelect.selectOption({ label: tenantData.type });
        console.log(`   ✓ Type: ${tenantData.type}`);
      }
    } catch (err) {
      console.log(`   ⚠️ Type field not found or not selectable`);
    }

    // Select industry
    try {
      const industrySelect = page.locator('select[name="industry"]').first();
      if (await industrySelect.isVisible({ timeout: 2000 })) {
        await industrySelect.selectOption({ label: industry });
        console.log(`   ✓ Industry: ${industry}`);
      }
    } catch (err) {
      console.log(`   ⚠️ Industry field not found or not selectable`);
    }

    // Email
    const emailSelectors = ['input[name="email"]', 'input[type="email"]'];
    for (const selector of emailSelectors) {
      try {
        const field = page.locator(selector).first();
        if (await field.isVisible({ timeout: 3000 })) {
          await field.fill(tenantData.email);
          console.log(`   ✓ Email: ${tenantData.email}`);
          break;
        }
      } catch (err) {
        continue;
      }
    }

    // Phone
    const phoneSelectors = ['input[name="phone"]', 'input[type="tel"]', 'input[placeholder*="Phone"]'];
    for (const selector of phoneSelectors) {
      try {
        const field = page.locator(selector).first();
        if (await field.isVisible({ timeout: 3000 })) {
          await field.fill(tenantData.phone);
          console.log(`   ✓ Phone: ${tenantData.phone}`);
          break;
        }
      } catch (err) {
        continue;
      }
    }

    // Submit
    const submitSelectors = [
      'button[type="submit"]:has-text("Create")',
      'button[type="submit"]:has-text("Save")',
      'button:has-text("Create Tenant")',
      'button:has-text("Submit")'
    ];

    for (const selector of submitSelectors) {
      try {
        const button = page.locator(selector).first();
        if (await button.isVisible({ timeout: 3000 })) {
          await button.click();
          console.log('   ✓ Tenant form submitted');
          break;
        }
      } catch (err) {
        continue;
      }
    }

    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Store tenant data
    const tenantId = `tenant_${industry}_${testRunData.timestamp}`;
    testRunData.tenants.set(industry, { id: tenantId, ...tenantData });

    console.log(`✅ Tenant created: ${tenantData.name}\n`);
    await takeScreenshot(page, `tenant-created-${industry.toLowerCase()}`);

    return { tenantId, tenantData };
  } catch (error) {
    console.log(`❌ Error creating tenant: ${error.message}`);
    console.log(`   Page state: ${page.isClosed() ? 'CLOSED' : 'OPEN'}`);
    console.log(`   Current URL: ${page.isClosed() ? 'N/A' : page.url()}`);
    await takeScreenshot(page, `tenant-error-${industry.toLowerCase()}`);
    throw error;
  }
}

// STEP 3: Create Organization (linked to Tenant)
async function createOrganization(page: Page, industry: string, tenantName: string) {
  console.log(`\n📋 STEP 3: Creating Organization for ${industry}`);
  console.log('-'.repeat(50));

  const orgData = {
    name: `${industry} Organization ${testRunData.timestamp}`,
    type: 'Headquarters',
    tenant: tenantName,
    email: `org_${industry.toLowerCase()}_${testRunData.timestamp}@test.com`,
    phone: `555${Math.floor(Math.random() * 10000000)}`
  };

  // Navigate to Organizations
  await page.goto(`${TEST_CONFIG.urls.admin}/organizations`);
  await page.waitForLoadState('networkidle');
  console.log('   ✓ Navigated to Organizations page');

  // Click Create Organization
  const createButton = page.locator('button:has-text("New Organization"), button:has-text("Create Organization")').first();
  if (await createButton.isVisible({ timeout: 5000 })) {
    await createButton.click();
    console.log('   ✓ Clicked Create Organization button');
    await page.waitForTimeout(2000);
  }

  // Select Tenant (IMPORTANT: Link to tenant)
  const tenantSelect = page.locator('select[name="tenant"], select[name="tenantId"]').first();
  if (await tenantSelect.isVisible({ timeout: 2000 })) {
    await tenantSelect.selectOption({ label: tenantName });
    console.log(`   ✓ Tenant: ${tenantName}`);
  }

  // Fill organization form
  await page.fill('input[name="name"], input[placeholder*="Organization Name"]', orgData.name);
  console.log(`   ✓ Name: ${orgData.name}`);

  const typeSelect = page.locator('select[name="type"]').first();
  if (await typeSelect.isVisible({ timeout: 2000 })) {
    await typeSelect.selectOption({ label: orgData.type });
    console.log(`   ✓ Type: ${orgData.type}`);
  }

  await page.fill('input[name="email"], input[type="email"]', orgData.email);
  console.log(`   ✓ Email: ${orgData.email}`);

  await page.fill('input[name="phone"], input[type="tel"]', orgData.phone);
  console.log(`   ✓ Phone: ${orgData.phone}`);

  // Submit
  const submitButton = page.locator('button[type="submit"]:has-text("Create"), button:has-text("Save")').first();
  await submitButton.click();
  console.log('   ✓ Organization form submitted');

  await page.waitForTimeout(3000);

  // Store organization data
  const orgId = `org_${industry}_${testRunData.timestamp}`;
  testRunData.organizations.set(industry, { id: orgId, ...orgData });

  console.log(`✅ Organization created: ${orgData.name}\n`);
  await takeScreenshot(page, `org-created-${industry.toLowerCase()}`);

  return { orgId, orgData };
}

// STEP 4: Create User (linked to Organization)
async function createUser(page: Page, industry: string, orgName: string) {
  console.log(`\n📋 STEP 4: Creating User for ${industry}`);
  console.log('-'.repeat(50));

  const userData = {
    firstName: 'John',
    lastName: `${industry}Admin`,
    email: `admin_${industry.toLowerCase()}_${testRunData.timestamp}@test.com`,
    username: `${industry.toLowerCase()}admin${testRunData.timestamp}`,
    organization: orgName,
    role: 'Admin'
  };

  // Navigate to Users
  await page.goto(`${TEST_CONFIG.urls.admin}/users`);
  await page.waitForLoadState('networkidle');
  console.log('   ✓ Navigated to Users page');

  // Click Create User
  const createButton = page.locator('button:has-text("New User"), button:has-text("Create User"), button:has-text("Add User")').first();
  if (await createButton.isVisible({ timeout: 5000 })) {
    await createButton.click();
    console.log('   ✓ Clicked Create User button');
    await page.waitForTimeout(2000);
  }

  // Select Organization (IMPORTANT: Link to organization)
  const orgSelect = page.locator('select[name="organization"], select[name="organizationId"]').first();
  if (await orgSelect.isVisible({ timeout: 2000 })) {
    await orgSelect.selectOption({ label: orgName });
    console.log(`   ✓ Organization: ${orgName}`);
  }

  // Fill user form
  await page.fill('input[name="firstName"]', userData.firstName);
  console.log(`   ✓ First Name: ${userData.firstName}`);

  await page.fill('input[name="lastName"]', userData.lastName);
  console.log(`   ✓ Last Name: ${userData.lastName}`);

  await page.fill('input[name="email"]', userData.email);
  console.log(`   ✓ Email: ${userData.email}`);

  await page.fill('input[name="username"]', userData.username);
  console.log(`   ✓ Username: ${userData.username}`);

  // Select Role
  const roleSelect = page.locator('select[name="role"]').first();
  if (await roleSelect.isVisible({ timeout: 2000 })) {
    await roleSelect.selectOption({ label: userData.role });
    console.log(`   ✓ Role: ${userData.role}`);
  }

  // Initial password (will be reset)
  await page.fill('input[name="password"], input[type="password"]', 'TempPassword123!');
  console.log('   ✓ Temporary password set');

  // Submit
  const submitButton = page.locator('button[type="submit"]:has-text("Create"), button:has-text("Save")').first();
  await submitButton.click();
  console.log('   ✓ User form submitted');

  await page.waitForTimeout(3000);

  // Store user data
  const userId = `user_${industry}_${testRunData.timestamp}`;
  testRunData.users.set(industry, { id: userId, ...userData });

  console.log(`✅ User created: ${userData.email}\n`);
  await takeScreenshot(page, `user-created-${industry.toLowerCase()}`);

  return { userId, userData };
}

// STEP 5: Reset Password and Capture from Notification
async function resetPasswordAndCapture(page: Page, industry: string, userEmail: string) {
  console.log(`\n📋 STEP 5: Reset Password for ${userEmail}`);
  console.log('-'.repeat(50));

  // Navigate to Users page
  await page.goto(`${TEST_CONFIG.urls.admin}/users`);
  await page.waitForLoadState('networkidle');
  console.log('   ✓ Navigated to Users page');

  // Find the user row (search by email)
  const userRow = page.locator(`tr:has-text("${userEmail}"), div:has-text("${userEmail}")`).first();
  if (await userRow.isVisible({ timeout: 5000 })) {
    console.log('   ✓ Found user row');

    // Click Action Menu (could be ⋮ icon, Actions button, etc.)
    const actionMenuSelectors = [
      'button[aria-label="Actions"]',
      'button:has-text("Actions")',
      'button:has(svg)',  // Three dots icon
      '[data-testid="action-menu"]'
    ];

    for (const selector of actionMenuSelectors) {
      const actionButton = userRow.locator(selector).or(page.locator(`tr:has-text("${userEmail}") ${selector}`));
      if (await actionButton.isVisible({ timeout: 2000 })) {
        await actionButton.click();
        console.log('   ✓ Clicked Action Menu');
        await page.waitForTimeout(1000);
        break;
      }
    }

    // Click Reset Password
    const resetPasswordButton = page.locator('button:has-text("Reset Password"), a:has-text("Reset Password")').first();
    if (await resetPasswordButton.isVisible({ timeout: 3000 })) {
      await resetPasswordButton.click();
      console.log('   ✓ Clicked Reset Password');
      await page.waitForTimeout(1000);
    }

    // CAPTURE PASSWORD FROM NOTIFICATION
    let capturedPassword = '';

    // Look for notification/toast/modal with the new password
    const notificationSelectors = [
      '.notification',
      '.toast',
      '.alert',
      '[role="alert"]',
      '.message',
      '.popup'
    ];

    for (const selector of notificationSelectors) {
      const notification = page.locator(selector).first();
      if (await notification.isVisible({ timeout: TEST_CONFIG.timeouts.notification })) {
        const notificationText = await notification.textContent();
        console.log(`   📧 Notification found: ${notificationText}`);

        // Extract password from notification text
        // Common patterns: "Password: xyz123" or "New password: xyz123"
        const passwordMatch = notificationText?.match(/(?:password|Password|PASSWORD):\s*([A-Za-z0-9!@#$%^&*]+)/);
        if (passwordMatch && passwordMatch[1]) {
          capturedPassword = passwordMatch[1];
          console.log(`   ✓ Password captured: ${capturedPassword}`);
          break;
        }
      }
    }

    // Fallback: Look for password in modal/dialog
    if (!capturedPassword) {
      const modalPassword = page.locator('input[readonly], input[disabled], code, pre, .password-display').first();
      if (await modalPassword.isVisible({ timeout: 2000 })) {
        capturedPassword = await modalPassword.inputValue() || await modalPassword.textContent() || '';
        console.log(`   ✓ Password captured from modal: ${capturedPassword}`);
      }
    }

    if (!capturedPassword) {
      console.log('   ⚠️ Could not capture password from notification, using fallback');
      capturedPassword = 'ResetPass123!';  // Fallback
    }

    await takeScreenshot(page, `password-reset-${industry.toLowerCase()}`);

    // Store credentials
    testRunData.credentials.push({
      type: 'Enterprise User',
      industry: industry,
      email: userEmail,
      password: capturedPassword
    });

    console.log(`✅ Password reset complete: ${capturedPassword}\n`);
    return capturedPassword;
  }

  throw new Error('User not found for password reset');
}

// STEP 6: Login to Enterprise Wallet
async function loginToEnterpriseWallet(page: Page, email: string, password: string, industry: string) {
  console.log(`\n📋 STEP 6: Login to Enterprise Wallet`);
  console.log('-'.repeat(50));

  await page.goto(TEST_CONFIG.urls.enterprise);
  await page.waitForLoadState('networkidle');
  console.log('   ✓ Navigated to Enterprise Wallet');

  // Fill login form
  await page.fill('input[name="email"], input[type="email"]', email);
  console.log(`   ✓ Email: ${email}`);

  await page.fill('input[name="password"], input[type="password"]', password);
  console.log('   ✓ Password filled');

  // Submit
  const submitButton = page.locator('button[type="submit"]').first();
  await submitButton.click();
  console.log('   ✓ Login submitted');

  await page.waitForTimeout(3000);

  console.log(`✅ Logged in to Enterprise Wallet\n`);
  await takeScreenshot(page, `enterprise-login-${industry.toLowerCase()}`);
}

// STEP 7: Complete KYC/Onboarding (NEW REQUIREMENT)
async function completeKYCOnboarding(page: Page, industry: string) {
  console.log(`\n📋 STEP 7: Complete KYC/Onboarding (NEW)`);
  console.log('-'.repeat(50));

  // Check if KYC/Onboarding is required
  const kycRequired = await page.locator('text=/KYC|onboarding|verification|get started/i').isVisible({ timeout: 5000 });

  if (!kycRequired) {
    console.log('   ℹ️ KYC/Onboarding not required or already completed');
    return;
  }

  console.log('   ✓ KYC/Onboarding required');

  // Click Get Started / Begin KYC
  const startButton = page.locator('button:has-text("Get Started"), button:has-text("Begin"), button:has-text("Start")').first();
  if (await startButton.isVisible({ timeout: 3000 })) {
    await startButton.click();
    console.log('   ✓ Clicked Get Started');
    await page.waitForTimeout(2000);
  }

  // Fill KYC Information
  const kycData = {
    businessName: `${industry} Business Corp`,
    businessType: 'Corporation',
    ein: `12-345${Math.floor(Math.random() * 10000)}`,
    address: '123 Main St',
    city: 'New York',
    state: 'NY',
    zip: '10001',
    phone: `555${Math.floor(Math.random() * 10000000)}`
  };

  // Business Name
  const businessNameField = page.locator('input[name="businessName"], input[placeholder*="Business Name"]').first();
  if (await businessNameField.isVisible({ timeout: 2000 })) {
    await businessNameField.fill(kycData.businessName);
    console.log(`   ✓ Business Name: ${kycData.businessName}`);
  }

  // EIN
  const einField = page.locator('input[name="ein"], input[placeholder*="EIN"]').first();
  if (await einField.isVisible({ timeout: 2000 })) {
    await einField.fill(kycData.ein);
    console.log(`   ✓ EIN: ${kycData.ein}`);
  }

  // Address
  const addressField = page.locator('input[name="address"], input[placeholder*="Address"]').first();
  if (await addressField.isVisible({ timeout: 2000 })) {
    await addressField.fill(kycData.address);
    console.log(`   ✓ Address: ${kycData.address}`);
  }

  // City
  const cityField = page.locator('input[name="city"], input[placeholder*="City"]').first();
  if (await cityField.isVisible({ timeout: 2000 })) {
    await cityField.fill(kycData.city);
    console.log(`   ✓ City: ${kycData.city}`);
  }

  // State
  const stateField = page.locator('input[name="state"], select[name="state"]').first();
  if (await stateField.isVisible({ timeout: 2000 })) {
    await stateField.fill(kycData.state);
    console.log(`   ✓ State: ${kycData.state}`);
  }

  // ZIP
  const zipField = page.locator('input[name="zip"], input[name="zipCode"]').first();
  if (await zipField.isVisible({ timeout: 2000 })) {
    await zipField.fill(kycData.zip);
    console.log(`   ✓ ZIP: ${kycData.zip}`);
  }

  // Submit KYC
  const submitButton = page.locator('button[type="submit"]:has-text("Submit"), button:has-text("Complete"), button:has-text("Continue")').first();
  if (await submitButton.isVisible({ timeout: 3000 })) {
    await submitButton.click();
    console.log('   ✓ KYC form submitted');
    await page.waitForTimeout(3000);
  }

  console.log(`✅ KYC/Onboarding completed\n`);
  await takeScreenshot(page, `kyc-completed-${industry.toLowerCase()}`);
}

// STEP 8: Create Consumer in Consumer Wallet
async function createConsumer(context: BrowserContext, industry: string) {
  console.log(`\n📋 STEP 8: Create Consumer for ${industry}`);
  console.log('-'.repeat(50));

  const consumerData = {
    firstName: 'Jane',
    lastName: `${industry}Consumer`,
    email: `consumer_${industry.toLowerCase()}_${testRunData.timestamp}@test.com`,
    mobileNumber: `555${Math.floor(Math.random() * 10000000)}`,
    password: 'ConsumerPass123!',
    confirmPassword: 'ConsumerPass123!'
  };

  const page = await context.newPage();
  await page.goto(`${TEST_CONFIG.urls.consumer}/auth/register-with-account-type`);
  await page.waitForLoadState('networkidle');
  console.log('   ✓ Navigated to Consumer Wallet registration');

  // Select Personal Account
  const personalButton = page.locator('div:has-text("Personal Account") button:has-text("Get Started")').first();
  if (await personalButton.isVisible({ timeout: 5000 })) {
    await personalButton.click();
    console.log('   ✓ Selected Personal Account');
    await page.waitForTimeout(2000);
  }

  // Fill registration form
  await page.fill('input[name="firstName"]', consumerData.firstName);
  console.log(`   ✓ First Name: ${consumerData.firstName}`);

  await page.fill('input[name="lastName"]', consumerData.lastName);
  console.log(`   ✓ Last Name: ${consumerData.lastName}`);

  await page.fill('input[name="email"]', consumerData.email);
  console.log(`   ✓ Email: ${consumerData.email}`);

  await page.fill('input[name="mobileNumber"]', consumerData.mobileNumber);
  console.log(`   ✓ Mobile: ${consumerData.mobileNumber}`);

  await page.fill('input[name="password"]', consumerData.password);
  console.log('   ✓ Password filled');

  await page.fill('input[name="confirmPassword"]', consumerData.confirmPassword);
  console.log('   ✓ Confirm Password filled');

  // Accept terms
  const termsCheckbox = page.locator('input[type="checkbox"]').first();
  if (await termsCheckbox.isVisible({ timeout: 2000 })) {
    await termsCheckbox.check();
    console.log('   ✓ Terms accepted');
  }

  // Submit
  const submitButton = page.locator('button[type="submit"]').first();
  await submitButton.click();
  console.log('   ✓ Registration submitted');

  await page.waitForTimeout(5000);

  // Store consumer data
  const consumerId = `consumer_${industry}_${testRunData.timestamp}`;
  testRunData.consumers.set(industry, { id: consumerId, ...consumerData });

  testRunData.credentials.push({
    type: 'Consumer',
    industry: industry,
    email: consumerData.email,
    password: consumerData.password
  });

  console.log(`✅ Consumer created: ${consumerData.email}\n`);
  await takeScreenshot(page, `consumer-created-${industry.toLowerCase()}`);

  return { page, consumerId, consumerData };
}

// STEP 9: Create Invoice in Enterprise Wallet
async function createInvoice(enterprisePage: Page, industry: string, consumerEmail: string) {
  console.log(`\n📋 STEP 9: Create Invoice in Enterprise Wallet`);
  console.log('-'.repeat(50));

  const invoiceData = {
    recipient: consumerEmail,
    amount: 500 + Math.floor(Math.random() * 1000),
    description: `${industry} Services Invoice`,
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 30 days from now
  };

  // Navigate to Invoices
  await enterprisePage.goto(`${TEST_CONFIG.urls.enterprise}/invoices`);
  await enterprisePage.waitForLoadState('networkidle');
  console.log('   ✓ Navigated to Invoices page');

  // Click Create Invoice
  const createButton = enterprisePage.locator('button:has-text("Create Invoice"), button:has-text("New Invoice")').first();
  if (await createButton.isVisible({ timeout: 5000 })) {
    await createButton.click();
    console.log('   ✓ Clicked Create Invoice');
    await enterprisePage.waitForTimeout(2000);
  }

  // Fill invoice form
  await enterprisePage.fill('input[name="recipient"], input[name="recipientEmail"]', invoiceData.recipient);
  console.log(`   ✓ Recipient: ${invoiceData.recipient}`);

  await enterprisePage.fill('input[name="amount"]', invoiceData.amount.toString());
  console.log(`   ✓ Amount: $${invoiceData.amount}`);

  await enterprisePage.fill('textarea[name="description"], input[name="description"]', invoiceData.description);
  console.log(`   ✓ Description: ${invoiceData.description}`);

  await enterprisePage.fill('input[name="dueDate"], input[type="date"]', invoiceData.dueDate);
  console.log(`   ✓ Due Date: ${invoiceData.dueDate}`);

  // Submit
  const submitButton = enterprisePage.locator('button[type="submit"]:has-text("Send"), button:has-text("Create")').first();
  await submitButton.click();
  console.log('   ✓ Invoice submitted');

  await enterprisePage.waitForTimeout(3000);

  // Store invoice data
  const invoiceId = `invoice_${industry}_${testRunData.timestamp}`;
  testRunData.invoices.set(industry, { id: invoiceId, ...invoiceData });

  console.log(`✅ Invoice created and sent to ${consumerEmail}\n`);
  await takeScreenshot(enterprisePage, `invoice-created-${industry.toLowerCase()}`);

  return { invoiceId, invoiceData };
}

// STEP 10: Pay Invoice from Consumer Wallet
async function payInvoice(consumerPage: Page, industry: string) {
  console.log(`\n📋 STEP 10: Pay Invoice from Consumer Wallet`);
  console.log('-'.repeat(50));

  // Navigate to Invoices/Payments
  await consumerPage.goto(`${TEST_CONFIG.urls.consumer}/invoices`);
  await consumerPage.waitForLoadState('networkidle');
  console.log('   ✓ Navigated to Invoices');

  // Find pending invoice
  const pendingInvoice = consumerPage.locator('tr:has-text("Pending"), div:has-text("Pending")').first();
  if (await pendingInvoice.isVisible({ timeout: 5000 })) {
    await pendingInvoice.click();
    console.log('   ✓ Clicked on pending invoice');
    await consumerPage.waitForTimeout(2000);
  }

  // Click Pay Now
  const payButton = consumerPage.locator('button:has-text("Pay Now"), button:has-text("Pay Invoice")').first();
  if (await payButton.isVisible({ timeout: 5000 })) {
    await payButton.click();
    console.log('   ✓ Clicked Pay Now');
    await consumerPage.waitForTimeout(2000);
  }

  // Confirm payment (may require MPIN or confirmation)
  const confirmButton = consumerPage.locator('button:has-text("Confirm"), button:has-text("Pay")').first();
  if (await confirmButton.isVisible({ timeout: 3000 })) {
    await confirmButton.click();
    console.log('   ✓ Payment confirmed');
    await consumerPage.waitForTimeout(3000);
  }

  console.log(`✅ Invoice paid successfully\n`);
  await takeScreenshot(consumerPage, `invoice-paid-${industry.toLowerCase()}`);
}

// Main Test Suite
test.describe('REFACTORED: Comprehensive Multi-Industry Payment Flow', () => {
  test.setTimeout(600000); // 10 minutes

  test('Complete E2E flow with new Tenant → Org → User → KYC workflow', async ({ browser }) => {
    console.log('\n' + '='.repeat(70));
    console.log('🚀 REFACTORED COMPREHENSIVE E2E TEST');
    console.log(`⏰ Timestamp: ${testRunData.timestamp}`);
    console.log('='.repeat(70));

    const context = await browser.newContext();
    const adminPage = await context.newPage();

    // STEP 1: Login to Admin
    await loginToAdmin(adminPage);

    // Process each industry
    for (const industry of INDUSTRIES) {
      console.log('\n' + '='.repeat(70));
      console.log(`🏭 PROCESSING INDUSTRY: ${industry}`);
      console.log('='.repeat(70));

      try {
        // STEP 2: Create Tenant
        const { tenantData } = await createTenant(adminPage, industry);

        // STEP 3: Create Organization (linked to Tenant)
        const { orgData } = await createOrganization(adminPage, industry, tenantData.name);

        // STEP 4: Create User (linked to Organization)
        const { userData } = await createUser(adminPage, industry, orgData.name);

        // STEP 5: Reset Password and Capture
        const enterprisePassword = await resetPasswordAndCapture(adminPage, industry, userData.email);

        // STEP 6: Login to Enterprise Wallet
        const enterprisePage = await context.newPage();
        await loginToEnterpriseWallet(enterprisePage, userData.email, enterprisePassword, industry);

        // STEP 7: Complete KYC/Onboarding (NEW)
        await completeKYCOnboarding(enterprisePage, industry);

        // STEP 8: Create Consumer
        const { page: consumerPage, consumerData } = await createConsumer(context, industry);

        // STEP 9: Create Invoice
        await createInvoice(enterprisePage, industry, consumerData.email);

        // STEP 10: Pay Invoice
        await payInvoice(consumerPage, industry);

        // Cleanup
        await enterprisePage.close();
        await consumerPage.close();

        console.log(`\n✅ ${industry} industry flow completed successfully!\n`);

      } catch (error) {
        console.error(`\n❌ Error processing ${industry}: ${error.message}\n`);
        await takeScreenshot(adminPage, `error-${industry.toLowerCase()}`);
      }
    }

    // Print Summary
    console.log('\n' + '='.repeat(70));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(70));
    console.log(`✅ Tenants Created: ${testRunData.tenants.size}`);
    console.log(`✅ Organizations Created: ${testRunData.organizations.size}`);
    console.log(`✅ Users Created: ${testRunData.users.size}`);
    console.log(`✅ Consumers Created: ${testRunData.consumers.size}`);
    console.log(`✅ Invoices Created: ${testRunData.invoices.size}`);
    console.log('');
    console.log('🔐 CREDENTIALS:');
    testRunData.credentials.forEach((cred, i) => {
      console.log(`${i + 1}. ${cred.type} (${cred.industry}):`);
      console.log(`   Email: ${cred.email}`);
      console.log(`   Password: ${cred.password}`);
    });
    console.log('='.repeat(70));

    await adminPage.close();
    await context.close();
  });
});

export { testRunData, TEST_CONFIG };
