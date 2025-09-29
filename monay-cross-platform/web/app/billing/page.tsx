'use client';

import React from 'react';
import FamilyGroupIndicator from '@/components/FamilyGroupIndicator';
import SimpleBilling from '@/components/SimpleBilling';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function BillingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-2xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          
          <h1 className="text-2xl font-bold text-gray-900">Billing & Plan</h1>
          <p className="text-gray-600 mt-1">Manage your subscription and payments</p>
        </div>

        {/* Family Group Indicator */}
        <div className="mb-6">
          <FamilyGroupIndicator />
        </div>

        {/* Billing Component */}
        <SimpleBilling />

        {/* Help Section */}
        <div className="mt-8 p-4 bg-white rounded-xl shadow-sm">
          <h3 className="font-medium text-gray-900 mb-2">Need Help?</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p>
              • <strong>USDXM Payments:</strong> Save 10% on every payment by using our native stablecoin
            </p>
            <p>
              • <strong>Family Plans:</strong> Share your subscription with up to 5 family members
            </p>
            <p>
              • <strong>Questions?</strong> Contact support at support@monay.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}