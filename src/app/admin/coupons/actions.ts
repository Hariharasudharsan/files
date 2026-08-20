"use server";
import { prisma } from "@/lib/infrastructure/database/prisma";
import { revalidatePath } from "next/cache";

export async function togglePromotedCoupon(id: string, isPromoted: boolean) {
  if (isPromoted) {
    await prisma.coupon.updateMany({
      where: { isPromoted: true },
      data: { isPromoted: false }
    });
  }
  
  await prisma.coupon.update({
    where: { id },
    data: { isPromoted }
  });
  
  revalidatePath("/", "layout");
  revalidatePath("/admin/coupons");
}

export async function createQuickCoupon(formData: FormData) {
  const code = formData.get("code") as string;
  const discountType = formData.get("discountType") as string;
  const discountValue = parseFloat(formData.get("discountValue") as string);
  const validUntilStr = formData.get("validUntil") as string;
  const validFrom = new Date();
  const validUntil = new Date(validUntilStr);
  const isPromoted = formData.get("isPromoted") === "on";
  const promotedProductId = formData.get("promotedProductId") as string || null;

  if (isPromoted) {
    await prisma.coupon.updateMany({
      where: { isPromoted: true },
      data: { isPromoted: false }
    });
  }

  await prisma.coupon.create({
    data: {
      code,
      discountType,
      discountValue,
      validFrom,
      validUntil,
      isPromoted,
      promotedProductId,
      isActive: true,
    }
  });

  revalidatePath("/", "layout");
  revalidatePath("/admin/coupons");
}
