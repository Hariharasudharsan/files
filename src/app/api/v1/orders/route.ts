import { NextRequest, NextResponse } from "next/server";
import { OrderService } from "@/lib/core/application/OrderService";
import { validateCreateOrderPayload } from "@/lib/validation/orders";
import { withErrorHandler } from "@/lib/core/api/withErrorHandler";
import { ApiError } from "@/lib/core/errors/ApiError";

export const POST = withErrorHandler(async (request: NextRequest) => {
  const validation = validateCreateOrderPayload(await request.json());
  if (!validation.success) {
    throw ApiError.badRequest("Order request is invalid.", validation.errors);
  }

  const result = await OrderService.checkout(validation.data);
  return NextResponse.json({ success: true, orderId: result.orderId, paymentIntent: result.paymentIntent }, { status: 202 });
});
