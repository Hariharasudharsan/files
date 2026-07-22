import { NextRequest, NextResponse } from "next/server";
import { createOrder } from "@/lib/services/order-service";
import { logger } from "@/lib/utils/logger";
import { validateCreateOrderPayload } from "@/lib/validation/orders";

export async function POST(request: NextRequest) {
  try {
    const validation = validateCreateOrderPayload(await request.json());
    if (!validation.success) {
      return NextResponse.json(
        { error: "Order request is invalid.", errors: validation.errors },
        { status: 400 }
      );
    }

    const result = await createOrder(validation.data);
    return NextResponse.json({ success: true, order: result.order }, { status: 202 });
  } catch (err) {
    logger.error("Order API failed", { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json(
      { error: "Could not place your order right now. Please try again." },
      { status: 500 }
    );
  }
}
