'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plane,
  Calendar,
  Users,
  Search,
  ArrowLeftRight,
  MapPin,
  Clock,
  Star,
  Wifi,
  Coffee,
  Luggage,
  CreditCard
} from 'lucide-react';

export default function FlightsPage() {
  const [searchForm, setSearchForm] = useState({
    from: '',
    to: '',
    departDate: '',
    returnDate: '',
    passengers: '1',
    class: 'economy'
  });
  const [tripType, setTripType] = useState('roundtrip');
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const mockFlights = [
    {
      id: 1,
      airline: 'American Airlines',
      flightNumber: 'AA 123',
      departure: { time: '08:00 AM', airport: 'LAX', city: 'Los Angeles' },
      arrival: { time: '04:30 PM', airport: 'JFK', city: 'New York' },
      duration: '5h 30m',
      stops: 'Nonstop',
      price: 299,
      amenities: ['wifi', 'entertainment', 'meals'],
      rating: 4.2
    },
    {
      id: 2,
      airline: 'Delta Airlines',
      flightNumber: 'DL 456',
      departure: { time: '10:15 AM', airport: 'LAX', city: 'Los Angeles' },
      arrival: { time: '06:45 PM', airport: 'JFK', city: 'New York' },
      duration: '5h 30m',
      stops: 'Nonstop',
      price: 349,
      amenities: ['wifi', 'entertainment', 'meals', 'extra-legroom'],
      rating: 4.5
    },
    {
      id: 3,
      airline: 'United Airlines',
      flightNumber: 'UA 789',
      departure: { time: '02:20 PM', airport: 'LAX', city: 'Los Angeles' },
      arrival: { time: '10:50 PM', airport: 'JFK', city: 'New York' },
      duration: '5h 30m',
      stops: 'Nonstop',
      price: 279,
      amenities: ['wifi', 'entertainment'],
      rating: 4.1
    }
  ];

  const popularRoutes = [
    { from: 'Los Angeles', to: 'New York', price: '$299' },
    { from: 'San Francisco', to: 'Chicago', price: '$199' },
    { from: 'Miami', to: 'Boston', price: '$249' },
    { from: 'Seattle', to: 'Denver', price: '$179' }
  ];

  const handleSearch = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setSearchResults(mockFlights);
    setIsLoading(false);
  };

  const handleBookFlight = (flightId: number) => {
    // Handle flight booking
    console.log('Booking flight:', flightId);
  };

  const getAmenityIcon = (amenity: string) => {
    switch (amenity) {
      case 'wifi': return <Wifi className="h-4 w-4" />;
      case 'entertainment': return <Star className="h-4 w-4" />;
      case 'meals': return <Coffee className="h-4 w-4" />;
      case 'extra-legroom': return <Users className="h-4 w-4" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-sky-100 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900 flex items-center justify-center gap-3">
            <Plane className="h-8 w-8 text-blue-600" />
            Flight Booking
          </h1>
          <p className="text-lg text-gray-600">
            Find and book flights with instant payment processing
          </p>
        </div>

        {/* Search Form */}
        <Card>
          <CardHeader>
            <CardTitle>Search Flights</CardTitle>
            <CardDescription>Find the best flights for your travel dates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Trip Type */}
            <Tabs value={tripType} onValueChange={setTripType}>
              <TabsList>
                <TabsTrigger value="roundtrip">Round Trip</TabsTrigger>
                <TabsTrigger value="oneway">One Way</TabsTrigger>
                <TabsTrigger value="multicity">Multi City</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Search Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">From</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Departure city"
                    value={searchForm.from}
                    onChange={(e) => setSearchForm({...searchForm, from: e.target.value})}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">To</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Destination city"
                    value={searchForm.to}
                    onChange={(e) => setSearchForm({...searchForm, to: e.target.value})}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Departure</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    type="date"
                    value={searchForm.departDate}
                    onChange={(e) => setSearchForm({...searchForm, departDate: e.target.value})}
                    className="pl-10"
                  />
                </div>
              </div>

              {tripType === 'roundtrip' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Return</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      type="date"
                      value={searchForm.returnDate}
                      onChange={(e) => setSearchForm({...searchForm, returnDate: e.target.value})}
                      className="pl-10"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Passengers</label>
                <Select value={searchForm.passengers} onValueChange={(value) => setSearchForm({...searchForm, passengers: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1,2,3,4,5,6].map(num => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} {num === 1 ? 'Passenger' : 'Passengers'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Class</label>
                <Select value={searchForm.class} onValueChange={(value) => setSearchForm({...searchForm, class: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="economy">Economy</SelectItem>
                    <SelectItem value="premium">Premium Economy</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="first">First Class</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button onClick={handleSearch} disabled={isLoading} className="w-full">
                  {isLoading ? (
                    <Clock className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Search className="h-4 w-4 mr-2" />
                  )}
                  Search Flights
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Popular Routes */}
        <Card>
          <CardHeader>
            <CardTitle>Popular Routes</CardTitle>
            <CardDescription>Quick search for trending destinations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {popularRoutes.map((route, index) => (
                <div key={index} className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{route.from}</span>
                    <ArrowLeftRight className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">{route.to}</span>
                  </div>
                  <p className="text-sm text-blue-600 font-semibold">Starting {route.price}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Flight Results</CardTitle>
              <CardDescription>Found {searchResults.length} flights for your search</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {searchResults.map((flight: any) => (
                <div key={flight.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-center">
                    {/* Flight Info */}
                    <div className="lg:col-span-2">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="text-lg font-semibold">{flight.airline}</div>
                        <Badge variant="outline">{flight.flightNumber}</Badge>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm">{flight.rating}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="font-bold text-lg">{flight.departure.time}</div>
                          <div className="text-sm text-gray-600">{flight.departure.airport}</div>
                          <div className="text-xs text-gray-500">{flight.departure.city}</div>
                        </div>
                        <div className="flex flex-col items-center justify-center">
                          <Plane className="h-5 w-5 text-gray-400 mb-1" />
                          <div className="text-xs text-gray-500">{flight.duration}</div>
                          <div className="text-xs text-green-600">{flight.stops}</div>
                        </div>
                        <div>
                          <div className="font-bold text-lg">{flight.arrival.time}</div>
                          <div className="text-sm text-gray-600">{flight.arrival.airport}</div>
                          <div className="text-xs text-gray-500">{flight.arrival.city}</div>
                        </div>
                      </div>
                    </div>

                    {/* Amenities */}
                    <div>
                      <div className="text-sm font-medium mb-2">Amenities</div>
                      <div className="flex flex-wrap gap-2">
                        {flight.amenities.map((amenity: string, index: number) => (
                          <div key={index} className="flex items-center gap-1 text-xs bg-gray-100 px-2 py-1 rounded">
                            {getAmenityIcon(amenity)}
                            <span className="capitalize">{amenity.replace('-', ' ')}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Price and Book */}
                    <div className="text-center lg:text-right">
                      <div className="text-2xl font-bold text-blue-600 mb-2">${flight.price}</div>
                      <div className="text-xs text-gray-500 mb-4">per person</div>
                      <Button onClick={() => handleBookFlight(flight.id)} className="w-full lg:w-auto">
                        <CreditCard className="h-4 w-4 mr-2" />
                        Book Now
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Flight Booking Benefits */}
        <Card>
          <CardHeader>
            <CardTitle>Why Book with Monay?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <CreditCard className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold">Instant Payment</h3>
                <p className="text-sm text-gray-600">
                  Pay instantly with your Monay wallet and earn rewards on every booking
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <Luggage className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold">Travel Protection</h3>
                <p className="text-sm text-gray-600">
                  Complimentary travel insurance and 24/7 customer support included
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                  <Star className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold">Best Prices</h3>
                <p className="text-sm text-gray-600">
                  Price match guarantee and exclusive member discounts
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}