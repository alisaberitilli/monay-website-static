# Complete User Onboarding Flow Documentation

## Overview
This document describes the complete user onboarding flow across all Monay applications (Consumer Wallet, Enterprise Wallet, Admin Dashboard) ensuring consistent contact preferences, profile setup, and verification requirements.

## Table of Contents
1. [Architecture](#architecture)
2. [User Creation Paths](#user-creation-paths)
3. [Contact Preferences System](#contact-preferences-system)
4. [API Endpoints](#api-endpoints)
5. [Testing Guide](#testing-guide)
6. [Database Schema](#database-schema)

## Architecture

### Core Components
- **User Onboarding Helper** (`src/helpers/user-onboarding-helper.js`)
  - Centralized logic for contact preferences
  - Application context detection
  - Role-based user type assignment

- **User Repository** (`src/repositories/user-repository.js`)
  - User creation with consistent preferences
  - Password hashing and security
  - Notification setup

- **Organization Invites** (`src/routes/organization-invites.js`)
  - Team member invitation system
  - Role-based onboarding

## User Creation Paths

### 1. Direct Signup (Consumer/Enterprise/Admin)

#### Consumer Wallet (Port 3003)
```bash
POST /api/user/signup
Headers:
  Origin: http://localhost:3003
  Content-Type: application/json

Body:
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "mobile": "+15551234567",
  "password": "SecurePass123",
  "confirmPassword": "SecurePass123",
  "deviceType": "ios"
}

Result:
- Primary Contact: mobile
- WhatsApp: Enabled
- Verification Required: mobile
- User Type: basic_consumer
```

#### Enterprise Wallet (Port 3007)
```bash
POST /api/user/signup
Headers:
  Origin: http://localhost:3007
  Content-Type: application/json

Body:
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@company.com",
  "mobile": "+15559876543",
  "password": "SecurePass123",
  "confirmPassword": "SecurePass123",
  "deviceType": "web"
}

Result:
- Primary Contact: email
- WhatsApp: Enabled
- Verification Required: email
- User Type: basic_consumer (upgrades to enterprise_user when joining org)
```

#### Admin Dashboard (Port 3002)
```bash
POST /api/user/signup
Headers:
  Origin: http://localhost:3002
  Content-Type: application/json

Body:
{
  "firstName": "Admin",
  "lastName": "User",
  "email": "admin@monay.com",
  "mobile": "+15551112222",
  "password": "SecurePass123",
  "confirmPassword": "SecurePass123",
  "deviceType": "web"
}

Result:
- Primary Contact: email
- WhatsApp: Enabled
- Verification Required: email
- User Type: basic_consumer (upgrades based on admin assignment)
```

### 2. Secondary User Linking

#### Step 1: Primary User Links Secondary
```bash
POST /api/accounts/secondary/link
Headers:
  Authorization: Bearer {primary_user_token}
  Content-Type: application/json

Body:
{
  "linkMethod": "phone",
  "phoneNumber": "+15557778888",
  "relationship": "child",
  "limit": 500,
  "dailyLimit": 50,
  "autoTopupEnabled": true,
  "autoTopupThreshold": 50,
  "autoTopupAmount": 100
}

Result:
- Creates child_parent relationship
- Sends verification OTP to secondary user
- Status: inactive (pending verification)
```

#### Step 2: Secondary User Verifies
```bash
POST /api/accounts/secondary/{userId}/verify
Headers:
  Authorization: Bearer {secondary_user_token}
  Content-Type: application/json

Body:
{
  "otp": "123456"
}

Result:
- Activates secondary account
- Inherits contact preferences from primary
- Limited notification preferences
```

### 3. Organization Member Addition

#### Option A: Add Existing User
```bash
POST /api/organizations/{orgId}/users
Headers:
  Authorization: Bearer {admin_token}
  Content-Type: application/json

Body:
{
  "user_id": "existing_user_id",
  "role": "member",
  "permissions": {
    "can_view_transactions": true,
    "can_create_invoices": false
  }
}
```

#### Option B: Invite New User
```bash
POST /api/organizations/{orgId}/invite
Headers:
  Authorization: Bearer {admin_token}
  Content-Type: application/json

Body:
{
  "email": "newmember@company.com",
  "firstName": "New",
  "lastName": "Member",
  "role": "member",
  "permissions": {},
  "sendInvite": true
}

Result:
- Sends invitation email/SMS
- Creates pending organization_user record
- User accepts during signup
```

## Contact Preferences System

### Notification Preferences Structure
```json
{
  "urgent": ["mobile", "whatsapp"],
  "transactions": ["email", "whatsapp"],
  "marketing": ["email"],
  "auth": ["mobile"],
  "updates": ["email", "whatsapp"]
}
```

### Contact Metadata Structure
```json
{
  "preferredChannel": "sms",
  "alternativeChannels": ["whatsapp", "email"],
  "verificationRequired": ["mobile"],
  "lastUpdated": "2025-01-01T00:00:00Z"
}
```

### Application-Specific Defaults

| Application | Primary Contact | Preferred Channel | Verification Required |
|------------|----------------|-------------------|----------------------|
| Consumer Wallet | mobile | sms | mobile |
| Enterprise Wallet | email | email | email |
| Admin Dashboard | email | email | email |

## API Endpoints

### Authentication
- `POST /api/login` - User login with email/mobile
- `POST /api/admin/login` - Admin login
- `POST /api/account/logout` - Logout

### User Management
- `POST /api/user/signup` - New user registration
- `GET /api/user/profile/{userId}` - Get user profile
- `PUT /api/user/profile` - Update profile
- `POST /api/user/update/phone-number` - Change phone
- `POST /api/user/update/email` - Change email

### Secondary Users
- `GET /api/accounts/secondary` - List secondary accounts
- `POST /api/accounts/secondary/link` - Link secondary user
- `PUT /api/accounts/secondary/{userId}/limits` - Update limits
- `POST /api/accounts/secondary/{userId}/verify` - Verify secondary
- `DELETE /api/accounts/secondary/{userId}` - Remove secondary

### Organizations
- `POST /api/organizations` - Create organization
- `GET /api/organizations/{id}` - Get organization details
- `POST /api/organizations/{id}/users` - Add user to org
- `POST /api/organizations/{id}/invite` - Invite new member
- `GET /api/organizations/{id}/invitations` - List invitations
- `DELETE /api/organizations/{id}/users/{userId}` - Remove member

### Verification
- `POST /api/verification/send-mobile-otp` - Send mobile OTP
- `POST /api/verification/verify-mobile-otp` - Verify mobile
- `POST /api/verification/send-email-otp` - Send email OTP
- `POST /api/verification/verify-email-otp` - Verify email

## Testing Guide

### 1. Test Consumer Wallet Registration
```bash
curl -X POST http://localhost:3001/api/user/signup \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3003" \
  -d '{
    "firstName": "Test",
    "lastName": "Consumer",
    "email": "test.consumer@monay.com",
    "mobile": "+15551234567",
    "password": "Test1234",
    "confirmPassword": "Test1234",
    "deviceType": "ios"
  }'
```

### 2. Test Enterprise Wallet Registration
```bash
curl -X POST http://localhost:3001/api/user/signup \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3007" \
  -d '{
    "firstName": "Test",
    "lastName": "Enterprise",
    "email": "test.enterprise@monay.com",
    "mobile": "+15559876543",
    "password": "Test1234",
    "confirmPassword": "Test1234",
    "deviceType": "web"
  }'
```

### 3. Verify User Creation
```sql
SELECT
  email,
  mobile,
  primary_contact,
  mobile_verified,
  email_verified,
  whatsapp_enabled,
  notification_preferences,
  contact_metadata
FROM users
WHERE email IN (
  'test.consumer@monay.com',
  'test.enterprise@monay.com'
)
ORDER BY created_at DESC;
```

## Database Schema

### Users Table (Enhanced)
```sql
CREATE TABLE users (
  id VARCHAR(255) PRIMARY KEY,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  email VARCHAR(255) UNIQUE,
  mobile VARCHAR(50),
  phone VARCHAR(50),  -- Landline
  primary_contact VARCHAR(10) DEFAULT 'mobile',
  password_hash VARCHAR(255),

  -- Verification Status
  email_verified BOOLEAN DEFAULT FALSE,
  mobile_verified BOOLEAN DEFAULT FALSE,
  phone_verified BOOLEAN DEFAULT FALSE,
  kyc_verified BOOLEAN DEFAULT FALSE,

  -- WhatsApp Integration
  whatsapp_enabled BOOLEAN DEFAULT FALSE,
  whatsapp_number VARCHAR(50),

  -- Preferences (JSONB)
  notification_preferences JSONB,
  contact_metadata JSONB,

  -- User Type & Status
  user_type VARCHAR(50) DEFAULT 'basic_consumer',
  is_active BOOLEAN DEFAULT TRUE,
  is_deleted BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Child Parents Table
```sql
CREATE TABLE child_parents (
  id UUID PRIMARY KEY,
  parent_id VARCHAR(255) REFERENCES users(id),
  user_id VARCHAR(255) REFERENCES users(id),
  verification_otp VARCHAR(255),
  is_parent_verified BOOLEAN DEFAULT FALSE,

  -- Limits & Controls
  limit DECIMAL(10,2) DEFAULT 500,
  remain_amount DECIMAL(10,2) DEFAULT 500,
  daily_limit DECIMAL(10,2),

  -- Auto Topup
  auto_topup_enabled BOOLEAN DEFAULT FALSE,
  auto_topup_threshold DECIMAL(10,2),
  auto_topup_amount DECIMAL(10,2),

  -- Relationship
  relationship VARCHAR(50),
  status VARCHAR(20) DEFAULT 'inactive',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Organization Users Table
```sql
CREATE TABLE organization_users (
  id UUID PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id),
  user_id VARCHAR(255) REFERENCES users(id),
  role org_user_role DEFAULT 'member',
  permissions JSONB DEFAULT '{}',
  is_primary BOOLEAN DEFAULT FALSE,
  invited_by VARCHAR(255),
  invitation_status VARCHAR(50) DEFAULT 'active',
  joined_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Notifications Table
```sql
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  type VARCHAR(255),
  title VARCHAR(500),
  message TEXT,
  receiver_read VARCHAR(10) DEFAULT 'unread',
  notification_data TEXT,
  from_user_id VARCHAR(255) REFERENCES users(id),
  to_user_id VARCHAR(255) REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Migration Files
- `20250929_add_dual_phone_support.sql` - Adds mobile/phone distinction
- `20250929_enhanced_contact_preferences.sql` - Adds WhatsApp & preferences
- `20250929_create_notifications_table.sql` - Creates notifications table

## Key Features Implemented

### ✅ Completed
1. **Unified onboarding helper** - Consistent preferences across all paths
2. **Application context detection** - Auto-detect Consumer/Enterprise/Admin
3. **Rich notification preferences** - Multi-channel support
4. **Contact metadata tracking** - Verification requirements, preferred channels
5. **Secondary user support** - Parent-child relationships with limits
6. **Organization invites** - Team member onboarding
7. **WhatsApp auto-enable** - Automatic from mobile number
8. **Database migrations** - All tables and fields ready

### 🔄 In Progress
1. **Login flow testing** - Verify JWT generation works
2. **Profile API testing** - Ensure profile returns all contact data
3. **Secondary linking with auth** - Test with actual tokens

### 📋 Future Enhancements
1. **Push notifications** - Add to notification preferences
2. **In-app messaging** - Add as notification channel
3. **Biometric setup** - During onboarding for mobile apps
4. **2FA enforcement** - Based on user type and risk level

## Troubleshooting

### Common Issues

1. **"User is not defined" error**
   - Solution: Use `models.User` instead of `User`
   - Fixed in all repositories and routes

2. **"Column 'mobile' does not exist"**
   - Solution: Run migration `20250929_add_dual_phone_support.sql`
   - Renames phone → mobile, adds separate phone field

3. **"Relation 'notifications' does not exist"**
   - Solution: Run migration `20250929_create_notifications_table.sql`
   - Creates notifications table with proper structure

4. **Incorrect contact preferences**
   - Solution: Uses user-onboarding-helper.js for consistency
   - Auto-detects application context from Origin header

## Support
For issues or questions about the onboarding flow:
1. Check this documentation
2. Review migration files in `/migrations/`
3. Check helper functions in `/src/helpers/user-onboarding-helper.js`
4. Review test results in database

---
*Last Updated: September 29, 2025*
*Version: 1.0.0*