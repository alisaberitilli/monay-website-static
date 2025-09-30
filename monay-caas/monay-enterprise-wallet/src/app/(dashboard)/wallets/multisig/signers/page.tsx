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
import { AlertTriangle, Users, Shield, Plus, UserCheck, Clock, AlertCircle, CheckCircle, XCircle, Eye, Edit, Trash2, UserPlus } from 'lucide-react';

interface Signer {
  id: string;
  address: string;
  name: string;
  role: string;
  status: 'active' | 'pending' | 'revoked' | 'suspended';
  addedDate: string;
  lastActive: string;
  permissions: string[];
  signatureCount: number;
  deviceType: string;
  location: string;
}

interface MultisigWallet {
  id: string;
  name: string;
  address: string;
  requiredSignatures: number;
  totalSigners: number;
  status: 'active' | 'setup' | 'suspended';
  balance: string;
  network: string;
}

export default function MultisigSignersPage() {
  const [selectedWallet, setSelectedWallet] = useState<string>('');
  const [isAddSignerOpen, setIsAddSignerOpen] = useState(false);
  const [isViewSignerOpen, setIsViewSignerOpen] = useState(false);
  const [selectedSigner, setSelectedSigner] = useState<Signer | null>(null);

  // Mock data for multisig wallets
  const multisigWallets: MultisigWallet[] = [
    {
      id: '1',
      name: 'Executive Treasury Wallet',
      address: '0x1234567890123456789012345678901234567890',
      requiredSignatures: 3,
      totalSigners: 5,
      status: 'active',
      balance: '$2,450,000.00',
      network: 'Base L2'
    },
    {
      id: '2',
      name: 'Operations Multi-Sig',
      address: '0x2345678901234567890123456789012345678901',
      requiredSignatures: 2,
      totalSigners: 4,
      status: 'active',
      balance: '$850,000.00',
      network: 'Base L2'
    },
    {
      id: '3',
      name: 'Compliance Escrow Wallet',
      address: '0x3456789012345678901234567890123456789012',
      requiredSignatures: 4,
      totalSigners: 6,
      status: 'setup',
      balance: '$0.00',
      network: 'Base L2'
    }
  ];

  // Mock data for signers
  const signers: Signer[] = [
    {
      id: '1',
      address: '0xabcd1234567890123456789012345678901234ef',
      name: 'John Smith',
      role: 'CEO',
      status: 'active',
      addedDate: '2024-01-15',
      lastActive: '2024-01-29 14:30',
      permissions: ['approve_large_transactions', 'wallet_admin', 'emergency_stop'],
      signatureCount: 156,
      deviceType: 'Hardware Wallet (Ledger)',
      location: 'New York, NY'
    },
    {
      id: '2',
      address: '0xbcde2345678901234567890123456789012345f0',
      name: 'Sarah Johnson',
      role: 'CFO',
      status: 'active',
      addedDate: '2024-01-15',
      lastActive: '2024-01-29 16:45',
      permissions: ['approve_large_transactions', 'treasury_operations'],
      signatureCount: 143,
      deviceType: 'Hardware Wallet (Trezor)',
      location: 'New York, NY'
    },
    {
      id: '3',
      address: '0xcdef3456789012345678901234567890123456f1',
      name: 'Michael Brown',
      role: 'CTO',
      status: 'active',
      addedDate: '2024-01-16',
      lastActive: '2024-01-29 12:15',
      permissions: ['approve_large_transactions', 'technical_admin'],
      signatureCount: 89,
      deviceType: 'Mobile Wallet (Secure)',
      location: 'San Francisco, CA'
    },
    {
      id: '4',
      address: '0xdef04567890123456789012345678901234567f2',
      name: 'Lisa Chen',
      role: 'COO',
      status: 'pending',
      addedDate: '2024-01-28',
      lastActive: 'Never',
      permissions: ['approve_large_transactions'],
      signatureCount: 0,
      deviceType: 'Pending Setup',
      location: 'Los Angeles, CA'
    },
    {
      id: '5',
      address: '0xef015678901234567890123456789012345678f3',
      name: 'David Wilson',
      role: 'Compliance Officer',
      status: 'suspended',
      addedDate: '2024-01-10',
      lastActive: '2024-01-25 09:30',
      permissions: ['compliance_review'],
      signatureCount: 67,
      deviceType: 'Hardware Wallet (Ledger)',
      location: 'Chicago, IL'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 border-green-200"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'revoked':
        return <Badge className="bg-red-100 text-red-800 border-red-200"><XCircle className="w-3 h-3 mr-1" />Revoked</Badge>;
      case 'suspended':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200"><AlertCircle className="w-3 h-3 mr-1" />Suspended</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleViewSigner = (signer: Signer) => {
    setSelectedSigner(signer);
    setIsViewSignerOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Multisig Signers</h1>
          <p className="text-gray-600">Manage authorized signers for multisig wallets</p>
        </div>
        <Button
          onClick={() => setIsAddSignerOpen(true)}
          className="bg-orange-400 hover:bg-orange-500 text-white border-orange-400 hover:border-orange-500"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Add Signer
        </Button>
      </div>

      {/* Wallet Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Select Multisig Wallet
          </CardTitle>
          <CardDescription>
            Choose a multisig wallet to manage its signers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {multisigWallets.map((wallet) => (
              <Card
                key={wallet.id}
                className={`cursor-pointer transition-all ${
                  selectedWallet === wallet.id
                    ? 'ring-2 ring-orange-400 bg-orange-50'
                    : 'hover:shadow-md'
                }`}
                onClick={() => setSelectedWallet(wallet.id)}
              >
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-sm">{wallet.name}</h3>
                      {getStatusBadge(wallet.status)}
                    </div>
                    <p className="text-xs text-gray-600">{wallet.address.slice(0, 20)}...</p>
                    <div className="text-sm">
                      <p className="font-medium">{wallet.balance}</p>
                      <p className="text-gray-600">{wallet.requiredSignatures}/{wallet.totalSigners} signatures required</p>
                      <p className="text-gray-500 text-xs">{wallet.network}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedWallet && (
        <Tabs defaultValue="signers" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="signers">Active Signers</TabsTrigger>
            <TabsTrigger value="pending">Pending Invitations</TabsTrigger>
            <TabsTrigger value="permissions">Permissions Matrix</TabsTrigger>
          </TabsList>

          <TabsContent value="signers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Signer Management
                </CardTitle>
                <CardDescription>
                  Active signers for {multisigWallets.find(w => w.id === selectedWallet)?.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Signer</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Device</TableHead>
                      <TableHead>Signatures</TableHead>
                      <TableHead>Last Active</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {signers.filter(s => s.status !== 'pending').map((signer) => (
                      <TableRow key={signer.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{signer.name}</p>
                            <p className="text-sm text-gray-600">{signer.address.slice(0, 20)}...</p>
                          </div>
                        </TableCell>
                        <TableCell>{signer.role}</TableCell>
                        <TableCell>{getStatusBadge(signer.status)}</TableCell>
                        <TableCell className="text-sm">{signer.deviceType}</TableCell>
                        <TableCell className="text-center">{signer.signatureCount}</TableCell>
                        <TableCell className="text-sm">{signer.lastActive}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewSigner(signer)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
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

          <TabsContent value="pending" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Pending Invitations
                </CardTitle>
                <CardDescription>
                  Signers awaiting confirmation to join the multisig wallet
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invitee</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Invited Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {signers.filter(s => s.status === 'pending').map((signer) => (
                      <TableRow key={signer.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{signer.name}</p>
                            <p className="text-sm text-gray-600">{signer.address.slice(0, 20)}...</p>
                          </div>
                        </TableCell>
                        <TableCell>{signer.role}</TableCell>
                        <TableCell>{signer.addedDate}</TableCell>
                        <TableCell>{getStatusBadge(signer.status)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="bg-orange-400 hover:bg-orange-500 text-white border-orange-400 hover:border-orange-500"
                            >
                              Resend Invite
                            </Button>
                            <Button variant="outline" size="sm" className="text-red-600 border-red-300 hover:bg-red-50">
                              Cancel
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

          <TabsContent value="permissions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Permissions Matrix
                </CardTitle>
                <CardDescription>
                  View and manage signer permissions for different operations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 font-semibold">Signer</th>
                        <th className="text-center p-3 font-semibold">Large Transactions</th>
                        <th className="text-center p-3 font-semibold">Wallet Admin</th>
                        <th className="text-center p-3 font-semibold">Emergency Stop</th>
                        <th className="text-center p-3 font-semibold">Treasury Ops</th>
                        <th className="text-center p-3 font-semibold">Technical Admin</th>
                        <th className="text-center p-3 font-semibold">Compliance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {signers.filter(s => s.status === 'active').map((signer) => (
                        <tr key={signer.id} className="border-b hover:bg-gray-50">
                          <td className="p-3">
                            <div>
                              <p className="font-medium">{signer.name}</p>
                              <p className="text-sm text-gray-600">{signer.role}</p>
                            </div>
                          </td>
                          <td className="text-center p-3">
                            {signer.permissions.includes('approve_large_transactions') ?
                              <CheckCircle className="w-5 h-5 text-green-600 mx-auto" /> :
                              <XCircle className="w-5 h-5 text-gray-300 mx-auto" />
                            }
                          </td>
                          <td className="text-center p-3">
                            {signer.permissions.includes('wallet_admin') ?
                              <CheckCircle className="w-5 h-5 text-green-600 mx-auto" /> :
                              <XCircle className="w-5 h-5 text-gray-300 mx-auto" />
                            }
                          </td>
                          <td className="text-center p-3">
                            {signer.permissions.includes('emergency_stop') ?
                              <CheckCircle className="w-5 h-5 text-green-600 mx-auto" /> :
                              <XCircle className="w-5 h-5 text-gray-300 mx-auto" />
                            }
                          </td>
                          <td className="text-center p-3">
                            {signer.permissions.includes('treasury_operations') ?
                              <CheckCircle className="w-5 h-5 text-green-600 mx-auto" /> :
                              <XCircle className="w-5 h-5 text-gray-300 mx-auto" />
                            }
                          </td>
                          <td className="text-center p-3">
                            {signer.permissions.includes('technical_admin') ?
                              <CheckCircle className="w-5 h-5 text-green-600 mx-auto" /> :
                              <XCircle className="w-5 h-5 text-gray-300 mx-auto" />
                            }
                          </td>
                          <td className="text-center p-3">
                            {signer.permissions.includes('compliance_review') ?
                              <CheckCircle className="w-5 h-5 text-green-600 mx-auto" /> :
                              <XCircle className="w-5 h-5 text-gray-300 mx-auto" />
                            }
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Add Signer Dialog */}
      <Dialog open={isAddSignerOpen} onOpenChange={setIsAddSignerOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Signer</DialogTitle>
            <DialogDescription>
              Invite a new signer to join the multisig wallet
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="signerName">Full Name</Label>
                <Input id="signerName" placeholder="Enter full name" />
              </div>
              <div>
                <Label htmlFor="signerRole">Role</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ceo">CEO</SelectItem>
                    <SelectItem value="cfo">CFO</SelectItem>
                    <SelectItem value="cto">CTO</SelectItem>
                    <SelectItem value="coo">COO</SelectItem>
                    <SelectItem value="compliance">Compliance Officer</SelectItem>
                    <SelectItem value="treasurer">Treasurer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="walletAddress">Wallet Address</Label>
              <Input id="walletAddress" placeholder="0x..." />
            </div>
            <div>
              <Label>Permissions</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm">Large Transactions</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm">Wallet Admin</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm">Emergency Stop</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm">Treasury Operations</span>
                </label>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setIsAddSignerOpen(false)}>
                Cancel
              </Button>
              <Button
                className="bg-orange-400 hover:bg-orange-500 text-white border-orange-400 hover:border-orange-500"
                onClick={() => setIsAddSignerOpen(false)}
              >
                Send Invitation
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Signer Dialog */}
      <Dialog open={isViewSignerOpen} onOpenChange={setIsViewSignerOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Signer Details</DialogTitle>
            <DialogDescription>
              Detailed information about the selected signer
            </DialogDescription>
          </DialogHeader>
          {selectedSigner && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Name</Label>
                  <p className="font-medium">{selectedSigner.name}</p>
                </div>
                <div>
                  <Label>Role</Label>
                  <p className="font-medium">{selectedSigner.role}</p>
                </div>
              </div>
              <div>
                <Label>Wallet Address</Label>
                <p className="font-mono text-sm bg-gray-100 p-2 rounded">{selectedSigner.address}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedSigner.status)}</div>
                </div>
                <div>
                  <Label>Device Type</Label>
                  <p className="font-medium">{selectedSigner.deviceType}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Added Date</Label>
                  <p className="font-medium">{selectedSigner.addedDate}</p>
                </div>
                <div>
                  <Label>Last Active</Label>
                  <p className="font-medium">{selectedSigner.lastActive}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Signature Count</Label>
                  <p className="font-medium">{selectedSigner.signatureCount}</p>
                </div>
                <div>
                  <Label>Location</Label>
                  <p className="font-medium">{selectedSigner.location}</p>
                </div>
              </div>
              <div>
                <Label>Permissions</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedSigner.permissions.map((permission) => (
                    <Badge key={permission} variant="secondary">
                      {permission.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}