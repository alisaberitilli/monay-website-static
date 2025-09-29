'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';

export default function IndexPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      // Navigate based on authentication status
      if (isAuthenticated) {
        router.replace('/dashboard');
      } else {
        router.replace('/auth/login');
      }
    }
  }, [isAuthenticated, isLoading, router]);

  // Show splash screen while determining auth status
  return (
    <div className="min-h-screen bg-primary-500 flex items-center justify-center">
      <div className="text-center">
        <div className="w-32 h-32 mx-auto mb-8 bg-white rounded-full flex items-center justify-center">
          <div className="text-4xl font-bold text-primary-500">M</div>
        </div>
        <div className="text-white text-2xl font-bold">Monay Wallet</div>
        <div className="text-white/80 mt-2">Loading...</div>
      </div>
    </div>
  );
}