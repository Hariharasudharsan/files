import type { CreateOrderInput } from "@/lib/domain/entities/order";
import { postJson } from "@/lib/api/http";

export interface InitPaymentResponse {
  success: true;
  orderId: string;
  razorpayOrderId: string;
  amount: number;
  currency: string;
  key: string;
}

export function initPaymentRequest(input: CreateOrderInput): Promise<InitPaymentResponse> {
  return postJson<InitPaymentResponse, CreateOrderInput>("/api/v1/orders/init-payment", input);
}

export interface VerifyPaymentInput {
  orderId: string;
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface VerifyPaymentResponse {
  success: true;
}

export function verifyPaymentRequest(input: VerifyPaymentInput): Promise<VerifyPaymentResponse> {
  return postJson<VerifyPaymentResponse, VerifyPaymentInput>("/api/v1/orders/verify-payment", input);
}
