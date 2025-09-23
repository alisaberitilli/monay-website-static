#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Patterns to replace
const patterns = [
  // Convert require statements
  {
    pattern: /const\s+(\w+)\s*=\s*require\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
    replacement: "import $1 from '$2'"
  },
  {
    pattern: /const\s+\{([^}]+)\}\s*=\s*require\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
    replacement: "import { $1 } from '$2'"
  },
  {
    pattern: /let\s+(\w+)\s*=\s*require\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
    replacement: "import $1 from '$2'"
  },
  {
    pattern: /var\s+(\w+)\s*=\s*require\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
    replacement: "import $1 from '$2'"
  },
  // Convert module.exports
  {
    pattern: /module\.exports\s*=\s*(\w+);?$/gm,
    replacement: 'export default $1;'
  },
  {
    pattern: /module\.exports\s*=\s*\{([^}]+)\};?$/gm,
    replacement: 'export { $1 };'
  },
  {
    pattern: /exports\.(\w+)\s*=\s*/g,
    replacement: 'export const $1 = '
  }
];

function convertFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Skip if already converted
    if (content.includes('import ') && content.includes('from ') && !content.includes('require(')) {
      console.log(`✓ Already converted: ${filePath}`);
      return;
    }

    patterns.forEach(({ pattern, replacement }) => {
      const newContent = content.replace(pattern, replacement);
      if (newContent !== content) {
        content = newContent;
        modified = true;
      }
    });

    // Add .js extension to local imports if missing
    content = content.replace(/from\s+['"](\.\.?\/[^'"]+)(?<!\.js)['"]/g, "from '$1.js'");

    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`✓ Converted: ${filePath}`);
    } else {
      console.log(`⊘ No changes needed: ${filePath}`);
    }
  } catch (error) {
    console.error(`✗ Error converting ${filePath}:`, error.message);
  }
}

function walkDirectory(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Skip node_modules and other directories
      if (!['node_modules', '.git', 'logs', 'build', 'dist', 'monay-api'].includes(file)) {
        walkDirectory(filePath, fileList);
      }
    } else if (file.endsWith('.js') && !file.endsWith('.test.js') && !file.endsWith('.spec.js')) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

// Main execution
console.log('Starting ES Module conversion...\n');

const srcDir = path.join(__dirname, 'src');
const files = walkDirectory(srcDir);

console.log(`Found ${files.length} JavaScript files to process\n`);

files.forEach(convertFile);

console.log('\n✓ Conversion complete!');
console.log('\nNext steps:');
console.log('1. Add "type": "module" to package.json');
console.log('2. Update package.json scripts to use node instead of babel-node');
console.log('3. Test the application thoroughly');