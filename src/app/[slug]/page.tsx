import { prisma } from "@/lib/infrastructure/database/prisma";
import { notFound } from "next/navigation";
import { Metadata } from 'next';
import { ComponentRegistry } from "@/components/cms/ComponentRegistry";

export const dynamic = "force-dynamic";

// Fallback dynamic routes for custom CMS pages
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  let page: any = null;
  try {
    page = await prisma.cmsPage.findFirst({
      where: { slug, status: "PUBLISHED" },
    });
  } catch (e) {
    console.warn("Database unreachable during build. Skipping metadata fetch for CMS page.");
  }

  if (!page) {
    return { title: "Not Found" };
  }

  return {
    title: page.title,
  };
}

export default async function DynamicCmsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  // Exclude hardcoded routes to avoid conflicts (Next.js automatically does this for predefined directories, but good practice if nested)
  const reservedPaths = ['admin', 'api', 'account', 'checkout', 'search', 'category', 'product'];
  if (reservedPaths.includes(slug)) {
    notFound();
  }

  let page: any = null;
  let version: any = null;
  
  try {
    page = await prisma.cmsPage.findFirst({
      where: { slug, status: "PUBLISHED" },
    });

    if (page && page.activeVersionId) {
      version = await prisma.cmsPageVersion.findUnique({
        where: { id: page.activeVersionId },
      });
    }
  } catch (e) {
    console.warn("Database unreachable during build. Skipping content fetch for CMS page.");
  }

  if (!page || !version) {
    notFound();
  }

  // Content should be a JSON array of blocks
  let blocks = [];
  try {
    blocks = typeof version.content === "string" ? JSON.parse(version.content) : version.content;
  } catch (e) {
    console.error("Failed to parse CMS blocks:", e);
  }

  return (
    <div className="min-h-screen bg-white">
      <ComponentRegistry blocks={blocks} />
    </div>
  );
}
