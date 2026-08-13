export interface Address {
  id: string;
  customerId: string;
  flatOrHouseNumber: string;
  localityOrArea: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  authorName?: string;
  rating: number;
  title?: string;
  comment?: string;
  isApproved?: boolean;
  createdAt?: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  minOrderValue?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usedCount: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
}
