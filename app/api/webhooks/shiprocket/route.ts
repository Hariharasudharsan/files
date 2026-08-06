import { NextResponse } from 'next/server';
import { prisma } from "@/lib/infrastructure/database/prisma";
import { Logger } from "@/lib/infrastructure/logger";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    
    // In a real application, verify signature or custom headers
    const shiprocketToken = req.headers.get('x-api-key');
    if (shiprocketToken !== process.env.SHIPROCKET_WEBHOOK_TOKEN && process.env.NODE_ENV === 'production') {
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
          where: { trackingCode: awb }
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
