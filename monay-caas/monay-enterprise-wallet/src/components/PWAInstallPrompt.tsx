'use client';

import React, { useState, useEffect } from 'react';
import { X, Download, Smartphone, Bell, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { usePWA, usePushNotifications } from '@/hooks/usePWA';
import { motion, AnimatePresence } from 'framer-motion';

const PWAInstallPrompt: React.FC = () => {
  const {
    isInstalled,
    isInstallable,
    isOffline,
    isUpdateAvailable,
    installPWA,
    updateServiceWorker,
    showNotification,
    requestNotificationPermission,
    getCacheInfo,
    clearCaches
  } = usePWA();

  const {
    subscription,
    isSupported: isPushSupported,
    subscribe: subscribeToPush,
    unsubscribe: unsubscribeFromPush
  } = usePushNotifications();

  const [showPrompt, setShowPrompt] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [cacheSize, setCacheSize] = useState<number>(0);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(
    typeof window !== 'undefined' && 'Notification' in window 
      ? Notification.permission 
      : 'default'
  );

  // Show install prompt after delay if not installed
  useEffect(() => {
    if (isInstallable && !isInstalled) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 30000); // Show after 30 seconds

      return () => clearTimeout(timer);
    }
  }, [isInstallable, isInstalled]);

  // Get cache size on mount
  useEffect(() => {
    const fetchCacheInfo = async () => {
      const info = await getCacheInfo();
      if (info) {
        const totalSize = info.reduce((acc, cache) => acc + cache.count, 0);
        setCacheSize(totalSize);
      }
    };

    fetchCacheInfo();
  }, [getCacheInfo]);

  const handleInstall = async () => {
    setInstalling(true);
    const success = await installPWA();
    
    if (success) {
      setShowPrompt(false);
      await showNotification('App Installed!', {
        body: 'Monay Enterprise Wallet has been added to your home screen',
        icon: '/icon-192x192.png'
      });
    }
    
    setInstalling(false);
  };

  const handleNotificationPermission = async () => {
    const permission = await requestNotificationPermission();
    setNotificationPermission(permission as NotificationPermission);
    
    if (permission === 'granted') {
      await showNotification('Notifications Enabled', {
        body: 'You will now receive real-time updates',
        icon: '/icon-192x192.png'
      });
    }
  };

  const handlePushSubscription = async () => {
    if (subscription) {
      await unsubscribeFromPush();
    } else {
      await subscribeToPush();
    }
  };

  const handleClearCache = async () => {
    const success = await clearCaches();
    if (success) {
      setCacheSize(0);
      await showNotification('Cache Cleared', {
        body: 'All offline data has been removed',
        icon: '/icon-192x192.png'
      });
    }
  };

  // Don't render anything if already installed
  if (isInstalled && !isUpdateAvailable && !showPrompt) {
    return null;
  }

  return (
    <>
      {/* Install Prompt Banner */}
      <AnimatePresence>
        {showPrompt && isInstallable && !isInstalled && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50"
          >
            <Card className="shadow-2xl border-primary">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-primary" />
                    <CardTitle className="text-lg">Install App</CardTitle>
                  </div>
                  <button
                    onClick={() => setShowPrompt(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">
                  Install Monay Enterprise Wallet for a faster, app-like experience with offline support.
                </p>
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <Wifi className="w-4 h-4 text-green-500" />
                    <span>Works offline</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-blue-500" />
                    <span>Push notifications</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Download className="w-4 h-4 text-purple-500" />
                    <span>Quick access</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-orange-500" />
                    <span>Auto updates</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleInstall}
                    disabled={installing}
                    className="flex-1"
                  >
                    {installing ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Installing...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        Install Now
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowPrompt(false)}
                  >
                    Later
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Update Available Banner */}
      <AnimatePresence>
        {isUpdateAvailable && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-0 left-0 right-0 z-50"
          >
            <div className="bg-blue-600 text-white px-4 py-3">
              <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <RefreshCw className="w-5 h-5" />
                  <span className="text-sm font-medium">
                    A new version of the app is available
                  </span>
                </div>
                <Button
                  onClick={updateServiceWorker}
                  size="sm"
                  variant="secondary"
                >
                  Update Now
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Offline Indicator */}
      <AnimatePresence>
        {isOffline && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-4 left-4 z-40"
          >
            <Badge variant="destructive" className="flex items-center gap-2 px-3 py-2">
              <WifiOff className="w-4 h-4" />
              <span>Offline Mode</span>
            </Badge>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// PWA Status Component for Settings Page
export const PWAStatus: React.FC = () => {
  const {
    isInstalled,
    isOffline,
    registration,
    getCacheInfo,
    clearCaches
  } = usePWA();

  const {
    subscription,
    isSupported: isPushSupported,
    subscribe: subscribeToPush,
    unsubscribe: unsubscribeFromPush
  } = usePushNotifications();

  const [cacheInfo, setCacheInfo] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCacheInfo = async () => {
      const info = await getCacheInfo();
      if (info) {
        setCacheInfo(info);
      }
    };

    fetchCacheInfo();
  }, [getCacheInfo]);

  const handleClearCache = async () => {
    setLoading(true);
    await clearCaches();
    setCacheInfo([]);
    setLoading(false);
  };

  const totalCacheSize = cacheInfo.reduce((acc, cache) => acc + cache.count, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Progressive Web App Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Installation Status */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Installation Status</span>
            <Badge variant={isInstalled ? 'default' : 'secondary'}>
              {isInstalled ? 'Installed' : 'Not Installed'}
            </Badge>
          </div>
        </div>

        {/* Connection Status */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Connection Status</span>
            <Badge variant={isOffline ? 'destructive' : 'default'}>
              {isOffline ? 'Offline' : 'Online'}
            </Badge>
          </div>
        </div>

        {/* Push Notifications */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Push Notifications</span>
            <Badge variant={subscription ? 'default' : 'secondary'}>
              {subscription ? 'Enabled' : 'Disabled'}
            </Badge>
          </div>
          {isPushSupported && (
            <Button
              onClick={subscription ? unsubscribeFromPush : subscribeToPush}
              size="sm"
              variant="outline"
              className="w-full"
            >
              {subscription ? 'Disable Notifications' : 'Enable Notifications'}
            </Button>
          )}
        </div>

        {/* Service Worker */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Service Worker</span>
            <Badge variant={registration ? 'default' : 'secondary'}>
              {registration ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </div>

        {/* Cache Storage */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Offline Storage</span>
            <span className="text-sm text-gray-500">
              {totalCacheSize} items cached
            </span>
          </div>
          
          {cacheInfo.length > 0 && (
            <div className="space-y-2">
              {cacheInfo.map((cache) => (
                <div key={cache.name} className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">{cache.name}</span>
                  <span className="text-gray-500">{cache.count} items</span>
                </div>
              ))}
            </div>
          )}

          <Button
            onClick={handleClearCache}
            disabled={loading || totalCacheSize === 0}
            size="sm"
            variant="outline"
            className="w-full"
          >
            {loading ? 'Clearing...' : 'Clear Offline Data'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PWAInstallPrompt;