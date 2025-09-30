'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  FileText, TrendingUp, TrendingDown, DollarSign,
  Calendar, Users, Wallet, AlertCircle, CheckCircle,
  Clock, ArrowUpRight, ArrowDownLeft, PieChart,
  BarChart3, LineChart, Download, RefreshCw
} from 'lucide-react'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

interface InvoiceAnalytics {
  totalInvoices: number
  totalRevenue: number
  totalPayables: number
  averageInvoiceValue: number
  paymentSuccessRate: number
  averageDaysToPay: number
  overdueAmount: number
  monthlyTrend: Array<{ month: string; inbound: number; outbound: number }>
  statusBreakdown: { [key: string]: number }
  topCustomers: Array<{ name: string; amount: number; count: number }>
  paymentMethods: { [key: string]: number }
  walletMetrics: {
    totalCreated: number
    activeCount: number
    conversionRate: number
    averageBalance: number
  }
}

export default function InvoiceAnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d')
  const [analytics, setAnalytics] = useState<InvoiceAnalytics>({
    totalInvoices: 156,
    totalRevenue: 1245600,
    totalPayables: 892300,
    averageInvoiceValue: 11234,
    paymentSuccessRate: 87.5,
    averageDaysToPay: 12,
    overdueAmount: 145000,
    monthlyTrend: [
      { month: 'Jan', inbound: 145000, outbound: 98000 },
      { month: 'Feb', inbound: 178000, outbound: 112000 },
      { month: 'Mar', inbound: 156000, outbound: 105000 },
      { month: 'Apr', inbound: 198000, outbound: 125000 },
      { month: 'May', inbound: 212000, outbound: 132000 },
      { month: 'Jun', inbound: 234000, outbound: 145000 }
    ],
    statusBreakdown: {
      paid: 89,
      pending: 38,
      overdue: 17,
      cancelled: 12
    },
    topCustomers: [
      { name: 'Acme Corporation', amount: 345000, count: 23 },
      { name: 'Global Services Ltd.', amount: 289000, count: 18 },
      { name: 'Tech Supplies Inc.', amount: 198000, count: 15 },
      { name: 'StartUp Ventures', amount: 167000, count: 12 },
      { name: 'Digital Solutions', amount: 145000, count: 9 }
    ],
    paymentMethods: {
      'USDC': 45,
      'USDT': 28,
      'USD': 20,
      'ETH': 7
    },
    walletMetrics: {
      totalCreated: 156,
      activeCount: 38,
      conversionRate: 72.5,
      averageBalance: 3456
    }
  })

  useEffect(() => {
    // Load analytics data
    loadAnalytics()
  }, [timeRange])

  const loadAnalytics = async () => {
    setLoading(true)
    // In production, this would fetch from API
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const lineChartData = {
    labels: analytics.monthlyTrend.map(m => m.month),
    datasets: [
      {
        label: 'Inbound (Receivables)',
        data: analytics.monthlyTrend.map(m => m.inbound),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
        fill: true
      },
      {
        label: 'Outbound (Payables)',
        data: analytics.monthlyTrend.map(m => m.outbound),
        borderColor: 'rgb(168, 85, 247)',
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  }

  const barChartData = {
    labels: analytics.topCustomers.map(c => c.name),
    datasets: [
      {
        label: 'Revenue',
        data: analytics.topCustomers.map(c => c.amount),
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(251, 146, 60, 0.8)',
          'rgba(239, 68, 68, 0.8)'
        ]
      }
    ]
  }

  const doughnutChartData = {
    labels: Object.keys(analytics.statusBreakdown).map(s => s.charAt(0).toUpperCase() + s.slice(1)),
    datasets: [
      {
        data: Object.values(analytics.statusBreakdown),
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(251, 191, 36, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(156, 163, 175, 0.8)'
        ]
      }
    ]
  }

  const paymentMethodChartData = {
    labels: Object.keys(analytics.paymentMethods),
    datasets: [
      {
        data: Object.values(analytics.paymentMethods),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(251, 146, 60, 0.8)'
        ]
      }
    ]
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Invoice Analytics
          </h1>
          <p className="text-gray-600 mt-1">
            Comprehensive insights into your invoice and payment performance
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={loadAnalytics}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="gradient">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Time Range Selector */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">Viewing data for:</p>
            <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as any)}>
              <TabsList>
                <TabsTrigger value="7d">7 Days</TabsTrigger>
                <TabsTrigger value="30d">30 Days</TabsTrigger>
                <TabsTrigger value="90d">90 Days</TabsTrigger>
                <TabsTrigger value="1y">1 Year</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(analytics.totalRevenue)}
                </p>
                <p className="text-xs text-gray-400 mt-1 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                  +12.5% from last period
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Payables</p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatCurrency(analytics.totalPayables)}
                </p>
                <p className="text-xs text-gray-400 mt-1 flex items-center">
                  <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
                  -5.3% from last period
                </p>
              </div>
              <ArrowUpRight className="h-8 w-8 text-purple-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Payment Success Rate</p>
                <p className="text-2xl font-bold">{analytics.paymentSuccessRate}%</p>
                <div className="mt-2">
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 transition-all"
                      style={{ width: `${analytics.paymentSuccessRate}%` }}
                    />
                  </div>
                </div>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Avg. Days to Pay</p>
                <p className="text-2xl font-bold">{analytics.averageDaysToPay}</p>
                <p className="text-xs text-gray-400 mt-1">
                  Industry avg: 18 days
                </p>
              </div>
              <Clock className="h-8 w-8 text-blue-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overdue Alert */}
      {analytics.overdueAmount > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="font-medium text-red-900">
                  {formatCurrency(analytics.overdueAmount)} in Overdue Invoices
                </p>
                <p className="text-sm text-red-700">
                  17 invoices are past their due date and require immediate attention
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="h-5 w-5" />
              Revenue Trend
            </CardTitle>
            <CardDescription>Monthly inbound vs outbound invoice values</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <Line
                data={lineChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom'
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: function(value) {
                          return '$' + (value as number / 1000) + 'K'
                        }
                      }
                    }
                  }
                }}
                height={250}
              />
            )}
          </CardContent>
        </Card>

        {/* Top Customers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Top Customers
            </CardTitle>
            <CardDescription>Revenue by customer</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <Bar
                data={barChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: function(value) {
                          return '$' + (value as number / 1000) + 'K'
                        }
                      }
                    }
                  }
                }}
                height={250}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Invoice Status
            </CardTitle>
            <CardDescription>Current status distribution</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-48 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <Doughnut
                data={doughnutChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom'
                    }
                  }
                }}
                height={200}
              />
            )}
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Payment Methods
            </CardTitle>
            <CardDescription>Distribution by currency</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-48 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <Doughnut
                data={paymentMethodChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom'
                    }
                  }
                }}
                height={200}
              />
            )}
          </CardContent>
        </Card>

        {/* Ephemeral Wallet Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Ephemeral Wallets
            </CardTitle>
            <CardDescription>Wallet performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600">Total Created</span>
                  <span className="font-semibold">{analytics.walletMetrics.totalCreated}</span>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600">Currently Active</span>
                  <Badge className="bg-green-100 text-green-800">
                    {analytics.walletMetrics.activeCount}
                  </Badge>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600">Conversion Rate</span>
                  <span className="font-semibold">{analytics.walletMetrics.conversionRate}%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all"
                    style={{ width: `${analytics.walletMetrics.conversionRate}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600">Avg. Balance</span>
                  <span className="font-semibold">{formatCurrency(analytics.walletMetrics.averageBalance)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customer List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Top Performing Customers
          </CardTitle>
          <CardDescription>Customers with highest transaction volumes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.topCustomers.map((customer, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{customer.name}</p>
                    <p className="text-sm text-gray-500">{customer.count} invoices</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatCurrency(customer.amount)}</p>
                  <p className="text-sm text-gray-500">
                    {((customer.amount / analytics.totalRevenue) * 100).toFixed(1)}% of revenue
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}