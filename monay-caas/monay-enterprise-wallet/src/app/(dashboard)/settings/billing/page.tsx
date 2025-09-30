'use client';

import { useRouter } from 'next/navigation';
import BillingDashboard from '@/components/BillingDashboard';
import TenantSelector from '@/components/TenantSelector';

export default function SettingsBillingPage() {
  const router = useRouter();

  const handleBackToSettings = () => {
    router.push('/settings');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb Navigation */}
        <nav className="mb-4 text-sm">
          <ol className="flex items-center space-x-2">
            <li>
              <button
                onClick={handleBackToSettings}
                className="text-gray-500 hover:text-gray-700"
              >
                Settings
              </button>
            </li>
            <li className="text-gray-400">/</li>
            <li className="text-gray-900 font-medium">Billing</li>
          </ol>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Billing & Payments</h1>
              <p className="mt-2 text-gray-600">
                Manage your billing information, payment methods, and view usage reports
              </p>
            </div>
            <TenantSelector />
          </div>
        </div>

        {/* Billing Sections */}
        <div className="space-y-6">
          {/* Payment Methods */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Payment Methods</h2>

            <div className="space-y-4">
              {/* Primary Card */}
              <div className="border rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-xs">
                    VISA
                  </div>
                  <div>
                    <p className="font-medium">•••• •••• •••• 4242</p>
                    <p className="text-sm text-gray-500">Expires 12/25</p>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    Primary
                  </span>
                </div>
                <button className="text-blue-600 hover:text-blue-800">
                  Update
                </button>
              </div>

              {/* Add Payment Method */}
              <button className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors">
                + Add Payment Method
              </button>
            </div>
          </div>

          {/* Billing Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Billing Information</h2>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  defaultValue="Acme Corporation"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tax ID
                </label>
                <input
                  type="text"
                  defaultValue="12-3456789"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Billing Address
                </label>
                <input
                  type="text"
                  defaultValue="123 Business Ave, Suite 100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2"
                />
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    defaultValue="San Francisco"
                    placeholder="City"
                    className="px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <input
                    type="text"
                    defaultValue="CA"
                    placeholder="State"
                    className="px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <input
                    type="text"
                    defaultValue="94105"
                    placeholder="ZIP"
                    className="px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Billing Email
                </label>
                <input
                  type="email"
                  defaultValue="billing@acme.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Save Changes
              </button>
            </div>
          </div>

          {/* Current Plan */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Current Plan</h2>

            <div className="border rounded-lg p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Enterprise Plan</h3>
                  <p className="text-gray-600 mt-1">Unlimited transactions, advanced features</p>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      <span className="text-gray-700">Unlimited API calls</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      <span className="text-gray-700">Multi-signature wallets</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      <span className="text-gray-700">Priority support</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      <span className="text-gray-700">USDXM discount: 25%</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-3xl font-bold text-gray-900">$2,999</p>
                  <p className="text-gray-600">per month</p>
                  <button className="mt-4 px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                    Change Plan
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Usage & Billing Dashboard */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Usage & Analytics</h2>
            <BillingDashboard />
          </div>

          {/* Invoices */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Invoices</h2>

            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                      Invoice
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                      Date
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                      Amount
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="py-3 px-4 text-sm">#INV-2024-001</td>
                    <td className="py-3 px-4 text-sm">Jan 1, 2025</td>
                    <td className="py-3 px-4 text-sm">$2,999.00</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        Paid
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <button className="text-blue-600 hover:text-blue-800 mr-3">
                        View
                      </button>
                      <button className="text-blue-600 hover:text-blue-800">
                        Download
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-sm">#INV-2023-012</td>
                    <td className="py-3 px-4 text-sm">Dec 1, 2024</td>
                    <td className="py-3 px-4 text-sm">$2,999.00</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        Paid
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <button className="text-blue-600 hover:text-blue-800 mr-3">
                        View
                      </button>
                      <button className="text-blue-600 hover:text-blue-800">
                        Download
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}