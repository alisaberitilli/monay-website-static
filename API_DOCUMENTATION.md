# 📚 Monay Invoice Tokenization API Documentation
**Version**: 1.0.0
**Base URL**: `http://localhost:3001/api`
**Authentication**: Bearer Token (JWT)

---

## Table of Contents
- [Authentication](#authentication)
- [Enterprise Treasury Endpoints](#enterprise-treasury-endpoints)
- [Invoice Management](#invoice-management)
- [Payment Processing](#payment-processing)
- [P2P Request-to-Pay](#p2p-request-to-pay)
- [Provider Management](#provider-management)
- [Error Handling](#error-handling)
- [Webhooks](#webhooks)

---

## Authentication

All API requests require authentication using JWT Bearer tokens.

### Headers Required
```http
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
```

### Get Authentication Token
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "enterprise@example.com",
  "password": "secure_password"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_123",
    "email": "enterprise@example.com",
    "role": "enterprise_admin"
  }
}
```

---

## Enterprise Treasury Endpoints

### Initialize Treasury
Creates a new treasury with Solana merkle tree for invoice storage.

```http
POST /api/enterprise-treasury/initialize
```

**Request Body:**
```json
{
  "enterpriseId": "enterprise_001",
  "walletAddress": "SolanaWalletAddress123...",
  "config": {
    "maxInvoices": 1048576,
    "defaultProvider": "tempo"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "treasuryId": "treasury_123",
    "merkleTree": "TreeAddress123...",
    "capacity": 1048576,
    "setupCost": "$50",
    "perInvoiceCost": "$0.00005",
    "providers": {
      "tempo": {
        "balance": 0,
        "status": "active"
      },
      "circle": {
        "balance": 0,
        "status": "active"
      }
    }
  }
}
```

### Get Treasury Status
```http
GET /api/enterprise-treasury/status
```

**Response:**
```json
{
  "success": true,
  "data": {
    "treasuryId": "treasury_123",
    "totalInvoices": 245,
    "totalRevenue": 125000.50,
    "pendingAmount": 35000.00,
    "balances": {
      "tempo": 90000.00,
      "circle": 35000.50
    },
    "merkleTree": {
      "used": 245,
      "capacity": 1048576,
      "utilizationPercent": 0.02
    }
  }
}
```

---

## Invoice Management

### Create Invoice
Tokenizes an invoice as a compressed NFT on Solana.

```http
POST /api/enterprise-treasury/invoice/create
```

**Request Body:**
```json
{
  "invoiceNumber": "INV-2025-001",
  "recipientId": "customer_456",
  "recipientEmail": "customer@example.com",
  "amount": 1500.00,
  "currency": "USDC",
  "dueDate": "2025-10-31",
  "description": "Professional Services - October 2025",
  "lineItems": [
    {
      "description": "Consulting Services",
      "quantity": 10,
      "unitPrice": 100.00,
      "total": 1000.00
    },
    {
      "description": "Implementation Support",
      "quantity": 5,
      "unitPrice": 100.00,
      "total": 500.00
    }
  ],
  "paymentTerms": "NET30",
  "provider": "tempo"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "invoiceId": "invoice_789",
    "tokenAddress": "cNFT_SolanaAddress123...",
    "metadataUri": "ipfs://QmHash123...",
    "status": "pending",
    "createdAt": "2025-09-28T18:30:00Z",
    "cost": {
      "tokenization": "$0.00005",
      "gas": "0.000025 SOL"
    },
    "sharableLink": "https://monay.com/pay/invoice_789",
    "qrCode": "data:image/png;base64,..."
  }
}
```

### Get Invoice
```http
GET /api/enterprise-treasury/invoice/:invoiceId
```

**Response:**
```json
{
  "success": true,
  "data": {
    "invoiceId": "invoice_789",
    "invoiceNumber": "INV-2025-001",
    "issuer": {
      "id": "enterprise_001",
      "name": "Acme Corporation"
    },
    "recipient": {
      "id": "customer_456",
      "email": "customer@example.com"
    },
    "amount": 1500.00,
    "paidAmount": 750.00,
    "status": "partially_paid",
    "dueDate": "2025-10-31",
    "tokenAddress": "cNFT_SolanaAddress123...",
    "payments": [
      {
        "id": "payment_123",
        "amount": 750.00,
        "provider": "tempo",
        "date": "2025-09-29T10:00:00Z",
        "transactionId": "tx_tempo_123"
      }
    ],
    "lineItems": [...],
    "events": [
      {
        "type": "created",
        "timestamp": "2025-09-28T18:30:00Z"
      },
      {
        "type": "payment_received",
        "amount": 750.00,
        "timestamp": "2025-09-29T10:00:00Z"
      }
    ]
  }
}
```

### List Invoices
```http
GET /api/enterprise-treasury/invoices
```

**Query Parameters:**
- `status` - Filter by status (pending, paid, partially_paid, overdue)
- `startDate` - Start date range (ISO 8601)
- `endDate` - End date range (ISO 8601)
- `recipientId` - Filter by recipient
- `page` - Page number (default: 1)
- `limit` - Results per page (default: 20, max: 100)

**Response:**
```json
{
  "success": true,
  "data": {
    "invoices": [...],
    "pagination": {
      "total": 245,
      "page": 1,
      "pages": 13,
      "limit": 20
    },
    "stats": {
      "totalAmount": 125000.00,
      "paidAmount": 90000.00,
      "pendingAmount": 35000.00
    }
  }
}
```

---

## Payment Processing

### Pay Invoice
Process payment for an invoice using specified provider.

```http
POST /api/enterprise-treasury/invoice/pay
```

**Request Body:**
```json
{
  "invoiceId": "invoice_789",
  "amount": 750.00,
  "provider": "tempo",
  "payerInfo": {
    "id": "payer_123",
    "email": "payer@example.com"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "paymentId": "payment_456",
    "invoiceId": "invoice_789",
    "amount": 750.00,
    "provider": "tempo",
    "status": "completed",
    "transactionId": "tx_tempo_456",
    "settlementTime": "95ms",
    "fee": 0.0001,
    "invoiceStatus": "partially_paid",
    "remainingBalance": 750.00,
    "receipt": {
      "url": "https://monay.com/receipt/payment_456",
      "pdf": "https://monay.com/receipt/payment_456.pdf"
    }
  }
}
```

### Process Batch Payment
Pay multiple invoices in a single transaction.

```http
POST /api/enterprise-treasury/invoice/batch-pay
```

**Request Body:**
```json
{
  "payments": [
    {
      "invoiceId": "invoice_789",
      "amount": 750.00
    },
    {
      "invoiceId": "invoice_790",
      "amount": 1000.00
    }
  ],
  "provider": "tempo",
  "payerId": "payer_123"
}
```

---

## P2P Request-to-Pay

### Create Payment Request
Creates a P2P payment request with mandatory audit reason.

```http
POST /api/p2p-transfer/request
```

**Request Body:**
```json
{
  "fromUserId": "user_001",
  "toUserId": "user_002",
  "amount": 100.00,
  "currency": "USDC",
  "reason": "Team lunch reimbursement - Q3 meeting",
  "category": "expense_reimbursement",
  "dueDate": "2025-10-01",
  "attachments": [
    {
      "type": "receipt",
      "url": "https://storage.monay.com/receipt_123.jpg"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "requestId": "p2p_request_123",
    "status": "pending",
    "auditTag": "AUDIT_2025092812345",
    "qrCode": "data:image/png;base64,...",
    "sharableLink": "https://monay.com/pay/request/p2p_request_123"
  }
}
```

### Get Payment Requests
```http
GET /api/p2p-transfer/requests
```

**Query Parameters:**
- `type` - sent|received|all
- `status` - pending|paid|rejected|expired

---

## Provider Management

### Swap Providers
Transfer balance between Tempo and Circle.

```http
POST /api/enterprise-treasury/provider/swap
```

**Request Body:**
```json
{
  "from": "tempo",
  "to": "circle",
  "amount": 10000.00,
  "reason": "Compliance requirement"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "swapId": "swap_123",
    "from": {
      "provider": "tempo",
      "previousBalance": 50000.00,
      "newBalance": 40000.00
    },
    "to": {
      "provider": "circle",
      "previousBalance": 20000.00,
      "newBalance": 30000.00
    },
    "amount": 10000.00,
    "completionTime": "45 seconds",
    "status": "completed"
  }
}
```

### On-Ramp Funds
Add funds to treasury from external source.

```http
POST /api/enterprise-treasury/ramp/on
```

**Request Body:**
```json
{
  "amount": 50000.00,
  "source": "bank_transfer",
  "provider": "tempo",
  "reference": "WIRE_123456"
}
```

### Off-Ramp Funds
Withdraw funds from treasury.

```http
POST /api/enterprise-treasury/ramp/off
```

**Request Body:**
```json
{
  "amount": 25000.00,
  "destination": "bank_account",
  "provider": "circle",
  "bankDetails": {
    "accountNumber": "****1234",
    "routingNumber": "****5678"
  }
}
```

---

## Error Handling

### Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "INVOICE_NOT_FOUND",
    "message": "Invoice with ID invoice_999 not found",
    "details": {
      "invoiceId": "invoice_999",
      "timestamp": "2025-09-28T18:45:00Z"
    }
  }
}
```

### Common Error Codes
| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Invalid or expired token |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `INSUFFICIENT_BALANCE` | 400 | Not enough funds |
| `INVOICE_ALREADY_PAID` | 400 | Invoice fully paid |
| `PROVIDER_ERROR` | 502 | External provider error |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |

---

## Webhooks

### Configure Webhook
```http
POST /api/enterprise-treasury/webhooks
```

**Request Body:**
```json
{
  "url": "https://your-app.com/webhooks/monay",
  "events": [
    "invoice.created",
    "invoice.paid",
    "payment.received",
    "treasury.low_balance"
  ],
  "secret": "webhook_secret_123"
}
```

### Webhook Payload Format
```json
{
  "event": "invoice.paid",
  "timestamp": "2025-09-28T18:50:00Z",
  "data": {
    "invoiceId": "invoice_789",
    "amount": 1500.00,
    "paymentId": "payment_789"
  },
  "signature": "sha256=..."
}
```

### Available Webhook Events
- `invoice.created` - New invoice tokenized
- `invoice.paid` - Invoice fully paid
- `invoice.partially_paid` - Partial payment received
- `invoice.overdue` - Invoice past due date
- `payment.received` - Payment processed
- `treasury.low_balance` - Balance below threshold
- `provider.swap_completed` - Provider swap finished
- `p2p.request_created` - New P2P request
- `p2p.request_paid` - P2P request fulfilled

---

## Rate Limits

| Endpoint Type | Limit | Window |
|--------------|-------|--------|
| Authentication | 10 | 1 minute |
| Invoice Creation | 100 | 1 minute |
| Payment Processing | 50 | 1 minute |
| Read Operations | 1000 | 1 minute |

---

## SDKs & Libraries

### JavaScript/TypeScript
```bash
npm install @monay/invoice-sdk
```

```javascript
import { MonayInvoiceSDK } from '@monay/invoice-sdk';

const sdk = new MonayInvoiceSDK({
  apiKey: 'your_api_key',
  environment: 'production'
});

// Create invoice
const invoice = await sdk.createInvoice({
  amount: 1500.00,
  recipientEmail: 'customer@example.com',
  lineItems: [...]
});

// Process payment
const payment = await sdk.payInvoice(invoice.id, 750.00, 'tempo');
```

---

## Postman Collection
Download our Postman collection for easy API testing:
[Download Postman Collection](https://api.monay.com/docs/postman-collection.json)

---

## Support
- **Documentation**: https://docs.monay.com
- **API Status**: https://status.monay.com
- **Support Email**: api-support@monay.com
- **Discord**: https://discord.gg/monay-dev

---

**Last Updated**: September 28, 2025
**Version**: 1.0.0