'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  ArrowUpCircle,
  ArrowDownCircle,
  ArrowRightCircle,
  DollarSign,
  RefreshCw,
  Info,
  Wallet,
  Building,
  Shield,
  TrendingUp,
  Clock,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

interface USDCBalance {
  walletId: string;
  address: string;
  usdcBalance: number;
  status: string;
  balances: Array<{
    currency: string;
    amount: number;
    updateTime: string;
  }>;
}

interface CircleWallet {
  walletId: string;
  address: string;
  blockchain: string;
  type: string;
  status: string;
}

export default function USDCOperations() {
  const [balance, setBalance] = useState<USDCBalance | null>(null);
  const [wallet, setWallet] = useState<CircleWallet | null>(null);
  const [loading, setLoading] = useState(false);
  const [mintAmount, setMintAmount] = useState('');
  const [burnAmount, setBurnAmount] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferAddress, setTransferAddress] = useState('');
  const [bankAccount, setBankAccount] = useState({
    accountNumber: '',
    routingNumber: '',
    accountName: '',
    bankName: ''
  });
  const [fees, setFees] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('balance');
  const [processingStatus, setProcessingStatus] = useState('');

  useEffect(() => {
    fetchWalletInfo();
  }, []);

  const fetchWalletInfo = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');

      // Fetch user's wallet
      const walletRes = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/circle/wallets/me`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (walletRes.data.success) {
        setWallet(walletRes.data.data);
        setBalance(walletRes.data.data);
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        // Create wallet if not exists
        await createWallet();
      } else {
        toast.error('Failed to fetch wallet information');
      }
    } finally {
      setLoading(false);
    }
  };

  const createWallet = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/circle/wallets`,
        { type: 'enterprise' },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        setWallet(res.data.data);
        toast.success('Circle wallet created successfully');
        fetchWalletInfo();
      }
    } catch (error) {
      toast.error('Failed to create wallet');
    }
  };

  const handleMintUSDC = async () => {
    try {
      setLoading(true);
      setProcessingStatus('Initiating USD deposit to mint USDC...');
      const token = localStorage.getItem('authToken');

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/circle/mint`,
        {
          amount: parseFloat(mintAmount),
          sourceAccount: {
            type: 'wire',
            id: 'default' // This would be the linked bank account
          }
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        toast.success(`Minting ${mintAmount} USDC initiated`);
        setMintAmount('');
        setProcessingStatus('Mint operation initiated. Processing...');
        setTimeout(() => {
          fetchWalletInfo();
          setProcessingStatus('');
        }, 3000);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Mint operation failed');
      setProcessingStatus('');
    } finally {
      setLoading(false);
    }
  };

  const handleBurnUSDC = async () => {
    try {
      setLoading(true);
      setProcessingStatus('Initiating USDC burn to receive USD...');
      const token = localStorage.getItem('authToken');

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/circle/burn`,
        {
          amount: parseFloat(burnAmount),
          destinationAccount: {
            type: 'wire',
            id: 'default' // This would be the linked bank account
          }
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        toast.success(`Burning ${burnAmount} USDC initiated`);
        setBurnAmount('');
        setProcessingStatus('Burn operation initiated. USD will be sent to your bank...');
        setTimeout(() => {
          fetchWalletInfo();
          setProcessingStatus('');
        }, 3000);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Burn operation failed');
      setProcessingStatus('');
    } finally {
      setLoading(false);
    }
  };

  const handleTransferUSDC = async () => {
    try {
      setLoading(true);
      setProcessingStatus('Processing USDC transfer...');
      const token = localStorage.getItem('authToken');

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/circle/transfer`,
        {
          amount: parseFloat(transferAmount),
          toAddress: transferAddress
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        toast.success(`Transfer of ${transferAmount} USDC initiated`);
        setTransferAmount('');
        setTransferAddress('');
        setProcessingStatus('Transfer initiated. Confirming on blockchain...');
        setTimeout(() => {
          fetchWalletInfo();
          setProcessingStatus('');
        }, 5000);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Transfer failed');
      setProcessingStatus('');
    } finally {
      setLoading(false);
    }
  };

  const linkBankAccount = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/circle/bank-accounts`,
        bankAccount,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        toast.success('Bank account linked successfully');
        setBankAccount({
          accountNumber: '',
          routingNumber: '',
          accountName: '',
          bankName: ''
        });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to link bank account');
    } finally {
      setLoading(false);
    }
  };

  const estimateFees = async (operation: string, amount: string) => {
    if (!amount || parseFloat(amount) <= 0) return;

    try {
      const token = localStorage.getItem('authToken');
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/circle/fees/estimate`,
        {
          operation,
          amount: parseFloat(amount),
          chain: 'ETH'
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        setFees(res.data.data);
      }
    } catch (error) {
      console.error('Failed to estimate fees');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">USDC Operations</h2>
          <p className="text-gray-500">Manage USD Coin minting, burning, and transfers</p>
        </div>
        <Badge variant="outline" className="gap-2">
          <Shield className="w-4 h-4" />
          Circle Integration Active
        </Badge>
      </div>

      {/* Wallet Status Card */}
      {wallet && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              Circle Wallet
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-sm text-gray-500">Wallet Address</Label>
                <p className="font-mono text-sm truncate">{wallet.address}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">Blockchain</Label>
                <p className="font-semibold">{wallet.blockchain}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">Status</Label>
                <Badge variant={wallet.status === 'active' ? 'default' : 'secondary'}>
                  {wallet.status}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Balance Card */}
      {balance && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>USDC Balance</CardTitle>
              <CardDescription>Current holdings and liquidity</CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={fetchWalletInfo}>
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950 rounded-lg">
              <div className="flex items-center gap-3">
                <DollarSign className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-3xl font-bold">${balance.usdcBalance.toFixed(2)}</p>
                  <p className="text-sm text-gray-500">Available USDC</p>
                </div>
              </div>
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Operations Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Operations</CardTitle>
          <CardDescription>Mint, burn, or transfer USDC</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="balance">Balance</TabsTrigger>
              <TabsTrigger value="mint">Mint</TabsTrigger>
              <TabsTrigger value="burn">Burn</TabsTrigger>
              <TabsTrigger value="transfer">Transfer</TabsTrigger>
            </TabsList>

            <TabsContent value="balance" className="space-y-4">
              <Alert>
                <Info className="w-4 h-4" />
                <AlertTitle>USDC Balance Management</AlertTitle>
                <AlertDescription>
                  Your USDC balance represents stablecoins backed 1:1 with USD reserves held by Circle.
                  Use mint to deposit USD and receive USDC, or burn to redeem USDC for USD.
                </AlertDescription>
              </Alert>

              {balance?.balances.map((b, idx) => (
                <div key={idx} className="flex justify-between p-3 border rounded">
                  <span className="font-medium">{b.currency}</span>
                  <span>{b.amount.toFixed(2)}</span>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="mint" className="space-y-4">
              <Alert>
                <ArrowDownCircle className="w-4 h-4" />
                <AlertTitle>Mint USDC</AlertTitle>
                <AlertDescription>
                  Deposit USD from your bank account to mint an equivalent amount of USDC.
                  This is a 1:1 conversion with minimal fees.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="mintAmount">Amount (USD)</Label>
                  <Input
                    id="mintAmount"
                    type="number"
                    placeholder="Enter USD amount to deposit"
                    value={mintAmount}
                    onChange={(e) => {
                      setMintAmount(e.target.value);
                      estimateFees('mint', e.target.value);
                    }}
                  />
                </div>

                {fees && fees.operation === 'mint' && (
                  <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded">
                    <div className="flex justify-between text-sm">
                      <span>Amount:</span>
                      <span>${fees.amount}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Fee (0.1%):</span>
                      <span>${fees.fee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span>Total:</span>
                      <span>${fees.total.toFixed(2)}</span>
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleMintUSDC}
                  disabled={!mintAmount || parseFloat(mintAmount) <= 0 || loading}
                  className="w-full"
                >
                  <ArrowDownCircle className="w-4 h-4 mr-2" />
                  Mint USDC
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="burn" className="space-y-4">
              <Alert>
                <ArrowUpCircle className="w-4 h-4" />
                <AlertTitle>Burn USDC</AlertTitle>
                <AlertDescription>
                  Redeem your USDC for USD. The USD will be sent to your linked bank account.
                  This is a 1:1 redemption with minimal fees.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="burnAmount">Amount (USDC)</Label>
                  <Input
                    id="burnAmount"
                    type="number"
                    placeholder="Enter USDC amount to burn"
                    value={burnAmount}
                    onChange={(e) => {
                      setBurnAmount(e.target.value);
                      estimateFees('burn', e.target.value);
                    }}
                  />
                  {balance && (
                    <p className="text-sm text-gray-500 mt-1">
                      Available: {balance.usdcBalance.toFixed(2)} USDC
                    </p>
                  )}
                </div>

                {fees && fees.operation === 'burn' && (
                  <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded">
                    <div className="flex justify-between text-sm">
                      <span>Amount:</span>
                      <span>${fees.amount}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Fee (0.1%):</span>
                      <span>${fees.fee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span>You'll Receive:</span>
                      <span>${(fees.amount - fees.fee).toFixed(2)}</span>
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleBurnUSDC}
                  disabled={!burnAmount || parseFloat(burnAmount) <= 0 || loading}
                  className="w-full"
                >
                  <ArrowUpCircle className="w-4 h-4 mr-2" />
                  Burn USDC for USD
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="transfer" className="space-y-4">
              <Alert>
                <ArrowRightCircle className="w-4 h-4" />
                <AlertTitle>Transfer USDC</AlertTitle>
                <AlertDescription>
                  Send USDC to another wallet address on the same blockchain.
                  Transfers are fast and secure with on-chain confirmation.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="transferAmount">Amount (USDC)</Label>
                  <Input
                    id="transferAmount"
                    type="number"
                    placeholder="Enter USDC amount"
                    value={transferAmount}
                    onChange={(e) => {
                      setTransferAmount(e.target.value);
                      estimateFees('transfer', e.target.value);
                    }}
                  />
                </div>

                <div>
                  <Label htmlFor="transferAddress">Recipient Address</Label>
                  <Input
                    id="transferAddress"
                    placeholder="0x..."
                    value={transferAddress}
                    onChange={(e) => setTransferAddress(e.target.value)}
                  />
                </div>

                {fees && fees.operation === 'transfer' && (
                  <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded">
                    <div className="flex justify-between text-sm">
                      <span>Amount:</span>
                      <span>{fees.amount} USDC</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Network Fee:</span>
                      <span>${fees.fee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span>Total Cost:</span>
                      <span>${fees.total.toFixed(2)}</span>
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleTransferUSDC}
                  disabled={!transferAmount || !transferAddress || loading}
                  className="w-full"
                >
                  <ArrowRightCircle className="w-4 h-4 mr-2" />
                  Transfer USDC
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          {/* Processing Status */}
          {processingStatus && (
            <Alert className="mt-4">
              <Clock className="w-4 h-4 animate-pulse" />
              <AlertTitle>Processing</AlertTitle>
              <AlertDescription>{processingStatus}</AlertDescription>
              <Progress value={33} className="mt-2" />
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Bank Account Linking */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="w-5 h-5" />
            Bank Account
          </CardTitle>
          <CardDescription>
            Link your bank account for USD deposits and withdrawals
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="accountNumber">Account Number</Label>
              <Input
                id="accountNumber"
                placeholder="Enter account number"
                value={bankAccount.accountNumber}
                onChange={(e) => setBankAccount({...bankAccount, accountNumber: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="routingNumber">Routing Number</Label>
              <Input
                id="routingNumber"
                placeholder="Enter routing number"
                value={bankAccount.routingNumber}
                onChange={(e) => setBankAccount({...bankAccount, routingNumber: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="accountName">Account Name</Label>
              <Input
                id="accountName"
                placeholder="Enter account holder name"
                value={bankAccount.accountName}
                onChange={(e) => setBankAccount({...bankAccount, accountName: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="bankName">Bank Name</Label>
              <Input
                id="bankName"
                placeholder="Enter bank name"
                value={bankAccount.bankName}
                onChange={(e) => setBankAccount({...bankAccount, bankName: e.target.value})}
              />
            </div>
          </div>

          <Button
            onClick={linkBankAccount}
            disabled={!bankAccount.accountNumber || !bankAccount.routingNumber || loading}
            className="w-full"
          >
            <Building className="w-4 h-4 mr-2" />
            Link Bank Account
          </Button>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Alert>
        <AlertCircle className="w-4 h-4" />
        <AlertTitle>About Circle Integration</AlertTitle>
        <AlertDescription>
          This is Phase 1 of our hybrid stablecoin approach. We're using Circle's infrastructure for USDC operations
          while developing our proprietary MonayUSD token. In future phases, MonayUSD will be wrapped USDC initially,
          then transition to direct USD backing.
        </AlertDescription>
      </Alert>
    </div>
  );
}