import { defineConfig } from '@prisma/client';

export default defineConfig({
  datasource: {
    // Prisma 7 requires this instead of "url" in schema.prisma
    url: process.env.DATABASE_URL!,
  },
});
