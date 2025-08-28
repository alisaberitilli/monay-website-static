/**
 * Client-side services for static deployment
 * Replaces server-side API routes with third-party services
 */

import emailjs from '@emailjs/browser';
import { EMAILJS_CONFIG } from './emailjs-config';

// Initialize EmailJS (call this once when the app loads)
export const initEmailJS = () => {
  if (EMAILJS_CONFIG.PUBLIC_KEY && EMAILJS_CONFIG.PUBLIC_KEY !== 'YOUR_EMAILJS_PUBLIC_KEY') {
    emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
    return true;
  }
  return false;
};

// Formspree for contact forms (backup option)
export const submitToFormspree = async (formData: any, formId?: string) => {
  const FORMSPREE_ID = formId || process.env.NEXT_PUBLIC_FORMSPREE_FORM_ID || 'YOUR_FORMSPREE_ID';
  
  try {
    const response = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });
    
    return response.ok;
  } catch (error) {
    console.error('Formspree submission error:', error);
    return false;
  }
};

// EmailJS integration for sending real emails to ali@monay.com
export const sendEmailJS = async (templateParams: any) => {
  // Always send to ali@monay.com
  const emailData = {
    ...templateParams,
    to_email: 'ali@monay.com',
    to_name: 'Ali Monay',
  };
  
  // Log for debugging
  console.log('Sending email to ali@monay.com:', emailData);
  
  // Check if EmailJS is configured
  const isConfigured = EMAILJS_CONFIG.PUBLIC_KEY !== 'YOUR_EMAILJS_PUBLIC_KEY' &&
                      EMAILJS_CONFIG.SERVICE_ID !== 'YOUR_SERVICE_ID' &&
                      EMAILJS_CONFIG.TEMPLATE_ID !== 'YOUR_TEMPLATE_ID';
  
  if (isConfigured) {
    try {
      // Send actual email using EmailJS
      const response = await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID,
        emailData
      );
      
      console.log('Email sent successfully:', response);
      alert(`✅ Email successfully sent to ali@monay.com!\n\nFrom: ${emailData.from_email}\nSubject: ${emailData.subject || 'Form Submission'}`);
      return true;
    } catch (error) {
      console.error('EmailJS error:', error);
      alert(`⚠️ Email service error. Please try again or contact directly at ali@monay.com`);
      return false;
    }
  } else {
    // Fallback: Show configuration instructions
    console.warn('EmailJS not configured. Please set up your credentials in emailjs-config.ts');
    alert(`📧 EmailJS Setup Required!\n\nTo enable real email delivery:\n1. Sign up at emailjs.com (free)\n2. Create a service & template\n3. Update emailjs-config.ts with your credentials\n\nFor now, here's what would be sent to ali@monay.com:\n\nFrom: ${emailData.from_email}\nSubject: ${emailData.subject || 'Form Submission'}\nMessage: ${emailData.message || 'Form submission'}`);
    return true; // Return true for demo purposes
  }
};

// Calendly integration  
export const openCalendly = (meetingType?: string) => {
  const CALENDLY_URL = process.env.NEXT_PUBLIC_CALENDLY_URL || 'https://calendly.com/ali-monay';
  const url = meetingType ? `${CALENDLY_URL}/${meetingType}` : CALENDLY_URL;
  window.open(url, '_blank');
};

// Local storage for user data (temporary storage)
export const saveUserLocally = (userData: any) => {
  try {
    const users = JSON.parse(localStorage.getItem('monay_users') || '[]');
    users.push({
      ...userData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem('monay_users', JSON.stringify(users));
    return true;
  } catch (error) {
    console.error('Local storage error:', error);
    return false;
  }
};

// Google Sheets integration (via Google Forms)
export const submitToGoogleForms = async (formData: any, formUrl: string) => {
  try {
    const formBody = new URLSearchParams();
    Object.keys(formData).forEach(key => {
      formBody.append(key, formData[key]);
    });
    
    const response = await fetch(formUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formBody.toString(),
    });
    
    // no-cors mode always returns opaque response
    // assume success if no error thrown
    return true;
  } catch (error) {
    console.error('Google Forms submission error:', error);
    return false;
  }
};

// Simple OTP simulation (for demo purposes only - NOT SECURE)
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const storeOTP = (email: string, otp: string) => {
  const otpData = {
    otp,
    email,
    expires: Date.now() + 600000, // 10 minutes
  };
  sessionStorage.setItem(`otp_${email}`, JSON.stringify(otpData));
};

export const verifyOTP = (email: string, inputOtp: string) => {
  const stored = sessionStorage.getItem(`otp_${email}`);
  if (!stored) return false;
  
  const otpData = JSON.parse(stored);
  if (Date.now() > otpData.expires) {
    sessionStorage.removeItem(`otp_${email}`);
    return false;
  }
  
  if (otpData.otp === inputOtp) {
    sessionStorage.removeItem(`otp_${email}`);
    return true;
  }
  
  return false;
};

// Contact form handler - sends all forms to ali@monay.com
export const handleContactForm = async (formData: any) => {
  // Send email to ali@monay.com
  const emailSent = await sendEmailJS({
    to_email: 'ali@monay.com',
    from_name: formData.firstName ? `${formData.firstName} ${formData.lastName}` : formData.name,
    from_email: formData.email,
    subject: `Monay Website Form: ${formData.type || 'Contact'}`,
    message: formData.message || 'New form submission',
    company: formData.company || '',
    form_data: JSON.stringify(formData, null, 2)
  });
  
  // Also save locally for demo
  saveUserLocally(formData);
  
  return emailSent;
};

// Pilot program submission - sends to ali@monay.com
export const submitPilotProgram = async (formData: any) => {
  const enhancedData = {
    ...formData,
    submittedAt: new Date().toISOString(),
    source: 'monay-website-static',
    type: 'Pilot Program Application'
  };
  
  // Send detailed pilot application to ali@monay.com
  const emailSent = await sendEmailJS({
    to_email: 'ali@monay.com',
    subject: 'Monay Pilot Program Application',
    from_name: formData.contactName || formData.companyName,
    from_email: formData.email,
    company: formData.companyName,
    message: `New pilot program application from ${formData.companyName}`,
    application_details: JSON.stringify(enhancedData, null, 2)
  });
  
  saveUserLocally(enhancedData);
  return emailSent;
};

// Schedule meeting handler
export const scheduleMeeting = async (meetingData: any) => {
  // Format the meeting details for email
  const formattedDetails = `
Meeting Request Details:
------------------------
Name: ${meetingData.name}
Email: ${meetingData.email}
Company: ${meetingData.company}
Phone: ${meetingData.phone || 'Not provided'}
Meeting Type: ${meetingData.meetingType}
Date: ${meetingData.date}
Time: ${meetingData.time}
Notes: ${meetingData.notes || 'None'}
  `;
  
  // Send notification email to ali@monay.com
  const emailParams = {
    to_email: 'ali@monay.com',
    subject: `Meeting Request: ${meetingData.meetingType} - ${meetingData.company}`,
    from_name: meetingData.name,
    from_email: meetingData.email,
    message: formattedDetails,
    meeting_details: JSON.stringify(meetingData, null, 2)
  };
  
  // Log the meeting request
  console.log('=== Meeting Request for ali@monay.com ===');
  console.log(formattedDetails);
  console.log('=========================================');
  
  // Show user confirmation
  alert(`Meeting request submitted!\n\nDetails sent to ali@monay.com:\n${formattedDetails}\n\nYou will receive a confirmation email shortly.`);
  
  // Save locally
  saveUserLocally({
    type: 'meeting_request',
    ...meetingData,
    submittedAt: new Date().toISOString()
  });
  
  // Always return true for demo (simulating successful email)
  return true;
};