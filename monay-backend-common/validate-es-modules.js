// ES Module Validation Script
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function validateFile(filePath) {
    const content = await fs.readFile(filePath, 'utf-8');
    const issues = [];

    // Check for CommonJS patterns
    if (content.includes('require(')) {
        issues.push(`CommonJS require() found in ${filePath}`);
    }
    if (content.includes('module.exports')) {
        issues.push(`CommonJS module.exports found in ${filePath}`);
    }

    // Check for missing .js extensions
    const importRegex = /from ['"](\.[^'"]+)['"]/g;
    let match;
    while ((match = importRegex.exec(content)) !== null) {
        if (!match[1].endsWith('.js') && !match[1].includes('/')) {
            issues.push(`Missing .js extension in ${filePath}: ${match[1]}`);
        }
    }

    return issues;
}

async function validateDirectory(dir) {
    const files = await fs.readdir(dir, { withFileTypes: true });
    let allIssues = [];

    for (const file of files) {
        const fullPath = path.join(dir, file.name);

        if (file.isDirectory() && !file.name.includes('node_modules')) {
            allIssues = allIssues.concat(await validateDirectory(fullPath));
        } else if (file.name.endsWith('.js')) {
            allIssues = allIssues.concat(await validateFile(fullPath));
        }
    }

    return allIssues;
}

// Run validation
console.log('Validating ES modules...');
const issues = await validateDirectory(path.join(__dirname, 'src'));

if (issues.length === 0) {
    console.log('✅ All files are valid ES modules!');
} else {
    console.log('❌ Found issues:');
    issues.forEach(issue => console.log(`  - ${issue}`));
    process.exit(1);
}
