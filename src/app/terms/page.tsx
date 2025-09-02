"use client";

import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";

export default function TermsOfServicePage() {
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
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Navigation isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-center mb-4">
            Terms of Service
          </h1>
          <p className="text-xl text-center opacity-90">
            Last Updated: January 2025
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-8`}>
            
            <div className={`prose ${isDarkMode ? 'prose-invert' : ''} max-w-none`}>
              <p className={`mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                These Terms of Service ("Terms") govern your use of the Monay platform and services provided by Utilli, LLC (dba Tilli) ("Company", "we", "us", or "our"). By accessing or using our services, you agree to be bound by these Terms.
              </p>

              <h2 className={`text-2xl font-bold mt-8 mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>1. Acceptance of Terms</h2>
              <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                By accessing and using the Monay platform, including Monay ID (authentication services), Monay CaaS (Coin-as-a-Service), and Monay WaaS (Wallet-as-a-Service), you acknowledge that you have read, understood, and agree to be bound by these Terms and all applicable laws and regulations.
              </p>

              <h2 className={`text-2xl font-bold mt-8 mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>2. Description of Services</h2>
              <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Monay provides a comprehensive fintech platform that includes:
              </p>
              <ul className={`list-disc pl-6 mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <li>Voice-powered authentication services with custodian recovery</li>
                <li>Enterprise-grade stablecoin issuance and management</li>
                <li>Digital wallet infrastructure with card issuing and ATM access</li>
                <li>Dual-rail blockchain architecture (EVM L2 and Solana)</li>
                <li>Compliance and regulatory tools</li>
                <li>Payment processing and cross-border transaction services</li>
              </ul>

              <h2 className={`text-2xl font-bold mt-8 mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>3. User Accounts and Registration</h2>
              <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                To access certain features of our services, you must register for an account. You agree to:
              </p>
              <ul className={`list-disc pl-6 mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain and promptly update your account information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Notify us immediately of any unauthorized use</li>
              </ul>

              <h2 className={`text-2xl font-bold mt-8 mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>4. Acceptable Use Policy</h2>
              <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                You agree not to use our services to:
              </p>
              <ul className={`list-disc pl-6 mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <li>Violate any applicable laws or regulations</li>
                <li>Engage in money laundering, terrorist financing, or other illicit activities</li>
                <li>Infringe upon intellectual property rights</li>
                <li>Transmit malicious code or interfere with platform security</li>
                <li>Engage in fraudulent or deceptive practices</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Circumvent any access restrictions or security measures</li>
              </ul>

              <h2 className={`text-2xl font-bold mt-8 mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>5. Compliance and KYC/AML</h2>
              <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                You acknowledge and agree that:
              </p>
              <ul className={`list-disc pl-6 mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <li>We are required to comply with Know Your Customer (KYC) and Anti-Money Laundering (AML) regulations</li>
                <li>You will provide all necessary documentation for identity verification</li>
                <li>We may suspend or terminate accounts that fail compliance checks</li>
                <li>We report suspicious activities to relevant authorities as required by law</li>
              </ul>

              <h2 className={`text-2xl font-bold mt-8 mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>6. Fees and Payment</h2>
              <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Our fee structure is outlined on our pricing page and includes:
              </p>
              <ul className={`list-disc pl-6 mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <li>Monthly subscription fees based on usage tiers</li>
                <li>Transaction fees for payment processing</li>
                <li>Additional fees for premium features</li>
              </ul>
              <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                All fees are subject to change with 30 days' notice. You authorize us to charge your designated payment method for all applicable fees.
              </p>

              <h2 className={`text-2xl font-bold mt-8 mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>7. Intellectual Property</h2>
              <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                All content, features, and functionality of the Monay platform, including but not limited to text, graphics, logos, icons, images, audio clips, digital downloads, data compilations, and software, are the exclusive property of Utilli, LLC or its licensors and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
              </p>

              <h2 className={`text-2xl font-bold mt-8 mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>8. Data Privacy and Security</h2>
              <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Your use of our services is also governed by our Privacy Policy. We implement industry-standard security measures including:
              </p>
              <ul className={`list-disc pl-6 mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <li>AES-256 encryption for data at rest and in transit</li>
                <li>Hardware Security Module (HSM) key management</li>
                <li>PCI-DSS compliance for payment processing</li>
                <li>SOC2 Type II certification</li>
              </ul>

              <h2 className={`text-2xl font-bold mt-8 mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>9. Disclaimer of Warranties</h2>
              <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                THE SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED. TO THE FULLEST EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
              </p>

              <h2 className={`text-2xl font-bold mt-8 mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>10. Limitation of Liability</h2>
              <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, UTILLI, LLC SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.
              </p>

              <h2 className={`text-2xl font-bold mt-8 mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>11. Indemnification</h2>
              <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                You agree to indemnify, defend, and hold harmless Utilli, LLC, its officers, directors, employees, agents, and affiliates from and against any claims, liabilities, damages, losses, and expenses, including reasonable attorney's fees, arising out of or in any way connected with your access to or use of the services.
              </p>

              <h2 className={`text-2xl font-bold mt-8 mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>12. Termination</h2>
              <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                We may terminate or suspend your account and access to the services immediately, without prior notice or liability, for any reason, including but not limited to breach of these Terms. Upon termination, your right to use the services will cease immediately.
              </p>

              <h2 className={`text-2xl font-bold mt-8 mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>13. Governing Law and Jurisdiction</h2>
              <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                These Terms shall be governed by and construed in accordance with the laws of the State of Delaware, United States, without regard to its conflict of law provisions. Any legal action or proceeding arising under these Terms will be brought exclusively in the federal or state courts located in Delaware.
              </p>

              <h2 className={`text-2xl font-bold mt-8 mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>14. Changes to Terms</h2>
              <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                We reserve the right to modify these Terms at any time. We will provide notice of material changes by posting the updated Terms on our website and updating the "Last Updated" date. Your continued use of the services after such modifications constitutes your acceptance of the updated Terms.
              </p>

              <h2 className={`text-2xl font-bold mt-8 mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>15. Contact Information</h2>
              <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                If you have any questions about these Terms, please contact us at:
              </p>
              <div className={`pl-6 mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <p>Utilli, LLC (dba Tilli)</p>
                <p>Email: legal@monay.com</p>
                <p>Address: [Business Address]</p>
              </div>

              <div className={`mt-12 p-6 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg`}>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <strong>Effective Date:</strong> These Terms of Service are effective as of January 1, 2025.
                </p>
                <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <strong>Version:</strong> 1.0
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}