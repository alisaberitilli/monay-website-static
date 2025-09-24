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
