'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  User,
  Shield,
  CreditCard,
  Smartphone,
  Gift,
  DollarSign,
  Zap,
  CheckCircle,
  ArrowRight
} from 'lucide-react'

export default function ConsumerOnboardingWelcome() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleGetStarted = () => {
    setLoading(true)
    router.push('/onboarding/profile' as any)
  }

  const features = [
    {
      icon: DollarSign,
      title: 'Multi-Currency Wallet',
      description: 'Hold USD, crypto, and stablecoins'
    },
    {
      icon: CreditCard,
      title: 'Instant Virtual Card',
      description: 'Start spending immediately'
    },
    {
      icon: Smartphone,
      title: 'Mobile Payments',
      description: 'Apple Pay & Google Wallet ready'
    },
    {
      icon: Gift,
      title: 'Rewards Program',
      description: 'Earn points on every transaction'
    },
    {
      icon: Zap,
      title: 'Instant Transfers',
      description: 'Send money in seconds'
    },
    {
      icon: Shield,
      title: 'Bank-Level Security',
      description: 'Your money is FDIC insured'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 flex items-center justify-center p-4">
      <Card className="max-w-4xl w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">
            Welcome to Monay
          </CardTitle>
          <CardDescription className="text-lg mt-2">
            Your all-in-one financial super app
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Hero Message */}
          <div className="text-center bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-2">
              Get $25 Welcome Bonus
            </h2>
            <p className="text-sm opacity-90">
              Complete your profile setup and get instant rewards
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-4 rounded-lg border bg-white hover:shadow-md transition-shadow"
              >
                <div className="p-2 bg-purple-50 rounded-lg">
                  <feature.icon className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{feature.title}</h3>
                  <p className="text-xs text-gray-500 mt-1">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Setup Steps */}
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="font-semibold mb-3">Quick Setup (3 minutes):</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-white rounded-full flex items-center justify-center text-sm font-bold text-blue-600">
                  1
                </div>
                <div>
                  <p className="font-medium text-sm">Create Your Profile</p>
                  <p className="text-xs text-gray-500">Basic information and preferences</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-white rounded-full flex items-center justify-center text-sm font-bold text-blue-600">
                  2
                </div>
                <div>
                  <p className="font-medium text-sm">Verify Your Identity</p>
                  <p className="text-xs text-gray-500">Quick KYC verification for security</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-white rounded-full flex items-center justify-center text-sm font-bold text-blue-600">
                  3
                </div>
                <div>
                  <p className="font-medium text-sm">Add Funds</p>
                  <p className="text-xs text-gray-500">Link bank or card to get started</p>
                </div>
              </div>
            </div>
          </div>

          {/* Security Note */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-green-800 text-sm">
                  Your Security is Our Priority
                </h4>
                <p className="text-xs text-green-700 mt-1">
                  256-bit encryption • FDIC insured up to $250,000 •
                  Biometric authentication • Zero liability protection
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-4">
            <Button
              variant="ghost"
              onClick={() => {
                // Skip onboarding but mark it
                localStorage.setItem('onboardingSkipped', 'true')
                router.push('/dashboard')
              }}
              className="text-gray-500"
            >
              I'll do this later
            </Button>
            <Button
              onClick={handleGetStarted}
              disabled={loading}
              size="lg"
              className="min-w-[180px] bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {loading ? (
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
              ) : (
                <>
                  Start Setup
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>

          <p className="text-center text-xs text-gray-500">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </CardContent>
      </Card>
    </div>
  )
}