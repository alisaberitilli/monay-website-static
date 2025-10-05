'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Building,
  Plus,
  ArrowRight,
  ArrowLeft,
  Shield,
  Key,
  DollarSign,
  Users,
  CheckCircle,
  AlertCircle,
  Info,
  Settings,
  Loader2
} from 'lucide-react';

interface CreateWalletForm {
  name: string;
  description: string;
  department: string;
  network: string;
  walletType: string;
  signers: Array<{
    name: string;
    email: string;
    role: string;
  }>;
  threshold: number;
  dailyLimit: number;
  monthlyLimit: number;
  transactionLimit: number;
  autoSweep: boolean;
  complianceChecks: boolean;
  auditTrail: boolean;
}

export default function CreateCorporateWalletPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<CreateWalletForm>({
    name: '',
    description: '',
    department: '',
    network: 'base-l2',
    walletType: 'corporate',
    signers: [
      { name: '', email: '', role: 'admin' }
    ],
    threshold: 2,
    dailyLimit: 100000,
    monthlyLimit: 2000000,
    transactionLimit: 50000,
    autoSweep: false,
    complianceChecks: true,
    auditTrail: true
  });

  const totalSteps = 4;
  const progressPercentage = (currentStep / totalSteps) * 100;

  const departments = [
    'Finance',
    'HR',
    'Procurement',
    'Marketing',
    'Operations',
    'Treasury',
    'IT',
    'Legal'
  ];

  const networks = [
    { value: 'base-l2', label: 'Base L2 (Recommended)', description: 'Low fees, enterprise-grade' },
    { value: 'polygon-zkevm', label: 'Polygon zkEVM', description: 'Zero-knowledge proofs' },
    { value: 'arbitrum', label: 'Arbitrum One', description: 'Optimistic rollup' }
  ];

  const walletTypes = [
    { value: 'corporate', label: 'Corporate Treasury', description: 'Multi-sig wallet for treasury operations' },
    { value: 'department', label: 'Department Wallet', description: 'Single department budget management' },
    { value: 'project', label: 'Project Wallet', description: 'Dedicated project funding' },
    { value: 'payroll', label: 'Payroll Wallet', description: 'Employee payment processing' }
  ];

  const addSigner = () => {
    setFormData(prev => ({
      ...prev,
      signers: [...prev.signers, { name: '', email: '', role: 'member' }]
    }));
  };

  const removeSigner = (index: number) => {
    setFormData(prev => ({
      ...prev,
      signers: prev.signers.filter((_, i) => i !== index)
    }));
  };

  const updateSigner = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      signers: prev.signers.map((signer, i) =>
        i === index ? { ...signer, [field]: value } : signer
      )
    }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCreateWallet = async () => {
    setIsCreating(true);
    setError('');

    try {
      // Validate required fields
      if (!formData.name || !formData.department) {
        setError('Please fill in all required fields');
        setIsCreating(false);
        return;
      }

      // Simulate wallet creation (replace with actual API call)
      console.log('Creating wallet with data:', formData);

      // In a real implementation, you would call the backend API here:
      // const response = await fetch('http://localhost:3001/api/wallets/corporate', {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify(formData)
      // });

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Redirect to corporate wallets overview
      router.push('/wallets/corporate/overview');
    } catch (err) {
      console.error('Wallet creation error:', err);
      setError('Failed to create wallet. Please try again.');
      setIsCreating(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="wallet-name">Wallet Name *</Label>
            <Input
              id="wallet-name"
              placeholder="e.g., Treasury Operations"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Brief description of wallet purpose and usage"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="department">Department *</Label>
            <Select
              value={formData.department}
              onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept.toLowerCase()}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="wallet-type">Wallet Type *</Label>
            <Select
              value={formData.walletType}
              onValueChange={(value) => setFormData(prev => ({ ...prev, walletType: value }))}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select wallet type" />
              </SelectTrigger>
              <SelectContent>
                {walletTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div>
                      <div className="font-medium">{type.label}</div>
                      <div className="text-sm text-gray-500">{type.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Blockchain Configuration</h3>
        <div className="space-y-4">
          <div>
            <Label>Network Selection *</Label>
            <div className="mt-2 space-y-3">
              {networks.map((network) => (
                <div
                  key={network.value}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    formData.network === network.value
                      ? 'border-orange-400 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setFormData(prev => ({ ...prev, network: network.value }))}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{network.label}</div>
                      <div className="text-sm text-gray-500">{network.description}</div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      formData.network === network.value
                        ? 'border-orange-400 bg-orange-400'
                        : 'border-gray-300'
                    }`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">Network Recommendations</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Base L2 is recommended for most corporate wallets due to low transaction costs and high throughput.
                  All networks support multi-signature security and compliance features.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Multi-Signature Configuration</h3>
        <div className="space-y-4">
          <div>
            <Label>Authorized Signers *</Label>
            <div className="mt-2 space-y-3">
              {formData.signers.map((signer, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <Label htmlFor={`signer-name-${index}`}>Name</Label>
                      <Input
                        id={`signer-name-${index}`}
                        placeholder="Full name"
                        value={signer.name}
                        onChange={(e) => updateSigner(index, 'name', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`signer-email-${index}`}>Email</Label>
                      <Input
                        id={`signer-email-${index}`}
                        type="email"
                        placeholder="email@company.com"
                        value={signer.email}
                        onChange={(e) => updateSigner(index, 'email', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`signer-role-${index}`}>Role</Label>
                      <div className="flex gap-2 mt-1">
                        <Select
                          value={signer.role}
                          onValueChange={(value) => updateSigner(index, 'role', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="member">Member</SelectItem>
                            <SelectItem value="viewer">Viewer</SelectItem>
                          </SelectContent>
                        </Select>
                        {formData.signers.length > 1 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeSigner(index)}
                            className="px-3"
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              onClick={addSigner}
              className="mt-3 w-full border-orange-300 text-orange-600 hover:bg-orange-50"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Another Signer
            </Button>
          </div>
          <div>
            <Label htmlFor="threshold">Signature Threshold *</Label>
            <Select
              value={formData.threshold.toString()}
              onValueChange={(value) => setFormData(prev => ({ ...prev, threshold: parseInt(value) }))}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: formData.signers.length }, (_, i) => i + 1).map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num} of {formData.signers.length} signatures required
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-500 mt-1">
              Number of signatures required to approve transactions
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Security & Limits</h3>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="daily-limit">Daily Spending Limit</Label>
              <Input
                id="daily-limit"
                type="number"
                value={formData.dailyLimit}
                onChange={(e) => setFormData(prev => ({ ...prev, dailyLimit: parseInt(e.target.value) }))}
                className="mt-1"
              />
              <p className="text-sm text-gray-500 mt-1">
                {formatCurrency(formData.dailyLimit)} per day
              </p>
            </div>
            <div>
              <Label htmlFor="monthly-limit">Monthly Spending Limit</Label>
              <Input
                id="monthly-limit"
                type="number"
                value={formData.monthlyLimit}
                onChange={(e) => setFormData(prev => ({ ...prev, monthlyLimit: parseInt(e.target.value) }))}
                className="mt-1"
              />
              <p className="text-sm text-gray-500 mt-1">
                {formatCurrency(formData.monthlyLimit)} per month
              </p>
            </div>
          </div>
          <div>
            <Label htmlFor="transaction-limit">Single Transaction Limit</Label>
            <Input
              id="transaction-limit"
              type="number"
              value={formData.transactionLimit}
              onChange={(e) => setFormData(prev => ({ ...prev, transactionLimit: parseInt(e.target.value) }))}
              className="mt-1"
            />
            <p className="text-sm text-gray-500 mt-1">
              {formatCurrency(formData.transactionLimit)} maximum per transaction
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="font-medium">Security Features</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">Auto-Sweep</div>
                  <div className="text-sm text-gray-500">Automatically sweep excess funds to treasury</div>
                </div>
                <Switch
                  checked={formData.autoSweep}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, autoSweep: checked }))}
                />
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">Real-time Compliance Checks</div>
                  <div className="text-sm text-gray-500">Validate transactions against compliance rules</div>
                </div>
                <Switch
                  checked={formData.complianceChecks}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, complianceChecks: checked }))}
                />
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">Enhanced Audit Trail</div>
                  <div className="text-sm text-gray-500">Detailed logging of all wallet activities</div>
                </div>
                <Switch
                  checked={formData.auditTrail}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, auditTrail: checked }))}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      default:
        return renderStep1();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Create Corporate Wallet</h1>
        <p className="text-gray-600 mt-1">Set up a new enterprise wallet with multi-signature security</p>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Setup Progress</h3>
            <span className="text-sm text-gray-500">Step {currentStep} of {totalSteps}</span>
          </div>
          <Progress value={progressPercentage} className="mb-4" />
          <div className="flex justify-between text-sm">
            <span className={currentStep >= 1 ? 'text-orange-600 font-medium' : 'text-gray-500'}>
              Basic Info
            </span>
            <span className={currentStep >= 2 ? 'text-orange-600 font-medium' : 'text-gray-500'}>
              Blockchain
            </span>
            <span className={currentStep >= 3 ? 'text-orange-600 font-medium' : 'text-gray-500'}>
              Multi-Sig
            </span>
            <span className={currentStep >= 4 ? 'text-orange-600 font-medium' : 'text-gray-500'}>
              Security
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="w-5 h-5" />
            {currentStep === 1 && 'Basic Information'}
            {currentStep === 2 && 'Blockchain Configuration'}
            {currentStep === 3 && 'Multi-Signature Setup'}
            {currentStep === 4 && 'Security & Limits'}
          </CardTitle>
          <CardDescription>
            {currentStep === 1 && 'Provide basic details about your corporate wallet'}
            {currentStep === 2 && 'Choose the blockchain network for your wallet'}
            {currentStep === 3 && 'Configure multi-signature security settings'}
            {currentStep === 4 && 'Set spending limits and security features'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 1}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Previous
        </Button>

        {currentStep < totalSteps ? (
          <Button
            onClick={nextStep}
            className="flex items-center gap-2 bg-orange-400 hover:bg-orange-500 text-white border-orange-400 hover:border-orange-500"
          >
            Next
            <ArrowRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            onClick={handleCreateWallet}
            disabled={isCreating}
            className="flex items-center gap-2 bg-orange-400 hover:bg-orange-500 text-white border-orange-400 hover:border-orange-500"
          >
            {isCreating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating Wallet...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Create Wallet
              </>
            )}
          </Button>
        )}
      </div>

      {/* Summary */}
      {currentStep === totalSteps && (
        <Card>
          <CardHeader>
            <CardTitle>Wallet Summary</CardTitle>
            <CardDescription>Review your wallet configuration before creation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Basic Details</h4>
                <div className="space-y-1 text-sm">
                  <div><span className="text-gray-500">Name:</span> {formData.name}</div>
                  <div><span className="text-gray-500">Department:</span> {formData.department}</div>
                  <div><span className="text-gray-500">Type:</span> {formData.walletType}</div>
                  <div><span className="text-gray-500">Network:</span> {formData.network}</div>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Security</h4>
                <div className="space-y-1 text-sm">
                  <div><span className="text-gray-500">Signers:</span> {formData.signers.length}</div>
                  <div><span className="text-gray-500">Threshold:</span> {formData.threshold} of {formData.signers.length}</div>
                  <div><span className="text-gray-500">Daily Limit:</span> {formatCurrency(formData.dailyLimit)}</div>
                  <div><span className="text-gray-500">Monthly Limit:</span> {formatCurrency(formData.monthlyLimit)}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}