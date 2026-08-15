import { NextResponse } from "next/server";
import { prisma } from "@/lib/infrastructure/database/prisma";
import { WhatsAppService } from "@/lib/core/application/whatsapp-service";

export async function POST() {
  try {
    // In a real application, you'd track abandoned carts using a Cart model or Session.
    // For this demonstration, we'll assume we look up Draft Orders older than 2 hours.
    
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    
    const abandonedOrders = await prisma.order.findMany({
      where: {
        status: "CREATED",
        updatedAt: { lte: twoHoursAgo },
        user: {
          phone: { not: null },
          // Should also check notificationPreferences here if implemented
        }
      },
      include: { user: true }
    });

    const waService = new WhatsAppService();
    let sentCount = 0;

    for (const order of abandonedOrders as any) {
      if (order.user?.phone) {
        // Send recovery message
        const checkoutUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/checkout?recovery=${order.id}`;
        await waService.sendAbandonedCartRecovery(order.user.phone, checkoutUrl);
        sentCount++;

        // Update status or log to prevent double sending
        await prisma.order.update({
          where: { id: order.id },
          data: { status: "PAYMENT_PENDING" } // change status to avoid picking up again
        });
      }
    }

    return NextResponse.json({ message: `Successfully sent ${sentCount} abandoned cart recovery messages.` });
  } catch (error: any) {
    console.error("Abandoned Cart Cron Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
