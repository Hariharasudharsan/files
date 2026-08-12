"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Plus, Save, Play, Trash2, ArrowUp, ArrowDown } from "lucide-react";

export default function PageBuilder() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [page, setPage] = useState<any>(null);
  const [blocks, setBlocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchPageData = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/cms/pages/${id}/versions`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.error(e);
    }
    return null;
  }, [id]);

  useEffect(() => {
    let mounted = true;
    fetchPageData().then((data) => {
      if (!mounted) return;
      if (data) {
        setPage(data.page);
        let content = data.activeVersion?.content || [];
        if (typeof content === "string") content = JSON.parse(content);
        setBlocks(content);
      }
      setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, [fetchPageData]);

  const addBlock = (type: string) => {
    const newBlock = {
      id: crypto.randomUUID(),
      type,
      props: type === "HeroBanner" ? { title: "New Hero" } : { htmlContent: "<p>New Text</p>" },
    };
    setBlocks([...blocks, newBlock]);
  };

  const updateBlockProps = (blockId: string, propsText: string) => {
    try {
      const parsedProps = JSON.parse(propsText);
      setBlocks(blocks.map(b => b.id === blockId ? { ...b, props: parsedProps } : b));
    } catch (e) {
      // JSON invalid, ignore during typing
    }
  };

  const removeBlock = (blockId: string) => {
    setBlocks(blocks.filter(b => b.id !== blockId));
  };

  const moveBlock = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === blocks.length - 1) return;

    const newBlocks = [...blocks];
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    [newBlocks[index], newBlocks[swapIndex]] = [newBlocks[swapIndex], newBlocks[index]];
    setBlocks(newBlocks);
  };

  const savePage = async (publish: boolean) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/cms/pages/${id}/versions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blocks, publish }),
      });
      if (res.ok) {
        alert(publish ? "Published!" : "Draft Saved!");
        if (publish && page) {
          router.push(`/${page.slug}`);
        }
      }
    } catch (e) {
      console.error(e);
      alert("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (!page) return <div className="p-8 text-red-500">Page not found</div>;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{page.title} <span className="text-sm font-normal text-gray-500">(/{"slug" in page ? page.slug : ""})</span></h1>
          <p className="text-sm text-gray-500">Status: {page.status}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => savePage(false)} disabled={saving} className="btn-secondary px-4 py-2 border rounded-md hover:bg-gray-50 flex items-center gap-2">
            <Save className="w-4 h-4" /> Save Draft
          </button>
          <button onClick={() => savePage(true)} disabled={saving} className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 flex items-center gap-2">
            <Play className="w-4 h-4" /> Publish
          </button>
        </div>
      </div>

      <div className="flex flex-1 p-6 gap-6 max-w-7xl mx-auto w-full">
        
        {/* Editor Area */}
        <div className="flex-1 space-y-6">
          {blocks.length === 0 && (
            <div className="bg-white border border-dashed rounded-lg p-12 text-center text-gray-500">
              No blocks yet. Add one from the sidebar.
            </div>
          )}

          {blocks.map((block, index) => (
            <div key={block.id} className="bg-white border rounded-lg shadow-sm p-4 relative group">
              <div className="flex justify-between items-center mb-4 pb-2 border-b">
                <h3 className="font-semibold text-gray-700">{block.type}</h3>
                <div className="flex items-center gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => moveBlock(index, "up")} disabled={index === 0} className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"><ArrowUp className="w-4 h-4" /></button>
                  <button onClick={() => moveBlock(index, "down")} disabled={index === blocks.length - 1} className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"><ArrowDown className="w-4 h-4" /></button>
                  <div className="w-px h-4 bg-gray-300 mx-1"></div>
                  <button onClick={() => removeBlock(block.id)} className="p-1 hover:bg-red-50 text-red-500 rounded"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">JSON Properties</label>
                <textarea
                  className="w-full font-mono text-sm border rounded p-2 focus:ring-1 focus:ring-primary-500 h-32"
                  defaultValue={JSON.stringify(block.props, null, 2)}
                  onBlur={(e) => updateBlockProps(block.id, e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar Component Library */}
        <div className="w-64 shrink-0">
          <div className="bg-white border rounded-lg p-4 sticky top-24">
            <h2 className="font-semibold text-gray-900 mb-4">Components</h2>
            <div className="space-y-2">
              <button onClick={() => addBlock("HeroBanner")} className="w-full text-left px-3 py-2 text-sm border rounded hover:border-primary-500 hover:text-primary-600 flex items-center gap-2">
                <Plus className="w-4 h-4" /> Hero Banner
              </button>
              <button onClick={() => addBlock("RichText")} className="w-full text-left px-3 py-2 text-sm border rounded hover:border-primary-500 hover:text-primary-600 flex items-center gap-2">
                <Plus className="w-4 h-4" /> Rich Text
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
