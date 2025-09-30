'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Building,
  Shield,
  Coins,
  Users,
  CreditCard,
  BarChart3,
  CheckCircle,
  ArrowRight
} from 'lucide-react'

export default function EnterpriseOnboardingWelcome() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleGetStarted = () => {
    setLoading(true)
    router.push('/onboarding/organization')
  }

  const features = [
    {
      icon: Building,
      title: 'Organization Setup',
      description: 'Configure your company profile and structure'
    },
    {
      icon: Shield,
      title: 'KYB Verification',
      description: 'Complete business verification for compliance'
    },
    {
      icon: CreditCard,
      title: 'Banking Information',
      description: 'Connect your business bank accounts'
    },
    {
      icon: Coins,
      title: 'Token Creation',
      description: 'Issue and manage your own tokens'
    },
    {
      icon: Users,
      title: 'Team Management',
      description: 'Invite team members and set permissions'
    },
    {
      icon: BarChart3,
      title: 'Business Rules',
      description: 'Configure programmable money rules'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="max-w-4xl w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">
            Welcome to Monay Enterprise Wallet
          </CardTitle>
          <CardDescription className="text-lg mt-2">
            Let's set up your organization in just a few steps
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Features Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-4 rounded-lg border bg-white"
              >
                <div className="p-2 bg-blue-50 rounded-lg">
                  <feature.icon className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{feature.title}</h3>
                  <p className="text-xs text-gray-500 mt-1">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* What to Expect */}
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="font-semibold mb-3">What to expect:</h3>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Complete setup in under 10 minutes</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Secure business verification process</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Instant access to invoice-first payments</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Programmable money with business rules</span>
              </li>
            </ul>
          </div>

          {/* Required Documents */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h4 className="font-semibold text-amber-800 mb-2">
              Have these ready:
            </h4>
            <ul className="text-sm text-amber-700 space-y-1">
              <li>• Business registration documents</li>
              <li>• EIN or Tax ID number</li>
              <li>• Bank account information</li>
              <li>• Authorized signatory details</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-4">
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard')}
            >
              Skip for Now
            </Button>
            <Button
              onClick={handleGetStarted}
              disabled={loading}
              className="min-w-[150px]"
            >
              {loading ? (
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
              ) : (
                <>
                  Get Started
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>

          <p className="text-center text-xs text-gray-500">
            You can complete this later from Settings → Organization Setup
          </p>
        </CardContent>
      </Card>
    </div>
  )
}