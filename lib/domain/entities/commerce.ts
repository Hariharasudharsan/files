export interface Address {
  id: string;
  customerId: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
}

export interface Review {
  id: string;
  productId: string;
  customerId: string;
  rating: number;
  comment: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  isActive: boolean;
}
