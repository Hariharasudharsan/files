/**
 * Razorpay Integration Service Stub
 * 
 * This file serves as the architectural boundary for future Razorpay integration.
 * Currently, it simulates order creation for the checkout flow without actual payment processing.
 */

import type { StorefrontOrder } from "@/lib/domain/models/order";

export interface PaymentInitResult {
  orderId: string;
  amount: number;
  currency: string;
}

/**
 * Mocks the initialization of a payment session.
 * @todo Implement actual Razorpay Order API call here.
 */
export async function initializePayment(order: StorefrontOrder): Promise<PaymentInitResult> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  
  return {
    orderId: `rzp_mock_${order.id}`,
    amount: order.total * 100, // Amount in paise
    currency: "INR"
  };
}

/**
 * Mocks the verification of a payment signature.
 * @todo Implement actual crypto verification using Razorpay secret.
 */
export function verifyPaymentSignature(paymentId: string, orderId: string, signature: string): boolean {
  console.log("Mock verifying signature", { paymentId, orderId, signature });
  return true;
}
