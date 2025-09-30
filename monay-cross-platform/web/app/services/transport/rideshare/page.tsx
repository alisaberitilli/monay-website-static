'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Car,
  MapPin,
  Clock,
  Star,
  Users,
  Navigation,
  CreditCard,
  Zap,
  Shield,
  Phone
} from 'lucide-react';

export default function RidesharePage() {
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [rideType, setRideType] = useState('standard');
  const [isSearching, setIsSearching] = useState(false);
  const [availableRides, setAvailableRides] = useState<any[]>([]);

  const mockRides = [
    {
      id: 1,
      provider: 'Uber',
      type: 'UberX',
      eta: '3 min',
      price: 18.50,
      duration: '12 min',
      driver: 'John D.',
      rating: 4.9,
      vehicle: 'Toyota Camry • ABC 123',
      capacity: 4,
      features: ['Standard ride', 'AC', 'GPS tracking'],
      surge: false
    },
    {
      id: 2,
      provider: 'Lyft',
      type: 'Lyft',
      eta: '5 min',
      price: 17.25,
      duration: '14 min',
      driver: 'Sarah M.',
      rating: 4.8,
      vehicle: 'Honda Accord • XYZ 789',
      capacity: 4,
      features: ['Standard ride', 'AC', 'Phone charger'],
      surge: false
    },
    {
      id: 3,
      provider: 'Uber',
      type: 'UberXL',
      eta: '7 min',
      price: 24.75,
      duration: '12 min',
      driver: 'Mike R.',
      rating: 4.9,
      vehicle: 'Honda Pilot • DEF 456',
      capacity: 6,
      features: ['Large vehicle', 'Extra space', 'AC'],
      surge: false
    },
    {
      id: 4,
      provider: 'Uber',
      type: 'Uber Black',
      eta: '8 min',
      price: 35.00,
      duration: '12 min',
      driver: 'James W.',
      rating: 5.0,
      vehicle: 'BMW 5 Series • GHI 321',
      capacity: 4,
      features: ['Luxury vehicle', 'Professional driver', 'Premium'],
      surge: false
    }
  ];

  const rideTypes = [
    { id: 'standard', name: 'Standard', icon: Car, description: 'Affordable rides' },
    { id: 'xl', name: 'XL/Large', icon: Users, description: 'Extra space for groups' },
    { id: 'premium', name: 'Premium', icon: Star, description: 'Luxury vehicles' },
    { id: 'shared', name: 'Shared', icon: Users, description: 'Split the cost' }
  ];

  const recentAddresses = [
    { name: 'Home', address: '123 Main St, San Francisco, CA' },
    { name: 'Work', address: '456 Market St, San Francisco, CA' },
    { name: 'Airport', address: 'San Francisco International Airport' },
    { name: 'Downtown', address: 'Union Square, San Francisco, CA' }
  ];

  const handleSearchRides = async () => {
    setIsSearching(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setAvailableRides(mockRides);
    setIsSearching(false);
  };

  const handleBookRide = (rideId: number) => {
    console.log('Booking ride:', rideId);
  };

  const handleCallDriver = (driverName: string) => {
    console.log('Calling driver:', driverName);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900 flex items-center justify-center gap-3">
            <Car className="h-8 w-8 text-green-600" />
            Rideshare Booking
          </h1>
          <p className="text-lg text-gray-600">
            Book rides from Uber, Lyft, and local providers
          </p>
        </div>

        {/* Trip Planning */}
        <Card>
          <CardHeader>
            <CardTitle>Plan Your Trip</CardTitle>
            <CardDescription>Enter your pickup and destination to find available rides</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Pickup and Destination */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Pickup Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Enter pickup address"
                    value={pickup}
                    onChange={(e) => setPickup(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Destination</label>
                <div className="relative">
                  <Navigation className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Enter destination address"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            {/* Recent Addresses */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Recent Addresses</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {recentAddresses.map((address, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="text-left justify-start h-auto p-3"
                    onClick={() => setDestination(address.address)}
                  >
                    <div>
                      <div className="font-medium">{address.name}</div>
                      <div className="text-xs text-gray-600 truncate">{address.address}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            {/* Ride Type Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Ride Type</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {rideTypes.map((type) => {
                  const IconComponent = type.icon;
                  return (
                    <Button
                      key={type.id}
                      variant={rideType === type.id ? "default" : "outline"}
                      className="h-auto p-4 flex-col gap-2"
                      onClick={() => setRideType(type.id)}
                    >
                      <IconComponent className="h-6 w-6" />
                      <div className="text-center">
                        <div className="font-medium">{type.name}</div>
                        <div className="text-xs text-gray-600">{type.description}</div>
                      </div>
                    </Button>
                  );
                })}
              </div>
            </div>

            <Button
              onClick={handleSearchRides}
              disabled={isSearching || !pickup || !destination}
              className="w-full"
            >
              {isSearching ? (
                <Clock className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Navigation className="h-4 w-4 mr-2" />
              )}
              Find Rides
            </Button>
          </CardContent>
        </Card>

        {/* Available Rides */}
        {availableRides.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Available Rides</CardTitle>
              <CardDescription>Choose from available drivers in your area</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {availableRides.map((ride: any) => (
                <div key={ride.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                    {/* Provider and Vehicle Info */}
                    <div className="md:col-span-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="font-semibold text-lg">{ride.provider}</div>
                        <Badge variant="outline">{ride.type}</Badge>
                      </div>
                      <p className="text-sm text-gray-600">{ride.vehicle}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">{ride.capacity} seats</span>
                      </div>
                    </div>

                    {/* Driver Info */}
                    <div className="md:col-span-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium">{ride.driver}</span>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm">{ride.rating}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {ride.features.slice(0, 2).map((feature: string, index: number) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Trip Details */}
                    <div className="md:col-span-1">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">ETA: {ride.eta}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Navigation className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">Trip: {ride.duration}</span>
                        </div>
                        {ride.surge && (
                          <Badge variant="destructive" className="text-xs">
                            Surge Pricing
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Price and Actions */}
                    <div className="md:col-span-1 text-center md:text-right space-y-3">
                      <div className="text-2xl font-bold text-green-600">${ride.price}</div>

                      <div className="flex flex-col gap-2">
                        <Button onClick={() => handleBookRide(ride.id)} className="w-full">
                          <CreditCard className="h-4 w-4 mr-2" />
                          Book Ride
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCallDriver(ride.driver)}
                          className="w-full"
                        >
                          <Phone className="h-4 w-4 mr-2" />
                          Call Driver
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Rideshare Benefits */}
        <Card>
          <CardHeader>
            <CardTitle>Why Use Monay for Rideshare?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CreditCard className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold">Unified Payments</h3>
                <p className="text-sm text-gray-600">
                  Pay for all rideshare services from one wallet
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <Zap className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold">Instant Booking</h3>
                <p className="text-sm text-gray-600">
                  Fast payments and immediate ride confirmations
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                  <Shield className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold">Safe & Secure</h3>
                <p className="text-sm text-gray-600">
                  Enhanced security and trip protection included
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ride History */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Rides</CardTitle>
            <CardDescription>Your rideshare history and spending</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { route: 'Home → Downtown', provider: 'Uber', amount: '$15.50', date: 'Today, 2:30 PM' },
                { route: 'Airport → Hotel', provider: 'Lyft', amount: '$28.75', date: 'Yesterday, 6:45 PM' },
                { route: 'Office → Restaurant', provider: 'Uber', amount: '$12.25', date: '2 days ago' }
              ].map((ride, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded border">
                  <div className="flex items-center gap-3">
                    <Car className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-medium">{ride.route}</p>
                      <p className="text-sm text-gray-600">{ride.provider} • {ride.date}</p>
                    </div>
                  </div>
                  <div className="font-semibold">{ride.amount}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}