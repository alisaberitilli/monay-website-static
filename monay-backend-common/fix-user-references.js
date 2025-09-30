#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Files that need User reference fixes
const filesToFix = [
  {
    file: 'src/repositories/transaction-repository.js',
    needsImport: false, // Already imports models
    replacements: [
      { from: 'await User.findOne', to: 'await models.User.findOne' },
      { from: 'await User.findAll', to: 'await models.User.findAll' }
    ]
  },
  {
    file: 'src/repositories/contact-repository.js',
    needsImport: false,
    replacements: [
      { from: 'await User.findAll', to: 'await models.User.findAll' }
    ]
  },
  {
    file: 'src/repositories/notification-repository.js',
    needsImport: false,
    replacements: [
      { from: 'await User.findOne', to: 'await models.User.findOne' }
    ]
  },
  {
    file: 'src/repositories/parent-child-repository.js',
    needsImport: false,
    replacements: [
      { from: 'await User.update', to: 'await models.User.update' }
    ]
  },
  {
    file: 'src/routes/verification.js',
    needsImport: true,
    replacements: [
      { from: 'await User.findByPk', to: 'await models.User.findByPk' },
      { from: 'await User.findOne', to: 'await models.User.findOne' },
      { from: 'User.findByPk', to: 'models.User.findByPk' },
      { from: 'User.findOne', to: 'models.User.findOne' }
    ]
  },
  {
    file: 'src/routes/p2p-transfer.js',
    needsImport: true,
    replacements: [
      { from: 'await User.findAll', to: 'await models.User.findAll' },
      { from: 'await User.findByPk', to: 'await models.User.findByPk' },
      { from: 'await User.findOne', to: 'await models.User.findOne' }
    ]
  },
  {
    file: 'src/routes/accounts.js',
    needsImport: true,
    replacements: [
      { from: 'await User.findOne', to: 'await models.User.findOne' }
    ]
  }
];

let totalFixes = 0;

filesToFix.forEach(({ file, needsImport, replacements }) => {
  const filePath = path.join(__dirname, file);

  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${file}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let fileFixCount = 0;

  // Add import if needed
  if (needsImport && !content.includes("import models from")) {
    // Check if file already has some imports
    if (content.includes("import ")) {
      // Add after the last import
      const lastImportIndex = content.lastIndexOf("import ");
      const endOfLineIndex = content.indexOf("\n", lastImportIndex);
      content = content.slice(0, endOfLineIndex + 1) +
                "import models from '../models/index.js';\n" +
                content.slice(endOfLineIndex + 1);
      console.log(`✅ Added models import to ${file}`);
    } else {
      // Add at the beginning
      content = "import models from '../models/index.js';\n\n" + content;
      console.log(`✅ Added models import to ${file}`);
    }
  }

  // Apply replacements
  replacements.forEach(({ from, to }) => {
    const regex = new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    const matches = content.match(regex);
    if (matches) {
      content = content.replace(regex, to);
      fileFixCount += matches.length;
    }
  });

  if (fileFixCount > 0) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed ${fileFixCount} User references in ${file}`);
    totalFixes += fileFixCount;
  } else {
    console.log(`ℹ️  No fixes needed in ${file}`);
  }
});

console.log(`\n🎉 Total fixes applied: ${totalFixes}`);
console.log('✨ All User reference issues have been fixed!');