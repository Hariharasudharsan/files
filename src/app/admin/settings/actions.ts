"use server";
import { prisma } from "@/lib/infrastructure/database/prisma";
import { revalidatePath } from "next/cache";

export async function saveGlobalSettings(formData: FormData) {
  const storeName = formData.get("storeName") as string;
  const supportEmail = formData.get("supportEmail") as string;
  const metaTitle = formData.get("metaTitle") as string;
  const metaDescription = formData.get("metaDescription") as string;

  // UPSERT global settings
  await prisma.settings.upsert({
    where: { key: "store_config" },
    update: {
      value: { storeName, supportEmail, metaTitle, metaDescription },
    },
    create: {
      key: "store_config",
      value: { storeName, supportEmail, metaTitle, metaDescription },
    },
  });

  revalidatePath("/", "layout"); // Revalidate entire app to apply new settings
  revalidatePath("/admin/settings");
}
