import { prisma } from "@/lib/infrastructure/database/prisma";
import PDFDocument from 'pdfkit';

export class InvoiceService {
  static async generateInvoicePDF(invoiceId: string): Promise<Buffer> {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { order: true }
    });

    if (!invoice) throw new Error("Invoice not found");

    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const buffers: Buffer[] = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => resolve(Buffer.concat(buffers)));

        // Header
        doc.fontSize(20).text("TAX INVOICE", { align: 'center' });
        doc.moveDown();

        const buyerDetails = invoice.buyerDetails as any;
        const lineItems = invoice.lineItems as any[];
        const taxTotals = invoice.taxTotals as any;

        // Seller & Invoice Details
        doc.fontSize(10);
        doc.text(`Invoice Number: ${invoice.invoiceNumber}`);
        doc.text(`Invoice Date: ${invoice.issuedAt.toLocaleDateString()}`);
        doc.text(`Order Reference: ${invoice.orderId}`);
        if (invoice.sellerGstin) {
          doc.text(`Seller GSTIN: ${invoice.sellerGstin}`);
        }
        doc.moveDown();

        // Buyer Details
        doc.fontSize(12).text("Billed To:", { underline: true });
        doc.fontSize(10);
        doc.text(`Name: ${buyerDetails?.name || 'N/A'}`);
        doc.text(`Email: ${buyerDetails?.email || 'N/A'}`);
        if (buyerDetails?.gstin) {
          doc.text(`Buyer GSTIN: ${buyerDetails.gstin}`);
        }
        if (buyerDetails?.billingAddress) {
          const addr = buyerDetails.billingAddress;
          doc.text(`Address: ${addr.flatOrHouseNumber}, ${addr.localityOrArea}, ${addr.city}, ${addr.state} - ${addr.pincode}`);
        }
        doc.moveDown();

        const formatCurrency = (amount: number) => `Rs ${amount.toFixed(2)}`;

        // Line Items Table Header
        const tableTop = doc.y;
        doc.font('Helvetica-Bold');
        doc.text("Item", 50, tableTop);
        doc.text("HSN", 180, tableTop);
        doc.text("Qty", 220, tableTop);
        doc.text("Rate", 250, tableTop);
        doc.text("Tax", 300, tableTop);
        doc.text("CGST", 350, tableTop);
        doc.text("SGST", 400, tableTop);
        doc.text("IGST", 450, tableTop);
        doc.text("Total", 500, tableTop, { align: 'right' });
        
        doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();
        doc.font('Helvetica');

        let y = tableTop + 25;

        // Line Items
        lineItems.forEach((item: any) => {
          doc.text(item.productName.substring(0, 20), 50, y);
          doc.text(item.hsnCode || '-', 180, y);
          doc.text(item.qty.toString(), 220, y);
          doc.text(`${item.rate.toFixed(2)}`, 250, y);
          doc.text(`${item.taxRate}%`, 300, y);
          doc.text(`${item.cgstAmount > 0 ? item.cgstAmount.toFixed(2) : '-'}`, 350, y);
          doc.text(`${item.sgstAmount > 0 ? item.sgstAmount.toFixed(2) : '-'}`, 400, y);
          doc.text(`${item.igstAmount > 0 ? item.igstAmount.toFixed(2) : '-'}`, 450, y);
          doc.text(`${item.total.toFixed(2)}`, 500, y, { align: 'right' });
          y += 20;
        });

        doc.moveTo(50, y).lineTo(550, y).stroke();
        y += 15;

        // Tax Summary
        doc.font('Helvetica-Bold');
        doc.text("Tax Breakdown:", 50, y);
        doc.font('Helvetica');
        y += 15;
        doc.text(`CGST Total: ${formatCurrency(taxTotals.cgstTotal)}`, 50, y);
        y += 15;
        doc.text(`SGST Total: ${formatCurrency(taxTotals.sgstTotal)}`, 50, y);
        y += 15;
        doc.text(`IGST Total: ${formatCurrency(taxTotals.igstTotal)}`, 50, y);
        y += 15;
        doc.font('Helvetica-Bold');
        doc.text(`Grand Total: ${formatCurrency(invoice.order.total.toNumber())}`, 50, y);
        
        // Payment Status
        doc.moveDown(2);
        doc.text(`Payment Status: ${invoice.order.paymentStatus}`, 50);

        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  }
}
