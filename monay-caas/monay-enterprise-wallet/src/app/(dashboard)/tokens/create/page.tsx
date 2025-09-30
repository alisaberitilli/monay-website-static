'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Coins, ArrowLeft, Rocket, Shield, Settings,
  Info, AlertCircle, Check, ChevronRight,
  Globe, Zap, Lock, Users
} from 'lucide-react'
import toast from 'react-hot-toast'
import type {
  TokenStandard,
  TokenType,
  ChainType,
  ComplianceLevel,
  CreateTokenRequest,
  TokenConfig,
  TokenMetadata
} from '@/types/token'

interface StepProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  isActive: boolean;
  isCompleted: boolean;
}

const StepIndicator: React.FC<StepProps> = ({ title, description, icon, isActive, isCompleted }) => (
  <div className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all ${
    isActive ? 'border-blue-500 bg-blue-50' :
    isCompleted ? 'border-green-500 bg-green-50' : 'border-gray-200'
  }`}>
    <div className={`p-3 rounded-full ${
      isActive ? 'bg-blue-500 text-white' :
      isCompleted ? 'bg-green-500 text-white' : 'bg-gray-100'
    }`}>
      {isCompleted ? <Check className="h-5 w-5" /> : icon}
    </div>
    <div className="flex-1">
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  </div>
)

export default function CreateTokenPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [creating, setCreating] = useState(false)

  // Token Metadata State
  const [metadata, setMetadata] = useState<TokenMetadata>({
    name: '',
    symbol: '',
    decimals: 18,
    description: '',
    logo: '',
    website: ''
  })

  // Token Configuration State
  const [standard, setStandard] = useState<TokenStandard>('ERC-3643')
  const [tokenType, setTokenType] = useState<TokenType>('fungible')
  const [chain, setChain] = useState<ChainType>('base')
  const [complianceLevel, setComplianceLevel] = useState<ComplianceLevel>('institutional')

  // Supply Configuration
  const [initialSupply, setInitialSupply] = useState('1000000')
  const [maxSupply, setMaxSupply] = useState('10000000')
  const [mintable, setMintable] = useState(true)
  const [burnable, setBurnable] = useState(true)
  const [pausable, setPausable] = useState(true)
  const [freezable, setFreezable] = useState(false)

  // Compliance Settings
  const [kycRequired, setKycRequired] = useState(true)
  const [accreditationRequired, setAccreditationRequired] = useState(false)
  const [whitelistRequired, setWhitelistRequired] = useState(false)

  const steps = [
    { title: 'Basic Information', description: 'Token name and details', icon: <Info className="h-5 w-5" /> },
    { title: 'Configuration', description: 'Chain and standards', icon: <Settings className="h-5 w-5" /> },
    { title: 'Supply & Features', description: 'Token economics', icon: <Coins className="h-5 w-5" /> },
    { title: 'Compliance', description: 'Regulatory settings', icon: <Shield className="h-5 w-5" /> },
    { title: 'Review & Deploy', description: 'Final review', icon: <Rocket className="h-5 w-5" /> }
  ]

  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
      case 1:
        if (!metadata.name || !metadata.symbol) {
          toast.error('Token name and symbol are required')
          return false
        }
        if (metadata.symbol.length > 10) {
          toast.error('Symbol must be 10 characters or less')
          return false
        }
        break
      case 2:
        // Chain and standard are always set
        break
      case 3:
        if (!initialSupply || parseFloat(initialSupply) <= 0) {
          toast.error('Initial supply must be greater than 0')
          return false
        }
        if (maxSupply && parseFloat(maxSupply) < parseFloat(initialSupply)) {
          toast.error('Max supply must be greater than initial supply')
          return false
        }
        break
    }
    return true
  }

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, 5))
    }
  }

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleDeploy = async () => {
    setCreating(true)
    try {
      const request: CreateTokenRequest = {
        metadata,
        config: {
          standard,
          type: tokenType,
          chain,
          complianceLevel,
          supply: {
            initial: BigInt(parseFloat(initialSupply) * 10 ** metadata.decimals),
            max: maxSupply ? BigInt(parseFloat(maxSupply) * 10 ** metadata.decimals) : undefined,
            mintable,
            burnable,
            pausable,
            freezable
          },
          roles: {
            admin: [localStorage.getItem('walletAddress') || '0x...']
          },
          compliance: complianceLevel !== 'none' ? {
            kycRequired,
            accreditationRequired,
            transferRestrictions: {
              whitelistRequired
            }
          } : undefined
        },
        deployImmediately: true,
        testnet: chain !== 'ethereum'
      }

      // Simulate deployment
      await new Promise(resolve => setTimeout(resolve, 3000))

      toast.success('Token created successfully!')
      router.push('/tokens')
    } catch (error) {
      console.error('Failed to create token:', error)
      toast.error('Failed to create token')
    } finally {
      setCreating(false)
    }
  }

  const chainOptions: Array<{ value: ChainType; label: string; icon: string }> = [
    { value: 'ethereum', label: 'Ethereum', icon: 'ETH' },
    { value: 'base', label: 'Base', icon: 'BASE' },
    { value: 'polygon', label: 'Polygon', icon: 'MATIC' },
    { value: 'solana', label: 'Solana', icon: 'SOL' },
    { value: 'avalanche', label: 'Avalanche', icon: 'AVAX' }
  ]

  const standardOptions: Array<{ value: TokenStandard; label: string; description: string }> = [
    { value: 'ERC-3643', label: 'ERC-3643', description: 'Compliant security token standard' },
    { value: 'ERC-20', label: 'ERC-20', description: 'Standard fungible token' },
    { value: 'ERC-721', label: 'ERC-721', description: 'Non-fungible token (NFT)' },
    { value: 'ERC-1155', label: 'ERC-1155', description: 'Multi-token standard' }
  ]

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.push('/tokens')}
            size="icon"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Create Token</h1>
            <p className="text-gray-600 mt-1">
              Deploy a new token with compliance and security features
            </p>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="grid grid-cols-5 gap-4">
        {steps.map((step, index) => (
          <StepIndicator
            key={index}
            {...step}
            isActive={currentStep === index + 1}
            isCompleted={currentStep > index + 1}
          />
        ))}
      </div>

      {/* Step Content */}
      <Card>
        <CardContent className="p-6">
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Basic Token Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="name">Token Name *</Label>
                  <Input
                    id="name"
                    value={metadata.name}
                    onChange={(e) => setMetadata({ ...metadata, name: e.target.value })}
                    placeholder="Enterprise Token"
                  />
                </div>
                <div>
                  <Label htmlFor="symbol">Token Symbol *</Label>
                  <Input
                    id="symbol"
                    value={metadata.symbol}
                    onChange={(e) => setMetadata({ ...metadata, symbol: e.target.value.toUpperCase() })}
                    placeholder="ENT"
                    maxLength={10}
                  />
                </div>
                <div>
                  <Label htmlFor="decimals">Decimals</Label>
                  <Input
                    id="decimals"
                    type="number"
                    value={metadata.decimals}
                    onChange={(e) => setMetadata({ ...metadata, decimals: parseInt(e.target.value) || 18 })}
                    min="0"
                    max="18"
                  />
                </div>
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={metadata.website}
                    onChange={(e) => setMetadata({ ...metadata, website: e.target.value })}
                    placeholder="https://example.com"
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    id="description"
                    className="w-full px-3 py-2 border rounded-lg"
                    rows={3}
                    value={metadata.description}
                    onChange={(e) => setMetadata({ ...metadata, description: e.target.value })}
                    placeholder="Describe your token's purpose and utility..."
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Token Configuration</h2>

              <div>
                <Label>Blockchain Network</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                  {chainOptions.map(option => (
                    <button
                      key={option.value}
                      onClick={() => setChain(option.value)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        chain === option.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Globe className="h-5 w-5 mx-auto mb-2 text-blue-600" />
                      <p className="font-medium">{option.label}</p>
                      <p className="text-xs text-gray-500 mt-1">{option.icon}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label>Token Standard</Label>
                <div className="space-y-3 mt-2">
                  {standardOptions.map(option => (
                    <div
                      key={option.value}
                      onClick={() => setStandard(option.value)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        standard === option.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{option.label}</p>
                          <p className="text-sm text-gray-600">{option.description}</p>
                        </div>
                        {standard === option.value && (
                          <Check className="h-5 w-5 text-blue-600" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Supply & Features</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="initialSupply">Initial Supply *</Label>
                  <Input
                    id="initialSupply"
                    type="number"
                    value={initialSupply}
                    onChange={(e) => setInitialSupply(e.target.value)}
                    placeholder="1000000"
                  />
                </div>
                <div>
                  <Label htmlFor="maxSupply">Maximum Supply (optional)</Label>
                  <Input
                    id="maxSupply"
                    type="number"
                    value={maxSupply}
                    onChange={(e) => setMaxSupply(e.target.value)}
                    placeholder="10000000"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">Token Features</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <Label htmlFor="mintable" className="cursor-pointer">Mintable</Label>
                      <p className="text-sm text-gray-500">Allow creating new tokens</p>
                    </div>
                    <Switch
                      id="mintable"
                      checked={mintable}
                      onCheckedChange={setMintable}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <Label htmlFor="burnable" className="cursor-pointer">Burnable</Label>
                      <p className="text-sm text-gray-500">Allow destroying tokens</p>
                    </div>
                    <Switch
                      id="burnable"
                      checked={burnable}
                      onCheckedChange={setBurnable}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <Label htmlFor="pausable" className="cursor-pointer">Pausable</Label>
                      <p className="text-sm text-gray-500">Allow pausing transfers</p>
                    </div>
                    <Switch
                      id="pausable"
                      checked={pausable}
                      onCheckedChange={setPausable}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <Label htmlFor="freezable" className="cursor-pointer">Freezable</Label>
                      <p className="text-sm text-gray-500">Allow freezing accounts</p>
                    </div>
                    <Switch
                      id="freezable"
                      checked={freezable}
                      onCheckedChange={setFreezable}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Compliance Settings</h2>

              <div>
                <Label>Compliance Level</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {(['none', 'basic', 'enhanced', 'institutional'] as ComplianceLevel[]).map(level => (
                    <button
                      key={level}
                      onClick={() => setComplianceLevel(level)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        complianceLevel === level
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Shield className="h-5 w-5 mx-auto mb-2 text-blue-600" />
                      <p className="font-medium capitalize">{level}</p>
                    </button>
                  ))}
                </div>
              </div>

              {complianceLevel !== 'none' && (
                <div className="space-y-3">
                  <h3 className="font-medium">Compliance Requirements</h3>
                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <Label htmlFor="kyc" className="cursor-pointer">KYC Required</Label>
                      <p className="text-sm text-gray-500">Require identity verification</p>
                    </div>
                    <Switch
                      id="kyc"
                      checked={kycRequired}
                      onCheckedChange={setKycRequired}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <Label htmlFor="accreditation" className="cursor-pointer">Accreditation Required</Label>
                      <p className="text-sm text-gray-500">Require accredited investor status</p>
                    </div>
                    <Switch
                      id="accreditation"
                      checked={accreditationRequired}
                      onCheckedChange={setAccreditationRequired}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <Label htmlFor="whitelist" className="cursor-pointer">Whitelist Required</Label>
                      <p className="text-sm text-gray-500">Restrict transfers to approved addresses</p>
                    </div>
                    <Switch
                      id="whitelist"
                      checked={whitelistRequired}
                      onCheckedChange={setWhitelistRequired}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Review & Deploy</h2>

              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Token Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Name</p>
                        <p className="font-medium">{metadata.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Symbol</p>
                        <p className="font-medium">{metadata.symbol}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Chain</p>
                        <p className="font-medium capitalize">{chain}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Standard</p>
                        <p className="font-medium">{standard}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Initial Supply</p>
                        <p className="font-medium">{initialSupply}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Compliance</p>
                        <p className="font-medium capitalize">{complianceLevel}</p>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <p className="text-sm text-gray-500 mb-2">Features</p>
                      <div className="flex flex-wrap gap-2">
                        {mintable && <Badge>Mintable</Badge>}
                        {burnable && <Badge>Burnable</Badge>}
                        {pausable && <Badge>Pausable</Badge>}
                        {freezable && <Badge>Freezable</Badge>}
                        {kycRequired && <Badge>KYC Required</Badge>}
                        {accreditationRequired && <Badge>Accreditation</Badge>}
                        {whitelistRequired && <Badge>Whitelist</Badge>}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-yellow-900">Important</p>
                      <p className="text-sm text-yellow-700 mt-1">
                        Token deployment is permanent and cannot be undone. Please review all settings carefully.
                        Gas fees will be required for deployment.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
            >
              Back
            </Button>
            {currentStep < 5 ? (
              <Button onClick={handleNext}>
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                variant="gradient"
                onClick={handleDeploy}
                disabled={creating}
              >
                {creating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Deploying...
                  </>
                ) : (
                  <>
                    <Rocket className="h-4 w-4 mr-2" />
                    Deploy Token
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}