"use server";
import { prisma } from "@/lib/infrastructure/database/prisma";
import { revalidatePath } from "next/cache";

import { requireAdminOrManager } from "@/lib/auth/rbac";

export async function saveGlobalSettings(formData: FormData) {
  const session = await requireAdminOrManager();
  
  const storeName = formData.get("storeName") as string;
  const supportEmail = formData.get("supportEmail") as string;
  const metaTitle = formData.get("metaTitle") as string;
  const metaDescription = formData.get("metaDescription") as string;
  const prepaidDiscountPercent = Number(formData.get("prepaidDiscountPercent")) || 0;
  const happyCustomersCount = Number(formData.get("happyCustomersCount")) || 500000;

  const value = { storeName, supportEmail, metaTitle, metaDescription, prepaidDiscountPercent, happyCustomersCount };

  // UPSERT global settings
  const setting = await prisma.settings.upsert({
    where: { key: "store_config" },
    update: { value },
    create: { key: "store_config", value },
  });

  await prisma.auditLog.create({
    data: {
      userId: session.id,
      action: "SETTINGS_UPDATED",
      entity: "Settings",
      entityId: setting.id,
      details: value,
    }
  });

  revalidatePath("/", "layout"); // Revalidate entire app to apply new settings
  revalidatePath("/admin/settings");
}
