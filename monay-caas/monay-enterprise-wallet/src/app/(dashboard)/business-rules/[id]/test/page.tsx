'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft, Play, RefreshCw, Download, Upload,
  CheckCircle, XCircle, AlertCircle, Clock,
  FileText, Code, Terminal, Zap, Activity
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface TestCase {
  id: string;
  name: string;
  description: string;
  input: Record<string, any>;
  expectedResult: 'pass' | 'fail' | 'skip';
  actualResult?: 'pass' | 'fail' | 'error';
  executionTime?: string;
  lastRun?: string;
  status: 'idle' | 'running' | 'completed';
}

interface TestRun {
  id: string;
  timestamp: string;
  totalTests: number;
  passed: number;
  failed: number;
  skipped: number;
  duration: string;
  environment: string;
}

export default function TestBusinessRulePage() {
  const router = useRouter();
  const params = useParams();
  const ruleId = params.id as string;
  const { toast } = useToast();

  const [isRunning, setIsRunning] = useState(false);
  const [selectedEnvironment, setSelectedEnvironment] = useState('sandbox');
  const [testMode, setTestMode] = useState<'manual' | 'automated'>('manual');
  const [showResults, setShowResults] = useState(false);

  // Manual test input
  const [manualInput, setManualInput] = useState({
    amount: '150000',
    department: 'engineering',
    vendor_id: 'VEND-001',
    vendor_verified: 'true',
    expense_category: 'software',
    approval_level: '1'
  });

  // Test cases for automated testing
  const [testCases, setTestCases] = useState<TestCase[]>([
    {
      id: '1',
      name: 'High-value transaction approval',
      description: 'Test multi-level approval for amounts > $100K',
      input: {
        amount: 150000,
        department: 'engineering',
        vendor_verified: true
      },
      expectedResult: 'pass',
      actualResult: undefined,
      status: 'idle'
    },
    {
      id: '2',
      name: 'Low-value auto-approval',
      description: 'Test automatic approval for amounts < $5K',
      input: {
        amount: 2500,
        department: 'marketing',
        vendor_verified: true
      },
      expectedResult: 'pass',
      actualResult: undefined,
      status: 'idle'
    },
    {
      id: '3',
      name: 'Unverified vendor rejection',
      description: 'Test rejection for unverified vendors',
      input: {
        amount: 10000,
        department: 'operations',
        vendor_verified: false
      },
      expectedResult: 'fail',
      actualResult: undefined,
      status: 'idle'
    },
    {
      id: '4',
      name: 'International payment flag',
      description: 'Test compliance flag for international payments',
      input: {
        amount: 25000,
        department: 'finance',
        vendor_verified: true,
        international: true
      },
      expectedResult: 'pass',
      actualResult: undefined,
      status: 'idle'
    },
    {
      id: '5',
      name: 'Budget exceeded block',
      description: 'Test blocking when department budget exceeded',
      input: {
        amount: 50000,
        department: 'hr',
        vendor_verified: true,
        budget_available: 30000
      },
      expectedResult: 'fail',
      actualResult: undefined,
      status: 'idle'
    }
  ]);

  // Test history
  const [testRuns] = useState<TestRun[]>([
    {
      id: '1',
      timestamp: '2024-01-20 14:30:00',
      totalTests: 5,
      passed: 4,
      failed: 1,
      skipped: 0,
      duration: '3.2s',
      environment: 'sandbox'
    },
    {
      id: '2',
      timestamp: '2024-01-19 10:15:00',
      totalTests: 5,
      passed: 5,
      failed: 0,
      skipped: 0,
      duration: '2.8s',
      environment: 'staging'
    }
  ]);

  // Test execution results
  const [executionLog, setExecutionLog] = useState<string[]>([]);
  const [testResults, setTestResults] = useState({
    conditions: {
      evaluated: 0,
      matched: 0,
      failed: 0
    },
    actions: {
      triggered: 0,
      executed: 0,
      failed: 0
    },
    performance: {
      executionTime: '0ms',
      memoryUsed: '0MB'
    }
  });

  const runManualTest = async () => {
    setIsRunning(true);
    setExecutionLog([]);
    setShowResults(false);

    const logs: string[] = [];
    logs.push(`[${new Date().toISOString()}] Starting test execution...`);
    logs.push(`[${new Date().toISOString()}] Environment: ${selectedEnvironment}`);
    logs.push(`[${new Date().toISOString()}] Input parameters: ${JSON.stringify(manualInput)}`);
    setExecutionLog(logs);

    try {
      // Simulate test execution
      await new Promise(resolve => setTimeout(resolve, 1000));

      logs.push(`[${new Date().toISOString()}] Evaluating conditions...`);
      logs.push(`[${new Date().toISOString()}] Condition 1: amount > 100000 = ${parseInt(manualInput.amount) > 100000}`);
      logs.push(`[${new Date().toISOString()}] Condition 2: department = engineering = ${manualInput.department === 'engineering'}`);
      logs.push(`[${new Date().toISOString()}] Condition 3: vendor_verified = true = ${manualInput.vendor_verified === 'true'}`);

      await new Promise(resolve => setTimeout(resolve, 500));

      const allConditionsMet = parseInt(manualInput.amount) > 100000 &&
                               manualInput.department === 'engineering' &&
                               manualInput.vendor_verified === 'true';

      if (allConditionsMet) {
        logs.push(`[${new Date().toISOString()}] ✓ All conditions met`);
        logs.push(`[${new Date().toISOString()}] Executing actions...`);
        logs.push(`[${new Date().toISOString()}] Action 1: Escalating to CFO for approval`);
        logs.push(`[${new Date().toISOString()}] Action 2: Sending notification to finance@company.com`);
        logs.push(`[${new Date().toISOString()}] Action 3: Logging to audit trail`);
        logs.push(`[${new Date().toISOString()}] ✓ Test completed successfully`);
      } else {
        logs.push(`[${new Date().toISOString()}] ✗ Conditions not met`);
        logs.push(`[${new Date().toISOString()}] No actions executed`);
      }

      setExecutionLog(logs);
      setTestResults({
        conditions: {
          evaluated: 3,
          matched: allConditionsMet ? 3 : 2,
          failed: allConditionsMet ? 0 : 1
        },
        actions: {
          triggered: allConditionsMet ? 3 : 0,
          executed: allConditionsMet ? 3 : 0,
          failed: 0
        },
        performance: {
          executionTime: '247ms',
          memoryUsed: '12.4MB'
        }
      });

      setShowResults(true);
      toast.success('Test execution completed');
    } catch (error) {
      toast.error('Test execution failed');
      logs.push(`[${new Date().toISOString()}] ✗ Error: Test execution failed`);
      setExecutionLog(logs);
    } finally {
      setIsRunning(false);
    }
  };

  const runAutomatedTests = async () => {
    setIsRunning(true);
    const logs: string[] = [];
    logs.push(`[${new Date().toISOString()}] Starting automated test suite...`);
    logs.push(`[${new Date().toISOString()}] Running ${testCases.length} test cases`);
    setExecutionLog(logs);

    for (const testCase of testCases) {
      // Update test case status
      setTestCases(prev => prev.map(tc =>
        tc.id === testCase.id ? { ...tc, status: 'running' as const } : tc
      ));

      logs.push(`[${new Date().toISOString()}] Running test: ${testCase.name}`);
      setExecutionLog([...logs]);

      await new Promise(resolve => setTimeout(resolve, 500));

      // Simulate test execution
      const result = Math.random() > 0.2 ? 'pass' : 'fail';
      const executionTime = `${Math.floor(Math.random() * 500) + 100}ms`;

      logs.push(`[${new Date().toISOString()}] ${result === 'pass' ? '✓' : '✗'} Test ${result}ed in ${executionTime}`);

      // Update test case with results
      setTestCases(prev => prev.map(tc =>
        tc.id === testCase.id
          ? {
              ...tc,
              actualResult: result as 'pass' | 'fail',
              executionTime,
              lastRun: new Date().toISOString(),
              status: 'completed' as const
            }
          : tc
      ));
    }

    logs.push(`[${new Date().toISOString()}] ✓ Test suite completed`);
    setExecutionLog(logs);
    setIsRunning(false);
    setShowResults(true);
    toast.success('All tests completed');
  };

  const exportTestResults = () => {
    // Simulate export
    toast.success('Test results exported to CSV');
  };

  const importTestCases = () => {
    // Simulate import
    toast.success('Test cases imported successfully');
  };

  const getTestStatusIcon = (status: TestCase['status']) => {
    switch (status) {
      case 'idle':
        return <Clock className="w-4 h-4 text-gray-400" />;
      case 'running':
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
  };

  const getTestResultBadge = (expected: string, actual?: string) => {
    if (!actual) return <Badge variant="outline">Not Run</Badge>;
    if (actual === 'error') return <Badge variant="destructive">Error</Badge>;
    if (actual === expected) return <Badge variant="default" className="bg-green-500">Pass</Badge>;
    return <Badge variant="destructive">Fail</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.push(`/business-rules/${ruleId}/edit`)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Edit
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Test Business Rule</h1>
            <p className="text-gray-600">Rule: Multi-Level Payment Approval</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={selectedEnvironment} onValueChange={setSelectedEnvironment}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sandbox">Sandbox</SelectItem>
              <SelectItem value="staging">Staging</SelectItem>
              <SelectItem value="production">Production</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={testMode === 'manual' ? runManualTest : runAutomatedTests}
            disabled={isRunning}
          >
            {isRunning ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Run Tests
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Test Tabs */}
      <Tabs value={testMode} onValueChange={(v) => setTestMode(v as 'manual' | 'automated')}>
        <TabsList>
          <TabsTrigger value="manual">Manual Test</TabsTrigger>
          <TabsTrigger value="automated">Automated Tests</TabsTrigger>
          <TabsTrigger value="history">Test History</TabsTrigger>
        </TabsList>

        {/* Manual Test Tab */}
        <TabsContent value="manual" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Test Input</CardTitle>
                <CardDescription>Configure test parameters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Amount</Label>
                    <Input
                      type="number"
                      value={manualInput.amount}
                      onChange={(e) => setManualInput({ ...manualInput, amount: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Department</Label>
                    <Select
                      value={manualInput.department}
                      onValueChange={(v) => setManualInput({ ...manualInput, department: v })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="engineering">Engineering</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="hr">HR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Vendor ID</Label>
                    <Input
                      value={manualInput.vendor_id}
                      onChange={(e) => setManualInput({ ...manualInput, vendor_id: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Vendor Verified</Label>
                    <Select
                      value={manualInput.vendor_verified}
                      onValueChange={(v) => setManualInput({ ...manualInput, vendor_verified: v })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Yes</SelectItem>
                        <SelectItem value="false">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Expense Category</Label>
                    <Select
                      value={manualInput.expense_category}
                      onValueChange={(v) => setManualInput({ ...manualInput, expense_category: v })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="software">Software</SelectItem>
                        <SelectItem value="hardware">Hardware</SelectItem>
                        <SelectItem value="travel">Travel</SelectItem>
                        <SelectItem value="consulting">Consulting</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Approval Level</Label>
                    <Input
                      type="number"
                      value={manualInput.approval_level}
                      onChange={(e) => setManualInput({ ...manualInput, approval_level: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label>Custom JSON Input (Optional)</Label>
                  <Textarea
                    placeholder='{"custom_field": "value"}'
                    className="mt-1 font-mono text-sm h-24"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Execution Log</CardTitle>
                <CardDescription>Real-time test execution details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-xs h-96 overflow-y-auto">
                  {executionLog.length > 0 ? (
                    executionLog.map((log, index) => (
                      <div key={index} className="mb-1">{log}</div>
                    ))
                  ) : (
                    <div className="text-gray-500">Waiting for test execution...</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Test Results */}
          {showResults && (
            <Card>
              <CardHeader>
                <CardTitle>Test Results</CardTitle>
                <CardDescription>Rule execution analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Conditions</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Evaluated</span>
                        <span className="font-medium">{testResults.conditions.evaluated}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Matched</span>
                        <span className="font-medium text-green-600">{testResults.conditions.matched}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Failed</span>
                        <span className="font-medium text-red-600">{testResults.conditions.failed}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Actions</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Triggered</span>
                        <span className="font-medium">{testResults.actions.triggered}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Executed</span>
                        <span className="font-medium text-green-600">{testResults.actions.executed}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Failed</span>
                        <span className="font-medium text-red-600">{testResults.actions.failed}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Performance</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Execution Time</span>
                        <span className="font-medium">{testResults.performance.executionTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Memory Used</span>
                        <span className="font-medium">{testResults.performance.memoryUsed}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Automated Tests Tab */}
        <TabsContent value="automated" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Test Cases</CardTitle>
                  <CardDescription>Predefined test scenarios</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={importTestCases}>
                    <Upload className="w-4 h-4 mr-2" />
                    Import
                  </Button>
                  <Button variant="outline" size="sm" onClick={exportTestResults}>
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {testCases.map((testCase) => (
                  <div key={testCase.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      {getTestStatusIcon(testCase.status)}
                      <div>
                        <p className="font-medium">{testCase.name}</p>
                        <p className="text-sm text-gray-600">{testCase.description}</p>
                        {testCase.executionTime && (
                          <p className="text-xs text-gray-500 mt-1">
                            Executed in {testCase.executionTime}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getTestResultBadge(testCase.expectedResult, testCase.actualResult)}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setManualInput({
                            amount: testCase.input.amount?.toString() || '',
                            department: testCase.input.department || '',
                            vendor_id: testCase.input.vendor_id || 'VEND-001',
                            vendor_verified: testCase.input.vendor_verified?.toString() || 'true',
                            expense_category: testCase.input.expense_category || 'software',
                            approval_level: testCase.input.approval_level || '1'
                          });
                          setTestMode('manual');
                        }}
                      >
                        <Code className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Test History Tab */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Test History</CardTitle>
              <CardDescription>Previous test runs and results</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {testRuns.map((run) => (
                  <div key={run.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{run.timestamp}</p>
                      <div className="flex gap-4 mt-1">
                        <span className="text-sm text-gray-600">
                          Environment: <Badge variant="outline" className="ml-1">{run.environment}</Badge>
                        </span>
                        <span className="text-sm text-gray-600">
                          Duration: {run.duration}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-2xl font-bold">{run.totalTests}</p>
                        <p className="text-xs text-gray-600">Total</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">{run.passed}</p>
                        <p className="text-xs text-gray-600">Passed</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-red-600">{run.failed}</p>
                        <p className="text-xs text-gray-600">Failed</p>
                      </div>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}