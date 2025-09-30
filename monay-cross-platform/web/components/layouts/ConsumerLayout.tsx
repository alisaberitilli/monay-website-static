'use client'

import MainNavigation from '@/components/navigation/MainNavigation'
import { OnboardingProvider } from '@/hooks/useOnboardingCheck'
import { usePathname } from 'next/navigation'

interface ConsumerLayoutProps {
  children: React.ReactNode
}

export default function ConsumerLayout({ children }: ConsumerLayoutProps) {
  const pathname = usePathname()

  // Pages that should NOT have navigation
  const noNavPages = [
    '/login',
    '/signup',
    '/reset-password',
    '/verify',
    '/onboarding'
  ]

  // Check if current page should show navigation
  const shouldShowNav = !noNavPages.some(page => pathname?.startsWith(page))

  // If it's an auth or onboarding page, just render children
  if (!shouldShowNav) {
    return <>{children}</>
  }

  // For all other pages, wrap with navigation and onboarding check
  return (
    <OnboardingProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Navigation Menu - consistent across all pages */}
        <MainNavigation />

        {/* Main Content Area */}
        <div className="lg:pl-64">
          {/* Mobile top padding for fixed header */}
          <div className="lg:hidden h-16" />

          {/* Page Content */}
          <main className="p-4 lg:p-6">
            {children}
          </main>
        </div>
      </div>
    </OnboardingProvider>
  )
}