'use client'

import { useState } from 'react'

const API_URL = 'http://localhost:3001/api'

export default function CrossRailTransfer() {
  const [sourceRail, setSourceRail] = useState('base')
  const [destRail, setDestRail] = useState('solana')
  const [amount, setAmount] = useState('')
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Cross-Rail Transfer</h2>
        <p className="text-gray-600 mt-1">Transfer assets between Base L2 and Solana</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <p className="text-sm text-gray-500">Base L2 Balance</p>
          <p className="text-2xl font-bold mt-1">$1,250,000</p>
          <p className="text-sm text-gray-600 mt-1">250,000 USDM</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <p className="text-sm text-gray-500">Solana Balance</p>
          <p className="text-2xl font-bold mt-1">$50,000</p>
          <p className="text-sm text-gray-600 mt-1">50,000 USDM</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <p className="text-sm text-gray-500">Pending Transfers</p>
          <p className="text-2xl font-bold mt-1">0</p>
          <p className="text-sm text-green-600 mt-1">All settled</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="font-semibold mb-6">New Cross-Rail Transfer</h3>
        
        <div className="max-w-2xl space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Source Rail</label>
              <select 
                value={sourceRail}
                onChange={(e) => {
                  setSourceRail(e.target.value)
                  setDestRail(e.target.value === 'base' ? 'solana' : 'base')
                }}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="base">Base L2 (EVM)</option>
                <option value="solana">Solana</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Destination Rail</label>
              <select 
                value={destRail}
                onChange={(e) => setDestRail(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                disabled
              >
                <option value="base">Base L2 (EVM)</option>
                <option value="solana">Solana</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Amount (USDM)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Enter amount to transfer"
            />
            <p className="text-xs text-gray-500 mt-1">
              Available: {sourceRail === 'base' ? '250,000' : '50,000'} USDM
            </p>
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Transfer Details</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Network Fee</span>
                <span>~$2.50</span>
              </div>
              <div className="flex justify-between">
                <span>Bridge Fee (0.1%)</span>
                <span>{amount ? `$${(parseFloat(amount) * 0.001).toFixed(2)}` : '$0.00'}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Time</span>
                <span>&lt; 60 seconds</span>
              </div>
            </div>
          </div>

          <button className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
            Initiate Transfer
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="font-semibold mb-4">Recent Transfers</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-4 text-sm font-medium text-gray-600">Date</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">Direction</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">Amount</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">Duration</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b hover:bg-gray-50">
                <td className="p-4 text-sm">2024-01-30 14:23</td>
                <td className="p-4 text-sm">Base → Solana</td>
                <td className="p-4 font-medium">25,000 USDM</td>
                <td className="p-4 text-sm">45 sec</td>
                <td className="p-4">
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">Completed</span>
                </td>
              </tr>
              <tr className="border-b hover:bg-gray-50">
                <td className="p-4 text-sm">2024-01-29 10:15</td>
                <td className="p-4 text-sm">Solana → Base</td>
                <td className="p-4 font-medium">50,000 USDM</td>
                <td className="p-4 text-sm">52 sec</td>
                <td className="p-4">
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">Completed</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}