'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Shield, Plus, Edit, Trash2, Eye, AlertTriangle, CheckCircle, XCircle, DollarSign, Clock, TrendingUp, Globe, Users, Settings } from 'lucide-react';

interface LimitRule {
  id: string;
  name: string;
  description: string;
  type: 'transaction_amount' | 'daily_volume' | 'monthly_volume' | 'velocity' | 'geographic' | 'token_specific' | 'role_based';
  status: 'active' | 'inactive' | 'draft';
  priority: number;
  limit: {
    amount?: number;
    currency: string;
    timeframe?: string;
    frequency?: number;
  };
  conditions: Array<{
    field: string;
    operator: string;
    value: string;
  }>;
  exemptions: string[];
  walletIds: string[];
  userRoles: string[];
  createdBy: string;
  createdAt: string;
  lastModified: string;
  violationsCount: number;
  enforced: boolean;
}

interface WalletLimits {
  walletId: string;
  walletName: string;
  currentLimits: Array<{
    type: string;
    limit: string;
    used: string;
    percentage: number;
    status: 'normal' | 'warning' | 'critical';
  }>;
}

export default function LimitsRulesPage() {
  const [selectedTab, setSelectedTab] = useState('rules');
  const [isCreateRuleOpen, setIsCreateRuleOpen] = useState(false);
  const [isEditRuleOpen, setIsEditRuleOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState<LimitRule | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  // Mock data for limit rules
  const limitRules: LimitRule[] = [
    {
      id: '1',
      name: 'High Value Transaction Limit',
      description: 'Maximum single transaction amount limit',
      type: 'transaction_amount',
      status: 'active',
      priority: 1,
      limit: {
        amount: 1000000,
        currency: 'USD',
      },
      conditions: [
        { field: 'transaction_type', operator: 'equals', value: 'transfer' }
      ],
      exemptions: ['CEO', 'CFO'],
      walletIds: ['1', '2', '3'],
      userRoles: ['all'],
      createdBy: 'John Smith',
      createdAt: '2024-01-15 10:00',
      lastModified: '2024-01-28 14:30',
      violationsCount: 3,
      enforced: true
    },
    {
      id: '2',
      name: 'Daily Volume Limit',
      description: 'Maximum daily transaction volume per wallet',
      type: 'daily_volume',
      status: 'active',
      priority: 2,
      limit: {
        amount: 5000000,
        currency: 'USD',
        timeframe: 'daily'
      },
      conditions: [
        { field: 'wallet_type', operator: 'not_equals', value: 'treasury' }
      ],
      exemptions: ['Treasury Manager'],
      walletIds: ['2', '3'],
      userRoles: ['employee', 'manager'],
      createdBy: 'Sarah Johnson',
      createdAt: '2024-01-16 11:30',
      lastModified: '2024-01-29 16:45',
      violationsCount: 8,
      enforced: true
    },
    {
      id: '3',
      name: 'Token Minting Velocity Limit',
      description: 'Limits frequency of token minting operations',
      type: 'velocity',
      status: 'active',
      priority: 1,
      limit: {
        frequency: 5,
        timeframe: 'hourly',
        currency: 'USDXM'
      },
      conditions: [
        { field: 'operation', operator: 'equals', value: 'mint' },
        { field: 'token', operator: 'equals', value: 'USDXM' }
      ],
      exemptions: [],
      walletIds: ['1'],
      userRoles: ['admin', 'treasury'],
      createdBy: 'Michael Brown',
      createdAt: '2024-01-18 09:15',
      lastModified: '2024-01-27 13:20',
      violationsCount: 1,
      enforced: true
    },
    {
      id: '4',
      name: 'Geographic Restriction',
      description: 'Blocks transactions from restricted countries',
      type: 'geographic',
      status: 'active',
      priority: 1,
      limit: {
        currency: 'ALL'
      },
      conditions: [
        { field: 'origin_country', operator: 'in_list', value: 'sanctioned_countries' }
      ],
      exemptions: ['Compliance Officer'],
      walletIds: ['1', '2', '3'],
      userRoles: ['all'],
      createdBy: 'Lisa Chen',
      createdAt: '2024-01-20 14:45',
      lastModified: '2024-01-25 10:30',
      violationsCount: 0,
      enforced: true
    },
    {
      id: '5',
      name: 'Employee Monthly Limit',
      description: 'Monthly spending limit for employee roles',
      type: 'monthly_volume',
      status: 'active',
      priority: 3,
      limit: {
        amount: 50000,
        currency: 'USD',
        timeframe: 'monthly'
      },
      conditions: [
        { field: 'user_role', operator: 'equals', value: 'employee' }
      ],
      exemptions: [],
      walletIds: ['2', '3'],
      userRoles: ['employee'],
      createdBy: 'David Wilson',
      createdAt: '2024-01-22 16:20',
      lastModified: '2024-01-29 11:45',
      violationsCount: 12,
      enforced: true
    },
    {
      id: '6',
      name: 'USDC Transfer Limit',
      description: 'Specific limits for USDC token transfers',
      type: 'token_specific',
      status: 'draft',
      priority: 2,
      limit: {
        amount: 2500000,
        currency: 'USDC',
        timeframe: 'daily'
      },
      conditions: [
        { field: 'token', operator: 'equals', value: 'USDC' },
        { field: 'operation', operator: 'equals', value: 'transfer' }
      ],
      exemptions: ['CFO', 'Treasury Manager'],
      walletIds: ['1', '2'],
      userRoles: ['all'],
      createdBy: 'Emily Davis',
      createdAt: '2024-01-29 15:30',
      lastModified: '2024-01-29 15:30',
      violationsCount: 0,
      enforced: false
    }
  ];

  // Mock data for wallet limits overview
  const walletLimits: WalletLimits[] = [
    {
      walletId: '1',
      walletName: 'Executive Treasury Wallet',
      currentLimits: [
        { type: 'Daily Volume', limit: '$5,000,000', used: '$3,250,000', percentage: 65, status: 'warning' },
        { type: 'Transaction Amount', limit: '$1,000,000', used: '$850,000', percentage: 85, status: 'critical' },
        { type: 'Monthly Volume', limit: '$100,000,000', used: '$42,500,000', percentage: 43, status: 'normal' }
      ]
    },
    {
      walletId: '2',
      walletName: 'Operations Multi-Sig',
      currentLimits: [
        { type: 'Daily Volume', limit: '$5,000,000', used: '$1,750,000', percentage: 35, status: 'normal' },
        { type: 'Transaction Amount', limit: '$1,000,000', used: '$125,000', percentage: 13, status: 'normal' },
        { type: 'Monthly Volume', limit: '$75,000,000', used: '$28,900,000', percentage: 39, status: 'normal' }
      ]
    },
    {
      walletId: '3',
      walletName: 'Compliance Escrow Wallet',
      currentLimits: [
        { type: 'Daily Volume', limit: '$5,000,000', used: '$4,100,000', percentage: 82, status: 'critical' },
        { type: 'Transaction Amount', limit: '$1,000,000', used: '$450,000', percentage: 45, status: 'normal' },
        { type: 'Monthly Volume', limit: '$50,000,000', used: '$18,750,000', percentage: 38, status: 'normal' }
      ]
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 border-green-200"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200"><XCircle className="w-3 h-3 mr-1" />Inactive</Badge>;
      case 'draft':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200"><Edit className="w-3 h-3 mr-1" />Draft</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getLimitStatusBadge = (status: string) => {
    switch (status) {
      case 'normal':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Normal</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Warning</Badge>;
      case 'critical':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Critical</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'transaction_amount':
        return <DollarSign className="w-4 h-4" />;
      case 'daily_volume':
      case 'monthly_volume':
        return <TrendingUp className="w-4 h-4" />;
      case 'velocity':
        return <Clock className="w-4 h-4" />;
      case 'geographic':
        return <Globe className="w-4 h-4" />;
      case 'token_specific':
        return <Shield className="w-4 h-4" />;
      case 'role_based':
        return <Users className="w-4 h-4" />;
      default:
        return <Settings className="w-4 h-4" />;
    }
  };

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 1:
        return 'Critical';
      case 2:
        return 'High';
      case 3:
        return 'Medium';
      case 4:
        return 'Low';
      default:
        return 'Normal';
    }
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1:
        return 'bg-red-100 text-red-800 border-red-200';
      case 2:
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 3:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 4:
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredRules = limitRules.filter(rule => {
    const matchesStatus = filterStatus === 'all' || rule.status === filterStatus;
    const matchesType = filterType === 'all' || rule.type === filterType;
    return matchesStatus && matchesType;
  });

  const handleEditRule = (rule: LimitRule) => {
    setSelectedRule(rule);
    setIsEditRuleOpen(true);
  };

  const handleToggleRule = (ruleId: string) => {
    // In a real app, this would make an API call
    console.log('Toggle rule enforcement:', ruleId);
  };

  const formatLimitDisplay = (rule: LimitRule) => {
    if (rule.limit.amount) {
      return `${rule.limit.amount.toLocaleString()} ${rule.limit.currency}`;
    }
    if (rule.limit.frequency) {
      return `${rule.limit.frequency} per ${rule.limit.timeframe}`;
    }
    return 'No limit set';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Limit Rules</h1>
          <p className="text-gray-600">Configure and manage wallet transaction limits and restrictions</p>
        </div>
        <Button
          onClick={() => setIsCreateRuleOpen(true)}
          className="bg-orange-400 hover:bg-orange-500 text-white border-orange-400 hover:border-orange-500"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Rule
        </Button>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="rules">Limit Rules</TabsTrigger>
          <TabsTrigger value="overview">Limits Overview</TabsTrigger>
          <TabsTrigger value="violations">Violations Log</TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Active Rules</p>
                    <p className="text-2xl font-bold">{limitRules.filter(r => r.status === 'active').length}</p>
                  </div>
                  <Shield className="w-8 h-8 text-green-400" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Violations</p>
                    <p className="text-2xl font-bold text-red-600">
                      {limitRules.reduce((sum, rule) => sum + rule.violationsCount, 0)}
                    </p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-red-400" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Draft Rules</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {limitRules.filter(r => r.status === 'draft').length}
                    </p>
                  </div>
                  <Edit className="w-8 h-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Protected Wallets</p>
                    <p className="text-2xl font-bold">3</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-orange-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-4 items-center">
                <Label>Filters:</Label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Rule Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="transaction_amount">Transaction Amount</SelectItem>
                    <SelectItem value="daily_volume">Daily Volume</SelectItem>
                    <SelectItem value="monthly_volume">Monthly Volume</SelectItem>
                    <SelectItem value="velocity">Velocity</SelectItem>
                    <SelectItem value="geographic">Geographic</SelectItem>
                    <SelectItem value="token_specific">Token Specific</SelectItem>
                    <SelectItem value="role_based">Role Based</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Rules Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Limit Rules ({filteredRules.length})
              </CardTitle>
              <CardDescription>
                Configure transaction limits and restrictions for wallets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rule</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Limit</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Violations</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Enforced</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRules.map((rule) => (
                    <TableRow key={rule.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{rule.name}</p>
                          <p className="text-sm text-gray-600">{rule.description}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTypeIcon(rule.type)}
                          <span className="capitalize text-sm">
                            {rule.type.replace('_', ' ')}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p className="font-medium">{formatLimitDisplay(rule)}</p>
                          {rule.limit.timeframe && (
                            <p className="text-gray-600">per {rule.limit.timeframe}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPriorityColor(rule.priority)}>
                          {getPriorityLabel(rule.priority)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-center">
                          <p className={`font-medium ${rule.violationsCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {rule.violationsCount}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(rule.status)}</TableCell>
                      <TableCell>
                        <Switch
                          checked={rule.enforced}
                          onCheckedChange={() => handleToggleRule(rule.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditRule(rule)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Wallet Limits Overview</CardTitle>
              <CardDescription>
                Current usage against configured limits for each wallet
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {walletLimits.map((wallet) => (
                  <Card key={wallet.walletId} className="p-4">
                    <h3 className="font-semibold mb-4">{wallet.walletName}</h3>
                    <div className="space-y-3">
                      {wallet.currentLimits.map((limit, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm font-medium">{limit.type}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600">
                                  {limit.used} / {limit.limit}
                                </span>
                                {getLimitStatusBadge(limit.status)}
                              </div>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  limit.status === 'critical' ? 'bg-red-500' :
                                  limit.status === 'warning' ? 'bg-yellow-500' :
                                  'bg-green-500'
                                }`}
                                style={{ width: `${limit.percentage}%` }}
                              ></div>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{limit.percentage}% used</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="violations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Violations</CardTitle>
              <CardDescription>
                Log of limit rule violations and enforcement actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Rule</TableHead>
                    <TableHead>Wallet</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Attempted Amount</TableHead>
                    <TableHead>Action Taken</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    {
                      timestamp: '2024-01-29 16:45',
                      rule: 'High Value Transaction Limit',
                      wallet: 'Executive Treasury',
                      user: 'John Smith',
                      amount: '$1,250,000',
                      action: 'Blocked',
                      status: 'resolved'
                    },
                    {
                      timestamp: '2024-01-29 14:30',
                      rule: 'Daily Volume Limit',
                      wallet: 'Operations Multi-Sig',
                      user: 'Sarah Johnson',
                      amount: '$5,500,000',
                      action: 'Blocked',
                      status: 'under_review'
                    },
                    {
                      timestamp: '2024-01-29 12:15',
                      rule: 'Employee Monthly Limit',
                      wallet: 'Compliance Escrow',
                      user: 'Michael Brown',
                      amount: '$52,000',
                      action: 'Warning Issued',
                      status: 'acknowledged'
                    }
                  ].map((violation, index) => (
                    <TableRow key={index}>
                      <TableCell className="text-sm">{violation.timestamp}</TableCell>
                      <TableCell className="font-medium">{violation.rule}</TableCell>
                      <TableCell>{violation.wallet}</TableCell>
                      <TableCell>{violation.user}</TableCell>
                      <TableCell className="font-medium text-red-600">{violation.amount}</TableCell>
                      <TableCell>{violation.action}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            violation.status === 'resolved' ? 'bg-green-100 text-green-800 border-green-200' :
                            violation.status === 'under_review' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                            'bg-blue-100 text-blue-800 border-blue-200'
                          }
                        >
                          {violation.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Rule Dialog */}
      <Dialog open={isCreateRuleOpen} onOpenChange={setIsCreateRuleOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Limit Rule</DialogTitle>
            <DialogDescription>
              Configure a new transaction limit or restriction rule
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="rule-name">Rule Name</Label>
                <Input id="rule-name" placeholder="Enter rule name" />
              </div>
              <div>
                <Label htmlFor="rule-type">Rule Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select rule type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="transaction_amount">Transaction Amount</SelectItem>
                    <SelectItem value="daily_volume">Daily Volume</SelectItem>
                    <SelectItem value="monthly_volume">Monthly Volume</SelectItem>
                    <SelectItem value="velocity">Velocity</SelectItem>
                    <SelectItem value="geographic">Geographic</SelectItem>
                    <SelectItem value="token_specific">Token Specific</SelectItem>
                    <SelectItem value="role_based">Role Based</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="rule-description">Description</Label>
              <Textarea
                id="rule-description"
                placeholder="Describe what this rule does and when it applies"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="limit-amount">Limit Amount</Label>
                <Input id="limit-amount" type="number" placeholder="0" />
              </div>
              <div>
                <Label htmlFor="limit-currency">Currency</Label>
                <Select defaultValue="USD">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="USDC">USDC</SelectItem>
                    <SelectItem value="USDT">USDT</SelectItem>
                    <SelectItem value="USDXM">USDXM</SelectItem>
                    <SelectItem value="ALL">All Currencies</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="timeframe">Timeframe</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select timeframe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="transaction">Per Transaction</SelectItem>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select defaultValue="3">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Critical</SelectItem>
                    <SelectItem value="2">High</SelectItem>
                    <SelectItem value="3">Medium</SelectItem>
                    <SelectItem value="4">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2 pt-8">
                <Switch id="enforce-rule" />
                <Label htmlFor="enforce-rule">Enforce rule immediately</Label>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setIsCreateRuleOpen(false)}>
                Cancel
              </Button>
              <Button
                className="bg-orange-400 hover:bg-orange-500 text-white border-orange-400 hover:border-orange-500"
                onClick={() => setIsCreateRuleOpen(false)}
              >
                Create Rule
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}