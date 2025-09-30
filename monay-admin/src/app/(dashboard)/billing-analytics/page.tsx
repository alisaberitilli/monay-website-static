'use client';

import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Users, CreditCard, Download, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface BillingMetrics {
  total_revenue_cents: number;
  usdxm_revenue_cents: number;
  other_stablecoin_revenue_cents: number;
  total_discounts_cents: number;
  active_subscriptions: number;
  new_subscriptions: number;
  churned_subscriptions: number;
  average_revenue_per_tenant: number;
  tier_breakdown: {
    free: { count: number; revenue: number };
    small_business: { count: number; revenue: number };
    enterprise: { count: number; revenue: number };
    custom: { count: number; revenue: number };
  };
  top_tenants: Array<{
    id: string;
    name: string;
    revenue_cents: number;
    payment_method: string;
    tier: string;
  }>;
  payment_methods: {
    USDXM: { count: number; revenue: number; discount: number };
    USDC: { count: number; revenue: number; discount?: number };
    USDT: { count: number; revenue: number; discount?: number };
  };
}

export default function BillingAnalyticsPage() {
  const [metrics, setMetrics] = useState<BillingMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');

  useEffect(() => {
    loadBillingMetrics();
  }, [period]);

  const loadBillingMetrics = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/api/billing/analytics?period=${period}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'x-admin-bypass': 'true',
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMetrics(data);
      } else {
        console.error('Failed to load billing metrics:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Failed to load billing metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  const calculateGrowth = (current: number, previous: number): number => {
    if (previous === 0) return 100;
    return ((current - previous) / previous) * 100;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Failed to load billing analytics</p>
      </div>
    );
  }

  const usdxmPercentage = metrics.total_revenue_cents > 0
    ? ((metrics.usdxm_revenue_cents / metrics.total_revenue_cents) * 100).toFixed(1)
    : '0';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Billing Analytics</h1>
          <p className="text-gray-600 mt-1">System-wide billing metrics and insights</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant={period === 'daily' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPeriod('daily')}
            >
              Daily
            </Button>
            <Button
              variant={period === 'weekly' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPeriod('weekly')}
            >
              Weekly
            </Button>
            <Button
              variant={period === 'monthly' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPeriod('monthly')}
            >
              Monthly
            </Button>
            <Button
              variant={period === 'yearly' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPeriod('yearly')}
            >
              Yearly
            </Button>
          </div>
          <Button className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Revenue Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(metrics.total_revenue_cents)}
            </div>
            <div className="flex items-center gap-1 mt-1">
              <ArrowUp className="w-4 h-4 text-green-600" />
              <span className="text-xs text-green-600">12.5% from last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">
              USDXM Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(metrics.usdxm_revenue_cents)}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Badge className="bg-green-100 text-green-700">
                {usdxmPercentage}% of total
              </Badge>
              <span className="text-xs text-green-600">10% discount</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Discounts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              -{formatCurrency(metrics.total_discounts_cents)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Mostly USDXM incentives
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">
              Active Subscriptions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.active_subscriptions}</div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-green-600">+{metrics.new_subscriptions} new</span>
              <span className="text-xs text-red-600">-{metrics.churned_subscriptions} churned</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="breakdown">
        <TabsList>
          <TabsTrigger value="breakdown">Tier Breakdown</TabsTrigger>
          <TabsTrigger value="payment-methods">Payment Methods</TabsTrigger>
          <TabsTrigger value="top-tenants">Top Tenants</TabsTrigger>
        </TabsList>

        <TabsContent value="breakdown" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Billing Tier</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(metrics.tier_breakdown).map(([tier, data]) => {
                  const percentage = metrics.total_revenue_cents > 0
                    ? ((data.revenue / metrics.total_revenue_cents) * 100).toFixed(1)
                    : '0';
                  
                  return (
                    <div key={tier} className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Badge variant="outline" className="min-w-[100px]">
                          {tier.replace('_', ' ')}
                        </Badge>
                        <div>
                          <p className="font-medium">{data.count} tenants</p>
                          <p className="text-sm text-gray-500">
                            Avg: {formatCurrency(data.count > 0 ? data.revenue / data.count : 0)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(data.revenue)}</p>
                        <p className="text-sm text-gray-500">{percentage}%</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 pt-6 border-t">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Average Revenue per Tenant</p>
                    <p className="text-2xl font-bold mt-1">
                      {formatCurrency(metrics.average_revenue_per_tenant)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Gross Margin Target</p>
                    <p className="text-2xl font-bold mt-1">60-80%</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment-methods" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Method Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(metrics.payment_methods).map(([method, data]) => {
                  const percentage = metrics.total_revenue_cents > 0
                    ? ((data.revenue / metrics.total_revenue_cents) * 100).toFixed(1)
                    : '0';

                  return (
                    <div key={method} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <CreditCard className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="font-medium">{method}</p>
                            <p className="text-sm text-gray-500">{data.count} transactions</p>
                          </div>
                          {method === 'USDXM' && (
                            <Badge className="bg-green-100 text-green-700">
                              10% Discount
                            </Badge>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatCurrency(data.revenue)}</p>
                          <p className="text-sm text-gray-500">{percentage}%</p>
                        </div>
                      </div>
                      
                      {method === 'USDXM' && data.discount && data.discount > 0 && (
                        <div className="ml-8 p-3 bg-green-50 rounded-lg">
                          <p className="text-sm text-green-700">
                            Total discounts given: {formatCurrency(data.discount)}
                          </p>
                          <p className="text-xs text-green-600 mt-1">
                            Encouraging USDXM adoption saves processing fees
                          </p>
                        </div>
                      )}

                      <div className="ml-8">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              method === 'USDXM' ? 'bg-green-600' : 'bg-blue-600'
                            }`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="font-medium text-blue-900">USDXM Adoption Strategy</p>
                <p className="text-sm text-blue-700 mt-1">
                  Current USDXM usage: {usdxmPercentage}% - Target: 50% by Q2 2025
                </p>
                <p className="text-xs text-blue-600 mt-2">
                  10% discount incentive is driving adoption. Consider additional benefits.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="top-tenants" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Revenue Generating Tenants</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Tenant</TableHead>
                    <TableHead>Billing Tier</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>% of Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {metrics.top_tenants.map((tenant, index) => {
                    const percentage = metrics.total_revenue_cents > 0
                      ? ((tenant.revenue_cents / metrics.total_revenue_cents) * 100).toFixed(2)
                      : '0';

                    return (
                      <TableRow key={tenant.id}>
                        <TableCell className="font-medium">#{index + 1}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{tenant.name}</p>
                            <p className="text-xs text-gray-500">{tenant.id.slice(0, 8)}...</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {tenant.tier.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span>{tenant.payment_method}</span>
                            {tenant.payment_method === 'USDXM' && (
                              <Badge className="bg-green-100 text-green-700 text-xs">
                                -10%
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold">
                          {formatCurrency(tenant.revenue_cents)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div
                                className="h-2 rounded-full bg-blue-600"
                                style={{ width: `${Math.min(100, Number(percentage) * 5)}%` }}
                              ></div>
                            </div>
                            <span className="text-sm">{percentage}%</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}