'use client';

import { useState } from 'react';
import { Shield, Search, FileText, DollarSign, Calendar, Clock, CheckCircle, XCircle, AlertCircle, Download, Upload } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

interface InsurancePlan {
  id: string;
  provider: string;
  planName: string;
  type: 'HMO' | 'PPO' | 'EPO' | 'POS';
  monthlyPremium: number;
  deductible: number;
  outOfPocketMax: number;
  copayPrimary: number;
  copaySpecialist: number;
  coinsurance: number;
  coverage: string[];
  network: string;
  rating: number;
  active: boolean;
}

interface Claim {
  id: string;
  claimNumber: string;
  provider: string;
  serviceDate: string;
  submittedDate: string;
  status: 'pending' | 'approved' | 'denied' | 'processing' | 'paid';
  serviceType: string;
  totalAmount: number;
  approvedAmount: number;
  patientResponsibility: number;
  insurancePaid: number;
  reason?: string;
  documents: Document[];
}

interface Document {
  id: string;
  name: string;
  type: 'eob' | 'receipt' | 'prescription' | 'referral';
  uploadDate: string;
  size: string;
}

interface Benefit {
  category: string;
  description: string;
  covered: boolean;
  copay?: number;
  coinsurance?: number;
  deductibleApplies: boolean;
  annualLimit?: number;
  used?: number;
}

export default function InsurancePage() {
  const [activeTab, setActiveTab] = useState<'plans' | 'claims' | 'benefits' | 'documents'>('plans');
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const insurancePlans: InsurancePlan[] = [
    {
      id: '1',
      provider: 'Blue Cross Blue Shield',
      planName: 'Premium Care Plus',
      type: 'PPO',
      monthlyPremium: 485,
      deductible: 1500,
      outOfPocketMax: 8000,
      copayPrimary: 25,
      copaySpecialist: 50,
      coinsurance: 20,
      coverage: ['Preventive Care', 'Emergency Services', 'Prescription Drugs', 'Mental Health', 'Maternity'],
      network: 'Nationwide Network',
      rating: 4.5,
      active: true
    },
    {
      id: '2',
      provider: 'Kaiser Permanente',
      planName: 'Health Advantage',
      type: 'HMO',
      monthlyPremium: 395,
      deductible: 2000,
      outOfPocketMax: 7000,
      copayPrimary: 20,
      copaySpecialist: 40,
      coinsurance: 15,
      coverage: ['Preventive Care', 'Emergency Services', 'Prescription Drugs', 'Vision', 'Dental'],
      network: 'Kaiser Network',
      rating: 4.2,
      active: false
    },
    {
      id: '3',
      provider: 'Aetna',
      planName: 'Choice Plan',
      type: 'EPO',
      monthlyPremium: 425,
      deductible: 1800,
      outOfPocketMax: 7500,
      copayPrimary: 30,
      copaySpecialist: 60,
      coinsurance: 25,
      coverage: ['Preventive Care', 'Emergency Services', 'Prescription Drugs', 'Mental Health'],
      network: 'Aetna Choice Network',
      rating: 4.0,
      active: false
    }
  ];

  const claims: Claim[] = [
    {
      id: '1',
      claimNumber: 'CL-2024-001234',
      provider: 'Downtown Medical Center',
      serviceDate: '2024-09-15',
      submittedDate: '2024-09-18',
      status: 'approved',
      serviceType: 'Office Visit',
      totalAmount: 200,
      approvedAmount: 180,
      patientResponsibility: 25,
      insurancePaid: 155,
      documents: [
        { id: '1', name: 'EOB_CL2024001234.pdf', type: 'eob', uploadDate: '2024-09-20', size: '156 KB' }
      ]
    },
    {
      id: '2',
      claimNumber: 'CL-2024-001235',
      provider: 'Heart Health Institute',
      serviceDate: '2024-09-20',
      submittedDate: '2024-09-22',
      status: 'processing',
      serviceType: 'Cardiology Consultation',
      totalAmount: 350,
      approvedAmount: 0,
      patientResponsibility: 0,
      insurancePaid: 0,
      documents: []
    },
    {
      id: '3',
      claimNumber: 'CL-2024-001236',
      provider: 'City Pharmacy',
      serviceDate: '2024-09-25',
      submittedDate: '2024-09-25',
      status: 'denied',
      serviceType: 'Prescription',
      totalAmount: 89,
      approvedAmount: 0,
      patientResponsibility: 89,
      insurancePaid: 0,
      reason: 'Medication not covered under current plan',
      documents: [
        { id: '2', name: 'prescription_receipt.jpg', type: 'prescription', uploadDate: '2024-09-25', size: '2.1 MB' }
      ]
    }
  ];

  const benefits: Benefit[] = [
    {
      category: 'Preventive Care',
      description: 'Annual checkups, vaccines, screenings',
      covered: true,
      copay: 0,
      deductibleApplies: false
    },
    {
      category: 'Primary Care Visit',
      description: 'Visits to your primary care physician',
      covered: true,
      copay: 25,
      deductibleApplies: false
    },
    {
      category: 'Specialist Visit',
      description: 'Visits to specialists with referral',
      covered: true,
      copay: 50,
      deductibleApplies: false
    },
    {
      category: 'Emergency Room',
      description: 'Emergency room visits',
      covered: true,
      copay: 300,
      deductibleApplies: true
    },
    {
      category: 'Prescription Drugs',
      description: 'Generic and brand name medications',
      covered: true,
      copay: 10,
      coinsurance: 20,
      deductibleApplies: false
    },
    {
      category: 'Mental Health',
      description: 'Therapy and counseling services',
      covered: true,
      copay: 40,
      deductibleApplies: false
    },
    {
      category: 'Physical Therapy',
      description: 'Physical therapy sessions',
      covered: true,
      copay: 35,
      deductibleApplies: false,
      annualLimit: 20,
      used: 5
    },
    {
      category: 'Vision Care',
      description: 'Eye exams and glasses',
      covered: false,
      deductibleApplies: false
    }
  ];

  const filteredClaims = claims.filter(claim => {
    const matchesSearch = claim.claimNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         claim.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         claim.serviceType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || claim.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'denied': return <XCircle className="h-5 w-5 text-red-600" />;
      case 'processing': return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'pending': return <AlertCircle className="h-5 w-5 text-blue-600" />;
      case 'paid': return <DollarSign className="h-5 w-5 text-green-600" />;
      default: return <AlertCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'denied': return 'bg-red-100 text-red-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-blue-100 text-blue-800';
      case 'paid': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const activePlan = insurancePlans.find(plan => plan.active);

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Insurance Management</h1>
          <p className="text-gray-600">Manage your health insurance plans, claims, and benefits</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
          {[
            { id: 'plans', label: 'Insurance Plans', icon: Shield },
            { id: 'claims', label: 'Claims', icon: FileText },
            { id: 'benefits', label: 'Benefits', icon: CheckCircle },
            { id: 'documents', label: 'Documents', icon: Download }
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

        {/* Insurance Plans Tab */}
        {activeTab === 'plans' && (
          <div className="space-y-6">
            {/* Active Plan Summary */}
            {activePlan && (
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Current Plan</h3>
                    <h4 className="text-lg font-medium">{activePlan.provider} - {activePlan.planName}</h4>
                    <p className="text-blue-100">{activePlan.type} Plan • {activePlan.network}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">${activePlan.monthlyPremium}/mo</div>
                    <div className="text-blue-100">Monthly Premium</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                  <div>
                    <div className="text-xl font-semibold">${activePlan.deductible}</div>
                    <div className="text-blue-100">Deductible</div>
                  </div>
                  <div>
                    <div className="text-xl font-semibold">${activePlan.outOfPocketMax}</div>
                    <div className="text-blue-100">Out-of-Pocket Max</div>
                  </div>
                  <div>
                    <div className="text-xl font-semibold">${activePlan.copayPrimary}</div>
                    <div className="text-blue-100">Primary Care Copay</div>
                  </div>
                  <div>
                    <div className="text-xl font-semibold">${activePlan.copaySpecialist}</div>
                    <div className="text-blue-100">Specialist Copay</div>
                  </div>
                </div>
              </div>
            )}

            {/* All Plans */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Available Plans</h3>
              {insurancePlans.map(plan => (
                <div key={plan.id} className={`bg-white rounded-lg shadow-sm p-6 border-2 ${
                  plan.active ? 'border-blue-500' : 'border-gray-200'
                }`}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-lg font-semibold">{plan.provider}</h4>
                        {plan.active && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600">{plan.planName} • {plan.type}</p>
                      <p className="text-sm text-gray-500">{plan.network}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">${plan.monthlyPremium}</div>
                      <div className="text-sm text-gray-600">per month</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="font-semibold">${plan.deductible}</div>
                      <div className="text-sm text-gray-600">Deductible</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="font-semibold">${plan.outOfPocketMax}</div>
                      <div className="text-sm text-gray-600">Out-of-Pocket Max</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="font-semibold">${plan.copayPrimary}</div>
                      <div className="text-sm text-gray-600">Primary Care</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="font-semibold">${plan.copaySpecialist}</div>
                      <div className="text-sm text-gray-600">Specialist</div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h5 className="font-medium mb-2">Coverage Includes:</h5>
                    <div className="flex flex-wrap gap-2">
                      {plan.coverage.map(item => (
                        <span key={item} className="px-2 py-1 bg-green-100 text-green-800 text-sm rounded">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <span className="text-yellow-500">★</span>
                      <span className="ml-1 font-medium">{plan.rating}</span>
                      <span className="ml-1 text-gray-600">rating</span>
                    </div>
                    {!plan.active && (
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        Select Plan
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Claims Tab */}
        {activeTab === 'claims' && (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      placeholder="Search claims by number, provider, or service..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="approved">Approved</option>
                  <option value="denied">Denied</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
            </div>

            {/* Claims List */}
            <div className="space-y-4">
              {filteredClaims.map(claim => (
                <div key={claim.id} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusIcon(claim.status)}
                        <h4 className="text-lg font-semibold">{claim.claimNumber}</h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(claim.status)}`}>
                          {claim.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-1">{claim.provider}</p>
                      <p className="text-sm text-gray-500">{claim.serviceType}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold">${claim.totalAmount}</div>
                      <div className="text-sm text-gray-600">Total Amount</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-gray-600">Service Date</div>
                      <div className="font-medium">{claim.serviceDate}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Approved Amount</div>
                      <div className="font-medium">${claim.approvedAmount}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Insurance Paid</div>
                      <div className="font-medium text-green-600">${claim.insurancePaid}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Your Responsibility</div>
                      <div className="font-medium text-red-600">${claim.patientResponsibility}</div>
                    </div>
                  </div>

                  {claim.reason && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                      <div className="text-sm text-red-800">
                        <strong>Denial Reason:</strong> {claim.reason}
                      </div>
                    </div>
                  )}

                  {claim.documents.length > 0 && (
                    <div className="mb-4">
                      <h5 className="font-medium mb-2">Documents:</h5>
                      <div className="flex flex-wrap gap-2">
                        {claim.documents.map(doc => (
                          <div key={doc.id} className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
                            <FileText className="h-4 w-4 text-gray-600" />
                            <span className="text-sm">{doc.name}</span>
                            <button className="text-blue-600 hover:text-blue-800">
                              <Download className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      View Details
                    </button>
                    {claim.status === 'denied' && (
                      <button className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                        Appeal Claim
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Benefits Tab */}
        {activeTab === 'benefits' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold">Your Benefits Coverage</h3>
                <p className="text-gray-600">Current plan: {activePlan?.provider} - {activePlan?.planName}</p>
              </div>
              <div className="divide-y divide-gray-200">
                {benefits.map((benefit, index) => (
                  <div key={index} className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {benefit.covered ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600" />
                          )}
                          <h4 className="font-semibold">{benefit.category}</h4>
                        </div>
                        <p className="text-gray-600 mb-2">{benefit.description}</p>
                        {benefit.annualLimit && (
                          <div className="text-sm text-gray-500">
                            Annual limit: {benefit.annualLimit} visits
                            {benefit.used && (
                              <span className="ml-2">• Used: {benefit.used}/{benefit.annualLimit}</span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="ml-6 text-right">
                        {benefit.covered ? (
                          <div className="space-y-1">
                            {benefit.copay && (
                              <div className="text-sm">
                                <span className="text-gray-600">Copay:</span>
                                <span className="ml-1 font-medium">${benefit.copay}</span>
                              </div>
                            )}
                            {benefit.coinsurance && (
                              <div className="text-sm">
                                <span className="text-gray-600">Coinsurance:</span>
                                <span className="ml-1 font-medium">{benefit.coinsurance}%</span>
                              </div>
                            )}
                            <div className="text-xs text-gray-500">
                              {benefit.deductibleApplies ? 'After deductible' : 'No deductible'}
                            </div>
                          </div>
                        ) : (
                          <span className="text-red-600 font-medium">Not Covered</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">Insurance Documents</h3>
                <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Document
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Insurance Card</h4>
                      <p className="text-sm text-gray-600">ID: BCX123456789</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Updated: 2024-01-15</span>
                    <button className="text-blue-600 hover:text-blue-800">
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <FileText className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Plan Summary</h4>
                      <p className="text-sm text-gray-600">2024 Benefits</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Updated: 2024-01-01</span>
                    <button className="text-blue-600 hover:text-blue-800">
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <FileText className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Tax Form 1095-A</h4>
                      <p className="text-sm text-gray-600">2023 Tax Year</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Updated: 2024-01-31</span>
                    <button className="text-blue-600 hover:text-blue-800">
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}