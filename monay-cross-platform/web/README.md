# Monay Consumer Wallet - Web Application

## 🔧 DEVELOPMENT PRINCIPLES

### ⚠️ NEVER COMMENT OUT CODE - FIX THE ERROR ⚠️
**Established: January 2025**

We NEVER remove or comment out functionality to pass tests. We explicitly fix errors and move forward.

**When you encounter an error:**
1. **DON'T** comment out the problematic code
2. **DON'T** remove features to make tests pass
3. **DON'T** bypass TypeScript errors with `@ts-ignore`
4. **DO** fix the underlying issue properly
5. **DO** maintain all existing functionality

**Common Frontend Fixes:**
- API endpoint 404? Check backend routes or create the missing endpoint
- Component import error? Fix the path or create the missing component
- Type error? Define proper interfaces, don't use `any`
- Hook error? Ensure proper React rules are followed
- State management issue? Fix the store, don't remove the feature

**Example:** When the wallet balance endpoint was not found, we fixed the route path in the backend rather than removing the balance display feature.

### 🎨 MANDATORY: USE MODERN LUCIDE ICONS - NO SHORTCUTS
**Established: January 2025**

**CRITICAL REQUIREMENT**: Always use modern, contemporary Lucide icons from our optimized @monay/icons library at `/shared/icons/`. Never take shortcuts.

**Consumer App Icon Library:**
- 📍 **Location**: `/shared/icons/` - Centralized optimized SVG library (75+ icons)
- 📦 **Package**: `@monay/icons` - Consumer-optimized icon library
- 🔧 **Setup**: In package.json: `"@monay/icons": "file:../../shared/icons"`
- ⚡ **Performance**: 85% smaller, mobile-optimized, full tree-shaking

**Consumer App Icon Standards:**
- ✅ **EXCLUSIVELY @monay/icons** from `/shared/icons/` location
- ✅ **Modern, clean designs** for consumer-friendly UI
- ✅ **Performance-optimized** local SVG components
- ✅ **Consistent sizing**: 16px (small), 24px (default), 32px (large)
- ✅ **Accessible** with proper ARIA labels

**Absolutely Forbidden:**
- ❌ **NO** FontAwesome, Material Icons, or other libraries
- ❌ **NO** emojis as UI icons (🏠 ❌)
- ❌ **NO** text placeholders ([icon], *, •)
- ❌ **NO** mixing icon libraries
- ❌ **NO** bitmap images as icons

**Implementation:**
```typescript
// ✅ CORRECT - Modern consumer app icons
import { Home, CreditCard, Search, User } from '@monay/icons';
<Home size={24} className="text-primary" />
<CreditCard className="w-5 h-5" />

// ❌ WRONG - Never do this
import { FaHome } from 'react-icons/fa';
<span>🏠</span>  // No emojis
<div>[home]</div>  // No placeholders
```

---

## Overview

The **Monay Consumer Wallet** is the first U.S.-centric Super App, combining comprehensive financial services with lifestyle features in a single platform.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server (Port 3003)
npm run dev

# Build for production
npm run build

# Run production build
npm start
```

## 📊 Architecture

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **State Management**: Zustand
- **API Communication**: Backend API on port 3001
- **Real-time Updates**: WebSocket support

## 🔑 Key Features

### Financial Services
- Multi-currency wallet (USD, USDC, USDT, PYUSD, BTC, ETH, SOL)
- Virtual/Physical card issuance
- P2P transfers with Request-to-Pay
- Multi-rail payments (ACH, FedNow, Cards, Crypto)
- Enterprise invoice payments

### Super App Services
- **Travel**: Flights, buses, ride-hailing, tolls
- **Hospitality**: Hotels, restaurants
- **Retail**: In-app shopping, QR payments
- **Healthcare**: Bill pay, pharmacy, HSA/FSA
- **Education**: Tuition, loans, scholarships
- **Government**: Benefits, tax refunds

## 📁 Project Structure

```
web/
├── app/                    # Next.js app router pages
│   ├── (auth)/            # Authentication pages
│   ├── dashboard/         # Main dashboard
│   ├── add-money/         # Top-up functionality
│   ├── send-money/        # P2P transfers
│   └── transactions/      # Transaction history
├── components/            # Reusable components
│   ├── DashboardLayout.tsx
│   ├── UnifiedPaymentGateway.tsx
│   └── ui/               # UI components
├── services/              # API services
├── stores/               # Zustand stores
└── public/               # Static assets
```

## 🔗 API Integration

The app connects to the centralized backend at `http://localhost:3001`

**Key Endpoints:**
- `/api/auth/login` - User authentication
- `/api/wallet/balance` - Wallet balance
- `/api/payment/send` - Send money
- `/api/transactions` - Transaction history

## 🛡️ Security

- JWT authentication with secure token storage
- Biometric authentication support
- Real-time fraud detection
- PCI DSS compliance for card operations

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm test -- --coverage

# E2E tests
npm run test:e2e
```

## 📝 Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WEBSOCKET_URL=ws://localhost:8080
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_...
```

## 🚀 Deployment

```bash
# Build for production
npm run build

# Start production server
npm start
```

## 📞 Support

- **Technical Issues**: Check backend logs at port 3001
- **Database Issues**: Never drop tables, add missing columns
- **API Issues**: Create missing endpoints, don't remove features

---

**Remember**: We fix errors, we don't comment out code!