# Monay Ecosystem Development Environment Setup
**Version:** 1.0  
**Date:** January 2025

---

## Overview

The Monay ecosystem consists of 6 active applications, each serving different aspects of the crypto/wallet services platform. All applications are connected to a central PostgreSQL database and managed through a unified user assignment system.

---

## Active Applications & Systems

### 1. **Monay-Website** (Public Website)
- **Language:** Next.js 14+
- **Services:** CaaS & WaaS
- **Type:** Marketing/Onboarding Website
- **Port:** 3000
- **URL:** https://monay.com
- **Repository:** https://github.com/monay/monay-website

**Features:**
- Public marketing site
- User onboarding flow
- Documentation
- Stripe integration
- Analytics

**Assigned Users:**
- System Administrator (Owner)
- Development Lead (Admin) 
- Frontend Developer (Write)
- Product Manager (Read)
- QA Engineer (Read)
- DevOps Engineer (Admin)
- Support Specialist (Read)

---

### 2. **Monay-Backend** (Core API Services)
- **Language:** Next.js/Node.js
- **Services:** CaaS & WaaS
- **Type:** Backend API
- **Port:** 3001  
- **URL:** https://api.monay.com
- **Repository:** https://github.com/monay/monay-backend

**Features:**
- Authentication & Authorization
- Wallet Management
- Transaction Processing
- Compliance Engine
- KYC/AML Integration
- TilliPay Gateway
- Notification System

**Database:** PostgreSQL (Primary)
**Cache:** Redis
**Queue:** Apache Kafka

**Assigned Users:**
- System Administrator (Owner)
- Development Lead (Admin)
- Backend Developer (Write)
- Mobile Developer (Write) - for API access
- Compliance Officer (Admin)
- DevOps Engineer (Admin)
- Support Specialist (Read)

---

### 3. **Monay-Frontend** (Admin Dashboard)
- **Language:** Next.js 14+
- **Services:** Admin, CaaS & WaaS
- **Type:** Administrative Interface
- **Port:** 3002
- **URL:** https://admin.monay.com  
- **Repository:** https://github.com/monay/monay-frontend

**Features:**
- User Management
- Transaction Monitoring
- Compliance Dashboard
- Analytics & Reporting
- System Configuration
- Role-based Access Control

**Assigned Users:**
- System Administrator (Owner)
- Development Lead (Admin)
- Frontend Developer (Write)
- Backend Developer (Write)
- Compliance Officer (Admin)
- DevOps Engineer (Admin)

---

### 4. **Monay-Web** (User Web App)
- **Language:** Next.js 14+
- **Services:** CaaS
- **Type:** User Web Application
- **Port:** 3003
- **URL:** https://app.monay.com
- **Repository:** https://github.com/monay/monay-web

**Features:**
- Wallet Management
- Transaction History
- Card Management
- Payment Processing
- Account Settings
- Mobile Responsive Design

**Assigned Users:**
- System Administrator (Owner)
- Development Lead (Admin)
- Frontend Developer (Write)
- Product Manager (Read)
- QA Engineer (Read)
- DevOps Engineer (Admin)
- Support Specialist (Read)

---

### 5. **Monay-RNiOS** (iOS Mobile App)
- **Language:** React Native
- **Services:** CaaS
- **Type:** Mobile Application (iOS)
- **Platform:** iOS 14.0+
- **URL:** https://apps.apple.com/app/monay
- **Repository:** https://github.com/monay/monay-rn-ios

**Features:**
- Native iOS Experience
- Biometric Authentication
- NFC Support
- Push Notifications
- Apple Pay Integration
- Apple Wallet Provisioning

**Configuration:**
- Bundle ID: com.monay.wallet
- Min iOS: 14.0
- Target SDK: Latest

**Assigned Users:**
- System Administrator (Owner)
- Mobile Developer (Write)
- Product Manager (Read)
- QA Engineer (Read)
- DevOps Engineer (Admin)
- Support Specialist (Read)

---

### 6. **Monay-RNAndroid** (Android Mobile App)
- **Language:** React Native
- **Services:** CaaS
- **Type:** Mobile Application (Android)
- **Platform:** Android API 21+
- **URL:** https://play.google.com/store/apps/details?id=com.monay.wallet
- **Repository:** https://github.com/monay/monay-rn-android

**Features:**
- Native Android Experience
- Fingerprint Authentication
- NFC Support
- Push Notifications
- Google Pay Integration
- Google Wallet Provisioning

**Configuration:**
- Package: com.monay.wallet
- Min SDK: 21
- Target SDK: 34

**Assigned Users:**
- System Administrator (Owner)
- Mobile Developer (Write)
- Product Manager (Read)
- QA Engineer (Read)
- DevOps Engineer (Admin)
- Support Specialist (Read)

---

## Database Schema

### Core Tables

#### Applications Table
Stores all Monay ecosystem applications:
```sql
CREATE TABLE applications (
    id UUID PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(200) NOT NULL,
    app_type application_type NOT NULL,
    tech_stack tech_stack NOT NULL,
    services service_type[] NOT NULL,
    status VARCHAR(20) DEFAULT 'inactive',
    deployment_url VARCHAR(500),
    config_json JSONB
);
```

#### User Roles Table
Defines access roles across applications:
```sql
CREATE TABLE user_roles (
    id UUID PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    permissions JSONB,
    is_admin BOOLEAN DEFAULT FALSE
);
```

#### Application Users Table
Maps users to applications with specific permissions:
```sql
CREATE TABLE application_users (
    id UUID PRIMARY KEY,
    application_id UUID REFERENCES applications(id),
    user_id UUID REFERENCES users(id),
    role_id UUID REFERENCES user_roles(id),
    access_level VARCHAR(20) DEFAULT 'read',
    is_active BOOLEAN DEFAULT TRUE
);
```

---

## User Roles & Permissions

### Role Definitions

| Role | Description | Applications | Permissions |
|------|-------------|--------------|-------------|
| **Super Admin** | System-wide access | All | Full CRUD, System Management |
| **Admin** | Application admin | Assigned apps | Read/Update apps, Manage users |
| **Developer** | Development access | Dev-relevant apps | Read/Update code, View logs |
| **Analyst** | Business analysis | Read-only access | Read apps, Generate reports |
| **Support** | Customer support | Customer-facing apps | Read users, Manage support cases |

### User Assignments

| User | Role | Applications | Access Level |
|------|------|--------------|--------------|
| admin@monay.com | Super Admin | All | Owner |
| dev.lead@monay.com | Admin | All except mobile | Admin |
| frontend.dev@monay.com | Developer | Website, Frontend, Web | Write |
| backend.dev@monay.com | Developer | Backend, Frontend | Write |
| mobile.dev@monay.com | Developer | iOS, Android, Backend | Write |
| compliance.officer@monay.com | Admin | Backend, Frontend | Admin |
| product.manager@monay.com | Analyst | All | Read |
| qa.engineer@monay.com | Developer | All | Read |
| devops.engineer@monay.com | Admin | All | Admin |
| support.specialist@monay.com | Support | Customer-facing | Read |

---

## Application Dependencies

```
monay-website ──→ monay-backend (API)
monay-frontend ──→ monay-backend (API)
monay-web ──→ monay-backend (API)
monay-rn-ios ──→ monay-backend (API)
monay-rn-android ──→ monay-backend (API)
```

All frontend applications depend on the backend for:
- Authentication
- Data persistence  
- Business logic
- External integrations

---

## Development Environment Setup

### Prerequisites
- Node.js 20+
- PostgreSQL 15+
- Redis 7+
- Docker & Docker Compose
- Git

### Database Setup

1. **Run Migration:**
```bash
cd monay-wallet/backend
psql -d monay -f database/migrations/001_monay_ecosystem_schema.sql
```

2. **Seed Data:**
```bash
psql -d monay -f database/seeds/002_assign_users_to_applications.sql
```

3. **Verify Setup:**
```sql
-- Check applications
SELECT * FROM application_summary;

-- Check user assignments  
SELECT * FROM user_application_access;

-- Get apps for specific user
SELECT * FROM get_user_applications('dev.lead@monay.com');
```

### Environment Variables

Each application requires specific environment variables:

#### Shared Variables
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/monay
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

# API URLs
MONAY_API_URL=http://localhost:3001
```

#### Application-Specific Variables

**Monay-Backend:**
```env
PORT=3001
TILLIPAY_API_URL=https://api.tillipay.com
TILLIPAY_API_KEY=your_tillipay_key
TILLIPAY_MERCHANT_ID=your_merchant_id
```

**Frontend Applications:**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Local Development

1. **Clone Repositories:**
```bash
git clone https://github.com/monay/monay-website
git clone https://github.com/monay/monay-backend  
git clone https://github.com/monay/monay-frontend
git clone https://github.com/monay/monay-web
git clone https://github.com/monay/monay-rn-ios
git clone https://github.com/monay/monay-rn-android
```

2. **Install Dependencies:**
```bash
# For each repository
npm install
# or
yarn install
```

3. **Start Development Servers:**
```bash
# Backend (Terminal 1)
cd monay-backend && npm run start

# Website (Terminal 2) 
cd monay-website && npm run dev

# Frontend Admin (Terminal 3)
cd monay-frontend && npm run dev

# Web App (Terminal 4)
cd monay-web && npm run dev

# Mobile (React Native)
cd monay-rn-ios && npx expo start
cd monay-rn-android && npx expo start
```

---

## Health Monitoring

### Application Health Checks

The system includes automated health monitoring:

```sql
-- Check current health status
SELECT 
    a.name,
    a.display_name, 
    ah.health_status,
    ah.response_time_ms,
    ah.uptime_seconds,
    ah.checked_at
FROM applications a
LEFT JOIN LATERAL (
    SELECT health_status, response_time_ms, uptime_seconds, checked_at
    FROM application_health 
    WHERE application_id = a.id 
    ORDER BY checked_at DESC 
    LIMIT 1
) ah ON true
ORDER BY a.name;
```

### Health Status Values
- **healthy**: Application running normally
- **warning**: Minor issues detected  
- **critical**: Major issues, degraded service
- **down**: Application unavailable

---

## API Documentation

### Common Endpoints

All applications expose these standard endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/version` | Version info |
| GET | `/api/status` | Detailed status |

### Backend API Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/login` | User login | No |
| POST | `/api/auth/register` | User registration | No |
| GET | `/api/wallet/balance` | Get balance | Yes |
| GET | `/api/transactions` | Transaction history | Yes |
| POST | `/api/transactions` | Create transaction | Yes |
| GET | `/api/notifications` | Get notifications | Yes |
| PATCH | `/api/notifications` | Update notification | Yes |

---

## Security Configuration

### Authentication Flow
1. User authenticates via OAuth/JWT
2. Backend validates token
3. User permissions checked against application_users table
4. Access granted based on role and access level

### API Security
- JWT tokens with short expiration
- Rate limiting per endpoint
- CORS configuration
- Input validation and sanitization

### Database Security
- Encrypted connections (SSL/TLS)
- Row-level security policies
- Audit logging for sensitive operations
- Regular security updates

---

## Deployment Pipeline

### Development → Staging → Production

1. **Development:**
   - Local development environment
   - Feature branches
   - Unit testing

2. **Staging:**
   - Testnet blockchain connections
   - Integration testing
   - User acceptance testing

3. **Production:**
   - Mainnet blockchain connections
   - Production monitoring
   - Automated backups

---

## Monitoring & Analytics

### Application Metrics
- Response times
- Error rates  
- User activity
- Transaction volumes

### Business Metrics
- User registrations
- Transaction success rates
- Revenue tracking
- Compliance metrics

### Infrastructure Metrics
- CPU/Memory usage
- Database performance
- Network latency
- Storage utilization

---

## Support & Troubleshooting

### Common Issues

1. **Database Connection Issues:**
   - Check PostgreSQL service status
   - Verify connection string
   - Check firewall rules

2. **Application Port Conflicts:**
   - Use `lsof -ti:PORT | xargs kill -9` to free ports
   - Check docker containers
   - Verify environment variables

3. **Authentication Failures:**
   - Check JWT secret configuration
   - Verify user exists in database
   - Check application user assignments

### Logging

Each application maintains logs in:
- Development: Console output
- Staging/Production: Structured logging to files
- Centralized: ELK Stack or similar

---

## Next Steps

### Immediate Setup Tasks
1. ✅ Database schema creation
2. ✅ User assignment configuration  
3. ⏳ Environment variable configuration
4. ⏳ Local development testing
5. ⏳ Health monitoring setup

### Integration Tasks
1. Connect applications to central database
2. Implement shared authentication
3. Set up monitoring dashboards
4. Configure deployment pipelines

---

## Contact & Support

For development environment issues:
- **Technical Lead:** dev.lead@monay.com
- **DevOps:** devops.engineer@monay.com  
- **System Admin:** admin@monay.com

---

*This document is updated as the development environment evolves. Last updated: January 2025*