#!/usr/bin/env node

/**
 * STEP 3: Migrate Icons (with dry-run mode)
 * This script performs the actual migration from lucide-react to @monay/icons
 * It includes:
 * - Dry-run mode to preview changes
 * - File-by-file confirmation
 * - Detailed logging
 * - Rollback capability
 */

import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface MigrationChange {
  file: string;
  line: number;
  before: string;
  after: string;
  type: 'import' | 'usage';
}

interface MigrationResult {
  file: string;
  changes: MigrationChange[];
  success: boolean;
  error?: string;
}

class IconMigrator {
  private dryRun: boolean = true;
  private interactive: boolean = true;
  private results: MigrationResult[] = [];
  private rl?: readline.Interface;
  private changesLog: string[] = [];

  constructor(options: { dryRun?: boolean; interactive?: boolean } = {}) {
    this.dryRun = options.dryRun !== false;
    this.interactive = options.interactive !== false;

    if (this.interactive) {
      this.rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });
    }
  }

  async migrate(): Promise<void> {
    console.log('🚀 Starting Icon Migration...');
    console.log(`📋 Mode: ${this.dryRun ? 'DRY RUN (no changes will be made)' : 'LIVE (files will be modified)'}`);
    console.log(`🤝 Interactive: ${this.interactive ? 'YES' : 'NO'}\n`);

    // Check for analysis report
    const reportPath = path.join(__dirname, 'icon-analysis-report.json');
    if (!fs.existsSync(reportPath)) {
      console.error('❌ Error: Run 1-analyze-icons.ts first to generate analysis report');
      process.exit(1);
    }

    // Check for backup (if not dry run)
    if (!this.dryRun) {
      const backupsDir = path.join(__dirname, 'backups');
      if (!fs.existsSync(backupsDir) || fs.readdirSync(backupsDir).length === 0) {
        console.error('❌ Error: No backups found. Run 2-backup-files.ts first');
        process.exit(1);
      }
    }

    const report = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));

    // Group files by application
    const filesByApp = new Map<string, Set<string>>();
    for (const usage of report.iconUsages) {
      const app = this.getAppName(usage.file);
      if (!filesByApp.has(app)) {
        filesByApp.set(app, new Set());
      }
      filesByApp.get(app)!.add(usage.file);
    }

    // Process each application
    for (const [app, files] of filesByApp) {
      console.log(`\n${'='.repeat(80)}`);
      console.log(`📱 Processing: ${app}`);
      console.log(`${'='.repeat(80)}`);

      if (this.interactive) {
        const proceed = await this.askUser(
          `\nProcess ${files.size} files in ${app}? (y/n/skip): `
        );
        if (proceed === 'skip' || proceed === 's') {
          console.log('  ⏭️  Skipping application');
          continue;
        } else if (proceed !== 'y' && proceed !== 'yes') {
          console.log('  ❌ Cancelled by user');
          break;
        }
      }

      // Process each file
      let fileCount = 0;
      for (const file of files) {
        fileCount++;
        console.log(`\n📄 File ${fileCount}/${files.size}: ${this.getRelativePath(file)}`);

        const changes = await this.analyzeFile(file);

        if (changes.length === 0) {
          console.log('  ℹ️  No changes needed');
          continue;
        }

        // Show changes
        console.log(`  📝 ${changes.length} changes found:`);
        for (const change of changes.slice(0, 3)) {
          console.log(`    Line ${change.line}: ${change.type}`);
          console.log(`      Before: ${change.before.substring(0, 60)}...`);
          console.log(`      After:  ${change.after.substring(0, 60)}...`);
        }
        if (changes.length > 3) {
          console.log(`    ... and ${changes.length - 3} more changes`);
        }

        // Confirm changes (if interactive)
        if (this.interactive && !this.dryRun) {
          const action = await this.askUser(
            '  Apply changes? (y/n/all/skip): '
          );

          if (action === 'skip' || action === 's') {
            console.log('  ⏭️  Skipped');
            continue;
          } else if (action === 'n' || action === 'no') {
            console.log('  ❌ Cancelled');
            continue;
          } else if (action === 'all' || action === 'a') {
            this.interactive = false;
            console.log('  🤖 Applying all remaining changes automatically...');
          }
        }

        // Apply changes
        if (!this.dryRun) {
          const result = await this.applyChanges(file, changes);
          this.results.push(result);

          if (result.success) {
            console.log('  ✅ File updated successfully');
            this.changesLog.push(`✅ ${file}: ${changes.length} changes applied`);
          } else {
            console.log(`  ❌ Failed: ${result.error}`);
            this.changesLog.push(`❌ ${file}: ${result.error}`);
          }
        } else {
          console.log('  🔍 DRY RUN - No changes made');
          this.changesLog.push(`🔍 ${file}: ${changes.length} changes (dry run)`);
        }
      }
    }

    // Generate final report
    this.generateReport();

    // Close readline interface
    if (this.rl) {
      this.rl.close();
    }
  }

  private async analyzeFile(filePath: string): Promise<MigrationChange[]> {
    const changes: MigrationChange[] = [];
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNumber = i + 1;

      // Check for lucide-react imports
      if (line.includes('from \'lucide-react\'') || line.includes('from "lucide-react"')) {
        // Named imports: import { Shield, User } from 'lucide-react'
        const namedImportMatch = line.match(
          /import\s+{([^}]+)}\s+from\s+['"]lucide-react['"]/
        );

        if (namedImportMatch) {
          const newLine = line.replace(
            /from\s+['"]lucide-react['"]/,
            'from \'@monay/icons\''
          );

          changes.push({
            file: filePath,
            line: lineNumber,
            before: line,
            after: newLine,
            type: 'import',
          });
        }

        // Namespace imports: import * as Icons from 'lucide-react'
        const namespaceMatch = line.match(
          /import\s+\*\s+as\s+(\w+)\s+from\s+['"]lucide-react['"]/
        );

        if (namespaceMatch) {
          const namespace = namespaceMatch[1];
          // This needs special handling - convert to named imports
          console.log(`  ⚠️  Line ${lineNumber}: Namespace import needs manual review`);

          // For now, just change the import path
          const newLine = line.replace(
            /from\s+['"]lucide-react['"]/,
            'from \'@monay/icons\''
          );

          changes.push({
            file: filePath,
            line: lineNumber,
            before: line,
            after: newLine,
            type: 'import',
          });
        }
      }

      // Check for require statements (CommonJS)
      if (line.includes('require(\'lucide-react\')') || line.includes('require("lucide-react")')) {
        console.log(`  ⚠️  Line ${lineNumber}: CommonJS require() found - needs conversion to ES modules`);
      }
    }

    return changes;
  }

  private async applyChanges(filePath: string, changes: MigrationChange[]): Promise<MigrationResult> {
    try {
      let content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');

      // Apply changes in reverse order to maintain line numbers
      const sortedChanges = changes.sort((a, b) => b.line - a.line);

      for (const change of sortedChanges) {
        lines[change.line - 1] = change.after;
      }

      const newContent = lines.join('\n');

      // Write the file
      fs.writeFileSync(filePath, newContent, 'utf-8');

      return {
        file: filePath,
        changes: changes,
        success: true,
      };
    } catch (error) {
      return {
        file: filePath,
        changes: changes,
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  private getAppName(filePath: string): string {
    if (filePath.includes('monay-admin')) return 'monay-admin';
    if (filePath.includes('monay-enterprise-wallet')) return 'monay-enterprise-wallet';
    if (filePath.includes('monay-cross-platform')) return 'monay-consumer-web';
    return 'unknown';
  }

  private getRelativePath(filePath: string): string {
    const monayRoot = path.resolve(__dirname, '../../../../');
    return path.relative(monayRoot, filePath);
  }

  private askUser(question: string): Promise<string> {
    return new Promise(resolve => {
      if (this.rl) {
        this.rl.question(question, answer => {
          resolve(answer.toLowerCase());
        });
      } else {
        resolve('y');
      }
    });
  }

  private generateReport(): void {
    console.log('\n' + '='.repeat(80));
    console.log('📊 MIGRATION REPORT');
    console.log('='.repeat(80));

    if (this.dryRun) {
      console.log('\n🔍 DRY RUN COMPLETE - No files were modified');
    } else {
      console.log('\n✅ MIGRATION COMPLETE');
    }

    // Summary
    const totalFiles = new Set(this.changesLog.map(l => l.split(':')[0])).size;
    const successCount = this.changesLog.filter(l => l.startsWith('✅')).length;
    const failCount = this.changesLog.filter(l => l.startsWith('❌')).length;

    console.log('\n📈 Summary:');
    console.log(`  Files processed: ${totalFiles}`);
    if (!this.dryRun) {
      console.log(`  Files updated: ${successCount}`);
      console.log(`  Files failed: ${failCount}`);
    }

    // Save detailed log
    const logPath = path.join(__dirname, `migration-log-${Date.now()}.txt`);
    fs.writeFileSync(logPath, this.changesLog.join('\n'), 'utf-8');
    console.log(`\n💾 Detailed log saved to: ${logPath}`);

    // Next steps
    console.log('\n📝 Next Steps:');
    if (this.dryRun) {
      console.log('  1. Review the changes above');
      console.log('  2. Run with --live flag to apply changes');
      console.log('  3. Run 4-update-package-json.ts to update dependencies');
    } else {
      console.log('  1. Run 4-update-package-json.ts to update dependencies');
      console.log('  2. Run npm install in each application');
      console.log('  3. Run 5-verify-migration.ts to verify the migration');
      console.log('  4. Run type checks and build to ensure everything works');
    }
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const dryRun = !args.includes('--live');
const interactive = !args.includes('--no-interaction');

if (!dryRun) {
  console.log('⚠️  WARNING: This will modify files!');
  console.log('Make sure you have run 2-backup-files.ts first.\n');
}

// Run the migrator
const migrator = new IconMigrator({ dryRun, interactive });
migrator.migrate().catch(error => {
  console.error('❌ Migration failed:', error);
  process.exit(1);
});