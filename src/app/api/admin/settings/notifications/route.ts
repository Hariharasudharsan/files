import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/infrastructure/database/prisma";
import { checkApiAdminOrManager } from "@/lib/auth/rbac";

export async function GET() {
  try {
    const auth = await checkApiAdminOrManager();
    if (!auth.authorized) return NextResponse.json({ error: "Unauthorized" }, { status: auth.status });

    const templates = await prisma.notificationTemplate.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(templates);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch templates" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await checkApiAdminOrManager();
    if (!auth.authorized) return NextResponse.json({ error: "Unauthorized" }, { status: auth.status });

    const data = await req.json();
    const template = await prisma.notificationTemplate.create({
      data: {
        name: data.name,
        type: data.type || "WHATSAPP",
        subject: data.subject,
        body: data.body,
        isActive: data.isActive,
      }
    });
    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create template" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const auth = await checkApiAdminOrManager();
    if (!auth.authorized) return NextResponse.json({ error: "Unauthorized" }, { status: auth.status });

    const data = await req.json();
    const template = await prisma.notificationTemplate.update({
      where: { id: data.id },
      data: {
        // name is immutable after creation — acts as an internal ID
        type: data.type,
        subject: data.subject,
        body: data.body,
        isActive: data.isActive,
      }
    });
    return NextResponse.json(template);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update template" }, { status: 500 });
  }
}
