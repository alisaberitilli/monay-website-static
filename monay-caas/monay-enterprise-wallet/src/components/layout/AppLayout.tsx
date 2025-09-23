'use client'

import React from 'react'
import MainNavigation from './MainNavigation'
import Breadcrumbs from './Breadcrumbs'
import OrganizationSwitcher from './OrganizationSwitcher'

interface AppLayoutProps {
  children: React.ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Main Navigation with Organization Switcher */}
      <div className="sticky top-0 z-50">
        <MainNavigation />

        {/* Organization Context Bar */}
        <div className="border-b bg-muted/50 px-4 py-2">
          <div className="flex items-center justify-between">
            <OrganizationSwitcher />
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Environment: Production</span>
              <span>Region: US-East</span>
            </div>
          </div>
        </div>

        {/* Breadcrumbs */}
        <Breadcrumbs />
      </div>

      {/* Main Content */}
      <main className="flex-1">
        <div className="container mx-auto py-6 px-4 lg:px-8">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-auto">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <span>© 2025 Monay Enterprise</span>
              <a href="/terms" className="hover:text-foreground">Terms</a>
              <a href="/privacy" className="hover:text-foreground">Privacy</a>
              <a href="/docs" className="hover:text-foreground">Documentation</a>
            </div>
            <div className="flex items-center gap-4">
              <span>Version 2.0.0</span>
              <a href="/status" className="hover:text-foreground">System Status</a>
              <a href="/support" className="hover:text-foreground">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}