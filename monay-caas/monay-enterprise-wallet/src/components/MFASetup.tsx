'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Shield,
  Smartphone,
  Key,
  Copy,
  Check,
  AlertTriangle,
  Download,
  QrCode,
  Lock,
  Mail,
  Phone,
  RefreshCw,
  Eye,
  EyeOff,
  ChevronRight,
  Info,
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';

interface MFASetupProps {
  onComplete?: () => void;
  onCancel?: () => void;
}

export function MFASetup({ onComplete, onCancel }: MFASetupProps) {
  const [step, setStep] = useState<'intro' | 'setup' | 'verify' | 'backup' | 'complete'>('intro');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [manualEntry, setManualEntry] = useState<any>(null);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [showManual, setShowManual] = useState(false);
  const { toast } = useToast();

  const handleSetupStart = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.post('/api/mfa/setup');
      
      setQrCode(response.data.data.qrCode);
      setManualEntry(response.data.data.manual);
      setBackupCodes(response.data.data.backupCodes);
      setStep('setup');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to initialize MFA setup');
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async () => {
    if (verificationCode.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await apiClient.post('/api/mfa/verify-setup', {
        token: verificationCode
      });

      setStep('backup');
      toast({
        title: 'MFA Enabled',
        description: 'Two-factor authentication has been successfully enabled',
      });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleDownloadCodes = () => {
    const content = backupCodes.join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'monay-backup-codes.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleComplete = () => {
    setStep('complete');
    setTimeout(() => {
      onComplete?.();
    }, 2000);
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onCancel?.()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>Enable Two-Factor Authentication</span>
          </DialogTitle>
          <DialogDescription>
            Add an extra layer of security to your account
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {step === 'intro' && (
          <div className="space-y-4">
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                Protect Your Account
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Two-factor authentication adds an extra security layer by requiring
                a code from your authenticator app in addition to your password.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Enhanced Security</p>
                  <p className="text-sm text-gray-600">
                    Protect against unauthorized access even if your password is compromised
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Industry Standard</p>
                  <p className="text-sm text-gray-600">
                    Uses TOTP (Time-based One-Time Password) compatible with Google Authenticator, Authy, and more
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Backup Codes</p>
                  <p className="text-sm text-gray-600">
                    Receive backup codes for account recovery if you lose access to your device
                  </p>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button onClick={handleSetupStart} disabled={loading}>
                {loading && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
                Get Started
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </DialogFooter>
          </div>
        )}

        {step === 'setup' && (
          <div className="space-y-4">
            <Tabs defaultValue="qr" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="qr">QR Code</TabsTrigger>
                <TabsTrigger value="manual">Manual Entry</TabsTrigger>
              </TabsList>

              <TabsContent value="qr" className="space-y-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-4">
                    Scan this QR code with your authenticator app
                  </p>
                  {qrCode && (
                    <div className="bg-white p-4 rounded-lg inline-block">
                      <img src={qrCode} alt="MFA QR Code" className="w-64 h-64" />
                    </div>
                  )}
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Use apps like Google Authenticator, Microsoft Authenticator, Authy, or 1Password
                  </AlertDescription>
                </Alert>
              </TabsContent>

              <TabsContent value="manual" className="space-y-4">
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Enter this key manually in your authenticator app:
                  </p>
                  
                  {manualEntry && (
                    <div className="space-y-3">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-gray-500">Secret Key</p>
                            <p className="font-mono text-sm break-all">{manualEntry.secret}</p>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleCopyCode(manualEntry.secret)}
                          >
                            {copiedCode === manualEntry.secret ? (
                              <Check className="w-4 h-4 text-green-600" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="p-2 bg-gray-50 rounded">
                          <p className="text-xs text-gray-500">Type</p>
                          <p className="font-medium">Time-based (TOTP)</p>
                        </div>
                        <div className="p-2 bg-gray-50 rounded">
                          <p className="text-xs text-gray-500">Digits</p>
                          <p className="font-medium">{manualEntry.digits}</p>
                        </div>
                        <div className="p-2 bg-gray-50 rounded">
                          <p className="text-xs text-gray-500">Algorithm</p>
                          <p className="font-medium">{manualEntry.algorithm}</p>
                        </div>
                        <div className="p-2 bg-gray-50 rounded">
                          <p className="text-xs text-gray-500">Period</p>
                          <p className="font-medium">{manualEntry.period}s</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Verification Code</label>
                <div className="flex space-x-2">
                  <Input
                    type="text"
                    placeholder="000000"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="font-mono text-center text-lg"
                    maxLength={6}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Enter the 6-digit code from your authenticator app
                </p>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setStep('intro')}>
                  Back
                </Button>
                <Button 
                  onClick={handleVerification} 
                  disabled={loading || verificationCode.length !== 6}
                >
                  {loading && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
                  Verify & Enable
                </Button>
              </DialogFooter>
            </div>
          </div>
        )}

        {step === 'backup' && (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Key className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-lg font-semibold">Save Your Backup Codes</h3>
              <p className="text-sm text-gray-600 mt-2">
                Store these codes in a safe place. You can use them to access your account if you lose your device.
              </p>
            </div>

            <Alert variant="warning">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Each backup code can only be used once. Save them securely!
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-2 gap-2">
              {backupCodes.map((code, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded font-mono text-sm"
                >
                  <span>{code}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleCopyCode(code)}
                  >
                    {copiedCode === code ? (
                      <Check className="w-3 h-3 text-green-600" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={handleDownloadCodes}
                className="w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Backup Codes
              </Button>
            </div>

            <DialogFooter>
              <Button onClick={handleComplete} className="w-full">
                I've Saved My Backup Codes
              </Button>
            </DialogFooter>
          </div>
        )}

        {step === 'complete' && (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              Two-Factor Authentication Enabled!
            </h3>
            <p className="text-sm text-gray-600">
              Your account is now protected with an additional layer of security.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function MFAVerification({
  action,
  onVerified,
  onCancel,
}: {
  action?: string;
  onVerified: (token: string) => void;
  onCancel: () => void;
}) {
  const [method, setMethod] = useState<'totp' | 'backup' | 'sms'>('totp');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleVerification = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.post('/api/mfa/verify', {
        token: code,
        type: method
      });

      toast({
        title: 'Verification Successful',
        description: 'MFA verification completed',
      });

      onVerified(response.data.mfaToken);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Lock className="w-5 h-5" />
            <span>Two-Factor Authentication</span>
          </DialogTitle>
          <DialogDescription>
            {action ? `This action requires MFA verification: ${action}` : 'Enter your authentication code to continue'}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs value={method} onValueChange={(v) => setMethod(v as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="totp">
              <Smartphone className="w-4 h-4 mr-1" />
              App
            </TabsTrigger>
            <TabsTrigger value="backup">
              <Key className="w-4 h-4 mr-1" />
              Backup
            </TabsTrigger>
            <TabsTrigger value="sms">
              <Phone className="w-4 h-4 mr-1" />
              SMS
            </TabsTrigger>
          </TabsList>

          <TabsContent value="totp" className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Authentication Code</label>
              <Input
                type="text"
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="font-mono text-center text-lg"
                maxLength={6}
              />
              <p className="text-xs text-gray-500">
                Enter the 6-digit code from your authenticator app
              </p>
            </div>
          </TabsContent>

          <TabsContent value="backup" className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Backup Code</label>
              <Input
                type="text"
                placeholder="XXXXXXXX"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="font-mono"
                maxLength={8}
              />
              <p className="text-xs text-gray-500">
                Enter one of your 8-character backup codes
              </p>
            </div>
          </TabsContent>

          <TabsContent value="sms" className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                SMS verification is not yet configured for this account
              </AlertDescription>
            </Alert>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            onClick={handleVerification}
            disabled={loading || code.length < 6}
          >
            {loading && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
            Verify
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}