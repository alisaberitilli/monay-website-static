export default {
  testEnvironment: 'node',
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  transform: {}, // No transform needed for native ES modules
  transformIgnorePatterns: [
    '/node_modules/(?!(uuid|ethers|@solana)/)'
  ],
  roots: ['<rootDir>/src'],
  testMatch: [
    '**/__tests__/**/*.{js,ts}',
    '**/*.{spec,test}.{js,ts}'
  ],
  collectCoverageFrom: [
    'src/**/*.{js,ts}',
    '!src/**/*.d.ts',
    '!src/**/index.{js,ts}',
    '!src/migrations/**'
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testTimeout: 30000,
  testEnvironmentOptions: {
    experimental: {
      vm: {
        modules: true
      }
    }
  }
};