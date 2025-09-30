'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  TestTube,
  Play,
  Code,
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  BarChart3,
  Settings,
  GitBranch
} from 'lucide-react';

export default function BusinessRulesTestPage() {
  const router = useRouter();
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    try {
      // Load rules from localStorage
      const storedRules = localStorage.getItem('createdBusinessRules');
      const createdRules = storedRules ? JSON.parse(storedRules) : [];

      // Mock data
      const mockRules = [
        {
          id: '1',
          name: 'Multi-Level Payment Approval',
          description: 'Require multiple approvals for high-value transactions',
          config: {
            priority: 'high',
            status: 'active',
            version: 1
          },
          stats: {
            executionCount: 1234,
            successCount: 1200,
            failureCount: 34,
            avgExecutionTime: 250
          }
        },
        {
          id: '2',
          name: 'Vendor Whitelist Enforcement',
          description: 'Only allow payments to pre-approved vendors',
          config: {
            priority: 'critical',
            status: 'active',
            version: 2
          },
          stats: {
            executionCount: 5678,
            successCount: 5600,
            failureCount: 78,
            avgExecutionTime: 150
          }
        },
        {
          id: '3',
          name: 'Smart Contract Auto-Execution',
          description: 'Automatically execute smart contracts based on conditions',
          config: {
            priority: 'medium',
            status: 'testing',
            version: 1
          },
          stats: {
            executionCount: 234,
            successCount: 230,
            failureCount: 4,
            avgExecutionTime: 3500
          }
        }
      ];

      const allRules = [...createdRules, ...mockRules];
      setRules(allRules);
    } catch (error) {
      console.error('Failed to load rules:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const config = {
      active: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      inactive: { color: 'bg-gray-100 text-gray-800', icon: Clock },
      testing: { color: 'bg-yellow-100 text-yellow-800', icon: TestTube }
    };
    const statusConfig = config[status as keyof typeof config] || config.inactive;
    const Icon = statusConfig.icon;

    return (
      <Badge className={`${statusConfig.color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {status.toUpperCase()}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      critical: 'bg-red-100 text-red-800',
      high: 'bg-orange-100 text-orange-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800'
    };
    return (
      <Badge className={colors[priority as keyof typeof colors] || colors.medium}>
        {priority.toUpperCase()}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Business Rules Testing</h1>
            <p className="text-gray-600">Test and validate your business rules</p>
          </div>
        </div>
      </div>

      {/* Test Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Rules</p>
                <p className="text-2xl font-bold">{rules.length}</p>
              </div>
              <GitBranch className="h-8 w-8 text-blue-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Rules</p>
                <p className="text-2xl font-bold">
                  {rules.filter(r => r.config?.status === 'active').length}
                </p>
              </div>
              <Activity className="h-8 w-8 text-green-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Testing Rules</p>
                <p className="text-2xl font-bold">
                  {rules.filter(r => r.config?.status === 'testing').length}
                </p>
              </div>
              <TestTube className="h-8 w-8 text-yellow-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Avg Success Rate</p>
                <p className="text-2xl font-bold">
                  {rules.length > 0 ? (
                    rules.reduce((sum, r) => {
                      if (r.stats && r.stats.executionCount > 0) {
                        return sum + (r.stats.successCount / r.stats.executionCount)
                      }
                      return sum
                    }, 0) / rules.length * 100
                  ).toFixed(1) : '0'}%
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rules List for Testing */}
      <Card>
        <CardHeader>
          <CardTitle>Available Rules for Testing</CardTitle>
          <CardDescription>
            Select a rule to run individual tests or view analytics
          </CardDescription>
        </CardHeader>
        <CardContent>
          {rules.length === 0 ? (
            <div className="text-center py-8">
              <TestTube className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Rules Available</h3>
              <p className="text-gray-600 mb-4">Create some business rules to start testing</p>
              <Button onClick={() => router.push('/business-rules/create')}>
                Create First Rule
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {rules.map((rule) => (
                <div key={rule.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100">
                        <GitBranch className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-lg">{rule.name}</h3>
                          {getStatusBadge(rule.config?.status || 'inactive')}
                          {getPriorityBadge(rule.config?.priority || 'medium')}
                          <Badge variant="outline">v{rule.config?.version || 1}</Badge>
                        </div>
                        <p className="text-gray-600 mt-1">{rule.description}</p>
                        {rule.stats && (
                          <div className="flex items-center gap-6 mt-3 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Zap className="h-4 w-4" />
                              {rule.stats.executionCount.toLocaleString()} executions
                            </span>
                            <span className="flex items-center gap-1">
                              <CheckCircle className="h-4 w-4" />
                              {((rule.stats.successCount || 0) / (rule.stats.executionCount || 1) * 100).toFixed(1)}% success
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {rule.stats.avgExecutionTime}ms avg
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/business-rules/${rule.id}/test`)}
                      >
                        <TestTube className="h-4 w-4 mr-2" />
                        Test
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/business-rules/${rule.id}/analytics`)}
                      >
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Analytics
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/business-rules/${rule.id}/edit`)}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test Suites */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Automated Test Suite</CardTitle>
            <CardDescription>
              Run comprehensive tests across all rules
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Code className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Test Suite</h3>
              <p className="text-gray-600 mb-4">
                Automated testing framework coming soon
              </p>
              <Button variant="outline" disabled>
                <Play className="h-4 w-4 mr-2" />
                Run All Tests
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Testing</CardTitle>
            <CardDescription>
              Load and stress testing for rules
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Performance Tests</h3>
              <p className="text-gray-600 mb-4">
                Performance testing tools coming soon
              </p>
              <Button variant="outline" disabled>
                <Zap className="h-4 w-4 mr-2" />
                Load Test
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}