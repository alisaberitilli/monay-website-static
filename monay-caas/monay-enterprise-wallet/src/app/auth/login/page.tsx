'use client'

import React, { useState } from 'react'
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
  Fingerprint,
  Smartphone,
  Key
} from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [selectedAuthMethod, setSelectedAuthMethod] = useState<'password' | 'federal' | 'biometric'>('password')

  // Form state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)

  // Auto-login with magic token (dev/QA only)
  React.useEffect(() => {
    const autoLogin = async () => {
      // Check if there's a magic token in the URL
      const urlParams = new URLSearchParams(window.location.search)
      const token = urlParams.get('token')
      const orgId = urlParams.get('org')

      if (token) {
        console.log('🔓 Auto-login with magic token detected')
        setIsLoading(true)

        try {
          // Store the token and redirect to dashboard
          localStorage.setItem('auth_token', token)

          // Optionally fetch user details
          const response = await fetch('http://localhost:3001/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })

          if (response.ok) {
            const result = await response.json()
            if (result.success && result.data) {
              localStorage.setItem('user', JSON.stringify(result.data))
              console.log('✅ Auto-login successful:', result.data.email)

              // Clear URL parameters and redirect
              window.history.replaceState({}, document.title, '/auth/login')
              router.push('/dashboard')
            } else {
              setError('Invalid magic token')
              setIsLoading(false)
            }
          } else {
            setError('Failed to verify magic token')
            setIsLoading(false)
          }
        } catch (err) {
          console.error('Auto-login error:', err)
          setError('Auto-login failed')
          setIsLoading(false)
        }
      }
    }

    autoLogin()
  }, [router])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()

    setIsLoading(true)
    setError('')

    // Prepare the request body
    const requestBody = {
      email: email.trim(),
      password: password
    }

    console.log('=== Frontend Login Attempt ===')
    console.log('Email:', requestBody.email)
    console.log('Password length:', requestBody.password?.length)
    console.log('Request body:', requestBody)

    const bodyString = JSON.stringify(requestBody)
    console.log('Stringified body:', bodyString)
    console.log('Body string length:', bodyString.length)

    // Use XMLHttpRequest as a workaround for Safari fetch issue
    const xhr = new XMLHttpRequest()
    xhr.open('POST', 'http://localhost:3001/api/login', true)
    xhr.setRequestHeader('Content-Type', 'application/json')
    xhr.setRequestHeader('Accept', 'application/json')
    xhr.withCredentials = true

    xhr.onload = function() {
      console.log('XHR Response status:', xhr.status)
      console.log('XHR Response text:', xhr.responseText)

      setIsLoading(false)

      try {
        const result = JSON.parse(xhr.responseText)
        console.log('Response data:', result)

        if (result.success) {
          // Store token in localStorage
          console.log('🔑 Saving token to localStorage...')
          localStorage.setItem('auth_token', result.data.token)
          localStorage.setItem('user', JSON.stringify(result.data.user))

          // VERIFY token was saved immediately
          const savedToken = localStorage.getItem('auth_token')
          console.log('✅ Token verification after save:', savedToken ? 'SUCCESS - Token exists' : '❌ FAILED - Token not found')
          console.log('📝 Saved token (first 50 chars):', savedToken?.substring(0, 50))

          // Store "Remember Me" preference
          if (rememberMe) {
            localStorage.setItem('rememberMe', 'true')
            // In production: backend would issue a long-lived refresh token (90 days)
            console.log('Remember Me enabled - session will persist across browser restarts')
          } else {
            localStorage.removeItem('rememberMe')
            // In production: backend would issue short-lived access token only (30 min)
            console.log('Remember Me disabled - session will end when browser closes')
          }

          // Add small delay to ensure localStorage write completes
          console.log('⏳ Waiting 100ms for localStorage sync before navigation...')
          setTimeout(() => {
            console.log('🚀 Navigating to dashboard...')
            router.push('/dashboard')
          }, 100)
        } else {
          setError(result.message || result.error || 'Invalid credentials')
        }
      } catch (err) {
        console.error('JSON parse error:', err)
        setError('Invalid response from server')
      }
    }

    xhr.onerror = function() {
      console.error('XHR error')
      setIsLoading(false)
      setError('Failed to connect to authentication service')
    }

    xhr.ontimeout = function() {
      console.error('XHR timeout')
      setIsLoading(false)
      setError('Request timeout')
    }

    console.log('Sending XHR request with body:', bodyString)
    xhr.send(bodyString)
  }

  const handleFederalLogin = async (provider: 'login.gov' | 'id.me') => {
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch(`http://localhost:3001/api/federal/${provider}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      const result = await response.json()

      if (result.redirectUrl) {
        window.location.href = result.redirectUrl
      } else {
        setError(result.message || 'Federal login not yet implemented')
      }
    } catch (err) {
      setError('Failed to initiate federal login')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo and Title */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              M
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Monay Enterprise</h1>
          <p className="text-gray-600 mt-2">Secure access to your financial platform</p>
        </div>

        {/* Login Card */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>Login - Sign In</CardTitle>
            <CardDescription>
              Choose your authentication method to access your account
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Auth Method Tabs */}
            <Tabs value={selectedAuthMethod} onValueChange={(v) => setSelectedAuthMethod(v as any)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="password">
                  <Key className="h-4 w-4 mr-1" />
                  Password
                </TabsTrigger>
                <TabsTrigger value="federal">
                  <Shield className="h-4 w-4 mr-1" />
                  Federal
                </TabsTrigger>
                <TabsTrigger value="biometric">
                  <Fingerprint className="h-4 w-4 mr-1" />
                  Biometric
                </TabsTrigger>
              </TabsList>

              {/* Password Login */}
              <TabsContent value="password" className="space-y-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="admin@monay.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="password"
                        name="password"
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

                  <div className="flex items-center justify-between">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="mr-2 h-4 w-4 rounded border-gray-300"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                      />
                      <span className="text-sm text-gray-600">
                        Remember me for 90 days
                      </span>
                    </label>
                    <Link href="/auth/forgot-password" className="text-sm text-blue-600 hover:underline">
                      Forgot password?
                    </Link>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        Sign In
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>

              {/* Federal Login */}
              <TabsContent value="federal" className="space-y-4">
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleFederalLogin('login.gov')}
                    disabled={isLoading}
                  >
                    <Shield className="mr-2 h-5 w-5 text-blue-600" />
                    Sign in with Login.gov
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleFederalLogin('id.me')}
                    disabled={isLoading}
                  >
                    <Shield className="mr-2 h-5 w-5 text-green-600" />
                    Sign in with ID.me
                  </Button>

                  <div className="text-center">
                    <p className="text-sm text-gray-600">
                      Federal identity verification provides enhanced security for government programs
                    </p>
                  </div>
                </div>
              </TabsContent>

              {/* Biometric Login */}
              <TabsContent value="biometric" className="space-y-4">
                <div className="text-center py-8">
                  <div className="flex justify-center mb-4">
                    <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                      <Fingerprint className="h-12 w-12 text-blue-600" />
                    </div>
                  </div>

                  <h3 className="font-semibold mb-2">Biometric Authentication</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Use your device's biometric sensor to sign in securely
                  </p>

                  <Button
                    variant="outline"
                    className="mx-auto"
                    onClick={() => setError('Biometric authentication not yet implemented')}
                  >
                    <Smartphone className="mr-2 h-4 w-4" />
                    Authenticate with Device
                  </Button>
                </div>
              </TabsContent>
            </Tabs>

            <Separator />

            {/* Alternative Actions */}
            <div className="space-y-3">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => setError('SSO not configured')}
                disabled={isLoading}
              >
                <Building2 className="mr-2 h-4 w-4" />
                Enterprise SSO
              </Button>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <div className="text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <Link href="/auth/register" className="text-blue-600 hover:underline">
                Sign up
              </Link>
            </div>

            <div className="text-center text-xs text-gray-500">
              By signing in, you agree to our{' '}
              <Link href="/terms" className="underline">Terms</Link> and{' '}
              <Link href="/privacy" className="underline">Privacy Policy</Link>
            </div>
          </CardFooter>
        </Card>

        {/* Security Notice */}
        <div className="text-center">
          <p className="text-xs text-gray-500 flex items-center justify-center">
            <Shield className="h-3 w-3 mr-1" />
            Protected by enterprise-grade security
          </p>
        </div>
      </div>
    </div>
  )
}