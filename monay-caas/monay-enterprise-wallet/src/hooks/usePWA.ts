import { useState, useEffect, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PWAState {
  isInstalled: boolean;
  isInstallable: boolean;
  isOffline: boolean;
  isUpdateAvailable: boolean;
  installPrompt: BeforeInstallPromptEvent | null;
  registration: ServiceWorkerRegistration | null;
}

export const usePWA = () => {
  const [pwaState, setPWAState] = useState<PWAState>({
    isInstalled: false,
    isInstallable: false,
    isOffline: !navigator.onLine,
    isUpdateAvailable: false,
    installPrompt: null,
    registration: null
  });

  // Check if app is installed
  useEffect(() => {
    // Check if running as standalone PWA
    const isStandalone = 
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone ||
      document.referrer.includes('android-app://');

    // Check if installed via browser
    const isInstalled = localStorage.getItem('pwa-installed') === 'true' || isStandalone;

    setPWAState(prev => ({ ...prev, isInstalled }));
  }, []);

  // Handle install prompt
  useEffect(() => {
    const handleInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      
      setPWAState(prev => ({
        ...prev,
        isInstallable: true,
        installPrompt: promptEvent
      }));

      console.log('[PWA] Install prompt captured');
    };

    window.addEventListener('beforeinstallprompt', handleInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleInstallPrompt);
    };
  }, []);

  // Handle app installed
  useEffect(() => {
    const handleAppInstalled = () => {
      setPWAState(prev => ({
        ...prev,
        isInstalled: true,
        isInstallable: false,
        installPrompt: null
      }));

      localStorage.setItem('pwa-installed', 'true');
      console.log('[PWA] App installed');
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setPWAState(prev => ({ ...prev, isOffline: false }));
      console.log('[PWA] Back online');
    };

    const handleOffline = () => {
      setPWAState(prev => ({ ...prev, isOffline: true }));
      console.log('[PWA] Gone offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Register service worker
  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      console.log('[PWA] Service Worker not supported');
      return;
    }

    const registerServiceWorker = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/service-worker.js', {
          scope: '/'
        });

        setPWAState(prev => ({ ...prev, registration }));
        console.log('[PWA] Service Worker registered:', registration);

        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setPWAState(prev => ({ ...prev, isUpdateAvailable: true }));
                console.log('[PWA] Update available');
              }
            });
          }
        });

        // Check for updates periodically
        setInterval(() => {
          registration.update();
        }, 60000); // Check every minute

      } catch (error) {
        console.error('[PWA] Service Worker registration failed:', error);
      }
    };

    // Register on load
    if (document.readyState === 'complete') {
      registerServiceWorker();
    } else {
      window.addEventListener('load', registerServiceWorker);
    }
  }, []);

  // Install PWA
  const installPWA = useCallback(async () => {
    if (!pwaState.installPrompt) {
      console.log('[PWA] No install prompt available');
      return false;
    }

    try {
      await pwaState.installPrompt.prompt();
      const { outcome } = await pwaState.installPrompt.userChoice;
      
      console.log('[PWA] User choice:', outcome);
      
      if (outcome === 'accepted') {
        setPWAState(prev => ({
          ...prev,
          isInstalled: true,
          isInstallable: false,
          installPrompt: null
        }));
        localStorage.setItem('pwa-installed', 'true');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('[PWA] Install failed:', error);
      return false;
    }
  }, [pwaState.installPrompt]);

  // Update service worker
  const updateServiceWorker = useCallback(() => {
    if (pwaState.registration?.waiting) {
      pwaState.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  }, [pwaState.registration]);

  // Cache URLs for offline
  const cacheURLs = useCallback(async (urls: string[]) => {
    if (!navigator.serviceWorker.controller) {
      console.log('[PWA] No active service worker');
      return;
    }

    navigator.serviceWorker.controller.postMessage({
      type: 'CACHE_URLS',
      urls
    });
  }, []);

  // Request notification permission
  const requestNotificationPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      console.log('[PWA] Notifications not supported');
      return 'unsupported';
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission;
    }

    return 'denied';
  }, []);

  // Show notification
  const showNotification = useCallback(async (title: string, options?: NotificationOptions) => {
    if (Notification.permission !== 'granted') {
      const permission = await requestNotificationPermission();
      if (permission !== 'granted') {
        return false;
      }
    }

    if (pwaState.registration?.showNotification) {
      await pwaState.registration.showNotification(title, {
        icon: '/icon-192x192.png',
        badge: '/icon-72x72.png',
        ...options
      });
      return true;
    }

    // Fallback to browser notification
    new Notification(title, options);
    return true;
  }, [pwaState.registration, requestNotificationPermission]);

  // Register background sync
  const registerBackgroundSync = useCallback(async (tag: string) => {
    if (!pwaState.registration || !('sync' in pwaState.registration)) {
      console.log('[PWA] Background sync not supported');
      return false;
    }

    try {
      await (pwaState.registration as any).sync.register(tag);
      console.log('[PWA] Background sync registered:', tag);
      return true;
    } catch (error) {
      console.error('[PWA] Background sync failed:', error);
      return false;
    }
  }, [pwaState.registration]);

  // Get cache storage info
  const getCacheInfo = useCallback(async () => {
    if (!('caches' in window)) {
      return null;
    }

    try {
      const cacheNames = await caches.keys();
      const cacheInfo = await Promise.all(
        cacheNames.map(async (name) => {
          const cache = await caches.open(name);
          const keys = await cache.keys();
          return {
            name,
            count: keys.length,
            urls: keys.map(req => req.url)
          };
        })
      );

      return cacheInfo;
    } catch (error) {
      console.error('[PWA] Failed to get cache info:', error);
      return null;
    }
  }, []);

  // Clear all caches
  const clearCaches = useCallback(async () => {
    if (!('caches' in window)) {
      return false;
    }

    try {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      console.log('[PWA] All caches cleared');
      return true;
    } catch (error) {
      console.error('[PWA] Failed to clear caches:', error);
      return false;
    }
  }, []);

  return {
    // State
    ...pwaState,
    
    // Methods
    installPWA,
    updateServiceWorker,
    cacheURLs,
    requestNotificationPermission,
    showNotification,
    registerBackgroundSync,
    getCacheInfo,
    clearCaches
  };
};

// Hook for push notifications
export const usePushNotifications = () => {
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const { registration, requestNotificationPermission } = usePWA();

  useEffect(() => {
    setIsSupported(
      'PushManager' in window &&
      'serviceWorker' in navigator &&
      'Notification' in window
    );
  }, []);

  // Get current subscription
  useEffect(() => {
    if (!registration) return;

    const getSubscription = async () => {
      try {
        const sub = await registration.pushManager.getSubscription();
        setSubscription(sub);
      } catch (error) {
        console.error('[Push] Failed to get subscription:', error);
      }
    };

    getSubscription();
  }, [registration]);

  // Subscribe to push notifications
  const subscribe = useCallback(async () => {
    if (!registration || !isSupported) {
      return null;
    }

    // Request notification permission
    const permission = await requestNotificationPermission();
    if (permission !== 'granted') {
      console.log('[Push] Notification permission denied');
      return null;
    }

    try {
      // Your VAPID public key (generate this server-side)
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
        console.error('[Push] VAPID public key not configured');
        return null;
      }

      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidPublicKey
      });

      setSubscription(sub);
      console.log('[Push] Subscribed:', sub);

      // Send subscription to server
      await sendSubscriptionToServer(sub);

      return sub;
    } catch (error) {
      console.error('[Push] Subscription failed:', error);
      return null;
    }
  }, [registration, isSupported, requestNotificationPermission]);

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async () => {
    if (!subscription) {
      return false;
    }

    try {
      await subscription.unsubscribe();
      setSubscription(null);
      console.log('[Push] Unsubscribed');

      // Remove subscription from server
      await removeSubscriptionFromServer(subscription);

      return true;
    } catch (error) {
      console.error('[Push] Unsubscribe failed:', error);
      return false;
    }
  }, [subscription]);

  return {
    subscription,
    isSupported,
    subscribe,
    unsubscribe
  };
};

// Helper functions
async function sendSubscriptionToServer(subscription: PushSubscription) {
  try {
    const response = await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      },
      body: JSON.stringify(subscription)
    });

    if (!response.ok) {
      throw new Error('Failed to send subscription to server');
    }

    console.log('[Push] Subscription sent to server');
  } catch (error) {
    console.error('[Push] Failed to send subscription:', error);
  }
}

async function removeSubscriptionFromServer(subscription: PushSubscription) {
  try {
    const response = await fetch('/api/push/unsubscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      },
      body: JSON.stringify({ endpoint: subscription.endpoint })
    });

    if (!response.ok) {
      throw new Error('Failed to remove subscription from server');
    }

    console.log('[Push] Subscription removed from server');
  } catch (error) {
    console.error('[Push] Failed to remove subscription:', error);
  }
}