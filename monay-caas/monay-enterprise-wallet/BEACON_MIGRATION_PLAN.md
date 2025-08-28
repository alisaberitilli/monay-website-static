# Beacon to Enterprise Wallet Migration Plan

## Dependency Evaluation & Modernization

### 🔄 Dependencies to Replace/Upgrade

| Beacon Dependency | Modern Replacement | Reason |
|------------------|-------------------|--------|
| **MobX + MobX React** | **Zustand** (already installed) | Lighter, simpler state management aligned with existing codebase |
| **@trpc/client** | **@tanstack/react-query + Axios** | Already using Axios, add React Query for caching |
| **Electron IPC** | **Next.js API Routes** | Web-based architecture, no desktop app needed |
| **Supabase Auth** | **NextAuth.js** or existing JWT | Align with monay-backend-common auth |
| **Prisma (client-side)** | **REST API calls** | Backend handles all DB operations |
| **react-table v7** | **@tanstack/react-table v8** (already installed) | Modern version with better TypeScript |

### ✅ Dependencies to Keep

| Dependency | Status | Usage |
|------------|--------|-------|
| **dayjs** | Add | Date formatting (lighter than moment.js) |
| **numeral** | Optional | Number formatting (can use Intl.NumberFormat) |
| **react-select** | Optional | Already have Radix UI Select |
| **react-hot-toast** | Already installed | Notifications |
| **framer-motion** | Already installed | Animations |
| **chart.js** | Already installed | Analytics charts |

### 🆕 Additional Modern Dependencies Needed

```json
{
  "@tanstack/react-query": "^5.17.0",  // Data fetching & caching
  "dayjs": "^1.11.10",                  // Date utilities
  "@hookform/resolvers": "^3.3.4",      // Already installed
  "react-hook-form": "^7.49.0",         // Already installed
  "jotai": "^2.6.0"                     // Optional: Atomic state management
}
```

## Component Migration Strategy

### Phase 1: Core Infrastructure (Week 1)

#### 1. Create Adapter Layer
- Build adapters to translate Beacon's MobX stores to Zustand
- Create API adapter for TRPC → REST calls
- Build authentication wrapper for Beacon components

#### 2. Modernize Import System
- Replace `#client/` with `@/` paths
- Update all asset imports
- Fix TypeScript path mappings

### Phase 2: Feature Components (Week 2)

#### 1. Invoice Management
**Beacon Components to Modernize:**
- `AllInvoicesPage.tsx` → Refactor with React Query + Zustand
- `CreateInvoice.tsx` → Use react-hook-form + zod validation
- `InvoiceList.tsx` → Use @tanstack/react-table v8
- `PayPage.tsx` → Integrate with existing payment APIs

**New Features to Add:**
- Real-time updates via WebSockets
- PDF invoice generation
- Bulk operations
- Advanced filtering

#### 2. Payment Processing
**Beacon Components to Modernize:**
- `PaymentMethod.tsx` → Support crypto payments
- `CardPayment.tsx` → PCI-compliant tokenization
- `PaymentSuccess.tsx` → Add blockchain confirmations
- Add Solana/Base payment rails

#### 3. Biller Management
**Beacon Components to Modernize:**
- `BillerPage.tsx` → Multi-tenant architecture
- `BillerAccounts.tsx` → Treasury management integration
- `BillerAuditLog.tsx` → Blockchain-based audit trail

### Phase 3: Advanced Features (Week 3)

#### 1. Analytics & Reporting
- Integrate Beacon's chart components with real-time data
- Add export functionality (CSV, PDF)
- Create custom dashboard widgets

#### 2. Compliance & Security
- Add KYC/AML workflows to payment process
- Implement transaction monitoring
- Add multi-signature wallet support

## File Structure After Migration

```
src/
├── features/
│   ├── invoices/
│   │   ├── components/
│   │   │   ├── InvoiceList.tsx (modernized)
│   │   │   ├── InvoiceForm.tsx (new)
│   │   │   └── InvoiceDetails.tsx (modernized)
│   │   ├── hooks/
│   │   │   ├── useInvoices.ts (React Query)
│   │   │   └── useInvoiceActions.ts
│   │   └── stores/
│   │       └── invoiceStore.ts (Zustand)
│   ├── payments/
│   │   ├── components/
│   │   │   ├── PaymentFlow.tsx (modernized)
│   │   │   ├── PaymentMethods.tsx (enhanced)
│   │   │   └── CryptoPayment.tsx (new)
│   │   └── hooks/
│   │       └── usePayments.ts
│   └── billers/
│       ├── components/
│       │   ├── BillerDashboard.tsx
│       │   └── BillerSettings.tsx
│       └── stores/
│           └── billerStore.ts
├── lib/
│   ├── api/
│   │   ├── client.ts (Axios + React Query)
│   │   └── endpoints.ts
│   ├── adapters/
│   │   ├── beaconAdapter.ts
│   │   └── stateAdapter.ts
│   └── utils/
│       ├── formatters.ts
│       └── validators.ts
└── components/
    ├── beacon/ (existing)
    └── shared/
        ├── DataTable.tsx (@tanstack/react-table)
        └── Charts.tsx (Chart.js)
```

## API Integration Plan

### Current Beacon API Calls → Modern Implementation

```typescript
// Beacon (TRPC)
const invoices = await trpc.invoice.getAll.query();

// Modern (React Query + Axios)
const { data: invoices } = useQuery({
  queryKey: ['invoices'],
  queryFn: () => monayAPI.invoices.getAll()
});
```

### State Management Migration

```typescript
// Beacon (MobX)
@observer
class InvoiceStore {
  @observable invoices = [];
  @action addInvoice(invoice) { /*...*/ }
}

// Modern (Zustand)
const useInvoiceStore = create((set) => ({
  invoices: [],
  addInvoice: (invoice) => set((state) => ({
    invoices: [...state.invoices, invoice]
  }))
}));
```

## Implementation Priority

### High Priority (Must Have)
1. ✅ Invoice creation and management
2. ✅ Payment processing with multiple methods
3. ✅ Transaction history and reporting
4. ✅ User authentication and authorization
5. ✅ Real-time balance updates

### Medium Priority (Should Have)
1. 🔄 Biller management dashboard
2. 🔄 Advanced analytics and charts
3. 🔄 Bulk operations
4. 🔄 Export functionality

### Low Priority (Nice to Have)
1. ⏳ Email notifications
2. ⏳ Mobile responsive improvements
3. ⏳ Dark mode (already partially implemented)
4. ⏳ Multi-language support

## Testing Strategy

1. **Unit Tests**: Test individual components with Jest
2. **Integration Tests**: Test API interactions with MSW
3. **E2E Tests**: Test critical user flows with Playwright
4. **Performance Tests**: Ensure sub-second response times

## Success Metrics

- [ ] All Beacon invoice features working in Next.js 14
- [ ] Payment processing integrated with backend
- [ ] < 200ms average API response time
- [ ] 100% TypeScript coverage
- [ ] Zero runtime errors in production
- [ ] Responsive on all screen sizes