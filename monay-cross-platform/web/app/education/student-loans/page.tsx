'use client';

import React, { useState } from 'react';
import { Search, FileText, Calculator, DollarSign, ArrowLeft, TrendingDown, Calendar, AlertCircle, CheckCircle, CreditCard, PiggyBank, Info } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

interface StudentLoan {
  id: string;
  servicer: string;
  type: 'federal' | 'private';
  accountNumber: string;
  balance: number;
  interestRate: number;
  minimumPayment: number;
  nextDueDate: string;
  status: 'current' | 'delinquent' | 'forbearance' | 'deferment';
  repaymentPlan: string;
  remainingTerm: number;
}

interface PaymentHistory {
  id: string;
  date: string;
  amount: number;
  principal: number;
  interest: number;
  loanId: string;
}

interface RepaymentPlan {
  id: string;
  name: string;
  description: string;
  monthlyPayment: number;
  totalPayment: number;
  payoffTime: number;
  eligible: boolean;
}

const StudentLoansPage = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'payments' | 'plans' | 'forgiveness'>('overview');
  const [selectedLoan, setSelectedLoan] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [extraPayment, setExtraPayment] = useState('');

  const loans: StudentLoan[] = [
    {
      id: '1',
      servicer: 'Federal Student Aid',
      type: 'federal',
      accountNumber: '****-****-1234',
      balance: 25750.00,
      interestRate: 4.53,
      minimumPayment: 285.50,
      nextDueDate: '2024-02-15',
      status: 'current',
      repaymentPlan: 'Standard Repayment',
      remainingTerm: 8.5
    },
    {
      id: '2',
      servicer: 'Navient',
      type: 'federal',
      accountNumber: '****-****-5678',
      balance: 18420.00,
      interestRate: 3.73,
      minimumPayment: 195.75,
      nextDueDate: '2024-02-15',
      status: 'current',
      repaymentPlan: 'Income-Driven',
      remainingTerm: 12.3
    },
    {
      id: '3',
      servicer: 'Sallie Mae',
      type: 'private',
      accountNumber: '****-****-9012',
      balance: 12500.00,
      interestRate: 6.25,
      minimumPayment: 152.30,
      nextDueDate: '2024-02-18',
      status: 'current',
      repaymentPlan: 'Fixed Payment',
      remainingTerm: 6.2
    }
  ];

  const paymentHistory: PaymentHistory[] = [
    {
      id: '1',
      date: '2024-01-15',
      amount: 285.50,
      principal: 188.75,
      interest: 96.75,
      loanId: '1'
    },
    {
      id: '2',
      date: '2024-01-15',
      amount: 195.75,
      principal: 138.50,
      interest: 57.25,
      loanId: '2'
    },
    {
      id: '3',
      date: '2024-01-18',
      amount: 152.30,
      principal: 87.20,
      interest: 65.10,
      loanId: '3'
    }
  ];

  const repaymentPlans: RepaymentPlan[] = [
    {
      id: '1',
      name: 'Standard Repayment',
      description: 'Fixed payments over 10 years',
      monthlyPayment: 481.25,
      totalPayment: 57750,
      payoffTime: 10,
      eligible: true
    },
    {
      id: '2',
      name: 'Income-Driven Repayment',
      description: 'Payments based on income and family size',
      monthlyPayment: 285.50,
      totalPayment: 68520,
      payoffTime: 20,
      eligible: true
    },
    {
      id: '3',
      name: 'Extended Repayment',
      description: 'Lower payments over 25 years',
      monthlyPayment: 235.75,
      totalPayment: 70725,
      payoffTime: 25,
      eligible: true
    }
  ];

  const getTotalBalance = () => loans.reduce((sum, loan) => sum + loan.balance, 0);
  const getTotalMinimumPayment = () => loans.reduce((sum, loan) => sum + loan.minimumPayment, 0);
  const getWeightedInterestRate = () => {
    const totalBalance = getTotalBalance();
    const weightedRate = loans.reduce((sum, loan) => sum + (loan.balance * loan.interestRate), 0) / totalBalance;
    return weightedRate;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'current': return 'text-green-600 bg-green-100';
      case 'delinquent': return 'text-red-600 bg-red-100';
      case 'forbearance': return 'text-yellow-600 bg-yellow-100';
      case 'deferment': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'current': return <CheckCircle className="h-4 w-4" />;
      case 'delinquent': return <AlertCircle className="h-4 w-4" />;
      case 'forbearance': return <Calendar className="h-4 w-4" />;
      case 'deferment': return <Calendar className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Student Loans</h1>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Balance</p>
                <p className="text-2xl font-bold text-gray-900">${getTotalBalance().toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Monthly Payment</p>
                <p className="text-2xl font-bold text-gray-900">${getTotalMinimumPayment().toFixed(2)}</p>
              </div>
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Interest Rate</p>
                <p className="text-2xl font-bold text-gray-900">{getWeightedInterestRate().toFixed(2)}%</p>
              </div>
              <TrendingDown className="h-8 w-8 text-orange-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Loans</p>
                <p className="text-2xl font-bold text-gray-900">{loans.length}</p>
              </div>
              <FileText className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <div className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <FileText className="h-4 w-4 inline mr-2" />
                Loan Overview
              </button>
              <button
                onClick={() => setActiveTab('payments')}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'payments'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <CreditCard className="h-4 w-4 inline mr-2" />
                Make Payment
              </button>
              <button
                onClick={() => setActiveTab('plans')}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'plans'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Calculator className="h-4 w-4 inline mr-2" />
                Repayment Plans
              </button>
              <button
                onClick={() => setActiveTab('forgiveness')}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'forgiveness'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <PiggyBank className="h-4 w-4 inline mr-2" />
                Loan Forgiveness
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Loan Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="space-y-4">
                  {loans.map((loan) => (
                    <div key={loan.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-gray-900">{loan.servicer}</h3>
                          <p className="text-sm text-gray-600">{loan.accountNumber}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(loan.status)}`}>
                              {getStatusIcon(loan.status)}
                              {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              loan.type === 'federal' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                            }`}>
                              {loan.type === 'federal' ? 'Federal' : 'Private'}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-900">${loan.balance.toLocaleString()}</p>
                          <p className="text-sm text-gray-600">{loan.interestRate}% APR</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Monthly Payment</p>
                          <p className="font-semibold">${loan.minimumPayment}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Next Due Date</p>
                          <p className="font-semibold">{new Date(loan.nextDueDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Repayment Plan</p>
                          <p className="font-semibold">{loan.repaymentPlan}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Remaining Term</p>
                          <p className="font-semibold">{loan.remainingTerm} years</p>
                        </div>
                      </div>

                      <div className="mt-4 flex gap-3">
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                          Make Payment
                        </button>
                        <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Recent Payments */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Payments</h3>
                  <div className="space-y-3">
                    {paymentHistory.map((payment) => {
                      const loan = loans.find(l => l.id === payment.loanId);
                      return (
                        <div key={payment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">{loan?.servicer}</p>
                            <p className="text-sm text-gray-600">{new Date(payment.date).toLocaleDateString()}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">${payment.amount}</p>
                            <p className="text-xs text-gray-500">
                              Principal: ${payment.principal} | Interest: ${payment.interest}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Make Payment Tab */}
            {activeTab === 'payments' && (
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Loan</h3>
                    <div className="space-y-3">
                      {loans.map((loan) => (
                        <div
                          key={loan.id}
                          onClick={() => setSelectedLoan(loan.id)}
                          className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                            selectedLoan === loan.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium text-gray-900">{loan.servicer}</p>
                              <p className="text-sm text-gray-600">Balance: ${loan.balance.toLocaleString()}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">${loan.minimumPayment}</p>
                              <p className="text-xs text-gray-500">min payment</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {selectedLoan && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Amount</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Payment Amount
                          </label>
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
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() => {
                                const loan = loans.find(l => l.id === selectedLoan);
                                if (loan) setPaymentAmount(loan.minimumPayment.toString());
                              }}
                              className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200"
                            >
                              Minimum
                            </button>
                            <button
                              onClick={() => {
                                const loan = loans.find(l => l.id === selectedLoan);
                                if (loan) setPaymentAmount((loan.minimumPayment * 2).toString());
                              }}
                              className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200"
                            >
                              2x Minimum
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Payment Method
                          </label>
                          <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                            <option>Monay Wallet Balance</option>
                            <option>Bank Account (ACH)</option>
                            <option>Debit Card</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Payment Date
                          </label>
                          <input
                            type="date"
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  {selectedLoan && (
                    <div className="bg-blue-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Summary</h3>
                      {(() => {
                        const loan = loans.find(l => l.id === selectedLoan);
                        const payment = parseFloat(paymentAmount) || 0;
                        const monthlyInterest = (loan?.balance || 0) * (loan?.interestRate || 0) / 100 / 12;
                        const principalPayment = Math.max(0, payment - monthlyInterest);

                        return (
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Loan Balance</span>
                              <span className="font-medium">${loan?.balance.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Payment Amount</span>
                              <span className="font-medium">${payment.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Principal</span>
                              <span className="font-medium">${principalPayment.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Interest</span>
                              <span className="font-medium">${Math.min(payment, monthlyInterest).toFixed(2)}</span>
                            </div>
                            <div className="border-t pt-3 flex justify-between">
                              <span className="text-gray-600">New Balance</span>
                              <span className="font-semibold">${((loan?.balance || 0) - principalPayment).toLocaleString()}</span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  <button
                    disabled={!selectedLoan || !paymentAmount}
                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    Submit Payment
                  </button>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Info className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm">
                        <p className="font-medium text-yellow-800">Payment Tips</p>
                        <ul className="text-yellow-700 mt-2 space-y-1">
                          <li>• Payments process within 1-2 business days</li>
                          <li>• Extra payments go directly to principal</li>
                          <li>• Set up autopay to avoid late fees</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Repayment Plans Tab */}
            {activeTab === 'plans' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Compare Repayment Plans</h3>
                  <p className="text-gray-600 mb-6">Choose the plan that works best for your financial situation</p>
                </div>

                <div className="grid gap-6">
                  {repaymentPlans.map((plan) => (
                    <div key={plan.id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-semibold text-gray-900">{plan.name}</h4>
                          <p className="text-sm text-gray-600">{plan.description}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          plan.eligible ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {plan.eligible ? 'Eligible' : 'Not Eligible'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">Monthly Payment</p>
                          <p className="text-xl font-bold text-gray-900">${plan.monthlyPayment}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Total Payment</p>
                          <p className="text-xl font-bold text-gray-900">${plan.totalPayment.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Payoff Time</p>
                          <p className="text-xl font-bold text-gray-900">{plan.payoffTime} years</p>
                        </div>
                      </div>

                      {plan.eligible && (
                        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                          Apply for This Plan
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Loan Forgiveness Tab */}
            {activeTab === 'forgiveness' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Loan Forgiveness Programs</h3>
                  <p className="text-gray-600 mb-6">Explore forgiveness options for your federal student loans</p>
                </div>

                <div className="grid gap-6">
                  <div className="border border-gray-200 rounded-lg p-6">
                    <h4 className="font-semibold text-gray-900 mb-3">Public Service Loan Forgiveness (PSLF)</h4>
                    <p className="text-gray-600 mb-4">
                      Forgiveness for full-time public service employees after 120 qualifying payments
                    </p>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-medium text-green-800">You may be eligible!</p>
                          <p className="text-sm text-green-700">You have 45 qualifying payments</p>
                        </div>
                      </div>
                    </div>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                      Submit Employment Certification
                    </button>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-6">
                    <h4 className="font-semibold text-gray-900 mb-3">Teacher Loan Forgiveness</h4>
                    <p className="text-gray-600 mb-4">
                      Up to $17,500 forgiveness for teachers in low-income schools
                    </p>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                      <div className="flex items-center gap-3">
                        <Info className="h-5 w-5 text-yellow-600" />
                        <div>
                          <p className="font-medium text-yellow-800">Check your eligibility</p>
                          <p className="text-sm text-yellow-700">Requires 5 consecutive years of teaching</p>
                        </div>
                      </div>
                    </div>
                    <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                      Learn More
                    </button>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-6">
                    <h4 className="font-semibold text-gray-900 mb-3">Income-Driven Repayment Forgiveness</h4>
                    <p className="text-gray-600 mb-4">
                      Remaining balance forgiven after 20-25 years of qualifying payments
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <div className="flex items-center gap-3">
                        <Info className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium text-blue-800">Currently enrolled</p>
                          <p className="text-sm text-blue-700">18 years remaining in your plan</p>
                        </div>
                      </div>
                    </div>
                    <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                      View Progress
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentLoansPage;