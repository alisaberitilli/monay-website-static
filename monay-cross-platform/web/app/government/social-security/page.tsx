'use client';

import { useState } from 'react';
import { Shield, DollarSign, Calendar, Clock, FileText, User, Phone, MapPin, Download, AlertCircle, CheckCircle } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

interface SocialSecurityAccount {
  ssn: string;
  fullName: string;
  dateOfBirth: string;
  currentAge: number;
  retirementAge: number;
  isReceivingBenefits: boolean;
  monthlyBenefit?: number;
  nextPaymentDate?: string;
  lastPaymentAmount?: number;
  totalEarnings: number;
  creditsEarned: number;
  creditsNeeded: number;
}

interface EarningsRecord {
  year: number;
  earnings: number;
  socialSecurityTax: number;
  medicareTax: number;
  creditsEarned: number;
}

interface BenefitEstimate {
  retirementAge: number;
  monthlyBenefit: number;
  description: string;
}

interface Application {
  id: string;
  type: 'retirement' | 'disability' | 'survivor' | 'medicare' | 'ssn_replacement';
  status: 'in_progress' | 'submitted' | 'under_review' | 'approved' | 'denied';
  submittedDate: string;
  title: string;
  description: string;
  expectedDecisionDate?: string;
}

interface Document {
  id: string;
  name: string;
  type: 'statement' | 'award_letter' | 'tax_document' | 'proof_of_income' | 'medical_record';
  date: string;
  available: boolean;
}

export default function SocialSecurityPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'benefits' | 'earnings' | 'applications' | 'documents'>('overview');

  const account: SocialSecurityAccount = {
    ssn: '***-**-4789',
    fullName: 'John A. Smith',
    dateOfBirth: '1970-03-15',
    currentAge: 54,
    retirementAge: 67,
    isReceivingBenefits: false,
    totalEarnings: 1850000,
    creditsEarned: 38,
    creditsNeeded: 40
  };

  const recentEarnings: EarningsRecord[] = [
    { year: 2023, earnings: 85000, socialSecurityTax: 5270, medicareTax: 1232, creditsEarned: 4 },
    { year: 2022, earnings: 82000, socialSecurityTax: 5084, medicareTax: 1189, creditsEarned: 4 },
    { year: 2021, earnings: 78000, socialSecurityTax: 4836, medicareTax: 1131, creditsEarned: 4 },
    { year: 2020, earnings: 75000, socialSecurityTax: 4650, medicareTax: 1088, creditsEarned: 4 },
    { year: 2019, earnings: 73000, socialSecurityTax: 4526, medicareTax: 1059, creditsEarned: 4 }
  ];

  const benefitEstimates: BenefitEstimate[] = [
    {
      retirementAge: 62,
      monthlyBenefit: 1890,
      description: 'Early retirement (reduced benefits)'
    },
    {
      retirementAge: 67,
      monthlyBenefit: 2685,
      description: 'Full retirement age'
    },
    {
      retirementAge: 70,
      monthlyBenefit: 3340,
      description: 'Delayed retirement (maximum benefits)'
    }
  ];

  const applications: Application[] = [
    {
      id: '1',
      type: 'medicare',
      status: 'approved',
      submittedDate: '2024-01-15',
      title: 'Medicare Part A & B Application',
      description: 'Application for Medicare health insurance coverage'
    },
    {
      id: '2',
      type: 'ssn_replacement',
      status: 'in_progress',
      submittedDate: '2024-09-20',
      title: 'Social Security Card Replacement',
      description: 'Request for replacement Social Security card',
      expectedDecisionDate: '2024-10-15'
    }
  ];

  const documents: Document[] = [
    {
      id: '1',
      name: 'Social Security Statement 2024',
      type: 'statement',
      date: '2024-09-01',
      available: true
    },
    {
      id: '2',
      name: 'Social Security Statement 2023',
      type: 'statement',
      date: '2023-09-01',
      available: true
    },
    {
      id: '3',
      name: 'Medicare Award Letter',
      type: 'award_letter',
      date: '2024-02-10',
      available: true
    },
    {
      id: '4',
      name: 'SSA-1099 Tax Form 2023',
      type: 'tax_document',
      date: '2024-01-31',
      available: true
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'submitted':
      case 'under_review': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'denied': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'submitted':
      case 'under_review': return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'in_progress': return <Clock className="h-5 w-5 text-blue-600" />;
      case 'denied': return <AlertCircle className="h-5 w-5 text-red-600" />;
      default: return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const yearsToRetirement = account.retirementAge - account.currentAge;
  const creditsProgress = (account.creditsEarned / account.creditsNeeded) * 100;

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Social Security</h1>
          <p className="text-gray-600">Manage your Social Security benefits, earnings record, and applications</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
          {[
            { id: 'overview', label: 'Account Overview', icon: Shield },
            { id: 'benefits', label: 'Benefit Estimates', icon: DollarSign },
            { id: 'earnings', label: 'Earnings Record', icon: FileText },
            { id: 'applications', label: 'Applications', icon: FileText },
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

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Account Summary */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Account Summary</h2>
                  <p className="text-gray-600">SSN: {account.ssn}</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold">{account.fullName}</div>
                  <div className="text-gray-600">Age: {account.currentAge}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Shield className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-600">{account.creditsEarned}</div>
                  <div className="text-sm text-gray-600">Credits Earned</div>
                  <div className="text-xs text-gray-500 mt-1">({account.creditsNeeded} needed)</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-600">${account.totalEarnings.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Lifetime Earnings</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Calendar className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-purple-600">{account.retirementAge}</div>
                  <div className="text-sm text-gray-600">Full Retirement Age</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <Clock className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-orange-600">{yearsToRetirement}</div>
                  <div className="text-sm text-gray-600">Years to Retirement</div>
                </div>
              </div>
            </div>

            {/* Credits Progress */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Work Credits Progress</h3>
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>Credits Earned: {account.creditsEarned} / {account.creditsNeeded}</span>
                  <span>{creditsProgress.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${creditsProgress}%` }}
                  ></div>
                </div>
              </div>
              <div className="text-sm text-gray-600">
                <p className="mb-2">
                  You need {account.creditsNeeded} credits to qualify for retirement benefits.
                  You can earn up to 4 credits per year.
                </p>
                {account.creditsEarned >= account.creditsNeeded ? (
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    You qualify for retirement benefits!
                  </div>
                ) : (
                  <div className="text-orange-600">
                    You need {account.creditsNeeded - account.creditsEarned} more credits to qualify.
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                  onClick={() => setActiveTab('benefits')}
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-center"
                >
                  <DollarSign className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="font-medium">View Benefit Estimates</div>
                  <div className="text-sm text-gray-600">See retirement projections</div>
                </button>
                <button
                  onClick={() => setActiveTab('earnings')}
                  className="p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors text-center"
                >
                  <FileText className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="font-medium">Earnings Record</div>
                  <div className="text-sm text-gray-600">Review work history</div>
                </button>
                <button
                  onClick={() => setActiveTab('applications')}
                  className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors text-center"
                >
                  <Calendar className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <div className="font-medium">Apply for Benefits</div>
                  <div className="text-sm text-gray-600">Start new application</div>
                </button>
                <button
                  onClick={() => setActiveTab('documents')}
                  className="p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors text-center"
                >
                  <Download className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <div className="font-medium">Get Documents</div>
                  <div className="text-sm text-gray-600">Download statements</div>
                </button>
              </div>
            </div>

            {/* Important Notices */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <div className="flex items-start">
                <AlertCircle className="h-6 w-6 text-yellow-600 mt-1 mr-3" />
                <div>
                  <h3 className="font-semibold text-yellow-800 mb-2">Important Reminders</h3>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Your annual Social Security Statement is available for download</li>
                    <li>• Medicare enrollment begins 3 months before your 65th birthday</li>
                    <li>• Review your earnings record annually for accuracy</li>
                    <li>• You can apply for benefits up to 4 months before you want them to start</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Benefits Tab */}
        {activeTab === 'benefits' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Retirement Benefit Estimates</h3>
              <p className="text-gray-600 mb-6">
                These estimates are based on current law and your earnings record as of today.
                Your actual benefits may be different.
              </p>
              <div className="space-y-4">
                {benefitEstimates.map((estimate, index) => (
                  <div
                    key={index}
                    className={`border-2 rounded-lg p-6 ${
                      estimate.retirementAge === account.retirementAge
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-xl font-bold mb-2">Age {estimate.retirementAge}</h4>
                        <p className="text-gray-600">{estimate.description}</p>
                        {estimate.retirementAge === account.retirementAge && (
                          <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">
                            Recommended
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-green-600">
                          ${estimate.monthlyBenefit.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">per month</div>
                        <div className="text-sm text-gray-500 mt-1">
                          ${(estimate.monthlyBenefit * 12).toLocaleString()} per year
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Benefit Comparison */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Retirement Strategy Comparison</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-2">Retirement Age</th>
                      <th className="text-right py-3 px-2">Monthly Benefit</th>
                      <th className="text-right py-3 px-2">Annual Benefit</th>
                      <th className="text-right py-3 px-2">Lifetime Benefit*</th>
                    </tr>
                  </thead>
                  <tbody>
                    {benefitEstimates.map((estimate, index) => {
                      const lifeExpectancy = 83; // Average life expectancy
                      const yearsReceiving = lifeExpectancy - estimate.retirementAge;
                      const lifetimeBenefit = estimate.monthlyBenefit * 12 * yearsReceiving;

                      return (
                        <tr key={index} className="border-b border-gray-100">
                          <td className="py-3 px-2 font-medium">{estimate.retirementAge}</td>
                          <td className="py-3 px-2 text-right">${estimate.monthlyBenefit.toLocaleString()}</td>
                          <td className="py-3 px-2 text-right">${(estimate.monthlyBenefit * 12).toLocaleString()}</td>
                          <td className="py-3 px-2 text-right font-semibold">${lifetimeBenefit.toLocaleString()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <p className="text-xs text-gray-500 mt-2">
                  *Based on average life expectancy of 83 years
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Earnings Tab */}
        {activeTab === 'earnings' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Earnings Record</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-2">Year</th>
                      <th className="text-right py-3 px-2">Earnings</th>
                      <th className="text-right py-3 px-2">Social Security Tax</th>
                      <th className="text-right py-3 px-2">Medicare Tax</th>
                      <th className="text-right py-3 px-2">Credits</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentEarnings.map(record => (
                      <tr key={record.year} className="border-b border-gray-100">
                        <td className="py-3 px-2 font-medium">{record.year}</td>
                        <td className="py-3 px-2 text-right">${record.earnings.toLocaleString()}</td>
                        <td className="py-3 px-2 text-right">${record.socialSecurityTax.toLocaleString()}</td>
                        <td className="py-3 px-2 text-right">${record.medicareTax.toLocaleString()}</td>
                        <td className="py-3 px-2 text-right">{record.creditsEarned}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> This shows your last 5 years of earnings.
                  Your complete earnings record is available in your annual Social Security Statement.
                </p>
              </div>
            </div>

            {/* Earnings Summary */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Earnings Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-600">
                    ${recentEarnings.reduce((sum, record) => sum + record.earnings, 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Last 5 Years Total</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Shield className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-600">
                    ${recentEarnings.reduce((sum, record) => sum + record.socialSecurityTax, 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">SS Taxes Paid</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <FileText className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-purple-600">
                    {recentEarnings.reduce((sum, record) => sum + record.creditsEarned, 0)}
                  </div>
                  <div className="text-sm text-gray-600">Credits Earned</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Applications Tab */}
        {activeTab === 'applications' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">My Applications</h3>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Start New Application
                </button>
              </div>
              <div className="space-y-4">
                {applications.map(app => (
                  <div key={app.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusIcon(app.status)}
                          <h4 className="font-semibold">{app.title}</h4>
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(app.status)}`}>
                            {app.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-2">{app.description}</p>
                        <div className="text-sm text-gray-500">
                          <div>Submitted: {app.submittedDate}</div>
                          {app.expectedDecisionDate && (
                            <div>Expected Decision: {app.expectedDecisionDate}</div>
                          )}
                        </div>
                      </div>
                      <button className="ml-4 px-3 py-1 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors">
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Available Applications */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Available Applications</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                  <h4 className="font-medium mb-2">Retirement Benefits</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Apply for monthly retirement benefits. You can apply up to 4 months before you want benefits to start.
                  </p>
                  <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Apply Now
                  </button>
                </div>
                <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                  <h4 className="font-medium mb-2">Disability Benefits</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Apply for disability benefits if you're unable to work due to a medical condition.
                  </p>
                  <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Apply Now
                  </button>
                </div>
                <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                  <h4 className="font-medium mb-2">Medicare</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Apply for Medicare health insurance coverage. Enrollment begins 3 months before age 65.
                  </p>
                  <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Apply Now
                  </button>
                </div>
                <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                  <h4 className="font-medium mb-2">Replacement Documents</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Request a replacement Social Security card or get verification letters.
                  </p>
                  <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Request Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Available Documents</h3>
              <div className="space-y-4">
                {documents.map(doc => (
                  <div key={doc.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <FileText className="h-8 w-8 text-gray-400" />
                        <div>
                          <h4 className="font-medium">{doc.name}</h4>
                          <div className="text-sm text-gray-600">
                            <span className="capitalize">{doc.type.replace('_', ' ')}</span>
                            <span className="mx-2">•</span>
                            <span>{doc.date}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {doc.available ? (
                          <button className="flex items-center px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </button>
                        ) : (
                          <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded text-sm">
                            Not Available
                          </span>
                        )}
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