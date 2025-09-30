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
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Shield, Plus, Edit, Trash2, Eye, Clock, Users, AlertTriangle, CheckCircle, XCircle, Settings, Lock, Unlock, DollarSign } from 'lucide-react';

interface MultisigPolicy {
  id: string;
  name: string;
  description: string;
  type: 'transaction_limit' | 'time_based' | 'approval_hierarchy' | 'velocity_limit' | 'geographic' | 'token_specific';
  status: 'active' | 'inactive' | 'draft';
  priority: number;
  conditions: Array<{
    field: string;
    operator: string;
    value: string;
    unit?: string;
  }>;
  requirements: {
    requiredSignatures: number;
    timeDelay?: number;
    approverRoles?: string[];
    excludedRoles?: string[];
  };
  walletIds: string[];
  createdBy: string;
  createdAt: string;
  lastModified: string;
  lastModifiedBy: string;
  enforced: boolean;
}

interface MultisigWallet {
  id: string;
  name: string;
  address: string;
  requiredSignatures: number;
  totalSigners: number;
  network: string;
}

export default function MultisigPoliciesPage() {
  const [selectedTab, setSelectedTab] = useState('policies');
  const [isCreatePolicyOpen, setIsCreatePolicyOpen] = useState(false);
  const [isEditPolicyOpen, setIsEditPolicyOpen] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<MultisigPolicy | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  // Mock data for multisig wallets
  const multisigWallets: MultisigWallet[] = [
    {
      id: '1',
      name: 'Executive Treasury Wallet',
      address: '0x1234567890123456789012345678901234567890',
      requiredSignatures: 3,
      totalSigners: 5,
      network: 'Base L2'
    },
    {
      id: '2',
      name: 'Operations Multi-Sig',
      address: '0x2345678901234567890123456789012345678901',
      requiredSignatures: 2,
      totalSigners: 4,
      network: 'Base L2'
    },
    {
      id: '3',
      name: 'Compliance Escrow Wallet',
      address: '0x3456789012345678901234567890123456789012',
      requiredSignatures: 4,
      totalSigners: 6,
      network: 'Base L2'
    }
  ];

  // Mock data for multisig policies
  const multisigPolicies: MultisigPolicy[] = [
    {
      id: '1',
      name: 'High Value Transaction Policy',
      description: 'Requires enhanced approval for transactions above $100,000',
      type: 'transaction_limit',
      status: 'active',
      priority: 1,
      conditions: [
        { field: 'amount', operator: 'greater_than', value: '100000', unit: 'USD' }
      ],
      requirements: {
        requiredSignatures: 4,
        timeDelay: 3600,
        approverRoles: ['CEO', 'CFO', 'CTO', 'Compliance Officer']
      },
      walletIds: ['1', '2'],
      createdBy: 'John Smith',
      createdAt: '2024-01-15 10:00',
      lastModified: '2024-01-25 14:30',
      lastModifiedBy: 'Sarah Johnson',
      enforced: true
    },
    {
      id: '2',
      name: 'After Hours Transaction Restriction',
      description: 'Additional approval required for transactions outside business hours',
      type: 'time_based',
      status: 'active',
      priority: 2,
      conditions: [
        { field: 'time', operator: 'outside_hours', value: '09:00-17:00', unit: 'EST' },
        { field: 'amount', operator: 'greater_than', value: '10000', unit: 'USD' }
      ],
      requirements: {
        requiredSignatures: 3,
        timeDelay: 1800,
        approverRoles: ['CEO', 'CFO', 'Operations Manager']
      },
      walletIds: ['1', '2', '3'],
      createdBy: 'Sarah Johnson',
      createdAt: '2024-01-16 11:30',
      lastModified: '2024-01-28 09:15',
      lastModifiedBy: 'Michael Brown',
      enforced: true
    },
    {
      id: '3',
      name: 'Token Mint Authorization',
      description: 'Special approval process for minting new USDXM tokens',
      type: 'token_specific',
      status: 'active',
      priority: 1,
      conditions: [
        { field: 'operation', operator: 'equals', value: 'mint' },
        { field: 'token', operator: 'equals', value: 'USDXM' }
      ],
      requirements: {
        requiredSignatures: 5,
        timeDelay: 7200,
        approverRoles: ['CEO', 'CFO', 'CTO', 'Compliance Officer', 'Legal Counsel']
      },
      walletIds: ['1'],
      createdBy: 'Michael Brown',
      createdAt: '2024-01-18 14:45',
      lastModified: '2024-01-29 16:20',
      lastModifiedBy: 'John Smith',
      enforced: true
    },
    {
      id: '4',
      name: 'Velocity Limit Policy',
      description: 'Limits total transaction volume within 24-hour periods',
      type: 'velocity_limit',
      status: 'active',
      priority: 3,
      conditions: [
        { field: 'volume_24h', operator: 'greater_than', value: '500000', unit: 'USD' }
      ],
      requirements: {
        requiredSignatures: 3,
        timeDelay: 1800,
        approverRoles: ['CFO', 'Treasury Manager', 'Risk Officer']
      },
      walletIds: ['2'],
      createdBy: 'Lisa Chen',
      createdAt: '2024-01-20 09:15',
      lastModified: '2024-01-20 09:15',
      lastModifiedBy: 'Lisa Chen',
      enforced: true
    },
    {
      id: '5',
      name: 'Emergency Freeze Authority',
      description: 'Allows emergency suspension of all wallet operations',
      type: 'approval_hierarchy',
      status: 'active',
      priority: 0,
      conditions: [
        { field: 'emergency_status', operator: 'equals', value: 'active' }
      ],
      requirements: {
        requiredSignatures: 2,
        timeDelay: 0,
        approverRoles: ['CEO', 'Chief Security Officer'],
        excludedRoles: ['External Auditor']
      },
      walletIds: ['1', '2', '3'],
      createdBy: 'John Smith',
      createdAt: '2024-01-12 08:00',
      lastModified: '2024-01-12 08:00',
      lastModifiedBy: 'John Smith',
      enforced: true
    },
    {
      id: '6',
      name: 'Geographic Restriction Policy',
      description: 'Restricts transactions from certain geographic locations',
      type: 'geographic',
      status: 'draft',
      priority: 4,
      conditions: [
        { field: 'ip_location', operator: 'in_blocklist', value: 'sanctioned_countries' }
      ],
      requirements: {
        requiredSignatures: 4,
        timeDelay: 3600,
        approverRoles: ['CEO', 'CFO', 'Compliance Officer', 'Legal Counsel']
      },
      walletIds: ['1', '2', '3'],
      createdBy: 'David Wilson',
      createdAt: '2024-01-29 13:00',
      lastModified: '2024-01-29 13:00',
      lastModifiedBy: 'David Wilson',
      enforced: false
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 border-green-200"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200"><XCircle className="w-3 h-3 mr-1" />Inactive</Badge>;
      case 'draft':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200"><Edit className="w-3 h-3 mr-1" />Draft</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'transaction_limit':
        return <DollarSign className="w-4 h-4" />;
      case 'time_based':
        return <Clock className="w-4 h-4" />;
      case 'approval_hierarchy':
        return <Users className="w-4 h-4" />;
      case 'velocity_limit':
        return <AlertTriangle className="w-4 h-4" />;
      case 'geographic':
        return <Shield className="w-4 h-4" />;
      case 'token_specific':
        return <Lock className="w-4 h-4" />;
      default:
        return <Settings className="w-4 h-4" />;
    }
  };

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 0:
        return 'Emergency';
      case 1:
        return 'Critical';
      case 2:
        return 'High';
      case 3:
        return 'Medium';
      case 4:
        return 'Low';
      default:
        return 'Normal';
    }
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 0:
        return 'bg-red-600 text-white';
      case 1:
        return 'bg-red-100 text-red-800 border-red-200';
      case 2:
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 3:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 4:
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredPolicies = multisigPolicies.filter(policy => {
    const matchesStatus = filterStatus === 'all' || policy.status === filterStatus;
    const matchesType = filterType === 'all' || policy.type === filterType;
    return matchesStatus && matchesType;
  });

  const handleEditPolicy = (policy: MultisigPolicy) => {
    setSelectedPolicy(policy);
    setIsEditPolicyOpen(true);
  };

  const handleTogglePolicy = (policyId: string) => {
    // In a real app, this would make an API call
    console.log('Toggle policy:', policyId);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Multisig Policies</h1>
          <p className="text-gray-600">Configure and manage approval policies for multisig wallets</p>
        </div>
        <Button
          onClick={() => setIsCreatePolicyOpen(true)}
          className="bg-orange-400 hover:bg-orange-500 text-white border-orange-400 hover:border-orange-500"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Policy
        </Button>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="policies">Policy Management</TabsTrigger>
          <TabsTrigger value="templates">Policy Templates</TabsTrigger>
          <TabsTrigger value="enforcement">Enforcement Rules</TabsTrigger>
        </TabsList>

        <TabsContent value="policies" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-4 items-center">
                <Label>Filters:</Label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Policy Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="transaction_limit">Transaction Limit</SelectItem>
                    <SelectItem value="time_based">Time Based</SelectItem>
                    <SelectItem value="approval_hierarchy">Approval Hierarchy</SelectItem>
                    <SelectItem value="velocity_limit">Velocity Limit</SelectItem>
                    <SelectItem value="geographic">Geographic</SelectItem>
                    <SelectItem value="token_specific">Token Specific</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Policies List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Configured Policies ({filteredPolicies.length})
              </CardTitle>
              <CardDescription>
                Manage multisig approval policies and their enforcement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Policy</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Requirements</TableHead>
                    <TableHead>Wallets</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Enforced</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPolicies.map((policy) => (
                    <TableRow key={policy.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{policy.name}</p>
                          <p className="text-sm text-gray-600">{policy.description}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTypeIcon(policy.type)}
                          <span className="capitalize text-sm">
                            {policy.type.replace('_', ' ')}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPriorityColor(policy.priority)}>
                          {getPriorityLabel(policy.priority)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{policy.requirements.requiredSignatures} signatures</p>
                          {policy.requirements.timeDelay && (
                            <p className="text-gray-600">
                              {Math.floor(policy.requirements.timeDelay / 60)}min delay
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {policy.walletIds.length} wallet{policy.walletIds.length !== 1 ? 's' : ''}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(policy.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={policy.enforced}
                            onCheckedChange={() => handleTogglePolicy(policy.id)}
                          />
                          {policy.enforced ? (
                            <Lock className="w-4 h-4 text-green-600" />
                          ) : (
                            <Unlock className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditPolicy(policy)}
                          >
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

        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Policy Templates</CardTitle>
              <CardDescription>
                Pre-configured policy templates for common use cases
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  {
                    name: 'High Value Transactions',
                    description: 'Enhanced approval for large transactions',
                    type: 'transaction_limit',
                    popular: true
                  },
                  {
                    name: 'After Hours Protection',
                    description: 'Additional security outside business hours',
                    type: 'time_based',
                    popular: true
                  },
                  {
                    name: 'Token Minting Control',
                    description: 'Strict controls for token creation',
                    type: 'token_specific',
                    popular: false
                  },
                  {
                    name: 'Velocity Monitoring',
                    description: 'Limit transaction frequency and volume',
                    type: 'velocity_limit',
                    popular: false
                  },
                  {
                    name: 'Geographic Compliance',
                    description: 'Location-based transaction restrictions',
                    type: 'geographic',
                    popular: false
                  },
                  {
                    name: 'Emergency Controls',
                    description: 'Emergency freeze and recovery procedures',
                    type: 'approval_hierarchy',
                    popular: true
                  }
                ].map((template, index) => (
                  <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            {getTypeIcon(template.type)}
                            <h3 className="font-semibold">{template.name}</h3>
                          </div>
                          {template.popular && (
                            <Badge className="bg-orange-100 text-orange-800 text-xs">Popular</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{template.description}</p>
                        <Button
                          size="sm"
                          className="w-full bg-orange-400 hover:bg-orange-500 text-white border-orange-400 hover:border-orange-500"
                        >
                          Use Template
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="enforcement" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Global Enforcement Settings</CardTitle>
                <CardDescription>
                  System-wide policy enforcement configuration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="global-enforcement">Enable Global Policy Enforcement</Label>
                    <p className="text-sm text-gray-600">Apply policies across all multisig wallets</p>
                  </div>
                  <Switch id="global-enforcement" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="strict-mode">Strict Mode</Label>
                    <p className="text-sm text-gray-600">Block transactions that violate any policy</p>
                  </div>
                  <Switch id="strict-mode" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="override-allowed">Allow Emergency Override</Label>
                    <p className="text-sm text-gray-600">Permit policy bypassing in emergencies</p>
                  </div>
                  <Switch id="override-allowed" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="audit-logging">Enhanced Audit Logging</Label>
                    <p className="text-sm text-gray-600">Log all policy evaluations and decisions</p>
                  </div>
                  <Switch id="audit-logging" defaultChecked />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Policy Conflicts</CardTitle>
                <CardDescription>
                  Manage conflicting policies and resolution strategies
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="conflict-resolution">Conflict Resolution Strategy</Label>
                  <Select defaultValue="strictest">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="strictest">Apply Strictest Policy</SelectItem>
                      <SelectItem value="priority">Use Policy Priority</SelectItem>
                      <SelectItem value="most_recent">Most Recent Policy Wins</SelectItem>
                      <SelectItem value="manual">Manual Resolution Required</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                    <p className="text-sm text-yellow-800">
                      2 policy conflicts detected. Review and resolve to ensure proper enforcement.
                    </p>
                  </div>
                  <Button size="sm" variant="outline" className="mt-2">
                    View Conflicts
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enforcement Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Enforcement Statistics</CardTitle>
              <CardDescription>
                Policy enforcement metrics over the last 30 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-2xl font-bold text-green-600">1,247</p>
                  <p className="text-sm text-gray-600">Policies Enforced</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-2xl font-bold text-red-600">23</p>
                  <p className="text-sm text-gray-600">Violations Blocked</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-2xl font-bold text-orange-600">156</p>
                  <p className="text-sm text-gray-600">Manual Approvals</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">2</p>
                  <p className="text-sm text-gray-600">Emergency Overrides</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Policy Dialog */}
      <Dialog open={isCreatePolicyOpen} onOpenChange={setIsCreatePolicyOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Policy</DialogTitle>
            <DialogDescription>
              Configure a new multisig approval policy
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="policy-name">Policy Name</Label>
                <Input id="policy-name" placeholder="Enter policy name" />
              </div>
              <div>
                <Label htmlFor="policy-type">Policy Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select policy type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="transaction_limit">Transaction Limit</SelectItem>
                    <SelectItem value="time_based">Time Based</SelectItem>
                    <SelectItem value="approval_hierarchy">Approval Hierarchy</SelectItem>
                    <SelectItem value="velocity_limit">Velocity Limit</SelectItem>
                    <SelectItem value="geographic">Geographic</SelectItem>
                    <SelectItem value="token_specific">Token Specific</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="policy-description">Description</Label>
              <Textarea
                id="policy-description"
                placeholder="Describe what this policy does and when it applies"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="required-signatures">Required Signatures</Label>
                <Input id="required-signatures" type="number" min="1" max="10" defaultValue="2" />
              </div>
              <div>
                <Label htmlFor="time-delay">Time Delay (minutes)</Label>
                <Input id="time-delay" type="number" min="0" placeholder="0" />
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select defaultValue="3">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Emergency</SelectItem>
                    <SelectItem value="1">Critical</SelectItem>
                    <SelectItem value="2">High</SelectItem>
                    <SelectItem value="3">Medium</SelectItem>
                    <SelectItem value="4">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Apply to Wallets</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {multisigWallets.map((wallet) => (
                  <label key={wallet.id} className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">{wallet.name}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setIsCreatePolicyOpen(false)}>
                Cancel
              </Button>
              <Button
                className="bg-orange-400 hover:bg-orange-500 text-white border-orange-400 hover:border-orange-500"
                onClick={() => setIsCreatePolicyOpen(false)}
              >
                Create Policy
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}