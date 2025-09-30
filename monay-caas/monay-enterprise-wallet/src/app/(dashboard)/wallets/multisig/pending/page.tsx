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
import { Clock, AlertTriangle, CheckCircle, XCircle, Eye, ExternalLink, Users, Shield, Filter, Search, RefreshCw, Calendar, DollarSign } from 'lucide-react';

interface PendingTransaction {
  id: string;
  type: 'transfer' | 'mint' | 'burn' | 'approval' | 'configuration';
  description: string;
  amount?: string;
  recipient?: string;
  initiator: string;
  initiatorRole: string;
  requiredSignatures: number;
  currentSignatures: number;
  signers: Array<{
    name: string;
    address: string;
    status: 'signed' | 'pending' | 'rejected';
    signedAt?: string;
  }>;
  createdAt: string;
  expiresAt: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'expired' | 'cancelled';
  walletId: string;
  walletName: string;
  network: string;
  estimatedGas?: string;
  nonce: number;
}

interface MultisigWallet {
  id: string;
  name: string;
  address: string;
  requiredSignatures: number;
  totalSigners: number;
  pendingCount: number;
  network: string;
}

export default function MultisigPendingPage() {
  const [selectedWallet, setSelectedWallet] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isTransactionDetailsOpen, setIsTransactionDetailsOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<PendingTransaction | null>(null);

  // Mock data for multisig wallets
  const multisigWallets: MultisigWallet[] = [
    {
      id: '1',
      name: 'Executive Treasury Wallet',
      address: '0x1234567890123456789012345678901234567890',
      requiredSignatures: 3,
      totalSigners: 5,
      pendingCount: 4,
      network: 'Base L2'
    },
    {
      id: '2',
      name: 'Operations Multi-Sig',
      address: '0x2345678901234567890123456789012345678901',
      requiredSignatures: 2,
      totalSigners: 4,
      pendingCount: 2,
      network: 'Base L2'
    },
    {
      id: '3',
      name: 'Compliance Escrow Wallet',
      address: '0x3456789012345678901234567890123456789012',
      requiredSignatures: 4,
      totalSigners: 6,
      pendingCount: 1,
      network: 'Base L2'
    }
  ];

  // Mock data for pending transactions
  const pendingTransactions: PendingTransaction[] = [
    {
      id: '1',
      type: 'transfer',
      description: 'Transfer to vendor payment',
      amount: '$125,000.00 USDC',
      recipient: '0xabcd1234567890123456789012345678901234ef',
      initiator: 'John Smith',
      initiatorRole: 'CEO',
      requiredSignatures: 3,
      currentSignatures: 1,
      signers: [
        { name: 'John Smith', address: '0xabcd...34ef', status: 'signed', signedAt: '2024-01-29 14:30' },
        { name: 'Sarah Johnson', address: '0xbcde...45f0', status: 'pending' },
        { name: 'Michael Brown', address: '0xcdef...56f1', status: 'pending' },
        { name: 'Lisa Chen', address: '0xdef0...67f2', status: 'pending' },
        { name: 'David Wilson', address: '0xef01...78f3', status: 'pending' }
      ],
      createdAt: '2024-01-29 14:30',
      expiresAt: '2024-02-05 14:30',
      priority: 'high',
      status: 'pending',
      walletId: '1',
      walletName: 'Executive Treasury Wallet',
      network: 'Base L2',
      estimatedGas: '0.0012 ETH',
      nonce: 142
    },
    {
      id: '2',
      type: 'mint',
      description: 'Mint new USDXM tokens for client onboarding',
      amount: '$500,000.00 USDXM',
      initiator: 'Sarah Johnson',
      initiatorRole: 'CFO',
      requiredSignatures: 3,
      currentSignatures: 2,
      signers: [
        { name: 'John Smith', address: '0xabcd...34ef', status: 'signed', signedAt: '2024-01-29 16:15' },
        { name: 'Sarah Johnson', address: '0xbcde...45f0', status: 'signed', signedAt: '2024-01-29 16:45' },
        { name: 'Michael Brown', address: '0xcdef...56f1', status: 'pending' },
        { name: 'Lisa Chen', address: '0xdef0...67f2', status: 'pending' },
        { name: 'David Wilson', address: '0xef01...78f3', status: 'pending' }
      ],
      createdAt: '2024-01-29 16:45',
      expiresAt: '2024-02-05 16:45',
      priority: 'critical',
      status: 'pending',
      walletId: '1',
      walletName: 'Executive Treasury Wallet',
      network: 'Base L2',
      estimatedGas: '0.0018 ETH',
      nonce: 143
    },
    {
      id: '3',
      type: 'approval',
      description: 'Approve spending limit increase for department wallets',
      initiator: 'Michael Brown',
      initiatorRole: 'CTO',
      requiredSignatures: 2,
      currentSignatures: 1,
      signers: [
        { name: 'John Smith', address: '0xabcd...34ef', status: 'pending' },
        { name: 'Sarah Johnson', address: '0xbcde...45f0', status: 'pending' },
        { name: 'Michael Brown', address: '0xcdef...56f1', status: 'signed', signedAt: '2024-01-29 12:15' },
        { name: 'Lisa Chen', address: '0xdef0...67f2', status: 'pending' }
      ],
      createdAt: '2024-01-29 12:15',
      expiresAt: '2024-02-05 12:15',
      priority: 'medium',
      status: 'pending',
      walletId: '2',
      walletName: 'Operations Multi-Sig',
      network: 'Base L2',
      estimatedGas: '0.0008 ETH',
      nonce: 87
    },
    {
      id: '4',
      type: 'configuration',
      description: 'Update multisig threshold to 4 of 6 signers',
      initiator: 'John Smith',
      initiatorRole: 'CEO',
      requiredSignatures: 4,
      currentSignatures: 2,
      signers: [
        { name: 'John Smith', address: '0xabcd...34ef', status: 'signed', signedAt: '2024-01-28 10:00' },
        { name: 'Sarah Johnson', address: '0xbcde...45f0', status: 'signed', signedAt: '2024-01-29 09:30' },
        { name: 'Michael Brown', address: '0xcdef...56f1', status: 'pending' },
        { name: 'Lisa Chen', address: '0xdef0...67f2', status: 'pending' },
        { name: 'David Wilson', address: '0xef01...78f3', status: 'pending' },
        { name: 'Emily Davis', address: '0xf012...89f4', status: 'pending' }
      ],
      createdAt: '2024-01-28 10:00',
      expiresAt: '2024-02-04 10:00',
      priority: 'high',
      status: 'pending',
      walletId: '3',
      walletName: 'Compliance Escrow Wallet',
      network: 'Base L2',
      estimatedGas: '0.0025 ETH',
      nonce: 23
    },
    {
      id: '5',
      type: 'transfer',
      description: 'Payroll distribution - January 2024',
      amount: '$280,000.00 USDC',
      recipient: 'Multiple recipients (batch)',
      initiator: 'Sarah Johnson',
      initiatorRole: 'CFO',
      requiredSignatures: 2,
      currentSignatures: 0,
      signers: [
        { name: 'John Smith', address: '0xabcd...34ef', status: 'pending' },
        { name: 'Sarah Johnson', address: '0xbcde...45f0', status: 'pending' },
        { name: 'Michael Brown', address: '0xcdef...56f1', status: 'pending' },
        { name: 'Lisa Chen', address: '0xdef0...67f2', status: 'pending' }
      ],
      createdAt: '2024-01-29 18:00',
      expiresAt: '2024-01-31 23:59',
      priority: 'critical',
      status: 'pending',
      walletId: '2',
      walletName: 'Operations Multi-Sig',
      network: 'Base L2',
      estimatedGas: '0.0045 ETH',
      nonce: 88
    },
    {
      id: '6',
      type: 'burn',
      description: 'Burn excess USDXM tokens after client redemption',
      amount: '$75,000.00 USDXM',
      initiator: 'Michael Brown',
      initiatorRole: 'CTO',
      requiredSignatures: 3,
      currentSignatures: 1,
      signers: [
        { name: 'John Smith', address: '0xabcd...34ef', status: 'pending' },
        { name: 'Sarah Johnson', address: '0xbcde...45f0', status: 'pending' },
        { name: 'Michael Brown', address: '0xcdef...56f1', status: 'signed', signedAt: '2024-01-27 15:45' },
        { name: 'Lisa Chen', address: '0xdef0...67f2', status: 'pending' },
        { name: 'David Wilson', address: '0xef01...78f3', status: 'pending' }
      ],
      createdAt: '2024-01-27 15:45',
      expiresAt: '2024-02-03 15:45',
      priority: 'low',
      status: 'pending',
      walletId: '1',
      walletName: 'Executive Treasury Wallet',
      network: 'Base L2',
      estimatedGas: '0.0015 ETH',
      nonce: 141
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'expired':
        return <Badge className="bg-red-100 text-red-800 border-red-200"><XCircle className="w-3 h-3 mr-1" />Expired</Badge>;
      case 'cancelled':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200"><XCircle className="w-3 h-3 mr-1" />Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Critical</Badge>;
      case 'high':
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200">High</Badge>;
      case 'medium':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Medium</Badge>;
      case 'low':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Low</Badge>;
      default:
        return <Badge variant="secondary">{priority}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'transfer':
        return <ExternalLink className="w-4 h-4" />;
      case 'mint':
        return <DollarSign className="w-4 h-4" />;
      case 'burn':
        return <XCircle className="w-4 h-4" />;
      case 'approval':
        return <CheckCircle className="w-4 h-4" />;
      case 'configuration':
        return <Shield className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const filteredTransactions = pendingTransactions.filter(tx => {
    const matchesWallet = selectedWallet === 'all' || tx.walletId === selectedWallet;
    const matchesStatus = filterStatus === 'all' || tx.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || tx.priority === filterPriority;
    const matchesSearch = searchTerm === '' ||
      tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.initiator.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.amount?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesWallet && matchesStatus && matchesPriority && matchesSearch;
  });

  const handleViewTransaction = (transaction: PendingTransaction) => {
    setSelectedTransaction(transaction);
    setIsTransactionDetailsOpen(true);
  };

  const totalPendingAmount = filteredTransactions
    .filter(tx => tx.amount && tx.type !== 'burn')
    .reduce((total, tx) => {
      const amount = parseFloat(tx.amount?.replace(/[$,]/g, '') || '0');
      return total + amount;
    }, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pending Transactions</h1>
          <p className="text-gray-600">Review and approve pending multisig transactions</p>
        </div>
        <Button
          className="bg-orange-400 hover:bg-orange-500 text-white border-orange-400 hover:border-orange-500"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Pending</p>
                <p className="text-2xl font-bold">{filteredTransactions.length}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Critical Priority</p>
                <p className="text-2xl font-bold text-red-600">
                  {filteredTransactions.filter(tx => tx.priority === 'critical').length}
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
                <p className="text-sm text-gray-600">Pending Value</p>
                <p className="text-xl font-bold">${totalPendingAmount.toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Wallets</p>
                <p className="text-2xl font-bold">{multisigWallets.length}</p>
              </div>
              <Shield className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              <Label>Filters:</Label>
            </div>
            <Select value={selectedWallet} onValueChange={setSelectedWallet}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Wallets" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Wallets</SelectItem>
                {multisigWallets.map((wallet) => (
                  <SelectItem key={wallet.id} value={wallet.id}>
                    {wallet.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Pending Transactions ({filteredTransactions.length})
          </CardTitle>
          <CardDescription>
            Transactions awaiting signatures from authorized signers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction</TableHead>
                <TableHead>Wallet</TableHead>
                <TableHead>Initiator</TableHead>
                <TableHead>Signatures</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    <div className="flex items-start gap-3">
                      <div className="mt-1">{getTypeIcon(transaction.type)}</div>
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        {transaction.amount && (
                          <p className="text-sm text-gray-600">{transaction.amount}</p>
                        )}
                        {transaction.recipient && (
                          <p className="text-xs text-gray-500">To: {transaction.recipient}</p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm">{transaction.walletName}</p>
                      <p className="text-xs text-gray-600">{transaction.network}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{transaction.initiator}</p>
                      <p className="text-sm text-gray-600">{transaction.initiatorRole}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-center">
                      <p className="font-medium">
                        {transaction.currentSignatures}/{transaction.requiredSignatures}
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div
                          className="bg-orange-400 h-2 rounded-full"
                          style={{
                            width: `${(transaction.currentSignatures / transaction.requiredSignatures) * 100}%`
                          }}
                        ></div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getPriorityBadge(transaction.priority)}</TableCell>
                  <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>{new Date(transaction.expiresAt).toLocaleDateString()}</p>
                      <p className="text-gray-600">{new Date(transaction.expiresAt).toLocaleTimeString()}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewTransaction(transaction)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        className="bg-orange-400 hover:bg-orange-500 text-white border-orange-400 hover:border-orange-500"
                      >
                        Sign
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Transaction Details Dialog */}
      <Dialog open={isTransactionDetailsOpen} onOpenChange={setIsTransactionDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogDescription>
              Review transaction details and signer status
            </DialogDescription>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-6">
              {/* Transaction Info */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label>Transaction Type</Label>
                    <div className="flex items-center gap-2 mt-1">
                      {getTypeIcon(selectedTransaction.type)}
                      <span className="font-medium capitalize">{selectedTransaction.type}</span>
                    </div>
                  </div>
                  <div>
                    <Label>Description</Label>
                    <p className="font-medium">{selectedTransaction.description}</p>
                  </div>
                  {selectedTransaction.amount && (
                    <div>
                      <Label>Amount</Label>
                      <p className="font-medium text-lg">{selectedTransaction.amount}</p>
                    </div>
                  )}
                  {selectedTransaction.recipient && (
                    <div>
                      <Label>Recipient</Label>
                      <p className="font-mono text-sm bg-gray-100 p-2 rounded">{selectedTransaction.recipient}</p>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  <div>
                    <Label>Wallet</Label>
                    <p className="font-medium">{selectedTransaction.walletName}</p>
                    <p className="text-sm text-gray-600">{selectedTransaction.network}</p>
                  </div>
                  <div>
                    <Label>Initiator</Label>
                    <p className="font-medium">{selectedTransaction.initiator}</p>
                    <p className="text-sm text-gray-600">{selectedTransaction.initiatorRole}</p>
                  </div>
                  <div>
                    <Label>Created</Label>
                    <p className="font-medium">{new Date(selectedTransaction.createdAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <Label>Expires</Label>
                    <p className="font-medium">{new Date(selectedTransaction.expiresAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Signature Progress */}
              <div>
                <Label>Signature Progress</Label>
                <div className="mt-2">
                  <div className="flex justify-between text-sm mb-2">
                    <span>{selectedTransaction.currentSignatures} of {selectedTransaction.requiredSignatures} signatures</span>
                    <span>{Math.round((selectedTransaction.currentSignatures / selectedTransaction.requiredSignatures) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-orange-400 h-3 rounded-full"
                      style={{
                        width: `${(selectedTransaction.currentSignatures / selectedTransaction.requiredSignatures) * 100}%`
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Signers Status */}
              <div>
                <Label>Signers Status</Label>
                <div className="mt-2 space-y-2">
                  {selectedTransaction.signers.map((signer, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          signer.status === 'signed' ? 'bg-green-500' :
                          signer.status === 'rejected' ? 'bg-red-500' : 'bg-gray-300'
                        }`} />
                        <div>
                          <p className="font-medium">{signer.name}</p>
                          <p className="text-sm text-gray-600">{signer.address}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge
                          className={
                            signer.status === 'signed' ? 'bg-green-100 text-green-800 border-green-200' :
                            signer.status === 'rejected' ? 'bg-red-100 text-red-800 border-red-200' :
                            'bg-yellow-100 text-yellow-800 border-yellow-200'
                          }
                        >
                          {signer.status === 'signed' ? <CheckCircle className="w-3 h-3 mr-1" /> :
                           signer.status === 'rejected' ? <XCircle className="w-3 h-3 mr-1" /> :
                           <Clock className="w-3 h-3 mr-1" />}
                          {signer.status}
                        </Badge>
                        {signer.signedAt && (
                          <p className="text-xs text-gray-500 mt-1">{signer.signedAt}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Technical Details */}
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <Label>Nonce</Label>
                  <p className="font-medium">{selectedTransaction.nonce}</p>
                </div>
                {selectedTransaction.estimatedGas && (
                  <div>
                    <Label>Estimated Gas</Label>
                    <p className="font-medium">{selectedTransaction.estimatedGas}</p>
                  </div>
                )}
                <div>
                  <Label>Priority</Label>
                  <div className="mt-1">{getPriorityBadge(selectedTransaction.priority)}</div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 justify-end">
                <Button variant="outline">
                  Cancel Transaction
                </Button>
                <Button
                  className="bg-orange-400 hover:bg-orange-500 text-white border-orange-400 hover:border-orange-500"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Sign Transaction
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}