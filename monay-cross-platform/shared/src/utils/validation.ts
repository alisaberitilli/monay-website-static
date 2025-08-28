// Validation utilities shared between mobile and web
import { APP_CONSTANTS } from '../constants/api';

export const validation = {
  // Email validation
  email: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Password validation
  password: (password: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (password.length < APP_CONSTANTS.MIN_PASSWORD_LENGTH) {
      errors.push(`Password must be at least ${APP_CONSTANTS.MIN_PASSWORD_LENGTH} characters long`);
    }
    
    if (password.length > APP_CONSTANTS.MAX_PASSWORD_LENGTH) {
      errors.push(`Password must be no more than ${APP_CONSTANTS.MAX_PASSWORD_LENGTH} characters long`);
    }
    
    if (!/(?=.*[a-z])/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/(?=.*\d)/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/(?=.*[@$!%*?&])/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Mobile number validation
  mobileNumber: (number: string, countryCode: string = '+1'): boolean => {
    // Remove all non-digits
    const digitsOnly = number.replace(/\D/g, '');
    
    // Basic validation - adjust based on your requirements
    switch (countryCode) {
      case '+1': // US/Canada
        return digitsOnly.length === 10;
      case '+44': // UK
        return digitsOnly.length === 10 || digitsOnly.length === 11;
      case '+91': // India
        return digitsOnly.length === 10;
      default:
        return digitsOnly.length >= 7 && digitsOnly.length <= 15;
    }
  },

  // PIN validation
  pin: (pin: string): boolean => {
    const digitsOnly = pin.replace(/\D/g, '');
    return digitsOnly.length >= APP_CONSTANTS.MIN_PIN_LENGTH && 
           digitsOnly.length <= APP_CONSTANTS.MAX_PIN_LENGTH;
  },

  // Amount validation
  amount: (amount: string | number): { isValid: boolean; error?: string } => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    
    if (isNaN(numAmount)) {
      return { isValid: false, error: 'Invalid amount format' };
    }
    
    if (numAmount <= 0) {
      return { isValid: false, error: 'Amount must be greater than zero' };
    }
    
    if (numAmount > 999999.99) {
      return { isValid: false, error: 'Amount exceeds maximum limit' };
    }
    
    // Check for more than 2 decimal places
    if (numAmount.toString().split('.')[1]?.length > 2) {
      return { isValid: false, error: 'Amount cannot have more than 2 decimal places' };
    }
    
    return { isValid: true };
  },

  // Card number validation (Luhn algorithm)
  cardNumber: (cardNumber: string): boolean => {
    const digitsOnly = cardNumber.replace(/\D/g, '');
    
    if (digitsOnly.length < 13 || digitsOnly.length > 19) {
      return false;
    }
    
    // Luhn algorithm
    let sum = 0;
    let isEven = false;
    
    for (let i = digitsOnly.length - 1; i >= 0; i--) {
      let digit = parseInt(digitsOnly.charAt(i));
      
      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      
      sum += digit;
      isEven = !isEven;
    }
    
    return sum % 10 === 0;
  },

  // CVV validation
  cvv: (cvv: string, cardType?: string): boolean => {
    const digitsOnly = cvv.replace(/\D/g, '');
    
    if (cardType === 'amex') {
      return digitsOnly.length === 4;
    }
    
    return digitsOnly.length === 3;
  },

  // Expiry date validation
  expiryDate: (month: string, year: string): boolean => {
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);
    
    if (monthNum < 1 || monthNum > 12) {
      return false;
    }
    
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    
    // Year should be current year or future, up to 10 years from now
    if (yearNum < currentYear || yearNum > currentYear + 10) {
      return false;
    }
    
    // If it's current year, month should be current month or future
    if (yearNum === currentYear && monthNum < currentMonth) {
      return false;
    }
    
    return true;
  },

  // Account number validation
  accountNumber: (accountNumber: string): boolean => {
    const digitsOnly = accountNumber.replace(/\D/g, '');
    return digitsOnly.length >= 8 && digitsOnly.length <= 17;
  },

  // Routing number validation (US)
  routingNumber: (routingNumber: string): boolean => {
    const digitsOnly = routingNumber.replace(/\D/g, '');
    
    if (digitsOnly.length !== 9) {
      return false;
    }
    
    // ABA routing number checksum
    const digits = digitsOnly.split('').map(Number);
    const checksum = (3 * (digits[0] + digits[3] + digits[6]) +
                     7 * (digits[1] + digits[4] + digits[7]) +
                     (digits[2] + digits[5] + digits[8])) % 10;
    
    return checksum === 0;
  },

  // Name validation
  name: (name: string): boolean => {
    return name.trim().length >= 2 && name.trim().length <= 50 && /^[a-zA-Z\s'-]+$/.test(name);
  },
};

// Form validation schemas
export const schemas = {
  login: {
    email: validation.email,
    password: (password: string) => password.length > 0,
  },
  
  signup: {
    firstName: validation.name,
    lastName: validation.name,
    email: validation.email,
    password: (password: string) => validation.password(password).isValid,
    mobileNumber: validation.mobileNumber,
  },
  
  sendMoney: {
    amount: (amount: string) => validation.amount(amount).isValid,
    pin: validation.pin,
  },
  
  addCard: {
    cardNumber: validation.cardNumber,
    cardHolderName: validation.name,
    cvv: validation.cvv,
    expiryMonth: (month: string, year: string) => validation.expiryDate(month, year),
  },
  
  addBankAccount: {
    accountHolderName: validation.name,
    accountNumber: validation.accountNumber,
    routingNumber: validation.routingNumber,
  },
};