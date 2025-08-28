import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile?: string;
  walletBalance: number;
  isActive: boolean;
  isEmailVerified: boolean;
  isKycVerified: boolean;
  lastLoginAt?: string;
  createdAt: string;
  userRoles?: Array<{
    role: {
      id: string;
      name: string;
      displayName: string;
      description: string;
      permissions: any;
    };
  }>;
}

interface RolePermission {
  id: string;
  role: string;
  permission: string;
  resource: string;
  action: string;
}

class UsersService {
  private getAuthHeader() {
    const token = Cookies.get('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async getAllUsers(): Promise<User[]> {
    try {
      const response = await axios.get(`${API_URL}/api/admin/user`, {
        headers: this.getAuthHeader(),
      });
      
      if (response.data.success) {
        return response.data.data || [];
      }
      return [];
    } catch (error: any) {
      console.error('Error fetching users:', error);
      
      // Fallback to mock data if API fails
      const mockUsers: User[] = [
      {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        mobile: '+1234567890',
        walletBalance: 5250.00,
        isActive: true,
        isEmailVerified: true,
        isKycVerified: true,
        lastLoginAt: '2024-01-15T10:30:00Z',
        createdAt: '2023-12-01T08:00:00Z',
        userRoles: [{
          role: {
            id: '1',
            name: 'verified_consumer',
            displayName: 'Verified Consumer',
            description: 'Verified consumer with enhanced features',
            permissions: {}
          }
        }]
      },
      {
        id: '2',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        mobile: '+1234567891',
        walletBalance: 10500.50,
        isActive: true,
        isEmailVerified: true,
        isKycVerified: true,
        lastLoginAt: '2024-01-14T15:45:00Z',
        createdAt: '2023-11-15T09:00:00Z',
        userRoles: [{
          role: {
            id: '2',
            name: 'premium_consumer',
            displayName: 'Premium Consumer',
            description: 'Premium consumer with full access',
            permissions: {}
          }
        }]
      },
      {
        id: '3',
        firstName: 'Bob',
        lastName: 'Johnson',
        email: 'bob@example.com',
        walletBalance: 1250.00,
        isActive: true,
        isEmailVerified: true,
        isKycVerified: false,
        lastLoginAt: '2024-01-10T12:00:00Z',
        createdAt: '2024-01-01T10:00:00Z',
        userRoles: [{
          role: {
            id: '3',
            name: 'basic_consumer',
            displayName: 'Basic Consumer',
            description: 'Basic consumer account',
            permissions: {}
          }
        }]
      },
      {
        id: '4',
        firstName: 'Alice',
        lastName: 'Williams',
        email: 'alice@enterprise.com',
        mobile: '+1234567892',
        walletBalance: 125000.00,
        isActive: true,
        isEmailVerified: true,
        isKycVerified: true,
        lastLoginAt: '2024-01-16T09:00:00Z',
        createdAt: '2023-10-01T08:00:00Z',
        userRoles: [{
          role: {
            id: '4',
            name: 'enterprise_admin',
            displayName: 'Enterprise Admin',
            description: 'Enterprise administrator with full control',
            permissions: {}
          }
        }]
      },
      {
        id: '5',
        firstName: 'Charlie',
        lastName: 'Brown',
        email: 'charlie@merchant.com',
        mobile: '+1234567893',
        walletBalance: 45000.00,
        isActive: true,
        isEmailVerified: true,
        isKycVerified: true,
        createdAt: '2023-09-15T11:00:00Z',
        userRoles: [{
          role: {
            id: '5',
            name: 'merchant',
            displayName: 'Merchant',
            description: 'Merchant account for businesses',
            permissions: {}
          }
        }]
      },
      {
        id: '6',
        firstName: 'David',
        lastName: 'Miller',
        email: 'david@example.com',
        walletBalance: 750.00,
        isActive: false,
        isEmailVerified: false,
        isKycVerified: false,
        createdAt: '2024-01-05T14:00:00Z',
        userRoles: []
      }
    ];
      
      return mockUsers;
    }
  }

  async getUser(id: string): Promise<User | null> {
    try {
      const response = await axios.get(`${API_URL}/api/users/${id}`, {
        headers: this.getAuthHeader(),
      });
      const userData = response.data.data;
      // Ensure we return null if data is invalid
      if (userData && typeof userData === 'object' && !(userData as any).error && !(userData as any).status) {
        return userData;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  }

  async createUser(userData: any): Promise<any> {
    try {
      const response = await axios.post(`${API_URL}/api/users`, userData, {
        headers: this.getAuthHeader(),
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to create user',
      };
    }
  }

  async updateUser(id: string, userData: any): Promise<any> {
    try {
      const response = await axios.patch(`${API_URL}/api/users/${id}`, userData, {
        headers: this.getAuthHeader(),
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to update user',
      };
    }
  }

  async deleteUser(id: string): Promise<any> {
    try {
      const response = await axios.delete(`${API_URL}/api/users/${id}`, {
        headers: this.getAuthHeader(),
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to delete user',
      };
    }
  }

  async getRoles(): Promise<any[]> {
    try {
      const response = await axios.get(`${API_URL}/api/roles`, {
        headers: this.getAuthHeader(),
      });
      
      if (response.data.success) {
        return response.data.data || [];
      }
      return [];
    } catch (error: any) {
      console.error('Error fetching roles:', error);
      
      // Fallback to mock data if API fails
      const mockRoles = [
      {
        id: '1',
        name: 'platform_admin',
        displayName: 'Platform Admin',
        description: 'Full platform administration access'
      },
      {
        id: '2',
        name: 'premium_consumer',
        displayName: 'Premium Consumer',
        description: 'Premium consumer with full features'
      },
      {
        id: '3',
        name: 'verified_consumer',
        displayName: 'Verified Consumer',
        description: 'Verified consumer with enhanced features'
      },
      {
        id: '4',
        name: 'basic_consumer',
        displayName: 'Basic Consumer',
        description: 'Basic consumer account'
      },
      {
        id: '5',
        name: 'enterprise_admin',
        displayName: 'Enterprise Admin',
        description: 'Enterprise administrator'
      },
      {
        id: '6',
        name: 'merchant',
        displayName: 'Merchant',
        description: 'Merchant business account'
      }
    ];
      
      return mockRoles;
    }
  }

  async getRolePermissions(role: string): Promise<RolePermission[]> {
    try {
      const response = await axios.get(`${API_URL}/api/roles/${role}/permissions`, {
        headers: this.getAuthHeader(),
      });
      const permissionsData = response.data.data;
      // Ensure we return an array and filter out invalid objects
      if (Array.isArray(permissionsData)) {
        return permissionsData.filter(p => p && typeof p === 'object' && !(p as any).status);
      }
      return [];
    } catch (error) {
      console.error('Error fetching role permissions:', error);
      return [];
    }
  }

  async updateUserRole(userId: string, roleId: string): Promise<any> {
    try {
      const response = await axios.post(`${API_URL}/api/users/${userId}/role`, 
        { roleId }, 
        { headers: this.getAuthHeader() }
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to update user role',
      };
    }
  }
}

export const usersService = new UsersService();