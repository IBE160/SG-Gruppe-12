
import { jest } from '@jest/globals';

const Redis = jest.fn(() => ({
  connect: jest.fn(() => Promise.resolve()),
  on: jest.fn(),
  call: jest.fn(),
  get: jest.fn(),
  setex: jest.fn(),
}));

export default Redis;
