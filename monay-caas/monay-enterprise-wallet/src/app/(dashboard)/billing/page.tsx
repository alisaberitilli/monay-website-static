'use client';

import BillingDashboard from '@/components/BillingDashboard';
import TenantSelector from '@/components/TenantSelector';

export default function BillingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Billing & Usage</h1>
            <TenantSelector />
          </div>
          <p className="mt-2 text-gray-600">
            Monitor your usage, manage billing, and take advantage of USDXM discounts
          </p>
        </div>

        {/* Billing Dashboard */}
        <BillingDashboard />
      </div>
    </div>
  );
}