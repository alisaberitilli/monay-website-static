import axios from 'axios';
import { chromium } from 'playwright';
import logger from './logger.js';

class OneQAService {
  constructor() {
    this.baseUrl = 'https://oneqa.utilli.com';
    this.sessions = new Map(); // Store user sessions
  }

  /**
   * Initiate login with mobile number
   */
  async initiateLogin(mobileNumber) {
    try {
      logger.info(`Initiating OneQA login for mobile: ${mobileNumber}`);
      
      // Try API first
      try {
        const response = await axios.post(`${this.baseUrl}/authenticate/login`, {
          mobile: mobileNumber,
          countryCode: mobileNumber.startsWith('+1') ? '+1' : '+971'
        }, {
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });

        if (response.data.success || response.data.otpSent) {
          const sessionId = `session_${Date.now()}_${mobileNumber}`;
          this.sessions.set(sessionId, {
            mobileNumber,
            timestamp: Date.now(),
            status: 'otp_sent'
          });

          return {
            success: true,
            message: 'OTP sent successfully',
            sessionId,
            requiresOTP: true
          };
        }
      } catch (apiError) {
        logger.warn('API login failed, trying Playwright:', apiError.message);
      }

      // Fallback to Playwright if API fails
      return this.initiateLoginWithPlaywright(mobileNumber);

    } catch (error) {
      logger.error('Error initiating OneQA login:', error);
      return {
        success: false,
        message: 'Failed to initiate login',
        error: error.message
      };
    }
  }

  /**
   * Fallback login initiation using Playwright
   */
  async initiateLoginWithPlaywright(mobileNumber) {
    let browser = null;
    
    try {
      // Launch browser with Playwright
      browser = await chromium.launch({
        headless: true, // Set to false for debugging
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      });
      
      const page = await context.newPage();
      
      // Navigate to login page
      await page.goto(`${this.baseUrl}/login`, {
        waitUntil: 'networkidle',
        timeout: 30000
      });

      // Wait for mobile input and enter number
      await page.waitForSelector('input[type="tel"], input[placeholder*="mobile" i], input[placeholder*="phone" i], #mobile', { 
        timeout: 10000 
      });
      
      // Clear any existing value and type new number
      const mobileInput = await page.$('input[type="tel"], input[placeholder*="mobile" i], input[placeholder*="phone" i], #mobile');
      await mobileInput.fill(mobileNumber);
      
      // Click login/send OTP button
      const submitButton = await page.$('button[type="submit"], button:has-text("Send"), button:has-text("Login"), button:has-text("OTP"), #sendOTP');
      await submitButton.click();
      
      // Wait for OTP field to appear (indicates OTP was sent)
      try {
        await page.waitForSelector('input[placeholder*="OTP" i], input[placeholder*="code" i], input[type="text"][maxlength="6"], #otp', { 
          timeout: 10000 
        });

        const sessionId = `session_${Date.now()}_${mobileNumber}`;
        this.sessions.set(sessionId, {
          mobileNumber,
          timestamp: Date.now(),
          status: 'otp_sent',
          page,
          context,
          browser
        });

        return {
          success: true,
          message: 'OTP sent successfully',
          sessionId,
          requiresOTP: true
        };
      } catch (waitError) {
        // Check if we got an error message
        const errorMessage = await page.$eval('.error-message, .alert-danger, [role="alert"]', el => el.textContent).catch(() => null);
        
        if (errorMessage) {
          throw new Error(errorMessage);
        }
        
        throw waitError;
      }

    } catch (error) {
      logger.error('Error in Playwright login initiation:', error);
      if (browser) await browser.close();
      
      return {
        success: false,
        message: 'Failed to initiate login',
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

      logger.info(`Verifying OTP for session: ${sessionId}`);

      // Try API first
      try {
        const response = await axios.post(`${this.baseUrl}/authenticate/verify-otp`, {
          mobile: session.mobileNumber,
          otp: otp
        }, {
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0'
          }
        });

        if (response.data.success) {
          session.status = 'authenticated';
          session.authToken = response.data.token || response.headers['set-cookie'];
          
          return {
            success: true,
            message: 'Authentication successful',
            authToken: session.authToken
          };
        }
      } catch (apiError) {
        logger.warn('API OTP verification failed, trying Playwright:', apiError.message);
      }

      // Fallback to Playwright
      if (session.page) {
        return this.verifyOTPWithPlaywright(session, otp);
      }

      return {
        success: false,
        message: 'OTP verification failed'
      };

    } catch (error) {
      logger.error('Error verifying OTP:', error);
      return {
        success: false,
        message: 'OTP verification failed',
        error: error.message
      };
    }
  }

  /**
   * Verify OTP using Playwright
   */
  async verifyOTPWithPlaywright(session, otp) {
    try {
      const { page } = session;
      
      // Find and fill OTP input
      const otpInput = await page.$('input[placeholder*="OTP" i], input[placeholder*="code" i], input[type="text"][maxlength="6"], #otp');
      await otpInput.fill(otp);
      
      // Submit OTP
      const verifyButton = await page.$('button[type="submit"], button:has-text("Verify"), button:has-text("Submit"), #verifyOTP');
      
      // Click and wait for navigation
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {}),
        verifyButton.click()
      ]);

      // Check if login was successful by looking for indicators
      const isAuthenticated = await page.evaluate(() => {
        const url = window.location.href;
        // Check for successful login indicators
        return url.includes('/dashboard') || 
               url.includes('/selectServiceProvider') ||
               url.includes('/home') ||
               document.querySelector('.logout, .user-menu, .dashboard, [href*="logout"]') !== null;
      });

      if (isAuthenticated) {
        session.status = 'authenticated';
        
        // Store cookies for future requests
        const cookies = await page.context().cookies();
        session.cookies = cookies;
        
        return {
          success: true,
          message: 'Authentication successful'
        };
      }

      // Check for error message
      const errorMessage = await page.$eval('.error-message, .alert-danger, [role="alert"]', el => el.textContent).catch(() => null);
      
      return {
        success: false,
        message: errorMessage || 'Invalid OTP'
      };

    } catch (error) {
      logger.error('Error in Playwright OTP verification:', error);
      return {
        success: false,
        message: 'OTP verification failed',
        error: error.message
      };
    }
  }

  /**
   * Fetch available service providers after authentication
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

      logger.info('Fetching service providers from OneQA');

      if (session.page) {
        const { page } = session;
        
        // Navigate to service provider selection
        await page.goto(`${this.baseUrl}/selectServiceProvider`, {
          waitUntil: 'networkidle',
          timeout: 30000
        });

        // Wait for providers to load
        await page.waitForSelector('.provider-item, .service-provider, .provider-card, [data-provider]', {
          timeout: 10000
        });

        // Extract providers with Playwright's powerful selectors
        const providers = await page.evaluate(() => {
          const providerElements = document.querySelectorAll('.provider-item, .service-provider, .provider-card, [data-provider]');
          const providerList = [];
          
          providerElements.forEach(element => {
            // Extract provider information
            const name = element.querySelector('.provider-name, .title, h3, h4, span.name')?.textContent?.trim() ||
                        element.textContent?.trim();
            
            const accountNumber = element.querySelector('.account-number, .account, .acc-no')?.textContent?.trim();
            
            const logo = element.querySelector('img')?.src;
            
            const providerId = element.getAttribute('data-provider-id') || 
                             element.getAttribute('data-provider') ||
                             element.getAttribute('id') ||
                             element.querySelector('[data-provider-id]')?.getAttribute('data-provider-id') ||
                             name?.toLowerCase().replace(/[^a-z0-9]/g, '_');
            
            // Check for invoice count or balance
            const invoiceInfo = element.querySelector('.invoice-count, .balance, .amount')?.textContent?.trim();
            
            if (name && providerId) {
              providerList.push({
                id: providerId,
                name: name,
                accountNumber: accountNumber,
                logo: logo,
                hasInvoices: invoiceInfo || 'Check',
                element: element.outerHTML.substring(0, 100) // For debugging
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
      }

      return {
        success: false,
        message: 'No active session'
      };

    } catch (error) {
      logger.error('Error fetching service providers:', error);
      return {
        success: false,
        message: 'Failed to fetch providers',
        error: error.message
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

      logger.info(`Fetching invoices for provider: ${providerId}`);

      if (session.page) {
        const { page } = session;
        
        // Navigate back to provider selection if needed
        if (!page.url().includes('/selectServiceProvider')) {
          await page.goto(`${this.baseUrl}/selectServiceProvider`, {
            waitUntil: 'networkidle'
          });
        }

        // Click on the specific provider using multiple possible selectors
        const providerSelector = `[data-provider-id="${providerId}"], [data-provider="${providerId}"], #${providerId}, [id="${providerId}"]`;
        
        // Wait for provider element and click
        await page.waitForSelector(providerSelector, { timeout: 10000 });
        
        // Click and wait for navigation
        await Promise.all([
          page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {}),
          page.click(providerSelector)
        ]);

        // Wait for invoice data to load
        await page.waitForSelector('.invoice-row, .invoice-item, .bill-item, table tbody tr, .invoice-card', {
          timeout: 10000
        });

        // Extract invoice data using Playwright
        const invoices = await page.evaluate(() => {
          const invoiceElements = document.querySelectorAll('.invoice-row, .invoice-item, .bill-item, table tbody tr, .invoice-card');
          const invoiceList = [];
          
          invoiceElements.forEach(element => {
            const invoice = {};
            
            // Try multiple selectors for each field
            invoice.invoiceNumber = 
              element.querySelector('.invoice-number, .bill-number, .ref-number, td:nth-child(1)')?.textContent?.trim() ||
              element.querySelector('[data-invoice-number]')?.textContent?.trim();
            
            invoice.amount = 
              element.querySelector('.amount, .total, .invoice-amount, td:nth-child(2)')?.textContent?.trim() ||
              element.querySelector('[data-amount]')?.textContent?.trim();
            
            invoice.dueDate = 
              element.querySelector('.due-date, .date, td:nth-child(3)')?.textContent?.trim() ||
              element.querySelector('[data-due-date]')?.textContent?.trim();
            
            invoice.status = 
              element.querySelector('.status, .payment-status, td:nth-child(4)')?.textContent?.trim() ||
              element.querySelector('[data-status]')?.textContent?.trim();
            
            invoice.billingPeriod = 
              element.querySelector('.period, .billing-period, .month, td:nth-child(5)')?.textContent?.trim() ||
              element.querySelector('[data-period]')?.textContent?.trim();
            
            // Get download link
            const downloadLink = element.querySelector('a[href*="download"], a[href*="pdf"], .download-link, button.download');
            if (downloadLink) {
              invoice.downloadUrl = downloadLink.getAttribute('href') || downloadLink.getAttribute('data-url');
              if (invoice.downloadUrl && !invoice.downloadUrl.startsWith('http')) {
                invoice.downloadUrl = window.location.origin + invoice.downloadUrl;
              }
            }
            
            // Get service provider name from page
            invoice.serviceProvider = 
              document.querySelector('.provider-name, .company-name, h1, h2')?.textContent?.trim() ||
              document.title;
            
            // Only add if we have meaningful data
            if (invoice.invoiceNumber || invoice.amount) {
              invoiceList.push(invoice);
            }
          });
          
          return invoiceList;
        });

        logger.info(`Found ${invoices.length} invoices for provider ${providerId}`);
        
        return {
          success: true,
          invoices: invoices
        };
      }

      return {
        success: false,
        message: 'No active session'
      };

    } catch (error) {
      logger.error('Error fetching provider invoices:', error);
      return {
        success: false,
        message: 'Failed to fetch invoices',
        error: error.message
      };
    }
  }

  /**
   * Download invoice PDF
   */
  async downloadInvoice(sessionId, downloadUrl) {
    try {
      const session = this.sessions.get(sessionId);
      if (!session || session.status !== 'authenticated') {
        return {
          success: false,
          message: 'Not authenticated'
        };
      }

      const { page } = session;
      
      // Set up download handling
      const downloadPromise = page.waitForEvent('download');
      
      // Navigate to download URL or click download button
      if (downloadUrl.startsWith('http')) {
        await page.goto(downloadUrl);
      } else {
        await page.click(`a[href="${downloadUrl}"], button[data-url="${downloadUrl}"]`);
      }
      
      const download = await downloadPromise;
      
      // Save the file
      const path = await download.path();
      
      return {
        success: true,
        path: path,
        filename: download.suggestedFilename()
      };
      
    } catch (error) {
      logger.error('Error downloading invoice:', error);
      return {
        success: false,
        message: 'Failed to download invoice',
        error: error.message
      };
    }
  }

  /**
   * Clean up session
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
   * Clean up old sessions (run periodically)
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

  /**
   * Get available providers without authentication (for testing)
   */
  async getAvailableProviders() {
    let browser = null;
    
    try {
      browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      const page = await browser.newPage();
      
      // This would need to handle authentication or use a test account
      // For now, return sample providers
      return [
        {
          id: 'dewa',
          name: 'Dubai Electricity & Water Authority',
          logo: '💡',
          description: 'DEWA services and bills',
          supportsOTP: true,
          categories: ['electricity', 'water']
        },
        {
          id: 'etisalat',
          name: 'Etisalat',
          logo: '📱',
          description: 'Telecom and internet services',
          supportsOTP: true,
          categories: ['telecom', 'internet']
        },
        {
          id: 'du',
          name: 'Du',
          logo: '📞',
          description: 'Mobile and home services',
          supportsOTP: true,
          categories: ['telecom', 'internet', 'tv']
        },
        {
          id: 'addc',
          name: 'Abu Dhabi Distribution Company',
          logo: '⚡',
          description: 'Electricity and water services',
          supportsOTP: true,
          categories: ['electricity', 'water']
        }
      ];
      
    } catch (error) {
      logger.error('Error getting test providers:', error);
      return [];
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }
}

// Set up periodic cleanup
const oneQAService = new OneQAService();
setInterval(() => {
  oneQAService.cleanupSessions();
}, 30 * 60 * 1000); // Run every 30 minutes

export default oneQAService;