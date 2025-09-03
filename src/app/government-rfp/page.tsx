"use client";

import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Link from "next/link";
import Script from "next/script";

export default function GovernmentRFPPage() {
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

  const rfpCapabilities = [
    {
      title: "SNAP/EBT Modernization",
      description: "Replace legacy EBT systems with programmable wallets",
      color: "from-blue-500 to-indigo-500",
      features: ["MCC restrictions", "Real-time fraud detection", "Instant issuance", "Mobile-first"]
    },
    {
      title: "Emergency Relief Distribution",
      description: "Deploy disaster relief payments in hours, not weeks",
      color: "from-purple-500 to-pink-500",
      features: ["Instant deployment", "Geo-targeted", "Usage tracking", "No bank required"]
    },
    {
      title: "Education Savings Accounts",
      description: "$10K ESA accounts with spending controls",
      color: "from-green-500 to-emerald-500",
      features: ["School verification", "Category controls", "Parent oversight", "Tax reporting"]
    },
    {
      title: "Housing Assistance",
      description: "Direct rent payments with landlord verification",
      color: "from-orange-500 to-red-500",
      features: ["Landlord portal", "Auto-disbursement", "Audit trails", "Compliance built-in"]
    }
  ];

  const certifications = [
    "FedRAMP Ready (In Progress)",
    "StateRAMP Authorized",
    "SOC 2 Type II",
    "ISO 27001",
    "PCI DSS Level 1",
    "NIST 800-53 Compliant"
  ];

  const activeRFPs = [
    { state: "California", program: "CalFresh Modernization", value: "$2.5M", deadline: "Q1 2026" },
    { state: "Texas", program: "Disaster Relief Platform", value: "$1.8M", deadline: "Q4 2025" },
    { state: "Florida", program: "Education Freedom Wallets", value: "$3.2M", deadline: "Q1 2026" },
    { state: "Federal", program: "USDA SNAP Pilot", value: "$5M", deadline: "Q2 2026" }
  ];

  return (
    <>
      <Script
        id="government-rfp-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "GovernmentService",
            "name": "Monay Government RFP Solutions",
            "description": "GENIUS Act compliant digital payment platform for government benefit programs, emergency relief, and education savings accounts",
            "url": "https://www.monay.com/government-rfp",
            "provider": {
              "@type": "Organization",
              "name": "Monay",
              "url": "https://www.monay.com"
            },
            "areaServed": "United States",
            "serviceType": [
              "SNAP/EBT Modernization",
              "Emergency Relief Distribution",
              "Education Savings Accounts",
              "Housing Assistance Payments"
            ],
            "availableChannel": {
              "@type": "ServiceChannel",
              "serviceUrl": "https://www.monay.com/government-rfp",
              "servicePhone": "+1-888-MONAY",
              "availableLanguage": "English"
            }
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
                SAM.GOV REGISTERED • CAGE CODE: PENDING
              </span>
              
              <h1 className="text-5xl font-bold mb-4">
                Government RFP Solutions
                <span className="block text-yellow-300">
                  Digital Payments for Public Sector
                </span>
              </h1>
              
              <p className="text-xl opacity-90 max-w-3xl mx-auto mb-8">
                GENIUS Act compliant platform for benefit distribution, emergency relief, 
                and education savings accounts. Deploy in days, not months.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <a 
                  href="/contact?dept=Government&subject=RFP%20Response%20Request" 
                  className="inline-flex items-center justify-center px-8 py-4 font-semibold text-blue-600 bg-white rounded-xl hover:bg-gray-100 transform hover:-translate-y-0.5 hover:shadow-xl transition-all duration-200"
                >
                  Request RFP Response
                </a>
                <Link 
                  href="/solutions/government-programs" 
                  className="inline-flex items-center justify-center px-8 py-4 font-semibold text-white bg-white/20 backdrop-blur border border-white/30 rounded-xl hover:bg-white/30 transform hover:-translate-y-0.5 hover:shadow-xl transition-all duration-200"
                >
                  View Capabilities
                </Link>
              </div>
              
              {/* Key Stats Bar */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                <div className="text-center">
                  <div className="text-3xl font-bold">$500B</div>
                  <div className="text-sm opacity-90">Public Sector SAM</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">&lt;48hrs</div>
                  <div className="text-sm opacity-90">Deployment Time</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">90%</div>
                  <div className="text-sm opacity-90">Cost Reduction</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">50-State</div>
                  <div className="text-sm opacity-90">Coverage</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Active RFP Opportunities */}
        <section className={`py-16 ${isDarkMode ? 'bg-gradient-to-br from-blue-900/20 to-indigo-900/20' : 'bg-gradient-to-br from-blue-50 to-indigo-50'}`}>
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <span className="inline-block px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-sm font-semibold rounded-full mb-4">
                ACTIVE OPPORTUNITIES
              </span>
              <h2 className={`text-3xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Current RFPs We're Responding To
              </h2>
            </div>

            <div className="max-w-5xl mx-auto">
              <div className="overflow-x-auto">
                <table className={`w-full ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg`}>
                  <thead className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <tr>
                      <th className="px-6 py-4 text-left">Jurisdiction</th>
                      <th className="px-6 py-4 text-left">Program</th>
                      <th className="px-6 py-4 text-left">Contract Value</th>
                      <th className="px-6 py-4 text-left">Deadline</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeRFPs.map((rfp, index) => (
                      <tr key={index} className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                        <td className="px-6 py-4 font-medium">{rfp.state}</td>
                        <td className="px-6 py-4">{rfp.program}</td>
                        <td className="px-6 py-4 text-green-600 font-bold">{rfp.value}</td>
                        <td className="px-6 py-4">{rfp.deadline}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* Core Capabilities */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
                Purpose-Built for Government Programs
              </h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                {rfpCapabilities.map((capability, index) => (
                  <div key={index} className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'} shadow-lg`}>
                    <div className="flex items-center mb-4">
                      <div className={`w-12 h-12 bg-gradient-to-r ${capability.color} rounded-lg flex items-center justify-center mr-4`}>
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {capability.title}
                        </h3>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {capability.description}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {capability.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center">
                          <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Compliance & Certifications */}
        <section className={`py-20 ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-100'}`}>
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
                Federal & State Compliance
              </h2>
              
              <div className="grid md:grid-cols-3 gap-6 mb-12">
                {certifications.map((cert, index) => (
                  <div key={index} className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-900 border border-gray-700' : 'bg-white border border-gray-200'} shadow-md`}>
                    <div className="flex items-center">
                      <svg className="w-6 h-6 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{cert}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Key Differentiators */}
              <div className={`p-8 rounded-2xl ${isDarkMode ? 'bg-gradient-to-br from-blue-900/50 to-purple-900/50' : 'bg-gradient-to-br from-blue-50 to-purple-50'} border ${isDarkMode ? 'border-blue-700' : 'border-blue-200'}`}>
                <h3 className="text-2xl font-bold mb-6">Why Government Agencies Choose Monay</h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-bold mb-3">Speed to Deploy</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>48-hour emergency deployment capability</span>
                      </li>
                      <li className="flex items-start">
                        <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>No infrastructure required - cloud-native</span>
                      </li>
                      <li className="flex items-start">
                        <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Pre-integrated with federal systems</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-bold mb-3">Cost Efficiency</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>90% lower than legacy systems</span>
                      </li>
                      <li className="flex items-start">
                        <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Pay per active user, not capacity</span>
                      </li>
                      <li className="flex items-start">
                        <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>No upfront infrastructure costs</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Case Studies */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
                Use Cases & Implementations
              </h2>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                  <div className="text-4xl mb-4">🌪️</div>
                  <h3 className="text-xl font-bold mb-2">Hurricane Relief - Florida</h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
                    Deployed 50,000 relief wallets in 48 hours with geo-targeted assistance
                  </p>
                  <div className="text-sm">
                    <div className="flex justify-between mb-1">
                      <span>Deployment Time:</span>
                      <span className="font-bold text-green-600">48 hours</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cost Savings:</span>
                      <span className="font-bold text-green-600">85%</span>
                    </div>
                  </div>
                </div>
                
                <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                  <div className="text-4xl mb-4">🎓</div>
                  <h3 className="text-xl font-bold mb-2">Education Freedom - Arizona</h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
                    Managing 100,000+ ESA accounts with spending controls and compliance
                  </p>
                  <div className="text-sm">
                    <div className="flex justify-between mb-1">
                      <span>Active Accounts:</span>
                      <span className="font-bold text-blue-600">100,000+</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Fraud Reduction:</span>
                      <span className="font-bold text-green-600">95%</span>
                    </div>
                  </div>
                </div>
                
                <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                  <div className="text-4xl mb-4">🥗</div>
                  <h3 className="text-xl font-bold mb-2">SNAP Modernization - Pilot</h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
                    Digital-first SNAP benefits with real-time MCC controls and mobile access
                  </p>
                  <div className="text-sm">
                    <div className="flex justify-between mb-1">
                      <span>Processing Time:</span>
                      <span className="font-bold text-green-600">Instant</span>
                    </div>
                    <div className="flex justify-between">
                      <span>User Satisfaction:</span>
                      <span className="font-bold text-green-600">4.8/5</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className={`max-w-4xl mx-auto p-8 rounded-2xl ${isDarkMode ? 'bg-gradient-to-br from-gray-800 to-gray-900' : 'bg-gradient-to-br from-gray-50 to-white'} shadow-xl text-center`}>
              <h2 className="text-3xl font-bold mb-4">
                Ready to Modernize Your Payment Infrastructure?
              </h2>
              <p className={`mb-8 text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                We respond to all government RFPs within 48 hours. Our team has experience with 
                federal, state, and local procurement processes.
              </p>
              
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <h3 className="font-bold mb-2">Government Contact</h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Email: Contact Government Team<br/>
                    Phone: 1-888-MONAY-GOV<br/>
                    CAGE Code: [Pending]
                  </p>
                </div>
                
                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <h3 className="font-bold mb-2">Procurement Codes</h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    NAICS: 522320, 518210<br/>
                    PSC: D399, R499<br/>
                    GSA Schedule: Pending
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="/contact?dept=Government&subject=RFP%20Response%20Request" 
                  className="inline-flex items-center justify-center px-8 py-4 font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:from-blue-700 hover:to-purple-700 transform hover:-translate-y-0.5 hover:shadow-xl transition-all duration-200"
                >
                  Submit RFP for Response
                </a>
                <Link 
                  href="/signup" 
                  className={`inline-flex items-center justify-center px-8 py-4 font-semibold ${isDarkMode ? 'text-white bg-gray-700 hover:bg-gray-600' : 'text-gray-900 bg-gray-200 hover:bg-gray-300'} rounded-xl transform hover:-translate-y-0.5 hover:shadow-xl transition-all duration-200`}
                >
                  Schedule Demo
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
                <p className="text-xs mt-1">Government payment infrastructure provider.</p>
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