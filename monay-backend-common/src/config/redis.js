import redis from 'redis';

// Redis client configuration
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  db: process.env.REDIS_DB || 0,
  retryStrategy: (times) => {
    // Reconnect after 2^times * 100ms
    return Math.min(times * 100, 3000);
  }
};

// Create Redis client
const client = redis.createClient(redisConfig);

// Handle connection events
client.on('connect', () => {
  console.log('Redis client connected');
});

client.on('error', (err) => {
  console.error('Redis client error:', err);
});

client.on('ready', () => {
  console.log('Redis client ready');
});

// Connect to Redis
client.connect().catch(console.error);

// Export both the client and config
export { client as redisClient, redisConfig };
export default client;