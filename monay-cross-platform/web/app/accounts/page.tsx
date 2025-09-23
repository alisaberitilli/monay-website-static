'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import {
  Users,
  Plus,
  QrCode,
  Send,
  Settings,
  AlertCircle,
  Check,
  X,
  DollarSign,
  Shield,
  User,
  Phone,
  Mail,
  Activity
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import apiClient from '@/lib/api-client';

interface SecondaryAccount {
  id: string;
  userId: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    mobile: string;
  };
  relationship?: string;
  limit: number;
  remainAmount: number;
  dailySpent?: number;
  monthlySpent?: number;
  status: 'active' | 'inactive' | 'deleted';
  isParentVerified: boolean;
  createdAt: string;
  lastTransaction?: string;
  autoTopupEnabled?: boolean;
  autoTopupAmount?: number;
}

interface PrimaryAccount {
  id: string;
  parentId: string;
  parent: {
    firstName: string;
    lastName: string;
    email: string;
    mobile: string;
  };
  limit: number;
  remainAmount: number;
  status: string;
}

export default function AccountManagementPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [secondaryAccounts, setSecondaryAccounts] = useState<SecondaryAccount[]>([]);
  const [primaryAccount, setPrimaryAccount] = useState<PrimaryAccount | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<SecondaryAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<'primary' | 'secondary' | null>(null);

  // Form states
  const [linkMethod, setLinkMethod] = useState<'phone' | 'email' | 'qr'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [relationship, setRelationship] = useState('family');
  const [spendingLimit, setSpendingLimit] = useState('500');
  const [dailyLimit, setDailyLimit] = useState('100');
  const [autoTopup, setAutoTopup] = useState(false);
  const [autoTopupThreshold, setAutoTopupThreshold] = useState('50');
  const [autoTopupAmount, setAutoTopupAmount] = useState('100');

  useEffect(() => {
    fetchAccountData();
  }, []);

  const fetchAccountData = async () => {
    try {
      setLoading(true);

      // Check if user is primary or secondary
      const profileRes = await apiClient.getProfile();
      if (!profileRes.success) {
        throw new Error(profileRes.error || 'Failed to get profile');
      }

      const userData = profileRes.data;

      // Try to fetch secondary accounts (if primary)
      const secondaryRes = await apiClient.getSecondaryAccounts();
      if (secondaryRes.success && secondaryRes.data) {
        setSecondaryAccounts(secondaryRes.data);
        setUserRole('primary');
      } else {
        // If fails, try to fetch primary account (if secondary)
        const primaryRes = await apiClient.getPrimaryAccount();
        if (primaryRes.success && primaryRes.data) {
          setPrimaryAccount(primaryRes.data);
          setUserRole('secondary');
        } else {
          // User might be independent
          setUserRole('primary');
        }
      }
    } catch (error) {
      console.error('Error fetching account data:', error);
      toast.error('Failed to load account information');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSecondaryAccount = async () => {
    try {
      const token = localStorage.getItem('token');

      const payload = {
        linkMethod,
        phoneNumber: linkMethod === 'phone' ? phoneNumber : undefined,
        email: linkMethod === 'email' ? email : undefined,
        relationship,
        limit: parseFloat(spendingLimit),
        dailyLimit: parseFloat(dailyLimit),
        autoTopupEnabled: autoTopup,
        autoTopupThreshold: autoTopup ? parseFloat(autoTopupThreshold) : undefined,
        autoTopupAmount: autoTopup ? parseFloat(autoTopupAmount) : undefined,
      };

      const response = await apiClient.linkSecondaryAccount(payload);

      if (response.success) {
        toast.success('Secondary account invitation sent!');
        setIsAddDialogOpen(false);
        fetchAccountData();
        resetForm();
      } else {
        throw new Error(response.error || 'Failed to link account');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to add secondary account');
    }
  };

  const handleUpdateLimits = async () => {
    if (!selectedAccount) return;

    try {
      const payload = {
        limit: parseFloat(spendingLimit),
        dailyLimit: parseFloat(dailyLimit),
        status: selectedAccount.status,
        autoTopupEnabled: autoTopup,
        autoTopupThreshold: autoTopup ? parseFloat(autoTopupThreshold) : undefined,
        autoTopupAmount: autoTopup ? parseFloat(autoTopupAmount) : undefined,
      };

      const response = await apiClient.updateSecondaryLimits(selectedAccount.userId, payload);

      if (response.success) {
        toast.success('Account settings updated successfully');
        setIsSettingsDialogOpen(false);
        fetchAccountData();
      } else {
        throw new Error(response.error || 'Failed to update settings');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update settings');
    }
  };

  const toggleAccountStatus = async (account: SecondaryAccount) => {
    try {
      const newStatus = account.status === 'active' ? 'inactive' : 'active';

      const response = await apiClient.updateSecondaryLimits(account.userId, { status: newStatus });

      if (response.success) {
        toast.success(`Account ${newStatus === 'active' ? 'enabled' : 'disabled'}`);
        fetchAccountData();
      } else {
        throw new Error(response.error || 'Failed to update status');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update account status');
    }
  };

  const resetForm = () => {
    setPhoneNumber('');
    setEmail('');
    setRelationship('family');
    setSpendingLimit('500');
    setDailyLimit('100');
    setAutoTopup(false);
    setAutoTopupThreshold('50');
    setAutoTopupAmount('100');
  };

  const openSettings = (account: SecondaryAccount) => {
    setSelectedAccount(account);
    setSpendingLimit(account.limit.toString());
    setDailyLimit(account.dailySpent?.toString() || '100');
    setAutoTopup(account.autoTopupEnabled || false);
    setAutoTopupThreshold(account.autoTopupAmount?.toString() || '50');
    setAutoTopupAmount(account.autoTopupAmount?.toString() || '100');
    setIsSettingsDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Account Management</h1>
        <p className="text-muted-foreground">
          {userRole === 'primary'
            ? 'Manage your family and secondary accounts'
            : 'View your account relationship and limits'}
        </p>
      </div>

      {userRole === 'secondary' && primaryAccount ? (
        // Secondary User View
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Your Primary Account
            </CardTitle>
            <CardDescription>
              You are linked as a secondary account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">
                      {primaryAccount.parent.firstName} {primaryAccount.parent.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">{primaryAccount.parent.email}</p>
                  </div>
                </div>
                <Badge variant={primaryAccount.status === 'active' ? 'default' : 'secondary'}>
                  {primaryAccount.status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Spending Limit</p>
                  <p className="text-2xl font-bold">${primaryAccount.limit}</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Remaining</p>
                  <p className="text-2xl font-bold">${primaryAccount.remainAmount}</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Used</p>
                  <p className="text-2xl font-bold">
                    ${(primaryAccount.limit - primaryAccount.remainAmount).toFixed(2)}
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Usage</p>
                  <p className="text-2xl font-bold">
                    {((1 - primaryAccount.remainAmount / primaryAccount.limit) * 100).toFixed(0)}%
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        // Primary User View
        <>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="secondary">Secondary Accounts</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Accounts</p>
                        <p className="text-2xl font-bold">{secondaryAccounts.length}</p>
                      </div>
                      <Users className="h-8 w-8 text-primary opacity-20" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Active</p>
                        <p className="text-2xl font-bold">
                          {secondaryAccounts.filter(a => a.status === 'active').length}
                        </p>
                      </div>
                      <Check className="h-8 w-8 text-green-500 opacity-20" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Limit</p>
                        <p className="text-2xl font-bold">
                          ${secondaryAccounts.reduce((sum, a) => sum + a.limit, 0)}
                        </p>
                      </div>
                      <DollarSign className="h-8 w-8 text-primary opacity-20" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Used</p>
                        <p className="text-2xl font-bold">
                          ${secondaryAccounts.reduce((sum, a) => sum + (a.limit - a.remainAmount), 0).toFixed(2)}
                        </p>
                      </div>
                      <Activity className="h-8 w-8 text-primary opacity-20" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {secondaryAccounts.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Secondary Accounts</h3>
                    <p className="text-muted-foreground mb-4">
                      Add family members or employees as secondary accounts to manage their spending.
                    </p>
                    <Button onClick={() => setIsAddDialogOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Secondary Account
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="secondary" className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Secondary Accounts</h2>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Account
                </Button>
              </div>

              {secondaryAccounts.map((account) => (
                <Card key={account.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">
                            {account.user.firstName} {account.user.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground">{account.user.email}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {account.relationship || 'Other'}
                            </Badge>
                            {account.isParentVerified && (
                              <Badge variant="default" className="text-xs">
                                Verified
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Limit</p>
                          <p className="font-semibold">${account.limit}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Remaining</p>
                          <p className="font-semibold">${account.remainAmount}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={account.status === 'active'}
                            onCheckedChange={() => toggleAccountStatus(account)}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openSettings(account)}
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="activity" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    Transactions from your secondary accounts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">No recent activity</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Add Secondary Account Dialog */}
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add Secondary Account</DialogTitle>
                <DialogDescription>
                  Link a family member or employee as a secondary account
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label>Link Method</Label>
                  <Select value={linkMethod} onValueChange={(v: any) => setLinkMethod(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="phone">Phone Number</SelectItem>
                      <SelectItem value="email">Email Address</SelectItem>
                      <SelectItem value="qr">QR Code</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {linkMethod === 'phone' && (
                  <div>
                    <Label>Phone Number</Label>
                    <Input
                      placeholder="+1234567890"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                  </div>
                )}

                {linkMethod === 'email' && (
                  <div>
                    <Label>Email Address</Label>
                    <Input
                      type="email"
                      placeholder="user@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                )}

                {linkMethod === 'qr' && (
                  <Alert>
                    <QrCode className="h-4 w-4" />
                    <AlertDescription>
                      A QR code will be generated for the secondary user to scan
                    </AlertDescription>
                  </Alert>
                )}

                <div>
                  <Label>Relationship</Label>
                  <Select value={relationship} onValueChange={setRelationship}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="family">Family</SelectItem>
                      <SelectItem value="employee">Employee</SelectItem>
                      <SelectItem value="servant">Household Staff</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Monthly Limit ($)</Label>
                    <Input
                      type="number"
                      value={spendingLimit}
                      onChange={(e) => setSpendingLimit(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Daily Limit ($)</Label>
                    <Input
                      type="number"
                      value={dailyLimit}
                      onChange={(e) => setDailyLimit(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto-topup">Enable Auto Top-up</Label>
                    <Switch
                      id="auto-topup"
                      checked={autoTopup}
                      onCheckedChange={setAutoTopup}
                    />
                  </div>

                  {autoTopup && (
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div>
                        <Label className="text-xs">When balance below ($)</Label>
                        <Input
                          type="number"
                          value={autoTopupThreshold}
                          onChange={(e) => setAutoTopupThreshold(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Top-up amount ($)</Label>
                        <Input
                          type="number"
                          value={autoTopupAmount}
                          onChange={(e) => setAutoTopupAmount(e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddSecondaryAccount}>
                  Add Account
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Settings Dialog */}
          <Dialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Account Settings</DialogTitle>
                <DialogDescription>
                  Update limits and settings for {selectedAccount?.user.firstName}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Monthly Limit ($)</Label>
                    <Input
                      type="number"
                      value={spendingLimit}
                      onChange={(e) => setSpendingLimit(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Daily Limit ($)</Label>
                    <Input
                      type="number"
                      value={dailyLimit}
                      onChange={(e) => setDailyLimit(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="settings-auto-topup">Enable Auto Top-up</Label>
                    <Switch
                      id="settings-auto-topup"
                      checked={autoTopup}
                      onCheckedChange={setAutoTopup}
                    />
                  </div>

                  {autoTopup && (
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div>
                        <Label className="text-xs">When balance below ($)</Label>
                        <Input
                          type="number"
                          value={autoTopupThreshold}
                          onChange={(e) => setAutoTopupThreshold(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Top-up amount ($)</Label>
                        <Input
                          type="number"
                          value={autoTopupAmount}
                          onChange={(e) => setAutoTopupAmount(e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsSettingsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateLimits}>
                  Save Changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}