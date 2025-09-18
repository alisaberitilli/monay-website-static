"use client";

import { useState, useEffect } from "react";
import PricingCalculator from "@/components/PricingCalculator";
import Navigation from "@/components/Navigation";

export default function PricingPage() {
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
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
      <Navigation isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
      {/* Hero Section */}
      <section className="bg-white border-b border-gray-200 py-20">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl font-bold text-center mb-4 text-gray-900">
            Save 50-90% Compared to Traditional Providers
          </h1>
          <p className="text-xl text-center text-gray-600">
            Transparent pricing that scales with your business
          </p>
        </div>
      </section>

      {/* Calculator Section */}
      <section className="py-16 -mt-10 bg-gray-50">
        <div className="container mx-auto px-4">
          <PricingCalculator isDarkMode={isDarkMode} />
        </div>
      </section>

      {/* Pricing Plans */}
      <section className={`py-16 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="container mx-auto px-4">
          <h2 className={`text-3xl font-bold text-center mb-12 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Detailed Pricing Plans
          </h2>

          {/* Monay ID Pricing */}
          <div className="mb-16">
            <h3 className={`text-2xl font-bold mb-8 text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Monay ID - Authentication Platform</h3>
            <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
              <div className={`p-6 rounded-lg border-2 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}>
                <h4 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Starter</h4>
                <div className={`text-3xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Free</div>
                <ul className={`space-y-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <li>✓ Up to 2,500 MAU</li>
                  <li>✓ All auth methods</li>
                  <li>✓ Voice biometrics</li>
                  <li>✓ Community support</li>
                </ul>
              </div>
              <div className={`p-6 rounded-lg border-2 ${isDarkMode ? 'bg-gray-700 border-blue-500' : 'bg-gray-50 border-gray-900'}`}>
                <div className="absolute -mt-8 -ml-2 bg-gray-900 text-white px-3 py-1 text-xs rounded font-semibold">POPULAR</div>
                <h4 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Growth</h4>
                <div className={`text-3xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>$149<span className="text-sm">/mo</span></div>
                <ul className={`space-y-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <li>✓ Up to 25,000 MAU</li>
                  <li>✓ Custodian recovery</li>
                  <li>✓ Email support</li>
                  <li>✓ 99.9% uptime SLA</li>
                </ul>
              </div>
              <div className={`p-6 rounded-lg border-2 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}>
                <h4 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Scale</h4>
                <div className={`text-3xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>$499<span className="text-sm">/mo</span></div>
                <ul className={`space-y-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <li>✓ Up to 100,000 MAU</li>
                  <li>✓ Priority support</li>
                  <li>✓ Custom branding</li>
                  <li>✓ Success manager</li>
                </ul>
              </div>
              <div className={`p-6 rounded-lg border-2 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}>
                <h4 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Enterprise</h4>
                <div className={`text-3xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Custom</div>
                <ul className={`space-y-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <li>✓ Unlimited MAU</li>
                  <li>✓ White-label</li>
                  <li>✓ On-premise option</li>
                  <li>✓ 99.99% uptime SLA</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Monay CaaS Pricing */}
          <div className="mb-16">
            <h3 className={`text-2xl font-bold mb-8 text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Monay CaaS - Stablecoin Platform</h3>
            <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
              <div className={`p-6 rounded-lg border-2 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}>
                <h4 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Sandbox</h4>
                <div className={`text-3xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Free</div>
                <ul className={`space-y-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <li>✓ Testnet only</li>
                  <li>✓ Unlimited test txns</li>
                  <li>✓ All templates</li>
                  <li>✓ Documentation</li>
                </ul>
              </div>
              <div className={`p-6 rounded-lg border-2 ${isDarkMode ? 'bg-gray-700 border-purple-500' : 'bg-gray-50 border-gray-900'}`}>
                <div className="absolute -mt-8 -ml-2 bg-gray-900 text-white px-3 py-1 text-xs rounded font-semibold">PILOT PROGRAM</div>
                <h4 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Starter</h4>
                <div className={`text-3xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>$2,499<span className="text-sm">/mo</span></div>
                <ul className={`space-y-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <li>✓ 50K transactions</li>
                  <li>✓ Single token</li>
                  <li>✓ KYB/AML tools</li>
                  <li>✓ $0.05/extra txn</li>
                </ul>
              </div>
              <div className={`p-6 rounded-lg border-2 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}>
                <h4 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Business</h4>
                <div className={`text-3xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>$9,999<span className="text-sm">/mo</span></div>
                <ul className={`space-y-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <li>✓ 500K transactions</li>
                  <li>✓ Multiple tokens</li>
                  <li>✓ Cross-rail ops</li>
                  <li>✓ White-label wallet</li>
                </ul>
              </div>
              <div className={`p-6 rounded-lg border-2 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}>
                <h4 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Enterprise</h4>
                <div className={`text-3xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>$24,999<span className="text-sm">/mo</span></div>
                <ul className={`space-y-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <li>✓ Unlimited txns</li>
                  <li>✓ Custom contracts</li>
                  <li>✓ Dedicated nodes</li>
                  <li>✓ 24/7 support</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Monay WaaS Pricing */}
          <div>
            <h3 className={`text-2xl font-bold mb-8 text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Monay WaaS - Wallet Infrastructure</h3>
            <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
              <div className={`p-6 rounded-lg border-2 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}>
                <h4 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Starter</h4>
                <div className={`text-3xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Free</div>
                <ul className={`space-y-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <li>✓ 1,000 wallets</li>
                  <li>✓ $0.15/transaction</li>
                  <li>✓ Virtual cards</li>
                  <li>✓ REST APIs</li>
                </ul>
              </div>
              <div className={`p-6 rounded-lg border-2 ${isDarkMode ? 'bg-gray-700 border-green-500' : 'bg-gray-50 border-gray-900'}`}>
                <div className="absolute -mt-8 -ml-2 bg-gray-900 text-white px-3 py-1 text-xs rounded font-semibold">RECOMMENDED</div>
                <h4 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Growth</h4>
                <div className={`text-3xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>$299<span className="text-sm">/mo</span></div>
                <ul className={`space-y-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <li>✓ 10,000 wallets</li>
                  <li>✓ $0.10/transaction</li>
                  <li>✓ Unlimited cards</li>
                  <li>✓ Phone support</li>
                </ul>
              </div>
              <div className={`p-6 rounded-lg border-2 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}>
                <h4 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Business</h4>
                <div className={`text-3xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>$999<span className="text-sm">/mo</span></div>
                <ul className={`space-y-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <li>✓ 50,000 wallets</li>
                  <li>✓ $0.05/transaction</li>
                  <li>✓ Physical cards</li>
                  <li>✓ Apple/Google Pay</li>
                </ul>
              </div>
              <div className={`p-6 rounded-lg border-2 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}>
                <h4 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Enterprise</h4>
                <div className={`text-3xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>$2,999<span className="text-sm">/mo</span></div>
                <ul className={`space-y-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <li>✓ Unlimited wallets</li>
                  <li>✓ $0.02/transaction</li>
                  <li>✓ White-label</li>
                  <li>✓ 24/7 support</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className={`py-16 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="container mx-auto px-4">
          <h2 className={`text-3xl font-bold text-center mb-12 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Why We're 50-90% Cheaper
          </h2>

          <div className="max-w-4xl mx-auto">
            <div className={`rounded-lg overflow-hidden shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <table className="w-full">
                <thead className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <tr>
                    <th className={`px-6 py-4 text-left ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>Feature</th>
                    <th className={`px-6 py-4 text-center ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>Monay</th>
                    <th className={`px-6 py-4 text-center ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>Auth0</th>
                    <th className={`px-6 py-4 text-center ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>Firebase</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <td className={`px-6 py-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Free Tier</td>
                    <td className="px-6 py-4 text-center font-bold text-green-600">2,500 MAU</td>
                    <td className={`px-6 py-4 text-center ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>7,000 MAU</td>
                    <td className={`px-6 py-4 text-center ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>None</td>
                  </tr>
                  <tr className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <td className={`px-6 py-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>10K MAU Cost</td>
                    <td className="px-6 py-4 text-center font-bold text-green-600">$149/mo</td>
                    <td className={`px-6 py-4 text-center ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>$240/mo</td>
                    <td className={`px-6 py-4 text-center ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>$55/mo</td>
                  </tr>
                  <tr className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <td className={`px-6 py-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>50K MAU Cost</td>
                    <td className="px-6 py-4 text-center font-bold text-green-600">$499/mo</td>
                    <td className={`px-6 py-4 text-center ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>$700/mo</td>
                    <td className={`px-6 py-4 text-center ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>$275/mo</td>
                  </tr>
                  <tr className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <td className={`px-6 py-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>100K MAU Cost</td>
                    <td className="px-6 py-4 text-center font-bold text-green-600">$499/mo</td>
                    <td className={`px-6 py-4 text-center ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>$1,400/mo</td>
                    <td className={`px-6 py-4 text-center ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>$500/mo</td>
                  </tr>
                  <tr className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <td className={`px-6 py-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Voice Biometrics</td>
                    <td className={`px-6 py-4 text-center ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>✅</td>
                    <td className={`px-6 py-4 text-center ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>❌</td>
                    <td className={`px-6 py-4 text-center ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>❌</td>
                  </tr>
                  <tr className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <td className={`px-6 py-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Custodian Recovery</td>
                    <td className={`px-6 py-4 text-center ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>✅</td>
                    <td className={`px-6 py-4 text-center ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>❌</td>
                    <td className={`px-6 py-4 text-center ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>❌</td>
                  </tr>
                  <tr className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <td className={`px-6 py-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Setup Time</td>
                    <td className="px-6 py-4 text-center font-bold text-green-600">&lt;1 hour</td>
                    <td className={`px-6 py-4 text-center ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>2-4 hours</td>
                    <td className={`px-6 py-4 text-center ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>1-2 hours</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className={`py-16 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="container mx-auto px-4">
          <h2 className={`text-3xl font-bold text-center mb-12 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            What Our Angel Customers are Saving
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className={`p-6 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
              <p className={`text-lg mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                "Looking forward to saving $500K annually switching from Auth0"
              </p>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                - Enterprise SaaS Company
              </p>
            </div>
            <div className={`p-6 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
              <p className={`text-lg mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                "This approach will save our payment costs by 80%!"
              </p>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                - Fintech Startup
              </p>
            </div>
            <div className={`p-6 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
              <p className={`text-lg mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                "This is already cutting our development time by 8 months"
              </p>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                - Digital Bank
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Save?
          </h2>
          <p className="text-xl mb-8 text-gray-300">
            Join the Pilot Program and get 75% off your first year
          </p>
          <div className="flex justify-center gap-4">
            <a href="/signup" className="bg-white text-gray-900 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Sign Up Now
            </a>
            <button className="bg-transparent border-2 border-white px-8 py-4 rounded-lg font-semibold hover:bg-white/10 transition-colors">
              Schedule Demo
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}