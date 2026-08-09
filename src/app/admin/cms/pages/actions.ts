"use server";
import { prisma } from "@/lib/infrastructure/database/prisma";
import { revalidatePath } from "next/cache";

export async function togglePagePublish(id: string, isPublished: boolean) {
  await prisma.cmsPage.update({
    where: { id },
    data: { status: isPublished ? "PUBLISHED" : "DRAFT" },
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
  const status = isPublished ? "PUBLISHED" : "DRAFT";

  if (id) {
    const page = await prisma.cmsPage.update({
      where: { id },
      data: { title, slug, status },
    });
    // Create new version for content
    await prisma.cmsPageVersion.create({
      data: {
        pageId: id,
        version: Date.now(), // simple integer version
        content: JSON.parse(content || "{}"),
      }
    });
  } else {
    const page = await prisma.cmsPage.create({
      data: { title, slug, status },
    });
    await prisma.cmsPageVersion.create({
      data: {
        pageId: page.id,
        version: 1,
        content: JSON.parse(content || "{}"),
      }
    });
  }

  revalidatePath("/", "layout");
  revalidatePath(`/${slug}`);
  revalidatePath("/admin/cms/pages");
}
