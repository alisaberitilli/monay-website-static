'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  Filter,
  Download,
  RefreshCw,
  DollarSign,
  Wallet,
  TrendingUp,
  AlertCircle,
  Lock,
  Unlock,
  Eye,
  MoreVertical,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { AreaChart, DonutChart } from '@tremor/react';
import { superAdminService } from '@/services/super-admin.service';
import toast from 'react-hot-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface CircleWallet {
  id: string;
  walletAddress: string;
  walletType: string;
  status: 'active' | 'inactive' | 'frozen' | 'pending';
  balance: number;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  } | null;
}

interface CircleMetrics {
  totalSupply: number;
  walletCount: number;
  dailyVolume: number;
  pendingOperations: number;
  failedTransactions: any[];
}

export default function CircleManagementPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [wallets, setWallets] = useState<CircleWallet[]>([]);
  const [metrics, setMetrics] = useState<CircleMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedWallet, setSelectedWallet] = useState<CircleWallet | null>(null);
  const [showFreezeModal, setShowFreezeModal] = useState(false);
  const [showUnfreezeModal, setShowUnfreezeModal] = useState(false);
  const [freezeReason, setFreezeReason] = useState('');
  const [processingAction, setProcessingAction] = useState(false);

  useEffect(() => {
    loadCircleData();
    const interval = setInterval(loadCircleData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const loadCircleData = async () => {
    try {
      setLoading(true);
      const [walletsData, metricsData] = await Promise.all([
        superAdminService.getCircleWallets(),
        superAdminService.getCircleMetrics(),
      ]);

      setWallets(walletsData.data.wallets);
      setMetrics(metricsData);
    } catch (error) {
      console.error('Failed to load Circle data:', error);
      toast.error('Failed to load Circle data');
    } finally {
      setLoading(false);
    }
  };

  const handleFreezeWallet = async () => {
    if (!selectedWallet || !freezeReason.trim()) {
      toast.error('Please provide a reason for freezing the wallet');
      return;
    }

    setProcessingAction(true);
    try {
      await superAdminService.freezeCircleWallet(selectedWallet.id, freezeReason);
      toast.success(`Wallet ${selectedWallet.id} has been frozen`);
      setShowFreezeModal(false);
      setFreezeReason('');
      await loadCircleData();
    } catch (error) {
      console.error('Failed to freeze wallet:', error);
      toast.error('Failed to freeze wallet');
    } finally {
      setProcessingAction(false);
    }
  };

  const handleUnfreezeWallet = async () => {
    if (!selectedWallet) return;

    setProcessingAction(true);
    try {
      await superAdminService.unfreezeCircleWallet(selectedWallet.id);
      toast.success(`Wallet ${selectedWallet.id} has been unfrozen`);
      setShowUnfreezeModal(false);
      await loadCircleData();
    } catch (error) {
      console.error('Failed to unfreeze wallet:', error);
      toast.error('Failed to unfreeze wallet');
    } finally {
      setProcessingAction(false);
    }
  };


  const filteredWallets = wallets.filter(wallet => {
    const userEmail = wallet.user?.email || '';
    const walletId = wallet.id || '';
    const matchesSearch = userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          walletId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || wallet.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const volumeData = [
    { date: '2024-01-20', volume: 450000 },
    { date: '2024-01-21', volume: 520000 },
    { date: '2024-01-22', volume: 480000 },
    { date: '2024-01-23', volume: 610000 },
    { date: '2024-01-24', volume: 580000 },
  ];

  const distributionData = [
    { name: 'Active', value: metrics?.walletCount || 0, color: 'green' },
    { name: 'Pending', value: metrics?.pendingOperations || 0, color: 'yellow' },
    { name: 'Failed', value: metrics?.failedTransactions?.length || 0, color: 'red' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Circle USDC Management</h1>
          <p className="text-gray-600">Monitor and manage Circle wallets and operations</p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            onClick={loadCircleData}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
          <Button className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total USDC Supply</p>
                <p className="text-2xl font-bold">
                  ${metrics?.totalSupply?.toLocaleString() || '0'}
                </p>
                <div className="flex items-center gap-1 text-sm text-green-600">
                  <ArrowUpRight className="w-3 h-3" />
                  <span>12.5%</span>
                </div>
              </div>
              <DollarSign className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Wallets</p>
                <p className="text-2xl font-bold">{metrics?.walletCount || 0}</p>
                <div className="flex items-center gap-1 text-sm text-green-600">
                  <ArrowUpRight className="w-3 h-3" />
                  <span>8.3%</span>
                </div>
              </div>
              <Wallet className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">24h Volume</p>
                <p className="text-2xl font-bold">
                  ${metrics?.dailyVolume?.toLocaleString() || '0'}
                </p>
                <div className="flex items-center gap-1 text-sm text-green-600">
                  <ArrowUpRight className="w-3 h-3" />
                  <span>15.2%</span>
                </div>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Operations</p>
                <p className="text-2xl font-bold">{metrics?.pendingOperations || 0}</p>
                <div className="flex items-center gap-1 text-sm text-red-600">
                  <ArrowDownRight className="w-3 h-3" />
                  <span>5.1%</span>
                </div>
              </div>
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full max-w-lg">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="wallets">Wallets</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Volume Trend (Last 5 Days)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <AreaChart
                    className="h-full"
                    data={volumeData}
                    index="date"
                    categories={["volume"]}
                    colors={["blue"]}
                    valueFormatter={(value) => `$${value.toLocaleString()}`}
                    showAnimation={true}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Operation Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <DonutChart
                    className="h-full"
                    data={distributionData}
                    category="value"
                    index="name"
                    colors={["green", "yellow", "red"]}
                    valueFormatter={(value) => value.toLocaleString()}
                    showAnimation={true}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Failed Transactions */}
          {metrics?.failedTransactions && metrics.failedTransactions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  Failed Transactions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transaction ID</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Error</TableHead>
                      <TableHead>Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {metrics.failedTransactions.slice(0, 5).map((tx: any) => (
                      <TableRow key={tx.id}>
                        <TableCell className="font-mono text-sm">{tx.id}</TableCell>
                        <TableCell>{tx.userEmail}</TableCell>
                        <TableCell>${tx.amount}</TableCell>
                        <TableCell>
                          <Badge variant="destructive">{tx.error}</Badge>
                        </TableCell>
                        <TableCell>{new Date(tx.createdAt).toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Wallets Tab */}
        <TabsContent value="wallets" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Circle Wallets</CardTitle>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search wallets..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 w-64"
                    />
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Wallet ID</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredWallets.map((wallet) => (
                    <TableRow key={wallet.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{wallet.user?.email || 'Unknown User'}</p>
                          <p className="text-xs text-gray-500">{wallet.user?.id || 'N/A'}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {wallet.id.substring(0, 8)}...
                      </TableCell>
                      <TableCell className="font-bold">
                        ${wallet.balance?.toLocaleString() || '0'}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            wallet.status === 'active'
                              ? 'success'
                              : wallet.status === 'inactive'
                              ? 'destructive'
                              : 'warning'
                          }
                        >
                          {wallet.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(wallet.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedWallet(wallet)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {wallet.status === 'active' ? (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setSelectedWallet(wallet);
                                setShowFreezeModal(true);
                              }}
                            >
                              <Lock className="w-4 h-4 text-red-600" />
                            </Button>
                          ) : wallet.status === 'inactive' ? (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setSelectedWallet(wallet);
                                setShowUnfreezeModal(true);
                              }}
                            >
                              <Unlock className="w-4 h-4 text-green-600" />
                            </Button>
                          ) : null}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Recent Circle Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Transaction monitoring coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compliance Tab */}
        <TabsContent value="compliance">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Monitoring</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Compliance features coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Freeze Wallet Modal - NO DESTRUCTIVE DATABASE OPERATIONS */}
      <Dialog open={showFreezeModal} onOpenChange={setShowFreezeModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Freeze Circle Wallet</DialogTitle>
            <DialogDescription>
              This will temporarily freeze the wallet. The wallet status will be UPDATED (not deleted).
              User: {selectedWallet?.user?.email || 'Unknown User'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="freeze-reason">Reason for Freezing *</Label>
              <Textarea
                id="freeze-reason"
                value={freezeReason}
                onChange={(e) => setFreezeReason(e.target.value)}
                placeholder="Provide a detailed reason for freezing this wallet..."
                className="min-h-[100px]"
              />
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> This action will UPDATE the wallet status to 'frozen' in the database.
                The wallet will remain intact and can be unfrozen later. NO data will be deleted.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowFreezeModal(false);
                setFreezeReason('');
              }}
              disabled={processingAction}
            >
              Cancel
            </Button>
            <Button
              onClick={handleFreezeWallet}
              disabled={processingAction || !freezeReason.trim()}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              {processingAction ? 'Processing...' : 'Freeze Wallet'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unfreeze Wallet Modal - NO DESTRUCTIVE DATABASE OPERATIONS */}
      <Dialog open={showUnfreezeModal} onOpenChange={setShowUnfreezeModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unfreeze Circle Wallet</DialogTitle>
            <DialogDescription>
              This will unfreeze the wallet and restore normal operations.
              User: {selectedWallet?.user?.email || 'Unknown User'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-800">
                <strong>Note:</strong> This action will UPDATE the wallet status to 'active' in the database.
                The wallet will be restored to normal operation. NO data modifications beyond status update.
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">
                <strong>Wallet ID:</strong> {selectedWallet?.id}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Current Balance:</strong> ${selectedWallet?.balance?.toLocaleString() || '0'}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Last Activity:</strong> {selectedWallet?.updatedAt ? new Date(selectedWallet.updatedAt).toLocaleString() : 'N/A'}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowUnfreezeModal(false)}
              disabled={processingAction}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUnfreezeWallet}
              disabled={processingAction}
              className="bg-green-600 hover:bg-green-700"
            >
              {processingAction ? 'Processing...' : 'Unfreeze Wallet'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}