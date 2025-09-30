'use client';

import React, { useState } from 'react';
import { Search, Award, Calendar, DollarSign, ArrowLeft, Filter, BookOpen, Users, Clock, Star, ExternalLink, FileText, CheckCircle } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

interface Scholarship {
  id: string;
  name: string;
  provider: string;
  amount: number;
  type: 'full' | 'partial' | 'need-based' | 'merit-based';
  deadline: string;
  requirements: string[];
  description: string;
  eligibility: string[];
  category: 'academic' | 'athletic' | 'community' | 'minority' | 'field-specific' | 'need-based';
  renewability: 'one-time' | 'renewable';
  applicants: number;
  award_rate: number;
  applied: boolean;
  favorite: boolean;
}

interface Application {
  id: string;
  scholarshipId: string;
  scholarshipName: string;
  amount: number;
  status: 'draft' | 'submitted' | 'under_review' | 'awarded' | 'rejected';
  deadline: string;
  submittedDate?: string;
  requirements: ApplicationRequirement[];
}

interface ApplicationRequirement {
  id: string;
  name: string;
  type: 'essay' | 'transcript' | 'recommendation' | 'portfolio' | 'financial_document';
  completed: boolean;
  optional: boolean;
}

const ScholarshipsPage = () => {
  const [activeTab, setActiveTab] = useState<'search' | 'applications' | 'profile'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [amountRange, setAmountRange] = useState<[number, number]>([0, 50000]);
  const [deadlineFilter, setDeadlineFilter] = useState<string>('all');
  const [favorites, setFavorites] = useState<Set<string>>(new Set(['1', '3']));
  const [appliedScholarships, setAppliedScholarships] = useState<Set<string>>(new Set(['1', '2']));

  const scholarships: Scholarship[] = [
    {
      id: '1',
      name: 'National Merit Scholarship',
      provider: 'National Merit Scholarship Corporation',
      amount: 2500,
      type: 'merit-based',
      deadline: '2024-10-15',
      requirements: ['High SAT/PSAT scores', 'Academic transcript', 'Essay'],
      description: 'Awarded to academically talented high school seniors who demonstrate exceptional academic ability.',
      eligibility: ['US citizen', 'High school senior', 'PSAT/SAT scores in top 1%'],
      category: 'academic',
      renewability: 'one-time',
      applicants: 15000,
      award_rate: 0.17,
      applied: true,
      favorite: true
    },
    {
      id: '2',
      name: 'Gates Millennium Scholars Program',
      provider: 'Gates Foundation',
      amount: 25000,
      type: 'need-based',
      deadline: '2024-01-15',
      requirements: ['Financial need documentation', 'Community service record', 'Essays', 'Recommendations'],
      description: 'Full scholarship for outstanding African American, American Indian/Alaska Native, Asian Pacific Islander American, and Hispanic American students.',
      eligibility: ['Minority student', 'Demonstrated financial need', 'Academic excellence', 'Leadership potential'],
      category: 'minority',
      renewability: 'renewable',
      applicants: 53000,
      award_rate: 0.02,
      applied: true,
      favorite: false
    },
    {
      id: '3',
      name: 'STEM Excellence Scholarship',
      provider: 'Tech Leaders Foundation',
      amount: 10000,
      type: 'merit-based',
      deadline: '2024-03-31',
      requirements: ['STEM major declaration', 'Research project portfolio', 'Academic transcript'],
      description: 'Supporting the next generation of STEM innovators with financial assistance for undergraduate studies.',
      eligibility: ['STEM major', 'Minimum 3.5 GPA', 'Research experience'],
      category: 'field-specific',
      renewability: 'renewable',
      applicants: 8500,
      award_rate: 0.12,
      applied: false,
      favorite: true
    },
    {
      id: '4',
      name: 'Community Leadership Award',
      provider: 'Community Foundation',
      amount: 5000,
      type: 'merit-based',
      deadline: '2024-06-30',
      requirements: ['Community service documentation', 'Leadership essay', 'Character references'],
      description: 'Recognizing students who have made significant contributions to their communities through volunteer work and leadership.',
      eligibility: ['100+ community service hours', 'Leadership role in organization', 'Good academic standing'],
      category: 'community',
      renewability: 'one-time',
      applicants: 3200,
      award_rate: 0.25,
      applied: false,
      favorite: false
    },
    {
      id: '5',
      name: 'First Generation College Scholarship',
      provider: 'Education Access Foundation',
      amount: 7500,
      type: 'need-based',
      deadline: '2024-04-15',
      requirements: ['First-generation status verification', 'Financial aid forms', 'Personal statement'],
      description: 'Supporting first-generation college students in achieving their educational goals.',
      eligibility: ['First in family to attend college', 'Financial need', 'College enrollment'],
      category: 'need-based',
      renewability: 'renewable',
      applicants: 12000,
      award_rate: 0.08,
      applied: false,
      favorite: false
    },
    {
      id: '6',
      name: 'Athletic Excellence Scholarship',
      provider: 'Sports Foundation',
      amount: 15000,
      type: 'merit-based',
      deadline: '2024-02-28',
      requirements: ['Athletic performance records', 'Coach recommendations', 'Academic transcript'],
      description: 'Supporting student-athletes who demonstrate excellence both on the field and in the classroom.',
      eligibility: ['Varsity sport participation', 'Minimum 3.0 GPA', 'Athletic achievements'],
      category: 'athletic',
      renewability: 'renewable',
      applicants: 5600,
      award_rate: 0.18,
      applied: false,
      favorite: false
    }
  ];

  const applications: Application[] = [
    {
      id: '1',
      scholarshipId: '1',
      scholarshipName: 'National Merit Scholarship',
      amount: 2500,
      status: 'under_review',
      deadline: '2024-10-15',
      submittedDate: '2024-10-10',
      requirements: [
        { id: '1', name: 'Academic Transcript', type: 'transcript', completed: true, optional: false },
        { id: '2', name: 'Personal Essay', type: 'essay', completed: true, optional: false },
        { id: '3', name: 'SAT Score Report', type: 'transcript', completed: true, optional: false }
      ]
    },
    {
      id: '2',
      scholarshipId: '2',
      scholarshipName: 'Gates Millennium Scholars Program',
      amount: 25000,
      status: 'submitted',
      deadline: '2024-01-15',
      submittedDate: '2024-01-12',
      requirements: [
        { id: '4', name: 'Financial Aid Documents', type: 'financial_document', completed: true, optional: false },
        { id: '5', name: 'Community Service Essay', type: 'essay', completed: true, optional: false },
        { id: '6', name: 'Teacher Recommendations', type: 'recommendation', completed: true, optional: false },
        { id: '7', name: 'Leadership Portfolio', type: 'portfolio', completed: true, optional: false }
      ]
    }
  ];

  const categories = [
    { id: 'all', name: 'All Categories', count: scholarships.length },
    { id: 'academic', name: 'Academic Excellence', count: scholarships.filter(s => s.category === 'academic').length },
    { id: 'need-based', name: 'Need-Based', count: scholarships.filter(s => s.category === 'need-based').length },
    { id: 'field-specific', name: 'Field-Specific', count: scholarships.filter(s => s.category === 'field-specific').length },
    { id: 'minority', name: 'Minority/Diversity', count: scholarships.filter(s => s.category === 'minority').length },
    { id: 'community', name: 'Community Service', count: scholarships.filter(s => s.category === 'community').length },
    { id: 'athletic', name: 'Athletic', count: scholarships.filter(s => s.category === 'athletic').length }
  ];

  const filteredScholarships = scholarships.filter(scholarship => {
    const matchesSearch = scholarship.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         scholarship.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         scholarship.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || scholarship.category === selectedCategory;
    const matchesAmount = scholarship.amount >= amountRange[0] && scholarship.amount <= amountRange[1];

    let matchesDeadline = true;
    if (deadlineFilter !== 'all') {
      const deadlineDate = new Date(scholarship.deadline);
      const today = new Date();
      const daysDiff = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 3600 * 24));

      switch (deadlineFilter) {
        case 'week':
          matchesDeadline = daysDiff <= 7;
          break;
        case 'month':
          matchesDeadline = daysDiff <= 30;
          break;
        case 'quarter':
          matchesDeadline = daysDiff <= 90;
          break;
      }
    }

    return matchesSearch && matchesCategory && matchesAmount && matchesDeadline;
  });

  const toggleFavorite = (scholarshipId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(scholarshipId)) {
      newFavorites.delete(scholarshipId);
    } else {
      newFavorites.add(scholarshipId);
    }
    setFavorites(newFavorites);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'text-gray-600 bg-gray-100';
      case 'submitted': return 'text-blue-600 bg-blue-100';
      case 'under_review': return 'text-yellow-600 bg-yellow-100';
      case 'awarded': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <FileText className="h-4 w-4" />;
      case 'submitted': return <CheckCircle className="h-4 w-4" />;
      case 'under_review': return <Clock className="h-4 w-4" />;
      case 'awarded': return <Award className="h-4 w-4" />;
      case 'rejected': return <ExternalLink className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
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
            <h1 className="text-2xl font-bold text-gray-900">Scholarships</h1>
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
              Find Scholarships
            </button>
            <button
              onClick={() => setActiveTab('applications')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'applications'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <FileText className="h-4 w-4 inline mr-2" />
              My Applications ({applications.length})
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'profile'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Users className="h-4 w-4 inline mr-2" />
              Profile & Preferences
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
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-4">
                <div className="lg:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search scholarships..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name} ({category.count})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <select
                    value={deadlineFilter}
                    onChange={(e) => setDeadlineFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Deadlines</option>
                    <option value="week">Due This Week</option>
                    <option value="month">Due This Month</option>
                    <option value="quarter">Due This Quarter</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700">Award Amount:</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">${amountRange[0].toLocaleString()}</span>
                  <input
                    type="range"
                    min="0"
                    max="50000"
                    value={amountRange[1]}
                    onChange={(e) => setAmountRange([amountRange[0], parseInt(e.target.value)])}
                    className="flex-1"
                  />
                  <span className="text-sm text-gray-600">${amountRange[1].toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Results Summary */}
            <div className="flex justify-between items-center">
              <p className="text-gray-600">
                Showing {filteredScholarships.length} scholarships
                {selectedCategory !== 'all' && ` in ${categories.find(c => c.id === selectedCategory)?.name}`}
              </p>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  {favorites.size} favorites
                </span>
                <span className="text-sm text-gray-600">
                  {appliedScholarships.size} applied
                </span>
              </div>
            </div>

            {/* Scholarships Grid */}
            <div className="grid gap-6">
              {filteredScholarships.map((scholarship) => (
                <div key={scholarship.id} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">{scholarship.name}</h3>
                        <button
                          onClick={() => toggleFavorite(scholarship.id)}
                          className={`p-1 rounded ${favorites.has(scholarship.id) ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'}`}
                        >
                          <Star className={`h-5 w-5 ${favorites.has(scholarship.id) ? 'fill-current' : ''}`} />
                        </button>
                      </div>
                      <p className="text-gray-600 mb-2">{scholarship.provider}</p>
                      <p className="text-gray-700 mb-3">{scholarship.description}</p>

                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          scholarship.type === 'merit-based' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {scholarship.type.replace('-', ' ')}
                        </span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium capitalize">
                          {scholarship.category.replace('-', ' ')}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          scholarship.renewability === 'renewable' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'
                        }`}>
                          {scholarship.renewability}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-3xl font-bold text-green-600">${scholarship.amount.toLocaleString()}</p>
                      <p className="text-sm text-gray-500 mb-2">award amount</p>
                      <div className="text-sm text-gray-600">
                        <p>Deadline: {new Date(scholarship.deadline).toLocaleDateString()}</p>
                        <p>{scholarship.applicants.toLocaleString()} applicants</p>
                        <p>{(scholarship.award_rate * 100).toFixed(1)}% award rate</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Requirements:</h4>
                      <ul className="space-y-1">
                        {scholarship.requirements.map((req, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-center">
                            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></span>
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Eligibility:</h4>
                      <ul className="space-y-1">
                        {scholarship.eligibility.map((criteria, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-center">
                            <span className="w-1.5 h-1.5 bg-green-600 rounded-full mr-2"></span>
                            {criteria}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    {appliedScholarships.has(scholarship.id) ? (
                      <button
                        disabled
                        className="bg-green-100 text-green-700 px-6 py-2 rounded-lg font-medium flex items-center gap-2"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Applied
                      </button>
                    ) : (
                      <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                        Apply Now
                      </button>
                    )}
                    <button className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2">
                      <ExternalLink className="h-4 w-4" />
                      Learn More
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredScholarships.length === 0 && (
              <div className="text-center py-12">
                <Award className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No scholarships found</h3>
                <p className="text-gray-600">Try adjusting your search criteria or filters</p>
              </div>
            )}
          </div>
        )}

        {/* Applications Tab */}
        {activeTab === 'applications' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">My Applications</h2>

              <div className="space-y-6">
                {applications.map((application) => (
                  <div key={application.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{application.scholarshipName}</h3>
                        <p className="text-2xl font-bold text-green-600">${application.amount.toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
                          {getStatusIcon(application.status)}
                          {application.status.replace('_', ' ').toUpperCase()}
                        </span>
                        <p className="text-sm text-gray-600 mt-1">
                          Deadline: {new Date(application.deadline).toLocaleDateString()}
                        </p>
                        {application.submittedDate && (
                          <p className="text-sm text-gray-500">
                            Submitted: {new Date(application.submittedDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Application Requirements</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {application.requirements.map((req) => (
                          <div key={req.id} className="flex items-center gap-3">
                            <CheckCircle className={`h-5 w-5 ${req.completed ? 'text-green-600' : 'text-gray-300'}`} />
                            <span className={req.completed ? 'text-gray-900' : 'text-gray-500'}>
                              {req.name}
                              {req.optional && <span className="text-gray-400 ml-1">(Optional)</span>}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 flex gap-3">
                      <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                        View Application
                      </button>
                      {application.status === 'draft' && (
                        <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                          Continue Application
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {applications.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
                  <p className="text-gray-600 mb-4">Start applying to scholarships to see them here</p>
                  <button
                    onClick={() => setActiveTab('search')}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Find Scholarships
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Scholarship Profile</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Academic Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">GPA</label>
                    <input
                      type="number"
                      step="0.01"
                      max="4.0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="3.50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Major/Field of Study</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option>Computer Science</option>
                      <option>Engineering</option>
                      <option>Business</option>
                      <option>Liberal Arts</option>
                      <option>Medicine</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Expected Graduation</label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Financial Need Level</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option>High Need</option>
                      <option>Moderate Need</option>
                      <option>Low Need</option>
                      <option>No Financial Need</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Extracurricular Activities</label>
                    <textarea
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="List your activities, leadership roles, volunteer work..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Community Service Hours</label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="120"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Preferences</h3>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" defaultChecked />
                  <span className="ml-2 text-sm text-gray-700">Email me about new scholarship opportunities</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" defaultChecked />
                  <span className="ml-2 text-sm text-gray-700">Remind me about approaching deadlines</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  <span className="ml-2 text-sm text-gray-700">Send me application tips and resources</span>
                </label>
              </div>
            </div>

            <div className="mt-8">
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Save Profile
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ScholarshipsPage;