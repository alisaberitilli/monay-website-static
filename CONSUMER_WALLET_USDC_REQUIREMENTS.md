# Consumer Wallet - USDC Integration Requirements

## Overview
This document outlines the requirements for integrating USDC operations into the Monay Consumer Wallet application. The Consumer Wallet should provide simplified, user-friendly access to USDC functionality while leveraging the backend Circle integration already implemented.

## Backend API Endpoints Available

The following endpoints are already implemented in the backend (`monay-backend-common`) and ready for integration:

### Base URL
```
http://localhost:3001/api/circle
```

### Available Endpoints

#### 1. Wallet Management
```javascript
// Create or get user wallet
GET /api/circle/wallets/me
Headers: Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "walletId": "string",
    "address": "0x...",
    "blockchain": "ETH",
    "usdcBalance": 1000.00,
    "status": "active"
  }
}
```

#### 2. Get Balance
```javascript
GET /api/circle/wallets/:walletId/balance
Headers: Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "usdcBalance": 1000.00,
    "balances": [
      {
        "currency": "USDC",
        "amount": 1000.00,
        "updateTime": "2025-01-24T..."
      }
    ]
  }
}
```

#### 3. Transfer USDC
```javascript
POST /api/circle/transfer
Headers: Authorization: Bearer <token>
Body: {
  "amount": 100.00,
  "toAddress": "0xRecipientAddress"
}

Response:
{
  "success": true,
  "data": {
    "transferId": "string",
    "status": "pending",
    "transactionHash": "0x...",
    "amount": 100.00,
    "fees": 5.00
  }
}
```

#### 4. Add Money (Mint USDC)
```javascript
POST /api/circle/mint
Headers: Authorization: Bearer <token>
Body: {
  "amount": 500.00,
  "sourceAccount": {
    "type": "wire",
    "id": "bank_account_id"
  }
}

Response:
{
  "success": true,
  "data": {
    "paymentId": "string",
    "status": "pending",
    "amount": 500.00
  }
}
```

#### 5. Cash Out (Burn USDC)
```javascript
POST /api/circle/burn
Headers: Authorization: Bearer <token>
Body: {
  "amount": 250.00,
  "destinationAccount": {
    "type": "wire",
    "id": "bank_account_id"
  }
}

Response:
{
  "success": true,
  "data": {
    "payoutId": "string",
    "status": "pending",
    "amount": 250.00
  }
}
```

#### 6. Link Bank Account
```javascript
POST /api/circle/bank-accounts
Headers: Authorization: Bearer <token>
Body: {
  "accountNumber": "123456789",
  "routingNumber": "021000021",
  "accountName": "John Doe",
  "bankName": "Chase Bank"
}

Response:
{
  "success": true,
  "data": {
    "bankAccountId": "string",
    "status": "pending_verification"
  }
}
```

#### 7. Estimate Fees
```javascript
POST /api/circle/fees/estimate
Headers: Authorization: Bearer <token>
Body: {
  "operation": "transfer", // or "mint" or "burn"
  "amount": 100.00,
  "chain": "ETH"
}

Response:
{
  "success": true,
  "data": {
    "operation": "transfer",
    "amount": 100.00,
    "fee": 5.00,
    "total": 105.00
  }
}
```

#### 8. Transaction History
```javascript
GET /api/circle/transactions?limit=20&offset=0&type=transfer
Headers: Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "transactions": [...],
    "pagination": {
      "limit": 20,
      "offset": 0,
      "total": 150
    }
  }
}
```

## UI/UX Requirements

### 1. Dashboard Integration
- **USDC Balance Display**
  - Show prominently on main dashboard
  - Format: "$X,XXX.XX USDC"
  - Real-time updates when available
  - Visual indicator for pending transactions

### 2. Send Money (Transfer) Flow
- **Simple Transfer Form**
  - Recipient address/username input
  - Amount input with USD conversion
  - Fee estimation display
  - Confirmation screen before sending
  - Success/failure feedback

- **QR Code Support**
  - Scan QR code to input recipient address
  - Generate QR code for receiving

### 3. Add Money Flow
- **Simplified Deposit Process**
  - Amount selection (preset amounts + custom)
  - Bank account selection
  - Processing time estimate (1-2 business days)
  - Transaction tracking

### 4. Cash Out Flow
- **Withdrawal Process**
  - Amount input with available balance check
  - Bank account selection
  - Processing time notice
  - Withdrawal limits display

### 5. Transaction History
- **Transaction List**
  - Chronological order
  - Type icons (sent/received/added/withdrawn)
  - Status indicators
  - Amount and date/time
  - Tap for details

### 6. Settings
- **USDC Settings Page**
  - View wallet address
  - Copy address button
  - Linked bank accounts
  - Add/remove bank accounts
  - Transaction notifications toggle

## Mobile-Specific Requirements

### iOS Requirements
- **Apple Pay Integration** (Future)
  - Quick add money via Apple Pay
  - Requires additional backend support

- **Face ID/Touch ID**
  - Biometric confirmation for transactions
  - Secure wallet access

- **Push Notifications**
  - Transaction confirmations
  - Balance updates
  - Failed transaction alerts

### Android Requirements
- **Google Pay Integration** (Future)
  - Quick add money via Google Pay
  - Requires additional backend support

- **Fingerprint Authentication**
  - Biometric confirmation
  - Secure wallet access

- **Push Notifications**
  - Same as iOS

## Design Guidelines

### Visual Elements
1. **USDC Branding**
   - Use USDC blue color: #2775CA
   - Display USDC logo where appropriate
   - Clear differentiation from regular USD balance

2. **Status Indicators**
   - Pending: Yellow/Orange with loading animation
   - Success: Green with checkmark
   - Failed: Red with error icon

3. **Amount Display**
   - Always show 2 decimal places
   - Use thousand separators
   - Display USD equivalent where relevant

### User Experience Principles
1. **Simplicity First**
   - Hide complexity from average users
   - Progressive disclosure for advanced features
   - Clear, non-technical language

2. **Trust & Security**
   - Show security badges
   - Display Circle partnership
   - Clear explanation of USDC backing

3. **Speed Perception**
   - Optimistic updates
   - Loading states
   - Progress indicators

## Error Handling

### Common Error Scenarios
1. **Insufficient Balance**
   - Clear message: "You don't have enough USDC"
   - Show available balance
   - Suggest adding money

2. **Network Issues**
   - Retry mechanism
   - Offline mode indication
   - Queue transactions when possible

3. **Invalid Address**
   - Format validation
   - Clear error message
   - Example of correct format

4. **Transaction Failures**
   - Specific reason display
   - Support contact option
   - Transaction ID for reference

## Security Requirements

1. **Authentication**
   - All API calls require JWT token
   - Token refresh mechanism
   - Session timeout handling

2. **Transaction Confirmation**
   - Require biometric or PIN for transactions > $100
   - Show full transaction details before confirmation
   - No ability to edit after submission

3. **Data Protection**
   - Never store private keys
   - Encrypt sensitive data in storage
   - Clear clipboard after address copy

## Performance Requirements

1. **Response Times**
   - Balance refresh: < 2 seconds
   - Transaction submission: < 3 seconds
   - History loading: < 2 seconds

2. **Offline Handling**
   - Cache last known balance
   - Queue transactions when possible
   - Clear offline indicator

## Compliance & Legal

1. **Required Disclosures**
   - "USDC is issued by Circle"
   - "1 USDC = 1 USD"
   - Link to Circle's terms

2. **Transaction Limits**
   - Display user's daily/monthly limits
   - Show limit reset times
   - Explain limit increase process

3. **KYC Integration**
   - Prompt for KYC when required
   - Clear explanation of why needed
   - Progress tracking

## Analytics Events to Track

1. **User Actions**
   - USDC_balance_viewed
   - USDC_transfer_initiated
   - USDC_transfer_completed
   - USDC_add_money_initiated
   - USDC_cash_out_initiated
   - Bank_account_linked

2. **Error Events**
   - Transaction_failed
   - Insufficient_balance
   - Network_error

3. **Performance Metrics**
   - API_response_time
   - Transaction_processing_time
   - Screen_load_time

## Testing Scenarios

### Critical User Flows
1. First-time user adds money
2. User sends USDC to friend
3. User cashes out to bank
4. User checks transaction status
5. User handles failed transaction

### Edge Cases
1. Sending exactly available balance
2. Multiple rapid transactions
3. Network disconnection during transaction
4. App backgrounding during transaction
5. Deep linking to transaction

## Implementation Priorities

### Phase 1 - MVP (Week 1-2)
✅ Display USDC balance
✅ Basic transfer functionality
✅ Transaction history
✅ Error handling

### Phase 2 - Enhanced (Week 3-4)
✅ Add money flow
✅ Cash out flow
✅ Bank account linking
✅ Fee estimation

### Phase 3 - Polish (Week 5-6)
✅ QR code support
✅ Push notifications
✅ Biometric security
✅ Advanced settings

## Technical Considerations

### State Management
- Store wallet info in app state
- Cache transaction history
- Optimistic updates for better UX
- WebSocket for real-time updates (optional)

### API Integration
- Use existing auth token system
- Implement retry logic
- Handle rate limiting
- Process webhook updates

### Platform Differences
- iOS: Use native Swift UI components
- Android: Use Material Design 3
- Web: Responsive design for mobile/desktop

## Dependencies

### Required Libraries
- HTTP client (Axios, Fetch, etc.)
- QR code scanner/generator
- Biometric authentication
- Push notification service
- Number formatting library

### Backend Requirements
- All Circle endpoints implemented ✅
- Authentication system active ✅
- WebSocket server (optional)
- Push notification service

## Success Metrics

1. **Adoption**
   - % of users with USDC balance
   - Daily active USDC users
   - Average balance per user

2. **Usage**
   - Transactions per day
   - Average transaction size
   - Add money conversion rate

3. **Performance**
   - Transaction success rate > 99%
   - API response time < 200ms
   - App crash rate < 0.1%

## Support & Documentation

### User Education
- In-app USDC explainer
- FAQ section
- Video tutorials
- Support chat integration

### Developer Resources
- API documentation link
- Integration examples
- Error code reference
- Testing sandbox access

## Notes for Developer

1. **Authentication**: Use existing auth system - no changes needed
2. **Wallet Creation**: Automatic on first access - GET /wallets/me creates if not exists
3. **Error Handling**: Backend returns consistent error format with `success: false`
4. **Testing**: Use Circle sandbox environment (already configured)
5. **Limits**: Business rules enforced by backend - display messages to user

## Contact for Questions

- Backend API: (Already implemented in monay-backend-common)
- Circle Documentation: https://developers.circle.com
- USDC Information: https://www.circle.com/en/usdc

---

**Document Version**: 1.0
**Last Updated**: January 2025
**Status**: Ready for Implementation

This document provides all requirements for integrating USDC functionality into the Consumer Wallet. The backend is fully implemented and tested. Focus on creating a simple, intuitive user experience that abstracts the complexity of blockchain operations.