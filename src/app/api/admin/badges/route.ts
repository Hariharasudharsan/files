import { Logger } from "@/lib/infrastructure/logger";
import { NextRequest, NextResponse } from "next/server";
import { checkApiAdminOrManager } from "@/lib/auth/rbac";
import { prisma } from "@/lib/infrastructure/database/prisma";

export async function GET() {
  try {
    const auth = await checkApiAdminOrManager();
    if (!auth.authorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: auth.status });
    }

    const badges = await prisma.badge.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ badges });
  } catch (error) {
    Logger.error("[GET /api/admin/badges]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await checkApiAdminOrManager();
    if (!auth.authorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: auth.status });
    }

    const data = await req.json();
    const badge = await prisma.badge.create({
      data: {
        name: data.name,
        icon: data.icon || null,
        bgColor: data.bgColor || null,
        textColor: data.textColor || null,
        isActive: data.isActive ?? true,
      }
    });

    await prisma.auditLog.create({
      data: {
        userId: auth.user?.id,
        action: "BADGE_CREATED",
        entity: "Badge",
        entityId: badge.id,
        details: data,
      }
    });

    return NextResponse.json({ badge }, { status: 201 });
  } catch (error) {
    Logger.error("[POST /api/admin/badges]", error);
    return NextResponse.json({ error: "Failed to create badge" }, { status: 500 });
  }
}
