import { NextResponse } from "next/server";
import { checkApiAdminOrManager } from "@/lib/auth/rbac";
import { updateOrderStatus } from "@/lib/repositories/order-repository";
import { z } from "zod";
import { updateOrderStatusSchema } from "@/lib/core/domain/schemas/admin";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const auth = await checkApiAdminOrManager();
    if (!auth.authorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: auth.status });
    }

    const body = await req.json();
    const { status } = updateOrderStatusSchema.parse(body);

    const order = await updateOrderStatus(id, status as any);

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
