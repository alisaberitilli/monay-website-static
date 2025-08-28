# Monay Backend API Specification
## CaaS & WaaS Core Services

**Version:** 1.0.0  
**Base URL:** `http://localhost:3001/api`  
**Authentication:** Bearer Token (JWT)

---

## Authentication Endpoints

### POST /api/auth/login
Login user and get JWT token
```json
{
  "email": "user@example.com",
  "password": "password123",
  "mfaCode": "123456" // Optional
}
```

### POST /api/auth/register
Register new user
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

### POST /api/auth/refresh
Refresh JWT token
```json
{
  "refreshToken": "refresh_token_here"
}
```

---

## CaaS (Crypto as a Service) Endpoints

### Blockchain Integration

#### GET /api/caas/chains
List supported blockchain networks
```json
{
  "success": true,
  "data": [
    {
      "name": "ethereum",
      "chainId": 1,
      "symbol": "ETH",
      "enabled": true,
      "testnet": false
    }
  ]
}
```

#### GET /api/caas/chains/:chainId/balance/:address
Get balance for address on specific chain
```json
{
  "success": true,
  "data": {
    "address": "0x123...",
    "balance": "1.5",
    "symbol": "ETH",
    "usdValue": 3750.00
  }
}
```

### Transaction Management

#### POST /api/caas/transaction/create
Create new transaction
```json
{
  "chainId": 1,
  "from": "0x123...",
  "to": "0x456...",
  "amount": "0.1",
  "gasLimit": 21000,
  "gasPrice": "20"
}
```

#### GET /api/caas/transaction/:txHash
Get transaction details
```json
{
  "success": true,
  "data": {
    "hash": "0xabc123...",
    "status": "confirmed",
    "confirmations": 12,
    "gasUsed": 21000
  }
}
```

#### POST /api/caas/transaction/estimate-gas
Estimate gas for transaction
```json
{
  "chainId": 1,
  "from": "0x123...",
  "to": "0x456...",
  "amount": "0.1"
}
```

### Smart Contract Interaction

#### POST /api/caas/contract/call
Call smart contract method
```json
{
  "chainId": 1,
  "contractAddress": "0x789...",
  "method": "transfer",
  "params": ["0x456...", "1000000000000000000"]
}
```

#### POST /api/caas/contract/deploy
Deploy smart contract
```json
{
  "chainId": 1,
  "bytecode": "0x608060405...",
  "abi": [...],
  "constructorParams": []
}
```

### Token Management

#### GET /api/caas/tokens/:address
Get token information
```json
{
  "success": true,
  "data": {
    "address": "0x789...",
    "name": "USD Coin",
    "symbol": "USDC",
    "decimals": 6,
    "totalSupply": "1000000000"
  }
}
```

#### POST /api/caas/tokens/transfer
Transfer tokens
```json
{
  "chainId": 1,
  "tokenAddress": "0x789...",
  "from": "0x123...",
  "to": "0x456...",
  "amount": "100"
}
```

---

## WaaS (Wallet as a Service) Endpoints

### Wallet Management

#### POST /api/waas/wallet/create
Create new wallet
```json
{
  "custodyType": "self_custody", // self_custody, assisted_custody, institutional_custody
  "walletType": "hd", // hd, multi_sig, smart_contract
  "chains": ["ethereum", "solana"],
  "securityLevel": "high"
}
```

#### GET /api/waas/wallet/:walletId
Get wallet details
```json
{
  "success": true,
  "data": {
    "id": "wallet_123",
    "custodyType": "hybrid_custody",
    "addresses": {
      "ethereum": "0x123...",
      "solana": "ABC123..."
    },
    "securityFeatures": ["mfa", "biometric", "hardware_wallet"]
  }
}
```

#### POST /api/waas/wallet/:walletId/backup
Create wallet backup
```json
{
  "backupMethod": "seed_phrase", // seed_phrase, social_recovery, encrypted_shares
  "socialRecoveryContacts": ["contact1@email.com", "contact2@email.com"]
}
```

#### POST /api/waas/wallet/:walletId/recover
Recover wallet
```json
{
  "recoveryMethod": "seed_phrase",
  "recoveryData": "word1 word2 word3...",
  "newPassword": "newpassword123"
}
```

### Multi-Signature Wallets

#### POST /api/waas/multisig/create
Create multi-signature wallet
```json
{
  "threshold": 2,
  "signers": ["0x123...", "0x456...", "0x789..."],
  "chainId": 1
}
```

#### GET /api/waas/multisig/:walletId/transactions
Get multi-sig transaction proposals
```json
{
  "success": true,
  "data": [
    {
      "id": "prop_123",
      "to": "0x456...",
      "amount": "1.0",
      "confirmations": 1,
      "threshold": 2,
      "status": "pending"
    }
  ]
}
```

#### POST /api/waas/multisig/:walletId/sign
Sign multi-sig transaction
```json
{
  "transactionId": "prop_123",
  "signature": "0xsignature..."
}
```

### Hardware Wallet Integration

#### GET /api/waas/hardware/supported
List supported hardware wallets
```json
{
  "success": true,
  "data": [
    "ledger",
    "trezor",
    "keystone"
  ]
}
```

#### POST /api/waas/hardware/connect
Connect hardware wallet
```json
{
  "type": "ledger",
  "deviceId": "device_123"
}
```

---

## Business Rules Framework (BRF) Endpoints

### KYC Management

#### GET /api/brf/kyc/levels
Get KYC levels and requirements
```json
{
  "success": true,
  "data": [
    {
      "level": "basic",
      "requirements": ["email", "phone"],
      "limits": {
        "daily": 1000,
        "monthly": 10000
      }
    }
  ]
}
```

#### POST /api/brf/kyc/verify
Submit KYC verification
```json
{
  "level": "standard",
  "documents": [
    {
      "type": "passport",
      "fileUrl": "https://..."
    }
  ],
  "personalInfo": {
    "firstName": "John",
    "lastName": "Doe",
    "dateOfBirth": "1990-01-01"
  }
}
```

### Transaction Limits

#### GET /api/brf/limits/:userId
Get user transaction limits
```json
{
  "success": true,
  "data": {
    "daily": {
      "limit": 10000,
      "used": 2500,
      "remaining": 7500
    },
    "monthly": {
      "limit": 100000,
      "used": 15000,
      "remaining": 85000
    }
  }
}
```

#### POST /api/brf/limits/check
Check if transaction is allowed
```json
{
  "userId": "user_123",
  "amount": 5000,
  "type": "transfer"
}
```

### Compliance Rules

#### GET /api/brf/compliance/rules
Get active compliance rules
```json
{
  "success": true,
  "data": {
    "aml": true,
    "sanctions": true,
    "pep": true,
    "monitoring": true
  }
}
```

#### POST /api/brf/compliance/screen
Screen transaction for compliance
```json
{
  "fromAddress": "0x123...",
  "toAddress": "0x456...",
  "amount": 1000,
  "currency": "USD"
}
```

---

## Integration Endpoints

### TilliPay Gateway

#### POST /api/integrations/tillipay/payment
Process payment via TilliPay
```json
{
  "amount": 100.00,
  "currency": "USD",
  "paymentMethod": "card",
  "cardDetails": {
    "number": "4111111111111111",
    "expiryMonth": 12,
    "expiryYear": 2025,
    "cvv": "123"
  }
}
```

#### GET /api/integrations/tillipay/transaction/:id
Get TilliPay transaction status
```json
{
  "success": true,
  "data": {
    "id": "pay_123",
    "status": "completed",
    "amount": 100.00,
    "currency": "USD"
  }
}
```

### KYC Providers

#### POST /api/integrations/kyc/persona/verify
Verify identity with Persona
```json
{
  "templateId": "template_123",
  "userId": "user_123",
  "redirectUrl": "https://app.monay.com/kyc/complete"
}
```

#### GET /api/integrations/kyc/status/:userId
Get KYC verification status
```json
{
  "success": true,
  "data": {
    "status": "approved",
    "level": "enhanced",
    "provider": "persona",
    "completedAt": "2025-01-15T10:00:00Z"
  }
}
```

---

## System Endpoints

### Health & Status

#### GET /api/health
System health check
```json
{
  "status": "healthy",
  "timestamp": "2025-01-15T10:00:00Z",
  "services": {
    "database": "healthy",
    "redis": "healthy",
    "blockchain": "healthy"
  }
}
```

#### GET /api/status
Detailed system status
```json
{
  "version": "1.0.0",
  "uptime": 3600,
  "memory": {
    "used": "256MB",
    "total": "1GB"
  },
  "database": {
    "connected": true,
    "activeConnections": 5
  }
}
```

#### GET /api/metrics
Prometheus metrics endpoint
```
# HELP api_requests_total Total number of API requests
# TYPE api_requests_total counter
api_requests_total{method="GET",status="200"} 1024
```

### Application Management

#### GET /api/applications
Get ecosystem applications
```json
{
  "success": true,
  "data": [
    {
      "name": "monay-website",
      "status": "active",
      "services": ["caas", "waas"],
      "health": "healthy"
    }
  ]
}
```

#### GET /api/applications/:name/health
Get specific application health
```json
{
  "success": true,
  "data": {
    "name": "monay-backend",
    "status": "active",
    "health": "healthy",
    "lastCheck": "2025-01-15T10:00:00Z"
  }
}
```

---

## Error Responses

All endpoints return standardized error responses:

```json
{
  "success": false,
  "error": {
    "code": "INVALID_REQUEST",
    "message": "Invalid request parameters",
    "details": {
      "field": "email",
      "issue": "Invalid email format"
    }
  },
  "timestamp": "2025-01-15T10:00:00Z"
}
```

### Common Error Codes
- `UNAUTHORIZED` (401): Invalid or missing authentication
- `FORBIDDEN` (403): Insufficient permissions
- `NOT_FOUND` (404): Resource not found
- `INVALID_REQUEST` (400): Invalid request parameters
- `RATE_LIMITED` (429): Too many requests
- `INTERNAL_ERROR` (500): Internal server error

---

## Rate Limits

- **Authentication**: 10 requests per minute
- **Wallet Operations**: 50 requests per minute
- **Transaction Queries**: 100 requests per minute
- **Blockchain Queries**: 200 requests per minute

---

## Webhook Events

The backend sends webhook notifications for important events:

### Webhook Format
```json
{
  "event": "transaction.confirmed",
  "data": {
    "transactionId": "tx_123",
    "hash": "0xabc...",
    "status": "confirmed"
  },
  "timestamp": "2025-01-15T10:00:00Z",
  "signature": "webhook_signature"
}
```

### Supported Events
- `transaction.confirmed`
- `transaction.failed`
- `wallet.created`
- `kyc.approved`
- `kyc.rejected`
- `limit.exceeded`

---

*API documentation is automatically generated and available at `/api/docs` when the server is running.*