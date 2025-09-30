'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Activity,
  DollarSign,
  RefreshCcw,
  Download,
  PieChart,
  Calendar
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart as RechartsPieChart,
  Cell,
  Pie
} from 'recharts';

export default function TokenAnalyticsPage() {
  const router = useRouter();
  const params = useParams();
  const tokenId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<any>(null);

  // Mock analytics data
  const volumeData = [
    { day: 'Mon', volume: 45000 },
    { day: 'Tue', volume: 52000 },
    { day: 'Wed', volume: 48000 },
    { day: 'Thu', volume: 61000 },
    { day: 'Fri', volume: 55000 },
    { day: 'Sat', volume: 42000 },
    { day: 'Sun', volume: 47000 }
  ];

  const priceData = [
    { time: '00:00', price: 1.00 },
    { time: '04:00', price: 1.02 },
    { time: '08:00', price: 0.98 },
    { time: '12:00', price: 1.01 },
    { time: '16:00', price: 1.03 },
    { time: '20:00', price: 1.00 },
    { time: '24:00', price: 1.01 }
  ];

  const holdersData = [
    { name: 'Retail', value: 45, count: 567 },
    { name: 'Institutional', value: 35, count: 89 },
    { name: 'Whales', value: 15, count: 12 },
    { name: 'Others', value: 5, count: 234 }
  ];

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  useEffect(() => {
    // Mock token data based on ID
    const mockToken = {
      id: tokenId,
      name: 'Enterprise Token',
      symbol: 'ENT',
      status: 'active',
      price: 1.01,
      marketCap: 15000000,
      volume24h: 350000,
      holders: 902,
      totalSupply: '1,000,000',
      chain: 'Base L2'
    };

    setToken(mockToken);
    setLoading(false);
  }, [tokenId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        <Card>
          <CardContent className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Token Not Found</h3>
            <p className="text-gray-600">The token you're looking for doesn't exist.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{token.name} Analytics</h1>
            <p className="text-gray-600">{token.symbol} • Token ID: {token.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
          <Button
            size="sm"
            className="bg-orange-400 hover:bg-orange-500 text-white border-orange-400 hover:border-orange-500"
          >
            <RefreshCcw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Current Price</p>
                <p className="text-2xl font-bold">{formatCurrency(token.price)}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-xs text-green-600">+2.1% (24h)</span>
                </div>
              </div>
              <DollarSign className="h-8 w-8 text-blue-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Market Cap</p>
                <p className="text-2xl font-bold">{formatCurrency(token.marketCap)}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-xs text-green-600">+5.8%</span>
                </div>
              </div>
              <BarChart3 className="h-8 w-8 text-green-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">24h Volume</p>
                <p className="text-2xl font-bold">{formatCurrency(token.volume24h)}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingDown className="w-4 h-4 text-red-600" />
                  <span className="text-xs text-red-600">-1.2%</span>
                </div>
              </div>
              <Activity className="h-8 w-8 text-orange-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Holders</p>
                <p className="text-2xl font-bold">{token.holders.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-xs text-green-600">+12 new</span>
                </div>
              </div>
              <Users className="h-8 w-8 text-purple-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="trading" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trading">Trading Activity</TabsTrigger>
          <TabsTrigger value="holders">Holder Analysis</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
        </TabsList>

        <TabsContent value="trading" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>7-Day Trading Volume</CardTitle>
                <CardDescription>Daily trading volume trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={volumeData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis tickFormatter={(value) => `$${(value / 1000)}K`} />
                      <Tooltip
                        formatter={(value: number) => [formatCurrency(value), 'Volume']}
                      />
                      <Bar dataKey="volume" fill="#F97316" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>24h Price Movement</CardTitle>
                <CardDescription>Hourly price changes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={priceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis
                        domain={['dataMin - 0.05', 'dataMax + 0.05']}
                        tickFormatter={(value) => `$${value.toFixed(2)}`}
                      />
                      <Tooltip
                        formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
                      />
                      <Line
                        type="monotone"
                        dataKey="price"
                        stroke="#3B82F6"
                        strokeWidth={2}
                        dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="holders" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Holder Distribution</CardTitle>
                <CardDescription>Token holders by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={holdersData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, value }) => `${name} ${value}%`}
                      >
                        {holdersData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number, name: string, props: any) => [
                          `${value}% (${props.payload.count} holders)`,
                          name
                        ]}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Holders</CardTitle>
                <CardDescription>Largest token holders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { address: '0x1234...5678', balance: '50,000', percentage: '5.0%' },
                    { address: '0xabcd...efgh', balance: '35,000', percentage: '3.5%' },
                    { address: '0x9876...5432', balance: '28,500', percentage: '2.85%' },
                    { address: '0xfed...cba9', balance: '22,100', percentage: '2.21%' },
                  ].map((holder, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <span className="font-mono text-sm">{holder.address}</span>
                        <p className="text-xs text-gray-500">#{index + 1} holder</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{holder.balance} {token.symbol}</p>
                        <p className="text-xs text-gray-500">{holder.percentage}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>All-time High:</span>
                  <span className="font-semibold">{formatCurrency(1.25)}</span>
                </div>
                <div className="flex justify-between">
                  <span>All-time Low:</span>
                  <span className="font-semibold">{formatCurrency(0.85)}</span>
                </div>
                <div className="flex justify-between">
                  <span>30D Change:</span>
                  <span className="font-semibold text-green-600">+18.7%</span>
                </div>
                <div className="flex justify-between">
                  <span>Volatility:</span>
                  <span className="font-semibold">Low (2.3%)</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Transaction Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Total Transactions:</span>
                  <span className="font-semibold">45,678</span>
                </div>
                <div className="flex justify-between">
                  <span>24h Transactions:</span>
                  <span className="font-semibold">234</span>
                </div>
                <div className="flex justify-between">
                  <span>Avg. Transaction:</span>
                  <span className="font-semibold">{formatCurrency(1495)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Success Rate:</span>
                  <span className="font-semibold text-green-600">99.8%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Supply Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Total Supply:</span>
                  <span className="font-semibold">{token.totalSupply}</span>
                </div>
                <div className="flex justify-between">
                  <span>Circulating Supply:</span>
                  <span className="font-semibold">850,000</span>
                </div>
                <div className="flex justify-between">
                  <span>Locked Tokens:</span>
                  <span className="font-semibold">150,000</span>
                </div>
                <div className="flex justify-between">
                  <span>Burned Tokens:</span>
                  <span className="font-semibold">0</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Token Distribution</CardTitle>
              <CardDescription>How tokens are allocated across different categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { category: 'Public Sale', amount: '400,000', percentage: '40%', color: 'bg-blue-500' },
                  { category: 'Team & Advisors', amount: '200,000', percentage: '20%', color: 'bg-green-500' },
                  { category: 'Treasury', amount: '200,000', percentage: '20%', color: 'bg-yellow-500' },
                  { category: 'Ecosystem Fund', amount: '150,000', percentage: '15%', color: 'bg-purple-500' },
                  { category: 'Liquidity', amount: '50,000', percentage: '5%', color: 'bg-red-500' },
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded ${item.color}`}></div>
                      <span className="font-medium">{item.category}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{item.amount} {token.symbol}</p>
                      <p className="text-sm text-gray-500">{item.percentage}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}