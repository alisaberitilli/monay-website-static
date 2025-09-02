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
            Effective Date: January 27, 2025 | Version 2.0
          </p>

          <div className={`p-4 ${isDarkMode ? 'bg-blue-900/20 border-blue-500' : 'bg-blue-50 border-blue-200'} border-l-4 rounded mb-8`}>
            <p className={`text-sm ${isDarkMode ? 'text-blue-300' : 'text-blue-800'} font-semibold`}>
              Your privacy is fundamental to our mission. This Privacy Policy explains how Monay collects, uses, protects, and shares your information in compliance with GDPR, CCPA, and other global privacy regulations.
            </p>
          </div>

          <section className="mb-8">
            <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              1. Introduction and Scope
            </h2>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              Utilli, LLC (dba Tilli) ("Monay," "we," "us," or "our") operates a comprehensive financial services platform including Monay ID (identity services), Monay CaaS (Coin-as-a-Service), and Monay WaaS (Wallet-as-a-Service). This Privacy Policy applies to all personal information collected through our services, including our dual-rail blockchain infrastructure (Base EVM L2 and Solana).
            </p>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              By using our services, you acknowledge that you have read and understood this Privacy Policy. If you do not agree with our practices, please do not use our services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              2. Information We Collect
            </h2>
            
            <h3 className={`text-xl font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              2.1 Information You Provide Directly
            </h3>
            <ul className={`list-disc pl-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              <li><strong>Identity Information:</strong> Full legal name, date of birth, nationality, gender</li>
              <li><strong>Contact Information:</strong> Email address, phone number, residential and mailing addresses</li>
              <li><strong>Government Identifiers:</strong> Passport, driver's license, national ID, Social Security Number (SSN) or Tax Identification Number (TIN)</li>
              <li><strong>Financial Information:</strong> Bank account details, payment card information, cryptocurrency wallet addresses, transaction history</li>
              <li><strong>Biometric Data:</strong> Voice patterns for Monay ID authentication (with explicit consent)</li>
              <li><strong>Business Information:</strong> Company name, registration number, beneficial ownership, business licenses</li>
              <li><strong>Enhanced Due Diligence:</strong> Source of funds, occupation, expected transaction volume, purpose of account</li>
            </ul>

            <h3 className={`text-xl font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              2.2 Information Collected Automatically
            </h3>
            <ul className={`list-disc pl-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              <li><strong>Device Information:</strong> IP address, device ID, hardware model, operating system, browser type and version</li>
              <li><strong>Usage Data:</strong> Pages visited, features used, transaction patterns, click-through rates</li>
              <li><strong>Location Data:</strong> GPS location (with consent), IP-based location, time zone</li>
              <li><strong>Blockchain Data:</strong> Public wallet addresses, transaction hashes, smart contract interactions</li>
              <li><strong>Cookies and Tracking:</strong> Session cookies, persistent cookies, pixel tags, local storage</li>
              <li><strong>Security Data:</strong> Login attempts, authentication methods used, security event logs</li>
            </ul>

            <h3 className={`text-xl font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              2.3 Information from Third Parties
            </h3>
            <ul className={`list-disc pl-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              <li><strong>Identity Verification Services:</strong> Persona, Alloy, Onfido verification results</li>
              <li><strong>Credit and Risk Assessment:</strong> Credit bureau reports, fraud scores, risk ratings</li>
              <li><strong>Sanctions Screening:</strong> OFAC, UN, EU, and other sanctions list checks</li>
              <li><strong>Financial Partners:</strong> Transaction data from banks and payment processors</li>
              <li><strong>Blockchain Networks:</strong> Public blockchain transaction data</li>
              <li><strong>Marketing Partners:</strong> Lead generation and referral information</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              3. Legal Basis and Purpose of Processing
            </h2>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              We process your personal information based on the following legal grounds:
            </p>
            
            <h3 className={`text-xl font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              3.1 Contract Performance
            </h3>
            <ul className={`list-disc pl-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              <li>Creating and managing your account</li>
              <li>Processing transactions and payments</li>
              <li>Providing customer support</li>
              <li>Delivering requested services and features</li>
            </ul>

            <h3 className={`text-xl font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              3.2 Legal Obligations
            </h3>
            <ul className={`list-disc pl-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              <li>Complying with KYC/AML requirements under the Bank Secrecy Act and USA PATRIOT Act</li>
              <li>Filing Suspicious Activity Reports (SARs) and Currency Transaction Reports (CTRs)</li>
              <li>Responding to court orders, subpoenas, and law enforcement requests</li>
              <li>Meeting tax reporting obligations</li>
              <li>Maintaining records as required by financial regulations</li>
            </ul>

            <h3 className={`text-xl font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              3.3 Legitimate Interests
            </h3>
            <ul className={`list-disc pl-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              <li>Preventing fraud, money laundering, and terrorist financing</li>
              <li>Ensuring network and information security</li>
              <li>Improving our services and developing new features</li>
              <li>Conducting analytics and business intelligence</li>
              <li>Marketing our services (with opt-out options)</li>
            </ul>

            <h3 className={`text-xl font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              3.4 Consent
            </h3>
            <ul className={`list-disc pl-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              <li>Processing biometric data for authentication</li>
              <li>Sending promotional communications</li>
              <li>Using cookies and similar tracking technologies</li>
              <li>Sharing data with third parties beyond what is necessary for service provision</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              4. How We Share Your Information
            </h2>
            
            <h3 className={`text-xl font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              4.1 Service Providers
            </h3>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              We share information with carefully selected service providers who assist us in operating our platform:
            </p>
            <ul className={`list-disc pl-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              <li>Cloud infrastructure providers (AWS, Google Cloud)</li>
              <li>Identity verification services (Persona, Alloy, Onfido)</li>
              <li>Payment processors (TilliPay, banking partners)</li>
              <li>Blockchain infrastructure providers</li>
              <li>Customer support tools</li>
              <li>Analytics and monitoring services</li>
            </ul>

            <h3 className={`text-xl font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              4.2 Legal and Regulatory Disclosures
            </h3>
            <ul className={`list-disc pl-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              <li>Financial Crimes Enforcement Network (FinCEN)</li>
              <li>Office of Foreign Assets Control (OFAC)</li>
              <li>State financial regulators</li>
              <li>Law enforcement agencies with valid legal process</li>
              <li>Courts and tribunals</li>
              <li>Tax authorities</li>
            </ul>

            <h3 className={`text-xl font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              4.3 Business Transfers
            </h3>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              In the event of a merger, acquisition, bankruptcy, or sale of assets, your information may be transferred to the acquiring entity. We will provide notice before your information becomes subject to a different privacy policy.
            </p>

            <h3 className={`text-xl font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              4.4 With Your Consent
            </h3>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              We may share your information with other parties when you provide explicit consent, such as when you authorize third-party applications to access your account.
            </p>

            <div className={`p-4 ${isDarkMode ? 'bg-red-900/20 border-red-500' : 'bg-red-50 border-red-200'} border-l-4 rounded mb-4`}>
              <p className={`text-sm ${isDarkMode ? 'text-red-300' : 'text-red-800'} font-semibold`}>
                We NEVER sell your personal information to third parties for their marketing purposes.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              5. Data Security and Protection
            </h2>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              We implement comprehensive security measures to protect your information:
            </p>
            
            <h3 className={`text-xl font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              5.1 Technical Safeguards
            </h3>
            <ul className={`list-disc pl-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              <li>AES-256 encryption for data at rest</li>
              <li>TLS 1.3 encryption for data in transit</li>
              <li>Hardware Security Modules (HSM) for cryptographic key management</li>
              <li>Web Application Firewall (WAF) protection</li>
              <li>DDoS mitigation</li>
              <li>Intrusion detection and prevention systems</li>
              <li>Regular security vulnerability scanning</li>
              <li>Annual penetration testing by third-party security firms</li>
            </ul>

            <h3 className={`text-xl font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              5.2 Organizational Safeguards
            </h3>
            <ul className={`list-disc pl-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              <li>Role-based access controls (RBAC)</li>
              <li>Principle of least privilege</li>
              <li>Background checks for employees</li>
              <li>Regular security training</li>
              <li>Confidentiality agreements</li>
              <li>Incident response procedures</li>
              <li>Business continuity and disaster recovery plans</li>
            </ul>

            <h3 className={`text-xl font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              5.3 Compliance Certifications
            </h3>
            <ul className={`list-disc pl-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              <li>PCI-DSS Level 1 compliance for payment card data</li>
              <li>SOC 2 Type II certification</li>
              <li>ISO 27001 certification (in progress)</li>
              <li>NIST Cybersecurity Framework alignment</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              6. Data Retention and Deletion
            </h2>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              We retain your information for as long as necessary to fulfill the purposes outlined in this policy and comply with legal obligations:
            </p>
            <ul className={`list-disc pl-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              <li><strong>Account Information:</strong> Duration of account plus 7 years</li>
              <li><strong>Transaction Records:</strong> Minimum 5-7 years per regulatory requirements</li>
              <li><strong>KYC/AML Documentation:</strong> 5 years after account closure</li>
              <li><strong>Marketing Data:</strong> Until you opt-out or 3 years of inactivity</li>
              <li><strong>Security Logs:</strong> 1 year for general logs, 7 years for security incidents</li>
              <li><strong>Biometric Data:</strong> Until you revoke consent or close your account</li>
            </ul>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              Upon account closure, we will delete or anonymize your personal information except where retention is required by law or for legitimate business purposes such as fraud prevention.
            </p>
          </section>

          <section className="mb-8">
            <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              7. Your Privacy Rights
            </h2>
            
            <h3 className={`text-xl font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              7.1 Rights Available to All Users
            </h3>
            <ul className={`list-disc pl-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              <li><strong>Access:</strong> Request a copy of your personal information</li>
              <li><strong>Correction:</strong> Update or correct inaccurate information</li>
              <li><strong>Deletion:</strong> Request deletion subject to legal retention requirements</li>
              <li><strong>Portability:</strong> Receive your data in a machine-readable format</li>
              <li><strong>Opt-Out:</strong> Unsubscribe from marketing communications</li>
              <li><strong>Restriction:</strong> Limit processing of your information</li>
            </ul>

            <h3 className={`text-xl font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              7.2 GDPR Rights (European Economic Area, UK, Switzerland)
            </h3>
            <ul className={`list-disc pl-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              <li>Right to object to processing based on legitimate interests</li>
              <li>Right to withdraw consent at any time</li>
              <li>Right to lodge a complaint with supervisory authorities</li>
              <li>Right not to be subject to automated decision-making</li>
            </ul>

            <h3 className={`text-xl font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              7.3 CCPA Rights (California Residents)
            </h3>
            <ul className={`list-disc pl-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              <li>Right to know what personal information is collected</li>
              <li>Right to know if personal information is sold or disclosed</li>
              <li>Right to opt-out of sale (we do not sell personal information)</li>
              <li>Right to non-discrimination for exercising privacy rights</li>
              <li>Right to limit use of sensitive personal information</li>
            </ul>

            <h3 className={`text-xl font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              7.4 How to Exercise Your Rights
            </h3>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              To exercise any of these rights, please contact us at privacy@monay.com or through your account settings. We may need to verify your identity before processing your request. We will respond to your request within the timeframe required by applicable law (generally 30 days).
            </p>
          </section>

          <section className="mb-8">
            <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              8. International Data Transfers
            </h2>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              We operate globally and may transfer your information to countries outside your country of residence. When we transfer personal data internationally, we ensure appropriate safeguards are in place:
            </p>
            <ul className={`list-disc pl-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              <li>EU-approved Standard Contractual Clauses (SCCs)</li>
              <li>UK International Data Transfer Agreement (IDTA)</li>
              <li>Adequacy decisions where applicable</li>
              <li>Binding Corporate Rules for intra-group transfers</li>
              <li>Your explicit consent where required</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              9. Cookies and Tracking Technologies
            </h2>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              We use cookies and similar technologies to:
            </p>
            <ul className={`list-disc pl-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              <li><strong>Essential Cookies:</strong> Required for platform functionality and security</li>
              <li><strong>Performance Cookies:</strong> Help us understand how you use our services</li>
              <li><strong>Functionality Cookies:</strong> Remember your preferences and settings</li>
              <li><strong>Marketing Cookies:</strong> Used to deliver relevant advertisements (with consent)</li>
            </ul>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              You can manage cookie preferences through your browser settings or our cookie consent tool. Note that disabling certain cookies may impact functionality.
            </p>
          </section>

          <section className="mb-8">
            <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              10. Children's Privacy
            </h2>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              Our services are not directed to individuals under 18 years of age (or the age of majority in your jurisdiction). We do not knowingly collect personal information from minors. If we become aware that we have collected information from a minor without parental consent, we will promptly delete it.
            </p>
          </section>

          <section className="mb-8">
            <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              11. Biometric Data and Voice Authentication
            </h2>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              For Monay ID voice authentication services:
            </p>
            <ul className={`list-disc pl-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              <li>We collect voice patterns only with your explicit consent</li>
              <li>Voiceprints are converted to encrypted mathematical templates</li>
              <li>Original voice recordings are immediately deleted after processing</li>
              <li>Templates are stored using military-grade encryption</li>
              <li>You can delete your voiceprint at any time through account settings</li>
              <li>We never share biometric data with third parties except as required by law</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              12. Blockchain and Public Information
            </h2>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              Please note that blockchain transactions are public and permanent:
            </p>
            <ul className={`list-disc pl-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              <li>Transaction details on public blockchains (Ethereum, Solana) are visible to anyone</li>
              <li>We cannot delete or modify blockchain records</li>
              <li>Wallet addresses may be linked to your identity through our services</li>
              <li>We implement privacy-enhancing features where technically feasible</li>
              <li>Consider using privacy features like mixing services at your own risk</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              13. Third-Party Links and Services
            </h2>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              Our platform may contain links to third-party websites or services. We are not responsible for the privacy practices of these third parties. We encourage you to review their privacy policies before providing any personal information.
            </p>
          </section>

          <section className="mb-8">
            <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              14. Updates to This Privacy Policy
            </h2>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              We may update this Privacy Policy to reflect changes in our practices, technology, legal requirements, or for other operational reasons. We will notify you of material changes by:
            </p>
            <ul className={`list-disc pl-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              <li>Posting a notice on our platform</li>
              <li>Sending an email to your registered address</li>
              <li>Requiring acknowledgment for significant changes</li>
            </ul>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              Your continued use of our services after changes indicates acceptance of the updated policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              15. Contact Information and Data Protection Officer
            </h2>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              For privacy-related questions, requests, or complaints:
            </p>
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} p-4 rounded mb-4`}>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} font-semibold`}>Utilli, LLC (dba Tilli)</p>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Data Protection Officer</p>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Email: privacy@monay.com</p>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Email (GDPR): dpo@monay.com</p>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Phone: 1-888-MONAY-00</p>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Address: 1997 Annapolis Exchange Parkway, Suite 300, Annapolis, MD 21401</p>
            </div>
            
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              <strong>EU Representative:</strong><br/>
              [To be appointed]<br/>
              Email: eu-privacy@monay.com
            </p>
            
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              <strong>UK Representative:</strong><br/>
              [To be appointed]<br/>
              Email: uk-privacy@monay.com
            </p>
          </section>

          <div className={`mt-12 p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-lg`}>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>Last Updated:</strong> January 27, 2025
            </p>
            <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>Version:</strong> 2.0
            </p>
            <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>Privacy Framework Compliance:</strong> GDPR, CCPA, LGPD, PIPEDA, APPI
            </p>
          </div>
        </div>
      </div>

      <Footer isDarkMode={isDarkMode} />
    </div>
  );
}