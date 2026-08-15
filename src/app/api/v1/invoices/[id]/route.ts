import { NextResponse } from "next/server";
import { InvoiceService } from "@/lib/core/application/InvoiceService";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/infrastructure/auth/auth-options";
import { prisma } from "@/lib/infrastructure/database/prisma";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify ownership or admin role
    const invoice = await prisma.invoice.findUnique({
      where: { id: params.id },
      include: { order: true }
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    if (invoice.order.userId !== session.user.id) {
      // In a real app, also check if user is ADMIN
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const pdfBuffer = await InvoiceService.generateInvoicePDF(params.id);

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${invoice.invoiceNumber}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error("Invoice generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate invoice" },
      { status: 500 }
    );
  }
}
