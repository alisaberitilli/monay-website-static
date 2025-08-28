// Monay Web Application Configuration
// WaaS Consumer Platform

const monayConfig = {
  // Application Info
  app: {
    name: "Monay Web",
    version: "2.0.0",
    description: "Consumer Web Application for Wallet as a Service",
    port: process.env.PORT || 3003,
    type: "consumer-web",
    services: ["waas"],
    environment: process.env.NODE_ENV || "development"
  },

  // API Configuration
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api",
    timeout: 30000,
    retryAttempts: 3,
    endpoints: {
      auth: "/auth",
      wallet: "/waas/wallet",
      transactions: "/waas/transactions",
      recovery: "/waas/recovery",
      multisig: "/waas/multisig",
      hardware: "/waas/hardware",
      security: "/waas/security",
      profile: "/users/profile",
      notifications: "/notifications",
      support: "/support"
    }
  },

  // WaaS (Wallet as a Service) Configuration
  waas: {
    enabled: true,
    features: {
      // Core Wallet Features
      walletCreation: true,
      multiChainSupport: true,
      balanceDisplay: true,
      transactionHistory: true,
      sendReceive: true,
      qrCodeSupport: true,
      
      // Custody Features
      hybridCustody: true,
      custodySelection: true,
      keyBackup: true,
      seedPhraseExport: true,
      
      // Security Features
      multiFactorAuth: true,
      biometricAuth: process.env.NEXT_PUBLIC_BIOMETRIC_AUTH === "true",
      pinSecurity: true,
      sessionManagement: true,
      
      // Recovery Features
      socialRecovery: true,
      emailRecovery: true,
      guardianManagement: true,
      
      // Advanced Features
      multiSignature: true,
      hardwareWallet: true,
      smartContractWallet: false, // Phase 2 feature
      accountAbstraction: false,  // Phase 2 feature
      
      // User Experience
      realTimeUpdates: true,
      pushNotifications: true,
      darkMode: true,
      multiLanguage: false
    },

    // Supported Custody Types for Users
    custodyOptions: [
      {
        type: "self_custody",
        name: "Self Custody",
        description: "You control your private keys",
        pros: ["Full control", "Maximum privacy", "No counterparty risk"],
        cons: ["Full responsibility", "No recovery help", "Technical complexity"],
        securityLevel: "High",
        recommended: false,
        icon: "shield-check",
        features: ["private_key_export", "seed_phrase", "hardware_wallet_support"]
      },
      {
        type: "assisted_custody",
        name: "Smart Custody", 
        description: "Balanced approach with recovery options",
        pros: ["Recovery assistance", "User-friendly", "Backup options"],
        cons: ["Some trust required", "Moderate complexity"],
        securityLevel: "High",
        recommended: true,
        icon: "shield-heart",
        features: ["social_recovery", "email_recovery", "key_backup", "multi_device_sync"]
      },
      {
        type: "managed_custody",
        name: "Easy Custody",
        description: "Simple and secure, managed for you",
        pros: ["Easiest to use", "Full support", "Automatic backups"],
        cons: ["Less control", "Platform dependency"],
        securityLevel: "Medium",
        recommended: false,
        icon: "shield",
        features: ["automatic_backup", "24/7_support", "simple_recovery"]
      }
    ],

    // Default Settings
    defaults: {
      custodyType: "assisted_custody",
      currency: "USD",
      notifications: {
        transactions: true,
        security: true,
        updates: false,
        marketing: false
      },
      security: {
        mfaRequired: true,
        sessionTimeout: 30 * 60 * 1000, // 30 minutes
        autoLock: true,
        biometricAuth: false
      }
    }
  },

  // Supported Blockchain Networks
  blockchains: {
    ethereum: {
      enabled: true,
      chainId: 1,
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18,
      rpcUrl: process.env.NEXT_PUBLIC_ETHEREUM_RPC_URL,
      explorerUrl: "https://etherscan.io",
      icon: "ethereum",
      color: "#627EEA",
      testnet: false,
      userFeatures: {
        sendReceive: true,
        smartContracts: true,
        nftSupport: true,
        defiIntegration: true
      }
    },
    base: {
      enabled: true,
      chainId: 8453,
      name: "Base",
      symbol: "ETH",
      decimals: 18,
      rpcUrl: process.env.NEXT_PUBLIC_BASE_RPC_URL,
      explorerUrl: "https://basescan.org",
      icon: "base",
      color: "#0052FF",
      testnet: false,
      userFeatures: {
        sendReceive: true,
        smartContracts: true,
        lowFees: true,
        fastTransactions: true
      }
    },
    solana: {
      enabled: true,
      chainId: 103,
      name: "Solana Devnet",
      symbol: "SOL",
      decimals: 9,
      rpcUrl: process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com",
      explorerUrl: "https://explorer.solana.com?cluster=devnet",
      icon: "solana",
      color: "#9945FF",
      testnet: true,
      userFeatures: {
        sendReceive: true,
        fastTransactions: true,
        lowFees: true,
        nftSupport: true
      }
    },
    solanaMainnet: {
      enabled: false, // Disabled for development, use devnet
      chainId: 101,
      name: "Solana Mainnet",
      symbol: "SOL",
      decimals: 9,
      rpcUrl: process.env.NEXT_PUBLIC_SOLANA_MAINNET_RPC_URL,
      explorerUrl: "https://explorer.solana.com",
      icon: "solana",
      color: "#9945FF",
      testnet: false,
      userFeatures: {
        sendReceive: true,
        fastTransactions: true,
        lowFees: true,
        nftSupport: true
      }
    },
    polygon: {
      enabled: true,
      chainId: 137,
      name: "Polygon",
      symbol: "MATIC",
      decimals: 18,
      rpcUrl: process.env.NEXT_PUBLIC_POLYGON_RPC_URL,
      explorerUrl: "https://polygonscan.com",
      icon: "polygon",
      color: "#8247E5",
      testnet: false,
      userFeatures: {
        sendReceive: true,
        smartContracts: true,
        lowFees: true,
        nftSupport: true
      }
    }
  },

  // Security Configuration
  security: {
    encryption: {
      algorithm: "aes-256-gcm",
      keyDerivation: "pbkdf2",
      iterations: 100000
    },
    authentication: {
      methods: ["password", "biometric", "hardware", "social"],
      mfa: {
        enabled: true,
        methods: ["totp", "sms", "email"],
        required: false // User choice
      },
      session: {
        duration: 30 * 60 * 1000, // 30 minutes
        renewalThreshold: 10 * 60 * 1000, // 10 minutes
        maxConcurrent: 3
      }
    },
    recovery: {
      socialRecovery: {
        enabled: true,
        minGuardians: 3,
        maxGuardians: 7,
        threshold: "majority" // or specific number
      },
      emailRecovery: {
        enabled: true,
        verificationRequired: true,
        cooldownPeriod: 24 * 60 * 60 * 1000 // 24 hours
      },
      seedPhrase: {
        enabled: true,
        wordCount: 12,
        testRequired: true
      }
    }
  },

  // User Interface Configuration
  ui: {
    theme: {
      default: "light",
      options: ["light", "dark", "system"],
      customization: false
    },
    layout: {
      sidebar: "collapsible",
      navigation: "bottom", // mobile-first
      headerStyle: "minimal"
    },
    components: {
      charts: {
        library: "recharts",
        animations: true,
        colorScheme: "brand"
      },
      forms: {
        validation: "real-time",
        autoSave: false
      },
      tables: {
        pagination: true,
        defaultPageSize: 20,
        sorting: true,
        filtering: false
      }
    },
    accessibility: {
      highContrast: false,
      fontSize: "normal",
      reducedMotion: false,
      screenReader: true
    }
  },

  // Notifications Configuration
  notifications: {
    enabled: true,
    types: {
      transactions: {
        enabled: true,
        channels: ["push", "email"],
        realTime: true
      },
      security: {
        enabled: true,
        channels: ["push", "email", "sms"],
        realTime: true,
        priority: "high"
      },
      wallet: {
        enabled: true,
        channels: ["push"],
        realTime: true
      },
      promotional: {
        enabled: false,
        channels: ["email"],
        realTime: false
      }
    },
    delivery: {
      push: {
        enabled: true,
        persistent: true,
        sound: true,
        vibration: true
      },
      email: {
        enabled: true,
        frequency: "immediate"
      },
      sms: {
        enabled: false, // User opt-in
        emergency: true
      }
    }
  },

  // Analytics & Tracking
  analytics: {
    enabled: true,
    privacy: "anonymized",
    events: {
      userJourney: true,
      errorTracking: true,
      performanceMetrics: true,
      featureUsage: true
    },
    retention: 90 // days
  },

  // Integration Configuration
  integrations: {
    // Payment Rails
    tillipay: {
      enabled: true,
      features: ["add_money", "withdraw", "card_payments"]
    },
    
    // External Wallets
    walletConnect: {
      enabled: true,
      version: "v2"
    },
    
    // Hardware Wallets
    hardware: {
      ledger: true,
      trezor: true,
      keystone: false
    },
    
    // Social Providers
    social: {
      google: true,
      apple: true,
      twitter: false,
      facebook: false
    }
  },

  // Performance Configuration
  performance: {
    caching: {
      enabled: true,
      ttl: 5 * 60 * 1000, // 5 minutes
      strategies: ["memory", "localStorage"]
    },
    optimization: {
      lazyLoading: true,
      imageOptimization: true,
      bundleSplitting: true
    },
    realTime: {
      websockets: true,
      heartbeat: 30000,
      reconnectAttempts: 5
    }
  },

  // Development Configuration
  development: {
    debugMode: process.env.NODE_ENV === "development",
    mockData: {
      enabled: process.env.NODE_ENV === "development",
      wallets: true,
      transactions: true,
      users: true
    },
    features: {
      devTools: process.env.NODE_ENV === "development",
      testnet: process.env.NODE_ENV !== "production",
      betaFeatures: false
    },
    blockchain: {
      useTestnets: process.env.NODE_ENV !== "production",
      defaultTestnet: "solanaDevnet",
      solanaDevnet: {
        enabled: true,
        chainId: 103,
        rpcUrl: "https://api.devnet.solana.com",
        wsUrl: "wss://api.devnet.solana.com",
        explorerUrl: "https://explorer.solana.com?cluster=devnet",
        faucetUrl: "https://faucet.solana.com"
      }
    }
  },

  // Compliance & Legal
  compliance: {
    kycRequired: false, // Consumer app - optional
    dataProtection: {
      gdpr: true,
      ccpa: true,
      encryption: true
    },
    terms: {
      version: "2.0",
      lastUpdated: "2025-01-15"
    }
  }
};

// Export configuration
module.exports = monayConfig;