'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Route,
  MapPin,
  Clock,
  CreditCard,
  Car,
  Settings,
  Zap,
  Shield,
  Bell,
  Calendar
} from 'lucide-react';

export default function TollsPage() {
  const [selectedState, setSelectedState] = useState('california');
  const [autoPayEnabled, setAutoPayEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const tollRoads = {
    california: [
      {
        id: 1,
        name: 'Golden Gate Bridge',
        location: 'San Francisco, CA',
        rate: 8.75,
        type: 'Bridge',
        direction: 'Southbound only',
        paymentMethods: ['FasTrak', 'License Plate', 'Cash (limited)'],
        peakHours: '6 AM - 10 AM, 3 PM - 7 PM'
      },
      {
        id: 2,
        name: 'Bay Bridge',
        location: 'San Francisco - Oakland, CA',
        rate: 7.00,
        type: 'Bridge',
        direction: 'Westbound only',
        paymentMethods: ['FasTrak', 'License Plate'],
        peakHours: '5 AM - 10 AM, 3 PM - 7 PM'
      },
      {
        id: 3,
        name: 'I-405 Express Lanes',
        location: 'Los Angeles, CA',
        rate: 12.50,
        type: 'Express Lane',
        direction: 'Both directions',
        paymentMethods: ['FasTrak Flex'],
        peakHours: 'Dynamic pricing'
      },
      {
        id: 4,
        name: '91 Express Lanes',
        location: 'Orange County, CA',
        rate: 15.20,
        type: 'Express Lane',
        direction: 'Both directions',
        paymentMethods: ['FasTrak'],
        peakHours: 'Dynamic pricing'
      }
    ],
    'new-york': [
      {
        id: 5,
        name: 'George Washington Bridge',
        location: 'New York - New Jersey',
        rate: 16.00,
        type: 'Bridge',
        direction: 'Westbound only',
        paymentMethods: ['E-ZPass', 'Tolls by Mail'],
        peakHours: '6 AM - 10 AM, 4 PM - 8 PM'
      },
      {
        id: 6,
        name: 'Lincoln Tunnel',
        location: 'New York - New Jersey',
        rate: 16.00,
        type: 'Tunnel',
        direction: 'Both directions',
        paymentMethods: ['E-ZPass', 'Tolls by Mail'],
        peakHours: '6 AM - 10 AM, 4 PM - 8 PM'
      }
    ]
  };

  const states = [
    { id: 'california', name: 'California' },
    { id: 'new-york', name: 'New York' },
    { id: 'texas', name: 'Texas' },
    { id: 'florida', name: 'Florida' },
    { id: 'illinois', name: 'Illinois' }
  ];

  const recentTolls = [
    {
      road: 'Golden Gate Bridge',
      amount: '$8.75',
      date: '2024-01-15 08:30 AM',
      method: 'FasTrak',
      status: 'Paid'
    },
    {
      road: 'Bay Bridge',
      amount: '$7.00',
      date: '2024-01-14 05:45 PM',
      method: 'License Plate',
      status: 'Paid'
    },
    {
      road: '91 Express Lanes',
      amount: '$12.30',
      date: '2024-01-13 07:15 AM',
      method: 'FasTrak',
      status: 'Paid'
    }
  ];

  const currentTolls = tollRoads[selectedState as keyof typeof tollRoads] || [];

  const handlePayToll = async (tollId: number) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
  };

  const handleSetupAutoPay = () => {
    setAutoPayEnabled(!autoPayEnabled);
  };

  return (
    <DashboardLayout>
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900 flex items-center justify-center gap-3">
            <Route className="h-8 w-8 text-purple-600" />
            Toll Payments
          </h1>
          <p className="text-lg text-gray-600">
            Pay highway tolls and bridge fees instantly with your Monay wallet
          </p>
        </div>

        {/* Quick Pay */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Toll Payment</CardTitle>
            <CardDescription>Pay a recent toll or upcoming charge</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">License Plate</label>
                <Input placeholder="ABC 1234" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Toll Road/Bridge</label>
                <Input placeholder="Enter toll road name" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Amount</label>
                <div className="flex gap-2">
                  <Input placeholder="$0.00" />
                  <Button disabled={isLoading}>
                    {isLoading ? <Clock className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Auto-Pay Setup */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Auto-Pay Settings</span>
              <Switch checked={autoPayEnabled} onCheckedChange={handleSetupAutoPay} />
            </CardTitle>
            <CardDescription>
              Automatically pay tolls to avoid late fees and violations
            </CardDescription>
          </CardHeader>
          <CardContent>
            {autoPayEnabled ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-green-600">
                  <Zap className="h-5 w-5" />
                  <span className="font-medium">Auto-Pay is enabled</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Default Payment Method</label>
                    <Select defaultValue="monay-wallet">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monay-wallet">Monay Wallet</SelectItem>
                        <SelectItem value="backup-card">Backup Card ****1234</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Notification Preference</label>
                    <Select defaultValue="email-sms">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email-sms">Email + SMS</SelectItem>
                        <SelectItem value="email">Email only</SelectItem>
                        <SelectItem value="sms">SMS only</SelectItem>
                        <SelectItem value="none">No notifications</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Enable Auto-Pay</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Never worry about toll violations again. We'll automatically pay your tolls.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* State Selection and Toll Roads */}
        <Card>
          <CardHeader>
            <CardTitle>Toll Roads by State</CardTitle>
            <CardDescription>Browse toll roads and current rates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select State</label>
              <Select value={selectedState} onValueChange={setSelectedState}>
                <SelectTrigger className="w-full md:w-64">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {states.map((state) => (
                    <SelectItem key={state.id} value={state.id}>
                      {state.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {currentTolls.map((toll: any) => (
                <Card key={toll.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Route className="h-5 w-5 text-purple-600" />
                        <Badge variant={toll.type === 'Bridge' ? 'default' : 'secondary'}>
                          {toll.type}
                        </Badge>
                      </div>
                      <div className="text-xl font-bold text-purple-600">${toll.rate}</div>
                    </div>
                    <CardTitle className="text-lg">{toll.name}</CardTitle>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{toll.location}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Direction:</span>
                        <span className="font-medium">{toll.direction}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Peak Hours:</span>
                        <span className="font-medium">{toll.peakHours}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium">Payment Methods:</p>
                      <div className="flex flex-wrap gap-1">
                        {toll.paymentMethods.map((method: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {method}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <Button onClick={() => handlePayToll(toll.id)} className="w-full">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Pay Now
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Toll Payments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recent Toll Payments
            </CardTitle>
            <CardDescription>Your toll payment history and receipts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTolls.map((toll, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-100">
                      <Route className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{toll.road}</h3>
                      <p className="text-sm text-gray-600">
                        {toll.date} • {toll.method}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{toll.amount}</p>
                    <Badge variant="default">{toll.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Benefits */}
        <Card>
          <CardHeader>
            <CardTitle>Why Pay Tolls with Monay?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                  <Zap className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold">Instant Payment</h3>
                <p className="text-sm text-gray-600">
                  Pay tolls immediately to avoid violations and late fees
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <Shield className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold">Auto-Pay Protection</h3>
                <p className="text-sm text-gray-600">
                  Never miss a toll payment with automatic processing
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <Car className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold">Multi-Vehicle Support</h3>
                <p className="text-sm text-gray-600">
                  Manage toll payments for multiple vehicles in one account
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