# Payment Request API Documentation

## Overview

The Monay Payment Request system allows you to programmatically create payment requests that direct users to a payment page where they can choose from 9 different payment methods.

## Quick Start

**Test Page**: http://localhost:3000/pay/test

## Methods

### Method 1: URL Parameters (GET)

Direct link with query parameters - the simplest method.

**URL Format:**
```
/pay?accountNumber={value}&firstName={value}&lastName={value}&amountDue={value}&dueDate={value}
```

**Example:**
```
http://localhost:3000/pay?accountNumber=ACC-123456&firstName=John&lastName=Doe&amountDue=1250&dueDate=2025-12-31
```

**HTML Link:**
```html
<a href="/pay?accountNumber=ACC-123456&firstName=John&lastName=Doe&amountDue=1250&dueDate=2025-12-31">
  Pay Now
</a>
```

**HTML Form (GET):**
```html
<form action="/pay" method="GET">
  <input type="text" name="accountNumber" value="ACC-123456" />
  <input type="text" name="firstName" value="John" />
  <input type="text" name="lastName" value="Doe" />
  <input type="number" name="amountDue" value="1250" />
  <input type="date" name="dueDate" value="2025-12-31" />
  <button type="submit">Pay Now</button>
</form>
```

### Method 2: API POST Request

Send JSON data to the API endpoint, receive redirect URL.

**Endpoint:** `/pay/api`

**Method:** `POST`

**Content-Type:** `application/json`

**Request Body:**
```json
{
  "accountNumber": "ACC-123456",
  "firstName": "John",
  "lastName": "Doe",
  "amountDue": 1250,
  "dueDate": "2025-12-31"
}
```

**Response (Success):**
```json
{
  "success": true,
  "redirectUrl": "/pay?accountNumber=ACC-123456&firstName=John&lastName=Doe&amountDue=1250&dueDate=2025-12-31",
  "message": "Payment request received"
}
```

**Response (Error):**
```json
{
  "error": "Missing required fields",
  "required": ["accountNumber", "firstName", "lastName", "amountDue", "dueDate"]
}
```

**JavaScript Example:**
```javascript
fetch('/pay/api', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    accountNumber: "ACC-123456",
    firstName: "John",
    lastName: "Doe",
    amountDue: 1250,
    dueDate: "2025-12-31"
  })
})
.then(res => res.json())
.then(data => {
  if (data.redirectUrl) {
    window.location.href = data.redirectUrl;
  }
});
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/pay/api \
  -H "Content-Type: application/json" \
  -d '{
    "accountNumber": "ACC-123456",
    "firstName": "John",
    "lastName": "Doe",
    "amountDue": 1250,
    "dueDate": "2025-12-31"
  }'
```

**Python Example:**
```python
import requests

data = {
    "accountNumber": "ACC-123456",
    "firstName": "John",
    "lastName": "Doe",
    "amountDue": 1250,
    "dueDate": "2025-12-31"
}

response = requests.post('http://localhost:3000/pay/api', json=data)
result = response.json()

print(f"Redirect to: {result['redirectUrl']}")
```

**PHP Example:**
```php
<?php
$data = array(
    'accountNumber' => 'ACC-123456',
    'firstName' => 'John',
    'lastName' => 'Doe',
    'amountDue' => 1250,
    'dueDate' => '2025-12-31'
);

$ch = curl_init('http://localhost:3000/pay/api');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));

$response = curl_exec($ch);
$result = json_decode($response, true);

header('Location: ' . $result['redirectUrl']);
?>
```

## Parameters

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| accountNumber | string | Yes | Customer account identifier | "ACC-123456" |
| firstName | string | Yes | Customer first name | "John" |
| lastName | string | Yes | Customer last name | "Doe" |
| amountDue | number | Yes | Payment amount in USD (must be positive) | 1250 or 1250.00 |
| dueDate | string | Yes | Payment due date (ISO 8601 format) | "2025-12-31" |

## Payment Methods Available

Once redirected to the payment page, users can choose from:

### Traditional Banking
- **eCheck (ACH)** - 1-3 business days, $0.50 fee
- **Debit/Credit Card** - Instant, 2.9% + $0.30 fee

### Digital Wallets
- **Apple Pay** - Instant, 2.9% + $0.30 fee
- **Google Pay** - Instant, 2.9% + $0.30 fee
- **Venmo** - Instant, 1.9% + $0.10 fee
- **PayPal** - Instant, 2.99% + $0.49 fee

### Stablecoins
- **USDC** - ~30 seconds, $0.01 fee
- **USDT** - ~30 seconds, $0.01 fee
- **PayPal USD (PYUSD)** - ~30 seconds, $0.01 fee

## Error Handling

### API POST Errors

**400 Bad Request - Missing Fields:**
```json
{
  "error": "Missing required fields",
  "required": ["accountNumber", "firstName", "lastName", "amountDue", "dueDate"]
}
```

**400 Bad Request - Invalid Amount:**
```json
{
  "error": "amountDue must be a positive number"
}
```

**400 Bad Request - Invalid JSON:**
```json
{
  "error": "Invalid request format. Expected JSON body."
}
```

## Integration Examples

### E-commerce Platform

```javascript
// After order confirmation
const paymentData = {
  accountNumber: order.accountNumber,
  firstName: customer.firstName,
  lastName: customer.lastName,
  amountDue: order.total,
  dueDate: order.dueDate
};

const response = await fetch('/pay/api', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(paymentData)
});

const { redirectUrl } = await response.json();
window.location.href = redirectUrl;
```

### Email Invoice

```html
<!-- In your email template -->
<a href="https://yourdomain.com/pay?accountNumber=ACC-123456&firstName=John&lastName=Doe&amountDue=1250&dueDate=2025-12-31"
   style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
  Pay Invoice $1,250.00
</a>
```

### Customer Portal

```javascript
// Generate payment link for customer
function generatePaymentLink(invoice) {
  const params = new URLSearchParams({
    accountNumber: invoice.accountNumber,
    firstName: invoice.customer.firstName,
    lastName: invoice.customer.lastName,
    amountDue: invoice.total,
    dueDate: invoice.dueDate
  });

  return `${window.location.origin}/pay?${params.toString()}`;
}

// Copy to clipboard
const paymentLink = generatePaymentLink(invoice);
navigator.clipboard.writeText(paymentLink);
```

### Webhook Integration

```javascript
// Receive webhook from billing system
app.post('/webhook/invoice-created', async (req, res) => {
  const invoice = req.body;

  // Create payment request
  const paymentData = {
    accountNumber: invoice.account_id,
    firstName: invoice.customer.first_name,
    lastName: invoice.customer.last_name,
    amountDue: invoice.amount_due,
    dueDate: invoice.due_date
  };

  const response = await fetch('http://localhost:3000/pay/api', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(paymentData)
  });

  const { redirectUrl } = await response.json();

  // Send email with payment link
  await sendEmail({
    to: invoice.customer.email,
    subject: 'Payment Request',
    body: `Please pay your invoice: ${redirectUrl}`
  });

  res.json({ success: true });
});
```

## Testing

### Test Page
Navigate to http://localhost:3000/pay/test to:
- Fill in payment request data
- Test URL parameter method
- Test API POST method
- See generated code examples
- Copy cURL commands

### Sample Data

```json
{
  "accountNumber": "ACC-123456",
  "firstName": "John",
  "lastName": "Doe",
  "amountDue": 1250,
  "dueDate": "2025-12-31"
}
```

### Direct Test URLs

**Small Amount:**
```
/pay?accountNumber=ACC-001&firstName=Alice&lastName=Smith&amountDue=50&dueDate=2025-10-15
```

**Medium Amount:**
```
/pay?accountNumber=ACC-002&firstName=Bob&lastName=Jones&amountDue=1250&dueDate=2025-11-30
```

**Large Amount:**
```
/pay?accountNumber=ACC-003&firstName=Carol&lastName=Williams&amountDue=10000&dueDate=2025-12-31
```

## Production Deployment

### Environment Variables

Set these in your production environment:

```bash
# Payment processor API keys (when implementing real payments)
STRIPE_SECRET_KEY=sk_live_...
PLAID_CLIENT_ID=...
PLAID_SECRET=...

# Blockchain node endpoints (for stablecoin payments)
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/...
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
```

### Security Considerations

1. **HTTPS Required** - Always use HTTPS in production
2. **Rate Limiting** - Implement rate limiting on API endpoint
3. **CSRF Protection** - Add CSRF tokens for POST requests
4. **Input Validation** - Validate and sanitize all inputs
5. **Amount Limits** - Set maximum transaction amounts
6. **Authentication** - Consider requiring auth for payment creation

### Monitoring

Track these metrics:
- Payment request creation rate
- Successful payment completion rate
- Payment method usage distribution
- Failed payment attempts
- Average time to complete payment

## Support

- **Test Page**: http://localhost:3000/pay/test
- **API Documentation**: http://localhost:3000/pay/api (GET request)
- **Sample Payment**: http://localhost:3000/pay?accountNumber=ACC-123456&firstName=John&lastName=Doe&amountDue=1250&dueDate=2025-12-31

## License

Proprietary - Monay Platform © 2025
