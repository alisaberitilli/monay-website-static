import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3007',
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    videosFolder: 'cypress/videos',
    screenshotsFolder: 'cypress/screenshots',
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    setupNodeEvents(on, config) {
      // implement node event listeners here
      on('task', {
        log(message) {
          console.log(message);
          return null;
        },
        clearDb() {
          // Add database cleanup logic here
          return null;
        },
        seedDb() {
          // Add database seeding logic here
          return null;
        }
      });

      // Load environment variables
      config.env = {
        ...config.env,
        API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
        TEST_USER_EMAIL: 'cypress@monay.com',
        TEST_USER_PASSWORD: 'CypressTest123!@#'
      };

      return config;
    },
    experimentalStudio: true,
    retries: {
      runMode: 2,
      openMode: 0
    }
  },

  component: {
    devServer: {
      framework: 'next',
      bundler: 'webpack',
    },
    specPattern: 'cypress/component/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/component.ts'
  }
});