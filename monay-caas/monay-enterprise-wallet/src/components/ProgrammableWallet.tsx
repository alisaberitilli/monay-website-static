'use client'

import { useState } from 'react'

interface WalletAPI {
  id: string
  name: string
  endpoint: string
  method: string
  description: string
  parameters: Record<string, any>
  response: Record<string, any>
}

interface SmartContract {
  id: string
  name: string
  address: string
  chain: 'base' | 'solana'
  status: 'deployed' | 'pending' | 'failed'
  functions: string[]
}

interface DebitCard {
  id: string
  cardNumber: string
  cardHolder: string
  expiryDate: string
  status: 'active' | 'frozen' | 'cancelled'
  type: 'virtual' | 'physical'
  balance: number
  spendingLimit: number
  linkedWallet: string
}

export default function ProgrammableWallet() {
  const [activeTab, setActiveTab] = useState<'overview' | 'api' | 'cards' | 'contracts' | 'automation'>('overview')
  const [showCreateCardModal, setShowCreateCardModal] = useState(false)
  const [showAPIModal, setShowAPIModal] = useState(false)

  const walletFeatures = [
    { name: 'Multi-Chain Support', status: 'active', chains: ['Base EVM L2', 'Solana'] },
    { name: 'Programmable Rules', status: 'active', rules: 47 },
    { name: 'API Access', status: 'active', calls: '125k/month' },
    { name: 'Smart Contracts', status: 'active', deployed: 8 },
    { name: 'Virtual Cards', status: 'active', issued: 25 },
    { name: 'Physical Cards', status: 'active', issued: 10 }
  ]

  const [debitCards] = useState<DebitCard[]>([
    {
      id: '1',
      cardNumber: '•••• •••• •••• 4242',
      cardHolder: 'John Smith',
      expiryDate: '12/26',
      status: 'active',
      type: 'virtual',
      balance: 5000,
      spendingLimit: 10000,
      linkedWallet: '0x1234...abcd'
    },
    {
      id: '2',
      cardNumber: '•••• •••• •••• 8765',
      cardHolder: 'Sarah Johnson',
      expiryDate: '08/25',
      status: 'active',
      type: 'physical',
      balance: 15000,
      spendingLimit: 25000,
      linkedWallet: '0x5678...efgh'
    }
  ])

  const [smartContracts] = useState<SmartContract[]>([
    {
      id: '1',
      name: 'USDM Token Contract',
      address: '0xABC...123',
      chain: 'base',
      status: 'deployed',
      functions: ['mint', 'burn', 'transfer', 'approve', 'setCompliance']
    },
    {
      id: '2',
      name: 'Treasury Management',
      address: '0xDEF...456',
      chain: 'base',
      status: 'deployed',
      functions: ['deposit', 'withdraw', 'swap', 'stake']
    }
  ])

  const apiEndpoints: WalletAPI[] = [
    {
      id: '1',
      name: 'Create Wallet',
      endpoint: '/api/v1/wallets',
      method: 'POST',
      description: 'Create a new programmable wallet',
      parameters: { name: 'string', chain: 'string', type: 'string' },
      response: { walletId: 'string', address: 'string', status: 'string' }
    },
    {
      id: '2',
      name: 'Issue Virtual Card',
      endpoint: '/api/v1/cards/virtual',
      method: 'POST',
      description: 'Issue a virtual debit card linked to wallet',
      parameters: { walletId: 'string', spendingLimit: 'number', currency: 'string' },
      response: { cardId: 'string', cardNumber: 'string', cvv: 'string' }
    },
    {
      id: '3',
      name: 'Execute Transaction',
      endpoint: '/api/v1/transactions',
      method: 'POST',
      description: 'Execute a blockchain transaction',
      parameters: { from: 'string', to: 'string', amount: 'number', token: 'string' },
      response: { txHash: 'string', status: 'string', fee: 'number' }
    }
  ]

  const automationRules = [
    { name: 'Auto-Convert to USDM', trigger: 'On deposit > $1000', action: 'Convert to USDM', status: 'active' },
    { name: 'Card Top-Up', trigger: 'Balance < $100', action: 'Top up $500 from wallet', status: 'active' },
    { name: 'Recurring Payment', trigger: 'Monthly on 1st', action: 'Pay $2500 to vendor', status: 'active' },
    { name: 'Yield Optimization', trigger: 'USDM balance > $10k', action: 'Stake in yield pool', status: 'testing' }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Programmable Wallet</h2>
          <p className="text-gray-600 mt-1">Advanced wallet features with API access and debit cards</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowCreateCardModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            + Issue Card
          </button>
          <button
            onClick={() => setShowAPIModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            API Docs
          </button>
        </div>
      </div>

      {/* Wallet Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <p className="text-sm text-gray-500">Total Balance</p>
          <p className="text-2xl font-bold mt-1">$1,250,000</p>
          <p className="text-sm text-green-600 mt-1">250,000 USDM</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <p className="text-sm text-gray-500">Active Cards</p>
          <p className="text-2xl font-bold mt-1">35</p>
          <p className="text-sm text-gray-600 mt-1">25 virtual, 10 physical</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <p className="text-sm text-gray-500">API Calls (30d)</p>
          <p className="text-2xl font-bold mt-1">125,847</p>
          <p className="text-sm text-blue-600 mt-1">Unlimited plan</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <p className="text-sm text-gray-500">Smart Contracts</p>
          <p className="text-2xl font-bold mt-1">8</p>
          <p className="text-sm text-purple-600 mt-1">2 pending deployment</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="border-b">
          <div className="flex gap-6 px-6">
            {(['overview', 'api', 'cards', 'contracts', 'automation'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3 px-1 border-b-2 font-medium text-sm capitalize ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Features */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-4">Wallet Features</h3>
                <div className="space-y-3">
                  {walletFeatures.map((feature, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{feature.name}</p>
                        <p className="text-sm text-gray-500">
                          {feature.chains && `Chains: ${feature.chains.join(', ')}`}
                          {feature.rules && `${feature.rules} active rules`}
                          {feature.calls && `Usage: ${feature.calls}`}
                          {feature.deployed && `${feature.deployed} deployed`}
                          {feature.issued && `${feature.issued} cards issued`}
                        </p>
                      </div>
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                        {feature.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button className="p-3 bg-blue-50 rounded-lg hover:bg-blue-100 text-left">
                    <div className="text-2xl mb-2">👛</div>
                    <div className="font-medium text-sm">Create Wallet</div>
                    <div className="text-xs text-gray-500">New programmable wallet</div>
                  </button>
                  <button className="p-3 bg-green-50 rounded-lg hover:bg-green-100 text-left">
                    <div className="text-2xl mb-2">💳</div>
                    <div className="font-medium text-sm">Issue Card</div>
                    <div className="text-xs text-gray-500">Virtual or physical</div>
                  </button>
                  <button className="p-3 bg-purple-50 rounded-lg hover:bg-purple-100 text-left">
                    <div className="text-2xl mb-2">📝</div>
                    <div className="font-medium text-sm">Deploy Contract</div>
                    <div className="text-xs text-gray-500">Smart contract</div>
                  </button>
                  <button className="p-3 bg-yellow-50 rounded-lg hover:bg-yellow-100 text-left">
                    <div className="text-2xl mb-2">⚡</div>
                    <div className="font-medium text-sm">API Keys</div>
                    <div className="text-xs text-gray-500">Manage access</div>
                  </button>
                </div>
              </div>
            </div>

            {/* USDM Integration */}
            <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
              <h3 className="font-semibold mb-4">USDM Integration</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4">
                  <p className="text-sm text-gray-500">USDM Balance</p>
                  <p className="text-xl font-bold">250,000 USDM</p>
                  <p className="text-sm text-green-600 mt-1">≈ $250,000 USD</p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <p className="text-sm text-gray-500">Yield Earned (30d)</p>
                  <p className="text-xl font-bold">875 USDM</p>
                  <p className="text-sm text-blue-600 mt-1">4.2% APY</p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <p className="text-sm text-gray-500">Transactions (30d)</p>
                  <p className="text-xl font-bold">147</p>
                  <p className="text-sm text-purple-600 mt-1">$2.3M volume</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* API Tab */}
        {activeTab === 'api' && (
          <div className="p-6">
            <div className="mb-6">
              <h3 className="font-semibold mb-2">API Endpoints</h3>
              <p className="text-sm text-gray-600">RESTful API for wallet management and transactions</p>
            </div>

            <div className="space-y-4">
              {apiEndpoints.map((api) => (
                <div key={api.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          api.method === 'POST' ? 'bg-green-100 text-green-700' :
                          api.method === 'GET' ? 'bg-blue-100 text-blue-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {api.method}
                        </span>
                        <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                          {api.endpoint}
                        </code>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{api.description}</p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="font-medium mb-1">Parameters:</p>
                          <pre className="bg-gray-50 p-2 rounded text-xs">
                            {JSON.stringify(api.parameters, null, 2)}
                          </pre>
                        </div>
                        <div>
                          <p className="font-medium mb-1">Response:</p>
                          <pre className="bg-gray-50 p-2 rounded text-xs">
                            {JSON.stringify(api.response, null, 2)}
                          </pre>
                        </div>
                      </div>
                    </div>
                    <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 ml-4">
                      Test
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">API Keys</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 bg-white rounded">
                  <code className="text-sm">sk_live_abc123...xyz789</code>
                  <button className="text-sm text-blue-600 hover:text-blue-700">Copy</button>
                </div>
                <button className="text-sm text-blue-600 hover:text-blue-700">+ Generate New Key</button>
              </div>
            </div>
          </div>
        )}

        {/* Cards Tab */}
        {activeTab === 'cards' && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {debitCards.map((card) => (
                <div key={card.id} className="relative">
                  {/* Card Visual */}
                  <div className={`rounded-xl p-6 h-48 ${
                    card.type === 'physical' 
                      ? 'bg-gradient-to-br from-gray-800 to-black text-white'
                      : 'bg-gradient-to-br from-blue-500 to-purple-600 text-white'
                  }`}>
                    <div className="flex justify-between items-start mb-8">
                      <div>
                        <p className="text-xs opacity-75">{card.type === 'physical' ? 'Physical' : 'Virtual'} Card</p>
                        <p className="text-lg font-bold mt-1">USDM Debit</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        card.status === 'active' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                      }`}>
                        {card.status}
                      </span>
                    </div>
                    <p className="font-mono text-lg mb-4">{card.cardNumber}</p>
                    <div className="flex justify-between">
                      <div>
                        <p className="text-xs opacity-75">Card Holder</p>
                        <p className="text-sm font-medium">{card.cardHolder}</p>
                      </div>
                      <div>
                        <p className="text-xs opacity-75">Expires</p>
                        <p className="text-sm font-medium">{card.expiryDate}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Card Details */}
                  <div className="mt-4 p-4 bg-white border rounded-lg">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Balance</span>
                        <span className="font-medium">${card.balance.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Daily Limit</span>
                        <span className="font-medium">${card.spendingLimit.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Linked Wallet</span>
                        <span className="font-mono text-xs">{card.linkedWallet}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button className="flex-1 px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">
                        Manage
                      </button>
                      <button className="flex-1 px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">
                        Freeze
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Card Features</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div>✓ Instant issuance</div>
                <div>✓ Real-time spending controls</div>
                <div>✓ USDM auto-conversion</div>
                <div>✓ Apple/Google Pay</div>
                <div>✓ ATM withdrawals</div>
                <div>✓ International payments</div>
                <div>✓ Cashback rewards</div>
                <div>✓ Zero FX fees</div>
              </div>
            </div>
          </div>
        )}

        {/* Smart Contracts Tab */}
        {activeTab === 'contracts' && (
          <div className="p-6">
            <div className="space-y-4">
              {smartContracts.map((contract) => (
                <div key={contract.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h4 className="font-semibold">{contract.name}</h4>
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                          contract.status === 'deployed' ? 'bg-green-100 text-green-700' :
                          contract.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {contract.status}
                        </span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium">
                          {contract.chain}
                        </span>
                      </div>
                      <p className="text-sm font-mono text-gray-600 mt-1">{contract.address}</p>
                      <div className="mt-3">
                        <p className="text-sm font-medium mb-2">Available Functions:</p>
                        <div className="flex flex-wrap gap-2">
                          {contract.functions.map((func, index) => (
                            <span key={index} className="px-2 py-1 bg-gray-100 rounded text-xs">
                              {func}()
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">
                        Interact
                      </button>
                      <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">
                        View Code
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              + Deploy New Contract
            </button>
          </div>
        )}

        {/* Automation Tab */}
        {activeTab === 'automation' && (
          <div className="p-6">
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Automated Rules</h3>
              <p className="text-sm text-gray-600">Set up automated actions for your wallet</p>
            </div>

            <div className="space-y-4">
              {automationRules.map((rule, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">{rule.name}</h4>
                      <div className="mt-2 space-y-1 text-sm text-gray-600">
                        <p><strong>Trigger:</strong> {rule.trigger}</p>
                        <p><strong>Action:</strong> {rule.action}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                        rule.status === 'active' ? 'bg-green-100 text-green-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {rule.status}
                      </span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked={rule.status === 'active'} />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              + Create Automation
            </button>
          </div>
        )}
      </div>

      {/* Create Card Modal */}
      {showCreateCardModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6 border-b">
              <h3 className="text-xl font-bold">Issue New Card</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Card Type</label>
                <select className="w-full px-3 py-2 border rounded-lg">
                  <option>Virtual Card (Instant)</option>
                  <option>Physical Card (5-7 days)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Card Holder Name</label>
                <input type="text" className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Spending Limit (Daily)</label>
                <input type="number" className="w-full px-3 py-2 border rounded-lg" placeholder="$10,000" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Link to Wallet</label>
                <select className="w-full px-3 py-2 border rounded-lg">
                  <option>Main Wallet (0x1234...abcd)</option>
                  <option>Treasury Wallet (0x5678...efgh)</option>
                </select>
              </div>
            </div>
            <div className="p-6 border-t flex justify-end gap-3">
              <button
                onClick={() => setShowCreateCardModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Issue Card
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}