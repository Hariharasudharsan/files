import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/infrastructure/database/prisma";

import { checkApiAdminOrManager } from "@/lib/auth/rbac";

export async function GET() {
  try {
    const auth = await checkApiAdminOrManager();
    if (!auth.authorized) return NextResponse.json({ error: "Unauthorized" }, { status: auth.status });

    const flags = await prisma.featureFlag.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(flags);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch flags" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await checkApiAdminOrManager();
    if (!auth.authorized) return NextResponse.json({ error: "Unauthorized" }, { status: auth.status });

    const data = await req.json();
    const flag = await prisma.featureFlag.create({
      data: {
        key: data.key,
        name: data.name,
        description: data.description,
        isEnabled: data.isEnabled,
        ...(data.rules !== undefined && { rules: data.rules }),
      }
    });

    await prisma.auditLog.create({
      data: {
        userId: auth.user?.id,
        action: "FEATURE_FLAG_CREATED",
        entity: "FeatureFlag",
        entityId: flag.id,
        details: data,
      }
    });

    return NextResponse.json(flag, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create flag" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const auth = await checkApiAdminOrManager();
    if (!auth.authorized) return NextResponse.json({ error: "Unauthorized" }, { status: auth.status });

    const data = await req.json();
    const flag = await prisma.featureFlag.update({
      where: { id: data.id },
      data: {
        isEnabled: data.isEnabled,
        ...(data.rules !== undefined && { rules: data.rules }),
      }
    });

    await prisma.auditLog.create({
      data: {
        userId: auth.user?.id,
        action: "FEATURE_FLAG_UPDATED",
        entity: "FeatureFlag",
        entityId: flag.id,
        details: data,
      }
    });

    return NextResponse.json(flag);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update flag" }, { status: 500 });
  }
}
