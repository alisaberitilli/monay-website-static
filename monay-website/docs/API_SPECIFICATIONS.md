# API Specifications - Monay Pilot Coin Program

## 🔌 **API Overview**

### **Base URL**
- **Development**: `http://localhost:3000`
- **Production**: TBD (when deployed)

### **Authentication**
- **Type**: OTP-based verification (no traditional auth tokens)
- **Security**: Rate limiting, input validation, SQL injection protection

### **Response Format**
```typescript
interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}
```

### **Error Handling**
- **HTTP Status Codes**: 200 (success), 400 (bad request), 500 (server error)
- **Error Messages**: User-friendly, actionable error descriptions
- **Logging**: Comprehensive server-side error logging

## 📧 **Send OTP API**

### **Endpoint**
```
POST /api/send-otp
```

### **Purpose**
Generate and send OTP codes via email or SMS using the Nudge API.

### **Request Body**
```typescript
interface SendOtpRequest {
  email?: string;           // Required for email OTP
  mobileNumber?: string;    // Required for SMS OTP
  firstName: string;        // Required for personalization
  type: 'email' | 'mobile'; // Required to determine OTP type
}
```

### **Response**
```typescript
interface SendOtpResponse {
  success: boolean;
  message: string;
  data?: {
    success: boolean;
    nudgeId?: string;       // Nudge API response ID
    fallback?: boolean;     // True if using local fallback
  };
}
```

### **Example Request**
```bash
curl -X POST http://localhost:3000/api/send-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "firstName": "John",
    "type": "email"
  }'
```

### **Example Response**
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "data": {
    "success": true,
    "nudgeId": "123456",
    "fallback": false
  }
}
```

### **Error Responses**
```json
// Missing required fields
{
  "success": false,
  "message": "Missing required fields",
  "error": "email and firstName are required for email OTP"
}

// Nudge API failure
{
  "success": true,
  "message": "OTP generated and stored locally (Nudge API failed)",
  "data": {
    "success": true,
    "fallback": true
  }
}
```

## ✅ **Verify OTP API**

### **Endpoint**
```
POST /api/verify-otp
```

### **Purpose**
Verify user-provided OTP codes and mark verification as complete.

### **Request Body**
```typescript
interface VerifyOtpRequest {
  identifier: string;       // Email or phone number
  code: string;            // 6-digit OTP code
  type: 'email' | 'mobile'; // OTP type
}
```

### **Response**
```typescript
interface VerifyOtpResponse {
  success: boolean;
  message: string;
  data?: {
    success: boolean;
    verified: boolean;
    type: 'email' | 'mobile';
  };
}
```

### **Example Request**
```bash
curl -X POST http://localhost:3000/api/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "user@example.com",
    "code": "123456",
    "type": "email"
  }'
```

### **Example Response**
```json
{
  "success": true,
  "message": "OTP verified successfully",
  "data": {
    "success": true,
    "verified": true,
    "type": "email"
  }
}
```

### **Error Responses**
```json
// Invalid OTP
{
  "success": false,
  "message": "Invalid verification code",
  "error": "The OTP code you entered is incorrect"
}

// Expired OTP
{
  "success": false,
  "message": "Verification code expired",
  "error": "OTP has expired. Please request a new one"
}
```

## 💾 **Save User API**

### **Endpoint**
```
POST /api/save-user
```

### **Purpose**
Save pilot program application data after successful verification.

### **Request Body**
```typescript
interface SaveUserRequest {
  email: string;
  firstName: string;
  lastName: string;
  mobileNumber?: string;        // Now optional
  companyName?: string;
  companyType?: string;
  jobTitle?: string;
  industry?: string;
  useCase?: string;
  technicalRequirements?: string[];
  expectedVolume?: string;
  timeline?: string;
  additionalNotes?: string;
}
```

### **Response**
```typescript
interface SaveUserResponse {
  success: boolean;
  message: string;
  data?: {
    user: {
      id: string;           // 10-digit UUID
      email: string;
      firstName: string;
      lastName: string;
      mobileNumber: string;
      emailVerified: boolean;
      mobileVerified: boolean;
      createdAt: string;
    };
  };
}
```

### **Example Request**
```bash
curl -X POST http://localhost:3000/api/save-user \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "mobileNumber": "+13016821633",
    "companyName": "Tech Corp",
    "companyType": "startup",
    "jobTitle": "CTO",
    "industry": "FinTech"
  }'
```

### **Example Response**
```json
{
  "success": true,
  "message": "User data saved successfully",
  "data": {
    "user": {
      "id": "MONAY12345",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "mobileNumber": "+13016821633",
      "emailVerified": true,
      "mobileVerified": true,
      "createdAt": "2025-08-22T15:30:00Z"
    }
  }
}
```

### **Error Responses**
```json
// Validation error
{
  "success": false,
  "message": "Validation failed",
  "error": "email and firstName are required fields"
}

// Database error
{
  "success": false,
  "message": "Failed to save user data",
  "error": "Database connection failed"
}
```

## 🔧 **Nudge API Integration**

### **Email OTP Configuration**
- **Template ID**: 5314
- **Channel**: 0 (email)
- **API Endpoint**: `https://app.nudge.net/api/v1/Nudge/Send`
- **Merge Tags**: `{{firstName}}`, `{{otpCode}}`

### **SMS OTP Configuration**
- **Template ID**: 5248
- **Channel**: 1 (SMS)
- **API Endpoint**: `https://app.nudge.net/api/v1/Nudge/Send`
- **Merge Tags**: `{{firstName}}`, `{{otpCode}}`

### **Fallback Behavior**
When Nudge API fails:
1. **Email OTP**: Falls back to local generation
2. **SMS OTP**: Falls back to local generation
3. **User Experience**: Seamless fallback with clear messaging

## 📊 **Rate Limiting & Security**

### **Rate Limits**
- **OTP Generation**: 1 per minute per email/phone
- **OTP Verification**: 3 attempts per OTP
- **User Creation**: 1 per verified email

### **Security Measures**
- **Input Validation**: Server-side validation for all inputs
- **SQL Injection**: Parameterized queries with `pg` library
- **XSS Prevention**: Input sanitization and output encoding
- **CSRF Protection**: Built-in Next.js CSRF protection

## 🧪 **Testing Endpoints**

### **Health Check**
```bash
# Test OTP system
npm run test:otp

# Test user database
npm run test:user-db

# Manual API testing
curl -X POST http://localhost:3000/api/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","firstName":"Test","type":"email"}'
```

### **Test Data**
```typescript
// Valid test email
"test@example.com"

// Valid test phone
"+13016821633"

// Valid OTP format
"123456" // 6 digits
```

## 📝 **API Versioning**

### **Current Version**
- **Version**: v1
- **Status**: Development/Testing
- **Stability**: Stable (no breaking changes planned)

### **Future Considerations**
- **Versioning Strategy**: URL-based (`/api/v2/`)
- **Deprecation Policy**: 6-month notice for breaking changes
- **Migration Support**: Backward compatibility where possible

---

*This API specification should be updated whenever endpoints are modified or new functionality is added.*
