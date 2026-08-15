import { describe, it, expect } from 'vitest';
import { validateCreateOrderPayload } from '@/lib/validation/orders';

describe('validateCreateOrderPayload', () => {
  const validPayload = {
    items: [{ item_code: 'v1', qty: 1 }],
    contact: {
      name: 'Test User',
      email: 'test@example.com',
      phone: '9876543210',
      flatOrHouseNumber: '123',
      localityOrArea: 'Main Street',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '600001',
      gstin: '22AAAAA0000A1Z5'
    }
  };

  it('validates a correct payload', () => {
    const result = validateCreateOrderPayload(validPayload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.contact.gstin).toBe('22AAAAA0000A1Z5');
      expect(result.data.contact.state).toBe('Tamil Nadu');
    }
  });

  it('fails if state is invalid', () => {
    const payload = {
      ...validPayload,
      contact: { ...validPayload.contact, state: 'Invalid State' }
    };
    const result = validateCreateOrderPayload(payload);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors).toContain('A valid Indian state is required.');
    }
  });

  it('fails if GSTIN is invalid', () => {
    const payload = {
      ...validPayload,
      contact: { ...validPayload.contact, gstin: 'INVALID_GSTIN' }
    };
    const result = validateCreateOrderPayload(payload);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors).toContain('Invalid GSTIN format.');
    }
  });

  it('passes if GSTIN is omitted (optional)', () => {
    const { gstin, ...contactWithoutGstin } = validPayload.contact;
    const payload = {
      ...validPayload,
      contact: contactWithoutGstin
    };
    const result = validateCreateOrderPayload(payload);
    expect(result.success).toBe(true);
  });
});
