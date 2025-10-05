/**
 * Diagnostic Test for Admin Portal
 * Simple test to verify admin portal login flow
 */

import { test, expect } from '@playwright/test';

test.describe('Admin Portal Diagnostic', () => {
  test('Check admin portal loads and login form works', async ({ page }) => {
    console.log('\n=== DIAGNOSTIC TEST START ===\n');

    // Step 1: Navigate to admin portal
    console.log('1️⃣ Navigating to http://localhost:3002...');
    await page.goto('http://localhost:3002', { waitUntil: 'domcontentloaded', timeout: 30000 });
    console.log(`   ✓ Page loaded: ${page.url()}`);

    // Take screenshot of landing page
    await page.screenshot({ path: 'screenshots/diagnostic-01-landing.png', fullPage: true });

    // Wait for page to settle
    await page.waitForTimeout(3000);

    // Step 2: Check what's on the page
    console.log('\n2️⃣ Checking page content...');
    const currentUrl = page.url();
    console.log(`   Current URL: ${currentUrl}`);

    // Check for login form
    const emailInput = await page.locator('input[type="email"], input[name="email"]').count();
    const passwordInput = await page.locator('input[type="password"], input[name="password"]').count();
    console.log(`   Email inputs found: ${emailInput}`);
    console.log(`   Password inputs found: ${passwordInput}`);

    if (emailInput > 0 && passwordInput > 0) {
      console.log('   ✅ Login form detected');

      // Step 3: Fill login form
      console.log('\n3️⃣ Attempting to fill login form...');
      await page.fill('input[type="email"], input[name="email"]', 'admin@monay.com');
      console.log('   ✓ Email filled');

      await page.fill('input[type="password"], input[name="password"]', 'SecureAdmin123');
      console.log('   ✓ Password filled');

      // Take screenshot before submit
      await page.screenshot({ path: 'screenshots/diagnostic-02-form-filled.png', fullPage: true });

      // Step 4: Submit login
      console.log('\n4️⃣ Submitting login...');
      const submitButton = page.locator('button[type="submit"]').first();
      await submitButton.click();
      console.log('   ✓ Login button clicked');

      // Wait for response
      await page.waitForTimeout(5000);

      // Check result
      const newUrl = page.url();
      console.log(`\n5️⃣ After login:`);
      console.log(`   New URL: ${newUrl}`);

      // Take screenshot after login
      await page.screenshot({ path: 'screenshots/diagnostic-03-after-login.png', fullPage: true });

      // Check for MPIN
      const mpinInput = await page.locator('input[name="mpin"], input[placeholder*="MPIN"]').count();
      if (mpinInput > 0) {
        console.log('   ℹ️ MPIN form detected');
        await page.fill('input[name="mpin"], input[placeholder*="MPIN"]', '123456');
        console.log('   ✓ MPIN filled');
        await page.click('button[type="submit"]');
        console.log('   ✓ MPIN submitted');

        await page.waitForTimeout(5000);
        const finalUrl = page.url();
        console.log(`   Final URL: ${finalUrl}`);

        await page.screenshot({ path: 'screenshots/diagnostic-04-after-mpin.png', fullPage: true });
      }

      // Check if we're on dashboard
      if (newUrl.includes('dashboard') || newUrl.includes('admin')) {
        console.log('   ✅ Successfully reached dashboard');
      } else if (newUrl.includes('login')) {
        console.log('   ⚠️ Still on login page - authentication may have failed');
      } else {
        console.log(`   ℹ️ Redirected to: ${newUrl}`);
      }

    } else {
      console.log('   ⚠️ No login form found');
      console.log('   Checking if already logged in...');

      if (currentUrl.includes('dashboard') || currentUrl.includes('admin')) {
        console.log('   ✅ Already logged in');
      }
    }

    console.log('\n=== DIAGNOSTIC TEST END ===\n');
  });
});
