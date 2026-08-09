import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/infrastructure/database/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const orderId = searchParams.get('orderId');
    const email = searchParams.get('email');

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        shipments: {
          orderBy: { createdAt: 'desc' }
        },
      }
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Basic security check: if email is provided, it must match the order's user email or shipping address email
    if (email) {
      const orderEmail = order.user?.email;
      const shippingEmail = (order.shippingAddress as any)?.email;
      if (email.toLowerCase() !== orderEmail?.toLowerCase() && email.toLowerCase() !== shippingEmail?.toLowerCase()) {
        return NextResponse.json({ error: "Unauthorized or Order not found" }, { status: 401 });
      }
    }

    return NextResponse.json({ success: true, order }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: "Could not fetch order tracking info." },
      { status: 500 },
    );
  }
}
