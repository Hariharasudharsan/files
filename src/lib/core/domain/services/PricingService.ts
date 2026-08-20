import { isStateEqual, type IndianState } from '../value-objects/IndianState';

export interface PricingItemInput {
  productVariantId: string;
  qty: number;
  taxRate?: number;
  bundleRuleId?: string;
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

export interface BundleData {
  id: string;
  price: number;
  size: number;
}

export class PricingService {
  static calculate(
    items: PricingItemInput[],
    variantsMap: Map<string, VariantData>,
    coupon: CouponData | null,
    isB2B: boolean,
    bundlesMap?: Map<string, BundleData>,
    shippingState?: string | IndianState,
    sellerState?: string | IndianState,
    prepaidDiscountPercentage?: number,
    shippingBaseRate?: number,
    b2bMinOrderValue?: number,
    b2bMinOrderQty?: number
  ): PricingResult {
    let subTotalBeforeDiscount = 0;
    let discountTotal = 0;

    // Evaluate B2B threshold
    let b2bActive = isB2B;
    if (b2bActive && (b2bMinOrderValue || b2bMinOrderQty)) {
      // Calculate provisional totals to check thresholds
      let totalQty = 0;
      let provisionalB2bValue = 0;
      items.forEach(i => {
        totalQty += i.qty;
        if (!i.bundleRuleId) {
          const variant = variantsMap.get(i.productVariantId);
          if (variant) {
            const rate = variant.wholesalePrice ? Number(variant.wholesalePrice) : Number(variant.price);
            provisionalB2bValue += rate * i.qty;
          }
        }
      });
      if (b2bMinOrderQty && totalQty < b2bMinOrderQty) b2bActive = false;
      if (b2bMinOrderValue && provisionalB2bValue < b2bMinOrderValue) b2bActive = false;
    }

    // Track bundle totals to determine proportional discounts
    const bundleTotals = new Map<string, { qty: number, price: number }>();
    if (bundlesMap) {
      items.forEach(i => {
        if (i.bundleRuleId) {
          const bundle = bundlesMap.get(i.bundleRuleId);
          if (bundle) {
            const current = bundleTotals.get(i.bundleRuleId) || { qty: 0, price: bundle.price };
            current.qty += i.qty;
            bundleTotals.set(i.bundleRuleId, current);
          }
        }
      });
    }

    // 1. Calculate base subtotal to determine coupon applicability
    items.forEach(i => {
      if (i.bundleRuleId && bundlesMap?.has(i.bundleRuleId)) {
        // Bundle items are priced proportionally later
        return;
      }
      
      const variant = variantsMap.get(i.productVariantId);
      if (!variant) throw new Error(`Variant ${i.productVariantId} not found`);
      const secureRate = b2bActive && variant.wholesalePrice ? Number(variant.wholesalePrice) : Number(variant.price);
      subTotalBeforeDiscount += secureRate * i.qty;
    });

    // Add bundle totals to subtotal
    bundleTotals.forEach((data, bundleId) => {
       const bundle = bundlesMap!.get(bundleId)!;
       const fullBundles = Math.floor(data.qty / bundle.size);
       subTotalBeforeDiscount += fullBundles * bundle.price;
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

    if (prepaidDiscountPercentage && prepaidDiscountPercentage > 0) {
      discountTotal += (subTotalBeforeDiscount * prepaidDiscountPercentage) / 100;
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
      let rate = b2bActive && variant.wholesalePrice ? Number(variant.wholesalePrice) : Number(variant.price);
      let itemSubtotal = rate * i.qty;

      // Bundle Logic
      if (i.bundleRuleId && bundlesMap?.has(i.bundleRuleId)) {
        const bundle = bundlesMap.get(i.bundleRuleId)!;
        const bundleData = bundleTotals.get(i.bundleRuleId)!;
        
        // Calculate the proportional price of this item within the bundle
        // Simplified: divide bundle price evenly among items in the bundle
        const pricePerItem = bundle.price / bundle.size;
        rate = pricePerItem;
        itemSubtotal = pricePerItem * i.qty;
      }
      
      const itemDiscount = subTotalBeforeDiscount > 0 ? (itemSubtotal / subTotalBeforeDiscount) * discountTotal : 0;
      const discountedItemTotalBeforeTax = round2(itemSubtotal - itemDiscount);

      const taxRate = i.taxRate ?? variant.taxRate ?? 0;
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
    const baseRate = shippingBaseRate !== undefined ? shippingBaseRate : 50;
    let shippingTotal = Math.ceil(chargeableWeightKg) * baseRate;
    
    // Free shipping threshold — uses pre-discount subtotal, matching client-side logic
    if (subTotalBeforeDiscount > 999) {
      shippingTotal = 0;
    }

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
