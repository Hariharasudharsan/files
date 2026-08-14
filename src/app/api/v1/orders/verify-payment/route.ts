import { NextRequest, NextResponse } from "next/server";
import { RazorpayAdapter } from "@/lib/infrastructure/adapters/payment/RazorpayAdapter";
import { prisma } from "@/lib/infrastructure/database/prisma";
import { Logger } from "@/lib/infrastructure/logger";
import { eventBus } from "@/lib/infrastructure/events/EventBus";
import { OrderPaidEvent } from "@/lib/core/domain/events/DomainEvent";
import { OrderStatus, PaymentStatus } from "@prisma/client";
import { getServerEnv } from "@/lib/core/config/env";

import { RateLimiter } from "@/lib/infrastructure/rate-limiter";
import { OrderService } from "@/lib/core/application/OrderService";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
  const key = `ratelimit:verify_payment:${ip}`;
  const limit = parseInt(process.env.RATE_LIMIT_CHECKOUT_MAX || "10");
  const windowSec = parseInt(process.env.RATE_LIMIT_CHECKOUT_WINDOW_SEC || "60");

  const { success } = await RateLimiter.check(key, limit, windowSec);
  if (!success) {
    return NextResponse.json({ error: "Too many payment verification attempts." }, { status: 429 });
  }

  try {
    const payload = await request.json();
    const { orderId, razorpay_payment_id, razorpay_order_id, razorpay_signature } = payload;

    if (!orderId || !razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Verify Signature
    const adapter = new RazorpayAdapter();
    const isValid = adapter.verifyPaymentSignature(razorpay_payment_id, razorpay_order_id, razorpay_signature);
    
    if (!isValid) {
      Logger.error("Payment signature verification failed", { orderId, razorpay_payment_id });
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    const currentOrder = await prisma.order.findUnique({
      where: { id: orderId },
      select: { total: true }
    });

    if (!currentOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const result = await OrderService.confirmPayment(orderId, currentOrder.total.toNumber(), razorpay_payment_id);
    
    if (result.message === "Race condition mitigated") {
      Logger.info("Verify payment race condition caught", { orderId, razorpay_payment_id });
    }

    Logger.info("Payment verified and order confirmed", { orderId, razorpay_payment_id });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    Logger.error("Verify payment failed", { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json(
      { error: "Could not verify payment right now. Please try again or contact support." },
      { status: 500 },
    );
  }
}
