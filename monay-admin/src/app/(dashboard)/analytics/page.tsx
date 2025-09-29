'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { superAdminService } from '@/services/super-admin.service';
import { 
  BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { 
  TrendingUp, TrendingDown, DollarSign, Users, CreditCard, 
  Activity, Download, Calendar, Filter
} from 'lucide-react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import CountUp from 'react-countup';

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState('7days');
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    totalTransactions: 0,
    activeUsers: 0,
    avgTransactionValue: 0,
    growthRate: 0,
    conversionRate: 0
  });

  // Chart data
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [transactionData, setTransactionData] = useState<any[]>([]);
  const [userActivityData, setUserActivityData] = useState<any[]>([]);
  const [providerData, setProviderData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [performanceData, setPerformanceData] = useState<any[]>([]);

  useEffect(() => {
    loadAnalytics();
  }, [dateRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      // Generate mock data based on date range
      const days = dateRange === '7days' ? 7 : dateRange === '30days' ? 30 : 90;
      
      // Revenue trend data
      const revenue = Array.from({ length: days }, (_, i) => {
        const date = subDays(new Date(), days - i - 1);
        return {
          date: format(date, 'MMM dd'),
          revenue: Math.floor(Math.random() * 500000) + 100000,
          transactions: Math.floor(Math.random() * 1000) + 500,
          fees: Math.floor(Math.random() * 10000) + 1000
        };
      });
      setRevenueData(revenue);

      // Transaction volume data
      const transactions = Array.from({ length: 24 }, (_, i) => ({
        hour: `${i}:00`,
        tempo: Math.floor(Math.random() * 1000) + 200,
        circle: Math.floor(Math.random() * 300) + 50,
        card: Math.floor(Math.random() * 500) + 100
      }));
      setTransactionData(transactions);

      // User activity data
      const userActivity = [
        { day: 'Mon', newUsers: 120, activeUsers: 450, churned: 20 },
        { day: 'Tue', newUsers: 132, activeUsers: 480, churned: 15 },
        { day: 'Wed', newUsers: 145, activeUsers: 520, churned: 18 },
        { day: 'Thu', newUsers: 180, activeUsers: 580, churned: 12 },
        { day: 'Fri', newUsers: 210, activeUsers: 650, churned: 10 },
        { day: 'Sat', newUsers: 190, activeUsers: 600, churned: 14 },
        { day: 'Sun', newUsers: 150, activeUsers: 500, churned: 16 }
      ];
      setUserActivityData(userActivity);

      // Provider distribution
      const providers = [
        { name: 'Tempo', value: 65, color: '#3B82F6' },
        { name: 'Circle', value: 25, color: '#8B5CF6' },
        { name: 'Cards', value: 8, color: '#10B981' },
        { name: 'Other', value: 2, color: '#F59E0B' }
      ];
      setProviderData(providers);

      // Category breakdown
      const categories = [
        { category: 'P2P Transfers', amount: 2500000, percentage: 35 },
        { category: 'Merchant Payments', amount: 1800000, percentage: 25 },
        { category: 'Bill Payments', amount: 1200000, percentage: 17 },
        { category: 'International', amount: 900000, percentage: 13 },
        { category: 'Card Top-ups', amount: 600000, percentage: 8 },
        { category: 'Other', amount: 150000, percentage: 2 }
      ];
      setCategoryData(categories);

      // Performance metrics
      const performance = [
        { metric: 'API Response', value: 95, target: 99 },
        { metric: 'Success Rate', value: 98.5, target: 99.9 },
        { metric: 'Uptime', value: 99.95, target: 99.99 },
        { metric: 'User Satisfaction', value: 92, target: 95 },
        { metric: 'Fraud Prevention', value: 99.8, target: 99.9 },
        { metric: 'KYC Completion', value: 88, target: 90 }
      ];
      setPerformanceData(performance);

      // Calculate metrics
      const totalRev = revenue.reduce((sum, d) => sum + d.revenue, 0);
      const totalTrans = revenue.reduce((sum, d) => sum + d.transactions, 0);
      
      setMetrics({
        totalRevenue: totalRev,
        totalTransactions: totalTrans,
        activeUsers: 15420,
        avgTransactionValue: totalRev / totalTrans,
        growthRate: 23.5,
        conversionRate: 68.4
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportData = () => {
    // Export functionality would go here
    console.log('Exporting analytics data...');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-500 mt-1">Comprehensive platform insights and metrics</p>
        </div>
        <div className="flex gap-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="90days">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={exportData}>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                <p className="text-2xl font-bold">
                  $<CountUp end={metrics.totalRevenue} duration={1.5} separator="," />
                </p>
                <p className="text-xs text-green-600 mt-1 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +{metrics.growthRate}% from last period
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Transactions</p>
                <p className="text-2xl font-bold">
                  <CountUp end={metrics.totalTransactions} duration={1.5} separator="," />
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Avg: ${metrics.avgTransactionValue.toFixed(2)}
                </p>
              </div>
              <CreditCard className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Active Users</p>
                <p className="text-2xl font-bold">
                  <CountUp end={metrics.activeUsers} duration={1.5} separator="," />
                </p>
                <p className="text-xs text-purple-600 mt-1">
                  {metrics.conversionRate}% conversion rate
                </p>
              </div>
              <Users className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="providers">Providers</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#3B82F6" 
                    fill="#3B82F6" 
                    fillOpacity={0.3}
                    name="Revenue ($)"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="fees" 
                    stroke="#10B981" 
                    fill="#10B981"
                    fillOpacity={0.3}
                    name="Fees ($)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Category Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="category" type="category" />
                  <Tooltip />
                  <Bar dataKey="amount" fill="#8B5CF6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transaction Volume by Provider (24h)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={transactionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="tempo" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    name="Tempo"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="circle" 
                    stroke="#8B5CF6" 
                    strokeWidth={2}
                    name="Circle"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="card" 
                    stroke="#10B981" 
                    strokeWidth={2}
                    name="Cards"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={userActivityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="newUsers" fill="#3B82F6" name="New Users" />
                  <Bar dataKey="activeUsers" fill="#10B981" name="Active Users" />
                  <Bar dataKey="churned" fill="#EF4444" name="Churned" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="providers" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Provider Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={providerData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${entry.value}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {providerData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Provider Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-blue-900">Tempo</p>
                      <p className="text-sm text-blue-700">100,000+ TPS • $0.0001 fee</p>
                    </div>
                    <span className="text-2xl font-bold text-blue-900">65%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-purple-900">Circle</p>
                      <p className="text-sm text-purple-700">1,000 TPS • $0.05 fee</p>
                    </div>
                    <span className="text-2xl font-bold text-purple-900">25%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-green-900">Cards</p>
                      <p className="text-sm text-green-700">Traditional rails</p>
                    </div>
                    <span className="text-2xl font-bold text-green-900">8%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={performanceData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="metric" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar 
                    name="Current" 
                    dataKey="value" 
                    stroke="#3B82F6" 
                    fill="#3B82F6" 
                    fillOpacity={0.6} 
                  />
                  <Radar 
                    name="Target" 
                    dataKey="target" 
                    stroke="#10B981" 
                    fill="#10B981" 
                    fillOpacity={0.3} 
                  />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}