'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Shield,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Search,
  Filter,
  Eye,
  Settings,
  Copy,
  ExternalLink,
  Key,
  Lock,
  Wallet,
  TrendingUp,
  Activity
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface MultiSigWallet {
  id: string;
  name: string;
  address: string;
  network: string;
  balance: number;
  threshold: string; // e.g., "2/3", "3/5"
  signers: number;
  required: number;
  pendingTransactions: number;
  status: 'active' | 'frozen' | 'setup';
  created: string;
  lastActivity: string;
}

export default function MultiSigWalletsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Mock multi-sig wallets data
  const multiSigWallets: MultiSigWallet[] = [
    {
      id: 'ms_1',
      name: 'Treasury Multi-Sig',
      address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1',
      network: 'Base',
      balance: 1250000,
      threshold: '3/5',
      signers: 5,
      required: 3,
      pendingTransactions: 2,
      status: 'active',
      created: '2024-01-15',
      lastActivity: '2 hours ago'
    },
    {
      id: 'ms_2',
      name: 'Executive Approval Wallet',
      address: '0x8Ba1f109551bD432803012645Ac136ddd64DBA22',
      network: 'Base',
      balance: 750000,
      threshold: '2/3',
      signers: 3,
      required: 2,
      pendingTransactions: 1,
      status: 'active',
      created: '2024-02-20',
      lastActivity: '1 day ago'
    },
    {
      id: 'ms_3',
      name: 'Vendor Payments Safe',
      address: '0x3f5CE5FBFe3E9af3971dD833D26BA9b5C936f0bE',
      network: 'Polygon zkEVM',
      balance: 325000,
      threshold: '2/4',
      signers: 4,
      required: 2,
      pendingTransactions: 0,
      status: 'active',
      created: '2024-03-10',
      lastActivity: '3 hours ago'
    },
    {
      id: 'ms_4',
      name: 'Emergency Recovery Wallet',
      address: '0x9f4A8C8EbC7D5F1a3B2E6D4C8A7B5E9F2C1A8D6E',
      network: 'Base',
      balance: 2500000,
      threshold: '4/5',
      signers: 5,
      required: 4,
      pendingTransactions: 0,
      status: 'frozen',
      created: '2024-01-05',
      lastActivity: '2 weeks ago'
    },
    {
      id: 'ms_5',
      name: 'Department Budget Control',
      address: '0x1234567890123456789012345678901234567890',
      network: 'Base',
      balance: 180000,
      threshold: '2/2',
      signers: 2,
      required: 2,
      pendingTransactions: 3,
      status: 'active',
      created: '2024-04-01',
      lastActivity: '30 minutes ago'
    }
  ];

  const filteredWallets = multiSigWallets.filter(wallet => {
    const matchesSearch = wallet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          wallet.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || wallet.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const totalBalance = multiSigWallets.reduce((sum, w) => sum + w.balance, 0);
  const pendingCount = multiSigWallets.reduce((sum, w) => sum + w.pendingTransactions, 0);
  const activeWallets = multiSigWallets.filter(w => w.status === 'active').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'frozen':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'setup':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    toast.success('Address copied to clipboard');
  };

  const handleCreateWallet = () => {
    toast.success('Multi-sig wallet creation initiated');
    setShowCreateDialog(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Shield className="h-8 w-8 text-blue-600" />
            Multi-Signature Wallets
          </h1>
          <p className="text-gray-600 mt-2">
            Secure enterprise wallets requiring multiple approvals for transactions
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4" />
              Create Multi-Sig Wallet
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Multi-Signature Wallet</DialogTitle>
              <DialogDescription>
                Set up a new wallet requiring multiple signatures for transactions
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="wallet-name">Wallet Name</Label>
                <Input id="wallet-name" placeholder="e.g., Treasury Multi-Sig" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="network">Blockchain Network</Label>
                  <Select>
                    <SelectTrigger id="network">
                      <SelectValue placeholder="Select network" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="base">Base</SelectItem>
                      <SelectItem value="polygon">Polygon zkEVM</SelectItem>
                      <SelectItem value="ethereum">Ethereum</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signers">Number of Signers</Label>
                  <Select>
                    <SelectTrigger id="signers">
                      <SelectValue placeholder="Select signers" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2 Signers</SelectItem>
                      <SelectItem value="3">3 Signers</SelectItem>
                      <SelectItem value="4">4 Signers</SelectItem>
                      <SelectItem value="5">5 Signers</SelectItem>
                      <SelectItem value="7">7 Signers</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="threshold">Required Signatures</Label>
                <Select>
                  <SelectTrigger id="threshold">
                    <SelectValue placeholder="Signatures needed" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 of N</SelectItem>
                    <SelectItem value="2">2 of N</SelectItem>
                    <SelectItem value="3">3 of N</SelectItem>
                    <SelectItem value="4">4 of N</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  Number of signatures required to execute a transaction
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateWallet} className="bg-blue-600 hover:bg-blue-700">
                Create Wallet
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Secured</p>
                <p className="text-2xl font-bold mt-1">
                  ${totalBalance.toLocaleString()}
                </p>
                <p className="text-xs text-green-600 mt-1 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Protected by multi-sig
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Wallets</p>
                <p className="text-2xl font-bold mt-1">{activeWallets}</p>
                <p className="text-xs text-gray-600 mt-1">
                  of {multiSigWallets.length} total
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <Wallet className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Approvals</p>
                <p className="text-2xl font-bold mt-1">{pendingCount}</p>
                <p className="text-xs text-orange-600 mt-1 flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  Awaiting signatures
                </p>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Signers</p>
                <p className="text-2xl font-bold mt-1">
                  {multiSigWallets.reduce((sum, w) => sum + w.signers, 0)}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Across all wallets
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button
          variant="outline"
          className="flex items-center gap-2 justify-start h-auto p-4"
          onClick={() => router.push('/wallets/multisig/signers')}
        >
          <Users className="h-5 w-5 text-blue-600" />
          <div className="text-left">
            <div className="font-semibold">Manage Signers</div>
            <div className="text-xs text-gray-500">Add or remove authorized signers</div>
          </div>
        </Button>
        <Button
          variant="outline"
          className="flex items-center gap-2 justify-start h-auto p-4"
          onClick={() => router.push('/wallets/multisig/pending')}
        >
          <Clock className="h-5 w-5 text-orange-600" />
          <div className="text-left">
            <div className="font-semibold">Pending Transactions</div>
            <div className="text-xs text-gray-500">{pendingCount} awaiting approval</div>
          </div>
        </Button>
        <Button
          variant="outline"
          className="flex items-center gap-2 justify-start h-auto p-4"
          onClick={() => router.push('/wallets/multisig/policies')}
        >
          <Settings className="h-5 w-5 text-purple-600" />
          <div className="text-left">
            <div className="font-semibold">Approval Policies</div>
            <div className="text-xs text-gray-500">Configure signature rules</div>
          </div>
        </Button>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by wallet name or address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Wallets</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="frozen">Frozen</SelectItem>
                <SelectItem value="setup">In Setup</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Wallets Table */}
      <Card>
        <CardHeader>
          <CardTitle>Multi-Signature Wallets</CardTitle>
          <CardDescription>
            {filteredWallets.length} wallets found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Wallet</TableHead>
                <TableHead>Network</TableHead>
                <TableHead>Threshold</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Pending</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Activity</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredWallets.map((wallet) => (
                <TableRow key={wallet.id} className="cursor-pointer hover:bg-gray-50">
                  <TableCell>
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        <Shield className="h-4 w-4 text-blue-600" />
                        {wallet.name}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                        {wallet.address.slice(0, 10)}...{wallet.address.slice(-8)}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyAddress(wallet.address);
                          }}
                          className="hover:text-gray-700"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{wallet.network}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Key className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">{wallet.threshold}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">${wallet.balance.toLocaleString()}</div>
                  </TableCell>
                  <TableCell>
                    {wallet.pendingTransactions > 0 ? (
                      <Badge className="bg-orange-100 text-orange-700">
                        {wallet.pendingTransactions} pending
                      </Badge>
                    ) : (
                      <span className="text-sm text-gray-500">None</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(wallet.status)} variant="outline">
                      {wallet.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-500">{wallet.lastActivity}</div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toast.info(`Viewing ${wallet.name} details`)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
