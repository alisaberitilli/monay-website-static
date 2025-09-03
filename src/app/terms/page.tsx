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
            Last Updated: January 27, 2025 | Version 2.0
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-8`}>
            
            <div className={`prose ${isDarkMode ? 'prose-invert' : ''} max-w-none`}>
              <p className={`mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                These Terms of Service ("Terms") govern your use of the Monay platform and services provided by Utilli, LLC (dba Tilli) ("Company", "we", "us", or "our"), including but not limited to Monay ID (identity and authentication services), Monay CaaS (Coin-as-a-Service), and Monay WaaS (Wallet-as-a-Service). By accessing or using our services, you acknowledge that you have read, understood, and agree to be bound by these Terms, our Privacy Policy, Anti-Money Laundering Policy, and all applicable laws and regulations.
              </p>

              <div className={`p-4 ${isDarkMode ? 'bg-blue-900/20 border-blue-500' : 'bg-blue-50 border-blue-200'} border-l-4 rounded mb-6`}>
                <p className={`text-sm ${isDarkMode ? 'text-blue-300' : 'text-blue-800'} font-semibold`}>
                  IMPORTANT NOTICE: Monay provides financial services that are subject to federal and state regulations. Use of our services requires compliance with all applicable laws, including but not limited to the Bank Secrecy Act, USA PATRIOT Act, and state money transmission laws.
                </p>
              </div>

              <h2 className={`text-2xl font-bold mt-8 mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>1. Acceptance of Terms and Eligibility</h2>
              <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                By accessing and using the Monay platform, you represent and warrant that:
              </p>
              <ul className={`list-disc pl-6 mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <li>You are at least 18 years of age (or the age of majority in your jurisdiction)</li>
                <li>You have the legal capacity to enter into these Terms</li>
                <li>You are not located in, under the control of, or a national or resident of any country subject to U.S. embargo or listed on any U.S. government list of prohibited or restricted parties</li>
                <li>You will comply with all applicable laws and regulations in your use of the services</li>
                <li>If acting on behalf of an entity, you have all necessary authority to bind that entity to these Terms</li>
              </ul>

              <h2 className={`text-2xl font-bold mt-8 mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>2. Description of Services</h2>
              <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Monay provides a comprehensive dual-rail blockchain financial services platform comprising:
              </p>
              
              <h3 className={`text-xl font-semibold mt-6 mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>2.1 Monay ID (Identity Services)</h3>
              <ul className={`list-disc pl-6 mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <li>Voice-powered biometric authentication with military-grade encryption</li>
                <li>Non-custodial identity management with custodian recovery options</li>
                <li>Multi-factor authentication and device management</li>
                <li>Compliance with NIST 800-63-3 authentication standards</li>
                <li>GDPR and CCPA compliant data handling</li>
              </ul>
              
              <h3 className={`text-xl font-semibold mt-6 mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>2.2 Monay CaaS (Coin-as-a-Service)</h3>
              <ul className={`list-disc pl-6 mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <li>Enterprise-grade stablecoin issuance on dual-rail blockchain (Base EVM L2 + Solana)</li>
                <li>ERC-3643 compliant token deployment with built-in compliance controls</li>
                <li>Treasury management and cross-rail atomic swaps</li>
                <li>Real-time supply tracking and regulatory reporting</li>
                <li>Multi-signature wallet controls and audit trails</li>
                <li>Integration with Business Rules Framework (BRF) for policy enforcement</li>
              </ul>
              
              <h3 className={`text-xl font-semibold mt-6 mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>2.3 Monay WaaS (Wallet-as-a-Service)</h3>
              <ul className={`list-disc pl-6 mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <li>White-label digital wallet infrastructure with customizable branding</li>
                <li>Virtual and physical card issuance (Visa/Mastercard)</li>
                <li>Cardless ATM access via QR/NFC with AllPoint network</li>
                <li>ACH, wire, and instant payment processing</li>
                <li>Apple Pay, Google Pay, and Samsung Pay integration</li>
                <li>POS transaction processing with MCC filtering</li>
                <li>Cross-border remittance and FX services</li>
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

              <h2 className={`text-2xl font-bold mt-8 mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>5. Regulatory Compliance and KYC/AML/OFAC</h2>
              
              <h3 className={`text-xl font-semibold mt-6 mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>5.1 Know Your Customer (KYC) Requirements</h3>
              <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                You acknowledge and agree that:
              </p>
              <ul className={`list-disc pl-6 mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <li>We are required by law to verify your identity before providing certain services</li>
                <li>You must provide accurate and complete information including but not limited to: full legal name, date of birth, residential address, government-issued ID, and tax identification number</li>
                <li>For business accounts: corporate documents, beneficial ownership information, and business licenses as required</li>
                <li>We may use third-party services (Persona, Alloy, Onfido) for identity verification</li>
                <li>You consent to periodic re-verification of your identity information</li>
              </ul>
              
              <h3 className={`text-xl font-semibold mt-6 mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>5.2 Anti-Money Laundering (AML) Compliance</h3>
              <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                In accordance with the Bank Secrecy Act and USA PATRIOT Act:
              </p>
              <ul className={`list-disc pl-6 mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <li>We maintain a comprehensive AML program including customer due diligence, transaction monitoring, and suspicious activity reporting</li>
                <li>We will file Suspicious Activity Reports (SARs) and Currency Transaction Reports (CTRs) as required by law</li>
                <li>You agree not to use our services for money laundering, terrorist financing, or any other illicit financial activities</li>
                <li>We reserve the right to delay, freeze, or refuse transactions that raise AML concerns</li>
                <li>You may be required to provide additional information about the source of funds and purpose of transactions</li>
              </ul>
              
              <h3 className={`text-xl font-semibold mt-6 mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>5.3 OFAC and Sanctions Compliance</h3>
              <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                You represent and warrant that:
              </p>
              <ul className={`list-disc pl-6 mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <li>You are not on any U.S. government sanctions list including the OFAC Specially Designated Nationals (SDN) list</li>
                <li>You are not located in or a resident of any sanctioned country (including but not limited to Cuba, Iran, North Korea, Syria, and the Crimea region)</li>
                <li>You will not use our services to transact with sanctioned individuals or entities</li>
                <li>We screen all users and transactions against OFAC and other sanctions lists</li>
                <li>We will block and report any attempted transactions involving sanctioned parties</li>
              </ul>
              
              <h3 className={`text-xl font-semibold mt-6 mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>5.4 Transaction Monitoring and Reporting</h3>
              <ul className={`list-disc pl-6 mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <li>All transactions are subject to real-time monitoring for suspicious patterns</li>
                <li>We employ machine learning and rule-based systems for fraud detection</li>
                <li>Transactions may be delayed or blocked pending compliance review</li>
                <li>We maintain records of all transactions for the period required by law (minimum 5 years)</li>
                <li>You consent to the sharing of your information with law enforcement when legally required</li>
              </ul>

              <h2 className={`text-2xl font-bold mt-8 mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>6. Risk Disclosures for Digital Assets</h2>
              <div className={`p-4 ${isDarkMode ? 'bg-yellow-900/20 border-yellow-500' : 'bg-yellow-50 border-yellow-200'} border-l-4 rounded mb-6`}>
                <p className={`font-semibold mb-2 ${isDarkMode ? 'text-yellow-300' : 'text-yellow-800'}`}>
                  IMPORTANT RISK WARNING:
                </p>
                <ul className={`list-disc pl-6 ${isDarkMode ? 'text-yellow-300' : 'text-yellow-700'} text-sm`}>
                  <li>Digital assets and cryptocurrencies are highly volatile and may lose value</li>
                  <li>Blockchain transactions are generally irreversible</li>
                  <li>Loss of private keys or authentication credentials may result in permanent loss of assets</li>
                  <li>Smart contract risks including bugs, exploits, or unintended behavior</li>
                  <li>Regulatory changes may affect the availability or value of digital assets</li>
                  <li>Network congestion may delay transactions or increase fees</li>
                  <li>Stablecoins may depeg from their intended value</li>
                </ul>
              </div>
              
              <h2 className={`text-2xl font-bold mt-8 mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>7. Fees and Payment</h2>
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

              <h2 className={`text-2xl font-bold mt-8 mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>8. Transaction Limits and Velocity Controls</h2>
              <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                To ensure security and regulatory compliance, we enforce the following limits:
              </p>
              <ul className={`list-disc pl-6 mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <li>Daily transaction limits based on account tier and verification level</li>
                <li>Monthly aggregate limits for transfers and withdrawals</li>
                <li>Velocity checks to prevent rapid successive transactions</li>
                <li>Geographic restrictions for certain transaction types</li>
                <li>Enhanced due diligence for transactions exceeding $10,000</li>
                <li>Automatic holds on unusual transaction patterns pending review</li>
              </ul>
              
              <h2 className={`text-2xl font-bold mt-8 mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>9. Intellectual Property</h2>
              <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                All content, features, and functionality of the Monay platform, including but not limited to text, graphics, logos, icons, images, audio clips, digital downloads, data compilations, and software, are the exclusive property of Utilli, LLC or its licensors and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
              </p>

              <h2 className={`text-2xl font-bold mt-8 mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>10. Data Privacy and Security</h2>
              <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Your use of our services is also governed by our Privacy Policy. We implement industry-standard security measures including:
              </p>
              <ul className={`list-disc pl-6 mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <li>AES-256 encryption for data at rest and in transit</li>
                <li>Hardware Security Module (HSM) key management</li>
                <li>PCI-DSS compliance for payment processing</li>
                <li>SOC2 Type II certification</li>
              </ul>

              <h2 className={`text-2xl font-bold mt-8 mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>11. Prohibited Activities</h2>
              <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                In addition to the Acceptable Use Policy, you specifically agree not to:
              </p>
              <ul className={`list-disc pl-6 mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <li>Engage in any form of market manipulation, wash trading, or artificial volume generation</li>
                <li>Use the services for illegal gambling, Ponzi schemes, or pyramid schemes</li>
                <li>Facilitate human trafficking, slavery, or forced labor in any form</li>
                <li>Trade in or finance illegal weapons, drugs, or contraband</li>
                <li>Evade taxes or assist others in tax evasion</li>
                <li>Engage in bribery, corruption, or facilitation payments</li>
                <li>Use the services to finance terrorism or violent extremism</li>
                <li>Violate export controls or trade sanctions</li>
                <li>Engage in predatory lending or usurious practices</li>
                <li>Create multiple accounts to circumvent limits or restrictions</li>
              </ul>
              
              <h2 className={`text-2xl font-bold mt-8 mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>12. Disclaimer of Warranties</h2>
              <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                THE SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED. TO THE FULLEST EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
              </p>

              <h2 className={`text-2xl font-bold mt-8 mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>13. Limitation of Liability</h2>
              <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, UTILLI, LLC SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.
              </p>

              <h2 className={`text-2xl font-bold mt-8 mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>14. Indemnification</h2>
              <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                You agree to indemnify, defend, and hold harmless Utilli, LLC, its officers, directors, employees, agents, and affiliates from and against any claims, liabilities, damages, losses, and expenses, including reasonable attorney's fees, arising out of or in any way connected with your access to or use of the services.
              </p>

              <h2 className={`text-2xl font-bold mt-8 mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>15. Account Termination and Suspension</h2>
              <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                We may terminate or suspend your account and access to the services immediately, without prior notice or liability, for any reason, including but not limited to breach of these Terms. Upon termination, your right to use the services will cease immediately.
              </p>

              <h2 className={`text-2xl font-bold mt-8 mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>16. Dispute Resolution and Arbitration</h2>
              <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <strong>PLEASE READ THIS SECTION CAREFULLY - IT AFFECTS YOUR LEGAL RIGHTS</strong>
              </p>
              <ul className={`list-disc pl-6 mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <li>Any dispute arising from these Terms shall first be subject to good faith negotiations for 30 days</li>
                <li>If unresolved, disputes shall be settled by binding arbitration under JAMS rules</li>
                <li>Arbitration shall be conducted in Montgomery County, Maryland with one arbitrator</li>
                <li>You waive any right to a jury trial or class action lawsuit</li>
                <li>Small claims court actions may be brought in your local jurisdiction for disputes under $10,000</li>
                <li>Injunctive relief may be sought in court for intellectual property violations</li>
              </ul>
              
              <h2 className={`text-2xl font-bold mt-8 mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>17. Governing Law and Jurisdiction</h2>
              <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                These Terms shall be governed by and construed in accordance with the laws of the State of Maryland, United States, without regard to its conflict of law provisions. Any legal action or proceeding arising under these Terms will be brought exclusively in the federal or state courts located in Montgomery County, Maryland.
              </p>

              <h2 className={`text-2xl font-bold mt-8 mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>18. Electronic Communications and Signatures</h2>
              <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                By using our services, you consent to:
              </p>
              <ul className={`list-disc pl-6 mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <li>Receive all communications from us electronically</li>
                <li>Electronic signatures being legally binding and enforceable</li>
                <li>Electronic records satisfying any legal requirement for written documentation</li>
                <li>Receiving notices via email or through your account dashboard</li>
              </ul>
              
              <h2 className={`text-2xl font-bold mt-8 mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>19. Force Majeure</h2>
              <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                We shall not be liable for any failure or delay in performance due to circumstances beyond our reasonable control, including but not limited to acts of God, natural disasters, war, terrorism, riots, embargoes, acts of civil or military authorities, fire, floods, pandemic, accidents, network infrastructure failures, strikes, or shortages of transportation facilities, fuel, energy, labor, or materials.
              </p>
              
              <h2 className={`text-2xl font-bold mt-8 mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>20. Changes to Terms</h2>
              <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                We reserve the right to modify these Terms at any time. We will provide notice of material changes by posting the updated Terms on our website and updating the "Last Updated" date. Your continued use of the services after such modifications constitutes your acceptance of the updated Terms.
              </p>

              <h2 className={`text-2xl font-bold mt-8 mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>21. Severability and Waiver</h2>
              <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                If any provision of these Terms is found to be unenforceable or invalid, that provision shall be limited or eliminated to the minimum extent necessary so that these Terms shall otherwise remain in full force and effect. Our failure to exercise or enforce any right or provision of these Terms shall not constitute a waiver of such right or provision.
              </p>
              
              <h2 className={`text-2xl font-bold mt-8 mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>22. Entire Agreement</h2>
              <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                These Terms, together with our Privacy Policy, Anti-Money Laundering Policy, and any other policies referenced herein, constitute the entire agreement between you and Utilli, LLC regarding the use of the Monay platform and supersede all prior agreements and understandings.
              </p>
              
              <h2 className={`text-2xl font-bold mt-8 mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>23. Contact Information</h2>
              <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                If you have any questions about these Terms, please contact us at:
              </p>
              <div className={`pl-6 mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <p><strong>Utilli, LLC (dba Tilli)</strong></p>
                <p><a href="/contact?dept=Legal">Contact Legal Team</a></p>
                <p>Compliance Inquiries: <a href="/contact?dept=Compliance">Contact Compliance</a></p>
                <p>Privacy Officer: <a href="/contact?dept=Privacy">Contact Privacy Officer</a></p>
                <p>Registered Agent: Maryland Registered Agent Service</p>
                <p>Address: 1997 Annapolis Exchange Parkway, Suite 300, Annapolis, MD 21401</p>
                <p>FinCEN MSB Registration Number: [Pending]</p>
              </div>

              <div className={`mt-12 p-6 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg`}>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <strong>Effective Date:</strong> These Terms of Service are effective as of January 27, 2025.
                </p>
                <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <strong>Version:</strong> 2.0
                </p>
                <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <strong>Regulatory Registrations:</strong> FinCEN MSB, State Money Transmitter Licenses (pending)
                </p>
                <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <strong>Compliance Standards:</strong> BSA, USA PATRIOT Act, OFAC, GDPR, CCPA, PCI-DSS, SOC2 Type II
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}