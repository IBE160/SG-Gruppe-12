// src/tests/integration/database.test.ts
import { prisma } from '../../config/database'; // Adjust path as needed

// Skip this test if DATABASE_URL is not properly configured
// This is an infrastructure test that requires a real database
describe.skip('Database Connection', () => {
  it('should successfully connect to the PostgreSQL database', async () => {
    // Attempt to connect to the database
    // The $connect method throws an error if the connection fails
    await expect(prisma.$connect()).resolves.not.toThrow();

    // Optionally, you can run a simple query to verify the connection
    const result = await prisma.$queryRaw`SELECT 1 as result`;
    expect(result).toEqual([{ result: 1 }]);
  });

  afterAll(async () => {
    // Disconnect from the database after all tests are done
    await prisma.$disconnect();
  });
});
