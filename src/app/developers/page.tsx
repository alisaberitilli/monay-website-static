"use client";

import { useState, useEffect } from "react";
import Navigation from "../../components/Navigation";
import { useIsClient } from "@/hooks/useIsClient";

export default function DevelopersPage() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('quickstart');
  const isClient = useIsClient();

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode !== null) {
      setIsDarkMode(JSON.parse(savedDarkMode));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Navigation isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-20">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl font-bold text-center mb-4">
            Developer Documentation
          </h1>
          <p className="text-xl text-center opacity-90">
            Build on Monay's powerful APIs and SDKs
          </p>
        </div>
      </section>

      {/* Navigation Tabs */}
      <section className={`sticky top-0 z-10 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border-b`}>
        <div className="container mx-auto px-4">
          <div className="flex space-x-8 overflow-x-auto">
            {['quickstart', 'api', 'sdks', 'webhooks', 'testing'].map((tab) => (
              <button
                key={tab}
                onClick={(e) => {
                  if (!isClient) return;
                  e.preventDefault();
                  e.stopPropagation();
                  setActiveTab(tab);
                }}
                className={`py-4 px-2 border-b-2 font-semibold capitalize whitespace-nowrap ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : isDarkMode ? 'border-transparent text-gray-300 hover:border-gray-300' : 'border-transparent text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab === 'sdks' ? 'SDKs' : tab === 'api' ? 'API Reference' : tab}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Content Sections */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Quick Start */}
          {activeTab === 'quickstart' && (
            <div>
              <h2 className={`text-3xl font-bold mb-8 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Quick Start Guide</h2>
              
              <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-8 rounded-lg shadow-lg mb-8`}>
                <h3 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Get Started in 3 Steps</h3>
                
                <div className="space-y-6">
                  <div>
                    <h4 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>1. Get Your API Keys</h4>
                    <div className={`${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'} p-4 rounded-lg font-mono text-sm`}>
                      <p className="text-green-600"># Sign up for a developer account</p>
                      <p className={isDarkMode ? 'text-gray-300' : 'text-gray-800'}>Visit https://monay.com/signup</p>
                      <p className="mt-2 text-green-600"># Get your API keys from the dashboard</p>
                      <p className={isDarkMode ? 'text-gray-300' : 'text-gray-800'}>Dashboard → Settings → API Keys</p>
                    </div>
                  </div>

                  <div>
                    <h4 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>2. Install the SDK</h4>
                    <div className={`${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'} p-4 rounded-lg font-mono text-sm`}>
                      <p className="text-green-600"># Node.js</p>
                      <p className={isDarkMode ? 'text-gray-300' : 'text-gray-800'}>npm install @monay/sdk</p>
                      <p className="mt-2 text-green-600"># Python</p>
                      <p className={isDarkMode ? 'text-gray-300' : 'text-gray-800'}>pip install monay-sdk</p>
                      <p className="mt-2 text-green-600"># Go</p>
                      <p className={isDarkMode ? 'text-gray-300' : 'text-gray-800'}>go get github.com/monay/sdk-go</p>
                    </div>
                  </div>

                  <div>
                    <h4 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>3. Make Your First Call</h4>
                    <div className={`${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'} p-4 rounded-lg font-mono text-sm overflow-x-auto`}>
                      <pre className={isDarkMode ? 'text-gray-300' : 'text-gray-800'}>{`import { MonayClient } from '@monay/sdk';

const client = new MonayClient({
  apiKey: 'your-api-key',
  environment: 'sandbox'
});

// Create a wallet
const wallet = await client.wallets.create({
  userId: 'user123',
  currency: 'USD',
  type: 'consumer'
});

console.log('Wallet created:', wallet.id);`}</pre>
                    </div>
                  </div>
                </div>
              </div>

              {/* Invoice First Integration */}
              <div className={`${isDarkMode ? 'bg-purple-900/20' : 'bg-purple-50'} p-8 rounded-lg border-2 ${isDarkMode ? 'border-purple-700' : 'border-purple-200'}`}>
                <h3 className="text-2xl font-bold mb-4 text-purple-600">Invoice First™ Integration</h3>
                <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                  Enable invoice-backed transactions for complete auditability and automation.
                </p>
                
                <div className={`${isDarkMode ? 'bg-gray-900' : 'bg-white'} p-4 rounded-lg font-mono text-sm overflow-x-auto`}>
                  <pre className={isDarkMode ? 'text-gray-300' : 'text-gray-800'}>{`// Create an invoice-backed transaction
const transaction = await client.transactions.create({
  amount: 1000.00,
  currency: 'USD',
  invoice: {
    number: 'INV-2024-001',
    erpSystem: 'SAP',
    purchaseOrder: 'PO-123456',
    lineItems: [
      { description: 'Professional Services', amount: 1000.00 }
    ]
  },
  from: 'wallet_abc123',
  to: 'wallet_xyz789',
  metadata: {
    department: 'Engineering',
    costCenter: 'CC-100'
  }
});

// The transaction is automatically validated against:
// - ERP invoice records
// - Purchase order approval
// - Budget constraints
// - Compliance rules`}</pre>
                </div>
              </div>
            </div>
          )}

          {/* API Reference */}
          {activeTab === 'api' && (
            <div>
              <h2 className={`text-3xl font-bold mb-8 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>API Reference</h2>
              
              <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-8 rounded-lg shadow-lg`}>
                <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Base URL</h3>
                <div className={`${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'} p-4 rounded-lg font-mono`}>
                  <p className={isDarkMode ? 'text-gray-300' : 'text-gray-800'}>Production: https://api.monay.com/v1</p>
                  <p className={isDarkMode ? 'text-gray-300' : 'text-gray-800'}>Sandbox: https://sandbox.api.monay.com/v1</p>
                </div>

                <h3 className={`text-xl font-bold mt-8 mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Authentication</h3>
                <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                  All API requests must include your API key in the Authorization header:
                </p>
                <div className={`${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'} p-4 rounded-lg font-mono`}>
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-800'}>Authorization: Bearer YOUR_API_KEY</span>
                </div>

                <h3 className={`text-xl font-bold mt-8 mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Core Endpoints</h3>
                <div className="space-y-4">
                  <div className={`border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} rounded-lg p-4`}>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="bg-green-600 text-white px-2 py-1 rounded text-sm font-bold">POST</span>
                      <code className={`font-mono ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>/auth/register</code>
                    </div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-800'}`}>
                      Register a new user with Monay ID including voice biometrics
                    </p>
                  </div>

                  <div className={`border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} rounded-lg p-4`}>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="bg-green-600 text-white px-2 py-1 rounded text-sm font-bold">POST</span>
                      <code className={`font-mono ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>/wallets</code>
                    </div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-800'}`}>
                      Create a new wallet (consumer or enterprise)
                    </p>
                  </div>

                  <div className={`border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} rounded-lg p-4`}>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="bg-green-600 text-white px-2 py-1 rounded text-sm font-bold">POST</span>
                      <code className={`font-mono ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>/tokens/issue</code>
                    </div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-800'}`}>
                      Issue enterprise tokens on Base or Solana
                    </p>
                  </div>

                  <div className={`border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} rounded-lg p-4`}>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="bg-green-600 text-white px-2 py-1 rounded text-sm font-bold">POST</span>
                      <code className={`font-mono ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>/transactions</code>
                    </div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-800'}`}>
                      Create a transaction with optional invoice backing
                    </p>
                  </div>

                  <div className={`border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} rounded-lg p-4`}>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="bg-blue-600 text-white px-2 py-1 rounded text-sm font-bold">GET</span>
                      <code className={`font-mono ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>/invoices/:id</code>
                    </div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-800'}`}>
                      Retrieve invoice details and payment status
                    </p>
                  </div>

                  <div className={`border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} rounded-lg p-4`}>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="bg-green-600 text-white px-2 py-1 rounded text-sm font-bold">POST</span>
                      <code className={`font-mono ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>/cards/issue</code>
                    </div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-800'}`}>
                      Issue virtual or physical cards
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SDKs */}
          {activeTab === 'sdks' && (
            <div>
              <h2 className={`text-3xl font-bold mb-8 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>SDKs & Libraries</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-lg`}>
                  <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Backend SDKs</h3>
                  <div className="space-y-3">
                    <a href="#" className={`flex items-center gap-3 hover:text-blue-600 ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                      <span className="text-2xl">📦</span>
                      <div>
                        <div className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Node.js / TypeScript</div>
                        <code className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>npm install @monay/sdk</code>
                      </div>
                    </a>
                    <a href="#" className={`flex items-center gap-3 hover:text-blue-600 ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                      <span className="text-2xl">🐍</span>
                      <div>
                        <div className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Python</div>
                        <code className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>pip install monay-sdk</code>
                      </div>
                    </a>
                    <a href="#" className={`flex items-center gap-3 hover:text-blue-600 ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                      <span className="text-2xl">🔷</span>
                      <div>
                        <div className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Go</div>
                        <code className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>go get github.com/monay/sdk-go</code>
                      </div>
                    </a>
                    <a href="#" className={`flex items-center gap-3 hover:text-blue-600 ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                      <span className="text-2xl">☕</span>
                      <div>
                        <div className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Java</div>
                        <code className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>com.monay:monay-sdk:1.0.0</code>
                      </div>
                    </a>
                    <a href="#" className={`flex items-center gap-3 hover:text-blue-600 ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                      <span className="text-2xl">💎</span>
                      <div>
                        <div className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Ruby</div>
                        <code className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>gem install monay</code>
                      </div>
                    </a>
                  </div>
                </div>

                <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-lg`}>
                  <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Frontend SDKs</h3>
                  <div className="space-y-3">
                    <a href="#" className={`flex items-center gap-3 hover:text-blue-600 ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                      <span className="text-2xl">⚛️</span>
                      <div>
                        <div className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>React</div>
                        <code className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>npm install @monay/react</code>
                      </div>
                    </a>
                    <a href="#" className={`flex items-center gap-3 hover:text-blue-600 ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                      <span className="text-2xl">🅰️</span>
                      <div>
                        <div className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Angular</div>
                        <code className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>npm install @monay/angular</code>
                      </div>
                    </a>
                    <a href="#" className={`flex items-center gap-3 hover:text-blue-600 ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                      <span className="text-2xl">🖼️</span>
                      <div>
                        <div className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Vue.js</div>
                        <code className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>npm install @monay/vue</code>
                      </div>
                    </a>
                    <a href="#" className={`flex items-center gap-3 hover:text-blue-600 ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                      <span className="text-2xl">📱</span>
                      <div>
                        <div className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>iOS (Swift)</div>
                        <code className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>pod 'MonaySDK'</code>
                      </div>
                    </a>
                    <a href="#" className={`flex items-center gap-3 hover:text-blue-600 ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                      <span className="text-2xl">🤖</span>
                      <div>
                        <div className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Android (Kotlin)</div>
                        <code className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>implementation 'com.monay:sdk'</code>
                      </div>
                    </a>
                  </div>
                </div>
              </div>

              <div className={`mt-8 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-lg`}>
                <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Smart Contract SDKs</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Base / EVM</h4>
                    <div className={`${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'} p-4 rounded-lg font-mono text-sm`}>
                      <p className={isDarkMode ? 'text-gray-300' : 'text-gray-800'}>npm install @monay/contracts-evm</p>
                      <p className="mt-2 text-green-600"># Includes ERC-3643 compliant contracts</p>
                    </div>
                  </div>
                  <div>
                    <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Solana</h4>
                    <div className={`${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'} p-4 rounded-lg font-mono text-sm`}>
                      <p className={isDarkMode ? 'text-gray-300' : 'text-gray-800'}>cargo add monay-solana</p>
                      <p className="mt-2 text-green-600"># Token-2022 extensions included</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Webhooks */}
          {activeTab === 'webhooks' && (
            <div>
              <h2 className={`text-3xl font-bold mb-8 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Webhooks</h2>
              
              <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-8 rounded-lg shadow-lg`}>
                <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Event Types</h3>
                <div className="space-y-4">
                  <div className={`border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} rounded-lg p-4`}>
                    <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>transaction.created</h4>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-800'}`}>
                      Fired when a new transaction is initiated
                    </p>
                  </div>
                  <div className={`border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} rounded-lg p-4`}>
                    <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>transaction.completed</h4>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-800'}`}>
                      Fired when a transaction is successfully completed
                    </p>
                  </div>
                  <div className={`border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} rounded-lg p-4`}>
                    <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>invoice.matched</h4>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-800'}`}>
                      Fired when an invoice is matched with a transaction
                    </p>
                  </div>
                  <div className={`border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} rounded-lg p-4`}>
                    <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>wallet.created</h4>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-800'}`}>
                      Fired when a new wallet is created
                    </p>
                  </div>
                  <div className={`border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} rounded-lg p-4`}>
                    <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>card.issued</h4>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-800'}`}>
                      Fired when a virtual or physical card is issued
                    </p>
                  </div>
                  <div className={`border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} rounded-lg p-4`}>
                    <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>kyc.completed</h4>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-800'}`}>
                      Fired when KYC verification is completed
                    </p>
                  </div>
                </div>

                <h3 className={`text-xl font-bold mt-8 mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Webhook Security</h3>
                <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                  All webhooks are signed using HMAC-SHA256. Verify the signature to ensure authenticity:
                </p>
                <div className={`${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'} p-4 rounded-lg font-mono text-sm overflow-x-auto`}>
                  <pre className={isDarkMode ? 'text-gray-300' : 'text-gray-800'}>{`const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const hash = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return hash === signature;
}`}</pre>
                </div>
              </div>
            </div>
          )}

          {/* Testing */}
          {activeTab === 'testing' && (
            <div>
              <h2 className={`text-3xl font-bold mb-8 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Testing & Sandbox</h2>
              
              <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-8 rounded-lg shadow-lg mb-8`}>
                <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Sandbox Environment</h3>
                <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                  Use our sandbox environment to test your integration without real money or blockchain transactions.
                </p>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Test Credentials</h4>
                    <div className={`${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'} p-4 rounded-lg text-sm`}>
                      <p className={isDarkMode ? 'text-gray-300' : 'text-gray-800'}><strong>API Key:</strong> sk_test_abc123...</p>
                      <p className={isDarkMode ? 'text-gray-300' : 'text-gray-800'}><strong>Environment:</strong> sandbox</p>
                      <p className={isDarkMode ? 'text-gray-300' : 'text-gray-800'}><strong>Base URL:</strong> https://sandbox.api.monay.com</p>
                    </div>
                  </div>
                  <div>
                    <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Test Cards</h4>
                    <div className={`${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'} p-4 rounded-lg text-sm`}>
                      <p className={isDarkMode ? 'text-gray-300' : 'text-gray-800'}><strong>Success:</strong> 4242 4242 4242 4242</p>
                      <p className={isDarkMode ? 'text-gray-300' : 'text-gray-800'}><strong>Decline:</strong> 4000 0000 0000 0002</p>
                      <p className={isDarkMode ? 'text-gray-300' : 'text-gray-800'}><strong>3D Secure:</strong> 4000 0000 0000 3220</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-8 rounded-lg shadow-lg`}>
                <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Testing Checklist</h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-3">
                    <input type="checkbox" className="w-5 h-5" />
                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-800'}>Test user registration with voice biometrics</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input type="checkbox" className="w-5 h-5" />
                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-800'}>Create test wallets (consumer and enterprise)</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input type="checkbox" className="w-5 h-5" />
                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-800'}>Execute test transactions with invoice backing</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input type="checkbox" className="w-5 h-5" />
                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-800'}>Test cross-rail token swaps</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input type="checkbox" className="w-5 h-5" />
                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-800'}>Issue and activate test cards</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input type="checkbox" className="w-5 h-5" />
                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-800'}>Test webhook delivery and processing</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input type="checkbox" className="w-5 h-5" />
                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-800'}>Verify error handling and edge cases</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input type="checkbox" className="w-5 h-5" />
                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-800'}>Test compliance and KYC flows</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Build?
          </h2>
          <p className="text-xl mb-8">
            Join the Pilot Program and get 75% off plus dedicated support
          </p>
          <div className="flex justify-center gap-4">
            <a href="/signup" className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Start Building
            </a>
            <a href="/contact" className="bg-transparent border-2 border-white px-8 py-4 rounded-lg font-semibold hover:bg-white/10 transition-colors">
              Contact Sales
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}