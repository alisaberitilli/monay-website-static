# Payment Flow Redesign - Wallet as Upsell with Enterprise KYC

**Updated:** January 2025

## Overview

The payment flow has been redesigned to position wallet creation as an **optional upsell** after payment method selection, with enterprise KYC inheritance for frictionless onboarding.

## New Flow Architecture

### Previous Flow (Problematic)
1. View payment request
2. Create wallet first → Empty wallet!
3. Fund wallet with traditional rails
4. Pay with stablecoins

**Problem:** Required creating a wallet before having any money to put in it.

### New Flow (Optimized)
1. **View payment request** - Amount, account, due date
2. **Select payment method first** - All 9 methods visible (traditional + digital wallets)
3. **Wallet creation upsell** - Side-by-side comparison:
   - Left: Pay directly (standard flow)
   - Right: Create wallet & pay (same payment + future benefits)
4. **Complete payment** - With or without wallet creation
5. **Confirmation** - Receipt + wallet details (if created)

## Key Improvements

### 1. Payment Methods First
- **All 9 payment methods shown initially:**
  - Traditional: eCheck, Debit/Credit Card
  - Digital Wallets: Apple Pay, Google Pay, Venmo, PayPal
  - Future: Stablecoins (USDC, USDT, PYUSD) - for existing wallet holders

### 2. Enterprise KYC Inheritance
- **No duplicate KYC required**
- Enterprise (e.g., Acme Corporation) has already verified the customer
- Customer grants consent for KYC sharing with Monay
- Instant wallet creation using enterprise-verified identity

### 3. Value Proposition Clarity
Side-by-side comparison shows:

**Pay Direct:**
- One-time payment
- Standard processing fees
- No future benefits

**Create Wallet & Pay:**
- Same payment amount
- Same payment method
- $0.25 loyalty credit immediately
- Future payments: instant + low fees
- No additional KYC needed (verified by enterprise)
- Wallet credentials sent to email on file

## Technical Implementation

### URL Parameters (Enhanced)

```
/pay?
  accountNumber=ACC-123456
  &firstName=John
  &lastName=Doe
  &amountDue=1250
  &dueDate=2025-12-31
  &email=john@acme.com                    // NEW: Customer email
  &organizationName=Acme Corporation      // NEW: Enterprise name
```

**Default values if omitted:**
- `email`: defaults to `ali@monay.com`
- `organizationName`: defaults to `Acme Corporation`

### Payment Request JSON Structure

```typescript
interface PaymentRequestData {
  accountNumber: string;
  firstName: string;
  lastName: string;
  amountDue: number;
  dueDate: string;
  email?: string;                    // NEW
  enterpriseKYC?: {                  // NEW
    verified: boolean;
    verificationLevel: 'tier1' | 'tier2';
    employeeId?: string;
    organizationId?: string;
    organizationName?: string;
  };
}
```

### Wallet Types

Three wallet options available:

1. **Ephemeral Wallet**
   - Active for 24 hours
   - No ongoing commitment
   - Instant setup
   - $0.25 loyalty credit

2. **Persistent Wallet** (Recommended)
   - Permanent account
   - Save payment methods
   - Transaction history
   - $0.25 loyalty credit
   - Future instant payments

3. **Adaptive Wallet**
   - Start temporary, upgrade later
   - Smart limits
   - $0.25 loyalty credit
   - Best of both worlds

## User Journey

### Scenario 1: Direct Payment (No Wallet)

1. Customer receives payment link from Acme Corp
2. Opens link: `http://localhost:3000/pay?accountNumber=...`
3. Views payment request details ($1,250 from Acme)
4. Selects payment method: **Credit Card**
5. Sees two options:
   - Pay $1,250 directly (fee: $36.55)
   - Create wallet & pay $1,250 (fee: $36.55 + $0.25 credit)
6. Clicks **"Pay $1,250 Now"**
7. Payment processed
8. Receives confirmation

**Result:** One-time payment, no wallet created

### Scenario 2: Wallet Creation (Recommended Path)

1. Customer receives payment link from Acme Corp
2. Opens link with email: `...&email=john@acme.com&organizationName=Acme Corporation`
3. Views payment request details ($1,250 from Acme)
4. Selects payment method: **Credit Card**
5. Sees side-by-side comparison
6. Reviews **"Create Monay Wallet & Pay"** benefits:
   - $0.25 loyalty credit today
   - Future payments: instant
   - Ultra-low fees on stablecoins
   - Verified by Acme Corp (no ID upload)
7. Selects wallet type: **Persistent** (recommended)
8. Reviews pre-filled information:
   - Payment method: Credit Card (already selected)
   - Email: john@acme.com (from enterprise)
   - KYC: Verified by Acme Corporation
9. Checks consent box: "I authorize Acme Corporation to share my verified identity with Monay"
10. Clicks **"Create Wallet & Pay $1,250"**
11. Payment processed + wallet created
12. Receives confirmation with:
    - Transaction receipt
    - Wallet address
    - $0.25 credit added
    - Email notification sent to john@acme.com

**Result:** Payment complete + Monay wallet created with enterprise KYC

## Email Notification (Wallet Creation)

Customer receives email at address on file:

**Subject:** Your Monay Wallet is Ready! 🎉

**Contents:**
- Wallet download links (iOS & Android app stores)
- Login credentials
- Wallet address
- Initial balance ($0.25 loyalty credit)
- Getting started guide
- Security tips
- Customer support contact

## Enterprise Integration

### For Enterprises Sending Payment Requests

**Basic Request (without KYC sharing):**
```javascript
const paymentUrl = `/pay?accountNumber=ACC-123456&firstName=John&lastName=Doe&amountDue=1250&dueDate=2025-12-31`;
```

**Enhanced Request (with KYC sharing):**
```javascript
const paymentUrl = `/pay?` + new URLSearchParams({
  accountNumber: 'ACC-123456',
  firstName: 'John',
  lastName: 'Doe',
  amountDue: '1250',
  dueDate: '2025-12-31',
  email: 'john@acme.com',
  organizationName: 'Acme Corporation'
}).toString();
```

**API Integration (POST method):**
```javascript
const response = await fetch('/pay/api', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    accountNumber: 'ACC-123456',
    firstName: 'John',
    lastName: 'Doe',
    amountDue: 1250,
    dueDate: '2025-12-31',
    email: 'john@acme.com',
    enterpriseKYC: {
      verified: true,
      verificationLevel: 'tier2',
      organizationName: 'Acme Corporation',
      employeeId: 'EMP-789',
      organizationId: 'ORG-ACME-001'
    }
  })
});

const { redirectUrl } = await response.json();
window.location.href = redirectUrl;
```

### Enterprise Benefits

1. **Customer Retention**
   - Customers create wallets → more likely to use your services again
   - Instant future payments improve UX

2. **Lower Processing Costs**
   - Customers with wallets can pay via stablecoins
   - Stablecoin fees: ~$0.01 vs traditional fees: 2.9%+

3. **Brand Loyalty**
   - Co-branded wallet experience
   - Enterprise-verified customers (trust signal)

4. **Reduced Friction**
   - No duplicate KYC
   - Faster customer onboarding
   - Higher conversion rates

## Components

### `/src/components/WalletCreationUpsell.tsx` (NEW)
Main upsell component showing side-by-side comparison:
- Pay direct option (left)
- Create wallet & pay option (right)
- Wallet type selection (Ephemeral/Persistent/Adaptive)
- Enterprise KYC consent checkbox
- Email notification preview

**Key Features:**
- Dynamic fee calculation based on payment method
- Pre-filled customer email from enterprise
- Organization name display
- KYC consent requirement
- Wallet credentials email notification info

### `/src/app/pay/page.tsx` (UPDATED)
Main payment page orchestrating the flow:

**State Management:**
```typescript
const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
const [createWallet, setCreateWallet] = useState(false);
const [selectedWallet, setSelectedWallet] = useState<WalletType>('none');
const [kycConsent, setKycConsent] = useState(false);
```

**Flow Control:**
1. Show payment method selector (all 9 methods)
2. After method selected → show wallet upsell
3. Customer chooses: direct pay OR create wallet & pay
4. Process payment (with or without wallet creation)
5. Show confirmation (with wallet details if applicable)

### `/src/components/PaymentMethodSelector.tsx` (EXISTING)
Displays all 9 payment methods initially:
- Traditional banking: eCheck, Cards
- Digital wallets: Apple Pay, Google Pay, Venmo, PayPal
- Future: Stablecoins (for existing wallet users)

### `/src/components/PaymentConfirmation.tsx` (EXISTING)
Shows transaction confirmation with optional wallet creation details.

## Testing

### Test URL (Basic)
```
http://localhost:3000/pay?accountNumber=ACC-123456&firstName=John&lastName=Doe&amountDue=1250&dueDate=2025-12-31
```

**Expected:**
- Shows payment request
- Email defaults to: ali@monay.com
- Organization defaults to: Acme Corporation

### Test URL (Full)
```
http://localhost:3000/pay?accountNumber=ACC-123456&firstName=John&lastName=Doe&amountDue=1250&dueDate=2025-12-31&email=john@acme.com&organizationName=Acme%20Corporation
```

**Expected:**
- Shows payment request
- Email: john@acme.com
- Organization: Acme Corporation
- KYC consent references Acme Corporation

### Test Scenarios

1. **Direct Payment Flow**
   - Select any payment method
   - Click "Pay $1,250 Now"
   - Verify no wallet created

2. **Wallet Creation Flow (Ephemeral)**
   - Select Credit Card
   - Select Ephemeral wallet
   - Check KYC consent
   - Click "Create Wallet & Pay"
   - Verify wallet address generated
   - Verify email notification mentioned

3. **Wallet Creation Flow (Persistent)**
   - Select Apple Pay
   - Select Persistent wallet (recommended)
   - Check KYC consent
   - Click "Create Wallet & Pay"
   - Verify confirmation shows wallet details
   - Verify $0.25 credit mentioned

4. **Wallet Creation Flow (Adaptive)**
   - Select Venmo
   - Select Adaptive wallet
   - Check KYC consent
   - Click "Create Wallet & Pay"
   - Verify adaptive wallet features shown

5. **Without KYC Consent**
   - Select any wallet type
   - Do NOT check consent box
   - Verify button is disabled
   - Verify error message shown

## Benefits Summary

### For Customers
✅ **Choice:** Can pay directly or create wallet
✅ **No Extra Cost:** Wallet creation is free
✅ **Immediate Benefit:** $0.25 loyalty credit
✅ **Future Benefits:** Instant payments, low fees
✅ **No Friction:** Enterprise KYC = no ID upload
✅ **Transparent:** Clear comparison of both options

### For Enterprises
✅ **Customer Acquisition:** Help customers create wallets
✅ **Lower Costs:** Stablecoin payments vs traditional rails
✅ **Brand Value:** Co-branded wallet experience
✅ **Customer Retention:** Wallet users more sticky
✅ **Easy Integration:** Just add email + org parameters

### For Monay
✅ **Wallet Adoption:** Frictionless wallet creation
✅ **Enterprise KYC:** Leverage existing verification
✅ **Network Effects:** More wallets = more value
✅ **Revenue:** Transaction fees + loyalty program
✅ **Competitive Edge:** Unique enterprise integration

## Future Enhancements

### Phase 1 (Current)
- ✅ Side-by-side payment comparison
- ✅ Enterprise KYC inheritance
- ✅ Three wallet types
- ✅ Email notification preview
- ✅ Loyalty credit system

### Phase 2 (Planned)
- [ ] Actual wallet creation API integration
- [ ] Real KYC consent workflow
- [ ] Email notification service
- [ ] Mobile app deep linking
- [ ] Wallet funding dashboard

### Phase 3 (Future)
- [ ] Stablecoin payment for existing wallet users
- [ ] Recurring payment setup
- [ ] Multi-currency support
- [ ] Loyalty rewards program
- [ ] Enterprise analytics dashboard

## API Endpoints

### POST `/api/pay`
Create payment request and redirect to payment page.

**Request:**
```json
{
  "accountNumber": "ACC-123456",
  "firstName": "John",
  "lastName": "Doe",
  "amountDue": 1250,
  "dueDate": "2025-12-31",
  "email": "john@acme.com",
  "enterpriseKYC": {
    "verified": true,
    "verificationLevel": "tier2",
    "organizationName": "Acme Corporation"
  }
}
```

**Response:**
```json
{
  "success": true,
  "redirectUrl": "/pay?accountNumber=ACC-123456&...",
  "message": "Payment request created"
}
```

### POST `/api/wallet/create` (Future)
Create wallet with enterprise KYC.

**Request:**
```json
{
  "email": "john@acme.com",
  "firstName": "John",
  "lastName": "Doe",
  "walletType": "persistent",
  "enterpriseKYC": {
    "verified": true,
    "organizationName": "Acme Corporation"
  },
  "kycConsent": true
}
```

**Response:**
```json
{
  "success": true,
  "walletAddress": "0x...",
  "walletType": "persistent",
  "initialBalance": 0.25,
  "emailSent": true
}
```

## Security Considerations

1. **KYC Consent**
   - Explicit checkbox required
   - Logged and auditable
   - Revocable by customer

2. **Enterprise Verification**
   - Enterprises must be pre-approved by Monay
   - Organization IDs validated
   - KYC level verified

3. **Email Validation**
   - Email domain matches enterprise
   - Verification email sent
   - Account activation required

4. **Wallet Security**
   - Private keys never exposed
   - Multi-factor authentication
   - Biometric login (mobile)
   - Recovery mechanisms

## Compliance

### KYC/AML
- Tier 1: Basic verification (ephemeral wallets)
- Tier 2: Full verification (persistent wallets)
- Enterprise KYC inheritance documented
- Audit trail maintained

### Data Privacy
- GDPR compliant
- CCPA compliant
- Customer consent recorded
- Data sharing transparency

### Financial Regulations
- FinCEN MSB registered
- State money transmitter licenses
- Transaction monitoring
- SAR filing capability

---

## Support

**Documentation:** See CLAUDE.md for development guide
**Testing:** Use sample URLs above
**Questions:** Contact dev.lead@monay.com

**Last Updated:** January 2025
**Version:** 2.0 (Redesigned Flow)
