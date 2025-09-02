"use client";

import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

export default function SecurityCompliancePage() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedTab, setSelectedTab] = useState('certifications');

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode !== null) {
      setIsDarkMode(JSON.parse(savedDarkMode));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const legacyCertifications = [
    { name: 'PCI-DSS', status: 'Active', description: 'Payment Card Industry Data Security Standard', icon: '🔒' },
    { name: 'ISO 27001', status: 'Active', description: 'Information Security Management System', icon: '🛡️' },
    { name: 'SOC 2', status: 'Active', description: 'Service Organization Control 2', icon: '✓' },
  ];

  const newPlatformStatus = [
    { name: 'PCI-DSS', status: 'Pending', target: 'Q2 2026', icon: '🔒' },
    { name: 'ISO 27001', status: 'Pending', target: 'Q2 2026', icon: '🛡️' },
    { name: 'SOC 2 Type II', status: 'Pending', target: 'Q3 2026', icon: '✓' },
    { name: 'FedRAMP', status: 'Evaluation', target: 'TBD', icon: '🏛️' },
    { name: 'State MTL', status: 'Evaluation', target: 'TBD', icon: '📜' },
  ];

  const securityFeatures = [
    { category: 'Encryption', features: ['AES-256 at rest', 'TLS 1.3 in transit', 'End-to-end encryption for sensitive data'] },
    { category: 'Key Management', features: ['HSM integration (planned)', 'Multi-signature wallets', 'Secure key rotation'] },
    { category: 'Access Control', features: ['Role-based access control (RBAC)', 'Multi-factor authentication', 'SSO/SAML integration'] },
    { category: 'Monitoring', features: ['Real-time threat detection', 'Audit logging', 'Anomaly detection'] },
    { category: 'Compliance', features: ['KYC/AML integration', 'Transaction monitoring', 'Sanctions screening'] },
    { category: 'Data Protection', features: ['GDPR compliance', 'Data residency controls', 'Right to erasure'] },
  ];

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <Navigation isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
      
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 opacity-90"></div>
        <div className="relative container mx-auto px-4 text-center text-white">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Security & Compliance
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto mb-8">
            Transparency in our security posture and compliance journey
          </p>
          <div className={`inline-block p-4 rounded-lg ${isDarkMode ? 'bg-yellow-900/30' : 'bg-yellow-500/20'} backdrop-blur border border-yellow-400/50`}>
            <p className="text-sm font-medium">
              <strong>Important:</strong> New platform (Monay ID, CaaS, WaaS) audits, certifications, and registrations are <strong>pending</strong>.
            </p>
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <section className={`sticky top-0 z-40 ${isDarkMode ? 'bg-gray-900' : 'bg-white'} border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto">
            {['certifications', 'security', 'compliance', 'faq'].map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`px-6 py-4 capitalize whitespace-nowrap transition-colors ${
                  selectedTab === tab
                    ? `border-b-2 border-blue-600 ${isDarkMode ? 'text-white' : 'text-gray-900'} font-semibold`
                    : `${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Certifications Tab */}
        {selectedTab === 'certifications' && (
          <div className="max-w-6xl mx-auto space-y-12">
            {/* Legacy Platform */}
            <div>
              <h2 className="text-3xl font-bold mb-2">Legacy Platform (Tilli / Monay Wallet)</h2>
              <p className={`mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Under Tilli, our legacy Monay Wallet holds the following certifications:
              </p>
              <div className="grid md:grid-cols-3 gap-6">
                {legacyCertifications.map((cert) => (
                  <div key={cert.name} className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-3xl">{cert.icon}</span>
                      <span className="px-3 py-1 bg-green-600 text-white rounded-full text-xs font-semibold">
                        {cert.status}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold mb-2">{cert.name}</h3>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {cert.description}
                    </p>
                  </div>
                ))}
              </div>
              <div className={`mt-6 p-4 rounded-lg ${isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50'} border ${isDarkMode ? 'border-blue-800' : 'border-blue-200'}`}>
                <p className={`text-sm ${isDarkMode ? 'text-blue-200' : 'text-blue-800'}`}>
                  <strong>Note:</strong> These certifications apply only to the legacy Monay Wallet under Tilli. 
                  They do not automatically apply to the new platform components.
                </p>
              </div>
            </div>

            {/* New Platform */}
            <div>
              <h2 className="text-3xl font-bold mb-2">New Platform (Monay ID, CaaS, WaaS)</h2>
              <p className={`mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Certification status for our new platform components:
              </p>
              <div className="overflow-x-auto">
                <table className={`w-full rounded-lg overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                  <thead className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <tr>
                      <th className="px-6 py-4 text-left font-semibold">Certification</th>
                      <th className="px-6 py-4 text-left font-semibold">Status</th>
                      <th className="px-6 py-4 text-left font-semibold">Target Date</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                    {newPlatformStatus.map((item) => (
                      <tr key={item.name}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{item.icon}</span>
                            <span className="font-medium">{item.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            item.status === 'Pending' 
                              ? 'bg-yellow-600 text-white' 
                              : 'bg-gray-600 text-white'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className={`px-6 py-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {item.target}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className={`mt-6 p-4 rounded-lg ${isDarkMode ? 'bg-yellow-900/20' : 'bg-yellow-50'} border ${isDarkMode ? 'border-yellow-800' : 'border-yellow-200'}`}>
                <p className={`text-sm ${isDarkMode ? 'text-yellow-200' : 'text-yellow-800'}`}>
                  <strong>Status:</strong> All audits, certifications, and registrations for the new platform are pending. 
                  Dates are estimates and subject to change based on audit outcomes and regulatory requirements.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {selectedTab === 'security' && (
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-8">Security Architecture</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {securityFeatures.map((category) => (
                <div key={category.category} className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                  <h3 className="text-xl font-bold mb-4 text-blue-600">{category.category}</h3>
                  <ul className="space-y-2">
                    {category.features.map((feature, index) => (
                      <li key={index} className={`flex items-start gap-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        <span className="text-green-500 mt-1">✓</span>
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className={`mt-8 p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
              <h3 className="text-xl font-bold mb-4">Data Protection Commitment</h3>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                We implement encryption in transit and at rest, maintain comprehensive audit logging, 
                and employ risk-based controls throughout our platform. Full compliance details will be 
                published as our audits conclude.
              </p>
            </div>
          </div>
        )}

        {/* Compliance Tab */}
        {selectedTab === 'compliance' && (
          <div className="max-w-6xl mx-auto space-y-8">
            <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
              <h2 className="text-2xl font-bold mb-4">Regulatory Posture</h2>
              <div className="space-y-4">
                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h3 className="font-semibold mb-2">Banking Status</h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    We are <strong>not a bank</strong> or bank holding company. We partner with regulated financial institutions 
                    for banking services.
                  </p>
                </div>
                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h3 className="font-semibold mb-2">Money Transmission</h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    We are <strong>not a licensed money transmitter</strong>. Product rollout may require additional 
                    regulatory authorizations and/or partnerships, which are in progress.
                  </p>
                </div>
                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h3 className="font-semibold mb-2">Stablecoin Support</h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Designed to support USDM and major stablecoins at the treasury layer (interoperability goal). 
                    Actual asset support will be announced upon completion of required reviews and agreements.
                  </p>
                </div>
              </div>
            </div>

            <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
              <h2 className="text-2xl font-bold mb-4">Compliance Framework</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">KYC/AML Providers</h3>
                  <ul className="space-y-2">
                    <li className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>• Persona (primary)</li>
                    <li className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>• Alloy (alternative)</li>
                    <li className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>• Onfido (alternative)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-3">Transaction Monitoring</h3>
                  <ul className="space-y-2">
                    <li className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>• Real-time fraud detection</li>
                    <li className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>• Velocity checks</li>
                    <li className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>• Sanctions screening</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FAQ Tab */}
        {selectedTab === 'faq' && (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                <h3 className="text-xl font-semibold mb-3">Are you a bank?</h3>
                <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <strong>No.</strong> We are not a bank or bank holding company. We partner with regulated 
                  financial institutions to provide banking services.
                </p>
              </div>

              <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                <h3 className="text-xl font-semibold mb-3">Are you a licensed money transmitter?</h3>
                <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <strong>No.</strong> We are not currently a licensed money transmitter. Regulatory authorizations 
                  are under evaluation and may be required for certain product features.
                </p>
              </div>

              <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                <h3 className="text-xl font-semibold mb-3">Do the legacy certifications apply to the new platform?</h3>
                <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <strong>No.</strong> The PCI-DSS, ISO 27001, and SOC 2 certifications held under Tilli for the 
                  legacy Monay Wallet do not automatically apply to the new platform components (Monay ID, CaaS, WaaS).
                </p>
              </div>

              <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                <h3 className="text-xl font-semibold mb-3">When will the new platform be certified?</h3>
                <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  We are targeting Q2-Q3 2026 for core certifications (PCI-DSS, ISO 27001, SOC 2 Type II). 
                  These dates are estimates and subject to change based on audit outcomes.
                </p>
              </div>

              <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                <h3 className="text-xl font-semibold mb-3">What blockchain networks do you support?</h3>
                <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <strong>Core rails:</strong> Base L2 + Solana. <strong>Optional:</strong> additional L2s 
                  (e.g., Polygon zkEVM) for specific pilots.
                </p>
              </div>

              <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                <h3 className="text-xl font-semibold mb-3">Which stablecoins do you support?</h3>
                <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  The platform is designed to support USDM and major stablecoins at the treasury layer 
                  (interoperability goal). Actual asset support will be announced upon completion of 
                  required reviews and agreements.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <section className={`py-8 border-t ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-100'}`}>
        <div className="container mx-auto px-4 text-center">
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            <strong>Last Updated:</strong> Sept 2, 2025 | Feature availability varies by program, tier, and region.
          </p>
        </div>
      </section>

      <Footer isDarkMode={isDarkMode} />
    </div>
  );
}