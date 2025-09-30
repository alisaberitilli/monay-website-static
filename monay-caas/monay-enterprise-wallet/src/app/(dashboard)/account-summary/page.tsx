'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
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
import { Bar, Doughnut } from 'react-chartjs-2'
import {
  DollarSign,
  Users,
  TrendingUp,
  TrendingDown,
  Download,
  AlertCircle,
  CheckCircle,
  Clock,
  Receipt,
  Building,
  CreditCard,
  FileText,
  Settings,
  Package,
  Shield,
  Coins,
  Activity,
  Briefcase,
  Calculator,
  ChevronRight,
  Info,
  Zap
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import type {
  EnterpriseAccountSummary,
  DepartmentSummary,
  UserSpendSummary,
  TokenSummary,
  EnterpriseInvoice,
  CostOptimization,
  EnterpriseBillingPreferences
} from '@/types/accountSummary'

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

export default function OrganizationAccountSummary() {
  const router = useRouter()
  const [accountSummary, setAccountSummary] = useState<EnterpriseAccountSummary | null>(null)
  const [departments, setDepartments] = useState<DepartmentSummary[]>([])
  const [topUsers, setTopUsers] = useState<UserSpendSummary[]>([])
  const [tokens, setTokens] = useState<TokenSummary[]>([])
  const [invoices, setInvoices] = useState<EnterpriseInvoice[]>([])
  const [optimization, setOptimization] = useState<CostOptimization | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState<'current' | 'previous' | 'ytd'>('current')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrganizationData()
  }, [selectedPeriod])

  const fetchOrganizationData = async () => {
    setLoading(true)
    try {
      // Mock data - replace with actual API calls for organization-specific data
      setAccountSummary({
        organizationId: 'org-001',
        organizationName: 'Acme Corporation',
        organizationType: 'enterprise',
        accountStatus: 'active',

        subscription: {
          plan: 'growth',
          planName: 'Growth Plan',
          startDate: new Date('2024-01-15'),
          renewalDate: new Date('2025-01-15'),
          pricing: {
            base: 2499,
            perUser: 20,
            perTransaction: 0.08,
            discount: 10
          }
        },

        balance: {
          treasury: {
            fiat: 125000,
            stablecoin: 75000,
            total: 200000
          },
          allocated: {
            departments: 45000,
            users: 15000,
            pending: 5000
          },
          available: 135000,
          currency: 'USD',
          lastUpdated: new Date()
        },

        billing: {
          billingCycle: {
            startDate: new Date('2024-10-01'),
            endDate: new Date('2024-10-31'),
            dueDate: new Date('2024-11-05'),
            status: 'current'
          },
          currentCharges: {
            subscriptionBase: 2499,
            userFees: 900,
            transactionFees: 260,
            verificationFees: 125,
            overageFees: 0,
            customFeatures: 0,
            total: 3784
          },
          previousMonth: {
            total: 3425,
            paid: true,
            paidDate: new Date('2024-10-05')
          },
          yearToDate: {
            totalBilled: 35250,
            totalPaid: 31466,
            outstanding: 3784
          }
        },

        limits: {
          subscription: {
            users: 100,
            monthlyTransactions: 10000,
            monthlyVolume: 1000000,
            apiCalls: 100000
          },
          usage: {
            users: 45,
            monthlyTransactions: 3250,
            monthlyVolume: 425000,
            apiCalls: 28500
          },
          percentUsed: {
            users: 45,
            transactions: 32.5,
            volume: 42.5,
            apiCalls: 28.5
          }
        },

        usage: {
          activeUsers: 45,
          totalTransactions: 3250,
          transactionVolume: 425000,
          apiCalls: 28500,
          tokensIssued: 1000000,
          crossRailTransfers: 125
        },

        departments: [
          {
            id: 'dept-001',
            name: 'Engineering',
            users: 15,
            budget: 25000,
            spent: 12500,
            remaining: 12500,
            transactions: 850
          },
          {
            id: 'dept-002',
            name: 'Sales',
            users: 12,
            budget: 15000,
            spent: 9800,
            remaining: 5200,
            transactions: 620
          },
          {
            id: 'dept-003',
            name: 'Marketing',
            users: 8,
            budget: 10000,
            spent: 7500,
            remaining: 2500,
            transactions: 420
          }
        ],

        invoices: {
          current: {
            id: 'inv-2024-10',
            amount: 3784,
            dueDate: new Date('2024-11-05'),
            status: 'sent'
          },
          history: [
            {
              id: 'inv-2024-09',
              amount: 3425,
              date: new Date('2024-10-01'),
              status: 'paid',
              downloadUrl: '/invoices/inv-2024-09.pdf'
            },
            {
              id: 'inv-2024-08',
              amount: 3250,
              date: new Date('2024-09-01'),
              status: 'paid',
              downloadUrl: '/invoices/inv-2024-08.pdf'
            }
          ]
        },

        complianceCosts: {
          currentMonth: {
            kycCount: 8,
            kycCost: 80,
            kybCount: 2,
            kybCost: 45,
            totalCost: 125
          },
          yearToDate: {
            kycCount: 68,
            kycCost: 680,
            kybCount: 15,
            kybCost: 337.50,
            totalCost: 1017.50
          }
        }
      })

      setOptimization({
        totalSavings: 825,
        recommendations: [
          {
            id: 'opt-001',
            type: 'plan_upgrade',
            title: 'Upgrade to Enterprise Plan',
            description: 'With your current usage, Enterprise plan would save $425/month',
            currentCost: 3784,
            projectedCost: 3359,
            savings: 425,
            effort: 'low',
            impact: 'high'
          },
          {
            id: 'opt-002',
            type: 'volume_discount',
            title: 'Annual Billing Discount',
            description: 'Switch to annual billing for 15% discount',
            currentCost: 2499,
            projectedCost: 2124,
            savings: 375,
            effort: 'low',
            impact: 'medium'
          },
          {
            id: 'opt-003',
            type: 'usage_optimization',
            title: 'Consolidate Virtual Cards',
            description: 'Reduce virtual card usage by 30% to save on per-card fees',
            currentCost: 125,
            projectedCost: 100,
            savings: 25,
            effort: 'medium',
            impact: 'low'
          }
        ]
      })

      setTopUsers([
        {
          userId: 'user-001',
          userName: 'John Smith',
          email: 'john.smith@acme.com',
          department: 'Engineering',
          spending: {
            currentMonth: 2850,
            previousMonth: 2500,
            yearToDate: 28500,
            averageMonthly: 2375
          },
          cards: {
            physical: {
              last4: '4242',
              currentSpend: 1850,
              limit: 5000
            },
            virtual: [{
              count: 3,
              totalSpend: 1000
            }]
          },
          compliance: {
            kycStatus: 'verified',
            kycDate: new Date('2024-01-20'),
            spendLimits: {
              daily: 1000,
              monthly: 5000
            }
          }
        },
        {
          userId: 'user-002',
          userName: 'Jane Doe',
          email: 'jane.doe@acme.com',
          department: 'Sales',
          spending: {
            currentMonth: 2250,
            previousMonth: 2100,
            yearToDate: 22500,
            averageMonthly: 2125
          },
          cards: {
            physical: {
              last4: '8888',
              currentSpend: 2250,
              limit: 3000
            },
            virtual: []
          },
          compliance: {
            kycStatus: 'verified',
            kycDate: new Date('2024-02-15'),
            spendLimits: {
              daily: 500,
              monthly: 3000
            }
          }
        }
      ])

      setTokens([
        {
          tokenId: 'token-001',
          tokenSymbol: 'ACME',
          tokenName: 'Acme Token',
          supply: {
            total: 1000000,
            circulating: 750000,
            treasury: 250000,
            burned: 0
          },
          issuance: {
            totalMinted: 1000000,
            totalBurned: 0,
            lastMintDate: new Date('2024-10-01')
          },
          crossRail: {
            enterpriseToConsumer: {
              count: 85,
              volume: 125000
            },
            consumerToEnterprise: {
              count: 40,
              volume: 65000
            }
          },
          compliance: {
            erc3643Compliant: true,
            whitelistEnabled: true,
            blacklistEnabled: false,
            pausable: true
          }
        }
      ])
    } catch (error) {
      console.error('Failed to fetch organization data:', error)
    }
    setLoading(false)
  }

  const handleDownloadInvoice = (invoiceId: string) => {
    console.log(`Downloading invoice ${invoiceId}`)
  }

  const handlePayInvoice = () => {
    router.push('/billing/pay-invoice')
  }

  const handleManageBilling = () => {
    router.push('/settings/billing')
  }

  const handleUpgradePlan = () => {
    router.push('/settings/subscription/upgrade')
  }

  const handleManageUsers = () => {
    router.push('/users')
  }

  const handleViewCompliance = () => {
    router.push('/compliance')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  const departmentSpendData = {
    labels: accountSummary?.departments.map(d => d.name) || [],
    datasets: [{
      label: 'Department Spending',
      data: accountSummary?.departments.map(d => d.spent) || [],
      backgroundColor: [
        'rgba(99, 102, 241, 0.8)',
        'rgba(34, 197, 94, 0.8)',
        'rgba(251, 146, 60, 0.8)'
      ]
    }]
  }

  const costBreakdownData = {
    labels: ['Subscription', 'Users', 'Transactions', 'Verification'],
    datasets: [{
      data: [
        accountSummary?.billing.currentCharges.subscriptionBase || 0,
        accountSummary?.billing.currentCharges.userFees || 0,
        accountSummary?.billing.currentCharges.transactionFees || 0,
        accountSummary?.billing.currentCharges.verificationFees || 0
      ],
      backgroundColor: [
        'rgba(99, 102, 241, 0.8)',
        'rgba(34, 197, 94, 0.8)',
        'rgba(251, 146, 60, 0.8)',
        'rgba(239, 68, 68, 0.8)'
      ]
    }]
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Account Summary</h1>
          <p className="text-gray-500 mt-2">
            {accountSummary?.organizationName} billing and usage overview
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleManageBilling}>
            <Settings className="h-4 w-4 mr-2" />
            Billing Settings
          </Button>
          <Button onClick={handlePayInvoice}>
            <Receipt className="h-4 w-4 mr-2" />
            Pay Invoice
          </Button>
        </div>
      </div>

      {/* Current Invoice Alert */}
      {accountSummary?.invoices.current && accountSummary.invoices.current.status === 'sent' && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Invoice Due</AlertTitle>
          <AlertDescription className="flex justify-between items-center">
            <span>
              Invoice #{accountSummary.invoices.current.id} for ${accountSummary.invoices.current.amount.toLocaleString()}
              is due on {accountSummary.invoices.current.dueDate.toLocaleDateString()}
            </span>
            <Button variant="default" size="sm" onClick={handlePayInvoice}>
              Pay Now
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Current Charges</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${accountSummary?.billing.currentCharges.total.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Due {accountSummary?.billing.billingCycle.dueDate.toLocaleDateString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Treasury Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${accountSummary?.balance.treasury.total.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              ${accountSummary?.balance.available.toLocaleString()} available
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {accountSummary?.usage.activeUsers} / {accountSummary?.limits.subscription.users}
            </div>
            <Progress
              value={accountSummary?.limits.percentUsed.users}
              className="mt-2 h-1"
            />
            <p className="text-xs text-gray-500 mt-1">
              {accountSummary?.limits.percentUsed.users}% of limit
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">YTD Spending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${accountSummary?.billing.yearToDate.totalBilled.toLocaleString()}
            </div>
            <p className="text-xs text-green-600 flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              On track with budget
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="billing">Billing Details</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="users">Top Users</TabsTrigger>
          <TabsTrigger value="tokens">Tokens</TabsTrigger>
          <TabsTrigger value="optimization">Cost Optimization</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Subscription Details */}
            <Card>
              <CardHeader>
                <CardTitle>Subscription Details</CardTitle>
                <CardDescription>Your current plan and pricing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Plan</span>
                  <Badge className="capitalize">{accountSummary?.subscription.planName}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Base Fee</span>
                  <span className="font-medium">
                    ${accountSummary?.subscription.pricing.base}/month
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Per User</span>
                  <span className="font-medium">
                    ${accountSummary?.subscription.pricing.perUser}/user
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Per Transaction</span>
                  <span className="font-medium">
                    ${accountSummary?.subscription.pricing.perTransaction}
                  </span>
                </div>
                {accountSummary?.subscription.pricing.discount && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Discount</span>
                    <Badge variant="success">
                      {accountSummary.subscription.pricing.discount}% off
                    </Badge>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Renewal Date</span>
                  <span className="font-medium">
                    {accountSummary?.subscription.renewalDate.toLocaleDateString()}
                  </span>
                </div>
                <Button variant="outline" className="w-full mt-4" onClick={handleUpgradePlan}>
                  <Zap className="h-4 w-4 mr-2" />
                  Upgrade Plan
                </Button>
              </CardContent>
            </Card>

            {/* Usage Limits */}
            <Card>
              <CardHeader>
                <CardTitle>Usage vs Limits</CardTitle>
                <CardDescription>Current usage against plan limits</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Users</span>
                    <span>
                      {accountSummary?.limits.usage.users} / {accountSummary?.limits.subscription.users}
                    </span>
                  </div>
                  <Progress value={accountSummary?.limits.percentUsed.users} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Transactions</span>
                    <span>
                      {accountSummary?.limits.usage.monthlyTransactions.toLocaleString()} /
                      {accountSummary?.limits.subscription.monthlyTransactions.toLocaleString()}
                    </span>
                  </div>
                  <Progress value={accountSummary?.limits.percentUsed.transactions} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Volume</span>
                    <span>
                      ${(accountSummary?.limits.usage.monthlyVolume || 0 / 1000).toFixed(0)}K /
                      ${(accountSummary?.limits.subscription.monthlyVolume || 0 / 1000).toFixed(0)}K
                    </span>
                  </div>
                  <Progress value={accountSummary?.limits.percentUsed.volume} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>API Calls</span>
                    <span>
                      {accountSummary?.limits.usage.apiCalls.toLocaleString()} /
                      {accountSummary?.limits.subscription.apiCalls.toLocaleString()}
                    </span>
                  </div>
                  <Progress value={accountSummary?.limits.percentUsed.apiCalls} className="h-2" />
                </div>

                {(accountSummary?.limits.percentUsed.users || 0) > 80 ||
                 (accountSummary?.limits.percentUsed.transactions || 0) > 80 ||
                 (accountSummary?.limits.percentUsed.volume || 0) > 80 ? (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Approaching plan limits. Consider upgrading.
                    </AlertDescription>
                  </Alert>
                ) : null}
              </CardContent>
            </Card>
          </div>

          {/* Cost Breakdown */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Current Month Cost Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <Doughnut
                  data={costBreakdownData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: { position: 'bottom' as const }
                    }
                  }}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Department Spending</CardTitle>
              </CardHeader>
              <CardContent>
                <Bar
                  data={departmentSpendData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: { display: false }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          callback: function(value) {
                            return '$' + value.toLocaleString()
                          }
                        }
                      }
                    }
                  }}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="billing" className="space-y-4">
          {/* Current Charges */}
          <Card>
            <CardHeader>
              <CardTitle>Current Billing Period</CardTitle>
              <CardDescription>
                {accountSummary?.billing.billingCycle.startDate.toLocaleDateString()} -
                {accountSummary?.billing.billingCycle.endDate.toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b">
                  <span>Subscription Base</span>
                  <span className="font-medium">
                    ${accountSummary?.billing.currentCharges.subscriptionBase.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span>User Fees ({accountSummary?.usage.activeUsers} users)</span>
                  <span className="font-medium">
                    ${accountSummary?.billing.currentCharges.userFees.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span>Transaction Fees</span>
                  <span className="font-medium">
                    ${accountSummary?.billing.currentCharges.transactionFees.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span>KYC/KYB Verification</span>
                  <span className="font-medium">
                    ${accountSummary?.billing.currentCharges.verificationFees.toLocaleString()}
                  </span>
                </div>
                {accountSummary?.billing.currentCharges.overageFees ? (
                  <div className="flex justify-between py-2 border-b">
                    <span>Overage Fees</span>
                    <span className="font-medium text-red-600">
                      ${accountSummary.billing.currentCharges.overageFees.toLocaleString()}
                    </span>
                  </div>
                ) : null}
                <div className="flex justify-between pt-3 font-bold text-lg">
                  <span>Total Due</span>
                  <span>${accountSummary?.billing.currentCharges.total.toLocaleString()}</span>
                </div>
              </div>
              <div className="mt-6 flex gap-2">
                <Button className="flex-1" onClick={handlePayInvoice}>
                  Pay Invoice
                </Button>
                <Button variant="outline" className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Invoice History */}
          <Card>
            <CardHeader>
              <CardTitle>Invoice History</CardTitle>
              <CardDescription>Past invoices and payments</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accountSummary?.invoices.history.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.id}</TableCell>
                      <TableCell>{invoice.date.toLocaleDateString()}</TableCell>
                      <TableCell>${invoice.amount.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant="success">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          {invoice.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownloadInvoice(invoice.id)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Compliance Costs */}
          <Card>
            <CardHeader>
              <CardTitle>Compliance & Verification Costs</CardTitle>
              <CardDescription>KYC/KYB verification expenses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-semibold mb-3">Current Month</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">KYC Verifications</span>
                      <span>{accountSummary?.complianceCosts.currentMonth.kycCount} × $10</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">KYB Verifications</span>
                      <span>{accountSummary?.complianceCosts.currentMonth.kybCount} × $22.50</span>
                    </div>
                    <div className="flex justify-between font-semibold pt-2 border-t">
                      <span>Total</span>
                      <span>${accountSummary?.complianceCosts.currentMonth.totalCost.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Year to Date</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">KYC Verifications</span>
                      <span>{accountSummary?.complianceCosts.yearToDate.kycCount} total</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">KYB Verifications</span>
                      <span>{accountSummary?.complianceCosts.yearToDate.kybCount} total</span>
                    </div>
                    <div className="flex justify-between font-semibold pt-2 border-t">
                      <span>Total</span>
                      <span>${accountSummary?.complianceCosts.yearToDate.totalCost.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
              <Button
                variant="link"
                className="mt-4 p-0"
                onClick={handleViewCompliance}
              >
                View Compliance Dashboard →
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="departments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Department Budgets & Spending</CardTitle>
              <CardDescription>Budget allocation and usage by department</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Department</TableHead>
                    <TableHead>Users</TableHead>
                    <TableHead>Budget</TableHead>
                    <TableHead>Spent</TableHead>
                    <TableHead>Remaining</TableHead>
                    <TableHead>Transactions</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accountSummary?.departments.map((dept) => {
                    const percentUsed = (dept.spent / dept.budget) * 100
                    return (
                      <TableRow key={dept.id}>
                        <TableCell className="font-medium">{dept.name}</TableCell>
                        <TableCell>{dept.users}</TableCell>
                        <TableCell>${dept.budget.toLocaleString()}</TableCell>
                        <TableCell>${dept.spent.toLocaleString()}</TableCell>
                        <TableCell>${dept.remaining.toLocaleString()}</TableCell>
                        <TableCell>{dept.transactions}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Progress value={percentUsed} className="h-2" />
                            <p className="text-xs text-gray-500">{percentUsed.toFixed(0)}%</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
              <div className="mt-4 flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  Total: ${accountSummary?.departments.reduce((sum, d) => sum + d.spent, 0).toLocaleString()}
                  of ${accountSummary?.departments.reduce((sum, d) => sum + d.budget, 0).toLocaleString()}
                </div>
                <Button variant="outline" size="sm">
                  Manage Budgets
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Top Spending Users</CardTitle>
                  <CardDescription>Highest spending users this month</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={handleManageUsers}>
                  <Users className="h-4 w-4 mr-2" />
                  Manage All Users
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topUsers.map((user) => (
                  <div key={user.userId} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-semibold">{user.userName}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        <Badge variant="outline" className="mt-1">{user.department}</Badge>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">
                          ${user.spending.currentMonth.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-500">This month</p>
                      </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-3">
                      <div>
                        <p className="text-sm text-gray-500">YTD Spending</p>
                        <p className="font-medium">${user.spending.yearToDate.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Monthly Limit</p>
                        <p className="font-medium">
                          ${user.compliance.spendLimits.monthly.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">KYC Status</p>
                        <Badge variant={user.compliance.kycStatus === 'verified' ? 'success' : 'warning'}>
                          {user.compliance.kycStatus}
                        </Badge>
                      </div>
                    </div>

                    {user.cards.physical && (
                      <div className="mt-3 pt-3 border-t">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4" />
                            <span className="text-sm">Card •••• {user.cards.physical.last4}</span>
                          </div>
                          <div className="text-sm">
                            ${user.cards.physical.currentSpend} / ${user.cards.physical.limit}
                          </div>
                        </div>
                        <Progress
                          value={(user.cards.physical.currentSpend / user.cards.physical.limit) * 100}
                          className="mt-2 h-1"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tokens" className="space-y-4">
          {tokens.map((token) => (
            <Card key={token.tokenId}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Coins className="h-5 w-5" />
                      {token.tokenName}
                    </CardTitle>
                    <CardDescription>{token.tokenSymbol}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {token.compliance.erc3643Compliant && (
                      <Badge variant="success">ERC-3643</Badge>
                    )}
                    {token.compliance.pausable && (
                      <Badge variant="outline">Pausable</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <h4 className="font-semibold mb-3">Supply Metrics</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Total Supply</span>
                        <span>{token.supply.total.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Circulating</span>
                        <span>{token.supply.circulating.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Treasury</span>
                        <span>{token.supply.treasury.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Issuance Activity</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Total Minted</span>
                        <span>{token.issuance.totalMinted.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Total Burned</span>
                        <span>{token.issuance.totalBurned.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Last Mint</span>
                        <span>{token.issuance.lastMintDate?.toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Cross-Rail Activity</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">To Consumer</span>
                        <span>{token.crossRail.enterpriseToConsumer.count} txns</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">From Consumer</span>
                        <span>{token.crossRail.consumerToEnterprise.count} txns</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Total Volume</span>
                        <span>
                          ${((token.crossRail.enterpriseToConsumer.volume +
                             token.crossRail.consumerToEnterprise.volume) / 1000).toFixed(0)}K
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    Mint Tokens
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    View Treasury
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    Token Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="optimization" className="space-y-4">
          {optimization && (
            <>
              <Alert className="bg-blue-50 border-blue-200">
                <Zap className="h-4 w-4 text-blue-600" />
                <AlertTitle>Potential Savings Identified</AlertTitle>
                <AlertDescription>
                  We've identified opportunities to save ${optimization.totalSavings}/month on your current plan
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                {optimization.recommendations.map((rec) => (
                  <Card key={rec.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{rec.title}</CardTitle>
                          <CardDescription>{rec.description}</CardDescription>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-green-600">
                            ${rec.savings}/mo
                          </p>
                          <div className="flex gap-1 mt-1">
                            <Badge variant={rec.effort === 'low' ? 'success' : rec.effort === 'medium' ? 'warning' : 'secondary'}>
                              {rec.effort} effort
                            </Badge>
                            <Badge variant={rec.impact === 'high' ? 'success' : rec.impact === 'medium' ? 'warning' : 'secondary'}>
                              {rec.impact} impact
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-gray-500">Current cost:</span>
                            <span className="font-medium">${rec.currentCost}/mo</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-gray-500">Projected cost:</span>
                            <span className="font-medium text-green-600">${rec.projectedCost}/mo</span>
                          </div>
                        </div>
                        <Button variant={rec.type === 'plan_upgrade' ? 'default' : 'outline'}>
                          {rec.type === 'plan_upgrade' ? 'Upgrade Now' : 'Learn More'}
                          <ChevronRight className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}