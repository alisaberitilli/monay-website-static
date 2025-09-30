'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Building,
  Plus,
  Search,
  Filter,
  Download,
  Shield,
  DollarSign,
  TrendingUp,
  Activity,
  Settings,
  Eye,
  Users,
  Wallet,
  Key,
  CheckCircle,
  AlertCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  PieChart
} from 'lucide-react';

interface EnterpriseWallet {
  id: string;
  companyName: string;
  walletName: string;
  address: string;
  network: string;
  balance: {
    total: number;
    tokens: Array<{
      symbol: string;
      balance: number;
      usdValue: number;
    }>;
  };
  status: 'active' | 'restricted' | 'frozen' | 'pending';
  tier: 'starter' | 'professional' | 'enterprise' | 'custom';
  employees: number;
  monthlyVolume: number;
  compliance: {
    kycStatus: 'verified' | 'pending' | 'rejected';
    amlRisk: 'low' | 'medium' | 'high';
    lastReview: Date;
  };
  features: string[];
  created: Date;
  lastActivity: Date;
}

export default function EnterpriseWalletsPage() {
  const [wallets, setWallets] = useState<EnterpriseWallet[]>([
    {
      id: 'ent-001',
      companyName: 'TechCorp Inc.',
      walletName: 'TechCorp Treasury',
      address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1',
      network: 'Base L2',
      balance: {
        total: 5250000,
        tokens: [
          { symbol: 'USDC', balance: 3000000, usdValue: 3000000 },
          { symbol: 'USDT', balance: 1500000, usdValue: 1500000 },
          { symbol: 'USDXM', balance: 750000, usdValue: 750000 }
        ]
      },
      status: 'active',
      tier: 'enterprise',
      employees: 250,
      monthlyVolume: 15000000,
      compliance: {
        kycStatus: 'verified',
        amlRisk: 'low',
        lastReview: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15)
      },
      features: ['multi-sig', 'auto-sweep', 'compliance-controls', 'api-access'],
      created: new Date(Date.now() - 1000 * 60 * 60 * 24 * 180),
      lastActivity: new Date(Date.now() - 1000 * 60 * 30)
    },
    {
      id: 'ent-002',
      companyName: 'Global Finance LLC',
      walletName: 'Global Operations',
      address: '0x8Ba1f109551bD432803012645Ac136ddd64DBA22',
      network: 'Base L2',
      balance: {
        total: 3800000,
        tokens: [
          { symbol: 'USDC', balance: 2300000, usdValue: 2300000 },
          { symbol: 'USDT', balance: 1500000, usdValue: 1500000 }
        ]
      },
      status: 'active',
      tier: 'professional',
      employees: 120,
      monthlyVolume: 8500000,
      compliance: {
        kycStatus: 'verified',
        amlRisk: 'low',
        lastReview: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10)
      },
      features: ['multi-sig', 'compliance-controls'],
      created: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90),
      lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 2)
    },
    {
      id: 'ent-003',
      companyName: 'StartupHub',
      walletName: 'Startup Operations',
      address: '0x3f5CE5FBFe3E9af3971dD833D26BA9b5C936f0bE',
      network: 'Polygon zkEVM',
      balance: {
        total: 850000,
        tokens: [
          { symbol: 'USDC', balance: 500000, usdValue: 500000 },
          { symbol: 'USDXM', balance: 350000, usdValue: 350000 }
        ]
      },
      status: 'restricted',
      tier: 'starter',
      employees: 25,
      monthlyVolume: 1200000,
      compliance: {
        kycStatus: 'pending',
        amlRisk: 'medium',
        lastReview: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30)
      },
      features: ['basic-transfers'],
      created: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45),
      lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 6)
    },
    {
      id: 'ent-004',
      companyName: 'Enterprise Solutions',
      walletName: 'ES Treasury',
      address: '0x9f4A8C8EbC7D5F1a3B2E6D4C8A7B5E9F2C1A8D6E',
      network: 'Base L2',
      balance: {
        total: 2100000,
        tokens: [
          { symbol: 'USDC', balance: 1200000, usdValue: 1200000 },
          { symbol: 'USDT', balance: 900000, usdValue: 900000 }
        ]
      },
      status: 'active',
      tier: 'custom',
      employees: 180,
      monthlyVolume: 6800000,
      compliance: {
        kycStatus: 'verified',
        amlRisk: 'low',
        lastReview: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5)
      },
      features: ['multi-sig', 'auto-sweep', 'compliance-controls', 'api-access', 'custom-rules'],
      created: new Date(Date.now() - 1000 * 60 * 60 * 24 * 120),
      lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 1)
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [tierFilter, setTierFilter] = useState('all');

  const filteredWallets = wallets.filter(wallet => {
    const matchesSearch = wallet.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          wallet.walletName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || wallet.status === statusFilter;
    const matchesTier = tierFilter === 'all' || wallet.tier === tierFilter;
    return matchesSearch && matchesStatus && matchesTier;
  });

  const totalBalance = wallets.reduce((sum, w) => sum + w.balance.total, 0);
  const totalVolume = wallets.reduce((sum, w) => sum + w.monthlyVolume, 0);
  const activeWallets = wallets.filter(w => w.status === 'active').length;
  const complianceRate = Math.round((wallets.filter(w => w.compliance.kycStatus === 'verified').length / wallets.length) * 100);

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
      starter: 'bg-gray-100 text-gray-700',
      professional: 'bg-blue-100 text-blue-700',
      enterprise: 'bg-purple-100 text-purple-700',
      custom: 'bg-orange-100 text-orange-700'
    };
    return <Badge className={colors[tier as keyof typeof colors] || 'bg-gray-100 text-gray-700'}>
      {tier.charAt(0).toUpperCase() + tier.slice(1)}
    </Badge>;
  };

  const getComplianceIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'rejected':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-orange-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Enterprise Wallets</h1>
          <p className="text-gray-600 mt-1">Manage enterprise client wallets and compliance</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button
            size="sm"
            className="bg-orange-400 hover:bg-orange-500 text-white border-orange-400 hover:border-orange-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            Onboard Enterprise
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total AUM
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalBalance)}
            </div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-xs text-green-600">+12.5% from last quarter</span>
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
              Across all enterprise clients
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">
              Active Clients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeWallets}</div>
            <div className="text-xs text-gray-500 mt-1">
              of {wallets.length} total enterprise clients
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">
              Compliance Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{complianceRate}%</div>
            <div className="flex items-center gap-1 mt-1">
              <Shield className="w-4 h-4 text-green-600" />
              <span className="text-xs text-green-600">KYC verified</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search companies or wallets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="restricted">Restricted</SelectItem>
                <SelectItem value="frozen">Frozen</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
            <Select value={tierFilter} onValueChange={setTierFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tiers</SelectItem>
                <SelectItem value="starter">Starter</SelectItem>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Client Overview</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="onboarding">Onboarding</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Enterprise Clients</CardTitle>
              <CardDescription>
                {filteredWallets.length} enterprise wallets found
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredWallets.map((wallet) => (
                  <div key={wallet.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Building className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <div className="font-semibold">{wallet.companyName}</div>
                        <div className="text-sm text-gray-500">{wallet.walletName}</div>
                        <div className="text-xs text-gray-400 font-mono">
                          {wallet.address.slice(0, 8)}...{wallet.address.slice(-6)} • {wallet.network}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatCurrency(wallet.balance.total)}</div>
                      <div className="text-sm text-gray-500">
                        {wallet.balance.tokens.length} tokens
                      </div>
                      <div className="text-xs text-gray-400">
                        {wallet.employees} employees
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
                        {getComplianceIcon(wallet.compliance.kycStatus)}
                        <span className="text-sm">{wallet.compliance.kycStatus}</span>
                      </div>
                      <div className={`text-xs ${getRiskColor(wallet.compliance.amlRisk)}`}>
                        {wallet.compliance.amlRisk} risk
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

        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Overview</CardTitle>
              <CardDescription>KYC status and risk assessment for enterprise clients</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {wallets.filter(w => w.compliance.kycStatus === 'verified').length}
                      </div>
                      <div className="text-sm text-gray-500">Verified</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">
                        {wallets.filter(w => w.compliance.kycStatus === 'pending').length}
                      </div>
                      <div className="text-sm text-gray-500">Pending</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {wallets.filter(w => w.compliance.kycStatus === 'rejected').length}
                      </div>
                      <div className="text-sm text-gray-500">Rejected</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="space-y-3">
                {wallets.filter(w => w.compliance.kycStatus !== 'verified').map((wallet) => (
                  <div key={wallet.id} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                        <Building className="w-4 h-4 text-orange-600" />
                      </div>
                      <div>
                        <div className="font-medium">{wallet.companyName}</div>
                        <div className="text-sm text-gray-500">
                          Last review: {formatTimeAgo(wallet.compliance.lastReview)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getComplianceIcon(wallet.compliance.kycStatus)}
                      <span className="text-sm">{wallet.compliance.kycStatus}</span>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Client Distribution by Tier</CardTitle>
                <CardDescription>Enterprise wallet tier breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-64">
                  <PieChart className="w-32 h-32 text-gray-400" />
                  <span className="ml-4 text-gray-500">Chart coming soon</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Monthly Volume Trends</CardTitle>
                <CardDescription>Enterprise transaction volume over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-64">
                  <BarChart3 className="w-32 h-32 text-gray-400" />
                  <span className="ml-4 text-gray-500">Chart coming soon</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="onboarding" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Enterprise Onboarding</CardTitle>
              <CardDescription>Streamlined onboarding process for enterprise clients</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Enterprise Onboarding Dashboard</h3>
                <p className="text-gray-600 mb-4">
                  Manage the onboarding process for new enterprise clients
                </p>
                <Button
                  className="bg-orange-400 hover:bg-orange-500 text-white border-orange-400 hover:border-orange-500"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Start New Onboarding
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}