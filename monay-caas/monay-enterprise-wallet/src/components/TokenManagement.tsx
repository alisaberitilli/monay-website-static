'use client'

import { useState, useEffect } from 'react'

const API_URL = 'http://localhost:3001/api'

export default function TokenManagement() {
  const [activeTab, setActiveTab] = useState<'overview' | 'create' | 'manage'>('overview')
  const [tokens, setTokens] = useState([
    {
      id: '1',
      symbol: 'USDM',
      name: 'Monay USD',
      type: 'ERC-3643',
      chain: 'Base L2',
      totalSupply: '10,000,000',
      circulating: '1,300,000',
      holders: 1247,
      status: 'active',
      compliance: 'KYC Required'
    },
    {
      id: '2',
      symbol: 'USDM-SOL',
      name: 'Monay USD (Solana)',
      type: 'Token-2022',
      chain: 'Solana',
      totalSupply: '5,000,000',
      circulating: '50,000',
      holders: 342,
      status: 'active',
      compliance: 'Transfer Hook Active'
    }
  ])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Token Management</h2>
          <p className="text-gray-600 mt-1">Deploy and manage ERC-3643 compliant tokens</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          + Deploy Token
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <p className="text-sm text-gray-500">Total Tokens</p>
          <p className="text-2xl font-bold mt-1">{tokens.length}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <p className="text-sm text-gray-500">Total Supply</p>
          <p className="text-2xl font-bold mt-1">$15M</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <p className="text-sm text-gray-500">Total Holders</p>
          <p className="text-2xl font-bold mt-1">1,589</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <p className="text-sm text-gray-500">Active Chains</p>
          <p className="text-2xl font-bold mt-1">2</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border">
        <div className="border-b">
          <div className="flex gap-6 px-6">
            {(['overview', 'create', 'manage'] as const).map((tab) => (
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

        {activeTab === 'overview' && (
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 text-sm font-medium text-gray-600">Token</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600">Chain</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600">Total Supply</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600">Circulating</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600">Holders</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600">Status</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tokens.map((token) => (
                    <tr key={token.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <div>
                          <p className="font-medium">{token.symbol}</p>
                          <p className="text-sm text-gray-500">{token.name}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                          {token.chain}
                        </span>
                      </td>
                      <td className="p-4 font-medium">{token.totalSupply}</td>
                      <td className="p-4">{token.circulating}</td>
                      <td className="p-4">{token.holders}</td>
                      <td className="p-4">
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                          {token.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">
                            Manage
                          </button>
                          <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">
                            Mint/Burn
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'create' && (
          <div className="p-6">
            <form className="space-y-4 max-w-2xl">
              <div>
                <label className="block text-sm font-medium mb-2">Token Name</label>
                <input type="text" className="w-full px-3 py-2 border rounded-lg" placeholder="e.g., Acme USD" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Symbol</label>
                <input type="text" className="w-full px-3 py-2 border rounded-lg" placeholder="e.g., ACME" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Blockchain</label>
                <select className="w-full px-3 py-2 border rounded-lg">
                  <option>Base L2 (ERC-3643)</option>
                  <option>Solana (Token-2022)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Initial Supply</label>
                <input type="number" className="w-full px-3 py-2 border rounded-lg" placeholder="1000000" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Compliance Rules</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" defaultChecked />
                    <span className="text-sm">KYC Required</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" defaultChecked />
                    <span className="text-sm">AML Screening</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm">Accredited Investors Only</span>
                  </label>
                </div>
              </div>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Deploy Token
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}