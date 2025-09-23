'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Clock, Shield, Zap, Check, X, Info, AlertTriangle,
  Lock, Unlock, Cpu, Eye, EyeOff, RefreshCw, Timer,
  ShieldCheck, Brain, TrendingUp, Users, DollarSign
} from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface WalletModeSelectorProps {
  recommendedMode?: 'ephemeral' | 'persistent' | 'adaptive'
  aiScore?: number
  onModeSelect: (mode: 'ephemeral' | 'persistent' | 'adaptive') => void
  invoiceAmount?: number
  isRecurring?: boolean
  customerType?: string
}

export default function WalletModeSelector({
  recommendedMode,
  aiScore,
  onModeSelect,
  invoiceAmount = 0,
  isRecurring = false,
  customerType = 'standard'
}: WalletModeSelectorProps) {
  const [selectedMode, setSelectedMode] = useState<string | null>(null)
  const [showComparison, setShowComparison] = useState(false)

  const modes = [
    {
      id: 'ephemeral',
      name: 'Ephemeral Wallet',
      icon: Clock,
      gradient: 'from-orange-500 to-red-600',
      description: 'Self-destructing wallet for maximum security',
      pros: [
        '95% security improvement',
        'Automatic key destruction',
        'No permanent attack surface',
        'Perfect for one-time payments'
      ],
      cons: [
        'Time-limited (1hr-365 days)',
        'Cannot be recovered after destruction',
        'Requires transformation for long-term use'
      ],
      features: [
        { icon: Timer, label: 'Auto-expires', value: '24-48 hours default' },
        { icon: ShieldCheck, label: 'Security', value: 'Maximum' },
        { icon: RefreshCw, label: 'Transformable', value: 'Yes' },
        { icon: Lock, label: 'Recovery', value: 'Not possible' }
      ],
      bestFor: ['One-time payments', 'High-risk transactions', 'Anonymous payments'],
      cost: 'Lowest',
      riskScore: 1
    },
    {
      id: 'persistent',
      name: 'Persistent Wallet',
      icon: Shield,
      gradient: 'from-green-500 to-emerald-600',
      description: 'Traditional wallet with permanent storage',
      pros: [
        'No time limits',
        'Full feature access',
        'Recovery options available',
        'Ideal for regular customers'
      ],
      cons: [
        'Permanent attack surface',
        'Requires active management',
        'Higher compliance overhead'
      ],
      features: [
        { icon: Unlock, label: 'Lifetime', value: 'Unlimited' },
        { icon: Shield, label: 'Security', value: 'Standard' },
        { icon: Users, label: 'Multi-sig', value: 'Supported' },
        { icon: RefreshCw, label: 'Recovery', value: 'Available' }
      ],
      bestFor: ['Regular customers', 'Recurring payments', 'Long-term relationships'],
      cost: 'Standard',
      riskScore: 5
    },
    {
      id: 'adaptive',
      name: 'Adaptive Wallet',
      icon: Zap,
      gradient: 'from-blue-500 to-indigo-600',
      description: 'AI-driven wallet that evolves with usage',
      pros: [
        'Best of both worlds',
        'Automatic mode switching',
        'Optimized for each transaction',
        'Machine learning powered'
      ],
      cons: [
        'More complex setup',
        'Requires monitoring',
        'Higher computational cost'
      ],
      features: [
        { icon: Brain, label: 'AI Mode', value: 'Enabled' },
        { icon: TrendingUp, label: 'Optimization', value: 'Continuous' },
        { icon: Eye, label: 'Monitoring', value: 'Real-time' },
        { icon: Cpu, label: 'Quantum', value: 'Ready' }
      ],
      bestFor: ['Variable transaction patterns', 'Mixed customer base', 'Future-proofing'],
      cost: 'Premium',
      riskScore: 3
    }
  ]

  const getRecommendationBadge = (modeId: string) => {
    if (modeId === recommendedMode) {
      return (
        <Badge className="ml-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
          <Brain className="h-3 w-3 mr-1" />
          AI Recommended ({Math.round((aiScore || 0) * 100)}% confidence)
        </Badge>
      )
    }
    return null
  }

  const handleModeSelect = (mode: 'ephemeral' | 'persistent' | 'adaptive') => {
    setSelectedMode(mode)
    onModeSelect(mode)
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* AI Recommendation Banner */}
        {recommendedMode && aiScore && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800"
          >
            <div className="flex items-start gap-3">
              <Brain className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <p className="font-semibold text-blue-900 dark:text-blue-100">
                  AI Recommendation: {modes.find(m => m.id === recommendedMode)?.name}
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  Based on invoice amount (${invoiceAmount.toLocaleString()}),
                  {isRecurring && ' recurring nature,'} and {customerType} customer profile.
                  Confidence: {Math.round((aiScore || 0) * 100)}%
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Mode Selection Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {modes.map((mode, index) => (
            <motion.div
              key={mode.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className={`glass-card h-full cursor-pointer transition-all ${
                  selectedMode === mode.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => handleModeSelect(mode.id as any)}
              >
                {/* Card Header */}
                <CardHeader>
                  <div className={`h-1 bg-gradient-to-r ${mode.gradient} rounded-full mb-4`} />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <mode.icon className="h-6 w-6" />
                      <CardTitle className="text-lg">{mode.name}</CardTitle>
                    </div>
                    {selectedMode === mode.id && (
                      <Check className="h-5 w-5 text-green-600" />
                    )}
                  </div>
                  {getRecommendationBadge(mode.id)}
                  <CardDescription className="mt-2">{mode.description}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Key Features */}
                  <div className="grid grid-cols-2 gap-2">
                    {mode.features.map((feature, idx) => (
                      <div key={idx} className="text-xs">
                        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                          <feature.icon className="h-3 w-3" />
                          <span>{feature.label}</span>
                        </div>
                        <div className="font-medium ml-4">{feature.value}</div>
                      </div>
                    ))}
                  </div>

                  {/* Best For */}
                  <div>
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Best for:</p>
                    <div className="flex flex-wrap gap-1">
                      {mode.bestFor.map((use, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {use}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Cost & Risk */}
                  <div className="flex justify-between items-center pt-2 border-t">
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">{mode.cost}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <AlertTriangle className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">Risk: {mode.riskScore}/10</span>
                    </div>
                  </div>

                  {/* Select Button */}
                  <Button
                    variant={selectedMode === mode.id ? 'gradient' : 'outline'}
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleModeSelect(mode.id as any)
                    }}
                  >
                    {selectedMode === mode.id ? 'Selected' : 'Select'} {mode.name}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Detailed Comparison Toggle */}
        <div className="text-center">
          <Button
            variant="ghost"
            onClick={() => setShowComparison(!showComparison)}
            className="text-sm"
          >
            {showComparison ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {showComparison ? 'Hide' : 'Show'} Detailed Comparison
          </Button>
        </div>

        {/* Detailed Comparison Table */}
        {showComparison && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Detailed Mode Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Feature</th>
                        <th className="text-center p-2">Ephemeral</th>
                        <th className="text-center p-2">Persistent</th>
                        <th className="text-center p-2">Adaptive</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="p-2">Lifetime</td>
                        <td className="text-center p-2">1hr - 365 days</td>
                        <td className="text-center p-2">Unlimited</td>
                        <td className="text-center p-2">Variable</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2">Security Level</td>
                        <td className="text-center p-2">
                          <Badge className="bg-green-100 text-green-700">Maximum</Badge>
                        </td>
                        <td className="text-center p-2">
                          <Badge className="bg-yellow-100 text-yellow-700">Standard</Badge>
                        </td>
                        <td className="text-center p-2">
                          <Badge className="bg-blue-100 text-blue-700">Dynamic</Badge>
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2">Key Management</td>
                        <td className="text-center p-2">Auto-destroy</td>
                        <td className="text-center p-2">Manual</td>
                        <td className="text-center p-2">AI-managed</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2">Quantum-Resistant</td>
                        <td className="text-center p-2"><Check className="h-4 w-4 text-green-600 mx-auto" /></td>
                        <td className="text-center p-2"><Check className="h-4 w-4 text-green-600 mx-auto" /></td>
                        <td className="text-center p-2"><Check className="h-4 w-4 text-green-600 mx-auto" /></td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2">Recovery Options</td>
                        <td className="text-center p-2"><X className="h-4 w-4 text-red-600 mx-auto" /></td>
                        <td className="text-center p-2"><Check className="h-4 w-4 text-green-600 mx-auto" /></td>
                        <td className="text-center p-2"><Check className="h-4 w-4 text-green-600 mx-auto" /></td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2">Transformation</td>
                        <td className="text-center p-2">To Persistent</td>
                        <td className="text-center p-2">N/A</td>
                        <td className="text-center p-2">Automatic</td>
                      </tr>
                      <tr>
                        <td className="p-2">Best Use Case</td>
                        <td className="text-center p-2 text-xs">One-time/High-risk</td>
                        <td className="text-center p-2 text-xs">Regular/Long-term</td>
                        <td className="text-center p-2 text-xs">Variable/Mixed</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Information Footer */}
        <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <p className="text-xs text-blue-700 dark:text-blue-300">
            All wallet modes support quantum-resistant cryptography and comply with NIST SP 800-88 standards.
            You can transform ephemeral wallets to persistent at any time before expiration.
          </p>
        </div>
      </div>
    </TooltipProvider>
  )
}