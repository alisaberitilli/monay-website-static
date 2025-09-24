# Consumer Wallet API Documentation

## Overview
This document provides comprehensive API documentation for the Consumer Wallet Phase 1 implementation. All endpoints require authentication unless otherwise specified.

**Base URL**: `http://localhost:3001/api`

**Authentication**: JWT Bearer token in Authorization header
```
Authorization: Bearer <token>
```

---

## Table of Contents
1. [Authentication](#authentication)
2. [Wallet Balance Management](#wallet-balance-management)
3. [P2P Transfers](#p2p-transfers)
4. [Real-time WebSocket](#real-time-websocket)
5. [Error Responses](#error-responses)

---

## Authentication

### Login
**POST** `/auth/login`

Authenticate user and receive JWT token.

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe"
    }
  }
}
```

---

## Wallet Balance Management

### Get Wallet Balance
**GET** `/wallet/balance`

Get real-time wallet balance with pending transactions.

**Query Parameters**:
- `walletId` (optional): Specific wallet ID, defaults to primary wallet

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "walletId": "wallet_123",
    "availableBalance": 1500.50,
    "pendingDebit": 100.00,
    "pendingCredit": 50.00,
    "totalBalance": 1450.50,
    "currency": "USD",
    "status": "active",
    "lastUpdated": "2025-01-23T10:30:45.123Z"
  }
}
```

### Get Wallet Limits
**GET** `/wallet/limits`

Get current wallet limits and usage.

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "limits": {
      "daily": {
        "spending": 5000,
        "p2p": 2500,
        "withdrawal": 1000,
        "transactions": 100
      },
      "monthly": {
        "spending": 50000,
        "p2p": 25000,
        "withdrawal": 10000,
        "transactions": 1000
      },
      "perTransaction": 5000,
      "minimumBalance": 0
    },
    "usage": {
      "daily": {
        "spending": 500,
        "p2p": 200,
        "withdrawal": 0,
        "transactions": 5
      },
      "monthly": {
        "spending": 3000,
        "p2p": 1500,
        "withdrawal": 500,
        "transactions": 50
      }
    },
    "remaining": {
      "daily": {
        "spending": 4500,
        "p2p": 2300,
        "withdrawal": 1000,
        "transactions": 95
      },
      "monthly": {
        "spending": 47000,
        "p2p": 23500,
        "withdrawal": 9500,
        "transactions": 950
      }
    },
    "tier": "verified",
    "nextDailyReset": "2025-01-24T00:00:00.000Z",
    "nextMonthlyReset": "2025-02-01T00:00:00.000Z"
  }
}
```

### Update Wallet Limits
**PUT** `/wallet/limits`

Update wallet transaction limits (requires verification).

**Request Body**:
```json
{
  "daily_spending_limit": 3000,
  "daily_p2p_limit": 1500,
  "per_transaction_limit": 1000
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "message": "Limits updated successfully",
    "limits": { /* Updated limits object */ }
  }
}
```

### Validate Transaction
**POST** `/wallet/validate-transaction`

Check if a transaction can proceed based on limits and balance.

**Request Body**:
```json
{
  "amount": 500,
  "transactionType": "p2p"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "canProceed": true,
    "availableBalance": 1500.50,
    "remainingLimit": 2000,
    "errors": []
  }
}
```

---

## P2P Transfers

### Search Users
**POST** `/p2p-transfer/search`

Search for users to send money to.

**Request Body**:
```json
{
  "query": "john@example.com",
  "type": "email"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "user_456",
        "firstName": "John",
        "lastName": "Smith",
        "email": "john@example.com",
        "hasWallet": true
      }
    ]
  }
}
```

### Validate Recipient
**POST** `/p2p-transfer/validate`

Validate recipient before sending money.

**Request Body**:
```json
{
  "recipientIdentifier": "user@example.com",
  "recipientType": "email"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "isValid": true,
    "user": {
      "id": "user_456",
      "firstName": "Jane",
      "lastName": "Doe",
      "email": "user@example.com"
    },
    "wallet": {
      "id": "wallet_456",
      "status": "active"
    },
    "walletCreated": false
  }
}
```

### Send Money
**POST** `/p2p-transfer/send`

Send money to another user.

**Request Body**:
```json
{
  "recipientIdentifier": "user@example.com",
  "amount": 100.00,
  "note": "Dinner payment",
  "category": "personal",
  "transferMethod": "instant",
  "scheduledDate": null
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "transferId": "transfer_abc123",
    "status": "processing",
    "amount": 100.00,
    "recipient": "Jane Doe",
    "estimatedCompletion": "2025-01-23T10:31:00.000Z",
    "message": "Transfer initiated successfully"
  }
}
```

### Get Transfer Status
**GET** `/p2p-transfer/status/:transferId`

Get current status of a transfer.

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "transferId": "transfer_abc123",
    "status": "completed",
    "amount": 100.00,
    "sender": "John Doe",
    "recipient": "Jane Smith",
    "createdAt": "2025-01-23T10:30:00.000Z",
    "completedAt": "2025-01-23T10:30:45.000Z",
    "note": "Dinner payment"
  }
}
```

### Cancel Transfer
**POST** `/p2p-transfer/cancel/:transferId`

Cancel a pending transfer.

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "transferId": "transfer_abc123",
    "status": "cancelled",
    "message": "Transfer cancelled successfully"
  }
}
```

### Retry Failed Transfer
**POST** `/p2p-transfer/retry/:transferId`

Retry a failed transfer.

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "transferId": "transfer_abc123",
    "status": "processing",
    "retryCount": 1,
    "message": "Transfer retry initiated"
  }
}
```

### Get Transfer History
**GET** `/p2p-transfer/history`

Get transfer history with filters.

**Query Parameters**:
- `limit` (default: 50): Number of records
- `offset` (default: 0): Skip records
- `type` (default: "all"): "sent", "received", or "all"
- `status`: Filter by status
- `startDate`: Start date (ISO 8601)
- `endDate`: End date (ISO 8601)

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "transfers": [
      {
        "id": "transfer_123",
        "type": "sent",
        "amount": 50.00,
        "status": "completed",
        "otherParty": "Jane Smith",
        "note": "Lunch",
        "createdAt": "2025-01-23T12:00:00.000Z"
      }
    ],
    "total": 125,
    "hasMore": true
  }
}
```

### Get Frequent Contacts
**GET** `/p2p-transfer/frequent`

Get frequently used P2P contacts.

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "contacts": [
      {
        "userId": "user_789",
        "firstName": "Bob",
        "lastName": "Johnson",
        "email": "bob@example.com",
        "transactionCount": 15,
        "lastTransaction": "2025-01-20T15:30:00.000Z"
      }
    ]
  }
}
```

---

## Real-time WebSocket

### Connection
Connect to WebSocket server with authentication.

```javascript
const socket = io('http://localhost:3001', {
  auth: {
    token: 'your-jwt-token'
  }
});
```

### Events

#### Subscribe to Balance Updates
```javascript
// Client -> Server
socket.emit('balance:subscribe');

// Server -> Client
socket.on('balance:update', (data) => {
  console.log('Balance updated:', data);
  // data = { walletId, available_balance, currency, timestamp }
});
```

#### Transaction Notifications
```javascript
// Client -> Server
socket.emit('transactions:subscribe');

// Server -> Client
socket.on('transaction:notification', (data) => {
  console.log('New transaction:', data);
  // data = { id, type, amount, status, message, timestamp }
});
```

#### Transfer Status Updates
```javascript
// Client -> Server
socket.emit('transfer:track', transferId);

// Server -> Client
socket.on('transfer:statusUpdate', (data) => {
  console.log('Transfer status:', data);
  // data = { transferId, status, amount, timestamp }
});
```

#### Presence System
```javascript
// Client -> Server
socket.emit('presence:update', 'online');

// Server -> Client
socket.on('presence:update', (data) => {
  console.log('User status:', data);
  // data = { userId, status, timestamp }
});

socket.on('presence:friends', (data) => {
  console.log('Online friends:', data);
  // data = [{ userId, status, lastSeen }]
});
```

#### Chat Messages
```javascript
// Send message
socket.emit('chat:message', {
  recipientId: 'user_123',
  message: 'Hello!'
});

// Receive message
socket.on('chat:message', (data) => {
  console.log('New message:', data);
  // data = { id, senderId, message, timestamp }
});

// Typing indicators
socket.emit('typing:start', { recipientId: 'user_123' });
socket.emit('typing:stop', { recipientId: 'user_123' });

socket.on('typing:start', (data) => {
  console.log('User typing:', data.userId);
});
```

---

## Error Responses

All API errors follow a consistent format:

```json
{
  "success": false,
  "error": {
    "id": "err_abc123",
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "timestamp": "2025-01-23T10:30:45.123Z",
    "requestId": "req_xyz789",
    "details": {
      "errors": [
        {
          "field": "amount",
          "message": "Amount must be positive"
        }
      ]
    }
  }
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `AUTHENTICATION_ERROR` | 401 | Missing or invalid token |
| `AUTHORIZATION_ERROR` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Duplicate resource |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INSUFFICIENT_FUNDS` | 422 | Not enough balance |
| `TRANSACTION_LIMIT_EXCEEDED` | 422 | Limit exceeded |
| `EXTERNAL_SERVICE_ERROR` | 503 | Third-party service down |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Rate Limiting

API endpoints are rate-limited to prevent abuse:

- **Default**: 100 requests per minute per IP
- **Authentication**: 5 attempts per 15 minutes
- **Transfers**: 10 per minute per user
- **Search**: 30 per minute per user

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 2025-01-23T10:31:00.000Z
```

---

## Testing

### Test Credentials
For development/testing environment:

```json
{
  "testUser1": {
    "email": "test1@example.com",
    "password": "Test123!",
    "walletBalance": 1000
  },
  "testUser2": {
    "email": "test2@example.com",
    "password": "Test123!",
    "walletBalance": 500
  }
}
```

### Postman Collection
Import the Postman collection from: `/postman/consumer-wallet.json`

### cURL Examples

**Get Balance**:
```bash
curl -X GET http://localhost:3001/api/wallet/balance \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Send Money**:
```bash
curl -X POST http://localhost:3001/api/p2p-transfer/send \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "recipientIdentifier": "user@example.com",
    "amount": 50,
    "note": "Test transfer"
  }'
```

---

## Changelog

### Version 1.0.0 (Phase 1)
- Initial release
- Wallet balance management
- P2P transfers with state machine
- Real-time WebSocket updates
- Error handling and validation
- Rate limiting

---

## Support

For API issues or questions:
- GitHub Issues: [monay-backend-common/issues](https://github.com/monay/monay-backend-common/issues)
- Email: api-support@monay.com

---

*Last Updated: January 23, 2025*
*Consumer Wallet Phase 1 Implementation*