'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import BusinessRulesFramework from '@/components/BusinessRulesFramework'
import EnhancedBusinessRulesEngine from '@/components/EnhancedBusinessRulesEngine'
import {
  GitBranch, Plus, Shield, Zap, Activity,
  Building, Landmark, TrendingUp, Heart, GraduationCap,
  Search, Filter, RefreshCw, TestTube, BarChart3,
  Code, Settings, AlertCircle, CheckCircle, Clock
} from 'lucide-react'
import type {
  BusinessRule,
  OrganizationType,
  RuleCategory,
  RuleStatus,
  RulePriority,
  EnterpriseRuleSet,
  GovernmentRuleSet,
  FinancialInstitutionRuleSet
} from '@/types/businessRules'

// Organization type icons
const orgTypeIcons: Record<OrganizationType, React.ElementType> = {
  'enterprise': Building,
  'government': Landmark,
  'financial-institution': TrendingUp,
  'healthcare': Heart,
  'education': GraduationCap
}

// Organization type colors
const orgTypeColors: Record<OrganizationType, string> = {
  'enterprise': 'blue',
  'government': 'purple',
  'financial-institution': 'green',
  'healthcare': 'red',
  'education': 'orange'
}

export default function BusinessRulesPage() {
  const router = useRouter()
  const [organizationType, setOrganizationType] = useState<OrganizationType>('enterprise')
  const [rules, setRules] = useState<BusinessRule[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'testing'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<RuleCategory | 'all'>('all')

  useEffect(() => {
    // Get organization type from localStorage or API
    const storedOrgType = localStorage.getItem('organizationType') as OrganizationType
    if (storedOrgType) {
      setOrganizationType(storedOrgType)
    }
    loadRules()
  }, [])

  const loadRules = async () => {
    setLoading(true)
    try {
      // Load rules from localStorage
      const storedRules = localStorage.getItem('createdBusinessRules')
      const createdRules = storedRules ? JSON.parse(storedRules) : []

      // Mock data based on organization type
      const mockRules: BusinessRule[] = [
        {
          id: '1',
          name: 'Multi-Level Payment Approval',
          description: 'Require multiple approvals for high-value transactions',
          organizationType,
          category: organizationType === 'enterprise' ? 'payment-approval' :
                   organizationType === 'government' ? 'budget-controls' :
                   'trading-limits',
          config: {
            priority: 'high',
            status: 'active',
            version: 1,
            triggers: [{
              type: 'transaction',
              parameters: { eventType: 'payment_initiated' }
            }],
            conditions: [{
              id: '1',
              field: 'amount',
              operator: 'greater-than',
              value: 100000,
              dataType: 'number'
            }],
            actions: [{
              id: '1',
              type: 'escalate',
              parameters: {
                approvalLevels: 2,
                approvers: ['cfo@company.com', 'ceo@company.com'],
                timeoutHours: 24
              }
            }],
            execution: {
              mode: 'sync',
              timeout: 30
            },
            compliance: {
              regulations: ['SOX', 'SOC2'],
              auditLog: true,
              dataRetention: 2555
            }
          },
          createdBy: 'admin@monay.com',
          createdAt: new Date('2025-01-15'),
          lastExecutedAt: new Date(),
          stats: {
            executionCount: 1234,
            successCount: 1200,
            failureCount: 34,
            avgExecutionTime: 250
          }
        },
        {
          id: '2',
          name: 'Vendor Whitelist Enforcement',
          description: 'Only allow payments to pre-approved vendors',
          organizationType,
          category: organizationType === 'enterprise' ? 'vendor-management' :
                   organizationType === 'government' ? 'procurement-rules' :
                   'risk-management',
          config: {
            priority: 'critical',
            status: 'active',
            version: 2,
            triggers: [{
              type: 'transaction',
              parameters: { eventType: 'vendor_payment' }
            }],
            conditions: [{
              id: '1',
              field: 'vendor_id',
              operator: 'not-in',
              value: ['approved_vendor_list'],
              dataType: 'array'
            }],
            actions: [{
              id: '1',
              type: 'reject',
              parameters: {
                message: 'Vendor not on approved list'
              }
            }, {
              id: '2',
              type: 'notify',
              parameters: {
                notificationChannels: ['email', 'push'],
                recipients: ['compliance@company.com']
              }
            }],
            execution: {
              mode: 'sync',
              timeout: 10
            }
          },
          createdBy: 'compliance@monay.com',
          createdAt: new Date('2025-02-01'),
          stats: {
            executionCount: 5678,
            successCount: 5600,
            failureCount: 78,
            avgExecutionTime: 150
          }
        },
        {
          id: '3',
          name: 'Smart Contract Auto-Execution',
          description: 'Automatically execute smart contracts based on conditions',
          organizationType,
          category: organizationType === 'enterprise' ? 'compliance-checks' :
                   organizationType === 'government' ? 'regulatory-compliance' :
                   'settlement-rules',
          config: {
            priority: 'medium',
            status: 'testing',
            version: 1,
            triggers: [{
              type: 'smart-contract',
              parameters: {
                contractAddress: '0x1234...',
                eventName: 'PaymentReceived'
              }
            }],
            conditions: [{
              id: '1',
              field: 'contract_status',
              operator: 'equals',
              value: 'fulfilled',
              dataType: 'string'
            }],
            actions: [{
              id: '1',
              type: 'execute-contract',
              parameters: {
                contractAddress: '0x5678...',
                functionName: 'releasePayment',
                gasLimit: BigInt('100000')
              }
            }],
            execution: {
              mode: 'async',
              timeout: 60,
              retryPolicy: {
                maxAttempts: 3,
                backoffMultiplier: 2
              }
            }
          },
          createdBy: 'dev@monay.com',
          createdAt: new Date('2025-09-01'),
          stats: {
            executionCount: 234,
            successCount: 230,
            failureCount: 4,
            avgExecutionTime: 3500
          }
        }
      ]

      // Combine created rules with mock rules
      const allRules = [...createdRules, ...mockRules]
      setRules(allRules)
    } catch (error) {
      console.error('Failed to load business rules:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: RuleStatus) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      inactive: { color: 'bg-gray-100 text-gray-800', icon: Clock },
      testing: { color: 'bg-yellow-100 text-yellow-800', icon: TestTube },
      archived: { color: 'bg-red-100 text-red-800', icon: AlertCircle }
    }
    const config = statusConfig[status]
    const Icon = config.icon

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {status.toUpperCase()}
      </Badge>
    )
  }

  const getPriorityBadge = (priority: RulePriority) => {
    const priorityConfig = {
      critical: 'bg-red-100 text-red-800',
      high: 'bg-orange-100 text-orange-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800'
    }
    return (
      <Badge className={priorityConfig[priority]}>
        {priority.toUpperCase()}
      </Badge>
    )
  }

  const getCategoryOptions = (): RuleCategory[] => {
    switch (organizationType) {
      case 'enterprise':
        return ['payment-approval', 'spending-limits', 'vendor-management', 'treasury-controls', 'compliance-checks']
      case 'government':
        return ['budget-controls', 'procurement-rules', 'grant-management', 'citizen-services', 'regulatory-compliance']
      case 'financial-institution':
        return ['trading-limits', 'risk-management', 'settlement-rules', 'capital-requirements', 'regulatory-reporting']
      case 'healthcare':
        return ['hipaa-compliance', 'billing-rules', 'insurance-verification', 'patient-privacy', 'prescription-controls']
      case 'education':
        return ['tuition-management', 'scholarship-rules', 'grant-allocation', 'student-verification', 'financial-aid']
      default:
        return []
    }
  }

  const filteredRules = rules.filter(rule => {
    if (activeTab !== 'all' && rule.config.status !== activeTab) return false
    if (categoryFilter !== 'all' && rule.category !== categoryFilter) return false
    if (searchTerm && !rule.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !rule.description.toLowerCase().includes(searchTerm.toLowerCase())) return false
    return true
  })

  const stats = {
    totalRules: rules.length,
    activeRules: rules.filter(r => r.config.status === 'active').length,
    testingRules: rules.filter(r => r.config.status === 'testing').length,
    totalExecutions: rules.reduce((sum, r) => sum + (r.stats?.executionCount || 0), 0),
    avgSuccessRate: rules.reduce((sum, r) => {
      if (r.stats && r.stats.executionCount > 0) {
        return sum + (r.stats.successCount / r.stats.executionCount)
      }
      return sum
    }, 0) / rules.length * 100
  }

  const OrgIcon = orgTypeIcons[organizationType]
  const orgColor = orgTypeColors[organizationType]

  return (
    <div className="space-y-6">
      {/* Header with Organization Type Selector */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-lg bg-${orgColor}-100`}>
            <OrgIcon className={`h-6 w-6 text-${orgColor}-600`} />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Business Rules</h1>
            <p className="text-gray-600 mt-1">
              Programmable money rules for {organizationType.replace('-', ' ')}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => router.push('/business-rules/templates')}
          >
            <Code className="h-4 w-4 mr-2" />
            Templates
          </Button>
          <Button
            variant="gradient"
            onClick={() => router.push('/business-rules/create')}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Rule
          </Button>
        </div>
      </div>

      {/* Organization Type Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Organization Context</CardTitle>
          <CardDescription>
            Rules adapt based on your organization type
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-3">
            {Object.entries(orgTypeIcons).map(([type, Icon]) => (
              <button
                key={type}
                onClick={() => {
                  setOrganizationType(type as OrganizationType)
                  localStorage.setItem('organizationType', type)
                  loadRules()
                }}
                className={`p-4 rounded-lg border-2 transition-all ${
                  organizationType === type
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Icon className="h-6 w-6 mx-auto mb-2" />
                <p className="text-xs font-medium capitalize">
                  {type.replace('-', ' ')}
                </p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Rules</p>
                <p className="text-2xl font-bold">{stats.totalRules}</p>
              </div>
              <GitBranch className="h-8 w-8 text-blue-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Rules</p>
                <p className="text-2xl font-bold">{stats.activeRules}</p>
              </div>
              <Activity className="h-8 w-8 text-green-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Testing</p>
                <p className="text-2xl font-bold">{stats.testingRules}</p>
              </div>
              <TestTube className="h-8 w-8 text-yellow-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Executions</p>
                <p className="text-2xl font-bold">
                  {stats.totalExecutions.toLocaleString()}
                </p>
              </div>
              <Zap className="h-8 w-8 text-purple-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Success Rate</p>
                <p className="text-2xl font-bold">
                  {stats.avgSuccessRate.toFixed(1)}%
                </p>
              </div>
              <Shield className="h-8 w-8 text-orange-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search rules..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <select
              className="px-4 py-2 border rounded-lg"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as RuleCategory | 'all')}
            >
              <option value="all">All Categories</option>
              {getCategoryOptions().map(category => (
                <option key={category} value={category}>
                  {category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </select>
            <Button variant="outline" onClick={loadRules}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Rules Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList>
          <TabsTrigger value="all">All Rules</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="testing">Testing</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading business rules...</p>
            </div>
          ) : filteredRules.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <GitBranch className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Rules Found</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || categoryFilter !== 'all'
                    ? 'No rules match your search criteria'
                    : 'Create your first programmable money rule'}
                </p>
                <Button variant="gradient" onClick={() => router.push('/business-rules/create')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Rule
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredRules.map((rule) => (
                <Card key={rule.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100">
                          <GitBranch className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold text-lg">{rule.name}</h3>
                            {getStatusBadge(rule.config.status)}
                            {getPriorityBadge(rule.config.priority)}
                            <Badge variant="outline">v{rule.config.version}</Badge>
                          </div>
                          <p className="text-gray-600 mt-1">{rule.description}</p>
                          <div className="flex items-center gap-6 mt-3 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Zap className="h-4 w-4" />
                              {rule.stats?.executionCount.toLocaleString()} executions
                            </span>
                            <span className="flex items-center gap-1">
                              <CheckCircle className="h-4 w-4" />
                              {((rule.stats?.successCount || 0) / (rule.stats?.executionCount || 1) * 100).toFixed(1)}% success
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {rule.stats?.avgExecutionTime}ms avg
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/business-rules/${rule.id}/test`)}
                        >
                          <TestTube className="h-4 w-4 mr-2" />
                          Test
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/business-rules/${rule.id}/analytics`)}
                        >
                          <BarChart3 className="h-4 w-4 mr-2" />
                          Analytics
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/business-rules/${rule.id}/edit`)}
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Framework Components */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Visual Rule Builder</CardTitle>
            <CardDescription>
              Drag-and-drop interface for creating complex rules
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BusinessRulesFramework />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rule Engine</CardTitle>
            <CardDescription>
              Enhanced execution engine with real-time monitoring
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EnhancedBusinessRulesEngine />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}