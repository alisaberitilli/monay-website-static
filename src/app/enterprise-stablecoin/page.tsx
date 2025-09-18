"use client";

import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Link from "next/link";
import Script from "next/script";

export default function EnterpriseStablecoinPage() {
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

  const features = [
    {
      title: "Regulatory Compliant",
      description: "ERC-3643 compliant tokens with built-in KYC/AML controls",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-12 h-12">
          <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      color: "from-green-100 to-green-200"
    },
    {
      title: "Dual-Rail Architecture",
      description: "Base L2 for enterprise, Solana for consumer transactions",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-12 h-12">
          <path d="M8 7V3M16 7V3M3 11H21M5 7H19C20.1046 7 21 7.89543 21 9V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V9C3 7.89543 3.89543 7 5 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      color: "from-sky-100 to-blue-200"
    },
    {
      title: "Treasury Management",
      description: "Real-time liquidity controls with multi-sig operations",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-12 h-12">
          <path d="M19 14C19 15.1046 18.1046 16 17 16H7L3 20V6C3 4.89543 3.89543 4 5 4H17C18.1046 4 19 4.89543 19 6V14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M8 9H16M8 12H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      color: "from-stone-100 to-stone-200"
    },
    {
      title: "Programmable Controls",
      description: "Business rules for spending limits, merchant categories",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-12 h-12">
          <path d="M12 4V20M4 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
        </svg>
      ),
      color: "from-amber-100 to-orange-200"
    }
  ];

  const useCases = [
    {
      title: "Corporate Treasury",
      description: "Replace bank deposits with programmable stablecoins",
      metrics: ["95% cost reduction", "Instant settlement", "24/7 liquidity"],
      gradient: "from-slate-100 to-slate-200"
    },
    {
      title: "Payroll Distribution",
      description: "Pay global employees instantly with no intermediaries",
      metrics: ["180+ countries", "Same-day settlement", "0.1% fees"],
      gradient: "from-stone-200 to-stone-300"
    },
    {
      title: "Supply Chain Finance",
      description: "Automated payments with smart contract escrow",
      metrics: ["30-day terms", "Auto-reconciliation", "Real-time tracking"],
      gradient: "from-emerald-100 to-green-200"
    },
    {
      title: "Cross-Border Payments",
      description: "Eliminate correspondent banking delays and fees",
      metrics: ["$0.50 flat fee", "60-second settlement", "Full transparency"],
      gradient: "from-amber-200 to-amber-300"
    }
  ];

  const comparisonData = [
    { feature: "Settlement Time", traditional: "2-5 days", monay: "60 seconds" },
    { feature: "Transaction Cost", traditional: "$25-45", monay: "$0.50" },
    { feature: "Operating Hours", traditional: "Business hours", monay: "24/7/365" },
    { feature: "Cross-Border", traditional: "3-7 days", monay: "Real-time" },
    { feature: "Transparency", traditional: "Limited", monay: "Full on-chain" },
    { feature: "Programmability", traditional: "None", monay: "Smart contracts" }
  ];

  return (
    <>
      <Script
        id="enterprise-stablecoin-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FinancialProduct",
            "name": "Monay Enterprise Stablecoin Platform",
            "description": "Enterprise-grade stablecoin issuance platform with dual-rail blockchain architecture, regulatory compliance, and programmable money features",
            "url": "https://www.monay.com/enterprise-stablecoin",
            "provider": {
              "@type": "Organization",
              "name": "Monay",
              "url": "https://www.monay.com"
            },
            "category": "Stablecoin Platform",
            "featureList": [
              "ERC-3643 Compliant Tokens",
              "Dual-Rail Architecture (Base L2 + Solana)",
              "Multi-Signature Treasury",
              "Programmable Spending Controls",
              "Real-time Settlement",
              "Cross-Border Payments"
            ]
          })
        }}
      />
      
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <Navigation isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
        
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-stone-100 via-amber-50 to-stone-100 border-b border-stone-200 py-20">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <span className="inline-block px-4 py-2 bg-stone-200 text-stone-700 text-sm font-semibold rounded-full mb-4">
                $250B TAM BY 2028 • ENTERPRISE STABLECOINS
              </span>

              <h1 className="text-5xl font-bold mb-4 text-stone-800">
                Enterprise Stablecoin Platform
                <span className="block text-amber-600">
                  Issue Your Own Digital Dollar
                </span>
              </h1>

              <p className="text-xl text-stone-600 max-w-3xl mx-auto mb-8">
                Deploy regulatory-compliant stablecoins with built-in treasury management,
                programmable controls, and instant global settlement.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Link
                  href="/signup/monay-caas"
                  className="inline-flex items-center justify-center px-8 py-4 font-semibold text-white bg-stone-700 rounded-xl hover:bg-stone-800 transform hover:-translate-y-0.5 hover:shadow-xl transition-all duration-200"
                >
                  Start Issuing
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex items-center justify-center px-8 py-4 font-semibold text-stone-700 bg-white border-2 border-stone-300 rounded-xl hover:bg-stone-50 transform hover:-translate-y-0.5 hover:shadow-xl transition-all duration-200"
                >
                  View Pricing
                </Link>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                <div className="text-center">
                  <div className="text-3xl font-bold text-stone-800">$10M+</div>
                  <div className="text-sm text-stone-600">Min Issuance</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-stone-800">0.25%</div>
                  <div className="text-sm text-stone-600">Annual Fee</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-stone-800">T+0</div>
                  <div className="text-sm text-stone-600">Settlement</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-stone-800">100%</div>
                  <div className="text-sm text-stone-600">Backed 1:1</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className={`text-4xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Enterprise-Grade Infrastructure
              </h2>
              <p className={`text-xl ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Built for corporations, banks, and financial institutions
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className={`rounded-2xl p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300`}
                >
                  <div className={`w-20 h-20 rounded-xl bg-gradient-to-r ${feature.color} p-4 mb-4 text-stone-700`}>
                    {feature.icon}
                  </div>
                  <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {feature.title}
                  </h3>
                  <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className={`py-20 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className={`text-4xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Transform Your Treasury Operations
              </h2>
              <p className={`text-xl ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Real-world applications delivering immediate ROI
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              {useCases.map((useCase, index) => (
                <div 
                  key={index}
                  className={`rounded-2xl overflow-hidden ${isDarkMode ? 'bg-gray-900' : 'bg-white'} shadow-xl`}
                >
                  <div className={`h-2 bg-gradient-to-r ${useCase.gradient}`}></div>
                  <div className="p-8">
                    <h3 className={`text-2xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {useCase.title}
                    </h3>
                    <p className={`mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {useCase.description}
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {useCase.metrics.map((metric, idx) => (
                        <span 
                          key={idx}
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {metric}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className={`text-4xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Traditional Banking vs Monay
              </h2>
              <p className={`text-xl ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                See the difference in real numbers
              </p>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <div className={`rounded-2xl overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-xl`}>
                <table className="w-full">
                  <thead>
                    <tr className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <th className="px-6 py-4 text-left font-semibold">Feature</th>
                      <th className="px-6 py-4 text-center font-semibold">Traditional Banking</th>
                      <th className="px-6 py-4 text-center font-semibold text-green-600">Monay Platform</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonData.map((row, index) => (
                      <tr 
                        key={index}
                        className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
                      >
                        <td className={`px-6 py-4 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                          {row.feature}
                        </td>
                        <td className={`px-6 py-4 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {row.traditional}
                        </td>
                        <td className="px-6 py-4 text-center font-semibold text-green-600">
                          {row.monay}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* Technical Architecture */}
        <section className={`py-20 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className={`text-4xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Technical Architecture
              </h2>
              <p className={`text-xl ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Enterprise-grade blockchain infrastructure
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className={`rounded-2xl p-8 ${isDarkMode ? 'bg-gray-900' : 'bg-white'} shadow-xl`}>
                <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-sky-100 to-blue-200 p-3 mb-4 text-stone-700">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3 className={`text-xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Base L2 Enterprise Rail
                </h3>
                <ul className={`space-y-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <li>• ERC-3643 compliant tokens</li>
                  <li>• Multi-signature treasury</li>
                  <li>• On-chain compliance</li>
                  <li>• Immutable audit trails</li>
                </ul>
              </div>
              
              <div className={`rounded-2xl p-8 ${isDarkMode ? 'bg-gray-900' : 'bg-white'} shadow-xl`}>
                <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-stone-100 to-stone-200 p-3 mb-4 text-stone-700">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3 className={`text-xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Solana Consumer Rail
                </h3>
                <ul className={`space-y-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <li>• 65,000 TPS capacity</li>
                  <li>• Sub-second finality</li>
                  <li>• Token-2022 extensions</li>
                  <li>• $0.00025 per transaction</li>
                </ul>
              </div>
              
              <div className={`rounded-2xl p-8 ${isDarkMode ? 'bg-gray-900' : 'bg-white'} shadow-xl`}>
                <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-green-100 to-green-200 p-3 mb-4 text-stone-700">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z" stroke="currentColor" strokeWidth="2"/>
                    <path d="M8 12L10.5 14.5L16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3 className={`text-xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Cross-Rail Bridge
                </h3>
                <ul className={`space-y-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <li>• Atomic swaps</li>
                  <li>• 60-second settlement</li>
                  <li>• Treasury reconciliation</li>
                  <li>• Real-time monitoring</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className={`rounded-3xl bg-gradient-to-r from-stone-200 via-stone-100 to-amber-50 p-12 text-center text-stone-700`}>
              <h2 className="text-4xl font-bold mb-4">
                Ready to Issue Your Enterprise Stablecoin?
              </h2>
              <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
                Join leading corporations leveraging programmable money for treasury operations, 
                payroll, and global payments.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  href="/signup/monay-caas" 
                  className="inline-flex items-center justify-center px-8 py-4 font-semibold text-indigo-600 bg-white rounded-xl hover:bg-gray-100 transform hover:-translate-y-0.5 hover:shadow-xl transition-all duration-200"
                >
                  Get Started
                </Link>
                <a 
                  href="/contact?dept=Enterprise&subject=Enterprise%20Stablecoin%20Inquiry" 
                  className="inline-flex items-center justify-center px-8 py-4 font-semibold text-white bg-white/20 backdrop-blur border border-white/30 rounded-xl hover:bg-white/30 transform hover:-translate-y-0.5 hover:shadow-xl transition-all duration-200"
                >
                  Schedule Demo
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}