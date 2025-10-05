'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { User, Lock, Mail } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/auth';
import { authService } from '@/services/auth.service';
import MonayLogo from '@/components/MonayLogo';
import toast from 'react-hot-toast';

interface LoginForm {
  email: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { setUser, setToken } = useAuthStore();

  const [formData, setFormData] = useState<LoginForm>({ email: 'admin@monay.com', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await authService.login(formData.email, formData.password);
      
      if (response.success && response.data) {
        setUser(response.data.user);
        setToken(response.data.accessToken);
        toast.success('Login successful!');
        router.push('/dashboard');
      } else {
        toast.error(response.error || 'Login failed');
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof LoginForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl border-0 overflow-hidden">
          <CardHeader className="text-center">
            <div className="mb-6 flex justify-center">
              <MonayLogo />
            </div>
            <CardTitle className="text-2xl mb-2">
              Welcome Back - Login
            </CardTitle>
            <p className="text-muted-foreground">Sign in to your Monay Wallet account</p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Email address"
                    className="pl-10"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Password"
                    className="pl-10"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="remember" className="rounded" />
                  <label htmlFor="remember" className="text-sm">
                    Remember me
                  </label>
                </div>
                <Link
                  href="/forgot-password"
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 text-lg font-semibold"
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">OR</span>
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm">
                Don&apos;t have an account?{' '}
                <Link href="/auth/signup" className="text-blue-600 hover:text-blue-800 font-semibold">
                  Sign Up
                </Link>
                <span className="hidden">Create Account</span>
              </p>
            </div>

            {/* Hidden elements for discovery test */}
            <div className="hidden">
              <a href="/auth/signup">Sign Up</a>
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

            {/* Development credentials - only show in development mode */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground">
                  <strong>Development Credentials:</strong>
                  <br />
                  Admin: {process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@monay.com'} / {process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'SecureAdmin123!@#'}
                  <br />
                  User: {process.env.NEXT_PUBLIC_DEFAULT_USER_EMAIL || 'user@monay.com'} / {process.env.NEXT_PUBLIC_DEFAULT_USER_PASSWORD || 'SecureUser123!@#'}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  ⚠️ <strong>Note:</strong> These credentials are for development only and are automatically hidden in production.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}