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
  const [userData, setUserData] = useState<any>(null)
  const [organizationData, setOrganizationData] = useState<any>(null)
  const [initializing, setInitializing] = useState(true)
  const [selectedOrgType, setSelectedOrgType] = useState<OrganizationType>('enterprise')

  // Form field states for pre-population
  const [orgName, setOrgName] = useState('')
  const [legalName, setLegalName] = useState('')
  const [website, setWebsite] = useState('')
  const [addressLine1, setAddressLine1] = useState('')
  const [addressLine2, setAddressLine2] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [country, setCountry] = useState('US')
  const [contactFirstName, setContactFirstName] = useState('')
  const [contactLastName, setContactLastName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [showSaveIndicator, setShowSaveIndicator] = useState(false)

  // File upload states
  const [articlesOfIncorporation, setArticlesOfIncorporation] = useState<File | null>(null)
  const [businessLicense, setBusinessLicense] = useState<File | null>(null)
  const [bankStatement, setBankStatement] = useState<File | null>(null)
  const [idDocument, setIdDocument] = useState<File | null>(null)
  const [proofOfAddress, setProofOfAddress] = useState<File | null>(null)

  // Load saved form data from localStorage on mount
  useEffect(() => {
    const savedFormData = localStorage.getItem('onboarding_form_data')
    if (savedFormData) {
      try {
        const parsed = JSON.parse(savedFormData)
        console.log('📋 Restoring saved onboarding data:', parsed)

        // Restore all form fields
        if (parsed.orgName) setOrgName(parsed.orgName)
        if (parsed.legalName) setLegalName(parsed.legalName)
        if (parsed.website) setWebsite(parsed.website)
        if (parsed.addressLine1) setAddressLine1(parsed.addressLine1)
        if (parsed.addressLine2) setAddressLine2(parsed.addressLine2)
        if (parsed.city) setCity(parsed.city)
        if (parsed.state) setState(parsed.state)
        if (parsed.postalCode) setPostalCode(parsed.postalCode)
        if (parsed.country) setCountry(parsed.country)
        if (parsed.contactFirstName) setContactFirstName(parsed.contactFirstName)
        if (parsed.contactLastName) setContactLastName(parsed.contactLastName)
        if (parsed.contactEmail) setContactEmail(parsed.contactEmail)
        if (parsed.contactPhone) setContactPhone(parsed.contactPhone)
        if (parsed.currentStep) setCurrentStep(parsed.currentStep)
        if (parsed.completedSteps) setCompletedSteps(parsed.completedSteps)
      } catch (error) {
        console.error('Failed to restore saved form data:', error)
      }
    }
  }, [])

  // Fetch existing user and organization data on mount
  useEffect(() => {
    // This is the Enterprise Wallet app, so always set account type to enterprise
    setAccountType('enterprise')
    fetchExistingData()
  }, [])

  // Auto-save form data to localStorage whenever any field changes
  useEffect(() => {
    const formData = {
      orgName,
      legalName,
      website,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country,
      contactFirstName,
      contactLastName,
      contactEmail,
      contactPhone,
      currentStep,
      completedSteps,
      lastSaved: new Date().toISOString()
    }

    localStorage.setItem('onboarding_form_data', JSON.stringify(formData))
    console.log('💾 Auto-saved onboarding data')

    // Show save indicator briefly
    setShowSaveIndicator(true)
    const timer = setTimeout(() => setShowSaveIndicator(false), 2000)
    return () => clearTimeout(timer)
  }, [
    orgName, legalName, website, addressLine1, addressLine2,
    city, state, postalCode, country, contactFirstName,
    contactLastName, contactEmail, contactPhone, currentStep, completedSteps
  ])

  // Populate form fields when organizationData or userData changes
  // Only populate if fields are currently empty to avoid overwriting user input
  useEffect(() => {
    // Check if we have saved data - if yes, don't overwrite with API data
    const savedFormData = localStorage.getItem('onboarding_form_data')
    const hasSavedData = savedFormData && savedFormData !== 'undefined' && savedFormData !== 'null'

    if (hasSavedData) {
      console.log('⏭️ Skipping API data population - using saved localStorage data instead')
      return
    }

    // Only populate from API if no saved data exists
    if (organizationData) {
      console.log('📥 Populating form from organization data:', organizationData)
      setOrgName(organizationData.name || '')
      setLegalName(organizationData.legalName || organizationData.legal_name || '')
      setWebsite(organizationData.website || '')
      setAddressLine1(organizationData.addressLine1 || organizationData.address_line1 || '')
      setAddressLine2(organizationData.addressLine2 || organizationData.address_line2 || '')
      setCity(organizationData.city || '')
      setState(organizationData.state || '')
      setPostalCode(organizationData.postalCode || organizationData.postal_code || '')
      setCountry(organizationData.country || 'US')
      setContactEmail(organizationData.email || '')
      setContactPhone(organizationData.phone || '')
    }

    if (userData) {
      console.log('📥 Populating form from user data:', userData)
      setContactFirstName(userData.firstName || userData.first_name || '')
      setContactLastName(userData.lastName || userData.last_name || '')
      // Override with user email/phone if organization doesn't have them
      if (!contactEmail) setContactEmail(userData.email || '')
      if (!contactPhone) setContactPhone(userData.phoneNumber || userData.phone_number || '')
    }
  }, [organizationData, userData])

  const fetchExistingData = async () => {
    try {
      const authToken = localStorage.getItem('auth_token') || localStorage.getItem('authToken')
      const storedUser = localStorage.getItem('user')

      if (!authToken) {
        console.error('No auth token found')
        setInitializing(false)
        return
      }

      // Get user data from localStorage first
      if (storedUser && storedUser !== 'undefined' && storedUser !== 'null') {
        try {
          const user = JSON.parse(storedUser)
          setUserData(user)
          console.log('Loaded user from localStorage:', user)
        } catch (error) {
          console.error('Failed to parse stored user data:', error)
          localStorage.removeItem('user')
        }
      }

      // Fetch fresh user data from API
      const userResponse = await fetch('http://localhost:3001/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (userResponse.ok) {
        const userApiData = await userResponse.json()
        console.log('Fetched user data from API:', userApiData)
        setUserData(userApiData.data || userApiData)
      }

      // Fetch organization data if user has organizationId
      if (storedUser && storedUser !== 'undefined' && storedUser !== 'null') {
        try {
          const user = JSON.parse(storedUser)
          const orgId = user.organizationId || user.primaryOrganizationId || user.primary_organization_id
          const tenantId = user.tenantId || user.tenant_id
          console.log('Looking for organization ID:', orgId, 'tenant ID:', tenantId, 'from user:', user)

        if (orgId) {
          const orgResponse = await fetch(`http://localhost:3001/api/organizations/${orgId}`, {
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json'
            }
          })

          if (orgResponse.ok) {
            const orgData = await orgResponse.json()
            console.log('Fetched organization data:', orgData)
            setOrganizationData(orgData.data || orgData)
          } else {
            console.error('Failed to fetch organization:', orgResponse.status)
          }
        }

        // Also fetch tenant data if available - tenant may have the organization info
        if (tenantId && !orgId) {
          console.log('🔍 No organization found, trying to fetch tenant data for tenant ID:', tenantId)
          const tenantResponse = await fetch(`http://localhost:3001/api/tenants/${tenantId}`, {
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json'
            }
          })

          if (tenantResponse.ok) {
            const tenantData = await tenantResponse.json()
            console.log('✅ Fetched tenant data:', tenantData)
            // Map tenant data to organization format
            const tenant = tenantData.data || tenantData
            setOrganizationData({
              name: tenant.name,
              email: tenant.email || tenant.metadata?.contact_email,
              phone: tenant.phone || tenant.metadata?.phone,
              address_line1: tenant.address_line1,
              address_line2: tenant.address_line2,
              city: tenant.city,
              state: tenant.state,
              postal_code: tenant.postal_code,
              country: tenant.country,
              website: tenant.website || tenant.metadata?.website,
              description: tenant.description || tenant.metadata?.description
            })
          } else {
            console.error('Failed to fetch tenant:', tenantResponse.status)
          }
        } else if (!orgId) {
          console.log('No organization ID or tenant ID found in user data')
        }
        } catch (error) {
          console.error('Failed to parse stored user data for organization lookup:', error)
        }
      }

      // Fetch onboarding status to determine current step
      const onboardingResponse = await fetch('http://localhost:3001/api/onboarding/status', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (onboardingResponse.ok) {
        const onboardingStatus = await onboardingResponse.json()
        console.log('Onboarding status:', onboardingStatus)

        // Determine which step to show based on verification status
        if (!onboardingStatus.verificationStatus?.email) {
          setCurrentStep('user-profile')
        } else if (!onboardingStatus.verificationStatus?.mobile) {
          setCurrentStep('user-profile')
        } else if (!onboardingStatus.verificationStatus?.kyc) {
          setCurrentStep('verification')
        } else {
          setCurrentStep('complete')
        }
      }

    } catch (error) {
      console.error('Error fetching existing data:', error)
    } finally {
      setInitializing(false)
    }
  }

  // Get steps based on account type
  const getSteps = (): OnboardingStep[] => {
    // For Enterprise Wallet app, include account-type for informational purposes
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
    } else if (accountType === 'consumer') {
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
    } else {
      // Fallback - should not reach here since we set accountType on mount
      return ['welcome', 'account-type']
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
      const authToken = localStorage.getItem('auth_token') || localStorage.getItem('authToken')
      if (authToken) {
        await fetch('http://localhost:3001/api/onboarding/complete', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        })
      }

      // Clear saved form data on completion
      localStorage.removeItem('onboarding_form_data')
      console.log('🗑️ Cleared saved onboarding data')

      // Redirect to dashboard
      router.push('/dashboard')
    } catch (error) {
      console.error('Onboarding error:', error)
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handleSkip = async () => {
    setLoading(true)
    try {
      // CRITICAL: Set flag FIRST before any async operations
      // This ensures the flag is set even if API call fails
      localStorage.setItem('onboarding_skipped', 'true')
      console.log('Skip flag set - redirecting to dashboard')

      const authToken = localStorage.getItem('auth_token') || localStorage.getItem('authToken')
      if (authToken) {
        // Make API call in background (don't wait for it)
        fetch('http://localhost:3001/api/onboarding/skip', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        }).then(response => {
          if (response.ok) {
            console.log('Onboarding skipped successfully in database')
          } else {
            console.error('Failed to skip onboarding in database:', response.status)
          }
        }).catch(error => {
          console.error('Error calling skip API:', error)
        })
      }

      // Redirect immediately
      router.push('/dashboard')
    } catch (error) {
      console.error('Error skipping onboarding:', error)
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handleEmailVerification = async () => {
    try {
      setLoading(true)
      setErrors({})
      const authToken = localStorage.getItem('auth_token') || localStorage.getItem('authToken')
      const emailInput = document.getElementById('email') as HTMLInputElement
      const email = emailInput?.value || userData?.email

      if (!email) {
        setErrors({ email: 'Email address is required' })
        setLoading(false)
        return
      }

      console.log('📧 Sending verification email to:', email)

      const response = await fetch('http://localhost:3001/api/auth/send-verification-email', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      })

      const result = await response.json()
      console.log('Email verification response:', result)

      if (result.success) {
        // Show success message with the demo code
        setErrors({
          email_success: `✅ Verification email sent! For testing, use code: ${result.data?.code || '123456'}`
        })

        // Auto-mark as verified after showing message (for testing)
        setTimeout(() => {
          if (userData) {
            setUserData({ ...userData, isEmailVerified: true, email_verified: true })
          }
          fetchExistingData()
        }, 2000)
      } else {
        setErrors({ email: result.message || 'Failed to send verification email' })
      }
    } catch (error) {
      console.error('Email verification error:', error)
      setErrors({ email: 'Failed to send verification email. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const handlePhoneVerification = async () => {
    try {
      setLoading(true)
      setErrors({})
      const authToken = localStorage.getItem('auth_token') || localStorage.getItem('authToken')
      const phoneInput = document.getElementById('phone') as HTMLInputElement
      const phone = phoneInput?.value || userData?.phoneNumber || userData?.phone_number

      if (!phone) {
        setErrors({ phone: 'Phone number is required' })
        setLoading(false)
        return
      }

      console.log('📱 Sending verification SMS to:', phone)

      const response = await fetch('http://localhost:3001/api/auth/send-verification-sms', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ phone })
      })

      const result = await response.json()
      console.log('SMS verification response:', result)

      if (result.success) {
        // Show success message with the demo code
        setErrors({
          phone_success: `✅ Verification SMS sent! For testing, use code: ${result.data?.code || '123456'}`
        })

        // Auto-mark as verified after showing message (for testing)
        setTimeout(() => {
          if (userData) {
            setUserData({ ...userData, isMobileVerified: true, mobile_verified: true })
          }
          fetchExistingData()
        }, 2000)
      } else {
        setErrors({ phone: result.message || 'Failed to send verification SMS' })
      }
    } catch (error) {
      console.error('Phone verification error:', error)
      setErrors({ phone: 'Failed to send verification SMS. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  // File upload handlers
  const handleFileUpload = (file: File | null, setter: React.Dispatch<React.SetStateAction<File | null>>, type: string) => {
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ [type]: 'File size must be less than 5MB' })
        return
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
      if (!allowedTypes.includes(file.type)) {
        setErrors({ [type]: 'File must be JPG, PNG, or PDF' })
        return
      }

      setter(file)
      console.log(`📎 File selected for ${type}:`, file.name)
      setErrors({ ...errors, [type]: undefined })
    }
  }

  const triggerFileInput = (inputId: string) => {
    const input = document.getElementById(inputId) as HTMLInputElement
    if (input) {
      input.click()
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
              <h2 className="text-2xl font-bold mb-2">Enterprise Account Setup</h2>
              <p className="text-gray-600">You're setting up an enterprise account with advanced business features</p>
            </div>

            <Alert className="bg-blue-50 border-blue-200">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                This is the Monay Enterprise Wallet designed specifically for businesses and organizations.
              </AlertDescription>
            </Alert>

            <div className="max-w-2xl mx-auto">
              <Card className="ring-2 ring-blue-500 shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Building className="h-8 w-8 text-blue-500" />
                    <CheckCircle className="h-6 w-6 text-blue-500" />
                  </div>
                  <CardTitle className="text-xl">Enterprise Account</CardTitle>
                  <CardDescription>Comprehensive solution for businesses and organizations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600 mb-4">
                      Your enterprise account includes all the tools you need to manage business payments,
                      treasury operations, and team access:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm">Multi-user access with roles</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm">Bulk payments & payroll</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm">Treasury management</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm">API access & integrations</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm">Compliance & reporting tools</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm">Dedicated support</span>
                      </div>
                    </div>
                    <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
                      <p className="text-sm font-medium text-blue-900 mb-1">What's Next?</p>
                      <p className="text-xs text-blue-700">
                        We'll guide you through setting up your organization, verifying your business,
                        and configuring your payment infrastructure.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )

      case 'organization':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Organization Information</h2>
              <p className="text-gray-600">
                {organizationData ? 'Review and update your company information' : 'Tell us about your company'}
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="orgName">Organization Name *</Label>
                  <Input
                    id="orgName"
                    placeholder="Acme Corporation"
                    value={orgName}
                    onChange={(e) => {
                      setOrgName(e.target.value)
                      setFormData({
                        ...formData,
                        organization: {
                          ...((formData as EnterpriseOnboarding).organization || {}),
                          name: e.target.value
                        }
                      })
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="legalName">Legal Name *</Label>
                  <Input
                    id="legalName"
                    placeholder="Acme Corporation Inc."
                    value={legalName}
                    onChange={(e) => {
                      setLegalName(e.target.value)
                      setFormData({
                        ...formData,
                        organization: {
                          ...((formData as EnterpriseOnboarding).organization || {}),
                          legalName: e.target.value
                        }
                      })
                    }}
                  />
                </div>
              </div>

              <div>
                <Label>Organization Type *</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                  {(['enterprise', 'government', 'financial-institution', 'healthcare', 'education'] as OrganizationType[]).map(type => (
                    <Card
                      key={type}
                      className={`cursor-pointer hover:shadow-md transition-all ${
                        selectedOrgType === type
                          ? 'ring-2 ring-blue-500 bg-blue-50'
                          : 'hover:border-blue-300'
                      }`}
                      onClick={() => {
                        setSelectedOrgType(type)
                        setFormData({
                          ...formData,
                          organization: {
                            ...((formData as EnterpriseOnboarding).organization || {}),
                            type: type
                          }
                        })
                      }}
                    >
                      <CardContent className="p-3 text-center">
                        <p className="text-sm font-medium">
                          {type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </p>
                        {selectedOrgType === type && (
                          <CheckCircle className="h-4 w-4 text-blue-600 mx-auto mt-1" />
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="industry">Industry *</Label>
                  <select
                    id="industry"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    defaultValue={organizationData?.industry || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      organization: {
                        ...((formData as EnterpriseOnboarding).organization || {}),
                        industry: e.target.value
                      }
                    })}
                  >
                    <option value="">Select Industry</option>
                    <optgroup label="Financial Services">
                      <option value="banking">Banking & Financial Institutions</option>
                      <option value="payments">Payment Processing & Fintech</option>
                      <option value="insurance">Insurance Services</option>
                      <option value="investment">Investment & Asset Management</option>
                      <option value="credit-unions">Credit Unions & Community Banks</option>
                    </optgroup>
                    <optgroup label="Healthcare">
                      <option value="hospitals">Hospitals & Medical Centers</option>
                      <option value="pharmacies">Pharmacies & Drug Stores</option>
                      <option value="medical-practices">Medical & Dental Practices</option>
                      <option value="healthcare-services">Healthcare Services & Labs</option>
                    </optgroup>
                    <optgroup label="Government & Public Sector">
                      <option value="federal-government">Federal Government Agencies</option>
                      <option value="state-government">State & Local Government</option>
                      <option value="municipalities">Municipalities & Public Services</option>
                      <option value="education-public">Public Education Institutions</option>
                    </optgroup>
                    <optgroup label="Education">
                      <option value="universities">Universities & Colleges</option>
                      <option value="k12-schools">K-12 Schools & Districts</option>
                      <option value="training">Training & Professional Development</option>
                      <option value="education-services">Educational Services</option>
                    </optgroup>
                    <optgroup label="Retail & E-Commerce">
                      <option value="retail-stores">Retail Stores & Shops</option>
                      <option value="ecommerce">E-Commerce & Online Marketplaces</option>
                      <option value="grocery">Grocery & Supermarkets</option>
                      <option value="specialty-retail">Specialty Retail</option>
                    </optgroup>
                    <optgroup label="Hospitality & Travel">
                      <option value="hotels">Hotels & Lodging</option>
                      <option value="restaurants">Restaurants & Food Services</option>
                      <option value="travel">Travel & Tourism Services</option>
                      <option value="entertainment">Entertainment & Recreation</option>
                    </optgroup>
                    <optgroup label="Transportation">
                      <option value="logistics">Logistics & Freight</option>
                      <option value="passenger-transport">Passenger Transportation</option>
                      <option value="delivery">Delivery & Courier Services</option>
                      <option value="automotive">Automotive Services</option>
                    </optgroup>
                    <optgroup label="Technology">
                      <option value="software">Software & SaaS</option>
                      <option value="it-services">IT Services & Consulting</option>
                      <option value="telecommunications">Telecommunications</option>
                      <option value="tech-hardware">Technology Hardware</option>
                    </optgroup>
                    <optgroup label="Professional Services">
                      <option value="legal">Legal Services</option>
                      <option value="accounting">Accounting & Tax Services</option>
                      <option value="consulting">Consulting Services</option>
                      <option value="real-estate">Real Estate Services</option>
                    </optgroup>
                    <optgroup label="Manufacturing & Wholesale">
                      <option value="manufacturing">Manufacturing</option>
                      <option value="wholesale">Wholesale & Distribution</option>
                      <option value="industrial">Industrial Services</option>
                      <option value="construction">Construction & Contractors</option>
                    </optgroup>
                    <optgroup label="Non-Profit & Social Services">
                      <option value="charities">Charities & Non-Profits</option>
                      <option value="religious">Religious Organizations</option>
                      <option value="social-services">Social Services</option>
                      <option value="community">Community Organizations</option>
                    </optgroup>
                    <optgroup label="Other Services">
                      <option value="utilities">Utilities & Energy</option>
                      <option value="agriculture">Agriculture & Farming</option>
                      <option value="media">Media & Publishing</option>
                      <option value="other">Other Business Services</option>
                    </optgroup>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Used for MCC coding and compliance</p>
                </div>
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    placeholder="https://example.com"
                    value={website}
                    onChange={(e) => {
                      setWebsite(e.target.value)
                      setFormData({
                        ...formData,
                        organization: {
                          ...((formData as EnterpriseOnboarding).organization || {}),
                          website: e.target.value
                        }
                      })
                    }}
                  />
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Business Address</h3>
                <div className="space-y-3">
                  <Input
                    placeholder="Street Address Line 1"
                    value={addressLine1}
                    onChange={(e) => {
                      setAddressLine1(e.target.value)
                      setFormData({
                        ...formData,
                        organization: {
                          ...((formData as EnterpriseOnboarding).organization || {}),
                          addressLine1: e.target.value
                        }
                      })
                    }}
                  />
                  <Input
                    placeholder="Street Address Line 2 (Optional)"
                    value={addressLine2}
                    onChange={(e) => {
                      setAddressLine2(e.target.value)
                      setFormData({
                        ...formData,
                        organization: {
                          ...((formData as EnterpriseOnboarding).organization || {}),
                          addressLine2: e.target.value
                        }
                      })
                    }}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      placeholder="City"
                      value={city}
                      onChange={(e) => {
                        setCity(e.target.value)
                        setFormData({
                          ...formData,
                          organization: {
                            ...((formData as EnterpriseOnboarding).organization || {}),
                            city: e.target.value
                          }
                        })
                      }}
                    />
                    <Input
                      placeholder="State/Province"
                      value={state}
                      onChange={(e) => {
                        setState(e.target.value)
                        setFormData({
                          ...formData,
                          organization: {
                            ...((formData as EnterpriseOnboarding).organization || {}),
                            state: e.target.value
                          }
                        })
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      placeholder="ZIP/Postal Code"
                      value={postalCode}
                      onChange={(e) => {
                        setPostalCode(e.target.value)
                        setFormData({
                          ...formData,
                          organization: {
                            ...((formData as EnterpriseOnboarding).organization || {}),
                            postalCode: e.target.value
                          }
                        })
                      }}
                    />
                    <Input
                      placeholder="Country (e.g., US)"
                      value={country}
                      onChange={(e) => {
                        setCountry(e.target.value)
                        setFormData({
                          ...formData,
                          organization: {
                            ...((formData as EnterpriseOnboarding).organization || {}),
                            country: e.target.value
                          }
                        })
                      }}
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Primary Contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input
                    placeholder="First Name"
                    value={contactFirstName}
                    onChange={(e) => {
                      setContactFirstName(e.target.value)
                      setFormData({
                        ...formData,
                        organization: {
                          ...((formData as EnterpriseOnboarding).organization || {}),
                          contactFirstName: e.target.value
                        }
                      })
                    }}
                  />
                  <Input
                    placeholder="Last Name"
                    value={contactLastName}
                    onChange={(e) => {
                      setContactLastName(e.target.value)
                      setFormData({
                        ...formData,
                        organization: {
                          ...((formData as EnterpriseOnboarding).organization || {}),
                          contactLastName: e.target.value
                        }
                      })
                    }}
                  />
                  <Input
                    type="email"
                    placeholder="Email"
                    value={contactEmail}
                    onChange={(e) => {
                      setContactEmail(e.target.value)
                      setFormData({
                        ...formData,
                        organization: {
                          ...((formData as EnterpriseOnboarding).organization || {}),
                          email: e.target.value
                        }
                      })
                    }}
                  />
                  <Input
                    type="tel"
                    placeholder="Phone"
                    value={contactPhone}
                    onChange={(e) => {
                      setContactPhone(e.target.value)
                      setFormData({
                        ...formData,
                        organization: {
                          ...((formData as EnterpriseOnboarding).organization || {}),
                          phone: e.target.value
                        }
                      })
                    }}
                  />
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
              <p className="text-gray-600">
                {userData ? 'Review and complete your personal information' : 'Set up your personal information'}
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    placeholder="John"
                    defaultValue={userData?.firstName || userData?.first_name || ''}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    placeholder="Doe"
                    defaultValue={userData?.lastName || userData?.last_name || ''}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      className="flex-1"
                      defaultValue={userData?.email || ''}
                      disabled={!!userData?.email}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleEmailVerification}
                      disabled={loading || userData?.isEmailVerified || userData?.email_verified}
                    >
                      {userData?.isEmailVerified || userData?.email_verified ? '✓ Verified' : 'Verify'}
                    </Button>
                  </div>
                  {errors.email && (
                    <p className="text-sm text-red-500 mt-1">{errors.email}</p>
                  )}
                  {errors.email_success && (
                    <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-800 font-medium flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        {errors.email_success}
                      </p>
                      <p className="text-xs text-green-700 mt-1">
                        🔧 DEV MODE: OTP code shown on-screen (no email sent)
                      </p>
                    </div>
                  )}
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      className="flex-1"
                      defaultValue={userData?.phoneNumber || userData?.phone_number || ''}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePhoneVerification}
                      disabled={loading || userData?.isMobileVerified || userData?.mobile_verified}
                    >
                      {userData?.isMobileVerified || userData?.mobile_verified ? '✓ Verified' : 'Verify'}
                    </Button>
                  </div>
                  {errors.phone && (
                    <p className="text-sm text-red-500 mt-1">{errors.phone}</p>
                  )}
                  {errors.phone_success && (
                    <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-800 font-medium flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        {errors.phone_success}
                      </p>
                      <p className="text-xs text-green-700 mt-1">
                        🔧 DEV MODE: OTP code shown on-screen (no SMS sent)
                      </p>
                    </div>
                  )}
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
                        {/* Articles of Incorporation */}
                        <div className={`border-2 border-dashed rounded-lg p-6 text-center ${articlesOfIncorporation ? 'border-green-500 bg-green-50' : 'border-gray-300'}`}>
                          <Upload className={`h-8 w-8 mx-auto mb-2 ${articlesOfIncorporation ? 'text-green-500' : 'text-gray-400'}`} />
                          <p className="text-sm text-gray-600">Articles of Incorporation</p>
                          {articlesOfIncorporation && (
                            <p className="text-xs text-green-600 mt-1">✓ {articlesOfIncorporation.name}</p>
                          )}
                          <input
                            id="articles-of-incorporation-input"
                            type="file"
                            accept="image/*,.pdf"
                            className="hidden"
                            onChange={(e) => handleFileUpload(e.target.files?.[0] || null, setArticlesOfIncorporation, 'articles')}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={() => triggerFileInput('articles-of-incorporation-input')}
                            type="button"
                          >
                            {articlesOfIncorporation ? 'Change File' : 'Choose File'}
                          </Button>
                          {errors.articles && (
                            <p className="text-xs text-red-500 mt-1">{errors.articles}</p>
                          )}
                        </div>

                        {/* Business License */}
                        <div className={`border-2 border-dashed rounded-lg p-6 text-center ${businessLicense ? 'border-green-500 bg-green-50' : 'border-gray-300'}`}>
                          <Upload className={`h-8 w-8 mx-auto mb-2 ${businessLicense ? 'text-green-500' : 'text-gray-400'}`} />
                          <p className="text-sm text-gray-600">Business License</p>
                          {businessLicense && (
                            <p className="text-xs text-green-600 mt-1">✓ {businessLicense.name}</p>
                          )}
                          <input
                            id="business-license-input"
                            type="file"
                            accept="image/*,.pdf"
                            className="hidden"
                            onChange={(e) => handleFileUpload(e.target.files?.[0] || null, setBusinessLicense, 'license')}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={() => triggerFileInput('business-license-input')}
                            type="button"
                          >
                            {businessLicense ? 'Change File' : 'Choose File'}
                          </Button>
                          {errors.license && (
                            <p className="text-xs text-red-500 mt-1">{errors.license}</p>
                          )}
                        </div>

                        {/* Bank Statement */}
                        <div className={`border-2 border-dashed rounded-lg p-6 text-center ${bankStatement ? 'border-green-500 bg-green-50' : 'border-gray-300'}`}>
                          <Upload className={`h-8 w-8 mx-auto mb-2 ${bankStatement ? 'text-green-500' : 'text-gray-400'}`} />
                          <p className="text-sm text-gray-600">Bank Statement (Optional)</p>
                          {bankStatement && (
                            <p className="text-xs text-green-600 mt-1">✓ {bankStatement.name}</p>
                          )}
                          <input
                            id="bank-statement-input"
                            type="file"
                            accept="image/*,.pdf"
                            className="hidden"
                            onChange={(e) => handleFileUpload(e.target.files?.[0] || null, setBankStatement, 'statement')}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={() => triggerFileInput('bank-statement-input')}
                            type="button"
                          >
                            {bankStatement ? 'Change File' : 'Choose File'}
                          </Button>
                          {errors.statement && (
                            <p className="text-xs text-red-500 mt-1">{errors.statement}</p>
                          )}
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
                        {/* ID Document */}
                        <div className={`border-2 border-dashed rounded-lg p-6 text-center ${idDocument ? 'border-green-500 bg-green-50' : 'border-gray-300'}`}>
                          <Upload className={`h-8 w-8 mx-auto mb-2 ${idDocument ? 'text-green-500' : 'text-gray-400'}`} />
                          <p className="text-sm text-gray-600">Driver's License or Passport</p>
                          {idDocument && (
                            <p className="text-xs text-green-600 mt-1">✓ {idDocument.name}</p>
                          )}
                          <input
                            id="id-document-input"
                            type="file"
                            accept="image/*,.pdf"
                            className="hidden"
                            onChange={(e) => handleFileUpload(e.target.files?.[0] || null, setIdDocument, 'id')}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={() => triggerFileInput('id-document-input')}
                            type="button"
                          >
                            {idDocument ? 'Change File' : 'Choose File'}
                          </Button>
                          {errors.id && (
                            <p className="text-xs text-red-500 mt-1">{errors.id}</p>
                          )}
                        </div>

                        {/* Proof of Address */}
                        <div className={`border-2 border-dashed rounded-lg p-6 text-center ${proofOfAddress ? 'border-green-500 bg-green-50' : 'border-gray-300'}`}>
                          <Upload className={`h-8 w-8 mx-auto mb-2 ${proofOfAddress ? 'text-green-500' : 'text-gray-400'}`} />
                          <p className="text-sm text-gray-600">Proof of Address (Optional)</p>
                          {proofOfAddress && (
                            <p className="text-xs text-green-600 mt-1">✓ {proofOfAddress.name}</p>
                          )}
                          <input
                            id="proof-of-address-input"
                            type="file"
                            accept="image/*,.pdf"
                            className="hidden"
                            onChange={(e) => handleFileUpload(e.target.files?.[0] || null, setProofOfAddress, 'address')}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={() => triggerFileInput('proof-of-address-input')}
                            type="button"
                          >
                            {proofOfAddress ? 'Change File' : 'Choose File'}
                          </Button>
                          {errors.address && (
                            <p className="text-xs text-red-500 mt-1">{errors.address}</p>
                          )}
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

  // Show loading state while fetching data
  if (initializing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your information...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Account Setup</h1>
            <div className="flex items-center gap-3">
              {showSaveIndicator && (
                <span className="text-xs text-green-600 flex items-center gap-1 animate-pulse">
                  <CheckCircle className="h-3 w-3" />
                  Saved
                </span>
              )}
              {accountType ? (
                <span className="text-sm text-gray-500">
                  Step {currentStepIndex + 1} of {steps.length}
                </span>
              ) : (
                <span className="text-sm text-gray-500">
                  Getting Started
                </span>
              )}
            </div>
          </div>
          <Progress value={progress} className="h-2" />
          {accountType && (
            <p className="text-xs text-gray-500 mt-2">
              {accountType === 'enterprise' ? 'Enterprise Account Setup' : 'Personal Account Setup'}
            </p>
          )}
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
          <div className="mt-6">
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStepIndex === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back
              </Button>

              <div className="flex gap-3">
                {currentStep !== 'welcome' && currentStep !== 'terms' && (
                  <Button
                    variant="ghost"
                    onClick={handleSkip}
                    disabled={loading}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Skip for Now
                  </Button>
                )}

                {currentStepIndex === steps.length - 2 ? (
                  <Button variant="gradient" onClick={handleNext} disabled={loading}>
                    {loading ? 'Completing...' : 'Complete Setup'}
                    <CheckCircle className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button variant="gradient" onClick={handleNext} disabled={loading}>
                    Continue
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>

            {/* Skip Notice */}
            {currentStep !== 'welcome' && currentStep !== 'terms' && (
              <p className="text-center text-xs text-gray-500 mt-3">
                You can complete this step later from your Settings page
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}