import { randomBytes, createHash, scrypt, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

/**
 * Cryptographic utility functions
 */
export class CryptoUtils {
  /**
   * Generate a secure random string
   */
  static generateRandomString(length: number = 32): string {
    return randomBytes(Math.ceil(length / 2))
      .toString('hex')
      .slice(0, length);
  }

  /**
   * Generate a secure random token
   */
  static generateToken(length: number = 64): string {
    return randomBytes(length).toString('base64url');
  }

  /**
   * Generate a UUID v4
   */
  static generateUUID(): string {
    const bytes = randomBytes(16);

    // Set version (4) and variant bits
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;

    const hex = bytes.toString('hex');
    return [
      hex.substring(0, 8),
      hex.substring(8, 12),
      hex.substring(12, 16),
      hex.substring(16, 20),
      hex.substring(20, 32),
    ].join('-');
  }

  /**
   * Hash a password with salt using scrypt
   */
  static async hashPassword(password: string): Promise<string> {
    const salt = randomBytes(32);
    const keylen = 64;
    const derivedKey = (await scryptAsync(password, salt, keylen)) as Buffer;

    return `${salt.toString('hex')}:${derivedKey.toString('hex')}`;
  }

  /**
   * Verify a password against its hash
   */
  static async verifyPassword(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    try {
      const [saltHex, keyHex] = hashedPassword.split(':');
      const salt = Buffer.from(saltHex, 'hex');
      const storedKey = Buffer.from(keyHex, 'hex');

      const keylen = storedKey.length;
      const derivedKey = (await scryptAsync(password, salt, keylen)) as Buffer;

      return timingSafeEqual(storedKey, derivedKey);
    } catch {
      return false;
    }
  }

  /**
   * Create SHA-256 hash
   */
  static sha256(data: string): string {
    return createHash('sha256').update(data).digest('hex');
  }

  /**
   * Create MD5 hash (for non-security purposes like ETags)
   */
  static md5(data: string): string {
    return createHash('md5').update(data).digest('hex');
  }

  /**
   * Generate a secure API key
   */
  static generateApiKey(): string {
    const prefix = 'rk_'; // Ryckan prefix
    const random = this.generateRandomString(32);
    return `${prefix}${random}`;
  }

  /**
   * Generate a secure session token
   */
  static generateSessionToken(): string {
    return this.generateToken(64);
  }

  /**
   * Generate a secure refresh token
   */
  static generateRefreshToken(): string {
    return this.generateToken(128);
  }

  /**
   * Generate a verification code (6 digits)
   */
  static generateVerificationCode(): string {
    const code = Math.floor(100000 + Math.random() * 900000);
    return code.toString();
  }

  /**
   * Generate a secure file upload token
   */
  static generateFileUploadToken(userId: string, fileName: string): string {
    const timestamp = Date.now().toString();
    const data = `${userId}:${fileName}:${timestamp}`;
    const hash = this.sha256(data);
    return `${timestamp}:${hash}`;
  }

  /**
   * Verify file upload token
   */
  static verifyFileUploadToken(
    token: string,
    userId: string,
    fileName: string,
    maxAgeMs: number = 3600000 // 1 hour default
  ): boolean {
    try {
      const [timestampStr, hash] = token.split(':');
      const timestamp = parseInt(timestampStr, 10);

      // Check if token is not expired
      const now = Date.now();
      if (now - timestamp > maxAgeMs) {
        return false;
      }

      // Verify hash
      const expectedData = `${userId}:${fileName}:${timestampStr}`;
      const expectedHash = this.sha256(expectedData);

      return timingSafeEqual(
        Buffer.from(hash, 'hex'),
        Buffer.from(expectedHash, 'hex')
      );
    } catch {
      return false;
    }
  }

  /**
   * Generate a secure reset token for password reset
   */
  static generateResetToken(): { token: string; hashedToken: string } {
    const token = this.generateToken(32);
    const hashedToken = this.sha256(token);
    return { token, hashedToken };
  }

  /**
   * Obfuscate sensitive data (for logging)
   */
  static obfuscate(data: string, visibleChars: number = 4): string {
    if (data.length <= visibleChars) {
      return '*'.repeat(data.length);
    }

    const visible = data.slice(0, visibleChars);
    const hidden = '*'.repeat(data.length - visibleChars);
    return visible + hidden;
  }

  /**
   * Obfuscate email address for display
   */
  static obfuscateEmail(email: string): string {
    const [localPart, domain] = email.split('@');
    if (!domain) return this.obfuscate(email);

    const obfuscatedLocal = this.obfuscate(
      localPart,
      Math.min(2, localPart.length)
    );
    return `${obfuscatedLocal}@${domain}`;
  }

  /**
   * Obfuscate phone number for display
   */
  static obfuscatePhoneNumber(phoneNumber: string): string {
    const cleaned = phoneNumber.replace(/[^\d+]/g, '');
    if (cleaned.length <= 4) return '*'.repeat(cleaned.length);

    const start = cleaned.slice(0, 3);
    const end = cleaned.slice(-2);
    const middle = '*'.repeat(cleaned.length - 5);
    return `${start}${middle}${end}`;
  }
}
