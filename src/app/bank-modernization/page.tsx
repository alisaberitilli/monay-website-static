"use client";

import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Link from "next/link";
import Script from "next/script";

export default function BankModernizationPage() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'capabilities' | 'comparison' | 'integration' | 'pricing' | 'contact'>('overview');

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode !== null) {
      setIsDarkMode(JSON.parse(savedDarkMode));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const modernizationBenefits = [
    { metric: '90%', label: 'Cost Reduction', sublabel: 'vs. legacy systems' },
    { metric: '2 weeks', label: 'Integration Time', sublabel: 'not 18 months' },
    { metric: '932K', label: 'Global FIs', sublabel: 'need modernization' },
    { metric: '$250B', label: 'Market Opportunity', sublabel: 'by 2028' },
  ];

  const capabilities = [
    {
      title: "White-Label Stablecoin Issuance",
      description: "Launch your bank-branded stablecoin with full regulatory compliance",
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      ),
      color: "from-blue-600 to-indigo-600"
    },
    {
      title: "Digital Wallet Infrastructure",
      description: "Modern wallet solution with cards, ATM access, and mobile payments",
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
      color: "from-purple-600 to-pink-600"
    },
    {
      title: "Compliance Orchestration",
      description: "Built-in KYC/AML with automated reporting and monitoring",
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      color: "from-green-600 to-emerald-600"
    },
    {
      title: "Treasury Management",
      description: "Real-time liquidity management and cross-rail operations",
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      color: "from-orange-600 to-red-600"
    }
  ];

  return (
    <>
      <Script
        id="bank-modernization-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FinancialService",
            "name": "Monay Bank Modernization Platform",
            "description": "Transform your bank with GENIUS Act compliant stablecoin infrastructure. White-label digital wallets, instant payments, and 90% cost reduction.",
            "url": "https://www.monay.com/bank-modernization",
            "provider": {
              "@type": "Organization",
              "name": "Monay"
            },
            "areaServed": "Global",
            "serviceType": "Bank Digital Transformation",
            "offers": {
              "@type": "Offer",
              "description": "Complete banking modernization platform",
              "price": "Contact for pricing"
            }
          })
        }}
      />
      
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <Navigation isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
        
        {/* Hero Section - Matching investors page style */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 animate-gradient-xy"></div>
            <div className="absolute inset-0 bg-black/20"></div>
          </div>
          
          <div className="relative container mx-auto px-4 py-20 md:py-32">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-lg rounded-full mb-6 border border-white/20">
                  <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-white font-medium">932K Banks Need Modernization</span>
                </div>
                
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
                  Bank Modernization
                  <span className="block bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                    Made Simple & Compliant
                  </span>
                </h1>
                
                <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
                  Transform your legacy infrastructure with GENIUS Act compliant stablecoin platform. 
                  Launch in weeks, not years. 90% cost reduction guaranteed.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                  <a 
                    href="/contact?dept=Banks&subject=Bank%20Modernization%20Inquiry" 
                    className="inline-flex items-center justify-center px-8 py-4 font-semibold text-blue-900 bg-white rounded-xl hover:bg-gray-100 transform hover:-translate-y-0.5 hover:shadow-xl transition-all duration-200"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Schedule Demo
                  </a>
                  <Link 
                    href="/signup/monay-caas" 
                    className="inline-flex items-center justify-center px-8 py-4 font-semibold text-white bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl hover:bg-white/20 transform hover:-translate-y-0.5 hover:shadow-xl transition-all duration-200"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Start Pilot Program
                  </Link>
                </div>
                
                {/* Key Metrics - Same style as investors page */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
                  {modernizationBenefits.map((item, index) => (
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

        {/* Navigation Tabs - Same as investors page */}
        <section className={`sticky top-0 z-40 ${isDarkMode ? 'bg-gray-900/95' : 'bg-white/95'} backdrop-blur-lg border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
          <div className="container mx-auto px-4">
            <div className="flex overflow-x-auto scrollbar-hide">
              {([
                { id: 'overview', label: 'Overview' },
                { id: 'capabilities', label: 'Capabilities' },
                { id: 'comparison', label: 'Comparison' },
                { id: 'integration', label: 'Integration' },
                { id: 'pricing', label: 'Pricing' },
                { id: 'contact', label: 'Contact' }
              ] as const).map((tab) => (
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
              {/* Problem Statement */}
              <div className={`relative overflow-hidden rounded-2xl ${isDarkMode ? 'bg-gradient-to-br from-gray-800 to-gray-900' : 'bg-gradient-to-br from-white to-gray-50'} shadow-2xl`}>
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl"></div>
                <div className="relative p-8 md:p-12">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-600/10 rounded-full mb-6">
                    <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                    <span className="text-sm font-medium text-red-600">The Problem</span>
                  </div>
                  
                  <h2 className={`text-3xl md:text-4xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Legacy Systems Are Killing Your Bank
                  </h2>
                  
                  <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-red-50'}`}>
                      <div className="text-2xl font-bold text-red-600 mb-2">$500K+</div>
                      <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Annual maintenance costs</div>
                    </div>
                    <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-red-50'}`}>
                      <div className="text-2xl font-bold text-red-600 mb-2">18 months</div>
                      <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Average integration time</div>
                    </div>
                    <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-red-50'}`}>
                      <div className="text-2xl font-bold text-red-600 mb-2">60%</div>
                      <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Customer churn to neobanks</div>
                    </div>
                  </div>
                  
                  <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    While you're maintaining COBOL systems, fintech startups are stealing your customers with modern, 
                    mobile-first experiences. The GENIUS Act now enables you to compete—but only if you act fast.
                  </p>
                </div>
              </div>

              {/* Solution */}
              <div className={`relative overflow-hidden rounded-2xl ${isDarkMode ? 'bg-gradient-to-br from-blue-900/50 to-indigo-900/50' : 'bg-gradient-to-br from-blue-50 to-indigo-50'} shadow-xl`}>
                <div className="p-8 md:p-12">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-600/10 rounded-full mb-6">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    <span className="text-sm font-medium text-green-600">The Solution</span>
                  </div>
                  
                  <h2 className={`text-3xl md:text-4xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Transform Your Bank in Weeks, Not Years
                  </h2>
                  
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xl font-bold mb-4">What You Get</h3>
                      <ul className="space-y-3">
                        <li className="flex items-start">
                          <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>White-label stablecoin with your brand</span>
                        </li>
                        <li className="flex items-start">
                          <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Modern mobile & web wallet apps</span>
                        </li>
                        <li className="flex items-start">
                          <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Virtual & physical cards with Apple/Google Pay</span>
                        </li>
                        <li className="flex items-start">
                          <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>55,000+ ATM network access</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-bold mb-4">How Fast</h3>
                      <ul className="space-y-3">
                        <li className="flex items-start">
                          <svg className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Week 1: Technical integration</span>
                        </li>
                        <li className="flex items-start">
                          <svg className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Week 2: Compliance setup</span>
                        </li>
                        <li className="flex items-start">
                          <svg className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Week 3: Testing & training</span>
                        </li>
                        <li className="flex items-start">
                          <svg className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Week 4: Go live!</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Capabilities Tab */}
          {selectedTab === 'capabilities' && (
            <div className="max-w-6xl mx-auto space-y-12">
              <h2 className="text-3xl font-bold text-center mb-8">
                Complete Banking Infrastructure
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                {capabilities.map((capability, index) => (
                  <div key={index} className={`group relative overflow-hidden rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1`}>
                    <div className={`absolute inset-0 bg-gradient-to-br ${capability.color} opacity-5 group-hover:opacity-10 transition-opacity`}></div>
                    <div className="relative p-6">
                      <div className="flex items-start">
                        <div className={`w-12 h-12 bg-gradient-to-r ${capability.color} rounded-lg flex items-center justify-center mr-4 flex-shrink-0`}>
                          {capability.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {capability.title}
                          </h3>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {capability.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Feature Matrix */}
              <div className={`p-8 rounded-2xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-xl`}>
                <h3 className="text-2xl font-bold mb-6">Feature Comparison</h3>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                        <th className="text-left py-3 px-4">Feature</th>
                        <th className="text-center py-3 px-4">Monay</th>
                        <th className="text-center py-3 px-4">Traditional Core</th>
                        <th className="text-center py-3 px-4">Neobank Platform</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ['Launch Time', '2 weeks', '18 months', '6 months'],
                        ['Cost', '$2,499/mo', '$500K+/year', '$50K/mo'],
                        ['Stablecoin Support', '✅', '❌', 'Limited'],
                        ['GENIUS Act Compliant', '✅', '❌', '❌'],
                        ['White-Label', '✅', '❌', 'Limited'],
                        ['Card Issuance', '✅', 'Via Partners', 'Via Partners'],
                        ['ATM Network', '55,000+', 'Varies', 'Limited'],
                        ['Cross-border', '<$1', '$25+', '$5+'],
                      ].map((row, index) => (
                        <tr key={index} className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                          <td className="py-3 px-4 font-medium">{row[0]}</td>
                          <td className="text-center py-3 px-4">
                            <span className={row[1].includes('✅') ? 'text-green-500' : row[1].includes('❌') ? 'text-red-500' : ''}>
                              {row[1]}
                            </span>
                          </td>
                          <td className="text-center py-3 px-4">
                            <span className={row[2].includes('❌') ? 'text-red-500' : ''}>
                              {row[2]}
                            </span>
                          </td>
                          <td className="text-center py-3 px-4">
                            <span className={row[3].includes('❌') ? 'text-red-500' : ''}>
                              {row[3]}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Integration Tab */}
          {selectedTab === 'integration' && (
            <div className="max-w-6xl mx-auto space-y-12">
              <h2 className="text-3xl font-bold text-center mb-8">
                Seamless Integration Process
              </h2>
              
              {/* Timeline */}
              <div className={`p-8 rounded-2xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-xl`}>
                <h3 className="text-2xl font-bold mb-6">4-Week Implementation Timeline</h3>
                
                <div className="space-y-6">
                  {[
                    { week: 'Week 1', title: 'Technical Integration', tasks: ['API setup', 'Database migration', 'Security configuration', 'Testing environment'] },
                    { week: 'Week 2', title: 'Compliance & KYC', tasks: ['KYC provider setup', 'AML configuration', 'Regulatory filing', 'Policy implementation'] },
                    { week: 'Week 3', title: 'Product Configuration', tasks: ['Wallet branding', 'Card design', 'Fee structure', 'Limits & controls'] },
                    { week: 'Week 4', title: 'Launch Preparation', tasks: ['Staff training', 'Customer migration', 'Marketing setup', 'Go live!'] },
                  ].map((phase, index) => (
                    <div key={index} className="flex items-start">
                      <div className="flex-shrink-0 w-24">
                        <div className="text-sm font-bold text-blue-600">{phase.week}</div>
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{phase.title}</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {phase.tasks.map((task, idx) => (
                            <div key={idx} className={`text-sm px-3 py-1 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                              {task}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Integration Partners */}
              <div className={`p-8 rounded-2xl ${isDarkMode ? 'bg-gradient-to-br from-blue-900/50 to-purple-900/50' : 'bg-gradient-to-br from-blue-50 to-purple-50'} border ${isDarkMode ? 'border-blue-700' : 'border-blue-200'}`}>
                <h3 className="text-2xl font-bold mb-6">Pre-Integrated Partners</h3>
                
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-bold mb-3">Core Banking</h4>
                    <ul className="space-y-2 text-sm">
                      <li>• Temenos</li>
                      <li>• FIS</li>
                      <li>• Jack Henry</li>
                      <li>• Finastra</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold mb-3">Compliance</h4>
                    <ul className="space-y-2 text-sm">
                      <li>• Persona (KYC)</li>
                      <li>• Alloy (AML)</li>
                      <li>• ComplyAdvantage</li>
                      <li>• Onfido</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold mb-3">Payments</h4>
                    <ul className="space-y-2 text-sm">
                      <li>• Visa/Mastercard</li>
                      <li>• ACH/Wire</li>
                      <li>• AllPoint ATMs</li>
                      <li>• Apple/Google Pay</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Pricing Tab */}
          {selectedTab === 'pricing' && (
            <div className="max-w-6xl mx-auto space-y-12">
              <h2 className="text-3xl font-bold text-center mb-8">
                Transparent, Scalable Pricing
              </h2>
              
              <div className="grid md:grid-cols-3 gap-8">
                {/* Pilot */}
                <div className={`relative p-6 rounded-xl ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'} shadow-lg`}>
                  <div className="text-sm font-bold text-blue-600 mb-2">PILOT</div>
                  <div className="text-3xl font-bold mb-2">$0</div>
                  <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-6`}>3-month pilot</div>
                  
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm">Up to 1,000 accounts</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm">Full platform access</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm">White-label branding</span>
                    </li>
                  </ul>
                  
                  <button className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Start Pilot
                  </button>
                </div>
                
                {/* Growth */}
                <div className={`relative p-6 rounded-xl ${isDarkMode ? 'bg-gradient-to-br from-blue-900/50 to-purple-900/50 border border-blue-700' : 'bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-500'} shadow-xl`}>
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full">
                    POPULAR
                  </div>
                  <div className="text-sm font-bold text-blue-600 mb-2">GROWTH</div>
                  <div className="text-3xl font-bold mb-2">$9,999</div>
                  <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-6`}>per month</div>
                  
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm">Up to 50,000 accounts</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm">Priority support</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm">Custom features</span>
                    </li>
                  </ul>
                  
                  <button className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all">
                    Get Started
                  </button>
                </div>
                
                {/* Enterprise */}
                <div className={`relative p-6 rounded-xl ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'} shadow-lg`}>
                  <div className="text-sm font-bold text-purple-600 mb-2">ENTERPRISE</div>
                  <div className="text-3xl font-bold mb-2">Custom</div>
                  <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-6`}>Volume pricing</div>
                  
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm">Unlimited accounts</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm">Dedicated support</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm">SLA guarantees</span>
                    </li>
                  </ul>
                  
                  <button className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                    Contact Sales
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Contact Tab */}
          {selectedTab === 'contact' && (
            <div className="max-w-4xl mx-auto" id="contact">
              <div className={`p-8 rounded-2xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-xl`}>
                <h2 className="text-3xl font-bold mb-8">Ready to Modernize?</h2>
                
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-bold mb-4">For Banks</h3>
                    <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Join the 932K banks worldwide that need modernization. Be among the first to offer GENIUS Act compliant stablecoins.
                      </p>
                      <a href="/contact?dept=Banks" className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Contact Banking Team
                      </a>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-bold mb-4">Schedule Demo</h3>
                    <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        See how you can launch your modern banking platform in just 4 weeks.
                      </p>
                      <a href="https://calendly.com/monay-banks" className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Book 30-min Demo
                      </a>
                    </div>
                  </div>
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
                <p className="text-xs mt-1">Banking modernization platform provider.</p>
              </div>
              <div className="flex gap-6">
                <Link href="/privacy" className={`text-sm ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
                  Privacy Policy
                </Link>
                <Link href="/terms" className={`text-sm ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
                  Terms of Service
                </Link>
                <Link href="/security" className={`text-sm ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
                  Security
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}