'use client';

import { useState } from 'react';
import { Heart, Shield, DollarSign, Calendar, Clock, FileText, User, Phone, MapPin, Download, AlertCircle, CheckCircle, Pill } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

interface MedicareAccount {
  medicareNumber: string;
  fullName: string;
  dateOfBirth: string;
  enrollmentDate: string;
  isEnrolled: boolean;
  eligibilityDate: string;
  currentParts: string[];
  monthlyPremium: number;
  deductible: number;
  outOfPocketMax: number;
}

interface MedicarePlan {
  id: string;
  type: 'A' | 'B' | 'C' | 'D';
  name: string;
  description: string;
  monthlyPremium: number;
  deductible: number;
  coverageDetails: string[];
  enrolled: boolean;
  enrollmentPeriod?: string;
}

interface Claim {
  id: string;
  claimNumber: string;
  serviceDate: string;
  provider: string;
  serviceDescription: string;
  totalAmount: number;
  medicareApproved: number;
  medicarePaid: number;
  yourResponsibility: number;
  status: 'processed' | 'pending' | 'denied';
  processedDate?: string;
}

interface Provider {
  id: string;
  name: string;
  specialty: string;
  address: string;
  phone: string;
  acceptsMedicare: boolean;
  rating: number;
  distance: number;
  isPreferred: boolean;
}

interface Prescription {
  id: string;
  drugName: string;
  strength: string;
  quantity: number;
  daysSupply: number;
  prescriber: string;
  pharmacy: string;
  dateDispensed: string;
  costToYou: number;
  planPaid: number;
  totalCost: number;
}

export default function MedicarePage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'plans' | 'claims' | 'providers' | 'prescriptions'>('overview');

  const account: MedicareAccount = {
    medicareNumber: '1AB-CD-EF23-G4',
    fullName: 'Mary Johnson',
    dateOfBirth: '1959-06-15',
    enrollmentDate: '2024-06-01',
    isEnrolled: true,
    eligibilityDate: '2024-06-15',
    currentParts: ['A', 'B', 'D'],
    monthlyPremium: 174.70,
    deductible: 240,
    outOfPocketMax: 8850
  };

  const medicarePlans: MedicarePlan[] = [
    {
      id: '1',
      type: 'A',
      name: 'Medicare Part A',
      description: 'Hospital Insurance',
      monthlyPremium: 0,
      deductible: 1632,
      coverageDetails: [
        'Inpatient hospital care',
        'Skilled nursing facility care',
        'Hospice care',
        'Limited home health care'
      ],
      enrolled: true
    },
    {
      id: '2',
      type: 'B',
      name: 'Medicare Part B',
      description: 'Medical Insurance',
      monthlyPremium: 174.70,
      deductible: 240,
      coverageDetails: [
        'Doctor visits',
        'Outpatient care',
        'Medical supplies',
        'Preventive services'
      ],
      enrolled: true
    },
    {
      id: '3',
      type: 'C',
      name: 'Medicare Advantage',
      description: 'Medicare Part C',
      monthlyPremium: 45.00,
      deductible: 0,
      coverageDetails: [
        'All Part A & B benefits',
        'Often includes prescription drugs',
        'May include dental, vision, hearing',
        'Provider networks apply'
      ],
      enrolled: false,
      enrollmentPeriod: 'October 15 - December 7, 2024'
    },
    {
      id: '4',
      type: 'D',
      name: 'Medicare Part D',
      description: 'Prescription Drug Coverage',
      monthlyPremium: 55.50,
      deductible: 545,
      coverageDetails: [
        'Prescription drug coverage',
        'Generic and brand-name drugs',
        'Coverage gap (donut hole) protection',
        'Catastrophic coverage'
      ],
      enrolled: true
    }
  ];

  const recentClaims: Claim[] = [
    {
      id: '1',
      claimNumber: 'MC240901234',
      serviceDate: '2024-09-15',
      provider: 'Dr. Smith Family Practice',
      serviceDescription: 'Office visit - routine checkup',
      totalAmount: 280,
      medicareApproved: 220,
      medicarePaid: 176,
      yourResponsibility: 44,
      status: 'processed',
      processedDate: '2024-09-20'
    },
    {
      id: '2',
      claimNumber: 'MC240901235',
      serviceDate: '2024-09-10',
      provider: 'Central Lab Services',
      serviceDescription: 'Blood work - comprehensive panel',
      totalAmount: 150,
      medicareApproved: 120,
      medicarePaid: 96,
      yourResponsibility: 24,
      status: 'processed',
      processedDate: '2024-09-18'
    },
    {
      id: '3',
      claimNumber: 'MC240901236',
      serviceDate: '2024-09-25',
      provider: 'City Hospital',
      serviceDescription: 'X-ray - chest',
      totalAmount: 320,
      medicareApproved: 0,
      medicarePaid: 0,
      yourResponsibility: 320,
      status: 'denied',
      processedDate: '2024-09-28'
    }
  ];

  const providers: Provider[] = [
    {
      id: '1',
      name: 'Dr. Sarah Smith',
      specialty: 'Family Medicine',
      address: '123 Main St, Downtown',
      phone: '(555) 123-4567',
      acceptsMedicare: true,
      rating: 4.8,
      distance: 0.8,
      isPreferred: true
    },
    {
      id: '2',
      name: 'Heart Care Specialists',
      specialty: 'Cardiology',
      address: '456 Oak Ave, Midtown',
      phone: '(555) 234-5678',
      acceptsMedicare: true,
      rating: 4.6,
      distance: 2.1,
      isPreferred: false
    },
    {
      id: '3',
      name: 'Vision Plus Eye Care',
      specialty: 'Ophthalmology',
      address: '789 Pine St, Uptown',
      phone: '(555) 345-6789',
      acceptsMedicare: false,
      rating: 4.4,
      distance: 1.5,
      isPreferred: false
    }
  ];

  const prescriptions: Prescription[] = [
    {
      id: '1',
      drugName: 'Lisinopril',
      strength: '10mg',
      quantity: 30,
      daysSupply: 30,
      prescriber: 'Dr. Sarah Smith',
      pharmacy: 'MediRx Pharmacy',
      dateDispensed: '2024-09-20',
      costToYou: 8.50,
      planPaid: 15.75,
      totalCost: 24.25
    },
    {
      id: '2',
      drugName: 'Metformin',
      strength: '500mg',
      quantity: 60,
      daysSupply: 30,
      prescriber: 'Dr. Sarah Smith',
      pharmacy: 'MediRx Pharmacy',
      dateDispensed: '2024-09-20',
      costToYou: 12.00,
      planPaid: 28.50,
      totalCost: 40.50
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'denied': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processed': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'pending': return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'denied': return <AlertCircle className="h-5 w-5 text-red-600" />;
      default: return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getPlanTypeColor = (type: string) => {
    switch (type) {
      case 'A': return 'bg-blue-100 text-blue-800';
      case 'B': return 'bg-green-100 text-green-800';
      case 'C': return 'bg-purple-100 text-purple-800';
      case 'D': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalYearlyPremiums = medicarePlans
    .filter(plan => plan.enrolled)
    .reduce((sum, plan) => sum + (plan.monthlyPremium * 12), 0);

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Medicare</h1>
          <p className="text-gray-600">Manage your Medicare benefits, claims, and healthcare providers</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
          {[
            { id: 'overview', label: 'Account Overview', icon: Heart },
            { id: 'plans', label: 'My Plans', icon: Shield },
            { id: 'claims', label: 'Claims', icon: FileText },
            { id: 'providers', label: 'Find Providers', icon: User },
            { id: 'prescriptions', label: 'Prescriptions', icon: Pill }
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
                  <h2 className="text-2xl font-bold mb-2">Medicare Account</h2>
                  <p className="text-gray-600">Medicare Number: {account.medicareNumber}</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold">{account.fullName}</div>
                  <div className="text-gray-600">DOB: {account.dateOfBirth}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Heart className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-600">{account.currentParts.length}</div>
                  <div className="text-sm text-gray-600">Active Parts</div>
                  <div className="text-xs text-gray-500 mt-1">({account.currentParts.join(', ')})</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-600">${account.monthlyPremium}</div>
                  <div className="text-sm text-gray-600">Monthly Premium</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Shield className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-purple-600">${account.deductible}</div>
                  <div className="text-sm text-gray-600">Annual Deductible</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <FileText className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-orange-600">${account.outOfPocketMax}</div>
                  <div className="text-sm text-gray-600">Out-of-Pocket Max</div>
                </div>
              </div>
            </div>

            {/* Enrollment Status */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Enrollment Status</h3>
              <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
                  <div>
                    <h4 className="font-medium text-green-800">Medicare Enrolled</h4>
                    <p className="text-sm text-green-600">Enrollment Date: {account.enrollmentDate}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600">${totalYearlyPremiums.toFixed(2)}</div>
                  <div className="text-sm text-green-600">Annual Premium Cost</div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                  onClick={() => setActiveTab('claims')}
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-center"
                >
                  <FileText className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="font-medium">View Claims</div>
                  <div className="text-sm text-gray-600">Recent claim activity</div>
                </button>
                <button
                  onClick={() => setActiveTab('providers')}
                  className="p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors text-center"
                >
                  <User className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="font-medium">Find Providers</div>
                  <div className="text-sm text-gray-600">Search doctors & specialists</div>
                </button>
                <button
                  onClick={() => setActiveTab('prescriptions')}
                  className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors text-center"
                >
                  <Pill className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <div className="font-medium">Prescriptions</div>
                  <div className="text-sm text-gray-600">Manage medications</div>
                </button>
                <button
                  onClick={() => setActiveTab('plans')}
                  className="p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors text-center"
                >
                  <Shield className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <div className="font-medium">Compare Plans</div>
                  <div className="text-sm text-gray-600">Review coverage options</div>
                </button>
              </div>
            </div>

            {/* Important Notices */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-start">
                <AlertCircle className="h-6 w-6 text-blue-600 mt-1 mr-3" />
                <div>
                  <h3 className="font-semibold text-blue-800 mb-2">Upcoming Enrollment Periods</h3>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Open Enrollment: October 15 - December 7, 2024</li>
                    <li>• Medicare Advantage Open Enrollment: January 1 - March 31, 2025</li>
                    <li>• Review your coverage annually to ensure it meets your needs</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Plans Tab */}
        {activeTab === 'plans' && (
          <div className="space-y-6">
            {/* Current Plans */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">My Medicare Plans</h3>
              <div className="space-y-4">
                {medicarePlans.filter(plan => plan.enrolled).map(plan => (
                  <div key={plan.id} className="border-2 border-green-500 bg-green-50 rounded-lg p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 text-sm font-bold rounded ${getPlanTypeColor(plan.type)}`}>
                            Part {plan.type}
                          </span>
                          <h4 className="text-lg font-semibold">{plan.name}</h4>
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-sm rounded">
                            ENROLLED
                          </span>
                        </div>
                        <p className="text-gray-600 mb-3">{plan.description}</p>
                        <div className="space-y-1">
                          {plan.coverageDetails.map((detail, index) => (
                            <div key={index} className="flex items-center text-sm">
                              <CheckCircle className="h-3 w-3 text-green-600 mr-2" />
                              {detail}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">
                          ${plan.monthlyPremium === 0 ? 'Free' : plan.monthlyPremium + '/mo'}
                        </div>
                        <div className="text-sm text-gray-600">
                          Deductible: ${plan.deductible}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Available Plans */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Available Plans</h3>
              <div className="space-y-4">
                {medicarePlans.filter(plan => !plan.enrolled).map(plan => (
                  <div key={plan.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 text-sm font-bold rounded ${getPlanTypeColor(plan.type)}`}>
                            Part {plan.type}
                          </span>
                          <h4 className="text-lg font-semibold">{plan.name}</h4>
                        </div>
                        <p className="text-gray-600 mb-3">{plan.description}</p>
                        <div className="space-y-1 mb-3">
                          {plan.coverageDetails.map((detail, index) => (
                            <div key={index} className="flex items-center text-sm">
                              <CheckCircle className="h-3 w-3 text-blue-600 mr-2" />
                              {detail}
                            </div>
                          ))}
                        </div>
                        {plan.enrollmentPeriod && (
                          <div className="text-sm text-orange-600">
                            <strong>Enrollment Period:</strong> {plan.enrollmentPeriod}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">
                          ${plan.monthlyPremium === 0 ? 'Free' : plan.monthlyPremium + '/mo'}
                        </div>
                        <div className="text-sm text-gray-600 mb-3">
                          Deductible: ${plan.deductible}
                        </div>
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                          Learn More
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Claims Tab */}
        {activeTab === 'claims' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Claims</h3>
              <div className="space-y-4">
                {recentClaims.map(claim => (
                  <div key={claim.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusIcon(claim.status)}
                          <h4 className="font-semibold">{claim.serviceDescription}</h4>
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(claim.status)}`}>
                            {claim.status.toUpperCase()}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div><strong>Provider:</strong> {claim.provider}</div>
                          <div><strong>Service Date:</strong> {claim.serviceDate}</div>
                          <div><strong>Claim Number:</strong> {claim.claimNumber}</div>
                          {claim.processedDate && (
                            <div><strong>Processed:</strong> {claim.processedDate}</div>
                          )}
                        </div>
                      </div>
                      <div className="ml-6 text-right">
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Total:</span>
                            <span className="font-medium">${claim.totalAmount}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Medicare Approved:</span>
                            <span className="font-medium">${claim.medicareApproved}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Medicare Paid:</span>
                            <span className="font-medium text-green-600">${claim.medicarePaid}</span>
                          </div>
                          <div className="flex justify-between border-t pt-1">
                            <span>Your Responsibility:</span>
                            <span className="font-bold text-red-600">${claim.yourResponsibility}</span>
                          </div>
                        </div>
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

        {/* Providers Tab */}
        {activeTab === 'providers' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Healthcare Providers</h3>
              <div className="space-y-4">
                {providers.map(provider => (
                  <div key={provider.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{provider.name}</h4>
                          {provider.isPreferred && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                              PREFERRED
                            </span>
                          )}
                          {provider.acceptsMedicare ? (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                              ACCEPTS MEDICARE
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                              NO MEDICARE
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div><strong>Specialty:</strong> {provider.specialty}</div>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {provider.address} ({provider.distance} mi)
                          </div>
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-1" />
                            {provider.phone}
                          </div>
                          <div className="flex items-center">
                            <div className="flex items-center">
                              ⭐ {provider.rating} rating
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="ml-6 space-y-2">
                        <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                          Contact
                        </button>
                        <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
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

        {/* Prescriptions Tab */}
        {activeTab === 'prescriptions' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Prescriptions</h3>
              <div className="space-y-4">
                {prescriptions.map(prescription => (
                  <div key={prescription.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Pill className="h-5 w-5 text-blue-600" />
                          <h4 className="font-semibold">{prescription.drugName}</h4>
                          <span className="text-sm text-gray-600">({prescription.strength})</span>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div><strong>Prescriber:</strong> {prescription.prescriber}</div>
                          <div><strong>Pharmacy:</strong> {prescription.pharmacy}</div>
                          <div><strong>Date Dispensed:</strong> {prescription.dateDispensed}</div>
                          <div><strong>Quantity:</strong> {prescription.quantity} ({prescription.daysSupply} days supply)</div>
                        </div>
                      </div>
                      <div className="ml-6 text-right">
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Total Cost:</span>
                            <span className="font-medium">${prescription.totalCost}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Plan Paid:</span>
                            <span className="font-medium text-green-600">${prescription.planPaid}</span>
                          </div>
                          <div className="flex justify-between border-t pt-1">
                            <span>Your Cost:</span>
                            <span className="font-bold text-blue-600">${prescription.costToYou}</span>
                          </div>
                        </div>
                        <button className="mt-2 px-3 py-1 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50 transition-colors">
                          Refill
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Drug Coverage */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Part D Coverage Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Pill className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-600">$545</div>
                  <div className="text-sm text-gray-600">Annual Deductible</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-600">$245</div>
                  <div className="text-sm text-gray-600">Spent This Year</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <Shield className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-orange-600">$300</div>
                  <div className="text-sm text-gray-600">Remaining Deductible</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}