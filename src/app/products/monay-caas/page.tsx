"use client";

import { useState, useEffect } from "react";
import Navigation from "../../../components/Navigation";

export default function MonayCaaSPage() {
  const [isDarkMode, setIsDarkMode] = useState(false);

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
      <section className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">
              Monay CaaS
            </h1>
            <p className="text-2xl mb-8">
              Enterprise Coin-as-a-Service Platform
            </p>
            <p className="text-lg opacity-90 mb-8">
              Deploy and operate compliant stablecoins with dual-rail blockchain architecture. 
              Base EVM L2 for enterprise, Solana for consumer—unified by our Business Rule Framework.
            </p>
            <div className="flex justify-center gap-4">
              <a href="/signup/monay-caas" className="bg-white text-green-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Sign Up Now (75% Off)
              </a>
              <a href="/developers" className="bg-transparent border-2 border-white px-8 py-4 rounded-lg font-semibold hover:bg-white/10 transition-colors">
                View Documentation
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className={`py-16 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="container mx-auto px-4">
          <h2 className={`text-3xl font-bold text-center mb-12 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Dual-Rail Blockchain Architecture
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-green-50'}`}>
              <div className="w-16 h-16 bg-green-600 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className={`text-xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Enterprise Rail (Base EVM L2)</h3>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                Deploy ERC-3643 compliant tokens with built-in compliance, KYB verification, and institutional-grade features.
              </p>
              <ul className={`mt-4 space-y-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-800'}`}>
                <li>• ERC-3643 token standard</li>
                <li>• On-chain identity management</li>
                <li>• Multi-signature controls</li>
                <li>• Compliance rule engine</li>
                <li>• &lt;5 second settlements</li>
              </ul>
            </div>

            <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
              <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className={`text-xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Consumer Rail (Solana)</h3>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                Lightning-fast consumer payments with Token-2022 extensions for compliance and programmability.
              </p>
              <ul className={`mt-4 space-y-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-800'}`}>
                <li>• Token-2022 extensions</li>
                <li>• &lt;1 second transactions</li>
                <li>• 10,000+ TPS capability</li>
                <li>• Transfer hooks</li>
                <li>• Confidential transfers</li>
              </ul>
            </div>
          </div>

          {/* Cross-Rail Treasury */}
          <div className={`mt-8 p-6 rounded-lg ${isDarkMode ? 'bg-purple-900/20' : 'bg-purple-50'} border-2 ${isDarkMode ? 'border-purple-700' : 'border-purple-200'}`}>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <h3 className={`text-xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Cross-Rail Treasury Operations</h3>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-800'} max-w-3xl mx-auto`}>
                Seamless value movement between enterprise and consumer rails with atomic swaps, real-time reconciliation, 
                and unified treasury management. Complete cross-rail transfers in under 60 seconds.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Business Rule Framework */}
      <section className={`py-16 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="container mx-auto px-4">
          <h2 className={`text-3xl font-bold text-center mb-12 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Business Rule Framework (BRF)
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
              <h3 className={`text-xl font-bold mb-3 text-orange-600`}>Compliance Engine</h3>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                Real-time KYB/KYC verification, transaction monitoring, and regulatory reporting across both rails.
              </p>
            </div>
            
            <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
              <h3 className={`text-xl font-bold mb-3 text-red-600`}>Supply Controls</h3>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                Programmatic mint/burn policies, supply caps, and multi-signature treasury operations.
              </p>
            </div>
            
            <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
              <h3 className={`text-xl font-bold mb-3 text-indigo-600`}>Transaction Rules</h3>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                Velocity limits, geographic restrictions, allowlist/blocklist management, and custom policies.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className={`py-16 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="container mx-auto px-4">
          <h2 className={`text-3xl font-bold text-center mb-12 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Industry Applications
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gradient-to-br from-green-50 to-blue-50'}`}>
              <h3 className={`text-xl font-bold mb-3 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>Corporate Treasury</h3>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                Issue corporate stablecoins for internal settlements, vendor payments, and cross-border transactions.
              </p>
            </div>
            
            <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gradient-to-br from-blue-50 to-purple-50'}`}>
              <h3 className={`text-xl font-bold mb-3 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>Banking & Deposits</h3>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                Tokenized deposits with instant settlement, programmable interest, and regulatory compliance.
              </p>
            </div>
            
            <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gradient-to-br from-purple-50 to-pink-50'}`}>
              <h3 className={`text-xl font-bold mb-3 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>Remittance</h3>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                Cross-border value transfer with instant settlement, low fees, and built-in compliance.
              </p>
            </div>
            
            <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gradient-to-br from-orange-50 to-red-50'}`}>
              <h3 className={`text-xl font-bold mb-3 ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}>Payroll & Benefits</h3>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                Instant payroll distribution with programmable vesting, tax withholding, and benefits allocation.
              </p>
            </div>
            
            <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gradient-to-br from-red-50 to-yellow-50'}`}>
              <h3 className={`text-xl font-bold mb-3 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>Supply Chain</h3>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                Invoice-backed transactions with automatic reconciliation and vendor financing options.
              </p>
            </div>
            
            <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gradient-to-br from-indigo-50 to-blue-50'}`}>
              <h3 className={`text-xl font-bold mb-3 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>Loyalty Programs</h3>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                Tokenized rewards with instant redemption, cross-merchant portability, and real value backing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Technical Specs */}
      <section className={`py-16 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="container mx-auto px-4">
          <h2 className={`text-3xl font-bold text-center mb-12 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Technical Specifications
          </h2>
          
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Performance</h3>
                <ul className={`space-y-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                  <li>✓ 1,000 TPS (Enterprise)</li>
                  <li>✓ 10,000 TPS (Consumer)</li>
                  <li>✓ &lt;5s enterprise settlement</li>
                  <li>✓ &lt;1s consumer payment</li>
                  <li>✓ &lt;60s cross-rail swap</li>
                  <li>✓ 99.95% uptime SLA</li>
                </ul>
              </div>
              
              <div>
                <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Security</h3>
                <ul className={`space-y-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                  <li>✓ HSM key management</li>
                  <li>✓ Multi-sig treasury</li>
                  <li>✓ AES-256 encryption</li>
                  <li>✓ Zero-knowledge proofs</li>
                  <li>✓ Formal verification</li>
                  <li>✓ Security audited</li>
                </ul>
              </div>
              
              <div>
                <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Compliance</h3>
                <ul className={`space-y-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                  <li>✓ ERC-3643 compliant</li>
                  <li>✓ FinCEN registered</li>
                  <li>✓ SOC2 Type II</li>
                  <li>✓ GDPR compliant</li>
                  <li>✓ Immutable audit trail</li>
                  <li>✓ Real-time reporting</li>
                </ul>
              </div>
            </div>
            
            <div className={`mt-12 p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-green-50'} rounded-lg`}>
              <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Integration Options</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>APIs & SDKs</h4>
                  <ul className={`space-y-1 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                    <li>• REST API & GraphQL</li>
                    <li>• WebSocket real-time updates</li>
                    <li>• SDKs: Node.js, Python, Go, Java</li>
                    <li>• Smart contract libraries</li>
                  </ul>
                </div>
                <div>
                  <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Enterprise Integrations</h4>
                  <ul className={`space-y-1 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                    <li>• ERP: SAP, Oracle, NetSuite</li>
                    <li>• Banking: FIS, Fiserv, Jack Henry</li>
                    <li>• Compliance: Chainalysis, Elliptic</li>
                    <li>• Treasury: Kyriba, GTreasury</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className={`py-16 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="container mx-auto px-4">
          <h2 className={`text-3xl font-bold text-center mb-12 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Enterprise-Friendly Pricing
          </h2>
          
          <div className="max-w-4xl mx-auto text-center">
            <p className={`text-xl mb-8 ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
              Transparent pricing that scales with your transaction volume
            </p>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-white'} shadow-lg`}>
                <div className={`font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Starter</div>
                <div className="text-3xl font-bold text-green-600 mb-2">$2,499</div>
                <div className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-800'}`}>per month</div>
                <ul className={`text-left space-y-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                  <li>✓ Up to 50K transactions</li>
                  <li>✓ Both rails included</li>
                  <li>✓ Basic compliance</li>
                  <li>✓ Email support</li>
                </ul>
              </div>
              
              <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gradient-to-br from-blue-900 to-purple-900' : 'bg-gradient-to-br from-blue-500 to-purple-500'} text-white shadow-lg transform scale-105`}>
                <div className="font-bold mb-2">Scale</div>
                <div className="text-3xl font-bold mb-2">$9,999</div>
                <div className="text-sm mb-4 opacity-90">per month</div>
                <ul className="text-left space-y-2 text-sm">
                  <li>✓ Up to 500K transactions</li>
                  <li>✓ Advanced BRF rules</li>
                  <li>✓ Priority support</li>
                  <li>✓ Custom integrations</li>
                  <li>✓ 99.95% SLA</li>
                </ul>
              </div>
              
              <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-white'} shadow-lg`}>
                <div className={`font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Enterprise</div>
                <div className="text-3xl font-bold text-orange-600 mb-2">Custom</div>
                <div className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-800'}`}>volume-based</div>
                <ul className={`text-left space-y-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                  <li>✓ Unlimited transactions</li>
                  <li>✓ Dedicated infrastructure</li>
                  <li>✓ 24/7 phone support</li>
                  <li>✓ Custom deployment</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-12 p-6 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg">
              <h3 className="text-2xl font-bold mb-2">🎉 Pilot Program Special</h3>
              <p className="text-lg mb-4">Get 75% off your first year + dedicated implementation support</p>
              <a href="/signup/monay-caas" className="inline-block bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Sign Up Now
              </a>
            </div>
            
            <div className="mt-8">
              <a href="/pricing" className="text-blue-600 hover:text-blue-700 font-semibold">
                View detailed pricing & compare with competitors →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Deploy Your Enterprise Stablecoin?
          </h2>
          <p className="text-xl mb-8">
            Join leading enterprises already using Monay CaaS
          </p>
          <div className="flex justify-center gap-4">
            <a href="/signup/monay-caas" className="bg-white text-green-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Start Pilot Program
            </a>
            <a href="/contact" className="bg-transparent border-2 border-white px-8 py-4 rounded-lg font-semibold hover:bg-white/10 transition-colors">
              Request Demo
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}