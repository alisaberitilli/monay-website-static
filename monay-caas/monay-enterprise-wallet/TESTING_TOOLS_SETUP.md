# Testing Tools & Configuration Guide
## Monay Enterprise Wallet - Complete Testing Stack Setup
### Version 1.0.0 - January 21, 2025

---

## 📦 Required Testing Tools Installation

### 1. Frontend Testing Stack

#### 1.1 Jest & React Testing Library
```bash
# Install Jest and React Testing Library
npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event
npm install --save-dev @types/jest jest-environment-jsdom

# Install additional utilities
npm install --save-dev @testing-library/react-hooks
npm install --save-dev jest-canvas-mock jest-localstorage-mock
```

**Configuration: `jest.config.js`**
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/test/setupTests.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/src/test/__mocks__/fileMock.js'
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.tsx',
    '!src/test/**'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{ts,tsx}',
    '<rootDir>/src/**/*.{spec,test}.{ts,tsx}'
  ],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        jsx: 'react-jsx'
      }
    }]
  }
};
```

#### 1.2 Cypress for E2E Testing
```bash
# Install Cypress
npm install --save-dev cypress @cypress/react @cypress/webpack-dev-server
npm install --save-dev @testing-library/cypress

# Install Cypress plugins
npm install --save-dev cypress-real-events cypress-file-upload
npm install --save-dev @cypress/code-coverage cypress-localstorage-commands
```

**Configuration: `cypress.config.ts`**
```typescript
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3007',
    viewportWidth: 1920,
    viewportHeight: 1080,
    video: true,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    setupNodeEvents(on, config) {
      // Code coverage
      require('@cypress/code-coverage/task')(on, config);

      // Custom tasks
      on('task', {
        log(message) {
          console.log(message);
          return null;
        },
        clearDatabase() {
          // Database cleanup logic
          return null;
        }
      });

      return config;
    },
    env: {
      apiUrl: 'http://localhost:3001',
      coverage: true
    }
  },
  component: {
    devServer: {
      framework: 'react',
      bundler: 'webpack'
    },
    specPattern: 'src/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/component.ts'
  }
});
```

#### 1.3 Playwright for Cross-Browser Testing
```bash
# Install Playwright
npm install --save-dev @playwright/test
npx playwright install # Install browsers

# Install additional tools
npm install --save-dev @playwright/test-coverage
npm install --save-dev playwright-lighthouse
```

**Configuration: `playwright.config.ts`**
```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }]
  ],
  use: {
    baseURL: 'http://localhost:3007',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15000,
    navigationTimeout: 30000
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] }
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] }
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] }
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] }
    }
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3007',
    reuseExistingServer: !process.env.CI
  }
});
```

---

### 2. Backend Testing Stack

#### 2.1 Mocha, Chai & Sinon
```bash
# Install testing framework
npm install --save-dev mocha chai sinon
npm install --save-dev @types/mocha @types/chai @types/sinon

# Install additional assertion libraries
npm install --save-dev chai-http chai-as-promised
npm install --save-dev sinon-chai chai-sorted chai-datetime
```

**Configuration: `.mocharc.json`**
```json
{
  "require": [
    "ts-node/register",
    "source-map-support/register"
  ],
  "extensions": ["ts", "js"],
  "spec": [
    "src/**/*.spec.ts",
    "src/**/*.test.ts",
    "test/**/*.spec.ts",
    "test/**/*.test.ts"
  ],
  "watch-files": ["src/**/*.ts", "test/**/*.ts"],
  "recursive": true,
  "reporter": "spec",
  "timeout": 10000,
  "exit": true,
  "bail": false,
  "slow": 1000,
  "ui": "bdd",
  "color": true,
  "diff": true
}
```

#### 2.2 Supertest for API Testing
```bash
# Install Supertest
npm install --save-dev supertest @types/supertest
npm install --save-dev nock # For mocking external APIs
npm install --save-dev node-mocks-http
```

**Test Helper: `test/helpers/api-test-helper.ts`**
```typescript
import supertest from 'supertest';
import { app } from '../../src/app';
import jwt from 'jsonwebtoken';

export class ApiTestHelper {
  public request = supertest(app);
  private authToken: string;

  async authenticate(role: string = 'user') {
    this.authToken = jwt.sign(
      { id: 'test-user', role },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );
    return this.authToken;
  }

  getAuthHeader() {
    return { Authorization: `Bearer ${this.authToken}` };
  }

  async cleanupDatabase() {
    // Database cleanup logic
  }

  async seedDatabase() {
    // Database seeding logic
  }
}
```

#### 2.3 Newman for Postman Collections
```bash
# Install Newman globally
npm install -g newman

# Install Newman as dev dependency
npm install --save-dev newman newman-reporter-htmlextra

# Install additional reporters
npm install --save-dev newman-reporter-json newman-reporter-junit
```

**Newman Configuration Script: `scripts/run-postman-tests.js`**
```javascript
const newman = require('newman');

newman.run({
  collection: require('./postman/Monay-Enterprise-Wallet.postman_collection.json'),
  environment: require('./postman/Local.postman_environment.json'),
  reporters: ['cli', 'htmlextra', 'junit'],
  reporter: {
    htmlextra: {
      export: './test-results/postman/report.html',
      showOnlyFails: false,
      showEnvironmentData: true,
      showGlobalData: true
    },
    junit: {
      export: './test-results/postman/junit.xml'
    }
  },
  bail: false,
  insecure: true,
  timeout: 180000,
  timeoutRequest: 10000,
  timeoutScript: 5000,
  delayRequest: 0,
  iterationCount: 1,
  color: true,
  suppressExitCode: false
}, (err) => {
  if (err) {
    console.error('Newman run failed:', err);
    process.exit(1);
  }
  console.log('Newman run complete!');
});
```

---

### 3. Blockchain Testing Stack

#### 3.1 Hardhat for Smart Contract Testing
```bash
# Install Hardhat
npm install --save-dev hardhat @nomiclabs/hardhat-ethers @nomiclabs/hardhat-waffle
npm install --save-dev ethereum-waffle chai ethers

# Install plugins
npm install --save-dev hardhat-gas-reporter solidity-coverage
npm install --save-dev @nomiclabs/hardhat-etherscan hardhat-contract-sizer
```

**Configuration: `hardhat.config.ts`**
```typescript
import { HardhatUserConfig } from 'hardhat/config';
import '@nomiclabs/hardhat-ethers';
import '@nomiclabs/hardhat-waffle';
import 'hardhat-gas-reporter';
import 'solidity-coverage';
import 'hardhat-contract-sizer';
import '@nomiclabs/hardhat-etherscan';

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.20',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    hardhat: {
      chainId: 1337,
      forking: {
        url: process.env.MAINNET_RPC_URL || '',
        blockNumber: 18000000
      },
      accounts: {
        count: 20,
        accountsBalance: '10000000000000000000000' // 10,000 ETH
      }
    },
    localhost: {
      url: 'http://localhost:8545',
      chainId: 1337
    },
    testnet: {
      url: process.env.TESTNET_RPC_URL || '',
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 84531 // Base Goerli
    }
  },
  gasReporter: {
    enabled: true,
    currency: 'USD',
    gasPrice: 30,
    coinmarketcap: process.env.COINMARKETCAP_API_KEY
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  },
  contractSizer: {
    alphaSort: true,
    runOnCompile: true,
    disambiguatePaths: false
  }
};

export default config;
```

#### 3.2 Anchor for Solana Testing
```bash
# Install Anchor
npm install --save-dev @project-serum/anchor @solana/web3.js
npm install --save-dev @solana/spl-token @solana/spl-token-registry

# Install testing utilities
npm install --save-dev @solana/web3.js @solana/buffer-layout
```

**Anchor Test Configuration: `Anchor.toml`**
```toml
[features]
seeds = false
skip-lint = false

[programs.localnet]
monay_program = "MonayTokenProgramV1111111111111111111111111"

[registry]
url = "https://api.apr.dev"

[provider]
cluster = "localnet"
wallet = "~/.config/solana/id.json"

[scripts]
test = "yarn run ts-mocha -p ./tsconfig.json -t 1000000 tests/**/*.ts"

[test]
startup_wait = 10000
```

---

### 4. Performance Testing Stack

#### 4.1 K6 for Load Testing
```bash
# Install K6 (MacOS)
brew install k6

# Or download binary
# https://k6.io/docs/getting-started/installation/
```

**K6 Test Script: `k6/load-test.js`**
```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export let options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up to 100 users
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 200 }, // Ramp up to 200 users
    { duration: '5m', target: 200 }, // Stay at 200 users
    { duration: '2m', target: 0 },   // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests under 500ms
    errors: ['rate<0.01'],             // Error rate under 1%
    http_req_failed: ['rate<0.05']     // Failed requests under 5%
  }
};

const BASE_URL = 'http://localhost:3001';

export default function() {
  // Login
  let loginRes = http.post(`${BASE_URL}/api/auth/login`, JSON.stringify({
    email: 'test@monay.com',
    password: 'TestPassword123!'
  }), {
    headers: { 'Content-Type': 'application/json' }
  });

  check(loginRes, {
    'login successful': (r) => r.status === 200,
    'token received': (r) => r.json('token') !== undefined
  });

  errorRate.add(loginRes.status !== 200);

  if (loginRes.status === 200) {
    const token = loginRes.json('token');
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // Get invoices
    let invoicesRes = http.get(`${BASE_URL}/api/invoice-wallets`, { headers });
    check(invoicesRes, {
      'invoices fetched': (r) => r.status === 200
    });

    // Create invoice
    let createRes = http.post(`${BASE_URL}/api/invoice-wallets`, JSON.stringify({
      amount: 1000,
      currency: 'USD',
      description: 'Load test invoice'
    }), { headers });

    check(createRes, {
      'invoice created': (r) => r.status === 201
    });
  }

  sleep(1);
}
```

#### 4.2 Artillery for Stress Testing
```bash
# Install Artillery
npm install --save-dev artillery artillery-plugin-expect
npm install --save-dev artillery-plugin-metrics-by-endpoint
```

**Artillery Configuration: `artillery.yml`**
```yaml
config:
  target: "http://localhost:3001"
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Warm up"
    - duration: 300
      arrivalRate: 50
      name: "Sustained load"
    - duration: 60
      arrivalRate: 100
      name: "Stress test"
  payload:
    path: "./test-data/users.csv"
    fields:
      - "email"
      - "password"
  plugins:
    expect:
      outputFormat: "json"
    metrics-by-endpoint: {}
  processor: "./processors/custom-processor.js"

scenarios:
  - name: "User Login and Create Invoice"
    flow:
      - post:
          url: "/api/auth/login"
          json:
            email: "{{ email }}"
            password: "{{ password }}"
          capture:
            - json: "$.token"
              as: "authToken"
          expect:
            - statusCode: 200

      - get:
          url: "/api/invoice-wallets"
          headers:
            Authorization: "Bearer {{ authToken }}"
          expect:
            - statusCode: 200
            - hasProperty: "data"

      - post:
          url: "/api/invoice-wallets"
          headers:
            Authorization: "Bearer {{ authToken }}"
          json:
            amount: 1000
            currency: "USD"
            customer_email: "customer@example.com"
          expect:
            - statusCode: 201

      - think: 5
```

---

### 5. Security Testing Stack

#### 5.1 OWASP ZAP Setup
```bash
# Install OWASP ZAP (MacOS)
brew install --cask owasp-zap

# Or download from https://www.zaproxy.org/download/
```

**ZAP Automation Script: `security/zap-scan.sh`**
```bash
#!/bin/bash

# Start ZAP in daemon mode
zap.sh -daemon -port 8090 -config api.key=your-api-key &
ZAP_PID=$!

# Wait for ZAP to start
sleep 10

# Run baseline scan
docker run -t owasp/zap2docker-stable zap-baseline.py \
  -t http://localhost:3007 \
  -r zap-report.html \
  -J zap-report.json \
  -x zap-report.xml

# Run API scan
docker run -t owasp/zap2docker-stable zap-api-scan.py \
  -t http://localhost:3001/api/openapi.json \
  -f openapi \
  -r api-scan-report.html

# Kill ZAP daemon
kill $ZAP_PID
```

#### 5.2 Smart Contract Security Tools
```bash
# Install Slither
pip install slither-analyzer

# Install Mythril
pip install mythril

# Install Echidna (Fuzzer)
brew install echidna
```

**Slither Configuration: `slither.config.json`**
```json
{
  "detectors_to_run": [
    "reentrancy-eth",
    "uninitialized-state",
    "suicidal",
    "arbitrary-send",
    "controlled-delegatecall",
    "unchecked-transfer",
    "locked-ether"
  ],
  "printers_to_run": ["human-summary", "contract-summary"],
  "exclude_informational": false,
  "exclude_low": false,
  "exclude_medium": false,
  "exclude_high": false,
  "exclude_optimization": false,
  "filter_paths": "node_modules",
  "legacy_ast": false,
  "compile_force_framework": "hardhat"
}
```

---

### 6. Database Testing Tools

#### 6.1 Database Migration Testing
```bash
# Install database testing tools
npm install --save-dev pg-mem knex-mock-client
npm install --save-dev @databases/pg @databases/pg-test
```

**Database Test Helper: `test/helpers/db-test-helper.ts`**
```typescript
import { Client } from 'pg';
import { migrate } from '../src/db/migrations';

export class DatabaseTestHelper {
  private client: Client;
  private testDbName: string;

  constructor() {
    this.testDbName = `test_db_${Date.now()}`;
  }

  async setup() {
    // Create test database
    this.client = new Client({
      host: 'localhost',
      port: 5432,
      user: 'postgres',
      password: 'postgres',
      database: 'postgres'
    });

    await this.client.connect();
    await this.client.query(`CREATE DATABASE ${this.testDbName}`);

    // Run migrations
    await migrate({
      database: this.testDbName,
      host: 'localhost',
      port: 5432,
      user: 'postgres',
      password: 'postgres'
    });
  }

  async teardown() {
    await this.client.query(`DROP DATABASE IF EXISTS ${this.testDbName}`);
    await this.client.end();
  }

  async seed(data: any) {
    // Seed test data
  }

  async clear() {
    // Clear all tables
  }

  getConnectionString() {
    return `postgresql://postgres:postgres@localhost:5432/${this.testDbName}`;
  }
}
```

---

### 7. Monitoring & Reporting Tools

#### 7.1 Test Coverage Setup
```bash
# Install coverage tools
npm install --save-dev nyc @istanbuljs/nyc-config-typescript
npm install --save-dev codecov coveralls
```

**NYC Configuration: `.nycrc.json`**
```json
{
  "extends": "@istanbuljs/nyc-config-typescript",
  "all": true,
  "check-coverage": true,
  "reporter": ["text", "lcov", "html", "json"],
  "report-dir": "./coverage",
  "lines": 80,
  "statements": 80,
  "functions": 80,
  "branches": 80,
  "include": ["src/**/*.ts", "src/**/*.tsx"],
  "exclude": [
    "**/*.d.ts",
    "**/*.spec.ts",
    "**/*.test.ts",
    "**/test/**",
    "**/coverage/**",
    "**/node_modules/**"
  ],
  "watermarks": {
    "lines": [80, 95],
    "functions": [80, 95],
    "branches": [80, 95],
    "statements": [80, 95]
  }
}
```

#### 7.2 Test Reporting Dashboard
```bash
# Install Allure for test reporting
npm install --save-dev allure-commandline allure-js-commons
npm install --save-dev @wdio/allure-reporter jest-allure
```

**Allure Configuration: `allure.config.js`**
```javascript
module.exports = {
  resultsDir: './allure-results',
  reportDir: './allure-report',
  categories: [
    {
      name: 'Product defects',
      matchedStatuses: ['failed'],
      messageRegex: '.*AssertionError.*'
    },
    {
      name: 'Test defects',
      matchedStatuses: ['failed'],
      messageRegex: '.*TypeError.*'
    },
    {
      name: 'Flaky tests',
      matchedStatuses: ['passed', 'failed'],
      messageRegex: '.*Timeout.*'
    }
  ],
  environmentInfo: {
    'Node Version': process.version,
    'Test Environment': process.env.NODE_ENV || 'test',
    'API URL': process.env.API_URL || 'http://localhost:3001',
    'Frontend URL': process.env.FRONTEND_URL || 'http://localhost:3007'
  }
};
```

---

## 📝 NPM Scripts Configuration

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "test": "npm run test:unit && npm run test:integration && npm run test:e2e",
    "test:unit": "jest --coverage",
    "test:integration": "mocha --config .mocharc.json",
    "test:e2e": "cypress run",
    "test:e2e:open": "cypress open",
    "test:playwright": "playwright test",
    "test:playwright:ui": "playwright test --ui",
    "test:api": "newman run ./postman/collection.json -e ./postman/environment.json",
    "test:contracts": "hardhat test",
    "test:contracts:coverage": "hardhat coverage",
    "test:security": "./security/zap-scan.sh",
    "test:load": "k6 run k6/load-test.js",
    "test:stress": "artillery run artillery.yml",
    "test:coverage": "nyc npm test",
    "test:report": "allure generate allure-results --clean -o allure-report && allure open allure-report",
    "test:watch": "jest --watch",
    "test:debug": "node --inspect-brk ./node_modules/.bin/jest --runInBand",
    "test:mutation": "stryker run",
    "lint:test": "eslint 'test/**/*.{ts,tsx}' 'src/**/*.{spec,test}.{ts,tsx}'",
    "db:test:setup": "node scripts/setup-test-db.js",
    "db:test:teardown": "node scripts/teardown-test-db.js"
  }
}
```

---

## 🐳 Docker Compose for Test Environment

Create `docker-compose.test.yml`:

```yaml
version: '3.8'

services:
  postgres-test:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: monay_test
    ports:
      - "5433:5432"
    volumes:
      - postgres-test-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis-test:
    image: redis:7-alpine
    ports:
      - "6380:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 5

  localstack:
    image: localstack/localstack:latest
    ports:
      - "4566:4566"
    environment:
      - SERVICES=s3,dynamodb,lambda,sqs,sns
      - DEBUG=1
      - DATA_DIR=/tmp/localstack/data
    volumes:
      - localstack-data:/tmp/localstack
      - /var/run/docker.sock:/var/run/docker.sock

  hardhat-node:
    build:
      context: .
      dockerfile: Dockerfile.hardhat
    ports:
      - "8545:8545"
    command: npx hardhat node --hostname 0.0.0.0
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8545"]
      interval: 5s
      timeout: 3s
      retries: 5

  solana-validator:
    image: solanalabs/solana:latest
    ports:
      - "8899:8899"
      - "8900:8900"
      - "9900:9900"
    command: solana-test-validator
    healthcheck:
      test: ["CMD", "solana", "cluster-version"]
      interval: 5s
      timeout: 3s
      retries: 5

  wiremock:
    image: wiremock/wiremock:latest
    ports:
      - "8080:8080"
    volumes:
      - ./test/mocks:/home/wiremock
    command: --verbose --global-response-templating

  mailhog:
    image: mailhog/mailhog:latest
    ports:
      - "1025:1025"
      - "8025:8025"

volumes:
  postgres-test-data:
  localstack-data:
```

---

## 🚀 Quick Start Testing Guide

### Step 1: Install All Dependencies
```bash
# Install all testing dependencies
npm run install:test-deps

# or manually
npm install --save-dev \
  jest @testing-library/react cypress playwright \
  mocha chai sinon supertest \
  hardhat k6 artillery \
  nyc allure-commandline
```

### Step 2: Setup Test Environment
```bash
# Start test services
docker-compose -f docker-compose.test.yml up -d

# Setup test database
npm run db:test:setup

# Compile contracts
npx hardhat compile
```

### Step 3: Run Tests
```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit        # Unit tests
npm run test:integration # Integration tests
npm run test:e2e         # End-to-end tests
npm run test:contracts   # Smart contract tests
npm run test:load        # Load tests
npm run test:security    # Security scans
```

### Step 4: Generate Reports
```bash
# Generate coverage report
npm run test:coverage

# Generate Allure report
npm run test:report

# Open coverage in browser
open coverage/index.html

# Open Allure report
allure open allure-report
```

---

## 🔧 CI/CD Integration

### GitHub Actions Workflow
Create `.github/workflows/test.yml`:

```yaml
name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run type check
        run: npm run type-check

      - name: Run unit tests
        run: npm run test:unit

      - name: Run integration tests
        run: npm run test:integration

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Run contract tests
        run: npm run test:contracts

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info

      - name: Upload test reports
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: test-reports
          path: |
            coverage/
            test-results/
            allure-report/
```

---

## 📊 Test Metrics & KPIs

### Key Metrics to Track
1. **Code Coverage**: Minimum 80% overall
2. **Test Execution Time**: < 10 minutes for full suite
3. **Flaky Test Rate**: < 2%
4. **Test Success Rate**: > 98%
5. **API Response Time**: P95 < 500ms
6. **Load Test Throughput**: > 1000 TPS
7. **Security Vulnerabilities**: 0 critical, < 5 high

### Monitoring Dashboard
Use tools like Grafana or DataDog to track:
- Test execution trends
- Coverage changes over time
- Performance degradation
- Flaky test patterns
- Build success rates

---

## 📚 Additional Resources

### Documentation
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Cypress Best Practices](https://docs.cypress.io/guides/references/best-practices)
- [Playwright Guide](https://playwright.dev/docs/intro)
- [Hardhat Testing](https://hardhat.org/tutorial/testing-contracts)
- [K6 Documentation](https://k6.io/docs/)

### Tutorials
- [Testing React Applications](https://www.robinwieruch.de/react-testing-library/)
- [API Testing with Supertest](https://github.com/visionmedia/supertest)
- [Smart Contract Testing](https://ethereum-waffle.readthedocs.io/)
- [Load Testing Best Practices](https://k6.io/docs/test-authoring/test-builder/)

---

**Version**: 1.0.0
**Last Updated**: January 21, 2025
**Next Review**: February 1, 2025
**Maintained By**: QA Team