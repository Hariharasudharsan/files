"use server";
import { prisma } from "@/lib/infrastructure/database/prisma";
import { revalidatePath } from "next/cache";

export async function togglePagePublish(id: string, isPublished: boolean) {
  await prisma.cmsPage.update({
    where: { id },
    data: { isPublished },
  });
  // We don't know the exact slug here without fetching, but we can revalidate all
  revalidatePath("/", "layout");
  revalidatePath("/admin/cms/pages");
}

export async function deletePage(id: string) {
  await prisma.cmsPage.delete({ where: { id } });
  revalidatePath("/", "layout");
  revalidatePath("/admin/cms/pages");
}

export async function savePage(formData: FormData) {
  const id = formData.get("id") as string | null;
  const title = formData.get("title") as string;
  const slug = formData.get("slug") as string;
  const content = formData.get("content") as string;
  const isPublished = formData.get("isPublished") === "on";

  if (id) {
    await prisma.cmsPage.update({
      where: { id },
      data: { title, slug, content, isPublished },
    });
  } else {
    await prisma.cmsPage.create({
      data: { title, slug, content, isPublished },
    });
  }

  revalidatePath("/", "layout");
  revalidatePath(`/${slug}`);
  revalidatePath("/admin/cms/pages");
}
