export interface PaymentIntentResult {
  success: boolean;
  transactionId?: string; // Provider's ID (e.g. razorpay_order_id)
  amount?: number;
  currency?: string;
  error?: string;
}

export interface WebhookVerificationResult {
  isValid: boolean;
  orderId?: string;
  transactionId?: string;
  amount?: number;
  status?: 'captured' | 'failed' | 'authorized';
}

export interface PaymentPort {
  /**
   * Initialize a payment intent with the provider.
   * For Razorpay, this creates a Razorpay Order.
   */
  createPaymentIntent(orderId: string, amount: number, currency: string): Promise<PaymentIntentResult>;

  /**
   * Verify an incoming webhook payload to ensure it is authentic.
   */
  verifyWebhookSignature(payload: string, signature: string, secret?: string): WebhookVerificationResult;

  /**
   * Refund a captured payment.
   */
  refundPayment(transactionId: string, amount?: number): Promise<boolean>;
}
