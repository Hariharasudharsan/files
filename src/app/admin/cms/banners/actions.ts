"use server";
import { prisma } from "@/lib/infrastructure/database/prisma";
import { revalidatePath } from "next/cache";

export async function toggleBanner(id: string, isActive: boolean) {
  await prisma.banner.update({
    where: { id },
    data: { isActive },
  });
  revalidatePath("/", "layout");
  revalidatePath("/admin/cms/banners");
}

export async function deleteBanner(id: string) {
  await prisma.banner.delete({ where: { id } });
  revalidatePath("/", "layout");
  revalidatePath("/admin/cms/banners");
}

export async function createBanner(formData: FormData) {
  const title = formData.get("title") as string;
  const link = formData.get("link") as string;
  const mediaUrl = formData.get("mediaUrl") as string;
  
  // Create a Media record first for simplicity
  const media = await prisma.media.create({
    data: {
      url: mediaUrl,
      type: "IMAGE",
      alt: title,
    }
  });

  await prisma.banner.create({
    data: {
      title,
      link,
      mediaId: media.id,
      isActive: true,
    }
  });

  revalidatePath("/", "layout");
  revalidatePath("/admin/cms/banners");
}
