'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  ArrowRightLeft,
  Send,
  Download,
  Upload,
  Wallet,
  Activity,
  Zap,
  Shield,
  Users,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  DollarSign,
  Layers,
  RefreshCw
} from 'lucide-react';

interface StablecoinBalance {
  [currency: string]: {
    amount: string;
    formatted: string;
    decimals: number;
  };
}

interface Transaction {
  id: string;
  type: string;
  amount: string;
  currency: string;
  status: string;
  createdAt: string;
  provider: string;
  txHash?: string;
  confirmationTime?: number;
}

interface ProviderStatus {
  available: boolean;
  lastCheck: number;
  error?: string;
  metrics?: {
    totalCalls: number;
    failureRate: string;
    avgLatency: string;
  };
  capabilities?: {
    currencies: string[];
    maxTps: number;
    avgFee: number;
    finality: number;
  };
}

export default function TempoOperations() {
  const [activeTab, setActiveTab] = useState('operations');
  const [walletAddress, setWalletAddress] = useState('');
  const [balances, setBalances] = useState<StablecoinBalance>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [providers, setProviders] = useState<{ [key: string]: ProviderStatus }>({});
  const [selectedProvider, setSelectedProvider] = useState<string>('auto');
  const [networkStats, setNetworkStats] = useState<any>({});

  // Form states
  const [mintAmount, setMintAmount] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('USDC');
  const [transferTo, setTransferTo] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [swapFrom, setSwapFrom] = useState('USDC');
  const [swapTo, setSwapTo] = useState('USDT');
  const [swapAmount, setSwapAmount] = useState('');

  // Batch transfer states
  const [batchRecipients, setBatchRecipients] = useState([
    { address: '', amount: '', currency: 'USDC' }
  ]);

  const supportedCurrencies = ['USDC', 'USDT', 'PYUSD', 'EURC', 'USDB'];

  useEffect(() => {
    fetchProviderStatus();
    fetchNetworkStats();
    const interval = setInterval(() => {
      fetchProviderStatus();
      fetchNetworkStats();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchProviderStatus = async () => {
    try {
      const response = await fetch('/api/stablecoin/providers', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        }
      });
      const data = await response.json();
      if (data.success) {
        setProviders(data.providers);
      }
    } catch (error) {
      console.error('Error fetching providers:', error);
    }
  };

  const fetchNetworkStats = async () => {
    try {
      const response = await fetch('/api/stablecoin/network-stats?provider=all', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        }
      });
      const data = await response.json();
      if (data.success) {
        setNetworkStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching network stats:', error);
    }
  };

  const createWallet = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/stablecoin/wallet/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          provider: selectedProvider,
          metadata: { source: 'tempo-ui' }
        }),
      });

      const data = await response.json();
      if (data.success) {
        setWalletAddress(data.wallet.address);
        setMessage({ type: 'success', text: `Wallet created on ${data.provider}` });
        fetchBalances(data.wallet.address);
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const fetchBalances = async (address: string) => {
    try {
      const response = await fetch(`/api/stablecoin/balance/${address}?provider=${selectedProvider}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        }
      });
      const data = await response.json();
      if (data.success) {
        setBalances(data.balance.balances || {});
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  const handleMint = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/stablecoin/mint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          walletId: walletAddress,
          amount: parseFloat(mintAmount),
          currency: selectedCurrency,
          provider: selectedProvider
        }),
      });

      const data = await response.json();
      if (data.success) {
        setMessage({ type: 'success', text: `Minted ${mintAmount} ${selectedCurrency} via ${data.transaction.provider}` });
        setMintAmount('');
        fetchBalances(walletAddress);
        fetchTransactions();
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/stablecoin/transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          fromWalletId: walletAddress,
          toAddress: transferTo,
          amount: parseFloat(transferAmount),
          currency: selectedCurrency,
          provider: selectedProvider
        }),
      });

      const data = await response.json();
      if (data.success) {
        setMessage({ type: 'success', text: `Transferred ${transferAmount} ${selectedCurrency} via ${data.transaction.provider}` });
        setTransferAmount('');
        setTransferTo('');
        fetchBalances(walletAddress);
        fetchTransactions();
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleSwap = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/stablecoin/swap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          walletId: walletAddress,
          fromCurrency: swapFrom,
          toCurrency: swapTo,
          amount: parseFloat(swapAmount)
        }),
      });

      const data = await response.json();
      if (data.success) {
        setMessage({ type: 'success', text: `Swapped ${swapAmount} ${swapFrom} to ${data.swap.outputAmount} ${swapTo}` });
        setSwapAmount('');
        fetchBalances(walletAddress);
        fetchTransactions();
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleBatchTransfer = async () => {
    setLoading(true);
    try {
      const transfers = batchRecipients
        .filter(r => r.address && r.amount)
        .map(r => ({
          toAddress: r.address,
          amount: parseFloat(r.amount),
          currency: r.currency
        }));

      const response = await fetch('/api/stablecoin/batch-transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          fromWalletId: walletAddress,
          transfers
        }),
      });

      const data = await response.json();
      if (data.success) {
        setMessage({ type: 'success', text: `Batch transfer completed: ${transfers.length} transfers` });
        setBatchRecipients([{ address: '', amount: '', currency: 'USDC' }]);
        fetchBalances(walletAddress);
        fetchTransactions();
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    if (!walletAddress) return;

    try {
      const response = await fetch(`/api/stablecoin/transactions/${walletAddress}?limit=10&provider=${selectedProvider}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        }
      });
      const data = await response.json();
      if (data.success) {
        setTransactions(data.transactions.transactions || []);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const addBatchRecipient = () => {
    setBatchRecipients([...batchRecipients, { address: '', amount: '', currency: 'USDC' }]);
  };

  const updateBatchRecipient = (index: number, field: string, value: string) => {
    const updated = [...batchRecipients];
    updated[index] = { ...updated[index], [field]: value };
    setBatchRecipients(updated);
  };

  const removeBatchRecipient = (index: number) => {
    setBatchRecipients(batchRecipients.filter((_, i) => i !== index));
  };

  const getProviderBadge = (provider: string) => {
    const status = providers[provider];
    if (!status) return null;

    return (
      <Badge variant={status.available ? 'default' : 'destructive'}>
        {provider.toUpperCase()}
        {status.available ? (
          <CheckCircle2 className="ml-1 h-3 w-3" />
        ) : (
          <AlertCircle className="ml-1 h-3 w-3" />
        )}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center">
          <Layers className="mr-3 h-8 w-8 text-blue-600" />
          Tempo Stablecoin Operations
        </h1>
        <p className="text-gray-600">
          Multi-provider stablecoin management with Tempo (100,000+ TPS) as primary
        </p>
      </div>

      {/* Provider Status Bar */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="font-semibold">Active Providers:</span>
              {getProviderBadge('tempo')}
              {getProviderBadge('circle')}
            </div>
            <div className="flex items-center space-x-4">
              <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto (Smart)</SelectItem>
                  <SelectItem value="tempo">Tempo (Primary)</SelectItem>
                  <SelectItem value="circle">Circle (Fallback)</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={fetchProviderStatus}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {message.text && (
        <Alert className={`mb-6 ${message.type === 'error' ? 'border-red-500' : 'border-green-500'}`}>
          <AlertDescription className="flex items-center">
            {message.type === 'error' ? (
              <AlertCircle className="mr-2 h-4 w-4 text-red-500" />
            ) : (
              <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
            )}
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="operations">Operations</TabsTrigger>
          <TabsTrigger value="batch">Batch Transfer</TabsTrigger>
          <TabsTrigger value="swap">Swap</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="operations">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Wallet Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Wallet className="mr-2 h-5 w-5" />
                  Wallet Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!walletAddress ? (
                  <Button onClick={createWallet} disabled={loading} className="w-full">
                    <Wallet className="mr-2 h-4 w-4" />
                    Create Wallet
                  </Button>
                ) : (
                  <div>
                    <Label>Wallet Address</Label>
                    <div className="flex items-center space-x-2">
                      <Input value={walletAddress} readOnly className="font-mono text-sm" />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchBalances(walletAddress)}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {Object.keys(balances).length > 0 && (
                  <div className="space-y-2">
                    <Label>Balances</Label>
                    {Object.entries(balances).map(([currency, balance]) => (
                      <div key={currency} className="flex justify-between p-2 bg-gray-50 rounded">
                        <span className="font-medium">{currency}</span>
                        <span>{balance.formatted}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Mint Stablecoins */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Upload className="mr-2 h-5 w-5" />
                  Mint Stablecoins
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Currency</Label>
                  <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {supportedCurrencies.map(currency => (
                        <SelectItem key={currency} value={currency}>
                          {currency}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={mintAmount}
                    onChange={(e) => setMintAmount(e.target.value)}
                  />
                </div>
                <Button
                  onClick={handleMint}
                  disabled={loading || !walletAddress || !mintAmount}
                  className="w-full"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Mint {selectedCurrency}
                </Button>
              </CardContent>
            </Card>

            {/* Transfer */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Send className="mr-2 h-5 w-5" />
                  Transfer
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>To Address</Label>
                    <Input
                      placeholder="0x..."
                      value={transferTo}
                      onChange={(e) => setTransferTo(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Amount</Label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={transferAmount}
                      onChange={(e) => setTransferAmount(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Currency</Label>
                    <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
                      <SelectTrigger>
                        <SelectValue placeholder="Currency" />
                      </SelectTrigger>
                      <SelectContent>
                        {supportedCurrencies.map(currency => (
                          <SelectItem key={currency} value={currency}>
                            {currency}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button
                  onClick={handleTransfer}
                  disabled={loading || !walletAddress || !transferTo || !transferAmount}
                  className="w-full"
                >
                  <Send className="mr-2 h-4 w-4" />
                  Transfer
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="batch">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5" />
                Batch Transfer (Tempo Native)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {batchRecipients.map((recipient, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Input
                    placeholder="Address"
                    value={recipient.address}
                    onChange={(e) => updateBatchRecipient(index, 'address', e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    placeholder="Amount"
                    value={recipient.amount}
                    onChange={(e) => updateBatchRecipient(index, 'amount', e.target.value)}
                    className="w-32"
                  />
                  <Select
                    value={recipient.currency}
                    onValueChange={(value) => updateBatchRecipient(index, 'currency', value)}
                  >
                    <SelectTrigger className="w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {supportedCurrencies.map(currency => (
                        <SelectItem key={currency} value={currency}>
                          {currency}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeBatchRecipient(index)}
                    disabled={batchRecipients.length === 1}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <div className="flex justify-between">
                <Button variant="outline" onClick={addBatchRecipient}>
                  Add Recipient
                </Button>
                <Button
                  onClick={handleBatchTransfer}
                  disabled={loading || !walletAddress || batchRecipients.some(r => !r.address || !r.amount)}
                >
                  <Users className="mr-2 h-4 w-4" />
                  Send Batch ({batchRecipients.filter(r => r.address && r.amount).length})
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="swap">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ArrowRightLeft className="mr-2 h-5 w-5" />
                Stablecoin Swap (Tempo Native)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>From Currency</Label>
                  <Select value={swapFrom} onValueChange={setSwapFrom}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {supportedCurrencies.map(currency => (
                        <SelectItem key={currency} value={currency}>
                          {currency}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>To Currency</Label>
                  <Select value={swapTo} onValueChange={setSwapTo}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {supportedCurrencies
                        .filter(c => c !== swapFrom)
                        .map(currency => (
                          <SelectItem key={currency} value={currency}>
                            {currency}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={swapAmount}
                    onChange={(e) => setSwapAmount(e.target.value)}
                  />
                </div>
              </div>
              <Alert>
                <AlertDescription>
                  <Zap className="inline mr-2 h-4 w-4" />
                  Native AMM swap with near-instant execution and minimal fees
                </AlertDescription>
              </Alert>
              <Button
                onClick={handleSwap}
                disabled={loading || !walletAddress || !swapAmount || swapFrom === swapTo}
                className="w-full"
              >
                <ArrowRightLeft className="mr-2 h-4 w-4" />
                Swap {swapFrom} → {swapTo}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Network Stats */}
            {Object.entries(networkStats).map(([provider, stats]: [string, any]) => (
              <Card key={provider}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center">
                      <Activity className="mr-2 h-5 w-5" />
                      {provider.toUpperCase()} Network
                    </span>
                    {stats.status && (
                      <Badge variant={stats.status === 'operational' ? 'default' : 'destructive'}>
                        {stats.status}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {stats.error ? (
                    <Alert>
                      <AlertDescription>{stats.error}</AlertDescription>
                    </Alert>
                  ) : (
                    <>
                      <div className="flex justify-between">
                        <span>TPS Capability</span>
                        <span className="font-bold">{stats.tps?.toLocaleString() || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Finality</span>
                        <span className="font-bold">{stats.finality || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Gas Price</span>
                        <span className="font-bold">{stats.gasPrice || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Block Number</span>
                        <span className="font-bold">{stats.blockNumber?.toLocaleString() || 'N/A'}</span>
                      </div>
                      {stats.features && (
                        <div className="pt-2">
                          <Label>Features</Label>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {stats.features.slice(0, 4).map((feature: string) => (
                              <Badge key={feature} variant="secondary" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            ))}

            {/* Transaction History */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                {transactions.length > 0 ? (
                  <div className="space-y-2">
                    {transactions.map((tx) => (
                      <div key={tx.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div>
                          <div className="font-medium">{tx.type.toUpperCase()}</div>
                          <div className="text-sm text-gray-500">{tx.id}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{tx.amount} {tx.currency}</div>
                          <Badge variant={tx.status === 'confirmed' ? 'default' : 'secondary'}>
                            {tx.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    No transactions yet
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}