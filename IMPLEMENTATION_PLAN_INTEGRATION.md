# Integration Test Plan: Invoice-First Architecture
## End-to-End Testing Across All Components

**Date**: October 2025
**Scope**: All Components (Ports 3001, 3002, 3003, 3007)
**Purpose**: Ensure seamless integration of Invoice-First architecture
**Session Type**: QA/Integration Team

---

## 🎯 TESTING OBJECTIVES

Validate complete Invoice-First workflows across all four components:
1. **Backend API** (3001) - Core services and data integrity
2. **Admin Dashboard** (3002) - Platform monitoring and control
3. **Enterprise Wallet** (3007) - Business invoice operations
4. **Consumer Wallet** (3003) - Consumer payment flows

---

## 🧪 TEST ENVIRONMENT SETUP

### Prerequisites
```bash
# Start all services
npm run start:all

# Verify services running
curl http://localhost:3001/health  # Backend
curl http://localhost:3002          # Admin
curl http://localhost:3003          # Consumer
curl http://localhost:3007          # Enterprise

# Database setup
psql -U alisaberi -d monay -c "SELECT COUNT(*) FROM invoices;"
psql -U alisaberi -d monay -c "SELECT COUNT(*) FROM invoice_wallets;"

# Redis verification
redis-cli ping  # Should return PONG
```

### Test Data Seeds
```sql
-- Create test users
INSERT INTO users (id, email, user_type) VALUES
  ('test-admin', 'admin@test.com', 'platform_admin'),
  ('test-enterprise', 'enterprise@test.com', 'enterprise_admin'),
  ('test-consumer', 'consumer@test.com', 'verified_consumer');

-- Create test enterprise
INSERT INTO enterprises (id, name, admin_id) VALUES
  ('test-corp', 'Test Corporation', 'test-enterprise');
```

---

## 📋 TEST SCENARIOS

### SCENARIO 1: Enterprise Creates Invoice → Consumer Pays
**Components**: Enterprise (3007) → Backend (3001) → Consumer (3003) → Admin (3002)

#### Test Steps:
```typescript
// Test Case 1.1: Enterprise creates invoice with ephemeral wallet
describe('Enterprise to Consumer Invoice Flow', () => {
  it('should create invoice with auto-wallet generation', async () => {
    // Step 1: Enterprise creates invoice
    const invoice = await EnterpriseAPI.createInvoice({
      vendorId: 'test-vendor',
      amount: 1000.00,
      description: 'Consulting Services',
      createWallet: true,
      walletMode: 'ephemeral',
      ttlHours: 72
    });

    expect(invoice.id).toBeDefined();
    expect(invoice.walletAddress).toBeNull(); // Not created yet

    // Step 2: Consumer receives invoice
    const consumerInvoices = await ConsumerAPI.getIncomingInvoices();
    expect(consumerInvoices).toContainEqual(
      expect.objectContaining({ id: invoice.id })
    );

    // Step 3: Consumer initiates payment (triggers wallet creation)
    const paymentInit = await ConsumerAPI.initiatePayment(invoice.id);
    expect(paymentInit.walletAddress).toBeDefined();
    expect(paymentInit.walletMode).toBe('ephemeral');

    // Step 4: Verify wallet in backend
    const wallet = await BackendAPI.getWallet(paymentInit.walletAddress);
    expect(wallet.status).toBe('active');
    expect(wallet.ttl_hours).toBe(72);

    // Step 5: Complete payment
    const payment = await ConsumerAPI.completePayment({
      invoiceId: invoice.id,
      walletAddress: paymentInit.walletAddress,
      amount: 1000.00
    });
    expect(payment.status).toBe('completed');

    // Step 6: Verify in Admin Dashboard
    const adminMetrics = await AdminAPI.getInvoiceMetrics();
    expect(adminMetrics.totalInvoiceWallets).toBeGreaterThan(0);
    expect(adminMetrics.ephemeralWallets).toContain(paymentInit.walletAddress);
  });

  it('should handle ephemeral wallet expiration', async () => {
    // Create invoice with 1-hour TTL
    const invoice = await EnterpriseAPI.createInvoice({
      amount: 500.00,
      walletMode: 'ephemeral',
      ttlHours: 1
    });

    // Fast-forward time
    jest.advanceTimersByTime(3600000); // 1 hour

    // Check wallet status
    const wallet = await BackendAPI.getWallet(invoice.walletAddress);
    expect(wallet.status).toBe('expired');

    // Verify funds returned
    const enterprise = await EnterpriseAPI.getBalance();
    expect(enterprise.returnedFunds).toContain({
      walletAddress: invoice.walletAddress,
      amount: 500.00
    });
  });
});
```

---

### SCENARIO 2: Consumer Creates Request-to-Pay → Enterprise Pays
**Components**: Consumer (3003) → Backend (3001) → Enterprise (3007) → Admin (3002)

#### Test Steps:
```typescript
// Test Case 2.1: Consumer R2P with wallet creation
describe('Consumer Request-to-Pay Flow', () => {
  it('should create R2P invoice that generates wallet on acceptance', async () => {
    // Step 1: Consumer creates R2P
    const r2p = await ConsumerAPI.createRequestToPay({
      recipientContact: 'enterprise@test.com',
      amount: 250.00,
      description: 'Freelance Work',
      createWalletOnAccept: true,
      walletMode: 'ephemeral',
      ttlHours: 48
    });

    expect(r2p.shareableLink).toBeDefined();
    expect(r2p.qrCode).toBeDefined();

    // Step 2: Enterprise receives request
    const enterpriseRequests = await EnterpriseAPI.getPaymentRequests();
    expect(enterpriseRequests).toContainEqual(
      expect.objectContaining({ id: r2p.id })
    );

    // Step 3: Enterprise accepts (triggers wallet)
    const acceptance = await EnterpriseAPI.acceptRequest(r2p.id);
    expect(acceptance.walletAddress).toBeDefined();

    // Step 4: Verify WebSocket notifications
    const wsEvents = await WebSocketMock.getCapturedEvents();
    expect(wsEvents).toContain({
      type: 'wallet-created',
      invoiceId: r2p.invoiceId,
      walletAddress: acceptance.walletAddress
    });

    // Step 5: Enterprise completes payment
    const payment = await EnterpriseAPI.payRequest({
      requestId: r2p.id,
      walletAddress: acceptance.walletAddress
    });
    expect(payment.status).toBe('completed');

    // Step 6: Consumer receives funds
    const consumerBalance = await ConsumerAPI.getBalance();
    expect(consumerBalance.ephemeralWallets).toContainEqual(
      expect.objectContaining({
        address: acceptance.walletAddress,
        balance: 250.00
      })
    );
  });
});
```

---

### SCENARIO 3: Bulk Enterprise Payroll → Multiple Consumer Wallets
**Components**: Enterprise (3007) → Backend (3001) → Multiple Consumers (3003) → Admin (3002)

#### Test Steps:
```typescript
// Test Case 3.1: Bulk payroll disbursement
describe('Enterprise Payroll Distribution', () => {
  it('should create ephemeral wallets for all employees', async () => {
    // Step 1: Enterprise creates payroll batch
    const employees = [
      { id: 'emp1', amount: 5000 },
      { id: 'emp2', amount: 4500 },
      { id: 'emp3', amount: 6000 }
    ];

    const payrollBatch = await EnterpriseAPI.createPayrollBatch({
      period: '2025-10',
      employees,
      walletMode: 'ephemeral',
      ttlHours: 24
    });

    expect(payrollBatch.wallets).toHaveLength(3);

    // Step 2: Process batch (creates all wallets)
    const processed = await EnterpriseAPI.processPayrollBatch(payrollBatch.id);
    expect(processed.walletsCreated).toBe(3);

    // Step 3: Verify each employee receives notification
    for (const employee of employees) {
      const notifications = await ConsumerAPI.getNotifications(employee.id);
      expect(notifications).toContainEqual(
        expect.objectContaining({
          type: 'salary-received',
          amount: employee.amount,
          walletType: 'ephemeral'
        })
      );
    }

    // Step 4: Test auto-transfer setup
    const autoTransfer = await ConsumerAPI.setupAutoTransfer({
      fromWallet: payrollBatch.wallets[0].address,
      toWallet: 'consumer-primary-wallet',
      triggerTime: 'before-expiry'
    });
    expect(autoTransfer.scheduled).toBe(true);

    // Step 5: Admin monitoring
    const adminPayroll = await AdminAPI.getPayrollMetrics();
    expect(adminPayroll.activeBatches).toContain(payrollBatch.id);
    expect(adminPayroll.totalDisbursed).toBe(15500);
  });
});
```

---

### SCENARIO 4: Provider Failover (Tempo → Circle)
**Components**: All components with provider switching

#### Test Steps:
```typescript
// Test Case 4.1: Provider health and failover
describe('Provider Failover Scenario', () => {
  it('should seamlessly switch from Tempo to Circle', async () => {
    // Step 1: Simulate Tempo degradation
    await MockProviderAPI.setTempoHealth({
      status: 'degraded',
      successRate: 85,
      latency: 2000
    });

    // Step 2: Admin dashboard detects issue
    const providerHealth = await AdminAPI.getProviderHealth();
    expect(providerHealth.tempo.status).toBe('degraded');
    expect(providerHealth.primaryProvider).toBe('tempo'); // Still primary

    // Step 3: Trigger automatic failover (success rate < 90%)
    await MockProviderAPI.setTempoHealth({
      successRate: 80
    });

    // Step 4: Verify failover occurred
    const updatedHealth = await AdminAPI.getProviderHealth();
    expect(updatedHealth.primaryProvider).toBe('circle');
    expect(updatedHealth.failoverActive).toBe(true);

    // Step 5: Test invoice creation on Circle
    const invoice = await EnterpriseAPI.createInvoice({
      amount: 1000,
      walletMode: 'ephemeral'
    });

    const wallet = await BackendAPI.getWallet(invoice.walletAddress);
    expect(wallet.provider).toBe('circle');

    // Step 6: Verify all apps notified
    const notifications = {
      admin: await AdminAPI.getNotifications(),
      enterprise: await EnterpriseAPI.getNotifications(),
      consumer: await ConsumerAPI.getNotifications()
    };

    for (const [app, notifs] of Object.entries(notifications)) {
      expect(notifs).toContainEqual(
        expect.objectContaining({
          type: 'provider-switched',
          from: 'tempo',
          to: 'circle'
        })
      );
    }
  });
});
```

---

### SCENARIO 5: Cross-Platform P2P Transfer
**Components**: Consumer A (3003) → Consumer B (3003) via Backend (3001)

#### Test Steps:
```typescript
// Test Case 5.1: P2P with Invoice-First
describe('P2P Invoice Transfer', () => {
  it('should handle P2P via invoice paradigm', async () => {
    // Step 1: Consumer A creates P2P request
    const p2pRequest = await ConsumerAPI.createP2PRequest({
      recipient: 'consumer-b@test.com',
      amount: 50,
      description: 'Split dinner bill',
      walletMode: 'ephemeral',
      ttlHours: 6
    });

    // Step 2: Consumer B receives and accepts
    const received = await ConsumerAPI.getReceivedRequests('consumer-b');
    const request = received.find(r => r.id === p2pRequest.id);

    const acceptance = await ConsumerAPI.acceptP2PRequest(request.id);
    expect(acceptance.walletCreated).toBe(true);

    // Step 3: Payment processing
    const payment = await ConsumerAPI.payP2P({
      requestId: request.id,
      from: 'consumer-b-wallet',
      to: acceptance.walletAddress
    });

    // Step 4: Verify ephemeral countdown
    const wallet = await BackendAPI.getWallet(acceptance.walletAddress);
    expect(wallet.destroy_at).toBeDefined();

    const timeRemaining = new Date(wallet.destroy_at) - new Date();
    expect(timeRemaining).toBeLessThanOrEqual(6 * 60 * 60 * 1000);
  });
});
```

---

## 🔐 SECURITY TEST CASES

### Security Scenario 1: Multi-Signature Approval
```typescript
describe('Multi-Sig Invoice Approval', () => {
  it('should require multiple signatures for high-value invoices', async () => {
    // Create high-value invoice
    const invoice = await EnterpriseAPI.createInvoice({
      amount: 50000,
      requireApproval: true,
      approvers: ['cfo@test.com', 'ceo@test.com'],
      requiredSignatures: 2
    });

    // First approval
    await EnterpriseAPI.approveInvoice(invoice.id, 'cfo@test.com');
    let status = await EnterpriseAPI.getInvoiceStatus(invoice.id);
    expect(status.walletCreated).toBe(false);

    // Second approval triggers wallet
    await EnterpriseAPI.approveInvoice(invoice.id, 'ceo@test.com');
    status = await EnterpriseAPI.getInvoiceStatus(invoice.id);
    expect(status.walletCreated).toBe(true);
  });
});
```

### Security Scenario 2: Ephemeral Wallet Isolation
```typescript
describe('Ephemeral Wallet Security', () => {
  it('should prevent access after expiration', async () => {
    const wallet = await BackendAPI.createEphemeralWallet({
      ttlHours: 1
    });

    // Fast-forward past expiration
    jest.advanceTimersByTime(3700000); // 1h + buffer

    // Attempt transaction should fail
    await expect(
      BackendAPI.transferFromWallet(wallet.address, 100)
    ).rejects.toThrow('Wallet expired');

    // Verify funds returned to source
    const source = await BackendAPI.getSourceAccount(wallet.sourceId);
    expect(source.returnedFunds).toContain(wallet.initialBalance);
  });
});
```

---

## 🚀 PERFORMANCE TEST CASES

### Performance Scenario 1: Bulk Processing
```typescript
describe('Bulk Invoice Performance', () => {
  it('should handle 1000 invoices within SLA', async () => {
    const startTime = Date.now();

    // Create 1000 invoices
    const invoices = Array.from({ length: 1000 }, (_, i) => ({
      amount: Math.random() * 1000,
      walletMode: i % 2 === 0 ? 'ephemeral' : 'persistent'
    }));

    const results = await EnterpriseAPI.bulkCreateInvoices(invoices);
    const endTime = Date.now();

    expect(results.successful).toBe(1000);
    expect(endTime - startTime).toBeLessThan(60000); // Under 1 minute

    // Verify all wallets created
    const wallets = await BackendAPI.getWalletsByBatch(results.batchId);
    expect(wallets).toHaveLength(1000);
  });
});
```

### Performance Scenario 2: Real-time Updates
```typescript
describe('WebSocket Performance', () => {
  it('should deliver updates within 500ms', async () => {
    const timestamps = [];

    // Subscribe to updates
    ws.on('wallet-update', (data) => {
      timestamps.push({
        event: data,
        received: Date.now()
      });
    });

    // Trigger wallet creation
    const created = Date.now();
    await BackendAPI.createWallet({ mode: 'ephemeral' });

    // Wait for event
    await new Promise(resolve => setTimeout(resolve, 1000));

    const event = timestamps.find(t => t.event.type === 'wallet-created');
    expect(event.received - created).toBeLessThan(500);
  });
});
```

---

## 📊 INTEGRATION MONITORING

### Monitoring Setup
```javascript
// monitoring/integration-monitor.js
class IntegrationMonitor {
  constructor() {
    this.metrics = {
      invoiceCreation: [],
      walletCreation: [],
      paymentProcessing: [],
      providerLatency: [],
      wsDelivery: []
    };
  }

  async runHealthCheck() {
    const results = {
      backend: await this.checkBackend(),
      admin: await this.checkAdmin(),
      enterprise: await this.checkEnterprise(),
      consumer: await this.checkConsumer(),
      providers: await this.checkProviders(),
      database: await this.checkDatabase()
    };

    return {
      timestamp: new Date(),
      healthy: Object.values(results).every(r => r.healthy),
      services: results
    };
  }

  async checkBackend() {
    try {
      const start = Date.now();
      const response = await fetch('http://localhost:3001/health');
      const latency = Date.now() - start;

      return {
        healthy: response.ok,
        latency,
        version: response.headers.get('x-api-version')
      };
    } catch (error) {
      return { healthy: false, error: error.message };
    }
  }

  async checkProviders() {
    const [tempo, circle] = await Promise.all([
      this.checkProvider('tempo'),
      this.checkProvider('circle')
    ]);

    return {
      healthy: tempo.healthy || circle.healthy,
      primary: tempo.healthy ? 'tempo' : 'circle',
      tempo,
      circle
    };
  }

  async checkProvider(provider) {
    const response = await fetch(`http://localhost:3001/api/providers/${provider}/health`);
    const data = await response.json();

    return {
      healthy: data.status === 'operational',
      tps: data.tps,
      latency: data.latency,
      successRate: data.successRate
    };
  }
}

// Run continuous monitoring
const monitor = new IntegrationMonitor();
setInterval(async () => {
  const health = await monitor.runHealthCheck();
  console.log('System Health:', health);

  if (!health.healthy) {
    console.error('SYSTEM UNHEALTHY:', health.services);
    // Send alerts
  }
}, 30000); // Every 30 seconds
```

---

## 🧪 E2E TEST EXECUTION

### Test Runner Configuration
```javascript
// jest.integration.config.js
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/integration/**/*.test.js'],
  setupFilesAfterEnv: ['./integration/setup.js'],
  testTimeout: 30000,
  maxWorkers: 1, // Run tests sequentially
  globals: {
    TEST_ENDPOINTS: {
      backend: 'http://localhost:3001',
      admin: 'http://localhost:3002',
      consumer: 'http://localhost:3003',
      enterprise: 'http://localhost:3007'
    }
  }
};
```

### Test Execution Commands
```bash
# Run all integration tests
npm run test:integration

# Run specific scenario
npm run test:integration -- --testNamePattern="Enterprise to Consumer"

# Run with coverage
npm run test:integration:coverage

# Run performance tests
npm run test:performance

# Run security tests
npm run test:security

# Continuous integration mode
npm run test:integration:ci
```

---

## 📈 SUCCESS CRITERIA

### Functional Requirements
- ✅ All invoice creation flows work across platforms
- ✅ Ephemeral wallets auto-destroy on schedule
- ✅ Provider failover occurs within 10 seconds
- ✅ Multi-sig approvals enforce thresholds
- ✅ WebSocket updates delivered to all clients

### Performance Requirements
- ✅ Invoice creation < 2 seconds
- ✅ Payment processing < 3 seconds
- ✅ Bulk operations: 100 items/minute minimum
- ✅ WebSocket latency < 500ms
- ✅ Dashboard load time < 2 seconds

### Reliability Requirements
- ✅ 99.95% uptime across all services
- ✅ Zero data loss during failover
- ✅ Graceful degradation on provider issues
- ✅ Automatic recovery from failures

---

## 🔧 TROUBLESHOOTING GUIDE

### Common Issues and Solutions

#### Issue 1: Wallet Creation Fails
```bash
# Check backend logs
tail -f logs/backend.log | grep "wallet-creation"

# Verify provider status
curl http://localhost:3001/api/providers/health

# Check database
psql -d monay -c "SELECT * FROM invoice_wallets WHERE status = 'failed';"
```

#### Issue 2: WebSocket Not Connecting
```bash
# Test WebSocket endpoint
wscat -c ws://localhost:3001

# Check CORS configuration
curl -I http://localhost:3001 -H "Origin: http://localhost:3003"

# Verify Redis
redis-cli ping
```

#### Issue 3: Cross-Platform Payment Fails
```bash
# Trace transaction
curl http://localhost:3001/api/trace/transaction/:id

# Check wallet status
curl http://localhost:3001/api/wallets/:address/status

# Verify user permissions
psql -d monay -c "SELECT * FROM user_permissions WHERE user_id = ':userId';"
```

---

## 🚦 CI/CD INTEGRATION

### GitHub Actions Workflow
```yaml
name: Integration Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  integration:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: test
          POSTGRES_DB: monay_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Run migrations
        run: npm run migrate:test

      - name: Start services
        run: |
          npm run start:backend:test &
          npm run start:admin:test &
          npm run start:enterprise:test &
          npm run start:consumer:test &
          sleep 10

      - name: Run integration tests
        run: npm run test:integration:ci

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: integration-test-results
          path: test-results/
```

---

## 📝 REPORTING

### Test Report Template
```markdown
# Integration Test Report
Date: [Date]
Build: [Build Number]
Environment: [Environment]

## Summary
- Total Scenarios: X
- Passed: X
- Failed: X
- Skipped: X
- Duration: X minutes

## Scenario Results
| Scenario | Status | Duration | Notes |
|----------|--------|----------|-------|
| Enterprise → Consumer | ✅ Pass | 2.3s | |
| Consumer R2P | ✅ Pass | 1.8s | |
| Bulk Payroll | ✅ Pass | 45s | |
| Provider Failover | ⚠️ Flaky | 12s | Intermittent timeout |
| P2P Transfer | ✅ Pass | 1.5s | |

## Performance Metrics
- Average Invoice Creation: Xms
- Average Payment Processing: Xms
- WebSocket Latency (P95): Xms
- Database Query Time (P95): Xms

## Issues Found
1. [Issue description and severity]
2. [Issue description and severity]

## Recommendations
- [Recommendation 1]
- [Recommendation 2]
```

---

This comprehensive integration test plan ensures all four components work seamlessly together in the Invoice-First architecture. Each team can now proceed with confidence that their implementation will integrate properly with the others.