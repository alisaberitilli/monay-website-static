'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DollarSign, TrendingUp, TrendingDown, Users, Building,
  Shield, AlertCircle, CheckCircle, ArrowUp, ArrowDown,
  Calendar, Download, Filter, RefreshCw, CreditCard
} from 'lucide-react'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, AreaChart, Area
} from 'recharts'
import type {
  VerificationCost,
  VerificationAnalytics,
  VerificationProvider,
  OrganizationSubscription
} from '@/types/financialAnalytics'

export default function KYCKYBCostsPage() {
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly')
  const [verificationCosts, setVerificationCosts] = useState<VerificationCost[]>([])
  const [analytics, setAnalytics] = useState<VerificationAnalytics | null>(null)
  const [costlyOrgs, setCostlyOrgs] = useState<any[]>([])

  useEffect(() => {
    loadVerificationCosts()
  }, [timeframe])

  const loadVerificationCosts = async () => {
    setLoading(true)
    try {
      // Mock data - replace with API calls
      const mockCosts: VerificationCost[] = [
        {
          id: 'persona',
          provider: 'persona',
          type: 'kyc',
          costs: {
            perVerification: 3.50,
            perDocument: 0.50,
            perCheck: 0.25,
            monthlyMinimum: 500,
            currency: 'USD'
          },
          volumeDiscounts: [
            { threshold: 1000, discountPercent: 10 },
            { threshold: 5000, discountPercent: 20 },
            { threshold: 10000, discountPercent: 30 }
          ],
          currentMonth: {
            verifications: 2847,
            totalCost: 8541.00,
            averageCost: 3.00
          },
          lastMonth: {
            verifications: 2456,
            totalCost: 7852.00,
            averageCost: 3.20
          }
        },
        {
          id: 'alloy',
          provider: 'alloy',
          type: 'kyb',
          costs: {
            perVerification: 15.00,
            perDocument: 2.00,
            perCheck: 1.00,
            monthlyMinimum: 1000,
            currency: 'USD'
          },
          currentMonth: {
            verifications: 127,
            totalCost: 2159.00,
            averageCost: 17.00
          },
          lastMonth: {
            verifications: 98,
            totalCost: 1764.00,
            averageCost: 18.00
          }
        },
        {
          id: 'onfido',
          provider: 'onfido',
          type: 'kyc',
          costs: {
            perVerification: 4.00,
            perDocument: 0.75,
            perCheck: 0.35,
            currency: 'USD'
          },
          currentMonth: {
            verifications: 456,
            totalCost: 2052.00,
            averageCost: 4.50
          },
          lastMonth: {
            verifications: 389,
            totalCost: 1945.00,
            averageCost: 5.00
          }
        }
      ]

      const mockAnalytics: VerificationAnalytics = {
        totalVerifications: 3430,
        totalCost: 12752.00,
        averageCostPerVerification: 3.72,
        byType: {
          kyc: {
            count: 3303,
            cost: 10593.00,
            successRate: 94.2
          },
          kyb: {
            count: 127,
            cost: 2159.00,
            successRate: 89.7
          }
        },
        byProvider: {
          persona: {
            count: 2847,
            cost: 8541.00,
            successRate: 95.1,
            averageTime: 3.2
          },
          alloy: {
            count: 127,
            cost: 2159.00,
            successRate: 89.7,
            averageTime: 5.8
          },
          onfido: {
            count: 456,
            cost: 2052.00,
            successRate: 92.3,
            averageTime: 4.1
          },
          jumio: {
            count: 0,
            cost: 0,
            successRate: 0,
            averageTime: 0
          },
          sumsub: {
            count: 0,
            cost: 0,
            successRate: 0,
            averageTime: 0
          }
        },
        topCostlyOrganizations: [
          {
            organizationId: 'org-001',
            organizationName: 'TechCorp Inc',
            verifications: 245,
            totalCost: 4165.00
          },
          {
            organizationId: 'org-002',
            organizationName: 'Global Finance LLC',
            verifications: 189,
            totalCost: 3213.00
          },
          {
            organizationId: 'org-003',
            organizationName: 'Healthcare Plus',
            verifications: 156,
            totalCost: 2652.00
          },
          {
            organizationId: 'org-004',
            organizationName: 'EduTech Solutions',
            verifications: 98,
            totalCost: 1666.00
          },
          {
            organizationId: 'org-005',
            organizationName: 'RetailChain Corp',
            verifications: 87,
            totalCost: 1479.00
          }
        ]
      }

      setVerificationCosts(mockCosts)
      setAnalytics(mockAnalytics)
      setCostlyOrgs(mockAnalytics.topCostlyOrganizations)
    } catch (error) {
      console.error('Failed to load verification costs:', error)
    } finally {
      setLoading(false)
    }
  }

  // Monthly cost trend data
  const costTrendData = [
    { month: 'Jan', kyc: 8234, kyb: 1456, total: 9690 },
    { month: 'Feb', kyc: 8567, kyb: 1523, total: 10090 },
    { month: 'Mar', kyc: 9123, kyb: 1687, total: 10810 },
    { month: 'Apr', kyc: 9456, kyb: 1789, total: 11245 },
    { month: 'May', kyc: 9789, kyb: 1856, total: 11645 },
    { month: 'Jun', kyc: 10234, kyb: 1923, total: 12157 },
    { month: 'Jul', kyc: 10567, kyb: 1989, total: 12556 },
    { month: 'Aug', kyc: 10123, kyb: 2045, total: 12168 },
    { month: 'Sep', kyc: 10456, kyb: 2123, total: 12579 },
    { month: 'Oct', kyc: 10593, kyb: 2159, total: 12752 }
  ]

  // Provider cost breakdown for pie chart
  const providerBreakdown = [
    { name: 'Persona', value: 8541, color: '#3B82F6' },
    { name: 'Alloy', value: 2159, color: '#8B5CF6' },
    { name: 'Onfido', value: 2052, color: '#10B981' }
  ]

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value)
  }

  const calculateCostPerOrg = (): number => {
    if (!analytics) return 0
    return analytics.totalCost / 127 // Assuming 127 organizations
  }

  const calculateCostPerUser = (): number => {
    if (!analytics) return 0
    return analytics.totalCost / 15842 // Assuming 15,842 users
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">KYC/KYB Cost Tracking</h1>
          <p className="text-gray-600 mt-1">
            Monitor and optimize verification costs across providers
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
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button className="bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Cost Alert */}
      {analytics && analytics.totalCost > 12000 && (
        <Alert className="bg-yellow-50 border-yellow-200">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Cost Alert:</strong> KYC/KYB verification costs are {formatCurrency(analytics.totalCost - 12000)} over budget this month.
            Consider negotiating volume discounts with providers.
          </AlertDescription>
        </Alert>
      )}

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="h-8 w-8 text-blue-500 opacity-20" />
              <Badge className="bg-red-100 text-red-800">
                <ArrowUp className="h-3 w-3 mr-1" />
                16%
              </Badge>
            </div>
            <p className="text-sm text-gray-500">Total Monthly Cost</p>
            <p className="text-2xl font-bold">{formatCurrency(analytics?.totalCost || 0)}</p>
            <p className="text-sm text-gray-500 mt-1">
              Budget: {formatCurrency(12000)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Shield className="h-8 w-8 text-purple-500 opacity-20" />
              <Badge className="bg-green-100 text-green-800">
                <ArrowDown className="h-3 w-3 mr-1" />
                8%
              </Badge>
            </div>
            <p className="text-sm text-gray-500">Avg Cost per Verification</p>
            <p className="text-2xl font-bold">
              {formatCurrency(analytics?.averageCostPerVerification || 0)}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Target: {formatCurrency(4.00)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Users className="h-8 w-8 text-green-500 opacity-20" />
            </div>
            <p className="text-sm text-gray-500">KYC Verifications</p>
            <p className="text-2xl font-bold">{analytics?.byType.kyc.count.toLocaleString()}</p>
            <p className="text-sm text-gray-500 mt-1">
              Cost: {formatCurrency(analytics?.byType.kyc.cost || 0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Building className="h-8 w-8 text-orange-500 opacity-20" />
            </div>
            <p className="text-sm text-gray-500">KYB Verifications</p>
            <p className="text-2xl font-bold">{analytics?.byType.kyb.count.toLocaleString()}</p>
            <p className="text-sm text-gray-500 mt-1">
              Cost: {formatCurrency(analytics?.byType.kyb.cost || 0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <CreditCard className="h-8 w-8 text-indigo-500 opacity-20" />
            </div>
            <p className="text-sm text-gray-500">Cost per Organization</p>
            <p className="text-2xl font-bold">{formatCurrency(calculateCostPerOrg())}</p>
            <p className="text-sm text-gray-500 mt-1">
              Per User: {formatCurrency(calculateCostPerUser())}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="providers">Provider Analysis</TabsTrigger>
          <TabsTrigger value="organizations">Organization Costs</TabsTrigger>
          <TabsTrigger value="optimization">Cost Optimization</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Cost Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Cost Trend</CardTitle>
              <CardDescription>
                KYC and KYB verification costs over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={costTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="kyc"
                    stackId="1"
                    stroke="#3B82F6"
                    fill="#3B82F6"
                    fillOpacity={0.6}
                    name="KYC Costs"
                  />
                  <Area
                    type="monotone"
                    dataKey="kyb"
                    stackId="1"
                    stroke="#8B5CF6"
                    fill="#8B5CF6"
                    fillOpacity={0.6}
                    name="KYB Costs"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Provider Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Provider Cost Breakdown</CardTitle>
                <CardDescription>
                  Current month costs by provider
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={providerBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${formatCurrency(entry.value)}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {providerBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Success Rates */}
            <Card>
              <CardHeader>
                <CardTitle>Provider Success Rates</CardTitle>
                <CardDescription>
                  Verification success rates by provider
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['persona', 'alloy', 'onfido'].map((provider) => {
                    const data = analytics?.byProvider[provider as VerificationProvider]
                    if (!data || data.count === 0) return null
                    return (
                      <div key={provider} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium capitalize">{provider}</span>
                          <span className="text-sm text-gray-500">
                            {data.successRate.toFixed(1)}%
                          </span>
                        </div>
                        <Progress value={data.successRate} className="h-2" />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>{data.count} verifications</span>
                          <span>Avg time: {data.averageTime.toFixed(1)}min</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="providers" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {verificationCosts.map((provider) => (
              <Card key={provider.id}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="capitalize">{provider.provider}</CardTitle>
                    <Badge>{provider.type.toUpperCase()}</Badge>
                  </div>
                  <CardDescription>
                    Provider cost analysis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">Cost Structure</p>
                      <div className="space-y-1 mt-2">
                        <div className="flex justify-between text-sm">
                          <span>Per Verification</span>
                          <span className="font-medium">
                            {formatCurrency(provider.costs.perVerification)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Per Document</span>
                          <span className="font-medium">
                            {formatCurrency(provider.costs.perDocument)}
                          </span>
                        </div>
                        {provider.costs.monthlyMinimum && (
                          <div className="flex justify-between text-sm">
                            <span>Monthly Minimum</span>
                            <span className="font-medium">
                              {formatCurrency(provider.costs.monthlyMinimum)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t">
                      <p className="text-sm text-gray-500 mb-2">Current Month</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-gray-500">Verifications</p>
                          <p className="text-lg font-bold">
                            {provider.currentMonth.verifications.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Total Cost</p>
                          <p className="text-lg font-bold">
                            {formatCurrency(provider.currentMonth.totalCost)}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-xs text-gray-500">Avg Cost</p>
                        <p className="font-medium">
                          {formatCurrency(provider.currentMonth.averageCost)}
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">vs Last Month</span>
                        {provider.currentMonth.totalCost > provider.lastMonth.totalCost ? (
                          <Badge className="bg-red-100 text-red-800">
                            <ArrowUp className="h-3 w-3 mr-1" />
                            {((provider.currentMonth.totalCost - provider.lastMonth.totalCost) / provider.lastMonth.totalCost * 100).toFixed(0)}%
                          </Badge>
                        ) : (
                          <Badge className="bg-green-100 text-green-800">
                            <ArrowDown className="h-3 w-3 mr-1" />
                            {((provider.lastMonth.totalCost - provider.currentMonth.totalCost) / provider.lastMonth.totalCost * 100).toFixed(0)}%
                          </Badge>
                        )}
                      </div>
                    </div>

                    {provider.volumeDiscounts && provider.volumeDiscounts.length > 0 && (
                      <div className="pt-3 border-t">
                        <p className="text-sm text-gray-500 mb-2">Volume Discounts</p>
                        <div className="space-y-1">
                          {provider.volumeDiscounts.map((discount, idx) => (
                            <div key={idx} className="flex justify-between text-xs">
                              <span>{discount.threshold.toLocaleString()}+ verif.</span>
                              <Badge variant="outline" className="text-xs">
                                -{discount.discountPercent}%
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="organizations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Organizations by Verification Costs</CardTitle>
              <CardDescription>
                Organizations with highest KYC/KYB expenses this month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {costlyOrgs.map((org, index) => (
                  <div key={org.organizationId} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                        index === 0 ? 'bg-yellow-500' :
                        index === 1 ? 'bg-gray-400' :
                        index === 2 ? 'bg-orange-600' :
                        'bg-gray-600'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{org.organizationName}</p>
                        <p className="text-sm text-gray-500">
                          {org.verifications} verifications
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatCurrency(org.totalCost)}</p>
                      <p className="text-sm text-gray-500">
                        Avg: {formatCurrency(org.totalCost / org.verifications)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Organization Cost Summary</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Total Organizations</p>
                    <p className="font-bold">127</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Avg Cost per Org</p>
                    <p className="font-bold">{formatCurrency(calculateCostPerOrg())}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Highest Cost Org</p>
                    <p className="font-bold">{formatCurrency(4165)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Lowest Cost Org</p>
                    <p className="font-bold">{formatCurrency(15)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cost Optimization Opportunities</CardTitle>
              <CardDescription>
                Recommendations to reduce verification costs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert className="border-green-200 bg-green-50">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    <strong>Volume Discount Available:</strong> Increase Persona verifications by 153 this month
                    to reach 3,000 and unlock 10% discount, saving ~{formatCurrency(854)}/month.
                  </AlertDescription>
                </Alert>

                <Alert className="border-blue-200 bg-blue-50">
                  <TrendingDown className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    <strong>Provider Optimization:</strong> Switching 20% of Onfido verifications to Persona
                    could save ~{formatCurrency(182)}/month based on current rates.
                  </AlertDescription>
                </Alert>

                <Alert className="border-yellow-200 bg-yellow-50">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-800">
                    <strong>Failed Verification Costs:</strong> 5.8% of verifications fail, costing ~{formatCurrency(740)}/month.
                    Improving pre-screening could reduce these costs.
                  </AlertDescription>
                </Alert>

                <div className="mt-6">
                  <h4 className="font-medium mb-3">Recommended Actions</h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="font-medium">Negotiate Volume Discounts</p>
                        <p className="text-sm text-gray-600">
                          Current volume justifies 15-20% discount negotiations with Persona
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="font-medium">Implement Smart Routing</p>
                        <p className="text-sm text-gray-600">
                          Route verifications to lowest-cost provider based on requirements
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="font-medium">Batch Processing</p>
                        <p className="text-sm text-gray-600">
                          Batch KYB verifications to maximize bulk pricing benefits
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="font-medium">Pre-Verification Screening</p>
                        <p className="text-sm text-gray-600">
                          Add pre-checks to reduce failed verification attempts
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium mb-2">Potential Monthly Savings</h4>
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(1958)}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    ~15% reduction in total verification costs
                  </p>
                  <Button className="mt-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600">
                    Implement Optimizations
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}