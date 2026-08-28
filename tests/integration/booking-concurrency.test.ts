import { describe, it, expect } from 'vitest';

// Simulate atomic seat locking state machine
class ConcurrencySeatLockEngine {
  private seatLocks = new Map<string, { status: string; heldBy: string }>();

  async holdSeatAtomically(seatId: string, userId: string): Promise<{ success: boolean; code?: string; message?: string }> {
    const current = this.seatLocks.get(seatId);

    if (current && current.status !== 'AVAILABLE') {
      throw {
        code: 'SEAT_ALREADY_HELD',
        status: 409,
        message: 'ที่นั่งนี้ถูกจองโดยผู้ใช้งานอื่นแล้ว',
      };
    }

    // Atomic state update
    this.seatLocks.set(seatId, { status: 'HELD', heldBy: userId });
    return { success: true };
  }
}

describe('CRITICAL CONCURRENCY TEST: Double Booking Prevention', () => {
  it('should allow only 1 user to hold a seat when 2 users attempt simultaneously', async () => {
    const engine = new ConcurrencySeatLockEngine();
    const mockSeatId = 'seat-uuid-a01';

    // Simulate 2 parallel requests for the same seat
    const userA = engine.holdSeatAtomically(mockSeatId, 'user-a');
    const userB = engine.holdSeatAtomically(mockSeatId, 'user-b');

    const results = await Promise.allSettled([userA, userB]);

    const fulfilled = results.filter((r) => r.status === 'fulfilled');
    const rejected = results.filter((r) => r.status === 'rejected');

    // Verification: Exactly 1 request succeeds (200 OK) and 1 request fails with 409 Conflict
    expect(fulfilled.length).toBe(1);
    expect(rejected.length).toBe(1);

    if (rejected[0].status === 'rejected') {
      const errorObj = rejected[0].reason;
      expect(errorObj.code).toBe('SEAT_ALREADY_HELD');
      expect(errorObj.status).toBe(409);
      expect(errorObj.message).toContain('ที่นั่งนี้ถูกจองโดยผู้ใช้งานอื่นแล้ว');
    }
  });
});
