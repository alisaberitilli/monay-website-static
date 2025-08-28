// Formatting utilities shared between mobile and web
export const formatters = {
  // Currency formatting
  currency: (amount: number, currency: string = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  },

  // Number formatting with commas
  number: (num: number): string => {
    return new Intl.NumberFormat('en-US').format(num);
  },

  // Date formatting
  date: (date: string | Date, options?: Intl.DateTimeFormatOptions): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    };
    
    return new Intl.DateTimeFormat('en-US', options || defaultOptions).format(dateObj);
  },

  // Time formatting
  time: (date: string | Date): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(dateObj);
  },

  // Date and time formatting
  dateTime: (date: string | Date): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(dateObj);
  },

  // Relative time formatting (e.g., "2 hours ago")
  relativeTime: (date: string | Date): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else {
      return formatters.date(dateObj);
    }
  },

  // Phone number formatting
  phoneNumber: (number: string, countryCode: string = '+1'): string => {
    const digitsOnly = number.replace(/\D/g, '');
    
    switch (countryCode) {
      case '+1': // US/Canada format: (555) 123-4567
        if (digitsOnly.length === 10) {
          return `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3, 6)}-${digitsOnly.slice(6)}`;
        }
        break;
      case '+44': // UK format
        if (digitsOnly.length === 10) {
          return `${digitsOnly.slice(0, 4)} ${digitsOnly.slice(4, 7)} ${digitsOnly.slice(7)}`;
        }
        break;
      case '+91': // India format
        if (digitsOnly.length === 10) {
          return `${digitsOnly.slice(0, 5)} ${digitsOnly.slice(5)}`;
        }
        break;
    }
    
    return number; // Return original if no format matches
  },

  // Card number formatting (with masking)
  cardNumber: (number: string, maskAll: boolean = false): string => {
    const digitsOnly = number.replace(/\D/g, '');
    
    if (maskAll && digitsOnly.length >= 4) {
      const lastFour = digitsOnly.slice(-4);
      const maskedPortion = '*'.repeat(digitsOnly.length - 4);
      return `${maskedPortion}${lastFour}`;
    }
    
    // Format with spaces every 4 digits
    return digitsOnly.replace(/(.{4})/g, '$1 ').trim();
  },

  // Account number masking
  accountNumber: (number: string): string => {
    const digitsOnly = number.replace(/\D/g, '');
    
    if (digitsOnly.length >= 4) {
      const lastFour = digitsOnly.slice(-4);
      const maskedPortion = '*'.repeat(Math.min(digitsOnly.length - 4, 8));
      return `${maskedPortion}${lastFour}`;
    }
    
    return number;
  },

  // Transaction ID formatting
  transactionId: (id: string): string => {
    if (id.length > 8) {
      return `${id.slice(0, 4)}...${id.slice(-4)}`;
    }
    return id;
  },

  // File size formatting
  fileSize: (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  },

  // Percentage formatting
  percentage: (value: number, decimalPlaces: number = 1): string => {
    return `${value.toFixed(decimalPlaces)}%`;
  },

  // Capitalize first letter
  capitalize: (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  },

  // Title case formatting
  titleCase: (str: string): string => {
    return str.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  },

  // Truncate text with ellipsis
  truncate: (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return `${text.slice(0, maxLength - 3)}...`;
  },
};

// Mask sensitive data
export const maskSensitiveData = {
  email: (email: string): string => {
    const [username, domain] = email.split('@');
    if (username.length <= 2) return email;
    
    const maskedUsername = username.charAt(0) + '*'.repeat(username.length - 2) + username.charAt(username.length - 1);
    return `${maskedUsername}@${domain}`;
  },

  phoneNumber: (number: string): string => {
    const digitsOnly = number.replace(/\D/g, '');
    if (digitsOnly.length < 4) return number;
    
    const lastThree = digitsOnly.slice(-3);
    const firstPart = digitsOnly.slice(0, 3);
    const maskedPart = '*'.repeat(digitsOnly.length - 6);
    
    return `${firstPart}${maskedPart}${lastThree}`;
  },
};