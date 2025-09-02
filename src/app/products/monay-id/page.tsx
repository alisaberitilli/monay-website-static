"use client";

import { useState, useEffect } from "react";
import Navigation from "../../../components/Navigation";

export default function MonayIDPage() {
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
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">
              Monay ID
            </h1>
            <p className="text-2xl mb-8">
              Revolutionary Voice-First Authentication Platform
            </p>
            <p className="text-lg opacity-90 mb-8">
              The industry's first voice biometric authentication system with custodian recovery. 
              Never lose access to your accounts again.
            </p>
            <div className="flex justify-center gap-4">
              <a href="/signup/monay-id" className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
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
            Revolutionary Features
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
              <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <h3 className={`text-xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Voice Biometrics</h3>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                Industry-first voice recognition technology. Authenticate with just your voice - no passwords, no hardware keys.
              </p>
              <ul className={`mt-4 space-y-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-800'}`}>
                <li>• HIPAA-compliant for healthcare</li>
                <li>• Banking-grade security</li>
                <li>• Works in any language</li>
                <li>• Anti-spoofing protection</li>
              </ul>
            </div>

            <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-purple-50'}`}>
              <div className="w-16 h-16 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <h3 className={`text-xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Custodian Recovery</h3>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                Never lose access to your accounts. Designate trusted custodians who can help you recover access.
              </p>
              <ul className={`mt-4 space-y-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-800'}`}>
                <li>• Family custodians</li>
                <li>• Professional custodians (Coming Q2 2025)</li>
                <li>• Institutional custodians</li>
                <li>• Zero-knowledge security</li>
              </ul>
            </div>

            <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-green-50'}`}>
              <div className="w-16 h-16 bg-green-600 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className={`text-xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Multi-Factor Suite</h3>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                Comprehensive authentication methods that adapt to your security needs and user preferences.
              </p>
              <ul className={`mt-4 space-y-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-800'}`}>
                <li>• Biometric authentication</li>
                <li>• Hardware key support</li>
                <li>• TOTP/SMS/Email</li>
                <li>• Passwordless options</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className={`py-16 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="container mx-auto px-4">
          <h2 className={`text-3xl font-bold text-center mb-12 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Industry Solutions
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
              <h3 className={`text-xl font-bold mb-3 text-blue-600`}>Healthcare</h3>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                HIPAA-compliant voice authentication for patient portals, telehealth platforms, and medical records access.
              </p>
            </div>
            
            <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
              <h3 className={`text-xl font-bold mb-3 text-green-600`}>Banking & Finance</h3>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                Secure phone banking, trading platforms, and mobile apps with voice-verified transactions.
              </p>
            </div>
            
            <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
              <h3 className={`text-xl font-bold mb-3 text-purple-600`}>Enterprise</h3>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                Unified SSO across all corporate applications with advanced MFA and compliance reporting.
              </p>
            </div>
            
            <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
              <h3 className={`text-xl font-bold mb-3 text-orange-600`}>E-commerce</h3>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                Passwordless checkout increasing conversion by 35% with one-click voice authentication.
              </p>
            </div>
            
            <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
              <h3 className={`text-xl font-bold mb-3 text-red-600`}>Government</h3>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                Citizen identity verification for digital services, benefits distribution, and secure voting.
              </p>
            </div>
            
            <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
              <h3 className={`text-xl font-bold mb-3 text-indigo-600`}>Education</h3>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                Student authentication with parental custodian controls for minors and exam proctoring.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Technical Specs */}
      <section className={`py-16 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="container mx-auto px-4">
          <h2 className={`text-3xl font-bold text-center mb-12 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Technical Specifications
          </h2>
          
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Integration</h3>
                <ul className={`space-y-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                  <li>✓ Drop-in UI components</li>
                  <li>✓ REST API & GraphQL</li>
                  <li>✓ SDKs for 15+ languages</li>
                  <li>✓ OAuth 2.0 / SAML 2.0</li>
                  <li>✓ OpenID Connect</li>
                  <li>✓ &lt;1 hour deployment</li>
                </ul>
              </div>
              
              <div>
                <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Security & Compliance</h3>
                <ul className={`space-y-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                  <li>✓ SOC2 Type II certified</li>
                  <li>✓ GDPR compliant</li>
                  <li>✓ HIPAA ready</li>
                  <li>✓ Zero Trust architecture</li>
                  <li>✓ E2E encryption</li>
                  <li>✓ 99.99% uptime SLA</li>
                </ul>
              </div>
            </div>
            
            <div className={`mt-12 p-6 ${isDarkMode ? 'bg-gray-700' : 'bg-blue-50'} rounded-lg`}>
              <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Performance Metrics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className={`text-2xl font-bold text-blue-600`}>&lt;50ms</div>
                  <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-800'}`}>Auth Response</div>
                </div>
                <div>
                  <div className={`text-2xl font-bold text-green-600`}>99.99%</div>
                  <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-800'}`}>Uptime SLA</div>
                </div>
                <div>
                  <div className={`text-2xl font-bold text-purple-600`}>10M+</div>
                  <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-800'}`}>Users Supported</div>
                </div>
                <div>
                  <div className={`text-2xl font-bold text-orange-600`}>150+</div>
                  <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-800'}`}>Countries</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className={`py-16 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="container mx-auto px-4">
          <h2 className={`text-3xl font-bold text-center mb-12 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Simple, Transparent Pricing
          </h2>
          
          <div className="max-w-4xl mx-auto text-center">
            <p className={`text-xl mb-8 ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
              Start free with 2,500 MAU. Scale as you grow.
            </p>
            
            <div className="grid md:grid-cols-4 gap-4">
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
                <div className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Starter</div>
                <div className="text-2xl font-bold text-green-600">Free</div>
                <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-800'}`}>2,500 MAU</div>
              </div>
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
                <div className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Growth</div>
                <div className="text-2xl font-bold text-blue-600">$149/mo</div>
                <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-800'}`}>25,000 MAU</div>
              </div>
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
                <div className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Scale</div>
                <div className="text-2xl font-bold text-purple-600">$499/mo</div>
                <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-800'}`}>100,000 MAU</div>
              </div>
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
                <div className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Enterprise</div>
                <div className="text-2xl font-bold text-orange-600">Custom</div>
                <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-800'}`}>Unlimited</div>
              </div>
            </div>
            
            <div className="mt-8">
              <a href="/pricing" className="text-blue-600 hover:text-blue-700 font-semibold">
                View Full Pricing & Compare with Competitors →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Revolutionize Your Authentication?
          </h2>
          <p className="text-xl mb-8">
            Join the Pilot Program and get 75% off your first year
          </p>
          <div className="flex justify-center gap-4">
            <a href="/signup/monay-id" className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Sign Up Now
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