'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  AlertCircle,
  Loader2,
  Shield,
  Building2,
  ArrowRight,
  Key,
  Users,
  CreditCard,
  Globe,
  UserCheck,
  Hash,
  ExternalLink,
  Smartphone,
  Phone
} from 'lucide-react'
import { toast } from 'sonner'

export default function OrganizationLoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loginMethod, setLoginMethod] = useState<'orgId' | 'email'>('orgId')

  // Form state
  const [orgId, setOrgId] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mfaCode, setMfaCode] = useState('')
  const [showMfa, setShowMfa] = useState(false)
  const [actualMfaCode, setActualMfaCode] = useState('')
  const [showDevTools, setShowDevTools] = useState(false)
  const [mfaMethod, setMfaMethod] = useState<'email' | 'sms'>('email')
  const [phoneNumber, setPhoneNumber] = useState('')

  const handleOrganizationLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // For demo purposes, we'll simulate authentication
      // In production, this would call the backend API

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Mock validation
      if (loginMethod === 'orgId') {
        if (orgId === 'org-001' && password === 'demo123') {
          // Send MFA code via notification service
          if (!showMfa) {
            setShowMfa(true)
            setIsLoading(false)
            return
          }

          // Send MFA code when user selects method
          if (mfaMethod === 'sms' && !phoneNumber) {
            setError('Please enter your phone number')
            setIsLoading(false)
            return
          }

          if (!actualMfaCode) {
            try {
              const response = await fetch('/api/notifications/send-mfa', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  email: mfaMethod === 'email' ? 'john.smith@nyc.gov' : undefined,
                  phone: mfaMethod === 'sms' ? phoneNumber : undefined,
                  organizationName: 'City of New York'
                })
              })

              const result = await response.json()
              if (result.success) {
                setActualMfaCode(result.code || '123456')
                setShowDevTools(true)
                if (mfaMethod === 'email') {
                  toast.info('MFA code sent to email - Check MailHog!')
                } else {
                  toast.info('MFA code sent via SMS - Check SMS Simulator!')
                }
              } else {
                setError('Failed to send MFA code')
              }
            } catch (error) {
              // Fallback to demo mode if API fails
              setActualMfaCode('123456')
              toast.info('MFA code sent (Demo Mode: 123456)')
            }
            setIsLoading(false)
            return
          }

          if (mfaCode !== actualMfaCode) {
            setError(`Invalid MFA code (Expected: ${actualMfaCode})`)
            setIsLoading(false)
            return
          }

          // Store organization session
          const orgData = {
            id: 'org-001',
            name: 'City of New York',
            type: 'Government & Public Sector',
            role: 'admin',
            permissions: ['manage_wallets', 'view_transactions', 'manage_users', 'configure_limits']
          }

          localStorage.setItem('org_token', 'demo-org-token-' + Date.now())
          localStorage.setItem('organization', JSON.stringify(orgData))

          toast.success('Welcome to City of New York Enterprise Portal')
          router.push('/dashboard')
        } else {
          setError('Invalid organization ID or password')
        }
      } else {
        // Email-based login
        const validEmails = [
          'john.smith@nyc.gov',
          'admin@chase.com',
          'compliance@wellsfargo.com'
        ]

        if (validEmails.includes(email) && password === 'demo123') {
          if (!showMfa) {
            try {
              const response = await fetch('/api/notifications/send-mfa', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  email: email,
                  organizationName: 'Enterprise Organization'
                })
              })

              const result = await response.json()
              if (result.success) {
                setActualMfaCode(result.code || '123456')
                setShowMfa(true)
                setShowDevTools(true)
                toast.info(`MFA code sent to ${email} - Check MailHog!`)
              } else {
                setError('Failed to send MFA code')
              }
            } catch (error) {
              // Fallback to demo mode
              setActualMfaCode('123456')
              setShowMfa(true)
              toast.info('MFA code sent (Demo Mode: 123456)')
            }
            setIsLoading(false)
            return
          }

          if (mfaCode !== actualMfaCode) {
            setError(`Invalid MFA code`)
            setIsLoading(false)
            return
          }

          // Determine organization from email
          let orgData = null
          if (email.includes('nyc.gov')) {
            orgData = {
              id: 'org-001',
              name: 'City of New York',
              type: 'Government & Public Sector',
              role: 'admin'
            }
          } else if (email.includes('chase.com')) {
            orgData = {
              id: 'org-002',
              name: 'Chase Digital Banking',
              type: 'Banking & Financial Services',
              role: 'admin'
            }
          } else if (email.includes('wellsfargo.com')) {
            orgData = {
              id: 'org-003',
              name: 'Wells Fargo Commercial',
              type: 'Banking & Financial Services',
              role: 'compliance'
            }
          }

          localStorage.setItem('org_token', 'demo-org-token-' + Date.now())
          localStorage.setItem('organization', JSON.stringify(orgData))

          toast.success(`Welcome to ${orgData?.name} Enterprise Portal`)
          router.push('/dashboard')
        } else {
          setError('Invalid email or password')
        }
      }
    } catch (err) {
      setError('Authentication failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSSOLogin = (provider: string) => {
    toast.info(`${provider} SSO integration coming soon`)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50 p-4">
      <div className="w-full max-w-lg space-y-6">
        {/* Logo and Title */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-xl">
              <Building2 className="h-10 w-10" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900">Enterprise Portal</h1>
          <p className="text-gray-600 mt-2">Organization access to Monay CaaS Platform</p>
        </div>

        {/* Login Card */}
        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl">Organization Sign In</CardTitle>
            <CardDescription>
              Access your enterprise wallet and treasury management
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Demo Credentials Alert */}
            <Alert className="bg-blue-50 border-blue-200">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-sm">
                <strong>Demo Credentials:</strong><br />
                Org ID: <code className="bg-white px-1 rounded">org-001</code> |
                Email: <code className="bg-white px-1 rounded ml-1">john.smith@nyc.gov</code><br />
                Password: <code className="bg-white px-1 rounded">demo123</code><br />
                MFA: <code className="bg-white px-1 rounded">Check MailHog (Email) or SMS Simulator (SMS)</code><br />
                Test Phone: <code className="bg-white px-1 rounded">+1 (212) 555-0100</code>
              </AlertDescription>
            </Alert>

            {/* Dev Tools Alert */}
            {showDevTools && (
              <Alert className="bg-green-50 border-green-200">
                <AlertCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-sm">
                  <strong>📧 Email & SMS Testing Tools:</strong><br />
                  <div className="flex gap-4 mt-2">
                    <a
                      href="http://localhost:8025/#"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-blue-600 hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" />
                      MailHog (Emails)
                    </a>
                    <a
                      href="http://localhost:3030"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-blue-600 hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" />
                      SMS Simulator
                    </a>
                  </div>
                  {actualMfaCode && (
                    <div className="mt-2">
                      Dev MFA Code: <code className="bg-white px-1 rounded">{actualMfaCode}</code>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Login Method Tabs */}
            <Tabs value={loginMethod} onValueChange={(v) => setLoginMethod(v as any)}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="orgId">
                  <Hash className="h-4 w-4 mr-1" />
                  Organization ID
                </TabsTrigger>
                <TabsTrigger value="email">
                  <Mail className="h-4 w-4 mr-1" />
                  Email Login
                </TabsTrigger>
              </TabsList>

              {/* Organization ID Login */}
              <TabsContent value="orgId" className="space-y-4 mt-4">
                <form onSubmit={handleOrganizationLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="org-id">Organization ID</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="org-id"
                        type="text"
                        placeholder="org-001"
                        value={orgId}
                        onChange={(e) => setOrgId(e.target.value)}
                        className="pl-10"
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      Your unique organization identifier provided during onboarding
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="org-password">Admin Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="org-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter admin password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10"
                        required
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {showMfa && (
                    <div className="space-y-4">
                      {/* MFA Method Selection */}
                      <div className="space-y-2">
                        <Label>Verification Method</Label>
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            type="button"
                            variant={mfaMethod === 'email' ? 'default' : 'outline'}
                            onClick={() => {
                              setMfaMethod('email')
                              setActualMfaCode('')
                              setMfaCode('')
                            }}
                            disabled={isLoading}
                          >
                            <Mail className="h-4 w-4 mr-2" />
                            Email
                          </Button>
                          <Button
                            type="button"
                            variant={mfaMethod === 'sms' ? 'default' : 'outline'}
                            onClick={() => {
                              setMfaMethod('sms')
                              setActualMfaCode('')
                              setMfaCode('')
                            }}
                            disabled={isLoading}
                          >
                            <Smartphone className="h-4 w-4 mr-2" />
                            SMS
                          </Button>
                        </div>
                      </div>

                      {/* Phone Number Input for SMS */}
                      {mfaMethod === 'sms' && (
                        <div className="space-y-2">
                          <Label htmlFor="phone-number">Phone Number</Label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              id="phone-number"
                              type="tel"
                              placeholder="+1 (555) 123-4567"
                              value={phoneNumber}
                              onChange={(e) => setPhoneNumber(e.target.value)}
                              className="pl-10"
                              disabled={isLoading || !!actualMfaCode}
                            />
                          </div>
                          <p className="text-xs text-gray-500">
                            Enter your mobile number to receive SMS code
                          </p>
                        </div>
                      )}

                      {/* Send Code Button */}
                      {!actualMfaCode && (
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full"
                          onClick={async () => {
                            if (mfaMethod === 'sms' && !phoneNumber) {
                              toast.error('Please enter phone number')
                              return
                            }
                            setIsLoading(true)
                            try {
                              const response = await fetch('/api/notifications/send-mfa', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  email: mfaMethod === 'email' ? 'john.smith@nyc.gov' : undefined,
                                  phone: mfaMethod === 'sms' ? phoneNumber : undefined,
                                  organizationName: 'City of New York'
                                })
                              })

                              const result = await response.json()
                              if (result.success) {
                                setActualMfaCode(result.code || '123456')
                                setShowDevTools(true)
                                if (mfaMethod === 'email') {
                                  toast.success('MFA code sent to email - Check MailHog!')
                                } else {
                                  toast.success('MFA code sent via SMS - Check SMS Simulator!')
                                }
                              } else {
                                toast.error('Failed to send MFA code')
                              }
                            } catch (error) {
                              setActualMfaCode('123456')
                              toast.info('Using demo code: 123456')
                            }
                            setIsLoading(false)
                          }}
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Sending Code...
                            </>
                          ) : (
                            <>
                              Send {mfaMethod === 'email' ? 'Email' : 'SMS'} Code
                            </>
                          )}
                        </Button>
                      )}

                      {/* MFA Code Input */}
                      {actualMfaCode && (
                        <div className="space-y-2">
                          <Label htmlFor="mfa-code">Verification Code</Label>
                          <div className="relative">
                            <Shield className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              id="mfa-code"
                              type="text"
                              placeholder="Enter 6-digit code"
                              value={mfaCode}
                              onChange={(e) => setMfaCode(e.target.value)}
                              className="pl-10"
                              maxLength={6}
                              required
                              disabled={isLoading}
                              autoFocus
                            />
                          </div>
                          <p className="text-xs text-gray-500">
                            Enter the code sent to your {mfaMethod === 'email' ? 'email' : 'phone'}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Authenticating...
                      </>
                    ) : (
                      <>
                        Sign In to Enterprise
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>

              {/* Email Login */}
              <TabsContent value="email" className="space-y-4 mt-4">
                <form onSubmit={handleOrganizationLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="org-email">Organization Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="org-email"
                        type="email"
                        placeholder="admin@organization.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      Use your organization's registered admin email
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="email-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10"
                        required
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {showMfa && (
                    <div className="space-y-2">
                      <Label htmlFor="email-mfa-code">MFA Code</Label>
                      <div className="relative">
                        <Shield className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="email-mfa-code"
                          type="text"
                          placeholder="Enter 6-digit code"
                          value={mfaCode}
                          onChange={(e) => setMfaCode(e.target.value)}
                          className="pl-10"
                          maxLength={6}
                          required={showMfa}
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Authenticating...
                      </>
                    ) : (
                      <>
                        Sign In with Email
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <Separator />

            {/* SSO Options */}
            <div className="space-y-3">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-muted-foreground">Enterprise SSO</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={() => handleSSOLogin('Okta')}
                  disabled={isLoading}
                  className="text-sm"
                >
                  <Globe className="mr-2 h-4 w-4" />
                  Okta
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleSSOLogin('Azure AD')}
                  disabled={isLoading}
                  className="text-sm"
                >
                  <Shield className="mr-2 h-4 w-4" />
                  Azure AD
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleSSOLogin('SAML')}
                  disabled={isLoading}
                  className="text-sm"
                >
                  <Key className="mr-2 h-4 w-4" />
                  SAML 2.0
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleSSOLogin('Google')}
                  disabled={isLoading}
                  className="text-sm"
                >
                  <UserCheck className="mr-2 h-4 w-4" />
                  Google
                </Button>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 pt-4">
            <div className="flex items-center justify-between w-full text-sm">
              <Link href="/auth/organization/forgot-password" className="text-blue-600 hover:underline">
                Forgot credentials?
              </Link>
              <Link href="/auth/login" className="text-blue-600 hover:underline">
                Individual login →
              </Link>
            </div>

            <div className="text-center text-xs text-gray-500">
              Need help? Contact your organization admin or{' '}
              <Link href="/support" className="text-blue-600 hover:underline">
                Monay Support
              </Link>
            </div>

            <div className="text-center text-xs text-gray-500 space-y-1">
              <div className="flex items-center justify-center gap-4">
                <span className="flex items-center">
                  <Shield className="h-3 w-3 mr-1" />
                  SOC 2 Type II
                </span>
                <span className="flex items-center">
                  <CreditCard className="h-3 w-3 mr-1" />
                  PCI DSS
                </span>
                <span className="flex items-center">
                  <Users className="h-3 w-3 mr-1" />
                  ISO 27001
                </span>
              </div>
            </div>
          </CardFooter>
        </Card>

        {/* Help Section */}
        <div className="text-center space-y-2">
          <p className="text-sm text-gray-600">
            First time accessing the portal?
          </p>
          <Link href="/auth/organization/onboarding" className="text-sm text-blue-600 hover:underline">
            Complete organization onboarding →
          </Link>
        </div>
      </div>
    </div>
  )
}