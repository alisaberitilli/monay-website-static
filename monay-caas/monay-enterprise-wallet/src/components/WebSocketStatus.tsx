'use client'

import { useInvoiceWalletSocketContext } from '@/hooks/useInvoiceWalletSocket'
import { motion, AnimatePresence } from 'framer-motion'
import { Wifi, WifiOff } from 'lucide-react'
import { useEffect, useState } from 'react'

export function WebSocketStatus() {
  const { isConnected, activeWalletsCount } = useInvoiceWalletSocketContext()
  const [showStatus, setShowStatus] = useState(true)
  const [isClient, setIsClient] = useState(false)

  // Check if we're on the client side
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Keep status visible for longer when connected (30 seconds instead of 5)
  // and always show when disconnected/connecting
  useEffect(() => {
    if (isConnected) {
      const timer = setTimeout(() => {
        setShowStatus(false)
      }, 30000) // Changed from 5000ms to 30000ms (30 seconds)
      return () => clearTimeout(timer)
    } else {
      setShowStatus(true)
    }
  }, [isConnected])

  // Don't show anything during SSR or initial load
  if (!isClient) {
    return null
  }

  return (
    <>
      <AnimatePresence>
        {showStatus && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-3 py-2 rounded-lg backdrop-blur-md cursor-pointer ${
              isConnected
                ? 'bg-green-500/10 border border-green-500/20 text-green-600 hover:bg-green-500/20'
                : 'bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 hover:bg-yellow-500/20'
            } transition-colors`}
            onClick={() => setShowStatus(false)}
            title="Click to hide (hover the corner to show again)"
          >
          <div className="relative">
            {isConnected ? (
              <Wifi className="h-4 w-4" />
            ) : (
              <WifiOff className="h-4 w-4 animate-pulse" />
            )}
            <span
              className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${
                isConnected ? 'bg-green-500' : 'bg-yellow-500'
              } ${isConnected ? 'animate-pulse' : 'animate-ping'}`}
            />
          </div>
          <span className="text-xs font-medium">
            {isConnected ? 'Live' : 'Connecting...'}
          </span>
          {isConnected && activeWalletsCount > 0 && (
            <span className="text-xs opacity-70">
              ({activeWalletsCount} active)
            </span>
          )}
        </motion.div>
      )}
    </AnimatePresence>

    {/* Invisible hover area to show status again */}
    {!showStatus && (
      <div
        className="fixed top-4 right-4 w-20 h-10 z-40"
        onMouseEnter={() => setShowStatus(true)}
        title="Show connection status"
      />
    )}
  </>
  )
}

export function WebSocketIndicator({ className = '' }: { className?: string }) {
  const { isConnected } = useInvoiceWalletSocketContext()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Show "Initializing..." during SSR/initial load
  if (!isClient) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <span className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" />
        <span className="text-xs text-gray-500">Initializing...</span>
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span
        className={`w-2 h-2 rounded-full ${
          isConnected ? 'bg-green-500 animate-pulse' : 'bg-yellow-500 animate-ping'
        }`}
      />
      <span className="text-xs text-gray-500">
        {isConnected ? 'Real-time sync active' : 'Connecting to server...'}
      </span>
    </div>
  )
}