/**
 * TypeScript Type Definitions for Invoice-First System
 * Enterprise Wallet Invoice Management
 */

// Invoice Direction Types
export type InvoiceDirection = 'inbound' | 'outbound';

// Invoice Status
export type InvoiceStatus =
  | 'draft'
  | 'sent'
  | 'pending'
  | 'paid'
  | 'partially_paid'
  | 'overdue'
  | 'cancelled'
  | 'expired'
  | 'disputed';

// Wallet Modes for Invoice-First
export type WalletMode = 'ephemeral' | 'persistent' | 'adaptive';

// Payment Methods
export type PaymentMethod =
  | 'usdc'
  | 'usdt'
  | 'pyusd'
  | 'ach'
  | 'wire'
  | 'card'
  | 'crypto';

// Currency Types
export type Currency = 'USD' | 'USDC' | 'USDT' | 'PYUSD' | 'BTC' | 'ETH' | 'SOL';

// Invoice Line Item
export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  taxRate?: number;
  taxAmount?: number;
  discount?: number;
}

// Invoice Wallet
export interface InvoiceWallet {
  id: string;
  address: string;
  mode: WalletMode;
  status: 'active' | 'expired' | 'destroyed';
  createdAt: Date;
  expiresAt?: Date;
  remainingTTL?: number; // seconds
  balance?: number;
  currency: Currency;
  securityScore?: number;
  quantumEnabled?: boolean;
}

// Invoice Metadata
export interface InvoiceMetadata {
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  billingAddress?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
  notes?: string;
  tags?: string[];
  customFields?: Record<string, any>;
}

// Main Invoice Interface
export interface Invoice {
  id: string;
  invoiceNumber: string;
  direction: InvoiceDirection;
  status: InvoiceStatus;

  // Parties
  fromCompany: {
    id: string;
    name: string;
    email: string;
    address?: string;
    taxId?: string;
  };
  toCompany: {
    id: string;
    name: string;
    email: string;
    address?: string;
    taxId?: string;
  };

  // Financial Details
  lineItems: InvoiceLineItem[];
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  total: number;
  currency: Currency;

  // Payment Details
  paymentMethod: PaymentMethod;
  paymentTerms: string; // e.g., "Net 30"

  // Invoice-First Wallet
  wallet?: InvoiceWallet;
  ephemeralWalletId?: string;

  // Dates
  issueDate: Date;
  dueDate: Date;
  paidDate?: Date;
  createdAt: Date;
  updatedAt: Date;

  // Additional Info
  metadata?: InvoiceMetadata;
  attachments?: string[];
  paymentLink?: string;
  qrCode?: string;
}

// Invoice Template
export interface InvoiceTemplate {
  id: string;
  name: string;
  description?: string;
  isDefault: boolean;

  // Template Content
  lineItems: Omit<InvoiceLineItem, 'id'>[];
  paymentTerms: string;
  currency: Currency;
  paymentMethod: PaymentMethod;

  // Recurrence
  isRecurring: boolean;
  recurrencePattern?: 'monthly' | 'quarterly' | 'yearly' | 'custom';
  recurrenceDay?: number;

  // Metadata
  metadata?: Partial<InvoiceMetadata>;
  createdAt: Date;
  updatedAt: Date;
}

// Payment Record
export interface InvoicePayment {
  id: string;
  invoiceId: string;
  amount: number;
  currency: Currency;
  paymentMethod: PaymentMethod;
  transactionId: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paidAt: Date;
  metadata?: Record<string, any>;
}

// Invoice Statistics
export interface InvoiceStats {
  total: number;
  inbound: {
    count: number;
    totalAmount: number;
    pending: number;
    paid: number;
    overdue: number;
  };
  outbound: {
    count: number;
    totalAmount: number;
    pending: number;
    paid: number;
    overdue: number;
  };
  ephemeralWallets: {
    active: number;
    expired: number;
    totalCreated: number;
  };
}

// Create Invoice Request
export interface CreateInvoiceRequest {
  direction: InvoiceDirection;
  toCompany: {
    name: string;
    email: string;
    address?: string;
    taxId?: string;
  };
  lineItems: Omit<InvoiceLineItem, 'id'>[];
  currency: Currency;
  paymentMethod: PaymentMethod;
  paymentTerms: string;
  dueDate: Date;

  // Invoice-First Options
  createEphemeralWallet?: boolean;
  walletMode?: WalletMode;
  walletTTL?: number; // seconds

  metadata?: InvoiceMetadata;
  sendEmail?: boolean;
  templateId?: string;
}

// Invoice Filter Options
export interface InvoiceFilterOptions {
  direction?: InvoiceDirection;
  status?: InvoiceStatus;
  paymentMethod?: PaymentMethod;
  currency?: Currency;
  dateRange?: {
    start: Date;
    end: Date;
  };
  search?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'date' | 'amount' | 'status' | 'dueDate';
  sortOrder?: 'asc' | 'desc';
}

// Invoice Summary for Dashboard
export interface InvoiceSummary {
  id: string;
  invoiceNumber: string;
  direction: InvoiceDirection;
  status: InvoiceStatus;
  companyName: string; // from or to depending on direction
  amount: number;
  currency: Currency;
  dueDate: Date;
  hasEphemeralWallet: boolean;
  walletStatus?: 'active' | 'expired';
  paymentProgress?: number; // percentage
}