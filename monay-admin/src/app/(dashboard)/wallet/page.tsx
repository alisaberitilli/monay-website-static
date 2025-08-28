'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Wallet, 
  Send, 
  Download, 
  Plus, 
  Eye, 
  EyeOff, 
  Copy, 
  QrCode, 
  ArrowUpRight, 
  ArrowDownLeft,
  CreditCard,
  Banknote,
  TrendingUp,
  History,
  RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';
import { AreaChart } from '@tremor/react';
import toast from 'react-hot-toast';

interface WalletAccount {
  id: string;
  name: string;
  type: 'main' | 'savings' | 'business' | 'crypto';
  balance: number;
  currency: string;
  status: 'active' | 'frozen' | 'pending';
  accountNumber: string;
  lastActivity: string;
}

interface Transaction {
  id: string;
  type: 'send' | 'receive' | 'deposit' | 'withdraw';
  amount: number;
  currency: string;
  description: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  from?: string;
  to?: string;
}

export default function WalletPage() {
  const [showBalances, setShowBalances] = useState(true);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [showAddWalletModal, setShowAddWalletModal] = useState(false);
  const [sendForm, setSendForm] = useState({
    amount: '',
    recipient: '',
    description: '',
    fromWallet: '',
  });
  const [newWallet, setNewWallet] = useState({
    name: '',
    type: 'main' as WalletAccount['type'],
  });

  const [wallets, setWallets] = useState<WalletAccount[]>([
    {
      id: '1',
      name: 'Main Wallet',
      type: 'main',
      balance: 18750.85,
      currency: 'USD',
      status: 'active',
      accountNumber: '****1234',
      lastActivity: '2024-08-23',
    },
    {
      id: '2',
      name: 'Savings Wallet',
      type: 'savings',
      balance: 6000.00,
      currency: 'USD',
      status: 'active',
      accountNumber: '****5678',
      lastActivity: '2024-08-22',
    },
    {
      id: '3',
      name: 'Business Account',
      type: 'business',
      balance: 25430.50,
      currency: 'USD',
      status: 'active',
      accountNumber: '****9012',
      lastActivity: '2024-08-23',
    },
  ]);

  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: '1',
      type: 'receive',
      amount: 2500.00,
      currency: 'USD',
      description: 'Payment from Client ABC',
      date: '2024-08-23',
      status: 'completed',
      from: 'client-abc@business.com',
    },
    {
      id: '2',
      type: 'send',
      amount: 1200.00,
      currency: 'USD',
      description: 'Office rent payment',
      date: '2024-08-23',
      status: 'completed',
      to: 'landlord@property.com',
    },
    {
      id: '3',
      type: 'deposit',
      amount: 5000.00,
      currency: 'USD',
      description: 'Bank transfer',
      date: '2024-08-22',
      status: 'completed',
    },
    {
      id: '4',
      type: 'send',
      amount: 750.00,
      currency: 'USD',
      description: 'Utility bill payment',
      date: '2024-08-22',
      status: 'pending',
      to: 'utilities@city.gov',
    },
  ]);

  const chartData = [
    { date: 'Aug 16', balance: 45230 },
    { date: 'Aug 17', balance: 47800 },
    { date: 'Aug 18', balance: 46100 },
    { date: 'Aug 19', balance: 48900 },
    { date: 'Aug 20', balance: 51200 },
    { date: 'Aug 21', balance: 49800 },
    { date: 'Aug 22', balance: 52400 },
    { date: 'Aug 23', balance: 50181 },
  ];

  const totalBalance = wallets.reduce((sum, wallet) => sum + wallet.balance, 0);
  const activeWallets = wallets.filter(w => w.status === 'active').length;
  const pendingTransactions = transactions.filter(t => t.status === 'pending').length;

  const handleSendMoney = () => {
    if (!sendForm.amount || !sendForm.recipient || !sendForm.fromWallet) {
      toast.error('Please fill in all required fields');
      return;
    }

    const amount = parseFloat(sendForm.amount);
    const wallet = wallets.find(w => w.id === sendForm.fromWallet);
    
    if (!wallet || wallet.balance < amount) {
      toast.error('Insufficient balance');
      return;
    }

    // Update wallet balance
    setWallets(prev => prev.map(w => 
      w.id === sendForm.fromWallet 
        ? { ...w, balance: w.balance - amount }
        : w
    ));

    // Add transaction
    const newTransaction: Transaction = {
      id: (transactions.length + 1).toString(),
      type: 'send',
      amount,
      currency: 'USD',
      description: sendForm.description || 'Money transfer',
      date: new Date().toISOString().split('T')[0],
      status: 'completed',
      to: sendForm.recipient,
    };

    setTransactions(prev => [newTransaction, ...prev]);
    setSendForm({ amount: '', recipient: '', description: '', fromWallet: '' });
    setShowSendModal(false);
    toast.success(`$${amount.toLocaleString()} sent successfully!`);
  };

  const handleAddWallet = () => {
    if (!newWallet.name) {
      toast.error('Please enter wallet name');
      return;
    }

    const wallet: WalletAccount = {
      id: (wallets.length + 1).toString(),
      name: newWallet.name,
      type: newWallet.type,
      balance: 0,
      currency: 'USD',
      status: 'active',
      accountNumber: `****${Math.floor(1000 + Math.random() * 9000)}`,
      lastActivity: new Date().toISOString().split('T')[0],
    };

    setWallets(prev => [...prev, wallet]);
    setNewWallet({ name: '', type: 'main' });
    setShowAddWalletModal(false);
    toast.success('Wallet created successfully!');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const getWalletIcon = (type: WalletAccount['type']) => {
    switch (type) {
      case 'main': return <Wallet className="w-5 h-5 text-blue-600" />;
      case 'savings': return <Banknote className="w-5 h-5 text-green-600" />;
      case 'business': return <CreditCard className="w-5 h-5 text-purple-600" />;
      case 'crypto': return <TrendingUp className="w-5 h-5 text-orange-600" />;
    }
  };

  const getTransactionIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'send': return <ArrowUpRight className="w-4 h-4 text-red-500" />;
      case 'receive': return <ArrowDownLeft className="w-4 h-4 text-green-500" />;
      case 'deposit': return <Download className="w-4 h-4 text-blue-500" />;
      case 'withdraw': return <ArrowUpRight className="w-4 h-4 text-orange-500" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed': case 'active': return 'success';
      case 'pending': return 'warning';
      case 'failed': case 'frozen': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-800">Wallet Management</h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowBalances(!showBalances)}
            >
              {showBalances ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
          </div>
          <p className="text-gray-600">Manage your digital wallets and transactions</p>
        </div>
        
        <div className="flex gap-2">
          {/* Send Money Modal */}
          <Dialog open={showSendModal} onOpenChange={setShowSendModal}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Send className="w-4 h-4" />
                Send
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Send className="w-5 h-5" />
                  Send Money
                </DialogTitle>
                <DialogDescription>Transfer money to another account</DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div>
                  <Label htmlFor="fromWallet">From Wallet*</Label>
                  <Select value={sendForm.fromWallet} onValueChange={(value) => 
                    setSendForm(prev => ({ ...prev, fromWallet: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select wallet" />
                    </SelectTrigger>
                    <SelectContent>
                      {wallets.filter(w => w.status === 'active').map((wallet) => (
                        <SelectItem key={wallet.id} value={wallet.id}>
                          {wallet.name} - ${wallet.balance.toLocaleString()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="recipient">Recipient Email/Phone*</Label>
                  <Input
                    id="recipient"
                    value={sendForm.recipient}
                    onChange={(e) => setSendForm(prev => ({ ...prev, recipient: e.target.value }))}
                    placeholder="john@example.com or +1234567890"
                  />
                </div>
                
                <div>
                  <Label htmlFor="amount">Amount (USD)*</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={sendForm.amount}
                    onChange={(e) => setSendForm(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={sendForm.description}
                    onChange={(e) => setSendForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="What's this for?"
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowSendModal(false)}>Cancel</Button>
                <Button onClick={handleSendMoney}>Send Money</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Receive Money Modal */}
          <Dialog open={showReceiveModal} onOpenChange={setShowReceiveModal}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Receive
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Receive Money
                </DialogTitle>
                <DialogDescription>Share your details to receive payments</DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="text-center">
                  <div className="w-32 h-32 bg-gray-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                    <QrCode className="w-16 h-16 text-gray-400" />
                  </div>
                  <p className="text-sm text-muted-foreground">QR Code for easy payments</p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-sm text-muted-foreground">admin@monay.com</p>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => copyToClipboard('admin@monay.com')}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">Wallet ID</p>
                      <p className="text-sm text-muted-foreground">MNAY-2024-001234</p>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => copyToClipboard('MNAY-2024-001234')}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Add Wallet Modal */}
          <Dialog open={showAddWalletModal} onOpenChange={setShowAddWalletModal}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Wallet
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Create New Wallet
                </DialogTitle>
                <DialogDescription>Add a new wallet to your account</DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div>
                  <Label htmlFor="walletName">Wallet Name*</Label>
                  <Input
                    id="walletName"
                    value={newWallet.name}
                    onChange={(e) => setNewWallet(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Emergency Fund"
                  />
                </div>
                
                <div>
                  <Label htmlFor="walletType">Wallet Type</Label>
                  <Select value={newWallet.type} onValueChange={(value: WalletAccount['type']) => 
                    setNewWallet(prev => ({ ...prev, type: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="main">Main Wallet</SelectItem>
                      <SelectItem value="savings">Savings</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="crypto">Crypto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddWalletModal(false)}>Cancel</Button>
                <Button onClick={handleAddWallet}>Create Wallet</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Balance</p>
                <p className="text-3xl font-bold text-green-600">
                  {showBalances ? `$${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '••••••'}
                </p>
              </div>
              <Wallet className="w-8 h-8 text-blue-500" />
            </div>
            <div className="mt-4 flex gap-2">
              <Button size="sm" onClick={() => setShowSendModal(true)}>
                <Send className="w-4 h-4 mr-1" />
                Send
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowReceiveModal(true)}>
                <Download className="w-4 h-4 mr-1" />
                Receive
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Wallets</p>
                <p className="text-2xl font-bold">{activeWallets}</p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{pendingTransactions}</p>
              </div>
              <Badge variant="warning">Pending</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Balance Chart and Wallets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Balance Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <AreaChart
                  className="h-full"
                  data={chartData}
                  index="date"
                  categories={["balance"]}
                  colors={["blue"]}
                  valueFormatter={(value) => `$${value.toLocaleString()}`}
                  showAnimation={true}
                  showGridLines={false}
                  showLegend={false}
                  curveType="monotone"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="w-5 h-5" />
                My Wallets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {wallets.map((wallet) => (
                  <div key={wallet.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                    <div className="flex items-center gap-3">
                      {getWalletIcon(wallet.type)}
                      <div>
                        <p className="font-medium">{wallet.name}</p>
                        <p className="text-sm text-muted-foreground">{wallet.accountNumber}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">
                        {showBalances ? `$${wallet.balance.toLocaleString()}` : '••••••'}
                      </p>
                      <Badge variant={getStatusBadgeVariant(wallet.status)} className="text-xs">
                        {wallet.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Recent Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.slice(0, 8).map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getTransactionIcon(transaction.type)}
                      <span className="capitalize">{transaction.type}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      {(transaction.from || transaction.to) && (
                        <p className="text-sm text-muted-foreground">
                          {transaction.from ? `From: ${transaction.from}` : `To: ${transaction.to}`}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`font-medium ${
                      transaction.type === 'receive' || transaction.type === 'deposit' 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {transaction.type === 'receive' || transaction.type === 'deposit' ? '+' : '-'}
                      ${transaction.amount.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(transaction.status)}>
                      {transaction.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(transaction.date).toLocaleDateString()}
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