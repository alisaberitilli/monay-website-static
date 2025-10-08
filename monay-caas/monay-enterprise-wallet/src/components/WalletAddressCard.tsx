'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Copy, Check, QrCode, ExternalLink, Wallet, Download, X } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import QRCode from 'qrcode';

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
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [generatingQR, setGeneratingQR] = useState(false);

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

  const generateQRCode = async () => {
    try {
      setGeneratingQR(true);

      // Create QR code data with wallet info
      const qrData = JSON.stringify({
        address: address,
        network: network,
        rail: rail,
        type: 'wallet'
      });

      // Generate QR code as data URL
      const url = await QRCode.toDataURL(qrData, {
        width: 400,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'H'
      });

      setQrCodeUrl(url);
      setShowQRModal(true);
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast.error('Failed to generate QR code');
    } finally {
      setGeneratingQR(false);
    }
  };

  const downloadQRCode = () => {
    if (!qrCodeUrl) return;

    const link = document.createElement('a');
    link.download = `wallet-${address.slice(0, 8)}.png`;
    link.href = qrCodeUrl;
    link.click();
    toast.success('QR code downloaded!');
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
            onClick={generateQRCode}
            disabled={generatingQR}
          >
            <QrCode className="h-4 w-4 mr-2" />
            {generatingQR ? 'Generating...' : 'Show QR'}
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

      {/* QR Code Modal */}
      <Dialog open={showQRModal} onOpenChange={setShowQRModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Wallet QR Code</DialogTitle>
            <DialogDescription>
              Scan this QR code to receive payments to your wallet
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center space-y-4 py-4">
            {/* QR Code Image */}
            {qrCodeUrl && (
              <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
                <img
                  src={qrCodeUrl}
                  alt="Wallet QR Code"
                  className="w-64 h-64"
                />
              </div>
            )}

            {/* Wallet Info */}
            <div className="w-full bg-gray-50 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Network:</span>
                <Badge variant="secondary">{network}</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Rail:</span>
                <Badge className={getRailColor(rail)} variant="outline">
                  {rail === 'evm' ? 'EVM' : 'Solana'}
                </Badge>
              </div>
              <div className="text-sm">
                <span className="text-gray-600">Address:</span>
                <p className="font-mono text-xs mt-1 break-all">{address}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 w-full">
              <Button
                variant="outline"
                className="flex-1"
                onClick={downloadQRCode}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleCopyAddress}
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-2 text-green-600" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Address
                  </>
                )}
              </Button>
            </div>

            {/* Warning */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 w-full">
              <p className="text-xs text-amber-800">
                <strong>⚠️ Important:</strong> Only share this QR code with trusted parties.
                Ensure the sender is using the {network} network.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
