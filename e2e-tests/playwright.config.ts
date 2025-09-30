import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false, // Run tests sequentially for this flow
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Single worker for sequential flow
  reporter: [
    ['html'],
    ['line'],
    ['json', { outputFile: 'test-results.json' }]
  ],

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',

    // Extended timeout for complex flows
    actionTimeout: 30000,
    navigationTimeout: 30000,
  },

  timeout: 120000, // 2 minutes per test

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Store session data for cross-app testing
        storageState: undefined,
        viewport: { width: 1920, height: 1080 }
      },
    },
  ],

  // Define multiple base URLs for different apps
  use: {
    // Custom context options for multi-app testing
    contextOptions: {
      ignoreHTTPSErrors: true,
      permissions: ['clipboard-read', 'clipboard-write'],
    }
  },

  webServer: [
    {
      command: 'cd ../monay-backend-common && npm run dev',
      port: 3001,
      reuseExistingServer: true,
      timeout: 120000,
    },
    {
      command: 'cd ../monay-admin && npm run dev',
      port: 3002,
      reuseExistingServer: true,
      timeout: 120000,
    },
    {
      command: 'cd ../monay-cross-platform/web && npm run dev',
      port: 3003,
      reuseExistingServer: true,
      timeout: 120000,
    },
    {
      command: 'cd ../monay-caas/monay-enterprise-wallet && npm run dev',
      port: 3007,
      reuseExistingServer: true,
      timeout: 120000,
    }
  ],
});