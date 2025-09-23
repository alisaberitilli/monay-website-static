/// <reference types="cypress" />

import { waitForLoading, checkToast, fillFormField, selectDropdownOption } from '../support/commands';

describe('Invoice Wallet E2E Flow', () => {
  let testWalletId: string;
  let testInvoiceId: string;

  before(() => {
    // Seed database with test data
    cy.seedDatabase('invoice-wallet-test');
  });

  beforeEach(() => {
    // Login before each test
    cy.login();
    cy.visit('/invoice-wallets');
    waitForLoading();
  });

  after(() => {
    // Cleanup
    cy.clearDatabase();
  });

  describe('Wallet Creation', () => {
    it('Should create a new invoice wallet through the wizard', () => {
      // Click create wallet button
      cy.findByRole('button', { name: /Create Invoice Wallet/i }).click();

      // Step 1: Basic Information
      cy.findByRole('heading', { name: /Basic Information/i }).should('be.visible');

      fillFormField('Wallet Name', 'E2E Test Wallet');
      fillFormField('Description', 'Created during E2E testing');
      selectDropdownOption('Currency', 'USD');
      selectDropdownOption('Wallet Type', 'Invoice First');

      cy.findByRole('button', { name: /Next/i }).click();

      // Step 2: Compliance Settings
      cy.findByRole('heading', { name: /Compliance Settings/i }).should('be.visible');

      selectDropdownOption('Compliance Level', 'Standard');
      cy.findByLabelText(/Enable KYC/i).check();
      cy.findByLabelText(/Enable AML Monitoring/i).check();

      cy.findByRole('button', { name: /Next/i }).click();

      // Step 3: Payment Configuration
      cy.findByRole('heading', { name: /Payment Configuration/i }).should('be.visible');

      cy.findByLabelText(/Enable Auto-Pay/i).check();
      fillFormField('Payment Threshold', '1000');
      selectDropdownOption('Default Payment Method', 'Wallet Balance');

      cy.findByRole('button', { name: /Next/i }).click();

      // Step 4: Review & Confirm
      cy.findByRole('heading', { name: /Review/i }).should('be.visible');

      // Verify summary
      cy.findByText('E2E Test Wallet').should('be.visible');
      cy.findByText('USD').should('be.visible');
      cy.findByText('Standard Compliance').should('be.visible');

      // Submit
      cy.findByRole('button', { name: /Create Wallet/i }).click();

      // Wait for success
      waitForLoading();
      checkToast('Wallet created successfully', 'success');

      // Store wallet ID
      cy.url().should('match', /\/invoice-wallets\/[a-zA-Z0-9-]+/);
      cy.url().then((url) => {
        testWalletId = url.split('/').pop() as string;
      });
    });

    it('Should validate required fields', () => {
      cy.findByRole('button', { name: /Create Invoice Wallet/i }).click();

      // Try to proceed without filling fields
      cy.findByRole('button', { name: /Next/i }).click();

      // Check validation errors
      cy.findByText(/Wallet name is required/i).should('be.visible');
      cy.findByText(/Currency is required/i).should('be.visible');
    });

    it('Should handle duplicate wallet names', () => {
      cy.findByRole('button', { name: /Create Invoice Wallet/i }).click();

      fillFormField('Wallet Name', 'E2E Test Wallet'); // Duplicate name
      fillFormField('Description', 'Duplicate test');
      selectDropdownOption('Currency', 'USD');

      cy.findByRole('button', { name: /Next/i }).click();
      cy.findByRole('button', { name: /Next/i }).click();
      cy.findByRole('button', { name: /Next/i }).click();
      cy.findByRole('button', { name: /Create Wallet/i }).click();

      waitForLoading();
      checkToast('Wallet with this name already exists', 'error');
    });
  });

  describe('Invoice Management', () => {
    beforeEach(() => {
      if (testWalletId) {
        cy.visit(`/invoice-wallets/${testWalletId}`);
        waitForLoading();
      }
    });

    it('Should attach an invoice to the wallet', () => {
      // Click attach invoice button
      cy.findByRole('button', { name: /Attach Invoice/i }).click();

      // Fill invoice form
      fillFormField('Invoice Number', 'INV-E2E-001');
      fillFormField('Amount', '5000');
      fillFormField('Vendor Name', 'Test Vendor Inc');
      fillFormField('Description', 'E2E Test Invoice');

      // Set due date
      cy.findByLabelText(/Due Date/i).type('2024-12-31');

      // Add line items
      cy.findByRole('button', { name: /Add Line Item/i }).click();
      cy.get('[data-testid="line-item-0-description"]').type('Service Fee');
      cy.get('[data-testid="line-item-0-quantity"]').type('1');
      cy.get('[data-testid="line-item-0-price"]').type('5000');

      // Submit
      cy.findByRole('button', { name: /Attach Invoice/i }).click();

      waitForLoading();
      checkToast('Invoice attached successfully', 'success');

      // Verify invoice appears in list
      cy.findByText('INV-E2E-001').should('be.visible');
      cy.findByText('$5,000.00').should('be.visible');
      cy.findByText('Test Vendor Inc').should('be.visible');

      // Store invoice ID
      cy.findByText('INV-E2E-001').click();
      cy.url().then((url) => {
        const parts = url.split('/');
        testInvoiceId = parts[parts.indexOf('invoices') + 1];
      });
    });

    it('Should display invoice details', () => {
      cy.visit(`/invoice-wallets/${testWalletId}/invoices/${testInvoiceId}`);
      waitForLoading();

      // Verify invoice details
      cy.findByText('INV-E2E-001').should('be.visible');
      cy.findByText('$5,000.00').should('be.visible');
      cy.findByText('Test Vendor Inc').should('be.visible');
      cy.findByText('Service Fee').should('be.visible');

      // Check status
      cy.get('[data-testid="invoice-status"]')
        .should('be.visible')
        .and('contain', 'Pending');
    });

    it('Should filter and search invoices', () => {
      cy.visit(`/invoice-wallets/${testWalletId}`);
      waitForLoading();

      // Search by invoice number
      cy.get('[data-testid="search-input"]').type('INV-E2E-001');
      cy.findByText('INV-E2E-001').should('be.visible');

      // Filter by status
      selectDropdownOption('Status Filter', 'Pending');
      cy.findByText('INV-E2E-001').should('be.visible');

      // Filter by date range
      cy.findByLabelText(/Start Date/i).type('2024-01-01');
      cy.findByLabelText(/End Date/i).type('2024-12-31');
      cy.findByRole('button', { name: /Apply Filters/i }).click();
      waitForLoading();

      cy.findByText('INV-E2E-001').should('be.visible');
    });
  });

  describe('Payment Processing', () => {
    beforeEach(() => {
      if (testWalletId && testInvoiceId) {
        cy.visit(`/invoice-wallets/${testWalletId}/invoices/${testInvoiceId}`);
        waitForLoading();
      }
    });

    it('Should process invoice payment', () => {
      // First, fund the wallet
      cy.visit(`/invoice-wallets/${testWalletId}`);
      cy.findByRole('button', { name: /Fund Wallet/i }).click();

      fillFormField('Amount', '10000');
      selectDropdownOption('Payment Method', 'Bank Transfer');
      fillFormField('Reference', 'E2E-FUND-001');

      cy.findByRole('button', { name: /Fund Wallet/i }).click();
      waitForLoading();
      checkToast('Wallet funded successfully', 'success');

      // Navigate back to invoice
      cy.visit(`/invoice-wallets/${testWalletId}/invoices/${testInvoiceId}`);
      waitForLoading();

      // Process payment
      cy.findByRole('button', { name: /Pay Invoice/i }).click();

      // Confirm payment details
      cy.get('[data-testid="payment-modal"]').within(() => {
        cy.findByText('$5,000.00').should('be.visible');
        cy.findByText('Wallet Balance').should('be.visible');

        cy.findByRole('button', { name: /Confirm Payment/i }).click();
      });

      waitForLoading();
      checkToast('Payment processed successfully', 'success');

      // Verify status change
      cy.get('[data-testid="invoice-status"]')
        .should('contain', 'Paid');
    });

    it('Should handle insufficient balance', () => {
      // Create a new invoice with high amount
      cy.visit(`/invoice-wallets/${testWalletId}`);
      cy.findByRole('button', { name: /Attach Invoice/i }).click();

      fillFormField('Invoice Number', 'INV-E2E-002');
      fillFormField('Amount', '100000'); // High amount
      fillFormField('Vendor Name', 'Test Vendor Inc');

      cy.findByRole('button', { name: /Attach Invoice/i }).click();
      waitForLoading();

      // Try to pay
      cy.findByText('INV-E2E-002').click();
      cy.findByRole('button', { name: /Pay Invoice/i }).click();

      cy.get('[data-testid="payment-modal"]').within(() => {
        cy.findByRole('button', { name: /Confirm Payment/i }).click();
      });

      checkToast('Insufficient balance', 'error');
    });

    it('Should support partial payments', () => {
      cy.visit(`/invoice-wallets/${testWalletId}`);

      // Create invoice for partial payment
      cy.findByRole('button', { name: /Attach Invoice/i }).click();
      fillFormField('Invoice Number', 'INV-E2E-003');
      fillFormField('Amount', '3000');
      fillFormField('Vendor Name', 'Test Vendor Inc');
      cy.findByRole('button', { name: /Attach Invoice/i }).click();
      waitForLoading();

      // Make partial payment
      cy.findByText('INV-E2E-003').click();
      cy.findByRole('button', { name: /Make Partial Payment/i }).click();

      fillFormField('Payment Amount', '1000');
      cy.findByRole('button', { name: /Confirm Payment/i }).click();

      waitForLoading();
      checkToast('Partial payment processed', 'success');

      // Verify remaining balance
      cy.findByText('$2,000.00 remaining').should('be.visible');
    });
  });

  describe('Wallet Operations', () => {
    beforeEach(() => {
      if (testWalletId) {
        cy.visit(`/invoice-wallets/${testWalletId}`);
        waitForLoading();
      }
    });

    it('Should display wallet balance and metrics', () => {
      // Check balance display
      cy.get('[data-testid="wallet-balance"]').should('be.visible');
      cy.get('[data-testid="available-balance"]').should('contain', '$');
      cy.get('[data-testid="pending-balance"]').should('contain', '$');
      cy.get('[data-testid="reserved-balance"]').should('contain', '$');

      // Check metrics
      cy.get('[data-testid="total-invoices"]').should('be.visible');
      cy.get('[data-testid="paid-invoices"]').should('be.visible');
      cy.get('[data-testid="pending-invoices"]').should('be.visible');
    });

    it('Should transfer funds between wallets', () => {
      // Create second wallet first
      cy.visit('/invoice-wallets');
      cy.findByRole('button', { name: /Create Invoice Wallet/i }).click();

      fillFormField('Wallet Name', 'E2E Transfer Target');
      selectDropdownOption('Currency', 'USD');

      // Quick complete wizard
      cy.findByRole('button', { name: /Next/i }).click();
      cy.findByRole('button', { name: /Next/i }).click();
      cy.findByRole('button', { name: /Next/i }).click();
      cy.findByRole('button', { name: /Create Wallet/i }).click();
      waitForLoading();

      let targetWalletId: string;
      cy.url().then((url) => {
        targetWalletId = url.split('/').pop() as string;
      });

      // Go back to source wallet
      cy.visit(`/invoice-wallets/${testWalletId}`);
      cy.findByRole('button', { name: /Transfer Funds/i }).click();

      // Fill transfer form
      cy.get('[data-testid="transfer-modal"]').within(() => {
        selectDropdownOption('Target Wallet', 'E2E Transfer Target');
        fillFormField('Amount', '500');
        fillFormField('Description', 'E2E test transfer');

        cy.findByRole('button', { name: /Transfer/i }).click();
      });

      waitForLoading();
      checkToast('Transfer completed successfully', 'success');

      // Verify transaction in history
      cy.findByRole('tab', { name: /Transaction History/i }).click();
      cy.findByText('Transfer to E2E Transfer Target').should('be.visible');
      cy.findByText('-$500.00').should('be.visible');
    });

    it('Should export transaction history', () => {
      cy.findByRole('tab', { name: /Transaction History/i }).click();
      waitForLoading();

      // Export as CSV
      cy.findByRole('button', { name: /Export/i }).click();
      selectDropdownOption('Export Format', 'CSV');
      cy.findByRole('button', { name: /Download/i }).click();

      // Verify download
      cy.readFile('cypress/downloads/transactions.csv').should('exist');
    });
  });

  describe('Compliance and Security', () => {
    beforeEach(() => {
      if (testWalletId) {
        cy.visit(`/invoice-wallets/${testWalletId}/settings`);
        waitForLoading();
      }
    });

    it('Should enforce transaction limits', () => {
      // Try to create large transaction
      cy.visit(`/invoice-wallets/${testWalletId}`);
      cy.findByRole('button', { name: /Transfer Funds/i }).click();

      fillFormField('Amount', '1000000'); // Exceeds limit
      cy.findByRole('button', { name: /Transfer/i }).click();

      checkToast('Transaction exceeds daily limit', 'error');
    });

    it('Should require KYC for high-value transactions', () => {
      // Attach high-value invoice
      cy.visit(`/invoice-wallets/${testWalletId}`);
      cy.findByRole('button', { name: /Attach Invoice/i }).click();

      fillFormField('Invoice Number', 'INV-HIGH-001');
      fillFormField('Amount', '50000'); // High amount triggers KYC
      fillFormField('Vendor Name', 'High Value Vendor');

      cy.findByRole('button', { name: /Attach Invoice/i }).click();
      waitForLoading();

      // Try to pay - should require KYC
      cy.findByText('INV-HIGH-001').click();
      cy.findByRole('button', { name: /Pay Invoice/i }).click();

      // Should show KYC required modal
      cy.get('[data-testid="kyc-required-modal"]').should('be.visible');
      cy.findByText(/KYC verification required/i).should('be.visible');
    });

    it('Should display audit trail', () => {
      cy.findByRole('tab', { name: /Audit Log/i }).click();
      waitForLoading();

      // Verify audit entries
      cy.findByText(/Wallet created/i).should('be.visible');
      cy.findByText(/Invoice attached/i).should('be.visible');
      cy.findByText(/Payment processed/i).should('be.visible');

      // Each entry should have timestamp and user
      cy.get('[data-testid="audit-entry"]').each(($entry) => {
        cy.wrap($entry).find('[data-testid="timestamp"]').should('exist');
        cy.wrap($entry).find('[data-testid="user"]').should('exist');
        cy.wrap($entry).find('[data-testid="action"]').should('exist');
      });
    });

    it('Should handle wallet deactivation', () => {
      cy.findByRole('tab', { name: /Security/i }).click();

      // Deactivate wallet
      cy.findByRole('button', { name: /Deactivate Wallet/i }).click();

      // Confirm deactivation
      cy.get('[data-testid="confirm-modal"]').within(() => {
        cy.findByText(/This action cannot be undone/i).should('be.visible');
        cy.findByRole('button', { name: /Confirm Deactivation/i }).click();
      });

      waitForLoading();
      checkToast('Wallet deactivated', 'success');

      // Verify wallet is inactive
      cy.get('[data-testid="wallet-status"]').should('contain', 'Inactive');

      // Operations should be disabled
      cy.findByRole('button', { name: /Transfer Funds/i }).should('be.disabled');
      cy.findByRole('button', { name: /Attach Invoice/i }).should('be.disabled');
    });
  });

  describe('Real-time Updates', () => {
    it('Should receive WebSocket updates for transactions', () => {
      cy.visit(`/invoice-wallets/${testWalletId}`);
      waitForLoading();

      // Setup WebSocket listener
      cy.window().then((win) => {
        (win as any).socket.emit('subscribe', { walletId: testWalletId });
      });

      // Simulate incoming payment via API
      cy.window().then(() => {
        cy.request({
          method: 'POST',
          url: `${Cypress.env('API_URL')}/api/test/simulate-payment`,
          headers: {
            Authorization: `Bearer ${window.localStorage.getItem('authToken')}`
          },
          body: {
            walletId: testWalletId,
            amount: 1000,
            type: 'INCOMING'
          }
        });
      });

      // Wait for WebSocket update
      cy.waitForWebSocket('wallet:update').then((data: any) => {
        expect(data.walletId).to.equal(testWalletId);
        expect(data.type).to.equal('balance_updated');
      });

      // Balance should update automatically
      cy.get('[data-testid="available-balance"]')
        .should('contain', '$6,000.00'); // Previous + new
    });

    it('Should show real-time notifications', () => {
      cy.visit(`/invoice-wallets/${testWalletId}`);

      // Enable notifications
      cy.get('[data-testid="notification-bell"]').click();
      cy.findByLabelText(/Enable real-time notifications/i).check();

      // Simulate event
      cy.window().then((win) => {
        (win as any).socket.emit('notification', {
          type: 'invoice_paid',
          message: 'Invoice INV-001 has been paid',
          timestamp: new Date().toISOString()
        });
      });

      // Check notification appears
      cy.get('[data-testid="notification-toast"]')
        .should('be.visible')
        .and('contain', 'Invoice INV-001 has been paid');
    });
  });

  describe('Mobile Responsiveness', () => {
    beforeEach(() => {
      cy.viewport('iphone-x');
    });

    it('Should work on mobile devices', () => {
      cy.visit(`/invoice-wallets/${testWalletId}`);
      waitForLoading();

      // Check mobile menu
      cy.get('[data-testid="mobile-menu-button"]').click();
      cy.get('[data-testid="mobile-menu"]').should('be.visible');

      // Navigate to invoices
      cy.findByRole('link', { name: /Invoices/i }).click();
      waitForLoading();

      // Should display in mobile-friendly format
      cy.get('[data-testid="invoice-card"]').should('be.visible');

      // Actions should be accessible
      cy.get('[data-testid="invoice-card"]').first().click();
      cy.findByRole('button', { name: /Pay Invoice/i }).should('be.visible');
    });
  });

  describe('Error Handling', () => {
    it('Should handle network errors gracefully', () => {
      // Simulate network error
      cy.intercept('GET', '**/api/invoice-wallets/**', { forceNetworkError: true });

      cy.visit(`/invoice-wallets/${testWalletId}`);

      // Should show error message
      cy.findByText(/Unable to load wallet data/i).should('be.visible');
      cy.findByRole('button', { name: /Retry/i }).should('be.visible');
    });

    it('Should handle API errors', () => {
      cy.intercept('POST', '**/api/invoice-wallets/**/invoices', {
        statusCode: 500,
        body: {
          error: 'Internal server error'
        }
      });

      cy.visit(`/invoice-wallets/${testWalletId}`);
      cy.findByRole('button', { name: /Attach Invoice/i }).click();

      fillFormField('Invoice Number', 'INV-ERROR-001');
      fillFormField('Amount', '1000');
      cy.findByRole('button', { name: /Attach Invoice/i }).click();

      checkToast('Failed to attach invoice', 'error');
    });

    it('Should validate user input', () => {
      cy.visit(`/invoice-wallets/${testWalletId}`);
      cy.findByRole('button', { name: /Transfer Funds/i }).click();

      // Invalid amount
      fillFormField('Amount', '-100');
      cy.findByText(/Amount must be positive/i).should('be.visible');

      // Invalid wallet selection
      fillFormField('Amount', '100');
      cy.findByRole('button', { name: /Transfer/i }).click();
      cy.findByText(/Please select a target wallet/i).should('be.visible');
    });
  });
});