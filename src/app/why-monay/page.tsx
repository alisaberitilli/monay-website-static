"use client";

import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";

export default function WhyMonayPage() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState('authentication');

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode !== null) {
      setIsDarkMode(JSON.parse(savedDarkMode));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const comparisonData = {
    authentication: {
      title: "Authentication (Monay ID vs Competitors)",
      headers: ["Feature", "Monay ID", "Auth0", "Okta", "Firebase"],
      rows: [
        ["Starting Price", "Free", "$240/mo", "$1,500/mo", "Free"],
        ["10K MAU Cost", "$149", "$240", "$3,000", "Free"],
        ["100K MAU Cost", "$499", "$2,100", "$8,000", "$60"],
        ["Voice Biometrics", "✅", "❌", "❌", "❌"],
        ["Custodian Recovery", "✅", "❌", "❌", "❌"],
        ["Setup Time", "<1 hour", "2-4 hrs", "1-2 days", "2-4 hrs"],
        ["Drop-in UI", "✅", "✅", "❌", "❌"],
        ["SLA Guarantee", "99.99%", "99.9%", "99.95%", "None"],
      ]
    },
    stablecoin: {
      title: "Stablecoin Platform (Monay CaaS vs Competitors)",
      headers: ["Feature", "Monay CaaS", "Circle", "Fireblocks", "Paxos"],
      rows: [
        ["Minimum Cost", "$2,499/mo", "$50K", "$150K/yr", "Custom"],
        ["Setup Fee", "$0 (Pilot)", "$100K", "$250K", "$500K"],
        ["Transaction Fee", "$0.02-0.05", "$0.10", "$0.15", "$0.20"],
        ["Dual-Rail (Base+Solana)", "✅", "❌", "❌", "❌"],
        ["Cross-Rail Swaps", "✅", "❌", "❌", "❌"],
        ["White-Label Wallet", "✅", "❌", "Limited", "❌"],
        ["Launch Time", "Days", "Months", "Months", "Months"],
        ["Integration Time", "<1 week", "4-6 wks", "6-8 wks", "8-12 wks"],
      ]
    },
    wallet: {
      title: "Wallet Infrastructure (Monay WaaS vs Competitors)",
      headers: ["Feature", "Monay WaaS", "Circle", "Fireblocks", "Privy"],
      rows: [
        ["Starting Price", "Free", "$25K/yr", "$150K/yr", "$2K/mo"],
        ["10K Wallets Cost", "$299/mo", "$3K/mo", "$15K/mo", "$5K/mo"],
        ["Transaction Fee", "$0.05-0.15", "$0.10", "$0.15", "$0.25"],
        ["Dual-Rail Integration", "✅", "❌", "❌", "❌"],
        ["Crypto Native", "✅", "✅", "✅", "✅"],
        ["Cross-border <$1", "✅", "Limited", "Limited", "❌"],
        ["Apple/Google Pay", "✅", "Via Partners", "Via Partners", "Via Partners"],
        ["ATM Network", "AllPoint 55K+", "❌", "❌", "❌"],
        ["Custody Model", "Hybrid", "Modular", "MPC-CMP", "TEE+Shards"],
        ["Card Issuing", "✅ Built-in", "Via Partners", "Via Partners", "Via Partners"],
        ["Smart Account (AA)", "✅", "✅", "Limited", "✅"],
        ["Voice Biometrics", "✅", "❌", "❌", "❌"],
        ["Invoice-First", "✅", "❌", "❌", "❌"],
        ["Custodian Recovery", "✅", "❌", "❌", "❌"],
        ["Chain Support", "EVM + Solana", "EVM Only", "100+ chains", "EVM Only"],
        ["Business Rules Engine", "✅", "❌", "Limited", "❌"],
        ["KYC/AML Built-in", "✅", "Via Partners", "Via Partners", "Via Partners"],
        ["Setup Time", "<1 week", "2-3 weeks", "4-6 weeks", "2-3 weeks"],
      ]
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Navigation isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
      
      {/* Hero Section */}
      <section className={`py-20 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900 border-b border-gray-200'}`}>
        <div className="container mx-auto px-4">
          <h1 className={`text-5xl font-bold text-center mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Why Leading Companies & Innovative Public Sectors Must Choose Monay
          </h1>
          <p className={`text-xl text-center max-w-3xl mx-auto ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            See how we deliver more value, better technology, and lower costs than traditional providers
          </p>
          
          {/* Key Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mt-12">
            <div className="text-center">
              <div className="text-3xl font-bold">50-90%</div>
              <div className="text-sm opacity-90">Cost Savings</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">10x</div>
              <div className="text-sm opacity-90">Faster Integration</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">99.99%</div>
              <div className="text-sm opacity-90">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">150+</div>
              <div className="text-sm opacity-90">Countries</div>
            </div>
          </div>
        </div>
      </section>

      {/* Federal Initiative Alignment */}
      <section className={`py-16 ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className={`inline-block px-4 py-2 text-sm font-semibold rounded-full mb-4 ${isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-800 text-white'}`}>
              EXECUTIVE ORDER COMPLIANT
            </span>
            <h2 className={`text-3xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Aligned with 2025 Federal Initiatives
            </h2>
            <p className={`text-xl ${isDarkMode ? 'text-gray-400' : 'text-gray-700'} max-w-3xl mx-auto`}>
              Monay is uniquely positioned to power the US Federal Government's digital finance and education freedom initiatives
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Digital Financial Technology */}
            <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-900/80 border border-gray-700' : 'bg-white border border-gray-200'}`}>
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    EO: Digital Asset Leadership
                  </h3>
                  <p className={`text-sm ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                    Signed January 23, 2025
                  </p>
                </div>
              </div>
              <div className={`space-y-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <strong>USD Stablecoin Support:</strong> Monay's ERC-3643 tokens align with GENIUS Act framework
                  </div>
                </div>
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <strong>No CBDC Policy:</strong> Private stablecoin infrastructure ready for government programs
                  </div>
                </div>
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <strong>Banking Access:</strong> End of Operation Choke Point 2.0 enables seamless partnerships
                  </div>
                </div>
              </div>
            </div>

            {/* Education Freedom */}
            <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-900/80 border border-gray-700' : 'bg-white border border-gray-200'}`}>
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                  </svg>
                </div>
                <div>
                  <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    EO: Education Freedom
                  </h3>
                  <p className={`text-sm ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                    Signed January 29, 2025
                  </p>
                </div>
              </div>
              <div className={`space-y-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <strong>$10K Education Accounts:</strong> Digital wallets with MCC controls for compliant spending
                  </div>
                </div>
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <strong>School Choice Vouchers:</strong> Blockchain-based distribution with real-time tracking
                  </div>
                </div>
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <strong>Title I Redirection:</strong> Instant parent-directed funding with complete audit trails
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-8">
            <a href="/solutions/government-programs" className={`inline-flex items-center justify-center px-8 py-3 font-semibold text-white rounded-xl transform hover:-translate-y-0.5 hover:shadow-xl transition-all duration-200 ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-900 hover:bg-gray-800'}`}>
              Explore Government Solutions
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* Interactive Comparison Matrix */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className={`text-3xl font-bold text-center mb-8 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Interactive Comparison Matrix</h2>
          
          {/* Product Selector */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex rounded-lg border border-gray-300 dark:border-gray-600">
              <button
                onClick={() => setSelectedProduct('authentication')}
                className={`px-6 py-3 rounded-l-lg font-medium transition-colors ${
                  selectedProduct === 'authentication'
                    ? 'bg-gray-800 text-white'
                    : isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-800'
                }`}
              >
                Authentication
              </button>
              <button
                onClick={() => setSelectedProduct('stablecoin')}
                className={`px-6 py-3 font-medium transition-colors ${
                  selectedProduct === 'stablecoin'
                    ? 'bg-gray-800 text-white'
                    : isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-800'
                }`}
              >
                Stablecoin
              </button>
              <button
                onClick={() => setSelectedProduct('wallet')}
                className={`px-6 py-3 rounded-r-lg font-medium transition-colors ${
                  selectedProduct === 'wallet'
                    ? 'bg-gray-800 text-white'
                    : isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-800'
                }`}
              >
                Wallet
              </button>
            </div>
          </div>

      {/* Comparison Table */}
          <div className="max-w-6xl mx-auto overflow-x-auto">
            <div className={`rounded-lg overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-xl`}>
              <h3 className={`text-xl font-bold p-4 ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-800 text-white'}`}>
                {comparisonData[selectedProduct as keyof typeof comparisonData].title}
              </h3>
              <table className="w-full">
                <thead className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <tr>
                    {comparisonData[selectedProduct as keyof typeof comparisonData].headers.map((header, idx) => (
                      <th key={idx} className={`px-6 py-4 text-left font-semibold ${
                        idx === 1 ? 'text-blue-600' : isDarkMode ? 'text-gray-200' : 'text-gray-900'
                      }`}>
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comparisonData[selectedProduct as keyof typeof comparisonData].rows.map((row, rowIdx) => (
                    <tr key={rowIdx} className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      {row.map((cell, cellIdx) => (
                        <td key={cellIdx} className={`px-6 py-4 ${
                          cellIdx === 1 ? 'font-bold text-green-600' : isDarkMode ? 'text-gray-300' : 'text-gray-800'
                        }`}>
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Unique Value Propositions */}
      <section className={`py-16 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="container mx-auto px-4">
          <h2 className={`text-3xl font-bold text-center mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Only at Monay</h2>
          <p className={`text-xl text-center mb-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-800'}`}>
            Revolutionary Features No One Else Offers
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Unified WaaS + CaaS - 1st */}
            <div className={`p-6 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-lg`}>
              <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Unified WaaS + CaaS</h3>
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-800'} text-sm`}>
                <span className="font-semibold">The only platform combining wallet + branded stablecoin.</span> White-label wallet infrastructure with your own compliant token, all under one contract and API.
              </p>
            </div>

            {/* Dual-Rail Blockchain - 2nd */}
            <div className={`p-6 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-lg`}>
              <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Dual-Rail Architecture</h3>
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-800'} text-sm`}>
                <span className="font-semibold">Base L2 + Solana with treasury burn/mint.</span> Cross-rail atomic swaps in &lt;60 seconds. Chain abstraction for end users.
              </p>
            </div>

            {/* Real-World Spend Built-In - 3rd */}
            <div className={`p-6 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-lg`}>
              <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Real-World Spend Built-In</h3>
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-800'} text-sm`}>
                <span className="font-semibold">Card issuing with JIT funding + cardless ATM.</span> Pre-integrated issuer-processor, tokenized cards, code-based cash withdrawals at 55,000+ ATMs.
              </p>
            </div>

            {/* Invoice First™ Platform - 4th */}
            <div className={`p-6 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-lg`}>
              <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Invoice First™ Platform</h3>
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-800'} text-sm`}>
                <span className="font-semibold">Create invoice, then pay.</span> Revolutionary approach where every transaction starts with a verified invoice. Line items, refunds, partials, returns. ERP sync, bill aggregator integration, complete audit trail and automated reconciliation.
              </p>
            </div>

            {/* Program-Grade BRF - 5th */}
            <div className={`p-6 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-lg`}>
              <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Program-Grade BRF</h3>
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-800'} text-sm`}>
                <span className="font-semibold">Enterprise eligibility & spend controls.</span> MCC/merchant/geo/time limits, KYC/KYB rules, approval workflows, fraud detection—all configurable in real-time.
              </p>
            </div>

            {/* Compliance-First - 6th */}
            <div className={`p-6 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-lg`}>
              <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Compliance-First Orchestration</h3>
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-800'} text-sm`}>
                <span className="font-semibold">HIPAA-ready, KYC/KYB/AML built-in.</span> Sanctions screening, audit trails, FBO/escrow segregation. Enterprise & public-sector ready with SSO/SAML.
              </p>
            </div>

            {/* Treasury Automation - 7th */}
            <div className={`p-6 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-lg`}>
              <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Treasury & Liquidity Automation</h3>
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-800'} text-sm`}>
                <span className="font-semibold">Segregated balances, fiat↔stablecoin conversion.</span> Cross-rail rebalancing, automated reconciliation, hybrid ledger with on-chain anchoring.
              </p>
            </div>

            {/* Enterprise & Public-Sector Readiness - 8th */}
            <div className={`p-6 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-lg`}>
              <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Enterprise & Public-Sector Readiness</h3>
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-800'} text-sm`}>
                <span className="font-semibold">SSO/SAML, RBAC, advanced observability.</span> Complete webhook infrastructure, data exports, ACH/RTP/wire connectors. Built for government, healthcare, and Fortune 500 requirements.
              </p>
            </div>

            {/* Multi-Stakeholder Wallets - 8th */}
            <div className={`p-6 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-lg`}>
              <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Multi-Stakeholder Model</h3>
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-800'} text-sm`}>
                <span className="font-semibold">Guardian/beneficiary, parent/child support.</span> Department budgets, allowances, approvals, envelopes. Role-segregated operations with custodian recovery.
              </p>
            </div>

            {/* One Contract, One API - 9th */}
            <div className={`p-6 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-lg`}>
              <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>One Contract, One API</h3>
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-800'} text-sm`}>
                <span className="font-semibold">Ship in 4-6 weeks, not months.</span> Pre-integrated rails eliminate 5-6 vendor integrations. Built-in engagement (Nudge) for onboarding & receipts.
              </p>
            </div>

            {/* Custodian & Recovery Service - 10th */}
            <div className={`p-6 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-lg`}>
              <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Custodian & Recovery Service</h3>
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-800'} text-sm`}>
                <span className="font-semibold">Never lose access to accounts.</span> Family, professional, and institutional custodians with zero-knowledge security. Migrate once, secure forever.
              </p>
            </div>

            {/* Voice Biometric Authentication - 11th */}
            <div className={`p-6 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-lg`}>
              <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Voice Biometric Authentication</h3>
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-800'} text-sm`}>
                <span className="font-semibold">Patent-pending voice security.</span> Frictionless authentication with AI-powered voice recognition. No passwords, no SMS codes, just speak to verify.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Performance Metrics */}
      <section className={`py-16 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="container mx-auto px-4">
          <h2 className={`text-3xl font-bold text-center mb-12 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Performance Metrics Comparison</h2>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Speed & Reliability */}
            <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Speed & Reliability</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>API Response Time</span>
                  <div>
                    <span className="font-bold text-green-600">&lt;50ms</span>
                    <span className={`ml-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-800'}`}>(Industry: 200-500ms)</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>Uptime SLA</span>
                  <div>
                    <span className="font-bold text-green-600">99.99%</span>
                    <span className={`ml-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-800'}`}>(Industry: 99.9%)</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>Transaction Speed</span>
                  <div>
                    <span className="font-bold text-green-600">&lt;1 sec</span>
                    <span className={`ml-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-800'}`}>(Industry: 5-30 sec)</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>Integration Time</span>
                  <div>
                    <span className="font-bold text-green-600">&lt;1 hour</span>
                    <span className={`ml-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-800'}`}>(Industry: 1-2 weeks)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Cost Efficiency */}
            <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Cost Efficiency</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>10K MAU Auth</span>
                  <div>
                    <span className="font-bold text-green-600">$149/mo</span>
                    <span className={`ml-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-800'}`}>Save 80%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>100K Transactions</span>
                  <div>
                    <span className="font-bold text-green-600">$2,499/mo</span>
                    <span className={`ml-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-800'}`}>Save 83%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>5K Wallets</span>
                  <div>
                    <span className="font-bold text-green-600">$299/mo</span>
                    <span className={`ml-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-800'}`}>Save 94%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>Enterprise Bundle</span>
                  <div>
                    <span className="font-bold text-green-600">$3,999/mo</span>
                    <span className={`ml-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-800'}`}>Save 84%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Success Metrics */}
      <section className={`py-16 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="container mx-auto px-4">
          <h2 className={`text-3xl font-bold text-center mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Your Savings Calculator</h2>
          <p className={`text-xl text-center mb-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-800'}`}>
            See how much you'll save by switching from legacy providers to Monay
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className={`p-6 rounded-lg border-2 border-blue-500 ${isDarkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
              <h3 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Authentication Migration</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>From:</span>
                  <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>Auth0 ($5,000/mo)</span>
                </div>
                <div className="flex justify-between">
                  <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>To:</span>
                  <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>Monay ID ($499/mo)</span>
                </div>
                <div className="pt-2 border-t mt-2">
                  <div className="text-2xl font-bold text-green-600">90% cost reduction</div>
                  <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-800'}`}>+ voice biometrics</div>
                </div>
              </div>
            </div>

            <div className={`p-6 rounded-lg border-2 border-purple-500 ${isDarkMode ? 'bg-gray-700' : 'bg-purple-50'}`}>
              <h3 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Stablecoin Launch</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>Traditional:</span>
                  <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>18 months, $2M</span>
                </div>
                <div className="flex justify-between">
                  <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>With Monay:</span>
                  <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>3 weeks, $50K</span>
                </div>
                <div className="pt-2 border-t mt-2">
                  <div className="text-2xl font-bold text-green-600">97% savings</div>
                  <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-800'}`}>94% faster</div>
                </div>
              </div>
            </div>

            <div className={`p-6 rounded-lg border-2 border-green-500 ${isDarkMode ? 'bg-gray-700' : 'bg-green-50'}`}>
              <h3 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Digital Wallet</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>Competitor:</span>
                  <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>$500K + $10K/mo</span>
                </div>
                <div className="flex justify-between">
                  <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>Monay WaaS:</span>
                  <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>$0 + $999/mo</span>
                </div>
                <div className="pt-2 border-t mt-2">
                  <div className="text-2xl font-bold text-green-600">$500K saved</div>
                  <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-800'}`}>Immediate savings</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technical Advantages */}
      <section className={`py-16 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="container mx-auto px-4">
          <h2 className={`text-3xl font-bold text-center mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Technical Superiority</h2>
          <p className={`text-xl text-center mb-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-800'}`}>
            Built from the ground up for modern fintech requirements
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Architecture Advantages */}
            <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
              <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <h3 className={`text-xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Architecture</h3>
              <ul className="space-y-2 text-sm">
                <li className={`flex items-start ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <span className="text-green-500 mr-2">✓</span>
                  <span><strong>Dual-rail blockchain:</strong> Base L2 + Solana</span>
                </li>
                <li className={`flex items-start ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <span className="text-green-500 mr-2">✓</span>
                  <span><strong>Chain abstraction:</strong> Users never see complexity</span>
                </li>
                <li className={`flex items-start ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <span className="text-green-500 mr-2">✓</span>
                  <span><strong>Event-driven:</strong> Real-time processing</span>
                </li>
                <li className={`flex items-start ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <span className="text-green-500 mr-2">✓</span>
                  <span><strong>Microservices:</strong> Scalable & resilient</span>
                </li>
                <li className={`flex items-start ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <span className="text-green-500 mr-2">✓</span>
                  <span><strong>Multi-region:</strong> Global deployment</span>
                </li>
              </ul>
            </div>

            {/* Security Advantages */}
            <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
              <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className={`text-xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Security</h3>
              <ul className="space-y-2 text-sm">
                <li className={`flex items-start ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <span className="text-green-500 mr-2">✓</span>
                  <span><strong>HSM integration:</strong> Hardware key management</span>
                </li>
                <li className={`flex items-start ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <span className="text-green-500 mr-2">✓</span>
                  <span><strong>Voice biometrics:</strong> Patent-pending tech</span>
                </li>
                <li className={`flex items-start ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <span className="text-green-500 mr-2">✓</span>
                  <span><strong>Zero-knowledge:</strong> Custodian recovery</span>
                </li>
                <li className={`flex items-start ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <span className="text-green-500 mr-2">✓</span>
                  <span><strong>MPC wallets:</strong> Multi-party computation</span>
                </li>
                <li className={`flex items-start ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <span className="text-green-500 mr-2">✓</span>
                  <span><strong>SOC2 Type II:</strong> Certified compliance</span>
                </li>
              </ul>
            </div>

            {/* Integration Advantages */}
            <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
              <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className={`text-xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Integration</h3>
              <ul className="space-y-2 text-sm">
                <li className={`flex items-start ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <span className="text-green-500 mr-2">✓</span>
                  <span><strong>Single API:</strong> All services unified</span>
                </li>
                <li className={`flex items-start ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <span className="text-green-500 mr-2">✓</span>
                  <span><strong>SDKs:</strong> JS, Python, Go, Rust, Java</span>
                </li>
                <li className={`flex items-start ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <span className="text-green-500 mr-2">✓</span>
                  <span><strong>Webhooks:</strong> Real-time events</span>
                </li>
                <li className={`flex items-start ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <span className="text-green-500 mr-2">✓</span>
                  <span><strong>Drop-in UI:</strong> Pre-built components</span>
                </li>
                <li className={`flex items-start ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <span className="text-green-500 mr-2">✓</span>
                  <span><strong>GraphQL:</strong> Flexible queries</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Migration Benefits */}
      <section className={`py-16 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="container mx-auto px-4">
          <h2 className={`text-3xl font-bold text-center mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Switch to Monay in Days, Not Months</h2>
          <p className={`text-xl text-center mb-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-800'}`}>
            Free migration services and dedicated support included
          </p>
          
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Free Migration Services</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>Dedicated migration team</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>Data transfer assistance</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>Code migration tools</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>Parallel run support</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>Zero downtime switching</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Migration Timeline</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-3">1</div>
                    <div>
                      <div className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Day 1-3</div>
                      <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-800'}`}>Assessment and planning</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold mr-3">2</div>
                    <div>
                      <div className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Day 4-7</div>
                      <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-800'}`}>Data migration</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold mr-3">3</div>
                    <div>
                      <div className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Day 8-10</div>
                      <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-800'}`}>Testing and validation</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold mr-3">4</div>
                    <div>
                      <div className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Day 11-14</div>
                      <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-800'}`}>Go live</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center font-bold mr-3">5</div>
                    <div>
                      <div className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Day 15+</div>
                      <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-800'}`}>Optimization</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={`py-20 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900 border-t border-gray-200'}`}>
        <div className="container mx-auto px-4 text-center">
          <h2 className={`text-4xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Ready to Experience the Monay Difference?
          </h2>
          <p className={`text-xl mb-8 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Join the Pilot Program today and save 75% on your first year
          </p>
          <div className="flex justify-center gap-4">
            <a href="/pricing" className={`px-8 py-4 rounded-lg font-semibold transition-colors ${isDarkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-900 text-white hover:bg-gray-800'}`}>
              See Pricing Calculator
            </a>
            <a href="/signup" className={`px-8 py-4 rounded-lg font-semibold transition-colors border-2 ${isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}>
              Sign Up Now
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}