'use client';

import { useState } from 'react';
import {
  Plane,
  Calendar,
  Users,
  ArrowLeftRight,
  Search,
  MapPin,
  Clock,
  Star,
  CreditCard,
  Shield
} from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import PaymentFlow from '@/components/PaymentFlow';
import paymentService, { PaymentRequest, PaymentResult } from '@/lib/payment-service';

interface FlightSearchParams {
  from: string;
  to: string;
  departDate: string;
  returnDate?: string;
  passengers: number;
  tripType: 'oneWay' | 'roundTrip';
  cabinClass: 'economy' | 'business' | 'first';
}

interface FlightResult {
  id: string;
  airline: string;
  flightNumber: string;
  from: string;
  to: string;
  departTime: string;
  arriveTime: string;
  duration: string;
  price: number;
  stops: number;
  aircraft: string;
  rating: number;
}

export default function FlightsPage() {
  const [searchParams, setSearchParams] = useState<FlightSearchParams>({
    from: '',
    to: '',
    departDate: '',
    returnDate: '',
    passengers: 1,
    tripType: 'roundTrip',
    cabinClass: 'economy'
  });

  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<FlightResult[]>([]);

  // Payment flow state
  const [showPaymentFlow, setShowPaymentFlow] = useState(false);
  const [currentPaymentRequest, setCurrentPaymentRequest] = useState<PaymentRequest | null>(null);

  const popularDestinations = [
    { city: 'New York', code: 'NYC', country: 'USA', image: '🗽' },
    { city: 'Los Angeles', code: 'LAX', country: 'USA', image: '🌴' },
    { city: 'Miami', code: 'MIA', country: 'USA', image: '🏖️' },
    { city: 'London', code: 'LHR', country: 'UK', image: '🇬🇧' },
    { city: 'Paris', code: 'CDG', country: 'France', image: '🇫🇷' },
    { city: 'Tokyo', code: 'NRT', country: 'Japan', image: '🇯🇵' },
  ];

  const mockFlightResults: FlightResult[] = [
    {
      id: '1',
      airline: 'American Airlines',
      flightNumber: 'AA 1234',
      from: 'JFK',
      to: 'LAX',
      departTime: '08:30',
      arriveTime: '11:45',
      duration: '6h 15m',
      price: 289,
      stops: 0,
      aircraft: 'Boeing 737',
      rating: 4.2
    },
    {
      id: '2',
      airline: 'Delta Air Lines',
      flightNumber: 'DL 5678',
      from: 'JFK',
      to: 'LAX',
      departTime: '14:20',
      arriveTime: '17:35',
      duration: '6h 15m',
      price: 324,
      stops: 0,
      aircraft: 'Airbus A320',
      rating: 4.5
    }
  ];

  const handleSearch = async () => {
    setIsSearching(true);
    // Simulate API call
    setTimeout(() => {
      setSearchResults(mockFlightResults);
      setIsSearching(false);
    }, 2000);
  };

  const handleBookFlight = (flight: FlightResult) => {
    // Create payment request for the flight
    const paymentRequest = paymentService.createFlightPaymentRequest(flight);
    setCurrentPaymentRequest(paymentRequest);
    setShowPaymentFlow(true);
  };

  const handlePaymentSuccess = (result: PaymentResult) => {
    setShowPaymentFlow(false);
    setCurrentPaymentRequest(null);

    // Show success message or redirect to confirmation page
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
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Plane className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Book Your Next Flight
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Search, compare, and book flights with instant payment through your Monay wallet
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-12">
          {/* Trip Type Selection */}
          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => setSearchParams({...searchParams, tripType: 'roundTrip'})}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                searchParams.tripType === 'roundTrip'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Round Trip
            </button>
            <button
              onClick={() => setSearchParams({...searchParams, tripType: 'oneWay'})}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                searchParams.tripType === 'oneWay'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              One Way
            </button>
          </div>

          {/* Search Fields */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
            {/* From */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">From</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Departure city"
                  value={searchParams.from}
                  onChange={(e) => setSearchParams({...searchParams, from: e.target.value})}
                  className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>

            {/* To */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">To</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Destination city"
                  value={searchParams.to}
                  onChange={(e) => setSearchParams({...searchParams, to: e.target.value})}
                  className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>

            {/* Departure Date */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Departure</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="date"
                  value={searchParams.departDate}
                  onChange={(e) => setSearchParams({...searchParams, departDate: e.target.value})}
                  className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>

            {/* Return Date */}
            {searchParams.tripType === 'roundTrip' && (
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Return</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="date"
                    value={searchParams.returnDate}
                    onChange={(e) => setSearchParams({...searchParams, returnDate: e.target.value})}
                    className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>
            )}

            {/* Passengers */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Passengers</label>
              <div className="relative">
                <Users className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  value={searchParams.passengers}
                  onChange={(e) => setSearchParams({...searchParams, passengers: parseInt(e.target.value)})}
                  className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none"
                >
                  {[1,2,3,4,5,6].map(num => (
                    <option key={num} value={num}>{num} {num === 1 ? 'Passenger' : 'Passengers'}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Search Button */}
          <button
            onClick={handleSearch}
            disabled={isSearching || !searchParams.from || !searchParams.to || !searchParams.departDate}
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-4 rounded-2xl font-semibold text-lg hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
          >
            {isSearching ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Searching Flights...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <Search className="h-5 w-5" />
                <span>Search Flights</span>
              </div>
            )}
          </button>
        </div>

        {/* Popular Destinations */}
        {searchResults.length === 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Popular Destinations</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {popularDestinations.map((dest) => (
                <button
                  key={dest.code}
                  onClick={() => setSearchParams({...searchParams, to: `${dest.city} (${dest.code})`})}
                  className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:scale-105"
                >
                  <div className="text-4xl mb-3">{dest.image}</div>
                  <h3 className="font-semibold text-gray-900">{dest.city}</h3>
                  <p className="text-sm text-gray-500">{dest.code}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              Flight Results ({searchResults.length} flights found)
            </h2>
            <div className="space-y-6">
              {searchResults.map((flight) => (
                <div key={flight.id} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all">
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-center">
                    {/* Flight Details */}
                    <div className="lg:col-span-2">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                          <Plane className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{flight.airline}</h3>
                          <p className="text-sm text-gray-500">{flight.flightNumber} • {flight.aircraft}</p>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="text-sm text-gray-600">{flight.rating}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-6">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-gray-900">{flight.departTime}</p>
                          <p className="text-sm text-gray-500">{flight.from}</p>
                        </div>
                        <div className="flex-1 flex items-center space-x-2">
                          <div className="h-px bg-gray-300 flex-1" />
                          <div className="flex flex-col items-center">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className="text-xs text-gray-500">{flight.duration}</span>
                            <span className="text-xs text-gray-500">
                              {flight.stops === 0 ? 'Nonstop' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}
                            </span>
                          </div>
                          <div className="h-px bg-gray-300 flex-1" />
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-gray-900">{flight.arriveTime}</p>
                          <p className="text-sm text-gray-500">{flight.to}</p>
                        </div>
                      </div>
                    </div>

                    {/* Price and Booking */}
                    <div className="text-center lg:text-right">
                      <p className="text-3xl font-bold text-gray-900 mb-2">${flight.price}</p>
                      <p className="text-sm text-gray-500 mb-4">per person</p>
                    </div>

                    <div className="text-center lg:text-right">
                      <button
                        onClick={() => handleBookFlight(flight)}
                        className="w-full lg:w-auto bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg hover:shadow-xl"
                      >
                        <div className="flex items-center space-x-2">
                          <CreditCard className="h-4 w-4" />
                          <span>Book with Monay</span>
                        </div>
                      </button>
                      <div className="flex items-center justify-center lg:justify-end space-x-1 mt-2">
                        <Shield className="h-4 w-4 text-green-500" />
                        <span className="text-xs text-gray-500">Secure Payment</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
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