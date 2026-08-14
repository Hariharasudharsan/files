import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@/lib/infrastructure/database/prisma';
import { POST as RazorpayWebhookHandler } from '@/app/api/webhooks/razorpay/route';

describe('Webhook Replay Test', () => {
  beforeAll(async () => {
    // Clean up
    await prisma.webhookEvent.deleteMany();
    await prisma.paymentTransaction.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
  });

  it('should be idempotent and ignore replay events', async () => {
    // Generate a test order
    const order = await prisma.order.create({
      data: {
        total: 1000,
        subTotal: 1000,
        taxTotal: 0,
        shippingTotal: 0,
        discountTotal: 0,
        cgstTotal: 0,
        sgstTotal: 0,
        igstTotal: 0,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        chargeableWeightKg: 1,
        shippingAddress: { city: 'Test' },
        billingAddress: { city: 'Test' },
      }
    });

    // Create a mock request object for webhook payload
    const eventId = 'event_123';
    const reqBody = JSON.stringify({
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: 'pay_123',
            amount: 100000,
            description: order.id,
            notes: { orderId: order.id }
          }
        }
      }
    });

    const createRequest = () => {
      const headers = new Headers();
      headers.set('x-razorpay-signature', 'fake_sig'); // We need to mock signature verification in adapter, or just expect the test to hit the idempotency check first if it's already recorded.
      headers.set('x-razorpay-event-id', eventId);
      
      return new Request('http://localhost/api/webhooks/razorpay', {
        method: 'POST',
        headers,
        body: reqBody
      });
    };

    // Note: We need to mock the verification. 
    // For this integration test, let's just insert a processed webhook first to simulate replay.
    await prisma.webhookEvent.create({
      data: {
        id: eventId,
        provider: 'razorpay',
        eventType: 'payment.captured',
        payload: JSON.parse(reqBody),
        status: 'processed'
      }
    });

    const res = await RazorpayWebhookHandler(createRequest());
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.message).toBe('Webhook already processed');
  });
});
