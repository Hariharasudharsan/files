import { describe, it, expect } from 'vitest';
import { isStateEqual, IndianStates } from '@/lib/core/domain/value-objects/IndianState';

describe('IndianState', () => {
  it('should validate exact matches', () => {
    expect(isStateEqual('Tamil Nadu', 'Tamil Nadu')).toBe(true);
  });

  it('should validate case-insensitive matches', () => {
    expect(isStateEqual('tamil nadu', 'Tamil Nadu')).toBe(true);
    expect(isStateEqual('TAMIL NADU', 'tamil nadu')).toBe(true);
  });

  it('should validate with trailing spaces', () => {
    expect(isStateEqual('Tamil Nadu ', ' Tamil Nadu')).toBe(true);
  });

  it('should reject different states', () => {
    expect(isStateEqual('Tamil Nadu', 'Kerala')).toBe(false);
  });

  it('should reject missing states', () => {
    expect(isStateEqual('Tamil Nadu', undefined)).toBe(false);
    expect(isStateEqual(undefined, undefined)).toBe(false);
  });

  it('contains expected states', () => {
    expect(IndianStates).toContain('Tamil Nadu');
    expect(IndianStates).toContain('Maharashtra');
    expect(IndianStates).toContain('Delhi');
  });

  it('validates GSTIN structure', () => {
    const validGstin = "22AAAAA0000A1Z5";
    const invalidGstin1 = "22AAAAA0000A1Z"; // too short
    const invalidGstin2 = "XXAAAAA0000A1Z5"; // invalid state code

    const regex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    
    expect(regex.test(validGstin)).toBe(true);
    expect(regex.test(invalidGstin1)).toBe(false);
    expect(regex.test(invalidGstin2)).toBe(false);
  });
});
