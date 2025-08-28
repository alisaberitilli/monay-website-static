# Monay Platform API Endpoints Documentation

## Base URL
- Development: `http://localhost:3001/api/v1`
- Staging: `https://api-staging.monay.com/v1`
- Production: `https://api.monay.com/v1`

## Authentication
All protected endpoints require JWT Bearer token in Authorization header:
```
Authorization: Bearer <jwt_token>
```

## API Endpoints

### Authentication & User Management

#### POST /auth/register
Register new user account
```json
Request:
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+1234567890",
  "userType": "consumer"
}

Response:
{
  "success": true,
  "data": {
    "userId": "uuid",
    "email": "user@example.com",
    "token": "jwt_token",
    "refreshToken": "refresh_token"
  }
}
```

#### POST /auth/login
User authentication
```json
Request:
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

Response:
{
  "success": true,
  "data": {
    "token": "jwt_token",
    "refreshToken": "refresh_token",
    "user": { ... }
  }
}
```

#### POST /auth/refresh
Refresh authentication token
```json
Request:
{
  "refreshToken": "refresh_token"
}

Response:
{
  "success": true,
  "data": {
    "token": "new_jwt_token"
  }
}
```

#### POST /auth/logout
Logout user session
```json
Response:
{
  "success": true,
  "message": "Logged out successfully"
}
```

### KYC/AML Compliance

#### POST /kyc/initiate
Start KYC verification process
```json
Request:
{
  "userId": "uuid",
  "provider": "persona",
  "level": "consumer"
}

Response:
{
  "success": true,
  "data": {
    "sessionId": "kyc_session_id",
    "sessionUrl": "https://verify.persona.com/...",
    "status": "pending"
  }
}
```

#### GET /kyc/status/:userId
Check KYC verification status
```json
Response:
{
  "success": true,
  "data": {
    "userId": "uuid",
    "kycStatus": "verified",
    "kycLevel": "consumer",
    "verifiedAt": "2025-08-28T10:00:00Z",
    "expiresAt": "2026-08-28T10:00:00Z"
  }
}
```

#### POST /aml/screen
Screen user for AML compliance
```json
Request:
{
  "userId": "uuid",
  "fullName": "John Doe",
  "dateOfBirth": "1990-01-01",
  "country": "US"
}

Response:
{
  "success": true,
  "data": {
    "screeningId": "uuid",
    "status": "clear",
    "riskScore": 0,
    "alerts": []
  }
}
```

### Enterprise Token Management (CaaS)

#### POST /enterprise/tokens/create
Deploy new enterprise token
```json
Request:
{
  "enterpriseId": "uuid",
  "name": "Company Token",
  "symbol": "CTK",
  "initialSupply": "1000000",
  "chain": "base",
  "complianceLevel": "full"
}

Response:
{
  "success": true,
  "data": {
    "tokenId": "uuid",
    "contractAddress": "0x...",
    "transactionHash": "0x...",
    "status": "deployed"
  }
}
```

#### POST /enterprise/tokens/mint
Mint new tokens
```json
Request:
{
  "tokenId": "uuid",
  "amount": "10000",
  "recipientAddress": "0x...",
  "authorization": "multi_sig_auth"
}

Response:
{
  "success": true,
  "data": {
    "transactionHash": "0x...",
    "amount": "10000",
    "newTotalSupply": "1010000"
  }
}
```

#### POST /enterprise/tokens/burn
Burn tokens from circulation
```json
Request:
{
  "tokenId": "uuid",
  "amount": "5000",
  "fromAddress": "0x...",
  "authorization": "multi_sig_auth"
}

Response:
{
  "success": true,
  "data": {
    "transactionHash": "0x...",
    "amount": "5000",
    "newTotalSupply": "1005000"
  }
}
```

#### GET /enterprise/tokens/:enterpriseId
List enterprise tokens
```json
Response:
{
  "success": true,
  "data": {
    "tokens": [
      {
        "tokenId": "uuid",
        "name": "Company Token",
        "symbol": "CTK",
        "contractAddress": "0x...",
        "totalSupply": "1005000",
        "chain": "base",
        "status": "active"
      }
    ]
  }
}
```

### Wallet Management

#### POST /wallets/create
Create new wallet
```json
Request:
{
  "userId": "uuid",
  "walletType": "consumer",
  "chain": "solana",
  "name": "Main Wallet"
}

Response:
{
  "success": true,
  "data": {
    "walletId": "uuid",
    "address": "wallet_address",
    "chain": "solana",
    "status": "active"
  }
}
```

#### GET /wallets/user/:userId
Get user wallets
```json
Response:
{
  "success": true,
  "data": {
    "wallets": [
      {
        "walletId": "uuid",
        "address": "wallet_address",
        "chain": "solana",
        "balance": "1000.00",
        "status": "active"
      }
    ]
  }
}
```

#### GET /wallets/:walletId/balance
Get wallet balance
```json
Response:
{
  "success": true,
  "data": {
    "walletId": "uuid",
    "balances": [
      {
        "token": "USDC",
        "amount": "1000.00",
        "usdValue": "1000.00"
      }
    ]
  }
}
```

### Transaction Processing

#### POST /transactions/transfer
Initiate token transfer
```json
Request:
{
  "fromWallet": "wallet_id",
  "toAddress": "recipient_address",
  "token": "USDC",
  "amount": "100.00",
  "chain": "solana",
  "memo": "Payment for services"
}

Response:
{
  "success": true,
  "data": {
    "transactionId": "uuid",
    "hash": "tx_hash",
    "status": "pending",
    "estimatedTime": 2
  }
}
```

#### POST /transactions/cross-rail
Cross-rail swap between chains
```json
Request:
{
  "fromChain": "base",
  "toChain": "solana",
  "fromToken": "CTK",
  "toToken": "CTK-SOL",
  "amount": "500.00",
  "fromWallet": "wallet_id",
  "toWallet": "wallet_id"
}

Response:
{
  "success": true,
  "data": {
    "swapId": "uuid",
    "status": "initiated",
    "estimatedTime": 60,
    "fromTxHash": "0x...",
    "toTxHash": null
  }
}
```

#### GET /transactions/:transactionId
Get transaction details
```json
Response:
{
  "success": true,
  "data": {
    "transactionId": "uuid",
    "type": "transfer",
    "from": "sender_address",
    "to": "recipient_address",
    "amount": "100.00",
    "token": "USDC",
    "status": "completed",
    "hash": "tx_hash",
    "timestamp": "2025-08-28T10:00:00Z"
  }
}
```

#### GET /transactions/history/:walletId
Get transaction history
```json
Query Parameters:
- limit: 50 (default)
- offset: 0 (default)
- type: transfer|deposit|withdrawal
- status: pending|completed|failed

Response:
{
  "success": true,
  "data": {
    "transactions": [...],
    "pagination": {
      "total": 150,
      "limit": 50,
      "offset": 0
    }
  }
}
```

### Payment Rails Integration

#### POST /payments/card/issue
Issue virtual/physical card
```json
Request:
{
  "userId": "uuid",
  "cardType": "virtual",
  "walletId": "wallet_id",
  "spendingLimit": "5000.00",
  "name": "Business Card"
}

Response:
{
  "success": true,
  "data": {
    "cardId": "uuid",
    "last4": "1234",
    "status": "active",
    "cardType": "virtual",
    "activationUrl": "https://..."
  }
}
```

#### POST /payments/ach/deposit
Initiate ACH deposit
```json
Request:
{
  "walletId": "wallet_id",
  "amount": "1000.00",
  "bankAccountId": "bank_account_id"
}

Response:
{
  "success": true,
  "data": {
    "depositId": "uuid",
    "status": "processing",
    "estimatedCompletion": "2025-08-30T10:00:00Z"
  }
}
```

#### POST /payments/ach/withdraw
Initiate ACH withdrawal
```json
Request:
{
  "walletId": "wallet_id",
  "amount": "500.00",
  "bankAccountId": "bank_account_id"
}

Response:
{
  "success": true,
  "data": {
    "withdrawalId": "uuid",
    "status": "processing",
    "estimatedCompletion": "2025-08-30T10:00:00Z"
  }
}
```

### Treasury Management

#### GET /treasury/liquidity
Get liquidity pool status
```json
Response:
{
  "success": true,
  "data": {
    "pools": [
      {
        "poolId": "uuid",
        "chain": "base",
        "token": "USDC",
        "totalLiquidity": "10000000.00",
        "availableLiquidity": "8500000.00",
        "utilizationRate": "15%"
      }
    ]
  }
}
```

#### POST /treasury/rebalance
Rebalance liquidity between chains
```json
Request:
{
  "fromPool": "pool_id",
  "toPool": "pool_id",
  "amount": "100000.00",
  "authorization": "multi_sig_auth"
}

Response:
{
  "success": true,
  "data": {
    "rebalanceId": "uuid",
    "status": "executing",
    "transactions": [...]
  }
}
```

### Administrative Functions

#### GET /admin/users
List platform users (Admin only)
```json
Query Parameters:
- limit: 50
- offset: 0
- status: active|suspended|pending
- userType: consumer|enterprise|admin

Response:
{
  "success": true,
  "data": {
    "users": [...],
    "pagination": {...}
  }
}
```

#### POST /admin/compliance/review
Review compliance case
```json
Request:
{
  "caseId": "uuid",
  "decision": "approved",
  "notes": "Verified documentation",
  "reviewedBy": "admin_id"
}

Response:
{
  "success": true,
  "data": {
    "caseId": "uuid",
    "status": "approved",
    "reviewedAt": "2025-08-28T10:00:00Z"
  }
}
```

#### GET /admin/analytics/dashboard
Get platform analytics
```json
Response:
{
  "success": true,
  "data": {
    "totalUsers": 10000,
    "activeUsers": 7500,
    "totalVolume": "50000000.00",
    "dailyVolume": "2000000.00",
    "totalTransactions": 150000,
    "averageTransactionSize": "333.33"
  }
}
```

### Webhooks

#### POST /webhooks/register
Register webhook endpoint
```json
Request:
{
  "url": "https://example.com/webhook",
  "events": ["transaction.completed", "kyc.verified"],
  "secret": "webhook_secret"
}

Response:
{
  "success": true,
  "data": {
    "webhookId": "uuid",
    "status": "active",
    "verificationToken": "token"
  }
}
```

## Error Responses

Standard error response format:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {}
  }
}
```

### Common Error Codes
- `AUTH_FAILED`: Authentication failed
- `UNAUTHORIZED`: Unauthorized access
- `VALIDATION_ERROR`: Request validation failed
- `NOT_FOUND`: Resource not found
- `INSUFFICIENT_FUNDS`: Insufficient balance
- `KYC_REQUIRED`: KYC verification required
- `RATE_LIMIT`: Rate limit exceeded
- `SERVER_ERROR`: Internal server error

## Rate Limiting

- **Public endpoints**: 100 requests per minute
- **Authenticated endpoints**: 1000 requests per minute
- **Enterprise endpoints**: 5000 requests per minute
- **Admin endpoints**: Unlimited

## Pagination

All list endpoints support pagination:
```
GET /endpoint?limit=50&offset=0&sort=created_at&order=desc
```

## Versioning

API versioning through URL path:
- Current version: `/api/v1`
- Legacy support: `/api/v0` (deprecated)

## WebSocket Events

Real-time updates via WebSocket:
```javascript
// Connection
wss://api.monay.com/ws

// Events
- transaction.pending
- transaction.completed
- transaction.failed
- balance.updated
- kyc.updated
- compliance.alert
```

---

**Document Version**: 1.0
**Last Updated**: August 28, 2025
**API Version**: v1
**Status**: Development