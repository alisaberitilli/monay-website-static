'use client'

import { useState } from 'react'

const API_URL = 'http://localhost:3001/api'

export default function Compliance() {
  const [activeTab, setActiveTab] = useState<'overview' | 'kyc' | 'monitoring'>('overview')
  
  const complianceStats = {
    kycPending: 23,
    kycApproved: 1247,
    flaggedTransactions: 5,
    complianceScore: 98.5,
    riskAlerts: 2
  }

  const kycApplications = [
    { id: '1', name: 'John Doe', email: 'john@example.com', status: 'pending', level: 'enhanced', date: '2024-01-30' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', status: 'approved', level: 'standard', date: '2024-01-29' },
    { id: '3', name: 'Bob Wilson', email: 'bob@example.com', status: 'review', level: 'enhanced', date: '2024-01-28' }
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Compliance Management</h2>
          <p className="text-gray-600 mt-1">KYC/AML monitoring and compliance operations</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Generate Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <p className="text-sm text-gray-500">KYC Pending</p>
          <p className="text-2xl font-bold mt-1">{complianceStats.kycPending}</p>
          <p className="text-sm text-yellow-600 mt-1">Requires review</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <p className="text-sm text-gray-500">Verified Users</p>
          <p className="text-2xl font-bold mt-1">{complianceStats.kycApproved}</p>
          <p className="text-sm text-green-600 mt-1">All compliant</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <p className="text-sm text-gray-500">Flagged Transactions</p>
          <p className="text-2xl font-bold mt-1">{complianceStats.flaggedTransactions}</p>
          <p className="text-sm text-red-600 mt-1">Under review</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <p className="text-sm text-gray-500">Compliance Score</p>
          <p className="text-2xl font-bold mt-1">{complianceStats.complianceScore}%</p>
          <p className="text-sm text-green-600 mt-1">Excellent</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border">
        <div className="border-b">
          <div className="flex gap-6 px-6">
            {(['overview', 'kyc', 'monitoring'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3 px-1 border-b-2 font-medium text-sm capitalize ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab === 'kyc' ? 'KYC/AML' : tab}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'overview' && (
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-4">Compliance Status</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">FinCEN Registration</span>
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">Active</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">State Licenses</span>
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">47 States</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Last Audit</span>
                    <span className="text-sm font-medium">Jan 15, 2024</span>
                  </div>
                </div>
              </div>
              
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-4">Risk Alerts</h3>
                {complianceStats.riskAlerts > 0 ? (
                  <div className="space-y-2">
                    <div className="p-2 bg-yellow-50 rounded">
                      <p className="text-sm font-medium text-yellow-800">High velocity detected</p>
                      <p className="text-xs text-yellow-600 mt-1">User ID: USR-4821</p>
                    </div>
                    <div className="p-2 bg-yellow-50 rounded">
                      <p className="text-sm font-medium text-yellow-800">Large transaction flagged</p>
                      <p className="text-xs text-yellow-600 mt-1">Amount: $125,000</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No active alerts</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'kyc' && (
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 text-sm font-medium text-gray-600">Name</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600">Email</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600">KYC Level</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600">Status</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600">Date</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {kycApplications.map((app) => (
                    <tr key={app.id} className="border-b hover:bg-gray-50">
                      <td className="p-4 font-medium">{app.name}</td>
                      <td className="p-4">{app.email}</td>
                      <td className="p-4">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                          {app.level}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          app.status === 'approved' ? 'bg-green-100 text-green-700' :
                          app.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-orange-100 text-orange-700'
                        }`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="p-4 text-sm">{app.date}</td>
                      <td className="p-4">
                        <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">
                          Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}