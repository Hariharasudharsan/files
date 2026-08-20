import { Logger } from "@/lib/infrastructure/logger";
import { NextRequest, NextResponse } from "next/server";
import { checkApiAdminOrManager } from "@/lib/auth/rbac";
import { prisma } from "@/lib/infrastructure/database/prisma";

export async function POST(req: NextRequest) {
  try {
    const auth = await checkApiAdminOrManager();
    if (!auth.authorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: auth.status });
    }

    const data = await req.json();
    const bundle = await prisma.bundleRule.create({
      data: {
        name: data.name,
        description: data.description,
        size: parseInt(data.size),
        price: parseFloat(data.price),
        isActive: data.isActive ?? true,
      }
    });

    await prisma.auditLog.create({
      data: {
        userId: auth.user?.id,
        action: "BUNDLE_RULE_CREATED",
        entity: "BundleRule",
        entityId: bundle.id,
        details: data,
      }
    });

    return NextResponse.json({ bundle }, { status: 201 });
  } catch (error) {
    Logger.error("[POST /api/admin/bundles]", error);
    return NextResponse.json({ error: "Failed to create bundle rule" }, { status: 500 });
  }
}
