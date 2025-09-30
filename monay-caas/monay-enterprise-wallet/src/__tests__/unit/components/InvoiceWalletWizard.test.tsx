/**
 * Unit Test Suite: Invoice Wallet Wizard Component
 * Tests the complete invoice creation flow with wallet mode selection
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import InvoiceWalletWizard from '@/components/InvoiceWalletWizard';
import '@testing-library/jest-dom';

// Ensure Jest globals are available
declare const expect: jest.Expect;

// Mock the API calls - use the actual module that exists
jest.mock('@/lib/api/invoiceWalletAPI', () => ({
  createWallet: jest.fn(),
  attachInvoice: jest.fn(),
  getWallets: jest.fn(),
  createInvoice: jest.fn(),
  getCustomers: jest.fn(),
  validateCompliance: jest.fn(),
}));

// Mock the WebSocket hook
jest.mock('@/hooks/useWebSocket', () => ({
  useWebSocket: () => ({
    connected: true,
    sendMessage: jest.fn(),
    lastMessage: null,
  }),
}));

// Mock router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
  }),
}));

describe('InvoiceWalletWizard Component', () => {
  const mockOnComplete = jest.fn();
  const mockOnCancel = jest.fn();

  const mockInvoice = {
    id: 'inv-123',
    amount: 1000,
    currency: 'USD',
    customer: {
      name: 'Test Customer',
      email: 'test@example.com'
    },
    items: [],
    status: 'pending'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Rendering', () => {
    test('should render the wizard with initial step', () => {
      render(
        <InvoiceWalletWizard
          invoice={mockInvoice}
          onComplete={mockOnComplete}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByText(/Create Invoice/i)).toBeInTheDocument();
      expect(screen.getByText(/Step 1/i)).toBeInTheDocument();
      expect(screen.getByText(/Customer Information/i)).toBeInTheDocument();
    });

    test('should display all wizard steps in the stepper', () => {
      render(
        <InvoiceWalletWizard
          invoice={mockInvoice}
          onComplete={mockOnComplete}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByText(/Customer/i)).toBeInTheDocument();
      expect(screen.getByText(/Items/i)).toBeInTheDocument();
      expect(screen.getByText(/Payment Terms/i)).toBeInTheDocument();
      expect(screen.getByText(/Wallet Mode/i)).toBeInTheDocument();
      expect(screen.getByText(/Compliance/i)).toBeInTheDocument();
      expect(screen.getByText(/Review/i)).toBeInTheDocument();
    });
  });

  describe('Step 1: Customer Selection', () => {
    test('should allow selecting existing customer', async () => {
      const user = userEvent.setup();

      render(
        <InvoiceWalletWizard
          invoice={mockInvoice}
          onComplete={mockOnComplete}
          onCancel={mockOnCancel}
        />
      );

      // Mock customer data
      const mockCustomers = [
        { id: '1', name: 'Acme Corp', email: 'acme@example.com' },
        { id: '2', name: 'Tech Inc', email: 'tech@example.com' },
      ];

      // Simulate customer dropdown
      const customerSelect = screen.getByLabelText(/Select Customer/i);
      await user.click(customerSelect);

      // Select a customer
      await user.click(screen.getByText('Acme Corp'));

      expect(customerSelect).toHaveValue('1');
    });

    test('should allow creating new customer', async () => {
      const user = userEvent.setup();

      render(
        <InvoiceWalletWizard
          invoice={mockInvoice}
          onComplete={mockOnComplete}
          onCancel={mockOnCancel}
        />
      );

      // Click new customer button
      const newCustomerBtn = screen.getByText(/New Customer/i);
      await user.click(newCustomerBtn);

      // Fill in customer details
      await user.type(screen.getByLabelText(/Customer Name/i), 'New Corp');
      await user.type(screen.getByLabelText(/Email/i), 'new@example.com');
      await user.type(screen.getByLabelText(/Phone/i), '+1234567890');

      // Verify inputs
      expect(screen.getByLabelText(/Customer Name/i)).toHaveValue('New Corp');
      expect(screen.getByLabelText(/Email/i)).toHaveValue('new@example.com');
    });

    test('should validate email format', async () => {
      const user = userEvent.setup();

      render(
        <InvoiceWalletWizard
          invoice={mockInvoice}
          onComplete={mockOnComplete}
          onCancel={mockOnCancel}
        />
      );

      const emailInput = screen.getByLabelText(/Email/i);
      await user.type(emailInput, 'invalid-email');

      // Blur to trigger validation
      fireEvent.blur(emailInput);

      await waitFor(() => {
        expect(screen.getByText(/Invalid email format/i)).toBeInTheDocument();
      });
    });
  });

  describe('Step 2: Line Items', () => {
    test('should add line items to invoice', async () => {
      const user = userEvent.setup();

      render(
        <InvoiceWalletWizard
          invoice={mockInvoice}
          onComplete={mockOnComplete}
          onCancel={mockOnCancel}
        />
      );

      // Navigate to step 2
      await user.click(screen.getByText(/Next/i));

      // Add line item
      await user.type(screen.getByLabelText(/Description/i), 'Consulting Services');
      await user.type(screen.getByLabelText(/Quantity/i), '10');
      await user.type(screen.getByLabelText(/Price/i), '100');

      await user.click(screen.getByText(/Add Item/i));

      // Verify item added
      expect(screen.getByText(/Consulting Services/i)).toBeInTheDocument();
      expect(screen.getByText(/\$1,000/i)).toBeInTheDocument();
    });

    test('should calculate totals correctly', async () => {
      const user = userEvent.setup();

      render(
        <InvoiceWalletWizard
          invoice={mockInvoice}
          onComplete={mockOnComplete}
          onCancel={mockOnCancel}
        />
      );

      // Navigate to step 2
      await user.click(screen.getByText(/Next/i));

      // Add multiple items
      await user.type(screen.getByLabelText(/Description/i), 'Item 1');
      await user.type(screen.getByLabelText(/Quantity/i), '5');
      await user.type(screen.getByLabelText(/Price/i), '50');
      await user.click(screen.getByText(/Add Item/i));

      await user.clear(screen.getByLabelText(/Description/i));
      await user.type(screen.getByLabelText(/Description/i), 'Item 2');
      await user.clear(screen.getByLabelText(/Quantity/i));
      await user.type(screen.getByLabelText(/Quantity/i), '3');
      await user.clear(screen.getByLabelText(/Price/i));
      await user.type(screen.getByLabelText(/Price/i), '75');
      await user.click(screen.getByText(/Add Item/i));

      // Verify total
      expect(screen.getByText(/Total: \$475/i)).toBeInTheDocument();
    });

    test('should remove line items', async () => {
      const user = userEvent.setup();

      render(
        <InvoiceWalletWizard
          invoice={mockInvoice}
          onComplete={mockOnComplete}
          onCancel={mockOnCancel}
        />
      );

      // Navigate to step 2 and add item
      await user.click(screen.getByText(/Next/i));
      await user.type(screen.getByLabelText(/Description/i), 'Test Item');
      await user.type(screen.getByLabelText(/Quantity/i), '1');
      await user.type(screen.getByLabelText(/Price/i), '100');
      await user.click(screen.getByText(/Add Item/i));

      // Remove item
      const removeBtn = screen.getByLabelText(/Remove item/i);
      await user.click(removeBtn);

      expect(screen.queryByText(/Test Item/i)).not.toBeInTheDocument();
    });
  });

  describe('Step 3: Payment Terms', () => {
    test('should set payment due date', async () => {
      const user = userEvent.setup();

      render(
        <InvoiceWalletWizard
          invoice={mockInvoice}
          onComplete={mockOnComplete}
          onCancel={mockOnCancel}
        />
      );

      // Navigate to step 3
      await user.click(screen.getByText(/Next/i));
      await user.click(screen.getByText(/Next/i));

      // Select payment terms
      const termsSelect = screen.getByLabelText(/Payment Terms/i);
      await user.selectOptions(termsSelect, 'net30');

      expect(termsSelect).toHaveValue('net30');

      // Verify due date is calculated
      const today = new Date();
      const dueDate = new Date(today.setDate(today.getDate() + 30));
      const formattedDate = dueDate.toLocaleDateString();

      expect(screen.getByText(new RegExp(formattedDate))).toBeInTheDocument();
    });

    test('should allow custom payment instructions', async () => {
      const user = userEvent.setup();

      render(
        <InvoiceWalletWizard
          invoice={mockInvoice}
          onComplete={mockOnComplete}
          onCancel={mockOnCancel}
        />
      );

      // Navigate to step 3
      await user.click(screen.getByText(/Next/i));
      await user.click(screen.getByText(/Next/i));

      const instructionsInput = screen.getByLabelText(/Payment Instructions/i);
      await user.type(instructionsInput, 'Please pay via wire transfer');

      expect(instructionsInput).toHaveValue('Please pay via wire transfer');
    });
  });

  describe('Step 4: Wallet Mode Selection', () => {
    test('should display all wallet mode options', async () => {
      const user = userEvent.setup();

      render(
        <InvoiceWalletWizard
          invoice={mockInvoice}
          onComplete={mockOnComplete}
          onCancel={mockOnCancel}
        />
      );

      // Navigate to wallet mode step
      for (let i = 0; i < 3; i++) {
        await user.click(screen.getByText(/Next/i));
      }

      expect(screen.getByText(/Ephemeral Wallet/i)).toBeInTheDocument();
      expect(screen.getByText(/Persistent Wallet/i)).toBeInTheDocument();
      // Use getAllByText for Adaptive since it appears multiple times
      const adaptiveElements = screen.getAllByText(/Adaptive Wallet/i);
      expect(adaptiveElements.length).toBeGreaterThan(0);
    });

    test('should select ephemeral wallet mode', async () => {
      const user = userEvent.setup();

      render(
        <InvoiceWalletWizard
          invoice={mockInvoice}
          onComplete={mockOnComplete}
          onCancel={mockOnCancel}
        />
      );

      // Navigate to wallet mode step
      for (let i = 0; i < 3; i++) {
        await user.click(screen.getByText(/Next/i));
      }

      const ephemeralOption = screen.getByLabelText(/Ephemeral/i);
      await user.click(ephemeralOption);

      expect(ephemeralOption).toBeChecked();
      expect(screen.getByText(/Temporary wallet for this invoice only/i)).toBeInTheDocument();
    });

    test('should configure adaptive wallet thresholds', async () => {
      const user = userEvent.setup();

      render(
        <InvoiceWalletWizard
          invoice={mockInvoice}
          onComplete={mockOnComplete}
          onCancel={mockOnCancel}
        />
      );

      // Navigate to wallet mode step
      for (let i = 0; i < 3; i++) {
        await user.click(screen.getByText(/Next/i));
      }

      // Select adaptive mode
      const adaptiveOption = screen.getByLabelText(/Adaptive/i);
      await user.click(adaptiveOption);

      // Configure thresholds
      const thresholdInput = screen.getByLabelText(/Conversion Threshold/i);
      await user.clear(thresholdInput);
      await user.type(thresholdInput, '5000');

      expect(thresholdInput).toHaveValue('5000');
    });
  });

  describe('Step 5: Compliance Checks', () => {
    test('should run compliance validation', async () => {
      const { validateCompliance } = require('@/lib/api/invoiceWalletAPI');
      validateCompliance.mockResolvedValue({
        passed: true,
        checks: [
          { name: 'KYC', status: 'passed' },
          { name: 'AML', status: 'passed' },
          { name: 'Sanctions', status: 'passed' },
        ],
      });

      const user = userEvent.setup();

      render(
        <InvoiceWalletWizard
          invoice={mockInvoice}
          onComplete={mockOnComplete}
          onCancel={mockOnCancel}
        />
      );

      // Navigate to compliance step
      for (let i = 0; i < 4; i++) {
        await user.click(screen.getByText(/Next/i));
      }

      await waitFor(() => {
        expect(screen.getByText(/Running compliance checks/i)).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByText(/✓ KYC/i)).toBeInTheDocument();
        expect(screen.getByText(/✓ AML/i)).toBeInTheDocument();
        expect(screen.getByText(/✓ Sanctions/i)).toBeInTheDocument();
      });

      expect(validateCompliance).toHaveBeenCalled();
    });

    test('should handle compliance failure', async () => {
      const { validateCompliance } = require('@/lib/api/invoiceWalletAPI');
      validateCompliance.mockResolvedValue({
        passed: false,
        checks: [
          { name: 'KYC', status: 'failed', reason: 'Customer not verified' },
        ],
      });

      const user = userEvent.setup();

      render(
        <InvoiceWalletWizard
          invoice={mockInvoice}
          onComplete={mockOnComplete}
          onCancel={mockOnCancel}
        />
      );

      // Navigate to compliance step
      for (let i = 0; i < 4; i++) {
        await user.click(screen.getByText(/Next/i));
      }

      await waitFor(() => {
        expect(screen.getByText(/❌ KYC/i)).toBeInTheDocument();
        expect(screen.getByText(/Customer not verified/i)).toBeInTheDocument();
      });

      // Next button should be disabled
      expect(screen.getByText(/Next/i)).toBeDisabled();
    });
  });

  describe('Step 6: Review and Submit', () => {
    test('should display invoice summary', async () => {
      const user = userEvent.setup();

      render(
        <InvoiceWalletWizard
          invoice={mockInvoice}
          onComplete={mockOnComplete}
          onCancel={mockOnCancel}
        />
      );

      // Fill in all steps with test data
      // ... (navigate through all steps with test data)

      // Navigate to review step
      for (let i = 0; i < 5; i++) {
        await user.click(screen.getByText(/Next/i));
      }

      // Verify summary displays all entered data
      expect(screen.getByText(/Review Invoice/i)).toBeInTheDocument();
      expect(screen.getByText(/Customer:/i)).toBeInTheDocument();
      expect(screen.getByText(/Total Amount:/i)).toBeInTheDocument();
      expect(screen.getByText(/Wallet Mode:/i)).toBeInTheDocument();
    });

    test('should submit invoice successfully', async () => {
      const { createInvoice } = require('@/lib/api/invoiceWalletAPI');
      createInvoice.mockResolvedValue({
        success: true,
        invoiceId: 'INV-001',
        walletAddress: '0x123...',
      });

      const user = userEvent.setup();

      render(
        <InvoiceWalletWizard
          invoice={mockInvoice}
          onComplete={mockOnComplete}
          onCancel={mockOnCancel}
        />
      );

      // Navigate to review step
      for (let i = 0; i < 5; i++) {
        await user.click(screen.getByText(/Next/i));
      }

      // Submit invoice
      const submitBtn = screen.getByText(/Create Invoice/i);
      await user.click(submitBtn);

      await waitFor(() => {
        expect(createInvoice).toHaveBeenCalled();
        expect(mockOnComplete).toHaveBeenCalledWith({
          success: true,
          invoiceId: 'INV-001',
          walletAddress: '0x123...',
        });
      });
    });

    test('should handle submission error', async () => {
      const { createInvoice } = require('@/lib/api/invoiceWalletAPI');
      createInvoice.mockRejectedValue(new Error('Network error'));

      const user = userEvent.setup();

      render(
        <InvoiceWalletWizard
          invoice={mockInvoice}
          onComplete={mockOnComplete}
          onCancel={mockOnCancel}
        />
      );

      // Navigate to review step
      for (let i = 0; i < 5; i++) {
        await user.click(screen.getByText(/Next/i));
      }

      // Submit invoice
      const submitBtn = screen.getByText(/Create Invoice/i);
      await user.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText(/Failed to create invoice/i)).toBeInTheDocument();
        expect(screen.getByText(/Network error/i)).toBeInTheDocument();
      });
    });
  });

  describe('Navigation', () => {
    test('should navigate between steps using Next/Back buttons', async () => {
      const user = userEvent.setup();

      render(
        <InvoiceWalletWizard
          invoice={mockInvoice}
          onComplete={mockOnComplete}
          onCancel={mockOnCancel}
        />
      );

      // Initially on step 1
      expect(screen.getByText(/Customer Information/i)).toBeInTheDocument();

      // Go to step 2
      await user.click(screen.getByText(/Next/i));
      expect(screen.getByText(/Line Items/i)).toBeInTheDocument();

      // Go back to step 1
      await user.click(screen.getByText(/Back/i));
      expect(screen.getByText(/Customer Information/i)).toBeInTheDocument();
    });

    test('should prevent navigation with validation errors', async () => {
      const user = userEvent.setup();

      render(
        <InvoiceWalletWizard
          invoice={mockInvoice}
          onComplete={mockOnComplete}
          onCancel={mockOnCancel}
        />
      );

      // Try to go next without filling required fields
      await user.click(screen.getByText(/Next/i));

      // Should show validation errors
      expect(screen.getByText(/Customer is required/i)).toBeInTheDocument();

      // Should still be on step 1
      expect(screen.getByText(/Customer Information/i)).toBeInTheDocument();
    });

    test('should call onCancel when cancelled', async () => {
      const user = userEvent.setup();

      render(
        <InvoiceWalletWizard
          invoice={mockInvoice}
          onComplete={mockOnComplete}
          onCancel={mockOnCancel}
        />
      );

      await user.click(screen.getByText(/Cancel/i));

      expect(mockOnCancel).toHaveBeenCalled();
    });
  });

  describe('Data Persistence', () => {
    test('should save draft automatically', async () => {
      const user = userEvent.setup();

      render(
        <InvoiceWalletWizard
          invoice={mockInvoice}
          onComplete={mockOnComplete}
          onCancel={mockOnCancel}
        />
      );

      // Enter some data
      await user.type(screen.getByLabelText(/Customer Name/i), 'Test Corp');

      // Wait for auto-save
      await waitFor(() => {
        expect(localStorage.setItem).toHaveBeenCalledWith(
          'invoice_draft',
          expect.stringContaining('Test Corp')
        );
      }, { timeout: 3000 });
    });

    test('should restore draft on mount', () => {
      (localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify({
        customer: { name: 'Saved Corp', email: 'saved@example.com' },
        lineItems: [{ description: 'Saved Item', quantity: 1, price: 100 }],
      }));

      render(
        <InvoiceWalletWizard
          invoice={mockInvoice}
          onComplete={mockOnComplete}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByDisplayValue(/Saved Corp/i)).toBeInTheDocument();
    });
  });

  describe('WebSocket Integration', () => {
    test('should update UI on WebSocket messages', async () => {
      const { useWebSocket } = require('@/hooks/useWebSocket');

      const mockWebSocket = {
        connected: true,
        sendMessage: jest.fn(),
        lastMessage: { type: 'invoice_updated', data: { status: 'paid' } },
      };

      useWebSocket.mockReturnValue(mockWebSocket);

      render(
        <InvoiceWalletWizard
          invoice={mockInvoice}
          onComplete={mockOnComplete}
          onCancel={mockOnCancel}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/Invoice has been paid/i)).toBeInTheDocument();
      });
    });

    test('should show connection status', () => {
      const { useWebSocket } = require('@/hooks/useWebSocket');

      useWebSocket.mockReturnValue({
        connected: false,
        sendMessage: jest.fn(),
        lastMessage: null,
      });

      render(
        <InvoiceWalletWizard
          invoice={mockInvoice}
          onComplete={mockOnComplete}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByText(/Offline/i)).toBeInTheDocument();
    });
  });
});