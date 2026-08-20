import { Logger } from "@/lib/infrastructure/logger";
import { NextResponse } from "next/server";
import { checkApiAdminOrManager } from "@/lib/auth/rbac";
import { prisma } from "@/lib/infrastructure/database/prisma";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string; variantId: string }> }) {
  try {
    const resolvedParams = await params;
    const auth = await checkApiAdminOrManager();
    if (!auth.authorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: auth.status });
    }

    const { id, variantId } = resolvedParams;

    // Set all variants of this product to isBestValue = false
    await prisma.productVariant.updateMany({
      where: { productId: id },
      data: { isBestValue: false }
    });

    // Set the chosen variant to isBestValue = true
    const updatedVariant = await prisma.productVariant.update({
      where: { id: variantId, productId: id },
      data: { isBestValue: true }
    });

    await prisma.auditLog.create({
      data: {
        userId: auth.user?.id,
        action: "PRODUCT_VARIANT_UPDATED",
        entity: "ProductVariant",
        entityId: updatedVariant.id,
        details: { action: "Set as Best Value" },
      }
    });

    return NextResponse.json(updatedVariant);
  } catch (error) {
    Logger.error("[PUT /api/admin/products/[id]/variants/[variantId]/best-value]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
