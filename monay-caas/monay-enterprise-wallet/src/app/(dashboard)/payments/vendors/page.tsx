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
import { Textarea } from '@/components/ui/textarea';
import {
  ArrowLeft,
  Building2,
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
  Search,
  Filter,
  Receipt,
} from 'lucide-react';
import { toast } from 'sonner';

interface Vendor {
  id: string;
  name: string;
  email: string;
  walletAddress: string;
  category: string;
  totalPaid: number;
  invoiceCount: number;
  status: 'active' | 'pending' | 'inactive';
}

interface Invoice {
  id: string;
  vendorId: string;
  invoiceNumber: string;
  amount: number;
  dueDate: string;
  description: string;
  status: 'unpaid' | 'pending' | 'paid';
}

export default function VendorsPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const [formData, setFormData] = useState({
    fromWallet: '',
    paymentDate: '',
    currency: 'USDC',
    rail: 'evm',
    batchNote: '',
  });

  const [vendors] = useState<Vendor[]>([
    {
      id: 'vendor-001',
      name: 'Cloud Services Inc.',
      email: 'billing@cloudservices.com',
      walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      category: 'Technology',
      totalPaid: 125000,
      invoiceCount: 24,
      status: 'active',
    },
    {
      id: 'vendor-002',
      name: 'Office Supplies Co.',
      email: 'accounts@officesupplies.com',
      walletAddress: '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
      category: 'Office',
      totalPaid: 45000,
      invoiceCount: 156,
      status: 'active',
    },
    {
      id: 'vendor-003',
      name: 'Marketing Agency Pro',
      email: 'finance@marketingpro.com',
      walletAddress: '0x1aD91ee08f21bE3dE0BA2ba6918E714dA6B45836',
      category: 'Marketing',
      totalPaid: 89000,
      invoiceCount: 12,
      status: 'active',
    },
    {
      id: 'vendor-004',
      name: 'Legal Advisors LLC',
      email: 'billing@legaladvisors.com',
      walletAddress: '0x9f2df0fed2c77648de5860a4cc508cd0818c85b8',
      category: 'Professional Services',
      totalPaid: 67000,
      invoiceCount: 8,
      status: 'active',
    },
    {
      id: 'vendor-005',
      name: 'Data Analytics Corp',
      email: 'ar@dataanalytics.com',
      walletAddress: '0x4e83362412b8d1bec281594ceA3052c8eb01311c',
      category: 'Technology',
      totalPaid: 112000,
      invoiceCount: 18,
      status: 'active',
    },
  ]);

  const [invoices, setInvoices] = useState<Invoice[]>([
    { id: 'inv-001', vendorId: 'vendor-001', invoiceNumber: 'INV-2024-001', amount: 5000, dueDate: '2024-10-15', description: 'Cloud hosting services - October', status: 'unpaid' },
    { id: 'inv-002', vendorId: 'vendor-002', invoiceNumber: 'INV-2024-045', amount: 1200, dueDate: '2024-10-20', description: 'Office supplies bulk order', status: 'unpaid' },
    { id: 'inv-003', vendorId: 'vendor-003', invoiceNumber: 'MAR-2024-Q3', amount: 15000, dueDate: '2024-10-10', description: 'Q3 Marketing campaign', status: 'unpaid' },
    { id: 'inv-004', vendorId: 'vendor-004', invoiceNumber: 'LEG-2024-092', amount: 8500, dueDate: '2024-10-25', description: 'Legal consultation services', status: 'unpaid' },
    { id: 'inv-005', vendorId: 'vendor-001', invoiceNumber: 'INV-2024-002', amount: 3500, dueDate: '2024-10-18', description: 'Additional cloud storage', status: 'unpaid' },
  ]);

  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);

  const wallets = [
    { id: 'vendor-001', name: 'Vendor Payments Wallet', balance: 850000, network: 'Polygon zkEVM' },
    { id: 'corp-001', name: 'Corporate Operations Wallet', balance: 425850, network: 'Base Sepolia' },
    { id: 'treasury-001', name: 'Treasury Reserve Wallet', balance: 5000000, network: 'Base Mainnet' },
  ];

  const categories = ['all', 'Technology', 'Office', 'Marketing', 'Professional Services', 'Other'];

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const toggleInvoice = (invoiceId: string) => {
    setSelectedInvoices(prev =>
      prev.includes(invoiceId)
        ? prev.filter(id => id !== invoiceId)
        : [...prev, invoiceId]
    );
  };

  const calculateTotalPayment = () => {
    return invoices
      .filter(inv => selectedInvoices.includes(inv.id))
      .reduce((sum, inv) => sum + inv.amount, 0);
  };

  const handleProcessPayments = () => {
    if (!formData.fromWallet || selectedInvoices.length === 0) {
      toast.error('Please select a wallet and at least one invoice');
      return;
    }
    setStep(2);
  };

  const handleConfirmPayments = () => {
    // Simulate processing
    toast.success(`${selectedInvoices.length} vendor payments initiated successfully!`);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getVendorById = (vendorId: string) => {
    return vendors.find(v => v.id === vendorId);
  };

  const filteredInvoices = invoices.filter(inv => {
    const vendor = getVendorById(inv.vendorId);
    const matchesSearch = vendor?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || vendor?.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
            <h1 className="text-3xl font-bold">Vendor Payments</h1>
            <p className="text-gray-500 mt-1">Process and manage vendor invoices</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Upload className="w-4 h-4 mr-2" />
            Import Invoices
          </Button>
          <Button variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Vendor
          </Button>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-4">
        <div className={`flex items-center gap-2 ${step >= 1 ? 'text-orange-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-orange-500 text-white' : 'bg-gray-200'}`}>
            1
          </div>
          <span className="font-medium">Select Invoices</span>
        </div>
        <div className={`w-16 h-1 ${step >= 2 ? 'bg-orange-500' : 'bg-gray-200'}`} />
        <div className={`flex items-center gap-2 ${step >= 2 ? 'text-orange-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-orange-500 text-white' : 'bg-gray-200'}`}>
            2
          </div>
          <span className="font-medium">Review & Process</span>
        </div>
      </div>

      {/* Step 1: Invoice Selection */}
      {step === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-orange-600" />
                  Payment Configuration
                </CardTitle>
                <CardDescription>Select wallet and configure vendor payment settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* From Wallet */}
                <div className="space-y-2">
                  <Label htmlFor="fromWallet" className="flex items-center gap-2">
                    <Wallet className="w-4 h-4" />
                    Payment Wallet *
                  </Label>
                  <Select value={formData.fromWallet} onValueChange={(value) => handleInputChange('fromWallet', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment wallet" />
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
                    <Label htmlFor="paymentDate" className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Payment Date
                    </Label>
                    <Input
                      id="paymentDate"
                      type="date"
                      value={formData.paymentDate}
                      onChange={(e) => handleInputChange('paymentDate', e.target.value)}
                    />
                  </div>

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

                <div className="space-y-2">
                  <Label htmlFor="batchNote">Batch Note (Optional)</Label>
                  <Textarea
                    id="batchNote"
                    placeholder="Add a note for this payment batch..."
                    value={formData.batchNote}
                    onChange={(e) => handleInputChange('batchNote', e.target.value)}
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Invoice List */}
            <Card className="mt-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Outstanding Invoices</CardTitle>
                    <CardDescription>
                      {selectedInvoices.length} of {filteredInvoices.length} invoices selected
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search and Filter */}
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search vendors or invoice numbers..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-48">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>
                          {cat === 'all' ? 'All Categories' : cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Invoice List */}
                <div className="space-y-3">
                  {filteredInvoices.map((invoice) => {
                    const vendor = getVendorById(invoice.vendorId);
                    return (
                      <div
                        key={invoice.id}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedInvoices.includes(invoice.id)
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => toggleInvoice(invoice.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 ${
                              selectedInvoices.includes(invoice.id)
                                ? 'border-orange-500 bg-orange-500'
                                : 'border-gray-300'
                            }`}>
                              {selectedInvoices.includes(invoice.id) && (
                                <CheckCircle className="w-4 h-4 text-white fill-current" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-medium">{vendor?.name}</p>
                                <Badge variant="outline" className="text-xs">
                                  {vendor?.category}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 flex items-center gap-1">
                                <Receipt className="w-3 h-3" />
                                {invoice.invoiceNumber}
                              </p>
                              <p className="text-sm text-gray-500 mt-1">{invoice.description}</p>
                              <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  Due: {formatDate(invoice.dueDate)}
                                </span>
                                <span className="font-mono">{vendor?.walletAddress.slice(0, 10)}...</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <p className="font-semibold text-lg">{formatCurrency(invoice.amount)}</p>
                            <Badge
                              variant="outline"
                              className={`text-xs mt-1 ${
                                invoice.status === 'unpaid'
                                  ? 'bg-red-50 text-red-700 border-red-200'
                                  : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                              }`}
                            >
                              {invoice.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <Button
                  onClick={handleProcessPayments}
                  className="w-full mt-6 bg-orange-500 hover:bg-orange-600 text-white"
                  size="lg"
                  disabled={selectedInvoices.length === 0 || !formData.fromWallet}
                >
                  Continue to Review ({selectedInvoices.length} invoices)
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
                  Vendor Payment Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <Shield className="w-4 h-4 text-blue-600 mt-0.5" />
                  <p className="text-gray-600">
                    All vendor payments are recorded on-chain for complete audit trail
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-blue-600 mt-0.5" />
                  <p className="text-gray-600">
                    Batch payments complete in 5-15 seconds depending on network
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <Receipt className="w-4 h-4 text-blue-600 mt-0.5" />
                  <p className="text-gray-600">
                    Invoice status automatically updated upon payment confirmation
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-orange-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Payment Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Selected Invoices</span>
                  <span className="font-medium">{selectedInvoices.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Amount</span>
                  <span className="font-medium">{formatCurrency(calculateTotalPayment())}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Est. Network Fees</span>
                  <span className="font-medium">~${(selectedInvoices.length * 0.5).toFixed(2)}</span>
                </div>
                <div className="border-t pt-2 mt-2 flex items-center justify-between font-semibold">
                  <span>Total Cost</span>
                  <span>{formatCurrency(calculateTotalPayment() + (selectedInvoices.length * 0.5))}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-purple-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Vendor Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Active Vendors</span>
                  <span className="font-medium">{vendors.filter(v => v.status === 'active').length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Outstanding Invoices</span>
                  <span className="font-medium">{invoices.filter(i => i.status === 'unpaid').length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Outstanding</span>
                  <span className="font-medium">
                    {formatCurrency(invoices.filter(i => i.status === 'unpaid').reduce((sum, i) => sum + i.amount, 0))}
                  </span>
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
                  Payment Review
                </CardTitle>
                <CardDescription>Review vendor payment details before processing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-500">Payment Wallet</p>
                    <p className="font-medium">
                      {wallets.find(w => w.id === formData.fromWallet)?.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Payment Date</p>
                    <p className="font-medium">{formData.paymentDate ? formatDate(formData.paymentDate) : 'Today'}</p>
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
                  <h4 className="font-medium mb-3">Payment Recipients ({selectedInvoices.length})</h4>
                  <div className="space-y-2">
                    {invoices
                      .filter(inv => selectedInvoices.includes(inv.id))
                      .map((invoice) => {
                        const vendor = getVendorById(invoice.vendorId);
                        return (
                          <div
                            key={invoice.id}
                            className="flex items-start justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-medium">{vendor?.name}</p>
                                <Badge variant="outline" className="text-xs">{vendor?.category}</Badge>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">{invoice.invoiceNumber}</p>
                              <p className="text-xs text-gray-500 font-mono mt-1">{vendor?.walletAddress}</p>
                            </div>
                            <div className="text-right ml-4">
                              <p className="font-semibold">{formatCurrency(invoice.amount)}</p>
                              <p className="text-xs text-gray-500">{formData.currency}</p>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>

                {formData.batchNote && (
                  <div className="border-t pt-4">
                    <p className="text-sm text-gray-500 mb-1">Batch Note</p>
                    <p className="text-sm bg-gray-50 p-3 rounded-lg">{formData.batchNote}</p>
                  </div>
                )}

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between text-lg font-semibold">
                    <span>Total Payment Amount</span>
                    <span className="text-orange-600">{formatCurrency(calculateTotalPayment())}</span>
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
                    onClick={handleConfirmPayments}
                    className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Process Payments
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
                  <span className="text-gray-600">All vendors KYB verified</span>
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
                  <span className="font-medium">${(selectedInvoices.length * 0.35).toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Platform Fee</span>
                  <span className="font-medium">${(selectedInvoices.length * 0.15).toFixed(2)}</span>
                </div>
                <div className="border-t pt-2 mt-2 flex items-center justify-between font-semibold">
                  <span>Total Fee</span>
                  <span>${(selectedInvoices.length * 0.5).toFixed(2)}</span>
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
                  Batch processing: <span className="font-medium">5-15 seconds</span>
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
