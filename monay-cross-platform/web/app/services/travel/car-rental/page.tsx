'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Car,
  Calendar,
  MapPin,
  Search,
  Users,
  Fuel,
  Settings,
  Shield,
  Clock,
  CreditCard,
  Star,
  Zap
} from 'lucide-react';

export default function CarRentalPage() {
  const [searchForm, setSearchForm] = useState({
    pickupLocation: '',
    dropoffLocation: '',
    pickupDate: '',
    pickupTime: '10:00',
    dropoffDate: '',
    dropoffTime: '10:00',
    driverAge: '25-65'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const mockVehicles = [
    {
      id: 1,
      name: 'Toyota Camry',
      category: 'economy',
      seats: 5,
      transmission: 'Automatic',
      fuel: 'Gasoline',
      provider: 'Enterprise',
      rating: 4.5,
      reviews: 892,
      pricePerDay: 45,
      features: ['AC', 'Bluetooth', 'GPS'],
      image: '🚗',
      availability: 'Available',
      mileage: 'Unlimited'
    },
    {
      id: 2,
      name: 'BMW X3',
      category: 'luxury',
      seats: 5,
      transmission: 'Automatic',
      fuel: 'Gasoline',
      provider: 'Hertz',
      rating: 4.7,
      reviews: 654,
      pricePerDay: 125,
      features: ['AC', 'Bluetooth', 'GPS', 'Leather', 'Sunroof'],
      image: '🚙',
      availability: 'Last 2 available',
      mileage: 'Unlimited'
    },
    {
      id: 3,
      name: 'Tesla Model 3',
      category: 'electric',
      seats: 5,
      transmission: 'Automatic',
      fuel: 'Electric',
      provider: 'Hertz',
      rating: 4.8,
      reviews: 423,
      pricePerDay: 89,
      features: ['AC', 'Autopilot', 'Supercharging', 'Premium Audio'],
      image: '⚡',
      availability: 'Available',
      mileage: '300 miles range'
    },
    {
      id: 4,
      name: 'Ford Expedition',
      category: 'suv',
      seats: 8,
      transmission: 'Automatic',
      fuel: 'Gasoline',
      provider: 'Budget',
      rating: 4.3,
      reviews: 321,
      pricePerDay: 95,
      features: ['AC', 'Bluetooth', 'GPS', '4WD', 'Cargo Space'],
      image: '🚗',
      availability: 'Available',
      mileage: 'Unlimited'
    }
  ];

  const carCategories = [
    { id: 'all', name: 'All Categories', icon: Car },
    { id: 'economy', name: 'Economy', icon: Car },
    { id: 'luxury', name: 'Luxury', icon: Star },
    { id: 'suv', name: 'SUV', icon: Car },
    { id: 'electric', name: 'Electric', icon: Zap }
  ];

  const popularPickupLocations = [
    'Los Angeles Airport (LAX)',
    'New York JFK Airport',
    'Miami Airport (MIA)',
    'San Francisco Airport (SFO)',
    'Las Vegas Airport (LAS)',
    'Chicago O\'Hare (ORD)'
  ];

  const handleSearch = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    let filteredResults = mockVehicles;
    if (selectedCategory !== 'all') {
      filteredResults = mockVehicles.filter(vehicle => vehicle.category === selectedCategory);
    }

    setSearchResults(filteredResults);
    setIsLoading(false);
  };

  const handleBookVehicle = (vehicleId: number) => {
    console.log('Booking vehicle:', vehicleId);
  };

  const calculateTotalDays = () => {
    if (searchForm.pickupDate && searchForm.dropoffDate) {
      const pickup = new Date(searchForm.pickupDate);
      const dropoff = new Date(searchForm.dropoffDate);
      const diffTime = Math.abs(dropoff.getTime() - pickup.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays || 1;
    }
    return 1;
  };

  return (
    <DashboardLayout>
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900 flex items-center justify-center gap-3">
            <Car className="h-8 w-8 text-orange-600" />
            Car Rental
          </h1>
          <p className="text-lg text-gray-600">
            Rent vehicles from trusted providers with instant payment
          </p>
        </div>

        {/* Search Form */}
        <Card>
          <CardHeader>
            <CardTitle>Search Rental Cars</CardTitle>
            <CardDescription>Find the perfect vehicle for your trip</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Location and Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Pick-up Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Enter pick-up location"
                      value={searchForm.pickupLocation}
                      onChange={(e) => setSearchForm({...searchForm, pickupLocation: e.target.value})}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Drop-off Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Enter drop-off location (optional)"
                      value={searchForm.dropoffLocation}
                      onChange={(e) => setSearchForm({...searchForm, dropoffLocation: e.target.value})}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Pick-up Date</label>
                    <Input
                      type="date"
                      value={searchForm.pickupDate}
                      onChange={(e) => setSearchForm({...searchForm, pickupDate: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Pick-up Time</label>
                    <Input
                      type="time"
                      value={searchForm.pickupTime}
                      onChange={(e) => setSearchForm({...searchForm, pickupTime: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Drop-off Date</label>
                    <Input
                      type="date"
                      value={searchForm.dropoffDate}
                      onChange={(e) => setSearchForm({...searchForm, dropoffDate: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Drop-off Time</label>
                    <Input
                      type="time"
                      value={searchForm.dropoffTime}
                      onChange={(e) => setSearchForm({...searchForm, dropoffTime: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Driver Age</label>
                <Select value={searchForm.driverAge} onValueChange={(value) => setSearchForm({...searchForm, driverAge: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="18-24">18-24 years</SelectItem>
                    <SelectItem value="25-65">25-65 years</SelectItem>
                    <SelectItem value="65+">65+ years</SelectItem>
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
                  Search Cars
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Popular Pickup Locations */}
        <Card>
          <CardHeader>
            <CardTitle>Popular Pick-up Locations</CardTitle>
            <CardDescription>Quick search from major airports and cities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {popularPickupLocations.map((location, index) => (
                <div
                  key={index}
                  className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer text-sm"
                  onClick={() => setSearchForm({...searchForm, pickupLocation: location})}
                >
                  {location}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Vehicle Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Vehicle Categories</CardTitle>
            <CardDescription>Choose the type of vehicle that suits your needs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {carCategories.map((category) => {
                const IconComponent = category.icon;
                return (
                  <div
                    key={category.id}
                    className={`p-4 border rounded-lg cursor-pointer text-center hover:shadow-md transition-shadow ${
                      selectedCategory === category.id ? 'border-orange-500 bg-orange-50' : ''
                    }`}
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    <IconComponent className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                    <h3 className="font-medium text-sm">{category.name}</h3>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Available Vehicles</CardTitle>
              <CardDescription>
                Found {searchResults.length} vehicles for {calculateTotalDays()} day(s)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {searchResults.map((vehicle: any) => (
                <div key={vehicle.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-center">
                    {/* Vehicle Image and Basic Info */}
                    <div className="lg:col-span-1">
                      <div className="text-center space-y-2">
                        <div className="text-6xl">{vehicle.image}</div>
                        <h3 className="font-semibold text-lg">{vehicle.name}</h3>
                        <p className="text-sm text-gray-600">{vehicle.provider}</p>
                      </div>
                    </div>

                    {/* Vehicle Details */}
                    <div className="lg:col-span-2 space-y-4">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{vehicle.seats} seats</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Settings className="h-4 w-4" />
                          <span>{vehicle.transmission}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Fuel className="h-4 w-4" />
                          <span>{vehicle.fuel}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="font-medium">{vehicle.rating}</span>
                        </div>
                        <span className="text-sm text-gray-600">({vehicle.reviews} reviews)</span>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {vehicle.features.map((feature: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>

                      <div className="space-y-1">
                        <p className="text-sm font-medium">Mileage: {vehicle.mileage}</p>
                        <p className={`text-sm font-medium ${
                          vehicle.availability === 'Available' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {vehicle.availability}
                        </p>
                      </div>
                    </div>

                    {/* Price and Book */}
                    <div className="lg:col-span-1 text-center lg:text-right space-y-4">
                      <div>
                        <div className="text-2xl font-bold text-orange-600">${vehicle.pricePerDay}</div>
                        <div className="text-sm text-gray-600">per day</div>
                        <div className="text-lg font-semibold text-gray-900 mt-1">
                          Total: ${vehicle.pricePerDay * calculateTotalDays()}
                        </div>
                      </div>

                      <Button onClick={() => handleBookVehicle(vehicle.id)} className="w-full">
                        <CreditCard className="h-4 w-4 mr-2" />
                        Book Now
                      </Button>

                      <p className="text-xs text-gray-500">Taxes and fees included</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Car Rental Benefits */}
        <Card>
          <CardHeader>
            <CardTitle>Why Rent with Monay?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                  <CreditCard className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="font-semibold">Instant Booking</h3>
                <p className="text-sm text-gray-600">
                  Pay with your Monay wallet and get instant confirmation
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <Shield className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold">Full Coverage</h3>
                <p className="text-sm text-gray-600">
                  Comprehensive insurance included with all bookings
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold">24/7 Support</h3>
                <p className="text-sm text-gray-600">
                  Round-the-clock roadside assistance and customer support
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </DashboardLayout>
  );
}