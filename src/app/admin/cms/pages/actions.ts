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

import { remark } from 'remark';
import html from 'remark-html';

export async function savePage(formData: FormData) {
  const id = formData.get("id") as string | null;
  const title = formData.get("title") as string;
  const slug = formData.get("slug") as string;
  const content = formData.get("content") as string;
  const isPublished = formData.get("isPublished") === "on";
  const status = isPublished ? "PUBLISHED" : "DRAFT";

  const processedContent = await remark().use(html).process(content || "");
  const htmlContent = processedContent.toString();

  const blocks = [
    {
      id: Date.now().toString(),
      type: "RichText",
      props: { htmlContent, rawMarkdown: content }
    }
  ];

  if (id) {
    const page = await prisma.cmsPage.update({
      where: { id },
      data: { title, slug, status },
    });
    
    const version = await prisma.cmsPageVersion.create({
      data: {
        pageId: id,
        version: Date.now(),
        content: blocks,
      }
    });

    await prisma.cmsPage.update({
      where: { id },
      data: { activeVersionId: version.id }
    });
  } else {
    const page = await prisma.cmsPage.create({
      data: { title, slug, status },
    });
    
    const version = await prisma.cmsPageVersion.create({
      data: {
        pageId: page.id,
        version: 1,
        content: blocks,
      }
    });

    await prisma.cmsPage.update({
      where: { id: page.id },
      data: { activeVersionId: version.id }
    });
  }

  revalidatePath("/", "layout");
  revalidatePath(`/${slug}`);
  revalidatePath("/admin/cms/pages");
}
