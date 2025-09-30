'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import {
  User,
  Smartphone,
  Lock,
  ArrowRight,
  Shield,
  CheckCircle,
  Zap,
  Globe,
  Building2,
  Briefcase,
  UserCircle
} from 'lucide-react';

type AccountType = 'individual' | 'business' | 'enterprise';

export default function RegisterWithAccountTypePage() {
  const { register, isAuthenticated } = useAuth();
  const router = useRouter();

  // Step management
  const [currentStep, setCurrentStep] = useState<'account-type' | 'form'>('account-type');
  const [accountType, setAccountType] = useState<AccountType | null>(null);

  // Form data
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobileNumber: '',
    password: '',
    confirmPassword: '',
    // Business specific fields
    businessName: '',
    businessType: '',
    // Enterprise specific fields
    organizationId: '',
    inviteCode: '',
  });

  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleAccountTypeSelection = (type: AccountType) => {
    setAccountType(type);
    setCurrentStep('form');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Check if form is valid based on account type
  const isFormValid = () => {
    const baseValid = agreedToTerms &&
      formData.firstName &&
      formData.lastName &&
      formData.email &&
      formData.mobileNumber &&
      formData.password &&
      formData.confirmPassword;

    if (accountType === 'business') {
      return baseValid && formData.businessName;
    } else if (accountType === 'enterprise') {
      return baseValid && (formData.organizationId || formData.inviteCode);
    }

    return baseValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Prepare registration data based on account type
      let registrationData: any = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        mobileNumber: formData.mobileNumber,
        password: formData.password,
      };

      // Determine the correct endpoint based on account type
      let endpoint = '/auth/register/consumer'; // Default

      if (accountType === 'individual') {
        endpoint = '/auth/register/consumer';
        registrationData.userType = 'individual';
      } else if (accountType === 'business') {
        endpoint = '/auth/register/business';
        registrationData.businessName = formData.businessName;
        registrationData.businessType = formData.businessType || 'small_business';
      } else if (accountType === 'enterprise') {
        endpoint = '/auth/register/enterprise';
        if (formData.organizationId) {
          registrationData.organizationId = formData.organizationId;
        }
        if (formData.inviteCode) {
          registrationData.inviteCode = formData.inviteCode;
        }
      }

      console.log(`Registering as ${accountType} to ${endpoint}:`, registrationData);

      // Use the register function with the specific endpoint
      await register(registrationData, endpoint);

      // Check if user is authenticated after registration
      if (!isAuthenticated) {
        setError('');
        setSuccess('Registration successful! Redirecting to verification...');
        // Redirect to verification after showing success message
        setTimeout(() => {
          router.push(`/auth/verify?email=${encodeURIComponent(formData.email)}&mobile=${encodeURIComponent(formData.mobileNumber)}`);
        }, 2000);
      } else {
        router.replace('/dashboard');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setSuccess(''); // Clear any success message
      setError(`Registration failed: ${(error as Error).message || 'Please try again.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Account Type Selection Screen
  if (currentStep === 'account-type') {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="w-full max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-xl">
                <span className="text-white font-bold text-2xl">M</span>
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              Choose Your Account Type
            </h1>
            <p className="text-lg text-gray-600">
              Select the type of account that best fits your needs
            </p>
          </div>

          {/* Account Type Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Individual Account */}
            <div
              onClick={() => handleAccountTypeSelection('individual')}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all cursor-pointer border-2 border-transparent hover:border-purple-500 group"
            >
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-purple-200 transition-colors">
                <UserCircle className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Personal Account</h3>
              <p className="text-gray-600 mb-6">
                Perfect for individuals managing personal finances
              </p>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Personal wallet & cards</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Send & receive money instantly</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Bill payments & savings</span>
                </li>
              </ul>
              <button className="w-full mt-8 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-semibold">
                Get Started
              </button>
            </div>

            {/* Small Business Account */}
            <div
              onClick={() => handleAccountTypeSelection('business')}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all cursor-pointer border-2 border-transparent hover:border-purple-500 group relative"
            >
              <div className="absolute -top-3 -right-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs px-3 py-1 rounded-full font-semibold">
                POPULAR
              </div>
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-purple-200 transition-colors">
                <Briefcase className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Small Business</h3>
              <p className="text-gray-600 mb-6">
                Ideal for entrepreneurs and small business owners
              </p>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Business wallet & cards</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Accept payments</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Employee management</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Business analytics</span>
                </li>
              </ul>
              <button className="w-full mt-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold">
                Start Business Account
              </button>
            </div>

            {/* Enterprise Account */}
            <div
              onClick={() => handleAccountTypeSelection('enterprise')}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all cursor-pointer border-2 border-transparent hover:border-purple-500 group"
            >
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-purple-200 transition-colors">
                <Building2 className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Enterprise</h3>
              <p className="text-gray-600 mb-6">
                For established companies with advanced needs
              </p>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Multi-user access</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Advanced permissions</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>API integration</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Dedicated support</span>
                </li>
              </ul>
              <button className="w-full mt-8 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-semibold">
                Join Organization
              </button>
            </div>
          </div>

          {/* Back to Login */}
          <div className="text-center mt-12">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link href="/auth/login" className="font-semibold text-purple-600 hover:text-purple-700">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Registration Form
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Registration Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Back Button */}
          <button
            onClick={() => setCurrentStep('account-type')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowRight className="w-5 h-5 mr-2 rotate-180" />
            Choose different account type
          </button>

          {/* Logo and Welcome */}
          <div className="mb-8">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">M</span>
              </div>
              <span className="ml-3 text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Monay
              </span>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Create your {accountType === 'business' ? 'Business' : accountType === 'enterprise' ? 'Enterprise' : 'Personal'} Account
            </h1>
            <p className="text-gray-600">
              {accountType === 'business'
                ? 'Set up your business account to start accepting payments'
                : accountType === 'enterprise'
                ? 'Join your organization to collaborate with your team'
                : 'Get started with your personal financial journey'}
            </p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-2xl">
              <p className="text-green-600 text-sm font-medium">{success}</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl">
              <p className="text-red-600 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <input
                  name="firstName"
                  type="text"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="input-modern"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <input
                  name="lastName"
                  type="text"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="input-modern"
                  required
                />
              </div>
            </div>

            {/* Business Name - Only for business accounts */}
            {accountType === 'business' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Name
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    name="businessName"
                    type="text"
                    placeholder="Your Business Name"
                    value={formData.businessName}
                    onChange={handleChange}
                    className="input-modern pl-12"
                    required
                  />
                </div>
              </div>
            )}

            {/* Enterprise Fields - Only for enterprise accounts */}
            {accountType === 'enterprise' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Organization Invite Code or ID
                </label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    name="inviteCode"
                    type="text"
                    placeholder="Enter invite code or organization ID"
                    value={formData.inviteCode}
                    onChange={handleChange}
                    className="input-modern pl-12"
                    required={!formData.organizationId}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Ask your organization admin for the invite code
                </p>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                name="email"
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={handleChange}
                className="input-modern"
                required
              />
            </div>

            {/* Mobile Number Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mobile Number
              </label>
              <div className="relative">
                <Smartphone className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  name="mobileNumber"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={formData.mobileNumber}
                  onChange={handleChange}
                  className="input-modern pl-12"
                  required
                />
              </div>
            </div>

            {/* Password Fields */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  name="password"
                  type="password"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input-modern pl-12"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="input-modern pl-12"
                  required
                />
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start">
              <input
                type="checkbox"
                id="terms"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-1 w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <label htmlFor="terms" className="ml-3 text-sm text-gray-600">
                I agree to the{' '}
                <Link href="/terms" className="text-purple-600 hover:text-purple-700 font-medium">
                  Terms & Conditions
                </Link>
                {' '}and{' '}
                <Link href="/privacy" className="text-purple-600 hover:text-purple-700 font-medium">
                  Privacy Policy
                </Link>
              </label>
            </div>

            {/* Sign Up Button */}
            <button
              type="submit"
              disabled={isLoading || !isFormValid()}
              className={`w-full btn-modern group ${
                isFormValid() && !isLoading
                  ? 'btn-gradient hover:shadow-xl'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <span className="relative z-10 flex items-center justify-center">
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Create {accountType === 'business' ? 'Business' : accountType === 'enterprise' ? 'Enterprise' : 'Personal'} Account
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
            </button>

            {/* Login Link */}
            <p className="text-center text-gray-600">
              Already have an account?{' '}
              <Link href="/auth/login" className="font-semibold text-purple-600 hover:text-purple-700">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>

      {/* Right Side - Feature Showcase */}
      <div className="hidden lg:flex flex-1 items-center justify-center p-8 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600">
        <div className="max-w-md text-white">
          <h2 className="text-4xl font-bold mb-6">
            {accountType === 'business'
              ? 'Grow Your Business'
              : accountType === 'enterprise'
              ? 'Enterprise Solutions'
              : 'Start Your Journey'}
          </h2>
          <p className="text-xl mb-12 text-white/90">
            {accountType === 'business'
              ? 'Powerful tools to manage your business finances and accept payments globally.'
              : accountType === 'enterprise'
              ? 'Advanced features for teams with enterprise-grade security and compliance.'
              : 'Take control of your finances with our powerful and secure platform.'}
          </p>

          {/* Feature Cards */}
          <div className="space-y-4">
            {accountType === 'business' ? (
              <>
                <FeatureCard icon={<Briefcase />} title="Business Dashboard" description="Comprehensive overview of your business finances" />
                <FeatureCard icon={<Globe />} title="Global Payments" description="Accept payments from customers worldwide" />
                <FeatureCard icon={<Shield />} title="Fraud Protection" description="Advanced security for your transactions" />
                <FeatureCard icon={<Zap />} title="Instant Settlements" description="Get your money faster with instant payouts" />
              </>
            ) : accountType === 'enterprise' ? (
              <>
                <FeatureCard icon={<Building2 />} title="Multi-User Access" description="Manage permissions for your entire team" />
                <FeatureCard icon={<Shield />} title="Enterprise Security" description="Bank-level encryption and compliance" />
                <FeatureCard icon={<Globe />} title="API Integration" description="Connect with your existing systems" />
                <FeatureCard icon={<CheckCircle />} title="Dedicated Support" description="24/7 priority support for your team" />
              </>
            ) : (
              <>
                <FeatureCard icon={<Globe />} title="Global Payments" description="Send and receive money worldwide instantly" />
                <FeatureCard icon={<Shield />} title="Secure & Protected" description="Bank-level encryption keeps your money safe" />
                <FeatureCard icon={<CheckCircle />} title="Easy Setup" description="Get started in minutes with simple verification" />
                <FeatureCard icon={<Zap />} title="Lightning Fast" description="Instant transactions and real-time updates" />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Feature Card Component
function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex items-start space-x-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4">
      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
        {React.cloneElement(icon as React.ReactElement, { className: 'h-6 w-6' })}
      </div>
      <div>
        <h3 className="font-semibold mb-1">{title}</h3>
        <p className="text-sm text-white/80">{description}</p>
      </div>
    </div>
  );
}