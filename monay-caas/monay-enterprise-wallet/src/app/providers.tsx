'use client'

import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from './theme-provider'
import { InvoiceWalletSocketProvider } from '@/hooks/useInvoiceWalletSocket'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <InvoiceWalletSocketProvider>
        {children}
      </InvoiceWalletSocketProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            style: {
              background: '#10b981',
            },
          },
          error: {
            duration: 4000,
            style: {
              background: '#ef4444',
            },
          },
        }}
      />
    </ThemeProvider>
  )
}