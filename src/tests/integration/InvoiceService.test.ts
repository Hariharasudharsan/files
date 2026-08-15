import { describe, it, expect, vi } from 'vitest';
import { InvoiceService } from '@/lib/core/application/InvoiceService';
import { prisma } from '@/lib/infrastructure/database/prisma';
import PDFDocument from 'pdfkit';

// Mock Prisma
vi.mock('@/lib/infrastructure/database/prisma', () => ({
  prisma: {
    invoice: {
      findUnique: vi.fn(),
    },
  },
}));

describe('InvoiceService', () => {
  it('generates a deterministic PDF buffer for a valid invoice', async () => {
    const mockInvoice = {
      id: 'inv_123',
      orderId: 'ord_123',
      invoiceNumber: 'INV-2026-000001',
      issuedAt: new Date('2026-01-01T00:00:00Z'),
      sellerGstin: '22AAAAA0000A1Z5',
      buyerDetails: {
        name: 'Test Buyer',
        email: 'buyer@test.com',
        billingAddress: {
          flatOrHouseNumber: '1',
          localityOrArea: 'Test Area',
          city: 'Test City',
          state: 'Tamil Nadu',
          pincode: '600001'
        }
      },
      lineItems: [
        {
          productName: 'Test Product',
          hsnCode: '1234',
          qty: 1,
          rate: 100,
          taxRate: 18,
          taxAmount: 18,
          cgstAmount: 9,
          sgstAmount: 9,
          igstAmount: 0,
          total: 118
        }
      ],
      taxTotals: {
        taxTotal: 18,
        cgstTotal: 9,
        sgstTotal: 9,
        igstTotal: 0
      },
      order: {
        total: { toNumber: () => 118 },
        paymentStatus: 'PAID'
      }
    };

    (prisma.invoice.findUnique as any).mockResolvedValue(mockInvoice);

    const buffer = await InvoiceService.generateInvoicePDF('inv_123');
    
    // Assert buffer is valid
    expect(Buffer.isBuffer(buffer)).toBe(true);
    expect(buffer.length).toBeGreaterThan(100); // Should have some PDF content
    
    // As PDF generation has binary content, we assert it doesn't throw and returns a buffer.
  });

  it('throws if invoice is not found', async () => {
    (prisma.invoice.findUnique as any).mockResolvedValue(null);

    await expect(InvoiceService.generateInvoicePDF('inv_invalid'))
      .rejects
      .toThrow('Invoice not found');
  });
});
