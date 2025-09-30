/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

// Global Jest types
declare global {
  var expect: jest.Expect;
  var test: jest.It;
  var it: jest.It;
  var describe: jest.Describe;
  var beforeEach: jest.Lifecycle;
  var afterEach: jest.Lifecycle;
  var beforeAll: jest.Lifecycle;
  var afterAll: jest.Lifecycle;
  var jest: typeof import('jest');
}

// Extend Cypress Test to include state property
declare namespace Cypress {
  interface Test {
    title: string;
    titlePath: string[];
    state: 'passed' | 'failed' | 'skipped' | 'pending';
  }
}

// Add Cypress accessibility commands
declare namespace Cypress {
  interface Chainable {
    injectAxe(): Chainable<void>;
    checkA11y(
      context?: any,
      options?: any,
      violationCallback?: (violations: any[]) => void
    ): Chainable<void>;
  }
}

export {};