# Monay Backend Common - Centralized API Service

## 🚨 CRITICAL DATABASE SAFETY WARNING 🚨

### ⛔ ABSOLUTELY FORBIDDEN DATABASE OPERATIONS ⛔
```sql
-- THESE COMMANDS WILL DESTROY THE SHARED DATABASE - NEVER USE THEM:
DROP TABLE ...         -- FORBIDDEN - Will break ALL applications
DROP DATABASE ...      -- FORBIDDEN - Will destroy entire system
DROP SCHEMA ...        -- FORBIDDEN - Will corrupt database
TRUNCATE TABLE ...     -- FORBIDDEN - Will lose all data
DELETE FROM ...        -- FORBIDDEN (without WHERE clause)
ALTER TABLE ... DROP   -- FORBIDDEN - Will break schema
PURGE ...             -- FORBIDDEN - Will destroy data
```

### ✅ DATABASE SAFETY RULES
1. **SINGLE SHARED DATABASE**: This backend serves Admin, CaaS, and Consumer Wallet - they ALL share ONE database
2. **NO STRUCTURAL CHANGES**: Database schema is FROZEN - no migrations that drop/alter structure
3. **BACKUP FIRST**: Always backup before ANY data operation
4. **USE TRANSACTIONS**: Wrap ALL modifications in BEGIN/COMMIT/ROLLBACK
5. **TEST FIRST**: Test all queries in development environment
6. **RECOVERY AVAILABLE**: Emergency recovery at `/migrations/DATABASE_RECOVERY_SCRIPT.sh`

## 🔧 DEVELOPMENT PRINCIPLES

### ⚠️ NEVER REMOVE FUNCTIONALITY TO PASS TESTS ⚠️
**Established: January 2025**

When encountering errors:
1. **FIX, DON'T REMOVE**: Always fix the underlying issue rather than commenting out functionality
2. **DATABASE FIELD MAPPING**: When Sequelize model fields don't match database columns:
   - Add the missing column: `ALTER TABLE users ADD COLUMN IF NOT EXISTS mpin VARCHAR(255);`
   - Or map to correct column: `field: 'database_column_name'`
   - Or use VIRTUAL fields for computed values
3. **NO SHORTCUTS**: Fix errors properly and move forward
4. **MAINTAIN ALL FEATURES**: Every existing feature must remain functional

**Example Field Mappings:**
```javascript
// In User.js model
firstName: { type: DataTypes.STRING, field: 'first_name' },
lastName: { type: DataTypes.STRING, field: 'last_name' },
mobile: { type: DataTypes.STRING, field: 'phone' },
password: { type: DataTypes.STRING, field: 'password_hash' },
mpin: { type: DataTypes.STRING }  // Added column when field was missing
```

### 🛡️ MIDDLEWARE ARCHITECTURE (FINANCIAL SYSTEM SAFETY)
**🎉 CONFUSION SOLVED: September 29, 2025 - DIRECTORY RENAMING COMPLETED 🎉**

**✅ PROBLEM ELIMINATED!** Directories have been renamed for crystal-clear purpose:
- **`src/middleware-core/`** (4 files) - System-critical, security-sensitive implementations
- **`src/middleware-app/`** (27 files) - Application business logic and features

**NEW GOLDEN RULE**: **Use purpose-specific directory names - no more confusion!**

#### 📋 Quick Decision Tree for Developers

**When working on any route file:**

1. **Check current imports**: `grep -n "import.*middleware" src/routes/your-file.js`

2. **Apply NEW directory strategy**:
   - **System/security functions** → Use `middleware-core/`
   - **Business logic** → Use `middleware-app/`
   - **Broken old paths** → ✅ Fix immediately
   - **New files** → ✅ Always use purpose-specific directories

3. **Directory purpose guide**:
   ```
   middleware-core/: audit.js, tenant-isolation.js, mfa.js, auth.js
   middleware-app/: validate.js, rate-limiter.js, user.js, payment-request.js
   ```

4. **Example new import patterns**:
   ```javascript
   // Core system functions
   import { auditAction } from '../middleware-core/audit.js';

   // Application business logic
   import { validateRequest } from '../middleware-app/validate-middleware.js';
   ```

#### 🔧 Emergency Fix Protocol

**Broken import found?**
```javascript
// ❌ BROKEN (file doesn't exist)
import { validateRequest } from '../middleware/validation';

// ✅ FIXED (points to real file)
import { validateRequest } from '../middlewares/validate-middleware.js';
```

**Test thoroughly after ANY middleware change!**

#### 📊 Progress Tracking Commands
```bash
# Count remaining legacy imports
grep -r "from '../middleware/" src/routes/ | wc -l

# Find broken imports (URGENT)
grep -r "from '../middleware/validation'" src/routes/
grep -r "from '../middleware/validateRequest'" src/routes/

# Identify financial routes (be extra careful)
grep -l "billing\|payment\|auth\|tenant" src/routes/*.js
```

#### 📚 Detailed Guidelines
**See `CLAUDE.md` for comprehensive middleware migration strategy including:**
- Complete decision tree flowchart
- Emergency rollback procedures
- Commit message standards
- Progress tracking system
- Long-term vision and success metrics

**Remember**: This is a financial system. Stability > Code cleanliness.

---

## Overview

**Monay Backend Common** is the centralized API service (Port 3001) that serves as the single backend for:
- **Monay Admin Dashboard** (Port 3002) - Super admin manager
- **Monay CaaS Platform** (Port 3007) - Enterprise wallet
- **Monay Consumer Wallet** (Port 3003) - Consumer super app
- **Monay Website** (Port 3000) - Marketing site

## Critical Architecture Rules

### ⚠️ NEVER CREATE DUPLICATE INSTANCES ⚠️
- **ONE BACKEND ONLY**: Only ONE instance should run on port 3001
- **ONE DATABASE ONLY**: All apps share the SAME PostgreSQL database 'monay'
- **ONE REDIS ONLY**: All apps share the SAME Redis cache
- **NO SEPARATION**: Consumer and Enterprise wallets use the SAME database

## Prerequisites

### System Requirements
- Node.js 20+ (with native ES module support)
- PostgreSQL 15+
- Redis 7+
- npm 8+

### Database Setup
```bash
# The database 'monay' should already exist with 70+ tables
# To verify:
psql -U alisaberi -d monay -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';"
# Should return 70 or more tables

# If database is missing, use recovery:
cd migrations
./DATABASE_RECOVERY_SCRIPT.sh
```

## Installation

```bash
# Navigate to backend directory
cd monay-backend-common

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Configure .env with your settings
```

## Environment Configuration

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database Configuration (SHARED - DO NOT CHANGE)
DATABASE_URL=postgres://alisaberi:password@localhost:5432/monay
DB_HOST=localhost
DB_PORT=5432
DB_NAME=monay
DB_USER=alisaberi
DB_PASSWORD=your_password

# Redis Configuration (SHARED - DO NOT CHANGE)
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT Configuration
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1d
REFRESH_TOKEN_SECRET=your_refresh_secret
REFRESH_TOKEN_EXPIRES_IN=7d

# API Keys (Add as needed)
STRIPE_SECRET_KEY=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
```

## Running the Application

```bash
# Development mode
npm run dev

# Production mode
npm start

# With ES modules (native Node.js support)
node --experimental-modules src/index.js
```

## API Structure

The backend provides unified API endpoints for all frontend applications:

### Authentication
- `POST /api/login` - User login
- `POST /api/admin/login` - Admin login
- `POST /api/register` - User registration
- `POST /api/logout` - Logout
- `POST /api/refresh-token` - Refresh JWT token

### Admin Endpoints (for Monay Admin Dashboard)
- `GET /api/admin/users` - Manage all users
- `GET /api/admin/transactions` - Monitor transactions
- `GET /api/admin/tenants` - Manage tenants
- `GET /api/admin/business-rules` - Configure rules
- `GET /api/admin/billing` - Billing analytics

### CaaS Endpoints (for Enterprise Platform)
- `POST /api/caas/tokens` - Token management
- `GET /api/caas/wallets` - Enterprise wallets
- `POST /api/caas/treasury` - Treasury operations

### Consumer Wallet Endpoints
- `GET /api/wallets` - User wallets
- `POST /api/transfers` - P2P transfers
- `POST /api/payments` - Payment processing

## Database Management

### Critical Files (NEVER DELETE)
```
migrations/
├── CONSOLIDATED_MONAY_SCHEMA.sql    # Complete schema (70 tables)
├── DATABASE_RECOVERY_SCRIPT.sh      # Emergency recovery script
└── *.sql                           # Individual migrations
```

### Safe Database Operations
```bash
# Backup database
pg_dump -U alisaberi monay > backup_$(date +%Y%m%d_%H%M%S).sql

# Check table count (should be 70+)
psql -U alisaberi -d monay -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';"

# Run safe migrations (CREATE IF NOT EXISTS only)
npm run migration:run

# Generate new migration (review before running!)
npm run migration:generate
```

## Module System

This project uses **Native ES Modules** (NOT Babel):
- `package.json` has `"type": "module"`
- All imports use `.js` extensions
- No Babel transpilation needed

```javascript
// Correct ES module import
import express from 'express';
import { userController } from './controllers/user-controller.js';

// Wrong - missing .js extension
import { userController } from './controllers/user-controller'; // ❌
```

## Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test
npm test -- --testNamePattern="user"
```

## Project Structure

```
monay-backend-common/
├── src/
│   ├── controllers/       # Request handlers
│   ├── middlewares/       # Express middlewares
│   ├── models/           # Database models (Sequelize)
│   ├── repositories/     # Data access layer
│   ├── routes/           # API route definitions
│   ├── services/         # Business logic
│   ├── validations/      # Input validation
│   ├── app.js           # Express app setup
│   ├── bootstrap.js     # App initialization
│   └── index.js         # Entry point
├── migrations/           # Database migrations
│   ├── CONSOLIDATED_MONAY_SCHEMA.sql  # CRITICAL - Full schema
│   └── DATABASE_RECOVERY_SCRIPT.sh    # CRITICAL - Recovery
├── tests/               # Test files
└── package.json        # Dependencies (type: "module")
```

## Security Considerations

1. **Authentication**: JWT-based with refresh tokens
2. **Rate Limiting**: Implemented on all endpoints
3. **Input Validation**: Zod/Joi validation on all inputs
4. **SQL Injection**: Protected via Sequelize ORM
5. **XSS Protection**: Helmet middleware enabled
6. **CORS**: Configured for specific origins
7. **Environment Variables**: Never commit .env files

## Monitoring & Logging

- **Logger**: Winston for structured logging
- **Error Tracking**: Centralized error handling
- **Performance**: APM monitoring available
- **Health Check**: `GET /health` endpoint

## Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Verify database exists
psql -U alisaberi -l | grep monay

# Test connection
psql -U alisaberi -d monay -c "SELECT 1;"
```

### Port Already in Use
```bash
# Find process using port 3001
lsof -i :3001

# Kill the process
kill -9 <PID>
```

### ES Module Errors
Ensure `package.json` has:
```json
{
  "type": "module"
}
```

## Important Notes

1. **NEVER** run multiple instances of this backend
2. **NEVER** create separate databases for different apps
3. **ALWAYS** use transactions for data modifications
4. **ALWAYS** backup before database operations
5. **NEVER** use DROP, TRUNCATE, or PURGE commands

## Support

- **Documentation**: `/CLAUDE.md`
- **Database Recovery**: `/migrations/DATABASE_RECOVERY_SCRIPT.sh`
- **Schema Reference**: `/migrations/CONSOLIDATED_MONAY_SCHEMA.sql`

---

## ⚠️ FINAL REMINDER ⚠️

This backend serves ALL Monay applications. Any database corruption or service failure will affect:
- Admin Dashboard
- CaaS Platform
- Consumer Wallet
- Mobile Apps

**TREAT WITH EXTREME CARE**
