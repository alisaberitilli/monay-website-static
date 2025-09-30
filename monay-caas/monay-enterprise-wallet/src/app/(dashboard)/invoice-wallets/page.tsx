'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import EphemeralWalletCard from '@/components/EphemeralWalletCard'
import InvoiceFirstMetrics from '@/components/InvoiceFirstMetrics'
import QuantumSecurityIndicator from '@/components/QuantumSecurityIndicator'
import {
  Clock, Shield, Zap, Search, Filter, RefreshCw,
  Plus, Wallet, FileText, Eye, Copy, ExternalLink
} from 'lucide-react'
import toast from 'react-hot-toast'
import invoiceWalletAPI from '@/lib/api/invoiceWalletAPI'
import { WebSocketStatus, WebSocketIndicator } from '@/components/WebSocketStatus'

export default function InvoiceWalletsPage() {
  const router = useRouter()
  const [wallets, setWallets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'ephemeral' | 'persistent' | 'adaptive'>('all')
  const [searchTerm, setSearchTerm] = useState('')

  // Load wallets from localStorage (temporary solution)
  useEffect(() => {
    loadWallets()
    // Refresh every 5 seconds to update countdowns
    const interval = setInterval(loadWallets, 5000)
    return () => clearInterval(interval)
  }, [])

  const loadWallets = async () => {
    try {
      // Try to load from API first
      try {
        const stats = await invoiceWalletAPI.getWalletStats()
        // Note: API would need a method to get all wallets
        // For now, we'll still use localStorage but this shows the pattern
        console.log('API Stats loaded:', stats)
      } catch (apiError: any) {
        console.warn('API unavailable, using localStorage:', apiError.message)
      }

      // Load from localStorage (kept for dev/testing)
      const storedWallets = localStorage.getItem('invoice_wallets')
      if (storedWallets) {
        const parsedWallets = JSON.parse(storedWallets)
        // Update status for expired ephemeral wallets
        const activeWallets = parsedWallets.map((wallet: any) => {
          if (wallet.mode === 'ephemeral' && wallet.expiresAt) {
            const expiresAt = new Date(wallet.expiresAt)
            const now = new Date()
            if (expiresAt < now) {
              wallet.status = 'expired'
            } else {
              // Calculate remaining TTL
              wallet.remainingTTL = Math.floor((expiresAt.getTime() - now.getTime()) / 1000)
            }
          }
          return wallet
        })
        setWallets(activeWallets)
      }
      setLoading(false)
    } catch (error) {
      console.error('Failed to load wallets:', error)
      setLoading(false)
    }
  }

  const handleTransformWallet = (walletId: string) => {
    const updatedWallets = wallets.map(w => {
      if (w.id === walletId) {
        return {
          ...w,
          mode: 'persistent',
          expiresAt: null,
          status: 'active'
        }
      }
      return w
    })
    setWallets(updatedWallets)
    localStorage.setItem('invoice_wallets', JSON.stringify(updatedWallets))
    toast.success('Wallet transformed to persistent mode')
  }

  const handleDestroyWallet = (walletId: string) => {
    const updatedWallets = wallets.map(w => {
      if (w.id === walletId) {
        return { ...w, status: 'destroyed' }
      }
      return w
    })
    setWallets(updatedWallets)
    localStorage.setItem('invoice_wallets', JSON.stringify(updatedWallets))
    toast.success('Wallet destroyed successfully')
  }

  const handleExtendTTL = (walletId: string) => {
    const updatedWallets = wallets.map(w => {
      if (w.id === walletId && w.expiresAt) {
        const newExpiry = new Date(w.expiresAt)
        newExpiry.setHours(newExpiry.getHours() + 24)
        return { ...w, expiresAt: newExpiry.toISOString() }
      }
      return w
    })
    setWallets(updatedWallets)
    localStorage.setItem('invoice_wallets', JSON.stringify(updatedWallets))
    toast.success('Wallet TTL extended by 24 hours')
  }

  const filteredWallets = wallets.filter(wallet => {
    if (filter !== 'all' && wallet.mode !== filter) return false
    if (searchTerm && !wallet.invoiceId?.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !wallet.id?.toLowerCase().includes(searchTerm.toLowerCase())) return false
    return true
  })

  const stats = {
    total: wallets.length,
    active: wallets.filter(w => w.status === 'active').length,
    ephemeral: wallets.filter(w => w.mode === 'ephemeral').length,
    persistent: wallets.filter(w => w.mode === 'persistent').length,
    adaptive: wallets.filter(w => w.mode === 'adaptive').length,
    destroyed: wallets.filter(w => w.status === 'destroyed').length
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* WebSocket Status */}
      <WebSocketStatus />

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Invoice-First Wallets
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage and monitor all invoice-generated wallets
          </p>
          <WebSocketIndicator className="mt-2" />
        </div>
        <Button onClick={loadWallets} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Metrics Dashboard */}
      <InvoiceFirstMetrics />

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-xs text-gray-500">Total Wallets</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            <p className="text-xs text-gray-500">Active</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-orange-600">{stats.ephemeral}</p>
            <p className="text-xs text-gray-500">Ephemeral</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.persistent}</p>
            <p className="text-xs text-gray-500">Persistent</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-purple-600">{stats.adaptive}</p>
            <p className="text-xs text-gray-500">Adaptive</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{stats.destroyed}</p>
            <p className="text-xs text-gray-500">Destroyed</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="glass-card">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by wallet ID or invoice..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={filter === 'all' ? 'gradient' : 'outline'}
                onClick={() => setFilter('all')}
                size="sm"
              >
                All
              </Button>
              <Button
                variant={filter === 'ephemeral' ? 'gradient' : 'outline'}
                onClick={() => setFilter('ephemeral')}
                size="sm"
              >
                <Clock className="h-4 w-4 mr-1" />
                Ephemeral
              </Button>
              <Button
                variant={filter === 'persistent' ? 'gradient' : 'outline'}
                onClick={() => setFilter('persistent')}
                size="sm"
              >
                <Shield className="h-4 w-4 mr-1" />
                Persistent
              </Button>
              <Button
                variant={filter === 'adaptive' ? 'gradient' : 'outline'}
                onClick={() => setFilter('adaptive')}
                size="sm"
              >
                <Zap className="h-4 w-4 mr-1" />
                Adaptive
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Indicator */}
      <QuantumSecurityIndicator
        quantumEnabled={true}
        securityScore={98}
        threatLevel="low"
        walletMode="ephemeral"
      />

      {/* Wallets Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading wallets...</p>
        </div>
      ) : filteredWallets.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="py-12 text-center">
            <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Wallets Found</h3>
            <p className="text-gray-500">
              {searchTerm ? 'No wallets match your search criteria' : 'No invoice wallets have been created yet'}
            </p>
            <Button
              variant="gradient"
              className="mt-4"
              onClick={() => router.push('/invoices')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Go to Invoices
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredWallets.map((wallet) => (
            <motion.div
              key={wallet.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <EphemeralWalletCard
                wallet={wallet}
                onTransform={() => handleTransformWallet(wallet.id)}
                onDestroy={() => handleDestroyWallet(wallet.id)}
                onExtend={() => handleExtendTTL(wallet.id)}
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}