# 📱 Monay Consumer Wallet Requirements Specification

**Version**: 1.0
**Date**: January 2025
**Status**: For Development
**Architecture**: Tempo-First with Multi-Provider Stablecoin Infrastructure

## 🎯 Executive Summary

Comprehensive requirements for building the Monay Consumer Wallet - a next-generation digital wallet leveraging Tempo's 100,000+ TPS infrastructure as the primary provider with Circle as fallback. This consumer-facing application will provide seamless on-ramp, off-ramp, and transfer capabilities with industry-leading performance and near-zero fees.

## 🏗️ Architecture Overview

### Technology Stack
```
Frontend: React Native (iOS/Android) + Next.js 14 (Web)
Backend: Node.js + Express (APIs already built)
Blockchain: Tempo (Primary) + Circle (Fallback)
Database: PostgreSQL (existing)
Real-time: WebSocket (Socket.io)
Authentication: JWT + Biometric
State Management: Zustand
UI Components: Native Base / Tailwind CSS
```

### Integration Points
```
✅ Already Built:
- Tempo Service (100,000+ TPS)
- Circle Service (Fallback)
- Provider Factory (Intelligent Routing)
- Stablecoin API Routes
- Multi-provider Support

🔧 To Build:
- Consumer UI/UX
- Mobile Apps
- Consumer-specific Features
- Simplified Workflows
```

## 📋 Core Requirements

### 1. User Onboarding & KYC

#### 1.1 Account Creation
```javascript
// Progressive KYC Levels
Level 1: Basic ($1,000 daily limit)
- Email/Phone verification
- Name and DOB
- Instant approval

Level 2: Verified ($50,000 daily limit)
- Government ID upload
- Selfie verification
- Address proof
- 2-5 minute approval via Persona/Alloy

Level 3: Premium ($250,000 daily limit)
- Enhanced due diligence
- Source of funds
- Video KYC if needed
```

#### 1.2 Wallet Creation Flow
```javascript
POST /api/consumer/onboard
{
  email: "user@example.com",
  phone: "+1234567890",
  kycLevel: 1,
  referralCode: "optional"
}

Response:
{
  userId: "usr_123",
  walletAddress: "0xTempo...",  // Tempo wallet
  backupWalletAddress: "0xCircle...", // Circle fallback
  kycStatus: "pending",
  limits: {
    daily: 1000,
    monthly: 30000
  }
}
```

### 2. On-Ramp (Deposit) Features

#### 2.1 Payment Methods
```javascript
const onRampMethods = {
  instant: {
    debitCard: {
      fee: "2.9%",
      limit: "$5,000",
      speed: "Instant",
      providers: ["Stripe", "TilliPay"]
    },
    appleGooglePay: {
      fee: "2.9%",
      limit: "$10,000",
      speed: "Instant"
    }
  },

  lowCost: {
    achTransfer: {
      fee: "0.5%",
      limit: "$50,000",
      speed: "3-5 days",
      providers: ["Plaid", "TilliPay"]
    },
    wireTransfer: {
      fee: "$15 flat",
      limit: "$250,000",
      speed: "Same day"
    }
  },

  crypto: {
    cryptoDeposit: {
      supportedTokens: ["BTC", "ETH", "MATIC"],
      fee: "1%",
      speed: "10-30 minutes"
    }
  }
};
```

#### 2.2 Deposit Flow UI Requirements
```typescript
// Deposit Screen Components
interface DepositScreen {
  // Amount Input
  amountSelector: {
    presetAmounts: [100, 500, 1000, 5000],
    customAmount: boolean,
    currencyToggle: "USD" | "Stablecoin",
    feeCalculator: boolean
  },

  // Payment Method Selection
  methodSelector: {
    savedMethods: PaymentMethod[],
    addNewMethod: boolean,
    recommendedMethod: boolean, // Based on amount/speed
    comparisonTable: boolean
  },

  // Confirmation
  confirmation: {
    amount: number,
    fee: number,
    total: number,
    arrivalTime: string,
    stablecoinType: "USDC" | "USDT" | "PYUSD",
    walletProvider: "Tempo" | "Circle" // Show which provider
  }
}
```

#### 2.3 Smart Deposit Routing
```javascript
// Intelligent routing based on amount and urgency
function routeDeposit(amount, urgency) {
  if (urgency === 'instant') {
    if (amount <= 5000) return 'debitCard';
    if (amount <= 10000) return 'applePay';
    return 'wireTransfer'; // Large instant
  } else {
    if (amount <= 50000) return 'achTransfer'; // Lowest fee
    return 'wireTransfer';
  }
}
```

### 3. Off-Ramp (Withdrawal) Features

#### 3.1 Withdrawal Methods
```javascript
const offRampMethods = {
  bankTransfer: {
    ach: {
      fee: "$1",
      limit: "$50,000/day",
      speed: "1-3 days"
    },
    instantACH: {
      fee: "1.5%",
      limit: "$10,000",
      speed: "30 minutes",
      provider: "TilliPay"
    },
    wire: {
      fee: "$25",
      limit: "$250,000",
      speed: "Same day"
    }
  },

  cards: {
    monayCard: {
      physical: {
        fee: "$0",
        dailyLimit: "$10,000",
        monthlyLimit: "$50,000",
        atmWithdrawal: "$1,000/day"
      },
      virtual: {
        fee: "$0",
        instantIssuance: true,
        appleWallet: true,
        googleWallet: true
      }
    }
  },

  billPay: {
    utilities: true,
    creditCards: true,
    mortgageRent: true,
    fee: "$0",
    speed: "2-3 days"
  },

  crypto: {
    supportedNetworks: ["Ethereum", "Polygon", "Solana"],
    stablecoins: ["USDC", "USDT"],
    fee: "Network fee only"
  }
};
```

#### 3.2 Withdrawal Flow UI
```typescript
interface WithdrawalScreen {
  // Balance Display
  balanceCard: {
    availableBalance: number,
    pendingBalance: number,
    stablecoinBreakdown: {
      USDC: number,
      USDT: number,
      PYUSD: number
    },
    provider: "Tempo" | "Circle"
  },

  // Destination Selection
  destinationSelector: {
    savedAccounts: BankAccount[],
    recentRecipients: Recipient[],
    addNewAccount: boolean,
    verification: "microDeposit" | "instant"
  },

  // Amount & Speed
  withdrawalOptions: {
    amount: number,
    speed: "instant" | "standard" | "economy",
    feeEstimate: number,
    arrivalEstimate: string
  }
}
```

### 4. Transfer Features (P2P & P2B)

#### 4.1 Transfer Types
```javascript
const transferTypes = {
  p2p: {
    monayToMonay: {
      fee: "$0",
      speed: "Instant",
      limit: "$50,000/day"
    },

    external: {
      venmo: { fee: "1%", speed: "Instant" },
      cashApp: { fee: "1%", speed: "Instant" },
      zelle: { fee: "0.5%", speed: "30 minutes" },
      paypal: { fee: "1.5%", speed: "Instant" }
    },

    international: {
      swift: { fee: "2%", speed: "1-3 days" },
      stablecoin: { fee: "$1", speed: "Instant" },
      wise: { fee: "0.5%", speed: "Same day" }
    }
  },

  p2b: {
    merchantPay: {
      qrCode: true,
      nfc: true,
      onlineCheckout: true,
      fee: "$0", // Merchant pays
      cashback: "1-5%"
    }
  }
};
```

#### 4.2 Transfer UI Components
```typescript
interface TransferScreen {
  // Recipient Input
  recipientInput: {
    searchContacts: boolean,
    qrScanner: boolean,
    manualEntry: {
      phoneEmail: boolean,
      walletAddress: boolean,
      bankAccount: boolean
    },
    favorites: Recipient[]
  },

  // Transfer Builder
  transferBuilder: {
    amount: number,
    currency: "USD" | "USDC" | "USDT" | "PYUSD",
    memo: string,
    recurring: {
      enabled: boolean,
      frequency: "daily" | "weekly" | "monthly",
      endDate: Date
    },
    split: {
      enabled: boolean,
      participants: User[],
      splitType: "equal" | "custom" | "percentage"
    }
  },

  // Smart Features
  smartFeatures: {
    autoConvert: boolean, // Auto-convert currency if needed
    bestRoute: boolean, // Choose cheapest/fastest route
    batchTransfer: boolean, // Multiple recipients
    schedule: boolean // Future-dated transfers
  }
}
```

### 5. Tempo-Specific Consumer Features

#### 5.1 Multi-Stablecoin Management
```typescript
interface StablecoinManager {
  // Balance Overview
  portfolio: {
    totalUSD: number,
    breakdown: {
      USDC: { amount: number, apy: number },
      USDT: { amount: number, apy: number },
      PYUSD: { amount: number, apy: number },
      EURC: { amount: number, apy: number },
      USDB: { amount: number, apy: number }
    }
  },

  // Instant Swaps (Tempo Native)
  swap: {
    from: StablecoinType,
    to: StablecoinType,
    amount: number,
    fee: 0.0001, // Near-zero
    executionTime: "<100ms"
  },

  // Auto-Optimization
  autoBalance: {
    enabled: boolean,
    strategy: "yield" | "stability" | "liquidity",
    rebalanceFrequency: "daily" | "weekly"
  }
}
```

#### 5.2 Batch Operations (Tempo Advantage)
```typescript
interface BatchOperations {
  // Batch Payments
  batchPayment: {
    recipients: Array<{
      address: string,
      amount: number,
      currency: StablecoinType,
      memo: string
    }>,
    totalFee: 0.0001, // Single fee for all
    executionTime: "<200ms"
  },

  // Payroll Distribution
  payroll: {
    employees: Employee[],
    splitCurrencies: boolean, // Pay in multiple stablecoins
    schedule: CronExpression,
    taxWithholding: boolean
  }
}
```

### 6. Consumer-Friendly UX Requirements

#### 6.1 Simplified Dashboard
```typescript
interface ConsumerDashboard {
  // Main Balance Card
  mainCard: {
    totalBalance: string, // "$12,345.67"
    dailyChange: string, // "+$23.45 (0.19%)"
    quickActions: ["Deposit", "Send", "Request", "Card"]
  },

  // Activity Feed
  activityFeed: {
    transactions: Transaction[],
    groupByDay: boolean,
    searchFilter: boolean,
    categories: ["All", "Sent", "Received", "Deposited", "Withdrawn"]
  },

  // Quick Stats
  insights: {
    weeklySpending: number,
    mostFrequentContact: User,
    savingsGoalProgress: number,
    cashbackEarned: number
  }
}
```

#### 6.2 Mobile-First Design
```typescript
interface MobileUI {
  // Biometric Security
  security: {
    faceId: boolean,
    touchId: boolean,
    pin: string,
    quickBalance: boolean // Show balance without full login
  },

  // Gesture Controls
  gestures: {
    swipeToSend: boolean,
    pullToRefresh: boolean,
    longPressActions: boolean,
    shakeToReport: boolean
  },

  // Notifications
  notifications: {
    push: {
      transactions: boolean,
      priceAlerts: boolean,
      security: boolean
    },
    inApp: {
      badges: boolean,
      banners: boolean
    }
  }
}
```

### 7. Card Management

#### 7.1 Virtual & Physical Cards
```typescript
interface CardManagement {
  // Virtual Card
  virtualCard: {
    instantIssuance: true,
    number: string,
    cvv: string,
    expiry: string,
    controls: {
      freeze: boolean,
      limits: SpendingLimits,
      merchantTypes: MerchantCategory[],
      onlineTransactions: boolean,
      internationalTransactions: boolean
    }
  },

  // Physical Card
  physicalCard: {
    material: "plastic" | "metal",
    design: CardDesign,
    shippingTime: "5-7 days" | "2-3 days express",
    activation: "app" | "phone" | "atm",
    pin: {
      set: boolean,
      change: boolean
    }
  },

  // Card Features
  features: {
    contactless: true,
    atmAccess: {
      network: "AllPoint", // 55,000+ ATMs
      freeWithdrawals: 5, // per month
      fee: "$2.50" // after free
    },
    rewards: {
      cashback: "1-5%",
      categories: ["Dining", "Travel", "Gas", "Groceries"],
      redemption: "instant"
    }
  }
}
```

### 8. Smart Features & AI

#### 8.1 Intelligent Assistance
```typescript
interface SmartFeatures {
  // Spending Insights
  insights: {
    categorization: AutoCategory,
    budgetAlerts: BudgetAlert[],
    unusualActivity: Detection,
    savingsSuggestions: Suggestion[]
  },

  // Predictive Features
  predictive: {
    recurringPayments: Detection[],
    cashFlowForecast: Forecast,
    optimalTransferTime: TimeRecommendation
  },

  // Chat Assistant
  assistant: {
    naturalLanguage: true,
    voiceCommands: true,
    quickActions: ["Send $50 to John", "Show spending this week"],
    contextual: true
  }
}
```

### 9. Security & Compliance

#### 9.1 Security Features
```typescript
interface Security {
  // Authentication
  auth: {
    biometric: BiometricType,
    twoFactor: true,
    deviceTrust: DeviceFingerprint,
    sessionTimeout: number
  },

  // Transaction Security
  transactionSecurity: {
    velocityLimits: VelocityRule[],
    geoFencing: boolean,
    fraudDetection: "real-time",
    confirmationRequired: TransactionThreshold
  },

  // Privacy
  privacy: {
    dataEncryption: "AES-256",
    privateMode: boolean,
    transactionMemos: "encrypted",
    hideBalance: boolean
  }
}
```

### 10. Performance Requirements

#### 10.1 Response Times (Leveraging Tempo)
```javascript
const performanceTargets = {
  appLaunch: "< 2 seconds",
  screenTransition: "< 300ms",

  // Tempo-powered operations
  balance: "< 100ms",
  transfer: "< 200ms",
  deposit: "< 500ms",
  withdrawal: "< 500ms",
  swap: "< 100ms",

  // UI Updates
  realTimeBalance: true,
  pushNotifications: "< 1 second",
  transactionHistory: "< 500ms"
};
```

#### 10.2 Scalability
```javascript
const scalabilityRequirements = {
  concurrent: 100000, // Users
  tps: 100000, // Via Tempo
  availability: "99.99%",
  dataRetention: "7 years",
  multiRegion: true
};
```

## 📊 API Endpoints (Consumer-Specific)

### Onboarding APIs
```javascript
POST   /api/consumer/register
POST   /api/consumer/kyc/verify
POST   /api/consumer/wallet/create
GET    /api/consumer/profile
PUT    /api/consumer/profile/update
```

### Transaction APIs
```javascript
// On-ramp
POST   /api/consumer/deposit/card
POST   /api/consumer/deposit/bank
POST   /api/consumer/deposit/crypto
GET    /api/consumer/deposit/status/:id

// Off-ramp
POST   /api/consumer/withdraw/bank
POST   /api/consumer/withdraw/card
GET    /api/consumer/withdraw/status/:id

// Transfers
POST   /api/consumer/transfer/p2p
POST   /api/consumer/transfer/batch
GET    /api/consumer/transfer/history
POST   /api/consumer/transfer/request

// Stablecoin (Tempo)
POST   /api/consumer/stablecoin/swap
GET    /api/consumer/stablecoin/rates
POST   /api/consumer/stablecoin/auto-balance
```

### Card APIs
```javascript
POST   /api/consumer/card/virtual/create
POST   /api/consumer/card/physical/order
PUT    /api/consumer/card/controls
POST   /api/consumer/card/freeze
GET    /api/consumer/card/transactions
PUT    /api/consumer/card/pin
```

### Smart Features APIs
```javascript
GET    /api/consumer/insights/spending
GET    /api/consumer/insights/forecast
POST   /api/consumer/assistant/query
GET    /api/consumer/recommendations
```

## 🎨 UI/UX Design Principles

### Design System
```css
/* Color Palette */
--primary: #3B82F6;      /* Tempo Blue */
--secondary: #10B981;    /* Success Green */
--accent: #8B5CF6;       /* Premium Purple */
--danger: #EF4444;
--warning: #F59E0B;
--background: #FFFFFF;
--surface: #F9FAFB;
--text: #111827;
--text-secondary: #6B7280;

/* Typography */
--font-primary: 'Inter', sans-serif;
--font-display: 'Sora', sans-serif;

/* Spacing */
--spacing-unit: 4px;

/* Border Radius */
--radius-sm: 8px;
--radius-md: 12px;
--radius-lg: 16px;
--radius-full: 9999px;
```

### Key Screens
1. **Onboarding** (3-5 screens max)
2. **Dashboard** (Single scroll)
3. **Deposit** (2-step process)
4. **Withdraw** (2-step process)
5. **Transfer** (3-step process)
6. **Card Management**
7. **Transaction History**
8. **Profile & Settings**

## 🚀 Implementation Phases

### Phase 1: MVP (Weeks 1-6)
- Basic onboarding (Level 1 KYC)
- Tempo wallet creation
- Simple deposit (ACH/Card)
- Simple withdrawal (ACH)
- P2P transfers
- Basic dashboard

### Phase 2: Core Features (Weeks 7-12)
- Enhanced KYC (Levels 2-3)
- All deposit methods
- All withdrawal methods
- Virtual card
- Transaction history
- Multi-stablecoin support

### Phase 3: Advanced (Weeks 13-18)
- Physical card
- Batch transfers
- Bill pay
- Spending insights
- Auto-balance
- International transfers

### Phase 4: Polish (Weeks 19-24)
- AI assistant
- Advanced analytics
- Rewards program
- Referral system
- Premium features
- Performance optimization

## 📱 Platform-Specific Requirements

### iOS App
```swift
- Swift 5.0+
- iOS 14.0+
- SwiftUI + UIKit
- Face ID / Touch ID
- Apple Pay integration
- Apple Wallet passes
- Push notifications
- Widgets
```

### Android App
```kotlin
- Kotlin 1.8+
- Android 7.0+ (API 24)
- Jetpack Compose
- Biometric API
- Google Pay integration
- Google Wallet
- Firebase messaging
- App shortcuts
```

### Web App
```typescript
- Next.js 14+
- React 18+
- TypeScript 5+
- Responsive design
- PWA capabilities
- WebAuthn
- Real-time updates
```

## 🔑 Success Metrics

### User Acquisition
- 10,000 users in first month
- 100,000 users in first year
- 50% month-over-month growth

### Engagement
- Daily active users: 40%
- Average session: 5 minutes
- Transactions per user: 10/month

### Financial
- Average deposit: $1,000
- Transaction volume: $10M/month
- Revenue per user: $5/month

### Performance
- App store rating: 4.5+
- Customer support: < 2 hour response
- Transaction success rate: 99.9%

## 🎯 Competitive Advantages

### Powered by Tempo
1. **100,000+ TPS** - Never experience delays
2. **$0.0001 fees** - Near-zero transaction costs
3. **< 100ms finality** - Instant settlements
4. **Multi-stablecoin** - USDC, USDT, PYUSD, EURC, USDB
5. **Batch transfers** - Send to many in one transaction

### User Experience
1. **Simplicity** - 3-tap maximum for any action
2. **Speed** - Instant everything
3. **Transparency** - Clear fees, no hidden costs
4. **Flexibility** - Multiple payment options
5. **Intelligence** - Smart routing and recommendations

## 📄 Deliverables for Development Team

### Required Deliverables
1. ✅ This requirements document
2. ✅ API documentation (already built)
3. ✅ Tempo integration guide (completed)
4. ✅ Provider factory implementation
5. 🔧 UI/UX mockups (to be created)
6. 🔧 Mobile app source code
7. 🔧 Web app source code
8. 🔧 Test suites
9. 🔧 Deployment guides

### Technical Resources Available
```javascript
// Already implemented and ready to use:
- POST /api/stablecoin/* (All Tempo operations)
- Provider Factory (Automatic Tempo/Circle routing)
- WebSocket infrastructure
- Database schema
- Authentication system
- KYC integration framework
```

## 💡 Special Instructions for Developer

### Priority Focus Areas
1. **Consumer-First UX** - Simple, intuitive, beautiful
2. **Mobile-First** - Optimize for mobile before web
3. **Tempo Integration** - Leverage all Tempo advantages
4. **Performance** - Sub-second everything
5. **Security** - Bank-grade but user-friendly

### Key Differentiators to Emphasize
1. **"Powered by Tempo"** - Show provider in UI
2. **Speed indicators** - "Instant", "< 1 second"
3. **Fee transparency** - Always show fees upfront
4. **Smart routing** - "Best route selected"
5. **Multi-currency** - Currency selector prominent

### Development Notes
```javascript
// Use existing Tempo implementation
import { StablecoinProviderFactory } from '@/services/stablecoin-provider-factory';

const factory = StablecoinProviderFactory.getInstance();

// All operations automatically use Tempo (primary) with Circle fallback
const result = await factory.executeWithFallback(
  'transfer',
  [fromWallet, toAddress, amount, currency],
  { preferredProvider: 'auto' } // Will use Tempo
);

// Consumer wallet = Simplified wrapper around enterprise features
// Focus on UX, the infrastructure is ready!
```

---

## 🚀 Ready for Development

This comprehensive requirements document provides everything needed to build the Monay Consumer Wallet. The Tempo infrastructure is already implemented and tested, providing a solid foundation for building a world-class consumer experience.

**Key Message**: Build a beautiful, simple interface on top of our powerful Tempo-powered backend. The hard work is done - now make it delightful for consumers!

*"Instant Everything, Powered by Tempo"*