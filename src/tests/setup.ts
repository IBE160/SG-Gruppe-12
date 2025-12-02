
import { jest } from '@jest/globals';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.test
dotenv.config({ path: path.resolve(__dirname, '../.env.test') });

jest.mock('ioredis');
jest.mock('rate-limit-redis');
jest.mock('file-type');
jest.mock('bull');
jest.mock('../services/storage.service');