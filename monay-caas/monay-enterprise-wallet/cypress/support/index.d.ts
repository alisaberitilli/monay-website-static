/// <reference types="cypress" />
/// <reference types="@testing-library/cypress" />

declare namespace Cypress {
  interface Chainable {
    // Testing Library commands
    findByRole(role: string, options?: any): Chainable<Element>;
    findByLabelText(text: string | RegExp, options?: any): Chainable<Element>;
    findByPlaceholderText(text: string | RegExp, options?: any): Chainable<Element>;
    findByText(text: string | RegExp, options?: any): Chainable<Element>;
    findByDisplayValue(value: string | RegExp, options?: any): Chainable<Element>;
    findByAltText(text: string | RegExp, options?: any): Chainable<Element>;
    findByTitle(title: string | RegExp, options?: any): Chainable<Element>;
    findByTestId(testId: string, options?: any): Chainable<Element>;
    findAllByRole(role: string, options?: any): Chainable<Element[]>;
    findAllByLabelText(text: string | RegExp, options?: any): Chainable<Element[]>;
    findAllByPlaceholderText(text: string | RegExp, options?: any): Chainable<Element[]>;
    findAllByText(text: string | RegExp, options?: any): Chainable<Element[]>;
    findAllByDisplayValue(value: string | RegExp, options?: any): Chainable<Element[]>;
    findAllByAltText(text: string | RegExp, options?: any): Chainable<Element[]>;
    findAllByTitle(title: string | RegExp, options?: any): Chainable<Element[]>;
    findAllByTestId(testId: string, options?: any): Chainable<Element[]>;

    // Accessibility commands
    injectAxe(): void;
    checkA11y(
      context?: string | Node | axe.ContextObject | undefined,
      options?: axe.RunOptions | undefined,
      violationCallback?: ((violations: axe.Result[]) => void) | undefined,
      skipFailures?: boolean
    ): void;

    // Custom commands
    login(email: string, password: string): void;
    logout(): void;
    seedDatabase(): void;
    clearDatabase(): void;
    mockAPI(endpoint: string, response: any): void;
    waitForAPI(alias: string): void;

    // Data attributes
    getBySel(selector: string): Chainable<Element>;
    getBySelLike(selector: string): Chainable<Element>;
  }
}

// Chai assertions for Cypress
declare namespace Chai {
  interface Assertion {
    (selector: string): Assertion;
  }
}

// Axe types
declare namespace axe {
  interface Result {
    id: string;
    impact?: string;
    tags: string[];
    description: string;
    help: string;
    helpUrl: string;
    nodes: NodeResult[];
  }

  interface NodeResult {
    node: Node;
    impact?: string;
    html: string;
    target: string[];
    failureSummary?: string;
  }

  interface Node {
    selector: string[];
    source: string;
    xpath: string[];
  }

  interface ContextObject {
    include?: string[][];
    exclude?: string[][];
  }

  interface RunOptions {
    rules?: object;
    runOnly?: RunOnly | TagValue[] | string[];
    reporter?: string;
    resultTypes?: string[];
    selectors?: boolean;
    ancestry?: boolean;
    xpath?: boolean;
    absolutePaths?: boolean;
    iframes?: boolean;
    elementRef?: boolean;
    frameWaitTime?: number;
    preload?: boolean;
    performanceTimer?: boolean;
  }

  interface RunOnly {
    type: string;
    values: TagValue[] | string[];
  }

  interface TagValue {
    [key: string]: any;
  }
}