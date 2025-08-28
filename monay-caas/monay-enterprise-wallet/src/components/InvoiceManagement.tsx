'use client'

import { useState } from 'react'
import ServiceProviderModal from '@/components/modals/ServiceProviderModal'

type PaymentMethod = 'card' | 'ach' | 'swift' | 'wallet' | 'usdm'
type InvoiceStatus = 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue' | 'cancelled'
type InvoiceType = 'inbound' | 'outbound'

interface Invoice {
  id: string
  type: InvoiceType
  invoiceNumber: string
  customer: {
    name: string
    email: string
    address: string
  }
  items: {
    description: string
    quantity: number
    unitPrice: number
    total: number
  }[]
  subtotal: number
  tax: number
  total: number
  status: InvoiceStatus
  dueDate: string
  createdDate: string
  paymentMethod?: PaymentMethod
  paymentDetails?: {
    method: string
    transactionId?: string
    paidDate?: string
  }
}

export default function InvoiceManagement() {
  const [activeTab, setActiveTab] = useState<'all' | 'inbound' | 'outbound'>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showServiceProviderModal, setShowServiceProviderModal] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('usdm')

  // Sample invoices
  const [invoices, setInvoices] = useState<Invoice[]>([
    {
      id: '1',
      type: 'outbound',
      invoiceNumber: 'INV-2024-001',
      customer: {
        name: 'Acme Corporation',
        email: 'billing@acme.com',
        address: '123 Business St, San Francisco, CA 94105'
      },
      items: [
        { description: 'Enterprise Token Management Service', quantity: 1, unitPrice: 5000, total: 5000 },
        { description: 'API Integration Support', quantity: 10, unitPrice: 150, total: 1500 }
      ],
      subtotal: 6500,
      tax: 585,
      total: 7085,
      status: 'sent',
      dueDate: '2024-02-15',
      createdDate: '2024-01-15'
    },
    {
      id: '2',
      type: 'inbound',
      invoiceNumber: 'INV-2024-002',
      customer: {
        name: 'CloudTech Solutions',
        email: 'accounts@cloudtech.com',
        address: '456 Tech Ave, Austin, TX 78701'
      },
      items: [
        { description: 'Infrastructure Services', quantity: 1, unitPrice: 3000, total: 3000 }
      ],
      subtotal: 3000,
      tax: 270,
      total: 3270,
      status: 'paid',
      dueDate: '2024-01-30',
      createdDate: '2024-01-10',
      paymentDetails: {
        method: 'USDM',
        transactionId: '0x1234...abcd',
        paidDate: '2024-01-25'
      }
    },
    {
      id: '3',
      type: 'outbound',
      invoiceNumber: 'INV-2024-003',
      customer: {
        name: 'Global Finance Ltd',
        email: 'payments@globalfinance.com',
        address: '789 Wall St, New York, NY 10005'
      },
      items: [
        { description: 'Stablecoin Issuance Platform', quantity: 1, unitPrice: 25000, total: 25000 },
        { description: 'Compliance Module', quantity: 1, unitPrice: 8000, total: 8000 }
      ],
      subtotal: 33000,
      tax: 2970,
      total: 35970,
      status: 'overdue',
      dueDate: '2024-01-05',
      createdDate: '2023-12-05'
    }
  ])

  const filteredInvoices = invoices.filter(inv => 
    activeTab === 'all' || inv.type === activeTab
  )

  const getStatusColor = (status: InvoiceStatus) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-700'
      case 'sent': return 'bg-blue-100 text-blue-700'
      case 'viewed': return 'bg-purple-100 text-purple-700'
      case 'overdue': return 'bg-red-100 text-red-700'
      case 'draft': return 'bg-gray-100 text-gray-700'
      case 'cancelled': return 'bg-gray-100 text-gray-500'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const paymentMethods = [
    { id: 'usdm', name: 'USDM (Monay Coin)', icon: '🪙', desc: 'Instant settlement, lowest fees' },
    { id: 'card', name: 'Credit/Debit Card', icon: '💳', desc: '2.9% + $0.30 fee' },
    { id: 'ach', name: 'ACH Transfer', icon: '🏦', desc: '1-3 business days, $0.50 fee' },
    { id: 'swift', name: 'SWIFT Wire', icon: '🌍', desc: 'International, $25 fee' },
    { id: 'wallet', name: 'Crypto Wallet', icon: '👛', desc: 'ETH, SOL, USDC accepted' }
  ]

  const handlePayInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setShowPaymentModal(true)
  }

  const processPayment = () => {
    // Process payment logic here
    console.log(`Processing ${selectedPaymentMethod} payment for invoice ${selectedInvoice?.invoiceNumber}`)
    setShowPaymentModal(false)
  }

  const handleImportedInvoices = (importedInvoices: any[]) => {
    // Transform imported invoices to match our Invoice interface
    const newInvoices: Invoice[] = importedInvoices.map((inv, index) => ({
      id: `imported-${Date.now()}-${index}`,
      type: 'inbound',
      invoiceNumber: inv.invoiceNumber || inv.externalId,
      customer: {
        name: inv.providerName || inv.provider,
        email: '',
        address: inv.accountNumber || ''
      },
      items: [{
        description: inv.description || `${inv.billingPeriod} Services`,
        quantity: 1,
        unitPrice: inv.amount,
        total: inv.amount
      }],
      subtotal: inv.amount,
      tax: 0,
      total: inv.amount,
      status: inv.status || 'pending',
      dueDate: inv.dueDate,
      createdDate: inv.createdAt || new Date().toISOString()
    }))

    // Add imported invoices to the existing list
    setInvoices(prevInvoices => [...prevInvoices, ...newInvoices])
    setShowServiceProviderModal(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Invoice Management</h2>
          <p className="text-gray-600 mt-1">Manage your inbound and outbound invoices</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowServiceProviderModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
            Import Invoices
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Create Invoice
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <p className="text-sm text-gray-500">Outstanding</p>
          <p className="text-2xl font-bold mt-1">$43,055</p>
          <p className="text-sm text-red-600 mt-1">2 overdue</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <p className="text-sm text-gray-500">Paid (This Month)</p>
          <p className="text-2xl font-bold mt-1">$125,270</p>
          <p className="text-sm text-green-600 mt-1">+12% vs last month</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <p className="text-sm text-gray-500">Pending Payment</p>
          <p className="text-2xl font-bold mt-1">$78,320</p>
          <p className="text-sm text-gray-600 mt-1">5 invoices</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <p className="text-sm text-gray-500">USDM Balance</p>
          <p className="text-2xl font-bold mt-1">250,000 USDM</p>
          <p className="text-sm text-blue-600 mt-1">≈ $250,000 USD</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="border-b">
          <div className="flex gap-6 px-6">
            {(['all', 'inbound', 'outbound'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3 px-1 border-b-2 font-medium text-sm capitalize ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab === 'all' ? 'All Invoices' : `${tab} Invoices`}
              </button>
            ))}
          </div>
        </div>

        {/* Invoice List */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left p-4 text-sm font-medium text-gray-600">Invoice #</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">Type</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">Customer</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">Amount</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">Due Date</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">Status</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 font-medium">{invoice.invoiceNumber}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                      invoice.type === 'inbound' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {invoice.type === 'inbound' ? '↓ Inbound' : '↑ Outbound'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div>
                      <p className="font-medium">{invoice.customer.name}</p>
                      <p className="text-sm text-gray-500">{invoice.customer.email}</p>
                    </div>
                  </td>
                  <td className="p-4 font-bold">${invoice.total.toLocaleString()}</td>
                  <td className="p-4 text-sm">{invoice.dueDate}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(invoice.status)}`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      {invoice.type === 'inbound' && invoice.status !== 'paid' && (
                        <button
                          onClick={() => handlePayInvoice(invoice)}
                          className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                        >
                          Pay
                        </button>
                      )}
                      <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">
                        View
                      </button>
                      {invoice.type === 'outbound' && invoice.status === 'draft' && (
                        <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                          Send
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h3 className="text-xl font-bold">Pay Invoice {selectedInvoice.invoiceNumber}</h3>
              <p className="text-gray-600 mt-1">Amount: ${selectedInvoice.total.toLocaleString()}</p>
            </div>

            <div className="p-6">
              <h4 className="font-medium mb-4">Select Payment Method</h4>
              
              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <label
                    key={method.id}
                    className={`flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedPaymentMethod === method.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{method.icon}</span>
                      <div>
                        <p className="font-medium">{method.name}</p>
                        <p className="text-sm text-gray-500">{method.desc}</p>
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.id}
                      checked={selectedPaymentMethod === method.id}
                      onChange={(e) => setSelectedPaymentMethod(e.target.value as PaymentMethod)}
                      className="w-4 h-4 text-blue-600"
                    />
                  </label>
                ))}
              </div>

              {/* Payment Details Form */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                {selectedPaymentMethod === 'usdm' && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Pay with USDM from your wallet</p>
                    <p className="font-medium">Available Balance: 250,000 USDM</p>
                    <p className="text-sm text-green-600 mt-2">✓ Instant settlement</p>
                    <p className="text-sm text-green-600">✓ Lowest transaction fees (0.1%)</p>
                    <p className="text-sm text-green-600">✓ Automatic reconciliation</p>
                  </div>
                )}
                
                {selectedPaymentMethod === 'card' && (
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Card Number"
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="MM/YY"
                        className="px-3 py-2 border rounded-lg"
                      />
                      <input
                        type="text"
                        placeholder="CVV"
                        className="px-3 py-2 border rounded-lg"
                      />
                    </div>
                  </div>
                )}
                
                {selectedPaymentMethod === 'ach' && (
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Routing Number"
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                    <input
                      type="text"
                      placeholder="Account Number"
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                )}
                
                {selectedPaymentMethod === 'swift' && (
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="SWIFT/BIC Code"
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                    <input
                      type="text"
                      placeholder="IBAN"
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                )}
                
                {selectedPaymentMethod === 'wallet' && (
                  <div className="space-y-3">
                    <select className="w-full px-3 py-2 border rounded-lg">
                      <option>Select Cryptocurrency</option>
                      <option>USDC (Ethereum)</option>
                      <option>USDC (Solana)</option>
                      <option>ETH</option>
                      <option>SOL</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Wallet Address"
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                )}
              </div>

              {/* Summary */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span>Subtotal</span>
                  <span className="font-medium">${selectedInvoice.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Tax</span>
                  <span className="font-medium">${selectedInvoice.tax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Processing Fee</span>
                  <span className="font-medium">
                    {selectedPaymentMethod === 'usdm' && '$2.50'}
                    {selectedPaymentMethod === 'card' && '$' + (selectedInvoice.total * 0.029 + 0.30).toFixed(2)}
                    {selectedPaymentMethod === 'ach' && '$0.50'}
                    {selectedPaymentMethod === 'swift' && '$25.00'}
                    {selectedPaymentMethod === 'wallet' && '$5.00'}
                  </span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="font-bold">Total</span>
                    <span className="font-bold text-lg">
                      ${(selectedInvoice.total + 
                        (selectedPaymentMethod === 'usdm' ? 2.50 :
                         selectedPaymentMethod === 'card' ? (selectedInvoice.total * 0.029 + 0.30) :
                         selectedPaymentMethod === 'ach' ? 0.50 :
                         selectedPaymentMethod === 'swift' ? 25.00 : 5.00)
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t flex justify-end gap-3">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={processPayment}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Process Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Service Provider Modal */}
      <ServiceProviderModal
        isOpen={showServiceProviderModal}
        onClose={() => setShowServiceProviderModal(false)}
        onInvoicesImported={handleImportedInvoices}
      />

      {/* Create Invoice Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h3 className="text-xl font-bold">Create New Invoice</h3>
            </div>
            
            <div className="p-6">
              {/* Add invoice creation form here */}
              <p className="text-gray-600">Invoice creation form would go here...</p>
            </div>
            
            <div className="p-6 border-t flex justify-end gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Create Invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}