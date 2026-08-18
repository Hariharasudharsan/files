import { NextResponse } from "next/server";
import { InvoiceService } from "@/lib/core/application/InvoiceService";
import { getServerSession } from "next-auth";
import { authOptions } from "@/modules/auth/infrastructure/authOptions";
import { prisma } from "@/lib/infrastructure/database/prisma";

import { RateLimiter } from "@/lib/infrastructure/rate-limiter";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
  const { success } = await RateLimiter.check(`ratelimit:invoices:${ip}`, 50, 60);
  if (!success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify ownership or admin role
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: { order: true }
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const isOwner = invoice.order.userId === session.user.id;
    const isAdmin = session.user.role?.name === "ADMIN" || session.user.role?.name === "MANAGER";

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const pdfBuffer = await InvoiceService.generateInvoicePDF(id);

    return new NextResponse(pdfBuffer as any, {
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
