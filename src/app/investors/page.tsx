"use client";

import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import BuildStatus from "@/components/BuildStatus";
import FeatureAvailability from "@/components/FeatureAvailability";
import Script from "next/script";
import Link from "next/link";
import { openCalendly } from "@/lib/client-services";

export default function InvestorsPage() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedTab, setSelectedTab] = useState('overview');

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode !== null) {
      setIsDarkMode(JSON.parse(savedDarkMode));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const traction = [
    { metric: '3', label: 'Pipeline Pilot Programs', sublabel: 'Government & Enterprise' },
    { metric: '$5M+', label: 'Pipeline Value', sublabel: 'Q1 2026' },
    { metric: '932K', label: 'Target Institutions', sublabel: 'Global Banks & FIs' },
    { metric: '$250B', label: 'TAM', sublabel: 'By 2028' },
  ];

  const differentiators = [
    'Dual-rail architecture (Base L2 + Solana)',
    'Unified WaaS + CaaS platform',
    'Program-grade Business Rules Framework',
    'Everyday acceptance focus (cards & cash)',
    'Invoice First™ transaction model',
    'Compliance orchestration built-in',
    'Hybrid ledger + on-chain anchoring',
    'Treasury automation',
    'Multi-stakeholder wallets',
    'Built-in engagement (Nudge)',
    'Enterprise hooks (SSO/SAML, RBAC)',
    'Accessibility-first design'
  ];

  return (
    <>
      <Script
        id="investor-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "InvestmentFund",
            "name": "Monay Pre-Series A Round",
            "description": "Monay is raising $6.5M Pre-Series A to build the first unified platform for enterprise stablecoin issuance and compliance orchestration",
            "url": "https://www.monay.com/investors",
            "seeks": {
              "@type": "Investment",
              "amount": "$6,500,000",
              "investmentType": "Pre-Series A",
              "currency": "USD"
            },
            "industry": "Financial Technology",
            "keywords": "stablecoin, GENIUS Act, blockchain, fintech, enterprise payments",
            "foundingDate": "2020",
            "addressableMarket": "$250B by 2028",
            "targetMarket": "932K global financial institutions",
            "competitiveAdvantage": "First GENIUS Act compliant dual-rail blockchain platform"
          })
        }}
      />
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <Navigation isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 animate-gradient-xy"></div>
          <div className="absolute inset-0 bg-black/20"></div>
        </div>
        
        {/* Content */}
        <div className="relative container mx-auto px-4 py-20 md:py-32">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-lg rounded-full mb-6 border border-white/20">
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-white font-medium">$6.5M Series A - Q1 2026</span>
              </div>
              
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
                Building the Future of
                <span className="block bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  Programmable Money
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
                First unified platform for enterprise stablecoin issuance, consumer payments, 
                and compliance orchestration—enabled by the GENIUS Act (July 2025)
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <button onClick={() => openCalendly()} className="inline-flex items-center justify-center px-8 py-4 font-semibold text-blue-900 bg-white rounded-xl hover:bg-gray-100 transform hover:-translate-y-0.5 hover:shadow-xl transition-all duration-200">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Schedule Meeting
                </button>
                <Link href="/pitch-deck.pdf" className="inline-flex items-center justify-center px-8 py-4 font-semibold text-white bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl hover:bg-white/20 transform hover:-translate-y-0.5 hover:shadow-xl transition-all duration-200">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download Deck
                </Link>
              </div>
              
              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
                {traction.map((item, index) => (
                  <div key={index} className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
                    <div className="text-2xl md:text-3xl font-bold text-white">{item.metric}</div>
                    <div className="text-sm text-white/80 font-medium">{item.label}</div>
                    <div className="text-xs text-white/60">{item.sublabel}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Status Bar */}
      <section className={`relative ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  MVP Status: Active Development
                </span>
              </div>
            </div>
            <BuildStatus isDarkMode={isDarkMode} compact={true} />
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <section className={`sticky top-0 z-40 ${isDarkMode ? 'bg-gray-900/95' : 'bg-white/95'} backdrop-blur-lg border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto scrollbar-hide">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'product', label: 'Product' },
              { id: 'market', label: 'Market' },
              { id: 'traction', label: 'Traction' },
              { id: 'team', label: 'Team' },
              { id: 'contact', label: 'Contact' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 whitespace-nowrap transition-all duration-200 ${
                  selectedTab === tab.id
                    ? `border-b-3 border-blue-600 ${isDarkMode ? 'text-white bg-blue-600/10' : 'text-blue-600 bg-blue-50'} font-semibold`
                    : `${isDarkMode ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`
                }`}
              >
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Content Sections */}
      <div className="container mx-auto px-4 py-12">
        {/* Overview Tab */}
        {selectedTab === 'overview' && (
          <div className="max-w-6xl mx-auto space-y-12">
            {/* Vision Statement */}
            <div className={`relative overflow-hidden rounded-2xl ${isDarkMode ? 'bg-gradient-to-br from-gray-800 to-gray-900' : 'bg-gradient-to-br from-white to-gray-50'} shadow-2xl`}>
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl"></div>
              <div className="relative p-8 md:p-12">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-600/10 rounded-full mb-6">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span className="text-sm font-medium text-blue-600">Our Vision</span>
                </div>
                
                <h2 className={`text-3xl md:text-4xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Building the Operating System for
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                    Programmable Money
                  </span>
                </h2>
                
                <p className={`text-lg md:text-xl leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  We're creating a unified platform where institutions can <span className="font-semibold text-blue-600">issue branded stablecoins</span> and 
                  <span className="font-semibold text-purple-600"> deploy controlled wallets</span> that work seamlessly in everyday contexts—from tap-to-pay 
                  and e-commerce to cash access—with enterprise-grade <span className="font-semibold text-green-600">compliance and policy controls</span> built into every transaction.
                </p>
                
                <div className={`mt-8 p-4 rounded-xl ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-100'} border ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} italic`}>
                    <strong>Note:</strong> Monay is not a bank or licensed money transmitter. Features described include items in active development.
                  </p>
                </div>
              </div>
            </div>

            {/* Problem & Solution */}
            <div>
              <h2 className={`text-2xl font-bold mb-8 text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                The Problem We're Solving
              </h2>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className={`group relative overflow-hidden rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1`}>
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative p-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center mb-4">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Fragmented Infrastructure
                    </h3>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Organizations juggle 5-7 vendors for payments, compliance, identity, and treasury—creating complexity and risk.
                    </p>
                  </div>
                </div>
                
                <div className={`group relative overflow-hidden rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1`}>
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative p-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-amber-500 rounded-lg flex items-center justify-center mb-4">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <h3 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Excessive Costs
                    </h3>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Legacy providers charge enterprise premiums with $500K+ setup fees and 12-18 month implementations.
                    </p>
                  </div>
                </div>
                
                <div className={`group relative overflow-hidden rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1`}>
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative p-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center mb-4">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Poor User Experience
                    </h3>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Users must learn crypto concepts and manage keys, while missing basic features like cards and cash access.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Solution Overview */}
            <div>
              <h2 className={`text-2xl font-bold mb-8 text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                The Monay Solution
              </h2>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    title: 'Unified Platform',
                    value: '1',
                    unit: 'API',
                    description: 'Everything in one place',
                    color: 'from-blue-500 to-cyan-500'
                  },
                  {
                    title: 'Fast Setup',
                    value: '<2',
                    unit: 'weeks',
                    description: 'Go live in days',
                    color: 'from-purple-500 to-pink-500'
                  },
                  {
                    title: 'Cost Reduction',
                    value: '90%',
                    unit: 'savings',
                    description: 'vs. traditional providers',
                    color: 'from-green-500 to-emerald-500'
                  },
                  {
                    title: 'Compliance',
                    value: '100%',
                    unit: 'built-in',
                    description: 'KYC/AML included',
                    color: 'from-orange-500 to-red-500'
                  }
                ].map((item, index) => (
                  <div key={index} className={`relative group ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden`}>
                    <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-5 group-hover:opacity-10 transition-opacity`}></div>
                    <div className="relative p-6">
                      <div className={`text-3xl font-bold bg-gradient-to-r ${item.color} bg-clip-text text-transparent mb-1`}>
                        {item.value}
                      </div>
                      <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                        {item.unit}
                      </div>
                      <h3 className={`font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {item.title}
                      </h3>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Product Tab */}
        {selectedTab === 'product' && (
          <div className="max-w-6xl mx-auto space-y-12">
            <BuildStatus isDarkMode={isDarkMode} />
            
            <FeatureAvailability isDarkMode={isDarkMode} />
            
            {/* Platform Architecture */}
            <div className={`p-8 rounded-2xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-xl`}>
              <h2 className="text-3xl font-bold mb-6">Platform Architecture</h2>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gradient-to-br from-blue-900/50 to-indigo-900/50' : 'bg-gradient-to-br from-blue-50 to-indigo-50'} border ${isDarkMode ? 'border-blue-700' : 'border-blue-200'}`}>
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold mb-2">WaaS Layer</h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Consumer wallets with cards, ATM access, and real-world spend controls
                  </p>
                </div>
                
                <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gradient-to-br from-purple-900/50 to-pink-900/50' : 'bg-gradient-to-br from-purple-50 to-pink-50'} border ${isDarkMode ? 'border-purple-700' : 'border-purple-200'}`}>
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold mb-2">CaaS Layer</h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Branded stablecoin issuance with treasury management
                  </p>
                </div>
                
                <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gradient-to-br from-green-900/50 to-emerald-900/50' : 'bg-gradient-to-br from-green-50 to-emerald-50'} border ${isDarkMode ? 'border-green-700' : 'border-green-200'}`}>
                  <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold mb-2">Identity Layer</h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Passkeys, biometrics, and custodian recovery
                  </p>
                </div>
              </div>
              
              <div className={`mt-6 p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  <strong>Key Differentiators:</strong> {differentiators.slice(0, 5).join(' • ')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Market Tab */}
        {selectedTab === 'market' && (
          <div className="max-w-6xl mx-auto space-y-12">
            <div className={`p-8 rounded-2xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-xl`}>
              <h2 className="text-3xl font-bold mb-6">Market Opportunity</h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-bold mb-4">Total Addressable Market</h3>
                  <div className="space-y-4">
                    <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <div className="flex justify-between items-center">
                        <span>Global Digital Payments</span>
                        <span className="font-bold text-2xl">$9T+</span>
                      </div>
                    </div>
                    <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <div className="flex justify-between items-center">
                        <span>Stablecoin TAM (2028)</span>
                        <span className="font-bold text-2xl">$250B</span>
                      </div>
                    </div>
                    <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <div className="flex justify-between items-center">
                        <span>Public Sector SAM</span>
                        <span className="font-bold text-2xl">$500B</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-bold mb-4">Growth Drivers</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>GENIUS Act passage (July 2025) enabling stablecoin payments</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>932K global financial institutions seeking modernization</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Government RFPs for programmable disbursements</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>API-first infrastructure demand from FinTechs</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Traction Tab */}
        {selectedTab === 'traction' && (
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { metric: '3', label: 'Active RFPs', detail: 'Gov, Education, B2B' },
                { metric: '932K', label: 'Target FIs', detail: 'Global Banks & Credit Unions' },
                { metric: '$5M+', label: 'Pipeline', detail: 'Q1 2026' },
                { metric: '$6.5M', label: 'Series A', detail: '18-month runway' }
              ].map((item, index) => (
                <div key={index} className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg text-center`}>
                  <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                    {item.metric}
                  </div>
                  <div className={`text-lg font-medium mt-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {item.label}
                  </div>
                  <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {item.detail}
                  </div>
                </div>
              ))}
            </div>
            
            <div className={`p-8 rounded-2xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-xl`}>
              <h2 className="text-3xl font-bold mb-6">Key Milestones</h2>
              
              <div className="space-y-4">
                {[
                  { date: 'Q4 2020', milestone: 'Consumer Wallet launch halted - pivoted to enterprise focus' },
                  { date: 'Q4 2025', milestone: 'Complete MVP ready for pilot programs' },
                  { date: 'Q1 2026', milestone: 'Achieve regulatory compliance & certifications' },
                  { date: 'Q3 2026', milestone: 'Scale to 50K users across enterprise clients' },
                  { date: 'Q1 2027', milestone: 'Launch CaaS platform for institutional clients' },
                  { date: 'Q3 2027', milestone: 'Expand to international markets (EU/APAC)' }
                ].map((item, index) => (
                  <div key={index} className={`flex items-center gap-4 p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <div className="w-24 text-sm font-bold text-blue-600">{item.date}</div>
                    <div className={`flex-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{item.milestone}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Team Tab */}
        {selectedTab === 'team' && (
          <div className="max-w-6xl mx-auto space-y-12">
            <div className={`p-8 rounded-2xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-xl`}>
              <h2 className="text-3xl font-bold mb-6">Leadership Team</h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                {[
                  {
                    name: 'Ali Saberi',
                    role: 'Founder CEO/CTO',
                    background: '30 years of enterprise and public sector, 15+ years in fintech',
                    linkedin: '#'
                  },
                  {
                    name: 'Shabbir Gilani',
                    role: 'CRO',
                    background: 'Seasoned GTM Strategist, 25+ years, Ex-Citi, ACI Worldwide',
                    linkedin: '#'
                  }
                ].map((member, index) => (
                  <div key={index} className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                    <p className="text-blue-600 font-medium mb-2">{member.role}</p>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{member.background}</p>
                  </div>
                ))}
              </div>
              
              <div className={`mt-8 p-4 rounded-lg ${isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50'} border ${isDarkMode ? 'border-blue-800' : 'border-blue-200'}`}>
                <p className={`text-sm ${isDarkMode ? 'text-blue-200' : 'text-blue-800'}`}>
                  <strong>Advisory Board:</strong> Seeking advisory board members from Federal Reserve, Fiserv, PayPal, Circle, Ring Labs, & Anchorage
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Contact Tab */}
        {selectedTab === 'contact' && (
          <div className="max-w-4xl mx-auto" id="contact">
            <div className={`p-8 rounded-2xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-xl`}>
              <h2 className="text-3xl font-bold mb-8">Get in Touch</h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-bold mb-4">For Investors</h3>
                  <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      We're raising our Series A to accelerate product development and market expansion.
                    </p>
                    <a href="mailto:investors@monay.com" className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      investors@monay.com
                    </a>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-bold mb-4">Schedule a Meeting</h3>
                  <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Book a 30-minute call with our founding team.
                    </p>
                    <button onClick={() => openCalendly()} className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Schedule Call
                    </button>
                  </div>
                </div>
              </div>
              
              <div className={`mt-8 p-6 rounded-xl ${isDarkMode ? 'bg-gradient-to-r from-blue-900/50 to-purple-900/50' : 'bg-gradient-to-r from-blue-50 to-purple-50'} border ${isDarkMode ? 'border-blue-700' : 'border-blue-200'}`}>
                <h3 className="text-xl font-bold mb-2">Partnership Opportunities</h3>
                <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Interested in partnering with Monay? We're actively seeking strategic partners in banking, compliance, and enterprise distribution.
                </p>
                <a href="mailto:partnerships@monay.com" className="text-blue-600 hover:text-blue-700 font-medium">
                  partnerships@monay.com
                </a>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className={`py-12 border-t ${isDarkMode ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-gray-50'}`}>
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className={`mb-4 md:mb-0 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <p className="text-sm">© 2025 Monay Inc. All rights reserved.</p>
              <p className="text-xs mt-1">This page contains forward-looking statements subject to risks and uncertainties.</p>
            </div>
            <div className="flex gap-6">
              <a href="/privacy" className={`text-sm ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
                Privacy Policy
              </a>
              <a href="/terms" className={`text-sm ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>
      </div>
    </>
  );
}