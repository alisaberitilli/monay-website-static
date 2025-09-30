/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

declare global {
  namespace jest {
    interface Matchers<R> {
      toBe(expected: any): R;
      toEqual(expected: any): R;
      toMatchObject(expected: any): R;
      toHaveLength(expected: number): R;
      toBeDefined(): R;
      toBeUndefined(): R;
      toBeNull(): R;
      toBeTruthy(): R;
      toBeFalsy(): R;
      toBeGreaterThan(expected: number): R;
      toBeGreaterThanOrEqual(expected: number): R;
      toBeLessThan(expected: number): R;
      toBeLessThanOrEqual(expected: number): R;
      toContain(expected: any): R;
      toContainEqual(expected: any): R;
      toThrow(expected?: any): R;
      toThrowError(expected?: any): R;
      toHaveBeenCalled(): R;
      toHaveBeenCalledTimes(expected: number): R;
      toHaveBeenCalledWith(...expected: any[]): R;
      toHaveBeenLastCalledWith(...expected: any[]): R;
      toHaveBeenNthCalledWith(nthCall: number, ...expected: any[]): R;
      toHaveProperty(key: string, value?: any): R;
      toBeCloseTo(expected: number, precision?: number): R;
      toBeInstanceOf(expected: any): R;
      // Jest DOM matchers
      toBeInTheDocument(): R;
      toBeVisible(): R;
      toBeEmptyDOMElement(): R;
      toHaveAttribute(attr: string, value?: any): R;
      toHaveClass(className: string): R;
      toHaveDisplayValue(value: string | RegExp | (string | RegExp)[]): R;
      toHaveFocus(): R;
      toHaveFormValues(expectedValues: Record<string, any>): R;
      toHaveStyle(css: string | Record<string, any>): R;
      toHaveTextContent(text: string | RegExp): R;
      toHaveValue(value: string | string[] | number): R;
      toBeChecked(): R;
      toBePartiallyChecked(): R;
      toBeDisabled(): R;
      toBeEnabled(): R;
      toBeInvalid(): R;
      toBeRequired(): R;
      toBeValid(): R;
    }
  }
}

export {};