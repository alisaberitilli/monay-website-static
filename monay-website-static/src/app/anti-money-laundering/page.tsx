"use client";

import { useState, useEffect } from "react";
import Navigation from "../../components/Navigation";
import Footer from "../../components/Footer";

export default function AntiMoneyLaundering() {
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
          Anti-Money Laundering (AML) Policy
        </h1>
        
        <div className={`prose prose-lg ${isDarkMode ? 'prose-invert' : ''} max-w-none`}>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-8`}>
            Effective Date: January 1, 2025
          </p>

          <section className="mb-8">
            <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              1. Policy Statement
            </h2>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              Utilli, LLC (dba Tilli) operating as Monay is committed to the highest standards of Anti-Money Laundering (AML) compliance and Counter-Terrorist Financing (CTF) measures. This policy establishes our framework for detecting, preventing, and reporting money laundering activities in accordance with applicable laws and regulations.
            </p>
          </section>

          <section className="mb-8">
            <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              2. Regulatory Compliance
            </h2>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              Monay complies with all applicable AML laws and regulations including:
            </p>
            <ul className={`list-disc pl-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              <li>Bank Secrecy Act (BSA)</li>
              <li>USA PATRIOT Act</li>
              <li>FinCEN regulations and guidance</li>
              <li>Office of Foreign Assets Control (OFAC) sanctions</li>
              <li>State money transmission laws</li>
              <li>International AML standards set by FATF</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              3. Customer Due Diligence (CDD)
            </h2>
            <h3 className={`text-xl font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Know Your Customer (KYC)
            </h3>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              We implement robust KYC procedures for all customers including:
            </p>
            <ul className={`list-disc pl-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              <li>Identity verification using government-issued identification</li>
              <li>Address verification through reliable documentation</li>
              <li>Beneficial ownership identification for business accounts</li>
              <li>Enhanced due diligence for high-risk customers</li>
              <li>Ongoing monitoring and periodic reviews</li>
            </ul>

            <h3 className={`text-xl font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Risk Assessment
            </h3>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              We conduct risk assessments considering:
            </p>
            <ul className={`list-disc pl-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              <li>Customer type and business activities</li>
              <li>Geographic location and jurisdiction risks</li>
              <li>Product and service usage patterns</li>
              <li>Transaction volumes and frequencies</li>
              <li>Source of funds and wealth</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              4. Transaction Monitoring
            </h2>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              Our comprehensive transaction monitoring system includes:
            </p>
            <ul className={`list-disc pl-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              <li>Real-time transaction screening and analysis</li>
              <li>Automated alerts for suspicious patterns</li>
              <li>Velocity checks and threshold monitoring</li>
              <li>Cross-border transaction scrutiny</li>
              <li>Behavioral analysis and anomaly detection</li>
              <li>Regular rule tuning and optimization</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              5. Sanctions Screening
            </h2>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              We maintain comprehensive sanctions screening procedures:
            </p>
            <ul className={`list-disc pl-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              <li>Real-time screening against OFAC and international sanctions lists</li>
              <li>Politically Exposed Persons (PEP) screening</li>
              <li>Adverse media and negative news screening</li>
              <li>Regular rescreening of existing customers</li>
              <li>Immediate blocking of sanctioned parties</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              6. Suspicious Activity Reporting
            </h2>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              We maintain procedures for identifying and reporting suspicious activities:
            </p>
            <ul className={`list-disc pl-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              <li>Filing Suspicious Activity Reports (SARs) with FinCEN</li>
              <li>Currency Transaction Report (CTR) filing for applicable transactions</li>
              <li>Maintaining confidentiality of SAR filings</li>
              <li>Internal escalation and review processes</li>
              <li>Cooperation with law enforcement requests</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              7. Red Flags and Indicators
            </h2>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              We monitor for indicators of potential money laundering including:
            </p>
            <ul className={`list-disc pl-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              <li>Unusual transaction patterns or volumes</li>
              <li>Structuring transactions to avoid reporting thresholds</li>
              <li>Rapid movement of funds without clear purpose</li>
              <li>Use of multiple accounts or entities</li>
              <li>Reluctance to provide required information</li>
              <li>Transactions inconsistent with customer profile</li>
              <li>Geographic concerns or high-risk jurisdictions</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              8. Record Keeping
            </h2>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              We maintain comprehensive records in accordance with regulatory requirements:
            </p>
            <ul className={`list-disc pl-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              <li>Customer identification records retained for 5 years after account closure</li>
              <li>Transaction records maintained for 5 years</li>
              <li>SAR and CTR filing records kept for 5 years</li>
              <li>Training and compliance records</li>
              <li>Risk assessment documentation</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              9. Training and Awareness
            </h2>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              We provide comprehensive AML training to all relevant personnel:
            </p>
            <ul className={`list-disc pl-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              <li>Initial AML training for all new employees</li>
              <li>Annual refresher training</li>
              <li>Role-specific training for high-risk functions</li>
              <li>Updates on regulatory changes and emerging risks</li>
              <li>Testing and certification requirements</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              10. Governance and Oversight
            </h2>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              Our AML program includes:
            </p>
            <ul className={`list-disc pl-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              <li>Designated AML Compliance Officer</li>
              <li>Regular independent audits and testing</li>
              <li>Board and senior management oversight</li>
              <li>Periodic program reviews and updates</li>
              <li>Regulatory examination preparation</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              11. Cooperation with Authorities
            </h2>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              Monay maintains full cooperation with regulatory and law enforcement authorities including timely responses to subpoenas, court orders, and information requests while maintaining appropriate confidentiality and customer privacy protections.
            </p>
          </section>

          <section className="mb-8">
            <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              12. Contact Information
            </h2>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              For questions about our AML policy or to report suspicious activities:
            </p>
            <div className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <p>AML Compliance Officer</p>
              <p>Utilli, LLC (dba Tilli)</p>
              <p>Email: compliance@monay.com</p>
              <p>Phone: 1-888-MONAY-00</p>
              <p>Confidential Hotline: [Hotline Number]</p>
            </div>
          </section>
        </div>
      </div>

      <Footer isDarkMode={isDarkMode} />
    </div>
  );
}