'use client';

import { useState } from 'react';
import { FileText, Calendar, DollarSign, Clock, CheckCircle, AlertCircle, Download, Upload, User, Phone, MapPin } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

interface UnemploymentClaim {
  id: string;
  claimNumber: string;
  filedDate: string;
  status: 'active' | 'pending' | 'approved' | 'denied' | 'expired' | 'suspended';
  weeklyBenefitAmount: number;
  maxBenefitAmount: number;
  remainingBalance: number;
  weeksRemaining: number;
  lastPaymentDate: string;
  nextCertificationDate: string;
  reason: string;
  employer: string;
  separationDate: string;
}

interface WeeklyCertification {
  id: string;
  weekEnding: string;
  status: 'pending' | 'completed' | 'overdue' | 'paid';
  amountPaid: number;
  dueDate: string;
  certificationQuestions: CertificationQuestion[];
  submitted: boolean;
  submittedDate?: string;
}

interface CertificationQuestion {
  id: string;
  question: string;
  answer?: boolean;
  required: boolean;
}

interface Document {
  id: string;
  name: string;
  type: 'identification' | 'employment_record' | 'separation_notice' | 'earnings_statement' | 'other';
  uploadDate: string;
  status: 'pending' | 'approved' | 'rejected';
  required: boolean;
}

interface JobSearchActivity {
  id: string;
  date: string;
  employer: string;
  position: string;
  contactMethod: 'online' | 'phone' | 'in_person' | 'email';
  contactPerson?: string;
  result: 'pending' | 'interview_scheduled' | 'rejected' | 'no_response';
  notes: string;
}

export default function UnemploymentPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'certify' | 'documents' | 'job_search' | 'payments'>('overview');
  const [selectedCertification, setSelectedCertification] = useState<WeeklyCertification | null>(null);

  const claim: UnemploymentClaim = {
    id: '1',
    claimNumber: 'UC2024-085647',
    filedDate: '2024-08-15',
    status: 'active',
    weeklyBenefitAmount: 485,
    maxBenefitAmount: 12625,
    remainingBalance: 8940,
    weeksRemaining: 18,
    lastPaymentDate: '2024-09-25',
    nextCertificationDate: '2024-10-06',
    reason: 'Layoff - Lack of Work',
    employer: 'Tech Solutions Inc.',
    separationDate: '2024-08-10'
  };

  const certifications: WeeklyCertification[] = [
    {
      id: '1',
      weekEnding: '2024-09-28',
      status: 'completed',
      amountPaid: 485,
      dueDate: '2024-10-06',
      certificationQuestions: [
        { id: '1', question: 'Were you able to work and available for work during this week?', answer: true, required: true },
        { id: '2', question: 'Did you look for work during this week?', answer: true, required: true },
        { id: '3', question: 'Did you work or earn any money during this week?', answer: false, required: true },
        { id: '4', question: 'Did you refuse any work during this week?', answer: false, required: true }
      ],
      submitted: true,
      submittedDate: '2024-10-01'
    },
    {
      id: '2',
      weekEnding: '2024-10-05',
      status: 'pending',
      amountPaid: 0,
      dueDate: '2024-10-13',
      certificationQuestions: [
        { id: '1', question: 'Were you able to work and available for work during this week?', required: true },
        { id: '2', question: 'Did you look for work during this week?', required: true },
        { id: '3', question: 'Did you work or earn any money during this week?', required: true },
        { id: '4', question: 'Did you refuse any work during this week?', required: true }
      ],
      submitted: false
    }
  ];

  const documents: Document[] = [
    {
      id: '1',
      name: 'Driver\'s License',
      type: 'identification',
      uploadDate: '2024-08-15',
      status: 'approved',
      required: true
    },
    {
      id: '2',
      name: 'Layoff Notice',
      type: 'separation_notice',
      uploadDate: '2024-08-16',
      status: 'approved',
      required: true
    },
    {
      id: '3',
      name: 'Last Pay Stub',
      type: 'earnings_statement',
      uploadDate: '2024-08-16',
      status: 'pending',
      required: true
    }
  ];

  const jobSearchActivities: JobSearchActivity[] = [
    {
      id: '1',
      date: '2024-09-28',
      employer: 'DataCorp Solutions',
      position: 'Software Engineer',
      contactMethod: 'online',
      result: 'pending',
      notes: 'Applied through company website, submitted resume and cover letter'
    },
    {
      id: '2',
      date: '2024-09-26',
      employer: 'Innovation Labs',
      position: 'Senior Developer',
      contactMethod: 'email',
      contactPerson: 'Sarah Johnson, HR Manager',
      result: 'interview_scheduled',
      notes: 'Phone interview scheduled for October 3rd at 2:00 PM'
    },
    {
      id: '3',
      date: '2024-09-24',
      employer: 'StartupXYZ',
      position: 'Full Stack Developer',
      contactMethod: 'online',
      result: 'rejected',
      notes: 'Received rejection email citing lack of specific framework experience'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'approved':
      case 'completed':
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'denied':
      case 'rejected':
      case 'suspended': return 'bg-red-100 text-red-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'approved':
      case 'completed':
      case 'paid': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'pending': return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'denied':
      case 'rejected':
      case 'suspended':
      case 'overdue': return <AlertCircle className="h-5 w-5 text-red-600" />;
      default: return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const submitCertification = (certification: WeeklyCertification) => {
    console.log('Submitting certification for week ending:', certification.weekEnding);
    setSelectedCertification(null);
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Unemployment Benefits</h1>
          <p className="text-gray-600">Manage your unemployment claim, certifications, and job search activities</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
          {[
            { id: 'overview', label: 'Claim Overview', icon: FileText },
            { id: 'certify', label: 'Weekly Certification', icon: CheckCircle },
            { id: 'documents', label: 'Documents', icon: Upload },
            { id: 'job_search', label: 'Job Search Log', icon: User },
            { id: 'payments', label: 'Payment History', icon: DollarSign }
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
            {/* Claim Status Card */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Claim Status</h2>
                  <p className="text-gray-600">Claim Number: {claim.claimNumber}</p>
                </div>
                <div className="flex items-center">
                  {getStatusIcon(claim.status)}
                  <span className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(claim.status)}`}>
                    {claim.status.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <DollarSign className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-600">${claim.weeklyBenefitAmount}</div>
                  <div className="text-sm text-gray-600">Weekly Benefit</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-600">${claim.remainingBalance}</div>
                  <div className="text-sm text-gray-600">Remaining Balance</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Calendar className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-purple-600">{claim.weeksRemaining}</div>
                  <div className="text-sm text-gray-600">Weeks Remaining</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <Clock className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-orange-600">{claim.nextCertificationDate}</div>
                  <div className="text-sm text-gray-600">Next Certification Due</div>
                </div>
              </div>
            </div>

            {/* Claim Details */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Claim Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-700 mb-3">Employment Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Employer:</span>
                      <span className="font-medium">{claim.employer}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Separation Date:</span>
                      <span className="font-medium">{claim.separationDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Reason for Separation:</span>
                      <span className="font-medium">{claim.reason}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-3">Benefit Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Claim Filed:</span>
                      <span className="font-medium">{claim.filedDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Maximum Benefit:</span>
                      <span className="font-medium">${claim.maxBenefitAmount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Payment:</span>
                      <span className="font-medium">{claim.lastPaymentDate}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                  onClick={() => setActiveTab('certify')}
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-center"
                >
                  <CheckCircle className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="font-medium">Weekly Certification</div>
                  <div className="text-sm text-gray-600">Complete weekly filing</div>
                </button>
                <button
                  onClick={() => setActiveTab('documents')}
                  className="p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors text-center"
                >
                  <Upload className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="font-medium">Upload Documents</div>
                  <div className="text-sm text-gray-600">Submit required paperwork</div>
                </button>
                <button
                  onClick={() => setActiveTab('job_search')}
                  className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors text-center"
                >
                  <User className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <div className="font-medium">Job Search Activities</div>
                  <div className="text-sm text-gray-600">Log job search efforts</div>
                </button>
                <button
                  onClick={() => setActiveTab('payments')}
                  className="p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors text-center"
                >
                  <DollarSign className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <div className="font-medium">Payment History</div>
                  <div className="text-sm text-gray-600">View past payments</div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Weekly Certification Tab */}
        {activeTab === 'certify' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Weekly Certifications</h3>
              <div className="space-y-4">
                {certifications.map(cert => (
                  <div key={cert.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">Week Ending: {cert.weekEnding}</h4>
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(cert.status)}`}>
                            {cert.status.toUpperCase()}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div>Due Date: {cert.dueDate}</div>
                          {cert.submitted && cert.submittedDate && (
                            <div>Submitted: {cert.submittedDate}</div>
                          )}
                          {cert.amountPaid > 0 && (
                            <div className="font-medium text-green-600">Amount Paid: ${cert.amountPaid}</div>
                          )}
                        </div>
                      </div>
                      <div className="ml-6">
                        {!cert.submitted ? (
                          <button
                            onClick={() => setSelectedCertification(cert)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Complete Certification
                          </button>
                        ) : (
                          <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                            View Details
                          </button>
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
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Required Documents</h3>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Document
                </button>
              </div>
              <div className="space-y-4">
                {documents.map(doc => (
                  <div key={doc.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3 flex-1">
                        <FileText className="h-8 w-8 text-gray-400" />
                        <div>
                          <h4 className="font-medium">{doc.name}</h4>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span className="capitalize">{doc.type.replace('_', ' ')}</span>
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

        {/* Job Search Tab */}
        {activeTab === 'job_search' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Job Search Activities</h3>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Add Activity
                </button>
              </div>
              <div className="space-y-4">
                {jobSearchActivities.map(activity => (
                  <div key={activity.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{activity.employer}</h4>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            activity.result === 'interview_scheduled' ? 'bg-green-100 text-green-800' :
                            activity.result === 'rejected' ? 'bg-red-100 text-red-800' :
                            activity.result === 'no_response' ? 'bg-gray-100 text-gray-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {activity.result.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div><strong>Position:</strong> {activity.position}</div>
                          <div><strong>Date:</strong> {activity.date}</div>
                          <div><strong>Contact Method:</strong> {activity.contactMethod.replace('_', ' ')}</div>
                          {activity.contactPerson && (
                            <div><strong>Contact Person:</strong> {activity.contactPerson}</div>
                          )}
                          <div><strong>Notes:</strong> {activity.notes}</div>
                        </div>
                      </div>
                      <button className="ml-4 px-3 py-1 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors">
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Payment History</h3>
              <div className="space-y-4">
                {certifications.filter(cert => cert.amountPaid > 0).map(cert => (
                  <div key={cert.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">Week Ending: {cert.weekEnding}</h4>
                        <p className="text-sm text-gray-600">Paid on: {claim.lastPaymentDate}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">${cert.amountPaid}</div>
                        <button className="text-sm text-blue-600 hover:text-blue-800">
                          Download Statement
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Certification Modal */}
        {selectedCertification && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Weekly Certification</h2>
                    <p className="text-gray-600">Week Ending: {selectedCertification.weekEnding}</p>
                  </div>
                  <button
                    onClick={() => setSelectedCertification(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
                      <div>
                        <h3 className="font-medium text-yellow-800">Important</h3>
                        <p className="text-sm text-yellow-700">
                          Answer all questions truthfully. False statements may result in denial of benefits and potential fraud charges.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {selectedCertification.certificationQuestions.map((question, index) => (
                      <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-medium mb-3">
                          {index + 1}. {question.question}
                          {question.required && <span className="text-red-500 ml-1">*</span>}
                        </h4>
                        <div className="flex gap-4">
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name={`question_${question.id}`}
                              value="yes"
                              className="mr-2"
                              defaultChecked={question.answer === true}
                            />
                            Yes
                          </label>
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name={`question_${question.id}`}
                              value="no"
                              className="mr-2"
                              defaultChecked={question.answer === false}
                            />
                            No
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setSelectedCertification(null)}
                      className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => submitCertification(selectedCertification)}
                      className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Submit Certification
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