# 📊 Wallet-Card Architecture for Invoice-First Design

## Core Principles

### 1. **Every Wallet MUST Have At Least One Card**
- Automatic virtual card issuance on wallet creation
- Cards are the spending interface, wallets are the secure backend
- No wallet exists without a payment method

### 2. **Invoice → Wallet → Card(s) Hierarchy**
```
Invoice Created
    ↓
Wallet Generated (based on rules)
    ↓
Virtual Card Auto-Issued (instant)
    ↓
Optional Physical Cards (on request)
```

## Wallet Types & Card Requirements

| Wallet Type | Auto Cards | Additional Cards | Use Case |
|------------|------------|------------------|----------|
| **Invoice Wallet (Ephemeral)** | 1 Virtual (Single-use) | None | One-time B2B payments |
| **Invoice Wallet (Persistent)** | 1 Virtual (Primary) | Multiple allowed | Recurring invoices |
| **Invoice Wallet (Adaptive)** | 1 Virtual (Smart) | Dynamic based on AI | Intelligent routing |
| **Consumer Wallet** | 1 Virtual (Default) | 1 Physical + Additional Virtual | Personal spending |
| **Enterprise Treasury** | Multiple Role-Based | Hierarchical structure | Corporate management |
| **Enterprise Department** | Department Cards | Employee Cards | Team expenses |

## Implementation Details

### Automatic Card Creation Flow

#### 1. Invoice Wallet Creation
```javascript
POST /api/invoice-wallets/generate
{
  "invoiceId": "INV-2024-001",
  "mode": "ephemeral",
  "amount": 10000
}

Response:
{
  "wallet": {
    "id": "wallet_123",
    "mode": "ephemeral",
    "baseAddress": "0x...",
    "status": "active"
  },
  "card": {
    "id": "card_456",
    "cardNumber": "****-****-****-1234",
    "type": "virtual",
    "spendingLimit": 10000,
    "linkedWallet": "wallet_123",
    "isAutoIssued": true
  }
}
```

#### 2. Enterprise Wallet Creation
```javascript
// Main Treasury Wallet
{
  "wallet": {
    "id": "treasury_main",
    "type": "enterprise_treasury"
  },
  "cards": [
    {
      "id": "card_cfo",
      "role": "CFO",
      "limit": 1000000
    },
    {
      "id": "card_finance",
      "role": "Finance Manager",
      "limit": 100000
    }
  ]
}

// Department Sub-Wallet
{
  "wallet": {
    "id": "wallet_engineering",
    "parentWallet": "treasury_main"
  },
  "cards": [
    {
      "id": "card_eng_lead",
      "role": "Engineering Lead",
      "limit": 50000
    },
    {
      "id": "card_eng_team",
      "role": "Team Card",
      "limit": 10000,
      "multiUser": true
    }
  ]
}
```

## Card Management Rules

### 1. **Card Lifecycle**
- **Creation**: Automatic on wallet creation or manual issuance
- **Activation**: Instant for virtual, 5-7 days for physical
- **Suspension**: Temporary hold for security
- **Cancellation**: Permanent deactivation
- **Replacement**: New card with transferred balance

### 2. **Spending Controls**
```javascript
{
  "dailyLimit": 10000,
  "transactionLimit": 5000,
  "merchantCategories": ["allowed_list"],
  "geographicRestrictions": ["US", "CA"],
  "timeRestrictions": {
    "allowedHours": "09:00-18:00",
    "allowedDays": ["Mon", "Tue", "Wed", "Thu", "Fri"]
  }
}
```

### 3. **Enterprise Hierarchy**
```
Treasury Wallet (Master)
├── CFO Card ($1M/day)
├── Finance Department Wallet
│   ├── Finance Director Card ($500K/day)
│   ├── Finance Manager Cards ($100K/day)
│   └── Accountant Cards ($10K/day)
├── Engineering Department Wallet
│   ├── CTO Card ($500K/day)
│   ├── Engineering Lead Cards ($50K/day)
│   └── Developer Cards ($5K/day)
└── Sales Department Wallet
    ├── VP Sales Card ($500K/day)
    ├── Sales Director Cards ($100K/day)
    └── Sales Rep Cards ($10K/day)
```

## Real-World Scenarios

### Scenario 1: B2B Invoice Payment
1. Company receives invoice for $50,000
2. System creates ephemeral wallet (24-hour TTL)
3. Auto-issues virtual card with $50,000 limit
4. Card expires after payment or 24 hours
5. Wallet and card are archived

### Scenario 2: Employee Expense Management
1. Employee joins company
2. Department wallet issues employee card
3. Card has:
   - Daily limit: $1,000
   - Monthly limit: $10,000
   - Restricted to business categories
4. Real-time expense tracking
5. Automatic receipt collection

### Scenario 3: Vendor Recurring Payments
1. Vendor relationship established
2. Persistent wallet created
3. Virtual card issued for vendor
4. Monthly auto-payment enabled
5. Card renews annually

## Security Features

### 1. **Card-Level Security**
- 3D Secure for online transactions
- Biometric authentication for mobile
- Real-time fraud detection
- Instant freeze/unfreeze
- Virtual card numbers for online shopping

### 2. **Wallet-Level Security**
- Multi-signature for high-value cards
- Hardware security module (HSM) integration
- Quantum-resistant encryption
- Audit trail for all card operations

## API Endpoints

### Card Management
- `POST /api/cards/issue` - Issue new card
- `GET /api/wallets/:walletId/cards` - List wallet cards
- `PUT /api/cards/:cardId` - Update card settings
- `DELETE /api/cards/:cardId` - Cancel card
- `POST /api/cards/:cardId/freeze` - Freeze card
- `POST /api/cards/:cardId/unfreeze` - Unfreeze card

### Wallet Management
- `POST /api/invoice-wallets/generate` - Create wallet with auto-card
- `GET /api/wallets/:walletId` - Get wallet with cards
- `POST /api/wallets/:walletId/cards` - Add card to wallet
- `GET /api/wallets/:walletId/hierarchy` - Get enterprise hierarchy

## Frontend Components

### 1. **InvoiceWalletWizard**
- Step 1: Create invoice
- Step 2: Generate wallet (auto)
- Step 3: Virtual card issued (auto)
- Step 4: Optional physical card request

### 2. **EnterpriseWalletManager**
- Treasury overview
- Department wallets
- Card hierarchy visualization
- Spending analytics
- Card issuance workflow

### 3. **CardManagementPanel**
- Card list view
- Card details
- Spending controls
- Transaction history
- Freeze/unfreeze toggle

## Testing Checklist

- [ ] Wallet creation auto-issues card
- [ ] Card linked to correct wallet
- [ ] Spending limits enforced
- [ ] Enterprise hierarchy works
- [ ] Card lifecycle management
- [ ] Security features functional
- [ ] API endpoints return cards with wallets
- [ ] Frontend displays card-wallet relationship
- [ ] Invoice amount matches card limit
- [ ] Auto-card marked as `isAutoIssued: true`

## Notes

1. **Never** create a wallet without a card
2. **Always** link cards to their parent wallet
3. **Enterprise** wallets have multiple cards by default
4. **Consumer** wallets start with one virtual card
5. **Invoice** wallets have spending limits matching invoice amount