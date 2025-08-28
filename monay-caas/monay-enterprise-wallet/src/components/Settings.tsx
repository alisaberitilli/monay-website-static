'use client'

import { useState } from 'react'

const API_URL = 'http://localhost:3001/api'

export default function Settings() {
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'api' | 'notifications'>('profile')
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Settings</h2>
        <p className="text-gray-600 mt-1">Manage your account and preferences</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border">
        <div className="border-b">
          <div className="flex gap-6 px-6">
            {(['profile', 'security', 'api', 'notifications'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3 px-1 border-b-2 font-medium text-sm capitalize ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab === 'api' ? 'API Keys' : tab}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'profile' && (
          <div className="p-6">
            <div className="max-w-2xl space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Organization Name</label>
                <input type="text" className="w-full px-3 py-2 border rounded-lg" defaultValue="Acme Corporation" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input type="email" className="w-full px-3 py-2 border rounded-lg" defaultValue="admin@acme.com" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Time Zone</label>
                <select className="w-full px-3 py-2 border rounded-lg">
                  <option>America/New_York</option>
                  <option>America/Los_Angeles</option>
                  <option>Europe/London</option>
                </select>
              </div>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Save Changes
              </button>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="p-6">
            <div className="max-w-2xl space-y-6">
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">Two-Factor Authentication</h3>
                <p className="text-sm text-gray-600 mb-4">Add an extra layer of security to your account</p>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Enable 2FA
                </button>
              </div>
              
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">Change Password</h3>
                <div className="space-y-3 mt-4">
                  <input type="password" className="w-full px-3 py-2 border rounded-lg" placeholder="Current Password" />
                  <input type="password" className="w-full px-3 py-2 border rounded-lg" placeholder="New Password" />
                  <input type="password" className="w-full px-3 py-2 border rounded-lg" placeholder="Confirm Password" />
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Update Password
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'api' && (
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">API Keys</h3>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Generate New Key
                </button>
              </div>
              
              <div className="border rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Production Key</p>
                    <code className="text-sm text-gray-600">sk_live_abc123...xyz789</code>
                  </div>
                  <button className="px-3 py-1 border border-red-300 text-red-600 rounded hover:bg-red-50">
                    Revoke
                  </button>
                </div>
              </div>
              
              <div className="border rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Test Key</p>
                    <code className="text-sm text-gray-600">sk_test_def456...uvw012</code>
                  </div>
                  <button className="px-3 py-1 border border-red-300 text-red-600 rounded hover:bg-red-50">
                    Revoke
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="p-6">
            <div className="max-w-2xl space-y-4">
              <h3 className="font-medium">Email Notifications</h3>
              {[
                'Transaction confirmations',
                'KYC status updates',
                'Compliance alerts',
                'System maintenance',
                'Product updates'
              ].map((item) => (
                <label key={item} className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="text-sm">{item}</span>
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                </label>
              ))}
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Save Preferences
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}