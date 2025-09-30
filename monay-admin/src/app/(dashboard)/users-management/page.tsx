'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Users,
  User,
  UserCheck,
  UserX,
  Search,
  Filter,
  Download,
  RefreshCw,
  Shield,
  Wallet,
  Activity,
  Ban,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Eye,
  Edit,
  Lock,
  Unlock,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  TrendingUp,
  MoreVertical,
  ChevronRight,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { AreaChart, BarChart } from '@tremor/react';
import { superAdminService } from '@/services/super-admin.service';
import { useToast } from '@/components/ui/use-toast';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: string;
  status: 'active' | 'suspended' | 'terminated' | 'pending';
  kycStatus: 'verified' | 'pending' | 'rejected' | 'none';
  createdAt: string;
  lastLoginAt?: string;
  walletBalance: number;
  totalTransactions: number;
  platform: 'consumer' | 'enterprise' | 'both';
  riskScore?: number;
}

interface UserMetrics {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  suspendedUsers: number;
  verifiedKYC: number;
  pendingKYC: number;
  consumerUsers: number;
  enterpriseUsers: number;
}

export default function UsersManagementPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [metrics, setMetrics] = useState<UserMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPlatform, setFilterPlatform] = useState('all');
  const [showSuspendDialog, setShowSuspendDialog] = useState(false);
  const [suspendReason, setSuspendReason] = useState('');
  const [suspendDuration, setSuspendDuration] = useState('7');
  const { toast } = useToast();

  useEffect(() => {
    loadUsersData();
  }, [filterRole, filterStatus, filterPlatform]);

  const loadUsersData = async () => {
    try {
      setLoading(true);

      // Get JWT token from localStorage
      const token = localStorage.getItem('adminToken');

      // Fetch users from API
      const usersResponse = await fetch('http://localhost:3001/api/admin/user', {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
          'x-admin-bypass': 'true'
        }
      });

      if (usersResponse.ok) {
        const usersData = await usersResponse.json();

        // Map API data to frontend interface
        const mappedUsers = usersData.data?.rows?.map((user: any) => ({
          id: user.id,
          email: user.email,
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          phone: user.phone || user.mobile || user.phoneNumber || '',
          role: user.role || user.userType || 'consumer',
          status: user.status || 'active',
          kycStatus: user.kycStatus || (user.isEmailVerified ? 'verified' : 'pending'),
          createdAt: user.createdAt || new Date().toISOString(),
          lastLoginAt: user.lastLoginAt,
          walletBalance: user.wallet_balance || 0,
          totalTransactions: 0, // Will need to fetch from transactions table
          platform: user.user_type === 'platform_admin' ? 'enterprise' : 'consumer',
          riskScore: user.risk_profile === 'high' ? 75 : (user.risk_profile === 'medium' ? 50 : 25),
        })) || [];

        setUsers(mappedUsers);

        // Calculate metrics from real data
        const totalUsers = mappedUsers.length;
        const activeUsers = mappedUsers.filter((u: any) => u.status === 'active').length;
        const suspendedUsers = mappedUsers.filter((u: any) => u.status === 'suspended').length;
        const verifiedKYC = mappedUsers.filter((u: any) => u.kycStatus === 'verified').length;
        const pendingKYC = mappedUsers.filter((u: any) => u.kycStatus === 'pending').length;
        const consumerUsers = mappedUsers.filter((u: any) => u.platform === 'consumer').length;
        const enterpriseUsers = mappedUsers.filter((u: any) => u.platform === 'enterprise').length;

        setMetrics({
          totalUsers,
          activeUsers,
          newUsersToday: 0, // Would need to calculate from created_at dates
          suspendedUsers,
          verifiedKYC,
          pendingKYC,
          consumerUsers,
          enterpriseUsers,
        });
      } else {
        console.error('Failed to fetch users:', usersResponse.statusText);
        toast.error('Failed to load users data');
      }
    } catch (error) {
      console.error('Failed to load users data:', error);
      toast.error('Failed to load users data');
    } finally {
      setLoading(false);
    }
  };

  const handleSuspendUser = async () => {
    if (!selectedUser) return;

    try {
      await superAdminService.suspendUser(
        selectedUser.id,
        suspendReason,
        parseInt(suspendDuration)
      );

      toast.success(`User ${selectedUser.email} has been suspended`);

      setShowSuspendDialog(false);
      setSuspendReason('');
      await loadUsersData();
    } catch (error) {
      toast.error('Failed to suspend user');
    }
  };

  const handleActivateUser = async (userId: string) => {
    try {
      await superAdminService.activateUser(userId);
      toast.success('User has been activated');
      await loadUsersData();
    } catch (error) {
      toast.error('Failed to activate user');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-600';
      case 'suspended': return 'bg-yellow-100 text-yellow-600';
      case 'terminated': return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getKYCStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-600';
      case 'pending': return 'bg-yellow-100 text-yellow-600';
      case 'rejected': return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    const matchesPlatform = filterPlatform === 'all' || user.platform === filterPlatform;

    return matchesSearch && matchesRole && matchesStatus && matchesPlatform;
  });

  const userGrowthData = [
    { date: '2024-01-18', consumer: 245, enterprise: 45 },
    { date: '2024-01-19', consumer: 287, enterprise: 52 },
    { date: '2024-01-20', consumer: 312, enterprise: 48 },
    { date: '2024-01-21', consumer: 298, enterprise: 61 },
    { date: '2024-01-22', consumer: 342, enterprise: 58 },
    { date: '2024-01-23', consumer: 378, enterprise: 67 },
    { date: '2024-01-24', consumer: 402, enterprise: 72 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-gray-600">Manage users across all platforms</p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            onClick={loadUsersData}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
          <Button className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export Users
          </Button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-5 h-5 text-blue-600" />
              <TrendingUp className="w-4 h-4 text-green-600" />
            </div>
            <p className="text-sm text-gray-600">Total Users</p>
            <p className="text-2xl font-bold">{metrics?.totalUsers.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">+{metrics?.newUsersToday} today</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <UserCheck className="w-5 h-5 text-green-600" />
              <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">
                {((metrics?.activeUsers || 0) / (metrics?.totalUsers || 1) * 100).toFixed(1)}%
              </span>
            </div>
            <p className="text-sm text-gray-600">Active Users</p>
            <p className="text-2xl font-bold">{metrics?.activeUsers.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Shield className="w-5 h-5 text-purple-600" />
              <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded">
                {((metrics?.verifiedKYC || 0) / (metrics?.totalUsers || 1) * 100).toFixed(1)}%
              </span>
            </div>
            <p className="text-sm text-gray-600">KYC Verified</p>
            <p className="text-2xl font-bold">{metrics?.verifiedKYC.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <UserX className="w-5 h-5 text-red-600" />
              <AlertCircle className="w-4 h-4 text-red-600" />
            </div>
            <p className="text-sm text-gray-600">Suspended</p>
            <p className="text-2xl font-bold text-red-600">{metrics?.suspendedUsers}</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full max-w-lg">
          <TabsTrigger value="all">All Users</TabsTrigger>
          <TabsTrigger value="consumer">Consumer</TabsTrigger>
          <TabsTrigger value="enterprise">Enterprise</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* All Users Tab */}
        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>User Directory</CardTitle>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 w-64"
                    />
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                      <SelectItem value="terminated">Terminated</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterPlatform} onValueChange={setFilterPlatform}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Platform" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Platforms</SelectItem>
                      <SelectItem value="consumer">Consumer</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                      <SelectItem value="both">Both</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Platform</TableHead>
                    <TableHead>KYC Status</TableHead>
                    <TableHead>Wallet Balance</TableHead>
                    <TableHead>Transactions</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                            {user.firstName[0]}{user.lastName[0]}
                          </div>
                          <div>
                            <p className="font-medium">{user.firstName} {user.lastName}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.platform === 'enterprise' ? 'default' : 'secondary'}>
                          {user.platform}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getKYCStatusColor(user.kycStatus)}>
                          {user.kycStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-bold">
                        ${user.walletBalance.toLocaleString()}
                      </TableCell>
                      <TableCell>{user.totalTransactions}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(user.status)}>
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.lastLoginAt
                          ? new Date(user.lastLoginAt).toLocaleDateString()
                          : 'Never'
                        }
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedUser(user)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {user.status === 'active' ? (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-yellow-600"
                              onClick={() => {
                                setSelectedUser(user);
                                setShowSuspendDialog(true);
                              }}
                            >
                              <Ban className="w-4 h-4" />
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-green-600"
                              onClick={() => handleActivateUser(user.id)}
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Consumer Tab */}
        <TabsContent value="consumer">
          <Card>
            <CardHeader>
              <CardTitle>Consumer Platform Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600">Total Consumer Users</p>
                    <p className="text-2xl font-bold">{metrics?.consumerUsers.toLocaleString()}</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-600">Active Today</p>
                    <p className="text-2xl font-bold">3,456</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <p className="text-sm text-gray-600">New This Week</p>
                    <p className="text-2xl font-bold">523</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Enterprise Tab */}
        <TabsContent value="enterprise">
          <Card>
            <CardHeader>
              <CardTitle>Enterprise Platform Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600">Total Enterprise Users</p>
                    <p className="text-2xl font-bold">{metrics?.enterpriseUsers.toLocaleString()}</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-600">Organizations</p>
                    <p className="text-2xl font-bold">245</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <p className="text-sm text-gray-600">Enterprise Admins</p>
                    <p className="text-2xl font-bold">89</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>User Growth Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <AreaChart
                  className="h-full"
                  data={userGrowthData}
                  index="date"
                  categories={["consumer", "enterprise"]}
                  colors={["blue", "purple"]}
                  showAnimation={true}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Suspend User Dialog */}
      <Dialog open={showSuspendDialog} onOpenChange={setShowSuspendDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suspend User</DialogTitle>
            <DialogDescription>
              Suspend {selectedUser?.email} from accessing the platform
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Reason for Suspension</Label>
              <Textarea
                placeholder="Enter reason..."
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            <div>
              <Label>Suspension Duration</Label>
              <Select value={suspendDuration} onValueChange={setSuspendDuration}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Day</SelectItem>
                  <SelectItem value="7">7 Days</SelectItem>
                  <SelectItem value="30">30 Days</SelectItem>
                  <SelectItem value="90">90 Days</SelectItem>
                  <SelectItem value="0">Permanent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowSuspendDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleSuspendUser}
            >
              Suspend User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}