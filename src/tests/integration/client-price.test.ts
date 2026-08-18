import { describe, it, expect, beforeAll } from 'vitest';
import { OrderService } from '@/lib/core/application/OrderService';
import { prisma } from '@/lib/infrastructure/database/prisma';

describe('Client Price Manipulation Test', () => {
  beforeAll(async () => {
    // Clean up
    await prisma.productVariant.deleteMany();
    await prisma.product.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
  });

  it('should ignore client-provided prices and calculate total from database', async () => {
    // 1. Create a product and variant in DB with actual price
    const product = await prisma.product.create({
      data: {
        name: 'Test Product',
        slug: 'test-product',
        gstRate: 5,
        variants: {
          create: {
            name: 'Test Variant',
            itemCode: 'TEST-SKU',
            price: 100, // Actual price is 100
            weightGrams: 100,
          }
        }
      },
      include: { variants: true }
    });

    const variant = product.variants[0];

    // Create a warehouse
    const warehouse = await prisma.warehouse.upsert({
      where: { code: 'TEST-WH' },
      update: {},
      create: {
        code: 'TEST-WH',
        name: 'Test Warehouse',
        location: 'Test City'
      }
    });

    // Give it some stock
    await prisma.inventoryLevel.create({
      data: {
        productVariantId: variant.id,
        warehouseId: warehouse.id,
        available: 10
      }
    });

    // 2. Client sends an order payload (without rate, because it's been removed from DTO, but we simulate standard order)
    const dto = {
      contact: {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '1234567890',
        flatOrHouseNumber: '1',
        localityOrArea: 'Area',
        city: 'City',
        state: 'State',
        pincode: '123456',
      },
      items: [
        { productVariantId: variant.id, qty: 2 } // No rate parameter accepted here anyway
      ]
    };

    const checkoutResult = await OrderService.checkout(dto);

    // 3. Verify that the total is calculated based on the DB price (100) and not manipulated
    const order = await prisma.order.findUnique({
      where: { id: checkoutResult.orderId }
    });

    expect(order).not.toBeNull();
    // Subtotal should be 100 * 2 = 200
    expect(order!.subTotal.toNumber()).toBe(200);

    // Tax is 5% of 200 = 10
    expect(order!.taxTotal.toNumber()).toBe(10);
  });
});
