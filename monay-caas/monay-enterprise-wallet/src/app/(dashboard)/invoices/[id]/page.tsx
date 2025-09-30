'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  ArrowLeft, FileText, Calendar, DollarSign, Building,
  Mail, MapPin, Hash, Wallet, Clock, CheckCircle,
  AlertCircle, Copy, Download, Send, CreditCard,
  QrCode, ExternalLink, RefreshCw, User
} from 'lucide-react'
import toast from 'react-hot-toast'
import type { InvoiceSummary } from '@/types/invoice'

// Mock data - same as invoices page
const mockInvoices: InvoiceSummary[] = [
  // Pending Inbound (Payable)
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
  }
]

export default function InvoiceDetailPage() {
  const router = useRouter()
  const params = useParams()
  const invoiceId = params?.id as string

  const [invoice, setInvoice] = useState<InvoiceSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)

  useEffect(() => {
    // Find invoice by ID
    const foundInvoice = mockInvoices.find(inv => inv.id === invoiceId)
    setInvoice(foundInvoice || null)
    setLoading(false)
  }, [invoiceId])

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      paid: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      overdue: { color: 'bg-red-100 text-red-800', icon: AlertCircle },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    const Icon = config.icon

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {status.toUpperCase()}
      </Badge>
    )
  }

  const formatCurrency = (amount: number, currency: string) => {
    if (currency === 'USD') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(amount)
    }
    return `${amount.toLocaleString()} ${currency}`
  }

  const handlePayInvoice = async () => {
    if (!invoice) return

    setPaying(true)
    try {
      // Simulate payment process
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Update invoice status
      setInvoice(prev => prev ? { ...prev, status: 'paid', paymentProgress: 100 } : null)

      toast.success(`Payment of ${formatCurrency(invoice.amount, invoice.currency)} sent successfully!`)
    } catch (error) {
      toast.error('Payment failed. Please try again.')
    } finally {
      setPaying(false)
    }
  }

  const copyWalletAddress = () => {
    const walletAddress = `0x${Math.random().toString(16).substr(2, 40)}`
    navigator.clipboard.writeText(walletAddress)
    toast.success('Wallet address copied to clipboard')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Invoice Not Found</h3>
            <p className="text-gray-600">The invoice you're looking for doesn't exist or has been removed.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isPayable = invoice.direction === 'inbound' && ['pending', 'overdue'].includes(invoice.status)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{invoice.invoiceNumber}</h1>
            <p className="text-gray-600">
              {invoice.direction === 'inbound' ? 'Inbound Invoice' : 'Outbound Invoice'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {getStatusBadge(invoice.status)}
          {isPayable && (
            <Button
              variant="gradient"
              onClick={handlePayInvoice}
              disabled={paying}
              className="min-w-[120px]"
            >
              {paying ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Paying...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Pay Invoice
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Invoice Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Invoice Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Invoice Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-500">Invoice Number</label>
                  <p className="text-lg font-semibold">{invoice.invoiceNumber}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Amount</label>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(invoice.amount, invoice.currency)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Due Date</label>
                  <p className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    {invoice.dueDate.toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Currency</label>
                  <p className="font-medium">{invoice.currency}</p>
                </div>
              </div>

              {invoice.paymentProgress > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Payment Progress</label>
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${invoice.paymentProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{invoice.paymentProgress}% completed</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Company Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                {invoice.direction === 'inbound' ? 'From' : 'To'}: {invoice.companyName}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-gray-400" />
                <span className="font-medium">{invoice.companyName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <span>billing@{invoice.companyName.toLowerCase().replace(/\s+/g, '')}.com</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span>123 Business Ave, Enterprise City, EC 12345</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Payment Information */}
          {isPayable && invoice.hasEphemeralWallet && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-800">
                  <Wallet className="h-5 w-5" />
                  Payment Wallet
                </CardTitle>
                <CardDescription className="text-green-700">
                  Send {invoice.currency} to this ephemeral wallet address
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-green-700">Wallet Address</label>
                  <div className="mt-1 p-3 bg-white rounded-lg border border-green-200">
                    <p className="text-sm font-mono break-all">0x742d35Cc6634C0532925a3b8D...</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 w-full"
                      onClick={copyWalletAddress}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Address
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-green-700">QR Code</label>
                  <div className="mt-1 p-4 bg-white rounded-lg border border-green-200 text-center">
                    <QrCode className="h-24 w-24 mx-auto text-green-600" />
                    <p className="text-xs text-green-600 mt-2">Scan to pay</p>
                  </div>
                </div>

                <Button
                  variant="gradient"
                  className="w-full"
                  onClick={handlePayInvoice}
                  disabled={paying}
                >
                  {paying ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Pay {formatCurrency(invoice.amount, invoice.currency)}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Send className="h-4 w-4 mr-2" />
                Send Email
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Copy className="h-4 w-4 mr-2" />
                Copy Link
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <ExternalLink className="h-4 w-4 mr-2" />
                View in Explorer
              </Button>
            </CardContent>
          </Card>

          {/* Invoice Status */}
          <Card>
            <CardHeader>
              <CardTitle>Status Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Status</span>
                {getStatusBadge(invoice.status)}
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Type</span>
                <span className="text-sm font-medium">
                  {invoice.direction === 'inbound' ? 'Receivable' : 'Payable'}
                </span>
              </div>
              {invoice.hasEphemeralWallet && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Wallet</span>
                  <Badge
                    variant={invoice.walletStatus === 'active' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {invoice.walletStatus}
                  </Badge>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Created</span>
                <span className="text-sm">Oct 1, 2025</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}