# Functional Specifications - Monay Pilot Coin Program

## 🔧 **System Architecture Overview**

### **Technology Stack**
- **Frontend**: Next.js 15.4.7 with React
- **Backend**: Next.js API Routes (serverless functions)
- **Database**: PostgreSQL (local development)
- **OTP Service**: Nudge API (email + SMS)
- **Authentication**: Custom OTP-based verification
- **Styling**: Tailwind CSS

### **System Components**
1. **Frontend Application** (`src/app/page.tsx`)
2. **OTP Management System** (`src/lib/otp-store.ts`)
3. **Nudge API Integration** (`src/lib/nudge-api.ts`)
4. **User Database** (`src/lib/user-db.ts`)
5. **API Endpoints** (`src/app/api/*`)

## 📱 **User Interface Specifications**

### **Page Layout**
- **Header**: Monay branding and navigation
- **Main Content**: Pilot program application form
- **Verification Steps**: Sequential email → SMS → application flow
- **Status Indicators**: Clear progress indication
- **Error Handling**: User-friendly error messages

### **Form Components**
- **Email Input**: Email address field with validation
- **Mobile Input**: Phone number with international formatting
- **OTP Input**: 6-digit verification code fields
- **Pilot Form**: Comprehensive application details
- **Submit Button**: State-aware submission control

## 🔐 **Authentication & Verification Flow**

### **Email Verification Process**
1. **Input Validation**: Email format validation
2. **OTP Generation**: 6-digit random code
3. **Nudge API Call**: Template 5314, channel 0 (email)
4. **Storage**: PostgreSQL with 10-minute expiry
5. **User Input**: 6-digit OTP entry
6. **Verification**: Code comparison and expiry check
7. **Cleanup**: OTP deletion after verification

### **SMS Verification Process (Optional)**
1. **Input Validation**: Phone number formatting (+1XXXXXXXXXX)
2. **OTP Generation**: 6-digit random code
3. **Nudge API Call**: Template 5248, channel 1 (SMS)
4. **Storage**: PostgreSQL with 10-minute expiry
5. **User Input**: 6-digit OTP entry
6. **Verification**: Code comparison and expiry check
7. **Cleanup**: OTP deletion after verification
8. **Skip Option**: Users can skip SMS verification and proceed directly to application

### **Verification States**
- `"email"`: Email verification in progress
- `"mobile"`: SMS verification in progress (optional)
- `"allVerified"`: Email verified + SMS verified (if completed)
- `"emailVerified"`: Email verified, SMS skipped
- `"error"`: Verification failed

## 💾 **Data Management Specifications**

### **OTP Storage Schema**
```sql
CREATE TABLE otp_store (
    identifier VARCHAR(255) PRIMARY KEY,
    code VARCHAR(6) NOT NULL,
    timestamp BIGINT NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    type VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **User Data Schema**
```sql
CREATE TABLE users (
    id VARCHAR(10) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    mobile_number VARCHAR(20) NOT NULL,
    company_name VARCHAR(255),
    company_type VARCHAR(50),
    job_title VARCHAR(100),
    industry VARCHAR(100),
    use_case TEXT,
    technical_requirements TEXT[],
    expected_volume VARCHAR(50),
    timeline VARCHAR(100),
    additional_notes TEXT,
    email_verified BOOLEAN DEFAULT FALSE,
    mobile_verified BOOLEAN DEFAULT FALSE,
    verification_completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **Data Flow**
1. **OTP Generation**: Random 6-digit code + metadata
2. **Temporary Storage**: PostgreSQL with automatic expiry
3. **User Verification**: Input validation and comparison
4. **Data Persistence**: User record creation with 10-digit UUID
5. **Cleanup**: OTP deletion after successful verification

## 🔌 **API Specifications**

### **Send OTP Endpoint**
- **Route**: `POST /api/send-otp`
- **Purpose**: Generate and send OTP via email or SMS
- **Input**: `{ email, firstName, mobileNumber, type }`
- **Output**: `{ success: boolean, message: string }`
- **Error Handling**: Nudge API failures, validation errors

### **Verify OTP Endpoint**
- **Route**: `POST /api/verify-otp`
- **Purpose**: Verify user-provided OTP code
- **Input**: `{ identifier, code, type }`
- **Output**: `{ success: boolean, message: string }`
- **Error Handling**: Invalid codes, expired OTPs, missing data

### **Save User Endpoint**
- **Route**: `POST /api/save-user`
- **Purpose**: Persist pilot program application data
- **Input**: Complete pilot form data
- **Output**: `{ success: boolean, user: User }`
- **Error Handling**: Validation errors, database failures

## 🛡️ **Security Specifications**

### **OTP Security**
- **Generation**: Cryptographically secure random numbers
- **Expiry**: 10-minute time limit
- **Single Use**: Deleted after verification
- **Rate Limiting**: 60-second resend cooldown
- **Attempt Tracking**: Maximum 3 attempts per session

### **Data Protection**
- **Input Validation**: Server-side validation for all inputs
- **SQL Injection**: Parameterized queries
- **XSS Prevention**: Input sanitization
- **CSRF Protection**: Built-in Next.js protection

### **Access Control**
- **Public Endpoints**: OTP generation and verification
- **Protected Data**: User information after verification
- **Admin Access**: Future role-based permissions

## 📊 **Performance Specifications**

### **Response Times**
- **OTP Generation**: <500ms
- **OTP Verification**: <200ms
- **User Data Save**: <1s
- **Page Load**: <2s

### **Scalability**
- **Concurrent Users**: Support 100+ simultaneous verifications
- **Database Connections**: Connection pooling for PostgreSQL
- **API Rate Limits**: Nudge API compliance
- **Memory Usage**: Efficient OTP storage and cleanup

## 🔄 **Error Handling Specifications**

### **User-Facing Errors**
- **Invalid OTP**: "Invalid verification code. Please try again."
- **Expired OTP**: "Verification code has expired. Please request a new one."
- **Network Errors**: "Unable to send verification code. Please try again."
- **Validation Errors**: Clear field-specific error messages

### **System Errors**
- **Nudge API Failures**: Fallback to local OTP generation
- **Database Errors**: Graceful degradation with user feedback
- **Validation Failures**: Detailed error logging for debugging

## 🧪 **Testing Specifications**

### **Automated Testing**
- **OTP System Tests**: `npm run test:otp`
- **User Database Tests**: `npm run test:user-db`
- **API Endpoint Tests**: Individual endpoint validation
- **Integration Tests**: End-to-end verification flow

### **Manual Testing**
- **Browser Compatibility**: Safari, Chrome, Firefox, Edge
- **Mobile Responsiveness**: Various screen sizes
- **User Experience**: Complete verification flow
- **Error Scenarios**: Invalid inputs, network failures

## 📱 **Mobile & Accessibility**

### **Responsive Design**
- **Mobile First**: Optimized for mobile devices
- **Touch Friendly**: Appropriate button sizes and spacing
- **Viewport Optimization**: Proper scaling across devices

### **Accessibility**
- **Screen Reader Support**: Semantic HTML structure
- **Keyboard Navigation**: Full keyboard accessibility
- **Color Contrast**: WCAG AA compliance
- **Focus Indicators**: Clear focus states

---

*This document should be updated whenever functional requirements change or new features are added.*
