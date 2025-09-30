'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import {
  Building,
  Users,
  DollarSign,
  TrendingUp,
  Package,
  CreditCard,
  Calendar,
  Settings,
  Download,
  Plus,
  Edit,
  Eye,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  Shield,
  Globe,
  Heart
} from 'lucide-react'
import type {
  SubscriptionPlan,
  OrganizationSubscription,
  SubscriptionTier,
  BillingCycle,
  OrganizationType
} from '@/types/financialAnalytics'

export default function SubscriptionManagement() {
  const [subscriptions, setSubscriptions] = useState<OrganizationSubscription[]>([])
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [selectedOrg, setSelectedOrg] = useState<OrganizationSubscription | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterTier, setFilterTier] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSubscriptionData()
  }, [])

  const fetchSubscriptionData = async () => {
    setLoading(true)
    try {
      // Mock data - replace with actual API calls
      setPlans([
        {
          id: 'starter',
          tier: 'starter',
          name: 'Starter',
          description: 'Perfect for small teams getting started',
          pricing: {
            base: 499,
            perUser: 25,
            perTransaction: 0.10,
            currency: 'USD',
            billingCycle: 'monthly',
            discount: 0
          },
          limits: {
            users: 10,
            monthlyTransactions: 1000,
            monthlyVolume: 100000,
            apiCalls: 10000
          },
          features: [
            'Basic wallet features',
            'Standard KYC',
            'Email support',
            'API access'
          ],
          isActive: true,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01')
        },
        {
          id: 'growth',
          tier: 'growth',
          name: 'Growth',
          description: 'For growing businesses with advanced needs',
          pricing: {
            base: 2499,
            perUser: 20,
            perTransaction: 0.08,
            currency: 'USD',
            billingCycle: 'monthly',
            discount: 0
          },
          limits: {
            users: 100,
            monthlyTransactions: 10000,
            monthlyVolume: 1000000,
            apiCalls: 100000
          },
          features: [
            'All Starter features',
            'Advanced compliance',
            'Priority support',
            'Custom integrations',
            'Business rules framework'
          ],
          isActive: true,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01')
        },
        {
          id: 'enterprise',
          tier: 'enterprise',
          name: 'Enterprise',
          description: 'Full-featured solution for large organizations',
          pricing: {
            base: 9999,
            perUser: 15,
            perTransaction: 0.05,
            currency: 'USD',
            billingCycle: 'monthly',
            discount: 0
          },
          limits: {
            users: -1, // Unlimited
            monthlyTransactions: -1,
            monthlyVolume: -1,
            apiCalls: -1
          },
          features: [
            'All Growth features',
            'Unlimited everything',
            'Dedicated support',
            'Custom contracts',
            'SLA guarantees',
            'White-label options'
          ],
          isActive: true,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01')
        }
      ])

      setSubscriptions([
        {
          id: '1',
          organizationId: 'org-001',
          organizationName: 'Acme Corporation',
          organizationType: 'enterprise',
          plan: {
            id: 'growth',
            tier: 'growth',
            name: 'Growth',
            description: 'For growing businesses',
            pricing: {
              base: 2499,
              perUser: 20,
              perTransaction: 0.08,
              currency: 'USD',
              billingCycle: 'monthly',
              discount: 10
            },
            limits: {
              users: 100,
              monthlyTransactions: 10000,
              monthlyVolume: 1000000,
              apiCalls: 100000
            },
            features: ['Advanced compliance', 'Priority support', 'Custom integrations'],
            isActive: true,
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01')
          },
          status: 'active',
          startDate: new Date('2024-01-15'),
          usage: {
            activeUsers: 45,
            monthlyTransactions: 3250,
            monthlyVolume: 425000,
            apiCalls: 28500
          },
          costs: {
            baseCost: 2499,
            userCost: 900,
            transactionCost: 260,
            overageCost: 0,
            totalMonthlyCost: 3659,
            annualizedCost: 43908
          },
          billing: {
            lastBilledDate: new Date('2024-10-01'),
            nextBillingDate: new Date('2024-11-01'),
            paymentMethod: 'Credit Card ****4242',
            invoices: ['INV-2024-001', 'INV-2024-002']
          }
        },
        {
          id: '2',
          organizationId: 'org-002',
          organizationName: 'Global Finance Inc',
          organizationType: 'financial',
          plan: {
            id: 'enterprise',
            tier: 'enterprise',
            name: 'Enterprise',
            description: 'Full-featured solution',
            pricing: {
              base: 9999,
              perUser: 15,
              perTransaction: 0.05,
              currency: 'USD',
              billingCycle: 'annual',
              discount: 15
            },
            limits: {
              users: -1,
              monthlyTransactions: -1,
              monthlyVolume: -1,
              apiCalls: -1
            },
            features: ['Unlimited everything', 'Dedicated support', 'SLA guarantees'],
            isActive: true,
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01')
          },
          status: 'active',
          startDate: new Date('2023-06-01'),
          usage: {
            activeUsers: 250,
            monthlyTransactions: 45000,
            monthlyVolume: 8500000,
            apiCalls: 450000
          },
          costs: {
            baseCost: 9999,
            userCost: 3750,
            transactionCost: 2250,
            overageCost: 0,
            totalMonthlyCost: 15999,
            annualizedCost: 191988
          },
          billing: {
            lastBilledDate: new Date('2024-06-01'),
            nextBillingDate: new Date('2025-06-01'),
            paymentMethod: 'ACH Transfer',
            invoices: ['INV-2024-003', 'INV-2024-004']
          }
        },
        {
          id: '3',
          organizationId: 'org-003',
          organizationName: 'State Government Portal',
          organizationType: 'government',
          plan: {
            id: 'custom',
            tier: 'custom',
            name: 'Government Contract',
            description: 'Custom government solution',
            pricing: {
              base: 25000,
              perUser: 10,
              perTransaction: 0.02,
              currency: 'USD',
              billingCycle: 'custom',
              discount: 0
            },
            limits: {
              users: -1,
              monthlyTransactions: -1,
              monthlyVolume: -1,
              apiCalls: -1
            },
            features: ['Custom features', 'FedRAMP compliance', 'Government integrations'],
            customFeatures: ['Custom KYC flow', 'Special reporting', 'Multi-agency support'],
            isActive: true,
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01')
          },
          status: 'active',
          startDate: new Date('2023-01-01'),
          usage: {
            activeUsers: 1250,
            monthlyTransactions: 125000,
            monthlyVolume: 25000000,
            apiCalls: 2500000
          },
          costs: {
            baseCost: 25000,
            userCost: 12500,
            transactionCost: 2500,
            overageCost: 0,
            totalMonthlyCost: 40000,
            annualizedCost: 480000
          },
          billing: {
            lastBilledDate: new Date('2024-07-01'),
            nextBillingDate: new Date('2025-01-01'),
            paymentMethod: 'Government Purchase Order',
            invoices: ['INV-GOV-2024-001']
          }
        },
        {
          id: '4',
          organizationId: 'org-004',
          organizationName: 'MedTech Solutions',
          organizationType: 'healthcare',
          plan: {
            id: 'growth',
            tier: 'growth',
            name: 'Growth',
            description: 'For growing businesses',
            pricing: {
              base: 2499,
              perUser: 20,
              perTransaction: 0.08,
              currency: 'USD',
              billingCycle: 'monthly',
              discount: 0
            },
            limits: {
              users: 100,
              monthlyTransactions: 10000,
              monthlyVolume: 1000000,
              apiCalls: 100000
            },
            features: ['HIPAA compliance', 'Healthcare integrations', 'Priority support'],
            isActive: true,
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01')
          },
          status: 'active',
          startDate: new Date('2024-03-01'),
          usage: {
            activeUsers: 68,
            monthlyTransactions: 8500,
            monthlyVolume: 950000,
            apiCalls: 85000
          },
          costs: {
            baseCost: 2499,
            userCost: 1360,
            transactionCost: 680,
            overageCost: 0,
            totalMonthlyCost: 4539,
            annualizedCost: 54468
          },
          billing: {
            lastBilledDate: new Date('2024-10-01'),
            nextBillingDate: new Date('2024-11-01'),
            paymentMethod: 'Credit Card ****8888',
            invoices: ['INV-2024-005']
          }
        },
        {
          id: '5',
          organizationId: 'org-005',
          organizationName: 'Startup Labs',
          organizationType: 'enterprise',
          plan: {
            id: 'starter',
            tier: 'starter',
            name: 'Starter',
            description: 'Perfect for small teams',
            pricing: {
              base: 499,
              perUser: 25,
              perTransaction: 0.10,
              currency: 'USD',
              billingCycle: 'monthly',
              discount: 0
            },
            limits: {
              users: 10,
              monthlyTransactions: 1000,
              monthlyVolume: 100000,
              apiCalls: 10000
            },
            features: ['Basic wallet features', 'Standard KYC', 'Email support'],
            isActive: true,
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01')
          },
          status: 'trial',
          startDate: new Date('2024-10-15'),
          trialEndsAt: new Date('2024-11-15'),
          usage: {
            activeUsers: 5,
            monthlyTransactions: 125,
            monthlyVolume: 15000,
            apiCalls: 1250
          },
          costs: {
            baseCost: 0, // Trial
            userCost: 0,
            transactionCost: 0,
            overageCost: 0,
            totalMonthlyCost: 0,
            annualizedCost: 0
          },
          billing: {
            lastBilledDate: new Date('2024-10-15'),
            nextBillingDate: new Date('2024-11-15'),
            paymentMethod: 'Not set',
            invoices: []
          }
        }
      ])
    } catch (error) {
      console.error('Failed to fetch subscription data:', error)
    }
    setLoading(false)
  }

  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesStatus = filterStatus === 'all' || sub.status === filterStatus
    const matchesTier = filterTier === 'all' || sub.plan.tier === filterTier
    const matchesSearch = searchQuery === '' ||
      sub.organizationName.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesTier && matchesSearch
  })

  const totalMRR = subscriptions
    .filter(s => s.status === 'active')
    .reduce((sum, s) => sum + s.costs.totalMonthlyCost, 0)

  const totalARR = subscriptions
    .filter(s => s.status === 'active')
    .reduce((sum, s) => sum + s.costs.annualizedCost, 0)

  const activeOrgs = subscriptions.filter(s => s.status === 'active').length
  const trialOrgs = subscriptions.filter(s => s.status === 'trial').length

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case 'trial':
        return <Badge className="bg-blue-100 text-blue-800">Trial</Badge>
      case 'suspended':
        return <Badge className="bg-yellow-100 text-yellow-800">Suspended</Badge>
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getOrgTypeIcon = (type: OrganizationType) => {
    switch (type) {
      case 'enterprise':
        return <Building className="h-4 w-4" />
      case 'government':
        return <Shield className="h-4 w-4" />
      case 'financial':
        return <DollarSign className="h-4 w-4" />
      case 'healthcare':
        return <Heart className="h-4 w-4" />
      case 'education':
        return <Globe className="h-4 w-4" />
      default:
        return <Building className="h-4 w-4" />
    }
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
          <h1 className="text-3xl font-bold">Subscription Management</h1>
          <p className="text-gray-500 mt-2">Manage organization subscriptions and pricing</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Subscription
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Monthly Recurring Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(totalMRR / 1000).toFixed(1)}K</div>
            <p className="text-xs text-green-600 flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +12.5% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Annual Recurring Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(totalARR / 1000000).toFixed(2)}M</div>
            <p className="text-xs text-green-600 flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +85% YoY growth
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Organizations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeOrgs}</div>
            <p className="text-xs text-gray-500 mt-1">
              {trialOrgs} in trial
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Revenue per Org</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${activeOrgs > 0 ? (totalMRR / activeOrgs / 1000).toFixed(1) : 0}K
            </div>
            <p className="text-xs text-green-600 flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +8% increase
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="organizations" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="organizations">Organizations</TabsTrigger>
          <TabsTrigger value="plans">Subscription Plans</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="organizations" className="space-y-4">
          {/* Filters */}
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search organizations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="trial">Trial</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterTier} onValueChange={setFilterTier}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Tiers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tiers</SelectItem>
                <SelectItem value="starter">Starter</SelectItem>
                <SelectItem value="growth">Growth</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Organizations Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Organization</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Users</TableHead>
                    <TableHead>Monthly Cost</TableHead>
                    <TableHead>Next Billing</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubscriptions.map((sub) => (
                    <TableRow key={sub.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getOrgTypeIcon(sub.organizationType)}
                          <div>
                            <p className="font-medium">{sub.organizationName}</p>
                            <p className="text-xs text-gray-500 capitalize">{sub.organizationType}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{sub.plan.name}</p>
                          <p className="text-xs text-gray-500 capitalize">{sub.plan.pricing.billingCycle}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(sub.status)}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p>{sub.usage.activeUsers}</p>
                          {sub.plan.limits.users > 0 && (
                            <p className="text-xs text-gray-500">
                              of {sub.plan.limits.users}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        ${sub.costs.totalMonthlyCost.toLocaleString()}
                        {sub.plan.pricing.discount && sub.plan.pricing.discount > 0 && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            -{sub.plan.pricing.discount}%
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(sub.billing.nextBillingDate).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedOrg(sub)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedOrg(sub)
                              setShowUpgradeDialog(true)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plans" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {plans.map((plan) => (
              <Card key={plan.id} className={plan.tier === 'growth' ? 'border-blue-500' : ''}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{plan.name}</CardTitle>
                      <CardDescription>{plan.description}</CardDescription>
                    </div>
                    {plan.tier === 'growth' && (
                      <Badge className="bg-blue-500 text-white">Popular</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-3xl font-bold">
                      ${plan.pricing.base}
                      <span className="text-sm font-normal text-gray-500">
                        /{plan.pricing.billingCycle}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      + ${plan.pricing.perUser}/user
                    </div>
                    <div className="text-sm text-gray-500">
                      + ${plan.pricing.perTransaction}/transaction
                    </div>
                  </div>

                  <div className="space-y-2 border-t pt-4">
                    <h4 className="font-semibold">Limits</h4>
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span>Users</span>
                        <span className="font-medium">
                          {plan.limits.users === -1 ? 'Unlimited' : plan.limits.users}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Transactions</span>
                        <span className="font-medium">
                          {plan.limits.monthlyTransactions === -1 ? 'Unlimited' : `${plan.limits.monthlyTransactions}/mo`}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Volume</span>
                        <span className="font-medium">
                          {plan.limits.monthlyVolume === -1 ? 'Unlimited' : `$${(plan.limits.monthlyVolume / 1000).toFixed(0)}K/mo`}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 border-t pt-4">
                    <h4 className="font-semibold">Features</h4>
                    <ul className="text-sm space-y-1">
                      {plan.features.slice(0, 4).map((feature, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button className="w-full">
                    {plan.tier === 'enterprise' ? 'Contact Sales' : 'Select Plan'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Revenue by Plan Tier */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Plan Tier</CardTitle>
                <CardDescription>Monthly revenue distribution</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-blue-500" />
                    <span>Starter</span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">$0</p>
                    <p className="text-xs text-gray-500">0 orgs</p>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-green-500" />
                    <span>Growth</span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">$8,198</p>
                    <p className="text-xs text-gray-500">2 orgs</p>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-purple-500" />
                    <span>Enterprise</span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">$15,999</p>
                    <p className="text-xs text-gray-500">1 org</p>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-orange-500" />
                    <span>Custom</span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">$40,000</p>
                    <p className="text-xs text-gray-500">1 org</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Revenue by Organization Type */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Organization Type</CardTitle>
                <CardDescription>Monthly revenue by sector</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    <span>Enterprise</span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">$3,659</p>
                    <p className="text-xs text-gray-500">2 orgs</p>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    <span>Financial</span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">$15,999</p>
                    <p className="text-xs text-gray-500">1 org</p>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    <span>Government</span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">$40,000</p>
                    <p className="text-xs text-gray-500">1 org</p>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    <span>Healthcare</span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">$4,539</p>
                    <p className="text-xs text-gray-500">1 org</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Usage Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Usage vs Limits</CardTitle>
              <CardDescription>Organizations approaching their plan limits</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {subscriptions
                  .filter(s => s.status === 'active' && s.plan.limits.users > 0)
                  .map(sub => {
                    const userUsage = (sub.usage.activeUsers / sub.plan.limits.users) * 100
                    const transactionUsage = sub.plan.limits.monthlyTransactions > 0
                      ? (sub.usage.monthlyTransactions / sub.plan.limits.monthlyTransactions) * 100
                      : 0

                    return (
                      <div key={sub.id} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{sub.organizationName}</span>
                          {(userUsage > 80 || transactionUsage > 80) && (
                            <Badge variant="warning" className="text-xs">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Approaching Limits
                            </Badge>
                          )}
                        </div>
                        <div className="grid gap-2 md:grid-cols-2">
                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>Users</span>
                              <span>{sub.usage.activeUsers} / {sub.plan.limits.users}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  userUsage > 80 ? 'bg-yellow-500' : 'bg-blue-500'
                                }`}
                                style={{ width: `${Math.min(userUsage, 100)}%` }}
                              />
                            </div>
                          </div>
                          {sub.plan.limits.monthlyTransactions > 0 && (
                            <div className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span>Transactions</span>
                                <span>{sub.usage.monthlyTransactions} / {sub.plan.limits.monthlyTransactions}</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${
                                    transactionUsage > 80 ? 'bg-yellow-500' : 'bg-blue-500'
                                  }`}
                                  style={{ width: `${Math.min(transactionUsage, 100)}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Upgrade Dialog */}
      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upgrade Subscription</DialogTitle>
            <DialogDescription>
              Upgrade {selectedOrg?.organizationName} to a higher plan
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Current Plan</Label>
              <p className="text-sm text-gray-500">{selectedOrg?.plan.name} - ${selectedOrg?.costs.totalMonthlyCost}/month</p>
            </div>
            <div>
              <Label htmlFor="new-plan">Select New Plan</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="growth">Growth - $2,499/month</SelectItem>
                  <SelectItem value="enterprise">Enterprise - $9,999/month</SelectItem>
                  <SelectItem value="custom">Custom - Contact Sales</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUpgradeDialog(false)}>
              Cancel
            </Button>
            <Button>
              Upgrade Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}