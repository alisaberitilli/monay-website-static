import EventEmitter from 'events';
import axios from 'axios';
import crypto from 'crypto';
import { Pool } from 'pg';

class ZohoEnhancedConnector extends EventEmitter {
  constructor(config = {}) {
    super();
    this.config = {
      clientId: process.env.ZOHO_CLIENT_ID || config.clientId,
      clientSecret: process.env.ZOHO_CLIENT_SECRET || config.clientSecret,
      redirectUri: process.env.ZOHO_REDIRECT_URI || config.redirectUri,
      region: process.env.ZOHO_REGION || config.region || 'com', // com, eu, in, au
      apiVersion: 'v3',
      syncInterval: config.syncInterval || 3600000, // 1 hour
      batchSize: config.batchSize || 100,
      encryptionKey: process.env.ZOHO_ENCRYPTION_KEY || config.encryptionKey,
      ...config
    };

    this.baseUrl = `https://books.zoho.${this.config.region}/api/${this.config.apiVersion}`;
    this.authUrl = `https://accounts.zoho.${this.config.region}`;

    this.db = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgresql://localhost/monay'
    });

    this.connectedAccounts = new Map();
    this.syncStatus = new Map();
    this.webhookHandlers = new Map();
    this.automationRules = new Map();
    this.customFields = new Map();
    this.taxEngines = new Map();

    this.initialize();
  }

  async initialize() {
    try {
      await this.createDatabaseSchema();
      await this.loadConnectedAccounts();
      await this.loadAutomationRules();
      await this.startSyncScheduler();

      this.emit('initialized', {
        timestamp: new Date(),
        accounts: this.connectedAccounts.size,
        rules: this.automationRules.size
      });
    } catch (error) {
      this.emit('error', { error, context: 'initialization' });
    }
  }

  async createDatabaseSchema() {
    const queries = [
      `CREATE TABLE IF NOT EXISTS zoho_connections (
        id SERIAL PRIMARY KEY,
        organization_id VARCHAR(255) NOT NULL,
        account_id VARCHAR(255) UNIQUE NOT NULL,
        organization_name VARCHAR(255),
        access_token TEXT,
        refresh_token TEXT,
        token_expiry TIMESTAMP,
        scope TEXT,
        region VARCHAR(10),
        features JSONB DEFAULT '{}',
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      `CREATE TABLE IF NOT EXISTS zoho_sync_history (
        id SERIAL PRIMARY KEY,
        account_id VARCHAR(255) NOT NULL,
        entity_type VARCHAR(50) NOT NULL,
        sync_type VARCHAR(20) NOT NULL,
        status VARCHAR(20) NOT NULL,
        records_synced INTEGER DEFAULT 0,
        errors INTEGER DEFAULT 0,
        started_at TIMESTAMP,
        completed_at TIMESTAMP,
        error_details JSONB DEFAULT '[]',
        metadata JSONB DEFAULT '{}',
        FOREIGN KEY (account_id) REFERENCES zoho_connections(account_id)
      )`,

      `CREATE TABLE IF NOT EXISTS zoho_entities (
        id SERIAL PRIMARY KEY,
        account_id VARCHAR(255) NOT NULL,
        entity_type VARCHAR(50) NOT NULL,
        entity_id VARCHAR(255) NOT NULL,
        data JSONB NOT NULL,
        custom_fields JSONB DEFAULT '{}',
        tags JSONB DEFAULT '[]',
        attachments JSONB DEFAULT '[]',
        synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(account_id, entity_type, entity_id),
        FOREIGN KEY (account_id) REFERENCES zoho_connections(account_id)
      )`,

      `CREATE TABLE IF NOT EXISTS zoho_automation_rules (
        id SERIAL PRIMARY KEY,
        account_id VARCHAR(255) NOT NULL,
        rule_name VARCHAR(255) NOT NULL,
        trigger_type VARCHAR(50) NOT NULL,
        conditions JSONB NOT NULL,
        actions JSONB NOT NULL,
        enabled BOOLEAN DEFAULT true,
        priority INTEGER DEFAULT 0,
        last_triggered TIMESTAMP,
        execution_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (account_id) REFERENCES zoho_connections(account_id)
      )`,

      `CREATE TABLE IF NOT EXISTS zoho_tax_rules (
        id SERIAL PRIMARY KEY,
        account_id VARCHAR(255) NOT NULL,
        tax_id VARCHAR(255) NOT NULL,
        tax_name VARCHAR(255),
        tax_percentage DECIMAL(10,4),
        tax_type VARCHAR(50),
        is_compound BOOLEAN DEFAULT false,
        is_inclusive BOOLEAN DEFAULT false,
        region_codes JSONB DEFAULT '[]',
        product_categories JSONB DEFAULT '[]',
        exemptions JSONB DEFAULT '[]',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (account_id) REFERENCES zoho_connections(account_id)
      )`,

      `CREATE TABLE IF NOT EXISTS zoho_recurring_profiles (
        id SERIAL PRIMARY KEY,
        account_id VARCHAR(255) NOT NULL,
        profile_id VARCHAR(255) NOT NULL,
        profile_type VARCHAR(50) NOT NULL,
        customer_id VARCHAR(255),
        frequency VARCHAR(20),
        start_date DATE,
        end_date DATE,
        next_invoice_date DATE,
        total_amount DECIMAL(15,2),
        currency_code VARCHAR(3),
        status VARCHAR(20),
        line_items JSONB DEFAULT '[]',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (account_id) REFERENCES zoho_connections(account_id)
      )`
    ];

    for (const query of queries) {
      await this.db.query(query);
    }

    // Create indexes
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_zoho_entities_lookup
      ON zoho_entities(account_id, entity_type, entity_id)
    `);

    await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_zoho_sync_history
      ON zoho_sync_history(account_id, entity_type, status)
    `);
  }

  // OAuth 2.0 Authentication
  async authorize(accountId) {
    const authParams = new URLSearchParams({
      scope: 'ZohoBooks.fullaccess.all',
      client_id: this.config.clientId,
      response_type: 'code',
      redirect_uri: this.config.redirectUri,
      access_type: 'offline',
      prompt: 'consent'
    });

    return `${this.authUrl}/oauth/v2/auth?${authParams}`;
  }

  async handleCallback(code, accountId) {
    try {
      const response = await axios.post(`${this.authUrl}/oauth/v2/token`, null, {
        params: {
          code,
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          redirect_uri: this.config.redirectUri,
          grant_type: 'authorization_code'
        }
      });

      const { access_token, refresh_token, expires_in } = response.data;

      const connection = {
        accountId,
        accessToken: this.encrypt(access_token),
        refreshToken: this.encrypt(refresh_token),
        tokenExpiry: new Date(Date.now() + expires_in * 1000)
      };

      await this.saveConnection(connection);

      // Get organization info
      await this.getOrganizationInfo(accountId);

      return { success: true, accountId };
    } catch (error) {
      this.emit('error', { error, context: 'oauth_callback' });
      throw error;
    }
  }

  // Enhanced Entity Management
  async syncAllEntities(accountId) {
    const syncTasks = [
      { type: 'organizations', method: this.syncOrganizations },
      { type: 'contacts', method: this.syncContacts },
      { type: 'items', method: this.syncItems },
      { type: 'invoices', method: this.syncInvoices },
      { type: 'bills', method: this.syncBills },
      { type: 'estimates', method: this.syncEstimates },
      { type: 'creditnotes', method: this.syncCreditNotes },
      { type: 'purchaseorders', method: this.syncPurchaseOrders },
      { type: 'salesorders', method: this.syncSalesOrders },
      { type: 'recurringinvoices', method: this.syncRecurringInvoices },
      { type: 'expenses', method: this.syncExpenses },
      { type: 'bankaccounts', method: this.syncBankAccounts },
      { type: 'banktransactions', method: this.syncBankTransactions },
      { type: 'projects', method: this.syncProjects },
      { type: 'timesheets', method: this.syncTimeSheets },
      { type: 'taxes', method: this.syncTaxes },
      { type: 'journals', method: this.syncJournals }
    ];

    const results = [];
    for (const task of syncTasks) {
      try {
        const result = await task.method.call(this, accountId);
        results.push({ type: task.type, ...result });
      } catch (error) {
        results.push({ type: task.type, error: error.message });
      }
    }

    return results;
  }

  async syncContacts(accountId, fromDate = null) {
    const syncId = await this.startSync(accountId, 'contacts', 'full');

    try {
      let page = 1;
      let hasMore = true;
      let totalSynced = 0;
      const errors = [];

      while (hasMore) {
        const params = {
          page,
          per_page: this.config.batchSize
        };

        if (fromDate) {
          params.last_modified_time = fromDate;
        }

        const response = await this.makeRequest(accountId, 'GET', '/contacts', params);
        const contacts = response.data.contacts || [];

        for (const contact of contacts) {
          try {
            // Enhance with custom fields
            const enhanced = await this.enhanceContactData(contact);

            await this.db.query(`
              INSERT INTO zoho_entities (account_id, entity_type, entity_id, data, custom_fields)
              VALUES ($1, $2, $3, $4, $5)
              ON CONFLICT (account_id, entity_type, entity_id)
              DO UPDATE SET data = $4, custom_fields = $5, updated_at = CURRENT_TIMESTAMP
            `, [accountId, 'contact', contact.contact_id, JSON.stringify(enhanced),
                JSON.stringify(contact.custom_fields || {})]);

            totalSynced++;

            // Check automation rules
            await this.checkAutomationRules(accountId, 'contact_sync', enhanced);

          } catch (error) {
            errors.push({ contactId: contact.contact_id, error: error.message });
          }
        }

        hasMore = response.data.page_context?.has_more_page || false;
        page++;
      }

      await this.completeSync(syncId, 'completed', totalSynced, errors);
      return { success: true, totalSynced, errors };

    } catch (error) {
      await this.completeSync(syncId, 'failed', 0, [error.message]);
      throw error;
    }
  }

  async enhanceContactData(contact) {
    // Add credit score calculation
    contact.credit_score = this.calculateCreditScore(contact);

    // Add lifetime value
    contact.lifetime_value = await this.calculateLifetimeValue(contact);

    // Add communication preferences
    contact.communication_preferences = this.detectCommunicationPreferences(contact);

    // Add segmentation
    contact.segments = this.assignSegments(contact);

    return contact;
  }

  // Advanced Invoice Management
  async createSmartInvoice(accountId, invoiceData) {
    try {
      // Apply smart defaults
      const enhanced = await this.applyInvoiceDefaults(accountId, invoiceData);

      // Calculate taxes automatically
      enhanced.line_items = await this.calculateLineTaxes(accountId, enhanced.line_items);

      // Apply discounts if applicable
      enhanced.discount = await this.calculateOptimalDiscount(enhanced);

      // Set payment terms
      enhanced.payment_terms = await this.determinePaymentTerms(enhanced);

      // Create invoice
      const response = await this.makeRequest(accountId, 'POST', '/invoices', enhanced);

      // Set up automated reminders
      await this.setupPaymentReminders(accountId, response.data.invoice);

      // Trigger automation rules
      await this.checkAutomationRules(accountId, 'invoice_created', response.data.invoice);

      return response.data.invoice;

    } catch (error) {
      this.emit('error', { error, context: 'create_smart_invoice' });
      throw error;
    }
  }

  // Recurring Billing Management
  async createRecurringProfile(accountId, profileData) {
    try {
      const profile = {
        ...profileData,
        recurrence_frequency: profileData.frequency || 'monthly',
        start_date: profileData.startDate || new Date().toISOString().split('T')[0],
        payment_terms: profileData.paymentTerms || 'net_30',
        auto_send: profileData.autoSend !== false
      };

      const response = await this.makeRequest(accountId, 'POST', '/recurringinvoices', profile);

      // Store profile locally
      await this.db.query(`
        INSERT INTO zoho_recurring_profiles
        (account_id, profile_id, profile_type, customer_id, frequency, start_date,
         end_date, next_invoice_date, total_amount, currency_code, status, line_items)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      `, [
        accountId, response.data.recurring_invoice.recurring_invoice_id, 'invoice',
        profile.customer_id, profile.recurrence_frequency, profile.start_date,
        profile.end_date || null, response.data.recurring_invoice.next_invoice_date,
        profile.total, profile.currency_code || 'USD', 'active',
        JSON.stringify(profile.line_items)
      ]);

      return response.data.recurring_invoice;

    } catch (error) {
      this.emit('error', { error, context: 'create_recurring_profile' });
      throw error;
    }
  }

  // Advanced Tax Management
  async configureTaxEngine(accountId, taxConfig) {
    try {
      const engine = {
        accountId,
        enabled: true,
        autoCalculate: taxConfig.autoCalculate !== false,
        includeInPrice: taxConfig.includeInPrice || false,
        roundingMethod: taxConfig.roundingMethod || 'standard',
        defaultRate: taxConfig.defaultRate || 0,
        rules: []
      };

      // Add region-specific rules
      if (taxConfig.regions) {
        for (const region of taxConfig.regions) {
          engine.rules.push({
            type: 'region',
            code: region.code,
            rate: region.rate,
            exemptions: region.exemptions || []
          });
        }
      }

      // Add product category rules
      if (taxConfig.productCategories) {
        for (const category of taxConfig.productCategories) {
          engine.rules.push({
            type: 'category',
            name: category.name,
            rate: category.rate,
            hsn_code: category.hsnCode
          });
        }
      }

      this.taxEngines.set(accountId, engine);

      // Save to database
      for (const rule of engine.rules) {
        await this.db.query(`
          INSERT INTO zoho_tax_rules
          (account_id, tax_id, tax_name, tax_percentage, tax_type, region_codes, product_categories)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [
          accountId,
          crypto.randomBytes(16).toString('hex'),
          rule.name || `${rule.type}_tax`,
          rule.rate,
          rule.type,
          JSON.stringify(rule.type === 'region' ? [rule.code] : []),
          JSON.stringify(rule.type === 'category' ? [rule.name] : [])
        ]);
      }

      return { success: true, rulesConfigured: engine.rules.length };

    } catch (error) {
      this.emit('error', { error, context: 'configure_tax_engine' });
      throw error;
    }
  }

  async calculateLineTaxes(accountId, lineItems) {
    const engine = this.taxEngines.get(accountId);
    if (!engine || !engine.autoCalculate) {
      return lineItems;
    }

    return lineItems.map(item => {
      let taxRate = engine.defaultRate;

      // Check product category rules
      const categoryRule = engine.rules.find(r =>
        r.type === 'category' && r.name === item.category
      );

      if (categoryRule) {
        taxRate = categoryRule.rate;
      }

      // Calculate tax
      const taxAmount = item.rate * item.quantity * (taxRate / 100);

      return {
        ...item,
        tax_id: item.tax_id || 'default',
        tax_percentage: taxRate,
        tax_amount: engine.roundingMethod === 'standard'
          ? Math.round(taxAmount * 100) / 100
          : taxAmount,
        item_total: engine.includeInPrice
          ? item.rate * item.quantity
          : item.rate * item.quantity + taxAmount
      };
    });
  }

  // Automation Rules Engine
  async createAutomationRule(accountId, rule) {
    try {
      const automationRule = {
        accountId,
        ruleName: rule.name,
        triggerType: rule.trigger, // invoice_created, payment_received, contact_added
        conditions: rule.conditions || {},
        actions: rule.actions || [],
        enabled: rule.enabled !== false,
        priority: rule.priority || 0
      };

      const result = await this.db.query(`
        INSERT INTO zoho_automation_rules
        (account_id, rule_name, trigger_type, conditions, actions, enabled, priority)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id
      `, [
        accountId, automationRule.ruleName, automationRule.triggerType,
        JSON.stringify(automationRule.conditions), JSON.stringify(automationRule.actions),
        automationRule.enabled, automationRule.priority
      ]);

      automationRule.id = result.rows[0].id;
      this.automationRules.set(`${accountId}_${automationRule.id}`, automationRule);

      return automationRule;

    } catch (error) {
      this.emit('error', { error, context: 'create_automation_rule' });
      throw error;
    }
  }

  async checkAutomationRules(accountId, trigger, data) {
    const rules = Array.from(this.automationRules.values())
      .filter(r => r.accountId === accountId && r.triggerType === trigger && r.enabled)
      .sort((a, b) => b.priority - a.priority);

    for (const rule of rules) {
      if (await this.evaluateConditions(rule.conditions, data)) {
        await this.executeActions(accountId, rule.actions, data);

        // Update execution count
        await this.db.query(`
          UPDATE zoho_automation_rules
          SET last_triggered = CURRENT_TIMESTAMP, execution_count = execution_count + 1
          WHERE id = $1
        `, [rule.id]);
      }
    }
  }

  async evaluateConditions(conditions, data) {
    if (!conditions || Object.keys(conditions).length === 0) {
      return true;
    }

    for (const [field, condition] of Object.entries(conditions)) {
      const value = this.getNestedValue(data, field);

      if (typeof condition === 'object') {
        if (condition.operator === 'equals' && value !== condition.value) return false;
        if (condition.operator === 'contains' && !value?.includes(condition.value)) return false;
        if (condition.operator === 'greater_than' && value <= condition.value) return false;
        if (condition.operator === 'less_than' && value >= condition.value) return false;
        if (condition.operator === 'in' && !condition.value.includes(value)) return false;
      } else {
        if (value !== condition) return false;
      }
    }

    return true;
  }

  async executeActions(accountId, actions, data) {
    for (const action of actions) {
      try {
        switch (action.type) {
          case 'send_email':
            await this.sendAutomatedEmail(accountId, action, data);
            break;
          case 'create_task':
            await this.createTask(accountId, action, data);
            break;
          case 'update_field':
            await this.updateEntityField(accountId, action, data);
            break;
          case 'webhook':
            await this.triggerWebhook(action.url, data);
            break;
          case 'add_tag':
            await this.addTag(accountId, data.entity_type, data.entity_id, action.tag);
            break;
          case 'create_followup':
            await this.createFollowupInvoice(accountId, data);
            break;
          case 'apply_discount':
            await this.applyAutomatedDiscount(accountId, data, action.discount);
            break;
        }
      } catch (error) {
        this.emit('error', { error, action, context: 'execute_automation_action' });
      }
    }
  }

  // Reporting and Analytics
  async generateAdvancedReports(accountId, reportType, parameters = {}) {
    try {
      switch (reportType) {
        case 'cash_flow_forecast':
          return await this.generateCashFlowForecast(accountId, parameters);
        case 'customer_analytics':
          return await this.generateCustomerAnalytics(accountId, parameters);
        case 'profitability_analysis':
          return await this.generateProfitabilityAnalysis(accountId, parameters);
        case 'aging_report':
          return await this.generateAgingReport(accountId, parameters);
        case 'tax_summary':
          return await this.generateTaxSummary(accountId, parameters);
        case 'inventory_valuation':
          return await this.generateInventoryValuation(accountId, parameters);
        case 'project_profitability':
          return await this.generateProjectProfitability(accountId, parameters);
        default:
          throw new Error(`Unknown report type: ${reportType}`);
      }
    } catch (error) {
      this.emit('error', { error, context: 'generate_report' });
      throw error;
    }
  }

  async generateCashFlowForecast(accountId, { days = 90 }) {
    const forecast = {
      period: days,
      currency: 'USD',
      projections: [],
      summary: {
        starting_balance: 0,
        total_inflows: 0,
        total_outflows: 0,
        ending_balance: 0
      }
    };

    // Get current balance
    const bankAccounts = await this.db.query(`
      SELECT data FROM zoho_entities
      WHERE account_id = $1 AND entity_type = 'bankaccount'
    `, [accountId]);

    forecast.summary.starting_balance = bankAccounts.rows.reduce((sum, acc) =>
      sum + (JSON.parse(acc.data).balance || 0), 0
    );

    // Get recurring invoices
    const recurring = await this.db.query(`
      SELECT * FROM zoho_recurring_profiles
      WHERE account_id = $1 AND status = 'active' AND profile_type = 'invoice'
    `, [accountId]);

    // Get outstanding invoices
    const invoices = await this.db.query(`
      SELECT data FROM zoho_entities
      WHERE account_id = $1 AND entity_type = 'invoice'
      AND data->>'status' IN ('sent', 'overdue', 'partially_paid')
    `, [accountId]);

    // Get upcoming bills
    const bills = await this.db.query(`
      SELECT data FROM zoho_entities
      WHERE account_id = $1 AND entity_type = 'bill'
      AND data->>'status' IN ('open', 'overdue')
    `, [accountId]);

    // Calculate daily projections
    for (let day = 1; day <= days; day++) {
      const date = new Date();
      date.setDate(date.getDate() + day);

      const projection = {
        date: date.toISOString().split('T')[0],
        inflows: 0,
        outflows: 0,
        balance: 0
      };

      // Add expected invoice payments
      invoices.rows.forEach(inv => {
        const invoice = JSON.parse(inv.data);
        const dueDate = new Date(invoice.due_date);
        if (dueDate.toDateString() === date.toDateString()) {
          projection.inflows += invoice.balance || 0;
        }
      });

      // Add recurring invoice income
      recurring.rows.forEach(rec => {
        const nextDate = new Date(rec.next_invoice_date);
        if (nextDate.toDateString() === date.toDateString()) {
          projection.inflows += parseFloat(rec.total_amount) || 0;
        }
      });

      // Add bill payments
      bills.rows.forEach(bill => {
        const billData = JSON.parse(bill.data);
        const dueDate = new Date(billData.due_date);
        if (dueDate.toDateString() === date.toDateString()) {
          projection.outflows += billData.balance || 0;
        }
      });

      forecast.summary.total_inflows += projection.inflows;
      forecast.summary.total_outflows += projection.outflows;

      projection.balance = forecast.summary.starting_balance +
                          forecast.summary.total_inflows -
                          forecast.summary.total_outflows;

      forecast.projections.push(projection);
    }

    forecast.summary.ending_balance = forecast.summary.starting_balance +
                                      forecast.summary.total_inflows -
                                      forecast.summary.total_outflows;

    // Add alerts
    forecast.alerts = [];
    if (forecast.summary.ending_balance < 0) {
      forecast.alerts.push({
        type: 'critical',
        message: 'Projected negative cash flow',
        date: forecast.projections.find(p => p.balance < 0)?.date
      });
    }

    return forecast;
  }

  // Multi-Currency Support
  async handleMultiCurrency(accountId, transaction) {
    try {
      if (transaction.currency_code === transaction.base_currency_code) {
        return transaction;
      }

      // Get exchange rate
      const exchangeRate = await this.getExchangeRate(
        transaction.currency_code,
        transaction.base_currency_code,
        transaction.date
      );

      // Convert amounts
      transaction.base_amount = transaction.amount * exchangeRate;
      transaction.exchange_rate = exchangeRate;
      transaction.exchange_gain_loss = this.calculateExchangeGainLoss(transaction);

      return transaction;

    } catch (error) {
      this.emit('error', { error, context: 'multi_currency' });
      throw error;
    }
  }

  // Inventory Management Enhancement
  async syncInventory(accountId) {
    try {
      const response = await this.makeRequest(accountId, 'GET', '/items', {
        per_page: this.config.batchSize
      });

      for (const item of response.data.items) {
        // Enhanced inventory tracking
        const enhanced = {
          ...item,
          reorder_level: await this.calculateReorderLevel(item),
          economic_order_quantity: this.calculateEOQ(item),
          stock_value: item.stock_on_hand * item.rate,
          turnover_ratio: await this.calculateTurnoverRatio(accountId, item)
        };

        await this.db.query(`
          INSERT INTO zoho_entities (account_id, entity_type, entity_id, data)
          VALUES ($1, $2, $3, $4)
          ON CONFLICT (account_id, entity_type, entity_id)
          DO UPDATE SET data = $4, updated_at = CURRENT_TIMESTAMP
        `, [accountId, 'item', item.item_id, JSON.stringify(enhanced)]);

        // Check for low stock
        if (item.stock_on_hand <= enhanced.reorder_level) {
          await this.createLowStockAlert(accountId, item);
        }
      }

      return { success: true, itemsSynced: response.data.items.length };

    } catch (error) {
      this.emit('error', { error, context: 'sync_inventory' });
      throw error;
    }
  }

  // Helper Functions
  async makeRequest(accountId, method, endpoint, data = null) {
    const connection = this.connectedAccounts.get(accountId);
    if (!connection) {
      throw new Error(`No connection found for account ${accountId}`);
    }

    // Check token expiry
    if (new Date() >= connection.tokenExpiry) {
      await this.refreshToken(accountId);
    }

    const organizationId = connection.organizationId;
    const config = {
      method,
      url: `${this.baseUrl}${endpoint}`,
      headers: {
        'Authorization': `Zoho-oauthtoken ${this.decrypt(connection.accessToken)}`,
        'X-com-zoho-books-organizationid': organizationId
      }
    };

    if (method === 'GET' && data) {
      config.params = data;
    } else if (data) {
      config.data = data;
    }

    return await axios(config);
  }

  calculateCreditScore(contact) {
    let score = 700; // Base score

    // Payment history (40%)
    if (contact.outstanding_receivable_amount > 0) {
      score -= Math.min(100, contact.outstanding_receivable_amount / 100);
    }
    if (contact.unused_credits_receivable_amount > 0) {
      score += 20;
    }

    // Credit utilization (30%)
    if (contact.credit_limit && contact.credit_limit > 0) {
      const utilization = contact.outstanding_receivable_amount / contact.credit_limit;
      if (utilization > 0.8) score -= 50;
      else if (utilization > 0.5) score -= 20;
      else if (utilization < 0.3) score += 20;
    }

    // Account age (15%)
    const accountAge = (Date.now() - new Date(contact.created_time)) / (365 * 24 * 60 * 60 * 1000);
    score += Math.min(50, accountAge * 10);

    // Payment terms compliance (15%)
    if (contact.payment_terms_label === 'Due on Receipt') score += 30;
    else if (contact.payment_terms_label === 'Net 15') score += 20;
    else if (contact.payment_terms_label === 'Net 30') score += 10;

    return Math.max(300, Math.min(850, Math.round(score)));
  }

  calculateEOQ(item) {
    // Economic Order Quantity = sqrt((2 * D * S) / H)
    // D = Annual demand, S = Ordering cost, H = Holding cost
    const annualDemand = item.initial_stock || 1000;
    const orderingCost = 50; // Default ordering cost
    const holdingCost = item.rate * 0.25; // 25% of item cost

    return Math.ceil(Math.sqrt((2 * annualDemand * orderingCost) / holdingCost));
  }

  encrypt(text) {
    if (!this.config.encryptionKey) return text;
    const cipher = crypto.createCipher('aes-256-cbc', this.config.encryptionKey);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  decrypt(text) {
    if (!this.config.encryptionKey) return text;
    const decipher = crypto.createDecipher('aes-256-cbc', this.config.encryptionKey);
    let decrypted = decipher.update(text, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  async startSync(accountId, entityType, syncType) {
    const result = await this.db.query(`
      INSERT INTO zoho_sync_history (account_id, entity_type, sync_type, status, started_at)
      VALUES ($1, $2, $3, 'in_progress', CURRENT_TIMESTAMP)
      RETURNING id
    `, [accountId, entityType, syncType]);

    return result.rows[0].id;
  }

  async completeSync(syncId, status, recordsSynced, errors) {
    await this.db.query(`
      UPDATE zoho_sync_history
      SET status = $1, records_synced = $2, errors = $3,
          error_details = $4, completed_at = CURRENT_TIMESTAMP
      WHERE id = $5
    `, [status, recordsSynced, errors.length, JSON.stringify(errors), syncId]);
  }

  async loadConnectedAccounts() {
    const result = await this.db.query('SELECT * FROM zoho_connections');
    for (const row of result.rows) {
      this.connectedAccounts.set(row.account_id, row);
    }
  }

  async loadAutomationRules() {
    const result = await this.db.query('SELECT * FROM zoho_automation_rules WHERE enabled = true');
    for (const row of result.rows) {
      this.automationRules.set(`${row.account_id}_${row.id}`, row);
    }
  }

  async startSyncScheduler() {
    setInterval(async () => {
      for (const [accountId, connection] of this.connectedAccounts) {
        if (connection.features?.autoSync) {
          await this.syncAllEntities(accountId);
        }
      }
    }, this.config.syncInterval);
  }
}

export default ZohoEnhancedConnector;