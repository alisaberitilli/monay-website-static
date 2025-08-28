// Monay Backend Configuration
// CaaS & WaaS Core API Platform

const monayConfig = {
  // Application Info
  app: {
    name: "Monay Backend",
    version: "1.0.0",
    description: "CaaS & WaaS Core API Platform",
    port: process.env.PORT || 3001,
    type: "backend",
    services: ["caas", "waas"],
    environment: process.env.NODE_ENV || "development"
  },

  // Database Configuration
  database: {
    main: {
      host: process.env.DB_HOST || "localhost",
      port: process.env.DB_PORT || 5432,
      username: process.env.DB_USERNAME || "alisaberi",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "monay_wallet",
      dialect: process.env.DB_DIALECT || "postgresql",
      logging: process.env.NODE_ENV !== "production"
    },
    redis: {
      host: process.env.REDIS_HOST || "localhost",
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD || "",
      db: process.env.REDIS_DB || 0
    },
    kafka: {
      brokers: process.env.KAFKA_BROKERS ? process.env.KAFKA_BROKERS.split(',') : ['localhost:9092'],
      clientId: 'monay-backend'
    }
  },

  // CaaS (Crypto as a Service) Configuration
  caas: {
    enabled: true,
    features: {
      walletGeneration: true,
      transactionSigning: true,
      blockchainIntegration: true,
      smartContractInteraction: true,
      tokenManagement: true,
      nftSupport: true,
      deFiIntegration: true,
      crossChainBridge: true,
      gasTankless: true,
      mempoolMonitoring: true
    },
    supportedChains: {
      ethereum: {
        enabled: true,
        chainId: 1,
        rpcUrl: process.env.ETHEREUM_RPC_URL || "https://mainnet.infura.io/v3/your-key",
        wsUrl: process.env.ETHEREUM_WS_URL || "wss://mainnet.infura.io/ws/v3/your-key",
        explorerUrl: "https://etherscan.io",
        nativeCurrency: { name: "Ethereum", symbol: "ETH", decimals: 18 },
        testnet: false
      },
      goerli: {
        enabled: true,
        chainId: 5,
        rpcUrl: process.env.GOERLI_RPC_URL || "https://goerli.infura.io/v3/your-key",
        wsUrl: process.env.GOERLI_WS_URL || "wss://goerli.infura.io/ws/v3/your-key", 
        explorerUrl: "https://goerli.etherscan.io",
        nativeCurrency: { name: "Ethereum", symbol: "ETH", decimals: 18 },
        testnet: true
      },
      solana: {
        enabled: true,
        chainId: 101,
        rpcUrl: process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com",
        wsUrl: process.env.SOLANA_WS_URL || "wss://api.mainnet-beta.solana.com",
        explorerUrl: "https://explorer.solana.com",
        nativeCurrency: { name: "Solana", symbol: "SOL", decimals: 9 },
        testnet: false
      },
      solanaDevnet: {
        enabled: true,
        chainId: 103,
        rpcUrl: process.env.SOLANA_DEVNET_RPC_URL || "https://api.devnet.solana.com",
        wsUrl: process.env.SOLANA_DEVNET_WS_URL || "wss://api.devnet.solana.com",
        explorerUrl: "https://explorer.solana.com?cluster=devnet",
        nativeCurrency: { name: "Solana", symbol: "SOL", decimals: 9 },
        testnet: true
      },
      base: {
        enabled: true,
        chainId: 8453,
        rpcUrl: process.env.BASE_RPC_URL || "https://mainnet.base.org",
        wsUrl: process.env.BASE_WS_URL || "wss://mainnet.base.org",
        explorerUrl: "https://basescan.org",
        nativeCurrency: { name: "Ethereum", symbol: "ETH", decimals: 18 },
        testnet: false
      },
      polygon: {
        enabled: true,
        chainId: 137,
        rpcUrl: process.env.POLYGON_RPC_URL || "https://polygon-rpc.com",
        wsUrl: process.env.POLYGON_WS_URL || "wss://polygon-rpc.com",
        explorerUrl: "https://polygonscan.com",
        nativeCurrency: { name: "Polygon", symbol: "MATIC", decimals: 18 },
        testnet: false
      }
    },
    defaultChain: "ethereum",
    gasEstimation: {
      enabled: true,
      bufferPercentage: 20,
      maxGasLimit: 8000000
    }
  },

  // WaaS (Wallet as a Service) Configuration
  waas: {
    enabled: true,
    features: {
      hdWalletGeneration: true,
      multiSignature: true,
      socialRecovery: true,
      hardwareWalletIntegration: true,
      mpcWallets: true,
      thresholdSignatures: true,
      keyRotation: true,
      biometricAuth: true,
      hybridCustody: true,
      institutionalCustody: true,
      smartContractWallets: true,
      accountAbstraction: true
    },
    custodyTypes: [
      {
        type: "self_custody",
        name: "Self Custody",
        description: "User controls private keys",
        securityLevel: "high",
        features: ["private_key_export", "seed_phrase", "hardware_wallet"]
      },
      {
        type: "assisted_custody",
        name: "Assisted Custody", 
        description: "Shared key management",
        securityLevel: "medium",
        features: ["key_backup", "social_recovery", "multi_device_sync"]
      },
      {
        type: "managed_custody",
        name: "Managed Custody",
        description: "Platform manages keys",
        securityLevel: "medium",
        features: ["automatic_backup", "customer_support", "compliance"]
      },
      {
        type: "institutional_custody",
        name: "Institutional Custody",
        description: "Enterprise-grade custody",
        securityLevel: "highest",
        features: ["multi_sig", "compliance", "audit_trail", "insurance", "cold_storage"]
      }
    ],
    encryption: {
      algorithm: "aes-256-gcm",
      keyDerivation: "pbkdf2",
      iterations: 100000,
      saltLength: 32
    },
    backup: {
      enabled: true,
      methods: ["seed_phrase", "encrypted_shares", "social_recovery", "hardware_backup"],
      socialRecoveryThreshold: 3,
      socialRecoveryTotal: 5
    }
  },

  // Authentication & Security
  auth: {
    jwt: {
      secret: process.env.JWT_SECRET || "development-secret-key",
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
      algorithm: "HS256"
    },
    mfa: {
      enabled: true,
      methods: ["totp", "sms", "email", "biometric"],
      requireForWalletOps: true
    },
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      standardHeaders: true,
      legacyHeaders: false
    },
    security: {
      helmet: true,
      cors: {
        origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ["http://localhost:3000"],
        credentials: true
      },
      ipWhitelist: process.env.IP_WHITELIST ? process.env.IP_WHITELIST.split(',') : []
    }
  },

  // External Integrations
  integrations: {
    tillipay: {
      enabled: true,
      apiUrl: process.env.TILLIPAY_API_URL || "https://api.tillipay.com",
      apiKey: process.env.TILLIPAY_API_KEY || "",
      merchantId: process.env.TILLIPAY_MERCHANT_ID || "",
      webhookSecret: process.env.TILLIPAY_WEBHOOK_SECRET || ""
    },
    kyc: {
      providers: {
        persona: {
          enabled: true,
          apiKey: process.env.PERSONA_API_KEY || "",
          templateId: process.env.PERSONA_TEMPLATE_ID || ""
        },
        alloy: {
          enabled: false,
          apiKey: process.env.ALLOY_API_KEY || "",
          secret: process.env.ALLOY_SECRET || ""
        },
        onfido: {
          enabled: false,
          apiKey: process.env.ONFIDO_API_KEY || "",
          region: process.env.ONFIDO_REGION || "US"
        }
      },
      defaultProvider: "persona"
    },
    notifications: {
      push: {
        fcm: {
          enabled: true,
          serverKey: process.env.FCM_SERVER_KEY || ""
        },
        apn: {
          enabled: true,
          keyId: process.env.APN_KEY_ID || "",
          teamId: process.env.APN_TEAM_ID || ""
        }
      },
      email: {
        provider: "smtp",
        smtp: {
          host: process.env.SMTP_HOST || "smtp.gmail.com",
          port: process.env.SMTP_PORT || 587,
          secure: false,
          auth: {
            user: process.env.SMTP_USER || "",
            pass: process.env.SMTP_PASSWORD || ""
          }
        }
      },
      sms: {
        provider: "twilio",
        twilio: {
          accountSid: process.env.TWILIO_ACCOUNT_SID || "",
          authToken: process.env.TWILIO_AUTH_TOKEN || "",
          fromNumber: process.env.TWILIO_FROM_NUMBER || ""
        }
      }
    },
    storage: {
      aws: {
        enabled: true,
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
        region: process.env.AWS_REGION || "us-east-1",
        bucketName: process.env.AWS_BUCKET_NAME || ""
      }
    }
  },

  // API Configuration
  api: {
    version: "v1",
    prefix: "/api",
    documentation: {
      enabled: true,
      title: "Monay Backend API",
      version: "1.0.0",
      description: "CaaS & WaaS Core API Platform",
      swagger: {
        enabled: true,
        path: "/api/docs"
      }
    },
    endpoints: {
      health: "/health",
      status: "/status",
      metrics: "/metrics"
    },
    middleware: {
      requestId: true,
      logging: true,
      compression: true,
      bodyParser: {
        json: { limit: "10mb" },
        urlencoded: { extended: true, limit: "10mb" }
      }
    }
  },

  // Business Rules Framework (BRF)
  brf: {
    enabled: true,
    rules: {
      kyc: {
        required: true,
        levels: ["basic", "standard", "enhanced", "institutional"],
        defaultLevel: "basic"
      },
      transactionLimits: {
        enabled: true,
        default: {
          daily: 10000,
          monthly: 100000,
          single: 5000
        },
        byKycLevel: {
          basic: { daily: 1000, monthly: 10000, single: 500 },
          standard: { daily: 10000, monthly: 100000, single: 5000 },
          enhanced: { daily: 50000, monthly: 500000, single: 25000 },
          institutional: { daily: 1000000, monthly: 10000000, single: 500000 }
        }
      },
      compliance: {
        aml: true,
        sanctions: true,
        pep: true,
        monitoring: true
      }
    }
  },

  // Monitoring & Logging
  monitoring: {
    logging: {
      level: process.env.LOG_LEVEL || "info",
      format: "json",
      destination: process.env.LOG_DESTINATION || "console"
    },
    metrics: {
      enabled: true,
      prometheus: {
        enabled: true,
        path: "/metrics"
      }
    },
    health: {
      enabled: true,
      checks: ["database", "redis", "blockchain", "external_apis"]
    }
  },

  // Development Configuration
  development: {
    debugMode: process.env.NODE_ENV === "development",
    testData: {
      enabled: process.env.NODE_ENV === "development",
      seedDatabase: false
    },
    blockchain: {
      useTestnets: process.env.NODE_ENV !== "production",
      mockTransactions: process.env.MOCK_TRANSACTIONS === "true"
    }
  }
};

module.exports = monayConfig;