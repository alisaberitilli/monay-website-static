/**
 * EmailJS Configuration
 * Configured for the designated recipient
 */

export const EMAILJS_CONFIG = {
  // EmailJS Account Public Key
  PUBLIC_KEY: 'MXz4p9OX623MHn40r',
  
  // EmailJS Service ID
  SERVICE_ID: 'service_d8hy50p',
  
  // EmailJS Template ID
  TEMPLATE_ID: 'template_l1hzdda',
  
  // Fixed recipient - all emails go here
  TO_EMAIL: 'the designated recipient'
};

// Instructions to get these values:
// 1. Sign up at https://www.emailjs.com/ (free)
// 2. Add Gmail/Outlook service in Email Services
// 3. Create template in Email Templates with:
//    - To Email: {{to_email}} or the designated recipient
//    - Subject: {{subject}}
//    - Content: Your email template
// 4. Copy your Public Key from Account settings
// 5. Replace the values above