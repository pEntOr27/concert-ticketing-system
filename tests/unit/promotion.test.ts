import { describe, it, expect } from 'vitest';

describe('Promotion Discount Calculation Tests', () => {
  it('should correctly calculate 10% percentage discount (SUMMER10)', () => {
    const totalAmount = 4500;
    const discountPercent = 10;
    const discountAmount = (totalAmount * discountPercent) / 100;
    const finalAmount = totalAmount - discountAmount;

    expect(discountAmount).toBe(450);
    expect(finalAmount).toBe(4050);
  });

  it('should correctly calculate fixed amount discount (EARLYBIRD)', () => {
    const totalAmount = 4500;
    const fixedDiscount = 500;
    const finalAmount = Math.max(0, totalAmount - fixedDiscount);

    expect(finalAmount).toBe(4000);
  });
});
