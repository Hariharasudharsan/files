import { Logger } from "@/lib/infrastructure/logger";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/infrastructure/database/prisma";

import { checkApiAdminOrManager } from "@/lib/auth/rbac";
import DOMPurify from 'isomorphic-dompurify';

function sanitizeRecursive(obj: any): any {
  if (typeof obj === 'string') {
    return DOMPurify.sanitize(obj);
  }
  if (Array.isArray(obj)) {
    return obj.map(sanitizeRecursive);
  }
  if (obj !== null && typeof obj === 'object') {
    const sanitized: any = {};
    for (const key in obj) {
      sanitized[key] = sanitizeRecursive(obj[key]);
    }
    return sanitized;
  }
  return obj;
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await checkApiAdminOrManager();
  if (!auth.authorized) return NextResponse.json({ error: "Unauthorized" }, { status: auth.status });

  const { id } = await params;
  try {
    const { blocks, publish } = await req.json();
    const sanitizedBlocks = sanitizeRecursive(blocks);

    const page = await prisma.cmsPage.findUnique({
      where: { id },
      include: { versions: { orderBy: { version: 'desc' }, take: 1 } },
    });

    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    const nextVersionNum = page.versions.length > 0 ? page.versions[0].version + 1 : 1;

    // Create a new version
    const newVersion = await prisma.cmsPageVersion.create({
      data: {
        pageId: id,
        version: nextVersionNum,
        content: sanitizedBlocks,
        createdBy: auth.user?.email || "Admin User",
      },
    });

    // Update active version if publishing
    if (publish) {
      await prisma.cmsPage.update({
        where: { id },
        data: {
          activeVersionId: newVersion.id,
          status: "PUBLISHED",
          publishedAt: new Date(),
        },
      });
    }

    return NextResponse.json(newVersion, { status: 201 });
  } catch (error) {
    Logger.error("Save CMS version error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await checkApiAdminOrManager();
  if (!auth.authorized) return NextResponse.json({ error: "Unauthorized" }, { status: auth.status });

  const { id } = await params;
  try {
    const page = await prisma.cmsPage.findUnique({
      where: { id },
      include: {
        versions: {
          orderBy: { version: 'desc' },
          take: 1
        }
      }
    });

    if (!page) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const activeVersion = page.activeVersionId
      ? await prisma.cmsPageVersion.findUnique({ where: { id: page.activeVersionId } })
      : page.versions[0];

    return NextResponse.json({
      page,
      activeVersion: activeVersion || { content: [] }
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
