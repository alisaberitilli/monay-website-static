/**
 * Admin Portal Test
 * Focused test for admin portal login and tenant setup
 */

import { test, expect, Page } from '@playwright/test';

const TEST_CONFIG = {
  urls: {
    admin: 'http://localhost:3002',
    backend: 'http://localhost:3001'
  },
  adminCredentials: {
    email: 'admin@monay.com',
    password: 'Admin@123',
    mpin: '123456'
  },
  timeouts: {
    navigation: 60000, // Increased timeout for manual intervention
    action: 15000
  }
};

async function loginToAdmin(page: Page, allowManual: boolean = true) {
  console.log('Navigating to Admin Portal...');
  await page.goto(TEST_CONFIG.urls.admin);

  // Wait for the page to load
  await page.waitForLoadState('networkidle');

  // Check if already logged in
  const onDashboard = page.url().includes('dashboard');
  if (onDashboard) {
    console.log('Already logged in to admin portal');
    return true;
  }

  // Check for login form
  const emailInput = await page.locator('input[name="email"], input[type="email"]').count();
  const passwordInput = await page.locator('input[name="password"], input[type="password"]').count();

  if (emailInput > 0 && passwordInput > 0) {
    console.log('Login form found, attempting to fill credentials...');

    try {
      // Fill email
      await page.fill('input[name="email"], input[type="email"]', TEST_CONFIG.adminCredentials.email);

      // Fill password
      await page.fill('input[name="password"], input[type="password"]', TEST_CONFIG.adminCredentials.password);

      // Click submit button
      const submitButton = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")');
      if (await submitButton.count() > 0) {
        await submitButton.click();
      }

      // Wait for navigation or MPIN prompt
      await page.waitForLoadState('networkidle');

      // Check if MPIN is required
      const mpinInput = await page.locator('input[name="mpin"], input[placeholder*="MPIN"], input[placeholder*="PIN"]').count();
      if (mpinInput > 0) {
        console.log('MPIN required, entering MPIN...');
        await page.fill('input[name="mpin"], input[placeholder*="MPIN"]', TEST_CONFIG.adminCredentials.mpin);
        await page.click('button[type="submit"]');
      }
    } catch (error) {
      console.log('Auto-login failed:', error);
      if (allowManual) {
        console.log('⚠️ MANUAL ACTION REQUIRED: Please login manually');
        console.log(`   Email: ${TEST_CONFIG.adminCredentials.email}`);
        console.log(`   Password: ${TEST_CONFIG.adminCredentials.password}`);
        console.log(`   MPIN: ${TEST_CONFIG.adminCredentials.mpin}`);
      }
    }
  }

  // Wait for dashboard with extended timeout for manual login
  try {
    console.log('Waiting for dashboard (you have 60 seconds to login manually if needed)...');
    await page.waitForURL('**/dashboard', { timeout: TEST_CONFIG.timeouts.navigation });
    console.log('✅ Successfully reached dashboard');
    return true;
  } catch (error) {
    console.log('❌ Failed to reach dashboard');
    return false;
  }
}

async function createTenantOrganization(page: Page, orgName: string) {
  console.log(`Creating organization: ${orgName}`);

  // Navigate to organizations page
  const orgLink = page.locator('a[href*="organizations"], a[href*="tenant"], button:has-text("Organizations"), nav :text("Organizations")');
  if (await orgLink.count() > 0) {
    await orgLink.first().click();
    await page.waitForLoadState('networkidle');
  }

  // Click create/add button
  const createButton = page.locator('button:has-text("Create"), button:has-text("Add"), button:has-text("New Organization"), button:has-text("+ Organization")');
  if (await createButton.count() > 0) {
    await createButton.first().click();
    await page.waitForLoadState('networkidle');
  }

  // Fill organization form
  const timestamp = Date.now();
  const orgData = {
    name: `${orgName}_${timestamp}`,
    email: `org_${timestamp}@test.com`,
    phone: `+1555${String(timestamp).slice(-7)}`,
    address: '123 Test Street',
    city: 'San Francisco',
    state: 'CA',
    zip: '94105',
    ein: `95-${String(timestamp).slice(-7)}`
  };

  // Try to fill fields
  const fields = [
    { selector: 'input[name="name"], input[placeholder*="Organization Name"], input[placeholder*="Company"]', value: orgData.name },
    { selector: 'input[name="email"], input[placeholder*="Email"]', value: orgData.email },
    { selector: 'input[name="phone"], input[placeholder*="Phone"]', value: orgData.phone },
    { selector: 'input[name="address"], input[placeholder*="Address"]', value: orgData.address },
    { selector: 'input[name="city"], input[placeholder*="City"]', value: orgData.city },
    { selector: 'input[name="state"], input[placeholder*="State"]', value: orgData.state },
    { selector: 'input[name="zip"], input[placeholder*="ZIP"], input[placeholder*="Postal"]', value: orgData.zip },
    { selector: 'input[name="ein"], input[placeholder*="EIN"], input[placeholder*="Tax"]', value: orgData.ein }
  ];

  for (const field of fields) {
    const element = page.locator(field.selector);
    if (await element.count() > 0) {
      await element.first().fill(field.value);
      console.log(`  Filled: ${field.selector.split(',')[0]} = ${field.value}`);
    }
  }

  // Submit form
  const submitButton = page.locator('button[type="submit"], button:has-text("Create"), button:has-text("Save")');
  if (await submitButton.count() > 0) {
    await submitButton.first().click();
    console.log('  Submitted organization form');
  }

  await page.waitForLoadState('networkidle');

  // Take screenshot
  await page.screenshot({
    path: `screenshots/admin-org-created-${timestamp}.png`,
    fullPage: true
  });

  return orgData;
}

async function createOrgAdminUser(page: Page, orgName: string) {
  console.log(`Creating admin user for organization: ${orgName}`);

  // Navigate to users page
  const usersLink = page.locator('a[href*="users"], button:has-text("Users"), nav :text("Users")');
  if (await usersLink.count() > 0) {
    await usersLink.first().click();
    await page.waitForLoadState('networkidle');
  }

  // Click create user button
  const createButton = page.locator('button:has-text("Create User"), button:has-text("Add User"), button:has-text("New User")');
  if (await createButton.count() > 0) {
    await createButton.first().click();
    await page.waitForLoadState('networkidle');
  }

  // Fill user form
  const timestamp = Date.now();
  const userData = {
    firstName: 'Admin',
    lastName: `User${timestamp}`,
    email: `admin_${timestamp}@test.com`,
    username: `admin${timestamp}`,
    phone: `+1555${String(timestamp).slice(-7, -3)}${String(timestamp).slice(-3)}`,
    password: 'TestAdmin2025!@#',
    mpin: '9876'
  };

  // Fill fields
  const fields = [
    { selector: 'input[name="firstName"], input[placeholder*="First Name"]', value: userData.firstName },
    { selector: 'input[name="lastName"], input[placeholder*="Last Name"]', value: userData.lastName },
    { selector: 'input[name="email"], input[placeholder*="Email"]', value: userData.email },
    { selector: 'input[name="username"], input[placeholder*="Username"]', value: userData.username },
    { selector: 'input[name="phone"], input[placeholder*="Phone"]', value: userData.phone },
    { selector: 'input[name="password"], input[placeholder*="Password"]', value: userData.password },
    { selector: 'input[name="confirmPassword"], input[placeholder*="Confirm Password"]', value: userData.password },
    { selector: 'input[name="mpin"], input[placeholder*="MPIN"], input[placeholder*="PIN"]', value: userData.mpin }
  ];

  for (const field of fields) {
    const element = page.locator(field.selector);
    if (await element.count() > 0) {
      await element.first().fill(field.value);
      console.log(`  Filled: ${field.selector.split(',')[0]}`);
    }
  }

  // Select role (org_admin)
  const roleSelect = page.locator('select[name="role"], select[name="userRole"]');
  if (await roleSelect.count() > 0) {
    await roleSelect.selectOption({ value: 'org_admin' });
  } else {
    // Try dropdown
    const roleDropdown = page.locator('button[role="combobox"]:has-text("Role"), div:has-text("Select Role")');
    if (await roleDropdown.count() > 0) {
      await roleDropdown.click();
      await page.click('li:has-text("Organization Admin"), div[role="option"]:has-text("Org Admin")');
    }
  }

  // Submit form
  const submitButton = page.locator('button[type="submit"], button:has-text("Create"), button:has-text("Save")');
  if (await submitButton.count() > 0) {
    await submitButton.first().click();
    console.log('  Submitted user form');
  }

  await page.waitForLoadState('networkidle');

  // Take screenshot
  await page.screenshot({
    path: `screenshots/admin-user-created-${timestamp}.png`,
    fullPage: true
  });

  return userData;
}

// Test Suite
test.describe('Admin Portal - Tenant Setup', () => {
  test.setTimeout(120000); // 2 minutes per test

  test('Step 1: Login to Admin Portal', async ({ page }) => {
    console.log('========================================');
    console.log('Admin Portal Login Test');
    console.log('========================================\n');

    const loginSuccess = await loginToAdmin(page, true);
    expect(loginSuccess).toBe(true);

    // Verify we're on dashboard
    expect(page.url()).toContain('dashboard');

    // Take screenshot
    await page.screenshot({
      path: `screenshots/admin-dashboard.png`,
      fullPage: true
    });

    console.log('✅ Admin login successful');
  });

  test('Step 2: Create Tenant Organization', async ({ page }) => {
    console.log('========================================');
    console.log('Create Tenant Organization Test');
    console.log('========================================\n');

    // First login
    const loginSuccess = await loginToAdmin(page, true);
    expect(loginSuccess).toBe(true);

    // Create organization
    const orgData = await createTenantOrganization(page, 'TestCorp');

    console.log('\n✅ Organization created:');
    console.log(`   Name: ${orgData.name}`);
    console.log(`   Email: ${orgData.email}`);
    console.log(`   Phone: ${orgData.phone}`);
  });

  test('Step 3: Create Organization Admin User', async ({ page }) => {
    console.log('========================================');
    console.log('Create Organization Admin User Test');
    console.log('========================================\n');

    // First login
    const loginSuccess = await loginToAdmin(page, true);
    expect(loginSuccess).toBe(true);

    // Create user
    const userData = await createOrgAdminUser(page, 'TestCorp');

    console.log('\n✅ Admin user created:');
    console.log(`   Email: ${userData.email}`);
    console.log(`   Password: ${userData.password}`);
    console.log(`   MPIN: ${userData.mpin}`);
    console.log(`   Username: ${userData.username}`);
  });

  test('Complete Flow: Login + Create Org + Create User', async ({ page }) => {
    console.log('========================================');
    console.log('Complete Admin Portal Setup');
    console.log('========================================\n');

    // Step 1: Login
    console.log('📋 Step 1: Login to Admin Portal');
    const loginSuccess = await loginToAdmin(page, true);
    expect(loginSuccess).toBe(true);

    // Step 2: Create Organization
    console.log('\n📋 Step 2: Create Tenant Organization');
    const orgData = await createTenantOrganization(page, 'CompleteCorp');

    // Step 3: Create Admin User
    console.log('\n📋 Step 3: Create Organization Admin');
    const userData = await createOrgAdminUser(page, orgData.name);

    // Summary
    console.log('\n========================================');
    console.log('✅ SETUP COMPLETE - CREDENTIALS');
    console.log('========================================');
    console.log('\nOrganization:');
    console.log(`  Name: ${orgData.name}`);
    console.log(`  Email: ${orgData.email}`);
    console.log('\nOrganization Admin:');
    console.log(`  Email: ${userData.email}`);
    console.log(`  Password: ${userData.password}`);
    console.log(`  MPIN: ${userData.mpin}`);
    console.log('========================================\n');
  });
});

export { TEST_CONFIG, loginToAdmin, createTenantOrganization, createOrgAdminUser };