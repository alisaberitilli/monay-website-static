import axiosInstance from '@/lib/axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Storage keys
const STORAGE_KEYS = {
  TOKEN: 'monay_admin_token',
  REFRESH_TOKEN: 'monay_admin_refresh_token',
  USER: 'monay_admin_user'
} as const;

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
        ? '/api/admin/login'
        : '/api/login';

      const response = await axiosInstance.post(endpoint, {
        email,
        password,
        deviceType: 'WEB'
      });
      
      if (response.data.success) {
        const data = response.data.data;
        const accessToken = data.token || data.accessToken;
        const refreshToken = data.refreshToken || data.token; // Use token as fallback for refresh
        const user = {
          id: data.id,
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          role: data.role || data.userType, // Support both role and userType
          profileImage: data.profileImage || data.profilePicture,
          walletBalance: data.walletBalance
        };

        if (accessToken) {
          localStorage.setItem(STORAGE_KEYS.TOKEN, accessToken);
        }
        if (refreshToken) {
          localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
        }
        // Store user data for quick access
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));

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

      // Extract error message from various possible error formats
      let errorMessage = 'Login failed';

      if (error.response?.data) {
        const data = error.response.data;

        // Handle various error formats from backend
        if (typeof data.error === 'string') {
          errorMessage = data.error;
        } else if (typeof data.message === 'string') {
          errorMessage = data.message;
        } else if (Array.isArray(data.errors)) {
          // Handle validation errors array
          errorMessage = data.errors.map((e: any) =>
            typeof e === 'string' ? e : e.message || e.msg || JSON.stringify(e)
          ).join(', ');
        } else if (data.errors && typeof data.errors === 'object') {
          // Handle validation errors object
          errorMessage = Object.values(data.errors).flat().join(', ');
        } else if (typeof data === 'string') {
          errorMessage = data;
        }
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  async register(data: any): Promise<RegisterResponse> {
    try {
      const response = await axiosInstance.post('/api/auth/signup', data);

      if (response.data.success) {
        localStorage.setItem(STORAGE_KEYS.TOKEN, response.data.data.accessToken);
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.data.data.refreshToken);
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
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      if (token) {
        // Token is automatically added by axios interceptor
        await axiosInstance.post('/api/auth/logout', {});
      }
    } finally {
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
      window.location.href = '/login';
    }
  }

  async forgotPassword(email: string): Promise<any> {
    try {
      const response = await axiosInstance.post('/api/auth/forgot-password', {
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
      const response = await axiosInstance.post('/api/auth/reset-password', {
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

  async signup(data: any): Promise<any> {
    try {
      const response = await axiosInstance.post('/api/auth/signup', {
        ...data,
        deviceType: 'WEB'
      });
      return response.data;
    } catch (error: any) {
      throw error;
    }
  }

  async verifyEmail(email: string, code: string): Promise<any> {
    try {
      const response = await axiosInstance.post('/api/auth/verify-email', {
        email,
        code
      });
      return response.data;
    } catch (error: any) {
      throw error;
    }
  }

  async verifyPhone(phone: string, code: string): Promise<any> {
    try {
      const response = await axiosInstance.post('/api/auth/verify-phone', {
        phone,
        code
      });
      return response.data;
    } catch (error: any) {
      throw error;
    }
  }

  async resendEmailVerification(email: string): Promise<any> {
    try {
      const response = await axiosInstance.post('/api/auth/resend-email-verification', {
        email
      });
      return response.data;
    } catch (error: any) {
      throw error;
    }
  }

  async resendPhoneVerification(phone: string): Promise<any> {
    try {
      const response = await axiosInstance.post('/api/auth/resend-phone-verification', {
        phone
      });
      return response.data;
    } catch (error: any) {
      throw error;
    }
  }

  async setupMPIN(mpin: string): Promise<any> {
    try {
      // Token is automatically added by axios interceptor
      const response = await axiosInstance.post(
        '/api/auth/setup-mpin',
        { mpin }
      );
      return response.data;
    } catch (error: any) {
      throw error;
    }
  }

  async submitKYC(formData: FormData): Promise<any> {
    try {
      // Token is automatically added by axios interceptor
      const response = await axiosInstance.post(
        '/api/auth/submit-kyc',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
        }
      );
      return response.data;
    } catch (error: any) {
      throw error;
    }
  }

  getToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  }

  getUser(): any {
    const userStr = localStorage.getItem(STORAGE_KEYS.USER);
    return userStr ? JSON.parse(userStr) : null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export const authService = new AuthService();