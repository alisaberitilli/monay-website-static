'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Car,
  Train,
  Bus,
  MapPin,
  Clock,
  Star,
  Zap,
  CreditCard,
  Route,
  Navigation,
  TrendingUp
} from 'lucide-react';
import Link from 'next/link';

export default function TransportPage() {
  const [quickSearch, setQuickSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const transportServices = [
    {
      id: 'rideshare',
      title: 'Rideshare',
      description: 'Book Uber, Lyft, and local ride services',
      icon: Car,
      href: '/services/transport/rideshare',
      color: 'bg-green-500',
      avgPrice: '$8-25',
      eta: '3-8 min',
      deals: 'Free rides for new users'
    },
    {
      id: 'transit',
      title: 'Public Transit',
      description: 'Buy passes for buses, trains, and metro',
      icon: Train,
      href: '/services/transport/transit',
      color: 'bg-blue-500',
      avgPrice: '$2-15',
      eta: 'Instant',
      deals: 'Monthly passes available'
    },
    {
      id: 'tolls',
      title: 'Toll Payments',
      description: 'Pay highway tolls and bridge fees',
      icon: Route,
      href: '/services/transport/tolls',
      color: 'bg-purple-500',
      avgPrice: '$1-8',
      eta: 'Instant',
      deals: 'Auto-pay discounts'
    }
  ];

  const quickActions = [
    { title: 'Book a Ride Now', icon: Car, action: 'ride' },
    { title: 'Buy Transit Pass', icon: Train, action: 'transit' },
    { title: 'Pay Toll', icon: Route, action: 'toll' },
    { title: 'Find Route', icon: Navigation, action: 'route' }
  ];

  const popularRoutes = [
    {
      from: 'Downtown',
      to: 'Airport',
      rideshare: '$35',
      transit: '$8',
      duration: '25-45 min'
    },
    {
      from: 'Financial District',
      to: 'University',
      rideshare: '$18',
      transit: '$4',
      duration: '15-30 min'
    },
    {
      from: 'Suburbs',
      to: 'City Center',
      rideshare: '$28',
      transit: '$6',
      duration: '35-50 min'
    }
  ];

  const recentActivity = [
    {
      type: 'Rideshare',
      route: 'Home → Office',
      amount: '$12.50',
      time: '2 hours ago',
      status: 'Completed'
    },
    {
      type: 'Transit Pass',
      route: 'Weekly Metro Pass',
      amount: '$28.00',
      time: '1 day ago',
      status: 'Active'
    },
    {
      type: 'Toll Payment',
      route: 'Golden Gate Bridge',
      amount: '$7.50',
      time: '3 days ago',
      status: 'Completed'
    }
  ];

  const handleQuickAction = (action: string) => {
    console.log('Quick action:', action);
  };

  const handleQuickSearch = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">Transport Services</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Seamless transportation payments and bookings in one place
          </p>
        </div>

        {/* Quick Search */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Navigation className="h-5 w-5" />
              Quick Route Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="Where are you going? (e.g., 'Downtown to Airport')"
                value={quickSearch}
                onChange={(e) => setQuickSearch(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleQuickSearch} disabled={isLoading}>
                {isLoading ? <Clock className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
                Search
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common transport tasks you can do right now</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {quickActions.map((action, index) => {
                const IconComponent = action.icon;
                return (
                  <Button
                    key={index}
                    variant="outline"
                    className="h-20 flex-col gap-2"
                    onClick={() => handleQuickAction(action.action)}
                  >
                    <IconComponent className="h-6 w-6" />
                    <span className="text-sm">{action.title}</span>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Transport Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {transportServices.map((service) => {
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
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Avg Price</p>
                        <p className="font-semibold">{service.avgPrice}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">ETA</p>
                        <p className="font-semibold">{service.eta}</p>
                      </div>
                    </div>
                    <Button className="w-full">
                      Open {service.title}
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Popular Routes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Popular Routes
            </CardTitle>
            <CardDescription>Compare prices and travel times for popular destinations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {popularRoutes.map((route, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">{route.from} → {route.to}</span>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Rideshare</p>
                      <p className="font-semibold text-green-600">{route.rideshare}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Public Transit</p>
                      <p className="font-semibold text-blue-600">{route.transit}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Duration</p>
                      <p className="font-semibold">{route.duration}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Your latest transport payments and bookings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gray-100">
                      {activity.type === 'Rideshare' && <Car className="h-4 w-4" />}
                      {activity.type === 'Transit Pass' && <Train className="h-4 w-4" />}
                      {activity.type === 'Toll Payment' && <Route className="h-4 w-4" />}
                    </div>
                    <div>
                      <h3 className="font-semibold">{activity.type}</h3>
                      <p className="text-sm text-gray-600">{activity.route}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{activity.amount}</p>
                    <Badge variant={activity.status === 'Active' ? 'default' : 'secondary'}>
                      {activity.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Transport Benefits */}
        <Card>
          <CardHeader>
            <CardTitle>Transport with Monay Benefits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CreditCard className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold">Unified Payments</h3>
                <p className="text-sm text-gray-600">
                  One wallet for all transport services
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <Zap className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold">Instant Booking</h3>
                <p className="text-sm text-gray-600">
                  Fast payments and immediate confirmations
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                  <Star className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold">Rewards</h3>
                <p className="text-sm text-gray-600">
                  Earn points on every transport payment
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                  <Navigation className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="font-semibold">Route Planning</h3>
                <p className="text-sm text-gray-600">
                  Smart suggestions for optimal routes
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Usage Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Your Transport Summary</CardTitle>
            <CardDescription>This month's transport activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">24</div>
                <p className="text-sm text-gray-600">Rides Taken</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">$186</div>
                <p className="text-sm text-gray-600">Total Spent</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">47</div>
                <p className="text-sm text-gray-600">Hours Saved</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">890</div>
                <p className="text-sm text-gray-600">Points Earned</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}