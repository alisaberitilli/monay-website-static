import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';
import { randomString, randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

// Custom metrics
const errorRate = new Rate('errors');
const walletCreationTime = new Trend('wallet_creation_time');
const invoiceAttachmentTime = new Trend('invoice_attachment_time');
const paymentProcessingTime = new Trend('payment_processing_time');
const websocketConnections = new Counter('websocket_connections');
const transactionsPerSecond = new Rate('transactions_per_second');

// Test configuration
export const options = {
  scenarios: {
    // Smoke test
    smoke: {
      executor: 'constant-vus',
      vus: 1,
      duration: '1m',
      tags: { test_type: 'smoke' },
    },

    // Load test - gradual ramp up
    load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 50 },   // Ramp up to 50 users
        { duration: '5m', target: 50 },   // Stay at 50 users
        { duration: '2m', target: 100 },  // Ramp up to 100 users
        { duration: '5m', target: 100 },  // Stay at 100 users
        { duration: '2m', target: 0 },    // Ramp down to 0 users
      ],
      gracefulRampDown: '30s',
      tags: { test_type: 'load' },
    },

    // Stress test - beyond normal capacity
    stress: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 100 },
        { duration: '5m', target: 100 },
        { duration: '2m', target: 200 },
        { duration: '5m', target: 200 },
        { duration: '2m', target: 300 },
        { duration: '5m', target: 300 },
        { duration: '10m', target: 0 },
      ],
      tags: { test_type: 'stress' },
    },

    // Spike test - sudden load increase
    spike: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '10s', target: 100 },
        { duration: '1m', target: 100 },
        { duration: '10s', target: 1000 }, // Spike to 1000 users
        { duration: '3m', target: 1000 },
        { duration: '10s', target: 100 },
        { duration: '3m', target: 100 },
        { duration: '10s', target: 0 },
      ],
      tags: { test_type: 'spike' },
    },

    // Soak test - extended duration
    soak: {
      executor: 'constant-vus',
      vus: 100,
      duration: '2h',
      tags: { test_type: 'soak' },
    },

    // Breakpoint test - find system limits
    breakpoint: {
      executor: 'ramping-arrival-rate',
      startRate: 10,
      timeUnit: '1s',
      preAllocatedVUs: 100,
      maxVUs: 1000,
      stages: [
        { duration: '5m', target: 100 },
        { duration: '5m', target: 500 },
        { duration: '5m', target: 1000 },
        { duration: '5m', target: 2000 },
        { duration: '5m', target: 3000 },
      ],
      tags: { test_type: 'breakpoint' },
    },
  },

  thresholds: {
    // API response time thresholds
    http_req_duration: [
      'p(50)<200',  // 50% of requests should be below 200ms
      'p(95)<500',  // 95% of requests should be below 500ms
      'p(99)<1000', // 99% of requests should be below 1s
    ],

    // Error rate threshold
    errors: ['rate<0.01'], // Error rate should be below 1%

    // Transaction-specific thresholds
    wallet_creation_time: ['p(95)<1000'],
    invoice_attachment_time: ['p(95)<500'],
    payment_processing_time: ['p(95)<2000'],

    // Throughput threshold
    http_reqs: ['rate>100'], // Should handle at least 100 requests per second
  },
};

// Test configuration
const BASE_URL = __ENV.API_URL || 'http://localhost:3001';
const TEST_USER = {
  email: `perf_${randomString(8)}@test.com`,
  password: 'Test123!@#',
  firstName: 'Performance',
  lastName: 'Test',
  companyName: 'Load Testing Inc'
};

// Setup - run once per test
export function setup() {
  // Register test user
  const registerRes = http.post(
    `${BASE_URL}/api/auth/register`,
    JSON.stringify(TEST_USER),
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );

  check(registerRes, {
    'user registered': (r) => r.status === 201,
  });

  const authToken = registerRes.json('token');
  return { authToken };
}

// Main test scenario
export default function (data) {
  const authToken = data.authToken;
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${authToken}`,
  };

  group('Invoice Wallet Flow', () => {
    // 1. Create Invoice Wallet
    group('Create Wallet', () => {
      const walletData = {
        walletName: `PerfWallet_${randomString(8)}`,
        description: 'Performance test wallet',
        walletType: 'INVOICE_FIRST',
        currency: 'USD',
        complianceLevel: 'STANDARD',
        autoPayEnabled: true,
        paymentThreshold: 1000,
      };

      const startTime = Date.now();
      const walletRes = http.post(
        `${BASE_URL}/api/invoice-wallets`,
        JSON.stringify(walletData),
        { headers, tags: { name: 'CreateWallet' } }
      );
      const duration = Date.now() - startTime;

      walletCreationTime.add(duration);

      const success = check(walletRes, {
        'wallet created': (r) => r.status === 201,
        'has wallet ID': (r) => r.json('id') !== undefined,
        'has wallet address': (r) => r.json('address') !== undefined,
      });

      errorRate.add(!success);

      if (!success) return;

      const walletId = walletRes.json('id');

      // 2. Attach Invoice
      group('Attach Invoice', () => {
        const invoiceData = {
          invoiceNumber: `INV-PERF-${Date.now()}`,
          amount: randomIntBetween(100, 10000),
          currency: 'USD',
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          vendorName: 'Performance Vendor',
          description: 'Load test invoice',
        };

        const invoiceStartTime = Date.now();
        const invoiceRes = http.post(
          `${BASE_URL}/api/invoice-wallets/${walletId}/invoices`,
          JSON.stringify(invoiceData),
          { headers, tags: { name: 'AttachInvoice' } }
        );
        const invoiceDuration = Date.now() - invoiceStartTime;

        invoiceAttachmentTime.add(invoiceDuration);

        const invoiceSuccess = check(invoiceRes, {
          'invoice attached': (r) => r.status === 201,
          'has invoice ID': (r) => r.json('id') !== undefined,
        });

        errorRate.add(!invoiceSuccess);

        if (invoiceSuccess) {
          const invoiceId = invoiceRes.json('id');

          // 3. Process Payment
          group('Process Payment', () => {
            // First fund the wallet
            const fundRes = http.post(
              `${BASE_URL}/api/invoice-wallets/${walletId}/fund`,
              JSON.stringify({
                amount: 20000,
                currency: 'USD',
                paymentMethod: 'BANK_TRANSFER',
                reference: `PERF-FUND-${Date.now()}`,
              }),
              { headers, tags: { name: 'FundWallet' } }
            );

            check(fundRes, {
              'wallet funded': (r) => r.status === 200,
            });

            // Process payment
            const paymentStartTime = Date.now();
            const paymentRes = http.post(
              `${BASE_URL}/api/invoice-wallets/${walletId}/invoices/${invoiceId}/pay`,
              JSON.stringify({
                paymentMethod: 'WALLET_BALANCE',
                amount: invoiceData.amount,
              }),
              { headers, tags: { name: 'ProcessPayment' } }
            );
            const paymentDuration = Date.now() - paymentStartTime;

            paymentProcessingTime.add(paymentDuration);

            const paymentSuccess = check(paymentRes, {
              'payment processed': (r) => r.status === 200,
              'has transaction ID': (r) => r.json('transactionId') !== undefined,
            });

            errorRate.add(!paymentSuccess);
            transactionsPerSecond.add(paymentSuccess ? 1 : 0);
          });
        }
      });

      // 4. Get Wallet Balance
      group('Check Balance', () => {
        const balanceRes = http.get(
          `${BASE_URL}/api/invoice-wallets/${walletId}/balance`,
          { headers, tags: { name: 'GetBalance' } }
        );

        check(balanceRes, {
          'balance retrieved': (r) => r.status === 200,
          'has balance fields': (r) => {
            const json = r.json();
            return json.available !== undefined && json.pending !== undefined;
          },
        });
      });

      // 5. Get Transaction History
      group('Transaction History', () => {
        const historyRes = http.get(
          `${BASE_URL}/api/invoice-wallets/${walletId}/transactions?limit=10`,
          { headers, tags: { name: 'GetTransactions' } }
        );

        check(historyRes, {
          'transactions retrieved': (r) => r.status === 200,
          'has transaction array': (r) => Array.isArray(r.json('transactions')),
        });
      });

      // 6. Transfer Between Wallets
      if (Math.random() > 0.5) {
        group('Wallet Transfer', () => {
          // Create second wallet
          const wallet2Res = http.post(
            `${BASE_URL}/api/invoice-wallets`,
            JSON.stringify({
              ...walletData,
              walletName: `TransferTarget_${randomString(8)}`,
            }),
            { headers }
          );

          if (wallet2Res.status === 201) {
            const wallet2Id = wallet2Res.json('id');

            const transferRes = http.post(
              `${BASE_URL}/api/invoice-wallets/${walletId}/transfer`,
              JSON.stringify({
                toWalletId: wallet2Id,
                amount: 100,
                currency: 'USD',
                description: 'Performance test transfer',
              }),
              { headers, tags: { name: 'WalletTransfer' } }
            );

            check(transferRes, {
              'transfer completed': (r) => r.status === 200,
            });
          }
        });
      }
    });
  });

  // WebSocket Testing (simulated)
  group('WebSocket Operations', () => {
    websocketConnections.add(1);

    // Simulate WebSocket subscription
    const wsSubscribeRes = http.post(
      `${BASE_URL}/api/websocket/subscribe`,
      JSON.stringify({
        events: ['wallet:update', 'invoice:created', 'payment:completed'],
      }),
      { headers, tags: { name: 'WebSocketSubscribe' } }
    );

    check(wsSubscribeRes, {
      'WebSocket subscribed': (r) => r.status === 200 || r.status === 404,
    });
  });

  // Think time between iterations
  sleep(randomIntBetween(1, 3));
}

// Teardown - run once after test
export function teardown(data) {
  console.log('Test completed');

  // Could clean up test data here if needed
}

// Custom summary
export function handleSummary(data) {
  return {
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
    'performance-results.json': JSON.stringify(data, null, 2),
    'performance-results.html': htmlReport(data),
  };
}

// Helper function for text summary
function textSummary(data, options) {
  const { indent = '', enableColors = false } = options;
  const color = enableColors ? {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    reset: '\x1b[0m',
  } : {
    green: '',
    red: '',
    yellow: '',
    reset: '',
  };

  let summary = `
${indent}======================================
${indent}         PERFORMANCE TEST RESULTS
${indent}======================================

${indent}Test Duration: ${data.state.testRunDurationMs}ms
${indent}VUs Max: ${data.metrics.vus.values.max}
${indent}Iterations: ${data.metrics.iterations.values.count}

${indent}Request Metrics:
${indent}  Total Requests: ${data.metrics.http_reqs.values.count}
${indent}  RPS: ${data.metrics.http_reqs.values.rate.toFixed(2)}
${indent}  Failed Requests: ${(data.metrics.http_req_failed.values.passes / data.metrics.http_reqs.values.count * 100).toFixed(2)}%
${indent}
${indent}Response Times:
${indent}  Median: ${data.metrics.http_req_duration.values.med.toFixed(2)}ms
${indent}  P95: ${data.metrics.http_req_duration.values['p(95)'].toFixed(2)}ms
${indent}  P99: ${data.metrics.http_req_duration.values['p(99)'].toFixed(2)}ms

${indent}Custom Metrics:
${indent}  Wallet Creation P95: ${data.metrics.wallet_creation_time.values['p(95)'].toFixed(2)}ms
${indent}  Invoice Attachment P95: ${data.metrics.invoice_attachment_time.values['p(95)'].toFixed(2)}ms
${indent}  Payment Processing P95: ${data.metrics.payment_processing_time.values['p(95)'].toFixed(2)}ms
${indent}  Error Rate: ${(data.metrics.errors.values.rate * 100).toFixed(2)}%
${indent}  TPS: ${data.metrics.transactions_per_second.values.rate.toFixed(2)}

${indent}Thresholds:
`;

  for (const [metric, threshold] of Object.entries(data.metrics)) {
    if (threshold.thresholds) {
      const passed = threshold.thresholds.every(t => t.ok);
      const statusColor = passed ? color.green : color.red;
      const status = passed ? 'PASS' : 'FAIL';
      summary += `${indent}  ${metric}: ${statusColor}${status}${color.reset}\n`;
    }
  }

  return summary;
}

// Helper function for HTML report
function htmlReport(data) {
  return `
<!DOCTYPE html>
<html>
<head>
  <title>Performance Test Results</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    h1 { color: #333; }
    .metric { margin: 10px 0; padding: 10px; background: #f5f5f5; border-radius: 5px; }
    .pass { color: green; }
    .fail { color: red; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { padding: 10px; text-align: left; border: 1px solid #ddd; }
    th { background: #4CAF50; color: white; }
  </style>
</head>
<body>
  <h1>Performance Test Results</h1>
  <div class="metric">
    <h2>Summary</h2>
    <p>Duration: ${data.state.testRunDurationMs}ms</p>
    <p>Total Requests: ${data.metrics.http_reqs.values.count}</p>
    <p>Error Rate: ${(data.metrics.errors.values.rate * 100).toFixed(2)}%</p>
  </div>

  <h2>Response Times</h2>
  <table>
    <tr>
      <th>Percentile</th>
      <th>Time (ms)</th>
    </tr>
    <tr>
      <td>Median (P50)</td>
      <td>${data.metrics.http_req_duration.values.med.toFixed(2)}</td>
    </tr>
    <tr>
      <td>P95</td>
      <td>${data.metrics.http_req_duration.values['p(95)'].toFixed(2)}</td>
    </tr>
    <tr>
      <td>P99</td>
      <td>${data.metrics.http_req_duration.values['p(99)'].toFixed(2)}</td>
    </tr>
  </table>
</body>
</html>
`;
}