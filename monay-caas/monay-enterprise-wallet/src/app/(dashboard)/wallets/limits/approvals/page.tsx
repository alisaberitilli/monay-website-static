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
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, XCircle, Clock, AlertTriangle, Eye, ExternalLink, DollarSign, Users, Shield, FileText, Calendar, RefreshCw } from 'lucide-react';

interface LimitApproval {
  id: string;
  type: 'limit_increase' | 'temporary_override' | 'emergency_bypass' | 'role_exception' | 'geographic_override';
  title: string;
  description: string;
  requestedBy: string;
  requestedByRole: string;
  requestedAt: string;
  currentLimit: string;
  requestedLimit: string;
  amount?: string;
  reason: string;
  justification: string;
  duration?: string;
  expiresAt?: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  priority: 'low' | 'medium' | 'high' | 'critical';
  approvals: Array<{
    approver: string;
    role: string;
    decision: 'approved' | 'rejected' | 'pending';
    timestamp?: string;
    comments?: string;
  }>;
  requiredApprovals: number;
  currentApprovals: number;
  walletId: string;
  walletName: string;
  ruleId: string;
  ruleName: string;
  attachments?: string[];
}

export default function LimitsApprovalsPage() {
  const [selectedTab, setSelectedTab] = useState('pending');
  const [isApprovalDetailsOpen, setIsApprovalDetailsOpen] = useState(false);
  const [selectedApproval, setSelectedApproval] = useState<LimitApproval | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  // Mock data for limit approvals
  const limitApprovals: LimitApproval[] = [
    {
      id: '1',
      type: 'limit_increase',
      title: 'Increase Daily Volume Limit for Q1 Payroll',
      description: 'Request to temporarily increase daily transaction volume for quarterly payroll processing',
      requestedBy: 'Sarah Johnson',
      requestedByRole: 'CFO',
      requestedAt: '2024-01-29 09:30',
      currentLimit: '$5,000,000',
      requestedLimit: '$15,000,000',
      amount: '$12,500,000',
      reason: 'Quarterly payroll processing requires higher volume capacity',
      justification: 'Q1 payroll includes annual bonuses and stock option exercises, requiring 3x normal capacity for 48 hours.',
      duration: '48 hours',
      expiresAt: '2024-02-02 09:30',
      status: 'pending',
      priority: 'high',
      approvals: [
        { approver: 'John Smith', role: 'CEO', decision: 'approved', timestamp: '2024-01-29 10:15', comments: 'Approved for payroll processing' },
        { approver: 'Michael Brown', role: 'CTO', decision: 'pending' },
        { approver: 'Lisa Chen', role: 'COO', decision: 'pending' }
      ],
      requiredApprovals: 2,
      currentApprovals: 1,
      walletId: '2',
      walletName: 'Operations Multi-Sig',
      ruleId: '2',
      ruleName: 'Daily Volume Limit',
      attachments: ['payroll_schedule_q1.pdf', 'volume_analysis.xlsx']
    },
    {
      id: '2',
      type: 'emergency_bypass',
      title: 'Emergency Bypass for Critical Vendor Payment',
      description: 'Emergency authorization to bypass transaction limits for critical infrastructure payment',
      requestedBy: 'Michael Brown',
      requestedByRole: 'CTO',
      requestedAt: '2024-01-29 14:45',
      currentLimit: '$1,000,000',
      requestedLimit: 'Bypass',
      amount: '$2,800,000',
      reason: 'Critical infrastructure payment to prevent service disruption',
      justification: 'Primary cloud infrastructure provider requires immediate payment to prevent service termination affecting all operations.',
      duration: '1 hour',
      expiresAt: '2024-01-29 15:45',
      status: 'approved',
      priority: 'critical',
      approvals: [
        { approver: 'John Smith', role: 'CEO', decision: 'approved', timestamp: '2024-01-29 14:50', comments: 'Emergency approved - critical infrastructure' },
        { approver: 'Sarah Johnson', role: 'CFO', decision: 'approved', timestamp: '2024-01-29 14:52', comments: 'Confirmed with finance team' }
      ],
      requiredApprovals: 2,
      currentApprovals: 2,
      walletId: '1',
      walletName: 'Executive Treasury Wallet',
      ruleId: '1',
      ruleName: 'High Value Transaction Limit'
    },
    {
      id: '3',
      type: 'temporary_override',
      title: 'Temporary Override for Client Onboarding',
      description: 'Temporary increase in minting limits for large client onboarding',
      requestedBy: 'Lisa Chen',
      requestedByRole: 'COO',
      requestedAt: '2024-01-28 16:20',
      currentLimit: '5 mints per hour',
      requestedLimit: '20 mints per hour',
      reason: 'Large enterprise client onboarding requires increased minting capacity',
      justification: 'Fortune 500 client onboarding 50 subsidiary companies requiring individual token allocations within 4-hour window.',
      duration: '4 hours',
      expiresAt: '2024-01-29 20:20',
      status: 'approved',
      priority: 'medium',
      approvals: [
        { approver: 'John Smith', role: 'CEO', decision: 'approved', timestamp: '2024-01-28 17:00', comments: 'Approved for client onboarding' },
        { approver: 'Sarah Johnson', role: 'CFO', decision: 'approved', timestamp: '2024-01-28 17:15', comments: 'Revenue impact justifies override' },
        { approver: 'David Wilson', role: 'Compliance Officer', decision: 'approved', timestamp: '2024-01-28 17:30', comments: 'Compliance verified' }
      ],
      requiredApprovals: 3,
      currentApprovals: 3,
      walletId: '1',
      walletName: 'Executive Treasury Wallet',
      ruleId: '3',
      ruleName: 'Token Minting Velocity Limit'
    },
    {
      id: '4',
      type: 'role_exception',
      title: 'Role Exception for New Treasury Manager',
      description: 'Grant higher limits to new treasury manager role',
      requestedBy: 'David Wilson',
      requestedByRole: 'Compliance Officer',
      requestedAt: '2024-01-27 11:15',
      currentLimit: '$50,000',
      requestedLimit: '$500,000',
      reason: 'New treasury manager needs elevated permissions',
      justification: 'Emily Davis promoted to Senior Treasury Manager requires same limits as other senior treasury staff.',
      status: 'pending',
      priority: 'medium',
      approvals: [
        { approver: 'Sarah Johnson', role: 'CFO', decision: 'approved', timestamp: '2024-01-27 14:30', comments: 'HR confirmed promotion' },
        { approver: 'John Smith', role: 'CEO', decision: 'pending' }
      ],
      requiredApprovals: 2,
      currentApprovals: 1,
      walletId: '2',
      walletName: 'Operations Multi-Sig',
      ruleId: '5',
      ruleName: 'Employee Monthly Limit'
    },
    {
      id: '5',
      type: 'geographic_override',
      title: 'Geographic Override for European Office',
      description: 'Override geographic restrictions for legitimate European operations',
      requestedBy: 'Emily Davis',
      requestedByRole: 'Treasury Manager',
      requestedAt: '2024-01-26 08:45',
      currentLimit: 'Blocked',
      requestedLimit: 'Allow EU transactions',
      amount: '$750,000',
      reason: 'Legitimate business operations in European office',
      justification: 'London office requires ability to process local vendor payments and employee expenses for new European expansion.',
      duration: 'Permanent',
      status: 'rejected',
      priority: 'low',
      approvals: [
        { approver: 'David Wilson', role: 'Compliance Officer', decision: 'rejected', timestamp: '2024-01-26 12:30', comments: 'Requires additional compliance review and geographic KYC verification' },
        { approver: 'John Smith', role: 'CEO', decision: 'pending' }
      ],
      requiredApprovals: 3,
      currentApprovals: 0,
      walletId: '3',
      walletName: 'Compliance Escrow Wallet',
      ruleId: '4',
      ruleName: 'Geographic Restriction'
    },
    {
      id: '6',
      type: 'limit_increase',
      title: 'Increase USDC Transfer Limits for Market Making',
      description: 'Permanent increase in USDC transfer limits for market making activities',
      requestedBy: 'Robert Chen',
      requestedByRole: 'Market Operations Manager',
      requestedAt: '2024-01-25 15:20',
      currentLimit: '$2,500,000',
      requestedLimit: '$10,000,000',
      reason: 'Expanded market making operations require higher USDC capacity',
      justification: 'New partnerships with major exchanges require ability to provide deeper liquidity with higher transaction volumes.',
      status: 'expired',
      priority: 'medium',
      approvals: [
        { approver: 'Sarah Johnson', role: 'CFO', decision: 'pending' },
        { approver: 'Michael Brown', role: 'CTO', decision: 'pending' }
      ],
      requiredApprovals: 2,
      currentApprovals: 0,
      walletId: '1',
      walletName: 'Executive Treasury Wallet',
      ruleId: '6',
      ruleName: 'USDC Transfer Limit'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 border-green-200"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 border-red-200"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      case 'expired':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200"><Clock className="w-3 h-3 mr-1" />Expired</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical':
        return <Badge className="bg-red-600 text-white">Critical</Badge>;
      case 'high':
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200">High</Badge>;
      case 'medium':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Medium</Badge>;
      case 'low':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Low</Badge>;
      default:
        return <Badge variant="secondary">{priority}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'limit_increase':
        return <DollarSign className="w-4 h-4" />;
      case 'temporary_override':
        return <Clock className="w-4 h-4" />;
      case 'emergency_bypass':
        return <AlertTriangle className="w-4 h-4" />;
      case 'role_exception':
        return <Users className="w-4 h-4" />;
      case 'geographic_override':
        return <Shield className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const filteredApprovals = limitApprovals.filter(approval => {
    const matchesStatus = filterStatus === 'all' || approval.status === filterStatus;
    const matchesType = filterType === 'all' || approval.type === filterType;
    const matchesPriority = filterPriority === 'all' || approval.priority === filterPriority;

    // Tab-specific filtering
    if (selectedTab === 'pending') {
      return approval.status === 'pending' && matchesType && matchesPriority;
    }
    if (selectedTab === 'approved') {
      return approval.status === 'approved' && matchesType && matchesPriority;
    }
    if (selectedTab === 'rejected') {
      return (approval.status === 'rejected' || approval.status === 'expired') && matchesType && matchesPriority;
    }

    return matchesStatus && matchesType && matchesPriority;
  });

  const handleViewApproval = (approval: LimitApproval) => {
    setSelectedApproval(approval);
    setIsApprovalDetailsOpen(true);
  };

  const handleApprovalDecision = (approvalId: string, decision: 'approved' | 'rejected') => {
    // In a real app, this would make an API call
    console.log('Approval decision:', approvalId, decision);
  };

  const getApprovalStats = (status: string) => {
    return limitApprovals.filter(a => a.status === status).length;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Limit Approvals</h1>
          <p className="text-gray-600">Review and approve limit increase requests and overrides</p>
        </div>
        <Button
          className="bg-orange-400 hover:bg-orange-500 text-white border-orange-400 hover:border-orange-500"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Approvals</p>
                <p className="text-2xl font-bold text-yellow-600">{getApprovalStats('pending')}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approved Today</p>
                <p className="text-2xl font-bold text-green-600">{getApprovalStats('approved')}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rejected/Expired</p>
                <p className="text-2xl font-bold text-red-600">
                  {getApprovalStats('rejected') + getApprovalStats('expired')}
                </p>
              </div>
              <XCircle className="w-8 h-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Critical Priority</p>
                <p className="text-2xl font-bold text-orange-600">
                  {limitApprovals.filter(a => a.priority === 'critical').length}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending">Pending ({getApprovalStats('pending')})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({getApprovalStats('approved')})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({getApprovalStats('rejected') + getApprovalStats('expired')})</TabsTrigger>
          <TabsTrigger value="all">All Requests</TabsTrigger>
        </TabsList>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-4 items-center">
              <Label>Filters:</Label>
              {selectedTab === 'all' && (
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              )}
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Request Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="limit_increase">Limit Increase</SelectItem>
                  <SelectItem value="temporary_override">Temporary Override</SelectItem>
                  <SelectItem value="emergency_bypass">Emergency Bypass</SelectItem>
                  <SelectItem value="role_exception">Role Exception</SelectItem>
                  <SelectItem value="geographic_override">Geographic Override</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <TabsContent value={selectedTab} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Approval Requests ({filteredApprovals.length})
              </CardTitle>
              <CardDescription>
                {selectedTab === 'pending' && 'Requests awaiting your approval decision'}
                {selectedTab === 'approved' && 'Recently approved limit requests'}
                {selectedTab === 'rejected' && 'Rejected or expired requests'}
                {selectedTab === 'all' && 'All limit approval requests'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Request</TableHead>
                    <TableHead>Requested By</TableHead>
                    <TableHead>Current → Requested</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Approvals</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApprovals.map((approval) => (
                    <TableRow key={approval.id}>
                      <TableCell>
                        <div className="flex items-start gap-3">
                          <div className="mt-1">{getTypeIcon(approval.type)}</div>
                          <div>
                            <p className="font-medium">{approval.title}</p>
                            <p className="text-sm text-gray-600">{approval.description}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {approval.walletName} • {approval.ruleName}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{approval.requestedBy}</p>
                          <p className="text-sm text-gray-600">{approval.requestedByRole}</p>
                          <p className="text-xs text-gray-500">{approval.requestedAt}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p className="text-gray-600">{approval.currentLimit}</p>
                          <p className="text-gray-400">↓</p>
                          <p className="font-medium">{approval.requestedLimit}</p>
                          {approval.amount && (
                            <p className="text-orange-600 font-medium">({approval.amount})</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getPriorityBadge(approval.priority)}</TableCell>
                      <TableCell>
                        <div className="text-center">
                          <p className="font-medium">
                            {approval.currentApprovals}/{approval.requiredApprovals}
                          </p>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div
                              className="bg-orange-400 h-2 rounded-full"
                              style={{
                                width: `${(approval.currentApprovals / approval.requiredApprovals) * 100}%`
                              }}
                            ></div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(approval.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewApproval(approval)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {approval.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                className="bg-green-400 hover:bg-green-500 text-white"
                                onClick={() => handleApprovalDecision(approval.id, 'approved')}
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 border-red-300 hover:bg-red-50"
                                onClick={() => handleApprovalDecision(approval.id, 'rejected')}
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </>
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
      </Tabs>

      {/* Approval Details Dialog */}
      <Dialog open={isApprovalDetailsOpen} onOpenChange={setIsApprovalDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Approval Request Details</DialogTitle>
            <DialogDescription>
              Review the complete approval request information
            </DialogDescription>
          </DialogHeader>
          {selectedApproval && (
            <div className="space-y-6">
              {/* Request Overview */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label>Request Type</Label>
                    <div className="flex items-center gap-2 mt-1">
                      {getTypeIcon(selectedApproval.type)}
                      <span className="font-medium capitalize">{selectedApproval.type.replace('_', ' ')}</span>
                    </div>
                  </div>
                  <div>
                    <Label>Title</Label>
                    <p className="font-medium">{selectedApproval.title}</p>
                  </div>
                  <div>
                    <Label>Description</Label>
                    <p className="text-gray-700">{selectedApproval.description}</p>
                  </div>
                  <div>
                    <Label>Reason</Label>
                    <p className="text-gray-700">{selectedApproval.reason}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label>Requested By</Label>
                    <p className="font-medium">{selectedApproval.requestedBy}</p>
                    <p className="text-sm text-gray-600">{selectedApproval.requestedByRole}</p>
                  </div>
                  <div>
                    <Label>Requested Date</Label>
                    <p className="font-medium">{selectedApproval.requestedAt}</p>
                  </div>
                  <div>
                    <Label>Priority</Label>
                    <div className="mt-1">{getPriorityBadge(selectedApproval.priority)}</div>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <div className="mt-1">{getStatusBadge(selectedApproval.status)}</div>
                  </div>
                </div>
              </div>

              {/* Limit Changes */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <Label>Limit Changes</Label>
                <div className="grid grid-cols-3 gap-4 mt-2">
                  <div>
                    <p className="text-sm text-gray-600">Current Limit</p>
                    <p className="font-medium">{selectedApproval.currentLimit}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Requested Limit</p>
                    <p className="font-medium text-orange-600">{selectedApproval.requestedLimit}</p>
                  </div>
                  {selectedApproval.amount && (
                    <div>
                      <p className="text-sm text-gray-600">Transaction Amount</p>
                      <p className="font-medium">{selectedApproval.amount}</p>
                    </div>
                  )}
                </div>
                {selectedApproval.duration && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">Duration</p>
                    <p className="font-medium">{selectedApproval.duration}</p>
                    {selectedApproval.expiresAt && (
                      <p className="text-xs text-gray-500">Expires: {selectedApproval.expiresAt}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Justification */}
              <div>
                <Label>Business Justification</Label>
                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-gray-700">{selectedApproval.justification}</p>
                </div>
              </div>

              {/* Approval Status */}
              <div>
                <Label>Approval Progress ({selectedApproval.currentApprovals}/{selectedApproval.requiredApprovals})</Label>
                <div className="mt-2 space-y-2">
                  {selectedApproval.approvals.map((approval, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          approval.decision === 'approved' ? 'bg-green-500' :
                          approval.decision === 'rejected' ? 'bg-red-500' : 'bg-gray-300'
                        }`} />
                        <div>
                          <p className="font-medium">{approval.approver}</p>
                          <p className="text-sm text-gray-600">{approval.role}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge
                          className={
                            approval.decision === 'approved' ? 'bg-green-100 text-green-800 border-green-200' :
                            approval.decision === 'rejected' ? 'bg-red-100 text-red-800 border-red-200' :
                            'bg-yellow-100 text-yellow-800 border-yellow-200'
                          }
                        >
                          {approval.decision === 'approved' ? <CheckCircle className="w-3 h-3 mr-1" /> :
                           approval.decision === 'rejected' ? <XCircle className="w-3 h-3 mr-1" /> :
                           <Clock className="w-3 h-3 mr-1" />}
                          {approval.decision}
                        </Badge>
                        {approval.timestamp && (
                          <p className="text-xs text-gray-500 mt-1">{approval.timestamp}</p>
                        )}
                        {approval.comments && (
                          <p className="text-xs text-gray-600 mt-1 italic">"{approval.comments}"</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Attachments */}
              {selectedApproval.attachments && selectedApproval.attachments.length > 0 && (
                <div>
                  <Label>Attachments</Label>
                  <div className="mt-2 space-y-2">
                    {selectedApproval.attachments.map((attachment, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 border rounded">
                        <FileText className="w-4 h-4" />
                        <span className="text-sm">{attachment}</span>
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              {selectedApproval.status === 'pending' && (
                <div className="flex gap-3 justify-end pt-4 border-t">
                  <Button variant="outline">
                    Request More Information
                  </Button>
                  <Button
                    variant="outline"
                    className="text-red-600 border-red-300 hover:bg-red-50"
                    onClick={() => {
                      handleApprovalDecision(selectedApproval.id, 'rejected');
                      setIsApprovalDetailsOpen(false);
                    }}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject Request
                  </Button>
                  <Button
                    className="bg-green-400 hover:bg-green-500 text-white"
                    onClick={() => {
                      handleApprovalDecision(selectedApproval.id, 'approved');
                      setIsApprovalDetailsOpen(false);
                    }}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve Request
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}