'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function TokensManagePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to tokens list page
    router.replace('/tokens');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );
}
