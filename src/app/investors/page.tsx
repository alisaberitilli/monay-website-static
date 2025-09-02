"use client";

import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";

export default function InvestorsPage() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedTab, setSelectedTab] = useState('overview');

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode !== null) {
      setIsDarkMode(JSON.parse(savedDarkMode));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const buildStatusData = [
    { name: 'Monay ID', progress: 78, status: 'Passkeys/WebAuthn, MFA, custodian recovery core', color: 'bg-green-600' },
    { name: 'CaaS', progress: 48, status: 'Treasury + interoperability design', color: 'bg-blue-600' },
    { name: 'WaaS (MVP)', progress: 66, status: 'Policy engine, refunds/returns, multi-role wallets', color: 'bg-purple-600' },
  ];

  const useCases = [
    {
      icon: '🏛️',
      title: 'Public Programs',
      description: 'Stipends, benefits, disaster relief, school funds — with merchant restrictions and auditable trails'
    },
    {
      icon: '⚡',
      title: 'Utilities & Billers',
      description: 'Refunds/credits, deposits, collections, with statementing and dunning'
    },
    {
      icon: '🏥',
      title: 'Healthcare & Payers',
      description: 'Member wallets, prior-auth spend, HIPAA-aligned patterns'
    },
    {
      icon: '🏢',
      title: 'Enterprises',
      description: 'Controlled employee spend, vendor payouts, rebates/loyalty'
    }
  ];

  const differentiators = [
    'Dual-rail architecture (Base L2 + Solana)',
    'Unified WaaS + CaaS platform',
    'Program-grade Business Rules Framework',
    'Everyday acceptance focus (cards & cash)',
    'Invoice First™ transaction model',
    'Compliance orchestration built-in',
    'Hybrid ledger + on-chain anchoring',
    'Treasury automation',
    'Multi-stakeholder wallets',
    'Built-in engagement (Nudge)',
    'Enterprise hooks (SSO/SAML, RBAC)',
    'Accessibility-first design'
  ];

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <Navigation isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 opacity-90"></div>
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative container mx-auto px-4 py-24">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Invest in Monay
            </h1>
            <p className="text-2xl md:text-3xl mb-4 font-light">
              Building the programmable money stack for the real world — with accuracy first.
            </p>
            <div className="flex flex-wrap justify-center gap-3 mt-8">
              <span className="px-4 py-2 bg-white/20 backdrop-blur rounded-full text-sm">Wallet-as-a-Service</span>
              <span className="px-4 py-2 bg-white/20 backdrop-blur rounded-full text-sm">Coin-as-a-Service</span>
              <span className="px-4 py-2 bg-white/20 backdrop-blur rounded-full text-sm">High-assurance Identity</span>
            </div>
          </div>
        </div>
      </section>

      {/* Status Disclosure */}
      <section className={`py-4 ${isDarkMode ? 'bg-yellow-900/20' : 'bg-yellow-50'} border-b ${isDarkMode ? 'border-yellow-800' : 'border-yellow-200'}`}>
        <div className="container mx-auto px-4">
          <div className={`flex items-start gap-3 ${isDarkMode ? 'text-yellow-200' : 'text-yellow-800'}`}>
            <span className="text-xl">⚠️</span>
            <p className="text-sm">
              <strong>Status Disclosure (Sept 2, 2025):</strong> Monay ID ~78% complete; CaaS ~48% complete; WaaS (MVP) ~66% complete. 
              Audits, certifications/registrations, partner integrations, and regression testing are pending. Feature availability varies by program, tier, and region.
            </p>
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <section className={`sticky top-0 z-40 ${isDarkMode ? 'bg-gray-900' : 'bg-white'} border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto">
            {['overview', 'product', 'progress', 'compliance', 'contact'].map((tab) => (
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

      {/* Content Sections */}
      <div className="container mx-auto px-4 py-12">
        {/* Overview Tab */}
        {selectedTab === 'overview' && (
          <div className="max-w-6xl mx-auto space-y-12">
            {/* The One-liner */}
            <div className={`p-8 rounded-2xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-xl`}>
              <h2 className="text-3xl font-bold mb-4">The One-liner</h2>
              <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Monay is <strong>building</strong> a single platform where institutions can <strong>issue a branded stablecoin</strong> and{' '}
                <strong>run controlled wallets</strong> that work in everyday contexts (tap-to-pay, e-commerce, and planned cash access) — with{' '}
                <strong>policy, compliance, and identity</strong> tied to every transaction.
              </p>
              <p className={`text-sm mt-4 italic ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                We are not a bank or licensed money transmitter. Product capabilities described include items in development and subject to change.
              </p>
            </div>

            {/* Why Now */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                <div className="text-3xl mb-4">🚀</div>
                <h3 className="text-xl font-bold mb-2">Programs need rails, not toolkits</h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Agencies, utilities, healthcare, and enterprises need ready-to-run money movement instead of SDK-only blocks.
                </p>
              </div>
              <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                <div className="text-3xl mb-4">📈</div>
                <h3 className="text-xl font-bold mb-2">Policy tailwinds</h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  U.S. initiatives around digital disbursements increase demand for controlled spending and auditability.
                </p>
              </div>
              <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                <div className="text-3xl mb-4">💳</div>
                <h3 className="text-xl font-bold mb-2">Real-world acceptance</h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Users expect to tap, shop, or withdraw cash without learning crypto. We abstract chain complexity.
                </p>
              </div>
            </div>

            {/* Use Cases */}
            <div>
              <h2 className="text-3xl font-bold mb-8">Use Cases We Aim to Serve</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {useCases.map((useCase, index) => (
                  <div key={index} className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg flex gap-4`}>
                    <div className="text-3xl">{useCase.icon}</div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">{useCase.title}</h3>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {useCase.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Product Tab */}
        {selectedTab === 'product' && (
          <div className="max-w-6xl mx-auto space-y-12">
            {/* What We're Building */}
            <div className={`p-8 rounded-2xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-xl`}>
              <h2 className="text-3xl font-bold mb-6">What We're Building</h2>
              <p className={`text-lg mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <strong>WaaS + CaaS + ID (one contract, one API) — in development:</strong>
              </p>
              
              <div className="space-y-6">
                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h3 className="text-xl font-bold mb-2 text-blue-600">Controlled wallets for everyday spend (WaaS)</h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Card issuing with just-in-time funding (planned), cash access via cardless ATM (planned), 
                    MCC/merchant/geo/time limits, refunds/returns/partials, multi-role wallets (guardian/beneficiary, employee/department).
                  </p>
                </div>

                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h3 className="text-xl font-bold mb-2 text-purple-600">Branded stablecoin issuance (CaaS)</h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Program treasuries, fiat↔stablecoin conversion, scheduled settlements, cross-rail rebalancing (prototype).
                  </p>
                </div>

                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h3 className="text-xl font-bold mb-2 text-green-600">Monay ID (enterprise identification & authentication)</h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    WebAuthn/passkeys, multi-modal biometrics, adaptive MFA, custodian-assisted recovery (multi-sig/time-lock), 
                    SSO/SAML/OIDC, risk scoring, audit logs.
                  </p>
                </div>

                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h3 className="text-xl font-bold mb-2 text-orange-600">Invoice First™ flows</h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Every transaction tied to a verified invoice for enterprise-grade reconciliation and audits.
                  </p>
                </div>
              </div>

              <div className={`mt-6 p-4 rounded-lg ${isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50'} border ${isDarkMode ? 'border-blue-800' : 'border-blue-200'}`}>
                <p className={`text-sm ${isDarkMode ? 'text-blue-200' : 'text-blue-800'}`}>
                  <strong>Stablecoin note:</strong> The platform is designed to support USDM and major stablecoins at the treasury layer, 
                  with the goal of interoperability. Actual asset support and counterparties will be announced upon completion of required reviews and agreements.
                </p>
              </div>
            </div>

            {/* How We're Different */}
            <div className={`p-8 rounded-2xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-xl`}>
              <h2 className="text-3xl font-bold mb-6">How We're Different</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {differentiators.map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <span className="text-blue-600 font-bold">{index + 1}.</span>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{item}</p>
                  </div>
                ))}
              </div>
              <p className={`text-sm mt-6 italic ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <strong>No partnership claims.</strong> We will only publicize partner names/logos after agreements are executed and live.
              </p>
            </div>
          </div>
        )}

        {/* Progress Tab */}
        {selectedTab === 'progress' && (
          <div className="max-w-6xl mx-auto space-y-12">
            {/* Build Status */}
            <div className={`p-8 rounded-2xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-xl`}>
              <h2 className="text-3xl font-bold mb-6">Build Status (Sept 2, 2025)</h2>
              <div className="space-y-6">
                {buildStatusData.map((item) => (
                  <div key={item.name}>
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-xl font-bold">{item.name}</h3>
                      <span className={`text-2xl font-bold ${item.progress >= 70 ? 'text-green-600' : item.progress >= 50 ? 'text-blue-600' : 'text-yellow-600'}`}>
                        ~{item.progress}%
                      </span>
                    </div>
                    <div className={`w-full rounded-full h-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                      <div className={`h-4 rounded-full ${item.color}`} style={{ width: `${item.progress}%` }}></div>
                    </div>
                    <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {item.status}
                    </p>
                  </div>
                ))}
              </div>

              <div className={`mt-8 p-4 rounded-lg ${isDarkMode ? 'bg-yellow-900/20' : 'bg-yellow-50'} border ${isDarkMode ? 'border-yellow-800' : 'border-yellow-200'}`}>
                <h4 className="font-bold mb-2">Pending Items:</h4>
                <ul className={`text-sm space-y-1 ${isDarkMode ? 'text-yellow-200' : 'text-yellow-800'}`}>
                  <li>• Audits & certifications</li>
                  <li>• Partner integrations</li>
                  <li>• Regression testing</li>
                </ul>
              </div>
            </div>

            {/* Roadmap */}
            <div className={`p-8 rounded-2xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-xl`}>
              <h2 className="text-3xl font-bold mb-6">Roadmap Highlights (Next 12 Months)</h2>
              <div className="space-y-4">
                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">✅</span>
                    <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Complete core features for CaaS and WaaS MVP; expand analytics and reporting
                    </p>
                  </div>
                </div>
                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">🔒</span>
                    <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Execute required compliance audits/assessments; publish Security & Compliance page
                    </p>
                  </div>
                </div>
                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">🤝</span>
                    <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Validate issuer/ATM/custody integrations and announce partners once live
                    </p>
                  </div>
                </div>
                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">📋</span>
                    <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Add program templates (utilities refunds, education stipends, healthcare benefits)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Compliance Tab */}
        {selectedTab === 'compliance' && (
          <div className="max-w-6xl mx-auto space-y-12">
            <div className={`p-8 rounded-2xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-xl`}>
              <h2 className="text-3xl font-bold mb-6">Compliance & Legal</h2>
              
              <div className="space-y-6">
                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h3 className="text-xl font-bold mb-2">Current Certifications (Legacy Monay Wallet only)</h3>
                  <div className="flex gap-4 mt-3">
                    <span className="px-3 py-1 bg-green-600 text-white rounded-full text-sm">PCI-DSS</span>
                    <span className="px-3 py-1 bg-green-600 text-white rounded-full text-sm">ISO 27001</span>
                    <span className="px-3 py-1 bg-green-600 text-white rounded-full text-sm">SOC 2</span>
                  </div>
                </div>

                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-yellow-900/20' : 'bg-yellow-50'} border ${isDarkMode ? 'border-yellow-800' : 'border-yellow-200'}`}>
                  <h3 className="text-xl font-bold mb-2">New Platform Status</h3>
                  <p className={`text-sm ${isDarkMode ? 'text-yellow-200' : 'text-yellow-800'}`}>
                    <strong>Monay ID, CaaS, WaaS:</strong> No certifications or registrations yet. All audits, certifications, 
                    registrations, and legal reviews are <strong>pending</strong>.
                  </p>
                </div>

                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h3 className="text-xl font-bold mb-2">Regulatory Posture</h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    We are not a bank or licensed money transmitter. Product rollout may require additional regulatory 
                    authorizations and/or partnerships, which are in progress.
                  </p>
                </div>

                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h3 className="text-xl font-bold mb-2">Data Protection</h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Encryption in transit/at rest, audit logging, risk-based controls; full compliance details to be 
                    published as audits conclude.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Contact Tab */}
        {selectedTab === 'contact' && (
          <div className="max-w-4xl mx-auto">
            <div className={`p-8 rounded-2xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-xl`}>
              <h2 className="text-3xl font-bold mb-8">Contact</h2>
              
              <div className="space-y-6">
                <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h3 className="text-xl font-bold mb-2">Investor Relations</h3>
                  <a href="mailto:invest@monay.com" className="text-blue-600 hover:text-blue-700 text-lg">
                    invest@monay.com
                  </a>
                </div>

                <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h3 className="text-xl font-bold mb-2">Media & Analysts</h3>
                  <a href="mailto:press@monay.com" className="text-blue-600 hover:text-blue-700 text-lg">
                    press@monay.com
                  </a>
                </div>

                <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h3 className="text-xl font-bold mb-2">Partnerships</h3>
                  <a href="mailto:partners@monay.com" className="text-blue-600 hover:text-blue-700 text-lg">
                    partners@monay.com
                  </a>
                </div>
              </div>

              <div className={`mt-8 p-4 rounded-lg ${isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50'} border ${isDarkMode ? 'border-blue-800' : 'border-blue-200'}`}>
                <p className={`text-sm ${isDarkMode ? 'text-blue-200' : 'text-blue-800'}`}>
                  <strong>Forward-looking statement:</strong> This page includes forward-looking statements that involve risks and uncertainties. 
                  Features, timelines, and availability are subject to change based on product development, compliance outcomes, and partner execution.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className={`py-8 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="container mx-auto px-4 text-center">
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            © 2025 Monay Inc. All rights reserved. This page contains forward-looking statements subject to risks and uncertainties.
          </p>
        </div>
      </footer>
    </div>
  );
}