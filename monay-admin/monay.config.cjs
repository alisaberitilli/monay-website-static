// Monay Admin Frontend Configuration
// CaaS & WaaS Management Dashboard

const monayConfig = {
  // Application Info
  app: {
    name: "Monay Admin Frontend",
    version: "2.0.0",
    description: "Administrative Dashboard for CaaS & WaaS Management",
    port: process.env.PORT || 3002,
    type: "admin-frontend",
    services: ["caas", "waas"],
    environment: process.env.NODE_ENV || "development"
  },

  // API Configuration
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api",
    timeout: 30000,
    retryAttempts: 3,
    endpoints: {
      auth: "/auth",
      users: "/users",
      applications: "/applications",
      caas: "/caas",
      waas: "/waas",
      brf: "/brf",
      integrations: "/integrations",
      health: "/health",
      metrics: "/metrics"
    }
  },

  // Authentication & Security
  auth: {
    tokenStorage: "httpOnly",
    sessionTimeout: 8 * 60 * 60 * 1000, // 8 hours
    mfa: {
      enabled: true,
      required: true,
      methods: ["totp", "email"]
    },
    permissions: {
      superAdmin: ["*"],
      platformAdmin: [
        "users:read", "users:write", "users:delete",
        "applications:read", "applications:write",
        "caas:read", "caas:write", "caas:execute",
        "waas:read", "waas:write", "waas:execute",
        "brf:read", "brf:write",
        "integrations:read", "integrations:write",
        "system:health", "system:metrics"
      ],
      enterpriseDeveloper: [
        "users:read", "applications:read",
        "caas:read", "caas:execute",
        "waas:read", "waas:execute",
        "brf:read",
        "integrations:read"
      ],
      complianceOfficer: [
        "users:read", "brf:read", "brf:write",
        "integrations:read", "integrations:write"
      ]
    }
  },

  // CaaS (Crypto as a Service) Admin Features
  caas: {
    enabled: true,
    adminFeatures: {
      blockchainMonitoring: true,
      networkManagement: true,
      transactionManagement: true,
      smartContractDeployment: true,
      gasOptimization: true,
      bridgeManagement: true,
      tokenManagement: true,
      nftManagement: true,
      deFiIntegration: true,
      crossChainOperations: true
    },
    supportedChains: {
      ethereum: {
        enabled: true,
        chainId: 1,
        name: "Ethereum Mainnet",
        symbol: "ETH",
        rpcUrl: process.env.NEXT_PUBLIC_ETHEREUM_RPC_URL,
        explorerUrl: "https://etherscan.io",
        testnet: false,
        adminControls: {
          gasTracker: true,
          mempoolMonitor: true,
          networkHealth: true
        }
      },
      goerli: {
        enabled: true,
        chainId: 5,
        name: "Goerli Testnet",
        symbol: "ETH",
        rpcUrl: process.env.NEXT_PUBLIC_GOERLI_RPC_URL,
        explorerUrl: "https://goerli.etherscan.io",
        testnet: true,
        adminControls: {
          gasTracker: true,
          mempoolMonitor: true,
          networkHealth: true
        }
      },
      solana: {
        enabled: true,
        chainId: 101,
        name: "Solana Mainnet",
        symbol: "SOL",
        rpcUrl: process.env.NEXT_PUBLIC_SOLANA_RPC_URL,
        explorerUrl: "https://explorer.solana.com",
        testnet: false,
        adminControls: {
          clusterHealth: true,
          epochMonitor: true,
          validatorStats: true
        }
      },
      solanaDevnet: {
        enabled: true,
        chainId: 103,
        name: "Solana Devnet",
        symbol: "SOL",
        rpcUrl: process.env.NEXT_PUBLIC_SOLANA_DEVNET_RPC_URL,
        explorerUrl: "https://explorer.solana.com?cluster=devnet",
        testnet: true,
        adminControls: {
          clusterHealth: true,
          epochMonitor: true,
          validatorStats: true
        }
      },
      base: {
        enabled: true,
        chainId: 8453,
        name: "Base",
        symbol: "ETH",
        rpcUrl: process.env.NEXT_PUBLIC_BASE_RPC_URL,
        explorerUrl: "https://basescan.org",
        testnet: false,
        adminControls: {
          gasTracker: true,
          bridgeMonitor: true,
          networkHealth: true
        }
      },
      polygon: {
        enabled: true,
        chainId: 137,
        name: "Polygon",
        symbol: "MATIC",
        rpcUrl: process.env.NEXT_PUBLIC_POLYGON_RPC_URL,
        explorerUrl: "https://polygonscan.com",
        testnet: false,
        adminControls: {
          gasTracker: true,
          bridgeMonitor: true,
          networkHealth: true
        }
      }
    },
    monitoring: {
      realTimeUpdates: true,
      alertThresholds: {
        gasPrice: { high: 50, critical: 100 },
        networkLatency: { high: 5000, critical: 10000 },
        transactionFailRate: { high: 5, critical: 10 }
      }
    }
  },

  // WaaS (Wallet as a Service) Admin Features
  waas: {
    enabled: true,
    adminFeatures: {
      walletManagement: true,
      custodyOverview: true,
      multiSigManagement: true,
      keyRotation: true,
      socialRecoveryManagement: true,
      hardwareWalletIntegration: true,
      mpcWalletManagement: true,
      institutionalCustody: true,
      complianceMonitoring: true,
      auditTrails: true
    },
    custodyTypes: [
      {
        type: "self_custody",
        name: "Self Custody",
        description: "User controls private keys",
        securityLevel: "high",
        adminControls: ["audit", "support"],
        features: ["private_key_export", "seed_phrase", "hardware_wallet"]
      },
      {
        type: "assisted_custody", 
        name: "Assisted Custody",
        description: "Shared key management",
        securityLevel: "medium",
        adminControls: ["key_recovery", "dispute_resolution", "backup_management"],
        features: ["key_backup", "social_recovery", "multi_device_sync"]
      },
      {
        type: "managed_custody",
        name: "Managed Custody", 
        description: "Platform manages keys",
        securityLevel: "medium",
        adminControls: ["full_management", "recovery", "compliance"],
        features: ["automatic_backup", "customer_support", "compliance"]
      },
      {
        type: "institutional_custody",
        name: "Institutional Custody",
        description: "Enterprise-grade custody",
        securityLevel: "highest", 
        adminControls: ["enterprise_management", "audit_controls", "compliance_reporting"],
        features: ["multi_sig", "compliance", "audit_trail", "insurance", "cold_storage"]
      }
    ],
    security: {
      encryption: "aes-256-gcm",
      keyDerivation: "pbkdf2",
      mfaRequired: true,
      auditLogging: true,
      complianceReporting: true
    }
  },

  // Business Rules Framework (BRF) Admin
  brf: {
    enabled: true,
    adminFeatures: {
      ruleManagement: true,
      complianceMonitoring: true,
      kycManagement: true,
      amlScreening: true,
      sanctionsScreening: true,
      transactionLimits: true,
      riskAssessment: true,
      auditReporting: true
    },
    rules: {
      kyc: {
        levels: ["none", "basic", "standard", "enhanced", "institutional"],
        adminControls: {
          levelManagement: true,
          documentReview: true,
          approvalWorkflow: true,
          rejectionHandling: true
        }
      },
      transactionLimits: {
        adminControls: {
          limitConfiguration: true,
          exceptionHandling: true,
          escalationRules: true,
          auditTrails: true
        }
      },
      compliance: {
        aml: {
          enabled: true,
          realTimeScreening: true,
          falsePositiveManagement: true
        },
        sanctions: {
          enabled: true,
          listUpdates: "automatic",
          alertManagement: true
        },
        pep: {
          enabled: true,
          riskScoring: true,
          reviewWorkflows: true
        }
      }
    }
  },

  // Integration Management
  integrations: {
    adminFeatures: {
      providerManagement: true,
      apiKeyManagement: true,
      webhookManagement: true,
      healthMonitoring: true,
      failoverConfiguration: true
    },
    tillipay: {
      enabled: true,
      adminControls: {
        configurationManagement: true,
        transactionMonitoring: true,
        reconciliation: true,
        errorHandling: true
      }
    },
    kyc: {
      providers: ["persona", "alloy", "onfido"],
      adminControls: {
        providerSelection: true,
        configurationManagement: true,
        performanceMonitoring: true,
        costOptimization: true
      }
    },
    notifications: {
      adminControls: {
        templateManagement: true,
        deliveryMonitoring: true,
        failureHandling: true,
        analyticsReporting: true
      }
    }
  },

  // Dashboard Configuration
  dashboard: {
    defaultLayout: "admin",
    refreshIntervals: {
      systemHealth: 30000,
      blockchainMetrics: 60000,
      walletStatistics: 120000,
      complianceAlerts: 30000
    },
    charts: {
      defaultTimeRange: "24h",
      availableRanges: ["1h", "6h", "24h", "7d", "30d"],
      autoRefresh: true
    },
    alerts: {
      enabled: true,
      types: ["system", "security", "compliance", "performance"],
      retention: 30 // days
    }
  },

  // System Monitoring
  monitoring: {
    enabled: true,
    features: {
      systemHealth: true,
      performanceMetrics: true,
      errorTracking: true,
      auditLogs: true,
      userActivity: true
    },
    alerts: {
      systemDown: true,
      highLatency: true,
      securityIncident: true,
      complianceViolation: true
    }
  },

  // Feature Flags
  features: {
    betaFeatures: process.env.NODE_ENV === "development",
    debugMode: process.env.NODE_ENV === "development",
    experimentalUI: false,
    advancedAnalytics: true,
    realTimeNotifications: true,
    darkMode: true,
    multiLanguage: false
  },

  // UI Configuration
  ui: {
    theme: {
      default: "light",
      available: ["light", "dark", "system"],
      customization: true
    },
    layout: {
      sidebar: "collapsible",
      header: "fixed",
      breadcrumbs: true
    },
    tables: {
      defaultPageSize: 25,
      availablePageSizes: [10, 25, 50, 100],
      exportFormats: ["csv", "excel", "pdf"]
    },
    charts: {
      library: "recharts",
      colorScheme: "corporate",
      animations: true
    }
  },

  // Development Configuration
  development: {
    debugMode: process.env.NODE_ENV === "development",
    mockData: {
      enabled: process.env.NODE_ENV === "development",
      users: true,
      transactions: true,
      wallets: true,
      applications: true
    },
    devTools: {
      reactQueryDevtools: process.env.NODE_ENV === "development",
      storybook: false,
      testingPlayground: process.env.NODE_ENV === "development"
    }
  }
};

// Export configuration
module.exports = monayConfig;