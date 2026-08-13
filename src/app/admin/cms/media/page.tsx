"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Upload, Trash2, Copy, FileImageIcon } from "lucide-react";
import Image from "next/image";

export default function MediaLibraryPage() {
  const [media, setMedia] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const fetchMediaData = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/media");
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.error(e);
    }
    return null;
  }, []);

  useEffect(() => {
    let mounted = true;
    fetchMediaData().then((data) => {
      if (mounted && data) setMedia(data);
    });
    return () => {
      mounted = false;
    };
  }, [fetchMediaData]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("alt", file.name);

    try {
      const res = await fetch("/api/admin/media", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Upload failed");
      }
      
      const data = await fetchMediaData();
      if (data) setMedia(data);
    } catch (error) {
      console.error(error);
      setUploadError("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    alert("Copied to clipboard!");
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Media Library</h1>
          <p className="text-sm text-gray-500 mt-1">Manage images and videos for your CMS pages</p>
        </div>
        <div>
          <label className="relative cursor-pointer bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md font-medium flex items-center shadow-sm">
            <Upload className="w-4 h-4 mr-2" />
            {isUploading ? "Uploading..." : "Upload File"}
            <input 
              type="file" 
              className="hidden" 
              accept="image/*,video/*"
              onChange={handleUpload}
              disabled={isUploading}
            />
          </label>
        </div>
      </div>

      {uploadError && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">
          {uploadError}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {media.map((item) => (
          <div key={item.id} className="group relative border rounded-lg overflow-hidden bg-white hover:shadow-md transition-shadow">
            <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
              {item.type === "IMAGE" ? (
                <Image src={item.url} alt={item.alt} fill unoptimized className="object-cover" />
              ) : (
                <FileImageIcon className="w-12 h-12 text-gray-400" />
              )}
            </div>
            
            <div className="p-3">
              <p className="text-xs text-gray-500 truncate" title={item.alt}>{item.alt}</p>
            </div>

            {/* Hover Actions */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
              <button 
                onClick={() => copyToClipboard(item.url)}
                className="bg-white text-gray-900 px-3 py-1.5 rounded text-sm font-medium hover:bg-gray-100 flex items-center"
              >
                <Copy className="w-4 h-4 mr-1" /> Copy URL
              </button>
            </div>
          </div>
        ))}
        {media.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500 bg-gray-50 rounded-lg border border-dashed">
            No media found. Upload your first file.
          </div>
        )}
      </div>
    </div>
  );
}
