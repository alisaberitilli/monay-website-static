'use client';

import React, { useState, useEffect } from 'react';
import { Home, Users, ChevronRight, UserPlus } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

interface GroupMembership {
  group_id: string;
  group_name: string;
  group_type: 'household' | 'holding_company' | 'small_business';
  my_role: 'primary' | 'admin' | 'member' | 'viewer';
  member_count: number;
  primary_member_name?: string;
}

export default function FamilyGroupIndicator() {
  const [membership, setMembership] = useState<GroupMembership | null>(null);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadGroupMembership();
  }, []);

  const loadGroupMembership = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/groups/my-membership`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.membership) {
          setMembership(data.membership);
        }
      }
    } catch (error) {
      console.error('Failed to load group membership:', error);
    } finally {
      setLoading(false);
    }
  };

  const createFamilyGroup = async (groupName: string, groupType: 'household' | 'holding_company' | 'small_business') => {
    setIsCreating(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/groups/create`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: groupName,
            type: groupType,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        alert('Family group created successfully!');
        setShowCreateGroup(false);
        // Reload membership
        loadGroupMembership();
      } else {
        const error = await response.json();
        alert(`Failed to create group: ${error.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to create group:', error);
      alert('Failed to create family group. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const inviteFamilyMember = async (email: string) => {
    if (!membership) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/groups/${membership.group_id}/invite`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, role: 'member' }),
        }
      );

      if (response.ok) {
        alert('Invitation sent!');
        setShowInvite(false);
        // Reload membership to update member count
        loadGroupMembership();
      } else {
        const error = await response.json();
        alert(`Failed to send invitation: ${error.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to invite member:', error);
      alert('Failed to send invitation');
    }
  };

  if (loading) {
    return null;
  }

  if (!membership) {
    return (
      <>
        <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Individual Account</h3>
                <p className="text-xs text-gray-600">Upgrade to share with family</p>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="text-blue-600 border-blue-300"
              onClick={() => setShowCreateGroup(true)}
            >
              Create Family Group
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </Card>

        {/* Create Group Modal */}
        {showCreateGroup && (
          <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <Card className="p-6 w-full max-w-md bg-white shadow-2xl border-2">
              <h3 className="text-lg font-semibold mb-2">Create Family Group</h3>
              <p className="text-sm text-gray-600 mb-4">
                Share your account with family members and manage everything in one place.
              </p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const groupName = formData.get('groupName') as string;
                  const groupType = formData.get('groupType') as 'household' | 'holding_company' | 'small_business';
                  createFamilyGroup(groupName, groupType);
                }}
              >
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Group Name
                  </label>
                  <input
                    name="groupName"
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    placeholder="The Smith Family"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Group Type
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="groupType"
                        value="household"
                        defaultChecked
                        className="mr-3"
                      />
                      <div>
                        <div className="font-medium text-sm">Household</div>
                        <div className="text-xs text-gray-500">Family members sharing expenses</div>
                      </div>
                    </label>
                    <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="groupType"
                        value="small_business"
                        className="mr-3"
                      />
                      <div>
                        <div className="font-medium text-sm">Small Business</div>
                        <div className="text-xs text-gray-500">Team sharing business expenses</div>
                      </div>
                    </label>
                    <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="groupType"
                        value="holding_company"
                        className="mr-3"
                      />
                      <div>
                        <div className="font-medium text-sm">Holding Company</div>
                        <div className="text-xs text-gray-500">Corporate structure with sub-entities</div>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateGroup(false)}
                    className="flex-1"
                    disabled={isCreating}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                    disabled={isCreating}
                  >
                    {isCreating ? 'Creating...' : 'Create Group'}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}
      </>
    );
  }

  const isHousehold = membership.group_type === 'household';
  const isPrimary = membership.my_role === 'primary';

  return (
    <Card className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
            <Home className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900 flex items-center gap-2">
              {membership.group_name}
              {isHousehold && (
                <Badge className="bg-purple-100 text-purple-700 text-xs">
                  Family
                </Badge>
              )}
            </h3>
            <p className="text-xs text-gray-600">
              {membership.member_count} members
              {isPrimary && ' • You pay the bills'}
            </p>
          </div>
        </div>

        {isPrimary && isHousehold && (
          <Button
            size="sm"
            variant="outline"
            className="text-purple-600 border-purple-300"
            onClick={() => setShowInvite(true)}
          >
            <UserPlus className="w-4 h-4 mr-1" />
            Add Member
          </Button>
        )}
      </div>

      {isPrimary && (
        <div className="text-xs text-purple-700 bg-purple-100 rounded-lg px-3 py-2">
          <strong>Family Plan Active</strong> - All transactions consolidated to your bill
        </div>
      )}

      {!isPrimary && membership.primary_member_name && (
        <div className="text-xs text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
          Billing handled by <strong>{membership.primary_member_name}</strong>
        </div>
      )}

      {/* Invite Modal */}
      {showInvite && (
        <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="p-6 w-full max-w-md bg-white shadow-2xl border-2">
            <h3 className="text-lg font-semibold mb-4">Invite Family Member</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                inviteFamilyMember(formData.get('email') as string);
              }}
            >
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  placeholder="family.member@email.com"
                />
              </div>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowInvite(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-purple-600 hover:bg-purple-700">
                  Send Invite
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </Card>
  );
}