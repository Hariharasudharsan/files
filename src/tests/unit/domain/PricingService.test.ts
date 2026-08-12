import { describe, it, expect } from 'vitest';
import { PricingService, VariantData, CouponData } from '@/lib/core/domain/services/PricingService';

describe('PricingService', () => {
  const variantsMap = new Map<string, VariantData>([
    ['v1', { id: 'v1', price: 100, wholesalePrice: 80, weightGrams: 500 }],
    ['v2', { id: 'v2', price: 200, wholesalePrice: 150, length: 10, width: 10, height: 10 }]
  ]);

  it('should calculate standard pricing correctly (B2C, no coupon, standard weight)', () => {
    const items = [
      { productVariantId: 'v1', qty: 2, taxRate: 10 }, // sub: 200, tax: 20
      { productVariantId: 'v2', qty: 1, taxRate: 10 }  // sub: 200, tax: 20
    ];

    // Weight v1: 2 * 0.5kg = 1kg
    // Weight v2: (10*10*10)/5000 = 0.2kg
    // Total chargeable = max(1, 0.2) = 1kg -> shipping = 50

    const result = PricingService.calculate(items, variantsMap, null, false);
    
    expect(result.subTotal).toBe(400); // 200 + 200
    expect(result.taxTotal).toBe(40); // 10% of 400
    expect(result.shippingTotal).toBe(50); // 1kg * 50
    expect(result.discountTotal).toBe(0);
    expect(result.totalAmount).toBe(490); // 400 + 40 + 50
    expect(result.chargeableWeightKg).toBe(1);
    expect(result.calculatedItems).toHaveLength(2);
  });

  it('should apply B2B wholesale pricing', () => {
    const items = [{ productVariantId: 'v1', qty: 1, taxRate: 0 }];
    const result = PricingService.calculate(items, variantsMap, null, true);
    
    expect(result.subTotal).toBe(80); // wholesale price
    expect(result.shippingTotal).toBe(50); // 0.5kg -> 1kg -> 50
    expect(result.totalAmount).toBe(130);
  });

  it('should apply percentage coupon with max limit', () => {
    const items = [{ productVariantId: 'v2', qty: 5, taxRate: 0 }]; // 1000 total
    const coupon: CouponData = {
      id: 'c1', code: 'SAVE50', discountType: 'PERCENTAGE', discountValue: 50, maxDiscount: 200
    };
    
    const result = PricingService.calculate(items, variantsMap, coupon, false);
    
    // Subtotal: 1000
    // Discount: 50% = 500, capped at 200
    expect(result.discountTotal).toBe(200);
    expect(result.subTotal).toBe(800); // 1000 - 200
  });

  it('should throw if min order value is not met for coupon', () => {
    const items = [{ productVariantId: 'v1', qty: 1 }]; // subtotal 100
    const coupon: CouponData = {
      id: 'c2', code: 'MIN500', discountType: 'FIXED', discountValue: 50, minOrderValue: 500
    };

    expect(() => PricingService.calculate(items, variantsMap, coupon, false))
      .toThrowError(/Minimum order value/);
  });

  it('should split tax into CGST and SGST for intra-state (same state)', () => {
    const items = [{ productVariantId: 'v1', qty: 1, taxRate: 18 }]; // price: 100, tax: 18
    const result = PricingService.calculate(items, variantsMap, null, false, 'Tamil Nadu', 'Tamil Nadu');
    
    expect(result.taxTotal).toBe(18);
    expect(result.cgstTotal).toBe(9);
    expect(result.sgstTotal).toBe(9);
    expect(result.igstTotal).toBe(0);
    expect(result.calculatedItems[0].cgstAmount).toBe(9);
    expect(result.calculatedItems[0].sgstAmount).toBe(9);
    expect(result.calculatedItems[0].igstAmount).toBe(0);
  });

  it('should allocate full tax to IGST for inter-state (different state)', () => {
    const items = [{ productVariantId: 'v1', qty: 1, taxRate: 18 }]; // price: 100, tax: 18
    const result = PricingService.calculate(items, variantsMap, null, false, 'Karnataka', 'Tamil Nadu');
    
    expect(result.taxTotal).toBe(18);
    expect(result.cgstTotal).toBe(0);
    expect(result.sgstTotal).toBe(0);
    expect(result.igstTotal).toBe(18);
    expect(result.calculatedItems[0].cgstAmount).toBe(0);
    expect(result.calculatedItems[0].sgstAmount).toBe(0);
    expect(result.calculatedItems[0].igstAmount).toBe(18);
  });
});
