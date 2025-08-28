# TilliPay Integration Documentation

## Overview
This document describes the TilliPay payment gateway integration for the Monay backend common services. The integration provides comprehensive payment processing capabilities including card payments, ACH transfers, payment links, refunds, and transaction management.

## Configuration

### Environment Variables
Configure the following environment variables in your `.env` file:

```env
# TilliPay Configuration
TILLIPAY_ENV=staging                                    # Environment: staging or production
TILLIPAY_API_URL=https://stagingapi.tillipay.com       # API endpoint URL
TILLIPAY_MERCHANT_ID=your-merchant-id                   # Your TilliPay merchant ID
TILLIPAY_API_KEY=your-api-key                          # Your TilliPay API key
TILLIPAY_SECRET_KEY=your-secret-key                    # Your TilliPay secret key
TILLIPAY_WEBHOOK_SECRET=your-webhook-secret            # Webhook signature secret
```

### Getting Test Credentials
1. Sign up at: https://pregps.tillipay.com/portal/sign-up
2. Submit business/KYC information
3. Test credentials will be automatically assigned
4. Use these credentials in your `.env` file

## API Endpoints

### Authentication & Testing

#### Test Connection
```http
GET /api/tillipay/test-connection
Authorization: Bearer {token}
```

Verifies connection to TilliPay API and validates credentials.

**Response:**
```json
{
  "success": true,
  "message": "Successfully connected to TilliPay",
  "data": {
    "environment": "staging",
    "merchantId": "your-merchant-id"
  }
}
```

### Payment Processing

#### Create Payment Link
```http
POST /api/tillipay/payment-link
Authorization: Bearer {token}
Content-Type: application/json

{
  "amount": 100.00,
  "currency": "USD",
  "description": "Product purchase",
  "customerEmail": "customer@example.com",
  "customerName": "John Doe",
  "customerPhone": "+1234567890",
  "redirectUrl": "https://yourapp.com/success",
  "webhookUrl": "https://yourapp.com/webhook",
  "metadata": {
    "orderId": "12345",
    "productId": "ABC123"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment link created successfully",
  "data": {
    "transactionId": "550e8400-e29b-41d4-a716-446655440000",
    "paymentLinkId": "link_123",
    "paymentUrl": "https://pay.tillipay.com/link_123",
    "orderId": "ORD_123",
    "expiresAt": "2024-01-01T12:00:00Z"
  }
}
```

#### Process Card Payment
```http
POST /api/tillipay/payment/card
Authorization: Bearer {token}
Content-Type: application/json

{
  "amount": 50.00,
  "currency": "USD",
  "cardNumber": "4111111111111111",
  "expMonth": 12,
  "expYear": 2025,
  "cvv": "123",
  "cardHolderName": "John Doe",
  "billing": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "address": "123 Main St",
    "city": "New York",
    "state": "NY",
    "postalCode": "10001",
    "country": "US"
  },
  "metadata": {
    "customField": "value"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment processed successfully",
  "data": {
    "transactionId": "550e8400-e29b-41d4-a716-446655440000",
    "externalTransactionId": "txn_123",
    "orderId": "CARD_123",
    "status": "COMPLETED",
    "authorizationCode": "AUTH123"
  }
}
```

#### Process ACH Payment
```http
POST /api/tillipay/payment/ach
Authorization: Bearer {token}
Content-Type: application/json

{
  "amount": 500.00,
  "currency": "USD",
  "accountNumber": "123456789012",
  "routingNumber": "021000021",
  "accountType": "checking",
  "accountHolderName": "John Doe",
  "customer": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "address": "123 Main St",
    "city": "New York",
    "state": "NY",
    "postalCode": "10001",
    "country": "US"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "ACH payment initiated successfully",
  "data": {
    "transactionId": "550e8400-e29b-41d4-a716-446655440000",
    "externalTransactionId": "ach_123",
    "orderId": "ACH_123",
    "status": "PROCESSING",
    "estimatedSettlement": "2024-01-02T12:00:00Z"
  }
}
```

### Transaction Management

#### Get Payment Status
```http
GET /api/tillipay/payment/status/{transactionId}
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment status retrieved successfully",
  "data": {
    "transactionId": "550e8400-e29b-41d4-a716-446655440000",
    "externalTransactionId": "txn_123",
    "status": "COMPLETED",
    "amount": 100.00,
    "currency": "USD",
    "orderId": "ORD_123",
    "createdAt": "2024-01-01T10:00:00Z",
    "updatedAt": "2024-01-01T10:05:00Z"
  }
}
```

#### Refund Payment
```http
POST /api/tillipay/payment/refund/{transactionId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "amount": 50.00,  // Optional, defaults to full amount
  "reason": "Customer requested refund"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment refunded successfully",
  "data": {
    "refundTransactionId": "550e8400-e29b-41d4-a716-446655440001",
    "refundId": "refund_123",
    "originalTransactionId": "550e8400-e29b-41d4-a716-446655440000",
    "amount": 50.00,
    "status": "REFUNDED",
    "processedAt": "2024-01-01T11:00:00Z"
  }
}
```

#### Capture Payment
```http
POST /api/tillipay/payment/capture/{transactionId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "amount": 100.00  // Optional, defaults to authorized amount
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment captured successfully",
  "data": {
    "transactionId": "550e8400-e29b-41d4-a716-446655440000",
    "externalTransactionId": "txn_123",
    "amount": 100.00,
    "status": "CAPTURED",
    "capturedAt": "2024-01-01T11:00:00Z"
  }
}
```

#### Void Payment
```http
POST /api/tillipay/payment/void/{transactionId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "reason": "Order cancelled"  // Optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment voided successfully",
  "data": {
    "transactionId": "550e8400-e29b-41d4-a716-446655440000",
    "externalTransactionId": "txn_123",
    "status": "VOIDED",
    "voidedAt": "2024-01-01T11:00:00Z"
  }
}
```

#### Get Transaction History
```http
GET /api/tillipay/transactions
Authorization: Bearer {token}

Query Parameters:
- startDate: ISO 8601 date (optional)
- endDate: ISO 8601 date (optional)
- limit: 1-500 (default: 100)
- offset: >= 0 (default: 0)
- status: pending|completed|failed|refunded|voided (optional)
- orderId: string (optional)
```

**Response:**
```json
{
  "success": true,
  "message": "Transaction history retrieved successfully",
  "data": {
    "transactions": [
      {
        "transactionId": "txn_1",
        "amount": 100.00,
        "currency": "USD",
        "status": "COMPLETED",
        "createdAt": "2024-01-01T10:00:00Z",
        "internalTransactionId": "550e8400-e29b-41d4-a716-446655440000"
      }
    ],
    "totalCount": 150,
    "hasMore": true,
    "limit": 100,
    "offset": 0
  }
}
```

### Webhooks

#### Webhook Endpoint
```http
POST /api/tillipay/webhook
X-TilliPay-Signature: {signature}
Content-Type: application/json

{
  "eventType": "payment.completed",
  "transactionId": "txn_123",
  "status": "COMPLETED",
  "amount": 100.00,
  "currency": "USD",
  "orderId": "ORD_123",
  "timestamp": "2024-01-01T10:05:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Webhook processed successfully"
}
```

## Webhook Events

The following webhook events are supported:
- `payment.completed` - Payment successfully completed
- `payment.failed` - Payment failed
- `payment.refunded` - Payment refunded
- `payment.voided` - Payment voided
- `payment.captured` - Payment captured
- `payment.authorized` - Payment authorized (pending capture)

## Security

### Authentication
All API endpoints (except webhooks) require JWT authentication. Include the Bearer token in the Authorization header.

### Webhook Signature Validation
Webhooks are validated using HMAC-SHA256 signatures. The signature is sent in the `X-TilliPay-Signature` header.

### Rate Limiting
Payment endpoints are rate-limited to prevent abuse. Default limits:
- 100 requests per 15 minutes per user
- Payment endpoints have additional rate limiting

### Data Security
- Card numbers are never stored in the database
- Only last 4 digits of cards/accounts are stored for reference
- All sensitive data is encrypted in transit
- PCI compliance is maintained through TilliPay's infrastructure

## Error Handling

### Error Response Format
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error description"
}
```

### Common Error Codes
- `400` - Bad Request (validation error)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

## Testing

### Running Integration Tests
```bash
npm test src/tests/tillipay.test.js
```

### Test Cards (Staging Environment)
- **Visa**: 4111111111111111
- **Mastercard**: 5555555555554444
- **Amex**: 378282246310005
- **Discover**: 6011111111111117

### Test Bank Accounts (Staging Environment)
- **Routing Number**: 021000021
- **Account Number**: Any 4-17 digit number

## Database Schema

### Transaction Table Updates
The integration stores transaction data in the existing `Transaction` table with the following fields:
- `userId` - User who initiated the transaction
- `orderId` - Internal order ID
- `externalId` - TilliPay transaction ID
- `amount` - Transaction amount
- `currency` - Currency code
- `type` - Transaction type (payment_link, card_payment, ach_payment, refund)
- `status` - Transaction status
- `provider` - Set to 'tillipay'
- `authorizationCode` - For card payments
- `metadata` - JSON field for additional data

## Migration from Legacy Payment System

To migrate from the existing payment gateway to TilliPay:

1. Update environment variables with TilliPay credentials
2. Update frontend applications to use new endpoints
3. Run migration script to update existing transactions (if needed)
4. Test in staging environment before production deployment

## Support

### TilliPay Support
- Documentation: https://help.tillipay.com/category/37-api-documentation
- Portal: https://pregps.tillipay.com/portal/sign-in (staging)
- Portal: https://gps.tillipay.com/portal/sign-in (production)

### Internal Support
- Technical issues: dev.lead@monay.com
- Integration questions: Contact backend team

## Changelog

### Version 1.0.0 (Current)
- Initial TilliPay integration
- Support for card payments
- Support for ACH payments
- Payment link generation
- Refund processing
- Transaction history
- Webhook handling
- Comprehensive error handling and logging