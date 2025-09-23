'use client'

import { useState } from 'react'
import { api, handleApiError } from '@/lib/api-client'
import { toast } from 'react-hot-toast'

export default function Settings() {
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'api' | 'notifications'>('profile')
  const [loading, setLoading] = useState(false)
  const [profileData, setProfileData] = useState({
    organizationName: 'Acme Corporation',
    email: 'admin@acme.com',
    timezone: 'America/New_York'
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [apiKeys, setApiKeys] = useState([
    { id: '1', type: 'Production', key: 'sk_live_abc123...xyz789', active: true },
    { id: '2', type: 'Test', key: 'sk_test_def456...uvw012', active: true }
  ])
  const [notifications, setNotifications] = useState({
    transactionConfirmations: true,
    kycUpdates: true,
    complianceAlerts: true,
    systemMaintenance: true,
    productUpdates: true
  })
  
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
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-lg"
                  value={profileData.organizationName}
                  onChange={(e) => setProfileData({...profileData, organizationName: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border rounded-lg"
                  value={profileData.email}
                  onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Time Zone</label>
                <select
                  className="w-full px-3 py-2 border rounded-lg"
                  value={profileData.timezone}
                  onChange={(e) => setProfileData({...profileData, timezone: e.target.value})}>
                  <option value="America/New_York">America/New_York</option>
                  <option value="America/Los_Angeles">America/Los_Angeles</option>
                  <option value="Europe/London">Europe/London</option>
                </select>
              </div>
              <button
                onClick={async () => {
                  setLoading(true)
                  try {
                    // In production, this would call the actual API
                    await new Promise(resolve => setTimeout(resolve, 1000))
                    toast.success('Profile updated successfully')
                  } catch (error) {
                    toast.error(handleApiError(error))
                  } finally {
                    setLoading(false)
                  }
                }}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                {loading ? 'Saving...' : 'Save Changes'}
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
                <button
                  onClick={async () => {
                    setLoading(true)
                    try {
                      // In production, this would initiate 2FA setup
                      await new Promise(resolve => setTimeout(resolve, 1000))
                      toast.success('2FA setup initiated. Check your email for instructions.')
                    } catch (error) {
                      toast.error(handleApiError(error))
                    } finally {
                      setLoading(false)
                    }
                  }}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                  {loading ? 'Enabling...' : 'Enable 2FA'}
                </button>
              </div>
              
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">Change Password</h3>
                <div className="space-y-3 mt-4">
                  <input
                    type="password"
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Current Password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                  />
                  <input
                    type="password"
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="New Password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  />
                  <input
                    type="password"
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Confirm Password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  />
                  <button
                    onClick={async () => {
                      if (passwordData.newPassword !== passwordData.confirmPassword) {
                        toast.error('Passwords do not match')
                        return
                      }
                      if (!passwordData.currentPassword || !passwordData.newPassword) {
                        toast.error('Please fill in all password fields')
                        return
                      }
                      setLoading(true)
                      try {
                        // In production, this would update the password
                        await new Promise(resolve => setTimeout(resolve, 1000))
                        toast.success('Password updated successfully')
                        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
                      } catch (error) {
                        toast.error(handleApiError(error))
                      } finally {
                        setLoading(false)
                      }
                    }}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                    {loading ? 'Updating...' : 'Update Password'}
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
                <button
                  onClick={async () => {
                    setLoading(true)
                    try {
                      // Generate a mock API key
                      const newKey = {
                        id: Date.now().toString(),
                        type: 'Custom',
                        key: `sk_custom_${Math.random().toString(36).substr(2, 9)}...${Math.random().toString(36).substr(2, 6)}`,
                        active: true
                      }
                      setApiKeys([...apiKeys, newKey])
                      toast.success('New API key generated successfully')
                    } catch (error) {
                      toast.error(handleApiError(error))
                    } finally {
                      setLoading(false)
                    }
                  }}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                  {loading ? 'Generating...' : 'Generate New Key'}
                </button>
              </div>
              
              <div className="border rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Production Key</p>
                    <code className="text-sm text-gray-600">sk_live_abc123...xyz789</code>
                  </div>
                  <button
                    onClick={async () => {
                      if (confirm('Are you sure you want to revoke this Production API key?')) {
                        setLoading(true)
                        try {
                          await new Promise(resolve => setTimeout(resolve, 1000))
                          setApiKeys(apiKeys.map(k => k.id === '1' ? {...k, active: false} : k))
                          toast.success('API key revoked successfully')
                        } catch (error) {
                          toast.error(handleApiError(error))
                        } finally {
                          setLoading(false)
                        }
                      }
                    }}
                    disabled={loading}
                    className="px-3 py-1 border border-red-300 text-red-600 rounded hover:bg-red-50 disabled:opacity-50">
                    {loading ? 'Revoking...' : 'Revoke'}
                  </button>
                </div>
              </div>
              
              <div className="border rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Test Key</p>
                    <code className="text-sm text-gray-600">sk_test_def456...uvw012</code>
                  </div>
                  <button
                    onClick={async () => {
                      if (confirm('Are you sure you want to revoke this Test API key?')) {
                        setLoading(true)
                        try {
                          await new Promise(resolve => setTimeout(resolve, 1000))
                          setApiKeys(apiKeys.map(k => k.id === '2' ? {...k, active: false} : k))
                          toast.success('API key revoked successfully')
                        } catch (error) {
                          toast.error(handleApiError(error))
                        } finally {
                          setLoading(false)
                        }
                      }
                    }}
                    disabled={loading}
                    className="px-3 py-1 border border-red-300 text-red-600 rounded hover:bg-red-50 disabled:opacity-50">
                    {loading ? 'Revoking...' : 'Revoke'}
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
              <button
                onClick={async () => {
                  setLoading(true)
                  try {
                    // In production, this would save notification preferences
                    await new Promise(resolve => setTimeout(resolve, 1000))
                    toast.success('Notification preferences saved successfully')
                  } catch (error) {
                    toast.error(handleApiError(error))
                  } finally {
                    setLoading(false)
                  }
                }}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                {loading ? 'Saving...' : 'Save Preferences'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}