import { EventEmitter } from 'events';
import axios from 'axios';
import crypto from 'crypto';
import { Pool } from 'pg';

class FreshBooksConnector extends EventEmitter {
  constructor(config = {}) {
    super();
    this.pool = config.db ? new Pool(config.db) : null;
    this.clientId = config.clientId || process.env.FRESHBOOKS_CLIENT_ID;
    this.clientSecret = config.clientSecret || process.env.FRESHBOOKS_CLIENT_SECRET;
    this.redirectUri = config.redirectUri || process.env.FRESHBOOKS_REDIRECT_URI;
    this.accountId = config.accountId || process.env.FRESHBOOKS_ACCOUNT_ID;
    this.baseUrl = 'https://api.freshbooks.com';
    this.accessToken = null;
    this.refreshToken = null;
    this.syncQueue = [];
    this.isProcessing = false;
  }

  // OAuth 2.0 Authentication
  async authenticate(authorizationCode) {
    try {
      const response = await axios.post(`${this.baseUrl}/auth/oauth/token`, {
        grant_type: 'authorization_code',
        code: authorizationCode,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: this.redirectUri
      });

      this.accessToken = response.data.access_token;
      this.refreshToken = response.data.refresh_token;

      // Store tokens securely
      await this.storeTokens(response.data);

      // Get account info
      const accountInfo = await this.getAccountInfo();

      this.emit('authenticated', {
        accountId: accountInfo.id,
        businessName: accountInfo.business_name
      });

      return {
        success: true,
        accountInfo
      };

    } catch (error) {
      this.emit('error', { operation: 'authenticate', error });
      throw error;
    }
  }

  // Refresh Access Token
  async refreshAccessToken() {
    try {
      const response = await axios.post(`${this.baseUrl}/auth/oauth/token`, {
        grant_type: 'refresh_token',
        refresh_token: this.refreshToken,
        client_id: this.clientId,
        client_secret: this.clientSecret
      });

      this.accessToken = response.data.access_token;

      if (response.data.refresh_token) {
        this.refreshToken = response.data.refresh_token;
      }

      await this.storeTokens(response.data);

      return { success: true };

    } catch (error) {
      this.emit('error', { operation: 'refreshAccessToken', error });
      throw error;
    }
  }

  // API Request Wrapper
  async makeApiRequest(method, endpoint, data = null) {
    try {
      // Ensure we have a valid token
      if (!this.accessToken) {
        await this.refreshAccessToken();
      }

      const config = {
        method,
        url: `${this.baseUrl}/accounting/account/${this.accountId}${endpoint}`,
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Api-Version': 'alpha',
          'Content-Type': 'application/json'
        }
      };

      if (data) {
        config.data = data;
      }

      const response = await axios(config);
      return response.data;

    } catch (error) {
      // Handle token expiration
      if (error.response?.status === 401) {
        await this.refreshAccessToken();
        return this.makeApiRequest(method, endpoint, data);
      }

      throw error;
    }
  }

  // Client Management
  async syncClients() {
    try {
      const startTime = Date.now();
      this.emit('sync_started', { type: 'clients' });

      // Fetch all clients from FreshBooks
      const response = await this.makeApiRequest('GET', '/users/clients');
      const freshBooksClients = response.response?.result?.clients || [];

      // Get existing mappings
      const client = await this.pool.connect();

      try {
        await client.query('BEGIN');

        const syncResults = {
          created: 0,
          updated: 0,
          errors: 0
        };

        for (const fbClient of freshBooksClients) {
          try {
            // Check if client already exists
            const existing = await client.query(
              'SELECT * FROM freshbooks_client_mappings WHERE freshbooks_id = $1',
              [fbClient.id]
            );

            if (existing.rows.length === 0) {
              // Create new client
              const userId = await this.createUserFromClient(client, fbClient);

              // Store mapping
              await client.query(`
                INSERT INTO freshbooks_client_mappings
                (freshbooks_id, user_id, client_data, last_synced)
                VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
              `, [fbClient.id, userId, JSON.stringify(fbClient)]);

              syncResults.created++;
            } else {
              // Update existing client
              await this.updateUserFromClient(
                client,
                existing.rows[0].user_id,
                fbClient
              );

              await client.query(`
                UPDATE freshbooks_client_mappings
                SET client_data = $1, last_synced = CURRENT_TIMESTAMP
                WHERE freshbooks_id = $2
              `, [JSON.stringify(fbClient), fbClient.id]);

              syncResults.updated++;
            }

          } catch (error) {
            console.error(`Error syncing client ${fbClient.id}:`, error);
            syncResults.errors++;
          }
        }

        await client.query('COMMIT');

        const executionTime = Date.now() - startTime;

        this.emit('sync_completed', {
          type: 'clients',
          results: syncResults,
          executionTime
        });

        return {
          success: true,
          ...syncResults,
          executionTime
        };

      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }

    } catch (error) {
      this.emit('error', { operation: 'syncClients', error });
      throw error;
    }
  }

  // Invoice Management
  async syncInvoices(fromDate = null) {
    try {
      const startTime = Date.now();
      this.emit('sync_started', { type: 'invoices' });

      // Build query parameters
      const params = {
        include: ['lines', 'payments']
      };

      if (fromDate) {
        params.search = {
          date_min: fromDate.toISOString().split('T')[0]
        };
      }

      // Fetch invoices from FreshBooks
      const response = await this.makeApiRequest('GET', '/invoices/invoices', params);
      const invoices = response.response?.result?.invoices || [];

      const client = await this.pool.connect();

      try {
        await client.query('BEGIN');

        const syncResults = {
          created: 0,
          updated: 0,
          errors: 0,
          totalAmount: 0
        };

        for (const invoice of invoices) {
          try {
            // Process invoice
            const processedInvoice = await this.processInvoice(client, invoice);

            if (processedInvoice.isNew) {
              syncResults.created++;
            } else {
              syncResults.updated++;
            }

            syncResults.totalAmount += parseFloat(invoice.amount.amount);

            // Process invoice lines
            await this.processInvoiceLines(client, invoice.id, invoice.lines);

            // Process payments if any
            if (invoice.payments && invoice.payments.length > 0) {
              await this.processInvoicePayments(client, invoice.id, invoice.payments);
            }

          } catch (error) {
            console.error(`Error syncing invoice ${invoice.id}:`, error);
            syncResults.errors++;
          }
        }

        await client.query('COMMIT');

        const executionTime = Date.now() - startTime;

        this.emit('sync_completed', {
          type: 'invoices',
          results: syncResults,
          executionTime
        });

        return {
          success: true,
          ...syncResults,
          executionTime
        };

      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }

    } catch (error) {
      this.emit('error', { operation: 'syncInvoices', error });
      throw error;
    }
  }

  // Expense Tracking
  async syncExpenses(fromDate = null) {
    try {
      const startTime = Date.now();
      this.emit('sync_started', { type: 'expenses' });

      // Build query parameters
      const params = {};
      if (fromDate) {
        params.search = {
          date_min: fromDate.toISOString().split('T')[0]
        };
      }

      // Fetch expenses from FreshBooks
      const response = await this.makeApiRequest('GET', '/expenses/expenses', params);
      const expenses = response.response?.result?.expenses || [];

      const client = await this.pool.connect();

      try {
        await client.query('BEGIN');

        const syncResults = {
          created: 0,
          updated: 0,
          errors: 0,
          totalAmount: 0
        };

        for (const expense of expenses) {
          try {
            // Check if expense exists
            const existing = await client.query(
              'SELECT * FROM freshbooks_expenses WHERE freshbooks_expense_id = $1',
              [expense.id]
            );

            const expenseData = {
              vendor: expense.vendor,
              category: expense.category?.category || 'Other',
              amount: parseFloat(expense.amount.amount),
              currency: expense.amount.code,
              date: expense.date,
              notes: expense.notes,
              receipt_url: expense.attachment?.media_url || null,
              tax_amount: parseFloat(expense.tax_amount?.amount || 0)
            };

            if (existing.rows.length === 0) {
              // Create new expense
              await client.query(`
                INSERT INTO freshbooks_expenses
                (freshbooks_expense_id, vendor, category, amount, currency,
                 expense_date, notes, receipt_url, tax_amount, created_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP)
              `, [
                expense.id,
                expenseData.vendor,
                expenseData.category,
                expenseData.amount,
                expenseData.currency,
                expenseData.date,
                expenseData.notes,
                expenseData.receipt_url,
                expenseData.tax_amount
              ]);

              syncResults.created++;
            } else {
              // Update existing expense
              await client.query(`
                UPDATE freshbooks_expenses
                SET vendor = $2, category = $3, amount = $4, currency = $5,
                    expense_date = $6, notes = $7, receipt_url = $8,
                    tax_amount = $9, updated_at = CURRENT_TIMESTAMP
                WHERE freshbooks_expense_id = $1
              `, [
                expense.id,
                expenseData.vendor,
                expenseData.category,
                expenseData.amount,
                expenseData.currency,
                expenseData.date,
                expenseData.notes,
                expenseData.receipt_url,
                expenseData.tax_amount
              ]);

              syncResults.updated++;
            }

            syncResults.totalAmount += expenseData.amount;

          } catch (error) {
            console.error(`Error syncing expense ${expense.id}:`, error);
            syncResults.errors++;
          }
        }

        await client.query('COMMIT');

        const executionTime = Date.now() - startTime;

        this.emit('sync_completed', {
          type: 'expenses',
          results: syncResults,
          executionTime
        });

        return {
          success: true,
          ...syncResults,
          executionTime
        };

      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }

    } catch (error) {
      this.emit('error', { operation: 'syncExpenses', error });
      throw error;
    }
  }

  // Time Tracking
  async syncTimeEntries(fromDate = null) {
    try {
      const startTime = Date.now();
      this.emit('sync_started', { type: 'time_entries' });

      // Build query parameters
      const params = {};
      if (fromDate) {
        params.search = {
          date_min: fromDate.toISOString().split('T')[0]
        };
      }

      // Fetch time entries from FreshBooks
      const response = await this.makeApiRequest('GET', '/timetracking/time_entries', params);
      const timeEntries = response.response?.result?.time_entries || [];

      const client = await this.pool.connect();

      try {
        await client.query('BEGIN');

        const syncResults = {
          created: 0,
          updated: 0,
          errors: 0,
          totalHours: 0
        };

        for (const entry of timeEntries) {
          try {
            const entryData = {
              client_id: entry.client_id,
              project_id: entry.project_id,
              duration: entry.duration,
              started_at: entry.started_at,
              note: entry.note,
              billable: entry.billable,
              billed: entry.billed
            };

            // Store time entry
            await client.query(`
              INSERT INTO freshbooks_time_entries
              (freshbooks_entry_id, client_id, project_id, duration,
               started_at, note, billable, billed, created_at)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
              ON CONFLICT (freshbooks_entry_id)
              DO UPDATE SET
                duration = EXCLUDED.duration,
                note = EXCLUDED.note,
                billed = EXCLUDED.billed,
                updated_at = CURRENT_TIMESTAMP
            `, [
              entry.id,
              entryData.client_id,
              entryData.project_id,
              entryData.duration,
              entryData.started_at,
              entryData.note,
              entryData.billable,
              entryData.billed
            ]);

            syncResults.totalHours += entryData.duration / 3600; // Convert seconds to hours

            if (entry.id) {
              syncResults.created++;
            } else {
              syncResults.updated++;
            }

          } catch (error) {
            console.error(`Error syncing time entry ${entry.id}:`, error);
            syncResults.errors++;
          }
        }

        await client.query('COMMIT');

        const executionTime = Date.now() - startTime;

        this.emit('sync_completed', {
          type: 'time_entries',
          results: syncResults,
          executionTime
        });

        return {
          success: true,
          ...syncResults,
          executionTime
        };

      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }

    } catch (error) {
      this.emit('error', { operation: 'syncTimeEntries', error });
      throw error;
    }
  }

  // Payment Processing
  async createPayment(invoiceId, paymentData) {
    try {
      const payment = {
        payment: {
          invoiceid: invoiceId,
          amount: {
            amount: paymentData.amount.toString(),
            code: paymentData.currency || 'USD'
          },
          date: paymentData.date || new Date().toISOString().split('T')[0],
          type: paymentData.type || 'Credit Card',
          note: paymentData.note || 'Payment via Monay platform'
        }
      };

      const response = await this.makeApiRequest('POST', '/payments/payments', payment);

      // Store payment record
      const client = await this.pool.connect();

      try {
        await client.query(`
          INSERT INTO freshbooks_payments
          (freshbooks_payment_id, invoice_id, amount, currency,
           payment_date, payment_type, note, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
        `, [
          response.response.result.payment.id,
          invoiceId,
          paymentData.amount,
          paymentData.currency || 'USD',
          paymentData.date,
          paymentData.type,
          paymentData.note
        ]);

        this.emit('payment_created', {
          paymentId: response.response.result.payment.id,
          invoiceId,
          amount: paymentData.amount
        });

        return {
          success: true,
          paymentId: response.response.result.payment.id
        };

      } finally {
        client.release();
      }

    } catch (error) {
      this.emit('error', { operation: 'createPayment', error });
      throw error;
    }
  }

  // Project Management
  async syncProjects() {
    try {
      const startTime = Date.now();
      this.emit('sync_started', { type: 'projects' });

      // Fetch projects from FreshBooks
      const response = await this.makeApiRequest('GET', '/projects/projects');
      const projects = response.response?.result?.projects || [];

      const client = await this.pool.connect();

      try {
        await client.query('BEGIN');

        const syncResults = {
          created: 0,
          updated: 0,
          errors: 0
        };

        for (const project of projects) {
          try {
            const projectData = {
              title: project.title,
              client_id: project.client_id,
              project_type: project.project_type,
              active: project.active,
              budget: parseFloat(project.budget?.amount || 0),
              currency: project.budget?.code || 'USD',
              hourly_rate: parseFloat(project.rate?.amount || 0),
              fixed_price: project.fixed_price,
              due_date: project.due_date,
              description: project.description
            };

            // Store project
            await client.query(`
              INSERT INTO freshbooks_projects
              (freshbooks_project_id, title, client_id, project_type,
               active, budget, currency, hourly_rate, fixed_price,
               due_date, description, created_at)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP)
              ON CONFLICT (freshbooks_project_id)
              DO UPDATE SET
                title = EXCLUDED.title,
                active = EXCLUDED.active,
                budget = EXCLUDED.budget,
                due_date = EXCLUDED.due_date,
                updated_at = CURRENT_TIMESTAMP
            `, [
              project.id,
              projectData.title,
              projectData.client_id,
              projectData.project_type,
              projectData.active,
              projectData.budget,
              projectData.currency,
              projectData.hourly_rate,
              projectData.fixed_price,
              projectData.due_date,
              projectData.description
            ]);

            if (project.id) {
              syncResults.created++;
            } else {
              syncResults.updated++;
            }

          } catch (error) {
            console.error(`Error syncing project ${project.id}:`, error);
            syncResults.errors++;
          }
        }

        await client.query('COMMIT');

        const executionTime = Date.now() - startTime;

        this.emit('sync_completed', {
          type: 'projects',
          results: syncResults,
          executionTime
        });

        return {
          success: true,
          ...syncResults,
          executionTime
        };

      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }

    } catch (error) {
      this.emit('error', { operation: 'syncProjects', error });
      throw error;
    }
  }

  // Reporting
  async generateFinancialReport(startDate, endDate) {
    try {
      const client = await this.pool.connect();

      try {
        // Get revenue data
        const revenueResult = await client.query(`
          SELECT
            SUM(amount) as total_revenue,
            COUNT(*) as invoice_count,
            AVG(amount) as avg_invoice_amount
          FROM freshbooks_invoices
          WHERE invoice_date BETWEEN $1 AND $2
          AND status IN ('paid', 'partial')
        `, [startDate, endDate]);

        // Get expense data
        const expenseResult = await client.query(`
          SELECT
            SUM(amount) as total_expenses,
            COUNT(*) as expense_count,
            category,
            SUM(amount) as category_total
          FROM freshbooks_expenses
          WHERE expense_date BETWEEN $1 AND $2
          GROUP BY category
        `, [startDate, endDate]);

        // Get payment data
        const paymentResult = await client.query(`
          SELECT
            SUM(amount) as total_collected,
            COUNT(*) as payment_count,
            payment_type,
            COUNT(*) as type_count
          FROM freshbooks_payments
          WHERE payment_date BETWEEN $1 AND $2
          GROUP BY payment_type
        `, [startDate, endDate]);

        // Get time tracking data
        const timeResult = await client.query(`
          SELECT
            SUM(duration) / 3600 as total_hours,
            COUNT(DISTINCT client_id) as unique_clients,
            COUNT(DISTINCT project_id) as unique_projects
          FROM freshbooks_time_entries
          WHERE DATE(started_at) BETWEEN $1 AND $2
        `, [startDate, endDate]);

        const report = {
          period: {
            start: startDate,
            end: endDate
          },
          revenue: {
            total: parseFloat(revenueResult.rows[0].total_revenue || 0),
            invoiceCount: parseInt(revenueResult.rows[0].invoice_count || 0),
            averageInvoice: parseFloat(revenueResult.rows[0].avg_invoice_amount || 0)
          },
          expenses: {
            total: expenseResult.rows.reduce((sum, row) => sum + parseFloat(row.category_total || 0), 0),
            count: expenseResult.rows.reduce((sum, row) => sum + parseInt(row.expense_count || 0), 0),
            byCategory: expenseResult.rows.map(row => ({
              category: row.category,
              amount: parseFloat(row.category_total || 0)
            }))
          },
          payments: {
            total: parseFloat(paymentResult.rows[0]?.total_collected || 0),
            count: parseInt(paymentResult.rows[0]?.payment_count || 0),
            byType: paymentResult.rows.map(row => ({
              type: row.payment_type,
              count: parseInt(row.type_count || 0)
            }))
          },
          timeTracking: {
            totalHours: parseFloat(timeResult.rows[0].total_hours || 0),
            uniqueClients: parseInt(timeResult.rows[0].unique_clients || 0),
            uniqueProjects: parseInt(timeResult.rows[0].unique_projects || 0)
          },
          profitLoss: {
            grossProfit: parseFloat(revenueResult.rows[0].total_revenue || 0) -
                        expenseResult.rows.reduce((sum, row) => sum + parseFloat(row.category_total || 0), 0)
          }
        };

        report.profitLoss.profitMargin = report.revenue.total > 0
          ? (report.profitLoss.grossProfit / report.revenue.total * 100).toFixed(2)
          : 0;

        return {
          success: true,
          report
        };

      } finally {
        client.release();
      }

    } catch (error) {
      this.emit('error', { operation: 'generateFinancialReport', error });
      throw error;
    }
  }

  // Webhook Processing
  async processWebhook(event) {
    try {
      const { type, data } = event;

      switch (type) {
        case 'invoice.created':
          await this.handleInvoiceCreated(data);
          break;
        case 'invoice.updated':
          await this.handleInvoiceUpdated(data);
          break;
        case 'payment.created':
          await this.handlePaymentCreated(data);
          break;
        case 'client.created':
          await this.handleClientCreated(data);
          break;
        case 'expense.created':
          await this.handleExpenseCreated(data);
          break;
        default:
          console.log(`Unhandled webhook event type: ${type}`);
      }

      return { success: true };

    } catch (error) {
      this.emit('error', { operation: 'processWebhook', error });
      throw error;
    }
  }

  // Helper Methods
  async createUserFromClient(dbClient, fbClient) {
    const result = await dbClient.query(`
      INSERT INTO users (email, name, company, phone, created_at)
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
      RETURNING id
    `, [
      fbClient.email,
      `${fbClient.fname} ${fbClient.lname}`.trim(),
      fbClient.organization,
      fbClient.phone
    ]);

    return result.rows[0].id;
  }

  async updateUserFromClient(dbClient, userId, fbClient) {
    await dbClient.query(`
      UPDATE users
      SET name = $2, company = $3, phone = $4, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `, [
      userId,
      `${fbClient.fname} ${fbClient.lname}`.trim(),
      fbClient.organization,
      fbClient.phone
    ]);
  }

  async processInvoice(dbClient, invoice) {
    const existing = await dbClient.query(
      'SELECT * FROM freshbooks_invoices WHERE freshbooks_invoice_id = $1',
      [invoice.id]
    );

    const invoiceData = {
      invoice_number: invoice.invoice_number,
      client_id: invoice.client_id,
      amount: parseFloat(invoice.amount.amount),
      currency: invoice.amount.code,
      status: invoice.status,
      due_date: invoice.due_date,
      invoice_date: invoice.date_created,
      notes: invoice.notes
    };

    if (existing.rows.length === 0) {
      await dbClient.query(`
        INSERT INTO freshbooks_invoices
        (freshbooks_invoice_id, invoice_number, client_id, amount,
         currency, status, due_date, invoice_date, notes, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP)
      `, [
        invoice.id,
        invoiceData.invoice_number,
        invoiceData.client_id,
        invoiceData.amount,
        invoiceData.currency,
        invoiceData.status,
        invoiceData.due_date,
        invoiceData.invoice_date,
        invoiceData.notes
      ]);

      return { isNew: true };
    } else {
      await dbClient.query(`
        UPDATE freshbooks_invoices
        SET amount = $2, status = $3, updated_at = CURRENT_TIMESTAMP
        WHERE freshbooks_invoice_id = $1
      `, [invoice.id, invoiceData.amount, invoiceData.status]);

      return { isNew: false };
    }
  }

  async processInvoiceLines(dbClient, invoiceId, lines) {
    if (!lines || lines.length === 0) return;

    // Delete existing lines
    await dbClient.query(
      'DELETE FROM freshbooks_invoice_lines WHERE invoice_id = $1',
      [invoiceId]
    );

    // Insert new lines
    for (const line of lines) {
      await dbClient.query(`
        INSERT INTO freshbooks_invoice_lines
        (invoice_id, description, quantity, rate, amount, tax_percent)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [
        invoiceId,
        line.description,
        line.qty,
        parseFloat(line.rate.amount),
        parseFloat(line.amount.amount),
        parseFloat(line.tax_percent || 0)
      ]);
    }
  }

  async processInvoicePayments(dbClient, invoiceId, payments) {
    for (const payment of payments) {
      await dbClient.query(`
        INSERT INTO freshbooks_payments
        (freshbooks_payment_id, invoice_id, amount, currency,
         payment_date, payment_type, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
        ON CONFLICT (freshbooks_payment_id) DO NOTHING
      `, [
        payment.id,
        invoiceId,
        parseFloat(payment.amount.amount),
        payment.amount.code,
        payment.date,
        payment.type
      ]);
    }
  }

  async getAccountInfo() {
    const response = await this.makeApiRequest('GET', '/users/me');
    return response.response?.result;
  }

  async storeTokens(tokenData) {
    const client = await this.pool.connect();

    try {
      await client.query(`
        INSERT INTO freshbooks_tokens
        (account_id, access_token, refresh_token, expires_at)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (account_id)
        DO UPDATE SET
          access_token = EXCLUDED.access_token,
          refresh_token = EXCLUDED.refresh_token,
          expires_at = EXCLUDED.expires_at,
          updated_at = CURRENT_TIMESTAMP
      `, [
        this.accountId,
        this.encrypt(tokenData.access_token),
        this.encrypt(tokenData.refresh_token),
        new Date(Date.now() + tokenData.expires_in * 1000)
      ]);

    } finally {
      client.release();
    }
  }

  encrypt(text) {
    const algorithm = 'aes-256-gcm';
    const key = Buffer.from(process.env.ENCRYPTION_KEY || 'defaultkey123456789012345678901', 'utf8');
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
  }

  decrypt(encryptedData) {
    const algorithm = 'aes-256-gcm';
    const key = Buffer.from(process.env.ENCRYPTION_KEY || 'defaultkey123456789012345678901', 'utf8');

    const parts = encryptedData.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];

    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  // Webhook handlers
  async handleInvoiceCreated(data) {
    // Process new invoice
    const client = await this.pool.connect();
    try {
      await this.processInvoice(client, data.invoice);
    } finally {
      client.release();
    }
  }

  async handleInvoiceUpdated(data) {
    // Update existing invoice
    const client = await this.pool.connect();
    try {
      await this.processInvoice(client, data.invoice);
    } finally {
      client.release();
    }
  }

  async handlePaymentCreated(data) {
    // Process new payment
    const client = await this.pool.connect();
    try {
      await this.processInvoicePayments(client, data.payment.invoiceid, [data.payment]);
    } finally {
      client.release();
    }
  }

  async handleClientCreated(data) {
    // Process new client
    const client = await this.pool.connect();
    try {
      const userId = await this.createUserFromClient(client, data.client);
      await client.query(`
        INSERT INTO freshbooks_client_mappings
        (freshbooks_id, user_id, client_data, last_synced)
        VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
      `, [data.client.id, userId, JSON.stringify(data.client)]);
    } finally {
      client.release();
    }
  }

  async handleExpenseCreated(data) {
    // Process new expense
    const client = await this.pool.connect();
    try {
      await client.query(`
        INSERT INTO freshbooks_expenses
        (freshbooks_expense_id, vendor, category, amount, currency,
         expense_date, notes, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
      `, [
        data.expense.id,
        data.expense.vendor,
        data.expense.category?.category || 'Other',
        parseFloat(data.expense.amount.amount),
        data.expense.amount.code,
        data.expense.date,
        data.expense.notes
      ]);
    } finally {
      client.release();
    }
  }

  // Cleanup
  async cleanup() {
    await this.pool.end();
  }
}

export default FreshBooksConnector;