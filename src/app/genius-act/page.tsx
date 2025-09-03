"use client";

import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Link from "next/link";
import Script from "next/script";

export default function GeniusActPage() {
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

  const keyFeatures = [
    {
      title: "Federal Authorization",
      description: "First federal law authorizing stablecoin payments in the U.S.",
      color: "from-blue-500 to-indigo-500"
    },
    {
      title: "Regulatory Clarity",
      description: "Clear framework for compliant stablecoin issuance and operation",
      color: "from-purple-500 to-pink-500"
    },
    {
      title: "Consumer Protection",
      description: "Built-in safeguards for users and financial institutions",
      color: "from-green-500 to-emerald-500"
    },
    {
      title: "Innovation Enablement",
      description: "Opens doors for programmable money and smart contracts",
      color: "from-orange-500 to-red-500"
    }
  ];

  const monayAdvantages = [
    "First-mover advantage with GENIUS Act compliant infrastructure",
    "Pre-built Business Rules Framework (BRF) for compliance",
    "Dual-rail architecture ready for regulated stablecoins",
    "White-label solutions for rapid deployment",
    "Integrated KYC/AML with leading providers",
    "Treasury management and cross-rail operations"
  ];

  return (
    <>
      <Script
        id="genius-act-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": "GENIUS Act: The Game-Changer for Stablecoin Payments",
            "description": "Learn how the GENIUS Act (July 2025) enables compliant stablecoin payments and how Monay is the first platform built for this new regulatory framework.",
            "datePublished": "2025-07-18",
            "dateModified": "2025-09-02",
            "author": {
              "@type": "Organization",
              "name": "Monay"
            },
            "publisher": {
              "@type": "Organization",
              "name": "Monay",
              "logo": {
                "@type": "ImageObject",
                "url": "https://www.monay.com/Monay.svg"
              }
            },
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": "https://www.monay.com/genius-act"
            },
            "keywords": "GENIUS Act, stablecoin regulation, federal law, compliant stablecoin, programmable money, digital payments"
          })
        }}
      />
      
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <Navigation isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
        
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <span className="inline-block px-4 py-2 bg-white/20 backdrop-blur text-white text-sm font-semibold rounded-full mb-4">
                PASSED JULY 18, 2025
              </span>
              
              <h1 className="text-5xl font-bold mb-4">
                The GENIUS Act: Unlocking the Future of
                <span className="block text-yellow-300">
                  Programmable Stablecoin Payments
                </span>
              </h1>
              
              <p className="text-xl opacity-90 max-w-3xl mx-auto mb-8">
                The first federal law authorizing stablecoin payments in the U.S. 
                Monay is the only platform built from the ground up for GENIUS Act compliance.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Link 
                  href="/investors" 
                  className="inline-flex items-center justify-center px-8 py-4 font-semibold text-blue-600 bg-white rounded-xl hover:bg-gray-100 transform hover:-translate-y-0.5 hover:shadow-xl transition-all duration-200"
                >
                  Learn About Investment
                </Link>
                <Link 
                  href="/signup" 
                  className="inline-flex items-center justify-center px-8 py-4 font-semibold text-white bg-white/20 backdrop-blur border border-white/30 rounded-xl hover:bg-white/30 transform hover:-translate-y-0.5 hover:shadow-xl transition-all duration-200"
                >
                  Start Pilot Program
                </Link>
              </div>
              
              {/* Key Stats Bar */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mt-12">
                <div className="text-center">
                  <div className="text-3xl font-bold">$9T+</div>
                  <div className="text-sm opacity-90">Digital Payments</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">932K</div>
                  <div className="text-sm opacity-90">Global FIs</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">$250B</div>
                  <div className="text-sm opacity-90">TAM by 2028</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">First</div>
                  <div className="text-sm opacity-90">Compliant Platform</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* What is the GENIUS Act */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
                What is the GENIUS Act?
              </h2>
              
              <div className={`p-8 rounded-2xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-xl mb-12`}>
                <p className={`text-lg leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  The <strong>Government Efficiency through Next-generation Innovation in US Stablecoins (GENIUS) Act</strong> is 
                  landmark legislation passed on July 18, 2025, that provides the first comprehensive federal framework for 
                  stablecoin issuance and payments in the United States. This act enables financial institutions, fintechs, 
                  and government agencies to legally issue, distribute, and accept stablecoin payments with clear regulatory guidelines.
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {keyFeatures.map((feature, index) => (
                  <div key={index} className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'} shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}>
                    <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-lg flex items-center justify-center mb-4`}>
                      {index === 0 && (
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                        </svg>
                      )}
                      {index === 1 && (
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      )}
                      {index === 2 && (
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      )}
                      {index === 3 && (
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      )}
                    </div>
                    <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{feature.title}</h3>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Why It Matters */}
        <section className={`py-20 ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-100'}`}>
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
                Why the GENIUS Act Changes Everything
              </h2>
              
              <div className="grid md:grid-cols-3 gap-8">
                <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-900/80 border border-gray-700' : 'bg-white border border-gray-200'} shadow-lg`}>
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center mr-4">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>For Banks & FIs</h3>
                  </div>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Issue compliant branded stablecoins</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Modernize payment infrastructure</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Access $250B market opportunity</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Reduce transaction costs by 90%</span>
                    </li>
                  </ul>
                </div>
                
                <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-900/80 border border-gray-700' : 'bg-white border border-gray-200'} shadow-lg`}>
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-4">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>For Government</h3>
                  </div>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>Programmable benefit disbursements</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>Real-time payment tracking</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>Eliminate fraud and waste</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>Instant disaster relief payments</span>
                    </li>
                  </ul>
                </div>
                
                <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-900/80 border border-gray-700' : 'bg-white border border-gray-200'} shadow-lg`}>
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mr-4">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>For Enterprises</h3>
                  </div>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>B2B payment automation</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>Smart contract integration</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>Cross-border settlements</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>Treasury optimization</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Monay's GENIUS Act Solution */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
                Monay: Built for GENIUS Act Compliance
              </h2>
              
              <div className={`p-8 rounded-2xl ${isDarkMode ? 'bg-gradient-to-br from-blue-900/50 to-purple-900/50' : 'bg-gradient-to-br from-blue-50 to-purple-50'} border ${isDarkMode ? 'border-blue-700' : 'border-blue-200'}`}>
                <h3 className="text-2xl font-bold mb-6">Why Monay is the Perfect GENIUS Act Platform</h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {monayAdvantages.map((advantage, index) => (
                    <div key={index} className="flex items-start">
                      <svg className="w-6 h-6 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{advantage}</span>
                    </div>
                  ))}
                </div>
                
                <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                  <Link 
                    href="/pitch-deck.pdf" 
                    className="inline-flex items-center justify-center px-8 py-4 font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:from-blue-700 hover:to-purple-700 transform hover:-translate-y-0.5 hover:shadow-xl transition-all duration-200"
                  >
                    View Investment Deck
                  </Link>
                  <a 
                    href="/contact?dept=Government&subject=GENIUS%20Act%20Platform%20Inquiry" 
                    className={`inline-flex items-center justify-center px-8 py-4 font-semibold ${isDarkMode ? 'text-white bg-gray-700 hover:bg-gray-600' : 'text-gray-900 bg-gray-200 hover:bg-gray-300'} rounded-xl transform hover:-translate-y-0.5 hover:shadow-xl transition-all duration-200`}
                  >
                    Contact Us
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Market Opportunity */}
        <section className={`py-20 ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-100'}`}>
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
                The GENIUS Act Market Opportunity
              </h2>
              
              <div className="grid md:grid-cols-4 gap-6 mb-12">
                <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg text-center`}>
                  <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                    $9T+
                  </div>
                  <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-2`}>
                    Global Digital Payments Market
                  </div>
                </div>
                
                <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg text-center`}>
                  <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                    932K
                  </div>
                  <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-2`}>
                    Financial Institutions Globally
                  </div>
                </div>
                
                <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg text-center`}>
                  <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                    $250B
                  </div>
                  <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-2`}>
                    Stablecoin TAM by 2028
                  </div>
                </div>
                
                <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg text-center`}>
                  <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                    $500B
                  </div>
                  <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-2`}>
                    Public Sector SAM
                  </div>
                </div>
              </div>
              
              <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50'} border ${isDarkMode ? 'border-blue-800' : 'border-blue-200'}`}>
                <p className={`text-center ${isDarkMode ? 'text-blue-200' : 'text-blue-800'}`}>
                  <strong>First-Mover Advantage:</strong> Monay is positioned to capture significant market share as the 
                  first platform purpose-built for GENIUS Act compliance. Our $6.5M Pre-Series A funding will accelerate 
                  market penetration across 932K global financial institutions.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className={`max-w-4xl mx-auto p-8 rounded-2xl ${isDarkMode ? 'bg-gradient-to-br from-gray-800 to-gray-900' : 'bg-gradient-to-br from-gray-50 to-white'} shadow-xl text-center`}>
              <h2 className="text-3xl font-bold mb-4">
                Be Part of the GENIUS Act Revolution
              </h2>
              <p className={`mb-8 text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Join the first wave of institutions leveraging GENIUS Act-compliant infrastructure. 
                Whether you're a bank, government agency, or enterprise, Monay has the solution.
              </p>
              
              <div className="grid md:grid-cols-3 gap-4">
                <Link 
                  href="/signup/monay-caas" 
                  className="p-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 transition-all"
                >
                  <h3 className="font-bold mb-1">For Banks</h3>
                  <p className="text-sm opacity-90">Launch compliant stablecoins</p>
                </Link>
                
                <Link 
                  href="/solutions/government-programs" 
                  className="p-4 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 transition-all"
                >
                  <h3 className="font-bold mb-1">For Government</h3>
                  <p className="text-sm opacity-90">Programmable disbursements</p>
                </Link>
                
                <Link 
                  href="/signup" 
                  className="p-4 rounded-xl bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 transition-all"
                >
                  <h3 className="font-bold mb-1">For Enterprise</h3>
                  <p className="text-sm opacity-90">B2B payment automation</p>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className={`py-12 border-t ${isDarkMode ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-gray-50'}`}>
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className={`mb-4 md:mb-0 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <p className="text-sm">© 2025 Monay Inc. All rights reserved.</p>
                <p className="text-xs mt-1">GENIUS Act compliant infrastructure provider.</p>
              </div>
              <div className="flex gap-6">
                <Link href="/privacy" className={`text-sm ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
                  Privacy Policy
                </Link>
                <Link href="/terms" className={`text-sm ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
                  Terms of Service
                </Link>
                <Link href="/investors" className={`text-sm ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
                  Investors
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}