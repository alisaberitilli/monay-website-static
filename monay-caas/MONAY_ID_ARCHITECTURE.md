# Monay-ID Service Architecture
## Federal Identity Federation & Authentication Service

---

## 🏛️ Overview

**Monay-ID** is a dedicated authentication and identity management service that handles all federal identity provider integrations for the Monay platform. It acts as the single source of truth for authentication, providing secure federation with government identity providers.

---

## 🔐 Federal Identity Providers

Monay-ID manages integration with the following federal identity providers:

### 1. **Login.gov**
- **Purpose**: Primary federal authentication for government services
- **Use Cases**: SNAP, TANF, Medicaid enrollment
- **Protocol**: OAuth 2.0 with PKCE
- **Compliance**: NIST 800-63-3 IAL2/AAL2

### 2. **ID.me**
- **Purpose**: Military and veteran identity verification
- **Use Cases**: VA benefits, military discounts
- **Protocol**: OAuth 2.0
- **Verification Levels**: Self-service and video verification

### 3. **USPS In-Person Proofing (IPP)**
- **Purpose**: High-assurance in-person identity verification
- **Use Cases**: High-value accounts, sensitive transactions
- **Protocol**: QR code generation for in-person verification
- **Locations**: 20,000+ USPS locations nationwide

### 4. **IRS Identity Verification**
- **Purpose**: Tax-related identity confirmation
- **Use Cases**: Tax refunds, IRS payment programs
- **Protocol**: Secure Access Digital Identity (SADI)
- **Requirements**: SSN, tax filing history

### 5. **SSA Death Master File Check**
- **Purpose**: Verify individual is not deceased
- **Use Cases**: Benefit eligibility, fraud prevention
- **Protocol**: Direct API integration
- **Access**: Restricted to authorized personnel

### 6. **E-Verify**
- **Purpose**: Employment authorization verification
- **Use Cases**: Gig economy onboarding, employer compliance
- **Protocol**: SOAP/XML API
- **Requirements**: I-9 documentation

### 7. **TSA PreCheck**
- **Purpose**: Trusted traveler verification
- **Use Cases**: Travel benefits, identity verification
- **Protocol**: Known Traveler Number (KTN) validation
- **Verification**: Real-time status check

---

## 🏗️ Architecture Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Monay Platform Services                  │
├───────────────┬────────────────┬────────────────────────────┤
│ Enterprise    │ Consumer       │ Government               │
│ Wallet        │ Wallet         │ Benefits                 │
│ (Port 3007)   │ (Port 3003)    │ Dashboard                │
└───────┬───────┴────────┬───────┴────────┬──────────────────┘
        │                 │                │
        └─────────────────┼────────────────┘
                          │
                    ┌─────▼──────┐
                    │   Backend   │
                    │   Common    │
                    │ (Port 3001) │
                    └─────┬──────┘
                          │ Proxy Requests
                    ┌─────▼──────┐
                    │  Monay-ID   │
                    │   Service   │
                    │ (Port 4000) │
                    └─────┬──────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
   ┌────▼────┐     ┌─────▼─────┐    ┌─────▼─────┐
   │Login.gov│     │   ID.me   │    │USPS IPP   │
   └─────────┘     └───────────┘    └───────────┘
```

---

## 🔄 Authentication Flow

### Standard OAuth Flow (Login.gov, ID.me)
```
1. User clicks "Verify with Federal ID"
2. Frontend calls Backend Common API
3. Backend proxies to Monay-ID service
4. Monay-ID initiates OAuth with provider
5. User redirected to provider login
6. Provider authenticates user
7. Provider redirects back with code
8. Monay-ID exchanges code for tokens
9. Monay-ID returns verified claims
10. Backend creates session
11. User authenticated in platform
```

### In-Person Proofing (USPS IPP)
```
1. User requests in-person verification
2. Monay-ID generates proofing code
3. User receives code + nearest locations
4. User visits USPS location
5. USPS agent verifies documents
6. Agent enters proofing code
7. Monay-ID receives confirmation
8. User account upgraded to IAL2
```

---

## 🛡️ Security Features

### Token Management
- **JWT tokens** with short expiration (15 minutes)
- **Refresh tokens** stored securely
- **Token rotation** on each refresh
- **Revocation** support for compromised tokens

### Multi-Factor Authentication
- **SMS OTP** via Twilio
- **TOTP** via authenticator apps
- **WebAuthn/FIDO2** for passwordless
- **Backup codes** for recovery

### Session Security
- **Secure session cookies** (HttpOnly, SameSite, Secure)
- **Session binding** to device fingerprint
- **Idle timeout** (30 minutes)
- **Absolute timeout** (8 hours)

### Audit & Compliance
- **Immutable audit logs** of all authentication events
- **SIEM integration** for security monitoring
- **Compliance reporting** for regulations
- **Regular security audits** and penetration testing

---

## 📡 API Endpoints

### Public Endpoints (No Auth Required)
```
POST /auth/federal/login-gov      - Initiate Login.gov flow
POST /auth/federal/id-me          - Initiate ID.me flow
GET  /auth/federal/callback       - OAuth callback handler
POST /auth/federal/verify-session - Verify auth session
```

### Protected Endpoints (Auth Required)
```
POST /auth/federal/usps-ipp       - Request in-person proofing
POST /auth/federal/irs            - IRS verification
POST /auth/federal/e-verify       - Employment verification
POST /auth/federal/tsa-precheck   - TSA PreCheck validation
```

### Admin Endpoints (Admin Role Required)
```
POST /auth/federal/ssa-dmf        - Death Master File check
GET  /auth/audit-logs             - Authentication audit logs
POST /auth/revoke-sessions        - Revoke user sessions
GET  /auth/compliance-report      - Compliance reporting
```

---

## 🔧 Implementation Details

### Technology Stack
- **Runtime**: Node.js 20+ LTS
- **Framework**: Express.js / Fastify
- **Database**: PostgreSQL for user data
- **Cache**: Redis for sessions
- **Queue**: Bull for async jobs
- **Monitoring**: DataDog APM

### Environment Variables
```bash
# Service Configuration
MONAY_ID_PORT=4000
MONAY_ID_HOST=localhost
NODE_ENV=production

# Federal Provider Credentials
LOGIN_GOV_CLIENT_ID=xxx
LOGIN_GOV_PRIVATE_KEY=xxx
ID_ME_CLIENT_ID=xxx
ID_ME_CLIENT_SECRET=xxx
USPS_IPP_API_KEY=xxx
IRS_SADI_CREDENTIALS=xxx

# Security Keys
JWT_SECRET=xxx
ENCRYPTION_KEY=xxx
SESSION_SECRET=xxx

# External Services
REDIS_URL=redis://localhost:6379
DATABASE_URL=postgresql://...
TWILIO_ACCOUNT_SID=xxx
DATADOG_API_KEY=xxx
```

### Database Schema
```sql
-- Users table (simplified)
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Federal identities table
CREATE TABLE federal_identities (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  provider VARCHAR(50), -- login_gov, id_me, etc
  provider_id VARCHAR(255),
  verification_level VARCHAR(50), -- IAL1, IAL2, etc
  claims JSONB, -- Provider-specific claims
  verified_at TIMESTAMP,
  expires_at TIMESTAMP
);

-- Authentication events table
CREATE TABLE auth_events (
  id UUID PRIMARY KEY,
  user_id UUID,
  event_type VARCHAR(50),
  provider VARCHAR(50),
  ip_address INET,
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMP
);
```

---

## 📊 Monitoring & Analytics

### Key Metrics
- **Authentication success rate** by provider
- **Average authentication time**
- **Failed authentication attempts**
- **Session duration metrics**
- **Provider availability/uptime**

### Alerts
- Provider downtime detection
- Suspicious authentication patterns
- High failure rates
- Session hijacking attempts
- Compliance violations

---

## 🚀 Deployment

### High Availability Setup
```
┌──────────────┐     ┌──────────────┐
│   Monay-ID   │     │   Monay-ID   │
│   Primary    │────▶│   Replica    │
│ (us-east-1)  │     │ (us-west-2)  │
└──────┬───────┘     └──────┬───────┘
       │                     │
       └──────────┬──────────┘
                  │
           ┌──────▼──────┐
           │   Redis     │
           │   Cluster   │
           └──────┬──────┘
                  │
           ┌──────▼──────┐
           │ PostgreSQL  │
           │   Primary   │
           └─────────────┘
```

### Scaling Considerations
- **Horizontal scaling** with load balancer
- **Database read replicas** for queries
- **Redis cluster** for session distribution
- **CDN** for static assets
- **Rate limiting** per provider

---

## 📝 Compliance & Certifications

### Standards
- **NIST 800-63-3** Digital Identity Guidelines
- **FedRAMP Moderate** (In Progress)
- **StateRAMP** for state programs
- **SOC 2 Type II** compliance
- **ISO 27001** certification

### Regulations
- **FISMA** compliance for federal systems
- **HIPAA** for healthcare programs
- **PCI DSS** for payment processing
- **CCPA/GDPR** for privacy

---

## 🔗 Integration Points

### Monay Platform Services
- **Backend Common**: Proxies auth requests
- **Enterprise Wallet**: High-value authentication
- **Government Benefits**: Benefit enrollment
- **Consumer Wallet**: Standard authentication

### External Services
- **Jumio**: Document verification fallback
- **Onfido**: International identity verification
- **Twilio**: SMS/Voice for MFA
- **SendGrid**: Email notifications

---

## 📚 Additional Resources

- [Login.gov Developer Docs](https://developers.login.gov/)
- [ID.me Developer Portal](https://developers.id.me/)
- [USPS IPP Integration Guide](https://usps.com/ipp)
- [NIST 800-63-3 Guidelines](https://pages.nist.gov/800-63-3/)
- [FedRAMP Authorization Process](https://fedramp.gov/)

---

*Document Version: 1.0*
*Last Updated: January 2025*
*Service Owner: Monay Platform Team*
*Contact: security@monay.com*