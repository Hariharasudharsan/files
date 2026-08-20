import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/infrastructure/database/prisma";
import { CacheService } from "@/lib/infrastructure/cache/cache-service";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const pincode = searchParams.get('pincode');
    
    if (!pincode || pincode.length !== 6) {
      return NextResponse.json({ error: "Invalid pincode" }, { status: 400 });
    }

    // Check exact pincode in the new Phase 3 ServiceablePincode table
    const serviceableData = await CacheService.remember(`shipping:pincode:${pincode}`, 3600, async () => {
      return await prisma.serviceablePincode.findUnique({
        where: { pincode },
        include: { zone: true }
      });
    });

    if (serviceableData && serviceableData.zone.isServiceable) {
      return NextResponse.json({
        serviceable: true,
        rate: serviceableData.zone.rate,
        eta: serviceableData.zone.estimatedDays,
        zone: serviceableData.zone.name
      });
    }

    return NextResponse.json({ 
      serviceable: false,
      error: "Not Serviceable" 
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to calculate shipping" }, { status: 500 });
  }
}
