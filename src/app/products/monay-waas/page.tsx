"use client";

import { useState, useEffect } from "react";
import Navigation from "../../../components/Navigation";

export default function MonayWaaSPage() {
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
      <section className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">
              Monay WaaS
            </h1>
            <p className="text-2xl mb-8">
              Complete Wallet-as-a-Service Infrastructure
            </p>
            <p className="text-lg opacity-90 mb-8">
              Launch digital wallets in days, not months. Full-stack solution with cards, 
              ACH, wire transfers, and seamless fiat on/off-ramps—all through a single API.
            </p>
            <div className="flex justify-center gap-4">
              <a href="/signup/monay-waas" className="bg-white text-purple-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
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
            Complete Payment Stack
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-purple-50'}`}>
              <div className="w-16 h-16 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h3 className={`text-xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Card Issuance</h3>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                Virtual and physical cards with instant issuance, Apple/Google Wallet, and real-time controls.
              </p>
              <ul className={`mt-4 space-y-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-800'}`}>
                <li>• Instant virtual cards</li>
                <li>• Premium metal cards</li>
                <li>• Dynamic spend controls</li>
                <li>• Real-time notifications</li>
              </ul>
            </div>

            <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-pink-50'}`}>
              <div className="w-16 h-16 bg-pink-600 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className={`text-xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Money Movement</h3>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                Complete suite of payment rails including ACH, wire transfers, FedNow, and RTP.
              </p>
              <ul className={`mt-4 space-y-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-800'}`}>
                <li>• Same-day ACH</li>
                <li>• Domestic & international wires</li>
                <li>• Instant payments (RTP/FedNow)</li>
                <li>• Check deposits</li>
              </ul>
            </div>

            <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-indigo-50'}`}>
              <div className="w-16 h-16 bg-indigo-600 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className={`text-xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Compliance Built-in</h3>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                KYC/AML, transaction monitoring, and regulatory reporting handled automatically.
              </p>
              <ul className={`mt-4 space-y-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-800'}`}>
                <li>• Automated KYC/KYB</li>
                <li>• Real-time fraud detection</li>
                <li>• Sanctions screening</li>
                <li>• Regulatory reporting</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Advanced Features */}
      <section className={`py-16 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="container mx-auto px-4">
          <h2 className={`text-3xl font-bold text-center mb-12 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Advanced Capabilities
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gradient-to-br from-purple-50 to-pink-50'} border-2 ${isDarkMode ? 'border-purple-700' : 'border-purple-200'}`}>
              <h3 className={`text-xl font-bold mb-3 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>Multi-Currency Support</h3>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-800'} mb-4`}>
                Hold, convert, and transact in 35+ currencies with real-time FX rates and low fees.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Fiat Currencies</h4>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-800'}`}>USD, EUR, GBP, JPY, and 30+ more</p>
                </div>
                <div>
                  <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Crypto Assets</h4>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-800'}`}>BTC, ETH, USDC, and major stablecoins</p>
                </div>
              </div>
            </div>

            <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gradient-to-br from-blue-50 to-green-50'} border-2 ${isDarkMode ? 'border-blue-700' : 'border-blue-200'}`}>
              <h3 className={`text-xl font-bold mb-3 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>ATM Network Access</h3>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-800'} mb-4`}>
                Cardless ATM withdrawals via QR code/NFC at 55,000+ AllPoint locations.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Withdrawal Methods</h4>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-800'}`}>Card, QR code, NFC tap</p>
                </div>
                <div>
                  <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Coverage</h4>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-800'}`}>55,000+ ATMs nationwide</p>
                </div>
              </div>
            </div>

            <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gradient-to-br from-green-50 to-yellow-50'} border-2 ${isDarkMode ? 'border-green-700' : 'border-green-200'}`}>
              <h3 className={`text-xl font-bold mb-3 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>Rewards & Cashback</h3>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-800'} mb-4`}>
                Customizable rewards programs with instant cashback and point redemption.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Reward Types</h4>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-800'}`}>Cashback, points, miles, crypto</p>
                </div>
                <div>
                  <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Customization</h4>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-800'}`}>Category boosts, tier benefits</p>
                </div>
              </div>
            </div>

            <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gradient-to-br from-orange-50 to-red-50'} border-2 ${isDarkMode ? 'border-orange-700' : 'border-orange-200'}`}>
              <h3 className={`text-xl font-bold mb-3 ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}>Sub-Account Management</h3>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-800'} mb-4`}>
                Create unlimited sub-accounts for budgeting, family members, or business departments.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Account Types</h4>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-800'}`}>Savings, checking, virtual cards</p>
                </div>
                <div>
                  <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Controls</h4>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-800'}`}>Spend limits, permissions, alerts</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className={`py-16 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="container mx-auto px-4">
          <h2 className={`text-3xl font-bold text-center mb-12 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Built for Every Industry
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-white'} shadow-lg`}>
              <h3 className={`text-xl font-bold mb-3 text-purple-600`}>Neobanks</h3>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                Launch a digital bank with accounts, cards, and payments in weeks. White-label ready.
              </p>
            </div>
            
            <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-white'} shadow-lg`}>
              <h3 className={`text-xl font-bold mb-3 text-blue-600`}>Gig Economy</h3>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                Instant payouts, expense cards, and tax withholding for drivers and freelancers.
              </p>
            </div>
            
            <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-white'} shadow-lg`}>
              <h3 className={`text-xl font-bold mb-3 text-green-600`}>Employee Benefits</h3>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                HSA/FSA accounts, wellness rewards, and expense management with virtual cards.
              </p>
            </div>
            
            <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-white'} shadow-lg`}>
              <h3 className={`text-xl font-bold mb-3 text-orange-600`}>Teen Banking</h3>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                Parental controls, chore payments, savings goals, and financial education tools.
              </p>
            </div>
            
            <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-white'} shadow-lg`}>
              <h3 className={`text-xl font-bold mb-3 text-red-600`}>Travel & Expense</h3>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                Corporate cards with receipt capture, mileage tracking, and automated expense reports.
              </p>
            </div>
            
            <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-white'} shadow-lg`}>
              <h3 className={`text-xl font-bold mb-3 text-indigo-600`}>Crypto Platforms</h3>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                Fiat on/off-ramps, stablecoin wallets, and crypto-backed debit cards.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Technical Specs */}
      <section className={`py-16 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="container mx-auto px-4">
          <h2 className={`text-3xl font-bold text-center mb-12 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Technical Excellence
          </h2>
          
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>API Performance</h3>
                <ul className={`space-y-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                  <li>✓ &lt;100ms response time</li>
                  <li>✓ 99.99% uptime SLA</li>
                  <li>✓ 10,000+ RPS capacity</li>
                  <li>✓ Real-time webhooks</li>
                  <li>✓ Idempotent requests</li>
                  <li>✓ GraphQL available</li>
                </ul>
              </div>
              
              <div>
                <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Security</h3>
                <ul className={`space-y-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                  <li>✓ PCI-DSS Level 1</li>
                  <li>✓ SOC2 Type II</li>
                  <li>✓ Bank-grade encryption</li>
                  <li>✓ Tokenization</li>
                  <li>✓ 3D Secure 2.0</li>
                  <li>✓ Biometric authentication</li>
                </ul>
              </div>
              
              <div>
                <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Integration</h3>
                <ul className={`space-y-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                  <li>✓ RESTful API</li>
                  <li>✓ SDKs (10+ languages)</li>
                  <li>✓ Embeddable UI</li>
                  <li>✓ Mobile SDKs</li>
                  <li>✓ Postman collection</li>
                  <li>✓ Sandbox environment</li>
                </ul>
              </div>
            </div>
            
            <div className={`mt-12 p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-purple-50'} rounded-lg`}>
              <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Partnership Network</h3>
              <div className="grid md:grid-cols-4 gap-6 text-center">
                <div>
                  <div className={`text-3xl font-bold text-purple-600 mb-1`}>Visa</div>
                  <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-800'}`}>Card Network</div>
                </div>
                <div>
                  <div className={`text-3xl font-bold text-blue-600 mb-1`}>TilliPay</div>
                  <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-800'}`}>Payment Rails</div>
                </div>
                <div>
                  <div className={`text-3xl font-bold text-green-600 mb-1`}>Persona</div>
                  <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-800'}`}>KYC Provider</div>
                </div>
                <div>
                  <div className={`text-3xl font-bold text-orange-600 mb-1`}>AllPoint</div>
                  <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-800'}`}>ATM Network</div>
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
            Transparent, Usage-Based Pricing
          </h2>
          
          <div className="max-w-4xl mx-auto text-center">
            <p className={`text-xl mb-8 ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
              Pay only for active wallets. No setup fees, no hidden costs.
            </p>
            
            <div className="grid md:grid-cols-4 gap-4">
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-white'} shadow-lg`}>
                <div className={`font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Starter</div>
                <div className="text-2xl font-bold text-green-600">Free</div>
                <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-800'}`}>First 1,000 wallets</div>
                <div className={`text-xs mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-800'}`}>$0.15 per wallet after</div>
              </div>
              
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-white'} shadow-lg`}>
                <div className={`font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Growth</div>
                <div className="text-2xl font-bold text-blue-600">$299</div>
                <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-800'}`}>Up to 10K wallets</div>
                <div className={`text-xs mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-800'}`}>$0.10 per wallet after</div>
              </div>
              
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-white'} shadow-lg`}>
                <div className={`font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Scale</div>
                <div className="text-2xl font-bold text-purple-600">$999</div>
                <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-800'}`}>Up to 50K wallets</div>
                <div className={`text-xs mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-800'}`}>$0.05 per wallet after</div>
              </div>
              
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-white'} shadow-lg`}>
                <div className={`font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Enterprise</div>
                <div className="text-2xl font-bold text-orange-600">$2,999+</div>
                <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-800'}`}>Unlimited wallets</div>
                <div className={`text-xs mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-800'}`}>Volume discounts</div>
              </div>
            </div>
            
            <div className="mt-12 grid md:grid-cols-2 gap-6">
              <div className={`p-6 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg`}>
                <h3 className={`text-lg font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Transaction Fees</h3>
                <ul className={`text-sm space-y-2 text-left ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                  <li>• Card transactions: 1.5% + $0.10</li>
                  <li>• ACH transfers: $0.25</li>
                  <li>• Wire transfers: $15</li>
                  <li>• International: 2.5% FX markup</li>
                </ul>
              </div>
              
              <div className={`p-6 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg`}>
                <h3 className={`text-lg font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>What's Included</h3>
                <ul className={`text-sm space-y-2 text-left ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                  <li>✓ KYC/AML compliance</li>
                  <li>✓ Card program management</li>
                  <li>✓ Fraud monitoring</li>
                  <li>✓ 24/7 customer support</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-8">
              <a href="/pricing" className="text-blue-600 hover:text-blue-700 font-semibold">
                View full pricing comparison →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Launch Your Wallet Platform Today
          </h2>
          <p className="text-xl mb-8">
            Go live in days with our white-label solution
          </p>
          <div className="flex justify-center gap-4">
            <a href="/#pilot-program" className="bg-white text-purple-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Start Pilot Program
            </a>
            <a href="/contact" className="bg-transparent border-2 border-white px-8 py-4 rounded-lg font-semibold hover:bg-white/10 transition-colors">
              Schedule Demo
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}