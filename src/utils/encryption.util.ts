// src/utils/encryption.util.ts
import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // 128 bits
const AUTH_TAG_LENGTH = 16; // 128 bits
const KEY_LENGTH = 32; // 256 bits

/**
 * Get the encryption key from environment variables.
 * Key must be 32 bytes (256 bits) for AES-256.
 */
function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error('ENCRYPTION_KEY environment variable is not set');
  }

  // If the key is a hex string (64 characters = 32 bytes)
  if (key.length === 64 && /^[0-9a-fA-F]+$/.test(key)) {
    return Buffer.from(key, 'hex');
  }

  // If the key is a base64 string
  if (key.length === 44 && key.endsWith('=')) {
    return Buffer.from(key, 'base64');
  }

  // Otherwise, derive a key using SHA-256
  return crypto.createHash('sha256').update(key).digest();
}

/**
 * Encrypts a string using AES-256-GCM.
 * Returns a base64 encoded string containing: IV + AuthTag + CipherText
 */
export function encrypt(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, 'utf8');
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  const authTag = cipher.getAuthTag();

  // Combine IV + AuthTag + Encrypted data
  const combined = Buffer.concat([iv, authTag, encrypted]);

  return combined.toString('base64');
}

/**
 * Decrypts a base64 encoded string that was encrypted with encrypt().
 */
export function decrypt(encryptedData: string): string {
  const key = getEncryptionKey();
  const combined = Buffer.from(encryptedData, 'base64');

  // Extract IV, AuthTag, and encrypted data
  const iv = combined.subarray(0, IV_LENGTH);
  const authTag = combined.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const encrypted = combined.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted);
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString('utf8');
}

/**
 * Encrypts a JSON object.
 */
export function encryptJson<T>(data: T): string {
  return encrypt(JSON.stringify(data));
}

/**
 * Decrypts a JSON object.
 */
export function decryptJson<T>(encryptedData: string): T {
  const decrypted = decrypt(encryptedData);
  return JSON.parse(decrypted) as T;
}

/**
 * Checks if a string is encrypted (base64 encoded and has correct structure).
 */
export function isEncrypted(data: string): boolean {
  try {
    const decoded = Buffer.from(data, 'base64');
    // Minimum length: IV (16) + AuthTag (16) + at least 1 byte of data
    return decoded.length >= IV_LENGTH + AUTH_TAG_LENGTH + 1;
  } catch {
    return false;
  }
}

/**
 * Generates a new random encryption key.
 * Use this to generate ENCRYPTION_KEY for .env
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(KEY_LENGTH).toString('hex');
}

/**
 * Hash sensitive data for logging (one-way, cannot be decrypted).
 */
export function hashForLogging(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex').substring(0, 16);
}

export const encryptionService = {
  encrypt,
  decrypt,
  encryptJson,
  decryptJson,
  isEncrypted,
  generateEncryptionKey,
  hashForLogging,
};
