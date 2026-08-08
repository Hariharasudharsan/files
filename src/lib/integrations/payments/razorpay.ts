import Razorpay from "razorpay";
import crypto from "crypto";
import type { StorefrontOrder } from "@/lib/domain/entities/order";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

export interface PaymentInitResult {
  orderId: string;
  amount: number;
  currency: string;
}

/**
 * Initializes a payment session by creating an Order in Razorpay.
 */
export async function initializePayment(order: StorefrontOrder): Promise<PaymentInitResult> {
  const amountInPaise = Math.round(order.total * 100);

  const razorpayOrder = await razorpay.orders.create({
    amount: amountInPaise,
    currency: "INR",
    receipt: order.id,
  });

  return {
    orderId: razorpayOrder.id, // This is the razorpay_order_id
    amount: amountInPaise,
    currency: "INR",
  };
}

/**
 * Verifies the payment signature returned by Razorpay.
 */
export function verifyPaymentSignature(paymentId: string, orderId: string, signature: string): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET || "";
  
  const generatedSignature = crypto
    .createHmac("sha256", secret)
    .update(orderId + "|" + paymentId)
    .digest("hex");

  return generatedSignature === signature;
}

/**
 * Creates a refund in Razorpay.
 */
export async function createRefund(paymentId: string, amount: number, receipt?: string) {
  const amountInPaise = Math.round(amount * 100);
  
  return await razorpay.payments.refund(paymentId, {
    amount: amountInPaise,
    receipt,
  });
}

