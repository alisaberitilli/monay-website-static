/**
 * Invoice-First Wallet API Integration
 * Client-side API service for wallet operations
 *
 * @module api/invoiceWalletAPI
 */

import axios, { AxiosInstance } from 'axios'

// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'
const API_TIMEOUT = 30000 // 30 seconds

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add auth token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      localStorage.removeItem('authToken')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Types
export interface InvoiceWallet {
  id: string
  invoiceId: string
  mode: 'ephemeral' | 'persistent' | 'adaptive'
  baseAddress: string
  solanaAddress: string
  status: 'active' | 'pending' | 'expired' | 'destroyed' | 'transforming'
  features: Record<string, any>
  expiresAt?: string
  ttl?: number
  remainingTTL?: number
}

export interface WalletGenerationOptions {
  mode?: 'ephemeral' | 'persistent' | 'adaptive'
  ttl?: number
  features?: string[]
}

export interface AIRecommendation {
  mode: 'ephemeral' | 'persistent' | 'adaptive'
  score: number
  reasoning: string
  confidence: number
  features: Record<string, any>
}

export interface WalletStatus {
  walletId: string
  mode: string
  status: string
  health: number
  balances: {
    base: number
    solana: number
  }
  expiresAt?: string
  remainingTTL?: number
  features: Record<string, any>
}

export interface WalletStats {
  total: number
  active: number
  destroyedToday: number
  byMode: Record<string, number>
}

// API Service Class
class InvoiceWalletAPI {
  /**
   * Generate a new Invoice-First wallet
   */
  async generateWallet(
    invoiceId: string,
    options: WalletGenerationOptions = {}
  ): Promise<InvoiceWallet> {
    try {
      const response = await apiClient.post('/invoice-wallets/generate', {
        invoiceId,
        ...options
      })
      return response.data.wallet
    } catch (error: any) {
      console.error('Failed to generate wallet:', error)
      throw new Error(error.response?.data?.message || 'Failed to generate wallet')
    }
  }

  /**
   * Get wallet details by ID
   */
  async getWallet(walletId: string): Promise<InvoiceWallet> {
    try {
      const response = await apiClient.get(`/invoice-wallets/${walletId}`)
      return response.data.wallet
    } catch (error: any) {
      console.error('Failed to fetch wallet:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch wallet')
    }
  }

  /**
   * Get wallet by invoice ID
   */
  async getWalletByInvoice(invoiceId: string): Promise<InvoiceWallet | null> {
    try {
      const response = await apiClient.get(`/invoice-wallets/invoice/${invoiceId}`)
      return response.data.wallet
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null // No wallet exists for this invoice
      }
      console.error('Failed to fetch wallet by invoice:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch wallet')
    }
  }

  /**
   * Transform ephemeral wallet to persistent
   */
  async transformWallet(walletId: string, reason?: string): Promise<InvoiceWallet> {
    try {
      const response = await apiClient.post(`/invoice-wallets/${walletId}/transform`, {
        reason
      })
      return response.data.wallet
    } catch (error: any) {
      console.error('Failed to transform wallet:', error)
      throw new Error(error.response?.data?.message || 'Failed to transform wallet')
    }
  }

  /**
   * Destroy ephemeral wallet
   */
  async destroyWallet(walletId: string): Promise<void> {
    try {
      await apiClient.delete(`/invoice-wallets/${walletId}/destroy`)
    } catch (error: any) {
      console.error('Failed to destroy wallet:', error)
      throw new Error(error.response?.data?.message || 'Failed to destroy wallet')
    }
  }

  /**
   * Get wallet status and health
   */
  async getWalletStatus(walletId: string): Promise<WalletStatus> {
    try {
      const response = await apiClient.get(`/invoice-wallets/${walletId}/status`)
      return response.data.status
    } catch (error: any) {
      console.error('Failed to get wallet status:', error)
      throw new Error(error.response?.data?.message || 'Failed to get wallet status')
    }
  }

  /**
   * Extend TTL for ephemeral wallet
   */
  async extendWalletTTL(walletId: string, additionalSeconds: number): Promise<void> {
    try {
      await apiClient.post(`/invoice-wallets/${walletId}/extend-ttl`, {
        additionalSeconds
      })
    } catch (error: any) {
      console.error('Failed to extend wallet TTL:', error)
      throw new Error(error.response?.data?.message || 'Failed to extend wallet TTL')
    }
  }

  /**
   * Get AI recommendation for wallet mode
   */
  async getAIRecommendation(params: {
    amount: number
    customerProfile?: any
    transactionType?: string
    isRecurring?: boolean
    riskScore?: number
  }): Promise<AIRecommendation> {
    try {
      const response = await apiClient.post('/invoice-wallets/ai-recommendation', params)
      return response.data.recommendation
    } catch (error: any) {
      console.error('Failed to get AI recommendation:', error)
      throw new Error(error.response?.data?.message || 'Failed to get AI recommendation')
    }
  }

  /**
   * Get wallet audit trail
   */
  async getWalletAudit(walletId: string): Promise<any> {
    try {
      const response = await apiClient.get(`/invoice-wallets/${walletId}/audit`)
      return response.data.audit
    } catch (error: any) {
      console.error('Failed to get wallet audit:', error)
      throw new Error(error.response?.data?.message || 'Failed to get wallet audit')
    }
  }

  /**
   * Get wallet statistics
   */
  async getWalletStats(): Promise<WalletStats> {
    try {
      const response = await apiClient.get('/invoice-wallets/stats/overview')
      return response.data.stats
    } catch (error: any) {
      console.error('Failed to get wallet stats:', error)
      throw new Error(error.response?.data?.message || 'Failed to get wallet stats')
    }
  }

  /**
   * Monitor wallet countdown (for ephemeral wallets)
   */
  startWalletCountdown(
    walletId: string,
    onTick: (remainingSeconds: number) => void,
    onExpire: () => void
  ): () => void {
    let intervalId: NodeJS.Timeout | null = null
    let expiresAt: Date | null = null

    // Fetch initial wallet data
    this.getWallet(walletId).then((wallet) => {
      if (wallet.expiresAt) {
        expiresAt = new Date(wallet.expiresAt)

        intervalId = setInterval(() => {
          if (!expiresAt) return

          const remaining = Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000))
          onTick(remaining)

          if (remaining === 0) {
            onExpire()
            if (intervalId) clearInterval(intervalId)
          }
        }, 1000)
      }
    })

    // Return cleanup function
    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }

  /**
   * Format wallet address for display
   */
  formatAddress(address: string, chain: 'base' | 'solana'): string {
    if (!address) return ''

    if (chain === 'base') {
      // EVM format: 0x1234...5678
      return `${address.slice(0, 6)}...${address.slice(-4)}`
    } else {
      // Solana format: 1234...5678
      return `${address.slice(0, 4)}...${address.slice(-4)}`
    }
  }

  /**
   * Get blockchain explorer URL
   */
  getExplorerUrl(address: string, chain: 'base' | 'solana'): string {
    if (chain === 'base') {
      return `https://basescan.org/address/${address}`
    } else {
      return `https://explorer.solana.com/address/${address}?cluster=devnet`
    }
  }

  /**
   * Calculate wallet health score
   */
  calculateHealthScore(wallet: InvoiceWallet): number {
    if (wallet.status === 'destroyed') return 0
    if (wallet.status === 'expired') return 25

    if (wallet.mode === 'ephemeral' && wallet.remainingTTL) {
      const totalTTL = wallet.ttl || 86400
      const percentage = (wallet.remainingTTL / totalTTL) * 100
      return Math.max(25, Math.min(100, percentage))
    }

    return 100 // Persistent wallets always healthy
  }

  /**
   * Format TTL for display
   */
  formatTTL(seconds: number): string {
    if (seconds < 60) return `${seconds}s`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`
    return `${Math.floor(seconds / 86400)}d`
  }
}

// Export singleton instance
export const invoiceWalletAPI = new InvoiceWalletAPI()

// Export types for use in components
export type { InvoiceWalletAPI }

// Export default for convenience
export default invoiceWalletAPI