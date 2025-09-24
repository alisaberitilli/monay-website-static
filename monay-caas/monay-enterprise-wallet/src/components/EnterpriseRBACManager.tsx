'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Shield,
  Users,
  Lock,
  Key,
  Building2,
  Plus,
  Edit,
  Trash2,
  ChevronRight,
  Check,
  X,
  AlertTriangle,
  Search,
  Filter,
  Settings,
  UserPlus,
  Award,
  Globe,
  Briefcase,
  Crown,
  Landmark,
  BadgeCheck,
  FileCheck
} from 'lucide-react';
import axios from 'axios';

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  industry?: string;
  isSystem: boolean;
  priority: number;
  createdAt?: string;
}

interface Permission {
  id: string;
  name: string;
  category: string;
}

interface Industry {
  id: string;
  name: string;
  description: string;
  icon: string;
}

interface ComplianceRequirements {
  industry: string;
  requirements: string[];
  limits: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  multiSig: {
    required: boolean;
    threshold: number;
  };
  maxTransaction: number;
}

const industryIcons: Record<string, React.ReactNode> = {
  banking: <Landmark className="w-5 h-5" />,
  fintech: <Briefcase className="w-5 h-5" />,
  healthcare: <FileCheck className="w-5 h-5" />,
  realestate: <Building2 className="w-5 h-5" />,
  supplychain: <Globe className="w-5 h-5" />,
  government: <Crown className="w-5 h-5" />,
  manufacturing: <Settings className="w-5 h-5" />,
  retail: <Briefcase className="w-5 h-5" />,
  insurance: <Shield className="w-5 h-5" />
};

export default function EnterpriseRBACManager() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Record<string, Permission[]>>({});
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('roles');
  const [isCreateRoleDialogOpen, setIsCreateRoleDialogOpen] = useState(false);
  const [isAssignRoleDialogOpen, setIsAssignRoleDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [complianceRequirements, setComplianceRequirements] = useState<ComplianceRequirements | null>(null);

  // New role form
  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
    permissions: [] as string[],
    industry: 'general',
    priority: 50
  });

  // Assign role form
  const [assignRole, setAssignRole] = useState({
    userId: '',
    roleId: '',
    industry: ''
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const axiosConfig = {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
    fetchIndustries();
  }, [selectedIndustry]);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const params = selectedIndustry !== 'all' ? `?industry=${selectedIndustry}` : '';
      const response = await axios.get(`${API_URL}/api/enterprise-rbac/roles${params}`, axiosConfig);
      setRoles(response.data.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch roles');
    } finally {
      setLoading(false);
    }
  };

  const fetchPermissions = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/enterprise-rbac/permissions`, axiosConfig);
      setPermissions(response.data.data.grouped);
    } catch (err) {
      console.error('Failed to fetch permissions:', err);
    }
  };

  const fetchIndustries = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/enterprise-rbac/industries`, axiosConfig);
      setIndustries(response.data.data);
    } catch (err) {
      console.error('Failed to fetch industries:', err);
    }
  };

  const fetchComplianceRequirements = async (industry: string) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/enterprise-rbac/compliance/${industry}`,
        axiosConfig
      );
      setComplianceRequirements(response.data.data);
    } catch (err) {
      console.error('Failed to fetch compliance requirements:', err);
    }
  };

  const createRole = async () => {
    try {
      const response = await axios.post(
        `${API_URL}/api/enterprise-rbac/roles`,
        newRole,
        axiosConfig
      );

      setRoles([...roles, response.data.data]);
      setIsCreateRoleDialogOpen(false);
      setNewRole({
        name: '',
        description: '',
        permissions: [],
        industry: 'general',
        priority: 50
      });
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create role');
    }
  };

  const assignRoleToUser = async () => {
    try {
      // Assign role
      await axios.post(
        `${API_URL}/api/enterprise-rbac/users/${assignRole.userId}/roles`,
        { roleId: assignRole.roleId },
        axiosConfig
      );

      // Assign industry if specified
      if (assignRole.industry) {
        await axios.post(
          `${API_URL}/api/enterprise-rbac/users/${assignRole.userId}/industry`,
          { industry: assignRole.industry },
          axiosConfig
        );
      }

      setIsAssignRoleDialogOpen(false);
      setAssignRole({
        userId: '',
        roleId: '',
        industry: ''
      });
      setError(null);
      alert('Role assigned successfully');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to assign role');
    }
  };

  const getRoleBadgeColor = (priority: number) => {
    if (priority >= 90) return 'destructive';
    if (priority >= 70) return 'default';
    if (priority >= 50) return 'secondary';
    return 'outline';
  };

  const getRoleIcon = (roleId: string) => {
    if (roleId.includes('owner')) return <Crown className="w-4 h-4" />;
    if (roleId.includes('cfo') || roleId.includes('treasurer')) return <Landmark className="w-4 h-4" />;
    if (roleId.includes('compliance')) return <BadgeCheck className="w-4 h-4" />;
    if (roleId.includes('developer')) return <Settings className="w-4 h-4" />;
    if (roleId.includes('auditor')) return <FileCheck className="w-4 h-4" />;
    return <Shield className="w-4 h-4" />;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(amount);
  };

  const filteredRoles = roles.filter(role => {
    return role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           role.description.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Shield className="w-8 h-8" />
            Enterprise Role Management
          </h2>
          <p className="text-muted-foreground mt-1">
            Industry-specific roles and permissions for enterprise operations
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setIsAssignRoleDialogOpen(true)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Assign Role
          </Button>
          <Button
            onClick={() => setIsCreateRoleDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Role
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Industry Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-4">
            <Label>Industry:</Label>
            <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
              <SelectTrigger className="w-[250px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Industries</SelectItem>
                {industries.map((industry) => (
                  <SelectItem key={industry.id} value={industry.id}>
                    <span className="flex items-center gap-2">
                      {industry.icon} {industry.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedIndustry !== 'all' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => fetchComplianceRequirements(selectedIndustry)}
              >
                View Compliance Requirements
              </Button>
            )}
          </div>

          {complianceRequirements && (
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2 mt-2">
                  <div><strong>Industry:</strong> {complianceRequirements.industry}</div>
                  <div><strong>Max Transaction:</strong> {formatCurrency(complianceRequirements.maxTransaction)}</div>
                  <div><strong>Multi-Sig Required:</strong> {complianceRequirements.multiSig.required ? `Yes (${complianceRequirements.multiSig.threshold} signatures)` : 'No'}</div>
                  <div><strong>Daily Limit:</strong> {formatCurrency(complianceRequirements.limits.daily)}</div>
                  <div><strong>Required Compliance:</strong> {complianceRequirements.requirements.join(', ')}</div>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="industries">Industries</TabsTrigger>
        </TabsList>

        {/* Roles Tab */}
        <TabsContent value="roles" className="space-y-4">
          {/* Search */}
          <Card>
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search roles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Roles List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {loading ? (
              <div className="col-span-2 text-center py-8">Loading roles...</div>
            ) : filteredRoles.length === 0 ? (
              <div className="col-span-2 text-center py-8 text-muted-foreground">
                No roles found for the selected industry.
              </div>
            ) : (
              filteredRoles.map((role) => (
                <Card key={role.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2">
                          {getRoleIcon(role.id)}
                          {role.name}
                        </CardTitle>
                        <CardDescription>{role.description}</CardDescription>
                      </div>
                      <div className="flex flex-col gap-1 items-end">
                        <Badge variant={getRoleBadgeColor(role.priority) as any}>
                          Priority: {role.priority}
                        </Badge>
                        {role.isSystem && (
                          <Badge variant="secondary">System</Badge>
                        )}
                        {role.industry && role.industry !== 'all' && (
                          <Badge variant="outline" className="flex items-center gap-1">
                            {industryIcons[role.industry]}
                            {role.industry}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">
                        <strong>Permissions ({role.permissions.length}):</strong>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {role.permissions.slice(0, 5).map((perm) => (
                          <Badge key={perm} variant="outline" className="text-xs">
                            {perm}
                          </Badge>
                        ))}
                        {role.permissions.length > 5 && (
                          <Badge variant="outline" className="text-xs">
                            +{role.permissions.length - 5} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Permissions Tab */}
        <TabsContent value="permissions" className="space-y-4">
          {Object.entries(permissions).map(([category, perms]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle>{category}</CardTitle>
                <CardDescription>
                  {perms.length} permissions in this category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {perms.map((perm) => (
                    <div key={perm.id} className="flex items-center gap-2 p-2 border rounded">
                      <Key className="w-4 h-4 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="font-mono text-sm">{perm.id}</div>
                        <div className="text-xs text-muted-foreground">{perm.name}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Industries Tab */}
        <TabsContent value="industries" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {industries.map((industry) => (
              <Card key={industry.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">{industry.icon}</span>
                    {industry.name}
                  </CardTitle>
                  <CardDescription>{industry.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setSelectedIndustry(industry.id);
                      setActiveTab('roles');
                    }}
                  >
                    View Roles
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Role Dialog */}
      <Dialog open={isCreateRoleDialogOpen} onOpenChange={setIsCreateRoleDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Custom Role</DialogTitle>
            <DialogDescription>
              Define a new role with specific permissions for your enterprise
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Role Name</Label>
              <Input
                id="name"
                placeholder="e.g., Regional Manager"
                value={newRole.name}
                onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Role description"
                value={newRole.description}
                onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Select
                value={newRole.industry}
                onValueChange={(value) => setNewRole({ ...newRole, industry: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  {industries.map((industry) => (
                    <SelectItem key={industry.id} value={industry.id}>
                      {industry.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority (1-100)</Label>
              <Input
                id="priority"
                type="number"
                min="1"
                max="100"
                value={newRole.priority}
                onChange={(e) => setNewRole({ ...newRole, priority: parseInt(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label>Permissions</Label>
              <div className="border rounded-lg p-4 max-h-60 overflow-y-auto">
                {Object.entries(permissions).map(([category, perms]) => (
                  <div key={category} className="mb-4">
                    <h4 className="font-semibold mb-2">{category}</h4>
                    <div className="space-y-1">
                      {perms.map((perm) => (
                        <div key={perm.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={perm.id}
                            checked={newRole.permissions.includes(perm.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setNewRole({
                                  ...newRole,
                                  permissions: [...newRole.permissions, perm.id]
                                });
                              } else {
                                setNewRole({
                                  ...newRole,
                                  permissions: newRole.permissions.filter(p => p !== perm.id)
                                });
                              }
                            }}
                          />
                          <label
                            htmlFor={perm.id}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {perm.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateRoleDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={createRole} disabled={!newRole.name || newRole.permissions.length === 0}>
              Create Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Role Dialog */}
      <Dialog open={isAssignRoleDialogOpen} onOpenChange={setIsAssignRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Role to User</DialogTitle>
            <DialogDescription>
              Assign a role and industry to a user
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="userId">User ID or Email</Label>
              <Input
                id="userId"
                placeholder="Enter user ID or email"
                value={assignRole.userId}
                onChange={(e) => setAssignRole({ ...assignRole, userId: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="roleId">Select Role</Label>
              <Select
                value={assignRole.roleId}
                onValueChange={(value) => setAssignRole({ ...assignRole, roleId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      <div className="flex items-center gap-2">
                        {getRoleIcon(role.id)}
                        {role.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignIndustry">Industry (Optional)</Label>
              <Select
                value={assignRole.industry}
                onValueChange={(value) => setAssignRole({ ...assignRole, industry: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {industries.map((industry) => (
                    <SelectItem key={industry.id} value={industry.id}>
                      {industry.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignRoleDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={assignRoleToUser} disabled={!assignRole.userId || !assignRole.roleId}>
              Assign Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}