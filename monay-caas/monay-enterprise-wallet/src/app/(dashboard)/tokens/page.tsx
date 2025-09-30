'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import EnhancedTokenManagement from '@/components/EnhancedTokenManagement'
import {
  Coins, Plus, TrendingUp, TrendingDown, Activity,
  Shield, Zap, Globe, BarChart3, Filter, Search,
  RefreshCw, Settings, ChevronRight, AlertCircle
} from 'lucide-react'
import type {
  Token,
  TokenStatus,
  ChainType,
  TokenStandard,
  ComplianceLevel
} from '@/types/token'

export default function TokensPage() {
  const router = useRouter()
  const [tokens, setTokens] = useState<Token[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'paused'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [chainFilter, setChainFilter] = useState<ChainType | 'all'>('all')

  useEffect(() => {
    loadTokens()
  }, [])

  const loadTokens = async () => {
    setLoading(true)
    try {
      // Load tokens from localStorage
      const storedTokens = localStorage.getItem('createdTokens')
      const createdTokens = storedTokens ? JSON.parse(storedTokens) : []

      // Mock data for demonstration
      const mockTokens: Token[] = [
        {
          id: '1',
          contractAddress: '0x1234567890123456789012345678901234567890',
          chainId: 8453,
          metadata: {
            name: 'Enterprise Token',
            symbol: 'ENT',
            decimals: 18,
            description: 'Main enterprise treasury token',
            logo: '/token-logo.png'
          },
          config: {
            standard: 'ERC-3643',
            type: 'fungible',
            chain: 'base',
            complianceLevel: 'institutional',
            supply: {
              initial: BigInt('1000000000000000000000000'),
              max: BigInt('10000000000000000000000000'),
              mintable: true,
              burnable: true,
              pausable: true,
              freezable: true
            },
            roles: {
              minter: ['0xabc...', '0xdef...'],
              admin: ['0x123...']
            }
          },
          status: 'active',
          supply: {
            total: BigInt('1500000000000000000000000'),
            circulating: BigInt('800000000000000000000000'),
            locked: BigInt('500000000000000000000000'),
            burned: BigInt('100000000000000000000000'),
            reserved: BigInt('100000000000000000000000')
          },
          metrics: {
            holders: 1234,
            transactions: 45678,
            volume24h: BigInt('50000000000000000000000'),
            marketCap: BigInt('15000000000000000000000000')
          },
          createdAt: new Date('2025-01-01'),
          deployedAt: new Date('2025-01-02'),
          updatedAt: new Date('2025-09-29')
        },
        {
          id: '2',
          contractAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
          chainId: 1,
          metadata: {
            name: 'Loyalty Points Token',
            symbol: 'LPT',
            decimals: 6,
            description: 'Customer loyalty rewards token'
          },
          config: {
            standard: 'ERC-20',
            type: 'fungible',
            chain: 'ethereum',
            complianceLevel: 'basic',
            supply: {
              initial: BigInt('100000000000'),
              mintable: true,
              burnable: false,
              pausable: false,
              freezable: false
            },
            roles: {
              minter: ['0x456...']
            }
          },
          status: 'active',
          supply: {
            total: BigInt('250000000000'),
            circulating: BigInt('200000000000'),
            locked: BigInt('30000000000'),
            burned: BigInt('0'),
            reserved: BigInt('20000000000')
          },
          metrics: {
            holders: 5678,
            transactions: 123456,
            volume24h: BigInt('10000000000')
          },
          createdAt: new Date('2025-02-01'),
          deployedAt: new Date('2025-02-02'),
          updatedAt: new Date('2025-09-28')
        }
      ]

      // Combine created tokens with mock tokens
      const allTokens = [...createdTokens, ...mockTokens]
      setTokens(allTokens)
    } catch (error) {
      console.error('Failed to load tokens:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatSupply = (value: bigint, decimals: number): string => {
    const divisor = BigInt(10 ** decimals)
    const whole = value / divisor
    return whole.toLocaleString()
  }

  const getStatusBadge = (status: TokenStatus) => {
    const statusConfig = {
      active: 'bg-green-100 text-green-800',
      paused: 'bg-yellow-100 text-yellow-800',
      frozen: 'bg-blue-100 text-blue-800',
      deprecated: 'bg-gray-100 text-gray-800'
    }
    return (
      <Badge className={statusConfig[status]}>
        {status.toUpperCase()}
      </Badge>
    )
  }

  const getChainBadge = (chain: ChainType) => {
    const chainConfig: Record<ChainType, { color: string; icon: string }> = {
      ethereum: { color: 'bg-blue-100 text-blue-800', icon: 'ETH' },
      polygon: { color: 'bg-purple-100 text-purple-800', icon: 'POL' },
      base: { color: 'bg-indigo-100 text-indigo-800', icon: 'BASE' },
      solana: { color: 'bg-green-100 text-green-800', icon: 'SOL' },
      avalanche: { color: 'bg-red-100 text-red-800', icon: 'AVAX' }
    }
    const config = chainConfig[chain]
    return (
      <Badge className={config.color}>
        {config.icon}
      </Badge>
    )
  }

  const filteredTokens = tokens.filter(token => {
    if (activeTab !== 'all' && token.status !== activeTab) return false
    if (chainFilter !== 'all' && token.config.chain !== chainFilter) return false
    if (searchTerm && !token.metadata.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !token.metadata.symbol.toLowerCase().includes(searchTerm.toLowerCase())) return false
    return true
  })

  const stats = {
    totalTokens: tokens.length,
    activeTokens: tokens.filter(t => t.status === 'active').length,
    totalMarketCap: tokens.reduce((sum, t) => sum + Number(t.metrics.marketCap || 0), 0),
    totalHolders: tokens.reduce((sum, t) => sum + t.metrics.holders, 0)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Token Management</h1>
          <p className="text-gray-600 mt-1">
            Create, manage, and monitor your enterprise tokens
          </p>
        </div>
        <Button
          variant="gradient"
          onClick={() => router.push('/tokens/create')}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Token
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Tokens</p>
                <p className="text-2xl font-bold">{stats.totalTokens}</p>
              </div>
              <Coins className="h-8 w-8 text-blue-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Tokens</p>
                <p className="text-2xl font-bold">{stats.activeTokens}</p>
              </div>
              <Activity className="h-8 w-8 text-green-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Market Cap</p>
                <p className="text-2xl font-bold">
                  ${(stats.totalMarketCap / 1e18).toLocaleString()}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Holders</p>
                <p className="text-2xl font-bold">{stats.totalHolders.toLocaleString()}</p>
              </div>
              <Shield className="h-8 w-8 text-orange-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tokens..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <select
              className="px-4 py-2 border rounded-lg"
              value={chainFilter}
              onChange={(e) => setChainFilter(e.target.value as ChainType | 'all')}
            >
              <option value="all">All Chains</option>
              <option value="ethereum">Ethereum</option>
              <option value="polygon">Polygon</option>
              <option value="base">Base</option>
              <option value="solana">Solana</option>
              <option value="avalanche">Avalanche</option>
            </select>
            <Button variant="outline" onClick={loadTokens}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Token Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList>
          <TabsTrigger value="all">All Tokens</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="paused">Paused</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading tokens...</p>
            </div>
          ) : filteredTokens.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Coins className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Tokens Found</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || chainFilter !== 'all'
                    ? 'No tokens match your search criteria'
                    : 'Create your first token to get started'}
                </p>
                <Button variant="gradient" onClick={() => router.push('/tokens/create')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Token
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredTokens.map((token) => (
                <Card key={token.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100">
                          <Coins className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold text-lg">
                              {token.metadata.name}
                            </h3>
                            <Badge variant="outline">{token.metadata.symbol}</Badge>
                            {getStatusBadge(token.status)}
                            {getChainBadge(token.config.chain)}
                            {token.config.complianceLevel === 'institutional' && (
                              <Badge className="bg-purple-100 text-purple-800">
                                <Shield className="h-3 w-3 mr-1" />
                                Compliant
                              </Badge>
                            )}
                          </div>
                          <p className="text-gray-600 mt-1">
                            {token.metadata.description}
                          </p>
                          <div className="flex items-center gap-6 mt-3 text-sm text-gray-500">
                            <span>
                              Supply: {formatSupply(token.supply.total, token.metadata.decimals)}
                            </span>
                            <span>
                              Holders: {token.metrics.holders.toLocaleString()}
                            </span>
                            <span>
                              24h Volume: {formatSupply(token.metrics.volume24h, token.metadata.decimals)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/tokens/${token.id}/analytics`)}
                        >
                          <BarChart3 className="h-4 w-4 mr-2" />
                          Analytics
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/tokens/${token.id}/manage`)}
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Manage
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => router.push(`/tokens/${token.id}`)}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Enhanced Token Management Component */}
      <Card>
        <CardHeader>
          <CardTitle>Advanced Token Operations</CardTitle>
          <CardDescription>
            Perform advanced token management operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EnhancedTokenManagement />
        </CardContent>
      </Card>
    </div>
  )
}