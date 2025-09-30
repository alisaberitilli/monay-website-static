#!/usr/bin/env node

/**
 * STEP 4: Update Package.json Files
 * This script updates package.json files to:
 * - Add @monay/icons dependency
 * - Remove unused icon libraries
 * - Standardize lucide-react versions
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface PackageUpdate {
  path: string;
  name: string;
  changes: string[];
  success: boolean;
  error?: string;
}

class PackageUpdater {
  private updates: PackageUpdate[] = [];
  private dryRun: boolean;

  constructor(dryRun: boolean = true) {
    this.dryRun = dryRun;
  }

  async updatePackages(): Promise<void> {
    console.log('📦 Starting Package.json Updates...');
    console.log(`Mode: ${this.dryRun ? 'DRY RUN' : 'LIVE'}\n`);

    const applications = [
      {
        name: 'monay-admin',
        packagePath: path.resolve(__dirname, '../../../../monay-admin/package.json'),
        iconPath: '../shared/icons',
        removeLibraries: [],
      },
      {
        name: 'monay-enterprise-wallet',
        packagePath: path.resolve(__dirname, '../../../../monay-caas/monay-enterprise-wallet/package.json'),
        iconPath: '../../shared/icons',
        removeLibraries: ['react-icons'],
      },
      {
        name: 'monay-consumer-web',
        packagePath: path.resolve(__dirname, '../../../../monay-cross-platform/web/package.json'),
        iconPath: '../../shared/icons',
        removeLibraries: ['@radix-ui/react-icons'],
      },
    ];

    for (const app of applications) {
      await this.updateApplication(app);
    }

    this.generateReport();
  }

  private async updateApplication(app: {
    name: string;
    packagePath: string;
    iconPath: string;
    removeLibraries: string[];
  }): Promise<void> {
    console.log(`\n📱 Processing ${app.name}...`);

    const update: PackageUpdate = {
      path: app.packagePath,
      name: app.name,
      changes: [],
      success: false,
    };

    try {
      if (!fs.existsSync(app.packagePath)) {
        throw new Error(`Package.json not found at ${app.packagePath}`);
      }

      // Read current package.json
      const packageContent = fs.readFileSync(app.packagePath, 'utf-8');
      const packageJson = JSON.parse(packageContent);

      // Backup original
      const backupPath = app.packagePath + '.backup-' + Date.now();
      if (!this.dryRun) {
        fs.writeFileSync(backupPath, packageContent);
        console.log(`  ✅ Backup created: ${path.basename(backupPath)}`);
      }

      // 1. Add @monay/icons dependency
      if (!packageJson.dependencies) {
        packageJson.dependencies = {};
      }

      const currentMonayIcons = packageJson.dependencies['@monay/icons'];
      if (currentMonayIcons !== `file:${app.iconPath}`) {
        packageJson.dependencies['@monay/icons'] = `file:${app.iconPath}`;
        update.changes.push(`Added @monay/icons → file:${app.iconPath}`);
        console.log(`  ✅ Added @monay/icons dependency`);
      } else {
        console.log(`  ℹ️  @monay/icons already configured`);
      }

      // 2. Standardize lucide-react version (optional - keep existing for now)
      const lucideVersion = packageJson.dependencies?.['lucide-react'];
      if (lucideVersion) {
        console.log(`  ℹ️  Current lucide-react: ${lucideVersion}`);
        // Keep as fallback during migration
        update.changes.push(`Keeping lucide-react@${lucideVersion} as fallback`);
      }

      // 3. Remove unused icon libraries
      for (const lib of app.removeLibraries) {
        if (packageJson.dependencies?.[lib]) {
          delete packageJson.dependencies[lib];
          update.changes.push(`Removed ${lib} from dependencies`);
          console.log(`  ✅ Removed unused library: ${lib}`);
        }
        if (packageJson.devDependencies?.[lib]) {
          delete packageJson.devDependencies[lib];
          update.changes.push(`Removed ${lib} from devDependencies`);
          console.log(`  ✅ Removed unused dev library: ${lib}`);
        }
      }

      // 4. Add TypeScript path mapping (if tsconfig exists)
      const tsconfigPath = path.join(path.dirname(app.packagePath), 'tsconfig.json');
      if (fs.existsSync(tsconfigPath)) {
        await this.updateTsConfig(tsconfigPath, app.iconPath);
        update.changes.push('Updated tsconfig.json paths');
      }

      // 5. Save updated package.json
      if (!this.dryRun && update.changes.length > 0) {
        const updatedContent = JSON.stringify(packageJson, null, 2);
        fs.writeFileSync(app.packagePath, updatedContent);
        console.log(`  ✅ Package.json updated successfully`);
      }

      update.success = true;
    } catch (error) {
      update.success = false;
      update.error = error instanceof Error ? error.message : String(error);
      console.error(`  ❌ Error: ${update.error}`);
    }

    this.updates.push(update);
  }

  private async updateTsConfig(tsconfigPath: string, iconPath: string): Promise<void> {
    try {
      const content = fs.readFileSync(tsconfigPath, 'utf-8');
      const tsconfig = JSON.parse(content);

      if (!tsconfig.compilerOptions) {
        tsconfig.compilerOptions = {};
      }

      if (!tsconfig.compilerOptions.paths) {
        tsconfig.compilerOptions.paths = {};
      }

      // Add path mapping for @monay/icons
      const currentMapping = tsconfig.compilerOptions.paths['@monay/icons'];
      const newMapping = [`${iconPath}/*`];

      if (JSON.stringify(currentMapping) !== JSON.stringify(newMapping)) {
        tsconfig.compilerOptions.paths['@monay/icons'] = [iconPath];
        tsconfig.compilerOptions.paths['@monay/icons/*'] = newMapping;

        if (!this.dryRun) {
          const updatedContent = JSON.stringify(tsconfig, null, 2);
          fs.writeFileSync(tsconfigPath, updatedContent);
        }
        console.log(`  ✅ Updated tsconfig.json paths`);
      }
    } catch (error) {
      console.log(`  ⚠️  Could not update tsconfig.json: ${error}`);
    }
  }

  private generateReport(): void {
    console.log('\n' + '='.repeat(80));
    console.log('📊 PACKAGE UPDATE REPORT');
    console.log('='.repeat(80));

    if (this.dryRun) {
      console.log('\n🔍 DRY RUN COMPLETE - No files were modified');
    } else {
      console.log('\n✅ PACKAGE UPDATES COMPLETE');
    }

    // Summary
    const successCount = this.updates.filter(u => u.success).length;
    const failCount = this.updates.filter(u => !u.success).length;

    console.log('\n📈 Summary:');
    console.log(`  Applications processed: ${this.updates.length}`);
    console.log(`  Successful updates: ${successCount}`);
    console.log(`  Failed updates: ${failCount}`);

    // Changes per application
    console.log('\n📝 Changes by Application:');
    for (const update of this.updates) {
      console.log(`\n  ${update.name}:`);
      if (update.success) {
        if (update.changes.length > 0) {
          update.changes.forEach(change => console.log(`    - ${change}`));
        } else {
          console.log('    - No changes needed');
        }
      } else {
        console.log(`    ❌ Error: ${update.error}`);
      }
    }

    // Next steps
    console.log('\n📝 Next Steps:');
    if (this.dryRun) {
      console.log('  1. Review the changes above');
      console.log('  2. Run with --live flag to apply changes');
      console.log('  3. Run npm install in each application');
    } else {
      console.log('  1. Run npm install in each application:');
      console.log('     cd monay-admin && npm install');
      console.log('     cd monay-caas/monay-enterprise-wallet && npm install');
      console.log('     cd monay-cross-platform/web && npm install');
      console.log('  2. Run 5-verify-migration.ts to verify the setup');
      console.log('  3. Test the applications');
    }

    // Create install script
    if (!this.dryRun) {
      this.createInstallScript();
    }
  }

  private createInstallScript(): void {
    const scriptPath = path.join(__dirname, 'install-dependencies.sh');
    const script = `#!/bin/bash

# Install Script for Icon Migration
echo "📦 Installing dependencies for all applications..."
echo ""

# Colors for output
GREEN='\\033[0;32m'
RED='\\033[0;31m'
NC='\\033[0m' # No Color

# Function to install dependencies
install_app() {
  local app_name="$1"
  local app_path="$2"

  echo "📱 Installing $app_name..."
  cd "$app_path"

  if npm install; then
    echo -e "\${GREEN}✅ $app_name installed successfully\${NC}"
  else
    echo -e "\${RED}❌ $app_name installation failed\${NC}"
    exit 1
  fi

  echo ""
}

# Get the root directory
SCRIPT_DIR="$( cd "$( dirname "\${BASH_SOURCE[0]}" )" && pwd )"
ROOT_DIR="$SCRIPT_DIR/../../../.."

# Install each application
install_app "monay-admin" "$ROOT_DIR/monay-admin"
install_app "monay-enterprise-wallet" "$ROOT_DIR/monay-caas/monay-enterprise-wallet"
install_app "monay-consumer-web" "$ROOT_DIR/monay-cross-platform/web"

echo "="
echo "✅ All dependencies installed successfully!"
echo "="
echo ""
echo "Next: Run 5-verify-migration.ts to verify the icon setup"
`;

    fs.writeFileSync(scriptPath, script);
    fs.chmodSync(scriptPath, '755');
    console.log(`\n💾 Install script created: ${scriptPath}`);
    console.log('   Run: bash install-dependencies.sh');
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const dryRun = !args.includes('--live');

if (!dryRun) {
  console.log('⚠️  WARNING: This will modify package.json files!');
  console.log('Make sure you have run 2-backup-files.ts first.\n');
}

// Run the updater
const updater = new PackageUpdater(dryRun);
updater.updatePackages().catch(error => {
  console.error('❌ Update failed:', error);
  process.exit(1);
});