#!/usr/bin/env node

/**
 * Middleware Migration Status Tracker
 *
 * This script tracks the progress of gradual middleware consolidation
 * and helps ensure financial system safety during the migration.
 */

import { execSync } from 'child_process';
import { readFileSync, readdirSync } from 'fs';
import path from 'path';

const COLORS = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function colorize(text, color) {
  return `${COLORS[color]}${text}${COLORS.reset}`;
}

function runCommand(command) {
  try {
    return execSync(command, { encoding: 'utf8', cwd: process.cwd() }).trim();
  } catch (error) {
    return '';
  }
}

function analyzeMiddlewareStatus() {
  console.log(colorize('\n🛡️  MIDDLEWARE MIGRATION STATUS REPORT', 'bold'));
  console.log(colorize('=' * 60, 'cyan'));
  console.log(colorize('📅 Generated:', 'blue'), new Date().toISOString());

  // Count files in each directory
  const coreDir = 'src/middleware-core';
  const appDir = 'src/middleware-app';

  let coreCount = 0;
  let appCount = 0;

  try {
    coreCount = readdirSync(coreDir).filter(f => f.endsWith('.js')).length;
  } catch (e) {
    console.log(colorize('⚠️  Core middleware directory not found', 'yellow'));
  }

  try {
    appCount = readdirSync(appDir).filter(f => f.endsWith('.js')).length;
  } catch (e) {
    console.log(colorize('❌ App middleware directory not found', 'red'));
    return;
  }

  console.log('\n📁 DIRECTORY STATUS:');
  console.log(colorize(`   Core (middleware-core/): ${coreCount} files`, 'cyan'));
  console.log(colorize(`   App (middleware-app/):   ${appCount} files`, 'green'));

  // Count import usage
  const coreImports = runCommand(`grep -r "from '../middleware-core/" src/routes/ | wc -l`);
  const appImports = runCommand(`grep -r "from '../middleware-app/" src/routes/ | wc -l`);
  const oldImports = runCommand(`grep -r "from '../middlewares/" src/routes/ | wc -l`);

  console.log('\n📊 IMPORT USAGE:');
  console.log(colorize(`   Core imports:  ${coreImports}`, 'cyan'));
  console.log(colorize(`   App imports:   ${appImports}`, 'green'));
  if (parseInt(oldImports) > 0) {
    console.log(colorize(`   Old imports:   ${oldImports} (NEEDS FIXING)`, 'red'));
  }

  // Find broken imports
  console.log('\n🔍 BROKEN IMPORTS CHECK:');
  const brokenMiddlewares = runCommand(`grep -r "from '../middlewares/" src/routes/`);
  const brokenMiddleware = runCommand(`grep -r "from '../middleware/" src/routes/`);

  if (brokenMiddlewares || brokenMiddleware) {
    console.log(colorize('❌ URGENT: Old import paths found!', 'red'));
    if (brokenMiddlewares) {
      console.log(colorize('   Old path: ../middlewares/ (should be ../middleware-app/)', 'red'));
      const lines = brokenMiddlewares.split('\n').filter(l => l.trim()).slice(0, 5);
      lines.forEach(line => {
        if (line.trim()) console.log(colorize(`     ${line}`, 'red'));
      });
      if (brokenMiddlewares.split('\n').length > 5) {
        console.log(colorize(`     ... and ${brokenMiddlewares.split('\n').length - 5} more`, 'red'));
      }
    }
    if (brokenMiddleware) {
      console.log(colorize('   Old path: ../middleware/ (should be ../middleware-core/)', 'red'));
      const lines = brokenMiddleware.split('\n').filter(l => l.trim()).slice(0, 5);
      lines.forEach(line => {
        if (line.trim()) console.log(colorize(`     ${line}`, 'red'));
      });
      if (brokenMiddleware.split('\n').length > 5) {
        console.log(colorize(`     ... and ${brokenMiddleware.split('\n').length - 5} more`, 'red'));
      }
    }
  } else {
    console.log(colorize('✅ All imports use new directory structure', 'green'));
  }

  // Identify financial routes
  console.log('\n💰 FINANCIAL ROUTES (HANDLE WITH EXTREME CARE):');
  const financialRoutes = runCommand(`grep -l "billing\\|payment\\|card\\|bank\\|withdraw\\|transfer\\|auth\\|tenant\\|audit" src/routes/*.js`);

  if (financialRoutes) {
    const routes = financialRoutes.split('\n').filter(r => r.trim()).slice(0, 10);
    routes.forEach(route => {
      const imports = runCommand(`grep -n "import.*middleware" ${route}`);
      if (imports) {
        console.log(colorize(`   📄 ${path.basename(route)}:`, 'magenta'));
        imports.split('\n').forEach(line => {
          if (line.includes('../middleware/')) {
            console.log(colorize(`     ${line.trim()}`, 'yellow'));
          } else if (line.includes('../middlewares/')) {
            console.log(colorize(`     ${line.trim()}`, 'green'));
          }
        });
      }
    });

    if (financialRoutes.split('\n').length > 10) {
      console.log(colorize(`   ... and ${financialRoutes.split('\n').length - 10} more financial routes`, 'cyan'));
    }
  } else {
    console.log(colorize('   No financial routes found', 'yellow'));
  }

  // Progress summary
  console.log('\n📈 MIGRATION PROGRESS:');
  const totalImports = parseInt(legacyImports) + parseInt(modernImports);
  const modernPercentage = totalImports > 0 ? Math.round((parseInt(modernImports) / totalImports) * 100) : 0;

  console.log(colorize(`   Modern adoption: ${modernPercentage}% (${modernImports}/${totalImports} imports)`, 'cyan'));

  if (modernPercentage < 50) {
    console.log(colorize('   Status: Early stage - focus on fixing broken imports', 'yellow'));
  } else if (modernPercentage < 80) {
    console.log(colorize('   Status: Good progress - continue gradual migration', 'green'));
  } else {
    console.log(colorize('   Status: Nearly complete - finish remaining safe routes', 'green'));
  }

  // Safety recommendations
  console.log('\n🛡️  SAFETY RECOMMENDATIONS:');

  if (brokenValidation || brokenValidateRequest) {
    console.log(colorize('   🔥 URGENT: Fix broken imports immediately', 'red'));
    console.log(colorize('   📝 Update: ../middleware/validation → ../middlewares/validate-middleware.js', 'yellow'));
  }

  if (parseInt(legacyImports) > 0) {
    console.log(colorize('   ⚠️  CAUTION: Legacy imports still in use', 'yellow'));
    console.log(colorize('   📋 RULE: Only migrate when route needs major updates', 'cyan'));
    console.log(colorize('   🚨 NEVER: Batch-migrate financial/auth routes', 'red'));
  }

  console.log(colorize('   ✅ SAFE: Use middlewares/ for all new development', 'green'));

  // Quick commands
  console.log('\n🔧 QUICK COMMANDS:');
  console.log(colorize('   npm run middleware:check-broken', 'cyan'), '- Find broken imports');
  console.log(colorize('   npm run middleware:count-legacy', 'cyan'), '- Count legacy usage');
  console.log(colorize('   npm run middleware:list-financial', 'cyan'), '- List financial routes');

  console.log(colorize('\n📖 For detailed guidelines, see: CLAUDE.md', 'blue'));
  console.log(colorize('=' * 60, 'cyan'));
}

// Run the analysis
analyzeMiddlewareStatus();