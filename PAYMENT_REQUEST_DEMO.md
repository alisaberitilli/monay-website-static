# Payment Request Demo

A comprehensive payment simulation landing page that demonstrates Monay's multi-rail payment capabilities across traditional banking, digital wallets, and blockchain-based stablecoins.

## Overview

This demo allows users to:
1. Upload a JSON file with payment request details
2. Select from 9 different payment methods
3. Simulate payment processing
4. Download payment confirmation receipts

## Access the Demo

Navigate to: **http://localhost:3000/pay**

## Payment Request JSON Format

```json
{
  "accountNumber": "ACC-123456",
  "firstName": "John",
  "lastName": "Doe",
  "amountDue": 1250.00,
  "dueDate": "2025-12-31"
}
```

### Required Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `accountNumber` | string | Customer account identifier | "ACC-123456" |
| `firstName` | string | Customer first name | "John" |
| `lastName` | string | Customer last name | "Doe" |
| `amountDue` | number | Payment amount in USD | 1250.00 |
| `dueDate` | string | Payment due date (ISO 8601) | "2025-12-31" |

## Supported Payment Methods

### Traditional Banking
- **eCheck (ACH)** - Direct bank transfer via ACH network
  - Processing: 1-3 business days
  - Fee: $0.50
  - Ideal for: Recurring payments, large amounts

- **Debit/Credit Card** - Visa, Mastercard, Amex, Discover
  - Processing: Instant
  - Fee: 2.9% + $0.30
  - Ideal for: Consumer payments, immediate processing

### Digital Wallets
- **Apple Pay** - Secure payment with Apple devices
  - Processing: Instant
  - Fee: 2.9% + $0.30
  - Features: Face ID/Touch ID, tokenization

- **Google Pay** - Fast payment through Google platform
  - Processing: Instant
  - Fee: 2.9% + $0.30
  - Features: Google security, cross-device

- **Venmo** - Social payment platform
  - Processing: Instant
  - Fee: 1.9% + $0.10
  - Ideal for: Peer-to-peer, social payments

- **PayPal** - Global payment platform
  - Processing: Instant
  - Fee: 2.99% + $0.49
  - Features: Buyer protection, global acceptance

### Stablecoins (Blockchain)
- **USDC** - USD Coin stablecoin
  - Processing: ~30 seconds
  - Fee: $0.01
  - Network: Ethereum, Polygon, Solana

- **USDT** - Tether stablecoin
  - Processing: ~30 seconds
  - Fee: $0.01
  - Network: Ethereum, Tron, BSC

- **PYUSD** - PayPal USD stablecoin
  - Processing: ~30 seconds
  - Fee: $0.01
  - Network: Ethereum, Solana

## Features

### 1. JSON File Upload
- Drag-and-drop interface
- Click to browse files
- Real-time validation
- Error handling with clear messages
- Sample JSON template provided

### 2. Payment Method Selection
- Organized by category (Traditional, Digital, Stablecoins)
- Visual method cards with icons
- Processing time and fee display
- Single-click selection

### 3. Payment Simulation
- Realistic processing delay
- Transaction ID generation
- Success confirmation

### 4. Payment Confirmation
- Transaction details display
- Downloadable receipt (TXT format)
- Share functionality
- Educational information about each payment method
- "Process Another Payment" option

## Technical Implementation

### Components
- `/src/app/pay/page.tsx` - Main landing page
- `/src/components/PaymentRequestUpload.tsx` - File upload and validation
- `/src/components/PaymentMethodSelector.tsx` - Payment method UI
- `/src/components/PaymentConfirmation.tsx` - Success screen

### Tech Stack
- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Lucide Icons** - Modern icon library

### Key Features
- Client-side only (no backend required for demo)
- Fully responsive design
- Accessibility compliant
- Modern gradient UI
- Smooth animations and transitions

## Testing the Demo

### Step 1: Start the Development Server
```bash
npm run dev
```

### Step 2: Navigate to Payment Request Page
Open your browser to: http://localhost:3000/pay

### Step 3: Use Sample Payment Request
Use the provided `sample-payment-request.json` file:
```bash
# File location
./sample-payment-request.json
```

Or create your own JSON file with the required fields.

### Step 4: Test Payment Flow
1. Upload the JSON file
2. Review payment request details
3. Select a payment method
4. Click "Complete Payment"
5. View confirmation and download receipt

## Sample Test Cases

### Test Case 1: Traditional Banking
```json
{
  "accountNumber": "ACC-100001",
  "firstName": "Alice",
  "lastName": "Johnson",
  "amountDue": 5000.00,
  "dueDate": "2025-11-15"
}
```
Recommended: eCheck for large amount, low fees

### Test Case 2: Consumer Payment
```json
{
  "accountNumber": "ACC-200002",
  "firstName": "Bob",
  "lastName": "Smith",
  "amountDue": 250.50,
  "dueDate": "2025-10-20"
}
```
Recommended: Apple Pay or Google Pay for instant processing

### Test Case 3: Blockchain Payment
```json
{
  "accountNumber": "ACC-300003",
  "firstName": "Carol",
  "lastName": "Williams",
  "amountDue": 10000.00,
  "dueDate": "2025-12-01"
}
```
Recommended: USDC for large amount, ultra-low fees

### Test Case 4: Past Due Payment
```json
{
  "accountNumber": "ACC-400004",
  "firstName": "David",
  "lastName": "Brown",
  "amountDue": 750.00,
  "dueDate": "2025-09-30"
}
```
Recommended: Card for immediate processing

## Production Considerations

To make this production-ready, you would need to:

### 1. Backend Integration
- Create API endpoint: `/api/payment-request`
- Integrate with payment processors:
  - Stripe for cards, Apple Pay, Google Pay
  - Plaid for ACH/eCheck
  - PayPal SDK for PayPal/Venmo
  - Blockchain nodes for stablecoin transactions

### 2. Security
- PCI DSS compliance for card payments
- Secure storage of payment credentials
- Transaction encryption
- Fraud detection and prevention
- Rate limiting and DDoS protection

### 3. Compliance
- KYC/AML verification
- Transaction monitoring
- Regulatory reporting
- Audit trails

### 4. Database
- Store payment requests
- Track transaction history
- Customer payment profiles
- Reconciliation records

### 5. Webhooks
- Payment status updates
- Failed payment notifications
- Settlement confirmations

### 6. Testing
- Unit tests for all components
- Integration tests with payment providers
- Load testing
- Security penetration testing

## UI/UX Features

### Design Elements
- Modern gradient backgrounds
- Card-based layout
- Clear visual hierarchy
- Consistent spacing and typography
- Hover states and transitions

### Accessibility
- Keyboard navigation support
- Screen reader compatible
- ARIA labels
- Color contrast compliance
- Focus indicators

### Mobile Responsive
- Adaptive grid layouts
- Touch-friendly buttons
- Mobile-optimized file upload
- Responsive typography

## Payment Method Details

### ACH/eCheck
- **Network**: Automated Clearing House
- **Settlement**: T+1 to T+3
- **Limits**: Up to $1M per transaction
- **Use Cases**: Payroll, vendor payments, large transactions

### Card Payments
- **Networks**: Visa, Mastercard, Amex, Discover
- **Settlement**: T+1 to T+2
- **Limits**: Based on merchant account
- **Use Cases**: Consumer purchases, instant payments

### Digital Wallets
- **Integration**: SDK-based or API
- **Settlement**: T+1
- **Limits**: Varies by provider
- **Use Cases**: Mobile payments, contactless

### Stablecoins
- **Blockchain**: Ethereum, Solana, Polygon
- **Settlement**: Minutes
- **Limits**: No built-in limits
- **Use Cases**: Cross-border, 24/7 operations, DeFi

## Demo Limitations

This is a **simulation only**:
- ❌ No actual payment processing
- ❌ No real payment provider integration
- ❌ No database storage
- ❌ No authentication required
- ❌ No regulatory compliance

For production use, proper payment processing infrastructure must be implemented.

## Future Enhancements

Potential features to add:
- [ ] Payment scheduling
- [ ] Recurring payments
- [ ] Payment plans/installments
- [ ] Multi-currency support
- [ ] Split payments
- [ ] Payment reminders
- [ ] Receipt email delivery
- [ ] Analytics dashboard
- [ ] Refund processing
- [ ] Dispute management

## Support

For questions or issues:
- Review the code comments in component files
- Check Next.js documentation
- Reference Monay platform documentation

## License

Proprietary - Monay Platform
© 2025 Monay. All rights reserved.
