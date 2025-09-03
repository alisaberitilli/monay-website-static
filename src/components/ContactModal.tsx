'use client';

import { useState, useEffect } from 'react';
import VtigerFormWrapperV3 from './VtigerFormWrapperV3';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  subject?: string;
  department?: string;
  message?: string;
  isDarkMode?: boolean;
}

export default function ContactModal({ 
  isOpen, 
  onClose, 
  subject = 'General Inquiry',
  department = 'General',
  message = '',
  isDarkMode = false 
}: ContactModalProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    role: '',
    country: 'United States',
    subject: subject,
    department: department,
    message: message,
    preferredContactMethod: 'email'
  });

  useEffect(() => {
    // Update form data when props change
    setFormData(prev => ({
      ...prev,
      subject: subject,
      department: department,
      message: message
    }));
  }, [subject, department, message]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetFormData = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      company: '',
      role: '',
      country: 'United States',
      subject: subject,
      department: department,
      message: '',
      preferredContactMethod: 'email'
    });
  };

  if (!isOpen) return null;

  // Department to email mapping for context
  const departmentInfo: Record<string, string> = {
    'General': 'General inquiries',
    'Support': 'Technical support and assistance',
    'Enterprise': 'Enterprise stablecoin solutions',
    'Investors': 'Investment opportunities',
    'Partnerships': 'Partnership and collaboration',
    'Banks': 'Bank modernization solutions',
    'Government': 'Government RFP and contracts',
    'SNAP': 'SNAP modernization program',
    'Education': 'Education and ESA programs',
    'Sales': 'Sales and product information'
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className={`relative w-full max-w-2xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-2xl`}>
          {/* Close button */}
          <button
            onClick={onClose}
            className={`absolute right-4 top-4 p-2 rounded-lg ${
              isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
            } transition-colors`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Modal content */}
          <div className="p-8">
            <VtigerFormWrapperV3
              formData={formData}
              formType={`Contact Form - ${department}`}
              resetFormData={resetFormData}
              successMessage="Thank you for contacting us! We'll get back to you within 24 hours."
              submitButtonText="Send Message"
              onSuccess={() => {
                setTimeout(onClose, 2000); // Close modal 2 seconds after success
              }}
            >
              {/* Header */}
              <div className="mb-6">
                <h2 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Contact Us
                </h2>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {departmentInfo[department] || departmentInfo['General']}
                </p>
              </div>

              {/* Contact Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="firstName" className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    First Name *
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-2 rounded-lg border transition-all duration-200 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-purple-500'
                    } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                    placeholder="John"
                  />
                </div>

                <div>
                  <label htmlFor="lastName" className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Last Name *
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-2 rounded-lg border transition-all duration-200 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-purple-500'
                    } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                    placeholder="Doe"
                  />
                </div>

                <div>
                  <label htmlFor="email" className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-2 rounded-lg border transition-all duration-200 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-purple-500'
                    } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                    placeholder="john@company.com"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Phone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 rounded-lg border transition-all duration-200 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-purple-500'
                    } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div>
                  <label htmlFor="company" className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Company
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 rounded-lg border transition-all duration-200 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-purple-500'
                    } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                    placeholder="Your Company"
                  />
                </div>

                <div>
                  <label htmlFor="role" className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Role/Title
                  </label>
                  <input
                    type="text"
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 rounded-lg border transition-all duration-200 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-purple-500'
                    } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                    placeholder="Your Role"
                  />
                </div>
              </div>

              {/* Subject Line */}
              <div className="mb-4">
                <label htmlFor="subject" className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Subject *
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-4 py-2 rounded-lg border transition-all duration-200 ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-purple-500'
                  } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                  placeholder="What can we help you with?"
                />
              </div>

              {/* Department Selection */}
              <div className="mb-4">
                <label htmlFor="department" className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Department
                </label>
                <select
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 rounded-lg border-2 transition-all duration-200 appearance-none cursor-pointer ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600 focus:border-purple-500 focus:bg-gray-700' 
                      : 'bg-white border-gray-200 text-gray-900 hover:border-gray-300 focus:border-purple-500'
                  } focus:outline-none focus:ring-0`}
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='${isDarkMode ? '%23ffffff' : '%23374151'}'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 0.75rem center',
                    backgroundSize: '1.5rem',
                    paddingRight: '2.5rem'
                  }}
                >
                  <option value="General">General</option>
                  <option value="Sales">Sales</option>
                  <option value="Support">Support</option>
                  <option value="Enterprise">Enterprise Solutions</option>
                  <option value="Investors">Investor Relations</option>
                  <option value="Partnerships">Partnerships</option>
                  <option value="Banks">Banking Solutions</option>
                  <option value="Government">Government Services</option>
                  <option value="SNAP">SNAP Programs</option>
                  <option value="Education">Education Programs</option>
                </select>
              </div>

              {/* Message */}
              <div className="mb-4">
                <label htmlFor="message" className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className={`w-full px-4 py-2 rounded-lg border transition-all duration-200 ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-purple-500'
                  } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                  placeholder="Please provide details about your inquiry..."
                />
              </div>

              {/* Preferred Contact Method */}
              <div className="mb-6">
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Preferred Contact Method
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="preferredContactMethod"
                      value="email"
                      checked={formData.preferredContactMethod === 'email'}
                      onChange={handleInputChange}
                      className="mr-2 text-purple-600 focus:ring-purple-500"
                    />
                    <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Email</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="preferredContactMethod"
                      value="phone"
                      checked={formData.preferredContactMethod === 'phone'}
                      onChange={handleInputChange}
                      className="mr-2 text-purple-600 focus:ring-purple-500"
                    />
                    <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Phone</span>
                  </label>
                </div>
              </div>
            </VtigerFormWrapperV3>
          </div>
        </div>
      </div>
    </div>
  );
}