import { isStateEqual, type IndianState } from '../value-objects/IndianState';

export interface PricingItemInput {
  productVariantId: string;
  qty: number;
  taxRate?: number;
}

export interface VariantData {
  id: string;
  price: number;
  wholesalePrice?: number | null;
  weightGrams?: number | null;
  length?: number | null;
  width?: number | null;
  height?: number | null;
  taxRate?: number;
}

export interface CouponData {
  id: string;
  code: string;
  discountType: 'FIXED' | 'PERCENTAGE';
  discountValue: number;
  minOrderValue?: number | null;
  maxDiscount?: number | null;
}

export interface PricingResult {
  subTotal: number;
  taxTotal: number;
  cgstTotal: number;
  sgstTotal: number;
  igstTotal: number;
  shippingTotal: number;
  discountTotal: number;
  totalAmount: number;
  chargeableWeightKg: number;
  calculatedItems: Array<{
    productVariantId: string;
    qty: number;
    rate: number;
    taxRate: number;
    taxAmount: number;
    cgstAmount: number;
    sgstAmount: number;
    igstAmount: number;
    total: number;
  }>;
}

export class PricingService {
  static calculate(
    items: PricingItemInput[],
    variantsMap: Map<string, VariantData>,
    coupon: CouponData | null,
    isB2B: boolean,
    shippingState?: string | IndianState,
    sellerState?: string | IndianState
  ): PricingResult {
    let subTotalBeforeDiscount = 0;
    let discountTotal = 0;

    // 1. Calculate base subtotal to determine coupon applicability
    items.forEach(i => {
      const variant = variantsMap.get(i.productVariantId);
      if (!variant) throw new Error(`Variant ${i.productVariantId} not found`);
      const secureRate = isB2B && variant.wholesalePrice ? Number(variant.wholesalePrice) : Number(variant.price);
      subTotalBeforeDiscount += secureRate * i.qty;
    });

    // 2. Apply Coupon Logic
    if (coupon) {
      if (coupon.minOrderValue && subTotalBeforeDiscount < Number(coupon.minOrderValue)) {
        throw new Error(`Minimum order value of ${coupon.minOrderValue} required for this coupon.`);
      }
      if (coupon.discountType === "PERCENTAGE") {
        discountTotal = (subTotalBeforeDiscount * Number(coupon.discountValue)) / 100;
        if (coupon.maxDiscount && discountTotal > Number(coupon.maxDiscount)) {
          discountTotal = Number(coupon.maxDiscount);
        }
      } else {
        discountTotal = Math.min(Number(coupon.discountValue), subTotalBeforeDiscount);
      }
    }

    // 3. Calculate line items with proportional discounts and taxes
    let subTotalAfterDiscountBeforeTax = 0;
    let taxTotal = 0;
    let cgstTotal = 0;
    let sgstTotal = 0;
    let igstTotal = 0;
    let totalActualWeightKg = 0;
    let totalVolumetricWeightKg = 0;
    
    // Normalize states for comparison
    const isIntraState = isStateEqual(shippingState, sellerState);

    const round2 = (num: number) => Math.round((num + Number.EPSILON) * 100) / 100;

    const calculatedItems = items.map((i) => {
      const variant = variantsMap.get(i.productVariantId)!;
      const rate = isB2B && variant.wholesalePrice ? Number(variant.wholesalePrice) : Number(variant.price);
      const itemSubtotal = rate * i.qty;
      
      const itemDiscount = subTotalBeforeDiscount > 0 ? (itemSubtotal / subTotalBeforeDiscount) * discountTotal : 0;
      const discountedItemTotalBeforeTax = round2(itemSubtotal - itemDiscount);

      const taxRate = i.taxRate || 0;
      const taxAmount = round2((discountedItemTotalBeforeTax * taxRate) / 100);
      const itemTotal = round2(discountedItemTotalBeforeTax + taxAmount);
      
      let cgstAmount = 0;
      let sgstAmount = 0;
      let igstAmount = 0;

      if (taxAmount > 0) {
        if (isIntraState) {
          cgstAmount = round2(taxAmount / 2);
          sgstAmount = round2(taxAmount - cgstAmount);
        } else {
          igstAmount = taxAmount;
        }
      }

      subTotalAfterDiscountBeforeTax += discountedItemTotalBeforeTax;
      taxTotal += taxAmount;
      cgstTotal += cgstAmount;
      sgstTotal += sgstAmount;
      igstTotal += igstAmount;

      const actualWeightKg = ((variant.weightGrams || 0) / 1000) * i.qty;
      totalActualWeightKg += actualWeightKg;

      if (variant.length && variant.width && variant.height) {
        const volWeightKg = ((variant.length * variant.width * variant.height) / 5000) * i.qty;
        totalVolumetricWeightKg += volWeightKg;
      }

      return {
        productVariantId: i.productVariantId,
        qty: i.qty,
        rate,
        taxRate,
        taxAmount,
        cgstAmount,
        sgstAmount,
        igstAmount,
        total: itemTotal,
      };
    });

    // 4. Calculate Shipping
    const chargeableWeightKg = Math.max(totalActualWeightKg, totalVolumetricWeightKg);
    if (chargeableWeightKg > 100) {
      throw new Error("Order exceeds allowed weight for standard shipping. Please contact support.");
    }
    const shippingTotal = Math.ceil(chargeableWeightKg) * 50;
    
    const totalAmount = subTotalAfterDiscountBeforeTax + taxTotal + shippingTotal;

    return {
      subTotal: subTotalAfterDiscountBeforeTax,
      taxTotal,
      cgstTotal,
      sgstTotal,
      igstTotal,
      shippingTotal,
      discountTotal,
      totalAmount,
      chargeableWeightKg,
      calculatedItems,
    };
  }
}
