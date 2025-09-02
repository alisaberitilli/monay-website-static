// Hybrid OTP storage - uses local PostgreSQL with in-memory fallback
// This ensures OTPs work both locally with PostgreSQL and as a fallback

interface OTPData {
  code: string;
  timestamp: number;
  firstName: string;
  type: 'email' | 'mobile';
}

// Declare global variable for local development fallback
declare global {
  var otpMemoryStore: Map<string, OTPData> | undefined;
}

// Initialize global store for fallback
if (!global.otpMemoryStore) {
  global.otpMemoryStore = new Map<string, OTPData>();
  console.log('Global OTP memory store initialized for fallback');
}

export class HybridOTPStore {
  private usePostgres: boolean = false;
  private postgresChecked: boolean = false;
  private TTL: number = 5 * 60 * 1000; // 5 minutes

  constructor() {
    // Check if we can use local PostgreSQL
    this.checkEnvironment();
  }

  private async checkEnvironment() {
    if (this.postgresChecked) return;
    
    try {
      // Check if we have a local PostgreSQL connection
      if (process.env.POSTGRES_URL) {
        console.log('POSTGRES_URL found, attempting local Postgres connection...');
        
        // Try to connect to local PostgreSQL using node-postgres
        const { Client } = await import('pg');
        const client = new Client({
          connectionString: process.env.POSTGRES_URL,
        });
        
        await client.connect();
        await client.query('SELECT 1');
        await client.end();
        
        this.usePostgres = true;
        console.log('✅ Local PostgreSQL available, using database storage');
        
        // Initialize the table
        await this.initializeTable();
      } else {
        console.log('No POSTGRES_URL found, using global memory storage');
        this.usePostgres = false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.log('❌ Local PostgreSQL connection failed, falling back to global memory storage:', errorMessage);
      this.usePostgres = false;
    } finally {
      this.postgresChecked = true;
    }
  }

  private async initializeTable() {
    if (!this.usePostgres) return;
    
    try {
      const { Client } = await import('pg');
      const client = new Client({
        connectionString: process.env.POSTGRES_URL,
      });
      
      await client.connect();
      await client.query(`
        CREATE TABLE IF NOT EXISTS otp_store (
          identifier VARCHAR(255) PRIMARY KEY,
          code VARCHAR(10) NOT NULL,
          timestamp BIGINT NOT NULL,
          first_name VARCHAR(255) NOT NULL,
          type VARCHAR(10) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      await client.end();
      
      console.log('✅ Local PostgreSQL OTP table initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing local PostgreSQL OTP table:', error);
      this.usePostgres = false;
    }
  }

  async set(identifier: string, data: OTPData): Promise<void> {
    // Ensure environment check is complete
    if (!this.postgresChecked) {
      await this.checkEnvironment();
    }

    if (this.usePostgres) {
      try {
        const { Client } = await import('pg');
        const client = new Client({
          connectionString: process.env.POSTGRES_URL,
        });
        
        await client.connect();
        await client.query(`
          INSERT INTO otp_store (identifier, code, timestamp, first_name, type)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (identifier) 
          DO UPDATE SET 
            code = EXCLUDED.code,
            timestamp = EXCLUDED.timestamp,
            first_name = EXCLUDED.first_name,
            type = EXCLUDED.type,
            created_at = CURRENT_TIMESTAMP
        `, [identifier, data.code, data.timestamp, data.firstName, data.type]);
        
        await client.end();
        console.log(`✅ OTP stored in local PostgreSQL for ${identifier}`);
        return;
      } catch (error) {
        console.error('❌ Local PostgreSQL storage failed, falling back to global memory:', error);
        this.usePostgres = false;
      }
    }

    // Fallback to global memory storage
    global.otpMemoryStore!.set(identifier, data);
    console.log(`✅ OTP stored in global memory for ${identifier}`);
    console.log(`Global memory store size after storing: ${global.otpMemoryStore!.size}`);
    console.log(`Global memory store contents:`, Array.from(global.otpMemoryStore!.entries()));
  }

  async get(identifier: string): Promise<OTPData | undefined> {
    // Ensure environment check is complete
    if (!this.postgresChecked) {
      await this.checkEnvironment();
    }

    if (this.usePostgres) {
      try {
        const { Client } = await import('pg');
        const client = new Client({
          connectionString: process.env.POSTGRES_URL,
        });
        
        await client.connect();
        const result = await client.query(`
          SELECT code, timestamp, first_name, type
          FROM otp_store 
          WHERE identifier = $1
        `, [identifier]);
        
        await client.end();
        
        if (result.rows.length > 0) {
          const row = result.rows[0];
          const data: OTPData = {
            code: row.code,
            timestamp: parseInt(row.timestamp),
            firstName: row.first_name,
            type: row.type as 'email' | 'mobile'
          };
          console.log(`✅ OTP retrieved from local PostgreSQL for ${identifier}`);
          return data;
        }
      } catch (error) {
        console.error('❌ Local PostgreSQL retrieval failed, falling back to global memory:', error);
        this.usePostgres = false;
      }
    }

    // Fallback to global memory storage
    const data = global.otpMemoryStore!.get(identifier);
    console.log(`Global memory store size when retrieving: ${global.otpMemoryStore!.size}`);
    console.log(`Global memory store contents when retrieving:`, Array.from(global.otpMemoryStore!.entries()));
    
    if (data) {
      // Check if OTP has expired
      if (Date.now() - data.timestamp > this.TTL) {
        console.log(`OTP expired for ${identifier}, removing`);
        global.otpMemoryStore!.delete(identifier);
        return undefined;
      }
      console.log(`✅ OTP retrieved from global memory for ${identifier}`);
      return data;
    } else {
      console.log(`No OTP found in global memory for ${identifier}`);
      return undefined;
    }
  }

  async delete(identifier: string): Promise<boolean> {
    // Ensure environment check is complete
    if (!this.postgresChecked) {
      await this.checkEnvironment();
    }

    if (this.usePostgres) {
      try {
        const { Client } = await import('pg');
        const client = new Client({
          connectionString: process.env.POSTGRES_URL,
        });
        
        await client.connect();
        const result = await client.query(`
          DELETE FROM otp_store 
          WHERE identifier = $1
        `, [identifier]);
        
        await client.end();
        
        if (result.rowCount && result.rowCount > 0) {
          console.log(`✅ OTP deleted from local PostgreSQL for ${identifier}`);
          return true;
        }
      } catch (error) {
        console.error('❌ Local PostgreSQL deletion failed, falling back to global memory:', error);
        this.usePostgres = false;
      }
    }

    // Fallback to global memory storage
    const result = global.otpMemoryStore!.delete(identifier);
    if (result) {
      console.log(`✅ OTP deleted from global memory for ${identifier}`);
    }
    return result;
  }

  async cleanup(): Promise<void> {
    // Ensure environment check is complete
    if (!this.postgresChecked) {
      await this.checkEnvironment();
    }

    if (this.usePostgres) {
      try {
        const { Client } = await import('pg');
        const client = new Client({
          connectionString: process.env.POSTGRES_URL,
        });
        
        await client.connect();
        const cutoffTime = Date.now() - this.TTL;
        const result = await client.query(`
          DELETE FROM otp_store 
          WHERE timestamp < $1
        `, [cutoffTime]);
        
        const sizeResult = await client.query('SELECT COUNT(*) as count FROM otp_store');
        await client.end();
        
        if (result.rowCount && result.rowCount > 0) {
          console.log(`✅ Cleaned up ${result.rowCount} expired OTPs from local PostgreSQL`);
        }
        
        const currentSize = sizeResult.rows[0]?.count || 0;
        console.log(`Current local PostgreSQL OTP store size: ${currentSize}`);
        return;
      } catch (error) {
        console.error('❌ Local PostgreSQL cleanup failed, falling back to global memory:', error);
        this.usePostgres = false;
      }
    }

    // Fallback to global memory cleanup
    const now = Date.now();
    let cleanedCount = 0;
    
    for (const [identifier, data] of global.otpMemoryStore!.entries()) {
      if (now - data.timestamp > this.TTL) {
        global.otpMemoryStore!.delete(identifier);
        cleanedCount++;
      }
    }
    
    if (cleanedCount > 0) {
      console.log(`✅ Cleaned up ${cleanedCount} expired OTPs from global memory`);
    }
    
    console.log(`Current global memory OTP store size: ${global.otpMemoryStore!.size}`);
  }

  async size(): Promise<number> {
    // Ensure environment check is complete
    if (!this.postgresChecked) {
      await this.checkEnvironment();
    }

    if (this.usePostgres) {
      try {
        const { Client } = await import('pg');
        const client = new Client({
          connectionString: process.env.POSTGRES_URL,
        });
        
        await client.connect();
        const result = await client.query('SELECT COUNT(*) as count FROM otp_store');
        await client.end();
        
        return parseInt(result.rows[0]?.count || '0');
      } catch (error) {
        console.error('❌ Local PostgreSQL size check failed, falling back to global memory:', error);
        this.usePostgres = false;
      }
    }

    // Fallback to global memory storage
    return global.otpMemoryStore!.size;
  }

  getStorageMode(): string {
    return this.usePostgres ? 'Local PostgreSQL' : 'Global Memory';
  }
}

// Export singleton instance
export const otpStore = new HybridOTPStore();
export type { OTPData };


