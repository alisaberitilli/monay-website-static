import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import EphemeralWalletCard from '../EphemeralWalletCard'
import { invoiceWalletAPI } from '@/lib/api/invoiceWalletAPI'
import toast from 'react-hot-toast'

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    success: jest.fn(),
    error: jest.fn(),
  },
  success: jest.fn(),
  error: jest.fn(),
}))

// Mock the API
jest.mock('@/lib/api/invoiceWalletAPI', () => ({
  __esModule: true,
  invoiceWalletAPI: {
    transformWallet: jest.fn(),
    destroyWallet: jest.fn(),
    extendWalletTTL: jest.fn(),
  },
  default: {
    transformWallet: jest.fn(),
    destroyWallet: jest.fn(),
    extendWalletTTL: jest.fn(),
  }
}))

// Mock the WebSocket hook
jest.mock('@/hooks/useInvoiceWalletSocket', () => ({
  useInvoiceWalletSocket: () => ({
    getWalletCountdown: jest.fn().mockReturnValue({ remaining: 3600 }),
    joinWalletRoom: jest.fn(),
    leaveWalletRoom: jest.fn(),
    startCountdown: jest.fn(),
    isConnected: true,
  })
}))

describe('EphemeralWalletCard', () => {
  const mockEphemeralWallet = {
    id: 'wallet_123',
    invoiceId: 'inv_123',
    mode: 'ephemeral',
    baseAddress: '0x1234567890abcdef1234567890abcdef12345678',
    solanaAddress: 'SoLaNa1234567890abcdef1234567890abcdef123456',
    status: 'active',
    ttl: 86400, // 24 hours
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
    remainingTTL: 86400,
    features: {
      quantumEnabled: true,
      complianceProofs: true,
    }
  }

  const mockPersistentWallet = {
    ...mockEphemeralWallet,
    mode: 'persistent',
    ttl: null,
    expiresAt: null,
    remainingTTL: null,
  }

  const mockOnTransform = jest.fn()
  const mockOnDestroy = jest.fn()
  const mockOnExtend = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('Rendering', () => {
    it('should render ephemeral wallet with countdown', () => {
      render(
        <EphemeralWalletCard
          wallet={mockEphemeralWallet}
          onTransform={mockOnTransform}
          onDestroy={mockOnDestroy}
          onExtend={mockOnExtend}
        />
      )

      expect(screen.getByText(/Ephemeral Wallet/)).toBeInTheDocument()
      expect(screen.getByText(/Self-destructs in/)).toBeInTheDocument()
      expect(screen.getByText(/24h 0m 0s/)).toBeInTheDocument()
    })

    it('should render persistent wallet without countdown', () => {
      render(
        <EphemeralWalletCard
          wallet={mockPersistentWallet}
          onTransform={mockOnTransform}
          onDestroy={mockOnDestroy}
          onExtend={mockOnExtend}
        />
      )

      expect(screen.getByText(/Persistent Wallet/)).toBeInTheDocument()
      expect(screen.queryByText(/Self-destructs in/)).not.toBeInTheDocument()
    })

    it('should display wallet addresses', () => {
      render(
        <EphemeralWalletCard
          wallet={mockEphemeralWallet}
          onTransform={mockOnTransform}
          onDestroy={mockOnDestroy}
          onExtend={mockOnExtend}
        />
      )

      expect(screen.getByText(/0x1234...5678/)).toBeInTheDocument()
      expect(screen.getByText(/SoLa...3456/)).toBeInTheDocument()
    })

    it('should show quantum security badge when enabled', () => {
      render(
        <EphemeralWalletCard
          wallet={mockEphemeralWallet}
          onTransform={mockOnTransform}
          onDestroy={mockOnDestroy}
          onExtend={mockOnExtend}
        />
      )

      expect(screen.getByText(/Quantum Secure/)).toBeInTheDocument()
    })
  })

  describe('Countdown Timer', () => {
    it('should update countdown every second', () => {
      const wallet = {
        ...mockEphemeralWallet,
        expiresAt: new Date(Date.now() + 3661000).toISOString(), // 1 hour 1 minute 1 second
      }

      render(
        <EphemeralWalletCard
          wallet={wallet}
          onTransform={mockOnTransform}
          onDestroy={mockOnDestroy}
          onExtend={mockOnExtend}
        />
      )

      expect(screen.getByText(/1h 1m 1s/)).toBeInTheDocument()

      act(() => {
        jest.advanceTimersByTime(1000)
      })

      expect(screen.getByText(/1h 1m 0s/)).toBeInTheDocument()
    })

    it('should show expired state when countdown reaches zero', () => {
      const wallet = {
        ...mockEphemeralWallet,
        expiresAt: new Date(Date.now() - 1000).toISOString(), // Already expired
      }

      render(
        <EphemeralWalletCard
          wallet={wallet}
          onTransform={mockOnTransform}
          onDestroy={mockOnDestroy}
          onExtend={mockOnExtend}
        />
      )

      expect(screen.getByText(/Expired/)).toBeInTheDocument()
    })

    it('should change color based on time remaining', () => {
      // Less than 1 hour - should be orange
      const wallet = {
        ...mockEphemeralWallet,
        expiresAt: new Date(Date.now() + 1800000).toISOString(), // 30 minutes
      }

      const { rerender } = render(
        <EphemeralWalletCard
          wallet={wallet}
          onTransform={mockOnTransform}
          onDestroy={mockOnDestroy}
          onExtend={mockOnExtend}
        />
      )

      const timeDisplay = screen.getByText(/30m 0s/)
      expect(timeDisplay).toHaveClass('text-orange-600')

      // Less than 1 day but more than 1 hour - should be yellow
      wallet.expiresAt = new Date(Date.now() + 7200000).toISOString() // 2 hours
      rerender(
        <EphemeralWalletCard
          wallet={wallet}
          onTransform={mockOnTransform}
          onDestroy={mockOnDestroy}
          onExtend={mockOnExtend}
        />
      )

      expect(screen.getByText(/2h 0m 0s/)).toHaveClass('text-yellow-600')
    })
  })

  describe('Actions', () => {
    it('should handle wallet transformation', async () => {
      ;(invoiceWalletAPI.transformWallet as jest.Mock).mockResolvedValue({
        ...mockEphemeralWallet,
        mode: 'persistent',
      })

      render(
        <EphemeralWalletCard
          wallet={mockEphemeralWallet}
          onTransform={mockOnTransform}
          onDestroy={mockOnDestroy}
          onExtend={mockOnExtend}
        />
      )

      const transformButton = screen.getByRole('button', { name: /Transform to Persistent/i })
      fireEvent.click(transformButton)

      await waitFor(() => {
        expect(invoiceWalletAPI.transformWallet).toHaveBeenCalledWith(
          'wallet_123',
          'User requested transformation'
        )
        expect(toast.success).toHaveBeenCalledWith('Wallet transformed to persistent mode!')
        expect(mockOnTransform).toHaveBeenCalled()
      })
    })

    it('should handle wallet destruction with confirmation', async () => {
      ;(invoiceWalletAPI.destroyWallet as jest.Mock).mockResolvedValue(undefined)

      // Mock window.confirm
      const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true)

      render(
        <EphemeralWalletCard
          wallet={mockEphemeralWallet}
          onTransform={mockOnTransform}
          onDestroy={mockOnDestroy}
          onExtend={mockOnExtend}
        />
      )

      const destroyButton = screen.getByRole('button', { name: /Destroy Wallet/i })
      fireEvent.click(destroyButton)

      expect(confirmSpy).toHaveBeenCalledWith(
        'Are you sure you want to destroy this wallet? This action cannot be undone.'
      )

      await waitFor(() => {
        expect(invoiceWalletAPI.destroyWallet).toHaveBeenCalledWith('wallet_123')
        expect(toast.success).toHaveBeenCalledWith('Wallet destroyed successfully')
        expect(mockOnDestroy).toHaveBeenCalled()
      })

      confirmSpy.mockRestore()
    })

    it('should not destroy wallet if user cancels confirmation', async () => {
      const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(false)

      render(
        <EphemeralWalletCard
          wallet={mockEphemeralWallet}
          onTransform={mockOnTransform}
          onDestroy={mockOnDestroy}
          onExtend={mockOnExtend}
        />
      )

      const destroyButton = screen.getByRole('button', { name: /Destroy Wallet/i })
      fireEvent.click(destroyButton)

      expect(invoiceWalletAPI.destroyWallet).not.toHaveBeenCalled()
      expect(mockOnDestroy).not.toHaveBeenCalled()

      confirmSpy.mockRestore()
    })

    it('should handle TTL extension', async () => {
      ;(invoiceWalletAPI.extendWalletTTL as jest.Mock).mockResolvedValue(undefined)

      render(
        <EphemeralWalletCard
          wallet={mockEphemeralWallet}
          onTransform={mockOnTransform}
          onDestroy={mockOnDestroy}
          onExtend={mockOnExtend}
        />
      )

      const extendButton = screen.getByRole('button', { name: /Extend TTL/i })
      fireEvent.click(extendButton)

      await waitFor(() => {
        expect(invoiceWalletAPI.extendWalletTTL).toHaveBeenCalledWith('wallet_123', 86400)
        expect(toast.success).toHaveBeenCalledWith('Wallet TTL extended by 24 hours')
        expect(mockOnExtend).toHaveBeenCalled()
      })
    })
  })

  describe('Copy Functionality', () => {
    it('should copy Base address to clipboard', () => {
      const writeTextMock = jest.fn()
      Object.assign(navigator, {
        clipboard: {
          writeText: writeTextMock,
        },
      })

      render(
        <EphemeralWalletCard
          wallet={mockEphemeralWallet}
          onTransform={mockOnTransform}
          onDestroy={mockOnDestroy}
          onExtend={mockOnExtend}
        />
      )

      const baseCopyButton = screen.getAllByRole('button', { name: /Copy/i })[0]
      fireEvent.click(baseCopyButton)

      expect(writeTextMock).toHaveBeenCalledWith(mockEphemeralWallet.baseAddress)
      expect(toast.success).toHaveBeenCalledWith('Base address copied to clipboard')
    })

    it('should copy Solana address to clipboard', () => {
      const writeTextMock = jest.fn()
      Object.assign(navigator, {
        clipboard: {
          writeText: writeTextMock,
        },
      })

      render(
        <EphemeralWalletCard
          wallet={mockEphemeralWallet}
          onTransform={mockOnTransform}
          onDestroy={mockOnDestroy}
          onExtend={mockOnExtend}
        />
      )

      const solanaCopyButton = screen.getAllByRole('button', { name: /Copy/i })[1]
      fireEvent.click(solanaCopyButton)

      expect(writeTextMock).toHaveBeenCalledWith(mockEphemeralWallet.solanaAddress)
      expect(toast.success).toHaveBeenCalledWith('Solana address copied to clipboard')
    })
  })

  describe('Health Indicator', () => {
    it('should show health percentage based on remaining TTL', () => {
      render(
        <EphemeralWalletCard
          wallet={mockEphemeralWallet}
          onTransform={mockOnTransform}
          onDestroy={mockOnDestroy}
          onExtend={mockOnExtend}
        />
      )

      const healthBar = screen.getByRole('progressbar')
      expect(healthBar).toHaveAttribute('aria-valuenow', '100')
    })

    it('should show low health for expiring wallets', () => {
      const wallet = {
        ...mockEphemeralWallet,
        ttl: 86400,
        remainingTTL: 1800, // 30 minutes left out of 24 hours
        expiresAt: new Date(Date.now() + 1800000).toISOString(),
      }

      render(
        <EphemeralWalletCard
          wallet={wallet}
          onTransform={mockOnTransform}
          onDestroy={mockOnDestroy}
          onExtend={mockOnExtend}
        />
      )

      const healthBar = screen.getByRole('progressbar')
      const healthValue = Math.floor((1800 / 86400) * 100)
      expect(healthBar).toHaveAttribute('aria-valuenow', healthValue.toString())
    })

    it('should show zero health for destroyed wallets', () => {
      const wallet = {
        ...mockEphemeralWallet,
        status: 'destroyed',
      }

      render(
        <EphemeralWalletCard
          wallet={wallet}
          onTransform={mockOnTransform}
          onDestroy={mockOnDestroy}
          onExtend={mockOnExtend}
        />
      )

      const healthBar = screen.getByRole('progressbar')
      expect(healthBar).toHaveAttribute('aria-valuenow', '0')
    })
  })

  describe('Error Handling', () => {
    it('should show error toast when transformation fails', async () => {
      ;(invoiceWalletAPI.transformWallet as jest.Mock).mockRejectedValue(
        new Error('Network error')
      )

      render(
        <EphemeralWalletCard
          wallet={mockEphemeralWallet}
          onTransform={mockOnTransform}
          onDestroy={mockOnDestroy}
          onExtend={mockOnExtend}
        />
      )

      const transformButton = screen.getByRole('button', { name: /Transform to Persistent/i })
      fireEvent.click(transformButton)

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Network error')
        expect(mockOnTransform).not.toHaveBeenCalled()
      })
    })

    it('should show error toast when destruction fails', async () => {
      ;(invoiceWalletAPI.destroyWallet as jest.Mock).mockRejectedValue(
        new Error('Permission denied')
      )

      const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true)

      render(
        <EphemeralWalletCard
          wallet={mockEphemeralWallet}
          onTransform={mockOnTransform}
          onDestroy={mockOnDestroy}
          onExtend={mockOnExtend}
        />
      )

      const destroyButton = screen.getByRole('button', { name: /Destroy Wallet/i })
      fireEvent.click(destroyButton)

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Permission denied')
        expect(mockOnDestroy).not.toHaveBeenCalled()
      })

      confirmSpy.mockRestore()
    })
  })

  describe('localStorage Fallback', () => {
    it('should update localStorage when API fails during transformation', async () => {
      ;(invoiceWalletAPI.transformWallet as jest.Mock).mockRejectedValue(
        new Error('API Error')
      )

      // Setup localStorage with wallet
      const wallets = [mockEphemeralWallet]
      localStorage.setItem('invoice_wallets', JSON.stringify(wallets))

      render(
        <EphemeralWalletCard
          wallet={mockEphemeralWallet}
          onTransform={mockOnTransform}
          onDestroy={mockOnDestroy}
          onExtend={mockOnExtend}
        />
      )

      const transformButton = screen.getByRole('button', { name: /Transform to Persistent/i })
      fireEvent.click(transformButton)

      await waitFor(() => {
        const updatedWallets = JSON.parse(localStorage.getItem('invoice_wallets') || '[]')
        expect(updatedWallets[0].mode).toBe('persistent')
        expect(updatedWallets[0].expiresAt).toBeNull()
        expect(toast.success).toHaveBeenCalledWith('Wallet transformed to persistent mode! (Dev Mode)')
        expect(mockOnTransform).toHaveBeenCalled()
      })
    })
  })
})