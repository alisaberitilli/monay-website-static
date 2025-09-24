# Monay Admin Dashboard - Super Admin Manager

## 🚨 CRITICAL: DATABASE SAFETY WARNING 🚨

### ⛔ ABSOLUTELY FORBIDDEN DATABASE OPERATIONS ⛔
```sql
-- NEVER EXECUTE THESE COMMANDS:
DROP TABLE ...         -- FORBIDDEN
DROP DATABASE ...      -- FORBIDDEN
DROP SCHEMA ...        -- FORBIDDEN
TRUNCATE TABLE ...     -- FORBIDDEN
DELETE FROM ...        -- FORBIDDEN (without WHERE clause)
ALTER TABLE ... DROP   -- FORBIDDEN
PURGE ...             -- FORBIDDEN
```

### ✅ SAFE DATABASE PRACTICES
- **SINGLE DATABASE**: We share ONE 'monay' PostgreSQL database with ALL applications
- **NO STRUCTURAL CHANGES**: Database schema is FROZEN
- **BACKUP FIRST**: Always backup before operations
- **USE TRANSACTIONS**: Wrap changes in BEGIN/COMMIT/ROLLBACK
- **RECOVERY SCRIPT**: `/monay-backend-common/migrations/DATABASE_RECOVERY_SCRIPT.sh`

---

## Overview

**Monay Admin Dashboard v2.0.0** is the central super admin management platform for the entire Monay ecosystem. It provides unified administrative control over both:
- **Monay-CaaS**: Enterprise Coin-as-a-Service platform
- **Monay Consumer Wallet**: Consumer super app and wallet services

## Architecture

### Shared Infrastructure
- **Backend API**: Uses same `monay-backend-common` (Port 3001) as all other apps
- **Database**: Shares single PostgreSQL 'monay' database with ALL applications
- **Authentication**: JWT-based auth through shared backend
- **Real-time**: Socket.io for live updates

### Port Allocation
| Service | Port | Description |
|---------|------|-------------|
| **Monay Admin** | 3002 | This application |
| **Backend API** | 3001 | Shared backend (monay-backend-common) |
| **PostgreSQL** | 5432 | Shared database (NEVER duplicate) |
| **Redis** | 6379 | Shared cache/sessions |

## Features

### 🎯 Core Administrative Functions
- **Tenant Management**: Multi-tenant operations for CaaS platform
- **User Management**: Control users across consumer and enterprise platforms
- **Transaction Monitoring**: Real-time transaction oversight
- **Business Rules Engine**: Configure compliance and operational rules
- **Wallet Management**: Oversee both consumer and enterprise wallets
- **Billing Analytics**: USDXM-based billing and revenue tracking
- **Compliance Dashboard**: KYC/AML monitoring and reporting

### 📊 Analytics & Reporting
- Real-time transaction metrics
- User growth analytics
- Revenue and billing reports
- Compliance audit trails
- Cross-platform insights

### 🔐 Security & Access Control
- Role-based access control (RBAC)
- Multi-factor authentication
- Audit logging
- Session management
- IP whitelisting

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **UI Components**: Radix UI, Tremor, shadcn/ui
- **State Management**: Zustand
- **Data Fetching**: React Query (Tanstack Query)
- **Charts**: Recharts, Tremor charts
- **Forms**: React Hook Form with Zod validation
- **Animations**: Framer Motion
- **Blockchain**: Web3.js, Ethers.js, Solana Web3.js
- **Real-time**: Socket.io client

## Installation

```bash
# Navigate to monay-admin directory
cd monay-admin

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Configure the following in .env.local:
# NEXT_PUBLIC_API_URL=http://localhost:3001
# NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

## Development

```bash
# Start development server (Port 3002)
npm run dev

# Type checking
npm run typecheck

# Linting
npm run lint

# Format code
npm run format

# Run tests
npm test
```

## Building for Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

## Project Structure

```
monay-admin/
├── src/
│   ├── app/                  # Next.js app router pages
│   │   ├── (auth)/           # Authentication pages
│   │   ├── (dashboard)/      # Dashboard pages
│   │   │   ├── dashboard/    # Main dashboard
│   │   │   ├── users/        # User management
│   │   │   ├── transactions/ # Transaction monitoring
│   │   │   ├── wallet/       # Wallet management
│   │   │   ├── tenants/      # Tenant management
│   │   │   ├── billing-analytics/ # Billing & revenue
│   │   │   ├── business-rules/    # Business rules engine
│   │   │   └── settings/     # System settings
│   │   └── layout.tsx        # Root layout
│   ├── components/           # Reusable components
│   │   └── ui/              # UI components
│   ├── services/            # API service layer
│   ├── store/              # Zustand state management
│   ├── lib/                # Utility functions
│   └── types/              # TypeScript types
├── public/                 # Static assets
└── package.json           # Dependencies

```

## API Integration

All API calls go through the shared backend at `http://localhost:3001`:

```typescript
// Example API service
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Admin-specific endpoints
POST   /api/admin/login          # Admin authentication
GET    /api/admin/users          # User management
GET    /api/admin/transactions   # Transaction monitoring
GET    /api/admin/tenants        # Tenant management
POST   /api/admin/business-rules # Business rules configuration
GET    /api/admin/billing        # Billing analytics
```

## Key Administrative Workflows

### 1. Tenant Management
- Create and configure enterprise tenants for CaaS
- Manage tenant limits and permissions
- Monitor tenant usage and billing

### 2. User Oversight
- View and manage users across all platforms
- Handle KYC/AML verification
- Manage user roles and permissions

### 3. Transaction Monitoring
- Real-time transaction tracking
- Fraud detection and prevention
- Compliance reporting

### 4. Business Rules Configuration
- Set up compliance rules
- Configure transaction limits
- Manage risk parameters

### 5. Billing & Analytics
- Track platform revenue
- Monitor USDXM token usage
- Generate financial reports

## Security Considerations

1. **Authentication**: All requests require valid JWT tokens
2. **Authorization**: Role-based access control for admin functions
3. **Data Protection**: Sensitive data encrypted in transit and at rest
4. **Audit Trail**: All admin actions logged for compliance
5. **Session Security**: Automatic timeout and refresh token rotation

## Environment Variables

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001

# App Configuration
NEXT_PUBLIC_APP_NAME=Monay Admin
NEXT_PUBLIC_APP_VERSION=2.0.0

# Feature Flags
NEXT_PUBLIC_ENABLE_TENANTS=true
NEXT_PUBLIC_ENABLE_BILLING=true
NEXT_PUBLIC_ENABLE_BLOCKCHAIN=true
```

## Deployment

### Local Development
```bash
npm run dev
# Access at http://localhost:3002
```

### Production Build
```bash
npm run build
npm start
```

### Docker Deployment
```bash
docker build -t monay-admin .
docker run -p 3002:3002 monay-admin
```

## Testing

```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e
```

## Monitoring & Logging

- Application logs: Check console and backend logs
- Error tracking: Integrated error boundary components
- Performance monitoring: Built-in Next.js analytics
- User activity: Audit logs in database

## Support & Documentation

- **Main Documentation**: `/CLAUDE.md`
- **Database Recovery**: `/monay-backend-common/migrations/DATABASE_RECOVERY_SCRIPT.sh`
- **Backend API**: See `/monay-backend-common/README.md`
- **Issues**: Report at project repository

## License

Copyright © 2024-2025 Monay. All rights reserved.

---

## ⚠️ REMEMBER: DATABASE SAFETY ⚠️

**NEVER** modify database structure. All applications share ONE database.
**ALWAYS** use the shared backend API at port 3001.
**BACKUP** before any data operations.