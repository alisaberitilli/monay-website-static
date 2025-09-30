'use client';

import React, { useState } from 'react';
import { Search, GraduationCap, Calendar, CreditCard, ArrowLeft, Building2, Clock, DollarSign, Receipt, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

interface School {
  id: string;
  name: string;
  type: 'university' | 'college' | 'community' | 'trade' | 'k12';
  location: string;
  image: string;
  tuitionPerSemester: number;
  paymentPlans: PaymentPlan[];
  deadlines: {
    fall: string;
    spring: string;
    summer?: string;
  };
  acceptsMonay: boolean;
  discounts: string[];
}

interface PaymentPlan {
  id: string;
  name: string;
  description: string;
  installments: number;
  fee: number;
  dueSchedule: string[];
}

interface TuitionPayment {
  id: string;
  school: string;
  semester: string;
  amount: number;
  dueDate: string;
  status: 'upcoming' | 'overdue' | 'paid' | 'partial';
  balance: number;
}

const TuitionPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSchoolType, setSelectedSchoolType] = useState<string>('all');
  const [selectedSchool, setSelectedSchool] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [selectedPaymentPlan, setSelectedPaymentPlan] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'search' | 'payments' | 'history'>('search');

  const schools: School[] = [
    {
      id: '1',
      name: 'State University',
      type: 'university',
      location: 'New York, NY',
      image: '/api/placeholder/300/200',
      tuitionPerSemester: 15000,
      acceptsMonay: true,
      discounts: ['Early Payment (2%)', 'Full Semester (1%)'],
      deadlines: {
        fall: '2024-08-15',
        spring: '2024-01-15',
        summer: '2024-05-15'
      },
      paymentPlans: [
        {
          id: '1-1',
          name: 'Full Payment',
          description: 'Pay full tuition upfront',
          installments: 1,
          fee: 0,
          dueSchedule: ['Beginning of semester']
        },
        {
          id: '1-2',
          name: '4-Month Plan',
          description: 'Split payment over 4 months',
          installments: 4,
          fee: 50,
          dueSchedule: ['Month 1', 'Month 2', 'Month 3', 'Month 4']
        },
        {
          id: '1-3',
          name: '6-Month Plan',
          description: 'Extended payment over 6 months',
          installments: 6,
          fee: 100,
          dueSchedule: ['Month 1', 'Month 2', 'Month 3', 'Month 4', 'Month 5', 'Month 6']
        }
      ]
    },
    {
      id: '2',
      name: 'Community College of Arts',
      type: 'community',
      location: 'Los Angeles, CA',
      image: '/api/placeholder/300/200',
      tuitionPerSemester: 3500,
      acceptsMonay: true,
      discounts: ['Financial Aid Available', 'Work-Study Programs'],
      deadlines: {
        fall: '2024-08-20',
        spring: '2024-01-20'
      },
      paymentPlans: [
        {
          id: '2-1',
          name: 'Full Payment',
          description: 'Pay full tuition upfront with 3% discount',
          installments: 1,
          fee: 0,
          dueSchedule: ['Beginning of semester']
        },
        {
          id: '2-2',
          name: '3-Month Plan',
          description: 'Pay in 3 equal installments',
          installments: 3,
          fee: 25,
          dueSchedule: ['Month 1', 'Month 2', 'Month 3']
        }
      ]
    },
    {
      id: '3',
      name: 'Technical Training Institute',
      type: 'trade',
      location: 'Houston, TX',
      image: '/api/placeholder/300/200',
      tuitionPerSemester: 8500,
      acceptsMonay: true,
      discounts: ['Industry Partnership Discount', 'Job Placement Guarantee'],
      deadlines: {
        fall: '2024-09-01',
        spring: '2024-02-01'
      },
      paymentPlans: [
        {
          id: '3-1',
          name: 'Program Payment',
          description: 'Pay per program completion',
          installments: 2,
          fee: 0,
          dueSchedule: ['Program Start', 'Mid-Program']
        },
        {
          id: '3-2',
          name: 'Monthly Plan',
          description: 'Monthly payments throughout program',
          installments: 8,
          fee: 75,
          dueSchedule: ['Monthly for 8 months']
        }
      ]
    },
    {
      id: '4',
      name: 'Private Liberal Arts College',
      type: 'college',
      location: 'Boston, MA',
      image: '/api/placeholder/300/200',
      tuitionPerSemester: 25000,
      acceptsMonay: true,
      discounts: ['Merit Scholarships', 'Alumni Family Discount (5%)'],
      deadlines: {
        fall: '2024-07-31',
        spring: '2024-12-31'
      },
      paymentPlans: [
        {
          id: '4-1',
          name: 'Semester Payment',
          description: 'Full semester payment',
          installments: 1,
          fee: 0,
          dueSchedule: ['Beginning of semester']
        },
        {
          id: '4-2',
          name: '10-Month Plan',
          description: 'Academic year spread over 10 months',
          installments: 10,
          fee: 150,
          dueSchedule: ['Monthly August to May']
        }
      ]
    }
  ];

  const upcomingPayments: TuitionPayment[] = [
    {
      id: '1',
      school: 'State University',
      semester: 'Spring 2024',
      amount: 3750,
      dueDate: '2024-02-15',
      status: 'upcoming',
      balance: 11250
    },
    {
      id: '2',
      school: 'Community College of Arts',
      semester: 'Spring 2024',
      amount: 1167,
      dueDate: '2024-02-01',
      status: 'overdue',
      balance: 2333
    }
  ];

  const paymentHistory: TuitionPayment[] = [
    {
      id: '3',
      school: 'State University',
      semester: 'Fall 2023',
      amount: 15000,
      dueDate: '2023-08-15',
      status: 'paid',
      balance: 0
    },
    {
      id: '4',
      school: 'Community College of Arts',
      semester: 'Fall 2023',
      amount: 3500,
      dueDate: '2023-08-20',
      status: 'paid',
      balance: 0
    }
  ];

  const schoolTypes = [
    { id: 'all', name: 'All Schools', count: schools.length },
    { id: 'university', name: 'Universities', count: schools.filter(s => s.type === 'university').length },
    { id: 'college', name: 'Colleges', count: schools.filter(s => s.type === 'college').length },
    { id: 'community', name: 'Community Colleges', count: schools.filter(s => s.type === 'community').length },
    { id: 'trade', name: 'Trade Schools', count: schools.filter(s => s.type === 'trade').length },
    { id: 'k12', name: 'K-12 Schools', count: schools.filter(s => s.type === 'k12').length }
  ];

  const filteredSchools = schools.filter(school => {
    const matchesSearch = school.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         school.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedSchoolType === 'all' || school.type === selectedSchoolType;
    return matchesSearch && matchesType && school.acceptsMonay;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'text-blue-600 bg-blue-100';
      case 'overdue': return 'text-red-600 bg-red-100';
      case 'paid': return 'text-green-600 bg-green-100';
      case 'partial': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'upcoming': return <Clock className="h-4 w-4" />;
      case 'overdue': return <AlertCircle className="h-4 w-4" />;
      case 'paid': return <CheckCircle className="h-4 w-4" />;
      case 'partial': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const selectedSchoolData = schools.find(s => s.id === selectedSchool);

  if (selectedSchool && selectedSchoolData) {
    return (
      <DashboardLayout>
        {/* School Header */}
        <div className="bg-white shadow-sm -mx-6 -mt-6 mb-6">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSelectedSchool(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900">{selectedSchoolData.name}</h1>
                <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                  <span className="flex items-center">
                    <Building2 className="h-4 w-4 mr-1" />
                    {selectedSchoolData.location}
                  </span>
                  <span className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-1" />
                    ${selectedSchoolData.tuitionPerSemester.toLocaleString()} per semester
                  </span>
                  <span className="capitalize">{selectedSchoolData.type}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Payment Form */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Make a Tuition Payment</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Payment Amount</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="number"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Semester tuition: ${selectedSchoolData.tuitionPerSemester.toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Semester</label>
                    <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option>Spring 2024</option>
                      <option>Summer 2024</option>
                      <option>Fall 2024</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Payment Plan</label>
                    <div className="space-y-3">
                      {selectedSchoolData.paymentPlans.map((plan) => (
                        <div
                          key={plan.id}
                          className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                            selectedPaymentPlan === plan.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setSelectedPaymentPlan(plan.id)}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium text-gray-900">{plan.name}</h3>
                              <p className="text-sm text-gray-600">{plan.description}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {plan.installments} installment{plan.installments > 1 ? 's' : ''}
                                {plan.fee > 0 && ` • $${plan.fee} processing fee`}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-gray-900">
                                ${Math.round(selectedSchoolData.tuitionPerSemester / plan.installments).toLocaleString()}
                              </p>
                              <p className="text-xs text-gray-500">per payment</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                    <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option>Monay Wallet Balance</option>
                      <option>Bank Account (ACH)</option>
                      <option>Debit Card</option>
                      <option>Credit Card</option>
                    </select>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t">
                  <button className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Make Payment
                  </button>
                </div>
              </div>

              {/* Available Discounts */}
              {selectedSchoolData.discounts.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Available Discounts</h3>
                  <div className="space-y-2">
                    {selectedSchoolData.discounts.map((discount, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="text-green-800">{discount}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Payment Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Summary</h3>

                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">School</span>
                    <span className="font-medium">{selectedSchoolData.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type</span>
                    <span className="font-medium capitalize">{selectedSchoolData.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Semester Tuition</span>
                    <span className="font-medium">${selectedSchoolData.tuitionPerSemester.toLocaleString()}</span>
                  </div>
                  {paymentAmount && (
                    <div className="flex justify-between border-t pt-4">
                      <span className="text-gray-600">Payment Amount</span>
                      <span className="font-semibold text-lg">${parseFloat(paymentAmount).toLocaleString()}</span>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-medium text-gray-900 mb-3">Important Deadlines</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Fall 2024</span>
                      <span>{new Date(selectedSchoolData.deadlines.fall).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Spring 2024</span>
                      <span>{new Date(selectedSchoolData.deadlines.spring).toLocaleDateString()}</span>
                    </div>
                    {selectedSchoolData.deadlines.summer && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Summer 2024</span>
                        <span>{new Date(selectedSchoolData.deadlines.summer).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-blue-900">Monay Verified</p>
                      <p className="text-blue-700">This school accepts Monay payments with instant processing</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="bg-white shadow-sm -mx-6 -mt-6 mb-6">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Tuition Payments</h1>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('search')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'search'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Search className="h-4 w-4 inline mr-2" />
              Find Your School
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'payments'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Clock className="h-4 w-4 inline mr-2" />
              Upcoming Payments
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'history'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Receipt className="h-4 w-4 inline mr-2" />
              Payment History
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Search Tab */}
        {activeTab === 'search' && (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search schools..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex gap-3">
                  <select
                    value={selectedSchoolType}
                    onChange={(e) => setSelectedSchoolType(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {schoolTypes.map(type => (
                      <option key={type.id} value={type.id}>
                        {type.name} ({type.count})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Schools Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSchools.map((school) => (
                <div
                  key={school.id}
                  onClick={() => setSelectedSchool(school.id)}
                  className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                >
                  <img
                    src={school.image}
                    alt={school.name}
                    className="w-full h-48 object-cover"
                  />

                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900 line-clamp-1">{school.name}</h3>
                        <p className="text-sm text-gray-600">{school.location}</p>
                      </div>
                      <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full capitalize">
                        {school.type}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-lg font-bold text-gray-900">
                          ${school.tuitionPerSemester.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">per semester</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-xs text-green-700 font-medium">Monay Accepted</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Payments Tab */}
        {activeTab === 'payments' && (
          <div className="space-y-4">
            {upcomingPayments.map((payment) => (
              <div key={payment.id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">{payment.school}</h3>
                      <p className="text-sm text-gray-600">{payment.semester}</p>
                      <p className="text-xs text-gray-500">
                        Due: {new Date(payment.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                        {getStatusIcon(payment.status)}
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">${payment.amount.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">Balance: ${payment.balance.toLocaleString()}</p>
                  </div>
                </div>

                <div className="mt-4 flex gap-3">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    Pay Now
                  </button>
                  <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                    View Details
                  </button>
                </div>
              </div>
            ))}

            {upcomingPayments.length === 0 && (
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming payments</h3>
                <p className="text-gray-600">All your tuition payments are up to date</p>
              </div>
            )}
          </div>
        )}

        {/* Payment History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            {paymentHistory.map((payment) => (
              <div key={payment.id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">{payment.school}</h3>
                      <p className="text-sm text-gray-600">{payment.semester}</p>
                      <p className="text-xs text-gray-500">
                        Paid: {new Date(payment.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                        {getStatusIcon(payment.status)}
                        Paid
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">${payment.amount.toLocaleString()}</p>
                  </div>
                </div>

                <div className="mt-4">
                  <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Download Receipt
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TuitionPage;