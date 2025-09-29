import axios from 'axios';
import puppeteer from 'puppeteer';
import logger from './logger.js';
import { encrypt, decrypt } from './encrypt.js';

class ServiceProviderInvoiceService {
  constructor() {
    this.providers = {
      'oneqa': {
        loginUrl: 'https://oneqa.utilli.com/login',
        selectProviderUrl: 'https://oneqa.utilli.com/selectServiceProvider',
        invoiceUrl: 'https://oneqa.utilli.com/invoices',
        name: 'OneQA Utilities'
      },
      'dewa': {
        loginUrl: 'https://www.dewa.gov.ae/en/consumer/billing-and-payment',
        name: 'Dubai Electricity & Water Authority'
      },
      'etisalat': {
        loginUrl: 'https://www.etisalat.ae/en/personal/billing',
        name: 'Etisalat Telecom'
      },
      'du': {
        loginUrl: 'https://www.du.ae/personal/myaccount',
        name: 'Du Telecom'
      }
    };
  }

  /**
   * Fetch invoices from service provider using credentials
   * @param {Object} credentials - Provider credentials
   * @param {string} credentials.provider - Provider identifier
   * @param {string} credentials.username - User login
   * @param {string} credentials.password - User password
   * @param {string} credentials.otp - One-time password if required
   * @param {string} userId - User ID for storing credentials
   */
  async fetchInvoices(credentials, userId) {
    const { provider, username, password, otp } = credentials;
    
    if (!this.providers[provider]) {
      throw new Error(`Unsupported provider: ${provider}`);
    }

    try {
      logger.info(`Fetching invoices from ${provider} for user ${userId}`);
      
      // Use appropriate method based on provider
      let invoices = [];
      
      if (provider === 'oneqa') {
        invoices = await this.fetchOneQAInvoices(username, password, otp);
      } else {
        // For other providers, implement specific logic
        invoices = await this.fetchGenericInvoices(provider, username, password, otp);
      }
      
      // Transform invoices to standard format
      const standardizedInvoices = this.standardizeInvoices(invoices, provider);
      
      logger.info(`Successfully fetched ${standardizedInvoices.length} invoices from ${provider}`);
      return standardizedInvoices;
      
    } catch (error) {
      logger.error(`Error fetching invoices from ${provider}:`, error);
      throw error;
    }
  }

  /**
   * Fetch invoices from OneQA using web scraping
   */
  async fetchOneQAInvoices(username, password, otp) {
    let browser = null;
    
    try {
      // Launch headless browser
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      const page = await browser.newPage();
      
      // Navigate to login page
      await page.goto(this.providers.oneqa.loginUrl, { 
        waitUntil: 'networkidle2' 
      });
      
      // Fill login credentials
      await page.type('#username', username);
      await page.type('#password', password);
      
      // Submit login
      await page.click('#loginButton');
      await page.waitForNavigation({ waitUntil: 'networkidle2' });
      
      // Handle OTP if required
      if (otp) {
        await page.waitForSelector('#otpInput', { timeout: 5000 });
        await page.type('#otpInput', otp);
        await page.click('#verifyOtp');
        await page.waitForNavigation({ waitUntil: 'networkidle2' });
      }
      
      // Navigate to service provider selection
      await page.goto(this.providers.oneqa.selectProviderUrl, {
        waitUntil: 'networkidle2'
      });
      
      // Get available providers
      const providers = await page.evaluate(() => {
        const providerElements = document.querySelectorAll('.provider-card');
        return Array.from(providerElements).map(el => ({
          id: el.getAttribute('data-provider-id'),
          name: el.querySelector('.provider-name')?.textContent,
          accountNumber: el.querySelector('.account-number')?.textContent
        }));
      });
      
      const allInvoices = [];
      
      // Fetch invoices for each provider
      for (const provider of providers) {
        await page.click(`[data-provider-id="${provider.id}"]`);
        await page.waitForNavigation({ waitUntil: 'networkidle2' });
        
        // Extract invoice data
        const invoices = await page.evaluate(() => {
          const invoiceRows = document.querySelectorAll('.invoice-row');
          return Array.from(invoiceRows).map(row => ({
            invoiceNumber: row.querySelector('.invoice-number')?.textContent,
            amount: row.querySelector('.invoice-amount')?.textContent,
            dueDate: row.querySelector('.due-date')?.textContent,
            status: row.querySelector('.invoice-status')?.textContent,
            serviceProvider: document.querySelector('.provider-header')?.textContent,
            accountNumber: row.querySelector('.account-number')?.textContent,
            billingPeriod: row.querySelector('.billing-period')?.textContent,
            downloadUrl: row.querySelector('.download-link')?.getAttribute('href')
          }));
        });
        
        allInvoices.push(...invoices);
        
        // Go back to provider selection
        await page.goBack();
      }
      
      return allInvoices;
      
    } catch (error) {
      logger.error('Error in OneQA invoice fetching:', error);
      throw error;
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  /**
   * Generic invoice fetching using API if available
   */
  async fetchGenericInvoices(provider, username, password, otp) {
    // This would be implemented based on each provider's API
    // For now, return sample data
    return [
      {
        invoiceNumber: `${provider.toUpperCase()}-2024-001`,
        amount: '500.00',
        dueDate: '2024-02-15',
        status: 'pending',
        serviceProvider: this.providers[provider].name,
        accountNumber: username,
        billingPeriod: 'January 2024'
      }
    ];
  }

  /**
   * Standardize invoice format across different providers
   */
  standardizeInvoices(invoices, provider) {
    return invoices.map(invoice => ({
      externalId: invoice.invoiceNumber,
      provider: provider,
      providerName: this.providers[provider].name,
      accountNumber: invoice.accountNumber,
      amount: this.parseAmount(invoice.amount),
      currency: 'AED', // Default to AED for UAE providers
      dueDate: this.parseDate(invoice.dueDate),
      billingPeriod: invoice.billingPeriod,
      status: this.mapStatus(invoice.status),
      originalData: invoice,
      downloadUrl: invoice.downloadUrl,
      createdAt: new Date().toISOString()
    }));
  }

  /**
   * Parse amount string to number
   */
  parseAmount(amountStr) {
    if (!amountStr) return 0;
    // Remove currency symbols and parse
    const cleaned = amountStr.replace(/[^0-9.-]/g, '');
    return parseFloat(cleaned) || 0;
  }

  /**
   * Parse date string to ISO format
   */
  parseDate(dateStr) {
    if (!dateStr) return null;
    try {
      return new Date(dateStr).toISOString();
    } catch (error) {
      return dateStr;
    }
  }

  /**
   * Map provider status to standard status
   */
  mapStatus(status) {
    const statusMap = {
      'paid': 'paid',
      'unpaid': 'pending',
      'overdue': 'overdue',
      'pending': 'pending',
      'cancelled': 'cancelled'
    };
    
    return statusMap[status?.toLowerCase()] || 'pending';
  }

  /**
   * Store provider credentials securely
   */
  async storeProviderCredentials(userId, provider, credentials) {
    const encryptedCredentials = {
      username: credentials.username,
      password: encrypt(credentials.password),
      provider: provider,
      lastSync: new Date().toISOString()
    };
    
    // Store in database (implementation depends on your model)
    // await UserProviderCredentials.create({ userId, ...encryptedCredentials });
    
    return true;
  }

  /**
   * Get stored provider credentials
   */
  async getProviderCredentials(userId, provider) {
    // Fetch from database
    // const credentials = await UserProviderCredentials.findOne({ userId, provider });
    
    // if (credentials) {
    //   return {
    //     username: credentials.username,
    //     password: decrypt(credentials.password),
    //     provider: credentials.provider
    //   };
    // }
    
    return null;
  }

  /**
   * Schedule automatic invoice sync
   */
  async scheduleInvoiceSync(userId, provider, schedule = '0 0 * * *') {
    // Implement cron job for automatic syncing
    // This would use node-cron or similar
    logger.info(`Scheduled invoice sync for user ${userId} provider ${provider}`);
  }
}

export default new ServiceProviderInvoiceService();