import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/infrastructure/database/prisma";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { blocks, publish } = await req.json();

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
        content: blocks,
        createdBy: "Admin User", // would come from session
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
    console.error("Save CMS version error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
