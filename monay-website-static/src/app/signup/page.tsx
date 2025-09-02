"use client";

import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Link from "next/link";

export default function SignupPage() {
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
          <h1 className="text-5xl font-bold text-center mb-4">
            Choose Your Product
          </h1>
          <p className="text-xl text-center opacity-90 max-w-3xl mx-auto">
            Select the Monay solution that best fits your needs. Start free, scale as you grow.
          </p>
        </div>
      </section>

      {/* Product Selection */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            
            {/* Monay ID Card */}
            <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl shadow-xl border overflow-hidden transform transition-all duration-200 hover:-translate-y-2 hover:shadow-2xl`}>
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
                <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Monay ID</h2>
                <p className="text-white/90 text-sm">Voice-Powered Authentication</p>
              </div>
              
              <div className="p-6">
                <div className="mb-6">
                  <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-800'} mb-4`}>
                    Revolutionary authentication with voice biometrics and custodian recovery. Perfect for consumer apps and enterprise SSO.
                  </p>
                  
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>Patent-pending voice security</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>Zero-knowledge custodian recovery</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>Deploy in under 1 hour</span>
                    </li>
                  </ul>
                  
                  <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4 mb-6`}>
                    <div className="text-center">
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Starting at</p>
                      <p className="text-3xl font-bold text-blue-600">FREE</p>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>up to 1,000 MAU</p>
                    </div>
                  </div>
                </div>
                
                <Link href="/signup/monay-id" className="block w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold text-center hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105">
                  Get Started with Monay ID
                </Link>
              </div>
            </div>

            {/* Monay CaaS Card */}
            <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl shadow-xl border overflow-hidden transform transition-all duration-200 hover:-translate-y-2 hover:shadow-2xl`}>
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6">
                <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Monay CaaS</h2>
                <p className="text-white/90 text-sm">Coin-as-a-Service Platform</p>
              </div>
              
              <div className="p-6">
                <div className="mb-6">
                  <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-800'} mb-4`}>
                    Launch your branded stablecoin with dual-rail blockchain architecture. Enterprise-grade compliance and treasury management.
                  </p>
                  
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>Base L2 + Solana dual-rail</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>ERC-3643 compliant tokens</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>Launch in days, not months</span>
                    </li>
                  </ul>
                  
                  <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4 mb-6`}>
                    <div className="text-center">
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Pilot Program</p>
                      <p className="text-3xl font-bold text-purple-600">$2,499</p>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>per month (75% off)</p>
                    </div>
                  </div>
                </div>
                
                <Link href="/signup/monay-caas" className="block w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold text-center hover:from-purple-700 hover:to-pink-700 transition-all duration-200 transform hover:scale-105">
                  Launch Your Stablecoin
                </Link>
              </div>
            </div>

            {/* Monay WaaS Card */}
            <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl shadow-xl border overflow-hidden transform transition-all duration-200 hover:-translate-y-2 hover:shadow-2xl`}>
              <div className="bg-gradient-to-r from-green-600 to-teal-600 p-6">
                <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Monay WaaS</h2>
                <p className="text-white/90 text-sm">Wallet-as-a-Service Platform</p>
              </div>
              
              <div className="p-6">
                <div className="mb-6">
                  <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-800'} mb-4`}>
                    Complete wallet infrastructure with cards, ATM access, and cross-border payments. Everything you need to build fintech.
                  </p>
                  
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>Virtual & physical cards</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>55,000+ AllPoint ATMs</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>Cross-border payments {'<'}$1</span>
                    </li>
                  </ul>
                  
                  <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4 mb-6`}>
                    <div className="text-center">
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Starting at</p>
                      <p className="text-3xl font-bold text-green-600">FREE</p>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>up to 100 wallets</p>
                    </div>
                  </div>
                </div>
                
                <Link href="/signup/monay-waas" className="block w-full bg-gradient-to-r from-green-600 to-teal-600 text-white py-3 rounded-lg font-semibold text-center hover:from-green-700 hover:to-teal-700 transition-all duration-200 transform hover:scale-105">
                  Build Your Wallet
                </Link>
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <div className={`mt-16 text-center ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl p-8 max-w-2xl mx-auto`}>
            <h3 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Not Sure Which Product is Right for You?
            </h3>
            <p className={`mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-800'}`}>
              Our team can help you choose the perfect solution for your needs and guide you through the implementation.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/#contact" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200">
                Contact Sales
              </Link>
              <Link href="/pricing" className={`${isDarkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'} px-6 py-3 rounded-lg font-semibold transition-all duration-200`}>
                View Pricing
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}