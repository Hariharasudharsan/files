import { NextResponse } from 'next/server';
import { prisma } from "@/lib/infrastructure/database/prisma";
import { Logger } from "@/lib/infrastructure/logger";
import { eventBus } from "@/lib/infrastructure/events/EventBus";
import { ShipmentStatusUpdatedEvent } from "@/lib/core/domain/events/DomainEvent";

import { RateLimiter } from "@/lib/infrastructure/rate-limiter";

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
  const key = `ratelimit:webhook:shiprocket:${ip}`;
  const limit = parseInt(process.env.RATE_LIMIT_WEBHOOK_MAX || "100");
  const windowSec = parseInt(process.env.RATE_LIMIT_WEBHOOK_WINDOW_SEC || "60");

  const { success } = await RateLimiter.check(key, limit, windowSec);
  if (!success) {
    return NextResponse.json({ error: "Too many webhook requests." }, { status: 429 });
  }

  try {
    const rawBody = await req.text();
    
    // In a real application, verify signature or custom headers
    const shiprocketToken = req.headers.get('x-api-key');
    const expectedToken = process.env.SHIPROCKET_WEBHOOK_TOKEN;
    if (!expectedToken || shiprocketToken !== expectedToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    
    // Shiprocket sends awb, current_status, etc.
    const awb = payload.awb;
    const status = payload.current_status;
    const trackingData = payload; // Can store full JSON

    if (awb && status) {
      await prisma.$transaction(async (tx) => {
        // Find shipment
        const shipment = await tx.shipment.findFirst({
          where: { trackingCode: awb },
          include: { order: { include: { user: true } } }
        });

        if (shipment) {
          // Update status
          await tx.shipment.update({
            where: { id: shipment.id },
            data: { status }
          });

          // Add Tracking update log
          await tx.tracking.create({
            data: {
              shipmentId: shipment.id,
              status,
              location: payload.current_location || "",
              description: payload.scans?.[0]?.activity || status
            }
          });

          // Publish Domain Event for Notifications
          const trackingUrl = `https://shiprocket.co/tracking/${awb}`;
          const event = new ShipmentStatusUpdatedEvent(
            shipment.id,
            shipment.orderId,
            status,
            trackingUrl,
            shipment.order.user?.phone || ""
          );
          
          await eventBus.publishWithinTransaction(tx, event);

          Logger.info("Shiprocket webhook processed", { awb, status });
        }
      });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    Logger.error('Shiprocket Webhook Error', { error: error.message });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
