"use client";

import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Link from "next/link";
import Script from "next/script";

export default function EducationESAPage() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedState, setSelectedState] = useState<"florida" | "arizona" | "west_virginia" | "indiana">("florida");

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
      title: "Real-Time Verification",
      description: "Instant merchant and expense category validation",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-12 h-12">
          <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      color: "from-green-500 to-emerald-500"
    },
    {
      title: "Parent Portal",
      description: "Full visibility and control over education spending",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-12 h-12">
          <path d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="currentColor" strokeWidth="2"/>
          <path d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      color: "from-blue-500 to-indigo-500"
    },
    {
      title: "Approved Vendors",
      description: "Pre-verified education providers and merchants",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-12 h-12">
          <path d="M19 21L12 16L5 21V5C5 3.89543 5.89543 3 7 3H17C18.1046 3 19 3.89543 19 5V21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      color: "from-purple-500 to-pink-500"
    },
    {
      title: "Tax Compliance",
      description: "Automated 1099 reporting and audit trails",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-12 h-12">
          <path d="M9 7H6C4.89543 7 4 7.89543 4 9V18C4 19.1046 4.89543 20 6 20H18C19.1046 20 20 19.1046 20 18V9C20 7.89543 19.1046 7 18 7H15M9 7V5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5V7M9 7H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      color: "from-orange-500 to-red-500"
    }
  ];

  const statePrograms = {
    florida: {
      name: "Florida",
      program: "Family Empowerment Scholarship",
      amount: "$8,840",
      students: "173,000+",
      features: ["Private school tuition", "Tutoring services", "Educational therapies", "Testing fees"]
    },
    arizona: {
      name: "Arizona",
      program: "Empowerment Scholarship Account",
      amount: "$7,000",
      students: "61,000+",
      features: ["Private school", "Online learning", "Educational therapies", "College courses"]
    },
    west_virginia: {
      name: "West Virginia",
      program: "Hope Scholarship",
      amount: "$4,600",
      students: "5,000+",
      features: ["Private school", "Homeschool expenses", "Tutoring", "Educational therapies"]
    },
    indiana: {
      name: "Indiana",
      program: "Education Scholarship Account",
      amount: "$7,500",
      students: "Coming 2025",
      features: ["Private school tuition", "Online education", "Tutoring services", "Educational supplies"]
    }
  };

  const currentState = statePrograms[selectedState];

  const allowedCategories = [
    {
      category: "Private School Tuition",
      icon: "🏫",
      examples: ["K-12 private schools", "Religious schools", "Montessori programs"]
    },
    {
      category: "Tutoring Services",
      icon: "📚",
      examples: ["Math tutoring", "Reading specialists", "Test prep", "Language learning"]
    },
    {
      category: "Educational Therapies",
      icon: "🧠",
      examples: ["Speech therapy", "Occupational therapy", "Behavioral therapy", "ABA services"]
    },
    {
      category: "Curriculum & Materials",
      icon: "📖",
      examples: ["Textbooks", "Workbooks", "Educational software", "Science kits"]
    },
    {
      category: "Testing & Evaluation",
      icon: "📝",
      examples: ["Standardized tests", "AP exams", "College entrance exams", "Diagnostic assessments"]
    },
    {
      category: "Technology",
      icon: "💻",
      examples: ["Computers/tablets", "Educational apps", "Assistive technology", "Internet access"]
    }
  ];

  const complianceFeatures = [
    {
      title: "Automated Compliance",
      description: "Built-in state regulations and spending rules",
      metric: "100% compliant"
    },
    {
      title: "Real-Time Reporting",
      description: "Instant transaction reporting to state agencies",
      metric: "Live dashboard"
    },
    {
      title: "Fraud Prevention",
      description: "AI-powered transaction monitoring",
      metric: "99.9% accuracy"
    },
    {
      title: "Audit Trail",
      description: "Complete documentation for every transaction",
      metric: "7-year retention"
    }
  ];

  return (
    <>
      <Script
        id="education-esa-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "EducationalOrganization",
            "name": "Monay Education Savings Account Platform",
            "description": "Digital platform for managing Education Savings Accounts (ESA) with real-time verification, parent controls, and automated compliance",
            "url": "https://www.monay.com/education-esa",
            "provider": {
              "@type": "Organization",
              "name": "Monay",
              "url": "https://www.monay.com"
            },
            "areaServed": ["Florida", "Arizona", "West Virginia", "Indiana", "Iowa", "Utah"],
            "serviceType": "Education Savings Account Management"
          })
        }}
      />
      
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <Navigation isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
        
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-20">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <span className="inline-block px-4 py-2 bg-white/20 backdrop-blur text-white text-sm font-semibold rounded-full mb-4">
                $10K+ ESA ACCOUNTS • INSTANT ISSUANCE
              </span>
              
              <h1 className="text-5xl font-bold mb-4">
                Education Savings Accounts
                <span className="block text-yellow-300">
                  Empowering School Choice
                </span>
              </h1>
              
              <p className="text-xl opacity-90 max-w-3xl mx-auto mb-8">
                Digital wallets for education freedom. Manage $10,000+ ESA funds with 
                real-time verification, parent controls, and automated compliance.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Link 
                  href="/solutions/government-programs" 
                  className="inline-flex items-center justify-center px-8 py-4 font-semibold text-blue-600 bg-white rounded-xl hover:bg-gray-100 transform hover:-translate-y-0.5 hover:shadow-xl transition-all duration-200"
                >
                  Deploy ESA Program
                </Link>
                <a 
                  href="/contact?dept=Education" 
                  className="inline-flex items-center justify-center px-8 py-4 font-semibold text-white bg-white/20 backdrop-blur border border-white/30 rounded-xl hover:bg-white/30 transform hover:-translate-y-0.5 hover:shadow-xl transition-all duration-200"
                >
                  Schedule Demo
                </a>
              </div>
              
              {/* Key Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                <div className="text-center">
                  <div className="text-3xl font-bold">1M+</div>
                  <div className="text-sm opacity-90">ESA Students</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">$8B+</div>
                  <div className="text-sm opacity-90">Annual Funding</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">32</div>
                  <div className="text-sm opacity-90">States Active</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">90%</div>
                  <div className="text-sm opacity-90">Parent Satisfaction</div>
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
                Complete ESA Management Platform
              </h2>
              <p className={`text-xl ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Everything states need to launch and manage ESA programs
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

        {/* State Programs */}
        <section className={`py-20 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className={`text-4xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Active State Programs
              </h2>
              <p className={`text-xl ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Supporting education choice across America
              </p>
            </div>
            
            {/* State Selector */}
            <div className="flex justify-center mb-8">
              <div className={`inline-flex rounded-xl ${isDarkMode ? 'bg-gray-900' : 'bg-white'} shadow-lg p-1`}>
                {(Object.keys(statePrograms) as Array<keyof typeof statePrograms>).map((state) => (
                  <button
                    key={state}
                    onClick={() => setSelectedState(state)}
                    className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                      selectedState === state
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                        : isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {statePrograms[state].name}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Selected State Details */}
            <div className="max-w-4xl mx-auto">
              <div className={`rounded-2xl ${isDarkMode ? 'bg-gray-900' : 'bg-white'} shadow-xl p-8`}>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {currentState.program}
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Annual Amount:</span>
                        <span className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {currentState.amount}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Students Enrolled:</span>
                        <span className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {currentState.students}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Approved Uses:
                    </h4>
                    <ul className="space-y-2">
                      {currentState.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <svg className="w-5 h-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Allowed Categories */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className={`text-4xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Approved Spending Categories
              </h2>
              <p className={`text-xl ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Automated verification for all education expenses
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allowedCategories.map((category, index) => (
                <div 
                  key={index}
                  className={`rounded-2xl p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300`}
                >
                  <div className="flex items-center mb-4">
                    <span className="text-4xl mr-4">{category.icon}</span>
                    <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {category.category}
                    </h3>
                  </div>
                  <ul className={`space-y-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {category.examples.map((example, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="text-green-500 mr-2">•</span>
                        {example}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Compliance & Security */}
        <section className={`py-20 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className={`text-4xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Built-In Compliance & Security
              </h2>
              <p className={`text-xl ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Protecting taxpayer funds with advanced controls
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {complianceFeatures.map((feature, index) => (
                <div 
                  key={index}
                  className={`rounded-2xl p-6 ${isDarkMode ? 'bg-gray-900' : 'bg-white'} shadow-xl text-center`}
                >
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {feature.metric}
                  </div>
                  <h3 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {feature.title}
                  </h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Implementation Timeline */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className={`text-4xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Fast Implementation Timeline
              </h2>
              <p className={`text-xl ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Launch your ESA program in weeks, not months
              </p>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <div className="space-y-6">
                {[
                  { week: "Week 1-2", title: "Requirements & Configuration", description: "Define program rules, spending categories, and compliance requirements" },
                  { week: "Week 3-4", title: "System Integration", description: "Connect with state systems, vendor databases, and school directories" },
                  { week: "Week 5-6", title: "Parent Onboarding", description: "Launch parent portal, mobile apps, and support resources" },
                  { week: "Week 7-8", title: "Go Live", description: "Begin fund distribution and transaction processing" }
                ].map((phase, index) => (
                  <div 
                    key={index}
                    className={`flex items-start space-x-4 p-6 rounded-2xl ${
                      isDarkMode ? 'bg-gray-800' : 'bg-white'
                    } shadow-lg`}
                  >
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold">
                        {index + 1}
                      </div>
                    </div>
                    <div className="flex-grow">
                      <div className="flex items-baseline justify-between mb-2">
                        <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {phase.title}
                        </h3>
                        <span className={`text-sm font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {phase.week}
                        </span>
                      </div>
                      <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {phase.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className={`rounded-3xl bg-gradient-to-r from-blue-600 to-purple-600 p-12 text-center text-white`}>
              <h2 className="text-4xl font-bold mb-4">
                Ready to Empower Education Choice?
              </h2>
              <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
                Join states leading the education freedom movement with digital ESA wallets 
                that put parents in control.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  href="/government-rfp" 
                  className="inline-flex items-center justify-center px-8 py-4 font-semibold text-blue-600 bg-white rounded-xl hover:bg-gray-100 transform hover:-translate-y-0.5 hover:shadow-xl transition-all duration-200"
                >
                  View RFP Solutions
                </Link>
                <a 
                  href="/contact?dept=Education&subject=ESA%20Program%20Inquiry" 
                  className="inline-flex items-center justify-center px-8 py-4 font-semibold text-white bg-white/20 backdrop-blur border border-white/30 rounded-xl hover:bg-white/30 transform hover:-translate-y-0.5 hover:shadow-xl transition-all duration-200"
                >
                  Contact Education Team
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}