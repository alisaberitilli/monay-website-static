'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface PaymentRecord {
  id: string;
  transactionId: string;
  amount: number;
  status: 'pending' | 'matched' | 'unmatched' | 'exception';
  date: string;
  source: string;
  destination: string;
}

const PaymentReconciliation: React.FC = () => {
  const { toast } = useToast();
  const [payments, setPayments] = useState<PaymentRecord[]>([
    {
      id: '1',
      transactionId: 'TXN001',
      amount: 1500.00,
      status: 'matched',
      date: '2024-01-20',
      source: 'Bank Account',
      destination: 'Customer A'
    },
    {
      id: '2',
      transactionId: 'TXN002',
      amount: 2750.50,
      status: 'pending',
      date: '2024-01-21',
      source: 'Credit Card',
      destination: 'Customer B'
    },
    {
      id: '3',
      transactionId: 'TXN003',
      amount: 890.25,
      status: 'unmatched',
      date: '2024-01-21',
      source: 'Wire Transfer',
      destination: 'Customer C'
    }
  ]);

  // Handler functions
  const handleReview = async (paymentId: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      const payment = payments.find(p => p.id === paymentId);
      toast.success(`Reviewing transaction ${payment?.transactionId}`);
      // In a real app, would open a modal or navigate to detail page
    } catch (error) {
      toast.error('Failed to load transaction details');
    }
  };

  const handleInvestigate = async (paymentId: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const payment = payments.find(p => p.id === paymentId);
      // Update status to exception for investigation
      setPayments(payments.map(p =>
        p.id === paymentId ? { ...p, status: 'exception' as const } : p
      ));
      toast.success(`Investigation started for ${payment?.transactionId}`);
    } catch (error) {
      toast.error('Failed to start investigation');
    }
  };

  const handleExportReport = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('Reconciliation report exported successfully');
      // In a real app, would trigger file download
    } catch (error) {
      toast.error('Failed to export report');
    }
  };

  const handleRunReconciliation = async () => {
    const toastId = toast.success('Running reconciliation...');
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Simulate reconciliation process
      setPayments(payments.map(payment => {
        if (payment.status === 'pending') {
          // Randomly match or unmatch pending payments
          return {
            ...payment,
            status: Math.random() > 0.5 ? 'matched' as const : 'unmatched' as const
          };
        }
        return payment;
      }));

      toast.success('Reconciliation completed successfully');
    } catch (error) {
      toast.error('Reconciliation failed. Please try again.');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'matched':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'unmatched':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'exception':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'matched':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'unmatched':
        return 'bg-red-100 text-red-800';
      case 'exception':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Reconciliation</CardTitle>
        <CardDescription>
          Review and reconcile payment transactions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="matched">Matched</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="unmatched">Unmatched</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <div className="space-y-2">
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(payment.status)}
                    <div>
                      <p className="font-semibold">{payment.transactionId}</p>
                      <p className="text-sm text-gray-500">
                        {payment.source} → {payment.destination}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="font-semibold">${payment.amount.toFixed(2)}</p>
                      <p className="text-sm text-gray-500">{payment.date}</p>
                    </div>
                    <Badge className={getStatusColor(payment.status)}>
                      {payment.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="matched" className="space-y-4">
            <div className="space-y-2">
              {payments
                .filter((p) => p.status === 'matched')
                .map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(payment.status)}
                      <div>
                        <p className="font-semibold">{payment.transactionId}</p>
                        <p className="text-sm text-gray-500">
                          {payment.source} → {payment.destination}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${payment.amount.toFixed(2)}</p>
                      <p className="text-sm text-gray-500">{payment.date}</p>
                    </div>
                  </div>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            <div className="space-y-2">
              {payments
                .filter((p) => p.status === 'pending')
                .map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(payment.status)}
                      <div>
                        <p className="font-semibold">{payment.transactionId}</p>
                        <p className="text-sm text-gray-500">
                          {payment.source} → {payment.destination}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-right">
                        <p className="font-semibold">${payment.amount.toFixed(2)}</p>
                        <p className="text-sm text-gray-500">{payment.date}</p>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => handleReview(payment.id)}>
                        Review
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="unmatched" className="space-y-4">
            <div className="space-y-2">
              {payments
                .filter((p) => p.status === 'unmatched')
                .map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(payment.status)}
                      <div>
                        <p className="font-semibold">{payment.transactionId}</p>
                        <p className="text-sm text-gray-500">
                          {payment.source} → {payment.destination}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-right">
                        <p className="font-semibold">${payment.amount.toFixed(2)}</p>
                        <p className="text-sm text-gray-500">{payment.date}</p>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => handleInvestigate(payment.id)}>
                        Investigate
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={handleExportReport}>Export Report</Button>
          <Button onClick={handleRunReconciliation}>Run Reconciliation</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentReconciliation;