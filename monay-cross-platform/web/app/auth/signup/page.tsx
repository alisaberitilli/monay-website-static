'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Redirect signup to register page
export default function SignupPage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/auth/register');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Sign Up</h1>
        <p className="mb-4">Create Account</p>
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecting to registration...</p>
      </div>
    </div>
  );
}