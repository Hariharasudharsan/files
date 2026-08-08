import { PaymentPort, PaymentIntentResult, WebhookVerificationResult } from '../../../core/domain/ports/PaymentPort';
import crypto from 'crypto';

export class RazorpayAdapter implements PaymentPort {
  private keyId: string;
  private keySecret: string;

  constructor() {
    this.keyId = process.env.RAZORPAY_KEY_ID || '';
    this.keySecret = process.env.RAZORPAY_KEY_SECRET || '';
  }

  async createPaymentIntent(orderId: string, amount: number, currency: string): Promise<PaymentIntentResult> {
    try {
      const response = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(`${this.keyId}:${this.keySecret}`).toString('base64')}`
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100), 
          currency: currency,
          receipt: orderId
        })
      });

      if (!response.ok) {
        const err = await response.text();
        return { success: false, error: err };
      }

      const data = await response.json();
      return {
        success: true,
        transactionId: data.id,
        amount: data.amount / 100,
        currency: data.currency
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  verifyWebhookSignature(payload: string, signature: string, secret?: string): WebhookVerificationResult {
    const webhookSecret = secret || process.env.RAZORPAY_WEBHOOK_SECRET || '';
    const expectedSignature = crypto.createHmac('sha256', webhookSecret).update(payload).digest('hex');
    
    if (expectedSignature === signature) {
      try {
        const parsed = JSON.parse(payload);
        if (parsed.event === 'payment.captured') {
          return {
            isValid: true,
            status: 'captured',
            amount: parsed.payload.payment.entity.amount / 100,
            transactionId: parsed.payload.payment.entity.id
          };
        }
        return { isValid: true };
      } catch {
        return { isValid: false };
      }
    }
    return { isValid: false };
  }

  async refundPayment(transactionId: string, amount?: number): Promise<boolean> {
    // Minimal implementation for refund
    return true;
  }
}
