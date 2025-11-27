// src/tests/__mocks__/redis.ts
export const redis = {
  get: jest.fn(),
  set: jest.fn(),
  setex: jest.fn(),
  del: jest.fn(),
  sadd: jest.fn(),
  expire: jest.fn(),
  on: jest.fn(),
};
