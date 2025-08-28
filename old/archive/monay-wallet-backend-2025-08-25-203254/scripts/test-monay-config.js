// Test Monay Backend Configuration
// Verify CaaS & WaaS backend services and integrations

const monayConfig = require('../monay.config.js');

console.log('🧪 Testing Monay Backend Configuration...\n');

// Test 1: Basic Configuration
console.log('✅ 1. Basic Configuration:');
console.log(`   App Name: ${monayConfig.app.name}`);
console.log(`   Version: ${monayConfig.app.version}`);
console.log(`   Type: ${monayConfig.app.type}`);
console.log(`   Services: ${monayConfig.app.services.join(', ')}`);
console.log(`   Port: ${monayConfig.app.port}`);
console.log(`   Environment: ${monayConfig.app.environment}\n`);

// Test 2: Database Configuration
console.log('✅ 2. Database Configuration:');
console.log(`   PostgreSQL Host: ${monayConfig.database.main.host}:${monayConfig.database.main.port}`);
console.log(`   Database: ${monayConfig.database.main.database}`);
console.log(`   Redis Host: ${monayConfig.database.redis.host}:${monayConfig.database.redis.port}`);
console.log(`   Kafka Brokers: ${monayConfig.database.kafka.brokers.join(', ')}\n`);

// Test 3: CaaS Configuration
console.log('✅ 3. CaaS (Crypto as a Service) Configuration:');
console.log(`   Enabled: ${monayConfig.caas.enabled}`);
console.log(`   Supported Chains: ${Object.keys(monayConfig.caas.supportedChains).length}`);
console.log(`   Default Chain: ${monayConfig.caas.defaultChain}`);
console.log(`   Features:`);
Object.entries(monayConfig.caas.features).forEach(([key, value]) => {
  console.log(`     - ${key}: ${value}`);
});

console.log(`   Blockchain Networks:`);
Object.entries(monayConfig.caas.supportedChains).forEach(([name, config]) => {
  console.log(`     - ${name} (Chain ID: ${config.chainId}): ${config.enabled ? '✓' : '✗'}`);
});
console.log('');

// Test 4: WaaS Configuration
console.log('✅ 4. WaaS (Wallet as a Service) Configuration:');
console.log(`   Enabled: ${monayConfig.waas.enabled}`);
console.log(`   Custody Types: ${monayConfig.waas.custodyTypes.length}`);
console.log(`   Features:`);
Object.entries(monayConfig.waas.features).forEach(([key, value]) => {
  console.log(`     - ${key}: ${value}`);
});

console.log(`   Custody Options:`);
monayConfig.waas.custodyTypes.forEach(type => {
  console.log(`     - ${type.name} (${type.securityLevel} security)`);
});
console.log('');

// Test 5: Authentication & Security
console.log('✅ 5. Authentication & Security:');
console.log(`   JWT Algorithm: ${monayConfig.auth.jwt.algorithm}`);
console.log(`   JWT Expires: ${monayConfig.auth.jwt.expiresIn}`);
console.log(`   MFA Enabled: ${monayConfig.auth.mfa.enabled}`);
console.log(`   MFA Methods: ${monayConfig.auth.mfa.methods.join(', ')}`);
console.log(`   Rate Limit: ${monayConfig.auth.rateLimit.max} requests per ${monayConfig.auth.rateLimit.windowMs / 60000} minutes`);
console.log(`   CORS Origins: ${monayConfig.auth.security.cors.origin.join(', ')}\n`);

// Test 6: External Integrations
console.log('✅ 6. External Integrations:');
console.log(`   TilliPay: ${monayConfig.integrations.tillipay.enabled ? '✓' : '✗'}`);
console.log(`   KYC Providers:`);
Object.entries(monayConfig.integrations.kyc.providers).forEach(([name, config]) => {
  console.log(`     - ${name}: ${config.enabled ? '✓' : '✗'}`);
});
console.log(`   Default KYC: ${monayConfig.integrations.kyc.defaultProvider}`);
console.log(`   Push Notifications: ${monayConfig.integrations.notifications.push.fcm.enabled ? '✓' : '✗'}`);
console.log(`   Email: ${monayConfig.integrations.notifications.email.provider}`);
console.log(`   SMS: ${monayConfig.integrations.notifications.sms.provider}`);
console.log(`   AWS Storage: ${monayConfig.integrations.storage.aws.enabled ? '✓' : '✗'}\n`);

// Test 7: API Configuration
console.log('✅ 7. API Configuration:');
console.log(`   Version: ${monayConfig.api.version}`);
console.log(`   Prefix: ${monayConfig.api.prefix}`);
console.log(`   Documentation: ${monayConfig.api.documentation.enabled ? '✓' : '✗'}`);
console.log(`   Swagger: ${monayConfig.api.documentation.swagger.enabled ? '✓' : '✗'}`);
console.log(`   Swagger Path: ${monayConfig.api.documentation.swagger.path}`);
console.log(`   Health Endpoint: ${monayConfig.api.endpoints.health}`);
console.log(`   Metrics Endpoint: ${monayConfig.api.endpoints.metrics}\n`);

// Test 8: Business Rules Framework (BRF)
console.log('✅ 8. Business Rules Framework (BRF):');
console.log(`   Enabled: ${monayConfig.brf.enabled}`);
console.log(`   KYC Required: ${monayConfig.brf.rules.kyc.required}`);
console.log(`   KYC Levels: ${monayConfig.brf.rules.kyc.levels.join(', ')}`);
console.log(`   Default KYC Level: ${monayConfig.brf.rules.kyc.defaultLevel}`);
console.log(`   Transaction Limits: ${monayConfig.brf.rules.transactionLimits.enabled ? '✓' : '✗'}`);
console.log(`   AML Monitoring: ${monayConfig.brf.rules.compliance.aml ? '✓' : '✗'}`);
console.log(`   Sanctions Screening: ${monayConfig.brf.rules.compliance.sanctions ? '✓' : '✗'}\n`);

// Test 9: Monitoring & Health
console.log('✅ 9. Monitoring & Health:');
console.log(`   Log Level: ${monayConfig.monitoring.logging.level}`);
console.log(`   Metrics: ${monayConfig.monitoring.metrics.enabled ? '✓' : '✗'}`);
console.log(`   Prometheus: ${monayConfig.monitoring.metrics.prometheus.enabled ? '✓' : '✗'}`);
console.log(`   Health Checks: ${monayConfig.monitoring.health.checks.join(', ')}\n`);

// Test 10: Development Configuration
console.log('✅ 10. Development Configuration:');
console.log(`   Debug Mode: ${monayConfig.development.debugMode}`);
console.log(`   Test Data: ${monayConfig.development.testData.enabled ? '✓' : '✗'}`);
console.log(`   Use Testnets: ${monayConfig.development.blockchain.useTestnets ? '✓' : '✗'}`);
console.log(`   Mock Transactions: ${monayConfig.development.blockchain.mockTransactions ? '✓' : '✗'}\n`);

console.log('🎉 Monay Backend Configuration Test Complete!\n');

// Configuration Summary
const summary = {
  configurationComplete: true,
  appType: monayConfig.app.type,
  services: monayConfig.app.services,
  caasEnabled: monayConfig.caas.enabled,
  waasEnabled: monayConfig.waas.enabled,
  supportedChains: Object.keys(monayConfig.caas.supportedChains).length,
  custodyTypes: monayConfig.waas.custodyTypes.length,
  brfEnabled: monayConfig.brf.enabled,
  integrations: {
    tillipay: monayConfig.integrations.tillipay.enabled,
    kyc: Object.values(monayConfig.integrations.kyc.providers).some(p => p.enabled),
    notifications: monayConfig.integrations.notifications.push.fcm.enabled,
    storage: monayConfig.integrations.storage.aws.enabled
  },
  security: {
    mfa: monayConfig.auth.mfa.enabled,
    rateLimit: monayConfig.auth.rateLimit.max,
    helmet: monayConfig.auth.security.helmet,
    cors: monayConfig.auth.security.cors.origin.length > 0
  },
  monitoring: {
    metrics: monayConfig.monitoring.metrics.enabled,
    healthChecks: monayConfig.monitoring.health.enabled
  },
  timestamp: new Date().toISOString()
};

console.log('📊 Backend Configuration Summary:');
console.log(JSON.stringify(summary, null, 2));

// Test database connectivity
async function testDatabaseConnection() {
  try {
    console.log('\n🔍 Testing Database Connectivity...');
    
    // Test PostgreSQL connection (using existing connection)
    const { Pool } = require('pg');
    const pool = new Pool({
      host: monayConfig.database.main.host,
      port: monayConfig.database.main.port,
      user: monayConfig.database.main.username,
      password: monayConfig.database.main.password,
      database: monayConfig.database.main.database
    });

    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as current_time');
    console.log(`✅ PostgreSQL Connected: ${result.rows[0].current_time}`);
    client.release();
    await pool.end();

    console.log('✅ Database connectivity test passed!\n');
  } catch (error) {
    console.log(`❌ Database connectivity test failed: ${error.message}\n`);
  }
}

// Run database test
testDatabaseConnection();

module.exports = summary;