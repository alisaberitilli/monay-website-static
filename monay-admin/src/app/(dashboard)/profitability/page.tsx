'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  AlertTriangle,
  CheckCircle,
  Activity,
  Calculator,
  Briefcase,
  ShoppingCart,
  CreditCard,
  Users,
  Building,
  FileText,
  ArrowUp,
  ArrowDown
} from 'lucide-react'
import type {
  ProfitabilityMetrics,
  UnitEconomics,
  CostCenter,
  RevenueAnalytics,
  FinancialForecast
} from '@/types/financialAnalytics'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

export default function ProfitabilityAnalytics() {
  const [profitability, setProfitability] = useState<ProfitabilityMetrics | null>(null)
  const [unitEconomics, setUnitEconomics] = useState<UnitEconomics | null>(null)
  const [costCenters, setCostCenters] = useState<CostCenter[]>([])
  const [revenueAnalytics, setRevenueAnalytics] = useState<RevenueAnalytics | null>(null)
  const [forecast, setForecast] = useState<FinancialForecast | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'quarter' | 'year'>('month')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProfitabilityData()
  }, [selectedPeriod])

  const fetchProfitabilityData = async () => {
    setLoading(true)
    try {
      // Mock data - replace with actual API calls
      setProfitability({
        revenue: {
          mrr: 2850000,
          arr: 34200000,
          transactionRevenue: 450000,
          interchangeRevenue: 125000,
          totalRevenue: 3425000
        },
        costs: {
          infrastructure: 485000,
          paymentProcessing: 215000,
          kycKybVerification: 95000,
          cardIssuance: 75000,
          bankingFees: 125000,
          personnel: 650000,
          marketing: 180000,
          totalCosts: 1825000
        },
        profitability: {
          grossProfit: 1600000,
          grossMargin: 46.7, // First year target: 45%
          operatingProfit: 970000,
          operatingMargin: 28.3,
          netProfit: 776000,
          netMargin: 22.6,
          ebitda: 1050000
        },
        targets: {
          year1: {
            targetGrossMargin: 45,
            actualGrossMargin: 46.7,
            variance: 1.7,
            onTrack: true
          },
          year2: {
            targetGrossMargin: 65,
            actualGrossMargin: 46.7,
            variance: -18.3,
            onTrack: false
          },
          year3: {
            targetGrossMargin: 85,
            actualGrossMargin: 46.7,
            variance: -38.3,
            onTrack: false
          }
        }
      })

      setUnitEconomics({
        perOrganization: {
          averageRevenue: 8500,
          averageCost: 4250,
          averageProfit: 4250,
          ltv: 125000,
          cac: 2500,
          ltvCacRatio: 50,
          paybackPeriod: 3.2
        },
        perUser: {
          averageRevenue: 125,
          averageCost: 45,
          averageProfit: 80,
          monthlyChurn: 2.5,
          annualChurn: 28
        },
        perTransaction: {
          averageRevenue: 2.85,
          averageCost: 1.15,
          averageProfit: 1.70,
          margin: 59.6
        }
      })

      setCostCenters([
        {
          id: '1',
          name: 'Infrastructure & Cloud',
          category: 'infrastructure',
          current: {
            budget: 500000,
            actual: 485000,
            variance: 15000,
            percentOfBudget: 97
          },
          ytd: {
            budget: 6000000,
            actual: 5820000,
            variance: 180000,
            percentOfBudget: 97
          },
          breakdown: [
            { item: 'AWS Services', amount: 285000, percentage: 58.8, trend: 'up' },
            { item: 'Database & Storage', amount: 125000, percentage: 25.8, trend: 'stable' },
            { item: 'CDN & Networking', amount: 75000, percentage: 15.4, trend: 'down' }
          ]
        },
        {
          id: '2',
          name: 'Payment Partners',
          category: 'partners',
          current: {
            budget: 450000,
            actual: 415000,
            variance: 35000,
            percentOfBudget: 92.2
          },
          ytd: {
            budget: 5400000,
            actual: 4980000,
            variance: 420000,
            percentOfBudget: 92.2
          },
          breakdown: [
            { item: 'Processing Fees', amount: 215000, percentage: 51.8, trend: 'up' },
            { item: 'Banking Fees', amount: 125000, percentage: 30.1, trend: 'stable' },
            { item: 'Card Network Fees', amount: 75000, percentage: 18.1, trend: 'up' }
          ]
        }
      ])

      setRevenueAnalytics({
        byProduct: {
          subscriptions: 2850000,
          transactions: 450000,
          interchange: 125000,
          apiUsage: 0,
          customFeatures: 0
        },
        byOrgType: {
          enterprise: { revenue: 1850000, percentage: 54, growth: 15 },
          government: { revenue: 685000, percentage: 20, growth: 8 },
          financial: { revenue: 514000, percentage: 15, growth: 22 },
          healthcare: { revenue: 240000, percentage: 7, growth: 18 },
          education: { revenue: 136000, percentage: 4, growth: 12 }
        },
        byGeography: [
          { region: 'North America', revenue: 2397500, percentage: 70, growth: 18 },
          { region: 'Europe', revenue: 685000, percentage: 20, growth: 12 },
          { region: 'Asia Pacific', revenue: 342500, percentage: 10, growth: 25 }
        ],
        byCohort: [
          { cohort: '2024-Q1', organizations: 45, revenue: 450000, retention: 92, ltv: 125000 },
          { cohort: '2024-Q2', organizations: 62, revenue: 620000, retention: 88, ltv: 115000 },
          { cohort: '2024-Q3', organizations: 78, revenue: 780000, retention: 85, ltv: 105000 },
          { cohort: '2024-Q4', organizations: 95, revenue: 950000, retention: 82, ltv: 95000 }
        ]
      })

      setForecast({
        period: '2025-Q1',
        projectedRevenue: {
          conservative: 3800000,
          expected: 4200000,
          optimistic: 4600000
        },
        projectedCosts: {
          conservative: 2100000,
          expected: 1950000,
          optimistic: 1800000
        },
        projectedProfitability: {
          grossMargin: 52,
          operatingMargin: 32,
          netMargin: 25
        },
        assumptions: {
          newOrganizations: 120,
          churnRate: 2.5,
          averageRevenue: 9500,
          costGrowth: 8
        }
      })
    } catch (error) {
      console.error('Failed to fetch profitability data:', error)
    }
    setLoading(false)
  }

  const marginProgressData = {
    labels: ['Year 1', 'Year 2', 'Year 3'],
    datasets: [
      {
        label: 'Target Gross Margin %',
        data: [45, 65, 85],
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        borderDash: [5, 5]
      },
      {
        label: 'Actual Gross Margin %',
        data: [46.7, 46.7, 46.7], // Current margin applied to all years
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)'
      }
    ]
  }

  const revenueBreakdownData = {
    labels: ['Subscriptions', 'Transactions', 'Interchange'],
    datasets: [{
      data: [
        profitability?.revenue.mrr || 0,
        profitability?.revenue.transactionRevenue || 0,
        profitability?.revenue.interchangeRevenue || 0
      ],
      backgroundColor: [
        'rgba(99, 102, 241, 0.8)',
        'rgba(34, 197, 94, 0.8)',
        'rgba(251, 146, 60, 0.8)'
      ]
    }]
  }

  const costBreakdownData = {
    labels: ['Infrastructure', 'Processing', 'KYC/KYB', 'Personnel', 'Marketing', 'Other'],
    datasets: [{
      label: 'Monthly Costs',
      data: [
        profitability?.costs.infrastructure || 0,
        profitability?.costs.paymentProcessing || 0,
        profitability?.costs.kycKybVerification || 0,
        profitability?.costs.personnel || 0,
        profitability?.costs.marketing || 0,
        (profitability?.costs.cardIssuance || 0) + (profitability?.costs.bankingFees || 0)
      ],
      backgroundColor: 'rgba(239, 68, 68, 0.8)'
    }]
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Profitability Analytics</h1>
          <p className="text-gray-500 mt-2">Track progress toward gross margin targets</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={selectedPeriod === 'month' ? 'default' : 'outline'}
            onClick={() => setSelectedPeriod('month')}
          >
            Monthly
          </Button>
          <Button
            variant={selectedPeriod === 'quarter' ? 'default' : 'outline'}
            onClick={() => setSelectedPeriod('quarter')}
          >
            Quarterly
          </Button>
          <Button
            variant={selectedPeriod === 'year' ? 'default' : 'outline'}
            onClick={() => setSelectedPeriod('year')}
          >
            Yearly
          </Button>
        </div>
      </div>

      {/* Gross Margin Target Progress */}
      <div className="grid gap-4 md:grid-cols-3">
        {profitability?.targets && Object.entries(profitability.targets).map(([year, target]) => (
          <Card key={year}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg capitalize">
                    {year.replace('year', 'Year ')} Target
                  </CardTitle>
                  <CardDescription>Gross Margin Goal: {target.targetGrossMargin}%</CardDescription>
                </div>
                {target.onTrack ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold">{target.actualGrossMargin.toFixed(1)}%</span>
                  <Badge variant={target.onTrack ? 'success' : 'warning'}>
                    {target.variance > 0 ? '+' : ''}{target.variance.toFixed(1)}%
                  </Badge>
                </div>
                <Progress
                  value={(target.actualGrossMargin / target.targetGrossMargin) * 100}
                  className="h-2"
                />
                <p className="text-sm text-gray-500">
                  {target.onTrack ? 'On track to meet target' : `${Math.abs(target.variance).toFixed(1)}% below target`}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Key Profitability Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Gross Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${((profitability?.profitability.grossProfit || 0) / 1000000).toFixed(2)}M
            </div>
            <p className="text-xs text-gray-500">
              Margin: {profitability?.profitability.grossMargin.toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Operating Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${((profitability?.profitability.operatingProfit || 0) / 1000000).toFixed(2)}M
            </div>
            <p className="text-xs text-gray-500">
              Margin: {profitability?.profitability.operatingMargin.toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${((profitability?.profitability.netProfit || 0) / 1000000).toFixed(2)}M
            </div>
            <p className="text-xs text-gray-500">
              Margin: {profitability?.profitability.netMargin.toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">EBITDA</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${((profitability?.profitability.ebitda || 0) / 1000000).toFixed(2)}M
            </div>
            <p className="text-xs text-gray-500">
              +{((profitability?.profitability.ebitda || 0) / (profitability?.revenue.totalRevenue || 1) * 100).toFixed(1)}% of revenue
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="unit-economics">Unit Economics</TabsTrigger>
          <TabsTrigger value="cost-centers">Cost Centers</TabsTrigger>
          <TabsTrigger value="revenue">Revenue Analysis</TabsTrigger>
          <TabsTrigger value="forecast">Forecast</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Margin Progress vs Targets</CardTitle>
                <CardDescription>Track toward 45% / 65% / 85% gross margin goals</CardDescription>
              </CardHeader>
              <CardContent>
                <Line
                  data={marginProgressData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: { position: 'bottom' as const }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                          callback: function(value: any) {
                            return value + '%'
                          }
                        }
                      }
                    }
                  }}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Breakdown</CardTitle>
                <CardDescription>Monthly revenue by source</CardDescription>
              </CardHeader>
              <CardContent>
                <Doughnut
                  data={revenueBreakdownData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: { position: 'bottom' as const }
                    }
                  }}
                />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Cost Structure</CardTitle>
              <CardDescription>Monthly cost breakdown by category</CardDescription>
            </CardHeader>
            <CardContent>
              <Bar
                data={costBreakdownData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { display: false }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: function(value: any) {
                          return '$' + (Number(value) / 1000).toFixed(0) + 'K'
                        }
                      }
                    }
                  }
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="unit-economics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Per Organization
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Average Revenue</span>
                  <span className="font-bold">${unitEconomics?.perOrganization.averageRevenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Average Cost</span>
                  <span className="font-bold">${unitEconomics?.perOrganization.averageCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>LTV</span>
                  <span className="font-bold">${unitEconomics?.perOrganization.ltv.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>CAC</span>
                  <span className="font-bold">${unitEconomics?.perOrganization.cac.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>LTV/CAC Ratio</span>
                  <Badge variant={unitEconomics?.perOrganization.ltvCacRatio! > 3 ? 'success' : 'warning'}>
                    {unitEconomics?.perOrganization.ltvCacRatio}x
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Payback Period</span>
                  <span className="font-bold">{unitEconomics?.perOrganization.paybackPeriod} months</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Per User
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Average Revenue</span>
                  <span className="font-bold">${unitEconomics?.perUser.averageRevenue}</span>
                </div>
                <div className="flex justify-between">
                  <span>Average Cost</span>
                  <span className="font-bold">${unitEconomics?.perUser.averageCost}</span>
                </div>
                <div className="flex justify-between">
                  <span>Average Profit</span>
                  <span className="font-bold text-green-600">${unitEconomics?.perUser.averageProfit}</span>
                </div>
                <div className="flex justify-between">
                  <span>Monthly Churn</span>
                  <Badge variant={unitEconomics?.perUser.monthlyChurn! < 5 ? 'success' : 'warning'}>
                    {unitEconomics?.perUser.monthlyChurn}%
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Annual Churn</span>
                  <span className="font-bold">{unitEconomics?.perUser.annualChurn}%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Per Transaction
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Average Revenue</span>
                  <span className="font-bold">${unitEconomics?.perTransaction.averageRevenue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Average Cost</span>
                  <span className="font-bold">${unitEconomics?.perTransaction.averageCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Average Profit</span>
                  <span className="font-bold text-green-600">
                    ${unitEconomics?.perTransaction.averageProfit.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Margin</span>
                  <Badge variant="success">
                    {unitEconomics?.perTransaction.margin.toFixed(1)}%
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cost-centers" className="space-y-4">
          {costCenters.map(center => (
            <Card key={center.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{center.name}</CardTitle>
                    <CardDescription className="capitalize">{center.category}</CardDescription>
                  </div>
                  <Badge variant={center.current.percentOfBudget > 95 ? 'warning' : 'success'}>
                    {center.current.percentOfBudget}% of budget
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-3">
                    <h4 className="font-semibold">Current Month</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Budget</span>
                        <span>${center.current.budget.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Actual</span>
                        <span className="font-bold">${center.current.actual.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Variance</span>
                        <span className={center.current.variance > 0 ? 'text-green-600' : 'text-red-600'}>
                          ${Math.abs(center.current.variance).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold">Year to Date</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Budget</span>
                        <span>${center.ytd.budget.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Actual</span>
                        <span className="font-bold">${center.ytd.actual.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Variance</span>
                        <span className={center.ytd.variance > 0 ? 'text-green-600' : 'text-red-600'}>
                          ${Math.abs(center.ytd.variance).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <h4 className="font-semibold">Breakdown</h4>
                  {center.breakdown.map(item => (
                    <div key={item.item} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span>{item.item}</span>
                        {item.trend === 'up' && <ArrowUp className="h-3 w-3 text-red-500" />}
                        {item.trend === 'down' && <ArrowDown className="h-3 w-3 text-green-500" />}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-500">{item.percentage}%</span>
                        <span className="font-medium">${(item.amount / 1000).toFixed(0)}K</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Product</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {revenueAnalytics && Object.entries(revenueAnalytics.byProduct).map(([product, revenue]) => (
                  <div key={product} className="flex justify-between">
                    <span className="capitalize">{product.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <span className="font-bold">${(revenue / 1000000).toFixed(2)}M</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue by Organization Type</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {revenueAnalytics && Object.entries(revenueAnalytics.byOrgType).map(([type, data]) => (
                  <div key={type} className="flex justify-between items-center">
                    <span className="capitalize">{type}</span>
                    <div className="flex items-center gap-3">
                      <Badge variant={data.growth > 15 ? 'success' : 'default'}>
                        +{data.growth}%
                      </Badge>
                      <span className="font-bold">${(data.revenue / 1000000).toFixed(2)}M</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Cohort Analysis</CardTitle>
              <CardDescription>Revenue and retention by customer cohort</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Cohort</th>
                      <th className="text-right py-2">Organizations</th>
                      <th className="text-right py-2">Revenue</th>
                      <th className="text-right py-2">Retention</th>
                      <th className="text-right py-2">LTV</th>
                    </tr>
                  </thead>
                  <tbody>
                    {revenueAnalytics?.byCohort.map(cohort => (
                      <tr key={cohort.cohort} className="border-b">
                        <td className="py-2">{cohort.cohort}</td>
                        <td className="text-right">{cohort.organizations}</td>
                        <td className="text-right font-bold">${(cohort.revenue / 1000).toFixed(0)}K</td>
                        <td className="text-right">
                          <Badge variant={cohort.retention > 85 ? 'success' : 'warning'}>
                            {cohort.retention}%
                          </Badge>
                        </td>
                        <td className="text-right">${(cohort.ltv / 1000).toFixed(0)}K</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forecast" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Q1 2025 Financial Forecast</CardTitle>
              <CardDescription>Projected performance based on current trends</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-3">
                  <h4 className="font-semibold">Revenue Projections</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Conservative</span>
                      <span>${(forecast?.projectedRevenue.conservative! / 1000000).toFixed(1)}M</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Expected</span>
                      <span className="font-bold text-green-600">
                        ${(forecast?.projectedRevenue.expected! / 1000000).toFixed(1)}M
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Optimistic</span>
                      <span>${(forecast?.projectedRevenue.optimistic! / 1000000).toFixed(1)}M</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold">Cost Projections</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Conservative</span>
                      <span>${(forecast?.projectedCosts.conservative! / 1000000).toFixed(1)}M</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Expected</span>
                      <span className="font-bold">
                        ${(forecast?.projectedCosts.expected! / 1000000).toFixed(1)}M
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Optimistic</span>
                      <span>${(forecast?.projectedCosts.optimistic! / 1000000).toFixed(1)}M</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold">Margin Projections</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Gross Margin</span>
                      <Badge variant={forecast?.projectedProfitability.grossMargin! > 50 ? 'success' : 'warning'}>
                        {forecast?.projectedProfitability.grossMargin}%
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Operating Margin</span>
                      <span>{forecast?.projectedProfitability.operatingMargin}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Net Margin</span>
                      <span>{forecast?.projectedProfitability.netMargin}%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-semibold mb-3">Key Assumptions</h4>
                <div className="grid gap-4 md:grid-cols-4">
                  <div>
                    <p className="text-sm text-gray-500">New Organizations</p>
                    <p className="font-bold">{forecast?.assumptions.newOrganizations}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Churn Rate</p>
                    <p className="font-bold">{forecast?.assumptions.churnRate}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Avg Revenue</p>
                    <p className="font-bold">${forecast?.assumptions.averageRevenue.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Cost Growth</p>
                    <p className="font-bold">{forecast?.assumptions.costGrowth}%</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Action Items for Margin Improvement</CardTitle>
              <CardDescription>Recommendations to achieve 65% gross margin target</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Target className="h-5 w-5 text-blue-500 mt-1" />
                  <div>
                    <p className="font-semibold">Optimize Infrastructure Costs</p>
                    <p className="text-sm text-gray-500">
                      Negotiate volume discounts with AWS, implement auto-scaling, optimize database queries
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <DollarSign className="h-5 w-5 text-green-500 mt-1" />
                  <div>
                    <p className="font-semibold">Increase Revenue per Organization</p>
                    <p className="text-sm text-gray-500">
                      Upsell to higher tiers, add premium features, implement usage-based pricing
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Activity className="h-5 w-5 text-purple-500 mt-1" />
                  <div>
                    <p className="font-semibold">Improve Operational Efficiency</p>
                    <p className="text-sm text-gray-500">
                      Automate manual processes, reduce support tickets, implement self-service features
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calculator className="h-5 w-5 text-orange-500 mt-1" />
                  <div>
                    <p className="font-semibold">Reduce Payment Processing Costs</p>
                    <p className="text-sm text-gray-500">
                      Negotiate better rates, optimize routing, reduce failed transactions
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}