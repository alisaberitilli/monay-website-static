'use client'

import { useState } from 'react'

const API_URL = 'http://localhost:3001/api'

export default function Analytics() {
  const [timeRange, setTimeRange] = useState('30d')
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
          <p className="text-gray-600 mt-1">Real-time metrics and insights</p>
        </div>
        <select 
          value={timeRange} 
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="24h">Last 24 Hours</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="90d">Last 90 Days</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <p className="text-sm text-gray-500">Transaction Volume</p>
          <p className="text-2xl font-bold mt-1">$45.2M</p>
          <p className="text-sm text-green-600 mt-1">+23.5% vs prev period</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <p className="text-sm text-gray-500">Active Users</p>
          <p className="text-2xl font-bold mt-1">1,247</p>
          <p className="text-sm text-green-600 mt-1">+12% growth</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <p className="text-sm text-gray-500">Avg Transaction</p>
          <p className="text-2xl font-bold mt-1">$3,625</p>
          <p className="text-sm text-blue-600 mt-1">Enterprise focus</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <p className="text-sm text-gray-500">Success Rate</p>
          <p className="text-2xl font-bold mt-1">99.8%</p>
          <p className="text-sm text-green-600 mt-1">Excellent</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="font-semibold mb-4">Transaction Volume Trend</h3>
          <div className="h-64 bg-gray-50 rounded flex items-center justify-center">
            <p className="text-gray-500">Chart: Transaction volume over time</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="font-semibold mb-4">Payment Methods Distribution</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span className="text-sm">USDM</span>
              </div>
              <span className="font-medium">45%</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-sm">ACH</span>
              </div>
              <span className="font-medium">25%</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-purple-500 rounded"></div>
                <span className="text-sm">Card</span>
              </div>
              <span className="font-medium">20%</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                <span className="text-sm">Wire/SWIFT</span>
              </div>
              <span className="font-medium">10%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="font-semibold mb-4">Top Transactions</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-4 text-sm font-medium text-gray-600">Date</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">Type</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">Amount</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">Method</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b hover:bg-gray-50">
                <td className="p-4 text-sm">2024-01-30</td>
                <td className="p-4 text-sm">Outbound</td>
                <td className="p-4 font-medium">$250,000</td>
                <td className="p-4 text-sm">USDM</td>
                <td className="p-4">
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">Completed</span>
                </td>
              </tr>
              <tr className="border-b hover:bg-gray-50">
                <td className="p-4 text-sm">2024-01-29</td>
                <td className="p-4 text-sm">Inbound</td>
                <td className="p-4 font-medium">$180,000</td>
                <td className="p-4 text-sm">Wire</td>
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