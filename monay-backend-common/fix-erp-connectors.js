#!/usr/bin/env node

/**
 * Script to fix ERP connector config issues
 */

const fs = require('fs');
const path = require('path');

const connectorsToFix = [
  'quickBooksConnector.js',
  'freshBooksConnector.js',
  'waveAccountingConnector.js',
  'zohoEnhancedConnector.js',
  'sageBusinessConnector.js',
  'sapConnector.js',
  'oracleNetSuiteIntegration.js',
  'xeroIntegration.js'
];

connectorsToFix.forEach(filename => {
  const filepath = path.join(__dirname, 'src/services', filename);

  if (!fs.existsSync(filepath)) {
    console.log(`File not found: ${filename}`);
    return;
  }

  let content = fs.readFileSync(filepath, 'utf8');

  // Fix constructor to handle undefined config
  content = content.replace(
    /constructor\s*\(\s*config\s*\)\s*{/g,
    'constructor(config = {}) {'
  );

  // Fix this.pool assignment
  content = content.replace(
    /this\.pool\s*=\s*new\s+Pool\(config\.db\);/g,
    'this.pool = config.db ? new Pool(config.db) : null;'
  );

  // Fix other config property accesses
  content = content.replace(
    /this\.clientId\s*=\s*config\.clientId;/g,
    'this.clientId = config.clientId || process.env.FRESHBOOKS_CLIENT_ID;'
  );

  content = content.replace(
    /this\.clientSecret\s*=\s*config\.clientSecret;/g,
    'this.clientSecret = config.clientSecret || process.env.FRESHBOOKS_CLIENT_SECRET;'
  );

  content = content.replace(
    /this\.redirectUri\s*=\s*config\.redirectUri;/g,
    'this.redirectUri = config.redirectUri || process.env.FRESHBOOKS_REDIRECT_URI;'
  );

  content = content.replace(
    /this\.organizationId\s*=\s*config\.organizationId;/g,
    'this.organizationId = config.organizationId || process.env.ORGANIZATION_ID;'
  );

  content = content.replace(
    /this\.accessToken\s*=\s*config\.accessToken;/g,
    'this.accessToken = config.accessToken || process.env.ACCESS_TOKEN;'
  );

  content = content.replace(
    /this\.apiKey\s*=\s*config\.apiKey;/g,
    'this.apiKey = config.apiKey || process.env.API_KEY;'
  );

  fs.writeFileSync(filepath, content, 'utf8');
  console.log(`✅ Fixed: ${filename}`);
});

console.log('\nAll ERP connector config issues fixed!');