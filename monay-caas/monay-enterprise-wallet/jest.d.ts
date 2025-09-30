/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

import '@testing-library/jest-dom';

declare global {
  // Explicitly declare expect as Jest's expect
  const expect: jest.Expect;

  // Ensure test globals are available
  const describe: jest.Describe;
  const it: jest.It;
  const test: jest.It;
  const beforeEach: jest.HookBase;
  const afterEach: jest.HookBase;
  const beforeAll: jest.HookBase;
  const afterAll: jest.HookBase;
}

export {};