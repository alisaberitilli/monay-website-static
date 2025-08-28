import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface LoginResponse {
  success: boolean;
  data?: {
    user: any;
    accessToken: string;
    refreshToken: string;
  };
  error?: string;
}

interface RegisterResponse {
  success: boolean;
  data?: {
    user: any;
    accessToken: string;
    refreshToken: string;
  };
  error?: string;
}

class AuthService {
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      // Use admin login endpoint for admin users
      const endpoint = email === 'admin@monay.com' 
        ? `${API_URL}/api/admin/login`
        : `${API_URL}/api/login`;
        
      const response = await axios.post(endpoint, {
        email,
        password,
        deviceType: 'web'
      });
      
      if (response.data.success) {
        const data = response.data.data;
        const accessToken = data.token || data.accessToken;
        const refreshToken = data.refreshToken;
        const user = {
          id: data.id,
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          role: data.role,
          profileImage: data.profileImage,
          walletBalance: data.walletBalance
        };
        
        if (accessToken) {
          Cookies.set('token', accessToken, { expires: 7 });
        }
        if (refreshToken) {
          Cookies.set('refreshToken', refreshToken, { expires: 30 });
        }
        
        return {
          success: true,
          data: {
            user,
            accessToken,
            refreshToken
          }
        };
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.response?.data?.error || 'Login failed',
      };
    }
  }

  async register(data: any): Promise<RegisterResponse> {
    try {
      const response = await axios.post(`${API_URL}/api/auth/signup`, data);
      
      if (response.data.success) {
        Cookies.set('token', response.data.data.accessToken, { expires: 7 });
        Cookies.set('refreshToken', response.data.data.refreshToken, { expires: 30 });
      }
      
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Registration failed',
      };
    }
  }

  async logout(): Promise<void> {
    try {
      const token = Cookies.get('token');
      if (token) {
        await axios.post(
          `${API_URL}/api/auth/logout`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }
    } finally {
      Cookies.remove('token');
      Cookies.remove('refreshToken');
      window.location.href = '/login';
    }
  }

  async forgotPassword(email: string): Promise<any> {
    try {
      const response = await axios.post(`${API_URL}/api/auth/forgot-password`, {
        email,
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to send reset email',
      };
    }
  }

  async resetPassword(token: string, password: string): Promise<any> {
    try {
      const response = await axios.post(`${API_URL}/api/auth/reset-password`, {
        token,
        password,
        confirmPassword: password,
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to reset password',
      };
    }
  }

  getToken(): string | undefined {
    return Cookies.get('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export const authService = new AuthService();