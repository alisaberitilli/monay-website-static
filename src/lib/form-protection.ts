/**
 * Form protection utilities to prevent abuse and DOS attacks
 */

// Browser fingerprinting for client-side protection
export const getBrowserFingerprint = (): string => {
  if (typeof window === 'undefined') return '';
  
  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    navigator.platform,
    navigator.hardwareConcurrency,
    new Date().getTimezoneOffset(),
    screen.width,
    screen.height,
    screen.colorDepth,
    screen.pixelDepth
  ].join('|');
  
  // Create a simple hash
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  return Math.abs(hash).toString(36);
};

// Check if form was recently submitted
export const isFormRecentlySubmitted = (formType: string, cooldownMinutes: number = 5): boolean => {
  if (typeof window === 'undefined') return false;
  
  const fingerprint = getBrowserFingerprint();
  const key = `form-submission-${formType}-${fingerprint}`;
  const lastSubmission = localStorage.getItem(key);
  
  if (!lastSubmission) return false;
  
  const timeSinceSubmission = Date.now() - parseInt(lastSubmission);
  const cooldownMs = cooldownMinutes * 60 * 1000;
  
  return timeSinceSubmission < cooldownMs;
};

// Mark form as submitted
export const markFormAsSubmitted = (formType: string): void => {
  if (typeof window === 'undefined') return;
  
  const fingerprint = getBrowserFingerprint();
  const key = `form-submission-${formType}-${fingerprint}`;
  localStorage.setItem(key, Date.now().toString());
  
  // Also store in session for immediate blocking
  sessionStorage.setItem(`form-blocked-${formType}`, 'true');
};

// Get time until form can be submitted again
export const getTimeUntilNextSubmission = (formType: string, cooldownMinutes: number = 5): number => {
  if (typeof window === 'undefined') return 0;
  
  const fingerprint = getBrowserFingerprint();
  const key = `form-submission-${formType}-${fingerprint}`;
  const lastSubmission = localStorage.getItem(key);
  
  if (!lastSubmission) return 0;
  
  const timeSinceSubmission = Date.now() - parseInt(lastSubmission);
  const cooldownMs = cooldownMinutes * 60 * 1000;
  const timeRemaining = cooldownMs - timeSinceSubmission;
  
  return Math.max(0, Math.ceil(timeRemaining / 1000)); // Return seconds
};

// Check session-level blocking (immediate, within same session)
export const isFormBlockedInSession = (formType: string): boolean => {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem(`form-blocked-${formType}`) === 'true';
};

// Clear form submission history (for testing)
export const clearFormSubmissionHistory = (formType?: string): void => {
  if (typeof window === 'undefined') return;
  
  if (formType) {
    const fingerprint = getBrowserFingerprint();
    localStorage.removeItem(`form-submission-${formType}-${fingerprint}`);
    sessionStorage.removeItem(`form-blocked-${formType}`);
  } else {
    // Clear all form submissions
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('form-submission-')) {
        localStorage.removeItem(key);
      }
    });
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith('form-blocked-')) {
        sessionStorage.removeItem(key);
      }
    });
  }
};

// Advanced: Check for bot patterns
export const detectBotPatterns = (): { isBot: boolean; reason?: string } => {
  if (typeof window === 'undefined') return { isBot: false };
  
  // Check for headless browser indicators
  if (navigator.webdriver) {
    return { isBot: true, reason: 'Webdriver detected' };
  }
  
  // Check for missing window properties that real browsers have
  if (!(window as any).chrome && !(window as any).safari && !(window as any).firefox) {
    // Could be a bot, but also could be Edge or other browsers
  }
  
  // Check if plugins array is empty (common in headless browsers)
  if (navigator.plugins.length === 0) {
    return { isBot: true, reason: 'No browser plugins detected' };
  }
  
  // Check for automation tools
  if (window.document.documentElement.getAttribute('webdriver') === 'true') {
    return { isBot: true, reason: 'Automation tool detected' };
  }
  
  return { isBot: false };
};

// Rate limiting configuration per form type
export const FORM_RATE_LIMITS: Record<string, { cooldownMinutes: number; maxPerHour: number }> = {
  'Monay ID Signup': { cooldownMinutes: 5, maxPerHour: 3 },
  'Monay WaaS Signup': { cooldownMinutes: 5, maxPerHour: 3 },
  'Monay CaaS Signup': { cooldownMinutes: 5, maxPerHour: 3 },
  'Pilot Program Application': { cooldownMinutes: 10, maxPerHour: 2 },
  'Contact Sales Request': { cooldownMinutes: 5, maxPerHour: 5 },
  'Demo Schedule Request': { cooldownMinutes: 10, maxPerHour: 2 },
  'default': { cooldownMinutes: 5, maxPerHour: 5 }
};

// Get rate limit for form type
export const getFormRateLimit = (formType: string) => {
  return FORM_RATE_LIMITS[formType] || FORM_RATE_LIMITS.default;
};