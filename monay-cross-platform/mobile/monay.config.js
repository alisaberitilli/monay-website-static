// Monay Mobile Application Configuration
// WaaS iOS & Android Platform

const monayConfig = {
  // Application Info
  app: {
    name: "Monay Mobile",
    version: "2.0.0",
    description: "Mobile Wallet Application for iOS & Android",
    platform: ["ios", "android"],
    type: "mobile",
    services: ["waas"],
    environment: process.env.NODE_ENV || "development"
  },

  // API Configuration
  api: {
    baseUrl: process.env.EXPO_PUBLIC_API_URL || "http://localhost:3001/api",
    timeout: 30000,
    retryAttempts: 3,
    endpoints: {
      auth: "/auth",
      wallet: "/waas/wallet",
      transactions: "/waas/transactions",
      recovery: "/waas/recovery",
      security: "/waas/security",
      profile: "/users/profile",
      notifications: "/notifications"
    }
  },

  // Mobile-Specific WaaS Configuration
  waas: {
    enabled: true,
    features: {
      // Core Mobile Features
      walletCreation: true,
      multiChainSupport: true,
      balanceDisplay: true,
      transactionHistory: true,
      sendReceive: true,
      qrCodeScanning: true,
      qrCodeGeneration: true,
      
      // Mobile Security
      biometricAuth: true,
      faceIdSupport: true,
      touchIdSupport: true,
      pinCode: true,
      autoLock: true,
      secureStorage: true,
      
      // Mobile-First Features
      pushNotifications: true,
      hapticFeedback: true,
      offlineMode: true,
      backgroundSync: true,
      deepLinking: true,
      universalLinks: true,
      
      // Custody Features
      hybridCustody: true,
      custodySelection: true,
      cloudBackup: true,
      seedPhraseBackup: true,
      
      // Recovery Options
      socialRecovery: true,
      emailRecovery: true,
      cloudRecovery: true,
      guardianManagement: true,
      
      // Advanced Mobile Features
      nfcPayments: false, // Phase 2
      walletConnect: true,
      hardwareWalletBLE: false, // Phase 2
      widgetSupport: false, // Phase 2
      
      // User Experience
      darkMode: true,
      animations: true,
      gestureControls: true,
      swipeActions: true,
      pullToRefresh: true
    },

    // Mobile Custody Options
    custodyOptions: [
      {
        type: "self_custody",
        name: "Full Control",
        description: "Your keys, your crypto",
        icon: "shield-lock",
        mobileFeatures: {
          localKeyStorage: true,
          biometricProtection: true,
          seedPhraseExport: true,
          noCloudBackup: true
        },
        securityLevel: "Maximum",
        recommended: false
      },
      {
        type: "assisted_custody",
        name: "Smart Recovery",
        description: "Secure with backup options",
        icon: "shield-check",
        mobileFeatures: {
          encryptedCloudBackup: true,
          socialRecovery: true,
          biometricAuth: true,
          multiDeviceSync: true
        },
        securityLevel: "High",
        recommended: true
      },
      {
        type: "managed_custody",
        name: "Simple & Safe",
        description: "We help protect your assets",
        icon: "shield-heart",
        mobileFeatures: {
          automaticBackup: true,
          passwordRecovery: true,
          support247: true,
          simpleSetup: true
        },
        securityLevel: "Standard",
        recommended: false
      }
    ],

    // Mobile-Specific Settings
    mobileSettings: {
      biometric: {
        faceId: true,
        touchId: true,
        androidBiometric: true,
        fallbackToPin: true
      },
      security: {
        autoLockTimeout: 5 * 60 * 1000, // 5 minutes
        requireAuthOnAppOpen: true,
        obscureAppSwitcher: true,
        screenshotPrevention: false,
        jailbreakDetection: true
      },
      notifications: {
        transactions: true,
        security: true,
        price: false,
        news: false,
        vibration: true,
        sound: true
      },
      performance: {
        cacheImages: true,
        prefetchData: true,
        backgroundRefresh: true,
        lowDataMode: false
      }
    }
  },

  // Supported Blockchains (Mobile Optimized)
  blockchains: {
    ethereum: {
      enabled: true,
      chainId: 1,
      name: "Ethereum",
      symbol: "ETH",
      icon: "ethereum",
      color: "#627EEA",
      mobileOptimized: true,
      features: {
        sendReceive: true,
        swapSupport: true,
        nftDisplay: true,
        gasEstimation: true
      }
    },
    base: {
      enabled: true,
      chainId: 8453,
      name: "Base",
      symbol: "ETH",
      icon: "base",
      color: "#0052FF",
      mobileOptimized: true,
      features: {
        sendReceive: true,
        lowFees: true,
        fastTransactions: true
      }
    },
    solana: {
      enabled: true,
      chainId: 101,
      name: "Solana",
      symbol: "SOL",
      icon: "solana",
      color: "#9945FF",
      mobileOptimized: true,
      features: {
        sendReceive: true,
        instantTransactions: true,
        minimalFees: true,
        nftSupport: true
      }
    },
    polygon: {
      enabled: true,
      chainId: 137,
      name: "Polygon",
      symbol: "MATIC",
      icon: "polygon",
      color: "#8247E5",
      mobileOptimized: true,
      features: {
        sendReceive: true,
        lowFees: true,
        defiAccess: true
      }
    }
  },

  // Mobile Security Configuration
  security: {
    biometric: {
      enabled: true,
      required: false,
      methods: ["faceId", "touchId", "fingerprint", "iris"],
      fallback: "pin"
    },
    encryption: {
      algorithm: "aes-256-gcm",
      keyStorage: "secure-enclave", // iOS Secure Enclave / Android Keystore
      backupEncryption: true
    },
    authentication: {
      methods: ["biometric", "pin", "pattern", "password"],
      maxAttempts: 5,
      lockoutDuration: 30 * 60 * 1000, // 30 minutes
      sessionTimeout: 5 * 60 * 1000 // 5 minutes
    },
    recovery: {
      methods: ["seedPhrase", "social", "email", "cloud"],
      socialRecovery: {
        minGuardians: 3,
        maxGuardians: 5,
        approvalThreshold: 2
      }
    }
  },

  // Mobile UI Configuration
  ui: {
    theme: {
      default: "system", // Follow device theme
      options: ["light", "dark", "system"],
      colors: {
        primary: "#0052FF",
        secondary: "#00D4FF",
        success: "#00C851",
        warning: "#FFBB33",
        danger: "#FF3547",
        info: "#33B5E5"
      }
    },
    navigation: {
      type: "tab-bar",
      position: "bottom",
      items: ["home", "send", "receive", "cards", "profile"],
      gestures: true,
      haptics: true
    },
    animations: {
      enabled: true,
      duration: 300,
      type: "spring",
      reduceMotion: false
    },
    components: {
      cards: {
        swipeable: true,
        animated: true,
        glassmorphism: true
      },
      lists: {
        pullToRefresh: true,
        infiniteScroll: true,
        skeletonLoading: true
      },
      modals: {
        type: "bottom-sheet",
        swipeToClose: true,
        backdrop: true
      }
    }
  },

  // Mobile Notifications
  notifications: {
    push: {
      enabled: true,
      provider: "expo",
      channels: {
        transactions: {
          enabled: true,
          priority: "high",
          sound: true,
          vibration: true,
          badge: true
        },
        security: {
          enabled: true,
          priority: "max",
          sound: true,
          vibration: true,
          badge: true,
          critical: true
        },
        marketing: {
          enabled: false,
          priority: "normal",
          sound: false,
          vibration: false
        }
      }
    },
    inApp: {
      enabled: true,
      position: "top",
      duration: 3000,
      swipeToDismiss: true
    },
    badges: {
      enabled: true,
      transactions: true,
      messages: true
    }
  },

  // Mobile Performance
  performance: {
    imageOptimization: {
      enabled: true,
      quality: 0.8,
      caching: true,
      lazyLoading: true
    },
    dataManagement: {
      cacheSize: 100, // MB
      cacheDuration: 7 * 24 * 60 * 60 * 1000, // 7 days
      offlineData: true,
      backgroundSync: true
    },
    network: {
      timeout: 30000,
      retry: 3,
      offlineQueue: true,
      optimisticUpdates: true
    }
  },

  // Platform-Specific Features
  ios: {
    minimumVersion: "13.0",
    features: {
      faceId: true,
      appleSignIn: true,
      widgets: false,
      siriShortcuts: false,
      nfc: false,
      carPlay: false
    },
    permissions: {
      camera: "Scan QR codes for easy transfers",
      faceId: "Secure your wallet with Face ID",
      notifications: "Get alerts for transactions and security",
      photos: "Save QR codes to your photo library"
    }
  },

  android: {
    minimumSdkVersion: 21,
    targetSdkVersion: 34,
    features: {
      fingerprint: true,
      googleSignIn: true,
      widgets: false,
      nfc: false,
      wear: false
    },
    permissions: {
      camera: true,
      biometric: true,
      vibrate: true,
      notifications: true
    }
  },

  // Mobile Analytics
  analytics: {
    enabled: true,
    provider: "expo",
    events: {
      screenViews: true,
      userActions: true,
      transactions: true,
      errors: true,
      performance: true
    },
    privacy: {
      anonymizeIp: true,
      respectDnt: true,
      dataRetention: 90 // days
    }
  },

  // Development Configuration
  development: {
    debugMode: process.env.NODE_ENV === "development",
    testnet: process.env.NODE_ENV !== "production",
    mockData: process.env.NODE_ENV === "development",
    devMenu: process.env.NODE_ENV === "development",
    logs: {
      console: true,
      file: false,
      remote: false
    }
  }
};

// Export configuration
module.exports = monayConfig;