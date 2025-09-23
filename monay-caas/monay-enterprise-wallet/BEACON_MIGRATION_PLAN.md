# 📋 Beacon to Monay Migration Plan
## Customer Management & Invoice Enhancement

---

## 🎯 Objective
Migrate and adapt Beacon's customer management patterns into Monay's existing infrastructure to enable:
- Customer search and selection in invoice creation
- Customer database (individuals & businesses)
- Contact information management
- Invoice-customer relationship tracking

---

## ✅ Verification Features Overview

### Email Verification
- **Purpose**: Validate email ownership and deliverability
- **Method**: 6-digit OTP code sent via email
- **Providers**: Nudge (primary), SendGrid (secondary), AWS SES (backup)
- **Features**:
  - Real-time deliverability check before sending
  - Resend capability with rate limiting
  - Template-based emails with branding
  - Tracking of open/click rates
  - Automatic retry on failure
  - CRM integration via Nudge for customer tracking

### SMS/Phone Verification
- **Purpose**: Validate phone number ownership
- **Method**: 6-digit OTP code sent via SMS
- **Providers**: Nudge (primary), Twilio (secondary), AWS SNS (backup)
- **Features**:
  - International phone number support
  - Format validation using libphonenumber
  - Carrier lookup for mobile vs landline
  - SMS delivery status tracking
  - Voice call fallback option
  - CRM integration via Nudge for SMS engagement tracking

### Address Verification
- **Purpose**: Validate and standardize physical addresses
- **Method**: Google Address Validation API
- **Features**:
  - Real-time address autocomplete
  - Address standardization (USPS format)
  - Geocoding for lat/lng coordinates
  - Business vs residential classification
  - International address support
  - Visual confirmation with Google Maps
  - Postal code validation
  - Delivery point validation

### Communication Provider Architecture
- **Nudge**: Primary communication channel (Email & SMS delivery only)
- **Purpose**: Send transactional and marketing communications
- **NO Data Storage**: Nudge does not store customer data
- **Features**:
  - Email delivery API
  - SMS delivery API
  - Delivery status webhooks
  - Template management
  - Bounce/complaint handling
- **Fallback Strategy**:
  - Email: Nudge → SendGrid → AWS SES
  - SMS: Nudge → Twilio → AWS SNS

### CRM & Data Management Architecture
- **Monay CaaS Platform**: Operational CRM and data management
- **Enterprise Backend (ERP/CIS)**: Master system of record
- **Data Flow**:
  - Existing customers: ERP → Monay (for tokenization & processing)
  - New customers: Monay → ERP (sync new records back)
  - Communications: Monay → Nudge API → Customer
  - No customer data stored in Nudge

### Verification Flow & Data Management
1. **Customer Data Source**:
   - Existing: Imported from Enterprise ERP/CIS
   - New: Created in Monay, synced back to ERP
2. **Immediate Validation**: Format checks on all fields in Monay
3. **Async Verification**:
   - Verification initiated from Monay
   - Communications sent via Nudge API (email/SMS only)
4. **Status Tracking**:
   - **Monay Database**: Stores all verification status
   - **Enterprise ERP Sync**: Update master record with verification status
5. **Progressive Enhancement**: Features unlock as verification completes
6. **Status Updates**:
   - Update Monay `customers` table verification fields
   - Update `verification_logs` table with attempt details
   - Sync verification status back to Enterprise ERP
7. **Periodic Re-verification**: Annual re-verification for compliance

### Data Storage & System Roles
- **Enterprise ERP/CIS** (Master System of Record):
  - Ultimate source of truth for customer data
  - Receives updates from Monay for new/modified records
  - Provides existing customer data to Monay

- **Monay CaaS Platform** (Operational CRM):
  - `customers` table with verification flags
  - `verification_logs` detailed audit trail
  - `customer_addresses` with validation data
  - Invoice and payment processing data
  - Tokenization and security layer

- **Nudge** (Communication Layer Only):
  - No data storage
  - Email/SMS delivery service
  - Template management
  - Delivery status webhooks

### Security Measures
- Rate limiting: 5 attempts per hour per IP
- Code expiration: 10 minutes
- Hashed storage of verification codes
- Audit logging of all verification attempts
- IP-based fraud detection
- Device fingerprinting for suspicious activity

---

## 📊 Architecture Overview

### Current State (Monay)
- Simple invoice creation without customer tracking
- No customer database
- No search/autocomplete functionality
- Basic invoice storage in localStorage/database

### Target State (After Migration)
- Full customer management system
- Searchable customer database
- Auto-populate invoice fields from customer data
- Customer history and invoice tracking
- Support for both individual and business customers

---

## 🗄️ Database Migration Plan

### Phase 1: Schema Extensions
**Priority: HIGH | Timeline: Week 1**

#### 1.1 Customer Table
```sql
-- Adapt from Beacon's Subscriber/Biller model with verification tracking
CREATE TABLE customers (
  id VARCHAR(36) PRIMARY KEY DEFAULT (uuid()),
  customer_type ENUM('individual', 'business') NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  email_verified BOOLEAN DEFAULT false,
  email_verified_at TIMESTAMP NULL,
  phone VARCHAR(50),
  phone_verified BOOLEAN DEFAULT false,
  phone_verified_at TIMESTAMP NULL,
  tax_id VARCHAR(50),
  company_name VARCHAR(255),
  company_code VARCHAR(100),
  website VARCHAR(255),
  status ENUM('active', 'inactive', 'deleted') DEFAULT 'active',
  verification_status ENUM('unverified', 'partial', 'verified') DEFAULT 'unverified',
  source ENUM('manual', 'import', 'api') DEFAULT 'manual',
  metadata JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  INDEX idx_email (email),
  INDEX idx_name (name),
  INDEX idx_company (company_name),
  INDEX idx_status (status),
  INDEX idx_verification_status (verification_status)
);
```

#### 1.2 Customer Contacts Table
```sql
-- Adapt from Beacon's Contact model with verification tracking
CREATE TABLE customer_contacts (
  id VARCHAR(36) PRIMARY KEY DEFAULT (uuid()),
  customer_id VARCHAR(36) NOT NULL,
  contact_type ENUM('mobile', 'landline', 'email', 'fax') NOT NULL,
  contact_value VARCHAR(255) NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMP NULL,
  verification_code VARCHAR(10),
  verification_attempts INT DEFAULT 0,
  last_verification_sent TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  INDEX idx_customer (customer_id),
  INDEX idx_verification (is_verified)
);
```

#### 1.3 Customer Addresses Table
```sql
-- Adapt from Beacon's Address model with Google Address Validation
CREATE TABLE customer_addresses (
  id VARCHAR(36) PRIMARY KEY DEFAULT (uuid()),
  customer_id VARCHAR(36) NOT NULL,
  address_type ENUM('billing', 'shipping', 'both') DEFAULT 'billing',
  street_address VARCHAR(255),
  street_address_line2 VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(2) DEFAULT 'US',
  is_default BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMP NULL,
  google_place_id VARCHAR(255),  -- From Google Address Validation API
  formatted_address TEXT,         -- Standardized address from Google
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  verification_result JSON,       -- Full Google API response
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  INDEX idx_customer (customer_id),
  INDEX idx_verified (is_verified),
  INDEX idx_postal_code (postal_code)
);
```

#### 1.4 Update Invoice Table
```sql
-- Add customer relationship to existing invoice table
ALTER TABLE invoices
ADD COLUMN customer_id VARCHAR(36),
ADD COLUMN customer_snapshot JSON, -- Store customer data at invoice time
ADD FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
ADD INDEX idx_customer (customer_id);
```

#### 1.5 Verification Logs Table
```sql
-- Track all verification attempts for audit
CREATE TABLE verification_logs (
  id VARCHAR(36) PRIMARY KEY DEFAULT (uuid()),
  customer_id VARCHAR(36) NOT NULL,
  verification_type ENUM('email', 'sms', 'address') NOT NULL,
  target_value VARCHAR(255) NOT NULL,
  status ENUM('pending', 'sent', 'verified', 'failed', 'expired') NOT NULL,
  verification_code VARCHAR(10),
  provider VARCHAR(50), -- twilio, sendgrid, google, etc.
  provider_response JSON,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NULL,
  verified_at TIMESTAMP NULL,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  INDEX idx_customer (customer_id),
  INDEX idx_status (status),
  INDEX idx_created (created_at)
);
```

---

## 🔄 Data Synchronization Architecture

### System Hierarchy
```
Enterprise ERP (Master) ← → Monay CaaS (Operational CRM) → Nudge (Communication Only)
```

### Data Flow Patterns

#### For Existing Customers:
```
1. ERP System → 2. Monay Import → 3. Process/Tokenize → 4. Send via Nudge → 5. Customer
```

#### For New Customers:
```
1. Monay Create → 2. Store Locally → 3. Sync to ERP → 4. Send via Nudge → 5. Customer
```

### Primary Storage (Enterprise ERP/CIS)
- **Master Record**: Ultimate source of truth
- **Customer Masters**: All customer data
- **Invoice Masters**: All invoice records
- **Updates**: Receives new/modified records from Monay

### Operational Storage (Monay CaaS)
- **Real-time Processing**: Verification, payments, tokenization
- **Audit Trail**: Complete history in `verification_logs`
- **Security Layer**: Tokenized sensitive data
- **Query Performance**: Optimized for transaction processing

### Communication Layer (Nudge)
- **No Data Storage**: Stateless communication service
- **API Only**: Send emails and SMS
- **Webhooks**: Delivery status back to Monay
- **Templates**: Message formatting only

### Sync Mechanisms
1. **ERP to Monay Sync**:
   - Scheduled imports of customer/invoice data
   - Real-time API for on-demand data
   - Delta updates for changes

2. **Monay to ERP Sync**:
   - New customer records pushed to ERP
   - Verification status updates
   - Payment confirmations
   - Invoice status changes

3. **Monay to Nudge Communication**:
   - API calls with recipient and message data
   - No customer data stored in Nudge
   - Delivery status webhooks back to Monay

---

## 🔧 Backend Development Plan

### Phase 2: Models & Repositories
**Priority: HIGH | Timeline: Week 1-2**

#### 2.1 Customer Model (`/src/models/customer.js`)
```javascript
// Sequelize model definition
// - Define Customer model with associations
// - Add validation rules
// - Include virtual fields for full address, primary contact
```

#### 2.2 Customer Repository (`/src/repositories/customer-repository.js`)
```javascript
// Repository methods:
- create(customerData)
- findById(id)
- findByEmail(email)
- search(query, filters) // Search by name, email, company
- update(id, updates)
- delete(id) // Soft delete
- getInvoiceHistory(customerId)
- addContact(customerId, contactData)
- addAddress(customerId, addressData)
```

#### 2.3 Customer Service (`/src/services/customer-service.js`)
```javascript
// Business logic:
- validateCustomerData(data)
- mergeCustomers(customerId1, customerId2)
- calculateCustomerStats(customerId)
- getCustomerSummary(customerId)
- importCustomersFromCSV(file)
- updateVerificationStatus(customerId)
```

#### 2.4 Verification Service (`/src/services/verification-service.js`)
```javascript
// Email Verification:
- sendEmailVerificationViaNudge(email, customerId) // Send via Nudge API
- sendEmailVerification(email, customerId) // Fallback to SendGrid/SES
- verifyEmailCode(email, code)
- resendEmailVerification(email)
- checkEmailDeliverable(email) // Using email-verifier library
- updateEmailVerificationStatus(customerId, status) // Update Monay DB
- syncVerificationToERP(customerId, type, status) // Sync to Enterprise ERP

// SMS Verification:
- sendSMSVerificationViaNudge(phone, customerId) // Send via Nudge API
- sendSMSVerification(phone, customerId) // Fallback to Twilio/AWS SNS
- verifySMSCode(phone, code)
- resendSMSVerification(phone)
- formatPhoneNumber(phone, country)
- updateSMSVerificationStatus(customerId, status) // Update Monay DB

// Data Management:
- updateLocalVerificationStatus(customerId, field, value) // Monay DB update
- syncCustomerToERP(customerId) // Push to Enterprise ERP
- importCustomerFromERP(erpCustomerId) // Pull from ERP
- getVerificationStatus(customerId) // Read from Monay DB
- logVerificationAttempt(customerId, type, result) // Audit logging

// Address Verification (Google Address Validation API):
- validateAddress(addressData)
- standardizeAddress(addressData)
- getAddressSuggestions(partialAddress)
- geocodeAddress(address)
- validatePostalCode(postalCode, country)
```

#### 2.5 Communication & Integration Providers (`/src/providers/`)
```javascript
// Email Provider (Nudge/SendGrid/AWS SES):
- sendEmail(to, subject, body, template) // Via Nudge API (no data storage)
- sendVerificationEmail(to, code, template)
- checkEmailDeliveryStatus(messageId)
- handleBounce(messageId) // Process delivery failures

// SMS Provider (Nudge/Twilio/AWS SNS):
- sendSMS(to, message) // Via Nudge API (no data storage)
- sendVerificationSMS(to, code, template)
- checkSMSDeliveryStatus(messageId)
- handleSMSFailure(messageId) // Process delivery failures

// ERP Integration Provider:
- fetchCustomerFromERP(customerId) // Get from master system
- pushCustomerToERP(customerData) // Sync new/updated records
- syncInvoiceToERP(invoiceData) // Push invoice data
- syncPaymentToERP(paymentData) // Push payment confirmations

// Address Provider (Google Address Validation):
- validateWithGoogle(address)
- getPlaceDetails(placeId)
- autocompleteAddress(input)
```

### Phase 3: API Routes
**Priority: HIGH | Timeline: Week 2**

#### 3.1 Customer Routes (`/src/routes/customers.js`)
```javascript
// Endpoints:
GET    /api/customers           // List with pagination
GET    /api/customers/search    // Search customers
GET    /api/customers/:id       // Get customer details
POST   /api/customers           // Create customer
PUT    /api/customers/:id       // Update customer
DELETE /api/customers/:id       // Soft delete
GET    /api/customers/:id/invoices // Get customer invoices
POST   /api/customers/:id/contacts // Add contact
POST   /api/customers/:id/addresses // Add address
```

#### 3.1b Verification Routes (`/src/routes/verification.js`)
```javascript
// Email Verification Endpoints:
POST   /api/verification/email/send      // Send verification email
POST   /api/verification/email/verify    // Verify email code
POST   /api/verification/email/resend    // Resend verification email
GET    /api/verification/email/status/:email // Check email verification status

// SMS Verification Endpoints:
POST   /api/verification/sms/send        // Send SMS verification
POST   /api/verification/sms/verify      // Verify SMS code
POST   /api/verification/sms/resend      // Resend SMS verification
GET    /api/verification/sms/status/:phone // Check SMS verification status

// Address Verification Endpoints:
POST   /api/verification/address/validate // Validate and standardize address
GET    /api/verification/address/suggest  // Get address suggestions
POST   /api/verification/address/geocode  // Geocode address to lat/lng
GET    /api/verification/address/autocomplete // Autocomplete partial address

// General Verification:
GET    /api/verification/customer/:customerId/status // Get overall verification status
GET    /api/verification/logs/:customerId  // Get verification history

// ERP Sync Management:
POST   /api/sync/customer/:customerId        // Force sync customer to ERP
GET    /api/sync/status                     // Check sync queue status
POST   /api/sync/reconcile                  // Trigger batch reconciliation with ERP
GET    /api/sync/audit/:customerId          // Compare Monay vs ERP data
POST   /api/sync/import/customers           // Import customers from ERP
POST   /api/sync/import/invoices            // Import invoices from ERP
```

#### 3.2 Enhanced Invoice Routes (`/src/routes/invoices.js`)
```javascript
// Updated endpoints:
POST   /api/invoices            // Now includes customer_id
GET    /api/invoices/by-customer/:customerId
```

### Phase 4: Middleware & Security
**Priority: MEDIUM | Timeline: Week 2**

#### 4.1 CORS Configuration
```javascript
// Update cors settings for customer endpoints
cors({
  origin: ['http://localhost:3007', process.env.FRONTEND_URL],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
})
```

#### 4.2 Validation Middleware
```javascript
// Customer validation middleware
- validateCustomerCreate
- validateCustomerUpdate
- validateCustomerSearch
- sanitizeCustomerInput
```

---

## 💻 Frontend Development Plan

### Phase 5: Reusable Components
**Priority: HIGH | Timeline: Week 2-3**

#### 5.1 CustomerComboBox Component
```typescript
// Migrate from Beacon's ComboBox pattern
// Path: /src/components/CustomerComboBox.tsx
interface CustomerComboBoxProps {
  onSelect: (customer: Customer) => void
  placeholder?: string
  allowCreate?: boolean
  filterType?: 'all' | 'individual' | 'business'
}
```

#### 5.2 CustomerQuickCreate Component
```typescript
// Quick customer creation modal
// Path: /src/components/CustomerQuickCreate.tsx
interface CustomerQuickCreateProps {
  isOpen: boolean
  onClose: () => void
  onCreated: (customer: Customer) => void
  customerType?: 'individual' | 'business'
}
```

#### 5.3 CustomerDetails Component
```typescript
// Customer information display
// Path: /src/components/CustomerDetails.tsx
interface CustomerDetailsProps {
  customerId: string
  editable?: boolean
  compact?: boolean
}
```

#### 5.4 Email Verification Component
```typescript
// Email verification UI
// Path: /src/components/EmailVerification.tsx
interface EmailVerificationProps {
  email: string
  customerId: string
  onVerified: () => void
  showResend?: boolean
}
```

#### 5.5 SMS Verification Component
```typescript
// SMS/Phone verification UI
// Path: /src/components/SMSVerification.tsx
interface SMSVerificationProps {
  phone: string
  customerId: string
  onVerified: () => void
  countryCode?: string
}
```

#### 5.6 Address Verification Component
```typescript
// Address validation with Google Places
// Path: /src/components/AddressVerification.tsx
interface AddressVerificationProps {
  address: AddressData
  onValidated: (validatedAddress: ValidatedAddress) => void
  showMap?: boolean
  allowManualEntry?: boolean
}
```

#### 5.7 Verification Status Badge
```typescript
// Visual indicator of verification status
// Path: /src/components/VerificationStatusBadge.tsx
interface VerificationStatusBadgeProps {
  type: 'email' | 'phone' | 'address'
  verified: boolean
  verifiedAt?: Date
  showTooltip?: boolean
}
```

### Phase 6: Enhanced Invoice Modal
**Priority: HIGH | Timeline: Week 3**

#### 6.1 Update CreateInvoiceModal
```typescript
// Enhancements:
- Add customer selection step
- Implement customer search
- Auto-populate fields from customer
- Option to create new customer inline
- Show customer history
```

#### 6.2 Customer History Widget
```typescript
// Show previous invoices and interactions
// Path: /src/components/CustomerHistoryWidget.tsx
```

---

## 🧪 Testing Plan

### Phase 7: Test Implementation
**Priority: HIGH | Timeline: Week 3-4**

#### 7.1 Backend Tests

##### Unit Tests (`/tests/unit/`)
```javascript
// customer-model.test.js
- Test model validations
- Test associations
- Test virtual fields

// customer-repository.test.js
- Test CRUD operations
- Test search functionality
- Test soft delete

// customer-service.test.js
- Test business logic
- Test data validation
- Test customer merge
```

##### Integration Tests (`/tests/integration/`)
```javascript
// customer-api.test.js
- Test all API endpoints
- Test authentication
- Test authorization
- Test error handling
- Test pagination
```

#### 7.2 Frontend Tests

##### Component Tests (`/src/components/__tests__/`)
```javascript
// CustomerComboBox.test.tsx
- Test search functionality
- Test selection
- Test keyboard navigation
- Test accessibility

// CreateInvoiceModal.test.tsx
- Test customer selection flow
- Test auto-populate
- Test new customer creation
```

##### E2E Tests (`/tests/e2e/`)
```javascript
// invoice-with-customer.e2e.js
- Complete invoice creation with existing customer
- Create invoice with new customer
- Search and select customer
- Verify data persistence
```

### 7.3 Test Scripts (`package.json`)
```json
{
  "scripts": {
    "test:customer": "jest tests/unit/customer*.test.js",
    "test:customer:integration": "jest tests/integration/customer*.test.js",
    "test:customer:e2e": "cypress run --spec cypress/e2e/customer*.cy.js",
    "test:all": "npm run test:customer && npm run test:customer:integration"
  }
}
```

---

## 🔄 Migration Scripts

### Phase 8: Data Migration
**Priority: MEDIUM | Timeline: Week 4**

#### 8.1 Migration Scripts (`/scripts/migrate-customers.js`)
```javascript
// Scripts to create:
1. migrate-existing-invoices.js    // Link existing invoices to customers
2. import-customers-csv.js         // Import customers from CSV
3. deduplicate-customers.js        // Find and merge duplicate customers
4. generate-test-customers.js      // Create test data
```

---

## 📝 Implementation Checklist

### Week 1: Foundation
- [ ] Create database migration files (including verification tables)
- [ ] Run database migrations
- [ ] Create Customer model with verification fields
- [ ] Create CustomerContact model with verification tracking
- [ ] Create CustomerAddress model with Google validation fields
- [ ] Create VerificationLogs model
- [ ] Update Invoice model with customer relationship
- [ ] Set up Google Maps/Address Validation API credentials
- [ ] Configure Enterprise ERP integration endpoints
- [ ] Configure Nudge as communication API (email & SMS delivery only)
- [ ] Configure SendGrid as secondary email provider
- [ ] Configure AWS SES as backup email provider
- [ ] Configure Twilio as secondary SMS provider
- [ ] Configure AWS SNS as backup SMS provider

### Week 2: Backend API & Verification Services
- [ ] Implement customer repository with verification tracking
- [ ] Implement customer service with Monay CRM features
- [ ] Implement email verification service with Monay DB updates
- [ ] Implement SMS verification service with Monay DB updates
- [ ] Implement ERP sync service for bidirectional data flow
- [ ] Implement address validation service with Google API
- [ ] Create customer API routes
- [ ] Create verification API routes
- [ ] Create ERP sync management API routes
- [ ] Add customer search endpoint
- [ ] Update invoice routes
- [ ] Configure CORS
- [ ] Add validation middleware
- [ ] Add rate limiting for verification endpoints
- [ ] Set up webhook handlers for Nudge delivery status only
- [ ] Implement ERP batch reconciliation job
- [ ] Write backend unit tests for all services
- [ ] Test Google Address Validation integration
- [ ] Test ERP synchronization
- [ ] Test Nudge communication API

### Week 3: Frontend Components & Verification UI
- [ ] Migrate ComboBox component from Beacon
- [ ] Create CustomerComboBox component
- [ ] Create CustomerQuickCreate modal with verification
- [ ] Create EmailVerification component
- [ ] Create SMSVerification component
- [ ] Create AddressVerification component with Google Places
- [ ] Create VerificationStatusBadge component
- [ ] Create CustomerDetails component with verification status
- [ ] Update CreateInvoiceModal with customer selection
- [ ] Add customer search functionality
- [ ] Implement auto-populate from customer
- [ ] Add real-time address autocomplete
- [ ] Write component tests for all verification features

### Week 4: Integration & Testing
- [ ] Create customer import scripts with validation
- [ ] Test email verification flow end-to-end
- [ ] Test SMS verification flow end-to-end
- [ ] Test address validation with Google API
- [ ] Write integration tests for verification APIs
- [ ] Write E2E tests for complete customer journey
- [ ] Create seed data scripts with verified/unverified customers
- [ ] Performance testing for verification endpoints
- [ ] Security review of verification flows
- [ ] Test rate limiting and abuse prevention
- [ ] Documentation update with verification guides

### Week 5: Polish & Deployment
- [ ] Bug fixes from testing
- [ ] UI/UX improvements for verification flows
- [ ] Add verification analytics dashboard
- [ ] Create admin customer management page with verification controls
- [ ] Set up monitoring for verification providers
- [ ] Configure alerts for failed verifications
- [ ] Deployment scripts with environment variables
- [ ] Production migration plan with verification rollout
- [ ] Create verification provider fallback strategy

---

## 🚀 Rollout Strategy

### Phase 1: Beta Testing
- Enable for select users
- Gather feedback
- Monitor performance

### Phase 2: Gradual Rollout
- 25% of users
- 50% of users
- 100% deployment

### Phase 3: Legacy Cleanup
- Migrate all existing invoices
- Archive old data
- Remove deprecated code

---

## 📊 Success Metrics

### Technical Metrics
- Customer search response time < 200ms
- Invoice creation time reduced by 40%
- Zero data loss during migration
- 100% backward compatibility

### Business Metrics
- Improved invoice accuracy
- Reduced duplicate customers
- Better customer tracking
- Enhanced reporting capabilities

---

## 🚨 Risk Mitigation

### Identified Risks
1. **Data Migration Issues**
   - Mitigation: Comprehensive backup strategy
   - Rollback plan ready

2. **Performance Impact**
   - Mitigation: Indexed database fields
   - Caching strategy for frequent searches

3. **User Adoption**
   - Mitigation: Gradual rollout
   - User training materials

4. **Integration Conflicts**
   - Mitigation: Feature flags
   - Modular implementation

---

## 📚 Documentation Requirements

### Developer Documentation
- [ ] API documentation
- [ ] Database schema documentation
- [ ] Component documentation
- [ ] Migration guide

### User Documentation
- [ ] User guide for customer management
- [ ] Invoice creation tutorial
- [ ] Admin guide
- [ ] FAQ section

---

## 🔗 Dependencies

### External Libraries
```json
{
  "dependencies": {
    "@headlessui/react": "^1.7.x",  // For ComboBox
    "fuse.js": "^6.6.x",             // For fuzzy search
    "lodash.debounce": "^4.0.x",    // For search throttling
    "react-hook-form": "^7.x.x",    // For form management
    "@googlemaps/google-maps-services-js": "^3.x.x", // Google Maps services
    "@react-google-maps/api": "^2.x.x",  // Google Maps React components
    "react-otp-input": "^3.x.x",    // OTP input component
    "react-phone-input-2": "^2.x.x" // International phone input
  }
}
```

### Backend Dependencies
```json
{
  "dependencies": {
    "joi": "^17.x.x",                // For validation
    "sequelize": "^6.x.x",           // ORM
    "csv-parser": "^3.x.x",          // For CSV import

    // Email Verification
    "nudge-api": "^1.x.x",          // Nudge CRM (primary email)
    "@sendgrid/mail": "^7.x.x",     // SendGrid email service (secondary)
    "nodemailer": "^6.x.x",         // Email sending (backup)
    "email-validator": "^2.x.x",    // Email format validation
    "email-verifier": "^0.x.x",     // Email deliverability check

    // SMS Verification
    "twilio": "^4.x.x",              // Twilio SMS service
    "aws-sdk": "^2.x.x",             // AWS SNS (alternative)
    "libphonenumber-js": "^1.x.x",  // Phone number validation

    // Address Verification
    "@googlemaps/google-maps-services-js": "^3.x.x", // Google Address Validation API
    "node-geocoder": "^4.x.x",       // Geocoding service

    // Security & Rate Limiting
    "speakeasy": "^2.x.x",           // OTP generation
    "rate-limiter-flexible": "^2.x.x", // Rate limiting for verification endpoints
    "bcrypt": "^5.x.x"               // For hashing verification codes
  }
}
```

### Environment Variables Required
```bash
# Google Services
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
GOOGLE_ADDRESS_VALIDATION_API_KEY=your_address_validation_key

# Communication Services (Priority order)
# Primary - Nudge (Email & SMS delivery only, no data storage)
NUDGE_API_KEY=your_nudge_api_key
NUDGE_API_URL=https://api.nudgeplatform.com
NUDGE_TEMPLATE_ID=your_template_id

# Enterprise ERP Integration
ERP_API_URL=https://api.enterprise-erp.com
ERP_API_KEY=your_erp_api_key
ERP_SYNC_ENABLED=true
ERP_SYNC_INTERVAL_MINUTES=15

# Secondary - SendGrid
SENDGRID_API_KEY=your_sendgrid_api_key

# Backup - AWS SES
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1

# SMS Services (Priority order)
# Primary - Nudge CRM (uses same API as email)
# Already configured above with NUDGE_* variables

# Secondary - Twilio
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Backup - AWS SNS
AWS_SNS_REGION=us-east-1

# Verification Settings
VERIFICATION_CODE_LENGTH=6
VERIFICATION_CODE_EXPIRY_MINUTES=10
MAX_VERIFICATION_ATTEMPTS=3
VERIFICATION_RATE_LIMIT_PER_HOUR=5
```

---

## 👥 Team Responsibilities

### Backend Team
- Database migrations
- API development
- Service layer implementation
- Backend testing

### Frontend Team
- Component development
- UI/UX implementation
- Frontend testing
- Integration with API

### DevOps Team
- Database setup
- Deployment scripts
- Performance monitoring
- Backup strategies

### QA Team
- Test plan execution
- Bug tracking
- User acceptance testing
- Performance testing

---

## 📅 Timeline Summary

**Total Duration: 5 Weeks**

- **Week 1**: Database & Models
- **Week 2**: Backend API & Services
- **Week 3**: Frontend Components
- **Week 4**: Testing & Integration
- **Week 5**: Polish & Deployment

---

## ✅ Definition of Done

A feature is considered complete when:
1. Code is written and reviewed
2. Unit tests pass (>80% coverage)
3. Integration tests pass
4. Documentation is updated
5. Security review completed
6. Performance benchmarks met
7. Deployed to staging environment
8. Product owner approval received

---

## 📝 Notes

- All timestamps in UTC
- Use soft deletes for customer data
- Maintain audit trail for all changes
- Customer data must be exportable (GDPR compliance)
- Support for bulk operations planned for Phase 2

---

*Last Updated: 2025-09-21*
*Version: 1.0*