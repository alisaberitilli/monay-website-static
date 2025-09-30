'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  GraduationCap,
  BookOpen,
  CreditCard,
  Calendar,
  DollarSign,
  Award,
  Users,
  FileText,
  Calculator,
  TrendingUp,
  Clock,
  Building
} from 'lucide-react';

export default function EducationPage() {
  const [selectedTab, setSelectedTab] = useState('tuition');
  const [isLoading, setIsLoading] = useState(false);

  const tuitionBills = [
    {
      id: 1,
      institution: 'State University',
      semester: 'Spring 2024',
      amount: 8750.00,
      dueDate: '2024-02-15',
      type: 'Tuition & Fees',
      status: 'Due',
      installmentPlan: true
    },
    {
      id: 2,
      institution: 'Community College',
      semester: 'Spring 2024',
      amount: 2450.00,
      dueDate: '2024-01-30',
      type: 'Tuition',
      status: 'Overdue',
      installmentPlan: false
    },
    {
      id: 3,
      institution: 'Technical Institute',
      semester: 'Winter 2024',
      amount: 3200.00,
      dueDate: '2024-03-01',
      type: 'Program Fee',
      status: 'Upcoming',
      installmentPlan: true
    }
  ];

  const studentLoans = [
    {
      id: 1,
      servicer: 'Federal Student Aid',
      type: 'Direct Subsidized',
      balance: 15750.00,
      interestRate: 4.53,
      monthlyPayment: 162.50,
      nextDue: '2024-02-01',
      status: 'In Repayment'
    },
    {
      id: 2,
      servicer: 'Great Lakes',
      type: 'Direct Unsubsidized',
      balance: 22300.00,
      interestRate: 5.28,
      monthlyPayment: 245.75,
      nextDue: '2024-02-15',
      status: 'In Repayment'
    },
    {
      id: 3,
      servicer: 'Private Lender Corp',
      type: 'Private Loan',
      balance: 8900.00,
      interestRate: 6.75,
      monthlyPayment: 125.00,
      nextDue: '2024-01-28',
      status: 'In Repayment'
    }
  ];

  const scholarships = [
    {
      name: 'Academic Excellence Scholarship',
      amount: 5000.00,
      status: 'Active',
      renewalDate: '2024-05-01',
      requirements: 'Maintain 3.5 GPA'
    },
    {
      name: 'STEM Innovation Grant',
      amount: 2500.00,
      status: 'Pending',
      renewalDate: '2024-03-15',
      requirements: 'Submit project proposal'
    },
    {
      name: 'Community Service Award',
      amount: 1000.00,
      status: 'Expired',
      renewalDate: '2023-12-01',
      requirements: '50 hours community service'
    }
  ];

  const educationServices = [
    {
      category: 'Online Learning',
      platforms: ['Coursera', 'Udemy', 'LinkedIn Learning'],
      icon: BookOpen,
      color: 'bg-blue-500'
    },
    {
      category: 'Test Prep',
      platforms: ['Kaplan', 'Princeton Review', 'Magoosh'],
      icon: FileText,
      color: 'bg-green-500'
    },
    {
      category: 'Tutoring',
      platforms: ['Wyzant', 'Tutor.com', 'Varsity Tutors'],
      icon: Users,
      color: 'bg-purple-500'
    },
    {
      category: 'Certification',
      platforms: ['CompTIA', 'AWS', 'Google Cloud'],
      icon: Award,
      color: 'bg-orange-500'
    }
  ];

  const handlePayTuition = async (billId: number) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsLoading(false);
  };

  const handlePayLoan = async (loanId: number) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsLoading(false);
  };

  const handleSetupAutoPay = (loanId: number) => {
    console.log('Setting up autopay for loan:', loanId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900 flex items-center justify-center gap-3">
            <GraduationCap className="h-8 w-8 text-indigo-600" />
            Education Payments
          </h1>
          <p className="text-lg text-gray-600">
            Manage tuition payments, student loans, and educational expenses
          </p>
        </div>

        {/* Main Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="tuition">Tuition</TabsTrigger>
            <TabsTrigger value="loans">Student Loans</TabsTrigger>
            <TabsTrigger value="scholarships">Scholarships</TabsTrigger>
            <TabsTrigger value="services">Education Services</TabsTrigger>
          </TabsList>

          {/* Tuition Tab */}
          <TabsContent value="tuition" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Tuition & Fee Payments
                </CardTitle>
                <CardDescription>Outstanding tuition bills and payment options</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tuitionBills.map((bill) => (
                    <Card key={bill.id} className={`border-l-4 ${
                      bill.status === 'Overdue' ? 'border-l-red-500' :
                      bill.status === 'Due' ? 'border-l-yellow-500' : 'border-l-green-500'
                    }`}>
                      <CardContent className="p-4">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                          <div className="lg:col-span-2 space-y-3">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold text-lg">{bill.institution}</h3>
                              <Badge variant={
                                bill.status === 'Overdue' ? 'destructive' :
                                bill.status === 'Due' ? 'default' : 'secondary'
                              }>
                                {bill.status}
                              </Badge>
                            </div>

                            <div className="space-y-1">
                              <p className="text-gray-600">{bill.semester} • {bill.type}</p>
                              <p className="text-sm text-gray-500">Due: {bill.dueDate}</p>
                              {bill.installmentPlan && (
                                <p className="text-sm text-green-600">✓ Installment plan available</p>
                              )}
                            </div>

                            <div className="text-2xl font-bold text-indigo-600">
                              ${bill.amount.toLocaleString()}
                            </div>
                          </div>

                          <div className="space-y-3">
                            <Button
                              onClick={() => handlePayTuition(bill.id)}
                              disabled={isLoading}
                              className="w-full"
                            >
                              <CreditCard className="h-4 w-4 mr-2" />
                              Pay Now
                            </Button>

                            {bill.installmentPlan && (
                              <Button variant="outline" className="w-full">
                                <Calendar className="h-4 w-4 mr-2" />
                                Set Up Plan
                              </Button>
                            )}

                            <Button variant="outline" className="w-full">
                              <FileText className="h-4 w-4 mr-2" />
                              View Statement
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

          {/* Student Loans Tab */}
          <TabsContent value="loans" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Student Loan Management
                </CardTitle>
                <CardDescription>Track and pay your student loans</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      ${studentLoans.reduce((sum, loan) => sum + loan.balance, 0).toLocaleString()}
                    </div>
                    <p className="text-sm text-gray-600">Total Balance</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-indigo-600">
                      ${studentLoans.reduce((sum, loan) => sum + loan.monthlyPayment, 0).toFixed(2)}
                    </div>
                    <p className="text-sm text-gray-600">Monthly Payment</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {((studentLoans.reduce((sum, loan) => sum + (loan.interestRate * loan.balance), 0) /
                        studentLoans.reduce((sum, loan) => sum + loan.balance, 0)) || 0).toFixed(2)}%
                    </div>
                    <p className="text-sm text-gray-600">Avg Interest Rate</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {studentLoans.map((loan) => (
                    <Card key={loan.id}>
                      <CardContent className="p-4">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                          <div className="lg:col-span-2 space-y-3">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold">{loan.servicer}</h3>
                              <Badge variant="outline">{loan.type}</Badge>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-gray-600">Balance</p>
                                <p className="font-semibold">${loan.balance.toLocaleString()}</p>
                              </div>
                              <div>
                                <p className="text-gray-600">Interest Rate</p>
                                <p className="font-semibold">{loan.interestRate}%</p>
                              </div>
                              <div>
                                <p className="text-gray-600">Monthly Payment</p>
                                <p className="font-semibold">${loan.monthlyPayment}</p>
                              </div>
                              <div>
                                <p className="text-gray-600">Next Due</p>
                                <p className="font-semibold">{loan.nextDue}</p>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <Button
                              onClick={() => handlePayLoan(loan.id)}
                              disabled={isLoading}
                              className="w-full"
                            >
                              <CreditCard className="h-4 w-4 mr-2" />
                              Pay ${loan.monthlyPayment}
                            </Button>

                            <Button
                              variant="outline"
                              className="w-full"
                              onClick={() => handleSetupAutoPay(loan.id)}
                            >
                              <Clock className="h-4 w-4 mr-2" />
                              Setup AutoPay
                            </Button>

                            <Button variant="outline" className="w-full">
                              <TrendingUp className="h-4 w-4 mr-2" />
                              Extra Payment
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

          {/* Scholarships Tab */}
          <TabsContent value="scholarships" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Scholarships & Grants
                </CardTitle>
                <CardDescription>Track your scholarships and funding opportunities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {scholarships.map((scholarship, index) => (
                    <Card key={index} className={`border-l-4 ${
                      scholarship.status === 'Active' ? 'border-l-green-500' :
                      scholarship.status === 'Pending' ? 'border-l-yellow-500' : 'border-l-gray-500'
                    }`}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold">{scholarship.name}</h3>
                          <Badge variant={
                            scholarship.status === 'Active' ? 'default' :
                            scholarship.status === 'Pending' ? 'secondary' : 'outline'
                          }>
                            {scholarship.status}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">Amount</p>
                            <p className="font-semibold text-lg text-green-600">
                              ${scholarship.amount.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Renewal Date</p>
                            <p className="font-semibold">{scholarship.renewalDate}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Requirements</p>
                            <p className="font-semibold">{scholarship.requirements}</p>
                          </div>
                        </div>

                        {scholarship.status === 'Pending' && (
                          <Button className="mt-3" size="sm">
                            <FileText className="h-4 w-4 mr-2" />
                            Complete Requirements
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Find New Scholarships</CardTitle>
                    <CardDescription>Search for additional funding opportunities</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Input placeholder="Enter your field of study..." className="flex-1" />
                      <Button>
                        <Award className="h-4 w-4 mr-2" />
                        Search
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Education Services Tab */}
          <TabsContent value="services" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Education Services</CardTitle>
                <CardDescription>Pay for online courses, test prep, and certification programs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {educationServices.map((service, index) => {
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
                          <div className="space-y-1">
                            {service.platforms.map((platform, idx) => (
                              <div key={idx} className="text-sm text-gray-600">• {platform}</div>
                            ))}
                          </div>
                          <Button className="w-full">
                            <CreditCard className="h-4 w-4 mr-2" />
                            Browse & Pay
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Education Benefits */}
        <Card>
          <CardHeader>
            <CardTitle>Education Benefits with Monay</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto">
                  <CreditCard className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="font-semibold">Instant Payments</h3>
                <p className="text-sm text-gray-600">
                  Pay tuition and loans instantly to avoid late fees
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <Calculator className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold">Loan Management</h3>
                <p className="text-sm text-gray-600">
                  Track all your student loans in one place
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                  <Award className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold">Scholarship Tracking</h3>
                <p className="text-sm text-gray-600">
                  Monitor scholarship requirements and deadlines
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                  <BookOpen className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="font-semibold">Education Rewards</h3>
                <p className="text-sm text-gray-600">
                  Earn cashback on education-related purchases
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}