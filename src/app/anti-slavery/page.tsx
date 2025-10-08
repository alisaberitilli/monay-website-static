"use client";

import { useState, useEffect } from "react";
import Navigation from "../../components/Navigation";
import Footer from "../../components/Footer";

export default function AntiSlavery() {
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
          Anti-Slavery, Anti-Human Trafficking, and Modern Slavery Policy
        </h1>
        
        <div className={`prose prose-lg ${isDarkMode ? 'prose-invert' : ''} max-w-none`}>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-8`}>
            Effective Date: January 27, 2025 | Version 2.0
          </p>

          <div className={`p-4 ${isDarkMode ? 'bg-blue-900/20 border-blue-500' : 'bg-blue-50 border-blue-200'} border-l-4 rounded mb-8`}>
            <p className={`text-sm ${isDarkMode ? 'text-blue-300' : 'text-blue-800'} font-semibold`}>
              COMMITMENT STATEMENT: Monay maintains a zero-tolerance policy toward slavery, human trafficking, and all forms of modern slavery. This policy applies to all our operations including Monay ID, CaaS, and WaaS services, and extends to our entire supply chain and business partnerships.
            </p>
          </div>

          <section className="mb-8">
            <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              1. Policy Statement and Purpose
            </h2>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              Monay Pay, Inc. operating as Monay ("Company," "we," "us," or "our") is committed to preventing acts of modern slavery, human trafficking, forced labor, and child labor from occurring within our business operations, supply chain, and financial services platform. As a financial technology company operating in the blockchain and digital payment space, we recognize our responsibility to combat financial crimes that facilitate human trafficking and modern slavery.
            </p>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              This policy demonstrates our commitment to:
            </p>
            <ul className={`list-disc pl-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              <li>Acting ethically and with integrity in all business dealings</li>
              <li>Implementing effective systems and controls to prevent modern slavery</li>
              <li>Ensuring transparency in our business and supply chains</li>
              <li>Protecting vulnerable individuals from exploitation</li>
              <li>Supporting law enforcement in combating human trafficking</li>
              <li>Complying with all applicable laws and regulations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              2. Legal and Regulatory Framework
            </h2>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              We comply with all applicable anti-slavery and human trafficking laws including:
            </p>
            
            <h3 className={`text-xl font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              2.1 United States Laws
            </h3>
            <ul className={`list-disc pl-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              <li>Trafficking Victims Protection Act (TVPA) of 2000 and subsequent reauthorizations</li>
              <li>18 U.S.C. § 1589 (Forced Labor)</li>
              <li>18 U.S.C. § 1590 (Trafficking with respect to peonage, slavery, involuntary servitude, or forced labor)</li>
              <li>18 U.S.C. § 1591 (Sex trafficking of children or by force, fraud, or coercion)</li>
              <li>18 U.S.C. § 1592 (Unlawful conduct with respect to documents)</li>
              <li>18 U.S.C. § 1594 (General provisions)</li>
              <li>Federal Acquisition Regulation (FAR) Subpart 22.17 - Combating Trafficking in Persons</li>
              <li>California Transparency in Supply Chains Act (SB 657)</li>
              <li>Maryland House Bill 984 - Human Trafficking Prevention</li>
            </ul>

            <h3 className={`text-xl font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              2.2 International Standards
            </h3>
            <ul className={`list-disc pl-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              <li>UK Modern Slavery Act 2015</li>
              <li>EU Directive 2011/36/EU on preventing and combating trafficking in human beings</li>
              <li>UN Protocol to Prevent, Suppress and Punish Trafficking in Persons (Palermo Protocol)</li>
              <li>International Labour Organization (ILO) Forced Labour Convention</li>
              <li>UN Guiding Principles on Business and Human Rights</li>
              <li>OECD Guidelines for Multinational Enterprises</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              3. Definitions and Scope
            </h2>
            
            <h3 className={`text-xl font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              3.1 Key Definitions
            </h3>
            <ul className={`list-disc pl-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              <li><strong>Modern Slavery:</strong> Encompasses slavery, servitude, forced and compulsory labor, and human trafficking</li>
              <li><strong>Human Trafficking:</strong> The recruitment, harboring, transportation, provision, or obtaining of a person for labor or services through force, fraud, or coercion</li>
              <li><strong>Forced Labor:</strong> Work or service extracted under menace of penalty and for which the person has not offered themselves voluntarily</li>
              <li><strong>Child Labor:</strong> Work that deprives children of their childhood, potential, and dignity, and is harmful to physical and mental development</li>
              <li><strong>Debt Bondage:</strong> Status arising from a pledge by a debtor of personal services as security for debt</li>
              <li><strong>Involuntary Servitude:</strong> A condition of servitude induced by means of coercion</li>
            </ul>

            <h3 className={`text-xl font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              3.2 Policy Scope
            </h3>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              This policy applies to:
            </p>
            <ul className={`list-disc pl-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              <li>All Monay services (ID, CaaS, WaaS)</li>
              <li>All employees, officers, and directors</li>
              <li>All contractors, consultants, and temporary workers</li>
              <li>All suppliers, vendors, and service providers</li>
              <li>All business partners and joint ventures</li>
              <li>All agents and intermediaries acting on our behalf</li>
              <li>All subsidiaries and affiliated entities</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              4. Risk Assessment and Due Diligence
            </h2>
            
            <h3 className={`text-xl font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              4.1 High-Risk Areas in Financial Services
            </h3>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              We recognize that financial services can be exploited for human trafficking through:
            </p>
            <ul className={`list-disc pl-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              <li>Money laundering of trafficking proceeds</li>
              <li>Payment processing for illicit services</li>
              <li>Cryptocurrency transactions to obscure trafficking payments</li>
              <li>Prepaid cards used to control victims</li>
              <li>Wire transfers for recruitment and transportation</li>
              <li>Digital wallets for anonymous transactions</li>
              <li>Cross-border payments facilitating trafficking operations</li>
            </ul>

            <h3 className={`text-xl font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              4.2 Supply Chain Risk Assessment
            </h3>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              We conduct thorough risk assessments of our supply chain including:
            </p>
            <ul className={`list-disc pl-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              <li>Technology hardware suppliers</li>
              <li>Software development contractors</li>
              <li>Cloud service providers</li>
              <li>Data center operations</li>
              <li>Customer service outsourcing</li>
              <li>Cleaning and facilities management</li>
              <li>Security services</li>
              <li>Professional services firms</li>
            </ul>

            <h3 className={`text-xl font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              4.3 Geographic Risk Factors
            </h3>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              We assess geographic risks based on:
            </p>
            <ul className={`list-disc pl-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              <li>U.S. State Department Trafficking in Persons (TIP) Report rankings</li>
              <li>Prevalence of forced labor and child labor</li>
              <li>Weak rule of law and corruption levels</li>
              <li>Conflict zones and humanitarian crises</li>
              <li>Migration corridors and border regions</li>
              <li>Industries known for exploitation</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              5. Transaction Monitoring for Human Trafficking
            </h2>
            
            <h3 className={`text-xl font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              5.1 Red Flag Indicators
            </h3>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              Our systems monitor for financial patterns indicative of human trafficking:
            </p>
            
            <h4 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Account and Card Activity
            </h4>
            <ul className={`list-disc pl-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              <li>Multiple accounts or cards controlled by one individual</li>
              <li>Accounts with names that don't match usage patterns</li>
              <li>Forced account opening with victim present but not participating</li>
              <li>Employer maintaining control of employee payment cards</li>
              <li>Unusual restrictions on account access by account holder</li>
            </ul>

            <h4 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Transaction Patterns
            </h4>
            <ul className={`list-disc pl-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              <li>Payments to escort services, massage parlors, or adult entertainment venues</li>
              <li>Hotel/motel charges at hourly rates or frequent short stays</li>
              <li>Transportation purchases suggesting movement of multiple people</li>
              <li>Purchases of bulk quantities of prepaid cards or phones</li>
              <li>Wire transfers to high-risk jurisdictions with no clear purpose</li>
              <li>Cryptocurrency conversions following suspicious patterns</li>
              <li>Payments for online classified ads in adult services sections</li>
            </ul>

            <h4 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Business Account Indicators
            </h4>
            <ul className={`list-disc pl-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              <li>Businesses operating primarily in cash with minimal card processing</li>
              <li>Nail salons, massage parlors, or restaurants with unusual payment patterns</li>
              <li>Agricultural or construction businesses with suspicious payroll practices</li>
              <li>Modeling or talent agencies with questionable international transfers</li>
              <li>Labor contractors with patterns suggesting worker exploitation</li>
            </ul>

            <h3 className={`text-xl font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              5.2 Enhanced Monitoring Procedures
            </h3>
            <ul className={`list-disc pl-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              <li>Real-time transaction screening for trafficking indicators</li>
              <li>Machine learning models trained on trafficking typologies</li>
              <li>Cross-reference with law enforcement databases</li>
              <li>Geographic heat mapping of suspicious activities</li>
              <li>Network analysis to identify connected accounts</li>
              <li>Behavioral analytics for victim identification</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              6. Supplier and Partner Requirements
            </h2>
            
            <h3 className={`text-xl font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              6.1 Contractual Obligations
            </h3>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              All supplier and partner contracts must include:
            </p>
            <ul className={`list-disc pl-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              <li>Explicit prohibition of slavery and human trafficking</li>
              <li>Right to audit compliance with this policy</li>
              <li>Requirement to maintain transparent supply chains</li>
              <li>Obligation to report suspected violations</li>
              <li>Termination rights for policy violations</li>
              <li>Indemnification for slavery-related claims</li>
              <li>Cooperation with investigations</li>
            </ul>

            <h3 className={`text-xl font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              6.2 Prohibited Practices
            </h3>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              Suppliers and partners must not:
            </p>
            <ul className={`list-disc pl-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              <li>Use forced, bonded, indentured, or involuntary prison labor</li>
              <li>Engage in human trafficking or procurement of commercial sex acts</li>
              <li>Use child labor in violation of international standards</li>
              <li>Destroy, conceal, or confiscate identity or immigration documents</li>
              <li>Use misleading or fraudulent recruitment practices</li>
              <li>Charge recruitment fees to workers</li>
              <li>Fail to provide return transportation for workers brought from another country</li>
              <li>Provide substandard housing that fails to meet host country standards</li>
              <li>Fail to provide employment contracts in workers' native language</li>
            </ul>

            <h3 className={`text-xl font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              6.3 Supplier Audits and Assessments
            </h3>
            <ul className={`list-disc pl-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              <li>Initial assessment before engagement</li>
              <li>Annual compliance certifications</li>
              <li>Periodic on-site audits for high-risk suppliers</li>
              <li>Worker interviews and grievance mechanisms</li>
              <li>Document reviews including payroll and contracts</li>
              <li>Corrective action plans for identified issues</li>
              <li>Follow-up audits to verify remediation</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              7. Employee Training and Awareness
            </h2>
            
            <h3 className={`text-xl font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              7.1 Training Program Requirements
            </h3>
            <ul className={`list-disc pl-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              <li>Mandatory training for all new employees within 30 days</li>
              <li>Annual refresher training for all staff</li>
              <li>Specialized training for high-risk functions</li>
              <li>Role-specific modules for different departments</li>
              <li>Scenario-based exercises and case studies</li>
              <li>Testing with minimum 85% passing score</li>
              <li>Tracking and reporting of completion rates</li>
            </ul>

            <h3 className={`text-xl font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              7.2 Training Content
            </h3>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              Training covers:
            </p>
            <ul className={`list-disc pl-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              <li>Understanding modern slavery and human trafficking</li>
              <li>Recognizing indicators in financial transactions</li>
              <li>Identifying victims and vulnerable individuals</li>
              <li>Reporting procedures and escalation protocols</li>
              <li>Legal obligations and potential penalties</li>
              <li>Supply chain risk management</li>
              <li>Customer interaction best practices</li>
              <li>Trauma-informed approaches when dealing with potential victims</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              8. Reporting and Whistleblowing
            </h2>
            
            <h3 className={`text-xl font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              8.1 Internal Reporting Channels
            </h3>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              Multiple channels are available for reporting concerns:
            </p>
            <ul className={`list-disc pl-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              <li>Direct supervisor or management chain</li>
              <li>Human Resources department</li>
              <li>Compliance Officer</li>
              <li>Anonymous ethics hotline: 1-800-XXX-XXXX</li>
              <li>Secure online reporting portal</li>
              <li><a href="/contact?dept=Compliance">Contact Compliance Team</a></li>
              <li>Written reports to designated mailbox</li>
            </ul>

            <h3 className={`text-xl font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              8.2 External Reporting
            </h3>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              We cooperate with external reporting to:
            </p>
            <ul className={`list-disc pl-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              <li>National Human Trafficking Hotline: 1-888-373-7888</li>
              <li>FBI: tips.fbi.gov or 1-800-CALL-FBI</li>
              <li>ICE/HSI Tip Line: 1-866-DHS-2-ICE</li>
              <li>Department of Labor: 1-844-888-5236</li>
              <li>State and local law enforcement</li>
              <li>Financial Crimes Enforcement Network (FinCEN)</li>
            </ul>

            <h3 className={`text-xl font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              8.3 Whistleblower Protections
            </h3>
            <ul className={`list-disc pl-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              <li>Strict non-retaliation policy for good faith reporting</li>
              <li>Confidentiality protection to the fullest extent possible</li>
              <li>Anonymous reporting options available</li>
              <li>Legal protections under applicable whistleblower laws</li>
              <li>Investigation of all retaliation claims</li>
              <li>Disciplinary action for retaliatory behavior</li>
              <li>Potential rewards under federal whistleblower programs</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              9. Investigation and Response Procedures
            </h2>
            
            <h3 className={`text-xl font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              9.1 Investigation Protocol
            </h3>
            <ul className={`list-disc pl-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              <li>Immediate assessment of reported concerns</li>
              <li>Preservation of evidence and documentation</li>
              <li>Engagement of specialized investigation team</li>
              <li>Coordination with law enforcement when appropriate</li>
              <li>Protection of potential victims</li>
              <li>Suspension of suspicious accounts or transactions</li>
              <li>Filing of Suspicious Activity Reports (SARs)</li>
            </ul>

            <h3 className={`text-xl font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              9.2 Remediation Actions
            </h3>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              When violations are confirmed:
            </p>
            <ul className={`list-disc pl-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              <li>Immediate cessation of violating practices</li>
              <li>Termination of responsible parties</li>
              <li>Termination of supplier or partner relationships</li>
              <li>Cooperation with criminal prosecutions</li>
              <li>Support for victim assistance programs</li>
              <li>Implementation of preventive measures</li>
              <li>Public disclosure as required by law</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              10. Governance and Accountability
            </h2>
            
            <h3 className={`text-xl font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              10.1 Governance Structure
            </h3>
            <ul className={`list-disc pl-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              <li><strong>Board of Directors:</strong> Ultimate oversight responsibility</li>
              <li><strong>CEO:</strong> Executive accountability for policy implementation</li>
              <li><strong>Chief Compliance Officer:</strong> Day-to-day program management</li>
              <li><strong>Human Trafficking Task Force:</strong> Cross-functional coordination</li>
              <li><strong>Department Heads:</strong> Implementation within business units</li>
              <li><strong>All Employees:</strong> Individual responsibility for compliance</li>
            </ul>

            <h3 className={`text-xl font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              10.2 Performance Metrics
            </h3>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              We track and report on:
            </p>
            <ul className={`list-disc pl-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              <li>Number of trafficking-related SARs filed</li>
              <li>Training completion rates and scores</li>
              <li>Supplier audit results and remediation</li>
              <li>Internal reports received and investigated</li>
              <li>Policy violations identified and addressed</li>
              <li>Collaboration with law enforcement</li>
              <li>Program effectiveness assessments</li>
            </ul>

            <h3 className={`text-xl font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              10.3 Annual Review and Reporting
            </h3>
            <ul className={`list-disc pl-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              <li>Annual policy review and updates</li>
              <li>Board presentation on program effectiveness</li>
              <li>Modern Slavery Statement publication (as required)</li>
              <li>Transparency report on anti-trafficking efforts</li>
              <li>Stakeholder engagement and feedback</li>
              <li>Benchmarking against industry best practices</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              11. Partnerships and Collaboration
            </h2>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              We actively collaborate with:
            </p>
            <ul className={`list-disc pl-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              <li>Financial Sector Commission on Human Trafficking</li>
              <li>Polaris Project and National Human Trafficking Hotline</li>
              <li>ECPAT-USA (End Child Prostitution and Trafficking)</li>
              <li>Alliance to End Slavery and Trafficking (ATEST)</li>
              <li>Tech Against Trafficking initiative</li>
              <li>Local anti-trafficking task forces</li>
              <li>Survivor-led organizations</li>
              <li>Academic institutions researching trafficking</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              12. Technology and Innovation
            </h2>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              We leverage technology to combat trafficking:
            </p>
            <ul className={`list-disc pl-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              <li>AI and machine learning for pattern detection</li>
              <li>Blockchain analytics for cryptocurrency tracking</li>
              <li>Biometric authentication to prevent identity fraud</li>
              <li>Data sharing platforms with other financial institutions</li>
              <li>Mobile apps for anonymous reporting</li>
              <li>Geospatial analysis of trafficking routes</li>
              <li>Natural language processing for online ad monitoring</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              13. Survivor Support and Resources
            </h2>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              We are committed to supporting trafficking survivors through:
            </p>
            <ul className={`list-disc pl-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              <li>Referrals to specialized service providers</li>
              <li>Financial inclusion programs for survivors</li>
              <li>Employment opportunities and skills training</li>
              <li>Pro bono financial services</li>
              <li>Support for survivor-led businesses</li>
              <li>Trauma-informed customer service training</li>
              <li>Donations to anti-trafficking organizations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              14. Compliance Violations and Consequences
            </h2>
            
            <h3 className={`text-xl font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              14.1 Internal Disciplinary Actions
            </h3>
            <ul className={`list-disc pl-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              <li>Verbal and written warnings</li>
              <li>Performance improvement plans</li>
              <li>Suspension with or without pay</li>
              <li>Demotion or reassignment</li>
              <li>Termination of employment</li>
              <li>Referral to law enforcement</li>
              <li>Civil recovery of damages</li>
            </ul>

            <h3 className={`text-xl font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              14.2 Legal Consequences
            </h3>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              Violations may result in:
            </p>
            <ul className={`list-disc pl-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              <li>Criminal prosecution and imprisonment</li>
              <li>Substantial fines and penalties</li>
              <li>Asset forfeiture</li>
              <li>Debarment from government contracts</li>
              <li>Loss of business licenses</li>
              <li>Reputational damage</li>
              <li>Civil lawsuits</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              15. Contact Information
            </h2>
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} p-4 rounded`}>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} font-semibold`}>Anti-Trafficking Compliance</p>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Monay Pay, Inc.</p>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>1997 Annapolis Exchange Parkway, Suite 300</p>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Annapolis, MD 21401</p>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mt-2`}>
                <strong>Compliance Officer:</strong> <a href="/contact?dept=Compliance">Contact Compliance</a>
              </p>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <strong>Ethics Hotline:</strong> 1-800-XXX-XXXX (24/7, Anonymous)
              </p>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <strong>Main Office:</strong> 1-888-MONAY-00
              </p>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mt-2`}>
                <strong>National Human Trafficking Hotline:</strong> 1-888-373-7888
              </p>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <strong>Text:</strong> 233733 (BEFREE)
              </p>
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
            <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong>Regulatory Compliance:</strong> TVPA, FAR 22.17, CA SB 657, UK Modern Slavery Act
            </p>
          </div>
        </div>
      </div>

      <Footer isDarkMode={isDarkMode} />
    </div>
  );
}