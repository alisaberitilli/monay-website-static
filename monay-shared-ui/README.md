# @monay/shared-ui

Shared UI components for Monay Consumer and Enterprise Wallets.

## Installation

### For Consumer Wallet
```bash
cd monay-cross-platform/web
npm install ../../monay-shared-ui
```

### For Enterprise Wallet
```bash
cd monay-caas/monay-enterprise-wallet
npm install ../../monay-shared-ui --legacy-peer-deps
```

## Usage

```tsx
import { UnifiedPaymentGateway, PaymentConfig } from '@monay/shared-ui';

const config: PaymentConfig = {
  apiBaseUrl: 'http://localhost:3001/api',
  walletType: 'consumer', // or 'enterprise'
  getAuthToken: () => localStorage.getItem('authToken')
};

function App() {
  return (
    <UnifiedPaymentGateway
      mode="deposit"  // or 'withdrawal'
      config={config}
      onSuccess={(data) => console.log('Success:', data)}
      onError={(error) => console.error('Error:', error)}
      theme="light"  // or 'dark'
    />
  );
}
```

## Components

### UnifiedPaymentGateway
A comprehensive payment component that handles:
- Deposits (on-ramp) from fiat to wallet
- Withdrawals (off-ramp) from wallet to fiat
- Multiple payment providers (Circle, Tempo, Stripe, Monay-Fiat)
- Provider selection with fees and speed comparison
- Real-time transaction processing
- Error handling and validation

## Architecture

```
Frontend Apps (Consumer/Enterprise)
    ↓ Imports @monay/shared-ui
Shared UI Components
    ↓ Makes API calls to
Backend API (port 3001)
    ↓ Handles business logic
Payment Providers (Circle, Tempo, etc.)
```

## Development

### Building
```bash
npm run build
```

### Watch Mode
```bash
npm run dev
```

### Type Checking
```bash
npm run type-check
```

## Adding New Components

1. Create component in `src/components/ComponentName/`
2. Export from `src/index.ts`
3. Build the package: `npm run build`
4. Components are automatically available in both wallets

## Future Components

Planned shared components:
- WalletBalance - Display wallet balances
- TransactionHistory - Transaction list with filters
- UserProfile - User profile management
- ComplianceWidget - KYC/AML status
- CryptoSwap - Token swapping interface
- QRPayment - QR code payment scanner
- CardManagement - Virtual/physical card management

## License

PROPRIETARY - Monay Inc.