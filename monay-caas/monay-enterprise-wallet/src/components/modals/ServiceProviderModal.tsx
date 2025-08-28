'use client'

import { useState, useEffect } from 'react'
import { X, Phone, Shield, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface ServiceProviderModalProps {
  isOpen: boolean
  onClose: () => void
  onInvoicesImported: (invoices: any[]) => void
}

export default function ServiceProviderModal({ isOpen, onClose, onInvoicesImported }: ServiceProviderModalProps) {
  const [step, setStep] = useState<'mobile' | 'otp' | 'providers' | 'importing'>('mobile')
  const [mobileNumber, setMobileNumber] = useState('') // User enters their number
  const [otp, setOtp] = useState('')
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [providers, setProviders] = useState<any[]>([])
  const [selectedProviders, setSelectedProviders] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [importProgress, setImportProgress] = useState(0)
  const [invoiceCount, setInvoiceCount] = useState(0)
  const [totalAmount, setTotalAmount] = useState(0)

  const handleSendOTP = async () => {
    setLoading(true)
    setError('')
    
    try {
      const response = await fetch('http://localhost:3001/api/oneqa/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ mobileNumber })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setSessionId(data.data.sessionId)
        setStep('otp')
      } else {
        setError(data.message || 'Failed to send OTP')
      }
    } catch (err) {
      setError('Failed to connect to OneQA. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async () => {
    setLoading(true)
    setError('')
    
    try {
      const response = await fetch('http://localhost:3001/api/oneqa/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ sessionId, otp })
      })
      
      const data = await response.json()
      
      if (data.success) {
        // Fetch available providers
        await fetchProviders()
      } else {
        setError(data.message || 'Invalid OTP')
      }
    } catch (err) {
      setError('OTP verification failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const fetchProviders = async () => {
    setLoading(true)
    
    try {
      const response = await fetch(`http://localhost:3001/api/oneqa/providers?sessionId=${sessionId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      const data = await response.json()
      
      if (data.success) {
        // Enhanced provider data with amounts
        const enhancedProviders = data.data.providers.map((p: any) => ({
          ...p,
          displayAmount: p.totalAmount ? `$${p.totalAmount.toFixed(2)}` : null,
          accountCount: p.accounts?.length || 0
        }))
        setProviders(enhancedProviders)
        setStep('providers')
      } else {
        setError('Failed to fetch service providers')
      }
    } catch (err) {
      setError('Failed to load service providers')
    } finally {
      setLoading(false)
    }
  }

  const handleImportInvoices = async () => {
    if (selectedProviders.length === 0) {
      setError('Please select at least one service provider')
      return
    }
    
    setStep('importing')
    setLoading(true)
    setImportProgress(0)
    setInvoiceCount(0)
    setTotalAmount(0)
    
    const allInvoices: any[] = []
    let totalInvoiceAmount = 0
    
    // If all providers selected, fetch all at once
    if (selectedProviders.length === providers.length) {
      try {
        const response = await fetch('http://localhost:3001/api/oneqa/invoices?sessionId=' + sessionId, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
        
        const data = await response.json()
        
        if (data.success) {
          allInvoices.push(...data.data.invoices)
          totalInvoiceAmount = data.data.summary?.totalAmount || 0
          setInvoiceCount(data.data.invoices.length)
          setTotalAmount(totalInvoiceAmount)
          setImportProgress(100)
        }
      } catch (err) {
        console.error('Failed to import all invoices:', err)
      }
    } else {
      // Import selected providers one by one
      const progressPerProvider = 100 / selectedProviders.length
      
      for (let i = 0; i < selectedProviders.length; i++) {
        const providerId = selectedProviders[i]
        
        try {
          const response = await fetch('http://localhost:3001/api/oneqa/import-invoices', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ sessionId, providerId })
          })
          
          const data = await response.json()
          
          if (data.success && data.data) {
            const invoices = data.data.invoices || []
            allInvoices.push(...invoices)
            totalInvoiceAmount += data.data.totalAmount || 0
            setInvoiceCount(prev => prev + invoices.length)
            setTotalAmount(totalInvoiceAmount)
          }
          
          setImportProgress((i + 1) * progressPerProvider)
        } catch (err) {
          console.error(`Failed to import from provider ${providerId}:`, err)
        }
      }
    }
    
    // Format invoices for the parent component
    const formattedInvoices = allInvoices.map(inv => ({
      id: `oneqa-${inv.invoiceNumber}`,
      invoiceNumber: inv.invoiceNumber,
      amount: inv.amount,
      currency: 'USD',
      dueDate: inv.date,
      status: inv.status || 'pending',
      serviceProvider: inv.serviceProvider,
      description: `${inv.serviceProvider} - Invoice ${inv.invoiceNumber}`,
      address: inv.address
    }))
    
    // Send imported invoices back to parent component
    onInvoicesImported(formattedInvoices)
    
    // Clean up session
    await fetch('http://localhost:3001/api/oneqa/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ sessionId })
    })
    
    // Show success message briefly before closing
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setLoading(false)
    onClose()
  }

  const toggleProvider = (providerId: string) => {
    setSelectedProviders(prev =>
      prev.includes(providerId)
        ? prev.filter(id => id !== providerId)
        : [...prev, providerId]
    )
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full shadow-2xl"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Import Service Provider Invoices
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Connect to OneQA to fetch your utility bills
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {error && (
                <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              {/* Step 1: Mobile Number */}
              {step === 'mobile' && (
                <div className="space-y-4">
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
                      <Phone className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Connect to OneQA
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Enter your mobile number to receive a verification code
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Mobile Number
                    </label>
                    <input
                      type="tel"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      className="w-full px-4 py-3 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="+1 234 567 8900"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      Enter your OneQA registered mobile number
                    </p>
                  </div>

                  <button
                    onClick={handleSendOTP}
                    disabled={loading || !mobileNumber}
                    className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Sending OTP...
                      </>
                    ) : (
                      <>
                        <Shield className="h-4 w-4" />
                        Send Verification Code
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Step 2: OTP Verification */}
              {step === 'otp' && (
                <div className="space-y-4">
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
                      <Shield className="h-8 w-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Enter Verification Code
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      We've sent a 6-digit code to your mobile number
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Verification Code
                    </label>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-full px-4 py-3 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-center text-2xl tracking-wider"
                      placeholder="000000"
                      maxLength={6}
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setStep('mobile')}
                      className="flex-1 py-3 border dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleVerifyOTP}
                      disabled={loading || otp.length < 4}
                      className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4" />
                          Verify Code
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Select Service Providers */}
              {step === 'providers' && (
                <div className="space-y-4">
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-4">
                      <FileText className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Select Service Providers
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Choose providers to import invoices from
                    </p>
                  </div>

                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {providers.map((provider) => (
                      <label
                        key={provider.id}
                        className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${
                          selectedProviders.includes(provider.id)
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedProviders.includes(provider.id)}
                          onChange={() => toggleProvider(provider.id)}
                          className="mr-3"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {provider.name}
                          </div>
                          <div className="flex gap-4 text-sm text-gray-500 dark:text-gray-400">
                            {provider.accountNumber && (
                              <span>Account: {provider.accountNumber}</span>
                            )}
                            {provider.displayAmount && (
                              <span className="font-semibold">Total: {provider.displayAmount}</span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          {provider.accountCount > 0 && (
                            <span className="text-sm text-blue-600 dark:text-blue-400">
                              {provider.accountCount} {provider.accountCount === 1 ? 'account' : 'accounts'}
                            </span>
                          )}
                          {provider.hasInvoices && (
                            <span className="text-xs text-green-600 dark:text-green-400 block">
                              {provider.hasInvoices}
                            </span>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>

                  <button
                    onClick={handleImportInvoices}
                    disabled={loading || selectedProviders.length === 0}
                    className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    Import {selectedProviders.length} Provider{selectedProviders.length !== 1 ? 's' : ''} Invoices
                  </button>
                </div>
              )}

              {/* Step 4: Importing Progress */}
              {step === 'importing' && (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
                      <Loader2 className="h-8 w-8 text-blue-600 dark:text-blue-400 animate-spin" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Importing Invoices
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Please wait while we fetch your invoices
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{Math.round(importProgress)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${importProgress}%` }}
                        />
                      </div>
                    </div>
                    
                    {invoiceCount > 0 && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            Invoices Found: <span className="font-semibold">{invoiceCount}</span>
                          </span>
                          {totalAmount > 0 && (
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              Total: <span className="font-semibold text-blue-600 dark:text-blue-400">
                                ${totalAmount.toFixed(2)}
                              </span>
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}