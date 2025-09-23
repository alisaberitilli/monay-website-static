'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { aiMlAPI } from '../lib/api/services';
import {
  Brain,
  TrendingUp,
  Shield,
  AlertTriangle,
  Activity,
  BarChart3,
  Target,
  Zap,
  RefreshCw,
  Download,
  ChevronRight,
  Info,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Users,
  CreditCard,
  LineChart,
  Loader2
} from 'lucide-react';
import {
  LineChart as RechartsLineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

const AiMlInsightsDashboard: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState('fraud-detection');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Mock data for charts
  const fraudTrendData = [
    { date: 'Jan', legitimate: 98.2, fraudulent: 1.8 },
    { date: 'Feb', legitimate: 97.8, fraudulent: 2.2 },
    { date: 'Mar', legitimate: 98.5, fraudulent: 1.5 },
    { date: 'Apr', legitimate: 97.9, fraudulent: 2.1 },
    { date: 'May', legitimate: 98.7, fraudulent: 1.3 },
    { date: 'Jun', legitimate: 98.9, fraudulent: 1.1 }
  ];

  const customerLTVData = [
    { segment: 'Premium', ltv: 125000, churn: 5 },
    { segment: 'Verified', ltv: 45000, churn: 12 },
    { segment: 'Basic', ltv: 8500, churn: 25 },
    { segment: 'New', ltv: 2500, churn: 35 }
  ];

  const modelPerformance = [
    { model: 'Fraud Detection', accuracy: 99.2, precision: 98.5, recall: 97.8, f1Score: 98.1 },
    { model: 'Churn Prediction', accuracy: 94.5, precision: 92.3, recall: 91.7, f1Score: 92.0 },
    { model: 'LTV Prediction', accuracy: 91.2, precision: 89.5, recall: 88.3, f1Score: 88.9 },
    { model: 'Risk Scoring', accuracy: 96.7, precision: 95.2, recall: 94.8, f1Score: 95.0 }
  ];

  const transactionRouting = [
    { route: 'Direct', volume: 45, avgTime: 1.2, successRate: 99.5, cost: 0.12 },
    { route: 'Bridge', volume: 30, avgTime: 2.8, successRate: 98.2, cost: 0.28 },
    { route: 'Partner', volume: 25, avgTime: 3.5, successRate: 97.8, cost: 0.45 }
  ];

  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  const handleRefreshModels = async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            AI/ML Insights Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Real-time machine learning insights and predictions
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshModels}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh Models
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-l-4 border-l-blue-600 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Fraud Detection Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">99.2%</div>
              <Progress value={99.2} className="mt-2 h-1" />
              <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                +2.3% from last month
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="border-l-4 border-l-green-600 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Avg Customer LTV
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$45,250</div>
              <Progress value={65} className="mt-2 h-1" />
              <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                +18% predicted growth
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="border-l-4 border-l-yellow-600 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4" />
                Churn Risk Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">234</div>
              <Badge className="mt-2 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                Medium Risk
              </Badge>
              <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
                Intervention recommended
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card className="border-l-4 border-l-purple-600 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Smart Routing Savings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$125,420</div>
              <Progress value={82} className="mt-2 h-1" />
              <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                This month
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="fraud" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="fraud">Fraud Detection</TabsTrigger>
          <TabsTrigger value="predictive">Predictive Analytics</TabsTrigger>
          <TabsTrigger value="routing">Smart Routing</TabsTrigger>
          <TabsTrigger value="performance">Model Performance</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="fraud" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Fraud Trend Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Fraud Detection Trends</CardTitle>
                <CardDescription>Transaction classification over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={fraudTrendData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="legitimate"
                      stackId="1"
                      stroke="#10B981"
                      fill="#10B981"
                      fillOpacity={0.6}
                    />
                    <Area
                      type="monotone"
                      dataKey="fraudulent"
                      stackId="1"
                      stroke="#EF4444"
                      fill="#EF4444"
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Recent Fraud Alerts */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Fraud Alerts</CardTitle>
                <CardDescription>Latest suspicious activities detected</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/10 rounded-lg">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                      <div>
                        <p className="font-medium">High-Risk Transaction</p>
                        <p className="text-sm text-muted-foreground">Card ending ****4532</p>
                      </div>
                    </div>
                    <Badge variant="destructive">Blocked</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                      <div>
                        <p className="font-medium">Unusual Pattern Detected</p>
                        <p className="text-sm text-muted-foreground">Multiple login attempts</p>
                      </div>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                      Review
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/10 rounded-lg">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                      <div>
                        <p className="font-medium">Velocity Check Failed</p>
                        <p className="text-sm text-muted-foreground">User ID: USR-789012</p>
                      </div>
                    </div>
                    <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400">
                      Flagged
                    </Badge>
                  </div>
                </div>

                <Button variant="outline" className="w-full mt-4">
                  View All Alerts
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="predictive" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Customer LTV Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Lifetime Value Distribution</CardTitle>
                <CardDescription>LTV by customer segment with churn risk</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={customerLTVData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="segment" className="text-xs" />
                    <YAxis yAxisId="left" className="text-xs" />
                    <YAxis yAxisId="right" orientation="right" className="text-xs" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="ltv" fill="#3B82F6" name="LTV ($)" />
                    <Bar yAxisId="right" dataKey="churn" fill="#EF4444" name="Churn Risk (%)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Prediction Insights */}
            <Card>
              <CardHeader>
                <CardTitle>Predictive Insights</CardTitle>
                <CardDescription>Key predictions for next 30 days</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">Transaction Volume</span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">+23%</p>
                      <p className="text-xs text-muted-foreground">$2.3M increase</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">New User Growth</span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">+1,250</p>
                      <p className="text-xs text-muted-foreground">85% confidence</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-medium">Card Activation Rate</span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">72%</p>
                      <p className="text-xs text-muted-foreground">+5% improvement</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm font-medium">Revenue Forecast</span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">$485K</p>
                      <p className="text-xs text-muted-foreground">92% confidence</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Button variant="default" className="w-full">
                    Generate Detailed Forecast
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="routing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Intelligent Transaction Routing</CardTitle>
              <CardDescription>Optimal path selection based on cost, speed, and reliability</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactionRouting.map((route, index) => (
                  <div key={route.route} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full bg-${['blue', 'green', 'yellow'][index]}-600`} />
                        <span className="font-medium">{route.route} Route</span>
                      </div>
                      <Badge variant="outline">{route.volume}% Volume</Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Avg Time</p>
                        <p className="font-medium">{route.avgTime}s</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Success Rate</p>
                        <p className="font-medium">{route.successRate}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Cost per TX</p>
                        <p className="font-medium">${route.cost}</p>
                      </div>
                    </div>

                    <Progress value={route.volume} className="mt-3 h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Model Performance Metrics</CardTitle>
              <CardDescription>Real-time performance tracking for all ML models</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {modelPerformance.map((model) => (
                  <div key={model.model} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium">{model.model}</span>
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                        Active
                      </Badge>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                      <div>
                        <p className="text-xs text-muted-foreground">Accuracy</p>
                        <Progress value={model.accuracy} className="h-2 mt-1" />
                        <p className="text-xs font-medium mt-1">{model.accuracy}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Precision</p>
                        <Progress value={model.precision} className="h-2 mt-1" />
                        <p className="text-xs font-medium mt-1">{model.precision}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Recall</p>
                        <Progress value={model.recall} className="h-2 mt-1" />
                        <p className="text-xs font-medium mt-1">{model.recall}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">F1 Score</p>
                        <Progress value={model.f1Score} className="h-2 mt-1" />
                        <p className="text-xs font-medium mt-1">{model.f1Score}%</p>
                      </div>
                    </div>
                  </div>
                ))}

                <Button variant="outline" className="w-full">
                  Retrain Models
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI-Powered Recommendations</CardTitle>
              <CardDescription>Actionable insights to optimize your platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
                  <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium">Optimize Transaction Routing</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Switch 15% of Bridge route traffic to Direct route to save $12,000/month
                    </p>
                    <Button size="sm" className="mt-2">Apply Optimization</Button>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/10 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium">Reduce Churn Risk</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      234 users at risk. Send personalized retention offers to reduce churn by 40%
                    </p>
                    <Button size="sm" className="mt-2">Create Campaign</Button>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium">Update Fraud Rules</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      New fraud pattern detected. Update rules to prevent $50K potential losses
                    </p>
                    <Button size="sm" className="mt-2">Review Rules</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AiMlInsightsDashboard;