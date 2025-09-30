'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Shield, Mail } from 'lucide-react';

export default function VerifyPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [otp, setOtp] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (otp.length !== 6) {
      toast.error('Please enter a valid 6-digit code');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3001/api/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ otp })
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Email verified successfully!');
        router.push('/auth/mpin-setup');
      } else {
        toast.error(result.error || 'Invalid verification code');
      }
    } catch (error: any) {
      toast.error('Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/resend-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Verification code resent!');
      } else {
        toast.error('Failed to resend code');
      }
    } catch (error) {
      toast.error('Failed to resend code');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white shadow-lg">
              <Mail className="h-8 w-8" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">Verify Your Email</CardTitle>
          <CardDescription className="text-center">
            Enter the 6-digit verification code sent to your email
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="otp">Verification Code</Label>
              <Input
                id="otp"
                name="otp"
                type="text"
                placeholder="Enter 6-digit code"
                maxLength={6}
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                disabled={isLoading}
                className="text-center text-2xl tracking-wider font-mono"
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="one-time-code"
              />
            </div>

            <div className="flex items-center justify-center">
              <Shield className="h-12 w-12 text-blue-500" />
            </div>

            {/* Demo verification code for testing */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-center">
                <span className="text-yellow-800 font-semibold text-sm">FOR TESTING ONLY</span>
              </div>
              <div className="text-center">
                <span className="text-yellow-700 text-xs">Demo Verification Code:</span>
                <div className="text-2xl font-mono font-bold text-yellow-900 bg-yellow-100 px-3 py-1 rounded border-2 border-dashed border-yellow-300 inline-block mt-1">
                  123456
                </div>
              </div>
              <p className="text-xs text-yellow-600 text-center">
                Use this code for testing the verification flow
              </p>
            </div>

            <div className="space-y-2 text-sm text-gray-600">
              <p className="text-center">
                Didn't receive the code?{' '}
                <button
                  type="button"
                  onClick={handleResendOTP}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                  disabled={isLoading}
                >
                  Resend Code
                </button>
              </p>
            </div>
          </CardContent>
          <div className="px-6 pb-6">
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || otp.length !== 6}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-4 w-4" />
                  Verify
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}