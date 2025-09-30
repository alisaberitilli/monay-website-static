'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface Tenant {
  id: string;
  name: string;
  tenant_code: string;
  type: 'individual' | 'household_member' | 'small_business' | 'enterprise' | 'holding_company';
  billing_tier: 'free' | 'small_business' | 'enterprise' | 'custom';
  status: 'pending' | 'active' | 'suspended' | 'terminated';
  isolation_level: string;
  gross_margin_percent: number;
  metadata: any;
  settings: any;
}

export default function TenantEditPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const tenantId = params.id as string;

  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    billing_tier: '',
    status: '',
    metadata: '',
    settings: '',
  });

  useEffect(() => {
    if (tenantId) {
      loadTenantDetails();
    }
  }, [tenantId]);

  const loadTenantDetails = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('monay_admin_token') : null;
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

      const response = await fetch(
        `${backendUrl}/api/tenants/${tenantId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setTenant(data);
        setFormData({
          name: data.name || '',
          billing_tier: data.billing_tier || '',
          status: data.status || '',
          metadata: JSON.stringify(data.metadata || {}, null, 2),
          settings: JSON.stringify(data.settings || {}, null, 2),
        });
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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      // Validate JSON fields
      let metadata = {};
      let settings = {};

      try {
        metadata = JSON.parse(formData.metadata || '{}');
      } catch (e) {
        toast({
          title: 'Invalid Metadata',
          description: 'Metadata must be valid JSON',
          variant: 'destructive',
        });
        setSaving(false);
        return;
      }

      try {
        settings = JSON.parse(formData.settings || '{}');
      } catch (e) {
        toast({
          title: 'Invalid Settings',
          description: 'Settings must be valid JSON',
          variant: 'destructive',
        });
        setSaving(false);
        return;
      }

      const token = typeof window !== 'undefined' ? localStorage.getItem('monay_admin_token') : null;
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

      const updateData = {
        name: formData.name,
        billing_tier: formData.billing_tier,
        status: formData.status,
        metadata,
        settings,
      };

      const response = await fetch(
        `${backendUrl}/api/tenants/${tenantId}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData),
        }
      );

      if (response.ok) {
        toast({
          title: 'Tenant Updated',
          description: 'Tenant has been successfully updated.',
        });
        router.push(`/tenants/${tenantId}`);
      } else {
        const errorData = await response.json();
        toast({
          title: 'Update Failed',
          description: errorData.message || 'Failed to update tenant',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to update tenant:', error);
      toast({
        title: 'Update Failed',
        description: 'An error occurred while updating the tenant',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
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
            <h1 className="text-3xl font-bold">Edit Tenant</h1>
            <p className="text-gray-600 mt-1">{tenant.name} ({tenant.tenant_code})</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/tenants/${tenant.id}`)}
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Tenant Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter tenant name"
              />
            </div>

            <div>
              <Label htmlFor="billing_tier">Billing Tier</Label>
              <Select
                value={formData.billing_tier}
                onValueChange={(value) => handleInputChange('billing_tier', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select billing tier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="small_business">Small Business</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleInputChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="terminated">Terminated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Read-only Information */}
        <Card>
          <CardHeader>
            <CardTitle>Tenant Information (Read-only)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Tenant Code</Label>
              <Input value={tenant.tenant_code} disabled />
            </div>

            <div>
              <Label>Type</Label>
              <Input value={tenant.type.replace('_', ' ')} disabled />
            </div>

            <div>
              <Label>Isolation Level</Label>
              <Input value={tenant.isolation_level} disabled />
            </div>

            <div>
              <Label>Gross Margin</Label>
              <Input value={`${tenant.gross_margin_percent}%`} disabled />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Configuration */}
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Advanced Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="metadata">Metadata (JSON)</Label>
              <Textarea
                id="metadata"
                value={formData.metadata}
                onChange={(e) => handleInputChange('metadata', e.target.value)}
                placeholder="Enter metadata as JSON"
                rows={8}
                className="font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                Must be valid JSON format. This stores additional tenant configuration.
              </p>
            </div>

            <div>
              <Label htmlFor="settings">Settings (JSON)</Label>
              <Textarea
                id="settings"
                value={formData.settings}
                onChange={(e) => handleInputChange('settings', e.target.value)}
                placeholder="Enter settings as JSON"
                rows={8}
                className="font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                Must be valid JSON format. This stores tenant-specific settings and preferences.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}