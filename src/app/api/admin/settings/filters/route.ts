import { NextResponse } from 'next/server';
import { prisma } from '@/lib/infrastructure/database/prisma';
import { checkApiAdminOrManager } from "@/lib/auth/rbac";

export async function GET() {
  try {
    const auth = await checkApiAdminOrManager();
    if (!auth.authorized) return NextResponse.json({ error: "Unauthorized" }, { status: auth.status });

    const setting = await prisma.settings.findUnique({
      where: { key: "SEARCH_FILTERS_CONFIG" }
    });
    
    return NextResponse.json({
      config: setting?.value || {
        spiceLevel: ["Low", "Medium", "High", "Extra Hot"],
        dietType: ["Vegan", "Vegetarian", "Gluten-Free"],
        region: ["South Indian", "North Indian"],
        mealPairing: ["Rice", "Idli/Dosa", "Snacks"]
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await checkApiAdminOrManager();
    if (!auth.authorized) return NextResponse.json({ error: "Unauthorized" }, { status: auth.status });

    const body = await request.json();
    const { config } = body;

    if (!config) {
      return NextResponse.json({ error: 'config is required' }, { status: 400 });
    }

    const setting = await prisma.settings.upsert({
      where: { key: "SEARCH_FILTERS_CONFIG" },
      update: { value: config },
      create: { key: "SEARCH_FILTERS_CONFIG", value: config },
    });

    return NextResponse.json({ success: true, setting });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
