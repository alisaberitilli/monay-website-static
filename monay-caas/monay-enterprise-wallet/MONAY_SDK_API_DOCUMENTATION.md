# 🚀 Monay SDK API Documentation
## Public-Facing API Endpoints for Enterprise Integration

---

## 📋 Table of Contents
1. [Authentication](#authentication)
2. [Customer API](#customer-api)
3. [Invoice API](#invoice-api)
4. [Payment API](#payment-api)
5. [Wallet API](#wallet-api)
6. [Coin API](#coin-api)
7. [Webhook Events](#webhook-events)
8. [Rate Limiting](#rate-limiting)
9. [Error Handling](#error-handling)
10. [SDK Libraries](#sdk-libraries)

---

## 🔐 Authentication

All API requests require authentication using API keys or OAuth 2.0 tokens.

### API Key Authentication
```http
Authorization: Bearer YOUR_API_KEY
X-API-Version: v1
Content-Type: application/json
```

### OAuth 2.0 Flow
```http
POST /api/v1/oauth/token
{
  "grant_type": "client_credentials",
  "client_id": "YOUR_CLIENT_ID",
  "client_secret": "YOUR_CLIENT_SECRET",
  "scope": "customers:read invoices:write payments:execute"
}
```

---

## 👥 Customer API

### Customer Management Endpoints

#### Create Customer
```http
POST /api/v1/customers
{
  "type": "individual|business",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "tax_id": "123-45-6789",
  "company_name": "Acme Corp",
  "address": {
    "street": "123 Main St",
    "city": "San Francisco",
    "state": "CA",
    "postal_code": "94102",
    "country": "US"
  },
  "metadata": {
    "customer_reference": "CUST-001",
    "tags": ["premium", "verified"]
  }
}
```

#### Get Customer
```http
GET /api/v1/customers/{customer_id}
```

#### Update Customer
```http
PUT /api/v1/customers/{customer_id}
```

#### List Customers
```http
GET /api/v1/customers
Query Parameters:
- limit: 10-100 (default: 25)
- offset: 0
- search: string
- type: individual|business
- status: active|inactive|deleted
- verified: true|false
```

#### Search Customers
```http
GET /api/v1/customers/search
Query Parameters:
- q: search query
- fields: name,email,phone,company_name
- fuzzy: true|false
```

#### Customer Verification
```http
POST /api/v1/customers/{customer_id}/verify/email
POST /api/v1/customers/{customer_id}/verify/phone
POST /api/v1/customers/{customer_id}/verify/address
```

#### Customer Balance
```http
GET /api/v1/customers/{customer_id}/balance
```

#### Customer Transactions
```http
GET /api/v1/customers/{customer_id}/transactions
Query Parameters:
- from_date: ISO 8601
- to_date: ISO 8601
- type: payment|invoice|transfer
- status: pending|completed|failed
```

---

## 📄 Invoice API

### Outbound Invoices (You → Customer)

#### Create Invoice
```http
POST /api/v1/invoices/outbound
{
  "customer_id": "cust_123",
  "invoice_number": "INV-2025-001",
  "due_date": "2025-02-28",
  "currency": "USD",
  "line_items": [
    {
      "description": "Professional Services",
      "quantity": 10,
      "unit_price": 150.00,
      "tax_rate": 0.08,
      "discount": 0.10
    }
  ],
  "payment_terms": "NET30",
  "payment_methods": ["card", "bank_transfer", "crypto"],
  "notes": "Thank you for your business",
  "metadata": {
    "po_number": "PO-456",
    "project_id": "PROJ-789"
  },
  "auto_charge": false,
  "reminder_schedule": ["7d", "3d", "1d"]
}
```

#### Send Invoice
```http
POST /api/v1/invoices/{invoice_id}/send
{
  "method": "email|sms",
  "recipients": ["john@example.com"],
  "message": "Custom message"
}
```

#### List Outbound Invoices
```http
GET /api/v1/invoices/outbound
Query Parameters:
- status: draft|sent|viewed|paid|overdue|cancelled
- customer_id: string
- from_date: ISO 8601
- to_date: ISO 8601
```

### Inbound Invoices (Customer → You)

#### Submit Invoice for Payment
```http
POST /api/v1/invoices/inbound
{
  "vendor_id": "vendor_123",
  "invoice_number": "VENDOR-INV-001",
  "amount": 5000.00,
  "currency": "USD",
  "due_date": "2025-02-15",
  "document_url": "https://example.com/invoice.pdf",
  "approval_workflow": {
    "requires_approval": true,
    "approvers": ["manager_id", "cfo_id"]
  }
}
```

#### Approve Inbound Invoice
```http
POST /api/v1/invoices/inbound/{invoice_id}/approve
{
  "approver_id": "user_123",
  "comments": "Approved for payment"
}
```

#### Schedule Payment for Inbound Invoice
```http
POST /api/v1/invoices/inbound/{invoice_id}/schedule-payment
{
  "payment_date": "2025-02-14",
  "payment_method": "bank_transfer",
  "account_id": "acc_123"
}
```

#### List Inbound Invoices
```http
GET /api/v1/invoices/inbound
Query Parameters:
- status: pending_approval|approved|scheduled|paid|rejected
- vendor_id: string
- approval_status: pending|approved|rejected
```

### Invoice Operations

#### Get Invoice
```http
GET /api/v1/invoices/{invoice_id}
```

#### Update Invoice
```http
PUT /api/v1/invoices/{invoice_id}
```

#### Cancel Invoice
```http
POST /api/v1/invoices/{invoice_id}/cancel
{
  "reason": "Customer request",
  "notify_customer": true
}
```

#### Mark Invoice as Paid
```http
POST /api/v1/invoices/{invoice_id}/mark-paid
{
  "payment_method": "cash",
  "payment_date": "2025-01-21",
  "reference": "CHECK-123"
}
```

#### Invoice PDF
```http
GET /api/v1/invoices/{invoice_id}/pdf
```

#### Invoice Payment Link
```http
POST /api/v1/invoices/{invoice_id}/payment-link
{
  "expires_in": 86400,
  "max_uses": 1
}
```

---

## 💳 Payment API

### Payment Methods

#### Add Payment Method
```http
POST /api/v1/payment-methods
{
  "type": "card|bank_account|crypto_wallet",
  "customer_id": "cust_123",

  // Card Details
  "card": {
    "number": "4242424242424242",
    "exp_month": 12,
    "exp_year": 2026,
    "cvc": "123",
    "billing_address": {...}
  },

  // Bank Account
  "bank_account": {
    "account_number": "000123456789",
    "routing_number": "110000000",
    "account_type": "checking|savings",
    "account_holder_name": "John Doe"
  },

  // Crypto Wallet
  "crypto_wallet": {
    "chain": "ethereum|solana|bitcoin",
    "address": "0x1234...",
    "wallet_type": "metamask|phantom|ledger"
  },

  "set_as_default": true
}
```

#### List Payment Methods
```http
GET /api/v1/payment-methods
Query Parameters:
- customer_id: string
- type: card|bank_account|crypto_wallet
- status: active|expired|deleted
```

### Outbound Payments (You → Others)

#### Create Payment
```http
POST /api/v1/payments/outbound
{
  "recipient": {
    "type": "customer|vendor|employee",
    "id": "recipient_123",
    "email": "recipient@example.com"
  },
  "amount": 1000.00,
  "currency": "USD",
  "payment_method": "bank_transfer|card|crypto|check",
  "reference": "Payment for services",
  "invoice_id": "inv_123",
  "schedule": {
    "type": "immediate|scheduled|recurring",
    "date": "2025-02-01",
    "frequency": "monthly",
    "end_date": "2025-12-31"
  },
  "metadata": {
    "category": "operating_expense",
    "department": "engineering"
  }
}
```

#### Bulk Payments
```http
POST /api/v1/payments/outbound/bulk
{
  "batch_name": "Payroll January 2025",
  "total_amount": 150000.00,
  "currency": "USD",
  "payment_date": "2025-01-31",
  "payments": [
    {
      "recipient_id": "emp_001",
      "amount": 5000.00,
      "reference": "Salary"
    },
    {
      "recipient_id": "emp_002",
      "amount": 4500.00,
      "reference": "Salary"
    }
  ],
  "approval_required": true
}
```

### Inbound Payments (Others → You)

#### Request Payment
```http
POST /api/v1/payments/inbound/request
{
  "from": {
    "customer_id": "cust_123",
    "email": "customer@example.com"
  },
  "amount": 500.00,
  "currency": "USD",
  "description": "Payment request for consultation",
  "due_date": "2025-02-15",
  "payment_methods": ["card", "bank_transfer", "crypto"],
  "invoice_id": "inv_456"
}
```

#### Process Inbound Payment
```http
POST /api/v1/payments/inbound/process
{
  "payment_intent_id": "pi_123",
  "payment_method_id": "pm_456",
  "amount": 500.00,
  "currency": "USD",
  "capture": true,
  "confirm": true
}
```

### Payment Operations

#### Get Payment
```http
GET /api/v1/payments/{payment_id}
```

#### List Payments
```http
GET /api/v1/payments
Query Parameters:
- direction: inbound|outbound
- status: pending|processing|completed|failed|refunded
- from_date: ISO 8601
- to_date: ISO 8601
- min_amount: number
- max_amount: number
```

#### Cancel Payment
```http
POST /api/v1/payments/{payment_id}/cancel
{
  "reason": "Duplicate payment",
  "notify_recipient": true
}
```

#### Refund Payment
```http
POST /api/v1/payments/{payment_id}/refund
{
  "amount": 100.00,
  "reason": "Customer request",
  "refund_method": "original|credit"
}
```

### Payment Links

#### Create Payment Link
```http
POST /api/v1/payment-links
{
  "amount": 99.99,
  "currency": "USD",
  "description": "One-time payment",
  "customer_email": "customer@example.com",
  "success_url": "https://example.com/success",
  "cancel_url": "https://example.com/cancel",
  "payment_methods": ["card", "bank_transfer", "crypto"],
  "expires_at": "2025-02-01T00:00:00Z",
  "max_uses": 1,
  "metadata": {
    "order_id": "ORDER-123"
  }
}
```

---

## 💼 Wallet API

### Wallet Management

#### Create Wallet
```http
POST /api/v1/wallets
{
  "type": "enterprise|consumer|merchant",
  "name": "Operations Wallet",
  "currency": "USD",
  "hierarchy": {
    "parent_wallet_id": "wallet_parent_123",
    "spending_limits": {
      "daily": 10000,
      "monthly": 100000,
      "per_transaction": 5000
    }
  },
  "auto_issue_cards": true,
  "card_configuration": {
    "type": "virtual|physical",
    "spending_limit": 5000,
    "categories_allowed": ["travel", "office_supplies"],
    "categories_blocked": ["gambling", "adult"]
  },
  "compliance": {
    "kyc_level": "standard|enhanced",
    "aml_monitoring": true
  }
}
```

#### Get Wallet
```http
GET /api/v1/wallets/{wallet_id}
```

#### List Wallets
```http
GET /api/v1/wallets
Query Parameters:
- type: enterprise|consumer|merchant
- status: active|frozen|closed
- parent_id: string
- has_cards: true|false
```

#### Update Wallet
```http
PUT /api/v1/wallets/{wallet_id}
```

#### Freeze/Unfreeze Wallet
```http
POST /api/v1/wallets/{wallet_id}/freeze
POST /api/v1/wallets/{wallet_id}/unfreeze
```

### Wallet Transactions

#### Transfer Between Wallets
```http
POST /api/v1/wallets/transfer
{
  "from_wallet_id": "wallet_123",
  "to_wallet_id": "wallet_456",
  "amount": 1000.00,
  "currency": "USD",
  "reference": "Budget allocation",
  "metadata": {
    "department": "marketing",
    "project": "Q1-campaign"
  }
}
```

#### Fund Wallet
```http
POST /api/v1/wallets/{wallet_id}/fund
{
  "amount": 5000.00,
  "currency": "USD",
  "source": {
    "type": "bank_account|card|crypto",
    "payment_method_id": "pm_123"
  },
  "reference": "Monthly funding"
}
```

#### Withdraw from Wallet
```http
POST /api/v1/wallets/{wallet_id}/withdraw
{
  "amount": 2000.00,
  "currency": "USD",
  "destination": {
    "type": "bank_account|card|crypto",
    "payment_method_id": "pm_456"
  },
  "reference": "Profit withdrawal"
}
```

#### Wallet Balance
```http
GET /api/v1/wallets/{wallet_id}/balance
Response:
{
  "available_balance": 10000.00,
  "pending_balance": 500.00,
  "reserved_balance": 200.00,
  "currency": "USD",
  "last_updated": "2025-01-21T12:00:00Z"
}
```

#### Wallet Transactions
```http
GET /api/v1/wallets/{wallet_id}/transactions
Query Parameters:
- from_date: ISO 8601
- to_date: ISO 8601
- type: credit|debit|transfer|card_spend
- status: pending|completed|failed
- limit: 10-100
- offset: 0
```

### Wallet Cards

#### Issue Card
```http
POST /api/v1/wallets/{wallet_id}/cards
{
  "type": "virtual|physical",
  "cardholder_name": "John Doe",
  "spending_limit": 5000.00,
  "expiry_date": "2027-12",
  "billing_address": {...},
  "shipping_address": {...},  // For physical cards
  "pin": {
    "set_by": "user|system",
    "delivery_method": "sms|email"
  },
  "controls": {
    "categories_allowed": ["travel", "dining"],
    "categories_blocked": ["gambling"],
    "merchant_whitelist": ["AMZN", "UBER"],
    "international_enabled": true,
    "atm_enabled": true,
    "online_enabled": true
  }
}
```

#### List Wallet Cards
```http
GET /api/v1/wallets/{wallet_id}/cards
```

#### Update Card Controls
```http
PUT /api/v1/wallets/{wallet_id}/cards/{card_id}/controls
```

#### Freeze/Unfreeze Card
```http
POST /api/v1/wallets/{wallet_id}/cards/{card_id}/freeze
POST /api/v1/wallets/{wallet_id}/cards/{card_id}/unfreeze
```

---

## 🪙 Coin API

### Token Management

#### Create Token
```http
POST /api/v1/coins
{
  "name": "Acme Coin",
  "symbol": "ACME",
  "blockchain": "base|solana",
  "standard": "ERC-3643|Token-2022",
  "total_supply": 1000000000,
  "decimals": 18,
  "initial_distribution": {
    "treasury": 0.40,
    "team": 0.20,
    "public_sale": 0.30,
    "reserves": 0.10
  },
  "compliance": {
    "kyc_required": true,
    "accredited_only": false,
    "transfer_restrictions": ["US", "CA"],
    "holding_period": 180
  },
  "tokenomics": {
    "mint_enabled": true,
    "burn_enabled": true,
    "max_supply": 2000000000,
    "inflation_rate": 0.02
  }
}
```

#### Get Token Info
```http
GET /api/v1/coins/{token_id}
```

#### List Tokens
```http
GET /api/v1/coins
Query Parameters:
- blockchain: base|solana|all
- status: active|paused|deprecated
- compliance_level: standard|enhanced
```

### Token Operations

#### Mint Tokens
```http
POST /api/v1/coins/{token_id}/mint
{
  "amount": 100000,
  "recipient_wallet": "wallet_123",
  "reason": "Monthly rewards distribution",
  "approval": {
    "required": true,
    "approvers": ["treasury_manager", "cfo"]
  }
}
```

#### Burn Tokens
```http
POST /api/v1/coins/{token_id}/burn
{
  "amount": 50000,
  "from_wallet": "wallet_456",
  "reason": "Quarterly token burn",
  "transaction_hash": "0x123..."
}
```

#### Transfer Tokens
```http
POST /api/v1/coins/{token_id}/transfer
{
  "from": "wallet_123",
  "to": "wallet_456",
  "amount": 1000,
  "memo": "Payment for services",
  "compliance_check": true
}
```

#### Swap Tokens (Cross-Rail)
```http
POST /api/v1/coins/swap
{
  "from_token": "token_base_123",
  "to_token": "token_solana_456",
  "amount": 10000,
  "slippage_tolerance": 0.01,
  "recipient_wallet": "wallet_789"
}
```

### Token Staking

#### Stake Tokens
```http
POST /api/v1/coins/{token_id}/stake
{
  "amount": 5000,
  "wallet_id": "wallet_123",
  "lock_period": 90,
  "auto_compound": true
}
```

#### Unstake Tokens
```http
POST /api/v1/coins/{token_id}/unstake
{
  "stake_id": "stake_123",
  "amount": 2500
}
```

#### Get Staking Rewards
```http
GET /api/v1/coins/{token_id}/staking-rewards
Query Parameters:
- wallet_id: string
- from_date: ISO 8601
- to_date: ISO 8601
```

### Token Analytics

#### Token Metrics
```http
GET /api/v1/coins/{token_id}/metrics
Response:
{
  "market_cap": 50000000,
  "circulating_supply": 500000000,
  "holders": 15234,
  "transactions_24h": 4521,
  "volume_24h": 1250000,
  "price_usd": 0.10
}
```

#### Token Holders
```http
GET /api/v1/coins/{token_id}/holders
Query Parameters:
- limit: 10-100
- offset: 0
- min_balance: number
```

#### Token Transactions
```http
GET /api/v1/coins/{token_id}/transactions
Query Parameters:
- from_date: ISO 8601
- to_date: ISO 8601
- type: mint|burn|transfer|swap
- wallet_id: string
```

---

## 🔔 Webhook Events

### Webhook Configuration
```http
POST /api/v1/webhooks
{
  "url": "https://your-app.com/webhooks",
  "events": [
    "customer.created",
    "customer.verified",
    "invoice.created",
    "invoice.paid",
    "payment.completed",
    "payment.failed",
    "wallet.created",
    "wallet.funded",
    "token.minted",
    "token.transferred"
  ],
  "secret": "webhook_secret_key",
  "active": true
}
```

### Event Types

#### Customer Events
- `customer.created`
- `customer.updated`
- `customer.verified`
- `customer.deleted`

#### Invoice Events
- `invoice.created`
- `invoice.sent`
- `invoice.viewed`
- `invoice.paid`
- `invoice.overdue`
- `invoice.cancelled`

#### Payment Events
- `payment.initiated`
- `payment.processing`
- `payment.completed`
- `payment.failed`
- `payment.refunded`
- `payment.cancelled`

#### Wallet Events
- `wallet.created`
- `wallet.funded`
- `wallet.withdrawn`
- `wallet.frozen`
- `wallet.card_issued`
- `wallet.card_used`

#### Token Events
- `token.created`
- `token.minted`
- `token.burned`
- `token.transferred`
- `token.swapped`
- `token.staked`

### Webhook Payload Example
```json
{
  "id": "evt_123",
  "type": "payment.completed",
  "created": "2025-01-21T12:00:00Z",
  "data": {
    "payment_id": "pay_456",
    "amount": 1000.00,
    "currency": "USD",
    "status": "completed",
    "customer_id": "cust_789"
  },
  "signature": "sha256_hash_of_payload"
}
```

---

## ⚡ Rate Limiting

### Default Limits
- **Standard Tier**: 1,000 requests/hour
- **Professional Tier**: 10,000 requests/hour
- **Enterprise Tier**: 100,000 requests/hour
- **Custom Tier**: Negotiated limits

### Rate Limit Headers
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 950
X-RateLimit-Reset: 1643723400
```

### Burst Limits
- 100 requests per 10 seconds (Standard)
- 500 requests per 10 seconds (Professional)
- 2000 requests per 10 seconds (Enterprise)

---

## ❌ Error Handling

### Error Response Format
```json
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "The request was invalid",
    "details": {
      "field": "email",
      "reason": "Invalid email format"
    },
    "request_id": "req_123",
    "documentation_url": "https://docs.monay.com/errors/INVALID_REQUEST"
  }
}
```

### Common Error Codes
- `400` - Bad Request
- `401` - Unauthorized
- `402` - Payment Required
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Unprocessable Entity
- `429` - Too Many Requests
- `500` - Internal Server Error
- `503` - Service Unavailable

### Error Types
- `AUTHENTICATION_ERROR`
- `AUTHORIZATION_ERROR`
- `VALIDATION_ERROR`
- `RATE_LIMIT_ERROR`
- `RESOURCE_NOT_FOUND`
- `DUPLICATE_RESOURCE`
- `PAYMENT_ERROR`
- `COMPLIANCE_ERROR`
- `INSUFFICIENT_FUNDS`
- `SERVICE_ERROR`

---

## 📚 SDK Libraries

### Available SDKs

#### Node.js/TypeScript
```bash
npm install @monay/sdk
```
```javascript
const Monay = require('@monay/sdk');
const monay = new Monay('YOUR_API_KEY');

const customer = await monay.customers.create({
  name: 'John Doe',
  email: 'john@example.com'
});
```

#### Python
```bash
pip install monay-sdk
```
```python
from monay import MonayClient

client = MonayClient(api_key='YOUR_API_KEY')
customer = client.customers.create(
    name='John Doe',
    email='john@example.com'
)
```

#### Go
```bash
go get github.com/monay/monay-go
```
```go
import "github.com/monay/monay-go"

client := monay.NewClient("YOUR_API_KEY")
customer, err := client.Customers.Create(&monay.CustomerParams{
    Name:  "John Doe",
    Email: "john@example.com",
})
```

#### Ruby
```bash
gem install monay
```
```ruby
require 'monay'
Monay.api_key = 'YOUR_API_KEY'

customer = Monay::Customer.create(
  name: 'John Doe',
  email: 'john@example.com'
)
```

#### PHP
```bash
composer require monay/monay-php
```
```php
require_once 'vendor/autoload.php';
\Monay\Monay::setApiKey('YOUR_API_KEY');

$customer = \Monay\Customer::create([
    'name' => 'John Doe',
    'email' => 'john@example.com'
]);
```

#### Java
```xml
<dependency>
  <groupId>com.monay</groupId>
  <artifactId>monay-java</artifactId>
  <version>1.0.0</version>
</dependency>
```
```java
Monay.apiKey = "YOUR_API_KEY";
Customer customer = Customer.create(
    new CustomerParams()
        .setName("John Doe")
        .setEmail("john@example.com")
);
```

---

## 🔧 Testing

### Test Environment
Base URL: `https://api.sandbox.monay.com`

### Test API Keys
- Public Key: `pk_test_...`
- Secret Key: `sk_test_...`

### Test Data
- Test Card: `4242 4242 4242 4242`
- Test Bank Account: `000123456789`
- Test Crypto Wallet: `0xtest...`

### Webhook Testing
Use [webhook.site](https://webhook.site) or ngrok for testing webhooks locally.

---

## 📖 Additional Resources

### Documentation
- [API Reference](https://docs.monay.com/api)
- [SDK Documentation](https://docs.monay.com/sdks)
- [Integration Guides](https://docs.monay.com/guides)
- [Best Practices](https://docs.monay.com/best-practices)

### Support
- Email: api-support@monay.com
- Slack: [monay-developers.slack.com](https://monay-developers.slack.com)
- GitHub: [github.com/monay/api-examples](https://github.com/monay/api-examples)

### API Status
- Status Page: [status.monay.com](https://status.monay.com)
- Uptime: 99.95% SLA

---

## 🚀 Quick Start

1. **Get API Keys**: Sign up at [dashboard.monay.com](https://dashboard.monay.com)
2. **Install SDK**: Choose your preferred language SDK
3. **Make First Call**: Test with a simple customer creation
4. **Set Up Webhooks**: Configure webhooks for real-time events
5. **Go Live**: Switch from sandbox to production API keys

---

## 📝 Changelog

### Version 1.0.0 (2025-01-21)
- Initial API release
- Customer management endpoints
- Invoice API (inbound/outbound)
- Payment processing (all methods)
- Wallet management
- Token/Coin operations
- Webhook system
- SDK libraries for 6 languages

---

*Last Updated: 2025-01-21*
*API Version: v1*
*Documentation Version: 1.0.0*