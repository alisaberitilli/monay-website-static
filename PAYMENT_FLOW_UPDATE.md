# Payment Flow Update - Wallet-Based Payment Methods

## Overview

The payment page now dynamically shows different payment methods based on whether the customer creates a Monay Wallet.

## Payment Method Logic

### When "No Wallet" is Selected
**Shows ALL 9 payment methods:**

**Traditional Banking:**
- eCheck (ACH) - 1-3 business days, $0.50 fee
- Debit/Credit Card - Instant, 2.9% + $0.30 fee

**Digital Wallets:**
- Apple Pay - Instant, 2.9% + $0.30 fee
- Google Pay - Instant, 2.9% + $0.30 fee
- Venmo - Instant, 1.9% + $0.10 fee
- PayPal - Instant, 2.99% + $0.49 fee

**Stablecoins:**
- USDC - ~30 seconds, $0.01 fee
- USDT - ~30 seconds, $0.01 fee
- PYUSD - ~30 seconds, $0.01 fee

---

### When Wallet is Selected (Ephemeral/Persistent/Adaptive)
**Shows ONLY 3 stablecoin payment methods:**

**Stablecoins:**
- USDC - ~30 seconds, $0.01 fee
- USDT - ~30 seconds, $0.01 fee
- PYUSD - ~30 seconds, $0.01 fee

**Why?**
- Stablecoins are native to blockchain wallets
- Ultra-low fees ($0.01 vs 2.9%+)
- Instant settlement (~30 seconds vs days)
- Funds go directly into the wallet
- No intermediary payment processors

---

## User Flow

### Flow 1: Guest Payment (No Wallet)
1. Customer receives invoice
2. Clicks "Pay Now"
3. Views payment details
4. Selects **"No Wallet"** (default)
5. Sees **all 9 payment methods**
6. Chooses any method (e.g., Credit Card)
7. Completes payment
8. Gets confirmation (no wallet created)

### Flow 2: Wallet Payment (Ephemeral)
1. Customer receives invoice
2. Clicks "Pay Now"
3. Views payment details
4. Selects **"Ephemeral Wallet"**
5. Payment methods **filter to only stablecoins** (3 options)
6. Info box explains: "Wallet Payment Methods Only"
7. Chooses stablecoin (e.g., USDC)
8. Completes payment
9. Gets confirmation + wallet address

### Flow 3: Wallet Payment (Persistent)
1. Customer receives invoice
2. Clicks "Pay Now"
3. Views payment details
4. Selects **"Persistent Wallet"** (recommended)
5. Payment methods **filter to only stablecoins** (3 options)
6. Info box explains wallet-only payment methods
7. Chooses stablecoin (e.g., USDT)
8. Completes payment
9. Gets confirmation + wallet address + KYC link

### Flow 4: Wallet Payment (Adaptive)
1. Customer receives invoice
2. Clicks "Pay Now"
3. Views payment details
4. Selects **"Adaptive Wallet"**
5. Payment methods **filter to only stablecoins** (3 options)
6. Info box explains wallet-only payment methods
7. Chooses stablecoin (e.g., PYUSD)
8. Completes payment
9. Gets confirmation + wallet address + upgrade option

---

## Visual Changes

### Information Banner (when wallet selected)
```
┌─────────────────────────────────────────────────────┐
│ 💼 Wallet Payment Methods Only                      │
│                                                      │
│ Since you've selected a Monay Wallet, only         │
│ stablecoin payment methods are available.           │
│ Stablecoins provide instant settlement with         │
│ ultra-low fees and are stored directly in your      │
│ wallet.                                              │
└─────────────────────────────────────────────────────┘
```

### Payment Method Grid

**Without Wallet (3 categories, 9 methods):**
```
TRADITIONAL BANKING
┌───────────┐ ┌───────────┐
│  eCheck   │ │   Card    │
└───────────┘ └───────────┘

DIGITAL WALLETS
┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐
│ Apple Pay │ │Google Pay │ │  Venmo    │ │  PayPal   │
└───────────┘ └───────────┘ └───────────┘ └───────────┘

STABLECOINS
┌───────────┐ ┌───────────┐ ┌───────────┐
│   USDC    │ │   USDT    │ │   PYUSD   │
└───────────┘ └───────────┘ └───────────┘
```

**With Wallet (1 category, 3 methods):**
```
STABLECOINS
┌───────────┐ ┌───────────┐ ┌───────────┐
│   USDC    │ │   USDT    │ │   PYUSD   │
└───────────┘ └───────────┘ └───────────┘
```

---

## Technical Implementation

### Code Changes

**File: `src/components/PaymentMethodSelector.tsx`**

1. Added `walletType` prop
2. Added filtering logic:
```typescript
const hasWallet = walletType !== 'none';
const filteredMethods = hasWallet
  ? paymentMethods.filter(method => method.category === 'crypto')
  : paymentMethods;
```
3. Added info banner when wallet is selected

**File: `src/app/pay/page.tsx`**

1. Pass `walletType` to PaymentMethodSelector:
```typescript
<PaymentMethodSelector
  onSelectMethod={handlePaymentMethodSelect}
  selectedMethod={selectedMethod}
  amount={paymentData.amountDue}
  onSubmit={handlePaymentSubmit}
  walletType={selectedWallet}
/>
```

---

## Benefits

### For Customers
✅ **Lower Fees**: $0.01 vs 2.9%+ for wallet payments
✅ **Faster Settlement**: ~30 seconds vs 1-3 days
✅ **Direct Wallet Funding**: Stablecoins go straight to wallet
✅ **Flexibility**: Can still choose no wallet + any payment method

### For Merchants
✅ **Lower Processing Costs**: Minimal fees on stablecoin payments
✅ **Instant Settlement**: No waiting for funds
✅ **Reduced Chargebacks**: Blockchain transactions are final
✅ **Customer Retention**: Wallet users are more likely to return

### For Monay
✅ **Wallet Adoption**: Encourages users to create wallets
✅ **Lower Costs**: Blockchain settlement vs traditional rails
✅ **User Education**: Shows value of stablecoins vs traditional methods
✅ **Competitive Advantage**: Unique payment flow

---

## Testing

### Test Scenario 1: No Wallet Selected
```
URL: http://localhost:3000/pay?accountNumber=ACC-123456&firstName=John&lastName=Doe&amountDue=1250&dueDate=2025-12-31

Steps:
1. Load page
2. Keep "No Wallet" selected (default)
3. Scroll to payment methods
4. ✓ Should see all 9 payment methods
5. ✓ Should see all 3 categories
```

### Test Scenario 2: Ephemeral Wallet Selected
```
URL: http://localhost:3000/pay?accountNumber=ACC-123456&firstName=John&lastName=Doe&amountDue=1250&dueDate=2025-12-31

Steps:
1. Load page
2. Select "Ephemeral Wallet"
3. Scroll to payment methods
4. ✓ Should see info banner about wallet payments
5. ✓ Should see ONLY 3 stablecoin methods
6. ✓ Should NOT see cards, ACH, or digital wallets
7. ✓ Category should be "STABLECOINS" only
```

### Test Scenario 3: Persistent Wallet Selected
```
URL: http://localhost:3000/pay?accountNumber=ACC-123456&firstName=John&lastName=Doe&amountDue=1250&dueDate=2025-12-31

Steps:
1. Load page
2. Select "Persistent Wallet" (recommended)
3. Scroll to payment methods
4. ✓ Should see info banner
5. ✓ Should see ONLY 3 stablecoin methods
6. Complete payment with USDC
7. ✓ Confirmation should show wallet address
```

### Test Scenario 4: Adaptive Wallet Selected
```
URL: http://localhost:3000/pay?accountNumber=ACC-123456&firstName=John&lastName=Doe&amountDue=1250&dueDate=2025-12-31

Steps:
1. Load page
2. Select "Adaptive Wallet"
3. Scroll to payment methods
4. ✓ Should see info banner
5. ✓ Should see ONLY 3 stablecoin methods
6. Complete payment with PYUSD
7. ✓ Confirmation should show wallet with upgrade option
```

### Test Scenario 5: Switching Wallet Types
```
URL: http://localhost:3000/pay?accountNumber=ACC-123456&firstName=John&lastName=Doe&amountDue=1250&dueDate=2025-12-31

Steps:
1. Load page
2. Select "Persistent Wallet"
3. ✓ Verify only 3 stablecoins shown
4. Switch to "No Wallet"
5. ✓ Verify all 9 methods now shown
6. Switch back to "Ephemeral Wallet"
7. ✓ Verify filtered back to 3 stablecoins
```

---

## Production Considerations

### API Integration
When implementing real payment processing:

**For Stablecoins (Wallet Payments):**
```javascript
// USDC payment via wallet
POST /api/wallet/pay
{
  "walletAddress": "0x...",
  "amount": 1250,
  "currency": "USDC",
  "network": "ethereum" // or "solana"
}
```

**For Traditional Methods (No Wallet):**
```javascript
// Card payment via Stripe
POST /api/payment/card
{
  "amount": 1250,
  "paymentMethodId": "pm_...",
  "customer": {...}
}
```

### Smart Contract Integration
- USDC: Contract address on Ethereum/Polygon/Solana
- USDT: Contract address on Ethereum/Tron/BSC
- PYUSD: Contract address on Ethereum/Solana

### Wallet Funding
After payment completion:
1. Stablecoin transferred to wallet address
2. Transaction confirmed on blockchain
3. Balance updated in wallet
4. Email/push notification sent
5. Transaction recorded in database

---

## FAQ

**Q: Why can't I use my credit card with a wallet?**
A: Wallet payments use stablecoins for instant settlement and ultra-low fees. Traditional payment methods don't integrate directly with blockchain wallets.

**Q: What if I change my mind after selecting a wallet?**
A: Simply select "No Wallet" and all payment methods will become available again.

**Q: Can I add funds to my wallet later using a credit card?**
A: Yes! After creating a wallet, you can add funds via multiple methods in the wallet app.

**Q: What's the advantage of stablecoins?**
A: Stablecoins offer $0.01 fees (vs 2.9%+), instant settlement (~30 seconds), and are pegged 1:1 to USD.

**Q: Do I need cryptocurrency to pay?**
A: No! You can purchase stablecoins during the payment process using fiat currency.

---

## Summary

The payment flow now intelligently adapts based on wallet selection:
- **No Wallet** = All payment methods available
- **Any Wallet Type** = Only stablecoin methods (optimal for wallets)

This creates a seamless, educational experience that highlights the benefits of blockchain-based payments while maintaining flexibility for users who prefer traditional methods.

---

**Live Demo:**
http://localhost:3000/pay?accountNumber=ACC-123456&firstName=John&lastName=Doe&amountDue=1250&dueDate=2025-12-31

**Invoice Example:**
http://localhost:3000/sample-invoice.html

© 2025 Monay. All rights reserved.
