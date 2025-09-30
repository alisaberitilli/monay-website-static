'use client'

import EnterpriseNavigation from '@/components/navigation/EnterpriseNavigation'
import { OnboardingProvider } from '@/hooks/useOnboardingCheck'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <OnboardingProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Consistent Navigation Menu across all pages */}
        <EnterpriseNavigation />
      
        {/* Main Content Area - Responsive padding */}
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