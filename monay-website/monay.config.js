// Monay Website Configuration
// CaaS & WaaS Marketing and Onboarding Platform

const monayConfig = {
  // Application Info
  app: {
    name: "Monay Website",
    version: "1.0.0",
    description: "CaaS & WaaS Marketing and Onboarding Platform",
    port: 3000,
    type: "website",
    services: ["caas", "waas"]
  },

  // API Endpoints
  api: {
    backend: process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001",
    endpoints: {
      auth: "/api/auth",
      users: "/api/users", 
      newsletter: "/api/newsletter",
      contact: "/api/contact",
      notifications: "/api/notifications",
      applications: "/api/applications"
    }
  },

  // CaaS (Crypto as a Service) Configuration
  caas: {
    enabled: true,
    features: {
      blockchainOnboarding: true,
      tokenManagement: true,
      smartContracts: true,
      deFiIntegration: true,
      nftSupport: true
    },
    supportedChains: [
      {
        name: "Ethereum",
        chainId: 1,
        symbol: "ETH",
        rpcUrl: "https://mainnet.infura.io/v3/your-key",
        explorerUrl: "https://etherscan.io",
        testnet: false
      },
      {
        name: "Ethereum Goerli",
        chainId: 5, 
        symbol: "ETH",
        rpcUrl: "https://goerli.infura.io/v3/your-key",
        explorerUrl: "https://goerli.etherscan.io",
        testnet: true
      },
      {
        name: "Solana",
        chainId: 101,
        symbol: "SOL", 
        rpcUrl: "https://api.mainnet-beta.solana.com",
        explorerUrl: "https://explorer.solana.com",
        testnet: false
      },
      {
        name: "Base",
        chainId: 8453,
        symbol: "ETH",
        rpcUrl: "https://mainnet.base.org",
        explorerUrl: "https://basescan.org",
        testnet: false
      },
      {
        name: "Polygon",
        chainId: 137,
        symbol: "MATIC",
        rpcUrl: "https://polygon-rpc.com",
        explorerUrl: "https://polygonscan.com", 
        testnet: false
      }
    ],
    defaultChain: "ethereum"
  },

  // WaaS (Wallet as a Service) Configuration
  waas: {
    enabled: true,
    features: {
      multiSignature: true,
      hardwareWallet: true,
      socialRecovery: true,
      hybridCustody: true,
      institutionalCustody: true,
      mpcWallets: true,
      gasTankless: true
    },
    custodyOptions: [
      {
        type: "self_custody",
        name: "Self Custody",
        description: "Full control of your private keys",
        features: ["private_key_control", "hardware_wallet", "seed_phrase"]
      },
      {
        type: "assisted_custody", 
        name: "Assisted Custody",
        description: "We help manage your keys securely",
        features: ["key_backup", "social_recovery", "multi_device"]
      },
      {
        type: "institutional_custody",
        name: "Institutional Custody",
        description: "Enterprise-grade custody solutions", 
        features: ["multi_sig", "compliance", "audit_trail", "insurance"]
      }
    ],
    walletTypes: [
      {
        type: "eoa",
        name: "Externally Owned Account",
        chains: ["ethereum", "polygon", "base"]
      },
      {
        type: "smart_contract",
        name: "Smart Contract Wallet", 
        chains: ["ethereum", "polygon", "base"],
        features: ["account_abstraction", "gasless_transactions"]
      },
      {
        type: "mpc",
        name: "Multi-Party Computation",
        chains: ["ethereum", "solana", "polygon", "base"],
        features: ["distributed_key_generation", "threshold_signatures"]
      }
    ]
  },

  // Marketing Configuration
  marketing: {
    leadCapture: {
      enabled: true,
      forms: ["newsletter", "contact", "demo_request", "enterprise_inquiry"],
      integrations: ["hubspot", "salesforce", "mailchimp"]
    },
    analytics: {
      googleAnalytics: process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID,
      hotjar: process.env.NEXT_PUBLIC_HOTJAR_ID,
      mixpanel: process.env.NEXT_PUBLIC_MIXPANEL_TOKEN
    },
    seo: {
      sitemap: true,
      robots: true,
      structured_data: true,
      meta_tags: true
    }
  },

  // Content Management
  content: {
    pages: {
      home: {
        hero: {
          title: "The Future of Digital Finance",
          subtitle: "Enterprise crypto infrastructure and wallet solutions",
          cta: "Get Started"
        },
        features: [
          {
            title: "Crypto as a Service (CaaS)",
            description: "Complete blockchain infrastructure for your business",
            icon: "cryptocurrency"
          },
          {
            title: "Wallet as a Service (WaaS)",
            description: "Secure, scalable wallet solutions for any use case", 
            icon: "wallet"
          },
          {
            title: "Hybrid Custody",
            description: "Balance security and convenience with flexible custody options",
            icon: "security"
          }
        ]
      }
    }
  },

  // Security Configuration
  security: {
    csp: {
      enabled: true,
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://js.stripe.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "https://api.stripe.com"]
      }
    },
    rateLimit: {
      enabled: true,
      requests: 100,
      window: "15m"
    }
  },

  // Development Configuration
  development: {
    debugMode: process.env.NEXT_PUBLIC_DEBUG_MODE === "true",
    showDevTools: process.env.NEXT_PUBLIC_SHOW_DEV_TOOLS === "true",
    mockData: {
      enabled: true,
      users: true,
      transactions: true,
      analytics: true
    }
  },

  // Feature Flags
  features: {
    cryptoOnboarding: process.env.NEXT_PUBLIC_ENABLE_CRYPTO_ONBOARDING === "true",
    walletPreview: process.env.NEXT_PUBLIC_ENABLE_WALLET_PREVIEW === "true", 
    enterpriseSignup: process.env.NEXT_PUBLIC_ENABLE_ENTERPRISE_SIGNUP === "true",
    betaFeatures: process.env.NEXT_PUBLIC_ENABLE_BETA_FEATURES === "true",
    leadCapture: process.env.NEXT_PUBLIC_ENABLE_LEAD_CAPTURE === "true"
  },

  // Integration Settings
  integrations: {
    stripe: {
      enabled: true,
      publicKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      products: ["caas_enterprise", "waas_premium", "hybrid_custody"]
    },
    email: {
      provider: "smtp",
      templates: ["welcome", "demo_request", "newsletter_confirmation"]
    }
  }
};

module.exports = monayConfig;