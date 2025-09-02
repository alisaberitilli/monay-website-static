"use client";

import { useState, useEffect } from "react";
import Navigation from "../../../components/Navigation";
import Footer from "../../../components/Footer";

export default function ComplianceBRF() {
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

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 to-gray-800 text-white' 
        : 'bg-gradient-to-br from-slate-50 to-blue-50 text-gray-900'
    }`}>
      <Navigation isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className={`text-5xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Compliance & Business Rules Framework
            </h1>
            <p className={`text-xl max-w-3xl mx-auto ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Enterprise-grade compliance engine with real-time business rules. 
              Configure complex policies without code changes.
            </p>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className={`py-16 ${isDarkMode ? 'bg-gray-800/50' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className={`text-3xl font-bold text-center mb-12 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Complete Compliance Orchestration
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* KYC/KYB */}
            <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-900 border border-gray-700' : 'bg-gray-50 border border-gray-200'}`}>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                </svg>
              </div>
              <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Automated KYC/KYB
              </h3>
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Multi-provider orchestration with Persona, Alloy, Onfido. Risk-based verification levels.
              </p>
            </div>

            {/* AML Monitoring */}
            <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-900 border border-gray-700' : 'bg-gray-50 border border-gray-200'}`}>
              <div className="w-12 h-12 bg-gradient-to-r from-red-600 to-orange-600 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Real-Time AML
              </h3>
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Transaction monitoring, sanctions screening, PEP checks. Automated SAR filing.
              </p>
            </div>

            {/* Business Rules */}
            <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-900 border border-gray-700' : 'bg-gray-50 border border-gray-200'}`}>
              <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Dynamic BRF Engine
              </h3>
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                No-code rule builder. Configure limits, restrictions, and workflows in real-time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* BRF Capabilities */}
      <section className={`py-16 ${isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className={`text-3xl font-bold text-center mb-12 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Business Rules Capabilities
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Transaction Controls */}
            <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
              <h3 className={`text-xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Transaction Controls
              </h3>
              <ul className={`space-y-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Velocity limits (hourly, daily, monthly)</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Amount thresholds per transaction type</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Geographic restrictions</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Time-based restrictions</span>
                </li>
              </ul>
            </div>

            {/* Merchant Controls */}
            <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
              <h3 className={`text-xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Merchant Controls
              </h3>
              <ul className={`space-y-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>MCC category restrictions</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Merchant whitelist/blacklist</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Subscription controls</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>ATM withdrawal limits</span>
                </li>
              </ul>
            </div>

            {/* User Management */}
            <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
              <h3 className={`text-xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                User Management
              </h3>
              <ul className={`space-y-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Role-based access control (RBAC)</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Multi-signature approvals</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Spending limits per user</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Department budgets</span>
                </li>
              </ul>
            </div>

            {/* Fraud Prevention */}
            <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
              <h3 className={`text-xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Fraud Prevention
              </h3>
              <ul className={`space-y-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>ML-based anomaly detection</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Device fingerprinting</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Behavioral biometrics</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Network analysis</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Compliance Features */}
      <section className={`py-16 ${isDarkMode ? 'bg-gray-800/50' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className={`text-3xl font-bold text-center mb-12 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Regulatory Compliance
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
              <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                BSA/USA PATRIOT Act
              </h4>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Full compliance with Bank Secrecy Act requirements
              </p>
            </div>

            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
              <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                OFAC Screening
              </h4>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Real-time sanctions and watchlist screening
              </p>
            </div>

            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
              <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                FinCEN Reporting
              </h4>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Automated SAR and CTR filing
              </p>
            </div>

            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
              <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                GDPR/CCPA
              </h4>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Data privacy and right to erasure
              </p>
            </div>

            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
              <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                PCI DSS
              </h4>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Level 1 compliant card data handling
              </p>
            </div>

            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
              <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                SOC 2 Type II
              </h4>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Annual security and availability audits
              </p>
            </div>

            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
              <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                FATF Guidelines
              </h4>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                International AML/CTF standards
              </p>
            </div>

            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
              <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Travel Rule
              </h4>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                FATF Travel Rule compliance for crypto
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Rule Builder */}
      <section className={`py-16 ${isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className={`text-3xl font-bold text-center mb-12 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            No-Code Rule Builder
          </h2>

          <div className={`p-8 rounded-xl ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
            <div className="space-y-6">
              {/* Rule Example */}
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                <div className="flex items-center mb-3">
                  <span className={`text-sm font-semibold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>IF</span>
                  <span className={`ml-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Transaction Amount</span>
                  <span className={`mx-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>&gt;</span>
                  <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>$10,000</span>
                </div>
                <div className="flex items-center mb-3">
                  <span className={`text-sm font-semibold ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>AND</span>
                  <span className={`ml-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>User Risk Score</span>
                  <span className={`mx-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>&gt;</span>
                  <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Medium</span>
                </div>
                <div className="flex items-center">
                  <span className={`text-sm font-semibold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>THEN</span>
                  <span className={`ml-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Require Manual Approval + Enhanced Due Diligence</span>
                </div>
              </div>

              <p className={`text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Create complex business rules with our visual editor. No coding required.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={`py-16 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className={`text-3xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Enterprise Compliance Made Simple
          </h2>
          <p className={`text-xl mb-8 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Configure complex compliance policies in minutes, not months.
          </p>
          <div className="flex gap-4 justify-center">
            <a
              href="/signup"
              className="group relative inline-flex items-center justify-center px-8 py-4 font-semibold text-white transition-all duration-200 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:from-blue-700 hover:to-indigo-700 transform hover:-translate-y-0.5 hover:shadow-xl"
            >
              <span className="relative">Request Demo</span>
            </a>
            <a
              href="/developers"
              className={`group relative inline-flex items-center justify-center px-8 py-4 font-semibold rounded-xl transition-all duration-200 ${
                isDarkMode 
                  ? 'bg-gray-800 text-white border-2 border-gray-700 hover:bg-gray-700' 
                  : 'bg-white text-gray-900 border-2 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <span className="relative">Documentation</span>
            </a>
          </div>
        </div>
      </section>

      <Footer isDarkMode={isDarkMode} />
    </div>
  );
}