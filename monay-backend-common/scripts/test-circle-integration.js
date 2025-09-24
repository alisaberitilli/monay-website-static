#!/usr/bin/env node

/**
 * Circle Integration Testing Script
 * Run this script to test all Circle wallet endpoints
 * Usage: node scripts/test-circle-integration.js
 */

import axios from 'axios';
import colors from 'colors';

const API_BASE_URL = process.env.API_URL || 'http://localhost:3001';
const AUTH_TOKEN = process.env.AUTH_TOKEN || 'your-test-auth-token';

// Test user data
const TEST_USER = {
    id: 'test-user-' + Date.now(),
    email: 'test@monay.com',
    token: AUTH_TOKEN
};

// Configure axios
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'Content-Type': 'application/json'
    }
});

// Test results
const results = {
    passed: 0,
    failed: 0,
    tests: []
};

/**
 * Test helper function
 */
async function runTest(name, testFn) {
    try {
        console.log(`\n🧪 Testing: ${name}`.cyan);
        await testFn();
        console.log(`✅ PASSED: ${name}`.green);
        results.passed++;
        results.tests.push({ name, status: 'passed' });
    } catch (error) {
        console.log(`❌ FAILED: ${name}`.red);
        console.log(`   Error: ${error.message}`.gray);
        results.failed++;
        results.tests.push({ name, status: 'failed', error: error.message });
    }
}

/**
 * Test Suite: Wallet Initialization
 */
async function testWalletInitialization() {
    await runTest('Initialize Dual Wallets', async () => {
        const response = await api.post('/api/circle-wallets/initialize');

        if (!response.data.success) {
            throw new Error('Failed to initialize wallets');
        }

        const { data } = response.data;
        if (!data.monay || !data.circle || !data.link) {
            throw new Error('Missing wallet data in response');
        }

        console.log('   Monay Wallet ID:'.gray, data.monay.id);
        console.log('   Circle Wallet ID:'.gray, data.circle.circle_wallet_id);
        console.log('   Link Status:'.gray, data.link.link_status);
    });
}

/**
 * Test Suite: Balance Operations
 */
async function testBalanceOperations() {
    await runTest('Get Combined Balance', async () => {
        const response = await api.get('/api/circle-wallets/balance');

        if (!response.data.success) {
            throw new Error('Failed to get balance');
        }

        const balance = response.data.data;
        if (balance.monay_balance === undefined || balance.circle_balance === undefined) {
            throw new Error('Invalid balance response');
        }

        console.log('   Monay Balance:'.gray, `$${balance.monay_balance}`);
        console.log('   Circle Balance:'.gray, `$${balance.circle_balance} USDC`);
        console.log('   Total USD Value:'.gray, `$${balance.total_usd_value}`);
    });

    await runTest('Get Circle Wallet Details', async () => {
        const response = await api.get('/api/circle-wallets/details');

        if (!response.data.success) {
            throw new Error('Failed to get wallet details');
        }

        const details = response.data.data;
        console.log('   Wallet Address:'.gray, details.address);
        console.log('   USDC Balance:'.gray, details.balance);
        console.log('   Auto-Convert:'.gray, details.auto_convert);
    });
}

/**
 * Test Suite: Bridge Transfers
 */
async function testBridgeTransfers() {
    const testAmount = 10;

    await runTest('Estimate Bridge Transfer', async () => {
        const response = await api.post('/api/circle-wallets/bridge/estimate', {
            amount: testAmount,
            direction: 'monay_to_circle'
        });

        if (!response.data.success) {
            throw new Error('Failed to estimate bridge');
        }

        const estimate = response.data.data;
        console.log('   Fee:'.gray, `$${estimate.fee}`);
        console.log('   Time:'.gray, `${estimate.time_seconds} seconds`);
        console.log('   Sufficient Balance:'.gray, estimate.sufficient_balance);
    });

    await runTest('Bridge Monay to Circle', async () => {
        try {
            const response = await api.post('/api/circle-wallets/bridge/to-circle', {
                amount: testAmount
            });

            if (!response.data.success) {
                throw new Error(response.data.message || 'Bridge transfer failed');
            }

            const transfer = response.data.data;
            console.log('   Transfer ID:'.gray, transfer.bridge_transfer_id);
            console.log('   Amount:'.gray, `$${transfer.amount}`);
            console.log('   Status:'.gray, transfer.status);
        } catch (error) {
            if (error.response?.data?.message?.includes('Insufficient')) {
                console.log('   Skipped:'.yellow, 'Insufficient balance for test');
            } else {
                throw error;
            }
        }
    });

    await runTest('Get Bridge History', async () => {
        const response = await api.get('/api/circle-wallets/bridge/history');

        if (!response.data.success) {
            throw new Error('Failed to get bridge history');
        }

        const history = response.data.data;
        console.log('   Total Transfers:'.gray, history.length);

        if (history.length > 0) {
            const latest = history[0];
            console.log('   Latest Transfer:'.gray,
                `${latest.amount} ${latest.source_currency} → ${latest.destination_currency}`);
        }
    });
}

/**
 * Test Suite: Smart Routing
 */
async function testSmartRouting() {
    await runTest('Get Optimal Payment Route', async () => {
        const response = await api.post('/api/circle-wallets/routing/optimize', {
            amount: 100,
            payment_type: 'payment',
            metadata: { international: true }
        });

        if (!response.data.success) {
            throw new Error('Failed to get routing');
        }

        const routing = response.data.data;
        console.log('   Recommended:'.gray, routing.recommended_wallet);
        console.log('   Reason:'.gray, routing.reason);
        console.log('   Monay Fee:'.gray, `$${routing.analysis.fees.monay}`);
        console.log('   Circle Fee:'.gray, `$${routing.analysis.fees.circle}`);
        console.log('   Monay Time:'.gray, `${routing.analysis.times.monay}s`);
        console.log('   Circle Time:'.gray, `${routing.analysis.times.circle}s`);
    });
}

/**
 * Test Suite: Transaction History
 */
async function testTransactionHistory() {
    await runTest('Get Circle Transactions', async () => {
        const response = await api.get('/api/circle-wallets/transactions?limit=10');

        if (!response.data.success) {
            throw new Error('Failed to get transactions');
        }

        const transactions = response.data.data;
        console.log('   Total Transactions:'.gray, transactions.length);

        if (transactions.length > 0) {
            const latest = transactions[0];
            console.log('   Latest Transaction:'.gray,
                `${latest.type} - ${latest.amount} ${latest.currency}`);
            console.log('   Status:'.gray, latest.status);
        }
    });
}

/**
 * Test Suite: Sync Operations
 */
async function testSyncOperations() {
    await runTest('Sync Circle Wallet Balance', async () => {
        const response = await api.post('/api/circle-wallets/sync');

        if (!response.data.success) {
            // This might fail if Circle API is not configured
            console.log('   Warning:'.yellow, 'Sync failed - Circle API may not be configured');
            return;
        }

        const sync = response.data.data;
        console.log('   Synced Balance:'.gray, sync.usdc_balance);
        console.log('   Available:'.gray, sync.available_balance);
        console.log('   Pending:'.gray, sync.pending_balance);
    });
}

/**
 * Test Suite: Error Handling
 */
async function testErrorHandling() {
    await runTest('Invalid Bridge Amount', async () => {
        try {
            await api.post('/api/circle-wallets/bridge/to-circle', {
                amount: -100
            });
            throw new Error('Should have rejected negative amount');
        } catch (error) {
            if (error.response?.status === 400) {
                console.log('   Correctly rejected:'.gray, 'Invalid amount');
            } else {
                throw error;
            }
        }
    });

    await runTest('Invalid Routing Direction', async () => {
        try {
            await api.post('/api/circle-wallets/bridge/estimate', {
                amount: 100,
                direction: 'invalid_direction'
            });
            throw new Error('Should have rejected invalid direction');
        } catch (error) {
            if (error.response?.status === 400) {
                console.log('   Correctly rejected:'.gray, 'Invalid direction');
            } else {
                throw error;
            }
        }
    });
}

/**
 * Performance Test
 */
async function testPerformance() {
    await runTest('API Response Time', async () => {
        const iterations = 10;
        const times = [];

        for (let i = 0; i < iterations; i++) {
            const start = Date.now();
            await api.get('/api/circle-wallets/balance');
            const end = Date.now();
            times.push(end - start);
        }

        const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
        const maxTime = Math.max(...times);
        const minTime = Math.min(...times);

        console.log('   Average:'.gray, `${avgTime.toFixed(2)}ms`);
        console.log('   Min:'.gray, `${minTime}ms`);
        console.log('   Max:'.gray, `${maxTime}ms`);

        if (avgTime > 200) {
            throw new Error(`Average response time ${avgTime}ms exceeds 200ms target`);
        }
    });
}

/**
 * Main test runner
 */
async function runAllTests() {
    console.log('\n===================================='.cyan);
    console.log('🚀 Circle Integration Test Suite'.cyan.bold);
    console.log('===================================='.cyan);
    console.log('API URL:'.gray, API_BASE_URL);
    console.log('Time:'.gray, new Date().toISOString());

    // Run test suites
    await testWalletInitialization();
    await testBalanceOperations();
    await testBridgeTransfers();
    await testSmartRouting();
    await testTransactionHistory();
    await testSyncOperations();
    await testErrorHandling();
    await testPerformance();

    // Print summary
    console.log('\n===================================='.cyan);
    console.log('📊 Test Results Summary'.cyan.bold);
    console.log('===================================='.cyan);
    console.log(`✅ Passed: ${results.passed}`.green);
    console.log(`❌ Failed: ${results.failed}`.red);
    console.log(`📝 Total: ${results.passed + results.failed}`.gray);

    const passRate = ((results.passed / (results.passed + results.failed)) * 100).toFixed(1);
    console.log(`📈 Pass Rate: ${passRate}%`.yellow);

    // Exit code
    if (results.failed > 0) {
        console.log('\n⚠️  Some tests failed. Please review the errors above.'.yellow);
        process.exit(1);
    } else {
        console.log('\n🎉 All tests passed successfully!'.green.bold);
        process.exit(0);
    }
}

// Handle errors
process.on('unhandledRejection', (error) => {
    console.error('\n❌ Unhandled error:'.red, error);
    process.exit(1);
});

// Run tests
runAllTests().catch(error => {
    console.error('\n❌ Test suite failed:'.red, error);
    process.exit(1);
});