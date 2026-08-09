import { prisma } from "@/lib/infrastructure/database/prisma";
import { notFound } from "next/navigation";
import { remark } from 'remark';
import html from 'remark-html';
import { Metadata } from 'next';

export const dynamic = "force-dynamic";

// Fallback dynamic routes for custom CMS pages
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  let page: any = null;
  try {
    page = await prisma.cmsPage.findFirst({
      where: { slug, isPublished: true },
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
  try {
    page = await prisma.cmsPage.findFirst({
      where: { slug, isPublished: true },
    });
  } catch (e) {
    console.warn("Database unreachable during build. Skipping content fetch for CMS page.");
  }

  if (!page) {
    notFound();
  }

  // Parse markdown content to HTML
  const processedContent = await remark()
    .use(html)
    .process(page.content);
  const contentHtml = processedContent.toString();

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="font-display text-4xl font-bold text-surface-950 mb-8">{page.title}</h1>
        <div 
          className="prose prose-lg prose-surface max-w-none prose-headings:font-display prose-a:text-primary-600 hover:prose-a:text-primary-700"
          dangerouslySetInnerHTML={{ __html: contentHtml }} 
        />
      </div>
    </div>
  );
}
