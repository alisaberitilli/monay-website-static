'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'

interface DashboardProps {
  blockchainStatus: {
    base: { status: string; balance: string; network: string }
    solana: { status: string; balance: string; network: string }
  }
}

export default function Dashboard({ blockchainStatus }: DashboardProps) {
  const router = useRouter()
  const [stats, setStats] = useState({
    totalValue: '$1,300,000',
    dayChange: '+2.45%',
    activeTokens: 3,
    totalTransactions: '1,247',
    pendingApprovals: 5,
    complianceScore: 98
  })

  const recentTransactions = [
    { id: 1, type: 'Mint', amount: '10,000 USDC', chain: 'Base', status: 'Completed', time: '2 mins ago' },
    { id: 2, type: 'Transfer', amount: '5,000 USDC', chain: 'Solana', status: 'Pending', time: '15 mins ago' },
    { id: 3, type: 'Burn', amount: '2,500 USDC', chain: 'Base', status: 'Completed', time: '1 hour ago' },
    { id: 4, type: 'Cross-Rail', amount: '25,000 USDC', chain: 'Base → Solana', status: 'Processing', time: '2 hours ago' },
    { id: 5, type: 'Mint', amount: '50,000 USDC', chain: 'Base', status: 'Completed', time: '3 hours ago' }
  ]

  const tokenBalances = [
    { symbol: 'USDC', balance: '1,250,000', value: '$1,250,000', chain: 'Base', apy: '4.2%' },
    { symbol: 'USDC', balance: '50,000', value: '$50,000', chain: 'Solana', apy: '3.8%' },
    { symbol: 'ETH', balance: '10.5', value: '$42,000', chain: 'Base', apy: '-' }
  ]

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500">Total Portfolio Value</p>
              <p className="text-2xl font-bold mt-1">{stats.totalValue}</p>
              <p className="text-sm text-green-600 mt-1">
                {stats.dayChange} (24h)
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500">Active Tokens</p>
              <p className="text-2xl font-bold mt-1">{stats.activeTokens}</p>
              <p className="text-sm text-gray-600 mt-1">2 chains</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500">Total Transactions</p>
              <p className="text-2xl font-bold mt-1">{stats.totalTransactions}</p>
              <p className="text-sm text-gray-600 mt-1">This month</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500">Compliance Score</p>
              <p className="text-2xl font-bold mt-1">{stats.complianceScore}%</p>
              <p className="text-sm text-green-600 mt-1">Excellent</p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-lg">
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Token Balances & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Token Balances */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold">Token Balances</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {tokenBalances.map((token, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                      {token.symbol.slice(0, 2)}
                    </div>
                    <div>
                      <p className="font-medium">{token.symbol}</p>
                      <p className="text-sm text-gray-500">{token.chain}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{token.balance}</p>
                    <p className="text-sm text-gray-500">{token.value}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-green-600 font-medium">APY: {token.apy}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold">Quick Actions</h2>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              <button
                onClick={() => {
                  router.push('/tokens/new')
                  toast.success('Navigating to token creation')
                }}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                Create New Token
              </button>
              <button
                onClick={() => {
                  router.push('/transfers/new')
                  toast.success('Opening transfer interface')
                }}
                className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                Initiate Transfer
              </button>
              <button
                onClick={() => {
                  router.push('/swap')
                  toast.success('Opening cross-rail swap interface')
                }}
                className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                Cross-Rail Swap
              </button>
              <button
                onClick={() => {
                  router.push('/reports')
                  toast.success('Loading reports dashboard')
                }}
                className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                View Reports
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-semibold">Recent Transactions</h2>
          <button
            onClick={() => {
              router.push('/transactions')
              toast.success('Loading all transactions')
            }}
            className="text-sm text-blue-600 hover:text-blue-700">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left p-4 text-sm font-medium text-gray-600">Type</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">Amount</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">Chain</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">Status</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">Time</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map((tx) => (
                <tr key={tx.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                      tx.type === 'Mint' ? 'bg-green-100 text-green-700' :
                      tx.type === 'Burn' ? 'bg-red-100 text-red-700' :
                      tx.type === 'Transfer' ? 'bg-blue-100 text-blue-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>
                      {tx.type}
                    </span>
                  </td>
                  <td className="p-4 font-medium">{tx.amount}</td>
                  <td className="p-4 text-sm text-gray-600">{tx.chain}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                      tx.status === 'Completed' ? 'bg-green-100 text-green-700' :
                      tx.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {tx.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-500">{tx.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pending Approvals Alert */}
      {stats.pendingApprovals > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="font-medium text-yellow-800">
                {stats.pendingApprovals} Pending Approvals
              </p>
              <p className="text-sm text-yellow-700">Review multi-sig transactions requiring your approval</p>
            </div>
          </div>
          <button className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm font-medium">
            Review Now
          </button>
        </div>
      )}
    </div>
  )
}