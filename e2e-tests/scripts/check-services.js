#!/usr/bin/env node
/**
 * Service Health Check Script
 * Verifies all required services are running before tests
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const SERVICES = [
  { name: 'Backend API', port: 3001, url: 'http://localhost:3001/health' },
  { name: 'Admin Portal', port: 3002, url: 'http://localhost:3002' },
  { name: 'Consumer Wallet', port: 3003, url: 'http://localhost:3003' },
  { name: 'Enterprise Wallet', port: 3007, url: 'http://localhost:3007' }
];

const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

async function checkPort(port) {
  try {
    const { stdout } = await execAsync(`lsof -i :${port} -sTCP:LISTEN`);
    return stdout.trim().length > 0;
  } catch {
    return false;
  }
}

async function checkHealth(url) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'E2E-Test-Runner' }
    });

    clearTimeout(timeout);
    return response.ok;
  } catch {
    return false;
  }
}

async function checkServices() {
  console.log('🔍 Checking service status...\n');

  const results = [];
  let allServicesRunning = true;

  for (const service of SERVICES) {
    const portRunning = await checkPort(service.port);
    const healthCheck = portRunning ? await checkHealth(service.url) : false;

    const status = {
      ...service,
      portRunning,
      healthCheck,
      isRunning: portRunning && (service.port === 3001 ? healthCheck : portRunning)
    };

    results.push(status);

    if (!status.isRunning) {
      allServicesRunning = false;
    }

    const statusIcon = status.isRunning ? '✅' : '❌';
    const statusColor = status.isRunning ? COLORS.green : COLORS.red;

    console.log(`${statusIcon} ${service.name} (Port ${service.port}): ${statusColor}${status.isRunning ? 'RUNNING' : 'NOT RUNNING'}${COLORS.reset}`);

    if (portRunning && !healthCheck && service.port === 3001) {
      console.log(`   ${COLORS.yellow}⚠️  Port is active but health check failed${COLORS.reset}`);
    }
  }

  console.log('\n' + '='.repeat(50));

  if (allServicesRunning) {
    console.log(`${COLORS.green}✅ All services are running! Ready for tests.${COLORS.reset}\n`);
    return true;
  } else {
    console.log(`${COLORS.red}❌ Some services are not running!${COLORS.reset}\n`);
    console.log(`${COLORS.yellow}To start missing services, run:${COLORS.reset}\n`);

    if (!results.find(r => r.port === 3001)?.isRunning) {
      console.log(`  ${COLORS.blue}# Backend API${COLORS.reset}`);
      console.log('  cd /Users/alisaberi/Data/0ProductBuild/monay/monay-backend-common');
      console.log('  npm run dev\n');
    }

    if (!results.find(r => r.port === 3002)?.isRunning) {
      console.log(`  ${COLORS.blue}# Admin Portal${COLORS.reset}`);
      console.log('  cd /Users/alisaberi/Data/0ProductBuild/monay/monay-admin');
      console.log('  npm run dev\n');
    }

    if (!results.find(r => r.port === 3003)?.isRunning) {
      console.log(`  ${COLORS.blue}# Consumer Wallet${COLORS.reset}`);
      console.log('  cd /Users/alisaberi/Data/0ProductBuild/monay/monay-cross-platform/web');
      console.log('  npm run dev\n');
    }

    if (!results.find(r => r.port === 3007)?.isRunning) {
      console.log(`  ${COLORS.blue}# Enterprise Wallet${COLORS.reset}`);
      console.log('  cd /Users/alisaberi/Data/0ProductBuild/monay/monay-caas/monay-enterprise-wallet');
      console.log('  npm run dev\n');
    }

    console.log(`${COLORS.yellow}Note: Tests will continue but may fail if required services are not running.${COLORS.reset}\n`);
  }

  return allServicesRunning;
}

// Run the check
checkServices().then(allRunning => {
  process.exit(allRunning ? 0 : 0); // Exit with 0 to allow tests to continue
}).catch(error => {
  console.error(`${COLORS.red}Error checking services:${COLORS.reset}`, error);
  process.exit(0); // Don't block tests
});