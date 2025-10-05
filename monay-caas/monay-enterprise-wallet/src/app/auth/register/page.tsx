'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, UserPlus } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    organizationName: '',
    organizationId: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('🚀 Registration form submitted');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      console.error('❌ Password mismatch');
      return;
    }

    // Validate password strength
    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      console.error('❌ Password too short');
      return;
    }

    setIsLoading(true);

    try {
      // Save registration data to localStorage for use in KYC
      const registrationDataForKYC = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        organizationName: formData.organizationName,
        organizationId: formData.organizationId || ''
      };
      localStorage.setItem('enterpriseRegistrationData', JSON.stringify(registrationDataForKYC));
      console.log('💾 Saved registration data for KYC:', registrationDataForKYC);

      const requestBody = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone_number: formData.phoneNumber,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        organizationName: formData.organizationName,
        organizationId: formData.organizationId || undefined, // Send as undefined if empty
        deviceType: 'WEB',
        userType: 'enterprise',
        accountType: 'enterprise'
      };

      console.log('📤 Sending registration request:', { ...requestBody, password: '***', confirmPassword: '***' });

      const response = await fetch('http://localhost:3001/api/auth/register/organization', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      console.log('📥 Response status:', response.status);

      const result = await response.json();
      console.log('📥 Response data:', result);

      if (response.ok && result.success) {
        toast.success('Account created successfully! Redirecting to login...');
        console.log('✅ Registration successful');

        // Store auth token if provided
        if (result.data?.token) {
          localStorage.setItem('auth_token', result.data.token);
          localStorage.setItem('user', JSON.stringify(result.data.user));
          console.log('✅ Auth token stored');
        }

        // Redirect to login or dashboard
        setTimeout(() => {
          router.push('/auth/login');
        }, 1500);
      } else {
        const errorMessage = result.error || result.message || 'Failed to create account';
        toast.error(errorMessage);
        console.error('❌ Registration failed:', errorMessage);
      }
    } catch (error: any) {
      console.error('❌ Registration error:', error);
      toast.error('Registration failed. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              M
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">Create Enterprise Account</CardTitle>
          <CardDescription className="text-center">
            Sign up for Enterprise Wallet access
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  placeholder="John"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  placeholder="Doe"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="admin@company.com"
                required
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                placeholder="+1 555-123-4567"
                required
                value={formData.phoneNumber}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="organizationName">Organization Name</Label>
                <Input
                  id="organizationName"
                  name="organizationName"
                  placeholder="ACME Corp"
                  required
                  value={formData.organizationName}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="organizationId">
                  Organization ID <span className="text-gray-400 text-xs">(Optional)</span>
                </Label>
                <Input
                  id="organizationId"
                  name="organizationId"
                  placeholder="Leave blank for new organization"
                  value={formData.organizationId}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Only enter if joining an existing organization
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Create Enterprise Account
                </>
              )}
            </Button>
            <div className="text-sm text-center text-gray-600">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-blue-600 hover:underline">
                Sign In
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}