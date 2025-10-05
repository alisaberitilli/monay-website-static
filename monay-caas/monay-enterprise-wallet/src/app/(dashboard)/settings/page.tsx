'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('organization');

  const tabs = [
    { id: 'organization', label: 'Organization & Tenant', icon: '🏢' },
    { id: 'billing', label: 'Billing & Payments', icon: '💳' },
    { id: 'security', label: 'Security', icon: '🔒' },
    { id: 'api', label: 'API Keys', icon: '🔑' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'compliance', label: 'Compliance & KYC', icon: '📋' },
  ];

  const handleBillingClick = () => {
    router.push('/settings/billing');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings & Profile</h1>
          <p className="mt-2 text-gray-600">
            Manage your organization, profile, KYC verification, and platform settings
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    if (tab.id === 'billing') {
                      handleBillingClick();
                    } else {
                      setActiveTab(tab.id);
                    }
                  }}
                  className={`
                    py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2
                    ${activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow p-6">
          {activeTab === 'organization' && <OrganizationSettings />}
          {activeTab === 'security' && <SecuritySettings />}
          {activeTab === 'api' && <ApiSettings />}
          {activeTab === 'notifications' && <NotificationSettings />}
          {activeTab === 'compliance' && <ComplianceSettings />}
        </div>
      </div>
    </div>
  );
}

function OrganizationSettings() {
  const [orgName, setOrgName] = useState('');
  const [tenantName, setTenantName] = useState('');
  const [tenantType, setTenantType] = useState('corporate');
  const [users, setUsers] = useState([{ email: '', role: 'member' }]);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateOrganization = async () => {
    setIsCreating(true);
    try {
      // API call would go here to create tenant and organization
      console.log('Creating organization:', {
        orgName,
        tenantName,
        tenantType,
        users
      });

      // Show success message
      alert('Organization and tenant created successfully!');

      // Reset form
      setOrgName('');
      setTenantName('');
      setTenantType('corporate');
      setUsers([{ email: '', role: 'member' }]);
    } catch (error) {
      console.error('Error creating organization:', error);
      alert('Failed to create organization. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const addUser = () => {
    setUsers([...users, { email: '', role: 'member' }]);
  };

  const updateUser = (index: number, field: 'email' | 'role', value: string) => {
    const newUsers = [...users];
    newUsers[index][field] = value;
    setUsers(newUsers);
  };

  const removeUser = (index: number) => {
    setUsers(users.filter((_, i) => i !== index));
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Organization & Tenant Management</h2>

      <div className="space-y-6">
        {/* Create New Tenant & Organization Section */}
        <div className="border rounded-lg p-6 bg-gray-50">
          <h3 className="text-lg font-medium mb-4">Create New Tenant & Organization</h3>

          <div className="grid grid-cols-2 gap-6">
            {/* Tenant Information */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tenant Name
              </label>
              <input
                type="text"
                value={tenantName}
                onChange={(e) => setTenantName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="e.g., Acme Corporation Tenant"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tenant Type
              </label>
              <select
                value={tenantType}
                onChange={(e) => setTenantType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="corporate">Corporate</option>
                <option value="financial_institution">Financial Institution</option>
                <option value="government">Government</option>
                <option value="nonprofit">Non-Profit</option>
                <option value="educational">Educational</option>
                <option value="healthcare">Healthcare</option>
                <option value="retail">Retail</option>
                <option value="technology">Technology</option>
              </select>
            </div>

            {/* Organization Information */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Organization Name
              </label>
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="e.g., Acme Corporation"
              />
            </div>

            {/* User Assignment */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assign Users to Organization
              </label>

              {users.map((user, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="email"
                    value={user.email}
                    onChange={(e) => updateUser(index, 'email', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="user@example.com"
                  />
                  <select
                    value={user.role}
                    onChange={(e) => updateUser(index, 'role', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="member">Member</option>
                    <option value="viewer">Viewer</option>
                  </select>
                  <button
                    onClick={() => removeUser(index)}
                    className="px-3 py-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200"
                  >
                    Remove
                  </button>
                </div>
              ))}

              <button
                onClick={addUser}
                className="mt-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                + Add User
              </button>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleCreateOrganization}
              disabled={isCreating || !tenantName || !orgName}
              className={`px-6 py-2 rounded-md font-medium ${
                isCreating || !tenantName || !orgName
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isCreating ? 'Creating...' : 'Create Tenant & Organization'}
            </button>
          </div>
        </div>

        {/* Existing Organizations */}
        <div>
          <h3 className="text-lg font-medium mb-4">Existing Organizations</h3>
          <div className="border rounded-lg overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Organization
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tenant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Users
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-900">Sample Organization</td>
                  <td className="px-6 py-4 text-sm text-gray-900">Sample Tenant</td>
                  <td className="px-6 py-4 text-sm text-gray-900">Corporate</td>
                  <td className="px-6 py-4 text-sm text-gray-900">5</td>
                  <td className="px-6 py-4 text-sm">
                    <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                    <button className="text-red-600 hover:text-red-900">Delete</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function SecuritySettings() {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Security Settings</h2>
      <div className="space-y-4">
        <div>
          <h3 className="font-medium mb-2">Two-Factor Authentication</h3>
          <p className="text-gray-600 mb-2">Add an extra layer of security to your account.</p>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Enable 2FA
          </button>
        </div>
        <div>
          <h3 className="font-medium mb-2">Password Policy</h3>
          <p className="text-gray-600 mb-2">Configure password requirements for your organization.</p>
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">
            Configure
          </button>
        </div>
      </div>
    </div>
  );
}

function ApiSettings() {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">API Keys</h2>
      <div className="space-y-4">
        <div>
          <h3 className="font-medium mb-2">Production API Key</h3>
          <p className="text-gray-600 mb-2">Use this key for production environments.</p>
          <div className="flex gap-2">
            <input
              type="text"
              value="sk_prod_••••••••••••••••"
              readOnly
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
            />
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">
              Regenerate
            </button>
          </div>
        </div>
        <div>
          <h3 className="font-medium mb-2">Test API Key</h3>
          <p className="text-gray-600 mb-2">Use this key for testing and development.</p>
          <div className="flex gap-2">
            <input
              type="text"
              value="sk_test_••••••••••••••••"
              readOnly
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
            />
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">
              Regenerate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function NotificationSettings() {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Notification Preferences</h2>
      <div className="space-y-4">
        <label className="flex items-center">
          <input type="checkbox" className="mr-2" defaultChecked />
          <span>Email notifications for transactions</span>
        </label>
        <label className="flex items-center">
          <input type="checkbox" className="mr-2" defaultChecked />
          <span>SMS alerts for high-value transactions</span>
        </label>
        <label className="flex items-center">
          <input type="checkbox" className="mr-2" />
          <span>Weekly usage reports</span>
        </label>
        <label className="flex items-center">
          <input type="checkbox" className="mr-2" defaultChecked />
          <span>Security alerts</span>
        </label>
      </div>
    </div>
  );
}

function ComplianceSettings() {
  const [kycStatus, setKycStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchKycStatus();
  }, []);

  const fetchKycStatus = async () => {
    try {
      const authToken = localStorage.getItem('auth_token');
      if (!authToken) {
        console.error('No auth token found');
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:3001/api/onboarding/status', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setKycStatus(data);
      } else {
        console.error('Failed to fetch KYC status:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching KYC status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKycUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const authToken = localStorage.getItem('auth_token');
      const formData = new FormData();

      // Add KYC documents
      Array.from(files).forEach((file, index) => {
        formData.append(`document_${index}`, file);
      });

      const response = await fetch('http://localhost:3001/api/customer-verification/kyc/submit', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        body: formData
      });

      if (response.ok) {
        alert('KYC documents uploaded successfully! Your submission is under review.');
        fetchKycStatus(); // Refresh status
      } else {
        const error = await response.json();
        alert(`Failed to upload KYC documents: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error uploading KYC documents:', error);
      alert('An error occurred while uploading KYC documents. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const isKycVerified = kycStatus?.verificationStatus?.kyc || false;
  const isEmailVerified = kycStatus?.verificationStatus?.email || false;
  const isMobileVerified = kycStatus?.verificationStatus?.mobile || false;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Compliance & KYC Verification</h2>
      <div className="space-y-6">
        {/* Verification Status Overview */}
        <div className="border rounded-lg p-6 bg-gray-50">
          <h3 className="font-medium mb-4">Verification Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Email Verification</span>
              {isEmailVerified ? (
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  ✓ Verified
                </span>
              ) : (
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                  ⚠ Pending
                </span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Mobile Verification</span>
              {isMobileVerified ? (
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  ✓ Verified
                </span>
              ) : (
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                  ⚠ Pending
                </span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">KYC/KYB Verification</span>
              {isKycVerified ? (
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  ✓ Verified
                </span>
              ) : (
                <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                  ✗ Not Verified
                </span>
              )}
            </div>
          </div>
        </div>

        {/* KYC Upload Section - Comprehensive */}
        {!isKycVerified && (
          <div className="space-y-6">
            {/* Business Documents */}
            <div className="border rounded-lg p-6">
              <div className="flex items-center gap-2 mb-3">
                <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <h3 className="font-semibold">Business Documents</h3>
              </div>
              <p className="text-gray-600 mb-4 text-sm">
                Upload your business registration and incorporation documents
              </p>
              <div className="space-y-3">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-400 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">Articles of Incorporation</p>
                      <p className="text-xs text-gray-500">Required • PDF, JPG, PNG (Max 10MB)</p>
                    </div>
                    <label className="cursor-pointer">
                      <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={(e) => handleKycUpload(e.target.files)} disabled={uploading} />
                      <button type="button" className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 text-sm font-medium">
                        Choose File
                      </button>
                    </label>
                  </div>
                </div>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-400 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">Business License</p>
                      <p className="text-xs text-gray-500">Required • PDF, JPG, PNG (Max 10MB)</p>
                    </div>
                    <label className="cursor-pointer">
                      <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={(e) => handleKycUpload(e.target.files)} disabled={uploading} />
                      <button type="button" className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 text-sm font-medium">
                        Choose File
                      </button>
                    </label>
                  </div>
                </div>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-400 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">Bank Statement</p>
                      <p className="text-xs text-gray-500">Optional • PDF, JPG, PNG (Max 10MB)</p>
                    </div>
                    <label className="cursor-pointer">
                      <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={(e) => handleKycUpload(e.target.files)} disabled={uploading} />
                      <button type="button" className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 text-sm font-medium">
                        Choose File
                      </button>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Tax Information */}
            <div className="border rounded-lg p-6">
              <div className="flex items-center gap-2 mb-3">
                <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="font-semibold">Tax Information</h3>
              </div>
              <p className="text-gray-600 mb-4 text-sm">
                Provide your EIN and tax registration details for compliance
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    EIN (Employer Identification Number) *
                  </label>
                  <input
                    type="text"
                    placeholder="12-3456789"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State Registration Number
                  </label>
                  <input
                    type="text"
                    placeholder="Optional"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex gap-2">
                  <svg className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-blue-800">
                    Your EIN is encrypted and securely stored. It's only used for tax reporting and compliance purposes.
                  </p>
                </div>
              </div>
            </div>

            {/* Identity Verification */}
            <div className="border rounded-lg p-6">
              <div className="flex items-center gap-2 mb-3">
                <svg className="h-5 w-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                </svg>
                <h3 className="font-semibold">Personal Identification</h3>
              </div>
              <p className="text-gray-600 mb-4 text-sm">
                Upload a government-issued ID for the primary business owner/representative
              </p>
              <div className="space-y-3">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-purple-400 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">Driver's License or Passport</p>
                      <p className="text-xs text-gray-500">Required • PDF, JPG, PNG (Max 10MB)</p>
                    </div>
                    <label className="cursor-pointer">
                      <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={(e) => handleKycUpload(e.target.files)} disabled={uploading} />
                      <button type="button" className="px-3 py-1.5 bg-purple-50 text-purple-600 rounded-md hover:bg-purple-100 text-sm font-medium">
                        Choose File
                      </button>
                    </label>
                  </div>
                </div>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-purple-400 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">Proof of Address</p>
                      <p className="text-xs text-gray-500">Optional • Utility bill or bank statement</p>
                    </div>
                    <label className="cursor-pointer">
                      <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={(e) => handleKycUpload(e.target.files)} disabled={uploading} />
                      <button type="button" className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 text-sm font-medium">
                        Choose File
                      </button>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Upload Status */}
            {uploading && (
              <div className="border rounded-lg p-4 bg-blue-50">
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  <div>
                    <p className="text-sm font-medium text-blue-900">Uploading documents...</p>
                    <p className="text-xs text-blue-700">Please wait while we process your submission</p>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-md hover:from-blue-700 hover:to-purple-700 font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={uploading}
              >
                Submit for Verification
              </button>
            </div>
          </div>
        )}

        {/* Compliance Documents */}
        <div>
          <h3 className="font-medium mb-2">Compliance Documents</h3>
          <p className="text-gray-600 mb-3 text-sm">
            Download official compliance reports and verification certificates.
          </p>
          <button
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            disabled={!isKycVerified}
          >
            {isKycVerified ? 'Download Compliance Report' : 'Complete KYC First'}
          </button>
        </div>

        {/* Help & Support */}
        <div className="border-t pt-4">
          <h3 className="font-medium mb-2 text-sm">Need Help?</h3>
          <p className="text-xs text-gray-600 mb-2">
            If you have questions about KYC verification or compliance requirements, contact our support team.
          </p>
          <button className="text-sm text-blue-600 hover:text-blue-800">
            Contact Support →
          </button>
        </div>
      </div>
    </div>
  );
}