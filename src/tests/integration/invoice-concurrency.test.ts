import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@/lib/infrastructure/database/prisma';
import { OrderService } from '@/lib/core/application/OrderService';
import { PaymentStatus, OrderStatus } from '@prisma/client';

describe('Invoice Sequence Concurrency', () => {
  beforeAll(async () => {
    // Clean up
    await prisma.invoice.deleteMany();
    await prisma.invoiceSequence.deleteMany();
    await prisma.paymentTransaction.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
  });

  it('should generate unique invoice numbers under concurrent requests', async () => {
    const orders = [];
    for (let i = 0; i < 5; i++) {
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
          status: OrderStatus.CREATED,
          paymentStatus: PaymentStatus.PENDING,
          chargeableWeightKg: 1,
          shippingAddress: { city: 'Test' },
          billingAddress: { city: 'Test' },
        }
      });
      orders.push(order);
    }

    const promises = orders.map((order, idx) => 
      OrderService.confirmPayment(order.id, 1000, `txn_${idx}`)
    );

    await Promise.all(promises);

    const invoices = await prisma.invoice.findMany();
    expect(invoices.length).toBe(5);

    const invoiceNumbers = invoices.map(i => i.invoiceNumber);
    const uniqueNumbers = new Set(invoiceNumbers);
    
    expect(uniqueNumbers.size).toBe(5);
  });
});
