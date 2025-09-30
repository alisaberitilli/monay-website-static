'use client';

import { Bus, MapPin, CreditCard, Clock, Ticket } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

export default function PublicTransitPage() {
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Bus className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Public Transit</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Pay for buses, trains, and metro systems across the U.S. with your Monay wallet
          </p>
        </div>

        <div className="text-center mt-16">
          <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-2xl mx-auto">
            <div className="text-6xl mb-6">🚌</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Coming Soon!</h2>
            <p className="text-lg text-gray-600 mb-8">
              Public transit payment integration is currently under development.
              Soon you'll be able to pay for buses, trains, and metro systems nationwide.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="flex flex-col items-center p-4 bg-blue-50 rounded-2xl">
                <Bus className="h-8 w-8 text-blue-600 mb-2" />
                <span className="text-sm font-semibold text-blue-900">Buses</span>
              </div>
              <div className="flex flex-col items-center p-4 bg-green-50 rounded-2xl">
                <Ticket className="h-8 w-8 text-green-600 mb-2" />
                <span className="text-sm font-semibold text-green-900">Metro</span>
              </div>
              <div className="flex flex-col items-center p-4 bg-purple-50 rounded-2xl">
                <Clock className="h-8 w-8 text-purple-600 mb-2" />
                <span className="text-sm font-semibold text-purple-900">Real-time</span>
              </div>
              <div className="flex flex-col items-center p-4 bg-orange-50 rounded-2xl">
                <CreditCard className="h-8 w-8 text-orange-600 mb-2" />
                <span className="text-sm font-semibold text-orange-900">Instant Pay</span>
              </div>
            </div>
            <div className="flex items-center justify-center space-x-2 text-blue-600">
              <CreditCard className="h-5 w-5" />
              <span className="font-semibold">Powered by Monay</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}