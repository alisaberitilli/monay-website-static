'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  TrendingUp, TrendingDown, DollarSign, Users, Building,
  Target, AlertCircle, CheckCircle, ArrowUp, ArrowDown,
  Activity, BarChart3, PieChart, Calendar, Download
} from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, PieChart as RePieChart, Pie,
  Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, AreaChart, Area
} from 'recharts'
import type {
  ProfitabilityMetrics,
  ExecutiveKPIs,
  UnitEconomics,
  FinancialDashboard
} from '@/types/financialAnalytics'

export default function KPIDashboardPage() {
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly')
  const [profitability, setProfitability] = useState<ProfitabilityMetrics | null>(null)
  const [kpis, setKpis] = useState<ExecutiveKPIs | null>(null)
  const [unitEconomics, setUnitEconomics] = useState<UnitEconomics | null>(null)
  const [dashboard, setDashboard] = useState<FinancialDashboard | null>(null)

  useEffect(() => {
    loadDashboardData()
  }, [timeframe])

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      // Mock data - replace with API calls
      const mockProfitability: ProfitabilityMetrics = {
        revenue: {
          mrr: 485000,
          arr: 5820000,
          transactionRevenue: 125000,
          interchangeRevenue: 35000,
          totalRevenue: 645000
        },
        costs: {
          infrastructure: 85000,
          paymentProcessing: 45000,
          kycKybVerification: 12000,
          cardIssuance: 8000,
          bankingFees: 15000,
          personnel: 180000,
          marketing: 35000,
          totalCosts: 380000
        },
        profitability: {
          grossProfit: 265000,
          grossMargin: 41.1, // Currently below 45% target
          operatingProfit: 185000,
          operatingMargin: 28.7,
          netProfit: 165000,
          netMargin: 25.6,
          ebitda: 195000
        },
        targets: {
          year1: {
            targetGrossMargin: 45,
            actualGrossMargin: 41.1,
            variance: -3.9,
            onTrack: false
          },
          year2: {
            targetGrossMargin: 65,
            actualGrossMargin: 0,
            variance: 0,
            onTrack: false
          },
          year3: {
            targetGrossMargin: 85,
            actualGrossMargin: 0,
            variance: 0,
            onTrack: false
          }
        }
      }

      const mockKPIs: ExecutiveKPIs = {
        growth: {
          revenueGrowth: {
            monthly: 15.2,
            quarterly: 48.5,
            yearly: 285.3
          },
          userGrowth: {
            monthly: 12.8,
            quarterly: 42.1,
            yearly: 215.6
          },
          organizationGrowth: {
            monthly: 8.5,
            quarterly: 28.3,
            yearly: 156.2
          }
        },
        financial: {
          runway: 18,
          burnRate: 215000,
          cashFlow: 185000,
          workingCapital: 3850000
        },
        customer: {
          totalOrganizations: 127,
          totalUsers: 15842,
          activeOrganizations: 118,
          activeUsers: 14256,
          nps: 68,
          csat: 4.2,
          churnRate: 2.3,
          retentionRate: 97.7
        },
        operational: {
          transactionVolume: 125000000,
          transactionCount: 485000,
          averageTransactionSize: 257.73,
          systemUptime: 99.95,
          apiResponseTime: 145,
          errorRate: 0.02
        }
      }

      const mockUnitEconomics: UnitEconomics = {
        perOrganization: {
          averageRevenue: 3818.90,
          averageCost: 2204.72,
          averageProfit: 1614.18,
          ltv: 125000,
          cac: 8500,
          ltvCacRatio: 14.7,
          paybackPeriod: 2.2
        },
        perUser: {
          averageRevenue: 30.65,
          averageCost: 17.68,
          averageProfit: 12.97,
          monthlyChurn: 1.8,
          annualChurn: 19.5
        },
        perTransaction: {
          averageRevenue: 1.33,
          averageCost: 0.78,
          averageProfit: 0.55,
          margin: 41.4
        }
      }

      setProfitability(mockProfitability)
      setKpis(mockKPIs)
      setUnitEconomics(mockUnitEconomics)
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Chart data for gross margin progress
  const marginProgressData = [
    { month: 'Jan', actual: 38.2, target: 45 },
    { month: 'Feb', actual: 39.1, target: 45 },
    { month: 'Mar', actual: 39.8, target: 45 },
    { month: 'Apr', actual: 40.3, target: 45 },
    { month: 'May', actual: 40.9, target: 45 },
    { month: 'Jun', actual: 41.1, target: 45 },
    { month: 'Jul', actual: 41.8, target: 45 },
    { month: 'Aug', actual: 42.3, target: 45 },
    { month: 'Sep', actual: 43.1, target: 45 },
    { month: 'Oct', actual: 41.1, target: 45 }
  ]

  // Revenue breakdown for pie chart
  const revenueBreakdown = [
    { name: 'Subscriptions', value: 485000, color: '#3B82F6' },
    { name: 'Transactions', value: 125000, color: '#8B5CF6' },
    { name: 'Interchange', value: 35000, color: '#10B981' }
  ]

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const formatPercent = (value: number): string => {
    return `${value.toFixed(1)}%`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const currentYear = new Date().getFullYear() - 2024 // Assuming platform started in 2024
  const targetMargin = currentYear === 1 ? 45 : currentYear === 2 ? 65 : 85

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Executive KPI Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Key performance indicators and profitability metrics
          </p>
        </div>
        <div className="flex gap-3">
          <select
            className="px-4 py-2 border rounded-lg"
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value as any)}
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Profitability Target Alert */}
      {profitability && !profitability.targets.year1.onTrack && (
        <Alert className="bg-yellow-50 border-yellow-200">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Gross Margin Below Target:</strong> Current margin is {profitability.profitability.grossMargin.toFixed(1)}%,
            target is {targetMargin}%. Need to improve by {Math.abs(profitability.targets.year1.variance).toFixed(1)} percentage points.
          </AlertDescription>
        </Alert>
      )}

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-lg bg-green-100">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <Badge className="bg-green-100 text-green-800">
                <ArrowUp className="h-3 w-3 mr-1" />
                {kpis?.growth.revenueGrowth.monthly.toFixed(1)}%
              </Badge>
            </div>
            <p className="text-sm text-gray-500">Monthly Recurring Revenue</p>
            <p className="text-2xl font-bold">{formatCurrency(profitability?.revenue.mrr || 0)}</p>
            <p className="text-sm text-gray-500 mt-1">
              ARR: {formatCurrency(profitability?.revenue.arr || 0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-lg bg-blue-100">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              {profitability && (
                <Badge className={
                  profitability.targets.year1.onTrack
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }>
                  {profitability.targets.year1.onTrack ? 'ON TRACK' : 'BELOW TARGET'}
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-500">Gross Margin (Target: {targetMargin}%)</p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold">
                {profitability?.profitability.grossMargin.toFixed(1)}%
              </p>
              <span className="text-sm text-red-600">
                ({profitability?.targets.year1.variance.toFixed(1)}%)
              </span>
            </div>
            <Progress
              value={(profitability?.profitability.grossMargin || 0) / targetMargin * 100}
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-lg bg-purple-100">
                <Building className="h-6 w-6 text-purple-600" />
              </div>
              <Badge className="bg-purple-100 text-purple-800">
                <ArrowUp className="h-3 w-3 mr-1" />
                {kpis?.growth.organizationGrowth.monthly.toFixed(1)}%
              </Badge>
            </div>
            <p className="text-sm text-gray-500">Total Organizations</p>
            <p className="text-2xl font-bold">{kpis?.customer.totalOrganizations || 0}</p>
            <p className="text-sm text-gray-500 mt-1">
              Active: {kpis?.customer.activeOrganizations || 0} ({((kpis?.customer.activeOrganizations || 0) / (kpis?.customer.totalOrganizations || 1) * 100).toFixed(0)}%)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-lg bg-orange-100">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
              <Badge className="bg-orange-100 text-orange-800">
                <ArrowUp className="h-3 w-3 mr-1" />
                {kpis?.growth.userGrowth.monthly.toFixed(1)}%
              </Badge>
            </div>
            <p className="text-sm text-gray-500">Total Users</p>
            <p className="text-2xl font-bold">{kpis?.customer.totalUsers.toLocaleString() || 0}</p>
            <p className="text-sm text-gray-500 mt-1">
              Active: {kpis?.customer.activeUsers.toLocaleString() || 0} ({((kpis?.customer.activeUsers || 0) / (kpis?.customer.totalUsers || 1) * 100).toFixed(0)}%)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="profitability" className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="profitability">Profitability</TabsTrigger>
          <TabsTrigger value="unit-economics">Unit Economics</TabsTrigger>
          <TabsTrigger value="growth">Growth Metrics</TabsTrigger>
          <TabsTrigger value="operational">Operational KPIs</TabsTrigger>
        </TabsList>

        <TabsContent value="profitability" className="space-y-4">
          {/* Gross Margin Progress Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Gross Margin Progress vs Target</CardTitle>
              <CardDescription>
                Tracking towards {targetMargin}% gross margin target (Year {currentYear})
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={marginProgressData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[30, 50]} />
                  <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="actual"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    name="Actual Margin"
                  />
                  <Line
                    type="monotone"
                    dataKey="target"
                    stroke="#EF4444"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Target Margin"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Revenue Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Breakdown</CardTitle>
                <CardDescription>
                  Total Revenue: {formatCurrency(profitability?.revenue.totalRevenue || 0)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <RePieChart>
                    <Pie
                      data={revenueBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${formatCurrency(entry.value)}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {revenueBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  </RePieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Cost Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Cost Centers</CardTitle>
                <CardDescription>
                  Total Costs: {formatCurrency(profitability?.costs.totalCosts || 0)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Personnel</span>
                    <div className="flex items-center gap-2">
                      <Progress value={47} className="w-24" />
                      <span className="text-sm font-medium">
                        {formatCurrency(profitability?.costs.personnel || 0)}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Infrastructure</span>
                    <div className="flex items-center gap-2">
                      <Progress value={22} className="w-24" />
                      <span className="text-sm font-medium">
                        {formatCurrency(profitability?.costs.infrastructure || 0)}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Payment Processing</span>
                    <div className="flex items-center gap-2">
                      <Progress value={12} className="w-24" />
                      <span className="text-sm font-medium">
                        {formatCurrency(profitability?.costs.paymentProcessing || 0)}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">KYC/KYB Verification</span>
                    <div className="flex items-center gap-2">
                      <Progress value={3} className="w-24" />
                      <span className="text-sm font-medium">
                        {formatCurrency(profitability?.costs.kycKybVerification || 0)}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Other Costs</span>
                    <div className="flex items-center gap-2">
                      <Progress value={16} className="w-24" />
                      <span className="text-sm font-medium">
                        {formatCurrency(
                          (profitability?.costs.cardIssuance || 0) +
                          (profitability?.costs.bankingFees || 0) +
                          (profitability?.costs.marketing || 0)
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profitability Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Profitability Summary</CardTitle>
              <CardDescription>
                Current period financial performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-sm text-gray-500">Gross Profit</p>
                  <p className="text-xl font-bold">
                    {formatCurrency(profitability?.profitability.grossProfit || 0)}
                  </p>
                  <p className="text-sm text-gray-500">
                    Margin: {profitability?.profitability.grossMargin.toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Operating Profit</p>
                  <p className="text-xl font-bold">
                    {formatCurrency(profitability?.profitability.operatingProfit || 0)}
                  </p>
                  <p className="text-sm text-gray-500">
                    Margin: {profitability?.profitability.operatingMargin.toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Net Profit</p>
                  <p className="text-xl font-bold">
                    {formatCurrency(profitability?.profitability.netProfit || 0)}
                  </p>
                  <p className="text-sm text-gray-500">
                    Margin: {profitability?.profitability.netMargin.toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">EBITDA</p>
                  <p className="text-xl font-bold">
                    {formatCurrency(profitability?.profitability.ebitda || 0)}
                  </p>
                  <p className="text-sm text-gray-500">
                    Margin: {((profitability?.profitability.ebitda || 0) / (profitability?.revenue.totalRevenue || 1) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="unit-economics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Per Organization */}
            <Card>
              <CardHeader>
                <CardTitle>Per Organization</CardTitle>
                <CardDescription>Unit economics at org level</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Average Revenue (ARPU)</p>
                    <p className="text-xl font-bold">
                      {formatCurrency(unitEconomics?.perOrganization.averageRevenue || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Average Cost</p>
                    <p className="text-xl font-bold">
                      {formatCurrency(unitEconomics?.perOrganization.averageCost || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Average Profit</p>
                    <p className="text-xl font-bold text-green-600">
                      {formatCurrency(unitEconomics?.perOrganization.averageProfit || 0)}
                    </p>
                  </div>
                  <div className="pt-4 border-t">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-500">LTV</span>
                      <span className="font-medium">
                        {formatCurrency(unitEconomics?.perOrganization.ltv || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-500">CAC</span>
                      <span className="font-medium">
                        {formatCurrency(unitEconomics?.perOrganization.cac || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-500">LTV/CAC Ratio</span>
                      <span className="font-medium">
                        {unitEconomics?.perOrganization.ltvCacRatio.toFixed(1)}x
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Payback Period</span>
                      <span className="font-medium">
                        {unitEconomics?.perOrganization.paybackPeriod.toFixed(1)} months
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Per User */}
            <Card>
              <CardHeader>
                <CardTitle>Per User</CardTitle>
                <CardDescription>Unit economics at user level</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Average Revenue</p>
                    <p className="text-xl font-bold">
                      {formatCurrency(unitEconomics?.perUser.averageRevenue || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Average Cost</p>
                    <p className="text-xl font-bold">
                      {formatCurrency(unitEconomics?.perUser.averageCost || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Average Profit</p>
                    <p className="text-xl font-bold text-green-600">
                      {formatCurrency(unitEconomics?.perUser.averageProfit || 0)}
                    </p>
                  </div>
                  <div className="pt-4 border-t">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-500">Monthly Churn</span>
                      <span className="font-medium">
                        {unitEconomics?.perUser.monthlyChurn.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Annual Churn</span>
                      <span className="font-medium">
                        {unitEconomics?.perUser.annualChurn.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Per Transaction */}
            <Card>
              <CardHeader>
                <CardTitle>Per Transaction</CardTitle>
                <CardDescription>Unit economics at transaction level</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Average Revenue</p>
                    <p className="text-xl font-bold">
                      ${unitEconomics?.perTransaction.averageRevenue.toFixed(2) || '0.00'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Average Cost</p>
                    <p className="text-xl font-bold">
                      ${unitEconomics?.perTransaction.averageCost.toFixed(2) || '0.00'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Average Profit</p>
                    <p className="text-xl font-bold text-green-600">
                      ${unitEconomics?.perTransaction.averageProfit.toFixed(2) || '0.00'}
                    </p>
                  </div>
                  <div className="pt-4 border-t">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Margin</span>
                      <span className="font-medium">
                        {unitEconomics?.perTransaction.margin.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="growth" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Growth</CardTitle>
                <CardDescription>Period over period growth</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Monthly</p>
                    <p className="text-2xl font-bold text-green-600">
                      +{kpis?.growth.revenueGrowth.monthly.toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Quarterly</p>
                    <p className="text-2xl font-bold text-green-600">
                      +{kpis?.growth.revenueGrowth.quarterly.toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Yearly</p>
                    <p className="text-2xl font-bold text-green-600">
                      +{kpis?.growth.revenueGrowth.yearly.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Customer Growth</CardTitle>
                <CardDescription>Organization acquisition</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Monthly</p>
                    <p className="text-2xl font-bold text-blue-600">
                      +{kpis?.growth.organizationGrowth.monthly.toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Quarterly</p>
                    <p className="text-2xl font-bold text-blue-600">
                      +{kpis?.growth.organizationGrowth.quarterly.toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Yearly</p>
                    <p className="text-2xl font-bold text-blue-600">
                      +{kpis?.growth.organizationGrowth.yearly.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
                <CardDescription>User base expansion</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Monthly</p>
                    <p className="text-2xl font-bold text-purple-600">
                      +{kpis?.growth.userGrowth.monthly.toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Quarterly</p>
                    <p className="text-2xl font-bold text-purple-600">
                      +{kpis?.growth.userGrowth.quarterly.toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Yearly</p>
                    <p className="text-2xl font-bold text-purple-600">
                      +{kpis?.growth.userGrowth.yearly.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Customer Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Metrics</CardTitle>
              <CardDescription>Satisfaction and retention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-sm text-gray-500">NPS Score</p>
                  <p className="text-2xl font-bold">{kpis?.customer.nps || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">CSAT</p>
                  <p className="text-2xl font-bold">{kpis?.customer.csat || 0}/5</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Retention Rate</p>
                  <p className="text-2xl font-bold">{kpis?.customer.retentionRate || 0}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Churn Rate</p>
                  <p className="text-2xl font-bold text-red-600">{kpis?.customer.churnRate || 0}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="operational" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Financial Health */}
            <Card>
              <CardHeader>
                <CardTitle>Financial Health</CardTitle>
                <CardDescription>Key financial indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Runway</span>
                    <span className="text-xl font-bold">{kpis?.financial.runway || 0} months</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Burn Rate</span>
                    <span className="text-xl font-bold">
                      {formatCurrency(kpis?.financial.burnRate || 0)}/mo
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Cash Flow</span>
                    <span className="text-xl font-bold text-green-600">
                      {formatCurrency(kpis?.financial.cashFlow || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Working Capital</span>
                    <span className="text-xl font-bold">
                      {formatCurrency(kpis?.financial.workingCapital || 0)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* System Performance */}
            <Card>
              <CardHeader>
                <CardTitle>System Performance</CardTitle>
                <CardDescription>Platform operational metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">System Uptime</span>
                    <span className="text-xl font-bold text-green-600">
                      {kpis?.operational.systemUptime || 0}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">API Response Time</span>
                    <span className="text-xl font-bold">
                      {kpis?.operational.apiResponseTime || 0}ms
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Error Rate</span>
                    <span className="text-xl font-bold">
                      {kpis?.operational.errorRate || 0}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Transaction Volume</span>
                    <span className="text-xl font-bold">
                      {formatCurrency(kpis?.operational.transactionVolume || 0)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}