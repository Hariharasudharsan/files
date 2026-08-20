import { Logger } from "@/lib/infrastructure/logger";
import { notFound } from "next/navigation";
import { Metadata } from 'next';
import { ComponentRegistry } from "@/components/cms/ComponentRegistry";
import { CmsService } from "@/lib/core/application/CmsService";
import Link from "next/link";
import { ArrowLeft, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  let page: any = null;
  try {
    const cmsData = await CmsService.getCmsPageBySlug(slug);
    page = cmsData?.page;
  } catch (e) {
    Logger.warn("Database unreachable during build. Skipping metadata fetch for CMS page.");
  }

  if (!page || page.type !== "STORY") {
    return { title: "Not Found" };
  }

  return {
    title: `${page.title} | Mathuram Foods Stories`,
    description: page.excerpt || page.title,
  };
}

export default async function StoryDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  let cmsData: any = null;
  
  try {
    cmsData = await CmsService.getCmsPageBySlug(slug);
  } catch (e) {
    Logger.warn("Database unreachable during build. Skipping content fetch for CMS page.");
  }

  if (!cmsData || !cmsData.page || !cmsData.version || cmsData.page.type !== "STORY") {
    notFound();
  }

  const { page, version } = cmsData;

  let blocks = [];
  try {
    blocks = typeof version.content === "string" ? JSON.parse(version.content) : version.content;
  } catch (e: any) {
    Logger.error("Failed to parse CMS blocks:", e);
  }

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Story Header */}
      <div className="bg-surface-50 pt-12 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/stories" className="inline-flex items-center text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Stories
          </Link>
          
          <h1 className="font-display text-4xl md:text-5xl font-bold text-surface-950 mb-6 leading-tight">
            {page.title}
          </h1>
          
          {page.excerpt && (
            <p className="text-xl text-surface-600 mb-8 leading-relaxed">
              {page.excerpt}
            </p>
          )}

          <div className="flex items-center text-sm text-surface-500 font-medium">
            <span className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full mr-4">
              Story of Goodness
            </span>
            {page.publishedAt && (
              <span className="flex items-center">
                <Clock className="w-4 h-4 mr-1.5" />
                {new Date(page.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Featured Image */}
      {page.featuredImage && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
          <div className="rounded-3xl overflow-hidden shadow-xl border border-surface-200 bg-white">
            <img 
              src={page.featuredImage} 
              alt={page.title}
              className="w-full max-h-[500px] object-cover"
            />
          </div>
        </div>
      )}

      {/* Content Body */}
      <div className={`max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 ${page.featuredImage ? 'pt-16' : 'pt-8'}`}>
        <article className="prose prose-lg prose-primary max-w-none prose-headings:font-display prose-headings:font-bold prose-p:text-surface-600 prose-a:text-primary-600 hover:prose-a:text-primary-500">
          <ComponentRegistry blocks={blocks} />
        </article>
      </div>
    </div>
  );
}
