'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Wallet, Shield, Clock, Zap, ChevronRight, ChevronLeft,
  AlertCircle, CheckCircle, Info, TrendingUp, Lock,
  Cpu, Globe, CreditCard, ArrowRightLeft
} from 'lucide-react'
import toast from 'react-hot-toast'
import { invoiceWalletAPI } from '@/lib/api/invoiceWalletAPI'

interface InvoiceWalletWizardProps {
  invoice: any
  onComplete: (wallet: any) => void
  onCancel: () => void
}

export default function InvoiceWalletWizard({ invoice, onComplete, onCancel }: InvoiceWalletWizardProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [walletConfig, setWalletConfig] = useState({
    mode: 'adaptive' as 'ephemeral' | 'persistent' | 'adaptive',
    ttl: 86400, // 24 hours default
    features: [] as string[],
    aiScore: 0.5,
    reasoning: '',
    quantumEnabled: true,
    complianceProofs: true,
    breRecommendations: [] as any[], // Business Rule Engine recommendations
    complianceStatus: null as any
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [isEvaluating, setIsEvaluating] = useState(false)

  const steps = [
    { id: 1, name: 'Mode Selection', icon: Zap },
    { id: 2, name: 'Configuration', icon: Shield },
    { id: 3, name: 'Review & Generate', icon: Wallet }
  ]

  const modeOptions = [
    {
      mode: 'ephemeral',
      name: 'Ephemeral',
      icon: Clock,
      color: 'from-orange-500 to-red-600',
      description: 'Self-destructing wallet for maximum security',
      features: [
        'Auto-destroys after payment',
        '95% reduced attack surface',
        'Perfect for B2B/high-value',
        'No permanent key storage'
      ],
      recommended: invoice.amount > 10000
    },
    {
      mode: 'persistent',
      name: 'Persistent',
      icon: Lock,
      color: 'from-green-500 to-emerald-600',
      description: 'Permanent wallet with consumer features',
      features: [
        'Recurring payments',
        'Multi-currency support',
        'DeFi access',
        'Social payments'
      ],
      recommended: invoice.isRecurring
    },
    {
      mode: 'adaptive',
      name: 'Adaptive',
      icon: Zap,
      color: 'from-blue-500 to-indigo-600',
      description: 'AI-powered mode that can transform',
      features: [
        'Starts ephemeral',
        'Can become persistent',
        'AI-driven decisions',
        'Best of both worlds'
      ],
      recommended: !invoice.amount || (invoice.amount > 1000 && invoice.amount < 10000)
    }
  ]

  const handleModeSelect = async (mode: typeof walletConfig.mode) => {
    setWalletConfig(prev => ({ ...prev, mode }))
    setIsEvaluating(true)

    try {
      // Evaluate invoice with Business Rule Engine
      const breResponse = await fetch('/api/business-rules/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoice: {
            id: invoice.id,
            amount: invoice.amount || 0,
            currency: invoice.currency || 'USD',
            type: invoice.type || 'standard',
            isInternational: invoice.isInternational || false,
            customerType: invoice.customerType || 'new',
            kycStatus: invoice.kycStatus || 'pending',
            paymentMethod: invoice.paymentMethod || 'wallet'
          }
        })
      })

      if (breResponse.ok) {
        const evaluation = await breResponse.json()

        // Use BRE recommendation if available
        const recommendedMode = evaluation.walletMode || mode
        const breReasoning = evaluation.recommendations?.find((r: any) => r.action === 'set_wallet_mode')

        setWalletConfig(prev => ({
          ...prev,
          mode: recommendedMode as any,
          breRecommendations: evaluation.recommendations || [],
          complianceStatus: evaluation.complianceStatus,
          aiScore: recommendedMode === 'ephemeral' ? 0.2 : recommendedMode === 'persistent' ? 0.8 : 0.5,
          reasoning: breReasoning?.message || `Business Rule Engine recommends ${recommendedMode} mode based on transaction analysis.`
        }))
      } else {
        // Fallback to simple logic if BRE is unavailable
        const aiScore = mode === 'ephemeral' ? 0.2 : mode === 'persistent' ? 0.8 : 0.5
        const reasoning = mode === 'ephemeral'
          ? 'High-value transaction detected. Ephemeral mode recommended for security.'
          : mode === 'persistent'
          ? 'Recurring payment structure detected. Persistent mode for convenience.'
          : 'Transaction parameters suggest flexibility needed. Adaptive mode selected.'

        setWalletConfig(prev => ({
          ...prev,
          aiScore,
          reasoning
        }))
      }
    } catch (error) {
      console.warn('BRE evaluation failed, using fallback logic:', error)
      // Fallback logic
      const aiScore = mode === 'ephemeral' ? 0.2 : mode === 'persistent' ? 0.8 : 0.5
      const reasoning = mode === 'ephemeral'
        ? 'High-value transaction detected. Ephemeral mode recommended for security.'
        : mode === 'persistent'
        ? 'Recurring payment structure detected. Persistent mode for convenience.'
        : 'Transaction parameters suggest flexibility needed. Adaptive mode selected.'

      setWalletConfig(prev => ({
        ...prev,
        aiScore,
        reasoning
      }))
    } finally {
      setIsEvaluating(false)
    }
  }

  const handleGenerateWallet = async () => {
    setIsGenerating(true)
    let useLocalStorage = false

    try {
      // Try API first
      try {
        // Check if wallet already exists via API
        const existingWallet = await invoiceWalletAPI.getWalletByInvoice(invoice.id)

        if (existingWallet && existingWallet.status !== 'destroyed') {
          toast.error('A wallet already exists for this invoice!')
          setIsGenerating(false)
          return
        }

        // Generate wallet via API
        const response = await invoiceWalletAPI.generateWallet(invoice.id, {
          mode: walletConfig.mode,
          ttl: walletConfig.mode === 'ephemeral' ? walletConfig.ttl : undefined,
          features: walletConfig.features
        })

        // Extract wallet and card from response
        const generatedWallet = response.wallet || response
        const autoCard = response.card

        // Also save to localStorage for dev/testing
        const localWallets = JSON.parse(localStorage.getItem('invoice_wallets') || '[]')
        localWallets.push({
          ...generatedWallet,
          quantumEnabled: walletConfig.quantumEnabled,
          createdAt: new Date().toISOString(),
          autoCard: autoCard // Include the auto-issued card
        })
        localStorage.setItem('invoice_wallets', JSON.stringify(localWallets))

        // Show success message with card info
        if (autoCard) {
          toast.success(
            <div>
              <div className="font-semibold">✅ Wallet & Card Created!</div>
              <div className="text-sm mt-1">Virtual card {autoCard.cardNumber} auto-issued</div>
              <div className="text-xs opacity-75">Spending limit: ${autoCard.spendingLimit?.toLocaleString() || '10,000'}</div>
            </div>,
            { duration: 5000 }
          )
        } else {
          toast.success('Invoice-First wallet generated successfully!')
        }

        onComplete({ ...generatedWallet, autoCard })

      } catch (apiError: any) {
        // If API fails, fall back to localStorage-only mode
        console.warn('API unavailable, using localStorage fallback:', apiError.message)
        useLocalStorage = true
      }

      if (useLocalStorage) {
        // Check if wallet already exists in localStorage
        const existingWallets = JSON.parse(localStorage.getItem('invoice_wallets') || '[]')
        const existingWallet = existingWallets.find((w: any) => w.invoiceId === invoice.id)

        if (existingWallet && existingWallet.status !== 'destroyed') {
          toast.error('A wallet already exists for this invoice!')
          setIsGenerating(false)
          return
        }

        // Simulate wallet generation for dev/testing
        await new Promise(resolve => setTimeout(resolve, 2000))

        const walletId = `wallet_${Date.now()}`
        const generatedWallet = {
          id: walletId,
          invoiceId: invoice.id,
          mode: walletConfig.mode,
          baseAddress: `0x${Math.random().toString(16).substr(2, 40)}`,
          solanaAddress: `${Math.random().toString(36).substr(2, 44)}`,
          status: 'active',
          features: walletConfig.features,
          ttl: walletConfig.mode === 'ephemeral' ? walletConfig.ttl : null,
          expiresAt: walletConfig.mode === 'ephemeral'
            ? new Date(Date.now() + walletConfig.ttl * 1000).toISOString()
            : null,
          remainingTTL: walletConfig.mode === 'ephemeral' ? walletConfig.ttl : null,
          quantumEnabled: walletConfig.quantumEnabled,
          createdAt: new Date().toISOString()
        }

        // Create auto-issued virtual card (dev mode)
        const autoCard = {
          id: `card_${Date.now()}`,
          walletId: walletId,
          cardNumber: `****-****-****-${Math.floor(1000 + Math.random() * 9000)}`,
          cardType: 'virtual',
          status: 'active',
          spendingLimit: invoice.amount || 10000,
          linkedWallet: generatedWallet.baseAddress,
          isAutoIssued: true,
          createdAt: new Date().toISOString()
        }

        // Save wallet with auto-card to localStorage
        const updatedWallets = JSON.parse(localStorage.getItem('invoice_wallets') || '[]')
        updatedWallets.push({ ...generatedWallet, autoCard })
        localStorage.setItem('invoice_wallets', JSON.stringify(updatedWallets))

        toast.success(
          <div>
            <div className="font-semibold">✅ Wallet & Card Created! (Dev Mode)</div>
            <div className="text-sm mt-1">Virtual card {autoCard.cardNumber} auto-issued</div>
            <div className="text-xs opacity-75">Spending limit: ${autoCard.spendingLimit?.toLocaleString()}</div>
          </div>,
          { duration: 5000 }
        )
        onComplete({ ...generatedWallet, autoCard })
      }
    } catch (error) {
      console.error('Failed to generate wallet:', error)
      toast.error('Failed to generate wallet')
    } finally {
      setIsGenerating(false)
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

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Progress Steps */}
      <div className="flex justify-between mb-8">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center flex-1">
            <div className="flex items-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: currentStep >= step.id ? 1 : 0.8 }}
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center
                  ${currentStep >= step.id
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                  }
                `}
              >
                <step.icon className="h-5 w-5" />
              </motion.div>
              <span className={`ml-2 text-sm font-medium ${
                currentStep >= step.id ? 'text-gray-900 dark:text-white' : 'text-gray-500'
              }`}>
                {step.name}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-4 ${
                currentStep > step.id ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'
              }`} />
            )}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Mode Selection */}
        {currentStep === 1 && (
          <motion.div
            key="step1"
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Select Wallet Mode</CardTitle>
                <CardDescription>
                  Choose how your Invoice-First wallet should operate
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Business Rule Engine Recommendation */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
                >
                  <div className="flex items-start space-x-3">
                    <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                        Business Rule Engine Analysis
                      </p>
                      <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                        {isEvaluating ? (
                          <span className="flex items-center">
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-2" />
                            Evaluating transaction rules...
                          </span>
                        ) : walletConfig.breRecommendations.length > 0 ? (
                          <>
                            {walletConfig.reasoning}
                            {walletConfig.complianceStatus && !walletConfig.complianceStatus.compliant && (
                              <span className="block mt-1 text-orange-600 dark:text-orange-400">
                                ⚠️ Compliance requirements detected
                              </span>
                            )}
                          </>
                        ) : (
                          <>Based on invoice amount (${invoice.amount?.toLocaleString() || '0'}) and transaction type,
                          we recommend <span className="font-semibold">
                            {invoice.amount > 10000 ? 'Ephemeral' : invoice.isRecurring ? 'Persistent' : 'Adaptive'}
                          </span> mode.</>
                        )}
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Mode Options */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {modeOptions.map((option) => (
                    <motion.div
                      key={option.mode}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleModeSelect(option.mode as any)}
                      className={`
                        relative cursor-pointer rounded-xl p-6 border-2 transition-all
                        ${walletConfig.mode === option.mode
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                        }
                      `}
                    >
                      {option.recommended && (
                        <div className="absolute -top-2 -right-2">
                          <span className="px-2 py-1 text-xs font-semibold bg-green-500 text-white rounded-full">
                            Recommended
                          </span>
                        </div>
                      )}

                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${option.color}
                        flex items-center justify-center mb-4`}>
                        <option.icon className="h-6 w-6 text-white" />
                      </div>

                      <h3 className="font-semibold text-lg mb-2">{option.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        {option.description}
                      </p>

                      <ul className="space-y-1">
                        {option.features.map((feature, i) => (
                          <li key={i} className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                            <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 2: Configuration */}
        {currentStep === 2 && (
          <motion.div
            key="step2"
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Configure Wallet</CardTitle>
                <CardDescription>
                  Customize your {walletConfig.mode} wallet settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* TTL Configuration (for ephemeral/adaptive) */}
                {(walletConfig.mode === 'ephemeral' || walletConfig.mode === 'adaptive') && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Wallet Lifetime (TTL)
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { label: '1 Hour', value: 3600 },
                        { label: '24 Hours', value: 86400 },
                        { label: '7 Days', value: 604800 },
                        { label: '30 Days', value: 2592000 }
                      ].map(option => (
                        <Button
                          key={option.value}
                          variant={walletConfig.ttl === option.value ? 'gradient' : 'outline'}
                          size="sm"
                          onClick={() => setWalletConfig(prev => ({ ...prev, ttl: option.value }))}
                        >
                          {option.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Features */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Advanced Features
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={walletConfig.quantumEnabled}
                        onChange={(e) => setWalletConfig(prev => ({
                          ...prev,
                          quantumEnabled: e.target.checked
                        }))}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <div className="flex items-center space-x-2">
                        <Cpu className="h-4 w-4 text-purple-600" />
                        <span className="text-sm font-medium">Quantum-Resistant Security</span>
                      </div>
                    </label>

                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={walletConfig.complianceProofs}
                        onChange={(e) => setWalletConfig(prev => ({
                          ...prev,
                          complianceProofs: e.target.checked
                        }))}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <div className="flex items-center space-x-2">
                        <Shield className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium">Zero-Knowledge Compliance Proofs</span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Security Score */}
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Security Score</span>
                    <span className="text-2xl font-bold text-blue-600">98%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full"
                      style={{ width: '98%' }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 3: Review & Generate */}
        {currentStep === 3 && (
          <motion.div
            key="step3"
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Review & Generate</CardTitle>
                <CardDescription>
                  Confirm your Invoice-First wallet configuration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Configuration Summary */}
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <h4 className="font-medium mb-3">Wallet Configuration</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Mode:</span>
                        <span className="font-medium capitalize">{walletConfig.mode}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Invoice Amount:</span>
                        <span className="font-medium">${invoice.amount?.toLocaleString() || '0'}</span>
                      </div>
                      {walletConfig.mode !== 'persistent' && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Lifetime:</span>
                          <span className="font-medium">{walletConfig.ttl / 3600} hours</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Quantum Security:</span>
                        <span className="font-medium">{walletConfig.quantumEnabled ? 'Enabled' : 'Disabled'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Business Rule Engine Analysis */}
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start space-x-3">
                      <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                          Business Rule Analysis
                        </p>
                        <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                          {walletConfig.reasoning}
                        </p>
                        {walletConfig.breRecommendations.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {walletConfig.breRecommendations.slice(0, 3).map((rec: any, i: number) => (
                              <div key={i} className="flex items-center text-xs">
                                <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                                <span>{rec.message}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Compliance Status */}
                  {walletConfig.complianceStatus && (
                    <div className={`p-4 rounded-lg border ${
                      walletConfig.complianceStatus.compliant
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                        : 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
                    }`}>
                      <div className="flex items-start space-x-3">
                        {walletConfig.complianceStatus.compliant ? (
                          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5" />
                        )}
                        <div>
                          <p className="text-sm font-medium">
                            {walletConfig.complianceStatus.compliant ? 'Compliance Verified' : 'Compliance Requirements'}
                          </p>
                          {walletConfig.complianceStatus.requirements?.length > 0 && (
                            <ul className="mt-1 space-y-1">
                              {walletConfig.complianceStatus.requirements.map((req: any, i: number) => (
                                <li key={i} className="text-xs text-gray-600 dark:text-gray-400">
                                  • {req.type}: {req.message}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Features */}
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <h4 className="font-medium mb-2 flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      Enabled Features
                    </h4>
                    <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                      <li>• Dual-rail blockchain (Base + Solana)</li>
                      <li>• Automatic payment forwarding</li>
                      {walletConfig.quantumEnabled && <li>• CRYSTALS-Kyber quantum encryption</li>}
                      {walletConfig.complianceProofs && <li>• Zero-knowledge tax proofs</li>}
                      {walletConfig.mode === 'adaptive' && <li>• AI-powered transformation</li>}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={currentStep === 1 ? onCancel : () => setCurrentStep(currentStep - 1)}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          {currentStep === 1 ? 'Cancel' : 'Previous'}
        </Button>

        <Button
          variant="gradient"
          onClick={currentStep === 3 ? handleGenerateWallet : () => setCurrentStep(currentStep + 1)}
          disabled={isGenerating}
        >
          {currentStep === 3 ? (
            isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Generating...
              </>
            ) : (
              <>
                Generate Wallet
                <Wallet className="h-4 w-4 ml-2" />
              </>
            )
          ) : (
            <>
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </motion.div>
  )
}