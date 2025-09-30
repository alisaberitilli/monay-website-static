'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import TenantSelector from '@/components/TenantSelector';

export default function SettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('organization');

  const tabs = [
    { id: 'organization', label: 'Organization & Tenant', icon: '🏢' },
    { id: 'billing', label: 'Billing & Payments', icon: '💳' },
    { id: 'security', label: 'Security', icon: '🔒' },
    { id: 'api', label: 'API Keys', icon: '🔑' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'compliance', label: 'Compliance', icon: '📋' },
  ];

  const handleBillingClick = () => {
    router.push('/settings/billing');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <TenantSelector />
          </div>
          <p className="mt-2 text-gray-600">
            Manage your organization, tenant configuration, and platform settings
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
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Compliance & Regulatory</h2>
      <div className="space-y-4">
        <div>
          <h3 className="font-medium mb-2">KYC/AML Status</h3>
          <p className="text-gray-600 mb-2">Your organization is fully compliant.</p>
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
              ✓ KYC Verified
            </span>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
              ✓ AML Compliant
            </span>
          </div>
        </div>
        <div>
          <h3 className="font-medium mb-2">Compliance Documents</h3>
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">
            Download Compliance Report
          </button>
        </div>
      </div>
    </div>
  );
}