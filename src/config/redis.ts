// src/config/redis.ts
import Redis from 'ioredis';

const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379', 10);
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || undefined; // If your Redis requires a password

export const redis = new Redis({
  host: REDIS_HOST,
  port: REDIS_PORT,
  password: REDIS_PASSWORD,
  maxRetriesPerRequest: null, // Disable retries for commands, Bull handles reconnection
});

redis.on('connect', () => {
  console.log('Connected to Redis');
});

redis.on('error', (error: any) => {
  console.error('Redis connection error:', error);
});