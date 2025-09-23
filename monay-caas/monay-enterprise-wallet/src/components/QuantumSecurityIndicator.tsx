'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Shield, Lock, Cpu, Eye, AlertTriangle, CheckCircle,
  ShieldCheck, ShieldOff, Key, Fingerprint, Activity,
  Zap, Info, TrendingUp, AlertCircle, RefreshCw
} from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface QuantumSecurityIndicatorProps {
  walletMode?: 'ephemeral' | 'persistent' | 'adaptive'
  quantumEnabled: boolean
  algorithms?: {
    signature: string
    encryption: string
    hash: string
  }
  securityScore?: number
  threatLevel?: 'low' | 'medium' | 'high' | 'critical'
  lastRotation?: Date
  nextRotation?: Date
}

export default function QuantumSecurityIndicator({
  walletMode = 'ephemeral',
  quantumEnabled = true,
  algorithms = {
    signature: 'CRYSTALS-Dilithium-3',
    encryption: 'CRYSTALS-Kyber-1024',
    hash: 'SPHINCS+'
  },
  securityScore = 95,
  threatLevel = 'low',
  lastRotation,
  nextRotation
}: QuantumSecurityIndicatorProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [pulseAnimation, setPulseAnimation] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const getSecurityLevel = () => {
    if (securityScore >= 90) return { level: 'Maximum', color: 'text-green-600', bgColor: 'bg-green-100 dark:bg-green-900/30' }
    if (securityScore >= 70) return { level: 'High', color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-900/30' }
    if (securityScore >= 50) return { level: 'Medium', color: 'text-yellow-600', bgColor: 'bg-yellow-100 dark:bg-yellow-900/30' }
    return { level: 'Low', color: 'text-red-600', bgColor: 'bg-red-100 dark:bg-red-900/30' }
  }

  const getThreatColor = () => {
    switch (threatLevel) {
      case 'low': return 'text-green-600 bg-green-100 dark:bg-green-900/30'
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30'
      case 'high': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30'
      case 'critical': return 'text-red-600 bg-red-100 dark:bg-red-900/30'
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30'
    }
  }

  const getTimeUntilRotation = () => {
    if (!nextRotation) return null
    const diff = nextRotation.getTime() - currentTime.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${minutes}m`
  }

  const security = getSecurityLevel()

  const securityFeatures = [
    {
      name: 'Quantum Resistance',
      status: quantumEnabled,
      icon: Cpu,
      description: 'NIST-approved post-quantum cryptography'
    },
    {
      name: '7-Pass Erasure',
      status: walletMode === 'ephemeral',
      icon: Shield,
      description: 'NIST SP 800-88 compliant destruction'
    },
    {
      name: 'Hybrid Signatures',
      status: quantumEnabled,
      icon: Key,
      description: 'RSA + Dilithium dual signing'
    },
    {
      name: 'Key Rotation',
      status: true,
      icon: RefreshCw,
      description: 'Automatic key rotation every 24h'
    },
    {
      name: 'Zero-Knowledge Proofs',
      status: true,
      icon: Eye,
      description: 'Privacy-preserving compliance'
    },
    {
      name: 'Hardware Security Module',
      status: walletMode !== 'ephemeral',
      icon: Lock,
      description: 'HSM key management'
    }
  ]

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Compact Security Badge */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsExpanded(!isExpanded)}
          className="cursor-pointer"
        >
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Security Shield with Animation */}
                  <div className="relative">
                    {quantumEnabled && pulseAnimation && (
                      <motion.div
                        className="absolute inset-0 bg-green-400 rounded-full"
                        animate={{
                          scale: [1, 1.5, 1.5],
                          opacity: [0.7, 0, 0]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          repeatDelay: 1
                        }}
                      />
                    )}
                    <div className={`p-2 rounded-full ${security.bgColor}`}>
                      {quantumEnabled ? (
                        <ShieldCheck className={`h-6 w-6 ${security.color}`} />
                      ) : (
                        <ShieldOff className="h-6 w-6 text-gray-600" />
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">Quantum Security</h3>
                      <Badge variant="outline" className={security.color}>
                        {security.level}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {quantumEnabled ? 'Quantum-Resistant Protection Active' : 'Standard Encryption'}
                    </p>
                  </div>
                </div>

                {/* Security Score */}
                <div className="text-right">
                  <div className="text-2xl font-bold">{securityScore}%</div>
                  <div className="text-xs text-gray-500">Security Score</div>
                </div>
              </div>

              {/* Quick Status Bar */}
              <div className="mt-3 pt-3 border-t">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-4">
                    <Tooltip>
                      <TooltipTrigger>
                        <div className="flex items-center gap-1">
                          <Activity className="h-3 w-3" />
                          <span>Threat Level: </span>
                          <Badge className={`text-xs px-1 py-0 ${getThreatColor()}`}>
                            {threatLevel.toUpperCase()}
                          </Badge>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Current network threat assessment</p>
                      </TooltipContent>
                    </Tooltip>

                    {nextRotation && (
                      <Tooltip>
                        <TooltipTrigger>
                          <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                            <RefreshCw className="h-3 w-3" />
                            <span>Next rotation: {getTimeUntilRotation()}</span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Automatic key rotation schedule</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>

                  <button
                    className="text-blue-600 hover:text-blue-700 font-medium"
                    onClick={(e) => {
                      e.stopPropagation()
                      setIsExpanded(!isExpanded)
                    }}
                  >
                    {isExpanded ? 'Hide' : 'View'} Details
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Expanded Security Details */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-lg">Security Configuration</CardTitle>
                  <CardDescription>
                    Advanced quantum-resistant cryptographic protection
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Algorithms */}
                  <div>
                    <h4 className="text-sm font-medium mb-2">Quantum Algorithms</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Fingerprint className="h-4 w-4 text-blue-600" />
                          <span className="text-xs font-medium">Signature</span>
                        </div>
                        <p className="text-xs font-mono">{algorithms.signature}</p>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Lock className="h-4 w-4 text-green-600" />
                          <span className="text-xs font-medium">Encryption</span>
                        </div>
                        <p className="text-xs font-mono">{algorithms.encryption}</p>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Shield className="h-4 w-4 text-purple-600" />
                          <span className="text-xs font-medium">Hash</span>
                        </div>
                        <p className="text-xs font-mono">{algorithms.hash}</p>
                      </div>
                    </div>
                  </div>

                  {/* Security Features Grid */}
                  <div>
                    <h4 className="text-sm font-medium mb-2">Security Features</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {securityFeatures.map((feature, index) => (
                        <Tooltip key={index}>
                          <TooltipTrigger>
                            <div
                              className={`p-2 rounded-lg border ${
                                feature.status
                                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                                  : 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <feature.icon
                                  className={`h-4 w-4 ${
                                    feature.status ? 'text-green-600' : 'text-gray-400'
                                  }`}
                                />
                                <span className="text-xs font-medium">{feature.name}</span>
                              </div>
                              <div className="mt-1">
                                {feature.status ? (
                                  <CheckCircle className="h-3 w-3 text-green-600" />
                                ) : (
                                  <AlertCircle className="h-3 w-3 text-gray-400" />
                                )}
                              </div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{feature.description}</p>
                          </TooltipContent>
                        </Tooltip>
                      ))}
                    </div>
                  </div>

                  {/* Security Score Breakdown */}
                  <div>
                    <h4 className="text-sm font-medium mb-2">Security Score Breakdown</h4>
                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span>Cryptographic Strength</span>
                          <span>98%</span>
                        </div>
                        <Progress value={98} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span>Key Management</span>
                          <span>95%</span>
                        </div>
                        <Progress value={95} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span>Network Security</span>
                          <span>92%</span>
                        </div>
                        <Progress value={92} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span>Compliance Adherence</span>
                          <span>96%</span>
                        </div>
                        <Progress value={96} className="h-2" />
                      </div>
                    </div>
                  </div>

                  {/* Security Advisory */}
                  {threatLevel !== 'low' && (
                    <div className={`p-3 rounded-lg ${getThreatColor()}`}>
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Security Advisory</p>
                          <p className="text-xs mt-1">
                            {threatLevel === 'medium' && 'Increased monitoring detected. Key rotation recommended.'}
                            {threatLevel === 'high' && 'Potential quantum threat detected. Enabling additional safeguards.'}
                            {threatLevel === 'critical' && 'Active threat detected. Emergency protocols activated.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Last Activity */}
                  {lastRotation && (
                    <div className="pt-2 border-t">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Last key rotation: {lastRotation.toLocaleDateString()}</span>
                        <span>NIST SP 800-57 Compliant</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </TooltipProvider>
  )
}