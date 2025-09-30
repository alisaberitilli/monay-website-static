'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Smartphone,
  Users,
  Search,
  Download,
  TrendingUp,
  DollarSign,
  Activity,
  CreditCard,
  Zap,
  Plus,
  Eye,
  Settings,
  CheckCircle,
  AlertCircle,
  Shield
} from 'lucide-react';

interface ConsumerWallet {
  id: string;
  userName: string;
  email: string;
  phoneNumber: string;
  balance: {
    total: number;
    tokens: Array<{
      symbol: string;
      balance: number;
      usdValue: number;
    }>;
  };
  status: 'active' | 'restricted' | 'frozen' | 'pending';
  tier: 'basic' | 'verified' | 'premium';
  kyc: {
    status: 'verified' | 'pending' | 'rejected' | 'not_started';
    completedSteps: number;
    totalSteps: number;
  };
  monthlyVolume: number;
  transactionCount: number;
  cardStatus: 'active' | 'inactive' | 'blocked';
  lastActivity: Date;
  registrationDate: Date;
}

export default function ConsumerWalletsPage() {
  const [wallets, setWallets] = useState<ConsumerWallet[]>([
    {
      id: 'cons-001',
      userName: 'John Smith',
      email: 'john.smith@email.com',
      phoneNumber: '+1 (555) 123-4567',
      balance: {
        total: 2850,
        tokens: [
          { symbol: 'USDC', balance: 2000, usdValue: 2000 },
          { symbol: 'SOL', balance: 5.5, usdValue: 850 }
        ]
      },
      status: 'active',
      tier: 'verified',
      kyc: {
        status: 'verified',
        completedSteps: 4,
        totalSteps: 4
      },
      monthlyVolume: 8500,
      transactionCount: 45,
      cardStatus: 'active',
      lastActivity: new Date(Date.now() - 1000 * 60 * 30),
      registrationDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90)
    },
    {
      id: 'cons-002',
      userName: 'Sarah Johnson',
      email: 'sarah.j@email.com',
      phoneNumber: '+1 (555) 987-6543',
      balance: {
        total: 1200,
        tokens: [
          { symbol: 'USDC', balance: 1200, usdValue: 1200 }
        ]
      },
      status: 'active',
      tier: 'premium',
      kyc: {
        status: 'verified',
        completedSteps: 4,
        totalSteps: 4
      },
      monthlyVolume: 15600,
      transactionCount: 78,
      cardStatus: 'active',
      lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 2),
      registrationDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45)
    },
    {
      id: 'cons-003',
      userName: 'Mike Davis',
      email: 'mike.davis@email.com',
      phoneNumber: '+1 (555) 456-7890',
      balance: {
        total: 450,
        tokens: [
          { symbol: 'USDC', balance: 450, usdValue: 450 }
        ]
      },
      status: 'restricted',
      tier: 'basic',
      kyc: {
        status: 'pending',
        completedSteps: 2,
        totalSteps: 4
      },
      monthlyVolume: 1200,
      transactionCount: 12,
      cardStatus: 'inactive',
      lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 6),
      registrationDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15)
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');

  const filteredWallets = wallets.filter(wallet =>
    wallet.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    wallet.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalBalance = wallets.reduce((sum, w) => sum + w.balance.total, 0);
  const totalVolume = wallets.reduce((sum, w) => sum + w.monthlyVolume, 0);
  const activeUsers = wallets.filter(w => w.status === 'active').length;
  const verifiedUsers = wallets.filter(w => w.kyc.status === 'verified').length;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-700">Active</Badge>;
      case 'restricted':
        return <Badge className="bg-orange-100 text-orange-700">Restricted</Badge>;
      case 'frozen':
        return <Badge className="bg-red-100 text-red-700">Frozen</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getTierBadge = (tier: string) => {
    const colors = {
      basic: 'bg-gray-100 text-gray-700',
      verified: 'bg-blue-100 text-blue-700',
      premium: 'bg-purple-100 text-purple-700'
    };
    return <Badge className={colors[tier as keyof typeof colors] || 'bg-gray-100 text-gray-700'}>
      {tier.charAt(0).toUpperCase() + tier.slice(1)}
    </Badge>;
  };

  const getKycIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'rejected':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Consumer Wallets</h1>
          <p className="text-gray-600 mt-1">Monitor and manage consumer wallet users</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Users
          </Button>
          <Button
            size="sm"
            className="bg-orange-400 hover:bg-orange-500 text-white border-orange-400 hover:border-orange-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            Invite User
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total User Balances
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalBalance)}
            </div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-xs text-green-600">+18.2% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">
              Monthly Volume
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalVolume)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Consumer transactions
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">
              Active Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeUsers}</div>
            <div className="text-xs text-gray-500 mt-1">
              of {wallets.length} total users
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">
              KYC Verified
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round((verifiedUsers / wallets.length) * 100)}%
            </div>
            <div className="flex items-center gap-1 mt-1">
              <Shield className="w-4 h-4 text-green-600" />
              <span className="text-xs text-green-600">{verifiedUsers} verified</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search users by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="kyc">KYC Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="support">Support</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Consumer Users</CardTitle>
              <CardDescription>
                {filteredWallets.length} users found
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredWallets.map((wallet) => (
                  <div key={wallet.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Smartphone className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-semibold">{wallet.userName}</div>
                        <div className="text-sm text-gray-500">{wallet.email}</div>
                        <div className="text-xs text-gray-400">{wallet.phoneNumber}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatCurrency(wallet.balance.total)}</div>
                      <div className="text-sm text-gray-500">
                        {wallet.balance.tokens.length} assets
                      </div>
                      <div className="text-xs text-gray-400">
                        {wallet.transactionCount} transactions
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-600">
                        {formatCurrency(wallet.monthlyVolume)}
                      </div>
                      <div className="text-xs text-gray-500">monthly volume</div>
                    </div>
                    <div className="flex flex-col gap-1">
                      {getStatusBadge(wallet.status)}
                      {getTierBadge(wallet.tier)}
                    </div>
                    <div className="text-center">
                      <div className="flex items-center gap-1">
                        {getKycIcon(wallet.kyc.status)}
                        <span className="text-sm">{wallet.kyc.status}</span>
                      </div>
                      <div className="text-xs text-gray-400">
                        {wallet.kyc.completedSteps}/{wallet.kyc.totalSteps} steps
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatTimeAgo(wallet.lastActivity)}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-orange-300 text-orange-600 hover:bg-orange-50 hover:text-orange-700"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        className="bg-orange-400 hover:bg-orange-500 text-white border-orange-400 hover:border-orange-500"
                      >
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="kyc" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>KYC Status Overview</CardTitle>
              <CardDescription>Identity verification status for consumer users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {wallets.filter(w => w.kyc.status === 'verified').length}
                    </div>
                    <div className="text-sm text-gray-500">Verified</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {wallets.filter(w => w.kyc.status === 'pending').length}
                    </div>
                    <div className="text-sm text-gray-500">Pending</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {wallets.filter(w => w.kyc.status === 'rejected').length}
                    </div>
                    <div className="text-sm text-gray-500">Rejected</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-gray-600">
                      {wallets.filter(w => w.kyc.status === 'not_started').length}
                    </div>
                    <div className="text-sm text-gray-500">Not Started</div>
                  </CardContent>
                </Card>
              </div>
              <div className="space-y-3">
                {wallets.filter(w => w.kyc.status !== 'verified').map((wallet) => (
                  <div key={wallet.id} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Smartphone className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium">{wallet.userName}</div>
                        <div className="text-sm text-gray-500">{wallet.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getKycIcon(wallet.kyc.status)}
                      <span className="text-sm">{wallet.kyc.status}</span>
                      <span className="text-xs text-gray-400">
                        {wallet.kyc.completedSteps}/{wallet.kyc.totalSteps}
                      </span>
                      <Button
                        size="sm"
                        className="ml-2 bg-orange-400 hover:bg-orange-500 text-white border-orange-400 hover:border-orange-500"
                      >
                        Review
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Consumer Analytics</CardTitle>
              <CardDescription>User behavior and platform metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Analytics Dashboard</h3>
                <p className="text-gray-600">
                  Detailed consumer analytics and insights coming soon
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="support" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Support</CardTitle>
              <CardDescription>Consumer support and account management tools</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Support Tools</h3>
                <p className="text-gray-600">
                  Customer support dashboard and tools coming soon
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}