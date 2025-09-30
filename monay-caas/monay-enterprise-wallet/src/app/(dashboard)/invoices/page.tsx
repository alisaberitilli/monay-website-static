'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  FileText, Plus, Download, Upload, Search, Filter,
  Clock, CheckCircle, AlertCircle, XCircle, TrendingUp,
  Wallet, DollarSign, Calendar, ArrowUpRight, ArrowDownLeft,
  RefreshCw, Eye, Send, Copy, MoreVertical, CreditCard,
  Edit, Trash2, Share, Archive, ChevronDown, Check
} from 'lucide-react'
import toast from 'react-hot-toast'
import type {
  Invoice,
  InvoiceDirection,
  InvoiceStatus,
  InvoiceStats,
  InvoiceSummary
} from '@/types/invoice'

export default function InvoicesPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'all' | 'inbound' | 'outbound'>('all')
  const [invoices, setInvoices] = useState<InvoiceSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'all'>('all')
  const [selectedInvoices, setSelectedInvoices] = useState<Set<string>>(new Set())
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Updated stats to match actual invoice count
  const stats: InvoiceStats = {
    total: 25,
    inbound: {
      count: 15,
      totalAmount: 245600,
      pending: 5,
      paid: 6,
      overdue: 4
    },
    outbound: {
      count: 10,
      totalAmount: 89230,
      pending: 3,
      paid: 5,
      overdue: 2
    },
    ephemeralWallets: {
      active: 8,
      expired: 4,
      totalCreated: 25
    }
  }

  useEffect(() => {
    // Load invoices (mock data for now)
    loadInvoices()
  }, [])

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null)
      }
    }
    if (openDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [openDropdown])

  // Update bulk actions visibility
  useEffect(() => {
    setShowBulkActions(selectedInvoices.size > 0)
  }, [selectedInvoices])

  const loadInvoices = async () => {
    setLoading(true)

    // Load created invoices from localStorage
    const createdInvoices = JSON.parse(localStorage.getItem('invoices') || '[]')

    // Convert created invoices to InvoiceSummary format
    const convertedCreatedInvoices: InvoiceSummary[] = createdInvoices.map((invoice: any) => ({
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      direction: invoice.direction,
      status: invoice.status,
      companyName: invoice.toCompany.name,
      amount: invoice.total || invoice.lineItems.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0),
      currency: invoice.currency,
      dueDate: new Date(invoice.dueDate),
      hasEphemeralWallet: invoice.createEphemeralWallet || false,
      walletStatus: invoice.status === 'sent' ? 'active' : 'pending',
      paymentProgress: invoice.status === 'paid' ? 100 : 0
    }))

    // Comprehensive mock invoice data matching stats
    const mockInvoices: InvoiceSummary[] = [
      // INBOUND INVOICES (15 total: 5 pending, 6 paid, 4 overdue)

      // Pending Inbound (5)
      {
        id: '1',
        invoiceNumber: 'INV-2025-001',
        direction: 'inbound',
        status: 'pending',
        companyName: 'Acme Corporation',
        amount: 15600,
        currency: 'USDC',
        dueDate: new Date('2025-10-15'),
        hasEphemeralWallet: true,
        walletStatus: 'active',
        paymentProgress: 0
      },
      {
        id: '2',
        invoiceNumber: 'INV-2025-002',
        direction: 'inbound',
        status: 'pending',
        companyName: 'Digital Solutions LLC',
        amount: 25000,
        currency: 'USDC',
        dueDate: new Date('2025-10-20'),
        hasEphemeralWallet: true,
        walletStatus: 'active',
        paymentProgress: 0
      },
      {
        id: '3',
        invoiceNumber: 'INV-2025-003',
        direction: 'inbound',
        status: 'pending',
        companyName: 'Cloud Services Pro',
        amount: 8750,
        currency: 'USDT',
        dueDate: new Date('2025-10-25'),
        hasEphemeralWallet: true,
        walletStatus: 'active',
        paymentProgress: 0
      },
      {
        id: '4',
        invoiceNumber: 'INV-2025-004',
        direction: 'inbound',
        status: 'pending',
        companyName: 'Enterprise Apps Inc',
        amount: 12000,
        currency: 'USDC',
        dueDate: new Date('2025-11-01'),
        hasEphemeralWallet: true,
        walletStatus: 'active',
        paymentProgress: 0
      },
      {
        id: '5',
        invoiceNumber: 'INV-2025-005',
        direction: 'inbound',
        status: 'pending',
        companyName: 'Marketing Masters',
        amount: 5500,
        currency: 'PYUSD',
        dueDate: new Date('2025-10-30'),
        hasEphemeralWallet: true,
        walletStatus: 'active',
        paymentProgress: 0
      },

      // Paid Inbound (6)
      {
        id: '6',
        invoiceNumber: 'INV-2025-006',
        direction: 'inbound',
        status: 'paid',
        companyName: 'Tech Innovators',
        amount: 18000,
        currency: 'USDC',
        dueDate: new Date('2025-09-15'),
        hasEphemeralWallet: true,
        walletStatus: 'completed',
        paymentProgress: 100
      },
      {
        id: '7',
        invoiceNumber: 'INV-2025-007',
        direction: 'inbound',
        status: 'paid',
        companyName: 'Global Consulting',
        amount: 32000,
        currency: 'USDC',
        dueDate: new Date('2025-09-20'),
        hasEphemeralWallet: true,
        walletStatus: 'completed',
        paymentProgress: 100
      },
      {
        id: '8',
        invoiceNumber: 'INV-2025-008',
        direction: 'inbound',
        status: 'paid',
        companyName: 'Data Analytics Co',
        amount: 14500,
        currency: 'USDT',
        dueDate: new Date('2025-09-10'),
        hasEphemeralWallet: true,
        walletStatus: 'completed',
        paymentProgress: 100
      },
      {
        id: '9',
        invoiceNumber: 'INV-2025-009',
        direction: 'inbound',
        status: 'paid',
        companyName: 'Software Solutions',
        amount: 9800,
        currency: 'USDC',
        dueDate: new Date('2025-09-25'),
        hasEphemeralWallet: true,
        walletStatus: 'completed',
        paymentProgress: 100
      },
      {
        id: '10',
        invoiceNumber: 'INV-2025-010',
        direction: 'inbound',
        status: 'paid',
        companyName: 'Creative Agency',
        amount: 7200,
        currency: 'PYUSD',
        dueDate: new Date('2025-09-12'),
        hasEphemeralWallet: true,
        walletStatus: 'completed',
        paymentProgress: 100
      },
      {
        id: '11',
        invoiceNumber: 'INV-2025-011',
        direction: 'inbound',
        status: 'paid',
        companyName: 'Business Partners LLC',
        amount: 22000,
        currency: 'USDC',
        dueDate: new Date('2025-09-18'),
        hasEphemeralWallet: true,
        walletStatus: 'completed',
        paymentProgress: 100
      },

      // Overdue Inbound (4)
      {
        id: '12',
        invoiceNumber: 'INV-2025-012',
        direction: 'inbound',
        status: 'overdue',
        companyName: 'StartUp Ventures',
        amount: 8900,
        currency: 'USDT',
        dueDate: new Date('2025-09-01'),
        hasEphemeralWallet: true,
        walletStatus: 'expired',
        paymentProgress: 0
      },
      {
        id: '13',
        invoiceNumber: 'INV-2025-013',
        direction: 'inbound',
        status: 'overdue',
        companyName: 'Delayed Payments Inc',
        amount: 6750,
        currency: 'USDC',
        dueDate: new Date('2025-08-28'),
        hasEphemeralWallet: true,
        walletStatus: 'expired',
        paymentProgress: 0
      },
      {
        id: '14',
        invoiceNumber: 'INV-2025-014',
        direction: 'inbound',
        status: 'overdue',
        companyName: 'Slow Payers Corp',
        amount: 11200,
        currency: 'USDC',
        dueDate: new Date('2025-08-15'),
        hasEphemeralWallet: true,
        walletStatus: 'expired',
        paymentProgress: 0
      },
      {
        id: '15',
        invoiceNumber: 'INV-2025-015',
        direction: 'inbound',
        status: 'overdue',
        companyName: 'Late Finance LLC',
        amount: 4300,
        currency: 'USDT',
        dueDate: new Date('2025-08-20'),
        hasEphemeralWallet: true,
        walletStatus: 'expired',
        paymentProgress: 0
      },

      // OUTBOUND INVOICES (10 total: 3 pending, 5 paid, 2 overdue)

      // Pending Outbound (3)
      {
        id: '16',
        invoiceNumber: 'INV-2025-016',
        direction: 'outbound',
        status: 'pending',
        companyName: 'Office Supplies Plus',
        amount: 2800,
        currency: 'USD',
        dueDate: new Date('2025-10-12'),
        hasEphemeralWallet: false,
        paymentProgress: 0
      },
      {
        id: '17',
        invoiceNumber: 'INV-2025-017',
        direction: 'outbound',
        status: 'pending',
        companyName: 'Utility Services',
        amount: 1500,
        currency: 'USD',
        dueDate: new Date('2025-10-18'),
        hasEphemeralWallet: false,
        paymentProgress: 0
      },
      {
        id: '18',
        invoiceNumber: 'INV-2025-018',
        direction: 'outbound',
        status: 'pending',
        companyName: 'Professional Services',
        amount: 4200,
        currency: 'USD',
        dueDate: new Date('2025-10-22'),
        hasEphemeralWallet: false,
        paymentProgress: 0
      },

      // Paid Outbound (5)
      {
        id: '19',
        invoiceNumber: 'INV-2025-019',
        direction: 'outbound',
        status: 'paid',
        companyName: 'Tech Supplies Inc.',
        amount: 3200,
        currency: 'USD',
        dueDate: new Date('2025-09-30'),
        hasEphemeralWallet: false,
        paymentProgress: 100
      },
      {
        id: '20',
        invoiceNumber: 'INV-2025-020',
        direction: 'outbound',
        status: 'paid',
        companyName: 'Equipment Rental',
        amount: 5500,
        currency: 'USD',
        dueDate: new Date('2025-09-25'),
        hasEphemeralWallet: false,
        paymentProgress: 100
      },
      {
        id: '21',
        invoiceNumber: 'INV-2025-021',
        direction: 'outbound',
        status: 'paid',
        companyName: 'Legal Services',
        amount: 7800,
        currency: 'USD',
        dueDate: new Date('2025-09-20'),
        hasEphemeralWallet: false,
        paymentProgress: 100
      },
      {
        id: '22',
        invoiceNumber: 'INV-2025-022',
        direction: 'outbound',
        status: 'paid',
        companyName: 'Marketing Agency',
        amount: 6200,
        currency: 'USD',
        dueDate: new Date('2025-09-15'),
        hasEphemeralWallet: false,
        paymentProgress: 100
      },
      {
        id: '23',
        invoiceNumber: 'INV-2025-023',
        direction: 'outbound',
        status: 'paid',
        companyName: 'Consulting Firm',
        amount: 4100,
        currency: 'USD',
        dueDate: new Date('2025-09-12'),
        hasEphemeralWallet: false,
        paymentProgress: 100
      },

      // Overdue Outbound (2)
      {
        id: '24',
        invoiceNumber: 'INV-2025-024',
        direction: 'outbound',
        status: 'overdue',
        companyName: 'Maintenance Services',
        amount: 2300,
        currency: 'USD',
        dueDate: new Date('2025-09-05'),
        hasEphemeralWallet: false,
        paymentProgress: 0
      },
      {
        id: '25',
        invoiceNumber: 'INV-2025-025',
        direction: 'outbound',
        status: 'overdue',
        companyName: 'Security Services',
        amount: 1800,
        currency: 'USD',
        dueDate: new Date('2025-08-30'),
        hasEphemeralWallet: false,
        paymentProgress: 0
      }
    ]

    // Combine created invoices with mock invoices (created invoices first to appear at top)
    const allInvoices = [...convertedCreatedInvoices, ...mockInvoices]
    setInvoices(allInvoices)
    setLoading(false)
  }

  const getStatusBadge = (status: InvoiceStatus) => {
    const statusConfig = {
      draft: { color: 'bg-gray-100 text-gray-800', icon: FileText },
      sent: { color: 'bg-blue-100 text-blue-800', icon: Send },
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      paid: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      partially_paid: { color: 'bg-orange-100 text-orange-800', icon: Clock },
      overdue: { color: 'bg-red-100 text-red-800', icon: AlertCircle },
      cancelled: { color: 'bg-gray-100 text-gray-800', icon: XCircle },
      expired: { color: 'bg-gray-100 text-gray-800', icon: XCircle },
      disputed: { color: 'bg-purple-100 text-purple-800', icon: AlertCircle }
    }

    const config = statusConfig[status]
    const Icon = config.icon

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    )
  }

  const filteredInvoices = invoices.filter(invoice => {
    if (activeTab !== 'all' && invoice.direction !== activeTab) return false
    if (statusFilter !== 'all' && invoice.status !== statusFilter) return false
    if (searchTerm && !invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !invoice.companyName.toLowerCase().includes(searchTerm.toLowerCase())) return false
    return true
  })

  const formatCurrency = (amount: number, currency: string) => {
    if (currency === 'USD') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(amount)
    }
    return `${amount.toLocaleString()} ${currency}`
  }

  // Handle invoice selection
  const handleInvoiceSelect = (invoiceId: string, checked: boolean) => {
    const newSelected = new Set(selectedInvoices)
    if (checked) {
      newSelected.add(invoiceId)
    } else {
      newSelected.delete(invoiceId)
    }
    setSelectedInvoices(newSelected)
  }

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const payableInvoices = filteredInvoices
        .filter(invoice => invoice.direction === 'inbound' && ['pending', 'overdue'].includes(invoice.status))
        .map(invoice => invoice.id)
      setSelectedInvoices(new Set(payableInvoices))
    } else {
      setSelectedInvoices(new Set())
    }
  }

  // Invoice actions
  const handlePayInvoice = async (invoice: InvoiceSummary) => {
    if (invoice.direction === 'inbound' && ['pending', 'overdue'].includes(invoice.status)) {
      router.push(`/invoices/${invoice.id}`)
    } else {
      toast.error('This invoice cannot be paid from here')
    }
  }

  const handleEditInvoice = (invoice: InvoiceSummary) => {
    if (invoice.status === 'draft') {
      router.push(`/invoices/edit/${invoice.id}`)
    } else {
      toast.error('Only draft invoices can be edited')
    }
  }

  const handleDuplicateInvoice = (invoice: InvoiceSummary) => {
    router.push(`/invoices/create?duplicate=${invoice.id}`)
    toast.success('Invoice duplicated for editing')
  }

  const handleArchiveInvoice = (invoice: InvoiceSummary) => {
    toast.success('Invoice archived successfully')
  }

  const handleShareInvoice = (invoice: InvoiceSummary) => {
    const url = `${window.location.origin}/invoices/${invoice.id}`
    navigator.clipboard.writeText(url)
    toast.success('Invoice link copied to clipboard')
  }

  const handleDownloadPDF = (invoice: InvoiceSummary) => {
    toast.success(`Downloading PDF for ${invoice.invoiceNumber}`)
  }

  // Bulk payment actions
  const handleBulkPayment = async () => {
    const payableInvoices = Array.from(selectedInvoices)
      .map(id => invoices.find(inv => inv.id === id))
      .filter((inv): inv is InvoiceSummary =>
        inv !== undefined && inv.direction === 'inbound' && ['pending', 'overdue'].includes(inv.status)
      )

    if (payableInvoices.length === 0) {
      toast.error('No payable invoices selected')
      return
    }

    if (payableInvoices.length === 1) {
      router.push(`/invoices/${payableInvoices[0].id}`)
    } else {
      router.push(`/invoices/bulk-pay?invoices=${payableInvoices.map(inv => inv.id).join(',')}`)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Invoice-First Payments
          </h1>
          <p className="text-gray-600 mt-1">
            Manage inbound and outbound invoices with ephemeral wallet generation
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => router.push('/invoices/templates')}
          >
            <FileText className="h-4 w-4 mr-2" />
            Templates
          </Button>
          <Button
            variant="gradient"
            onClick={() => router.push('/invoices/create')}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Invoice
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Invoices</p>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-gray-400 mt-1">All time</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Inbound (Receivables)</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.inbound.totalAmount, 'USD')}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className="bg-green-100 text-green-800 text-xs">
                    {stats.inbound.paid} Paid
                  </Badge>
                  <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                    {stats.inbound.pending} Pending
                  </Badge>
                </div>
              </div>
              <ArrowDownLeft className="h-8 w-8 text-green-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Outbound (Payables)</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.outbound.totalAmount, 'USD')}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className="bg-green-100 text-green-800 text-xs">
                    {stats.outbound.paid} Paid
                  </Badge>
                  <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                    {stats.outbound.pending} Pending
                  </Badge>
                </div>
              </div>
              <ArrowUpRight className="h-8 w-8 text-purple-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Ephemeral Wallets</p>
                <p className="text-2xl font-bold">{stats.ephemeralWallets.active}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className="bg-green-100 text-green-800 text-xs">
                    Active
                  </Badge>
                  <span className="text-xs text-gray-400">
                    {stats.ephemeralWallets.totalCreated} total created
                  </span>
                </div>
              </div>
              <Wallet className="h-8 w-8 text-orange-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overdue Alert */}
      {(stats.inbound.overdue > 0 || stats.outbound.overdue > 0) && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div className="flex-1">
                <p className="font-medium text-red-900">Overdue Invoices</p>
                <p className="text-sm text-red-700">
                  You have {stats.inbound.overdue + stats.outbound.overdue} overdue invoices requiring attention
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="bg-white"
                onClick={() => {
                  setStatusFilter('overdue')
                  setActiveTab('all')
                }}
              >
                View Overdue
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by invoice number or company..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <select
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as InvoiceStatus | 'all')}
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="partially_paid">Partially Paid</option>
              <option value="overdue">Overdue</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <Button variant="outline" onClick={loadInvoices}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions Bar */}
      <AnimatePresence>
        {showBulkActions && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-900">
                      {selectedInvoices.size} invoice{selectedInvoices.size === 1 ? '' : 's'} selected
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="gradient"
                      size="sm"
                      onClick={handleBulkPayment}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Pay Selected ({selectedInvoices.size})
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedInvoices(new Set())}
                    >
                      Clear Selection
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Invoices Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <div className="flex items-center justify-between">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="all">
              All Invoices ({invoices.length})
            </TabsTrigger>
            <TabsTrigger value="inbound" className="flex items-center gap-2">
              <ArrowDownLeft className="h-4 w-4" />
              Inbound ({invoices.filter(i => i.direction === 'inbound').length})
            </TabsTrigger>
            <TabsTrigger value="outbound" className="flex items-center gap-2">
              <ArrowUpRight className="h-4 w-4" />
              Outbound ({invoices.filter(i => i.direction === 'outbound').length})
            </TabsTrigger>
          </TabsList>

          {/* Select All for Payable Invoices */}
          {filteredInvoices.some(invoice =>
            invoice.direction === 'inbound' && ['pending', 'overdue'].includes(invoice.status)
          ) && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="select-all"
                className="rounded"
                checked={filteredInvoices
                  .filter(invoice => invoice.direction === 'inbound' && ['pending', 'overdue'].includes(invoice.status))
                  .every(invoice => selectedInvoices.has(invoice.id))
                }
                onChange={(e) => handleSelectAll(e.target.checked)}
              />
              <label htmlFor="select-all" className="text-sm text-gray-600">
                Select all payable
              </label>
            </div>
          )}
        </div>

        <TabsContent value={activeTab} className="mt-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading invoices...</p>
            </div>
          ) : filteredInvoices.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Invoices Found</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || statusFilter !== 'all'
                    ? 'No invoices match your search criteria'
                    : 'Start by creating your first invoice'}
                </p>
                <Button variant="gradient" onClick={() => router.push('/invoices/create')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Invoice
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredInvoices.map((invoice) => (
                <motion.div
                  key={invoice.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {/* Checkbox for payable invoices */}
                          {invoice.direction === 'inbound' && ['pending', 'overdue'].includes(invoice.status) && (
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                className="rounded mr-2"
                                checked={selectedInvoices.has(invoice.id)}
                                onChange={(e) => handleInvoiceSelect(invoice.id, e.target.checked)}
                              />
                            </div>
                          )}

                          <div className={`p-3 rounded-lg ${
                            invoice.direction === 'inbound'
                              ? 'bg-green-100'
                              : 'bg-purple-100'
                          }`}>
                            {invoice.direction === 'inbound' ? (
                              <ArrowDownLeft className="h-6 w-6 text-green-600" />
                            ) : (
                              <ArrowUpRight className="h-6 w-6 text-purple-600" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-3">
                              <h3 className="font-semibold text-lg">{invoice.invoiceNumber}</h3>
                              {getStatusBadge(invoice.status)}
                              {invoice.hasEphemeralWallet && (
                                <Badge className={`${
                                  invoice.walletStatus === 'active'
                                    ? 'bg-orange-100 text-orange-800'
                                    : 'bg-gray-100 text-gray-800'
                                } flex items-center gap-1`}>
                                  <Wallet className="h-3 w-3" />
                                  Ephemeral {invoice.walletStatus}
                                </Badge>
                              )}
                            </div>
                            <p className="text-gray-600 mt-1">{invoice.companyName}</p>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                Due {invoice.dueDate.toLocaleDateString()}
                              </span>
                              {invoice.paymentProgress !== undefined && invoice.paymentProgress > 0 && (
                                <span className="flex items-center gap-2">
                                  <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-green-500 transition-all"
                                      style={{ width: `${invoice.paymentProgress}%` }}
                                    />
                                  </div>
                                  <span>{invoice.paymentProgress}%</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-2xl font-bold">
                              {formatCurrency(invoice.amount, invoice.currency)}
                            </p>
                            <p className="text-sm text-gray-500">{invoice.currency}</p>
                          </div>
                          <div className="flex gap-2">
                            {/* Pay Now button for payable invoices */}
                            {invoice.direction === 'inbound' && ['pending', 'overdue'].includes(invoice.status) && (
                              <Button
                                variant="gradient"
                                size="sm"
                                onClick={() => handlePayInvoice(invoice)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CreditCard className="h-4 w-4 mr-2" />
                                Pay Now
                              </Button>
                            )}

                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => router.push(`/invoices/${invoice.id}`)}
                              title="View Invoice"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => {
                                navigator.clipboard.writeText(invoice.invoiceNumber)
                                toast.success('Invoice number copied to clipboard')
                              }}
                              title="Copy Invoice Number"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>

                            {/* More Options Dropdown */}
                            <div className="relative" ref={dropdownRef}>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setOpenDropdown(openDropdown === invoice.id ? null : invoice.id)}
                                title="More Options"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>

                              {openDropdown === invoice.id && (
                                <div className="absolute right-0 top-full mt-1 w-48 bg-white border rounded-lg shadow-lg z-10">
                                  <div className="py-1">
                                    <button
                                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
                                      onClick={() => {
                                        handleDownloadPDF(invoice)
                                        setOpenDropdown(null)
                                      }}
                                    >
                                      <Download className="h-4 w-4" />
                                      Download PDF
                                    </button>
                                    <button
                                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
                                      onClick={() => {
                                        handleShareInvoice(invoice)
                                        setOpenDropdown(null)
                                      }}
                                    >
                                      <Share className="h-4 w-4" />
                                      Share Invoice
                                    </button>
                                    <button
                                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
                                      onClick={() => {
                                        handleDuplicateInvoice(invoice)
                                        setOpenDropdown(null)
                                      }}
                                    >
                                      <Copy className="h-4 w-4" />
                                      Duplicate
                                    </button>
                                    {invoice.status === 'draft' && (
                                      <button
                                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
                                        onClick={() => {
                                          handleEditInvoice(invoice)
                                          setOpenDropdown(null)
                                        }}
                                      >
                                        <Edit className="h-4 w-4" />
                                        Edit
                                      </button>
                                    )}
                                    <button
                                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
                                      onClick={() => {
                                        handleArchiveInvoice(invoice)
                                        setOpenDropdown(null)
                                      }}
                                    >
                                      <Archive className="h-4 w-4" />
                                      Archive
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50">
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="bg-white"
              onClick={() => router.push('/invoices/create?type=inbound')}
            >
              <ArrowDownLeft className="h-4 w-4 mr-2 text-green-600" />
              Request Payment
            </Button>
            <Button
              variant="outline"
              className="bg-white"
              onClick={() => router.push('/invoices/create?type=outbound')}
            >
              <ArrowUpRight className="h-4 w-4 mr-2 text-purple-600" />
              Send Payment
            </Button>
            <Button
              variant="outline"
              className="bg-white"
              onClick={() => router.push('/invoice-wallets')}
            >
              <Wallet className="h-4 w-4 mr-2 text-orange-600" />
              Manage Wallets
            </Button>
            <Button
              variant="outline"
              className="bg-white"
              onClick={() => router.push('/invoices/history')}
            >
              <Clock className="h-4 w-4 mr-2 text-blue-600" />
              View History
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}