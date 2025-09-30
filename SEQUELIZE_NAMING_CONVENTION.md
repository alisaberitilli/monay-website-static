# Sequelize Naming Convention Configuration

## Global Solution for camelCase (JS) vs snake_case (DB) Field Names

This document provides the standardized configuration for handling the camelCase to snake_case conversion across all Monay projects using Sequelize.

## The Problem
- JavaScript/TypeScript convention: `camelCase` (e.g., `userId`, `createdAt`, `phoneNumber`)
- Database convention: `snake_case` (e.g., `user_id`, `created_at`, `phone_number`)
- Manual conversion is error-prone and tedious

## The Solution

### 1. Global Sequelize Configuration

Add this configuration when initializing Sequelize in your main database configuration file:

```javascript
// src/models/index.js or src/config/database.js

import { Sequelize, DataTypes } from 'sequelize';

const sequelize = new Sequelize(dbConfig.db, dbConfig.user, dbConfig.password, {
  host: dbConfig.host,
  port: dbConfig.port,
  dialect: 'postgres',
  define: {
    // Global naming convention settings
    underscored: true,              // Auto-convert camelCase to snake_case
    timestamps: true,                // Enable timestamps
    createdAt: 'created_at',         // Map createdAt to created_at
    updatedAt: 'updated_at',         // Map updatedAt to updated_at
    freezeTableName: false,          // Pluralize table names by default

    // Optional: Add these for complete control
    paranoid: false,                 // Don't use soft deletes by default
    underscoredAll: true,            // Apply to all attributes

    // Field naming hooks (optional - for custom logic)
    hooks: {
      beforeDefine: (columns, model) => {
        // Custom logic if needed for specific fields
      }
    }
  }
});
```

### 2. Model Definition

When defining models, you can now use camelCase naturally:

```javascript
// src/models/User.js

export default (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    // Use camelCase in JavaScript
    userId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      // Sequelize will automatically map to 'user_id' in DB
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      // Maps to 'first_name' in DB
    },
    phoneNumber: {
      type: DataTypes.STRING,
      // Maps to 'phone_number' in DB
    },
    emailVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      // Maps to 'email_verified' in DB
    }
  }, {
    // Model-specific options (if needed to override global)
    // underscored: true is inherited from global config
    tableName: 'users',  // Explicit table name if needed
  });

  return User;
};
```

### 3. Using Models in Code

```javascript
// In your application code, use camelCase naturally

// Creating a user
const user = await User.create({
  firstName: 'John',
  lastName: 'Doe',
  phoneNumber: '+1234567890',
  emailVerified: true
});

// Querying - use camelCase
const verifiedUsers = await User.findAll({
  where: {
    emailVerified: true,  // Not email_verified
    phoneNumber: {
      [Op.ne]: null
    }
  }
});

// Accessing properties - camelCase
console.log(user.firstName);  // Not first_name
console.log(user.createdAt);  // Not created_at
```

### 4. Raw Queries (When Needed)

If you need to write raw SQL, remember the database uses snake_case:

```javascript
// Raw query - use snake_case
const results = await sequelize.query(
  'SELECT user_id, first_name, phone_number FROM users WHERE email_verified = true',
  { type: QueryTypes.SELECT }
);

// Results will still be in snake_case for raw queries
// Consider using a transformer if needed
```

### 5. Migration Files

Migrations should use snake_case since they interact directly with the database:

```javascript
// migrations/20240101000000-create-user.js

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('users', {
      user_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      first_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      phone_number: {
        type: Sequelize.STRING
      },
      email_verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('users');
  }
};
```

## Special Cases

### 1. When NOT to Use Automatic Conversion

Some fields might already match or have special requirements:

```javascript
const Model = sequelize.define('Model', {
  // Field that's already compliant (same in both cases)
  id: {
    type: DataTypes.INTEGER,
    field: 'id'  // Explicitly specify when needed
  },

  // Custom mapping for legacy databases
  mySpecialField: {
    type: DataTypes.STRING,
    field: 'legacy_field_name'  // Override automatic conversion
  }
}, {
  // Can disable for specific model if needed
  // underscored: false
});
```

### 2. Associations

Associations will also follow the naming convention:

```javascript
// Associations use camelCase in JavaScript
User.hasMany(Post, {
  foreignKey: 'userId',  // Will map to 'user_id' in DB
  as: 'posts'
});

Post.belongsTo(User, {
  foreignKey: 'userId',  // Will map to 'user_id' in DB
  as: 'author'
});
```

## Implementation Checklist

When applying this to a project:

1. ✅ Update Sequelize initialization with global `define` settings
2. ✅ Remove individual `underscored: true/false` from model definitions (unless specifically needed)
3. ✅ Update model attributes to use camelCase
4. ✅ Update all queries and data access to use camelCase
5. ✅ Keep migrations using snake_case
6. ✅ Test thoroughly to ensure proper mapping

## Benefits

1. **Consistency**: JavaScript code uses JavaScript conventions
2. **Database Compliance**: Database follows SQL conventions
3. **No Manual Conversion**: Sequelize handles the transformation
4. **Reduced Errors**: No more typos from manual snake_case conversion
5. **Better IDE Support**: camelCase works better with TypeScript and autocomplete

## Migration Script

To update existing models to use this convention:

```bash
# Run the existing script in monay-backend-common
node scripts/update-models-camelcase.js
```

## TypeScript Support

For TypeScript projects, define your interfaces using camelCase:

```typescript
interface UserAttributes {
  userId?: number;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  emailVerified: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Model definition uses the same interface
class User extends Model<UserAttributes> implements UserAttributes {
  public userId!: number;
  public firstName!: string;
  public lastName!: string;
  public phoneNumber?: string;
  public emailVerified!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}
```

## Important Notes

1. **This is a one-time setup** - Once configured globally, all models inherit this behavior
2. **Existing data is not affected** - This only affects how Sequelize maps field names
3. **Raw queries still use snake_case** - When writing raw SQL, use database column names
4. **GraphQL/REST APIs** - Your APIs can now consistently use camelCase
5. **No Prisma conversion needed** - Unlike Prisma, Sequelize handles this automatically

## Testing

Always test the naming convention with a simple query:

```javascript
// Test query
const testUser = await User.create({
  firstName: 'Test',
  lastName: 'User'
});

// Check database directly
// SELECT * FROM users WHERE user_id = 1;
// Should show: first_name='Test', last_name='User'

// Check JavaScript access
console.log(testUser.firstName); // Should work
console.log(testUser.first_name); // Should be undefined
```

---

**Last Updated**: January 2025
**Status**: Active Configuration
**Applies To**: All Sequelize-based projects in Monay ecosystem