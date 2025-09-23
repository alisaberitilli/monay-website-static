'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
  User,
  Building,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Shield,
  AlertCircle,
  CheckCircle,
  Loader2,
  Save,
  ArrowRight
} from 'lucide-react'

interface CustomerFormData {
  // Basic Information
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  ssn: string

  // Address
  addressLine1: string
  addressLine2: string
  city: string
  state: string
  zipCode: string
  country: string

  // Account Settings
  accountType: 'individual' | 'business'
  kycRequired: boolean
  dailyLimit: string
  monthlyLimit: string

  // Business Information (if applicable)
  businessName?: string
  ein?: string
  businessType?: string
  incorporationState?: string
}

export default function CustomerCreateForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [currentTab, setCurrentTab] = useState('basic')
  const [formData, setFormData] = useState<CustomerFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    ssn: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
    accountType: 'individual',
    kycRequired: true,
    dailyLimit: '1000',
    monthlyLimit: '10000'
  })

  const handleInputChange = (field: keyof CustomerFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const validateBasicInfo = () => {
    if (!formData.firstName || !formData.lastName) {
      toast.error('Please enter first and last name')
      return false
    }
    if (!formData.email || !formData.email.includes('@')) {
      toast.error('Please enter a valid email address')
      return false
    }
    if (!formData.phone) {
      toast.error('Please enter a phone number')
      return false
    }
    return true
  }

  const validateAddress = () => {
    if (!formData.addressLine1 || !formData.city || !formData.state || !formData.zipCode) {
      toast.error('Please complete all required address fields')
      return false
    }
    return true
  }

  const handleSubmit = async () => {
    // Validate all sections
    if (!validateBasicInfo() || !validateAddress()) {
      return
    }

    if (formData.accountType === 'business' && (!formData.businessName || !formData.ein)) {
      toast.error('Please complete business information')
      return
    }

    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))

      toast.success('Customer created successfully!')
      router.push('/customers')
    } catch (error) {
      toast.error('Failed to create customer')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveAndContinue = () => {
    if (currentTab === 'basic' && validateBasicInfo()) {
      setCurrentTab('address')
    } else if (currentTab === 'address' && validateAddress()) {
      setCurrentTab('account')
    } else if (currentTab === 'account') {
      if (formData.accountType === 'business') {
        setCurrentTab('business')
      } else {
        handleSubmit()
      }
    } else if (currentTab === 'business') {
      handleSubmit()
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Customer</CardTitle>
        <CardDescription>
          Add a new customer to your organization
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={currentTab} onValueChange={setCurrentTab}>
          <TabsList className="grid grid-cols-4 w-full max-w-2xl">
            <TabsTrigger value="basic" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Basic Info</span>
            </TabsTrigger>
            <TabsTrigger value="address" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span className="hidden sm:inline">Address</span>
            </TabsTrigger>
            <TabsTrigger value="account" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Account</span>
            </TabsTrigger>
            {formData.accountType === 'business' && (
              <TabsTrigger value="business" className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                <span className="hidden sm:inline">Business</span>
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="basic" className="space-y-4 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  placeholder="John"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  placeholder="Doe"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="john@example.com"
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ssn">SSN (Last 4 digits)</Label>
                <Input
                  id="ssn"
                  value={formData.ssn}
                  onChange={(e) => handleInputChange('ssn', e.target.value)}
                  placeholder="****"
                  maxLength={4}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="address" className="space-y-4 mt-6">
            <div className="space-y-2">
              <Label htmlFor="addressLine1">Address Line 1 *</Label>
              <Input
                id="addressLine1"
                value={formData.addressLine1}
                onChange={(e) => handleInputChange('addressLine1', e.target.value)}
                placeholder="123 Main St"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="addressLine2">Address Line 2</Label>
              <Input
                id="addressLine2"
                value={formData.addressLine2}
                onChange={(e) => handleInputChange('addressLine2', e.target.value)}
                placeholder="Apt 4B"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="New York"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Select value={formData.state} onValueChange={(value) => handleInputChange('state', value)}>
                  <SelectTrigger id="state">
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NY">New York</SelectItem>
                    <SelectItem value="CA">California</SelectItem>
                    <SelectItem value="TX">Texas</SelectItem>
                    <SelectItem value="FL">Florida</SelectItem>
                    <SelectItem value="IL">Illinois</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="zipCode">ZIP Code *</Label>
                <Input
                  id="zipCode"
                  value={formData.zipCode}
                  onChange={(e) => handleInputChange('zipCode', e.target.value)}
                  placeholder="10001"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Select value={formData.country} onValueChange={(value) => handleInputChange('country', value)}>
                <SelectTrigger id="country">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="US">United States</SelectItem>
                  <SelectItem value="CA">Canada</SelectItem>
                  <SelectItem value="MX">Mexico</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          <TabsContent value="account" className="space-y-4 mt-6">
            <div className="space-y-2">
              <Label htmlFor="accountType">Account Type</Label>
              <Select
                value={formData.accountType}
                onValueChange={(value: 'individual' | 'business') => handleInputChange('accountType', value)}
              >
                <SelectTrigger id="accountType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">Individual</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>KYC Verification Required</Label>
                <Button
                  variant={formData.kycRequired ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleInputChange('kycRequired', !formData.kycRequired)}
                >
                  {formData.kycRequired ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Required
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Not Required
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dailyLimit">Daily Transaction Limit ($)</Label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="dailyLimit"
                    type="number"
                    value={formData.dailyLimit}
                    onChange={(e) => handleInputChange('dailyLimit', e.target.value)}
                    placeholder="1000"
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="monthlyLimit">Monthly Transaction Limit ($)</Label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="monthlyLimit"
                    type="number"
                    value={formData.monthlyLimit}
                    onChange={(e) => handleInputChange('monthlyLimit', e.target.value)}
                    placeholder="10000"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          {formData.accountType === 'business' && (
            <TabsContent value="business" className="space-y-4 mt-6">
              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name *</Label>
                <div className="relative">
                  <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="businessName"
                    value={formData.businessName || ''}
                    onChange={(e) => handleInputChange('businessName', e.target.value)}
                    placeholder="Acme Corporation"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ein">EIN *</Label>
                  <Input
                    id="ein"
                    value={formData.ein || ''}
                    onChange={(e) => handleInputChange('ein', e.target.value)}
                    placeholder="12-3456789"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="businessType">Business Type</Label>
                  <Select
                    value={formData.businessType || ''}
                    onValueChange={(value) => handleInputChange('businessType', value)}
                  >
                    <SelectTrigger id="businessType">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="llc">LLC</SelectItem>
                      <SelectItem value="corporation">Corporation</SelectItem>
                      <SelectItem value="partnership">Partnership</SelectItem>
                      <SelectItem value="sole_proprietorship">Sole Proprietorship</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="incorporationState">State of Incorporation</Label>
                <Select
                  value={formData.incorporationState || ''}
                  onValueChange={(value) => handleInputChange('incorporationState', value)}
                >
                  <SelectTrigger id="incorporationState">
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DE">Delaware</SelectItem>
                    <SelectItem value="NY">New York</SelectItem>
                    <SelectItem value="CA">California</SelectItem>
                    <SelectItem value="TX">Texas</SelectItem>
                    <SelectItem value="FL">Florida</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>
          )}
        </Tabs>

        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={() => router.push('/customers')}
          >
            Cancel
          </Button>
          <div className="flex gap-2">
            {currentTab !== 'basic' && (
              <Button
                variant="outline"
                onClick={() => {
                  const tabs = ['basic', 'address', 'account', 'business']
                  const currentIndex = tabs.indexOf(currentTab)
                  if (currentIndex > 0) {
                    setCurrentTab(tabs[currentIndex - 1])
                  }
                }}
              >
                Previous
              </Button>
            )}
            <Button
              onClick={handleSaveAndContinue}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  {(currentTab === 'account' && formData.accountType === 'individual') ||
                   (currentTab === 'business') ? (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Create Customer
                    </>
                  ) : (
                    <>
                      Next
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}