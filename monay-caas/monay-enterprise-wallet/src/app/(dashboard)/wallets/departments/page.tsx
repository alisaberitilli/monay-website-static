'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DepartmentsWalletsPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to departments list page
    router.replace('/wallets/departments/list');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
  );
}
