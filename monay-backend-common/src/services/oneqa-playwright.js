import { chromium } from 'playwright';
import loggers from './logger.js';

const logger = loggers.internalLogger || console;

class OneQAPlaywrightService {
  constructor() {
    this.baseUrl = 'https://oneqa.utilli.com';
    this.sessions = new Map();
  }

  /**
   * Initiate login with OneQA using real browser automation
   */
  async initiateLogin(mobileNumber) {
    let browser = null;
    
    try {
      logger.info(`Initiating real OneQA login for mobile: ${mobileNumber}`);
      
      // Launch browser
      browser = await chromium.launch({
        headless: false, // Show browser window for debugging
        args: ['--disable-blink-features=AutomationControlled']
      });
      
      const context = await browser.newContext({
        viewport: { width: 1280, height: 720 },
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      });
      
      const page = await context.newPage();
      
      // Navigate to OneQA login page
      logger.info(`Navigating to ${this.baseUrl}/login`);
      await page.goto(`${this.baseUrl}/login`, {
        waitUntil: 'domcontentloaded',
        timeout: 30000
      });
      
      // Wait for page to fully load
      await page.waitForTimeout(2000);
      
      // Take screenshot for debugging
      const screenshotPath = `oneqa-login-${Date.now()}.png`;
      await page.screenshot({ 
        path: screenshotPath,
        fullPage: true 
      });
      logger.info(`Screenshot saved: ${screenshotPath}`);
      
      // Try different possible selectors for mobile input
      const mobileSelectors = [
        'input[type="tel"]',
        'input[name="mobile"]',
        'input[placeholder*="mobile" i]',
        'input[placeholder*="phone" i]',
        'input[placeholder*="number" i]',
        '#mobile',
        '#phone',
        'input.mobile-input',
        'input[autocomplete="tel"]'
      ];
      
      let mobileInput = null;
      for (const selector of mobileSelectors) {
        try {
          mobileInput = await page.waitForSelector(selector, { 
            timeout: 2000,
            state: 'visible'
          });
          if (mobileInput) {
            logger.info(`Found mobile input with selector: ${selector}`);
            break;
          }
        } catch (e) {
          // Try next selector
        }
      }
      
      if (!mobileInput) {
        // If no mobile input found, log page content for debugging
        const pageContent = await page.content();
        logger.error('Could not find mobile input field. Page content:', pageContent.substring(0, 500));
        throw new Error('Mobile input field not found on page');
      }
      
      // Clear and enter mobile number
      await mobileInput.click();
      await mobileInput.fill('');
      await mobileInput.type(mobileNumber, { delay: 100 });
      
      // Find and click submit button
      const submitSelectors = [
        'button[type="submit"]',
        'button:has-text("Send")',
        'button:has-text("Login")',
        'button:has-text("Continue")',
        'button:has-text("Next")',
        'button:has-text("OTP")',
        'button:has-text("Get")',
        'input[type="submit"]',
        '#sendOTP',
        '.login-button',
        '.submit-button'
      ];
      
      let submitButton = null;
      for (const selector of submitSelectors) {
        try {
          submitButton = await page.$(selector);
          if (submitButton) {
            const isVisible = await submitButton.isVisible();
            if (isVisible) {
              logger.info(`Found submit button with selector: ${selector}`);
              break;
            }
          }
        } catch (e) {
          // Try next selector
        }
      }
      
      if (!submitButton) {
        throw new Error('Submit button not found on page');
      }
      
      // Click submit button
      logger.info('Clicking submit button...');
      await submitButton.click();
      
      // Wait for either navigation or OTP field to appear
      logger.info('Waiting for OTP page or field...');
      await page.waitForTimeout(3000); // Give time for page to respond
      
      // Take another screenshot after clicking submit
      const afterClickScreenshot = `oneqa-after-click-${Date.now()}.png`;
      await page.screenshot({ 
        path: afterClickScreenshot,
        fullPage: true 
      });
      logger.info(`After-click screenshot saved: ${afterClickScreenshot}`);
      
      // Check current URL to see if we navigated
      const currentUrl = page.url();
      logger.info(`Current URL after submit: ${currentUrl}`);
      
      // Try to find any OTP-related elements
      const otpSelectors = [
        'input[placeholder*="OTP" i]',
        'input[placeholder*="code" i]',
        'input[placeholder*="verification" i]',
        'input[type="text"][maxlength="6"]',
        'input[type="text"][maxlength="4"]',
        'input[name*="otp" i]',
        '#otp',
        '#code',
        '.otp-input'
      ];
      
      let otpField = null;
      for (const selector of otpSelectors) {
        otpField = await page.$(selector);
        if (otpField) {
          logger.info(`Found OTP field with selector: ${selector}`);
          break;
        }
      }
      
      // Even if we don't find an OTP field immediately, store the session
      // The OTP might be sent and the field might appear on the next page
      logger.info('Storing session - OTP should be sent to mobile number');
      
      const sessionId = `session_${Date.now()}_${mobileNumber}`;
      this.sessions.set(sessionId, {
        mobileNumber,
        page,
        context,
        browser,
        status: 'otp_sent',
        timestamp: Date.now()
      });
      
      return {
        success: true,
        message: 'Please check your SMS for the OTP code',
        sessionId,
        requiresOTP: true
      };
      
    } catch (error) {
      logger.error('Error in OneQA login initiation:', error);
      if (browser) await browser.close();
      
      return {
        success: false,
        message: error.message || 'Failed to initiate login',
        error: error.message
      };
    }
  }

  /**
   * Verify OTP using real browser automation
   */
  async verifyOTP(sessionId, otp) {
    try {
      const session = this.sessions.get(sessionId);
      if (!session) {
        return {
          success: false,
          message: 'Session expired or invalid'
        };
      }

      const { page } = session;
      logger.info(`Verifying OTP for session: ${sessionId}`);
      
      // Find OTP input field
      const otpSelectors = [
        'input[placeholder*="OTP" i]',
        'input[placeholder*="code" i]',
        'input[placeholder*="verification" i]',
        'input[type="text"][maxlength="6"]',
        'input[type="number"][maxlength="6"]',
        '#otp',
        '#otpCode',
        'input.otp-input'
      ];
      
      let otpInput = null;
      for (const selector of otpSelectors) {
        try {
          otpInput = await page.$(selector);
          if (otpInput && await otpInput.isVisible()) {
            logger.info(`Found OTP input with selector: ${selector}`);
            break;
          }
        } catch (e) {
          // Try next selector
        }
      }
      
      if (!otpInput) {
        throw new Error('OTP input field not found');
      }
      
      // Enter OTP
      await otpInput.click();
      await otpInput.fill('');
      await otpInput.type(otp, { delay: 100 });
      
      // Find and click verify button
      const verifySelectors = [
        'button[type="submit"]',
        'button:has-text("Verify")',
        'button:has-text("Submit")',
        'button:has-text("Confirm")',
        'button:has-text("Continue")',
        '#verifyOTP',
        '.verify-button'
      ];
      
      let verifyButton = null;
      for (const selector of verifySelectors) {
        try {
          verifyButton = await page.$(selector);
          if (verifyButton && await verifyButton.isVisible()) {
            logger.info(`Found verify button with selector: ${selector}`);
            break;
          }
        } catch (e) {
          // Try next selector
        }
      }
      
      if (!verifyButton) {
        throw new Error('Verify button not found');
      }
      
      // Click verify and wait for navigation
      await Promise.all([
        verifyButton.click(),
        page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 10000 }).catch(() => {})
      ]);
      
      // Wait for page to settle
      await page.waitForTimeout(2000);
      
      // Check if we're authenticated (look for dashboard or service provider selection)
      const currentUrl = page.url();
      const isAuthenticated = 
        currentUrl.includes('/dashboard') ||
        currentUrl.includes('/selectServiceProvider') ||
        currentUrl.includes('/home') ||
        (await page.$('.logout, .user-menu, [href*="logout"]')) !== null;
      
      if (isAuthenticated) {
        logger.info('Successfully authenticated with OneQA');
        session.status = 'authenticated';
        
        return {
          success: true,
          message: 'Authentication successful'
        };
      } else {
        // Check for error message
        const errorElement = await page.$('.error, .alert-danger, [role="alert"], .error-message');
        if (errorElement) {
          const errorText = await errorElement.textContent();
          return {
            success: false,
            message: errorText || 'Invalid OTP'
          };
        }
        
        return {
          success: false,
          message: 'Invalid OTP'
        };
      }
      
    } catch (error) {
      logger.error('Error verifying OTP:', error);
      return {
        success: false,
        message: error.message || 'OTP verification failed'
      };
    }
  }

  /**
   * Fetch service providers from OneQA
   */
  async fetchServiceProviders(sessionId) {
    try {
      const session = this.sessions.get(sessionId);
      if (!session || session.status !== 'authenticated') {
        return {
          success: false,
          message: 'Not authenticated'
        };
      }

      const { page } = session;
      logger.info('Fetching service providers from OneQA');
      
      // Navigate to service provider selection if not already there
      const currentUrl = page.url();
      if (!currentUrl.includes('/selectServiceProvider')) {
        await page.goto(`${this.baseUrl}/selectServiceProvider`, {
          waitUntil: 'domcontentloaded',
          timeout: 30000
        });
        await page.waitForTimeout(2000);
      }
      
      // Wait for providers to load
      await page.waitForSelector('.provider-item, .service-provider, .provider-card, [data-provider], .provider-list', {
        timeout: 10000
      });
      
      // Extract providers
      const providers = await page.evaluate(() => {
        const providerElements = document.querySelectorAll(
          '.provider-item, .service-provider, .provider-card, [data-provider], .provider-list > div, .provider-list > li'
        );
        
        const providerList = [];
        
        providerElements.forEach(element => {
          // Extract provider information
          const nameElement = element.querySelector('.provider-name, .title, h3, h4, .name, .provider-title');
          const name = nameElement?.textContent?.trim() || element.textContent?.trim();
          
          const accountElement = element.querySelector('.account-number, .account, .acc-no, .account-info');
          const accountNumber = accountElement?.textContent?.trim();
          
          const logoElement = element.querySelector('img');
          const logo = logoElement?.src;
          
          const providerId = 
            element.getAttribute('data-provider-id') || 
            element.getAttribute('data-provider') ||
            element.getAttribute('id') ||
            name?.toLowerCase().replace(/[^a-z0-9]/g, '_');
          
          // Check for invoice count or balance
          const invoiceElement = element.querySelector('.invoice-count, .count, .bills, .pending');
          const invoiceInfo = invoiceElement?.textContent?.trim();
          
          if (name && providerId) {
            providerList.push({
              id: providerId,
              name: name.replace(/\s+/g, ' ').trim(),
              accountNumber: accountNumber,
              logo: logo,
              hasInvoices: invoiceInfo || 'Available'
            });
          }
        });
        
        return providerList;
      });
      
      logger.info(`Found ${providers.length} service providers`);
      
      return {
        success: true,
        providers: providers
      };
      
    } catch (error) {
      logger.error('Error fetching service providers:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch providers'
      };
    }
  }

  /**
   * Fetch invoices for a specific provider
   */
  async fetchProviderInvoices(sessionId, providerId) {
    try {
      const session = this.sessions.get(sessionId);
      if (!session || session.status !== 'authenticated') {
        return {
          success: false,
          message: 'Not authenticated'
        };
      }

      const { page } = session;
      logger.info(`Fetching invoices for provider: ${providerId}`);
      
      // Go back to provider selection page if needed
      const currentUrl = page.url();
      if (!currentUrl.includes('/selectServiceProvider')) {
        await page.goto(`${this.baseUrl}/selectServiceProvider`, {
          waitUntil: 'domcontentloaded'
        });
        await page.waitForTimeout(2000);
      }
      
      // Click on the specific provider
      const providerSelectors = [
        `[data-provider-id="${providerId}"]`,
        `[data-provider="${providerId}"]`,
        `#${providerId}`,
        `[id="${providerId}"]`,
        `.provider-item:has-text("${providerId}")`,
        `.provider-card:has-text("${providerId}")`
      ];
      
      let clicked = false;
      for (const selector of providerSelectors) {
        try {
          const element = await page.$(selector);
          if (element && await element.isVisible()) {
            await element.click();
            clicked = true;
            logger.info(`Clicked provider with selector: ${selector}`);
            break;
          }
        } catch (e) {
          // Try next selector
        }
      }
      
      if (!clicked) {
        throw new Error(`Could not find provider: ${providerId}`);
      }
      
      // Wait for navigation or invoice list to load
      await page.waitForTimeout(2000);
      await page.waitForSelector(
        '.invoice-row, .invoice-item, .bill-item, table tbody tr, .invoice-card, .bill-list',
        { timeout: 10000 }
      );
      
      // Extract invoices
      const invoices = await page.evaluate(() => {
        const invoiceElements = document.querySelectorAll(
          '.invoice-row, .invoice-item, .bill-item, table tbody tr:not(:first-child), .invoice-card, .bill-list > div'
        );
        
        const invoiceList = [];
        
        invoiceElements.forEach(element => {
          const invoice = {};
          
          // Invoice number
          const numberElement = element.querySelector('.invoice-number, .bill-number, .ref-number, td:first-child');
          invoice.invoiceNumber = numberElement?.textContent?.trim();
          
          // Amount
          const amountElement = element.querySelector('.amount, .total, .invoice-amount, td:nth-child(2)');
          invoice.amount = amountElement?.textContent?.trim();
          
          // Due date
          const dateElement = element.querySelector('.due-date, .date, td:nth-child(3)');
          invoice.dueDate = dateElement?.textContent?.trim();
          
          // Status
          const statusElement = element.querySelector('.status, .payment-status, td:nth-child(4)');
          invoice.status = statusElement?.textContent?.trim();
          
          // Billing period
          const periodElement = element.querySelector('.period, .billing-period, .month, td:nth-child(5)');
          invoice.billingPeriod = periodElement?.textContent?.trim();
          
          // Service provider name
          invoice.serviceProvider = document.querySelector('.provider-name, h1, h2')?.textContent?.trim();
          
          if (invoice.invoiceNumber || invoice.amount) {
            invoiceList.push(invoice);
          }
        });
        
        return invoiceList;
      });
      
      logger.info(`Found ${invoices.length} invoices`);
      
      // Transform to standard format
      const standardizedInvoices = invoices.map(inv => ({
        invoiceNumber: inv.invoiceNumber || `INV-${Date.now()}`,
        amount: this.parseAmount(inv.amount),
        currency: 'AED',
        dueDate: inv.dueDate,
        billingPeriod: inv.billingPeriod,
        status: this.mapStatus(inv.status),
        serviceProvider: inv.serviceProvider || providerId,
        description: `${inv.serviceProvider || providerId} - ${inv.billingPeriod || 'Services'}`
      }));
      
      return {
        success: true,
        invoices: standardizedInvoices
      };
      
    } catch (error) {
      logger.error('Error fetching provider invoices:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch invoices'
      };
    }
  }

  /**
   * Parse amount string to number
   */
  parseAmount(amountStr) {
    if (!amountStr) return 0;
    const cleaned = amountStr.replace(/[^0-9.-]/g, '');
    return parseFloat(cleaned) || 0;
  }

  /**
   * Map status string to standard status
   */
  mapStatus(status) {
    if (!status) return 'pending';
    const statusLower = status.toLowerCase();
    if (statusLower.includes('paid')) return 'paid';
    if (statusLower.includes('overdue')) return 'overdue';
    if (statusLower.includes('pending')) return 'pending';
    return 'pending';
  }

  /**
   * Close session and browser
   */
  async closeSession(sessionId) {
    const session = this.sessions.get(sessionId);
    if (session) {
      if (session.browser) {
        await session.browser.close();
      }
      this.sessions.delete(sessionId);
      logger.info(`Closed session: ${sessionId}`);
    }
  }

  /**
   * Clean up old sessions
   */
  async cleanupSessions() {
    const now = Date.now();
    const timeout = 30 * 60 * 1000; // 30 minutes
    
    for (const [sessionId, session] of this.sessions.entries()) {
      if (now - session.timestamp > timeout) {
        await this.closeSession(sessionId);
      }
    }
  }
}

// Create singleton instance
const oneQAPlaywrightService = new OneQAPlaywrightService();

// Set up periodic cleanup
setInterval(() => {
  oneQAPlaywrightService.cleanupSessions();
}, 30 * 60 * 1000);

export default oneQAPlaywrightService;