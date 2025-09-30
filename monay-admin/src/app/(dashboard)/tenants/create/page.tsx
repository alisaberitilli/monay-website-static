'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Building, Users, Home, Briefcase, Shield } from 'lucide-react';
import { STORAGE_KEYS } from '@/lib/axios';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface TenantFormData {
  name: string;
  tenant_code: string;
  type: 'individual' | 'household_member' | 'small_business' | 'enterprise' | 'holding_company';
  billing_tier: 'free' | 'small_business' | 'enterprise' | 'custom';
  email: string;
  phone: string;
  address: string;
  description: string;
  gross_margin_percent: number;
}

export default function CreateTenantPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [formData, setFormData] = useState<TenantFormData>({
    name: '',
    tenant_code: '',
    type: 'individual',
    billing_tier: 'free',
    email: '',
    phone: '',
    address: '',
    description: '',
    gross_margin_percent: 20,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'gross_margin_percent' ? Number(value) : value,
    }));
  };

  const handleSelectChange = (name: keyof TenantFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const generateTenantCode = () => {
    const prefix = formData.type.substring(0, 3).toUpperCase();
    const timestamp = Date.now().toString(36).toUpperCase();
    const code = `${prefix}-${timestamp}`;
    setFormData(prev => ({ ...prev, tenant_code: code }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      if (!token) {
        setError('Please login again. Session expired.');
        router.push('/login');
        return;
      }

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
      const response = await fetch(`${backendUrl}/api/tenants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          metadata: {
            contact_email: formData.email,
            phone: formData.phone,
            address: formData.address,
            description: formData.description
          }
        }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push('/tenants');
      } else {
        setError(data.message || 'Failed to create tenant');
      }
    } catch (err) {
      setError('An error occurred while creating the tenant');
      console.error('Create tenant error:', err);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/tenants')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Create New Tenant</h1>
            <p className="text-gray-600 mt-1">Set up a new tenant account</p>
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Enter the tenant's basic details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Tenant Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter tenant name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tenant_code">Tenant Code</Label>
                <div className="flex gap-2">
                  <Input
                    id="tenant_code"
                    name="tenant_code"
                    value={formData.tenant_code}
                    onChange={handleInputChange}
                    placeholder="Auto-generated or enter manually"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={generateTenantCode}
                  >
                    Generate
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="tenant@example.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Enter full address"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Additional notes about this tenant"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Tenant Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Tenant Configuration</CardTitle>
            <CardDescription>Configure tenant type and billing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Tenant Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => handleSelectChange('type', value)}
                >
                  <SelectTrigger>
                    <div className="flex items-center gap-2">
                      {getTypeIcon(formData.type)}
                      <SelectValue />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Individual</SelectItem>
                    <SelectItem value="household_member">Household Member</SelectItem>
                    <SelectItem value="small_business">Small Business</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                    <SelectItem value="holding_company">Holding Company</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="billing_tier">Billing Tier *</Label>
                <Select
                  value={formData.billing_tier}
                  onValueChange={(value) => handleSelectChange('billing_tier', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free ($0/month)</SelectItem>
                    <SelectItem value="small_business">Small Business ($299/month)</SelectItem>
                    <SelectItem value="enterprise">Enterprise ($999/month)</SelectItem>
                    <SelectItem value="custom">Custom ($2999/month)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gross_margin_percent">Gross Margin Percentage</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="gross_margin_percent"
                  name="gross_margin_percent"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.gross_margin_percent}
                  onChange={handleInputChange}
                  className="w-32"
                />
                <span className="text-gray-600">%</span>
              </div>
              <p className="text-sm text-gray-500">
                The profit margin percentage for this tenant's transactions
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/tenants')}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading || !formData.name || !formData.email}
          >
            {loading ? 'Creating...' : 'Create Tenant'}
          </Button>
        </div>
      </form>
    </div>
  );
}