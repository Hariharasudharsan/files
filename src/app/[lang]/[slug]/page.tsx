import { Logger } from "@/lib/infrastructure/logger";
import { notFound } from "next/navigation";
import { Metadata } from 'next';
import { ComponentRegistry } from "@/components/cms/ComponentRegistry";
import { CmsService } from "@/lib/core/application/CmsService";

export const dynamic = "force-dynamic";

// Fallback dynamic routes for custom CMS pages
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  let page: any = null;
  try {
    const cmsData = await CmsService.getCmsPageBySlug(slug);
    page = cmsData?.page;
  } catch (e) {
    Logger.warn("Database unreachable during build. Skipping metadata fetch for CMS page.");
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

  let cmsData: any = null;
  
  try {
    cmsData = await CmsService.getCmsPageBySlug(slug);
  } catch (e) {
    Logger.warn("Database unreachable during build. Skipping content fetch for CMS page.");
  }

  if (!cmsData || !cmsData.page || !cmsData.version) {
    notFound();
  }

  // Content should be a JSON array of blocks
  let blocks = [];
  try {
    blocks = typeof cmsData.version.content === "string" ? JSON.parse(cmsData.version.content) : cmsData.version.content;
  } catch (e: any) {
    Logger.error("Failed to parse CMS blocks:", e);
  }

  return (
    <div className="min-h-screen bg-white">
      <ComponentRegistry blocks={blocks} />
    </div>
  );
}
