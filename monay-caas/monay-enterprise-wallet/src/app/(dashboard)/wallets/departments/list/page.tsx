'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Briefcase,
  Plus,
  Search,
  Filter,
  Download,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Activity,
  Settings,
  Eye,
  Edit,
  MoreVertical,
  Building,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Clock,
  Shield
} from 'lucide-react';

interface DepartmentWallet {
  id: string;
  department: string;
  walletName: string;
  address: string;
  balance: {
    total: number;
    allocated: number;
    available: number;
  };
  monthlyBudget: number;
  spent: number;
  employees: number;
  status: 'active' | 'restricted' | 'frozen';
  manager: string;
  lastActivity: Date;
  transactionCount: number;
  compliance: {
    status: 'compliant' | 'warning' | 'violation';
    lastReview: Date;
  };
}

export default function DepartmentListPage() {
  const router = useRouter();
  const [isAddDepartmentOpen, setIsAddDepartmentOpen] = useState(false);
  const [newDepartment, setNewDepartment] = useState({
    department: '',
    walletName: '',
    monthlyBudget: '',
    manager: '',
    employees: ''
  });

  const [departments, setDepartments] = useState<DepartmentWallet[]>([
    {
      id: 'dept-001',
      department: 'Finance',
      walletName: 'Finance Operations',
      address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1',
      balance: {
        total: 2500000,
        allocated: 2000000,
        available: 500000
      },
      monthlyBudget: 500000,
      spent: 125000,
      employees: 12,
      status: 'active',
      manager: 'Sarah Johnson',
      lastActivity: new Date(Date.now() - 1000 * 60 * 30),
      transactionCount: 156,
      compliance: {
        status: 'compliant',
        lastReview: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7)
      }
    },
    {
      id: 'dept-002',
      department: 'HR',
      walletName: 'HR Payroll & Benefits',
      address: '0x8Ba1f109551bD432803012645Ac136ddd64DBA22',
      balance: {
        total: 1200000,
        allocated: 1000000,
        available: 200000
      },
      monthlyBudget: 300000,
      spent: 245000,
      employees: 8,
      status: 'active',
      manager: 'Mike Davis',
      lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 2),
      transactionCount: 89,
      compliance: {
        status: 'compliant',
        lastReview: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5)
      }
    },
    {
      id: 'dept-003',
      department: 'Procurement',
      walletName: 'Vendor Payments',
      address: '0x3f5CE5FBFe3E9af3971dD833D26BA9b5C936f0bE',
      balance: {
        total: 800000,
        allocated: 650000,
        available: 150000
      },
      monthlyBudget: 200000,
      spent: 180000,
      employees: 5,
      status: 'restricted',
      manager: 'Emily Chen',
      lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 6),
      transactionCount: 234,
      compliance: {
        status: 'warning',
        lastReview: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3)
      }
    },
    {
      id: 'dept-004',
      department: 'Marketing',
      walletName: 'Marketing Campaigns',
      address: '0x9f4A8C8EbC7D5F1a3B2E6D4C8A7B5E9F2C1A8D6E',
      balance: {
        total: 450000,
        allocated: 400000,
        available: 50000
      },
      monthlyBudget: 150000,
      spent: 142000,
      employees: 15,
      status: 'active',
      manager: 'David Rodriguez',
      lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 4),
      transactionCount: 67,
      compliance: {
        status: 'compliant',
        lastReview: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2)
      }
    },
    {
      id: 'dept-005',
      department: 'Operations',
      walletName: 'Operations & Facilities',
      address: '0x1A2B3C4D5E6F7A8B9C0D1E2F3A4B5C6D7E8F9A0B',
      balance: {
        total: 320000,
        allocated: 280000,
        available: 40000
      },
      monthlyBudget: 100000,
      spent: 85000,
      employees: 20,
      status: 'active',
      manager: 'Lisa Wong',
      lastActivity: new Date(Date.now() - 1000 * 60 * 45),
      transactionCount: 123,
      compliance: {
        status: 'compliant',
        lastReview: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1)
      }
    },
    {
      id: 'dept-006',
      department: 'IT',
      walletName: 'IT Infrastructure',
      address: '0x2B3C4D5E6F7A8B9C0D1E2F3A4B5C6D7E8F9A0B1C',
      balance: {
        total: 600000,
        allocated: 500000,
        available: 100000
      },
      monthlyBudget: 120000,
      spent: 95000,
      employees: 10,
      status: 'frozen',
      manager: 'James Park',
      lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      transactionCount: 45,
      compliance: {
        status: 'violation',
        lastReview: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10)
      }
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [complianceFilter, setComplianceFilter] = useState('all');

  const filteredDepartments = departments.filter(dept => {
    const matchesSearch = dept.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          dept.manager.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || dept.status === statusFilter;
    const matchesCompliance = complianceFilter === 'all' || dept.compliance.status === complianceFilter;
    return matchesSearch && matchesStatus && matchesCompliance;
  });

  const totalBalance = departments.reduce((sum, dept) => sum + dept.balance.total, 0);
  const totalBudget = departments.reduce((sum, dept) => sum + dept.monthlyBudget, 0);
  const totalSpent = departments.reduce((sum, dept) => sum + dept.spent, 0);
  const activeDepartments = departments.filter(dept => dept.status === 'active').length;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-700">Active</Badge>;
      case 'restricted':
        return <Badge className="bg-orange-100 text-orange-700">Restricted</Badge>;
      case 'frozen':
        return <Badge className="bg-red-100 text-red-700">Frozen</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getComplianceBadge = (status: string) => {
    switch (status) {
      case 'compliant':
        return <Badge className="bg-green-100 text-green-700">Compliant</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-700">Warning</Badge>;
      case 'violation':
        return <Badge className="bg-red-100 text-red-700">Violation</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getComplianceIcon = (status: string) => {
    switch (status) {
      case 'compliant':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'violation':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getBudgetUsageColor = (spent: number, budget: number) => {
    const percentage = (spent / budget) * 100;
    if (percentage > 90) return 'text-red-600';
    if (percentage > 75) return 'text-orange-600';
    return 'text-green-600';
  };

  const handleAddDepartment = () => {
    // Generate a random wallet address for demo
    const randomAddress = '0x' + Array.from({ length: 40 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('');

    const newDept: DepartmentWallet = {
      id: `dept-${String(departments.length + 1).padStart(3, '0')}`,
      department: newDepartment.department,
      walletName: newDepartment.walletName,
      address: randomAddress,
      balance: {
        total: 0,
        allocated: 0,
        available: 0
      },
      monthlyBudget: parseFloat(newDepartment.monthlyBudget) || 0,
      spent: 0,
      employees: parseInt(newDepartment.employees) || 0,
      status: 'active',
      manager: newDepartment.manager,
      lastActivity: new Date(),
      transactionCount: 0,
      compliance: {
        status: 'compliant',
        lastReview: new Date()
      }
    };

    setDepartments([...departments, newDept]);
    setIsAddDepartmentOpen(false);

    // Reset form
    setNewDepartment({
      department: '',
      walletName: '',
      monthlyBudget: '',
      manager: '',
      employees: ''
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setNewDepartment(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Department Wallets</h1>
          <p className="text-gray-600 mt-1">Manage departmental budgets and wallet allocations</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button
            size="sm"
            className="bg-orange-400 hover:bg-orange-500 text-white border-orange-400 hover:border-orange-500"
            onClick={() => setIsAddDepartmentOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Department
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
              {formatCurrency(totalBalance)}
            </div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-xs text-green-600">+8.2% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">
              Monthly Budget
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalBudget)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {formatCurrency(totalSpent)} spent ({Math.round((totalSpent / totalBudget) * 100)}%)
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">
              Active Departments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeDepartments}</div>
            <div className="text-xs text-gray-500 mt-1">
              of {departments.length} total departments
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">
              Compliance Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round((departments.filter(d => d.compliance.status === 'compliant').length / departments.length) * 100)}%
            </div>
            <div className="flex items-center gap-1 mt-1">
              <Shield className="w-4 h-4 text-green-600" />
              <span className="text-xs text-green-600">All checks current</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search departments or managers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="restricted">Restricted</SelectItem>
                <SelectItem value="frozen">Frozen</SelectItem>
              </SelectContent>
            </Select>
            <Select value={complianceFilter} onValueChange={setComplianceFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Compliance" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Compliance</SelectItem>
                <SelectItem value="compliant">Compliant</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="violation">Violation</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Departments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Department Wallets</CardTitle>
          <CardDescription>
            {filteredDepartments.length} departments found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Department</TableHead>
                <TableHead>Balance & Budget</TableHead>
                <TableHead>Team</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Compliance</TableHead>
                <TableHead>Last Activity</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDepartments.map((dept) => (
                <TableRow key={dept.id} className="cursor-pointer hover:bg-gray-50">
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Briefcase className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium">{dept.department}</div>
                        <div className="text-sm text-gray-500">{dept.walletName}</div>
                        <div className="text-xs text-gray-400 font-mono">
                          {dept.address.slice(0, 8)}...{dept.address.slice(-6)}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{formatCurrency(dept.balance.total)}</div>
                      <div className="text-sm text-gray-500">
                        Available: {formatCurrency(dept.balance.available)}
                      </div>
                      <div className={`text-xs ${getBudgetUsageColor(dept.spent, dept.monthlyBudget)}`}>
                        {formatCurrency(dept.spent)} / {formatCurrency(dept.monthlyBudget)}
                        ({Math.round((dept.spent / dept.monthlyBudget) * 100)}%)
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{dept.employees} employees</div>
                      <div className="text-sm text-gray-500">Manager: {dept.manager}</div>
                      <div className="text-xs text-gray-400">
                        {dept.transactionCount} transactions
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(dept.status)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getComplianceIcon(dept.compliance.status)}
                      {getComplianceBadge(dept.compliance.status)}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      Review: {formatTimeAgo(dept.compliance.lastReview)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {formatTimeAgo(dept.lastActivity)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-orange-300 text-orange-600 hover:bg-orange-50 hover:text-orange-700"
                        onClick={() => router.push(`/wallets/departments/${dept.id}`)}
                        title="View department details"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-orange-300 text-orange-600 hover:bg-orange-50 hover:text-orange-700"
                        onClick={() => router.push(`/wallets/departments/${dept.id}/settings`)}
                        title="Department settings"
                      >
                        <Settings className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        className="bg-orange-400 hover:bg-orange-500 text-white border-orange-400 hover:border-orange-500"
                        onClick={() => router.push(`/wallets/departments/${dept.id}/edit`)}
                        title="Edit department"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Department Dialog */}
      <Dialog open={isAddDepartmentOpen} onOpenChange={setIsAddDepartmentOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Department Wallet</DialogTitle>
            <DialogDescription>
              Create a new department wallet with budget allocation and team management.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="department">Department Name *</Label>
                <Input
                  id="department"
                  placeholder="e.g., Sales"
                  value={newDepartment.department}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="walletName">Wallet Name *</Label>
                <Input
                  id="walletName"
                  placeholder="e.g., Sales Operations"
                  value={newDepartment.walletName}
                  onChange={(e) => handleInputChange('walletName', e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="monthlyBudget">Monthly Budget (USD) *</Label>
                <Input
                  id="monthlyBudget"
                  type="number"
                  placeholder="e.g., 100000"
                  value={newDepartment.monthlyBudget}
                  onChange={(e) => handleInputChange('monthlyBudget', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="employees">Number of Employees *</Label>
                <Input
                  id="employees"
                  type="number"
                  placeholder="e.g., 10"
                  value={newDepartment.employees}
                  onChange={(e) => handleInputChange('employees', e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="manager">Department Manager *</Label>
              <Input
                id="manager"
                placeholder="e.g., John Smith"
                value={newDepartment.manager}
                onChange={(e) => handleInputChange('manager', e.target.value)}
              />
            </div>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> A new blockchain wallet will be automatically created for this department with multi-signature security and spending controls.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddDepartmentOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-orange-400 hover:bg-orange-500 text-white"
              onClick={handleAddDepartment}
              disabled={
                !newDepartment.department ||
                !newDepartment.walletName ||
                !newDepartment.monthlyBudget ||
                !newDepartment.manager ||
                !newDepartment.employees
              }
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Department Wallet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}