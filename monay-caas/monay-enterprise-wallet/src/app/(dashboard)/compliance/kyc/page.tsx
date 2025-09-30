'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  UserCheck, Upload, FileText, Shield, AlertCircle,
  CheckCircle, Clock, Ban, RefreshCw, Download,
  User, Calendar, MapPin, CreditCard, Building,
  Globe, Phone, Mail, Hash, FileCheck
} from 'lucide-react'
import type {
  KYCProfile,
  VerificationStatus,
  VerificationLevel,
  DocumentType,
  KYCProvider
} from '@/types/compliance'

export default function KYCManagementPage() {
  const router = useRouter()
  const [kycProfiles, setKycProfiles] = useState<KYCProfile[]>([])
  const [selectedProfile, setSelectedProfile] = useState<KYCProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('profiles')

  useEffect(() => {
    loadKYCProfiles()
  }, [])

  const loadKYCProfiles = async () => {
    setLoading(true)
    try {
      // Mock data - replace with API call
      const mockProfiles: KYCProfile[] = [
        {
          userId: 'user-001',
          level: 'full',
          status: 'approved',
          personal: {
            firstName: 'John',
            lastName: 'Smith',
            dateOfBirth: new Date('1985-03-15'),
            nationality: 'US',
            residenceCountry: 'US'
          },
          documents: [
            {
              type: 'passport',
              status: 'approved',
              uploadedAt: new Date('2024-12-01'),
              verifiedAt: new Date('2024-12-02'),
              expiresAt: new Date('2029-12-01'),
              provider: 'persona',
              providerRef: 'doc-123'
            },
            {
              type: 'utility-bill',
              status: 'approved',
              uploadedAt: new Date('2024-12-01'),
              verifiedAt: new Date('2024-12-02')
            }
          ],
          verification: {
            identityScore: 95,
            addressVerified: true,
            sanctionsCheck: 'clear',
            pepCheck: false,
            adverseMedia: false,
            riskScore: 15,
            riskLevel: 'low'
          },
          compliance: {
            amlStatus: 'clear',
            ofacCheck: true,
            euSanctions: true,
            unSanctions: true,
            lastChecked: new Date('2025-01-29'),
            nextReview: new Date('2025-04-29')
          },
          createdAt: new Date('2024-12-01'),
          updatedAt: new Date('2025-01-29'),
          verifiedAt: new Date('2024-12-02')
        },
        {
          userId: 'user-002',
          level: 'basic',
          status: 'in-review',
          personal: {
            firstName: 'Jane',
            lastName: 'Doe',
            dateOfBirth: new Date('1990-07-20'),
            nationality: 'CA',
            residenceCountry: 'US'
          },
          documents: [
            {
              type: 'drivers-license',
              status: 'pending',
              uploadedAt: new Date('2025-01-28')
            }
          ],
          verification: {
            addressVerified: false,
            sanctionsCheck: 'clear',
            pepCheck: false,
            adverseMedia: false,
            riskScore: 35,
            riskLevel: 'medium'
          },
          compliance: {
            amlStatus: 'review',
            ofacCheck: false,
            euSanctions: false,
            unSanctions: false,
            lastChecked: new Date('2025-01-28'),
            nextReview: new Date('2025-02-28')
          },
          createdAt: new Date('2025-01-28'),
          updatedAt: new Date('2025-01-28')
        }
      ]
      setKycProfiles(mockProfiles)
      if (mockProfiles.length > 0) {
        setSelectedProfile(mockProfiles[0])
      }
    } catch (error) {
      console.error('Failed to load KYC profiles:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: VerificationStatus) => {
    const statusConfig = {
      'approved': { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      'pending': { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      'in-review': { color: 'bg-blue-100 text-blue-800', icon: UserCheck },
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

  const getDocumentIcon = (type: DocumentType) => {
    const icons: Record<DocumentType, any> = {
      'passport': Globe,
      'drivers-license': CreditCard,
      'national-id': CreditCard,
      'bank-statement': Building,
      'utility-bill': FileText,
      'tax-return': FileText,
      'incorporation': Building,
      'business-license': Building,
      'financial-statement': FileText
    }
    return icons[type] || FileText
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
          <h1 className="text-3xl font-bold">KYC Management</h1>
          <p className="text-gray-600 mt-1">
            Individual identity verification and compliance
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.push('/compliance')}>
            Back to Compliance
          </Button>
          <Button variant="gradient">
            <Upload className="h-4 w-4 mr-2" />
            Start New KYC
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Profiles</p>
                <p className="text-2xl font-bold">{kycProfiles.length}</p>
              </div>
              <User className="h-8 w-8 text-blue-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Approved</p>
                <p className="text-2xl font-bold">
                  {kycProfiles.filter(p => p.status === 'approved').length}
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
                <p className="text-sm text-gray-500">Pending Review</p>
                <p className="text-2xl font-bold">
                  {kycProfiles.filter(p => p.status === 'in-review' || p.status === 'pending').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">High Risk</p>
                <p className="text-2xl font-bold">
                  {kycProfiles.filter(p => p.verification.riskLevel === 'high' || p.verification.riskLevel === 'unacceptable').length}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="profiles">Profiles</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="verification">Verification</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="profiles" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile List */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>KYC Profiles</CardTitle>
                  <CardDescription>
                    Select a profile to view details
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {kycProfiles.map(profile => (
                      <div
                        key={profile.userId}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedProfile?.userId === profile.userId
                            ? 'border-blue-500 bg-blue-50'
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => setSelectedProfile(profile)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-medium">
                              {profile.personal.firstName} {profile.personal.lastName}
                            </p>
                            <p className="text-sm text-gray-500">
                              {profile.userId}
                            </p>
                          </div>
                          {getStatusBadge(profile.status)}
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Level: {profile.level}</span>
                          {getRiskLevelBadge(profile.verification.riskLevel)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Profile Details */}
            <div className="lg:col-span-2">
              {selectedProfile && (
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Profile Details</CardTitle>
                        <CardDescription>
                          Complete identity verification information
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Export
                        </Button>
                        <Button variant="outline" size="sm">
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Re-verify
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Personal Information */}
                      <div>
                        <h3 className="font-semibold mb-3">Personal Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm text-gray-500">Full Name</Label>
                            <p className="font-medium">
                              {selectedProfile.personal.firstName} {selectedProfile.personal.lastName}
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm text-gray-500">Date of Birth</Label>
                            <p className="font-medium">
                              {new Date(selectedProfile.personal.dateOfBirth).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm text-gray-500">Nationality</Label>
                            <p className="font-medium">{selectedProfile.personal.nationality}</p>
                          </div>
                          <div>
                            <Label className="text-sm text-gray-500">Residence</Label>
                            <p className="font-medium">{selectedProfile.personal.residenceCountry}</p>
                          </div>
                        </div>
                      </div>

                      {/* Verification Results */}
                      <div>
                        <h3 className="font-semibold mb-3">Verification Results</h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <UserCheck className="h-5 w-5 text-gray-400" />
                              <span>Identity Verification</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {selectedProfile.verification.identityScore && (
                                <span className="text-sm text-gray-500">
                                  Score: {selectedProfile.verification.identityScore}/100
                                </span>
                              )}
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            </div>
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
                              <Shield className="h-5 w-5 text-gray-400" />
                              <span>Sanctions Check</span>
                            </div>
                            <Badge className="bg-green-100 text-green-800">
                              {selectedProfile.verification.sanctionsCheck.toUpperCase()}
                            </Badge>
                          </div>

                          <div className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <AlertCircle className="h-5 w-5 text-gray-400" />
                              <span>PEP Check</span>
                            </div>
                            {!selectedProfile.verification.pepCheck ? (
                              <Badge className="bg-green-100 text-green-800">NO MATCH</Badge>
                            ) : (
                              <Badge className="bg-red-100 text-red-800">MATCH FOUND</Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Compliance Status */}
                      <div>
                        <h3 className="font-semibold mb-3">Compliance Status</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm text-gray-500">AML Status</Label>
                            <Badge className={
                              selectedProfile.compliance.amlStatus === 'clear'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }>
                              {selectedProfile.compliance.amlStatus.toUpperCase()}
                            </Badge>
                          </div>
                          <div>
                            <Label className="text-sm text-gray-500">Risk Level</Label>
                            {getRiskLevelBadge(selectedProfile.verification.riskLevel)}
                          </div>
                          <div>
                            <Label className="text-sm text-gray-500">Last Checked</Label>
                            <p className="font-medium">
                              {new Date(selectedProfile.compliance.lastChecked).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm text-gray-500">Next Review</Label>
                            <p className="font-medium">
                              {new Date(selectedProfile.compliance.nextReview).toLocaleDateString()}
                            </p>
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

        <TabsContent value="documents" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Document Management</CardTitle>
              <CardDescription>
                Uploaded identity and verification documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedProfile && (
                <div className="space-y-4">
                  {selectedProfile.documents.map((doc, idx) => {
                    const DocIcon = getDocumentIcon(doc.type)
                    return (
                      <Card key={idx} className="border">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-gray-100">
                                <DocIcon className="h-6 w-6 text-gray-600" />
                              </div>
                              <div>
                                <h4 className="font-semibold">
                                  {doc.type.replace('-', ' ').toUpperCase()}
                                </h4>
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
                              {doc.provider && (
                                <Badge variant="outline">{doc.provider.toUpperCase()}</Badge>
                              )}
                              {getStatusBadge(doc.status)}
                              <Button variant="outline" size="sm">
                                View
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                  <Button variant="outline" className="w-full">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload New Document
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="verification" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Verification Providers</CardTitle>
              <CardDescription>
                Configure KYC verification provider settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(['persona', 'alloy', 'onfido', 'jumio', 'sumsub'] as KYCProvider[]).map(provider => (
                  <Card key={provider} className="border">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold capitalize">{provider}</h4>
                          <p className="text-sm text-gray-500">
                            Identity verification and compliance provider
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className="bg-green-100 text-green-800">ACTIVE</Badge>
                          <Button variant="outline" size="sm">Configure</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>KYC Settings</CardTitle>
              <CardDescription>
                Configure KYC requirements and thresholds
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-3">Verification Levels</h3>
                  <div className="space-y-3">
                    {(['basic', 'enhanced', 'full', 'accredited'] as VerificationLevel[]).map(level => (
                      <div key={level} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium capitalize">{level} Level</p>
                          <p className="text-sm text-gray-500">
                            Required documents and verification steps
                          </p>
                        </div>
                        <Button variant="outline" size="sm">Configure</Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Risk Thresholds</h3>
                  <div className="space-y-4">
                    <div>
                      <Label>Low Risk Threshold</Label>
                      <Input type="number" defaultValue="30" />
                    </div>
                    <div>
                      <Label>Medium Risk Threshold</Label>
                      <Input type="number" defaultValue="60" />
                    </div>
                    <div>
                      <Label>High Risk Threshold</Label>
                      <Input type="number" defaultValue="80" />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button variant="gradient">Save Settings</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}