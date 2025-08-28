'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import {
  Shield,
  Smartphone,
  Key,
  Lock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  QrCode,
  Copy,
  Eye,
  EyeOff,
  RefreshCw
} from 'lucide-react';

export default function SecuritySettingsPage() {
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [step, setStep] = useState(1);
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSetup2FA = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'user123',
          email: 'john.doe@example.com'
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setQrCode(data.qrCode);
        setSecret(data.secret);
        setShow2FASetup(true);
        setStep(1);
      }
    } catch (error) {
      console.error('Failed to setup 2FA:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/2fa', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'user123',
          token: verificationCode,
          secret: secret
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setStep(3);
        // Generate backup codes
        const backupResponse = await fetch('/api/auth/2fa', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: 'user123' })
        });
        
        const backupData = await backupResponse.json();
        if (backupData.success) {
          setBackupCodes(backupData.backupCodes);
        }
      }
    } catch (error) {
      console.error('Failed to verify 2FA:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete2FA = () => {
    setIs2FAEnabled(true);
    setShow2FASetup(false);
    setStep(1);
    setVerificationCode('');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Security Settings</h1>
          <p className="text-gray-600 mt-2">Manage your account security and authentication</p>
        </div>

        {/* Security Status */}
        <div className="bg-white rounded-3xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Security Status</h2>
            <div className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-green-600" />
              <span className="text-green-600 font-medium">Protected</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Password */}
            <div className="p-4 border border-gray-200 rounded-2xl">
              <div className="flex items-center justify-between mb-3">
                <Key className="h-8 w-8 text-purple-600" />
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-1">Password</h3>
              <p className="text-sm text-gray-600 mb-3">Last changed 30 days ago</p>
              <button className="text-purple-600 text-sm font-medium hover:text-purple-700">
                Change Password
              </button>
            </div>

            {/* 2FA */}
            <div className="p-4 border border-gray-200 rounded-2xl">
              <div className="flex items-center justify-between mb-3">
                <Smartphone className="h-8 w-8 text-purple-600" />
                {is2FAEnabled ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-yellow-600" />
                )}
              </div>
              <h3 className="font-medium text-gray-900 mb-1">Two-Factor Auth</h3>
              <p className="text-sm text-gray-600 mb-3">
                {is2FAEnabled ? 'Enabled' : 'Not enabled'}
              </p>
              <button
                onClick={handleSetup2FA}
                className="text-purple-600 text-sm font-medium hover:text-purple-700"
              >
                {is2FAEnabled ? 'Manage 2FA' : 'Enable 2FA'}
              </button>
            </div>

            {/* Session */}
            <div className="p-4 border border-gray-200 rounded-2xl">
              <div className="flex items-center justify-between mb-3">
                <Lock className="h-8 w-8 text-purple-600" />
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-1">Active Sessions</h3>
              <p className="text-sm text-gray-600 mb-3">2 devices logged in</p>
              <button className="text-purple-600 text-sm font-medium hover:text-purple-700">
                View Sessions
              </button>
            </div>
          </div>
        </div>

        {/* Two-Factor Authentication Section */}
        <div className="bg-white rounded-3xl p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Two-Factor Authentication</h2>
          
          {is2FAEnabled ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-2xl">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <div>
                    <p className="font-medium text-gray-900">2FA is enabled</p>
                    <p className="text-sm text-gray-600">Your account is protected with two-factor authentication</p>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowBackupCodes(true)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50"
                >
                  View Backup Codes
                </button>
                <button className="px-6 py-3 border border-red-300 text-red-700 rounded-xl font-medium hover:bg-red-50">
                  Disable 2FA
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start space-x-3 p-4 bg-yellow-50 rounded-2xl">
                <AlertTriangle className="h-6 w-6 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Enhance your security</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Add an extra layer of security to your account by enabling two-factor authentication.
                    You'll need to enter a code from your authenticator app when signing in.
                  </p>
                </div>
              </div>
              
              <button
                onClick={handleSetup2FA}
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50"
              >
                {loading ? 'Setting up...' : 'Enable Two-Factor Authentication'}
              </button>
            </div>
          )}
        </div>

        {/* Security Recommendations */}
        <div className="bg-white rounded-3xl p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Security Recommendations</h2>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-1" />
              <div>
                <p className="font-medium text-gray-900">Strong password</p>
                <p className="text-sm text-gray-600">Your password meets security requirements</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              {is2FAEnabled ? (
                <CheckCircle className="h-5 w-5 text-green-600 mt-1" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-1" />
              )}
              <div>
                <p className="font-medium text-gray-900">Two-factor authentication</p>
                <p className="text-sm text-gray-600">
                  {is2FAEnabled 
                    ? 'Your account is protected with 2FA'
                    : 'Enable 2FA for additional security'}
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-1" />
              <div>
                <p className="font-medium text-gray-900">Email verification</p>
                <p className="text-sm text-gray-600">Your email is verified</p>
              </div>
            </div>
          </div>
        </div>

        {/* 2FA Setup Modal */}
        {show2FASetup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-8 max-w-lg w-full">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {step === 1 && 'Set Up Two-Factor Authentication'}
                {step === 2 && 'Verify Your Authenticator'}
                {step === 3 && 'Save Backup Codes'}
              </h2>
              
              {/* Step 1: QR Code */}
              {step === 1 && (
                <div className="space-y-6">
                  <p className="text-gray-600">
                    Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                  </p>
                  
                  {qrCode && (
                    <div className="flex justify-center">
                      <img src={qrCode} alt="2FA QR Code" className="w-64 h-64" />
                    </div>
                  )}
                  
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm font-medium text-gray-700 mb-2">Can't scan? Enter manually:</p>
                    <div className="flex items-center justify-between">
                      <code className="text-xs font-mono text-gray-900">{secret}</code>
                      <button
                        onClick={() => copyToClipboard(secret)}
                        className="text-purple-600 hover:text-purple-700"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <button
                      onClick={() => setShow2FASetup(false)}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => setStep(2)}
                      className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:shadow-lg"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
              
              {/* Step 2: Verification */}
              {step === 2 && (
                <div className="space-y-6">
                  <p className="text-gray-600">
                    Enter the 6-digit code from your authenticator app to verify setup
                  </p>
                  
                  <div>
                    <input
                      type="text"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl text-center text-2xl font-mono tracking-widest focus:ring-2 focus:ring-purple-500"
                      placeholder="000000"
                      maxLength={6}
                    />
                  </div>
                  
                  <div className="flex justify-between">
                    <button
                      onClick={() => setStep(1)}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleVerify2FA}
                      disabled={verificationCode.length !== 6 || loading}
                      className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:shadow-lg disabled:opacity-50"
                    >
                      {loading ? 'Verifying...' : 'Verify'}
                    </button>
                  </div>
                </div>
              )}
              
              {/* Step 3: Backup Codes */}
              {step === 3 && (
                <div className="space-y-6">
                  <div className="p-4 bg-green-50 rounded-xl">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <p className="font-medium text-green-900">2FA Enabled Successfully!</p>
                    </div>
                    <p className="text-sm text-green-800">
                      Your account is now protected with two-factor authentication
                    </p>
                  </div>
                  
                  <div>
                    <p className="font-medium text-gray-900 mb-3">Save your backup codes</p>
                    <p className="text-sm text-gray-600 mb-4">
                      Store these codes in a safe place. You can use them to access your account if you lose your phone.
                    </p>
                    
                    <div className="grid grid-cols-2 gap-2 p-4 bg-gray-50 rounded-xl">
                      {backupCodes.map((code, index) => (
                        <div key={index} className="font-mono text-sm text-gray-900">
                          {index + 1}. {code}
                        </div>
                      ))}
                    </div>
                    
                    <button
                      onClick={() => {
                        const codesText = backupCodes.map((c, i) => `${i + 1}. ${c}`).join('\n');
                        copyToClipboard(codesText);
                      }}
                      className="mt-4 text-purple-600 font-medium hover:text-purple-700 flex items-center"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy all codes
                    </button>
                  </div>
                  
                  <button
                    onClick={handleComplete2FA}
                    className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:shadow-lg"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Backup Codes Modal */}
        {showBackupCodes && backupCodes.length > 0 && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-8 max-w-lg w-full">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Backup Codes</h2>
              
              <p className="text-gray-600 mb-4">
                Use these codes to access your account if you lose access to your authenticator app.
              </p>
              
              <div className="grid grid-cols-2 gap-2 p-4 bg-gray-50 rounded-xl mb-4">
                {backupCodes.map((code, index) => (
                  <div key={index} className="font-mono text-sm text-gray-900">
                    {index + 1}. {code}
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between">
                <button
                  onClick={() => setShowBackupCodes(false)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    const codesText = backupCodes.map((c, i) => `${i + 1}. ${c}`).join('\n');
                    copyToClipboard(codesText);
                  }}
                  className="px-6 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 flex items-center"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Codes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}