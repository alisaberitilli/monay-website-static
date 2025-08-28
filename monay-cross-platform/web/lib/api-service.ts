import { API_CONFIG, buildApiUrl, ApiRequestConfig, ApiResponse, HttpMethod } from './api-config';

class ApiService {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

  constructor() {
    this.baseUrl = API_CONFIG.BASE_URL + API_CONFIG.API_PREFIX;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  // Set authorization token
  setAuthToken(token: string | null) {
    if (token) {
      this.defaultHeaders['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.defaultHeaders['Authorization'];
    }
  }

  // Get auth token from localStorage
  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    // Check both possible keys for backwards compatibility
    return localStorage.getItem('auth_token') || localStorage.getItem('authToken');
  }

  // Generic request method
  async request<T = any>(config: ApiRequestConfig): Promise<ApiResponse<T>> {
    const {
      method,
      endpoint,
      data,
      params,
      headers = {},
      timeout = API_CONFIG.TIMEOUT,
    } = config;

    // Build URL with params
    let url = `${this.baseUrl}${endpoint}`;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        searchParams.append(key, String(value));
      });
      url += `?${searchParams.toString()}`;
    }

    // Prepare headers
    const requestHeaders = {
      ...this.defaultHeaders,
      ...headers,
    };

    // Add auth token if available
    const authToken = this.getAuthToken();
    if (authToken) {
      requestHeaders['Authorization'] = `Bearer ${authToken}`;
    }

    // Add device headers for backend compatibility
    if (typeof window !== 'undefined') {
      requestHeaders['device-id'] = requestHeaders['device-id'] || `web-${Date.now()}`;
      requestHeaders['device-model'] = requestHeaders['device-model'] || 'Web Browser';
      requestHeaders['os-version'] = requestHeaders['os-version'] || 'Web';
      requestHeaders['timezone'] = requestHeaders['timezone'] || Intl.DateTimeFormat().resolvedOptions().timeZone;
    }

    // Prepare request options
    const requestOptions: RequestInit = {
      method,
      headers: requestHeaders,
    };

    // Add body for POST, PUT, PATCH requests
    if (data && [HttpMethod.POST, HttpMethod.PUT, HttpMethod.PATCH].includes(method)) {
      requestOptions.body = JSON.stringify(data);
    }

    try {
      console.log(`API Request: ${method} ${url}`, { data, params });
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      requestOptions.signal = controller.signal;

      const response = await fetch(url, requestOptions);
      clearTimeout(timeoutId);

      let responseData;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }

      console.log(`API Response: ${response.status}`, responseData);

      if (!response.ok) {
        return {
          success: false,
          data: null,
          error: responseData,
          message: responseData.message || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      // Handle different response formats from monay-backend
      if (typeof responseData === 'object' && responseData !== null) {
        return {
          success: responseData.success !== false, // Default to true unless explicitly false
          data: responseData.data || responseData,
          message: responseData.message,
          error: responseData.error,
        };
      }

      return {
        success: true,
        data: responseData,
        message: 'Request successful',
      };

    } catch (error: any) {
      console.error('API Request Error:', error);
      
      return {
        success: false,
        data: null,
        error: error.message || 'Network error',
        message: error.name === 'AbortError' ? 'Request timeout' : 'Network error occurred',
      };
    }
  }

  // Convenience methods
  async get<T = any>(endpoint: string, params?: Record<string, string | number>): Promise<ApiResponse<T>> {
    return this.request<T>({ method: HttpMethod.GET, endpoint, params });
  }

  async post<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>({ method: HttpMethod.POST, endpoint, data });
  }

  async put<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>({ method: HttpMethod.PUT, endpoint, data });
  }

  async patch<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>({ method: HttpMethod.PATCH, endpoint, data });
  }

  async delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>({ method: HttpMethod.DELETE, endpoint });
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;