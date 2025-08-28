'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '@/services/auth.service';
import { usersService } from '@/services/users.service';
import Cookies from 'js-cookie';

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

  const fetchCurrentUser = async () => {
    const token = authService.getToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      // Decode JWT to get user info
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userId = payload.userId;

      if (!userId) {
        throw new Error('No user ID in token');
      }

      // Fetch full user data
      const userData = await usersService.getUser(userId);
      if (userData && typeof userData === 'object' && !(userData as any).error && !(userData as any).status) {
        // Fetch user permissions
        const permissions = await usersService.getRolePermissions((userData as User).role);
        console.log('UserContext - permissions data:', permissions);
        
        // Ensure permissions is always an array
        const validPermissions = Array.isArray(permissions) ? permissions : [];
        
        setUser({
          ...userData,
          permissions: validPermissions,
        });
      } else {
        console.log('Invalid user data received:', userData);
        throw new Error('Invalid user data');
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
      // Clear invalid token and user data
      setUser(null);
      Cookies.remove('token');
      Cookies.remove('refreshToken');
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
  }, []);

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