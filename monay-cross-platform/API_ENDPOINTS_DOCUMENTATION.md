# Monay Consumer Wallet - API Endpoints Documentation

## Base URL
- **Development**: `http://localhost:3001/api`
- **Staging**: `https://monay-staging.codiantdev.com/api`
- **Production**: `https://api.monay.com/api`

---

## 🔐 Authentication Endpoints

### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "mobile": "+1234567890",
  "password": "string",
  "role": "user", // or "merchant"
  "accountType": "primary" // or "secondary"
}
```

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "string", // or mobile
  "password": "string"
}

Response:
{
  "token": "jwt_token",
  "user": { ... },
  "wallet": { ... }
}
```

### Verify OTP
```http
POST /auth/verify-otp
Content-Type: application/json

{
  "mobile": "+1234567890",
  "otp": "123456"
}
```

### Logout
```http
POST /auth/logout
Authorization: Bearer {token}
```

---

## 👤 User Management

### Get Profile
```http
GET /users/profile
Authorization: Bearer {token}
```

### Update Profile
```http
PUT /users/profile
Authorization: Bearer {token}
Content-Type: application/json

{
  "firstName": "string",
  "lastName": "string",
  "profileImage": "string"
}
```

### Upload Avatar
```http
POST /users/upload-avatar
Authorization: Bearer {token}
Content-Type: multipart/form-data

FormData: image file
```

---

## 💼 Wallet Management

### Get Wallets
```http
GET /wallets
Authorization: Bearer {token}

Response:
[
  {
    "id": "string",
    "walletAddress": "string",
    "walletType": "solana|evm|bitcoin|virtual",
    "balance": "0.00",
    "currency": "USD",
    "isDefault": true
  }
]
```

### Create Wallet
```http
POST /wallets/create
Authorization: Bearer {token}
Content-Type: application/json

{
  "walletType": "virtual",
  "currency": "USD"
}
```

### Get Wallet Balance
```http
GET /wallets/:id/balance
Authorization: Bearer {token}
```

### Set Default Wallet
```http
POST /wallets/set-default
Authorization: Bearer {token}
Content-Type: application/json

{
  "walletId": "string"
}
```

---

## 💸 Transactions

### Transfer Money (P2P)
```http
POST /transactions/transfer
Authorization: Bearer {token}
Content-Type: application/json

{
  "receiverId": "string", // or mobile/email
  "amount": 100.00,
  "currency": "USD",
  "message": "string",
  "walletId": "string" // sender's wallet
}
```

### Get Transaction History
```http
GET /transactions/history
Authorization: Bearer {token}
Query Parameters:
  - page: 1
  - limit: 20
  - type: transfer|deposit|withdrawal
  - startDate: YYYY-MM-DD
  - endDate: YYYY-MM-DD
```

### Get Transaction Details
```http
GET /transactions/:id
Authorization: Bearer {token}
```

---

## 💰 Payment Requests

### Create Payment Request
```http
POST /payment-requests/create
Authorization: Bearer {token}
Content-Type: application/json

{
  "payerId": "string", // or mobile/email
  "amount": 50.00,
  "message": "Dinner split",
  "dueDate": "2025-02-01"
}
```

### Get Payment Requests
```http
GET /payment-requests
Authorization: Bearer {token}
Query Parameters:
  - status: pending|paid|declined
  - type: sent|received
```

### Pay Request
```http
PUT /payment-requests/:id/pay
Authorization: Bearer {token}
Content-Type: application/json

{
  "walletId": "string",
  "paymentMethod": "wallet|card|bank"
}
```

### Decline Request
```http
PUT /payment-requests/:id/decline
Authorization: Bearer {token}
Content-Type: application/json

{
  "reason": "string"
}
```

---

## 👨‍👩‍👧‍👦 Primary/Secondary Accounts (child_parents)

### Link Secondary Account
```http
POST /accounts/secondary/link
Authorization: Bearer {token}
Content-Type: application/json

{
  "secondaryUserId": "string", // or mobile
  "relationship": "family|employee|other",
  "limit": 500.00,
  "verificationMethod": "otp|qr"
}
```

### Get Secondary Accounts
```http
GET /accounts/secondary
Authorization: Bearer {token}
```

### Update Secondary Account Limits
```http
PUT /accounts/secondary/:userId/limits
Authorization: Bearer {token}
Content-Type: application/json

{
  "limit": 1000.00,
  "dailyLimit": 100.00,
  "status": "active|inactive"
}
```

### Get Primary Account (for secondary users)
```http
GET /accounts/primary
Authorization: Bearer {token}
```

---

## 💳 Card Management

### Get Cards
```http
GET /cards
Authorization: Bearer {token}
```

### Add Card
```http
POST /cards/add
Authorization: Bearer {token}
Content-Type: application/json

{
  "cardNumber": "string",
  "expiryMonth": "12",
  "expiryYear": "2025",
  "cvv": "123",
  "cardholderName": "string"
}
```

### Delete Card
```http
DELETE /cards/:id
Authorization: Bearer {token}
```

### Set Default Card
```http
PUT /cards/:id/set-default
Authorization: Bearer {token}
```

---

## 🏦 Bank Accounts

### Get Bank Accounts
```http
GET /bank-accounts
Authorization: Bearer {token}
```

### Add Bank Account
```http
POST /bank-accounts/add
Authorization: Bearer {token}
Content-Type: application/json

{
  "accountNumber": "string",
  "routingNumber": "string",
  "accountType": "checking|savings",
  "bankName": "string"
}
```

### Verify Bank Account
```http
POST /bank-accounts/:id/verify
Authorization: Bearer {token}
Content-Type: application/json

{
  "amount1": 0.12,
  "amount2": 0.34
}
```

---

## 📋 KYC/Verification

### Submit KYC
```http
POST /kyc/submit
Authorization: Bearer {token}
Content-Type: application/json

{
  "documentType": "passport|drivers_license|national_id",
  "documentNumber": "string",
  "dateOfBirth": "YYYY-MM-DD",
  "address": { ... }
}
```

### Upload KYC Document
```http
POST /kyc/upload-document
Authorization: Bearer {token}
Content-Type: multipart/form-data

FormData:
  - documentType: string
  - documentFile: file
```

### Get KYC Status
```http
GET /kyc/status
Authorization: Bearer {token}
```

---

## 🆕 Consumer Wallet Specific Endpoints (To Be Implemented)

### Auto Top-Up Configuration
```http
POST /wallet/auto-topup/configure
Authorization: Bearer {token}
Content-Type: application/json

{
  "walletId": "string",
  "triggerBalance": 50.00,
  "topupAmount": 100.00,
  "paymentMethodId": "string",
  "maxPerDay": 500.00
}
```

### Ready Cash Loan Application
```http
POST /loans/ready-cash/apply
Authorization: Bearer {token}
Content-Type: application/json

{
  "amount": 500.00,
  "term": 28 // days
}
```

### Get Loan Status
```http
GET /loans/ready-cash/status
Authorization: Bearer {token}
```

### Create Gift Card
```http
POST /gift-cards/create
Authorization: Bearer {token}
Content-Type: application/json

{
  "amount": 50.00,
  "recipientEmail": "string",
  "message": "Happy Birthday!",
  "design": "birthday"
}
```

### Redeem Gift Card
```http
POST /gift-cards/redeem
Authorization: Bearer {token}
Content-Type: application/json

{
  "code": "GIFT-XXXX-XXXX"
}
```

### Add Bill
```http
POST /bills/add
Authorization: Bearer {token}
Content-Type: application/json

{
  "billerName": "Electric Company",
  "billerType": "utility",
  "accountNumber": "string",
  "amountDue": 150.00,
  "dueDate": "2025-02-15",
  "autoPay": true
}
```

### Get Bills
```http
GET /bills
Authorization: Bearer {token}
Query Parameters:
  - status: due|overdue|paid
  - autoPay: true|false
```

### Pay Bill
```http
POST /bills/:id/pay
Authorization: Bearer {token}
Content-Type: application/json

{
  "amount": 150.00,
  "paymentMethodId": "string"
}
```

### Super App Booking
```http
POST /super-app/book
Authorization: Bearer {token}
Content-Type: application/json

{
  "serviceType": "ride|flight|hotel|food",
  "provider": "uber|lyft|doordash",
  "bookingData": { ... },
  "amount": 25.00
}
```

### Get AI Insights
```http
GET /ai/insights
Authorization: Bearer {token}
Query Parameters:
  - type: budget|saving|spending
  - unread: true
```

### Get Loyalty Points
```http
GET /loyalty/balance
Authorization: Bearer {token}
```

### Redeem Loyalty Points
```http
POST /loyalty/redeem
Authorization: Bearer {token}
Content-Type: application/json

{
  "points": 1000,
  "rewardType": "cashback|gift_card"
}
```

### Create Split Bill
```http
POST /split-bills/create
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Dinner at Restaurant",
  "totalAmount": 200.00,
  "participants": [
    { "userId": "string", "amount": 50.00 },
    { "email": "friend@example.com", "amount": 50.00 }
  ]
}
```

### Donate to Charity
```http
POST /charity/donate
Authorization: Bearer {token}
Content-Type: application/json

{
  "charityId": "string",
  "amount": 25.00,
  "isRecurring": false
}
```

---

## 📱 Mobile-Specific Endpoints

### Enable Biometric Login
```http
POST /auth/biometric/enable
Authorization: Bearer {token}
Content-Type: application/json

{
  "biometricType": "face_id|touch_id|fingerprint",
  "deviceId": "string"
}
```

### Generate QR Code
```http
GET /users/qr-code
Authorization: Bearer {token}
```

### Scan QR for Payment
```http
POST /payments/qr-scan
Authorization: Bearer {token}
Content-Type: application/json

{
  "qrData": "string",
  "amount": 50.00
}
```

---

## 🌍 Regional Endpoints (India)

### UPI Registration
```http
POST /upi/register
Authorization: Bearer {token}
Content-Type: application/json

{
  "upiId": "user@monay"
}
```

### Aadhaar KYC
```http
POST /kyc/aadhaar
Authorization: Bearer {token}
Content-Type: application/json

{
  "aadhaarNumber": "string",
  "consent": true
}
```

### PAN Verification
```http
POST /kyc/pan
Authorization: Bearer {token}
Content-Type: application/json

{
  "panNumber": "string"
}
```

---

## 🔔 WebSocket Events

### Connection
```javascript
const socket = io('http://localhost:3001', {
  auth: {
    token: 'jwt_token'
  }
});
```

### Events to Listen
```javascript
// Transaction notifications
socket.on('transaction:received', (data) => { ... });
socket.on('transaction:sent', (data) => { ... });

// Payment request notifications
socket.on('payment-request:received', (data) => { ... });
socket.on('payment-request:paid', (data) => { ... });

// Account updates
socket.on('balance:updated', (data) => { ... });
socket.on('kyc:status-changed', (data) => { ... });

// Secondary account events
socket.on('secondary:linked', (data) => { ... });
socket.on('secondary:transaction', (data) => { ... });
```

---

## 📊 Response Formats

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": { ... }
  }
}
```

### Pagination Response
```json
{
  "success": true,
  "data": {
    "items": [ ... ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "pages": 5
    }
  }
}
```

---

## 🔑 Authentication Headers

All authenticated endpoints require:
```
Authorization: Bearer {jwt_token}
```

Optional headers:
```
X-Device-Id: {device_id}
X-App-Version: 1.0.0
X-Platform: web|ios|android
```

---

## 📝 Notes

1. **Existing Endpoints**: Most endpoints already exist in monay-backend-common
2. **New Endpoints**: Consumer-specific features need to be added
3. **WebSocket**: Real-time updates use Socket.io
4. **Rate Limiting**: All endpoints have rate limits (100 req/min for authenticated)
5. **CORS**: Configure for web app on port 3003

---

*Last Updated: [Current Date]*
*Version: 1.0.0*