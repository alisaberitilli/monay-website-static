"use client";

import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import VtigerFormWrapperV3 from "@/components/VtigerFormWrapperV3";

export default function MonayCaaSSignupPage() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    company: '',
    country: 'United States',
    phone: '',
    tokenVolume: '',
    useCase: '',
    compliance: '',
    message: ''
  });

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode !== null) {
      setIsDarkMode(JSON.parse(savedDarkMode));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetFormData = () => {
    setFormData({
      email: '',
      firstName: '',
      lastName: '',
      company: '',
      country: 'United States',
      phone: '',
      tokenVolume: '',
      useCase: '',
      compliance: '',
      message: ''
    });
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Navigation isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-center mb-4">
            Launch Your Branded Stablecoin
          </h1>
          <p className="text-xl text-center opacity-90 max-w-2xl mx-auto">
            Enterprise-grade Coin-as-a-Service with dual-rail blockchain architecture. Deploy in days, not months.
          </p>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl p-8`}>
            {/* Product Features */}
            <div className="mb-8 grid md:grid-cols-3 gap-4">
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-purple-50'}`}>
                <div className="text-purple-600 mb-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className={`font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Dual-Rail Blockchain</h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Base L2 + Solana networks</p>
              </div>
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
                <div className="text-blue-600 mb-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className={`font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>ERC-3643 Compliant</h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Full regulatory compliance</p>
              </div>
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-green-50'}`}>
                <div className="text-green-600 mb-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className={`font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Treasury Management</h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Built-in liquidity controls</p>
              </div>
            </div>

            {/* Pricing Tiers */}
            <div className={`mb-8 p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <h3 className={`font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Enterprise Pricing</h3>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Pilot:</span>
                  <span className={`ml-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>$2,499/mo (75% off)</span>
                </div>
                <div>
                  <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Standard:</span>
                  <span className={`ml-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>$9,999/mo</span>
                </div>
                <div>
                  <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Enterprise:</span>
                  <span className={`ml-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Custom pricing</span>
                </div>
              </div>
            </div>

            {/* Sign Up Form */}
            <VtigerFormWrapperV3
              formData={formData}
              formType="Monay CaaS Signup"
              resetFormData={resetFormData}
              successMessage="Thank you! Our enterprise team will contact you within 24 hours to discuss your stablecoin requirements."
              submitButtonText="Apply for Pilot Program"
            >
              <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Join the Pilot Program</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="email" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Work Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-purple-500'
                    } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                    placeholder="you@company.com"
                  />
                </div>
                
                <div>
                  <label htmlFor="company" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Company Name *
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-purple-500'
                    } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                    placeholder="Your Company"
                  />
                </div>
                
                <div>
                  <label htmlFor="firstName" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    First Name *
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-purple-500'
                    } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                    placeholder="John"
                  />
                </div>
                
                <div>
                  <label htmlFor="lastName" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Last Name *
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-purple-500'
                    } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                    placeholder="Doe"
                  />
                </div>
                
                <div>
                  <label htmlFor="phone" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-purple-500'
                    } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
                
                <div>
                  <label htmlFor="tokenVolume" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Expected Token Volume *
                  </label>
                  <select
                    id="tokenVolume"
                    name="tokenVolume"
                    value={formData.tokenVolume}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 appearance-none cursor-pointer ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600 focus:border-purple-500 focus:bg-gray-700' 
                        : 'bg-white border-gray-200 text-gray-900 hover:border-gray-300 focus:border-purple-500'
                    } focus:outline-none focus:ring-0`}
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='${isDarkMode ? '%23ffffff' : '%23374151'}'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 0.75rem center',
                      backgroundSize: '1.5rem',
                      paddingRight: '2.5rem'
                    }}
                  >
                    <option value="">Select Volume Range</option>
                    <option value="0-1M">$0 - $1M</option>
                    <option value="1M-10M">$1M - $10M</option>
                    <option value="10M-50M">$10M - $50M</option>
                    <option value="50M-100M">$50M - $100M</option>
                    <option value="100M+">$100M+</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="useCase" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Primary Use Case *
                  </label>
                  <select
                    id="useCase"
                    name="useCase"
                    value={formData.useCase}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 appearance-none cursor-pointer ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600 focus:border-purple-500 focus:bg-gray-700' 
                        : 'bg-white border-gray-200 text-gray-900 hover:border-gray-300 focus:border-purple-500'
                    } focus:outline-none focus:ring-0`}
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='${isDarkMode ? '%23ffffff' : '%23374151'}'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 0.75rem center',
                      backgroundSize: '1.5rem',
                      paddingRight: '2.5rem'
                    }}
                  >
                    <option value="">Select Use Case</option>
                    <option value="corporate-treasury">Corporate Treasury</option>
                    <option value="payroll">Payroll & Benefits</option>
                    <option value="b2b-payments">B2B Payments</option>
                    <option value="remittance">Cross-border Remittance</option>
                    <option value="loyalty">Loyalty & Rewards</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="compliance" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Compliance Requirements *
                  </label>
                  <select
                    id="compliance"
                    name="compliance"
                    value={formData.compliance}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 appearance-none cursor-pointer ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600 focus:border-purple-500 focus:bg-gray-700' 
                        : 'bg-white border-gray-200 text-gray-900 hover:border-gray-300 focus:border-purple-500'
                    } focus:outline-none focus:ring-0`}
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='${isDarkMode ? '%23ffffff' : '%23374151'}'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 0.75rem center',
                      backgroundSize: '1.5rem',
                      paddingRight: '2.5rem'
                    }}
                  >
                    <option value="">Select Compliance Level</option>
                    <option value="basic">Basic KYC/AML</option>
                    <option value="enhanced">Enhanced Due Diligence</option>
                    <option value="institutional">Institutional Grade</option>
                    <option value="government">Government/Public Sector</option>
                  </select>
                </div>
              </div>
              
              <div className="mb-6">
                <label htmlFor="message" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Tell us about your stablecoin project
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={4}
                  className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-purple-500'
                  } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                  placeholder="Describe your token economics, target market, and timeline..."
                />
              </div>
            </VtigerFormWrapperV3>
            
            <p className={`mt-6 text-sm text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              By submitting, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}