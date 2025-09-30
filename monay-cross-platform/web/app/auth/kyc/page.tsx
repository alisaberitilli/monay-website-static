'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User } from 'lucide-react';

export default function KYCVerificationPage() {
  const [isVerifying, setIsVerifying] = useState(false);
  const router = useRouter();

  const handleVerify = () => {
    setIsVerifying(true);
    // Simulate verification
    setTimeout(() => {
      router.push('/dashboard');
    }, 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <User className="mx-auto h-12 w-12 text-purple-600" />
          <h2 className="mt-6 text-3xl font-bold">Identity Verification</h2>
          <p className="mt-2 text-gray-600">Verify your identity to continue</p>
        </div>

        <div className="space-y-6">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <p className="text-gray-500 mb-4">Upload your ID document</p>
            <button
              onClick={handleVerify}
              disabled={isVerifying}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              {isVerifying ? 'Verifying...' : 'Verify Identity'}
            </button>
          </div>

          <div className="text-center text-sm text-gray-600">
            <p>We'll verify your identity to ensure account security</p>
          </div>
        </div>
      </div>
    </div>
  );
}