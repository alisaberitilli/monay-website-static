'use client';

import { useState } from 'react';
import {
  Zap,
  MapPin,
  Clock,
  Battery,
  DollarSign,
  Navigation,
  Star,
  CreditCard,
  Shield,
  Car,
  CheckCircle
} from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import PaymentFlow from '@/components/PaymentFlow';
import paymentService, { PaymentRequest, PaymentResult } from '@/lib/payment-service';

interface ChargingStation {
  id: string;
  name: string;
  address: string;
  distance: number;
  availablePorts: number;
  totalPorts: number;
  rating: number;
  pricePerKwh: number;
  chargerTypes: string[];
  amenities: string[];
  isOpen24h: boolean;
  estimatedTime: string;
  network: string;
  fastCharging: boolean;
}

interface ChargingSession {
  stationId: string;
  startTime: string;
  endTime?: string;
  energyDelivered: number;
  cost: number;
  status: 'charging' | 'completed' | 'error';
}

export default function EVChargingPage() {
  const [searchLocation, setSearchLocation] = useState('');
  const [selectedStation, setSelectedStation] = useState<ChargingStation | null>(null);
  const [isCharging, setIsCharging] = useState(false);
  const [chargingSession, setChargingSession] = useState<ChargingSession | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'fast' | 'available'>('all');

  // Payment flow state
  const [showPaymentFlow, setShowPaymentFlow] = useState(false);
  const [currentPaymentRequest, setCurrentPaymentRequest] = useState<PaymentRequest | null>(null);

  const chargingStations: ChargingStation[] = [
    {
      id: '1',
      name: 'Tesla Supercharger',
      address: '123 Market St, San Francisco, CA',
      distance: 0.3,
      availablePorts: 8,
      totalPorts: 12,
      rating: 4.8,
      pricePerKwh: 0.28,
      chargerTypes: ['CCS', 'Tesla'],
      amenities: ['WiFi', 'Restroom', 'Shopping'],
      isOpen24h: true,
      estimatedTime: '25-40 min',
      network: 'Tesla',
      fastCharging: true
    },
    {
      id: '2',
      name: 'EVgo Fast Charging',
      address: '456 Mission St, San Francisco, CA',
      distance: 0.7,
      availablePorts: 3,
      totalPorts: 6,
      rating: 4.5,
      pricePerKwh: 0.32,
      chargerTypes: ['CCS', 'CHAdeMO'],
      amenities: ['WiFi', 'Food'],
      isOpen24h: false,
      estimatedTime: '30-45 min',
      network: 'EVgo',
      fastCharging: true
    },
    {
      id: '3',
      name: 'ChargePoint Network',
      address: '789 Howard St, San Francisco, CA',
      distance: 1.2,
      availablePorts: 15,
      totalPorts: 20,
      rating: 4.2,
      pricePerKwh: 0.25,
      chargerTypes: ['CCS', 'Type 2'],
      amenities: ['WiFi', 'Parking'],
      isOpen24h: true,
      estimatedTime: '45-60 min',
      network: 'ChargePoint',
      fastCharging: false
    }
  ];

  const popularNetworks = [
    { name: 'Tesla Supercharger', icon: '⚡', color: 'red' },
    { name: 'EVgo', icon: '🔋', color: 'green' },
    { name: 'ChargePoint', icon: '🔌', color: 'blue' },
    { name: 'Electrify America', icon: '⚡', color: 'purple' },
  ];

  const filteredStations = chargingStations.filter(station => {
    if (filterType === 'fast') return station.fastCharging;
    if (filterType === 'available') return station.availablePorts > 0;
    return true;
  });

  const handleStartCharging = (station: ChargingStation) => {
    const estimatedKwh = 45; // Default charging session estimate
    const paymentRequest = paymentService.createRetailPaymentRequest({
      ...station,
      price: station.pricePerKwh * estimatedKwh,
      name: `EV Charging - ${station.name}`,
      description: `Charging session at ${station.name}`
    }, 1);
    setCurrentPaymentRequest(paymentRequest);
    setShowPaymentFlow(true);
  };

  const handlePaymentSuccess = (result: PaymentResult) => {
    setShowPaymentFlow(false);
    setCurrentPaymentRequest(null);

    // Start the charging session after payment
    const station = filteredStations.find(s => s.name === result.description?.split(' - ')[1]);
    if (station) {
      setSelectedStation(station);
      setIsCharging(true);
      const session: ChargingSession = {
        stationId: station.id,
        startTime: new Date().toISOString(),
        energyDelivered: 0,
        cost: 0,
        status: 'charging'
      };
      setChargingSession(session);
    }
    alert(`Payment successful! Transaction ID: ${result.transactionId}`);
  };

  const handlePaymentCancel = () => {
    setShowPaymentFlow(false);
    setCurrentPaymentRequest(null);
  };

  const handleStopCharging = () => {
    if (chargingSession) {
      setChargingSession({
        ...chargingSession,
        endTime: new Date().toISOString(),
        status: 'completed',
        energyDelivered: 45.2,
        cost: 12.65
      });
      setIsCharging(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Zap className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            EV Charging Stations
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Find and pay for EV charging stations nationwide. Pay instantly with your Monay wallet
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Search and Filters */}
          <div className="space-y-6">
            {/* Location Search */}
            <div className="bg-white rounded-3xl shadow-2xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Find Charging Stations</h2>

              <div className="space-y-4 mb-6">
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search location or address"
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                  />
                  <button className="absolute right-4 top-1/2 transform -translate-y-1/2 text-emerald-500 hover:text-emerald-600">
                    <Navigation className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="space-y-4">
                <p className="font-semibold text-gray-700">Filter by:</p>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setFilterType('all')}
                    className={`px-4 py-2 rounded-xl font-medium transition-all ${
                      filterType === 'all'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    All Stations
                  </button>
                  <button
                    onClick={() => setFilterType('fast')}
                    className={`px-4 py-2 rounded-xl font-medium transition-all ${
                      filterType === 'fast'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Fast Charging
                  </button>
                  <button
                    onClick={() => setFilterType('available')}
                    className={`px-4 py-2 rounded-xl font-medium transition-all ${
                      filterType === 'available'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Available Now
                  </button>
                </div>
              </div>

              {/* Popular Networks */}
              <div className="mt-6">
                <p className="font-semibold text-gray-700 mb-3">Popular Networks</p>
                <div className="grid grid-cols-2 gap-3">
                  {popularNetworks.map((network) => (
                    <button
                      key={network.name}
                      className="flex items-center space-x-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all"
                    >
                      <span className="text-2xl">{network.icon}</span>
                      <span className="font-medium text-gray-900">{network.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Current Charging Session */}
            {chargingSession && (
              <div className="bg-white rounded-3xl shadow-2xl p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">
                  {chargingSession.status === 'charging' ? 'Charging in Progress' : 'Charging Complete'}
                </h3>

                {chargingSession.status === 'charging' ? (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                          <Battery className="h-6 w-6 text-emerald-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">Charging Active</p>
                          <p className="text-sm text-gray-500">Station: {selectedStation?.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-emerald-600">78%</p>
                        <p className="text-sm text-gray-500">Battery</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-emerald-50 rounded-2xl">
                        <p className="text-2xl font-bold text-gray-900">32.4</p>
                        <p className="text-sm text-gray-500">kWh delivered</p>
                      </div>
                      <div className="text-center p-4 bg-emerald-50 rounded-2xl">
                        <p className="text-2xl font-bold text-gray-900">$9.08</p>
                        <p className="text-sm text-gray-500">Current cost</p>
                      </div>
                    </div>

                    <button
                      onClick={handleStopCharging}
                      className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white py-4 rounded-2xl font-semibold hover:from-red-600 hover:to-pink-600 transition-all shadow-lg"
                    >
                      Stop Charging
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center mb-4">
                      <CheckCircle className="h-16 w-16 text-emerald-500" />
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-gray-900 mb-2">Charging Complete!</p>
                      <p className="text-3xl font-bold text-emerald-600 mb-1">{chargingSession.energyDelivered} kWh</p>
                      <p className="text-lg font-semibold text-gray-900">${chargingSession.cost}</p>
                      <p className="text-sm text-gray-500">Paid with Monay wallet</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Charging Stations List */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl shadow-2xl p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Nearby Stations ({filteredStations.length})
              </h3>

              <div className="space-y-4">
                {filteredStations.map((station) => (
                  <div key={station.id} className="border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-semibold text-gray-900">{station.name}</h4>
                          {station.fastCharging && (
                            <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-lg">
                              Fast Charging
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mb-2">{station.address}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4" />
                            <span>{station.distance} mi</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            <span>{station.rating}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{station.estimatedTime}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">${station.pricePerKwh}/kWh</p>
                        <p className="text-sm text-gray-500">{station.network}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <div className={`w-3 h-3 rounded-full ${
                            station.availablePorts > 0 ? 'bg-emerald-500' : 'bg-red-500'
                          }`} />
                          <span className="text-sm text-gray-600">
                            {station.availablePorts}/{station.totalPorts} available
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {station.isOpen24h ? '24/7' : 'Limited hours'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex space-x-2">
                        {station.chargerTypes.map((type) => (
                          <span
                            key={type}
                            className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg"
                          >
                            {type}
                          </span>
                        ))}
                      </div>

                      <button
                        onClick={() => handleStartCharging(station)}
                        disabled={station.availablePorts === 0 || isCharging}
                        className="bg-gradient-to-r from-emerald-500 to-green-500 text-white px-6 py-2 rounded-xl font-semibold hover:from-emerald-600 hover:to-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        <div className="flex items-center space-x-2">
                          <CreditCard className="h-4 w-4" />
                          <span>Start Charging</span>
                        </div>
                      </button>
                    </div>

                    {station.amenities.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-sm text-gray-500 mb-2">Amenities:</p>
                        <div className="flex flex-wrap gap-2">
                          {station.amenities.map((amenity) => (
                            <span
                              key={amenity}
                              className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-lg"
                            >
                              {amenity}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Security */}
            <div className="bg-white rounded-3xl shadow-2xl p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Secure EV Charging</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <Shield className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Secure Payments</h4>
                    <p className="text-sm text-gray-500">Pay safely with your Monay wallet</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Zap className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Real-time Monitoring</h4>
                    <p className="text-sm text-gray-500">Track your charging session live</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Car className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">All EV Compatible</h4>
                    <p className="text-sm text-gray-500">Works with Tesla, Ford, BMW, and more</p>
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