'use client';

import { MapPin, CreditCard, Car, Shield } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

export default function TollsPage() {
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
              <MapPin className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Tolls & Parking</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Pay for tolls and parking seamlessly with your Monay wallet
          </p>
        </div>

        <div className="text-center mt-16">
          <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-2xl mx-auto">
            <div className="text-6xl mb-6">🛣️</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Coming Soon!</h2>
            <p className="text-lg text-gray-600 mb-8">
              Toll and parking payment integration is under development.
              Soon you'll be able to pay for tolls and parking nationwide.
            </p>
            <div className="flex items-center justify-center space-x-2 text-green-600">
              <CreditCard className="h-5 w-5" />
              <span className="font-semibold">Powered by Monay</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}