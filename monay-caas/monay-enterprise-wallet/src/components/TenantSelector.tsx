'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown, Building, Users, Home, Briefcase, Shield, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from './ToastNotification';
import {
  useTenantStore,
  useCurrentTenant,
  useAvailableTenants,
  useTenantLoading,
  useTenantError,
  useTenantSwitching
} from '@/stores';

export default function TenantSelector() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { success, error: showError } = useToast();

  // Use Zustand store
  const currentTenant = useCurrentTenant();
  const availableTenants = useAvailableTenants();
  const loading = useTenantLoading();
  const error = useTenantError();
  const switching = useTenantSwitching();

  const { loadCurrentTenant, loadAvailableTenants, switchTenant: storeSwitchTenant } = useTenantStore();

  useEffect(() => {
    // Initial load of tenant data
    loadCurrentTenant();
    loadAvailableTenants();
  }, [loadCurrentTenant, loadAvailableTenants]);

  const handleSwitchTenant = async (tenantId: string) => {
    setIsDropdownOpen(false);

    const tenantName = availableTenants.find(t => t.id === tenantId)?.name;
    const result = await storeSwitchTenant(tenantId);

    if (result) {
      success('Tenant Switched', `Successfully switched to ${tenantName}`);
    } else if (error) {
      showError('Switch Failed', error);
    }
  };

  const getTenantIcon = (type: string) => {
    switch (type) {
      case 'individual':
        return <Users className="w-4 h-4" />;
      case 'household_member':
        return <Home className="w-4 h-4" />;
      case 'small_business':
        return <Briefcase className="w-4 h-4" />;
      case 'enterprise':
        return <Building className="w-4 h-4" />;
      case 'holding_company':
        return <Shield className="w-4 h-4" />;
      default:
        return <Building className="w-4 h-4" />;
    }
  };

  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
      case 'free':
        return 'bg-gray-100 text-gray-700';
      case 'small_business':
        return 'bg-blue-100 text-blue-700';
      case 'enterprise':
        return 'bg-purple-100 text-purple-700';
      case 'custom':
        return 'bg-indigo-100 text-indigo-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-lg">
        <div className="w-8 h-8 bg-gray-300 rounded"></div>
        <div className="flex-1">
          <div className="w-32 h-4 bg-gray-300 rounded"></div>
        </div>
      </div>
    );
  }

  if (error && !currentTenant) {
    return (
      <div className="flex items-center space-x-2 px-4 py-2 bg-red-50 border border-red-200 rounded-lg">
        <AlertCircle className="w-5 h-5 text-red-600" />
        <div className="text-sm text-red-700">{error}</div>
      </div>
    );
  }

  if (!currentTenant) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        disabled={switching}
        className="flex items-center space-x-3 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {switching ? (
          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
        ) : (
          getTenantIcon(currentTenant.tenant.type)
        )}
        <div className="text-left">
          <div className="font-medium text-gray-900">
            {switching ? 'Switching...' : currentTenant.tenant.name}
          </div>
          <div className="text-xs text-gray-500">{currentTenant.tenant.tenant_code}</div>
        </div>
        <span className={`px-2 py-1 text-xs rounded-full ${getTierBadgeColor(currentTenant.tenant.billing_tier)}`}>
          {currentTenant.tenant.billing_tier.replace('_', ' ')}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
      </button>

      {isDropdownOpen && (
        <div className="absolute top-full mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-1">Switch Tenant</h3>
            <p className="text-xs text-gray-500">Select a tenant context to work with</p>
          </div>

          <div className="max-h-60 overflow-y-auto">
            {availableTenants.map((tenant) => (
              <button
                key={tenant.id}
                onClick={() => handleSwitchTenant(tenant.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors ${
                  tenant.id === currentTenant.tenant.id ? 'bg-blue-50' : ''
                }`}
              >
                {getTenantIcon(tenant.type)}
                <div className="flex-1 text-left">
                  <div className="font-medium text-gray-900">{tenant.name}</div>
                  <div className="text-xs text-gray-500">{tenant.tenant_code}</div>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${getTierBadgeColor(tenant.billing_tier)}`}>
                  {tenant.billing_tier.replace('_', ' ')}
                </span>
              </button>
            ))}
          </div>

          <div className="p-4 border-t border-gray-200">
            <button
              onClick={() => {
                window.location.href = '/tenants/create';
              }}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Create New Tenant
            </button>
          </div>
        </div>
      )}
    </div>
  );
}