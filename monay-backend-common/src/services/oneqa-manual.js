import { chromium } from 'playwright';
import loggers from './logger.js';

const logger = loggers.internalLogger || console;

class OneQAManualService {
  constructor() {
    this.baseUrl = 'https://oneqa.utilli.com';
    this.sessions = new Map();
  }

  /**
   * Open browser and wait for manual login
   */
  async initiateManualLogin(mobileNumber) {
    let browser = null;
    
    try {
      logger.info(`Opening OneQA for manual login...`);
      
      // Launch browser in non-headless mode
      browser = await chromium.launch({
        headless: false, // Show browser window
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
      
      // Store session immediately
      const sessionId = `session_${Date.now()}_manual`;
      this.sessions.set(sessionId, {
        mobileNumber,
        page,
        context,
        browser,
        status: 'waiting_for_manual_login',
        timestamp: Date.now()
      });
      
      logger.info('Browser opened. Please manually enter your mobile number and OTP.');
      
      return {
        success: true,
        message: 'Please manually enter your mobile number and OTP in the browser window. Then click "Verify OTP" in the app.',
        sessionId,
        requiresOTP: true
      };
      
    } catch (error) {
      logger.error('Error opening OneQA:', error);
      if (browser) await browser.close();
      
      return {
        success: false,
        message: error.message || 'Failed to open OneQA',
        error: error.message
      };
    }
  }

  /**
   * Check if user has manually logged in and proceed
   */
  async checkLoginStatus(sessionId) {
    try {
      const session = this.sessions.get(sessionId);
      if (!session) {
        return {
          success: false,
          message: 'Session expired or invalid'
        };
      }

      const { page } = session;
      logger.info(`Checking login status for session: ${sessionId}`);
      
      // Wait for the user to complete manual login
      // Check if we're on a logged-in page
      const currentUrl = page.url();
      logger.info(`Current URL: ${currentUrl}`);
      
      // Check for indicators of successful login - OneQA uses /home
      const isLoggedIn = 
        currentUrl.includes('/home') ||
        currentUrl.includes('/dashboard') ||
        currentUrl.includes('/selectServiceProvider') ||
        currentUrl.includes('/services');
      
      // Also check for logout button as indicator of being logged in
      const logoutButton = await page.$('.logout, .logout-button, [href*="logout"], button:has-text("Logout")');
      
      if (isLoggedIn || logoutButton) {
        logger.info('User successfully logged in manually');
        session.status = 'authenticated';
        
        // If we're on the home page, we can get providers directly
        if (currentUrl.includes('/home')) {
          session.homeUrl = currentUrl;
        }
        
        return {
          success: true,
          message: 'Login successful'
        };
      } else {
        return {
          success: false,
          message: 'Not logged in yet. Please complete the login in the browser window.'
        };
      }
      
    } catch (error) {
      logger.error('Error checking login status:', error);
      return {
        success: false,
        message: error.message || 'Failed to check login status'
      };
    }
  }

  /**
   * Fetch service providers after manual login
   */
  async fetchServiceProviders(sessionId) {
    try {
      const session = this.sessions.get(sessionId);
      if (!session) {
        return {
          success: false,
          message: 'Session not found'
        };
      }

      const { page } = session;
      logger.info('Fetching service providers from OneQA');
      
      // Check current URL - OneQA shows providers on /home page
      const currentUrl = page.url();
      logger.info(`Current page URL: ${currentUrl}`);
      
      // If not on home page, navigate there
      if (!currentUrl.includes('/home')) {
        logger.info('Navigating to home page...');
        await page.goto(`${this.baseUrl}/home`, {
          waitUntil: 'domcontentloaded',
          timeout: 10000
        });
      }
      
      // Wait for providers to load
      await page.waitForTimeout(2000);
      
      // Extract providers - using the exact selectors from OneQA
      const providers = await page.evaluate(() => {
        const providerList = [];
        
        // Primary selector - exact match from capture
        const providerElements = document.querySelectorAll('.service-provider');
        
        providerElements.forEach(element => {
          // Extract provider name from the company-name span
          const nameEl = element.querySelector('.company-name');
          let name = nameEl ? nameEl.textContent?.trim() : null;
          
          // If no company-name class, extract from text content
          if (!name) {
            const text = element.textContent?.trim();
            // Extract provider name (it's the first word usually)
            const match = text?.match(/(Pepco|Pennsylvania American Water|Washington Gas)/i);
            name = match ? match[1] : text?.split(' ')[0];
          }
          
          // Extract total amount
          const amountText = element.textContent || '';
          const amountMatch = amountText.match(/Total Amount\s+\$([\\d,]+\\.\\d{2})/i);
          const totalAmount = amountMatch ? amountMatch[1] : null;
          
          // Extract account info
          const accountMatch = amountText.match(/(\d{10,})/); // Look for account numbers
          const accountNumber = accountMatch ? accountMatch[1] : null;
          
          // Get class for identification
          const classNames = element.className;
          const isFirst = classNames.includes('first');
          const isSecond = classNames.includes('second');
          const isThird = classNames.includes('third');
          
          // Determine ID based on position or name
          let providerId = name ? name.toLowerCase().replace(/[^a-z0-9]/g, '_') : '';
          if (isFirst) providerId = 'pepco';
          else if (isSecond) providerId = 'pennsylvania_american_water';
          else if (isThird) providerId = 'washington_gas';
          
          if (name) {
            providerList.push({
              id: providerId,
              name: name,
              totalAmount: totalAmount,
              accountNumber: accountNumber,
              className: classNames,
              hasInvoices: amountText.includes('Due:') ? 'Has pending bills' : null
            });
          }
        });
        
        // Remove duplicates based on name
        const unique = providerList.filter((provider, index, self) =>
          index === self.findIndex((p) => p.name === provider.name)
        );
        
        return unique;
      });
      
      logger.info(`Found ${providers.length} service providers`);
      
      // Take screenshot for debugging
      await page.screenshot({ 
        path: `providers-${Date.now()}.png`,
        fullPage: true 
      });
      
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
   * Fetch invoices from the bills page
   */
  async fetchProviderInvoices(sessionId, providerId) {
    try {
      const session = this.sessions.get(sessionId);
      if (!session) {
        return {
          success: false,
          message: 'Session not found'
        };
      }

      const { page } = session;
      logger.info(`Fetching invoices for provider: ${providerId}`);
      
      // Navigate to bills page where all invoices are shown
      logger.info('Navigating to bills page...');
      await page.goto(`${this.baseUrl}/bills`, {
        waitUntil: 'domcontentloaded',
        timeout: 10000
      });
      await page.waitForTimeout(3000);
      
      // Map provider ID to display name
      const providerNameMap = {
        'pepco': 'Pepco',
        'pennsylvania_american_water': 'Pennsylvania American Water',
        'washington_gas': 'Washington Gas'
      };
      const providerName = providerNameMap[providerId] || providerId;
      
      // Take screenshot of invoices page
      await page.screenshot({ 
        path: `invoices-${providerId}-${Date.now()}.png`,
        fullPage: true 
      });
      
      // Extract invoices from bills page - exact structure from capture
      const invoices = await page.evaluate((providerName) => {
        const invoiceList = [];
        
        // Primary selector - bill rows
        const billRows = document.querySelectorAll('.bill-row');
        
        billRows.forEach(row => {
          const text = row.textContent?.trim() || '';
          
          // Only process bills for the selected provider
          if (!providerName || text.includes(providerName)) {
            const invoice = {};
            
            // Extract invoice number
            const invoiceMatch = text.match(/Invoice:\s*(\d+)/i);
            invoice.invoiceNumber = invoiceMatch ? invoiceMatch[1] : null;
            
            // Extract date
            const dateMatch = text.match(/Date:\s*(\d{2}\/\d{2}\/\d{4})/i);
            invoice.date = dateMatch ? dateMatch[1] : null;
            
            // Extract amount
            const amountMatch = text.match(/Amount\s*\$([\\d,]+\\.\\d{2})/i);
            invoice.amount = amountMatch ? amountMatch[1] : null;
            
            // Extract status
            const statusMatch = text.match(/Status:\s*(\w+)/i);
            invoice.status = statusMatch ? statusMatch[1] : 'Unpaid';
            
            // Extract address
            const addressMatch = text.match(/(\d+\s+[A-Z\\s]+(?:ST|RD|DR|CT|AVE|BLVD|LN))\s+([A-Z\\s]+)\s+(\w{2})\s+(\d{5})/i);
            invoice.address = addressMatch ? addressMatch[0] : null;
            
            // Extract provider name
            const providerMatch = text.match(/^(Pepco|Pennsylvania American Water|Washington Gas)/i);
            invoice.serviceProvider = providerMatch ? providerMatch[1] : providerName;
            
            // Only add if we have essential data
            if (invoice.invoiceNumber && invoice.amount) {
              invoiceList.push(invoice);
            }
          }
        });
        
        return invoiceList;
      }, providerName);
      
      logger.info(`Found ${invoices.length} invoices`);
      
      // Transform to standard format
      const standardizedInvoices = invoices.map(inv => ({
        invoiceNumber: inv.invoiceNumber || `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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
    if (statusLower.includes('draft')) return 'draft';
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
}

// Create singleton instance
const oneQAManualService = new OneQAManualService();

export default oneQAManualService;