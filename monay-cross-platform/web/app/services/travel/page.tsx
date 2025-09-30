'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Plane,
  Hotel,
  Car,
  MapPin,
  Calendar,
  Search,
  TrendingUp,
  Star,
  Clock,
  Users
} from 'lucide-react';
import Link from 'next/link';

export default function TravelPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const travelServices = [
    {
      id: 'flights',
      title: 'Flights',
      description: 'Book domestic and international flights',
      icon: Plane,
      href: '/services/travel/flights',
      color: 'bg-blue-500',
      deals: '20% off selected routes'
    },
    {
      id: 'hotels',
      title: 'Hotels',
      description: 'Find and book accommodations worldwide',
      icon: Hotel,
      href: '/services/travel/hotels',
      color: 'bg-green-500',
      deals: 'Free cancellation'
    },
    {
      id: 'car-rental',
      title: 'Car Rental',
      description: 'Rent vehicles for your travel needs',
      icon: Car,
      href: '/services/travel/car-rental',
      color: 'bg-purple-500',
      deals: 'Up to 30% off'
    }
  ];

  const popularDestinations = [
    { name: 'New York', country: 'USA', image: '🗽', price: 'from $299' },
    { name: 'London', country: 'UK', image: '🏰', price: 'from $599' },
    { name: 'Tokyo', country: 'Japan', image: '🗾', price: 'from $899' },
    { name: 'Paris', country: 'France', image: '🗼', price: 'from $649' },
    { name: 'Dubai', country: 'UAE', image: '🏙️', price: 'from $749' },
    { name: 'Sydney', country: 'Australia', image: '🦘', price: 'from $1,199' }
  ];

  const recentBookings = [
    { destination: 'Los Angeles', type: 'Flight', date: '2024-01-15', status: 'Confirmed' },
    { destination: 'Miami Beach', type: 'Hotel', date: '2024-01-20', status: 'Pending' },
    { destination: 'San Francisco', type: 'Car Rental', date: '2024-01-25', status: 'Confirmed' }
  ];

  const handleQuickSearch = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">Travel Services</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Book flights, hotels, and car rentals with seamless payment integration
          </p>
        </div>

        {/* Quick Search */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Quick Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="Search destinations, hotels, or flights..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleQuickSearch} disabled={isLoading}>
                {isLoading ? <Clock className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                Search
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Travel Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {travelServices.map((service) => {
            const IconComponent = service.icon;
            return (
              <Link key={service.id} href={service.href as any}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className={`p-3 rounded-lg ${service.color} text-white`}>
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <Badge variant="secondary">{service.deals}</Badge>
                    </div>
                    <CardTitle>{service.title}</CardTitle>
                    <CardDescription>{service.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full">
                      Browse {service.title}
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Popular Destinations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Popular Destinations
            </CardTitle>
            <CardDescription>Trending travel destinations this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {popularDestinations.map((destination, index) => (
                <div key={index} className="text-center space-y-2 p-4 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div className="text-3xl">{destination.image}</div>
                  <h3 className="font-semibold">{destination.name}</h3>
                  <p className="text-sm text-gray-600">{destination.country}</p>
                  <p className="text-sm font-medium text-blue-600">{destination.price}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Bookings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Bookings
            </CardTitle>
            <CardDescription>Your latest travel bookings and reservations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentBookings.map((booking, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-gray-500" />
                    <div>
                      <h3 className="font-semibold">{booking.destination}</h3>
                      <p className="text-sm text-gray-600">{booking.type} • {booking.date}</p>
                    </div>
                  </div>
                  <Badge variant={booking.status === 'Confirmed' ? 'default' : 'secondary'}>
                    {booking.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Travel Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Travel Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="font-semibold">💳 Payment Benefits</h3>
                <p className="text-sm text-gray-600">
                  Earn rewards on all travel bookings and enjoy instant payment processing
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">🔒 Secure Booking</h3>
                <p className="text-sm text-gray-600">
                  All bookings are secured with encrypted payments and fraud protection
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">📱 Mobile Check-in</h3>
                <p className="text-sm text-gray-600">
                  Skip lines with mobile boarding passes and hotel check-ins
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">🌍 Global Coverage</h3>
                <p className="text-sm text-gray-600">
                  Book travel services worldwide with local currency support
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}