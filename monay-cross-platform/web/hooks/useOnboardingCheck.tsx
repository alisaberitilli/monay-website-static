/**
 * Hook to check and trigger onboarding wizard after first login
 * Consumer Wallet version
 */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface ConsumerOnboardingStatus {
  isFirstLogin: boolean
  hasCompletedOnboarding: boolean
  currentStep?: string
  userId?: string
  email?: string
  hasVerifiedEmail?: boolean
  hasSetupKYC?: boolean
  hasAddedPaymentMethod?: boolean
}

export function useOnboardingCheck() {
  const router = useRouter()
  const [onboardingStatus, setOnboardingStatus] = useState<ConsumerOnboardingStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkOnboardingStatus()
  }, [])

  const checkOnboardingStatus = async () => {
    try {
      // Check if user is authenticated
      const authToken = localStorage.getItem('authToken')
      if (!authToken) {
        setIsLoading(false)
        return
      }

      // Fetch user's onboarding status from backend
      const response = await fetch('/api/onboarding/status', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch onboarding status')
      }

      const status: ConsumerOnboardingStatus = await response.json()
      setOnboardingStatus(status)

      // Check if this is first login and onboarding not completed
      if (status.isFirstLogin && !status.hasCompletedOnboarding) {
        // Store current intended path to redirect after onboarding
        const currentPath = window.location.pathname
        if (currentPath !== '/onboarding' && !currentPath.startsWith('/onboarding/')) {
          sessionStorage.setItem('postOnboardingRedirect', currentPath)
        }

        // Determine which step to show based on current progress
        const onboardingPath = getOnboardingPath(status)

        // Redirect to onboarding wizard
        router.push(onboardingPath as any)
      } else if (status.hasCompletedOnboarding) {
        // Check if there's a redirect path after completing onboarding
        const redirectPath = sessionStorage.getItem('postOnboardingRedirect')
        if (redirectPath) {
          sessionStorage.removeItem('postOnboardingRedirect')
          router.push(redirectPath as any)
        }
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getOnboardingPath = (status: ConsumerOnboardingStatus): string => {
    // Determine next step based on what's completed
    if (!status.hasVerifiedEmail) {
      return '/onboarding/verify-email'
    }
    if (!status.hasSetupKYC) {
      return '/onboarding/kyc'
    }
    if (!status.hasAddedPaymentMethod) {
      return '/onboarding/payment'
    }

    // Map specific step names
    switch (status.currentStep) {
      case 'profile':
        return '/onboarding/profile'
      case 'verify-email':
        return '/onboarding/verify-email'
      case 'kyc':
        return '/onboarding/kyc'
      case 'payment':
        return '/onboarding/payment'
      case 'card':
        return '/onboarding/card'
      case 'preferences':
        return '/onboarding/preferences'
      case 'complete':
        return '/onboarding/complete'
      default:
        return '/onboarding/welcome' // Consumer welcome screen
    }
  }

  const markOnboardingComplete = async () => {
    try {
      const authToken = localStorage.getItem('authToken')
      if (!authToken) return

      const response = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        setOnboardingStatus(prev => prev ? {
          ...prev,
          hasCompletedOnboarding: true,
          isFirstLogin: false
        } : null)

        // Show success message
        showWelcomeMessage()

        // Redirect to intended destination or dashboard
        const redirectPath = sessionStorage.getItem('postOnboardingRedirect') || '/dashboard'
        sessionStorage.removeItem('postOnboardingRedirect')
        router.push(redirectPath as any)
      }
    } catch (error) {
      console.error('Error marking onboarding as complete:', error)
    }
  }

  const skipOnboarding = async () => {
    try {
      const authToken = localStorage.getItem('authToken')
      if (!authToken) return

      // Mark as skipped (but can be resumed later)
      const response = await fetch('/api/onboarding/skip', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        // Set a reminder to complete onboarding later
        localStorage.setItem('onboardingSkipped', 'true')
        localStorage.setItem('onboardingSkippedDate', new Date().toISOString())

        setOnboardingStatus(prev => prev ? {
          ...prev,
          isFirstLogin: false
        } : null)

        const redirectPath = sessionStorage.getItem('postOnboardingRedirect') || '/dashboard'
        sessionStorage.removeItem('postOnboardingRedirect')
        router.push(redirectPath as any)
      }
    } catch (error) {
      console.error('Error skipping onboarding:', error)
    }
  }

  const resumeOnboarding = () => {
    if (onboardingStatus) {
      const onboardingPath = getOnboardingPath(onboardingStatus)
      router.push(onboardingPath as any)
    }
  }

  const showWelcomeMessage = () => {
    // You can implement a toast notification here
    console.log('Welcome to Monay! Your account is all set up.')
  }

  return {
    onboardingStatus,
    isLoading,
    markOnboardingComplete,
    skipOnboarding,
    resumeOnboarding,
    isOnboardingRequired: onboardingStatus?.isFirstLogin && !onboardingStatus?.hasCompletedOnboarding,
    isOnboardingSkipped: localStorage.getItem('onboardingSkipped') === 'true'
  }
}

/**
 * Provider component to wrap protected pages
 */
export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const { isLoading, isOnboardingRequired, isOnboardingSkipped } = useOnboardingCheck()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Show reminder banner if onboarding was skipped
  if (isOnboardingSkipped && !isOnboardingRequired) {
    return (
      <>
        <OnboardingReminder />
        {children}
      </>
    )
  }

  // If onboarding is required, the hook will handle redirect
  // Otherwise, render children normally
  return <>{children}</>
}

/**
 * Reminder banner for users who skipped onboarding
 */
function OnboardingReminder() {
  const { resumeOnboarding } = useOnboardingCheck()
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <div className="bg-blue-50 border-b border-blue-200 px-4 py-3">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center">
          <svg className="h-5 w-5 text-blue-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <p className="text-sm text-blue-800">
            Complete your profile setup to unlock all features and benefits
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={resumeOnboarding}
            className="text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            Resume Setup
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="text-blue-400 hover:text-blue-600"
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}