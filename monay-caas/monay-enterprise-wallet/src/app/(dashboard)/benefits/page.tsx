'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import GovernmentBenefitsDashboard from '@/components/GovernmentBenefitsDashboard';
import OrganizationSwitcher from '@/components/OrganizationSwitcher';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield } from 'lucide-react';

export default function BenefitsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Top Navigation Bar */}
      <div className="border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/')}
              className="hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-violet-600" />
              <h1 className="text-xl font-bold">Government Benefits Management</h1>
            </div>
          </div>
          <OrganizationSwitcher />
        </div>
      </div>

      {/* Benefits Content */}
      <div className="p-6">
        <GovernmentBenefitsDashboard />
      </div>
    </div>
  );
}