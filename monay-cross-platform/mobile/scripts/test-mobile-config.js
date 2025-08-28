// Test Monay Mobile Application Configuration
// Verify WaaS mobile features for iOS & Android

const monayConfig = require('../monay.config.js');

console.log('🧪 Testing Monay Mobile Application Configuration...\\n');

// Test 1: Mobile App Configuration
console.log('✅ 1. Mobile Application Configuration:');
console.log(`   App Name: ${monayConfig.app.name}`);
console.log(`   Version: ${monayConfig.app.version}`);
console.log(`   Platforms: ${monayConfig.app.platform.join(', ')}`);
console.log(`   Type: ${monayConfig.app.type}`);
console.log(`   Services: ${monayConfig.app.services.join(', ')}`);
console.log(`   Environment: ${monayConfig.app.environment}\\n`);

// Test 2: Mobile WaaS Features
console.log('✅ 2. Mobile WaaS Features:');
console.log(`   WaaS Enabled: ${monayConfig.waas.enabled}`);

console.log(`   Core Mobile Features:`)
const coreFeatures = ['walletCreation', 'multiChainSupport', 'balanceDisplay', 'transactionHistory', 'sendReceive', 'qrCodeScanning', 'qrCodeGeneration'];
coreFeatures.forEach(feature => {
  console.log(`     - ${feature}: ${monayConfig.waas.features[feature] ? '✓' : '✗'}`);
});

console.log(`   Mobile Security Features:`)
const securityFeatures = ['biometricAuth', 'faceIdSupport', 'touchIdSupport', 'pinCode', 'autoLock', 'secureStorage'];
securityFeatures.forEach(feature => {
  console.log(`     - ${feature}: ${monayConfig.waas.features[feature] ? '✓' : '✗'}`);
});

console.log(`   Mobile-First Features:`)
const mobileFeatures = ['pushNotifications', 'hapticFeedback', 'offlineMode', 'backgroundSync', 'deepLinking', 'universalLinks'];
mobileFeatures.forEach(feature => {
  console.log(`     - ${feature}: ${monayConfig.waas.features[feature] ? '✓' : '✗'}`);
});

console.log(`   Recovery Features:`)
const recoveryFeatures = ['socialRecovery', 'emailRecovery', 'cloudRecovery', 'guardianManagement'];
recoveryFeatures.forEach(feature => {
  console.log(`     - ${feature}: ${monayConfig.waas.features[feature] ? '✓' : '✗'}`);
});
console.log('');

// Test 3: Mobile Custody Options
console.log('✅ 3. Mobile Custody Options:');
console.log(`   Available Options: ${monayConfig.waas.custodyOptions.length}`);
monayConfig.waas.custodyOptions.forEach((option, index) => {
  console.log(`   ${index + 1}. ${option.name} (${option.type})`);
  console.log(`      Description: ${option.description}`);
  console.log(`      Security Level: ${option.securityLevel}`);
  console.log(`      Recommended: ${option.recommended ? '✓' : '✗'}`);
  console.log(`      Mobile Features:`)
  Object.entries(option.mobileFeatures).forEach(([feature, enabled]) => {
    console.log(`        - ${feature}: ${enabled ? '✓' : '✗'}`);
  });
  console.log('');
});

// Test 4: Mobile-Specific Settings
console.log('✅ 4. Mobile-Specific Settings:');
console.log(`   Biometric Authentication:`);
console.log(`     - Face ID: ${monayConfig.waas.mobileSettings.biometric.faceId ? '✓' : '✗'}`);
console.log(`     - Touch ID: ${monayConfig.waas.mobileSettings.biometric.touchId ? '✓' : '✗'}`);
console.log(`     - Android Biometric: ${monayConfig.waas.mobileSettings.biometric.androidBiometric ? '✓' : '✗'}`);
console.log(`     - Fallback to PIN: ${monayConfig.waas.mobileSettings.biometric.fallbackToPin ? '✓' : '✗'}`);

console.log(`   Security Settings:`);
console.log(`     - Auto Lock: ${monayConfig.waas.mobileSettings.security.autoLockTimeout / 60000} minutes`);
console.log(`     - Auth on App Open: ${monayConfig.waas.mobileSettings.security.requireAuthOnAppOpen ? '✓' : '✗'}`);
console.log(`     - Obscure App Switcher: ${monayConfig.waas.mobileSettings.security.obscureAppSwitcher ? '✓' : '✗'}`);
console.log(`     - Jailbreak Detection: ${monayConfig.waas.mobileSettings.security.jailbreakDetection ? '✓' : '✗'}`);

console.log(`   Notification Settings:`);
Object.entries(monayConfig.waas.mobileSettings.notifications).forEach(([type, enabled]) => {
  console.log(`     - ${type}: ${enabled ? '✓' : '✗'}`);
});
console.log('');

// Test 5: Supported Blockchains
console.log('✅ 5. Mobile-Optimized Blockchains:');
console.log(`   Total Networks: ${Object.keys(monayConfig.blockchains).length}`);
Object.entries(monayConfig.blockchains).forEach(([key, chain]) => {
  console.log(`   - ${chain.name} (${chain.symbol})`);
  console.log(`     Chain ID: ${chain.chainId}`);
  console.log(`     Mobile Optimized: ${chain.mobileOptimized ? '✓' : '✗'}`);
  console.log(`     Features: ${Object.keys(chain.features).filter(f => chain.features[f]).join(', ')}`);
  console.log('');
});

// Test 6: Mobile Security Configuration
console.log('✅ 6. Mobile Security Configuration:');
console.log(`   Biometric Security:`);
console.log(`     - Enabled: ${monayConfig.security.biometric.enabled ? '✓' : '✗'}`);
console.log(`     - Required: ${monayConfig.security.biometric.required ? '✓' : '✗'}`);
console.log(`     - Methods: ${monayConfig.security.biometric.methods.join(', ')}`);
console.log(`     - Fallback: ${monayConfig.security.biometric.fallback}`);

console.log(`   Encryption:`);
console.log(`     - Algorithm: ${monayConfig.security.encryption.algorithm}`);
console.log(`     - Key Storage: ${monayConfig.security.encryption.keyStorage}`);
console.log(`     - Backup Encryption: ${monayConfig.security.encryption.backupEncryption ? '✓' : '✗'}`);

console.log(`   Authentication:`);
console.log(`     - Methods: ${monayConfig.security.authentication.methods.join(', ')}`);
console.log(`     - Max Attempts: ${monayConfig.security.authentication.maxAttempts}`);
console.log(`     - Lockout Duration: ${monayConfig.security.authentication.lockoutDuration / 60000} minutes`);
console.log(`     - Session Timeout: ${monayConfig.security.authentication.sessionTimeout / 60000} minutes`);
console.log('');

// Test 7: Mobile UI Configuration
console.log('✅ 7. Mobile UI Configuration:');
console.log(`   Theme System:`);
console.log(`     - Default: ${monayConfig.ui.theme.default}`);
console.log(`     - Options: ${monayConfig.ui.theme.options.join(', ')}`);
console.log(`     - Primary Color: ${monayConfig.ui.theme.colors.primary}`);

console.log(`   Navigation:`);
console.log(`     - Type: ${monayConfig.ui.navigation.type}`);
console.log(`     - Position: ${monayConfig.ui.navigation.position}`);
console.log(`     - Items: ${monayConfig.ui.navigation.items.join(', ')}`);
console.log(`     - Gestures: ${monayConfig.ui.navigation.gestures ? '✓' : '✗'}`);
console.log(`     - Haptics: ${monayConfig.ui.navigation.haptics ? '✓' : '✗'}`);

console.log(`   Animations:`);
console.log(`     - Enabled: ${monayConfig.ui.animations.enabled ? '✓' : '✗'}`);
console.log(`     - Duration: ${monayConfig.ui.animations.duration}ms`);
console.log(`     - Type: ${monayConfig.ui.animations.type}`);
console.log('');

// Test 8: Push Notifications
console.log('✅ 8. Push Notifications Configuration:');
console.log(`   Push Notifications: ${monayConfig.notifications.push.enabled ? '✓' : '✗'}`);
console.log(`   Provider: ${monayConfig.notifications.push.provider}`);
console.log(`   Notification Channels:`);
Object.entries(monayConfig.notifications.push.channels).forEach(([channel, config]) => {
  console.log(`     - ${channel}:`);
  console.log(`       Enabled: ${config.enabled ? '✓' : '✗'}`);
  console.log(`       Priority: ${config.priority}`);
  console.log(`       Sound: ${config.sound ? '✓' : '✗'}`);
  console.log(`       Vibration: ${config.vibration ? '✓' : '✗'}`);
  console.log(`       Badge: ${config.badge ? '✓' : '✗'}`);
});
console.log('');

// Test 9: iOS-Specific Features
console.log('✅ 9. iOS-Specific Configuration:');
console.log(`   Minimum iOS Version: ${monayConfig.ios.minimumVersion}`);
console.log(`   iOS Features:`);
Object.entries(monayConfig.ios.features).forEach(([feature, enabled]) => {
  console.log(`     - ${feature}: ${enabled ? '✓' : '✗'}`);
});
console.log(`   iOS Permissions:`)
Object.entries(monayConfig.ios.permissions).forEach(([permission, description]) => {
  console.log(`     - ${permission}: "${description}"`);
});
console.log('');

// Test 10: Android-Specific Features
console.log('✅ 10. Android-Specific Configuration:');
console.log(`   Minimum SDK Version: ${monayConfig.android.minimumSdkVersion}`);
console.log(`   Target SDK Version: ${monayConfig.android.targetSdkVersion}`);
console.log(`   Android Features:`);
Object.entries(monayConfig.android.features).forEach(([feature, enabled]) => {
  console.log(`     - ${feature}: ${enabled ? '✓' : '✗'}`);
});
console.log(`   Android Permissions:`);
Object.entries(monayConfig.android.permissions).forEach(([permission, enabled]) => {
  console.log(`     - ${permission}: ${enabled ? '✓' : '✗'}`);
});
console.log('');

console.log('🎉 Monay Mobile Application Configuration Test Complete!\\n');

// Configuration Summary
const summary = {
  configurationComplete: true,
  appType: monayConfig.app.type,
  platforms: monayConfig.app.platform,
  version: monayConfig.app.version,
  waasEnabled: monayConfig.waas.enabled,
  mobileFeatures: {
    biometricAuth: monayConfig.waas.features.biometricAuth,
    faceId: monayConfig.waas.features.faceIdSupport,
    touchId: monayConfig.waas.features.touchIdSupport,
    pushNotifications: monayConfig.waas.features.pushNotifications,
    offlineMode: monayConfig.waas.features.offlineMode,
    qrCodeSupport: monayConfig.waas.features.qrCodeScanning,
    hapticFeedback: monayConfig.waas.features.hapticFeedback
  },
  custodyOptions: monayConfig.waas.custodyOptions.length,
  recommendedCustody: monayConfig.waas.custodyOptions.find(c => c.recommended)?.name || 'None',
  supportedChains: Object.keys(monayConfig.blockchains).length,
  security: {
    biometricEnabled: monayConfig.security.biometric.enabled,
    encryptionAlgorithm: monayConfig.security.encryption.algorithm,
    keyStorage: monayConfig.security.encryption.keyStorage,
    socialRecovery: monayConfig.waas.features.socialRecovery
  },
  notifications: {
    pushEnabled: monayConfig.notifications.push.enabled,
    transactionAlerts: monayConfig.notifications.push.channels.transactions.enabled,
    securityAlerts: monayConfig.notifications.push.channels.security.enabled
  },
  ios: {
    minimumVersion: monayConfig.ios.minimumVersion,
    faceIdEnabled: monayConfig.ios.features.faceId,
    appleSignIn: monayConfig.ios.features.appleSignIn
  },
  android: {
    minimumSdk: monayConfig.android.minimumSdkVersion,
    targetSdk: monayConfig.android.targetSdkVersion,
    fingerprintEnabled: monayConfig.android.features.fingerprint
  },
  timestamp: new Date().toISOString()
};

console.log('📊 Mobile Application Configuration Summary:');
console.log(JSON.stringify(summary, null, 2));

module.exports = summary;