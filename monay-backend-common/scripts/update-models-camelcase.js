#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

const modelsDir = path.join(__dirname, '../src/models');

// Get all model files except index.js
const modelFiles = fs.readdirSync(modelsDir)
  .filter(file => file.endsWith('.js') && file !== 'index.js');

console.log(`Found ${modelFiles.length} model files to update`);

modelFiles.forEach(file => {
  const filePath = path.join(modelsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Check if file contains 'underscored: true'
  if (content.includes('underscored: true')) {
    // Replace underscored: true with underscored: false
    content = content.replace(/underscored:\s*true/g, 'underscored: false');
    
    // Add tableName if not present
    const modelName = file.replace('.js', '');
    if (!content.includes('tableName:')) {
      // Find the sequelize.define call to get the table name
      const defineMatch = content.match(/sequelize\.define\s*\(\s*['"](\w+)['"]/);
      if (defineMatch) {
        const modelNameFromDefine = defineMatch[1];
        // Convert model name to table name (pluralize and lowercase)
        let tableName = modelNameFromDefine.toLowerCase();
        
        // Simple pluralization rules
        if (tableName.endsWith('y')) {
          tableName = tableName.slice(0, -1) + 'ies';
        } else if (tableName.endsWith('s') || tableName.endsWith('x') || tableName.endsWith('ch')) {
          tableName += 'es';
        } else {
          tableName += 's';
        }
        
        // Special cases based on the database schema we saw
        const specialCases = {
          'user': 'users',
          'userkyc': 'user_kyc',
          'usercard': 'user_cards',
          'userbankaccount': 'user_bank_accounts',
          'userdevice': 'user_devices',
          'userblock': 'user_blocks',
          'usertoken': 'user_tokens',
          'userkycdocument': 'kyc_documents',
          'childparent': 'child_parents',
          'changemobilehistory': 'change_mobile_history',
          'activitylog': 'activity_logs',
          'rolepermission': 'role_permissions',
          'paymentrequest': 'payment_requests',
          'mediatemp': 'media_temp',
          'transaction': 'transactions',
          'wallet': 'wallets',
          'notification': 'notifications',
          'cms': 'cms_pages',
          'faq': 'faqs',
          'setting': 'settings',
          'country': 'countries',
          'kycdocument': 'kyc_documents',
          'userrole': 'user_roles'
        };
        
        const finalTableName = specialCases[modelNameFromDefine.toLowerCase()] || tableName;
        
        // Add tableName to the options
        content = content.replace(
          /underscored:\s*false/g,
          `underscored: false,\n      tableName: '${finalTableName}'`
        );
      }
    }
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Updated ${file}`);
  } else if (!content.includes('underscored:')) {
    // Add underscored: false if not present
    const defineMatch = content.match(/sequelize\.define\s*\([^)]+\),\s*\{/);
    if (defineMatch) {
      content = content.replace(
        /sequelize\.define\s*\([^)]+\),\s*\{/,
        defineMatch[0] + '\n      underscored: false,'
      );
      fs.writeFileSync(filePath, content);
      console.log(`✅ Added underscored: false to ${file}`);
    }
  } else {
    console.log(`⏭️  Skipped ${file} (already configured)`);
  }
});

console.log('\n✨ All models updated for camelCase naming!');