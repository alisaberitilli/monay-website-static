'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from 'next-themes'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  User, Shield, Bell, Globe, Key, CreditCard, 
  Palette, Code, Database, Activity, Lock, Mail,
  Smartphone, Monitor, Sun, Moon, Check, AlertCircle
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function EnhancedSettings() {
  const [activeSection, setActiveSection] = useState('profile')
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    transactions: true,
    security: true,
    marketing: false
  })
  const [twoFactor, setTwoFactor] = useState(true)

  useEffect(() => {
    setMounted(true)
  }, [])

  const sections = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'api', label: 'API Keys', icon: Key },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'integrations', label: 'Integrations', icon: Globe },
    { id: 'advanced', label: 'Advanced', icon: Code }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  }

  const saveSettings = () => {
    toast.success('Settings saved successfully!')
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Settings
        </h2>
        <p className="text-gray-600 mt-1">Manage your account preferences and configurations</p>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <Card className="glass-card">
            <CardContent className="p-4">
              <nav className="space-y-1">
                {sections.map((section) => {
                  const Icon = section.icon
                  return (
                    <motion.button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                        activeSection === section.id
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-sm font-medium">{section.label}</span>
                    </motion.button>
                  )
                })}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Profile Section */}
          {activeSection === 'profile' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Update your personal details and preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold">
                      JD
                    </div>
                    <div>
                      <Button variant="outline">Change Avatar</Button>
                      <p className="text-xs text-gray-500 mt-1">JPG, PNG or GIF. Max 2MB</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Full Name</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        defaultValue="John Doe"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Email</label>
                      <input
                        type="email"
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        defaultValue="john.doe@enterprise.com"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Phone</label>
                      <input
                        type="tel"
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        defaultValue="+1 (555) 123-4567"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Role</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border rounded-lg bg-gray-50"
                        defaultValue="Enterprise Admin"
                        disabled
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Bio</label>
                    <textarea
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                  
                  <Button variant="gradient" onClick={saveSettings}>
                    Save Profile
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Security Section */}
          {activeSection === 'security' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>Manage your account security and authentication</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Password */}
                  <div>
                    <h3 className="font-semibold mb-3">Password</h3>
                    <div className="space-y-3">
                      <input
                        type="password"
                        className="w-full px-3 py-2 border rounded-lg"
                        placeholder="Current password"
                      />
                      <input
                        type="password"
                        className="w-full px-3 py-2 border rounded-lg"
                        placeholder="New password"
                      />
                      <input
                        type="password"
                        className="w-full px-3 py-2 border rounded-lg"
                        placeholder="Confirm new password"
                      />
                      <Button variant="outline">Update Password</Button>
                    </div>
                  </div>

                  {/* Two-Factor Authentication */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-semibold">Two-Factor Authentication</h3>
                        <p className="text-sm text-gray-500">Add an extra layer of security</p>
                      </div>
                      <Button
                        variant={twoFactor ? 'gradient' : 'outline'}
                        onClick={() => {
                          setTwoFactor(!twoFactor)
                          toast.success(twoFactor ? '2FA disabled' : '2FA enabled')
                        }}
                      >
                        {twoFactor ? 'Enabled' : 'Enable'}
                      </Button>
                    </div>
                    {twoFactor && (
                      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Check className="h-5 w-5 text-green-600" />
                          <span className="text-sm text-green-700 dark:text-green-400">
                            Two-factor authentication is active
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Session Management */}
                  <div>
                    <h3 className="font-semibold mb-3">Active Sessions</h3>
                    <div className="space-y-2">
                      {[
                        { device: 'MacBook Pro', location: 'San Francisco, CA', time: 'Current session' },
                        { device: 'iPhone 14', location: 'San Francisco, CA', time: '2 hours ago' }
                      ].map((session, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            {session.device.includes('MacBook') ? (
                              <Monitor className="h-5 w-5 text-gray-500" />
                            ) : (
                              <Smartphone className="h-5 w-5 text-gray-500" />
                            )}
                            <div>
                              <p className="text-sm font-medium">{session.device}</p>
                              <p className="text-xs text-gray-500">{session.location} • {session.time}</p>
                            </div>
                          </div>
                          {index > 0 && (
                            <Button variant="outline" size="sm">
                              Revoke
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Notifications Section */}
          {activeSection === 'notifications' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>Choose how you want to be notified</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Notification Channels */}
                  <div>
                    <h3 className="font-semibold mb-4">Notification Channels</h3>
                    <div className="space-y-3">
                      {[
                        { id: 'email', label: 'Email Notifications', icon: Mail },
                        { id: 'push', label: 'Push Notifications', icon: Bell },
                        { id: 'sms', label: 'SMS Notifications', icon: Smartphone }
                      ].map((channel) => {
                        const Icon = channel.icon
                        return (
                          <div key={channel.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <Icon className="h-5 w-5 text-gray-500" />
                              <span className="text-sm font-medium">{channel.label}</span>
                            </div>
                            <Button
                              variant={notifications[channel.id as keyof typeof notifications] ? 'gradient' : 'outline'}
                              size="sm"
                              onClick={() => setNotifications({
                                ...notifications,
                                [channel.id]: !notifications[channel.id as keyof typeof notifications]
                              })}
                            >
                              {notifications[channel.id as keyof typeof notifications] ? 'On' : 'Off'}
                            </Button>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Notification Types */}
                  <div>
                    <h3 className="font-semibold mb-4">Notification Types</h3>
                    <div className="space-y-3">
                      {[
                        { id: 'transactions', label: 'Transaction Alerts', description: 'Receive alerts for all transactions' },
                        { id: 'security', label: 'Security Alerts', description: 'Important security and login notifications' },
                        { id: 'marketing', label: 'Marketing Updates', description: 'Product updates and promotional offers' }
                      ].map((type) => (
                        <div key={type.id} className="flex items-start justify-between p-3 border rounded-lg">
                          <div>
                            <p className="text-sm font-medium">{type.label}</p>
                            <p className="text-xs text-gray-500">{type.description}</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={notifications[type.id as keyof typeof notifications]}
                            onChange={(e) => setNotifications({
                              ...notifications,
                              [type.id]: e.target.checked
                            })}
                            className="mt-1 h-4 w-4 text-blue-600 rounded"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <Button variant="gradient" onClick={saveSettings}>
                    Save Preferences
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Appearance Section */}
          {activeSection === 'appearance' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Appearance</CardTitle>
                  <CardDescription>Customize the look and feel of your dashboard</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Theme Selection */}
                  <div>
                    <h3 className="font-semibold mb-4">Theme</h3>
                    {mounted && (
                      <div className="grid grid-cols-3 gap-4">
                        {[
                          { id: 'light', label: 'Light', icon: Sun },
                          { id: 'dark', label: 'Dark', icon: Moon },
                          { id: 'system', label: 'System', icon: Monitor }
                        ].map((themeOption) => {
                          const Icon = themeOption.icon
                          const isActive = theme === themeOption.id
                          return (
                            <motion.button
                              key={themeOption.id}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => {
                                setTheme(themeOption.id)
                                toast.success(`Theme changed to ${themeOption.label}`)
                              }}
                              className={`p-4 border rounded-xl flex flex-col items-center gap-2 transition-all ${
                                isActive
                                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                              }`}
                            >
                              <Icon className="h-6 w-6" />
                              <span className="text-sm font-medium">{themeOption.label}</span>
                            </motion.button>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  {/* Color Scheme */}
                  <div>
                    <h3 className="font-semibold mb-4">Accent Color</h3>
                    <div className="flex gap-3">
                      {[
                        'bg-blue-500',
                        'bg-purple-500',
                        'bg-green-500',
                        'bg-orange-500',
                        'bg-pink-500',
                        'bg-cyan-500'
                      ].map((color) => (
                        <motion.button
                          key={color}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className={`w-10 h-10 rounded-full ${color} shadow-lg`}
                          onClick={() => toast.success('Accent color updated')}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Display Options */}
                  <div>
                    <h3 className="font-semibold mb-4">Display Options</h3>
                    <div className="space-y-3">
                      {[
                        { label: 'Compact Mode', description: 'Reduce spacing between elements' },
                        { label: 'Show Animations', description: 'Enable interface animations' },
                        { label: 'High Contrast', description: 'Increase contrast for better visibility' }
                      ].map((option) => (
                        <div key={option.label} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="text-sm font-medium">{option.label}</p>
                            <p className="text-xs text-gray-500">{option.description}</p>
                          </div>
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-blue-600 rounded"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* API Keys Section */}
          {activeSection === 'api' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>API Keys</CardTitle>
                  <CardDescription>Manage your API keys for integrations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-yellow-600" />
                      <span className="text-sm text-yellow-700 dark:text-yellow-400">
                        Keep your API keys secure and never share them publicly
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {[
                      { name: 'Production API Key', key: 'pk_live_...4567', created: '2024-01-15', lastUsed: '2 hours ago' },
                      { name: 'Development API Key', key: 'pk_test_...8901', created: '2024-01-10', lastUsed: '1 day ago' }
                    ].map((apiKey, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{apiKey.name}</h4>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">Regenerate</Button>
                            <Button variant="outline" size="sm" className="text-red-600">Revoke</Button>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-mono bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded">{apiKey.key}</p>
                          <div className="flex gap-4 text-xs text-gray-500">
                            <span>Created: {apiKey.created}</span>
                            <span>Last used: {apiKey.lastUsed}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <Button variant="gradient">
                    <Key className="h-4 w-4 mr-2" />
                    Generate New API Key
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}