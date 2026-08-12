import { NextRequest, NextResponse } from "next/server";
import { OrderService } from "@/lib/core/application/OrderService";
import { Logger } from "@/lib/infrastructure/logger";
import { validateCreateOrderPayload } from "@/lib/validation/orders";

import { RateLimiter } from "@/lib/infrastructure/rate-limiter";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
  const key = `ratelimit:checkout:${ip}`;
  const limit = parseInt(process.env.RATE_LIMIT_CHECKOUT_MAX || "10");
  const windowSec = parseInt(process.env.RATE_LIMIT_CHECKOUT_WINDOW_SEC || "60");

  const { success } = await RateLimiter.check(key, limit, windowSec);
  if (!success) {
    return NextResponse.json({ error: "Too many checkout attempts. Please try again later." }, { status: 429 });
  }

  try {
    const payload = await request.json();
    const validation = validateCreateOrderPayload(payload);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: "Order request is invalid.", errors: validation.errors },
        { status: 400 },
      );
    }

    // 1. Create the order and initialize payment via OrderService
    const checkoutResult = await OrderService.checkout({
      contact: validation.data.contact,
      items: validation.data.items,
    });

    if (!checkoutResult.paymentIntent.success) {
      throw new Error(checkoutResult.paymentIntent.error || "Payment initialization failed");
    }

    Logger.info("Payment session initialized", { 
      orderId: checkoutResult.orderId, 
      razorpayOrderId: checkoutResult.paymentIntent.transactionId 
    });

    return NextResponse.json({ 
      success: true, 
      orderId: checkoutResult.orderId,
      razorpayOrderId: checkoutResult.paymentIntent.transactionId,
      amount: checkoutResult.paymentIntent.amount,
      currency: checkoutResult.paymentIntent.currency,
      key: process.env.RAZORPAY_KEY_ID
    }, { status: 200 });
  } catch (err) {
    Logger.error("Init payment failed", { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json(
      { error: "Could not initialize payment right now. Please try again." },
      { status: 500 },
    );
  }
}
