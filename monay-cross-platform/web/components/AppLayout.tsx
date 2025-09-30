'use client'

import { usePathname } from 'next/navigation'
import { OnboardingProvider } from '@/hooks/useOnboardingCheck'

interface AppLayoutProps {
  children: React.ReactNode
}

/**
 * Main app layout wrapper that includes onboarding check
 * This ensures onboarding is triggered after first login
 */
export default function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname()

  // Don't apply onboarding check to auth pages
  const isAuthPage = pathname?.startsWith('/login') ||
                     pathname?.startsWith('/signup') ||
                     pathname?.startsWith('/reset-password')

  // Don't apply onboarding check to the onboarding flow itself
  const isOnboardingPage = pathname?.startsWith('/onboarding')

  // Apply onboarding check to all other pages
  if (!isAuthPage && !isOnboardingPage) {
    return (
      <OnboardingProvider>
        {children}
      </OnboardingProvider>
    )
  }

  // For auth and onboarding pages, render without the provider
  return <>{children}</>
}