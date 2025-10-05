'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Heart,
  Pill,
  CreditCard,
  FileText,
  Calendar,
  DollarSign,
  Shield,
  Phone,
  MapPin,
  Clock,
  Stethoscope,
  Activity
} from 'lucide-react';

export default function HealthcarePage() {
  const [selectedTab, setSelectedTab] = useState('bills');
  const [isLoading, setIsLoading] = useState(false);

  const pendingBills = [
    {
      id: 1,
      provider: 'General Hospital',
      service: 'Annual Check-up',
      amount: 285.00,
      dueDate: '2024-02-01',
      accountNumber: 'GH-2024-001',
      insuranceCovered: 215.00,
      patientResponsibility: 70.00
    },
    {
      id: 2,
      provider: 'SmileCare Dental',
      service: 'Dental Cleaning',
      amount: 150.00,
      dueDate: '2024-01-25',
      accountNumber: 'SC-2024-045',
      insuranceCovered: 120.00,
      patientResponsibility: 30.00
    },
    {
      id: 3,
      provider: 'Vision Plus',
      service: 'Eye Exam',
      amount: 95.00,
      dueDate: '2024-02-10',
      accountNumber: 'VP-2024-078',
      insuranceCovered: 75.00,
      patientResponsibility: 20.00
    }
  ];

  const hsaFsaAccounts = [
    {
      type: 'HSA',
      provider: 'HealthSavings Bank',
      balance: 2847.50,
      yearlyContribution: 3650.00,
      remainingContribution: 802.50,
      accountNumber: 'HSA-****-1234'
    },
    {
      type: 'FSA',
      provider: 'FlexSpend Solutions',
      balance: 1250.00,
      yearlyAllowance: 2750.00,
      usedAmount: 1500.00,
      accountNumber: 'FSA-****-5678'
    }
  ];

  const recentTransactions = [
    {
      date: '2024-01-15',
      provider: 'CVS Pharmacy',
      description: 'Prescription medication',
      amount: 25.99,
      type: 'HSA',
      status: 'Paid'
    },
    {
      date: '2024-01-12',
      provider: 'City Medical Center',
      description: 'Specialist consultation',
      amount: 150.00,
      type: 'Insurance + HSA',
      status: 'Paid'
    },
    {
      date: '2024-01-10',
      provider: 'WellCare Pharmacy',
      description: 'Over-the-counter medicine',
      amount: 18.50,
      type: 'FSA',
      status: 'Paid'
    }
  ];

  const healthcareServices = [
    {
      category: 'Primary Care',
      services: ['Family Medicine', 'Internal Medicine', 'Pediatrics'],
      icon: Stethoscope,
      color: 'bg-blue-500'
    },
    {
      category: 'Specialty Care',
      services: ['Cardiology', 'Dermatology', 'Orthopedics'],
      icon: Heart,
      color: 'bg-red-500'
    },
    {
      category: 'Pharmacy',
      services: ['Prescription Refills', 'OTC Medications', 'Consultations'],
      icon: Pill,
      color: 'bg-green-500'
    },
    {
      category: 'Preventive',
      services: ['Annual Checkups', 'Vaccinations', 'Screenings'],
      icon: Shield,
      color: 'bg-purple-500'
    }
  ];

  const handlePayBill = async (billId: number) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsLoading(false);
  };

  const handleHSATransfer = () => {
    console.log('Transferring to HSA');
  };

  const handleFSAPayment = () => {
    console.log('Making FSA payment');
  };

  return (
    <DashboardLayout>
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-100 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900 flex items-center justify-center gap-3">
            <Heart className="h-8 w-8 text-red-600" />
            Healthcare Services
          </h1>
          <p className="text-lg text-gray-600">
            Manage medical bills, HSA/FSA accounts, and healthcare payments
          </p>
        </div>

        {/* Main Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="bills">Medical Bills</TabsTrigger>
            <TabsTrigger value="accounts">HSA/FSA</TabsTrigger>
            <TabsTrigger value="services">Find Providers</TabsTrigger>
          </TabsList>

          {/* Medical Bills Tab */}
          <TabsContent value="bills" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Pending Medical Bills
                </CardTitle>
                <CardDescription>Outstanding healthcare bills and payment options</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingBills.map((bill) => (
                    <Card key={bill.id} className="border-l-4 border-l-red-500">
                      <CardContent className="p-4">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                          {/* Bill Details */}
                          <div className="lg:col-span-2 space-y-3">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold text-lg">{bill.provider}</h3>
                              <Badge variant="destructive">Due {bill.dueDate}</Badge>
                            </div>

                            <p className="text-gray-600">{bill.service}</p>
                            <p className="text-sm text-gray-500">Account: {bill.accountNumber}</p>

                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Total Amount:</span>
                                <span className="font-medium">${bill.amount.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span>Insurance Covered:</span>
                                <span className="text-green-600">-${bill.insuranceCovered.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between font-semibold">
                                <span>Your Responsibility:</span>
                                <span className="text-red-600">${bill.patientResponsibility.toFixed(2)}</span>
                              </div>
                            </div>
                          </div>

                          {/* Payment Options */}
                          <div className="space-y-3">
                            <Button
                              onClick={() => handlePayBill(bill.id)}
                              disabled={isLoading}
                              className="w-full"
                            >
                              <CreditCard className="h-4 w-4 mr-2" />
                              Pay ${bill.patientResponsibility.toFixed(2)}
                            </Button>

                            <Button variant="outline" className="w-full">
                              <FileText className="h-4 w-4 mr-2" />
                              View Details
                            </Button>

                            <Button variant="outline" className="w-full">
                              <Phone className="h-4 w-4 mr-2" />
                              Contact Provider
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* HSA/FSA Tab */}
          <TabsContent value="accounts" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {hsaFsaAccounts.map((account, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{account.type} Account</span>
                      <Badge variant="outline">{account.accountNumber}</Badge>
                    </CardTitle>
                    <CardDescription>{account.provider}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">
                        ${account.balance.toFixed(2)}
                      </div>
                      <p className="text-sm text-gray-600">Available Balance</p>
                    </div>

                    {account.type === 'HSA' ? (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Yearly Contribution:</span>
                          <span>${account.yearlyContribution?.toFixed(2) || '0.00'}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Remaining Contribution:</span>
                          <span className="text-green-600">${account.remainingContribution?.toFixed(2) || '0.00'}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Yearly Allowance:</span>
                          <span>${account.yearlyAllowance?.toFixed(2) || '0.00'}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Used Amount:</span>
                          <span className="text-red-600">${account.usedAmount?.toFixed(2) || '0.00'}</span>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Button
                        onClick={account.type === 'HSA' ? handleHSATransfer : handleFSAPayment}
                        className="w-full"
                      >
                        <DollarSign className="h-4 w-4 mr-2" />
                        {account.type === 'HSA' ? 'Transfer Funds' : 'Make Payment'}
                      </Button>
                      <Button variant="outline" className="w-full">
                        <FileText className="h-4 w-4 mr-2" />
                        View Statements
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Recent Transactions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent HSA/FSA Transactions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentTransactions.map((transaction, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded border">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-100">
                          <Heart className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-sm">{transaction.provider}</h3>
                          <p className="text-sm text-gray-600">{transaction.description}</p>
                          <p className="text-xs text-gray-500">{transaction.date} • {transaction.type}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${transaction.amount}</p>
                        <Badge variant="default">{transaction.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Find Providers Tab */}
          <TabsContent value="services" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Find Healthcare Providers</CardTitle>
                <CardDescription>Search for doctors, clinics, and healthcare services near you</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input placeholder="Search by name or specialty" />
                  <Input placeholder="City or ZIP code" />
                  <Button>
                    <MapPin className="h-4 w-4 mr-2" />
                    Search Providers
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {healthcareServices.map((service, index) => {
                const IconComponent = service.icon;
                return (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className={`p-3 rounded-lg ${service.color} text-white w-fit`}>
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <CardTitle className="text-lg">{service.category}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        {service.services.map((item, idx) => (
                          <div key={idx} className="text-sm text-gray-600">• {item}</div>
                        ))}
                      </div>
                      <Button variant="outline" className="w-full">
                        <Calendar className="h-4 w-4 mr-2" />
                        Book Appointment
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>

        {/* Healthcare Benefits */}
        <Card>
          <CardHeader>
            <CardTitle>Healthcare Benefits with Monay</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <CreditCard className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold">Easy Bill Pay</h3>
                <p className="text-sm text-gray-600">
                  Pay medical bills instantly from your wallet
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <Shield className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold">HSA/FSA Integration</h3>
                <p className="text-sm text-gray-600">
                  Seamless tax-advantaged account management
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                  <FileText className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold">Receipt Management</h3>
                <p className="text-sm text-gray-600">
                  Automatic receipt storage for tax purposes
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                  <Heart className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="font-semibold">Provider Network</h3>
                <p className="text-sm text-gray-600">
                  Find in-network providers and book appointments
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </DashboardLayout>
  );
}