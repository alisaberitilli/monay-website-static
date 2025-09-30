# Monay Platform - Dual-Rail Blockchain Payment System

## 🔴 MANDATORY: TYPESCRIPT ONLY - NO JAVASCRIPT 🔴
**Effective: January 2025 - ALL PROJECTS**

### ⚠️ CRITICAL REQUIREMENT - NO EXCEPTIONS ⚠️
**ALL Monay projects must be written in TypeScript. JavaScript files are FORBIDDEN.**

### TypeScript Requirements Across All Projects:
- ✅ **ALL source files must be `.ts` or `.tsx`** (NO `.js` or `.jsx`)
- ✅ **Strict mode enabled** in all tsconfig.json files
- ✅ **Explicit typing required** for all function parameters and returns
- ✅ **No implicit `any` types** - Must be explicitly typed with justification
- ✅ **Interfaces required** for all data structures and API contracts
- ✅ **Type guards** for runtime validation
- ✅ **Generic types** for reusable components and utilities
- ✅ **Enums** for constants with multiple related values

### File Extension Standards:
| File Type | Extension | Example |
|-----------|-----------|---------|
| React Components | `.tsx` | `Dashboard.tsx` |
| Hooks | `.ts` or `.tsx` | `useAuth.ts` |
| Utilities | `.ts` | `formatters.ts` |
| API Routes | `.ts` | `users.ts` |
| Tests | `.test.ts` or `.test.tsx` | `auth.test.ts` |
| Config | `.ts` or `.cjs` | `config.ts` |

### Build/CI Will FAIL If:
- Any `.js` or `.jsx` files exist in `/src` directories
- TypeScript compilation has errors
- Type coverage is below 95%
- `@ts-ignore` or `@ts-nocheck` comments are found
- Implicit `any` types are detected

### Required tsconfig.json Settings:
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "noImplicitThis": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}
```

## 🔧 CRITICAL DEVELOPMENT PRINCIPLES

### ⚠️ NEVER REMOVE FUNCTIONALITY TO PASS TESTS ⚠️
**Established: January 2025**

When encountering errors during development:

1. **FIX, DON'T REMOVE**: Always fix the underlying issue rather than commenting out or removing functionality
2. **DATABASE ALIGNMENT**: When model fields don't match the database:
   - Add missing columns to the database (preferred for new features)
   - Map fields to correct database column names
   - Use VIRTUAL fields for computed/derived values
3. **NO SHORTCUTS**: Explicitly fix errors and move forward - no temporary workarounds
4. **MAINTAIN FEATURES**: All existing functionality must be preserved and working
5. **DOCUMENT FIXES**: All fixes should be properly documented

**Example**: When `mpin` field was missing from database, we added the column:
```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS mpin VARCHAR(255);
```

### 🎨 MANDATORY: USE MODERN LUCIDE ICONS - NO SHORTCUTS
**Established: January 2025**

**CRITICAL REQUIREMENT**: Always use Lucide icons via our optimized @monay/icons library located at `/shared/icons/`. Never take shortcuts with placeholders or alternative icon libraries.

**Icon Library Details:**
- 📍 **Location**: `/shared/icons/` - Optimized local SVG library with 75+ icons
- 📦 **Package**: `@monay/icons` - Import from this package in all projects
- ⚡ **Performance**: 85% smaller than lucide-react, full tree-shaking
- 🔧 **Setup**: Add to package.json: `"@monay/icons": "file:../../shared/icons"`

**Icon Standards:**
- ✅ **ONLY use @monay/icons** library from `/shared/icons/`
- ✅ **Modern, contemporary designs** for professional appearance
- ✅ **Optimized SVG components** for best performance
- ✅ **Consistent sizing**: 16px (small), 24px (default), 32px (large)
- ✅ **Use currentColor** for theme adaptability

**Strictly Forbidden:**
- ❌ **NO** FontAwesome, Material Icons, or other libraries
- ❌ **NO** emojis as icons (🔒 ❌)
- ❌ **NO** text placeholders ([icon], *, •)
- ❌ **NO** mixing different icon libraries
- ❌ **NO** bitmap images as icons

**Implementation:**
```typescript
// ✅ CORRECT
import { Shield, Lock, Users } from '@monay/icons';
<Shield size={24} className="text-blue-500" />

// ❌ WRONG - Never do this
import { FaShield } from 'react-icons/fa';
<span>🛡️</span>
<div>[shield icon]</div>
```

### Common Database Field Mappings
| Model Field | Database Column |
|------------|-----------------|
| firstName  | first_name      |
| lastName   | last_name       |
| mobile     | phone           |
| password   | password_hash   |
| mpin       | mpin           |

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development servers
npm run dev

# Run tests
export PORT=3099 && npm test
```

## 📊 Port Allocation Reference

### Production Applications
| Application | Port | Description | Status |
|------------|------|-------------|--------|
| **monay-website** | 3000 | Public Marketing Website | ✅ Active |
| **monay-backend-common** | 3001 | Centralized Backend API | ✅ Running |
| **monay-admin** | 3002 | Admin Dashboard | ✅ Active |
| **monay-web** | 3003 | User Web Application | ✅ Active |
| **monay-mobile-api** | 3004 | Mobile-specific API | 🔄 Reserved |
| **monay-webhook** | 3005 | Webhook Service | 🔄 Reserved |
| **monay-caas-admin** | 3006 | CaaS Admin Portal | 🔄 Reserved |
| **monay-enterprise-wallet** | 3007 | Enterprise Wallet Management | ✅ Running |

### Testing Ports
| Application | Port | Purpose | Command |
|------------|------|---------|---------|
| **Test Backend** | 3099 | Test server instance | `PORT=3099 npm test` |
| **Test Frontend** | 3100 | Test UI server | Testing only |
| **E2E Tests** | 3101 | End-to-end testing | `npm run test:e2e` |

### Infrastructure Services
| Service | Port | Description | Databases |
|---------|------|-------------|-----------|
| **PostgreSQL** | 5432 | Primary Database | monay (prod), monay_test (test) |
| **Redis** | 6379 | Cache & Sessions | DB 0 (prod), DB 1 (test) |
| **WebSocket** | 8080 | Real-time communications | N/A |

## 🏗️ Architecture

### Dual-Rail Blockchain
- **Enterprise Rail**: EVM L2 (Base/Polygon zkEVM) - Port 8545
- **Consumer Rail**: Solana - Port 8899
- **Cross-Rail Bridge**: Treasury operations

### Core Services
- **Business Rule Framework (BRF)**: Unified compliance engine
- **Payment Rails**: TilliPay integration for on/off-ramp
- **KYC/AML**: Persona, Alloy, Onfido integrations

## 🧪 Testing Infrastructure

### Test Status (as of 2025-09-21)
- ✅ **Infrastructure**: Fully operational
- ✅ **Database**: monay_test created and connected
- ✅ **Tests Running**: 53% pass rate (8/15 tests passing)
- ✅ **CI/CD Ready**: Can be integrated into pipelines

### Running Tests

```bash
# Backend tests (avoid port conflicts)
export PORT=3099 && npm test

# Frontend tests
cd monay-caas/monay-enterprise-wallet
npm test

# Specific test suite
npm test -- --testPathPatterns="middleware"

# With coverage
npm test -- --coverage
```

## 📁 Project Structure

```
monay/
├── monay-backend-common/     # Port 3001 - Central API
├── monay-website/            # Port 3000 - Marketing site
├── monay-admin/              # Port 3002 - Admin dashboard
├── monay-cross-platform/
│   ├── web/                  # Port 3003 - User web app
│   ├── ios/                  # iOS mobile app
│   └── android/              # Android mobile app
├── monay-caas/
│   └── monay-enterprise-wallet/ # Port 3007 - Enterprise wallet
└── terraform/                # Infrastructure as code
```

## 🔧 Development Setup

### Prerequisites
- Node.js v20+
- PostgreSQL 15+
- Redis 7+
- Docker (optional)

### Environment Variables
```bash
# Backend (.env)
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://user:pass@localhost:5432/monay
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key

# Testing (.env.test)
NODE_ENV=test
PORT=3099
DATABASE_URL=postgresql://user:pass@localhost:5432/monay_test
REDIS_URL=redis://localhost:6379/1
```

### Database Setup
```bash
# Create production database
createdb monay

# Create test database
createdb monay_test

# Run migrations
npm run migration
```

## 📚 Documentation

- [Technical Specification](./TECHNICAL_SPECIFICATION.md)
- [API Documentation](./API_ENDPOINTS_DOCUMENTATION.md)
- [Deployment Guide](./AWS_DEPLOYMENT_PLAN.md)
- [Testing Report](./COMPREHENSIVE_TEST_FIX_REPORT.md)
- [Development Setup](./DEVELOPMENT_ENVIRONMENT_SETUP.md)

## 🚢 Deployment

### Docker
```bash
docker-compose up -d
```

### AWS/GCP
See [AWS_DEPLOYMENT_STRATEGY.md](./AWS_DEPLOYMENT_STRATEGY.md)

## 📞 Support

- Technical Issues: Create an issue in this repository
- Development Questions: Refer to CLAUDE.md for AI assistant context
- Business Inquiries: support@monay.com

## 📄 License

Proprietary - All rights reserved

---

*Last updated: 2025-09-21*
*Platform Version: 1.0.0*