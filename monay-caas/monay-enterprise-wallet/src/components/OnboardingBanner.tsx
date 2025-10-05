'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { X, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react'

interface OnboardingBannerProps {
  onboardingStatus?: {
    isFirstLogin: boolean
    hasCompletedOnboarding: boolean
    currentStep?: string
  }
}

export default function OnboardingBanner({ onboardingStatus }: OnboardingBannerProps) {
  const router = useRouter()
  const [dismissed, setDismissed] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Check if user has dismissed the banner in this session
    const wasDismissed = sessionStorage.getItem('onboarding_banner_dismissed')
    if (wasDismissed === 'true') {
      setDismissed(true)
      return
    }

    // Show banner only if onboarding is incomplete
    if (onboardingStatus && !onboardingStatus.hasCompletedOnboarding) {
      setIsVisible(true)
    }
  }, [onboardingStatus])

  const handleDismiss = () => {
    setDismissed(true)
    sessionStorage.setItem('onboarding_banner_dismissed', 'true')
  }

  const handleContinueOnboarding = () => {
    // Navigate to onboarding page
    router.push('/onboarding')
  }

  if (dismissed || !isVisible) {
    return null
  }

  return (
    <Alert className="mb-6 border-orange-200 bg-orange-50">
      <AlertCircle className="h-5 w-5 text-orange-600" />
      <AlertTitle className="text-orange-900 font-semibold flex items-center justify-between">
        <span>Complete Your Account Setup</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDismiss}
          className="h-6 w-6 p-0 hover:bg-orange-100"
        >
          <X className="h-4 w-4 text-orange-600" />
        </Button>
      </AlertTitle>
      <AlertDescription className="text-orange-800 mt-2">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <p className="mb-2">
              You haven't completed your KYC verification yet. Complete the onboarding process to:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Verify your email and phone number</li>
              <li>Complete identity verification</li>
              <li>Set up banking and payment methods</li>
              <li>Access full platform features</li>
            </ul>
          </div>
          <Button
            onClick={handleContinueOnboarding}
            className="bg-orange-600 hover:bg-orange-700 text-white shrink-0"
          >
            Continue Setup
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  )
}
