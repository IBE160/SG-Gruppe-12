import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env file

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

export { prisma };