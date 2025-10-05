'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
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
  DollarSign,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Download,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  Receipt,
  PiggyBank,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  Settings,
  FileText,
  Shield,
  Zap,
  Gift,
  Plus
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import type {
  ConsumerAccountSummary,
  Transaction,
  Fee,
  BillingStatement,
  FeeSchedule,
  BillingPreferences
} from '@/types/accountSummary'

export default function ConsumerAccountSummary() {
  const router = useRouter()
  const [accountSummary, setAccountSummary] = useState<ConsumerAccountSummary | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [statement, setStatement] = useState<BillingStatement | null>(null)
  const [feeSchedule, setFeeSchedule] = useState<FeeSchedule | null>(null)
  const [preferences, setPreferences] = useState<BillingPreferences | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState<'current' | 'previous'>('current')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAccountData()
  }, [selectedPeriod])

  const fetchAccountData = async () => {
    setLoading(true)
    try {
      // Mock data - replace with actual API calls to fetch user-specific data
      setAccountSummary({
        accountId: 'acc-consumer-001',
        accountType: 'consumer',
        accountStatus: 'active',
        accountNumber: '****4567',
        routingNumber: '021000021',
        createdAt: new Date('2023-06-15'),

        balance: {
          available: 2847.50,
          pending: 125.00,
          total: 2972.50,
          currency: 'USD',
          lastUpdated: new Date()
        },

        creditLine: 5000,
        creditUsed: 1250,

        currentCycle: {
          startDate: new Date('2024-10-01'),
          endDate: new Date('2024-10-31'),
          dueDate: new Date('2024-11-05'),
          status: 'current'
        },

        fees: {
          currentMonth: 12.50,
          previousMonth: 8.00,
          yearToDate: 95.50,
          waived: 25.00,
          pending: 0
        },

        transactions: {
          currentMonth: {
            count: 42,
            volume: 3850.75,
            fees: 12.50
          },
          previousMonth: {
            count: 38,
            volume: 3200.00,
            fees: 8.00
          }
        },

        limits: {
          daily: {
            withdrawal: 1000,
            spending: 2500,
            transfer: 5000
          },
          monthly: {
            withdrawal: 10000,
            spending: 25000,
            transfer: 50000
          },
          perTransaction: {
            withdrawal: 500,
            spending: 1500,
            transfer: 2500
          }
        },

        rewards: {
          earned: 850,
          redeemed: 500,
          available: 350,
          expiringPoints: 50,
          expirationDate: new Date('2024-12-31')
        },

        subscriptionTier: 'premium',
        subscriptionFee: 9.99,

        cards: {
          virtual: [
            {
              id: 'card-v-001',
              last4: '8901',
              type: 'virtual',
              brand: 'visa',
              status: 'active',
              expiryDate: '12/26',
              spendLimit: 1000,
              currentSpend: 450
            }
          ],
          physical: [
            {
              id: 'card-p-001',
              last4: '4567',
              type: 'physical',
              brand: 'visa',
              status: 'active',
              expiryDate: '08/27',
              spendLimit: 2500,
              currentSpend: 1850
            }
          ]
        },

        savingsGoals: [
          {
            name: 'Vacation Fund',
            target: 5000,
            current: 3250,
            deadline: new Date('2025-06-01'),
            autoTransfer: true
          },
          {
            name: 'Emergency Fund',
            target: 10000,
            current: 7500,
            deadline: new Date('2025-12-31'),
            autoTransfer: true
          }
        ],

        scheduledPayments: [
          {
            payee: 'Rent',
            amount: 1500,
            frequency: 'monthly',
            nextDate: new Date('2024-11-01')
          },
          {
            payee: 'Car Insurance',
            amount: 185,
            frequency: 'monthly',
            nextDate: new Date('2024-11-15')
          }
        ]
      })

      setTransactions([
        {
          id: 'txn-001',
          type: 'card_purchase',
          description: 'Starbucks Coffee',
          amount: -5.75,
          currency: 'USD',
          date: new Date('2024-10-28'),
          status: 'completed',
          merchant: {
            name: 'Starbucks',
            category: 'Food & Dining',
            location: 'San Francisco, CA'
          },
          fee: 0,
          referenceNumber: 'REF123456'
        },
        {
          id: 'txn-002',
          type: 'transfer',
          description: 'Transfer from Savings',
          amount: 500.00,
          currency: 'USD',
          date: new Date('2024-10-27'),
          status: 'completed',
          referenceNumber: 'REF123457'
        },
        {
          id: 'txn-003',
          type: 'payment',
          description: 'Netflix Subscription',
          amount: -15.99,
          currency: 'USD',
          date: new Date('2024-10-26'),
          status: 'completed',
          merchant: {
            name: 'Netflix',
            category: 'Entertainment',
            location: 'Online'
          },
          fee: 0,
          referenceNumber: 'REF123458'
        },
        {
          id: 'txn-004',
          type: 'withdrawal',
          description: 'ATM Withdrawal',
          amount: -100.00,
          currency: 'USD',
          date: new Date('2024-10-25'),
          status: 'completed',
          fee: 2.50,
          feeType: 'atm_withdrawal',
          referenceNumber: 'REF123459'
        },
        {
          id: 'txn-005',
          type: 'deposit',
          description: 'Direct Deposit - Salary',
          amount: 3500.00,
          currency: 'USD',
          date: new Date('2024-10-24'),
          status: 'completed',
          referenceNumber: 'REF123460'
        }
      ])

      setFeeSchedule({
        accountType: 'consumer',
        effectiveDate: new Date('2024-01-01'),
        monthlyFees: {
          maintenance: 9.99,
          minimumBalance: 0,
          minimumBalanceThreshold: 1500
        },
        transactionFees: {
          domesticWire: { base: 25, percentage: 0, minimum: 25, maximum: 25, currency: 'USD' },
          internationalWire: { base: 45, percentage: 0.1, minimum: 45, maximum: 75, currency: 'USD' },
          achTransfer: { base: 0, percentage: 0, minimum: 0, maximum: 0, currency: 'USD' },
          instantTransfer: { base: 0.50, percentage: 1.5, minimum: 0.50, maximum: 15, currency: 'USD' },
          atmWithdrawal: {
            inNetwork: { base: 0, percentage: 0, minimum: 0, maximum: 0, currency: 'USD' },
            outOfNetwork: { base: 2.50, percentage: 0, minimum: 2.50, maximum: 2.50, currency: 'USD' },
            international: { base: 5.00, percentage: 2, minimum: 5.00, maximum: 10, currency: 'USD' }
          },
          cardTransaction: {
            domestic: { base: 0, percentage: 0, minimum: 0, maximum: 0, currency: 'USD' },
            international: { base: 0, percentage: 3, minimum: 0.50, maximum: 10, currency: 'USD' }
          }
        },
        otherFees: {
          overdraft: 35,
          insufficientFunds: 35,
          stopPayment: 30,
          cardReplacement: 10,
          rushDelivery: 25,
          accountClosure: 0
        },
        waiverConditions: {
          monthlyFeeWaiver: {
            condition: 'Maintain $1,500 minimum balance OR receive $500+ in direct deposits',
            threshold: 1500
          },
          atmFeeWaiver: {
            condition: 'First 5 out-of-network ATM fees waived per month for Premium accounts',
            monthlyLimit: 5
          }
        }
      })
    } catch (error) {
      console.error('Failed to fetch account data:', error)
    }
    setLoading(false)
  }

  const handleDownloadStatement = () => {
    // Trigger statement download
    console.log('Downloading statement...')
  }

  const handleUpgradePlan = () => {
    router.push('/settings/subscription' as any)
  }

  const handleManageCards = () => {
    router.push('/cards')
  }

  const handleSchedulePayment = () => {
    router.push('/payments/schedule' as any)
  }

  const handleViewAllTransactions = () => {
    router.push('/transactions')
  }

  const handleManagePreferences = () => {
    router.push('/settings/billing' as any)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  const spendingProgress = accountSummary
    ? (accountSummary.transactions.currentMonth.volume / accountSummary.limits.monthly.spending) * 100
    : 0

  return (
    <DashboardLayout>
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Account Summary</h1>
          <p className="text-gray-500 mt-2">Your personal account overview and billing details</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleDownloadStatement}>
            <Download className="h-4 w-4 mr-2" />
            Download Statement
          </Button>
          <Button variant="outline" onClick={handleManagePreferences}>
            <Settings className="h-4 w-4 mr-2" />
            Billing Preferences
          </Button>
        </div>
      </div>

      {/* Account Status Alert */}
      {accountSummary?.rewards && accountSummary.rewards.expiringPoints > 0 && (
        <Alert>
          <Gift className="h-4 w-4" />
          <AlertTitle>Rewards Expiring Soon</AlertTitle>
          <AlertDescription>
            You have {accountSummary.rewards.expiringPoints} points expiring on{' '}
            {accountSummary.rewards.expirationDate?.toLocaleDateString()}.
            <Button variant="link" className="px-2" onClick={() => router.push('/rewards' as any)}>
              Redeem Now
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${accountSummary?.balance.available.toLocaleString()}
            </div>
            {accountSummary?.balance.pending && accountSummary.balance.pending > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                ${accountSummary.balance.pending.toLocaleString()} pending
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Current Month Spending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${accountSummary?.transactions.currentMonth.volume.toLocaleString()}
            </div>
            <Progress value={spendingProgress} className="mt-2 h-1" />
            <p className="text-xs text-gray-500 mt-1">
              {spendingProgress.toFixed(0)}% of ${accountSummary?.limits.monthly.spending.toLocaleString()} limit
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Fees This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${accountSummary?.fees.currentMonth.toFixed(2)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              ${accountSummary?.fees.waived.toFixed(2)} waived
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Rewards Available</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {accountSummary?.rewards?.available} pts
            </div>
            <Button
              variant="link"
              className="p-0 h-auto text-xs"
              onClick={() => router.push('/rewards' as any)}
            >
              Redeem Rewards →
            </Button>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="fees">Fees & Charges</TabsTrigger>
          <TabsTrigger value="cards">Cards</TabsTrigger>
          <TabsTrigger value="savings">Savings Goals</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Account Details */}
            <Card>
              <CardHeader>
                <CardTitle>Account Details</CardTitle>
                <CardDescription>Your account information and subscription</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Account Number</span>
                  <span className="font-medium">{accountSummary?.accountNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Routing Number</span>
                  <span className="font-medium">{accountSummary?.routingNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Account Type</span>
                  <Badge className="capitalize">{accountSummary?.subscriptionTier}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Monthly Fee</span>
                  <span className="font-medium">${accountSummary?.subscriptionFee}/month</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Member Since</span>
                  <span className="font-medium">
                    {accountSummary?.createdAt.toLocaleDateString()}
                  </span>
                </div>
                <Button
                  variant="outline"
                  className="w-full mt-4"
                  onClick={handleUpgradePlan}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Upgrade to Platinum
                </Button>
              </CardContent>
            </Card>

            {/* Credit Line */}
            {accountSummary?.creditLine && (
              <Card>
                <CardHeader>
                  <CardTitle>Credit Line</CardTitle>
                  <CardDescription>Available credit and utilization</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Credit Limit</span>
                    <span className="font-medium">
                      ${accountSummary.creditLine.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Amount Used</span>
                    <span className="font-medium">
                      ${accountSummary.creditUsed?.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Available Credit</span>
                    <span className="font-medium text-green-600">
                      ${((accountSummary.creditLine - (accountSummary.creditUsed || 0))).toLocaleString()}
                    </span>
                  </div>
                  <Progress
                    value={((accountSummary.creditUsed || 0) / accountSummary.creditLine) * 100}
                    className="mt-2"
                  />
                  <p className="text-xs text-gray-500">
                    {((accountSummary.creditUsed || 0) / accountSummary.creditLine * 100).toFixed(0)}% utilized
                  </p>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push('/credit/increase' as any)}
                  >
                    Request Credit Increase
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Monthly Comparison */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Activity Comparison</CardTitle>
              <CardDescription>Current vs Previous Month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-3">
                  <h4 className="font-semibold">Transactions</h4>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Current</span>
                    <span className="font-medium">
                      {accountSummary?.transactions.currentMonth.count}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Previous</span>
                    <span className="font-medium">
                      {accountSummary?.transactions.previousMonth.count}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {(accountSummary?.transactions.currentMonth.count || 0) >
                     (accountSummary?.transactions.previousMonth.count || 0) ? (
                      <>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-green-500">
                          +{Math.abs((accountSummary?.transactions.currentMonth.count || 0) -
                                     (accountSummary?.transactions.previousMonth.count || 0))}
                        </span>
                      </>
                    ) : (
                      <>
                        <TrendingDown className="h-4 w-4 text-red-500" />
                        <span className="text-sm text-red-500">
                          -{Math.abs((accountSummary?.transactions.currentMonth.count || 0) -
                                     (accountSummary?.transactions.previousMonth.count || 0))}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold">Volume</h4>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Current</span>
                    <span className="font-medium">
                      ${accountSummary?.transactions.currentMonth.volume.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Previous</span>
                    <span className="font-medium">
                      ${accountSummary?.transactions.previousMonth.volume.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {(accountSummary?.transactions.currentMonth.volume || 0) >
                     (accountSummary?.transactions.previousMonth.volume || 0) ? (
                      <>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-green-500">
                          +${Math.abs((accountSummary?.transactions.currentMonth.volume || 0) -
                                      (accountSummary?.transactions.previousMonth.volume || 0)).toFixed(2)}
                        </span>
                      </>
                    ) : (
                      <>
                        <TrendingDown className="h-4 w-4 text-red-500" />
                        <span className="text-sm text-red-500">
                          -${Math.abs((accountSummary?.transactions.currentMonth.volume || 0) -
                                      (accountSummary?.transactions.previousMonth.volume || 0)).toFixed(2)}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold">Fees</h4>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Current</span>
                    <span className="font-medium">
                      ${accountSummary?.transactions.currentMonth.fees.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Previous</span>
                    <span className="font-medium">
                      ${accountSummary?.transactions.previousMonth.fees.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {(accountSummary?.transactions.currentMonth.fees || 0) >
                     (accountSummary?.transactions.previousMonth.fees || 0) ? (
                      <>
                        <TrendingUp className="h-4 w-4 text-red-500" />
                        <span className="text-sm text-red-500">
                          +${Math.abs((accountSummary?.transactions.currentMonth.fees || 0) -
                                      (accountSummary?.transactions.previousMonth.fees || 0)).toFixed(2)}
                        </span>
                      </>
                    ) : (
                      <>
                        <TrendingDown className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-green-500">
                          -${Math.abs((accountSummary?.transactions.currentMonth.fees || 0) -
                                      (accountSummary?.transactions.previousMonth.fees || 0)).toFixed(2)}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Scheduled Payments */}
          {accountSummary?.scheduledPayments && accountSummary.scheduledPayments.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Scheduled Payments</CardTitle>
                    <CardDescription>Upcoming automatic payments</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleSchedulePayment}>
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule New
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {accountSummary.scheduledPayments.map((payment, index) => (
                    <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{payment.payee}</p>
                        <p className="text-sm text-gray-500 capitalize">{payment.frequency}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">${payment.amount.toFixed(2)}</p>
                        <p className="text-sm text-gray-500">
                          {payment.nextDate.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Recent Transactions</CardTitle>
                  <CardDescription>Your latest account activity</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={handleViewAllTransactions}>
                  View All
                  <ArrowUpRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Fee</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="text-sm">
                        {transaction.date.toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          {transaction.merchant && (
                            <p className="text-xs text-gray-500">{transaction.merchant.name}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {transaction.merchant?.category || transaction.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {transaction.status === 'completed' ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : transaction.status === 'pending' ? (
                          <Clock className="h-4 w-4 text-yellow-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        )}
                      </TableCell>
                      <TableCell className={`text-right font-medium ${
                        transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        {transaction.fee ? `$${transaction.fee.toFixed(2)}` : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fees" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Fee Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Fee Summary</CardTitle>
                <CardDescription>Your fee activity and savings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Year to Date Fees</span>
                  <span className="font-medium">${accountSummary?.fees.yearToDate.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Fees Waived</span>
                  <span className="font-medium text-green-600">
                    ${accountSummary?.fees.waived.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Net Fees Paid</span>
                  <span className="font-bold">
                    ${((accountSummary?.fees.yearToDate || 0) - (accountSummary?.fees.waived || 0)).toFixed(2)}
                  </span>
                </div>
                <Alert className="mt-4">
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    {feeSchedule?.waiverConditions.monthlyFeeWaiver?.condition}
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Current Fee Schedule */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly & Transaction Fees</CardTitle>
                <CardDescription>Current fee schedule for your account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Monthly Maintenance</span>
                  <span className="font-medium">${feeSchedule?.monthlyFees.maintenance}/month</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Out-of-Network ATM</span>
                  <span className="font-medium">
                    ${feeSchedule?.transactionFees.atmWithdrawal.outOfNetwork.base}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Instant Transfer</span>
                  <span className="font-medium">
                    ${feeSchedule?.transactionFees.instantTransfer.base} + {feeSchedule?.transactionFees.instantTransfer.percentage}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">International Transaction</span>
                  <span className="font-medium">
                    {feeSchedule?.transactionFees.cardTransaction.international.percentage}%
                  </span>
                </div>
                <Button
                  variant="link"
                  className="p-0 mt-2"
                  onClick={() => router.push('/fees/schedule' as any)}
                >
                  View Complete Fee Schedule →
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Other Fees */}
          <Card>
            <CardHeader>
              <CardTitle>Other Fees & Charges</CardTitle>
              <CardDescription>Additional service fees</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-3">
                <div className="flex justify-between p-3 border rounded-lg">
                  <span className="text-sm">Overdraft Protection</span>
                  <span className="font-medium">${feeSchedule?.otherFees.overdraft}</span>
                </div>
                <div className="flex justify-between p-3 border rounded-lg">
                  <span className="text-sm">Stop Payment</span>
                  <span className="font-medium">${feeSchedule?.otherFees.stopPayment}</span>
                </div>
                <div className="flex justify-between p-3 border rounded-lg">
                  <span className="text-sm">Card Replacement</span>
                  <span className="font-medium">${feeSchedule?.otherFees.cardReplacement}</span>
                </div>
                <div className="flex justify-between p-3 border rounded-lg">
                  <span className="text-sm">Rush Delivery</span>
                  <span className="font-medium">${feeSchedule?.otherFees.rushDelivery}</span>
                </div>
                <div className="flex justify-between p-3 border rounded-lg">
                  <span className="text-sm">Domestic Wire</span>
                  <span className="font-medium">${feeSchedule?.transactionFees.domesticWire.base}</span>
                </div>
                <div className="flex justify-between p-3 border rounded-lg">
                  <span className="text-sm">International Wire</span>
                  <span className="font-medium">${feeSchedule?.transactionFees.internationalWire.base}+</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cards" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Physical Cards */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Physical Cards</CardTitle>
                  <Button variant="outline" size="sm" onClick={handleManageCards}>
                    Manage
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {accountSummary?.cards.physical.map((card) => (
                  <div key={card.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        <div>
                          <p className="font-medium">•••• {card.last4}</p>
                          <p className="text-xs text-gray-500 capitalize">{card.brand}</p>
                        </div>
                      </div>
                      <Badge variant={card.status === 'active' ? 'success' : 'secondary'}>
                        {card.status}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Expires</span>
                        <span>{card.expiryDate}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Monthly Limit</span>
                        <span>${card.spendLimit?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Current Spend</span>
                        <span className="font-medium">${card.currentSpend?.toLocaleString()}</span>
                      </div>
                      <Progress
                        value={(card.currentSpend || 0) / (card.spendLimit || 1) * 100}
                        className="h-2"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        {card.status === 'active' ? 'Freeze' : 'Unfreeze'}
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        Set Limit
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Virtual Cards */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Virtual Cards</CardTitle>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Create New
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {accountSummary?.cards.virtual.map((card) => (
                  <div key={card.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        <div>
                          <p className="font-medium">•••• {card.last4}</p>
                          <p className="text-xs text-gray-500 capitalize">{card.brand}</p>
                        </div>
                      </div>
                      <Badge variant={card.status === 'active' ? 'success' : 'secondary'}>
                        {card.status}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Expires</span>
                        <span>{card.expiryDate}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Transaction Limit</span>
                        <span>${card.spendLimit?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Used</span>
                        <span className="font-medium">${card.currentSpend?.toLocaleString()}</span>
                      </div>
                      <Progress
                        value={(card.currentSpend || 0) / (card.spendLimit || 1) * 100}
                        className="h-2"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        Details
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="savings" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Savings Goals</CardTitle>
                  <CardDescription>Track your progress toward financial goals</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => router.push('/savings/new' as any)}>
                  <PiggyBank className="h-4 w-4 mr-2" />
                  New Goal
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {accountSummary?.savingsGoals?.map((goal, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">{goal.name}</p>
                      <p className="text-sm text-gray-500">
                        Target by {goal.deadline.toLocaleDateString()}
                      </p>
                    </div>
                    {goal.autoTransfer && (
                      <Badge variant="outline">
                        <Zap className="h-3 w-3 mr-1" />
                        Auto-save
                      </Badge>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Progress</span>
                      <span className="font-medium">
                        ${goal.current.toLocaleString()} / ${goal.target.toLocaleString()}
                      </span>
                    </div>
                    <Progress value={(goal.current / goal.target) * 100} className="h-2" />
                    <p className="text-xs text-gray-500">
                      {((goal.current / goal.target) * 100).toFixed(0)}% complete •
                      ${(goal.target - goal.current).toLocaleString()} to go
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      Add Funds
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      Edit Goal
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
    </DashboardLayout>
  )
}