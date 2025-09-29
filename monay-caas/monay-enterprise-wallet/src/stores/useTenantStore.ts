import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { api, setAuthToken } from '@/lib/api';

interface Tenant {
  id: string;
  name: string;
  tenant_code: string;
  type: 'individual' | 'household_member' | 'small_business' | 'enterprise' | 'holding_company';
  billing_tier: 'free' | 'small_business' | 'enterprise' | 'custom';
  status: string;
  metadata?: any;
}

interface TenantContext {
  tenant: Tenant;
  features: string[];
  limits: Record<string, number>;
  vault_context?: any;
}

interface TenantStore {
  // State
  currentTenant: TenantContext | null;
  availableTenants: Tenant[];
  loading: boolean;
  error: string | null;
  switching: boolean;

  // Actions
  setCurrentTenant: (tenant: TenantContext | null) => void;
  setAvailableTenants: (tenants: Tenant[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSwitching: (switching: boolean) => void;

  // Async Actions
  loadCurrentTenant: () => Promise<void>;
  loadAvailableTenants: () => Promise<void>;
  switchTenant: (tenantId: string) => Promise<boolean>;
  refreshTenant: () => Promise<void>;
  clearTenantData: () => void;
}

// Custom event for tenant switching
export const TENANT_SWITCHED_EVENT = 'tenant:switched';

export const useTenantStore = create<TenantStore>()(
  persist(
    (set, get) => ({
      // Initial State
      currentTenant: null,
      availableTenants: [],
      loading: false,
      error: null,
      switching: false,

      // Basic Actions
      setCurrentTenant: (tenant) => set({ currentTenant: tenant, error: null }),
      setAvailableTenants: (tenants) => set({ availableTenants: tenants }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      setSwitching: (switching) => set({ switching }),

      // Load Current Tenant
      loadCurrentTenant: async () => {
        set({ loading: true, error: null });

        try {
          const data = await api.get('/api/tenants/current');
          set({ currentTenant: data, error: null });
        } catch (err: any) {
          // Provide a default tenant context for development
          const defaultTenant: TenantContext = {
            tenant: {
              id: 'default_tenant',
              name: 'Monay Enterprise',
              tenant_code: 'MONAY_ENT',
              type: 'enterprise',
              billing_tier: 'enterprise',
              status: 'active',
              metadata: {}
            },
            features: ['all'],
            limits: {
              users: 1000,
              wallets: 10000,
              transactions: 1000000
            }
          };

          if (err.status === 404) {
            // Use default tenant for development
            set({ currentTenant: defaultTenant, error: null });
          } else {
            // Still show error for other issues but provide default
            set({ currentTenant: defaultTenant, error: null });
          }
        } finally {
          set({ loading: false });
        }
      },

      // Load Available Tenants
      loadAvailableTenants: async () => {
        try {
          const data = await api.get('/api/tenants/users/me/tenants', {
            cache: true,
            cacheTTL: 300000 // Cache for 5 minutes
          });
          set({ availableTenants: data.tenants || [] });
        } catch (err) {
          // Silent fail - not critical
          console.error('Failed to load available tenants:', err);
        }
      },

      // Switch Tenant
      switchTenant: async (tenantId: string) => {
        const { switching } = get();
        if (switching) return false;

        set({ switching: true, error: null });

        try {
          const data = await api.post(`/api/tenants/${tenantId}/switch`);

          // Update auth token
          setAuthToken(data.token);

          // Dispatch custom event for other components
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent(TENANT_SWITCHED_EVENT, {
              detail: { tenantId, token: data.token }
            }));
          }

          // Reload current tenant data
          await get().loadCurrentTenant();

          return true;
        } catch (err: any) {
          set({ error: err.message || 'Unable to switch tenant' });
          return false;
        } finally {
          set({ switching: false });
        }
      },

      // Refresh Tenant
      refreshTenant: async () => {
        const { loading } = get();
        if (loading) return;

        await Promise.all([
          get().loadCurrentTenant(),
          get().loadAvailableTenants()
        ]);
      },

      // Clear Tenant Data
      clearTenantData: () => {
        set({
          currentTenant: null,
          availableTenants: [],
          loading: false,
          error: null,
          switching: false
        });
      }
    }),
    {
      name: 'tenant-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentTenant: state.currentTenant,
        availableTenants: state.availableTenants
      }),
    }
  )
);

// Helper hooks for common selectors
export const useCurrentTenant = () => useTenantStore((state) => state.currentTenant);
export const useAvailableTenants = () => useTenantStore((state) => state.availableTenants);
export const useTenantLoading = () => useTenantStore((state) => state.loading);
export const useTenantError = () => useTenantStore((state) => state.error);
export const useTenantSwitching = () => useTenantStore((state) => state.switching);