"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import {
  handleContactForm,
  submitPilotProgram,
  scheduleMeeting,
  openCalendly,
  saveUserLocally,
  sendEmailJS,
  initEmailJS
} from "../lib/client-services";

export default function Home() {
  // Initialize EmailJS on component mount
  useEffect(() => {
    initEmailJS();
  }, []);
  
  // Dark mode state
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Helper function for input classes
  const getInputClasses = () => {
    return `w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
      isDarkMode 
        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
        : 'border-gray-300 text-gray-900 placeholder-gray-500'
    }`;
  };
  
  // Persist dark mode preference
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode !== null) {
      setIsDarkMode(JSON.parse(savedDarkMode));
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(prefersDark);
    }
    
    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (localStorage.getItem('darkMode') === null) {
        setIsDarkMode(e.matches);
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
  
  // Save dark mode preference
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);
  
  // Keyboard shortcut for dark mode toggle
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'j') {
        e.preventDefault();
        setIsDarkMode(!isDarkMode);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isDarkMode]);
  
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    password: "",
    confirmPassword: "",
    country: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  // Scheduling state
  const [showScheduler, setShowScheduler] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [schedulingData, setSchedulingData] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    meetingType: "demo",
    notes: ""
  });
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduleStatus, setScheduleStatus] = useState<"idle" | "success" | "error">("idle");

  // Contact form state
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactData, setContactData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    company: "",
    country: ""
  });
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);
  const [contactStatus, setContactStatus] = useState<"idle" | "success" | "error">("idle");

  // Enrollment verification state for pilot program
  const [pilotFormData, setPilotFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    mobileNumber: "",
    companyType: "",
    tokenVolume: "",
    technicalRequirements: [] as string[],
    timeline: "",
    userId: "" // Will be populated after user is saved to database
  });
  // Removed OTP-related state variables - forms now send directly to ali@monay.com
  const [isSubmittingPilot, setIsSubmittingPilot] = useState(false);
  const [pilotSubmitStatus, setPilotSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  // Helper function to format mobile number with +1 prefix
  const formatMobileNumber = (mobileNumber: string): string => {
    if (!mobileNumber) return mobileNumber;
    // Remove any existing +1 prefix and non-digits
    const cleanNumber = mobileNumber.replace(/^\+1/, '').replace(/\D/g, '');
    // Add +1 prefix if it's a 10-digit number
    if (cleanNumber.length === 10) {
      return `+1${cleanNumber}`;
    }
    // Return as-is if it doesn't match expected format
    return mobileNumber;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      // Use client-side service instead of API
      const userData = {
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        country: formData.country,
        signupDate: new Date().toISOString()
      };
      
      const success = await handleContactForm(userData);

      if (success) {

        setSubmitStatus("success");
        setFormData({
          email: "",
          firstName: "",
          lastName: "",
          password: "",
          confirmPassword: "",
          country: ""
        });
      } else {
        setSubmitStatus("error");
      }
    } catch (error) {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const countries = [
    "United States", "Canada", "United Kingdom", "Germany", "France", "Australia", "Japan", "China", "India", "Brazil",
    "Mexico", "South Korea", "Italy", "Spain", "Netherlands", "Switzerland", "Sweden", "Norway", "Denmark", "Finland",
    "Singapore", "Hong Kong", "United Arab Emirates", "Saudi Arabia", "South Africa", "Nigeria", "Kenya", "Egypt", "Morocco", "Ghana"
  ];

  // Scheduling functions
  const handleSchedulingInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSchedulingData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getAvailableSlots = (date: Date) => {
    // Generate available time slots for the selected date
    // This would typically integrate with your actual calendar API
    const slots = [];
    const startHour = 9; // 9 AM
    const endHour = 17; // 5 PM
    
    for (let hour = startHour; hour < endHour; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    
    // Filter out past times for today
    if (date.toDateString() === new Date().toDateString()) {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      
      return slots.filter(slot => {
        const [hour, minute] = slot.split(':').map(Number);
        return hour > currentHour || (hour === currentHour && minute > currentMinute + 30);
      });
    }
    
    return slots;
  };

  const handleScheduleAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime) return;
    
    setIsScheduling(true);
    setScheduleStatus("idle");

    try {
      // Create Teams meeting link
      const meetingLink = `https://teams.microsoft.com/l/meetup-join/19:meeting_${Date.now()}@thread.v2/0?context={"Tid":"your-tenant-id","Oid":"your-user-id"}`;
      
      // Prepare meeting data
      const meetingData: Record<string, unknown> = {
        ...schedulingData,
        date: selectedDate.toISOString(),
        time: selectedTime,
        duration: 30, // 30 minutes
        meetingLink,
        organizer: "ali@tilli.pro",
        subject: `Monay Platform Demo - ${schedulingData.company}`,
        attendees: [schedulingData.email],
        notes: schedulingData.notes
      };

      // Submit to Nudge API
      const nudgeResponse = await fetch("/api/nudge", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          formType: "schedule-meeting",
          data: meetingData
        }),
      });

      if (nudgeResponse.ok) {
        // Also send to the original schedule-meeting API as backup
        try {
          await fetch("/api/schedule-meeting", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(meetingData),
          });
        } catch (backupError) {
          console.warn("Backup meeting scheduling failed:", backupError);
        }

        setScheduleStatus("success");
        setSchedulingData({
          name: "",
          email: "",
          company: "",
          phone: "",
          meetingType: "demo",
          notes: ""
        });
        setSelectedDate(null);
        setSelectedTime("");
        setShowScheduler(false);
        
        // Send confirmation email
        await sendConfirmationEmail(meetingData);
      } else {
        setScheduleStatus("error");
      }
    } catch (error) {
      setScheduleStatus("error");
    } finally {
      setIsScheduling(false);
    }
  };

  const sendConfirmationEmail = async (meetingData: Record<string, unknown>) => {
    try {
      await fetch("/api/send-confirmation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(meetingData),
      });
    } catch (error) {
      console.error("Failed to send confirmation email:", error);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getNextAvailableDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      // Skip weekends
      if (date.getDay() !== 0 && date.getDay() !== 6) {
        dates.push(date);
      }
    }
    
    return dates;
  };

  // Contact form handlers
  const handleContactInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setContactData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingContact(true);
    setContactStatus("idle");

    try {
      // Submit to Nudge API
      const nudgeResponse = await fetch("/api/nudge", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          formType: "contact-sales",
          data: {
            ...contactData,
            message: `New contact request from ${contactData.firstName} ${contactData.lastName} at ${contactData.company}`
          }
        }),
      });

      if (nudgeResponse.ok) {
        // Also send to the original contact-sales API as backup
        try {
          await fetch("/api/contact-sales", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              ...contactData,
              to: "ali@monay.com",
              subject: "New Sales Contact Request",
              message: `New contact request from ${contactData.firstName} ${contactData.lastName} at ${contactData.company}`
            }),
          });
        } catch (backupError) {
          console.warn("Backup contact submission failed:", backupError);
        }

        setContactStatus("success");
        setContactData({
          email: "",
          firstName: "",
          lastName: "",
          company: "",
          country: ""
        });
        // Close modal after 2 seconds
        setTimeout(() => setShowContactForm(false), 2000);
      } else {
        setContactStatus("error");
      }
    } catch (error) {
      setContactStatus("error");
    } finally {
      setIsSubmittingContact(false);
    }
  };

  // Email verification functions for pilot program
  // Removed OTP functions - forms now send directly to ali@monay.com







  const handleTechnicalRequirementChange = (requirement: string) => {
    setPilotFormData(prev => ({
      ...prev,
      technicalRequirements: prev.technicalRequirements.includes(requirement)
        ? prev.technicalRequirements.filter(r => r !== requirement)
        : [...prev.technicalRequirements, requirement]
    }));
  };

  const handlePilotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmittingPilot(true);
    setPilotSubmitStatus("idle");

    try {
      // Send pilot application directly to ali@monay.com
      const success = await submitPilotProgram(pilotFormData);

      if (success) {
        setPilotSubmitStatus("success");
        // Clear form after successful submission
        setPilotFormData({
          email: "",
          firstName: "",
          lastName: "",
          mobileNumber: "",
          companyType: "",
          tokenVolume: "",
          technicalRequirements: [],
          timeline: "",
          userId: ""
        });
        // Reset form after 3 seconds
        setTimeout(() => setPilotSubmitStatus("idle"), 3000);
      } else {
        setPilotSubmitStatus("error");
      }
    } catch (error) {
      setPilotSubmitStatus("error");
    } finally {
      setIsSubmittingPilot(false);
    }
  };




  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 to-gray-800 text-white' 
        : 'bg-gradient-to-br from-slate-50 to-blue-50 text-gray-900'
    }`}>
      {/* Navigation */}
      <nav className={`${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/80 border-gray-200'} backdrop-blur-md border-b sticky top-0 z-50 transition-colors duration-300`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <Image
                src="/Monay.svg"
                alt="MONAY Logo"
                width={240}
                height={80}
                className="h-20 w-auto logo-image"
                priority
              />
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <a href="#home" className={`${isDarkMode ? 'text-gray-300 hover:text-blue-400' : 'text-gray-700 hover:text-blue-600'} px-3 py-2 rounded-md text-sm font-medium transition-colors`}>Home</a>
                <a href="#services" className={`${isDarkMode ? 'text-gray-300 hover:text-blue-400' : 'text-gray-700 hover:text-blue-600'} px-3 py-2 rounded-md text-sm font-medium transition-colors`}>Services</a>
                <a href="#platform" className={`${isDarkMode ? 'text-gray-300 hover:text-blue-400' : 'text-gray-700 hover:text-blue-600'} px-3 py-2 rounded-md text-sm font-medium transition-colors`}>Platform</a>
                <a href="#pilot-program" className={`${isDarkMode ? 'text-gray-300 hover:text-blue-400' : 'text-gray-700 hover:text-blue-600'} px-3 py-2 rounded-md text-sm font-medium transition-colors`}>Pilot Program</a>
                <a href="#partners" className={`${isDarkMode ? 'text-gray-300 hover:text-blue-400' : 'text-gray-700 hover:text-blue-600'} px-3 py-2 rounded-md text-sm font-medium transition-colors`}>Partners</a>
                <a href="#contact" className={`${isDarkMode ? 'text-gray-300 hover:text-blue-400' : 'text-gray-700 hover:text-blue-600'} px-3 py-2 rounded-md text-sm font-medium transition-colors`}>Contact</a>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Dark mode toggle */}
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  isDarkMode 
                    ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                )}
              </button>
              
              <button 
                onClick={() => openCalendly()}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Book Demo
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className={`text-4xl md:text-6xl font-bold mb-6 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Coin-as-a-Service
              </span>{" "}
              &{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
                Wallet-as-a-Service
              </span>
            </h1>
            <p className={`text-xl md:text-2xl mb-8 max-w-4xl mx-auto ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Monay Wallet is a branded, white-label stablecoin and digital wallet platform designed for banks, 
              fintech, and government agencies. Powered by USDM with interoperability across all stablecoins and fiat on-ramp/off-ramp.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <a href="#pilot-program" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 inline-block">
                Start Pilot Coin
              </a>
            </div>
            
            {/* Key Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className={`${isDarkMode ? 'bg-gray-800/60 border-gray-600' : 'bg-white/60 border-gray-200'} backdrop-blur-sm p-6 rounded-xl border transition-colors duration-300`}>
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>USDM Stablecoin</h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Native stablecoin with cross-chain interoperability</p>
              </div>
              
              <div className={`${isDarkMode ? 'bg-gray-800/60 border-gray-600' : 'bg-white/60 border-gray-200'} backdrop-blur-sm p-6 rounded-xl border transition-colors duration-300`}>
                <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Virtual Cards</h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Visa/Mastercard/Amex POS NFC support</p>
              </div>
              
              <div className={`${isDarkMode ? 'bg-gray-800/60 border-gray-600' : 'bg-white/60 border-gray-200'} backdrop-blur-sm p-6 rounded-xl border transition-colors duration-300`}>
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Cardless ATM</h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>AllPoint network cash withdrawals</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-purple-200 rounded-full opacity-20 animate-pulse delay-1000"></div>
      </section>

      {/* Services Section */}
      <section id="services" className={`py-24 transition-colors duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              White-Label Financial Infrastructure
            </h2>
            <p className={`text-xl max-w-3xl mx-auto ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Enable banks, fintech, and government agencies to quickly deploy branded stablecoins and wallets 
              without building new infrastructure from scratch.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Service 1 */}
            <div className={`${isDarkMode ? 'bg-gradient-to-br from-gray-700 to-gray-600 border-gray-600' : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100'} p-8 rounded-xl border hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2`}>
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Stablecoin-as-a-Service</h3>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Issue branded stablecoins (USDM) with native support on Monay Wallet, integrated with global settlement networks.</p>
            </div>

            {/* Service 2 */}
            <div className={`${isDarkMode ? 'bg-gradient-to-br from-gray-700 to-gray-600 border-gray-600' : 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-100'} p-8 rounded-xl border hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2`}>
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h3 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Wallet-as-a-Service</h3>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Deploy branded digital wallets with seamless integration to multiple stablecoin rails and fiat on-ramps.</p>
            </div>

            {/* Service 3 */}
            <div className={`${isDarkMode ? 'bg-gradient-to-br from-gray-700 to-gray-600 border-gray-600' : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-100'} p-8 rounded-xl border hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2`}>
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Business Rule Framework</h3>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Low-code engine for KYC, verification, fraud prevention, and compliance across all payment flows.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Features */}
      <section id="platform" className={`py-24 transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Advanced Platform Capabilities
            </h2>
            <p className={`text-xl max-w-3xl mx-auto ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Orchestrate multiple stablecoin rails with advanced compliance, POS integration, and comprehensive payment solutions.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Multi-Rail Orchestration
              </h3>
              <p className="text-lg text-gray-600 mb-6">
                Seamlessly bridge, settle, and manage compliance across USDC, USDT, USDP, and other major stablecoins 
                while serving both participating and non-participating acquirers.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Cross-chain stablecoin interoperability</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Global settlement network integration</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Advanced compliance and program controls</span>
                </li>
              </ul>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-400 to-purple-600 rounded-2xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-4">Payment Infrastructure</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" />
                    </svg>
                    <span>Visa/Mastercard/Amex POS</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                    </svg>
                    <span>ApplePay & GooglePay</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                    </svg>
                    <span>Invoice-linked B2B/B2C</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Platform Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className={`${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'} p-8 rounded-xl border transition-colors duration-300`}>
              <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Business Rule Framework (BRF)</h3>
              <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Low-code engine for intelligent eligibility, KYC/KYB, spend controls, fraud prevention, and compliance.</p>
              <ul className={`space-y-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                <li>• Government disbursement programs (ESA, FEMA, IRS, EIP)</li>
                <li>• Cross-border settlement and compliance</li>
                <li>• Enterprise spend controls and fraud prevention</li>
                <li>• P2P flow management and monitoring</li>
              </ul>
            </div>
            
            <div className={`${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'} p-8 rounded-xl border transition-colors duration-300`}>
              <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>On/Off-Ramps & Custody</h3>
              <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Seamless integrations with leading platforms for fiat conversion and secure custody.</p>
              <ul className={`space-y-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                <li>• Circle, Tether, Paxos, PayPal integration</li>
                <li>• Fireblocks, Anchorage, Fidelity custody</li>
                <li>• Coinbase, BitGo, Zero Hash support</li>
                <li>• FX engine for cross-currency conversions</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Partners & Integrations */}
      <section id="partners" className={`py-24 transition-colors duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Trusted Partners & Integrations
            </h2>
            <p className={`text-xl max-w-3xl mx-auto ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Built on proven infrastructure with leading payment networks, stablecoin issuers, and custody providers.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            <div className="text-center">
              <div className={`w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4 ${isDarkMode ? 'bg-gray-700' : 'bg-blue-100'}`}>
                <span className="text-blue-600 font-bold text-lg">V/M/A</span>
              </div>
              <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Payment Networks</h3>
              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Visa, Mastercard, American Express</p>
            </div>
            
            <div className="text-center">
              <div className={`w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4 ${isDarkMode ? 'bg-gray-700' : 'bg-green-100'}`}>
                <span className="text-green-600 font-bold text-lg">AP</span>
              </div>
              <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>ATM Network</h3>
              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>AllPoint Network</p>
            </div>
            
            <div className="text-center">
              <div className={`w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4 ${isDarkMode ? 'bg-gray-700' : 'bg-purple-100'}`}>
                <span className="text-purple-600 font-bold text-lg">SC</span>
              </div>
              <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Stablecoins</h3>
              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>USDC, USDT, USDP</p>
            </div>
            
            <div className="text-center">
              <div className={`w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4 ${isDarkMode ? 'bg-gray-700' : 'bg-orange-100'}`}>
                <span className="text-orange-600 font-bold text-lg">CD</span>
              </div>
              <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Custody</h3>
              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Fireblocks, Anchorage, Fidelity</p>
            </div>
          </div>

          {/* Use Cases */}
          <div className={`${isDarkMode ? 'bg-gradient-to-r from-gray-700 to-gray-600' : 'bg-gradient-to-r from-blue-50 to-purple-50'} p-8 rounded-2xl transition-colors duration-300`}>
            <h3 className={`text-2xl font-bold mb-6 text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Government & Enterprise Use Cases</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 19 7.5 19s3.332-.523 4.5-1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.523 4.5 1.253v13C19.832 18.477 18.246 19 16.5 19c-1.746 0-3.332-.523-4.5-1.253" />
                  </svg>
                </div>
                <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Education & Savings</h4>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>ESA programs, custodial accounts, controlled spend</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Government Programs</h4>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>FEMA, IRS, military stipends, federal disbursements</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>B2B & Cross-Border</h4>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Invoice settlement, FX conversions, compliance</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pilot Program Section */}
      <section id="pilot-program" className={`py-24 transition-colors duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-gradient-to-r from-blue-50 to-purple-50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={`text-4xl md:text-5xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Pilot Coin Program: Coin-as-a-Service
              </span>
            </h2>
            <p className={`text-xl max-w-3xl mx-auto ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Join our exclusive pilot program to build and deploy your branded stablecoin with full KYC/KYB compliance and business rule framework on EVM L2.
            </p>
          </div>

          {/* Program Phases */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className={`p-8 rounded-2xl shadow-xl transition-all duration-300 hover:scale-105 ${isDarkMode ? 'bg-gray-700 border border-gray-600' : 'bg-white border border-gray-200'}`}>
              <div className="text-center mb-6">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isDarkMode ? 'bg-blue-600' : 'bg-blue-100'}`}>
                  <span className="text-2xl font-bold text-white">1</span>
                </div>
                <h3 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>KYC/KYB Onboarding</h3>
              </div>
              <ul className={`space-y-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Business verification & compliance
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Regulatory framework setup
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Risk assessment & scoring
                </li>
              </ul>
            </div>

            <div className={`p-8 rounded-2xl shadow-xl transition-all duration-300 hover:scale-105 ${isDarkMode ? 'bg-gray-700 border border-gray-600' : 'bg-white border border-gray-200'}`}>
              <div className="text-center mb-6">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isDarkMode ? 'bg-purple-600' : 'bg-purple-100'}`}>
                  <span className="text-2xl font-bold text-white">2</span>
                </div>
                <h3 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Business Rules Engine</h3>
              </div>
              <ul className={`space-y-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Custom compliance rules
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Transaction limits & controls
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Multi-signature requirements
                </li>
              </ul>
            </div>

            <div className={`p-8 rounded-2xl shadow-xl transition-all duration-300 hover:scale-105 ${isDarkMode ? 'bg-gray-700 border border-gray-600' : 'bg-white border border-gray-200'}`}>
              <div className="text-center mb-6">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isDarkMode ? 'bg-green-600' : 'bg-green-100'}`}>
                  <span className="text-2xl font-bold text-white">3</span>
                </div>
                <h3 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>L2 Deployment</h3>
              </div>
              <ul className={`space-y-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Base or Polygon zkEVM setup
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  ERC-3643 token deployment
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Onramp infrastructure
                </li>
              </ul>
            </div>
          </div>

          {/* Technical Architecture */}
          <div className={`p-8 rounded-2xl shadow-xl mb-16 ${isDarkMode ? 'bg-gray-700 border border-gray-600' : 'bg-white border border-gray-200'}`}>
            <h3 className={`text-3xl font-bold text-center mb-12 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Technical Architecture</h3>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Blockchain Infrastructure</h4>
                <ul className={`space-y-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  <li>• EVM L2: Base or Polygon zkEVM</li>
                  <li>• ERC-3643: Security token standard</li>
                  <li>• Multi-signature wallet integration</li>
                  <li>• Gas optimization & cost management</li>
                </ul>
              </div>
              
              <div>
                <h4 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Compliance & Security</h4>
                <ul className={`space-y-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  <li>• Automated KYC/KYB verification</li>
                  <li>• Business rule engine (BRE)</li>
                  <li>• Regulatory reporting & audit trails</li>
                  <li>• Risk management & monitoring</li>
                </ul>
              </div>
            </div>
          </div>

{/* Pilot Application Form - Simplified */}
<div className={`p-8 rounded-xl shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
  <h3 className={`text-2xl font-semibold mb-6 text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
    Pilot Coin Program Application
  </h3>
  
  {/* Application Form - Sends directly to ali@monay.com */}
  <form onSubmit={handlePilotSubmit} className="space-y-6">
    {/* Name Fields */}
    <div className="grid md:grid-cols-2 gap-4">
      <div>
        <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          First Name *
        </label>
        <input
          type="text"
          value={pilotFormData.firstName}
          onChange={(e) => setPilotFormData(prev => ({ ...prev, firstName: e.target.value }))}
          className={`w-full p-3 border rounded-lg ${isDarkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
          placeholder="Enter your first name"
          required
        />
      </div>
      <div>
        <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          Last Name *
        </label>
        <input
          type="text"
          value={pilotFormData.lastName}
          onChange={(e) => setPilotFormData(prev => ({ ...prev, lastName: e.target.value }))}
          className={`w-full p-3 border rounded-lg ${isDarkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
          placeholder="Enter your last name"
          required
        />
      </div>
    </div>

    {/* Contact Fields */}
    <div className="grid md:grid-cols-2 gap-4">
      <div>
        <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          Email Address *
        </label>
        <input
          type="email"
          value={pilotFormData.email}
          onChange={(e) => setPilotFormData(prev => ({ ...prev, email: e.target.value }))}
          className={`w-full p-3 border rounded-lg ${isDarkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
          placeholder="Enter your business email"
          required
        />
      </div>
      <div>
        <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          Mobile Number
        </label>
        <input
          type="tel"
          value={pilotFormData.mobileNumber}
          onChange={(e) => setPilotFormData(prev => ({ ...prev, mobileNumber: e.target.value }))}
          className={`w-full p-3 border rounded-lg ${isDarkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
          placeholder="Enter your mobile number"
        />
      </div>
    </div>

    {/* Business Fields */}
    <div className="grid md:grid-cols-2 gap-4">
      <div>
        <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          Company Type *
        </label>
        <div className="relative">
          <select
            value={pilotFormData.companyType}
            onChange={(e) => setPilotFormData(prev => ({ ...prev, companyType: e.target.value }))}
            className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 appearance-none cursor-pointer
              ${isDarkMode 
                ? 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700 focus:border-blue-500' 
                : 'bg-white border-gray-300 text-gray-900 hover:border-gray-400 focus:border-blue-500'} 
              focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
            required
          >
            <option value="">Select company type</option>
            <option value="bank">Bank</option>
            <option value="fintech">Fintech</option>
            <option value="government">Government Agency</option>
            <option value="enterprise">Enterprise</option>
            <option value="other">Other</option>
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>
      <div>
        <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          Expected Token Volume *
        </label>
        <div className="relative">
          <select
            value={pilotFormData.tokenVolume}
            onChange={(e) => setPilotFormData(prev => ({ ...prev, tokenVolume: e.target.value }))}
            className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 appearance-none cursor-pointer
              ${isDarkMode 
                ? 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700 focus:border-blue-500' 
                : 'bg-white border-gray-300 text-gray-900 hover:border-gray-400 focus:border-blue-500'} 
              focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
            required
          >
            <option value="">Select monthly volume</option>
            <option value="<100k">Less than $100k</option>
            <option value="100k-1m">$100k - $1M</option>
            <option value="1m-10m">$1M - $10M</option>
            <option value=">10m">More than $10M</option>
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>
    </div>

    {/* Timeline */}
    <div>
      <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
        Implementation Timeline *
      </label>
      <div className="relative">
        <select
          value={pilotFormData.timeline}
          onChange={(e) => setPilotFormData(prev => ({ ...prev, timeline: e.target.value }))}
          className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 appearance-none cursor-pointer
            ${isDarkMode 
              ? 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700 focus:border-blue-500' 
              : 'bg-white border-gray-300 text-gray-900 hover:border-gray-400 focus:border-blue-500'} 
            focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
          required
        >
          <option value="">Select timeline</option>
          <option value="immediate">Immediate (Less than 1 month)</option>
          <option value="quarter">This Quarter</option>
          <option value="half">Next 6 Months</option>
          <option value="year">This Year</option>
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>

    {/* Submit Button */}
    <div className="flex justify-center pt-4">
      <button
        type="submit"
        disabled={isSubmittingPilot || pilotSubmitStatus === "success"}
        className={`px-8 py-4 rounded-xl font-medium transition-all duration-200 ${
          isSubmittingPilot || pilotSubmitStatus === "success"
            ? 'bg-gray-400 text-gray-300 cursor-not-allowed'
            : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white hover:shadow-lg'
        }`}
      >
        {isSubmittingPilot ? "Submitting..." : pilotSubmitStatus === "success" ? "Application Submitted ✓" : "Submit Application"}
      </button>
    </div>

    {/* Status Messages */}
    {pilotSubmitStatus === "success" && (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <p className="text-green-800 text-sm">
          Application submitted successfully! We'll contact you at ali@monay.com soon.
        </p>
      </div>
    )}
    {pilotSubmitStatus === "error" && (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600 text-sm">
          Failed to submit application. Please try again.
        </p>
      </div>
    )}
  </form>
</div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className={`py-24 transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className={`text-3xl md:text-4xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Ready to Transform Your Financial Infrastructure?
          </h2>
          <p className={`text-xl mb-12 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Join banks, fintech, and government agencies already using Monay to power their stablecoin and wallet programs.
          </p>
          
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-8 rounded-2xl shadow-lg transition-colors duration-300`}>
            <h3 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Contact Us</h3>
            <p className={`text-lg mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Ready to get started? Contact our team to discuss your specific needs.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <button 
                onClick={() => openCalendly()}
                className="text-center hover:scale-105 transition-transform duration-200 cursor-pointer group"
              >
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-700 transition-colors">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <h4 className={`font-semibold mb-2 group-hover:text-blue-600 transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Book a Demo</h4>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>See the platform in action</p>
              </button>
              
              <button 
                onClick={() => setShowContactForm(true)}
                className="text-center hover:scale-105 transition-transform duration-200 cursor-pointer group"
              >
                <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-700 transition-colors">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h4 className={`font-semibold mb-2 group-hover:text-purple-600 transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Contact Sales</h4>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Discuss your specific needs</p>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Scheduling Modal */}
      {showScheduler && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto transition-colors duration-300`}>
            <div className={`p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex justify-between items-center">
                <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Schedule Your Demo</h2>
                <button
                  onClick={() => setShowScheduler(false)}
                  className={`${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'} transition-colors`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className={`mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Book a personalized demo of the Monay platform with Ali from Tilli.pro</p>
            </div>

            <form onSubmit={handleScheduleAppointment} className="p-6">
              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={schedulingData.name}
                    onChange={handleSchedulingInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Work Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={schedulingData.email}
                    onChange={handleSchedulingInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your work email"
                  />
                </div>
                
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                    Company *
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={schedulingData.company}
                    onChange={handleSchedulingInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your company name"
                  />
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={schedulingData.phone}
                    onChange={handleSchedulingInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>

              {/* Meeting Type */}
              <div className="mb-6">
                <label htmlFor="meetingType" className="block text-sm font-medium text-gray-700 mb-2">
                  Meeting Type *
                </label>
                <select
                  id="meetingType"
                  name="meetingType"
                  value={schedulingData.meetingType}
                  onChange={handleSchedulingInputChange}
                  required
                  className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 appearance-none cursor-pointer ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700 focus:border-blue-500' : 'bg-white border-gray-300 text-gray-900 hover:border-gray-400 focus:border-blue-500'} focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                >
                  <option value="demo">Platform Demo</option>
                  <option value="consultation">Technical Consultation</option>
                  <option value="integration">Integration Discussion</option>
                  <option value="pricing">Pricing Discussion</option>
                </select>
              </div>

              {/* Date Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Date *
                </label>
                <div className="grid grid-cols-7 gap-2">
                  {getNextAvailableDates().map((date) => (
                    <button
                      key={date.toISOString()}
                      type="button"
                      onClick={() => {
                        setSelectedDate(date);
                        setSelectedTime("");
                      }}
                      className={`p-3 text-sm rounded-lg border transition-colors ${
                        selectedDate?.toDateString() === date.toDateString()
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-gray-700 border-gray-300 hover:border-blue-500"
                      }`}
                    >
                      <div className="font-medium">{date.getDate()}</div>
                      <div className="text-xs opacity-75">{date.toLocaleDateString('en-US', { month: 'short' })}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Selection */}
              {selectedDate && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Time (30 min slots) *
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {getAvailableSlots(selectedDate).map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedTime(slot)}
                        className={`p-3 text-sm rounded-lg border transition-colors ${
                          selectedTime === slot
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-gray-700 border-gray-300 hover:border-blue-500"
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              <div className="mb-6">
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={schedulingData.notes}
                  onChange={handleSchedulingInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Tell us about your specific needs or questions..."
                />
              </div>

              {/* Status Messages */}
              {scheduleStatus === "success" && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 font-medium">Meeting scheduled successfully! Check your email for confirmation and Teams meeting link.</p>
                </div>
              )}
              
              {scheduleStatus === "error" && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 font-medium">There was an error scheduling your meeting. Please try again.</p>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={isScheduling || !selectedDate || !selectedTime}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
                >
                  {isScheduling ? "Scheduling..." : "Schedule Demo"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowScheduler(false)}
                  className="px-8 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Contact Sales Modal */}
      {showContactForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Contact Sales</h2>
                <button
                  onClick={() => setShowContactForm(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-gray-600 mt-2">Tell us about your needs and our sales team will get back to you</p>
            </div>

            <form onSubmit={handleContactSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="contact-email" className="block text-sm font-medium text-gray-700 mb-2">
                    Your Work Email *
                  </label>
                  <input
                    type="email"
                    id="contact-email"
                    name="email"
                    value={contactData.email}
                    onChange={handleContactInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter your work email"
                  />
                </div>
                
                <div>
                  <label htmlFor="contact-firstName" className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    id="contact-firstName"
                    name="firstName"
                    value={contactData.firstName}
                    onChange={handleContactInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter your first name"
                  />
                </div>
                
                <div>
                  <label htmlFor="contact-lastName" className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    id="contact-lastName"
                    name="lastName"
                    value={contactData.lastName}
                    onChange={handleContactInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter your last name"
                  />
                </div>
                
                <div>
                  <label htmlFor="contact-company" className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    id="contact-company"
                    name="company"
                    value={contactData.company}
                    onChange={handleContactInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter your company name"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label htmlFor="contact-country" className="block text-sm font-medium text-gray-700 mb-2">
                    Country *
                  </label>
                  <select
                    id="contact-country"
                    name="country"
                    value={contactData.country}
                    onChange={handleContactInputChange}
                    required
                    className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 appearance-none cursor-pointer ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700 focus:border-purple-500' : 'bg-white border-gray-300 text-gray-900 hover:border-gray-400 focus:border-purple-500'} focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
                  >
                    <option value="">Select your country</option>
                    {countries.map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Status Messages */}
              {contactStatus === "success" && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 font-medium">Thank you! Our sales team will contact you soon.</p>
                </div>
              )}
              
              {contactStatus === "error" && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 font-medium">There was an error submitting your request. Please try again.</p>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={isSubmittingContact}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
                >
                  {isSubmittingContact ? "Sending..." : "Send Message"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowContactForm(false)}
                  className="px-8 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className={`${isDarkMode ? 'bg-gray-950' : 'bg-gray-900'} text-white py-12 transition-colors duration-300`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Image
                  src="/Monay.svg"
                  alt="MONAY Logo"
                  width={200}
                  height={64}
                  className="h-16 w-auto logo-image"
                />
              </div>
              <p className="text-gray-400">
                Infrastructure for the next wave of regulated digital payments. 
                Coin-as-a-Service and Wallet-as-a-Service for banks, fintech, and government agencies.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#services" className="hover:text-white transition-colors">Stablecoin Services</a></li>
                <li><a href="#platform" className="hover:text-white transition-colors">Wallet Infrastructure</a></li>
                <li><a href="#partners" className="hover:text-white transition-colors">Integrations</a></li>
                <li><a href="#contact" className="hover:text-white transition-colors">Pilot Programs</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Solutions</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Government Programs</li>
                <li>Banking & Fintech</li>
                <li>Cross-Border Payments</li>
                <li>Compliance & BRF</li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li>About</li>
                <li>Careers</li>
                <li>Press</li>
                <li>Contact</li>
              </ul>
            </div>
          </div>
          
          <div className={`border-t mt-8 pt-8 text-center text-gray-400 ${isDarkMode ? 'border-gray-800' : 'border-gray-800'}`}>
            <p>&copy; 2024 MONAY. All rights reserved. | Coin-as-a-Service & Wallet-as-a-Service Platform</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
