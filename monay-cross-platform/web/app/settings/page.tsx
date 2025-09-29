'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  User,
  Bell,
  Shield,
  CreditCard,
  Smartphone,
  Globe,
  Moon,
  Sun,
  Lock,
  Key,
  Mail,
  MessageSquare,
  Volume2,
  Wifi,
  Download,
  Trash2,
  ChevronRight,
  Toggle,
  Check,
  X,
  Eye,
  EyeOff,
  Fingerprint,
  FaceIcon,
  Palette,
  Languages
} from 'lucide-react';

interface SettingSection {
  id: string;
  title: string;
  description: string;
  icon: any;
  items: SettingItem[];
}

interface SettingItem {
  id: string;
  label: string;
  description?: string;
  type: 'toggle' | 'select' | 'button' | 'input';
  value?: boolean | string;
  options?: string[];
}

export default function SettingsPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState({
    push: true,
    email: true,
    sms: false,
    transactions: true,
    marketing: false,
    security: true
  });
  const [security, setSecurity] = useState({
    twoFactor: true,
    biometric: false,
    faceId: true,
    autoLock: '5 minutes'
  });

  const settingSections: SettingSection[] = [
    {
      id: 'profile',
      title: 'Profile Settings',
      description: 'Manage your personal information',
      icon: User,
      items: [
        { id: 'name', label: 'Full Name', type: 'input', value: 'John Doe' },
        { id: 'email', label: 'Email Address', type: 'input', value: 'john.doe@example.com' },
        { id: 'phone', label: 'Phone Number', type: 'input', value: '+1 234 567 8900' },
        { id: 'address', label: 'Billing Address', type: 'button' }
      ]
    },
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'Configure how you receive updates',
      icon: Bell,
      items: [
        { id: 'push', label: 'Push Notifications', description: 'Receive push notifications on your device', type: 'toggle', value: notifications.push },
        { id: 'email', label: 'Email Notifications', description: 'Get updates via email', type: 'toggle', value: notifications.email },
        { id: 'sms', label: 'SMS Alerts', description: 'Receive important alerts via SMS', type: 'toggle', value: notifications.sms },
        { id: 'transactions', label: 'Transaction Alerts', description: 'Get notified for every transaction', type: 'toggle', value: notifications.transactions },
        { id: 'marketing', label: 'Marketing Updates', description: 'Receive promotional offers and news', type: 'toggle', value: notifications.marketing }
      ]
    },
    {
      id: 'security',
      title: 'Security & Privacy',
      description: 'Keep your account secure',
      icon: Shield,
      items: [
        { id: 'password', label: 'Change Password', type: 'button' },
        { id: 'twoFactor', label: 'Two-Factor Authentication', description: 'Add an extra layer of security', type: 'toggle', value: security.twoFactor },
        { id: 'biometric', label: 'Biometric Login', description: 'Use fingerprint to login', type: 'toggle', value: security.biometric },
        { id: 'faceId', label: 'Face ID', description: 'Enable Face ID for quick access', type: 'toggle', value: security.faceId },
        { id: 'autoLock', label: 'Auto-Lock', description: 'Automatically lock app after inactivity', type: 'select', value: security.autoLock, options: ['1 minute', '5 minutes', '15 minutes', 'Never'] }
      ]
    },
    {
      id: 'payment',
      title: 'Payment Methods',
      description: 'Manage your payment options',
      icon: CreditCard,
      items: [
        { id: 'cards', label: 'Saved Cards', type: 'button' },
        { id: 'banks', label: 'Bank Accounts', type: 'button' },
        { id: 'wallets', label: 'Digital Wallets', type: 'button' },
        { id: 'limits', label: 'Transaction Limits', type: 'button' }
      ]
    },
    {
      id: 'appearance',
      title: 'Appearance',
      description: 'Customize your app experience',
      icon: Palette,
      items: [
        { id: 'theme', label: 'Dark Mode', description: 'Switch between light and dark themes', type: 'toggle', value: darkMode },
        { id: 'language', label: 'Language', type: 'select', value: 'English', options: ['English', 'Spanish', 'French', 'German'] },
        { id: 'currency', label: 'Currency', type: 'select', value: 'USD', options: ['USD', 'EUR', 'GBP', 'JPY'] },
        { id: 'dateFormat', label: 'Date Format', type: 'select', value: 'MM/DD/YYYY', options: ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'] }
      ]
    }
  ];

  const handleToggle = (sectionId: string, itemId: string) => {
    if (sectionId === 'notifications') {
      setNotifications(prev => ({
        ...prev,
        [itemId]: !prev[itemId as keyof typeof notifications]
      }));
    } else if (sectionId === 'security') {
      setSecurity(prev => ({
        ...prev,
        [itemId]: !prev[itemId as keyof typeof security]
      }));
    } else if (itemId === 'theme') {
      setDarkMode(!darkMode);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">Manage your account preferences and settings</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>
              
              <div className="space-y-3">
                <button className="w-full text-left p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl hover:from-purple-100 hover:to-pink-100 transition-all group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                        <Key className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Change PIN</p>
                        <p className="text-xs text-gray-500">Update your security PIN</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600" />
                  </div>
                </button>

                <button className="w-full text-left p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-xl flex items-center justify-center">
                        <Download className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Export Data</p>
                        <p className="text-xs text-gray-500">Download your information</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600" />
                  </div>
                </button>

                <button className="w-full text-left p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-xl flex items-center justify-center">
                        <MessageSquare className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Support</p>
                        <p className="text-xs text-gray-500">Get help from our team</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600" />
                  </div>
                </button>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">App Version</span>
                    <span className="font-medium text-gray-900">2.4.1</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Last Backup</span>
                    <span className="font-medium text-gray-900">2 hours ago</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Device</span>
                    <span className="font-medium text-gray-900">iPhone 14 Pro</span>
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="text-sm font-medium text-red-600 mb-3">Danger Zone</h4>
                <button className="w-full p-3 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 transition-all flex items-center justify-center">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Account
                </button>
              </div>
            </div>
          </div>

          {/* Settings Sections */}
          <div className="lg:col-span-2 space-y-6">
            {settingSections.map((section) => {
              const Icon = section.icon;
              return (
                <div key={section.id} className="bg-white rounded-3xl p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center">
                      <Icon className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
                      <p className="text-sm text-gray-500">{section.description}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {section.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between py-3">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{item.label}</p>
                          {item.description && (
                            <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                          )}
                        </div>

                        {item.type === 'toggle' && (
                          <button
                            onClick={() => handleToggle(section.id, item.id)}
                            className={`relative w-12 h-6 rounded-full transition-colors ${
                              item.value ? 'bg-purple-600' : 'bg-gray-300'
                            }`}
                          >
                            <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                              item.value ? 'translate-x-6' : 'translate-x-0.5'
                            }`} />
                          </button>
                        )}

                        {item.type === 'select' && (
                          <select className="px-4 py-2 bg-gray-50 rounded-xl border-0 focus:ring-2 focus:ring-purple-500">
                            {item.options?.map(option => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                        )}

                        {item.type === 'button' && (
                          <button className="flex items-center text-purple-600 font-medium">
                            Manage
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </button>
                        )}

                        {item.type === 'input' && (
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-600">{item.value}</span>
                            <button className="text-purple-600 font-medium">Edit</button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Save Changes Button */}
            <button className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-medium hover:shadow-lg transition-all">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}