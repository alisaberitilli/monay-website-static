'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Shield, CheckCircle, XCircle, AlertTriangle, Eye, EyeOff,
  FileCheck, Globe, Lock, Unlock, Download, Share2,
  TrendingUp, Calendar, Clock, Info, ChevronRight,
  FileText, Fingerprint, Award, AlertCircle
} from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'

interface ComplianceProof {
  id: string
  type: 'kyc' | 'aml' | 'tax' | 'sanctions' | 'risk'
  jurisdiction: string
  status: 'valid' | 'expired' | 'pending' | 'rejected'
  issuedAt: Date
  expiresAt: Date
  verifierPublicKey: string
  proofHash: string
  disclosureLevel: 'minimal' | 'partial' | 'full'
  score?: number
}

interface ComplianceProofViewerProps {
  walletId: string
  proofs?: ComplianceProof[]
  onGenerateProof?: (type: string, jurisdiction: string) => void
  onVerifyProof?: (proofId: string) => void
  onShareProof?: (proofId: string, recipient: string) => void
}

export default function ComplianceProofViewer({
  walletId,
  proofs = [],
  onGenerateProof,
  onVerifyProof,
  onShareProof
}: ComplianceProofViewerProps) {
  const [selectedProof, setSelectedProof] = useState<ComplianceProof | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [disclosureMode, setDisclosureMode] = useState<'minimal' | 'partial' | 'full'>('minimal')

  // Mock data for demonstration
  const mockProofs: ComplianceProof[] = proofs.length > 0 ? proofs : [
    {
      id: '1',
      type: 'kyc',
      jurisdiction: 'US',
      status: 'valid',
      issuedAt: new Date('2025-01-01'),
      expiresAt: new Date('2026-01-01'),
      verifierPublicKey: '0x1234...5678',
      proofHash: 'zk-proof-hash-1234',
      disclosureLevel: 'partial',
      score: 95
    },
    {
      id: '2',
      type: 'aml',
      jurisdiction: 'EU',
      status: 'valid',
      issuedAt: new Date('2025-01-15'),
      expiresAt: new Date('2025-07-15'),
      verifierPublicKey: '0xabcd...ef01',
      proofHash: 'zk-proof-hash-5678',
      disclosureLevel: 'minimal',
      score: 88
    },
    {
      id: '3',
      type: 'tax',
      jurisdiction: 'UK',
      status: 'pending',
      issuedAt: new Date('2025-01-20'),
      expiresAt: new Date('2025-12-31'),
      verifierPublicKey: '0x9876...5432',
      proofHash: 'zk-proof-hash-9012',
      disclosureLevel: 'full',
      score: 0
    }
  ]

  const jurisdictions = [
    { code: 'US', name: 'United States', flag: '🇺🇸', requirements: ['KYC', 'AML', 'Tax'] },
    { code: 'EU', name: 'European Union', flag: '🇪🇺', requirements: ['KYC', 'AML', 'GDPR'] },
    { code: 'UK', name: 'United Kingdom', flag: '🇬🇧', requirements: ['KYC', 'AML', 'Tax'] },
    { code: 'JP', name: 'Japan', flag: '🇯🇵', requirements: ['KYC', 'AML'] },
    { code: 'SG', name: 'Singapore', flag: '🇸🇬', requirements: ['KYC', 'AML', 'MAS'] }
  ]

  const getProofIcon = (type: string) => {
    switch (type) {
      case 'kyc': return Fingerprint
      case 'aml': return Shield
      case 'tax': return FileText
      case 'sanctions': return Globe
      case 'risk': return AlertTriangle
      default: return FileCheck
    }
  }

  const getProofColor = (type: string) => {
    switch (type) {
      case 'kyc': return 'from-blue-500 to-indigo-600'
      case 'aml': return 'from-green-500 to-emerald-600'
      case 'tax': return 'from-purple-500 to-pink-600'
      case 'sanctions': return 'from-orange-500 to-red-600'
      case 'risk': return 'from-yellow-500 to-orange-600'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'valid': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'expired': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      case 'pending': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'rejected': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
    }
  }

  const getDisclosureIcon = (level: string) => {
    switch (level) {
      case 'minimal': return <EyeOff className="h-3 w-3" />
      case 'partial': return <Eye className="h-3 w-3" />
      case 'full': return <Unlock className="h-3 w-3" />
      default: return <Lock className="h-3 w-3" />
    }
  }

  const calculateComplianceScore = () => {
    const validProofs = mockProofs.filter(p => p.status === 'valid')
    if (mockProofs.length === 0) return 0
    return Math.round((validProofs.length / mockProofs.length) * 100)
  }

  const complianceScore = calculateComplianceScore()

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Compliance Overview Card */}
        <Card className="glass-card">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Compliance Status
                </CardTitle>
                <CardDescription>
                  Zero-knowledge proof verification across jurisdictions
                </CardDescription>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">{complianceScore}%</div>
                <p className="text-xs text-gray-500">Compliance Score</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Quick Stats */}
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {mockProofs.filter(p => p.status === 'valid').length}
                </div>
                <p className="text-xs text-gray-500">Valid Proofs</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {mockProofs.filter(p => p.status === 'pending').length}
                </div>
                <p className="text-xs text-gray-500">Pending</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {mockProofs.filter(p => p.status === 'expired').length}
                </div>
                <p className="text-xs text-gray-500">Expired</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {jurisdictions.filter(j =>
                    mockProofs.some(p => p.jurisdiction === j.code && p.status === 'valid')
                  ).length}
                </div>
                <p className="text-xs text-gray-500">Jurisdictions</p>
              </div>
            </div>

            {/* Jurisdiction Coverage */}
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm font-medium mb-2">Jurisdiction Coverage</p>
              <div className="flex flex-wrap gap-2">
                {jurisdictions.map((jurisdiction) => {
                  const hasValidProof = mockProofs.some(
                    p => p.jurisdiction === jurisdiction.code && p.status === 'valid'
                  )
                  return (
                    <Tooltip key={jurisdiction.code}>
                      <TooltipTrigger>
                        <Badge
                          variant={hasValidProof ? 'default' : 'outline'}
                          className={hasValidProof ? 'bg-green-600' : ''}
                        >
                          <span className="mr-1">{jurisdiction.flag}</span>
                          {jurisdiction.code}
                          {hasValidProof && <CheckCircle className="h-3 w-3 ml-1" />}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div>
                          <p className="font-medium">{jurisdiction.name}</p>
                          <p className="text-xs">Requirements: {jurisdiction.requirements.join(', ')}</p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Proof Management Tabs */}
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="active">Active Proofs</TabsTrigger>
            <TabsTrigger value="generate">Generate New</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {mockProofs.filter(p => p.status === 'valid' || p.status === 'pending').map((proof) => {
              const ProofIcon = getProofIcon(proof.type)
              return (
                <motion.div
                  key={proof.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.01 }}
                >
                  <Card className="glass-card cursor-pointer" onClick={() => setSelectedProof(proof)}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg bg-gradient-to-r ${getProofColor(proof.type)}`}>
                            <ProofIcon className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold capitalize">{proof.type} Verification</h4>
                              <Badge className={getStatusColor(proof.status)}>
                                {proof.status}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {getDisclosureIcon(proof.disclosureLevel)}
                                {proof.disclosureLevel}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Globe className="h-3 w-3" />
                                {proof.jurisdiction}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Expires: {proof.expiresAt.toLocaleDateString()}
                              </span>
                              {proof.score && (
                                <span className="flex items-center gap-1">
                                  <TrendingUp className="h-3 w-3" />
                                  Score: {proof.score}%
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onVerifyProof?.(proof.id)
                                }}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Verify Proof</p>
                            </TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onShareProof?.(proof.id, 'regulator')
                                }}
                              >
                                <Share2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Share Proof</p>
                            </TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  // Download proof
                                }}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Download Proof</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </div>

                      {/* Proof Hash Preview */}
                      <div className="mt-3 p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs font-mono">
                        Proof Hash: {proof.proofHash}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </TabsContent>

          <TabsContent value="generate" className="space-y-4">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Generate New Compliance Proof</CardTitle>
                <CardDescription>
                  Create zero-knowledge proofs for regulatory compliance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Proof Type Selection */}
                <div>
                  <p className="text-sm font-medium mb-2">Select Proof Type</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {['kyc', 'aml', 'tax', 'sanctions', 'risk'].map((type) => {
                      const Icon = getProofIcon(type)
                      return (
                        <Button
                          key={type}
                          variant="outline"
                          className="justify-start"
                          onClick={() => onGenerateProof?.(type, 'US')}
                        >
                          <Icon className="h-4 w-4 mr-2" />
                          <span className="capitalize">{type}</span>
                        </Button>
                      )
                    })}
                  </div>
                </div>

                {/* Jurisdiction Selection */}
                <div>
                  <p className="text-sm font-medium mb-2">Select Jurisdiction</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {jurisdictions.map((j) => (
                      <Button
                        key={j.code}
                        variant="outline"
                        className="justify-start"
                        onClick={() => onGenerateProof?.('kyc', j.code)}
                      >
                        <span className="mr-2">{j.flag}</span>
                        {j.name}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Disclosure Level */}
                <div>
                  <p className="text-sm font-medium mb-2">Disclosure Level</p>
                  <div className="grid grid-cols-3 gap-3">
                    <Button
                      variant={disclosureMode === 'minimal' ? 'gradient' : 'outline'}
                      onClick={() => setDisclosureMode('minimal')}
                    >
                      <EyeOff className="h-4 w-4 mr-2" />
                      Minimal
                    </Button>
                    <Button
                      variant={disclosureMode === 'partial' ? 'gradient' : 'outline'}
                      onClick={() => setDisclosureMode('partial')}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Partial
                    </Button>
                    <Button
                      variant={disclosureMode === 'full' ? 'gradient' : 'outline'}
                      onClick={() => setDisclosureMode('full')}
                    >
                      <Unlock className="h-4 w-4 mr-2" />
                      Full
                    </Button>
                  </div>
                </div>

                <Button variant="gradient" className="w-full">
                  Generate Proof
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Proof History</CardTitle>
                <CardDescription>
                  All generated and expired compliance proofs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {mockProofs.map((proof) => (
                    <div
                      key={proof.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800"
                    >
                      <div className="flex items-center gap-3">
                        {getProofIcon(proof.type)({ className: 'h-4 w-4 text-gray-500' })}
                        <div>
                          <p className="text-sm font-medium capitalize">{proof.type}</p>
                          <p className="text-xs text-gray-500">
                            {proof.jurisdiction} • {proof.issuedAt.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(proof.status)}>
                        {proof.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Information Footer */}
        <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <p className="text-xs text-blue-700 dark:text-blue-300">
            Zero-knowledge proofs allow you to prove compliance without revealing sensitive data.
            All proofs are cryptographically secure and verifiable on-chain.
          </p>
        </div>
      </div>
    </TooltipProvider>
  )
}