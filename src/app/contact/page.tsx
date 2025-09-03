'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Navigation from '@/components/Navigation';
import VtigerFormWrapperV3 from '@/components/VtigerFormWrapperV3';

export default function ContactPage() {
  const searchParams = useSearchParams();
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Get context from URL params
  const department = searchParams.get('dept') || 'General';
  const subject = searchParams.get('subject') || '';
  const referrer = searchParams.get('from') || '';

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    role: '',
    country: 'United States',
    subject: subject || 'General Inquiry',
    department: department,
    message: '',
    preferredContactMethod: 'email',
    referrerPage: referrer
  });

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode !== null) {
      setIsDarkMode(JSON.parse(savedDarkMode));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

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
      subject: subject || 'General Inquiry',
      department: department,
      message: '',
      preferredContactMethod: 'email',
      referrerPage: referrer
    });
  };

  // Department descriptions
  const departmentInfo: Record<string, { title: string; description: string; icon: string }> = {
    'General': {
      title: 'General Inquiry',
      description: 'Get in touch with our team for any questions or information',
      icon: '💬'
    },
    'Sales': {
      title: 'Sales Inquiry',
      description: 'Learn about our products and pricing',
      icon: '🛍️'
    },
    'Support': {
      title: 'Technical Support',
      description: 'Get help with technical issues or implementation',
      icon: '🛠️'
    },
    'Enterprise': {
      title: 'Enterprise Solutions',
      description: 'Discuss enterprise stablecoin and custom solutions',
      icon: '🏢'
    },
    'Investors': {
      title: 'Investor Relations',
      description: 'Investment opportunities and pitch deck requests',
      icon: '📈'
    },
    'Partnerships': {
      title: 'Partnership Opportunities',
      description: 'Explore collaboration and partnership possibilities',
      icon: '🤝'
    },
    'Banks': {
      title: 'Banking Solutions',
      description: 'Bank modernization and financial infrastructure',
      icon: '🏦'
    },
    'Government': {
      title: 'Government Services',
      description: 'RFP responses and government contracts',
      icon: '🏛️'
    },
    'SNAP': {
      title: 'SNAP Programs',
      description: 'SNAP modernization and benefits distribution',
      icon: '🎯'
    },
    'Education': {
      title: 'Education Programs',
      description: 'ESA and education savings account solutions',
      icon: '🎓'
    }
  };

  const currentDept = departmentInfo[department] || departmentInfo['General'];

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Navigation isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="text-6xl mb-4">{currentDept.icon}</div>
            <h1 className="text-4xl font-bold mb-4">
              {currentDept.title}
            </h1>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              {currentDept.description}
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl p-8`}>
            
            {/* Quick Contact Info */}
            <div className={`mb-8 p-6 rounded-xl ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Quick Response Times
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    24-hour response time
                  </span>
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Business hours: 9-5 PST
                  </span>
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-purple-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Secure form submission
                  </span>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <VtigerFormWrapperV3
              formData={formData}
              formType={`Contact Form - ${department}`}
              resetFormData={resetFormData}
              successMessage="Thank you for contacting us! We'll get back to you within 24 hours."
              submitButtonText="Send Message"
            >
              <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Get in Touch
              </h2>

              {/* Contact Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="firstName" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    First Name *
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-purple-500'
                    } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                    placeholder="John"
                  />
                </div>

                <div>
                  <label htmlFor="lastName" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Last Name *
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-purple-500'
                    } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                    placeholder="Doe"
                  />
                </div>

                <div>
                  <label htmlFor="email" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-purple-500'
                    } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                    placeholder="john@company.com"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Phone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-purple-500'
                    } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div>
                  <label htmlFor="company" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Company
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-purple-500'
                    } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                    placeholder="Your Company"
                  />
                </div>

                <div>
                  <label htmlFor="role" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Role/Title
                  </label>
                  <input
                    type="text"
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-purple-500'
                    } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                    placeholder="Your Role"
                  />
                </div>
              </div>

              {/* Subject and Department */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="subject" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Subject *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-purple-500'
                    } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                    placeholder="What can we help you with?"
                  />
                </div>

                <div>
                  <label htmlFor="department" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Department
                  </label>
                  <select
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 appearance-none cursor-pointer ${
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
                    <option value="General">General Inquiry</option>
                    <option value="Sales">Sales</option>
                    <option value="Support">Technical Support</option>
                    <option value="Enterprise">Enterprise Solutions</option>
                    <option value="Investors">Investor Relations</option>
                    <option value="Partnerships">Partnerships</option>
                    <option value="Banks">Banking Solutions</option>
                    <option value="Government">Government Services</option>
                    <option value="SNAP">SNAP Programs</option>
                    <option value="Education">Education Programs</option>
                  </select>
                </div>
              </div>

              {/* Message */}
              <div className="mb-6">
                <label htmlFor="message" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={6}
                  className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-purple-500'
                  } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                  placeholder="Please provide details about your inquiry..."
                />
              </div>

              {/* Preferred Contact Method */}
              <div className="mb-6">
                <label className={`block text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Preferred Contact Method
                </label>
                <div className="flex gap-6">
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

            {/* Privacy Notice */}
            <p className={`mt-6 text-sm text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Your information is secure and will never be shared. By submitting, you agree to our Privacy Policy.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}