'use client'

import Sidebar from '@/components/layout/Sidebar'
import MobileNavigation from '@/components/layout/MobileNavigation'
import { useIsMobile } from '@/hooks/useMediaQuery'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const isMobile = useIsMobile()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      {isMobile ? <MobileNavigation /> : <Sidebar />}
      
      {/* Main Content Area - pl-64 for sidebar width */}
      <div className={`${isMobile ? 'pt-16 pb-16' : 'pl-64'}`}>
        {/* Header */}
        <header className="bg-white border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">Monay Enterprise</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Welcome back!</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t mt-auto">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div>
                © 2024 Monay. All rights reserved.
              </div>
              <div className="flex items-center gap-4">
                <a href="#" className="hover:text-gray-900">Privacy</a>
                <a href="#" className="hover:text-gray-900">Terms</a>
                <a href="#" className="hover:text-gray-900">Support</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}