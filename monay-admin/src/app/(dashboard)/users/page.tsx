'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Users, Plus, Search, Filter, MoreVertical, Edit, Trash, Eye, 
  UserPlus, Shield, Key, CheckCircle, XCircle, AlertCircle, DollarSign
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { usersService } from '@/services/users.service';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile?: string;
  walletBalance: number;
  isActive: boolean;
  isEmailVerified: boolean;
  isKycVerified: boolean;
  lastLoginAt?: string;
  createdAt: string;
  userRoles?: Array<{
    role: {
      id: string;
      name: string;
      displayName: string;
      description: string;
      permissions: any;
    };
  }>;
}

interface Role {
  id: string;
  name: string;
  displayName: string;
  description: string;
}

interface RolePermission {
  id: string;
  role: string;
  permission: string;
  resource: string;
  action: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showUserDetailsModal, setShowUserDetailsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedUserPermissions, setSelectedUserPermissions] = useState<RolePermission[]>([]);
  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    password: '',
    roleId: '',
    walletBalance: 0,
  });

  // Fetch users and roles on mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersData, rolesData] = await Promise.all([
        usersService.getAllUsers(),
        usersService.getRoles(),
      ]);
      setUsers(usersData);
      setRoles(rolesData);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  // Filter and search users
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = 
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'active' && user.isActive) ||
        (statusFilter === 'inactive' && !user.isActive);
      
      const userRole = user.userRoles?.[0]?.role?.name || 'none';
      const matchesRole = roleFilter === 'all' || userRole === roleFilter;
      
      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [users, searchTerm, statusFilter, roleFilter]);

  const handleAddUser = async () => {
    if (!newUser.firstName || !newUser.lastName || !newUser.email || !newUser.password || !newUser.roleId) {
      toast.error('Please fill in all required fields');
      return;
    }

    const result = await usersService.createUser(newUser);
    if (result.success) {
      toast.success('User created successfully');
      setShowAddUserModal(false);
      setNewUser({
        firstName: '',
        lastName: '',
        email: '',
        mobile: '',
        password: '',
        roleId: '',
        walletBalance: 0,
      });
      fetchData();
    } else {
      toast.error(result.error || 'Failed to create user');
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      const result = await usersService.deleteUser(id);
      if (result.success) {
        toast.success('User deleted successfully');
        fetchData();
      } else {
        toast.error(result.error || 'Failed to delete user');
      }
    }
  };

  const handleViewUserDetails = async (user: User) => {
    setSelectedUser(user);
    const roleName = user.userRoles?.[0]?.role?.name;
    if (roleName) {
      const permissions = await usersService.getRolePermissions(roleName);
      setSelectedUserPermissions(permissions);
    }
    setShowUserDetailsModal(true);
  };

  const handleUpdateUserRole = async (userId: string, roleId: string) => {
    const result = await usersService.updateUserRole(userId, roleId);
    if (result.success) {
      toast.success('User role updated successfully');
      fetchData();
    } else {
      toast.error(result.error || 'Failed to update user role');
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'platform_admin': return 'bg-red-500 text-white';
      case 'premium_consumer': return 'bg-purple-500 text-white';
      case 'verified_consumer': return 'bg-blue-500 text-white';
      case 'basic_consumer': return 'bg-gray-500 text-white';
      case 'enterprise_admin': return 'bg-indigo-500 text-white';
      case 'treasury_manager': return 'bg-green-500 text-white';
      case 'compliance_officer': return 'bg-yellow-600 text-white';
      case 'merchant': return 'bg-orange-500 text-white';
      default: return 'bg-gray-400 text-white';
    }
  };

  const getStatusIcon = (isActive: boolean) => {
    return isActive ? 
      <CheckCircle className="w-4 h-4 text-green-500" /> : 
      <XCircle className="w-4 h-4 text-red-500" />;
  };

  const getVerificationBadges = (user: User) => {
    return (
      <div className="flex gap-2">
        {user.isEmailVerified && (
          <Badge variant="outline" className="text-xs">
            <CheckCircle className="w-3 h-3 mr-1" />
            Email
          </Badge>
        )}
        {user.isKycVerified && (
          <Badge variant="outline" className="text-xs">
            <Shield className="w-3 h-3 mr-1" />
            KYC
          </Badge>
        )}
      </div>
    );
  };

  // Get unique roles from users
  const uniqueRoles = Array.from(new Set(users.map(u => u.userRoles?.[0]?.role?.name).filter(Boolean)));

  // Stats
  const stats = {
    total: users.length,
    active: users.filter(u => u.isActive).length,
    verified: users.filter(u => u.isKycVerified).length,
    totalBalance: users.reduce((sum, u) => sum + u.walletBalance, 0),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground mt-1">Manage users, roles, and permissions</p>
        </div>
        <Dialog open={showAddUserModal} onOpenChange={setShowAddUserModal}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
              <UserPlus className="w-4 h-4 mr-2" />
              Add New User
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>Create a new user account with role assignment</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={newUser.firstName}
                    onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                    placeholder="John"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={newUser.lastName}
                    onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                    placeholder="Doe"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="john.doe@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mobile">Mobile</Label>
                <Input
                  id="mobile"
                  value={newUser.mobile}
                  onChange={(e) => setNewUser({ ...newUser, mobile: e.target.value })}
                  placeholder="+1234567890"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  placeholder="********"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role *</Label>
                <Select value={newUser.roleId} onValueChange={(value) => setNewUser({ ...newUser, roleId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.displayName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="balance">Initial Balance</Label>
                <Input
                  id="balance"
                  type="number"
                  value={newUser.walletBalance}
                  onChange={(e) => setNewUser({ ...newUser, walletBalance: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddUserModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddUser}>
                Create User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold">{stats.active}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">KYC Verified</p>
                <p className="text-2xl font-bold">{stats.verified}</p>
              </div>
              <Shield className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Balance</p>
                <p className="text-2xl font-bold">${stats.totalBalance.toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {uniqueRoles.map((role) => (
                  <SelectItem key={role} value={role || 'none'}>
                    {role || 'No Role'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Verification</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{user.firstName} {user.lastName}</div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                      {user.mobile && (
                        <div className="text-xs text-muted-foreground">{user.mobile}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.userRoles?.[0]?.role ? (
                      <Badge className={getRoleBadgeColor(user.userRoles[0].role.name)}>
                        {user.userRoles[0].role.displayName}
                      </Badge>
                    ) : (
                      <Badge variant="outline">No Role</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(user.isActive)}
                      <span className="text-sm">{user.isActive ? 'Active' : 'Inactive'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getVerificationBadges(user)}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">${user.walletBalance.toLocaleString()}</div>
                  </TableCell>
                  <TableCell>
                    {user.lastLoginAt ? 
                      new Date(user.lastLoginAt).toLocaleDateString() : 
                      'Never'
                    }
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleViewUserDetails(user)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        <Trash className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* User Details Modal */}
      <Dialog open={showUserDetailsModal} onOpenChange={setShowUserDetailsModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <Tabs defaultValue="info" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="info">Information</TabsTrigger>
                <TabsTrigger value="role">Role & Permissions</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
              </TabsList>
              
              <TabsContent value="info" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Name</Label>
                    <p className="font-medium">{selectedUser.firstName} {selectedUser.lastName}</p>
                  </div>
                  <div>
                    <Label>Email</Label>
                    <p className="font-medium">{selectedUser.email}</p>
                  </div>
                  <div>
                    <Label>Mobile</Label>
                    <p className="font-medium">{selectedUser.mobile || 'N/A'}</p>
                  </div>
                  <div>
                    <Label>Wallet Balance</Label>
                    <p className="font-medium">${selectedUser.walletBalance.toLocaleString()}</p>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <div className="flex items-center gap-2 mt-1">
                      {getStatusIcon(selectedUser.isActive)}
                      <span>{selectedUser.isActive ? 'Active' : 'Inactive'}</span>
                    </div>
                  </div>
                  <div>
                    <Label>Verification</Label>
                    <div className="mt-1">
                      {getVerificationBadges(selectedUser)}
                    </div>
                  </div>
                  <div>
                    <Label>Created</Label>
                    <p className="font-medium">
                      {new Date(selectedUser.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <Label>Last Login</Label>
                    <p className="font-medium">
                      {selectedUser.lastLoginAt ? 
                        new Date(selectedUser.lastLoginAt).toLocaleDateString() : 
                        'Never'
                      }
                    </p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="role" className="space-y-4">
                <div>
                  <Label>Current Role</Label>
                  {selectedUser.userRoles?.[0]?.role ? (
                    <div className="mt-2">
                      <Badge className={getRoleBadgeColor(selectedUser.userRoles[0].role.name)}>
                        {selectedUser.userRoles[0].role.displayName}
                      </Badge>
                      <p className="text-sm text-muted-foreground mt-2">
                        {selectedUser.userRoles[0].role.description}
                      </p>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No role assigned</p>
                  )}
                </div>
                
                <div>
                  <Label>Permissions</Label>
                  <ScrollArea className="h-64 mt-2 border rounded-md p-4">
                    {selectedUserPermissions.length > 0 ? (
                      <div className="space-y-2">
                        {selectedUserPermissions.map((perm) => (
                          <div key={perm.id} className="flex items-center gap-2 text-sm">
                            <Key className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">{perm.permission}</span>
                            <Badge variant="outline" className="text-xs">
                              {perm.action} on {perm.resource}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No permissions defined</p>
                    )}
                  </ScrollArea>
                </div>
                
                <div>
                  <Label>Change Role</Label>
                  <Select 
                    value={selectedUser.userRoles?.[0]?.role?.id || ''}
                    onValueChange={(value) => handleUpdateUserRole(selectedUser.id, value)}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select new role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.displayName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>
              
              <TabsContent value="activity" className="space-y-4">
                <div className="text-center text-muted-foreground py-8">
                  Activity tracking coming soon...
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}