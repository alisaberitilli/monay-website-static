"use client";

import { useState, useEffect } from "react";
import Navigation from "../../components/Navigation";
import Footer from "../../components/Footer";

export default function PrivacyPolicy() {
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className={`text-4xl font-bold mb-8 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Privacy Policy
        </h1>
        
        <div className={`prose prose-lg ${isDarkMode ? 'prose-invert' : ''} max-w-none`}>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-8`}>
            Effective Date: January 1, 2025
          </p>

          <section className="mb-8">
            <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              1. Introduction
            </h2>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              Utilli, LLC (dba Tilli) ("Monay," "we," "us," or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our dual-rail blockchain payment platform and related services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              2. Information We Collect
            </h2>
            <h3 className={`text-xl font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Personal Information
            </h3>
            <ul className={`list-disc pl-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              <li>Name and contact information (email, phone number, address)</li>
              <li>Government-issued identification for KYC compliance</li>
              <li>Date of birth and Social Security Number (where required)</li>
              <li>Financial information (bank account details, payment card information)</li>
              <li>Transaction history and wallet addresses</li>
              <li>Business information for enterprise clients</li>
            </ul>

            <h3 className={`text-xl font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Automatically Collected Information
            </h3>
            <ul className={`list-disc pl-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              <li>IP address and device information</li>
              <li>Browser type and operating system</li>
              <li>Usage data and analytics</li>
              <li>Cookies and similar tracking technologies</li>
              <li>Location data (with your consent)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              3. How We Use Your Information
            </h2>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              We use your information to:
            </p>
            <ul className={`list-disc pl-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              <li>Provide and maintain our services</li>
              <li>Process transactions and manage your account</li>
              <li>Verify your identity and comply with legal requirements</li>
              <li>Prevent fraud and enhance security</li>
              <li>Communicate with you about our services</li>
              <li>Improve our platform and develop new features</li>
              <li>Comply with legal and regulatory obligations</li>
              <li>Enforce our terms and conditions</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              4. Information Sharing and Disclosure
            </h2>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              We may share your information with:
            </p>
            <ul className={`list-disc pl-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              <li>Service providers and partners who assist in our operations</li>
              <li>Financial institutions for payment processing</li>
              <li>KYC/AML verification providers (Persona, Alloy, Onfido)</li>
              <li>Law enforcement and regulatory authorities as required</li>
              <li>Other parties with your consent</li>
              <li>Acquirers in the event of a merger or acquisition</li>
            </ul>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              We do not sell your personal information to third parties.
            </p>
          </section>

          <section className="mb-8">
            <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              5. Data Security
            </h2>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              We implement industry-standard security measures including:
            </p>
            <ul className={`list-disc pl-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              <li>AES-256 encryption for data at rest and in transit</li>
              <li>Hardware Security Module (HSM) key management</li>
              <li>Multi-factor authentication</li>
              <li>Regular security audits and penetration testing</li>
              <li>PCI-DSS compliance for payment card data</li>
              <li>SOC 2 Type II certification</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              6. Data Retention
            </h2>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              We retain your information for as long as necessary to provide our services and comply with legal obligations. Financial records are typically retained for seven years in accordance with regulatory requirements. You may request deletion of your account and associated data, subject to legal retention requirements.
            </p>
          </section>

          <section className="mb-8">
            <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              7. Your Rights and Choices
            </h2>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              Depending on your location, you may have the right to:
            </p>
            <ul className={`list-disc pl-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              <li>Access and receive a copy of your personal information</li>
              <li>Correct or update inaccurate information</li>
              <li>Delete your personal information (subject to legal requirements)</li>
              <li>Object to or restrict certain processing</li>
              <li>Data portability</li>
              <li>Withdraw consent where processing is based on consent</li>
              <li>Lodge a complaint with a supervisory authority</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              8. International Data Transfers
            </h2>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              Your information may be transferred to and processed in countries other than your country of residence. We ensure appropriate safeguards are in place for such transfers, including Standard Contractual Clauses and adequacy decisions.
            </p>
          </section>

          <section className="mb-8">
            <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              9. Children's Privacy
            </h2>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              Our services are not directed to individuals under 18 years of age. We do not knowingly collect personal information from children. If we become aware that we have collected information from a child, we will delete it.
            </p>
          </section>

          <section className="mb-8">
            <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              10. California Privacy Rights
            </h2>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              California residents have additional rights under the California Consumer Privacy Act (CCPA), including the right to know, delete, and opt-out of the sale of personal information. We do not sell personal information.
            </p>
          </section>

          <section className="mb-8">
            <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              11. Updates to This Policy
            </h2>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              We may update this Privacy Policy from time to time. We will notify you of material changes by posting the new policy on our website and updating the effective date. Your continued use of our services after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              12. Contact Us
            </h2>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              If you have questions about this Privacy Policy or our privacy practices, please contact us at:
            </p>
            <div className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <p>Utilli, LLC (dba Tilli)</p>
              <p>Privacy Office</p>
              <p>Email: privacy@monay.com</p>
              <p>Phone: 1-888-MONAY-00</p>
              <p>Address: [Corporate Address]</p>
            </div>
          </section>
        </div>
      </div>

      <Footer isDarkMode={isDarkMode} />
    </div>
  );
}