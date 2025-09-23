'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { 
  X, Send, Plus, Trash2, ArrowRight, ArrowLeft, ArrowRightLeft,
  Calendar, DollarSign, Building, Mail, FileText, CreditCard,
  CheckCircle, Loader2, AlertCircle, Copy, User, Wallet, Coins
} from 'lucide-react'
import toast from 'react-hot-toast'

interface CreateInvoiceModalProps {
  isOpen: boolean
  onClose: () => void
  onInvoiceCreated?: (invoice: any) => void
}

interface LineItem {
  id: string
  description: string
  quantity: number
  price: number
  total: number
}

export default function CreateInvoiceModal({ isOpen, onClose, onInvoiceCreated }: CreateInvoiceModalProps) {
  const [step, setStep] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: '1', description: '', quantity: 1, price: 0, total: 0 }
  ])
  const [formData, setFormData] = useState({
    // Step 1 - Recipient
    recipientType: 'email',
    recipientEmail: '',
    recipientName: '',
    recipientCompany: '',
    recipientAddress: '',
    
    // Step 2 - Invoice Details
    invoiceNumber: `INV-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    dueDate: '',
    currency: 'USDM',
    notes: '',
    termsAndConditions: 'Payment is due within the specified timeframe. Late payments may incur additional fees.',
    
    // Step 3 - Payment Methods
    paymentMethods: ['card', 'ach', 'wallet']
  })

  const handleAddLineItem = () => {
    const newItem: LineItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      price: 0,
      total: 0
    }
    setLineItems([...lineItems, newItem])
  }

  const handleRemoveLineItem = (id: string) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter(item => item.id !== id))
    }
  }

  const handleLineItemChange = (id: string, field: keyof LineItem, value: any) => {
    setLineItems(lineItems.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value }
        if (field === 'quantity' || field === 'price') {
          updated.total = updated.quantity * updated.price
        }
        return updated
      }
      return item
    }))
  }

  const calculateSubtotal = () => {
    return lineItems.reduce((sum, item) => sum + item.total, 0)
  }

  const calculateTax = () => {
    return calculateSubtotal() * 0.1 // 10% tax
  }

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax()
  }

  const handleSubmit = async () => {
    console.log('Invoice submission started')
    console.log('Form data:', formData)
    console.log('Line items:', lineItems)

    setIsProcessing(true)

    try {
      // Validate required fields
      if (!formData.recipientName || !formData.recipientEmail) {
        console.log('Validation failed: missing recipient info')
        toast.error('Please fill in recipient name and email')
        setIsProcessing(false)
        setStep(1)
        return
      }

      // Validate line items
      const validLineItems = lineItems.filter(item => item.description && item.price > 0)
      if (validLineItems.length === 0) {
        console.log('Validation failed: no valid line items')
        toast.error('Please add at least one line item with description and price')
        setIsProcessing(false)
        setStep(2)
        return
      }

      console.log('Validation passed, creating invoice...')

      // Create the invoice object
      const newInvoice = {
        id: formData.invoiceNumber,
        type: 'outbound',
        client: formData.recipientName || 'Unknown Client',
        company: formData.recipientCompany || '',
        email: formData.recipientEmail || '',
        address: formData.recipientAddress || '',
        amount: `$${calculateTotal().toFixed(2)}`,
        amountNum: calculateTotal(),
        status: 'pending',
        dueDate: formData.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        paymentMethod: formData.paymentMethods[0] || 'Multiple',
        paymentMethods: formData.paymentMethods,
        description: validLineItems.map(item => item.description).join(', '),
        lineItems: validLineItems,
        currency: formData.currency || 'USDM',
        notes: formData.notes || '',
        termsAndConditions: formData.termsAndConditions || 'Payment is due within the specified timeframe.',
        subtotal: calculateSubtotal(),
        tax: calculateTax(),
        total: calculateTotal(),
        createdAt: new Date().toISOString(),
        icon: '📄',
        isNew: true
      }

      // Save to localStorage
      console.log('Saving invoice to localStorage...')
      const existingInvoices = JSON.parse(localStorage.getItem('invoices') || '[]')
      existingInvoices.push(newInvoice)
      localStorage.setItem('invoices', JSON.stringify(existingInvoices))
      console.log('Invoice saved to localStorage', newInvoice)

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Call the callback if provided
      if (onInvoiceCreated) {
        console.log('Calling onInvoiceCreated callback')
        onInvoiceCreated(newInvoice)
      }

      console.log('Invoice created successfully!')
      toast.success(`Invoice ${formData.invoiceNumber} created successfully!`)

      // Reset form before closing
      setStep(1)
      setLineItems([{ id: '1', description: '', quantity: 1, price: 0, total: 0 }])
      setFormData({
        recipientType: 'email',
        recipientEmail: '',
        recipientName: '',
        recipientCompany: '',
        recipientAddress: '',
        invoiceNumber: `INV-${Date.now() + Math.floor(Math.random() * 10000)}-${Math.random().toString(36).substr(2, 5)}`,
        dueDate: '',
        currency: 'USDM',
        notes: '',
        termsAndConditions: 'Payment is due within the specified timeframe. Late payments may incur additional fees.',
        paymentMethods: ['card', 'ach', 'wallet']
      })

      setIsProcessing(false)
      onClose()
    } catch (error) {
      console.error('Error creating invoice:', error)
      toast.error(`Failed to create invoice: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setIsProcessing(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-6 z-10">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Create Invoice
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Send professional invoices to your clients
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="rounded-xl"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Step Indicator */}
              <div className="flex items-center justify-center mt-6 space-x-2">
                {['Recipient', 'Line Items', 'Payment', 'Review'].map((label, index) => (
                  <div key={index} className="flex items-center">
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                      ${step > index + 1 
                        ? 'bg-green-600 text-white' 
                        : step === index + 1
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                      }
                    `}>
                      {step > index + 1 ? <CheckCircle className="h-4 w-4" /> : index + 1}
                    </div>
                    {index < 3 && (
                      <div className={`w-12 h-1 mx-2 ${
                        step > index + 1 ? 'bg-green-600' : 'bg-gray-200 dark:bg-gray-700'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Step 1: Recipient Information */}
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      Send To
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setFormData({ ...formData, recipientType: 'email' })}
                        className={`
                          p-3 rounded-xl border-2 transition-all flex items-center gap-2
                          ${formData.recipientType === 'email'
                            ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                          }
                        `}
                      >
                        <Mail className="h-5 w-5" />
                        <span>Email Address</span>
                      </button>
                      <button
                        onClick={() => setFormData({ ...formData, recipientType: 'business' })}
                        className={`
                          p-3 rounded-xl border-2 transition-all flex items-center gap-2
                          ${formData.recipientType === 'business'
                            ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                          }
                        `}
                      >
                        <Building className="h-5 w-5" />
                        <span>Business ID</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                        {formData.recipientType === 'email' ? 'Email Address' : 'Business ID'}
                      </label>
                      <input
                        type={formData.recipientType === 'email' ? 'email' : 'text'}
                        value={formData.recipientEmail}
                        onChange={(e) => setFormData({ ...formData, recipientEmail: e.target.value })}
                        placeholder={formData.recipientType === 'email' ? 'client@example.com' : 'BUS-123456'}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                        Contact Name
                      </label>
                      <input
                        type="text"
                        value={formData.recipientName}
                        onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                        placeholder="John Doe"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={formData.recipientCompany}
                      onChange={(e) => setFormData({ ...formData, recipientCompany: e.target.value })}
                      placeholder="Acme Corporation"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      Billing Address
                    </label>
                    <textarea
                      value={formData.recipientAddress}
                      onChange={(e) => setFormData({ ...formData, recipientAddress: e.target.value })}
                      placeholder="123 Business St, Suite 100, City, State 12345"
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <Button
                    onClick={() => setStep(2)}
                    disabled={!formData.recipientEmail || !formData.recipientName}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    Continue
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </motion.div>
              )}

              {/* Step 2: Line Items */}
              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Line Items</h3>
                    <Button
                      onClick={handleAddLineItem}
                      variant="outline"
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Item
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {lineItems.map((item, index) => (
                      <Card key={item.id} className="p-4">
                        <div className="grid grid-cols-12 gap-3">
                          <div className="col-span-5">
                            <label className="text-xs text-gray-500 dark:text-gray-400">Description</label>
                            <input
                              type="text"
                              value={item.description}
                              onChange={(e) => handleLineItemChange(item.id, 'description', e.target.value)}
                              placeholder="Service or product description"
                              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div className="col-span-2">
                            <label className="text-xs text-gray-500 dark:text-gray-400">Quantity</label>
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => handleLineItemChange(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                              min="1"
                              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div className="col-span-2">
                            <label className="text-xs text-gray-500 dark:text-gray-400">Price</label>
                            <input
                              type="number"
                              value={item.price}
                              onChange={(e) => handleLineItemChange(item.id, 'price', parseFloat(e.target.value) || 0)}
                              min="0"
                              step="0.01"
                              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div className="col-span-2">
                            <label className="text-xs text-gray-500 dark:text-gray-400">Total</label>
                            <div className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 font-semibold">
                              ${item.total.toFixed(2)}
                            </div>
                          </div>
                          <div className="col-span-1 flex items-end">
                            <Button
                              onClick={() => handleRemoveLineItem(item.id)}
                              variant="ghost"
                              size="icon"
                              disabled={lineItems.length === 1}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>

                  <Card className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                        <span className="font-semibold">${calculateSubtotal().toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Tax (10%)</span>
                        <span className="font-semibold">${calculateTax().toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-lg border-t pt-2">
                        <span className="font-bold">Total</span>
                        <span className="font-bold">${calculateTotal().toFixed(2)} {formData.currency}</span>
                      </div>
                    </div>
                  </Card>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                        Due Date
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="date"
                          value={formData.dueDate}
                          onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                        Currency
                      </label>
                      <select
                        value={formData.currency}
                        onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="USDM">USDM</option>
                        <option value="USDC">USDC</option>
                        <option value="USD">USD</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={() => setStep(1)}
                      variant="outline"
                      className="flex-1"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back
                    </Button>
                    <Button
                      onClick={() => setStep(3)}
                      disabled={!lineItems.some(item => item.description && item.total > 0) || !formData.dueDate}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    >
                      Continue
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Payment Methods */}
              {step === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Accepted Payment Methods</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: 'card', label: 'Credit/Debit Card', icon: CreditCard },
                        { value: 'ach', label: 'ACH Transfer', icon: Building },
                        { value: 'swift', label: 'SWIFT Wire', icon: ArrowRightLeft },
                        { value: 'wallet', label: 'Digital Wallet', icon: Wallet },
                        { value: 'usdm', label: 'USDM Token', icon: Coins }
                      ].map((method) => (
                        <button
                          key={method.value}
                          onClick={() => {
                            const current = formData.paymentMethods
                            if (current.includes(method.value)) {
                              setFormData({ 
                                ...formData, 
                                paymentMethods: current.filter(m => m !== method.value) 
                              })
                            } else {
                              setFormData({ 
                                ...formData, 
                                paymentMethods: [...current, method.value] 
                              })
                            }
                          }}
                          className={`
                            p-4 rounded-xl border-2 transition-all flex items-center gap-3
                            ${formData.paymentMethods.includes(method.value)
                              ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                            }
                          `}
                        >
                          <method.icon className="h-5 w-5" />
                          <span className="text-sm font-medium">{method.label}</span>
                          {formData.paymentMethods.includes(method.value) && (
                            <CheckCircle className="h-4 w-4 text-blue-600 ml-auto" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      Notes (Optional)
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Add any additional notes or instructions for the client"
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      Terms & Conditions
                    </label>
                    <textarea
                      value={formData.termsAndConditions}
                      onChange={(e) => setFormData({ ...formData, termsAndConditions: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={() => setStep(2)}
                      variant="outline"
                      className="flex-1"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back
                    </Button>
                    <Button
                      onClick={() => setStep(4)}
                      disabled={formData.paymentMethods.length === 0}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    >
                      Review
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Review */}
              {step === 4 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                    <h3 className="font-semibold mb-4">Invoice Summary</h3>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Invoice Number</span>
                        <span className="font-mono text-sm">{formData.invoiceNumber}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Bill To</span>
                        <div className="text-right">
                          <p className="font-semibold text-sm">{formData.recipientName}</p>
                          {formData.recipientCompany && (
                            <p className="text-sm text-gray-600">{formData.recipientCompany}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Due Date</span>
                        <span className="text-sm">{new Date(formData.dueDate).toLocaleDateString()}</span>
                      </div>

                      <div className="border-t pt-3">
                        <h4 className="text-sm font-medium mb-2">Line Items</h4>
                        {lineItems.filter(item => item.description).map((item) => (
                          <div key={item.id} className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600 dark:text-gray-400">
                              {item.description} (x{item.quantity})
                            </span>
                            <span>${item.total.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>

                      <div className="border-t pt-3 space-y-1">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Subtotal</span>
                          <span className="text-sm">${calculateSubtotal().toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Tax</span>
                          <span className="text-sm">${calculateTax().toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg border-t pt-2">
                          <span>Total Due</span>
                          <span>${calculateTotal().toFixed(2)} {formData.currency}</span>
                        </div>
                      </div>
                    </div>
                  </Card>

                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
                          Review Before Sending
                        </p>
                        <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                          Please review all details carefully. The invoice will be sent to {formData.recipientEmail} immediately upon confirmation.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={() => setStep(3)}
                      variant="outline"
                      className="flex-1"
                      disabled={isProcessing}
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      disabled={isProcessing}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Send Invoice
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}