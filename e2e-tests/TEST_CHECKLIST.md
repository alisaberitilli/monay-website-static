# E2E Test Execution Checklist

## 🎯 Test Overview
Complete end-to-end test of the invoice payment flow using Tempo, from organization creation to payment verification.

## ✅ Pre-Test Checklist

### 1. Services Running (Required)
Check all services are running on their correct ports:

```bash
# Check service status
lsof -i :3001  # Backend API (monay-backend-common)
lsof -i :3002  # Admin Portal (monay-admin)
lsof -i :3003  # Consumer Wallet (monay-cross-platform/web)
lsof -i :3007  # Enterprise Wallet (monay-enterprise-wallet)
```

Current Status:
- [ ] Backend API (3001) - ⚠️ Not running (needs to be started)
- [x] Admin Portal (3002) - ✅ Running
- [ ] Consumer Wallet (3003) - ⚠️ Check status
- [ ] Enterprise Wallet (3007) - ⚠️ Check status

### 2. Database Setup
- [ ] PostgreSQL running on port 5432
- [ ] Database `monay` exists
- [ ] Admin user exists with credentials:
  - Email: `admin@monay.com`
  - Password: `Admin@Monay2025!`
  - MPIN: `123456`

### 3. Test Dependencies
```bash
cd /Users/alisaberi/Data/0ProductBuild/monay/e2e-tests

# Install dependencies
npm install

# Install Playwright browsers
npm run install:browsers

# Setup test data
npm run test:setup
```

## 🚀 Running the Test

### Option 1: Complete Test Flow (Recommended)
```bash
# Run with browser visible
npm run test:complete

# Run in debug mode (step-by-step)
npm run test:complete:debug
```

### Option 2: Original Test
```bash
npm run test:invoice-flow
```

### Option 3: Interactive Runner
```bash
./run-e2e-test.sh
```

## 📋 Test Flow Steps

The test will automatically:

1. **Admin Portal (3002)**
   - Login as admin@monay.com
   - Create tenant organization
   - Create organization admin user

2. **Enterprise Wallet (3007)**
   - Login as org admin
   - Initialize enterprise wallet
   - Create invoice for consumer

3. **Consumer Wallet (3003)**
   - Register new consumer user
   - Top up wallet with card ($350)
   - View received invoice

4. **Payment Flow**
   - Consumer selects Tempo payment
   - Processes instant payment
   - Funds transfer to enterprise wallet

5. **Verification**
   - Enterprise wallet receives payment
   - Invoice marked as paid
   - Transaction logs updated

## 🔍 Test Data

### Generated Test Data (Unique per run)
- Organization: `TestCorp_<timestamp>`
- Org Admin: `orgadmin_<timestamp>@test.com`
- Consumer: `consumer_<timestamp>@test.com`
- Invoice: $250.00
- Top-up Amount: $350.00

### Test Card Details
- Number: `4242424242424242`
- Exp: `12/2025`
- CVV: `123`

## 🛠️ Troubleshooting

### Services Not Running
```bash
# Start Backend API (Required!)
cd /Users/alisaberi/Data/0ProductBuild/monay/monay-backend-common
npm run dev

# Start Consumer Wallet
cd /Users/alisaberi/Data/0ProductBuild/monay/monay-cross-platform/web
npm run dev

# Start Enterprise Wallet
cd /Users/alisaberi/Data/0ProductBuild/monay/monay-caas/monay-enterprise-wallet
npm run dev
```

### Database Connection Issues
```bash
# Test connection
psql -U alisaberi -d monay -c "SELECT 1"

# Run migrations if needed
cd /Users/alisaberi/Data/0ProductBuild/monay/monay-backend-common
npm run migration:run
```

### Playwright Issues
```bash
# Clear Playwright cache
rm -rf ~/.cache/ms-playwright

# Reinstall browsers
npx playwright install chromium

# Run with debug output
DEBUG=pw:api npm run test:complete
```

## 📸 Screenshots
Screenshots are saved to `screenshots/` directory:
- `01-admin-login.png`
- `02-organization-created.png`
- `03-org-admin-created.png`
- `04-enterprise-wallet.png`
- `05-consumer-registered.png`
- `06-invoice-created.png`
- `07-wallet-topped-up.png`
- `08-invoice-paid.png`
- `09-payment-verified.png`

## 📊 Test Report
After test completion:
```bash
# View HTML report
npm run test:report

# View test results
cat test-results.json
```

## ⚠️ Important Notes

1. **Backend API Must Be Running**: The test will fail without the backend API on port 3001
2. **Clean State**: Each test run creates new test data with unique timestamps
3. **Tempo Integration**: Ensure Tempo provider is configured in the backend
4. **Database Safety**: Test only creates data, no destructive operations

## 🎬 Ready to Test?

1. ✅ Ensure all services are running (especially backend on 3001)
2. ✅ Install dependencies: `npm install`
3. ✅ Install browsers: `npm run install:browsers`
4. ✅ Run test: `npm run test:complete`

## 💡 Tips

- Use `test:complete:debug` for step-by-step execution
- Check `screenshots/` folder if test fails
- Review console output for detailed progress
- Ensure no other tests are running simultaneously