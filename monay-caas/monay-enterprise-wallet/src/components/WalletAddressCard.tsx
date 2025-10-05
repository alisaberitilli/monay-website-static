'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Check, QrCode, ExternalLink, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface WalletAddressCardProps {
  address?: string;
  network?: string;
  rail?: 'evm' | 'solana';
  balance?: string;
  className?: string;
}

export default function WalletAddressCard({
  address = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1',
  network = 'Base Sepolia',
  rail = 'evm',
  balance = '$425,850.00',
  className
}: WalletAddressCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      toast.success('Wallet address copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy address');
    }
  };

  const getRailColor = (rail: string) => {
    switch (rail) {
      case 'evm':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'solana':
        return 'bg-cyan-100 text-cyan-700 border-cyan-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const formatAddress = (addr: string) => {
    if (addr.length <= 20) return addr;
    return `${addr.slice(0, 10)}...${addr.slice(-8)}`;
  };

  return (
    <Card className={cn('border-2 hover:shadow-lg transition-all', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-lg">
              <Wallet className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">My Wallet Address</CardTitle>
              <CardDescription>Share this to receive payments</CardDescription>
            </div>
          </div>
          <Badge className={getRailColor(rail)} variant="outline">
            {rail === 'evm' ? 'EVM' : 'Solana'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Network Badge */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Network:</span>
          <Badge variant="secondary">{network}</Badge>
        </div>

        {/* Address Display */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs text-gray-500 mb-1">Address</p>
              <p className="font-mono text-sm font-medium break-all">
                {address}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyAddress}
              className="ml-2 flex-shrink-0"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Current Balance */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
          <p className="text-xs text-gray-600 mb-1">Current Balance</p>
          <p className="text-2xl font-bold text-gray-900">{balance}</p>
          <p className="text-xs text-gray-500 mt-1">Across all tokens</p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => toast.info('QR Code feature coming soon!')}
          >
            <QrCode className="h-4 w-4 mr-2" />
            Show QR
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => {
              const explorerUrl = rail === 'evm'
                ? `https://sepolia.basescan.org/address/${address}`
                : `https://explorer.solana.com/address/${address}?cluster=devnet`;
              window.open(explorerUrl, '_blank');
            }}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Explorer
          </Button>
        </div>

        {/* Important Notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="text-xs text-amber-800">
            <strong>⚠️ Important:</strong> Always verify the network before sharing.
            Sending funds to the wrong network will result in permanent loss.
          </p>
        </div>

        {/* How to Receive */}
        <div className="border-t pt-3">
          <p className="text-xs font-medium text-gray-700 mb-2">How to receive money:</p>
          <ol className="text-xs text-gray-600 space-y-1 list-decimal list-inside">
            <li>Click the copy button to copy your address</li>
            <li>Share the address with the sender</li>
            <li>Specify the network (e.g., "{network}")</li>
            <li>Wait for the transaction to be confirmed</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}
