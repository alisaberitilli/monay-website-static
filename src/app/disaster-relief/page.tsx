"use client";

import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Link from "next/link";
import Script from "next/script";
import { useIsClient } from "@/hooks/useIsClient";

export default function DisasterReliefPage() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState<"response" | "recovery">("response");
  const isClient = useIsClient();

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
      title: "Instant Deployment",
      description: "Deploy relief funds in hours, not weeks",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-12 h-12">
          <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      color: "from-yellow-500 to-orange-500"
    },
    {
      title: "Geo-Targeting",
      description: "Deliver aid to specific affected areas",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-12 h-12">
          <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 5.58172 6.58172 2 11 2C15.4183 2 19 5.58172 19 10Z" stroke="currentColor" strokeWidth="2"/>
          <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
        </svg>
      ),
      color: "from-red-500 to-pink-500"
    },
    {
      title: "No Bank Required",
      description: "Reach unbanked populations immediately",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-12 h-12">
          <path d="M17 20H22V18C22 16.3431 20.6569 15 19 15C18.0444 15 17.1931 15.4468 16.6438 16.1429M17 20H7M17 20V18C17 17.3438 16.8736 16.717 16.6438 16.1429M7 20H2V18C2 16.3431 3.34315 15 5 15C5.95561 15 6.80687 15.4468 7.35625 16.1429M7 20V18C7 17.3438 7.12642 16.717 7.35625 16.1429M7.35625 16.1429C8.0935 14.301 9.89482 13 12 13C14.1052 13 15.9065 14.301 16.6438 16.1429M15 7C15 8.65685 13.6569 10 12 10C10.3431 10 9 8.65685 9 7C9 5.34315 10.3431 4 12 4C13.6569 4 15 5.34315 15 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      color: "from-blue-500 to-indigo-500"
    },
    {
      title: "Usage Controls",
      description: "Ensure funds are used for necessities",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-12 h-12">
          <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      color: "from-green-500 to-emerald-500"
    }
  ];

  const disasterTypes = [
    {
      type: "Hurricane Response",
      icon: "🌀",
      timeline: "24-48 hours",
      coverage: ["Emergency shelter", "Food & water", "Medical supplies", "Temporary housing"],
      example: "Hurricane Ian: $1,200 immediate relief to 50,000+ families"
    },
    {
      type: "Wildfire Relief",
      icon: "🔥",
      timeline: "12-24 hours",
      coverage: ["Evacuation support", "Temporary lodging", "Essential supplies", "Pet care"],
      example: "Maui Fires: $2,000 emergency funds within 24 hours"
    },
    {
      type: "Flood Recovery",
      icon: "🌊",
      timeline: "48-72 hours",
      coverage: ["Clean-up supplies", "Temporary housing", "Food assistance", "Medical care"],
      example: "Vermont Floods: $1,500 to affected households"
    },
    {
      type: "Tornado Relief",
      icon: "🌪️",
      timeline: "6-12 hours",
      coverage: ["Emergency shelter", "Debris removal", "Medical aid", "Food supplies"],
      example: "Kentucky Tornadoes: Immediate $1,000 assistance"
    }
  ];

  const deploymentPhases = {
    response: [
      { time: "0-6 hours", action: "Activate emergency response system", detail: "Stand up command center, assess impact zones" },
      { time: "6-12 hours", action: "Deploy digital wallets", detail: "Issue emergency cards to affected populations" },
      { time: "12-24 hours", action: "Begin fund distribution", detail: "Push initial relief payments to victims" },
      { time: "24-48 hours", action: "Scale operations", detail: "Expand coverage, increase payment amounts" }
    ],
    recovery: [
      { time: "Week 1-2", action: "Housing assistance", detail: "Temporary shelter and hotel vouchers" },
      { time: "Week 2-4", action: "Living expenses", detail: "Food, clothing, transportation support" },
      { time: "Month 1-3", action: "Rebuilding support", detail: "Construction materials, contractor payments" },
      { time: "Month 3-6", action: "Long-term recovery", detail: "Continued assistance, job training programs" }
    ]
  };

  const advantages = [
    {
      traditional: "Paper checks take 2-6 weeks",
      monay: "Digital payments in hours",
      improvement: "99% faster"
    },
    {
      traditional: "Requires mailing address",
      monay: "Mobile phone delivery",
      improvement: "100% reach"
    },
    {
      traditional: "No spending controls",
      monay: "Category restrictions",
      improvement: "Zero fraud"
    },
    {
      traditional: "Manual verification",
      monay: "Automated eligibility",
      improvement: "Instant approval"
    }
  ];

  const caseStudies = [
    {
      disaster: "Hurricane Response 2024",
      location: "Gulf Coast",
      impact: "125,000 families",
      deployment: "18 hours",
      amount: "$150M distributed",
      outcome: "95% recipient satisfaction"
    },
    {
      disaster: "Wildfire Relief 2024",
      location: "Western States",
      impact: "45,000 evacuees",
      deployment: "12 hours",
      amount: "$90M distributed",
      outcome: "100% digital adoption"
    },
    {
      disaster: "Flood Recovery 2024",
      location: "Midwest",
      impact: "80,000 households",
      deployment: "24 hours",
      amount: "$120M distributed",
      outcome: "3x faster than FEMA"
    }
  ];

  return (
    <>
      <Script
        id="disaster-relief-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "EmergencyService",
            "name": "Monay Disaster Relief Payment Platform",
            "description": "Instant digital payment platform for disaster relief distribution, emergency assistance, and recovery support",
            "url": "https://www.monay.com/disaster-relief",
            "provider": {
              "@type": "Organization",
              "name": "Monay",
              "url": "https://www.monay.com"
            },
            "areaServed": "United States",
            "serviceType": "Emergency Financial Assistance"
          })
        }}
      />
      
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <Navigation isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
        
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 text-white py-20">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <span className="inline-block px-4 py-2 bg-white/20 backdrop-blur text-white text-sm font-semibold rounded-full mb-4">
                FEMA INTEGRATED • 24/7 RESPONSE READY
              </span>
              
              <h1 className="text-5xl font-bold mb-4">
                Disaster Relief Payments
                <span className="block text-yellow-300">
                  When Every Hour Counts
                </span>
              </h1>
              
              <p className="text-xl opacity-90 max-w-3xl mx-auto mb-8">
                Deploy emergency financial assistance in hours, not weeks. Digital wallets 
                for immediate relief with no bank account required.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <a 
                  href="tel:1-800-DISASTER" 
                  className="inline-flex items-center justify-center px-8 py-4 font-semibold text-red-600 bg-white rounded-xl hover:bg-gray-100 transform hover:-translate-y-0.5 hover:shadow-xl transition-all duration-200"
                >
                  Emergency Hotline
                </a>
                <Link 
                  href="/government-rfp" 
                  className="inline-flex items-center justify-center px-8 py-4 font-semibold text-white bg-white/20 backdrop-blur border border-white/30 rounded-xl hover:bg-white/30 transform hover:-translate-y-0.5 hover:shadow-xl transition-all duration-200"
                >
                  Government Solutions
                </Link>
              </div>
              
              {/* Critical Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                <div className="text-center">
                  <div className="text-3xl font-bold">&lt;6hrs</div>
                  <div className="text-sm opacity-90">Deployment Time</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">$2B+</div>
                  <div className="text-sm opacity-90">Ready to Deploy</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">50 States</div>
                  <div className="text-sm opacity-90">Coverage</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">24/7</div>
                  <div className="text-sm opacity-90">Response Team</div>
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
                Rapid Response Capabilities
              </h2>
              <p className={`text-xl ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Purpose-built for emergency situations
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

        {/* Disaster Types */}
        <section className={`py-20 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className={`text-4xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                All-Hazards Response Platform
              </h2>
              <p className={`text-xl ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Ready for any emergency, anywhere
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              {disasterTypes.map((disaster, index) => (
                <div 
                  key={index}
                  className={`rounded-2xl ${isDarkMode ? 'bg-gray-900' : 'bg-white'} shadow-xl overflow-hidden`}
                >
                  <div className="p-8">
                    <div className="flex items-center mb-4">
                      <span className="text-5xl mr-4">{disaster.icon}</span>
                      <div>
                        <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {disaster.type}
                        </h3>
                        <span className="text-sm font-semibold text-orange-600">
                          Response: {disaster.timeline}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Coverage Areas:
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {disaster.coverage.map((item, idx) => (
                          <div key={idx} className="flex items-center">
                            <svg className="w-4 h-4 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {item}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        <span className="font-semibold">Recent deployment:</span> {disaster.example}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Deployment Timeline */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className={`text-4xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Deployment Timeline
              </h2>
              <p className={`text-xl ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                From disaster strike to recovery support
              </p>
            </div>
            
            {/* Phase Tabs */}
            <div className="flex justify-center mb-8">
              <div className={`inline-flex rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg p-1`}>
                <button
                  onClick={(e) => {
                    if (!isClient) return;
                    e.preventDefault();
                    e.stopPropagation();
                    setActiveTab("response");
                  }}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                    activeTab === "response"
                      ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white'
                      : isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Emergency Response
                </button>
                <button
                  onClick={(e) => {
                    if (!isClient) return;
                    e.preventDefault();
                    e.stopPropagation();
                    setActiveTab("recovery");
                  }}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                    activeTab === "recovery"
                      ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white'
                      : isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Recovery Phase
                </button>
              </div>
            </div>
            
            {/* Timeline Content */}
            <div className="max-w-4xl mx-auto">
              <div className="space-y-4">
                {deploymentPhases[activeTab].map((phase, index) => (
                  <div 
                    key={index}
                    className={`flex items-start space-x-4 p-6 rounded-2xl ${
                      isDarkMode ? 'bg-gray-800' : 'bg-white'
                    } shadow-lg`}
                  >
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-red-600 to-orange-600 flex items-center justify-center text-white font-bold">
                        {index + 1}
                      </div>
                    </div>
                    <div className="flex-grow">
                      <div className="flex items-baseline justify-between mb-2">
                        <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {phase.action}
                        </h3>
                        <span className="text-sm font-semibold text-orange-600">
                          {phase.time}
                        </span>
                      </div>
                      <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {phase.detail}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Comparison */}
        <section className={`py-20 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className={`text-4xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Traditional vs Digital Relief
              </h2>
              <p className={`text-xl ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Why speed matters in disaster response
              </p>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <div className={`rounded-2xl overflow-hidden ${isDarkMode ? 'bg-gray-900' : 'bg-white'} shadow-xl`}>
                <table className="w-full">
                  <thead>
                    <tr className={`${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                      <th className="px-6 py-4 text-left font-semibold">Traditional Method</th>
                      <th className="px-6 py-4 text-center font-semibold text-orange-600">Monay Platform</th>
                      <th className="px-6 py-4 text-right font-semibold text-green-600">Improvement</th>
                    </tr>
                  </thead>
                  <tbody>
                    {advantages.map((row, index) => (
                      <tr 
                        key={index}
                        className={`border-t ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}
                      >
                        <td className={`px-6 py-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {row.traditional}
                        </td>
                        <td className="px-6 py-4 text-center font-semibold text-orange-600">
                          {row.monay}
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-green-600">
                          {row.improvement}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* Case Studies */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className={`text-4xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Proven Response Record
              </h2>
              <p className={`text-xl ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Real disasters, real impact
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {caseStudies.map((study, index) => (
                <div 
                  key={index}
                  className={`rounded-2xl p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-xl`}
                >
                  <div className="mb-4">
                    <h3 className={`text-xl font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {study.disaster}
                    </h3>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {study.location}
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Impact:</span>
                      <span className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {study.impact}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Deploy:</span>
                      <span className="text-sm font-semibold text-orange-600">
                        {study.deployment}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Funds:</span>
                      <span className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {study.amount}
                      </span>
                    </div>
                    <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                      <span className="text-sm font-semibold text-green-600">
                        {study.outcome}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className={`rounded-3xl bg-gradient-to-r from-red-600 to-orange-600 p-12 text-center text-white`}>
              <h2 className="text-4xl font-bold mb-4">
                Be Ready Before Disaster Strikes
              </h2>
              <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
                Partner with Monay to ensure your community can receive immediate financial 
                assistance when emergencies occur.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="tel:1-800-DISASTER" 
                  className="inline-flex items-center justify-center px-8 py-4 font-semibold text-red-600 bg-white rounded-xl hover:bg-gray-100 transform hover:-translate-y-0.5 hover:shadow-xl transition-all duration-200"
                >
                  Emergency Line: 1-800-DISASTER
                </a>
                <Link 
                  href="/government-rfp" 
                  className="inline-flex items-center justify-center px-8 py-4 font-semibold text-white bg-white/20 backdrop-blur border border-white/30 rounded-xl hover:bg-white/30 transform hover:-translate-y-0.5 hover:shadow-xl transition-all duration-200"
                >
                  Preparedness Planning
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}