'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { authService } from '@/services/auth.service';
import { toast } from 'sonner';
import { Loader2, Mail, Phone, CheckCircle } from 'lucide-react';
import MonayLogo from '@/components/MonayLogo';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationType, setVerificationType] = useState<'email' | 'phone'>('email');
  const [resendTimer, setResendTimer] = useState(0);

  const email = searchParams.get('email') || '';
  const phone = searchParams.get('phone') || '';

  useEffect(() => {
    if (phone && !email) {
      setVerificationType('phone');
    }
  }, [email, phone]);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (verificationType === 'email') {
        await authService.verifyEmail(email, verificationCode);
        toast.success('Email verified successfully!');
      } else {
        await authService.verifyPhone(phone, verificationCode);
        toast.success('Phone number verified successfully!');
      }

      router.push('/mpin-setup');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsLoading(true);

    try {
      if (verificationType === 'email') {
        await authService.resendEmailVerification(email);
        toast.success('Verification code sent to your email');
      } else {
        await authService.resendPhoneVerification(phone);
        toast.success('Verification code sent to your phone');
      }
      setResendTimer(60); // 60 seconds cooldown
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to resend code');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <MonayLogo />
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Verify Your {verificationType === 'email' ? 'Email' : 'Phone Number'}
          </CardTitle>
          <CardDescription className="text-center">
            {verificationType === 'email' ? (
              <>
                We've sent a verification code to
                <br />
                <span className="font-medium">{email}</span>
              </>
            ) : (
              <>
                We've sent a verification code to
                <br />
                <span className="font-medium">{phone}</span>
              </>
            )}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleVerify}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="verificationCode">Verification Code</Label>
              <Input
                id="verificationCode"
                name="verificationCode"
                placeholder="Enter 6-digit code"
                maxLength={6}
                required
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                disabled={isLoading}
                className="text-center text-2xl tracking-widest"
              />
            </div>
            <div className="flex items-center justify-center">
              {verificationType === 'email' ? (
                <Mail className="h-12 w-12 text-blue-500" />
              ) : (
                <Phone className="h-12 w-12 text-green-500" />
              )}
            </div>
          </CardContent>
          <div className="px-6 pb-6 space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Verify
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleResend}
              disabled={isLoading || resendTimer > 0}
            >
              {resendTimer > 0 ? (
                `Resend code in ${resendTimer}s`
              ) : (
                'Resend Code'
              )}
            </Button>
            <div className="text-sm text-center text-gray-600">
              Didn't receive the code? Check your spam folder or try resending.
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
}