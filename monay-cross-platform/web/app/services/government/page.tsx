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
  Building2,
  FileText,
  CreditCard,
  Calendar,
  DollarSign,
  Shield,
  User,
  Heart,
  Home,
  Car,
  Receipt,
  Clock,
  Phone,
  MapPin
} from 'lucide-react';

export default function GovernmentPage() {
  const [selectedTab, setSelectedTab] = useState('taxes');
  const [selectedState, setSelectedState] = useState('california');
  const [isLoading, setIsLoading] = useState(false);

  const states = [
    { id: 'california', name: 'California' },
    { id: 'new-york', name: 'New York' },
    { id: 'texas', name: 'Texas' },
    { id: 'florida', name: 'Florida' },
    { id: 'illinois', name: 'Illinois' }
  ];

  const taxPayments = [
    {
      id: 1,
      type: 'Federal Income Tax',
      taxYear: 2023,
      amountDue: 2850.00,
      dueDate: '2024-04-15',
      status: 'Due',
      agency: 'IRS',
      formType: '1040'
    },
    {
      id: 2,
      type: 'State Income Tax',
      taxYear: 2023,
      amountDue: 675.00,
      dueDate: '2024-04-15',
      status: 'Due',
      agency: 'California FTB',
      formType: '540'
    },
    {
      id: 3,
      type: 'Property Tax',
      taxYear: 2024,
      amountDue: 4200.00,
      dueDate: '2024-12-10',
      status: 'Upcoming',
      agency: 'County Assessor',
      formType: 'Property Bill'
    }
  ];

  const benefits = [
    {
      program: 'SNAP (Food Stamps)',
      status: 'Active',
      monthlyAmount: 281.00,
      nextDeposit: '2024-02-03',
      expirationDate: '2024-08-15',
      eligibilityReview: '2024-07-01'
    },
    {
      program: 'Unemployment Benefits',
      status: 'Pending',
      monthlyAmount: 450.00,
      nextDeposit: 'N/A',
      expirationDate: '2024-06-30',
      eligibilityReview: '2024-02-15'
    },
    {
      program: 'Social Security',
      status: 'Not Enrolled',
      monthlyAmount: 0,
      nextDeposit: 'N/A',
      expirationDate: 'N/A',
      eligibilityReview: 'Check Eligibility'
    }
  ];

  const governmentServices = [
    {
      category: 'Vehicle Services',
      services: ['Vehicle Registration', 'Driver License Renewal', 'Title Transfer'],
      icon: Car,
      color: 'bg-blue-500',
      agency: 'DMV'
    },
    {
      category: 'Business Services',
      services: ['Business License', 'Permit Applications', 'Tax Registration'],
      icon: Building2,
      color: 'bg-green-500',
      agency: 'Secretary of State'
    },
    {
      category: 'Property Services',
      services: ['Property Records', 'Building Permits', 'Zoning Information'],
      icon: Home,
      color: 'bg-purple-500',
      agency: 'County Clerk'
    },
    {
      category: 'Vital Records',
      services: ['Birth Certificate', 'Marriage License', 'Death Certificate'],
      icon: FileText,
      color: 'bg-orange-500',
      agency: 'Vital Records'
    }
  ];

  const recentTransactions = [
    {
      service: 'Vehicle Registration Renewal',
      amount: 135.00,
      date: '2024-01-15',
      agency: 'California DMV',
      status: 'Completed'
    },
    {
      service: 'Business License Fee',
      amount: 75.00,
      date: '2024-01-10',
      agency: 'City of San Francisco',
      status: 'Completed'
    },
    {
      service: 'Parking Citation Payment',
      amount: 65.00,
      date: '2024-01-08',
      agency: 'SF Municipal Court',
      status: 'Completed'
    }
  ];

  const upcomingDeadlines = [
    {
      type: 'Tax Filing',
      description: 'Federal and State Income Tax',
      dueDate: '2024-04-15',
      daysLeft: 45
    },
    {
      type: 'Vehicle Registration',
      description: 'Annual registration renewal',
      dueDate: '2024-03-31',
      daysLeft: 30
    },
    {
      type: 'Business License',
      description: 'Annual business license renewal',
      dueDate: '2024-05-01',
      daysLeft: 61
    }
  ];

  const handlePayTax = async (taxId: number) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsLoading(false);
  };

  const handleApplyBenefit = (program: string) => {
    console.log('Applying for benefit:', program);
  };

  const handlePayService = (service: string) => {
    console.log('Paying for service:', service);
  };

  return (
    <DashboardLayout>
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-100 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900 flex items-center justify-center gap-3">
            <Building2 className="h-8 w-8 text-blue-600" />
            Government Services
          </h1>
          <p className="text-lg text-gray-600">
            Pay taxes, manage benefits, and access government services
          </p>
        </div>

        {/* Main Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="taxes">Tax Payments</TabsTrigger>
            <TabsTrigger value="benefits">Benefits</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="deadlines">Deadlines</TabsTrigger>
          </TabsList>

          {/* Tax Payments Tab */}
          <TabsContent value="taxes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  Tax Payments & Filings
                </CardTitle>
                <CardDescription>Manage your federal, state, and local tax obligations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {taxPayments.map((tax) => (
                    <Card key={tax.id} className={`border-l-4 ${
                      tax.status === 'Due' ? 'border-l-red-500' :
                      tax.status === 'Upcoming' ? 'border-l-yellow-500' : 'border-l-green-500'
                    }`}>
                      <CardContent className="p-4">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                          <div className="lg:col-span-2 space-y-3">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold text-lg">{tax.type}</h3>
                              <Badge variant={
                                tax.status === 'Due' ? 'destructive' :
                                tax.status === 'Upcoming' ? 'default' : 'secondary'
                              }>
                                {tax.status}
                              </Badge>
                            </div>

                            <div className="space-y-1">
                              <p className="text-gray-600">Tax Year: {tax.taxYear}</p>
                              <p className="text-gray-600">Agency: {tax.agency}</p>
                              <p className="text-gray-600">Form: {tax.formType}</p>
                              <p className="text-sm text-gray-500">Due: {tax.dueDate}</p>
                            </div>

                            <div className="text-2xl font-bold text-blue-600">
                              ${tax.amountDue.toLocaleString()}
                            </div>
                          </div>

                          <div className="space-y-3">
                            <Button
                              onClick={() => handlePayTax(tax.id)}
                              disabled={isLoading || tax.status === 'Upcoming'}
                              className="w-full"
                            >
                              <CreditCard className="h-4 w-4 mr-2" />
                              Pay Now
                            </Button>

                            <Button variant="outline" className="w-full">
                              <FileText className="h-4 w-4 mr-2" />
                              View Details
                            </Button>

                            <Button variant="outline" className="w-full">
                              <Calendar className="h-4 w-4 mr-2" />
                              Set Payment Plan
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

          {/* Benefits Tab */}
          <TabsContent value="benefits" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Government Benefits
                </CardTitle>
                <CardDescription>Manage your government assistance programs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {benefits.map((benefit, index) => (
                    <Card key={index} className={`border-l-4 ${
                      benefit.status === 'Active' ? 'border-l-green-500' :
                      benefit.status === 'Pending' ? 'border-l-yellow-500' : 'border-l-gray-500'
                    }`}>
                      <CardContent className="p-4">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                          <div className="lg:col-span-2 space-y-3">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold text-lg">{benefit.program}</h3>
                              <Badge variant={
                                benefit.status === 'Active' ? 'default' :
                                benefit.status === 'Pending' ? 'secondary' : 'outline'
                              }>
                                {benefit.status}
                              </Badge>
                            </div>

                            {benefit.status !== 'Not Enrolled' && (
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <p className="text-gray-600">Monthly Amount</p>
                                  <p className="font-semibold">${benefit.monthlyAmount}</p>
                                </div>
                                <div>
                                  <p className="text-gray-600">Next Deposit</p>
                                  <p className="font-semibold">{benefit.nextDeposit}</p>
                                </div>
                                <div>
                                  <p className="text-gray-600">Expires</p>
                                  <p className="font-semibold">{benefit.expirationDate}</p>
                                </div>
                                <div>
                                  <p className="text-gray-600">Review Date</p>
                                  <p className="font-semibold">{benefit.eligibilityReview}</p>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="space-y-3">
                            {benefit.status === 'Not Enrolled' ? (
                              <Button
                                onClick={() => handleApplyBenefit(benefit.program)}
                                className="w-full"
                              >
                                <User className="h-4 w-4 mr-2" />
                                Check Eligibility
                              </Button>
                            ) : (
                              <>
                                <Button variant="outline" className="w-full">
                                  <FileText className="h-4 w-4 mr-2" />
                                  View Benefits
                                </Button>
                                <Button variant="outline" className="w-full">
                                  <Phone className="h-4 w-4 mr-2" />
                                  Contact Caseworker
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Government Services by State</CardTitle>
                <CardDescription>Access government services and pay fees</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select State</label>
                  <Select value={selectedState} onValueChange={setSelectedState}>
                    <SelectTrigger className="w-full md:w-64">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {states.map((state) => (
                        <SelectItem key={state.id} value={state.id}>
                          {state.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {governmentServices.map((service, index) => {
                    const IconComponent = service.icon;
                    return (
                      <Card key={index} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                          <div className={`p-3 rounded-lg ${service.color} text-white w-fit`}>
                            <IconComponent className="h-6 w-6" />
                          </div>
                          <CardTitle className="text-lg">{service.category}</CardTitle>
                          <Badge variant="outline">{service.agency}</Badge>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="space-y-1">
                            {service.services.map((item, idx) => (
                              <div key={idx} className="text-sm text-gray-600">• {item}</div>
                            ))}
                          </div>
                          <Button
                            onClick={() => handlePayService(service.category)}
                            className="w-full"
                          >
                            <CreditCard className="h-4 w-4 mr-2" />
                            Access Services
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Government Payments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentTransactions.map((transaction, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded border">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-100">
                          <Building2 className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-sm">{transaction.service}</h3>
                          <p className="text-sm text-gray-600">{transaction.agency} • {transaction.date}</p>
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

          {/* Deadlines Tab */}
          <TabsContent value="deadlines" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Upcoming Deadlines
                </CardTitle>
                <CardDescription>Important government filing and payment deadlines</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingDeadlines.map((deadline, index) => (
                    <div key={index} className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-yellow-100">
                          <Clock className="h-5 w-5 text-yellow-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{deadline.type}</h3>
                          <p className="text-sm text-gray-600">{deadline.description}</p>
                          <p className="text-sm text-gray-500">Due: {deadline.dueDate}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-yellow-600">{deadline.daysLeft}</div>
                        <p className="text-sm text-gray-600">days left</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Government Services Benefits */}
        <Card>
          <CardHeader>
            <CardTitle>Government Services Benefits with Monay</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <CreditCard className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold">Secure Payments</h3>
                <p className="text-sm text-gray-600">
                  Safe and encrypted government payments
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <Shield className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold">Compliance Tracking</h3>
                <p className="text-sm text-gray-600">
                  Keep track of all filings and deadlines
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                  <FileText className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold">Document Storage</h3>
                <p className="text-sm text-gray-600">
                  Secure storage of receipts and documents
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                  <Building2 className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="font-semibold">Multi-Agency Support</h3>
                <p className="text-sm text-gray-600">
                  Access federal, state, and local services
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