import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/modules/auth/infrastructure/authOptions";
import { prisma } from "@/lib/infrastructure/database/prisma";
import { z } from "zod";

const updateOrderStatusSchema = z.object({
  status: z.enum([
    "DRAFT", "PENDING", "AWAITING_PAYMENT", "AUTHORIZED", "PAID", 
    "CONFIRMED", "PACKED", "READY_TO_SHIP", "SHIPPED", "DELIVERED", 
    "CANCELLED", "RETURNED", "REFUNDED", "EXPIRED"
  ]),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { status } = updateOrderStatusSchema.parse(body);

    const order = await prisma.order.update({
      where: { id },
      data: { status },
    });

    // Optionally create an OutboxEvent here for async processing

    return NextResponse.json(order, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: (error as any).errors }, { status: 400 });
    }
    console.error("[PATCH /api/admin/orders]", error);
    import("@sentry/nextjs").then(Sentry => Sentry.captureException(error));
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
