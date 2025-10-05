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
      // Check if user is authenticated (try both auth_token and authToken for compatibility)
      const authToken = localStorage.getItem('auth_token') || localStorage.getItem('authToken')
      if (!authToken) {
        console.log('No auth token found in localStorage - skipping onboarding check')
        setIsLoading(false)
        return
      }

      // Don't redirect to onboarding from login/auth pages or if already on onboarding
      const currentPath = window.location.pathname
      if (currentPath === '/login' ||
          currentPath === '/auth/login' ||
          currentPath.startsWith('/auth/') ||
          currentPath === '/onboarding' ||
          currentPath.startsWith('/onboarding/')) {
        console.log('On auth/onboarding page - skipping onboarding redirect')
        setIsLoading(false)
        return
      }

      // CRITICAL: Check if user just skipped onboarding
      // If yes, DON'T call the API at all - just allow dashboard access
      const justSkipped = localStorage.getItem('onboarding_skipped')
      if (justSkipped === 'true') {
        console.log('🚫 User skipped onboarding - BLOCKING API call, allowing dashboard access')
        localStorage.removeItem('onboarding_skipped') // Clear flag after use

        // Set a permissive status to prevent any redirect
        setOnboardingStatus({
          isFirstLogin: false,
          hasCompletedOnboarding: false, // They haven't completed, but we're allowing access
          currentStep: 'skipped'
        })

        setIsLoading(false)
        return // EXIT IMMEDIATELY - DO NOT CALL API OR REDIRECT
      }

      // Fetch user's onboarding status from backend
      console.log('Fetching onboarding status from API...')
      const response = await fetch('http://localhost:3001/api/onboarding/status', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        console.error('Failed to fetch onboarding status:', response.status, response.statusText)
        // If unauthorized, don't redirect to onboarding
        if (response.status === 401 || response.status === 403) {
          setIsLoading(false)
          return
        }
        throw new Error('Failed to fetch onboarding status')
      }

      const status: OnboardingStatus = await response.json()
      console.log('Onboarding status received:', status)
      setOnboardingStatus(status)

      // Check if this is first login and onboarding not completed
      console.log('Checking onboarding requirements:', {
        isFirstLogin: status.isFirstLogin,
        hasCompletedOnboarding: status.hasCompletedOnboarding,
        shouldRedirect: status.isFirstLogin && !status.hasCompletedOnboarding
      })

      // REMOVED FORCED REDIRECT - Onboarding is now optional
      // Users can choose to complete onboarding via banner on dashboard
      if (status.isFirstLogin && !status.hasCompletedOnboarding) {
        console.log('⚠️ Onboarding incomplete, but allowing dashboard access (no forced redirect)')
        // Just set the status - no redirect
      }

      if (status.hasCompletedOnboarding) {
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
      const authToken = localStorage.getItem('auth_token') || localStorage.getItem('authToken')
      if (!authToken) return

      const response = await fetch('http://localhost:3001/api/onboarding/complete', {
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
      const authToken = localStorage.getItem('auth_token') || localStorage.getItem('authToken')
      if (!authToken) return

      // Mark as skipped (but can be resumed later)
      const response = await fetch('http://localhost:3001/api/onboarding/skip', {
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