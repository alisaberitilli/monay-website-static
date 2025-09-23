import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import InvoiceWalletWizard from '../InvoiceWalletWizard'
import { invoiceWalletAPI } from '@/lib/api/invoiceWalletAPI'
import toast from 'react-hot-toast'

// Mock the API module
jest.mock('@/lib/api/invoiceWalletAPI', () => ({
  invoiceWalletAPI: {
    getWalletByInvoice: jest.fn(),
    generateWallet: jest.fn(),
  }
}))

describe('InvoiceWalletWizard', () => {
  const mockInvoice = {
    id: 'inv_123',
    amount: 5000,
    isRecurring: false,
    customerName: 'Test Customer',
    dueDate: '2025-02-01',
  }

  const mockOnComplete = jest.fn()
  const mockOnCancel = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  describe('Rendering', () => {
    it('should render the wizard with initial step', () => {
      render(
        <InvoiceWalletWizard
          invoice={mockInvoice}
          onComplete={mockOnComplete}
          onCancel={mockOnCancel}
        />
      )

      expect(screen.getByText('Select Wallet Mode')).toBeInTheDocument()
      expect(screen.getByText('Mode Selection')).toBeInTheDocument()
      expect(screen.getByText('Configuration')).toBeInTheDocument()
      expect(screen.getByText('Review & Generate')).toBeInTheDocument()
    })

    it('should display AI recommendation based on invoice amount', () => {
      render(
        <InvoiceWalletWizard
          invoice={{ ...mockInvoice, amount: 15000 }}
          onComplete={mockOnComplete}
          onCancel={mockOnCancel}
        />
      )

      expect(screen.getByText(/Based on invoice amount/)).toBeInTheDocument()
      expect(screen.getByText(/\$15,000/)).toBeInTheDocument()
    })

    it('should show all three wallet modes', () => {
      render(
        <InvoiceWalletWizard
          invoice={mockInvoice}
          onComplete={mockOnComplete}
          onCancel={mockOnCancel}
        />
      )

      expect(screen.getByText('Ephemeral')).toBeInTheDocument()
      expect(screen.getByText('Persistent')).toBeInTheDocument()
      // Use getAllByText since there might be multiple elements with "Adaptive"
      const adaptiveElements = screen.getAllByText('Adaptive')
      expect(adaptiveElements.length).toBeGreaterThan(0)
    })
  })

  describe('Mode Selection', () => {
    it('should allow selecting ephemeral mode', () => {
      render(
        <InvoiceWalletWizard
          invoice={mockInvoice}
          onComplete={mockOnComplete}
          onCancel={mockOnCancel}
        />
      )

      const ephemeralButton = screen.getByText('Ephemeral').closest('button')
      fireEvent.click(ephemeralButton!)

      // Should show selected state (implementation specific)
      expect(ephemeralButton).toHaveClass('ring-2')
    })

    it('should recommend ephemeral mode for high-value transactions', () => {
      render(
        <InvoiceWalletWizard
          invoice={{ ...mockInvoice, amount: 50000 }}
          onComplete={mockOnComplete}
          onCancel={mockOnCancel}
        />
      )

      const ephemeralMode = screen.getByText('Ephemeral').closest('div')
      expect(ephemeralMode?.querySelector('.recommended-badge')).toBeInTheDocument()
    })

    it('should recommend persistent mode for recurring payments', () => {
      render(
        <InvoiceWalletWizard
          invoice={{ ...mockInvoice, isRecurring: true }}
          onComplete={mockOnComplete}
          onCancel={mockOnCancel}
        />
      )

      const persistentMode = screen.getByText('Persistent').closest('div')
      expect(persistentMode?.querySelector('.recommended-badge')).toBeInTheDocument()
    })
  })

  describe('Navigation', () => {
    it('should navigate between steps', async () => {
      render(
        <InvoiceWalletWizard
          invoice={mockInvoice}
          onComplete={mockOnComplete}
          onCancel={mockOnCancel}
        />
      )

      // Select mode and go to next step
      const adaptiveButton = screen.getByText('Adaptive').closest('button')
      fireEvent.click(adaptiveButton!)

      const nextButton = screen.getByText('Next: Configuration')
      fireEvent.click(nextButton)

      await waitFor(() => {
        expect(screen.getByText('Configure Wallet Settings')).toBeInTheDocument()
      })
    })

    it('should allow going back to previous step', async () => {
      render(
        <InvoiceWalletWizard
          invoice={mockInvoice}
          onComplete={mockOnComplete}
          onCancel={mockOnCancel}
        />
      )

      // Go to step 2
      const adaptiveButton = screen.getByText('Adaptive').closest('button')
      fireEvent.click(adaptiveButton!)
      fireEvent.click(screen.getByText('Next: Configuration'))

      // Go back
      await waitFor(() => {
        const backButton = screen.getByText('Back')
        fireEvent.click(backButton)
      })

      expect(screen.getByText('Select Wallet Mode')).toBeInTheDocument()
    })

    it('should call onCancel when cancel button is clicked', () => {
      render(
        <InvoiceWalletWizard
          invoice={mockInvoice}
          onComplete={mockOnComplete}
          onCancel={mockOnCancel}
        />
      )

      const cancelButton = screen.getByText('Cancel')
      fireEvent.click(cancelButton)

      expect(mockOnCancel).toHaveBeenCalled()
    })
  })

  describe('Wallet Generation', () => {
    it('should generate wallet via API when available', async () => {
      const mockWallet = {
        id: 'wallet_123',
        invoiceId: 'inv_123',
        mode: 'adaptive',
        baseAddress: '0x123...',
        solanaAddress: 'abc123...',
        status: 'active'
      }

      ;(invoiceWalletAPI.getWalletByInvoice as jest.Mock).mockResolvedValue(null)
      ;(invoiceWalletAPI.generateWallet as jest.Mock).mockResolvedValue(mockWallet)

      render(
        <InvoiceWalletWizard
          invoice={mockInvoice}
          onComplete={mockOnComplete}
          onCancel={mockOnCancel}
        />
      )

      // Navigate through wizard
      fireEvent.click(screen.getByText('Adaptive').closest('button')!)
      fireEvent.click(screen.getByText('Next: Configuration'))

      await waitFor(() => {
        fireEvent.click(screen.getByText('Next: Review'))
      })

      await waitFor(() => {
        const generateButton = screen.getByText('Generate Wallet')
        fireEvent.click(generateButton)
      })

      await waitFor(() => {
        expect(invoiceWalletAPI.generateWallet).toHaveBeenCalledWith(
          'inv_123',
          expect.objectContaining({
            mode: 'adaptive',
            features: expect.any(Array)
          })
        )
        expect(mockOnComplete).toHaveBeenCalledWith(mockWallet)
        expect(toast.success).toHaveBeenCalledWith('Invoice-First wallet generated successfully!')
      })
    })

    it('should fall back to localStorage when API fails', async () => {
      ;(invoiceWalletAPI.getWalletByInvoice as jest.Mock).mockRejectedValue(new Error('API Error'))
      ;(invoiceWalletAPI.generateWallet as jest.Mock).mockRejectedValue(new Error('API Error'))

      render(
        <InvoiceWalletWizard
          invoice={mockInvoice}
          onComplete={mockOnComplete}
          onCancel={mockOnCancel}
        />
      )

      // Navigate through wizard
      fireEvent.click(screen.getByText('Ephemeral').closest('button')!)
      fireEvent.click(screen.getByText('Next: Configuration'))

      await waitFor(() => {
        fireEvent.click(screen.getByText('Next: Review'))
      })

      await waitFor(() => {
        const generateButton = screen.getByText('Generate Wallet')
        fireEvent.click(generateButton)
      })

      await waitFor(() => {
        expect(mockOnComplete).toHaveBeenCalled()
        expect(toast.success).toHaveBeenCalledWith('Invoice-First wallet generated successfully! (Dev Mode)')

        // Check localStorage was updated
        const wallets = JSON.parse(localStorage.getItem('invoice_wallets') || '[]')
        expect(wallets).toHaveLength(1)
        expect(wallets[0].invoiceId).toBe('inv_123')
      })
    })

    it('should prevent duplicate wallet generation for same invoice', async () => {
      const existingWallet = {
        id: 'wallet_existing',
        invoiceId: 'inv_123',
        status: 'active'
      }

      ;(invoiceWalletAPI.getWalletByInvoice as jest.Mock).mockResolvedValue(existingWallet)

      render(
        <InvoiceWalletWizard
          invoice={mockInvoice}
          onComplete={mockOnComplete}
          onCancel={mockOnCancel}
        />
      )

      // Try to generate wallet
      fireEvent.click(screen.getByText('Adaptive').closest('button')!)
      fireEvent.click(screen.getByText('Next: Configuration'))

      await waitFor(() => {
        fireEvent.click(screen.getByText('Next: Review'))
      })

      await waitFor(() => {
        const generateButton = screen.getByText('Generate Wallet')
        fireEvent.click(generateButton)
      })

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('A wallet already exists for this invoice!')
        expect(mockOnComplete).not.toHaveBeenCalled()
      })
    })
  })

  describe('Configuration Options', () => {
    it('should allow configuring TTL for ephemeral wallets', async () => {
      render(
        <InvoiceWalletWizard
          invoice={mockInvoice}
          onComplete={mockOnComplete}
          onCancel={mockOnCancel}
        />
      )

      // Select ephemeral mode
      fireEvent.click(screen.getByText('Ephemeral').closest('button')!)
      fireEvent.click(screen.getByText('Next: Configuration'))

      await waitFor(() => {
        expect(screen.getByText('Time to Live (TTL)')).toBeInTheDocument()
        expect(screen.getByText('24 hours')).toBeInTheDocument()
      })
    })

    it('should enable quantum security by default', async () => {
      render(
        <InvoiceWalletWizard
          invoice={mockInvoice}
          onComplete={mockOnComplete}
          onCancel={mockOnCancel}
        />
      )

      fireEvent.click(screen.getByText('Adaptive').closest('button')!)
      fireEvent.click(screen.getByText('Next: Configuration'))

      await waitFor(() => {
        const quantumCheckbox = screen.getByRole('checkbox', { name: /quantum/i })
        expect(quantumCheckbox).toBeChecked()
      })
    })
  })

  describe('Review Step', () => {
    it('should display summary of selected configuration', async () => {
      render(
        <InvoiceWalletWizard
          invoice={mockInvoice}
          onComplete={mockOnComplete}
          onCancel={mockOnCancel}
        />
      )

      // Navigate to review step
      fireEvent.click(screen.getByText('Persistent').closest('button')!)
      fireEvent.click(screen.getByText('Next: Configuration'))

      await waitFor(() => {
        fireEvent.click(screen.getByText('Next: Review'))
      })

      await waitFor(() => {
        expect(screen.getByText('Review Configuration')).toBeInTheDocument()
        expect(screen.getByText(/Mode: Persistent/)).toBeInTheDocument()
        expect(screen.getByText(/Invoice ID: inv_123/)).toBeInTheDocument()
      })
    })
  })

  describe('Error Handling', () => {
    it('should show error toast when wallet generation fails', async () => {
      ;(invoiceWalletAPI.getWalletByInvoice as jest.Mock).mockResolvedValue(null)
      ;(invoiceWalletAPI.generateWallet as jest.Mock).mockRejectedValue(
        new Error('Network error')
      )

      // Also make localStorage fail
      const mockSetItem = jest.spyOn(Storage.prototype, 'setItem')
      mockSetItem.mockImplementation(() => {
        throw new Error('Storage error')
      })

      render(
        <InvoiceWalletWizard
          invoice={mockInvoice}
          onComplete={mockOnComplete}
          onCancel={mockOnCancel}
        />
      )

      // Try to generate wallet
      fireEvent.click(screen.getByText('Adaptive').closest('button')!)
      fireEvent.click(screen.getByText('Next: Configuration'))

      await waitFor(() => {
        fireEvent.click(screen.getByText('Next: Review'))
      })

      await waitFor(() => {
        const generateButton = screen.getByText('Generate Wallet')
        fireEvent.click(generateButton)
      })

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to generate wallet')
        expect(mockOnComplete).not.toHaveBeenCalled()
      })

      mockSetItem.mockRestore()
    })
  })

  describe('Loading States', () => {
    it('should show loading state during wallet generation', async () => {
      ;(invoiceWalletAPI.getWalletByInvoice as jest.Mock).mockResolvedValue(null)
      ;(invoiceWalletAPI.generateWallet as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 1000))
      )

      render(
        <InvoiceWalletWizard
          invoice={mockInvoice}
          onComplete={mockOnComplete}
          onCancel={mockOnCancel}
        />
      )

      // Navigate to generate
      fireEvent.click(screen.getByText('Adaptive').closest('button')!)
      fireEvent.click(screen.getByText('Next: Configuration'))

      await waitFor(() => {
        fireEvent.click(screen.getByText('Next: Review'))
      })

      await waitFor(() => {
        const generateButton = screen.getByText('Generate Wallet')
        fireEvent.click(generateButton)
      })

      // Check for loading state
      expect(screen.getByText('Generating...')).toBeInTheDocument()
    })
  })
})