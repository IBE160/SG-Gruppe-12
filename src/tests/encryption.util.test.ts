// src/tests/encryption.util.test.ts
import { encryptionService } from '../utils/encryption.util';

describe('Encryption Utility', () => {
  const originalEnv = process.env.ENCRYPTION_KEY;

  beforeAll(() => {
    // Set a test encryption key (32 bytes in hex = 64 characters)
    process.env.ENCRYPTION_KEY = 'a'.repeat(64);
  });

  afterAll(() => {
    process.env.ENCRYPTION_KEY = originalEnv;
  });

  describe('encrypt and decrypt', () => {
    it('should encrypt and decrypt a simple string', () => {
      const plaintext = 'Hello, World!';
      const encrypted = encryptionService.encrypt(plaintext);
      const decrypted = encryptionService.decrypt(encrypted);

      expect(encrypted).not.toBe(plaintext);
      expect(decrypted).toBe(plaintext);
    });

    it('should encrypt and decrypt a long string', () => {
      const plaintext = 'Lorem ipsum dolor sit amet, '.repeat(100);
      const encrypted = encryptionService.encrypt(plaintext);
      const decrypted = encryptionService.decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    it('should encrypt and decrypt special characters', () => {
      const plaintext = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`äöü日本語';
      const encrypted = encryptionService.encrypt(plaintext);
      const decrypted = encryptionService.decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    it('should produce different ciphertext for the same plaintext (random IV)', () => {
      const plaintext = 'Same message';
      const encrypted1 = encryptionService.encrypt(plaintext);
      const encrypted2 = encryptionService.encrypt(plaintext);

      expect(encrypted1).not.toBe(encrypted2);

      // But both should decrypt to the same value
      expect(encryptionService.decrypt(encrypted1)).toBe(plaintext);
      expect(encryptionService.decrypt(encrypted2)).toBe(plaintext);
    });

    it('should handle empty string', () => {
      const plaintext = '';
      const encrypted = encryptionService.encrypt(plaintext);
      const decrypted = encryptionService.decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    it('should fail to decrypt tampered data', () => {
      const plaintext = 'Sensitive data';
      const encrypted = encryptionService.encrypt(plaintext);

      // Tamper with the encrypted data
      const tampered = encrypted.slice(0, -5) + 'XXXXX';

      expect(() => encryptionService.decrypt(tampered)).toThrow();
    });
  });

  describe('encryptJson and decryptJson', () => {
    it('should encrypt and decrypt a JSON object', () => {
      const data = {
        name: 'John Doe',
        email: 'john@example.com',
        skills: ['JavaScript', 'TypeScript', 'Python'],
        experience: {
          years: 5,
          companies: ['Acme Corp', 'Tech Inc'],
        },
      };

      const encrypted = encryptionService.encryptJson(data);
      const decrypted = encryptionService.decryptJson(encrypted);

      expect(decrypted).toEqual(data);
    });

    it('should encrypt and decrypt arrays', () => {
      const data = [1, 2, 3, 'four', { five: 5 }];
      const encrypted = encryptionService.encryptJson(data);
      const decrypted = encryptionService.decryptJson(encrypted);

      expect(decrypted).toEqual(data);
    });

    it('should handle nested objects', () => {
      const data = {
        level1: {
          level2: {
            level3: {
              value: 'deep value',
            },
          },
        },
      };

      const encrypted = encryptionService.encryptJson(data);
      const decrypted = encryptionService.decryptJson<typeof data>(encrypted);

      expect(decrypted.level1.level2.level3.value).toBe('deep value');
    });
  });

  describe('isEncrypted', () => {
    it('should return true for encrypted data', () => {
      const encrypted = encryptionService.encrypt('test');
      expect(encryptionService.isEncrypted(encrypted)).toBe(true);
    });

    it('should return false for plain text', () => {
      expect(encryptionService.isEncrypted('Hello, World!')).toBe(false);
    });

    it('should return false for short base64 strings', () => {
      expect(encryptionService.isEncrypted('SGVsbG8=')).toBe(false);
    });

    it('should return false for invalid base64', () => {
      expect(encryptionService.isEncrypted('not base64 !!!')).toBe(false);
    });
  });

  describe('generateEncryptionKey', () => {
    it('should generate a 64-character hex string (32 bytes)', () => {
      const key = encryptionService.generateEncryptionKey();

      expect(key).toHaveLength(64);
      expect(/^[0-9a-f]+$/.test(key)).toBe(true);
    });

    it('should generate unique keys', () => {
      const key1 = encryptionService.generateEncryptionKey();
      const key2 = encryptionService.generateEncryptionKey();

      expect(key1).not.toBe(key2);
    });
  });

  describe('hashForLogging', () => {
    it('should return a 16-character hash', () => {
      const hash = encryptionService.hashForLogging('sensitive data');

      expect(hash).toHaveLength(16);
      expect(/^[0-9a-f]+$/.test(hash)).toBe(true);
    });

    it('should produce the same hash for the same input', () => {
      const hash1 = encryptionService.hashForLogging('same input');
      const hash2 = encryptionService.hashForLogging('same input');

      expect(hash1).toBe(hash2);
    });

    it('should produce different hashes for different inputs', () => {
      const hash1 = encryptionService.hashForLogging('input 1');
      const hash2 = encryptionService.hashForLogging('input 2');

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('error handling', () => {
    it('should throw error when ENCRYPTION_KEY is not set', () => {
      const originalKey = process.env.ENCRYPTION_KEY;
      delete process.env.ENCRYPTION_KEY;

      expect(() => encryptionService.encrypt('test')).toThrow(
        'ENCRYPTION_KEY environment variable is not set'
      );

      process.env.ENCRYPTION_KEY = originalKey;
    });
  });
});
