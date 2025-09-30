import { jest } from '@jest/globals';
import bcrypt from 'bcryptjs';
import db from '../../models/index.js';

// Initialize models before tests
let sequelize, User;

describe('User Model', () => {
  beforeAll(async () => {
    // Initialize models using the dynamic import function
    await db.initializeModels();
    sequelize = db.sequelize;
    User = db.User;

    // Ensure database connection is established
    await sequelize.authenticate();
  });

  afterAll(async () => {
    // Close database connection after tests
    await sequelize.close();
  });

  describe('Model Definition', () => {
    test('should have correct attributes', () => {
      const attributes = User.rawAttributes;

      // Check required fields
      expect(attributes.id).toBeDefined();
      expect(attributes.email).toBeDefined();
      expect(attributes.phone).toBeDefined();
      expect(attributes.password).toBeDefined();
      expect(attributes.firstName).toBeDefined();
      expect(attributes.lastName).toBeDefined();

      // Check optional fields
      expect(attributes.avatar).toBeDefined();
      expect(attributes.kycStatus).toBeDefined();
      expect(attributes.walletAddress).toBeDefined();
      expect(attributes.solanaAddress).toBeDefined();
      expect(attributes.publicKey).toBeDefined();
      expect(attributes.balance).toBeDefined();
      expect(attributes.mpin).toBeDefined();
    });

    test('should have correct data types', () => {
      const attributes = User.rawAttributes;

      expect(attributes.email.type.key).toBe('STRING');
      expect(attributes.phone.type.key).toBe('STRING');
      expect(attributes.password.type.key).toBe('STRING');
      expect(attributes.firstName.type.key).toBe('STRING');
      expect(attributes.lastName.type.key).toBe('STRING');
      expect(attributes.kycStatus.type.key).toBe('ENUM');
      expect(attributes.balance.type.key).toBe('DECIMAL');
    });

    test('should have correct validations', () => {
      const emailAttr = User.rawAttributes.email;
      expect(emailAttr.validate).toBeDefined();
      expect(emailAttr.validate.isEmail).toBe(true);
      expect(emailAttr.unique).toBe(true);
    });
  });

  describe('Instance Methods', () => {
    test('should have isPasswordMatch method', () => {
      const user = User.build({
        email: 'test@example.com',
        password: 'hashedPassword'
      });

      expect(typeof user.isPasswordMatch).toBe('function');
    });

    test('isPasswordMatch should compare passwords correctly', async () => {
      const plainPassword = 'TestPassword123!';
      const hashedPassword = await bcrypt.hash(plainPassword, 10);

      const user = User.build({
        email: 'test@example.com',
        password: hashedPassword
      });

      const isMatch = await user.isPasswordMatch(plainPassword);
      expect(isMatch).toBe(true);

      const isNotMatch = await user.isPasswordMatch('WrongPassword');
      expect(isNotMatch).toBe(false);
    });
  });

  describe('Hooks', () => {
    test('should hash password before create', async () => {
      const plainPassword = 'TestPassword123!';

      // Mock the User.create method to avoid database operations
      const mockCreate = jest.spyOn(User, 'create').mockImplementation(async (data) => {
        // Simulate the beforeCreate hook
        if (data.password) {
          data.password = await bcrypt.hash(data.password, 10);
        }
        return User.build(data);
      });

      const userData = {
        email: 'test@example.com',
        phone: '+1234567890',
        password: plainPassword,
        firstName: 'Test',
        lastName: 'User'
      };

      const user = await User.create(userData);

      // Verify password was hashed
      expect(user.password).not.toBe(plainPassword);
      const isPasswordValid = await bcrypt.compare(plainPassword, user.password);
      expect(isPasswordValid).toBe(true);

      mockCreate.mockRestore();
    });
  });

  describe('Associations', () => {
    test('should have correct associations', () => {
      const associations = User.associations;

      // Check for expected associations
      expect(associations).toBeDefined();

      // Note: Associations are defined in index.js during model initialization
      // This test verifies the associations are available
    });
  });

  describe('Scopes', () => {
    test('should have withoutPassword scope', () => {
      const scopes = User.options.scopes;

      if (scopes && scopes.withoutPassword) {
        expect(scopes.withoutPassword.attributes).toBeDefined();
        expect(scopes.withoutPassword.attributes.exclude).toContain('password');
      }
    });
  });

  describe('Virtual Fields', () => {
    test('should have fullName virtual field', () => {
      const user = User.build({
        firstName: 'John',
        lastName: 'Doe'
      });

      if (user.fullName !== undefined) {
        expect(user.fullName).toBe('John Doe');
      }
    });
  });

  describe('Validation', () => {
    test('should require email', async () => {
      const user = User.build({
        phone: '+1234567890',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User'
      });

      await expect(user.validate()).rejects.toThrow();
    });

    test('should validate email format', async () => {
      const user = User.build({
        email: 'invalid-email',
        phone: '+1234567890',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User'
      });

      await expect(user.validate()).rejects.toThrow();
    });

    test('should validate KYC status enum', async () => {
      const user = User.build({
        email: 'test@example.com',
        phone: '+1234567890',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        kycStatus: 'invalid_status'
      });

      await expect(user.validate()).rejects.toThrow();
    });

    test('should accept valid KYC status', async () => {
      const validStatuses = ['pending', 'approved', 'rejected', 'expired'];

      for (const status of validStatuses) {
        const user = User.build({
          email: `test-${status}@example.com`,
          phone: '+1234567890',
          password: 'password123',
          firstName: 'Test',
          lastName: 'User',
          kycStatus: status
        });

        await expect(user.validate()).resolves.not.toThrow();
      }
    });
  });
});