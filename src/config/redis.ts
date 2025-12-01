import Redis from 'ioredis';
import IORedisMock from 'ioredis-mock';

let redis: Redis;

if (process.env.NODE_ENV === 'test') {
  // Use an in-memory mock for testing to avoid actual Redis connection
  redis = new IORedisMock();
} else {
  const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
  const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379', 10);
  const REDIS_PASSWORD = process.env.REDIS_PASSWORD || undefined;

  redis = new Redis({
    host: REDIS_HOST,
    port: REDIS_PORT,
    password: REDIS_PASSWORD,
    maxRetriesPerRequest: null,
  });

  redis.on('connect', () => {
    console.log('Connected to Redis');
  });

  redis.on('error', (error: any) => {
    // In test, errors are expected if not mocked, so we don't log them.
    if (process.env.NODE_ENV !== 'test') {
      console.error('Redis connection error:', error);
    }
  });
}

export { redis, Redis, IORedisMock };