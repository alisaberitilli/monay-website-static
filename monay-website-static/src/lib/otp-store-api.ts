// API-based OTP storage - uses monay-backend-common API
// This ensures all OTP operations go through the centralized backend

interface OTPData {
  code: string;
  timestamp: number;
  firstName: string;
  type: 'email' | 'mobile';
}

interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface OTPResponse {
  code: string;
  timestamp: number;
  firstName: string;
  type: string;
}

interface CleanupResponse {
  count: number;
}

interface CountResponse {
  count: number;
}

export class APIOTPStore {
  private apiUrl: string;
  private TTL: number = 5 * 60 * 1000; // 5 minutes

  constructor() {
    // Use monay-backend-common API URL from environment or default
    this.apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
  }

  private async makeRequest<T = unknown>(
    endpoint: string,
    method: 'GET' | 'POST' | 'DELETE' = 'GET',
    body?: Record<string, unknown>
  ): Promise<APIResponse<T>> {
    try {
      const response = await fetch(`${this.apiUrl}/api/otp${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      return await response.json() as APIResponse<T>;
    } catch (error) {
      console.error(`API OTP store error (${method} ${endpoint}):`, error);
      throw error;
    }
  }

  async set(identifier: string, data: OTPData): Promise<void> {
    try {
      await this.makeRequest('/store', 'POST', {
        identifier,
        ...data,
      });
      console.log(`✅ OTP stored via API for ${identifier}`);
    } catch (error) {
      console.error('❌ Failed to store OTP via API:', error);
      // Fallback to in-memory storage if API fails
      this.fallbackToMemory(identifier, data);
    }
  }

  async get(identifier: string): Promise<OTPData | undefined> {
    try {
      const response = await this.makeRequest<OTPResponse>(`/verify/${identifier}`);
      
      if (response.success && response.data) {
        const data: OTPData = {
          code: response.data.code,
          timestamp: response.data.timestamp,
          firstName: response.data.firstName,
          type: response.data.type as 'email' | 'mobile'
        };

        // Check if OTP has expired
        if (Date.now() - data.timestamp > this.TTL) {
          console.log(`OTP expired for ${identifier}`);
          await this.delete(identifier);
          return undefined;
        }

        console.log(`✅ OTP retrieved via API for ${identifier}`);
        return data;
      }
      
      return undefined;
    } catch (error) {
      console.error('❌ Failed to retrieve OTP via API:', error);
      // Fallback to in-memory storage if API fails
      return this.getFromMemory(identifier);
    }
  }

  async delete(identifier: string): Promise<boolean> {
    try {
      const response = await this.makeRequest<void>(`/${identifier}`, 'DELETE');
      
      if (response.success) {
        console.log(`✅ OTP deleted via API for ${identifier}`);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ Failed to delete OTP via API:', error);
      // Fallback to in-memory storage if API fails
      return this.deleteFromMemory(identifier);
    }
  }

  async cleanup(): Promise<void> {
    try {
      const response = await this.makeRequest<CleanupResponse>('/cleanup', 'POST', {
        ttl: this.TTL,
      });
      
      if (response.success && response.data) {
        console.log(`✅ Cleaned up ${response.data.count || 0} expired OTPs via API`);
      }
    } catch (error) {
      console.error('❌ Failed to cleanup OTPs via API:', error);
      // Fallback to in-memory cleanup if API fails
      this.cleanupMemory();
    }
  }

  async size(): Promise<number> {
    try {
      const response = await this.makeRequest<CountResponse>('/count');
      
      if (response.success && response.data) {
        return response.data.count || 0;
      }
      
      return 0;
    } catch (error) {
      console.error('❌ Failed to get OTP count via API:', error);
      // Fallback to in-memory count if API fails
      return this.getMemorySize();
    }
  }

  getStorageMode(): string {
    return 'Backend API';
  }

  // ========== Fallback Memory Storage ==========
  // Used only when API is unavailable

  private memoryStore: Map<string, OTPData> = new Map();

  private fallbackToMemory(identifier: string, data: OTPData): void {
    this.memoryStore.set(identifier, data);
    console.log(`⚠️ OTP stored in fallback memory for ${identifier}`);
  }

  private getFromMemory(identifier: string): OTPData | undefined {
    const data = this.memoryStore.get(identifier);
    
    if (data) {
      // Check if OTP has expired
      if (Date.now() - data.timestamp > this.TTL) {
        console.log(`OTP expired in memory for ${identifier}`);
        this.memoryStore.delete(identifier);
        return undefined;
      }
      console.log(`⚠️ OTP retrieved from fallback memory for ${identifier}`);
      return data;
    }
    
    return undefined;
  }

  private deleteFromMemory(identifier: string): boolean {
    const result = this.memoryStore.delete(identifier);
    if (result) {
      console.log(`⚠️ OTP deleted from fallback memory for ${identifier}`);
    }
    return result;
  }

  private cleanupMemory(): void {
    const now = Date.now();
    let cleanedCount = 0;
    
    for (const [identifier, data] of this.memoryStore.entries()) {
      if (now - data.timestamp > this.TTL) {
        this.memoryStore.delete(identifier);
        cleanedCount++;
      }
    }
    
    if (cleanedCount > 0) {
      console.log(`⚠️ Cleaned up ${cleanedCount} expired OTPs from fallback memory`);
    }
  }

  private getMemorySize(): number {
    return this.memoryStore.size;
  }
}

// Export singleton instance
export const otpStore = new APIOTPStore();
export type { OTPData };