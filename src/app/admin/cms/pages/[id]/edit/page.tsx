import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { savePage } from "../../actions";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/infrastructure/database/prisma";

export default async function EditCmsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const page = await prisma.cmsPage.findUnique({
    where: { id },
  });

  if (!page) notFound();

  let rawMarkdown = "";
  if (page.activeVersionId) {
    const version = await prisma.cmsPageVersion.findUnique({
      where: { id: page.activeVersionId },
    });
    
    if (version && Array.isArray(version.content) && version.content.length > 0) {
      const richTextBlock = version.content[0] as any;
      if (richTextBlock.props && richTextBlock.props.rawMarkdown) {
        rawMarkdown = richTextBlock.props.rawMarkdown;
      }
    }
  }

  const submitAndRedirect = async (formData: FormData) => {
    "use server";
    await savePage(formData);
    redirect("/admin/cms/pages");
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between border-b border-surface-200 pb-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/cms/pages">
            <button className="p-2 rounded-full hover:bg-surface-200 text-surface-500 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <h1 className="font-display text-2xl font-bold text-surface-950">Edit Page: {page.title}</h1>
        </div>
      </div>

      <form action={submitAndRedirect} className="space-y-6 bg-white p-8 rounded-2xl border border-surface-200 shadow-sm">
        <input type="hidden" name="id" value={page.id} />
        <div className="grid grid-cols-2 gap-6">
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-sm font-semibold text-surface-900 mb-2">Page Title</label>
            <input required type="text" name="title" defaultValue={page.title} className="w-full border-surface-300 rounded-lg px-4 py-2" placeholder="e.g. Return Policy" />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-sm font-semibold text-surface-900 mb-2">URL Slug</label>
            <div className="flex items-center">
              <span className="text-surface-500 bg-surface-100 border border-r-0 border-surface-300 rounded-l-lg px-3 py-2">/</span>
              <input required type="text" name="slug" defaultValue={page.slug} className="w-full border-surface-300 rounded-r-lg px-4 py-2" placeholder="return-policy" />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-surface-900 mb-2">Content (Markdown)</label>
          <textarea required name="content" defaultValue={rawMarkdown} rows={15} className="w-full border-surface-300 rounded-lg px-4 py-3 font-mono text-sm" placeholder="# Welcome to our page..."></textarea>
          <p className="text-xs text-surface-500 mt-2">You can use standard Markdown to format your page (e.g. ## Headings, **bold**, *italics*, [links](#)).</p>
        </div>

        <div className="flex items-center gap-3 bg-surface-50 p-4 rounded-xl border border-surface-200">
          <input type="checkbox" name="isPublished" id="isPublished" defaultChecked={page.status === 'PUBLISHED'} className="w-5 h-5 rounded border-surface-300 text-primary-600 focus:ring-primary-500" />
          <label htmlFor="isPublished" className="text-sm font-semibold text-surface-900">Publish immediately</label>
        </div>

        <div className="flex justify-end pt-4">
          <Button type="submit" className="flex items-center gap-2 px-8">
            <Save className="w-4 h-4" /> Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
