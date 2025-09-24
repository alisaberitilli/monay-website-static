import axios, { AxiosInstance, AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { useNotificationStore } from '@/stores';

// Types
interface RetryConfig {
  retries: number;
  retryDelay: number;
  retryCondition?: (error: AxiosError) => boolean;
}

interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
}

// Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
const DEFAULT_TIMEOUT = 30000; // 30 seconds
const DEFAULT_RETRY_COUNT = 3;
const DEFAULT_RETRY_DELAY = 1000; // 1 second
const CACHE_TTL = 60000; // 1 minute default

// Cache storage
const requestCache = new Map<string, CacheEntry>();

// Custom error class
export class ApiError extends Error {
  status?: number;
  code?: string;
  details?: any;

  constructor(message: string, status?: number, code?: string, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: DEFAULT_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management
export const setAuthToken = (token: string | null) => {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  }
};

// Initialize token from localStorage
if (typeof window !== 'undefined') {
  const token = localStorage.getItem('token');
  if (token) {
    setAuthToken(token);
  }
}

// Cache helpers
const getCacheKey = (config: AxiosRequestConfig): string => {
  return `${config.method}:${config.url}:${JSON.stringify(config.params || {})}`;
};

const getCachedResponse = (key: string): any | null => {
  const cached = requestCache.get(key);
  if (cached && Date.now() - cached.timestamp < cached.ttl) {
    return cached.data;
  }
  requestCache.delete(key);
  return null;
};

const setCachedResponse = (key: string, data: any, ttl: number = CACHE_TTL) => {
  requestCache.set(key, {
    data,
    timestamp: Date.now(),
    ttl,
  });
};

// Clear cache
export const clearCache = (pattern?: string) => {
  if (pattern) {
    Array.from(requestCache.keys())
      .filter(key => key.includes(pattern))
      .forEach(key => requestCache.delete(key));
  } else {
    requestCache.clear();
  }
};

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add timestamp to prevent caching issues
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now(),
      };
    }

    // Check cache for GET requests
    if (config.method === 'get' && (config as any).cache !== false) {
      const cacheKey = getCacheKey(config);
      const cachedData = getCachedResponse(cacheKey);
      if (cachedData) {
        // Return cached response by rejecting with special flag
        return Promise.reject({
          __CACHED_RESPONSE__: true,
          data: cachedData,
          config,
        });
      }
    }

    // Log request in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`, config.data);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    // Cache successful GET responses
    if (response.config.method === 'get' && (response.config as any).cache !== false) {
      const cacheKey = getCacheKey(response.config);
      const ttl = (response.config as any).cacheTTL || CACHE_TTL;
      setCachedResponse(cacheKey, response.data, ttl);
    }

    // Log response in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ Response from ${response.config.url}`, response.data);
    }

    return response;
  },
  async (error) => {
    // Handle cached response
    if (error.__CACHED_RESPONSE__) {
      return { data: error.data, config: error.config, cached: true };
    }

    // Handle network errors
    if (!error.response) {
      const apiError = new ApiError(
        'Network error. Please check your connection.',
        0,
        'NETWORK_ERROR'
      );

      // Show notification for network errors
      const { error: showError } = useNotificationStore.getState();
      showError('Connection Error', apiError.message);

      return Promise.reject(apiError);
    }

    // Handle specific status codes
    const { status, data } = error.response;
    const config = error.config;

    // Retry logic
    const retryConfig: RetryConfig = config.__retryConfig || {
      retries: DEFAULT_RETRY_COUNT,
      retryDelay: DEFAULT_RETRY_DELAY,
    };

    // Check if we should retry
    const shouldRetry =
      retryConfig.retries > 0 &&
      (status >= 500 || status === 429 || status === 408) &&
      (!retryConfig.retryCondition || retryConfig.retryCondition(error));

    if (shouldRetry) {
      // Decrement retry count
      config.__retryConfig = {
        ...retryConfig,
        retries: retryConfig.retries - 1,
      };

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, retryConfig.retryDelay));

      // Exponential backoff for next retry
      config.__retryConfig.retryDelay *= 2;

      // Retry the request
      return apiClient(config);
    }

    // Handle authentication errors
    if (status === 401) {
      // Clear token and redirect to login
      setAuthToken(null);

      // Clear cache on auth failure
      clearCache();

      // Show notification
      const { error: showError } = useNotificationStore.getState();
      showError('Session Expired', 'Please login again');

      // Redirect to login after delay
      if (typeof window !== 'undefined') {
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      }

      return Promise.reject(new ApiError('Authentication failed', 401, 'AUTH_FAILED'));
    }

    // Handle other errors
    const message = data?.error || data?.message || 'An error occurred';
    const code = data?.code || `HTTP_${status}`;

    const apiError = new ApiError(message, status, code, data);

    // Show notification for client errors
    if (status >= 400 && status < 500 && status !== 401) {
      const { error: showError } = useNotificationStore.getState();
      showError('Request Error', message);
    }

    // Show notification for server errors
    if (status >= 500) {
      const { error: showError } = useNotificationStore.getState();
      showError('Server Error', 'Something went wrong. Please try again.');
    }

    return Promise.reject(apiError);
  }
);

// API methods
export const api = {
  // GET request
  get: <T = any>(url: string, config?: AxiosRequestConfig & { cache?: boolean; cacheTTL?: number }): Promise<T> => {
    return apiClient.get(url, config).then(res => res.data);
  },

  // POST request
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    return apiClient.post(url, data, config).then(res => res.data);
  },

  // PUT request
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    return apiClient.put(url, data, config).then(res => res.data);
  },

  // PATCH request
  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    return apiClient.patch(url, data, config).then(res => res.data);
  },

  // DELETE request
  delete: <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    return apiClient.delete(url, config).then(res => res.data);
  },

  // Upload file
  upload: <T = any>(url: string, formData: FormData, onProgress?: (progress: number) => void): Promise<T> => {
    return apiClient.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    }).then(res => res.data);
  },

  // Download file
  download: async (url: string, filename?: string): Promise<void> => {
    const response = await apiClient.get(url, {
      responseType: 'blob',
    });

    // Create download link
    const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  },
};

// Optimistic update helper
export const optimisticUpdate = async <T>(
  optimisticData: T,
  apiCall: () => Promise<T>,
  rollback: (error: any) => void
): Promise<T> => {
  try {
    // Return optimistic data immediately
    const result = await apiCall();
    return result;
  } catch (error) {
    // Rollback on error
    rollback(error);
    throw error;
  }
};

// Polling helper
export const createPoller = (
  apiCall: () => Promise<any>,
  interval: number = 5000,
  condition?: (data: any) => boolean
) => {
  let intervalId: NodeJS.Timeout | null = null;

  const start = async (onData: (data: any) => void, onError?: (error: any) => void) => {
    const poll = async () => {
      try {
        const data = await apiCall();
        onData(data);

        // Stop polling if condition is met
        if (condition && condition(data)) {
          stop();
        }
      } catch (error) {
        if (onError) {
          onError(error);
        }
      }
    };

    // Initial call
    await poll();

    // Set up interval
    intervalId = setInterval(poll, interval);
  };

  const stop = () => {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  };

  return { start, stop };
};

export default apiClient;