'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Clock, Shield, Zap, Cpu, TrendingUp, TrendingDown,
  Activity, AlertTriangle, CheckCircle, Timer, Lock,
  Wallet, FileText, RefreshCw, Eye, Award, Brain
} from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

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

interface InvoiceFirstMetricsProps {
  onNavigate?: (section: string) => void
}

export default function InvoiceFirstMetrics({ onNavigate }: InvoiceFirstMetricsProps) {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [activeEphemeralCount, setActiveEphemeralCount] = useState(12)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
      // Simulate real-time updates
      setActiveEphemeralCount(prev => Math.max(0, prev + Math.floor(Math.random() * 3 - 1)))
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  // Invoice-First specific metrics
  const invoiceMetrics = [
    {
      title: "Active Ephemeral Wallets",
      value: activeEphemeralCount.toString(),
      change: "+3",
      trend: "up",
      icon: Clock,
      color: "from-orange-500 to-red-600",
      description: "Self-destructing wallets currently active",
      detail: "Average TTL: 36 hours"
    },
    {
      title: "Wallets Destroyed Today",
      value: "47",
      change: "+12%",
      trend: "up",
      icon: Shield,
      color: "from-red-500 to-pink-600",
      description: "Securely destroyed after expiration",
      detail: "100% NIST compliant"
    },
    {
      title: "Quantum Security Score",
      value: "98%",
      change: "+2%",
      trend: "up",
      icon: Cpu,
      color: "from-purple-500 to-indigo-600",
      description: "Post-quantum cryptography strength",
      detail: "CRYSTALS-Kyber-1024"
    },
    {
      title: "Compliance Rate",
      value: "99.8%",
      change: "+0.3%",
      trend: "up",
      icon: Award,
      color: "from-green-500 to-emerald-600",
      description: "Zero-knowledge proof verification",
      detail: "Across 5 jurisdictions"
    },
    {
      title: "AI Mode Accuracy",
      value: "94%",
      change: "+1.5%",
      trend: "up",
      icon: Brain,
      color: "from-blue-500 to-cyan-600",
      description: "Correct wallet mode predictions",
      detail: "ML model v2.1"
    },
    {
      title: "Transformation Rate",
      value: "18%",
      change: "-2%",
      trend: "down",
      icon: RefreshCw,
      color: "from-yellow-500 to-orange-600",
      description: "Ephemeral to persistent conversions",
      detail: "Last 30 days"
    }
  ]

  // Real-time wallet lifecycle stats
  const lifecycleStats = {
    created: { count: 156, percentage: 45 },
    active: { count: activeEphemeralCount, percentage: 30 },
    transforming: { count: 3, percentage: 5 },
    destroyed: { count: 47, percentage: 20 }
  }

  // Mode distribution
  const modeDistribution = [
    { mode: 'Ephemeral', count: 124, percentage: 62, icon: Clock, color: 'bg-orange-500' },
    { mode: 'Persistent', count: 56, percentage: 28, icon: Lock, color: 'bg-green-500' },
    { mode: 'Adaptive', count: 20, percentage: 10, icon: Zap, color: 'bg-blue-500' }
  ]

  return (
    <TooltipProvider>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Header Section */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Invoice-First Wallet Metrics
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                Real-time monitoring of quantum-secure wallet system
              </p>
            </div>
            <Badge variant="outline" className="px-3 py-1">
              <Activity className="h-3 w-3 mr-1 text-green-500" />
              Live
            </Badge>
          </div>
        </motion.div>

        {/* Main Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {invoiceMetrics.map((metric, index) => (
            <motion.div key={metric.title} variants={itemVariants}>
              <Card className="glass-card hover:shadow-lg transition-all cursor-pointer"
                    onClick={() => onNavigate?.(metric.title.toLowerCase().replace(/\s+/g, '-'))}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${metric.color}`}>
                      <metric.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        {metric.trend === 'up' ? (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-500" />
                        )}
                        <span className={`text-sm font-medium ${
                          metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {metric.change}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      {metric.title}
                    </p>
                    <p className="text-3xl font-bold mb-2">{metric.value}</p>
                    <Tooltip>
                      <TooltipTrigger>
                        <p className="text-xs text-gray-500 dark:text-gray-500 truncate">
                          {metric.description}
                        </p>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div>
                          <p className="font-medium">{metric.description}</p>
                          <p className="text-xs mt-1">{metric.detail}</p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Wallet Lifecycle Overview */}
        <motion.div variants={itemVariants}>
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Wallet Lifecycle Overview
              </CardTitle>
              <CardDescription>
                Real-time wallet state distribution
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4 mb-4">
                {Object.entries(lifecycleStats).map(([stage, data]) => (
                  <div key={stage} className="text-center">
                    <p className="text-xs text-gray-500 capitalize mb-1">{stage}</p>
                    <p className="text-2xl font-bold">{data.count}</p>
                    <div className="mt-2">
                      <Progress value={data.percentage} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Live Activity Feed */}
              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Timer className="h-4 w-4" />
                  Recent Activity
                </p>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      Ephemeral wallet created for INV-2024-089
                    </span>
                    <span className="text-gray-500">2s ago</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <AlertTriangle className="h-3 w-3 text-orange-500" />
                      Wallet expiring in 10 minutes (ID: 0x3f2...)
                    </span>
                    <span className="text-gray-500">15s ago</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <RefreshCw className="h-3 w-3 text-blue-500" />
                      Wallet transformed to persistent (ID: 0xa8c...)
                    </span>
                    <span className="text-gray-500">1m ago</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Mode Distribution */}
        <motion.div variants={itemVariants}>
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Wallet Mode Distribution
              </CardTitle>
              <CardDescription>
                Current distribution across wallet modes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {modeDistribution.map((mode) => (
                  <div key={mode.mode}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <mode.icon className="h-4 w-4" />
                        <span className="text-sm font-medium">{mode.mode}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">{mode.count} wallets</span>
                        <Badge variant="outline">{mode.percentage}%</Badge>
                      </div>
                    </div>
                    <div className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        className={`absolute left-0 top-0 h-full ${mode.color}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${mode.percentage}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
                <div className="text-center">
                  <p className="text-xs text-gray-500">Avg TTL</p>
                  <p className="text-lg font-bold">36h</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Security Score</p>
                  <p className="text-lg font-bold text-green-600">98%</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">AI Accuracy</p>
                  <p className="text-lg font-bold text-blue-600">94%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Security Alert Banner */}
        <motion.div variants={itemVariants}>
          <div className="p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
              <div>
                <p className="font-semibold text-green-900 dark:text-green-100">
                  System Security Status: Optimal
                </p>
                <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                  All quantum-resistant protocols active. No threats detected in the last 24 hours.
                  Last security audit: {currentTime.toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </TooltipProvider>
  )
}