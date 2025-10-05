'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  Copy,
  Check,
  Wallet,
  Send,
  Download,
  Settings,
  Shield,
  TrendingUp,
  Clock,
  Users,
  FileText,
  AlertCircle,
  CheckCircle,
  ExternalLink,
  Plus,
  Edit,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

export default function CorporateWalletDetailPage() {
  const params = useParams();
  const router = useRouter();
  const walletId = params.id as string;
  const [copied, setCopied] = useState(false);

  // Mock wallet data - in production, fetch from API
  const walletData = {
    id: walletId,
    name: 'Corporate Operations Wallet',
    address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1',
    type: 'Enterprise',
    network: 'Base Sepolia',
    rail: 'evm',
    balance: 425850.00,
    dailyLimit: 500000,
    usedDaily: 125000,
    status: 'active',
    createdAt: '2024-09-15',
    lastActivity: '2 hours ago',
    description: 'Primary wallet for day-to-day corporate operations and vendor payments',
  };

  const businessRules = [
    {
      id: 'rule_1',
      name: 'Daily Transaction Limit',
      description: 'Maximum $50,000 per day',
      status: 'active',
      type: 'limit',
    },
    {
      id: 'rule_2',
      name: 'AML Screening Required',
      description: 'All transactions over $10,000 require AML screening',
      status: 'active',
      type: 'compliance',
    },
    {
      id: 'rule_3',
      name: 'Multi-Signature Required',
      description: 'Transactions over $25,000 require 2 signatures',
      status: 'active',
      type: 'authorization',
    },
    {
      id: 'rule_4',
      name: 'KYC Verification',
      description: 'All recipients must have completed KYC',
      status: 'active',
      type: 'compliance',
    },
  ];

  const recentTransactions = [
    {
      id: 'tx_1',
      type: 'send',
      recipient: 'Acme Corp',
      amount: -15000,
      status: 'completed',
      timestamp: '2 hours ago',
      hash: '0x1234...5678',
    },
    {
      id: 'tx_2',
      type: 'receive',
      sender: 'Tech Solutions Inc',
      amount: 25000,
      status: 'completed',
      timestamp: '5 hours ago',
      hash: '0xabcd...efgh',
    },
    {
      id: 'tx_3',
      type: 'send',
      recipient: 'Global Services Ltd',
      amount: -8500,
      status: 'pending',
      timestamp: '1 day ago',
      hash: '0x9876...5432',
    },
  ];

  const authorizedUsers = [
    { id: 'user_1', name: 'John Smith', role: 'Admin', permissions: 'Full Access' },
    { id: 'user_2', name: 'Sarah Johnson', role: 'Finance Manager', permissions: 'Send/Receive' },
    { id: 'user_3', name: 'Michael Chen', role: 'Accountant', permissions: 'View Only' },
  ];

  const handleCopyAddress = async () => {
    await navigator.clipboard.writeText(walletData.address);
    setCopied(true);
    toast.success('Wallet address copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-700 border-green-200', label: 'Active' },
      pending: { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', label: 'Pending' },
      completed: { color: 'bg-blue-100 text-blue-700 border-blue-200', label: 'Completed' },
      frozen: { color: 'bg-red-100 text-red-700 border-red-200', label: 'Frozen' },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    return <Badge className={config.color} variant="outline">{config.label}</Badge>;
  };

  const getRuleTypeBadge = (type: string) => {
    const typeConfig = {
      limit: { color: 'bg-blue-100 text-blue-700', label: 'Limit' },
      compliance: { color: 'bg-purple-100 text-purple-700', label: 'Compliance' },
      authorization: { color: 'bg-orange-100 text-orange-700', label: 'Authorization' },
    };
    const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.limit;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="border-orange-300 text-orange-600 hover:bg-orange-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{walletData.name}</h1>
            <p className="text-gray-500 mt-1">Corporate Wallet Details</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push('/wallets/corporate/settings')}
            className="border-orange-300 text-orange-600 hover:bg-orange-50"
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button
            onClick={() => router.push('/payments/send')}
            className="bg-orange-400 hover:bg-orange-500 text-white"
          >
            <Send className="w-4 h-4 mr-2" />
            Send Payment
          </Button>
        </div>
      </div>

      {/* Wallet Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(walletData.balance)}</div>
            <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
              <TrendingUp className="w-4 h-4" />
              <span>+12.5% this month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Daily Limit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(walletData.dailyLimit)}</div>
            <div className="mt-2">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-500">Used Today</span>
                <span className="font-medium">{Math.round((walletData.usedDaily / walletData.dailyLimit) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-orange-400 h-2 rounded-full"
                  style={{ width: `${(walletData.usedDaily / walletData.dailyLimit) * 100}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Last Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-400" />
              <span className="text-lg font-semibold">{walletData.lastActivity}</span>
            </div>
            <p className="text-sm text-gray-500 mt-2">Transaction processed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {getStatusBadge(walletData.status)}
            </div>
            <p className="text-sm text-gray-500 mt-2">All systems operational</p>
          </CardContent>
        </Card>
      </div>

      {/* Wallet Address Card */}
      <Card className="border-2 border-orange-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-orange-600" />
            Wallet Address
          </CardTitle>
          <CardDescription>Share this address to receive payments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 bg-gray-50 p-4 rounded-lg">
            <code className="text-sm font-mono flex-1 break-all">{walletData.address}</code>
            <Button variant="ghost" size="sm" onClick={handleCopyAddress}>
              {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <div className="flex gap-2 mt-4">
            <Badge variant="outline" className="border-orange-300 text-orange-600">
              {walletData.network}
            </Badge>
            <Badge variant="outline" className="border-blue-300 text-blue-600">
              {walletData.rail === 'evm' ? 'EVM' : 'Solana'}
            </Badge>
            <Badge variant="outline" className="border-purple-300 text-purple-600">
              {walletData.type}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="rules">Business Rules</TabsTrigger>
          <TabsTrigger value="users">Authorized Users</TabsTrigger>
          <TabsTrigger value="activity">Activity Log</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Transactions</CardTitle>
                  <CardDescription>Latest wallet activity</CardDescription>
                </div>
                <Button size="sm" variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${tx.type === 'send' ? 'bg-red-100' : 'bg-green-100'}`}>
                        <Send className={`w-5 h-5 ${tx.type === 'send' ? 'text-red-600 rotate-45' : 'text-green-600 -rotate-45'}`} />
                      </div>
                      <div>
                        <p className="font-medium">
                          {tx.type === 'send' ? `To: ${tx.recipient}` : `From: ${tx.sender}`}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span>{tx.timestamp}</span>
                          <span>•</span>
                          <code className="text-xs">{tx.hash}</code>
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <div>
                        <p className={`text-lg font-semibold ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(Math.abs(tx.amount))}
                        </p>
                        {getStatusBadge(tx.status)}
                      </div>
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-blue-600" />
                    Business Rules & Policies
                  </CardTitle>
                  <CardDescription>Configure compliance and transaction rules</CardDescription>
                </div>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Rule
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {businessRules.map((rule) => (
                  <div
                    key={rule.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{rule.name}</p>
                          {getRuleTypeBadge(rule.type)}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{rule.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(rule.status)}
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-purple-600" />
                    Authorized Users
                  </CardTitle>
                  <CardDescription>Manage wallet access and permissions</CardDescription>
                </div>
                <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add User
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {authorizedUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="border-purple-300 text-purple-600">
                        {user.permissions}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-gray-600" />
                Activity Log
              </CardTitle>
              <CardDescription>Comprehensive audit trail of all wallet activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 border-l-4 border-green-500 bg-green-50 rounded">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium">Transaction Completed</p>
                    <p className="text-sm text-gray-600">Payment of $15,000 sent to Acme Corp</p>
                    <p className="text-xs text-gray-500 mt-1">2 hours ago • John Smith</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 border-l-4 border-blue-500 bg-blue-50 rounded">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium">Business Rule Applied</p>
                    <p className="text-sm text-gray-600">AML screening completed for incoming transaction</p>
                    <p className="text-xs text-gray-500 mt-1">5 hours ago • System</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 border-l-4 border-purple-500 bg-purple-50 rounded">
                  <Users className="w-5 h-5 text-purple-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium">User Access Modified</p>
                    <p className="text-sm text-gray-600">Sarah Johnson permissions updated to Finance Manager</p>
                    <p className="text-xs text-gray-500 mt-1">1 day ago • Admin</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
