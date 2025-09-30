'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { authService } from '@/services/auth.service';
import { toast } from 'sonner';
import { Loader2, Lock, Shield } from 'lucide-react';
import MonayLogo from '@/components/MonayLogo';

export default function MPINSetupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [mpin, setMpin] = useState('');
  const [confirmMpin, setConfirmMpin] = useState('');
  const [step, setStep] = useState<'create' | 'confirm'>('create');

  const handleMPINChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 6) {
      if (step === 'create') {
        setMpin(value);
        if (value.length === 6) {
          setStep('confirm');
        }
      } else {
        setConfirmMpin(value);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (step === 'create') {
      if (mpin.length !== 6) {
        toast.error('MPIN must be 6 digits');
        return;
      }
      setStep('confirm');
      return;
    }

    if (mpin !== confirmMpin) {
      toast.error('MPINs do not match');
      setConfirmMpin('');
      return;
    }

    setIsLoading(true);

    try {
      await authService.setupMPIN(mpin);
      toast.success('MPIN setup successful!');
      router.push('/kyc');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to setup MPIN');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setStep('create');
    setConfirmMpin('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <MonayLogo />
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            {step === 'create' ? 'Create PIN' : 'Confirm Your MPIN'}
          </CardTitle>
          <CardDescription className="text-center">
            {step === 'create'
              ? 'Set PIN up a 6-digit MPIN for secure access'
              : 'Please re-enter your MPIN to confirm'
            }
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="mpin">
                {step === 'create' ? 'Set PIN - Enter 6-Digit MPIN' : 'Confirm 6-Digit MPIN'}
              </Label>
              <Input
                id="mpin"
                name="mpin"
                type="password"
                placeholder="• • • • • •"
                maxLength={6}
                required
                value={step === 'create' ? mpin : confirmMpin}
                onChange={handleMPINChange}
                disabled={isLoading}
                className="text-center text-3xl tracking-[1rem] font-mono"
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="off"
              />
            </div>

            <div className="flex items-center justify-center">
              {step === 'create' ? (
                <Lock className="h-12 w-12 text-blue-500" />
              ) : (
                <Shield className="h-12 w-12 text-green-500" />
              )}
            </div>

            <div className="space-y-2 text-sm text-gray-600">
              <p className="font-semibold">MPIN Security Tips:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Don't use sequential numbers (123456)</li>
                <li>Avoid repeating digits (111111)</li>
                <li>Don't use your birthdate</li>
                <li>Keep your MPIN private and secure</li>
              </ul>
            </div>
          </CardContent>
          <div className="px-6 pb-6 space-y-4">
            {step === 'confirm' && (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleBack}
                disabled={isLoading}
              >
                Back
              </Button>
            )}
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || (step === 'create' && mpin.length !== 6)}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Setting up MPIN...
                </>
              ) : step === 'create' ? (
                'Create PIN'
              ) : (
                'Complete Setup'
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}