'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft, Download, RefreshCw, Calendar,
  TrendingUp, TrendingDown, Activity, DollarSign,
  Users, Clock, AlertCircle, CheckCircle,
  XCircle, BarChart3, PieChart, LineChart,
  Filter, ChevronUp, ChevronDown, Zap, Shield
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface MetricCard {
  title: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'neutral';
  icon: any;
  color: string;
}

interface ExecutionData {
  timestamp: string;
  executions: number;
  successes: number;
  failures: number;
  avgTime: number;
}

interface TriggerBreakdown {
  trigger: string;
  count: number;
  percentage: number;
  trend: number;
}

interface ActionMetric {
  action: string;
  executions: number;
  successRate: number;
  avgTime: string;
  impact: 'high' | 'medium' | 'low';
}

export default function BusinessRuleAnalyticsPage() {
  const router = useRouter();
  const params = useParams();
  const ruleId = params.id as string;
  const { toast } = useToast();

  const [timeRange, setTimeRange] = useState('7d');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState('executions');

  // Key metrics
  const metrics: MetricCard[] = [
    {
      title: 'Total Executions',
      value: '45,231',
      change: 12.5,
      trend: 'up',
      icon: Activity,
      color: 'blue'
    },
    {
      title: 'Success Rate',
      value: '98.7%',
      change: 2.3,
      trend: 'up',
      icon: CheckCircle,
      color: 'green'
    },
    {
      title: 'Avg Response Time',
      value: '142ms',
      change: -8.2,
      trend: 'down',
      icon: Clock,
      color: 'yellow'
    },
    {
      title: 'Cost Savings',
      value: '$284K',
      change: 18.9,
      trend: 'up',
      icon: DollarSign,
      color: 'green'
    },
    {
      title: 'Compliance Rate',
      value: '99.9%',
      change: 0.1,
      trend: 'up',
      icon: Shield,
      color: 'purple'
    },
    {
      title: 'Error Rate',
      value: '0.3%',
      change: -0.2,
      trend: 'down',
      icon: XCircle,
      color: 'red'
    }
  ];

  // Execution timeline data (mock)
  const executionTimeline: ExecutionData[] = [
    { timestamp: '2024-01-14', executions: 1420, successes: 1402, failures: 18, avgTime: 145 },
    { timestamp: '2024-01-15', executions: 1538, successes: 1521, failures: 17, avgTime: 142 },
    { timestamp: '2024-01-16', executions: 1687, successes: 1669, failures: 18, avgTime: 138 },
    { timestamp: '2024-01-17', executions: 1456, successes: 1441, failures: 15, avgTime: 141 },
    { timestamp: '2024-01-18', executions: 1892, successes: 1875, failures: 17, avgTime: 139 },
    { timestamp: '2024-01-19', executions: 1724, successes: 1708, failures: 16, avgTime: 143 },
    { timestamp: '2024-01-20', executions: 1514, successes: 1499, failures: 15, avgTime: 140 }
  ];

  // Trigger breakdown
  const triggerBreakdown: TriggerBreakdown[] = [
    { trigger: 'Payment Initiated', count: 25420, percentage: 56.2, trend: 8.3 },
    { trigger: 'Expense Submitted', count: 12850, percentage: 28.4, trend: -2.1 },
    { trigger: 'Vendor Created', count: 4521, percentage: 10.0, trend: 15.7 },
    { trigger: 'Budget Updated', count: 2440, percentage: 5.4, trend: 3.2 }
  ];

  // Action metrics
  const actionMetrics: ActionMetric[] = [
    { action: 'Auto-Approve', executions: 28450, successRate: 99.8, avgTime: '82ms', impact: 'high' },
    { action: 'Escalate for Approval', executions: 12340, successRate: 98.5, avgTime: '245ms', impact: 'high' },
    { action: 'Send Notification', executions: 41230, successRate: 99.9, avgTime: '45ms', impact: 'medium' },
    { action: 'Log to Audit Trail', executions: 45231, successRate: 100, avgTime: '12ms', impact: 'low' },
    { action: 'Block Transaction', executions: 892, successRate: 100, avgTime: '95ms', impact: 'high' }
  ];

  // Condition analysis
  const conditionAnalysis = [
    { condition: 'amount > 100000', evaluated: 45231, matched: 12450, matchRate: 27.5 },
    { condition: 'department = engineering', evaluated: 45231, matched: 18920, matchRate: 41.8 },
    { condition: 'vendor_verified = true', evaluated: 45231, matched: 42150, matchRate: 93.2 },
    { condition: 'approval_level >= 2', evaluated: 12450, matched: 8920, matchRate: 71.6 }
  ];

  // Business impact metrics
  const businessImpact = {
    transactionsProcessed: 45231,
    totalValue: '$142.5M',
    avgTransactionValue: '$3,150',
    timeSaved: '1,247 hours',
    manualInterventionsAvoided: 38420,
    complianceViolationsPrevented: 347
  };

  const handleExportData = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('Analytics data exported successfully');
    } catch (error) {
      toast.error('Failed to export analytics data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshData = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Analytics data refreshed');
    } catch (error) {
      toast.error('Failed to refresh data');
    } finally {
      setIsLoading(false);
    }
  };

  const getImpactBadge = (impact: string) => {
    const colors = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800'
    };
    return <Badge className={colors[impact as keyof typeof colors]}>{impact}</Badge>;
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
            Back to Rule
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Rule Analytics</h1>
            <p className="text-gray-600">Multi-Level Payment Approval Performance</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleRefreshData} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={handleExportData} disabled={isLoading}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {metrics.map((metric, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <metric.icon className={`w-5 h-5 text-${metric.color}-500`} />
                {metric.trend === 'up' ? (
                  <div className="flex items-center text-green-600 text-xs">
                    <ChevronUp className="w-3 h-3" />
                    {metric.change}%
                  </div>
                ) : metric.trend === 'down' ? (
                  <div className="flex items-center text-red-600 text-xs">
                    <ChevronDown className="w-3 h-3" />
                    {Math.abs(metric.change)}%
                  </div>
                ) : (
                  <div className="text-gray-500 text-xs">—</div>
                )}
              </div>
              <p className="text-2xl font-bold">{metric.value}</p>
              <p className="text-xs text-gray-600 mt-1">{metric.title}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="execution" className="space-y-4">
        <TabsList className="grid grid-cols-5 w-fit">
          <TabsTrigger value="execution">Execution</TabsTrigger>
          <TabsTrigger value="triggers">Triggers</TabsTrigger>
          <TabsTrigger value="conditions">Conditions</TabsTrigger>
          <TabsTrigger value="actions">Actions</TabsTrigger>
          <TabsTrigger value="impact">Business Impact</TabsTrigger>
        </TabsList>

        {/* Execution Tab */}
        <TabsContent value="execution">
          <Card>
            <CardHeader>
              <CardTitle>Execution Timeline</CardTitle>
              <CardDescription>Rule execution patterns over time</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Mock chart visualization */}
              <div className="h-64 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <LineChart className="w-12 h-12 text-blue-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Execution timeline chart would render here</p>
                </div>
              </div>

              {/* Execution data table */}
              <div className="mt-6">
                <table className="w-full">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="pb-2 text-sm font-semibold">Date</th>
                      <th className="pb-2 text-sm font-semibold">Executions</th>
                      <th className="pb-2 text-sm font-semibold">Success</th>
                      <th className="pb-2 text-sm font-semibold">Failures</th>
                      <th className="pb-2 text-sm font-semibold">Avg Time</th>
                      <th className="pb-2 text-sm font-semibold">Success Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {executionTimeline.map((data, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-2 text-sm">{data.timestamp}</td>
                        <td className="py-2 text-sm font-medium">{data.executions.toLocaleString()}</td>
                        <td className="py-2 text-sm text-green-600">{data.successes.toLocaleString()}</td>
                        <td className="py-2 text-sm text-red-600">{data.failures}</td>
                        <td className="py-2 text-sm">{data.avgTime}ms</td>
                        <td className="py-2">
                          <Badge variant="outline" className="text-xs">
                            {((data.successes / data.executions) * 100).toFixed(1)}%
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Triggers Tab */}
        <TabsContent value="triggers">
          <Card>
            <CardHeader>
              <CardTitle>Trigger Analysis</CardTitle>
              <CardDescription>Breakdown of rule triggers by type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  {/* Mock pie chart */}
                  <div className="h-64 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <PieChart className="w-12 h-12 text-green-500 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Trigger distribution chart</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-4">Trigger Breakdown</h3>
                  <div className="space-y-3">
                    {triggerBreakdown.map((trigger, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">{trigger.trigger}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-600">
                                {trigger.count.toLocaleString()}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {trigger.percentage}%
                              </Badge>
                              {trigger.trend > 0 ? (
                                <span className="text-xs text-green-600">+{trigger.trend}%</span>
                              ) : (
                                <span className="text-xs text-red-600">{trigger.trend}%</span>
                              )}
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: `${trigger.percentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Conditions Tab */}
        <TabsContent value="conditions">
          <Card>
            <CardHeader>
              <CardTitle>Condition Analysis</CardTitle>
              <CardDescription>Performance and match rates for rule conditions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {conditionAnalysis.map((condition, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                        {condition.condition}
                      </code>
                      <Badge variant={condition.matchRate > 50 ? 'default' : 'secondary'}>
                        {condition.matchRate}% match rate
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-3">
                      <div>
                        <p className="text-xs text-gray-600">Evaluated</p>
                        <p className="font-semibold">{condition.evaluated.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Matched</p>
                        <p className="font-semibold text-green-600">{condition.matched.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Not Matched</p>
                        <p className="font-semibold text-gray-500">
                          {(condition.evaluated - condition.matched).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${condition.matchRate}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Actions Tab */}
        <TabsContent value="actions">
          <Card>
            <CardHeader>
              <CardTitle>Action Metrics</CardTitle>
              <CardDescription>Performance analysis of rule actions</CardDescription>
            </CardHeader>
            <CardContent>
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b">
                    <th className="pb-2 text-sm font-semibold">Action</th>
                    <th className="pb-2 text-sm font-semibold">Executions</th>
                    <th className="pb-2 text-sm font-semibold">Success Rate</th>
                    <th className="pb-2 text-sm font-semibold">Avg Time</th>
                    <th className="pb-2 text-sm font-semibold">Impact</th>
                  </tr>
                </thead>
                <tbody>
                  {actionMetrics.map((action, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">{action.action}</span>
                        </div>
                      </td>
                      <td className="py-3">{action.executions.toLocaleString()}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: `${action.successRate}%` }}
                            />
                          </div>
                          <span className="text-sm">{action.successRate}%</span>
                        </div>
                      </td>
                      <td className="py-3">{action.avgTime}</td>
                      <td className="py-3">{getImpactBadge(action.impact)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Business Impact Tab */}
        <TabsContent value="impact">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Financial Impact</CardTitle>
                <CardDescription>Cost savings and transaction metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Total Value Processed</p>
                    <p className="text-2xl font-bold text-green-600">{businessImpact.totalValue}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-500" />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Transactions Processed</span>
                    <span className="font-medium">{businessImpact.transactionsProcessed.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Average Transaction Value</span>
                    <span className="font-medium">{businessImpact.avgTransactionValue}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Cost per Transaction</span>
                    <span className="font-medium">$0.12</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Cost Savings</span>
                    <span className="font-medium text-green-600">$284,000</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Operational Impact</CardTitle>
                <CardDescription>Efficiency and compliance metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Time Saved</p>
                    <p className="text-2xl font-bold text-blue-600">{businessImpact.timeSaved}</p>
                  </div>
                  <Clock className="w-8 h-8 text-blue-500" />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Manual Interventions Avoided</span>
                    <span className="font-medium">{businessImpact.manualInterventionsAvoided.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Average Processing Time</span>
                    <span className="font-medium">142ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Compliance Violations Prevented</span>
                    <span className="font-medium text-red-600">{businessImpact.complianceViolationsPrevented}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Automation Rate</span>
                    <span className="font-medium">84.9%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ROI Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Return on Investment (ROI)</CardTitle>
              <CardDescription>Financial benefits vs implementation costs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Implementation Cost</p>
                  <p className="text-2xl font-bold">$45K</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Annual Savings</p>
                  <p className="text-2xl font-bold text-green-600">$3.4M</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">ROI</p>
                  <p className="text-2xl font-bold text-blue-600">7,556%</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Payback Period</p>
                  <p className="text-2xl font-bold">5 days</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}