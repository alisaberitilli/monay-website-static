'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Upload,
  Camera,
  FileText,
  Shield,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  Building2,
  CreditCard,
  MapPin,
  Phone,
  Mail,
  Globe,
  Fingerprint,
  ScanFace,
  FileCheck,
  Clock,
  ArrowRight,
  ArrowLeft,
  Download,
  Eye,
  RefreshCcw,
  Loader2
} from 'lucide-react'

interface KYCDocument {
  type: 'passport' | 'drivers_license' | 'national_id' | 'proof_of_address' | 'bank_statement' | 'business_license'
  name: string
  status: 'not_uploaded' | 'uploaded' | 'reviewing' | 'approved' | 'rejected'
  url?: string
  uploadedAt?: Date
  reviewNotes?: string
}

interface VerificationStep {
  id: number
  name: string
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  required: boolean
}

export default function KYCVerificationWorkflow({ customerId }: { customerId?: string }) {
  const [currentStep, setCurrentStep] = useState(1)
  const [verificationProgress, setVerificationProgress] = useState(25)
  const [isUploading, setIsUploading] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)

  const [documents, setDocuments] = useState<KYCDocument[]>([
    { type: 'passport', name: 'Passport or National ID', status: 'not_uploaded' },
    { type: 'proof_of_address', name: 'Proof of Address', status: 'not_uploaded' },
    { type: 'bank_statement', name: 'Bank Statement', status: 'not_uploaded' },
  ])

  const [steps] = useState<VerificationStep[]>([
    { id: 1, name: 'Personal Information', status: 'in_progress', required: true },
    { id: 2, name: 'Document Upload', status: 'pending', required: true },
    { id: 3, name: 'Identity Verification', status: 'pending', required: true },
    { id: 4, name: 'Address Verification', status: 'pending', required: true },
    { id: 5, name: 'Risk Assessment', status: 'pending', required: true },
    { id: 6, name: 'Final Review', status: 'pending', required: false },
  ])

  const handleFileUpload = async (documentType: string, file: File) => {
    setIsUploading(true)

    // Simulate upload
    setTimeout(() => {
      setDocuments(docs => docs.map(doc =>
        doc.type === documentType
          ? { ...doc, status: 'uploaded', uploadedAt: new Date() }
          : doc
      ))
      setIsUploading(false)
    }, 2000)
  }

  const handleStartVerification = () => {
    setIsVerifying(true)

    // Simulate verification process
    setTimeout(() => {
      setDocuments(docs => docs.map(doc => ({
        ...doc,
        status: 'approved'
      })))
      setVerificationProgress(100)
      setIsVerifying(false)
    }, 3000)
  }

  const getDocumentStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>
      case 'reviewing':
        return <Badge className="bg-yellow-100 text-yellow-800">Reviewing</Badge>
      case 'uploaded':
        return <Badge className="bg-blue-100 text-blue-800">Uploaded</Badge>
      default:
        return <Badge variant="outline">Not Uploaded</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <Card>
        <CardHeader>
          <CardTitle>KYC Verification Process</CardTitle>
          <CardDescription>
            Complete the verification process to enable full account features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span>Overall Progress</span>
              <span className="font-medium">{verificationProgress}%</span>
            </div>
            <Progress value={verificationProgress} className="h-2" />

            {/* Step Indicators */}
            <div className="flex items-center justify-between mt-6">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={`
                    flex items-center justify-center w-10 h-10 rounded-full border-2
                    ${step.status === 'completed' ? 'bg-green-500 border-green-500 text-white' :
                      step.status === 'in_progress' ? 'bg-blue-500 border-blue-500 text-white' :
                      step.status === 'failed' ? 'bg-red-500 border-red-500 text-white' :
                      'bg-white border-gray-300 text-gray-500'}
                  `}>
                    {step.status === 'completed' ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : step.status === 'failed' ? (
                      <XCircle className="h-5 w-5" />
                    ) : (
                      <span>{step.id}</span>
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-full h-1 mx-2 ${
                      steps[index + 1].status !== 'pending' ? 'bg-blue-500' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between mt-2">
              {steps.map(step => (
                <div key={step.id} className="text-xs text-center max-w-[100px]">
                  <div className="font-medium">{step.name}</div>
                  {step.required && (
                    <Badge variant="outline" className="mt-1 text-xs">Required</Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Verification Content */}
      <Tabs value={`step-${currentStep}`} onValueChange={(v) => setCurrentStep(parseInt(v.split('-')[1]))}>
        <TabsList className="grid grid-cols-6 w-full">
          {steps.map(step => (
            <TabsTrigger
              key={step.id}
              value={`step-${step.id}`}
              disabled={step.status === 'pending' && step.id !== currentStep}
            >
              {step.name.split(' ')[0]}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Step 1: Personal Information */}
        <TabsContent value="step-1">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Provide your personal details for identity verification</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" placeholder="John" />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" placeholder="Doe" />
                  </div>
                  <div>
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input id="dateOfBirth" type="date" />
                  </div>
                  <div>
                    <Label htmlFor="nationality">Nationality</Label>
                    <Input id="nationality" placeholder="United States" />
                  </div>
                  <div>
                    <Label htmlFor="idNumber">ID Number</Label>
                    <Input id="idNumber" placeholder="Passport or National ID" />
                  </div>
                  <div>
                    <Label htmlFor="taxId">Tax ID / SSN</Label>
                    <Input id="taxId" placeholder="XXX-XX-XXXX" />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Contact Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input id="email" type="email" className="pl-10" placeholder="john@example.com" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input id="phone" type="tel" className="pl-10" placeholder="+1 555-0123" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Residential Address</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <Label htmlFor="address">Street Address</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input id="address" className="pl-10" placeholder="123 Main St, Apt 4B" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input id="city" placeholder="New York" />
                    </div>
                    <div>
                      <Label htmlFor="state">State/Province</Label>
                      <Input id="state" placeholder="NY" />
                    </div>
                    <div>
                      <Label htmlFor="zipCode">ZIP/Postal Code</Label>
                      <Input id="zipCode" placeholder="10001" />
                    </div>
                    <div>
                      <Label htmlFor="country">Country</Label>
                      <Input id="country" placeholder="United States" />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" disabled>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                  <Button onClick={() => setCurrentStep(2)}>
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Step 2: Document Upload */}
        <TabsContent value="step-2">
          <Card>
            <CardHeader>
              <CardTitle>Document Upload</CardTitle>
              <CardDescription>Upload required documents for verification</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {documents.map((doc) => (
                  <div key={doc.type} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="font-medium">{doc.name}</p>
                          {doc.uploadedAt && (
                            <p className="text-sm text-muted-foreground">
                              Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                      {getDocumentStatusBadge(doc.status)}
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        id={`file-${doc.type}`}
                        className="hidden"
                        accept="image/*,.pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleFileUpload(doc.type, file)
                        }}
                      />

                      {doc.status === 'not_uploaded' ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => document.getElementById(`file-${doc.type}`)?.click()}
                            disabled={isUploading}
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Upload File
                          </Button>
                          <Button variant="outline" size="sm">
                            <Camera className="h-4 w-4 mr-2" />
                            Take Photo
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => document.getElementById(`file-${doc.type}`)?.click()}
                          >
                            <RefreshCcw className="h-4 w-4 mr-2" />
                            Replace
                          </Button>
                        </>
                      )}
                    </div>

                    {doc.reviewNotes && (
                      <Alert className="mt-3">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{doc.reviewNotes}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                ))}

                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    All documents are encrypted and stored securely. We comply with data protection regulations.
                  </AlertDescription>
                </Alert>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setCurrentStep(1)}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                  <Button
                    onClick={() => setCurrentStep(3)}
                    disabled={documents.some(d => d.status === 'not_uploaded')}
                  >
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Step 3: Identity Verification */}
        <TabsContent value="step-3">
          <Card>
            <CardHeader>
              <CardTitle>Identity Verification</CardTitle>
              <CardDescription>Verify your identity using biometric authentication</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex flex-col items-center text-center space-y-4">
                        <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                          <ScanFace className="h-8 w-8 text-blue-600" />
                        </div>
                        <h3 className="font-semibold">Facial Recognition</h3>
                        <p className="text-sm text-muted-foreground">
                          Take a selfie to match with your ID document
                        </p>
                        <Button className="w-full">
                          <Camera className="h-4 w-4 mr-2" />
                          Start Scan
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex flex-col items-center text-center space-y-4">
                        <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                          <Fingerprint className="h-8 w-8 text-green-600" />
                        </div>
                        <h3 className="font-semibold">Fingerprint Scan</h3>
                        <p className="text-sm text-muted-foreground">
                          Use your device's fingerprint scanner for verification
                        </p>
                        <Button className="w-full" variant="outline">
                          <Fingerprint className="h-4 w-4 mr-2" />
                          Scan Fingerprint
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Shield className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium">Liveness Detection</p>
                          <p className="text-sm text-muted-foreground">
                            Follow on-screen instructions to prove you're a real person
                          </p>
                        </div>
                      </div>
                      <Button variant="outline">Start Test</Button>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setCurrentStep(2)}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                  <Button onClick={handleStartVerification} disabled={isVerifying}>
                    {isVerifying ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        Complete Verification
                        <CheckCircle className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Verification Status */}
      {verificationProgress === 100 && (
        <Alert className="border-green-500 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>Verification Complete!</strong> Your account has been successfully verified and all features are now available.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}