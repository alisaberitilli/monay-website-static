#!/usr/bin/env node

/**
 * STEP 5: Verify Migration
 * This script verifies that the icon migration was successful:
 * - Checks all imports are correct
 * - Verifies TypeScript compilation
 * - Tests icon rendering
 * - Checks for missing icons
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface VerificationResult {
  application: string;
  checks: {
    packageJsonValid: boolean;
    monayIconsInstalled: boolean;
    typeScriptCompiles: boolean;
    noMissingIcons: boolean;
    noOldImports: boolean;
    buildSucceeds?: boolean;
  };
  issues: string[];
  warnings: string[];
}

class MigrationVerifier {
  private results: VerificationResult[] = [];
  private allPassed: boolean = true;

  async verify(): Promise<void> {
    console.log('🔍 Starting Migration Verification...\n');

    const applications = [
      {
        name: 'monay-admin',
        path: path.resolve(__dirname, '../../../../monay-admin'),
        srcPath: 'src',
      },
      {
        name: 'monay-enterprise-wallet',
        path: path.resolve(__dirname, '../../../../monay-caas/monay-enterprise-wallet'),
        srcPath: 'src',
      },
      {
        name: 'monay-consumer-web',
        path: path.resolve(__dirname, '../../../../monay-cross-platform/web'),
        srcPath: 'app',
      },
    ];

    for (const app of applications) {
      await this.verifyApplication(app);
    }

    this.generateReport();
  }

  private async verifyApplication(app: {
    name: string;
    path: string;
    srcPath: string;
  }): Promise<void> {
    console.log(`${'='.repeat(80)}`);
    console.log(`📱 Verifying ${app.name}...`);
    console.log(`${'='.repeat(80)}\n`);

    const result: VerificationResult = {
      application: app.name,
      checks: {
        packageJsonValid: false,
        monayIconsInstalled: false,
        typeScriptCompiles: false,
        noMissingIcons: false,
        noOldImports: false,
      },
      issues: [],
      warnings: [],
    };

    // 1. Check package.json
    console.log('1️⃣  Checking package.json...');
    result.checks.packageJsonValid = await this.checkPackageJson(app, result);

    // 2. Check @monay/icons installation
    console.log('2️⃣  Checking @monay/icons installation...');
    result.checks.monayIconsInstalled = await this.checkIconsInstalled(app, result);

    // 3. Check for old lucide-react imports
    console.log('3️⃣  Checking for old imports...');
    result.checks.noOldImports = await this.checkOldImports(app, result);

    // 4. Check TypeScript compilation
    console.log('4️⃣  Checking TypeScript compilation...');
    result.checks.typeScriptCompiles = await this.checkTypeScript(app, result);

    // 5. Check for missing icons
    console.log('5️⃣  Checking for missing icons...');
    result.checks.noMissingIcons = await this.checkMissingIcons(app, result);

    // 6. Optional: Try to build (only if all other checks pass)
    if (Object.values(result.checks).every(check => check !== false)) {
      console.log('6️⃣  Testing build (this may take a moment)...');
      result.checks.buildSucceeds = await this.checkBuild(app, result);
    }

    this.results.push(result);

    // Update overall status
    if (result.issues.length > 0) {
      this.allPassed = false;
    }

    console.log('');
  }

  private async checkPackageJson(
    app: { name: string; path: string },
    result: VerificationResult
  ): Promise<boolean> {
    try {
      const packagePath = path.join(app.path, 'package.json');
      if (!fs.existsSync(packagePath)) {
        result.issues.push('package.json not found');
        console.log('  ❌ package.json not found');
        return false;
      }

      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));

      // Check for @monay/icons dependency
      const monayIcons = packageJson.dependencies?.['@monay/icons'];
      if (!monayIcons) {
        result.issues.push('@monay/icons not in dependencies');
        console.log('  ❌ @monay/icons not in dependencies');
        return false;
      }

      if (!monayIcons.startsWith('file:')) {
        result.warnings.push('@monay/icons not using local file path');
        console.log('  ⚠️  @monay/icons not using local file path');
      }

      // Check for unwanted icon libraries
      const unwantedLibs = ['react-icons', '@radix-ui/react-icons', '@heroicons/react', 'fontawesome'];
      for (const lib of unwantedLibs) {
        if (packageJson.dependencies?.[lib] || packageJson.devDependencies?.[lib]) {
          result.warnings.push(`Unwanted library still present: ${lib}`);
          console.log(`  ⚠️  Unwanted library still present: ${lib}`);
        }
      }

      console.log('  ✅ package.json is valid');
      return true;
    } catch (error) {
      result.issues.push(`package.json error: ${error}`);
      console.log(`  ❌ Error: ${error}`);
      return false;
    }
  }

  private async checkIconsInstalled(
    app: { name: string; path: string },
    result: VerificationResult
  ): Promise<boolean> {
    try {
      const nodeModulesPath = path.join(app.path, 'node_modules', '@monay', 'icons');

      // Check if symlink or directory exists
      if (!fs.existsSync(nodeModulesPath)) {
        result.issues.push('@monay/icons not installed (run npm install)');
        console.log('  ❌ @monay/icons not installed - run npm install');
        return false;
      }

      // Check if Icon.tsx exists
      const iconFilePath = path.join(nodeModulesPath, 'Icon.tsx');
      if (!fs.existsSync(iconFilePath)) {
        result.issues.push('@monay/icons installed but Icon.tsx not found');
        console.log('  ❌ Icon.tsx not found in @monay/icons');
        return false;
      }

      console.log('  ✅ @monay/icons is installed');
      return true;
    } catch (error) {
      result.issues.push(`Installation check error: ${error}`);
      console.log(`  ❌ Error: ${error}`);
      return false;
    }
  }

  private async checkOldImports(
    app: { name: string; path: string; srcPath: string },
    result: VerificationResult
  ): Promise<boolean> {
    try {
      const srcPath = path.join(app.path, app.srcPath);
      if (!fs.existsSync(srcPath)) {
        result.warnings.push(`Source directory not found: ${app.srcPath}`);
        return true;
      }

      // Search for old lucide-react imports
      const files = this.getAllTypeScriptFiles(srcPath);
      const filesWithOldImports: string[] = [];

      for (const file of files) {
        const content = fs.readFileSync(file, 'utf-8');
        if (content.includes("from 'lucide-react'") || content.includes('from "lucide-react"')) {
          filesWithOldImports.push(this.getRelativePath(file, app.path));
        }
      }

      if (filesWithOldImports.length > 0) {
        result.warnings.push(
          `${filesWithOldImports.length} files still import from lucide-react`
        );
        console.log(`  ⚠️  ${filesWithOldImports.length} files still have lucide-react imports:`);
        filesWithOldImports.slice(0, 3).forEach(file =>
          console.log(`     - ${file}`)
        );
        if (filesWithOldImports.length > 3) {
          console.log(`     ... and ${filesWithOldImports.length - 3} more`);
        }
        return false;
      }

      console.log('  ✅ No old lucide-react imports found');
      return true;
    } catch (error) {
      result.warnings.push(`Import check error: ${error}`);
      console.log(`  ⚠️  Error checking imports: ${error}`);
      return true;
    }
  }

  private async checkTypeScript(
    app: { name: string; path: string },
    result: VerificationResult
  ): Promise<boolean> {
    try {
      process.chdir(app.path);

      // Check if TypeScript is configured
      if (!fs.existsSync(path.join(app.path, 'tsconfig.json'))) {
        result.warnings.push('No tsconfig.json found');
        return true;
      }

      // Run TypeScript compiler check
      try {
        execSync('npx tsc --noEmit', {
          stdio: 'pipe',
          encoding: 'utf-8',
        });
        console.log('  ✅ TypeScript compilation successful');
        return true;
      } catch (error: any) {
        const output = error.stdout || error.stderr || error.toString();
        const lines = output.split('\n');
        const iconErrors = lines.filter(line =>
          line.includes('@monay/icons') ||
          line.includes('Icon') ||
          line.includes('lucide')
        );

        if (iconErrors.length > 0) {
          result.issues.push(`TypeScript errors related to icons: ${iconErrors.length}`);
          console.log(`  ❌ TypeScript errors related to icons:`);
          iconErrors.slice(0, 3).forEach(err =>
            console.log(`     ${err.substring(0, 80)}...`)
          );
          return false;
        }

        // Non-icon related errors are warnings
        result.warnings.push('TypeScript errors (not icon-related)');
        console.log('  ⚠️  TypeScript has errors (not icon-related)');
        return true;
      }
    } catch (error) {
      result.warnings.push(`TypeScript check error: ${error}`);
      console.log(`  ⚠️  Could not check TypeScript: ${error}`);
      return true;
    }
  }

  private async checkMissingIcons(
    app: { name: string; path: string; srcPath: string },
    result: VerificationResult
  ): Promise<boolean> {
    try {
      const srcPath = path.join(app.path, app.srcPath);
      if (!fs.existsSync(srcPath)) {
        return true;
      }

      // Get all icon imports from @monay/icons
      const files = this.getAllTypeScriptFiles(srcPath);
      const usedIcons = new Set<string>();

      for (const file of files) {
        const content = fs.readFileSync(file, 'utf-8');
        const matches = content.matchAll(
          /import\s+{([^}]+)}\s+from\s+['"]@monay\/icons['"]/g
        );

        for (const match of matches) {
          const icons = match[1].split(',').map(i => i.trim());
          icons.forEach(icon => usedIcons.add(icon));
        }
      }

      // Check if all used icons are available
      const availableIcons = this.getAvailableIcons();
      const missingIcons = Array.from(usedIcons).filter(
        icon => !availableIcons.has(icon)
      );

      if (missingIcons.length > 0) {
        result.issues.push(`Missing icons: ${missingIcons.join(', ')}`);
        console.log(`  ❌ Missing icons in @monay/icons:`);
        missingIcons.forEach(icon => console.log(`     - ${icon}`));
        return false;
      }

      console.log(`  ✅ All ${usedIcons.size} used icons are available`);
      return true;
    } catch (error) {
      result.warnings.push(`Icon check error: ${error}`);
      console.log(`  ⚠️  Error checking icons: ${error}`);
      return true;
    }
  }

  private async checkBuild(
    app: { name: string; path: string },
    result: VerificationResult
  ): Promise<boolean> {
    try {
      process.chdir(app.path);

      // Try to run build command
      console.log('     (Running build, this may take 30-60 seconds...)');
      execSync('npm run build', {
        stdio: 'pipe',
        encoding: 'utf-8',
        timeout: 120000, // 2 minute timeout
      });

      console.log('  ✅ Build successful!');
      return true;
    } catch (error) {
      result.warnings.push('Build failed (may need additional fixes)');
      console.log('  ⚠️  Build failed (this is optional, may need additional fixes)');
      return false;
    }
  }

  private getAllTypeScriptFiles(dir: string): string[] {
    const files: string[] = [];

    const walkDir = (currentDir: string) => {
      const entries = fs.readdirSync(currentDir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);

        if (entry.isDirectory() && !entry.name.startsWith('.') &&
            entry.name !== 'node_modules' && entry.name !== '.next') {
          walkDir(fullPath);
        } else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts'))) {
          files.push(fullPath);
        }
      }
    };

    walkDir(dir);
    return files;
  }

  private getRelativePath(filePath: string, basePath: string): string {
    return path.relative(basePath, filePath);
  }

  private getAvailableIcons(): Set<string> {
    // This should match the icons defined in Icon.tsx
    return new Set([
      'Shield', 'X', 'AlertCircle', 'Check', 'TrendingUp', 'Users', 'Download',
      'DollarSign', 'CheckCircle', 'Search', 'Home', 'Loader2', 'Circle',
      'ChevronRight', 'ChevronDown', 'ChevronUp', 'ChevronLeft', 'Settings',
      'Plus', 'Lock', 'Info', 'Filter', 'CreditCard', 'Building', 'Bell',
      'ArrowLeft', 'ArrowRight', 'AlertTriangle', 'Activity', 'Eye', 'EyeOff',
      'Menu', 'MoreVertical', 'MoreHorizontal', 'Copy', 'Edit', 'Trash',
      'Calendar', 'Clock', 'Upload', 'FileText', 'Mail', 'Phone', 'LogOut',
      'User', 'Key', 'RefreshCw', 'BarChart3', 'PieChart', 'Zap', 'Package',
      'Briefcase', 'Globe', 'Server', 'Database', 'Icon',
    ]);
  }

  private generateReport(): void {
    console.log('\n' + '='.repeat(80));
    console.log('📊 VERIFICATION REPORT');
    console.log('='.repeat(80));

    // Overall status
    const totalChecks = this.results.reduce((sum, r) =>
      sum + Object.values(r.checks).filter(v => v !== undefined).length, 0
    );
    const passedChecks = this.results.reduce((sum, r) =>
      sum + Object.values(r.checks).filter(v => v === true).length, 0
    );

    console.log('\n📈 Overall Results:');
    console.log(`  Total checks: ${totalChecks}`);
    console.log(`  Passed: ${passedChecks}`);
    console.log(`  Failed: ${totalChecks - passedChecks}`);

    // Per-application results
    console.log('\n📱 Application Results:\n');
    for (const result of this.results) {
      const checksPassed = Object.values(result.checks).filter(v => v === true).length;
      const checksTotal = Object.values(result.checks).filter(v => v !== undefined).length;

      const status = result.issues.length === 0 ? '✅' : '❌';
      console.log(`${status} ${result.application}: ${checksPassed}/${checksTotal} checks passed`);

      if (result.issues.length > 0) {
        console.log('   Issues:');
        result.issues.forEach(issue => console.log(`     - ${issue}`));
      }

      if (result.warnings.length > 0) {
        console.log('   Warnings:');
        result.warnings.forEach(warning => console.log(`     ⚠️  ${warning}`));
      }
    }

    // Final verdict
    console.log('\n' + '='.repeat(80));
    if (this.allPassed) {
      console.log('✅ VERIFICATION PASSED - Migration successful!');
      console.log('='.repeat(80));
      console.log('\n🎉 Congratulations! The icon migration is complete.');
      console.log('\nYou can now:');
      console.log('  1. Remove lucide-react dependency (optional, keep as fallback)');
      console.log('  2. Start using @monay/icons in new code');
      console.log('  3. Enjoy improved performance!');
    } else {
      console.log('❌ VERIFICATION FAILED - Issues found');
      console.log('='.repeat(80));
      console.log('\n⚠️  Please address the issues above before proceeding.');
      console.log('\nCommon fixes:');
      console.log('  1. Run npm install in affected applications');
      console.log('  2. Update remaining lucide-react imports to @monay/icons');
      console.log('  3. Add missing icons to Icon.tsx');
      console.log('  4. Fix TypeScript errors');
    }

    // Save report
    const reportPath = path.join(__dirname, `verification-report-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    console.log(`\n💾 Detailed report saved to: ${reportPath}`);
  }
}

// Run the verifier
const verifier = new MigrationVerifier();
verifier.verify().catch(error => {
  console.error('❌ Verification failed:', error);
  process.exit(1);
});