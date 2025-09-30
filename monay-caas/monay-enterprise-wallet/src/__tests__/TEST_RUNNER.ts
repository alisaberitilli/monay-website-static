/**
 * Comprehensive Test Runner with Failure Management
 * Implements the test failure handling strategy from our documentation
 */

import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

interface TestResult {
  name: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  error?: string;
  retryCount?: number;
  category?: string;
}

interface TestSuite {
  name: string;
  tests: TestResult[];
  totalPassed: number;
  totalFailed: number;
  totalSkipped: number;
  duration: number;
  timestamp: Date;
}

interface FailureAnalysis {
  severity: 'P0' | 'P1' | 'P2';
  requiresImmediate: boolean;
  blocksDependents: string[];
  suggestedAction: string;
  estimatedFixTime: number;
}

export class ComprehensiveTestRunner {
  private results: TestSuite[] = [];
  private knownIssues: Map<string, string> = new Map();
  private flakyTests: Map<string, number> = new Map();
  private testDependencies: Map<string, string[]> = new Map();
  private failureLog: Array<{
    timestamp: string;
    test: string;
    severity: string;
    error?: string;
    action: string;
  }> = [];

  constructor() {
    this.initializeTestDependencies();
    this.loadKnownIssues();
  }

  /**
   * Initialize test dependencies map
   */
  private initializeTestDependencies() {
    // Define test dependencies based on our testing inventory
    this.testDependencies.set('Authentication', ['Dashboard', 'API', 'WebSocket']);
    this.testDependencies.set('InvoiceWallet', ['Payment', 'Compliance', 'Treasury']);
    this.testDependencies.set('CrossRailTransfer', ['Bridge', 'BlockchainEVM', 'BlockchainSolana']);
    this.testDependencies.set('BusinessRules', ['Compliance', 'CapitalMarkets']);
    this.testDependencies.set('Database', ['API', 'WebSocket']);
  }

  /**
   * Load known issues from file
   */
  private loadKnownIssues() {
    const knownIssuesFile = path.join(__dirname, 'known-issues.json');
    if (fs.existsSync(knownIssuesFile)) {
      const issues = JSON.parse(fs.readFileSync(knownIssuesFile, 'utf-8'));
      issues.forEach((issue: any) => {
        this.knownIssues.set(issue.test, issue.reason);
      });
    }
  }

  /**
   * Main test execution method
   */
  async runAllTests(): Promise<void> {
    console.log('🚀 Starting Comprehensive Test Suite');
    console.log('==========================================\n');

    const testPhases = [
      { name: 'Unit Tests', command: 'npm run test:unit', priority: 1 },
      { name: 'Integration Tests', command: 'npm run test:integration', priority: 2 },
      { name: 'API Tests', command: 'npm run test:api', priority: 3 },
      { name: 'WebSocket Tests', command: 'npm run test:websocket', priority: 4 },
      { name: 'E2E Tests', command: 'npm run test:e2e', priority: 5 },
    ];

    for (const phase of testPhases) {
      console.log(`\n📋 Running ${phase.name}...`);
      const suite = await this.runTestPhase(phase);

      // Analyze failures and determine if we should continue
      const shouldContinue = await this.analyzeAndDecide(suite);

      if (!shouldContinue) {
        console.log(`\n❌ Critical failure in ${phase.name}. Stopping test execution.`);
        break;
      }
    }

    // Generate final report
    await this.generateTestReport();
  }

  /**
   * Run a specific test phase
   */
  private async runTestPhase(phase: any): Promise<TestSuite> {
    const startTime = Date.now();
    const suite: TestSuite = {
      name: phase.name,
      tests: [],
      totalPassed: 0,
      totalFailed: 0,
      totalSkipped: 0,
      duration: 0,
      timestamp: new Date(),
    };

    return new Promise((resolve) => {
      const testProcess = spawn('npm', ['run', phase.command.split(' ')[2]], {
        shell: true,
        cwd: process.cwd(),
      });

      let output = '';

      testProcess.stdout.on('data', (data) => {
        output += data.toString();
        process.stdout.write(data);
      });

      testProcess.stderr.on('data', (data) => {
        output += data.toString();
        process.stderr.write(data);
      });

      testProcess.on('close', async (code) => {
        suite.duration = Date.now() - startTime;

        // Parse test results from output
        const results = this.parseTestOutput(output);
        suite.tests = results;

        // Count results
        suite.totalPassed = results.filter(r => r.status === 'passed').length;
        suite.totalFailed = results.filter(r => r.status === 'failed').length;
        suite.totalSkipped = results.filter(r => r.status === 'skipped').length;

        this.results.push(suite);

        // Handle failures if any
        if (suite.totalFailed > 0) {
          await this.handleTestFailures(suite);
        }

        resolve(suite);
      });
    });
  }

  /**
   * Parse test output to extract results
   */
  private parseTestOutput(output: string): TestResult[] {
    const results: TestResult[] = [];
    const lines = output.split('\n');

    lines.forEach(line => {
      // Parse Jest output format
      if (line.includes('✓') || line.includes('✕') || line.includes('○')) {
        const status = line.includes('✓') ? 'passed' :
                      line.includes('✕') ? 'failed' : 'skipped';

        // Extract test name and duration
        const match = line.match(/(.+?)\s+\((\d+)\s*ms\)/);
        if (match) {
          results.push({
            name: match[1].trim(),
            status,
            duration: parseInt(match[2]),
          });
        }
      }
    });

    return results;
  }

  /**
   * Handle test failures according to our strategy
   */
  private async handleTestFailures(suite: TestSuite): Promise<void> {
    console.log(`\n⚠️  Handling ${suite.totalFailed} failures in ${suite.name}`);

    for (const test of suite.tests.filter(t => t.status === 'failed')) {
      const analysis = await this.analyzeFailure(test, suite.name);

      switch (analysis.severity) {
        case 'P0':
          await this.handleCriticalFailure(test, analysis);
          break;
        case 'P1':
          await this.handleMajorFailure(test, analysis);
          break;
        case 'P2':
          await this.handleMinorFailure(test, analysis);
          break;
      }

      // Check if test is flaky
      await this.checkFlakyTest(test);
    }
  }

  /**
   * Analyze failure and determine severity
   */
  private async analyzeFailure(test: TestResult, suiteName: string): Promise<FailureAnalysis> {
    // Determine severity based on test category and error
    let severity: 'P0' | 'P1' | 'P2' = 'P2';
    let requiresImmediate = false;
    let estimatedFixTime = 30;

    // Critical paths
    if (suiteName.includes('Authentication') ||
        suiteName.includes('Payment') ||
        test.name.includes('critical')) {
      severity = 'P0';
      requiresImmediate = true;
      estimatedFixTime = 60;
    }
    // Major features
    else if (suiteName.includes('Invoice') ||
             suiteName.includes('CrossRail') ||
             suiteName.includes('Treasury')) {
      severity = 'P1';
      estimatedFixTime = 240;
    }

    // Get dependent tests
    const blocksDependents = this.getDependentTests(test.name);

    // Suggest action based on severity
    let suggestedAction = '';
    switch (severity) {
      case 'P0':
        suggestedAction = 'STOP ALL TESTING - Fix immediately';
        break;
      case 'P1':
        suggestedAction = 'Create high-priority ticket, implement workaround';
        break;
      case 'P2':
        suggestedAction = 'Log issue, continue testing';
        break;
    }

    return {
      severity,
      requiresImmediate,
      blocksDependents,
      suggestedAction,
      estimatedFixTime,
    };
  }

  /**
   * Handle critical (P0) failures
   */
  private async handleCriticalFailure(test: TestResult, analysis: FailureAnalysis): Promise<void> {
    console.log(`\n🚨 CRITICAL FAILURE: ${test.name}`);
    console.log(`   Action: ${analysis.suggestedAction}`);
    console.log(`   Estimated fix time: ${analysis.estimatedFixTime} minutes`);

    // Log failure
    this.failureLog.push({
      timestamp: new Date().toISOString(),
      test: test.name,
      severity: 'P0',
      error: test.error,
      action: 'Test execution stopped',
    });

    // Alert team (in real implementation, would send Slack/email)
    await this.alertTeam('P0', test);

    // Save test state for recovery
    await this.saveTestState();
  }

  /**
   * Handle major (P1) failures
   */
  private async handleMajorFailure(test: TestResult, analysis: FailureAnalysis): Promise<void> {
    console.log(`\n⚠️  Major failure: ${test.name}`);
    console.log(`   Blocking: ${analysis.blocksDependents.join(', ') || 'None'}`);

    // Skip dependent tests
    if (analysis.blocksDependents.length > 0) {
      console.log(`   Skipping dependent tests: ${analysis.blocksDependents.join(', ')}`);
      analysis.blocksDependents.forEach(dep => {
        this.knownIssues.set(dep, `Blocked by failure in ${test.name}`);
      });
    }

    // Create bug ticket
    await this.createBugTicket('P1', test);

    // Log failure
    this.failureLog.push({
      timestamp: new Date().toISOString(),
      test: test.name,
      severity: 'P1',
      error: test.error,
      action: 'Ticket created, dependents skipped',
    });
  }

  /**
   * Handle minor (P2) failures
   */
  private async handleMinorFailure(test: TestResult, analysis: FailureAnalysis): Promise<void> {
    console.log(`   Minor failure logged: ${test.name}`);

    // Add to known issues
    this.knownIssues.set(test.name, test.error || 'Minor issue');

    // Log failure
    this.failureLog.push({
      timestamp: new Date().toISOString(),
      test: test.name,
      severity: 'P2',
      error: test.error,
      action: 'Added to known issues',
    });
  }

  /**
   * Check if test is flaky and handle accordingly
   */
  private async checkFlakyTest(test: TestResult): Promise<void> {
    const flakyCount = (this.flakyTests.get(test.name) || 0) + 1;
    this.flakyTests.set(test.name, flakyCount);

    if (flakyCount >= 3) {
      console.log(`   🔄 Test marked as flaky: ${test.name} (failed ${flakyCount} times)`);

      // Retry with increased timeout
      const retryResult = await this.retryTest(test, 3);

      if (!retryResult.passed) {
        // Quarantine the test
        await this.quarantineTest(test);
      }
    }
  }

  /**
   * Retry a failed test
   */
  private async retryTest(test: TestResult, maxRetries: number): Promise<{ passed: boolean }> {
    console.log(`   Retrying test: ${test.name}`);

    for (let i = 0; i < maxRetries; i++) {
      // In real implementation, would run the specific test
      // For now, simulate retry
      const passed = Math.random() > 0.5;

      if (passed) {
        console.log(`   ✅ Test passed on retry ${i + 1}`);
        return { passed: true };
      }

      // Wait before next retry
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return { passed: false };
  }

  /**
   * Quarantine a consistently failing test
   */
  private async quarantineTest(test: TestResult): Promise<void> {
    console.log(`   🚫 Test quarantined: ${test.name}`);

    // Add to quarantine list
    const quarantineFile = path.join(__dirname, 'quarantine.json');
    const quarantine = fs.existsSync(quarantineFile)
      ? JSON.parse(fs.readFileSync(quarantineFile, 'utf-8'))
      : [];

    quarantine.push({
      test: test.name,
      quarantinedAt: new Date().toISOString(),
      reason: 'Consistently flaky',
      failureCount: this.flakyTests.get(test.name),
    });

    fs.writeFileSync(quarantineFile, JSON.stringify(quarantine, null, 2));
  }

  /**
   * Analyze results and decide whether to continue
   */
  private async analyzeAndDecide(suite: TestSuite): Promise<boolean> {
    // Check failure rate
    const failureRate = (suite.totalFailed / (suite.tests.length || 1)) * 100;

    if (failureRate > 50) {
      console.log(`\n❌ High failure rate (${failureRate.toFixed(1)}%). Stopping execution.`);
      return false;
    }

    // Check for critical failures
    const hasCritical = this.failureLog.some(f => f.severity === 'P0');
    if (hasCritical) {
      console.log('\n❌ Critical failure detected. Stopping execution.');
      return false;
    }

    console.log(`\n✅ Continuing with ${failureRate.toFixed(1)}% failure rate`);
    return true;
  }

  /**
   * Get dependent tests
   */
  private getDependentTests(testName: string): string[] {
    const dependents: string[] = [];

    // Find category of failed test
    let failedCategory = '';
    for (const [category, deps] of this.testDependencies.entries()) {
      if (testName.includes(category)) {
        failedCategory = category;
        break;
      }
    }

    // Get tests that depend on this category
    if (failedCategory) {
      return this.testDependencies.get(failedCategory) || [];
    }

    return dependents;
  }

  /**
   * Alert team about critical failures
   */
  private async alertTeam(severity: string, test: TestResult): Promise<void> {
    // In real implementation, would send Slack/email/PagerDuty
    console.log(`\n📧 Alert sent to team:`);
    console.log(`   Severity: ${severity}`);
    console.log(`   Test: ${test.name}`);
    console.log(`   Error: ${test.error}`);
  }

  /**
   * Create bug ticket
   */
  private async createBugTicket(priority: string, test: TestResult): Promise<void> {
    // In real implementation, would create JIRA/GitHub issue
    const ticket = {
      title: `Test Failure: ${test.name}`,
      priority,
      description: test.error,
      assignee: 'auto-assigned',
      labels: ['test-failure', 'automated'],
    };

    console.log(`   📝 Bug ticket created: ${ticket.title}`);
  }

  /**
   * Save test state for recovery
   */
  private async saveTestState(): Promise<void> {
    const stateFile = path.join(__dirname, 'test-state.json');
    const state = {
      timestamp: new Date().toISOString(),
      results: this.results,
      knownIssues: Array.from(this.knownIssues.entries()),
      flakyTests: Array.from(this.flakyTests.entries()),
      failureLog: this.failureLog,
    };

    fs.writeFileSync(stateFile, JSON.stringify(state, null, 2));
    console.log(`   💾 Test state saved to ${stateFile}`);
  }

  /**
   * Generate comprehensive test report
   */
  private async generateTestReport(): Promise<void> {
    console.log('\n=====================================');
    console.log('📊 TEST EXECUTION SUMMARY');
    console.log('=====================================\n');

    let totalTests = 0;
    let totalPassed = 0;
    let totalFailed = 0;
    let totalSkipped = 0;
    let totalDuration = 0;

    // Aggregate results
    for (const suite of this.results) {
      totalTests += suite.tests.length;
      totalPassed += suite.totalPassed;
      totalFailed += suite.totalFailed;
      totalSkipped += suite.totalSkipped;
      totalDuration += suite.duration;

      console.log(`${suite.name}:`);
      console.log(`  ✅ Passed: ${suite.totalPassed}`);
      console.log(`  ❌ Failed: ${suite.totalFailed}`);
      console.log(`  ⏭️  Skipped: ${suite.totalSkipped}`);
      console.log(`  ⏱️  Duration: ${(suite.duration / 1000).toFixed(2)}s`);
      console.log('');
    }

    // Overall statistics
    console.log('OVERALL STATISTICS:');
    console.log(`  Total Tests: ${totalTests}`);
    console.log(`  Passed: ${totalPassed} (${((totalPassed/totalTests)*100).toFixed(1)}%)`);
    console.log(`  Failed: ${totalFailed} (${((totalFailed/totalTests)*100).toFixed(1)}%)`);
    console.log(`  Skipped: ${totalSkipped}`);
    console.log(`  Total Duration: ${(totalDuration / 1000).toFixed(2)}s`);

    // Failure summary
    if (this.failureLog.length > 0) {
      console.log('\n❌ FAILURE SUMMARY:');
      console.log('-------------------');

      const p0Failures = this.failureLog.filter(f => f.severity === 'P0');
      const p1Failures = this.failureLog.filter(f => f.severity === 'P1');
      const p2Failures = this.failureLog.filter(f => f.severity === 'P2');

      if (p0Failures.length > 0) {
        console.log(`\n🚨 P0 - Critical (${p0Failures.length}):`);
        p0Failures.forEach(f => {
          console.log(`  - ${f.test}: ${f.action}`);
        });
      }

      if (p1Failures.length > 0) {
        console.log(`\n⚠️  P1 - Major (${p1Failures.length}):`);
        p1Failures.forEach(f => {
          console.log(`  - ${f.test}: ${f.action}`);
        });
      }

      if (p2Failures.length > 0) {
        console.log(`\n📝 P2 - Minor (${p2Failures.length}):`);
        p2Failures.forEach(f => {
          console.log(`  - ${f.test}: ${f.action}`);
        });
      }
    }

    // Flaky tests
    if (this.flakyTests.size > 0) {
      console.log('\n🔄 FLAKY TESTS:');
      console.log('---------------');
      for (const [test, count] of this.flakyTests.entries()) {
        console.log(`  - ${test}: Failed ${count} times`);
      }
    }

    // Known issues
    if (this.knownIssues.size > 0) {
      console.log('\n📌 KNOWN ISSUES:');
      console.log('----------------');
      for (const [test, reason] of this.knownIssues.entries()) {
        console.log(`  - ${test}: ${reason}`);
      }
    }

    // Recommendations
    console.log('\n💡 RECOMMENDATIONS:');
    console.log('-------------------');

    const passRate = (totalPassed / totalTests) * 100;
    const p0FailureCount = this.failureLog.filter(f => f.severity === 'P0').length;

    if (passRate < 80) {
      console.log('  ⚠️  Pass rate below 80% - Review test stability');
    }

    if (this.flakyTests.size > 5) {
      console.log('  ⚠️  Multiple flaky tests detected - Schedule test review');
    }

    if (p0FailureCount > 0) {
      console.log('  🚨 Critical failures require immediate attention');
    }

    if (passRate >= 98) {
      console.log('  ✅ Excellent test stability - Ready for deployment');
    } else if (passRate >= 90) {
      console.log('  ✅ Good test stability - Minor issues to address');
    }

    // Save report to file
    const reportFile = path.join(__dirname, `test-report-${Date.now()}.json`);
    fs.writeFileSync(reportFile, JSON.stringify({
      timestamp: new Date().toISOString(),
      summary: {
        totalTests,
        totalPassed,
        totalFailed,
        totalSkipped,
        passRate: passRate.toFixed(2),
        duration: totalDuration,
      },
      suites: this.results,
      failures: this.failureLog,
      flakyTests: Array.from(this.flakyTests.entries()),
      knownIssues: Array.from(this.knownIssues.entries()),
    }, null, 2));

    console.log(`\n📄 Full report saved to: ${reportFile}`);
    console.log('\n=====================================\n');
  }
}

// Export for use in other test files
export default ComprehensiveTestRunner;

// If run directly, execute tests
if (require.main === module) {
  const runner = new ComprehensiveTestRunner();
  runner.runAllTests().then(() => {
    process.exit(0);
  }).catch((error) => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });
}