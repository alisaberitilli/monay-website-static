import { test, expect } from '@playwright/test';

// Test configuration
const ADMIN_URL = 'http://localhost:3002';
const ADMIN_EMAIL = 'admin@monay.com';
const ADMIN_PASSWORD = 'SecureAdmin123';

test.describe('Monay Admin - Tenant Creation', () => {
  test('Login and Create Tenant Organization', async ({ page }) => {
    // Generate unique identifiers for this test run
    const timestamp = Date.now();
    const orgName = `TestOrg_${timestamp}`;
    const orgEmail = `org_${timestamp}@test.com`;
    const orgPhone = `555${timestamp.toString().slice(-7)}`;

    console.log('🚀 Starting Tenant Creation Test');
    console.log(`📝 Organization Name: ${orgName}`);

    // Step 1: Navigate to Admin Portal
    console.log('\n1️⃣ Navigating to Admin Portal...');
    await page.goto(ADMIN_URL);
    await page.waitForLoadState('networkidle');

    // Step 2: Login
    console.log('2️⃣ Logging in as admin...');

    // Check if we're on login page
    if (await page.locator('input[type="email"], input[name="email"]').isVisible()) {
      // Fill login credentials
      await page.fill('input[type="email"], input[name="email"]', ADMIN_EMAIL);
      await page.fill('input[type="password"], input[name="password"]', ADMIN_PASSWORD);

      // Click login button
      await page.click('button[type="submit"]:has-text("Login"), button[type="submit"]:has-text("Sign in")');

      // Wait for navigation to dashboard
      await page.waitForURL('**/dashboard', { timeout: 10000 });
      console.log('✅ Login successful!');
    } else {
      console.log('ℹ️ Already logged in');
    }

    // Step 3: Navigate to Organizations
    console.log('\n3️⃣ Navigating to Organizations...');

    // Try multiple possible selectors for Organizations link
    const orgLink = page.locator('a[href="/organizations"], a:has-text("Organizations"), nav >> text=Organizations');
    if (await orgLink.isVisible()) {
      await orgLink.click();
    } else {
      // If not in nav, try to navigate directly
      await page.goto(`${ADMIN_URL}/organizations`);
    }

    await page.waitForLoadState('networkidle');
    console.log('✅ On Organizations page');

    // Step 4: Create New Organization
    console.log('\n4️⃣ Creating new organization...');

    // Click "New Organization" or "Add Organization" button
    const newOrgButton = page.locator('button:has-text("New Organization"), button:has-text("Add Organization"), button:has-text("Create Organization"), a:has-text("New Organization")');
    if (await newOrgButton.isVisible()) {
      await newOrgButton.click();
      await page.waitForTimeout(500); // Wait for modal/form to appear
    }

    // Fill organization details
    console.log('📝 Filling organization details...');

    // Organization Name
    await page.fill('input[name="name"], input[placeholder*="Organization Name"], input[placeholder*="Company Name"]', orgName);

    // Organization Type
    const typeSelect = page.locator('select[name="type"], select[name="organizationType"]');
    if (await typeSelect.isVisible()) {
      await typeSelect.selectOption({ label: 'Enterprise' });
    }

    // Industry
    const industrySelect = page.locator('select[name="industry"]');
    if (await industrySelect.isVisible()) {
      await industrySelect.selectOption({ label: 'Technology' });
    }

    // Email
    await page.fill('input[name="email"], input[type="email"]:not([name="admin_email"])', orgEmail);

    // Phone
    await page.fill('input[name="phone"], input[type="tel"]:not([name="admin_phone"])', orgPhone);

    // Wallet Type
    const walletSelect = page.locator('select[name="wallet_type"], select[name="walletType"]');
    if (await walletSelect.isVisible()) {
      await walletSelect.selectOption({ label: 'Corporate' });
    }

    // Step 5: Submit Organization
    console.log('\n5️⃣ Submitting organization...');

    const submitButton = page.locator('button[type="submit"]:has-text("Create"), button[type="submit"]:has-text("Submit"), button:has-text("Create Organization")');
    await submitButton.click();

    // Wait for success message or redirect
    await page.waitForTimeout(2000);

    // Check for success
    const successMessage = page.locator('text=/Organization.*created|Success|successfully/i');
    const orgInList = page.locator(`text=${orgName}`);

    if (await successMessage.isVisible({ timeout: 5000 }).catch(() => false) ||
        await orgInList.isVisible({ timeout: 5000 }).catch(() => false)) {
      console.log('✅ Organization created successfully!');

      // Print summary
      console.log('\n' + '='.repeat(50));
      console.log('🎉 TENANT CREATION TEST COMPLETE');
      console.log('='.repeat(50));
      console.log(`Organization: ${orgName}`);
      console.log(`Email: ${orgEmail}`);
      console.log(`Phone: ${orgPhone}`);
      console.log('='.repeat(50));
    } else {
      throw new Error('Organization creation may have failed - no success confirmation');
    }

    // Optional: Take screenshot for verification
    await page.screenshot({ path: `tenant-creation-${timestamp}.png` });
    console.log(`📸 Screenshot saved: tenant-creation-${timestamp}.png`);
  });

  test('Verify Tenant in List', async ({ page }) => {
    // Login first
    await page.goto(ADMIN_URL);

    if (await page.locator('input[type="email"]').isVisible()) {
      await page.fill('input[type="email"]', ADMIN_EMAIL);
      await page.fill('input[type="password"]', ADMIN_PASSWORD);
      await page.click('button[type="submit"]');
      await page.waitForURL('**/dashboard', { timeout: 10000 });
    }

    // Navigate to Organizations
    await page.goto(`${ADMIN_URL}/organizations`);
    await page.waitForLoadState('networkidle');

    // Check if there are any organizations
    const orgCount = await page.locator('table tbody tr, .organization-item, [data-testid="organization-row"]').count();

    console.log(`\n📊 Total organizations found: ${orgCount}`);

    if (orgCount > 0) {
      console.log('✅ Organizations list is populated');

      // Get first 5 organization names for verification
      const maxDisplay = Math.min(orgCount, 5);
      console.log(`\nDisplaying first ${maxDisplay} organizations:`);

      for (let i = 0; i < maxDisplay; i++) {
        const orgText = await page.locator(`table tbody tr:nth-child(${i + 1}), .organization-item:nth-child(${i + 1})`).textContent();
        console.log(`  ${i + 1}. ${orgText?.split('\n')[0]?.trim() || 'N/A'}`);
      }
    } else {
      console.log('⚠️ No organizations found in the list');
    }
  });
});