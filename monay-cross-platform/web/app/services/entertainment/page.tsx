'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Ticket,
  Music,
  Film,
  Gamepad2,
  Calendar,
  MapPin,
  Clock,
  Star,
  CreditCard,
  Users,
  Play,
  Trophy,
  Headphones
} from 'lucide-react';

export default function EntertainmentPage() {
  const [selectedTab, setSelectedTab] = useState('events');
  const [selectedCity, setSelectedCity] = useState('san-francisco');
  const [isLoading, setIsLoading] = useState(false);

  const cities = [
    { id: 'san-francisco', name: 'San Francisco' },
    { id: 'los-angeles', name: 'Los Angeles' },
    { id: 'new-york', name: 'New York' },
    { id: 'chicago', name: 'Chicago' },
    { id: 'miami', name: 'Miami' }
  ];

  const upcomingEvents = [
    {
      id: 1,
      title: 'The Weeknd - After Hours Tour',
      type: 'Concert',
      venue: 'Chase Center',
      date: '2024-03-15',
      time: '8:00 PM',
      price: 125.00,
      image: '🎤',
      category: 'Music',
      rating: 4.8,
      availability: 'Few tickets left'
    },
    {
      id: 2,
      title: 'Hamilton',
      type: 'Theater',
      venue: 'Orpheum Theatre',
      date: '2024-02-28',
      time: '7:30 PM',
      price: 89.00,
      image: '🎭',
      category: 'Theater',
      rating: 4.9,
      availability: 'Available'
    },
    {
      id: 3,
      title: 'Warriors vs Lakers',
      type: 'Sports',
      venue: 'Chase Center',
      date: '2024-03-05',
      time: '7:00 PM',
      price: 195.00,
      image: '🏀',
      category: 'Sports',
      rating: 4.7,
      availability: 'Selling fast'
    },
    {
      id: 4,
      title: 'Comedy Night Live',
      type: 'Comedy',
      venue: 'Punch Line',
      date: '2024-02-20',
      time: '9:00 PM',
      price: 35.00,
      image: '😂',
      category: 'Comedy',
      rating: 4.5,
      availability: 'Available'
    }
  ];

  const streamingServices = [
    {
      name: 'Netflix',
      price: 15.99,
      type: 'Monthly',
      icon: '📺',
      category: 'Video Streaming',
      features: ['4K Ultra HD', 'Multiple screens', 'Original content']
    },
    {
      name: 'Spotify Premium',
      price: 10.99,
      type: 'Monthly',
      icon: '🎵',
      category: 'Music Streaming',
      features: ['Ad-free music', 'Offline downloads', 'High quality audio']
    },
    {
      name: 'Disney+',
      price: 7.99,
      type: 'Monthly',
      icon: '🏰',
      category: 'Video Streaming',
      features: ['Disney classics', 'Marvel', 'Star Wars', 'Pixar']
    },
    {
      name: 'Xbox Game Pass',
      price: 14.99,
      type: 'Monthly',
      icon: '🎮',
      category: 'Gaming',
      features: ['100+ games', 'New releases', 'Cloud gaming']
    },
    {
      name: 'YouTube Premium',
      price: 11.99,
      type: 'Monthly',
      icon: '📱',
      category: 'Video Streaming',
      features: ['Ad-free videos', 'Background play', 'YouTube Music']
    },
    {
      name: 'Apple Arcade',
      price: 4.99,
      type: 'Monthly',
      icon: '🍎',
      category: 'Gaming',
      features: ['200+ games', 'No ads', 'Family sharing']
    }
  ];

  const mySubscriptions = [
    {
      service: 'Netflix',
      amount: 15.99,
      nextBilling: '2024-02-15',
      status: 'Active',
      plan: 'Standard'
    },
    {
      service: 'Spotify Premium',
      amount: 10.99,
      nextBilling: '2024-02-20',
      status: 'Active',
      plan: 'Individual'
    },
    {
      service: 'HBO Max',
      amount: 14.99,
      nextBilling: '2024-02-25',
      status: 'Paused',
      plan: 'Standard'
    }
  ];

  const recentPurchases = [
    {
      title: 'Dune: Part Two - Movie Tickets',
      venue: 'AMC Metreon 16',
      amount: 28.00,
      date: '2024-01-15',
      type: 'Movie'
    },
    {
      title: 'Taylor Swift - The Eras Tour',
      venue: "Levi's Stadium",
      amount: 199.00,
      date: '2024-01-10',
      type: 'Concert'
    },
    {
      title: 'PlayStation Plus - Annual',
      venue: 'Digital Purchase',
      amount: 59.99,
      date: '2024-01-05',
      type: 'Gaming'
    }
  ];

  const handleBuyTicket = async (eventId: number) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsLoading(false);
  };

  const handleSubscribe = (serviceName: string) => {
    console.log('Subscribing to:', serviceName);
  };

  const handleManageSubscription = (serviceName: string) => {
    console.log('Managing subscription:', serviceName);
  };

  return (
    <DashboardLayout>
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-100 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900 flex items-center justify-center gap-3">
            <Ticket className="h-8 w-8 text-orange-600" />
            Entertainment
          </h1>
          <p className="text-lg text-gray-600">
            Book events, manage subscriptions, and enjoy entertainment seamlessly
          </p>
        </div>

        {/* Main Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="events">Events & Tickets</TabsTrigger>
            <TabsTrigger value="streaming">Streaming Services</TabsTrigger>
            <TabsTrigger value="subscriptions">My Subscriptions</TabsTrigger>
          </TabsList>

          {/* Events & Tickets Tab */}
          <TabsContent value="events" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Find Events</CardTitle>
                <CardDescription>Search for concerts, shows, sports, and more</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Select value={selectedCity} onValueChange={setSelectedCity}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map((city) => (
                        <SelectItem key={city.id} value={city.id}>
                          {city.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input placeholder="Search events, artists, teams..." />
                  <Button>
                    <Ticket className="h-4 w-4 mr-2" />
                    Search Events
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upcoming Events in {cities.find(c => c.id === selectedCity)?.name}</CardTitle>
                <CardDescription>Popular events happening near you</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {upcomingEvents.map((event) => (
                    <Card key={event.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-4">
                        <div className="space-y-4">
                          <div className="text-center">
                            <div className="text-6xl mb-2">{event.image}</div>
                            <Badge variant="outline">{event.category}</Badge>
                          </div>

                          <div className="space-y-2">
                            <h3 className="font-semibold text-sm leading-tight">{event.title}</h3>

                            <div className="space-y-1 text-xs text-gray-600">
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                <span>{event.venue}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>{event.date}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>{event.time}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-500" />
                              <span className="text-sm font-medium">{event.rating}</span>
                            </div>

                            <div className="flex items-center justify-between">
                              <span className="text-lg font-bold text-orange-600">
                                ${event.price}
                              </span>
                              <Badge variant={event.availability === 'Available' ? 'default' : 'secondary'}>
                                {event.availability}
                              </Badge>
                            </div>
                          </div>

                          <Button
                            onClick={() => handleBuyTicket(event.id)}
                            disabled={isLoading}
                            className="w-full"
                            size="sm"
                          >
                            <CreditCard className="h-4 w-4 mr-2" />
                            Buy Tickets
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Streaming Services Tab */}
          <TabsContent value="streaming" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Popular Streaming Services</CardTitle>
                <CardDescription>Subscribe to your favorite entertainment platforms</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {streamingServices.map((service, index) => (
                    <Card key={index} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="text-3xl">{service.icon}</div>
                          <Badge variant="outline">{service.category}</Badge>
                        </div>
                        <CardTitle className="text-lg">{service.name}</CardTitle>
                        <div className="text-2xl font-bold text-orange-600">
                          ${service.price}<span className="text-sm text-gray-600">/{service.type.toLowerCase()}</span>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-1">
                          {service.features.map((feature, idx) => (
                            <div key={idx} className="text-sm text-gray-600">• {feature}</div>
                          ))}
                        </div>

                        <Button
                          onClick={() => handleSubscribe(service.name)}
                          className="w-full"
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Subscribe Now
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* My Subscriptions Tab */}
          <TabsContent value="subscriptions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Headphones className="h-5 w-5" />
                  Active Subscriptions
                </CardTitle>
                <CardDescription>Manage your entertainment subscriptions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mySubscriptions.map((subscription, index) => (
                    <div key={index} className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-orange-100">
                          <Play className="h-5 w-5 text-orange-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{subscription.service}</h3>
                          <p className="text-sm text-gray-600">
                            {subscription.plan} Plan • Next billing: {subscription.nextBilling}
                          </p>
                        </div>
                      </div>
                      <div className="text-right space-x-2">
                        <span className="font-semibold">${subscription.amount}</span>
                        <Badge variant={subscription.status === 'Active' ? 'default' : 'secondary'}>
                          {subscription.status}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleManageSubscription(subscription.service)}
                        >
                          Manage
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-orange-600">3</div>
                      <p className="text-sm text-gray-600">Active Services</p>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">$41.97</div>
                      <p className="text-sm text-gray-600">Monthly Total</p>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">$503.64</div>
                      <p className="text-sm text-gray-600">Annual Cost</p>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600">$67.23</div>
                      <p className="text-sm text-gray-600">Savings This Year</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Purchases */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Recent Entertainment Purchases
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentPurchases.map((purchase, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded border">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-orange-100">
                          {purchase.type === 'Movie' && <Film className="h-4 w-4 text-orange-600" />}
                          {purchase.type === 'Concert' && <Music className="h-4 w-4 text-orange-600" />}
                          {purchase.type === 'Gaming' && <Gamepad2 className="h-4 w-4 text-orange-600" />}
                        </div>
                        <div>
                          <h3 className="font-semibold text-sm">{purchase.title}</h3>
                          <p className="text-sm text-gray-600">{purchase.venue} • {purchase.date}</p>
                        </div>
                      </div>
                      <div className="font-semibold">${purchase.amount}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Entertainment Benefits */}
        <Card>
          <CardHeader>
            <CardTitle>Entertainment Benefits with Monay</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                  <CreditCard className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="font-semibold">Instant Booking</h3>
                <p className="text-sm text-gray-600">
                  Skip payment hassles with one-click ticket purchases
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <Trophy className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold">Exclusive Access</h3>
                <p className="text-sm text-gray-600">
                  Early access to tickets and member-only events
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold">Group Discounts</h3>
                <p className="text-sm text-gray-600">
                  Special pricing for group bookings and family plans
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                  <Star className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold">Rewards Program</h3>
                <p className="text-sm text-gray-600">
                  Earn points on every entertainment purchase
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