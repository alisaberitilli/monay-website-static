'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  PieChart,
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ArrowRight,
  ArrowLeft,
  Plus,
  Settings,
  RefreshCcw,
  Download,
  Upload,
  Edit,
  Save,
  AlertTriangle,
  CheckCircle,
  Users,
  Building,
  Briefcase
} from 'lucide-react';

interface DepartmentAllocation {
  id: string;
  department: string;
  allocated: number;
  spent: number;
  remaining: number;
  monthlyBudget: number;
  employees: number;
  manager: string;
  priority: 'high' | 'medium' | 'low';
  utilizationRate: number;
  projectedNeed: number;
}

interface AllocationRequest {
  id: string;
  department: string;
  requestedAmount: number;
  currentAllocation: number;
  reason: string;
  urgency: 'urgent' | 'normal' | 'low';
  requestedBy: string;
  requestDate: Date;
  status: 'pending' | 'approved' | 'rejected';
}

export default function DepartmentAllocationsPage() {
  const [allocations, setAllocations] = useState<DepartmentAllocation[]>([
    {
      id: 'alloc-001',
      department: 'Finance',
      allocated: 2500000,
      spent: 1875000,
      remaining: 625000,
      monthlyBudget: 500000,
      employees: 12,
      manager: 'Sarah Johnson',
      priority: 'high',
      utilizationRate: 75,
      projectedNeed: 650000
    },
    {
      id: 'alloc-002',
      department: 'HR',
      allocated: 1200000,
      spent: 900000,
      remaining: 300000,
      monthlyBudget: 300000,
      employees: 8,
      manager: 'Mike Davis',
      priority: 'high',
      utilizationRate: 75,
      projectedNeed: 320000
    },
    {
      id: 'alloc-003',
      department: 'Procurement',
      allocated: 800000,
      spent: 720000,
      remaining: 80000,
      monthlyBudget: 200000,
      employees: 5,
      manager: 'Emily Chen',
      priority: 'medium',
      utilizationRate: 90,
      projectedNeed: 180000
    },
    {
      id: 'alloc-004',
      department: 'Marketing',
      allocated: 450000,
      spent: 427500,
      remaining: 22500,
      monthlyBudget: 150000,
      employees: 15,
      manager: 'David Rodriguez',
      priority: 'medium',
      utilizationRate: 95,
      projectedNeed: 160000
    },
    {
      id: 'alloc-005',
      department: 'Operations',
      allocated: 320000,
      spent: 272000,
      remaining: 48000,
      monthlyBudget: 100000,
      employees: 20,
      manager: 'Lisa Wong',
      priority: 'low',
      utilizationRate: 85,
      projectedNeed: 105000
    },
    {
      id: 'alloc-006',
      department: 'IT',
      allocated: 600000,
      spent: 450000,
      remaining: 150000,
      monthlyBudget: 120000,
      employees: 10,
      manager: 'James Park',
      priority: 'high',
      utilizationRate: 75,
      projectedNeed: 125000
    }
  ]);

  const [requests, setRequests] = useState<AllocationRequest[]>([
    {
      id: 'req-001',
      department: 'Marketing',
      requestedAmount: 50000,
      currentAllocation: 450000,
      reason: 'Q4 campaign launch requires additional budget',
      urgency: 'urgent',
      requestedBy: 'David Rodriguez',
      requestDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
      status: 'pending'
    },
    {
      id: 'req-002',
      department: 'Procurement',
      requestedAmount: 75000,
      currentAllocation: 800000,
      reason: 'Unexpected vendor rate increases',
      urgency: 'normal',
      requestedBy: 'Emily Chen',
      requestDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
      status: 'approved'
    },
    {
      id: 'req-003',
      department: 'IT',
      requestedAmount: 30000,
      currentAllocation: 600000,
      reason: 'Security infrastructure upgrade',
      urgency: 'urgent',
      requestedBy: 'James Park',
      requestDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      status: 'pending'
    }
  ]);

  const [showReallocationDialog, setShowReallocationDialog] = useState(false);
  const [selectedAllocation, setSelectedAllocation] = useState<DepartmentAllocation | null>(null);
  const [newAllocationAmount, setNewAllocationAmount] = useState(0);

  const totalAllocated = allocations.reduce((sum, alloc) => sum + alloc.allocated, 0);
  const totalSpent = allocations.reduce((sum, alloc) => sum + alloc.spent, 0);
  const totalRemaining = allocations.reduce((sum, alloc) => sum + alloc.remaining, 0);
  const averageUtilization = allocations.reduce((sum, alloc) => sum + alloc.utilizationRate, 0) / allocations.length;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    return diffInDays === 0 ? 'Today' : `${diffInDays}d ago`;
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge className="bg-red-100 text-red-700">High Priority</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-700">Medium Priority</Badge>;
      case 'low':
        return <Badge className="bg-green-100 text-green-700">Low Priority</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'urgent':
        return <Badge className="bg-red-100 text-red-700">Urgent</Badge>;
      case 'normal':
        return <Badge className="bg-blue-100 text-blue-700">Normal</Badge>;
      case 'low':
        return <Badge className="bg-gray-100 text-gray-700">Low</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-700">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-700">Rejected</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getUtilizationColor = (rate: number) => {
    if (rate > 90) return 'text-red-600';
    if (rate > 75) return 'text-orange-600';
    return 'text-green-600';
  };

  const handleReallocation = (allocation: DepartmentAllocation) => {
    setSelectedAllocation(allocation);
    setNewAllocationAmount(allocation.allocated);
    setShowReallocationDialog(true);
  };

  const executeReallocation = () => {
    if (selectedAllocation) {
      setAllocations(prev => prev.map(alloc =>
        alloc.id === selectedAllocation.id
          ? { ...alloc, allocated: newAllocationAmount, remaining: newAllocationAmount - alloc.spent }
          : alloc
      ));
      setShowReallocationDialog(false);
      setSelectedAllocation(null);
    }
  };

  const handleRequestAction = (requestId: string, action: 'approve' | 'reject') => {
    setRequests(prev => prev.map(req =>
      req.id === requestId ? { ...req, status: action === 'approve' ? 'approved' : 'rejected' } : req
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Department Allocations</h1>
          <p className="text-gray-600 mt-1">Manage budget allocations and rebalancing across departments</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button
            size="sm"
            className="bg-orange-400 hover:bg-orange-500 text-white border-orange-400 hover:border-orange-500"
          >
            <RefreshCcw className="w-4 h-4 mr-2" />
            Rebalance All
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Allocated
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalAllocated)}
            </div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-xs text-green-600">+5.2% from last quarter</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Spent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalSpent)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {Math.round((totalSpent / totalAllocated) * 100)}% of allocated
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">
              Remaining Budget
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalRemaining)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Available for reallocation
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">
              Avg Utilization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(averageUtilization)}%</div>
            <div className="text-xs text-gray-500 mt-1">
              Across all departments
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="allocations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="allocations">Current Allocations</TabsTrigger>
          <TabsTrigger value="requests">Allocation Requests</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="projections">Projections</TabsTrigger>
        </TabsList>

        <TabsContent value="allocations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Department Budget Allocations</CardTitle>
              <CardDescription>
                Current budget allocations and utilization across all departments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {allocations.map((allocation) => (
                  <div key={allocation.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Briefcase className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-semibold">{allocation.department}</div>
                          <div className="text-sm text-gray-500">
                            {allocation.employees} employees • {allocation.manager}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getPriorityBadge(allocation.priority)}
                        <Button
                          size="sm"
                          onClick={() => handleReallocation(allocation)}
                          className="bg-orange-400 hover:bg-orange-500 text-white border-orange-400 hover:border-orange-500"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Reallocate
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-gray-500">Allocated</div>
                        <div className="font-semibold">{formatCurrency(allocation.allocated)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Spent</div>
                        <div className="font-semibold">{formatCurrency(allocation.spent)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Remaining</div>
                        <div className="font-semibold">{formatCurrency(allocation.remaining)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Utilization</div>
                        <div className={`font-semibold ${getUtilizationColor(allocation.utilizationRate)}`}>
                          {allocation.utilizationRate}%
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Budget Utilization</span>
                        <span>{allocation.utilizationRate}%</span>
                      </div>
                      <Progress value={allocation.utilizationRate} className="h-2" />
                    </div>

                    {allocation.utilizationRate > 90 && (
                      <div className="mt-3 p-2 bg-orange-50 border border-orange-200 rounded flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-orange-600" />
                        <span className="text-sm text-orange-700">
                          High utilization - consider reallocation for next period
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Allocation Requests</CardTitle>
              <CardDescription>
                Pending and recent allocation requests from departments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {requests.map((request) => (
                  <div key={request.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Building className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <div className="font-semibold">{request.department}</div>
                          <div className="text-sm text-gray-500">
                            Requested by {request.requestedBy} • {formatTimeAgo(request.requestDate)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getUrgencyBadge(request.urgency)}
                        {getStatusBadge(request.status)}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                      <div>
                        <div className="text-sm text-gray-500">Current Allocation</div>
                        <div className="font-semibold">{formatCurrency(request.currentAllocation)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Requested Amount</div>
                        <div className="font-semibold">{formatCurrency(request.requestedAmount)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">New Total</div>
                        <div className="font-semibold">
                          {formatCurrency(request.currentAllocation + request.requestedAmount)}
                        </div>
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="text-sm text-gray-500 mb-1">Reason</div>
                      <div className="text-sm">{request.reason}</div>
                    </div>

                    {request.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleRequestAction(request.id, 'approve')}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRequestAction(request.id, 'reject')}
                          className="border-red-300 text-red-600 hover:bg-red-50"
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Allocation Distribution</CardTitle>
                <CardDescription>Budget allocation by department</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-64">
                  <PieChart className="w-32 h-32 text-gray-400" />
                  <span className="ml-4 text-gray-500">Chart coming soon</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Utilization Trends</CardTitle>
                <CardDescription>6-month utilization trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-64">
                  <BarChart3 className="w-32 h-32 text-gray-400" />
                  <span className="ml-4 text-gray-500">Chart coming soon</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="projections" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Budget Projections</CardTitle>
              <CardDescription>
                Projected budget needs for next quarter based on current utilization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {allocations.map((allocation) => (
                  <div key={allocation.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Briefcase className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium">{allocation.department}</div>
                        <div className="text-sm text-gray-500">
                          Current: {formatCurrency(allocation.monthlyBudget)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">
                        {formatCurrency(allocation.projectedNeed)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {allocation.projectedNeed > allocation.monthlyBudget ? (
                          <span className="text-orange-600">
                            +{formatCurrency(allocation.projectedNeed - allocation.monthlyBudget)}
                          </span>
                        ) : (
                          <span className="text-green-600">
                            -{formatCurrency(allocation.monthlyBudget - allocation.projectedNeed)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Reallocation Dialog */}
      <Dialog open={showReallocationDialog} onOpenChange={setShowReallocationDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reallocate Budget</DialogTitle>
            <DialogDescription>
              Adjust the budget allocation for {selectedAllocation?.department}
            </DialogDescription>
          </DialogHeader>
          {selectedAllocation && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="current-allocation">Current Allocation</Label>
                <Input
                  id="current-allocation"
                  value={formatCurrency(selectedAllocation.allocated)}
                  disabled
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="new-allocation">New Allocation</Label>
                <Input
                  id="new-allocation"
                  type="number"
                  value={newAllocationAmount}
                  onChange={(e) => setNewAllocationAmount(parseInt(e.target.value))}
                  className="mt-1"
                />
              </div>
              <div className="text-sm text-gray-600">
                <div>Current Spent: {formatCurrency(selectedAllocation.spent)}</div>
                <div>New Remaining: {formatCurrency(newAllocationAmount - selectedAllocation.spent)}</div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReallocationDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={executeReallocation}
              className="bg-orange-400 hover:bg-orange-500 text-white border-orange-400 hover:border-orange-500"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Allocation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}