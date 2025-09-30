# Monay E2E Tests with Playwright

## Overview

This suite provides comprehensive end-to-end testing for the complete invoice payment flow across all Monay applications:
- Admin Portal (port 3002)
- Enterprise Wallet (port 3007)
- Consumer Wallet (port 3003)
- Backend API (port 3001)

## Test Flow Coverage

The main test (`invoice-payment-flow.spec.ts`) covers:

1. **Tenant Organization Registration** - Creating a new organization in the admin portal
2. **Organization Admin User Creation** - Setting up an admin user for the organization
3. **Enterprise Wallet Setup** - Admin user accessing enterprise wallet
4. **Consumer User Registration** - New consumer signing up for the wallet
5. **Invoice Creation** - Organization creating an invoice for the consumer
6. **Wallet Top-up** - Consumer adding funds via card payment
7. **Invoice Payment via Tempo** - Consumer paying the invoice using Tempo
8. **Payment Verification** - Confirming payment received in enterprise wallet
9. **Audit Trail Verification** - Checking all events are properly logged

## Setup

### 1. Install Dependencies

```bash
cd e2e-tests
npm install
```

### 2. Environment Setup

Ensure all services are running:

```bash
# In separate terminals:

# Terminal 1 - Backend API
cd monay-backend-common
npm run dev

# Terminal 2 - Admin Portal
cd monay-admin
npm run dev

# Terminal 3 - Consumer Wallet
cd monay-cross-platform/web
npm run dev

# Terminal 4 - Enterprise Wallet
cd monay-caas/monay-enterprise-wallet
npm run dev
```

### 3. Database Setup

Initialize test data:

```bash
npm run test:setup
```

This creates:
- Super admin user (superadmin@monay.com / SuperAdmin123!)
- Test organization template
- Payment provider configurations
- Initial wallet structures

## Running Tests

### Run All Tests
```bash
npm test
```

### Run with UI (Headed Mode)
```bash
npm run test:headed
```

### Run Specific Test Flow
```bash
npm run test:invoice-flow
```

### Debug Mode
```bash
npm run test:debug
```

### View Test Report
```bash
npm run test:report
```

## Test Data Management

### Cleanup Old Test Data
```bash
npm run test:cleanup
```

This removes test data older than 7 days while preserving recent tests for audit.

## Test Configuration

### Timeouts
- Action timeout: 30 seconds
- Navigation timeout: 30 seconds
- Test timeout: 2 minutes

### Retry Policy
- Local: No retries
- CI: 2 retries on failure

### Screenshots & Videos
- Screenshots: On failure only
- Videos: Retained on failure
- Traces: On first retry

## Key Test Identifiers

The tests use `data-testid` attributes for reliable element selection:
- `wallet-balance` - Wallet balance display
- `invoice-list` - Invoice listing container
- `payment-method` - Payment method selector
- `transaction-history` - Transaction list

## Test User Credentials

### Admin (for Monay-Admin Portal)
- Email: admin@monay.com
- Password: Admin@Monay2025!
- MPIN: 123456
- Username: admin

### Test Organization Admin
- Generated dynamically with timestamp
- Format: admin_{timestamp}@example.com

### Test Consumer
- Generated dynamically with timestamp
- Format: consumer_{timestamp}@example.com

## Troubleshooting

### Services Not Running
If tests fail due to connection errors:
```bash
# Check if all services are running
lsof -i :3001  # Backend
lsof -i :3002  # Admin
lsof -i :3003  # Consumer Wallet
lsof -i :3007  # Enterprise Wallet
```

### Database Connection Issues
```bash
# Test database connection
psql -U alisaberi -d monay -c "SELECT 1"
```

### Clear Browser State
```bash
# Remove stored auth state
rm -rf test-results/
rm -rf playwright-report/
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: monay
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: |
          npm ci --prefix monay-backend-common
          npm ci --prefix monay-admin
          npm ci --prefix monay-cross-platform/web
          npm ci --prefix monay-caas/monay-enterprise-wallet
          npm ci --prefix e2e-tests

      - name: Setup test data
        run: npm run test:setup --prefix e2e-tests

      - name: Run E2E tests
        run: npm test --prefix e2e-tests

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: e2e-tests/playwright-report/
```

## Best Practices

1. **Unique Test Data**: Always use timestamps in test data to avoid conflicts
2. **Cleanup**: Run cleanup script regularly to maintain database performance
3. **Parallel Execution**: Tests run sequentially by default for data consistency
4. **Error Handling**: Tests include proper waits and error messages for debugging
5. **Audit Trail**: All test actions are logged for compliance verification

## Extending Tests

To add new test scenarios:

1. Create a new spec file in `tests/` directory
2. Import shared test data and utilities
3. Use the same browser contexts for related tests
4. Follow the naming convention: `{feature}-flow.spec.ts`

Example:
```typescript
import { test, expect } from '@playwright/test';
import { testData } from './shared/test-data';

test.describe('New Feature Flow', () => {
  test('should do something', async ({ page }) => {
    // Your test implementation
  });
});
```

## Support

For issues or questions:
- Check the test reports for detailed error messages
- Review screenshots in `test-results/` directory
- Enable debug mode for step-by-step execution
- Contact: dev.lead@monay.com