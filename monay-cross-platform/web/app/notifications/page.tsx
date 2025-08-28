'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import {
  Bell,
  BellOff,
  Check,
  CheckCheck,
  X,
  Settings,
  Mail,
  MessageSquare,
  Smartphone,
  Monitor,
  DollarSign,
  Shield,
  AlertCircle,
  UserPlus,
  Calendar,
  Clock,
  Trash2,
  Filter
} from 'lucide-react';

interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'payment' | 'request' | 'security' | 'account' | 'system';
  read: boolean;
  createdAt: string;
  metadata?: Record<string, any>;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'unread' | 'payment' | 'security'>('all');
  const [showSettings, setShowSettings] = useState(false);
  
  // Notification preferences
  const [preferences, setPreferences] = useState({
    email: {
      payments: true,
      requests: true,
      security: true,
      marketing: false
    },
    sms: {
      payments: true,
      security: true,
      largeTransactions: true
    },
    push: {
      all: true
    }
  });

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      // Add authorization header if user is logged in
      const token = localStorage.getItem('auth_token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch('/api/notifications?userId=user123', {
        headers
      });
      const data = await response.json();
      
      if (response.ok) {
        setNotifications(data.notifications || data.data || []);
        setUnreadCount(data.unreadCount || 0);
      } else {
        console.error('Notification fetch error:', data.error);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ 
          notificationId, 
          userId: 'user123',
          status: 'read'
        })
      });
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      // Mark all notifications as read
      const unreadNotifications = notifications.filter(n => !n.read);
      
      for (const notification of unreadNotifications) {
        await markAsRead(notification.id);
      }
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const clearNotifications = async (type?: string) => {
    try {
      const params = type ? `?userId=user123&type=${type}` : '?userId=user123';
      const response = await fetch(`/api/notifications/clear${params}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        if (type) {
          setNotifications(prev => prev.filter(n => n.type !== type));
        } else {
          setNotifications([]);
        }
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Failed to clear notifications:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'payment':
        return <DollarSign className="h-5 w-5 text-green-600" />;
      case 'request':
        return <Calendar className="h-5 w-5 text-blue-600" />;
      case 'security':
        return <Shield className="h-5 w-5 text-red-600" />;
      case 'account':
        return <UserPlus className="h-5 w-5 text-purple-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const filteredNotifications = notifications.filter(n => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'unread') return !n.read;
    if (selectedFilter === 'payment') return n.type === 'payment';
    if (selectedFilter === 'security') return n.type === 'security';
    return true;
  });

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-600 mt-2">
              {unreadCount > 0 ? `You have ${unreadCount} unread notifications` : 'All caught up!'}
            </p>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-3 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all"
            >
              <Settings className="h-5 w-5" />
            </button>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-4 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all flex items-center"
              >
                <CheckCheck className="h-5 w-5 mr-2" />
                Mark all read
              </button>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-2 bg-gray-100 p-1 rounded-xl w-fit">
          {(['all', 'unread', 'payment', 'security'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`px-4 py-2 rounded-lg font-medium transition-all capitalize ${
                selectedFilter === filter
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {filter === 'all' && 'All'}
              {filter === 'unread' && `Unread (${unreadCount})`}
              {filter === 'payment' && 'Payments'}
              {filter === 'security' && 'Security'}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-3xl overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading notifications...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-12 text-center">
              <BellOff className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No notifications</h3>
              <p className="text-gray-600">
                {selectedFilter === 'unread' 
                  ? "You're all caught up!"
                  : "No notifications to show"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-6 hover:bg-gray-50 transition-all cursor-pointer ${
                    !notification.read ? 'bg-purple-50 bg-opacity-30' : ''
                  }`}
                  onClick={() => !notification.read && markAsRead(notification.id)}
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className={`font-semibold text-gray-900 ${
                            !notification.read ? 'font-bold' : ''
                          }`}>
                            {notification.title}
                          </h3>
                          <p className="text-gray-600 mt-1">{notification.message}</p>
                          <p className="text-sm text-gray-500 mt-2">
                            {getTimeAgo(notification.createdAt)}
                          </p>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {!notification.read && (
                            <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // Handle delete
                            }}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {filteredNotifications.length > 0 && (
            <div className="p-4 border-t border-gray-100">
              <button
                onClick={() => clearNotifications()}
                className="text-red-600 font-medium hover:text-red-700 flex items-center mx-auto"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear all notifications
              </button>
            </div>
          )}
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="bg-white rounded-3xl p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Notification Preferences</h2>
            
            {/* Email Notifications */}
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <Mail className="h-5 w-5 text-gray-600 mr-2" />
                <h3 className="font-medium text-gray-900">Email Notifications</h3>
              </div>
              
              <div className="space-y-3 ml-7">
                {Object.entries(preferences.email).map(([key, value]) => (
                  <label key={key} className="flex items-center justify-between">
                    <span className="text-gray-700 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => setPreferences(prev => ({
                        ...prev,
                        email: { ...prev.email, [key]: e.target.checked }
                      }))}
                      className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                    />
                  </label>
                ))}
              </div>
            </div>

            {/* SMS Notifications */}
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <MessageSquare className="h-5 w-5 text-gray-600 mr-2" />
                <h3 className="font-medium text-gray-900">SMS Notifications</h3>
              </div>
              
              <div className="space-y-3 ml-7">
                {Object.entries(preferences.sms).map(([key, value]) => (
                  <label key={key} className="flex items-center justify-between">
                    <span className="text-gray-700 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => setPreferences(prev => ({
                        ...prev,
                        sms: { ...prev.sms, [key]: e.target.checked }
                      }))}
                      className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                    />
                  </label>
                ))}
              </div>
            </div>

            {/* Push Notifications */}
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <Smartphone className="h-5 w-5 text-gray-600 mr-2" />
                <h3 className="font-medium text-gray-900">Push Notifications</h3>
              </div>
              
              <div className="space-y-3 ml-7">
                <label className="flex items-center justify-between">
                  <span className="text-gray-700">All push notifications</span>
                  <input
                    type="checkbox"
                    checked={preferences.push.all}
                    onChange={(e) => setPreferences(prev => ({
                      ...prev,
                      push: { all: e.target.checked }
                    }))}
                    className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                  />
                </label>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => {
                  // Save preferences
                  setShowSettings(false);
                }}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
              >
                Save Preferences
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}