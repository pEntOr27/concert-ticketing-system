import { describe, it, expect } from 'vitest';
import { hashPassword, comparePassword, signToken, verifyToken } from '../../lib/auth';

describe('Auth & Cryptography Unit Tests', () => {
  it('should hash password and verify correctly with bcrypt', async () => {
    const rawPassword = 'AdminSecret@123456';
    const hash = await hashPassword(rawPassword);
    expect(hash).not.toBe(rawPassword);

    const isValid = await comparePassword(rawPassword, hash);
    expect(isValid).toBe(true);

    const isInvalid = await comparePassword('WrongPassword', hash);
    expect(isInvalid).toBe(false);
  });

  it('should sign and verify JWT tokens securely', async () => {
    const payload = {
      userId: 'user-uuid-123',
      email: 'admin@concert.com',
      roles: ['admin', 'super_admin'],
    };

    const token = await signToken(payload);
    expect(token).toBeTypeOf('string');

    const decoded = await verifyToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.userId).toBe('user-uuid-123');
    expect(decoded?.roles).toContain('admin');
  });
});
