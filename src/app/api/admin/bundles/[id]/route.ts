import { Logger } from "@/lib/infrastructure/logger";
import { NextRequest, NextResponse } from "next/server";
import { checkApiAdminOrManager } from "@/lib/auth/rbac";
import { prisma } from "@/lib/infrastructure/database/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const auth = await checkApiAdminOrManager();
    if (!auth.authorized) return NextResponse.json({ error: "Unauthorized" }, { status: auth.status });

    const bundle = await prisma.bundleRule.findUnique({ where: { id: resolvedParams.id } });
    if (!bundle) return NextResponse.json({ error: "Not Found" }, { status: 404 });
    return NextResponse.json({ bundle });
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
    const bundle = await prisma.bundleRule.update({
      where: { id: resolvedParams.id },
      data: {
        name: data.name,
        description: data.description,
        size: parseInt(data.size),
        price: parseFloat(data.price),
        isActive: data.isActive,
      }
    });

    await prisma.auditLog.create({
      data: {
        userId: auth.user?.id,
        action: "BUNDLE_RULE_UPDATED",
        entity: "BundleRule",
        entityId: bundle.id,
        details: data,
      }
    });

    return NextResponse.json({ bundle });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update bundle" }, { status: 500 });
  }
}
