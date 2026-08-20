import { NextResponse } from 'next/server';
import { prisma } from '@/lib/infrastructure/database/prisma';
import { checkApiAdminOrManager } from "@/lib/auth/rbac";

export async function GET(request: Request) {
  const auth = await checkApiAdminOrManager();
  if (!auth.authorized) return NextResponse.json({ error: "Unauthorized" }, { status: auth.status });

  const { searchParams } = new URL(request.url);
  const locale = searchParams.get('locale') || 'hi';

  try {
    const setting = await prisma.settings.findUnique({
      where: { key: `translations_${locale}` }
    });

    return NextResponse.json({
      locale,
      translations: setting?.value || {}
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
    const { locale, translations } = body;

    if (!locale || !translations) {
      return NextResponse.json({ error: 'locale and translations are required' }, { status: 400 });
    }

    const setting = await prisma.settings.upsert({
      where: { key: `translations_${locale}` },
      update: { value: translations },
      create: { key: `translations_${locale}`, value: translations },
    });

    await prisma.auditLog.create({
      data: {
        userId: auth.user?.id,
        action: "TRANSLATIONS_UPDATED",
        entity: "Settings",
        entityId: setting.id,
        details: { locale },
      }
    });

    return NextResponse.json({ success: true, setting });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
