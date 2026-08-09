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
    const uniqueSuffix = crypto.randomBytes(8).toString('hex');
    const ext = path.extname(file.name);
    const filename = `${path.basename(file.name, ext)}-${uniqueSuffix}${ext}`;
    
    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    try {
      await fs.access(uploadsDir);
    } catch {
      await fs.mkdir(uploadsDir, { recursive: true });
    }

    const filepath = path.join(uploadsDir, filename);
    await fs.writeFile(filepath, buffer);

    const publicUrl = `/uploads/${filename}`;

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
