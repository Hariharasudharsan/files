import { Logger } from "@/lib/infrastructure/logger";
import { NextResponse } from "next/server";
import { checkApiAdminOrManager } from "@/lib/auth/rbac";
import { prisma } from "@/lib/infrastructure/database/prisma";
import { createProductSchema } from "@/lib/core/domain/schemas/admin";
import { z } from "zod";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const auth = await checkApiAdminOrManager();
    if (!auth.authorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: auth.status });
    }

    const product = await prisma.product.findUnique({
      where: { id: resolvedParams.id },
      include: {
        badges: true,
        variants: true
      }
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error) {
    Logger.error("[GET /api/admin/products/[id]]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const auth = await checkApiAdminOrManager();
    if (!auth.authorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: auth.status });
    }

    const body = await req.json();
    const data = createProductSchema.parse(body);

    const product = await prisma.$transaction(async (tx) => {
      // Clear existing badges if we are updating them
      if (data.badgeIds !== undefined) {
        await tx.productBadge.deleteMany({ where: { productId: resolvedParams.id } });
      }

      return await tx.product.update({
        where: { id: resolvedParams.id },
        data: {
          name: data.name,
          slug: data.slug,
          description: data.description,
          categoryId: data.categoryId,
          fryingTemp: data.fryingTemp,
          airFryerSetting: data.airFryerSetting,
          microwaveTime: data.microwaveTime,
          spiceLevel: data.spiceLevel,
          dietType: data.dietType,
          region: data.region,
          mealPairing: data.mealPairing,
          isSubscribable: data.isSubscribable,
          subscriptionDiscountPercent: data.subscriptionDiscountPercent,
          ...(data.badgeIds?.length ? {
            badges: {
              create: data.badgeIds.map((id: string) => ({ badgeId: id }))
            }
          } : {})
        }
      });
    });

    await prisma.auditLog.create({
      data: {
        userId: auth.user?.id,
        action: "PRODUCT_UPDATED",
        entity: "Product",
        entityId: product.id,
        details: body,
      }
    });

    return NextResponse.json(product);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: (error as any).errors }, { status: 400 });
    }
    Logger.error("[PUT /api/admin/products/[id]]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

