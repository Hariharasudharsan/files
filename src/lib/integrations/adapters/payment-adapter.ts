import type { StorefrontOrder } from "@/lib/domain/entities/order";

export interface PaymentDetails {
  id: string;
  status: "pending" | "authorized" | "captured" | "failed";
  amount: number;
  currency: string;
}

export interface IPaymentAdapter {
  createOrder(order: StorefrontOrder): Promise<{ paymentId: string; clientSecret: string }>;
  verifyPayment(paymentId: string, signature: string): Promise<boolean>;
  fetchPaymentDetails(paymentId: string): Promise<PaymentDetails>;
}
