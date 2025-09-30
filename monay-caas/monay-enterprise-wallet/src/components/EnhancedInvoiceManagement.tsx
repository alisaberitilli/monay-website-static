'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import CreateInvoiceModal from '@/components/modals/CreateInvoiceModal'
import ServiceProviderModal from '@/components/modals/ServiceProviderModal'
import InvoiceWalletWizard from '@/components/InvoiceWalletWizard'
import {
  Plus, Download, Send, Clock, CheckCircle, XCircle,
  AlertCircle, FileText, DollarSign, Calendar, Filter, Eye,
  Mail, CreditCard, Building, ArrowUpRight, ArrowDownRight,
  Wallet, Zap, Shield, Cpu
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function EnhancedInvoiceManagement() {
  const [activeTab, setActiveTab] = useState('all')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isServiceProviderModalOpen, setIsServiceProviderModalOpen] = useState(false)
  const [isWalletWizardOpen, setIsWalletWizardOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null)
  const [selectedInvoiceForWallet, setSelectedInvoiceForWallet] = useState<any>(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [newlyCreatedInvoice, setNewlyCreatedInvoice] = useState<any>(null)

  const [walletMap, setWalletMap] = useState<any>({})

  // Load existing wallets from localStorage
  useEffect(() => {
    const loadWallets = () => {
      const existingWallets = JSON.parse(localStorage.getItem('invoice_wallets') || '[]')
      const map: any = {}
      existingWallets.forEach((w: any) => {
        if (w.invoiceId && w.status !== 'destroyed') {
          map[w.invoiceId] = w
        }
      })
      setWalletMap(map)
    }

    loadWallets()
    // Refresh wallet status every 5 seconds
    const interval = setInterval(loadWallets, 5000)
    return () => clearInterval(interval)
  }, [])

  const [invoices, setInvoices] = useState([
    {
      id: 'INV-2024-001',
      type: 'outbound',
      client: 'Acme Corporation',
      amount: '$45,000',
      amountNum: 45000,
      status: 'paid',
      dueDate: '2024-01-15',
      paymentMethod: 'USDM',
      description: 'Enterprise Software License',
      icon: '🏢',
      wallet: {
        generated: true,
        mode: 'ephemeral',
        status: 'destroyed',
        baseAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0fEdb',
        solanaAddress: 'DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK'
      }
    },
    {
      id: 'INV-2024-002',
      type: 'inbound',
      vendor: 'Cloud Services Inc',
      amount: '$12,500',
      amountNum: 12500,
      status: 'pending',
      dueDate: '2024-02-01',
      paymentMethod: 'ACH',
      description: 'Infrastructure Services',
      icon: '☁️'
    },
    {
      id: 'INV-2024-003',
      type: 'outbound',
      client: 'Global Retail Ltd',
      amount: '$78,250',
      amountNum: 78250,
      status: 'overdue',
      dueDate: '2024-01-10',
      paymentMethod: 'SWIFT',
      description: 'Payment Processing Services',
      icon: '🛍️',
      isRecurring: true
    },
    {
      id: 'INV-2024-004',
      type: 'inbound',
      vendor: 'Security Systems Pro',
      amount: '$5,800',
      amountNum: 5800,
      status: 'draft',
      dueDate: '2024-02-15',
      paymentMethod: 'Card',
      description: 'Security Audit Services',
      icon: '🔒'
    }
  ])

  const handleImportedInvoices = (importedInvoices: any[]) => {
    // Transform imported invoices to match our format
    const newInvoices = importedInvoices.map((inv, index) => ({
      id: inv.invoiceNumber || inv.externalId || `IMP-${Date.now()}-${index}`,
      type: 'inbound',
      vendor: inv.providerName || inv.provider,
      amount: `$${inv.amount?.toLocaleString() || '0'}`,
      amountNum: inv.amount || 0,
      status: inv.status || 'pending',
      dueDate: inv.dueDate,
      paymentMethod: 'Imported',
      description: inv.description || `${inv.billingPeriod || ''} Services`,
      icon: '📄'
    }))

    // Add imported invoices to the existing list
    setInvoices(prevInvoices => [...prevInvoices, ...newInvoices])
    setIsServiceProviderModalOpen(false)
    toast.success(`Successfully imported ${newInvoices.length} invoices`)
  }

  const handleGenerateWallet = (invoice: any) => {
    // Check if wallet already exists for this invoice
    const existingWallets = JSON.parse(localStorage.getItem('invoice_wallets') || '[]')
    const existingWallet = existingWallets.find((w: any) => w.invoiceId === invoice.id)

    if (existingWallet && existingWallet.status !== 'destroyed') {
      toast.error('A wallet already exists for this invoice!')
      return
    }

    setSelectedInvoiceForWallet(invoice)
    setIsWalletWizardOpen(true)
  }

  const handleWalletGenerated = (wallet: any) => {
    // Update the invoice with the generated wallet
    setInvoices((prevInvoices: any) =>
      prevInvoices.map((inv: any) =>
        inv.id === selectedInvoiceForWallet?.id
          ? {
              ...inv,
              wallet: {
                generated: true,
                mode: wallet.mode,
                status: 'active',
                baseAddress: wallet.baseAddress,
                solanaAddress: wallet.solanaAddress,
                ttl: wallet.ttl,
                expiresAt: wallet.mode === 'ephemeral'
                  ? new Date(Date.now() + (wallet.ttl || 86400) * 1000).toISOString()
                  : null
              }
            }
          : inv
      )
    )

    setIsWalletWizardOpen(false)
    setSelectedInvoiceForWallet(null)
    toast.success('Invoice-First wallet generated successfully!')
  }

  const getWalletModeIcon = (mode: string) => {
    switch (mode) {
      case 'ephemeral':
        return <Clock className="h-3 w-3" />
      case 'persistent':
        return <Shield className="h-3 w-3" />
      case 'adaptive':
        return <Zap className="h-3 w-3" />
      default:
        return <Wallet className="h-3 w-3" />
    }
  }

  const getWalletModeColor = (mode: string) => {
    switch (mode) {
      case 'ephemeral':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
      case 'persistent':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'adaptive':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'paid': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'pending': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'overdue': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      case 'draft': return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'paid': return <CheckCircle className="h-4 w-4" />
      case 'pending': return <Clock className="h-4 w-4" />
      case 'overdue': return <AlertCircle className="h-4 w-4" />
      case 'draft': return <FileText className="h-4 w-4" />
      default: return <AlertCircle className="h-4 w-4" />
    }
  }

  const filteredInvoices = invoices.filter(inv => {
    if (activeTab !== 'all' && inv.type !== activeTab) return false
    if (filterStatus !== 'all' && inv.status !== filterStatus) return false
    return true
  })

  return (
    <>
      <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Invoice Management
          </h2>
          <p className="text-gray-600 mt-1">Manage inbound and outbound invoices</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button 
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg"
            onClick={() => setIsServiceProviderModalOpen(true)}
          >
            <ArrowDownRight className="h-4 w-4 mr-2" />
            Import Invoices
          </Button>
          <Button 
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Invoice
          </Button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Outstanding', value: '$145,550', icon: DollarSign, trend: '+12%' },
          { label: 'Pending Invoices', value: '24', icon: Clock, trend: '+3' },
          { label: 'Overdue', value: '3', icon: AlertCircle, trend: '-1' },
          { label: 'Paid This Month', value: '$380,000', icon: CheckCircle, trend: '+25%' }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card className="glass-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                    <p className="text-xs text-green-600 mt-1">{stat.trend}</p>
                  </div>
                  <stat.icon className="h-8 w-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Tabs and Filters */}
      <motion.div variants={itemVariants}>
        <Card className="glass-card">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div className="flex gap-4">
                {['all', 'inbound', 'outbound'].map((tab) => (
                  <Button
                    key={tab}
                    variant={activeTab === tab ? 'gradient' : 'ghost'}
                    onClick={() => setActiveTab(tab)}
                    className="capitalize"
                  >
                    {tab}
                  </Button>
                ))}
              </div>
              <div className="flex gap-2">
                <select 
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-1.5 border rounded-lg text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="overdue">Overdue</option>
                  <option value="draft">Draft</option>
                </select>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredInvoices.map((invoice, index) => (
                <motion.div
                  key={invoice.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ x: 4 }}
                  className="p-4 border rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{invoice.icon}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{invoice.id}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(invoice.status)}`}>
                          {getStatusIcon(invoice.status)}
                          {invoice.status}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                          {invoice.type}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {invoice.type === 'outbound' ? invoice.client : invoice.vendor} • {invoice.description}
                      </p>
                      <div className="flex gap-4 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Due {invoice.dueDate}
                        </span>
                        <span>{invoice.paymentMethod}</span>
                        {(walletMap[invoice.id] || invoice.wallet) && (
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${getWalletModeColor((walletMap[invoice.id] || invoice.wallet).mode)}`}>
                              {getWalletModeIcon((walletMap[invoice.id] || invoice.wallet).mode)}
                              {(walletMap[invoice.id] || invoice.wallet).mode} wallet
                              {(walletMap[invoice.id] || invoice.wallet).status === 'destroyed' && ' (destroyed)'}
                            </span>
                            {(walletMap[invoice.id]?.autoCard || (invoice.wallet as any)?.autoCard) && (
                              <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium flex items-center gap-1">
                                <CreditCard className="h-3 w-3" />
                                {((walletMap[invoice.id]?.autoCard || (invoice.wallet as any)?.autoCard) as any).cardNumber}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xl font-bold">{invoice.amount}</p>
                    </div>
                    <div className="flex gap-2">
                      {walletMap[invoice.id] ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.location.href = '/invoice-wallets'}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View Wallet
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      )}
                      {!walletMap[invoice.id] && !invoice.wallet && invoice.type === 'outbound' && (
                        <Button
                          variant="gradient"
                          size="sm"
                          onClick={() => handleGenerateWallet(invoice)}
                          className="bg-gradient-to-r from-blue-500 to-indigo-600"
                        >
                          <Wallet className="h-3 w-3 mr-1" />
                          Generate Wallet
                        </Button>
                      )}
                      {invoice.wallet && invoice.status === 'pending' && (
                        <Button variant="gradient" size="sm">
                          <Send className="h-3 w-3 mr-1" />
                          Pay
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>

      {/* Create Invoice Modal */}
      <CreateInvoiceModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onInvoiceCreated={(newInvoice) => {
          // Check if invoice already exists to avoid duplicates
          setInvoices(prev => {
            const exists = prev.some(inv => inv.id === newInvoice.id)
            if (exists) {
              // Update existing invoice instead of adding duplicate
              return prev.map(inv => inv.id === newInvoice.id ? newInvoice : inv)
            }
            // Add new invoice
            return [...prev, newInvoice]
          })

          // Set as newly created invoice for wallet generation prompt
          setNewlyCreatedInvoice(newInvoice)

          // Automatically open wallet wizard for the new invoice
          setTimeout(() => {
            toast(
              (t) => (
                <div>
                  <p className="font-semibold mb-2">Invoice created successfully!</p>
                  <p className="text-sm mb-3">Would you like to generate an Invoice-First wallet for this invoice?</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        toast.dismiss(t.id)
                        setSelectedInvoiceForWallet(newInvoice)
                        setIsWalletWizardOpen(true)
                      }}
                      className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                    >
                      Generate Wallet
                    </button>
                    <button
                      onClick={() => toast.dismiss(t.id)}
                      className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300"
                    >
                      Maybe Later
                    </button>
                  </div>
                </div>
              ),
              {
                duration: 10000,
                position: 'top-center',
              }
            )
          }, 500)
        }}
      />
      
      {/* Service Provider Modal */}
      <ServiceProviderModal
        isOpen={isServiceProviderModalOpen}
        onClose={() => setIsServiceProviderModalOpen(false)}
        onInvoicesImported={handleImportedInvoices}
      />

      {/* Invoice-First Wallet Wizard */}
      {isWalletWizardOpen && selectedInvoiceForWallet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6">
            <InvoiceWalletWizard
              invoice={selectedInvoiceForWallet}
              onComplete={handleWalletGenerated}
              onCancel={() => {
                setIsWalletWizardOpen(false)
                setSelectedInvoiceForWallet(null)
              }}
            />
          </div>
        </div>
      )}
    </>
  )
}