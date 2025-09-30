'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  CreditCard, DollarSign, ShoppingBag, Clock, MapPin,
  Shield, AlertCircle, CheckCircle, Ban, Plus,
  Settings, Download, RefreshCw, Filter, Calendar,
  TrendingUp, Users, Building, Globe, Lock
} from 'lucide-react'
import type {
  SpendControl,
  SpendControlType,
  SpendControlScope,
  OrganizationType
} from '@/types/compliance'

export default function SpendControlsPage() {
  const router = useRouter()
  const [spendControls, setSpendControls] = useState<SpendControl[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('controls')
  const [filterType, setFilterType] = useState<SpendControlType | 'all'>('all')
  const [filterScope, setFilterScope] = useState<SpendControlScope | 'all'>('all')

  useEffect(() => {
    loadSpendControls()
  }, [])

  const loadSpendControls = async () => {
    setLoading(true)
    try {
      // Mock data - replace with API call
      const mockControls: SpendControl[] = [
        {
          id: 'control-001',
          name: 'Daily Transaction Limit',
          description: 'Maximum daily spending limit for the organization',
          type: 'daily-limit',
          scope: 'organization',
          applies: { organizationId: 'org-123' },
          config: {
            limits: {
              daily: 10000000,
              perTransaction: 1000000
            }
          },
          status: 'active',
          priority: 1,
          createdBy: 'admin',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2025-01-29')
        },
        {
          id: 'control-002',
          name: 'Merchant Category Restrictions',
          description: 'Blocked merchant categories for compliance',
          type: 'merchant-category',
          scope: 'organization',
          applies: { organizationId: 'org-123' },
          config: {
            merchants: {
              blockedCategories: ['7995', '7297', '5933'],
              allowAlcohol: false,
              allowGambling: false,
              allowAdultContent: false,
              allowCrypto: true
            }
          },
          status: 'active',
          priority: 2,
          createdBy: 'admin',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2025-01-29')
        },
        {
          id: 'control-003',
          name: 'Department Budget - Engineering',
          description: 'Monthly budget limit for Engineering department',
          type: 'monthly-limit',
          scope: 'department',
          applies: { departmentId: 'dept-eng' },
          config: {
            limits: {
              monthly: 500000,
              weekly: 125000,
              daily: 25000
            }
          },
          status: 'active',
          priority: 3,
          createdBy: 'finance-lead',
          createdAt: new Date('2024-06-01'),
          updatedAt: new Date('2025-01-15')
        },
        {
          id: 'control-004',
          name: 'International Transaction Block',
          description: 'Restrict international transactions',
          type: 'geography-restriction',
          scope: 'organization',
          applies: { organizationId: 'org-123' },
          config: {
            geoRestrictions: {
              allowedCountries: ['US', 'CA'],
              blockedCountries: [],
              allowedStates: [],
              blockedStates: []
            },
            channels: {
              allowInternational: false
            }
          },
          status: 'active',
          priority: 4,
          createdBy: 'compliance-officer',
          createdAt: new Date('2024-03-15'),
          updatedAt: new Date('2025-01-20')
        },
        {
          id: 'control-005',
          name: 'Weekend Spending Restrictions',
          description: 'Limited spending on weekends',
          type: 'time-restriction',
          scope: 'organization',
          applies: { organizationId: 'org-123' },
          config: {
            timeRestrictions: {
              allowedDays: ['mon', 'tue', 'wed', 'thu', 'fri'],
              allowedHours: { start: '06:00', end: '22:00' },
              timezone: 'America/New_York'
            },
            limits: {
              perTransaction: 10000
            }
          },
          override: {
            allowOverride: true,
            overrideRoles: ['admin', 'finance-lead'],
            overrideDuration: 24,
            requireReason: true
          },
          status: 'active',
          priority: 5,
          createdBy: 'admin',
          createdAt: new Date('2024-09-01'),
          updatedAt: new Date('2025-01-25')
        },
        {
          id: 'control-006',
          name: 'Employee Card Limit - Standard',
          description: 'Standard employee card spending limits',
          type: 'transaction-limit',
          scope: 'user',
          applies: { groupIds: ['employees-standard'] },
          config: {
            limits: {
              perTransaction: 5000,
              daily: 10000,
              monthly: 50000
            },
            velocity: {
              maxTransactionsPerDay: 20,
              maxTransactionsPerHour: 5
            }
          },
          approval: {
            required: true,
            threshold: 2500,
            approvers: ['manager'],
            autoApproveBelow: 500
          },
          status: 'active',
          priority: 6,
          createdBy: 'hr-admin',
          createdAt: new Date('2024-02-01'),
          updatedAt: new Date('2025-01-10')
        }
      ]
      setSpendControls(mockControls)
    } catch (error) {
      console.error('Failed to load spend controls:', error)
    } finally {
      setLoading(false)
    }
  }

  const getControlTypeIcon = (type: SpendControlType) => {
    const icons: Record<SpendControlType, any> = {
      'transaction-limit': CreditCard,
      'daily-limit': Calendar,
      'weekly-limit': Calendar,
      'monthly-limit': Calendar,
      'merchant-category': ShoppingBag,
      'merchant-whitelist': ShoppingBag,
      'merchant-blacklist': Ban,
      'time-restriction': Clock,
      'geography-restriction': MapPin,
      'channel-restriction': Globe
    }
    return icons[type] || Shield
  }

  const getControlTypeBadge = (type: SpendControlType) => {
    const Icon = getControlTypeIcon(type)
    return (
      <Badge variant="outline">
        <Icon className="h-3 w-3 mr-1" />
        {type.replace('-', ' ').toUpperCase()}
      </Badge>
    )
  }

  const getScopeBadge = (scope: SpendControlScope) => {
    const scopeConfig: Record<SpendControlScope, string> = {
      'user': 'bg-blue-100 text-blue-800',
      'card': 'bg-purple-100 text-purple-800',
      'account': 'bg-green-100 text-green-800',
      'department': 'bg-yellow-100 text-yellow-800',
      'organization': 'bg-orange-100 text-orange-800'
    }
    return (
      <Badge className={scopeConfig[scope]}>
        {scope.toUpperCase()}
      </Badge>
    )
  }

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const filteredControls = spendControls.filter(control => {
    if (filterType !== 'all' && control.type !== filterType) return false
    if (filterScope !== 'all' && control.scope !== filterScope) return false
    return true
  })

  const stats = {
    totalControls: spendControls.length,
    activeControls: spendControls.filter(c => c.status === 'active').length,
    organizationControls: spendControls.filter(c => c.scope === 'organization').length,
    userControls: spendControls.filter(c => c.scope === 'user').length
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
          <h1 className="text-3xl font-bold">Spend Controls</h1>
          <p className="text-gray-600 mt-1">
            Configure and manage spending limits and restrictions
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.push('/compliance')}>
            Back to Compliance
          </Button>
          <Button
            variant="gradient"
            onClick={() => router.push('/compliance/spend-controls/create')}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Control
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Controls</p>
                <p className="text-2xl font-bold">{stats.totalControls}</p>
              </div>
              <Shield className="h-8 w-8 text-blue-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active</p>
                <p className="text-2xl font-bold">{stats.activeControls}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Organization-wide</p>
                <p className="text-2xl font-bold">{stats.organizationControls}</p>
              </div>
              <Building className="h-8 w-8 text-purple-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">User-specific</p>
                <p className="text-2xl font-bold">{stats.userControls}</p>
              </div>
              <Users className="h-8 w-8 text-orange-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label className="text-sm mb-2">Filter by Type</Label>
              <select
                className="w-full px-3 py-2 border rounded-lg"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as SpendControlType | 'all')}
              >
                <option value="all">All Types</option>
                <option value="transaction-limit">Transaction Limit</option>
                <option value="daily-limit">Daily Limit</option>
                <option value="weekly-limit">Weekly Limit</option>
                <option value="monthly-limit">Monthly Limit</option>
                <option value="merchant-category">Merchant Category</option>
                <option value="time-restriction">Time Restriction</option>
                <option value="geography-restriction">Geography Restriction</option>
              </select>
            </div>
            <div className="flex-1">
              <Label className="text-sm mb-2">Filter by Scope</Label>
              <select
                className="w-full px-3 py-2 border rounded-lg"
                value={filterScope}
                onChange={(e) => setFilterScope(e.target.value as SpendControlScope | 'all')}
              >
                <option value="all">All Scopes</option>
                <option value="user">User</option>
                <option value="card">Card</option>
                <option value="account">Account</option>
                <option value="department">Department</option>
                <option value="organization">Organization</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button variant="outline" onClick={loadSpendControls}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="controls">Active Controls</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="controls" className="space-y-4 mt-6">
          {filteredControls.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Controls Found</h3>
                <p className="text-gray-500 mb-4">
                  No spend controls match your current filters
                </p>
                <Button
                  variant="gradient"
                  onClick={() => router.push('/compliance/spend-controls/create')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Control
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredControls.map((control) => {
                const Icon = getControlTypeIcon(control.type)
                return (
                  <Card key={control.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100">
                            <Icon className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <CardTitle>{control.name}</CardTitle>
                            <CardDescription>{control.description}</CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getScopeBadge(control.scope)}
                          {getControlTypeBadge(control.type)}
                          <Badge className={
                            control.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }>
                            {control.status.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Limits */}
                        {control.config.limits && (
                          <>
                            {control.config.limits.perTransaction && (
                              <div>
                                <p className="text-sm text-gray-500">Per Transaction</p>
                                <p className="font-semibold">
                                  {formatCurrency(control.config.limits.perTransaction)}
                                </p>
                              </div>
                            )}
                            {control.config.limits.daily && (
                              <div>
                                <p className="text-sm text-gray-500">Daily Limit</p>
                                <p className="font-semibold">
                                  {formatCurrency(control.config.limits.daily)}
                                </p>
                              </div>
                            )}
                            {control.config.limits.weekly && (
                              <div>
                                <p className="text-sm text-gray-500">Weekly Limit</p>
                                <p className="font-semibold">
                                  {formatCurrency(control.config.limits.weekly)}
                                </p>
                              </div>
                            )}
                            {control.config.limits.monthly && (
                              <div>
                                <p className="text-sm text-gray-500">Monthly Limit</p>
                                <p className="font-semibold">
                                  {formatCurrency(control.config.limits.monthly)}
                                </p>
                              </div>
                            )}
                          </>
                        )}

                        {/* Merchant Controls */}
                        {control.config.merchants && (
                          <>
                            {control.config.merchants.blockedCategories && (
                              <div>
                                <p className="text-sm text-gray-500">Blocked MCCs</p>
                                <p className="font-semibold">
                                  {control.config.merchants.blockedCategories.length} categories
                                </p>
                              </div>
                            )}
                            <div>
                              <p className="text-sm text-gray-500">Restrictions</p>
                              <div className="flex gap-2 mt-1">
                                {!control.config.merchants.allowAlcohol && (
                                  <Badge variant="outline" className="text-xs">No Alcohol</Badge>
                                )}
                                {!control.config.merchants.allowGambling && (
                                  <Badge variant="outline" className="text-xs">No Gambling</Badge>
                                )}
                                {control.config.merchants.allowCrypto && (
                                  <Badge variant="outline" className="text-xs">Crypto OK</Badge>
                                )}
                              </div>
                            </div>
                          </>
                        )}

                        {/* Time Restrictions */}
                        {control.config.timeRestrictions && (
                          <>
                            {control.config.timeRestrictions.allowedDays && (
                              <div>
                                <p className="text-sm text-gray-500">Allowed Days</p>
                                <p className="font-semibold">
                                  {control.config.timeRestrictions.allowedDays
                                    .map(d => d.charAt(0).toUpperCase() + d.slice(1))
                                    .join(', ')}
                                </p>
                              </div>
                            )}
                            {control.config.timeRestrictions.allowedHours && (
                              <div>
                                <p className="text-sm text-gray-500">Allowed Hours</p>
                                <p className="font-semibold">
                                  {control.config.timeRestrictions.allowedHours.start} -{' '}
                                  {control.config.timeRestrictions.allowedHours.end}
                                </p>
                              </div>
                            )}
                          </>
                        )}

                        {/* Geo Restrictions */}
                        {control.config.geoRestrictions && (
                          <>
                            {control.config.geoRestrictions.allowedCountries && (
                              <div>
                                <p className="text-sm text-gray-500">Allowed Countries</p>
                                <p className="font-semibold">
                                  {control.config.geoRestrictions.allowedCountries.join(', ')}
                                </p>
                              </div>
                            )}
                          </>
                        )}

                        {/* Priority */}
                        <div>
                          <p className="text-sm text-gray-500">Priority</p>
                          <p className="font-semibold">#{control.priority}</p>
                        </div>
                      </div>

                      {/* Approval Settings */}
                      {control.approval && control.approval.required && (
                        <Alert className="mt-4">
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle>Approval Required</AlertTitle>
                          <AlertDescription>
                            Transactions over {formatCurrency(control.approval.threshold || 0)} require approval.
                            Auto-approved below {formatCurrency(control.approval.autoApproveBelow || 0)}.
                          </AlertDescription>
                        </Alert>
                      )}

                      {/* Override Settings */}
                      {control.override && control.override.allowOverride && (
                        <Alert className="mt-4 border-yellow-200 bg-yellow-50">
                          <Lock className="h-4 w-4 text-yellow-600" />
                          <AlertTitle className="text-yellow-800">Override Available</AlertTitle>
                          <AlertDescription className="text-yellow-600">
                            Can be overridden by: {control.override.overrideRoles?.join(', ')}
                            {control.override.overrideDuration && ` for ${control.override.overrideDuration} hours`}
                          </AlertDescription>
                        </Alert>
                      )}

                      <div className="flex justify-end mt-4 gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/compliance/spend-controls/${control.id}`)}
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Configure
                        </Button>
                        <Button variant="outline" size="sm">
                          {control.status === 'active' ? 'Suspend' : 'Activate'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="templates" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Control Templates</CardTitle>
              <CardDescription>
                Pre-configured spend control templates for quick setup
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border">
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-2">Standard Employee</h4>
                    <p className="text-sm text-gray-500 mb-3">
                      Default spending limits for regular employees
                    </p>
                    <ul className="text-sm space-y-1 mb-3">
                      <li>• $5,000 per transaction</li>
                      <li>• $10,000 daily limit</li>
                      <li>• $50,000 monthly limit</li>
                      <li>• No gambling or adult content</li>
                    </ul>
                    <Button variant="outline" size="sm" className="w-full">
                      Use Template
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border">
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-2">Executive</h4>
                    <p className="text-sm text-gray-500 mb-3">
                      Higher limits for executives and managers
                    </p>
                    <ul className="text-sm space-y-1 mb-3">
                      <li>• $25,000 per transaction</li>
                      <li>• $50,000 daily limit</li>
                      <li>• $250,000 monthly limit</li>
                      <li>• International transactions allowed</li>
                    </ul>
                    <Button variant="outline" size="sm" className="w-full">
                      Use Template
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border">
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-2">Contractor</h4>
                    <p className="text-sm text-gray-500 mb-3">
                      Limited spending for contractors
                    </p>
                    <ul className="text-sm space-y-1 mb-3">
                      <li>• $1,000 per transaction</li>
                      <li>• $2,500 daily limit</li>
                      <li>• $10,000 monthly limit</li>
                      <li>• Weekday only (9 AM - 6 PM)</li>
                    </ul>
                    <Button variant="outline" size="sm" className="w-full">
                      Use Template
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border">
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-2">Travel & Entertainment</h4>
                    <p className="text-sm text-gray-500 mb-3">
                      Specific controls for T&E expenses
                    </p>
                    <ul className="text-sm space-y-1 mb-3">
                      <li>• Hotels, airlines, restaurants allowed</li>
                      <li>• $500 meal limit per day</li>
                      <li>• $3,000 hotel limit per stay</li>
                      <li>• Requires receipt upload</li>
                    </ul>
                    <Button variant="outline" size="sm" className="w-full">
                      Use Template
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Spend Control Analytics</CardTitle>
              <CardDescription>
                Monitor control effectiveness and violations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-2">Transactions Blocked</p>
                  <p className="text-3xl font-bold text-red-600">247</p>
                  <p className="text-sm text-gray-500">Last 30 days</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-2">Amount Prevented</p>
                  <p className="text-3xl font-bold text-orange-600">$1.2M</p>
                  <p className="text-sm text-gray-500">Potential overspend</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-2">Override Requests</p>
                  <p className="text-3xl font-bold text-blue-600">32</p>
                  <p className="text-sm text-gray-500">12 approved</p>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="font-semibold mb-4">Top Violations</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Daily limit exceeded</p>
                      <p className="text-sm text-gray-500">89 attempts blocked</p>
                    </div>
                    <Badge className="bg-red-100 text-red-800">HIGH</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Blocked merchant category</p>
                      <p className="text-sm text-gray-500">67 attempts blocked</p>
                    </div>
                    <Badge className="bg-orange-100 text-orange-800">MEDIUM</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Weekend restriction</p>
                      <p className="text-sm text-gray-500">45 attempts blocked</p>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-800">LOW</Badge>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <Button variant="gradient">
                  <Download className="h-4 w-4 mr-2" />
                  Export Analytics Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}