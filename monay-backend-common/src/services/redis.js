/**
 * Redis Service
 * Provides caching, session management, and real-time data operations
 */

import Redis from 'ioredis';
import logger from './logger.js';

class RedisService {
  constructor() {
    this.client = null;
    this.subscriber = null;
    this.publisher = null;
    this.isConnected = false;
    this.initialize();
  }

  initialize() {
    const redisConfig = {
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
      db: process.env.REDIS_DB || 0,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      enableOfflineQueue: true
    };

    try {
      // Main client for general operations
      this.client = new Redis(redisConfig);

      // Separate clients for pub/sub
      this.subscriber = new Redis(redisConfig);
      this.publisher = new Redis(redisConfig);

      // Set up event handlers
      this.setupEventHandlers();

      console.log('Redis service initialized');
    } catch (error) {
      console.error('Failed to initialize Redis:', error);
    }
  }

  setupEventHandlers() {
    this.client.on('connect', () => {
      this.isConnected = true;
      console.log('Redis client connected');
    });

    this.client.on('error', (error) => {
      this.isConnected = false;
      console.error('Redis client error:', error);
    });

    this.client.on('close', () => {
      this.isConnected = false;
      console.log('Redis connection closed');
    });

    this.client.on('reconnecting', () => {
      console.log('Redis client reconnecting...');
    });
  }

  /**
   * Basic Operations
   */
  async get(key) {
    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Redis get error for key ${key}:`, error);
      return null;
    }
  }

  async set(key, value, ttl = null) {
    try {
      const serialized = JSON.stringify(value);
      if (ttl) {
        return await this.client.setex(key, ttl, serialized);
      }
      return await this.client.set(key, serialized);
    } catch (error) {
      console.error(`Redis set error for key ${key}:`, error);
      return false;
    }
  }

  async del(key) {
    try {
      return await this.client.del(key);
    } catch (error) {
      console.error(`Redis del error for key ${key}:`, error);
      return false;
    }
  }

  async exists(key) {
    try {
      return await this.client.exists(key);
    } catch (error) {
      console.error(`Redis exists error for key ${key}:`, error);
      return false;
    }
  }

  async expire(key, seconds) {
    try {
      return await this.client.expire(key, seconds);
    } catch (error) {
      console.error(`Redis expire error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Hash Operations
   */
  async hget(key, field) {
    try {
      const value = await this.client.hget(key, field);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Redis hget error for ${key}:${field}:`, error);
      return null;
    }
  }

  async hset(key, field, value) {
    try {
      const serialized = JSON.stringify(value);
      return await this.client.hset(key, field, serialized);
    } catch (error) {
      console.error(`Redis hset error for ${key}:${field}:`, error);
      return false;
    }
  }

  async hgetall(key) {
    try {
      const data = await this.client.hgetall(key);
      const result = {};
      for (const [field, value] of Object.entries(data)) {
        try {
          result[field] = JSON.parse(value);
        } catch {
          result[field] = value;
        }
      }
      return result;
    } catch (error) {
      console.error(`Redis hgetall error for ${key}:`, error);
      return {};
    }
  }

  async hdel(key, field) {
    try {
      return await this.client.hdel(key, field);
    } catch (error) {
      console.error(`Redis hdel error for ${key}:${field}:`, error);
      return false;
    }
  }

  /**
   * List Operations
   */
  async lpush(key, value) {
    try {
      const serialized = JSON.stringify(value);
      return await this.client.lpush(key, serialized);
    } catch (error) {
      console.error(`Redis lpush error for ${key}:`, error);
      return false;
    }
  }

  async rpush(key, value) {
    try {
      const serialized = JSON.stringify(value);
      return await this.client.rpush(key, serialized);
    } catch (error) {
      console.error(`Redis rpush error for ${key}:`, error);
      return false;
    }
  }

  async lrange(key, start = 0, stop = -1) {
    try {
      const items = await this.client.lrange(key, start, stop);
      return items.map(item => {
        try {
          return JSON.parse(item);
        } catch {
          return item;
        }
      });
    } catch (error) {
      console.error(`Redis lrange error for ${key}:`, error);
      return [];
    }
  }

  /**
   * Set Operations
   */
  async sadd(key, member) {
    try {
      return await this.client.sadd(key, member);
    } catch (error) {
      console.error(`Redis sadd error for ${key}:`, error);
      return false;
    }
  }

  async srem(key, member) {
    try {
      return await this.client.srem(key, member);
    } catch (error) {
      console.error(`Redis srem error for ${key}:`, error);
      return false;
    }
  }

  async smembers(key) {
    try {
      return await this.client.smembers(key);
    } catch (error) {
      console.error(`Redis smembers error for ${key}:`, error);
      return [];
    }
  }

  async sismember(key, member) {
    try {
      return await this.client.sismember(key, member);
    } catch (error) {
      console.error(`Redis sismember error for ${key}:`, error);
      return false;
    }
  }

  /**
   * Atomic Operations
   */
  async incr(key) {
    try {
      return await this.client.incr(key);
    } catch (error) {
      console.error(`Redis incr error for ${key}:`, error);
      return null;
    }
  }

  async decr(key) {
    try {
      return await this.client.decr(key);
    } catch (error) {
      console.error(`Redis decr error for ${key}:`, error);
      return null;
    }
  }

  async incrby(key, amount) {
    try {
      return await this.client.incrby(key, amount);
    } catch (error) {
      console.error(`Redis incrby error for ${key}:`, error);
      return null;
    }
  }

  /**
   * Pub/Sub Operations
   */
  async publish(channel, message) {
    try {
      const serialized = JSON.stringify(message);
      return await this.publisher.publish(channel, serialized);
    } catch (error) {
      console.error(`Redis publish error for channel ${channel}:`, error);
      return false;
    }
  }

  async subscribe(channel, callback) {
    try {
      await this.subscriber.subscribe(channel);

      this.subscriber.on('message', (receivedChannel, message) => {
        if (receivedChannel === channel) {
          try {
            const parsed = JSON.parse(message);
            callback(parsed);
          } catch {
            callback(message);
          }
        }
      });

      return true;
    } catch (error) {
      console.error(`Redis subscribe error for channel ${channel}:`, error);
      return false;
    }
  }

  async unsubscribe(channel) {
    try {
      return await this.subscriber.unsubscribe(channel);
    } catch (error) {
      console.error(`Redis unsubscribe error for channel ${channel}:`, error);
      return false;
    }
  }

  /**
   * Cache Operations
   */
  async cache(key, fetcher, ttl = 3600) {
    try {
      // Try to get from cache
      const cached = await this.get(key);
      if (cached !== null) {
        return cached;
      }

      // Fetch fresh data
      const fresh = await fetcher();

      // Store in cache
      await this.set(key, fresh, ttl);

      return fresh;
    } catch (error) {
      console.error(`Cache operation error for ${key}:`, error);
      // Return fetcher result even if caching fails
      return await fetcher();
    }
  }

  async invalidate(pattern) {
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        return await this.client.del(...keys);
      }
      return 0;
    } catch (error) {
      console.error(`Cache invalidation error for pattern ${pattern}:`, error);
      return 0;
    }
  }

  /**
   * Lock Operations
   */
  async acquireLock(key, ttl = 10) {
    const lockKey = `lock:${key}`;
    const lockValue = Date.now() + ttl * 1000;

    try {
      const result = await this.client.set(lockKey, lockValue, 'NX', 'EX', ttl);
      return result === 'OK';
    } catch (error) {
      console.error(`Lock acquire error for ${key}:`, error);
      return false;
    }
  }

  async releaseLock(key) {
    const lockKey = `lock:${key}`;

    try {
      return await this.del(lockKey);
    } catch (error) {
      console.error(`Lock release error for ${key}:`, error);
      return false;
    }
  }

  /**
   * Rate Limiting
   */
  async checkRateLimit(key, limit, window = 60) {
    const rateLimitKey = `rate:${key}`;

    try {
      const current = await this.incr(rateLimitKey);

      if (current === 1) {
        await this.expire(rateLimitKey, window);
      }

      return {
        allowed: current <= limit,
        current,
        limit,
        remaining: Math.max(0, limit - current),
        resetIn: await this.client.ttl(rateLimitKey)
      };
    } catch (error) {
      console.error(`Rate limit check error for ${key}:`, error);
      return {
        allowed: true,
        current: 0,
        limit,
        remaining: limit,
        resetIn: 0
      };
    }
  }

  /**
   * Session Management
   */
  async setSession(sessionId, data, ttl = 3600) {
    const key = `session:${sessionId}`;
    return await this.set(key, data, ttl);
  }

  async getSession(sessionId) {
    const key = `session:${sessionId}`;
    return await this.get(key);
  }

  async deleteSession(sessionId) {
    const key = `session:${sessionId}`;
    return await this.del(key);
  }

  async extendSession(sessionId, ttl = 3600) {
    const key = `session:${sessionId}`;
    return await this.expire(key, ttl);
  }

  /**
   * Cleanup
   */
  async disconnect() {
    try {
      await this.client.quit();
      await this.subscriber.quit();
      await this.publisher.quit();
      this.isConnected = false;
      console.log('Redis connections closed');
    } catch (error) {
      console.error('Error disconnecting from Redis:', error);
    }
  }
}

// Export singleton instance
let instance;
export default (() => {
  if (!instance) {
    instance = new RedisService();
  }
  return instance;
})();