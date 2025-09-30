/**
 * Test Helper Functions and Utilities
 * Common functions for E2E testing across all scenarios
 */

import { Page, expect } from '@playwright/test';

/**
 * Wait for element with retry logic
 */
export async function waitForElement(
  page: Page,
  selector: string,
  options: { timeout?: number; retries?: number } = {}
) {
  const { timeout = 10000, retries = 3 } = options;

  for (let i = 0; i < retries; i++) {
    try {
      await page.waitForSelector(selector, { timeout });
      return true;
    } catch (error) {
      if (i === retries - 1) throw error;
      await page.waitForTimeout(1000); // Wait 1 second before retry
    }
  }
  return false;
}

/**
 * Fill form field with retry logic
 */
export async function fillField(
  page: Page,
  selector: string,
  value: string,
  options: { clear?: boolean } = {}
) {
  const { clear = true } = options;

  const element = await page.locator(selector).first();
  await element.waitFor({ state: 'visible' });

  if (clear) {
    await element.clear();
  }

  await element.fill(value);

  // Verify value was entered
  const actualValue = await element.inputValue();
  if (actualValue !== value) {
    // Retry once
    await element.clear();
    await element.fill(value);
  }
}

/**
 * Click element with improved error handling
 */
export async function clickElement(page: Page, selector: string) {
  const element = await page.locator(selector).first();
  await element.waitFor({ state: 'visible' });
  await element.scrollIntoViewIfNeeded();
  await element.click();
}

/**
 * Select dropdown option
 */
export async function selectOption(
  page: Page,
  selector: string,
  value: string | { label?: string; value?: string }
) {
  // Try native select first
  const selectElement = await page.locator(`select${selector}`).count();
  if (selectElement > 0) {
    await page.selectOption(`select${selector}`, value);
    return;
  }

  // Try custom dropdown
  await clickElement(page, selector);

  // Wait for dropdown options to appear
  await page.waitForTimeout(500);

  // Click the option
  const optionText = typeof value === 'string' ? value : (value.label || value.value);
  await page.click(`[role="option"]:has-text("${optionText}"), li:has-text("${optionText}")`);
}

/**
 * Check if element exists
 */
export async function elementExists(page: Page, selector: string): Promise<boolean> {
  const count = await page.locator(selector).count();
  return count > 0;
}

/**
 * Get element text content
 */
export async function getElementText(page: Page, selector: string): Promise<string> {
  const element = await page.locator(selector).first();
  return await element.textContent() || '';
}

/**
 * Wait for navigation with improved error handling
 */
export async function waitForNavigation(
  page: Page,
  urlPattern: string | RegExp,
  options: { timeout?: number } = {}
) {
  const { timeout = 30000 } = options;

  try {
    await page.waitForURL(urlPattern, { timeout });
  } catch (error) {
    // If exact URL match fails, try partial match
    await page.waitForFunction(
      (pattern) => {
        const url = window.location.href;
        if (typeof pattern === 'string') {
          return url.includes(pattern);
        }
        return pattern.test(url);
      },
      urlPattern,
      { timeout }
    );
  }
}

/**
 * Handle modal dialogs
 */
export async function handleModal(
  page: Page,
  action: 'accept' | 'dismiss' = 'accept',
  inputText?: string
) {
  page.once('dialog', async dialog => {
    if (inputText && dialog.type() === 'prompt') {
      await dialog.accept(inputText);
    } else if (action === 'accept') {
      await dialog.accept();
    } else {
      await dialog.dismiss();
    }
  });
}

/**
 * Extract form validation errors
 */
export async function getFormErrors(page: Page): Promise<string[]> {
  const errors: string[] = [];

  // Common error selectors
  const errorSelectors = [
    '.error-message',
    '.field-error',
    '[role="alert"]',
    '.text-red-500',
    '.text-danger'
  ];

  for (const selector of errorSelectors) {
    const elements = await page.locator(selector).all();
    for (const element of elements) {
      const text = await element.textContent();
      if (text) errors.push(text.trim());
    }
  }

  return errors;
}

/**
 * Wait for API response
 */
export async function waitForApiResponse(
  page: Page,
  urlPattern: string | RegExp,
  options: { timeout?: number; status?: number } = {}
) {
  const { timeout = 10000, status = 200 } = options;

  return page.waitForResponse(
    response => {
      const url = response.url();
      const matches = typeof urlPattern === 'string'
        ? url.includes(urlPattern)
        : urlPattern.test(url);

      return matches && response.status() === status;
    },
    { timeout }
  );
}

/**
 * Mock API response
 */
export async function mockApiResponse(
  page: Page,
  urlPattern: string | RegExp,
  response: any
) {
  await page.route(urlPattern, route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(response)
    });
  });
}

/**
 * Take screenshot with timestamp
 */
export async function takeScreenshot(
  page: Page,
  name: string,
  options: { fullPage?: boolean; dir?: string } = {}
) {
  const { fullPage = true, dir = './screenshots' } = options;
  const timestamp = Date.now();
  const fileName = `${dir}/${timestamp}_${name}.png`;

  await page.screenshot({
    path: fileName,
    fullPage
  });

  return fileName;
}

/**
 * Generate random test data
 */
export function generateTestData(prefix: string = 'test') {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);

  return {
    email: `${prefix}_${timestamp}@test.com`,
    username: `${prefix}${timestamp}`,
    firstName: `Test${random}`,
    lastName: `User${timestamp}`,
    phone: `+1555${String(timestamp).slice(-7)}`,
    company: `TestCorp${timestamp}`,
    ein: `99-${String(timestamp).slice(-7)}`,
    timestamp,
    random
  };
}

/**
 * Format phone number for input (removes country code)
 */
export function formatPhoneForInput(phone: string): string {
  // Remove all non-digit characters
  const cleanPhone = phone.replace(/[^\d]/g, '');

  // Remove country code if present (1 for US)
  if (cleanPhone.startsWith('1') && cleanPhone.length === 11) {
    return cleanPhone.substring(1);
  }

  return cleanPhone;
}

/**
 * Format phone number with country code
 */
export function formatPhoneWithCountryCode(phone: string): string {
  // Remove all non-digit characters
  const cleanPhone = phone.replace(/[^\d]/g, '');

  // Add country code if not present
  if (cleanPhone.length === 10) {
    return `+1${cleanPhone}`;
  }

  if (cleanPhone.length === 11 && cleanPhone.startsWith('1')) {
    return `+${cleanPhone}`;
  }

  if (cleanPhone.startsWith('+')) {
    return cleanPhone;
  }

  return `+${cleanPhone}`;
}

/**
 * Check if input is a phone number
 */
export function isPhoneNumber(input: string): boolean {
  // Remove formatting characters
  const cleaned = input.replace(/[\s\-\(\)\+]/g, '');

  // Check if it's all digits and reasonable length
  return /^\d{10,15}$/.test(cleaned);
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

/**
 * Parse currency string to number
 */
export function parseCurrency(value: string): number {
  return parseFloat(value.replace(/[^0-9.-]/g, ''));
}

/**
 * Wait for element to be removed
 */
export async function waitForElementToBeRemoved(
  page: Page,
  selector: string,
  options: { timeout?: number } = {}
) {
  const { timeout = 10000 } = options;

  await page.waitForFunction(
    (sel) => document.querySelector(sel) === null,
    selector,
    { timeout }
  );
}

/**
 * Scroll to element
 */
export async function scrollToElement(page: Page, selector: string) {
  await page.locator(selector).first().scrollIntoViewIfNeeded();
}

/**
 * Get all cookies
 */
export async function getCookies(page: Page) {
  return await page.context().cookies();
}

/**
 * Set cookies
 */
export async function setCookies(page: Page, cookies: any[]) {
  await page.context().addCookies(cookies);
}

/**
 * Clear all cookies
 */
export async function clearCookies(page: Page) {
  await page.context().clearCookies();
}

/**
 * Get local storage item
 */
export async function getLocalStorageItem(page: Page, key: string) {
  return await page.evaluate((k) => localStorage.getItem(k), key);
}

/**
 * Set local storage item
 */
export async function setLocalStorageItem(page: Page, key: string, value: string) {
  await page.evaluate(([k, v]) => localStorage.setItem(k, v), [key, value]);
}

/**
 * Clear local storage
 */
export async function clearLocalStorage(page: Page) {
  await page.evaluate(() => localStorage.clear());
}

/**
 * Retry function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: { retries?: number; delay?: number; backoff?: number } = {}
): Promise<T> {
  const { retries = 3, delay = 1000, backoff = 2 } = options;

  let lastError: Error | undefined;
  let currentDelay = delay;

  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, currentDelay));
        currentDelay *= backoff;
      }
    }
  }

  throw lastError || new Error('Retry failed');
}

/**
 * Check if service is running
 */
export async function isServiceRunning(url: string): Promise<boolean> {
  try {
    const response = await fetch(url);
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Wait for all services to be ready
 */
export async function waitForServices(
  services: { name: string; url: string }[],
  options: { timeout?: number; interval?: number } = {}
) {
  const { timeout = 60000, interval = 2000 } = options;
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const checks = await Promise.all(
      services.map(async (service) => ({
        ...service,
        running: await isServiceRunning(service.url)
      }))
    );

    const allRunning = checks.every(c => c.running);
    if (allRunning) {
      console.log('✅ All services are running');
      return true;
    }

    const notRunning = checks.filter(c => !c.running);
    console.log(`⏳ Waiting for services: ${notRunning.map(s => s.name).join(', ')}`);

    await new Promise(resolve => setTimeout(resolve, interval));
  }

  throw new Error(`Services did not start within ${timeout}ms`);
}

/**
 * Handle authentication with phone or email
 */
export async function loginUser(
  page: Page,
  credential: string,
  password: string,
  mpin?: string
) {
  // Determine if credential is phone or email
  const isPhone = isPhoneNumber(credential);

  if (isPhone) {
    // Format phone for input (remove country code)
    const phoneForInput = formatPhoneForInput(credential);
    await fillField(page, 'input[name="phone"], input[name="email"]', phoneForInput);
  } else {
    await fillField(page, 'input[name="email"]', credential);
  }

  await fillField(page, 'input[type="password"]', password);
  await clickElement(page, 'button[type="submit"]');

  await page.waitForLoadState('networkidle');

  // Handle MPIN if required
  if (mpin && await elementExists(page, 'input[name="mpin"]')) {
    await fillField(page, 'input[name="mpin"]', mpin);
    await clickElement(page, 'button[type="submit"]');
  }

  return page.url().includes('dashboard');
}

/**
 * Register a new user with proper phone formatting
 */
export async function registerUser(
  page: Page,
  userData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    mpin?: string;
  }
) {
  // Navigate to registration
  await clickElement(page, 'a[href*="signup"], button:has-text("Sign Up")');

  // Fill registration form
  await fillField(page, 'input[name="firstName"]', userData.firstName);
  await fillField(page, 'input[name="lastName"]', userData.lastName);
  await fillField(page, 'input[name="email"]', userData.email);

  // Format phone for input (remove +1)
  const phoneForInput = formatPhoneForInput(userData.phone);
  await fillField(page, 'input[name="mobileNumber"]', phoneForInput);

  await fillField(page, 'input[name="password"]', userData.password);
  await fillField(page, 'input[name="confirmPassword"]', userData.password);

  // Accept terms if present
  const termsCheckbox = page.locator('input[type="checkbox"][name="terms"]');
  if (await termsCheckbox.count() > 0) {
    await termsCheckbox.check();
  }

  // Submit registration
  await clickElement(page, 'button[type="submit"]');
  await page.waitForLoadState('networkidle');

  // Handle potential manual login after registration
  const needsLogin = await elementExists(page, 'input[name="email"]');
  if (needsLogin) {
    await loginUser(page, userData.email, userData.password, userData.mpin);
  }

  // Handle MPIN setup if prompted
  if (userData.mpin && await elementExists(page, 'input[name="mpin"]')) {
    await fillField(page, 'input[name="mpin"]', userData.mpin);
    const confirmMpinExists = await elementExists(page, 'input[name="confirmMpin"]');
    if (confirmMpinExists) {
      await fillField(page, 'input[name="confirmMpin"]', userData.mpin);
    }
    await clickElement(page, 'button:has-text("Set MPIN"), button:has-text("Continue")');
  }

  return page.url().includes('dashboard');
}

export default {
  waitForElement,
  fillField,
  clickElement,
  selectOption,
  elementExists,
  getElementText,
  waitForNavigation,
  handleModal,
  getFormErrors,
  waitForApiResponse,
  mockApiResponse,
  takeScreenshot,
  generateTestData,
  formatCurrency,
  parseCurrency,
  waitForElementToBeRemoved,
  scrollToElement,
  getCookies,
  setCookies,
  clearCookies,
  getLocalStorageItem,
  setLocalStorageItem,
  clearLocalStorage,
  retry,
  isServiceRunning,
  waitForServices,
  formatPhoneForInput,
  formatPhoneWithCountryCode,
  isPhoneNumber,
  loginUser,
  registerUser
};