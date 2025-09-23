'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Clock, Shield, Zap, Copy, ExternalLink, AlertTriangle,
  RefreshCw, Trash2, ArrowRight, CheckCircle, Cpu, Lock
} from 'lucide-react'
import toast from 'react-hot-toast'
import invoiceWalletAPI from '@/lib/api/invoiceWalletAPI'
import { useInvoiceWalletSocket } from '@/hooks/useInvoiceWalletSocket'

interface EphemeralWalletCardProps {
  wallet: any
  onTransform?: () => void
  onDestroy?: () => void
  onExtend?: () => void
}

export default function EphemeralWalletCard({
  wallet,
  onTransform,
  onDestroy,
  onExtend
}: EphemeralWalletCardProps) {
  const [remainingTime, setRemainingTime] = useState<number>(0)
  const [isTransforming, setIsTransforming] = useState(false)
  const [isDestroying, setIsDestroying] = useState(false)

  const {
    getWalletCountdown,
    joinWalletRoom,
    leaveWalletRoom,
    startCountdown,
    isConnected
  } = useInvoiceWalletSocket()

  useEffect(() => {
    if (!wallet || wallet.status === 'destroyed' || !wallet.expiresAt) return

    // Use WebSocket for real-time countdown if connected
    if (isConnected && wallet.mode === 'ephemeral') {
      // Join the wallet room for real-time updates
      joinWalletRoom(wallet.id)

      // Start countdown on server
      startCountdown(wallet.id, wallet.expiresAt)

      // Cleanup: leave room on unmount
      return () => {
        leaveWalletRoom(wallet.id)
      }
    } else {
      // Fallback to local countdown if WebSocket not connected
      const calculateRemaining = () => {
        const expires = new Date(wallet.expiresAt)
        const remaining = Math.max(0, Math.floor((expires.getTime() - Date.now()) / 1000))
        setRemainingTime(remaining)
        return remaining
      }

      // Initial calculation
      calculateRemaining()

      // Update every second
      const interval = setInterval(() => {
        const remaining = calculateRemaining()
        if (remaining === 0) {
          clearInterval(interval)
          if (wallet.mode === 'ephemeral') {
            toast.error('Wallet has expired and will be destroyed')
          }
        }
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [wallet, isConnected, joinWalletRoom, leaveWalletRoom, startCountdown])

  // Update remaining time from WebSocket countdown
  useEffect(() => {
    if (isConnected && wallet) {
      const countdown = getWalletCountdown(wallet.id)
      if (countdown) {
        setRemainingTime(countdown.remaining)
      }
    }
  }, [getWalletCountdown, wallet, isConnected])

  const formatTimeRemaining = (seconds: number): string => {
    if (seconds === 0) return 'Expired'

    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (days > 0) return `${days}d ${hours}h ${minutes}m`
    if (hours > 0) return `${hours}h ${minutes}m ${secs}s`
    if (minutes > 0) return `${minutes}m ${secs}s`
    return `${secs}s`
  }

  const getTimeColor = () => {
    if (!wallet || wallet.status === 'destroyed') return 'text-gray-500'
    if (remainingTime === 0) return 'text-red-600'
    if (remainingTime < 3600) return 'text-orange-600' // Less than 1 hour
    if (remainingTime < 86400) return 'text-yellow-600' // Less than 1 day
    return 'text-green-600'
  }

  const getHealthPercentage = () => {
    if (!wallet.ttl) return 0
    return Math.max(0, Math.min(100, (remainingTime / wallet.ttl) * 100))
  }

  const copyAddress = (address: string, chain: string) => {
    navigator.clipboard.writeText(address)
    toast.success(`${chain} address copied to clipboard`)
  }

  const handleTransform = async () => {
    if (!wallet || !onTransform) return

    setIsTransforming(true)
    try {
      // Try API first
      try {
        await invoiceWalletAPI.transformWallet(wallet.id, 'User requested transformation')
        toast.success('Wallet transformed to persistent mode!')
      } catch (apiError: any) {
        // Fallback to localStorage for dev/testing
        console.warn('API unavailable, using localStorage:', apiError.message)
        const wallets = JSON.parse(localStorage.getItem('invoice_wallets') || '[]')
        const walletIndex = wallets.findIndex((w: any) => w.id === wallet.id)
        if (walletIndex !== -1) {
          wallets[walletIndex] = {
            ...wallets[walletIndex],
            mode: 'persistent',
            status: 'active',
            expiresAt: null,
            ttl: null,
            remainingTTL: null
          }
          localStorage.setItem('invoice_wallets', JSON.stringify(wallets))
          toast.success('Wallet transformed to persistent mode! (Dev Mode)')
        }
      }
      onTransform()
    } catch (error: any) {
      toast.error(error.message || 'Failed to transform wallet')
    } finally {
      setIsTransforming(false)
    }
  }

  const handleDestroy = async () => {
    if (!wallet || !onDestroy) return

    if (!confirm('Are you sure you want to destroy this wallet? This action cannot be undone.')) {
      return
    }

    setIsDestroying(true)
    try {
      // Try API first
      try {
        await invoiceWalletAPI.destroyWallet(wallet.id)
        toast.success('Wallet destroyed successfully')
      } catch (apiError: any) {
        // Fallback to localStorage for dev/testing
        console.warn('API unavailable, using localStorage:', apiError.message)
        const wallets = JSON.parse(localStorage.getItem('invoice_wallets') || '[]')
        const walletIndex = wallets.findIndex((w: any) => w.id === wallet.id)
        if (walletIndex !== -1) {
          wallets[walletIndex] = {
            ...wallets[walletIndex],
            status: 'destroyed',
            destroyedAt: new Date().toISOString()
          }
          localStorage.setItem('invoice_wallets', JSON.stringify(wallets))
          toast.success('Wallet destroyed successfully! (Dev Mode)')
        }
      }
      onDestroy()
    } catch (error: any) {
      toast.error(error.message || 'Failed to destroy wallet')
    } finally {
      setIsDestroying(false)
    }
  }

  const handleExtend = async () => {
    if (!wallet || !onExtend) return

    try {
      await invoiceWalletAPI.extendWalletTTL(wallet.id, 86400) // Extend by 24 hours
      toast.success('Wallet lifetime extended by 24 hours')
      onExtend()
    } catch (error: any) {
      toast.error(error.message || 'Failed to extend wallet')
    }
  }

  const getModeIcon = () => {
    switch (wallet?.mode) {
      case 'ephemeral':
        return <Clock className="h-5 w-5" />
      case 'persistent':
        return <Shield className="h-5 w-5" />
      case 'adaptive':
        return <Zap className="h-5 w-5" />
      default:
        return null
    }
  }

  const getModeColor = () => {
    switch (wallet?.mode) {
      case 'ephemeral':
        return 'from-orange-500 to-red-600'
      case 'persistent':
        return 'from-green-500 to-emerald-600'
      case 'adaptive':
        return 'from-blue-500 to-indigo-600'
      default:
        return 'from-gray-500 to-gray-600'
    }
  }

  if (!wallet) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card className="glass-card overflow-hidden">
        {/* Header with gradient */}
        <div className={`h-2 bg-gradient-to-r ${getModeColor()}`} />

        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                {getModeIcon()}
                {wallet.mode.charAt(0).toUpperCase() + wallet.mode.slice(1)} Wallet
              </CardTitle>
              <CardDescription className="mt-1">
                Invoice #{wallet.invoiceId}
              </CardDescription>
            </div>

            {wallet.status === 'active' && wallet.mode === 'ephemeral' && (
              <div className="text-right">
                <p className="text-sm text-gray-500">Time Remaining</p>
                <p className={`text-2xl font-bold ${getTimeColor()}`}>
                  {formatTimeRemaining(remainingTime)}
                </p>
              </div>
            )}

            {wallet.status === 'destroyed' && (
              <div className="px-3 py-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-full text-sm font-medium">
                Destroyed
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Health Bar for Ephemeral Wallets */}
          {wallet.mode === 'ephemeral' && wallet.status === 'active' && (
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Wallet Health</span>
                <span className="font-medium">{Math.round(getHealthPercentage())}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <motion.div
                  className={`h-full bg-gradient-to-r ${
                    getHealthPercentage() > 50 ? 'from-green-500 to-emerald-600' :
                    getHealthPercentage() > 20 ? 'from-yellow-500 to-orange-600' :
                    'from-red-500 to-red-600'
                  }`}
                  initial={{ width: '100%' }}
                  animate={{ width: `${getHealthPercentage()}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          )}

          {/* Addresses */}
          <div className="space-y-3">
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-500">Base (EVM) Address</span>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => copyAddress(wallet.baseAddress, 'Base')}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => window.open(invoiceWalletAPI.getExplorerUrl(wallet.baseAddress, 'base'), '_blank')}
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <p className="font-mono text-sm break-all">
                {invoiceWalletAPI.formatAddress(wallet.baseAddress, 'base')}
              </p>
            </div>

            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-500">Solana Address</span>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => copyAddress(wallet.solanaAddress, 'Solana')}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => window.open(invoiceWalletAPI.getExplorerUrl(wallet.solanaAddress, 'solana'), '_blank')}
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <p className="font-mono text-sm break-all">
                {invoiceWalletAPI.formatAddress(wallet.solanaAddress, 'solana')}
              </p>
            </div>
          </div>

          {/* Features */}
          <div>
            <p className="text-sm font-medium mb-2">Features</p>
            <div className="flex flex-wrap gap-2">
              {wallet.features?.selfDestruct && (
                <span className="px-2 py-1 bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 rounded-full text-xs flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Self-Destruct
                </span>
              )}
              {wallet.features?.transformable && (
                <span className="px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full text-xs flex items-center gap-1">
                  <RefreshCw className="h-3 w-3" />
                  Transformable
                </span>
              )}
              {wallet.quantumEnabled && (
                <span className="px-2 py-1 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 rounded-full text-xs flex items-center gap-1">
                  <Cpu className="h-3 w-3" />
                  Quantum-Secure
                </span>
              )}
              {wallet.features?.consumerFeatures && (
                <span className="px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Consumer Mode
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          {wallet.status === 'active' && (
            <div className="flex gap-2 pt-2">
              {wallet.mode === 'ephemeral' && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExtend}
                    className="flex-1"
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Extend
                  </Button>
                  {wallet.features?.transformable && (
                    <Button
                      variant="gradient"
                      size="sm"
                      onClick={handleTransform}
                      disabled={isTransforming}
                      className="flex-1"
                    >
                      {isTransforming ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      ) : (
                        <ArrowRight className="h-4 w-4 mr-2" />
                      )}
                      Transform
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDestroy}
                    disabled={isDestroying}
                    className="text-red-600 hover:bg-red-50"
                  >
                    {isDestroying ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </>
              )}
            </div>
          )}

          {/* Warning for low time */}
          {wallet.mode === 'ephemeral' && remainingTime > 0 && remainingTime < 3600 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800"
            >
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-orange-900 dark:text-orange-100">
                    Wallet Expiring Soon
                  </p>
                  <p className="text-orange-700 dark:text-orange-300 mt-1">
                    This wallet will self-destruct in {formatTimeRemaining(remainingTime)}.
                    {wallet.features?.transformable && ' Transform to persistent mode to keep it active.'}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}