'use client';

import React from 'react';
import PaymentProcessingDashboard from '@/components/PaymentProcessingDashboard';

const PaymentsPage = () => {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Payment Processing Center</h1>
        <p className="text-gray-600 mt-2">
          Monitor and manage all payment transactions in real-time
        </p>
      </div>

      <PaymentProcessingDashboard />
    </div>
  );
};

export default PaymentsPage;