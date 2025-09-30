'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  ArrowLeft,
  Settings,
  Coins,
  Users,
  Shield,
  Activity,
  Zap,
  Pause,
  Play,
  Ban,
  RefreshCcw,
  Send,
  Download
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function TokenManagePage() {
  const router = useRouter();
  const params = useParams();
  const tokenId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<any>(null);

  // Quick Actions handlers
  const handleMintTokens = () => {
    toast.success('Mint operation initiated');
  };

  const handleBurnTokens = () => {
    toast.success('Burn operation initiated');
  };

  const handleSetCompliance = () => {
    toast.success('Compliance rules updated');
  };

  const handleCrossRailBridge = () => {
    toast.success('Cross-rail bridge initiated');
  };

  const handlePauseToken = () => {
    toast.success('Token paused successfully');
  };

  const handleUnpauseToken = () => {
    toast.success('Token unpaused successfully');
  };

  useEffect(() => {
    // Mock token data based on ID
    const mockToken = {
      id: tokenId,
      name: 'Enterprise Token',
      symbol: 'ENT',
      status: 'active',
      totalSupply: '1,000,000',
      holders: 1234,
      chain: 'Base L2'
    };

    setToken(mockToken);
    setLoading(false);
  }, [tokenId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        <Card>
          <CardContent className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Token Not Found</h3>
            <p className="text-gray-600">The token you're looking for doesn't exist.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{token.name} ({token.symbol})</h1>
            <p className="text-gray-600">Token Management • ID: {token.id}</p>
          </div>
        </div>
        <Badge className="bg-green-100 text-green-800">{token.status.toUpperCase()}</Badge>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Quick Actions
          </CardTitle>
          <CardDescription>Common token operations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button onClick={handleMintTokens} className="h-20 flex flex-col gap-2">
              <Coins className="h-5 w-5" />
              Mint
            </Button>
            <Button onClick={handleBurnTokens} variant="outline" className="h-20 flex flex-col gap-2">
              <Ban className="h-5 w-5" />
              Burn
            </Button>
            <Button onClick={handleSetCompliance} variant="outline" className="h-20 flex flex-col gap-2">
              <Shield className="h-5 w-5" />
              Set Compliance
            </Button>
            <Button onClick={handleCrossRailBridge} variant="outline" className="h-20 flex flex-col gap-2">
              <RefreshCcw className="h-5 w-5" />
              Cross-rail Bridge
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Management Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="supply">Supply Management</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Token Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Status:</span>
                  <Badge className="bg-green-100 text-green-700">{token.status}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Chain:</span>
                  <span>{token.chain}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Supply:</span>
                  <span>{token.totalSupply}</span>
                </div>
                <div className="flex justify-between">
                  <span>Holders:</span>
                  <span>{token.holders.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Operations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handlePauseToken}
                >
                  <Pause className="h-4 w-4 mr-2" />
                  Pause Token
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => router.push(`/tokens/${token.id}/analytics`)}
                >
                  <Activity className="h-4 w-4 mr-2" />
                  View Analytics
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Send className="h-4 w-4 mr-2" />
                  Transfer Tokens
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Mint Operation</span>
                    <span className="text-gray-500">2h ago</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Transfer</span>
                    <span className="text-gray-500">5h ago</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Compliance Update</span>
                    <span className="text-gray-500">1d ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="supply" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Supply Management</CardTitle>
              <CardDescription>Mint, burn, and manage token supply</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="mint-amount">Mint Amount</Label>
                  <Input id="mint-amount" placeholder="Enter amount to mint" />
                  <Button onClick={handleMintTokens} className="w-full">
                    <Coins className="h-4 w-4 mr-2" />
                    Mint Tokens
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="burn-amount">Burn Amount</Label>
                  <Input id="burn-amount" placeholder="Enter amount to burn" />
                  <Button onClick={handleBurnTokens} variant="destructive" className="w-full">
                    <Ban className="h-4 w-4 mr-2" />
                    Burn Tokens
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Access Control</CardTitle>
              <CardDescription>Manage roles and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Admin Addresses</h4>
                  <p className="text-sm text-gray-600 mb-2">Addresses with full token control</p>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="font-mono text-sm">0x1234...5678</span>
                      <Button size="sm" variant="outline">Remove</Button>
                    </div>
                  </div>
                  <Button size="sm" className="mt-2">Add Admin</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Settings</CardTitle>
              <CardDescription>Configure compliance rules and restrictions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button onClick={handleSetCompliance} className="w-full">
                  <Shield className="h-4 w-4 mr-2" />
                  Update Compliance Rules
                </Button>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-900">Current Compliance Level</h4>
                  <p className="text-sm text-blue-700">Institutional - KYC/AML enabled</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}