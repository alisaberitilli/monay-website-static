#!/usr/bin/env node

/**
 * STEP 2: Backup Files
 * This script creates backups of all files that will be modified
 * Backups are stored with timestamps and can be easily restored
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface BackupManifest {
  timestamp: string;
  backupId: string;
  files: Array<{
    original: string;
    backup: string;
    hash: string;
  }>;
  applications: string[];
}

class BackupManager {
  private backupDir: string;
  private backupId: string;
  private manifest: BackupManifest;

  constructor() {
    this.backupId = `backup-${Date.now()}`;
    this.backupDir = path.join(__dirname, 'backups', this.backupId);
    this.manifest = {
      timestamp: new Date().toISOString(),
      backupId: this.backupId,
      files: [],
      applications: [],
    };
  }

  async createBackups(): Promise<void> {
    console.log('🔐 Starting Backup Process...');
    console.log(`📁 Backup ID: ${this.backupId}\n`);

    // Create backup directory
    fs.mkdirSync(this.backupDir, { recursive: true });

    // Read analysis report to know which files to backup
    const reportPath = path.join(__dirname, 'icon-analysis-report.json');
    if (!fs.existsSync(reportPath)) {
      console.error('❌ Error: Run 1-analyze-icons.ts first to generate analysis report');
      process.exit(1);
    }

    const report = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));
    const filesToBackup = new Set<string>();

    // Collect unique files that need backing up
    for (const usage of report.iconUsages) {
      filesToBackup.add(usage.file);
    }

    console.log(`📋 Files to backup: ${filesToBackup.size}\n`);

    // Backup each file
    let backedUp = 0;
    for (const file of filesToBackup) {
      if (await this.backupFile(file)) {
        backedUp++;
        if (backedUp % 10 === 0) {
          console.log(`  Progress: ${backedUp}/${filesToBackup.size} files backed up...`);
        }
      }
    }

    // Also backup package.json files
    console.log('\n📦 Backing up package.json files...');
    const packageFiles = [
      path.resolve(__dirname, '../../../../monay-admin/package.json'),
      path.resolve(__dirname, '../../../../monay-caas/monay-enterprise-wallet/package.json'),
      path.resolve(__dirname, '../../../../monay-cross-platform/web/package.json'),
    ];

    for (const pkgFile of packageFiles) {
      if (fs.existsSync(pkgFile)) {
        await this.backupFile(pkgFile);
      }
    }

    // Save manifest
    this.saveManifest();

    // Create restore script
    this.createRestoreScript();

    console.log('\n' + '='.repeat(80));
    console.log('✅ BACKUP COMPLETE!');
    console.log('='.repeat(80));
    console.log(`\n📊 Backup Summary:`);
    console.log(`  Backup ID: ${this.backupId}`);
    console.log(`  Files backed up: ${this.manifest.files.length}`);
    console.log(`  Backup location: ${this.backupDir}`);
    console.log(`  Manifest: ${path.join(this.backupDir, 'manifest.json')}`);
    console.log(`  Restore script: ${path.join(this.backupDir, 'restore.sh')}`);
    console.log('\n💡 To restore files, run:');
    console.log(`  bash ${path.join(this.backupDir, 'restore.sh')}`);
  }

  private async backupFile(filePath: string): Promise<boolean> {
    try {
      if (!fs.existsSync(filePath)) {
        console.log(`  ⚠️  File not found: ${filePath}`);
        return false;
      }

      // Calculate relative path for organized backup structure
      const relativePath = this.getRelativePath(filePath);
      const backupPath = path.join(this.backupDir, relativePath);

      // Create backup directory structure
      fs.mkdirSync(path.dirname(backupPath), { recursive: true });

      // Copy file
      fs.copyFileSync(filePath, backupPath);

      // Calculate file hash for integrity check
      const hash = this.calculateFileHash(filePath);

      // Add to manifest
      this.manifest.files.push({
        original: filePath,
        backup: backupPath,
        hash: hash,
      });

      return true;
    } catch (error) {
      console.error(`  ❌ Failed to backup ${filePath}:`, error);
      return false;
    }
  }

  private getRelativePath(filePath: string): string {
    const monayRoot = path.resolve(__dirname, '../../../../');
    return path.relative(monayRoot, filePath);
  }

  private calculateFileHash(filePath: string): string {
    try {
      const hash = execSync(`shasum -a 256 "${filePath}"`, { encoding: 'utf-8' });
      return hash.split(' ')[0];
    } catch {
      // Fallback if shasum is not available
      const content = fs.readFileSync(filePath, 'utf-8');
      return Buffer.from(content).toString('base64').substring(0, 16);
    }
  }

  private saveManifest(): void {
    const manifestPath = path.join(this.backupDir, 'manifest.json');
    fs.writeFileSync(
      manifestPath,
      JSON.stringify(this.manifest, null, 2)
    );
  }

  private createRestoreScript(): void {
    const scriptPath = path.join(this.backupDir, 'restore.sh');
    const script = `#!/bin/bash

# Restore Script for Backup ${this.backupId}
# Created: ${this.manifest.timestamp}

echo "🔄 Starting restore from backup ${this.backupId}..."
echo ""

BACKUP_DIR="${this.backupDir}"
RESTORED=0
FAILED=0

# Function to restore a file
restore_file() {
  local backup_file="$1"
  local original_file="$2"

  if [ -f "$backup_file" ]; then
    cp "$backup_file" "$original_file"
    if [ $? -eq 0 ]; then
      echo "  ✅ Restored: $original_file"
      ((RESTORED++))
    else
      echo "  ❌ Failed: $original_file"
      ((FAILED++))
    fi
  else
    echo "  ⚠️  Backup not found: $backup_file"
    ((FAILED++))
  fi
}

# Restore each file
${this.manifest.files.map(file =>
  `restore_file "${file.backup}" "${file.original}"`
).join('\n')}

echo ""
echo "="
echo "🏁 Restore Complete!"
echo "="
echo "  Files restored: $RESTORED"
echo "  Files failed: $FAILED"
echo ""

if [ $FAILED -eq 0 ]; then
  echo "✅ All files restored successfully!"
else
  echo "⚠️  Some files failed to restore. Please check the output above."
fi
`;

    fs.writeFileSync(scriptPath, script);
    fs.chmodSync(scriptPath, '755');
  }

  async verifyBackups(): Promise<boolean> {
    console.log('\n🔍 Verifying backups...');

    let allGood = true;
    for (const file of this.manifest.files) {
      if (!fs.existsSync(file.backup)) {
        console.log(`  ❌ Missing backup: ${file.backup}`);
        allGood = false;
      } else {
        const backupSize = fs.statSync(file.backup).size;
        const originalSize = fs.existsSync(file.original)
          ? fs.statSync(file.original).size
          : 0;

        if (backupSize !== originalSize && originalSize > 0) {
          console.log(`  ⚠️  Size mismatch: ${file.original}`);
          allGood = false;
        }
      }
    }

    if (allGood) {
      console.log('  ✅ All backups verified successfully!');
    }

    return allGood;
  }
}

// Run the backup manager
const manager = new BackupManager();
manager.createBackups()
  .then(() => manager.verifyBackups())
  .then(verified => {
    if (!verified) {
      console.log('\n⚠️  Some backups could not be verified. Please review before proceeding.');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('❌ Backup failed:', error);
    process.exit(1);
  });