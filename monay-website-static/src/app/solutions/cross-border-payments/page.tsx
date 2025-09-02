"use client";

import { useState, useEffect } from "react";
import Navigation from "../../../components/Navigation";
import Footer from "../../../components/Footer";

export default function CrossBorderPayments() {
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
              Cross-Border Payments
            </h1>
            <p className={`text-xl max-w-3xl mx-auto ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Send money globally in seconds, not days. Blockchain-powered remittances 
              with &lt;$1 fees to 150+ countries.
            </p>
          </div>
        </div>
      </section>

      {/* Key Benefits */}
      <section className={`py-16 ${isDarkMode ? 'bg-gray-800/50' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className={`text-3xl font-bold text-center mb-12 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Revolutionary Global Transfers
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Instant Settlement */}
            <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-900 border border-gray-700' : 'bg-gray-50 border border-gray-200'}`}>
              <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                60-Second Settlement
              </h3>
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Near-instant cross-border transfers. No correspondent banks, no SWIFT delays, no intermediary fees.
              </p>
            </div>

            {/* Low Fees */}
            <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-900 border border-gray-700' : 'bg-gray-50 border border-gray-200'}`}>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                &lt;$1 Flat Fee
              </h3>
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Fixed sub-dollar fees regardless of amount. 95% cheaper than traditional remittance services.
              </p>
            </div>

            {/* Global Coverage */}
            <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-900 border border-gray-700' : 'bg-gray-50 border border-gray-200'}`}>
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                150+ Countries
              </h3>
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Global reach with local payout options. Bank deposits, mobile money, cash pickup, and home delivery.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Corridors */}
      <section className={`py-16 ${isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className={`text-3xl font-bold text-center mb-12 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Popular Corridors
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* US to Mexico */}
            <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
              <div className="flex items-center mb-3">
                <span className="text-2xl mr-2">🇺🇸</span>
                <svg className="w-4 h-4 mx-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
                <span className="text-2xl ml-2">🇲🇽</span>
              </div>
              <h3 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                USA → Mexico
              </h3>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Instant delivery to OXXO, bank accounts, or debit cards. $0.50 flat fee.
              </p>
            </div>

            {/* US to India */}
            <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
              <div className="flex items-center mb-3">
                <span className="text-2xl mr-2">🇺🇸</span>
                <svg className="w-4 h-4 mx-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
                <span className="text-2xl ml-2">🇮🇳</span>
              </div>
              <h3 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                USA → India
              </h3>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Direct to UPI, bank accounts via IMPS/NEFT. Best exchange rates guaranteed.
              </p>
            </div>

            {/* US to Philippines */}
            <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
              <div className="flex items-center mb-3">
                <span className="text-2xl mr-2">🇺🇸</span>
                <svg className="w-4 h-4 mx-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
                <span className="text-2xl ml-2">🇵🇭</span>
              </div>
              <h3 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                USA → Philippines
              </h3>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                GCash, bank deposits, and cash pickup at 20,000+ locations.
              </p>
            </div>

            {/* Europe to Africa */}
            <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
              <div className="flex items-center mb-3">
                <span className="text-2xl mr-2">🇪🇺</span>
                <svg className="w-4 h-4 mx-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
                <span className="text-2xl ml-2">🌍</span>
              </div>
              <h3 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Europe → Africa
              </h3>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Mobile money to M-Pesa, MTN, Orange Money. 30+ African countries.
              </p>
            </div>

            {/* Canada to China */}
            <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
              <div className="flex items-center mb-3">
                <span className="text-2xl mr-2">🇨🇦</span>
                <svg className="w-4 h-4 mx-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
                <span className="text-2xl ml-2">🇨🇳</span>
              </div>
              <h3 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Canada → China
              </h3>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Alipay, WeChat Pay, and UnionPay cards. Same-day delivery.
              </p>
            </div>

            {/* UAE to Pakistan */}
            <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
              <div className="flex items-center mb-3">
                <span className="text-2xl mr-2">🇦🇪</span>
                <svg className="w-4 h-4 mx-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
                <span className="text-2xl ml-2">🇵🇰</span>
              </div>
              <h3 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                UAE → Pakistan
              </h3>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                JazzCash, Easypaisa, bank accounts. Shariah-compliant options.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className={`py-16 ${isDarkMode ? 'bg-gray-800/50' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className={`text-3xl font-bold text-center mb-12 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Enterprise Features
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {/* B2B Payments */}
            <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-900 border border-gray-700' : 'bg-gray-50 border border-gray-200'}`}>
              <h3 className={`text-xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                B2B Payments
              </h3>
              <ul className={`space-y-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Supplier payments globally</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Invoice financing</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Multi-currency accounts</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>FX hedging tools</span>
                </li>
              </ul>
            </div>

            {/* Payroll */}
            <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-900 border border-gray-700' : 'bg-gray-50 border border-gray-200'}`}>
              <h3 className={`text-xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Global Payroll
              </h3>
              <ul className={`space-y-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Batch payments to 100+ countries</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Contractor payments</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Tax compliance</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Expense reimbursements</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className={`py-16 ${isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className={`text-3xl font-bold text-center mb-12 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Monay vs Traditional Methods
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <th className={`text-left py-3 px-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}></th>
                  <th className={`text-center py-3 px-4 ${isDarkMode ? 'text-white' : 'text-gray-900'} font-bold`}>Monay</th>
                  <th className={`text-center py-3 px-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Banks</th>
                  <th className={`text-center py-3 px-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Traditional</th>
                </tr>
              </thead>
              <tbody>
                <tr className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <td className={`py-3 px-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Speed</td>
                  <td className={`text-center py-3 px-4 ${isDarkMode ? 'text-green-400' : 'text-green-600'} font-semibold`}>60 seconds</td>
                  <td className={`text-center py-3 px-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>3-5 days</td>
                  <td className={`text-center py-3 px-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>1-3 days</td>
                </tr>
                <tr className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <td className={`py-3 px-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Fees</td>
                  <td className={`text-center py-3 px-4 ${isDarkMode ? 'text-green-400' : 'text-green-600'} font-semibold`}>&lt;$1</td>
                  <td className={`text-center py-3 px-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>$25-50</td>
                  <td className={`text-center py-3 px-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>3-7%</td>
                </tr>
                <tr className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <td className={`py-3 px-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Transparency</td>
                  <td className={`text-center py-3 px-4 ${isDarkMode ? 'text-green-400' : 'text-green-600'} font-semibold`}>Real-time tracking</td>
                  <td className={`text-center py-3 px-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Limited</td>
                  <td className={`text-center py-3 px-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Minimal</td>
                </tr>
                <tr>
                  <td className={`py-3 px-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Coverage</td>
                  <td className={`text-center py-3 px-4 ${isDarkMode ? 'text-green-400' : 'text-green-600'} font-semibold`}>150+ countries</td>
                  <td className={`text-center py-3 px-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Limited</td>
                  <td className={`text-center py-3 px-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>200+ countries</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={`py-16 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className={`text-3xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Start Sending Money Globally
          </h2>
          <p className={`text-xl mb-8 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Join thousands of businesses saving millions on cross-border payments.
          </p>
          <div className="flex gap-4 justify-center">
            <a
              href="/signup"
              className="group relative inline-flex items-center justify-center px-8 py-4 font-semibold text-white transition-all duration-200 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl hover:from-green-700 hover:to-emerald-700 transform hover:-translate-y-0.5 hover:shadow-xl"
            >
              <span className="relative">Open Account</span>
            </a>
            <a
              href="/developers"
              className={`group relative inline-flex items-center justify-center px-8 py-4 font-semibold rounded-xl transition-all duration-200 ${
                isDarkMode 
                  ? 'bg-gray-800 text-white border-2 border-gray-700 hover:bg-gray-700' 
                  : 'bg-white text-gray-900 border-2 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <span className="relative">API Docs</span>
            </a>
          </div>
        </div>
      </section>

      <Footer isDarkMode={isDarkMode} />
    </div>
  );
}