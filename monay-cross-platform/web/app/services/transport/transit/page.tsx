'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Train,
  Bus,
  MapPin,
  Clock,
  CreditCard,
  Calendar,
  Route,
  Ticket,
  Star,
  Zap
} from 'lucide-react';

export default function TransitPage() {
  const [selectedCity, setSelectedCity] = useState('san-francisco');
  const [selectedPass, setSelectedPass] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const cities = [
    { id: 'san-francisco', name: 'San Francisco', state: 'CA' },
    { id: 'new-york', name: 'New York City', state: 'NY' },
    { id: 'chicago', name: 'Chicago', state: 'IL' },
    { id: 'washington', name: 'Washington D.C.', state: 'DC' },
    { id: 'boston', name: 'Boston', state: 'MA' },
    { id: 'seattle', name: 'Seattle', state: 'WA' }
  ];

  const transitPasses = {
    'san-francisco': [
      {
        id: 1,
        type: 'Single Ride',
        agency: 'MUNI',
        price: 3.00,
        validity: '90 minutes',
        description: 'One-way trip on bus, metro, or cable car',
        features: ['Bus', 'Metro', 'Cable Car', 'Transfers included']
      },
      {
        id: 2,
        type: 'Day Pass',
        agency: 'MUNI',
        price: 13.00,
        validity: '24 hours',
        description: 'Unlimited rides for one day',
        features: ['Bus', 'Metro', 'Cable Car', 'Unlimited transfers']
      },
      {
        id: 3,
        type: 'Monthly Pass',
        agency: 'MUNI',
        price: 98.00,
        validity: '31 days',
        description: 'Unlimited rides for one month',
        features: ['Bus', 'Metro', 'Cable Car', 'Best value', 'Auto-reload available']
      },
      {
        id: 4,
        type: 'BART Ticket',
        agency: 'BART',
        price: 8.50,
        validity: 'Per trip',
        description: 'Regional rail service',
        features: ['Regional rail', 'Airport connection', 'Zone-based pricing']
      }
    ],
    'new-york': [
      {
        id: 5,
        type: 'Single Ride',
        agency: 'MTA',
        price: 2.90,
        validity: '2 hours',
        description: 'One subway or bus ride',
        features: ['Subway', 'Bus', 'Free transfers']
      },
      {
        id: 6,
        type: '7-Day Pass',
        agency: 'MTA',
        price: 33.00,
        validity: '7 days',
        description: 'Unlimited rides for one week',
        features: ['Subway', 'Bus', 'Express trains', 'Unlimited rides']
      },
      {
        id: 7,
        type: 'Monthly Pass',
        agency: 'MTA',
        price: 132.00,
        validity: '30 days',
        description: 'Unlimited rides for one month',
        features: ['Subway', 'Bus', 'Express trains', 'Best value']
      }
    ]
  };

  const recentPasses = [
    {
      type: 'MUNI Day Pass',
      purchaseDate: '2024-01-15',
      amount: '$13.00',
      status: 'Active',
      expiresAt: '2024-01-16 11:30 AM'
    },
    {
      type: 'BART Ticket',
      purchaseDate: '2024-01-14',
      amount: '$8.50',
      status: 'Used',
      expiresAt: 'Single use'
    },
    {
      type: 'MUNI Monthly Pass',
      purchaseDate: '2024-01-01',
      amount: '$98.00',
      status: 'Active',
      expiresAt: '2024-01-31'
    }
  ];

  const currentPasses = transitPasses[selectedCity as keyof typeof transitPasses] || [];

  const handlePurchasePass = async (passId: number) => {
    setIsLoading(true);
    setSelectedPass(passId);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsLoading(false);
    setSelectedPass(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900 flex items-center justify-center gap-3">
            <Train className="h-8 w-8 text-blue-600" />
            Public Transit Passes
          </h1>
          <p className="text-lg text-gray-600">
            Buy passes for buses, trains, and metro systems nationwide
          </p>
        </div>

        {/* City Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Your City</CardTitle>
            <CardDescription>Choose your location to see available transit passes</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {cities.map((city) => (
                  <SelectItem key={city.id} value={city.id}>
                    {city.name}, {city.state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Available Passes */}
        <Card>
          <CardHeader>
            <CardTitle>Available Transit Passes</CardTitle>
            <CardDescription>
              Transit options for {cities.find(c => c.id === selectedCity)?.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentPasses.map((pass: any) => (
                <Card key={pass.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {pass.agency === 'MUNI' && <Bus className="h-5 w-5 text-blue-600" />}
                        {pass.agency === 'BART' && <Train className="h-5 w-5 text-green-600" />}
                        {pass.agency === 'MTA' && <Train className="h-5 w-5 text-purple-600" />}
                        <Badge variant="outline">{pass.agency}</Badge>
                      </div>
                      {pass.features.includes('Best value') && (
                        <Badge className="bg-green-500">Best Value</Badge>
                      )}
                    </div>
                    <CardTitle className="text-xl">{pass.type}</CardTitle>
                    <div className="text-2xl font-bold text-blue-600">${pass.price}</div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600">{pass.description}</p>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span>Valid for {pass.validity}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium">Includes:</p>
                      <div className="flex flex-wrap gap-1">
                        {pass.features.map((feature: string, index: number) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <Button
                      onClick={() => handlePurchasePass(pass.id)}
                      disabled={isLoading && selectedPass === pass.id}
                      className="w-full"
                    >
                      {isLoading && selectedPass === pass.id ? (
                        <Clock className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <CreditCard className="h-4 w-4 mr-2" />
                      )}
                      Purchase Pass
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Active Passes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ticket className="h-5 w-5" />
              Your Active Passes
            </CardTitle>
            <CardDescription>Current and recent transit passes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPasses.map((pass, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-100">
                      <Ticket className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{pass.type}</h3>
                      <p className="text-sm text-gray-600">
                        Purchased {pass.purchaseDate} • Expires {pass.expiresAt}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{pass.amount}</p>
                    <Badge variant={pass.status === 'Active' ? 'default' : 'secondary'}>
                      {pass.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Transit Tips */}
        <Card>
          <CardHeader>
            <CardTitle>Transit Tips & Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    Route Planning
                  </h3>
                  <p className="text-sm text-gray-600">
                    Use transit apps to plan your route and check real-time schedules
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Clock className="h-5 w-5 text-green-600" />
                    Peak Hours
                  </h3>
                  <p className="text-sm text-gray-600">
                    Avoid rush hours (7-9 AM, 5-7 PM) for faster and more comfortable trips
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-purple-600" />
                    Mobile Passes
                  </h3>
                  <p className="text-sm text-gray-600">
                    Digital passes are stored in your Monay wallet for easy access
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Route className="h-5 w-5 text-orange-600" />
                    Transfer Benefits
                  </h3>
                  <p className="text-sm text-gray-600">
                    Many passes include free transfers between different transit systems
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Benefits */}
        <Card>
          <CardHeader>
            <CardTitle>Why Buy Transit Passes with Monay?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <Zap className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold">Instant Access</h3>
                <p className="text-sm text-gray-600">
                  Digital passes available immediately after purchase
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CreditCard className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold">One Wallet</h3>
                <p className="text-sm text-gray-600">
                  Store all your transit passes in one secure location
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                  <Star className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold">Auto-Reload</h3>
                <p className="text-sm text-gray-600">
                  Set up automatic renewal for monthly passes
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}