import { NextRequest, NextResponse } from "next/server";
import { checkApiAdminOrManager } from "@/lib/auth/rbac";
import { prisma } from "@/lib/infrastructure/database/prisma";

export async function GET() {
  try {
    const auth = await checkApiAdminOrManager();
    if (!auth.authorized) return NextResponse.json({ error: "Unauthorized" }, { status: auth.status });

    const setting = await prisma.settings.findUnique({ where: { key: "shipping_config" } });
    
    const config = setting ? setting.value : {
      freeShippingThreshold: 500,
      flatRate: 50,
      shippingZones: "Domestic India"
    };

    return NextResponse.json({ config });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await checkApiAdminOrManager();
    if (!auth.authorized) return NextResponse.json({ error: "Unauthorized" }, { status: auth.status });

    const data = await req.json();
    
    const setting = await prisma.settings.upsert({
      where: { key: "shipping_config" },
      update: { value: data },
      create: { key: "shipping_config", value: data }
    });

    await prisma.auditLog.create({
      data: {
        userId: auth.user?.id,
        action: "SHIPPING_CONFIG_UPDATED",
        entity: "Settings",
        entityId: setting.id,
        details: data,
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to save shipping config" }, { status: 500 });
  }
}
