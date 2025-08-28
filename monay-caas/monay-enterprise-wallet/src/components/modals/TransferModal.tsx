'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { 
  X, Send, Wallet, Globe, ArrowRight, Info, AlertCircle,
  CheckCircle, Loader2, DollarSign, Building, User
} from 'lucide-react'
import toast from 'react-hot-toast'

interface TransferModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function TransferModal({ isOpen, onClose }: TransferModalProps) {
  const [step, setStep] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)
  const [formData, setFormData] = useState({
    recipientType: 'wallet',
    recipient: '',
    recipientName: '',
    amount: '',
    currency: 'USDM',
    network: 'base',
    memo: '',
    speed: 'standard'
  })

  const handleSubmit = async () => {
    setIsProcessing(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 3000))
    toast.success('Transfer initiated successfully!')
    setIsProcessing(false)
    onClose()
    // Reset form
    setFormData({
      recipientType: 'wallet',
      recipient: '',
      recipientName: '',
      amount: '',
      currency: 'USDM',
      network: 'base',
      memo: '',
      speed: 'standard'
    })
    setStep(1)
  }

  const estimateFee = () => {
    const baseAmount = parseFloat(formData.amount) || 0
    if (formData.speed === 'instant') return (baseAmount * 0.002 + 2).toFixed(2)
    if (formData.speed === 'express') return (baseAmount * 0.001 + 1).toFixed(2)
    return (baseAmount * 0.0005 + 0.5).toFixed(2)
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
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-lg w-full"
          >
            {/* Header */}
            <div className="border-b border-gray-200 dark:border-gray-700 p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Send Money
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Transfer funds instantly to any wallet or account
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
                {[1, 2, 3].map((s) => (
                  <div key={s} className="flex items-center">
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                      ${step >= s 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                      }
                    `}>
                      {s}
                    </div>
                    {s < 3 && (
                      <div className={`w-12 h-1 mx-2 ${
                        step > s ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      Recipient Type
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: 'wallet', icon: Wallet, label: 'Wallet' },
                        { value: 'email', icon: User, label: 'Email' },
                        { value: 'business', icon: Building, label: 'Business' }
                      ].map((type) => (
                        <button
                          key={type.value}
                          onClick={() => setFormData({ ...formData, recipientType: type.value })}
                          className={`
                            p-3 rounded-xl border-2 transition-all
                            ${formData.recipientType === type.value
                              ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                            }
                          `}
                        >
                          <type.icon className="h-5 w-5 mx-auto mb-1" />
                          <p className="text-sm">{type.label}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      {formData.recipientType === 'wallet' ? 'Wallet Address' :
                       formData.recipientType === 'email' ? 'Email Address' :
                       'Business ID'}
                    </label>
                    <input
                      type="text"
                      value={formData.recipient}
                      onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
                      placeholder={
                        formData.recipientType === 'wallet' ? '0x...' :
                        formData.recipientType === 'email' ? 'recipient@example.com' :
                        'BUSINESS-ID'
                      }
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {formData.recipientType !== 'wallet' && (
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                        Recipient Name
                      </label>
                      <input
                        type="text"
                        value={formData.recipientName}
                        onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                        placeholder="John Doe or Acme Corp"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}

                  <Button
                    onClick={() => setStep(2)}
                    disabled={!formData.recipient}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    Continue
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      Amount
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="number"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        placeholder="0.00"
                        className="w-full pl-10 pr-24 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xl font-semibold"
                      />
                      <select
                        value={formData.currency}
                        onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600"
                      >
                        <option value="USDM">USDM</option>
                        <option value="USDC">USDC</option>
                        <option value="USD">USD</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      Network
                    </label>
                    <select
                      value={formData.network}
                      onChange={(e) => setFormData({ ...formData, network: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="base">Base (L2)</option>
                      <option value="solana">Solana</option>
                      <option value="ethereum">Ethereum</option>
                      <option value="polygon">Polygon</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      Transfer Speed
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: 'standard', label: 'Standard', time: '1-3 min', multiplier: '1x' },
                        { value: 'express', label: 'Express', time: '30 sec', multiplier: '2x' },
                        { value: 'instant', label: 'Instant', time: '< 5 sec', multiplier: '4x' }
                      ].map((speed) => (
                        <button
                          key={speed.value}
                          onClick={() => setFormData({ ...formData, speed: speed.value })}
                          className={`
                            p-3 rounded-xl border-2 transition-all
                            ${formData.speed === speed.value
                              ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                            }
                          `}
                        >
                          <p className="font-medium text-sm">{speed.label}</p>
                          <p className="text-xs text-gray-500 mt-1">{speed.time}</p>
                          <p className="text-xs text-blue-600 mt-1">Fee: {speed.multiplier}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      Memo (Optional)
                    </label>
                    <textarea
                      value={formData.memo}
                      onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
                      placeholder="Add a note for this transfer"
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={() => setStep(1)}
                      variant="outline"
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={() => setStep(3)}
                      disabled={!formData.amount || parseFloat(formData.amount) <= 0}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    >
                      Review
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <Card className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                    <h3 className="font-semibold mb-3">Transfer Summary</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Recipient</span>
                        <span className="text-sm font-mono">
                          {formData.recipient.length > 20 
                            ? `${formData.recipient.slice(0, 8)}...${formData.recipient.slice(-8)}`
                            : formData.recipient}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Amount</span>
                        <span className="font-semibold">
                          ${formData.amount} {formData.currency}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Network</span>
                        <span className="capitalize">{formData.network}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Speed</span>
                        <span className="capitalize">{formData.speed}</span>
                      </div>
                      <div className="border-t pt-2 mt-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Network Fee</span>
                          <span className="text-sm">${estimateFee()}</span>
                        </div>
                        <div className="flex justify-between mt-2">
                          <span className="font-semibold">Total</span>
                          <span className="font-bold text-lg">
                            ${(parseFloat(formData.amount) + parseFloat(estimateFee())).toFixed(2)} {formData.currency}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>

                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
                          Important Notice
                        </p>
                        <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                          This transaction cannot be reversed once confirmed. Please verify all details are correct.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={() => setStep(2)}
                      variant="outline"
                      className="flex-1"
                      disabled={isProcessing}
                    >
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
                          Processing...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Confirm Transfer
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