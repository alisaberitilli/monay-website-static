'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Building, User, Shield, CreditCard, DollarSign,
  FileText, CheckCircle, ChevronRight, ChevronLeft,
  AlertCircle, Mail, Phone, Globe, MapPin, Calendar,
  Briefcase, Upload, Lock, Sparkles, ArrowRight
} from 'lucide-react'
import type {
  OnboardingType,
  OnboardingStep,
  EnterpriseOnboarding,
  ConsumerOnboarding,
  STEP_LABELS,
  STEP_DESCRIPTIONS
} from '@/types/onboarding'
import type { OrganizationType } from '@/types/businessRules'

const stepLabels: Record<OnboardingStep, string> = {
  'welcome': 'Welcome',
  'account-type': 'Account Type',
  'organization': 'Organization Setup',
  'user-profile': 'Your Profile',
  'verification': 'Identity Verification',
  'banking': 'Banking Information',
  'cards': 'Card Setup',
  'subscription': 'Choose Your Plan',
  'terms': 'Terms & Conditions',
  'complete': 'Setup Complete'
}

const stepDescriptions: Record<OnboardingStep, string> = {
  'welcome': 'Welcome to Monay! Let\'s get your account set up.',
  'account-type': 'Choose the type of account that best fits your needs.',
  'organization': 'Tell us about your organization.',
  'user-profile': 'Set up your personal profile.',
  'verification': 'Verify your identity for security and compliance.',
  'banking': 'Connect your bank account for easy funding.',
  'cards': 'Set up virtual or physical cards for spending.',
  'subscription': 'Choose the subscription plan that works for you.',
  'terms': 'Review and accept our terms of service.',
  'complete': 'Congratulations! Your account is ready to use.'
}

export default function OnboardingPage() {
  const router = useRouter()
  const [accountType, setAccountType] = useState<OnboardingType | null>(null)
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome')
  const [completedSteps, setCompletedSteps] = useState<OnboardingStep[]>([])
  const [formData, setFormData] = useState<Partial<EnterpriseOnboarding | ConsumerOnboarding>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  // Get steps based on account type
  const getSteps = (): OnboardingStep[] => {
    if (!accountType) return ['welcome', 'account-type']

    if (accountType === 'enterprise') {
      return [
        'welcome',
        'account-type',
        'organization',
        'verification',
        'banking',
        'cards',
        'subscription',
        'terms',
        'complete'
      ]
    } else {
      return [
        'welcome',
        'account-type',
        'user-profile',
        'verification',
        'banking',
        'cards',
        'terms',
        'complete'
      ]
    }
  }

  const steps = getSteps()
  const currentStepIndex = steps.indexOf(currentStep)
  const progress = ((currentStepIndex + 1) / steps.length) * 100

  const getStepIcon = (step: OnboardingStep) => {
    const icons: Record<OnboardingStep, any> = {
      'welcome': Sparkles,
      'account-type': User,
      'organization': Building,
      'user-profile': User,
      'verification': Shield,
      'banking': DollarSign,
      'cards': CreditCard,
      'subscription': Briefcase,
      'terms': FileText,
      'complete': CheckCircle
    }
    return icons[step] || AlertCircle
  }

  const handleNext = () => {
    // Validate current step
    if (!validateStep()) return

    // Mark step as completed
    setCompletedSteps([...completedSteps, currentStep])

    // Move to next step
    const nextIndex = currentStepIndex + 1
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex])
    }
  }

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex])
    }
  }

  const validateStep = (): boolean => {
    setErrors({})

    switch (currentStep) {
      case 'account-type':
        if (!accountType) {
          setErrors({ accountType: 'Please select an account type' })
          return false
        }
        break
      case 'organization':
        // Validate organization fields
        break
      case 'user-profile':
        // Validate user profile fields
        break
      // Add more validation as needed
    }

    return true
  }

  const handleComplete = async () => {
    setLoading(true)
    try {
      // Submit onboarding data
      // await submitOnboarding(formData)

      // Redirect to dashboard
      router.push('/dashboard')
    } catch (error) {
      console.error('Onboarding error:', error)
    } finally {
      setLoading(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 'welcome':
        return (
          <div className="text-center space-y-6">
            <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Sparkles className="h-12 w-12 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-2">Welcome to Monay</h2>
              <p className="text-gray-600 text-lg">
                The most advanced enterprise payment platform
              </p>
            </div>
            <div className="max-w-md mx-auto text-left space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium">Quick Setup</p>
                  <p className="text-sm text-gray-500">Get started in just 5 minutes</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium">Secure & Compliant</p>
                  <p className="text-sm text-gray-500">Bank-level security and KYC/AML compliance</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium">All-in-One Platform</p>
                  <p className="text-sm text-gray-500">Payments, cards, treasury, and more</p>
                </div>
              </div>
            </div>
          </div>
        )

      case 'account-type':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Choose Your Account Type</h2>
              <p className="text-gray-600">Select the option that best describes your needs</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card
                className={`cursor-pointer transition-all ${
                  accountType === 'enterprise'
                    ? 'ring-2 ring-blue-500 shadow-lg'
                    : 'hover:shadow-md'
                }`}
                onClick={() => setAccountType('enterprise')}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Building className="h-8 w-8 text-blue-500" />
                    {accountType === 'enterprise' && (
                      <CheckCircle className="h-5 w-5 text-blue-500" />
                    )}
                  </div>
                  <CardTitle>Enterprise Account</CardTitle>
                  <CardDescription>For businesses and organizations</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Multi-user access with roles
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Bulk payments & payroll
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Treasury management
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      API access & integrations
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card
                className={`cursor-pointer transition-all ${
                  accountType === 'consumer'
                    ? 'ring-2 ring-purple-500 shadow-lg'
                    : 'hover:shadow-md'
                }`}
                onClick={() => setAccountType('consumer')}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <User className="h-8 w-8 text-purple-500" />
                    {accountType === 'consumer' && (
                      <CheckCircle className="h-5 w-5 text-purple-500" />
                    )}
                  </div>
                  <CardTitle>Personal Account</CardTitle>
                  <CardDescription>For individuals and freelancers</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Personal wallet & cards
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      P2P payments
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Bill pay & subscriptions
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Crypto trading
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
            {errors.accountType && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.accountType}</AlertDescription>
              </Alert>
            )}
          </div>
        )

      case 'organization':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Organization Information</h2>
              <p className="text-gray-600">Tell us about your company</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="orgName">Organization Name *</Label>
                  <Input
                    id="orgName"
                    placeholder="Acme Corporation"
                    onChange={(e) => setFormData({
                      ...formData,
                      organization: {
                        ...((formData as EnterpriseOnboarding).organization || {}),
                        name: e.target.value
                      }
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="legalName">Legal Name</Label>
                  <Input
                    id="legalName"
                    placeholder="Acme Corporation Inc."
                    onChange={(e) => setFormData({
                      ...formData,
                      organization: {
                        ...((formData as EnterpriseOnboarding).organization || {}),
                        legalName: e.target.value
                      }
                    })}
                  />
                </div>
              </div>

              <div>
                <Label>Organization Type *</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                  {(['enterprise', 'government', 'financial-institution', 'healthcare', 'education'] as OrganizationType[]).map(type => (
                    <Card
                      key={type}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => setFormData({
                        ...formData,
                        organization: {
                          ...((formData as EnterpriseOnboarding).organization || {}),
                          type: type
                        }
                      })}
                    >
                      <CardContent className="p-3 text-center">
                        <p className="text-sm font-medium">
                          {type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="industry">Industry</Label>
                  <Input
                    id="industry"
                    placeholder="Technology"
                  />
                </div>
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    placeholder="https://example.com"
                  />
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Business Address</h3>
                <div className="space-y-3">
                  <Input placeholder="Street Address" />
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <Input placeholder="City" />
                    <Input placeholder="State" />
                    <Input placeholder="ZIP Code" />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Primary Contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input placeholder="First Name" />
                  <Input placeholder="Last Name" />
                  <Input type="email" placeholder="Email" />
                  <Input type="tel" placeholder="Phone" />
                </div>
              </div>
            </div>
          </div>
        )

      case 'user-profile':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Your Profile</h2>
              <p className="text-gray-600">Set up your personal information</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input id="firstName" placeholder="John" />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input id="lastName" placeholder="Doe" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <div className="flex gap-2">
                    <Input id="email" type="email" placeholder="john@example.com" className="flex-1" />
                    <Button variant="outline" size="sm">Verify</Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <div className="flex gap-2">
                    <Input id="phone" type="tel" placeholder="+1 (555) 123-4567" className="flex-1" />
                    <Button variant="outline" size="sm">Verify</Button>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="dob">Date of Birth *</Label>
                <Input id="dob" type="date" />
              </div>

              <div>
                <h3 className="font-semibold mb-3">Residential Address</h3>
                <div className="space-y-3">
                  <Input placeholder="Street Address" />
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <Input placeholder="City" />
                    <Input placeholder="State" />
                    <Input placeholder="ZIP Code" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 'verification':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Identity Verification</h2>
              <p className="text-gray-600">
                {accountType === 'enterprise' ? 'Verify your business' : 'Verify your identity'}
              </p>
            </div>

            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                We use bank-level encryption to protect your information. Your documents are never stored on our servers.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              {accountType === 'enterprise' ? (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle>Business Documents</CardTitle>
                      <CardDescription>Upload your business registration documents</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="border-2 border-dashed rounded-lg p-6 text-center">
                          <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                          <p className="text-sm text-gray-600">Articles of Incorporation</p>
                          <Button variant="outline" size="sm" className="mt-2">
                            Choose File
                          </Button>
                        </div>
                        <div className="border-2 border-dashed rounded-lg p-6 text-center">
                          <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                          <p className="text-sm text-gray-600">Business License</p>
                          <Button variant="outline" size="sm" className="mt-2">
                            Choose File
                          </Button>
                        </div>
                        <div className="border-2 border-dashed rounded-lg p-6 text-center">
                          <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                          <p className="text-sm text-gray-600">Bank Statement (Optional)</p>
                          <Button variant="outline" size="sm" className="mt-2">
                            Choose File
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Tax Information</CardTitle>
                      <CardDescription>Provide your EIN for tax reporting</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="ein">EIN (Employer Identification Number)</Label>
                          <Input id="ein" placeholder="12-3456789" />
                        </div>
                        <div>
                          <Label htmlFor="stateReg">State Registration Number</Label>
                          <Input id="stateReg" placeholder="Optional" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle>Identity Documents</CardTitle>
                      <CardDescription>Upload a government-issued ID</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="border-2 border-dashed rounded-lg p-6 text-center">
                          <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                          <p className="text-sm text-gray-600">Driver's License or Passport</p>
                          <Button variant="outline" size="sm" className="mt-2">
                            Choose File
                          </Button>
                        </div>
                        <div className="border-2 border-dashed rounded-lg p-6 text-center">
                          <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                          <p className="text-sm text-gray-600">Proof of Address (Optional)</p>
                          <Button variant="outline" size="sm" className="mt-2">
                            Choose File
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Social Security</CardTitle>
                      <CardDescription>For tax reporting purposes</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div>
                        <Label htmlFor="ssn">Social Security Number</Label>
                        <Input id="ssn" type="password" placeholder="XXX-XX-XXXX" />
                        <p className="text-xs text-gray-500 mt-1">
                          Your SSN is encrypted and only used for compliance purposes
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </div>
        )

      case 'banking':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Banking Information</h2>
              <p className="text-gray-600">Connect your bank account for funding</p>
            </div>

            <Tabs defaultValue="manual">
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="instant">Instant Verification</TabsTrigger>
                <TabsTrigger value="manual">Manual Entry</TabsTrigger>
              </TabsList>

              <TabsContent value="instant" className="space-y-4">
                <Card>
                  <CardContent className="py-8 text-center">
                    <Globe className="h-12 w-12 mx-auto mb-4 text-blue-500" />
                    <h3 className="font-semibold mb-2">Connect with Plaid</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Securely connect your bank account in seconds
                    </p>
                    <Button variant="gradient">
                      Connect Bank Account
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="manual" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Bank Account Details</CardTitle>
                    <CardDescription>Enter your bank account information</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="bankName">Bank Name</Label>
                        <Input id="bankName" placeholder="Chase Bank" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="routingNumber">Routing Number</Label>
                          <Input id="routingNumber" placeholder="123456789" />
                        </div>
                        <div>
                          <Label htmlFor="accountNumber">Account Number</Label>
                          <Input id="accountNumber" type="password" placeholder="••••••••••" />
                        </div>
                      </div>
                      <div>
                        <Label>Account Type</Label>
                        <div className="grid grid-cols-2 gap-3 mt-2">
                          <Card className="cursor-pointer hover:shadow-md">
                            <CardContent className="p-3 text-center">
                              <p className="text-sm font-medium">Checking</p>
                            </CardContent>
                          </Card>
                          <Card className="cursor-pointer hover:shadow-md">
                            <CardContent className="p-3 text-center">
                              <p className="text-sm font-medium">Savings</p>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    We'll make two small deposits to verify your account. This usually takes 1-2 business days.
                  </AlertDescription>
                </Alert>
              </TabsContent>
            </Tabs>
          </div>
        )

      case 'cards':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Card Setup</h2>
              <p className="text-gray-600">Get instant access to virtual cards</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CreditCard className="h-8 w-8 text-blue-500" />
                    <Badge className="bg-green-100 text-green-800">INSTANT</Badge>
                  </div>
                  <CardTitle>Virtual Card</CardTitle>
                  <CardDescription>Start spending immediately</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm mb-4">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Instant issuance
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Apple/Google Pay ready
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Online purchases
                    </li>
                  </ul>
                  <Button className="w-full">Create Virtual Card</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CreditCard className="h-8 w-8 text-purple-500" />
                    <Badge className="bg-blue-100 text-blue-800">5-7 DAYS</Badge>
                  </div>
                  <CardTitle>Physical Card</CardTitle>
                  <CardDescription>Premium metal card</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm mb-4">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Premium metal design
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Contactless payments
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      ATM access worldwide
                    </li>
                  </ul>
                  <Button variant="outline" className="w-full">Order Physical Card</Button>
                </CardContent>
              </Card>
            </div>

            {accountType === 'enterprise' && (
              <Card>
                <CardHeader>
                  <CardTitle>Team Cards</CardTitle>
                  <CardDescription>Issue cards to your team members</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">
                        You can issue cards to team members after setup
                      </p>
                    </div>
                    <Badge>Coming Soon</Badge>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )

      case 'subscription':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Choose Your Plan</h2>
              <p className="text-gray-600">Select the subscription that works for you</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="relative">
                <CardHeader>
                  <CardTitle>Starter</CardTitle>
                  <div className="mt-4">
                    <span className="text-3xl font-bold">$29</span>
                    <span className="text-gray-600">/month</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>Up to 5 users</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>$100K monthly volume</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>5 virtual cards</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>Basic support</span>
                    </li>
                  </ul>
                  <Button variant="outline" className="w-full mt-6">Select Plan</Button>
                </CardContent>
              </Card>

              <Card className="relative border-blue-500">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-500 text-white">RECOMMENDED</Badge>
                </div>
                <CardHeader>
                  <CardTitle>Growth</CardTitle>
                  <div className="mt-4">
                    <span className="text-3xl font-bold">$99</span>
                    <span className="text-gray-600">/month</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>Up to 25 users</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>$1M monthly volume</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>Unlimited virtual cards</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>Priority support</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>API access</span>
                    </li>
                  </ul>
                  <Button variant="gradient" className="w-full mt-6">Select Plan</Button>
                </CardContent>
              </Card>

              <Card className="relative">
                <CardHeader>
                  <CardTitle>Enterprise</CardTitle>
                  <div className="mt-4">
                    <span className="text-3xl font-bold">Custom</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>Unlimited users</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>Unlimited volume</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>Custom card programs</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>Dedicated support</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>White-label options</span>
                    </li>
                  </ul>
                  <Button variant="outline" className="w-full mt-6">Contact Sales</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )

      case 'terms':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Terms & Conditions</h2>
              <p className="text-gray-600">Please review and accept our terms</p>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="h-64 overflow-y-auto border rounded-lg p-4 text-sm text-gray-600">
                    <h3 className="font-semibold text-gray-900 mb-2">Terms of Service</h3>
                    <p className="mb-3">
                      By using Monay's services, you agree to these terms...
                    </p>
                    {/* Add actual terms content */}
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit...</p>
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-start gap-3">
                      <input type="checkbox" className="mt-1" />
                      <span className="text-sm">
                        I accept the <a href="#" className="text-blue-600 underline">Terms of Service</a>
                      </span>
                    </label>
                    <label className="flex items-start gap-3">
                      <input type="checkbox" className="mt-1" />
                      <span className="text-sm">
                        I accept the <a href="#" className="text-blue-600 underline">Privacy Policy</a>
                      </span>
                    </label>
                    {accountType === 'enterprise' && (
                      <label className="flex items-start gap-3">
                        <input type="checkbox" className="mt-1" />
                        <span className="text-sm">
                          I accept the <a href="#" className="text-blue-600 underline">Business Agreement</a>
                        </span>
                      </label>
                    )}
                    <label className="flex items-start gap-3">
                      <input type="checkbox" className="mt-1" />
                      <span className="text-sm">
                        I consent to electronic communications
                      </span>
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 'complete':
        return (
          <div className="text-center space-y-6">
            <div className="mx-auto w-24 h-24 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
              <CheckCircle className="h-12 w-12 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-2">You're All Set!</h2>
              <p className="text-gray-600 text-lg">
                Your account has been successfully created
              </p>
            </div>
            <div className="max-w-md mx-auto text-left space-y-3">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-medium">Account Created</p>
                      <p className="text-sm text-gray-500">Your account is ready to use</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-medium">Verification Pending</p>
                      <p className="text-sm text-gray-500">We'll notify you once verified (1-2 days)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-medium">Virtual Card Ready</p>
                      <p className="text-sm text-gray-500">Start spending immediately</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            <Button
              variant="gradient"
              size="lg"
              className="min-w-[200px]"
              onClick={handleComplete}
            >
              Go to Dashboard
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Account Setup</h1>
            <span className="text-sm text-gray-500">
              Step {currentStepIndex + 1} of {steps.length}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Indicators */}
        <div className="hidden md:flex items-center justify-between mb-8">
          {steps.map((step, index) => {
            const Icon = getStepIcon(step)
            const isCompleted = completedSteps.includes(step)
            const isCurrent = step === currentStep
            const isPending = index > currentStepIndex

            return (
              <div key={step} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isCompleted
                        ? 'bg-green-500 text-white'
                        : isCurrent
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>
                  <span className={`text-xs mt-2 ${isCurrent ? 'font-semibold' : 'text-gray-500'}`}>
                    {stepLabels[step]}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-0.5 w-full mx-2 ${
                      completedSteps.includes(steps[index + 1]) || isCurrent
                        ? 'bg-blue-500'
                        : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            )
          })}
        </div>

        {/* Main Content */}
        <Card>
          <CardContent className="p-8">
            {renderStepContent()}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        {currentStep !== 'complete' && (
          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStepIndex === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back
            </Button>

            {currentStepIndex === steps.length - 2 ? (
              <Button variant="gradient" onClick={handleNext}>
                Complete Setup
                <CheckCircle className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button variant="gradient" onClick={handleNext}>
                Continue
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}