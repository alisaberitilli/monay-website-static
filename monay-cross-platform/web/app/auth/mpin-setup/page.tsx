'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock } from 'lucide-react';

export default function MPINSetupPage() {
  const [mpin, setMpin] = useState('');
  const [confirmMpin, setConfirmMpin] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder MPIN setup
    router.push('/auth/kyc');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Lock className="mx-auto h-12 w-12 text-purple-600" />
          <h2 className="mt-6 text-3xl font-bold">Set PIN</h2>
          <p className="mt-2 text-gray-600">Create PIN for secure access</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter MPIN
            </label>
            <input
              type="password"
              name="mpin"
              value={mpin}
              onChange={(e) => setMpin(e.target.value)}
              placeholder="Enter 6-digit PIN"
              className="w-full px-4 py-3 border rounded-lg"
              maxLength={6}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm MPIN
            </label>
            <input
              type="password"
              value={confirmMpin}
              onChange={(e) => setConfirmMpin(e.target.value)}
              placeholder="Confirm PIN"
              className="w-full px-4 py-3 border rounded-lg"
              maxLength={6}
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Create PIN
          </button>
        </form>
      </div>
    </div>
  );
}