import { prisma } from "@/lib/infrastructure/database/prisma";
import { Plus, Trash2, Edit, CheckCircle2, XCircle, FileText } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { togglePagePublish, deletePage } from "./actions";

export default async function AdminPagesPage() {
  const pages = await prisma.cmsPage.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-surface-950">Custom Pages</h1>
          <p className="text-surface-500 mt-1">Manage landing pages, policies, and static content.</p>
        </div>
        <Link href="/admin/cms/pages/new">
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> Create Page
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-surface-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-50 text-surface-500">
              <tr>
                <th className="px-6 py-4 font-semibold">Title</th>
                <th className="px-6 py-4 font-semibold">Slug (URL)</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Last Updated</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {pages.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-surface-500">
                    <div className="flex flex-col items-center justify-center">
                      <FileText className="w-12 h-12 text-surface-200 mb-4" />
                      <p>No custom pages found.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                pages.map((page) => (
                  <tr key={page.id} className="hover:bg-surface-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-surface-950">
                      {page.title}
                      {page.type === "STORY" && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-100 text-primary-800">
                          Story
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-primary-600 font-mono">
                      /{page.type === "STORY" ? `stories/${page.slug}` : page.slug}
                    </td>
                    <td className="px-6 py-4">
                      <form action={async () => { "use server"; await togglePagePublish(page.id, page.status !== "PUBLISHED"); }}>
                        <button type="submit" className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${page.status === 'PUBLISHED' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-surface-100 text-surface-600 border border-surface-200'}`}>
                          {page.status === 'PUBLISHED' ? <><CheckCircle2 className="w-3 h-3"/> Published</> : <><XCircle className="w-3 h-3"/> Draft</>}
                        </button>
                      </form>
                    </td>
                    <td className="px-6 py-4 text-surface-500">{new Date(page.updatedAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/${page.type === "STORY" ? `stories/${page.slug}` : page.slug}`} target="_blank">
                          <button className="p-2 text-surface-400 hover:text-primary-600 transition-colors rounded-lg hover:bg-primary-50">
                            View
                          </button>
                        </Link>
                        <Link href={`/admin/cms/pages/${page.id}/edit`}>
                          <button className="p-2 text-surface-400 hover:text-primary-600 transition-colors rounded-lg hover:bg-primary-50">
                            <Edit className="w-4 h-4" />
                          </button>
                        </Link>
                        <form action={async () => { "use server"; await deletePage(page.id); }}>
                          <button type="submit" className="p-2 text-surface-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
