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
  Building, Shield, FileCheck, Users, TrendingUp,
  CheckCircle, Clock, Ban, AlertCircle, Upload,
  DollarSign, Calendar, MapPin, Briefcase, Hash,
  RefreshCw, Download, Settings, Plus, ChevronRight
} from 'lucide-react'
import type {
  KYBProfile,
  KYCProfile,
  VerificationStatus,
  VerificationLevel,
  DocumentType
} from '@/types/compliance'

export default function KYBManagementPage() {
  const router = useRouter()
  const [kybProfiles, setKybProfiles] = useState<KYBProfile[]>([])
  const [selectedProfile, setSelectedProfile] = useState<KYBProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('organizations')

  useEffect(() => {
    loadKYBProfiles()
  }, [])

  const loadKYBProfiles = async () => {
    setLoading(true)
    try {
      // Mock data - replace with API call
      const mockProfiles: KYBProfile[] = [
        {
          organizationId: 'org-001',
          level: 'full',
          status: 'approved',
          business: {
            legalName: 'TechCorp Inc.',
            dba: 'TechCorp',
            type: 'corporation',
            registrationNumber: 'DE-123456789',
            taxId: '12-3456789',
            incorporationDate: new Date('2020-01-15'),
            incorporationCountry: 'US',
            incorporationState: 'Delaware',
            industryCode: '5112',
            industryDescription: 'Software Publishers',
            businessDescription: 'Enterprise software development and consulting'
          },
          ownership: {
            beneficialOwners: [],
            controlStructure: 'direct'
          },
          documents: [
            {
              type: 'incorporation',
              status: 'approved',
              uploadedAt: new Date('2024-11-01'),
              verifiedAt: new Date('2024-11-02'),
              expiresAt: new Date('2025-11-01')
            },
            {
              type: 'business-license',
              status: 'approved',
              uploadedAt: new Date('2024-11-01'),
              verifiedAt: new Date('2024-11-02')
            },
            {
              type: 'financial-statement',
              status: 'approved',
              uploadedAt: new Date('2024-12-01'),
              verifiedAt: new Date('2024-12-02')
            }
          ],
          financial: {
            annualRevenue: 75000000,
            monthlyVolume: 6000000,
            bankAccounts: 4,
            creditScore: 780,
            financialStatements: true
          },
          verification: {
            businessVerified: true,
            addressVerified: true,
            bankAccountVerified: true,
            riskScore: 20,
            riskLevel: 'low'
          },
          compliance: {
            amlStatus: 'clear',
            sanctionsCheck: 'clear',
            licenseVerified: true,
            regulatoryStatus: 'compliant',
            lastChecked: new Date('2025-01-29'),
            nextReview: new Date('2025-04-29')
          },
          createdAt: new Date('2024-11-01'),
          updatedAt: new Date('2025-01-29'),
          verifiedAt: new Date('2024-11-02')
        },
        {
          organizationId: 'org-002',
          level: 'enhanced',
          status: 'in-review',
          business: {
            legalName: 'StartupCo LLC',
            type: 'llc',
            registrationNumber: 'CA-987654321',
            taxId: '98-7654321',
            incorporationDate: new Date('2023-06-01'),
            incorporationCountry: 'US',
            incorporationState: 'California',
            industryCode: '5415',
            industryDescription: 'Computer Systems Design',
            businessDescription: 'AI-powered analytics platform'
          },
          ownership: {
            beneficialOwners: [],
            controlStructure: 'direct'
          },
          documents: [
            {
              type: 'incorporation',
              status: 'pending',
              uploadedAt: new Date('2025-01-25')
            }
          ],
          financial: {
            annualRevenue: 2000000,
            monthlyVolume: 150000,
            bankAccounts: 1,
            creditScore: 650
          },
          verification: {
            businessVerified: false,
            addressVerified: true,
            bankAccountVerified: false,
            riskScore: 45,
            riskLevel: 'medium'
          },
          compliance: {
            amlStatus: 'review',
            sanctionsCheck: 'clear',
            lastChecked: new Date('2025-01-25'),
            nextReview: new Date('2025-02-25')
          },
          createdAt: new Date('2025-01-25'),
          updatedAt: new Date('2025-01-25')
        }
      ]
      setKybProfiles(mockProfiles)
      if (mockProfiles.length > 0) {
        setSelectedProfile(mockProfiles[0])
      }
    } catch (error) {
      console.error('Failed to load KYB profiles:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: VerificationStatus) => {
    const statusConfig = {
      'approved': { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      'pending': { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      'in-review': { color: 'bg-blue-100 text-blue-800', icon: Building },
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
          <h1 className="text-3xl font-bold">KYB Management</h1>
          <p className="text-gray-600 mt-1">
            Business verification and compliance management
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.push('/compliance')}>
            Back to Compliance
          </Button>
          <Button variant="gradient">
            <Plus className="h-4 w-4 mr-2" />
            Add Organization
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Organizations</p>
                <p className="text-2xl font-bold">{kybProfiles.length}</p>
              </div>
              <Building className="h-8 w-8 text-blue-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Verified</p>
                <p className="text-2xl font-bold">
                  {kybProfiles.filter(p => p.status === 'approved').length}
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
                <p className="text-sm text-gray-500">Total Revenue</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(kybProfiles.reduce((sum, p) => sum + (p.financial?.annualRevenue || 0), 0))}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Avg Risk Score</p>
                <p className="text-2xl font-bold">
                  {Math.round(kybProfiles.reduce((sum, p) => sum + p.verification.riskScore, 0) / kybProfiles.length)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="organizations">Organizations</TabsTrigger>
          <TabsTrigger value="ownership">Ownership</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="organizations" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Organization List */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Organizations</CardTitle>
                  <CardDescription>
                    Select an organization to view details
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {kybProfiles.map(profile => (
                      <div
                        key={profile.organizationId}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedProfile?.organizationId === profile.organizationId
                            ? 'border-blue-500 bg-blue-50'
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => setSelectedProfile(profile)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-medium">{profile.business.legalName}</p>
                            <p className="text-sm text-gray-500">
                              {profile.business.type.toUpperCase()}
                            </p>
                          </div>
                          {getStatusBadge(profile.status)}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Industry</span>
                            <span>{profile.business.industryCode}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Risk</span>
                            {getRiskLevelBadge(profile.verification.riskLevel)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Organization Details */}
            <div className="lg:col-span-2">
              {selectedProfile && (
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>{selectedProfile.business.legalName}</CardTitle>
                        <CardDescription>
                          Business verification and details
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Export
                        </Button>
                        <Button variant="gradient" size="sm">
                          <Settings className="h-4 w-4 mr-2" />
                          Manage
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Business Information */}
                      <div>
                        <h3 className="font-semibold mb-3">Business Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">Legal Name</p>
                            <p className="font-medium">{selectedProfile.business.legalName}</p>
                          </div>
                          {selectedProfile.business.dba && (
                            <div>
                              <p className="text-sm text-gray-500">DBA</p>
                              <p className="font-medium">{selectedProfile.business.dba}</p>
                            </div>
                          )}
                          <div>
                            <p className="text-sm text-gray-500">Business Type</p>
                            <p className="font-medium capitalize">{selectedProfile.business.type}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Tax ID (EIN)</p>
                            <p className="font-medium">{selectedProfile.business.taxId}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Incorporation Date</p>
                            <p className="font-medium">
                              {new Date(selectedProfile.business.incorporationDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Location</p>
                            <p className="font-medium">
                              {selectedProfile.business.incorporationState}, {selectedProfile.business.incorporationCountry}
                            </p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-sm text-gray-500">Industry</p>
                            <p className="font-medium">
                              {selectedProfile.business.industryDescription} ({selectedProfile.business.industryCode})
                            </p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-sm text-gray-500">Business Description</p>
                            <p className="font-medium">{selectedProfile.business.businessDescription}</p>
                          </div>
                        </div>
                      </div>

                      {/* Verification Status */}
                      <div>
                        <h3 className="font-semibold mb-3">Verification Status</h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <Building className="h-5 w-5 text-gray-400" />
                              <span>Business Verification</span>
                            </div>
                            {selectedProfile.verification.businessVerified ? (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : (
                              <Ban className="h-5 w-5 text-red-500" />
                            )}
                          </div>
                          <div className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <MapPin className="h-5 w-5 text-gray-400" />
                              <span>Address Verification</span>
                            </div>
                            {selectedProfile.verification.addressVerified ? (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : (
                              <Ban className="h-5 w-5 text-red-500" />
                            )}
                          </div>
                          <div className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <DollarSign className="h-5 w-5 text-gray-400" />
                              <span>Bank Account Verification</span>
                            </div>
                            {selectedProfile.verification.bankAccountVerified ? (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : (
                              <Ban className="h-5 w-5 text-red-500" />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Risk Assessment */}
                      <div>
                        <h3 className="font-semibold mb-3">Risk Assessment</h3>
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm">Risk Score</span>
                              <span className="text-sm text-gray-500">
                                {selectedProfile.verification.riskScore}/100
                              </span>
                            </div>
                            <Progress
                              value={selectedProfile.verification.riskScore}
                              className="h-2"
                            />
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Risk Level</span>
                            {getRiskLevelBadge(selectedProfile.verification.riskLevel)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="ownership" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Ownership Structure</CardTitle>
              <CardDescription>
                Beneficial owners and control structure
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedProfile && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-3">Control Structure</h3>
                    <Badge className="bg-blue-100 text-blue-800">
                      {selectedProfile.ownership.controlStructure.toUpperCase()}
                    </Badge>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Beneficial Owners</h3>
                    {selectedProfile.ownership.beneficialOwners.length === 0 ? (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>No Beneficial Owners Listed</AlertTitle>
                        <AlertDescription>
                          Beneficial ownership information needs to be provided for full compliance.
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <div className="space-y-3">
                        {selectedProfile.ownership.beneficialOwners.map((owner, idx) => (
                          <Card key={idx} className="border">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium">Owner #{idx + 1}</p>
                                  <p className="text-sm text-gray-500">
                                    {owner.ownershipPercentage}% ownership
                                  </p>
                                </div>
                                {owner.isController && (
                                  <Badge>Controller</Badge>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                    <Button variant="outline" className="w-full mt-4">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Beneficial Owner
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Financial Information</CardTitle>
              <CardDescription>
                Revenue, banking, and credit information
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedProfile?.financial && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Annual Revenue</p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(selectedProfile.financial.annualRevenue || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Monthly Volume</p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(selectedProfile.financial.monthlyVolume || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Credit Score</p>
                    <p className="text-2xl font-bold">
                      {selectedProfile.financial.creditScore || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Bank Accounts</p>
                    <p className="text-2xl font-bold">
                      {selectedProfile.financial.bankAccounts || 0}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileCheck className="h-5 w-5 text-gray-400" />
                        <span>Financial Statements</span>
                      </div>
                      {selectedProfile.financial.financialStatements ? (
                        <Badge className="bg-green-100 text-green-800">PROVIDED</Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-800">NOT PROVIDED</Badge>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Business Documents</CardTitle>
                  <CardDescription>
                    Required documentation for business verification
                  </CardDescription>
                </div>
                <Button variant="gradient">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Document
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {selectedProfile && (
                <div className="space-y-4">
                  {selectedProfile.documents.map((doc, idx) => (
                    <Card key={idx} className="border">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <FileCheck className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="font-medium">
                                {doc.type.replace('-', ' ').toUpperCase()}
                              </p>
                              <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                                <span>Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}</span>
                                {doc.verifiedAt && (
                                  <span>Verified: {new Date(doc.verifiedAt).toLocaleDateString()}</span>
                                )}
                                {doc.expiresAt && (
                                  <span>Expires: {new Date(doc.expiresAt).toLocaleDateString()}</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {getStatusBadge(doc.status)}
                            <Button variant="outline" size="sm">View</Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Status</CardTitle>
              <CardDescription>
                AML, sanctions, and regulatory compliance checks
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedProfile?.compliance && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">AML Status</p>
                      <Badge className={
                        selectedProfile.compliance.amlStatus === 'clear'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }>
                        {selectedProfile.compliance.amlStatus.toUpperCase()}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Sanctions Check</p>
                      <Badge className={
                        selectedProfile.compliance.sanctionsCheck === 'clear'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }>
                        {selectedProfile.compliance.sanctionsCheck.toUpperCase()}
                      </Badge>
                    </div>
                    {selectedProfile.compliance.licenseVerified !== undefined && (
                      <div>
                        <p className="text-sm text-gray-500">License Status</p>
                        <Badge className={
                          selectedProfile.compliance.licenseVerified
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }>
                          {selectedProfile.compliance.licenseVerified ? 'VERIFIED' : 'PENDING'}
                        </Badge>
                      </div>
                    )}
                    {selectedProfile.compliance.regulatoryStatus && (
                      <div>
                        <p className="text-sm text-gray-500">Regulatory Status</p>
                        <Badge className="bg-green-100 text-green-800">
                          {selectedProfile.compliance.regulatoryStatus.toUpperCase()}
                        </Badge>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-gray-500">Last Checked</p>
                      <p className="font-medium">
                        {new Date(selectedProfile.compliance.lastChecked).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Next Review</p>
                      <p className="font-medium">
                        {new Date(selectedProfile.compliance.nextReview).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3">
                    <Button variant="outline">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Run Compliance Check
                    </Button>
                    <Button variant="gradient">
                      <Download className="h-4 w-4 mr-2" />
                      Download Report
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}