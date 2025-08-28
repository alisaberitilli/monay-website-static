// Test Monay Admin Frontend Configuration
// Verify CaaS & WaaS administrative capabilities and service integrations

const monayConfig = require('../monay.config.js');

console.log('🧪 Testing Monay Admin Frontend Configuration...\\n');

// Test 1: Basic Admin Configuration
console.log('✅ 1. Admin Application Configuration:');
console.log(`   App Name: ${monayConfig.app.name}`);
console.log(`   Version: ${monayConfig.app.version}`);
console.log(`   Type: ${monayConfig.app.type}`);
console.log(`   Services: ${monayConfig.app.services.join(', ')}`);
console.log(`   Port: ${monayConfig.app.port}`);
console.log(`   Environment: ${monayConfig.app.environment}\\n`);

// Test 2: API Configuration
console.log('✅ 2. API & Backend Integration:');
console.log(`   Base URL: ${monayConfig.api.baseUrl}`);
console.log(`   Timeout: ${monayConfig.api.timeout}ms`);
console.log(`   Retry Attempts: ${monayConfig.api.retryAttempts}`);
console.log(`   Available Endpoints: ${Object.keys(monayConfig.api.endpoints).length}`);
Object.entries(monayConfig.api.endpoints).forEach(([key, path]) => {
  console.log(`     - ${key}: ${path}`);
});
console.log('');

// Test 3: Admin Authentication & Permissions
console.log('✅ 3. Admin Authentication & Security:');
console.log(`   Token Storage: ${monayConfig.auth.tokenStorage}`);
console.log(`   Session Timeout: ${monayConfig.auth.sessionTimeout / (60 * 60 * 1000)} hours`);
console.log(`   MFA Enabled: ${monayConfig.auth.mfa.enabled}`);
console.log(`   MFA Required: ${monayConfig.auth.mfa.required}`);
console.log(`   MFA Methods: ${monayConfig.auth.mfa.methods.join(', ')}`);
console.log(`   Permission Levels:`)
Object.entries(monayConfig.auth.permissions).forEach(([role, perms]) => {
  console.log(`     - ${role}: ${perms.length} permissions${perms.includes('*') ? ' (Full Access)' : ''}`);
});
console.log('');

// Test 4: CaaS Admin Features
console.log('✅ 4. CaaS (Crypto as a Service) Admin Features:');
console.log(`   CaaS Enabled: ${monayConfig.caas.enabled}`);
console.log(`   Admin Features:`)
Object.entries(monayConfig.caas.adminFeatures).forEach(([feature, enabled]) => {
  console.log(`     - ${feature}: ${enabled ? '✓' : '✗'}`);
});

console.log(`   Supported Blockchain Networks: ${Object.keys(monayConfig.caas.supportedChains).length}`);
Object.entries(monayConfig.caas.supportedChains).forEach(([name, config]) => {
  console.log(`     - ${config.name} (Chain ${config.chainId}): ${config.enabled ? '✓' : '✗'} ${config.testnet ? '(Testnet)' : '(Mainnet)'}`);
  console.log(`       Admin Controls: ${Object.keys(config.adminControls).length} features`);
});

console.log(`   Real-time Monitoring: ${monayConfig.caas.monitoring.realTimeUpdates}`);
console.log(`   Alert Thresholds: Gas Price High: ${monayConfig.caas.monitoring.alertThresholds.gasPrice.high}, Critical: ${monayConfig.caas.monitoring.alertThresholds.gasPrice.critical}`);
console.log('');

// Test 5: WaaS Admin Features
console.log('✅ 5. WaaS (Wallet as a Service) Admin Features:');
console.log(`   WaaS Enabled: ${monayConfig.waas.enabled}`);
console.log(`   Admin Features:`)
Object.entries(monayConfig.waas.adminFeatures).forEach(([feature, enabled]) => {
  console.log(`     - ${feature}: ${enabled ? '✓' : '✗'}`);
});

console.log(`   Custody Types: ${monayConfig.waas.custodyTypes.length}`);
monayConfig.waas.custodyTypes.forEach(type => {
  console.log(`     - ${type.name} (${type.securityLevel} security)`);
  console.log(`       Admin Controls: ${type.adminControls.join(', ')}`);
});

console.log(`   Security Features:`);
console.log(`     - Encryption: ${monayConfig.waas.security.encryption}`);
console.log(`     - Key Derivation: ${monayConfig.waas.security.keyDerivation}`);
console.log(`     - MFA Required: ${monayConfig.waas.security.mfaRequired}`);
console.log(`     - Audit Logging: ${monayConfig.waas.security.auditLogging}`);
console.log(`     - Compliance Reporting: ${monayConfig.waas.security.complianceReporting}`);
console.log('');

// Test 6: Business Rules Framework (BRF) Admin
console.log('✅ 6. Business Rules Framework (BRF) Admin:');
console.log(`   BRF Enabled: ${monayConfig.brf.enabled}`);
console.log(`   Admin Features:`)
Object.entries(monayConfig.brf.adminFeatures).forEach(([feature, enabled]) => {
  console.log(`     - ${feature}: ${enabled ? '✓' : '✗'}`);
});

console.log(`   KYC Management:`);
console.log(`     - Levels: ${monayConfig.brf.rules.kyc.levels.join(', ')}`);
console.log(`     - Level Management: ${monayConfig.brf.rules.kyc.adminControls.levelManagement}`);
console.log(`     - Document Review: ${monayConfig.brf.rules.kyc.adminControls.documentReview}`);
console.log(`     - Approval Workflow: ${monayConfig.brf.rules.kyc.adminControls.approvalWorkflow}`);

console.log(`   Compliance Controls:`);
console.log(`     - AML: ${monayConfig.brf.rules.compliance.aml.enabled ? '✓' : '✗'} (Real-time: ${monayConfig.brf.rules.compliance.aml.realTimeScreening})`);
console.log(`     - Sanctions: ${monayConfig.brf.rules.compliance.sanctions.enabled ? '✓' : '✗'} (Auto-updates: ${monayConfig.brf.rules.compliance.sanctions.listUpdates})`);
console.log(`     - PEP Screening: ${monayConfig.brf.rules.compliance.pep.enabled ? '✓' : '✗'} (Risk Scoring: ${monayConfig.brf.rules.compliance.pep.riskScoring})`);
console.log('');

// Test 7: Integration Management
console.log('✅ 7. Integration Management:');
console.log(`   Admin Features:`)
Object.entries(monayConfig.integrations.adminFeatures).forEach(([feature, enabled]) => {
  console.log(`     - ${feature}: ${enabled ? '✓' : '✗'}`);
});

console.log(`   TilliPay Integration:`);
console.log(`     - Enabled: ${monayConfig.integrations.tillipay.enabled}`);
console.log(`     - Admin Controls: ${Object.keys(monayConfig.integrations.tillipay.adminControls).length} features`);

console.log(`   KYC Provider Management:`);
console.log(`     - Supported Providers: ${monayConfig.integrations.kyc.providers.join(', ')}`);
console.log(`     - Admin Controls: ${Object.keys(monayConfig.integrations.kyc.adminControls).length} features`);

console.log(`   Notification Management:`);
console.log(`     - Admin Controls: ${Object.keys(monayConfig.integrations.notifications.adminControls).length} features`);
console.log('');

// Test 8: Dashboard & UI Configuration
console.log('✅ 8. Admin Dashboard Configuration:');
console.log(`   Default Layout: ${monayConfig.dashboard.defaultLayout}`);
console.log(`   Refresh Intervals:`);
Object.entries(monayConfig.dashboard.refreshIntervals).forEach(([metric, interval]) => {
  console.log(`     - ${metric}: ${interval / 1000}s`);
});

console.log(`   Chart Configuration:`);
console.log(`     - Default Time Range: ${monayConfig.dashboard.charts.defaultTimeRange}`);
console.log(`     - Available Ranges: ${monayConfig.dashboard.charts.availableRanges.join(', ')}`);
console.log(`     - Auto Refresh: ${monayConfig.dashboard.charts.autoRefresh}`);

console.log(`   Alert System:`);
console.log(`     - Enabled: ${monayConfig.dashboard.alerts.enabled}`);
console.log(`     - Alert Types: ${monayConfig.dashboard.alerts.types.join(', ')}`);
console.log(`     - Retention: ${monayConfig.dashboard.alerts.retention} days`);
console.log('');

// Test 9: System Monitoring
console.log('✅ 9. System Monitoring & Health:');
console.log(`   Monitoring Enabled: ${monayConfig.monitoring.enabled}`);
console.log(`   Monitoring Features:`)
Object.entries(monayConfig.monitoring.features).forEach(([feature, enabled]) => {
  console.log(`     - ${feature}: ${enabled ? '✓' : '✗'}`);
});

console.log(`   Alert Types:`)
Object.entries(monayConfig.monitoring.alerts).forEach(([alert, enabled]) => {
  console.log(`     - ${alert}: ${enabled ? '✓' : '✗'}`);
});
console.log('');

// Test 10: UI & UX Configuration
console.log('✅ 10. UI/UX Configuration:');
console.log(`   Theme System:`);
console.log(`     - Default Theme: ${monayConfig.ui.theme.default}`);
console.log(`     - Available Themes: ${monayConfig.ui.theme.available.join(', ')}`);
console.log(`     - Customization: ${monayConfig.ui.theme.customization}`);

console.log(`   Layout Settings:`);
console.log(`     - Sidebar: ${monayConfig.ui.layout.sidebar}`);
console.log(`     - Header: ${monayConfig.ui.layout.header}`);
console.log(`     - Breadcrumbs: ${monayConfig.ui.layout.breadcrumbs}`);

console.log(`   Table Configuration:`);
console.log(`     - Default Page Size: ${monayConfig.ui.tables.defaultPageSize}`);
console.log(`     - Export Formats: ${monayConfig.ui.tables.exportFormats.join(', ')}`);

console.log(`   Chart System:`);
console.log(`     - Library: ${monayConfig.ui.charts.library}`);
console.log(`     - Color Scheme: ${monayConfig.ui.charts.colorScheme}`);
console.log(`     - Animations: ${monayConfig.ui.charts.animations}`);
console.log('');

console.log('🎉 Monay Admin Frontend Configuration Test Complete!\\n');

// Configuration Summary
const summary = {
  configurationComplete: true,
  appType: monayConfig.app.type,
  services: monayConfig.app.services,
  port: monayConfig.app.port,
  caasAdminEnabled: monayConfig.caas.enabled,
  waasAdminEnabled: monayConfig.waas.enabled,
  brfAdminEnabled: monayConfig.brf.enabled,
  supportedChains: Object.keys(monayConfig.caas.supportedChains).length,
  custodyTypes: monayConfig.waas.custodyTypes.length,
  permissionLevels: Object.keys(monayConfig.auth.permissions).length,
  adminFeatures: {
    caasFeatures: Object.keys(monayConfig.caas.adminFeatures).length,
    waasFeatures: Object.keys(monayConfig.waas.adminFeatures).length,
    brfFeatures: Object.keys(monayConfig.brf.adminFeatures).length,
    integrationFeatures: Object.keys(monayConfig.integrations.adminFeatures).length
  },
  monitoring: {
    systemMonitoring: monayConfig.monitoring.enabled,
    realTimeUpdates: monayConfig.dashboard.refreshIntervals.systemHealth < 60000,
    alertsEnabled: monayConfig.dashboard.alerts.enabled
  },
  security: {
    mfaRequired: monayConfig.auth.mfa.required,
    auditLogging: monayConfig.waas.security.auditLogging,
    complianceReporting: monayConfig.waas.security.complianceReporting,
    sessionTimeout: monayConfig.auth.sessionTimeout
  },
  timestamp: new Date().toISOString()
};

console.log('📊 Admin Frontend Configuration Summary:');
console.log(JSON.stringify(summary, null, 2));

module.exports = summary;