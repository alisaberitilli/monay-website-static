'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  Users,
  Wallet,
  DollarSign,
  Calendar,
  CheckCircle,
  AlertCircle,
  Upload,
  Download,
  FileText,
  Clock,
  Info,
  Shield,
  Plus,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

interface Employee {
  id: string;
  name: string;
  email: string;
  walletAddress: string;
  salary: number;
  department: string;
}

export default function PayrollPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fromWallet: '',
    payPeriod: 'monthly',
    payDate: '',
    currency: 'USDC',
    rail: 'evm',
  });

  const [employees, setEmployees] = useState<Employee[]>([
    {
      id: 'emp-001',
      name: 'John Smith',
      email: 'john.smith@company.com',
      walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      salary: 5000,
      department: 'Engineering',
    },
    {
      id: 'emp-002',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@company.com',
      walletAddress: '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
      salary: 4500,
      department: 'Marketing',
    },
    {
      id: 'emp-003',
      name: 'Michael Chen',
      email: 'michael.chen@company.com',
      walletAddress: '0x1aD91ee08f21bE3dE0BA2ba6918E714dA6B45836',
      salary: 6000,
      department: 'Engineering',
    },
  ]);

  const [selectedEmployees, setSelectedEmployees] = useState<string[]>(
    employees.map(e => e.id)
  );

  const wallets = [
    { id: 'payroll-001', name: 'Payroll Wallet', balance: 1250000, network: 'Base Sepolia' },
    { id: 'corp-002', name: 'Corporate Operations Wallet', balance: 425850, network: 'Base Sepolia' },
    { id: 'treasury-001', name: 'Treasury Reserve Wallet', balance: 5000000, network: 'Base Mainnet' },
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const toggleEmployee = (employeeId: string) => {
    setSelectedEmployees(prev =>
      prev.includes(employeeId)
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const calculateTotalPayroll = () => {
    return employees
      .filter(emp => selectedEmployees.includes(emp.id))
      .reduce((sum, emp) => sum + emp.salary, 0);
  };

  const handleProcessPayroll = () => {
    if (!formData.fromWallet || selectedEmployees.length === 0) {
      toast.error('Please select a wallet and at least one employee');
      return;
    }
    setStep(2);
  };

  const handleConfirmPayroll = () => {
    // Simulate processing
    toast.success('Payroll initiated successfully!');
    setTimeout(() => {
      router.push('/payments');
    }, 1500);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="border-orange-300 text-orange-600 hover:bg-orange-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Payroll Processing</h1>
            <p className="text-gray-500 mt-1">Process employee payments via blockchain</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Upload className="w-4 h-4 mr-2" />
            Import CSV
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-4">
        <div className={`flex items-center gap-2 ${step >= 1 ? 'text-orange-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-orange-500 text-white' : 'bg-gray-200'}`}>
            1
          </div>
          <span className="font-medium">Select Employees</span>
        </div>
        <div className={`w-16 h-1 ${step >= 2 ? 'bg-orange-500' : 'bg-gray-200'}`} />
        <div className={`flex items-center gap-2 ${step >= 2 ? 'text-orange-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-orange-500 text-white' : 'bg-gray-200'}`}>
            2
          </div>
          <span className="font-medium">Review & Process</span>
        </div>
      </div>

      {/* Step 1: Employee Selection */}
      {step === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-orange-600" />
                  Payroll Configuration
                </CardTitle>
                <CardDescription>Select wallet and configure payroll settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* From Wallet */}
                <div className="space-y-2">
                  <Label htmlFor="fromWallet" className="flex items-center gap-2">
                    <Wallet className="w-4 h-4" />
                    Payroll Wallet *
                  </Label>
                  <Select value={formData.fromWallet} onValueChange={(value) => handleInputChange('fromWallet', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payroll wallet" />
                    </SelectTrigger>
                    <SelectContent>
                      {wallets.map((wallet) => (
                        <SelectItem key={wallet.id} value={wallet.id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{wallet.name}</span>
                            <span className="text-sm text-gray-500 ml-4">{formatCurrency(wallet.balance)}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formData.fromWallet && (
                    <p className="text-sm text-gray-500">
                      Available: {formatCurrency(wallets.find(w => w.id === formData.fromWallet)?.balance || 0)}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="payPeriod" className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Pay Period
                    </Label>
                    <Select value={formData.payPeriod} onValueChange={(value) => handleInputChange('payPeriod', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="biweekly">Bi-weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="payDate">Pay Date</Label>
                    <Input
                      id="payDate"
                      type="date"
                      value={formData.payDate}
                      onChange={(e) => handleInputChange('payDate', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select value={formData.currency} onValueChange={(value) => handleInputChange('currency', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USDC">USDC</SelectItem>
                        <SelectItem value="USDT">USDT</SelectItem>
                        <SelectItem value="PYUSD">PYUSD</SelectItem>
                        <SelectItem value="USDXM">USDXM (Monay)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rail">Blockchain Rail</Label>
                    <Select value={formData.rail} onValueChange={(value) => handleInputChange('rail', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="evm">EVM (Base, Polygon)</SelectItem>
                        <SelectItem value="solana">Solana</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Employee List */}
            <Card className="mt-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Employee Selection</CardTitle>
                    <CardDescription>
                      {selectedEmployees.length} of {employees.length} employees selected
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Employee
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {employees.map((employee) => (
                    <div
                      key={employee.id}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedEmployees.includes(employee.id)
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => toggleEmployee(employee.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                            selectedEmployees.includes(employee.id)
                              ? 'border-orange-500 bg-orange-500'
                              : 'border-gray-300'
                          }`}>
                            {selectedEmployees.includes(employee.id) && (
                              <CheckCircle className="w-4 h-4 text-white fill-current" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{employee.name}</p>
                            <p className="text-sm text-gray-500">{employee.email}</p>
                            <p className="text-xs text-gray-400 font-mono mt-1">{employee.walletAddress}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-lg">{formatCurrency(employee.salary)}</p>
                          <Badge variant="outline" className="text-xs">
                            {employee.department}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={handleProcessPayroll}
                  className="w-full mt-6 bg-orange-500 hover:bg-orange-600 text-white"
                  size="lg"
                  disabled={selectedEmployees.length === 0 || !formData.fromWallet}
                >
                  Continue to Review
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Info Panel */}
          <div className="space-y-4">
            <Card className="border-blue-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Info className="h-4 w-4 text-blue-600" />
                  Payroll Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <Shield className="w-4 h-4 text-blue-600 mt-0.5" />
                  <p className="text-gray-600">
                    All payroll transactions are processed on-chain for complete transparency
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-blue-600 mt-0.5" />
                  <p className="text-gray-600">
                    Batch processing completes in 5-10 seconds for all employees
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <DollarSign className="w-4 h-4 text-blue-600 mt-0.5" />
                  <p className="text-gray-600">
                    Network fees are optimized for batch transactions
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-orange-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Payroll Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Employees</span>
                  <span className="font-medium">{selectedEmployees.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Amount</span>
                  <span className="font-medium">{formatCurrency(calculateTotalPayroll())}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Est. Network Fees</span>
                  <span className="font-medium">~$2.50</span>
                </div>
                <div className="border-t pt-2 mt-2 flex items-center justify-between font-semibold">
                  <span>Total Cost</span>
                  <span>{formatCurrency(calculateTotalPayroll() + 2.5)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Step 2: Review & Confirm */}
      {step === 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-orange-600" />
                  Payroll Summary
                </CardTitle>
                <CardDescription>Review payroll details before processing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-500">Payroll Wallet</p>
                    <p className="font-medium">
                      {wallets.find(w => w.id === formData.fromWallet)?.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Pay Period</p>
                    <p className="font-medium capitalize">{formData.payPeriod}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Currency</p>
                    <p className="font-medium">{formData.currency}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Blockchain Rail</p>
                    <p className="font-medium">{formData.rail === 'evm' ? 'EVM' : 'Solana'}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Payment Recipients ({selectedEmployees.length})</h4>
                  <div className="space-y-2">
                    {employees
                      .filter(emp => selectedEmployees.includes(emp.id))
                      .map((employee) => (
                        <div
                          key={employee.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div>
                            <p className="font-medium">{employee.name}</p>
                            <p className="text-xs text-gray-500 font-mono">{employee.walletAddress}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{formatCurrency(employee.salary)}</p>
                            <p className="text-xs text-gray-500">{formData.currency}</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between text-lg font-semibold">
                    <span>Total Payroll Amount</span>
                    <span className="text-orange-600">{formatCurrency(calculateTotalPayroll())}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="flex-1"
                  >
                    Back to Edit
                  </Button>
                  <Button
                    onClick={handleConfirmPayroll}
                    className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Process Payroll
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="border-green-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-600" />
                  Compliance Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-gray-600">All employees KYC verified</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-gray-600">Wallet addresses validated</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-gray-600">Tax reporting enabled</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-gray-600">Audit trail recorded</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-orange-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Estimated Fees</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Network Fee</span>
                  <span className="font-medium">$2.00</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Platform Fee</span>
                  <span className="font-medium">$0.50</span>
                </div>
                <div className="border-t pt-2 mt-2 flex items-center justify-between font-semibold">
                  <span>Total Fee</span>
                  <span>$2.50</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  Processing Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Batch processing: <span className="font-medium">5-10 seconds</span>
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
