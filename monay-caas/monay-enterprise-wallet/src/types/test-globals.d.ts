/// <reference types="@testing-library/jest-dom" />
/// <reference types="jest" />

import '@testing-library/jest-dom';

declare global {
  namespace NodeJS {
    interface Global {
      fetch: jest.Mock;
    }
  }

  // Extend expect matchers
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveTextContent(text: string | RegExp): R;
      toHaveAttribute(attr: string, value?: any): R;
      toHaveClass(className: string): R;
      toBeVisible(): R;
      toBeDisabled(): R;
      toBeEnabled(): R;
      toHaveStyle(style: string | object): R;
      toContainHTML(html: string): R;
      toHaveValue(value: string | string[] | number): R;
      toHaveDisplayValue(value: string | string[]): R;
      toBeChecked(): R;
      toBePartiallyChecked(): R;
      toHaveDescription(text: string | RegExp): R;
      toHaveErrorMessage(text: string | RegExp): R;
      toBeRequired(): R;
      toBeValid(): R;
      toBeInvalid(): R;
      toBeEmpty(): R;
      toContainElement(element: HTMLElement | null): R;
      toHaveAccessibleDescription(text: string | RegExp): R;
      toHaveAccessibleName(text: string | RegExp): R;
      toHaveFocus(): R;
      toHaveFormValues(values: Record<string, any>): R;

      // Custom matchers
      toHaveLength(length: number): R;
      toMatchObject(object: any): R;
      toBeDefined(): R;
      toBeUndefined(): R;
      toBeNull(): R;
      toBeTruthy(): R;
      toBeFalsy(): R;
      toBeGreaterThan(value: number): R;
      toBeGreaterThanOrEqual(value: number): R;
      toBeLessThan(value: number): R;
      toBeLessThanOrEqual(value: number): R;
      toBeCloseTo(value: number, precision?: number): R;
      toMatch(pattern: string | RegExp): R;
      toContain(item: any): R;
      toThrow(error?: string | RegExp | Error | ErrorConstructor): R;
      toHaveBeenCalled(): R;
      toHaveBeenCalledTimes(times: number): R;
      toHaveBeenCalledWith(...args: any[]): R;
      toHaveBeenLastCalledWith(...args: any[]): R;
      toHaveBeenNthCalledWith(n: number, ...args: any[]): R;
      toHaveReturned(): R;
      toHaveReturnedTimes(times: number): R;
      toHaveReturnedWith(value: any): R;
      toHaveLastReturnedWith(value: any): R;
      toHaveNthReturnedWith(n: number, value: any): R;
      toMatchSnapshot(propertyMatchers?: any, hint?: string): R;
      toMatchInlineSnapshot(propertyMatchers?: any, inlineSnapshot?: string): R;
      toStrictEqual(value: any): R;
    }
  }

  // Add missing window properties
  interface Window {
    ethereum?: any;
    solana?: any;
  }
}

// Note: Chai assertions are handled in Cypress type definitions separately
// This file is for Jest test types only

export {};