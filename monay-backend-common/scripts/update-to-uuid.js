#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

const modelsDir = path.join(__dirname, '../src/models');

// Fields that should be UUID/STRING type
const uuidFields = [
  'id',
  'userId',
  'parentId',
  'childId',
  'senderId',
  'receiverId',
  'requesterId',
  'payerId',
  'blockedUserId',
  'blockedByUserId',
  'createdBy',
  'updatedBy',
  'assignedBy',
  'issuerId',
  'recipientId'
];

// Get all model files
const modelFiles = fs.readdirSync(modelsDir)
  .filter(file => file.endsWith('.js') && file !== 'index.js');

console.log(`Found ${modelFiles.length} model files to check for UUID fields`);

modelFiles.forEach(file => {
  const filePath = path.join(modelsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Check each UUID field
  uuidFields.forEach(field => {
    // Pattern to match field definitions with INTEGER type
    const patterns = [
      new RegExp(`${field}:\\s*{[^}]*type:\\s*DataTypes\\.INTEGER[^}]*}`, 'g'),
      new RegExp(`${field}:\\s*DataTypes\\.INTEGER`, 'g')
    ];
    
    patterns.forEach(pattern => {
      if (pattern.test(content)) {
        // Replace INTEGER with STRING
        content = content.replace(
          new RegExp(`(${field}:\\s*{[^}]*type:\\s*)DataTypes\\.INTEGER`, 'g'),
          '$1DataTypes.STRING'
        );
        content = content.replace(
          new RegExp(`(${field}:\\s*)DataTypes\\.INTEGER`, 'g'),
          '$1DataTypes.STRING'
        );
        modified = true;
        console.log(`  ✅ Updated ${field} in ${file} from INTEGER to STRING`);
      }
    });
  });
  
  // Special handling for User model ID field
  if (file === 'User.js') {
    // Ensure User ID is properly defined as STRING with primaryKey
    if (!content.includes('id: {')) {
      // Add ID field if missing
      const defineMatch = content.match(/sequelize\.define\s*\(\s*['"]User['"]\s*,\s*{/);
      if (defineMatch) {
        const insertPos = defineMatch.index + defineMatch[0].length;
        const idField = `
      id: {
        type: DataTypes.STRING,
        primaryKey: true
      },`;
        content = content.slice(0, insertPos) + idField + content.slice(insertPos);
        modified = true;
        console.log(`  ✅ Added UUID id field to User model`);
      }
    } else if (!content.includes('primaryKey: true')) {
      // Ensure primaryKey is set
      content = content.replace(
        /(id:\s*{[^}]*type:\s*DataTypes\.STRING)/,
        '$1,\n        primaryKey: true'
      );
      modified = true;
      console.log(`  ✅ Added primaryKey: true to User model id field`);
    }
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`✨ Updated ${file}`);
  } else {
    console.log(`⏭️  No UUID field updates needed for ${file}`);
  }
});

console.log('\n✨ All models checked for UUID field types!');