// Load test environment variables
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { jest } from '@jest/globals';
import jsonwebtoken from 'jsonwebtoken';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.test file
dotenv.config({ path: path.resolve(__dirname, '.env.test') });

// Set up test environment variables
process.env.NODE_ENV = 'test';

// Mock uuid to avoid ES module issues
jest.mock('uuid', () => ({
  v4: () => 'test-uuid-' + Math.random().toString(36).substr(2, 9),
  v1: () => 'test-v1-uuid',
  v5: () => 'test-v5-uuid',
  validate: () => true,
  version: () => 4
}));

// Mock ethers
jest.mock('ethers', () => ({
  ethers: {
    providers: {
      JsonRpcProvider: jest.fn()
    },
    Wallet: jest.fn(),
    Contract: jest.fn(),
    utils: {
      parseEther: jest.fn(),
      formatEther: jest.fn()
    }
  }
}));

// Mock Solana web3
jest.mock('@solana/web3.js', () => ({
  Connection: jest.fn(),
  PublicKey: jest.fn(),
  Keypair: jest.fn(),
  Transaction: jest.fn(),
  SystemProgram: {
    transfer: jest.fn()
  }
}));
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://test:test@localhost:5432/monay_test';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.PORT = '3001';

// Mock external services - will be added when services exist
// jest.mock('./src/services/email.service', () => ({
//   sendEmail: jest.fn().mockResolvedValue(true),
//   sendVerificationEmail: jest.fn().mockResolvedValue(true),
//   sendTransactionEmail: jest.fn().mockResolvedValue(true)
// }));

// jest.mock('./src/services/sms.service', () => ({
//   sendSMS: jest.fn().mockResolvedValue(true),
//   sendOTP: jest.fn().mockResolvedValue(true)
// }));

// Set longer timeout for database operations
jest.setTimeout(30000);

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});

// Global test utilities
global.testUtils = {
  generateAuthToken: (userId) => {
    return jsonwebtoken.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
  },

  createMockRequest: (overrides = {}) => ({
    body: {},
    params: {},
    query: {},
    headers: {},
    user: null,
    ...overrides
  }),

  createMockResponse: () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    res.end = jest.fn().mockReturnValue(res);
    return res;
  },

  createMockNext: () => jest.fn()
};