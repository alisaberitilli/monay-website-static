# Monay Consumer Wallet Integration

## Overview

The payment request page now includes the ability for consumers to create a Monay Wallet during the payment process. Three wallet types are available to suit different consumer needs.

## Wallet Types

### 1. No Wallet (Default)
**Best for**: One-time payments, guest checkout

**Features:**
- No account creation required
- Single payment only
- No saved payment methods
- No transaction history
- Fastest checkout

**Use Case:** Customer making a one-time payment who doesn't need ongoing wallet features.

---

### 2. Ephemeral Wallet
**Best for**: Temporary usage, quick payments without long-term commitment

**Features:**
- ✅ Active for 24 hours
- ✅ No KYC required
- ✅ Instant setup
- ✅ Automatically expires after 24 hours
- ✅ Perfect for one-time or short-term use
- ✅ Wallet address provided immediately

**Technical Details:**
- Wallet address generated: `0x...` (40 hex characters)
- Expires: 24 hours from creation
- No identity verification needed
- Wallet details sent via email

**Use Case:** Customer wants to make multiple payments over a short period (like event tickets, group purchases) without committing to a permanent account.

---

### 3. Persistent Wallet (Recommended)
**Best for**: Regular users, recurring payments, full feature access

**Features:**
- ✅ Permanent account
- ✅ KYC verification required
- ✅ Save multiple payment methods
- ✅ Full transaction history
- ✅ Support for recurring payments
- ✅ Access via mobile app and web
- ✅ Advanced features (staking, rewards, etc.)

**Technical Details:**
- Wallet address generated: `0x...` (40 hex characters)
- Persistent: Never expires
- KYC: Required (post-payment)
- Full Monay Consumer Wallet features

**Use Case:** Regular customer who wants to use Monay as their primary payment platform with saved payment methods and transaction history.

---

### 4. Adaptive Wallet
**Best for**: Users who want flexibility to start simple and upgrade later

**Features:**
- ✅ Start instantly (no KYC upfront)
- ✅ Upgrade to verified wallet anytime
- ✅ Smart transaction limits that adapt
- ✅ Seamless transition to full features
- ✅ Best of both worlds (ephemeral + persistent)
- ✅ Automatic feature unlocking

**Technical Details:**
- Wallet address generated: `0x...` (40 hex characters)
- Initial state: Basic features (like ephemeral)
- Upgrade path: KYC verification unlocks full features
- Transaction limits increase with verification

**Use Case:** Customer who wants to start using Monay immediately but may want full features later without creating a new wallet.

---

## Implementation Flow

### Step 1: Payment Request
Consumer receives payment link:
```
http://localhost:3000/pay?accountNumber=ACC-123456&firstName=John&lastName=Doe&amountDue=1250&dueDate=2025-12-31
```

### Step 2: Payment Page
1. **Payment Details** displayed
2. **Wallet Type Selection** (4 options)
3. **Payment Method Selection** (9 options)

### Step 3: Payment Processing
- Payment is processed via selected method
- If wallet selected (not "No Wallet"):
  - Wallet address generated
  - Wallet type assigned
  - Wallet activation initiated

### Step 4: Confirmation
- Transaction ID provided
- Payment receipt available for download
- **If wallet created**:
  - Wallet address displayed
  - Wallet type confirmed
  - Next steps provided (e.g., KYC link for persistent)

---

## User Interface

### Wallet Type Selection Cards

Each wallet type is presented as a card with:
- **Icon** - Visual identifier
- **Name** - Wallet type name
- **Description** - Brief explanation
- **Features list** - Bullet points of capabilities
- **Recommended badge** (for Persistent Wallet)
- **Color coding**:
  - No Wallet: Slate gray
  - Ephemeral: Blue
  - Persistent: Green (Recommended)
  - Adaptive: Purple

### Selection State
- Selected wallet highlighted with colored border
- Checkmark indicator on selected card
- "What happens next?" info box appears below

### Confirmation Display
When wallet is created, confirmation shows:
- Wallet address (full 40-character hex)
- Wallet type
- Status (Active)
- Next steps based on wallet type

---

## Technical Specifications

### Wallet Address Format
```
0x[40 hexadecimal characters]
```

Example:
```
0x742D35CC6634C0532925A3B844BC9E7FE4B1F783
```

### API Response (Simulated)
```json
{
  "transactionId": "TXN-1633024800000-XYZABC123",
  "walletType": "persistent",
  "walletAddress": "0x742D35CC6634C0532925A3B844BC9E7FE4B1F783",
  "walletStatus": "active",
  "kycRequired": true,
  "kycUrl": "https://monay.com/kyc/verify"
}
```

### Post-Payment Actions

**No Wallet:**
- None - transaction complete

**Ephemeral Wallet:**
1. Email sent with wallet details
2. 24-hour timer starts
3. Wallet can be used for additional payments
4. Auto-expires after 24 hours

**Persistent Wallet:**
1. Email sent with wallet details
2. KYC verification link provided
3. Temporary access until KYC complete
4. Full access after KYC verification

**Adaptive Wallet:**
1. Email sent with wallet details
2. Basic features active immediately
3. Option to upgrade (start KYC) anytime
4. Progressive feature unlocking

---

## Receipt Format

### With Wallet Creation
```
PAYMENT RECEIPT
=====================================

Transaction ID: TXN-1633024800000-XYZABC123
Date: 10/6/2025, 8:30:00 PM

PAYMENT DETAILS
-------------------------------------
Account Number: ACC-123456
Customer: John Doe
Amount Paid: $1250.00
Payment Method: USDC Stablecoin
Due Date: December 31, 2025

WALLET CREATED
-------------------------------------
Wallet Type: Persistent Wallet
Wallet Address: 0x742D35CC6634C0532925A3B844BC9E7FE4B1F783
Status: Active

STATUS: COMPLETED ✓

=====================================
Monay Payment Platform
www.monay.com
```

---

## Testing

### Test URL
```
http://localhost:3000/pay?accountNumber=ACC-123456&firstName=John&lastName=Doe&amountDue=1250&dueDate=2025-12-31
```

### Test Scenarios

**Scenario 1: No Wallet**
1. Navigate to payment URL
2. Select "No Wallet"
3. Select payment method
4. Complete payment
5. ✓ Confirmation shows payment only (no wallet info)

**Scenario 2: Ephemeral Wallet**
1. Navigate to payment URL
2. Select "Ephemeral Wallet"
3. Select payment method (try USDC)
4. Complete payment
5. ✓ Confirmation shows wallet address
6. ✓ 24-hour expiration notice shown

**Scenario 3: Persistent Wallet**
1. Navigate to payment URL
2. Select "Persistent Wallet" (recommended)
3. Select payment method (try Apple Pay)
4. Complete payment
5. ✓ Confirmation shows wallet address
6. ✓ KYC verification notice shown

**Scenario 4: Adaptive Wallet**
1. Navigate to payment URL
2. Select "Adaptive Wallet"
3. Select payment method (try eCheck)
4. Complete payment
5. ✓ Confirmation shows wallet address
6. ✓ Upgrade option notice shown

---

## Production Considerations

### Wallet Creation API
```javascript
POST /api/wallet/create
{
  "walletType": "persistent",
  "customerId": "cust_123",
  "email": "customer@example.com",
  "firstName": "John",
  "lastName": "Doe"
}

Response:
{
  "walletAddress": "0x...",
  "walletType": "persistent",
  "status": "active",
  "kycRequired": true,
  "kycUrl": "https://..."
}
```

### Security
- Wallet private keys stored in secure HSM
- KYC verification via third-party provider (Persona, Onfido)
- Transaction signing with MPC (Multi-Party Computation)
- Biometric authentication for mobile

### Compliance
- KYC/AML for Persistent Wallets
- Transaction monitoring for all wallet types
- Velocity limits for Ephemeral/Adaptive before verification
- FinCEN reporting for applicable transactions

### Integration Points
1. **Email Service** - Send wallet details and verification links
2. **KYC Provider** - Identity verification for persistent wallets
3. **Blockchain Network** - Wallet address generation and management
4. **Database** - Store wallet metadata and user associations
5. **Mobile Apps** - iOS/Android app integration

---

## Benefits

### For Consumers
✅ Choice and flexibility in account creation
✅ No forced registration for one-time payments
✅ Quick start with option to upgrade
✅ Full-featured wallet for regular users

### For Merchants
✅ Higher conversion rates (no forced signup)
✅ Easier customer retention (wallet users)
✅ Reduced cart abandonment
✅ Recurring payment capability

### For Monay
✅ User acquisition funnel (ephemeral → adaptive → persistent)
✅ Lower friction for new users
✅ Compliance flexibility
✅ Differentiated value proposition

---

## Future Enhancements

- [ ] Wallet import/export (private key, seed phrase)
- [ ] Multi-sig wallet option for high-value users
- [ ] Hardware wallet integration (Ledger, Trezor)
- [ ] Social recovery for lost wallets
- [ ] Wallet-to-wallet transfers
- [ ] DeFi integration (staking, lending)
- [ ] Loyalty rewards program
- [ ] Referral bonuses for wallet creation

---

## Support

**Live Demo:**
http://localhost:3000/pay?accountNumber=ACC-123456&firstName=John&lastName=Doe&amountDue=1250&dueDate=2025-12-31

**Documentation:**
- Payment API: `PAYMENT_API.md`
- Quick Start: `QUICK_START.md`

**Support:**
support@monay.com

---

© 2025 Monay. All rights reserved.
