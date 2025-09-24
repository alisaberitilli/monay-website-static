'use client';

import React, { useState, useEffect } from 'react';
import { Users, Plus, Settings, DollarSign, Shield, UserPlus, Trash2, Edit } from 'lucide-react';

interface GroupMember {
  tenant_id: string;
  tenant_name: string;
  tenant_code: string;
  role: 'primary' | 'admin' | 'member' | 'viewer';
  ownership_percent: number;
  joined_at: string;
  permissions: string[];
}

interface Group {
  id: string;
  group_name: string;
  group_type: 'household' | 'holding_company' | 'small_business';
  primary_tenant_id: string;
  primary_tenant_name: string;
  status: string;
  member_count: number;
  my_role: string;
  my_ownership: number;
  configuration: any;
  metadata: any;
  created_at: string;
}

interface Treasury {
  group_id: string;
  balance_cents: number;
  monthly_allocation_cents: number;
  allocations: Array<{
    tenant_id: string;
    tenant_name: string;
    allocation_percent: number;
    amount_cents: number;
  }>;
}

export default function GroupManagement() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [treasury, setTreasury] = useState<Treasury | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'members' | 'billing' | 'treasury'>('members');

  useEffect(() => {
    loadGroups();
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      loadGroupDetails(selectedGroup.id);
    }
  }, [selectedGroup, activeTab]);

  const loadGroups = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/groups`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setGroups(data.groups);
        if (data.groups.length > 0 && !selectedGroup) {
          setSelectedGroup(data.groups[0]);
        }
      }
    } catch (error) {
      console.error('Failed to load groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadGroupDetails = async (groupId: string) => {
    try {
      // Load members
      if (activeTab === 'members') {
        const membersResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/groups/${groupId}/members`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
        if (membersResponse.ok) {
          const data = await membersResponse.json();
          setMembers(data.members);
        }
      }

      // Load treasury
      if (activeTab === 'treasury') {
        const treasuryResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/groups/${groupId}/treasury`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
        if (treasuryResponse.ok) {
          const data = await treasuryResponse.json();
          setTreasury(data);
        }
      }
    } catch (error) {
      console.error('Failed to load group details:', error);
    }
  };

  const createGroup = async (groupData: any) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/groups`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(groupData),
      });

      if (response.ok) {
        const data = await response.json();
        setShowCreateModal(false);
        loadGroups();
        alert('Group created successfully!');
      }
    } catch (error) {
      console.error('Failed to create group:', error);
      alert('Failed to create group');
    }
  };

  const addMember = async (tenantId: string, role: string, ownershipPercent: number) => {
    if (!selectedGroup) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/groups/${selectedGroup.id}/members`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            tenant_id: tenantId,
            role,
            ownership_percent: ownershipPercent,
          }),
        }
      );

      if (response.ok) {
        setShowAddMemberModal(false);
        loadGroupDetails(selectedGroup.id);
        alert('Member added successfully!');
      }
    } catch (error) {
      console.error('Failed to add member:', error);
      alert('Failed to add member');
    }
  };

  const removeMember = async (tenantId: string) => {
    if (!selectedGroup || !confirm('Are you sure you want to remove this member?')) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/groups/${selectedGroup.id}/members/${tenantId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (response.ok) {
        loadGroupDetails(selectedGroup.id);
        alert('Member removed successfully!');
      }
    } catch (error) {
      console.error('Failed to remove member:', error);
      alert('Failed to remove member');
    }
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'primary':
        return 'bg-purple-100 text-purple-700';
      case 'admin':
        return 'bg-blue-100 text-blue-700';
      case 'member':
        return 'bg-gray-100 text-gray-700';
      case 'viewer':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-64 bg-gray-200 rounded-lg"></div>
          <div className="lg:col-span-2 h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Group Management</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Group
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Groups List */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-4 border-b">
            <h2 className="font-semibold text-gray-900">Your Groups</h2>
          </div>
          <div className="divide-y">
            {groups.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No groups yet</p>
              </div>
            ) : (
              groups.map((group) => (
                <button
                  key={group.id}
                  onClick={() => setSelectedGroup(group)}
                  className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                    selectedGroup?.id === group.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{group.group_name}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${getRoleBadgeColor(group.my_role)}`}>
                      {group.my_role}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>Type: {group.group_type.replace('_', ' ')}</p>
                    <p>{group.member_count} members</p>
                    {group.my_ownership > 0 && (
                      <p>Your ownership: {group.my_ownership}%</p>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Group Details */}
        {selectedGroup ? (
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm">
            {/* Tabs */}
            <div className="border-b">
              <div className="flex">
                <button
                  onClick={() => setActiveTab('members')}
                  className={`px-6 py-3 font-medium border-b-2 transition-colors ${
                    activeTab === 'members'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Users className="w-4 h-4 inline mr-2" />
                  Members
                </button>
                <button
                  onClick={() => setActiveTab('billing')}
                  className={`px-6 py-3 font-medium border-b-2 transition-colors ${
                    activeTab === 'billing'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <DollarSign className="w-4 h-4 inline mr-2" />
                  Billing
                </button>
                <button
                  onClick={() => setActiveTab('treasury')}
                  className={`px-6 py-3 font-medium border-b-2 transition-colors ${
                    activeTab === 'treasury'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Shield className="w-4 h-4 inline mr-2" />
                  Treasury
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'members' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-gray-900">Group Members</h3>
                    {['primary', 'admin'].includes(selectedGroup.my_role) && (
                      <button
                        onClick={() => setShowAddMemberModal(true)}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
                      >
                        <UserPlus className="w-4 h-4" />
                        Add Member
                      </button>
                    )}
                  </div>

                  <div className="space-y-3">
                    {members.map((member) => (
                      <div key={member.tenant_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-900">{member.tenant_name}</div>
                          <div className="text-xs text-gray-500">Code: {member.tenant_code}</div>
                          {member.ownership_percent > 0 && (
                            <div className="text-xs text-gray-500 mt-1">
                              Ownership: {member.ownership_percent}%
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${getRoleBadgeColor(member.role)}`}>
                            {member.role}
                          </span>
                          {['primary', 'admin'].includes(selectedGroup.my_role) && 
                           member.role !== 'primary' && (
                            <button
                              onClick={() => removeMember(member.tenant_id)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'billing' && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-4">Group Billing</h3>
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      Group billing aggregation allows consolidated billing for all members.
                      The primary member is responsible for payment.
                    </p>
                  </div>
                  <button
                    onClick={() => window.open(`/groups/${selectedGroup.id}/billing`)}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    View Billing Details
                  </button>
                </div>
              )}

              {activeTab === 'treasury' && treasury && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-4">Group Treasury</h3>
                  
                  <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                    <div className="text-sm text-blue-600 mb-1">Current Balance</div>
                    <div className="text-2xl font-bold text-blue-900">
                      {formatCurrency(treasury.balance_cents)}
                    </div>
                    <div className="text-xs text-blue-600 mt-1">
                      Monthly Allocation: {formatCurrency(treasury.monthly_allocation_cents)}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Member Allocations</h4>
                    <div className="space-y-2">
                      {treasury.allocations.map((allocation) => (
                        <div key={allocation.tenant_id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                          <div>
                            <div className="font-medium text-sm">{allocation.tenant_name}</div>
                            <div className="text-xs text-gray-500">{allocation.allocation_percent}% allocation</div>
                          </div>
                          <div className="text-sm font-medium">
                            {formatCurrency(allocation.amount_cents)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {selectedGroup.my_role === 'primary' && (
                    <button
                      onClick={() => window.open(`/groups/${selectedGroup.id}/treasury/manage`)}
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Manage Allocations
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-12 text-center">
            <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">Select a group to view details</p>
          </div>
        )}
      </div>

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Create New Group</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                createGroup({
                  group_name: formData.get('group_name'),
                  group_type: formData.get('group_type'),
                });
              }}
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Group Name
                  </label>
                  <input
                    name="group_name"
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="e.g., Smith Family, ABC Holdings"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Group Type
                  </label>
                  <select
                    name="group_type"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="household">Household</option>
                    <option value="small_business">Small Business</option>
                    <option value="holding_company">Holding Company</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMemberModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add Member to Group</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                addMember(
                  formData.get('tenant_id') as string,
                  formData.get('role') as string,
                  Number(formData.get('ownership_percent'))
                );
              }}
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tenant ID
                  </label>
                  <input
                    name="tenant_id"
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Enter tenant ID"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    name="role"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                    <option value="viewer">Viewer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ownership Percent (optional)
                  </label>
                  <input
                    name="ownership_percent"
                    type="number"
                    min="0"
                    max="100"
                    defaultValue="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddMemberModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}