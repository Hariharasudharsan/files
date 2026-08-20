import { Logger } from "@/lib/infrastructure/logger";
import { NextRequest, NextResponse } from "next/server";
import { checkApiAdminOrManager } from "@/lib/auth/rbac";
import { prisma } from "@/lib/infrastructure/database/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const auth = await checkApiAdminOrManager();
    if (!auth.authorized) return NextResponse.json({ error: "Unauthorized" }, { status: auth.status });

    const badge = await prisma.badge.findUnique({ where: { id: resolvedParams.id } });
    if (!badge) return NextResponse.json({ error: "Not Found" }, { status: 404 });
    return NextResponse.json({ badge });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const auth = await checkApiAdminOrManager();
    if (!auth.authorized) return NextResponse.json({ error: "Unauthorized" }, { status: auth.status });

    const data = await req.json();
    const badge = await prisma.badge.update({
      where: { id: resolvedParams.id },
      data: {
        name: data.name,
        icon: data.icon,
        bgColor: data.bgColor,
        textColor: data.textColor,
        isActive: data.isActive,
      }
    });

    await prisma.auditLog.create({
      data: {
        userId: auth.user?.id,
        action: "BADGE_UPDATED",
        entity: "Badge",
        entityId: badge.id,
        details: data,
      }
    });

    return NextResponse.json({ badge });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update badge" }, { status: 500 });
  }
}
