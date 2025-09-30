'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  FileCheck, CheckCircle, XCircle, AlertCircle, Plus,
  DollarSign, Users, CreditCard, Building, Shield,
  TrendingUp, Clock, Calendar, Hash, Briefcase,
  Settings, RefreshCw, Download, ArrowRight, Info
} from 'lucide-react'
import type {
  EligibilityRequirement,
  EligibilityCheck,
  EligibilityType,
  OrganizationType
} from '@/types/compliance'

export default function EligibilityPage() {
  const router = useRouter()
  const [requirements, setRequirements] = useState<EligibilityRequirement[]>([])
  const [checks, setChecks] = useState<EligibilityCheck[]>([])
  const [organizationType, setOrganizationType] = useState<OrganizationType>('enterprise')
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('requirements')

  useEffect(() => {
    loadEligibilityData()
  }, [])

  const loadEligibilityData = async () => {
    setLoading(true)
    try {
      // Mock data - replace with API call
      const mockRequirements: EligibilityRequirement[] = [
        {
          id: 'req-001',
          type: 'account-opening',
          name: 'Enterprise Account Opening',
          description: 'Requirements for opening an enterprise account',
          requirements: {
            verificationLevel: 'full',
            minBalance: 10000,
            creditScoreMin: 650,
            businessType: ['corporation', 'llc'],
            minRevenue: 1000000,
            yearsInBusiness: 2
          },
          organizationType: 'enterprise',
          autoApprove: false,
          manualReviewRequired: true
        },
        {
          id: 'req-002',
          type: 'credit-line',
          name: 'Business Credit Line',
          description: 'Eligibility for business credit line',
          requirements: {
            verificationLevel: 'full',
            minBalance: 50000,
            creditScoreMin: 720,
            minRevenue: 5000000,
            yearsInBusiness: 3,
            accountAge: 180
          },
          organizationType: 'enterprise',
          autoApprove: false,
          manualReviewRequired: true
        },
        {
          id: 'req-003',
          type: 'investment-product',
          name: 'Treasury Investment Access',
          description: 'Access to treasury investment products',
          requirements: {
            verificationLevel: 'accredited',
            accreditedInvestor: true,
            minBalance: 250000,
            minIncome: 200000
          },
          organizationType: 'enterprise',
          autoApprove: false
        },
        {
          id: 'req-004',
          type: 'feature-access',
          name: 'API Access',
          description: 'Full API access for enterprise integration',
          requirements: {
            verificationLevel: 'enhanced',
            accountAge: 30,
            minBalance: 1000
          },
          organizationType: 'enterprise',
          autoApprove: true
        }
      ]

      const mockChecks: EligibilityCheck[] = [
        {
          id: 'check-001',
          organizationId: 'org-123',
          requirementId: 'req-001',
          result: {
            eligible: true,
            score: 95,
            checks: [
              { requirement: 'Verification Level: full', met: true },
              { requirement: 'Minimum Balance: $10,000', met: true, value: 150000 },
              { requirement: 'Credit Score: 650+', met: true, value: 750 },
              { requirement: 'Business Type: corporation/llc', met: true, value: 'corporation' },
              { requirement: 'Annual Revenue: $1M+', met: true, value: 75000000 },
              { requirement: 'Years in Business: 2+', met: true, value: 5 }
            ]
          },
          checkedAt: new Date('2025-01-29')
        },
        {
          id: 'check-002',
          organizationId: 'org-123',
          requirementId: 'req-002',
          result: {
            eligible: false,
            score: 70,
            missingRequirements: ['Account age insufficient'],
            checks: [
              { requirement: 'Verification Level: full', met: true },
              { requirement: 'Minimum Balance: $50,000', met: true, value: 150000 },
              { requirement: 'Credit Score: 720+', met: true, value: 750 },
              { requirement: 'Annual Revenue: $5M+', met: true, value: 75000000 },
              { requirement: 'Years in Business: 3+', met: true, value: 5 },
              { requirement: 'Account Age: 180+ days', met: false, value: 90, reason: 'Account is only 90 days old' }
            ]
          },
          checkedAt: new Date('2025-01-29')
        },
        {
          id: 'check-003',
          organizationId: 'org-123',
          requirementId: 'req-003',
          result: {
            eligible: false,
            score: 50,
            missingRequirements: ['Not an accredited investor'],
            checks: [
              { requirement: 'Verification Level: accredited', met: false, value: 'full' },
              { requirement: 'Accredited Investor', met: false },
              { requirement: 'Minimum Balance: $250,000', met: false, value: 150000 },
              { requirement: 'Minimum Income: $200,000', met: true, value: 500000 }
            ]
          },
          checkedAt: new Date('2025-01-29')
        },
        {
          id: 'check-004',
          organizationId: 'org-123',
          requirementId: 'req-004',
          result: {
            eligible: true,
            score: 100,
            checks: [
              { requirement: 'Verification Level: enhanced', met: true, value: 'full' },
              { requirement: 'Account Age: 30+ days', met: true, value: 90 },
              { requirement: 'Minimum Balance: $1,000', met: true, value: 150000 }
            ]
          },
          checkedAt: new Date('2025-01-29')
        }
      ]

      setRequirements(mockRequirements)
      setChecks(mockChecks)
    } catch (error) {
      console.error('Failed to load eligibility data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getEligibilityTypeBadge = (type: EligibilityType) => {
    const typeConfig: Record<EligibilityType, { color: string; icon: any }> = {
      'account-opening': { color: 'bg-blue-100 text-blue-800', icon: Building },
      'feature-access': { color: 'bg-purple-100 text-purple-800', icon: Shield },
      'benefit-enrollment': { color: 'bg-green-100 text-green-800', icon: Users },
      'investment-product': { color: 'bg-yellow-100 text-yellow-800', icon: TrendingUp },
      'credit-line': { color: 'bg-orange-100 text-orange-800', icon: CreditCard },
      'government-program': { color: 'bg-indigo-100 text-indigo-800', icon: Building },
      'grant-application': { color: 'bg-pink-100 text-pink-800', icon: DollarSign }
    }
    const config = typeConfig[type]
    const Icon = config.icon
    return (
      <Badge className={config.color}>
        <Icon className="h-3 w-3 mr-1" />
        {type.replace('-', ' ').toUpperCase()}
      </Badge>
    )
  }

  const getEligibilityScore = (score: number): { color: string; label: string } => {
    if (score >= 90) return { color: 'text-green-600', label: 'Excellent' }
    if (score >= 70) return { color: 'text-blue-600', label: 'Good' }
    if (score >= 50) return { color: 'text-yellow-600', label: 'Fair' }
    return { color: 'text-red-600', label: 'Poor' }
  }

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount)
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
          <h1 className="text-3xl font-bold">Eligibility Management</h1>
          <p className="text-gray-600 mt-1">
            Configure and check eligibility requirements for features and services
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.push('/compliance')}>
            Back to Compliance
          </Button>
          <Button variant="gradient">
            <Plus className="h-4 w-4 mr-2" />
            Add Requirement
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Requirements</p>
                <p className="text-2xl font-bold">{requirements.length}</p>
              </div>
              <FileCheck className="h-8 w-8 text-blue-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Checks Performed</p>
                <p className="text-2xl font-bold">{checks.length}</p>
              </div>
              <Shield className="h-8 w-8 text-purple-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Eligible</p>
                <p className="text-2xl font-bold">
                  {checks.filter(c => c.result.eligible).length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Not Eligible</p>
                <p className="text-2xl font-bold">
                  {checks.filter(c => !c.result.eligible).length}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="requirements">Requirements</TabsTrigger>
          <TabsTrigger value="checks">Eligibility Checks</TabsTrigger>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value="requirements" className="space-y-4 mt-6">
          <div className="space-y-4">
            {requirements.map((requirement) => (
              <Card key={requirement.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div>
                        <CardTitle>{requirement.name}</CardTitle>
                        <CardDescription>{requirement.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getEligibilityTypeBadge(requirement.type)}
                      {requirement.autoApprove && (
                        <Badge className="bg-green-100 text-green-800">AUTO-APPROVE</Badge>
                      )}
                      {requirement.manualReviewRequired && (
                        <Badge className="bg-yellow-100 text-yellow-800">MANUAL REVIEW</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {requirement.requirements.verificationLevel && (
                      <div>
                        <p className="text-sm text-gray-500">Verification Level</p>
                        <p className="font-medium capitalize">
                          {requirement.requirements.verificationLevel}
                        </p>
                      </div>
                    )}
                    {requirement.requirements.minBalance && (
                      <div>
                        <p className="text-sm text-gray-500">Minimum Balance</p>
                        <p className="font-medium">
                          {formatCurrency(requirement.requirements.minBalance)}
                        </p>
                      </div>
                    )}
                    {requirement.requirements.creditScoreMin && (
                      <div>
                        <p className="text-sm text-gray-500">Credit Score</p>
                        <p className="font-medium">{requirement.requirements.creditScoreMin}+</p>
                      </div>
                    )}
                    {requirement.requirements.minRevenue && (
                      <div>
                        <p className="text-sm text-gray-500">Minimum Revenue</p>
                        <p className="font-medium">
                          {formatCurrency(requirement.requirements.minRevenue)}
                        </p>
                      </div>
                    )}
                    {requirement.requirements.yearsInBusiness && (
                      <div>
                        <p className="text-sm text-gray-500">Years in Business</p>
                        <p className="font-medium">{requirement.requirements.yearsInBusiness}+</p>
                      </div>
                    )}
                    {requirement.requirements.accountAge && (
                      <div>
                        <p className="text-sm text-gray-500">Account Age</p>
                        <p className="font-medium">{requirement.requirements.accountAge} days</p>
                      </div>
                    )}
                    {requirement.requirements.accreditedInvestor && (
                      <div>
                        <p className="text-sm text-gray-500">Investor Status</p>
                        <p className="font-medium">Accredited Required</p>
                      </div>
                    )}
                    {requirement.requirements.businessType && (
                      <div>
                        <p className="text-sm text-gray-500">Business Types</p>
                        <p className="font-medium">
                          {requirement.requirements.businessType.join(', ').toUpperCase()}
                        </p>
                      </div>
                    )}
                    {requirement.requirements.minIncome && (
                      <div>
                        <p className="text-sm text-gray-500">Minimum Income</p>
                        <p className="font-medium">
                          {formatCurrency(requirement.requirements.minIncome)}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end mt-4 gap-2">
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      Configure
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/compliance/eligibility/${requirement.id}`)}
                    >
                      View Details
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="checks" className="space-y-4 mt-6">
          <div className="space-y-4">
            {checks.map((check) => {
              const requirement = requirements.find(r => r.id === check.requirementId)
              const scoreInfo = check.result.score ? getEligibilityScore(check.result.score) : null

              return (
                <Card key={check.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-3">
                          {requirement?.name || 'Unknown Requirement'}
                          {check.result.eligible ? (
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              ELIGIBLE
                            </Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-800">
                              <XCircle className="h-3 w-3 mr-1" />
                              NOT ELIGIBLE
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription>
                          Checked on {new Date(check.checkedAt).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      {check.result.score && scoreInfo && (
                        <div className="text-center">
                          <p className={`text-2xl font-bold ${scoreInfo.color}`}>
                            {check.result.score}
                          </p>
                          <p className="text-sm text-gray-500">{scoreInfo.label}</p>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {check.result.missingRequirements && check.result.missingRequirements.length > 0 && (
                      <Alert className="mb-4 border-red-200 bg-red-50">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <AlertTitle className="text-red-800">Missing Requirements</AlertTitle>
                        <AlertDescription className="text-red-600">
                          <ul className="list-disc list-inside mt-2">
                            {check.result.missingRequirements.map((req, idx) => (
                              <li key={idx}>{req}</li>
                            ))}
                          </ul>
                        </AlertDescription>
                      </Alert>
                    )}

                    <div className="space-y-2">
                      {check.result.checks.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 border rounded">
                          <div className="flex items-center gap-2">
                            {item.met ? (
                              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                            )}
                            <span className="text-sm">{item.requirement}</span>
                          </div>
                          {item.value !== undefined && (
                            <span className="text-sm font-medium">
                              {typeof item.value === 'number' && item.requirement.toLowerCase().includes('$')
                                ? formatCurrency(item.value)
                                : item.value}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>

                    {check.override && check.override.overridden && (
                      <Alert className="mt-4 border-yellow-200 bg-yellow-50">
                        <Info className="h-4 w-4 text-yellow-600" />
                        <AlertTitle className="text-yellow-800">Manual Override Applied</AlertTitle>
                        <AlertDescription className="text-yellow-600">
                          Reason: {check.override.reason || 'Administrative override'}
                          <br />
                          Authorized by: {check.override.authorizedBy} on{' '}
                          {check.override.authorizedAt && new Date(check.override.authorizedAt).toLocaleDateString()}
                        </AlertDescription>
                      </Alert>
                    )}

                    <div className="flex justify-end mt-4 gap-2">
                      <Button variant="outline" size="sm">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Re-check
                      </Button>
                      {!check.result.eligible && (
                        <Button variant="outline" size="sm">
                          Request Override
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="configuration" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Eligibility Configuration</CardTitle>
              <CardDescription>
                Configure eligibility checking behavior and thresholds
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-4">Auto-Approval Settings</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Enable Auto-Approval</Label>
                        <p className="text-sm text-gray-500">
                          Automatically approve eligible applications
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Require Manual Review for High-Value</Label>
                        <p className="text-sm text-gray-500">
                          Manual review for accounts over threshold
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-4">Scoring Thresholds</h3>
                  <div className="space-y-4">
                    <div>
                      <Label>Auto-Approve Score Threshold</Label>
                      <Input type="number" defaultValue="90" />
                    </div>
                    <div>
                      <Label>Manual Review Score Range</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Input type="number" defaultValue="50" placeholder="Min" />
                        <Input type="number" defaultValue="89" placeholder="Max" />
                      </div>
                    </div>
                    <div>
                      <Label>Auto-Reject Score Threshold</Label>
                      <Input type="number" defaultValue="49" />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-4">Check Frequency</h3>
                  <div className="space-y-4">
                    <div>
                      <Label>Re-check Interval (Days)</Label>
                      <Input type="number" defaultValue="90" />
                    </div>
                    <div>
                      <Label>Eligibility Expiration (Days)</Label>
                      <Input type="number" defaultValue="365" />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <Button variant="outline">Reset to Defaults</Button>
                  <Button variant="gradient">Save Configuration</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}