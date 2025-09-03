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
          Anti-Money Laundering (AML) and OFAC Compliance Policy
        </h1>
        
        <div className={`prose prose-lg ${isDarkMode ? 'prose-invert' : ''} max-w-none`}>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-8`}>
            Effective Date: January 27, 2025 | Version 2.0
          </p>

          <div className={`p-4 ${isDarkMode ? 'bg-red-900/20 border-red-500' : 'bg-red-50 border-red-200'} border-l-4 rounded mb-8`}>
            <p className={`text-sm ${isDarkMode ? 'text-red-300' : 'text-red-800'} font-semibold`}>
              IMPORTANT COMPLIANCE NOTICE: This policy is mandatory for all Monay services including Monay ID, CaaS, and WaaS. Violation of these policies may result in immediate account termination, reporting to law enforcement, and criminal prosecution.
            </p>
          </div>

          <section className="mb-8">
            <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              1. Policy Statement and Commitment
            </h2>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              Utilli, LLC (dba Tilli) operating as Monay ("Company," "we," "us," or "our") is committed to the highest standards of Anti-Money Laundering (AML) compliance, Counter-Terrorist Financing (CTF), and sanctions compliance. This comprehensive policy establishes our framework for preventing, detecting, and reporting money laundering, terrorist financing, and sanctions violations across all our services including:
            </p>
            <ul className={`list-disc pl-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              <li>Monay ID - Identity and authentication services</li>
              <li>Monay CaaS - Enterprise stablecoin issuance on dual-rail blockchain</li>
              <li>Monay WaaS - Digital wallet and payment services</li>
              <li>All associated payment rails and cross-border transactions</li>
            </ul>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              We maintain a zero-tolerance policy toward money laundering, terrorist financing, and sanctions violations. All employees, contractors, and partners must comply with this policy without exception.
            </p>
          </section>

          <section className="mb-8">
            <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              2. Regulatory Framework and Compliance
            </h2>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              Monay operates in strict compliance with all applicable laws and regulations including but not limited to:
            </p>
            
            <h3 className={`text-xl font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              2.1 United States Federal Requirements
            </h3>
            <ul className={`list-disc pl-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              <li>Bank Secrecy Act (BSA) - 31 USC 5311 et seq.</li>
              <li>USA PATRIOT Act - Title III provisions</li>
              <li>Money Laundering Control Act of 1986 - 18 USC 1956 and 1957</li>
              <li>Financial Crimes Enforcement Network (FinCEN) regulations - 31 CFR Chapter X</li>
              <li>Office of Foreign Assets Control (OFAC) sanctions programs - 31 CFR Parts 500-599</li>
              <li>Electronic Fund Transfer Act (EFTA) and Regulation E</li>
              <li>Trading with the Enemy Act (TWEA)</li>
              <li>International Emergency Economic Powers Act (IEEPA)</li>
            </ul>

            <h3 className={`text-xl font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              2.2 State Requirements
            </h3>
            <ul className={`list-disc pl-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              <li>Maryland Money Transmission Act</li>
              <li>State money transmitter licensing requirements</li>
              <li>State-specific AML and reporting obligations</li>
              <li>Multi-state licensing through NMLS</li>
            </ul>

            <h3 className={`text-xl font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              2.3 International Standards
            </h3>
            <ul className={`list-disc pl-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              <li>Financial Action Task Force (FATF) Recommendations</li>
              <li>Wolfsberg AML Principles</li>
              <li>EU 5th and 6th Anti-Money Laundering Directives (for EU operations)</li>
              <li>UN Security Council Resolutions on terrorist financing</li>
              <li>SWIFT CSP requirements for payment messaging</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              3. Customer Due Diligence (CDD) Program
            </h2>
            
            <h3 className={`text-xl font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              3.1 Know Your Customer (KYC) Requirements
            </h3>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              All customers must undergo comprehensive identity verification before accessing our services:
            </p>
            
            <h4 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Individual Customers
            </h4>
            <ul className={`list-disc pl-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              <li>Full legal name as it appears on government-issued ID</li>
              <li>Date of birth (must be 18+ or age of majority)</li>
              <li>Social Security Number (SSN) or Tax Identification Number (TIN)</li>
              <li>Current residential address (no P.O. boxes for primary address)</li>
              <li>Government-issued photo ID (passport, driver's license, national ID)</li>
              <li>Selfie verification for biometric matching</li>
              <li>Proof of address (utility bill, bank statement, lease agreement)</li>
              <li>Source of funds documentation for transactions over $10,000</li>
            </ul>

            <h4 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Business Customers (Know Your Business - KYB)
            </h4>
            <ul className={`list-disc pl-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              <li>Legal entity name and all DBAs</li>
              <li>Business registration number and jurisdiction</li>
              <li>Federal EIN or equivalent tax identification</li>
              <li>Certificate of incorporation or formation</li>
              <li>Operating agreement or bylaws</li>
              <li>Business license and permits</li>
              <li>Beneficial ownership information (25% or greater ownership)</li>
              <li>Control prong person identification</li>
              <li>Proof of business address</li>
              <li>Bank account verification</li>
              <li>Website and business model documentation</li>
            </ul>

            <h3 className={`text-xl font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              3.2 Enhanced Due Diligence (EDD)
            </h3>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              Enhanced due diligence is required for:
            </p>
            <ul className={`list-disc pl-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              <li>Politically Exposed Persons (PEPs) and their associates</li>
              <li>High-risk jurisdictions as designated by FATF or OFAC</li>
              <li>Money Service Businesses (MSBs) and Virtual Asset Service Providers (VASPs)</li>
              <li>Non-profit organizations and charities</li>
              <li>Customers with complex ownership structures</li>
              <li>Shell companies or entities with no apparent business purpose</li>
              <li>Transactions exceeding $50,000 per month</li>
              <li>Cross-border wire transfers</li>
              <li>Cryptocurrency exchanges and DeFi protocols</li>
            </ul>

            <h3 className={`text-xl font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              3.3 Customer Risk Rating
            </h3>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              Each customer is assigned a risk rating based on:
            </p>
            <ul className={`list-disc pl-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              <li><strong>Low Risk:</strong> Standard retail customers, verified employment, domestic transactions</li>
              <li><strong>Medium Risk:</strong> Small businesses, moderate transaction volumes, limited international activity</li>
              <li><strong>High Risk:</strong> MSBs, PEPs, high-risk jurisdictions, large transaction volumes</li>
              <li><strong>Prohibited:</strong> Sanctioned parties, shell companies without substance, illegal activities</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              4. OFAC and Sanctions Compliance
            </h2>
            
            <h3 className={`text-xl font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              4.1 Sanctions Screening Program
            </h3>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              We maintain a comprehensive sanctions screening program that includes:
            </p>
            <ul className={`list-disc pl-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              <li>Real-time screening against OFAC's Specially Designated Nationals (SDN) List</li>
              <li>Consolidated Sanctions List screening</li>
              <li>Sectoral Sanctions Identifications (SSI) List</li>
              <li>Foreign Sanctions Evaders (FSE) List</li>
              <li>EU consolidated sanctions list</li>
              <li>UN Security Council sanctions list</li>
              <li>UK HM Treasury sanctions list</li>
              <li>Country-based comprehensive sanctions programs (Cuba, Iran, North Korea, Syria, Crimea)</li>
            </ul>

            <h3 className={`text-xl font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              4.2 Prohibited Countries and Regions
            </h3>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              We do not provide services to individuals or entities located in:
            </p>
            <ul className={`list-disc pl-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              <li>Cuba</li>
              <li>Iran</li>
              <li>North Korea (DPRK)</li>
              <li>Syria</li>
              <li>Crimea, Donetsk, and Luhansk regions of Ukraine</li>
              <li>Any other jurisdiction subject to comprehensive OFAC sanctions</li>
            </ul>

            <h3 className={`text-xl font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              4.3 Sanctions Compliance Procedures
            </h3>
            <ul className={`list-disc pl-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              <li>Automated screening at account opening and for every transaction</li>
              <li>Daily rescreening of entire customer base against updated lists</li>
              <li>Fuzzy logic matching to catch name variations</li>
              <li>Manual review of potential matches by compliance team</li>
              <li>Immediate blocking of confirmed matches</li>
              <li>Filing of blocking reports with OFAC within 10 days</li>
              <li>Annual reports of blocked property to OFAC</li>
              <li>Retention of screening records for 5 years</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              5. Transaction Monitoring and Analysis
            </h2>
            
            <h3 className={`text-xl font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              5.1 Real-Time Monitoring Systems
            </h3>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              Our transaction monitoring system employs:
            </p>
            <ul className={`list-disc pl-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              <li>Machine learning algorithms for pattern recognition</li>
              <li>Rule-based scenarios for known typologies</li>
              <li>Behavioral analytics and peer group analysis</li>
              <li>Network analysis for related party transactions</li>
              <li>Geographic risk scoring</li>
              <li>Velocity checking (frequency and volume)</li>
              <li>Cross-product monitoring across all services</li>
            </ul>

            <h3 className={`text-xl font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              5.2 Red Flag Indicators
            </h3>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              We monitor for the following suspicious activity indicators:
            </p>
            
            <h4 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Structuring and Layering
            </h4>
            <ul className={`list-disc pl-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              <li>Multiple transactions just below $10,000 reporting threshold</li>
              <li>Rapid movement of funds between accounts</li>
              <li>Complex transaction chains with no apparent purpose</li>
              <li>Use of multiple accounts to circumvent limits</li>
            </ul>

            <h4 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Unusual Customer Behavior
            </h4>
            <ul className={`list-disc pl-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              <li>Reluctance to provide required information</li>
              <li>Providing false or misleading information</li>
              <li>Unusual concern about compliance procedures</li>
              <li>Requests to bypass normal procedures</li>
            </ul>

            <h4 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              High-Risk Transaction Patterns
            </h4>
            <ul className={`list-disc pl-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              <li>Large cash deposits followed by immediate transfers</li>
              <li>Transactions to/from high-risk jurisdictions</li>
              <li>Round-dollar amounts or repetitive transactions</li>
              <li>Dormant account suddenly active</li>
              <li>Transaction patterns inconsistent with stated business</li>
            </ul>

            <h4 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Cryptocurrency-Specific Indicators
            </h4>
            <ul className={`list-disc pl-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              <li>Transactions with mixing services or tumblers</li>
              <li>Deposits from or withdrawals to darknet markets</li>
              <li>Rapid conversion between multiple cryptocurrencies</li>
              <li>Use of privacy coins without clear business purpose</li>
              <li>Transactions with ransomware-associated addresses</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              6. Suspicious Activity Reporting (SAR)
            </h2>
            
            <h3 className={`text-xl font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              6.1 SAR Filing Requirements
            </h3>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              We file SARs with FinCEN for:
            </p>
            <ul className={`list-disc pl-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              <li>Transactions aggregating $5,000+ involving suspected money laundering</li>
              <li>Transactions aggregating $2,000+ involving suspected structuring</li>
              <li>Any transaction suspected to involve terrorist financing (no minimum)</li>
              <li>Suspected insider abuse involving any amount</li>
              <li>Transactions with no apparent lawful purpose</li>
            </ul>

            <h3 className={`text-xl font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              6.2 SAR Process and Timeline
            </h3>
            <ul className={`list-disc pl-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              <li>Detection: Automated alert or manual identification</li>
              <li>Investigation: Within 5 business days of detection</li>
              <li>Decision: Document decision to file or not file</li>
              <li>Filing: Within 30 calendar days of initial detection</li>
              <li>Continuing activity: File continuing SARs every 90 days</li>
              <li>Recordkeeping: Maintain SAR and supporting documentation for 5 years</li>
            </ul>

            <h3 className={`text-xl font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              6.3 SAR Confidentiality
            </h3>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              Federal law prohibits disclosure of SAR filing to any person involved in the transaction. Violations may result in civil and criminal penalties. Only authorized personnel with a need-to-know basis may access SAR information.
            </p>
          </section>

          <section className="mb-8">
            <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              7. Currency Transaction Reporting (CTR)
            </h2>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              We file Currency Transaction Reports for:
            </p>
            <ul className={`list-disc pl-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              <li>Cash transactions exceeding $10,000 in a single business day</li>
              <li>Multiple cash transactions aggregating over $10,000 by or on behalf of the same person</li>
              <li>Filing deadline: Within 15 days of the transaction</li>
              <li>Exemptions documented and reviewed annually</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              8. Recordkeeping Requirements
            </h2>
            
            <h3 className={`text-xl font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              8.1 Required Records and Retention Periods
            </h3>
            <ul className={`list-disc pl-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              <li><strong>Customer Identification Records:</strong> 5 years after account closure</li>
              <li><strong>Account Records:</strong> 5 years after account closure</li>
              <li><strong>Transaction Records:</strong> 5 years from transaction date</li>
              <li><strong>Wire Transfer Records:</strong> 5 years (including all originator and beneficiary information)</li>
              <li><strong>SAR Filings:</strong> 5 years from filing date</li>
              <li><strong>CTR Filings:</strong> 5 years from filing date</li>
              <li><strong>OFAC Screening Records:</strong> 5 years</li>
              <li><strong>Training Records:</strong> 5 years</li>
              <li><strong>Independent Testing Results:</strong> 5 years</li>
              <li><strong>Risk Assessments:</strong> Until superseded plus 5 years</li>
            </ul>

            <h3 className={`text-xl font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              8.2 Information Security
            </h3>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              All AML records are maintained with:
            </p>
            <ul className={`list-disc pl-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              <li>AES-256 encryption at rest and in transit</li>
              <li>Role-based access controls</li>
              <li>Audit logging of all access</li>
              <li>Secure backup and disaster recovery</li>
              <li>Physical and logical security controls</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              9. Employee Training and Awareness
            </h2>
            
            <h3 className={`text-xl font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              9.1 Training Requirements
            </h3>
            <ul className={`list-disc pl-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              <li><strong>New Hire Training:</strong> Within 30 days of employment</li>
              <li><strong>Annual Refresher:</strong> All employees annually</li>
              <li><strong>Role-Specific Training:</strong> For customer-facing and compliance staff</li>
              <li><strong>Updates Training:</strong> Within 30 days of regulatory changes</li>
              <li><strong>Testing:</strong> Minimum 80% passing score required</li>
            </ul>

            <h3 className={`text-xl font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              9.2 Training Topics
            </h3>
            <ul className={`list-disc pl-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              <li>AML/CFT laws and regulations</li>
              <li>OFAC sanctions programs</li>
              <li>Red flag identification</li>
              <li>Customer due diligence procedures</li>
              <li>SAR/CTR filing requirements</li>
              <li>Recordkeeping obligations</li>
              <li>Internal reporting procedures</li>
              <li>Consequences of non-compliance</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              10. Governance and Oversight Structure
            </h2>
            
            <h3 className={`text-xl font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              10.1 Three Lines of Defense
            </h3>
            <ul className={`list-disc pl-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              <li><strong>First Line:</strong> Business units implementing controls</li>
              <li><strong>Second Line:</strong> Compliance function providing oversight</li>
              <li><strong>Third Line:</strong> Internal audit providing independent assurance</li>
            </ul>

            <h3 className={`text-xl font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              10.2 AML Compliance Officer
            </h3>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              Our designated AML Compliance Officer has:
            </p>
            <ul className={`list-disc pl-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              <li>Full authority and resources to implement the AML program</li>
              <li>Direct reporting line to senior management and board</li>
              <li>Responsibility for program effectiveness</li>
              <li>Authority to freeze accounts and block transactions</li>
              <li>CAMS certification or equivalent qualification</li>
            </ul>

            <h3 className={`text-xl font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              10.3 Independent Testing
            </h3>
            <ul className={`list-disc pl-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              <li>Annual independent audit of AML program</li>
              <li>Conducted by qualified third party or internal audit</li>
              <li>Testing of internal controls and procedures</li>
              <li>Transaction testing and sampling</li>
              <li>Regulatory compliance assessment</li>
              <li>Findings reported directly to board</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              11. Cooperation with Law Enforcement
            </h2>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              We maintain full cooperation with law enforcement and regulatory authorities:
            </p>
            <ul className={`list-disc pl-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              <li>Timely response to subpoenas and court orders (within legal deadlines)</li>
              <li>314(a) information sharing requests (response within 2 weeks)</li>
              <li>314(b) voluntary information sharing with financial institutions</li>
              <li>Preservation of records upon request</li>
              <li>Assistance with investigations while maintaining customer privacy rights</li>
              <li>Designation of law enforcement liaison</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              12. Penalties for Non-Compliance
            </h2>
            
            <h3 className={`text-xl font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              12.1 Regulatory Penalties
            </h3>
            <ul className={`list-disc pl-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              <li>Civil Money Penalties up to $500,000 per violation</li>
              <li>Criminal penalties including imprisonment</li>
              <li>Loss of licenses and registrations</li>
              <li>Cease and desist orders</li>
              <li>Personal liability for executives and board members</li>
            </ul>

            <h3 className={`text-xl font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              12.2 Internal Disciplinary Actions
            </h3>
            <ul className={`list-disc pl-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              <li>Verbal or written warnings</li>
              <li>Suspension without pay</li>
              <li>Termination of employment</li>
              <li>Referral to law enforcement</li>
              <li>Personal liability for losses</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              13. Blockchain and Cryptocurrency Specific Requirements
            </h2>
            
            <h3 className={`text-xl font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              13.1 Blockchain Analytics
            </h3>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              For all blockchain transactions, we employ:
            </p>
            <ul className={`list-disc pl-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              <li>Chainalysis or similar blockchain analytics tools</li>
              <li>Risk scoring of wallet addresses</li>
              <li>Cluster analysis for related addresses</li>
              <li>Source of funds tracing</li>
              <li>Destination of funds monitoring</li>
              <li>Darknet market exposure analysis</li>
              <li>Mixer and tumbler detection</li>
            </ul>

            <h3 className={`text-xl font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              13.2 Travel Rule Compliance
            </h3>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              For cryptocurrency transfers over $3,000:
            </p>
            <ul className={`list-disc pl-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              <li>Collect and transmit originator information</li>
              <li>Collect and transmit beneficiary information</li>
              <li>Verify counterparty VASP compliance</li>
              <li>Implement FATF Travel Rule standards</li>
              <li>Maintain records for 5 years</li>
            </ul>

            <h3 className={`text-xl font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              13.3 DeFi and Smart Contract Risks
            </h3>
            <ul className={`list-disc pl-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              <li>Enhanced monitoring of DeFi protocol interactions</li>
              <li>Smart contract audit requirements for integrated protocols</li>
              <li>Flash loan detection and monitoring</li>
              <li>Governance token concentration analysis</li>
              <li>Cross-chain bridge transaction monitoring</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              14. Reporting Suspicious Activity
            </h2>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              If you observe suspicious activity or potential violations of this policy:
            </p>
            
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} p-4 rounded mb-4`}>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} font-semibold mb-2`}>Internal Reporting Channels:</p>
              <ul className={`list-disc pl-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <li>AML Compliance Officer: <a href="/contact?dept=Compliance">Contact AML Officer</a></li>
                <li>Anonymous Hotline: 1-800-XXX-XXXX</li>
                <li>Secure Web Portal: compliance.monay.com</li>
                <li>Direct Manager (unless involved)</li>
              </ul>
            </div>

            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              <strong>Whistleblower Protection:</strong> We maintain strict non-retaliation policies for good faith reporting. Whistleblowers may be eligible for rewards under federal programs.
            </p>
          </section>

          <section className="mb-8">
            <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              15. Contact Information
            </h2>
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} p-4 rounded`}>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} font-semibold`}>AML Compliance Department</p>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Utilli, LLC (dba Tilli)</p>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>1997 Annapolis Exchange Parkway, Suite 300</p>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Annapolis, MD 21401</p>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mt-2`}><a href="/contact?dept=Compliance">Contact Compliance</a></p>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Phone: 1-888-MONAY-00</p>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>24/7 Compliance Hotline: 1-800-XXX-XXXX</p>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mt-2`}>FinCEN MSB Registration: [Registration Number]</p>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>NMLS ID: [NMLS Number]</p>
            </div>
          </section>

          <div className={`mt-12 p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-lg`}>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>Last Updated:</strong> January 27, 2025
            </p>
            <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>Version:</strong> 2.0
            </p>
            <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>Next Review Date:</strong> July 27, 2025
            </p>
            <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>Policy Owner:</strong> Chief Compliance Officer
            </p>
            <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>Approved By:</strong> Board of Directors
            </p>
          </div>
        </div>
      </div>

      <Footer isDarkMode={isDarkMode} />
    </div>
  );
}