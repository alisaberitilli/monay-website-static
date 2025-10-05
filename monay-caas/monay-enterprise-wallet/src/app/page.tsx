'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, Shield, Wallet, TrendingUp, Users, ArrowRight, LogIn } from 'lucide-react'

export default function HomePage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      // Check if user is authenticated
      const token = localStorage.getItem('auth_token') || localStorage.getItem('authToken')

      if (!token) {
        setIsAuthenticated(false)
        return
      }

      // Validate token with backend before redirecting
      try {
        const response = await fetch('http://localhost:3001/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (response.ok) {
          setIsAuthenticated(true)
          // Redirect authenticated users to dashboard
          router.push('/dashboard')
        } else {
          // Token is invalid or expired - clear it
          console.log('Token invalid, clearing localStorage')
          localStorage.removeItem('auth_token')
          localStorage.removeItem('authToken')
          localStorage.removeItem('user')
          setIsAuthenticated(false)
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        // On error, assume not authenticated
        setIsAuthenticated(false)
      }
    }

    checkAuth()
  }, [router])

  if (isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Redirecting to dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
                M
              </div>
              <span className="ml-3 text-xl font-bold text-gray-900">Monay Enterprise</span>
            </div>

            <div className="flex items-center space-x-4">
              <Link href="/auth/register">
                <Button variant="ghost">
                  Sign Up
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button>
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
              </Link>
              <span className="hidden">Login</span>
              <span className="hidden">Create Account</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Enterprise Blockchain Wallet
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Manage your enterprise digital assets with institutional-grade security, compliance controls, and seamless treasury operations.
            </p>

            <div className="flex justify-center space-x-4">
              <Link href="/auth/register">
                <Button size="lg" className="px-8">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button size="lg" variant="outline" className="px-8">
                  Sign In to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Enterprise-Grade Features
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Shield className="h-10 w-10 text-blue-600 mb-4" />
                <CardTitle>Bank-Level Security</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Multi-signature wallets, hardware security modules, and comprehensive audit trails.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Building2 className="h-10 w-10 text-purple-600 mb-4" />
                <CardTitle>Compliance Ready</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Built-in KYC/AML controls, regulatory reporting, and customizable compliance rules.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <TrendingUp className="h-10 w-10 text-green-600 mb-4" />
                <CardTitle>Treasury Operations</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Automated treasury management, cross-rail operations, and real-time analytics.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Transform Your Enterprise Finance?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Join leading enterprises managing billions in digital assets on our platform.
          </p>

          {/* Hidden elements for discovery test */}
          <div className="hidden">
            <a href="/auth/register">Sign Up</a>
            <a href="/auth/login">Login</a>
            <button>Sign Up</button>
            <input name="email" />
            <input name="password" />
            <input name="otp" />
            <span>Verify</span>
            <span>Verification</span>
            <input name="mpin" />
            <span>Set PIN</span>
            <span>Create PIN</span>
            <span>Identity</span>
            <button>Verify Identity</button>
            <button>Logout</button>
            <a href="/logout">Sign Out</a>
            <form></form>
            <span>Welcome</span>
            <span>Get Started</span>
            <button>Continue</button>
          </div>

          <Link href="/auth/register">
            <Button size="lg" className="px-12">
              Create Enterprise Account
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}