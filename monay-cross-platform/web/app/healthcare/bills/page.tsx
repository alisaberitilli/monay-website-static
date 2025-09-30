'use client';

import React, { useState } from 'react';
import { Search, Heart, Calendar, CreditCard, ArrowLeft, DollarSign, AlertCircle, CheckCircle, Clock, FileText, Download, Filter, Receipt } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

interface MedicalBill {
  id: string;
  provider: string;
  patientName: string;
  serviceDate: string;
  billDate: string;
  dueDate: string;
  totalAmount: number;
  amountDue: number;
  amountPaid: number;
  status: 'pending' | 'overdue' | 'paid' | 'payment_plan' | 'disputed';
  services: MedicalService[];
  insurance?: {
    provider: string;
    claimNumber: string;
    covered: number;
    deductible: number;
    copay: number;
  };
  paymentPlan?: {
    monthlyAmount: number;
    remainingPayments: number;
    nextDueDate: string;
  };
}

interface MedicalService {
  id: string;
  description: string;
  code: string;
  quantity: number;
  unitPrice: number;
  total: number;
  covered: boolean;
}

interface PaymentHistory {
  id: string;
  billId: string;
  amount: number;
  date: string;
  method: string;
  confirmation: string;
}

const MedicalBillsPage = () => {
  const [activeTab, setActiveTab] = useState<'bills' | 'payment_plans' | 'history'>('bills');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedBill, setSelectedBill] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const medicalBills: MedicalBill[] = [
    {
      id: '1',
      provider: 'City General Hospital',
      patientName: 'John Doe',
      serviceDate: '2024-01-15',
      billDate: '2024-01-20',
      dueDate: '2024-02-20',
      totalAmount: 2547.89,
      amountDue: 489.89,
      amountPaid: 2058.00,
      status: 'pending',
      services: [
        {
          id: '1-1',
          description: 'Emergency Room Visit',
          code: '99284',
          quantity: 1,
          unitPrice: 1850.00,
          total: 1850.00,
          covered: true
        },
        {
          id: '1-2',
          description: 'X-Ray Chest',
          code: '71020',
          quantity: 1,
          unitPrice: 325.89,
          total: 325.89,
          covered: true
        },
        {
          id: '1-3',
          description: 'Blood Work Panel',
          code: '80053',
          quantity: 1,
          unitPrice: 372.00,
          total: 372.00,
          covered: false
        }
      ],
      insurance: {
        provider: 'Blue Cross Blue Shield',
        claimNumber: 'BC123456789',
        covered: 2058.00,
        deductible: 250.00,
        copay: 30.00
      }
    },
    {
      id: '2',
      provider: 'Dr. Sarah Wilson - Cardiology',
      patientName: 'John Doe',
      serviceDate: '2024-01-22',
      billDate: '2024-01-25',
      dueDate: '2024-02-15',
      totalAmount: 850.00,
      amountDue: 850.00,
      amountPaid: 0,
      status: 'overdue',
      services: [
        {
          id: '2-1',
          description: 'Cardiology Consultation',
          code: '99213',
          quantity: 1,
          unitPrice: 450.00,
          total: 450.00,
          covered: true
        },
        {
          id: '2-2',
          description: 'EKG',
          code: '93000',
          quantity: 1,
          unitPrice: 200.00,
          total: 200.00,
          covered: true
        },
        {
          id: '2-3',
          description: 'Echocardiogram',
          code: '93307',
          quantity: 1,
          unitPrice: 200.00,
          total: 200.00,
          covered: false
        }
      ],
      insurance: {
        provider: 'Blue Cross Blue Shield',
        claimNumber: 'BC987654321',
        covered: 650.00,
        deductible: 100.00,
        copay: 25.00
      }
    },
    {
      id: '3',
      provider: 'MedLab Diagnostics',
      patientName: 'John Doe',
      serviceDate: '2023-12-10',
      billDate: '2023-12-15',
      dueDate: '2024-01-15',
      totalAmount: 1250.00,
      amountDue: 104.17,
      amountPaid: 1145.83,
      status: 'payment_plan',
      services: [
        {
          id: '3-1',
          description: 'MRI Brain',
          code: '70553',
          quantity: 1,
          unitPrice: 1250.00,
          total: 1250.00,
          covered: true
        }
      ],
      insurance: {
        provider: 'Blue Cross Blue Shield',
        claimNumber: 'BC555444333',
        covered: 1000.00,
        deductible: 0,
        copay: 0
      },
      paymentPlan: {
        monthlyAmount: 104.17,
        remainingPayments: 1,
        nextDueDate: '2024-02-15'
      }
    },
    {
      id: '4',
      provider: 'Downtown Dental Care',
      patientName: 'John Doe',
      serviceDate: '2023-11-28',
      billDate: '2023-12-01',
      dueDate: '2023-12-31',
      totalAmount: 485.00,
      amountDue: 0,
      amountPaid: 485.00,
      status: 'paid',
      services: [
        {
          id: '4-1',
          description: 'Dental Cleaning',
          code: 'D1110',
          quantity: 1,
          unitPrice: 185.00,
          total: 185.00,
          covered: true
        },
        {
          id: '4-2',
          description: 'Dental X-Rays',
          code: 'D0210',
          quantity: 1,
          unitPrice: 150.00,
          total: 150.00,
          covered: true
        },
        {
          id: '4-3',
          description: 'Fluoride Treatment',
          code: 'D1208',
          quantity: 1,
          unitPrice: 150.00,
          total: 150.00,
          covered: false
        }
      ]
    }
  ];

  const paymentHistory: PaymentHistory[] = [
    {
      id: '1',
      billId: '4',
      amount: 485.00,
      date: '2023-12-15',
      method: 'Monay Wallet',
      confirmation: 'MNY789123456'
    },
    {
      id: '2',
      billId: '1',
      amount: 2058.00,
      date: '2024-01-25',
      method: 'Insurance Payment',
      confirmation: 'BC123456789'
    },
    {
      id: '3',
      billId: '3',
      amount: 1145.83,
      date: '2024-01-10',
      method: 'Bank Account',
      confirmation: 'ACH456789123'
    }
  ];

  const filteredBills = medicalBills.filter(bill => {
    const matchesSearch = bill.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         bill.patientName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || bill.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-blue-600 bg-blue-100';
      case 'overdue': return 'text-red-600 bg-red-100';
      case 'paid': return 'text-green-600 bg-green-100';
      case 'payment_plan': return 'text-purple-600 bg-purple-100';
      case 'disputed': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'overdue': return <AlertCircle className="h-4 w-4" />;
      case 'paid': return <CheckCircle className="h-4 w-4" />;
      case 'payment_plan': return <Calendar className="h-4 w-4" />;
      case 'disputed': return <AlertCircle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getTotalAmountDue = () => {
    return filteredBills.reduce((sum, bill) => sum + bill.amountDue, 0);
  };

  const selectedBillData = medicalBills.find(b => b.id === selectedBill);

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Medical Bills</h1>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Amount Due</p>
                <p className="text-2xl font-bold text-red-600">${getTotalAmountDue().toFixed(2)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-red-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Overdue Bills</p>
                <p className="text-2xl font-bold text-orange-600">
                  {filteredBills.filter(b => b.status === 'overdue').length}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Payment Plans</p>
                <p className="text-2xl font-bold text-purple-600">
                  {filteredBills.filter(b => b.status === 'payment_plan').length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Paid This Year</p>
                <p className="text-2xl font-bold text-green-600">
                  ${paymentHistory.reduce((sum, payment) => sum + payment.amount, 0).toFixed(2)}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <div className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('bills')}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'bills'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Receipt className="h-4 w-4 inline mr-2" />
                Medical Bills ({filteredBills.length})
              </button>
              <button
                onClick={() => setActiveTab('payment_plans')}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'payment_plans'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Calendar className="h-4 w-4 inline mr-2" />
                Payment Plans
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'history'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <FileText className="h-4 w-4 inline mr-2" />
                Payment History
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Bills Tab */}
            {activeTab === 'bills' && (
              <div className="space-y-6">
                {/* Search and Filters */}
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by provider or patient..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex gap-3">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="overdue">Overdue</option>
                      <option value="payment_plan">Payment Plan</option>
                      <option value="paid">Paid</option>
                      <option value="disputed">Disputed</option>
                    </select>
                  </div>
                </div>

                {/* Bills List */}
                <div className="space-y-4">
                  {filteredBills.map((bill) => (
                    <div key={bill.id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{bill.provider}</h3>
                          <p className="text-gray-600">Patient: {bill.patientName}</p>
                          <p className="text-sm text-gray-500">
                            Service Date: {new Date(bill.serviceDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(bill.status)}`}>
                            {getStatusIcon(bill.status)}
                            {bill.status.replace('_', ' ').toUpperCase()}
                          </span>
                          <p className="text-sm text-gray-500 mt-1">
                            Due: {new Date(bill.dueDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">Total Amount</p>
                          <p className="font-semibold text-gray-900">${bill.totalAmount.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Amount Paid</p>
                          <p className="font-semibold text-green-600">${bill.amountPaid.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Amount Due</p>
                          <p className="font-semibold text-red-600">${bill.amountDue.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Insurance</p>
                          <p className="font-semibold text-blue-600">
                            {bill.insurance ? `$${bill.insurance.covered.toFixed(2)}` : 'N/A'}
                          </p>
                        </div>
                      </div>

                      {bill.paymentPlan && (
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                          <h4 className="font-medium text-purple-900 mb-2">Payment Plan</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-purple-700">Monthly Payment: </span>
                              <span className="font-semibold">${bill.paymentPlan.monthlyAmount}</span>
                            </div>
                            <div>
                              <span className="text-purple-700">Remaining Payments: </span>
                              <span className="font-semibold">{bill.paymentPlan.remainingPayments}</span>
                            </div>
                            <div>
                              <span className="text-purple-700">Next Due: </span>
                              <span className="font-semibold">{new Date(bill.paymentPlan.nextDueDate).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-3">
                        {bill.amountDue > 0 && (
                          <button
                            onClick={() => {
                              setSelectedBill(bill.id);
                              setPaymentAmount(bill.amountDue.toString());
                              setShowPaymentModal(true);
                            }}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Pay Bill
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedBill(selectedBill === bill.id ? null : bill.id)}
                          className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          View Details
                        </button>
                        <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2">
                          <Download className="h-4 w-4" />
                          Download PDF
                        </button>
                        {bill.amountDue > 0 && !bill.paymentPlan && (
                          <button className="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg hover:bg-purple-200 transition-colors">
                            Setup Payment Plan
                          </button>
                        )}
                      </div>

                      {/* Bill Details */}
                      {selectedBill === bill.id && (
                        <div className="mt-6 pt-6 border-t border-gray-200">
                          <h4 className="font-medium text-gray-900 mb-4">Service Details</h4>
                          <div className="space-y-3">
                            {bill.services.map((service) => (
                              <div key={service.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <div>
                                  <p className="font-medium text-gray-900">{service.description}</p>
                                  <p className="text-sm text-gray-600">Code: {service.code}</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-semibold">${service.total.toFixed(2)}</p>
                                  <span className={`text-xs px-2 py-1 rounded-full ${
                                    service.covered ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                  }`}>
                                    {service.covered ? 'Covered' : 'Not Covered'}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>

                          {bill.insurance && (
                            <div className="mt-6">
                              <h4 className="font-medium text-gray-900 mb-4">Insurance Information</h4>
                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <span className="text-blue-700">Provider: </span>
                                    <span className="font-semibold">{bill.insurance.provider}</span>
                                  </div>
                                  <div>
                                    <span className="text-blue-700">Claim #: </span>
                                    <span className="font-semibold">{bill.insurance.claimNumber}</span>
                                  </div>
                                  <div>
                                    <span className="text-blue-700">Amount Covered: </span>
                                    <span className="font-semibold">${bill.insurance.covered.toFixed(2)}</span>
                                  </div>
                                  <div>
                                    <span className="text-blue-700">Deductible: </span>
                                    <span className="font-semibold">${bill.insurance.deductible.toFixed(2)}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {filteredBills.length === 0 && (
                  <div className="text-center py-12">
                    <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No medical bills found</h3>
                    <p className="text-gray-600">Try adjusting your search or filters</p>
                  </div>
                )}
              </div>
            )}

            {/* Payment Plans Tab */}
            {activeTab === 'payment_plans' && (
              <div className="space-y-6">
                <div className="space-y-4">
                  {filteredBills.filter(bill => bill.paymentPlan).map((bill) => (
                    <div key={bill.id} className="border border-purple-200 rounded-lg p-6 bg-purple-50">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{bill.provider}</h3>
                          <p className="text-gray-600">Original Amount: ${bill.totalAmount.toFixed(2)}</p>
                        </div>
                        <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                          Active Plan
                        </span>
                      </div>

                      {bill.paymentPlan && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-purple-700">Monthly Payment</p>
                            <p className="text-xl font-bold text-purple-900">${bill.paymentPlan.monthlyAmount}</p>
                          </div>
                          <div>
                            <p className="text-sm text-purple-700">Remaining Payments</p>
                            <p className="text-xl font-bold text-purple-900">{bill.paymentPlan.remainingPayments}</p>
                          </div>
                          <div>
                            <p className="text-sm text-purple-700">Next Due Date</p>
                            <p className="text-xl font-bold text-purple-900">
                              {new Date(bill.paymentPlan.nextDueDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-3">
                        <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                          Make Payment
                        </button>
                        <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                          Modify Plan
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredBills.filter(bill => bill.paymentPlan).length === 0 && (
                  <div className="text-center py-12">
                    <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No active payment plans</h3>
                    <p className="text-gray-600">Set up payment plans for easier bill management</p>
                  </div>
                )}
              </div>
            )}

            {/* Payment History Tab */}
            {activeTab === 'history' && (
              <div className="space-y-4">
                {paymentHistory.map((payment) => {
                  const bill = medicalBills.find(b => b.id === payment.billId);
                  return (
                    <div key={payment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{bill?.provider}</p>
                        <p className="text-sm text-gray-600">{new Date(payment.date).toLocaleDateString()}</p>
                        <p className="text-xs text-gray-500">Confirmation: {payment.confirmation}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">${payment.amount.toFixed(2)}</p>
                        <p className="text-sm text-gray-600">{payment.method}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedBillData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Pay Medical Bill</h3>

            <div className="mb-4">
              <p className="text-sm text-gray-600">{selectedBillData.provider}</p>
              <p className="text-lg font-semibold">Amount Due: ${selectedBillData.amountDue.toFixed(2)}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Amount</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option>Monay Wallet Balance</option>
                  <option>Bank Account (ACH)</option>
                  <option>Debit Card</option>
                  <option>Credit Card</option>
                  <option>HSA/FSA Account</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                Pay Now
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default MedicalBillsPage;