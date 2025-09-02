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
          Anti-Slavery and Anti-Human Trafficking Policy
        </h1>
        
        <div className={`prose prose-lg ${isDarkMode ? 'prose-invert' : ''} max-w-none`}>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-8`}>
            Effective Date: January 1, 2025
          </p>

          <section className="mb-8">
            <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              1. Our Commitment
            </h2>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              Utilli, LLC (dba Tilli) operating as Monay is committed to preventing acts of modern slavery and human trafficking from occurring within both our business and supply chain. We have a zero-tolerance approach to modern slavery and are committed to acting ethically and with integrity in all our business dealings and relationships.
            </p>
          </section>

          <section className="mb-8">
            <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              2. Policy Scope
            </h2>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              This policy applies to all persons working for us or on our behalf in any capacity, including:
            </p>
            <ul className={`list-disc pl-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              <li>Employees at all levels</li>
              <li>Directors and officers</li>
              <li>Agency workers and seconded workers</li>
              <li>Volunteers and interns</li>
              <li>Agents and contractors</li>
              <li>External consultants</li>
              <li>Business partners and sponsors</li>
              <li>Third-party representatives</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              3. Our Standards
            </h2>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              We are committed to ensuring that:
            </p>
            <ul className={`list-disc pl-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              <li>Modern slavery is not taking place in any part of our business</li>
              <li>Modern slavery is not taking place in our supply chain</li>
              <li>We maintain transparency in our business and supply chain approach</li>
              <li>We expect the same high standards from our contractors and suppliers</li>
              <li>We comply with all applicable laws and regulations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              4. Due Diligence
            </h2>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              As part of our initiative to identify and mitigate risk, we:
            </p>
            <ul className={`list-disc pl-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              <li>Conduct supplier audits and assessments</li>
              <li>Evaluate new suppliers before engagement</li>
              <li>Review existing supply chains regularly</li>
              <li>Implement protective whistleblowing procedures</li>
              <li>Maintain appropriate grievance mechanisms</li>
              <li>Provide training to relevant staff members</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              5. Supplier Adherence
            </h2>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              We have zero tolerance for slavery and human trafficking. We expect all those in our supply chain and contractors to comply with our values. Our supplier contracts include specific prohibitions against:
            </p>
            <ul className={`list-disc pl-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              <li>Use of forced, compulsory, or trafficked labor</li>
              <li>Use of child labor</li>
              <li>Physical or sexual abuse of workers</li>
              <li>Charging recruitment fees to workers</li>
              <li>Confiscation of identity documents</li>
              <li>Debt bondage or bonded labor</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              6. Employee Responsibilities
            </h2>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              All employees must:
            </p>
            <ul className={`list-disc pl-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              <li>Ensure they read, understand, and comply with this policy</li>
              <li>Avoid any activity that might lead to a breach of this policy</li>
              <li>Notify management of any suspected breach immediately</li>
              <li>Report any concerns about slavery or human trafficking</li>
              <li>Cooperate fully with any investigation</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              7. Training and Communication
            </h2>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              To ensure a high level of understanding of the risks of modern slavery and human trafficking, we provide training to relevant members of staff. All directors, managers, and individuals involved in procurement and supply chain management receive appropriate training.
            </p>
          </section>

          <section className="mb-8">
            <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              8. Reporting Concerns
            </h2>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              We encourage all workers, customers, and business partners to report any concerns related to our direct activities or supply chains. This includes any circumstances that may give rise to an enhanced risk of slavery or human trafficking. Our whistleblowing procedure is designed to make it easy to make disclosures without fear of retaliation.
            </p>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              Reports can be made through:
            </p>
            <ul className={`list-disc pl-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              <li>Direct reporting to management</li>
              <li>Anonymous ethics hotline</li>
              <li>Email to compliance@monay.com</li>
              <li>Written reports to our compliance officer</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              9. Consequences of Non-Compliance
            </h2>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              Any employee who breaches this policy will face disciplinary action, which could result in dismissal for misconduct or gross misconduct. We may terminate our relationship with other individuals and organizations working on our behalf if they breach this policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              10. Monitoring and Review
            </h2>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              We will regularly review the effectiveness of this policy to ensure it remains appropriate and effective. Key performance indicators include:
            </p>
            <ul className={`list-disc pl-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              <li>Number of reports received from employees or public</li>
              <li>Training completion rates</li>
              <li>Supplier audit results</li>
              <li>Actions taken against suppliers or employees</li>
              <li>Review and update frequency of the policy</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              11. Board Approval
            </h2>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              This policy has been approved by the Board of Directors of Utilli, LLC (dba Tilli) and will be reviewed annually. The Board has overall responsibility for ensuring this policy complies with our legal and ethical obligations.
            </p>
          </section>

          <section className="mb-8">
            <h2 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              12. Contact Information
            </h2>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              For questions about this policy or to report concerns:
            </p>
            <div className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <p>Compliance Officer</p>
              <p>Utilli, LLC (dba Tilli)</p>
              <p>Email: compliance@monay.com</p>
              <p>Phone: 1-888-MONAY-00</p>
              <p>Ethics Hotline: [Confidential Number]</p>
            </div>
          </section>
        </div>
      </div>

      <Footer isDarkMode={isDarkMode} />
    </div>
  );
}