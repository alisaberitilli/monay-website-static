'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiService } from '@/lib/api-service';
import { API_ENDPOINTS } from '@/lib/api-config';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  mobileNumber?: string;
  profileImage?: string;
  kycStatus?: 'pending' | 'verified' | 'failed' | 'approved';
  isEmailVerified?: boolean;
  isMobileVerified?: boolean;
  userType?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: RegisterData, endpoint?: string) => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  mobileNumber: string;
  // Business specific fields
  businessName?: string;
  businessType?: string;
  // Enterprise specific fields
  organizationId?: string;
  inviteCode?: string;
  // User type
  userType?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Check if we're in the browser environment
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('auth_token');
        
        if (token) {
          // Check if this is the mock token
          if (token === 'mock-jwt-token-for-testing') {
            // For mock token, restore user from localStorage
            const userData = localStorage.getItem('user_data');
            if (userData) {
              try {
                const user = JSON.parse(userData);
                setUser(user);
                apiService.setAuthToken(token);
              } catch (e) {
                console.error('Error parsing mock user data:', e);
                localStorage.removeItem('auth_token');
                localStorage.removeItem('user_data');
              }
            }
          } else {
            // For real tokens, verify with backend
            apiService.setAuthToken(token);
            
            // Verify token with backend
            const response = await apiService.get(API_ENDPOINTS.AUTH.ME);
            
            if (response.success && response.data) {
              // Convert backend user data to our User interface
              const userData = response.data;
              const user: User = {
                id: userData.id,
                email: userData.email,
                firstName: userData.firstName || userData.first_name || '',
                lastName: userData.lastName || userData.last_name || '',
                mobileNumber: userData.mobile || userData.mobileNumber || userData.mobile_number || userData.phoneNumber || userData.phone_number || '',
                userType: userData.userType || userData.user_type || 'user',
                isEmailVerified: userData.isEmailVerified || userData.is_email_verified || false,
                isMobileVerified: userData.isMobileVerified || userData.is_mobile_verified || false,
                kycStatus: userData.isKycVerified ? 'verified' : (userData.kycStatus || userData.kyc_status || 'pending'),
                createdAt: userData.createdAt || userData.created_at || new Date().toISOString(),
                updatedAt: userData.updatedAt || userData.updated_at || new Date().toISOString(),
              };
              setUser(user);
            } else {
              // Invalid token, clear it
              localStorage.removeItem('auth_token');
              localStorage.removeItem('user_data');
              apiService.setAuthToken(null);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      // Clear invalid auth data
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        apiService.setAuthToken(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (emailOrPhone: string, password: string) => {
    setIsLoading(true);
    try {
      // Check if mock mode was explicitly requested via the Test Account button
      const useMockLogin = typeof window !== 'undefined' && sessionStorage.getItem('use_mock_login') === 'true';
      
      // ALWAYS check for mock test credentials first (regardless of NEXT_PUBLIC_MOCK_MODE)
      const testPhone = '+15551234567';
      const testPasswords = ['demo123'];  // Only accept the documented test password
      
      // Clean up phone number for comparison
      const cleanedInput = emailOrPhone.replace(/[\s\-\(\)]/g, '');
      const phoneWithCountry = cleanedInput.startsWith('+') ? cleanedInput : `+1${cleanedInput}`;
      
      // Check if this is the mock test login (555-123-4567) - ALWAYS WORKS
      if (phoneWithCountry === testPhone && testPasswords.includes(password)) {
        console.log('Mock test account login detected');
        // Clear the session flag after use
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('use_mock_login');
        }
        // Create mock user for testing
        const mockUser: User = {
          id: 'test-user-123',
          email: 'demo@monay.com',
          firstName: 'Demo',
          lastName: 'User',
          mobileNumber: '+15551234567',
          userType: 'user',
          isEmailVerified: true,
          isMobileVerified: true,
          kycStatus: 'verified',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        const mockToken = 'mock-jwt-token-for-testing';
        
        // Store auth data
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_token', mockToken);
          localStorage.setItem('user_data', JSON.stringify(mockUser));
        }
        
        // Set token in API service
        apiService.setAuthToken(mockToken);
        setUser(mockUser);
        return; // Exit early for mock test credentials
      }
      
      // For all other credentials, use real PostgreSQL data via backend API
      console.log('Attempting login with PostgreSQL backend for:', emailOrPhone);
      
      // Prepare login data based on input format
      let loginData;
      
      // If it looks like a phone number (contains only digits, +, or -)
      if (/^[\d\s\-\+\(\)]+$/.test(emailOrPhone)) {
        // Clean up phone number - remove spaces, dashes, parentheses
        const cleanPhone = emailOrPhone.replace(/[\s\-\(\)]/g, '');
        // Add country code if not present
        const phoneWithCountry = cleanPhone.startsWith('+') ? cleanPhone : `+1${cleanPhone}`;
        loginData = {
          phoneNumber: phoneWithCountry,
          password: password
        };
      } else {
        // Email login
        loginData = {
          email: emailOrPhone,
          password: password
        };
      }
      
      // Call backend login API
      const response = await apiService.post(API_ENDPOINTS.AUTH.LOGIN, loginData);
      
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Login failed');
      }
      
      // Backend returns data directly with token as a field
      const userData = response.data;
      const token = userData.token;
      
      if (!userData || !token) {
        throw new Error('Invalid response from server');
      }
      
      // Convert backend user data to our User interface
      const user: User = {
        id: userData.id,
        email: userData.email,
        firstName: userData.firstName || userData.first_name || '',
        lastName: userData.lastName || userData.last_name || '',
        mobileNumber: userData.mobile || userData.mobileNumber || userData.mobile_number || userData.phoneNumber || userData.phone_number || '',
        userType: userData.userType || userData.user_type || 'user',
        isEmailVerified: userData.isEmailVerified || userData.is_email_verified || false,
        isMobileVerified: userData.isMobileVerified || userData.is_mobile_verified || false,
        kycStatus: userData.isKycVerified ? 'verified' : (userData.kycStatus || userData.kyc_status || 'pending'),
        createdAt: userData.createdAt || userData.created_at || new Date().toISOString(),
        updatedAt: userData.updatedAt || userData.updated_at || new Date().toISOString(),
      };
      
      // Store auth data
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user_data', JSON.stringify(user));
      }
      
      // Set token in API service
      apiService.setAuthToken(token);
      setUser(user);
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData, endpoint?: string) => {
    setIsLoading(true);
    try {
      // Clean and format phone number for backend
      let cleanPhone = userData.mobileNumber.replace(/[\s\-\(\)]/g, '');
      if (!cleanPhone.startsWith('+')) {
        cleanPhone = '+1' + cleanPhone;
      }

      // Prepare registration data for backend matching the validation schema
      const registrationData: any = {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        mobile: cleanPhone, // Full phone number with country code (e.g., +13016821633)
        password: userData.password,
        confirmPassword: userData.password, // Required by backend validation
        deviceType: 'WEB', // Must be uppercase for backend validation
      };

      // Add business-specific fields if present
      if (userData.businessName) {
        registrationData.businessName = userData.businessName;
        registrationData.businessType = userData.businessType || 'small_business';
      }

      // Add enterprise-specific fields if present
      if (userData.organizationId) {
        registrationData.organizationId = userData.organizationId;
      }
      if (userData.inviteCode) {
        registrationData.inviteCode = userData.inviteCode;
      }

      // Add userType if specified
      if (userData.userType) {
        registrationData.userType = userData.userType;
      }

      // Determine the correct endpoint based on user type or custom endpoint
      let apiEndpoint = endpoint;
      if (!apiEndpoint) {
        // Determine endpoint based on user type
        if (userData.userType === 'individual') {
          apiEndpoint = API_ENDPOINTS.AUTH.SIGNUP_CONSUMER;
        } else if (userData.businessName || userData.userType === 'business') {
          apiEndpoint = API_ENDPOINTS.AUTH.SIGNUP_BUSINESS;
        } else if (userData.organizationId || userData.inviteCode || userData.userType === 'enterprise') {
          apiEndpoint = API_ENDPOINTS.AUTH.SIGNUP_ENTERPRISE;
        } else {
          // Default to the regular signup endpoint
          apiEndpoint = API_ENDPOINTS.AUTH.SIGNUP;
        }
      }

      // Call backend signup API
      console.log('Sending registration data to', apiEndpoint, ':', registrationData);
      const response = await apiService.post(apiEndpoint, registrationData);
      console.log('Backend response:', response);
      
      if (!response.success) {
        throw new Error(response.message || response.error || 'Registration failed');
      }
      
      // Check if response.data is an empty array (registration success but no auto-login)
      if (Array.isArray(response.data) && response.data.length === 0) {
        // Registration successful but no auto-login token
        // User needs to login manually
        console.log('Registration successful. Please login with your credentials.');
        return; // Exit early - registration succeeded
      }
      
      // Backend returns data directly with token as a field
      const backendUser = response.data;
      const token = backendUser?.token;
      
      if (!backendUser || !token) {
        // Registration might have succeeded but auto-login failed
        console.log('Registration successful. Please login with your credentials.');
        return; // Exit early - registration succeeded
      }
      
      // Convert backend user data to our User interface
      const user: User = {
        id: backendUser.id,
        email: backendUser.email,
        firstName: backendUser.firstName || backendUser.first_name || userData.firstName,
        lastName: backendUser.lastName || backendUser.last_name || userData.lastName,
        mobileNumber: backendUser.mobile || backendUser.mobileNumber || backendUser.mobile_number || backendUser.phoneNumber || userData.mobileNumber,
        userType: backendUser.userType || backendUser.user_type || 'user',
        isEmailVerified: backendUser.isEmailVerified || backendUser.is_email_verified || false,
        isMobileVerified: backendUser.isMobileVerified || backendUser.is_mobile_verified || false,
        kycStatus: backendUser.isKycVerified ? 'verified' : (backendUser.kycStatus || backendUser.kyc_status || 'pending'),
        createdAt: backendUser.createdAt || backendUser.created_at || new Date().toISOString(),
        updatedAt: backendUser.updatedAt || backendUser.updated_at || new Date().toISOString(),
      };
      
      // Store auth data
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user_data', JSON.stringify(user));
      }
      
      // Set token in API service
      apiService.setAuthToken(token);
      setUser(user);
    } catch (error: any) {
      console.error('Registration error:', error);
      throw new Error(error.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Call backend logout API
      await apiService.post(API_ENDPOINTS.AUTH.LOGOUT);
      
      // Clear local storage and state regardless of API response
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
      }
      
      // Clear token from API service
      apiService.setAuthToken(null);
      setUser(null);
      
      // Redirect to login page
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local data even if API call fails
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
      }
      apiService.setAuthToken(null);
      setUser(null);
      
      // Redirect to login page even on error
      router.push('/auth/login');
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}