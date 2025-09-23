/// <reference types="cypress" />

// Login command
Cypress.Commands.add('login', (
  email = Cypress.env('TEST_USER_EMAIL'),
  password = Cypress.env('TEST_USER_PASSWORD')
) => {
  cy.request('POST', `${Cypress.env('API_URL')}/api/auth/login`, {
    email,
    password
  }).then((response) => {
    window.localStorage.setItem('authToken', response.body.token);
    window.localStorage.setItem('user', JSON.stringify(response.body.user));
  });
});

// Logout command
Cypress.Commands.add('logout', () => {
  window.localStorage.removeItem('authToken');
  window.localStorage.removeItem('user');
  cy.visit('/');
});

// Create wallet command
Cypress.Commands.add('createWallet', (walletData) => {
  const token = window.localStorage.getItem('authToken');

  return cy.request({
    method: 'POST',
    url: `${Cypress.env('API_URL')}/api/invoice-wallets`,
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: walletData
  }).then((response) => response.body);
});

// Attach invoice command
Cypress.Commands.add('attachInvoice', (walletId, invoiceData) => {
  const token = window.localStorage.getItem('authToken');

  return cy.request({
    method: 'POST',
    url: `${Cypress.env('API_URL')}/api/invoice-wallets/${walletId}/invoices`,
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: invoiceData
  }).then((response) => response.body);
});

// Process payment command
Cypress.Commands.add('processPayment', (walletId, paymentData) => {
  const token = window.localStorage.getItem('authToken');

  return cy.request({
    method: 'POST',
    url: `${Cypress.env('API_URL')}/api/invoice-wallets/${walletId}/pay`,
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: paymentData
  }).then((response) => response.body);
});

// Check compliance command
Cypress.Commands.add('checkCompliance', (data) => {
  const token = window.localStorage.getItem('authToken');

  return cy.request({
    method: 'POST',
    url: `${Cypress.env('API_URL')}/api/compliance/check`,
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: data
  }).then((response) => response.body);
});

// Wait for WebSocket event
Cypress.Commands.add('waitForWebSocket', (event, timeout = 10000) => {
  return cy.window().then((win) => {
    return new Cypress.Promise((resolve, reject) => {
      const socket = (win as any).socket;

      if (!socket) {
        reject(new Error('WebSocket not initialized'));
        return;
      }

      const timeoutId = setTimeout(() => {
        socket.off(event);
        reject(new Error(`WebSocket event '${event}' timed out`));
      }, timeout);

      socket.once(event, (data: any) => {
        clearTimeout(timeoutId);
        resolve(data);
      });
    });
  });
});

// Intercept API helper
Cypress.Commands.add('interceptAPI', (method, url, response) => {
  cy.intercept(
    {
      method,
      url: `${Cypress.env('API_URL')}${url}`
    },
    response || { statusCode: 200, body: {} }
  ).as(`api${method}${url.replace(/\//g, '_')}`);
});

// Seed database command
Cypress.Commands.add('seedDatabase', (scenario) => {
  cy.task('seedDb', scenario);
});

// Clear database command
Cypress.Commands.add('clearDatabase', () => {
  cy.task('clearDb');
});

// Accessibility check command
Cypress.Commands.add('checkAccessibility', () => {
  cy.injectAxe();
  cy.checkA11y(null, {
    rules: {
      'color-contrast': { enabled: false } // Disable if using custom theme
    }
  }, (violations) => {
    const violationData = violations.map((violation) => ({
      id: violation.id,
      impact: violation.impact,
      description: violation.description,
      nodes: violation.nodes.length
    }));

    cy.task('log', `Accessibility violations: ${JSON.stringify(violationData, null, 2)}`);
  });
});

// Helper function to wait for loading states
export const waitForLoading = () => {
  cy.get('[data-testid="loading-spinner"]').should('not.exist');
  cy.get('[data-testid="skeleton-loader"]').should('not.exist');
};

// Helper function to check toast messages
export const checkToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
  cy.get(`[data-testid="toast-${type}"]`)
    .should('be.visible')
    .and('contain', message);
};

// Helper function to fill form fields
export const fillFormField = (label: string, value: string) => {
  cy.findByLabelText(label).clear().type(value);
};

// Helper function to select dropdown option
export const selectDropdownOption = (label: string, option: string) => {
  cy.findByLabelText(label).click();
  cy.findByText(option).click();
};