'use client';

import { useState, useEffect } from 'react';
import {
  Car,
  MapPin,
  Clock,
  DollarSign,
  Users,
  Star,
  Navigation,
  CreditCard,
  Shield,
  Zap,
  UserCheck
} from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import PaymentFlow from '@/components/PaymentFlow';
import paymentService, { PaymentRequest, PaymentResult } from '@/lib/payment-service';

interface RideOption {
  id: string;
  type: 'economy' | 'comfort' | 'premium' | 'xl' | 'pool';
  name: string;
  description: string;
  icon: string;
  price: number;
  estimatedTime: string;
  capacity: number;
  features: string[];
}

interface Driver {
  id: string;
  name: string;
  rating: number;
  trips: number;
  car: string;
  licensePlate: string;
  estimatedArrival: string;
}

export default function RidesharePage() {
  const [pickupLocation, setPickupLocation] = useState('');
  const [destination, setDestination] = useState('');
  const [selectedRide, setSelectedRide] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showRideOptions, setShowRideOptions] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [rideStatus, setRideStatus] = useState<'searching' | 'found' | 'booked' | 'inProgress' | 'completed'>('searching');

  // Payment flow state
  const [showPaymentFlow, setShowPaymentFlow] = useState(false);
  const [currentPaymentRequest, setCurrentPaymentRequest] = useState<PaymentRequest | null>(null);

  const rideOptions: RideOption[] = [
    {
      id: 'economy',
      type: 'economy',
      name: 'Monay Economy',
      description: 'Affordable rides for everyday travel',
      icon: '🚗',
      price: 12.50,
      estimatedTime: '5-8 min',
      capacity: 4,
      features: ['Standard vehicle', 'Shared ride available']
    },
    {
      id: 'comfort',
      type: 'comfort',
      name: 'Monay Comfort',
      description: 'Premium vehicles with extra legroom',
      icon: '🚙',
      price: 18.75,
      estimatedTime: '3-6 min',
      capacity: 4,
      features: ['Newer vehicles', 'Extra legroom', 'Climate control']
    },
    {
      id: 'premium',
      type: 'premium',
      name: 'Monay Premium',
      description: 'Luxury vehicles for special occasions',
      icon: '🏎️',
      price: 32.00,
      estimatedTime: '5-10 min',
      capacity: 4,
      features: ['Luxury vehicles', 'Premium interior', 'Complimentary water']
    },
    {
      id: 'xl',
      type: 'xl',
      name: 'Monay XL',
      description: 'Spacious rides for groups',
      icon: '🚐',
      price: 24.25,
      estimatedTime: '6-12 min',
      capacity: 6,
      features: ['Large vehicle', 'Extra space', 'Group friendly']
    },
    {
      id: 'pool',
      type: 'pool',
      name: 'Monay Pool',
      description: 'Share your ride and save money',
      icon: '🤝',
      price: 8.30,
      estimatedTime: '8-15 min',
      capacity: 2,
      features: ['Shared ride', 'Eco-friendly', 'Budget option']
    }
  ];

  const mockDriver: Driver = {
    id: '1',
    name: 'Michael Rodriguez',
    rating: 4.9,
    trips: 2847,
    car: '2022 Toyota Camry',
    licensePlate: 'ABC-1234',
    estimatedArrival: '4 min'
  };

  const quickDestinations = [
    { name: 'Airport', icon: '✈️', address: 'San Francisco International Airport' },
    { name: 'Downtown', icon: '🏢', address: 'Downtown Financial District' },
    { name: 'Shopping', icon: '🛍️', address: 'Union Square Shopping Center' },
    { name: 'University', icon: '🎓', address: 'UC San Francisco Campus' },
  ];

  const handleSearchRides = async () => {
    if (!pickupLocation || !destination) return;

    setIsSearching(true);
    setShowRideOptions(false);

    // Simulate API call
    setTimeout(() => {
      setIsSearching(false);
      setShowRideOptions(true);
    }, 2000);
  };

  const handleSelectRide = (rideId: string) => {
    setSelectedRide(rideId);
    setRideStatus('found');
    setSelectedDriver(mockDriver);
  };

  const handleBookRide = () => {
    if (selectedRide && selectedDriver) {
      const ride = rideOptions.find(r => r.id === selectedRide);
      if (ride) {
        const paymentRequest = paymentService.createRidesharePaymentRequest({
          ...ride,
          driver: selectedDriver,
          pickup: pickupLocation,
          destination: destination
        });
        setCurrentPaymentRequest(paymentRequest);
        setShowPaymentFlow(true);
      }
    }
  };

  const handlePaymentSuccess = (result: PaymentResult) => {
    setShowPaymentFlow(false);
    setCurrentPaymentRequest(null);
    setRideStatus('booked');
    alert(`Payment successful! Transaction ID: ${result.transactionId}`);
  };

  const handlePaymentCancel = () => {
    setShowPaymentFlow(false);
    setCurrentPaymentRequest(null);
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Car className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Rideshare with Monay
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get a ride anywhere in the city. Fast, safe, and pay instantly with your Monay wallet
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Booking Form */}
          <div className="space-y-8">
            {/* Location Input */}
            <div className="bg-white rounded-3xl shadow-2xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Where to?</h2>

              {/* Pickup Location */}
              <div className="space-y-2 mb-6">
                <label className="text-sm font-semibold text-gray-700">Pickup Location</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <input
                    type="text"
                    placeholder="Enter pickup location"
                    value={pickupLocation}
                    onChange={(e) => setPickupLocation(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                  />
                  <button className="absolute right-4 top-1/2 transform -translate-y-1/2 text-green-500 hover:text-green-600">
                    <Navigation className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Destination */}
              <div className="space-y-2 mb-6">
                <label className="text-sm font-semibold text-gray-700">Destination</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  </div>
                  <input
                    type="text"
                    placeholder="Where are you going?"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>

              {/* Quick Destinations */}
              <div className="mb-6">
                <p className="text-sm font-semibold text-gray-700 mb-3">Quick Destinations</p>
                <div className="grid grid-cols-2 gap-3">
                  {quickDestinations.map((dest) => (
                    <button
                      key={dest.name}
                      onClick={() => setDestination(dest.address)}
                      className="flex items-center space-x-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all"
                    >
                      <span className="text-2xl">{dest.icon}</span>
                      <div className="text-left">
                        <p className="font-medium text-gray-900">{dest.name}</p>
                        <p className="text-xs text-gray-500">{dest.address}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Search Button */}
              <button
                onClick={handleSearchRides}
                disabled={isSearching || !pickupLocation || !destination}
                className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white py-4 rounded-2xl font-semibold text-lg hover:from-green-600 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
              >
                {isSearching ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Finding Rides...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <Car className="h-5 w-5" />
                    <span>Find Rides</span>
                  </div>
                )}
              </button>
            </div>

            {/* Driver Info (when ride is found) */}
            {selectedDriver && rideStatus === 'found' && (
              <div className="bg-white rounded-3xl shadow-2xl p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Your Driver</h3>
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {selectedDriver.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{selectedDriver.name}</h4>
                    <div className="flex items-center space-x-2">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="text-sm text-gray-600">{selectedDriver.rating} • {selectedDriver.trips} trips</span>
                    </div>
                    <p className="text-sm text-gray-500">{selectedDriver.car} • {selectedDriver.licensePlate}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">{selectedDriver.estimatedArrival}</p>
                    <p className="text-sm text-gray-500">away</p>
                  </div>
                </div>

                <button
                  onClick={handleBookRide}
                  className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white py-4 rounded-2xl font-semibold hover:from-green-600 hover:to-teal-600 transition-all shadow-lg hover:shadow-xl"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <CreditCard className="h-5 w-5" />
                    <span>Confirm & Pay with Monay</span>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Ride Options */}
          <div className="space-y-6">
            {showRideOptions && (
              <div className="bg-white rounded-3xl shadow-2xl p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Choose Your Ride</h3>
                <div className="space-y-4">
                  {rideOptions.map((ride) => (
                    <button
                      key={ride.id}
                      onClick={() => handleSelectRide(ride.id)}
                      className={`w-full p-6 rounded-2xl border-2 transition-all text-left ${
                        selectedRide === ride.id
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-4">
                          <div className="text-3xl">{ride.icon}</div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{ride.name}</h4>
                            <p className="text-sm text-gray-500">{ride.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-gray-900">${ride.price}</p>
                          <p className="text-sm text-gray-500">{ride.estimatedTime}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>{ride.capacity} seats</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{ride.estimatedTime}</span>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {ride.features.map((feature, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-100 text-xs text-gray-600 rounded-lg"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Safety Features */}
            <div className="bg-white rounded-3xl shadow-2xl p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Safety & Security</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <Shield className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Verified Drivers</h4>
                    <p className="text-sm text-gray-500">All drivers are background checked and verified</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <UserCheck className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Real-time Tracking</h4>
                    <p className="text-sm text-gray-500">Share your trip with friends and family</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Zap className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Instant Payment</h4>
                    <p className="text-sm text-gray-500">Secure payments through your Monay wallet</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Flow Modal */}
      {currentPaymentRequest && (
        <PaymentFlow
          paymentRequest={currentPaymentRequest}
          onSuccess={handlePaymentSuccess}
          onCancel={handlePaymentCancel}
          isOpen={showPaymentFlow}
        />
      )}
    </DashboardLayout>
  );
}