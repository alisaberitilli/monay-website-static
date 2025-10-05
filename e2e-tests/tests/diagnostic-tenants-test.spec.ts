/**
 * Diagnostic Test for Admin Portal - Tenants Navigation
 * Test login and navigation to tenants page
 */

import { test, expect } from '@playwright/test';

test.describe('Admin Portal - Tenants Navigation Diagnostic', () => {
  test('Login and navigate to tenants page', async ({ page }) => {
    console.log('\n=== TENANTS NAVIGATION DIAGNOSTIC ===\n');

    // Step 1: Login
    console.log('1️⃣ Logging in to admin portal...');
    await page.goto('http://localhost:3002', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // Wait for form to fully load

    // Fill form
    await page.fill('input[type="email"], input[name="email"]', 'admin@monay.com');
    await page.fill('input[type="password"], input[name="password"]', 'SecureAdmin123');

    // Click submit button
    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();
    console.log('   ✓ Login submitted');

    // Wait for response (give it time to process)
    await page.waitForTimeout(5000);

    console.log(`   ✓ Logged in. Current URL: ${page.url()}`);
    await page.screenshot({ path: 'screenshots/tenants-diag-01-dashboard.png', fullPage: true });

    // Step 2: Check what's on the dashboard
    console.log('\n2️⃣ Checking dashboard navigation...');
    const navLinks = await page.locator('nav a, aside a, [role="navigation"] a').count();
    console.log(`   Navigation links found: ${navLinks}`);

    if (navLinks > 0) {
      // List all navigation links
      const links = await page.locator('nav a, aside a, [role="navigation"] a').all();
      console.log('   Available links:');
      for (let i = 0; i < Math.min(links.length, 10); i++) {
        const text = await links[i].textContent();
        const href = await links[i].getAttribute('href');
        console.log(`     ${i + 1}. ${text?.trim()} → ${href}`);
      }
    }

    // Step 3: Navigate to tenants (try direct URL first)
    console.log('\n3️⃣ Navigating to /tenants via URL...');
    await page.goto('http://localhost:3002/tenants', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);

    const tenantsUrl = page.url();
    console.log(`   Current URL: ${tenantsUrl}`);

    if (tenantsUrl.includes('login')) {
      console.log('   ❌ Redirected to login - session lost!');
    } else if (tenantsUrl.includes('tenants')) {
      console.log('   ✅ Successfully on tenants page');
    } else if (tenantsUrl.includes('404') || tenantsUrl.includes('not-found')) {
      console.log('   ⚠️ Tenants page not found - checking actual page content...');
    } else {
      console.log(`   ℹ️ On different page: ${tenantsUrl}`);
    }

    await page.screenshot({ path: 'screenshots/tenants-diag-02-tenants-page.png', fullPage: true });

    // Check page content
    console.log('\n3️⃣ Checking page content...');
    const pageText = await page.locator('body').textContent();

    if (pageText?.includes('Tenant') || pageText?.includes('tenant')) {
      console.log('   ✅ Page contains "tenant" content');
    } else if (pageText?.includes('404') || pageText?.includes('not found')) {
      console.log('   ⚠️ Page shows 404 error');
      console.log(`   Page excerpt: ${pageText?.substring(0, 200)}`);
    } else {
      console.log('   ℹ️ Page content:');
      console.log(`   ${pageText?.substring(0, 300)}`);
    }

    // Check for tenant-related links
    console.log('\n4️⃣ Checking for tenant links...');
    const tenantLink = await page.locator('a:has-text("Tenant"), a[href*="tenant"]').count();
    console.log(`   Tenant links: ${tenantLink}`);

    if (tenantLink > 0) {
      console.log('\n5️⃣ Trying to click tenant link in navigation...');
      await page.locator('a:has-text("Tenant"), a[href*="tenant"]').first().click();
      await page.waitForTimeout(3000);
      console.log(`   After clicking: ${page.url()}`);
      await page.screenshot({ path: 'screenshots/tenants-diag-03-after-nav-click.png', fullPage: true });
    }

    console.log('\n=== DIAGNOSTIC END ===\n');
  });
});
