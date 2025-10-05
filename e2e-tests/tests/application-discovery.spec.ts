/**
 * Comprehensive Application Discovery Test Suite
 *
 * Purpose: Systematically discover and map ALL features across:
 * - Admin Portal (3002)
 * - Enterprise Wallet (3007)
 * - Consumer Wallet (3003)
 *
 * This test will:
 * 1. Test every user journey step
 * 2. Map what exists vs what's missing
 * 3. Generate implementation checklist
 * 4. Provide fix recommendations
 */

import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// Test configuration
const APPS = {
  ADMIN: {
    name: 'Admin Portal',
    url: 'http://localhost:3002',
    credentials: {
      email: 'admin@monay.com',
      password: 'SecureAdmin123',
      mpin: '123456'
    }
  },
  ENTERPRISE: {
    name: 'Enterprise Wallet',
    url: 'http://localhost:3007',
    credentials: {
      email: 'enterprise@monay.com',
      password: 'Enterprise@123',
      mpin: '654321'
    }
  },
  CONSUMER: {
    name: 'Consumer Wallet',
    url: 'http://localhost:3003',
    credentials: {
      email: 'consumer@test.com',
      phone: '555-123-4567',
      password: 'demo123',
      mpin: '1234'
    }
  }
};

// Feature inventory to test
const FEATURE_INVENTORY = {
  AUTH_FLOW: [
    { id: 'signup', name: 'Sign Up Page', selectors: ['a[href*="signup"]', 'button:has-text("Sign Up")', 'text=Create Account'] },
    { id: 'signin', name: 'Sign In Page', selectors: ['a[href*="login"]', 'button:has-text("Sign In")', 'text=Login'] },
    { id: 'register', name: 'Registration Form', selectors: ['form', 'input[name="email"]', 'input[name="password"]'] },
    { id: 'verify', name: 'Email/Phone Verification', selectors: ['input[name="otp"]', 'text=Verify', 'text=Verification'] },
    { id: 'onboard', name: 'Onboarding Flow', selectors: ['text=Welcome', 'text=Get Started', 'button:has-text("Continue")'] },
    { id: 'mpin', name: 'MPIN Setup', selectors: ['input[name="mpin"]', 'text=Set PIN', 'text=Create PIN'] },
    { id: 'kyc', name: 'KYC Verification', selectors: ['text=Identity', 'text=Verification', 'button:has-text("Verify Identity")'] },
    { id: 'logout', name: 'Logout', selectors: ['button:has-text("Logout")', 'a[href*="logout"]', 'text=Sign Out'] }
  ],

  NAVIGATION: [
    { id: 'dashboard', name: 'Dashboard', selectors: ['a[href*="dashboard"]', 'text=Dashboard', 'nav :text("Dashboard")'] },
    { id: 'profile', name: 'Profile', selectors: ['a[href*="profile"]', 'text=Profile', 'nav :text("Profile")'] },
    { id: 'settings', name: 'Settings', selectors: ['a[href*="settings"]', 'text=Settings', 'nav :text("Settings")'] },
    { id: 'help', name: 'Help/Support', selectors: ['a[href*="help"]', 'text=Help', 'text=Support'] },
    { id: 'notifications', name: 'Notifications', selectors: ['button[aria-label*="notification"]', 'text=Notifications'] }
  ],

  ADMIN_FEATURES: [
    { id: 'organizations', name: 'Organizations Management', selectors: ['a[href*="organizations"]', 'text=Organizations'] },
    { id: 'users', name: 'User Management', selectors: ['a[href*="users"]', 'text=Users'] },
    { id: 'roles', name: 'Roles & Permissions', selectors: ['a[href*="roles"]', 'text=Roles', 'text=Permissions'] },
    { id: 'compliance', name: 'Compliance Dashboard', selectors: ['a[href*="compliance"]', 'text=Compliance'] },
    { id: 'analytics', name: 'Analytics & Reports', selectors: ['a[href*="analytics"]', 'text=Analytics', 'text=Reports'] },
    { id: 'billing', name: 'Billing Management', selectors: ['a[href*="billing"]', 'text=Billing'] },
    { id: 'audit', name: 'Audit Logs', selectors: ['a[href*="audit"]', 'text=Audit', 'text=Logs'] },
    { id: 'integrations', name: 'Integrations', selectors: ['a[href*="integrations"]', 'text=Integrations', 'text=API'] }
  ],

  ENTERPRISE_FEATURES: [
    { id: 'wallet', name: 'Wallet Overview', selectors: ['text=Wallet', 'text=Balance'] },
    { id: 'tokens', name: 'Token Management', selectors: ['text=Tokens', 'button:has-text("Create Token")'] },
    { id: 'treasury', name: 'Treasury Operations', selectors: ['text=Treasury', 'text=Liquidity'] },
    { id: 'transactions', name: 'Transaction History', selectors: ['text=Transactions', 'text=History'] },
    { id: 'mint', name: 'Mint Tokens', selectors: ['button:has-text("Mint")', 'text=Mint Tokens'] },
    { id: 'burn', name: 'Burn Tokens', selectors: ['button:has-text("Burn")', 'text=Burn Tokens'] },
    { id: 'transfer', name: 'Transfer/Send', selectors: ['button:has-text("Transfer")', 'button:has-text("Send")'] },
    { id: 'crossrail', name: 'Cross-Rail Operations', selectors: ['text=Cross-Rail', 'text=Bridge'] },
    { id: 'compliance-controls', name: 'Compliance Controls', selectors: ['text=Compliance', 'text=Controls'] },
    { id: 'reports', name: 'Reports', selectors: ['text=Reports', 'a[href*="reports"]'] }
  ],

  CONSUMER_FEATURES: [
    { id: 'wallet-balance', name: 'Wallet Balance', selectors: ['text=Balance', 'text=$'] },
    { id: 'topup', name: 'Add Money/Top Up', selectors: ['button:has-text("Add Money")', 'button:has-text("Top Up")'] },
    { id: 'send-money', name: 'Send Money', selectors: ['button:has-text("Send")', 'text=Send Money'] },
    { id: 'receive', name: 'Receive Money', selectors: ['button:has-text("Receive")', 'text=Receive'] },
    { id: 'pay-invoice', name: 'Pay Invoice', selectors: ['text=Pay Invoice', 'button:has-text("Pay")'] },
    { id: 'cards', name: 'Cards Management', selectors: ['text=Cards', 'text=Virtual Card'] },
    { id: 'transactions-history', name: 'Transaction History', selectors: ['text=Transactions', 'text=History'] },
    { id: 'qr-payment', name: 'QR Code Payments', selectors: ['text=QR', 'button:has-text("Scan")'] },
    { id: 'merchants', name: 'Merchant Payments', selectors: ['text=Merchants', 'text=Pay Merchant'] },
    { id: 'bills', name: 'Bill Payments', selectors: ['text=Bills', 'text=Pay Bills'] }
  ],

  CRUD_OPERATIONS: [
    { id: 'create', name: 'Create Operations', actions: ['button:has-text("Create")', 'button:has-text("Add")', 'button:has-text("New")'] },
    { id: 'read', name: 'View/Read Operations', actions: ['button:has-text("View")', 'text=Details', 'a[href*="view"]'] },
    { id: 'update', name: 'Edit/Update Operations', actions: ['button:has-text("Edit")', 'button:has-text("Update")', 'a[href*="edit"]'] },
    { id: 'delete', name: 'Delete Operations', actions: ['button:has-text("Delete")', 'button:has-text("Remove")', 'button[aria-label*="delete"]'] },
    { id: 'save', name: 'Save Operations', actions: ['button:has-text("Save")', 'button[type="submit"]'] },
    { id: 'cancel', name: 'Cancel Operations', actions: ['button:has-text("Cancel")', 'button:has-text("Close")'] }
  ]
};

// Discovery results storage
interface DiscoveryResult {
  app: string;
  timestamp: number;
  features: {
    [category: string]: {
      [feature: string]: {
        name: string;
        exists: boolean;
        selectors_found: string[];
        selectors_missing: string[];
        screenshot?: string;
        error?: string;
      };
    };
  };
  summary: {
    total_features: number;
    features_found: number;
    features_missing: number;
    completion_percentage: number;
  };
}

class ApplicationDiscovery {
  private results: Map<string, DiscoveryResult> = new Map();
  private timestamp = Date.now();

  async discoverApp(page: Page, appConfig: any): Promise<DiscoveryResult> {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🔍 DISCOVERING: ${appConfig.name}`);
    console.log(`${'='.repeat(60)}\n`);

    const result: DiscoveryResult = {
      app: appConfig.name,
      timestamp: this.timestamp,
      features: {},
      summary: {
        total_features: 0,
        features_found: 0,
        features_missing: 0,
        completion_percentage: 0
      }
    };

    try {
      // Navigate to app
      await page.goto(appConfig.url, { waitUntil: 'networkidle', timeout: 30000 });
      console.log(`✓ Navigated to ${appConfig.url}`);

      // Test AUTH_FLOW
      console.log('\n📋 Testing Authentication Flow...');
      result.features.AUTH_FLOW = await this.testFeatures(page, FEATURE_INVENTORY.AUTH_FLOW);

      // Try to login if possible
      const loggedIn = await this.attemptLogin(page, appConfig);

      if (loggedIn) {
        console.log('✓ Successfully logged in');

        // Test NAVIGATION
        console.log('\n📋 Testing Navigation Menu...');
        result.features.NAVIGATION = await this.testFeatures(page, FEATURE_INVENTORY.NAVIGATION);

        // Test app-specific features
        if (appConfig.name === 'Admin Portal') {
          console.log('\n📋 Testing Admin Features...');
          result.features.ADMIN_FEATURES = await this.testFeatures(page, FEATURE_INVENTORY.ADMIN_FEATURES);
        } else if (appConfig.name === 'Enterprise Wallet') {
          console.log('\n📋 Testing Enterprise Features...');
          result.features.ENTERPRISE_FEATURES = await this.testFeatures(page, FEATURE_INVENTORY.ENTERPRISE_FEATURES);
        } else if (appConfig.name === 'Consumer Wallet') {
          console.log('\n📋 Testing Consumer Features...');
          result.features.CONSUMER_FEATURES = await this.testFeatures(page, FEATURE_INVENTORY.CONSUMER_FEATURES);
        }

        // Test CRUD operations
        console.log('\n📋 Testing CRUD Operations...');
        result.features.CRUD_OPERATIONS = await this.testFeatures(page, FEATURE_INVENTORY.CRUD_OPERATIONS);
      }

    } catch (error) {
      console.error(`❌ Error discovering ${appConfig.name}:`, error);
    }

    // Calculate summary
    result.summary = this.calculateSummary(result);

    // Store results
    this.results.set(appConfig.name, result);

    // Generate report
    await this.generateReport(result);

    return result;
  }

  private async testFeatures(page: Page, features: any[]): Promise<any> {
    const results: any = {};

    for (const feature of features) {
      const found: string[] = [];
      const missing: string[] = [];

      console.log(`  Testing: ${feature.name}...`);

      const selectors = feature.selectors || feature.actions || [];

      for (const selector of selectors) {
        try {
          const count = await page.locator(selector).count();
          if (count > 0) {
            found.push(selector);
            console.log(`    ✓ Found: ${selector}`);
          } else {
            missing.push(selector);
            console.log(`    ✗ Missing: ${selector}`);
          }
        } catch (error) {
          missing.push(selector);
          console.log(`    ✗ Error checking: ${selector}`);
        }
      }

      results[feature.id] = {
        name: feature.name,
        exists: found.length > 0,
        selectors_found: found,
        selectors_missing: missing
      };
    }

    return results;
  }

  private async attemptLogin(page: Page, appConfig: any): Promise<boolean> {
    console.log('\n🔐 Attempting to login...');

    try {
      // Check if already logged in
      const dashboardVisible = await page.locator('text=Dashboard').count() > 0;
      if (dashboardVisible) {
        console.log('Already logged in');
        return true;
      }

      // Look for login form
      const emailInput = await page.locator('input[type="email"], input[name="email"], input[placeholder*="Email"]').first();
      const passwordInput = await page.locator('input[type="password"], input[name="password"], input[placeholder*="Password"]').first();

      if (await emailInput.count() > 0 && await passwordInput.count() > 0) {
        // Fill credentials
        await emailInput.fill(appConfig.credentials.email || appConfig.credentials.phone || '');
        await passwordInput.fill(appConfig.credentials.password);

        // Submit
        const submitBtn = await page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")').first();
        if (await submitBtn.count() > 0) {
          await submitBtn.click();
          await page.waitForLoadState('networkidle');

          // Check if MPIN required
          const mpinInput = await page.locator('input[name="mpin"], input[placeholder*="PIN"]').first();
          if (await mpinInput.count() > 0) {
            await mpinInput.fill(appConfig.credentials.mpin);
            await page.locator('button[type="submit"]').click();
            await page.waitForLoadState('networkidle');
          }

          // Check if logged in
          const postLoginCheck = await page.locator('text=Dashboard, text=Profile, text=Settings').count() > 0;
          return postLoginCheck;
        }
      }
    } catch (error) {
      console.log('Login failed:', error);
    }

    return false;
  }

  private calculateSummary(result: DiscoveryResult): any {
    let totalFeatures = 0;
    let featuresFound = 0;

    for (const category of Object.values(result.features)) {
      for (const feature of Object.values(category)) {
        totalFeatures++;
        if (feature.exists) {
          featuresFound++;
        }
      }
    }

    const featuresMissing = totalFeatures - featuresFound;
    const completionPercentage = totalFeatures > 0 ? Math.round((featuresFound / totalFeatures) * 100) : 0;

    return {
      total_features: totalFeatures,
      features_found: featuresFound,
      features_missing: featuresMissing,
      completion_percentage: completionPercentage
    };
  }

  private async generateReport(result: DiscoveryResult) {
    const reportDir = path.join(process.cwd(), 'discovery-reports');
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    const reportPath = path.join(reportDir, `${result.app.replace(/ /g, '_')}_${result.timestamp}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(result, null, 2));

    console.log(`\n📊 Report saved to: ${reportPath}`);
    console.log(`\n📈 Summary for ${result.app}:`);
    console.log(`   Total Features: ${result.summary.total_features}`);
    console.log(`   Features Found: ${result.summary.features_found} ✓`);
    console.log(`   Features Missing: ${result.summary.features_missing} ✗`);
    console.log(`   Completion: ${result.summary.completion_percentage}%`);
  }

  async generateMasterReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 MASTER DISCOVERY REPORT');
    console.log('='.repeat(60));

    const masterReport: any = {
      timestamp: this.timestamp,
      applications: [],
      overall_summary: {
        total_features_across_apps: 0,
        features_implemented: 0,
        features_missing: 0,
        average_completion: 0
      },
      recommendations: []
    };

    for (const [appName, result] of this.results) {
      masterReport.applications.push({
        name: appName,
        completion: result.summary.completion_percentage,
        features_found: result.summary.features_found,
        features_missing: result.summary.features_missing,
        missing_features: this.extractMissingFeatures(result)
      });

      masterReport.overall_summary.total_features_across_apps += result.summary.total_features;
      masterReport.overall_summary.features_implemented += result.summary.features_found;
      masterReport.overall_summary.features_missing += result.summary.features_missing;
    }

    masterReport.overall_summary.average_completion =
      Math.round(masterReport.applications.reduce((sum: number, app: any) => sum + app.completion, 0) / masterReport.applications.length);

    // Generate recommendations
    masterReport.recommendations = this.generateRecommendations(masterReport);

    // Save master report
    const reportDir = path.join(process.cwd(), 'discovery-reports');
    const masterReportPath = path.join(reportDir, `MASTER_REPORT_${this.timestamp}.json`);
    fs.writeFileSync(masterReportPath, JSON.stringify(masterReport, null, 2));

    // Also create a markdown report
    const markdownReport = this.generateMarkdownReport(masterReport);
    const mdPath = path.join(reportDir, `IMPLEMENTATION_STATUS_${this.timestamp}.md`);
    fs.writeFileSync(mdPath, markdownReport);

    console.log(`\n✅ Master report saved to: ${masterReportPath}`);
    console.log(`📄 Markdown report saved to: ${mdPath}`);

    return masterReport;
  }

  private extractMissingFeatures(result: DiscoveryResult): string[] {
    const missing: string[] = [];

    for (const [category, features] of Object.entries(result.features)) {
      for (const [id, feature] of Object.entries(features)) {
        if (!feature.exists) {
          missing.push(`${category} → ${feature.name}`);
        }
      }
    }

    return missing;
  }

  private generateRecommendations(report: any): string[] {
    const recommendations: string[] = [];

    // Priority 1: Critical auth features
    for (const app of report.applications) {
      if (app.missing_features.some((f: string) => f.includes('AUTH_FLOW'))) {
        recommendations.push(`🔴 HIGH PRIORITY: Fix authentication flow in ${app.name}`);
      }
    }

    // Priority 2: Navigation
    for (const app of report.applications) {
      if (app.missing_features.some((f: string) => f.includes('NAVIGATION'))) {
        recommendations.push(`🟡 MEDIUM: Implement navigation menu in ${app.name}`);
      }
    }

    // Priority 3: Core features
    if (report.applications.find((a: any) => a.name === 'Admin Portal')?.completion < 50) {
      recommendations.push('🔴 HIGH PRIORITY: Admin Portal needs core features implementation');
    }

    if (report.applications.find((a: any) => a.name === 'Consumer Wallet')?.completion < 70) {
      recommendations.push('🟡 MEDIUM: Consumer Wallet needs feature completion');
    }

    return recommendations;
  }

  private generateMarkdownReport(report: any): string {
    let md = `# Monay Platform - Implementation Status Report\n\n`;
    md += `**Generated:** ${new Date(report.timestamp).toISOString()}\n\n`;

    md += `## 📊 Overall Summary\n\n`;
    md += `- **Total Features Across All Apps:** ${report.overall_summary.total_features_across_apps}\n`;
    md += `- **Features Implemented:** ${report.overall_summary.features_implemented} ✅\n`;
    md += `- **Features Missing:** ${report.overall_summary.features_missing} ❌\n`;
    md += `- **Average Completion:** ${report.overall_summary.average_completion}%\n\n`;

    md += `## 🎯 Application Status\n\n`;
    for (const app of report.applications) {
      md += `### ${app.name}\n`;
      md += `- **Completion:** ${app.completion}%\n`;
      md += `- **Features Found:** ${app.features_found}\n`;
      md += `- **Features Missing:** ${app.features_missing}\n`;

      if (app.missing_features.length > 0) {
        md += `\n**Missing Features:**\n`;
        for (const feature of app.missing_features) {
          md += `- ❌ ${feature}\n`;
        }
      }
      md += `\n`;
    }

    md += `## 📋 Recommendations\n\n`;
    for (const rec of report.recommendations) {
      md += `- ${rec}\n`;
    }

    md += `\n## 🚀 Next Steps\n\n`;
    md += `1. Review missing features in each application\n`;
    md += `2. Prioritize implementation based on recommendations\n`;
    md += `3. Run discovery tests after each implementation\n`;
    md += `4. Achieve minimum 80% completion before integration testing\n`;

    return md;
  }
}

// Test Suite
test.describe('Application Discovery Tests', () => {
  test.setTimeout(120000); // 2 minutes per app

  let discovery: ApplicationDiscovery;

  test.beforeAll(() => {
    discovery = new ApplicationDiscovery();
  });

  test('Discover Admin Portal', async ({ page }) => {
    const result = await discovery.discoverApp(page, APPS.ADMIN);
    expect(result.summary.total_features).toBeGreaterThan(0);
  });

  test('Discover Enterprise Wallet', async ({ page }) => {
    const result = await discovery.discoverApp(page, APPS.ENTERPRISE);
    expect(result.summary.total_features).toBeGreaterThan(0);
  });

  test('Discover Consumer Wallet', async ({ page }) => {
    const result = await discovery.discoverApp(page, APPS.CONSUMER);
    expect(result.summary.total_features).toBeGreaterThan(0);
  });

  test.afterAll(async () => {
    // Generate master report
    const masterReport = await discovery.generateMasterReport();

    console.log('\n' + '='.repeat(60));
    console.log('🎯 DISCOVERY COMPLETE');
    console.log('='.repeat(60));
    console.log('\nCheck discovery-reports folder for detailed results');
  });
});

export { ApplicationDiscovery, FEATURE_INVENTORY, APPS };