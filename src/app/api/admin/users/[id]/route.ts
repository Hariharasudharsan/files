import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/infrastructure/database/prisma";
import { checkApiAdminOrManager } from "@/lib/auth/rbac";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const auth = await checkApiAdminOrManager();
    if (!auth.authorized) return NextResponse.json({ error: "Unauthorized" }, { status: auth.status });

    const user = await prisma.user.findUnique({
      where: { id },
      include: { role: true },
    });
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(user);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const auth = await checkApiAdminOrManager();
    if (!auth.authorized) return NextResponse.json({ error: "Unauthorized" }, { status: auth.status });

    const body = await req.json();
    const updated = await prisma.user.update({
      where: { id },
      data: {
        isB2B: body.isB2B,
        gstin: body.gstin,
      },
    });
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
