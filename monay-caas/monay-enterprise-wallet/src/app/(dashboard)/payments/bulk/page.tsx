'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  Upload,
  Download,
  CheckCircle,
  AlertCircle,
  FileText,
  Users,
  DollarSign,
  Clock,
  Send,
  Loader2,
  ArrowRight,
  Info,
  X
} from 'lucide-react';

interface BulkPaymentRecord {
  recipientName: string;
  recipientAddress: string;
  amount: number;
  currency: string;
  reference: string;
  status: 'pending' | 'validated' | 'error';
  error?: string;
}

export default function BulkPaymentsPage() {
  const router = useRouter();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [payments, setPayments] = useState<BulkPaymentRecord[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [validPayments, setValidPayments] = useState(0);
  const [errorPayments, setErrorPayments] = useState(0);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      // Simulate CSV parsing and validation
      parseCSVFile(file);
    }
  };

  const parseCSVFile = (file: File) => {
    setIsProcessing(true);

    // Simulate CSV parsing with demo data
    setTimeout(() => {
      const demoPayments: BulkPaymentRecord[] = [
        {
          recipientName: 'John Smith',
          recipientAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1',
          amount: 5000,
          currency: 'USDC',
          reference: 'Invoice #1001',
          status: 'validated'
        },
        {
          recipientName: 'Sarah Johnson',
          recipientAddress: '0x8Ba1f109551bD432803012645Ac136ddd64DBA22',
          amount: 3500,
          currency: 'USDC',
          reference: 'Payroll - March 2025',
          status: 'validated'
        },
        {
          recipientName: 'Mike Davis',
          recipientAddress: 'invalid-address',
          amount: 2000,
          currency: 'USDC',
          reference: 'Contractor Payment',
          status: 'error',
          error: 'Invalid wallet address format'
        },
        {
          recipientName: 'Emily Chen',
          recipientAddress: '0x3f5CE5FBFe3E9af3971dD833D26BA9b5C936f0bE',
          amount: 7500,
          currency: 'USDC',
          reference: 'Vendor Payment - Services',
          status: 'validated'
        },
        {
          recipientName: 'David Rodriguez',
          recipientAddress: '0x9f4A8C8EbC7D5F1a3B2E6D4C8A7B5E9F2C1A8D6E',
          amount: 4200,
          currency: 'USDC',
          reference: 'Marketing Campaign',
          status: 'validated'
        }
      ];

      setPayments(demoPayments);
      const total = demoPayments.reduce((sum, p) => sum + p.amount, 0);
      setTotalAmount(total);
      setValidPayments(demoPayments.filter(p => p.status === 'validated').length);
      setErrorPayments(demoPayments.filter(p => p.status === 'error').length);
      setIsProcessing(false);
    }, 1500);
  };

  const handleSubmitBulkPayment = async () => {
    setIsProcessing(true);

    // Simulate API call
    setTimeout(() => {
      setIsProcessing(false);
      router.push('/payments');
    }, 2000);
  };

  const downloadTemplate = () => {
    // In a real implementation, this would download a CSV template
    const csvContent = 'Recipient Name,Wallet Address,Amount,Currency,Reference\nJohn Doe,0x...,1000,USDC,Invoice #123\n';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bulk-payment-template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Bulk Payments</h1>
          <p className="text-gray-600 mt-1">Upload and process batch payments efficiently</p>
        </div>
        <Button
          variant="outline"
          onClick={downloadTemplate}
          className="flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Download CSV Template
        </Button>
      </div>

      {/* Upload Section */}
      {!uploadedFile && (
        <Card>
          <CardHeader>
            <CardTitle>Upload Payment File</CardTitle>
            <CardDescription>
              Upload a CSV file containing bulk payment details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <div className="space-y-2">
                  <h3 className="font-semibold">Upload CSV File</h3>
                  <p className="text-sm text-gray-500">
                    Drag and drop your file here, or click to browse
                  </p>
                </div>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload">
                  <Button
                    className="mt-4 bg-orange-400 hover:bg-orange-500 text-white"
                    asChild
                  >
                    <span>
                      <FileText className="w-4 h-4 mr-2" />
                      Select CSV File
                    </span>
                  </Button>
                </label>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>CSV Format Requirements:</strong>
                  <ul className="list-disc list-inside mt-2 text-sm">
                    <li>Headers: Recipient Name, Wallet Address, Amount, Currency, Reference</li>
                    <li>Maximum 1000 recipients per file</li>
                    <li>Supported currencies: USDC, USDT, PYUSD</li>
                    <li>Wallet addresses must be valid Base L2 addresses</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Processing Indicator */}
      {isProcessing && !payments.length && (
        <Card>
          <CardContent className="p-8">
            <div className="text-center space-y-4">
              <Loader2 className="w-12 h-12 mx-auto animate-spin text-orange-400" />
              <div>
                <h3 className="font-semibold">Processing File...</h3>
                <p className="text-sm text-gray-500">Validating payment records</p>
              </div>
              <Progress value={60} className="w-full max-w-md mx-auto" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Summary */}
      {uploadedFile && payments.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Total Payments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{payments.length}</div>
                <div className="text-xs text-gray-500 mt-1">
                  From {uploadedFile.name}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Total Amount
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalAmount)}</div>
                <div className="text-xs text-gray-500 mt-1">
                  Across all recipients
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Valid Payments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{validPayments}</div>
                <div className="text-xs text-gray-500 mt-1">
                  Ready to process
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Errors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{errorPayments}</div>
                <div className="text-xs text-gray-500 mt-1">
                  Require attention
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Records */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Records</CardTitle>
              <CardDescription>
                Review and validate payment details before submission
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {payments.map((payment, index) => (
                  <div
                    key={index}
                    className={`p-4 border rounded-lg ${
                      payment.status === 'error' ? 'border-red-200 bg-red-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Users className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-semibold">{payment.recipientName}</div>
                            <div className="text-sm text-gray-500 font-mono">
                              {payment.recipientAddress}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              {payment.reference}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-lg">
                          {formatCurrency(payment.amount)} {payment.currency}
                        </div>
                        <div className="mt-1">
                          {payment.status === 'validated' ? (
                            <Badge className="bg-green-100 text-green-700">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Validated
                            </Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-700">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              Error
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    {payment.error && (
                      <div className="mt-2 text-sm text-red-600 flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>{payment.error}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={() => {
                setUploadedFile(null);
                setPayments([]);
                setTotalAmount(0);
                setValidPayments(0);
                setErrorPayments(0);
              }}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleSubmitBulkPayment}
              disabled={isProcessing || errorPayments > 0}
              className="bg-orange-400 hover:bg-orange-500 text-white"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing Payments...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit {validPayments} Payments
                </>
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
