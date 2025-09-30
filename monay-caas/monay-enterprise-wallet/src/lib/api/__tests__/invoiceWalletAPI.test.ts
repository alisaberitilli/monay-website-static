import axios from 'axios'
import { invoiceWalletAPI } from '../invoiceWalletAPI'

jest.mock('axios')

const mockedAxios = axios as jest.Mocked<typeof axios>
const mockApiClient = {
  post: jest.fn(),
  get: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  patch: jest.fn(),
}

// Mock axios.create to return our mock client
mockedAxios.create = jest.fn(() => mockApiClient as any)

describe('InvoiceWalletAPI', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  describe('generateWallet', () => {
    it('should generate a new wallet successfully', async () => {
      const mockWallet = {
        id: 'wallet_123',
        invoiceId: 'inv_123',
        mode: 'ephemeral',
        baseAddress: '0x123...',
        solanaAddress: 'abc...',
        status: 'active',
      }

      mockApiClient.post.mockResolvedValue({
        data: { wallet: mockWallet },
      })

      const result = await invoiceWalletAPI.generateWallet('inv_123', {
        mode: 'ephemeral',
        ttl: 3600,
        features: ['quantum', 'compliance'],
      })

      expect(mockApiClient.post).toHaveBeenCalledWith('/invoice-wallets/generate', {
        invoiceId: 'inv_123',
        mode: 'ephemeral',
        ttl: 3600,
        features: ['quantum', 'compliance'],
      })
      expect(result).toEqual(mockWallet)
    })

    it('should throw error when generation fails', async () => {
      mockApiClient.post.mockRejectedValue({
        response: {
          data: { message: 'Invalid invoice ID' },
        },
      })

      await expect(
        invoiceWalletAPI.generateWallet('invalid_id', {})
      ).rejects.toThrow('Invalid invoice ID')
    })

    it('should use default error message when none provided', async () => {
      mockApiClient.post.mockRejectedValue(new Error())

      await expect(
        invoiceWalletAPI.generateWallet('inv_123', {})
      ).rejects.toThrow('Failed to generate wallet')
    })
  })

  describe('getWallet', () => {
    it('should fetch wallet by ID', async () => {
      const mockWallet = {
        id: 'wallet_123',
        invoiceId: 'inv_123',
        status: 'active',
      }

      mockApiClient.get.mockResolvedValue({
        data: { wallet: mockWallet },
      })

      const result = await invoiceWalletAPI.getWallet('wallet_123')

      expect(mockApiClient.get).toHaveBeenCalledWith('/invoice-wallets/wallet_123')
      expect(result).toEqual(mockWallet)
    })

    it('should handle fetch errors', async () => {
      mockApiClient.get.mockRejectedValue({
        response: {
          data: { message: 'Wallet not found' },
        },
      })

      await expect(
        invoiceWalletAPI.getWallet('invalid_wallet')
      ).rejects.toThrow('Wallet not found')
    })
  })

  describe('getWalletByInvoice', () => {
    it('should fetch wallet by invoice ID', async () => {
      const mockWallet = {
        id: 'wallet_123',
        invoiceId: 'inv_123',
        status: 'active',
      }

      mockApiClient.get.mockResolvedValue({
        data: { wallet: mockWallet },
      })

      const result = await invoiceWalletAPI.getWalletByInvoice('inv_123')

      expect(mockApiClient.get).toHaveBeenCalledWith('/invoice-wallets/invoice/inv_123')
      expect(result).toEqual(mockWallet)
    })

    it('should return null when no wallet exists for invoice', async () => {
      mockApiClient.get.mockRejectedValue({
        response: { status: 404 },
      })

      const result = await invoiceWalletAPI.getWalletByInvoice('inv_no_wallet')

      expect(result).toBeNull()
    })

    it('should throw error for non-404 errors', async () => {
      mockApiClient.get.mockRejectedValue({
        response: {
          status: 500,
          data: { message: 'Server error' },
        },
      })

      await expect(
        invoiceWalletAPI.getWalletByInvoice('inv_123')
      ).rejects.toThrow('Server error')
    })
  })

  describe('transformWallet', () => {
    it('should transform ephemeral wallet to persistent', async () => {
      const mockTransformedWallet = {
        id: 'wallet_123',
        mode: 'persistent',
        status: 'active',
      }

      mockApiClient.post.mockResolvedValue({
        data: { wallet: mockTransformedWallet },
      })

      const result = await invoiceWalletAPI.transformWallet('wallet_123', 'User request')

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/invoice-wallets/wallet_123/transform',
        { reason: 'User request' }
      )
      expect(result).toEqual(mockTransformedWallet)
    })

    it('should handle transformation errors', async () => {
      mockApiClient.post.mockRejectedValue({
        response: {
          data: { message: 'Cannot transform persistent wallet' },
        },
      })

      await expect(
        invoiceWalletAPI.transformWallet('wallet_123')
      ).rejects.toThrow('Cannot transform persistent wallet')
    })
  })

  describe('destroyWallet', () => {
    it('should destroy wallet successfully', async () => {
      mockApiClient.delete.mockResolvedValue({ data: {} })

      await invoiceWalletAPI.destroyWallet('wallet_123')

      expect(mockApiClient.delete).toHaveBeenCalledWith('/invoice-wallets/wallet_123/destroy')
    })

    it('should handle destruction errors', async () => {
      mockApiClient.delete.mockRejectedValue({
        response: {
          data: { message: 'Cannot destroy active wallet' },
        },
      })

      await expect(
        invoiceWalletAPI.destroyWallet('wallet_123')
      ).rejects.toThrow('Cannot destroy active wallet')
    })
  })

  describe('getWalletStatus', () => {
    it('should fetch wallet status', async () => {
      const mockStatus = {
        walletId: 'wallet_123',
        mode: 'ephemeral',
        status: 'active',
        health: 85,
        balances: {
          base: 100,
          solana: 50,
        },
        expiresAt: '2025-02-01T00:00:00Z',
        remainingTTL: 3600,
        features: { quantum: true },
      }

      mockApiClient.get.mockResolvedValue({
        data: { status: mockStatus },
      })

      const result = await invoiceWalletAPI.getWalletStatus('wallet_123')

      expect(mockApiClient.get).toHaveBeenCalledWith('/invoice-wallets/wallet_123/status')
      expect(result).toEqual(mockStatus)
    })
  })

  describe('extendWalletTTL', () => {
    it('should extend wallet TTL', async () => {
      mockApiClient.post.mockResolvedValue({ data: {} })

      await invoiceWalletAPI.extendWalletTTL('wallet_123', 86400)

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/invoice-wallets/wallet_123/extend-ttl',
        { additionalSeconds: 86400 }
      )
    })

    it('should handle extension errors', async () => {
      mockApiClient.post.mockRejectedValue({
        response: {
          data: { message: 'Cannot extend persistent wallet' },
        },
      })

      await expect(
        invoiceWalletAPI.extendWalletTTL('wallet_123', 3600)
      ).rejects.toThrow('Cannot extend persistent wallet')
    })
  })

  describe('getAIRecommendation', () => {
    it('should get AI recommendation for wallet mode', async () => {
      const mockRecommendation = {
        mode: 'ephemeral',
        score: 0.95,
        reasoning: 'High-value B2B transaction detected',
        confidence: 0.92,
        features: {
          quantum: true,
          compliance: true,
          multiSig: false,
        },
      }

      mockApiClient.post.mockResolvedValue({
        data: { recommendation: mockRecommendation },
      })

      const result = await invoiceWalletAPI.getAIRecommendation({
        amount: 50000,
        transactionType: 'B2B',
        isRecurring: false,
        riskScore: 0.2,
      })

      expect(mockApiClient.post).toHaveBeenCalledWith('/invoice-wallets/ai-recommendation', {
        amount: 50000,
        transactionType: 'B2B',
        isRecurring: false,
        riskScore: 0.2,
      })
      expect(result).toEqual(mockRecommendation)
    })
  })

  describe('getWalletAudit', () => {
    it('should fetch wallet audit trail', async () => {
      const mockAudit = [
        {
          id: 'event_1',
          walletId: 'wallet_123',
          eventType: 'created',
          timestamp: '2025-01-26T10:00:00Z',
          userId: 'user_123',
        },
        {
          id: 'event_2',
          walletId: 'wallet_123',
          eventType: 'transformed',
          timestamp: '2025-01-26T11:00:00Z',
          userId: 'user_123',
        },
      ]

      mockApiClient.get.mockResolvedValue({
        data: { audit: mockAudit },
      })

      const result = await invoiceWalletAPI.getWalletAudit('wallet_123')

      expect(mockApiClient.get).toHaveBeenCalledWith('/invoice-wallets/wallet_123/audit')
      expect(result).toEqual(mockAudit)
    })
  })

  describe('getWalletStats', () => {
    it('should fetch wallet statistics', async () => {
      const mockStats = {
        total: 150,
        active: 45,
        destroyedToday: 12,
        byMode: {
          ephemeral: 80,
          persistent: 50,
          adaptive: 20,
        },
      }

      mockApiClient.get.mockResolvedValue({
        data: { stats: mockStats },
      })

      const result = await invoiceWalletAPI.getWalletStats()

      expect(mockApiClient.get).toHaveBeenCalledWith('/invoice-wallets/stats/overview')
      expect(result).toEqual(mockStats)
    })
  })

  describe('startWalletCountdown', () => {
    jest.useFakeTimers()

    it('should start countdown and update remaining seconds', async () => {
      const mockWallet = {
        id: 'wallet_123',
        expiresAt: new Date(Date.now() + 10000).toISOString(), // 10 seconds from now
      }

      mockApiClient.get.mockResolvedValue({
        data: { wallet: mockWallet },
      })

      const onTick = jest.fn()
      const onExpire = jest.fn()

      const cleanup = invoiceWalletAPI.startWalletCountdown(
        'wallet_123',
        onTick,
        onExpire
      )

      // Wait for initial fetch
      await Promise.resolve()

      // Advance time and check callbacks
      jest.advanceTimersByTime(1000)
      expect(onTick).toHaveBeenCalledWith(9)

      jest.advanceTimersByTime(9000)
      expect(onTick).toHaveBeenCalledWith(0)
      expect(onExpire).toHaveBeenCalled()

      cleanup()
      jest.useRealTimers()
    })

    it('should cleanup interval when cleanup function is called', async () => {
      const mockWallet = {
        id: 'wallet_123',
        expiresAt: new Date(Date.now() + 60000).toISOString(),
      }

      mockApiClient.get.mockResolvedValue({
        data: { wallet: mockWallet },
      })

      const onTick = jest.fn()
      const onExpire = jest.fn()

      const cleanup = invoiceWalletAPI.startWalletCountdown(
        'wallet_123',
        onTick,
        onExpire
      )

      await Promise.resolve()

      cleanup()

      // Advance time and verify callbacks are not called
      jest.advanceTimersByTime(5000)
      expect(onTick).not.toHaveBeenCalled()
      expect(onExpire).not.toHaveBeenCalled()

      jest.useRealTimers()
    })
  })

  describe('formatAddress', () => {
    it('should format EVM address correctly', () => {
      const address = '0x1234567890abcdef1234567890abcdef12345678'
      const formatted = invoiceWalletAPI.formatAddress(address, 'base')
      expect(formatted).toBe('0x1234...5678')
    })

    it('should format Solana address correctly', () => {
      const address = 'SoLaNa1234567890abcdef1234567890abcdef123456'
      const formatted = invoiceWalletAPI.formatAddress(address, 'solana')
      expect(formatted).toBe('SoLa...3456')
    })

    it('should handle empty address', () => {
      expect(invoiceWalletAPI.formatAddress('', 'base')).toBe('')
      expect(invoiceWalletAPI.formatAddress('', 'solana')).toBe('')
    })
  })

  describe('getExplorerUrl', () => {
    it('should return Base explorer URL', () => {
      const address = '0x1234567890abcdef1234567890abcdef12345678'
      const url = invoiceWalletAPI.getExplorerUrl(address, 'base')
      expect(url).toBe(`https://basescan.org/address/${address}`)
    })

    it('should return Solana explorer URL', () => {
      const address = 'SoLaNa1234567890abcdef1234567890abcdef123456'
      const url = invoiceWalletAPI.getExplorerUrl(address, 'solana')
      expect(url).toBe(`https://explorer.solana.com/address/${address}?cluster=devnet`)
    })
  })

  describe('calculateHealthScore', () => {
    it('should return 0 for destroyed wallet', () => {
      const wallet = { status: 'destroyed' } as any
      expect(invoiceWalletAPI.calculateHealthScore(wallet)).toBe(0)
    })

    it('should return 25 for expired wallet', () => {
      const wallet = { status: 'expired' } as any
      expect(invoiceWalletAPI.calculateHealthScore(wallet)).toBe(25)
    })

    it('should calculate health based on remaining TTL for ephemeral', () => {
      const wallet = {
        status: 'active',
        mode: 'ephemeral',
        ttl: 86400,
        remainingTTL: 43200, // 50% remaining
      } as any
      expect(invoiceWalletAPI.calculateHealthScore(wallet)).toBe(50)
    })

    it('should return 100 for persistent wallet', () => {
      const wallet = {
        status: 'active',
        mode: 'persistent',
      } as any
      expect(invoiceWalletAPI.calculateHealthScore(wallet)).toBe(100)
    })

    it('should cap health score at 100', () => {
      const wallet = {
        status: 'active',
        mode: 'ephemeral',
        ttl: 86400,
        remainingTTL: 100000, // More than total TTL
      } as any
      expect(invoiceWalletAPI.calculateHealthScore(wallet)).toBe(100)
    })

    it('should not go below 25 for active ephemeral wallet', () => {
      const wallet = {
        status: 'active',
        mode: 'ephemeral',
        ttl: 86400,
        remainingTTL: 1, // Almost expired
      } as any
      expect(invoiceWalletAPI.calculateHealthScore(wallet)).toBe(25)
    })
  })

  describe('formatTTL', () => {
    it('should format seconds', () => {
      expect(invoiceWalletAPI.formatTTL(45)).toBe('45s')
    })

    it('should format minutes', () => {
      expect(invoiceWalletAPI.formatTTL(150)).toBe('2m')
      expect(invoiceWalletAPI.formatTTL(3599)).toBe('59m')
    })

    it('should format hours', () => {
      expect(invoiceWalletAPI.formatTTL(3600)).toBe('1h')
      expect(invoiceWalletAPI.formatTTL(7200)).toBe('2h')
      expect(invoiceWalletAPI.formatTTL(86399)).toBe('23h')
    })

    it('should format days', () => {
      expect(invoiceWalletAPI.formatTTL(86400)).toBe('1d')
      expect(invoiceWalletAPI.formatTTL(172800)).toBe('2d')
      expect(invoiceWalletAPI.formatTTL(31536000)).toBe('365d')
    })
  })
})