# Consumer Wallet - Invoice Payment & P2P Implementation
## Comprehensive To-Do List for UI/UX Implementation
**Project Directory**: `/monay-cross-platform/web/`
**Port**: 3003
**Backend API**: Port 3001

---

## 📍 IMPORTANT: Code Organization Rules
- **ALL consumer wallet code** goes in `/monay-cross-platform/web/`
- **Mobile code** goes in `/monay-cross-platform/mobile/`
- **Shared components** go in `/monay-cross-platform/shared/`
- **NO mixing** with enterprise wallet code (`/monay-caas/`)
- **API calls** go through port 3001 backend only

---

## 🎯 Phase 1: Invoice Reception & Display (Week 1)

### 1.1 Invoice Inbox
**Location**: `/src/app/(dashboard)/invoices/page.tsx`
- [ ] Create invoice inbox with tabs (Pending/Paid/All)
- [ ] Display invoice cards with key details
- [ ] Add status indicators (Due/Overdue/Paid)
- [ ] Show amount and due date prominently
- [ ] Add search and filter functionality
- [ ] Implement pull-to-refresh for mobile
- [ ] Add unread invoice badge

### 1.2 Invoice Detail View
**Location**: `/src/app/(dashboard)/invoices/[id]/page.tsx`
- [ ] Display full invoice information
- [ ] Show issuer details (company name, logo)
- [ ] Display line items breakdown
- [ ] Show payment history if partial
- [ ] Display remaining balance
- [ ] Add "Pay Now" prominent button
- [ ] Show QR code for sharing

### 1.3 Invoice Notifications
**Location**: `/src/components/InvoiceAlerts.tsx`
- [ ] Create push notification handler
- [ ] Add in-app notification center
- [ ] Display new invoice alerts
- [ ] Show payment reminder notifications
- [ ] Add overdue invoice warnings
- [ ] Create notification preferences

### 1.4 Invoice Categories
**Location**: `/src/components/InvoiceCategories.tsx`
- [ ] Auto-categorize by type (Utility/Healthcare/etc)
- [ ] Create category filters
- [ ] Add category icons and colors
- [ ] Show category spending summary
- [ ] Enable custom categories

---

## 💳 Phase 2: Invoice Payment Flow (Week 1-2)

### 2.1 Payment Initiation
**Location**: `/src/components/PayInvoice.tsx`
- [ ] Create payment confirmation screen
- [ ] Display invoice summary
- [ ] Show wallet balance check
- [ ] Add insufficient funds warning
- [ ] Display transaction fee ($0.0001)
- [ ] Show provider selection (Tempo/Circle)
- [ ] Add payment amount input (for partial)

### 2.2 Payment Processing
**Location**: `/src/components/PaymentProcessor.tsx`
- [ ] Implement payment authorization
- [ ] Add biometric/PIN confirmation
- [ ] Show processing animation
- [ ] Display real-time status updates
- [ ] Handle success/failure states
- [ ] Show settlement time (<100ms)
- [ ] Generate payment receipt

### 2.3 Partial Payment Handler
**Location**: `/src/components/PartialPayment.tsx`
- [ ] Add partial payment option
- [ ] Create payment amount selector
- [ ] Show remaining balance calculator
- [ ] Display payment schedule option
- [ ] Track partial payment history
- [ ] Show progress indicator

### 2.4 Overpayment & Credits
**Location**: `/src/components/CustomerCredits.tsx`
- [ ] Display credit balance by merchant
- [ ] Show credit source details
- [ ] Add "Apply Credit" option
- [ ] Display credit expiry warnings
- [ ] Create credit history view
- [ ] Add credit transfer option

### 2.5 Payment Confirmation
**Location**: `/src/components/PaymentSuccess.tsx`
- [ ] Show success animation
- [ ] Display transaction details
- [ ] Show Solana transaction link
- [ ] Add receipt download/share
- [ ] Display updated balance
- [ ] Show next invoice if any

---

## 🔄 Phase 3: P2P Request-to-Pay (Week 2)

### 3.1 Create Payment Request
**Location**: `/src/app/(dashboard)/request/create/page.tsx`
- [ ] Add contact selection/search
- [ ] Create amount input with currency
- [ ] Add description/note field
- [ ] Set expiry time option
- [ ] Generate QR code instantly
- [ ] Add share options (SMS/Email/App)
- [ ] Show request preview

### 3.2 Request Management
**Location**: `/src/app/(dashboard)/request/page.tsx`
- [ ] Display sent requests list
- [ ] Show received requests
- [ ] Add status badges (Pending/Paid/Expired)
- [ ] Enable request cancellation
- [ ] Add reminder sending
- [ ] Show request analytics

### 3.3 Request Reception
**Location**: `/src/components/PaymentRequestReceived.tsx`
- [ ] Display request notification
- [ ] Show requester details
- [ ] Display amount and description
- [ ] Add approve/decline buttons
- [ ] Show requester's profile/history
- [ ] Add message to requester option

### 3.4 QR Code Scanner
**Location**: `/src/components/QRScanner.tsx`
- [ ] Implement camera permission request
- [ ] Add QR code scanner interface
- [ ] Parse payment request data
- [ ] Validate QR code format
- [ ] Show scanned request preview
- [ ] Handle invalid QR codes

### 3.5 Request Payment Flow
**Location**: `/src/components/PayRequest.tsx`
- [ ] Show request details confirmation
- [ ] Add payment method selection
- [ ] Display processing status
- [ ] Show success confirmation
- [ ] Update request status
- [ ] Notify requester of payment

---

## 💰 Phase 4: Wallet Integration (Week 2-3)

### 4.1 Balance Display Enhancement
**Location**: `/src/components/WalletBalance.tsx`
- [ ] Show available balance for payments
- [ ] Display pending invoice amounts
- [ ] Add scheduled payment indicators
- [ ] Show credit balances
- [ ] Display provider breakdown (Tempo/Circle)
- [ ] Add balance history graph

### 4.2 Top-Up for Invoice Payment
**Location**: `/src/components/QuickTopUp.tsx`
- [ ] Detect insufficient funds
- [ ] Show required top-up amount
- [ ] Add quick top-up buttons
- [ ] Display top-up methods
- [ ] Show estimated time
- [ ] Auto-proceed to payment after top-up

### 4.3 Transaction History
**Location**: `/src/components/InvoiceTransactions.tsx`
- [ ] Display invoice payment history
- [ ] Show P2P request transactions
- [ ] Add filtering by type/date
- [ ] Display transaction details
- [ ] Add search functionality
- [ ] Export transaction report

### 4.4 Spending Analytics
**Location**: `/src/components/SpendingAnalytics.tsx`
- [ ] Show spending by category
- [ ] Display monthly invoice trends
- [ ] Add merchant breakdown
- [ ] Show payment method stats
- [ ] Display savings from credits
- [ ] Add budget tracking

---

## 📱 Phase 5: Mobile Optimization (Week 3)

### 5.1 Mobile Invoice View
**Location**: `/monay-cross-platform/mobile/src/screens/Invoices/`
- [ ] Create native invoice list
- [ ] Add swipe actions (Pay/Archive)
- [ ] Implement native notifications
- [ ] Add haptic feedback
- [ ] Optimize for thumb reach
- [ ] Add offline capability

### 5.2 Mobile Payment Flow
**Location**: `/monay-cross-platform/mobile/src/screens/Payment/`
- [ ] Create native payment screen
- [ ] Add Face ID/Touch ID
- [ ] Implement native animations
- [ ] Add payment widget
- [ ] Create quick pay shortcuts
- [ ] Add Siri/Google Assistant

### 5.3 Mobile QR Features
**Location**: `/monay-cross-platform/mobile/src/components/QR/`
- [ ] Native camera integration
- [ ] Add torch toggle
- [ ] Implement gallery QR scan
- [ ] Add QR code generator
- [ ] Create shareable QR cards
- [ ] Add NFC tap-to-pay

---

## 🔔 Phase 6: Notifications & Automation (Week 3)

### 6.1 Smart Notifications
**Location**: `/src/services/notifications.service.ts`
- [ ] Configure invoice received alerts
- [ ] Add payment due reminders
- [ ] Set overdue notifications
- [ ] Create payment success alerts
- [ ] Add credit expiry warnings
- [ ] Configure quiet hours

### 6.2 Automated Payments
**Location**: `/src/components/AutoPay.tsx`
- [ ] Add auto-pay setup for recurring
- [ ] Create payment rules engine
- [ ] Add approval thresholds
- [ ] Set provider preferences
- [ ] Configure payment timing
- [ ] Add auto-pay history

### 6.3 Payment Scheduling
**Location**: `/src/components/SchedulePayment.tsx`
- [ ] Create payment scheduler
- [ ] Add calendar integration
- [ ] Set recurring schedules
- [ ] Add payment reminders
- [ ] Show scheduled payments list
- [ ] Enable schedule modification

---

## 🎨 Phase 7: UI/UX Polish (Week 3-4)

### 7.1 Micro-interactions
- [ ] Add payment progress animations
- [ ] Create success celebrations
- [ ] Add loading skeletons
- [ ] Implement smooth transitions
- [ ] Add pull-to-refresh animations
- [ ] Create engaging empty states

### 7.2 Accessibility
- [ ] Add voice-over support
- [ ] Implement large text mode
- [ ] Add color blind modes
- [ ] Create keyboard navigation
- [ ] Add screen reader labels
- [ ] Implement focus management

### 7.3 Performance
- [ ] Optimize invoice list rendering
- [ ] Add image lazy loading
- [ ] Implement infinite scroll
- [ ] Cache invoice data
- [ ] Optimize API calls
- [ ] Add offline queue

---

## 🧪 Phase 8: Testing & Launch (Week 4)

### 8.1 Feature Testing
- [ ] Test payment flows end-to-end
- [ ] Verify partial payments
- [ ] Test credit application
- [ ] Validate P2P requests
- [ ] Test QR code flows
- [ ] Verify notifications

### 8.2 Edge Cases
- [ ] Test insufficient funds
- [ ] Handle network failures
- [ ] Test expired invoices
- [ ] Validate overpayments
- [ ] Test concurrent payments
- [ ] Handle provider failures

### 8.3 User Testing
- [ ] Conduct usability testing
- [ ] Gather feedback on flows
- [ ] Test with real invoices
- [ ] Validate mobile experience
- [ ] Test accessibility features
- [ ] Document user issues

---

## 📁 File Structure to Create

```
/monay-cross-platform/web/src/
├── app/(dashboard)/
│   ├── invoices/
│   │   ├── page.tsx (invoice inbox)
│   │   └── [id]/page.tsx (invoice detail)
│   ├── request/
│   │   ├── page.tsx (request list)
│   │   └── create/page.tsx
│   └── transactions/
│       └── invoices/page.tsx
├── components/
│   ├── invoices/
│   │   ├── InvoiceCard.tsx
│   │   ├── InvoiceAlerts.tsx
│   │   ├── InvoiceCategories.tsx
│   │   └── InvoiceList.tsx
│   ├── payments/
│   │   ├── PayInvoice.tsx
│   │   ├── PaymentProcessor.tsx
│   │   ├── PartialPayment.tsx
│   │   ├── CustomerCredits.tsx
│   │   └── PaymentSuccess.tsx
│   ├── p2p/
│   │   ├── PaymentRequestReceived.tsx
│   │   ├── PayRequest.tsx
│   │   ├── QRScanner.tsx
│   │   └── RequestList.tsx
│   └── wallet/
│       ├── QuickTopUp.tsx
│       ├── InvoiceTransactions.tsx
│       └── SpendingAnalytics.tsx
├── services/
│   ├── invoice.service.ts
│   ├── payment.service.ts
│   └── p2p.service.ts
├── hooks/
│   ├── useInvoices.ts
│   ├── usePayments.ts
│   └── useP2P.ts
└── types/
    ├── invoice.types.ts
    ├── payment.types.ts
    └── p2p.types.ts

/monay-cross-platform/mobile/src/
├── screens/
│   ├── Invoices/
│   │   ├── InvoiceListScreen.tsx
│   │   └── InvoiceDetailScreen.tsx
│   ├── Payment/
│   │   ├── PaymentScreen.tsx
│   │   └── PaymentSuccessScreen.tsx
│   └── P2P/
│       ├── RequestScreen.tsx
│       └── QRScanScreen.tsx
└── components/
    └── QR/
        ├── QRScanner.tsx
        └── QRGenerator.tsx
```

---

## 🔌 API Endpoints to Use

Consumer-specific endpoints:

1. **GET** `/api/invoices/received` - Get user's invoices
2. **POST** `/api/enterprise-treasury/invoice/pay` - Pay invoice
3. **GET** `/api/customer-credits/{userId}` - Get credits
4. **POST** `/api/p2p/request/create` - Create P2P request
5. **POST** `/api/p2p/request/pay` - Pay P2P request
6. **GET** `/api/transactions/invoices` - Invoice transactions

---

## ⚠️ Critical Considerations

1. **Wallet Balance**: Always check before payment
2. **Provider Selection**: Default to Tempo for speed
3. **Credit Application**: Automatic where applicable
4. **Transaction Fees**: Show clearly before confirmation
5. **Security**: Require biometric/PIN for payments
6. **Offline Queue**: Queue payments when offline

---

## 📊 Success Metrics

- [ ] Invoice load time < 1 second
- [ ] Payment completion < 2 seconds
- [ ] QR scan to payment < 5 seconds
- [ ] P2P request creation < 1 second
- [ ] Zero failed payments in testing
- [ ] 95% user satisfaction score

---

## 🔄 Integration Points with Enterprise Wallet

**Note**: These systems are separate but connected through:
1. **Backend API** (Port 3001) - Single source of truth
2. **Solana Blockchain** - Shared transaction layer
3. **Database** - Common invoice and payment records

**NO direct code sharing between wallets!**

---

**Note**: This is the Consumer Wallet implementation only. The Enterprise Wallet has its own separate implementation plan in its own directory.