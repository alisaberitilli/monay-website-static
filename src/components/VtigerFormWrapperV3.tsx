'use client';

import { useState, ReactNode, useCallback, useEffect } from 'react';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { sendFormEmail } from '@/lib/send-form-email';
import { sendToVtigerServer } from '@/lib/vtiger-server-integration';
import { 
  isFormRecentlySubmitted, 
  markFormAsSubmitted, 
  getTimeUntilNextSubmission,
  detectBotPatterns 
} from '@/lib/form-protection';

interface VtigerFormWrapperProps {
  children: ReactNode;
  formData: any;
  formType: string;
  onSubmit?: (formData: any) => void;
  onSuccess?: () => void;
  onError?: (error: any) => void;
  resetFormData: () => void;
  className?: string;
  successMessage?: string;
  submitButtonText?: string;
}

export default function VtigerFormWrapperV3({
  children,
  formData,
  formType,
  onSubmit,
  onSuccess,
  onError,
  resetFormData,
  className = '',
  successMessage = 'Thank you! We\'ll contact you within 24 hours.',
  submitButtonText = 'Submit'
}: VtigerFormWrapperProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isFormBlocked, setIsFormBlocked] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  
  // reCAPTCHA v3 hook
  const { executeRecaptcha } = useGoogleReCaptcha();
  
  // Check if form is blocked on mount and set up cooldown timer
  useEffect(() => {
    const checkFormStatus = () => {
      if (isFormRecentlySubmitted(formType)) {
        setIsFormBlocked(true);
        const seconds = getTimeUntilNextSubmission(formType);
        setCooldownSeconds(seconds);
      } else {
        setIsFormBlocked(false);
        setCooldownSeconds(0);
      }
    };
    
    checkFormStatus();
    const interval = setInterval(checkFormStatus, 1000); // Update every second
    
    return () => clearInterval(interval);
  }, [formType]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if form is blocked due to recent submission
    if (isFormBlocked) {
      setSubmitError(`Please wait ${cooldownSeconds} seconds before submitting again`);
      return;
    }
    
    // Detect bot patterns
    const botCheck = detectBotPatterns();
    if (botCheck.isBot) {
      console.warn('Bot detected:', botCheck.reason);
      setSubmitError('Automated submission detected. Please try again manually.');
      return;
    }
    
    // Prevent multiple submissions
    if (isSubmitting || hasSubmitted) {
      console.log('Form already submitted or submitting');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Execute reCAPTCHA v3 (invisible to user) - but make it optional for testing
      let recaptchaToken = '';
      
      if (executeRecaptcha) {
        try {
          // Get reCAPTCHA token (happens in background, no user interaction)
          recaptchaToken = await executeRecaptcha('submit_form');
          console.log('reCAPTCHA v3 token obtained (invisible to user)');
        } catch (recaptchaError) {
          console.warn('reCAPTCHA error (continuing without it):', recaptchaError);
          // Continue without reCAPTCHA for testing
        }
      } else {
        console.warn('reCAPTCHA not available (continuing without it)');
      }

      // Add token to form data
      const formDataWithToken = {
        ...formData,
        recaptchaToken: recaptchaToken || 'not-available'
      };

      // Call custom onSubmit if provided
      if (onSubmit) {
        await onSubmit(formDataWithToken);
      }

      // Send email notification
      await sendFormEmail(formDataWithToken, formType);
      
      // Send to Vtiger CRM
      console.log(`Sending ${formType} to Vtiger CRM...`);
      const vtigerResult = await sendToVtigerServer(formDataWithToken, formType);
      
      if (vtigerResult.success) {
        console.log('✅ Successfully created lead in Vtiger CRM');
        console.log('Lead No:', vtigerResult.leadNo);
      } else {
        console.warn('⚠️ Vtiger submission failed but form continues:', vtigerResult.error);
      }

      // Mark as submitted to prevent duplicates and block for cooldown period
      setHasSubmitted(true);
      setShowSuccess(true);
      markFormAsSubmitted(formType); // Store submission timestamp for rate limiting
      setIsFormBlocked(true); // Immediately block form
      
      // Call success callback
      if (onSuccess) {
        onSuccess();
      }

      // Reset form after 5 seconds
      setTimeout(() => {
        resetFormData();
        setShowSuccess(false);
        setIsSubmitting(false);
        setHasSubmitted(false); // Allow new submission after reset
      }, 5000);

    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitError('Failed to submit form. Please try again.');
      setIsSubmitting(false);

      if (onError) {
        onError(error);
      }
    }
  }, [formData, formType, executeRecaptcha, isSubmitting, hasSubmitted, onSubmit, onSuccess, onError, resetFormData, isFormBlocked, cooldownSeconds]);

  return (
    <form onSubmit={handleSubmit} className={className} autoComplete="on">
      {children}
      
      {/* Submit Button with Multiple States */}
      <button
        type="submit"
        disabled={isSubmitting || hasSubmitted}
        className={`w-full py-4 px-6 font-semibold rounded-lg transition-all duration-200 transform ${
          isSubmitting || hasSubmitted
            ? 'bg-gray-400 cursor-not-allowed opacity-50'
            : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 hover:-translate-y-0.5 hover:shadow-xl'
        }`}
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Submitting...
          </span>
        ) : hasSubmitted ? (
          <span className="flex items-center justify-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Submitted Successfully!
          </span>
        ) : (
          submitButtonText
        )}
      </button>

      {/* Error Message */}
      {submitError && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg animate-shake">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {submitError}
          </div>
        </div>
      )}

      {/* Success Message */}
      {showSuccess && (
        <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg animate-slideIn">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {successMessage}
          </div>
        </div>
      )}

      {/* reCAPTCHA v3 Badge Notice (optional) */}
      <div className="mt-4 text-xs text-gray-500 text-center">
        This site is protected by reCAPTCHA and the Google{' '}
        <a href="https://policies.google.com/privacy" className="underline" target="_blank" rel="noopener noreferrer">
          Privacy Policy
        </a>{' '}
        and{' '}
        <a href="https://policies.google.com/terms" className="underline" target="_blank" rel="noopener noreferrer">
          Terms of Service
        </a>{' '}
        apply.
      </div>
    </form>
  );
}