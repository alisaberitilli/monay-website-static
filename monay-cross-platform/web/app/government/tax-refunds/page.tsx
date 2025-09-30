'use client';

import { useState } from 'react';
import { FileText, Calendar, DollarSign, Clock, CheckCircle, AlertCircle, Download, Upload, Calculator, CreditCard } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

interface TaxReturn {
  id: string;
  taxYear: number;
  filingStatus: 'single' | 'married_jointly' | 'married_separately' | 'head_of_household' | 'qualifying_widow';
  filedDate: string;
  status: 'processing' | 'approved' | 'refund_sent' | 'refund_received' | 'amount_owed' | 'rejected';
  refundAmount: number;
  amountOwed?: number;
  federalRefund: number;
  stateRefund: number;
  estimatedRefundDate?: string;
  actualRefundDate?: string;
  refundMethod: 'direct_deposit' | 'check' | 'prepaid_card';
  accountInfo?: string;
  documents: TaxDocument[];
}

interface TaxDocument {
  id: string;
  name: string;
  type: 'w2' | '1099' | 'receipt' | 'form' | 'schedule' | 'other';
  uploadDate: string;
  required: boolean;
  status: 'pending' | 'accepted' | 'rejected';
}

interface RefundMethod {
  id: string;
  name: string;
  description: string;
  processingTime: string;
  fees: number;
  icon: any;
  popular: boolean;
}

interface TaxEstimate {
  grossIncome: number;
  federalWithholding: number;
  stateWithholding: number;
  estimatedFederalTax: number;
  estimatedStateTax: number;
  estimatedFederalRefund: number;
  estimatedStateRefund: number;
  standardDeduction: number;
  filingStatus: string;
}

export default function TaxRefundsPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'calculator' | 'documents' | 'refund_options' | 'history'>('overview');
  const [calculatorData, setCalculatorData] = useState({
    grossIncome: '',
    federalWithholding: '',
    stateWithholding: '',
    filingStatus: 'single',
    dependents: ''
  });

  const currentReturn: TaxReturn = {
    id: '1',
    taxYear: 2024,
    filingStatus: 'single',
    filedDate: '2024-02-15',
    status: 'refund_sent',
    refundAmount: 2450,
    federalRefund: 1850,
    stateRefund: 600,
    estimatedRefundDate: '2024-03-15',
    actualRefundDate: '2024-03-12',
    refundMethod: 'direct_deposit',
    accountInfo: '****1234',
    documents: [
      { id: '1', name: 'W-2 Form - TechCorp', type: 'w2', uploadDate: '2024-02-10', required: true, status: 'accepted' },
      { id: '2', name: '1099-INT - Bank Interest', type: '1099', uploadDate: '2024-02-12', required: false, status: 'accepted' },
      { id: '3', name: 'Charitable Donations Receipt', type: 'receipt', uploadDate: '2024-02-14', required: false, status: 'accepted' }
    ]
  };

  const taxHistory: TaxReturn[] = [
    currentReturn,
    {
      id: '2',
      taxYear: 2023,
      filingStatus: 'single',
      filedDate: '2023-03-20',
      status: 'refund_received',
      refundAmount: 1875,
      federalRefund: 1375,
      stateRefund: 500,
      actualRefundDate: '2023-04-10',
      refundMethod: 'direct_deposit',
      accountInfo: '****1234',
      documents: []
    },
    {
      id: '3',
      taxYear: 2022,
      filingStatus: 'single',
      filedDate: '2022-04-10',
      status: 'amount_owed',
      refundAmount: 0,
      amountOwed: 350,
      federalRefund: 0,
      stateRefund: 0,
      refundMethod: 'direct_deposit',
      documents: []
    }
  ];

  const refundMethods: RefundMethod[] = [
    {
      id: '1',
      name: 'Direct Deposit',
      description: 'Fastest way to receive your refund',
      processingTime: '8-15 days',
      fees: 0,
      icon: CreditCard,
      popular: true
    },
    {
      id: '2',
      name: 'Paper Check',
      description: 'Traditional check mailed to your address',
      processingTime: '4-6 weeks',
      fees: 0,
      icon: FileText,
      popular: false
    },
    {
      id: '3',
      name: 'Prepaid Debit Card',
      description: 'Refund loaded onto a prepaid card',
      processingTime: '1-2 weeks',
      fees: 5.95,
      icon: CreditCard,
      popular: false
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'refund_received':
      case 'approved': return 'bg-green-100 text-green-800';
      case 'refund_sent': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'amount_owed': return 'bg-orange-100 text-orange-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'refund_received':
      case 'approved': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'refund_sent': return <DollarSign className="h-5 w-5 text-blue-600" />;
      case 'processing': return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'amount_owed': return <AlertCircle className="h-5 w-5 text-orange-600" />;
      case 'rejected': return <AlertCircle className="h-5 w-5 text-red-600" />;
      default: return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const calculateRefund = () => {
    const grossIncome = parseFloat(calculatorData.grossIncome) || 0;
    const federalWithholding = parseFloat(calculatorData.federalWithholding) || 0;
    const stateWithholding = parseFloat(calculatorData.stateWithholding) || 0;
    const dependents = parseInt(calculatorData.dependents) || 0;

    // Simplified tax calculation (real calculation would be much more complex)
    const standardDeduction = calculatorData.filingStatus === 'married_jointly' ? 27700 : 13850;
    const taxableIncome = Math.max(0, grossIncome - standardDeduction);

    // Basic tax brackets (simplified)
    let federalTax = 0;
    if (taxableIncome > 44725) {
      federalTax = 5147 + (taxableIncome - 44725) * 0.22;
    } else if (taxableIncome > 10275) {
      federalTax = 1027.50 + (taxableIncome - 10275) * 0.12;
    } else {
      federalTax = taxableIncome * 0.10;
    }

    const stateTax = taxableIncome * 0.05; // Simplified 5% state tax
    const federalRefund = federalWithholding - federalTax - (dependents * 2000); // Child tax credit
    const stateRefund = stateWithholding - stateTax;

    return {
      grossIncome,
      federalWithholding,
      stateWithholding,
      estimatedFederalTax: federalTax,
      estimatedStateTax: stateTax,
      estimatedFederalRefund: federalRefund,
      estimatedStateRefund: stateRefund,
      standardDeduction,
      filingStatus: calculatorData.filingStatus
    };
  };

  const estimate = calculateRefund();

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tax Refunds</h1>
          <p className="text-gray-600">Track your tax refunds, calculate estimates, and manage tax documents</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
          {[
            { id: 'overview', label: 'Refund Status', icon: CheckCircle },
            { id: 'calculator', label: 'Refund Calculator', icon: Calculator },
            { id: 'documents', label: 'Tax Documents', icon: FileText },
            { id: 'refund_options', label: 'Refund Options', icon: CreditCard },
            { id: 'history', label: 'Tax History', icon: Calendar }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Current Refund Status */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">2024 Tax Refund Status</h2>
                  <p className="text-gray-600">Filed on {currentReturn.filedDate}</p>
                </div>
                <div className="flex items-center">
                  {getStatusIcon(currentReturn.status)}
                  <span className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(currentReturn.status)}`}>
                    {currentReturn.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-600">${currentReturn.refundAmount}</div>
                  <div className="text-sm text-gray-600">Total Refund</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <DollarSign className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-600">${currentReturn.federalRefund}</div>
                  <div className="text-sm text-gray-600">Federal Refund</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <DollarSign className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-purple-600">${currentReturn.stateRefund}</div>
                  <div className="text-sm text-gray-600">State Refund</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <Calendar className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-orange-600">
                    {currentReturn.actualRefundDate || currentReturn.estimatedRefundDate}
                  </div>
                  <div className="text-sm text-gray-600">
                    {currentReturn.actualRefundDate ? 'Received' : 'Estimated'}
                  </div>
                </div>
              </div>
            </div>

            {/* Refund Details */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Refund Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-700 mb-3">Filing Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax Year:</span>
                      <span className="font-medium">{currentReturn.taxYear}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Filing Status:</span>
                      <span className="font-medium capitalize">{currentReturn.filingStatus.replace('_', ' ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Filed Date:</span>
                      <span className="font-medium">{currentReturn.filedDate}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-3">Refund Method</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Method:</span>
                      <span className="font-medium capitalize">{currentReturn.refundMethod.replace('_', ' ')}</span>
                    </div>
                    {currentReturn.accountInfo && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Account:</span>
                        <span className="font-medium">{currentReturn.accountInfo}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Processing Time:</span>
                      <span className="font-medium">8-15 days</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Refund Timeline</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                  <div className="ml-4">
                    <div className="font-medium">Return Filed</div>
                    <div className="text-sm text-gray-600">{currentReturn.filedDate}</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                  <div className="ml-4">
                    <div className="font-medium">Return Accepted</div>
                    <div className="text-sm text-gray-600">2024-02-18</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                  <div className="ml-4">
                    <div className="font-medium">Refund Approved</div>
                    <div className="text-sm text-gray-600">2024-03-05</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                  <div className="ml-4">
                    <div className="font-medium">Refund Sent</div>
                    <div className="text-sm text-gray-600">{currentReturn.actualRefundDate}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Calculator Tab */}
        {activeTab === 'calculator' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Tax Refund Calculator</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Annual Gross Income
                    </label>
                    <input
                      type="number"
                      value={calculatorData.grossIncome}
                      onChange={(e) => setCalculatorData({...calculatorData, grossIncome: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="75000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Federal Tax Withheld
                    </label>
                    <input
                      type="number"
                      value={calculatorData.federalWithholding}
                      onChange={(e) => setCalculatorData({...calculatorData, federalWithholding: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="8500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State Tax Withheld
                    </label>
                    <input
                      type="number"
                      value={calculatorData.stateWithholding}
                      onChange={(e) => setCalculatorData({...calculatorData, stateWithholding: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="2800"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Filing Status
                    </label>
                    <select
                      value={calculatorData.filingStatus}
                      onChange={(e) => setCalculatorData({...calculatorData, filingStatus: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="single">Single</option>
                      <option value="married_jointly">Married Filing Jointly</option>
                      <option value="married_separately">Married Filing Separately</option>
                      <option value="head_of_household">Head of Household</option>
                      <option value="qualifying_widow">Qualifying Widow(er)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Number of Dependents
                    </label>
                    <input
                      type="number"
                      value={calculatorData.dependents}
                      onChange={(e) => setCalculatorData({...calculatorData, dependents: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="font-semibold mb-4">Estimated Refund</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Gross Income:</span>
                      <span className="font-medium">${estimate.grossIncome.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Standard Deduction:</span>
                      <span className="font-medium">${estimate.standardDeduction.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Federal Tax Owed:</span>
                      <span className="font-medium">${estimate.estimatedFederalTax.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">State Tax Owed:</span>
                      <span className="font-medium">${estimate.estimatedStateTax.toFixed(0)}</span>
                    </div>
                    <hr className="border-gray-300" />
                    <div className="flex justify-between items-center text-lg">
                      <span className="font-semibold">Federal Refund:</span>
                      <span className={`font-bold ${estimate.estimatedFederalRefund >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${Math.abs(estimate.estimatedFederalRefund).toFixed(0)}
                        {estimate.estimatedFederalRefund < 0 ? ' owed' : ''}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-lg">
                      <span className="font-semibold">State Refund:</span>
                      <span className={`font-bold ${estimate.estimatedStateRefund >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${Math.abs(estimate.estimatedStateRefund).toFixed(0)}
                        {estimate.estimatedStateRefund < 0 ? ' owed' : ''}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Disclaimer:</strong> This is an estimate only. Your actual refund may vary based on additional factors not included in this calculator.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Tax Documents</h3>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Document
                </button>
              </div>
              <div className="space-y-4">
                {currentReturn.documents.map(doc => (
                  <div key={doc.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3 flex-1">
                        <FileText className="h-8 w-8 text-gray-400" />
                        <div>
                          <h4 className="font-medium">{doc.name}</h4>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span className="uppercase">{doc.type}</span>
                            {doc.required && (
                              <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">Required</span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">Uploaded: {doc.uploadDate}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(doc.status)}`}>
                          {doc.status.toUpperCase()}
                        </span>
                        <button className="p-2 text-gray-400 hover:text-gray-600">
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Refund Options Tab */}
        {activeTab === 'refund_options' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Choose Your Refund Method</h3>
              <div className="space-y-4">
                {refundMethods.map(method => {
                  const Icon = method.icon;
                  return (
                    <div key={method.id} className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                      method.popular ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <div className="flex items-start gap-4">
                        <Icon className="h-8 w-8 text-blue-600 mt-1" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">{method.name}</h4>
                            {method.popular && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                Most Popular
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 mb-2">{method.description}</p>
                          <div className="flex items-center gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Processing Time:</span>
                              <span className="ml-1 font-medium">{method.processingTime}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Fees:</span>
                              <span className="ml-1 font-medium">
                                {method.fees === 0 ? 'Free' : `$${method.fees}`}
                              </span>
                            </div>
                          </div>
                        </div>
                        <button className={`px-4 py-2 rounded-lg transition-colors ${
                          method.popular
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}>
                          {method.popular ? 'Selected' : 'Select'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Tax Return History</h3>
              <div className="space-y-4">
                {taxHistory.map(returnData => (
                  <div key={returnData.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{returnData.taxYear} Tax Return</h4>
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(returnData.status)}`}>
                            {returnData.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div>Filed: {returnData.filedDate}</div>
                          <div>Filing Status: {returnData.filingStatus.replace('_', ' ')}</div>
                          {returnData.actualRefundDate && (
                            <div>Refund Received: {returnData.actualRefundDate}</div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        {returnData.refundAmount > 0 ? (
                          <div className="text-lg font-bold text-green-600">
                            +${returnData.refundAmount}
                          </div>
                        ) : returnData.amountOwed ? (
                          <div className="text-lg font-bold text-red-600">
                            -${returnData.amountOwed}
                          </div>
                        ) : (
                          <div className="text-lg font-bold text-gray-600">
                            $0
                          </div>
                        )}
                        <button className="mt-2 px-3 py-1 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50 transition-colors">
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}