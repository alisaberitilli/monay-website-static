'use client';

import { useState } from 'react';
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
  Globe
} from 'lucide-react';

export default function RegisterPage() {
  const { register, isAuthenticated } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    mobileNumber: '',
    password: '',
    confirmPassword: '',
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Check if form is valid and ready to submit
  const isFormValid = agreedToTerms && 
    formData.firstName && 
    formData.lastName && 
    formData.mobileNumber && 
    formData.password && 
    formData.confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.mobileNumber || 
        !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (formData.mobileNumber.length < 10) {
      setError('Please enter a valid mobile number');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (!agreedToTerms) {
      setError('Please agree to the Terms & Conditions and Privacy Policy');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      console.log('Attempting registration with data:', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: '', // Email is optional for mobile apps
        mobileNumber: formData.mobileNumber,
        password: formData.password,
      });
      
      await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: '', // Email is optional for mobile apps
        mobileNumber: formData.mobileNumber,
        password: formData.password,
      });
      
      // Check if user is authenticated after registration
      // If not, registration succeeded but auto-login failed
      if (!isAuthenticated) {
        setError('');
        alert('Registration successful! Please login with your credentials.');
        router.push('/auth/login');
      } else {
        router.replace('/dashboard');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError(`Registration failed: ${error.message || 'Please try again.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Registration Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Logo and Welcome */}
          <div className="mb-10">
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">M</span>
              </div>
              <span className="ml-3 text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Monay
              </span>
            </div>
            
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              Create your account
            </h1>
            <p className="text-gray-600 text-lg">
              Join millions who trust Monay for their finances
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl">
              <p className="text-red-600 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Debug Info - Remove this after testing */}
          <div className="mb-4 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
            <p>Terms agreed: {agreedToTerms ? 'YES' : 'NO'}</p>
            <p>Form valid: {isFormValid ? 'YES' : 'NO'}</p>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    name="firstName"
                    type="text"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="input-modern pl-12"
                    required
                    autoComplete="given-name"
                    autoCapitalize="words"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    name="lastName"
                    type="text"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="input-modern pl-12"
                    required
                    autoComplete="family-name"
                    autoCapitalize="words"
                  />
                </div>
              </div>
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
                  placeholder="Enter full mobile number (e.g., +13016821633)"
                  value={formData.mobileNumber}
                  onChange={handleChange}
                  className="input-modern pl-12 w-full"
                  maxLength={20}
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
                  autoComplete="new-password"
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
                  autoComplete="new-password"
                />
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start">
              <div 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Checkbox clicked, current state:', agreedToTerms);
                  setAgreedToTerms(!agreedToTerms);
                }}
                className={`w-6 h-6 border-2 rounded cursor-pointer flex items-center justify-center mt-0.5 transition-all ${
                  agreedToTerms 
                    ? 'bg-purple-600 border-purple-600' 
                    : 'bg-white border-gray-300 hover:border-purple-400'
                }`}
              >
                {agreedToTerms && (
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <label 
                onClick={(e) => {
                  e.preventDefault();
                  console.log('Label clicked, current state:', agreedToTerms);
                  setAgreedToTerms(!agreedToTerms);
                }}
                className="ml-3 text-sm text-gray-600 cursor-pointer select-none"
              >
                I agree to the{' '}
                <Link 
                  href="/terms" 
                  className="text-purple-600 hover:text-purple-700 font-medium"
                  onClick={(e) => e.stopPropagation()}
                >
                  Terms & Conditions
                </Link>
                {' '}and{' '}
                <Link 
                  href="/privacy" 
                  className="text-purple-600 hover:text-purple-700 font-medium"
                  onClick={(e) => e.stopPropagation()}
                >
                  Privacy Policy
                </Link>
              </label>
            </div>

            {/* Sign Up Button */}
            <button
              type="submit"
              disabled={isLoading || !isFormValid}
              className={`w-full btn-modern group ${
                isFormValid && !isLoading
                  ? 'btn-gradient hover:shadow-xl' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <span className="relative z-10 flex items-center justify-center">
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">Or sign up with</span>
              </div>
            </div>

            {/* Social Sign Up */}
            <div className="grid grid-cols-2 gap-4">
              <button type="button" className="flex items-center justify-center px-4 py-3 border-2 border-gray-200 rounded-2xl hover:bg-gray-50 transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="ml-2 text-gray-700 font-medium">Google</span>
              </button>
              
              <button type="button" className="flex items-center justify-center px-4 py-3 border-2 border-gray-200 rounded-2xl hover:bg-gray-50 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
                </svg>
                <span className="ml-2 text-gray-700 font-medium">GitHub</span>
              </button>
            </div>

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
            Start your financial journey
          </h2>
          <p className="text-xl mb-12 text-white/90">
            Join millions who are taking control of their finances with Monay's powerful features.
          </p>
          
          {/* Feature Cards */}
          <div className="space-y-4">
            <div className="flex items-start space-x-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Globe className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Global Payments</h3>
                <p className="text-sm text-white/80">Send and receive money worldwide instantly</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Secure & Protected</h3>
                <p className="text-sm text-white/80">Bank-level encryption keeps your money safe</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <CheckCircle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Easy Setup</h3>
                <p className="text-sm text-white/80">Get started in minutes with simple verification</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Zap className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Lightning Fast</h3>
                <p className="text-sm text-white/80">Instant transactions and real-time updates</p>
              </div>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-12 pt-8 border-t border-white/20">
            <div className="flex items-center justify-between text-white/80">
              <div className="text-center">
                <div className="text-2xl font-bold">10M+</div>
                <div className="text-xs">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">150+</div>
                <div className="text-xs">Countries</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">$5B+</div>
                <div className="text-xs">Transferred</div>
              </div>
            </div>
          </div>

          {/* Floating Elements */}
          <div className="absolute top-20 right-20 w-20 h-20 bg-white/10 rounded-full blur-2xl float-animation"></div>
          <div className="absolute bottom-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-3xl float-animation" style={{ animationDelay: '2s' }}></div>
        </div>
      </div>
    </div>
  );
}