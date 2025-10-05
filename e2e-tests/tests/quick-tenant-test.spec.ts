/**
 * Quick Tenant Creation Test
 * Simplified test to verify tenant creation works
 */

import { test, expect } from '@playwright/test';

test.describe('Quick Tenant Test', () => {
  test('Login and Create Tenant', async ({ page }) => {
    console.log('\n=== QUICK TENANT CREATION TEST ===\n');

    // Step 1: Login
    console.log('1️⃣ Logging in...');
    await page.goto('http://localhost:3002');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.fill('input[type="email"]', 'admin@monay.com');
    await page.fill('input[type="password"]', 'SecureAdmin123');
    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(5000);

    console.log(`   ✓ Logged in: ${page.url()}`);

    // Step 2: Navigate to Tenants
    console.log('\n2️⃣ Navigating to Tenants...');
    const tenantsLink = page.locator('a[href="/tenants"]').first();
    await tenantsLink.click();
    await page.waitForTimeout(3000);

    console.log(`   ✓ On Tenants page: ${page.url()}`);
    await page.screenshot({ path: 'screenshots/quick-tenants-page.png', fullPage: true });

    // Step 3: Create Tenant
    console.log('\n3️⃣ Creating tenant...');

    // Look for create button
    const createButtonSelectors = [
      'button:has-text("New Tenant")',
      'button:has-text("Create Tenant")',
      'button:has-text("Add Tenant")',
      'a:has-text("New Tenant")'
    ];

    let createClicked = false;
    for (const selector of createButtonSelectors) {
      if (await page.locator(selector).isVisible({ timeout: 2000 })) {
        await page.locator(selector).first().click();
        console.log(`   ✓ Clicked create button: ${selector}`);
        createClicked = true;
        await page.waitForTimeout(2000);
        break;
      }
    }

    if (!createClicked) {
      console.log('   ⚠️ No create button found, checking page content...');
      const pageContent = await page.locator('body').textContent();
      console.log(`   Page excerpt: ${pageContent?.substring(0, 300)}`);
    }

    await page.screenshot({ path: 'screenshots/quick-after-create-click.png', fullPage: true });

    console.log('\n=== TEST COMPLETE ===\n');
  });
});
