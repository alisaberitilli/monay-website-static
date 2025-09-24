#!/usr/bin/env node

/**
 * Circle Integration Setup Validator
 * Checks that all Circle integration components are properly configured
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('\n🔍 Circle Integration Validation\n');

const checks = {
    passed: [],
    failed: [],
    warnings: []
};

// Check 1: Migration file exists
function checkMigration() {
    const migrationPath = path.join(__dirname, '../migrations/015_circle_wallet_integration.sql');
    if (fs.existsSync(migrationPath)) {
        const content = fs.readFileSync(migrationPath, 'utf8');
        const tableCount = (content.match(/CREATE TABLE/gi) || []).length;
        checks.passed.push(`✅ Migration file exists with ${tableCount} tables`);
    } else {
        checks.failed.push('❌ Migration file not found');
    }
}

// Check 2: Service files exist
function checkServices() {
    const services = [
        'wallet-orchestrator-service.js',
        'circle-wallet-service.js',
        'bridge-transfer-service.js'
    ];

    services.forEach(service => {
        const servicePath = path.join(__dirname, '../src/services/', service);
        if (fs.existsSync(servicePath)) {
            checks.passed.push(`✅ Service ${service} exists`);
        } else {
            checks.failed.push(`❌ Service ${service} not found`);
        }
    });
}

// Check 3: Routes file exists
function checkRoutes() {
    const routePath = path.join(__dirname, '../src/routes/circle-wallets.js');
    if (fs.existsSync(routePath)) {
        const content = fs.readFileSync(routePath, 'utf8');
        const routeCount = (content.match(/router\.(get|post|put|delete)/gi) || []).length;
        checks.passed.push(`✅ Routes file exists with ${routeCount} endpoints`);
    } else {
        checks.failed.push('❌ Routes file not found');
    }
}

// Check 4: Test files exist
function checkTests() {
    const tests = [
        '../src/__tests__/services/wallet-orchestrator.test.js',
        '../src/__tests__/integration/circle-bridge-flow.test.js'
    ];

    tests.forEach(test => {
        const testPath = path.join(__dirname, test);
        if (fs.existsSync(testPath)) {
            checks.passed.push(`✅ Test ${path.basename(test)} exists`);
        } else {
            checks.warnings.push(`⚠️ Test ${path.basename(test)} not found`);
        }
    });
}

// Check 5: Environment configuration
function checkEnvironment() {
    const envExamplePath = path.join(__dirname, '../../.env.circle.example');
    if (fs.existsSync(envExamplePath)) {
        checks.passed.push('✅ Environment example file exists');
    } else {
        checks.failed.push('❌ Environment example file not found');
    }

    // Check if actual env is configured
    const envVars = [
        'CIRCLE_API_KEY',
        'CIRCLE_WEBHOOK_SECRET',
        'CIRCLE_USE_MOCK'
    ];

    envVars.forEach(envVar => {
        if (process.env[envVar]) {
            checks.passed.push(`✅ ${envVar} is configured`);
        } else {
            checks.warnings.push(`⚠️ ${envVar} not configured (needed for production)`);
        }
    });
}

// Check 6: Dependencies
function checkDependencies() {
    const packagePath = path.join(__dirname, '../package.json');
    if (fs.existsSync(packagePath)) {
        const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

        if (pkg.dependencies && pkg.dependencies['@circle-fin/circle-sdk']) {
            checks.passed.push('✅ Circle SDK is installed');
        } else {
            checks.warnings.push('⚠️ Circle SDK not in package.json');
        }
    }
}

// Check 7: ES Module compatibility
function checkESModules() {
    const packagePath = path.join(__dirname, '../package.json');
    if (fs.existsSync(packagePath)) {
        const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

        if (pkg.type === 'module') {
            checks.passed.push('✅ Package configured for ES modules');
        } else {
            checks.warnings.push('⚠️ Package not configured for ES modules');
        }
    }
}

// Run all checks
console.log('Running validation checks...\n');

checkMigration();
checkServices();
checkRoutes();
checkTests();
checkEnvironment();
checkDependencies();
checkESModules();

// Print results
console.log('\n📊 Validation Results\n');

if (checks.passed.length > 0) {
    console.log('✅ Passed Checks:');
    checks.passed.forEach(check => console.log('  ' + check));
}

if (checks.warnings.length > 0) {
    console.log('\n⚠️  Warnings:');
    checks.warnings.forEach(warning => console.log('  ' + warning));
}

if (checks.failed.length > 0) {
    console.log('\n❌ Failed Checks:');
    checks.failed.forEach(fail => console.log('  ' + fail));
}

// Summary
console.log('\n📈 Summary');
console.log(`  Passed: ${checks.passed.length}`);
console.log(`  Warnings: ${checks.warnings.length}`);
console.log(`  Failed: ${checks.failed.length}`);

const totalChecks = checks.passed.length + checks.warnings.length + checks.failed.length;
const successRate = ((checks.passed.length / totalChecks) * 100).toFixed(1);

console.log(`  Success Rate: ${successRate}%`);

// Recommendations
if (checks.warnings.length > 0 || checks.failed.length > 0) {
    console.log('\n💡 Recommendations:');

    if (checks.failed.length > 0) {
        console.log('  1. Fix critical issues (failed checks) first');
    }

    if (checks.warnings.some(w => w.includes('CIRCLE_API_KEY'))) {
        console.log('  2. Configure Circle API credentials for production');
    }

    if (checks.warnings.some(w => w.includes('ES modules'))) {
        console.log('  3. Ensure package.json has "type": "module"');
    }

    if (checks.warnings.some(w => w.includes('Test'))) {
        console.log('  4. Run test suite to verify functionality');
    }
}

// Final status
if (checks.failed.length === 0) {
    console.log('\n✅ Circle Integration is properly set up!');
    process.exit(0);
} else {
    console.log('\n❌ Some issues need to be resolved');
    process.exit(1);
}