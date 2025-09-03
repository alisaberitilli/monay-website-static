"use client";

import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import VtigerFormWrapperV3 from "@/components/VtigerFormWrapperV3";

export default function MonayWaaSSignupPage() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    company: '',
    country: 'United States',
    phone: '',
    walletCount: '',
    transactionVolume: '',
    features: [] as string[],
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

  const handleCheckboxChange = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
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
      walletCount: '',
      transactionVolume: '',
      features: [],
      message: ''
    });
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Navigation isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-center mb-4">
            Complete Wallet Infrastructure
          </h1>
          <p className="text-xl text-center opacity-90 max-w-2xl mx-auto">
            Digital wallets with cards, ATM access, and cross-border payments. Start free, scale infinitely.
          </p>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl p-8`}>
            {/* Product Features */}
            <div className="mb-8 grid md:grid-cols-3 gap-4">
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-green-50'}`}>
                <div className="text-green-600 mb-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <h3 className={`font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Card Issuing</h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Virtual & physical cards</p>
              </div>
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
                <div className="text-blue-600 mb-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h3 className={`font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>ATM Network</h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>55,000+ AllPoint ATMs</p>
              </div>
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-purple-50'}`}>
                <div className="text-purple-600 mb-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className={`font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Cross-border</h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>150+ countries, {'<'}$1 fees</p>
              </div>
            </div>

            {/* Pricing Tiers */}
            <div className={`mb-8 p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <h3 className={`font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Simple, Transparent Pricing</h3>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Starter:</span>
                  <span className={`ml-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Free up to 100 wallets</span>
                </div>
                <div>
                  <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Growth:</span>
                  <span className={`ml-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>$299/mo for 5K wallets</span>
                </div>
                <div>
                  <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Scale:</span>
                  <span className={`ml-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>$999/mo for unlimited</span>
                </div>
              </div>
            </div>

            {/* Sign Up Form */}
            <VtigerFormWrapperV3
              formData={formData}
              formType="Monay WaaS Signup"
              resetFormData={resetFormData}
              successMessage="Thank you! We'll contact you within 24 hours to set up your WaaS account."
              submitButtonText="Get Started Free"
            >
              <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Start Building Today</h2>
              
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
                        ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500' 
                        : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500'
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
                        ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500' 
                        : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500'
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
                        ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500' 
                        : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500'
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
                        ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500' 
                        : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500'
                    } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                    placeholder="Doe"
                  />
                </div>
                
                <div>
                  <label htmlFor="walletCount" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Expected Wallet Count *
                  </label>
                  <select
                    id="walletCount"
                    name="walletCount"
                    value={formData.walletCount}
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
                    <option value="">Select Wallet Range</option>
                    <option value="0-100">0 - 100 (Free Tier)</option>
                    <option value="100-1000">100 - 1,000</option>
                    <option value="1000-5000">1,000 - 5,000</option>
                    <option value="5000-10000">5,000 - 10,000</option>
                    <option value="10000+">10,000+</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="transactionVolume" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Monthly Transaction Volume *
                  </label>
                  <select
                    id="transactionVolume"
                    name="transactionVolume"
                    value={formData.transactionVolume}
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
                    <option value="0-10K">$0 - $10K</option>
                    <option value="10K-100K">$10K - $100K</option>
                    <option value="100K-1M">$100K - $1M</option>
                    <option value="1M-10M">$1M - $10M</option>
                    <option value="10M+">$10M+</option>
                  </select>
                </div>
              </div>
              
              {/* Feature Selection */}
              <div className="mb-6">
                <label className={`block text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Features You Need (check all that apply)
                </label>
                <div className="grid md:grid-cols-2 gap-3">
                  {[
                    'Virtual Cards',
                    'Physical Cards',
                    'ATM Access',
                    'Cross-border Payments',
                    'Apple/Google Pay',
                    'ACH Transfers',
                    'Wire Transfers',
                    'Crypto Support',
                    'Multi-currency',
                    'Business Accounts'
                  ].map(feature => (
                    <label key={feature} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.features.includes(feature)}
                        onChange={() => handleCheckboxChange(feature)}
                        className="mr-2 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                      <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {feature}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="mb-6">
                <label htmlFor="message" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Tell us about your use case
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={4}
                  className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500' 
                      : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500'
                  } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                  placeholder="Describe your wallet infrastructure needs and target users..."
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