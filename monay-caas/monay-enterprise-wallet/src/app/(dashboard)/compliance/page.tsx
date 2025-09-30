'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Shield, UserCheck, Building, FileCheck, CreditCard,
  AlertCircle, CheckCircle, Clock, Ban, ArrowRight,
  Users, Briefcase, DollarSign, Activity, TrendingUp,
  FileText, Settings, RefreshCw, Download, Plus
} from 'lucide-react'
import type {
  ComplianceProfile,
  KYCProfile,
  KYBProfile,
  EligibilityCheck,
  SpendControl,
  VerificationStatus,
  VerificationLevel,
  OrganizationType
} from '@/types/compliance'

export default function CompliancePage() {
  const router = useRouter()
  const [organizationType, setOrganizationType] = useState<OrganizationType>('enterprise')
  const [complianceProfile, setComplianceProfile] = useState<ComplianceProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    loadComplianceData()
  }, [])

  const loadComplianceData = async () => {
    setLoading(true)
    try {
      // Mock data - replace with API call
      const mockProfile: ComplianceProfile = {
        entityId: 'org-123',
        entityType: 'business',
        organizationType: 'enterprise',
        kyb: {
          organizationId: 'org-123',
          level: 'full',
          status: 'approved',
          business: {
            legalName: 'TechCorp Inc.',
            type: 'corporation',
            registrationNumber: 'DE-123456',
            taxId: '12-3456789',
            incorporationDate: new Date('2020-01-01'),
            incorporationCountry: 'US',
            incorporationState: 'Delaware',
            industryCode: '5112',
            industryDescription: 'Software Publishers',
            businessDescription: 'Enterprise software solutions'
          },
          ownership: {
            beneficialOwners: [],
            controlStructure: 'direct'
          },
          documents: [
            {
              type: 'incorporation',
              status: 'approved',
              uploadedAt: new Date('2024-01-01'),
              verifiedAt: new Date('2024-01-02')
            },
            {
              type: 'business-license',
              status: 'approved',
              uploadedAt: new Date('2024-01-01'),
              verifiedAt: new Date('2024-01-02')
            }
          ],
          financial: {
            annualRevenue: 50000000,
            monthlyVolume: 4000000,
            bankAccounts: 3,
            creditScore: 750
          },
          verification: {
            businessVerified: true,
            addressVerified: true,
            bankAccountVerified: true,
            riskScore: 25,
            riskLevel: 'low'
          },
          compliance: {
            amlStatus: 'clear',
            sanctionsCheck: 'clear',
            licenseVerified: true,
            regulatoryStatus: 'compliant',
            lastChecked: new Date('2025-01-15'),
            nextReview: new Date('2025-04-15')
          },
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2025-01-15')
        },
        eligibility: {
          checks: [
            {
              id: 'check-1',
              organizationId: 'org-123',
              requirementId: 'req-enterprise-premium',
              result: {
                eligible: true,
                score: 95,
                checks: [
                  { requirement: 'Revenue > $10M', met: true },
                  { requirement: 'Credit Score > 700', met: true },
                  { requirement: 'Years in Business > 2', met: true }
                ]
              },
              checkedAt: new Date('2025-01-01')
            }
          ],
          features: {
            'enterprise-treasury': true,
            'multi-currency': true,
            'api-access': true,
            'white-label': true
          },
          limits: {
            'daily-transaction': 10000000,
            'monthly-volume': 100000000,
            'api-calls': 1000000
          },
          restrictions: []
        },
        spendControls: [
          {
            id: 'control-1',
            name: 'Daily Transaction Limit',
            description: 'Maximum daily spending limit',
            type: 'daily-limit',
            scope: 'organization',
            applies: { organizationId: 'org-123' },
            config: {
              limits: {
                daily: 5000000,
                perTransaction: 500000
              }
            },
            status: 'active',
            priority: 1,
            createdBy: 'admin',
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2025-01-01')
          },
          {
            id: 'control-2',
            name: 'Merchant Category Restrictions',
            description: 'Blocked merchant categories',
            type: 'merchant-category',
            scope: 'organization',
            applies: { organizationId: 'org-123' },
            config: {
              merchants: {
                blockedCategories: ['7995', '7297'],
                allowAlcohol: false,
                allowGambling: false,
                allowCrypto: true
              }
            },
            status: 'active',
            priority: 2,
            createdBy: 'admin',
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2025-01-01')
          }
        ],
        risk: {
          overallScore: 25,
          level: 'low',
          factors: [
            { category: 'Business Verification', score: 20, weight: 0.3 },
            { category: 'Financial Health', score: 15, weight: 0.3 },
            { category: 'Transaction History', score: 30, weight: 0.2 },
            { category: 'Compliance History', score: 10, weight: 0.2 }
          ]
        },
        status: {
          compliant: true,
          issues: []
        },
        monitoring: {
          realTimeChecks: true,
          lastChecked: new Date('2025-01-29'),
          nextReview: new Date('2025-02-29'),
          alerts: []
        },
        auditLog: [],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2025-01-29')
      }
      setComplianceProfile(mockProfile)
      if (mockProfile.organizationType) {
        setOrganizationType(mockProfile.organizationType)
      }
    } catch (error) {
      console.error('Failed to load compliance data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: VerificationStatus) => {
    const statusConfig = {
      'approved': { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      'pending': { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      'in-review': { color: 'bg-blue-100 text-blue-800', icon: Activity },
      'rejected': { color: 'bg-red-100 text-red-800', icon: Ban },
      'expired': { color: 'bg-gray-100 text-gray-800', icon: AlertCircle },
      'not-started': { color: 'bg-gray-100 text-gray-800', icon: AlertCircle },
      'suspended': { color: 'bg-orange-100 text-orange-800', icon: Ban }
    }
    const config = statusConfig[status]
    const Icon = config.icon
    return (
      <Badge className={config.color}>
        <Icon className="h-3 w-3 mr-1" />
        {status.toUpperCase().replace('-', ' ')}
      </Badge>
    )
  }

  const getRiskLevelBadge = (level: 'low' | 'medium' | 'high' | 'unacceptable') => {
    const levelConfig = {
      'low': 'bg-green-100 text-green-800',
      'medium': 'bg-yellow-100 text-yellow-800',
      'high': 'bg-orange-100 text-orange-800',
      'unacceptable': 'bg-red-100 text-red-800'
    }
    return (
      <Badge className={levelConfig[level]}>
        {level.toUpperCase()} RISK
      </Badge>
    )
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
          <h1 className="text-3xl font-bold">Compliance Management</h1>
          <p className="text-gray-600 mt-1">
            KYC/KYB verification, eligibility checks, and spend controls
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={loadComplianceData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="gradient">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Compliance Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Shield className="h-8 w-8 text-green-500" />
              <Badge className="bg-green-100 text-green-800">COMPLIANT</Badge>
            </div>
            <p className="text-sm text-gray-500">Compliance Status</p>
            <p className="text-2xl font-bold">Fully Compliant</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Building className="h-8 w-8 text-blue-500" />
              {complianceProfile?.kyb && getStatusBadge(complianceProfile.kyb.status)}
            </div>
            <p className="text-sm text-gray-500">KYB Verification</p>
            <p className="text-2xl font-bold">
              {complianceProfile?.kyb?.level || 'Not Started'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="h-8 w-8 text-purple-500" />
              {complianceProfile?.risk && getRiskLevelBadge(complianceProfile.risk.level)}
            </div>
            <p className="text-sm text-gray-500">Risk Score</p>
            <p className="text-2xl font-bold">
              {complianceProfile?.risk?.overallScore || 0}/100
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <CreditCard className="h-8 w-8 text-orange-500" />
              <Badge className="bg-blue-100 text-blue-800">ACTIVE</Badge>
            </div>
            <p className="text-sm text-gray-500">Spend Controls</p>
            <p className="text-2xl font-bold">
              {complianceProfile?.spendControls?.length || 0} Active
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="kyb">KYB Verification</TabsTrigger>
          <TabsTrigger value="eligibility">Eligibility</TabsTrigger>
          <TabsTrigger value="spend-controls">Spend Controls</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-6">
          {/* Risk Assessment */}
          <Card>
            <CardHeader>
              <CardTitle>Risk Assessment</CardTitle>
              <CardDescription>
                Overall compliance risk profile and scoring breakdown
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Overall Risk Score</span>
                    <span className="text-sm text-gray-500">
                      {complianceProfile?.risk?.overallScore}/100
                    </span>
                  </div>
                  <Progress
                    value={complianceProfile?.risk?.overallScore || 0}
                    className="h-3"
                  />
                </div>
                {complianceProfile?.risk?.factors.map((factor, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm">{factor.category}</span>
                      <span className="text-sm text-gray-500">
                        {factor.score} (Weight: {factor.weight * 100}%)
                      </span>
                    </div>
                    <Progress value={factor.score} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Compliance Issues */}
          <Card>
            <CardHeader>
              <CardTitle>Compliance Status</CardTitle>
              <CardDescription>
                Current compliance issues and required actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {complianceProfile?.status?.issues.length === 0 ? (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-800">
                    Fully Compliant
                  </AlertTitle>
                  <AlertDescription className="text-green-600">
                    No compliance issues detected. All requirements are met.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-3">
                  {complianceProfile?.status?.issues.map((issue) => (
                    <Alert key={issue.type} variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>{issue.type.toUpperCase()}</AlertTitle>
                      <AlertDescription>
                        {issue.description}
                        {issue.requiredAction && (
                          <div className="mt-2">
                            <strong>Action Required:</strong> {issue.requiredAction}
                          </div>
                        )}
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="kyb" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Business Verification (KYB)</CardTitle>
                  <CardDescription>
                    Business identity verification and documentation
                  </CardDescription>
                </div>
                <Button onClick={() => router.push('/compliance/kyb')}>
                  <Settings className="h-4 w-4 mr-2" />
                  Manage KYB
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {complianceProfile?.kyb && (
                <div className="space-y-6">
                  {/* Business Information */}
                  <div>
                    <h3 className="font-semibold mb-3">Business Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Legal Name</p>
                        <p className="font-medium">
                          {complianceProfile.kyb.business.legalName}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Business Type</p>
                        <p className="font-medium">
                          {complianceProfile.kyb.business.type}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Tax ID</p>
                        <p className="font-medium">
                          {complianceProfile.kyb.business.taxId}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Industry</p>
                        <p className="font-medium">
                          {complianceProfile.kyb.business.industryDescription}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Verification Status */}
                  <div>
                    <h3 className="font-semibold mb-3">Verification Status</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="flex items-center gap-2">
                        {complianceProfile.kyb.verification.businessVerified ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-gray-400" />
                        )}
                        <span>Business Verified</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {complianceProfile.kyb.verification.addressVerified ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-gray-400" />
                        )}
                        <span>Address Verified</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {complianceProfile.kyb.verification.bankAccountVerified ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-gray-400" />
                        )}
                        <span>Bank Account Verified</span>
                      </div>
                    </div>
                  </div>

                  {/* Documents */}
                  <div>
                    <h3 className="font-semibold mb-3">Documents</h3>
                    <div className="space-y-2">
                      {complianceProfile.kyb.documents.map((doc, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileCheck className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="font-medium">
                                {doc.type.replace('-', ' ').toUpperCase()}
                              </p>
                              <p className="text-sm text-gray-500">
                                Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          {getStatusBadge(doc.status)}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="eligibility" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Eligibility & Features</CardTitle>
                  <CardDescription>
                    Feature eligibility and access limits
                  </CardDescription>
                </div>
                <Button onClick={() => router.push('/compliance/eligibility')}>
                  <FileText className="h-4 w-4 mr-2" />
                  View Requirements
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Features */}
                <div>
                  <h3 className="font-semibold mb-3">Enabled Features</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {Object.entries(complianceProfile?.eligibility?.features || {}).map(([feature, enabled]) => (
                      <div key={feature} className="flex items-center gap-2">
                        {enabled ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <Ban className="h-5 w-5 text-gray-400" />
                        )}
                        <span className="text-sm">
                          {feature.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Limits */}
                <div>
                  <h3 className="font-semibold mb-3">Transaction Limits</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.entries(complianceProfile?.eligibility?.limits || {}).map(([limit, value]) => (
                      <div key={limit} className="p-3 border rounded-lg">
                        <p className="text-sm text-gray-500">
                          {limit.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </p>
                        <p className="text-xl font-bold">
                          {typeof value === 'number' ? `$${value.toLocaleString()}` : value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Eligibility Checks */}
                <div>
                  <h3 className="font-semibold mb-3">Eligibility Checks</h3>
                  <div className="space-y-3">
                    {complianceProfile?.eligibility?.checks.map((check) => (
                      <Card key={check.id} className="border">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <Badge className={check.result.eligible ?
                              'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                            }>
                              {check.result.eligible ? 'ELIGIBLE' : 'NOT ELIGIBLE'}
                            </Badge>
                            {check.result.score && (
                              <span className="text-sm text-gray-500">
                                Score: {check.result.score}/100
                              </span>
                            )}
                          </div>
                          <div className="space-y-2">
                            {check.result.checks.map((item, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-sm">
                                {item.met ? (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                  <Ban className="h-4 w-4 text-red-500" />
                                )}
                                <span>{item.requirement}</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="spend-controls" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Spend Controls</CardTitle>
                  <CardDescription>
                    Active spending limits and restrictions
                  </CardDescription>
                </div>
                <Button variant="gradient" onClick={() => router.push('/compliance/spend-controls/create')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Control
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {complianceProfile?.spendControls?.map((control) => (
                  <Card key={control.id} className="border">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-semibold">{control.name}</h4>
                          <p className="text-sm text-gray-500">{control.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={control.status === 'active' ?
                            'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }>
                            {control.status.toUpperCase()}
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/compliance/spend-controls/${control.id}`)}
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Type</p>
                          <p className="font-medium">
                            {control.type.replace('-', ' ').toUpperCase()}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Scope</p>
                          <p className="font-medium">{control.scope.toUpperCase()}</p>
                        </div>
                        {control.config.limits?.daily && (
                          <div>
                            <p className="text-gray-500">Daily Limit</p>
                            <p className="font-medium">
                              ${control.config.limits.daily.toLocaleString()}
                            </p>
                          </div>
                        )}
                        {control.config.limits?.perTransaction && (
                          <div>
                            <p className="text-gray-500">Per Transaction</p>
                            <p className="font-medium">
                              ${control.config.limits.perTransaction.toLocaleString()}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Monitoring</CardTitle>
              <CardDescription>
                Real-time compliance monitoring and alerts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Monitoring Status */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2">
                    {complianceProfile?.monitoring?.realTimeChecks ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <Ban className="h-5 w-5 text-gray-400" />
                    )}
                    <span className="text-sm">Real-time Checks</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Last Checked</p>
                    <p className="font-medium">
                      {complianceProfile?.monitoring?.lastChecked ?
                        new Date(complianceProfile.monitoring.lastChecked).toLocaleDateString() :
                        'Never'
                      }
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Next Review</p>
                    <p className="font-medium">
                      {complianceProfile?.monitoring?.nextReview ?
                        new Date(complianceProfile.monitoring.nextReview).toLocaleDateString() :
                        'Not scheduled'
                      }
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Active Alerts</p>
                    <p className="font-medium">
                      {complianceProfile?.monitoring?.alerts.length || 0}
                    </p>
                  </div>
                </div>

                {/* Alerts */}
                <div>
                  <h3 className="font-semibold mb-3">Recent Alerts</h3>
                  {complianceProfile?.monitoring?.alerts.length === 0 ? (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertTitle>No Active Alerts</AlertTitle>
                      <AlertDescription>
                        All compliance checks are passing successfully.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <div className="space-y-3">
                      {complianceProfile?.monitoring?.alerts.map((alert) => (
                        <Alert key={alert.id} variant={alert.severity === 'error' ? 'destructive' : 'default'}>
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle>{alert.type}</AlertTitle>
                          <AlertDescription>
                            {alert.message}
                            <div className="mt-2 text-xs text-gray-500">
                              {new Date(alert.timestamp).toLocaleString()}
                            </div>
                          </AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}