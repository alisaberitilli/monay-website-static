import { chromium } from 'playwright';
import loggers from './logger.js';

const logger = loggers.internalLogger || console;

class OneQAAutomatedService {
  constructor() {
    this.baseUrl = 'https://oneqa.utilli.com';
    this.sessions = new Map();
  }

  /**
   * Automated login with mobile number and OTP
   */
  async automatedLogin(mobileNumber) {
    let browser = null;
    let context = null;
    let page = null;
    
    try {
      logger.info(`Starting automated OneQA login for: ${mobileNumber}`);
      
      // Launch browser in headless mode for automation
      browser = await chromium.launch({
        headless: true, // Run in background
        args: ['--disable-blink-features=AutomationControlled']
      });
      
      context = await browser.newContext({
        viewport: { width: 1280, height: 720 },
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      });
      
      page = await context.newPage();
      
      // Navigate to login page
      await page.goto(`${this.baseUrl}/login`, {
        waitUntil: 'domcontentloaded',
        timeout: 30000
      });
      
      // Wait for login form to load
      await page.waitForTimeout(2000);
      
      // Try to find and fill mobile number input
      const mobileInputSelectors = [
        'input[type="tel"]',
        'input[name*="mobile"]',
        'input[name*="phone"]',
        'input[placeholder*="mobile"]',
        'input[placeholder*="phone"]',
        '#mobile',
        '#phone'
      ];
      
      let mobileInputFilled = false;
      for (const selector of mobileInputSelectors) {
        try {
          const element = await page.$(selector);
          if (element) {
            await element.fill(mobileNumber);
            mobileInputFilled = true;
            logger.info(`Filled mobile number using selector: ${selector}`);
            break;
          }
        } catch (e) {
          // Try next selector
        }
      }
      
      if (!mobileInputFilled) {
        throw new Error('Could not find mobile number input field');
      }
      
      // Find and click send OTP button
      const sendOtpSelectors = [
        'button:has-text("Send OTP")',
        'button:has-text("Get OTP")',
        'button:has-text("Send Code")',
        'button[type="submit"]',
        '.btn-primary'
      ];
      
      let otpSent = false;
      for (const selector of sendOtpSelectors) {
        try {
          const button = await page.$(selector);
          if (button) {
            await button.click();
            otpSent = true;
            logger.info(`Clicked send OTP button: ${selector}`);
            break;
          }
        } catch (e) {
          // Try next selector
        }
      }
      
      if (!otpSent) {
        throw new Error('Could not find send OTP button');
      }
      
      // Store session for OTP verification
      const sessionId = `session_${Date.now()}_auto`;
      this.sessions.set(sessionId, {
        mobileNumber,
        page,
        context,
        browser,
        status: 'otp_sent',
        timestamp: Date.now()
      });
      
      logger.info('OTP request sent successfully');
      
      return {
        success: true,
        sessionId,
        message: 'OTP sent successfully. Please provide the OTP to continue.',
        requiresOTP: true
      };
      
    } catch (error) {
      logger.error('Error in automated login:', error);
      if (browser) await browser.close();
      
      return {
        success: false,
        message: error.message || 'Failed to initiate login',
        error: error.message
      };
    }
  }

  /**
   * Verify OTP and complete login
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
      
      // Find and fill OTP input
      const otpInputSelectors = [
        'input[type="text"][maxlength="6"]',
        'input[type="number"][maxlength="6"]',
        'input[name*="otp"]',
        'input[name*="code"]',
        'input[placeholder*="OTP"]',
        'input[placeholder*="code"]',
        '#otp'
      ];
      
      let otpFilled = false;
      for (const selector of otpInputSelectors) {
        try {
          const element = await page.$(selector);
          if (element) {
            await element.fill(otp);
            otpFilled = true;
            logger.info(`Filled OTP using selector: ${selector}`);
            break;
          }
        } catch (e) {
          // Try next selector
        }
      }
      
      if (!otpFilled) {
        return {
          success: false,
          message: 'Could not find OTP input field'
        };
      }
      
      // Find and click verify button
      const verifySelectors = [
        'button:has-text("Verify")',
        'button:has-text("Submit")',
        'button:has-text("Confirm")',
        'button[type="submit"]'
      ];
      
      for (const selector of verifySelectors) {
        try {
          const button = await page.$(selector);
          if (button) {
            await button.click();
            logger.info(`Clicked verify button: ${selector}`);
            break;
          }
        } catch (e) {
          // Try next selector
        }
      }
      
      // Wait for navigation after login
      await page.waitForTimeout(3000);
      
      // Check if login was successful
      const currentUrl = page.url();
      logger.info(`Current URL after OTP: ${currentUrl}`);
      
      if (currentUrl.includes('/home') || currentUrl.includes('/dashboard')) {
        session.status = 'authenticated';
        session.authToken = `oneqa_token_${Date.now()}`;
        
        return {
          success: true,
          authToken: session.authToken,
          message: 'Login successful'
        };
      } else {
        return {
          success: false,
          message: 'Login failed. Please check your OTP.'
        };
      }
      
    } catch (error) {
      logger.error('Error verifying OTP:', error);
      return {
        success: false,
        message: error.message || 'Failed to verify OTP'
      };
    }
  }

  /**
   * Fetch service providers - automated extraction
   */
  async fetchServiceProviders(sessionId) {
    try {
      const session = this.sessions.get(sessionId);
      if (!session || session.status !== 'authenticated') {
        return {
          success: false,
          message: 'Not authenticated. Please login first.'
        };
      }

      const { page } = session;
      logger.info('Fetching service providers');
      
      // Navigate to home page if not already there
      const currentUrl = page.url();
      if (!currentUrl.includes('/home')) {
        await page.goto(`${this.baseUrl}/home`, {
          waitUntil: 'domcontentloaded',
          timeout: 10000
        });
        await page.waitForTimeout(2000);
      }
      
      // Extract providers using known structure
      const providers = await page.evaluate(() => {
        const providerList = [];
        
        // Get all service-provider elements
        const providerElements = document.querySelectorAll('.service-provider');
        
        providerElements.forEach(element => {
          const text = element.textContent?.trim() || '';
          
          // Extract provider name
          let name = null;
          const nameMatch = text.match(/(Pepco|Pennsylvania American Water|Washington Gas)/i);
          if (nameMatch) {
            name = nameMatch[1];
          }
          
          // Extract total amount
          const amountMatch = text.match(/Total Amount\s+\$([\\d,]+\\.\\d{2})/i);
          const totalAmount = amountMatch ? parseFloat(amountMatch[1].replace(',', '')) : 0;
          
          // Extract account numbers
          const accountNumbers = [];
          const accountMatches = text.matchAll(/(\d{10,})/g);
          for (const match of accountMatches) {
            accountNumbers.push(match[1]);
          }
          
          // Extract addresses and individual amounts
          const accounts = [];
          const lines = text.split('\n').map(l => l.trim()).filter(l => l);
          
          for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            // Look for address patterns
            if (line.match(/\d+\s+[A-Z]/)) {
              const account = {
                address: line,
                accountNumber: lines[i + 1] || null,
                amount: null,
                dueDate: null
              };
              
              // Look for amount in next lines
              for (let j = i + 1; j < Math.min(i + 4, lines.length); j++) {
                const nextLine = lines[j];
                const amountMatch = nextLine.match(/\$([\\d,]+\\.\\d{2})/);
                if (amountMatch) {
                  account.amount = parseFloat(amountMatch[1].replace(',', ''));
                }
                const dueMatch = nextLine.match(/Due:\s*(\d+\s+\w+)/);
                if (dueMatch) {
                  account.dueDate = dueMatch[1];
                }
              }
              
              if (account.amount) {
                accounts.push(account);
              }
            }
          }
          
          // Get class for identification
          const className = element.className;
          let providerId = '';
          if (className.includes('first')) providerId = 'pepco';
          else if (className.includes('second')) providerId = 'pennsylvania_american_water';
          else if (className.includes('third')) providerId = 'washington_gas';
          
          if (name && providerId) {
            providerList.push({
              id: providerId,
              name: name,
              totalAmount: totalAmount,
              accountNumbers: accountNumbers,
              accounts: accounts,
              hasInvoices: accounts.length > 0
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
      logger.error('Error fetching providers:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch providers'
      };
    }
  }

  /**
   * Fetch all invoices from bills page
   */
  async fetchAllInvoices(sessionId) {
    try {
      const session = this.sessions.get(sessionId);
      if (!session || session.status !== 'authenticated') {
        return {
          success: false,
          message: 'Not authenticated. Please login first.'
        };
      }

      const { page } = session;
      logger.info('Fetching all invoices from bills page');
      
      // Navigate to bills page
      await page.goto(`${this.baseUrl}/bills`, {
        waitUntil: 'domcontentloaded',
        timeout: 10000
      });
      await page.waitForTimeout(3000);
      
      // Extract all bills
      const invoices = await page.evaluate(() => {
        const invoiceList = [];
        
        // Get all bill rows
        const billRows = document.querySelectorAll('.bill-row');
        
        billRows.forEach(row => {
          const text = row.textContent?.trim() || '';
          
          const invoice = {};
          
          // Extract provider name
          const providerMatch = text.match(/^(Pepco|Pennsylvania American Water|Washington Gas)/i);
          invoice.serviceProvider = providerMatch ? providerMatch[1] : null;
          
          // Extract invoice number
          const invoiceMatch = text.match(/Invoice:\s*(\d+)/i);
          invoice.invoiceNumber = invoiceMatch ? invoiceMatch[1] : null;
          
          // Extract date
          const dateMatch = text.match(/Date:\s*(\d{2}\/\d{2}\/\d{4})/i);
          invoice.date = dateMatch ? dateMatch[1] : null;
          
          // Extract amount
          const amountMatch = text.match(/Amount\s*\$([\\d,]+\\.\\d{2})/i);
          invoice.amount = amountMatch ? parseFloat(amountMatch[1].replace(',', '')) : null;
          
          // Extract status
          const statusMatch = text.match(/Status:\s*(\w+)/i);
          invoice.status = statusMatch ? statusMatch[1].toLowerCase() : 'unpaid';
          
          // Extract address
          const addressMatch = text.match(/(\d+\s+[A-Z\\s]+(?:ST|RD|DR|CT|AVE|BLVD|LN))\s+([A-Z\\s]+)\s+(\w{2})\s+(\d{5})/i);
          invoice.address = addressMatch ? addressMatch[0] : null;
          
          // Map provider to ID
          let providerId = '';
          if (invoice.serviceProvider === 'Pepco') providerId = 'pepco';
          else if (invoice.serviceProvider === 'Pennsylvania American Water') providerId = 'pennsylvania_american_water';
          else if (invoice.serviceProvider === 'Washington Gas') providerId = 'washington_gas';
          
          invoice.providerId = providerId;
          
          // Only add if we have essential data
          if (invoice.invoiceNumber && invoice.amount) {
            invoiceList.push(invoice);
          }
        });
        
        return invoiceList;
      });
      
      logger.info(`Found ${invoices.length} invoices`);
      
      // Group invoices by provider
      const invoicesByProvider = {};
      invoices.forEach(invoice => {
        if (!invoicesByProvider[invoice.providerId]) {
          invoicesByProvider[invoice.providerId] = [];
        }
        invoicesByProvider[invoice.providerId].push(invoice);
      });
      
      return {
        success: true,
        invoices: invoices,
        invoicesByProvider: invoicesByProvider,
        summary: {
          total: invoices.length,
          totalAmount: invoices.reduce((sum, inv) => sum + (inv.amount || 0), 0),
          byProvider: Object.keys(invoicesByProvider).map(providerId => ({
            providerId,
            count: invoicesByProvider[providerId].length,
            totalAmount: invoicesByProvider[providerId].reduce((sum, inv) => sum + (inv.amount || 0), 0)
          }))
        }
      };
      
    } catch (error) {
      logger.error('Error fetching invoices:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch invoices'
      };
    }
  }

  /**
   * Fetch invoices for specific provider
   */
  async fetchProviderInvoices(sessionId, providerId) {
    try {
      // Get all invoices and filter by provider
      const result = await this.fetchAllInvoices(sessionId);
      
      if (!result.success) {
        return result;
      }
      
      const providerInvoices = result.invoicesByProvider[providerId] || [];
      
      return {
        success: true,
        invoices: providerInvoices,
        providerId: providerId,
        count: providerInvoices.length,
        totalAmount: providerInvoices.reduce((sum, inv) => sum + (inv.amount || 0), 0)
      };
      
    } catch (error) {
      logger.error('Error fetching provider invoices:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch provider invoices'
      };
    }
  }

  /**
   * Close session and cleanup
   */
  async closeSession(sessionId) {
    const session = this.sessions.get(sessionId);
    if (session) {
      try {
        if (session.browser) {
          await session.browser.close();
        }
      } catch (e) {
        logger.error('Error closing browser:', e);
      }
      this.sessions.delete(sessionId);
      logger.info(`Closed session: ${sessionId}`);
    }
  }

  /**
   * Clean up old sessions (call periodically)
   */
  async cleanupSessions() {
    const now = Date.now();
    const maxAge = 30 * 60 * 1000; // 30 minutes
    
    for (const [sessionId, session] of this.sessions) {
      if (now - session.timestamp > maxAge) {
        await this.closeSession(sessionId);
      }
    }
  }
}

// Create singleton instance
const oneQAAutomatedService = new OneQAAutomatedService();

// Cleanup old sessions every 10 minutes
setInterval(() => {
  oneQAAutomatedService.cleanupSessions();
}, 10 * 60 * 1000);

export default oneQAAutomatedService;