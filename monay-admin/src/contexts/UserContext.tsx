'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { authService } from '@/services/auth.service';
import { usersService } from '@/services/users.service';
import { STORAGE_KEYS } from '@/lib/axios';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isActive: boolean;
  isEmailVerified: boolean;
  isKycVerified: boolean;
  permissions?: UserPermission[];
}

interface UserPermission {
  id: string;
  role: string;
  permission: string;
  resource: string;
  action: string;
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  hasPermission: (permission: string, resource?: string, action?: string) => boolean;
  isAdmin: () => boolean;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  // Check if we're on an authentication page
  const isAuthPage = pathname?.startsWith('/login') ||
                     pathname?.startsWith('/signup') ||
                     pathname?.startsWith('/verify') ||
                     pathname?.startsWith('/kyc') ||
                     pathname?.startsWith('/mpin-setup') ||
                     pathname?.includes('auth');

  const fetchCurrentUser = async () => {
    // Skip user fetching on authentication pages
    if (isAuthPage) {
      console.log('UserContext: Skipping user fetch on auth page:', pathname);
      setUser(null);
      setLoading(false);
      return;
    }

    const token = authService.getToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      // Decode JWT to get user info
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('JWT Payload:', payload);

      const userId = payload.userId || payload.id || payload.user_id || payload.sub;

      if (!userId) {
        console.error('No user ID found in token payload:', payload);
        throw new Error('No user ID in token');
      }

      console.log('Fetching user data for userId:', userId);

      // Try to fetch full user data from API
      let userData = null;
      try {
        userData = await usersService.getUser(userId);
        console.log('User data received from API:', userData);
      } catch (apiError) {
        console.warn('API failed to fetch user data, will use JWT fallback:', apiError);
      }

      // If API fails or returns invalid data, create user object from JWT payload
      if (!userData || typeof userData !== 'object' || (userData as any).error || (userData as any).status) {
        console.log('Creating user data from JWT payload as API fallback');
        userData = {
          id: userId,
          email: payload.email || 'admin@monay.com',
          firstName: payload.firstName || 'Admin',
          lastName: payload.lastName || 'User',
          walletBalance: 0,
          isActive: true,
          isEmailVerified: true,
          isKycVerified: true,
          createdAt: new Date().toISOString(),
        };
      }

      // Determine the role field - could be 'role', 'userType', or nested in 'dataValues'
      let userRole = (userData as any).role || (userData as any).userType || (userData as any).dataValues?.role || payload.role;

      // Special handling for development environment with admin bypass
      if (!userRole && process.env.NODE_ENV === 'development' && (userData as any).email === 'admin@monay.com') {
        userRole = 'platform_admin';
        console.log('Development mode: Using platform_admin role for admin@monay.com');
      } else if (!userRole) {
        userRole = 'basic_consumer';
        console.log('No role found, defaulting to basic_consumer');
      }

      console.log('User role determined:', userRole);

      // Fetch user permissions
      let permissions = [];
      try {
        permissions = await usersService.getRolePermissions(userRole);
        console.log('UserContext - permissions data:', permissions);
      } catch (permError) {
        console.warn('Failed to fetch permissions, using empty array:', permError);
      }

      // Ensure permissions is always an array
      const validPermissions = Array.isArray(permissions) ? permissions : [];

      setUser({
        ...(userData as any),
        role: userRole,
        permissions: validPermissions,
      } as User);
    } catch (error) {
      console.error('Error fetching current user:', error);
      // On auth pages, fail silently without error messages
      if (isAuthPage) {
        console.log('UserContext: Silently failing on auth page - this is expected');
        setUser(null);
      } else {
        // Log API errors but don't retry automatically to avoid loops
        console.log('UserContext: API error on non-auth page - backend may be unstable');
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const hasPermission = (permission: string, resource?: string, action?: string): boolean => {
    if (!user?.permissions || !Array.isArray(user.permissions)) return false;

    return user.permissions.some(p => {
      if (!p || typeof p !== 'object') return false;
      const permissionMatch = p.permission === permission;
      const resourceMatch = !resource || p.resource === resource || p.resource === '*';
      const actionMatch = !action || p.action === action || p.action === '*';
      
      return permissionMatch && resourceMatch && actionMatch;
    });
  };

  const isAdmin = (): boolean => {
    return user?.role === 'platform_admin';
  };

  const refreshUser = async () => {
    await fetchCurrentUser();
  };

  useEffect(() => {
    fetchCurrentUser();
  }, [pathname]); // Re-run when pathname changes

  const contextValue: UserContextType = {
    user,
    loading,
    hasPermission,
    isAdmin,
    refreshUser,
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser(): UserContextType {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}