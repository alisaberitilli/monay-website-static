/// <reference types="cypress" />

import '@testing-library/cypress/add-commands';
import './commands';

// Prevent TypeScript errors when using testing-library commands
declare global {
  namespace Cypress {
    interface Chainable {
      login(email?: string, password?: string): Chainable<void>;
      logout(): Chainable<void>;
      createWallet(walletData: any): Chainable<any>;
      attachInvoice(walletId: string, invoiceData: any): Chainable<any>;
      processPayment(walletId: string, paymentData: any): Chainable<any>;
      checkCompliance(data: any): Chainable<any>;
      waitForWebSocket(event: string, timeout?: number): Chainable<any>;
      interceptAPI(method: string, url: string, response?: any): Chainable<void>;
      seedDatabase(scenario: string): Chainable<void>;
      clearDatabase(): Chainable<void>;
      checkAccessibility(): Chainable<void>;
    }
  }
}

// Global before each hook
beforeEach(() => {
  // Clear local storage
  cy.window().then((win) => {
    win.localStorage.clear();
    win.sessionStorage.clear();
  });

  // Clear cookies
  cy.clearCookies();

  // Reset database state
  cy.task('clearDb');
});

// Global after each hook
afterEach(() => {
  // Take screenshot on failure
  if (Cypress.currentTest.state === 'failed') {
    cy.screenshot(`failed-${Cypress.currentTest.title}`);
  }
});

// Suppress uncaught exceptions
Cypress.on('uncaught:exception', (err, runnable) => {
  // Returning false here prevents Cypress from failing the test
  if (err.message.includes('ResizeObserver')) {
    return false;
  }
  // Log the error for debugging
  console.error('Uncaught exception:', err);
  return true;
});

// Add custom log collector
const logs: string[] = [];
Cypress.on('log:added', (log) => {
  logs.push(`${log.name}: ${log.message}`);
});

Cypress.on('test:after:run', (test, runnable) => {
  if (test.state === 'failed') {
    console.log('Test logs:', logs);
  }
  logs.length = 0;
});