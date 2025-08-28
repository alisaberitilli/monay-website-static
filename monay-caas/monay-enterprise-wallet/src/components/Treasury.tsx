'use client'

import { useState } from 'react'

const API_URL = 'http://localhost:3001/api'

export default function Treasury() {
  const [activeTab, setActiveTab] = useState<'overview' | 'liquidity' | 'operations'>('overview')
  
  const treasuryStats = {
    totalAssets: '$15,750,000',
    liquidAssets: '$8,500,000',
    stakedAssets: '$7,250,000',
    dailyVolume: '$2,340,000',
    yieldEarned: '$125,000',
    apy: '4.2%'
  }

  const pools = [
    { name: 'USDM/USD', tvl: '$5,000,000', apy: '3.8%', utilization: '67%', chain: 'Base' },
    { name: 'USDM/USDC', tvl: '$3,500,000', apy: '4.2%', utilization: '82%', chain: 'Base' },
    { name: 'SOL/USDM', tvl: '$2,500,000', apy: '6.5%', utilization: '45%', chain: 'Solana' }
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Treasury Management</h2>
          <p className="text-gray-600 mt-1">Manage liquidity and treasury operations</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          + New Operation
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <p className="text-sm text-gray-500">Total Assets</p>
          <p className="text-2xl font-bold mt-1">{treasuryStats.totalAssets}</p>
          <p className="text-sm text-green-600 mt-1">+12.5% (30d)</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <p className="text-sm text-gray-500">Yield Earned (30d)</p>
          <p className="text-2xl font-bold mt-1">{treasuryStats.yieldEarned}</p>
          <p className="text-sm text-blue-600 mt-1">{treasuryStats.apy} APY</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <p className="text-sm text-gray-500">Daily Volume</p>
          <p className="text-2xl font-bold mt-1">{treasuryStats.dailyVolume}</p>
          <p className="text-sm text-purple-600 mt-1">147 transactions</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border">
        <div className="border-b">
          <div className="flex gap-6 px-6">
            {(['overview', 'liquidity', 'operations'] as const).map((tab) => (
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-4">Asset Distribution</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Base L2 (EVM)</span>
                    <span className="font-medium">$10,500,000 (67%)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Solana</span>
                    <span className="font-medium">$5,250,000 (33%)</span>
                  </div>
                </div>
              </div>
              
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-4">Recent Operations</h3>
                <div className="space-y-2">
                  <div className="p-2 bg-gray-50 rounded">
                    <div className="flex justify-between text-sm">
                      <span>Liquidity Addition</span>
                      <span className="font-medium">+$500,000</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                  </div>
                  <div className="p-2 bg-gray-50 rounded">
                    <div className="flex justify-between text-sm">
                      <span>Cross-Rail Swap</span>
                      <span className="font-medium">$250,000</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">5 hours ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'liquidity' && (
          <div className="p-6">
            <h3 className="font-semibold mb-4">Liquidity Pools</h3>
            <div className="space-y-4">
              {pools.map((pool, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">{pool.name}</h4>
                      <div className="mt-2 flex gap-4 text-sm text-gray-600">
                        <span>TVL: {pool.tvl}</span>
                        <span>APY: {pool.apy}</span>
                        <span>Utilization: {pool.utilization}</span>
                        <span>Chain: {pool.chain}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">
                        Add Liquidity
                      </button>
                      <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}