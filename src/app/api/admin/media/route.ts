import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/infrastructure/database/prisma";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
// IMPORTANT: Protect this route in production with session checking (e.g., NextAuth/Auth.js)!

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const alt = formData.get("alt") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Use the S3 adapter instead of local filesystem
    const { storageAdapter } = await import("@/lib/integrations/storage/s3-adapter");
    const uploadResult = await storageAdapter.uploadFile(buffer, file.name, file.type);
    
    const publicUrl = uploadResult.url;

    const media = await prisma.media.create({
      data: {
        url: publicUrl,
        alt: alt || file.name,
        type: file.type.startsWith("video/") ? "VIDEO" : "IMAGE",
      },
    });

    return NextResponse.json(media, { status: 201 });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const mediaFiles = await prisma.media.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(mediaFiles);
  } catch (error) {
    console.error("Fetch media error:", error);
    return NextResponse.json({ error: "Failed to fetch media" }, { status: 500 });
  }
}
