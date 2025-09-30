/**
 * Hook to check and trigger onboarding wizard after first login
 * Enterprise Wallet version
 */

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface OnboardingStatus {
  isFirstLogin: boolean
  hasCompletedOnboarding: boolean
  currentStep?: string
  organizationId?: string
  userId?: string
}

export function useOnboardingCheck() {
  const router = useRouter()
  const [onboardingStatus, setOnboardingStatus] = useState<OnboardingStatus | null>(null)
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

      const status: OnboardingStatus = await response.json()
      setOnboardingStatus(status)

      // Check if this is first login and onboarding not completed
      if (status.isFirstLogin && !status.hasCompletedOnboarding) {
        // Store current intended path to redirect after onboarding
        const currentPath = window.location.pathname
        if (currentPath !== '/onboarding' && !currentPath.startsWith('/onboarding/')) {
          sessionStorage.setItem('postOnboardingRedirect', currentPath)
        }

        // Determine which step to show based on current progress
        const onboardingPath = getOnboardingPath(status.currentStep)

        // Redirect to onboarding wizard
        router.push(onboardingPath)
      } else if (status.hasCompletedOnboarding) {
        // Check if there's a redirect path after completing onboarding
        const redirectPath = sessionStorage.getItem('postOnboardingRedirect')
        if (redirectPath) {
          sessionStorage.removeItem('postOnboardingRedirect')
          router.push(redirectPath)
        }
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getOnboardingPath = (currentStep?: string): string => {
    // Map current step to onboarding wizard path
    switch (currentStep) {
      case 'organization':
        return '/onboarding/organization'
      case 'kyb':
        return '/onboarding/kyb'
      case 'banking':
        return '/onboarding/banking'
      case 'subscription':
        return '/onboarding/subscription'
      case 'users':
        return '/onboarding/users'
      case 'rules':
        return '/onboarding/rules'
      case 'tokens':
        return '/onboarding/tokens'
      case 'complete':
        return '/onboarding/complete'
      default:
        return '/onboarding' // Start from beginning
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

        // Redirect to intended destination or dashboard
        const redirectPath = sessionStorage.getItem('postOnboardingRedirect') || '/dashboard'
        sessionStorage.removeItem('postOnboardingRedirect')
        router.push(redirectPath)
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
        // Allow navigation but flag as incomplete
        setOnboardingStatus(prev => prev ? {
          ...prev,
          isFirstLogin: false
        } : null)

        const redirectPath = sessionStorage.getItem('postOnboardingRedirect') || '/dashboard'
        sessionStorage.removeItem('postOnboardingRedirect')
        router.push(redirectPath)
      }
    } catch (error) {
      console.error('Error skipping onboarding:', error)
    }
  }

  return {
    onboardingStatus,
    isLoading,
    markOnboardingComplete,
    skipOnboarding,
    isOnboardingRequired: onboardingStatus?.isFirstLogin && !onboardingStatus?.hasCompletedOnboarding
  }
}

/**
 * Provider component to wrap protected pages
 */
export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const { isLoading, isOnboardingRequired } = useOnboardingCheck()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  // If onboarding is required, the hook will handle redirect
  // Otherwise, render children normally
  return <>{children}</>
}