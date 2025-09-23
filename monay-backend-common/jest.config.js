module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.(js|jsx)?$': 'babel-jest'
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(uuid|ethers|@solana)/)'
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^uuid$': '<rootDir>/node_modules/uuid/dist/index.js'
  },
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
  testTimeout: 30000
};