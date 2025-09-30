#!/usr/bin/env node

/**
 * STEP 1: Analyze Icon Usage
 * This script analyzes all TypeScript/TSX files to identify:
 * - Which icons are actually used
 * - Where they are used
 * - How they are imported
 * - Any potential issues
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface IconUsage {
  file: string;
  line: number;
  iconName: string;
  importType: 'named' | 'namespace' | 'default';
  context: string;
}

interface AnalysisReport {
  totalFiles: number;
  filesWithIcons: number;
  uniqueIcons: Set<string>;
  iconUsages: IconUsage[];
  potentialIssues: string[];
  lucideReactVersions: Map<string, string>;
}

// Applications to analyze
const APPLICATIONS = [
  {
    name: 'monay-admin',
    path: path.resolve(__dirname, '../../../../monay-admin/src'),
    packageJson: path.resolve(__dirname, '../../../../monay-admin/package.json'),
  },
  {
    name: 'monay-enterprise-wallet',
    path: path.resolve(__dirname, '../../../../monay-caas/monay-enterprise-wallet/src'),
    packageJson: path.resolve(__dirname, '../../../../monay-caas/monay-enterprise-wallet/package.json'),
  },
  {
    name: 'monay-consumer-web',
    path: path.resolve(__dirname, '../../../../monay-cross-platform/web'),
    packageJson: path.resolve(__dirname, '../../../../monay-cross-platform/web/package.json'),
  },
];

// Icons available in our local library
const AVAILABLE_ICONS = new Set([
  'Shield', 'X', 'AlertCircle', 'Check', 'TrendingUp', 'Users', 'Download',
  'DollarSign', 'CheckCircle', 'Search', 'Home', 'Loader2', 'Circle',
  'ChevronRight', 'ChevronDown', 'ChevronUp', 'ChevronLeft', 'Settings',
  'Plus', 'Lock', 'Info', 'Filter', 'CreditCard', 'Building', 'Bell',
  'ArrowLeft', 'ArrowRight', 'AlertTriangle', 'Activity', 'Eye', 'EyeOff',
  'Menu', 'MoreVertical', 'MoreHorizontal', 'Copy', 'Edit', 'Trash',
  'Calendar', 'Clock', 'Upload', 'FileText', 'Mail', 'Phone', 'LogOut',
  'User', 'Key', 'RefreshCw', 'BarChart3', 'PieChart', 'Zap', 'Package',
  'Briefcase', 'Globe', 'Server', 'Database',
]);

class IconAnalyzer {
  private report: AnalysisReport = {
    totalFiles: 0,
    filesWithIcons: 0,
    uniqueIcons: new Set(),
    iconUsages: [],
    potentialIssues: [],
    lucideReactVersions: new Map(),
  };

  async analyzeAll(): Promise<void> {
    console.log('🔍 Starting Icon Usage Analysis...\n');

    for (const app of APPLICATIONS) {
      console.log(`\n📂 Analyzing ${app.name}...`);

      // Check lucide-react version
      if (fs.existsSync(app.packageJson)) {
        const pkg = JSON.parse(fs.readFileSync(app.packageJson, 'utf-8'));
        const version = pkg.dependencies?.['lucide-react'] || pkg.devDependencies?.['lucide-react'];
        if (version) {
          this.report.lucideReactVersions.set(app.name, version);
          console.log(`  lucide-react version: ${version}`);
        }
      }

      // Analyze files
      await this.analyzeDirectory(app.path, app.name);
    }

    this.generateReport();
  }

  private async analyzeDirectory(dirPath: string, appName: string): Promise<void> {
    if (!fs.existsSync(dirPath)) {
      console.log(`  ⚠️  Directory not found: ${dirPath}`);
      return;
    }

    const files = this.getTypeScriptFiles(dirPath);

    for (const file of files) {
      this.report.totalFiles++;
      const content = fs.readFileSync(file, 'utf-8');

      // Check for lucide-react imports
      const importMatches = content.matchAll(
        /import\s+(?:(\*\s+as\s+\w+)|(?:{([^}]+)})|(\w+))\s+from\s+['"]lucide-react['"]/g
      );

      let fileHasIcons = false;
      for (const match of importMatches) {
        fileHasIcons = true;
        const [fullMatch, namespaceImport, namedImports, defaultImport] = match;
        const lineNumber = this.getLineNumber(content, match.index!);

        if (namespaceImport) {
          // Handle: import * as Icons from 'lucide-react'
          this.report.potentialIssues.push(
            `${file}:${lineNumber} - Namespace import detected (needs special handling)`
          );
          this.report.iconUsages.push({
            file,
            line: lineNumber,
            iconName: '*',
            importType: 'namespace',
            context: fullMatch,
          });
        } else if (namedImports) {
          // Handle: import { Shield, User } from 'lucide-react'
          const icons = namedImports.split(',').map(i => i.trim());
          for (const icon of icons) {
            const iconName = icon.split(' as ')[0].trim();
            this.report.uniqueIcons.add(iconName);

            // Check if icon is available in our library
            if (!AVAILABLE_ICONS.has(iconName)) {
              this.report.potentialIssues.push(
                `${file}:${lineNumber} - Icon "${iconName}" not in local library`
              );
            }

            this.report.iconUsages.push({
              file,
              line: lineNumber,
              iconName,
              importType: 'named',
              context: fullMatch,
            });
          }
        } else if (defaultImport) {
          // Handle: import LucideIcons from 'lucide-react'
          this.report.potentialIssues.push(
            `${file}:${lineNumber} - Default import detected (unusual pattern)`
          );
        }
      }

      if (fileHasIcons) {
        this.report.filesWithIcons++;
      }

      // Check for other icon libraries
      this.checkOtherIconLibraries(file, content);
    }
  }

  private getTypeScriptFiles(dirPath: string): string[] {
    const files: string[] = [];

    const walkDir = (dir: string) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
          walkDir(fullPath);
        } else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts'))) {
          files.push(fullPath);
        }
      }
    };

    walkDir(dirPath);
    return files;
  }

  private getLineNumber(content: string, index: number): number {
    return content.substring(0, index).split('\n').length;
  }

  private checkOtherIconLibraries(file: string, content: string): void {
    const otherLibraries = [
      'react-icons',
      '@radix-ui/react-icons',
      '@heroicons/react',
      'feather-icons',
      '@fortawesome/react-fontawesome',
    ];

    for (const lib of otherLibraries) {
      if (content.includes(`from '${lib}'`) || content.includes(`from "${lib}"`)) {
        this.report.potentialIssues.push(
          `${file} - Uses additional icon library: ${lib}`
        );
      }
    }
  }

  private generateReport(): void {
    console.log('\n' + '='.repeat(80));
    console.log('📊 ANALYSIS REPORT');
    console.log('='.repeat(80));

    console.log('\n📈 Statistics:');
    console.log(`  Total files analyzed: ${this.report.totalFiles}`);
    console.log(`  Files with icons: ${this.report.filesWithIcons}`);
    console.log(`  Unique icons used: ${this.report.uniqueIcons.size}`);
    console.log(`  Total icon imports: ${this.report.iconUsages.length}`);

    console.log('\n📦 Lucide-React Versions:');
    for (const [app, version] of this.report.lucideReactVersions) {
      console.log(`  ${app}: ${version}`);
    }

    console.log('\n🎯 Icons Used (${this.report.uniqueIcons.size} total):');
    const sortedIcons = Array.from(this.report.uniqueIcons).sort();
    for (let i = 0; i < sortedIcons.length; i += 5) {
      const batch = sortedIcons.slice(i, i + 5);
      console.log(`  ${batch.join(', ')}`);
    }

    // Check for missing icons
    const missingIcons = Array.from(this.report.uniqueIcons).filter(
      icon => !AVAILABLE_ICONS.has(icon)
    );

    if (missingIcons.length > 0) {
      console.log('\n⚠️  Icons NOT in Local Library:');
      missingIcons.forEach(icon => console.log(`  - ${icon}`));
    } else {
      console.log('\n✅ All used icons are available in local library!');
    }

    // Show potential issues
    if (this.report.potentialIssues.length > 0) {
      console.log('\n⚠️  Potential Issues to Review:');
      this.report.potentialIssues.slice(0, 10).forEach(issue =>
        console.log(`  - ${issue}`)
      );
      if (this.report.potentialIssues.length > 10) {
        console.log(`  ... and ${this.report.potentialIssues.length - 10} more`);
      }
    }

    // Icon usage by application
    console.log('\n📱 Icon Usage by Application:');
    const appUsage = new Map<string, number>();
    for (const usage of this.report.iconUsages) {
      const app = APPLICATIONS.find(a => usage.file.includes(a.name))?.name || 'unknown';
      appUsage.set(app, (appUsage.get(app) || 0) + 1);
    }
    for (const [app, count] of appUsage) {
      console.log(`  ${app}: ${count} imports`);
    }

    // Save detailed report
    const reportPath = path.join(__dirname, 'icon-analysis-report.json');
    fs.writeFileSync(
      reportPath,
      JSON.stringify(
        {
          ...this.report,
          uniqueIcons: Array.from(this.report.uniqueIcons),
          timestamp: new Date().toISOString(),
        },
        null,
        2
      )
    );

    console.log(`\n💾 Detailed report saved to: ${reportPath}`);
    console.log('\n✅ Analysis complete!');

    // Exit code based on whether all icons are available
    if (missingIcons.length > 0) {
      console.log('\n⚠️  WARNING: Some icons are missing from local library.');
      console.log('Please add these icons to Icon.tsx before proceeding with migration.');
      process.exit(1);
    }
  }
}

// Run the analyzer
const analyzer = new IconAnalyzer();
analyzer.analyzeAll().catch(error => {
  console.error('❌ Analysis failed:', error);
  process.exit(1);
});