// src/tests/password.util.test.ts
import { hashPassword, comparePassword } from '../utils/password.util';
import bcrypt from 'bcrypt';

// Mock bcrypt to control its behavior during tests
jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('password.util', () => {
  const plainPassword = 'mySecurePassword123!';
  const hashedPassword = 'hashedPasswordString';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('hashPassword', () => {
    it('should call bcrypt.hash with the correct arguments', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      const result = await hashPassword(plainPassword);

      expect(bcrypt.hash).toHaveBeenCalledWith(plainPassword, 10); // 10 is the SALT_ROUNDS
      expect(result).toBe(hashedPassword);
    });
  });

  describe('comparePassword', () => {
    it('should call bcrypt.compare with the correct arguments and return true for match', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await comparePassword(plainPassword, hashedPassword);

      expect(bcrypt.compare).toHaveBeenCalledWith(plainPassword, hashedPassword);
      expect(result).toBe(true);
    });

    it('should call bcrypt.compare with the correct arguments and return false for no match', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await comparePassword(plainPassword, hashedPassword);

      expect(bcrypt.compare).toHaveBeenCalledWith(plainPassword, hashedPassword);
      expect(result).toBe(false);
    });
  });
});
