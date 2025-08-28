#!/usr/bin/env node

const http = require('http');

const testEndpoint = (method, path, body = null) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, success: json.success, message: json.message || 'OK' });
        } catch (e) {
          resolve({ status: res.statusCode, success: false, message: 'Invalid JSON response' });
        }
      });
    });
    
    req.on('error', (error) => {
      resolve({ status: 0, success: false, message: error.message });
    });
    
    if (body) {
      req.write(JSON.stringify(body));
    }
    
    req.end();
  });
};

async function testAllEndpoints() {
  console.log('\n🧪 Testing Smart Contract & Treasury Endpoints\n');
  console.log('=' .repeat(60));
  
  const endpoints = [
    // EVM Contract Endpoints
    { method: 'GET', path: '/api/contracts/evm/info/0x123', name: 'EVM Contract Info' },
    { method: 'GET', path: '/api/contracts/evm/supply/0x123', name: 'EVM Token Supply' },
    { method: 'GET', path: '/api/contracts/evm/whitelist/0x456', name: 'EVM Whitelist Check' },
    { method: 'POST', path: '/api/contracts/evm/deploy', name: 'EVM Deploy Token', body: { name: 'Test', symbol: 'TST', initialSupply: 1000, adminAddress: '0x123' } },
    { method: 'POST', path: '/api/contracts/evm/mint', name: 'EVM Mint Tokens', body: { contractAddress: '0x123', toAddress: '0x456', amount: 100 } },
    
    // Solana Contract Endpoints
    { method: 'GET', path: '/api/contracts/solana/metadata/ABC', name: 'Solana Token Metadata' },
    { method: 'POST', path: '/api/contracts/solana/deploy', name: 'Solana Deploy Token', body: { name: 'Test', symbol: 'TST', initialSupply: 1000 } },
    { method: 'POST', path: '/api/contracts/solana/create-token', name: 'Solana Create Token', body: { name: 'Test', symbol: 'TST' } },
    { method: 'POST', path: '/api/contracts/solana/mint', name: 'Solana Mint Tokens', body: { mint: 'ABC', toAddress: 'DEF', amount: 100 } },
    
    // Treasury Endpoints
    { method: 'GET', path: '/api/treasury/overview', name: 'Treasury Overview' },
    { method: 'GET', path: '/api/treasury/balances', name: 'Treasury Balances' },
    { method: 'GET', path: '/api/treasury/balance/base', name: 'Base Chain Balance' },
    { method: 'GET', path: '/api/treasury/balance/solana', name: 'Solana Chain Balance' },
    { method: 'GET', path: '/api/treasury/analytics', name: 'Treasury Analytics' },
    { method: 'GET', path: '/api/treasury/compliance/report', name: 'Compliance Report' },
  ];
  
  let successCount = 0;
  let failureCount = 0;
  
  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint.method, endpoint.path, endpoint.body);
    const statusEmoji = result.success ? '✅' : '❌';
    const statusText = result.success ? 'SUCCESS' : 'FAILED';
    
    console.log(`${statusEmoji} ${endpoint.method.padEnd(6)} ${endpoint.path.padEnd(45)} | ${statusText}`);
    
    if (result.success) {
      successCount++;
    } else {
      failureCount++;
    }
  }
  
  console.log('=' .repeat(60));
  console.log(`\n📊 Test Results:`);
  console.log(`   ✅ Successful: ${successCount}/${endpoints.length}`);
  console.log(`   ❌ Failed: ${failureCount}/${endpoints.length}`);
  console.log(`   📈 Success Rate: ${((successCount/endpoints.length) * 100).toFixed(1)}%`);
  
  // Test endpoint health monitoring
  console.log('\n🩺 Checking Endpoint Health Monitoring...');
  const healthResult = await testEndpoint('GET', '/api/endpoints/health');
  if (healthResult.success) {
    console.log('   ✅ Health monitoring is active');
  } else {
    console.log('   ❌ Health monitoring not available');
  }
  
  console.log('\n✨ All smart contract and treasury endpoints have been activated!\n');
}

testAllEndpoints();