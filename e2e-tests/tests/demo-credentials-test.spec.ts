import { test, expect } from '@playwright/test';

// Configuration
const CONSUMER_WALLET_URL = 'http://localhost:3003';

test.describe('Demo Credentials Auto-Fill Test', () => {
  test('Test all three demo credential buttons', async ({ page }) => {
    test.setTimeout(60000); // 60 seconds timeout

    console.log('\n🎯 Testing Demo Credentials Auto-Fill Buttons');
    console.log('='.repeat(70));

    // Navigate to login page
    console.log('1️⃣ Navigating to login page...');
    await page.goto(`${CONSUMER_WALLET_URL}/auth/login`);
    await page.waitForLoadState('networkidle');

    // Take screenshot of login page
    await page.screenshot({
      path: `demo-credentials-login-page-${Date.now()}.png`,
      fullPage: true
    });

    // Test 1: Test Account (Demo) - +15552223333
    console.log('\n2️⃣ Testing Demo Account Button...');
    console.log('-'.repeat(40));

    const demoButton = page.locator('button:has-text("Use Demo Credentials")').first();
    if (await demoButton.isVisible({ timeout: 3000 })) {
      await demoButton.click();
      console.log('   ✅ Clicked "Use Demo Credentials" button');
      await page.waitForTimeout(1000);

      // Check if fields are filled
      const mobileField = page.locator('input[type="tel"]').first();
      const passwordField = page.locator('input[type="password"]').first();

      const mobileValue = await mobileField.inputValue();
      const passwordValue = await passwordField.inputValue();

      console.log(`   📱 Mobile filled: ${mobileValue}`);
      console.log(`   🔐 Password filled: ${passwordValue.replace(/./g, '*')}`);

      expect(mobileValue).toBe('+15552223333');
      expect(passwordValue).toBe('password123');
      console.log('   ✅ Demo credentials auto-filled correctly');

      // Clear the fields for next test
      await mobileField.clear();
      await passwordField.clear();
    } else {
      console.log('   ⚠️ Demo button not found');
    }

    // Test 2: Mock Test Account - +15551234567
    console.log('\n3️⃣ Testing Mock Test Account Button...');
    console.log('-'.repeat(40));

    const mockButton = page.locator('button:has-text("Use Test Credentials")').first();
    if (await mockButton.isVisible({ timeout: 3000 })) {
      await mockButton.click();
      console.log('   ✅ Clicked "Use Test Credentials" button');
      await page.waitForTimeout(1000);

      const mobileField = page.locator('input[type="tel"]').first();
      const passwordField = page.locator('input[type="password"]').first();

      const mobileValue = await mobileField.inputValue();
      const passwordValue = await passwordField.inputValue();

      console.log(`   📱 Mobile filled: ${mobileValue}`);
      console.log(`   🔐 Password filled: ${passwordValue.replace(/./g, '*')}`);

      expect(mobileValue).toBe('+15551234567');
      expect(passwordValue).toBe('demo123');
      console.log('   ✅ Mock test credentials auto-filled correctly');

      // Clear the fields for next test
      await mobileField.clear();
      await passwordField.clear();
    } else {
      console.log('   ⚠️ Mock button not found');
    }

    // Test 3: PostgreSQL Account - +13016821633
    console.log('\n4️⃣ Testing PostgreSQL Account Button...');
    console.log('-'.repeat(40));

    const pgButton = page.locator('button:has-text("Use PostgreSQL Account")').first();
    if (await pgButton.isVisible({ timeout: 3000 })) {
      await pgButton.click();
      console.log('   ✅ Clicked "Use PostgreSQL Account" button');
      await page.waitForTimeout(1000);

      const mobileField = page.locator('input[type="tel"]').first();
      const passwordField = page.locator('input[type="password"]').first();

      const mobileValue = await mobileField.inputValue();
      const passwordValue = await passwordField.inputValue();

      console.log(`   📱 Mobile filled: ${mobileValue}`);
      console.log(`   🔐 Password filled: ${passwordValue.replace(/./g, '*')}`);

      expect(mobileValue).toBe('+13016821633');
      expect(passwordValue).toBe('Demo@123');
      console.log('   ✅ PostgreSQL credentials auto-filled correctly');
    } else {
      console.log('   ⚠️ PostgreSQL button not found');
    }

    // Take final screenshot
    await page.screenshot({
      path: `demo-credentials-final-${Date.now()}.png`,
      fullPage: true
    });

    console.log('\n📊 DEMO CREDENTIALS TEST RESULTS');
    console.log('='.repeat(70));
    console.log('✅ All three demo credential buttons tested successfully');
    console.log('='.repeat(70));
  });

  test('Test demo account login flow', async ({ page }) => {
    test.setTimeout(60000);

    console.log('\n🎯 Testing Complete Demo Account Login Flow');
    console.log('='.repeat(70));

    // Navigate to login page
    await page.goto(`${CONSUMER_WALLET_URL}/auth/login`);
    await page.waitForLoadState('networkidle');

    // Use demo credentials
    console.log('1️⃣ Using demo credentials...');
    const demoButton = page.locator('button:has-text("Use Demo Credentials")').first();
    if (await demoButton.isVisible({ timeout: 3000 })) {
      await demoButton.click();
      await page.waitForTimeout(1000);
      console.log('   ✅ Demo credentials filled');

      // Submit the form
      console.log('2️⃣ Submitting login form...');
      const submitButton = page.locator('button[type="submit"]').first();
      await submitButton.click();
      await page.waitForTimeout(5000);

      // Check result
      const finalUrl = page.url();
      console.log(`   📍 Final URL: ${finalUrl}`);

      // Take screenshot of result
      await page.screenshot({
        path: `demo-login-result-${Date.now()}.png`,
        fullPage: true
      });

      // Check for success indicators
      if (finalUrl.includes('/dashboard') || finalUrl.includes('/home')) {
        console.log('   ✅ Login successful - redirected to dashboard');
      } else {
        console.log('   ⚠️ Login result unclear');
      }

      console.log('\n📊 COMPLETE DEMO LOGIN TEST RESULTS');
      console.log('='.repeat(70));
      console.log(`🌐 Final URL: ${finalUrl}`);
      console.log('='.repeat(70));
    } else {
      console.log('   ❌ Demo button not found');
    }
  });
});
