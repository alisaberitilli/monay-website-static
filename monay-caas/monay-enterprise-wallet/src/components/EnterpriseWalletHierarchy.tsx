'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Wallet, CreditCard, Building, Users, User, Plus,
  ChevronRight, ChevronDown, Lock, Shield, Activity,
  DollarSign, Settings, AlertCircle, CheckCircle
} from 'lucide-react'
import toast from 'react-hot-toast'

interface CardData {
  id: string
  cardNumber: string
  holder: string
  role: string
  limit: number
  spent: number
  status: 'active' | 'frozen' | 'pending'
  type: 'virtual' | 'physical'
  isAutoIssued?: boolean
}

interface WalletNode {
  id: string
  name: string
  type: 'treasury' | 'department' | 'team' | 'individual'
  balance: number
  limit: number
  cards: CardData[]
  children?: WalletNode[]
  expanded?: boolean
}

export default function EnterpriseWalletHierarchy() {
  const [selectedWallet, setSelectedWallet] = useState<WalletNode | null>(null)
  const [isAddingCard, setIsAddingCard] = useState(false)

  // Sample enterprise hierarchy data
  const [hierarchy, setHierarchy] = useState<WalletNode>({
    id: 'treasury_main',
    name: 'Treasury Wallet',
    type: 'treasury',
    balance: 5000000,
    limit: 10000000,
    cards: [
      {
        id: 'card_cfo',
        cardNumber: '****-****-****-1001',
        holder: 'John Smith (CFO)',
        role: 'Chief Financial Officer',
        limit: 1000000,
        spent: 250000,
        status: 'active',
        type: 'physical',
        isAutoIssued: true
      },
      {
        id: 'card_treasury',
        cardNumber: '****-****-****-1002',
        holder: 'Treasury Operations',
        role: 'Treasury Manager',
        limit: 500000,
        spent: 125000,
        status: 'active',
        type: 'virtual',
        isAutoIssued: true
      }
    ],
    children: [
      {
        id: 'wallet_finance',
        name: 'Finance Department',
        type: 'department',
        balance: 500000,
        limit: 1000000,
        cards: [
          {
            id: 'card_finance_dir',
            cardNumber: '****-****-****-2001',
            holder: 'Sarah Johnson',
            role: 'Finance Director',
            limit: 250000,
            spent: 75000,
            status: 'active',
            type: 'physical',
            isAutoIssued: true
          }
        ],
        children: [
          {
            id: 'wallet_accounting',
            name: 'Accounting Team',
            type: 'team',
            balance: 50000,
            limit: 100000,
            cards: [
              {
                id: 'card_acc_1',
                cardNumber: '****-****-****-3001',
                holder: 'Mike Chen',
                role: 'Senior Accountant',
                limit: 25000,
                spent: 5000,
                status: 'active',
                type: 'virtual'
              },
              {
                id: 'card_acc_2',
                cardNumber: '****-****-****-3002',
                holder: 'Lisa Wang',
                role: 'Accountant',
                limit: 10000,
                spent: 2500,
                status: 'active',
                type: 'virtual'
              }
            ]
          },
          {
            id: 'wallet_payroll',
            name: 'Payroll Team',
            type: 'team',
            balance: 150000,
            limit: 500000,
            cards: [
              {
                id: 'card_payroll_1',
                cardNumber: '****-****-****-3101',
                holder: 'Payroll Processing',
                role: 'System Card',
                limit: 500000,
                spent: 350000,
                status: 'active',
                type: 'virtual',
                isAutoIssued: true
              }
            ]
          }
        ],
        expanded: true
      },
      {
        id: 'wallet_engineering',
        name: 'Engineering Department',
        type: 'department',
        balance: 300000,
        limit: 750000,
        cards: [
          {
            id: 'card_cto',
            cardNumber: '****-****-****-4001',
            holder: 'Alex Thompson',
            role: 'CTO',
            limit: 500000,
            spent: 125000,
            status: 'active',
            type: 'physical',
            isAutoIssued: true
          }
        ],
        children: [
          {
            id: 'wallet_devops',
            name: 'DevOps Team',
            type: 'team',
            balance: 75000,
            limit: 150000,
            cards: [
              {
                id: 'card_devops_1',
                cardNumber: '****-****-****-5001',
                holder: 'Cloud Services',
                role: 'Infrastructure Card',
                limit: 100000,
                spent: 65000,
                status: 'active',
                type: 'virtual'
              }
            ]
          }
        ]
      },
      {
        id: 'wallet_sales',
        name: 'Sales Department',
        type: 'department',
        balance: 200000,
        limit: 500000,
        cards: [
          {
            id: 'card_vp_sales',
            cardNumber: '****-****-****-6001',
            holder: 'Jennifer Davis',
            role: 'VP Sales',
            limit: 300000,
            spent: 95000,
            status: 'active',
            type: 'physical',
            isAutoIssued: true
          }
        ],
        children: [
          {
            id: 'wallet_sales_team',
            name: 'Field Sales',
            type: 'team',
            balance: 50000,
            limit: 100000,
            cards: [
              {
                id: 'card_sales_1',
                cardNumber: '****-****-****-7001',
                holder: 'Travel & Entertainment',
                role: 'Team Card',
                limit: 50000,
                spent: 15000,
                status: 'active',
                type: 'virtual'
              }
            ]
          }
        ]
      }
    ],
    expanded: true
  })

  const toggleExpand = (walletId: string) => {
    const updateNode = (node: WalletNode): WalletNode => {
      if (node.id === walletId) {
        return { ...node, expanded: !node.expanded }
      }
      if (node.children) {
        return {
          ...node,
          children: node.children.map(updateNode)
        }
      }
      return node
    }
    setHierarchy(updateNode(hierarchy))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100 dark:bg-green-900/30'
      case 'frozen': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30'
      case 'pending': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30'
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'treasury': return <Building className="h-5 w-5" />
      case 'department': return <Users className="h-5 w-5" />
      case 'team': return <Users className="h-4 w-4" />
      case 'individual': return <User className="h-4 w-4" />
      default: return <Wallet className="h-4 w-4" />
    }
  }

  const handleAddCard = (walletId: string) => {
    toast.success(`Adding new card to wallet ${walletId}`)
    setIsAddingCard(true)
    // Implementation for adding new card
  }

  const handleFreezeCard = (cardId: string) => {
    toast.success(`Card ${cardId} has been frozen`)
    // Implementation for freezing card
  }

  const renderWalletNode = (node: WalletNode, level: number = 0) => {
    const spentAmount = node.cards.reduce((acc, card) => acc + card.spent, 0)
    const utilization = (spentAmount / node.limit) * 100

    return (
      <motion.div
        key={node.id}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className={`${level > 0 ? 'ml-6 border-l-2 border-gray-200 dark:border-gray-700 pl-4' : ''}`}
      >
        <div
          className={`mb-4 p-4 rounded-lg border cursor-pointer transition-all ${
            selectedWallet?.id === node.id
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
          }`}
          onClick={() => setSelectedWallet(node)}
        >
          {/* Wallet Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              {node.children && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleExpand(node.id)
                  }}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                >
                  {node.expanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
              )}
              <div className={`p-2 rounded-lg ${
                node.type === 'treasury' ? 'bg-gradient-to-br from-yellow-400 to-orange-500' :
                node.type === 'department' ? 'bg-gradient-to-br from-blue-400 to-indigo-500' :
                node.type === 'team' ? 'bg-gradient-to-br from-green-400 to-emerald-500' :
                'bg-gradient-to-br from-purple-400 to-pink-500'
              }`}>
                {getTypeIcon(node.type)}
              </div>
              <div>
                <h3 className="font-semibold text-sm">{node.name}</h3>
                <p className="text-xs text-gray-500">
                  Balance: ${node.balance.toLocaleString()} | Limit: ${node.limit.toLocaleString()}
                </p>
              </div>
            </div>
            <Badge variant="outline" className="text-xs">
              {node.cards.length} card{node.cards.length !== 1 ? 's' : ''}
            </Badge>
          </div>

          {/* Utilization Bar */}
          <div className="mb-3">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Utilization</span>
              <span>{utilization.toFixed(1)}%</span>
            </div>
            <Progress value={utilization} className="h-2" />
          </div>

          {/* Cards Summary */}
          <div className="grid grid-cols-2 gap-2">
            {node.cards.slice(0, 2).map(card => (
              <div
                key={card.id}
                className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs"
              >
                <CreditCard className="h-3 w-3" />
                <div className="flex-1">
                  <p className="font-medium truncate">{card.holder}</p>
                  <p className="text-gray-500">{card.cardNumber}</p>
                </div>
                {card.isAutoIssued && (
                  <Badge className="bg-purple-100 text-purple-700 text-xs">Auto</Badge>
                )}
              </div>
            ))}
            {node.cards.length > 2 && (
              <div className="col-span-2 text-center text-xs text-gray-500">
                +{node.cards.length - 2} more cards
              </div>
            )}
          </div>
        </div>

        {/* Render Children */}
        {node.expanded && node.children && (
          <div className="space-y-2">
            {node.children.map(child => renderWalletNode(child, level + 1))}
          </div>
        )}
      </motion.div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Hierarchy View */}
      <div className="lg:col-span-2">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Enterprise Wallet Hierarchy</CardTitle>
            <CardDescription>
              Manage your organization's wallet and card structure
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderWalletNode(hierarchy)}
          </CardContent>
        </Card>
      </div>

      {/* Selected Wallet Details */}
      <div>
        {selectedWallet ? (
          <Card className="glass-card sticky top-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getTypeIcon(selectedWallet.type)}
                {selectedWallet.name}
              </CardTitle>
              <CardDescription>
                Wallet ID: {selectedWallet.id}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Wallet Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Balance</p>
                  <p className="text-xl font-bold">
                    ${selectedWallet.balance.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Limit</p>
                  <p className="text-xl font-bold">
                    ${selectedWallet.limit.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Cards List */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium">Issued Cards</h4>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAddCard(selectedWallet.id)}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Card
                  </Button>
                </div>
                <div className="space-y-2">
                  {selectedWallet.cards.map(card => (
                    <div
                      key={card.id}
                      className="p-3 border rounded-lg space-y-2"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-sm">{card.holder}</p>
                          <p className="text-xs text-gray-500">{card.role}</p>
                        </div>
                        <Badge className={getStatusColor(card.status)}>
                          {card.status}
                        </Badge>
                      </div>
                      <div className="text-xs space-y-1">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Card:</span>
                          <span className="font-mono">{card.cardNumber}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Type:</span>
                          <span>{card.type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Spent:</span>
                          <span>${card.spent.toLocaleString()} / ${card.limit.toLocaleString()}</span>
                        </div>
                      </div>
                      <Progress
                        value={(card.spent / card.limit) * 100}
                        className="h-1"
                      />
                      {card.isAutoIssued && (
                        <div className="flex items-center gap-1 text-xs text-purple-600">
                          <Shield className="h-3 w-3" />
                          Auto-issued with wallet creation
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Settings className="h-3 w-3 mr-1" />
                          Settings
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleFreezeCard(card.id)}
                        >
                          <Lock className="h-3 w-3 mr-1" />
                          Freeze
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t space-y-2">
                <Button className="w-full" variant="gradient">
                  <Activity className="h-4 w-4 mr-2" />
                  View Transactions
                </Button>
                <Button className="w-full" variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Wallet Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="glass-card">
            <CardContent className="p-6 text-center text-gray-500">
              <Wallet className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Select a wallet to view details</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}