'use client'

import { useState } from 'react'

interface BusinessRule {
  id: string
  name: string
  category: 'transaction' | 'compliance' | 'wallet' | 'token' | 'security'
  status: 'active' | 'inactive' | 'testing'
  conditions: {
    field: string
    operator: string
    value: string | number | boolean
  }[]
  actions: {
    type: string
    parameters: Record<string, any>
  }[]
  priority: number
  appliesTo: string[]
  createdAt: string
  lastModified: string
  executionCount: number
}

export default function BusinessRulesEngine() {
  const [activeTab, setActiveTab] = useState<'rules' | 'monitoring' | 'testing'>('rules')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedRule, setSelectedRule] = useState<BusinessRule | null>(null)

  const [rules] = useState<BusinessRule[]>([
    {
      id: '1',
      name: 'Daily Transaction Limit - Enterprise',
      category: 'transaction',
      status: 'active',
      conditions: [
        { field: 'userRole', operator: 'equals', value: 'enterprise_finance' },
        { field: 'dailyTotal', operator: 'exceeds', value: 10000000 }
      ],
      actions: [
        { type: 'block_transaction', parameters: {} },
        { type: 'notify_admin', parameters: { message: 'Daily limit exceeded' } }
      ],
      priority: 1,
      appliesTo: ['enterprise_finance', 'enterprise_admin'],
      createdAt: '2024-01-01',
      lastModified: '2024-01-15',
      executionCount: 42
    },
    {
      id: '2',
      name: 'KYC Verification Required',
      category: 'compliance',
      status: 'active',
      conditions: [
        { field: 'transactionAmount', operator: 'greaterThan', value: 10000 },
        { field: 'kycLevel', operator: 'lessThan', value: 'enhanced' }
      ],
      actions: [
        { type: 'require_kyc', parameters: { level: 'enhanced' } },
        { type: 'hold_transaction', parameters: { duration: '24h' } }
      ],
      priority: 2,
      appliesTo: ['all'],
      createdAt: '2024-01-05',
      lastModified: '2024-01-20',
      executionCount: 156
    },
    {
      id: '3',
      name: 'USDM Auto-Conversion',
      category: 'token',
      status: 'active',
      conditions: [
        { field: 'paymentMethod', operator: 'equals', value: 'usdm' },
        { field: 'recipientAcceptsUSDM', operator: 'equals', value: false }
      ],
      actions: [
        { type: 'convert_currency', parameters: { from: 'USDM', to: 'USD' } },
        { type: 'apply_conversion_fee', parameters: { rate: 0.001 } }
      ],
      priority: 3,
      appliesTo: ['all'],
      createdAt: '2024-01-10',
      lastModified: '2024-01-25',
      executionCount: 892
    },
    {
      id: '4',
      name: 'Suspicious Activity Detection',
      category: 'security',
      status: 'active',
      conditions: [
        { field: 'velocityScore', operator: 'greaterThan', value: 85 },
        { field: 'riskScore', operator: 'greaterThan', value: 70 }
      ],
      actions: [
        { type: 'flag_for_review', parameters: { severity: 'high' } },
        { type: 'limit_account', parameters: { maxTransaction: 1000 } },
        { type: 'notify_compliance', parameters: {} }
      ],
      priority: 1,
      appliesTo: ['all'],
      createdAt: '2023-12-15',
      lastModified: '2024-01-28',
      executionCount: 23
    },
    {
      id: '5',
      name: 'Programmable Wallet Limits',
      category: 'wallet',
      status: 'testing',
      conditions: [
        { field: 'walletType', operator: 'equals', value: 'programmable' },
        { field: 'apiCallsPerMinute', operator: 'greaterThan', value: 100 }
      ],
      actions: [
        { type: 'rate_limit', parameters: { duration: '1m' } },
        { type: 'log_activity', parameters: { severity: 'warning' } }
      ],
      priority: 2,
      appliesTo: ['enterprise_developer'],
      createdAt: '2024-01-20',
      lastModified: '2024-01-30',
      executionCount: 0
    }
  ])

  const ruleCategories = [
    { id: 'transaction', label: 'Transaction Rules', icon: '💳', count: 15 },
    { id: 'compliance', label: 'Compliance Rules', icon: '🛡️', count: 8 },
    { id: 'wallet', label: 'Wallet Rules', icon: '👛', count: 12 },
    { id: 'token', label: 'Token Rules', icon: '🪙', count: 6 },
    { id: 'security', label: 'Security Rules', icon: '🔒', count: 9 }
  ]

  const conditions = [
    'userRole', 'transactionAmount', 'dailyTotal', 'monthlyTotal',
    'kycLevel', 'riskScore', 'velocityScore', 'accountAge',
    'walletType', 'paymentMethod', 'recipientCountry', 'senderCountry'
  ]

  const operators = [
    'equals', 'notEquals', 'greaterThan', 'lessThan', 
    'greaterThanOrEqual', 'lessThanOrEqual', 'contains', 
    'startsWith', 'endsWith', 'in', 'notIn'
  ]

  const actions = [
    'block_transaction', 'approve_transaction', 'hold_transaction',
    'require_kyc', 'require_2fa', 'notify_admin', 'notify_compliance',
    'flag_for_review', 'limit_account', 'convert_currency',
    'apply_fee', 'apply_discount', 'rate_limit', 'log_activity'
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Business Rules Engine</h2>
          <p className="text-gray-600 mt-1">Configure automated rules for transactions, compliance, and security</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Create Rule
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <p className="text-sm text-gray-500">Active Rules</p>
          <p className="text-2xl font-bold mt-1">47</p>
          <p className="text-sm text-green-600 mt-1">All systems operational</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <p className="text-sm text-gray-500">Rules Executed (24h)</p>
          <p className="text-2xl font-bold mt-1">12,847</p>
          <p className="text-sm text-blue-600 mt-1">+23% vs yesterday</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <p className="text-sm text-gray-500">Blocked Transactions</p>
          <p className="text-2xl font-bold mt-1">156</p>
          <p className="text-sm text-yellow-600 mt-1">$2.3M protected</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <p className="text-sm text-gray-500">Compliance Score</p>
          <p className="text-2xl font-bold mt-1">98.5%</p>
          <p className="text-sm text-green-600 mt-1">Excellent</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="border-b">
          <div className="flex gap-6 px-6">
            {(['rules', 'monitoring', 'testing'] as const).map((tab) => (
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

        {/* Rules Tab */}
        {activeTab === 'rules' && (
          <div className="p-6">
            {/* Category Filter */}
            <div className="flex gap-3 mb-6 overflow-x-auto">
              {ruleCategories.map((category) => (
                <button
                  key={category.id}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 whitespace-nowrap"
                >
                  <span>{category.icon}</span>
                  <span className="font-medium">{category.label}</span>
                  <span className="px-2 py-1 bg-gray-200 rounded-full text-xs">{category.count}</span>
                </button>
              ))}
            </div>

            {/* Rules List */}
            <div className="space-y-4">
              {rules.map((rule) => (
                <div key={rule.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold">{rule.name}</h3>
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                          rule.status === 'active' ? 'bg-green-100 text-green-700' :
                          rule.status === 'testing' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {rule.status}
                        </span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium">
                          Priority {rule.priority}
                        </span>
                      </div>
                      
                      <div className="mt-2 text-sm text-gray-600">
                        <p className="mb-2">
                          <strong>Conditions:</strong> {rule.conditions.map(c => 
                            `${c.field} ${c.operator} ${c.value}`
                          ).join(' AND ')}
                        </p>
                        <p className="mb-2">
                          <strong>Actions:</strong> {rule.actions.map(a => a.type).join(', ')}
                        </p>
                        <p>
                          <strong>Applies to:</strong> {rule.appliesTo.join(', ')}
                        </p>
                      </div>
                      
                      <div className="mt-3 flex gap-4 text-xs text-gray-500">
                        <span>Created: {rule.createdAt}</span>
                        <span>Modified: {rule.lastModified}</span>
                        <span>Executed: {rule.executionCount} times</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">
                        Edit
                      </button>
                      <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">
                        Test
                      </button>
                      <button className="px-3 py-1 border border-red-300 text-red-600 rounded text-sm hover:bg-red-50">
                        Disable
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Monitoring Tab */}
        {activeTab === 'monitoring' && (
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-4">Rule Execution Timeline</h3>
                <div className="h-64 bg-gray-50 rounded flex items-center justify-center">
                  <p className="text-gray-500">Execution timeline chart</p>
                </div>
              </div>
              
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-4">Top Triggered Rules (24h)</h3>
                <div className="space-y-2">
                  <div className="flex justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm">Daily Transaction Limit</span>
                    <span className="text-sm font-medium">892 times</span>
                  </div>
                  <div className="flex justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm">KYC Verification Required</span>
                    <span className="text-sm font-medium">456 times</span>
                  </div>
                  <div className="flex justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm">USDM Auto-Conversion</span>
                    <span className="text-sm font-medium">234 times</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Testing Tab */}
        {activeTab === 'testing' && (
          <div className="p-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-yellow-900 mb-2">Test Environment</h3>
              <p className="text-sm text-yellow-700">
                Test rules in a sandbox environment before deploying to production.
              </p>
            </div>
            
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-4">Create Test Scenario</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Select Rule to Test</label>
                  <select className="w-full px-3 py-2 border rounded-lg">
                    <option>Daily Transaction Limit - Enterprise</option>
                    <option>KYC Verification Required</option>
                    <option>USDM Auto-Conversion</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Test Parameters</label>
                  <textarea 
                    className="w-full px-3 py-2 border rounded-lg"
                    rows={4}
                    placeholder="Enter test parameters in JSON format..."
                  />
                </div>
                
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Run Test
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Rule Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h3 className="text-xl font-bold">Create Business Rule</h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Rule Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="e.g., High-Value Transaction Approval"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select className="w-full px-3 py-2 border rounded-lg">
                  <option>Transaction Rules</option>
                  <option>Compliance Rules</option>
                  <option>Wallet Rules</option>
                  <option>Token Rules</option>
                  <option>Security Rules</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Conditions</label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <select className="flex-1 px-3 py-2 border rounded-lg">
                      {conditions.map(c => <option key={c}>{c}</option>)}
                    </select>
                    <select className="px-3 py-2 border rounded-lg">
                      {operators.map(o => <option key={o}>{o}</option>)}
                    </select>
                    <input
                      type="text"
                      className="flex-1 px-3 py-2 border rounded-lg"
                      placeholder="Value"
                    />
                  </div>
                  <button className="text-sm text-blue-600 hover:text-blue-700">
                    + Add Condition
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Actions</label>
                <div className="space-y-2">
                  <select className="w-full px-3 py-2 border rounded-lg">
                    {actions.map(a => <option key={a}>{a}</option>)}
                  </select>
                  <button className="text-sm text-blue-600 hover:text-blue-700">
                    + Add Action
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Priority</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="1 (highest) - 10 (lowest)"
                />
              </div>
            </div>
            
            <div className="p-6 border-t flex justify-end gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Create Rule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}