'use client';

import { useState } from 'react';
import {
  ShoppingCart,
  CreditCard,
  MapPin,
  Clock,
  CheckCircle,
  Shield,
  Star,
  User,
  DollarSign,
  Calendar,
  FileText
} from 'lucide-react';

interface EligibleStore {
  id: string;
  name: string;
  address: string;
  distance: number;
  rating: number;
  snapAccepted: boolean;
  onlineEligible: boolean;
  storeType: 'grocery' | 'farmers_market' | 'convenience';
  hours: string;
}

interface BenefitStatus {
  currentBalance: number;
  lastRefill: string;
  nextRefill: string;
  monthlyAllotment: number;
  isActive: boolean;
}

export default function SNAPBenefitsPage() {
  const [benefitStatus, setBenefitStatus] = useState<BenefitStatus>({
    currentBalance: 234.50,
    lastRefill: '2024-01-01',
    nextRefill: '2024-02-01',
    monthlyAllotment: 281.00,
    isActive: true
  });

  const eligibleStores: EligibleStore[] = [
    {
      id: '1',
      name: 'Whole Foods Market',
      address: '123 Market St, San Francisco, CA',
      distance: 0.3,
      rating: 4.5,
      snapAccepted: true,
      onlineEligible: true,
      storeType: 'grocery',
      hours: '7AM - 11PM'
    },
    {
      id: '2',
      name: 'Ferry Plaza Farmers Market',
      address: '1 Ferry Building, San Francisco, CA',
      distance: 0.8,
      rating: 4.8,
      snapAccepted: true,
      onlineEligible: false,
      storeType: 'farmers_market',
      hours: 'Sat 8AM - 2PM'
    },
    {
      id: '3',
      name: 'Safeway',
      address: '456 Mission St, San Francisco, CA',
      distance: 1.2,
      rating: 4.2,
      snapAccepted: true,
      onlineEligible: true,
      storeType: 'grocery',
      hours: '6AM - 12AM'
    }
  ];

  const eligibleItems = [
    'Fresh fruits and vegetables',
    'Meat, poultry, and fish',
    'Dairy products',
    'Breads and cereals',
    'Seeds and plants for growing food'
  ];

  const ineligibleItems = [
    'Alcohol and tobacco',
    'Hot prepared foods',
    'Vitamins and medicine',
    'Pet food',
    'Household supplies'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
              <ShoppingCart className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            SNAP Benefits
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Manage your SNAP benefits and find eligible stores. Use your Monay wallet for seamless grocery shopping
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Benefit Status */}
          <div className="lg:col-span-1 space-y-6">
            {/* Current Balance */}
            <div className="bg-white rounded-3xl shadow-2xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Your SNAP Benefits</h2>

              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="h-10 w-10 text-white" />
                </div>
                <p className="text-4xl font-bold text-green-600 mb-2">${benefitStatus.currentBalance}</p>
                <p className="text-sm text-gray-500">Available Balance</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-2xl">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-gray-900">Monthly Allotment</span>
                  </div>
                  <span className="font-bold text-green-600">${benefitStatus.monthlyAllotment}</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-gray-600" />
                    <span className="font-medium text-gray-900">Next Refill</span>
                  </div>
                  <span className="font-bold text-gray-700">{benefitStatus.nextRefill}</span>
                </div>

                <div className="flex items-center justify-center space-x-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-semibold">Benefits Active</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-3xl shadow-2xl p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center space-x-3 p-4 bg-green-50 hover:bg-green-100 rounded-2xl transition-all">
                  <FileText className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-gray-900">View Transaction History</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-2xl transition-all">
                  <User className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-gray-900">Update Personal Info</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-2xl transition-all">
                  <Shield className="h-5 w-5 text-purple-600" />
                  <span className="font-medium text-gray-900">Report Lost Card</span>
                </button>
              </div>
            </div>
          </div>

          {/* Store Locator */}
          <div className="lg:col-span-2 space-y-6">
            {/* Store Search */}
            <div className="bg-white rounded-3xl shadow-2xl p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">SNAP-Eligible Stores Near You</h3>

              <div className="mb-6">
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Enter your location"
                    className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-4">
                {eligibleStores.map((store) => (
                  <div key={store.id} className="border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-semibold text-gray-900">{store.name}</h4>
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            <span className="text-sm text-gray-600">{store.rating}</span>
                          </div>
                          {store.onlineEligible && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg">
                              Online Eligible
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mb-2">{store.address}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4" />
                            <span>{store.distance} mi</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{store.hours}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-2">
                          <CheckCircle className="h-6 w-6 text-green-600" />
                        </div>
                        <span className="text-xs font-semibold text-green-700">SNAP Accepted</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className={`px-3 py-1 rounded-lg text-sm font-medium ${
                        store.storeType === 'grocery'
                          ? 'bg-green-100 text-green-800'
                          : store.storeType === 'farmers_market'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {store.storeType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>

                      <button className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-2 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-600 transition-all">
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4" />
                          <span>Get Directions</span>
                        </div>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Eligible Items Guide */}
            <div className="bg-white rounded-3xl shadow-2xl p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">What Can You Buy?</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-green-700 mb-4 flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5" />
                    <span>SNAP Eligible Items</span>
                  </h4>
                  <ul className="space-y-2">
                    {eligibleItems.map((item, index) => (
                      <li key={index} className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span className="text-sm text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-red-700 mb-4 flex items-center space-x-2">
                    <span className="w-5 h-5 border-2 border-red-500 rounded-full flex items-center justify-center">
                      <span className="w-3 h-0.5 bg-red-500" />
                    </span>
                    <span>Not SNAP Eligible</span>
                  </h4>
                  <ul className="space-y-2">
                    {ineligibleItems.map((item, index) => (
                      <li key={index} className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full" />
                        <span className="text-sm text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Security & Privacy */}
            <div className="bg-white rounded-3xl shadow-2xl p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Security & Privacy</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Shield className="h-6 w-6 text-green-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Secure Payments</h4>
                  <p className="text-sm text-gray-500">Your SNAP benefits are protected with bank-level security</p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Privacy Protected</h4>
                  <p className="text-sm text-gray-500">Your purchase information remains completely private</p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <CreditCard className="h-6 w-6 text-purple-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Instant Integration</h4>
                  <p className="text-sm text-gray-500">Seamlessly integrated with your Monay wallet</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}