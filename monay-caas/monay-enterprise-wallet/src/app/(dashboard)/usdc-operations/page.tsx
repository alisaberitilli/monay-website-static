'use client';

import dynamic from 'next/dynamic';

const USDCOperations = dynamic(() => import('@/components/USDCOperations'), {
  ssr: false,
});

export default function USDCOperationsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <USDCOperations />
    </div>
  );
}