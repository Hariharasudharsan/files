import { describe, it, expect } from 'vitest';
import { PricingService, VariantData } from '@/lib/core/domain/services/PricingService';

describe('PricingService', () => {
  const variantsMap = new Map<string, VariantData>([
    ['v1', { id: 'v1', price: 100, taxRate: 18, weightGrams: 500 }],
    ['v2', { id: 'v2', price: 250, taxRate: 5, weightGrams: 1000 }]
  ]);

  it('calculates CGST and SGST correctly for intra-state orders', () => {
    const result = PricingService.calculate(
      [{ productVariantId: 'v1', qty: 2 }],
      variantsMap,
      null,
      false,
      new Map(),
      'Tamil Nadu',
      'Tamil Nadu'
    );

    // Subtotal: 2 * 100 = 200
    // Tax: 18% of 200 = 36
    // CGST: 18, SGST: 18, IGST: 0
    expect(result.subTotal).toBe(200);
    expect(result.taxTotal).toBe(36);
    expect(result.cgstTotal).toBe(18);
    expect(result.sgstTotal).toBe(18);
    expect(result.igstTotal).toBe(0);
    expect(result.totalAmount).toBe(200 + 36 + 50); // Shipping is 50 for 1kg
  });

  it('calculates IGST correctly for inter-state orders', () => {
    const result = PricingService.calculate(
      [{ productVariantId: 'v1', qty: 2 }],
      variantsMap,
      null,
      false,
      new Map(),
      'Karnataka',
      'Tamil Nadu'
    );

    // Subtotal: 200
    // Tax: 36
    // CGST: 0, SGST: 0, IGST: 36
    expect(result.cgstTotal).toBe(0);
    expect(result.sgstTotal).toBe(0);
    expect(result.igstTotal).toBe(36);
  });

  it('handles zero tax items correctly', () => {
    const zeroTaxVariants = new Map<string, VariantData>([
      ['v3', { id: 'v3', price: 100, taxRate: 0, weightGrams: 500 }]
    ]);

    const result = PricingService.calculate(
      [{ productVariantId: 'v3', qty: 1 }],
      zeroTaxVariants,
      null,
      false,
      new Map(),
      'Tamil Nadu',
      'Tamil Nadu'
    );

    expect(result.taxTotal).toBe(0);
    expect(result.cgstTotal).toBe(0);
    expect(result.sgstTotal).toBe(0);
    expect(result.igstTotal).toBe(0);
  });

  it('handles discounts and rounds correctly before tax', () => {
    const result = PricingService.calculate(
      [{ productVariantId: 'v1', qty: 2 }], // 200
      variantsMap,
      { id: 'c1', code: 'PROMO10', discountType: 'PERCENTAGE', discountValue: 10 },
      false,
      new Map(),
      'Tamil Nadu',
      'Tamil Nadu'
    );

    // Subtotal before discount: 200
    // Discount: 10% of 200 = 20
    // Subtotal after discount: 180
    // Tax: 18% of 180 = 32.4
    // CGST: 16.2, SGST: 16.2
    expect(result.discountTotal).toBe(20);
    expect(result.subTotal).toBe(180);
    expect(result.taxTotal).toBe(32.4);
    expect(result.cgstTotal).toBe(16.2);
    expect(result.sgstTotal).toBe(16.2);
  });
});
