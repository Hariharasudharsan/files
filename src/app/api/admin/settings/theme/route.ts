import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/infrastructure/database/prisma";

import { checkApiAdminOrManager } from "@/lib/auth/rbac";

export async function GET() {
  try {
    const auth = await checkApiAdminOrManager();
    if (!auth.authorized) return NextResponse.json({ error: "Unauthorized" }, { status: auth.status });

    let setting = await prisma.settings.findUnique({
      where: { key: "THEME_CONFIG" },
    });
    return NextResponse.json(setting ? setting.value : {});
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await checkApiAdminOrManager();
    if (!auth.authorized) return NextResponse.json({ error: "Unauthorized" }, { status: auth.status });

    const config = await req.json();
    const setting = await prisma.settings.upsert({
      where: { key: "THEME_CONFIG" },
      update: { value: config },
      create: { key: "THEME_CONFIG", value: config },
    });
    return NextResponse.json(setting.value);
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
