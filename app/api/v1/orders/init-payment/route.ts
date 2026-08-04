import { NextRequest, NextResponse } from "next/server";
import { createStorefrontOrder } from "@/lib/repositories/order-repository";
import { initializePayment } from "@/lib/integrations/payments/razorpay";
import { Logger } from "@/lib/infrastructure/logger";
import { validateCreateOrderPayload } from "@/lib/validation/orders";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const validation = validateCreateOrderPayload(payload);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: "Order request is invalid.", errors: validation.errors },
        { status: 400 },
      );
    }

    // 1. Create the order in PostgreSQL (Status: PENDING, PaymentStatus: UNPAID)
    const order = await createStorefrontOrder(validation.data);

    // 2. Initialize Razorpay Payment
    const paymentInit = await initializePayment(order);

    Logger.info("Payment session initialized", { 
      orderId: order.id, 
      razorpayOrderId: paymentInit.orderId 
    });

    return NextResponse.json({ 
      success: true, 
      orderId: order.id,
      razorpayOrderId: paymentInit.orderId,
      amount: paymentInit.amount,
      currency: paymentInit.currency,
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
