"use client";

import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Link from "next/link";
import Script from "next/script";

export default function SNAPModernizationPage() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<"restrictions" | "analytics" | "integration">("restrictions");

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
      title: "Smart Restrictions",
      description: "Automated MCC-based purchase controls",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-12 h-12">
          <path d="M12 15V17M6 21H18C19.1046 21 20 20.1046 20 19V13C20 11.8954 19.1046 11 18 11H6C4.89543 11 4 11.8954 4 13V19C4 20.1046 4.89543 21 6 21ZM16 11V7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7V11H16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      color: "from-blue-500 to-indigo-500"
    },
    {
      title: "Instant Issuance",
      description: "Digital cards deployed in minutes",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-12 h-12">
          <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      color: "from-yellow-500 to-orange-500"
    },
    {
      title: "Fraud Prevention",
      description: "Real-time AI transaction monitoring",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-12 h-12">
          <path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      color: "from-green-500 to-emerald-500"
    },
    {
      title: "Mobile Access",
      description: "Full functionality on any smartphone",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-12 h-12">
          <rect x="7" y="2" width="10" height="20" rx="2" stroke="currentColor" strokeWidth="2"/>
          <circle cx="12" cy="18" r="1" fill="currentColor"/>
        </svg>
      ),
      color: "from-purple-500 to-pink-500"
    }
  ];

  const modernizationFeatures = {
    restrictions: {
      title: "Intelligent Purchase Controls",
      description: "Automated enforcement of SNAP eligibility rules",
      items: [
        { label: "Approved food categories only", status: "Automatic blocking" },
        { label: "No alcohol or tobacco", status: "Real-time prevention" },
        { label: "Hot food restrictions", status: "MCC-based controls" },
        { label: "Retailer verification", status: "FNS authorization check" },
        { label: "Transaction limits", status: "Daily/monthly caps" }
      ]
    },
    analytics: {
      title: "Real-Time Analytics",
      description: "Complete visibility into program usage",
      items: [
        { label: "Spending patterns", status: "Live dashboard" },
        { label: "Nutritional insights", status: "Category analysis" },
        { label: "Fraud detection", status: "AI monitoring" },
        { label: "Vendor compliance", status: "Automated reporting" },
        { label: "Program metrics", status: "KPI tracking" }
      ]
    },
    integration: {
      title: "Seamless Integration",
      description: "Works with existing SNAP infrastructure",
      items: [
        { label: "State systems", status: "API connectivity" },
        { label: "FNS database", status: "Real-time sync" },
        { label: "WIC coordination", status: "Cross-program support" },
        { label: "EBT processors", status: "Bridge compatibility" },
        { label: "POS terminals", status: "Universal acceptance" }
      ]
    }
  };

  const currentFeature = modernizationFeatures[selectedFeature];

  const statistics = [
    { metric: "$113B", description: "Annual SNAP benefits" },
    { metric: "42M", description: "Americans on SNAP" },
    { metric: "260K", description: "Authorized retailers" },
    { metric: "$130", description: "Average monthly benefit" }
  ];

  const comparisonData = [
    {
      feature: "Card Issuance",
      traditional: "7-10 days mail delivery",
      monay: "Instant digital card",
      savings: "$12 per card"
    },
    {
      feature: "Replacement Cards",
      traditional: "5-7 days + $5 fee",
      monay: "Instant, free",
      savings: "$5 per replacement"
    },
    {
      feature: "Fraud Rate",
      traditional: "1.5% of benefits",
      monay: "0.1% with AI",
      savings: "$1.5B annually"
    },
    {
      feature: "Admin Cost",
      traditional: "8% of budget",
      monay: "2% of budget",
      savings: "75% reduction"
    },
    {
      feature: "User Experience",
      traditional: "Physical card only",
      monay: "Mobile + card",
      savings: "95% satisfaction"
    }
  ];

  const implementationPhases = [
    {
      phase: "Phase 1",
      duration: "Months 1-3",
      title: "Pilot Program",
      activities: ["Select pilot counties", "Deploy digital wallets", "Train staff", "Monitor performance"]
    },
    {
      phase: "Phase 2",
      duration: "Months 4-6",
      title: "Expansion",
      activities: ["Scale to 25% of recipients", "Retailer onboarding", "Mobile app launch", "Feedback integration"]
    },
    {
      phase: "Phase 3",
      duration: "Months 7-9",
      title: "Full Rollout",
      activities: ["Statewide deployment", "Legacy system sunset", "Performance optimization", "Cost analysis"]
    },
    {
      phase: "Phase 4",
      duration: "Months 10-12",
      title: "Enhancement",
      activities: ["Advanced features", "Cross-program integration", "Nutritional programs", "Impact assessment"]
    }
  ];

  const benefits = [
    {
      stakeholder: "Recipients",
      improvements: [
        "Instant card replacement",
        "Mobile wallet access",
        "Real-time balance",
        "Transaction history",
        "Nutrition tracking"
      ]
    },
    {
      stakeholder: "States",
      improvements: [
        "90% cost reduction",
        "Real-time reporting",
        "Fraud prevention",
        "Simplified admin",
        "Federal compliance"
      ]
    },
    {
      stakeholder: "Retailers",
      improvements: [
        "Instant settlement",
        "Lower fees",
        "Simple integration",
        "Fraud protection",
        "Digital receipts"
      ]
    },
    {
      stakeholder: "USDA",
      improvements: [
        "Program visibility",
        "Policy enforcement",
        "Data insights",
        "Cost savings",
        "Modernization goals"
      ]
    }
  ];

  return (
    <>
      <Script
        id="snap-modernization-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "GovernmentService",
            "name": "Monay SNAP/EBT Modernization Platform",
            "description": "Digital transformation platform for SNAP benefits with smart purchase controls, fraud prevention, and mobile access",
            "url": "https://www.monay.com/snap-modernization",
            "provider": {
              "@type": "Organization",
              "name": "Monay",
              "url": "https://www.monay.com"
            },
            "areaServed": "United States",
            "serviceType": "SNAP Benefits Modernization"
          })
        }}
      />
      
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <Navigation isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
        
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white py-20">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <span className="inline-block px-4 py-2 bg-white/20 backdrop-blur text-white text-sm font-semibold rounded-full mb-4">
                USDA COMPLIANT • FNS AUTHORIZED
              </span>
              
              <h1 className="text-5xl font-bold mb-4">
                SNAP/EBT Modernization
                <span className="block text-yellow-300">
                  21st Century Food Assistance
                </span>
              </h1>
              
              <p className="text-xl opacity-90 max-w-3xl mx-auto mb-8">
                Replace legacy EBT systems with programmable digital wallets. Instant issuance, 
                smart purchase controls, and real-time fraud prevention.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Link 
                  href="/government-rfp" 
                  className="inline-flex items-center justify-center px-8 py-4 font-semibold text-green-600 bg-white rounded-xl hover:bg-gray-100 transform hover:-translate-y-0.5 hover:shadow-xl transition-all duration-200"
                >
                  Request RFP Response
                </Link>
                <a 
                  href="mailto:snap@monay.com" 
                  className="inline-flex items-center justify-center px-8 py-4 font-semibold text-white bg-white/20 backdrop-blur border border-white/30 rounded-xl hover:bg-white/30 transform hover:-translate-y-0.5 hover:shadow-xl transition-all duration-200"
                >
                  Schedule Demo
                </a>
              </div>
              
              {/* Key Statistics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                {statistics.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-3xl font-bold">{stat.metric}</div>
                    <div className="text-sm opacity-90">{stat.description}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className={`text-4xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Next-Generation EBT Platform
              </h2>
              <p className={`text-xl ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Modern technology for essential nutrition programs
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className={`rounded-2xl p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300`}
                >
                  <div className={`w-20 h-20 rounded-xl bg-gradient-to-r ${feature.color} p-4 mb-4 text-white`}>
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

        {/* Modernization Features */}
        <section className={`py-20 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className={`text-4xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Comprehensive Modernization
              </h2>
              <p className={`text-xl ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Complete digital transformation of benefit delivery
              </p>
            </div>
            
            {/* Feature Tabs */}
            <div className="flex justify-center mb-8">
              <div className={`inline-flex rounded-xl ${isDarkMode ? 'bg-gray-900' : 'bg-white'} shadow-lg p-1`}>
                <button
                  onClick={() => setSelectedFeature("restrictions")}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                    selectedFeature === "restrictions"
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white'
                      : isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Purchase Controls
                </button>
                <button
                  onClick={() => setSelectedFeature("analytics")}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                    selectedFeature === "analytics"
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white'
                      : isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Analytics
                </button>
                <button
                  onClick={() => setSelectedFeature("integration")}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                    selectedFeature === "integration"
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white'
                      : isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Integration
                </button>
              </div>
            </div>
            
            {/* Selected Feature Content */}
            <div className="max-w-4xl mx-auto">
              <div className={`rounded-2xl ${isDarkMode ? 'bg-gray-900' : 'bg-white'} shadow-xl p-8`}>
                <h3 className={`text-2xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {currentFeature.title}
                </h3>
                <p className={`mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {currentFeature.description}
                </p>
                
                <div className="space-y-4">
                  {currentFeature.items.map((item, index) => (
                    <div 
                      key={index}
                      className={`flex items-center justify-between p-4 rounded-lg ${
                        isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
                      }`}
                    >
                      <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {item.label}
                      </span>
                      <span className="text-sm font-semibold text-green-600">
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Cost Comparison */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className={`text-4xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Cost Savings Analysis
              </h2>
              <p className={`text-xl ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Dramatic reduction in program administration costs
              </p>
            </div>
            
            <div className="max-w-5xl mx-auto">
              <div className={`rounded-2xl overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-xl`}>
                <table className="w-full">
                  <thead>
                    <tr className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <th className="px-6 py-4 text-left font-semibold">Feature</th>
                      <th className="px-6 py-4 text-center font-semibold">Traditional EBT</th>
                      <th className="px-6 py-4 text-center font-semibold text-green-600">Monay Platform</th>
                      <th className="px-6 py-4 text-right font-semibold text-blue-600">Savings</th>
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
                        <td className="px-6 py-4 text-right font-bold text-blue-600">
                          {row.savings}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* Implementation Timeline */}
        <section className={`py-20 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className={`text-4xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                12-Month Implementation Plan
              </h2>
              <p className={`text-xl ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Phased approach for seamless transition
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {implementationPhases.map((phase, index) => (
                <div 
                  key={index}
                  className={`rounded-2xl p-6 ${isDarkMode ? 'bg-gray-900' : 'bg-white'} shadow-xl`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-semibold text-green-600">{phase.phase}</span>
                    <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {phase.duration}
                    </span>
                  </div>
                  
                  <h3 className={`text-xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {phase.title}
                  </h3>
                  
                  <ul className={`space-y-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {phase.activities.map((activity, idx) => (
                      <li key={idx} className="flex items-start">
                        <svg className="w-4 h-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-sm">{activity}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits by Stakeholder */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className={`text-4xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Benefits for All Stakeholders
              </h2>
              <p className={`text-xl ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Improving outcomes across the entire ecosystem
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {benefits.map((benefit, index) => (
                <div 
                  key={index}
                  className={`rounded-2xl p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-xl`}
                >
                  <h3 className={`text-xl font-bold mb-4 text-green-600`}>
                    {benefit.stakeholder}
                  </h3>
                  <ul className="space-y-2">
                    {benefit.improvements.map((improvement, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {improvement}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className={`rounded-3xl bg-gradient-to-r from-green-600 to-emerald-600 p-12 text-center text-white`}>
              <h2 className="text-4xl font-bold mb-4">
                Modernize Your SNAP Program Today
              </h2>
              <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
                Join states leading the digital transformation of nutrition assistance 
                with lower costs, better outcomes, and improved recipient experience.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  href="/government-rfp" 
                  className="inline-flex items-center justify-center px-8 py-4 font-semibold text-green-600 bg-white rounded-xl hover:bg-gray-100 transform hover:-translate-y-0.5 hover:shadow-xl transition-all duration-200"
                >
                  Request RFP Package
                </Link>
                <a 
                  href="mailto:snap@monay.com?subject=SNAP Modernization Inquiry" 
                  className="inline-flex items-center justify-center px-8 py-4 font-semibold text-white bg-white/20 backdrop-blur border border-white/30 rounded-xl hover:bg-white/30 transform hover:-translate-y-0.5 hover:shadow-xl transition-all duration-200"
                >
                  Contact SNAP Team
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}