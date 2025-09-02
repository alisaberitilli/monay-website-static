"use client";

import Image from "next/image";

interface FooterProps {
  isDarkMode: boolean;
}

export default function Footer({ isDarkMode }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-gray-100 border-gray-200'} border-t mt-20 transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Logo and Company Info */}
          <div className="space-y-4">
            <Image
              src="/Monay.svg"
              alt="MONAY Logo"
              width={120}
              height={40}
              className="h-10 w-auto"
            />
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Revolutionizing financial infrastructure with dual-rail blockchain technology.
            </p>
            <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              © {currentYear} Utilli, LLC (dba Tilli). All rights reserved.
            </p>
          </div>

          {/* Products */}
          <div>
            <h3 className={`font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Products</h3>
            <ul className="space-y-2">
              <li>
                <a href="/products/monay-id" className={`text-sm ${isDarkMode ? 'text-gray-400 hover:text-blue-400' : 'text-gray-600 hover:text-blue-600'} transition-colors`}>
                  Monay ID
                </a>
              </li>
              <li>
                <a href="/products/monay-caas" className={`text-sm ${isDarkMode ? 'text-gray-400 hover:text-blue-400' : 'text-gray-600 hover:text-blue-600'} transition-colors`}>
                  Monay CaaS
                </a>
              </li>
              <li>
                <a href="/products/monay-waas" className={`text-sm ${isDarkMode ? 'text-gray-400 hover:text-blue-400' : 'text-gray-600 hover:text-blue-600'} transition-colors`}>
                  Monay WaaS
                </a>
              </li>
            </ul>
          </div>

          {/* Solutions */}
          <div>
            <h3 className={`font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Solutions</h3>
            <ul className="space-y-2">
              <li>
                <a href="/solutions/government-programs" className={`text-sm ${isDarkMode ? 'text-gray-400 hover:text-blue-400' : 'text-gray-600 hover:text-blue-600'} transition-colors`}>
                  Government Programs
                </a>
              </li>
              <li>
                <a href="/solutions/banking-fintech" className={`text-sm ${isDarkMode ? 'text-gray-400 hover:text-blue-400' : 'text-gray-600 hover:text-blue-600'} transition-colors`}>
                  Banking & Fintech
                </a>
              </li>
              <li>
                <a href="/solutions/cross-border-payments" className={`text-sm ${isDarkMode ? 'text-gray-400 hover:text-blue-400' : 'text-gray-600 hover:text-blue-600'} transition-colors`}>
                  Cross-Border Payments
                </a>
              </li>
              <li>
                <a href="/solutions/compliance-brf" className={`text-sm ${isDarkMode ? 'text-gray-400 hover:text-blue-400' : 'text-gray-600 hover:text-blue-600'} transition-colors`}>
                  Compliance & BRF
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className={`font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Resources</h3>
            <ul className="space-y-2">
              <li>
                <a href="/developers" className={`text-sm ${isDarkMode ? 'text-gray-400 hover:text-blue-400' : 'text-gray-600 hover:text-blue-600'} transition-colors`}>
                  Developers
                </a>
              </li>
              <li>
                <a href="/pricing" className={`text-sm ${isDarkMode ? 'text-gray-400 hover:text-blue-400' : 'text-gray-600 hover:text-blue-600'} transition-colors`}>
                  Pricing
                </a>
              </li>
              <li>
                <a href="/why-monay" className={`text-sm ${isDarkMode ? 'text-gray-400 hover:text-blue-400' : 'text-gray-600 hover:text-blue-600'} transition-colors`}>
                  Why Monay?
                </a>
              </li>
              <li>
                <a href="/#pilot-program" className={`text-sm ${isDarkMode ? 'text-gray-400 hover:text-blue-400' : 'text-gray-600 hover:text-blue-600'} transition-colors`}>
                  Pilot Program
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className={`font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Legal</h3>
            <ul className="space-y-2">
              <li>
                <a href="/terms" className={`text-sm ${isDarkMode ? 'text-gray-400 hover:text-blue-400' : 'text-gray-600 hover:text-blue-600'} transition-colors`}>
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="/privacy" className={`text-sm ${isDarkMode ? 'text-gray-400 hover:text-blue-400' : 'text-gray-600 hover:text-blue-600'} transition-colors`}>
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/anti-money-laundering" className={`text-sm ${isDarkMode ? 'text-gray-400 hover:text-blue-400' : 'text-gray-600 hover:text-blue-600'} transition-colors`}>
                  Anti-Money Laundering Policy
                </a>
              </li>
              <li>
                <a href="/anti-slavery" className={`text-sm ${isDarkMode ? 'text-gray-400 hover:text-blue-400' : 'text-gray-600 hover:text-blue-600'} transition-colors`}>
                  Anti-Slavery & Anti-Trafficking Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className={`mt-8 pt-8 border-t ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Monay is a product of Utilli, LLC (dba Tilli)
            </div>
            <div className="flex space-x-6">
              <a href="mailto:support@monay.com" className={`text-sm ${isDarkMode ? 'text-gray-400 hover:text-blue-400' : 'text-gray-600 hover:text-blue-600'} transition-colors`}>
                support@monay.com
              </a>
              <a href="tel:+1-888-MONAY-00" className={`text-sm ${isDarkMode ? 'text-gray-400 hover:text-blue-400' : 'text-gray-600 hover:text-blue-600'} transition-colors`}>
                1-888-MONAY-00
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}