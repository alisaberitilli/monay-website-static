'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Building, Users, Home, Briefcase, Shield, Edit, Trash2, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface Tenant {
  id: string;
  name: string;
  tenant_code: string;
  type: 'individual' | 'household_member' | 'small_business' | 'enterprise' | 'holding_company';
  billing_tier: 'free' | 'small_business' | 'enterprise' | 'custom';
  status: 'pending' | 'active' | 'suspended' | 'terminated';
  isolation_level: string;
  wallet_derivation_path: string;
  gross_margin_percent: number;
  metadata: any;
  created_at: string;
  updated_at: string;
  member_count: number;
  group_count: number;
  current_month_transactions: number;
  current_month_volume_cents: number;
  tenant_name?: string;
  last_activity?: string;
}

interface Organization {
  id: string;
  name: string;
  type: string;
  industry: string;
  description: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  tax_id: string;
  wallet_type: string;
  feature_tier: string;
  organization_type: string;
  status: string;
  kyc_status: string;
  compliance_score: number;
  created_at: string;
  updated_at: string;
}

export default function TenantViewPage() {
  const router = useRouter();
  const params = useParams();
  const tenantId = params.id as string;

  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (tenantId) {
      loadTenantDetails();
    }
  }, [tenantId]);

  const loadTenantDetails = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('monay_admin_token') : null;
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

      // Load tenant details
      const tenantResponse = await fetch(
        `${backendUrl}/api/tenants/${tenantId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (tenantResponse.ok) {
        const tenantData = await tenantResponse.json();
        setTenant(tenantData);

        // Load associated organization
        const orgResponse = await fetch(
          `${backendUrl}/api/organizations?tenant_id=${tenantId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );

        if (orgResponse.ok) {
          const orgData = await orgResponse.json();
          if (orgData.data && orgData.data.length > 0) {
            setOrganization(orgData.data[0]);
          }
        }
      } else {
        setError('Failed to load tenant details');
      }
    } catch (error) {
      console.error('Failed to load tenant details:', error);
      setError('Failed to load tenant details');
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'individual':
        return <Users className="w-5 h-5" />;
      case 'household_member':
        return <Home className="w-5 h-5" />;
      case 'small_business':
        return <Briefcase className="w-5 h-5" />;
      case 'enterprise':
        return <Building className="w-5 h-5" />;
      case 'holding_company':
        return <Shield className="w-5 h-5" />;
      default:
        return <Building className="w-5 h-5" />;
    }
  };

  const getTierBadgeVariant = (tier: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (tier) {
      case 'free': return 'default';
      case 'small_business': return 'secondary';
      case 'enterprise': return 'destructive';
      case 'custom': return 'outline';
      default: return 'default';
    }
  };

  const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'active': return 'secondary';
      case 'pending': return 'default';
      case 'suspended': return 'outline';
      case 'terminated': return 'destructive';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </div>
        <div className="text-center py-8">
          <p>Loading tenant details...</p>
        </div>
      </div>
    );
  }

  if (error || !tenant) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </div>
        <div className="text-center py-8">
          <p className="text-red-600">{error || 'Tenant not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div>
            <div className="flex items-center gap-2">
              {getTypeIcon(tenant.type)}
              <h1 className="text-3xl font-bold">{tenant.name}</h1>
            </div>
            <p className="text-gray-600 mt-1">Tenant Code: {tenant.tenant_code}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/tenants/${tenant.id}/edit`)}
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Tenant
          </Button>
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Status and Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={getStatusBadgeVariant(tenant.status)}>
              {tenant.status}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">Billing Tier</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={getTierBadgeVariant(tenant.billing_tier)}>
              {tenant.billing_tier.replace('_', ' ')}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tenant.member_count || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">Gross Margin</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tenant.gross_margin_percent}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Tenant Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Tenant Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Type</label>
                <p className="mt-1">{tenant.type.replace('_', ' ')}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Isolation Level</label>
                <p className="mt-1">{tenant.isolation_level}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Created</label>
                <p className="mt-1">{new Date(tenant.created_at).toLocaleDateString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Last Updated</label>
                <p className="mt-1">{new Date(tenant.updated_at).toLocaleDateString()}</p>
              </div>
            </div>

            <Separator />

            <div>
              <label className="text-sm font-medium text-gray-500">Wallet Derivation Path</label>
              <p className="mt-1 font-mono text-sm bg-gray-50 p-2 rounded">
                {tenant.wallet_derivation_path || 'Not set'}
              </p>
            </div>

            {tenant.metadata && Object.keys(tenant.metadata).length > 0 && (
              <>
                <Separator />
                <div>
                  <label className="text-sm font-medium text-gray-500">Metadata</label>
                  <pre className="mt-1 text-sm bg-gray-50 p-2 rounded overflow-auto">
                    {JSON.stringify(tenant.metadata, null, 2)}
                  </pre>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Organization Details */}
        {organization && (
          <Card>
            <CardHeader>
              <CardTitle>Associated Organization</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Organization Name</label>
                <p className="mt-1 font-medium">{organization.name}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Type</label>
                  <p className="mt-1">{organization.type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Industry</label>
                  <p className="mt-1">{organization.industry}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Wallet Type</label>
                  <p className="mt-1">{organization.wallet_type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Feature Tier</label>
                  <p className="mt-1">{organization.feature_tier}</p>
                </div>
              </div>

              <Separator />

              <div>
                <label className="text-sm font-medium text-gray-500">Description</label>
                <p className="mt-1">{organization.description}</p>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {organization.email && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <p className="mt-1">{organization.email}</p>
                  </div>
                )}
                {organization.phone && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Phone</label>
                    <p className="mt-1">{organization.phone}</p>
                  </div>
                )}
                {organization.website && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Website</label>
                    <p className="mt-1">
                      <a
                        href={organization.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {organization.website}
                      </a>
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2">
                <div>
                  <label className="text-sm font-medium text-gray-500">Compliance Score</label>
                  <p className="mt-1 font-medium">{organization.compliance_score}/100</p>
                </div>
                <Badge variant={organization.kyc_status === 'verified' ? 'secondary' : 'default'}>
                  KYC: {organization.kyc_status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Activity Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold">{tenant.current_month_transactions || 0}</div>
              <p className="text-sm text-gray-600">Transactions This Month</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold">
                ${((tenant.current_month_volume_cents || 0) / 100).toLocaleString()}
              </div>
              <p className="text-sm text-gray-600">Volume This Month</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold">{tenant.group_count || 0}</div>
              <p className="text-sm text-gray-600">Groups</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}