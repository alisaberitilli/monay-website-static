'use client';

import GroupManagement from '@/components/GroupManagement';
import TenantSelector from '@/components/TenantSelector';

export default function GroupsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Group Management</h1>
              <p className="mt-2 text-gray-600">
                Manage households, holding companies, and small business groups
              </p>
            </div>
            <TenantSelector />
          </div>
        </div>

        {/* Group Management Component */}
        <GroupManagement />
      </div>
    </div>
  );
}