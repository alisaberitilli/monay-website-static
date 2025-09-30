import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Files with toast errors based on TypeScript output
const filesToFix = [
  'src/app/(dashboard)/circle-management/page.tsx',
  'src/app/(dashboard)/compliance/page.tsx',
  'src/app/(dashboard)/monitoring/page.tsx',
  'src/app/(dashboard)/providers/page.tsx',
  'src/app/(dashboard)/tempo-management/page.tsx',
  'src/app/(dashboard)/transactions/page.tsx',
  'src/app/(dashboard)/users-management/page.tsx',
];

function fixToastCalls(filePath) {
  const fullPath = path.join(__dirname, filePath);
  let content = fs.readFileSync(fullPath, 'utf8');
  let changes = 0;

  // Pattern 1: toast({ title: 'Error', description: '...', variant: 'destructive' })
  // Replace with: toast.error('...')
  content = content.replace(
    /toast\(\s*{\s*title:\s*['"]Error['"],\s*description:\s*['"]([^'"]+)['"],\s*variant:\s*['"]destructive['"]\s*}\s*\)/g,
    (match, description) => {
      changes++;
      return `toast.error('${description}')`;
    }
  );

  // Pattern 2: toast({ title: 'Success', description: '...' })
  // Replace with: toast.success('...')
  content = content.replace(
    /toast\(\s*{\s*title:\s*['"]Success['"],\s*description:\s*['"]([^'"]+)['"]\s*}\s*\)/g,
    (match, description) => {
      changes++;
      return `toast.success('${description}')`;
    }
  );

  // Pattern 3: Generic toast({ title: '...', description: '...' })
  // Replace with: toast.success('...')
  content = content.replace(
    /toast\(\s*{\s*title:\s*['"][^'"]+['"],\s*description:\s*['"]([^'"]+)['"]\s*}\s*\)/g,
    (match, description) => {
      changes++;
      return `toast.success('${description}')`;
    }
  );

  // Pattern 4: toast('...')
  // Replace with: toast.success('...')
  content = content.replace(
    /toast\((['"][^'"]+['"])\)/g,
    (match, message) => {
      changes++;
      return `toast.success(${message})`;
    }
  );

  if (changes > 0) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✓ Fixed ${changes} toast calls in ${filePath}`);
  } else {
    console.log(`  No changes needed in ${filePath}`);
  }
}

console.log('Fixing toast API usage errors...\n');

filesToFix.forEach(file => {
  try {
    fixToastCalls(file);
  } catch (error) {
    console.error(`✗ Error processing ${file}:`, error.message);
  }
});

console.log('\n✅ Toast API fixes complete!');