const { EventEmitter } = require('events');
const axios = require('axios');
const crypto = require('crypto');
const { Pool } = require('pg');

class WaveAccountingConnector extends EventEmitter {
  constructor(config) {
    super();
    this.pool = new Pool(config.db);
    this.apiKey = config.apiKey;
    this.businessId = config.businessId;
    this.baseUrl = 'https://gql.waveapps.com/graphql/public';
    this.syncInterval = null;
    this.lastSyncTime = null;
  }

  // GraphQL Query Executor
  async executeQuery(query, variables = {}) {
    try {
      const response = await axios.post(
        this.baseUrl,
        {
          query,
          variables
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.errors) {
        throw new Error(response.data.errors[0].message);
      }

      return response.data.data;

    } catch (error) {
      this.emit('error', { operation: 'executeQuery', error });
      throw error;
    }
  }

  // Business Information
  async getBusinessInfo() {
    try {
      const query = `
        query GetBusiness($businessId: ID!) {
          business(id: $businessId) {
            id
            name
            currency {
              code
              symbol
            }
            address {
              addressLine1
              addressLine2
              city
              province {
                code
                name
              }
              country {
                code
                name
              }
              postalCode
            }
            phone
            fax
            mobile
            website
            isPersonal
          }
        }
      `;

      const data = await this.executeQuery(query, { businessId: this.businessId });

      this.emit('business_info_fetched', data.business);

      return {
        success: true,
        business: data.business
      };

    } catch (error) {
      this.emit('error', { operation: 'getBusinessInfo', error });
      throw error;
    }
  }

  // Customer Management
  async syncCustomers() {
    try {
      const startTime = Date.now();
      this.emit('sync_started', { type: 'customers' });

      const query = `
        query GetCustomers($businessId: ID!, $page: Int!, $pageSize: Int!) {
          business(id: $businessId) {
            customers(page: $page, pageSize: $pageSize) {
              pageInfo {
                currentPage
                totalPages
                totalCount
              }
              edges {
                node {
                  id
                  name
                  email
                  address {
                    addressLine1
                    addressLine2
                    city
                    province {
                      code
                    }
                    country {
                      code
                    }
                    postalCode
                  }
                  currency {
                    code
                  }
                  isArchived
                  createdAt
                  modifiedAt
                }
              }
            }
          }
        }
      `;

      let page = 1;
      const pageSize = 100;
      let hasMore = true;
      const allCustomers = [];

      // Fetch all pages
      while (hasMore) {
        const data = await this.executeQuery(query, {
          businessId: this.businessId,
          page,
          pageSize
        });

        const customers = data.business.customers;
        allCustomers.push(...customers.edges.map(e => e.node));

        hasMore = page < customers.pageInfo.totalPages;
        page++;
      }

      // Sync to database
      const client = await this.pool.connect();

      try {
        await client.query('BEGIN');

        const syncResults = {
          created: 0,
          updated: 0,
          errors: 0
        };

        for (const customer of allCustomers) {
          try {
            // Check if customer exists
            const existing = await client.query(
              'SELECT * FROM wave_customer_mappings WHERE wave_id = $1',
              [customer.id]
            );

            if (existing.rows.length === 0) {
              // Create new user
              const userId = await this.createUserFromCustomer(client, customer);

              // Store mapping
              await client.query(`
                INSERT INTO wave_customer_mappings
                (wave_id, user_id, customer_data, last_synced)
                VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
              `, [customer.id, userId, JSON.stringify(customer)]);

              syncResults.created++;
            } else {
              // Update existing user
              await this.updateUserFromCustomer(
                client,
                existing.rows[0].user_id,
                customer
              );

              await client.query(`
                UPDATE wave_customer_mappings
                SET customer_data = $1, last_synced = CURRENT_TIMESTAMP
                WHERE wave_id = $2
              `, [JSON.stringify(customer), customer.id]);

              syncResults.updated++;
            }

          } catch (error) {
            console.error(`Error syncing customer ${customer.id}:`, error);
            syncResults.errors++;
          }
        }

        await client.query('COMMIT');

        const executionTime = Date.now() - startTime;

        this.emit('sync_completed', {
          type: 'customers',
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
      this.emit('error', { operation: 'syncCustomers', error });
      throw error;
    }
  }

  // Invoice Management
  async syncInvoices(fromDate = null) {
    try {
      const startTime = Date.now();
      this.emit('sync_started', { type: 'invoices' });

      const query = `
        query GetInvoices($businessId: ID!, $page: Int!, $pageSize: Int!, $filter: InvoiceFilterInput) {
          business(id: $businessId) {
            invoices(page: $page, pageSize: $pageSize, filter: $filter) {
              pageInfo {
                currentPage
                totalPages
                totalCount
              }
              edges {
                node {
                  id
                  createdAt
                  modifiedAt
                  invoiceNumber
                  invoiceDate
                  dueDate
                  customer {
                    id
                    name
                  }
                  items {
                    product {
                      id
                      name
                    }
                    description
                    quantity
                    price
                    subtotal {
                      value
                      currency {
                        code
                      }
                    }
                    total {
                      value
                      currency {
                        code
                      }
                    }
                    taxes {
                      amount {
                        value
                      }
                      salesTax {
                        id
                        name
                        rate
                      }
                    }
                  }
                  lastSentAt
                  lastViewedAt
                  status
                  total {
                    value
                    currency {
                      code
                    }
                  }
                  amountDue {
                    value
                    currency {
                      code
                    }
                  }
                  amountPaid {
                    value
                    currency {
                      code
                    }
                  }
                }
              }
            }
          }
        }
      `;

      const filter = {};
      if (fromDate) {
        filter.createdAtAfter = fromDate.toISOString();
      }

      let page = 1;
      const pageSize = 50;
      let hasMore = true;
      const allInvoices = [];

      // Fetch all pages
      while (hasMore) {
        const data = await this.executeQuery(query, {
          businessId: this.businessId,
          page,
          pageSize,
          filter
        });

        const invoices = data.business.invoices;
        allInvoices.push(...invoices.edges.map(e => e.node));

        hasMore = page < invoices.pageInfo.totalPages;
        page++;
      }

      // Sync to database
      const client = await this.pool.connect();

      try {
        await client.query('BEGIN');

        const syncResults = {
          created: 0,
          updated: 0,
          errors: 0,
          totalAmount: 0
        };

        for (const invoice of allInvoices) {
          try {
            const processedInvoice = await this.processInvoice(client, invoice);

            if (processedInvoice.isNew) {
              syncResults.created++;
            } else {
              syncResults.updated++;
            }

            syncResults.totalAmount += parseFloat(invoice.total.value);

            // Process invoice items
            await this.processInvoiceItems(client, invoice.id, invoice.items);

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

  // Product Management
  async syncProducts() {
    try {
      const startTime = Date.now();
      this.emit('sync_started', { type: 'products' });

      const query = `
        query GetProducts($businessId: ID!, $page: Int!, $pageSize: Int!) {
          business(id: $businessId) {
            products(page: $page, pageSize: $pageSize) {
              pageInfo {
                currentPage
                totalPages
                totalCount
              }
              edges {
                node {
                  id
                  name
                  description
                  unitPrice
                  isSold
                  isBought
                  isArchived
                  createdAt
                  modifiedAt
                  defaultSalesTaxes {
                    id
                    name
                    rate
                  }
                }
              }
            }
          }
        }
      `;

      let page = 1;
      const pageSize = 100;
      let hasMore = true;
      const allProducts = [];

      // Fetch all pages
      while (hasMore) {
        const data = await this.executeQuery(query, {
          businessId: this.businessId,
          page,
          pageSize
        });

        const products = data.business.products;
        allProducts.push(...products.edges.map(e => e.node));

        hasMore = page < products.pageInfo.totalPages;
        page++;
      }

      // Sync to database
      const client = await this.pool.connect();

      try {
        await client.query('BEGIN');

        const syncResults = {
          created: 0,
          updated: 0,
          errors: 0
        };

        for (const product of allProducts) {
          try {
            // Check if product exists
            const existing = await client.query(
              'SELECT * FROM wave_products WHERE wave_product_id = $1',
              [product.id]
            );

            const productData = {
              name: product.name,
              description: product.description,
              unit_price: parseFloat(product.unitPrice || 0),
              is_sold: product.isSold,
              is_bought: product.isBought,
              is_archived: product.isArchived,
              tax_rate: product.defaultSalesTaxes?.[0]?.rate || 0
            };

            if (existing.rows.length === 0) {
              // Create new product
              await client.query(`
                INSERT INTO wave_products
                (wave_product_id, name, description, unit_price,
                 is_sold, is_bought, is_archived, tax_rate, created_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
              `, [
                product.id,
                productData.name,
                productData.description,
                productData.unit_price,
                productData.is_sold,
                productData.is_bought,
                productData.is_archived,
                productData.tax_rate
              ]);

              syncResults.created++;
            } else {
              // Update existing product
              await client.query(`
                UPDATE wave_products
                SET name = $2, description = $3, unit_price = $4,
                    is_sold = $5, is_bought = $6, is_archived = $7,
                    tax_rate = $8, updated_at = CURRENT_TIMESTAMP
                WHERE wave_product_id = $1
              `, [
                product.id,
                productData.name,
                productData.description,
                productData.unit_price,
                productData.is_sold,
                productData.is_bought,
                productData.is_archived,
                productData.tax_rate
              ]);

              syncResults.updated++;
            }

          } catch (error) {
            console.error(`Error syncing product ${product.id}:`, error);
            syncResults.errors++;
          }
        }

        await client.query('COMMIT');

        const executionTime = Date.now() - startTime;

        this.emit('sync_completed', {
          type: 'products',
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
      this.emit('error', { operation: 'syncProducts', error });
      throw error;
    }
  }

  // Transaction Management
  async syncTransactions(accountId, fromDate = null) {
    try {
      const startTime = Date.now();
      this.emit('sync_started', { type: 'transactions' });

      const query = `
        query GetTransactions($businessId: ID!, $accountId: ID!, $page: Int!, $pageSize: Int!, $filter: TransactionFilterInput) {
          business(id: $businessId) {
            account(id: $accountId) {
              transactions(page: $page, pageSize: $pageSize, filter: $filter) {
                pageInfo {
                  currentPage
                  totalPages
                  totalCount
                }
                edges {
                  node {
                    id
                    date
                    description
                    notes
                    source
                    amount {
                      value
                      currency {
                        code
                      }
                    }
                    total {
                      value
                      currency {
                        code
                      }
                    }
                    createdAt
                    modifiedAt
                  }
                }
              }
            }
          }
        }
      `;

      const filter = {};
      if (fromDate) {
        filter.dateAfter = fromDate.toISOString().split('T')[0];
      }

      let page = 1;
      const pageSize = 100;
      let hasMore = true;
      const allTransactions = [];

      // Fetch all pages
      while (hasMore) {
        const data = await this.executeQuery(query, {
          businessId: this.businessId,
          accountId,
          page,
          pageSize,
          filter
        });

        const transactions = data.business.account.transactions;
        allTransactions.push(...transactions.edges.map(e => e.node));

        hasMore = page < transactions.pageInfo.totalPages;
        page++;
      }

      // Sync to database
      const client = await this.pool.connect();

      try {
        await client.query('BEGIN');

        const syncResults = {
          created: 0,
          updated: 0,
          errors: 0,
          totalAmount: 0
        };

        for (const transaction of allTransactions) {
          try {
            // Check if transaction exists
            const existing = await client.query(
              'SELECT * FROM wave_transactions WHERE wave_transaction_id = $1',
              [transaction.id]
            );

            const transactionData = {
              account_id: accountId,
              date: transaction.date,
              description: transaction.description,
              notes: transaction.notes,
              source: transaction.source,
              amount: parseFloat(transaction.amount.value),
              currency: transaction.amount.currency.code,
              total: parseFloat(transaction.total.value)
            };

            if (existing.rows.length === 0) {
              // Create new transaction
              await client.query(`
                INSERT INTO wave_transactions
                (wave_transaction_id, account_id, transaction_date,
                 description, notes, source, amount, currency, total, created_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP)
              `, [
                transaction.id,
                transactionData.account_id,
                transactionData.date,
                transactionData.description,
                transactionData.notes,
                transactionData.source,
                transactionData.amount,
                transactionData.currency,
                transactionData.total
              ]);

              syncResults.created++;
            } else {
              // Update existing transaction
              await client.query(`
                UPDATE wave_transactions
                SET description = $2, notes = $3, amount = $4,
                    total = $5, updated_at = CURRENT_TIMESTAMP
                WHERE wave_transaction_id = $1
              `, [
                transaction.id,
                transactionData.description,
                transactionData.notes,
                transactionData.amount,
                transactionData.total
              ]);

              syncResults.updated++;
            }

            syncResults.totalAmount += Math.abs(transactionData.amount);

          } catch (error) {
            console.error(`Error syncing transaction ${transaction.id}:`, error);
            syncResults.errors++;
          }
        }

        await client.query('COMMIT');

        const executionTime = Date.now() - startTime;

        this.emit('sync_completed', {
          type: 'transactions',
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
      this.emit('error', { operation: 'syncTransactions', error });
      throw error;
    }
  }

  // Create Invoice
  async createInvoice(invoiceData) {
    try {
      const mutation = `
        mutation CreateInvoice($input: InvoiceCreateInput!) {
          invoiceCreate(input: $input) {
            didSucceed
            inputErrors {
              path
              message
              code
            }
            invoice {
              id
              invoiceNumber
              total {
                value
                currency {
                  code
                }
              }
              amountDue {
                value
              }
              dueDate
              status
            }
          }
        }
      `;

      const input = {
        businessId: this.businessId,
        customerId: invoiceData.customerId,
        invoiceDate: invoiceData.invoiceDate || new Date().toISOString().split('T')[0],
        dueDate: invoiceData.dueDate,
        items: invoiceData.items.map(item => ({
          productId: item.productId,
          description: item.description,
          quantity: item.quantity.toString(),
          unitPrice: item.unitPrice.toString(),
          taxes: item.taxes || []
        })),
        memo: invoiceData.memo || '',
        attachments: []
      };

      const data = await this.executeQuery(mutation, { input });

      if (!data.invoiceCreate.didSucceed) {
        throw new Error(data.invoiceCreate.inputErrors[0].message);
      }

      const invoice = data.invoiceCreate.invoice;

      // Store invoice in database
      const client = await this.pool.connect();

      try {
        await this.processInvoice(client, invoice);

        this.emit('invoice_created', {
          invoiceId: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          total: invoice.total.value
        });

        return {
          success: true,
          invoice
        };

      } finally {
        client.release();
      }

    } catch (error) {
      this.emit('error', { operation: 'createInvoice', error });
      throw error;
    }
  }

  // Send Invoice
  async sendInvoice(invoiceId, recipients) {
    try {
      const mutation = `
        mutation SendInvoice($input: InvoiceSendInput!) {
          invoiceSend(input: $input) {
            didSucceed
            inputErrors {
              message
            }
          }
        }
      `;

      const input = {
        invoiceId,
        to: recipients,
        subject: 'Invoice from ' + (await this.getBusinessInfo()).business.name,
        message: 'Please find attached your invoice. Thank you for your business.',
        attachPdf: true
      };

      const data = await this.executeQuery(mutation, { input });

      if (!data.invoiceSend.didSucceed) {
        throw new Error(data.invoiceSend.inputErrors[0].message);
      }

      this.emit('invoice_sent', {
        invoiceId,
        recipients
      });

      return {
        success: true,
        message: 'Invoice sent successfully'
      };

    } catch (error) {
      this.emit('error', { operation: 'sendInvoice', error });
      throw error;
    }
  }

  // Record Payment
  async recordPayment(invoiceId, paymentData) {
    try {
      const mutation = `
        mutation CreatePayment($input: MoneyTransactionCreateInput!) {
          moneyTransactionCreate(input: $input) {
            didSucceed
            inputErrors {
              message
            }
            transaction {
              id
              amount {
                value
                currency {
                  code
                }
              }
              date
            }
          }
        }
      `;

      const input = {
        businessId: this.businessId,
        externalAccountId: paymentData.accountId,
        date: paymentData.date || new Date().toISOString().split('T')[0],
        description: `Payment for invoice`,
        anchor: {
          invoiceId,
          amount: paymentData.amount.toString(),
          direction: 'DEPOSIT'
        }
      };

      const data = await this.executeQuery(mutation, { input });

      if (!data.moneyTransactionCreate.didSucceed) {
        throw new Error(data.moneyTransactionCreate.inputErrors[0].message);
      }

      // Update invoice status
      await this.updateInvoiceStatus(invoiceId);

      this.emit('payment_recorded', {
        invoiceId,
        amount: paymentData.amount,
        transactionId: data.moneyTransactionCreate.transaction.id
      });

      return {
        success: true,
        transaction: data.moneyTransactionCreate.transaction
      };

    } catch (error) {
      this.emit('error', { operation: 'recordPayment', error });
      throw error;
    }
  }

  // Financial Reports
  async generateProfitLossReport(startDate, endDate) {
    try {
      const query = `
        query GetProfitLoss($businessId: ID!, $startDate: Date!, $endDate: Date!) {
          business(id: $businessId) {
            profitLoss(startDate: $startDate, endDate: $endDate) {
              startDate
              endDate
              revenue {
                value
                currency {
                  code
                }
              }
              expenses {
                value
                currency {
                  code
                }
              }
              netProfit {
                value
                currency {
                  code
                }
              }
              categories {
                name
                total {
                  value
                }
                type
              }
            }
          }
        }
      `;

      const data = await this.executeQuery(query, {
        businessId: this.businessId,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      });

      const report = data.business.profitLoss;

      // Store report data
      const client = await this.pool.connect();

      try {
        await client.query(`
          INSERT INTO wave_financial_reports
          (report_type, start_date, end_date, revenue, expenses,
           net_profit, currency, category_breakdown, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
        `, [
          'profit_loss',
          startDate,
          endDate,
          parseFloat(report.revenue.value),
          parseFloat(report.expenses.value),
          parseFloat(report.netProfit.value),
          report.revenue.currency.code,
          JSON.stringify(report.categories)
        ]);

        return {
          success: true,
          report: {
            period: {
              start: startDate,
              end: endDate
            },
            revenue: parseFloat(report.revenue.value),
            expenses: parseFloat(report.expenses.value),
            netProfit: parseFloat(report.netProfit.value),
            profitMargin: report.revenue.value > 0
              ? (report.netProfit.value / report.revenue.value * 100).toFixed(2)
              : 0,
            currency: report.revenue.currency.code,
            categories: report.categories
          }
        };

      } finally {
        client.release();
      }

    } catch (error) {
      this.emit('error', { operation: 'generateProfitLossReport', error });
      throw error;
    }
  }

  // Cash Flow Report
  async generateCashFlowReport(startDate, endDate) {
    try {
      const client = await this.pool.connect();

      try {
        // Get income
        const incomeResult = await client.query(`
          SELECT SUM(amount) as total_income
          FROM wave_transactions
          WHERE transaction_date BETWEEN $1 AND $2
          AND amount > 0
        `, [startDate, endDate]);

        // Get expenses
        const expenseResult = await client.query(`
          SELECT SUM(ABS(amount)) as total_expenses
          FROM wave_transactions
          WHERE transaction_date BETWEEN $1 AND $2
          AND amount < 0
        `, [startDate, endDate]);

        // Get invoice data
        const invoiceResult = await client.query(`
          SELECT
            SUM(total_amount) as total_invoiced,
            SUM(amount_paid) as total_collected,
            SUM(amount_due) as total_outstanding
          FROM wave_invoices
          WHERE invoice_date BETWEEN $1 AND $2
        `, [startDate, endDate]);

        const report = {
          period: {
            start: startDate,
            end: endDate
          },
          cashIn: parseFloat(incomeResult.rows[0].total_income || 0),
          cashOut: parseFloat(expenseResult.rows[0].total_expenses || 0),
          netCashFlow: parseFloat(incomeResult.rows[0].total_income || 0) -
                       parseFloat(expenseResult.rows[0].total_expenses || 0),
          invoicing: {
            totalInvoiced: parseFloat(invoiceResult.rows[0].total_invoiced || 0),
            totalCollected: parseFloat(invoiceResult.rows[0].total_collected || 0),
            totalOutstanding: parseFloat(invoiceResult.rows[0].total_outstanding || 0)
          }
        };

        return {
          success: true,
          report
        };

      } finally {
        client.release();
      }

    } catch (error) {
      this.emit('error', { operation: 'generateCashFlowReport', error });
      throw error;
    }
  }

  // Automated Sync
  async startAutomatedSync(intervalMinutes = 60) {
    try {
      if (this.syncInterval) {
        clearInterval(this.syncInterval);
      }

      // Initial sync
      await this.performFullSync();

      // Set up recurring sync
      this.syncInterval = setInterval(async () => {
        try {
          await this.performFullSync();
        } catch (error) {
          console.error('Automated sync failed:', error);
        }
      }, intervalMinutes * 60 * 1000);

      return {
        success: true,
        message: `Automated sync started with ${intervalMinutes} minute interval`
      };

    } catch (error) {
      this.emit('error', { operation: 'startAutomatedSync', error });
      throw error;
    }
  }

  // Full Sync
  async performFullSync() {
    try {
      const startTime = Date.now();
      this.emit('full_sync_started', { timestamp: new Date() });

      const results = {
        customers: await this.syncCustomers(),
        products: await this.syncProducts(),
        invoices: await this.syncInvoices(this.lastSyncTime),
        // Add account sync if needed
      };

      this.lastSyncTime = new Date();

      const executionTime = Date.now() - startTime;

      this.emit('full_sync_completed', {
        results,
        executionTime,
        lastSyncTime: this.lastSyncTime
      });

      return {
        success: true,
        results,
        executionTime
      };

    } catch (error) {
      this.emit('error', { operation: 'performFullSync', error });
      throw error;
    }
  }

  // Helper Methods
  async createUserFromCustomer(dbClient, customer) {
    const result = await dbClient.query(`
      INSERT INTO users (email, name, company, created_at)
      VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
      RETURNING id
    `, [
      customer.email,
      customer.name,
      customer.name // Wave doesn't separate company name
    ]);

    return result.rows[0].id;
  }

  async updateUserFromCustomer(dbClient, userId, customer) {
    await dbClient.query(`
      UPDATE users
      SET name = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `, [userId, customer.name]);
  }

  async processInvoice(dbClient, invoice) {
    const existing = await dbClient.query(
      'SELECT * FROM wave_invoices WHERE wave_invoice_id = $1',
      [invoice.id]
    );

    const invoiceData = {
      invoice_number: invoice.invoiceNumber,
      customer_id: invoice.customer?.id,
      total_amount: parseFloat(invoice.total?.value || 0),
      amount_due: parseFloat(invoice.amountDue?.value || 0),
      amount_paid: parseFloat(invoice.amountPaid?.value || 0),
      currency: invoice.total?.currency?.code || 'USD',
      status: invoice.status,
      invoice_date: invoice.invoiceDate,
      due_date: invoice.dueDate
    };

    if (existing.rows.length === 0) {
      await dbClient.query(`
        INSERT INTO wave_invoices
        (wave_invoice_id, invoice_number, customer_id, total_amount,
         amount_due, amount_paid, currency, status, invoice_date,
         due_date, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP)
      `, [
        invoice.id,
        invoiceData.invoice_number,
        invoiceData.customer_id,
        invoiceData.total_amount,
        invoiceData.amount_due,
        invoiceData.amount_paid,
        invoiceData.currency,
        invoiceData.status,
        invoiceData.invoice_date,
        invoiceData.due_date
      ]);

      return { isNew: true };
    } else {
      await dbClient.query(`
        UPDATE wave_invoices
        SET total_amount = $2, amount_due = $3, amount_paid = $4,
            status = $5, updated_at = CURRENT_TIMESTAMP
        WHERE wave_invoice_id = $1
      `, [
        invoice.id,
        invoiceData.total_amount,
        invoiceData.amount_due,
        invoiceData.amount_paid,
        invoiceData.status
      ]);

      return { isNew: false };
    }
  }

  async processInvoiceItems(dbClient, invoiceId, items) {
    if (!items || items.length === 0) return;

    // Delete existing items
    await dbClient.query(
      'DELETE FROM wave_invoice_items WHERE invoice_id = $1',
      [invoiceId]
    );

    // Insert new items
    for (const item of items) {
      await dbClient.query(`
        INSERT INTO wave_invoice_items
        (invoice_id, product_id, description, quantity, price, subtotal, tax_amount)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        invoiceId,
        item.product?.id,
        item.description,
        item.quantity,
        parseFloat(item.price || 0),
        parseFloat(item.subtotal?.value || 0),
        item.taxes?.reduce((sum, tax) => sum + parseFloat(tax.amount?.value || 0), 0) || 0
      ]);
    }
  }

  async updateInvoiceStatus(invoiceId) {
    try {
      const query = `
        query GetInvoice($invoiceId: ID!) {
          node(id: $invoiceId) {
            ... on Invoice {
              status
              amountDue {
                value
              }
            }
          }
        }
      `;

      const data = await this.executeQuery(query, { invoiceId });

      const client = await this.pool.connect();

      try {
        await client.query(`
          UPDATE wave_invoices
          SET status = $2, amount_due = $3, updated_at = CURRENT_TIMESTAMP
          WHERE wave_invoice_id = $1
        `, [
          invoiceId,
          data.node.status,
          parseFloat(data.node.amountDue.value)
        ]);

      } finally {
        client.release();
      }

    } catch (error) {
      console.error('Failed to update invoice status:', error);
    }
  }

  // Stop Automated Sync
  stopAutomatedSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      return { success: true, message: 'Automated sync stopped' };
    }
    return { success: false, message: 'No automated sync was running' };
  }

  // Cleanup
  async cleanup() {
    this.stopAutomatedSync();
    await this.pool.end();
  }
}

module.exports = WaveAccountingConnector;