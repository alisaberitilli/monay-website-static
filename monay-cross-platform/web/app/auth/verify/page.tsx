'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { apiService } from '@/lib/api-service';
import { API_ENDPOINTS } from '@/lib/api-config';
import {
  Shield,
  Smartphone,
  Mail,
  RefreshCw,
  CheckCircle,
  ArrowLeft,
  Clock,
  AlertCircle
} from 'lucide-react';

interface VerificationStep {
  type: 'mobile' | 'email';
  label: string;
  icon: React.ReactNode;
  completed: boolean;
  pending: boolean;
}

interface OTPResponse {
  success: boolean;
  message: string;
  data?: {
    otp?: string; // Only in demo mode
    demo?: boolean;
  };
  error?: string;
}

export default function VerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get email and mobile from URL params
  const email = searchParams.get('email') || '';
  const mobile = searchParams.get('mobile') || '';

  // State management
  const [currentStep, setCurrentStep] = useState<'mobile' | 'email'>('mobile');
  const [mobileOtp, setMobileOtp] = useState('');
  const [emailOtp, setEmailOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [demoOtp, setDemoOtp] = useState<{mobile?: string, email?: string}>({});

  // Verification steps
  const [verificationSteps, setVerificationSteps] = useState<VerificationStep[]>([
    {
      type: 'mobile',
      label: `Verify ${mobile}`,
      icon: <Smartphone className="w-5 h-5" />,
      completed: false,
      pending: false
    },
    {
      type: 'email',
      label: `Verify ${email}`,
      icon: <Mail className="w-5 h-5" />,
      completed: false,
      pending: false
    }
  ]);

  // Refs for OTP inputs
  const mobileOtpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const emailOtpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Auto-send OTP for mobile when component mounts
  useEffect(() => {
    if (mobile) {
      sendOTP('mobile');
    }
  }, [mobile]);

  // Send OTP function
  const sendOTP = async (type: 'mobile' | 'email') => {
    setIsLoading(true);
    setError('');

    try {
      const identifier = type === 'mobile' ? mobile : email;
      const response: OTPResponse = await apiService.post(
        API_ENDPOINTS.VERIFICATION.SEND_OTP_UNAUTHENTICATED,
        {
          identifier,
          type: type === 'mobile' ? 'sms' : 'email'
        }
      );

      if (response.success) {
        setSuccess(`OTP sent to your ${type === 'mobile' ? 'phone' : 'email'}`);
        setCountdown(30); // 30 second countdown for resend

        // Store demo OTP for development
        if (response.data?.demo && response.data?.otp) {
          setDemoOtp(prev => ({
            ...prev,
            [type]: response.data!.otp
          }));
        }

        // Update step as pending
        setVerificationSteps(prev => prev.map(step =>
          step.type === type ? { ...step, pending: true } : step
        ));
      } else {
        setError(response.message || response.error || 'Failed to send OTP');
      }
    } catch (error) {
      console.error(`Error sending ${type} OTP:`, error);
      setError(`Failed to send ${type} OTP. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP function
  const resendOTP = async () => {
    if (countdown > 0) return;

    setIsResending(true);
    await sendOTP(currentStep);
    setIsResending(false);
  };

  // Verify OTP function
  const verifyOTP = async (type: 'mobile' | 'email', otp: string) => {
    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const identifier = type === 'mobile' ? mobile : email;
      const response: OTPResponse = await apiService.post(
        API_ENDPOINTS.VERIFICATION.VERIFY_OTP_UNAUTHENTICATED,
        {
          identifier,
          type: type === 'mobile' ? 'sms' : 'email',
          otp
          // userId is now optional - backend will find user by identifier
        }
      );

      if (response.success) {
        // Mark step as completed
        setVerificationSteps(prev => prev.map(step =>
          step.type === type ? { ...step, completed: true, pending: false } : step
        ));

        setSuccess(`${type === 'mobile' ? 'Phone' : 'Email'} verified successfully!`);

        // Move to next step or complete verification
        if (type === 'mobile') {
          setCurrentStep('email');
          if (email) {
            setTimeout(() => sendOTP('email'), 1000);
          }
        } else {
          // Both verifications completed
          setTimeout(() => {
            router.push('/auth/mpin-setup');
          }, 2000);
        }
      } else {
        setAttempts(prev => prev + 1);
        setError(response.message || 'Invalid OTP. Please try again.');
      }
    } catch (error) {
      console.error(`Error verifying ${type} OTP:`, error);
      setError('Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP input
  const handleOtpInput = (
    value: string,
    index: number,
    type: 'mobile' | 'email',
    refs: React.MutableRefObject<(HTMLInputElement | null)[]>
  ) => {
    const newOtp = type === 'mobile' ? mobileOtp.split('') : emailOtp.split('');
    newOtp[index] = value;
    const otpString = newOtp.join('');

    if (type === 'mobile') {
      setMobileOtp(otpString);
    } else {
      setEmailOtp(otpString);
    }

    // Auto-focus next input
    if (value && index < 5) {
      refs.current[index + 1]?.focus();
    }

    // Auto-verify when all digits entered
    if (otpString.length === 6) {
      verifyOTP(type, otpString);
    }
  };

  // Handle backspace
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
    refs: React.MutableRefObject<(HTMLInputElement | null)[]>
  ) => {
    if (e.key === 'Backspace' && !e.currentTarget.value && index > 0) {
      refs.current[index - 1]?.focus();
    }
  };

  const renderOtpInputs = (
    otp: string,
    type: 'mobile' | 'email',
    refs: React.MutableRefObject<(HTMLInputElement | null)[]>
  ) => {
    return (
      <div className="flex justify-center space-x-3 mb-6">
        {Array.from({ length: 6 }, (_, index) => (
          <input
            key={index}
            ref={(el) => { refs.current[index] = el; }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={otp[index] || ''}
            onChange={(e) => handleOtpInput(e.target.value, index, type, refs)}
            onKeyDown={(e) => handleKeyDown(e, index, refs)}
            className="w-12 h-12 text-center text-lg font-semibold border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
            disabled={isLoading}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-purple-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Account</h1>
            <p className="text-gray-600">
              Complete verification to secure your account
            </p>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              {verificationSteps.map((step, index) => (
                <div key={step.type} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    step.completed
                      ? 'bg-green-500 text-white'
                      : step.pending || step.type === currentStep
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step.completed ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      step.icon
                    )}
                  </div>
                  {index < verificationSteps.length - 1 && (
                    <div className={`w-8 h-0.5 mx-2 transition-colors ${
                      step.completed ? 'bg-green-500' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">
                {currentStep === 'mobile' ? 'Step 1: Verify Phone' : 'Step 2: Verify Email'}
              </p>
            </div>
          </div>

          {/* Current Step Content */}
          <div className="space-y-6">
            {currentStep === 'mobile' && (
              <div>
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Verify Phone Number</h3>
                  <p className="text-gray-600">
                    Enter the 6-digit code sent to <span className="font-medium">{mobile}</span>
                  </p>
                  {demoOtp.mobile && (
                    <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        <strong>Demo Mode:</strong> Use OTP: <code className="bg-yellow-100 px-1 rounded">{demoOtp.mobile}</code>
                      </p>
                      <p className="text-xs text-yellow-600 mt-1">
                        Check SMS simulator at <a href="http://localhost:3030" target="_blank" rel="noopener noreferrer" className="underline">localhost:3030</a>
                      </p>
                    </div>
                  )}
                </div>
                {renderOtpInputs(mobileOtp, 'mobile', mobileOtpRefs)}
              </div>
            )}

            {currentStep === 'email' && (
              <div>
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Verify Email Address</h3>
                  <p className="text-gray-600">
                    Enter the 6-digit code sent to <span className="font-medium">{email}</span>
                  </p>
                  {demoOtp.email && (
                    <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        <strong>Demo Mode:</strong> Use OTP: <code className="bg-yellow-100 px-1 rounded">{demoOtp.email}</code>
                      </p>
                      <p className="text-xs text-yellow-600 mt-1">
                        Check MailHog at <a href="http://localhost:8025" target="_blank" rel="noopener noreferrer" className="underline">localhost:8025</a>
                      </p>
                    </div>
                  )}
                </div>
                {renderOtpInputs(emailOtp, 'email', emailOtpRefs)}
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="p-4 bg-green-50 border border-green-100 rounded-2xl">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  <p className="text-green-700 text-sm font-medium">{success}</p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                  <p className="text-red-700 text-sm font-medium">{error}</p>
                </div>
              </div>
            )}

            {/* Resend OTP */}
            <div className="text-center">
              {countdown > 0 ? (
                <p className="text-gray-600 text-sm flex items-center justify-center">
                  <Clock className="w-4 h-4 mr-1" />
                  Resend code in {countdown}s
                </p>
              ) : (
                <button
                  onClick={resendOTP}
                  disabled={isResending}
                  className="text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center justify-center disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 mr-1 ${isResending ? 'animate-spin' : ''}`} />
                  {isResending ? 'Sending...' : 'Resend Code'}
                </button>
              )}
            </div>

            {/* Back Button */}
            <div className="text-center pt-4">
              <Link
                href="/auth/register-with-account-type"
                className="text-gray-600 hover:text-gray-700 text-sm flex items-center justify-center"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Registration
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-gray-500 text-sm">
            Need help? <Link href="/support" className="text-purple-600 hover:text-purple-700">Contact Support</Link>
          </p>
        </div>
      </div>
    </div>
  );
}