/// <reference types="@testing-library/jest-dom" />

import '@testing-library/jest-dom';

declare global {
  namespace jest {
    interface Matchers<R> extends jest.Matchers<R> {
      // Jest DOM matchers - these will be added by @testing-library/jest-dom
      toBeInTheDocument(): R;
      toHaveTextContent(text: string | RegExp): R;
      toHaveAttribute(attr: string, value?: any): R;
      toHaveClass(...classNames: string[]): R;
      toHaveStyle(style: Record<string, any> | string): R;
      toHaveValue(value: string | string[] | number): R;
      toBeDisabled(): R;
      toBeEnabled(): R;
      toBeVisible(): R;
      toBeChecked(): R;
      toBePartiallyChecked(): R;
      toHaveFormValues(values: Record<string, any>): R;
      toContainElement(element: HTMLElement | null): R;
      toHaveFocus(): R;
      toBeValid(): R;
      toBeInvalid(): R;
      toBeRequired(): R;
      toBeEmpty(): R;
      toHaveDisplayValue(value: string | RegExp | Array<string | RegExp>): R;
      toBeEmptyDOMElement(): R;
      toHaveAccessibleDescription(text?: string | RegExp): R;
      toHaveAccessibleName(text?: string | RegExp): R;
      toHaveErrorMessage(text?: string | RegExp): R;
    }
  }
}

export {};