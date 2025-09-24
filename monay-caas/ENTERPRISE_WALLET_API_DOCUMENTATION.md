# Monay Enterprise Wallet API Documentation

## Overview
Complete API reference for the Monay Enterprise Wallet platform, including all endpoints for wallet management, transactions, compliance, and advanced features.

**Base URL**: `http://localhost:3001/api`
**Authentication**: JWT Bearer Token required for all endpoints

## Table of Contents
1. [Authentication](#authentication)
2. [Invoice-First Wallets](#invoice-first-wallets)
3. [Business Rules](#business-rules)
4. [Webhooks](#webhooks)
5. [Data Exports](#data-exports)
6. [Enterprise RBAC](#enterprise-rbac)
7. [Treasury Operations](#treasury-operations)
8. [Compliance](#compliance)

---

## Authentication

### Login
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "user123",
      "email": "user@example.com",
      "role": "enterprise-admin"
    }
  }
}
```

---

## Invoice-First Wallets

### Create Invoice Wallet
```http
POST /api/invoice-wallets
```

**Request Body:**
```json
{
  "invoiceNumber": "INV-2025-001",
  "vendorId": "vendor123",
  "amount": 50000,
  "currency": "USD",
  "dueDate": "2025-02-15",
  "paymentTerms": "NET30",
  "milestones": [
    {
      "description": "Initial deposit",
      "amount": 10000,
      "dueDate": "2025-01-20"
    },
    {
      "description": "Project completion",
      "amount": 40000,
      "dueDate": "2025-02-15"
    }
  ],
  "complianceRequirements": {
    "kycRequired": true,
    "amlScreening": true,
    "documentsRequired": ["invoice", "contract", "w9"]
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "walletId": "wallet456",
    "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb7",
    "invoiceId": "invoice789",
    "status": "pending",
    "qrCode": "data:image/png;base64,iVBORw0KGgo...",
    "escrowDetails": {
      "contractAddress": "0x123...",
      "releaseConditions": ["kyc_verified", "milestone_completed"]
    }
  }
}
```

### Get Invoice Wallet
```http
GET /api/invoice-wallets/:walletId
```

**Response:**
```json
{
  "success": true,
  "data": {
    "walletId": "wallet456",
    "invoiceNumber": "INV-2025-001",
    "status": "active",
    "balance": 10000,
    "transactions": [...],
    "complianceStatus": {
      "kyc": "verified",
      "aml": "cleared",
      "documents": "complete"
    }
  }
}
```

### Process Invoice Payment
```http
POST /api/invoice-wallets/:walletId/process-payment
```

**Request Body:**
```json
{
  "amount": 10000,
  "milestoneId": "milestone1",
  "paymentMethod": "ACH",
  "approvals": ["approver1", "approver2"]
}
```

---

## Business Rules

### Create Business Rule
```http
POST /api/business-rules
```

**Request Body:**
```json
{
  "name": "Large Transaction Approval",
  "description": "Require multi-sig for transactions over $10,000",
  "category": "transaction",
  "conditions": [
    {
      "field": "amount",
      "operator": "greater_than",
      "value": 10000
    },
    {
      "field": "currency",
      "operator": "equals",
      "value": "USD"
    }
  ],
  "actions": [
    {
      "type": "require_approval",
      "params": {
        "approvers": 2,
        "roles": ["cfo", "treasurer"]
      }
    }
  ],
  "priority": 100,
  "enabled": true
}
```

### Get Business Rules
```http
GET /api/business-rules?category=transaction&enabled=true
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "rule123",
      "name": "Large Transaction Approval",
      "conditions": [...],
      "actions": [...],
      "executionCount": 45,
      "lastExecuted": "2025-01-15T10:30:00Z"
    }
  ]
}
```

### Evaluate Business Rules
```http
POST /api/business-rules/evaluate
```

**Request Body:**
```json
{
  "context": "transaction",
  "data": {
    "amount": 15000,
    "currency": "USD",
    "fromWallet": "wallet123",
    "toWallet": "wallet456"
  }
}
```

---

## Webhooks

### Create Webhook
```http
POST /api/webhooks
```

**Request Body:**
```json
{
  "url": "https://api.example.com/webhook",
  "events": ["transaction.completed", "wallet.created", "invoice.paid"],
  "secret": "webhook_secret_key",
  "headers": {
    "X-Custom-Header": "value"
  },
  "retryPolicy": {
    "maxRetries": 3,
    "retryDelay": 5000
  }
}
```

### Get Webhooks
```http
GET /api/webhooks
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "webhook123",
      "url": "https://api.example.com/webhook",
      "events": ["transaction.completed"],
      "status": "active",
      "deliveryStats": {
        "total": 1250,
        "successful": 1248,
        "failed": 2
      }
    }
  ]
}
```

### Test Webhook
```http
POST /api/webhooks/:webhookId/test
```

**Request Body:**
```json
{
  "event": "transaction.completed",
  "payload": {
    "transactionId": "test123",
    "amount": 1000
  }
}
```

---

## Data Exports

### Create Export
```http
POST /api/exports
```

**Request Body:**
```json
{
  "type": "transactions",
  "format": "xlsx",
  "filters": {
    "dateFrom": "2025-01-01",
    "dateTo": "2025-01-31",
    "status": "completed",
    "minAmount": 1000
  },
  "fields": ["date", "amount", "currency", "description", "status"],
  "options": {
    "includeHeaders": true,
    "timezone": "America/New_York"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "exportId": "export456",
    "status": "processing",
    "estimatedTime": 30,
    "format": "xlsx"
  }
}
```

### Get Export Status
```http
GET /api/exports/:exportId
```

**Response:**
```json
{
  "success": true,
  "data": {
    "exportId": "export456",
    "status": "completed",
    "downloadUrl": "/api/exports/export456/download",
    "expiresAt": "2025-01-16T12:00:00Z",
    "recordCount": 1543,
    "fileSize": 245678
  }
}
```

### Download Export
```http
GET /api/exports/:exportId/download
```

**Response:** Binary file download

### Schedule Export
```http
POST /api/exports/schedule
```

**Request Body:**
```json
{
  "name": "Monthly Transaction Report",
  "type": "transactions",
  "format": "pdf",
  "schedule": {
    "frequency": "monthly",
    "dayOfMonth": 1,
    "time": "09:00",
    "timezone": "America/New_York"
  },
  "recipients": ["cfo@company.com", "accounting@company.com"],
  "filters": {
    "status": "completed"
  }
}
```

---

## Enterprise RBAC

### Get Roles
```http
GET /api/enterprise-rbac/roles?industry=banking
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "bank-administrator",
      "name": "Bank Administrator",
      "permissions": ["wallet:*", "transaction:*", "compliance:*"],
      "industry": "banking",
      "priority": 100
    },
    {
      "id": "credit-officer",
      "name": "Credit Officer",
      "permissions": ["transaction:view", "loan:*", "credit:*"],
      "industry": "banking",
      "priority": 80
    }
  ]
}
```

### Assign Role to User
```http
POST /api/enterprise-rbac/users/:userId/roles
```

**Request Body:**
```json
{
  "roleId": "bank-administrator"
}
```

### Check Permission
```http
POST /api/enterprise-rbac/check-permission
```

**Request Body:**
```json
{
  "userId": "user123",
  "permission": "transaction:approve",
  "resource": "wallet456"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "hasPermission": true,
    "userId": "user123",
    "permission": "transaction:approve",
    "resource": "wallet456"
  }
}
```

### Get Industries
```http
GET /api/enterprise-rbac/industries
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "banking",
      "name": "Banking & Financial Services",
      "description": "Traditional banking, lending, and financial services",
      "icon": "🏦"
    },
    {
      "id": "government",
      "name": "Government & Public Sector",
      "description": "Government disbursements, benefits, and public services",
      "icon": "🏛️"
    }
  ]
}
```

---

## Treasury Operations

### Get Treasury Dashboard
```http
GET /api/treasury/dashboard
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalAssets": 10000000,
    "liquidityPools": {
      "evm": 6000000,
      "solana": 4000000
    },
    "pendingTransfers": 5,
    "dailyVolume": 500000,
    "weeklyTrend": "+12.5%"
  }
}
```

### Cross-Rail Swap
```http
POST /api/treasury/cross-rail-swap
```

**Request Body:**
```json
{
  "fromRail": "evm",
  "toRail": "solana",
  "amount": 10000,
  "token": "USDC",
  "priority": "high"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "swapId": "swap789",
    "status": "pending",
    "estimatedTime": 45,
    "fromTxHash": "0xabc...",
    "toTxHash": null,
    "fee": 10
  }
}
```

---

## Compliance

### KYC Verification
```http
POST /api/compliance/kyc
```

**Request Body:**
```json
{
  "userId": "user123",
  "provider": "persona",
  "documentType": "passport",
  "documentNumber": "A12345678",
  "country": "US"
}
```

### AML Screening
```http
POST /api/compliance/aml-screening
```

**Request Body:**
```json
{
  "userId": "user123",
  "name": "John Doe",
  "dateOfBirth": "1980-01-15",
  "country": "US"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "screeningId": "screen456",
    "status": "clear",
    "riskLevel": "low",
    "matches": [],
    "timestamp": "2025-01-15T10:30:00Z"
  }
}
```

### Transaction Monitoring
```http
POST /api/compliance/transaction-monitoring
```

**Request Body:**
```json
{
  "transactionId": "tx123",
  "amount": 50000,
  "fromWallet": "wallet123",
  "toWallet": "wallet456",
  "metadata": {
    "purpose": "vendor_payment",
    "invoiceId": "INV-2025-001"
  }
}
```

---

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "specific_field",
    "reason": "validation_failed"
  }
}
```

### Common Error Codes
- `AUTH_REQUIRED`: Authentication required
- `PERMISSION_DENIED`: Insufficient permissions
- `VALIDATION_ERROR`: Request validation failed
- `NOT_FOUND`: Resource not found
- `RATE_LIMITED`: Too many requests
- `INTERNAL_ERROR`: Server error

---

## Rate Limiting

- **Default Rate Limit**: 100 requests per minute per API key
- **Bulk Operations**: 10 requests per minute
- **Export Operations**: 5 requests per minute

Rate limit headers:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Requests remaining
- `X-RateLimit-Reset`: Reset timestamp

---

## Webhook Events

### Transaction Events
- `transaction.created`: New transaction created
- `transaction.completed`: Transaction completed
- `transaction.failed`: Transaction failed
- `transaction.reversed`: Transaction reversed

### Wallet Events
- `wallet.created`: New wallet created
- `wallet.updated`: Wallet details updated
- `wallet.suspended`: Wallet suspended
- `wallet.closed`: Wallet closed

### Invoice Events
- `invoice.created`: Invoice wallet created
- `invoice.paid`: Invoice payment received
- `invoice.milestone_completed`: Milestone completed
- `invoice.expired`: Invoice expired

### Compliance Events
- `compliance.kyc_verified`: KYC verification completed
- `compliance.aml_alert`: AML alert triggered
- `compliance.document_required`: Additional documents needed

### Business Rule Events
- `rule.triggered`: Business rule triggered
- `rule.approval_required`: Approval required
- `rule.approval_completed`: Approval completed

---

## WebSocket Events

Connect to real-time updates:
```javascript
const socket = io('ws://localhost:3001', {
  auth: {
    token: 'your_jwt_token'
  }
});

// Subscribe to events
socket.on('wallet:balance', (data) => {
  console.log('Balance updated:', data);
});

socket.on('transaction:status', (data) => {
  console.log('Transaction status:', data);
});
```

---

## SDK Examples

### JavaScript/TypeScript
```javascript
import { MonayEnterpriseWallet } from '@monay/enterprise-wallet-sdk';

const client = new MonayEnterpriseWallet({
  apiKey: 'your_api_key',
  baseUrl: 'http://localhost:3001/api'
});

// Create invoice wallet
const wallet = await client.invoiceWallets.create({
  invoiceNumber: 'INV-2025-001',
  amount: 50000,
  vendorId: 'vendor123'
});

// Process payment
await client.invoiceWallets.processPayment(wallet.walletId, {
  amount: 10000,
  milestoneId: 'milestone1'
});
```

### Python
```python
from monay_enterprise import MonayClient

client = MonayClient(
    api_key='your_api_key',
    base_url='http://localhost:3001/api'
)

# Create business rule
rule = client.business_rules.create(
    name='Large Transaction Approval',
    conditions=[{'field': 'amount', 'operator': 'gt', 'value': 10000}],
    actions=[{'type': 'require_approval', 'params': {'approvers': 2}}]
)

# Export transactions
export = client.exports.create(
    type='transactions',
    format='xlsx',
    filters={'date_from': '2025-01-01', 'date_to': '2025-01-31'}
)
```

---

## Testing

### Test Environment
- **Base URL**: `https://api-test.monay.com`
- **Test API Keys**: Available in dashboard
- **Test Wallets**: Pre-funded test wallets available

### Postman Collection
Download our Postman collection for easy API testing:
[Download Postman Collection](https://api.monay.com/postman/enterprise-wallet.json)

### cURL Examples

Create Invoice Wallet:
```bash
curl -X POST http://localhost:3001/api/invoice-wallets \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "invoiceNumber": "INV-2025-001",
    "amount": 50000,
    "vendorId": "vendor123"
  }'
```

Get Business Rules:
```bash
curl -X GET "http://localhost:3001/api/business-rules?category=transaction" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Support

### Documentation
- [Developer Portal](https://developers.monay.com)
- [API Reference](https://api-docs.monay.com)
- [Integration Guides](https://guides.monay.com)

### Contact
- **Email**: api-support@monay.com
- **Slack**: [Join our Slack](https://slack.monay.com)
- **GitHub**: [Report Issues](https://github.com/monay/enterprise-wallet)

### Status Page
Monitor API status: [status.monay.com](https://status.monay.com)

---

**Version**: 1.0.0
**Last Updated**: January 2025