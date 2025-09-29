'use client';

import { useState } from 'react';
import { 
  User, 
  Shield, 
  CreditCard, 
  FileText, 
  Bell, 
  Moon, 
  Globe, 
  HelpCircle, 
  MessageCircle,
  ChevronRight,
  Settings,
  LogOut
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      logout();
    }
  };

  const profileSections = [
    {
      title: 'Account',
      items: [
        {
          icon: User,
          title: 'Personal Information',
          subtitle: 'Update your personal details',
          action: () => alert('Personal Information settings coming soon'),
        },
        {
          icon: Shield,
          title: 'Security',
          subtitle: 'Change password, enable 2FA',
          action: () => alert('Security settings coming soon'),
        },
        {
          icon: CreditCard,
          title: 'Payment Methods',
          subtitle: 'Manage your cards and bank accounts',
          action: () => alert('Payment methods coming soon'),
        },
        {
          icon: FileText,
          title: 'KYC Verification',
          subtitle: `Status: ${user?.kycStatus?.toUpperCase()}`,
          action: () => alert('KYC verification coming soon'),
        },
      ],
    },
    {
      title: 'Preferences',
      items: [
        {
          icon: Bell,
          title: 'Notifications',
          subtitle: 'Push notifications, email alerts',
          action: () => alert('Notification settings coming soon'),
        },
        {
          icon: Moon,
          title: 'Dark Mode',
          subtitle: 'Coming soon',
          action: () => alert('Dark mode will be available soon'),
        },
        {
          icon: Globe,
          title: 'Language',
          subtitle: 'English (US)',
          action: () => alert('Language selection coming soon'),
        },
        {
          icon: Settings,
          title: 'Currency',
          subtitle: 'USD ($)',
          action: () => alert('Currency selection coming soon'),
        },
      ],
    },
    {
      title: 'Support & Legal',
      items: [
        {
          icon: HelpCircle,
          title: 'Help Center',
          subtitle: 'FAQs and support articles',
          action: () => alert('Help center coming soon'),
        },
        {
          icon: MessageCircle,
          title: 'Contact Support',
          subtitle: 'Get help from our team',
          action: () => alert('Support chat coming soon'),
        },
        {
          icon: FileText,
          title: 'Privacy Policy',
          subtitle: '',
          action: () => alert('Privacy policy coming soon'),
        },
        {
          icon: FileText,
          title: 'Terms of Service',
          subtitle: '',
          action: () => alert('Terms of service coming soon'),
        },
      ],
    },
  ];

  const getVerificationBadge = (isVerified: boolean, type: string) => (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
      isVerified 
        ? 'bg-green-100 text-green-800' 
        : 'bg-yellow-100 text-yellow-800'
    }`}>
      {type} {isVerified ? 'Verified' : 'Unverified'}
    </span>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Profile</h1>

      {/* User Info Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-6">
          <div className="w-20 h-20 bg-primary-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900">
              {user?.firstName} {user?.lastName}
            </h2>
            <p className="text-gray-600 mt-1">{user?.email}</p>
            <p className="text-gray-600">{user?.mobileNumber}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              {getVerificationBadge(user?.isEmailVerified || false, 'Email')}
              {getVerificationBadge(user?.isMobileVerified || false, 'Mobile')}
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                user?.kycStatus === 'approved' 
                  ? 'bg-green-100 text-green-800' 
                  : user?.kycStatus === 'pending'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                KYC {user?.kycStatus?.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Sections */}
      {profileSections.map((section, sectionIndex) => (
        <div key={sectionIndex} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {section.items.map((item, itemIndex) => (
              <button
                key={itemIndex}
                onClick={item.action}
                className="w-full flex items-center space-x-4 px-6 py-4 hover:bg-gray-50 transition-colors text-left"
              >
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <item.icon className="h-5 w-5 text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900">{item.title}</div>
                  {item.subtitle && (
                    <div className="text-xs text-gray-500 mt-1">{item.subtitle}</div>
                  )}
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Logout Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-4 px-6 py-4 hover:bg-red-50 transition-colors text-left rounded-xl"
        >
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
            <LogOut className="h-5 w-5 text-red-600" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-red-600">Sign Out</div>
          </div>
        </button>
      </div>

      {/* App Version */}
      <div className="text-center py-4">
        <p className="text-sm text-gray-500">Monay Wallet v1.0.0</p>
      </div>
    </div>
  );
}