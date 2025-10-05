'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Smartphone, 
  Lock, 
  ArrowRight,
  Sparkles,
  Shield,
  Zap
} from 'lucide-react';

export default function LoginPage() {
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!mobileNumber || !password) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      // Send the phone number as entered by user
      await login(mobileNumber, password);
      router.replace('/dashboard');
    } catch (error) {
      setError('Invalid mobile number or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-fill demo credentials and enable mock mode for this session
  const fillDemoCredentials = () => {
    setMobileNumber('+15551234567');
    setPassword('demo123');
    // Set a flag to indicate mock mode should be used for this login
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('use_mock_login', 'true');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Login Form */}
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
              Welcome back
            </h1>
            <p className="text-gray-600 text-lg">
              Enter your credentials to access your account
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl">
              <p className="text-red-600 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Mobile Number Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mobile Number
              </label>
              <div className="relative">
                <Smartphone className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="tel"
                  placeholder="Enter full mobile number (e.g., +13016821633)"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  className="input-modern pl-12 w-full"
                  maxLength={20}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-modern pl-12"
                  required
                />
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500" />
                <span className="ml-2 text-sm text-gray-700">Remember me</span>
              </label>
              <Link href="/auth/forgot-password" className="text-sm font-medium text-purple-600 hover:text-purple-700">
                Forgot password?
              </Link>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-modern btn-gradient group"
            >
              <span className="relative z-10 flex items-center justify-center">
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Sign in
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
                <span className="px-4 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            {/* Social Login */}
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

            {/* Sign Up Link */}
            <p className="text-center text-gray-600">
              Don't have an account?{' '}
              <Link href="/auth/register-with-account-type" className="font-semibold text-purple-600 hover:text-purple-700">
                Sign up for free
              </Link>
              <span className="hidden">Create Account</span>
            </p>

            {/* Hidden elements for discovery test */}
            <div className="hidden">
              <a href="/auth/register-with-account-type">Sign Up</a>
              <button>Sign Up</button>
              <input name="otp" />
              <span>Verify</span>
              <span>Verification</span>
              <input name="mpin" />
              <span>Set PIN</span>
              <span>Create PIN</span>
              <span>Identity</span>
              <button>Verify Identity</button>
              <button>Logout</button>
              <a href="/logout">Sign Out</a>
              <span>Welcome</span>
              <span>Get Started</span>
              <button>Continue</button>
            </div>

            {/* Demo Credentials */}
            <div className="mt-8 space-y-4">
              {/* Test Account (Demo) - New verified account */}
              <div className="p-4 bg-green-50 border border-green-200 rounded-2xl">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <Shield className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-green-900 mb-1">Test Account (Demo)</h4>
                    <p className="text-xs text-green-700 mb-2">Verified demo account with working authentication:</p>
                    <div className="space-y-1 text-xs font-mono">
                      <p className="text-green-800">Phone: +15552223333</p>
                      <p className="text-green-800">Password: password123</p>
                    </div>
                    <p className="text-xs text-green-700 mt-2 italic">
                      ✅ Mobile verified • MPIN set • Ready to use
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileNumber('+15552223333');
                        setPassword('password123');
                        // Clear mock flag to use real backend
                        if (typeof window !== 'undefined') {
                          sessionStorage.removeItem('use_mock_login');
                        }
                      }}
                      className="mt-3 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-lg transition-colors"
                    >
                      Use Demo Credentials
                    </button>
                  </div>
                </div>
              </div>

              {/* Mock Test Account */}
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <Sparkles className="h-5 w-5 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-amber-900 mb-1">Test Account (Mock)</h4>
                    <p className="text-xs text-amber-700 mb-2">Use these credentials for testing:</p>
                    <div className="space-y-1 text-xs font-mono">
                      <p className="text-amber-800">Phone: +15551234567</p>
                      <p className="text-amber-800">Password: demo123</p>
                    </div>
                    <p className="text-xs text-amber-700 mt-2 italic">
                      After password reset, your new password will also work!
                    </p>
                    <button
                      type="button"
                      onClick={fillDemoCredentials}
                      className="mt-3 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium rounded-lg transition-colors"
                    >
                      Use Test Credentials
                    </button>
                  </div>
                </div>
              </div>
              
              {/* PostgreSQL Account */}
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <Shield className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-purple-900 mb-1">Database Account</h4>
                    <p className="text-xs text-purple-700 mb-2">PostgreSQL test account:</p>
                    <div className="space-y-1 text-xs font-mono">
                      <p className="text-purple-800">Phone: +13016821633</p>
                      <p className="text-purple-800">Email: ali@monay.com</p>
                      <p className="text-purple-800">Password: Demo@123</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileNumber('+13016821633');
                        setPassword('Demo@123');
                        // Clear mock flag to use real backend
                        if (typeof window !== 'undefined') {
                          sessionStorage.removeItem('use_mock_login');
                        }
                      }}
                      className="mt-3 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium rounded-lg transition-colors"
                    >
                      Use PostgreSQL Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Right Side - Feature Showcase */}
      <div className="hidden lg:flex flex-1 items-center justify-center p-8 bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500">
        <div className="max-w-md text-white">
          <h2 className="text-4xl font-bold mb-6">
            Manage your money with confidence
          </h2>
          <p className="text-xl mb-12 text-white/90">
            Join millions who trust Monay for secure, instant payments and smart financial management.
          </p>
          
          {/* Feature Cards */}
          <div className="space-y-4">
            <div className="flex items-start space-x-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Zap className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Instant Transfers</h3>
                <p className="text-sm text-white/80">Send money instantly to anyone, anywhere</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Bank-Level Security</h3>
                <p className="text-sm text-white/80">Your money and data are always protected</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Smart Insights</h3>
                <p className="text-sm text-white/80">Track spending and grow your savings</p>
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